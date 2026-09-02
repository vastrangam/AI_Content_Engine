/* Medhava — CEO Dashboard (Module 01 · App 1)

   The one screen to look at each morning. It answers three questions — did we make money, is
   the cash safe, what needs me today — and nothing else.

   It writes nothing. Clearing an alert is the only thing it ever stores, and that is kept apart
   from your records. A dashboard that can change your books is a dashboard you cannot audit.

   Not one line of arithmetic and not one screen live in this file. The figures come from M01,
   the shared Module 01 engine; the screens come from M01V, the shared Module 01 views. Both are
   compiled unchanged into the Report Builder, Group Consolidation and the combined Module 01
   app. That is why a report can never disagree with this screen: there is one set of sums and
   one set of screens in the module, not four that resemble each other.

   Two dials control everything: WHICH PERIOD and WHICH COMPANY. Flow figures obey both.
   Balances obey only the company, because "cash for June" is not a thing. */
var K = typeof Medhava !== 'undefined' ? Medhava : {};
var H = K.H, esc = K.esc, r2 = K.r2;
var CFG = (typeof CONFIG !== 'undefined') ? CONFIG : {};

var V = M01V.make(CFG, {
  title: CFG.name,
  wiringSub: 'The dashboard owns no data of its own. It reads the shared Data Core and shows you the result.',
  wiringPanels: function () {
    return H.panel('Live example — one sale',
      '<div class="cascade">' +
      '<div class="cl"><span class="d">1</span><div>A sale is recorded in <b>' + esc((CFG.channels || [])[0] || 'a channel') + '</b>, against one of your companies.</div></div>' +
      '<div class="cl"><span class="d">2</span><div>→ <b>Net sales</b> and the channel table move immediately — for that company, and for the group.</div></div>' +
      '<div class="cl"><span class="d">3</span><div>→ <b>Stock</b> falls; if it crosses the reorder point an alert appears here.</div></div>' +
      '<div class="cl"><span class="d">4</span><div>→ <b>Money</b>: the customer balance is added to "to collect".</div></div>' +
      '<div class="cl"><span class="d">5</span><div>→ <b>Net profit</b> recalculates: net sales − purchases − wages − expenses.</div></div>' +
      '</div>') +
    H.panel('This dashboard writes nothing',
      '<p>It is a <b>read-only view</b> of the business. Clearing an alert is the only thing stored, and only for you.</p>' +
      '<p class="hint">That is deliberate: a dashboard that can change your books is a dashboard you cannot trust.</p>' +
      '<p>The arithmetic behind every figure above is the <b>same code</b> that runs the Report Builder and Group Consolidation — not a copy of it, the same code. That is why the three can never disagree.</p>');
  }
});

/* The Dashboard reads figures from the books and the sales channels, and can print or back up.
   Each of those is a capability with alternatives — see the Connectors screen. */
/* The whole of what this app can DO. Four things: change the period, change the company,
   clear an alert, un-clear them all. The kernel adds backup and connector actions of its own
   on top of these; none of them is ours and none of them touches a record either. */
var OWN = (function (A) {
  return { setp: A.setp, setco: A.setco, clear: A.clear, unclear: A.unclear };
})(M01V.actions(CFG));

var SPEC = {
  uses: ['ledger', 'channels', 'storage', 'printing'],
  id: CFG.id, name: CFG.name, company: CFG.company, fy: CFG.fy || 'FY 2026-27',
  tagline: CFG.tagline, about: CFG.about,
  groups: [{ label: 'Command', items: ['dash', 'sales', 'money'] },
           { label: 'Operations', items: ['stock', 'companies', 'alerts'] },
           { label: 'Wiring', items: ['wiring'] }],
  nav: [{ v: 'dash', label: 'Overview', icon: 'grid' }, { v: 'sales', label: 'Sales & Channels', icon: 'chart' },
        { v: 'money', label: 'Money', icon: 'coin' }, { v: 'stock', label: 'Stock & Making', icon: 'box' },
        { v: 'companies', label: 'Companies', icon: 'store' },
        { v: 'alerts', label: 'Alerts', icon: 'bell' }, { v: 'wiring', label: 'Wiring', icon: 'flow' }],
  seed: function (DB) { M01.seed(DB, CFG); },
  views: { dash: V.dash, sales: V.sales, money: V.money, stock: V.stock,
           companies: V.companies, alerts: V.alerts, wiring: V.wiring },
  /* Only the four that read, clear or re-scope. Nothing here can write a record — and the last
     self-test below proves it by reading the code of each one. */
  actions: OWN,

  tests: function (t, DB) {
    DB.period = '2026-07'; DB.co = 'all';
    t('net sales = gross − returns', M01.netSales(DB) === r2(M01.grossSales(DB) - M01.returnsVal(DB)));
    t('July sales outside the group = 676000', M01.externalGross(DB) === 238000 + 164000 + 127000 + 92000 + 55000);
    t('gross profit = net sales − purchases − wages',
      M01.grossProfit(DB) === r2(M01.netSales(DB) - M01.purchases(DB) - M01.wages(DB)));
    t('net profit = gross profit − expenses', M01.netProfit(DB) === r2(M01.grossProfit(DB) - M01.expenses(DB)));
    t('channel net totals equal overall net sales',
      r2(M01.byChannel(DB).reduce(function (s, c) { return s + c.net; }, 0)) === M01.netSales(DB));

    DB.period = 'all'; var allGross = M01.grossSales(DB);
    DB.period = '2026-04'; var m4 = M01.grossSales(DB);
    DB.period = '2026-05'; var m5 = M01.grossSales(DB);
    DB.period = '2026-06'; var m6 = M01.grossSales(DB);
    DB.period = '2026-07'; var m7 = M01.grossSales(DB);
    t('period filter works: months add up to all', r2(m4 + m5 + m6 + m7) === allGross);
    t('switching period changes the numbers', m4 !== m7);

    /* the company dial — the second thing every figure obeys */
    var ids = M01.coIds(DB), each = 0;
    ids.forEach(function (id) { DB.co = id; each = r2(each + M01.netSales(DB)); });
    DB.co = 'all';
    t('every company added together equals the group', each === M01.netSales(DB));
    t('the company filter never invents or loses a record',
      ids.reduce(function (s, id) { DB.co = id; var n = M01.rows(DB, 'sales').length; DB.co = 'all'; return s + n; }, 0)
        === M01.rows(DB, 'sales').length);
    DB.co = ids[0]; var oneCo = M01.netSales(DB); DB.co = 'all';
    t('switching company changes the numbers', oneCo !== M01.netSales(DB) && oneCo > 0);
    DB.co = ids[0]; var coCash = M01.cash(DB), coStock = M01.stockValue(DB);
    DB.period = '2026-04';
    t('a balance ignores the period but not the company', M01.cash(DB) === coCash && M01.stockValue(DB) === coStock);
    DB.period = '2026-07'; DB.co = 'all';

    t('stock value = qty × cost',
      M01.stockValue(DB) === r2(DB.stock.reduce(function (s, x) { return s + x.qty * x.cost; }, 0)));
    t('low stock list only items at/below reorder', M01.lowStock(DB).every(function (x) { return x.qty <= x.rop; }));
    t('receivables total = sum of balances',
      M01.receivable(DB) === r2(DB.receivables.reduce(function (s, x) { return s + x.amount; }, 0)));
    t('alerts are raised for every low-stock item', M01.lowStock(DB).every(function (it) {
      return M01.alerts(DB).some(function (a) { return a.id === 'stock-' + it.sku + '-' + it.co; }); }));
    t('an overdue receivable (>30d) raises an alert',
      M01.alerts(DB).some(function (a) { return a.id.indexOf('rec-') === 0; }));
    var before = M01.alerts(DB).length, first = M01.alerts(DB)[0];
    DB.resolved[first.id] = 1;
    t('clearing an alert removes it', M01.alerts(DB).length === before - 1);
    t('cash balance is a real position, not a period figure', M01.cash(DB) > 0);
    t('a company with no tax registration still counts in the figures',
      M01.perCompany(DB).some(function (c) { return !c.registered && c.net > 0; }));
    t('this app can do exactly four things, and none of them is writing',
      Object.keys(OWN).sort().join(',') === 'clear,setco,setp,unclear');
    t('not one of them can add, change or delete a record',
      Object.keys(OWN).every(function (k) {
        return !/\.push\(|\.splice\(|importRows|addCompany|\bdelete\b/.test(String(OWN[k])); }));
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = SPEC;
if (typeof Medhava !== 'undefined' && Medhava.app) Medhava.app(SPEC);
