'use strict';
/* Generates MANUAL.md for each app × each edition of Module 02 — eight in all.
   Written for somebody who has never installed software: no jargon, no assumed knowledge,
   and every instruction is a thing you can actually do while holding the phone.
   The whole manual sits inside one fenced block so it can be copied out in one go.

   Module 01's shared idea was the two dials — period and company. Module 02 has neither.
   Its shared idea is THE ONE RECORD, and that block goes into all four manuals. */
const fs = require('fs'), path = require('path');
const { manual } = require('./manualparts.js');
const OUT = path.join(__dirname, 'manuals');
const TESTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'tests.json'), 'utf8'));
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
const T = (tag) => (TESTS[tag] || []).length;

/* ─────────── the part every app of this module shares ─────────── */
const ONE_RECORD = (c) => `
  THE ONE RECORD  This is the idea the whole module is built on, and once it
                  is clear the four apps stop being four apps.

                  A ${c.partyWord} you have never sold to yet is a LEAD.
                  It has a stage, and every stage carries a real probability.

                  You win it. The SAME record becomes the ${c.partyWord}.
                  Not a copy. Not a second entry that has to be kept in step
                  with the first. The same record.

                  And then everything hangs off it:

                    · every order and every return
                    · every document filed against them or their orders
                    · every question they have ever asked
                    · every call and visit anybody wrote down

                  WHY THIS MATTERS MORE THAN IT SOUNDS:

                  The usual arrangement is a CRM, a folder of PDFs and an
                  email inbox, none of which know about each other. Somebody
                  on the phone has three programs open and joins them up in
                  their head while a ${c.partyWord} waits.

                  Worse, the CRM usually ends up with the same ${c.partyWord}
                  entered twice — once when they were a lead, once when the
                  order came in. Now there are two answers to "what are they
                  worth", both look right, and nobody can say which is.

                  This module refuses to make the second one. Win a deal for
                  an organisation already on the books and the win attaches
                  to the record you already have.
                  ${c.winsDeals
                    ? 'You will see it happen in PART 3.'
                    : 'Winning deals belongs to CRM & Customer 360 — that is\n                  where the refusal lives. This app inherits the result: one\n                  ' + c.partyWord + ', one record, whatever you file or ask against it.'}

  WHAT IS NEVER TYPED

                  A number anybody can type is a number somebody will type.
                  These are worked out, every time the screen opens, and
                  there is no field to put them in:

                    · what a ${c.partyWord} is worth      (orders minus returns)
                    · which of six groups they are in  (how often, how recently)
                    · how fast a question was answered (from the messages)
                    · what the pipeline is likely to close (value × stage odds)

                  You will not find a "customer value" box or a "response
                  time" box anywhere in this app. That is on purpose.
`;

const TOPBAR = (c) => `
  TOP BAR       The Medhava mark, the app name, then two grey pills:
                the company (${c.co}) and the financial year (FY 2026-27).
                On the right, "saved ✓" — this appears every time your work
                is written to disk. If it says "session only", your browser
                is blocking storage (usually Private mode).
`;

/* Only the apps that can actually refuse something describe the refusal panel. The CRM app
   cannot: the one refusal its engine holds — winning the same deal twice — is unreachable
   from its screens, because a won deal has no "Mark won" button any more. Describing a panel
   somebody will never see is how a manual starts being read as decoration. */
const WHEN_WON = (c) => `
  WHAT "MARK WON" DOES
                A short message appears at the bottom of the screen, and it
                tells you WHICH of the two things happened:

                  "Won — attached to the record you already had"
                       That organisation was already a ${c.partyWord}. No
                       second record was made. Their history now includes
                       this win.

                  "Won — a new party record was opened"
                       They were genuinely new. Exactly one record appeared.

                Read it. It is the difference between a clean customer list
                and one with everybody on it twice.
`;

const REFUSAL = `
  REFUSALS      When this app will not do something, it does not show a
                small red warning you can ignore. It stops, and puts a panel
                at the top of the screen headed "That was refused", with the
                reason written out in full sentences.

                Read the reason. It is not an error message — it is the app
                telling you the thing you asked for would have made the data
                wrong. Press "Understood" to clear it.
`;

/* ═══════════════════════════════════════════════════════════════════════
   APP 1 · CRM & CUSTOMER 360
   ═══════════════════════════════════════════════════════════════════════ */
const CRM_SCREENS = (c) => `
════════════════════════════════════════════════════════════════════════
PART 2 · THE PARTS OF THE SCREEN
════════════════════════════════════════════════════════════════════════
${TOPBAR(c)}
  LEFT MENU     Six screens of its own, plus the two every Medhava app comes
                with (Connectors, and Backup & Health):
                  WINNING WORK  Overview · Pipeline
                  CUSTOMERS     Customers · Customer 360 · Segments & offers
                  WIRING        Wiring
                  CONNECTORS    Connectors
                  SYSTEM        Backup & Health
                On a phone this menu hides behind the ☰ button.
${ONE_RECORD(c)}
  CARDS         The coloured boxes across the top of each screen. Big number,
                small line underneath telling you what it means.

  PANELS        The white boxes below. Tables, bars, and buttons.
${WHEN_WON(c)}

════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────
SCREEN 1 · OVERVIEW    (what you are chasing, and what is outstanding)
──────────────────────────────────────────────
The morning screen. Both halves of the job on one page: work you are trying
to win, and people you have already won.

FIVE CARDS ACROSS THE TOP
  Open pipeline   Everything still being chased, added up. As it ships:
                  ₹25,10,000.00 across 5 live deals.
  Likely to close Every deal multiplied by its own stage odds, then added.
                  ₹12,58,500.00. THIS is the number to plan on.
  Win rate        Won deals as a share of SETTLED deals. Open deals are not
                  counted — they have not been decided yet, so including
                  them would only flatter you. 40% as it ships.
  Customers worth What everyone you have won has bought, after returns.
                  ₹18,68,300.00.
  Needs a hand    Quiet ${c.partyWord}s + open tickets + unsigned documents,
                  added together. Red if there are any.

TWO PANELS BELOW
  The pipeline, stage by stage — a bar per stage with the count and the
    odds beside it, then two totals: "Added up" and "Weighted by the odds".
    The second is always smaller. The first is the one everybody quotes in
    a meeting; the second is the one to budget on.

  What needs you — and this is the panel that proves the module is one
    module. It mixes THREE apps in one list:
        · quiet ${c.partyWord}s          (from the customer records)
        · unanswered questions      (from Helpdesk)
        · documents waiting on a signature   (from Documents)
        · anything filed against a record that does not exist
    Nobody typed any of it. Every row is worked out when the screen opens,
    and each has an "Open →" button that takes you where you can act.

──────────────────────────────────────────────
SCREEN 2 · PIPELINE    (every deal still open, honestly valued)
──────────────────────────────────────────────
FOUR CARDS
  Open deals · Open value · Likely to close · Average won deal.

THE STAGES, AND WHY THEY HAVE NUMBERS ON THEM
  New          10%     Somebody enquired.
  Contacted    25%     You have spoken.
  Quoted       50%     A price is with them.
  Negotiation  75%     They are arguing about terms, which means they want it.

  These are settings, not laws. Change them to what your business actually
  converts at. What you must not do is leave every deal at "90% — nearly
  there", which is how a forecast becomes a wish.

"EVERY OPEN DEAL" TABLE
  Deal, where it came from, stage with its odds, value, and AGE IN DAYS.
  Age turns red past 45 days. A deal nobody has touched for six weeks is
  not "still open" — it is lost and nobody has said so yet.

  Each row has a "Mark won" button. Press it and:
     · the deal leaves the open pipeline
     · the two pipeline figures drop by that amount
     · the win rate moves
     · a ${c.partyWord} record appears on Customers — OR, if that
       organisation was already on your books, NOTHING NEW APPEARS and the
       win attaches to the record you had.

  TRY IT. THIS IS THE MOST IMPORTANT THING IN THE APP.
     1. Open "Customers". Note the "Parties" card — it says 8.
     2. Open "Pipeline". Find the deal for ${c.knownLead}
        at ${c.knownCo}. That organisation is already a customer.
     3. Press "Mark won".
     4. Go back to "Customers". Still 8.
        The deal went onto the record you already had.
     5. Now go back and win ${c.strangerLead}'s deal at
        ${c.strangerCo} — an organisation you have never sold to.
     6. "Customers" now says 9.

  One record appeared because one was genuinely new. None appeared for the
  ${c.partyWord} you already had. That is the whole gate, and pressing it
  twice on the same deal is refused with a reason.

"ALREADY WON" AND "WHY DEALS WERE LOST"
  Won deals with what each one BECAME — the party record it is now attached
  to. Lost deals grouped by reason, with the money attached to each reason.
  Read the lost list before your next price decision: "price too high" at
  the top usually means the quote arrived late, not that the price was wrong.

──────────────────────────────────────────────
SCREEN 3 · CUSTOMERS    (everyone you have won, one row each)
──────────────────────────────────────────────
FOUR CARDS
  Parties · Worth (after returns) · Bought more than once · Quiet or slipping.

THE TABLE
  Party, orders, worth, return %, days since the last order, how many
  documents are on file, how many tickets are open, and which group they
  are in. Returns go red at 12%. "Last order" goes red past 90 days.

  Two of those columns — documents and open tickets — are the other two
  apps showing up on the customer list. They are read live, not copied.

THE "SHOW" BUTTONS
  Everyone, then one button per group. Press "At risk" and you have your
  call list for the week. Press it again from "Everyone" and you get the
  same list — because the group is a rule, not a label somebody applied.

  "Open →" on any row goes to that ${c.partyWord}'s full record.

──────────────────────────────────────────────
SCREEN 4 · CUSTOMER 360    (the screen the whole module exists for)
──────────────────────────────────────────────
One ${c.partyWord}, everything, one page. As it ships this opens on
${c.p1}.

FIVE CARDS
  Worth · Orders (with the average) · Returns % · Days since last order ·
  Group. Every one of them worked out. None of them typed.

"WHAT TO DO NEXT"
  The agreed action for whichever group they are in, in plain words. The
  point is that the same ${c.partyWord} gets the same answer whoever opens
  the record — the group is a rule and the action was agreed once.

"EVERYTHING THAT HAS HAPPENED"      ← read this panel first
  One list, newest at the top, colour-tagged by kind:

     Order      from Sales and the marketplaces
     Document   from Documents & eSign
     Ticket     from Helpdesk & Live Chat
     Note       a call or visit somebody wrote down
     Lead       the original enquiry they arrived as

  Five kinds of thing, three apps, one list. Nothing here was copied from
  anywhere — each line is read from the app that owns it, every time the
  screen opens. This is what "one module" means in practice, and it is why
  the person on the phone does not need three programs open.

FOUR MORE PANELS
  Where they buy       — their orders split by channel, with returns per
                         channel. ${c.channelEg}
  On file for them     — every document filed against this ${c.partyWord}
                         OR against any of their orders, with its state.
  Questions they asked — their tickets, with how fast each was answered.
  Conversation log     — calls, visits, emails. This is the one thing on
                         this screen you can add to here: pick Call / Visit
                         / Email / Meeting, write what happened, press
                         "Record it". It appears on the timeline too.

──────────────────────────────────────────────
SCREEN 5 · SEGMENTS & OFFERS    (six groups, one rule set)
──────────────────────────────────────────────
Nobody tags anybody. Every ${c.partyWord} lands in exactly one group, from
two facts only: HOW MANY TIMES they have ordered and HOW LONG AGO the last
one was.

  Champion          4+ orders, and bought within 45 days
  Loyal             2+ orders, and bought within 60 days
  Needs attention   2+ orders, but quiet for 60–90 days
  At risk           Nothing for 90–180 days
  Sleeping          Nothing for more than 180 days
  New               One order, or none yet

As it ships: 2 Champions, 1 Loyal, 1 Needs attention, 1 At risk, 1 Sleeping,
2 New.

Because it is a rule, a ${c.partyWord} moves group BY THEMSELVES the moment
they buy or go quiet. Nobody has to remember to re-tag anybody, which is
the reason hand-tagged segments are always six months out of date.

The second panel is the agreed action for each group — the same words that
appear on that ${c.partyWord}'s record. Agree them once, and everyone in
your business gives the same answer.

──────────────────────────────────────────────
SCREEN 6 · WIRING    (where every figure comes from)
──────────────────────────────────────────────
A table with one row per figure on every screen: what it is called, where
it comes from, and how it is worked out. If you ever doubt a number, this
is the screen that answers it.

Underneath, two panels: the whole life of one record from first enquiry to
last order, and — worth reading — WHAT THIS APP DELIBERATELY WILL NOT DO.

──────────────────────────────────────────────
WHAT THIS APP CANNOT DO, ON PURPOSE
──────────────────────────────────────────────
This app SHOWS documents and tickets. It cannot WORK them.

  ✗ It cannot send a document for signature, or mark one signed.
  ✗ It cannot reply to a ticket or close one.

Those are the rules of the other two apps, and rules belong with the app
that owns them. Two of this app's ${c.tests} self-tests do nothing but read
this app's own code and confirm it contains no way to sign a document or
close a ticket.

If you want all three sets of buttons on one screen, that is exactly what
APP 4 of this module is. It is in the same ZIP.
`;

/* ═══════════════════════════════════════════════════════════════════════
   APP 2 · DOCUMENTS & eSIGN
   ═══════════════════════════════════════════════════════════════════════ */
const DOC_SCREENS = (c) => `
════════════════════════════════════════════════════════════════════════
PART 2 · THE PARTS OF THE SCREEN
════════════════════════════════════════════════════════════════════════
${TOPBAR(c)}
  LEFT MENU     Three screens of its own, plus the two every Medhava app comes
                with (Connectors, and Backup & Health):
                  DOCUMENTS     Overview · All documents
                  WIRING        Wiring
                  CONNECTORS    Connectors
                  SYSTEM        Backup & Health
                On a phone this menu hides behind the ☰ button.
${ONE_RECORD(c)}
  CARDS         The coloured boxes across the top. Big number, small line
                underneath telling you what it means.

  PANELS        The white boxes below.
${REFUSAL}

════════════════════════════════════════════════════════════════════════
PART 3 · THE TWO RULES THIS APP EXISTS TO ENFORCE
════════════════════════════════════════════════════════════════════════

Everything else in this app is ordinary. These two are not, and they are
the reason it is worth having.


RULE 1 · A DOCUMENT BELONGS TO A RECORD, NOT TO A FOLDER
─────────────────────────────────────────────────────────
Every document here is filed against something that exists:

     ${c.docKinds}

Not a folder. Not a date. The record it actually belongs to.

  ${c.docKindEg}

  The same field, different words on it. Which words is a setting your
  business chooses — this app has no opinion about what industry you are in.

  WHY THIS IS A RULE AND NOT A SUGGESTION:
  There is exactly one fault that makes a filing system worthless, and it
  is not losing a document. It is having the document IN the system and
  unfindable from the only place anybody would ever look for it.

  So filing a document against a record that does not exist is REFUSED.
  Not warned about. Refused, with the reason written out.

  TRY IT:
     1. "All documents" → scroll to "File a new document".
     2. Title: anything. Filed against: Party. Which record: NO-SUCH-THING
     3. Press "File it".
     4. It refuses, and tells you the record does not exist and that a
        document filed there could never be found from that record.
     5. Now put ${c.p1code} in "Which record" and press "File it" again.
        It goes on file — and it appears on that ${c.partyWord}'s record.


RULE 2 · A SIGNATURE IS A ONE-TIME CODE, OR IT IS NOTHING
──────────────────────────────────────────────────────────
A document is not signed because somebody ticked a box. It is signed
because a six-digit code went to the named signer, came back, and was
recorded against the document.

  THE THREE STATES, IN ORDER:

     DRAFT    Written. Sent to nobody. Nothing has happened yet.
        ↓     press "Send for signature"
     SENT     A six-digit one-time code has gone to the named signer.
        ↓     press "Record the code", type the six digits they read back
     SIGNED   The code is stored against the document, with the date.

  There is no fourth route. Not a tick box, not a menu, not an import.

  WALK IT THROUGH — it takes a minute:
     1. "All documents". Find ${c.sentDoc} — an ${c.sentDocTitle}
        already sent out. Its signer is ${c.sentSigner}.
     2. Press "Record the code". A panel opens.
     3. Leave the box EMPTY and press "Mark it signed".
        → REFUSED. It says a signature is only a signature if it can be
          evidenced. The document is still "sent".
     4. Type 12ab and press it again.
        → REFUSED. Not six digits.
     5. Type any six digits — 246810 — and press it again.
        → Signed. And look at the row: the code is shown against it, and
          the date is recorded.
     6. Try to sign it a second time with a different code.
        → REFUSED, and the original code is NOT overwritten.

  You also cannot sign a DRAFT. A document cannot come back before it has
  gone out, and a draft with nobody named as signer cannot be sent at all.

  ── AND THE PASSWORD QUESTION, SINCE IT ALWAYS COMES UP ──

  A one-time code is not a password. This app never asks a signer for a
  login, and it never stores one.

     MEDHAVA WILL NEVER ASK YOU FOR A MARKETPLACE, BANK OR ACCOUNT
     PASSWORD. IF ANY SCREEN EVER DOES, IT IS NOT MEDHAVA.

  Where you would rather use an outside signature service, it connects with
  a scoped key you can revoke — never your account password. PART 4 lists
  every one it will work with, plus the built-in way that needs nobody.


════════════════════════════════════════════════════════════════════════
PART 3b · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────
SCREEN 1 · OVERVIEW    (what is outstanding across everything on file)
──────────────────────────────────────────────
FOUR CARDS
  On file                    12 documents as it ships.
  Waiting on a signature     Sent, nothing back. 2 as it ships.
  Expiring within 60 days    4. Red if there are any, and there should be.
  Filed against nothing      0 — and it must stay 0.

TWO PANELS
  By state — draft, sent, signed, declined, filed, each with a plain-English
    line saying what that state actually means.
  Expiring soonest — soonest first, days left, red inside 30 days.
    An agreement that lapses quietly is a rate that resets quietly. Whoever
    opens this app on a Monday should work down this list.

  If anything is ever filed against a record that does not exist, a red
  panel appears here listing every one. It cannot happen through the form
  or through an import — but it can happen if somebody edits a record's
  code afterwards, and this is where you would find out.

──────────────────────────────────────────────
SCREEN 2 · ALL DOCUMENTS    (the working screen)
──────────────────────────────────────────────
THE "SHOW" BUTTONS
  All · draft · sent · signed · declined · filed.

THE TABLE
  Reference, title and kind, WHAT IT IS FILED AGAINST, the signer, the
  expiry with days left, and its state. If the record it claims to be filed
  against does not exist, a red "does not exist" tag appears right there in
  the row.

  The last column changes with the state:
     draft   → "Send for signature"
     sent    → "Record the code"
     signed  → the code itself, in plain sight

  That last one is deliberate. The evidence is not buried in an audit log
  somebody has to go and ask for. It is on the row.

"FILE A NEW DOCUMENT"
  Title · Kind of document · Filed against · Which record · Who signs it ·
  Expires on.

  Leave "Who signs it" empty and the document is simply filed — not
  everything needs signing. Fill it in and you can send it.

──────────────────────────────────────────────
SCREEN 3 · WIRING
──────────────────────────────────────────────
Every figure and where it comes from, then two panels: what a signature
actually is here, in four steps, and the passwords answer above.

──────────────────────────────────────────────
WHAT THIS APP CANNOT DO, ON PURPOSE
──────────────────────────────────────────────
  ✗ It cannot create a ${c.partyWord}, an order or a ticket. It files
    documents against records other apps own.
  ✗ It cannot mark something signed any other way than the code.
  ✗ The importer cannot either — a spreadsheet claiming a document is
    "signed" with no code against it has that row refused, by name and
    line number.

That last one matters more than it looks. A form that refuses something and
an import that allows it is not a rule — it is a locked front door beside an
open back one, and everybody learns to use the back one.
`;

/* ═══════════════════════════════════════════════════════════════════════
   APP 3 · HELPDESK & LIVE CHAT
   ═══════════════════════════════════════════════════════════════════════ */
const HD_SCREENS = (c) => `
════════════════════════════════════════════════════════════════════════
PART 2 · THE PARTS OF THE SCREEN
════════════════════════════════════════════════════════════════════════
${TOPBAR(c)}
  LEFT MENU     Four screens of its own, plus the two every Medhava app comes
                with (Connectors, and Backup & Health):
                  THE DESK      Overview · Tickets · One ticket
                  WIRING        Wiring
                  CONNECTORS    Connectors
                  SYSTEM        Backup & Health
                On a phone this menu hides behind the ☰ button.
${ONE_RECORD(c)}
  CARDS         The coloured boxes across the top.

  PANELS        The white boxes below.
${REFUSAL}

════════════════════════════════════════════════════════════════════════
PART 3 · THE THREE RULES THIS APP EXISTS TO ENFORCE
════════════════════════════════════════════════════════════════════════

RULE 1 · THE FIRST-REPLY CLOCK IS WORKED OUT, NEVER TYPED
──────────────────────────────────────────────────────────
This is the one that matters, and it is worth being blunt about why.

Most helpdesk software has a "response time" field. Somebody fills it in,
or a manager corrects it, or an import sets it. Within a year the number on
the wall means nothing, everybody knows it means nothing, and the target
stops being a target.

Here there is NO SUCH FIELD. There is nowhere to put one.

  A ticket has an OPENED time — when the question arrived.
  Every message on it has a time and a side: the ${c.partyWord}, or us.
  First reply = the gap between opening and OUR FIRST MESSAGE.
  That is the entire calculation, and it runs every time a screen opens.

  As it ships: median first reply 52 min, against a target of 2 h.
  Both of those targets are settings — yours will be different.

  SEE IT HAPPEN:
     1. "Tickets" → press "Not answered yet". 3 tickets as it ships.
     2. Open ${c.quietTicket} — "${c.quietSubject}".
        First reply says "—". Nothing has been said.
     3. Type anything in the Reply box and press "Send the reply".
     4. The First reply card fills in IMMEDIATELY, and the ticket drops off
        the "not answered yet" list.

  Nothing was recalculated on a schedule and nothing was synced. The number
  appeared because the message did.


RULE 2 · A TICKET CANNOT BE CLOSED WITHOUT A SINGLE REPLY
──────────────────────────────────────────────────────────
Ignoring somebody and then marking it "resolved" is the oldest trick in
support, and it is the one that does the most damage, because it makes the
numbers look BEST exactly when the service was worst.

  TRY IT:
     1. Open any ticket on the "Not answered yet" list.
     2. Press "Close this ticket" before replying.
     3. REFUSED — and the reason says nobody has answered this ${c.partyWord}.
     4. Reply, then close it. Now it works.

  A ticket already closed cannot be closed again either.


RULE 3 · A TICKET CANNOT BE ATTACHED TO SOMEBODY ELSE'S ORDER
──────────────────────────────────────────────────────────────
This is how one ${c.partyWord} gets told about another ${c.partyWord}'s
delivery, and it is always a typo, never malice.

  TRY IT:
     1. Open a ticket. Find "Which order is this about?".
     2. Type an order number belonging to a different ${c.partyWord}.
     3. Press "Attach the order".
     4. REFUSED — and the refusal NAMES BOTH ${c.partyWord.toUpperCase()}S,
        so you can see immediately which one you meant.
     5. An order that does not exist at all is refused too.
     6. One of their own orders attaches straight away.


════════════════════════════════════════════════════════════════════════
PART 3b · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────
SCREEN 1 · OVERVIEW    (the desk right now)
──────────────────────────────────────────────
FOUR CARDS
  Open · Nobody has replied · Median first reply · Inside the target.

  "Nobody has replied" is the one to look at first thing. It is open tickets
  with not a single word back from your side, and it goes red at 1.

  "Inside the target" counts only tickets that WERE answered. A ticket
  nobody ever replied to is not a slow success; it is not counted at all,
  which stops the percentage being rescued by silence.

TWO PANELS
  Where the questions arrive — a bar per channel (${c.channelList}),
    with how many are open on each and the average first reply on each.
    A slow channel is almost always a channel nobody was given, not a
    channel that is harder.
  Who is answering — one row per person: tickets, open, closed, average
    first reply. ${c.agentEg}

  Every number in both panels is counted from the messages. Say it once
  more because it is the whole point: there is no field to type one into.

──────────────────────────────────────────────
SCREEN 2 · TICKETS    (every question asked)
──────────────────────────────────────────────
THE "SHOW" BUTTONS
  Open · Not answered yet · Closed · All.
  "Not answered yet" is your working list. Start there every morning.

THE TABLE
  Ticket number, WHO asked and what about, which channel it came in on,
  WHICH ORDER it concerns, first reply, who is handling it, and its state.
  A ticket with nothing back shows a red "not answered" tag rather than a
  comfortable "open".

──────────────────────────────────────────────
SCREEN 3 · ONE TICKET    (the screen somebody actually works on)
──────────────────────────────────────────────
FOUR CARDS
  Who (with their orders and what they are worth) · Arrived by · First
  reply against the target · State.

LEFT PANEL — THE CONVERSATION
  Every message in order, yours marked down one side, theirs down the
  other. Underneath: a Reply box, and a "Close this ticket" button that
  will refuse you if nothing has been said.

RIGHT PANEL — ALREADY KNOWN ABOUT THEM
  Worth after returns · orders · returns % · days since their last order ·
  which group they are in. Then the box to attach one of their orders, and
  underneath, every document on file for them.

  This panel is the argument for the whole module in one place. Whoever
  picks up the phone has all of that in front of them before they say a
  word — not because it was copied here, but because the ticket and the
  ${c.partyWord} record are the same records.

  A helpdesk bolted on beside a CRM cannot do this. It can only show you a
  name and let you go and look the rest up.

──────────────────────────────────────────────
SCREEN 4 · WIRING
──────────────────────────────────────────────
Every figure and its source, then the first-reply calculation written out
in four steps, and why this app sits in the same module as the customer
record.

──────────────────────────────────────────────
WHAT THIS APP CANNOT DO, ON PURPOSE
──────────────────────────────────────────────
  ✗ It cannot edit an order or a ${c.partyWord}. It reads them.
  ✗ It cannot sign a document.
  ✗ It cannot make the first-reply figure say something else.

  Six things is the whole of what it can do, and one of its ${c.tests}
  self-tests checks exactly that list and fails if anything is added to it.
`;

/* ═══════════════════════════════════════════════════════════════════════
   APP 4 · ALL THREE IN ONE
   ═══════════════════════════════════════════════════════════════════════ */
const U2_SCREENS = (c) => `
════════════════════════════════════════════════════════════════════════
PART 2 · WHAT THIS APP IS
════════════════════════════════════════════════════════════════════════

This is CRM & Customer 360, Documents & eSign AND Helpdesk & Live Chat,
all three, running over ONE set of records — plus the three things none of
them has:

     ALL THREE SETS OF BUTTONS ON ONE SCREEN.
     YOU CAN ADD, EDIT AND DELETE ANY RECORD.
     YOU CAN UPLOAD YOUR OWN SPREADSHEET.

The CRM app deliberately cannot sign a document or answer a ticket, because
those are other apps' rules. Here they are all on one screen, and every
rule still holds.

That makes this the app to test with. Win a deal here and the customer
list, that ${c.partyWord}'s documents and their tickets are all ready in
the same instant — not because anything was synced, but because there was
only ever one set of records underneath all three.
${TOPBAR(c)}
  LEFT MENU     Thirteen screens of its own, plus the two every Medhava app comes
                with (Connectors, and Backup & Health):
                  WINNING WORK  Overview · Pipeline
                  CUSTOMERS     Customers · Customer 360 · Segments & offers
                  DOCUMENTS     Documents · All documents
                  THE DESK      The desk · Tickets · One ticket
                  YOUR RECORDS  Records · Upload & download
                  WIRING        Wiring
                  CONNECTORS    Connectors
                  SYSTEM        Backup & Health
                On a phone this menu hides behind the ☰ button.
${ONE_RECORD(c)}
${REFUSAL}

════════════════════════════════════════════════════════════════════════
PART 3 · THE TEN-MINUTE TEST — DO THIS FIRST
════════════════════════════════════════════════════════════════════════

This is the fastest way to see the whole module actually working, and to
satisfy yourself that the three apps really are one system. It takes about
ten minutes and you cannot break anything — "Reload demo data" on the
Backup & Health screen puts everything back.


PART A · ONE DEAL, THREE APPS   (three minutes)

  1. Open "Customers". The "Parties" card says 8. Remember that.

  2. Open "Pipeline". Find the deal for ${c.knownLead} at
     ${c.knownCo}.
     That organisation is ALREADY on your customer list.
     Press "Mark won".

  3. Go back to "Customers". STILL 8.
     The win attached to the record you already had. No second copy.

  4. Go back to "Pipeline". That deal is NOT THERE any more — a won deal
     leaves the open list, so there is no second button to press. That is
     the first thing stopping the same work being won twice. (The engine
     refuses it as well, in so many words, if it is ever asked another
     way — an import, for instance.)

  5. Now win ${c.strangerLead}'s deal at ${c.strangerCo}.
     You have never sold to them.
     "Customers" now says 9. Exactly one appeared.

  6. Open "Customer 360" and pick that new ${c.partyWord}.
     Their timeline ALREADY carries the lead they came from.


PART B · A DOCUMENT, AND THE SIGNATURE GATE   (three minutes)

  7. Open "All documents" → "File a new document".
     Title: Test agreement
     Filed against: Party        Which record: NO-SUCH-THING
     Who signs it: Anybody
     Press "File it".
     → REFUSED. There is no such record, and a document filed there could
       never be found from the record it belongs to.

  8. Change "Which record" to ${c.p1code} and press "File it".
     → On file, as a draft.

  9. Open "Customer 360" → pick ${c.p1}.
     Your new document is already in "On file for them", and on the
     timeline. Nothing was copied.

 10. Back to "All documents". Press "Send for signature" on it.
     State becomes "sent" — a six-digit code has gone to the signer.

 11. Press "Record the code". Leave the box EMPTY. Press "Mark it signed".
     → REFUSED. A signature is only a signature if it can be evidenced.

 12. Type 246810 and press it again.
     → Signed, and the code is shown on the row.


PART C · A TICKET, AND THE CLOCK   (two minutes)

 13. Open "Tickets" → "Not answered yet". Open ${c.quietTicket}.
     First reply says "—".

 14. Press "Close this ticket".
     → REFUSED. Nobody has answered this ${c.partyWord} yet.

 15. In "Which order is this about?", type an order number belonging to a
     DIFFERENT ${c.partyWord}. Press "Attach the order".
     → REFUSED, naming both of them.

 16. Type a reply and press "Send the reply".
     First reply fills in immediately — worked out from your message.

 17. NOW press "Close this ticket". It closes.

 18. Open "Customer 360" for that ${c.partyWord}. The ticket is on their
     timeline, and their reply time is on their record.


PART D · YOUR OWN RECORDS   (two minutes)

 19. Open "Records". The "Orders" table. Note the row count.

 20. Add one:
        Order     — leave empty, it will be numbered for you
        Party     — pick ${c.p1}
        Date      — 2026-07-15
        Amount    — 50000
        Returned  — 5000
        Channel   — pick any
     Press "Add it".

 21. Open "Customer 360" for ${c.p1}. Their WORTH has gone up by
     exactly 45,000 — that is 50,000 minus the 5,000 returned. Their order
     count is up by one. The new order is on the timeline.
     Their GROUP may have changed too, on its own.

 22. Try a bad one. Add another order with Party left as it is but Date
     typed as "last Tuesday".
     → NOT ACCEPTED, with the reason, and nothing is written.

 23. Go back to "Records", find your order, press "Delete".
     Everything goes back to where it was.


  That is the module. Three apps, one set of records, every rule holding in
  all of them.


════════════════════════════════════════════════════════════════════════
PART 3b · THE TWO SCREENS THE OTHER APPS DO NOT HAVE
════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────
RECORDS    (add, edit and delete anything)
──────────────────────────────────────────────
Seven tables, one button each, with the row count on the button:

     Parties · Leads · Orders · Documents · Tickets ·
     Ticket messages · Conversation log

Pick one and you get a form above and the rows below. Each row has "Edit"
and "Delete". "Empty this table" clears the lot, and asks first.

WHAT IT WILL NOT ACCEPT
  The form checks exactly what the importer checks — the same rules, in the
  same engine, with the same sentences:
     · a row naming a ${c.partyWord} that does not exist
       ("add the party first")
     · a date that is not a date
     · a document marked "signed" with no one-time code against it
     · a ticket against somebody else's order

  When something is refused, the reason appears under the form in full and
  NOTHING IS WRITTEN. You have not half-saved anything.

A KINDNESS WORTH KNOWING
  Anywhere a ${c.partyWord} is asked for, you may give either the code
  (${c.p1code}) or the full name (${c.p1}). Both work. A typo in
  the name is refused rather than quietly creating a second ${c.partyWord},
  which is the same rule as winning a deal, in a different place.

──────────────────────────────────────────────
UPLOAD & DOWNLOAD    (your own spreadsheet, offline)
──────────────────────────────────────────────
BRINGING DATA IN
  1. "Download a blank template" gives you an Excel file with one sheet per
     table and the right headings. Fill it in — or use your own file, if it
     has recognisable headings.
  2. "Choose an .xlsx or .csv file" and pick it.
  3. NOTHING IS WRITTEN YET. You get a summary first:
        which sheet goes into which table
        how many rows
        how many accepted
        how many rejected — and EVERY rejected row listed with its LINE
        NUMBER and the reason, in plain words
  4. Then you choose:
        "Add these to what is already here"  — keeps your existing rows
        "Replace those tables entirely"      — clears them first
        "Cancel"                             — nothing happens

  Column headings are matched by name in any order, ignoring case and
  spacing. Columns it does not recognise are LEFT ALONE, not treated as an
  error — every real export carries columns you do not want.

  NO ROW IS EVER DROPPED SILENTLY. That is the difference between an import
  you can trust and an import that quietly loses 40 rows and tells you it
  imported 960.

TAKING DATA OUT
  "Download everything as Excel"   — one sheet per table, with the same
                                     headings the importer expects, so what
                                     comes out goes straight back in.
  "Download this table as CSV"     — just the table you are looking at.
  "Download a JSON backup"         — the full backup (see PART 5).

AND THE PART WORTH SAYING PLAINLY
  The spreadsheet reader and writer are written out inside this one HTML
  file. There is no library fetched from anywhere, no account, no upload to
  a server. TURN THE INTERNET OFF AND UPLOAD A SPREADSHEET — it works.

  That is not a party trick. It is the no-lock-in rule applied to the one
  button every business presses on its first day.

──────────────────────────────────────────────
EVERYTHING ELSE
──────────────────────────────────────────────
The other eleven screens are IDENTICAL to the three separate apps — same
engine file, same screen code, same rules, same refusals, same wording.
Not "kept consistent". The same functions, checked by four of this app's
${c.tests} self-tests.

  For Overview, Pipeline, Customers, Customer 360 and Segments
      → see the CRM & Customer 360 manual.
  For Documents and All documents
      → see the Documents & eSign manual.
  For The desk, Tickets and One ticket
      → see the Helpdesk & Live Chat manual.

  All three are in this ZIP.

Test here, and you have tested all three.
`;

/* ─────────── the words that change between editions ─────────── */
const COMMON = {
  ERP: {
    co: 'Acme Corp',
    edition: 'Unified ERP — any industry',
    partyWord: 'customer',
    p1: 'Northline Retail Pvt Ltd',
    p1code: 'P1',
    knownLead: 'Priya Menon', knownCo: 'Northline Retail Pvt Ltd',
    strangerLead: 'Deepak Iyer', strangerCo: 'Coastal Wholesale',
    sentDoc: 'D-2003', sentDocTitle: 'NDA', sentSigner: 'Vikram Nair',
    quietTicket: 'T-503', quietSubject: 'Disputing the return credit',
    docKinds: 'Party · Order · Project or case · Person',
    docKindEg: 'A law practice files against a CASE. A workshop files against a JOB.\n  A distributor files against an ORDER. An HR record files against a PERSON.',
    channelEg: 'A channel with 14% returns and a big gross number can\n                         easily earn you less than a quiet one at 2%.',
    channelList: 'Live chat, Email, Phone, WhatsApp',
    agentEg: 'Three people as it ships: R. Nair, S. Kulkarni,\n    A. Deshpande.',
  },
  VAS: {
    co: 'Vastrangam',
    edition: 'Vastrangam — its own buyers, mills and marketplaces',
    partyWord: 'buyer',
    p1: 'Rajmandir Wholesale (Surat)',
    p1code: 'P1',
    knownLead: 'Priya Menon', knownCo: 'Rajmandir Wholesale (Surat)',
    strangerLead: 'Deepak Iyer', strangerCo: 'Coastal Ethnic Wholesale',
    sentDoc: 'D-2003', sentDocTitle: 'NDA', sentSigner: 'Vikram Nair',
    quietTicket: 'T-503', quietSubject: 'Disputing the marketplace return credit',
    docKinds: 'Party · Order · Style or job · Person',
    docKindEg: 'A clothing house files against a STYLE or a JOB. A mill agreement\n  files against the PARTY. A lab test report files against the ORDER\n  it was cut from.',
    channelEg: 'Flipkart at 14% returns on a big gross number can\n                         easily earn less than the website at 11% on a\n                         smaller one.',
    channelList: 'Live chat, Email, Phone, WhatsApp',
    agentEg: 'Three people as it ships: R. Nair, S. Kulkarni,\n    A. Deshpande.',
  },
};

/* ─────────── the apps ─────────── */
const APPS = [
  { tag: 'CRM', dir: 'crm', screens: CRM_SCREENS, app: 'CRM & Customer 360',
    slug: 'CRM_Customer_360', kb: 138, key: 'crm_', n: 1, winsDeals: true,
    companion: 'Documents & eSign · Helpdesk & Live Chat · and all three in one',
    testEg: '  · "winning it attaches to the record we already had"\n' +
            '  · "and does NOT create a second party"\n' +
            '  · "nobody is tagged by hand — no party record carries a group"\n' +
            '  · "the timeline carries orders, documents, tickets and notes together"',
    intro: [
      'CRM & Customer 360 does two jobs with ONE record.',
      '',
      'Before somebody buys, that record is a LEAD — sitting in a pipeline, at a',
      'stage, with a real probability against it, so the forecast is honest',
      'instead of hopeful.',
      '',
      'When you win it, THE SAME RECORD becomes the customer. Never a second',
      'copy. Two records for one customer is exactly how a business ends up with',
      'two different answers to "what are they worth" and nobody able to say',
      'which one is right.',
      '',
      'From then on that record carries everything: every order, every return,',
      'what they are actually worth, which of six behaviour groups they fall',
      'into — and, because this module has one spine, every document filed',
      'against them and every question they have ever asked.',
      '',
      'The screen that shows all of it at once is Customer 360, and it is the',
      'reason these three apps are one module rather than three products.',
    ].join('\n') },
  { tag: 'DOC', dir: 'docs', screens: DOC_SCREENS, app: 'Documents & eSign',
    slug: 'Documents_eSign', kb: 136, key: 'docs_', n: 2, winsDeals: false,
    companion: 'CRM & Customer 360 · Helpdesk & Live Chat · and all three in one',
    testEg: '  · "marking it signed with no code at all is refused"\n' +
            '  · "the code is recorded against the document, not thrown away"\n' +
            '  · "a document claiming to be signed with no code is refused on import"\n' +
            '  · "and the reason says it could never be found from that record"',
    intro: [
      'Every agreement, certificate, challan and scan filed against THE RECORD',
      'IT BELONGS TO — not into a folder. Against the order, the party, the',
      'project or case, the person. Then it is found by opening that record,',
      'which is how anybody actually looks for a document.',
      '',
      'Two rules this app will not bend, and PART 3 walks you through both:',
      '',
      '  1. A signature means a six-digit one-time code went to the named',
      '     signer, came back, and is recorded against the document.',
      '     No code, no signature. Not a tick box, not a menu, not an import.',
      '',
      '  2. A document cannot be filed against a record that does not exist.',
      '     That is the one fault that makes a filing system useless — the',
      '     document is in the system and unfindable from the only place',
      '     anybody would look.',
      '',
      'A one-time code is not a password. Medhava will never ask you for a',
      'marketplace, bank or account password.',
    ].join('\n') },
  { tag: 'HD', dir: 'helpdesk', screens: HD_SCREENS, app: 'Helpdesk & Live Chat',
    slug: 'Helpdesk_Live_Chat', kb: 137, key: 'helpdesk_', n: 3, winsDeals: false,
    companion: 'CRM & Customer 360 · Documents & eSign · and all three in one',
    testEg: '  · "there is no field anywhere holding a response time"\n' +
            '  · "its first-reply time is the gap to our first message, worked out"\n' +
            '  · "a ticket with no reply on it cannot be closed"\n' +
            '  · "attaching another party’s order to a ticket is refused"',
    intro: [
      'A question arriving by chat, email, phone or message becomes a ticket',
      'against the party who asked it — and usually against the order it is',
      'about. Whoever picks it up has the whole history already on the screen:',
      'what that customer bought, what came back, what is on file for them, and',
      'what they asked last time.',
      '',
      'The rule that matters most here: THE FIRST-REPLY TIME IS WORKED OUT FROM',
      'THE MESSAGES. It is not a field. There is nowhere to type it, nowhere to',
      'import it, and no way to round it. A support number anybody can type is',
      'a support number that will be typed, and then the figure on the wall',
      'stops meaning anything at all.',
      '',
      'Two more refusals, both because a ticket is a real person waiting:',
      'a ticket cannot be closed without a single reply on it, and a ticket',
      'cannot be attached to somebody else’s order.',
    ].join('\n') },
  { tag: 'U2', dir: 'm02unified', screens: U2_SCREENS, app: 'Module 02 · All three apps in one',
    slug: 'All_Three_In_One', kb: 177, key: 'm02_', n: 4, winsDeals: true,
    companion: 'CRM & Customer 360 · Documents & eSign · Helpdesk & Live Chat (the same three, separately)',
    testEg: '  · "one party’s timeline carries all three apps at once"\n' +
            '  · "filing a document against a party puts it on their record"\n' +
            '  · "an import refuses a ticket against somebody else’s order"\n' +
            '  · "what this app exports, this app can import again with nothing rejected"',
    intro: [
      'This is CRM & Customer 360, Documents & eSign and Helpdesk & Live Chat,',
      'all three, running over ONE set of records — plus the three things none',
      'of them has: all three sets of buttons on one screen, the ability to add,',
      'edit and delete any record, and the ability to upload your own',
      'spreadsheet.',
      '',
      'That makes it the app to test with. Win a deal and watch the customer',
      'list, that customer’s documents and their tickets all be ready in the',
      'same instant. Not because anything is kept in step — because there is',
      'only one set of records underneath all three.',
      '',
      'PART 3 is a ten-minute test that shows you exactly that, including every',
      'refusal. Do it first.',
      '',
      'Everything else in this app is identical to the three separate ones —',
      'same engine file, same screens, same rules, same self-tests. Test here,',
      'and you have tested all three.',
    ].join('\n') },
];

/* ─────────── write them ─────────── */
const ED = { ERP: 'MEDHAVA', VAS: 'VASTRANGAM' };
let n = 0;
for (const a of APPS) {
  for (const edKey of ['ERP', 'VAS']) {
    const tag = a.tag + '_' + edKey;
    const c = Object.assign({}, COMMON[edKey], {
      app: a.app, kb: a.kb, tests: T(tag), winsDeals: a.winsDeals,
      /* the name the file actually carries when it comes out of the ZIP, so somebody
         looking for it in Downloads finds exactly what the manual told them to look for */
      file: `${ED[edKey]}_M02_App0${a.n}_${a.slug}.html`,
      key: 'medhava_' + a.key + (edKey === 'ERP' ? 'erp' : 'vastrangam') + '_v1',
      companion: a.companion,
      module: 'Module 02 · CRM — App ' + a.n + ' of 4',
      capCount: 0, altCount: 0,   /* filled below from the app's own declaration */
      testEg: a.testEg, intro: a.intro,
    });
    /* the connector counts come from the app itself, never from a typed number */
    const core = fs.readFileSync(path.join(__dirname, a.dir, 'core.js'), 'utf8');
    const uses = (/uses\s*:\s*\[([^\]]*)\]/.exec(core)[1]).split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
    const CAPS = require('./../providers.js').CAPS.filter(x => uses.indexOf(x.id) >= 0);
    c.capCount = CAPS.length;
    c.altCount = CAPS.reduce((s, x) => s + x.providers.length, 0);

    const md = manual(c, a.screens);
    const f = path.join(OUT, tag + '_MANUAL.md');
    fs.writeFileSync(f, md);
    console.log(tag.padEnd(10), Math.round(md.length / 1024) + 'KB', String(md.split('\n').length).padStart(4) + ' lines →',
      (edKey === 'ERP' ? 'Medhava/' : 'Vastrangam/') + '0' + a.n + '_' + a.slug);
    n++;
  }
}
console.log('\n' + n + ' manuals written');
