'use strict';
/* THE MASTER-SPEC COVERAGE REGISTER, CHECKED.
 *
 *   node brand/site/checkmasterspec.js
 *   node brand/site/checkmasterspec.js --summary
 *
 * WHAT THIS GUARDS AGAINST
 * A coverage sheet is a scorecard somebody writes about their own work, and there are three
 * comfortable ways to make one look better than the thing it measures:
 *
 *   drop the awkward rows       — so the total is counted from the list, never typed
 *   claim a rung nobody granted — so every verdict is RESOLVED from the requirements
 *                                 registry and a row storing its own answer is refused
 *   call a gap impossible       — so "not possible" must name what makes it so, and the
 *                                 reason has to be long enough to argue with
 *
 * THE RULES
 *   1 · every mapped app id is a real app in the requirements registry
 *   2 · no row stores its own answer — the verdict is derived, never read off the row
 *   3 · exactly one of covered / uncovered / not-possible is true for every row
 *   4 · a not-possible row names what makes it impossible
 *   5 · a section's source key resolves to a real url in benchmark.js
 *   6 · every stated count equals the length of the list it counts
 *   7 · section ids are unique and no block repeats an item
 *
 * WHAT IT CANNOT CHECK, SAID PLAINLY
 * The mapping is a judgement. This proves "Lead scoring" points at an app that exists and
 * resolves that app's rung honestly; it cannot prove CRM & Customer 360 is the right app to
 * have pointed it at. Every row prints the app it was mapped to for exactly that reason —
 * so a reader can disagree with any single one of 945 calls.
 */

const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const SPEC = require('./masterspec.js');
const REGISTRY = require('./registry.js');
const MODULES = require('./modules.js');

const summary = process.argv.includes('--summary');
let failures = 0;
const fail = (m) => { failures++; console.error('checkmasterspec: ' + m); };

const ROWS = REGISTRY.rows(MODULES);
const APPS = new Map(ROWS.filter((r) => r.kind === 'app').map((r) => [r.id, r]));

/* Above SPECIFIED is the line between a design and software. Everything in this file turns
   on it, and it is the same ladder the requirements registry uses. */
const STANDS_UP = new Set(['IMPLEMENTED', 'TESTED', 'VERIFIED', 'PRODUCTION-READY']);

/* ── RULE 2 · the verdict is derived, here, and nowhere else ────────────────
   Precedence matters and is deliberate: NOT POSSIBLE beats COVERED. An item that maps to a
   real app but still needs somebody's credentials — e-signature, e-invoicing, a courier's
   tracking number — is not covered by having an app named for it, because no amount of
   building finishes it. Ranking it as covered would be the most flattering reading and the
   least true one. */
function verdictOf(item) {
  const [, maps, impossible] = item;
  if (impossible) return 'NOT POSSIBLE';
  const ids = maps == null ? [] : (Array.isArray(maps) ? maps : [maps]);
  const best = ids.map((id) => (APPS.get(id) || {}).status).filter(Boolean);
  if (best.some((s) => STANDS_UP.has(s))) return 'COVERED';
  return 'UNCOVERED';
}

/* What the Medhava column shows — resolved, never stored. */
function medhavaOf(item) {
  const ids = item[1] == null ? [] : (Array.isArray(item[1]) ? item[1] : [item[1]]);
  const found = ids.map((id) => APPS.get(id)).filter(Boolean);
  if (!found.length) return { state: 'ABSENT', text: '—', rung: null };
  const top = found.reduce((a, b) =>
    (STANDS_UP.has(b.status) && !STANDS_UP.has(a.status) ? b : a));
  return {
    state: STANDS_UP.has(top.status) ? 'BUILT' : 'DESIGNED ONLY',
    text: found.map((r) => `${r.module_name} · ${r.name}`).join(' + '),
    rung: top.status,
  };
}

/* ── RUN WHEN INVOKED, EXPORT WHEN REQUIRED ────────────────────────────────
   mkmasterspec.js needs verdictOf() and medhavaOf() so there is ONE definition of what
   "covered" means rather than two that drift. Without this guard, requiring the file ran
   the whole gate — it printed its own summary in the middle of the generator's output,
   and on a failure it would have called process.exit and killed the generator with it. */
function runChecks() {
const seenSection = new Set();
const tally = { COVERED: 0, UNCOVERED: 0, 'NOT POSSIBLE': 0 };
const stateTally = { BUILT: 0, 'DESIGNED ONLY': 0, ABSENT: 0 };
const perSection = [];
let items = 0;

SPEC.SECTIONS.forEach((s, si) => {
  const at = s.id || `section ${si + 1}`;

  /* ── 7 · ids unique, and the numbering is the owner's own ─────────────── */
  if (!s.id) fail(`section ${si + 1} has no id`);
  if (seenSection.has(s.id)) fail(`${at} is defined twice`);
  seenSection.add(s.id);
  if (s.n !== si + 1) {
    fail(`${at} is numbered ${s.n} and sits at position ${si + 1}. These are the owner's own ` +
      `31 sections in his order; re-ordering them is a second opinion nobody asked for.`);
  }
  /* Two characters is a real section title — his section 13 is called "HR". A minimum of
     three rejected it, which is a gate failing correct data rather than catching bad data. */
  if (!s.title || s.title.length < 2) fail(`${at} has no title`);
  if (!Array.isArray(s.blocks) || !s.blocks.length) {
    fail(`${at} has no blocks, so a section of his prompt is named and then carries nothing`);
  }

  /* ── 5 · a section's source key resolves ──────────────────────────────── */
  if (s.src && !SPEC.SOURCES[s.src]) {
    fail(`${at} cites source key "${s.src}", which is not in benchmark.js SOURCES — so the ` +
      `competitor column would print an address that does not exist`);
  }

  let secItems = 0;
  const secTally = { COVERED: 0, UNCOVERED: 0, 'NOT POSSIBLE': 0 };

  (s.blocks || []).forEach((b, bi) => {
    const where = `${at} block ${bi + 1}`;
    if (!b.title) fail(`${where} has no title`);
    if (!Array.isArray(b.items) || !b.items.length) fail(`${where} lists nothing`);

    const seenItem = new Set();
    (b.items || []).forEach((item, ii) => {
      const label = `${where} item ${ii + 1}`;
      if (!Array.isArray(item)) { fail(`${label} is not an item`); return; }
      const [text, maps, impossible] = item;

      if (!text || typeof text !== 'string' || text.length < 2) {
        fail(`${label} has no text`);
        return;
      }
      /* An item repeated inside one block is a typo; the same word in two different blocks
         is the owner's own prompt and is kept. */
      if (seenItem.has(text)) {
        fail(`${where} lists "${text}" twice. Within one block that is a duplicate, not the ` +
          `owner repeating himself across sections.`);
      }
      seenItem.add(text);

      /* ── 1 · every mapped id is real ──────────────────────────────── */
      const ids = maps == null ? [] : (Array.isArray(maps) ? maps : [maps]);
      ids.forEach((id) => {
        if (!APPS.has(id)) {
          fail(`${label} "${text}" maps to ${id}, which is not an app in the requirements ` +
            `registry. The row would resolve to nothing and silently read as uncovered.`);
        }
      });

      /* ── 2 · no stored answer ─────────────────────────────────────── */
      if (item.length > 3) {
        fail(`${label} "${text}" carries a fourth field. An item is [text, maps, impossible] ` +
          `and the verdict is derived from the registry — anything else stored here would ` +
          `be an answer nobody re-checks.`);
      }

      /* ── 4 · not-possible names why ───────────────────────────────── */
      if (impossible !== undefined && impossible !== null) {
        if (typeof impossible !== 'string' || impossible.length < 25) {
          fail(`${label} "${text}" is marked impossible with no reason worth reading. ` +
            `"Impossible" is the one verdict that excuses a gap permanently, so it has to ` +
            `name what makes it so.`);
        }
      }

      /* ── 3 · exactly one verdict ──────────────────────────────────── */
      const v = verdictOf(item);
      if (!(v in tally)) {
        fail(`${label} "${text}" resolves to "${v}", which is not one of the three verdicts`);
        return;
      }
      tally[v]++;
      secTally[v]++;
      stateTally[medhavaOf(item).state]++;
      items++;
      secItems++;
    });
  });

  perSection.push({ id: s.id, n: s.n, title: s.title, items: secItems, ...secTally,
    src: s.src || null });
});

/* ── 8 · every impossible line says what KIND of thing it needs ────────────
   The constraints document groups the impossible lines by NEEDS. A line matching none would
   vanish from that document while still being counted among the 85 — present in the total,
   absent from the page somebody acts on, which is the worst of both. And a category matching
   nothing is a heading with no rows, which reads as a gap that does not exist. */
{
  const hit = new Map(SPEC.NEEDS.map((n) => [n.id, 0]));
  const orphan = [];
  SPEC.SECTIONS.forEach((s) => s.blocks.forEach((b) => b.items.forEach((item) => {
    if (verdictOf(item) !== 'NOT POSSIBLE') return;
    const n = SPEC.NEEDS.find((x) => x.match.test(item[2]));
    if (!n) orphan.push(`${s.id} ${item[0]}`);
    else hit.set(n.id, hit.get(n.id) + 1);
  })));
  if (orphan.length) {
    fail(`${orphan.length} impossible line(s) match no NEEDS category, so they would be ` +
      `counted in the total and missing from the constraints document: ` +
      orphan.slice(0, 6).join(' · '));
  }
  [...hit.entries()].filter(([, n]) => n === 0).forEach(([id]) => {
    fail(`NEEDS category ${id} matches no line. An empty category is a heading describing a ` +
      `constraint nobody actually has.`);
  });
}

/* ── 6 · every stated count equals its list ────────────────────────────────
   Counted from the structure, not typed anywhere. This assertion exists so that if anybody
   later adds a summary line with a number in it, the number has one place to come from. */
const countedItems = SPEC.SECTIONS.reduce((n, s) =>
  n + s.blocks.reduce((m, b) => m + b.items.length, 0), 0);
if (countedItems !== items) {
  fail(`the register holds ${countedItems} items and ${items} were resolved. ` +
    `${countedItems - items} row(s) were skipped by the loop above, which means the totals ` +
    `below describe a smaller list than the one in the file.`);
}
const verdictTotal = tally.COVERED + tally.UNCOVERED + tally['NOT POSSIBLE'];
if (verdictTotal !== items) {
  fail(`${items} items produced ${verdictTotal} verdicts. Every row gets exactly one.`);
}

/* ── result ────────────────────────────────────────────────────────────────── */
if (failures) {
  console.error(`\ncheckmasterspec: ${failures} problem(s) across ${items} item(s).`);
  process.exit(1);
}

const pc = (n) => `${Math.round((n / items) * 100)}%`;
console.log(`checkmasterspec: ${SPEC.SECTIONS.length} sections · ${items} line items — ` +
  `${tally.COVERED} covered (${pc(tally.COVERED)}), ${tally.UNCOVERED} uncovered ` +
  `(${pc(tally.UNCOVERED)}), ${tally['NOT POSSIBLE']} not possible from here ` +
  `(${pc(tally['NOT POSSIBLE'])}); every mapped app id real, every verdict resolved from the ` +
  `requirements registry rather than stored`);

if (summary) {
  console.log('');
  console.log('  Where Medhava stands on each line, resolved:');
  console.log(`    ${String(stateTally.BUILT).padStart(4)}  an app that stands above SPECIFIED`);
  console.log(`    ${String(stateTally['DESIGNED ONLY']).padStart(4)}  an app that is SPECIFIED — written down, not built`);
  console.log(`    ${String(stateTally.ABSENT).padStart(4)}  nothing in the register maps to it at all`);
  console.log('');
  console.log('  Section                                    items  cov  unc  imp  sourced');
  perSection.forEach((s) => {
    console.log(`  ${String(s.n).padStart(2)} ${s.title.slice(0, 38).padEnd(38)} ` +
      `${String(s.items).padStart(5)} ${String(s.COVERED).padStart(4)} ` +
      `${String(s.UNCOVERED).padStart(4)} ${String(s['NOT POSSIBLE']).padStart(4)}  ` +
      (s.src ? 'yes' : 'NOT MEASURED'));
  });
  console.log('');
  const nosrc = perSection.filter((s) => !s.src);
  console.log(`  ${nosrc.length} of ${perSection.length} sections have no sourced competitor`);
  console.log('  claim, so their comparison columns read NOT MEASURED all the way down.');
  console.log('');
}

}

if (require.main === module) runChecks();

module.exports = { verdictOf, medhavaOf, STANDS_UP, runChecks };
