/* The three deliverable workbooks, laid out exactly as the master prompts spell
   them: the E-commerce report, the Karigar production view, and the four-sheet
   Karigar cost report.

   Every total is a real =SUM() over the rows above it rather than a number
   written into the cell. That is not decoration — a delivered file whose total
   is a typed constant stops agreeing with its own rows the first time somebody
   edits a line, and the whole point of these reports is that the figure at the
   bottom is answerable to the figures above it. */
(function (root, factory) {
  var api = factory(
    typeof require === 'function' && typeof module !== 'undefined' ? require('./studio_xlsx.js') : root.StudioXlsx
  );
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.StudioReports = api;
}(typeof self !== 'undefined' ? self : this, function (SX) {
  'use strict';

  var P = SX.PALETTE, colName = SX.colName;

  /* One style vocabulary, defined once per workbook. */
  function palette(wb) {
    var s = wb.styles;
    s.define('title', { size: 13, bold: true, color: 'FFFFFF', fill: P.title, align: 'center' });
    s.define('head', { bold: true, color: 'FFFFFF', fill: P.header, align: 'center', wrap: true, border: true });
    s.define('section', { bold: true, color: 'FFFFFF', fill: P.section, align: 'left', indent: 1 });
    s.define('subtotal', { bold: true, fill: P.subtotal, align: 'center', border: true });
    s.define('subtotalL', { bold: true, fill: P.subtotal, align: 'left', border: true });
    s.define('subtotal₹', { bold: true, fill: P.subtotal, align: 'center', border: true, numFmt: '₹ #,##0.00' });
    s.define('total', { bold: true, color: 'FFFFFF', fill: P.total, align: 'center', border: true });
    s.define('totalL', { bold: true, color: 'FFFFFF', fill: P.total, align: 'left', border: true });
    s.define('total₹', { bold: true, color: 'FFFFFF', fill: P.total, align: 'center', border: true, numFmt: '₹ #,##0.00' });
    s.define('badCell', { bold: true, color: P.badInk, fill: P.bad, align: 'center', border: true });
    s.define('note', { italic: true, color: P.badInk, align: 'left' });
    s.define('label', { bold: true, align: 'left', border: true });
    return s;
  }
  /* Body styles are per-fill, so a set type's pastel and the alternating stripe
     both come from the same helper rather than from two parallel lists. */
  function bodyStyles(s, fill, key) {
    s.define(key + 'L', { fill: fill, align: 'left', border: true });
    s.define(key + 'C', { fill: fill, align: 'center', border: true });
    s.define(key + '₹', { fill: fill, align: 'center', border: true, numFmt: '₹ #,##0.00' });
  }
  var sumRange = function (col, from, to) { return 'SUM(' + col + from + ':' + col + to + ')'; };

  /* ══════════════════════════════════════════════════════════════════════
     A · Ecommerce_Complete_Sale_Updated.xlsx
     ══════════════════════════════════════════════════════════════════════ */
  function ecommerceWorkbook(result) {
    var wb = new SX.Workbook(), s = palette(wb);
    bodyStyles(s, 'FFFFFF', 'odd'); bodyStyles(s, P.alt, 'even');
    s.define('badL', { fill: P.bad, align: 'left', border: true });
    s.define('badC', { fill: P.bad, align: 'center', border: true });

    var sh = wb.sheet('Complete Sale & Return');
    var n = result.header.length;
    var names = result.companies.map(function (c) { return c.name; }).join(' + ');

    sh.add([{ v: 'E-commerce Complete Sale & Return Report (' + names + ')', s: s.id('title') }]);
    sh.merge(1, 1, 1, n); sh.height(1, 28);
    sh.add(result.header.map(function (h) { return { v: h, s: s.id('head') }; }));

    var first = 3;
    result.rows.forEach(function (row, i) {
      var bad = row[n - 1] === 'NO PRICE';
      /* the red tint for a missing price overrides the stripe, as specified */
      var band = bad ? 'bad' : (i % 2 ? 'even' : 'odd');
      sh.add(row.map(function (v, c) {
        if (c === 1) return { v: v, s: s.id(band + 'L') };
        if (c === n - 1) return { v: v, s: s.id(bad ? 'badCell' : band + 'C') };
        return { v: v, s: s.id(band + 'C') };
      }));
    });
    var last = first + result.rows.length - 1;

    var totals = [{ v: '', s: s.id('total') }, { v: 'GRAND TOTAL', s: s.id('totalL') }];
    for (var c = 2; c < n - 1; c++) {
      totals.push({ f: sumRange(colName(c + 1), first, last), s: s.id('total') });
    }
    totals.push({ v: '', s: s.id('total') });
    sh.add(totals);

    var widths = [6, 26];
    for (var w = 2; w < n - 1; w++) widths.push(16);
    widths.push(13);
    sh.widths(widths);
    sh.freezeAt(first);

    /* The prompt asks for the no-price list to be reported, not merely counted. */
    if (result.noPrice.length) {
      var np = wb.sheet('Items With No Price');
      np.add([{ v: 'Items with no price on file — ' + result.noPrice.length + ' of ' + result.items, s: s.id('title') }]);
      np.merge(1, 1, 1, 2); np.height(1, 28);
      np.add([{ v: 'SR.', s: s.id('head') }, { v: 'ITEM NAME', s: s.id('head') }]);
      result.noPrice.forEach(function (item, i) {
        np.add([{ v: i + 1, s: s.id('badC') }, { v: item, s: s.id('badL') }]);
      });
      np.widths([6, 34]); np.freezeAt(3);
    }
    return wb;
  }

  /* ══════════════════════════════════════════════════════════════════════
     B · Karigar_Premium_Production.xlsx — quantities only, no money
     ══════════════════════════════════════════════════════════════════════ */
  var EXTRA_COLS = ['Dupatta', 'Anarkali', 'Plazo', 'Kurti', 'Palazzo', 'Blouse', 'Lehenga', 'Top', 'Bottom'];

  /* Group designs into their set-type sections, in the order the rate master
     lists the set types so two runs never shuffle the sections. */
  function bySetType(designs) {
    var groups = {}, order = [];
    designs.forEach(function (d) {
      if (!groups[d.setType]) { groups[d.setType] = []; order.push(d.setType); }
      groups[d.setType].push(d);
    });
    order.sort();
    order.forEach(function (k) {
      groups[k].sort(function (a, b) { return a.design < b.design ? -1 : a.design > b.design ? 1 : 0; });
    });
    return { order: order, groups: groups };
  }

  function productionWorkbook(result) {
    var wb = new SX.Workbook(), s = palette(wb);
    Object.keys(P.sets).forEach(function (k) { bodyStyles(s, P.sets[k], 'set' + k.replace(/\W/g, '')); });
    bodyStyles(s, 'FFFFFF', 'plain');

    var sh = wb.sheet('Combined Production');
    var header = ['#', 'Design Name', 'Set Type', 'Total Sets'].concat(EXTRA_COLS.map(function (p) { return 'Extra ' + p; }));
    var n = header.length;
    sh.add([{ v: 'Karigar Combined Production — Sets and Named Extras', s: s.id('title') }]);
    sh.merge(1, 1, 1, n); sh.height(1, 28);
    sh.add(header.map(function (h) { return { v: h, s: s.id('head') }; }));

    var grouped = bySetType(result.designs), subtotalRows = [], rowNo = 0, r = 2;
    grouped.order.forEach(function (setType) {
      var key = 'set' + setType.replace(/\W/g, '');
      if (!s.named[key + 'L']) bodyStyles(s, 'FFFFFF', key);
      r = sh.add([{ v: '▸ ' + setType, s: s.id('section') }]);
      sh.merge(r, 1, r, n);
      var from = r + 1;
      grouped.groups[setType].forEach(function (d) {
        rowNo++;
        var cells = [{ v: rowNo, s: s.id(key + 'C') }, { v: d.design, s: s.id(key + 'L') },
          { v: d.setType, s: s.id(key + 'L') }, { v: d.sets, s: s.id(key + 'C') }];
        EXTRA_COLS.forEach(function (p) {
          var q = d.extras[p] || 0;
          /* blank, not "0" and not a dash — a zero surplus is nothing to read */
          cells.push({ v: q > 0 ? q : '', s: s.id(key + 'C') });
        });
        r = sh.add(cells);
      });
      var sub = [{ v: '', s: s.id('subtotal') }, { v: setType + ' — subtotal', s: s.id('subtotalL') },
        { v: '', s: s.id('subtotal') }];
      for (var c = 4; c <= n; c++) sub.push({ f: sumRange(colName(c), from, r), s: s.id('subtotal') });
      r = sh.add(sub);
      subtotalRows.push(r);
    });

    var tot = [{ v: '', s: s.id('total') }, { v: 'GRAND TOTAL', s: s.id('totalL') }, { v: '', s: s.id('total') }];
    for (var c2 = 4; c2 <= n; c2++) {
      /* the subtotals only, so a section is never counted twice */
      tot.push({ f: subtotalRows.map(function (x) { return colName(c2) + x; }).join('+'), s: s.id('total') });
    }
    sh.add(tot);
    sh.widths([6, 26, 22, 11].concat(EXTRA_COLS.map(function () { return 13; })));
    sh.freezeAt(3);
    return wb;
  }

  /* ══════════════════════════════════════════════════════════════════════
     C · Karigar_Production_Cost_Report.xlsx — four sheets
     ══════════════════════════════════════════════════════════════════════ */
  function costWorkbook(result) {
    var wb = new SX.Workbook(), s = palette(wb);
    Object.keys(P.sets).forEach(function (k) { bodyStyles(s, P.sets[k], 'set' + k.replace(/\W/g, '')); });
    bodyStyles(s, 'FFFFFF', 'plain'); bodyStyles(s, P.alt, 'alt'); bodyStyles(s, P.bad, 'bad');
    s.define('value', { align: 'left', border: true });
    s.define('value₹', { bold: true, color: 'FFFFFF', fill: P.total, align: 'left', border: true, numFmt: '₹ #,##0.00' });

    /* ── Sheet 1 · Executive Summary ── */
    var ex = wb.sheet('Executive Summary');
    ex.add([{ v: 'Karigar Production & Stitching Cost — Executive Summary', s: s.id('title') }]);
    ex.merge(1, 1, 1, 2); ex.height(1, 28);
    ex.add([]);
    var line = function (label, value, style) {
      ex.add([{ v: label, s: s.id('label') }, { v: value, s: s.id(style || 'value') }]);
    };
    line('Total Designs', result.totals.designs);
    line('Total Karigars (incl. group units)', result.totals.karigars);
    line('Total Completed Sets', result.totals.sets);
    line('Total Pieces Stitched (all types)', result.totals.pieces);
    line('TOTAL STITCHING COST', result.totals.cost, 'value₹');
    ex.add([]);
    if (result.noRate.length) {
      var rr = ex.add([{ v: 'Designs with no rate on file: ' + result.noRate.length +
        ' (' + result.noRate.join(', ') + ') — costed at ₹0, never guessed.', s: s.id('note') }]);
      ex.merge(rr, 1, rr, 2);
    }
    if (result.inferred.length) {
      var ri = ex.add([{ v: 'Set type classified by column inference, not the rate master: ' +
        result.inferred.join(', '), s: s.id('note') }]);
      ex.merge(ri, 1, ri, 2);
    }
    if (result.unclassified.length) {
      var ru = ex.add([{ v: 'Unclassified — needs manual review: ' + result.unclassified.join(', '), s: s.id('note') }]);
      ex.merge(ru, 1, ru, 2);
    }
    ex.widths([38, 30]);

    /* ── Sheet 2 · Item-wise Production & Cost ── */
    var it = wb.sheet('Item-wise Production & Cost');
    var ih = ['#', 'Design Name', 'Set Type', 'Total Sets', 'Total Pieces Stitched', 'Stitching Cost (₹)', 'Rate Status'];
    it.add([{ v: 'Item-wise Production & Stitching Cost', s: s.id('title') }]);
    it.merge(1, 1, 1, ih.length); it.height(1, 28);
    it.add(ih.map(function (h) { return { v: h, s: s.id('head') }; }));

    var g = bySetType(result.designs), subs = [], no = 0, row = 2;
    g.order.forEach(function (setType) {
      var key = 'set' + setType.replace(/\W/g, '');
      if (!s.named[key + 'L']) bodyStyles(s, 'FFFFFF', key);
      row = it.add([{ v: '▸ ' + setType, s: s.id('section') }]);
      it.merge(row, 1, row, ih.length);
      var from = row + 1;
      g.groups[setType].forEach(function (d) {
        no++;
        var bad = d.rateStatus === 'NO RATE', k = bad ? 'bad' : key;
        row = it.add([
          { v: no, s: s.id(k + 'C') }, { v: d.design, s: s.id(k + 'L') }, { v: d.setType, s: s.id(k + 'L') },
          { v: d.sets, s: s.id(k + 'C') }, { v: d.pieces, s: s.id(k + 'C') },
          { v: d.cost, s: s.id(k + '₹') },
          { v: d.rateStatus, s: s.id(bad ? 'badCell' : k + 'C') }
        ]);
      });
      row = it.add([{ v: '', s: s.id('subtotal') }, { v: setType + ' — subtotal', s: s.id('subtotalL') },
        { v: '', s: s.id('subtotal') },
        { f: sumRange('D', from, row), s: s.id('subtotal') },
        { f: sumRange('E', from, row), s: s.id('subtotal') },
        { f: sumRange('F', from, row), s: s.id('subtotal₹') },
        { v: '', s: s.id('subtotal') }]);
      subs.push(row);
    });
    it.add([{ v: '', s: s.id('total') }, { v: 'GRAND TOTAL', s: s.id('totalL') }, { v: '', s: s.id('total') },
      { f: subs.map(function (x) { return 'D' + x; }).join('+'), s: s.id('total') },
      { f: subs.map(function (x) { return 'E' + x; }).join('+'), s: s.id('total') },
      { f: subs.map(function (x) { return 'F' + x; }).join('+'), s: s.id('total₹') },
      { v: '', s: s.id('total') }]);
    it.widths([6, 26, 22, 11, 20, 18, 12]);
    it.freezeAt(3);

    /* ── Sheet 3 · Karigar Earnings ── */
    var ke = wb.sheet('Karigar Earnings');
    var kh = ['#', 'Karigar', 'Designs Worked On', 'Total Pieces Stitched', 'Total Earnings (₹)'];
    ke.add([{ v: 'Karigar Earnings — ranked by total earnings', s: s.id('title') }]);
    ke.merge(1, 1, 1, kh.length); ke.height(1, 28);
    ke.add(kh.map(function (h) { return { v: h, s: s.id('head') }; }));
    result.karigars.forEach(function (k, i) {
      var band = i % 2 ? 'alt' : 'plain';
      ke.add([{ v: i + 1, s: s.id(band + 'C') }, { v: k.karigar, s: s.id(band + 'L') },
        { v: k.designs.length, s: s.id(band + 'C') }, { v: k.pieces, s: s.id(band + 'C') },
        { v: k.earnings, s: s.id(band + '₹') }]);
    });
    var kLast = 2 + result.karigars.length;
    ke.add([{ v: '', s: s.id('total') }, { v: 'GRAND TOTAL', s: s.id('totalL') },
      { v: '', s: s.id('total') },
      { f: sumRange('D', 3, kLast), s: s.id('total') },
      { f: sumRange('E', 3, kLast), s: s.id('total₹') }]);
    ke.widths([6, 28, 20, 22, 20]);
    ke.freezeAt(3);

    /* ── Sheet 4 · Karigar × Design Detail ── */
    var kd = wb.sheet('Karigar x Design Detail');
    var dh = ['#', 'Design Name', 'Pieces Stitched', 'Earnings (₹)'];
    kd.add([{ v: 'Karigar × Design Detail', s: s.id('title') }]);
    kd.merge(1, 1, 1, dh.length); kd.height(1, 28);
    kd.add(dh.map(function (h) { return { v: h, s: s.id('head') }; }));
    var dr = 2;
    result.karigars.forEach(function (k) {
      dr = kd.add([{ v: '▸ ' + k.karigar, s: s.id('section') }]);
      kd.merge(dr, 1, dr, dh.length);
      var from = dr + 1;
      k.designs.forEach(function (d, i) {
        var band = i % 2 ? 'alt' : 'plain';
        dr = kd.add([{ v: i + 1, s: s.id(band + 'C') }, { v: d.design, s: s.id(band + 'L') },
          { v: d.pieces, s: s.id(band + 'C') }, { v: d.earnings, s: s.id(band + '₹') }]);
      });
      dr = kd.add([{ v: '', s: s.id('subtotal') }, { v: k.karigar + ' — subtotal', s: s.id('subtotalL') },
        { f: sumRange('C', from, dr), s: s.id('subtotal') },
        { f: sumRange('D', from, dr), s: s.id('subtotal₹') }]);
    });
    kd.widths([6, 30, 18, 18]);
    kd.freezeAt(3);

    return wb;
  }

  return {
    ecommerceWorkbook: ecommerceWorkbook,
    productionWorkbook: productionWorkbook,
    costWorkbook: costWorkbook,
    EXTRA_COLS: EXTRA_COLS
  };
}));
