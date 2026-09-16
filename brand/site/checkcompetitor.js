'use strict';
/* NOTHING MEDHAVA SHIPS NAMES A COMPETITOR.
 *
 *   node brand/site/checkcompetitor.js
 *   node brand/site/checkcompetitor.js --summary
 *
 * WHY THIS EXISTS
 * The owner supplied competitor names as reference material, to explain what he wanted built.
 * They did that job. They do not belong in a product he publishes under his own domain: another
 * company's trademark in a shipped artifact implies an association that does not exist, and buys
 * nothing. He asked for them out, and this is the gate that keeps them out once they are.
 *
 * WHAT IS *NOT* ON THE LIST, AND WHY THAT MATTERS
 * Marketplaces, couriers, payment gateways and messaging providers are NOT competitors. They are
 * where the business sells, ships and gets paid. Stripping them would make the tenant's own
 * channel configuration factually wrong about the business it describes, and would delete the
 * product's ability to say what it connects to. The owner was asked and chose to keep them.
 * The two lists live side by side in private/competitors.json so the distinction is visible and
 * a name can be moved across without touching code.
 *
 * WHY THE LIST IS PRIVATE
 * The same knot checkneutral.js has: a gate that forbids a word must contain the word, and then
 * the gate is itself the thing it forbids. So the list is read from private/competitors.json,
 * which is gitignored. Absent — on a fresh clone, or inside an extracted archive — this reports
 * SKIPPED, not passed, and exits 0. A gate that cannot see anything must never report that it
 * saw nothing wrong.
 *
 * THE TWO RULES
 *   1 · no shipped file names a competitor
 *   2 · no shipped file claims a connector that does not exist. "designed to connect to X" is
 *       honest while nothing is built; "connects to X" is a claim, and built.js decides whether
 *       a claim is true. Keeping the integration names makes this rule necessary rather than
 *       optional — the names are allowed precisely because they describe intent, and intent
 *       stated as fact is the one lie these gates exist to stop.
 *
 * CASE MATTERS, AND IGNORING IT WOULD BREAK PROSE
 * "Tally" is an accounting package. "tally" is an English verb, and the repository uses it —
 * "the figures tally". Matching case-insensitively would flag correct sentences and force
 * somebody to reword them to satisfy a gate, which is how gates lose their authority. Names are
 * matched with their own capitalisation, on word boundaries.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..');
const LIST = path.join(ROOT, 'private', 'competitors.json');

const summary = process.argv.includes('--summary');
let failures = 0;
const fail = (m) => { failures++; console.error('checkcompetitor: ' + m); };

/* Inside an extracted archive there is no .git. mkcontents.js and checkprivacy.js both carry
   this scar; a gate that throws here takes `npm run test:product` down with it. */
function tracked() {
  try {
    return execSync('git ls-files -z',
      { cwd: ROOT, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString('utf8').split('\0').filter(Boolean);
  } catch { return null; }
}

/* ── what "shipped" means ──────────────────────────────────────────────────
   Only what a reader or an agent actually receives. Deliberately NOT every tracked file:
   this gate's own source has to contain nothing, CLAUDE.md records the project's history, and
   private/ is where the list lives. Scanning those would make the gate unpassable and teach
   people to disable it. */
const EXEMPT = [
  /^brand\/site\/checkcompetitor\.js$/,        // the gate cannot forbid what it must name
  /^private\//,                                 // the list itself, gitignored anyway
  /^CLAUDE\.md$/,                               // the working agreement records why this exists
  /^docs\/verification\/EVIDENCE\.md$/,         // an append-only log of what was run, incl. this

  /* A QUOTATION MAY NOT BE EDITED TO SATISFY A GATE.
     SPEC_CONFLICTS.md exists to show the owner contradictions in his own specification, quoting
     his words with the line number they came from — "L5228 | … + Shopify/Woo …". The first pass
     of this cleanup rewrote inside that quotation, which makes the document say he wrote
     something he did not. A document that silently edits the person it is quoting is a worse
     problem than a brand name on a page, and it is the kind of problem nobody catches later
     because the edit reads perfectly well.
     conflicts.js is its source register and is exempt for the same reason. */
  /^SPEC_CONFLICTS\.md$/,
  /^brand\/site\/conflicts\.js$/,
];

function shipped(files) {
  let starter;
  try { starter = require(path.join(ROOT, 'brand/delivery/website/mkstarter.js')); }
  catch { return null; }
  const inArchive = new Set([...starter.contents(false), ...starter.contents(true)]);
  return files.filter((f) => inArchive.has(f) && !EXEMPT.some((re) => re.test(f)));
}

/* ── run ───────────────────────────────────────────────────────────────────── */
const files = tracked();
if (files === null) {
  console.log('checkcompetitor: not a git checkout, so there is no file list to scan.');
  console.log('  SKIPPED, not passed — nothing here was verified.');
  process.exit(0);
}
if (!fs.existsSync(LIST)) {
  console.log('checkcompetitor: private/competitors.json is not in this checkout, so there is');
  console.log('  no list to check against. SKIPPED, not passed — nothing was verified.');
  console.log('  This is the normal state of a fresh clone; the list is gitignored on purpose.');
  process.exit(0);
}

const LISTED = JSON.parse(fs.readFileSync(LIST, 'utf8'));
const NAMES = LISTED.competitors || [];
const ALLOWED = LISTED.integrations_allowed || [];
const target = shipped(files);
if (target === null) {
  console.log('checkcompetitor: the archive builder could not be loaded, so "shipped" could');
  console.log('  not be resolved. SKIPPED, not passed.');
  process.exit(0);
}

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* CASE IS DECIDED PER NAME, NOT ONCE FOR ALL OF THEM.
 * Matching everything case-sensitively left a hole worth 57 occurrences: brand/site/zoho.js
 * cites its sources as `https://www.zoho.com/…`, all lowercase, and a gate looking for "Zoho"
 * walked straight past a register that is entirely about a competitor.
 * Matching everything case-INsensitively is the opposite error: "tally" is a verb this
 * repository uses correctly, "busy" is an adjective, "marg" is a street. Flagging those makes
 * somebody reword good English to satisfy a gate, and a gate that does that gets switched off.
 * So the ambiguous names are listed separately and only those are case-sensitive.
 */
const CASE_SENSITIVE = new Set(LISTED.case_sensitive || []);
const reFor = (n) => new RegExp('\\b' + esc(n) + '\\b', CASE_SENSITIVE.has(n) ? '' : 'i');

const hits = new Map();
for (const f of target) {
  let body;
  try { body = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch { continue; }
  const found = new Set();
  for (const n of NAMES) {
    if (reFor(n).test(body)) found.add(n);
  }
  if (found.size) hits.set(f, [...found]);
}

if (hits.size) {
  const list = [...hits.entries()].slice(0, 10)
    .map(([f, n]) => `    ${f}  —  ${n.join(', ')}`).join('\n');
  fail(`${hits.size} shipped file(s) name a competitor:\n${list}` +
    (hits.size > 10 ? `\n    …and ${hits.size - 10} more` : '') +
    '\n  Keep the claim, drop the name. "No accounting package is required, ever" says' +
    '\n  everything the brand list said and does not put somebody else\'s trademark on a page' +
    '\n  the owner publishes.');
}

/* ── RULE 2 · an integration name may describe intent, never a fact ─────────
   The allowed names are allowed because they say what this is FOR. The moment one appears as
   "connects to X" rather than "designed to connect to X", it is a claim about working software,
   and built.js is what decides whether such a claim is true. */
const CLAIMS = [];
for (const f of target) {
  if (!/\.(md|js|html)$/i.test(f)) continue;
  let body;
  try { body = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch { continue; }
  for (const n of ALLOWED) {
    const re = new RegExp('(?<!designed to )\\bconnects? (?:to|with) ' + esc(n) + '\\b', 'i');
    if (re.test(body)) CLAIMS.push(`${f} — claims a live connector to ${n}`);
  }
}
if (CLAIMS.length) {
  fail(`${CLAIMS.length} shipped file(s) state a connector as built:\n    ` +
    CLAIMS.slice(0, 6).join('\n    ') +
    '\n  Write "designed to connect to …" until the connector exists and built.js says so.');
}

if (failures) {
  console.error(`\ncheckcompetitor: ${failures} problem(s) across ${target.length} shipped file(s).`);
  process.exit(1);
}

console.log(`checkcompetitor: ${target.length} shipped files — none of the ${NAMES.length} ` +
  `competitor names appears in any of them; ${ALLOWED.length} integration names are allowed ` +
  'and none is stated as a built connector');

if (summary) {
  console.log('');
  console.log('  Denied — named only to compare against, so they buy the product nothing:');
  console.log('    ' + NAMES.join(' · '));
  console.log('');
  console.log('  Allowed — where the business sells, ships and gets paid. Not competitors:');
  console.log('    ' + ALLOWED.join(' · '));
  console.log('');
  console.log('  Both lists live in private/competitors.json, which is gitignored. Move a name');
  console.log('  between them to reclassify it — no code changes, and the list never ships.');
  console.log('');
  console.log('  Case is significant: "Tally" is a product, "tally" is a verb this repository');
  console.log('  uses correctly. A case-insensitive gate would flag good prose and get itself');
  console.log('  switched off.');
  console.log('');
}
