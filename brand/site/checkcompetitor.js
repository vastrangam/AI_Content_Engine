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
 * THE THREE RULES
 *   1 · no tracked file names a competitor
 *   2 · no tracked file claims a connector that does not exist. "designed to connect to X" is
 *       honest while nothing is built; "connects to X" is a claim, and built.js decides whether
 *       a claim is true. Keeping the integration names makes this rule necessary rather than
 *       optional — the names are allowed precisely because they describe intent, and intent
 *       stated as fact is the one lie these gates exist to stop.
 *   3 · every allowance in the private list is used by something, and says why it exists.
 *       An allowance nothing matches is a pre-authorised blind spot for the next name
 *       dropped into it, so it has to go the moment the code that needed it does.
 *
 * A WIRE FORMAT IS NOT A BRAND MENTION, AND THE DIFFERENCE IS NARROW ON PURPOSE
 * The tenant's content engine writes a storefront's 61-column product-import sheet. Thirteen
 * of those column headers contain that platform's own metafield namespace, and one field
 * takes its name as an enumerated VALUE. They are addresses, not descriptions: change them
 * and the exporter produces a file the platform rejects, so the trade is an unusable feature
 * against a word inside a string literal. Those exact strings are listed in
 * private/competitors.json with what breaks without each one, and they are removed from a
 * file's text BEFORE the names are searched for. Nothing else is. The same file still fails
 * on any other appearance, which is the property that stops this becoming a file exemption
 * wearing a format's clothes.
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
   EVERY TRACKED FILE, not only the ones inside an archive.

   It began as "what is in MEDHAVA_BOS.zip or VASTRANGAM_TENANT.zip", on the reasoning that
   what matters is what a reader receives. That reasoning was wrong, and the measurement
   showed it: 158 tracked files under brand/suite/deep/pkg/ are in neither archive, carried a
   competitor name each, and sat in a public repository the whole time. The owner's words were
   "do not put this reference in public domain" — a tracked file in a public repository IS the
   public domain, archive or no archive.

   So the scope is `git ls-files` minus the list below, and every entry on that list names a
   reason. A file is exempt because the gate cannot forbid what it must itself contain, or
   because it is somebody's words quoted rather than this project's prose — never because
   cleaning it was inconvenient. */
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

  /* THE OWNER'S OWN SPECIFICATION, PASTED, AND NOT THIS PROJECT'S PROSE.
     Vastrangam_AI_Content_Engine.md is the document he wrote describing the engine he wanted
     — his section headings, his column numbers, his words for the storefront he sells on. It
     is quoted, not authored here, and the same rule that protects SPEC_CONFLICTS.md protects
     it: a specification silently reworded is a specification nobody can hold anyone to.
     It ships in the TENANT archive, which is his own business's copy, not the product. */
  /^Vastrangam_AI_Content_Engine\.md$/,
];

function shipped(files) {
  return files.filter((f) => !EXEMPT.some((re) => re.test(f)));
}

/* Reported alongside the total, because "582 files" and "753 files" are very different
   assurances and a reader deserves to know which one this is. */
function inArchive(files) {
  try {
    const s = require(path.join(ROOT, 'brand/delivery/website/mkstarter.js'));
    const set = new Set([...s.contents(false), ...s.contents(true)]);
    return files.filter((f) => set.has(f)).length;
  } catch { return null; }
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
const archived = inArchive(files);

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

/* THE LITERALS ARE REMOVED, NOT THE FILE. See the header. A literal is only honoured when it
   carries a reason, because an unexplained exception is how a gate quietly stops gating. */
const LITERALS = (LISTED.format_literals || []).filter((x) => x && x.literal && x.why);
const unreasoned = (LISTED.format_literals || []).length - LITERALS.length;
if (unreasoned) {
  fail(`${unreasoned} entr(y/ies) in format_literals carry no "why". A format literal is an ` +
    'exception to the rule this gate exists for, and one without a stated reason is ' +
    'indistinguishable from somebody widening the hole to get a build green.');
}
const strip = (body) => LITERALS.reduce(
  (t, x) => t.split(x.literal).join(' '), body);
const literalUse = new Map();

const hits = new Map();
for (const f of target) {
  let raw;
  try { raw = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch { continue; }
  LITERALS.forEach((x) => {
    const n = raw.split(x.literal).length - 1;
    if (n) literalUse.set(x.literal, (literalUse.get(x.literal) || 0) + n);
  });
  const body = strip(raw);
  const found = new Set();
  for (const n of NAMES) {
    if (reFor(n).test(body)) found.add(n);
  }
  if (found.size) hits.set(f, [...found]);
}

if (hits.size) {
  const list = [...hits.entries()].slice(0, 10)
    .map(([f, n]) => `    ${f}  —  ${n.join(', ')}`).join('\n');
  fail(`${hits.size} tracked file(s) name a competitor:\n${list}` +
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
  try { body = strip(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch { continue; }
  for (const n of ALLOWED) {
    const re = new RegExp('(?<!designed to )\\bconnects? (?:to|with) ' + esc(n) + '\\b', 'i');
    if (re.test(body)) CLAIMS.push(`${f} — claims a live connector to ${n}`);
  }
}
if (CLAIMS.length) {
  fail(`${CLAIMS.length} tracked file(s) state a connector as built:\n    ` +
    CLAIMS.slice(0, 6).join('\n    ') +
    '\n  Write "designed to connect to …" until the connector exists and built.js says so.');
}

/* ── RULE 3 · a format literal that nothing uses is not an exception, it is a hole ──
   An allowance only earns its place while something needs it. One that matches nothing is a
   pre-authorised blind spot waiting for a name to be dropped into it, so it has to go the
   moment the code that needed it does. */
const dead = LITERALS.filter((x) => !literalUse.has(x.literal));
if (dead.length) {
  fail(`${dead.length} format literal(s) match nothing in any tracked file:\n    ` +
    dead.map((x) => `"${x.literal}"  (was for ${x.used_by || 'an unnamed file'})`).join('\n    ') +
    '\n  Delete them from private/competitors.json. An allowance nothing uses is not an' +
    '\n  exception — it is a pre-authorised blind spot for the next name dropped into it.');
}

if (failures) {
  console.error(`\ncheckcompetitor: ${failures} problem(s) across ${target.length} tracked file(s).`);
  process.exit(1);
}

console.log(`checkcompetitor: ${target.length} tracked files — none of the ${NAMES.length} ` +
  `competitor names appears in any of them; ${ALLOWED.length} integration names are allowed ` +
  'and none is stated as a built connector');
console.log(`  ${files.length} tracked · ${files.length - target.length} exempt, each with a ` +
  `stated reason · ` + (archived === null
    ? 'the archive builder could not be loaded, so the shipped subset is not reported'
    : `${archived} of them also ship inside an archive`));

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
  console.log(`  ${LITERALS.length} format literal(s) are removed before the search, each one a`);
  console.log('  third party\'s own wire format rather than a mention of it. Every other');
  console.log('  appearance in the same file still fails:');
  LITERALS.forEach((x) => {
    console.log(`    ${literalUse.get(x.literal) || 0}×  ${x.literal}`);
    console.log(`        ${x.used_by || '—'} · ${x.why.slice(0, 96)}…`);
  });
  console.log('');
}
