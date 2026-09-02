'use strict';
/* THE TRUTH REGISTRY, CHECKED — the gate that refuses a status nothing proves.
 *
 *   node brand/site/checkregistry.js
 *   node brand/site/checkregistry.js --summary
 *
 * WHY A GATE AND NOT A DOCUMENT
 * A status table anybody can raise by typing a better word into it is a table that will be
 * raised by typing a better word into it. That is not a hypothetical here: this session
 * produced a rule claiming ENFORCED against a test file nobody had written, and the only
 * reason it did not ship is that checkrules.js went and looked. This file is that same
 * mechanism aimed at build state.
 *
 * WHAT IT ENFORCES, IN ORDER OF HOW EXPENSIVE THE MISTAKE WOULD BE:
 *
 *   1 · the register's own shape           registry.js check()
 *   2 · every app in modules.js has        a row, exactly one, spelled the same. An entry
 *       naming an app that does not exist counts nothing, silently.
 *   3 · IMPLEMENTED and above              names files, and every one is really on disk
 *   4 · TESTED and above                   names a command recorded in EVIDENCE.md at exit 0
 *   5 · the two registers agree            built.js and registry.js cannot disagree about
 *                                          the same app — that is the duplication failure
 *                                          built.js's own comment describes, one level up
 *   6 · nothing is quietly at the top       VERIFIED / PRODUCTION-READY are refused outright
 *
 * RULE 4 IS THE ONE WITH TEETH. "There is a test file" is rule 3, and rule 3 is cheap —
 * a file can exist and never run. Rule 4 demands the command appear in the evidence log
 * with a zero exit recorded by tools/evidence.js, which is the only claim here that does
 * not route through my typing.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const REG = require('./registry.js');
const MODULES = require('./modules.js');
const BUILT = require('./built.js');

const summary = process.argv.includes('--summary');
let failures = 0;
const fail = (m) => { failures++; console.error('checkregistry: ' + m); };

const ALL = REG.rows(MODULES);

/* ── 1 · the register's own shape ─────────────────────────────────────────── */
REG.check().forEach((b) => fail(`registry.js — ${b}`));

/* ── 2 · the rows are a partition of the app list ──────────────────────────── */
const appNames = new Set();
MODULES.forEach((m) => m.apps.forEach((a) => appNames.add(a[0])));

Object.keys(REG.APPS).forEach((name) => {
  if (!appNames.has(name)) {
    fail(`registry.js raises "${name}" above SPECIFIED, and modules.js has no app of that ` +
      `name. It is raising nothing — the row is invisible in every count and no error ` +
      `anywhere says so.`);
  }
});

const rowsForApps = ALL.filter((r) => r.kind === 'app');
if (rowsForApps.length !== [...appNames].length) {
  /* Two apps sharing a name would make this trip; so would an app appearing twice. */
  const counted = {};
  rowsForApps.forEach((r) => { counted[r.name] = (counted[r.name] || 0) + 1; });
  const dupes = Object.entries(counted).filter(([, n]) => n > 1).map(([n]) => n);
  fail(`${rowsForApps.length} app row(s) for ${appNames.size} distinct app name(s)` +
    (dupes.length ? ` — repeated: ${dupes.join(', ')}` : '') + '.');
}

/* ── 3 · a file claim is a file on disk ────────────────────────────────────── */
ALL.forEach((r) => {
  r.files.forEach((f) => {
    if (!fs.existsSync(path.join(ROOT, f))) {
      fail(`${r.id} (${r.name}) is ${r.status} and cites ${f}, which does not exist. ` +
        `A status resting on a file nobody wrote is exactly the defect this gate was ` +
        `built after.`);
    }
  });
  if (REG.NEEDS_FILE.includes(r.status) && !r.files.length) {
    fail(`${r.id} (${r.name}) is ${r.status} and names no file at all.`);
  }
});

/* ── 4 · a TESTED claim is a recorded, passing run ─────────────────────────── */
/* Read the evidence log through its own parser rather than by grepping the markdown, so
   this gate and `evidence.js --check` can never disagree about what the file says. */
const EVID = require('../../tools/evidence.js');
const recorded = EVID.entries();
/* A COMMAND RECORDED FAILING AND LATER PASSING COUNTS AS PASSING, and that is deliberate
   rather than an oversight. `npm test` appears twice in the log — once at exit 1 and once
   at exit 0 after the cause was found and written down — and the second run is the true
   one. The first plant aimed at this rule picked `npm test` for its failing record and
   fired nothing, which looked for a moment like a hole in the gate; it was a hole in the
   plant. What the rule refuses is a command whose ONLY records are failures, and it was
   re-aimed at one to prove it. Deleting the old failure to make the log tidy would remove
   the only record that the failure ever happened. */
const passing = new Set(recorded.filter((e) => e.exit_code === 0).map((e) => e.command));

ALL.forEach((r) => {
  if (!REG.NEEDS_RUN.includes(r.status)) return;
  if (!r.run) { fail(`${r.id} (${r.name}) is ${r.status} and names no command.`); return; }
  if (!passing.has(r.run)) {
    const seen = recorded.find((e) => e.command === r.run);
    fail(`${r.id} (${r.name}) claims ${r.status} on \`${r.run}\`, and ` + (seen
      ? `docs/verification/EVIDENCE.md records that command at exit ${seen.exit_code}. ` +
        `A failing run does not raise a status.`
      : `docs/verification/EVIDENCE.md has no record of that command ever being run. ` +
        `Record it: node tools/evidence.js --id <ID> -- ${r.run}`));
  }
});

/* ── 5 · the two build-state registers must agree ──────────────────────────── */
/* built.js answers "does it stand up" for apps; this answers it for everything. Two
   registers that can disagree about the same app will, and the day they do the number is
   already inside a delivered document. */
const RANK = (s) => REG.STATUSES.indexOf(s);
const atLeast = (r, s) => RANK(r.status) >= RANK(s) && RANK(r.status) <= RANK('PRODUCTION-READY');

rowsForApps.forEach((r) => {
  const b = BUILT.stateOf(r.name);
  if (b === 'PLATFORM' && !atLeast(r, 'TESTED')) {
    fail(`built.js says "${r.name}" runs on the real database with a test behind it; the ` +
      `registry has it at ${r.status}. The registry is under-claiming a proof that exists.`);
  }
  if ((b === 'BROWSER' || b === 'ENGINE') && !atLeast(r, 'IMPLEMENTED')) {
    fail(`built.js says "${r.name}" is ${b}; the registry has it at ${r.status}. One of ` +
      `the two registers is wrong about the same app.`);
  }
  if (b === 'SPECIFIED' && atLeast(r, 'IMPLEMENTED')) {
    fail(`the registry has "${r.name}" at ${r.status}; built.js does not list it as ` +
      `standing up at all. A capability matrix that over-claims against the register ` +
      `beside it is worse than having no matrix.`);
  }
});

/* built.js's own consistency, run here because nothing else calls it — it went its whole
   life uncalled and reported a real disagreement the first time it was invoked by hand. */
BUILT.verify(MODULES).forEach((p) => fail(`built.js — ${p}`));

/* ── 6 · nothing sits at a rung this repository cannot reach ───────────────── */
ALL.filter((r) => r.status === 'VERIFIED' || r.status === 'PRODUCTION-READY')
  .forEach((r) => fail(`${r.id} (${r.name}) claims ${r.status}.`));

/* ── 7 · the generated document names no customer ──────────────────────────── */
/* This measures the PRODUCT's build state. A tenant's engine has its own tests and its own
   evidence, and letting one in here is how a customer's several hundred passing checks end
   up flattering a product with a handful of working apps. The document is generated, so
   this can only trip if a register upstream of it started naming a trade. */
const { TRADE_WORDS } = require('./checkneutral.js');
const DOC = path.join(ROOT, 'REQUIREMENTS_REGISTRY.md');
if (fs.existsSync(DOC)) {
  const text = fs.readFileSync(DOC, 'utf8');
  const found = TRADE_WORDS.filter((word) =>
    new RegExp('\\b' + word.replace(/ /g, '\\s+'), 'i').test(text));
  if (found.length) {
    fail(`REQUIREMENTS_REGISTRY.md names ${found.join(', ')}. It measures the product, ` +
      `and the product ships with no customer inside it.`);
  }
} else {
  fail('REQUIREMENTS_REGISTRY.md has not been generated — run ' +
    'node brand/delivery/website/mkregistry.js');
}

/* ── result ───────────────────────────────────────────────────────────────── */
const t = REG.tally(ALL);
if (failures) {
  console.error(`\ncheckregistry: ${failures} problem(s) across ${ALL.length} row(s).`);
  process.exit(1);
}
console.log(`checkregistry: ${ALL.length} rows valid — ${rowsForApps.length} apps + ` +
  `${REG.CAPABILITIES.length} capabilities; every file cited exists; every ` +
  `${REG.NEEDS_RUN.join('/')} claim matches a passing run in EVIDENCE.md; ` +
  `registry and built.js agree`);

if (summary) {
  console.log('');
  const w = Math.max(...REG.STATUSES.map((s) => s.length));
  REG.STATUSES.forEach((s) => {
    if (!t[s]) return;
    console.log(`  ${s.padEnd(w)}  ${String(t[s]).padStart(3)}  ` +
      `${'█'.repeat(Math.max(1, Math.round(t[s] / 3)))}`);
  });
  const zero = REG.STATUSES.filter((s) => !t[s]);
  console.log(`\n  no row at: ${zero.join(', ')}`);
  console.log('  VERIFIED and PRODUCTION-READY are empty by rule, not by accident — this');
  console.log('  gate refuses either one, because neither can be earned from inside a');
  console.log('  repository that has never been deployed or checked from outside itself.\n');

  console.log('  What is blocked, and by what:');
  ALL.filter((r) => r.status === 'BLOCKED').forEach((r) => {
    console.log(`    ${r.id}  ${r.name}`);
    console.log(`      ${r.blocker.split('. ')[0]}.`);
  });
  const ns = ALL.filter((r) => r.status === 'NOT STARTED');
  console.log(`\n  ${ns.length} not started: ${ns.map((r) => r.name).join(' · ')}`);
  const evd = recorded.length;
  console.log(`\n  ${evd} run(s) recorded in docs/verification/EVIDENCE.md, ` +
    `${passing.size} distinct command(s) at exit 0.\n`);
}
