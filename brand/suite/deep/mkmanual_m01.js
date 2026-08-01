'use strict';
/* Generates MANUAL.md for each app × each edition of Module 01 — eight in all.
   Written for somebody who has never installed software: no jargon, no assumed knowledge,
   and every instruction is a thing you can actually do while holding the phone.
   The whole manual sits inside one fenced block so it can be copied out in one go. */
const fs = require('fs'), path = require('path');
const { manual } = require('./manualparts.js');
const OUT = path.join(__dirname, 'manuals');
const TESTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'tests.json'), 'utf8'));
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

/* ─────────── the part every app of this module shares ─────────── */
const DIALS = (c) => `
  THE TWO DIALS   Above most screens sit two rows of buttons.

                  PERIOD:   April · May · June · July · Full year
                  COMPANY:  All companies · ${c.coList}

                  These are the most important controls in the app.
                  Press any of them and EVERY number on EVERY screen is
                  worked out again. Nothing is pre-calculated, nothing is
                  left stale, and there is no "refresh" to remember.

                  ONE THING TO UNDERSTAND, AND THEN THE APP MAKES SENSE:

                    · Sales, profit, costs and output are PERIOD figures.
                      They change when you change either dial.

                    · Cash, stock, money owed to you and money you owe are
                      BALANCES. They do NOT change when you change the
                      period — because "cash in April" is not a thing —
                      but they DO change when you change the company,
                      because "${c.oneCo}'s cash" is a real number in a
                      real bank account.

                  Most spreadsheet dashboards filter everything by the date
                  column, which quietly turns a bank balance into nonsense.
                  This one does not.
`;

/* ─────────── app-specific screen tours ─────────── */

const DASH_SCREENS = (c) => `
════════════════════════════════════════════════════════════════════════
PART 2 · THE PARTS OF THE SCREEN
════════════════════════════════════════════════════════════════════════

  TOP BAR       The Medhava mark, the app name, then two grey pills:
                the company (${c.co}) and the financial year (FY 2026-27).
                On the right, "saved ✓" — this appears every time your work
                is written to disk. If it says "session only", your browser
                is blocking storage (usually Private mode).

  LEFT MENU     Seven screens in three groups:
                  COMMAND     Overview · Sales & Channels · Money
                  OPERATIONS  Stock & Making · Companies · Alerts
                  WIRING      Wiring
                  CONNECTORS  Connectors
                  SYSTEM      Backup & Health
                On a phone this menu hides behind the ☰ button.
${DIALS(c)}
  CARDS         The coloured boxes across the top of each screen. Big number,
                small line underneath telling you what it means.

  PANELS        The white boxes below. Tables, bars, and buttons.


════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────
SCREEN 1 · OVERVIEW    (the "how are we doing" screen)
──────────────────────────────────────────────
This is the one screen to look at each morning.

FIVE CARDS ACROSS THE TOP
  Net sales     What you sold, AFTER returns have been taken off.
                Not the number the marketplace dashboard shows you.
  Net profit    What is actually left. Net sales, minus ${c.cogs},
                minus wages, minus every running cost. The percentage
                underneath is that profit as a share of net sales.
  Cash + bank   Your real position right now.
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
  · Any company button — watch them all change again, differently.
  · "Open →" on any alert — goes to the relevant screen.

READ IT IN THIS ORDER: Net profit (did we earn?), then Cash + bank
(are we safe?), then Open alerts (what needs me?). Thirty seconds.

──────────────────────────────────────────────
SCREEN 2 · SALES & CHANNELS   (which channel actually earns)
──────────────────────────────────────────────
The point of this screen is one uncomfortable question: which of your
channels looks big but is not?

FOUR CARDS
  Gross sales             Everything sold, before returns. The flattering one.
  Returns                 What came back, and what percentage of gross that
                          is. Turns red above 10%.
  Net sales               Gross minus returns. The honest number.
  Sold outside the group  Gross again, but with your own companies' billing
                          to each other left out. This is "business we won".

THE CHANNEL TABLE
  One row per channel: gross, returns, return %, net, units, and a tag.
  Return % turns red at 12% or above, and the tag says "returns high".
  ${c.channelNote}

  A row tagged "own group" is one of your companies billing another. It is
  real money for that company and it is NOT a sale for the group — which is
  exactly what Group Consolidation takes back out.

  Below the table, the same channels drawn as bars by NET sales — so the
  ranking you see is the ranking that matters.

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
  ${c.recTitle} — amount, which company it belongs to, age in days, and a tag:
     "ok" under 30 days · "overdue" over 30 · "chase now" over 60.
  ${c.payTitle} — amount, company, days remaining or days late, and a tag:
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
  Every one of those lines moves when you change either dial.

──────────────────────────────────────────────
SCREEN 4 · STOCK & MAKING
──────────────────────────────────────────────
FOUR CARDS
  Stock value    Everything you are holding, valued at what it cost you.
  Running out    How many items have fallen to or below their reorder point.
  Pieces made    What the floor finished in this period.
  Making cost    Wages paid for that output.

STOCK ON HAND TABLE
  Code, item, which company holds it, quantity, the reorder point, and the
  value. The tag on the right is the useful bit:
      "reorder"  at or below the reorder point — order it today
      "low"      within twice the reorder point — order it this week
      "ok"       fine

PRODUCTION BY MONTH TABLE
  Pieces made, wages paid, and cost per piece. Cost per piece is the number
  to watch: if wages climb faster than pieces, each piece is costing more
  and your margin is quietly shrinking.

──────────────────────────────────────────────
SCREEN 5 · COMPANIES
──────────────────────────────────────────────
The same figures, one row per company: net sales, profit, cash, stock, and
whether that company has a tax registration of its own.

  "Look at only this"   sets the company dial to that company, so every
                        other screen narrows to it.
  "Back to all companies"  puts it back.

BELOW IT, A SECOND LIST: THE NAMES YOU SELL UNDER.
  ${c.brandNote}
  A trading name is NOT a company. Its orders are the sales of the company
  it belongs to, counted once, under that company. The two lists are kept
  apart on purpose so nobody can quietly turn a name into a business and
  double a figure.

THIS SCREEN ONLY READS. Adding a company, removing internal billing and
working out who may file a return all live in Group Consolidation, the third
app of this module — or in the combined app, where you can also press the
buttons.

──────────────────────────────────────────────
SCREEN 6 · ALERTS    (the to-do list the system writes for you)
──────────────────────────────────────────────
Nobody types these in. The app works them out from your live figures every
time the screen opens. Five rules produce them:

  1. An item has fallen to or below its reorder point.        → urgent
  2. Somebody has owed you money for more than 30 days.       → watch
     (more than 60 days → urgent)
  3. A bill you owe has gone past its due date.               → watch
     (more than 60 days late → urgent)
  4. A channel's return rate has reached 12% or more.         → watch
  5. A company in the group has no tax registration.          → watch
     Not a fault — a fact to know. It counts in every group figure
     and it cannot file a return.

WHAT TO CLICK
  · "Look"  — jumps to the screen where the problem lives.
  · "Clear" — you have dealt with it; it disappears from the list.
  · "Bring them all back" — undoes every clear you have made.

IMPORTANT: clearing an alert does not change your business. It only says
"I have seen this". If the underlying situation gets worse, the alert comes
straight back on its own.

──────────────────────────────────────────────
SCREEN 7 · WIRING    (where every number comes from)
──────────────────────────────────────────────
Read this screen once and you will never wonder where a figure came from.

It lists every single number on the dashboard in three columns:
     the figure · which part of the business it comes from · how it is
     worked out.

Below that, a worked example that follows one sale all the way through, and
the honest statement: THIS DASHBOARD WRITES NOTHING. It only reads. Clearing
an alert is the only thing it ever stores. That is on purpose — a dashboard
that can change your books is a dashboard you cannot trust.

And it is checked rather than promised: two of the self-tests read this app's
own code and confirm that not one of its actions can add, change or delete
a record.

──────────────────────────────────────────────
SCREEN 8 · BACKUP & HEALTH
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
                  REPORTS     Build a report · Ready-made · My saved reports
                  WIRING      Wiring
                  CONNECTORS  Connectors
                  SYSTEM      Backup & Health
                On a phone this menu hides behind the ☰ button.
${DIALS(c)}
  THE BUILDER   Three numbered steps down the page, and the answer at the
                bottom. You never have to press "calculate" — the answer is
                already there and it updates as you change things.


════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────
SCREEN 1 · BUILD A REPORT
──────────────────────────────────────────────
Think of it as asking a question in three parts. The two dials above decide
which records the question can see AT ALL; the three steps then shape it.

STEP 1 · WHAT DO YOU WANT TO LOOK AT?
  Six buttons. Click one.

    Sales           One row per company, per channel, per month.
                    ${c.salesNote}
    Money owed      Everybody who owes you and everybody you owe, in one
                    list, each aged in days.
    Stock           Everything you are holding, valued at cost, with
                    anything below its reorder point flagged.
    Running costs   Rent, salaries, ${c.costEg} — month by month.
    Production      What the floor finished each month and what it cost.
    Purchases       What you bought in, by ${c.supplierWord} and month.

  The grey line underneath tells you what one row of that source means.
  Changing the source resets steps 2 and 3, because a filter about
  channels makes no sense once you are looking at stock.

STEP 2 · HOW SHOULD IT BE ARRANGED?
  Four dropdowns:

    Group the rows by   The most important choice. Group ${c.groupEg}
                        Every source can also be grouped by COMPANY.
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
    · Drop your own internal billing:
        Channel · is not · Between our own companies

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
  What gets saved is THE QUESTION, not the answer. Save "${c.saveEg}"
  today, run it next month, and it tells you about next month.

──────────────────────────────────────────────
SCREEN 2 · READY-MADE
──────────────────────────────────────────────
Eleven reports already built, each answering a question owners actually ask.
Each card tells you what it looks at, how it is grouped, and what has been
filtered out — so nothing is hidden from you.

Press "Load & run →" and it drops straight into the builder, already run.
From there change anything you like: it is now your report, not ours.

The eleven are:
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
Where every report gets its numbers. Six sources, what feeds each one, and
what a single row of it means.

Below that, exactly what happens the moment you press Run:
  1. The source is read fresh — never from a stored copy.
  2. The period and company you picked decide what is in scope at all.
  3. Your filters drop the rows you did not want.
  4. What is left is grouped, added up, sorted, and trimmed to your Top N —
     but the Total still counts every matching row.
  5. Saving keeps the question, not the answer.

And the reason the numbers always agree with the CEO Dashboard: the two apps
are not two programs kept carefully in step. They are ONE ENGINE FILE built
into two apps. A report grouped by channel with no filters adds up to exactly
the net sales figure on the dashboard. This is not a promise — it is one of
the self-tests.

──────────────────────────────────────────────
SCREEN 5 · BACKUP & HEALTH
──────────────────────────────────────────────
Four buttons and a list of tests. Covered in PART 5 and PART 6 below.
`;

const GRP_SCREENS = (c) => `
════════════════════════════════════════════════════════════════════════
PART 2 · THE PARTS OF THE SCREEN
════════════════════════════════════════════════════════════════════════

  TOP BAR       The Medhava mark, the app name, then two grey pills:
                the company (${c.co}) and the financial year (FY 2026-27).

  LEFT MENU     Six screens:
                  THE GROUP   Group figures · Company by company ·
                              Between your companies
                  SET UP      Companies & names · Who may file
                  WIRING      Wiring
                  CONNECTORS  Connectors
                  SYSTEM      Backup & Health

  PERIOD ROW    April · May · June · July · Full year.
                There is NO company dial in this app, on purpose — this
                app's whole job is all of your companies at once. Every
                table here already has one row per company.


════════════════════════════════════════════════════════════════════════
PART 3 · THE THREE RULES THIS APP EXISTS TO ENFORCE
════════════════════════════════════════════════════════════════════════

Adding up several companies is easy. Adding them up HONESTLY takes three
rules, and this app enforces all three itself — they are not policies
somebody has to remember on a busy Friday.

RULE 1 · WHAT YOUR COMPANIES BILLED EACH OTHER COMES BACK OUT
  A group cannot sell to itself. ${c.icExample}
  That bill is completely real for the company that raised it and for the
  company that paid it. It is not revenue for the group.

  It comes out of group sales AND out of group purchases — and it never
  touches group profit, because it was income to one and a cost to another,
  so the two halves already cancelled.

RULE 2 · A COMPANY WITH NO TAX REGISTRATION IS STILL A COMPANY
  ${c.unregExample}
  It counts in every group figure — sales, costs, cash, stock, all of it.
  And it is REFUSED entry to a tax return.

  Those are two different questions. Most software answers both the same
  way: say "no" to both and you lose a real company out of your group
  figures; say "yes" to both and you file something you should not have.

RULE 3 · A NAME YOU SELL UNDER IS NOT A COMPANY
  ${c.brandExample}
  Making it a company of its own would count the same orders twice, in
  group sales, in group profit, and in every share you quote. So it is
  refused — and you can try it yourself, see Screen 4.


════════════════════════════════════════════════════════════════════════
PART 4 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────
SCREEN 1 · GROUP FIGURES
──────────────────────────────────────────────
FIVE CARDS: group net sales (after removing internal billing), group profit,
group cash, group stock, and how many companies there are — with how many of
them have a registration.

THE LEFT PANEL IS THE WHOLE POINT OF THIS APP.
  It does not just show you the group total. It shows the total BEING
  ARRIVED AT, line by line:

       Every company's net sales, added up
     − What your companies billed each other
     = Group net sales

       Every company's purchases, added up
     − The same internal billing, on the buying side
     = Group purchases

     − Making / wages
     − Running costs
     = Group profit

  Notice the elimination appears twice and cancels itself. That is the point.

  A consolidated figure you cannot reconstruct is a figure you cannot defend
  to a bank, a buyer or an auditor.

THE RIGHT PANEL shows where the sales came from, company by company, and
then two lines that are worth reading together:
     Sold outside the group          ← business you won
     Billed between your own companies ← work moving inside the group
  Only the first one grows the business.

──────────────────────────────────────────────
SCREEN 2 · COMPANY BY COMPANY
──────────────────────────────────────────────
One row per company: net sales, purchases, wages, running costs, profit,
margin, and whether it can file a return.

A group total is an average with the arguments removed. This screen puts
them back.
  · A company with good sales and a NEGATIVE margin is being carried.
  · A company with cash and no stock is a trading arm; one with stock and
    no cash is a making arm. Do not judge them by the same margin.
  · Balances do not move when you change the period — they are positions.

The "Added together" line at the bottom is the group figure BEFORE the
elimination. The gap between that and the headline on Screen 1 is exactly
what your companies billed each other.

──────────────────────────────────────────────
SCREEN 3 · BETWEEN YOUR OWN COMPANIES
──────────────────────────────────────────────
Every internal invoice in the period, and — side by side — the two group
sales figures: the one without the removal, and the one with it.

This is how a group quotes a turnover far larger than it earned without
anybody lying. Nobody removed the internal billing.

It is never hidden, either. An internal invoice travels on its own channel
so it can be separated — but it stays on the books of the company that
raised it, because for that company it is the whole living.

──────────────────────────────────────────────
SCREEN 4 · COMPANIES & NAMES
──────────────────────────────────────────────
FOUR CARDS: how many companies, how many your plan covers, how much room is
left, and how many trading names.

  ADD A COMPANY
    Short code, name, tax registration (LEAVE IT EMPTY if it has none),
    and what it does. Press "Add company".

    A company with no registration is perfectly normal — a job-work arm,
    a new venture, a branch that bills through another.

  REMOVE A COMPANY
    Refused if it still has records against it, and the refusal tells you
    how many. Those records would be left belonging to nobody and every
    group figure would quietly change. Move or delete them first.

  THE BUTTON WORTH PRESSING: "Try making this a company"
    It sits on every trading name. Press it. It refuses, and the refusal
    explains that those orders are already counted under the company the
    name belongs to.

    That button is there on purpose. A rule you can read is a rule you half
    believe; a rule you can try to break, and watch refuse, is one you
    understand.

  HOW MANY COMPANIES YOU MAY HAVE
    The software sets NO limit. Your plan does. Fill the plan up and try
    to add one more: the refusal names the plan and says the software has
    no limit of its own.

──────────────────────────────────────────────
SCREEN 5 · WHO MAY FILE
──────────────────────────────────────────────
Every company, with its registration, its net sales for the period, a
column that says "always" under "Counts in group figures", and a button.

  On a REGISTERED company:  press it and you get that company's own
                            figures — gross, returns, net, purchases.
                            Its own, not the group's, because a return is
                            filed by a company and not by a group.

  On an UNREGISTERED one:   press it and it REFUSES, in words, with the
                            reason. This is the app doing its job. A return
                            filed for a company that has no registration is
                            not a small mistake — it is a filing in somebody
                            else's name.

WHEN THE COMPANY DOES GET REGISTERED
  Put the number on it in Companies & names. Nothing else changes: same
  records, same group figures, and from that moment it can build a return.
  No migration, no re-entry, no second company.

──────────────────────────────────────────────
SCREEN 6 · WIRING · and SCREEN 7 · BACKUP & HEALTH
──────────────────────────────────────────────
Wiring lists every group figure, its source and its arithmetic, plus the
three rules in one place. Backup & Health is covered in PART 5 and PART 6.
`;

const UNI_SCREENS = (c) => `
════════════════════════════════════════════════════════════════════════
PART 2 · WHAT THIS APP IS
════════════════════════════════════════════════════════════════════════

This is the CEO Dashboard, the Report Builder AND Group Consolidation, all
running over ONE set of records — plus the two things none of them has:

     YOU CAN CHANGE THE RECORDS.
     YOU CAN UPLOAD A SPREADSHEET OF THEM.

That makes it the app to test with. Add a sale here and the overview, every
report and the group roll-up all move in the same instant. Not because they
are kept in step — because there is only one set of numbers underneath all
three, and one set of sums.

  LEFT MENU     Sixteen screens in five groups:
                  COMMAND       Overview · Sales & Channels · Money ·
                                Stock & Making · Alerts
                  REPORTS       Build a report · Ready-made · My saved reports
                  THE GROUP     Group figures · Company by company ·
                                Between your companies · Who may file
                  YOUR RECORDS  Records · Upload & download · Companies & names
                  WIRING        Wiring
                  CONNECTORS    Connectors
                  SYSTEM        Backup & Health
${DIALS(c)}

════════════════════════════════════════════════════════════════════════
PART 3 · THE FIVE-MINUTE TEST — DO THIS FIRST
════════════════════════════════════════════════════════════════════════

This is the fastest way to see the whole module actually working. It takes
about five minutes and you cannot break anything — the last step puts it
all back.

  1. Open "Overview". Write down the NET SALES figure on a piece of paper.

  2. Open "Build a report". It is already showing Sales grouped by channel.
     Look at the TOTAL line at the bottom. It is the same number. Write it
     down too, if you like.

  3. Open "Group figures". Look at GROUP NET SALES. It is smaller —
     and the panel underneath shows you exactly why: the billing between
     your own companies has been taken out.

  4. Now open "Records". Make sure the "Sales" table is selected.
     Fill in the form:
         Company  — pick any
         Month    — July 2026
         Channel  — pick any
         Gross    — 20000
         Returns  — 2000
         Units    — 12
     Press "Add it".

  5. Go back to "Overview". NET SALES has gone up by exactly 18,000
     (that is 20,000 minus the 2,000 of returns).

  6. Go to "Build a report". The TOTAL has gone up by 18,000 too.

  7. Go to "Group figures". GROUP NET SALES has gone up by 18,000 as well.

     Nothing was refreshed. Nothing was synced. There was only ever one
     number, shown in three places.

  8. Go back to "Records", find the row you added (it is at the bottom),
     and press "Delete".

  9. Check all three screens again. Every figure is back exactly where it
     started.

That is the whole idea of this module, in five minutes.


════════════════════════════════════════════════════════════════════════
PART 4 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────
THE COMMAND, REPORTS AND GROUP SCREENS
──────────────────────────────────────────────
These are the SAME screens as the three separate apps in this module — not
versions of them, the same ones, built from the same file. So everything the
CEO Dashboard manual, the Report Builder manual and the Group Consolidation
manual say about them is true here as well.

  Overview · Sales & Channels · Money · Stock & Making · Alerts
      → see the CEO Dashboard manual
  Build a report · Ready-made · My saved reports
      → see the Report Builder manual
  Group figures · Company by company · Between your companies ·
  Who may file · Companies & names
      → see the Group Consolidation manual

Below are the two screens that exist ONLY here.

──────────────────────────────────────────────
SCREEN · RECORDS    (add, edit, delete anything)
──────────────────────────────────────────────
A row of buttons across the top — one per table, with a badge showing how
many rows it holds. Click one to work on that table.

  THE TABLES
    Companies              Every legal entity you run
    Trading names          Names you sell under (NOT companies)
    Sales                  One company, one channel, one month
    Purchases              What you bought in
    Running costs          Rent, salaries, ${c.costEg}
    Production             What was finished, and the wages for it
    Stock                  What you are holding, at what it cost
    Money owed to you      Unpaid invoices, with their age
    Money you owe          Unpaid bills, with how late they are
    Opening balances       What each company started the year with
    Between your own companies   One of your companies invoicing another

  TO ADD A ROW
    Fill in the form and press "Add it". Company and Month are dropdowns,
    so you cannot mistype them.

  TO CHANGE A ROW
    Press "Edit" on the row. The form above fills with it. Change what you
    like, press "Save changes". Or "Cancel" and nothing happens.

  TO DELETE A ROW
    Press "Delete". It goes immediately and every figure moves. There is no
    undo — so if it matters, take a backup first (Backup & Health →
    Export JSON, four seconds).

  "EMPTY THIS TABLE" at the bottom clears the whole table. It asks you to
  confirm first.

  WHAT GETS REFUSED, AND WHY
    · Something required left out → refused, naming the field.
    · A company that does not exist → refused: "add the company first".
      It will NOT quietly create one. A typo should not become a fourth
      business.
    · Something that is not a month in the month box → refused.

    The same rules apply whether you type a row or upload it. There is one
    set of rules in the engine, used by both — so a row you could not upload
    is a row you cannot type either, with the same sentence explaining why.

──────────────────────────────────────────────
SCREEN · UPLOAD & DOWNLOAD
──────────────────────────────────────────────

BRINGING YOUR OWN DATA IN

  THE EASY WAY, FIRST TIME:
    1. Press "Download a blank template". You get an Excel file with one
       sheet per table and exactly the right headings.
    2. Paste your data into it in Excel.
    3. Press "Choose an .xlsx or .csv file" and pick it.

  IF YOU ALREADY HAVE A SPREADSHEET:
    Just choose it. Headings are matched by NAME, in any order, ignoring
    capitals and spaces — "Net Sales", "net_sales" and "netsales" all land
    in the same place. Columns we do not recognise are LEFT ALONE, not
    treated as an error: a real export from a bank or a marketplace panel
    always has columns you do not want.

    A company column accepts either the short code or the full name.

  WHAT HAPPENS NEXT — NOTHING, YET.
    The app reads the file and SHOWS YOU what it found:
        which sheet, which table it goes into, how many rows,
        how many accepted, how many rejected.
    And under that, EVERY rejected row with its line number and the reason.

    Nothing has been written to your data at this point. Then you choose:

      "Add these to what is already here"  — the usual choice.
      "Replace those tables entirely"      — when the spreadsheet is the
                                             truth and the app should match.
      "Cancel"                             — nothing happened.

    NO ROW IS EVER DROPPED SILENTLY, and no row is ever quietly "fixed".
    Accepted plus rejected always equals what was in your file.

TAKING YOUR DATA OUT

  "Download everything as Excel"  — one sheet per table, with the same
                                    headings the importer expects. So what
                                    comes out can go straight back in.
  "Download this table as CSV"    — just the table you are looking at.
  "Download a JSON backup"        — the exact backup file described in
                                    PART 5.

WHY THE EXCEL READER IS INSIDE THIS FILE
  Every other business app loads a spreadsheet library from somebody else's
  server. The day that server is slow, blocked or gone, the one button every
  customer presses on day one stops working — and the app was never really
  offline.

  So the whole thing is written out inside this file: the zip reader, the
  decompressor, the Excel parser. About four hundred lines.

  TEST IT IN TEN SECONDS: turn off your WiFi, reload the page, and upload a
  spreadsheet. It works, because there was never anything to fetch.

──────────────────────────────────────────────
SCREEN · BACKUP & HEALTH
──────────────────────────────────────────────
Four buttons and a list of tests. Covered in PART 5 and PART 6 below.
`;

/* ─────────── the eight builds ─────────── */
const T = k => TESTS[k].length;

const COMMON = {
  ERP: {
    co: 'Acme Corp', edition: 'Unified ERP — any industry',
    coList: 'Acme Manufacturing · Acme Exports · Acme Workshop',
    oneCo: 'Acme Manufacturing', cogs: 'what you bought', cogsLine: 'Purchases',
    liveFrom: 'your other systems', recTitle: 'Customers who owe you', payTitle: 'Suppliers you owe',
    costEg: 'marketing, logistics', supplierWord: 'supplier',
    channelNote: 'A channel with 14% returns and a big gross number can easily earn you\n  less than a quiet channel with 2% returns. This table is where you see it.',
    brandNote: 'Acme Manufacturing sells under its own name on its storefront and as\n  "AcmePro" on a marketplace. One company, two names, one set of sales.',
    icExample: 'Here, Acme Workshop does assembly work for the two\n  selling companies and invoices them for it.',
    unregExample: 'Acme Workshop has no tax registration of its own — it only does\n  job work for the group.',
    brandExample: '"AcmePro" is a marketplace seller name belonging to Acme\n  Manufacturing. Every order under it is invoiced as Acme Manufacturing.',
    salesNote: 'Returns are already taken off before anything is called "Net".',
    groupEg: 'sales by channel to compare channels, by\n                        month to see a trend, or by company.',
    saveEg: 'Which channels are worth the effort',
    filterEg1: '· Only one channel:        Channel · is · Export',
    filterEg2: '· Only overdue money:      Days · > · 30',
    filterEg3: '· Only what to reorder:    Status · is · Reorder now',
    templateList: [
      '   1. Which channel actually earns the most?',
      '   2. Which company is carrying the group?',
      '   3. Where are returns eating the profit?',
      '   4. How is each month trending?',
      '   5. Who has not paid me?',
      '   6. What am I about to be chased for?',
      '   7. Where is my money sitting in stock?',
      '   8. What do I have to reorder now?',
      '   9. What are my biggest running costs?',
      '  10. Which supplier am I most exposed to?',
      '  11. Is the floor getting cheaper or dearer?'
    ].join('\n'),
  },
  VAS: {
    co: 'Vastrangam', edition: 'Vastrangam — its own companies, mills and marketplaces',
    coList: 'Ethnic Fashion · Vastrangam · Adini Couture',
    oneCo: 'Ethnic Fashion', cogs: 'fabric and trims bought', cogsLine: 'Fabric & trims purchased',
    liveFrom: 'your marketplace panels', recTitle: 'Marketplaces and buyers who owe you', payTitle: 'Mills you owe',
    costEg: 'ad spend, courier', supplierWord: 'mill',
    channelNote: 'This matters more here than almost anywhere else. Flipkart at 14% returns\n  on a big gross number can easily earn less than the website at 11% on a\n  smaller one. The gross figure on a marketplace dashboard hides this.\n  This table does not.',
    brandNote: 'Go4Fashion belongs to Ethnic Fashion. Vastrangam and ADINI are both\n  seller names belonging to the Vastrangam company — every Adini order on\n  Flipkart is invoiced as Vastrangam.',
    icExample: 'Here, Adini Couture does the stitching for the other\n  two companies and invoices them for it.',
    unregExample: 'Adini Couture has no GSTIN of its own — it only does job work for\n  Ethnic Fashion and Vastrangam.',
    brandExample: '"Adini" is a Flipkart seller name belonging to the\n  Vastrangam company. Every order under it is invoiced as Vastrangam.\n  (Adini COUTURE, confusingly, IS a separate company. Both facts are true\n  at once, and this app keeps them apart.)',
    salesNote: 'Marketplace returns are already taken off before\n                    anything is called "Net".',
    groupEg: 'sales by channel to settle the Myntra-vs-\n                        Flipkart argument, by month for the season, or by\n                        company.',
    saveEg: 'Which mills are past due',
    filterEg1: '· Only Myntra:             Channel · is · Myntra',
    filterEg2: '· Only overdue money:      Days · > · 30',
    filterEg3: '· Only fabric to reorder:  Status · is · Reorder now',
    templateList: [
      '   1. Myntra or Flipkart — which one actually pays?',
      '   2. Which company is carrying the group?',
      '   3. Where are returns eating the margin?',
      '   4. How is the season trending?',
      '   5. Which settlements are still stuck?',
      '   6. Which mills are already past due?',
      '   7. Where is the cash sitting in fabric?',
      '   8. What must be reordered before the next cut?',
      '   9. What are the biggest running costs?',
      '  10. Which mill am I most exposed to?',
      '  11. Is the karigar floor getting cheaper or dearer?'
    ].join('\n'),
  }
};

const APPS = [
  { tag: 'DASH', screens: DASH_SCREENS, app: 'CEO Dashboard', file: 'CEO_Dashboard.html',
    slug: '01_CEO_Dashboard', kb: 141, key: 'medhava_dashboard_', n: 1,
    companion: 'Report Builder · Group Consolidation · and all three in one',
    testEg: '  · "net sales = gross − returns"\n  · "every company added together equals the group"\n  · "a balance ignores the period but not the company"\n  · "not one of them can add, change or delete a record"',
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
      'Two controls govern everything: WHICH PERIOD and WHICH COMPANY. Part 2',
      'explains the one rule that makes both of them make sense.',
    ].join('\n') },
  { tag: 'REP', screens: REP_SCREENS, app: 'Report Builder', file: 'Report_Builder.html',
    slug: '02_Report_Builder', kb: 145, key: 'medhava_reports_', n: 2,
    companion: 'CEO Dashboard · Group Consolidation · and all three in one',
    testEg: '  · "grouped totals equal the ungrouped total"\n  · "Top 3 still totals ALL matching rows, not just 3"\n  · "grouping by company or by channel gives the same total"\n  · "a report grouped by channel equals the dashboard\'s net sales"',
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
      "month's data. Build a question once, use it forever.",
    ].join('\n') },
  { tag: 'GRP', screens: GRP_SCREENS, app: 'Group Consolidation', file: 'Group_Consolidation.html',
    slug: '03_Group_Consolidation', kb: 141, key: 'medhava_groupcons_', n: 3,
    companion: 'CEO Dashboard · Report Builder · and all three in one',
    testEg: '  · "removing internal billing never changes group profit"\n  · "asking for its return is refused, not warned about"\n  · "turning a trading name into a company is refused"\n  · "the refusal blames the plan, not the software"',
    intro: [
      'Group Consolidation adds every company you run into one set of figures.',
      '',
      'That sounds simple, and it is where most software quietly goes wrong.',
      'Three things have to be true before a group total means anything, and',
      'this app enforces all three itself rather than describing them in a',
      'manual and hoping:',
      '',
      '  1. What your companies billed each other comes back out.',
      '  2. A company with no tax registration still counts — and still cannot',
      '     file a return.',
      '  3. A name you sell under is not a company.',
      '',
      'Part 3 explains all three properly. Part 4 walks the screens.',
    ].join('\n') },
  { tag: 'UNI', screens: UNI_SCREENS, app: 'Module 01 · All three apps in one', file: 'Module_01_All_In_One.html',
    slug: '04_All_Three_In_One', kb: 183, key: 'medhava_m01_', n: 4,
    companion: 'CEO Dashboard · Report Builder · Group Consolidation (the same three, separately)',
    testEg: '  · "adding a sale moves the dashboard"\n  · "adding a sale moves every report by the same amount"\n  · "an import rejects the bad rows rather than dropping them"\n  · "what this app exports, this app can import again with nothing rejected"',
    intro: [
      'This is the CEO Dashboard, the Report Builder and Group Consolidation,',
      'all three, running over ONE set of records — plus the two things none of',
      'them has: you can change the records, and you can upload a spreadsheet.',
      '',
      'That makes it the app to test with. Add a sale and watch the overview,',
      'every report and the group roll-up all move in the same instant. Not',
      'because they are kept in step, but because there is only one set of',
      'numbers underneath all three.',
      '',
      'PART 3 is a five-minute test that shows you exactly that. Do it first.',
      '',
      'Everything else in this app is identical to the three separate ones —',
      'same engine, same screens, same self-tests. Test here, and you have',
      'tested all three.',
    ].join('\n') },
];

let n = 0;
for (const a of APPS) {
  for (const edKey of ['ERP', 'VAS']) {
    const tag = a.tag + '_' + edKey;
    const c = Object.assign({}, COMMON[edKey], {
      app: a.app, file: a.file, kb: a.kb, tests: T(tag),
      key: a.key + (edKey === 'ERP' ? 'erp' : 'vastrangam') + '_v1',
      companion: a.companion,
      module: 'Module 01 · Dashboard & BI — App ' + a.n + ' of 4',
      capCount: 0, altCount: 0,   /* filled below from the app's own declaration */
      testEg: a.testEg, intro: a.intro,
    });
    /* the connector counts come from the app itself, never from a typed number */
    const core = fs.readFileSync(path.join(__dirname, { DASH: 'dashboard', REP: 'reports', GRP: 'groupcons', UNI: 'm01unified' }[a.tag], 'core.js'), 'utf8');
    const uses = (/uses\s*:\s*\[([^\]]*)\]/.exec(core)[1]).split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
    const CAPS = require('./../providers.js').CAPS.filter(x => uses.indexOf(x.id) >= 0);
    c.capCount = CAPS.length;
    c.altCount = CAPS.reduce((s, x) => s + x.providers.length, 0);

    const md = manual(c, a.screens);
    const f = path.join(OUT, tag + '_MANUAL.md');
    fs.writeFileSync(f, md);
    console.log(tag.padEnd(10), Math.round(md.length / 1024) + 'KB', String(md.split('\n').length).padStart(4) + ' lines →',
      (edKey === 'ERP' ? 'Medhava/' : 'Vastrangam/') + a.slug);
    n++;
  }
}
console.log('\n' + n + ' manuals written');
