/* ═══════════ Vastrangam AI Engine — Records + Files ═══════════ */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  var TABLES = [
    { key: 'products', label: 'Products', one: 'product', icon: 'cart',
      cols: [{ k: 'sku', l: 'SKU' }, { k: 'name', l: 'Name' }, { k: 'cat', l: 'Category' }, { k: 'colour', l: 'Colour' }, { k: 'fabric', l: 'Fabric' }, { k: 'work', l: 'Work' }, { k: 'occ', l: 'Occasion' }, { k: 'label', l: 'Label' }, { k: 'price', l: 'Price', t: 'num' }, { k: 'mrp', l: 'MRP', t: 'num' }, { k: 'stock', l: 'Stock', t: 'num' }] },
    { key: 'assets', label: 'Image assets', one: 'asset', icon: 'image',
      cols: [{ k: 'name', l: 'File' }, { k: 'kind', l: 'Kind' }, { k: 'product', l: 'Product SKU' }, { k: 'size', l: 'Size' }] },
    { key: 'channels', label: 'Channels', one: 'channel', icon: 'plug',
      cols: [{ k: 'id', l: 'ID' }, { k: 'name', l: 'Name' }, { k: 'mode', l: 'Mode' }] },
    { key: 'calendar', label: 'Calendar', one: 'entry', icon: 'cal',
      cols: [{ k: 'date', l: 'Date' }, { k: 'platform', l: 'Platform' }, { k: 'format', l: 'Format' }, { k: 'hook', l: 'Hook' }, { k: 'product', l: 'Product' }, { k: 'status', l: 'Status' }] },
    { key: 'publog', label: 'Publish log', one: 'entry', icon: 'send',
      cols: [{ k: 'at', l: 'When' }, { k: 'platform', l: 'Platform' }, { k: 'product', l: 'Product' }, { k: 'result', l: 'Result' }, { k: 'note', l: 'Note' }] }
  ];
  function T(k) { return TABLES.filter(function (t) { return t.key === k; })[0]; }

  VA.view('records', function () {
    var d = DB(), tab = d.recTab || 'products', t = T(tab), list = d[tab] || [], editing = d.editing;
    var cur = editing ? (list.filter(function (r) { return (r.id || r.sku) === editing; })[0] || {}) : {};
    return H.head('Your records', 'Records', 'Everything in this app is one of these tables. Add, edit or delete anything — every screen moves with it.') +
      H.panel('Which table?', '<div class="chiprow">' + TABLES.map(function (x) {
        return '<button class="chip' + (tab === x.key ? ' on' : '') + '" data-act="rectab" data-t="' + x.key + '">' + esc(x.label) + ' <span class="badge">' + (d[x.key] || []).length + '</span></button>';
      }).join('') + '</div>') +
      H.panel((editing ? 'Edit this ' + t.one : 'Add a ' + t.one),
        '<div class="form f3">' + H.fields(t.cols.map(function (c) { return { id: 'rf_' + c.k, label: c.l, type: c.t === 'num' ? 'num' : 'text', value: cur[c.k] == null ? '' : cur[c.k] }; })) +
        '<div class="fld full"><button class="btn p" data-act="recsave">' + (editing ? 'Save changes' : 'Add it') + '</button>' + (editing ? ' <button class="btn" data-act="reccancel">Cancel</button>' : '') + '</div></div>') +
      H.panel(esc(t.label) + ' <span class="badge">' + list.length + '</span>', H.table(
        t.cols.slice(0, 7).map(function (c) { return { label: c.l, fmt: function (r) { return esc(String(r[c.k] == null ? '' : r[c.k]).slice(0, 40)); }, cellcls: c.t === 'num' ? 'mono' : '' }; })
          .concat([{ label: '', fmt: function (r) { var id = r.id || r.sku; return '<button class="btn sm" data-act="recedit" data-id="' + id + '">Edit</button> <button class="btn sm d" data-act="recdel" data-id="' + id + '">✕</button>'; } }]),
        list));
  });
  VA.action('rectab', function (b) { DB().recTab = b.getAttribute('data-t'); DB().editing = null; VA.save(); VA.render(); });
  VA.action('recedit', function (b) { DB().editing = b.getAttribute('data-id'); VA.save(); VA.render(); });
  VA.action('reccancel', function () { DB().editing = null; VA.save(); VA.render(); });
  VA.action('recsave', function () {
    var d = DB(), t = T(d.recTab || 'products'), rec = {};
    t.cols.forEach(function (c) { var v = VA.val('rf_' + c.k); rec[c.k] = c.t === 'num' ? VA.num(v) : v; });
    var list = d[t.key] = d[t.key] || [];
    if (d.editing) { var at = list.map(function (r) { return r.id || r.sku; }).indexOf(d.editing); if (at >= 0) { rec.id = list[at].id; list[at] = rec; } d.editing = null; VA.toast('Saved — every screen moved'); }
    else { if (!rec.id) rec.id = VA.uid(t.key.slice(0, 2)); list.push(rec); VA.toast('Added — every screen moved'); }
    VA.save(); VA.render();
  });
  VA.action('recdel', function (b) {
    var d = DB(), t = T(d.recTab || 'products'), id = b.getAttribute('data-id');
    d[t.key] = (d[t.key] || []).filter(function (r) { return (r.id || r.sku) !== id; }); VA.save(); VA.toast('Deleted'); VA.render();
  });

  /* ── FILES ── */
  VA.view('files', function () {
    var d = DB(), pend = d.pending, rep = d.lastImport;
    return H.head('Files', 'Upload & download', 'Bring your Excel or CSV in, or take everything back out. No account, no internet, no library — the spreadsheet engine is written inside this file.') +
      H.panel('Bring data in', '<div class="btnrow"><button class="btn p" data-act="filepick">Choose an .xlsx or .csv</button><button class="btn" data-act="filetpl">Download a blank template</button></div>' +
        '<input type="file" id="filein" accept=".xlsx,.csv" style="display:none">' +
        '<p class="hint" style="margin-top:9px">Column headings are matched to fields by name, in any order. Rows are shown before anything is written.</p>') +
      (pend ? H.panel('Ready to bring in <span class="badge">' + esc(pend.file) + '</span>',
        H.table([{ label: 'Sheet', k: 'sheet' }, { label: 'Into', fmt: function (s) { return s.table ? esc(T(s.table).label) : H.tag('not recognised', 'amb'); } }, { label: 'Rows', fmt: function (s) { return s.rows.length; }, cellcls: 'mono' }], pend.sheets) +
        '<div class="btnrow" style="margin-top:10px"><button class="btn p" data-act="filecommit" data-m="add">Add these</button><button class="btn d" data-act="filecommit" data-m="replace">Replace those tables</button><button class="btn" data-act="filecancel">Cancel</button></div>') : '') +
      (rep ? H.panel('Last import', '<div class="kv"><span>File</span><b>' + esc(rep.file) + '</b></div><div class="kv"><span>Rows brought in</span><b class="g">' + rep.added + '</b></div><div class="kv"><span>Tables touched</span><b>' + esc(rep.tables) + '</b></div>') : '') +
      H.panel('Take data out', '<div class="btnrow"><button class="btn p" data-act="filexlsx">Everything as Excel</button><button class="btn" data-act="filejson">JSON backup</button></div>' +
        H.table([{ label: 'Table', fmt: function (t) { return esc(t.label); } }, { label: 'Rows', fmt: function (t) { return (DB()[t.key] || []).length; }, cellcls: 'mono' }], TABLES));
  });
  VA.view('files').after = function () { var f = VA.$('filein'); if (f) f.onchange = function () { if (f.files[0]) stage(f.files[0]); }; };
  VA.action('filepick', function () { VA.$('filein').click(); });
  VA.action('filecancel', function () { DB().pending = null; VA.save(); VA.render(); });
  VA.action('filetpl', function () {
    var blank = {}; TABLES.forEach(function (t) { blank[t.label] = [t.cols.map(function (c) { return c.l; })]; });
    try { VSheet.saveXlsx('vastrangam-template.xlsx', blank); VA.toast('Template downloaded'); } catch (e) { VA.toast('Not available here'); }
  });
  VA.action('filexlsx', function () {
    var sheets = {}; TABLES.forEach(function (t) { sheets[t.label] = [t.cols.map(function (c) { return c.l; })].concat((DB()[t.key] || []).map(function (r) { return t.cols.map(function (c) { return r[c.k] == null ? '' : r[c.k]; }); })); });
    try { VSheet.saveXlsx('vastrangam-records.xlsx', sheets); VA.toast('Excel downloaded'); } catch (e) { VA.toast('Not available here'); }
  });
  VA.action('filejson', function () { var blob = new Blob([JSON.stringify(DB(), null, 2)], { type: 'application/json' }); var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vastrangam-backup.json'; a.click(); VA.toast('Backup downloaded'); });
  function guessTable(name) {
    var n = name.toLowerCase();
    var hit = TABLES.filter(function (t) { return t.label.toLowerCase() === n || t.key === n; })[0];
    return hit ? hit.key : null;
  }
  function stage(f) {
    VSheet.readFile(f, function (sheets, names) {
      var out = [];
      names.forEach(function (nm) {
        var key = guessTable(nm), rows = sheets[nm] || [], t = key && T(key);
        var objs = [];
        if (t && rows.length > 1) {
          var head = rows[0].map(function (h) { return String(h).toLowerCase().trim(); });
          for (var i = 1; i < rows.length; i++) { var o = {}; t.cols.forEach(function (c) { var at = head.indexOf(c.l.toLowerCase()); if (at >= 0) o[c.k] = rows[i][at]; }); if (!o.id) o.id = VA.uid(key.slice(0, 2)); objs.push(o); }
        }
        out.push({ sheet: nm, table: key, rows: objs });
      });
      DB().pending = { file: f.name, sheets: out }; VA.save(); VA.toast('Ready — review, then choose'); VA.go('files');
    }, function (msg) { VA.toast(msg || 'Could not read the file'); });
  }
  VA.action('filecommit', function (b) {
    var d = DB(), p = d.pending, mode = b.getAttribute('data-m'); if (!p) return;
    var added = 0, touched = {};
    p.sheets.forEach(function (s) { if (!s.table || !s.rows.length) return; if (mode === 'replace' && !touched[s.table]) d[s.table] = []; d[s.table] = (d[s.table] || []).concat(s.rows); added += s.rows.length; touched[s.table] = 1; });
    d.lastImport = { file: p.file, added: added, tables: Object.keys(touched).map(function (k) { return T(k).label; }).join(' · ') || 'none' };
    d.pending = null; VA.save(); VA.toast(added + ' row(s) brought in'); VA.render();
  });

  VA.TABLES = TABLES;
})();
