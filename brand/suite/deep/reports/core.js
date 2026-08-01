/* Medhava — Report Builder (Module 01 · App 2)

   Pick a source, group it, filter it, sort it, run it. Saving keeps THE QUESTION, not the
   answer, so a report built today tells you about next month when you run it next month.

   The sources, the grouping, the filtering, every sum and every screen come from M01 and M01V —
   the same shared Module 01 engine and views the CEO Dashboard runs on. That is why "a report
   can never disagree with the dashboard" is a fact about the build rather than a promise in a
   manual: it is not two implementations that agree, it is one implementation used twice. */
var K = typeof Medhava !== 'undefined' ? Medhava : {};
var H = K.H, money = K.money, inr = K.inr, num = K.num, r2 = K.r2, esc = K.esc, toast = K.toast;
var CFG = (typeof CONFIG !== 'undefined') ? CONFIG : {};
var SRC = M01.SRC, SRCKEYS = M01.SRCKEYS, report = M01.report;

var V = M01V.make(CFG, {
  dialNote: 'These two decide which records a report can see at all. Filters below narrow what is left.',
  wiringTitle: 'Where every report gets its numbers',
  wiringSub: 'The Report Builder stores no figures of its own. It reads the shared Data Core live, every single time you press Run.',
  wiringPanels: function () {
    return H.panel('What happens when you press Run',
      '<div class="cascade">' +
      '<div class="cl"><span class="d">1</span><div>The chosen <b>source</b> is read fresh from the Data Core — never from a stored copy.</div></div>' +
      '<div class="cl"><span class="d">2</span><div>The <b>period and company</b> you picked decide which records are in scope at all.</div></div>' +
      '<div class="cl"><span class="d">3</span><div>Your <b>filters</b> drop the rows you did not want.</div></div>' +
      '<div class="cl"><span class="d">4</span><div>What is left is <b>grouped</b>, added up and sorted — then trimmed to your Top N, though the Total still counts every matching row.</div></div>' +
      '<div class="cl"><span class="d">5</span><div>Saving keeps the <b>question</b>, not the answer. Next month the same report shows next month\u2019s numbers.</div></div>' +
      '</div>') +
    H.panel('Why the numbers always agree with the dashboard',
      '<p>Both apps are built from the <b>same engine file</b>. Not similar code — the same code. A Sales report grouped by channel with no filters adds up to exactly the net sales figure on the CEO Dashboard for the same period and the same company.</p>' +
      '<p class="hint">This is checked automatically — see <b>Backup &amp; Health</b>, where the self-tests prove that grouping never changes a total.</p>');
  }
});

/* Reports read the books and the channels, and go out as a file, an email or a print. */
var SPEC = {
  uses: ['ledger', 'channels', 'storage', 'email', 'printing'],
  id: CFG.id, name: CFG.name, company: CFG.company, fy: CFG.fy || 'FY 2026-27',
  tagline: CFG.tagline, about: CFG.about,
  groups: [{ label: 'Reports', items: ['build', 'lib', 'saved'] },
           { label: 'Wiring', items: ['wiring'] }],
  nav: [{ v: 'build', label: 'Build a report', icon: 'chart' }, { v: 'lib', label: 'Ready-made', icon: 'book' },
        { v: 'saved', label: 'My saved reports', icon: 'save' }, { v: 'wiring', label: 'Wiring', icon: 'flow' }],
  seed: function (DB) { M01.seed(DB, CFG); DB.draft = M01.defaultDef('sales'); DB.saved = []; },
  views: { build: V.build, lib: V.lib, saved: V.saved, wiring: V.wiring },
  actions: M01V.actions(CFG),

  tests: function (t, DB) {
    DB.period = '2026-07'; DB.co = 'all';
    var d = M01.defaultDef('sales'), rep = report(DB, d);
    var chCount = M01.byChannel(DB).length;
    t('sales source has one row per company per channel per month',
      SRC.sales.rows(DB).length === M01.rows(DB, 'sales').length);
    t('grouping by channel gives one row per channel', rep.rows.length === chCount);
    t('grouped totals equal the ungrouped total',
      r2(rep.rows.reduce(function (s, r) { return s + r.v.net; }, 0)) === rep.total.v.net);
    t('net = gross − returns on every row',
      SRC.sales.rows(DB).every(function (r) { return r.net === r2(r.gross - r.returns); }));
    t('sorted biggest first', rep.rows.every(function (r, i) { return i === 0 || rep.rows[i - 1].v.net >= r.v.net; }));
    var asc = report(DB, { src: 'sales', group: 'channel', sort: 'net', dir: 'asc', limit: 0, filters: [] });
    t('sorting smallest first reverses the order', asc.rows[0].label === rep.rows[rep.rows.length - 1].label);
    var top3 = report(DB, { src: 'sales', group: 'channel', sort: 'net', dir: 'desc', limit: 3, filters: [] });
    t('Top 3 shows exactly 3 rows', top3.rows.length === 3);
    t('Top 3 still totals ALL matching rows, not just 3', top3.total.v.net === rep.total.v.net);
    var f1 = report(DB, { src: 'sales', group: 'channel', sort: 'net', dir: 'desc', limit: 0,
      filters: [{ field: 'channel', op: 'is', val: CFG.channels[0] }] });
    t('a filter cuts the records down', f1.matched < rep.matched && f1.matched > 0);
    t('filtering to one channel leaves one group', f1.rows.length === 1);
    var f2 = report(DB, { src: 'sales', group: 'monthLabel', sort: 'net', dir: 'desc', limit: 0,
      filters: [{ field: 'gross', op: '>=', val: 80000 }] });
    t('a number filter (gross ≥ 80,000) works', f2.matched > 0 && f2.matched < rep.scanned);
    t('"contains" matches part of a word',
      report(DB, { src: 'sales', group: 'channel', sort: 'net', dir: 'desc', limit: 0,
        filters: [{ field: 'channel', op: 'contains', val: String(CFG.channels[0]).slice(0, 4).toLowerCase() }] }).matched > 0);
    t('"is not" is the opposite of "is"',
      report(DB, { src: 'sales', group: 'channel', sort: 'net', dir: 'desc', limit: 0,
        filters: [{ field: 'channel', op: 'is not', val: CFG.channels[0] }] }).matched === rep.scanned - f1.matched);

    /* the two dials belong to the report engine too, not just the dashboard */
    t('a report obeys the period', report(M01.scope(DB, '2026-04', 'all'), d).total.v.net !== rep.total.v.net);
    var ids = M01.coIds(DB);
    t('a report obeys the company',
      r2(ids.reduce(function (s, id) { return s + report(M01.scope(DB, '2026-07', id), d).total.v.net; }, 0)) === rep.total.v.net);
    t('grouping by company gives one row per company',
      report(DB, { src: 'sales', group: 'company', sort: 'net', dir: 'desc', limit: 0, filters: [] }).rows.length === ids.length);
    t('grouping by company or by channel gives the same total',
      report(DB, { src: 'sales', group: 'company', sort: 'net', dir: 'desc', limit: 0, filters: [] }).total.v.net === rep.total.v.net);

    var mo = report(DB, { src: 'money', group: 'type', sort: 'amount', dir: 'desc', limit: 0, filters: [] });
    t('money report: "to collect" equals the receivables total',
      mo.rows.filter(function (r) { return r.label === 'To collect'; })[0].v.amount ===
        r2(DB.receivables.reduce(function (s, x) { return s + x.amount; }, 0)));
    var st = report(DB, { src: 'stock', group: 'name', sort: 'value', dir: 'desc', limit: 0, filters: [] });
    t('stock report values every item at qty × cost',
      st.total.v.value === r2(DB.stock.reduce(function (s, x) { return s + x.qty * x.cost; }, 0)));
    t('items at or below reorder are flagged "Reorder now"',
      SRC.stock.rows(DB).filter(function (r) { return r.status === 'Reorder now'; }).length ===
        DB.stock.filter(function (x) { return x.qty <= x.rop; }).length);
    var ex = report(DB, { src: 'expenses', group: 'cat', sort: 'amount', dir: 'desc', limit: 0, filters: [] });
    t('running costs by head add up to the same total',
      r2(ex.rows.reduce(function (s, r) { return s + r.v.amount; }, 0)) === ex.total.v.amount);
    var pu = report(DB, { src: 'purchases', group: 'party', sort: 'amount', dir: 'desc', limit: 0, filters: [] });
    t('purchases report totals the same as the dashboard’s purchases line', pu.total.v.amount === M01.purchases(DB));
    var ung = report(DB, { src: 'sales', group: 'none', sort: 'net', dir: 'desc', limit: 0, filters: [] });
    t('"do not group" shows every single record', ung.rows.length === rep.scanned);
    t('ungrouped and grouped give the same total', ung.total.v.net === rep.total.v.net);

    /* the promise the whole module rests on */
    t('a report grouped by channel equals the dashboard’s net sales', rep.total.v.net === M01.netSales(DB));

    var lines = M01.csvOf(rep, d).split('\n');
    t('CSV has a header, every row, and a total line', lines.length === rep.rows.length + 2);
    t('CSV wraps anything containing a comma in quotes',
      M01.csvOf(report(DB, { src: 'money', group: 'party', sort: 'amount', dir: 'desc', limit: 0, filters: [] }),
        { src: 'money', group: 'party' }).indexOf('"') >= 0 || CFG.parties.r.join('').indexOf(',') < 0);
    t('every ready-made report runs without error', (CFG.templates || []).every(function (tp) {
      try { return report(DB, tp.def).matched >= 0; } catch (e) { return false; } }));
    t('every ready-made report returns at least one row', (CFG.templates || []).every(function (tp) {
      return report(DB, tp.def).rows.length > 0; }));
    DB.saved = DB.saved || []; DB.saved.push({ name: 'probe', def: M01.defaultDef('sales') });
    t('a saved report reruns to the same answer',
      report(DB, DB.saved[DB.saved.length - 1].def).total.v.net === rep.total.v.net);
    t('all six sources return rows', SRCKEYS.every(function (k) { return SRC[k].rows(DB).length > 0; }));
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = SPEC;
if (typeof Medhava !== 'undefined' && Medhava.app) Medhava.app(SPEC);
