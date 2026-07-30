'use strict';
/* Generates MANUAL.md for each format of Module 02 · CRM.
   The whole manual sits inside one fenced block so it can be copied out in one go. */
const fs = require('fs'), path = require('path');
const { F, install, data, manual } = require('./manualparts.js');
const OUT = path.join(__dirname, 'manuals');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const CRM_SCREENS = (c) => `
════════════════════════════════════════════════════════════════════════
PART 2 · THE PARTS OF THE SCREEN
════════════════════════════════════════════════════════════════════════

  TOP BAR       The Medhava mark, the app name, then two grey pills:
                the company (${c.co}) and the financial year (FY 2026-27).
                On the right, "saved ✓" — this appears every time your work
                is written to disk. If it says "session only", your browser
                is blocking storage (usually Private mode).

  LEFT MENU     Six screens in three groups:
                  WINNING WORK  Overview · Pipeline
                  CUSTOMERS     Customers · Customer 360 · Segments & offers
                  WIRING        Wiring
                  CONNECTORS    Connectors
                  SYSTEM        Backup & Health
                On a phone this menu hides behind the ☰ button.

  CARDS         The coloured boxes across the top of each screen. Big number,
                small line underneath telling you what it means.

  PANELS        The white boxes below — tables, bars, forms and buttons.

  TAGS          The little coloured pills. Green is fine, amber means look at
                it this week, red means today.


THE ONE IDEA BEHIND THIS APP

  There are two halves to knowing a customer, and most software only does one.

    BEFORE they buy   → they are a LEAD. They sit in a pipeline, moving from
                        New to Contacted to Quoted to Negotiation, and every
                        stage carries a real probability of closing.

    AFTER they buy    → they are a CUSTOMER. Now what matters is what they
                        have actually bought, what they sent back, what they
                        are worth, and how long since you last heard from them.

  This app does both, in one record. Win a deal and the customer appears on
  the Customers screen straight away — you never re-type anybody.


════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────
SCREEN 1 · OVERVIEW
──────────────────────────────────────────────
Everything you are chasing, and everybody you have already won.

FIVE CARDS ACROSS THE TOP
  Open pipeline    Every deal still live, added up. The optimistic number.
  Likely to close  The SAME deals, each multiplied by the odds of its stage.
                   THIS IS THE HONEST NUMBER — see the box below.
  Win rate         Deals won ÷ (deals won + deals lost), as a percentage.
  Customer value   Everything your existing customers are worth — orders
                   minus returns. Not gross.
  Going cold       How many customers have not ordered in 90 days. Red the
                   moment there is one.

WHY "LIKELY TO CLOSE" IS THE NUMBER TO TRUST
  A deal that arrived yesterday and a deal where you are arguing about the
  last 2% are both "open", but they are not remotely the same thing. So each
  stage carries a probability:

      New            10%     just arrived, nothing agreed
      Contacted      25%     you have spoken, there is interest
      Quoted         50%     a price is on the table
      Negotiation    75%     down to terms

  A ₹10,00,000 deal sitting at New counts as ₹1,00,000. The same deal in
  Negotiation counts as ₹7,50,000. That is why the weighted figure is always
  smaller than the raw pipeline — and why it is the one to plan cash against.

TWO PANELS BELOW
  Pipeline by stage — a bar per stage with the deal count and the odds, then
    the raw total and the weighted total side by side.
  Who needs a call — every customer who has gone quiet, biggest worth first,
    with how long they have been silent and an "Open" button.

AND AT THE BOTTOM
  Where deals are being lost — every reason you have recorded, how many
  deals, and how much value went with them. This is the most useful table in
  the app after three months of use: if "${c.lossEg}" keeps appearing, that
  is not bad luck, it is something to fix.

──────────────────────────────────────────────
SCREEN 2 · PIPELINE    (this is where you work)
──────────────────────────────────────────────
FOUR CARDS — one per stage, showing that stage's value and its odds.

ADD A LEAD  (top panel, four boxes)
  Contact / buyer name    Who you actually talk to.
  ${c.coLabelPad}   ${c.coHint}
  Where did it come from  ${c.srcHint}
  Deal value (₹)          Your honest estimate. It does not have to be exact
                          — the odds already account for uncertainty.

  Press "Add to pipeline". It appears in the table below at the New stage.
  Both boxes matter: a lead with no name or no value is refused, because a
  pipeline full of blanks is worse than no pipeline.

THE OPEN DEALS TABLE
  Deal            Contact name, with the ${c.coWord} underneath.
  Source          Where it came from.
  Value           Your estimate.
  Stage           Which stage, and its odds.
  Worth × odds    Value × odds. What this deal is really worth to a forecast.
  Age             How many days since it arrived. TURNS RED PAST 45 DAYS —
                  an old deal at an early stage is usually a dead deal.

  THREE BUTTONS ON EVERY ROW:
    "Move on →"   Advances it exactly one stage. New → Contacted → Quoted →
                  Negotiation. It never skips, and it never goes backwards.
                  The weighted pipeline changes the moment you press it.
    "Won"         Marks it won AND creates the customer, right then. Go to the
                  Customers screen and they are there.
    "Lost"        Marks it lost and records a reason based on how far it got.
                  Lost deals leave the pipeline but stay in the record — they
                  are what the win rate and the "where deals are lost" table
                  are made of.

  Deals in Negotiation have no "Move on" button. The only way out of the last
  stage is Won or Lost.

TWO PANELS AT THE BOTTOM
  Won — every deal you have closed, with its value.
  Lost — every deal you did not, with the reason.

──────────────────────────────────────────────
SCREEN 3 · CUSTOMERS
──────────────────────────────────────────────
Everybody you have won, and what they are actually worth.

FOUR CARDS
  Customers       How many are on the books.
  Total worth     Every order ever placed, minus everything sent back.
  Repeat rate     What share of your customers have ordered more than once.
                  This single number says more about a business than
                  revenue does.
  Best customer   Who is worth the most, and how much.

SHOW ONLY  (the row of buttons)
  Everyone, or one of the six behaviour groups. The badge tells you how many
  are being shown. Click "Everyone" to clear it.

THE CUSTOMER TABLE
  Customer      Name, with type and city underneath.
  Orders        How many times they have bought.
  Gross         What they ordered, before returns.
  Returns       What came back. TURNS RED AT 15% OR MORE of gross.
  Worth         Gross minus returns. The real number.
  Avg order     Worth ÷ number of orders.
  Last order    How many days ago. TURNS RED PAST 90 DAYS.
  Tag           Which behaviour group they are in.
  "Open 360 →"  The whole record for that customer.

  THE TABLE IS SORTED BY WORTH, NOT BY GROSS. ${c.sortNote}

──────────────────────────────────────────────
SCREEN 4 · CUSTOMER 360    (one customer, everything)
──────────────────────────────────────────────
You get here by pressing "Open 360 →" on the Customers screen, or "Open" on
the Overview. "← All customers" takes you back.

THE HEADING tells you their type, their city, and how long they have been
with you in days.

FOUR CARDS
  Worth to you   Orders minus returns.
  Orders         How many, and the average size.
  Returns        How much came back, and what percentage of gross.
  Last order     How many days ago. Red past 90.

WHERE THEY STAND
  Their segment, why they are in it (in plain words — "5 orders, last one 11
  days ago"), and the agreed action for that group. The offer is not a
  suggestion from nowhere: it is the one thing everybody in your business has
  agreed to do for customers in that group, so whoever opens this record gives
  the same answer.

WHAT THEY BUY, AND WHERE IT COMES BACK
  One row per channel: how many orders, what they ordered, what came back,
  the return rate, and what they kept. ${c.mixNote}

EVERY ORDER
  Order number, date, channel, amount, what was returned, and what was kept.
  Newest first. This is read from ${c.orderSrc} — never typed in here.

CONVERSATION
  One box and one button. Type what happened on the call, the visit, the
  exhibition — and press "Add to the record". It appears below with the date,
  newest first.

  THIS IS THE ONE PLACE IN THE APP WHERE YOU ARE THE SOURCE OF TRUTH. Every
  other number is read from somewhere else. What was said and what was
  promised exists nowhere but here — so if it is not written down, it is
  gone the day the person who took the call is unavailable.

──────────────────────────────────────────────
SCREEN 5 · SEGMENTS & OFFERS
──────────────────────────────────────────────
Six groups. Every customer is in exactly one. Nobody tags anybody by hand.

THE RULES, IN PLAIN WORDS
  Champion           Bought 4+ times, and bought in the last 45 days
  Loyal              Bought 2+ times, and bought in the last 60 days
  Needs attention    Bought 2+ times, but has been quiet 60–90 days
  At risk            Has not bought in 90 days
  Sleeping           Has not bought in 180 days
  New                Bought once, or not yet at all

  The table shows how many customers are in each group, what they are worth,
  and each group's share of your total customer value as a bar. That bar is
  often the uncomfortable part — a very large share of value usually sits with
  a very small number of people.

WHAT TO SAY TO EACH GROUP
  One agreed action per group, and a button that takes you to those exact
  customers on the Customers screen with the filter already applied.

  ${c.segNote}

  The groups recalculate themselves. Nobody has to remember to update
  anything — the moment a customer orders, or stops ordering, they move.

──────────────────────────────────────────────
SCREEN 6 · WIRING
──────────────────────────────────────────────
Every figure in the app, where it comes from, and how it is worked out.

The important line on this screen: CRM OWNS THE LEAD AND THE CONVERSATION.
It owns nothing else. Worth, returns, average order and last-order date are
all READ from ${c.orderSrc}. They are never typed in here and never stored
here — which is exactly why the customer value on this screen can never
disagree with what ${c.orderSrc} says. There is only one copy of it.

Below the table, a worked example follows one deal all the way from a lead
arriving to the customer going quiet 90 days after their last order — six
steps, each one happening on its own.

──────────────────────────────────────────────
SCREEN 7 · BACKUP & HEALTH
──────────────────────────────────────────────
Four buttons and a list of tests. Covered in PART 5 and PART 6 below.
`;

const V = {
  CRM_ERP: {
    capCount: 6, altCount: 56,
    app: 'CRM & Customer 360', co: 'Acme Corp', file: 'CRM_Customer_360.html', kb: 60, tests: 29,
    key: 'medhava_crm_erp_v1', edition: 'Unified ERP — any industry',
    module: 'Module 02 · CRM — App 1 of 1',
    liveFrom: 'your other systems', orderSrc: 'the Sales module',
    lossEg: 'Price too high',
    coLabelPad: 'Company / firm      ', coHint: 'The business, if there is one.',
    coWord: 'company', srcHint: 'Website, referral, trade show, cold call, marketplace.',
    sortNote: 'A customer who orders a lot and returns a lot can easily be worth less than a quieter one who keeps what they buy — and this ordering shows you that instead of hiding it.',
    mixNote: 'If one channel is responsible for most of the returns, that is a channel problem, not a customer problem.',
    segNote: 'A Champion needs holding on to. A Sleeping customer needs one last try and then letting go. Treating them the same is how marketing budgets disappear.',
    recTitle: 'Customers who owe you', payTitle: 'Suppliers you owe',
    testEg: '  · "weighted pipeline is never more than the raw pipeline"\n  · "winning a deal takes it out of the open pipeline"\n  · "every customer lands in exactly one segment"',
    intro: [
      'CRM & Customer 360 does two jobs that most software splits into two',
      'products.',
      '',
      'Before somebody buys, they are a lead in a pipeline — moving from New to',
      'Contacted to Quoted to Negotiation, with a real probability at every stage,',
      'so your forecast is honest rather than hopeful.',
      '',
      'After they buy, the same record becomes a full customer history: every',
      'order, everything returned, what they are actually worth once returns come',
      'off, how long since you last heard from them, and which of six behaviour',
      'groups they belong to.',
      '',
      'The groups are worked out by rule, not by anybody tagging people by hand,',
      'so they stay true on their own. Win a deal and the customer appears',
      'immediately — nothing is ever typed twice.',
      '',
      'It is industry-neutral. The same engine runs a distributor, a manufacturer,',
      'a clinic or a services firm — you change the names, not the software.'
    ].join('\n')
  },
  CRM_VAS: {
    capCount: 6, altCount: 56,
    app: 'CRM & Customer 360', co: 'Vastrangam', file: 'CRM_Customer_360.html', kb: 61, tests: 29,
    key: 'medhava_crm_vastrangam_v1', edition: 'Vastrangam — ethnic-wear D2C + marketplace',
    module: 'Module 02 · CRM — App 1 of 1',
    liveFrom: 'Myntra, Flipkart or BUSY', orderSrc: 'Channel Manager and Sales',
    lossEg: 'Wanted a lower rate',
    coLabelPad: 'Boutique / firm     ', coHint: 'The boutique, the wholesale firm, or the marketplace.',
    coWord: 'boutique or firm',
    srcHint: 'Boutique enquiry, referral, exhibition, marketplace category manager, Instagram DM.',
    sortNote: 'This matters more in ethnic wear than almost anywhere. A marketplace account with a huge gross and 14% coming back can be worth less than a Jaipur boutique at 4% — and this ordering shows you that instead of hiding it.',
    mixNote: 'This is the panel that settles arguments. If Flipkart is responsible for most of a buyer’s returns while Myntra is clean, the problem is that listing — not the buyer and not the fabric.',
    segNote: 'A boutique that reorders every six weeks is worth holding on to. A chain that has been silent since last Diwali needs one win-back offer tied to the festive window, and then letting go.',
    recTitle: 'Marketplaces and buyers who owe you', payTitle: 'Mills you owe',
    testEg: '  · "weighted pipeline is never more than the raw pipeline"\n  · "winning a deal takes it out of the open pipeline"\n  · "every customer lands in exactly one segment"',
    intro: [
      "CRM & Customer 360 does two jobs for Vastrangam that most software splits",
      'into two products.',
      '',
      'Before somebody buys, they are a lead — a boutique enquiry, an exhibition',
      'contact, a marketplace category manager — moving through New, Contacted,',
      'Quoted and Negotiation, with a real probability at every stage, so the',
      'forecast is honest rather than hopeful.',
      '',
      'After they buy, the same record becomes a full history: every indent,',
      'every parcel that came back, and what that buyer is actually worth AFTER',
      'returns. In this trade that is a very different number from what they',
      'ordered — Myntra and Flipkart look enormous on gross and much smaller once',
      'the returns land, while a quiet Jaipur boutique at 4% returns can quietly',
      'be worth more.',
      '',
      'Six behaviour groups are worked out by rule, so a buyer moves group the',
      'moment they indent or go quiet. Nobody tags anybody by hand, and nothing',
      'is ever typed twice.'
    ].join('\n')
  }
};

const JOBS = [
  ['CRM_ERP', 'Medhava/01_CRM_Customer_360'],
  ['CRM_VAS', 'Vastrangam/01_CRM_Customer_360'],
];
for (const [k, dest] of JOBS) {
  const md = manual(V[k], CRM_SCREENS);
  fs.writeFileSync(path.join(OUT, k + '_MANUAL.md'), md);
  console.log(k.padEnd(10), Math.round(md.length / 1024) + 'KB', md.split('\n').length + ' lines →', dest);
}
