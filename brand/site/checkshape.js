'use strict';
/* THE STRUCTURAL NEUTRALITY GATE — does this platform have the SHAPE of one trade?
 *
 *   node brand/site/checkshape.js
 *   node brand/site/checkshape.js --summary
 *
 * WHY THIS EXISTS, AND WHY checkneutral.js COULD NEVER CATCH IT
 * checkneutral.js is a word blocklist. It fails the build if `vastrangam`, `adini`, `go4fashion`
 * or `muskan` reaches the neutral edition. That is a real check and it stays.
 *
 * But it reads VOCABULARY. Every one of the following passed it, every time:
 *
 *   - 46 product screens name 12 trades; core/packs/ holds 6 packs
 *   - a restaurant group is shown a screen and nothing in the engine can configure a restaurant
 *   - Module 15 is 11 apps of marketplace e-commerce; Module 19 is 3 apps that presume selling
 *     online; a law practice would open none of them
 *
 * None of that says a banned word. "Any industry" is a claim about the STRUCTURE, so it is
 * checked against the structure.
 *
 * WHAT IS MEASURED
 *   1 · every trade shown can be configured          FAILS the build
 *   2 · every app declares who it is for             FAILS the build
 *   3 · every trade reaches the business spine       FAILS the build
 *   4 · how lopsided the map is                      REPORTED, no threshold
 *
 * Measure 4 is deliberately not a gate. A pass/fail line there would be a number I chose, and a
 * number chosen rather than derived is the thing this repository treats as fabrication. It gets
 * printed so a person can look at it and decide there is a threshold worth defending.
 */

const path = require('node:path');

const MODULES = require('./modules.js');
const SECTORS = require('./sectors.js');

let REACH = null;
try { REACH = require('./reach.js'); } catch (_) { /* measure 2 reports its absence */ }

const summary = process.argv.includes('--summary');
let failures = 0;
const fail = (msg) => { failures++; console.error(msg); };

/* Apps, read from the canonical list — never retyped. */
const APPS = [];
MODULES.forEach((m) => (m.apps || []).forEach((a) => {
  APPS.push({ mod: m.n, module: m.name, name: Array.isArray(a) ? a[0] : (a.name || String(a)) });
}));

/* THE BUSINESS SPINE.
   The floor is stated as CAPABILITIES, not as an app count, because a count would be a number
   somebody picked. These are the things a business cannot run its books without: who you are and
   what happened (Platform), a way to take money in, a way to record it, people, and a way to see
   it. A trade that reaches fewer than all five is being shown a product it cannot actually run. */
const SPINE = [
  { need: 'identity, settings and the audit trail', mods: ['01'] },
  { need: 'a way to sell', mods: ['05', '15'] },
  { need: 'the books', mods: ['12'] },
  { need: 'people and pay', mods: ['16'] },
  { need: 'seeing the business', mods: ['21'] },
];

/* ── 0 · the registry is itself valid ─────────────────────────────────────── */
const registryBad = SECTORS.check();
registryBad.forEach((b) => fail(`checkshape: sectors.js — ${b}`));

const shown = SECTORS.screenSectors();
const declared = new Map(SECTORS.SERVED.map((s) => [s.sector, s]));
const packs = SECTORS.packs();

/* ── 1 · every trade shown can be configured ──────────────────────────────── */
const undeclared = [...shown.keys()].filter((s) => !declared.has(s));
if (undeclared.length) {
  fail(`\ncheckshape: ${undeclared.length} trade(s) appear on a product screen with no entry in ` +
    `sectors.js:\n  ${undeclared.join('\n  ')}`);
  console.error('  A new screen must force a decision about whether the engine can serve it.');
}

const stale = [...declared.keys()].filter((s) => !shown.has(s));
if (stale.length) {
  fail(`\ncheckshape: sectors.js names ${stale.length} trade(s) that no screen shows: ` +
    stale.join(', '));
}

const unserved = SECTORS.SERVED.filter((s) => shown.has(s.sector) && !s.pack);
if (unserved.length) {
  fail(`\ncheckshape: ${unserved.length} trade(s) are SHOWN a screen and cannot be configured — ` +
    `there is no pack in core/packs/ that makes the software theirs.\n`);
  unserved.forEach((s) => {
    console.error(`  ${s.sector}`);
    console.error(`      shown in modules ${[...new Set(shown.get(s.sector))].sort().join(', ')}`);
    console.error(`      ${s.why}\n`);
  });
  console.error('  This is a promise the code cannot keep. Two honest ways to clear it:');
  console.error('    write the pack, or withdraw the screen. Nothing else.');
}

/* ── 2 · every app declares who it is for ─────────────────────────────────── */
/* An app is either universal — every business opens it — or it belongs to named trades. An app
   that declares neither is a structural assumption nobody wrote down, and those are exactly the
   ones that made this map one trade's shape while every check passed. */
if (!REACH) {
  fail('\ncheckshape: brand/site/reach.js does not exist. Every one of the ' + APPS.length +
    ' apps must declare `universal: true` or the trades it is for.');
} else {
  const byName = new Map(REACH.REACH.map((r) => [r.app, r]));
  const missing = APPS.filter((a) => !byName.has(a.name));
  if (missing.length) {
    fail(`\ncheckshape: ${missing.length} of ${APPS.length} apps declare no reach:`);
    missing.slice(0, 12).forEach((a) => console.error(`  ${a.mod} ${a.module} — ${a.name}`));
    if (missing.length > 12) console.error(`  … and ${missing.length - 12} more`);
  }
  const orphan = REACH.REACH.filter((r) => !APPS.some((a) => a.name === r.app));
  if (orphan.length) {
    fail(`\ncheckshape: reach.js names ${orphan.length} app(s) that modules.js does not have: ` +
      orphan.map((r) => r.app).join(', '));
  }
  const reachBad = REACH.check(APPS.map((a) => a.name), [...declared.keys()]);
  reachBad.forEach((b) => fail(`checkshape: reach.js — ${b}`));
}

/* ── 3 · every trade reaches the business spine ───────────────────────────── */
/* Which apps a given trade actually gets. Universal apps count for everybody. */
function appsFor(sector) {
  if (!REACH) return [];
  const byName = new Map(REACH.REACH.map((r) => [r.app, r]));
  return APPS.filter((a) => {
    const r = byName.get(a.name);
    if (!r) return false;
    return r.universal || (r.sectors || []).includes(sector);
  });
}

const perSector = new Map();
if (REACH) {
  for (const sector of declared.keys()) {
    const mine = appsFor(sector);
    perSector.set(sector, mine);
    const mods = new Set(mine.map((a) => a.mod));
    const short = SPINE.filter((s) => !s.mods.some((m) => mods.has(m)));
    if (short.length) {
      fail(`\ncheckshape: "${sector}" cannot run a business — it reaches no app for:`);
      short.forEach((s) => console.error(`      ${s.need}  (module ${s.mods.join(' or ')})`));
    }
  }
}

/* ── 4 · how lopsided the map is — reported, never failed ─────────────────── */
if (summary && REACH) {
  const rows = [...perSector.entries()].sort((a, b) => b[1].length - a[1].length);
  const uni = REACH.REACH.filter((r) => r.universal).length;
  console.log(`\n  ${APPS.length} apps · ${uni} universal · ${APPS.length - uni} scoped to ` +
    `named trades\n`);
  const w = Math.max(...rows.map(([s]) => s.length));
  rows.forEach(([s, apps]) => {
    const pack = declared.get(s).pack;
    const bar = '█'.repeat(Math.round(apps.length / 4));
    console.log(`  ${s.padEnd(w)}  ${String(apps.length).padStart(3)}  ${bar}` +
      (pack ? '' : '   ← no pack'));
  });
  if (rows.length) {
    const most = rows[0][1].length;
    const least = rows[rows.length - 1][1].length;
    console.log(`\n  widest ${most} · narrowest ${least} · spread ${most - least} apps.`);
    console.log('  Reported, not gated: a pass mark here would be a number nobody derived.\n');
  }
}

/* ── result ──────────────────────────────────────────────────────────────── */
if (failures) {
  console.error(`\ncheckshape: ${failures} problem(s). ` +
    `${shown.size} trades shown · ${packs.size} packs · ${APPS.length} apps.`);
  console.error('checkneutral.js checks the words. This checks the shape. Both have to pass.');
  process.exit(1);
}
console.log(`checkshape: all valid — ${shown.size} trades shown, every one configurable; ` +
  `${APPS.length} apps, every one declaring who it is for; every trade reaches the spine`);
