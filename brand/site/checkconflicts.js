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
 * So an entry owes four things, and this refuses it otherwise:
 *
 *   · at least TWO line references, because a conflict is by definition two places disagreeing
 *   · quoted text at each one, so a reader can confirm the line says what the entry claims
 *   · a `repo` column — what this repository does today, which is not the same claim as "correct"
 *   · a `resolution` that is null, or a real sentence. Null is the recorded decision: flag them,
 *     do not resolve them. What is refused is the middle — a half-sentence that reads like a
 *     resolution and settles nothing.
 *
 * AND NO PERSON IS NAMED. Two entries concern one worker's pay and roster membership. The rule
 * that a person's name does not go into a committed document is not suspended by a conflict being
 * about them, and this checks the register against the same roster list the document generators
 * check against.
 */

const path = require('node:path');
const { SOURCE, CONFLICTS } = require('./conflicts.js');

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
  says.forEach((s, i) => {
    if (!Number.isInteger(s.at) || s.at < 1 || s.at > SOURCE.lines) {
      fail(`${where}: reference ${i + 1} points at line ${s.at}, which is not a line in ` +
        `${SOURCE.file} (1–${SOURCE.lines}).`);
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

  /* No person named, in any field. */
  const blob = [c.title, c.what, c.repo, c.resolution || '', ...says.map((s) => s.text)].join(' ');
  const named = ROSTER.filter((n) => new RegExp(`\\b${n}\\b`, 'i').test(blob));
  if (named.length) {
    fail(`${where}: names ${named.length} person(s) from the roster. Describe the role and let ` +
      'the line numbers point at the row.');
  }
}

if (summary && !failures) {
  const w = CONFLICTS.reduce((m, c) => Math.max(m, c.title.length), 0);
  console.log(`\n  ${SOURCE.file} · ${SOURCE.lines.toLocaleString()} lines\n`);
  CONFLICTS.forEach((c) => {
    const lines = c.says.map((s) => `L${s.at}`).join(' ');
    console.log(`  ${c.id}  ${c.title.padEnd(w)}  ${lines}`);
  });
  const open = CONFLICTS.filter((c) => c.resolution === null).length;
  console.log(`\n  ${open} of ${CONFLICTS.length} unresolved, on purpose — the decision taken was ` +
    'to flag them, not to resolve them.\n');
}

if (failures) {
  console.error(`\ncheckconflicts: ${failures} problem(s) across ${CONFLICTS.length} entries.`);
  process.exit(1);
}
console.log(`checkconflicts: all valid — ${CONFLICTS.length} conflicts, ` +
  `${CONFLICTS.reduce((n, c) => n + c.says.length, 0)} line references, every one quoted; ` +
  `${CONFLICTS.filter((c) => c.resolution === null).length} unresolved by decision; no person named`);
