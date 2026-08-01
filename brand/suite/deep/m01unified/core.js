/* Medhava — Module 01 · Dashboard & BI, all three apps in one (Module 01 · App 4)

   The CEO Dashboard, the Report Builder and Group Consolidation running over ONE set of
   records instead of three copies of a demo. Add a sale here and the overview, every report
   and the group roll-up all move in the same instant — not because they are kept in step, but
   because there is only one set of numbers and one set of sums.

   The engine is M01 and the screens are M01V, exactly as in the three separate apps. This file
   adds the two things only the combined app has:

     · DATA  — add, edit and delete any record of any table, with the same validation rules the
               importer uses. There is no separate "demo mode": what you type is the data.
     · FILES — upload a real .xlsx or .csv and get it in; download the lot back out. The
               spreadsheet engine is written out in full in the suite (see xlsx.js) so this
               works offline with no library, no CDN and no account. An import button that
               needs somebody else's server is the same dependency the no-lock-in rule forbids.

   The rule that governs the importer: a row that cannot be trusted is never quietly dropped
   and never quietly fixed. It is rejected, counted, and shown to you with the reason. */
var K = typeof Medhava !== 'undefined' ? Medhava : {};
var H = K.H, money = K.money, inr = K.inr, num = K.num, r2 = K.r2, esc = K.esc, toast = K.toast;
var CFG = (typeof CONFIG !== 'undefined') ? CONFIG : {};
function db() { return K.DB; }
var SHEET = MedhavaSheet;   /* the whole spreadsheet engine, inlined — see suite/xlsx.js */

var V = M01V.make(CFG, {
  title: CFG.company + ' · everything in Module 01',
  companiesNoteTitle: 'You can change these here',
  companiesNote: '<p>In the separate CEO Dashboard this screen only reads. In this combined app it is wired to the real thing: ' +
    'go to <b>Companies &amp; names</b> under Set up to add one, remove one, or try turning a trading name into a company and watch it refuse.</p>' +
    '<p class="hint">Same engine, same rules. The only difference is that here you can also press the buttons.</p>',
  wiringTitle: 'How the three apps are wired to each other',
  wiringSub: 'One set of records, one engine, one set of screens. This app is the proof rather than the claim.',
  wiringPanels: function () {
    return H.panel('What happens when you add one sale',
      '<div class="cascade">' +
      '<div class="cl"><span class="d">1</span><div>You add it on <b>Records</b> — company, month, channel, gross, returns, units.</div></div>' +
      '<div class="cl"><span class="d">2</span><div>→ <b>Overview</b> and <b>Sales &amp; channels</b> move: net sales, margin, the month bars, the channel table.</div></div>' +
      '<div class="cl"><span class="d">3</span><div>→ Every <b>report</b> that touches sales moves, including saved ones — they hold the question, not the answer.</div></div>' +
      '<div class="cl"><span class="d">4</span><div>→ <b>Group figures</b> move: that company’s row, the group total, and the share bars.</div></div>' +
      '<div class="cl"><span class="d">5</span><div>→ If it pushed a channel past 12% returns, an <b>alert</b> appears. Nobody typed it.</div></div>' +
      '<div class="cl"><span class="d">6</span><div>Nothing was recalculated, refreshed or synced. There was only ever one number.</div></div>' +
      '</div>') +
    H.panel('What this app does that the three separate ones do not',
      '<ul class="pts"><li><b>Records</b> — add, edit and delete every table, live.</li>' +
      '<li><b>Files</b> — upload .xlsx or .csv, and download the whole book back out as either.</li>' +
      '<li>Everything else is <b>identical</b>: same engine file, same screens, same self-tests.</li></ul>' +
      '<p class="hint">Which is the point of shipping it. Test here, and you have tested all three.</p>');
  }
});

/* ═══════════════ RECORDS — add, edit, delete anything ═══════════════ */
function curTable(DB) { return M01.TBL[DB.tab || 'sales'] || M01.TBL.sales; }

function recordsView() {
  var DB = db(), t = curTable(DB), list = DB[t.key] || [], editing = DB.editing;
  var coOpts = (DB.companies || []).map(function (c) { return { v: c.id, label: c.name }; });
  var field = function (c, val) {
    var f = { id: 'r_' + c.k, label: c.l, type: c.type === 'num' ? 'num' : 'text', value: val == null ? '' : val, wide: c.k === 'name' || c.k === 'note' };
    if (c.type === 'co') { f.type = 'select'; f.options = coOpts; }
    if (c.type === 'month') { f.type = 'select'; f.options = M01.MONTHS.map(function (m) { return { v: m, label: M01.MLBL[m] }; }); }
    if (c.k === 'channel') { f.type = 'select'; f.options = (CFG.channels || []).concat([M01.icChannel(DB)]).map(function (x) { return { v: x, label: x }; }); }
    if (c.hint) f.ph = c.hint;
    return f;
  };
  var cur = editing ? (list.filter(function (r) { return r.id === editing; })[0] || {}) : {};
  return H.head('Records · ' + t.label, 'Records',
    'Everything in this app is one of these tables. Change anything and every screen moves with it.') +
  H.panel('Which table?',
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' + M01.TABLES.map(function (x) {
      return '<button class="btn' + (t.key === x.key ? ' p' : '') + '" data-act="settab" data-t="' + x.key +
        '"><svg class="i"><use href="#s-' + x.icon + '"/></svg> ' + esc(x.label) + ' <span class="badge">' + ((DB[x.key] || []).length) + '</span></button>';
    }).join('') + '</div><p class="hint" style="margin-top:9px">' + esc(t.note) + '</p>') +
  H.panel((editing ? 'Edit this ' + t.one : 'Add a ' + t.one) + (editing ? ' <span class="badge">editing</span>' : ''),
    '<div class="form f4">' + H.fields(t.cols.map(function (c) { return field(c, cur[c.k]); })) +
    '<div class="fld full" style="align-items:flex-end">' +
    '<button class="btn p" data-act="saverec">' + (editing ? 'Save changes' : 'Add it') + '</button>' +
    (editing ? ' <button class="btn" data-act="canceledit">Cancel</button>' : '') + '</div></div>' +
    (DB.lastReject ? '<div class="cascade" style="margin-top:8px"><b>Not accepted:</b> ' + esc(DB.lastReject) + '</div>' : '')) +
  H.panel(esc(t.label) + ' <span class="badge">' + list.length + ' row' + (list.length === 1 ? '' : 's') + '</span>',
    H.table(t.cols.map(function (c) {
      return { label: c.l, align: c.type === 'num' ? '' : 'l', cellcls: c.type === 'num' ? 'mono' : '',
        fmt: function (r) {
          var v = r[c.k];
          if (c.type === 'co') return esc(M01.coName(DB, v));
          if (c.type === 'month') return esc(M01.MLBL[v] || v);
          if (c.type === 'num') return inr(v);
          return esc(v == null ? '' : v);
        } };
    }).concat([{ label: '', align: 'l', fmt: function (r) {
      return '<button class="btn sm" data-act="editrec" data-id="' + esc(r.id) + '">Edit</button> ' +
             '<button class="btn sm d" data-act="delrec" data-id="' + esc(r.id) + '">Delete</button>'; } }]), list),
    '<button class="btn sm d" data-act="emptytable">Empty this table</button>');
}

/* ═══════════════ FILES — upload and download real spreadsheets ═══════════════ */
function filesView() {
  var DB = db(), pending = DB.pending, report = DB.lastImport;
  return H.head('Records · Files', 'Upload and download',
    'Bring your Excel or CSV in, or take everything back out. No account, no internet, no library — it is all in this file.') +
  H.panel('Bring data in',
    '<div style="display:flex;gap:9px;flex-wrap:wrap">' +
    '<button class="btn p" data-act="pickfile"><svg class="i"><use href="#s-sync"/></svg> Choose an .xlsx or .csv file</button>' +
    '<button class="btn" data-act="template">Download a blank template</button></div>' +
    '<p class="hint" style="margin-top:9px">Column headings are matched to fields by name, in any order, ignoring case and spacing — ' +
    '"Net Sales", "net_sales" and "netsales" all land in the same place. Columns we do not recognise are left alone, not treated as an error: ' +
    'a real export from a bank or a marketplace panel always carries columns you do not want.</p>' +
    '<p class="hint"><b>Company columns accept either the code or the full name.</b> A row naming a company that does not exist is rejected with that reason, ' +
    'rather than quietly creating one — a typo should not become a fourth business.</p>') +
  (pending ? H.panel('Ready to bring in <span class="badge">' + esc(pending.file) + '</span>',
    H.table([{ label: 'Sheet in your file', align: 'l', k: 'sheet' },
      { label: 'Goes into', align: 'l', fmt: function (s) { return s.table ? esc(M01.TBL[s.table].label) : H.tag('not recognised', 'amb'); } },
      { label: 'Rows', k: 'total', cellcls: 'mono' },
      { label: 'Accepted', fmt: function (s) { return s.ok; }, cellcls: 'mono g' },
      { label: 'Rejected', fmt: function (s) { return s.bad; }, cellcls: function (s) { return 'mono ' + (s.bad ? 'r' : ''); } }], pending.sheets) +
    '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:10px">' +
    '<button class="btn p" data-act="commit" data-mode="add">Add these to what is already here</button>' +
    '<button class="btn d" data-act="commit" data-mode="replace">Replace those tables entirely</button>' +
    '<button class="btn" data-act="cancelimport">Cancel</button></div>' +
    (pending.rejected.length ? '<p class="hint" style="margin-top:10px"><b>' + pending.rejected.length +
      ' row(s) will not be brought in.</b> Every one of them is listed below with the reason. Nothing is dropped silently.</p>' +
      H.table([{ label: 'Sheet', align: 'l', k: 'sheet' }, { label: 'Row', k: 'line', cellcls: 'mono' },
        { label: 'Why it was not accepted', align: 'l', fmt: function (r) { return esc(r.why); } }], pending.rejected.slice(0, 40)) : '')) : '') +
  (report ? H.panel('Last import <span class="badge">' + esc(report.when) + '</span>',
    '<div class="kv"><span>File</span><b>' + esc(report.file) + '</b></div>' +
    '<div class="kv"><span>Rows brought in</span><b class="g">' + report.added + '</b></div>' +
    '<div class="kv"><span>Rows rejected</span><b class="' + (report.rejected ? 'r' : '') + '">' + report.rejected + '</b></div>' +
    '<div class="kv"><span>Tables touched</span><b>' + esc(report.tables) + '</b></div>') : '') +
  H.panel('Take data out',
    '<div style="display:flex;gap:9px;flex-wrap:wrap">' +
    '<button class="btn p" data-act="xlsxdl"><svg class="i"><use href="#s-save"/></svg> Download everything as Excel</button>' +
    '<button class="btn" data-act="csvall">Download this table as CSV</button>' +
    '<button class="btn" data-act="_export">Download a JSON backup</button></div>' +
    '<p class="hint" style="margin-top:9px">The Excel file has <b>one sheet per table</b>, with the same headings the importer expects — ' +
    'so what comes out can go straight back in. That is the test of an export worth having.</p>' +
    H.table([{ label: 'Table', align: 'l', fmt: function (t) { return esc(t.label); } },
      { label: 'Rows', align: '', fmt: function (t) { return (db()[t.key] || []).length; }, cellcls: 'mono' },
      { label: 'Columns', align: 'l', fmt: function (t) { return esc(t.cols.map(function (c) { return c.l; }).join(' · ')); } }], M01.TABLES)) +
  H.panel('Why the spreadsheet reader is written out in this file',
    '<p>Every other ERP loads a spreadsheet library from somebody else’s server. The day that server is slow, blocked or gone, the ' +
    '<b>one button every customer presses on day one</b> stops working — and the app was never really offline.</p>' +
    '<p>So the zip reader, the decompressor and the Excel parser are all here, in full, in the file you double-clicked. ' +
    'Turn off your internet and upload a spreadsheet: it works, because there was never anything to fetch.</p>' +
    '<p class="hint">It is the same rule this suite applies to books, AI, couriers and payments. It would be a strange rule to hold for all of those and not for Excel.</p>');
}

/* ═══════════════ THE APP ═══════════════ */
var SPEC = {
  uses: ['ledger', 'channels', 'gst', 'storage', 'email', 'printing'],
  id: CFG.id, name: CFG.name, company: CFG.company, fy: CFG.fy || 'FY 2026-27',
  tagline: CFG.tagline, about: CFG.about,
  groups: [{ label: 'Command', items: ['dash', 'sales', 'money', 'stock', 'alerts'] },
           { label: 'Reports', items: ['build', 'lib', 'saved'] },
           { label: 'The group', items: ['group', 'compare', 'internal', 'returns'] },
           { label: 'Your records', items: ['records', 'files', 'cos'] },
           { label: 'Wiring', items: ['wiring'] }],
  nav: [{ v: 'dash', label: 'Overview', icon: 'grid' }, { v: 'sales', label: 'Sales & Channels', icon: 'chart' },
        { v: 'money', label: 'Money', icon: 'coin' }, { v: 'stock', label: 'Stock & Making', icon: 'box' },
        { v: 'alerts', label: 'Alerts', icon: 'bell' },
        { v: 'build', label: 'Build a report', icon: 'chart' }, { v: 'lib', label: 'Ready-made', icon: 'book' },
        { v: 'saved', label: 'My saved reports', icon: 'save' },
        { v: 'group', label: 'Group figures', icon: 'layers' }, { v: 'compare', label: 'Company by company', icon: 'store' },
        { v: 'internal', label: 'Between your companies', icon: 'sync' }, { v: 'returns', label: 'Who may file', icon: 'shield' },
        { v: 'records', label: 'Records', icon: 'doc' }, { v: 'files', label: 'Upload & download', icon: 'save' },
        { v: 'cos', label: 'Companies & names', icon: 'users' },
        { v: 'wiring', label: 'Wiring', icon: 'flow' }],
  seed: function (DB) {
    M01.seed(DB, CFG);
    DB.draft = M01.defaultDef('sales'); DB.saved = [];
    DB.tab = 'sales'; DB.editing = null; DB.pending = null;
    DB.lastRefusal = null; DB.lastReturn = null; DB.lastImport = null; DB.lastReject = null;
  },
  views: {
    dash: V.dash, sales: V.sales, money: V.money, stock: V.stock, alerts: V.alerts,
    build: V.build, lib: V.lib, saved: V.saved,
    group: V.group, compare: V.compare, internal: V.internal, returns: V.returns, cos: V.cos,
    records: recordsView, files: filesView, wiring: V.wiring,
    /* the registration alert sends you here; it is the editable version of the dashboard's read-only one */
    companies: V.cos
  },
  actions: (function (A) {
    /* everything the three separate apps can do … */
    var acts = {};
    Object.keys(A).forEach(function (k) { acts[k] = A[k]; });

    /* … plus the two things only this app can do */
    acts.settab = function (b) { var DB = db(); DB.tab = b.getAttribute('data-t'); DB.editing = null; DB.lastReject = null; K.save(); K.render(); };
    acts.canceledit = function () { var DB = db(); DB.editing = null; DB.lastReject = null; K.save(); K.render(); };
    acts.editrec = function (b) { var DB = db(); DB.editing = b.getAttribute('data-id'); DB.lastReject = null; K.save(); K.render(); };
    acts.delrec = function (b) {
      var DB = db(), t = curTable(DB), id = b.getAttribute('data-id');
      DB[t.key] = (DB[t.key] || []).filter(function (r) { return r.id !== id; });
      if (DB.editing === id) DB.editing = null;
      K.save(); toast('Deleted — every figure has moved'); K.render();
    };
    acts.saverec = function () {
      var DB = db(), t = curTable(DB), raw = {};
      t.cols.forEach(function (c) { raw[c.k] = H.val('r_' + c.k); });
      var rec = M01.normalise(DB, t.key, raw), bad = M01.validate(DB, t.key, rec);
      if (bad.length) { DB.lastReject = bad.join('; '); K.save(); toast('Not accepted'); K.render(); return; }
      DB.lastReject = null;
      if (DB.editing) {
        var at = (DB[t.key] || []).map(function (r) { return r.id; }).indexOf(DB.editing);
        if (at >= 0) { rec.id = DB.editing; DB[t.key][at] = rec; }
        DB.editing = null; toast('Saved — every figure has moved');
      } else {
        rec.id = M01.uid(t.key.slice(0, 2));
        (DB[t.key] = DB[t.key] || []).push(rec);
        toast('Added — every figure has moved');
      }
      K.save(); K.render();
    };
    acts.emptytable = function () {
      var DB = db(), t = curTable(DB);
      if (!confirm('Delete every row of "' + t.label + '"? Every figure that used them will change.')) return;
      DB[t.key] = []; DB.editing = null; K.save(); toast(t.label + ' emptied'); K.render();
    };

    /* The picker's handler is attached once, at the bottom of this file, rather than each
       time the button is pressed — so a file that arrives any other way (a drop, a test, a
       browser restoring one) is handled identically. */
    acts.pickfile = function () {
      var inp = document.getElementById('sheetIn');
      if (inp) { inp.value = ''; inp.click(); }
    };
    acts.cancelimport = function () { var DB = db(); DB.pending = null; K.save(); K.render(); };
    acts.commit = function (b) {
      var DB = db(), mode = b.getAttribute('data-mode'), p = DB.pending;
      if (!p) return;
      var added = 0, touched = {};
      p.sheets.forEach(function (s) {
        if (!s.table || !s.rows.length) return;
        if (mode === 'replace' && !touched[s.table]) DB[s.table] = [];
        DB[s.table] = (DB[s.table] || []).concat(s.rows);
        added += s.rows.length; touched[s.table] = 1;
      });
      DB.lastImport = { when: 'just now', file: p.file, added: added, rejected: p.rejected.length,
        tables: Object.keys(touched).map(function (k) { return M01.TBL[k].label; }).join(' · ') || 'none' };
      DB.pending = null; K.save();
      toast(added + ' row(s) brought in — every figure has moved'); K.render();
    };
    acts.xlsxdl = function () {
      try { SHEET.saveXlsx((CFG.id || 'medhava') + '-records.xlsx', M01.sheetsOf(db())); toast('Excel file downloaded'); }
      catch (e) { toast('Download not available here'); }
    };
    acts.csvall = function () {
      var DB = db(), t = curTable(DB);
      try { SHEET.saveCsv((CFG.id || 'medhava') + '-' + t.key + '.csv',
        M01.sheetsOf(DB)[t.label]); toast(t.label + ' downloaded as CSV'); }
      catch (e) { toast('Download not available here'); }
    };
    acts.template = function () {
      var blank = {};
      M01.TABLES.forEach(function (t) { blank[t.label] = [t.cols.map(function (c) { return c.l; })]; });
      try { SHEET.saveXlsx((CFG.id || 'medhava') + '-blank-template.xlsx', blank); toast('Blank template downloaded'); }
      catch (e) { toast('Download not available here'); }
    };
    return acts;
  })(M01V.actions(CFG)),

  tests: function (t, DB) {
    DB.period = '2026-07'; DB.co = 'all';

    /* ── it really is the same engine as the other three ── */
    t('the dashboard figure and the report total are the same number',
      M01.report(DB, M01.defaultDef('sales')).total.v.net === M01.netSales(DB));
    t('the group total is every company added up, minus internal billing',
      M01.groupFigures(DB).net === r2(M01.groupFigures(DB).addedNet - M01.groupFigures(DB).eliminated));
    t('a company with no tax registration is refused a return and still counts',
      (function () { var u = M01.perCompany(DB).filter(function (c) { return !c.registered; })[0];
        return u && u.net > 0 && M01.gstReturn(DB, u.id).refused === true; })());

    /* ── adding a record moves every figure, because there is only one ── */
    var net0 = M01.netSales(DB), rep0 = M01.report(DB, M01.defaultDef('sales')).total.v.net;
    var grp0 = M01.groupFigures(DB).net, ids = M01.coIds(DB);
    DB.sales.push({ id: 'probe-1', co: ids[0], month: '2026-07', channel: CFG.channels[0], gross: 10000, returns: 1000, units: 7 });
    t('adding a sale moves the dashboard', M01.netSales(DB) === r2(net0 + 9000));
    t('adding a sale moves every report by the same amount',
      M01.report(DB, M01.defaultDef('sales')).total.v.net === r2(rep0 + 9000));
    t('adding a sale moves the group figures by the same amount', M01.groupFigures(DB).net === r2(grp0 + 9000));
    DB.sales = DB.sales.filter(function (x) { return x.id !== 'probe-1'; });
    t('deleting it puts every figure back exactly', M01.netSales(DB) === net0 && M01.groupFigures(DB).net === grp0);

    /* ── the rules an edited or uploaded row has to satisfy ── */
    t('a row naming a company that does not exist is rejected',
      M01.validate(DB, 'sales', { co: 'NOPE', month: '2026-07', channel: 'x', gross: 1, returns: 0, units: 0 }).length > 0);
    t('the rejection says to add the company first, rather than inventing one',
      /add the company first/.test(M01.validate(DB, 'sales', { co: 'NOPE', month: '2026-07', channel: 'x' }).join(' ')));
    t('a row with no month is rejected', M01.validate(DB, 'sales', { co: ids[0], channel: 'x' }).length > 0);
    t('a month that is not a month is rejected',
      M01.validate(DB, 'sales', { co: ids[0], month: 'July please', channel: 'x' }).length > 0);
    t('a good row is accepted',
      M01.validate(DB, 'sales', { co: ids[0], month: '2026-07', channel: CFG.channels[0], gross: 5, returns: 0, units: 1 }).length === 0);
    t('a company can be given by its full name, not only its code',
      M01.normalise(DB, 'sales', { co: DB.companies[1].name, month: '2026-07', channel: 'x' }).co === ids[1]);

    /* ── the importer: nothing dropped silently ── */
    var batch = M01.importRows(DB, 'sales', [
      { co: ids[0], month: '2026-07', channel: CFG.channels[0], gross: 100, returns: 0, units: 1 },
      { co: 'GHOST', month: '2026-07', channel: CFG.channels[0], gross: 200, returns: 0, units: 1 },
      { co: ids[1], month: 'nonsense', channel: CFG.channels[0], gross: 300, returns: 0, units: 1 }]);
    t('an import accepts the good rows', batch.rows.length === 1);
    t('an import rejects the bad rows rather than dropping them', batch.rejected.length === 2);
    t('every rejected row carries a line number and a reason',
      batch.rejected.every(function (r) { return r.line > 1 && r.why.length > 5; }));
    t('accepted rows and rejected rows always add up to what was in the file',
      batch.rows.length + batch.rejected.length === 3);
    t('an imported row gets its own id, so it can be edited and deleted like any other',
      batch.rows[0].id && batch.rows[0].id !== batch.rows[0].co);

    /* ── the spreadsheet engine, checked on itself ── */
    var sheets = M01.sheetsOf(DB);
    t('every table exports as its own sheet', Object.keys(sheets).length === M01.TABLES.length);
    t('the first row of every sheet is its headings',
      M01.TABLES.every(function (tb) { return sheets[tb.label][0].join('|') === tb.cols.map(function (c) { return c.l; }).join('|'); }));
    t('the sales sheet has one row per sales record, plus the headings',
      sheets.Sales.length === DB.sales.length + 1);
    var back = M01.importRows(DB, 'sales', SHEET.toObjects(sheets.Sales, M01.TBL.sales.cols).rows);
    t('what this app exports, this app can import again with nothing rejected',
      back.rejected.length === 0 && back.rows.length === DB.sales.length);
    t('the figures survive the round trip',
      r2(back.rows.reduce(function (s, x) { return s + num(x.gross) - num(x.returns); }, 0)) ===
      r2(DB.sales.reduce(function (s, x) { return s + num(x.gross) - num(x.returns); }, 0)));

    /* ── the screens really are the same ones, not lookalikes ── */
    t('this app carries every screen of all three apps',
      ['dash', 'sales', 'money', 'stock', 'alerts'].every(function (v) { return !!SPEC.views[v]; }) &&
      ['build', 'lib', 'saved'].every(function (v) { return !!SPEC.views[v]; }) &&
      ['group', 'compare', 'internal', 'cos', 'returns'].every(function (v) { return !!SPEC.views[v]; }));
    t('its overview is the same function the CEO Dashboard uses', SPEC.views.dash === V.dash);
    t('its report builder is the same function the Report Builder uses', SPEC.views.build === V.build);
    t('its group screen is the same function Group Consolidation uses', SPEC.views.group === V.group);
    t('only this app can write records — it has Records and Files, the others do not',
      !!SPEC.views.records && !!SPEC.views.files);
  }
};

/* Work out what an uploaded file contains, check every row, and stage it — nothing is written
   until you have seen the count of what will be accepted and what will not. */
function stagePending(fileName, sheets, names) {
  var DB = db(), out = [], rejected = [];
  names.forEach(function (n) {
    var rows = sheets[n] || [], table = M01.guessTable(n, rows);
    var entry = { sheet: n, table: table, total: Math.max(0, rows.length - 1), ok: 0, bad: 0, rows: [] };
    if (table) {
      var objs = SHEET.toObjects(rows, M01.TBL[table].cols).rows;
      var res = M01.importRows(DB, table, objs);
      entry.rows = res.rows; entry.ok = res.rows.length; entry.bad = res.rejected.length;
      res.rejected.forEach(function (r) { rejected.push({ sheet: n, line: r.line, why: r.why }); });
    }
    out.push(entry);
  });
  DB.pending = { file: fileName, sheets: out, rejected: rejected };
  K.save();
  toast(out.reduce(function (s, x) { return s + x.ok; }, 0) + ' row(s) ready — check the list, then choose');
  K.go('files');
}

/* One handler for "a spreadsheet arrived", wired once. */
if (typeof document !== 'undefined') {
  var sheetIn = document.getElementById('sheetIn');
  if (sheetIn) sheetIn.addEventListener('change', function () {
    var f = sheetIn.files && sheetIn.files[0];
    if (!f) return;
    SHEET.readFile(f, function (sheets, names) { stagePending(f.name, sheets, names); },
      function (msg) { toast(msg); });
  });
}

if (typeof module !== 'undefined' && module.exports) module.exports = SPEC;
if (typeof Medhava !== 'undefined' && Medhava.app) Medhava.app(SPEC);
