'use strict';
/* WHERE CHROMIUM IS — asked once, answered the same way everywhere.

   Seventeen scripts in this repository each carried the line

       const EXE = '/opt' + '/pw-browsers/chromium-1194/chrome-linux/chrome';

   (written split above so a future search-and-replace over this repo cannot rewrite the
   very example that explains why the line was wrong), which is correct on exactly one machine. It is not a path a fresh clone has, it is not the
   path a developer's laptop has, and the version number in it goes stale the first time the
   browser is updated. Every one of those scripts would fail with a launch error naming a
   directory the reader has never heard of.

   So the question is asked in one place, nearest-first, and the failure names the fix:

     CHROME_PATH        set it yourself and nothing here argues
     the pinned install  what `npx playwright install chromium` puts in the project
     the image's copy    what this container happens to ship
     the system browser  what a normal Linux box has

   playwrightExecutable() returns a path or throws with an instruction. Nothing guesses. */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

/* Expanded lazily: globbing a directory that does not exist must not throw at require time. */
function versionedChromiums(root) {
  try {
    return fs.readdirSync(root)
      .filter((d) => d.startsWith('chromium'))
      .sort()
      .reverse()                       // newest revision first
      .flatMap((d) => [
        path.join(root, d, 'chrome-linux', 'chrome'),
        path.join(root, d, 'chrome-linux', 'headless_shell'),
      ]);
  } catch (_) { return []; }
}

function candidates() {
  const out = [];
  if (process.env.CHROME_PATH) out.push(process.env.CHROME_PATH);
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) {
    out.push(...versionedChromiums(process.env.PLAYWRIGHT_BROWSERS_PATH));
  }
  out.push(...versionedChromiums('/opt/pw-browsers'));
  out.push(...versionedChromiums(path.join(os.homedir(), '.cache', 'ms-playwright')));
  out.push(
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable', '/snap/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  );
  return out;
}

/** The Chromium this machine actually has. Throws with the fix rather than a stack trace.
 *
 *  Two passes, and the order matters: a full `chrome` is preferred over `headless_shell`.
 *  Reverse-sorting the directory names alone picked the shell, because "chromium_headless_shell"
 *  sorts above "chromium-" on the underscore — an alphabetical accident, not a decision. The
 *  shell renders fine for everything here, but it is the cut-down build and should be the
 *  fallback rather than the default. */
function chromePath() {
  const all = candidates();
  const full = all.filter((c) => c && !c.includes('headless_shell'));
  for (const c of [...full, ...all]) {
    try { if (c && fs.existsSync(c)) return c; } catch (_) { /* keep looking */ }
  }
  throw new Error(
    'Chromium not found. Either:\n' +
    '  · npx playwright install chromium      (installs it for this project)\n' +
    '  · export CHROME_PATH=/path/to/chrome   (point at one you already have)\n' +
    'Looked in: PLAYWRIGHT_BROWSERS_PATH, /opt/pw-browsers, ~/.cache/ms-playwright, /usr/bin.'
  );
}

/** playwright-core itself, resolved the same nearest-first way. */
function playwright() {
  const tries = [
    process.env.PW_CORE,
    path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'),
    path.join(__dirname, '..', '..', 'app', 'node_modules', 'playwright-core'),
    'playwright-core',
    'playwright',
  ].filter(Boolean);
  for (const t of tries) {
    try { return require(t); } catch (_) { /* try the next one */ }
  }
  throw new Error('playwright-core not found — run `npm ci` at the repo root, or set PW_CORE.');
}

module.exports = { chromePath, playwright, candidates };
