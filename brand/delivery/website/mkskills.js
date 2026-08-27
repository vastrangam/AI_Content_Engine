'use strict';
/* THE TWO SKILLS — an agent opens one and can start.
 *
 *   node brand/delivery/website/mkskills.js            → both
 *   node brand/delivery/website/mkskills.js --check    → prove they are current and gated
 *
 * WHAT THESE ARE FOR
 * The owner is going to hand this repository to Claude Code and to Codex, run both against the
 * same specification, and compare which builds it better. A skill is what makes that a fair
 * test: both agents open the same file, in the same order, with the same checks. If the skill
 * leaves something to interpretation, the two builds differ for a reason that has nothing to do
 * with either agent, and the comparison measures the skill.
 *
 * WHAT IS GATED HERE, AND WHY IT IS GATED HERE RATHER THAN IN skills.js
 * skills.js is data and checks its own shape. Whether the things it names actually EXIST needs
 * the filesystem and package.json, so it belongs in the generator:
 *
 *   · every document, source file and fixture named must be a real path
 *   · every command named must really run — an npm script that is in package.json, or a
 *     node/python file that is on disk
 *   · every count must be derived, so the output carries none that were typed
 *
 * The failure mode of a skill is not being wrong. It is being confidently specific about a file
 * that is not there: an agent spends its first ten minutes on a path nobody checked, and there is
 * nothing in the output to tell it the fault is not its own. This refuses to write that.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

const { SKILLS, check: shapeCheck } = require(path.join(SITE, 'skills.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const RULES = require(path.join(SITE, 'rules.js'));
const { LAYERS } = require(path.join(SITE, 'stack.js'));
const DYN = require(path.join(SITE, 'dynamic.js'));
const FMT = require(path.join(SITE, 'guidefmt.js'));
const PKG = require(path.join(ROOT, 'package.json'));

const checkOnly = process.argv.includes('--check');

/* ── every count, derived ────────────────────────────────────────────────── */
const NMOD = MODULES.length;
const NAPP = MODULES.reduce((s, m) => s + m.apps.length, 0);
const NRULES = RULES.length;
const NLAYER = LAYERS.length;
const NSWAP = LAYERS.reduce((s, l) => s + (l.swaps || []).length, 0);
const NDYN = DYN.ENTRIES.length;
const NFIXED = DYN.IMMUTABLE.length;
const NPACK = fs.readdirSync(path.join(ROOT, 'core', 'packs')).filter((f) => f.endsWith('.json')).length;
const NTABLE = (() => {
  const sql = fs.readFileSync(path.join(ROOT, 'core', 'schema.postgres.sql'), 'utf8');
  return new Set([...sql.matchAll(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+([a-z_][a-z0-9_]*)/gi)]
    .map((m) => m[1].toLowerCase())).size;
})();

/* ── is a command real? ──────────────────────────────────────────────────── */
/* Three shapes are allowed, and each is verifiable:
     npm test / npm run <name>   → the script must be in package.json
     node <path> [args]          → the file must be on disk
     python3 <path> [args]       → the file must be on disk
   Anything else is refused rather than guessed at, because a command this file cannot verify is
   exactly the kind that reaches an agent and fails. */
function badCommand(cmd) {
  const parts = cmd.trim().split(/\s+/);
  const [bin, a, b] = parts;
  if (bin === 'npm') {
    const script = a === 'run' ? b : a;
    if (!script) return 'names no npm script';
    if (!(script in (PKG.scripts || {}))) return `npm script "${script}" is not in package.json`;
    return null;
  }
  if (bin === 'node' || bin === 'python3') {
    if (!a) return `${bin} with no file`;
    if (!fs.existsSync(path.join(ROOT, a))) return `${a} does not exist`;
    return null;
  }
  return `"${bin}" is not npm, node or python3 — this file cannot verify it, so it cannot ship it`;
}

/* ── the gate ────────────────────────────────────────────────────────────── */
function gate() {
  const bad = shapeCheck();

  for (const s of SKILLS) {
    const named = [
      ...(s.reading || []).map(([f]) => ['reading', f]),
      ...(s.sources || []).map(([f]) => ['sources', f]),
    ];
    for (const [where, f] of named) {
      if (!fs.existsSync(path.join(ROOT, f))) {
        bad.push(`${s.name}: ${where} names ${f}, which does not exist. An agent would spend its ` +
          `first ten minutes on a path nobody checked.`);
      }
    }
    for (const p of s.order || []) {
      /* A phase with NO command has already been reported by the shape check, and asking
         badCommand() about it threw a TypeError — so the gate crashed on exactly the input it
         exists to reject, printing a stack trace instead of the sentence that says what to fix.
         A gate that dies on bad input has not rejected it; it has failed. Found by planting a
         phase with its command removed. */
      if (!p.check) continue;
      const why = badCommand(p.check);
      if (why) bad.push(`${s.name} phase ${p.n}: the command that decides it ${why}\n      ${p.check}`);
    }
  }
  return bad;
}

/* ── the document ────────────────────────────────────────────────────────── */
function render(s) {
  const out = [];

  /* The front matter is what a runtime reads to decide whether to invoke this at all. Keep it to
     the two fields every skill format agrees on. */
  out.push('---');
  out.push(`name: ${s.name}`);
  out.push(`description: ${s.description}`);
  out.push('---', '');

  out.push(`# ${s.title}`, '');
  out.push(s.what, '');

  out.push('## The scale of it, read from the source', '');
  out.push(`Every figure below is read from this repository when this file is generated. **Do not ` +
    `copy one into code or into a document** — read it the same way, at the moment you need it. Two ` +
    `counts here went stale exactly by being typed once.`, '');
  out.push(FMT.table({
    head: ['What', 'How many', 'Read it from'],
    rows: [
      ['Modules', String(NMOD), '`brand/site/modules.js`'],
      ['Apps across them', String(NAPP), '`brand/site/modules.js`'],
      ['Rules the system must satisfy', String(NRULES), '`brand/site/rules.js`'],
      ['Tables in the schema', String(NTABLE), '`core/schema.postgres.sql`'],
      ['Technical layers', String(NLAYER), '`brand/site/stack.js`'],
      ['Named alternatives between them', String(NSWAP), '`brand/site/stack.js`'],
      ['Things a business changes itself', String(NDYN), '`brand/site/dynamic.js`'],
      ['Things nobody may switch off', String(NFIXED), '`brand/site/dynamic.js`'],
      ['Industry packs shipped', String(NPACK), '`core/packs/`'],
    ],
  }, (x) => x), '');

  out.push('## Read these, in this order', '');
  out.push(FMT.table({
    head: ['Document', 'What it answers'],
    rows: (s.reading || []).map(([f, what]) => ['`' + f + '`', what]),
  }, (x) => x), '');

  out.push('## Where the truth lives', '');
  out.push('Never restate one of these from memory. Read it.', '');
  out.push(FMT.table({
    head: ['File', 'What it holds'],
    rows: (s.sources || []).map(([f, what]) => ['`' + f + '`', what]),
  }, (x) => x), '');

  out.push('## The order of work', '');
  out.push(`Each phase has a **command that decides it**, not a judgement. A phase is finished when ` +
    `its command passes — never when the code is written.`, '');
  for (const p of s.order) {
    out.push(`### ${p.n} · ${p.title}`, '');
    out.push(p.do, '');
    out.push('**Check it:**', '', '```bash', p.check, '```', '');
    out.push(`**Done when:** ${p.done}`, '');
  }

  out.push('## When a value you need is missing', '');
  out.push(s.missing, '');

  out.push('## Never', '');
  s.never.forEach((n, i) => out.push(`${i + 1}. ${n}`));
  out.push('');

  out.push('## Before you say it is finished', '');
  out.push(`Run the whole suite, and report what it actually printed:`, '');
  out.push('```bash', 'npm test', '```', '');
  out.push(`If something failed, say so and show the output. If a step was skipped, name it. **A ` +
    `passing run you did not perform is the one thing that makes everything else here worthless** — ` +
    `every gate in this repository exists because something got through on somebody’s word.`, '');

  out.push('---', '');
  out.push(`*Generated by \`brand/delivery/website/mkskills.js\` from \`brand/site/skills.js\`. Every ` +
    `path and every command above is checked to exist before this file is written, and every count ` +
    `is read from its canonical source at generation time.*`);

  return out.join('\n') + '\n';
}

/* ── run ─────────────────────────────────────────────────────────────────── */
const bad = gate();
if (bad.length) {
  console.error(`mkskills: ${bad.length} problem(s). Refusing to write.\n`);
  bad.forEach((b) => console.error('  · ' + b));
  process.exit(1);
}

let stale = 0;
for (const s of SKILLS) {
  const doc = render(s);
  const file = path.join(ROOT, s.file);
  if (checkOnly) {
    const now = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (now !== doc) { console.error(`mkskills: ${s.file} is out of date — run without --check`); stale++; }
  } else {
    fs.writeFileSync(file, doc);
    console.log(`${s.file} written: ${Math.round(Buffer.byteLength(doc) / 1024)}KB · ` +
      `${s.order.length} phases · ${s.reading.length} documents · ${s.sources.length} sources · ` +
      `${s.never.length} things it must never do`);
  }
}
if (stale) process.exit(1);

const paths = SKILLS.reduce((n, s) => n + s.reading.length + s.sources.length, 0);
const cmds = SKILLS.reduce((n, s) => n + s.order.length, 0);
console.log(`mkskills: ${SKILLS.length} skills · ${paths} paths and ${cmds} commands all verified ` +
  `to exist · no count typed`);
