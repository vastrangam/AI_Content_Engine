'use strict';
/* THE PARAMETERS REGISTER, CHECKED — because a benchmark is the easiest document to fake.
 *
 *   node brand/site/checkbenchmark.js
 *   node brand/site/checkbenchmark.js --summary
 *
 * WHY THIS GATE IS STRICTER THAN IT LOOKS LIKE IT NEEDS TO BE
 * A comparison table is the single most flattering thing anybody can write about their own
 * software. Two lies fit in it comfortably and neither is visible to a reader:
 *
 *   inventing what the competitor does   — an essay from memory, formatted as measurement
 *   overstating what WE do               — a rung claimed that the registry never granted
 *
 * So both halves are refused by construction. A competitor claim must carry the url and the
 * day it was found; without them the verdict must be UNMEASURED. And our side is never
 * stored at all — each row names registry rows or a recorded run and this gate RESOLVES
 * them, so the register cannot describe itself.
 *
 * THE RULES
 *   1 · a claim about a competitor carries url + found_on + method, or the row is UNMEASURED
 *   2 · every source key resolves to a real url in SOURCES, and every url is used
 *   3 · our side is derived — a row storing its own answer is refused
 *   4 · every BEHIND row names what closes it: work with a size, or a blocker
 *   5 · PARITY or AHEAD is refused while our own rung is SPECIFIED or lower
 *   6 · prose may not outrun the rung — the same rule as checkzoho.js
 *   7 · depends_on points backwards, and at a row that exists
 *   8 · every row carries a gap sentence somebody could disagree with
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const B = require('./benchmark.js');
const REGISTRY = require('./registry.js');
const MODULES = require('./modules.js');
const AUDIT = require('./audit.js');

const summary = process.argv.includes('--summary');
let failures = 0;
const fail = (m) => { failures++; console.error('checkbenchmark: ' + m); };

const ROWS = REGISTRY.rows(MODULES);
const BY_ID = new Map(ROWS.map((r) => [r.id, r]));

/* The ladder, lowest first. "Above SPECIFIED" is the line that separates a design from
   software, and several rules below turn on it. */
const LADDER = ['NOT STARTED', 'BLOCKED', 'SPECIFIED', 'DESIGNED', 'IMPLEMENTED', 'TESTED',
  'VERIFIED', 'PRODUCTION-READY'];
const rank = (s) => { const i = LADDER.indexOf(s); return i < 0 ? 0 : i; };
const STANDS_UP = (s) => rank(s) >= LADDER.indexOf('IMPLEMENTED');

/* ── the evidence log, read once ───────────────────────────────────────────── */
const EV_FILE = path.join(ROOT, 'docs', 'verification', 'EVIDENCE.md');
const EVIDENCE = fs.existsSync(EV_FILE) ? fs.readFileSync(EV_FILE, 'utf8') : '';

/* ── RULE 3 · our side is RESOLVED, never read off the row ─────────────────
   This function is the reason the file cannot flatter itself. Everything the documents say
   about where we stand comes from here, and here reads registry.js and the evidence log. */
function resolveOurs(row) {
  const m = row.measure || {};
  const out = { status: null, rung: 'NOT STARTED', from: [], run: null };

  if (m.registry) {
    const missing = m.registry.filter((id) => !BY_ID.has(id));
    if (missing.length) {
      fail(`${row.id} measures itself by ${missing.join(', ')}, which is not a row in the ` +
        `requirements registry — so nothing would be resolved and the row would silently ` +
        `report NOT STARTED whatever the truth is`);
    }
    const found = m.registry.filter((id) => BY_ID.has(id)).map((id) => BY_ID.get(id));
    found.forEach((r) => out.from.push(`${r.id} ${r.status}`));
    found.forEach((r) => { if (rank(r.status) > rank(out.rung)) out.rung = r.status; });
    if (found.length) out.status = out.rung;
  }

  if (m.evidence) {
    /* A recorded run is only evidence if it is IN the log at exit 0. A row citing a run
       nobody ever recorded is the same defect as a registry row citing a file nobody wrote. */
    /* The log records each run as a heading — `## V-DAY · exit 0` — not as a table row.
       The first version of this matched a table row and reported every single citation as
       a run nobody made, which is the failure mode that teaches people to switch a gate
       off. Matched against the real format, and the exit code is read from the heading so
       a recorded failure cannot be cited as support. */
    /* NOT ANCHORED AT END OF LINE. A failing run's heading carries a marker after the exit
       code — `## V-FULL · exit 1  ← NON-ZERO` — so an anchored pattern missed it entirely
       and reported "no such run" for a run that exists and failed. The gate would then
       have told a reader the wrong thing about the one case it matters most in. */
    const re = new RegExp('^##\\s+' + m.evidence + '\\s*·\\s*exit\\s+(\\d+)', 'm');
    const hit = EVIDENCE.match(re);
    if (!hit) {
      fail(`${row.id} cites the recorded run ${m.evidence}, and docs/verification/EVIDENCE.md ` +
        `has no such run. A benchmark may not point at a run nobody made.`);
    } else if (hit[1] !== '0') {
      fail(`${row.id} cites ${m.evidence}, which is recorded but exited ${hit[1]}, not 0. ` +
        `A failing run is not support for a claim.`);
    } else {
      out.run = m.evidence;
    }
  }

  if (m.none) {
    if (m.registry || m.evidence) {
      fail(`${row.id} says both that nothing exists and where to measure it. One or the other.`);
    }
    out.status = 'NOT STARTED';
    out.rung = 'NOT STARTED';
    out.from.push(m.none);
  }

  if (!m.registry && !m.evidence && !m.none) {
    fail(`${row.id} has no measure, so what "ours" means for it is whatever a reader assumes`);
  }
  /* THE STORED-ANSWER REFUSAL. If somebody adds `ours:` to a row it would read as authoritative
     and would never be checked against anything again. */
  if ('ours' in row || 'rung' in row) {
    fail(`${row.id} stores its own answer in \`ours\`/\`rung\`. Our side is resolved from the ` +
      `requirements registry at gate time precisely so that it cannot be typed, and a typed ` +
      `one would outlive the thing it describes.`);
  }
  return out;
}

/* ── the checks ────────────────────────────────────────────────────────────── */
const VERDICTS = ['BEHIND', 'PARITY', 'AHEAD', 'UNMEASURED'];
const DIM_IDS = new Set(B.DIMENSIONS.map((d) => d.id));
const seen = new Set();
const usedSources = new Set();
const resolved = new Map();

/* Rule 6, taken verbatim in spirit from checkzoho.js: a sentence that says something runs,
   beside a rung that says nothing does, tells the reader two different things. */
const RUNNING_PHRASES = [
  /runs? on the real database/i,
  /\bworking today\b/i,
  /\bruns\s+today\b/i,
  /\balready (runs|works)\b/i,
  /\bis built\b/i,
  /\bwe have built\b/i,
];

B.ROWS.forEach((row, i) => {
  const at = row.id || `row ${i + 1}`;

  if (!row.id) fail(`row ${i + 1} has no id`);
  if (seen.has(row.id)) fail(`${at} is defined twice`);
  seen.add(row.id);

  if (!DIM_IDS.has(row.dim)) {
    fail(`${at} is in dimension "${row.dim}", which is not one of the eleven`);
  }
  if (!row.parameter || row.parameter.length < 12) {
    fail(`${at} has no parameter name worth reading`);
  }
  if (!VERDICTS.includes(row.verdict)) {
    fail(`${at} has verdict "${row.verdict}", which is not one of ${VERDICTS.join(' / ')}`);
  }

  /* ── 8 · a gap somebody could argue with ────────────────────────────── */
  if (!row.gap || row.gap.length < 80) {
    fail(`${at} has no gap sentence, or one too short to be one. "Behind" is a word; what is ` +
      `missing and why it matters is a finding.`);
  }

  const ours = resolveOurs(row);
  resolved.set(row.id, ours);

  /* ── 1 and 2 · a competitor claim is sourced, or there is no claim ───── */
  const theirs = row.theirs || [];
  if (!Array.isArray(theirs)) fail(`${at} has a \`theirs\` that is not a list`);
  theirs.forEach((t, j) => {
    const where = `${at} claim ${j + 1}`;
    if (!t.product) fail(`${where} does not say whose claim it is`);
    if (!t.claim || t.claim.length < 30) {
      fail(`${where} has no claim, or one too short to be a statement about a product`);
    }
    if (!t.src) {
      fail(`${where} about ${t.product} carries no source key. A sentence about a ` +
        `competitor with no url is recollection formatted as measurement, which is the one ` +
        `thing this file exists to make impossible.`);
    } else if (!B.SOURCES[t.src]) {
      fail(`${where} cites source key "${t.src}", which is not in SOURCES`);
    } else {
      usedSources.add(t.src);
    }
  });

  /* BEHIND WHAT? — and "behind a named product" is not the only honest answer.
     The first version demanded a competitor claim on every BEHIND row, which was too
     strict and produced a false failure on two rows that are genuinely behind: nobody has
     restored a backup, and nobody has attacked the system on purpose. Those are failures
     against ordinary practice, not against Zoho, and forcing a competitor citation onto
     them would have meant inventing one — the exact thing this gate exists to prevent.

     So a BEHIND row must name what it is behind: a sourced competitor claim, OR a
     `baseline` saying which accepted practice and why that practice is real. What it may
     not do is say BEHIND and point at nothing. */
  if (!theirs.length && row.verdict === 'BEHIND') {
    if (!row.baseline || row.baseline.length < 60) {
      fail(`${at} is BEHIND and names nothing on the other side — no sourced claim and no ` +
        `\`baseline\` saying which accepted practice it falls short of. Behind something ` +
        `unnamed is an opinion.`);
    }
  }
  if (!theirs.length && row.verdict === 'PARITY') {
    fail(`${at} claims PARITY with nothing named. Level with what?`);
  }
  if (theirs.length && row.baseline) {
    fail(`${at} carries both a sourced claim and a baseline. Say which one the verdict is ` +
      `measured against, not both.`);
  }

  /* ── 4 · every BEHIND row names what closes it ───────────────────────── */
  if (row.verdict === 'BEHIND') {
    const c = row.close;
    if (!c || (!c.work && !c.blocker)) {
      fail(`${at} is BEHIND and does not say what would close it. A gap with no next step is ` +
        `a complaint, and this document is meant to be worked from.`);
    } else if (c.work && !AUDIT.SIZES.includes(c.size)) {
      fail(`${at} names work to close it with size "${c.size}", which is not one of ` +
        `${AUDIT.SIZES.join(' / ')}`);
    }
  }
  if (row.verdict !== 'BEHIND' && row.close && row.close.work) {
    /* Allowed — UNMEASURED rows can carry work too — but a PARITY/AHEAD row with work to do
       is contradicting itself. */
    if (row.verdict === 'PARITY' || row.verdict === 'AHEAD') {
      fail(`${at} is ${row.verdict} and also lists work needed to close a gap. If there is ` +
        `work, it is not parity.`);
    }
  }

  /* ── 5 · no PARITY or AHEAD from a standing start ────────────────────── */
  if ((row.verdict === 'PARITY' || row.verdict === 'AHEAD') && !STANDS_UP(ours.rung)) {
    fail(`${at} claims ${row.verdict} while our own rung is ${ours.rung}. Nothing below ` +
      `IMPLEMENTED can be level with a shipping product — the registry has not granted it ` +
      `and this table may not grant it either.`);
  }

  /* ── 6 · prose may not outrun the rung ───────────────────────────────── */
  const phrase = RUNNING_PHRASES.find((re) => re.test(row.gap));
  if (phrase && !STANDS_UP(ours.rung)) {
    fail(`${at} says something runs — "${row.gap.match(phrase)[0]}" — while its own rung is ` +
      `${ours.rung}. The sentence and the rung beside it are telling a reader two different ` +
      `things, and the sentence is the one they will believe.`);
  }
});

/* ── 7 · dependencies point backwards ──────────────────────────────────────── */
const order = B.ROWS.map((r) => r.id);
B.ROWS.forEach((row, i) => {
  (row.depends_on || []).forEach((d) => {
    const j = order.indexOf(d);
    if (j < 0) fail(`${row.id} depends on ${d}, which is not a row here`);
    else if (j >= i) {
      fail(`${row.id} depends on ${d}, which comes after it. A plan whose dependencies point ` +
        `forwards cannot be worked from the top.`);
    }
  });
});

/* ── 2b · every source is used ─────────────────────────────────────────────── */
/* masterspec.js cites the same url register, one key per section. Counting only this
   file's citations would have condemned six urls as unused that are used — a gate failing
   correct data, which teaches people to stop believing it. */
try {
  const SPEC = require('./masterspec.js');
  SPEC.SECTIONS.forEach((s) => { if (s.src) usedSources.add(s.src); });
} catch (_) { /* masterspec is optional; its own gate covers it */ }

Object.keys(B.SOURCES).forEach((k) => {
  if (!usedSources.has(k)) {
    fail(`SOURCES.${k} is never cited by any row. An unused url is one nobody checked and ` +
      `nobody removed.`);
  }
});

/* ── the date is a real one, and not in the future ─────────────────────────── */
if (!/^\d{4}-\d{2}-\d{2}$/.test(B.FOUND_ON)) {
  fail(`FOUND_ON is "${B.FOUND_ON}", which is not a date`);
} else if (new Date(B.FOUND_ON) > new Date()) {
  fail(`FOUND_ON is ${B.FOUND_ON}, which is in the future`);
}

/* ── result ────────────────────────────────────────────────────────────────── */
const tally = {};
B.ROWS.forEach((r) => { tally[r.verdict] = (tally[r.verdict] || 0) + 1; });
const sourced = B.ROWS.reduce((n, r) => n + (r.theirs || []).length, 0);

if (failures) {
  console.error(`\ncheckbenchmark: ${failures} problem(s) across ${B.ROWS.length} parameter(s).`);
  process.exit(1);
}

console.log(`checkbenchmark: ${B.ROWS.length} parameters across ${B.DIMENSIONS.length} ` +
  `dimensions — every claim about another product carries its url and the day it was found ` +
  `(${sourced} claim(s), ${usedSources.size} source(s), ${B.FOUND_ON}), our side resolved ` +
  `from the requirements registry rather than stored, every BEHIND row naming what closes it`);

if (summary) {
  console.log('');
  console.log('  Verdicts:');
  ['BEHIND', 'UNMEASURED', 'PARITY', 'AHEAD'].forEach((v) => {
    if (tally[v]) console.log(`    ${String(tally[v]).padStart(3)}  ${v}`);
  });
  console.log('');
  B.DIMENSIONS.forEach((d) => {
    const mine = B.ROWS.filter((r) => r.dim === d.id);
    if (!mine.length) return;
    const behind = mine.filter((r) => r.verdict === 'BEHIND').length;
    console.log(`  ${String(d.n).padStart(2)} · ${d.title}`);
    mine.forEach((r) => {
      const o = resolved.get(r.id) || {};
      console.log(`       ${r.verdict.padEnd(11)} ${String(o.rung || '?').padEnd(12)} ` +
        r.parameter.slice(0, 56));
    });
    console.log(`       ${behind} of ${mine.length} behind`);
    console.log('');
  });
  const blocked = B.ROWS.filter((r) => r.close && r.close.blocker);
  console.log(`  ${blocked.length} parameter(s) cannot be closed by writing code:`);
  blocked.forEach((r) => console.log(`    ${r.id.padEnd(18)} ${r.parameter.slice(0, 58)}`));
  console.log('');
}
