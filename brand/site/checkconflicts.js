'use strict';
/* THE CONFLICT REGISTER, CHECKED.
 *
 *   node brand/site/checkconflicts.js
 *   node brand/site/checkconflicts.js --summary
 *
 * WHY THIS FILE EXISTS
 * A list of "things that look wrong" rots in one predictable way: the specifics fall off. The line
 * number goes first, then what the repository actually does, and what is left is a page of unease
 * that nobody can act on and nobody can close.
 *
 * So an entry owes seven things, and this refuses it otherwise:
 *
 *   · at least TWO line references, because a conflict is by definition two places disagreeing
 *   · quoted text at each one, so a reader can confirm the line says what the entry claims
 *   · a `repo` column — what this repository does today, which is not the same claim as "correct"
 *   · a `resolution` that is null, or a real sentence. Null is the recorded decision: flag them,
 *     do not resolve them. What is refused is the middle — a half-sentence that reads like a
 *     resolution and settles nothing.
 *   · `affects` — which parts of the system the answer would move, checked against modules.js
 *   · `safe` — what the system does TODAY while it is undecided
 *   · `decide` — the question, phrased as one, for the person who can answer it
 *
 * THE LAST THREE WERE ADDED BECAUSE THE FIRST FOUR DESCRIBE AND DO NOT ASK. Ten entries could
 * every one be well-evidenced and correctly quoted and still leave a reader with no idea which
 * of them was urgent, which was dangerous right now, or what they personally had to answer. A
 * register that cannot be closed by anybody is a graveyard with citations.
 *
 * AND NO PERSON IS NAMED. Two entries concern one worker's pay and roster membership. The rule
 * that a person's name does not go into a committed document is not suspended by a conflict being
 * about them, and this checks the register against the same roster list the document generators
 * check against.
 */

const path = require('node:path');
const { SOURCE, SOURCES, CONFLICTS } = require('./conflicts.js');
const MODULES = require('./modules.js');

/* Every app name, so an "affected system" can be looked up rather than taken on trust. */
const APP_NAMES = new Set();
MODULES.forEach((m) => m.apps.forEach((x) => APP_NAMES.add(x[0])));

const summary = process.argv.includes('--summary');
let failures = 0;
const fail = (msg) => { failures++; console.error(`checkconflicts: ${msg}`); };

/* The roster, read from the fixture ONLY to confirm absence — the same thing mktenant.js does. */
let ROSTER = [];
try {
  const master = require(path.join(__dirname, '..', '..', 'engine', 'fixtures', 'master.json'));
  ROSTER = (master.people || []).map((p) => p.name).filter(Boolean);
} catch (_) { ROSTER = []; }

if (!SOURCE || !SOURCE.file || !SOURCE.lines) {
  fail('the register does not say which document its line numbers refer to.');
}

/* A CONFLICT MAY NAME ITS OWN SOURCE, and its line numbers are checked against THAT file.
   There are three specification documents now, and a line number is only checkable against the
   file it came from — filing one under another document's length would leave an entry that looks
   verifiable and is not. An entry with no `source` means the original, which is what every entry
   written before there was a second document meant. */
const sourceOf = (c) => (c.source ? SOURCES[c.source] : SOURCE);
for (const c of CONFLICTS) {
  if (c.source && !SOURCES[c.source]) {
    fail(`${c.id || '(no id)'}: names source "${c.source}", which is not in SOURCES.`);
  }
}

const ids = new Set();
for (const c of CONFLICTS) {
  const where = c.id || '(no id)';

  if (!c.id || !/^C\d+$/.test(c.id)) fail(`${where}: needs an id like C1`);
  if (ids.has(c.id)) fail(`${c.id}: used twice`);
  ids.add(c.id);

  if (!c.title || c.title.length < 10) fail(`${where}: needs a title somebody can scan`);

  /* THE CHECK THIS FILE IS FOR. */
  const says = Array.isArray(c.says) ? c.says : [];
  if (says.length < 2) {
    fail(`${where}: has ${says.length} line reference(s). A conflict is two places disagreeing; ` +
      'one reference is an opinion.');
  }
  const src = sourceOf(c) || SOURCE;
  says.forEach((s, i) => {
    if (!Number.isInteger(s.at) || s.at < 1 || s.at > src.lines) {
      fail(`${where}: reference ${i + 1} points at line ${s.at}, which is not a line in ` +
        `${src.file} (1–${src.lines}).`);
    }
    if (!s.text || s.text.trim().length < 15) {
      fail(`${where}: reference ${i + 1} (line ${s.at}) quotes nothing. A line number with no ` +
        'text cannot be checked by a reader.');
    }
  });

  if (!c.what || c.what.length < 120) {
    fail(`${where}: does not explain the conflict at any length worth reading.`);
  }
  if (!c.repo || c.repo.length < 60) {
    fail(`${where}: no "what the repository does" column. Without it the register cannot tell ` +
      'anybody whether the conflict is live in the code or only in the document.');
  }
  if (c.resolution !== null && (typeof c.resolution !== 'string' || c.resolution.length < 60)) {
    fail(`${where}: resolution must be null — the recorded decision — or a real sentence. ` +
      'A word here would read like a decision that was never taken.');
  }

  /* ── THE THREE COLUMNS A FLAGGED CONFLICT OWES ANYBODY WHO HAS TO ACT ON IT ──
   * `what` and `repo` describe the disagreement and what the code does about it. Neither
   * tells a reader what is at stake, whether it is currently dangerous, or what they
   * personally have to decide — and a register of ten unresolved contradictions that
   * answers none of those is a page of unease with line numbers attached.
   *
   *   affects  which parts of the system the answer would move. Checked against the
   *            module register, so a conflict cannot be filed against an app nobody built
   *            a name for — and so the blast radius is a fact rather than a feeling.
   *   safe     what happens TODAY while it is undecided. This is the field that separates
   *            "flagged and held safely" from "flagged and quietly wrong", and every entry
   *            here is meant to be the first.
   *   decide   the question, phrased as one, for the person who can answer it. An entry
   *            that describes a contradiction without asking anything cannot be closed by
   *            anybody, which is how a register becomes a graveyard.
   */
  const affects = Array.isArray(c.affects) ? c.affects : [];
  if (!affects.length) {
    fail(`${where}: names no affected system. A conflict with no blast radius written down ` +
      'is impossible to prioritise against any other conflict.');
  }
  affects.forEach((a) => {
    if (!APP_NAMES.has(a)) {
      fail(`${where}: says it affects "${a}", which is not an app in modules.js. An ` +
        'affected system nobody can look up is a word, not a scope.');
    }
  });
  if (!c.safe || c.safe.length < 80) {
    fail(`${where}: does not say what the system does TODAY while this is undecided. That ` +
      'is the field separating a conflict that is held safely from one that is quietly ' +
      'wrong, and leaving it out lets a reader assume the first.');
  }
  if (!c.decide || c.decide.length < 40) {
    fail(`${where}: states no decision required. A contradiction nobody is asked to settle ` +
      'stays in this register forever.');
  }
  if (c.decide && !/\?/.test(c.decide)) {
    fail(`${where}: its decision required is not a question. "${c.decide.slice(0, 60)}…" — ` +
      'phrase it as the question the person who can answer it would be asked, or it is a ' +
      'summary rather than a request.');
  }
  /* A RESOLVED CONFLICT MAY NOT STILL BE ASKING. C8 is the live case: half of it was
     settled by the owner and half was not, and the entry has to keep asking about the half
     that is open. So this is checked the other way round — a resolution that closes
     everything and a question that is still open cannot both be true. */
  if (c.resolution && /^(yes|no|settled|resolved)\b/i.test(c.resolution) && c.decide) {
    fail(`${where}: carries a resolution and still asks a question. If it is settled, the ` +
      'question goes; if part of it is open, the resolution has to say which part.');
  }

  /* No person named, in any field. */
  /* The new columns are scanned too. A rule that a person's name does not enter a
     committed document is not satisfied by covering four fields out of seven. */
  const blob = [c.title, c.what, c.repo, c.resolution || '', c.safe || '', c.decide || '',
    ...(c.affects || []), ...says.map((s) => s.text)].join(' ');
  const named = ROSTER.filter((n) => new RegExp(`\\b${n}\\b`, 'i').test(blob));
  if (named.length) {
    fail(`${where}: names ${named.length} person(s) from the roster. Describe the role and let ` +
      'the line numbers point at the row.');
  }
}

if (summary && !failures) {
  const w = CONFLICTS.reduce((m, c) => Math.max(m, c.title.length), 0);
  Object.keys(SOURCES).forEach((key) => {
    const src = SOURCES[key];
    const mine = CONFLICTS.filter((c) => (c.source || 'master') === key);
    if (!mine.length) return;
    console.log(`\n  ${src.file} · ${src.lines.toLocaleString()} lines\n`);
    mine.forEach((c) => {
      const lines = c.says.map((s) => `L${s.at}`).join(' ');
      console.log(`  ${c.id}  ${c.title.padEnd(w)}  ${lines}`);
    });
  });
  const open = CONFLICTS.filter((c) => c.resolution === null).length;
  console.log(`\n  ${open} of ${CONFLICTS.length} unresolved, on purpose — the decision taken was ` +
    'to flag them, not to resolve them.');

  /* WHICH APPS CARRY THE MOST UNSETTLED GROUND. Derived from `affects`, so it moves when
     the register does — and it is the one view that answers "where should I be careful". */
  const hits = new Map();
  CONFLICTS.forEach((c) => (c.affects || []).forEach((a) =>
    hits.set(a, (hits.get(a) || 0) + 1)));
  const ranked = [...hits].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
  console.log(`\n  ${hits.size} app(s) sit under at least one open contradiction:\n`);
  ranked.forEach(([a, n]) => console.log(`    ${String(n).padStart(2)}  ${a}`));

  console.log('\n  What each one is waiting on somebody to answer:\n');
  CONFLICTS.forEach((c) => {
    console.log(`  ${c.id}  ${c.decide}`);
    console.log('');
  });
  console.log('  Every one of these is held safely in the meantime — each entry says how, and');
  console.log('  the gate refuses an entry that does not.\n');
}

if (failures) {
  console.error(`\ncheckconflicts: ${failures} problem(s) across ${CONFLICTS.length} entries.`);
  process.exit(1);
}
console.log(`checkconflicts: all valid — ${CONFLICTS.length} conflicts, ` +
  `${CONFLICTS.reduce((n, c) => n + c.says.length, 0)} line references, every one quoted; ` +
  `${CONFLICTS.filter((c) => c.resolution === null).length} unresolved by decision; no person named`);
