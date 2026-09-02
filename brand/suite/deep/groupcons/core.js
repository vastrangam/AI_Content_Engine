/* Medhava — Group Consolidation (Module 01 · App 3)

   Several companies, one set of figures. Three things have to be true before a group total
   means anything, and each of them is enforced in the engine rather than described in a manual:

     1. WHAT YOUR COMPANIES BILLED EACH OTHER COMES BACK OUT. A group cannot sell to itself.
        The bill is real for the company that raised it and real for the company that paid it;
        it is not revenue for the group, and adding it in would inflate every share you quote.

     2. A COMPANY WITH NO TAX REGISTRATION IS STILL A COMPANY. A job-work arm, a venture not
        registered yet — it counts in every group figure, and it is REFUSED entry to a tax
        return. Those are two different questions and the software answers both correctly.

     3. A NAME YOU SELL UNDER IS NOT A COMPANY. Two seller names on one marketplace do not make
        two businesses. Turning one into a company is refused, because it would count the same
        orders twice in every figure on this screen.

   The arithmetic comes from M01 and the screens from M01V — the same shared files the CEO
   Dashboard and the Report Builder are built from. */
var K = typeof Medhava !== 'undefined' ? Medhava : {};
var H = K.H, esc = K.esc, r2 = K.r2;
var CFG = (typeof CONFIG !== 'undefined') ? CONFIG : {};

var V = M01V.make(CFG, {
  co: false,   /* no company switcher: this app's whole job is all of them at once */
  wiringTitle: 'Where every group figure comes from',
  wiringSub: 'This app owns no records. It reads the same Data Core as every other app and rolls it up.',
  wiringPanels: function () {
    var DB = K.DB;
    return H.panel('The three rules, in one place',
      '<div class="cascade">' +
      '<div class="cl"><span class="d">1</span><div><b>Internal billing comes out.</b> A group cannot sell to itself. It is removed from group sales and group purchases, and it never touches group profit.</div></div>' +
      '<div class="cl"><span class="d">2</span><div><b>No registration is not no company.</b> It counts in every group figure; it is refused a return.</div></div>' +
      '<div class="cl"><span class="d">3</span><div><b>A trading name is not a company.</b> Its orders are the sales of the company it belongs to, counted once.</div></div>' +
      '</div>') +
    H.panel('How many companies you may have',
      '<p><b>The software sets no limit.</b> Twenty companies, or two. What limits you is the plan you are on — currently <b>' +
      esc((DB.plan && DB.plan.name) || 'Enterprise') + '</b>, which covers <b>' + ((DB.plan && DB.plan.companyCap) || 20) + '</b>.</p>' +
      '<p class="hint">That distinction matters when you are choosing software: a cap written into the product is a rebuild, and a cap written into a plan is a decision you can change on a Tuesday.</p>');
  }
});

/* It reads the books and the channels, files (or refuses to file) a return, and prints. */
var SPEC = {
  uses: ['ledger', 'channels', 'gst', 'storage', 'printing'],
  id: CFG.id, name: CFG.name, company: CFG.company, fy: CFG.fy || 'FY 2026-27',
  tagline: CFG.tagline, about: CFG.about,
  groups: [{ label: 'The group', items: ['group', 'compare', 'internal'] },
           { label: 'Set up', items: ['cos', 'returns'] },
           { label: 'Wiring', items: ['wiring'] }],
  nav: [{ v: 'group', label: 'Group figures', icon: 'layers' }, { v: 'compare', label: 'Company by company', icon: 'chart' },
        { v: 'internal', label: 'Between your companies', icon: 'sync' },
        { v: 'cos', label: 'Companies & names', icon: 'store' }, { v: 'returns', label: 'Who may file', icon: 'shield' },
        { v: 'wiring', label: 'Wiring', icon: 'flow' }],
  seed: function (DB) { M01.seed(DB, CFG); DB.lastRefusal = null; DB.lastReturn = null; },
  views: { group: V.group, compare: V.compare, internal: V.internal, cos: V.cos, returns: V.returns, wiring: V.wiring },
  actions: M01V.actions(CFG),

  tests: function (t, DB) {
    DB.period = '2026-07'; DB.co = 'all';
    var per = M01.perCompany(DB), g = M01.groupFigures(DB), ids = M01.coIds(DB);

    /* rule 1 — internal billing */
    t('group net sales = every company added up, minus internal billing',
      g.net === r2(g.addedNet - g.eliminated));
    t('removing internal billing never changes group profit',
      g.profit === r2(per.reduce(function (s, c) { return s + c.profit; }, 0)));
    t('group sales after removal equal what was sold outside the group',
      g.gross === M01.externalGross(M01.scope(DB, DB.period, 'all')));
    t('every internal invoice has a company on both sides',
      M01.interco(DB).every(function (x) { return ids.indexOf(x.from) >= 0 && ids.indexOf(x.to) >= 0 && x.from !== x.to; }));
    t('internal billing is on its own channel, never mixed into a real one',
      M01.rows(M01.scope(DB, DB.period, 'all'), 'sales')
        .filter(function (x) { return M01.isInternal(DB, x.channel); })
        .reduce(function (s, x) { return r2(s + x.gross); }, 0) === g.eliminated);

    /* rule 2 — a company with no registration */
    var unreg = per.filter(function (c) { return !c.registered; })[0];
    t('there is a company with no tax registration in the group', !!unreg);
    t('a company with no registration still counts in the group figures', unreg && unreg.net > 0);
    var refused = M01.gstReturn(DB, unreg.id);
    t('asking for its return is refused, not warned about', refused.ok === false && refused.refused === true);
    t('the refusal says why, in words a person can act on',
      /no tax registration/.test(refused.reason) && /still count/.test(refused.reason));
    var reg = per.filter(function (c) { return c.registered; })[0];
    t('a registered company can build its return', M01.gstReturn(DB, reg.id).ok === true);
    t('its return uses its own figures, not the group’s',
      M01.gstReturn(DB, reg.id).net === reg.net && reg.net !== g.net);

    /* rule 3 — a trading name is not a company */
    t('there is at least one trading name on file', (DB.brands || []).length > 0);
    t('every trading name belongs to a company that exists',
      (DB.brands || []).every(function (b) { return ids.indexOf(b.co) >= 0; }));
    var brand = DB.brands[DB.brands.length - 1];
    var asCo = M01.addCompany(DB, { id: 'XX', name: brand.name });
    t('turning a trading name into a company is refused', asCo.ok === false && asCo.refused === true);
    t('the company list did not grow when that was refused', DB.companies.length === per.length);

    /* the plan, not the software, is what limits you */
    t('the plan names a company limit and it is more than one', (DB.plan.companyCap || 0) > 1);
    var saved = DB.plan.companyCap; DB.plan.companyCap = DB.companies.length;
    var capped = M01.addCompany(DB, { id: 'ZZ', name: 'One company too many' });
    t('adding past the plan limit is refused', capped.ok === false && capped.refused === true);
    t('the refusal blames the plan, not the software',
      /plan/.test(capped.reason) && /no limit of its own/.test(capped.reason));
    DB.plan.companyCap = saved;
    var added = M01.addCompany(DB, { id: 'ZZ', name: 'A brand new venture', gstin: '' });
    t('a company can be added once there is room', added.ok === true);
    t('a company added with no registration is accepted as a company',
      DB.companies[DB.companies.length - 1].gstin === '');
    t('two companies can never share a code',
      M01.addCompany(DB, { id: 'ZZ', name: 'Another one' }).ok === false);
    DB.companies.pop();

    /* the period dial, here too */
    var yr = M01.groupFigures(M01.scope(DB, 'all', 'all'));
    t('the group figures obey the period', yr.net > g.net);
    t('every month added up equals the full year',
      r2(M01.MONTHS.reduce(function (s, m) { return s + M01.groupFigures(M01.scope(DB, m, 'all')).net; }, 0)) === yr.net);
    t('group cash is a position — it does not move with the period', yr.cash === g.cash);
    t('group figures equal the dashboard when one company is picked',
      M01.perCompany(DB)[0].net === M01.netSales(M01.scope(DB, DB.period, ids[0])));
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = SPEC;
if (typeof Medhava !== 'undefined' && Medhava.app) Medhava.app(SPEC);
