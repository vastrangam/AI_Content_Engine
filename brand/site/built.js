'use strict';
/* WHICH APPS ACTUALLY EXIST — one list, because two lists disagree.
 *
 * This started as a literal inside mkfinal.js. The moment a second document needed the
 * same answer, the choice was to copy it or to name it, and copying a fact is how the
 * number in one document stops matching the number in another — the exact failure
 * modules.js exists to prevent, reproduced one level down.
 *
 * IT GOT COPIED ANYWAY, TWICE. build.js and mklanding.js each re-declared BUILT and
 * ENGINE rather than importing them. All three agreed, so nothing was ever wrong — which
 * is the whole difficulty with duplication: it is not a defect until the day it is, and
 * by then the number is in a delivered document. Both now import from here.
 *
 * "BUILT" WAS ONE WORD FOR THREE DIFFERENT CLAIMS, and they are not interchangeable:
 *
 *   PLATFORM  runs on the real database, inside row-level security, with a test that
 *             starts Postgres and drives it. This is the strongest claim in the
 *             repository and the smallest list.
 *   BROWSER   opens in a browser, carries its own self-tests, passes the click-through
 *             audit in both editions. No shared database behind it.
 *   ENGINE    the arithmetic is written and passes on the command line, and there is no
 *             screen. Not "built" — the sentence beside that count promises a browser
 *             check these have not had — and not "to build" either, because the hard
 *             part runs.
 *
 * Anything named in none of them is SPECIFIED: written down, not standing up.
 *
 * WHY THESE ARE LISTS AND NOT A DIRECTORY SCAN
 * The browser apps land in brand/suite/deep/out/, which is gitignored — a fresh clone has
 * none of them, and a scan would report zero apps built until somebody ran the build. A
 * document that says "0 working today" because of a missing folder is worse than one
 * carrying a list somebody has to update, because the first is wrong silently.
 */

const fs = require('node:fs');
const path = require('node:path');

/* Opens in a browser, self-tested, click-through audited. Spelled as modules.js spells it. */
const BUILT = new Set([
  'CEO Dashboard', 'Report Builder', 'Group Consolidation',
  'CRM & Customer 360', 'Documents & eSign', 'Helpdesk & Live Chat',
  'D2C Sales', 'B2B & Credit', 'Export', 'POS', 'Quotes & Proforma',
  'Marketplace OMS', 'Order Management', 'Procurement', 'Vendor Management',
  'Ask & Print',
]);

/* Engine written and passing on the command line, no screen. Each is backed by a command
   anyone can run:
     Provider Router & Cost Guard  node brand/suite/router.js --selftest
     Motion Renderer               node brand/suite/studio/motion_render.js --selftest */
const ENGINE = new Set([
  'Provider Router & Cost Guard',
  'Motion Renderer',
]);

/* ON THE REAL DATABASE — the strongest claim here, so each one names the test that
   proves it and verify() checks that file is really on disk. A claim of this kind with
   no test behind it is the single most expensive thing this file could carry.
   'D2C Sales' appears in BROWSER too: the prototype screen came first, the platform
   implementation second. Both are true, and the platform claim is the stronger one. */
const PLATFORM = {
  'Stock': 'medhava/test/inventory.test.js',
  'D2C Sales': 'medhava/test/sales.test.js',
  /* Module 07, added with Q02. Stock could be issued and a sale could be posted, and nothing
     could put stock there — so every demonstration began with a quantity somebody had seeded.
     'Procurement' appears in BROWSER too, like D2C Sales: the prototype screen came first and
     the platform implementation second. Both are true and this is the stronger claim. */
  'Procurement': 'medhava/test/purchase.test.js',
};

const STATES = ['PLATFORM', 'BROWSER', 'ENGINE', 'SPECIFIED'];

/* One question, one answer, in strength order. Callers that need the finer distinction
   read PLATFORM/BUILT/ENGINE directly; callers that just want a badge use this. */
function stateOf(name) {
  if (Object.prototype.hasOwnProperty.call(PLATFORM, name)) return 'PLATFORM';
  if (BUILT.has(name)) return 'BROWSER';
  if (ENGINE.has(name)) return 'ENGINE';
  return 'SPECIFIED';
}

/* Every name above must be a real app. A typo here does not raise anything — it just
   quietly stops counting one app, and the total in every document drops by one with no
   explanation anywhere. */
function verify(MODULES) {
  const problems = [];
  const all = new Set();
  MODULES.forEach((m) => m.apps.forEach((a) => all.add(a[0])));

  for (const [label, names] of [['BUILT', BUILT], ['ENGINE', ENGINE],
                                ['PLATFORM', Object.keys(PLATFORM)]]) {
    for (const name of names) {
      if (!all.has(name)) {
        problems.push(`built.js ${label} names "${name}", which is not an app in ` +
          `modules.js — it is counting nothing, and every figure derived from this list ` +
          `is one too low with nothing to say so`);
      }
    }
  }

  /* An app cannot be both a browser screen with no engine and an engine with no screen. */
  for (const name of ENGINE) {
    if (BUILT.has(name)) {
      problems.push(`built.js has "${name}" in both BUILT and ENGINE. BUILT promises a ` +
        `browser check and ENGINE says there is no screen to check — one of them is false`);
    }
  }

  /* THE PART THAT MATTERS MOST: a platform claim names a test, and the test exists. */
  const root = path.join(__dirname, '..', '..');
  for (const [name, proof] of Object.entries(PLATFORM)) {
    if (!proof || !fs.existsSync(path.join(root, proof))) {
      problems.push(`built.js claims "${name}" runs on the real database and cites ` +
        `${proof || '(nothing)'}, which does not exist. The strongest claim in this ` +
        `repository may not rest on a file nobody wrote`);
    }
  }

  /* WHAT IS DELIBERATELY NOT CHECKED, AND WHY.
     This used to compare BUILT.size against the count of *_ERP.html in
     brand/suite/deep/out/ and fail when they differed. That folder is gitignored build
     output: a normal checkout has 2 of the 16, so the check reported "one of the two is
     out of date" on a perfectly correct tree. It never fired, because nothing called
     verify() — wiring it up without fixing it would have failed the build on day one.
     The count is reported by summary() instead, where a human can weigh it. */
  return problems;
}

/* How many of a module's apps are working today, by each meaning of the word. */
const builtIn = (m) => m.apps.filter((a) => BUILT.has(a[0])).length;
const engineIn = (m) => m.apps.filter((a) => ENGINE.has(a[0])).length;
const platformIn = (m) => m.apps.filter((a) => stateOf(a[0]) === 'PLATFORM').length;

/* Informational, never a pass/fail: how much of the browser build is present here. */
function onDisk() {
  const out = path.join(__dirname, '..', 'suite', 'deep', 'out');
  if (!fs.existsSync(out)) return null;
  return fs.readdirSync(out).filter((f) => f.endsWith('_ERP.html')).length;
}

module.exports = {
  BUILT, ENGINE, PLATFORM, STATES,
  stateOf, verify, builtIn, engineIn, platformIn, onDisk,
};
