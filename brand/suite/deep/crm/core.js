/* Medhava — CRM & Customer 360 (Module 02 · App 1)

   Lead → contacted → quoted → negotiation → won, and then the same record carries the whole
   lifetime: every order, every return, what the customer is actually worth, and which of six
   behaviour groups they fall into.

   THE GATE THIS APP REFUSES ON: winning a deal produces ONE party, never a second copy of one
   you already have. Two records for one customer is how a business ends up with two different
   answers to "what are they worth" and nobody able to say which is right. Win a deal for an
   organisation already on the books and the win attaches to the record you have.

   And because this module has one spine, the customer record also carries what the other two
   apps know: every document filed against that party or its orders, and every question they
   have ever asked. Not copied here — read from there. That is what the timeline on Customer
   360 is, and it is the whole argument for these three being one module.

   Arithmetic from M02, screens from M02V. This app READS documents and tickets; it does not
   work them. Sending a document for signature and answering a ticket belong to the apps whose
   job that is. */
var K = typeof Medhava !== 'undefined' ? Medhava : {};
var H = K.H, esc = K.esc;
var CFG = (typeof CONFIG !== 'undefined') ? CONFIG : {};

var V = M02V.make(CFG, {
  edit: false,   /* it can win a deal and record a note; it cannot sign a document or answer a ticket */
  title: CFG.name,
  wiringTitle: 'Where every number on a customer record comes from',
  wiringSub: 'This app owns the leads and the conversation log. Everything else on the record is read from the module that owns it.',
  wiringPanels: function () {
    return H.panel('One record, from first enquiry to last order',
      '<div class="cascade">' +
      '<div class="cl"><span class="d">1</span><div>An enquiry arrives and becomes a <b>lead</b>, with a stage and a real probability.</div></div>' +
      '<div class="cl"><span class="d">2</span><div>You win it. The <b>same record</b> becomes the party — or attaches to the party you already had.</div></div>' +
      '<div class="cl"><span class="d">3</span><div>Orders arrive from Sales and the marketplaces. Worth, returns and last-order age are worked out, never typed.</div></div>' +
      '<div class="cl"><span class="d">4</span><div>Documents filed against them, and tickets they raise, appear on the same record.</div></div>' +
      '<div class="cl"><span class="d">5</span><div>Their behaviour group changes itself the moment any of that moves.</div></div>' +
      '</div>') +
    H.panel('What this app deliberately will not do',
      '<p>It shows documents and tickets; it does not <b>work</b> them. Sending an agreement for signature belongs to ' +
      '<b>Documents &amp; eSign</b>, and answering a question belongs to <b>Helpdesk &amp; Live Chat</b> — the apps whose ' +
      'rules those are.</p>' +
      '<p class="hint">Same records, same engine, different responsibilities. In the combined app of this module you get all three sets of buttons on one screen.</p>');
  }
});

/* The whole of what this app can DO. The kernel adds backup and connector buttons of its own
   on top of these; none of them is ours, and the last two self-tests below prove that not one
   of ours can sign a document or answer a ticket. */
var OWN = (function (A) {
  return { dismiss: A.dismiss, setparty: A.setparty, setseg: A.setseg, win: A.win, addnote: A.addnote };
})(M02V.actions(CFG));

var SPEC = {
  uses: ['channels', 'ledger', 'messaging', 'email', 'storage', 'automation'],
  id: CFG.id, name: CFG.name, company: CFG.company, fy: CFG.fy || 'FY 2026-27',
  tagline: CFG.tagline, about: CFG.about,
  groups: [{ label: 'Winning work', items: ['dash', 'pipe'] },
           { label: 'Customers', items: ['cust', 'person', 'segs'] },
           { label: 'Wiring', items: ['wiring'] }],
  nav: [{ v: 'dash', label: 'Overview', icon: 'grid' }, { v: 'pipe', label: 'Pipeline', icon: 'flow' },
        { v: 'cust', label: 'Customers', icon: 'users' }, { v: 'person', label: 'Customer 360', icon: 'doc' },
        { v: 'segs', label: 'Segments & offers', icon: 'spark' }, { v: 'wiring', label: 'Wiring', icon: 'flow' }],
  seed: function (DB) { M02.seed(DB, CFG); },
  views: { dash: V.dash, pipe: V.pipe, cust: V.cust, person: V.person, segs: V.segs, wiring: V.wiring },
  actions: OWN,

  tests: function (t, DB) {
    /* ── the pipeline ── */
    t('open, won and lost together are every lead',
      M02.openLeads(DB).length + M02.wonLeads(DB).length + M02.lostLeads(DB).length === DB.leads.length);
    t('open pipeline is the open deals added up',
      M02.pipelineValue(DB) === Math.round(M02.openLeads(DB).reduce(function (s, l) { return s + l.value; }, 0) * 100) / 100);
    t('the weighted pipeline is always smaller than the raw one',
      M02.weightedPipeline(DB) < M02.pipelineValue(DB) && M02.weightedPipeline(DB) > 0);
    t('each stage weights by its own odds',
      M02.byStage(DB).every(function (s) { return s.weighted === Math.round(s.value * s.prob) / 100 || s.n === 0 || Math.abs(s.weighted - s.value * s.prob / 100) < 0.01; }));
    t('win rate counts only settled deals, never the open ones',
      M02.winRate(DB) === Math.round(M02.wonLeads(DB).length / (M02.wonLeads(DB).length + M02.lostLeads(DB).length) * 100));
    t('every lost deal carries a reason', M02.lostLeads(DB).every(function (l) { return !!l.reason; }));
    t('the lost-reason totals add back up to the lost value',
      Math.round(M02.lostReasons(DB).reduce(function (s, r) { return s + r.value; }, 0) * 100) ===
      Math.round(M02.lostLeads(DB).reduce(function (s, l) { return s + l.value; }, 0) * 100));

    /* ── the duplicate-party gate ── */
    var before = DB.parties.length;
    var known = M02.openLeads(DB).filter(function (l) { return M02.findParty(DB, l.co); })[0];
    t('there is an open deal with an organisation already on the books', !!known);
    var res = M02.winLead(DB, known.id, CFG);
    t('winning it attaches to the record we already had', res.ok === true && res.reused === true);
    t('and does NOT create a second party', DB.parties.length === before);
    t('winning the same deal twice is refused', M02.winLead(DB, known.id, CFG).refused === true);
    var stranger = M02.openLeads(DB).filter(function (l) { return !M02.findParty(DB, l.co); })[0];
    var res2 = M02.winLead(DB, stranger.id, CFG);
    t('winning a genuinely new organisation does open a record', res2.ok === true && res2.reused === false);
    t('and the party count goes up by exactly one', DB.parties.length === before + 1);
    t('the won lead now points at the party it became',
      DB.leads.filter(function (l) { return l.id === stranger.id; })[0].party === res2.party);

    /* ── customer worth ── */
    var p = M02.profile(DB, DB.parties.filter(function (x) { return x.id === 'P1'; })[0]);
    t('customer worth is orders minus returns',
      p.value === Math.round((p.gross - p.returns) * 100) / 100);
    t('average order value is worth divided by orders', p.aov === Math.round(p.value / p.orders * 100) / 100);
    t('return % is returns over gross', p.rr === Math.round(p.returns / p.gross * 100));
    t('everybody added together is the total worth',
      Math.round(M02.profiles(DB).reduce(function (s, x) { return s + x.value; }, 0) * 100) / 100 === M02.totalValue(DB));
    t('the channel mix for one party adds back up to their worth',
      Math.round(M02.channelMix(DB, 'P1').reduce(function (s, c) { return s + c.kept; }, 0) * 100) / 100 === p.value);

    /* ── segments ── */
    t('every party lands in exactly one group',
      M02.profiles(DB).every(function (x) { return M02.SEGMENTS.indexOf(M02.segmentOf(x)) >= 0; }));
    t('the group counts add up to every party',
      M02.segCounts(DB).reduce(function (s, g) { return s + g.n; }, 0) === DB.parties.length);
    t('a party who has never ordered is New',
      M02.profiles(DB).filter(function (x) { return x.orders === 0; }).every(function (x) { return M02.segmentOf(x) === 'New'; }));
    t('a party quiet for over 180 days is Sleeping',
      M02.profiles(DB).filter(function (x) { return x.orders > 0 && x.lastAge > 180; }).every(function (x) { return M02.segmentOf(x) === 'Sleeping'; }));
    t('every group has an agreed action against it',
      M02.SEGMENTS.every(function (s) { return !!(CFG.offers || {})[s]; }));
    t('nobody is tagged by hand — no party record carries a group',
      DB.parties.every(function (x) { return x.segment === undefined && x.group === undefined; }));

    /* ── the spine: one record carries all three apps ── */
    t('a customer record shows the documents filed against them', M02.docsOfParty(DB, 'P1').length > 0);
    t('a customer record shows the questions they have asked', M02.ticketsOf(DB, 'P1').length > 0);
    var tl = M02.timeline(DB, 'P1');
    t('the timeline carries orders, documents, tickets and notes together',
      ['Order', 'Document', 'Ticket', 'Note'].every(function (k) { return tl.some(function (e) { return e.kind === k; }); }));
    t('the timeline is newest first', tl.every(function (e, i) { return i === 0 || tl[i - 1].at >= e.at; }));
    t('every order on that party appears on their timeline',
      M02.ordersOf(DB, 'P1').length === tl.filter(function (e) { return e.kind === 'Order'; }).length);

    /* ── what this app will not do ── */
    t('this app can do five things, and signing and answering are not among them',
      Object.keys(OWN).sort().join(',') === 'addnote,dismiss,setparty,setseg,win');
    t('none of them can sign a document or close a ticket',
      Object.keys(OWN).every(function (k) {
        return !/signDoc|closeTicket|sendDoc/.test(String(OWN[k])); }));
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = SPEC;
if (typeof Medhava !== 'undefined' && Medhava.app) Medhava.app(SPEC);
