'use strict';
/* THE CAPABILITY BENCHMARK, CHECKED.
 *
 *   node brand/site/checkzoho.js
 *   node brand/site/checkzoho.js --summary
 *
 * WHAT THIS GATE IS FOR
 * A comparison table is the easiest document in this repository to fake. Nothing about a
 * row saying "COVERED — CRM & Customer 360" tells a reader whether that app exists, whether
 * anybody read the page it is being compared against, or whether the verdict was chosen to
 * make the column look full. All three are checkable, and all three are checked here.
 *
 *   1 · the register's own shape                       zoho.js check()
 *   2 · every app named is a real app in modules.js    — a typo silently covers nothing
 *   3 · the sourcing rule                              a row may not say what a page claims
 *                                                        unless it records the day somebody
 *                                                        read it
 *   4 · the count matches the list the owner gave      56 pages in, 56 rows out
 *   5 · a COVERED row's apps carry their real rung     read from registry.js, so "covered"
 *                                                        can never quietly mean "running"
 *
 * RULE 3 IS THE LOAD-BEARING ONE. This environment's proxy refuses every host outside a
 * short allowlist, so not one of those pages was read — measured, not assumed. Every row is
 * therefore coverage against our own register plus recollection of the other product, and
 * this gate makes it impossible to present the second half as though it were the first.
 */

const path = require('node:path');

const ZOHO = require('./zoho.js');
const MODULES = require('./modules.js');
const REGISTRY = require('./registry.js');

const summary = process.argv.includes('--summary');
let failures = 0;
const fail = (m) => { failures++; console.error('checkzoho: ' + m); };

/* The owner pasted this many product pages. If the register grows or shrinks against it,
   somebody has added a comparison he did not ask for or dropped one he did. */
const ASKED_FOR = 56;

/* ── 1 · the register's own shape ─────────────────────────────────────────── */
ZOHO.check().forEach((b) => fail(`zoho.js — ${b}`));

/* ── 2 · every app named is real ──────────────────────────────────────────── */
const appNames = new Set();
MODULES.forEach((m) => m.apps.forEach((a) => appNames.add(a[0])));

ZOHO.ROWS.forEach((r) => {
  (r.apps || []).forEach((a) => {
    if (!appNames.has(a)) {
      fail(`"${r.name}" is called COVERED by "${a}", which is not an app in modules.js. ` +
        `It covers nothing, and the column looks full anyway — which is the exact way a ` +
        `comparison table lies without anybody typing a false sentence.`);
    }
  });
});

/* ── 3 · the sourcing rule, stated in the output and not only in the code ─── */
const unfetched = ZOHO.unfetched();
ZOHO.ROWS.forEach((r) => {
  if (r.claims && !r.fetched_on) {
    fail(`"${r.name}" states what its page claims with no date anybody read it.`);
  }
});

/* ── 4 · the list is the owner's list ─────────────────────────────────────── */
if (ZOHO.ROWS.length !== ASKED_FOR) {
  fail(`${ZOHO.ROWS.length} rows against the ${ASKED_FOR} pages the owner supplied. ` +
    `A benchmark that quietly drops a comparison is worse than one that admits it.`);
}

/* ── 5 · what "COVERED" is actually covered BY ─────────────────────────────── */
/* An app being named is the weakest true statement available, and this makes sure the
   document has to carry the rung beside it rather than leaving a reader to assume. */
const rows = REGISTRY.rows(MODULES);
const rungOf = (name) => {
  const r = rows.find((x) => x.kind === 'app' && x.name === name);
  return r ? r.status : null;
};
const covered = ZOHO.ROWS.filter((r) => r.verdict === 'COVERED');
const runningSomewhere = covered.filter((r) =>
  (r.apps || []).some((a) => ['IMPLEMENTED', 'TESTED'].includes(rungOf(a))));

/* ── 5b · THE PROSE MAY NOT OUTRUN THE RUNG ────────────────────────────────────
 * A reason is free text and nothing checked it against the rung beside it, which let one
 * row say "the ledger behind two of them runs on the real database" about four apps that
 * are all SPECIFIED. The rung column said SPECIFIED in the same table row and the two
 * simply disagreed — and a reader trusts the sentence, not the column.
 *
 * A general check on free text is not possible. A check on the specific phrases that make
 * a running claim is, and those phrases are the ones worth policing: they are what a
 * reader takes as "this part is real". */
/* THE PATTERNS ARE PHRASES, NOT WORDS, and that distinction was learned here. A bare
   \bruns\b was tried first and immediately failed a correct row — "a business whose floor
   runs in shifts" is the everyday sense of the word, and nothing about it claims a build
   state. It is the same collision the delivery manifest's EVERYDAY register handles for
   the glossary: a word that is a technical term in one sentence is ordinary English in the
   next. So each pattern below names a phrase that can only be a build-state claim. */
const RUNNING_PHRASES = [
  /runs? on the real database/i,
  /\bworking today\b/i,
  /\bruns\s+today\b/i,
  /\balready (runs|works)\b/i,
  /passes? (its|their) own self-tests?/i,
  /browser (app|prototype)/i,
];
ZOHO.ROWS.forEach((r) => {
  const phrase = RUNNING_PHRASES.find((re) => re.test(r.why));
  if (!phrase) return;
  const best = (r.apps || []).map(rungOf);
  if (!best.some((s) => ['IMPLEMENTED', 'TESTED'].includes(s))) {
    fail(`"${r.name}" says something runs — "${r.why.match(phrase)[0]}" — and not one of ` +
      `the app(s) it names is above SPECIFIED (${best.join(', ') || 'none named'}). The ` +
      `rung column and the sentence beside it are telling a reader two different things, ` +
      `and the reader believes the sentence.`);
  }
});

/* ── result ───────────────────────────────────────────────────────────────── */
const t = ZOHO.tally();
if (failures) {
  console.error(`\ncheckzoho: ${failures} problem(s) across ${ZOHO.ROWS.length} row(s).`);
  process.exit(1);
}
console.log(`checkzoho: ${ZOHO.ROWS.length} rows valid — every app named is real, every ` +
  `verdict carries a reason, and no row claims what a page says without the day it was ` +
  `read (${unfetched.length} of ${ZOHO.ROWS.length} unread)`);

if (summary) {
  console.log('');
  Object.entries(t).forEach(([v, n]) => {
    console.log(`  ${v.padEnd(13)} ${String(n).padStart(2)}  ${'█'.repeat(n)}`);
  });
  console.log('');
  console.log(`  Of ${covered.length} COVERED, ${runningSomewhere.length} have at least one`);
  console.log('  app that is implemented or tested. The rest are covered on paper only —');
  console.log('  named in the module register and not standing up.');
  console.log('');
  console.log('  NO APP — the finding that survives the unread pages intact, because it is');
  console.log('  answered entirely by our own register:');
  ZOHO.ROWS.filter((r) => r.verdict === 'NO APP')
    .forEach((r) => console.log(`    ${r.name}`));
  console.log('');
  console.log('  OUT OF SCOPE, each with its reason in the register:');
  ZOHO.ROWS.filter((r) => r.verdict === 'OUT OF SCOPE')
    .forEach((r) => console.log(`    ${r.name}`));
  console.log('');
  console.log(`  NOT ONE of the ${ZOHO.ROWS.length} pages was read. This environment's egress`);
  console.log('  proxy refuses every host outside a short allowlist — zoho.com, bigin.com and');
  console.log('  wikipedia.org all return a 403 at the CONNECT, while api.github.com and');
  console.log('  registry.npmjs.org return 200. So every statement about what the other');
  console.log('  product does is recollection, and the register refuses to dress it as more.');
  console.log('  What IS measured here is our own coverage, and that half is exact.\n');
}
