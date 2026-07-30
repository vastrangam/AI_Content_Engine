'use strict';
/* Shared manual sections for every module's MANUAL.md — the install steps, the data/backup
   chapters, the troubleshooting list, and the wrapper that puts the whole manual inside one
   fenced block. Per-app screen tours live in each module's mkmanual_mNN.js. */
const F = '`' + '`' + '`';

const install = (c) => `
════════════════════════════════════════════════════════════════════════
PART 1 · GETTING IT RUNNING
════════════════════════════════════════════════════════════════════════

WHAT YOU NEED
  Nothing to buy. Nothing to install. No internet after you have the file.
  You need one thing only: a web browser. Chrome, Edge, Safari or Firefox —
  any of them, any version from the last few years.

  There is no setup wizard, no licence key, no account, no sign-up.
  The whole app is ONE file: ${c.file}
  About ${c.kb} KB — smaller than a photo from your phone.


ON A WINDOWS COMPUTER
  1. Find the file ${c.file} — usually in your Downloads folder.
     (If it came inside a ZIP, right-click the ZIP → "Extract All" first.
      You must extract it. Opening the file from inside the ZIP will not work
      properly, because Windows opens it in a temporary place.)
  2. Double-click ${c.file}.
  3. It opens in your browser. That is the whole app. You are done.

  If it opens in Notepad instead of a browser:
     right-click the file → "Open with" → choose Chrome or Edge →
     tick "Always use this app".

  To keep it handy: right-click the file → "Send to" → "Desktop (create shortcut)".
  Now it is an icon on your desktop, exactly like any other program.


ON A MAC
  1. Find ${c.file} in Downloads. If it came in a ZIP, double-click the ZIP
     to unpack it first.
  2. Double-click ${c.file}. Safari opens it.
  3. Done.

  To keep it handy: drag the file onto your Dock, or right-click →
  "Make Alias" and drag the alias to your desktop.


ON AN ANDROID PHONE OR TABLET
  1. Save ${c.file} to your phone. Any route works — WhatsApp, email,
     Google Drive, or a USB cable from your computer.
  2. Open the "Files" app (some phones call it "My Files").
  3. Go to Downloads and tap ${c.file}.
  4. If the phone asks how to open it, choose Chrome.
  5. Done. The app fills the screen and the menu is behind the ☰ button
     at the top-left.

  MAKE IT LOOK AND FEEL LIKE A REAL APP:
     With the app open in Chrome, tap ⋮ (three dots, top-right) →
     "Add to Home screen" → give it a name → "Add".
     Now there is an icon on your home screen. Tapping it opens
     ${c.app} directly, with no browser bar. Exactly like any other app,
     and it still works with the phone in flight mode.


ON AN IPHONE OR IPAD
  1. Save ${c.file} to the "Files" app (Save to Files from WhatsApp, Mail
     or wherever you received it).
  2. Open the Files app, find it, and tap it. Safari opens it.
  3. Done.

  MAKE IT LOOK AND FEEL LIKE A REAL APP:
     With the app open in Safari, tap the Share button (the square with
     the arrow pointing up) → scroll down → "Add to Home Screen" → "Add".
     Now ${c.app} has its own icon on your home screen.

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
`;

const data = (c) => `
════════════════════════════════════════════════════════════════════════
PART 4 · YOUR DATA — WHERE IT LIVES, AND HOW TO KEEP IT SAFE
════════════════════════════════════════════════════════════════════════

WHERE IS MY DATA KEPT?
  Inside your own browser, on your own device. Nowhere else.
  Technically it sits in a small private store the browser keeps for this
  file, labelled "${c.key}".

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
  2. Send yourself both files — ${c.file} AND the backup.
  3. On the new device: open ${c.file}, then "Backup & Health" →
     "Import JSON" → pick the backup.
  Your work is now on the new device.


STARTING OVER
  "Reload demo data" puts back the example figures that came with the app.
  "Wipe all" empties it completely.
  Both ask you to confirm first. Neither can be undone — take a backup first.


════════════════════════════════════════════════════════════════════════
PART 5 · IS IT WORKING PROPERLY? (the self-tests)
════════════════════════════════════════════════════════════════════════

Every time ${c.app} opens, it quietly checks its own arithmetic — ${c.tests}
separate checks — before showing you anything. You can see the result:

  Click "Backup & Health" → look at the "Self-tests" panel.

You should see ${c.tests}/${c.tests} pass. Each line is written in plain
language, so you can read what was actually checked. For example:

${c.testEg}

If you ever see a red "fail", something is wrong and the numbers on screen
should not be trusted. Take a backup, reload the file, and if it still fails,
report which line failed.

This is unusual for business software, and deliberate. Most programs ask you
to trust them. This one shows its working.


════════════════════════════════════════════════════════════════════════
PART 6 · IF SOMETHING GOES WRONG
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
PART 7 · WHAT THIS APP DOES NOT DO
════════════════════════════════════════════════════════════════════════

Being straight with you about the edges:

  ✗ It does not sync between your devices on its own. Use the backup file.
  ✗ It does not have user accounts or passwords. Whoever can open your
    device can open the app.
  ✗ It does not pull data live from ${c.liveFrom}. In this single-file
    version, the figures it reads are the ones held in the file.
    The hosted version of Medhava is what connects those pipes.
  ✗ It does not print a formal statutory report. It shows you what is
    happening; your accountant's software files the returns.
  ✗ It does not stop you entering something silly. It checks its own
    arithmetic, not your judgement.

Everything it DOES do is on the screens described above, and every figure
is traceable on the "Wiring" screen.
`;

function manual(c, screens) {
  const body = `
${'═'.repeat(72)}

   M E D H A V A  ·  ${c.app.toUpperCase()}
   ${c.edition}
   ${c.module}

   COMPLETE MANUAL — written for someone who has never installed
   business software before. No technical knowledge assumed.

${'═'.repeat(72)}


WHAT THIS APP IS

${c.intro}

It is one file. It opens by double-clicking. It works with the internet
switched off. It saves your work automatically. It checks its own
arithmetic ${c.tests} different ways every time it starts.


WHAT IS IN THIS MANUAL

   PART 1   Getting it running — Windows, Mac, Android, iPhone
   PART 2   The parts of the screen
   PART 3   Screen by screen — every button, what it does
   PART 4   Your data — where it lives, backups, moving devices
   PART 5   Is it working properly? (the self-tests)
   PART 6   If something goes wrong
   PART 7   What this app does NOT do

${install(c)}
${screens(c)}
${data(c)}

${'═'.repeat(72)}

   Medhava · One business. One brain.
   ${c.module}
   ${c.co} · FY 2026-27

${'═'.repeat(72)}
`;
  return `# ${c.app} — Complete Manual
### Medhava · ${c.edition}
**${c.module}**

The whole manual is in the block below. Copy it, print it, or send it to
whoever is going to use the app — it assumes no technical knowledge at all.

${F}text${body}${F}

---

**File you need:** \`${c.file}\` · opens by double-click · works offline · ${c.tests} self-tests
**Companion app in this module:** ${c.companion || 'none — this module is one app'}
`;
}

module.exports = { F, install, data, manual };
