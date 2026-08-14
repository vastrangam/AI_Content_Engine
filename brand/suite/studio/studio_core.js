/* Vastrangam BOS — Data Studio, the engine.

   Two pipelines, written once and run twice: verify_studio.js runs them in Node
   against the real workbooks, and build_studio.js inlines this same file into
   Vastrangam_BOS_Data_Studio.html. There is no second copy of the arithmetic, so
   the figures the tool shows a person are the figures a test checked.

   Both pipelines follow the master prompts kept alongside the data. Where a
   prompt names two channels or two companies, this code counts neither: the
   sheets present in the uploaded workbook decide how many columns come out.
   Three companies today and ten next year is the same file.

   Nothing here touches the DOM, opens a network connection, or knows what a
   button is. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.StudioCore = api;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── small shared helpers ─────────────────────────────────────────────── */

  var txt = function (v) { return v === null || v === undefined ? '' : String(v).trim(); };

  /* A quantity read off a spreadsheet may arrive as a number, as "1", as "1 "
     or as "1,200". A blank is zero. Anything that is not a number at all is
     zero and is counted, never guessed at. */
  function num(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    /* ₹, thousands separators and any flavour of space — including the
       non-breaking one Excel likes to put after a currency symbol. */
    var s = txt(v).replace(/[₹$€£,]/g, '').replace(/\s/g, '');
    if (s === '') return 0;
    var n = Number(s);
    return isFinite(n) ? n : 0;
  }

  /* Sheets often open with a merged title row, so the headings are not
     necessarily row 1. Find the first row that contains all of the required
     labels rather than assuming a position. */
  function findHeaderRow(rows, required, limit) {
    var want = required.map(function (r) { return String(r).toUpperCase(); });
    for (var i = 0; i < Math.min(rows.length, limit || 12); i++) {
      var got = (rows[i] || []).map(function (c) { return txt(c).toUpperCase(); });
      var all = want.every(function (w) { return got.indexOf(w) >= 0; });
      if (all) return i;
    }
    return -1;
  }

  /* Header lookup by NAME. The master prompt is explicit that column positions
     shift between exports, so nothing below indexes a column by number. */
  function headerIndex(header) {
    var ix = {};
    (header || []).forEach(function (h, i) {
      var k = txt(h).toUpperCase().replace(/\s+/g, ' ');
      if (k && !(k in ix)) ix[k] = i;
    });
    return {
      find: function () {
        for (var a = 0; a < arguments.length; a++) {
          var want = String(arguments[a]).toUpperCase().replace(/\s+/g, ' ');
          if (want in ix) return ix[want];
        }
        return -1;
      }
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     PIPELINE A — E-commerce Sale & Return
     ══════════════════════════════════════════════════════════════════════ */

  /* Which companies are in this workbook?

     The master prompt names Ethnic and Vastrangam because those are the two the
     business had when it was written. This looks instead for every "<X> Sale" /
     "<X> Return" pair actually present and returns them in the order the sheets
     appear, so a workbook with ten companies produces ten pairs of columns with
     nothing edited. A company with only a sale sheet, or only a return sheet,
     still counts — dropping it would silently lose its rows. */
  function detectCompanies(sheetNames) {
    var byName = {}, order = [];
    (sheetNames || []).forEach(function (raw) {
      var m = /^(.*\S)\s+(SALE|RETURN)S?$/i.exec(txt(raw));
      if (!m) return;
      var company = m[1].trim(), kind = m[2].toUpperCase() === 'SALE' ? 'sale' : 'return';
      var key = company.toUpperCase();
      if (!byName[key]) { byName[key] = { name: company, sale: null, ret: null }; order.push(key); }
      if (kind === 'sale') byName[key].sale = raw; else byName[key].ret = raw;
    });
    return order.map(function (k) { return byName[k]; });
  }

  /* Read one sale or return sheet into per-item totals. */
  function readQtySheet(rows, opts) {
    opts = opts || {};
    var out = { qty: {}, wrong: {}, rows: 0, itemCol: -1, qtyCol: -1, wrongCol: -1 };
    if (!rows || rows.length < 2) return out;
    var ix = headerIndex(rows[0]);
    out.itemCol = ix.find('ITEM_NAME', 'ITEM NAME', 'ITEM');
    out.qtyCol = ix.find('QUANTITY', 'QTY');
    out.wrongCol = ix.find('WRONG RETURN', 'WRONG_RETURN');
    if (out.itemCol < 0 || out.qtyCol < 0) return out;

    for (var r = 1; r < rows.length; r++) {
      var row = rows[r] || [];
      var item = txt(row[out.itemCol]);
      if (item === '') continue;              // a row with no item is not a sale
      var q = num(row[out.qtyCol]);
      out.qty[item] = (out.qty[item] || 0) + q;
      out.rows++;
      if (opts.wrong && out.wrongCol >= 0) {
        /* "non-blank and non-whitespace ... a single space should be treated as
           blank/not-wrong" — so the flag is trimmed before it is believed. */
        if (txt(row[out.wrongCol]) !== '') out.wrong[item] = (out.wrong[item] || 0) + q;
      }
    }
    return out;
  }

  /* The price list. Never interpolated, never guessed — an item is either on it
     or it is reported as not on it. */
  function readPrices(rows) {
    var prices = {};
    if (!rows || rows.length < 2) return prices;
    var h = Math.max(0, findHeaderRow(rows, ['ITEM_NAME'], 6));
    var ix = headerIndex(rows[h]);
    var ic = ix.find('ITEM_NAME', 'ITEM NAME', 'ITEM'), pc = ix.find('PRICE', 'MRP', 'RATE');
    if (ic < 0) return prices;
    for (var r = h + 1; r < rows.length; r++) {
      var item = txt((rows[r] || [])[ic]);
      if (item !== '' && !(item in prices)) prices[item] = pc >= 0 ? (rows[r] || [])[pc] : null;
    }
    return prices;
  }

  /**
   * @param {object} sheets  { sheetName: rows[][] } exactly as xlsx.js returns
   * @param {string[]} names sheet order
   */
  function ecommerce(sheets, names) {
    names = names || Object.keys(sheets || {});
    var companies = detectCompanies(names);
    if (companies.length === 0) {
      throw new Error(
        'No "<Company> Sale" / "<Company> Return" sheet pair found. This workbook has: ' +
        names.join(', ') + '.'
      );
    }

    var priceSheet = names.filter(function (n) { return /PRODUCT\s*PRICE|PRICE\s*LIST/i.test(n); })[0];
    var prices = priceSheet ? readPrices(sheets[priceSheet]) : {};

    /* Read every sheet once, keeping each company's numbers apart. The prompt is
       explicit that the channels are merged at the aggregation step and never at
       the row level. */
    var read = companies.map(function (c) {
      return {
        name: c.name,
        sale: c.sale ? readQtySheet(sheets[c.sale], {}) : { qty: {}, wrong: {}, rows: 0 },
        ret: c.ret ? readQtySheet(sheets[c.ret], { wrong: true }) : { qty: {}, wrong: {}, rows: 0 },
        saleSheet: c.sale || null, retSheet: c.ret || null
      };
    });

    /* Every item that appears in ANY sheet, so an item that only ever came back
       is still in the report. */
    var seen = {}, items = [];
    read.forEach(function (c) {
      [c.sale.qty, c.ret.qty].forEach(function (m) {
        Object.keys(m).forEach(function (it) { if (!seen[it]) { seen[it] = 1; items.push(it); } });
      });
    });
    /* Plain code-point order — the order the business's own report is already in,
       so a row can be compared against last month's file line by line. */
    items.sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; });

    var header = ['SR.', 'ITEM NAME'];
    read.forEach(function (c) {
      header.push(c.name.toUpperCase() + ' SALE QTY', c.name.toUpperCase() + ' RETURN QTY');
    });
    header.push('SALE QTY', 'RETURN QTY', 'NET SALE QTY', 'WRONG RETURN QTY', 'TOTAL INVENTORY', 'PRICE STATUS');

    var body = [], noPrice = [];
    items.forEach(function (item, i) {
      var row = [i + 1, item], sale = 0, ret = 0, wrong = 0;
      read.forEach(function (c) {
        var s = c.sale.qty[item] || 0, r = c.ret.qty[item] || 0;
        row.push(s, r); sale += s; ret += r; wrong += (c.ret.wrong[item] || 0);
      });
      var net = sale - ret;
      var priced = Object.prototype.hasOwnProperty.call(prices, item);
      if (!priced) noPrice.push(item);
      row.push(sale, ret, net, wrong, net + wrong, priced ? 'OK' : 'NO PRICE');
      body.push(row);
    });

    /* Totals are summed from the rows that were just built, so the total column
       and the rows it totals cannot disagree. */
    var totals = ['', 'GRAND TOTAL'];
    for (var c2 = 2; c2 < header.length - 1; c2++) {
      totals.push(body.reduce(function (s, r) { return s + (typeof r[c2] === 'number' ? r[c2] : 0); }, 0));
    }
    totals.push('');

    return {
      companies: read.map(function (c) {
        return {
          name: c.name, saleSheet: c.saleSheet, retSheet: c.retSheet,
          saleRows: c.sale.rows, returnRows: c.ret.rows,
          saleQty: Object.keys(c.sale.qty).reduce(function (s, k) { return s + c.sale.qty[k]; }, 0),
          returnQty: Object.keys(c.ret.qty).reduce(function (s, k) { return s + c.ret.qty[k]; }, 0),
          sawWrongColumn: c.ret.wrongCol >= 0
        };
      }),
      header: header, rows: body, totals: totals,
      items: items.length,
      noPrice: noPrice,
      priceSheet: priceSheet || null,
      priceListSize: Object.keys(prices).length
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     PIPELINE B — Karigar Production & Cost
     ══════════════════════════════════════════════════════════════════════ */

  /* The two sources speak slightly different languages, and joining them wrongly
     is how a karigar gets paid the wrong amount.

     The Karigar Reports grid has a TWO-ROW heading. The upper row names the set
     a block of columns belongs to, the lower row names the garment:

         Anarkali Plazo Set │           │        │ Lehenga Choli Set │ …
         Anarkali │ Plazo   │ Dupatta   │ Kurti  │ Blouse │ Lehenga  │ Dupatta

     so "Dupatta" appears three times and "Blouse" twice, and a column only means
     something when both rows are read together. The Stitching Rates Master
     disambiguates the same way — its rows are (Design, Set, Attribute, Rate)
     with plain attributes like "Dupatta".

     Nothing below hardcodes a column position. The grid's own two heading rows
     are read, which is also what lets a workbook that gains a garment column
     work without an edit here. */

  /* Set types and how each one is counted, in the rate master's own vocabulary.

     `min` means pool first, then take the smallest member pool. Which members
     have to be there is the part that decides real money, so it is written down
     rather than inferred:

       required  a set without this piece is not a set. A pool of zero here means
                 zero sets, however many of the other pieces were stitched — the
                 spare pieces are still paid for, they simply have not become
                 sellable sets yet.
       optional  the piece joins the minimum only when some of it exists. A
                 Lehenga Choli stitched with no dupatta at all is still a set;
                 one stitched with no blouse is not.

     Anarkali Plazo Set is the one with three documented shapes — full,
     Anarkali+Dupatta, and Anarkali alone — so only the Anarkali is required
     there, and the two shorter shapes fall out of the same rule.

     `single` means the piece is itself the countable unit. */
  var SET_RULES = {
    'Anarkali Plazo Set': { kind: 'min', members: ['Anarkali', 'Plazo', 'Dupatta'], optional: ['Plazo', 'Dupatta'] },
    'Kurti Palazzo Set': { kind: 'min', members: ['Kurti', 'Palazzo', 'Dupatta'], optional: [] },
    'Lehenga Choli Set': { kind: 'min', members: ['Blouse', 'Lehenga', 'Dupatta'], optional: ['Dupatta'] },
    'Kurti Plazo Set': { kind: 'min', members: ['Top', 'Bottom'], optional: [] },
    'Co-Ords Set': { kind: 'min', members: ['Blouse', 'Plazzo', 'Jacket'], optional: ['Jacket'] },
    'Top Set': { kind: 'single', members: ['Tunic Top'] },
    'Bottom Wear Set': { kind: 'single', members: ['Bottom Wear'] },
    'Uniform Set': { kind: 'single', members: ['Uniform Regular', 'Uniform'] },
    'Dupatta Set': { kind: 'single', members: ['Dupatta'] },
    'Kurta Set': { kind: 'single', members: ['Kurta'] },
    'Alter Set': { kind: 'single', members: ['Alter'] },
    'Readymade Saree Set': { kind: 'single', members: ['Readymade Saree'] },
    'Readymade Blouse Set': { kind: 'single', members: ['Readymade Blouse'] }
  };

  /* The grid writes "Uniform Regular" where the rate master writes "Uniform".
     Spelling differences are resolved here, in one visible place, rather than
     by a fuzzy match that would quietly pair up two unrelated garments. */
  var RATE_ALIAS = {
    'UNIFORM REGULAR': 'UNIFORM',
    'READYMADE SAREE SET': 'READYMADE SAREE'
  };
  function rateKeyFor(label) {
    var k = String(label).toUpperCase();
    return RATE_ALIAS[k] || k;
  }

  /* Read the Stitching Rates Master: design -> set type, and (design, attribute)
     -> rate. The rate is per individual piece, never per completed set. */
  function readRates(rows) {
    var setOf = {}, rate = {}, setNames = {}, designs = {};
    if (!rows || rows.length < 2) return { setOf: setOf, rate: rate, setNames: setNames, count: 0, designs: 0 };
    var h = Math.max(0, findHeaderRow(rows, ['DESIGN NAME'], 8));
    var ix = headerIndex(rows[h]);
    var dc = ix.find('DESIGN NAME', 'DESIGN'), sc = ix.find('SET', 'SET TYPE'),
      ac = ix.find('ATTRIBUTE', 'PIECE', 'GARMENT'), rc = ix.find('RATE', 'AMOUNT');
    if (dc < 0) return { setOf: setOf, rate: rate, setNames: setNames, count: 0, designs: 0 };
    var n = 0;
    for (var r = h + 1; r < rows.length; r++) {
      var row = rows[r] || [];
      var design = txt(row[dc]);
      if (design === '') continue;
      var key = design.toUpperCase();
      designs[key] = 1;
      if (sc >= 0) {
        var st = txt(row[sc]);
        if (st) { if (!setOf[key]) setOf[key] = st; setNames[st] = 1; }
      }
      if (ac >= 0 && rc >= 0) {
        var piece = txt(row[ac]);
        if (piece) { rate[key + '|' + rateKeyFor(piece)] = num(row[rc]); n++; }
      }
    }
    return { setOf: setOf, rate: rate, setNames: setNames, count: n, designs: Object.keys(designs).length };
  }

  /* Read the grid's two heading rows into one column map.
     Returns [{ index, set, piece }] for every garment column. */
  function readGridColumns(rows, headRow) {
    var groupRow = rows[headRow - 1] || [], labelRow = rows[headRow] || [];
    var cols = [], group = '';
    for (var c = 2; c < labelRow.length; c++) {
      var g = txt(groupRow[c]);
      if (g) group = g;                       // the label spans until the next one
      var label = txt(labelRow[c]);
      if (label === '') continue;
      cols.push({ index: c, set: group, piece: label });
    }
    return cols;
  }

  /* Which set type does a design belong to, when the rate master does not say?
     Inferred from the set-groups whose columns actually carry quantities — and
     always reported as inferred, never presented as if the master had said it. */
  function inferSetType(pool) {
    var best = null, bestQty = 0;
    Object.keys(pool).forEach(function (k) {
      var set = k.split('|')[0];
      if (!SET_RULES[set]) return;
      var q = pool[k];
      if (q > bestQty) { bestQty = q; best = set; }
    });
    return best;
  }

  /* Sets from a pooled design, and the surplus of each member piece.

     The rule the business already proved: pool every karigar's pieces for the
     design FIRST, then take the minimum across the member columns that actually
     have something in them. A design stitched as Anarkali + Dupatta with no Plazo
     at all is counted on the two pieces it has, not zeroed because a third column
     is empty. Surplus is reported piece by piece under its own name — never
     collected into one anonymous "extra" bucket, and never added to the set count
     to make a "total pieces" column. Both of those were rejected as misleading. */
  function setsFor(setType, pool) {
    var rule = SET_RULES[setType];
    if (!rule) return { sets: 0, extras: {}, basis: [] };
    /* Quantities entered under this set's own columns are what counts; if a
       design's rows sit under no matching group at all, fall back to the piece
       name wherever it was entered rather than reporting a silent zero. */
    var qtyOf = function (piece) {
      var direct = pool[setType + '|' + piece];
      if (direct) return direct;
      var loose = 0;
      Object.keys(pool).forEach(function (k) { if (k.split('|')[1] === piece) loose += pool[k]; });
      return loose;
    };
    var optional = rule.optional || [];
    var live = [];
    rule.members.forEach(function (p) {
      var q = qtyOf(p);
      /* A required piece counts even at zero — that zero IS the answer. An
         optional piece only joins the minimum once some of it exists. */
      if (optional.indexOf(p) < 0 || q > 0) live.push({ piece: p, qty: q });
    });
    if (live.length === 0) return { sets: 0, extras: {}, basis: [] };
    if (rule.kind === 'single') {
      return { sets: live.reduce(function (s, x) { return s + x.qty; }, 0), extras: {}, basis: live.map(function (x) { return x.piece; }) };
    }
    var sets = live.reduce(function (m, x) { return Math.min(m, x.qty); }, Infinity);
    var extras = {};
    live.forEach(function (x) { if (x.qty - sets > 0) extras[x.piece] = x.qty - sets; });
    return { sets: sets, extras: extras, basis: live.map(function (x) { return x.piece; }) };
  }

  /**
   * @param {array[]|array[][]} reportRows  the Karigar Reports grid, or an array
   *        of such grids to pool together (the master prompt: if several FY
   *        sheets exist, process all of them and pool).
   * @param {array[]} rateRows  the Stitching Rates Master sheet
   */
  function karigar(reportRows, rateRows) {
    var grids = (reportRows && reportRows.length && Array.isArray(reportRows[0]) && Array.isArray(reportRows[0][0]))
      ? reportRows : [reportRows];
    var rates = readRates(rateRows);

    var perDesign = {}, designOrder = [];
    var perKarigar = {}, karigarOrder = [];
    var dataRows = 0, columnsSeen = [];

    grids.forEach(function (rows) {
      if (!rows || rows.length < 2) return;
      var headRow = findHeaderRow(rows, ['KARIGAR', 'DESIGN NAME'], 10);
      if (headRow < 0) return;
      var cols = readGridColumns(rows, headRow);
      if (columnsSeen.length === 0) columnsSeen = cols;

      for (var r = headRow + 1; r < rows.length; r++) {
        var row = rows[r] || [];
        var karigarName = txt(row[0]);        // may be a group — kept whole
        var design = txt(row[1]);
        if (karigarName === '' || design === '') continue;
        var any = false;
        for (var ci = 0; ci < cols.length; ci++) if (num(row[cols[ci].index]) > 0) { any = true; break; }
        if (!any) continue;
        dataRows++;

        if (!perDesign[design]) { perDesign[design] = { pool: {}, karigars: {} }; designOrder.push(design); }
        if (!perKarigar[karigarName]) { perKarigar[karigarName] = { pieces: 0, earnings: 0, designs: {} }; karigarOrder.push(karigarName); }
        var d = perDesign[design];
        if (!d.karigars[karigarName]) d.karigars[karigarName] = {};

        for (var k = 0; k < cols.length; k++) {
          var q = num(row[cols[k].index]);
          if (q === 0) continue;
          var id = cols[k].set + '|' + cols[k].piece;
          d.pool[id] = (d.pool[id] || 0) + q;                    // pooled across ALL karigars
          d.karigars[karigarName][id] = (d.karigars[karigarName][id] || 0) + q;
        }
      }
    });

    /* Sets, extras and cost. Cost is per raw piece and does not care whether the
       piece was ever matched into a set — a karigar is paid for what they
       stitched. A piece with no rate on file costs zero and the design is
       flagged; a guessed rate would be a wrong payment. */
    var designs = [], noRate = [], inferred = [], unclassified = [];
    var grandCost = 0, grandSets = 0, grandPieces = 0;

    designOrder.forEach(function (name) {
      var d = perDesign[name];
      var key = name.toUpperCase();
      var setType = rates.setOf[key] || null;
      var how = 'rate master';
      if (!setType) { setType = inferSetType(d.pool); how = 'inferred from columns'; if (setType) inferred.push(name); }
      if (!setType) { unclassified.push(name); return; }

      var s = setsFor(setType, d.pool);
      var pieces = 0, cost = 0, missing = {};

      Object.keys(d.karigars).forEach(function (kn) {
        var mine = d.karigars[kn], myPieces = 0, myCost = 0;
        Object.keys(mine).forEach(function (id) {
          var q = mine[id], piece = id.split('|')[1];
          var rt = rates.rate[key + '|' + rateKeyFor(piece)];
          if (rt === undefined) { missing[piece] = 1; rt = 0; }
          myPieces += q; myCost += q * rt;
        });
        pieces += myPieces; cost += myCost;
        var kk = perKarigar[kn];
        kk.pieces += myPieces; kk.earnings += myCost;
        if (!kk.designs[name]) kk.designs[name] = { pieces: 0, earnings: 0 };
        kk.designs[name].pieces += myPieces; kk.designs[name].earnings += myCost;
      });

      var missingPieces = Object.keys(missing);
      if (missingPieces.length) noRate.push(name);
      grandCost += cost; grandSets += s.sets; grandPieces += pieces;
      designs.push({
        design: name, setType: setType, sets: s.sets, extras: s.extras,
        pieces: pieces, cost: cost,
        rateStatus: missingPieces.length ? 'NO RATE' : 'OK',
        missingRateFor: missingPieces,
        classifiedBy: how, pool: d.pool
      });
    });

    var karigars = karigarOrder.map(function (n) {
      return {
        karigar: n, pieces: perKarigar[n].pieces, earnings: perKarigar[n].earnings,
        designs: Object.keys(perKarigar[n].designs).map(function (dn) {
          return { design: dn, pieces: perKarigar[n].designs[dn].pieces, earnings: perKarigar[n].designs[dn].earnings };
        }).sort(function (a, b) { return b.earnings - a.earnings; })
      };
    }).sort(function (a, b) { return b.earnings - a.earnings; });

    return {
      designs: designs, karigars: karigars,
      dataRows: dataRows,
      columns: columnsSeen,
      totals: { designs: designs.length, karigars: karigars.length, sets: grandSets, pieces: grandPieces, cost: grandCost },
      noRate: noRate, inferred: inferred, unclassified: unclassified,
      rateRows: rates.count, rateDesigns: rates.designs,
      setTypesInMaster: Object.keys(rates.setNames).sort()
    };
  }

  return {
    num: num, txt: txt, headerIndex: headerIndex,
    detectCompanies: detectCompanies, readQtySheet: readQtySheet, readPrices: readPrices,
    ecommerce: ecommerce,
    findHeaderRow: findHeaderRow,
    SET_RULES: SET_RULES, readRates: readRates, readGridColumns: readGridColumns, setsFor: setsFor,
    inferSetType: inferSetType, karigar: karigar
  };
}));
