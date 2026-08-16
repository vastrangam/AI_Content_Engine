'use strict';
/* The gate on the rulebook.

   WHY THIS EXISTS
   A rulebook is the easiest document in the world to fake. Write two hundred
   confident sentences, mark them all "enforced", and nobody reads far enough
   to check. This file makes that impossible: a rule that claims to be enforced
   must name a file that exists and, where it names a test, that exact test
   string must be findable in that file. Claim proof you do not have and the
   build stops.

   It also enforces the shape that makes a rule a rule. "The system tracks
   stock" is a description. A rule says what happens WHEN something occurs,
   what the system THEN does, and — the part that actually constrains the
   software — what it will NEVER do instead. A rule with no `never` is a
   feature sentence wearing a rule's clothes, and is rejected.

   Run:
     node brand/site/checkrules.js              pass/fail, with every problem named
     node brand/site/checkrules.js --summary    the per-module table, 01 to 22
*/

const fs = require('node:fs');
const path = require('node:path');

const D = __dirname;
const REPO = path.resolve(D, '..', '..');
const MODULES = require('./modules.js');
const RULES = require('./rules.js');

const STATES = ['ENFORCED', 'SPECIFIED'];

/* A rule's `by` is either "<file>" or "<file> › <the exact test name>".
   The separator is the typographic › so a Windows path or a URL cannot be
   mistaken for it. */
function splitBy(by) {
  const i = by.indexOf('›');
  return i < 0
    ? { file: by.trim(), test: null }
    : { file: by.slice(0, i).trim(), test: by.slice(i + 1).trim() };
}

function run() {
  const problems = [];
  const P = (m) => problems.push(m);

  const modNums = new Set(MODULES.map((m) => m.n));
  const seen = new Map();
  /* files are read once each, not once per rule — the rulebook names the same
     test file a hundred times over */
  const cache = new Map();
  const readFile = (f) => {
    if (!cache.has(f)) {
      const p = path.join(REPO, f);
      cache.set(f, fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
    }
    return cache.get(f);
  };

  RULES.forEach((r, i) => {
    const where = r.id || `rule #${i + 1}`;

    ['id', 'mod', 'title', 'when', 'then', 'never', 'state', 'by'].forEach((k) => {
      if (!r[k] || !String(r[k]).trim()) P(`${where}: missing "${k}"`);
    });
    if (!r.id) return;

    if (seen.has(r.id)) P(`${r.id}: duplicate id (also at ${seen.get(r.id)})`);
    seen.set(r.id, where);

    if (!modNums.has(r.mod)) P(`${r.id}: module "${r.mod}" is not in modules.js`);

    /* the id must name the module it belongs to, or a rule renumbered by hand
       silently detaches from its module */
    const m = /^R(\d\d)\.(\d+)$/.exec(r.id || '');
    if (!m) P(`${r.id}: id must look like R07.3`);
    else if (m[1] !== r.mod) P(`${r.id}: id says module ${m[1]} but mod is ${r.mod}`);

    if (!STATES.includes(r.state)) {
      P(`${r.id}: state must be one of ${STATES.join(' / ')}, got "${r.state}"`);
    }

    /* Straight apostrophes break modules.js and read wrong in the PDF. Same
       rule here — this text lands in the same documents. */
    ['title', 'when', 'then', 'never'].forEach((k) => {
      if (r[k] && /[a-z]'[a-z]/i.test(r[k])) P(`${r.id}: straight apostrophe in "${k}" — use ’`);
    });

    if (r.state === 'ENFORCED') {
      const { file, test } = splitBy(String(r.by));
      const src = readFile(file);
      if (src === null) {
        P(`${r.id}: claims ENFORCED by "${file}", which does not exist`);
      } else if (test && !src.includes(test)) {
        P(`${r.id}: claims ENFORCED by a test named "${test}", not found in ${file}`);
      }
    }
  });

  /* every module must state at least one rule — six of them stated none, and
     that silence is exactly what this whole exercise is fixing */
  MODULES.forEach((m) => {
    if (!RULES.some((r) => r.mod === m.n)) P(`Module ${m.n} ${m.name}: no rules at all`);
  });

  return problems;
}

function summary() {
  const rows = MODULES.map((m) => {
    const mine = RULES.filter((r) => r.mod === m.n);
    return {
      n: m.n, name: m.name, total: mine.length,
      enforced: mine.filter((r) => r.state === 'ENFORCED').length,
    };
  });
  const w = Math.max(...rows.map((r) => r.name.length));
  console.log('  #  ' + 'Module'.padEnd(w) + '  rules  enforced  specified');
  rows.forEach((r) => {
    console.log('  ' + r.n + '  ' + r.name.padEnd(w) +
      String(r.total).padStart(7) + String(r.enforced).padStart(10) +
      String(r.total - r.enforced).padStart(11));
  });
  const t = rows.reduce((s, r) => s + r.total, 0);
  const e = rows.reduce((s, r) => s + r.enforced, 0);
  console.log('  ' + '  '.padEnd(w + 2) + String(t).padStart(7) + String(e).padStart(10) +
    String(t - e).padStart(11));
  console.log(`\n  ${e} of ${t} rules are enforced by a test that runs today (${Math.round((e / t) * 100)}%).`);
  console.log('  The rest are specified. That gap is the build queue, not a rounding error.');
  return { total: t, enforced: e };
}

if (require.main === module) {
  const problems = run();
  if (problems.length) {
    console.error(`checkrules: ${problems.length} problem(s)\n`);
    problems.forEach((p) => console.error('  ' + p));
    process.exit(1);
  }
  console.log(`checkrules: ${RULES.length} rules across ${MODULES.length} modules — all valid`);
  if (process.argv.includes('--summary')) { console.log(''); summary(); }
}

module.exports = { run, summary, splitBy };
