'use strict';
/* THE AUDIT REGISTER, CHECKED.
 *
 *   node brand/site/checkaudit.js
 *   node brand/site/checkaudit.js --summary
 *
 * WHAT IT ENFORCES
 *   1 · the register's own shape                    audit.js check()
 *   2 · every file a queue task expects to change   lives somewhere that exists, or is
 *                                                     plainly a new file in an existing
 *                                                     directory. A task pointing into a
 *                                                     directory nobody has is a task
 *                                                     nobody can start.
 *   3 · the score is a FUNCTION of the gated rung   recomputed here from registry.js and
 *                                                     compared, so the two can never drift
 *   4 · the maturity level is not ahead of the      a level above Prototype while nothing
 *       evidence                                      is deployed is refused outright
 *   5 · a BLOCKED task states its blocker           and a task with no blocker may not
 *                                                     claim one
 *
 * RULE 4 IS THE ONE WITH TEETH HERE. Every other number in this project is derived; the
 * maturity level is the one genuine judgement, which makes it the one thing a later hand
 * could raise by feeling better about the work. So it is bounded by facts the gate can
 * check: nothing deployed caps it at Prototype, and the register has to say what would
 * lift it.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const AUDIT = require('./audit.js');
const EVID = require('../../tools/evidence.js');
const recorded = EVID.entries();
const REGISTRY = require('./registry.js');
const MODULES = require('./modules.js');

const summary = process.argv.includes('--summary');
let failures = 0;
const fail = (m) => { failures++; console.error('checkaudit: ' + m); };

/* ── 1 · the register's own shape ─────────────────────────────────────────── */
AUDIT.check().forEach((b) => fail(`audit.js — ${b}`));

/* ── 2 · a task's files are somewhere a person can go ─────────────────────── */
AUDIT.QUEUE.forEach((t) => {
  (t.files || []).forEach((f) => {
    const full = path.join(ROOT, f);
    if (fs.existsSync(full)) return;
    /* A new file is fine; a new file in a directory nobody has is not. */
    const dir = path.dirname(full);
    if (!fs.existsSync(dir)) {
      fail(`${t.id} expects to change ${f}, and even ${path.relative(ROOT, dir)} does not ` +
        `exist. A task nobody can start is a task that will not be started.`);
    }
  });
});

/* ── 3 · the score is recomputed, never read ──────────────────────────────── */
const rows = REGISTRY.rows(MODULES);
const apps = rows.filter((r) => r.kind === 'app');
const caps = rows.filter((r) => r.kind === 'capability');
const all = AUDIT.score(rows);
const appScore = AUDIT.score(apps);
const capScore = AUDIT.score(caps);

rows.forEach((r) => {
  const s = AUDIT.SCORE_OF[r.status];
  if (s === undefined) fail(`${r.id} has status ${r.status}, which has no score`);
  if (s === 5 && r.status !== 'PRODUCTION-READY') {
    fail(`${r.id} scores 5 without being PRODUCTION-READY — the scale has drifted from ` +
      `the ladder it is supposed to translate.`);
  }
});

/* ── 3b · THE MAPPING ITSELF IS BOUNDED, not merely total ──────────────────────
 * The first version of this gate checked only that every rung HAD a score, and audit.js
 * claimed in its own header that a score cannot be inflated because it is "a function of
 * the gated rung". A plant disproved that in one line: changing SPECIFIED from 1 to 3
 * moved the product's mean from 1.4 to 2.9 and nothing objected. A function whose
 * definition is editable is not a constraint, it is a column with extra steps — and it is
 * the exact inflation §54 forbids by name.
 *
 * So each rung's score is now bounded by what the REGISTRY LADDER demands of that rung,
 * which is checked elsewhere and cannot be quietly loosened here:
 *
 *   a rung needing no file on disk    scores at most 1 — §54's 2 is "partial
 *                                       implementation", and nothing is implemented
 *   a rung needing a file but no      scores at most 3 — §54's 4 is "tested and
 *     recorded run                      verified", and no run has been recorded
 *   a rung needing a recorded run     scores at least 4
 *   only PRODUCTION-READY             may score 5
 *
 * And the whole map must climb: a later rung may never score below an earlier one. */
const LADDER = REGISTRY.STATUSES.filter((s) => !['BLOCKED', 'DEPRECATED'].includes(s));
let previous = -1;
LADDER.forEach((rung) => {
  const s = AUDIT.SCORE_OF[rung];
  const needsFile = REGISTRY.NEEDS_FILE.includes(rung);
  const needsRun = REGISTRY.NEEDS_RUN.includes(rung);

  if (!needsFile && s > 1) {
    fail(`the rung ${rung} scores ${s}. It demands no file on disk, so nothing is ` +
      `implemented at it, and §54 reserves 2 and above for an implementation. Scoring it ` +
      `higher raises the product's mean without a line of code being written.`);
  }
  if (needsFile && !needsRun && s > 3) {
    fail(`the rung ${rung} scores ${s}. It demands no recorded passing run, and §54's 4 ` +
      `is "tested and verified".`);
  }
  if (needsRun && s < 4) {
    fail(`the rung ${rung} scores ${s}. It demands a recorded passing run inside the ` +
      `gated suite, which is what §54 calls 4.`);
  }
  if (s === 5 && rung !== 'PRODUCTION-READY') {
    fail(`the rung ${rung} scores 5. Only PRODUCTION-READY may, and nothing is there.`);
  }
  if (s < previous) {
    fail(`the score map does not climb: ${rung} scores ${s}, below the rung before it. ` +
      `A ladder that goes down somewhere is not a ladder.`);
  }
  previous = s;
});

/* ── 4 · the maturity level cannot outrun the evidence ────────────────────── */
const deployed = rows.some((r) => r.status === 'PRODUCTION-READY');
const anyTested = rows.some((r) => r.status === 'TESTED');

if (!deployed && AUDIT.MATURITY.level > 3) {
  fail(`the maturity level is ${AUDIT.MATURITY.level} (${AUDIT.MATURITY.name}) and nothing ` +
    `in the requirements registry is PRODUCTION-READY. Levels above Prototype describe a ` +
    `product doing real work; this one has never been installed anywhere.`);
}
if (!anyTested && AUDIT.MATURITY.level > 1) {
  fail(`the maturity level is ${AUDIT.MATURITY.level} and nothing is TESTED.`);
}
/* And it must not be pessimistic either — an understated level is also a wrong one, and
   it is the kind that quietly justifies not shipping. */
if (anyTested && AUDIT.MATURITY.level < 3) {
  fail(`the maturity level is ${AUDIT.MATURITY.level} while ${rows.filter((r) => r.status === 'TESTED').length} ` +
    `rows are TESTED with recorded runs. Understating is as wrong as overstating.`);
}

/* ── 4b · A FINISHED TASK CITES A RUN, NOT A TICK ─────────────────────────────
 * `done` is the one field in this register that a later hand would most like to set by
 * feeling good about the work, so it is held to the same rule as a rung in the requirements
 * registry: the command it names must appear in the evidence log at exit 0. A task cannot
 * be finished by typing the word, and one that claims to be finished while its own command
 * fails is worse than one still marked open. */
AUDIT.QUEUE.filter((t) => t.done).forEach((t) => {
  const seen = recorded.filter((e) => e.command === t.done);
  if (!seen.some((e) => e.exit_code === 0)) {
    fail(`${t.id} is marked done by \`${t.done}\`, and ` + (seen.length
      ? `docs/verification/EVIDENCE.md records that command only at exit ` +
        `${seen.map((e) => e.exit_code).join(', ')}.`
      : 'docs/verification/EVIDENCE.md has no record of that command ever being run.'));
  }
  if (!t.done_note || t.done_note.length < 60) {
    fail(`${t.id} is marked done and says nothing about what doing it turned up. The ` +
      `queue's value after the fact is the record of what the work actually cost.`);
  }
});

/* ── 5 · blockers ─────────────────────────────────────────────────────────── */
AUDIT.QUEUE.forEach((t) => {
  (t.blockers || []).forEach((b) => {
    if (b.length < 40) {
      fail(`${t.id} states a blocker too short to name an obstacle: "${b}"`);
    }
  });
});

/* ── result ───────────────────────────────────────────────────────────────── */
if (failures) {
  console.error(`\ncheckaudit: ${failures} problem(s).`);
  process.exit(1);
}
console.log(`checkaudit: valid — ${AUDIT.QUEUE.length} queue tasks, every requirement cited ` +
  `is a real registry row, every dependency points backwards; score ${all.mean}/5 across ` +
  `${all.n} rows, recomputed from the gated rungs; maturity level ${AUDIT.MATURITY.level} ` +
  `(${AUDIT.MATURITY.name})`);

if (summary) {
  console.log('');
  console.log('  §54 score, derived from the rung each row has actually earned:');
  AUDIT.SCALE.forEach(([n, label]) => {
    const c = all.dist[n];
    console.log(`    ${n}  ${label.padEnd(34)} ${String(c).padStart(3)}` +
      (c ? '  ' + '█'.repeat(Math.max(1, Math.round(c / 3))) : ''));
  });
  console.log(`\n    apps         ${appScore.mean}/5 across ${appScore.n}`);
  console.log(`    capabilities ${capScore.mean}/5 across ${capScore.n}`);
  console.log(`    everything   ${all.mean}/5 across ${all.n}`);
  console.log('\n    The mean is to one decimal because a second would be a precision this');
  console.log('    input does not have.');

  console.log(`\n  §55 maturity: level ${AUDIT.MATURITY.level} — ${AUDIT.MATURITY.name}`);
  console.log('    To reach the next level:');
  console.log('    ' + AUDIT.MATURITY.next_level_needs.replace(/(.{72}\S*)\s/g, '$1\n    '));

  console.log('\n  §51 build queue, in order:');
  AUDIT.QUEUE.forEach((t) => {
    console.log(`    ${t.id}  ${t.risk.padEnd(6)} ${t.size}  ${t.title}`);
    if ((t.depends_on || []).length) {
      console.log(`         after ${t.depends_on.join(', ')}`);
    }
    (t.blockers || []).forEach(() => console.log('         BLOCKED — see the register'));
  });
  const blocked = AUDIT.QUEUE.filter((t) => (t.blockers || []).length);
  console.log(`\n  ${blocked.length} of ${AUDIT.QUEUE.length} task(s) blocked: ` +
    `${blocked.map((t) => t.id).join(', ')}\n`);
}
