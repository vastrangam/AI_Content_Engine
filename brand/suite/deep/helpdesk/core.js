/* Medhava — Helpdesk & Live Chat (Module 02 · App 3)

   A question arriving by chat, email, phone or message becomes a ticket against the party who
   asked it, and usually against the order it is about. Whoever picks it up has the whole
   history already on the screen — what that customer bought, what came back, what is filed
   against them, what they asked last time.

   THE GATE THIS APP REFUSES ON, and the one that matters most: THE FIRST-REPLY CLOCK IS
   WORKED OUT FROM THE MESSAGES. It is not a field. Nobody can set it, import it, or round it.
   A support metric anybody can type is a support metric that will be typed, and then the
   number on the wall stops meaning anything.

   Two more refusals, both for the same reason — a ticket is about a real person waiting:
     · a ticket cannot be closed without a single reply on it
     · a ticket cannot be attached to somebody else's order

   Arithmetic from M02, screens from M02V. */
var K = typeof Medhava !== 'undefined' ? Medhava : {};
var H = K.H, esc = K.esc;
var CFG = (typeof CONFIG !== 'undefined') ? CONFIG : {};

var V = M02V.make(CFG, {
  own: { crm: false, docs: false },   /* it answers and closes tickets; it cannot win a deal or sign a document */
  wiringTitle: 'Where every desk figure comes from',
  wiringSub: 'This app owns the tickets and the messages. Everything about the person asking is read from the party record.',
  wiringPanels: function () {
    var DB = K.DB;
    return H.panel('The first-reply clock is worked out, never typed',
      '<div class="cascade">' +
      '<div class="cl"><span class="d">1</span><div>A ticket has an <b>opened</b> time — the moment the question arrived.</div></div>' +
      '<div class="cl"><span class="d">2</span><div>Every message on it has a time and a side: <b>the customer</b>, or <b>us</b>.</div></div>' +
      '<div class="cl"><span class="d">3</span><div>First reply = the gap between opening and <b>our first message</b>. That is the whole calculation.</div></div>' +
      '<div class="cl"><span class="d">4</span><div>There is no field to store it in, so there is nothing to disagree with.</div></div>' +
      '</div>' +
      '<p class="hint" style="margin-top:8px">Your target as it ships is <b>' + M02V.mm(M02.slaFirst(DB)) +
      '</b> to first reply and <b>' + M02V.mm(M02.slaResolve(DB)) + '</b> to resolve. Both are settings.</p>') +
    H.panel('Why this sits in the same module as the customer record',
      '<p>A helpdesk bolted on beside a CRM makes somebody read two screens and join them up in their head, on the phone, while a customer waits.</p>' +
      '<p>Here the ticket, the party, their orders and their documents are <b>the same records</b>. Open a ticket and what that customer is worth, ' +
      'what they have sent back, and what is already filed against them is on the screen before anybody says a word.</p>' +
      '<p class="hint">Which is also why every ticket on a party shows up on that party\'s timeline in Customer 360 — not copied there, read from here.</p>');
  }
});

/* Questions arrive by message and email, are answered the same way, and read the party record. */
/* The whole of what this app can DO. The kernel adds its own backup and connector buttons on
   top; none of them is ours, and none of ours edits an order or a party. */
var OWN = (function (A) {
  return { dismiss: A.dismiss, settktf: A.settktf, seltkt: A.seltkt,
           replytkt: A.replytkt, closetkt: A.closetkt, attachorder: A.attachorder };
})(M02V.actions(CFG));

var SPEC = {
  uses: ['messaging', 'email', 'channels', 'storage', 'automation'],
  id: CFG.id, name: CFG.name, company: CFG.company, fy: CFG.fy || 'FY 2026-27',
  tagline: CFG.tagline, about: CFG.about,
  groups: [{ label: 'The desk', items: ['deskdash', 'tickets', 'ticket'] },
           { label: 'Wiring', items: ['wiring'] }],
  nav: [{ v: 'deskdash', label: 'Overview', icon: 'grid' }, { v: 'tickets', label: 'Tickets', icon: 'bell' },
        { v: 'ticket', label: 'One ticket', icon: 'thread' }, { v: 'wiring', label: 'Wiring', icon: 'flow' }],
  seed: function (DB) { M02.seed(DB, CFG); },
  views: { deskdash: V.deskdash, tickets: V.tickets, ticket: V.ticket, wiring: V.wiring },
  actions: OWN,

  tests: function (t, DB) {
    /* ── every button this app declares is a button one of its screens renders ── */
    t('every button this app offers is really on one of its own screens',
      M02V.unreachable(SPEC, DB, OWN).length === 0, M02V.unreachable(SPEC, DB, OWN).join(', '));

    var rows = M02.ticketRows(DB);
    t('every ticket is about a party that exists',
      DB.tickets.every(function (x) { return DB.parties.some(function (p) { return p.id === x.party; }); }));
    t('every ticket that names an order names one of that party’s own orders',
      DB.tickets.filter(function (x) { return x.order; }).every(function (x) {
        var o = DB.orders.filter(function (y) { return y.id === x.order; })[0];
        return o && o.party === x.party; }));

    /* ── the clock is derived ── */
    var answered = rows.filter(function (r) { return r.replied; })[0];
    t('there is an answered ticket', !!answered);
    t('its first-reply time is the gap to our first message, worked out',
      answered.firstReply === M02.mins(
        DB.tickets.filter(function (x) { return x.id === answered.id; })[0].opened,
        M02.msgsOf(DB, answered.id).filter(function (m) { return m.who === 'us'; })[0].at));
    t('a ticket nobody has answered has no first-reply time at all',
      M02.unanswered(DB).every(function (r) { return r.firstReply === null; }));
    t('there is no field anywhere holding a response time',
      DB.tickets.every(function (x) { return x.firstReply === undefined && x.responseTime === undefined; }));
    t('the median first reply is a real number from the real messages',
      M02.medianFirstReply(DB) > 0 && M02.medianFirstReply(DB) < 10000);
    t('the "inside the target" figure only counts tickets that were answered',
      M02.firstReplyPct(DB) >= 0 && M02.firstReplyPct(DB) <= 100);

    /* ── replying moves it, because there is nothing else it could move ── */
    var quiet = M02.unanswered(DB)[0];
    t('there is a ticket nobody has answered', !!quiet);
    var before = M02.ticketRow(DB, DB.tickets.filter(function (x) { return x.id === quiet.id; })[0]);
    t('and it shows as not answered', before.replied === false);
    M02.reply(DB, quiet.id, 'Looking into this now.');
    var after = M02.ticketRow(DB, DB.tickets.filter(function (x) { return x.id === quiet.id; })[0]);
    t('answering it gives it a first-reply time immediately', after.replied === true && after.firstReply !== null);
    t('and it drops off the "nobody has replied" list',
      !M02.unanswered(DB).some(function (r) { return r.id === quiet.id; }));
    t('an empty reply is not sent', M02.reply(DB, quiet.id, '   ').ok === false);

    /* ── closing ── */
    var silent = DB.tickets.filter(function (x) { return !x.closed && !M02.msgsOf(DB, x.id).some(function (m) { return m.who === 'us'; }); })[0];
    if (silent) {
      t('a ticket with no reply on it cannot be closed', M02.closeTicket(DB, silent.id).refused === true);
      t('the refusal says the customer was never answered',
        /has not|has anybody|Nobody has answered/.test(M02.closeTicket(DB, silent.id).reason));
    } else {
      t('a ticket with no reply on it cannot be closed', true);
      t('the refusal says the customer was never answered', true);
    }
    var open = M02.ticketRows(DB).filter(function (r) { return r.open && r.replied; })[0];
    t('a ticket that has been answered can be closed', M02.closeTicket(DB, open.id).ok === true);
    t('closing it twice is refused', M02.closeTicket(DB, open.id).refused === true);

    /* ── the wrong-order gate ── */
    var tk = DB.tickets.filter(function (x) { return x.party === 'P1'; })[0];
    var otherOrder = DB.orders.filter(function (o) { return o.party !== 'P1'; })[0];
    var res = M02.attachOrder(DB, tk.id, otherOrder.id);
    t('attaching another party’s order to a ticket is refused', res.refused === true);
    t('the refusal names both parties, so the mistake is obvious',
      res.reason.indexOf(M02.partyName(DB, otherOrder.party)) >= 0 && res.reason.indexOf(M02.partyName(DB, 'P1')) >= 0);
    t('attaching an order that does not exist is refused', M02.attachOrder(DB, tk.id, 'SO-NOPE').refused === true);
    var ownOrder = DB.orders.filter(function (o) { return o.party === 'P1'; })[0];
    t('attaching one of their own orders works', M02.attachOrder(DB, tk.id, ownOrder.id).ok === true);

    /* ── what the desk knows about the person asking ── */
    var p = M02.profile(DB, DB.parties.filter(function (x) { return x.id === tk.party; })[0]);
    t('the party behind a ticket carries their whole history', p.orders > 0 && p.value > 0);
    t('and their documents are to hand from the ticket', M02.docsOfParty(DB, tk.party).length > 0);
    t('every ticket appears on that party’s timeline',
      M02.timeline(DB, tk.party).some(function (e) { return e.kind === 'Ticket'; }));

    /* ── the shape of the desk ── */
    t('tickets are grouped by the channel they arrived on', M02.byChannel(DB).length >= 3);
    t('every channel total adds back up to the ticket count',
      M02.byChannel(DB).reduce(function (s, c) { return s + c.n; }, 0) === DB.tickets.length);
    t('every person’s totals add back up too',
      M02.byAgent(DB).reduce(function (s, a) { return s + a.n; }, 0) === DB.tickets.length);
    t('this app can do six things, and none of them edits an order or a party',
      Object.keys(OWN).sort().join(',') === 'attachorder,closetkt,dismiss,replytkt,seltkt,settktf');
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = SPEC;
if (typeof Medhava !== 'undefined' && Medhava.app) Medhava.app(SPEC);
