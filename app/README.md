# Vastrangam AI Engine — the app

This is the same engine as the single HTML file, running properly: as an app on your own
computer, with your work stored in a real place instead of inside one browser.

---

## Start it

**On Windows — double-click `start-vastrangam.bat`.**

That is the whole instruction. The first time, it downloads what it needs (a few minutes,
once). After that it opens in seconds. A black window appears and stays open while the app
runs — that is the app itself, so leave it alone. Closing it stops the app; your work is
already saved.

**On a Mac, or if you prefer typing:**

```
cd app
npm install      # the first time only
npm start
```

Then open **http://localhost:3000**.

If it says Node is not installed, get it from [nodejs.org](https://nodejs.org) — the big
green **LTS** button — and click Next through the installer.

---

## Put your Gemini key in

Open the file called `.env` in this folder with Notepad, and put your key on the
`GEMINI_API_KEY` line:

```
GEMINI_API_KEY=AQ.your-key-here
```

Save it, close the app window, and start it again.

The key now lives on your computer, in that file. It is never sent to the browser, never
appears in the page, and never leaves the machine except to talk to Google. If you leave the
line blank the app simply asks you for the key in the Settings screen instead, exactly as
the single file did.

> **Vastrangam AI Engine will never ask you for a marketplace, bank or account password.
> If any screen ever does, it is not this app.**

---

## What changes now that it is an app

**Your work is no longer trapped in one browser.** It is a file on this computer
(`app/data/workspace.json`) with the photographs beside it in `app/data/images`. Close the
browser, restart the computer, use a different browser — it is all still there. Back it up by
copying the `data` folder.

**Photographs read several at a time.** The browser would only make so many calls at once and
forgot everything between page loads. The server does neither, so a catalogue of thirty
photos takes about as long as three used to.

**MP4 is real.** No browser on earth can encode H.264 — that is a licensing fact, not a
missing feature — which is why the single file could only ever give you WebM. The app has
ffmpeg behind it, so the Video Studio now exports proper MP4 at 1080×1920, `yuv420p`,
faststart: the same shape as your Canva reels, and what Instagram and WhatsApp want.

**You can open it on your phone.** While the app is running, find your computer's address
(`ipconfig` on Windows — the IPv4 line, something like `192.168.1.7`) and open
`http://192.168.1.7:3000` on your phone on the same wifi. Add it to the home screen and it
behaves like an installed app.

Everything else is the same screens you already know.

---

## Moving your work online, later

Right now everything sits on this computer. That is the right place to start — nothing to
sign up for and nothing to pay. When you want the same catalogue on your laptop and your
phone without them being on the same wifi, run:

```
npm run setup:supabase
```

It prints the five steps and the exact SQL to paste, then checks your keys once you have
filled them in. Two lines in `.env` and a restart is the whole migration. Not one screen
changes.

---

## Is it working?

```
npm test              # the server: storage, photos, the AI proxy, MP4
npm run test:browser  # the app itself, driven in a real browser
npm run test:file     # the offline single file, opened from disk
npm run verify        # all three, three times over, as agreed
```

`npm test` is the one to reach for. It needs nothing extra, takes a few seconds, and prints a
line per check with `ok` or `FAIL` and the reason.

The other three drive a real browser, so they need Playwright — which is **not** installed with
the app, because it is a couple of hundred megabytes and it is a testing tool, not part of what
you use. If you ever want to run them, the tests themselves print the two commands:

```
npm install --no-save playwright
npx playwright install chromium
```

The browser test opens the app for real, uploads photographs, presses the buttons, exports an
MP4 and checks with ffmpeg that what came back is genuinely H.264 at the right size — then
restarts the server and reloads to prove your work survived.

If something looks wrong, open **http://localhost:3000/api/health** in your browser. It
answers in one line where your work is stored, whether the key was found, and whether MP4 is
available.

---

## The files

| | |
|---|---|
| `start-vastrangam.bat` | double-click this |
| `.env` | your key and settings — never commit this file |
| `data/` | your work: the workspace and every photograph |
| `web/` | the app the browser loads — **generated**, do not edit by hand |
| `server/` | the server: storage, the Gemini proxy, MP4 |
| `build.cjs` | rebuilds `web/` from `brand/suite/aiengine` |

The screens live in `brand/suite/aiengine`, and both this app and the offline single file are
built from them. There is one copy of the interface, so a fix lands in both and they cannot
drift apart.

---

## The offline file is still yours

`Vastrangam_AI_Engine.html` still works with the wifi off, on a laptop with nothing installed,
by double-clicking it. It is the fallback, and it costs nothing to keep. The only things it
cannot do are the four above: shared storage, fast reading, MP4, and your phone.
