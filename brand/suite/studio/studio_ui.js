/* Vastrangam BOS — Data Studio, the part a person touches.

   Everything else in this folder is arithmetic. This file is the screen: pick a
   report, drop the workbooks on it, read what it found, download the result.

   It holds no business rules of its own. Every figure on screen comes from
   studio_core.js, which is the same file verify_studio.js runs against the real
   workbooks — so there is no path by which the screen can show a number the
   tests never saw. */
(function () {
  'use strict';

  var X = window.MedhavaSheet, Core = window.StudioCore, Reports = window.StudioReports;
  var $ = function (sel) { return document.querySelector(sel); };
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  var fmt = function (n) { return (n || 0).toLocaleString('en-IN'); };
  var rupees = function (n) {
    return '₹' + (Math.round((n || 0) * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  /* Files the person has dropped, by role. A workbook is filed by what is inside
     it, not by what it is called — the same report comes out of "Karigar Reports
     FY2025-26.xlsx" and "karigar (final) (2).xlsx". */
  var loaded = [];

  function classify(wb) {
    var names = wb.names;
    if (Core.detectCompanies(names).length) return 'ecommerce';
    var rateSheet = names.filter(function (n) {
      var rows = wb.sheets[n];
      return Core.findHeaderRow(rows, ['DESIGN NAME', 'SET', 'ATTRIBUTE', 'RATE'], 8) >= 0;
    })[0];
    var gridSheet = names.filter(function (n) {
      return Core.findHeaderRow(wb.sheets[n], ['KARIGAR', 'DESIGN NAME'], 10) >= 0;
    })[0];
    if (gridSheet) return 'karigar';
    if (rateSheet) return 'rates';
    return 'unknown';
  }

  function sheetWith(wb, required, limit) {
    for (var i = 0; i < wb.names.length; i++) {
      if (Core.findHeaderRow(wb.sheets[wb.names[i]], required, limit || 10) >= 0) return wb.names[i];
    }
    return null;
  }

  /* ── the screen ───────────────────────────────────────────────────────── */

  function status(kind, msg) {
    var box = $('#status');
    box.className = 'status ' + kind;
    box.textContent = msg;
    box.hidden = false;
  }

  function renderFiles() {
    var list = $('#files');
    list.innerHTML = '';
    if (!loaded.length) { $('#filesWrap').hidden = true; return; }
    $('#filesWrap').hidden = false;
    loaded.forEach(function (f, i) {
      var row = el('li', 'file');
      row.appendChild(el('span', 'tag tag-' + f.role, ({
        ecommerce: 'sale & return', karigar: 'karigar grid', rates: 'rate master', unknown: 'not recognised'
      })[f.role]));
      row.appendChild(el('span', 'fname', f.name));
      row.appendChild(el('span', 'fmeta', f.wb.names.length + ' sheets'));
      var x = el('button', 'drop', '×');
      x.title = 'remove';
      x.onclick = function () { loaded.splice(i, 1); renderFiles(); };
      row.appendChild(x);
      list.appendChild(row);
    });
    $('#run').disabled = !loaded.some(function (f) { return f.role === 'ecommerce' || f.role === 'karigar'; });
  }

  function takeFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;
    status('busy', 'Reading ' + files.length + ' file' + (files.length > 1 ? 's' : '') + '…');
    var done = 0, problems = [];
    files.forEach(function (file) {
      var rd = new FileReader();
      rd.onerror = function () { problems.push(file.name + ': could not be read from disk'); finish(); };
      rd.onload = function () {
        try {
          var wb = X.readXlsx(new Uint8Array(rd.result));
          loaded.push({ name: file.name, wb: wb, role: classify(wb) });
        } catch (e) {
          problems.push(file.name + ': ' + (e.message || 'not a workbook this can read'));
        }
        finish();
      };
      rd.readAsArrayBuffer(file);
    });
    function finish() {
      done++;
      if (done < files.length) return;
      renderFiles();
      if (problems.length) status('warn', problems.join(' · '));
      else {
        var roles = loaded.map(function (f) { return f.role; });
        if (roles.indexOf('karigar') >= 0 && roles.indexOf('rates') < 0) {
          status('warn', 'Karigar grid loaded. Add the Stitching Rates Master too, or every rate will be ₹0 and every design flagged.');
        } else {
          status('ok', 'Ready. ' + loaded.length + ' workbook' + (loaded.length > 1 ? 's' : '') + ' loaded.');
        }
      }
    }
  }

  /* ── running ──────────────────────────────────────────────────────────── */

  var results = {};

  function run() {
    results = {};
    $('#out').innerHTML = '';
    var eco = loaded.filter(function (f) { return f.role === 'ecommerce'; });
    var grids = loaded.filter(function (f) { return f.role === 'karigar'; });
    var rates = loaded.filter(function (f) { return f.role === 'rates'; });

    try {
      if (eco.length) {
        /* Several sale/return workbooks merge into one report by handing every
           sheet to the same pipeline — which is also how a fourth company or an
           eleventh channel arrives: as more sheets, not as more code. */
        var sheets = {}, names = [];
        eco.forEach(function (f) {
          f.wb.names.forEach(function (n) {
            var key = names.indexOf(n) < 0 ? n : n + ' (' + f.name + ')';
            sheets[key] = f.wb.sheets[n]; names.push(key);
          });
        });
        results.eco = Core.ecommerce(sheets, names);
        renderEcommerce(results.eco);
      }
      if (grids.length) {
        var rateRows = null;
        var rateSource = rates[0] || grids.filter(function (f) {
          return sheetWith(f.wb, ['DESIGN NAME', 'SET', 'ATTRIBUTE', 'RATE'], 8);
        })[0];
        if (rateSource) {
          var rn = sheetWith(rateSource.wb, ['DESIGN NAME', 'SET', 'ATTRIBUTE', 'RATE'], 8);
          if (rn) rateRows = rateSource.wb.sheets[rn];
        }
        var allGrids = grids.map(function (f) {
          var gn = sheetWith(f.wb, ['KARIGAR', 'DESIGN NAME'], 10);
          return gn ? f.wb.sheets[gn] : null;
        }).filter(Boolean);
        results.kar = Core.karigar(allGrids, rateRows || []);
        renderKarigar(results.kar, !!rateRows);
      }
      status('ok', 'Done. Nothing left this machine.');
    } catch (e) {
      status('bad', e.message || String(e));
    }
  }

  /* ── output ───────────────────────────────────────────────────────────── */

  function card(title, sub) {
    var c = el('section', 'card');
    var h = el('header', 'cardhead');
    h.appendChild(el('h2', null, title));
    if (sub) h.appendChild(el('p', 'sub', sub));
    c.appendChild(h);
    return c;
  }
  function stats(pairs) {
    var g = el('div', 'stats');
    pairs.forEach(function (p) {
      var s = el('div', 'stat' + (p[2] ? ' stat-' + p[2] : ''));
      s.appendChild(el('b', null, p[1]));
      s.appendChild(el('span', null, p[0]));
      g.appendChild(s);
    });
    return g;
  }
  function table(header, rows, opts) {
    opts = opts || {};
    var wrap = el('div', 'tablewrap');
    var t = el('table');
    var thead = el('thead'), tr = el('tr');
    header.forEach(function (h) { tr.appendChild(el('th', null, h)); });
    thead.appendChild(tr); t.appendChild(thead);
    var tb = el('tbody');
    rows.slice(0, opts.limit || 60).forEach(function (row) {
      var r = el('tr', opts.rowClass ? opts.rowClass(row) : null);
      row.forEach(function (v, i) {
        var td = el('td', typeof v === 'number' ? 'n' : null,
          typeof v === 'number' && opts.money && opts.money.indexOf(i) >= 0 ? rupees(v)
            : typeof v === 'number' ? fmt(v) : String(v === null || v === undefined ? '' : v));
        r.appendChild(td);
      });
      tb.appendChild(r);
    });
    t.appendChild(tb);
    /* The totals row belongs in a foot, not on the end of the body. Appended as
       an ordinary row it falls past the display limit and the one figure most
       people came to read is the one they cannot see. */
    if (opts.foot) {
      var tf = el('tfoot'), fr = el('tr', 'grand');
      opts.foot.forEach(function (v, i) {
        fr.appendChild(el('td', typeof v === 'number' ? 'n' : null,
          typeof v === 'number' && opts.money && opts.money.indexOf(i) >= 0 ? rupees(v)
            : typeof v === 'number' ? fmt(v) : String(v === null || v === undefined ? '' : v)));
      });
      tf.appendChild(fr); t.appendChild(tf);
    }
    wrap.appendChild(t);
    if (rows.length > (opts.limit || 60)) {
      wrap.appendChild(el('p', 'more', 'Showing the first ' + (opts.limit || 60) + ' of ' + fmt(rows.length) +
        ' rows on screen. The download has every one.'));
    }
    return wrap;
  }
  function button(label, sub, onClick) {
    var b = el('button', 'dl');
    b.appendChild(el('b', null, label));
    b.appendChild(el('span', null, sub));
    b.onclick = onClick;
    return b;
  }
  function save(name, wb) {
    var bytes = wb.build(X.zip, X.bytesOfUtf8);
    X.download(name, bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  function renderEcommerce(r) {
    var c = card('E-commerce — sale, return and inventory',
      r.companies.length + ' compan' + (r.companies.length === 1 ? 'y' : 'ies') + ' found in the sheets: ' +
      r.companies.map(function (x) { return x.name; }).join(', '));
    var n = r.header.length;
    var t = r.totals;
    c.appendChild(stats([
      ['items', fmt(r.items)],
      ['sale qty', fmt(t[n - 6])],
      ['return qty', fmt(t[n - 5])],
      ['net sale', fmt(t[n - 4])],
      ['wrong returns', fmt(t[n - 3])],
      ['total inventory', fmt(t[n - 2])],
      ['no price on file', fmt(r.noPrice.length), r.noPrice.length ? 'bad' : 'good']
    ]));

    var perCo = el('div', 'chips');
    r.companies.forEach(function (co) {
      var chip = el('span', 'chip');
      chip.appendChild(el('b', null, co.name));
      chip.appendChild(el('span', null, fmt(co.saleQty) + ' sold · ' + fmt(co.returnQty) + ' returned'));
      if (co.retSheet && !co.sawWrongColumn) chip.appendChild(el('em', null, 'no Wrong Return column'));
      perCo.appendChild(chip);
    });
    c.appendChild(perCo);

    c.appendChild(table(r.header, r.rows, {
      limit: 40, foot: r.totals,
      rowClass: function (row) { return row[n - 1] === 'NO PRICE' ? 'flag' : null; }
    }));

    if (r.noPrice.length) {
      var w = el('div', 'warnbox');
      w.appendChild(el('b', null, r.noPrice.length + ' items have no price on file.'));
      w.appendChild(el('p', null, 'No price has been guessed or interpolated for any of them. ' +
        'They are listed on their own sheet in the download: ' + r.noPrice.slice(0, 12).join(', ') +
        (r.noPrice.length > 12 ? ', …' : '')));
      c.appendChild(w);
    }

    var dl = el('div', 'downloads');
    dl.appendChild(button('Ecommerce_Complete_Sale_Updated.xlsx',
      'formatted, with =SUM() totals that recalculate',
      function () { save('Ecommerce_Complete_Sale_Updated.xlsx', Reports.ecommerceWorkbook(r)); }));
    c.appendChild(dl);
    $('#out').appendChild(c);
  }

  function renderKarigar(r, hadRates) {
    var c = card('Karigar — production and stitching cost',
      fmt(r.dataRows) + ' rows read across ' + fmt(r.totals.designs) + ' designs');
    c.appendChild(stats([
      ['designs', fmt(r.totals.designs)],
      ['karigars', fmt(r.totals.karigars)],
      ['completed sets', fmt(r.totals.sets)],
      ['pieces stitched', fmt(r.totals.pieces)],
      ['stitching cost', rupees(r.totals.cost), 'money'],
      ['no rate on file', fmt(r.noRate.length), r.noRate.length ? 'bad' : 'good']
    ]));

    if (!hadRates) {
      var w0 = el('div', 'warnbox');
      w0.appendChild(el('b', null, 'No Stitching Rates Master was loaded.'));
      w0.appendChild(el('p', null, 'Every piece is costed at ₹0 and every design is flagged. ' +
        'The production quantities above are still correct; the money is not a number to pay anyone from.'));
      c.appendChild(w0);
    }
    if (r.noRate.length) {
      var w = el('div', 'warnbox');
      w.appendChild(el('b', null, r.noRate.length + ' designs have no rate on file.'));
      w.appendChild(el('p', null, 'Each is costed at ₹0 and flagged rather than guessed at: ' +
        r.noRate.slice(0, 14).join(', ') + (r.noRate.length > 14 ? ', …' : '')));
      c.appendChild(w);
    }
    if (r.inferred.length) {
      var w2 = el('div', 'warnbox soft');
      w2.appendChild(el('b', null, r.inferred.length + ' designs were classified by their columns, not by the rate master.'));
      w2.appendChild(el('p', null, r.inferred.slice(0, 14).join(', ') + (r.inferred.length > 14 ? ', …' : '')));
      c.appendChild(w2);
    }
    if (r.unclassified.length) {
      var w3 = el('div', 'warnbox');
      w3.appendChild(el('b', null, r.unclassified.length + ' designs could not be classified at all — needs manual review.'));
      w3.appendChild(el('p', null, r.unclassified.join(', ')));
      c.appendChild(w3);
    }

    var extras = Reports.EXTRA_COLS;
    var head = ['#', 'Design Name', 'Set Type', 'Total Sets', 'Pieces', 'Cost (₹)', 'Rate']
      .concat(extras.map(function (p) { return 'Extra ' + p; }));
    var rows = r.designs.map(function (d, i) {
      return [i + 1, d.design, d.setType, d.sets, d.pieces, d.cost, d.rateStatus]
        .concat(extras.map(function (p) { return d.extras[p] || ''; }));
    });
    var extraTotals = extras.map(function (p) {
      return r.designs.reduce(function (s, d) { return s + (d.extras[p] || 0); }, 0) || '';
    });
    c.appendChild(table(head, rows, {
      limit: 40, money: [5],
      foot: ['', 'GRAND TOTAL', '', r.totals.sets, r.totals.pieces, r.totals.cost, ''].concat(extraTotals),
      rowClass: function (row) { return row[6] === 'NO RATE' ? 'flag' : null; }
    }));

    c.appendChild(el('h3', 'sub2', 'Karigar earnings'));
    c.appendChild(table(['#', 'Karigar', 'Designs', 'Pieces', 'Earnings (₹)'],
      r.karigars.map(function (k, i) { return [i + 1, k.karigar, k.designs.length, k.pieces, k.earnings]; }),
      { limit: 40, money: [4], foot: ['', 'GRAND TOTAL', '', r.totals.pieces, r.totals.cost] }));

    var dl = el('div', 'downloads');
    dl.appendChild(button('Karigar_Production_Cost_Report.xlsx', '4 sheets · summary, item-wise, earnings, detail',
      function () { save('Karigar_Production_Cost_Report.xlsx', Reports.costWorkbook(r)); }));
    dl.appendChild(button('Karigar_Premium_Production.xlsx', 'quantities only, no money anywhere',
      function () { save('Karigar_Premium_Production.xlsx', Reports.productionWorkbook(r)); }));
    c.appendChild(dl);
    $('#out').appendChild(c);
  }

  /* ── wiring ───────────────────────────────────────────────────────────── */

  function boot() {
    var zone = $('#drop'), input = $('#file');
    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    input.addEventListener('change', function () { takeFiles(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach(function (t) {
      zone.addEventListener(t, function (e) { e.preventDefault(); zone.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (t) {
      zone.addEventListener(t, function (e) { e.preventDefault(); zone.classList.remove('over'); });
    });
    zone.addEventListener('drop', function (e) { takeFiles(e.dataTransfer.files); });
    $('#run').addEventListener('click', run);
    $('#clear').addEventListener('click', function () {
      loaded = []; results = {}; $('#out').innerHTML = ''; $('#status').hidden = true; renderFiles();
    });
    renderFiles();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}());
