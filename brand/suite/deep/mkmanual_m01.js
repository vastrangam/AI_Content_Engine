'use strict';
/* Generates MANUAL.md for each app × each format of Module 01.
   The whole manual sits inside one fenced block so it can be copied out in one go. */
const fs = require('fs'), path = require('path');
const { F, install, data, manual } = require('./manualparts.js');
const OUT = path.join(__dirname, 'manuals');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
/* ─────────── app-specific bodies ─────────── */

const DASH_SCREENS = (c) => `
════════════════════════════════════════════════════════════════════════
PART 2 · THE PARTS OF THE SCREEN
════════════════════════════════════════════════════════════════════════

  TOP BAR       The Medhava mark, the app name, then two grey pills:
                the company (${c.co}) and the financial year (FY 2026-27).
                On the right, "saved ✓" — this appears every time your work
                is written to disk. If it says "session only", your browser
                is blocking storage (usually Private mode).

  LEFT MENU     Six screens in three groups:
                  COMMAND     Overview · Sales & Channels · Money
                  OPERATIONS  Stock & Making · Alerts
                  WIRING      Wiring
                  CONNECTORS  Connectors
                  SYSTEM      Backup & Health
                On a phone this menu hides behind the ☰ button.

  PERIOD ROW    April · May · June · July · Full year.
                THIS IS THE MOST IMPORTANT CONTROL IN THE APP.
                Click any of them and EVERY number on EVERY screen is
                worked out again for that period. Nothing is pre-calculated
                and nothing is left stale.

  CARDS         The coloured boxes across the top of each screen. Big number,
                small line underneath telling you what it means.

  PANELS        The white boxes below. Tables, bars, and buttons.


════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────
SCREEN 1 · OVERVIEW    (this is the "how are we doing" screen)
──────────────────────────────────────────────
This is the one screen to look at each morning.

FIVE CARDS ACROSS THE TOP
  Net sales     What you sold, AFTER returns have been taken off.
                Not the number the marketplace dashboard shows you.
  Net profit    What is actually left. Net sales, minus ${c.cogs},
                minus wages, minus every running cost. The percentage
                underneath is that profit as a share of net sales.
  Cash + bank   Your real position right now. This one deliberately does
                NOT change when you switch period, because a balance is a
                balance — it is not "profit for June".
  To collect    Money other people owe you.
  Open alerts   How many things need a decision. Red if there are any.

TWO PANELS BELOW
  Net sales by month — a bar per month, with that month's profit written
    beside it, then the best month and the four-month totals. The badge in
    the heading ("+12% last month") compares the newest month with the one
    before it.
  What needs you — the top six alerts. Each has an "Open →" button that
    jumps you straight to the screen where you can do something about it.

WHAT TO CLICK
  · Any period button — watch every figure change.
  · "Open →" on any alert — goes to the relevant screen.

──────────────────────────────────────────────
SCREEN 2 · SALES & CHANNELS   (which channel actually earns)
──────────────────────────────────────────────
The point of this screen is one uncomfortable question: which of your
channels looks big but is not?

FOUR CARDS
  Gross sales   Everything sold, before returns. The flattering number.
  Returns       What came back, and what percentage of gross that is.
                Turns red above 10%.
  Net sales     Gross minus returns. The honest number.
  Units sold    Pieces, not rupees.

THE CHANNEL TABLE
  One row per channel: gross, returns, return %, net, units, and a tag.
  Return % turns red at 12% or above, and the tag says "returns high".
  ${c.channelNote}

  Below it, the same channels drawn as bars by NET sales — so the ranking
  you see is the ranking that matters.

WHAT TO CLICK
  · The period buttons. A channel that looks fine over the full year can
    look very different in a single month. Check month by month.

──────────────────────────────────────────────
SCREEN 3 · MONEY    (who owes you, who you owe)
──────────────────────────────────────────────
FOUR CARDS
  Cash + bank    Your live balance.
  To collect     Total owed to you, and how many of those are overdue.
  To pay         Total you owe, and how many are already late.
  Net position   Cash + what you are owed − what you owe. The number that
                 tells you whether you are actually comfortable.

TWO TABLES
  ${c.recTitle} — amount, age in days, and a tag:
     "ok" under 30 days · "overdue" over 30 · "chase now" over 60.
  ${c.payTitle} — amount, days remaining or days late, and a tag:
     "on time" · "late" · "very late" over 60 days.

THE PROFIT BUILD-UP PANEL (at the bottom — read this one slowly)
  This is your profit worked out line by line, so you can see exactly where
  the money went:
       Net sales
     − ${c.cogsLine}
     − Making / wages
     = Gross profit
     − Running expenses
     = Net profit
  Every one of those lines moves when you change the period.

──────────────────────────────────────────────
SCREEN 4 · STOCK & MAKING
──────────────────────────────────────────────
FOUR CARDS
  Stock value    Everything you are holding, valued at what it cost you.
  Running out    How many items have fallen to or below their reorder point.
  Pieces made    What the floor finished in this period.
  Making cost    Wages paid for that output.

STOCK ON HAND TABLE
  Code, item, quantity, the reorder point, and the value. The tag on the
  right is the useful bit:
      "reorder"  at or below the reorder point — order it today
      "low"      within twice the reorder point — order it this week
      "ok"       fine

PRODUCTION BY MONTH TABLE
  Pieces made, wages paid, and cost per piece. Cost per piece is the number
  to watch: if wages climb faster than pieces, each piece is costing more
  and your margin is quietly shrinking.

──────────────────────────────────────────────
SCREEN 5 · ALERTS    (the to-do list the system writes for you)
──────────────────────────────────────────────
Nobody types these in. The app works them out from your live figures every
time the screen opens. Four rules produce them:

  1. An item has fallen to or below its reorder point.        → urgent
  2. Somebody has owed you money for more than 30 days.       → watch
     (more than 60 days → urgent)
  3. A bill you owe has gone past its due date.               → watch
     (more than 60 days late → urgent)
  4. A channel's return rate has reached 12% or more.         → watch

WHAT TO CLICK
  · "Look"  — jumps to the screen where the problem lives.
  · "Clear" — you have dealt with it; it disappears from the list.
  · "Bring them all back" — undoes every clear you have made.

IMPORTANT: clearing an alert does not change your business. It only says
"I have seen this". If the underlying situation gets worse, the alert comes
straight back on its own.

──────────────────────────────────────────────
SCREEN 6 · WIRING    (where every number comes from)
──────────────────────────────────────────────
Read this screen once and you will never wonder where a figure came from.

It lists every single number on the dashboard in three columns:
     the figure · which part of the business it comes from · how it is
     worked out.

Below that, a worked example that follows one sale all the way through —
sale recorded → net sales moves → stock falls → maybe an alert appears →
customer balance rises → profit recalculates.

And the honest statement: THIS DASHBOARD WRITES NOTHING. It only reads.
Clearing an alert is the only thing it ever stores. That is on purpose —
a dashboard that can change your books is a dashboard you cannot trust.

──────────────────────────────────────────────
SCREEN 7 · BACKUP & HEALTH
──────────────────────────────────────────────
Four buttons and a list of tests. Covered in PART 5 and PART 6 below.
`;

const REP_SCREENS = (c) => `
════════════════════════════════════════════════════════════════════════
PART 2 · THE PARTS OF THE SCREEN
════════════════════════════════════════════════════════════════════════

  TOP BAR       The Medhava mark, the app name, then two grey pills:
                the company (${c.co}) and the financial year (FY 2026-27).
                On the right, "saved ✓" — this appears every time your work
                is written to disk.

  LEFT MENU     Four screens:
                  REPORTS  Build a report · Ready-made · My saved reports
                  WIRING   Wiring
                  CONNECTORS  Connectors
                  SYSTEM   Backup & Health
                On a phone this menu hides behind the ☰ button.

  THE BUILDER   Three numbered steps down the page, and the answer at the
                bottom. You never have to press "calculate" — the answer is
                already there and it updates as you change things.


════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────
SCREEN 1 · BUILD A REPORT
──────────────────────────────────────────────
Think of it as asking a question in three parts.

STEP 1 · WHAT DO YOU WANT TO LOOK AT?
  Five buttons. Click one.

    Sales           One row for every channel in every month.
                    ${c.salesNote}
    Money owed      Everybody who owes you and everybody you owe, in one
                    list, each aged in days.
    Stock           Everything you are holding, valued at cost, with
                    anything below its reorder point flagged.
    Running costs   Rent, salaries, ${c.costEg} — month by month.
    Production      What the floor finished each month and what it cost.

  The grey line underneath tells you what one row of that source means.
  Changing the source resets steps 2 and 3, because a filter about
  channels makes no sense once you are looking at stock.

STEP 2 · HOW SHOULD IT BE ARRANGED?
  Four dropdowns:

    Group the rows by   The most important choice. Group ${c.groupEg}
                        Or choose "Do not group" to see every single
                        record, one per line.
    Sort by             Name, or any of the number columns, or how many
                        records went into each row.
    Order               Biggest first, or smallest first.
    Show only top       All rows, or just the top 3 / 5 / 10.

  Then press "Run this report".

  ONE THING WORTH KNOWING: if you choose "Top 5", the table shows five
  rows — but the Total line at the bottom still adds up EVERY matching
  row, and it says so. A total that silently only counts what is on screen
  is how people end up with wrong numbers.

STEP 3 · LEAVE ANYTHING OUT? (filters — optional)
  Three boxes and an "Add filter" button.

    Field       Which column to test.
    Condition   For words:    is · is not · contains
                For numbers:  >=  ·  <=  ·  >  ·  <
    Value       What to compare against. Type it in.

  Press "Add filter" and it appears as a blue chip under the boxes. Add as
  many as you like — a record must satisfy ALL of them to be counted.
  Click the × on a chip to drop that one filter, or "Remove all filters".

  EXAMPLES YOU WILL ACTUALLY USE:
    ${c.filterEg1}
    ${c.filterEg2}
    ${c.filterEg3}

THE RESULT PANEL
  The badge in the heading says "20 of 20 records" — how many rows survived
  your filters out of how many exist. Watch that number when you add a
  filter; it tells you immediately whether the filter did what you meant.

  Then the table, one row per group, every measure added up, how many
  records went into it, and a bar showing its share.
  Then the Total line.
  Then "Download CSV" — top-right of the panel. Opens in Excel or Google
  Sheets, and includes the total row.

KEEP THIS REPORT
  Type a name, press "Save report".
  What gets saved is THE QUESTION, not the answer. Save "Which mills are
  past due" today, run it next month, and it tells you about next month.

──────────────────────────────────────────────
SCREEN 2 · READY-MADE
──────────────────────────────────────────────
Nine reports already built, each answering a question owners actually ask.
Each card tells you what it looks at, how it is grouped, and what has been
filtered out — so nothing is hidden from you.

Press "Load & run →" and it drops straight into the builder, already run.
From there change anything you like: it is now your report, not ours.

The nine are:
${c.templateList}

──────────────────────────────────────────────
SCREEN 3 · MY SAVED REPORTS
──────────────────────────────────────────────
Everything you have saved. For each one you see the name, the source, how
it is grouped, how many filters it carries, how many rows it returns, and —
the useful column — THE ANSWER IF YOU RUN IT RIGHT NOW, recalculated on the
spot every time this screen opens.

  "Run"    loads it back into the builder so you can change it.
  "Delete" removes it. There is no undo, but rebuilding takes ten seconds.

──────────────────────────────────────────────
SCREEN 4 · WIRING
──────────────────────────────────────────────
Where every report gets its numbers. Five sources, what feeds each one, and
what a single row of it means.

Below that, exactly what happens the moment you press Run:
  1. The source is read fresh — never from a stored copy.
  2. Your filters drop the rows you did not want.
  3. What is left is grouped and added up.
  4. It is sorted and trimmed to your Top N — but the Total still counts
     every matching row.
  5. Saving keeps the question, not the answer.

And the reason the numbers always agree with the CEO Dashboard: both apps
read the same records and use the same rules. A report grouped by channel
with no filters adds up to exactly the net sales figure on the dashboard.
This is not a promise — it is one of the self-tests.

──────────────────────────────────────────────
SCREEN 5 · BACKUP & HEALTH
──────────────────────────────────────────────
Four buttons and a list of tests. Covered in PART 5 and PART 6 below.
`;

/* ─────────── the four builds ─────────── */

const V = {
  DASH_ERP: {
    capCount: 4, altCount: 34,
    app: 'CEO Dashboard', co: 'Acme Corp', file: 'CEO_Dashboard.html', kb: 49, tests: 14,
    key: 'medhava_dashboard_erp_v1', companion: 'Report Builder', edition: 'Unified ERP — any industry',
    module: 'Module 01 · Dashboard & BI — App 1 of 2',
    cogs: 'what you bought', cogsLine: 'Purchases', liveFrom: 'your other systems',
    recTitle: 'Customers who owe you', payTitle: 'Suppliers you owe',
    channelNote: 'A channel with 14% returns and a big gross number can easily earn you\n  less than a quiet channel with 2% returns. This table is where you see it.',
    testEg: '  · "net sales = gross − returns"\n  · "period filter works: months add up to all"\n  · "clearing an alert removes it"',
    intro: [
      'The CEO Dashboard is the one screen that answers three questions:',
      'did we make money, is the cash safe, and what needs me today.',
      '',
      'It is not a data-entry app. You will never type a figure into it. Every',
      'number on it is worked out from records the rest of the business already',
      'keeps — sales, purchases, stock, wages, expenses. That is the point: if a',
      'figure here is wrong, the record behind it is wrong, and the Wiring screen',
      'tells you which one to go and look at.',
      '',
      'It is industry-neutral. The same engine runs a textile business, a medical',
      'distributor, a manufacturer or a services firm — you change the master data,',
      'not the software.'
    ].join('\n')
  },
  DASH_VAS: {
    capCount: 4, altCount: 34,
    app: 'CEO Dashboard', co: 'Vastrangam', file: 'CEO_Dashboard.html', kb: 49, tests: 14,
    key: 'medhava_dashboard_vastrangam_v1', companion: 'Report Builder', edition: 'Vastrangam — ethnic-wear D2C + marketplace',
    module: 'Module 01 · Dashboard & BI — App 1 of 2',
    cogs: 'fabric and trims bought', cogsLine: 'Fabric & trims purchased', liveFrom: 'your marketplace panels',
    recTitle: 'Marketplaces and buyers who owe you', payTitle: 'Mills you owe',
    channelNote: 'This matters more here than almost anywhere else. Flipkart at 14% returns\n  on a big gross number can easily earn less than the website at 11% on a\n  smaller one. The gross figure on a marketplace dashboard hides this.\n  This table does not.',
    testEg: '  · "net sales = gross − returns"\n  · "period filter works: months add up to all"\n  · "clearing an alert removes it"',
    intro: [
      'The CEO Dashboard is the one screen that answers three questions about',
      'Vastrangam: did we make money, is the cash safe, and what needs me today.',
      '',
      'It is not a data-entry app. You will never type a figure into it. Every',
      'number is worked out from what the business already records — marketplace',
      'orders and returns, fabric bought, karigar wages, stock, running costs.',
      '',
      'The one thing it insists on: RETURNS COME OFF BEFORE ANYTHING IS CALLED',
      '"NET". Myntra and Flipkart will both show you a gross figure that feels',
      'excellent. This dashboard shows you what is left after the returns come',
      'back, because that is the money that reaches the bank.'
    ].join('\n')
  },
  REP_ERP: {
    capCount: 5, altCount: 42,
    app: 'Report Builder', co: 'Acme Corp', file: 'Report_Builder.html', kb: 54, tests: 25,
    key: 'medhava_reports_erp_v1', companion: 'CEO Dashboard', edition: 'Unified ERP — any industry',
    module: 'Module 01 · Dashboard & BI — App 2 of 2',
    liveFrom: 'your other systems',
    salesNote: 'Returns are already taken off before anything is called "Net".',
    costEg: 'marketing, logistics', groupEg: 'sales by channel to compare channels, or\n                        by month to see a trend.',
    filterEg1: '· Only one channel:        Channel · is · Retail Stores',
    filterEg2: '· Only overdue money:      Days · > · 30',
    filterEg3: '· Only what to reorder:    Status · is · Reorder now',
    testEg: '  · "grouped totals equal the ungrouped total"\n  · "Top 3 still totals ALL matching rows, not just 3"\n  · "a saved report reruns to the same answer"',
    templateList: [
      '  1. Which channel actually earns the most?',
      '  2. Where are returns eating the profit?',
      '  3. How is each month trending?',
      '  4. Who has not paid me?',
      '  5. What am I about to be chased for?',
      '  6. Where is my money sitting in stock?',
      '  7. What do I have to reorder now?',
      '  8. What are my biggest running costs?',
      '  9. Is the floor getting cheaper or dearer?'
    ].join('\n'),
    intro: [
      'The Report Builder lets you ask your own data almost any question, without',
      'writing a formula and without waiting for anyone.',
      '',
      'You do three things: pick what to look at, pick how to arrange it, and',
      'optionally leave some of it out. The answer appears immediately — there is',
      'no "generating report" wait.',
      '',
      'The important idea: when you save a report, you are saving THE QUESTION,',
      'not the answer. Run it again next month and it recalculates on next',
      "month's data. Build a question once, use it forever."
    ].join('\n')
  },
  REP_VAS: {
    capCount: 5, altCount: 42,
    app: 'Report Builder', co: 'Vastrangam', file: 'Report_Builder.html', kb: 54, tests: 25,
    key: 'medhava_reports_vastrangam_v1', companion: 'CEO Dashboard', edition: 'Vastrangam — ethnic-wear D2C + marketplace',
    module: 'Module 01 · Dashboard & BI — App 2 of 2',
    liveFrom: 'your marketplace panels',
    salesNote: 'Myntra and Flipkart returns are already taken off\n                    before anything is called "Net".',
    costEg: 'ad spend, courier', groupEg: 'sales by channel to settle the\n                        Myntra-vs-Flipkart argument, or by month to see the\n                        season.',
    filterEg1: '· Only Myntra:             Channel · is · Myntra',
    filterEg2: '· Only overdue money:      Days · > · 30',
    filterEg3: '· Only fabric to reorder:  Status · is · Reorder now',
    testEg: '  · "grouped totals equal the ungrouped total"\n  · "Top 3 still totals ALL matching rows, not just 3"\n  · "a saved report reruns to the same answer"',
    templateList: [
      '  1. Myntra or Flipkart — which one actually pays?',
      '  2. Where are returns eating the margin?',
      '  3. How is the season trending?',
      '  4. Which settlements are still stuck?',
      '  5. Which mills are already past due?',
      '  6. Where is the cash sitting in fabric?',
      '  7. What must be reordered before the next cut?',
      '  8. What are the biggest running costs?',
      '  9. Is the karigar floor getting cheaper or dearer?'
    ].join('\n'),
    intro: [
      "The Report Builder lets you ask Vastrangam's own data almost any question,",
      'without writing a formula and without waiting for anyone.',
      '',
      'You do three things: pick what to look at, pick how to arrange it, and',
      'optionally leave some of it out. The answer appears immediately.',
      '',
      'It reads the same records as the CEO Dashboard and applies the same rules,',
      'so a report can never disagree with the dashboard. Marketplace returns are',
      'always taken off before anything is called "net" — which is why the answer',
      'to "Myntra or Flipkart?" here is often not the one the marketplace',
      'dashboards suggest.',
      '',
      'When you save a report you are saving THE QUESTION, not the answer. Run it',
      "again next month and it recalculates on next month's data."
    ].join('\n')
  }
};

const JOBS = [
  ['DASH_ERP', DASH_SCREENS, 'Medhava/01_CEO_Dashboard'],
  ['DASH_VAS', DASH_SCREENS, 'Vastrangam/01_CEO_Dashboard'],
  ['REP_ERP', REP_SCREENS, 'Medhava/02_Report_Builder'],
  ['REP_VAS', REP_SCREENS, 'Vastrangam/02_Report_Builder'],
];
for (const [k, screens, dest] of JOBS) {
  const md = manual(V[k], screens);
  const f = path.join(OUT, k + '_MANUAL.md');
  fs.writeFileSync(f, md);
  console.log(k.padEnd(10), Math.round(md.length / 1024) + 'KB', md.split('\n').length + ' lines →', dest);
}
