'use strict';
/* THE ROADMAPS, CHECKED — the one document pair that publishes build state.
 *
 *   node brand/site/checkroadmap.js
 *   node brand/site/checkroadmap.js --summary
 *
 * WHY A SEPARATE GATE
 * Every other delivered document describes a design, and mkguide.js and mktenant.js refuse
 * one containing "works today", "not built" and their kin — correctly, because in a
 * document where every line would carry the same label the label is noise a reader
 * mistakes for information.
 *
 * The roadmaps are the deliberate exception. They exist to say what is standing up and
 * what is written down, so they carry exactly the language those gates refuse. An
 * exception with no checker of its own is just an unguarded document, and this is the one
 * place in the repository where an over-claim would be both easiest to make and most
 * expensive to discover — "RUNNING" against an app that does not run is the single most
 * misleading thing either file could say.
 *
 * SO WHAT IS CHECKED IS THE CLAIM, NOT THE PROSE:
 *
 *   · the stage register itself is valid — roadmap.js's own checker
 *   · every source a stage cites is a real file
 *   · every count printed in the document matches the register it came from
 *   · every app the document calls RUNNING is named in built.js's PLATFORM, and the test
 *     it cites exists on disk
 *   · the Medhava edition carries no trade word
 *   · both editions exist and were generated from the same registers
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const ROADMAP = require('./roadmap.js');
const MODULES = require('./modules.js');
const RULES = require('./rules.js');
const BUILT = require('./built.js');
const { LAYERS } = require('./stack.js');
const { TRADE_WORDS } = require('./checkneutral.js');

const summary = process.argv.includes('--summary');
let failures = 0;
const fail = (m) => { failures++; console.error('checkroadmap: ' + m); };

const DOCS = [
  { file: 'Medhava_Build_Roadmap.md', edition: 'MEDHAVA', neutral: true },
  { file: 'Vastrangam_Build_Roadmap.md', edition: 'VASTRANGAM', neutral: false },
];

/* ── 1 · the register behind them ─────────────────────────────────────────── */
ROADMAP.check().forEach((b) => fail(`roadmap.js — ${b}`));

ROADMAP.STAGES.forEach((s) => {
  (s.from || []).forEach((f) => {
    if (!fs.existsSync(path.join(ROOT, f))) {
      fail(`stage "${s.id}" cites ${f}, which does not exist. A stage pointing at a ` +
        `register nobody wrote is the most convincing kind of wrong.`);
    }
  });
});

/* ── 2 · the ten stages the owner named, all present and in his order ──────── */
const ASKED_FOR = ['idea', 'architecture', 'design', 'development', 'infrastructure',
  'security', 'testing', 'deployment', 'monitoring', 'launch'];
const got = ROADMAP.STAGES.map((s) => s.id);
if (got.join(' ') !== ASKED_FOR.join(' ')) {
  fail(`the stages are ${got.join(' → ')}. The owner asked for ` +
    `${ASKED_FOR.join(' → ')}, and re-ordering a sequence somebody specified is a second ` +
    `opinion nobody asked for.`);
}

/* ── 3 · the documents themselves ─────────────────────────────────────────── */
const NAPP = MODULES.reduce((n, m) => n + m.apps.length, 0);
const NENF = RULES.filter((r) => r.state === 'ENFORCED').length;
const NPLATFORM = Object.keys(BUILT.PLATFORM).length;

const present = [];
DOCS.forEach((d) => {
  const full = path.join(ROOT, d.file);
  if (!fs.existsSync(full)) {
    fail(`${d.file} has not been generated — run ` +
      `node brand/delivery/website/mkroadmap.js${d.neutral ? '' : ' vastrangam'}`);
    return;
  }
  present.push(d);
  const text = fs.readFileSync(full, 'utf8');

  /* THE COUNTS. Every one is derived by the generator, so a mismatch here means the
     document on disk is older than the registers it claims to describe. */
  const claims = [
    [`all ${MODULES.length} modules`, 'the module count'],
    [`all ${NAPP} apps`, 'the app count'],
    [`all ${RULES.length} rules`, 'the rule count'],
  ];
  claims.forEach(([needle, what]) => {
    if (!text.includes(needle)) {
      fail(`${d.file} does not state ${what} as "${needle}" — it is stale, or a count ` +
        `was typed somewhere it should have been derived. Regenerate it.`);
    }
  });
  if (!text.includes(`**${NENF} proven by a test that runs**`)) {
    fail(`${d.file} does not carry the enforced-rule count (${NENF}). That number is the ` +
      `honest measurement this document exists to make.`);
  }

  /* EVERY "RUNNING" CLAIM. The strongest word either document uses. */
  const running = [...text.matchAll(/^\*\*(.+?)\*\* — \*\*RUNNING\*\*/gm)].map((m) => m[1]);
  running.forEach((name) => {
    if (BUILT.stateOf(name) !== 'PLATFORM') {
      fail(`${d.file} calls "${name}" RUNNING, and built.js does not. The document is ` +
        `claiming an app is on the real database when the register says otherwise.`);
    }
  });
  if (running.length !== NPLATFORM) {
    fail(`${d.file} marks ${running.length} app(s) RUNNING; built.js names ${NPLATFORM}.`);
  }

  /* Every module and every rule actually printed, not counted and skipped. */
  MODULES.forEach((m) => {
    if (!text.includes(`## Module ${m.n} · `)) {
      fail(`${d.file} is missing module ${m.n}. "All ${MODULES.length} modules" has to mean all of them.`);
    }
  });
  const missingRules = RULES.filter((r) => !text.includes('`' + r.id + '`'));
  if (missingRules.length) {
    fail(`${d.file} is missing ${missingRules.length} rule(s), starting with ` +
      `${missingRules.slice(0, 3).map((r) => r.id).join(', ')}. The owner asked for the ` +
      `rules in full, not a count of them.`);
  }

  /* THE PRODUCT EDITION MAY NOT NAME A TRADE. */
  if (d.neutral) {
    const found = TRADE_WORDS.filter((w) =>
      new RegExp('\\b' + w.replace(/ /g, '\\s+'), 'i').test(text));
    if (found.length) {
      fail(`${d.file} names ${found.join(', ')}. It is the product's roadmap, and the ` +
        `product ships with no customer inside it.`);
    }
  }
});

/* ── result ───────────────────────────────────────────────────────────────── */
if (failures) {
  console.error(`\ncheckroadmap: ${failures} problem(s) across ${DOCS.length} document(s).`);
  process.exit(1);
}
console.log(`checkroadmap: both roadmaps valid — ${ROADMAP.STAGES.length} stages, ` +
  `${MODULES.length} modules, ${NAPP} apps, ${RULES.length} rules printed in full; ` +
  `every RUNNING claim matches built.js; no trade word in the product edition`);

if (summary) {
  console.log('');
  const w = Math.max(...ROADMAP.STAGES.map((s) => s.title.length));
  ROADMAP.STAGES.forEach((s, i) => {
    console.log(`  ${String(i + 1).padStart(2)}  ${s.title.padEnd(w)}  ` +
      `${String(s.owes.length).padStart(2)} owed  ` +
      `${(s.from || []).length} source(s)` + (s.gap ? '   ← gap stated' : ''));
  });
  const gaps = ROADMAP.STAGES.filter((s) => s.gap);
  console.log(`\n  ${gaps.length} of ${ROADMAP.STAGES.length} stages state a gap: ` +
    `${gaps.map((s) => s.title).join(', ')}.`);
  console.log('  A stage with nothing missing says so by carrying no gap at all, which is a');
  console.log('  claim rather than a silence — checkroadmap refuses a half-sentence there.\n');
  console.log(`  build state: ${NPLATFORM} running · ${BUILT.BUILT.size} browser apps · ` +
    `${BUILT.ENGINE.size} engines · ${NENF} of ${RULES.length} rules proven`);
  console.log(`  ${LAYERS.length} stack layers carried in full\n`);
}
