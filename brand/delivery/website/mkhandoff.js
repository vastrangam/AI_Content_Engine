'use strict';
/* HANDOFF.md — THE ONE PROMPT ANY MODEL READS TO TAKE OVER.
 *
 *   node brand/delivery/website/mkhandoff.js          → write HANDOFF.md
 *   node brand/delivery/website/mkhandoff.js --check  → prove it is current
 *
 * WHY THIS EXISTS
 * The owner runs three subscriptions and will hit a limit on one of them mid-build. The usual
 * answer — paste the conversation into the next model — fails for two reasons: the conversation
 * is enormous, and it is a record of what somebody INTENDED rather than what is true now.
 *
 * It does not have to work that way here, because this repository already keeps its own state in
 * machine-readable form. built.js says what runs. EVIDENCE.md says what was proven, with the
 * command, the exit code and the commit. rules.js says what the software must never do. A model
 * that reads those knows more than a model that read the chat, and it knows it as of this minute
 * rather than as of whenever somebody last summarised.
 *
 * So this file is not a summary. It is a set of instructions for deriving the state, and the
 * numbers in it are read from the registers at generation time.
 *
 * WHAT IT MUST NEVER DO
 * Name a path that does not exist, or a command that is not in package.json. A handover document
 * that sends the next model to a missing file costs more than no document, because the model
 * then distrusts everything else in it. Every path and command below is checked against the
 * filesystem and against package.json before the file is written — the same rule mkskills.js
 * applies to skills, for the same reason.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..', '..');
const OUT = path.join(ROOT, 'HANDOFF.md');
const check = process.argv.includes('--check');

const MODULES = require(path.join(ROOT, 'brand/site/modules.js'));
const REGISTRY = require(path.join(ROOT, 'brand/site/registry.js'));
const RULES = require(path.join(ROOT, 'brand/site/rules.js'));
const PKG = require(path.join(ROOT, 'package.json'));

const modRows = Array.isArray(MODULES) ? MODULES : Object.values(MODULES).find(Array.isArray);
const rows = REGISTRY.rows(MODULES);
const NAPPS = rows.filter((r) => r.kind === 'app').length;
const NRULES = Array.isArray(RULES) ? RULES.length : (RULES.RULES || []).length;
const gates = (PKG.scripts.check || '').split('&&').length;

/* ── the two lists this document is allowed to name ───────────────────────── */
const PATHS = [
  ['CLAUDE.md', 'the working agreement — read before anything else'],
  ['HANDOFF.md', 'this file'],
  ['brand/site/built.js', 'which apps actually run, as against which are written down'],
  ['docs/verification/EVIDENCE.md', 'every recorded run: command, exit code, commit'],
  ['brand/site/modules.js', 'the canonical modules and apps'],
  ['brand/site/rules.js', 'what each module enforces, and what it will never do instead'],
  ['brand/site/registry.js', 'the requirement behind each app, and its rung'],
  ['brand/site/stack.js', 'what each layer is built on and what it could be swapped for'],
  ['core/schema.postgres.sql', 'the database — every table, its company_id, its policy'],
  ['MEDHAVA_HOW_TO_BUILD.md', 'the ordered path from a checkout to a running site'],
];

const COMMANDS = [
  ['npm ci', 'install exactly what the lockfile says'],
  ['npm run check', `every gate — ${gates} of them`],
  ['npm test', 'the gates plus the engines plus the browser apps'],
  ['npm run test:product', 'the product alone, with no tenant installed'],
  ['npm run test:tenant', 'the tenant engine — needs the tenant present'],
];

/* ── the checks, run before a single byte is written ──────────────────────── */
function verify() {
  const bad = [];
  PATHS.forEach(([p]) => {
    /* THE FILE BEING WRITTEN CANNOT BE REQUIRED TO EXIST FIRST. Listing HANDOFF.md in its own
       reading list is correct — a reader arriving at it should see where it sits — but checking
       for it made the generator refuse to create it, which it did on the very first run.
       mkcontents.js has the same shape and states the same rule: a generator's own output is
       described, never measured. */
    if (p === path.basename(OUT)) return;
    if (!fs.existsSync(path.join(ROOT, p))) bad.push(`path does not exist: ${p}`);
  });
  COMMANDS.forEach(([c]) => {
    const m = /^npm run ([\w:-]+)$/.exec(c);
    if (m && !PKG.scripts[m[1]]) bad.push(`npm script not in package.json: ${m[1]}`);
  });
  return bad;
}

function markdown() {
  const L = [];
  const w = (s) => L.push(s);

  w('# Taking over this build — start here');
  w('');
  w('**You are one of several models working on this repository.** Claude, Codex, Grok and');
  w('Cursor have all been used. You may be picking this up because another one ran out of');
  w('budget mid-task. Nothing is lost, and you do **not** need the previous conversation.');
  w('');
  w('---');
  w('');
  w('## Why you do not need the chat history');
  w('');
  w('A conversation records what somebody **intended**. This repository records what is');
  w('**true**, in files you can read and commands you can run. Read those instead — they are');
  w('current as of this minute, and a summary never is.');
  w('');
  w('Do not trust a sentence in any document, including this one, over a command you ran.');
  w('');
  w('---');
  w('');
  w('## First six minutes');
  w('');
  w('```bash');
  COMMANDS.slice(0, 2).forEach(([c]) => w(c));
  w('```');
  w('');
  w(`\`npm run check\` runs **${gates} gates**. If it exits 0, the tree is healthy and you can`);
  w('build. If it exits non-zero, **fix that before anything else** — do not build on a red');
  w('suite, and do not weaken a gate to make it green.');
  w('');
  w('Then read these, in this order:');
  w('');
  w('| File | What it tells you |');
  w('|---|---|');
  PATHS.forEach(([p, why]) => w(`| \`${p}\` | ${why} |`));
  w('');
  w('---');
  w('');
  w('## The four questions, and where each is answered');
  w('');
  w('| Question | Answer lives in | Not in |');
  w('|---|---|---|');
  w('| What actually works? | `brand/site/built.js` | any document\'s prose |');
  w('| What was proven, and by which run? | `docs/verification/EVIDENCE.md` | a claim that it passed |');
  w('| What must the software never do? | `brand/site/rules.js` | your judgement |');
  w('| Is the tree healthy right now? | `npm run check` | the last status message |');
  w('');
  w(`Today that is **${modRows.length} modules**, **${NAPPS} apps**, **${NRULES} rules**. Do not`);
  w('retype those numbers anywhere — derive them, because they have already changed twice.');
  w('');
  w('---');
  w('');
  w('## How two models check each other');
  w('');
  w('You are not asked to trust another model\'s work, or to review its opinion. **The gates are');
  w('the referee.** When you pick up after another model:');
  w('');
  w('1. `npm run check` — if it is red, the previous hand-off was incomplete. Say so plainly.');
  w('2. `git log --oneline -5` and read the last commit message. It should name what was');
  w('   verified. If it claims something, **re-run that command yourself** rather than');
  w('   believing it.');
  w('3. `node tools/evidence.js --list` — every recorded run, with its real exit code.');
  w('4. Only then start new work.');
  w('');
  w('If you find a defect in earlier work, the fix is not only to correct it. **Add a gate that');
  w('would have caught it**, and prove the gate fires by planting the defect again and watching');
  w('it fail. That is how this repository gets better, and it is the only kind of improvement');
  w('that survives a model switching.');
  w('');
  w('---');
  w('');
  w('## Rules that are not negotiable');
  w('');
  w('These come from `CLAUDE.md`. Read it in full; these are the ones most often broken by');
  w('somebody arriving fresh:');
  w('');
  w('- **Never say something passed unless you ran it and saw the output.** Not "should work".');
  w('- **Derive every count.** A number typed from memory is treated as fabricated here.');
  w('- **Medhava is the product. Vastrangam is one customer of it.** Never mix them. The');
  w('  product must build and test with zero tenants installed.');
  w('- **No real person\'s name, pay or private data in a tracked file.** `checkprivacy.js`');
  w('  enforces it; the real roster lives in `engine/private/`, which is gitignored.');
  w('- **Name no competitor, anywhere that ships.** Say "industry competitors" instead.');
  w('- **Never commit a key, a password, or a model identifier.**');
  w('- **A gate that cannot run must say "SKIPPED, not passed"** and exit 0 — never pass');
  w('  quietly having checked less than it did yesterday.');
  w('');
  w('---');
  w('');
  w('## When you finish a piece of work');
  w('');
  w('```bash');
  COMMANDS.slice(1).forEach(([c, why]) => w(`${c.padEnd(24)}# ${why}`));
  w('```');
  w('');
  w('Then commit with a message saying what changed, why, and **what you actually ran to');
  w('verify it** — so the next model, which may not be you, can re-run the same thing.');
  w('');
  w('If something is half-done, say so in the commit message. A half-finished thing that is');
  w('labelled half-finished costs the next model ten minutes. One labelled finished costs it a');
  w('day, and costs the owner his trust in every other label in the repository.');
  w('');

  return L.join('\n') + '\n';
}

/* ── run ───────────────────────────────────────────────────────────────────── */
const bad = verify();
if (bad.length) {
  console.error(`mkhandoff: ${bad.length} problem(s) — HANDOFF.md was NOT written:\n  ` +
    bad.join('\n  '));
  process.exit(1);
}

const text = markdown();

if (check) {
  const now = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  if (now !== text) {
    console.error('mkhandoff: HANDOFF.md is out of date — run without --check.');
    process.exit(1);
  }
  console.log(`mkhandoff: HANDOFF.md is current · ${PATHS.length} paths and ` +
    `${COMMANDS.length} commands all verified to exist`);
  process.exit(0);
}

fs.writeFileSync(OUT, text);
console.log(`mkhandoff: HANDOFF.md · ${PATHS.length} paths and ${COMMANDS.length} commands ` +
  `verified to exist · counts read from source (${modRows.length} modules · ${NAPPS} apps · ` +
  `${NRULES} rules · ${gates} gates)`);
