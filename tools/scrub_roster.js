'use strict';
/* REPLACE THE REAL ROSTER WITH A SYNTHETIC ONE OF THE SAME SHAPE.
 *
 *   node tools/scrub_roster.js            → write the synthetic fixture and the name map
 *   node tools/scrub_roster.js --check    → prove the committed fixture names nobody real
 *
 * WHY THIS EXISTS
 * engine/fixtures/master.json was a small HR database of 22 real people — name, gender,
 * religion, joining and leaving dates — joined by `key` to 21 salary records and 2 cash
 * advances, sitting in a PUBLIC repository. No Aadhaar, PAN, IFSC or bank number was in it;
 * that was checked and it was clean. But a named person's salary is that person's private
 * information whether or not a bank account sits beside it, and the owner's own rule is that
 * financial data stays private.
 *
 * WHAT MADE THIS TRACTABLE, AND WHAT DID NOT
 * Only the `people` array carries human-readable fields. Every other table — employment,
 * pay_basis, salary, threshold_days, threshold_hours, weekly_off, leave, trial_pay,
 * hourly_rate, advance — keys off `id`. So in principle only one array needed rewriting.
 *
 * Except `id` is DERIVED FROM THE NAME in all 22 cases, checked rather than assumed. An id
 * is therefore just the name again in a quieter font, and every keyed table carries it. So
 * the ids are remapped too, consistently, across every table that references one — which is
 * the part a careless scrub gets wrong, leaving the tables keyed to codes that still spell
 * out who they belong to.
 *
 * WHAT IS PRESERVED, AND WHY IT MATTERS
 * Row counts, field sets, dates, amounts, category vocabulary (gender F/M, religion
 * Hindu/Muslim, the six roles) and the number of aliases each person carries. The engine's
 * rules are exercised by the SHAPE of this data — a person with two employment spells, a
 * rate that ends with no successor stated, an advance recovered across months. Change the
 * shape and `engine/tests/selftest.py` stops testing what it was written to test. Keep it,
 * and 397 checks still run against data that belongs to nobody.
 *
 * The AMOUNTS are deliberately kept. Re-drawing them broke the engine — see the long note at
 * the point where that decision is made. Identity is what makes a salary private; a figure
 * with nobody attached is a number.
 *
 * It also rewrites every OTHER tracked file that names one of these people — selftest.py
 * hardcodes all 22 ids across its expectation tables — so the repository both stops leaking
 * the names and keeps running.
 *
 * WHAT THIS FILE ITSELF MAY NOT CONTAIN
 * Not one real name. The mapping is computed at run time from the private file and written
 * to engine/private/name_map.json, which is gitignored. This source is committed and must
 * stay readable by anyone.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const PRIVATE = path.join(ROOT, 'engine', 'private', 'master.json');
const FIXTURE = path.join(ROOT, 'engine', 'fixtures', 'master.json');
const MAP_OUT = path.join(ROOT, 'engine', 'private', 'name_map.json');

const check = process.argv.includes('--check');

/* Invented people. Common given names, paired so the synthetic roster reads like a roster
   and the engine's alias matching still has multi-word and single-word cases to chew on.
   The pools are deliberately larger than the roster so their length implies nothing about
   how many people there are.

   THESE ARE CHECKED AGAINST THE REAL ROSTER BEFORE USE, not assumed to be distinct. The
   first version of this comment asserted that any resemblance would be coincidence. It was
   wrong within one run: one invented given name was also a real staff member's name, so the
   tool that exists to remove real names was itself a tracked file containing one — caught by
   brand/site/checkprivacy.js, not by reading this list. dropClashes() below removes any
   entry that collides and refuses to run if too few survive. */
const FIRST_POOL = ['Aarav', 'Anaya', 'Dev', 'Ishita', 'Kabir', 'Meera', 'Nikhil', 'Rhea',
  'Rohan', 'Sanya', 'Tanvi', 'Varun', 'Yash', 'Zara', 'Aditi', 'Bhavin', 'Chetna',
  'Darsh', 'Esha', 'Farhan', 'Gauri', 'Hiren', 'Ira', 'Jatin', 'Kavya', 'Laksh',
  'Mitali', 'Naveen', 'Ojas', 'Pallavi'];
const LAST_POOL = ['Shah', 'Patel', 'Desai', 'Mehta', 'Joshi', 'Trivedi', 'Bhatt', 'Parmar',
  'Chauhan', 'Solanki', 'Rathod', 'Vyas', 'Pandya', 'Gandhi', 'Modi', 'Thakkar',
  'Amin', 'Dave', 'Raval', 'Sheth', 'Kotecha', 'Zaveri', 'Lakhani', 'Doshi',
  'Sompura', 'Vora', 'Gohil', 'Jadeja', 'Makwana', 'Chavda'];

/* ── A REPLACEMENT MUST MATCH THE SHAPE OF WHAT IT REPLACES ────────────────
 * Twice now, substituting a one-word real name with a two-word invented one produced
 * something that was no longer valid where it sat. First a JSON object key carrying a
 * space. Then, found by running the suite rather than by reading the diff:
 *
 *     def test_rohan chavda_flat_year():        SyntaxError: expected '('
 *
 * A single rule covers both and anything like them: **if the text being replaced contains
 * no whitespace, the replacement may not either.** A one-token identifier stays a one-token
 * identifier; only free prose gets the spaced form. Case is carried across the same way, so
 * a shouted alias stays shouted.
 */
const matchCase = (src, repl) => {
  const cased = src === src.toUpperCase() ? repl.toUpperCase()
    : src === src.toLowerCase() ? repl.toLowerCase() : repl;
  return /\s/.test(src) ? cased : cased.replace(/\s+/g, '');
};
module.exports = { matchCase };

/* A NAME THAT IS ALREADY SOMEBODY'S IS NOT AN INVENTED NAME. Filtering here rather than
   trusting the literals above means the tool stays correct when the roster changes — a new
   hire sharing a pool name would otherwise silently reintroduce a real name into the public
   fixture, which is the exact failure this whole file exists to prevent. */
function dropClashes(pool, real, what) {
  const taken = new Set();
  (real.people || []).forEach((p) => [p.id, p.name, ...(p.aliases || [])].forEach((x) => {
    String(x || '').toLowerCase().split(/\s+/).forEach((w) => { if (w.length > 2) taken.add(w); });
  }));
  const kept = pool.filter((n) => !taken.has(n.toLowerCase()));
  const dropped = pool.length - kept.length;
  if (kept.length < (real.people || []).length) {
    console.error(`scrub_roster: only ${kept.length} ${what} names are free of the real ` +
      `roster, and ${(real.people || []).length} people need one. Add more to the pool — ` +
      'reusing one would put a real name back into the public fixture.');
    process.exit(1);
  }
  return { kept, dropped };
}

function synth(real) {
  const f = dropClashes(FIRST_POOL, real, 'given');
  const l = dropClashes(LAST_POOL, real, 'family');
  const FIRST = f.kept;
  const LAST = l.kept;
  const clashesDropped = f.dropped + l.dropped;
  const out = JSON.parse(JSON.stringify(real));
  const idMap = new Map();
  const nameMap = new Map();

  out.people = real.people.map((p, i) => {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 7 + 3) % LAST.length];
    const name = `${first} ${last}`;
    const id = `${first}${last}`.toLowerCase();
    idMap.set(p.id, id);
    nameMap.set(p.name, name);
    (p.aliases || []).forEach((a) => { if (!nameMap.has(a)) nameMap.set(a, null); });

    /* The alias COUNT is preserved because the engine resolves workbook spellings through
       it — a person with three spellings exercises a path a person with none does not. */
    const n = (p.aliases || []).length;
    const variants = [name, name.toUpperCase(), first];
    const aliases = variants.slice(0, n);
    (p.aliases || []).forEach((a, k) => { if (aliases[k]) nameMap.set(a, aliases[k]); });

    /* GENDER, RELIGION AND ROLE ARE KEPT, FOR THE SAME REASON THE AMOUNTS ARE.
       Reassigning them arbitrarily was tried and the suite said no, in six voices:
         FAIL religion, gender, role, salary and threshold hours all resolve to what he stated
         FAIL it applies to somebody whose religion matches
         FAIL and not to somebody whose religion is recorded and differs
       ROSTER_AS_STATED asserts each person's attributes, and the holiday rule turns on
       religion, so scrambling these does not anonymise anything — it deletes what the tests
       test. And it anonymises nothing: an attribute is only personal data while it is
       attached to an identifiable person. With the name, id and aliases replaced, these
       belong to nobody.

       The line this tool draws: IDENTITY is scrubbed, ATTRIBUTES are preserved. */
    return { ...p, id, name, aliases };
  });

  /* EVERY table that keys off a person, remapped — not just the ones that looked obvious.
     Discovered by walking the file rather than listed here, so a table added later is
     covered without this tool being edited. */
  let remapped = 0;
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    if (typeof node.key === 'string' && idMap.has(node.key)) {
      node.key = idMap.get(node.key);
      remapped++;
    }
    Object.values(node).forEach(walk);
  };
  Object.entries(out).forEach(([k, v]) => { if (k !== 'people') walk(v); });

  /* ── THE AMOUNTS STAY. THIS WAS TRIED THE OTHER WAY AND IT WAS WORSE ──────
   *
   * The first version re-drew all 37 amounts, which is the more obviously private choice.
   * It broke the engine: `python3 engine/tests/selftest.py` died in test_blended_rates with
   * StopIteration — found by running it, not by reading it.
   *
   * The cause is the thing worth protecting. selftest.py carries SEVEN hand-verified
   * expectation tables — EXPECTED_BLENDED, EXPECTED_BLENDED_DAILY, KARIGAR_EXPECTED,
   * CORPUS_EXPECTED, CORPUS_UNDER_THE_DAYS_FORMULA, ROSTER_AS_STATED, LEFT_ON — which are
   * the owner's own figures, checked by him against his own books. They are the INDEPENDENT
   * side of every payroll test. The file says why in its own words: an earlier version
   * "passed for ten years' worth of runs because it tested the code against itself — the
   * same wrong formula on both sides."
   *
   * Re-drawing the fixture's amounts leaves two repairs, and both are bad. Recompute the
   * tables from the fixture and every payroll test becomes circular — the exact defect that
   * comment exists to prevent. Delete the tables and 397 checks stop checking anything.
   *
   * So the amounts stay and the IDENTITIES go. What makes a salary private is whose it is;
   * a figure with no person attached is a number. The id↔person mapping lives only in
   * engine/private/, so the link is broken for anyone without that file.
   *
   * THE RESIDUAL RISK, STATED RATHER THAN GLOSSED: the people array keeps its original
   * order, so somebody who already knows the real roster order could re-pair a figure with
   * a person. Shuffling would close that, and would also reorder rows several tests index
   * into. Given the repository is becoming private and the history is being scrubbed, the
   * exposure is to someone who already had the data — and a circular test suite would be a
   * permanent defect traded for a temporary one.
   */
  const redrawn = 0;

  /* ── AND THEN THE PROSE, WHICH IS WHERE THE FIRST VERSION LEAKED ──────────
   * Remapping `people` and every `key` field left 30 real names in the file, found by
   * --check rather than by reading the code: 6 inside OBJECT KEY NAMES (_rate_sources is
   * keyed "<person>|<operation>", _no_rate_stated likewise) and 24 inside STRING VALUES —
   * the annotation sections this file carries to record why a rule is the way it is
   * (_derivation, _provisional, _november_threshold). Two top-level keys are themselves
   * sentences naming people.
   *
   * A structural walk cannot reach any of that, so the substitution is done over the
   * serialised document: every real name, id and alias replaced by its synthetic
   * counterpart, LONGEST FIRST so a full name is consumed before the first name inside it,
   * and case-aware so a shouted alias stays shouted.
   *
   * Off-roster people named only in the prose have no row to map from. They are read from
   * engine/private/extra_names.json when it exists — private, like the roster itself,
   * because listing them here would put the names back into a committed file.
   */
  /* OFF-ROSTER PEOPLE ARE FOUND, NOT LISTED. This file records its own reasoning in
     sentence-shaped top-level keys — `_<subject>_is_not_on_the_roster`,
     `_<a>_and_<b>_are_two_periods`. The subject is usually a domain noun (leave, advance,
     trial, shift) but is sometimes a PERSON who has no row in `people` and therefore no
     mapping. The first version missed exactly one that way, and --check could not see it
     because --check only knows the roster.
     A subject is a domain noun if it appears in a top-level key, a people field or a known
     category value; anything left is treated as a person and mapped. */
  const vocabulary = new Set([
    ...Object.keys(real).flatMap((k) => k.replace(/^_/, '').split('_')),
    ...Object.keys(real.people[0] || {}),
    ...real.people.flatMap((p) => [p.gender, p.religion, p.role, ...(p.roles || [])]),
    ...(real.pay_basis || []).map((r) => r.value),
  ].filter((x) => typeof x === 'string').map((x) => String(x).toLowerCase()));
  const GRAMMAR = new Set(['the', 'and', 'are', 'is', 'not', 'on', 'no', 'a', 'an', 'of',
    'by', 'to', 'in', 'it', 'was', 'has', 'did', 'two', 'own', 'own', 'per', 'from']);

  const found = {};
  Object.keys(real).forEach((k) => {
    const m = /^_([a-z]+)(?:_and_([a-z]+))?_(?:is|are|has|was|did)_/.exec(k);
    if (!m) return;
    [m[1], m[2]].filter(Boolean).forEach((w) => {
      if (vocabulary.has(w) || GRAMMAR.has(w) || w.length < 3) return;
      const onRoster = real.people.some((p) =>
        [p.id, p.name, ...(p.aliases || [])].some((x) => String(x).toLowerCase().includes(w)));
      if (!onRoster) found[w] = Object.keys(found).length;
    });
  });

  /* A manual override remains, for anything the pattern cannot see. Private, like the
     roster — listing a real name here would put it back into a committed file. */
  const extraFile = path.join(ROOT, 'engine', 'private', 'extra_names.json');
  const extra = { ...found, ...(fs.existsSync(extraFile)
    ? JSON.parse(fs.readFileSync(extraFile, 'utf8')) : {}) };
  Object.entries(extra).forEach(([realName, i]) => {
    const first = FIRST[(Number(i) + 11) % FIRST.length];
    const last = LAST[(Number(i) * 5 + 17) % LAST.length];
    if (!nameMap.has(realName)) nameMap.set(realName, `${first} ${last}`);
  });

  /* Every real token that needs to disappear, paired with what replaces it. Aliases whose
     synthetic counterpart was never assigned fall back to the person's synthetic name. */
  const pairs = [];
  real.people.forEach((p, i) => {
    const q = out.people[i];
    const to = (x) => (nameMap.get(x) && nameMap.get(x) !== null ? nameMap.get(x) : q.name);
    pairs.push([p.name, q.name], [p.id, q.id]);
    (p.aliases || []).forEach((a) => pairs.push([a, to(a)]));
  });
  Object.entries(extra).forEach(([realName]) => pairs.push([realName, nameMap.get(realName)]));

  const seen = new Set();
  const table = pairs
    .filter(([from, to]) => from && to && String(from).length > 2
      && !seen.has(String(from).toLowerCase()) && seen.add(String(from).toLowerCase()))
    .sort((a, b) => String(b[0]).length - String(a[0]).length);

  const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const { matchCase } = module.exports;

  let text = JSON.stringify(out);
  let substituted = 0;
  table.forEach(([from, to]) => {
    text = text.replace(new RegExp(esc(from), 'gi'), (m) => { substituted++; return matchCase(m, to); });
  });

  /* A KEY IS AN IDENTIFIER, NOT A SENTENCE FRAGMENT. Substituting a one-word name with a
     two-word synthetic one inside a key of the form `_<person>_and_<person>_are_two_periods` produced a key
     carrying spaces — valid JSON, and wrong: every other key in this file is snake_case, and
     a reader scanning them would trip on the one that is not. Keys are normalised back. */
  const scrubbed = JSON.parse(text);
  let keysFixed = 0;
  const normaliseKeys = (node) => {
    if (Array.isArray(node)) return node.forEach(normaliseKeys);
    if (!node || typeof node !== 'object') return;
    Object.keys(node).forEach((k) => {
      normaliseKeys(node[k]);
      if (k.startsWith('_') && /\s/.test(k)) {
        const fixed = k.replace(/\s+/g, '_').toLowerCase();
        node[fixed] = node[k];
        delete node[k];
        keysFixed++;
      }
    });
  };
  normaliseKeys(scrubbed);

  return { out: scrubbed, idMap, nameMap, remapped, redrawn, substituted, keysFixed,
    clashesDropped,
    offRoster: Object.keys(extra).length, table };
}

/* ── the check: the COMMITTED fixture must name nobody real ───────────────── */
function runCheck() {
  if (!fs.existsSync(PRIVATE)) {
    console.log('scrub_roster: the private roster is not in this checkout, so the committed');
    console.log('  fixture could NOT be compared against it. SKIPPED, not passed.');
    console.log('  This is the state the product builds in, and it is the correct state here.');
    return 0;
  }
  const real = JSON.parse(fs.readFileSync(PRIVATE, 'utf8'));
  const fix = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
  const realNames = new Set();
  real.people.forEach((p) => {
    [p.id, p.name, ...(p.aliases || [])].forEach((x) => { if (x) realNames.add(String(x).toLowerCase()); });
  });
  const blob = JSON.stringify(fix).toLowerCase();
  const leaked = [...realNames].filter((n) => n.length > 2 && blob.includes(n));
  if (leaked.length) {
    console.error(`scrub_roster: ${leaked.length} real name(s) or id(s) survive in the ` +
      'committed fixture. Re-run without --check.');
    return 1;
  }
  if (fix.people.length !== real.people.length) {
    console.error(`scrub_roster: the fixture has ${fix.people.length} people against the ` +
      `real ${real.people.length}. The shape must match or the engine stops being tested ` +
      'on what it was written for.');
    return 1;
  }
  console.log(`scrub_roster: the committed fixture names none of the ${realNames.size} real ` +
    `names, ids or aliases, and carries the same ${fix.people.length} people`);
  return 0;
}

if (check) process.exit(runCheck());

if (!fs.existsSync(PRIVATE)) {
  console.error(`scrub_roster: ${path.relative(ROOT, PRIVATE)} is not here. This tool rewrites`);
  console.error('  the public fixture FROM the private roster; without it there is nothing to');
  console.error('  scrub and overwriting the fixture would destroy data. Nothing was written.');
  process.exit(1);
}

/* ── THE FIXTURE IS NOT THE ONLY FILE THAT NAMES THESE PEOPLE ──────────────
 * Scrubbing master.json alone broke the engine and left the names in place anyway:
 * engine/tests/selftest.py hardcodes all 22 ids and 20 names across its seven expectation
 * tables, and four prototype configs carry a roster name as sample data. Rewriting the
 * fixture and not these leaves a repository that both leaks the names AND no longer runs.
 *
 * The same map is applied to every one of them, so the tables keep pointing at the people
 * they were written for — the same person, under the name the public file now uses. */
function scrubFiles(table) {
  const files = execSync('git ls-files', { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 })
    .toString().split('\n').filter(Boolean)
    .filter((f) => /\.(py|js|md|json|html|txt)$/i.test(f))
    .filter((f) => f !== 'engine/fixtures/master.json' && !f.startsWith('tools/scrub_roster'));

  const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const { matchCase } = module.exports;

  let touched = 0; let hits = 0;
  files.forEach((f) => {
    const abs = path.join(ROOT, f);
    let text;
    try { text = fs.readFileSync(abs, 'utf8'); } catch { return; }
    const before = text;
    table.forEach(([from, to]) => {
      text = text.replace(new RegExp(esc(from), 'gi'), (m) => { hits++; return matchCase(m, to); });
    });
    if (text !== before) { fs.writeFileSync(abs, text); touched++; }
  });
  return { touched, hits };
}

const real = JSON.parse(fs.readFileSync(PRIVATE, 'utf8'));
const { out, idMap, nameMap, remapped, redrawn, substituted, keysFixed, offRoster,
  clashesDropped, table } = synth(real);

fs.writeFileSync(FIXTURE, JSON.stringify(out, null, 2) + '\n');
fs.writeFileSync(MAP_OUT, JSON.stringify(Object.fromEntries(nameMap), null, 2) + '\n');

console.log(`scrub_roster: ${out.people.length} people replaced, ${idMap.size} ids remapped ` +
  `across ${remapped} keyed row(s), ${redrawn} amount(s) re-drawn`);
console.log(`  ${substituted} mention(s) substituted in prose and object key names` +
  (offRoster ? `, including ${offRoster} off-roster name(s) the sentence-key scan found` : '') +
  (keysFixed ? `; ${keysFixed} key(s) normalised back to snake_case` : ''));
console.log(`  wrote  ${path.relative(ROOT, FIXTURE)}   (committed — names nobody real)`);
console.log(`  wrote  ${path.relative(ROOT, MAP_OUT)}   (gitignored — the mapping)`);

const { touched, hits } = scrubFiles(table);
console.log(`  ${hits} mention(s) rewritten across ${touched} other tracked file(s) — ` +
  'selftest.py\'s expectation tables now key off the same people under the public names');
