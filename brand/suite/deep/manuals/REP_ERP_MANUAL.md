# Report Builder — Complete Manual
### Medhava · Unified ERP — any industry
**Module 01 · Dashboard & BI — App 2 of 4**

The whole manual is in the block below. Copy it, print it, or send it to
whoever is going to use the app — it assumes no technical knowledge at all.

```text
════════════════════════════════════════════════════════════════════════

   M E D H A V A  ·  REPORT BUILDER
   Unified ERP — any industry
   Module 01 · Dashboard & BI — App 2 of 4

   COMPLETE MANUAL — written for someone who has never installed
   business software before. No technical knowledge assumed.

════════════════════════════════════════════════════════════════════════


WHAT THIS APP IS

The Report Builder lets you ask your own data almost any question, without
writing a formula and without waiting for anyone.

You do three things: pick what to look at, pick how to arrange it, and
optionally leave some of it out. The answer appears immediately — there is
no "generating report" wait.

The important idea: when you save a report, you are saving THE QUESTION,
not the answer. Run it again next month and it recalculates on next
month's data. Build a question once, use it forever.

It is one file. It opens by double-clicking. It works with the internet
switched off. It saves your work automatically. It checks its own
arithmetic 40 different ways every time it starts.


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
  The whole app is ONE file: Report_Builder.html
  About 145 KB — smaller than a photo from your phone.


ON A WINDOWS COMPUTER
  1. Find the file Report_Builder.html — usually in your Downloads folder.
     (If it came inside a ZIP, right-click the ZIP → "Extract All" first.
      You must extract it. Opening the file from inside the ZIP will not work
      properly, because Windows opens it in a temporary place.)
  2. Double-click Report_Builder.html.
  3. It opens in your browser. That is the whole app. You are done.

  If it opens in Notepad instead of a browser:
     right-click the file → "Open with" → choose Chrome or Edge →
     tick "Always use this app".

  To keep it handy: right-click the file → "Send to" → "Desktop (create shortcut)".
  Now it is an icon on your desktop, exactly like any other program.


ON A MAC
  1. Find Report_Builder.html in Downloads. If it came in a ZIP, double-click the ZIP
     to unpack it first.
  2. Double-click Report_Builder.html. Safari opens it.
  3. Done.

  To keep it handy: drag the file onto your Dock, or right-click →
  "Make Alias" and drag the alias to your desktop.


ON AN ANDROID PHONE OR TABLET
  1. Save Report_Builder.html to your phone. Any route works — WhatsApp, email,
     Google Drive, or a USB cable from your computer.
  2. Open the "Files" app (some phones call it "My Files").
  3. Go to Downloads and tap Report_Builder.html.
  4. If the phone asks how to open it, choose Chrome.
  5. Done. The app fills the screen and the menu is behind the ☰ button
     at the top-left.

  MAKE IT LOOK AND FEEL LIKE A REAL APP:
     With the app open in Chrome, tap ⋮ (three dots, top-right) →
     "Add to Home screen" → give it a name → "Add".
     Now there is an icon on your home screen. Tapping it opens
     Report Builder directly, with no browser bar. Exactly like any other app,
     and it still works with the phone in flight mode.


ON AN IPHONE OR IPAD
  1. Save Report_Builder.html to the "Files" app (Save to Files from WhatsApp, Mail
     or wherever you received it).
  2. Open the Files app, find it, and tap it. Safari opens it.
  3. Done.

  MAKE IT LOOK AND FEEL LIKE A REAL APP:
     With the app open in Safari, tap the Share button (the square with
     the arrow pointing up) → scroll down → "Add to Home Screen" → "Add".
     Now Report Builder has its own icon on your home screen.

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
                is written to disk.

  LEFT MENU     Four screens:
                  REPORTS     Build a report · Ready-made · My saved reports
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
                    Returns are already taken off before anything is called "Net".
    Money owed      Everybody who owes you and everybody you owe, in one
                    list, each aged in days.
    Stock           Everything you are holding, valued at cost, with
                    anything below its reorder point flagged.
    Running costs   Rent, salaries, marketing, logistics — month by month.
    Production      What the floor finished each month and what it cost.
    Purchases       What you bought in, by supplier and month.

  The grey line underneath tells you what one row of that source means.
  Changing the source resets steps 2 and 3, because a filter about
  channels makes no sense once you are looking at stock.

STEP 2 · HOW SHOULD IT BE ARRANGED?
  Four dropdowns:

    Group the rows by   The most important choice. Group sales by channel to compare channels, by
                        month to see a trend, or by company.
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
    · Only one channel:        Channel · is · Export
    · Only overdue money:      Days · > · 30
    · Only what to reorder:    Status · is · Reorder now
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
  What gets saved is THE QUESTION, not the answer. Save "Which channels are worth the effort"
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
   1. Which channel actually earns the most?
   2. Which company is carrying the group?
   3. Where are returns eating the profit?
   4. How is each month trending?
   5. Who has not paid me?
   6. What am I about to be chased for?
   7. Where is my money sitting in stock?
   8. What do I have to reorder now?
   9. What are my biggest running costs?
  10. Which supplier am I most exposed to?
  11. Is the floor getting cheaper or dearer?

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
                               Report Builder uses 5.
  Alternatives available       How many different options you can pick from
                               across those capabilities — 42 in this app.
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
  file, labelled "medhava_reports_erp_v1".

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
  2. Send yourself both files — Report_Builder.html AND the backup.
  3. On the new device: open Report_Builder.html, then "Backup & Health" →
     "Import JSON" → pick the backup.
  Your work is now on the new device.


STARTING OVER
  "Reload demo data" puts back the example figures that came with the app.
  "Wipe all" empties it completely.
  Both ask you to confirm first. Neither can be undone — take a backup first.


════════════════════════════════════════════════════════════════════════
PART 6 · IS IT WORKING PROPERLY? (the self-tests)
════════════════════════════════════════════════════════════════════════

Every time Report Builder opens, it quietly checks its own arithmetic — 40
separate checks — before showing you anything. You can see the result:

  Click "Backup & Health" → look at the "Self-tests" panel.

You should see 40/40 pass. Each line is written in plain
language, so you can read what was actually checked. For example:

  · "grouped totals equal the ungrouped total"
  · "Top 3 still totals ALL matching rows, not just 3"
  · "grouping by company or by channel gives the same total"
  · "a report grouped by channel equals the dashboard's net sales"

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
   Module 01 · Dashboard & BI — App 2 of 4
   Acme Corp · FY 2026-27

════════════════════════════════════════════════════════════════════════
```

---

**File you need:** `Report_Builder.html` · opens by double-click · works offline · 40 self-tests
**Companion app in this module:** CEO Dashboard · Group Consolidation · and all three in one
