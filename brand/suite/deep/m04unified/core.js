/* Medhava — Module 04 · CRM, all three apps in one (Module 04 · App 4)

   CRM & Customer 360, Documents & eSign and Helpdesk & Live Chat over ONE set of records.
   Win a lead and the party appears on the customer list with its documents and its tickets
   already hanging off it. File a document against an order and it turns up on that customer's
   timeline. Answer a ticket and the first-reply clock moves everywhere at once.

   The engine is M02 and the screens are M02V, exactly as in the three separate apps. This file
   adds the two things only the combined app has:

     · RECORDS — add, edit and delete any row of any table, with the same validation rules the
                 importer uses. What you type is the data; there is no separate "demo mode".
     · FILES   — upload a real .xlsx or .csv and get it in; download the lot back out. The
                 spreadsheet engine is written out in full in the suite (see xlsx.js), so this
                 works with the internet switched off.

   And it has all three sets of buttons: the CRM app deliberately cannot sign a document or
   answer a ticket, because those are other apps' rules. Here they are all on one screen. */
var K = typeof Medhava !== 'undefined' ? Medhava : {};
var H = K.H, money = K.money, inr = K.inr, num = K.num, r2 = K.r2, esc = K.esc, toast = K.toast;
var CFG = (typeof CONFIG !== 'undefined') ? CONFIG : {};
function db() { return K.DB; }
var SHEET = MedhavaSheet;   /* the whole spreadsheet engine, inlined — see suite/xlsx.js */

var V = M02V.make(CFG, {
  title: CFG.company + ' · everything in Module 04',
  wiringTitle: 'How the three apps are wired to each other',
  wiringSub: 'One set of records, one engine, one set of screens. This app is the proof rather than the claim.',
  wiringPanels: function () {
    return H.panel('What happens when you win one deal',
      '<div class="cascade">' +
      '<div class="cl"><span class="d">1</span><div>You mark it won on <b>Pipeline</b>.</div></div>' +
      '<div class="cl"><span class="d">2</span><div>→ The pipeline drops by that deal, and the win rate moves.</div></div>' +
      '<div class="cl"><span class="d">3</span><div>→ A party appears on <b>Customers</b> — or, if that organisation was already on the books, nothing new appears and the win attaches to the record you had.</div></div>' +
      '<div class="cl"><span class="d">4</span><div>→ Their <b>Customer 360</b> timeline already carries the lead, and will carry every document and ticket from here on.</div></div>' +
      '<div class="cl"><span class="d">5</span><div>Nothing was synced. There was only ever one record.</div></div>' +
      '</div>') +
    H.panel('What this app does that the three separate ones do not',
      '<ul class="pts"><li><b>All three sets of buttons on one screen</b> — win a deal, sign a document and answer a ticket without changing app.</li>' +
      '<li><b>Records</b> — add, edit and delete every table, live.</li>' +
      '<li><b>Files</b> — upload .xlsx or .csv, and download the whole book back out as either.</li>' +
      '<li>Everything else is <b>identical</b>: same engine file, same screens, same rules, same refusals.</li></ul>' +
      '<p class="hint">Test here, and you have tested all three.</p>');
  }
});

/* ═══════════════ RECORDS ═══════════════ */
function curTable(DB) { return M02.TBL[DB.tab || 'parties'] || M02.TBL.parties; }

function recordsView() {
  var DB = db(), t = curTable(DB), list = DB[t.key] || [], editing = DB.editing;
  var pOpts = (DB.parties || []).map(function (p) { return { v: p.id, label: p.name }; });
  var field = function (c, val) {
    var f = { id: 'r_' + c.k, label: c.l, type: c.type === 'num' ? 'num' : 'text',
      value: val == null ? '' : val, wide: c.k === 'text' || c.k === 'title' || c.k === 'subject' };
    if (c.type === 'party') { f.type = 'select'; f.options = pOpts; }
    if (c.k === 'channel' && t.key === 'tickets') { f.type = 'select'; f.options = (CFG.channels || []).map(function (x) { return { v: x, label: x }; }); }
    if (c.k === 'agent') { f.type = 'select'; f.options = (CFG.agents || []).map(function (x) { return { v: x, label: x }; }); }
    if (c.k === 'againstKind') { f.type = 'select'; f.options = (CFG.docKinds || []).map(function (x) { return { v: x, label: x }; }); }
    if (c.k === 'type' && t.key === 'docs') { f.type = 'select'; f.options = (CFG.docTypes || []).map(function (x) { return { v: x, label: x }; }); }
    if (c.k === 'status' && t.key === 'docs') { f.type = 'select'; f.options = M02.DOCSTATES.map(function (x) { return { v: x, label: x }; }); }
    if (c.k === 'stage') { f.type = 'select'; f.options = M02.STAGES.map(function (s) { return { v: s.k, label: s.l + ' (' + s.p + '%)' }; }); }
    if (c.k === 'status' && t.key === 'leads') { f.type = 'select'; f.options = ['open', 'won', 'lost'].map(function (x) { return { v: x, label: x }; }); }
    if (c.k === 'who') { f.type = 'select'; f.options = [{ v: 'customer', label: 'customer' }, { v: 'us', label: 'us' }]; }
    if (c.type === 'date') f.ph = '2026-07-31';
    if (c.type === 'stamp') f.ph = '2026-07-31T14:05';
    return f;
  };
  var cur = editing ? (list.filter(function (r) { return r.id === editing; })[0] || {}) : {};
  return H.head('Records · ' + t.label, 'Records',
    'Everything in this app is one of these tables. Change anything and every screen moves with it.') +
  H.panel('Which table?',
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' + M02.TABLES.map(function (x) {
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
    H.table(t.cols.slice(0, 7).map(function (c) {
      return { label: c.l, align: c.type === 'num' ? '' : 'l', cellcls: c.type === 'num' ? 'mono' : '',
        fmt: function (r) {
          var v = r[c.k];
          if (c.type === 'party') return esc(M02.partyName(DB, v));
          if (c.type === 'num') return inr(v);
          return esc(String(v == null ? '' : v).slice(0, 48));
        } };
    }).concat([{ label: '', align: 'l', fmt: function (r) {
      return '<button class="btn sm" data-act="editrec" data-id="' + esc(r.id) + '">Edit</button> ' +
             '<button class="btn sm d" data-act="delrec" data-id="' + esc(r.id) + '">Delete</button>'; } }]), list),
    '<button class="btn sm d" data-act="emptytable">Empty this table</button>');
}

/* ═══════════════ FILES ═══════════════ */
function filesView() {
  var DB = db(), pending = DB.pending, report = DB.lastImport;
  return H.head('Records · Files', 'Upload and download',
    'Bring your Excel or CSV in, or take everything back out. No account, no internet, no library — it is all in this file.') +
  H.panel('Bring data in',
    '<div style="display:flex;gap:9px;flex-wrap:wrap">' +
    '<button class="btn p" data-act="pickfile"><svg class="i"><use href="#s-sync"/></svg> Choose an .xlsx or .csv file</button>' +
    '<button class="btn" data-act="template">Download a blank template</button></div>' +
    '<p class="hint" style="margin-top:9px">Column headings are matched to fields by name, in any order, ignoring case and spacing. ' +
    'Columns we do not recognise are left alone, not treated as an error — a real export always carries columns you do not want.</p>' +
    '<p class="hint"><b>Party columns accept either the code or the full name.</b> A row naming a party that does not exist is rejected with that reason ' +
    'rather than quietly creating one, because a typo should not become a second customer.</p>') +
  (pending ? H.panel('Ready to bring in <span class="badge">' + esc(pending.file) + '</span>',
    H.table([{ label: 'Sheet in your file', align: 'l', k: 'sheet' },
      { label: 'Goes into', align: 'l', fmt: function (s) { return s.table ? esc(M02.TBL[s.table].label) : H.tag('not recognised', 'amb'); } },
      { label: 'Rows', k: 'total', cellcls: 'mono' },
      { label: 'Accepted', fmt: function (s) { return s.ok; }, cellcls: 'mono g' },
      { label: 'Rejected', fmt: function (s) { return s.bad; }, cellcls: function (s) { return 'mono ' + (s.bad ? 'r' : ''); } }], pending.sheets) +
    '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:10px">' +
    '<button class="btn p" data-act="commit" data-mode="add">Add these to what is already here</button>' +
    '<button class="btn d" data-act="commit" data-mode="replace">Replace those tables entirely</button>' +
    '<button class="btn" data-act="cancelimport">Cancel</button></div>' +
    (pending.rejected.length ? '<p class="hint" style="margin-top:10px"><b>' + pending.rejected.length +
      ' row(s) will not be brought in.</b> Every one is listed below with the reason. Nothing is dropped silently.</p>' +
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
    '<p class="hint" style="margin-top:9px">One sheet per table, with the same headings the importer expects — so what comes out can go straight back in.</p>' +
    H.table([{ label: 'Table', align: 'l', fmt: function (t) { return esc(t.label); } },
      { label: 'Rows', fmt: function (t) { return (db()[t.key] || []).length; }, cellcls: 'mono' },
      { label: 'Columns', align: 'l', fmt: function (t) { return esc(t.cols.map(function (c) { return c.l; }).join(' · ')); } }], M02.TABLES)) +
  H.panel('Two rules the importer will not bend',
    '<p><b>A document cannot be imported as "signed" with no one-time code against it.</b> If a spreadsheet ' +
    'claims a signature that cannot be evidenced, the row is refused — importing is not a back door around the rule.</p>' +
    '<p><b>A ticket cannot be imported against somebody else’s order.</b> Same reason as on screen: it would put one ' +
    'customer’s delivery on another customer’s record.</p>' +
    '<p class="hint">The rules live in the engine, so the form and the importer enforce exactly the same ones, with the same sentence explaining why.</p>');
}

/* ═══════════════ THE APP ═══════════════ */
/* Captured before SPEC, because the kernel adds its own backup and connector buttons to
   SPEC.actions at boot — so a test that reads SPEC.actions passes in Node and fails in a
   browser. This is the whole of what this app can do, and unlike the other three it is all
   three apps' buttons at once, plus the records and the files. */
var OWN = (function (A) {
  var acts = {};
  Object.keys(A).forEach(function (k) { acts[k] = A[k]; });   /* all three apps' buttons */

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
    var rec = M02.normalise(DB, t.key, raw), bad = M02.validate(DB, t.key, rec);
    if (bad.length) { DB.lastReject = bad.join('; '); K.save(); toast('Not accepted'); K.render(); return; }
    DB.lastReject = null;
    if (DB.editing) {
      var at = (DB[t.key] || []).map(function (r) { return r.id; }).indexOf(DB.editing);
      if (at >= 0) { rec.id = DB.editing; DB[t.key][at] = rec; }
      DB.editing = null; toast('Saved — every figure has moved');
    } else {
      (DB[t.key] = DB[t.key] || []).push(rec);   /* normalise has already given it a reference */
      toast('Added — every figure has moved');
    }
    K.save(); K.render();
  };
  acts.emptytable = function () {
    var DB = db(), t = curTable(DB);
    if (!confirm('Delete every row of "' + t.label + '"? Every figure that used them will change.')) return;
    DB[t.key] = []; DB.editing = null; K.save(); toast(t.label + ' emptied'); K.render();
  };

  acts.pickfile = function () { var i = document.getElementById('sheetIn'); if (i) { i.value = ''; i.click(); } };
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
      tables: Object.keys(touched).map(function (k) { return M02.TBL[k].label; }).join(' · ') || 'none' };
    DB.pending = null; K.save(); toast(added + ' row(s) brought in — every figure has moved'); K.render();
  };
  acts.xlsxdl = function () {
    try { SHEET.saveXlsx((CFG.id || 'medhava') + '-records.xlsx', M02.sheetsOf(db())); toast('Excel file downloaded'); }
    catch (e) { toast('Download not available here'); }
  };
  acts.csvall = function () {
    var DB = db(), t = curTable(DB);
    try { SHEET.saveCsv((CFG.id || 'medhava') + '-' + t.key + '.csv', M02.sheetsOf(DB)[t.label]); toast(t.label + ' downloaded as CSV'); }
    catch (e) { toast('Download not available here'); }
  };
  acts.template = function () {
    var blank = {};
    M02.TABLES.forEach(function (t) { blank[t.label] = [t.cols.map(function (c) { return c.l; })]; });
    try { SHEET.saveXlsx((CFG.id || 'medhava') + '-blank-template.xlsx', blank); toast('Blank template downloaded'); }
    catch (e) { toast('Download not available here'); }
  };
  return acts;
})(M02V.actions(CFG));

var SPEC = {
  uses: ['channels', 'ledger', 'messaging', 'email', 'storage', 'printing', 'automation'],
  id: CFG.id, name: CFG.name, company: CFG.company, fy: CFG.fy || 'FY 2026-27',
  tagline: CFG.tagline, about: CFG.about,
  groups: [{ label: 'Winning work', items: ['dash', 'pipe'] },
           { label: 'Customers', items: ['cust', 'person', 'segs'] },
           { label: 'Documents', items: ['docdash', 'docs'] },
           { label: 'The desk', items: ['deskdash', 'tickets', 'ticket'] },
           { label: 'Your records', items: ['records', 'files'] },
           { label: 'Wiring', items: ['wiring'] }],
  nav: [{ v: 'dash', label: 'Overview', icon: 'grid' }, { v: 'pipe', label: 'Pipeline', icon: 'flow' },
        { v: 'cust', label: 'Customers', icon: 'users' }, { v: 'person', label: 'Customer 360', icon: 'doc' },
        { v: 'segs', label: 'Segments & offers', icon: 'spark' },
        { v: 'docdash', label: 'Documents', icon: 'book' }, { v: 'docs', label: 'All documents', icon: 'doc' },
        { v: 'deskdash', label: 'The desk', icon: 'chart' }, { v: 'tickets', label: 'Tickets', icon: 'bell' },
        { v: 'ticket', label: 'One ticket', icon: 'thread' },
        { v: 'records', label: 'Records', icon: 'layers' }, { v: 'files', label: 'Upload & download', icon: 'save' },
        { v: 'wiring', label: 'Wiring', icon: 'flow' }],
  seed: function (DB) {
    M02.seed(DB, CFG);
    DB.tab = 'parties'; DB.editing = null; DB.pending = null; DB.lastImport = null; DB.lastReject = null;
  },
  views: {
    dash: V.dash, pipe: V.pipe, cust: V.cust, person: V.person, segs: V.segs,
    docdash: V.docdash, docs: V.docs,
    deskdash: V.deskdash, tickets: V.tickets, ticket: V.ticket,
    records: recordsView, files: filesView, wiring: V.wiring
  },
  actions: OWN,

  tests: function (t, DB) {
    /* ── every button this app declares is a button one of its screens renders ── */
    t('every button this app offers is really on one of its own screens',
      M02V.unreachable(SPEC, DB, OWN).length === 0, M02V.unreachable(SPEC, DB, OWN).join(', '));

    /* ── it really is the same engine as the other three ── */
    t('the pipeline, the documents and the desk all read the same parties',
      M02.profiles(DB).length === DB.parties.length &&
      M02.docsOfParty(DB, 'P1').length > 0 && M02.ticketsOf(DB, 'P1').length > 0);
    t('one party’s timeline carries all three apps at once',
      ['Order', 'Document', 'Ticket', 'Note'].every(function (k) {
        return M02.timeline(DB, 'P1').some(function (e) { return e.kind === k; }); }));

    /* ── winning a deal moves the pipeline AND the customer list ── */
    var pipe0 = M02.pipelineValue(DB), parties0 = DB.parties.length;
    var stranger = M02.openLeads(DB).filter(function (l) { return !M02.findParty(DB, l.co); })[0];
    var res = M02.winLead(DB, stranger.id, CFG);
    t('winning a new organisation opens exactly one party', res.ok && DB.parties.length === parties0 + 1);
    t('and takes that deal out of the open pipeline', M02.pipelineValue(DB) === r2(pipe0 - stranger.value));
    t('and the new party is immediately on the customer list',
      M02.profiles(DB).some(function (p) { return p.id === res.party; }));
    t('and their timeline already carries the lead they came from',
      M02.timeline(DB, res.party).some(function (e) { return e.kind === 'Lead'; }));

    /* ── filing a document shows up on the customer record ── */
    var docs0 = M02.docsOfParty(DB, 'P1').length;
    DB.docs.push({ id: 'D-PROBE', title: 'Probe agreement', type: (CFG.docTypes || ['x'])[0],
      againstKind: 'Party', against: 'P1', issued: M02.dateOnly(M02.TODAY), expires: '',
      status: 'draft', signer: 'A Signer', signedOn: '', code: '' });
    t('filing a document against a party puts it on their record', M02.docsOfParty(DB, 'P1').length === docs0 + 1);
    t('and on their timeline', M02.timeline(DB, 'P1').some(function (e) { return e.what === 'Probe agreement'; }));
    t('it still cannot be signed without a code', M02.signDoc(DB, 'D-PROBE', '').refused === true);
    t('it cannot be signed before it is sent', M02.signDoc(DB, 'D-PROBE', '123456').refused === true);
    M02.sendDoc(DB, 'D-PROBE');
    t('once sent, a six-digit code signs it', M02.signDoc(DB, 'D-PROBE', '246810').ok === true);
    DB.docs = DB.docs.filter(function (d) { return d.id !== 'D-PROBE'; });
    t('deleting it takes it off the record again', M02.docsOfParty(DB, 'P1').length === docs0);

    /* ── answering a ticket moves the desk figures ── */
    var quiet = M02.unanswered(DB)[0];
    t('there is an unanswered ticket to work on', !!quiet);
    var unans0 = M02.unanswered(DB).length;
    M02.reply(DB, quiet.id, 'On it now.');
    t('answering it drops the unanswered count', M02.unanswered(DB).length === unans0 - 1);
    t('and gives that ticket a first-reply time worked out from the message',
      M02.ticketRow(DB, DB.tickets.filter(function (x) { return x.id === quiet.id; })[0]).firstReply !== null);
    t('and it shows on that party’s Customer 360 timeline',
      M02.timeline(DB, quiet.party).some(function (e) { return e.kind === 'Ticket'; }));

    /* ── the rules an edited or uploaded row has to satisfy ── */
    var ids = DB.parties.map(function (p) { return p.id; });
    t('a row naming a party that does not exist is rejected',
      M02.validate(DB, 'orders', { id: 'X', party: 'NOPE', date: '2026-07-01' }).length > 0);
    t('the rejection says to add the party first',
      /add the party first/.test(M02.validate(DB, 'orders', { id: 'X', party: 'NOPE', date: '2026-07-01' }).join(' ')));
    t('a date that is not a date is rejected',
      M02.validate(DB, 'orders', { id: 'X', party: ids[0], date: 'last Tuesday' }).length > 0);
    t('a party can be given by its full name, not only its code',
      M02.normalise(DB, 'orders', { id: 'X', party: DB.parties[1].name, date: '2026-07-01' }).party === ids[1]);
    /* a blank reference is filled in, and it is filled in the same way on both paths */
    t('a row with no reference of its own is given one rather than refused',
      M02.validate(DB, 'orders', M02.normalise(DB, 'orders',
        { id: '', party: ids[0], date: '2026-07-01', amount: 1000, returned: 0 })).length === 0);
    t('and the importer fills a blank reference in exactly the same way',
      M02.importRows(DB, 'orders', [{ id: '', party: ids[0], date: '2026-07-01', amount: 1000, returned: 0 }])
        .rows.every(function (r) { return !!r.id; }));
    t('but a reference somebody did type is kept exactly as typed',
      M02.normalise(DB, 'orders', { id: 'SO-MINE', party: ids[0], date: '2026-07-01' }).id === 'SO-MINE');

    t('a good row is accepted',
      M02.validate(DB, 'orders', { id: 'SO-NEW', party: ids[0], date: '2026-07-01', amount: 1000, returned: 0 }).length === 0);

    /* ── the importer: nothing dropped silently, and no back door round the rules ── */
    var batch = M02.importRows(DB, 'tickets', [
      { id: 'T-900', party: ids[0], channel: 'Email', subject: 'Fine', opened: '2026-07-30T09:00', order: '' },
      { id: 'T-901', party: ids[0], channel: 'Email', subject: 'Wrong order', opened: '2026-07-30T09:00',
        order: DB.orders.filter(function (o) { return o.party !== ids[0]; })[0].id },
      { id: 'T-902', party: 'GHOST', channel: 'Email', subject: 'No such party', opened: '2026-07-30T09:00', order: '' }]);
    t('an import accepts the good rows', batch.rows.length === 1);
    t('an import refuses a ticket against somebody else’s order',
      batch.rejected.some(function (r) { return /belongs to/.test(r.why); }));
    t('an import refuses a ticket against a party that does not exist',
      batch.rejected.some(function (r) { return /no party "GHOST"/.test(r.why); }));
    t('every rejected row carries a line number and a reason',
      batch.rejected.every(function (r) { return r.line > 1 && r.why.length > 5; }));
    t('accepted plus rejected always equals what was in the file',
      batch.rows.length + batch.rejected.length === 3);

    /* ── the spreadsheet engine, checked on itself ── */
    var sheets = M02.sheetsOf(DB);
    t('every table exports as its own sheet', Object.keys(sheets).length === M02.TABLES.length);
    t('the first row of every sheet is its headings',
      M02.TABLES.every(function (tb) { return sheets[tb.label][0].join('|') === tb.cols.map(function (c) { return c.l; }).join('|'); }));
    var back = M02.importRows(DB, 'orders', SHEET.toObjects(sheets.Orders, M02.TBL.orders.cols).rows);
    t('what this app exports, this app can import again with nothing rejected',
      back.rejected.length === 0 && back.rows.length === DB.orders.length);
    t('the figures survive the round trip',
      r2(back.rows.reduce(function (s, x) { return s + num(x.amount) - num(x.returned); }, 0)) ===
      r2(DB.orders.reduce(function (s, x) { return s + num(x.amount) - num(x.returned); }, 0)));

    /* ── it carries all three apps ── */
    t('this app carries every screen of all three apps',
      ['dash', 'pipe', 'cust', 'person', 'segs'].every(function (v) { return !!SPEC.views[v]; }) &&
      ['docdash', 'docs'].every(function (v) { return !!SPEC.views[v]; }) &&
      ['deskdash', 'tickets', 'ticket'].every(function (v) { return !!SPEC.views[v]; }));
    t('its Customer 360 is the same function the CRM uses', SPEC.views.person === V.person);
    t('its documents screen is the same function Documents & eSign uses', SPEC.views.docs === V.docs);
    t('its ticket screen is the same function Helpdesk uses', SPEC.views.ticket === V.ticket);
    t('only this app can write records — it has Records and Files, the others do not',
      !!SPEC.views.records && !!SPEC.views.files);
    t('and unlike the CRM app, it can sign a document and answer a ticket',
      !!SPEC.actions.signdoc && !!SPEC.actions.replytkt);
  }
};

/* One handler for "a spreadsheet arrived", wired once. */
if (typeof document !== 'undefined') {
  var sheetIn = document.getElementById('sheetIn');
  if (sheetIn) sheetIn.addEventListener('change', function () {
    var f = sheetIn.files && sheetIn.files[0];
    if (!f) return;
    SHEET.readFile(f, function (sheets, names) { stagePending(f.name, sheets, names); }, function (msg) { toast(msg); });
  });
}
/* Work out what an uploaded file contains, check every row, and stage it — nothing is written
   until you have seen what will be accepted and what will not. */
function stagePending(fileName, sheets, names) {
  var DB = db(), out = [], rejected = [];
  names.forEach(function (n) {
    var rows = sheets[n] || [], table = M02.guessTable(n, rows);
    var entry = { sheet: n, table: table, total: Math.max(0, rows.length - 1), ok: 0, bad: 0, rows: [] };
    if (table) {
      var objs = SHEET.toObjects(rows, M02.TBL[table].cols).rows;
      var res = M02.importRows(DB, table, objs);
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

if (typeof module !== 'undefined' && module.exports) module.exports = SPEC;
if (typeof Medhava !== 'undefined' && Medhava.app) Medhava.app(SPEC);
