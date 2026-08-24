'use strict';
/* WHICH APPS ACTUALLY EXIST — one list, because two lists disagree.
 *
 * This started as a literal inside mkfinal.js. The moment a second document needed the
 * same answer, the choice was to copy it or to name it, and copying a fact is how the
 * number in one document stops matching the number in another — the exact failure
 * modules.js exists to prevent, reproduced one level down.
 *
 * WHY IT IS A LIST AND NOT A DIRECTORY SCAN
 * The built apps land in brand/suite/deep/out/, which is gitignored — a fresh clone has
 * none of them, and a scan would report zero apps built until somebody ran the build. A
 * document that says "0 working today" because of a missing folder is worse than one
 * carrying a list somebody has to update, because the first is wrong silently.
 *
 * SO IT IS CHECKED INSTEAD. verify() compares this list against what is actually on disk
 * whenever the build HAS been run, and says so when they disagree. Names here are app
 * names exactly as modules.js spells them; a name that matches no app is a name that
 * silently counts nothing.
 */

const fs = require('node:fs');
const path = require('node:path');

/* App names, spelled as modules.js spells them. */
const BUILT = new Set([
  'CEO Dashboard', 'Report Builder', 'Group Consolidation',
  'CRM & Customer 360', 'Documents & eSign', 'Helpdesk & Live Chat',
  'D2C Sales', 'B2B & Credit', 'Export', 'POS', 'Quotes & Proforma',
  'Marketplace OMS', 'Order Management', 'Procurement', 'Vendor Management',
  'Ask & Print',
]);

/* Every name above must be a real app. A typo here does not raise anything — it just
   quietly stops counting one app, and the total in every document drops by one with no
   explanation anywhere. */
function verify(MODULES) {
  const problems = [];
  const all = new Set();
  MODULES.forEach((m) => m.apps.forEach((a) => all.add(a[0])));

  for (const name of BUILT) {
    if (!all.has(name)) {
      problems.push(`built.js names "${name}", which is not an app in modules.js — ` +
        `it is counting nothing, and every "working today" figure is one too low`);
    }
  }

  /* And if the apps HAVE been built, the list should match the folder. Skipped rather
     than failed on a fresh clone, where out/ is gitignored and legitimately empty. */
  const out = path.join(__dirname, '..', 'suite', 'deep', 'out');
  if (fs.existsSync(out)) {
    const n = fs.readdirSync(out).filter((f) => f.endsWith('_ERP.html')).length;
    /* Two of the builds are unified deliveries of a whole module rather than single
       apps, so the folder carries more files than this list carries names. */
    if (n && n < BUILT.size) {
      problems.push(`built.js names ${BUILT.size} apps but only ${n} are built in ` +
        `brand/suite/deep/out/ — one of the two is out of date`);
    }
  }
  return problems;
}

/* How many of a module's apps are working today. */
const builtIn = (m) => m.apps.filter((a) => BUILT.has(a[0])).length;

module.exports = { BUILT, verify, builtIn };
