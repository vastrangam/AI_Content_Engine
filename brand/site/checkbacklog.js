'use strict';
/* THE BACKLOG, CHECKED AGAINST THE SHEET THAT PRODUCED IT.
 *
 *   node brand/site/checkbacklog.js
 *   node brand/site/checkbacklog.js --summary
 *
 * WHAT THIS EXISTS TO PREVENT
 * A backlog is the easiest register to quietly edit, in either direction:
 *
 *   drop a line        — and the backlog looks shorter, which looks like progress
 *   add one            — and something already designed gets counted as missing, which
 *                        inflates the gap and makes the work look larger than it is
 *   give it a status   — and a list of things nobody scheduled starts reading as a plan
 *
 * So the list is not checked for plausibility. It is REBUILT from masterspec.js — every line
 * the coverage register resolves as uncovered AND absent — and required to match exactly.
 * There is no way to write this file wrong that the rebuild does not catch.
 *
 * THE RULES
 *   1 · the items are exactly the absent-uncovered set: none missing, none added
 *   2 · every theme's module number is a real module
 *   3 · every capability named is a real row in the requirements registry
 *   4 · every item names a theme that exists, and every theme has items
 *   5 · no item carries a status, and no theme carries a date or an estimate in days
 *   6 · every theme says what building it would mean and what it would cost
 */

const path = require('node:path');

const B = require('./backlog.js');
const SPEC = require('./masterspec.js');
const CHECK = require('./checkmasterspec.js');
const REGISTRY = require('./registry.js');
const MODULES = require('./modules.js');

const summary = process.argv.includes('--summary');
let failures = 0;
const fail = (m) => { failures++; console.error('checkbacklog: ' + m); };

const ROWS = REGISTRY.rows(MODULES);
const CAPS = new Set(ROWS.filter((r) => r.kind === 'capability').map((r) => r.id));
const modRows = Array.isArray(MODULES) ? MODULES : Object.values(MODULES).find(Array.isArray);

/* ── RULE 1 · the list is REBUILT, not reviewed ────────────────────────────
   This is the whole gate. Everything else is hygiene.

   THE KEY IS JSON, NOT A JOINED STRING. The first version separated the three parts with a
   NUL byte, which worked and made this source file literally binary — grep refused to read
   it as text, and an archive that sorts files by whether they are text would have filed a
   register as a blob. JSON.stringify is unambiguous for the same reason NUL was chosen and
   is printable, which the NUL was not. */
const key = (n, block, text) => JSON.stringify([n, block, text]);
const expected = [];
SPEC.SECTIONS.forEach((s) => s.blocks.forEach((b) => b.items.forEach((item) => {
  if (CHECK.verdictOf(item) === 'UNCOVERED' && CHECK.medhavaOf(item).state === 'ABSENT') {
    expected.push(key(s.n, b.title, item[0]));
  }
})));
const got = B.ITEMS.map(([n, block, text]) => key(n, block, text));

const expSet = new Set(expected);
const gotSet = new Set(got);
const show = (k) => JSON.parse(k).join(' · ');

const missing = expected.filter((k) => !gotSet.has(k));
const added = got.filter((k) => !expSet.has(k));

if (missing.length) {
  fail(`${missing.length} line(s) are absent from the design and missing from this backlog. ` +
    `Dropping one makes the backlog look shorter without anything being built:\n    ` +
    missing.slice(0, 8).map(show).join('\n    ') + (missing.length > 8 ? '\n    …' : ''));
}
if (added.length) {
  fail(`${added.length} line(s) here are NOT absent from the design — they already map to an ` +
    `app, or they are marked impossible. Counting them as missing inflates the gap:\n    ` +
    added.slice(0, 8).map(show).join('\n    ') + (added.length > 8 ? '\n    …' : ''));
}
if (got.length !== gotSet.size) {
  const seen = new Set();
  const dup = got.filter((k) => (seen.has(k) ? true : (seen.add(k), false)));
  fail(`${dup.length} line(s) are listed twice: ${dup.slice(0, 4).map(show).join(' | ')}`);
}

/* ── 2, 3, 6 · the themes ──────────────────────────────────────────────────── */
const themeIds = new Set();
B.THEMES.forEach((t, i) => {
  const at = t.id || `theme ${i + 1}`;
  if (!t.id) fail(`theme ${i + 1} has no id`);
  if (themeIds.has(t.id)) fail(`${at} is defined twice`);
  themeIds.add(t.id);

  if (!t.title || t.title.length < 10) fail(`${at} has no title worth scanning`);

  /* The field is `n`, not `num`. Written as `num` this reported all twelve themes as
     pointing at modules that do not exist — a gate failing every row is a gate nobody
     believes, and the data was correct the whole time. */
  const mod = modRows.find((m) => String(m.n) === String(t.module));
  if (!mod) {
    fail(`${at} says it would live in module ${t.module}, which is not a module in ` +
      `modules.js — so the one thing a reader would use to place it is wrong`);
  }
  if (t.capability && !CAPS.has(t.capability)) {
    fail(`${at} cites capability ${t.capability}, which is not a row in the requirements ` +
      `registry`);
  }

  /* ── 6 · a theme that does not say what it would mean is a label ──────── */
  ['means', 'cost'].forEach((k) => {
    if (!t[k] || t[k].length < 80) {
      fail(`${at} has no ${k}, or one too short to be one. Without it a reader has a count ` +
        `and no way to judge whether the count matters.`);
    }
  });

  /* ── 5 · no status, no estimate in days ──────────────────────────────── */
  ['status', 'state', 'rung', 'done', 'eta', 'due'].forEach((k) => {
    if (k in t) {
      fail(`${at} carries \`${k}\`. Nothing here is scheduled, and a status would make an ` +
        `unscheduled list read as a plan.`);
    }
  });
  if (/\b\d+\s*(day|week|month)s?\b/i.test(t.cost || '')) {
    fail(`${at} puts a duration in its cost. Nobody has estimated these; a number here would ` +
      `be read as one.`);
  }
});

/* ── 4 · items and themes reference each other ─────────────────────────────── */
const used = new Set();
B.ITEMS.forEach(([n, block, text, theme], i) => {
  if (!themeIds.has(theme)) {
    fail(`item ${i + 1} "${text}" is in theme ${theme}, which is not defined`);
  }
  used.add(theme);
  if (B.ITEMS[i].length > 4) {
    fail(`item ${i + 1} "${text}" carries a fifth field. An item is ` +
      `[section, block, text, theme] and nothing else — a status would make this a plan.`);
  }
});
/* THIS RULE USED TO SAY THE OPPOSITE, AND THE INVERSION IS THE WHOLE STEP.
   It read: a theme with no items is a heading, not a capability — which was right while the
   backlog held 109 lines and a theme was a bucket for some of them. Every line now resolves to
   a named app, so ITEMS is empty and EVERY theme is itemless. Left as it was, the gate would
   have failed twelve times at the exact moment the thing it exists to detect was finally fixed.

   So the pairing is checked only in the direction that can still go wrong: an item must name a
   theme that exists. A theme with no items is now the expected state, and it keeps its place
   because its `means` and `cost` are the reasoning behind the modules those capabilities became
   — deleting them would throw away the argument and keep only the conclusion. */
if (B.ITEMS.length) {
  B.THEMES.forEach((t) => {
    if (!used.has(t.id)) {
      fail(`${t.id} has no items while others do. With lines still absent, a theme nobody put ` +
        `one in is a heading rather than a capability.`);
    }
  });
}

/* ── result ────────────────────────────────────────────────────────────────── */
if (failures) {
  console.error(`\ncheckbacklog: ${failures} problem(s) across ${B.ITEMS.length} item(s).`);
  process.exit(1);
}

const byTheme = {};
B.ITEMS.forEach(([, , , t]) => { byTheme[t] = (byTheme[t] || 0) + 1; });

console.log(`checkbacklog: ${B.ITEMS.length} lines the design does not name, in ` +
  `${B.THEMES.length} themes — rebuilt from the coverage register and matching it exactly, ` +
  `every module and capability real, nothing carrying a status`);

if (summary) {
  /* DERIVED, NOT TYPED. These three numbers were literals here — "113 apps", "222", and a
     largest-theme figure — inside the one file whose job is to stop a count drifting. §3 rule 7
     applies to a gate's own output as much as to a document's. */
  const NAPP = modRows.reduce((s, m) => s + m.apps.length, 0);
  const counts = Object.values(byTheme);
  console.log('');
  B.THEMES.forEach((t) => {
    const mod = modRows.find((m) => String(m.n) === String(t.module));
    console.log(`  ${String(byTheme[t.id] || 0).padStart(3)}  ${t.title}`);
    console.log(`       lives in module ${t.module} ${mod ? mod.name : ''}` +
      (t.capability ? ` · ${t.capability}` : ''));
  });
  console.log('');
  if (B.ITEMS.length) {
    console.log(`  The largest theme holds ${Math.max(...counts)} of the ${B.ITEMS.length}, ` +
      `which is why the raw count misleads.`);
  } else {
    console.log(`  Every line the specification asks for now resolves to a named app, across`);
    console.log(`  ${modRows.length} modules and ${NAPP} apps. Nothing was built to achieve`);
    console.log('  that — the apps entered at the lowest rung, so the tested ratio got WORSE.');
    console.log('  The denominator grew because the design stopped being silent.');
  }
  console.log('');
}
