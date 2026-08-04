/* Medhava — Module 02 · the shared screens.

   m02lib.js holds the arithmetic and the rules. This file holds the SCREENS, for the same
   reason: the CRM's Customer 360 and the combined app's Customer 360 are not two screens
   that look alike, they are one screen compiled into two files.

   Each app calls M02V.make(CFG, options) and takes the screens it wants. */
var M02V = (function () {
  'use strict';
  var K = (typeof Medhava !== 'undefined') ? Medhava : {};
  var H = K.H || {}, money = K.money, inr = K.inr, num = K.num, r2 = K.r2, esc = K.esc, toast = K.toast;
  function db() { return K.DB; }
  function segTag(seg) {
    var t = { 'Champion': 'grn', 'Loyal': 'grn', 'Needs attention': 'amb', 'At risk': 'red', 'Sleeping': 'red', 'New': 'blu' };
    return H.tag(seg, t[seg] || 'gray');
  }
  function docTag(s) {
    var t = { draft: 'gray', sent: 'amb', signed: 'grn', declined: 'red', filed: 'blu' };
    return H.tag(s, t[s] || 'gray');
  }
  function mm(v) { return v === null || v === undefined ? '—' : (v < 90 ? v + ' min' : Math.round(v / 60) + ' h'); }
  function refusalPanel(DB) {
    if (!DB.lastRefusal) return '';
    return H.panel('That was refused <span class="badge">' + esc(DB.lastRefusal.kind || 'a rule, not an error') + '</span>',
      '<div class="cascade"><b>' + esc(DB.lastRefusal.reason) + '</b></div>' +
      '<button class="btn sm" data-act="dismiss" style="margin-top:9px">Understood</button>');
  }

  function make(CFG, opt) {
    opt = opt || {};
    var V = {};
    /* An app renders the buttons for the work it OWNS, and reads everything else.
       Three areas, not one flag: the CRM app can win a deal and write a note but must not be
       able to sign a document or answer a ticket, and Documents and Helpdesk are the mirror
       of that. One flag for all three quietly removed the CRM's own two buttons and left it
       declaring actions no screen could reach — which is the whole reason this is three. */
    var own = opt.own || {};
    var canCRM = own.crm !== false;     /* Mark won · Record it */
    var canDoc = own.docs !== false;    /* Send for signature · Record the code · File a new document */
    var canDesk = own.desk !== false;   /* Send the reply · Close this ticket · Attach the order */

    /* ═════════ CRM ═════════ */
    V.dash = function () {
      var DB = db(), st = M02.byStage(DB);
      var mx = Math.max.apply(null, st.map(function (s) { return s.value; }).concat([1]));
      var ar = M02.atRisk(DB), tk = M02.openTickets(DB), aw = M02.awaitingSignature(DB);
      return H.head('Winning work · Overview', opt.title || CFG.name,
        'Everything you are chasing, everyone you have already won, and what is outstanding on both.') +
      H.kpis([
        { l: 'Open pipeline', v: money(M02.pipelineValue(DB)), d: M02.plural(M02.openLeads(DB).length, 'live deal'), icon: 'flow', tone: 'teal' },
        { l: 'Likely to close', v: money(M02.weightedPipeline(DB)), d: 'value × stage odds', cls: 'g', icon: 'scale', tone: 'green' },
        { l: 'Win rate', v: M02.winRate(DB) + '%', d: M02.wonLeads(DB).length + ' won / ' + M02.lostLeads(DB).length + ' lost', icon: 'check', tone: 'blue' },
        { l: 'Customers worth', v: money(M02.totalValue(DB)), d: 'after returns', icon: 'users', tone: 'peach' },
        { l: 'Needs a hand', v: (ar.length + tk.length + aw.length), d: 'quiet customers, open tickets, unsigned', cls: 'r', icon: 'bell', tone: 'red' }], 'k5') +
      '<div class="two">' +
      H.panel('The pipeline, stage by stage',
        st.map(function (s) {
          return '<div style="margin-bottom:11px"><div class="kv" style="border:none;padding:2px 0"><span>' + esc(s.stage) +
            ' <span class="hint">' + s.n + ' · ' + s.prob + '% odds</span></span><b>' + money(s.value) + '</b></div>' +
            H.bar(s.value / mx * 100) + '</div>';
        }).join('') +
        '<div class="kv" style="margin-top:10px"><span>Added up</span><b>' + money(M02.pipelineValue(DB)) + '</b></div>' +
        '<div class="kv"><span>Weighted by the odds</span><b class="g">' + money(M02.weightedPipeline(DB)) + '</b></div>' +
        '<p class="hint" style="margin-top:8px">The second number is the one to plan on. The first is the one everybody quotes.</p>') +
      H.panel('What needs you',
        H.table([{ label: '', align: 'l', fmt: function (r) { return r.tag; } },
          { label: 'What', align: 'l', k: 'what' },
          { label: '', align: 'l', fmt: function (r) { return '<button class="btn sm" data-go="' + r.go + '">Open →</button>'; } }],
          ar.slice(0, 3).map(function (p) {
            return { tag: H.tag('quiet', 'red'), what: p.name + ' has not ordered for ' + p.lastAge + ' days', go: 'cust' };
          }).concat(M02.unanswered(DB).slice(0, 3).map(function (t) {
            return { tag: H.tag('unanswered', 'red'), what: t.partyName + ' — ' + t.subject, go: 'tickets' };
          })).concat(aw.slice(0, 2).map(function (d) {
            return { tag: H.tag('unsigned', 'amb'), what: d.title + ' — waiting on ' + (d.signer || 'the signer'), go: 'docs' };
          })).concat(M02.orphanDocs(DB).slice(0, 2).map(function (d) {
            return { tag: H.tag('filed nowhere', 'red'), what: d.title + ' points at a record that does not exist', go: 'docs' };
          }))) +
        '<p class="hint" style="margin-top:8px">Three apps, one list. Nobody typed any of these — they are worked out from the records every time this screen opens.</p>') +
      '</div>';
    };

    V.pipe = function () {
      var DB = db(), st = M02.byStage(DB);
      return H.head('Winning work · Pipeline', 'Pipeline',
        'Every deal still open, what it is worth, and how likely it actually is.') +
      refusalPanel(DB) +
      H.kpis([{ l: 'Open deals', v: M02.openLeads(DB).length, d: 'still being chased', icon: 'flow', tone: 'teal' },
        { l: 'Open value', v: money(M02.pipelineValue(DB)), d: 'if every one landed', icon: 'coin', tone: 'blue' },
        { l: 'Likely to close', v: money(M02.weightedPipeline(DB)), d: 'weighted by stage', cls: 'g', icon: 'scale', tone: 'green' },
        { l: 'Average won deal', v: money(M02.avgDeal(DB)), d: 'from ' + M02.wonLeads(DB).length + ' won', icon: 'check', tone: 'peach' }], '') +
      H.panel('By stage', H.table([{ label: 'Stage', align: 'l', k: 'stage' },
        { label: 'Deals', k: 'n', cellcls: 'mono' },
        { label: 'Odds', fmt: function (s) { return s.prob + '%'; }, cellcls: 'mono' },
        { label: 'Value', fmt: function (s) { return inr(s.value); }, cellcls: 'mono' },
        { label: 'Likely', fmt: function (s) { return inr(s.weighted); }, cellcls: 'mono g' }], st)) +
      H.panel('Every open deal', H.table([
        { label: 'Deal', align: 'l', fmt: function (l) { return '<b>' + esc(l.name) + '</b><div class="hint">' + esc(l.co || '') + '</div>'; } },
        { label: 'Came from', align: 'l', k: 'src' },
        { label: 'Stage', align: 'l', fmt: function (l) { return esc(M02.stageOf(l.stage).l) + ' <span class="hint">' + M02.stageOf(l.stage).p + '%</span>'; } },
        { label: 'Value', fmt: function (l) { return inr(l.value); }, cellcls: 'mono' },
        { label: 'Age', fmt: function (l) { return M02.days(l.created) + 'd'; }, cellcls: function (l) { return 'mono ' + (M02.days(l.created) > 45 ? 'r' : ''); } },
        { label: '', align: 'l', fmt: function (l) {
          return canCRM ? '<button class="btn sm p" data-act="win" data-id="' + esc(l.id) + '">Mark won</button>' : ''; } }], M02.openLeads(DB))) +
      '<div class="two">' +
      H.panel('Already won', H.table([{ label: 'Deal', align: 'l', k: 'name' },
        { label: 'Became', align: 'l', fmt: function (l) { return esc(M02.partyName(DB, l.party)); } },
        { label: 'Value', fmt: function (l) { return inr(l.value); }, cellcls: 'mono' }], M02.wonLeads(DB)) +
        '<p class="hint" style="margin-top:8px">Winning a deal does not create a second record. If that organisation is already on the books, the win is attached to the record you already have.</p>') +
      H.panel('Why deals were lost', H.table([{ label: 'Reason', align: 'l', k: 'reason' },
        { label: 'Deals', k: 'n', cellcls: 'mono' },
        { label: 'Value', fmt: function (r) { return inr(r.value); }, cellcls: 'mono' }], M02.lostReasons(DB)) +
        '<p class="hint" style="margin-top:8px">Worth reading before the next price decision. "Price too high" at the top usually means the quote arrived late, not that the price was wrong.</p>') +
      '</div>';
    };

    V.cust = function () {
      var DB = db(), ps = M02.profiles(DB), seg = DB.seg || 'all';
      var rows = seg === 'all' ? ps : ps.filter(function (p) { return M02.segmentOf(p) === seg; });
      return H.head('Customers · List', 'Everyone you have won',
        'One row per party, with what they are actually worth after returns — and what else is outstanding on them.') +
      H.kpis([{ l: 'Parties', v: ps.length, d: 'on the books', icon: 'users', tone: 'teal' },
        { l: 'Worth', v: money(M02.totalValue(DB)), d: 'after returns', icon: 'coin', tone: 'green' },
        { l: 'Bought more than once', v: M02.repeatRate(DB) + '%', d: 'of those who bought', cls: 'g', icon: 'sync', tone: 'blue' },
        { l: 'Quiet or slipping', v: M02.atRisk(DB).length, d: 'no order for 90 days+', cls: 'r', icon: 'clock', tone: 'red' }], '') +
      H.panel('Show', '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        [['all', 'Everyone']].concat(M02.SEGMENTS.map(function (s) { return [s, s]; })).map(function (o) {
          return '<button class="btn sm' + (seg === o[0] ? ' p' : '') + '" data-act="setseg" data-s="' + esc(o[0]) + '">' + esc(o[1]) + '</button>';
        }).join('') + '</div>') +
      H.panel('Parties <span class="badge">' + rows.length + ' of ' + ps.length + '</span>', H.table([
        { label: 'Party', align: 'l', fmt: function (p) { return '<b>' + esc(p.name) + '</b><div class="hint">' + esc(p.type || '') + ' · ' + esc(p.city || '') + '</div>'; } },
        { label: 'Orders', k: 'orders', cellcls: 'mono' },
        { label: 'Worth', fmt: function (p) { return inr(p.value); }, cellcls: 'mono' },
        { label: 'Returns', fmt: function (p) { return p.rr + '%'; }, cellcls: function (p) { return 'mono ' + (p.rr >= 12 ? 'r' : ''); } },
        { label: 'Last order', fmt: function (p) { return p.orders ? p.lastAge + 'd ago' : '—'; }, cellcls: function (p) { return 'mono ' + (p.lastAge > 90 ? 'r' : ''); } },
        { label: 'Docs', k: 'docs', cellcls: 'mono' },
        { label: 'Open tickets', fmt: function (p) { return p.openTickets; }, cellcls: function (p) { return 'mono ' + (p.openTickets ? 'r' : ''); } },
        { label: 'Group', align: 'l', fmt: function (p) { return segTag(M02.segmentOf(p)); } },
        { label: '', align: 'l', fmt: function (p) { return '<button class="btn sm" data-act="setparty" data-p="' + esc(p.id) + '">Open →</button>'; } }], rows));
    };

    V.person = function () {
      var DB = db(), pid = DB.sel || (DB.parties[0] && DB.parties[0].id);
      var party = (DB.parties || []).filter(function (x) { return x.id === pid; })[0];
      if (!party) return H.head('Customers · 360', 'Customer 360', 'Nobody selected.') +
        H.panel('Nothing here', '<div class="empty">Open a party from the list.</div>');
      var p = M02.profile(DB, party), seg = M02.segmentOf(p);
      var tl = M02.timeline(DB, pid), docs = M02.docsOfParty(DB, pid);
      var tks = M02.ticketsOf(DB, pid).map(function (t) { return M02.ticketRow(DB, t); });
      return H.head('Customers · 360', esc(party.name),
        'Everything about one party, from all three apps, on one screen — which is the whole reason they are one module.') +
      H.panel('Which party', '<div style="display:flex;gap:8px;flex-wrap:wrap">' + (DB.parties || []).map(function (c) {
        return '<button class="btn sm' + (c.id === pid ? ' p' : '') + '" data-act="setparty" data-p="' + esc(c.id) + '">' + esc(c.name) + '</button>';
      }).join('') + '</div>') +
      H.kpis([{ l: 'Worth', v: money(p.value), d: 'after returns', icon: 'coin', tone: 'teal' },
        { l: 'Orders', v: p.orders, d: 'average ' + money(p.aov), icon: 'cart', tone: 'blue' },
        { l: 'Returns', v: p.rr + '%', d: money(p.returns) + ' sent back', cls: p.rr >= 12 ? 'r' : '', icon: 'return', tone: 'peach' },
        { l: 'Last order', v: p.orders ? p.lastAge + 'd' : '—', d: 'ago', cls: p.lastAge > 90 ? 'r' : 'g', icon: 'clock', tone: 'violet' },
        { l: 'Group', v: seg, d: 'worked out, not tagged', icon: 'spark', tone: 'green' }], 'k5') +
      H.panel('What to do next <span class="badge">' + esc(seg) + '</span>',
        '<p class="big">' + esc((CFG.offers || {})[seg] || '—') + '</p>' +
        '<p class="hint">The same customer gets the same answer whoever opens this record, because the group is a rule and the action is agreed once.</p>') +
      H.panel('Everything that has happened <span class="badge">' + tl.length + ' events</span>',
        H.table([{ label: 'When', align: 'l', k: 'at', cellcls: 'mono' },
          { label: '', align: 'l', fmt: function (e) {
            var t = { Order: 'blu', Document: 'gray', Ticket: 'amb', Note: 'grn', Lead: 'blu' };
            return H.tag(e.kind, t[e.kind] || 'gray'); } },
          { label: 'What', align: 'l', fmt: function (e) { return '<b>' + esc(e.what) + '</b><div class="hint">' + esc(e.detail || '') + '</div>'; } },
          { label: 'Amount', fmt: function (e) { return e.amount ? inr(e.amount) : ''; }, cellcls: 'mono' },
          { label: '', align: 'l', fmt: function (e) { return '<span class="hint">' + esc(e.extra || '') + '</span>'; } }], tl) +
        '<p class="hint" style="margin-top:8px">Orders from Sales, documents from Documents &amp; eSign, tickets from Helpdesk, notes and the original lead from CRM. One list, newest first. Nobody has to open three programs to find out what has been going on.</p>') +
      '<div class="two">' +
      H.panel('Where they buy', H.table([{ label: 'Channel', align: 'l', k: 'channel' },
        { label: 'Orders', k: 'n', cellcls: 'mono' },
        { label: 'Kept', fmt: function (c) { return inr(c.kept); }, cellcls: 'mono' },
        { label: 'Returns', fmt: function (c) { return c.rr + '%'; }, cellcls: function (c) { return 'mono ' + (c.rr >= 12 ? 'r' : ''); } }], M02.channelMix(DB, pid))) +
      H.panel('On file for them <span class="badge">' + docs.length + '</span>',
        H.table([{ label: 'Document', align: 'l', fmt: function (d) { return esc(d.title); } },
          { label: 'Filed against', align: 'l', fmt: function (d) { return esc(d.againstKind + ' ' + d.against); } },
          { label: '', align: 'l', fmt: function (d) { return docTag(d.status); } }], docs)) +
      '</div>' +
      '<div class="two">' +
      H.panel('Questions they have asked <span class="badge">' + tks.length + '</span>',
        H.table([{ label: 'Ticket', align: 'l', k: 'subject' },
          { label: 'By', align: 'l', k: 'channel' },
          { label: 'First reply', fmt: function (t) { return mm(t.firstReply); }, cellcls: function (t) { return 'mono ' + (t.firstLate ? 'r' : 'g'); } },
          { label: '', align: 'l', fmt: function (t) { return t.open ? H.tag('open', 'amb') : H.tag('closed', 'grn'); } }], tks)) +
      H.panel('Conversation log',
        (M02.notesOf(DB, pid).length
          ? M02.notesOf(DB, pid).map(function (n) {
              return '<div class="kv" style="display:block"><b>' + esc(n.date) + ' · ' + esc(n.kind || 'Note') + '</b>' +
                '<div class="hint" style="margin-top:3px">' + esc(n.text) + '</div></div>';
            }).join('')
          : '<div class="empty">Nothing recorded yet.</div>') +
        (canCRM ? H.form([{ id: 'n_kind', label: 'Call, visit or email', type: 'select', options: ['Call', 'Visit', 'Email', 'Meeting'] },
          { id: 'n_text', label: 'What happened', type: 'text', wide: true, ph: CFG.notePh || 'Called about the July order — asked for longer terms' }],
          'Record it', 'addnote', 'f2') : '')) +
      '</div>';
    };

    V.segs = function () {
      var DB = db(), sc = M02.segCounts(DB);
      var mx = Math.max.apply(null, sc.map(function (s) { return s.value; }).concat([1]));
      return H.head('Customers · Segments', 'Six groups, one rule set',
        'Worked out from behaviour, never tagged by hand — so they update themselves the moment somebody buys or goes quiet.') +
      H.panel('How somebody lands in each group', H.table([
        { label: 'Group', align: 'l', fmt: function (r) { return segTag(r.seg); } },
        { label: 'The rule', align: 'l', k: 'rule' },
        { label: 'Parties', k: 'n', cellcls: 'mono' },
        { label: 'Worth', fmt: function (r) { return inr(r.value); }, cellcls: 'mono' },
        { label: 'Share', align: 'l', fmt: function (r) { return '<div style="min-width:120px">' + H.bar(r.value / mx * 100) + '</div>'; } }],
        sc.map(function (s) {
          s.rule = { 'Champion': '4 or more orders, and bought within 45 days',
            'Loyal': '2 or more orders, and bought within 60 days',
            'Needs attention': '2 or more orders, but quiet for 60–90 days',
            'At risk': 'Nothing for 90–180 days',
            'Sleeping': 'Nothing for more than 180 days',
            'New': 'One order, or none yet' }[s.seg];
          return s;
        }))) +
      H.panel('What to do about each one', H.table([
        { label: 'Group', align: 'l', fmt: function (r) { return segTag(r.seg); } },
        { label: 'The agreed action', align: 'l', fmt: function (r) { return esc((CFG.offers || {})[r.seg] || '—'); } }], sc)) +
      H.panel('Why bother', '<p>' + esc(CFG.segWhy || '') + '</p>');
    };

    /* ═════════ DOCUMENTS ═════════ */
    V.docdash = function () {
      var DB = db(), st = M02.docByStatus(DB), exp = M02.expiringSoon(DB), orph = M02.orphanDocs(DB);
      return H.head('Documents · Overview', 'What is on file, and what is waiting',
        'A document belongs to a record, not to a folder. This screen is what is outstanding across all of them.') +
      refusalPanel(DB) +
      H.kpis([{ l: 'On file', v: (DB.docs || []).length, d: 'documents', icon: 'doc', tone: 'teal' },
        { l: 'Waiting on a signature', v: M02.awaitingSignature(DB).length, d: 'sent, nothing back', cls: 'a', icon: 'clock', tone: 'peach' },
        { l: 'Expiring within 60 days', v: exp.length, d: 'renew or lose the terms', cls: exp.length ? 'r' : 'g', icon: 'bell', tone: exp.length ? 'red' : 'green' },
        { l: 'Filed against nothing', v: orph.length, d: 'the record does not exist', cls: orph.length ? 'r' : 'g', icon: 'scale', tone: orph.length ? 'red' : 'green' }], '') +
      '<div class="two">' +
      H.panel('By state', H.table([{ label: 'State', align: 'l', fmt: function (r) { return docTag(r.status); } },
        { label: 'What it means', align: 'l', fmt: function (r) {
          return { draft: 'Written, not sent to anybody yet', sent: 'Out for signature, one-time code issued',
            signed: 'A code came back and is recorded against it', declined: 'The signer said no',
            filed: 'Filed for the record — nothing to sign' }[r.status]; } },
        { label: 'Documents', k: 'n', cellcls: 'mono' }], st)) +
      H.panel('Expiring soonest', H.table([{ label: 'Document', align: 'l', k: 'title' },
        { label: 'Filed against', align: 'l', fmt: function (d) { return esc(d.againstKind + ' ' + d.against); } },
        { label: 'Days left', fmt: function (d) { return M02.daysLeft(d); }, cellcls: function (d) { return 'mono ' + (M02.daysLeft(d) <= 30 ? 'r' : 'a'); } }], exp) +
        '<p class="hint" style="margin-top:8px">An agreement that lapses quietly is a rate that resets quietly. This is the list to work down.</p>') +
      '</div>' +
      (orph.length ? H.panel('Filed against a record that does not exist <span class="badge">' + orph.length + '</span>',
        H.table([{ label: 'Document', align: 'l', k: 'title' },
          { label: 'Claims to be filed against', align: 'l', fmt: function (d) { return esc(d.againstKind + ' ' + d.against); } }], orph) +
        '<p class="hint" style="margin-top:8px">This is the one fault that makes a filing system useless: a document that cannot be found from the record it belongs to. Fix the reference, or file it somewhere real.</p>') : '');
    };

    V.docs = function () {
      var DB = db(), f = DB.docFilter || 'all';
      var all = DB.docs || [];
      var rows = f === 'all' ? all : all.filter(function (d) { return d.status === f; });
      var kinds = CFG.docKinds || ['Party', 'Order'];
      return H.head('Documents · All documents', 'Everything on file',
        'Filed against the record it belongs to. Send one for signature and the signed copy files itself back here.') +
      refusalPanel(DB) +
      H.panel('Show', '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        [['all', 'All']].concat(M02.DOCSTATES.map(function (s) { return [s, s]; })).map(function (o) {
          return '<button class="btn sm' + (f === o[0] ? ' p' : '') + '" data-act="setdocf" data-f="' + esc(o[0]) + '">' + esc(o[1]) + '</button>';
        }).join('') + '</div>') +
      H.panel('Documents <span class="badge">' + rows.length + ' of ' + all.length + '</span>', H.table([
        { label: 'Reference', align: 'l', k: 'id', cellcls: 'mono' },
        { label: 'Document', align: 'l', fmt: function (d) { return '<b>' + esc(d.title) + '</b><div class="hint">' + esc(d.type) + '</div>'; } },
        { label: 'Filed against', align: 'l', fmt: function (d) {
          var ok = M02.recordExists(DB, d.againstKind, d.against);
          return esc(d.againstKind) + ' <span class="mono">' + esc(d.against) + '</span>' +
            (ok ? '' : ' ' + H.tag('does not exist', 'red')); } },
        { label: 'Signer', align: 'l', fmt: function (d) { return esc(d.signer || '—'); } },
        { label: 'Expires', align: 'l', fmt: function (d) { return d.expires ? esc(d.expires) + ' <span class="hint">' + M02.daysLeft(d) + 'd</span>' : '—'; } },
        { label: '', align: 'l', fmt: function (d) { return docTag(d.status); } },
        { label: '', align: 'l', fmt: function (d) {
          if (!canDoc) return '';
          if (d.status === 'draft') return '<button class="btn sm p" data-act="senddoc" data-id="' + esc(d.id) + '">Send for signature</button>';
          if (d.status === 'sent') return '<button class="btn sm p" data-act="seldoc" data-id="' + esc(d.id) + '">Record the code</button>';
          if (d.status === 'signed') return '<span class="hint mono">code ' + esc(d.code) + '</span>';
          return ''; } }], rows)) +
      (canDoc && DB.selDoc ? (function () {
        var d = all.filter(function (x) { return x.id === DB.selDoc; })[0];
        if (!d || d.status !== 'sent') return '';
        return H.panel('Record the one-time code · ' + esc(d.title),
          '<p>The code went to <b>' + esc(d.signer) + '</b> when this was sent. Type the six digits they read back.</p>' +
          H.form([{ id: 'sg_code', label: 'One-time code (six digits)', type: 'text', ph: '000000' }], 'Mark it signed', 'signdoc', 'f2') +
          '<p class="hint"><b>There is no other way to mark this signed.</b> Not a tick box, not a menu. A signature that cannot be evidenced is worse than no signature, because everybody believes it.</p>');
      })() : '') +
      (canDoc ? H.panel('File a new document',
        H.form([{ id: 'd_title', label: 'Title', type: 'text', wide: true },
          { id: 'd_type', label: 'Kind of document', type: 'select', options: (CFG.docTypes || []).map(function (t) { return { v: t, label: t }; }) },
          { id: 'd_kind', label: 'Filed against', type: 'select', options: kinds.map(function (t) { return { v: t, label: t }; }) },
          { id: 'd_against', label: 'Which record', type: 'text', ph: 'e.g. ' + ((DB.parties[0] && DB.parties[0].id) || 'P1') },
          { id: 'd_signer', label: 'Who signs it (leave empty to just file it)', type: 'text', wide: true },
          { id: 'd_expires', label: 'Expires on (optional)', type: 'text', ph: '2027-03-31' }], 'File it', 'adddoc', 'f4') +
        '<p class="hint">"Which record" must be a record that exists — a party code, an order number, or the name of the ' +
        esc(kinds.slice(2).join(' or ') || 'record') + ' it belongs to. Filing against nothing is the one thing this app will not let you do quietly.</p>') : '');
    };

    /* ═════════ HELPDESK ═════════ */
    V.deskdash = function () {
      var DB = db(), rows = M02.ticketRows(DB), ch = M02.byChannel(DB), ag = M02.byAgent(DB);
      var mx = Math.max.apply(null, ch.map(function (c) { return c.n; }).concat([1]));
      return H.head('Helpdesk · Overview', 'The desk right now',
        'Every question, where it came from, and how fast it was actually answered.') +
      refusalPanel(DB) +
      H.kpis([{ l: 'Open', v: rows.filter(function (t) { return t.open; }).length, d: 'of ' + rows.length + ' ever', icon: 'bell', tone: 'teal' },
        { l: 'Nobody has replied', v: M02.unanswered(DB).length, d: 'open and untouched', cls: M02.unanswered(DB).length ? 'r' : 'g', icon: 'clock', tone: M02.unanswered(DB).length ? 'red' : 'green' },
        { l: 'Median first reply', v: mm(M02.medianFirstReply(DB)), d: 'target ' + mm(M02.slaFirst(DB)), icon: 'sync', tone: 'blue' },
        { l: 'Inside the target', v: M02.firstReplyPct(DB) + '%', d: 'of those answered', cls: 'g', icon: 'check', tone: 'green' }], '') +
      '<div class="two">' +
      H.panel('Where the questions arrive',
        ch.map(function (c) {
          return '<div style="margin-bottom:10px"><div class="kv" style="border:none;padding:2px 0"><span>' + esc(c.channel) +
            ' <span class="hint">' + c.open + ' open · average first reply ' + mm(c.avgReply) + '</span></span><b>' + c.n + '</b></div>' +
            H.bar(c.n / mx * 100) + '</div>';
        }).join('') +
        '<p class="hint" style="margin-top:8px">A channel that is slow is usually a channel nobody has been given responsibility for, not a channel that is harder.</p>') +
      H.panel('Who is answering', H.table([{ label: 'Person', align: 'l', k: 'agent' },
        { label: 'Tickets', k: 'n', cellcls: 'mono' },
        { label: 'Open', k: 'open', cellcls: function (a) { return 'mono ' + (a.open ? 'a' : ''); } },
        { label: 'Closed', k: 'closed', cellcls: 'mono' },
        { label: 'Average first reply', fmt: function (a) { return mm(a.avgReply); }, cellcls: 'mono' }], ag) +
        '<p class="hint" style="margin-top:8px">Every figure in this table is worked out from the messages. There is no field anybody can type a response time into — which is the only way a response time means anything.</p>') +
      '</div>';
    };

    V.tickets = function () {
      var DB = db(), f = DB.tktFilter || 'open', rows = M02.ticketRows(DB);
      var shown = f === 'all' ? rows : f === 'open' ? rows.filter(function (t) { return t.open; })
        : f === 'unanswered' ? rows.filter(function (t) { return t.open && !t.replied; })
        : rows.filter(function (t) { return !t.open; });
      return H.head('Helpdesk · Tickets', 'Every question asked',
        'Tied to the party who asked it, and usually to the order it is about.') +
      refusalPanel(DB) +
      H.panel('Show', '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        [['open', 'Open'], ['unanswered', 'Not answered yet'], ['closed', 'Closed'], ['all', 'All']].map(function (o) {
          return '<button class="btn sm' + (f === o[0] ? ' p' : '') + '" data-act="settktf" data-f="' + o[0] + '">' + esc(o[1]) + '</button>';
        }).join('') + '</div>') +
      H.panel('Tickets <span class="badge">' + shown.length + ' of ' + rows.length + '</span>', H.table([
        { label: 'Ticket', align: 'l', k: 'id', cellcls: 'mono' },
        { label: 'Who', align: 'l', fmt: function (t) { return '<b>' + esc(t.partyName) + '</b><div class="hint">' + esc(t.subject) + '</div>'; } },
        { label: 'By', align: 'l', k: 'channel' },
        { label: 'About', align: 'l', fmt: function (t) { return t.order ? '<span class="mono">' + esc(t.order) + '</span>' : '—'; } },
        { label: 'First reply', fmt: function (t) { return mm(t.firstReply); }, cellcls: function (t) { return 'mono ' + (t.firstLate ? 'r' : 'g'); } },
        { label: 'Handled by', align: 'l', k: 'agent' },
        { label: '', align: 'l', fmt: function (t) {
          return t.open ? (t.replied ? H.tag('open', 'amb') : H.tag('not answered', 'red')) : H.tag('closed', 'grn'); } },
        { label: '', align: 'l', fmt: function (t) { return '<button class="btn sm" data-act="seltkt" data-id="' + esc(t.id) + '">Open →</button>'; } }], shown));
    };

    V.ticket = function () {
      var DB = db(), tid = DB.selTicket || ((DB.tickets[0] || {}).id);
      var t = (DB.tickets || []).filter(function (x) { return x.id === tid; })[0];
      if (!t) return H.head('Helpdesk · Ticket', 'One ticket', 'Nothing selected.') +
        H.panel('Nothing here', '<div class="empty">Open a ticket from the list.</div>');
      var r = M02.ticketRow(DB, t), msgs = M02.msgsOf(DB, t.id);
      var p = (DB.parties || []).filter(function (x) { return x.id === t.party; })[0];
      var prof = p ? M02.profile(DB, p) : null;
      var docs = M02.docsOfParty(DB, t.party);
      return H.head('Helpdesk · Ticket', esc(t.subject),
        'Everything about this question, and everything already known about the person asking it.') +
      refusalPanel(DB) +
      H.panel('Which ticket', '<div style="display:flex;gap:8px;flex-wrap:wrap">' + (DB.tickets || []).map(function (x) {
        return '<button class="btn sm' + (x.id === tid ? ' p' : '') + '" data-act="seltkt" data-id="' + esc(x.id) + '">' + esc(x.id) + '</button>';
      }).join('') + '</div>') +
      H.kpis([{ l: 'Who', v: esc(M02.partyName(DB, t.party)), d: (prof ? prof.orders + ' orders · worth ' + money(prof.value) : ''), icon: 'users', tone: 'teal' },
        { l: 'Arrived by', v: esc(t.channel), d: 'opened ' + esc(t.opened), icon: 'mail', tone: 'blue' },
        { l: 'First reply', v: mm(r.firstReply), d: 'target ' + mm(M02.slaFirst(DB)), cls: r.firstLate ? 'r' : 'g', icon: 'clock', tone: r.firstLate ? 'red' : 'green' },
        { l: 'State', v: r.open ? 'Open' : 'Closed', d: r.open ? 'still with us' : 'closed ' + esc(t.closed), cls: r.open ? 'a' : 'g', icon: 'check', tone: r.open ? 'peach' : 'green' }], '') +
      '<div class="two">' +
      H.panel('The conversation',
        (msgs.length ? msgs.map(function (m) {
          return '<div class="kv" style="display:block;border-left:3px solid ' + (m.who === 'us' ? 'var(--acc)' : 'var(--mut)') + ';padding-left:10px">' +
            '<b>' + (m.who === 'us' ? 'Us' : esc(M02.partyName(DB, t.party))) + '</b> <span class="hint">' + esc(m.at) + '</span>' +
            '<div style="margin-top:4px">' + esc(m.text) + '</div></div>';
        }).join('') : '<div class="empty">Nothing said yet.</div>') +
        (canDesk ? H.form([{ id: 'tk_reply', label: 'Reply', type: 'text', wide: true, ph: 'Type the answer' }], 'Send the reply', 'replytkt', 'f2') +
          '<div style="margin-top:9px"><button class="btn d" data-act="closetkt">Close this ticket</button></div>' +
          '<p class="hint" style="margin-top:8px">The first-reply figure above is the gap between the ticket opening and our first message here. It is not a field — it is worked out from this conversation, every time the screen opens.</p>' : '')) +
      H.panel('Already known about them',
        (prof ? '<div class="kv"><span>Worth after returns</span><b>' + money(prof.value) + '</b></div>' +
          '<div class="kv"><span>Orders</span><b>' + prof.orders + '</b></div>' +
          '<div class="kv"><span>Returns</span><b>' + prof.rr + '%</b></div>' +
          '<div class="kv"><span>Last order</span><b>' + (prof.orders ? prof.lastAge + ' days ago' : '—') + '</b></div>' +
          '<div class="kv"><span>Group</span><b>' + segTag(M02.segmentOf(prof)) + '</b></div>' : '') +
        '<p class="hint" style="margin-top:8px">Whoever picks this up has all of it in front of them before they say a word. That is the difference between a helpdesk bolted on and a helpdesk in the same module as the customer record.</p>' +
        (canDesk ? H.form([{ id: 'tk_order', label: 'Which order is this about?', type: 'text', ph: 'e.g. ' + ((DB.orders[0] || {}).id || 'SO-1001') }], 'Attach the order', 'attachorder', 'f2') +
          '<p class="hint">Only one of <b>their own</b> orders. Attaching somebody else\'s is refused — that is how one customer ends up being told about another customer\'s delivery.</p>' : '') +
        (docs.length ? '<p style="margin-top:10px"><b>On file for them, ready to send:</b></p>' +
          H.table([{ label: 'Document', align: 'l', fmt: function (d) { return esc(d.title); } },
            { label: '', align: 'l', fmt: function (d) { return docTag(d.status); } }], docs) : '')) +
      '</div>';
    };

    /* ═════════ WIRING ═════════ */
    V.wiring = function () {
      return H.head('Wiring · Integration', opt.wiringTitle || 'Where every figure comes from',
        opt.wiringSub || 'This app owns only what it is responsible for. Everything else it reads from the shared Data Core.') +
      H.note('Shared Data Core: Item/SKU · Party · Stock · Ledger/Voucher · Order — every module reads and writes these.') +
      H.panel('Every figure on these screens, and its source', H.table([
        { label: 'Figure here', align: 'l', k: 'f' }, { label: 'Comes from', align: 'l', k: 's' },
        { label: 'How it is worked out', align: 'l', k: 'h' }], CFG.wiring || [])) +
      '<div class="two">' + (opt.wiringPanels ? opt.wiringPanels() : '') + '</div>';
    };

    return V;
  }

  /* ══════════ the actions, shared the same way ══════════ */
  function actions(CFG) {
    CFG = CFG || {};
    var A = {};
    var refuse = function (DB, reason, kind) {
      DB.lastRefusal = { kind: kind || 'a rule, not an error', reason: reason };
      K.save(); toast('Refused'); K.render();
    };
    A.dismiss = function () { var DB = db(); DB.lastRefusal = null; K.save(); K.render(); };
    A.setparty = function (b) { var DB = db(); DB.sel = b.getAttribute('data-p'); K.save(); K.go('person'); };
    A.setseg = function (b) { var DB = db(); DB.seg = b.getAttribute('data-s'); K.save(); K.render(); };
    A.setdocf = function (b) { var DB = db(); DB.docFilter = b.getAttribute('data-f'); K.save(); K.render(); };
    A.settktf = function (b) { var DB = db(); DB.tktFilter = b.getAttribute('data-f'); K.save(); K.render(); };
    A.seldoc = function (b) { var DB = db(); DB.selDoc = b.getAttribute('data-id'); DB.lastRefusal = null; K.save(); K.render(); };
    A.seltkt = function (b) { var DB = db(); DB.selTicket = b.getAttribute('data-id'); DB.lastRefusal = null; K.save(); K.go('ticket'); };

    A.win = function (b) {
      var DB = db(), res = M02.winLead(DB, b.getAttribute('data-id'), CFG);
      if (!res.ok) return refuse(DB, res.reason);
      DB.lastRefusal = null; DB.sel = res.party;
      K.save(); toast(res.reused ? 'Won — attached to the record you already had' : 'Won — a new party record was opened'); K.render();
    };
    A.addnote = function () {
      var DB = db(), text = (H.val('n_text') || '').trim();
      if (!text) { toast('Type what happened first'); return; }
      DB.notes.push({ id: M02.uid('n'), party: DB.sel, date: M02.dateOnly(M02.TODAY), kind: H.val('n_kind'), text: text });
      K.save(); toast('Recorded ✓'); K.render();
    };

    A.senddoc = function (b) {
      var DB = db(), res = M02.sendDoc(DB, b.getAttribute('data-id'));
      if (!res.ok) return refuse(DB, res.reason);
      DB.lastRefusal = null; DB.selDoc = res.doc.id;
      K.save(); toast('Sent — a one-time code went to ' + res.doc.signer); K.render();
    };
    A.signdoc = function () {
      var DB = db(), res = M02.signDoc(DB, DB.selDoc, H.val('sg_code'));
      if (!res.ok) return refuse(DB, res.reason);
      DB.lastRefusal = null; DB.selDoc = null;
      K.save(); toast('Signed ✓ — the code is recorded against it'); K.render();
    };
    A.adddoc = function () {
      var DB = db();
      var rec = { id: 'D-' + (2100 + (DB.docs || []).length), title: (H.val('d_title') || '').trim(),
        type: H.val('d_type'), againstKind: H.val('d_kind'), against: (H.val('d_against') || '').trim(),
        issued: M02.dateOnly(M02.TODAY), expires: (H.val('d_expires') || '').trim(),
        status: (H.val('d_signer') || '').trim() ? 'draft' : 'filed',
        signer: (H.val('d_signer') || '').trim(), signedOn: '', code: '' };
      if (!rec.title) { toast('Give it a title'); return; }
      if (!rec.against) return refuse(DB, 'A document has to be filed against something. Filing against nothing is how a document is never found again.');
      if (!M02.recordExists(DB, rec.againstKind, rec.against))
        return refuse(DB, 'There is no ' + rec.againstKind.toLowerCase() + ' "' + rec.against + '". ' +
          'A document filed against a record that does not exist cannot be found from that record — which is the only way anybody looks for one.');
      DB.docs.push(rec); DB.lastRefusal = null;
      K.save(); toast('Filed against ' + rec.againstKind + ' ' + rec.against); K.render();
    };

    A.replytkt = function () {
      var DB = db(), res = M02.reply(DB, DB.selTicket, H.val('tk_reply'));
      if (!res.ok) { toast(res.reason); return; }
      K.save(); toast('Sent — the first-reply clock is worked out from this'); K.render();
    };
    A.closetkt = function () {
      var DB = db(), res = M02.closeTicket(DB, DB.selTicket);
      if (!res.ok) return refuse(DB, res.reason);
      DB.lastRefusal = null; K.save(); toast('Closed'); K.render();
    };
    A.attachorder = function () {
      var DB = db(), res = M02.attachOrder(DB, DB.selTicket, (H.val('tk_order') || '').trim());
      if (!res.ok) return refuse(DB, res.reason);
      DB.lastRefusal = null; K.save(); toast('Attached'); K.render();
    };
    return A;
  }

  /* ══════════ what a screen can actually be pressed on ══════════
     Renders every screen of an app with the states that reveal its conditional buttons
     already set, and hands back the whole lot as one string. Each app then asserts that
     every action it declares appears in it.

     A button that exists in the code and on no screen is a promise the app does not keep —
     and it is silent, because nothing errors. It is only found by somebody looking for the
     button, which is to say by a customer. */
  /* True only where the screens can actually be built — the browser. build_deep.js runs each
     spec in a bare Node sandbox with no renderer at all, so there is nothing to probe there.
     The check is not skipped, it moves: the app itself runs it every time it opens, and
     check_deep.js and verify_m02_manual.js both refuse a build where it did not run. */
  function canProbe() { return typeof H.panel === 'function' && typeof H.table === 'function'; }

  function reachable(SPEC, DB) {
    if (!canProbe()) return null;
    /* The kernel hands a self-test a deep COPY of the data, so a test can add a row without
       touching what the person is looking at. The screens, though, read the live one. So point
       them at the copy for the length of this probe and put them back afterwards — the states
       that reveal the conditional buttons can then be forced without live data ever being
       written to. */
    var live = K.DB;
    K.DB = DB;
    var keep = { refusal: DB.lastRefusal, pending: DB.pending, editing: DB.editing,
                 selDoc: DB.selDoc, selTicket: DB.selTicket, tab: DB.tab };
    DB.lastRefusal = { kind: 'a rule, not an error', reason: 'probe' };
    DB.pending = { file: 'probe.xlsx', sheets: [], rejected: [] };
    DB.editing = ((DB.parties || [])[0] || {}).id || null;
    DB.tab = DB.tab || 'parties';
    DB.selDoc = (M02.awaitingSignature(DB)[0] || {}).id || null;
    DB.selTicket = ((DB.tickets || [])[0] || {}).id || null;
    var html = '';
    Object.keys(SPEC.views).forEach(function (v) {
      try { html += String(SPEC.views[v]() || ''); } catch (e) { html += ''; }
    });
    DB.lastRefusal = keep.refusal; DB.pending = keep.pending; DB.editing = keep.editing;
    DB.selDoc = keep.selDoc; DB.selTicket = keep.selTicket; DB.tab = keep.tab;
    K.DB = live;
    return html;
  }
  function unreachable(SPEC, DB, own) {
    var html = reachable(SPEC, DB);
    if (html === null) { M02V.lastUnreachable = null; return []; }
    var miss = Object.keys(own).filter(function (k) { return html.indexOf('data-act="' + k + '"') < 0; });
    /* Kept where a person can read it: when the self-test goes red, "which button?" should be
       answerable from the console rather than from the source. */
    M02V.lastUnreachable = miss;
    return miss;
  }

  return { make: make, actions: actions, segTag: segTag, docTag: docTag, mm: mm,
           canProbe: canProbe, reachable: reachable, unreachable: unreachable };
})();
/* Reachable from the browser console, the same way M02 is — so "which button is missing?"
   is a question you can answer from the app rather than from the source. */
if (typeof Medhava !== 'undefined') Medhava.M02V = M02V;
if (typeof module !== 'undefined' && module.exports) module.exports = M02V;
