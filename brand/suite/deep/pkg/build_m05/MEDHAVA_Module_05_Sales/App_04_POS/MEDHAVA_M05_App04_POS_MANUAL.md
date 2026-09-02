# POS — Complete Manual
### Medhava · Unified ERP — any industry
**Module 03 · Sales — App 4 of 5**

The whole manual is in the block below. Copy it, print it, or send it to
whoever is going to use the app — it assumes no technical knowledge at all.

```text
════════════════════════════════════════════════════════════════════════

   M E D H A V A  ·  POS
   Unified ERP — any industry
   Module 03 · Sales — App 4 of 5

   COMPLETE MANUAL — written for someone who has never installed
   business software before. No technical knowledge assumed.

════════════════════════════════════════════════════════════════════════


WHAT THIS APP IS

A till that cannot lie to the rest of the business.

  · The price comes from the catalogue, not from whoever is at the counter,
    so the shop cannot quietly undercut the website.
  · The discount is capped at 50% and printed on the bill.
  · GST is worked out on the discounted value, never on the gross.
  · Payment can be split any way the customer wants — and the bill will not
    print until the full amount is covered.
  · Stock comes off the ONE shared number every channel reads, so selling
    the last piece at the counter stops the website selling it thirty
    seconds later.
  · At close, only the cash is expected in the drawer — so a gap is found
    the same day rather than in a monthly audit.

It is one file. It opens by double-clicking. It works with the internet
switched off. It saves your work automatically. It checks its own
arithmetic 33 different ways every time it starts.


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
  The whole app is ONE file: POS.html
  About 72 KB — smaller than a photo from your phone.


ON A WINDOWS COMPUTER
  1. Find the file POS.html — usually in your Downloads folder.
     (If it came inside a ZIP, right-click the ZIP → "Extract All" first.
      You must extract it. Opening the file from inside the ZIP will not work
      properly, because Windows opens it in a temporary place.)
  2. Double-click POS.html.
  3. It opens in your browser. That is the whole app. You are done.

  If it opens in Notepad instead of a browser:
     right-click the file → "Open with" → choose Chrome or Edge →
     tick "Always use this app".

  To keep it handy: right-click the file → "Send to" → "Desktop (create shortcut)".
  Now it is an icon on your desktop, exactly like any other program.


ON A MAC
  1. Find POS.html in Downloads. If it came in a ZIP, double-click the ZIP
     to unpack it first.
  2. Double-click POS.html. Safari opens it.
  3. Done.

  To keep it handy: drag the file onto your Dock, or right-click →
  "Make Alias" and drag the alias to your desktop.


ON AN ANDROID PHONE OR TABLET
  1. Save POS.html to your phone. Any route works — WhatsApp, email,
     Google Drive, or a USB cable from your computer.
  2. Open the "Files" app (some phones call it "My Files").
  3. Go to Downloads and tap POS.html.
  4. If the phone asks how to open it, choose Chrome.
  5. Done. The app fills the screen and the menu is behind the ☰ button
     at the top-left.

  MAKE IT LOOK AND FEEL LIKE A REAL APP:
     With the app open in Chrome, tap ⋮ (three dots, top-right) →
     "Add to Home screen" → give it a name → "Add".
     Now there is an icon on your home screen. Tapping it opens
     POS directly, with no browser bar. Exactly like any other app,
     and it still works with the phone in flight mode.


ON AN IPHONE OR IPAD
  1. Save POS.html to the "Files" app (Save to Files from WhatsApp, Mail
     or wherever you received it).
  2. Open the Files app, find it, and tap it. Safari opens it.
  3. Done.

  MAKE IT LOOK AND FEEL LIKE A REAL APP:
     With the app open in Safari, tap the Share button (the square with
     the arrow pointing up) → scroll down → "Add to Home Screen" → "Add".
     Now POS has its own icon on your home screen.

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

  LEFT MENU     Six screens in four groups:
                  COUNTER       Till · Today's bills
                  END OF DAY    Day close · Counter stock
                  WIRING        Wiring
                  CONNECTORS    Connectors
                  SYSTEM        Backup & Health
                On a phone this menu hides behind the ☰ button.

  CARDS         The coloured boxes across the top of each screen. Big number,
                small line underneath telling you what it means.

  PANELS        The white boxes below — tables, bars, forms and buttons.

  TAGS          The little coloured pills. Green is fine, amber means look at
                it this week, red means today.


════════════════════════════════════════════════════════════════════════
PART 3 · SCREEN BY SCREEN
════════════════════════════════════════════════════════════════════════

THREE RULES THAT MAKE A TILL TRUSTWORTHY

  1. THE PRICE IS NOT TYPED. It comes from the catalogue, so the counter
     cannot quietly undercut the website.
  2. THE DISCOUNT HAS A CEILING — 50% — and it is printed on the bill.
  3. THE DRAWER IS COUNTED EVERY DAY. A ₹200 gap found today is a
     question; the same gap found in a monthly audit is an argument.

──────────────────────────────────────────────
SCREEN 1 · TILL  (where you ring things up)
──────────────────────────────────────────────
FOUR CARDS
  In the cart · Tendered · Still due · Change to give

ADD TO THE CART
  One button per item, each showing its price and how many are left.
  A BUTTON GREYS OUT WHEN THE COUNTER HAS NONE LEFT. You cannot sell what
  is not there — the same rule the website obeys, on the same stock number.

THE CART
  Each line with − and + buttons and Remove, then the bill built up:
       Gross
     − Discount %
     = Taxable
     + GST 5%
     = Total

  GST IS WORKED OUT ON THE DISCOUNTED VALUE, NEVER ON THE GROSS.

DISCOUNT AND PAYMENT  (five boxes)
  Discount % · Cash · UPI · Card · On account. Press Apply.

  Split it however the customer wants. THE BILL WILL NOT PRINT UNTIL THE
  FULL AMOUNT IS COVERED — press it short and the app tells you what is
  still due. Overpay and it shows the change to give.

  "Print the bill" takes the stock down, files the bill, and clears the cart.

──────────────────────────────────────────────
SCREEN 2 · TODAY'S BILLS
──────────────────────────────────────────────
  Takings · Average bill · Discount given · GST collected

HOW THE MONEY CAME IN
  A row per method with a share bar and a tag:
      in the till       cash — expected in the drawer
      into the bank     UPI and card
      not money yet     on account — a receivable, not cash

  Then every bill, with what it was paid by. A discount over 20% shows red.

──────────────────────────────────────────────
SCREEN 3 · DAY CLOSE
──────────────────────────────────────────────
  Opening float · Cash taken · Should be in the drawer · Over / short

COUNT THE DRAWER
  Type what is actually in it and press "Close the day". The app tells you
  whether it matches, and by how much if it does not.

  ONLY CASH IS EXPECTED IN THE DRAWER. UPI and card went to the bank; an
  on-account bill is not money at all. They are listed separately for
  exactly this reason.

  "Count it again" reopens it if you miscounted.

THE DAY, LINE BY LINE
  Float, then every method (the ones not in the drawer greyed), then what
  should be there, what you counted, and the difference.

  Counting the drawer takes two minutes and it is the only moment in the day when the money and the paperwork are forced to agree.

──────────────────────────────────────────────
SCREEN 4 · COUNTER STOCK
──────────────────────────────────────────────
  Lines on the counter · Pieces on hand · Sold today · Running out

  Every item with price, on hand, reorder point, sold today, and a tag:
  "out of stock" · "reorder" · "low" · "ok".

  ONE STOCK NUMBER, NOT ONE PER CHANNEL. The quantity here is the same
  record the website, the marketplaces and the wholesale order book read.
  Sell the last piece at the counter and the website cannot sell it thirty
  seconds later. Almost every oversell in a multi-channel business comes
  from keeping a separate figure per channel and reconciling "later".

──────────────────────────────────────────────
SCREEN 5 · WIRING   ·   6 · CONNECTORS   ·   7 · BACKUP & HEALTH
──────────────────────────────────────────────
Covered in PART 4, PART 5 and PART 6 below.


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
                               POS uses 6.
  Alternatives available       How many different options you can pick from
                               across those capabilities — 61 in this app.
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
  file, labelled "medhava_pos_erp_v1".

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
  2. Send yourself both files — POS.html AND the backup.
  3. On the new device: open POS.html, then "Backup & Health" →
     "Import JSON" → pick the backup.
  Your work is now on the new device.


STARTING OVER
  "Reload demo data" puts back the example figures that came with the app.
  "Wipe all" empties it completely.
  Both ask you to confirm first. Neither can be undone — take a backup first.


════════════════════════════════════════════════════════════════════════
PART 6 · IS IT WORKING PROPERLY? (the self-tests)
════════════════════════════════════════════════════════════════════════

Every time POS opens, it quietly checks its own arithmetic — 33
separate checks — before showing you anything. You can see the result:

  Click "Backup & Health" → look at the "Self-tests" panel.

You should see 33/33 pass. Each line is written in plain
language, so you can read what was actually checked. For example:

  · "GST is never charged on the discount"
  · "counting less than expected shows short, not over"
  · "stock on hand = what was stocked less what was sold"

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
   Module 03 · Sales — App 4 of 5
   Acme Corp · FY 2026-27

════════════════════════════════════════════════════════════════════════
```

---

**File you need:** `POS.html` · opens by double-click · works offline · 33 self-tests
**Companion app in this module:** D2C Sales · B2B & Credit · Export · Quotes & Proforma
