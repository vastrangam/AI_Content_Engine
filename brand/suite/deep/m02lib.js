/* Medhava — Module 02 · the shared engine.

   All four apps in this module — CRM & Customer 360, Documents & eSign, Helpdesk & Live Chat,
   and the combined Module 02 app — are built from THIS file. One arithmetic, compiled four
   times, for the same reason as Module 01: two copies of a rule agree until somebody fixes a
   bug in one of them.

   THE SPINE OF THIS MODULE IS ONE RECORD: THE PARTY.
     · a lead, once won, becomes a party — not a second record beside it
     · a document is filed against a party, an order, a project or a person
     · a ticket is about a party, and usually about one of that party's orders
   Which is why these three apps belong in one module at all: they are three views of the
   same relationship. The timeline() function at the bottom is that idea made literal.

   Nothing in here knows what industry it is running. A law firm's case file, a workshop's
   job and a clothing house's style are the same record with different words on it — so the
   words come from CONFIG, always. */

var M02 = (function () {
  'use strict';
  var K = (typeof Medhava !== 'undefined') ? Medhava : {};
  var r2 = K.r2 || function (n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; };
  var num = K.num || function (n) { return (n == null || n === '' || isNaN(n)) ? 0 : Number(n); };

  /* Everything in this module is dated, and a demo that drifts with the calendar is a demo
     that breaks every morning. So "today" is a fixed day inside the seeded year. */
  var TODAY = '2026-07-31';
  function days(from, to) {
    if (!from) return 0;
    return Math.round((new Date(to || TODAY) - new Date(from)) / 86400000);
  }
  function mins(from, to) {
    if (!from || !to) return null;
    return Math.round((new Date(to) - new Date(from)) / 60000);
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function dateOnly(s) { return String(s || '').slice(0, 10); }

  /* ═══════════════ 1 · THE DATA MODEL ═══════════════
     Described once. The edit forms, the importer's column matching, the export sheets and
     the validation rules are all generated from these descriptions, so a column cannot
     exist in the grid and be missing from the importer. */
  var TABLES = [
    { key: 'parties', label: 'Parties', icon: 'users', one: 'party',
      note: 'One record per customer, buyer or account. Everything else in this module hangs off it.',
      cols: [ { k: 'id', l: 'Code', type: 'text', req: 1 },
              { k: 'name', l: 'Name', type: 'text', req: 1 },
              { k: 'type', l: 'Kind', type: 'text' },
              { k: 'city', l: 'City', type: 'text' },
              { k: 'email', l: 'Email', type: 'text' },
              { k: 'since', l: 'On the books since', type: 'date' } ] },
    { key: 'leads', label: 'Leads', icon: 'flow', one: 'lead',
      note: 'Work you are chasing. Win one and it becomes a party — the same record, not a second one.',
      cols: [ { k: 'id', l: 'Code', type: 'text', req: 1 },
              { k: 'name', l: 'Person', type: 'text', req: 1 },
              { k: 'co', l: 'Organisation', type: 'text' },
              { k: 'src', l: 'Came from', type: 'text' },
              { k: 'value', l: 'Value', type: 'num' },
              { k: 'stage', l: 'Stage', type: 'text', req: 1 },
              { k: 'status', l: 'Open / won / lost', type: 'text', req: 1 },
              { k: 'created', l: 'Raised on', type: 'date', req: 1 },
              { k: 'reason', l: 'If lost, why', type: 'text' },
              { k: 'party', l: 'Became party', type: 'party' } ] },
    { key: 'orders', label: 'Orders', icon: 'cart', one: 'order',
      note: 'What a party actually bought, and anything they sent back.',
      cols: [ { k: 'id', l: 'Order', type: 'text', req: 1 },
              { k: 'party', l: 'Party', type: 'party', req: 1 },
              { k: 'date', l: 'Date', type: 'date', req: 1 },
              { k: 'amount', l: 'Amount', type: 'num' },
              { k: 'returned', l: 'Returned', type: 'num' },
              { k: 'channel', l: 'Channel', type: 'text' } ] },
    { key: 'docs', label: 'Documents', icon: 'doc', one: 'document',
      note: 'Every agreement, certificate, receipt and scan — filed against the record it belongs to, not in a folder somebody has to remember.',
      cols: [ { k: 'id', l: 'Reference', type: 'text', req: 1 },
              { k: 'title', l: 'Title', type: 'text', req: 1 },
              { k: 'type', l: 'Kind of document', type: 'text', req: 1 },
              { k: 'againstKind', l: 'Filed against', type: 'text', req: 1 },
              { k: 'against', l: 'Which record', type: 'text', req: 1 },
              { k: 'issued', l: 'Issued on', type: 'date', req: 1 },
              { k: 'expires', l: 'Expires on', type: 'date' },
              { k: 'status', l: 'State', type: 'text', req: 1 },
              { k: 'signer', l: 'Who signs it', type: 'text' },
              { k: 'signedOn', l: 'Signed on', type: 'date' },
              { k: 'code', l: 'One-time code used', type: 'text' } ] },
    { key: 'tickets', label: 'Tickets', icon: 'bell', one: 'ticket',
      note: 'A question arriving by chat, email or phone, tied to the party and usually to the order it is about.',
      cols: [ { k: 'id', l: 'Ticket', type: 'text', req: 1 },
              { k: 'party', l: 'Party', type: 'party', req: 1 },
              { k: 'order', l: 'About which order', type: 'text' },
              { k: 'channel', l: 'Arrived by', type: 'text', req: 1 },
              { k: 'subject', l: 'Subject', type: 'text', req: 1 },
              { k: 'priority', l: 'Priority', type: 'text' },
              { k: 'agent', l: 'Handled by', type: 'text' },
              { k: 'opened', l: 'Opened at', type: 'stamp', req: 1 },
              { k: 'closed', l: 'Closed at', type: 'stamp' } ] },
    { key: 'messages', label: 'Ticket messages', icon: 'mail', one: 'message',
      note: 'What was actually said, and when. The first-reply clock is worked out from these — never typed in.',
      cols: [ { k: 'id', l: 'Reference', type: 'text', req: 1 },
              { k: 'ticket', l: 'Ticket', type: 'text', req: 1 },
              { k: 'who', l: 'Customer or us', type: 'text', req: 1 },
              { k: 'at', l: 'At', type: 'stamp', req: 1 },
              { k: 'text', l: 'What was said', type: 'text' } ] },
    { key: 'notes', label: 'Conversation log', icon: 'thread', one: 'note',
      note: 'Calls, visits and promises. The only thing in this module a person types from scratch.',
      cols: [ { k: 'id', l: 'Reference', type: 'text', req: 1 },
              { k: 'party', l: 'Party', type: 'party', req: 1 },
              { k: 'date', l: 'Date', type: 'date', req: 1 },
              { k: 'kind', l: 'Call / visit / email', type: 'text' },
              { k: 'text', l: 'What happened', type: 'text' } ] },
  ];
  var TBL = {}; TABLES.forEach(function (t) { TBL[t.key] = t; });

  var seq = 0;
  function uid(p) { seq++; return p + '-' + (Date.now() % 100000) + '-' + seq; }

  /* ═══════════════ 2 · THE PIPELINE ═══════════════
     Five stages, each carrying a real probability of closing, so the forecast is honest
     instead of hopeful. The probabilities are config, not code — every trade argues about
     them and every trade should be able to set its own. */
  var STAGES = [{ k: 'new', l: 'New', p: 10 }, { k: 'contacted', l: 'Contacted', p: 25 },
                { k: 'quoted', l: 'Quoted', p: 50 }, { k: 'negotiation', l: 'Negotiation', p: 75 }];
  function stageOf(k) { return STAGES.filter(function (s) { return s.k === k; })[0] || STAGES[0]; }
  function openLeads(DB) { return (DB.leads || []).filter(function (l) { return l.status === 'open'; }); }
  function wonLeads(DB) { return (DB.leads || []).filter(function (l) { return l.status === 'won'; }); }
  function lostLeads(DB) { return (DB.leads || []).filter(function (l) { return l.status === 'lost'; }); }
  function pipelineValue(DB) { return r2(openLeads(DB).reduce(function (s, l) { return s + num(l.value); }, 0)); }
  function weightedPipeline(DB) {
    return r2(openLeads(DB).reduce(function (s, l) { return s + num(l.value) * stageOf(l.stage).p / 100; }, 0));
  }
  function wonValue(DB) { return r2(wonLeads(DB).reduce(function (s, l) { return s + num(l.value); }, 0)); }
  function winRate(DB) { var w = wonLeads(DB).length, l = lostLeads(DB).length; return (w + l) ? Math.round(w / (w + l) * 100) : 0; }
  function avgDeal(DB) { var w = wonLeads(DB); return w.length ? r2(wonValue(DB) / w.length) : 0; }
  function byStage(DB) {
    return STAGES.map(function (s) {
      var rows = openLeads(DB).filter(function (l) { return l.stage === s.k; });
      return { stage: s.l, key: s.k, prob: s.p, n: rows.length,
        value: r2(rows.reduce(function (t, l) { return t + num(l.value); }, 0)),
        weighted: r2(rows.reduce(function (t, l) { return t + num(l.value) * s.p / 100; }, 0)) };
    });
  }
  function lostReasons(DB) {
    var m = {};
    lostLeads(DB).forEach(function (l) {
      var r = l.reason || 'Not given';
      m[r] = m[r] || { reason: r, n: 0, value: 0 };
      m[r].n++; m[r].value = r2(m[r].value + num(l.value));
    });
    return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return b.value - a.value; });
  }

  /* THE FIRST GATE. Winning a lead must produce ONE party, never a second copy of one you
     already have. Two records for one customer is how a business ends up with two different
     answers to "what are they worth", and nobody can say which is right. */
  function findParty(DB, name) {
    var n = String(name || '').trim().toLowerCase();
    return (DB.parties || []).filter(function (p) { return String(p.name).trim().toLowerCase() === n; })[0] || null;
  }
  function winLead(DB, leadId, cfg) {
    var lead = (DB.leads || []).filter(function (l) { return l.id === leadId; })[0];
    if (!lead) return { ok: false, reason: 'No such lead.' };
    if (lead.status === 'won')
      return { ok: false, refused: true,
        reason: lead.name + '’s deal has already been won, and it already became ' +
          partyName(DB, lead.party) + '. Winning it twice would put the same work in the ' +
          'forecast twice and the same customer on the books twice.' };
    var existing = findParty(DB, lead.co || lead.name);
    lead.status = 'won';
    if (existing) {
      lead.party = existing.id;
      return { ok: true, party: existing.id, reused: true,
        note: existing.name + ' is already on the books, so the deal was attached to that record ' +
          'rather than a second one. Their history now includes this win.' };
    }
    var id = 'P' + ((DB.parties || []).length + 1);
    while ((DB.parties || []).some(function (p) { return p.id === id; })) id = id + 'x';
    DB.parties.push({ id: id, name: lead.co || lead.name, type: (cfg && cfg.wonType) || 'Customer',
      city: (cfg && cfg.wonCity) || '', email: '', since: dateOnly(TODAY) });
    lead.party = id;
    return { ok: true, party: id, reused: false, note: 'A new party record was opened for them.' };
  }

  /* ═══════════════ 3 · THE PARTY, AND WHAT IT IS WORTH ═══════════════ */
  function partyName(DB, id) {
    var p = (DB.parties || []).filter(function (x) { return x.id === id; })[0];
    return p ? p.name : (id || '—');
  }
  function ordersOf(DB, pid) { return (DB.orders || []).filter(function (o) { return o.party === pid; }); }
  function profile(DB, p) {
    var os = ordersOf(DB, p.id);
    var gross = r2(os.reduce(function (s, o) { return s + num(o.amount); }, 0));
    var ret = r2(os.reduce(function (s, o) { return s + num(o.returned); }, 0));
    var last = os.length ? os.map(function (o) { return o.date; }).sort().slice(-1)[0] : null;
    return { id: p.id, name: p.name, type: p.type, city: p.city, since: p.since, email: p.email,
      orders: os.length, gross: gross, returns: ret, value: r2(gross - ret),
      aov: os.length ? r2((gross - ret) / os.length) : 0,
      rr: gross ? Math.round(ret / gross * 100) : 0,
      last: last, lastAge: last ? days(last) : 9999, age: days(p.since),
      docs: docsFor(DB, 'Party', p.id).length,
      openTickets: ticketsOf(DB, p.id).filter(function (t) { return !t.closed; }).length };
  }
  function profiles(DB) { return (DB.parties || []).map(function (p) { return profile(DB, p); }); }
  function channelMix(DB, pid) {
    var m = {};
    ordersOf(DB, pid).forEach(function (o) {
      var e = m[o.channel] = m[o.channel] || { channel: o.channel, n: 0, gross: 0, ret: 0 };
      e.n++; e.gross = r2(e.gross + num(o.amount)); e.ret = r2(e.ret + num(o.returned));
    });
    return Object.keys(m).map(function (k) {
      var e = m[k]; e.kept = r2(e.gross - e.ret); e.rr = e.gross ? Math.round(e.ret / e.gross * 100) : 0; return e;
    }).sort(function (a, b) { return b.kept - a.kept; });
  }

  /* Six behaviour groups, worked out by rule from how often somebody buys and how long ago —
     never tagged by hand, so they update themselves the moment somebody buys or goes quiet. */
  var SEGMENTS = ['Champion', 'Loyal', 'Needs attention', 'At risk', 'Sleeping', 'New'];
  function segmentOf(p) {
    if (p.orders === 0) return 'New';
    if (p.lastAge > 180) return 'Sleeping';
    if (p.lastAge > 90) return 'At risk';
    if (p.orders >= 4 && p.lastAge <= 45) return 'Champion';
    if (p.orders >= 2) return p.lastAge <= 60 ? 'Loyal' : 'Needs attention';
    return 'New';
  }
  function segCounts(DB) {
    var m = {}; SEGMENTS.forEach(function (s) { m[s] = { seg: s, n: 0, value: 0 }; });
    profiles(DB).forEach(function (p) { var s = segmentOf(p); m[s].n++; m[s].value = r2(m[s].value + p.value); });
    return SEGMENTS.map(function (s) { return m[s]; });
  }
  function totalValue(DB) { return r2(profiles(DB).reduce(function (s, p) { return s + p.value; }, 0)); }
  function repeatRate(DB) {
    var ps = profiles(DB).filter(function (p) { return p.orders > 0; });
    return ps.length ? Math.round(ps.filter(function (p) { return p.orders >= 2; }).length / ps.length * 100) : 0;
  }
  function atRisk(DB) {
    return profiles(DB).filter(function (p) { return segmentOf(p) === 'At risk' || segmentOf(p) === 'Sleeping'; });
  }
  function notesOf(DB, pid) {
    return (DB.notes || []).filter(function (n) { return n.party === pid; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  }

  /* ═══════════════ 4 · DOCUMENTS ═══════════════
     A document belongs to a RECORD, not to a folder. What kind of record is a setting, not
     an assumption — a law firm files against a case, a workshop against a job, a clothing
     house against a style, and all three are this one field. */
  var DOCSTATES = ['draft', 'sent', 'signed', 'declined', 'filed'];
  function docsFor(DB, kind, id) {
    return (DB.docs || []).filter(function (d) { return d.againstKind === kind && String(d.against) === String(id); });
  }
  function docsOfParty(DB, pid) {
    /* a document is that party's if it is filed against them, or against one of their orders */
    var mine = ordersOf(DB, pid).map(function (o) { return o.id; });
    return (DB.docs || []).filter(function (d) {
      return (d.againstKind === 'Party' && d.against === pid) ||
             (d.againstKind === 'Order' && mine.indexOf(d.against) >= 0);
    });
  }
  function docByStatus(DB) {
    var m = {};
    DOCSTATES.forEach(function (s) { m[s] = 0; });
    (DB.docs || []).forEach(function (d) { m[d.status] = (m[d.status] || 0) + 1; });
    return DOCSTATES.map(function (s) { return { status: s, n: m[s] || 0 }; });
  }
  function awaitingSignature(DB) { return (DB.docs || []).filter(function (d) { return d.status === 'sent'; }); }
  function expiringSoon(DB, within) {
    within = within || 60;
    return (DB.docs || []).filter(function (d) {
      if (!d.expires) return false;
      var left = days(TODAY, d.expires);
      return left <= within;
    }).sort(function (a, b) { return a.expires < b.expires ? -1 : 1; });
  }
  function daysLeft(d) { return d.expires ? days(TODAY, d.expires) : null; }

  /* Does the record a document claims to be filed against actually exist? A document filed
     against nothing is a document nobody will ever find again. */
  function recordExists(DB, kind, id) {
    if (kind === 'Party') return (DB.parties || []).some(function (p) { return p.id === id; });
    if (kind === 'Order') return (DB.orders || []).some(function (o) { return o.id === id; });
    /* Projects, cases, jobs and people live in other modules; here they are named, and a
       named record is accepted as long as it is actually named. */
    return String(id || '').trim().length > 0;
  }
  function orphanDocs(DB) {
    return (DB.docs || []).filter(function (d) { return !recordExists(DB, d.againstKind, d.against); });
  }

  /* THE SECOND GATE. A document is not signed because somebody ticked a box. It is signed
     because a one-time code was sent to the signer and came back. No code, no signature —
     and the app will not pretend otherwise, because a signature nobody can evidence is worse
     than no signature at all. */
  function signDoc(DB, docId, code) {
    var d = (DB.docs || []).filter(function (x) { return x.id === docId; })[0];
    if (!d) return { ok: false, reason: 'No such document.' };
    if (d.status === 'signed')
      return { ok: false, refused: true, reason: d.title + ' was already signed on ' + d.signedOn + '.' };
    if (d.status === 'draft')
      return { ok: false, refused: true,
        reason: d.title + ' has not been sent to anybody yet. Send it for signature first — ' +
          'a document cannot come back signed before it goes out.' };
    if (!String(code || '').trim())
      return { ok: false, refused: true,
        reason: 'No one-time code was given. A signature is only a signature if it can be evidenced: ' +
          'the code goes to ' + (d.signer || 'the signer') + ', comes back from them, and is recorded ' +
          'against the document. Ticking a box is not a signature.' };
    if (!/^\d{6}$/.test(String(code).trim()))
      return { ok: false, refused: true,
        reason: 'A one-time code is six digits. "' + code + '" is not one, so nothing has been recorded.' };
    d.status = 'signed'; d.signedOn = dateOnly(TODAY); d.code = String(code).trim();
    return { ok: true, doc: d };
  }
  function sendDoc(DB, docId) {
    var d = (DB.docs || []).filter(function (x) { return x.id === docId; })[0];
    if (!d) return { ok: false, reason: 'No such document.' };
    if (d.status !== 'draft')
      return { ok: false, refused: true, reason: d.title + ' has already been sent — it is "' + d.status + '".' };
    if (!String(d.signer || '').trim())
      return { ok: false, refused: true,
        reason: 'Nobody is named as the signer, so there is nowhere to send the one-time code to.' };
    d.status = 'sent';
    return { ok: true, doc: d };
  }

  /* ═══════════════ 5 · TICKETS ═══════════════ */
  function ticketsOf(DB, pid) { return (DB.tickets || []).filter(function (t) { return t.party === pid; }); }
  function msgsOf(DB, tid) {
    return (DB.messages || []).filter(function (m) { return m.ticket === tid; })
      .sort(function (a, b) { return a.at < b.at ? -1 : 1; });
  }
  /* THE THIRD GATE, and the most quietly important one: the first-reply clock is WORKED OUT
     from the messages. It is not a field anybody can set. A support metric you can type is a
     support metric that will be typed. */
  function firstReplyMins(DB, t) {
    var ours = msgsOf(DB, t.id).filter(function (m) { return m.who === 'us' && m.at > t.opened; })[0];
    return ours ? mins(t.opened, ours.at) : null;
  }
  function resolveMins(DB, t) { return t.closed ? mins(t.opened, t.closed) : null; }
  function slaFirst(DB) { return num(DB.sla && DB.sla.firstReplyMins) || 120; }
  function slaResolve(DB) { return num(DB.sla && DB.sla.resolveMins) || 2880; }
  function ticketRow(DB, t) {
    var fr = firstReplyMins(DB, t), rs = resolveMins(DB, t);
    return { id: t.id, party: t.party, partyName: partyName(DB, t.party), order: t.order,
      channel: t.channel, subject: t.subject, priority: t.priority || 'Normal', agent: t.agent || '—',
      opened: t.opened, closed: t.closed || '', open: !t.closed,
      firstReply: fr, replied: fr !== null,
      firstLate: fr === null ? mins(t.opened, nowStamp()) > slaFirst(DB) : fr > slaFirst(DB),
      resolveMins: rs, resolveLate: rs !== null && rs > slaResolve(DB),
      ageMins: mins(t.opened, t.closed || nowStamp()) };
  }
  function nowStamp() { return TODAY + 'T18:00'; }
  function ticketRows(DB) { return (DB.tickets || []).map(function (t) { return ticketRow(DB, t); }); }
  function openTickets(DB) { return ticketRows(DB).filter(function (t) { return t.open; }); }
  function unanswered(DB) { return ticketRows(DB).filter(function (t) { return t.open && !t.replied; }); }
  function breached(DB) { return ticketRows(DB).filter(function (t) { return t.firstLate; }); }
  function firstReplyPct(DB) {
    var rows = ticketRows(DB).filter(function (t) { return t.replied; });
    return rows.length ? Math.round(rows.filter(function (t) { return !t.firstLate; }).length / rows.length * 100) : 0;
  }
  function medianFirstReply(DB) {
    var v = ticketRows(DB).filter(function (t) { return t.replied; }).map(function (t) { return t.firstReply; }).sort(function (a, b) { return a - b; });
    if (!v.length) return 0;
    var mid = Math.floor(v.length / 2);
    return v.length % 2 ? v[mid] : Math.round((v[mid - 1] + v[mid]) / 2);
  }
  function byChannel(DB) {
    var m = {};
    ticketRows(DB).forEach(function (t) {
      var e = m[t.channel] = m[t.channel] || { channel: t.channel, n: 0, open: 0, late: 0, replySum: 0, replied: 0 };
      e.n++; if (t.open) e.open++; if (t.firstLate) e.late++;
      if (t.replied) { e.replySum += t.firstReply; e.replied++; }
    });
    return Object.keys(m).map(function (k) {
      var e = m[k]; e.avgReply = e.replied ? Math.round(e.replySum / e.replied) : null; return e;
    }).sort(function (a, b) { return b.n - a.n; });
  }
  function byAgent(DB) {
    var m = {};
    ticketRows(DB).forEach(function (t) {
      var e = m[t.agent] = m[t.agent] || { agent: t.agent, n: 0, open: 0, closed: 0, replySum: 0, replied: 0 };
      e.n++; if (t.open) e.open++; else e.closed++;
      if (t.replied) { e.replySum += t.firstReply; e.replied++; }
    });
    return Object.keys(m).map(function (k) {
      var e = m[k]; e.avgReply = e.replied ? Math.round(e.replySum / e.replied) : null; return e;
    }).sort(function (a, b) { return b.n - a.n; });
  }
  /* A ticket may name one of that party's own orders, and no one else's. Attaching a
     complaint to a stranger's order is how support ends up telling the wrong customer about
     the wrong delivery. */
  function attachOrder(DB, ticketId, orderId) {
    var t = (DB.tickets || []).filter(function (x) { return x.id === ticketId; })[0];
    if (!t) return { ok: false, reason: 'No such ticket.' };
    if (!orderId) { t.order = ''; return { ok: true }; }
    var o = (DB.orders || []).filter(function (x) { return x.id === orderId; })[0];
    if (!o) return { ok: false, refused: true, reason: 'There is no order ' + orderId + '.' };
    if (o.party !== t.party)
      return { ok: false, refused: true,
        reason: 'Order ' + orderId + ' belongs to ' + partyName(DB, o.party) + ', and this ticket is ' +
          partyName(DB, t.party) + '’s. Attaching it would put one customer’s delivery on another ' +
          'customer’s screen.' };
    t.order = orderId;
    return { ok: true };
  }
  function reply(DB, ticketId, text) {
    var t = (DB.tickets || []).filter(function (x) { return x.id === ticketId; })[0];
    if (!t) return { ok: false, reason: 'No such ticket.' };
    if (!String(text || '').trim()) return { ok: false, reason: 'Type something first.' };
    DB.messages.push({ id: uid('msg'), ticket: ticketId, who: 'us', at: nowStamp(), text: String(text).trim() });
    return { ok: true };
  }
  function closeTicket(DB, ticketId) {
    var t = (DB.tickets || []).filter(function (x) { return x.id === ticketId; })[0];
    if (!t) return { ok: false, reason: 'No such ticket.' };
    if (t.closed) return { ok: false, refused: true, reason: 'That ticket is already closed.' };
    if (!msgsOf(DB, t.id).some(function (m) { return m.who === 'us'; }))
      return { ok: false, refused: true,
        reason: 'Nobody has answered ' + partyName(DB, t.party) + ' yet. A ticket closed without a ' +
          'single reply is a customer who was ignored and then marked "resolved" — so this is refused.' };
    t.closed = nowStamp();
    return { ok: true };
  }

  /* ═══════════════ 6 · THE TIMELINE — the reason these three are one module ═══════════════
     Everything that ever happened with one party, from all three apps, in one list. This is
     the whole argument for the module: a person on the phone should not have to open three
     programs to find out what has been going on. */
  function timeline(DB, pid) {
    var out = [];
    ordersOf(DB, pid).forEach(function (o) {
      out.push({ at: o.date, kind: 'Order', icon: 'cart', what: o.id + ' · ' + (o.channel || ''),
        detail: 'Ordered', amount: num(o.amount), extra: num(o.returned) ? 'returned ' + o.returned : '' });
    });
    docsOfParty(DB, pid).forEach(function (d) {
      out.push({ at: d.signedOn || d.issued, kind: 'Document', icon: 'doc', what: d.title,
        detail: d.type + ' · ' + d.status, amount: null,
        extra: d.status === 'signed' ? 'signed with a one-time code' : (d.expires ? 'expires ' + d.expires : '') });
    });
    ticketsOf(DB, pid).forEach(function (t) {
      var r = ticketRow(DB, t);
      out.push({ at: dateOnly(t.opened), kind: 'Ticket', icon: 'bell', what: t.subject,
        detail: t.channel + ' · ' + (r.open ? 'open' : 'closed'), amount: null,
        extra: r.replied ? 'first reply in ' + r.firstReply + ' min' : 'not answered yet' });
    });
    notesOf(DB, pid).forEach(function (n) {
      out.push({ at: n.date, kind: 'Note', icon: 'thread', what: n.kind || 'Note', detail: n.text, amount: null, extra: '' });
    });
    (DB.leads || []).filter(function (l) { return l.party === pid; }).forEach(function (l) {
      out.push({ at: l.created, kind: 'Lead', icon: 'flow', what: l.name + ' · ' + (l.co || ''),
        detail: 'Came in from ' + (l.src || 'somewhere') + ' · ' + l.status, amount: num(l.value), extra: '' });
    });
    return out.sort(function (a, b) { return a.at < b.at ? 1 : a.at > b.at ? -1 : 0; });
  }

  /* ═══════════════ 7 · IMPORT AND EXPORT ═══════════════ */
  function validate(DB, key, rec) {
    var t = TBL[key], bad = [];
    t.cols.forEach(function (c) {
      var v = rec[c.k];
      if (c.req && (v === '' || v == null)) bad.push(c.l + ' is required');
      if (c.type === 'num' && v !== '' && v != null && isNaN(v)) bad.push(c.l + ' is not a number');
      if (c.type === 'party' && v && !(DB.parties || []).some(function (p) { return p.id === v || p.name === v; }))
        bad.push('there is no party "' + v + '" — add the party first');
      if (c.type === 'date' && v && !/^\d{4}-\d{2}-\d{2}$/.test(String(v)))
        bad.push(c.l + ' must look like 2026-07-31');
      if (c.type === 'stamp' && v && !/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2})?/.test(String(v)))
        bad.push(c.l + ' must look like 2026-07-31T14:05');
    });
    /* The importer holds exactly the rules the screens hold. An import that could do what a
       form refuses would be a back door around the rule, and everybody would learn to use it. */
    if (key === 'docs') {
      if (rec.status === 'signed' && !String(rec.code || '').trim())
        bad.push('a document cannot be imported as "signed" with no one-time code against it');
      if (rec.againstKind && rec.against && !recordExists(DB, rec.againstKind, rec.against))
        bad.push('there is no ' + String(rec.againstKind).toLowerCase() + ' "' + rec.against +
          '" — a document filed against a record that does not exist can never be found from that record');
    }
    if (key === 'tickets' && rec.order) {
      var o = (DB.orders || []).filter(function (x) { return x.id === rec.order; })[0];
      if (!o) bad.push('there is no order ' + rec.order);
      else if (rec.party && o.party !== rec.party && partyName(DB, o.party) !== rec.party)
        bad.push('order ' + rec.order + ' belongs to ' + partyName(DB, o.party) + ', not to this party');
    }
    return bad;
  }
  function normalise(DB, key, rec) {
    var t = TBL[key], out = {};
    t.cols.forEach(function (c) {
      var v = rec[c.k];
      if (c.type === 'num') v = num(v);
      else v = String(v == null ? '' : v).trim();
      if (c.type === 'party' && v) {
        var hit = (DB.parties || []).filter(function (p) { return p.id === v || p.name === v; })[0];
        if (hit) v = hit.id;
      }
      out[c.k] = v;
    });
    /* A blank reference is a blank, not a mistake. The form and the importer fill it in the
       same way and in this one place, because asking somebody to invent a primary key is how
       a reference column ends up full of "1", "2", "3". Anything typed is kept as typed. */
    if (!out.id) out.id = uid(key.slice(0, 2));
    return out;
  }
  function importRows(DB, key, list) {
    var okRows = [], bad = [];
    (list || []).forEach(function (raw, i) {
      var rec = normalise(DB, key, raw), errs = validate(DB, key, rec);
      if (errs.length) bad.push({ line: i + 2, why: errs.join('; '), row: raw });
      else okRows.push(rec);   /* normalise has already given a blank reference one */
    });
    return { rows: okRows, rejected: bad };
  }
  function sheetsOf(DB) {
    var out = {};
    TABLES.forEach(function (t) {
      out[t.label] = [t.cols.map(function (c) { return c.l; })].concat(
        (DB[t.key] || []).map(function (r) { return t.cols.map(function (c) { return r[c.k] == null ? '' : r[c.k]; }); }));
    });
    return out;
  }
  function guessTable(sheetName, rows) {
    var n = String(sheetName || '').toLowerCase().replace(/[^a-z]/g, '');
    var byName = TABLES.filter(function (t) {
      var l = t.label.toLowerCase().replace(/[^a-z]/g, '');
      return n === l || n === t.key || (n.length > 3 && (n.indexOf(t.key) >= 0 || l.indexOf(n) >= 0));
    })[0];
    if (byName) return byName.key;
    if (!rows || !rows.length) return null;
    var head = (rows[0] || []).map(function (h) { return String(h).toLowerCase().replace(/[^a-z0-9]/g, ''); });
    var best = null, bestScore = 0;
    TABLES.forEach(function (t) {
      var score = t.cols.filter(function (c) {
        return head.indexOf(c.k.toLowerCase()) >= 0 || head.indexOf(c.l.toLowerCase().replace(/[^a-z0-9]/g, '')) >= 0;
      }).length;
      if (score > bestScore) { bestScore = score; best = t.key; }
    });
    return bestScore >= 2 ? best : null;
  }

  /* ═══════════════ 8 · THE SEED ═══════════════ */
  function seed(DB, CFG) {
    var clone = function (x) { return JSON.parse(JSON.stringify(x || [])); };
    DB.parties = clone(CFG.parties);
    DB.leads = clone(CFG.leads);
    DB.orders = clone(CFG.orders);
    DB.notes = clone(CFG.notes);
    DB.docs = clone(CFG.docs);
    DB.tickets = clone(CFG.tickets);
    DB.messages = clone(CFG.messages);
    DB.sla = CFG.sla || { firstReplyMins: 120, resolveMins: 2880 };
    DB.sel = DB.parties.length ? DB.parties[0].id : null;
    DB.selTicket = DB.tickets.length ? DB.tickets[0].id : null;
    DB.selDoc = DB.docs.length ? DB.docs[0].id : null;
    DB.seg = 'all'; DB.docFilter = 'all'; DB.tktFilter = 'open';
    DB.lastRefusal = null;
  }

  return {
    TODAY: TODAY, days: days, mins: mins, plural: plural, dateOnly: dateOnly, nowStamp: nowStamp,
    TABLES: TABLES, TBL: TBL, uid: uid, seed: seed,
    STAGES: STAGES, stageOf: stageOf, openLeads: openLeads, wonLeads: wonLeads, lostLeads: lostLeads,
    pipelineValue: pipelineValue, weightedPipeline: weightedPipeline, wonValue: wonValue,
    winRate: winRate, avgDeal: avgDeal, byStage: byStage, lostReasons: lostReasons,
    findParty: findParty, winLead: winLead,
    partyName: partyName, ordersOf: ordersOf, profile: profile, profiles: profiles, channelMix: channelMix,
    SEGMENTS: SEGMENTS, segmentOf: segmentOf, segCounts: segCounts, totalValue: totalValue,
    repeatRate: repeatRate, atRisk: atRisk, notesOf: notesOf,
    DOCSTATES: DOCSTATES, docsFor: docsFor, docsOfParty: docsOfParty, docByStatus: docByStatus,
    awaitingSignature: awaitingSignature, expiringSoon: expiringSoon, daysLeft: daysLeft,
    recordExists: recordExists, orphanDocs: orphanDocs, signDoc: signDoc, sendDoc: sendDoc,
    ticketsOf: ticketsOf, msgsOf: msgsOf, firstReplyMins: firstReplyMins, resolveMins: resolveMins,
    slaFirst: slaFirst, slaResolve: slaResolve, ticketRow: ticketRow, ticketRows: ticketRows,
    openTickets: openTickets, unanswered: unanswered, breached: breached,
    firstReplyPct: firstReplyPct, medianFirstReply: medianFirstReply,
    byChannel: byChannel, byAgent: byAgent, attachOrder: attachOrder, reply: reply, closeTicket: closeTicket,
    timeline: timeline,
    validate: validate, normalise: normalise, importRows: importRows, sheetsOf: sheetsOf, guessTable: guessTable
  };
})();
if (typeof Medhava !== 'undefined') Medhava.M02 = M02;
if (typeof module !== 'undefined' && module.exports) module.exports = M02;
