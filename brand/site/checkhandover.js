'use strict';
/* THE HANDOVER PACK, CHECKED — because this one is read by somebody who cannot check it.
 *
 *   node brand/site/checkhandover.js
 *   node brand/site/checkhandover.js --summary
 *
 * WHY THIS GATE MATTERS MORE THAN THE OTHERS
 * Every other document here is read by whoever builds the platform. If it sends them to a
 * file that does not exist they notice in seconds and are mildly annoyed. These four are
 * read by the owner, who said plainly he cannot follow the technical parts — so a step
 * pointing at a missing document, or quoting a command that is not real, does not annoy
 * him. It stops him, and he has no way to tell whether the fault is his.
 *
 * WHAT IS CHECKED
 *   1 · both registers' own shape            setup.js and handover.js check()
 *   2 · every document a step points at      exists on disk
 *   3 · every command quoted in the pack     is a real npm script or a real file
 *   4 · every step and stage                 says how you know it worked
 *   5 · every figure in the documents        matches the register it came from
 *   6 · the pack names no customer           it is the product's handover
 *
 * RULE 3 IS THE ONE WITH TEETH. A command in a document read by somebody who cannot debug
 * it is either exactly right or worse than useless. Each one is resolved against
 * package.json or the filesystem — not eyeballed.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const SETUP = require('./setup.js');
const HANDOVER = require('./handover.js');
const TOOLS = require('./tools.js');
const MODULES = require('./modules.js');
const REGISTRY = require('./registry.js');
const AUDIT = require('./audit.js');
const RULES = require('./rules.js');
const { TRADE_WORDS } = require('./checkneutral.js');

const summary = process.argv.includes('--summary');
let failures = 0;
const fail = (m) => { failures++; console.error('checkhandover: ' + m); };

const toolRows = Array.isArray(TOOLS) ? TOOLS : Object.values(TOOLS).find(Array.isArray);
const ROWS = REGISTRY.rows(MODULES);
const ids = new Set(ROWS.map((r) => r.id));

const DOCS = ['START_HERE_OWNER.md', 'SETUP_CHECKLIST.md',
  'SEVEN_STAGE_ROADMAP.md', 'WORKING_WITH_AI_TOOLS.md'];

/* ── 1 · the registers' own shape ─────────────────────────────────────────── */
SETUP.check(toolRows).forEach((b) => fail(`setup.js — ${b}`));
HANDOVER.check(ids).forEach((b) => fail(`handover.js — ${b}`));

/* ── 2 · every document pointed at exists ─────────────────────────────────── */
[...SETUP.STEPS, ...HANDOVER.STAGES].forEach((s) => {
  const where = s.title;
  if (!fs.existsSync(path.join(ROOT, s.see))) {
    fail(`"${where}" sends the reader to ${s.see}, which does not exist. He cannot tell ` +
      `whether the file is missing or he has done something wrong, so he stops.`);
  }
});

/* ── 3 · every command quoted is real ─────────────────────────────────────── */
/* Commands appear in the generated documents as `backticked` text. The ones worth checking
   are the ones a reader would actually type: an npm script, or `node <file>`. Anything else
   in backticks is a filename or a term, and is checked by rule 2 or not at all. */
const scripts = new Set(Object.keys(require(path.join(ROOT, 'package.json')).scripts || {}));
const seenCommands = new Set();

DOCS.forEach((d) => {
  const file = path.join(ROOT, d);
  if (!fs.existsSync(file)) {
    fail(`${d} has not been generated — run node brand/delivery/website/mkhandover.js`);
    return;
  }
  const text = fs.readFileSync(file, 'utf8');

  [...text.matchAll(/`npm run ([a-z:]+)`/g)].forEach((m) => {
    seenCommands.add(`npm run ${m[1]}`);
    if (!scripts.has(m[1])) {
      fail(`${d} tells the reader to run \`npm run ${m[1]}\`, and package.json has no such ` +
        `script. He would type it, see an error he cannot read, and stop.`);
    }
  });
  [...text.matchAll(/`npm (test|ci|start)`/g)].forEach((m) => {
    seenCommands.add(`npm ${m[1]}`);
    if (m[1] !== 'ci' && !scripts.has(m[1])) {
      fail(`${d} quotes \`npm ${m[1]}\`, which package.json does not define`);
    }
  });
  [...text.matchAll(/`node ([\w./-]+\.js)([^`]*)`/g)].forEach((m) => {
    seenCommands.add(`node ${m[1]}`);
    if (!fs.existsSync(path.join(ROOT, m[1]))) {
      fail(`${d} tells the reader to run \`node ${m[1]}\`, and that file does not exist`);
    }
  });

  /* ── 6 · the product's handover names no customer ─────────────────────────
     SEVEN_STAGE_ROADMAP and the checklist are the product's, and a trade word in them
     would say the product is one customer's. The owner's own name for his business belongs
     in the tenant documents, which have their own generator. */
  const found = TRADE_WORDS.filter((word) =>
    new RegExp('\\b' + word.replace(/ /g, '\\s+'), 'i').test(text));
  if (found.length) {
    fail(`${d} names ${found.join(', ')}. This pack hands over the PRODUCT, and the ` +
      `product ships with no customer inside it.`);
  }
});

/* ── 4 · every step says how you know it worked ───────────────────────────── */
[...SETUP.STEPS, ...HANDOVER.STAGES].forEach((s) => {
  if (!s.done_when || s.done_when.length < 40) {
    fail(`"${s.title}" does not say how the reader knows it worked. Without that he cannot ` +
      `tell whether to move on, and the only honest thing he can do is ask somebody.`);
  }
  /* AND IT MUST BE ANSWERABLE YES OR NO. "It is working well" is not a condition, it is a
     mood, and a reader who cannot check the technical part has nothing to weigh it against. */
  if (/\b(properly|correctly|as expected|working well|fine)\b/i.test(s.done_when)) {
    fail(`"${s.title}" says it is done when something works "${
      (s.done_when.match(/\b(properly|correctly|as expected|working well|fine)\b/i) || [])[0]
    }". That is a matter of opinion. It has to be a thing he can observe and answer yes or no to.`);
  }
});

/* ── 5 · every figure matches its register ────────────────────────────────── */
const start = path.join(ROOT, 'START_HERE_OWNER.md');
if (fs.existsSync(start)) {
  const text = fs.readFileSync(start, 'utf8');
  const apps = ROWS.filter((r) => r.kind === 'app');
  const expect = [
    [`| Apps designed | ${apps.length} |`, 'the app count'],
    [`| Rules written | ${RULES.length} |`, 'the rule count'],
    [`| Rules proven by a test | ${RULES.filter((r) => r.state === 'ENFORCED').length} |`,
      'the enforced-rule count'],
    [`| Overall score, out of 5 | **${AUDIT.score(ROWS).mean}** |`, 'the score'],
    [`| Maturity | **Level ${AUDIT.MATURITY.level} — ${AUDIT.MATURITY.name}** |`,
      'the maturity level'],
  ];
  expect.forEach(([needle, what]) => {
    if (!text.includes(needle)) {
      fail(`START_HERE_OWNER.md does not state ${what} as the register currently reads it. ` +
        `Regenerate it — a handover that overstates what exists is the one lie this whole ` +
        `project was rebuilt to make impossible.`);
    }
  });
}

/* ── result ───────────────────────────────────────────────────────────────── */
if (failures) {
  console.error(`\ncheckhandover: ${failures} problem(s) across ${DOCS.length} document(s).`);
  process.exit(1);
}
console.log(`checkhandover: the handover pack is sound — ${SETUP.STEPS.length} setup steps ` +
  `and ${HANDOVER.STAGES.length} stages, every document they point at exists, every command ` +
  `they quote is real, every step says how you know it worked, no customer named`);

if (summary) {
  console.log('');
  console.log('  What the owner is told to buy, in order:');
  SETUP.STEPS.forEach((s) => {
    const t = s.tool ? toolRows.find((x) => x.id === s.tool) : null;
    const free = t ? (/^none/i.test(t.free) ? 'NO FREE OPTION' : 'free option exists') : '—';
    console.log(`    ${s.n}  ${s.title.padEnd(58)} ${free}`);
  });
  console.log('');
  console.log('  Who does each of the seven stages:');
  HANDOVER.STAGES.forEach((s) => {
    console.log(`    ${s.n}  ${s.title.padEnd(46)} ${s.who.split('.')[0]}`);
  });
  console.log('');
  console.log(`  ${seenCommands.size} distinct command(s) quoted across the pack, every one`);
  console.log('  resolved against package.json or the filesystem:');
  [...seenCommands].sort().forEach((c) => console.log(`    ${c}`));
  console.log('');
}
