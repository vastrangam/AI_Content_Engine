# CEO Dashboard — Complete Manual
### Medhava · Unified ERP — any industry
**Module 01 · Dashboard & BI — App 1 of 4**

The whole manual is in the block below. Copy it, print it, or send it to
whoever is going to use the app — it assumes no technical knowledge at all.

```text
════════════════════════════════════════════════════════════════════════

   M E D H A V A  ·  CEO DASHBOARD
   Unified ERP — any industry
   Module 01 · Dashboard & BI — App 1 of 4

   COMPLETE MANUAL — written for someone who has never installed
   business software before. No technical knowledge assumed.

════════════════════════════════════════════════════════════════════════


WHAT THIS APP IS

The CEO Dashboard is the one screen that answers three questions:
did we make money, is the cash safe, and what needs me today.

It is not a data-entry app. You will never type a figure into it. Every
number on it is worked out from records the rest of the business already
keeps — sales, purchases, stock, wages, expenses. That is the point: if a
figure here is wrong, the record behind it is wrong, and the Wiring screen
tells you which one to go and look at.

Two controls govern everything: WHICH PERIOD and WHICH COMPANY. Part 2
explains the one rule that makes both of them make sense.

It is one file. It opens by double-clicking. It works with the internet
switched off. It saves your work automatically. It checks its own
arithmetic 30 different ways every time it starts.


WHAT IS IN THIS MANUAL

   PART 1   Getting it running — Windows, Mac, Android, iPhone
   PART 2   The parts of the screen
   PART 3   Screen by screen — every button, what it does
   PART 4   Connectors — nothing here is locked to one company
   PART 5   Your data — where it lives, backups, moving devices
   PART 6   Is it working properly? (the self-tests)
   PART 7   If something goes wrong
   PART 8   What this app does NOT do


════════════════════════════════════════════════════════════════════════
PART 1 · GETTING IT RUNNING
════════════════════════════════════════════════════════════════════════

WHAT YOU NEED
  Nothing to buy. Nothing to install. No internet after you have the file.
  You need one thing only: a web browser. Chrome, Edge, Safari or Firefox —
  any of them, any version from the last few years.

  There is no setup wizard, no licence key, no account, no sign-up.
  The whole app is ONE file: CEO_Dashboard.html
  About 141 KB — smaller than a photo from your phone.


ON A WINDOWS COMPUTER
  1. Find the file CEO_Dashboard.html — usually in your Downloads folder.
     (If it came inside a ZIP, right-click the ZIP → "Extract All" first.
      You must extract it. Opening the file from inside the ZIP will not work
      properly, because Windows opens it in a temporary place.)
  2. Double-click CEO_Dashboard.html.
  3. It opens in your browser. That is the whole app. You are done.

  If it opens in Notepad instead of a browser:
     right-click the file → "Open with" → choose Chrome or Edge →
     tick "Always use this app".

  To keep it handy: right-click the file → "Send to" → "Desktop (create shortcut)".
  Now it is an icon on your desktop, exactly like any other program.


ON A MAC
  1. Find CEO_Dashboard.html in Downloads. If it came in a ZIP, double-click the ZIP
     to unpack it first.
  2. Double-click CEO_Dashboard.html. Safari opens it.
  3. Done.

  To keep it handy: drag the file onto your Dock, or right-click →
  "Make Alias" and drag the alias to your desktop.


ON AN ANDROID PHONE OR TABLET
  1. Save CEO_Dashboard.html to your phone. Any route works — WhatsApp, email,
     Google Drive, or a USB cable from your computer.
  2. Open the "Files" app (some phones call it "My Files").
  3. Go to Downloads and tap CEO_Dashboard.html.
  4. If the phone asks how to open it, choose Chrome.
  5. Done. The app fills the screen and the menu is behind the ☰ button
     at the top-left.

  MAKE IT LOOK AND FEEL LIKE A REAL APP:
     With the app open in Chrome, tap ⋮ (three dots, top-right) →
     "Add to Home screen" → give it a name → "Add".
     Now there is an icon on your home screen. Tapping it opens
     CEO Dashboard directly, with no browser bar. Exactly like any other app,
     and it still works with the phone in flight mode.


ON AN IPHONE OR IPAD
  1. Save CEO_Dashboard.html to the "Files" app (Save to Files from WhatsApp, Mail
     or wherever you received it).
  2. Open the Files app, find it, and tap it. Safari opens it.
  3. Done.

  MAKE IT LOOK AND FEEL LIKE A REAL APP:
     With the app open in Safari, tap the Share button (the square with
     the arrow pointing up) → scroll down → "Add to Home Screen" → "Add".
     Now CEO Dashboard has its own icon on your home screen.

  Note for iPhone: iPhones are stricter about files opened straight from
  the Files app. If your data does not survive closing the app, do this
  instead — put the file in iCloud Drive or Google Drive, open it from
  there in Safari, then "Add to Home Screen". After that it behaves
  normally.


WHAT ABOUT THE INTERNET?
  You do not need it. Once the file is on your device, the app works with
  the WiFi off, on a plane, in a shop with no signal. It never sends your
  numbers anywhere, because there is nowhere for them to be sent to. There
  is no server behind this app.


SHARING IT WITH SOMEONE ELSE
  Send them the file. WhatsApp, email, a pen drive — anything. They do the
  same three steps and they have their own copy.
  Their copy starts with the demo data. It does NOT contain your figures.
  Data never travels with the file — only with a backup you export on purpose
  (see PART 4).


════════════════════════════════════════════════════════════════════════
PART 2 · THE PARTS OF THE SCREEN
════════════════════════════════════════════════════════════════════════

  TOP BAR       The Medhava mark, the app name, then two grey pills:
                the company (Acme Corp) and the financial year (FY 2026-27).
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

  THE TWO DIALS   Above most screens sit two rows of buttons.

                  PERIOD:   April · May · June · July · Full year
                  COMPANY:  All companies · Acme Manufacturing · Acme Exports · Acme Workshop

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
                      because "Acme Manufacturing's cash" is a real number in a
                      real bank account.

                  Most spreadsheet dashboards filter everything by the date
                  column, which quietly turns a bank balance into nonsense.
                  This one does not.

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
  Net profit    What is actually left. Net sales, minus what you bought,
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
  A channel with 14% returns and a big gross number can easily earn you
  less than a quiet channel with 2% returns. This table is where you see it.

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
  Customers who owe you — amount, which company it belongs to, age in days, and a tag:
     "ok" under 30 days · "overdue" over 30 · "chase now" over 60.
  Suppliers you owe — amount, company, days remaining or days late, and a tag:
     "on time" · "late" · "very late" over 60 days.

THE PROFIT BUILD-UP PANEL (at the bottom — read this one slowly)
  This is your profit worked out line by line, so you can see exactly where
  the money went:
       Net sales
     − Purchases
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
  Acme Manufacturing sells under its own name on its storefront and as
  "AcmePro" on a marketplace. One company, two names, one set of sales.
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


════════════════════════════════════════════════════════════════════════
PART 4 · CONNECTORS — NOTHING HERE IS LOCKED TO ONE COMPANY
════════════════════════════════════════════════════════════════════════

This is a promise, and it is checked by the app itself every time it opens:

    NO MEDHAVA APP DEPENDS ON ANY SINGLE OUTSIDE SERVICE.

Not on one accounting package. Not on one marketplace. Not on one AI company.
Not on one automation tool. Not on one courier. Ever.

Open the **Connectors** screen (left menu) and you can see it for yourself.


WHAT THE SCREEN SHOWS

  Capabilities used            The outside things this app can talk to.
                               CEO Dashboard uses 4.
  Alternatives available       How many different options you can pick from
                               across those capabilities — 34 in this app.
  Outside services required    ZERO. Always. That is the point.
  Running with nothing connected
                               Whether the app works right now with nothing
                               plugged in at all. It always can.

Then one panel per capability. Every option is a button — click it and you have
switched. Each option carries a tag telling you what kind of thing it is:

    built in      Ships inside Medhava. Needs nothing, costs nothing,
                  works offline.
    you host it   You run it on your own machine or your own server.
                  Your data never leaves your control.
    their cloud   Somebody else's service. Connected with a scoped,
                  revocable key — never your account password.
    by hand       A person does it, or a CSV file goes in and out.


THE THREE RULES THE APP CHECKS ON ITSELF

  1. NO CAPABILITY HAS ONLY ONE CHOICE.
     Every one has at least three. Usually eight to twelve.

  2. EVERY CAPABILITY HAS A "BUILT IN" OR "BY HAND" OPTION.
     Which means the app is fully usable with nothing connected — no
     account anywhere, no internet, no subscription. That is how it
     ships, out of the box.

  3. EVERY CAPABILITY HAS AN OPTION YOU CAN HOST YOURSELF.
     So you are never forced to send your business data to somebody
     else's cloud, whatever the fashion of the day is.

  You can read the result of all three on the Backup & Health screen —
  they are ordinary self-tests, listed in plain English with the rest.


A FEW EXAMPLES OF WHAT THAT MEANS IN PRACTICE

  Books & ledger      Medhava's own ledger · Tally · BUSY · Marg · Zoho Books ·
                      QuickBooks · ERPNext (self-hosted) · plain CSV to your CA
  Sales channels      Type them in · CSV import · Amazon · Flipkart · Myntra ·
                      Meesho · Ajio · Nykaa · JioMart · Shopify · WooCommerce ·
                      your own self-hosted store
  AI writing          Medhava templates (no AI at all) · Ollama on your own
                      machine · self-hosted Llama or Mistral · Claude · GPT ·
                      Gemini · DeepSeek · Groq · or write it yourself
  AI images           Upload your own · Stable Diffusion on your own machine ·
                      Flux · Midjourney · OpenAI · Imagen · Firefly · Canva ·
                      Medhava Image Studio
  Automation          Medhava Rules (built in) · n8n on your own server ·
                      Node-RED · Windmill · Airflow · n8n Cloud · Make ·
                      Zapier · Pipedream · cron + webhook · or by hand
  Couriers            Type the AWB in · your own delivery · Delhivery ·
                      Blue Dart · DTDC · Ecom · XpressBees · India Post ·
                      Shiprocket · NimbusPost
  Payments            Cash · UPI direct with your own QR (no commission) ·
                      Razorpay · PayU · Cashfree · PhonePe · Paytm · Stripe
  Backups             This device · a USB drive · MinIO or Nextcloud on your
                      own server · Google Drive · Dropbox · OneDrive · S3


TWO THINGS WORTH UNDERSTANDING

  SWITCHING A PROVIDER NEVER CHANGES A FIGURE.
    The arithmetic lives in Medhava, not in the service. Move from one
    courier to another and every past shipping record stays exactly as it
    was — only new labels come from somewhere else. There is a self-test
    for this: "switching a provider changes nothing else in your data".

  CLOUD SERVICES USE A SCOPED, REVOCABLE KEY — NEVER YOUR PASSWORD.
    A key can be limited to only what it needs, and cancelled in one click
    from the service's own side, without touching your login.
    **Medhava will never ask you for a marketplace, bank or account
    password.** If any screen ever does, it is not Medhava.


════════════════════════════════════════════════════════════════════════
PART 5 · YOUR DATA — WHERE IT LIVES, AND HOW TO KEEP IT SAFE
════════════════════════════════════════════════════════════════════════

WHERE IS MY DATA KEPT?
  Inside your own browser, on your own device. Nowhere else.
  Technically it sits in a small private store the browser keeps for this
  file, labelled "medhava_dashboard_erp_v1".

  This means:
    ✓ Nobody else can see it. Not us, not anyone on the internet.
    ✓ It survives closing the app and restarting your computer.
    ✗ It does NOT travel between your laptop and your phone by itself.
    ✗ Clearing your browser's "site data" or "cookies" WILL erase it.

  So: take backups. It takes four seconds.


TAKING A BACKUP  (do this weekly — it is the single most important habit)
  1. Click "Backup & Health" in the left menu.
  2. Click "Export JSON".
  3. A file lands in your Downloads folder. That is your backup.
  Keep it somewhere safe — Google Drive, email it to yourself, a pen drive.


PUTTING A BACKUP BACK
  1. Click "Backup & Health".
  2. Click "Import JSON".
  3. Choose the backup file.
  Everything is replaced with what was in that file.


MOVING FROM YOUR COMPUTER TO YOUR PHONE (or to a new machine)
  1. On the old device: "Backup & Health" → "Export JSON".
  2. Send yourself both files — CEO_Dashboard.html AND the backup.
  3. On the new device: open CEO_Dashboard.html, then "Backup & Health" →
     "Import JSON" → pick the backup.
  Your work is now on the new device.


STARTING OVER
  "Reload demo data" puts back the example figures that came with the app.
  "Wipe all" empties it completely.
  Both ask you to confirm first. Neither can be undone — take a backup first.


════════════════════════════════════════════════════════════════════════
PART 6 · IS IT WORKING PROPERLY? (the self-tests)
════════════════════════════════════════════════════════════════════════

Every time CEO Dashboard opens, it quietly checks its own arithmetic — 30
separate checks — before showing you anything. You can see the result:

  Click "Backup & Health" → look at the "Self-tests" panel.

You should see 30/30 pass. Each line is written in plain
language, so you can read what was actually checked. For example:

  · "net sales = gross − returns"
  · "every company added together equals the group"
  · "a balance ignores the period but not the company"
  · "not one of them can add, change or delete a record"

If you ever see a red "fail", something is wrong and the numbers on screen
should not be trusted. Take a backup, reload the file, and if it still fails,
report which line failed.

This is unusual for business software, and deliberate. Most programs ask you
to trust them. This one shows its working.


════════════════════════════════════════════════════════════════════════
PART 7 · IF SOMETHING GOES WRONG
════════════════════════════════════════════════════════════════════════

"It opens in Notepad / a text editor, not as an app."
   Right-click the file → "Open with" → Chrome or Edge.

"I double-clicked and nothing happened."
   The file is probably still inside the ZIP. Extract the ZIP first.

"My data disappeared."
   Three usual causes:
     a) You opened a different copy of the file. Each copy of the file keeps
        its own data. Keep ONE copy and always open that one.
     b) You cleared your browser history with "cookies and site data" ticked.
     c) You are browsing in Private / Incognito mode, which forgets
        everything when you close the window. Do not use Private mode.
   Restore from your last backup.

"The screen looks squashed on my phone."
   Turn the phone sideways for wide tables, or scroll the table sideways
   with your finger. The menu is behind the ☰ button.

"The numbers look wrong."
   Go to "Backup & Health" and check the self-tests. If they all pass, the
   arithmetic is right and the source figures need checking. The "Wiring"
   screen tells you exactly which figure comes from where.

"Can two people use it at once?"
   Not in this single-file version — each person has their own copy and
   their own data. Sharing between people is what the hosted version of
   Medhava is for.


════════════════════════════════════════════════════════════════════════
PART 8 · WHAT THIS APP DOES NOT DO
════════════════════════════════════════════════════════════════════════

Being straight with you about the edges:

  ✗ It does not sync between your devices on its own. Use the backup file.
  ✗ It does not have user accounts or passwords. Whoever can open your
    device can open the app.
  ✗ In this single-file version nothing is connected live to anything —
    the figures it reads are the ones held in the file. The Connectors
    screen shows every service it CAN be wired to, and the hosted version
    of Medhava is what opens those pipes. Whichever you pick, the app
    also works with none of them (see PART 4).
  ✗ It does not print a formal statutory report. It shows you what is
    happening; your accountant's software files the returns.
  ✗ It does not stop you entering something silly. It checks its own
    arithmetic, not your judgement.

Everything it DOES do is on the screens described above, and every figure
is traceable on the "Wiring" screen.


════════════════════════════════════════════════════════════════════════

   Medhava · One business. One brain.
   Module 01 · Dashboard & BI — App 1 of 4
   Acme Corp · FY 2026-27

════════════════════════════════════════════════════════════════════════
```

---

**File you need:** `CEO_Dashboard.html` · opens by double-click · works offline · 30 self-tests
**Companion app in this module:** Report Builder · Group Consolidation · and all three in one
