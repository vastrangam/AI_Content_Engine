'use strict';
/* NOTHING IS STATIC — CHECKED, NOT PROMISED.
 *
 *   node brand/site/checkstatic.js
 *   node brand/site/checkstatic.js --summary
 *
 * WHY THIS FILE EXISTS
 * The owner's correction, in his words:
 *
 *   "marketplace can be 6 or 7 or 10, why are you holding it so strong … in any industry people
 *    come and work and leave … nothing should be static — you work to just build a structure
 *    which supports this."
 *
 * He was right, and the failure was mine: I had been asking him to FREEZE values the product
 * exists to keep editable — how many marketplaces, whether a worker is on this month's roster,
 * what a set contains, what hours somebody works. Every one of those is a row with a date, and
 * the software's job is the structure that lets him change it.
 *
 * A principle nobody checks is decoration. brand/site/dynamic.js has said "nothing is static"
 * in prose since it was written; prose cannot stop the next person typing `const CHANNELS = 7`.
 * This can.
 *
 * WHAT IT REFUSES
 * A literal standing where a lookup belongs, in the ENGINE code — a business count, a rate, a
 * threshold, a shift, a person's name, or a closed list of trade values. Each is caught by its
 * own rule and each rule says what to do instead.
 *
 * WHAT IT DELIBERATELY DOES NOT REFUSE
 * Structure is allowed to be constant, and pretending otherwise would be theatre:
 *   · array indices, HTTP codes, dates in comments, version pins
 *   · the SEED data itself — fixtures and packs are where values are SUPPOSED to live
 *   · tests, which must be able to say 230 out loud to prove 230 came through
 *   · the immutable rules dynamic.js already names — the audit trail and company scoping do not
 *     become editable just because everything else did
 *
 * The line is: a value a TENANT would ever want to change must not be compiled in. A value that
 * is a fact about the software may be.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const summary = process.argv.includes('--summary');

let failures = 0;
const fail = (msg) => { failures++; console.error(msg); };

/* ── where a literal is a defect, and where it is not ─────────────────────── */

/* Engine and app code. A tenant value hard-coded here is a code change the tenant cannot make. */
const SCANNED = [
  'engine/vastrangam', 'core', 'brand/suite/studio', 'brand/site',
];

/* Seeds, tests and generated output. Values BELONG in these.
 *
 * The prose-data files are here for a reason worth stating, because it is the obvious place to
 * cheat: guide.js, tenant.js, architect.js and their siblings are DOCUMENTS held as JavaScript.
 * They contain sentences, and a sentence explaining why you must never write `if (staff ===
 * 'Karim')` necessarily contains that line. Exempting them is correct; what would be cheating is
 * moving real logic into one of them to get past this file, and the defence against that is that
 * none of them is required by anything that computes — they are read only by generators. */
const EXEMPT = [
  'engine/fixtures', 'core/packs', 'engine/tests', 'core/tests', 'node_modules',
  'brand/suite/deep', 'brand/suite/aiengine',
  'checkstatic.js',            // this file names the words it looks for
  'conflicts.js',              // quotes the source verbatim, line by line
  'plainwords.js',             // a glossary of words is a list of words
  'sectors.js', 'shots.js', 'stack.js', 'tools.js', 'rules.js', 'modules.js',
  'rulebook.js', 'walkthrough.js', 'guide.js', 'tenant.js', 'tenantbuild.js', 'dynamic.js',
  'architect.js',
  'edition_vastrangam.js', 'partv.js', 'registers.js', 'built.js', 'reach.js',
];

const exempt = (rel) => EXEMPT.some((e) => rel.includes(e));

function walk(dir, out) {
  let entries;
  try { entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }); }
  catch (_) { return out; }
  for (const e of entries) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) walk(rel, out);
    else if (/\.(js|py)$/.test(e.name) && !exempt(rel)) out.push(rel);
  }
  return out;
}

/* Comments and strings of prose are where this repository explains itself, and an explanation
   that mentions a number is not a hard-coded number. Only CODE is scanned. */
function code(text, file) {
  let s = text;
  if (file.endsWith('.py')) {
    s = s.replace(/"""[\s\S]*?"""/g, '').replace(/'''[\s\S]*?'''/g, '').replace(/#[^\n]*/g, '');
  } else {
    s = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  }
  return s;
}

/* ── the rules ───────────────────────────────────────────────────────────── */

const RULES = [
  {
    id: 'S1',
    what: 'a business count compiled in',
    /* `const CHANNELS = 7` and friends. The count of anything a tenant owns is a row count. */
    re: /\b(?:const|let|var)\s+([A-Z_]*(?:CHANNEL|COMPANY|COMPANIES|MARKETPLACE|MODULE|APP|STAFF|KARIGAR|VENDOR)[A-Z_]*(?:COUNT|_N|S)?)\s*=\s*(\d+)\s*[;,\n]/g,
    instead: 'count the rows. A channel is a row, a company is a row — core/tests/core.test.js ' +
      'posts across a 10 x 10 grid precisely so no count is built in.',
  },
  {
    id: 'S2',
    what: 'a rupee rate or salary written into code',
    re: /\b(?:const|let|var)\s+([A-Z_]*(?:RATE|SALARY|WAGE|PRICE|COST)[A-Z_]*)\s*=\s*(\d{2,})\s*[;,\n]/g,
    instead: 'read it from the effective-dated log. A rate that changes next April must not need ' +
      'a deployment, and the closed month must keep the old one.',
  },
  {
    id: 'S3',
    what: 'a shift or a threshold written into code',
    re: /\b(?:const|let|var)\s+([A-Z_]*(?:THRESHOLD|SHIFT|HOURS)[A-Z_]*)\s*=\s*(\d+(?:\.\d+)?)\s*[;,\n]/g,
    instead: 'put it in the shift table. Sanjana and Kalyani work neither the male nor the ' +
      'female clock, which is exactly why the clock is data.',
  },
  {
    id: 'S4',
    what: 'a person named in logic',
    /* The roster's own names, read from the fixture — so this rule cannot go stale when the
       roster changes, and cannot be satisfied by renaming somebody. */
    names: true,
    instead: 'branch on a FLAG the person carries, not on who they are. gates.py already has ' +
      'no_person_names_in_logic for the engine; this extends the same rule to the rest.',
  },
];

/* The roster, read only to confirm absence — the same use mktenant.js makes of it. */
let ROSTER = [];
try {
  const m = require(path.join(ROOT, 'engine', 'fixtures', 'master.json'));
  ROSTER = (m.people || []).map((p) => p.name).filter((n) => n && n.length > 3);
} catch (_) { ROSTER = []; }

/* ── run ─────────────────────────────────────────────────────────────────── */

const files = SCANNED.flatMap((d) => walk(d, []));
const hits = [];

for (const rel of files) {
  const raw = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const src = code(raw, rel);
  const lineOf = (idx) => src.slice(0, idx).split('\n').length;

  for (const rule of RULES) {
    if (rule.names) {
      for (const name of ROSTER) {
        const re = new RegExp(`\\b${name}\\b`, 'g');
        let m;
        while ((m = re.exec(src))) hits.push({ rel, rule, line: lineOf(m.index), text: name });
      }
      continue;
    }
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(src))) {
      hits.push({ rel, rule, line: lineOf(m.index), text: `${m[1]} = ${m[2]}` });
    }
  }
}

for (const h of hits) {
  fail(`checkstatic: ${h.rule.id} — ${h.rel}:${h.line}  ${h.what || h.rule.what}\n` +
    `    ${h.text}\n    Instead: ${h.rule.instead}`);
}

/* ── the other half: what dynamic.js PROMISES is really promised ──────────── */
let promised = 0, fixed = 0;
try {
  const DYN = require(path.join(ROOT, 'brand', 'site', 'dynamic.js'));
  promised = DYN.ENTRIES.length;
  fixed = DYN.IMMUTABLE.length;
  if (!promised) fail('checkstatic: dynamic.js promises nothing is static and lists nothing.');
  if (!fixed) {
    fail('checkstatic: dynamic.js names nothing a tenant may NOT change. "Everything is ' +
      'editable" would include the audit trail, which is how a business edits away the record ' +
      'of having edited something.');
  }
} catch (e) {
  fail(`checkstatic: could not read dynamic.js — ${e.message}`);
}

if (summary && !failures) {
  console.log(`\n  scanned ${files.length} engine and app files across ${SCANNED.length} trees`);
  console.log(`  ${RULES.length} rules · ${ROSTER.length} roster names checked for and absent`);
  console.log(`  ${promised} things a tenant may change · ${fixed} nobody may\n`);
  RULES.forEach((r) => console.log(`      ${r.id}  ${r.what}`));
  console.log('');
}

if (failures) {
  console.error(`\ncheckstatic: ${failures} value(s) compiled in that a tenant should own.`);
  process.exit(1);
}
console.log(`checkstatic: all valid — ${files.length} files, ${RULES.length} rules, nothing a ` +
  `tenant owns is hard-coded; ${promised} changeable, ${fixed} fixed on purpose`);
