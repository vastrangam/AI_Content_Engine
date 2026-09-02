'use strict';
/* THE REQUIREMENTS REGISTRY — what is standing up, what is written down, and what proves it.
 *
 *   node brand/delivery/website/mkregistry.js
 *   node brand/delivery/website/mkregistry.js --check     → current and idempotent?
 *
 * WRITES TWO FILES FROM ONE REGISTER
 *   REQUIREMENTS_REGISTRY.md    for a person
 *   docs/truth/requirements.json  for a machine — a build queue, a dashboard, the next agent
 *
 * Both come from registry.js in the same pass. Two files that answer the same question from
 * two sources will disagree, and the day they do the wrong one is already in somebody's hand.
 *
 * WHY THE PRODUCT ONLY, AND NO TRADE EDITION
 * This measures Medhava's own build state. A customer's engine has its own tests and its own
 * evidence, and mixing the two is how a tenant's 397 passing checks end up flattering the
 * product's two working apps. The gate refuses a trade word in this document for that reason.
 *
 * NOTHING HERE IS TYPED
 * Every status, count, file path and command is read from registry.js, modules.js, built.js
 * and docs/verification/EVIDENCE.md at generation time. The one thing this file contains of
 * its own is the prose explaining what a rung means — and that prose is a definition, not a
 * measurement.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

const REG = require(path.join(SITE, 'registry.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const BUILT = require(path.join(SITE, 'built.js'));
const EVID = require(path.join(ROOT, 'tools', 'evidence.js'));
/* The shared register renderers — the same ones the plan, the guide and the roadmap use.
   A private glossary here is how two documents start explaining the same word differently. */
const RENDER = require(path.join(SITE, 'registers.js'));

const checkOnly = process.argv.includes('--check');
const MD = path.join(ROOT, 'REQUIREMENTS_REGISTRY.md');
const JSONF = path.join(ROOT, 'docs', 'truth', 'requirements.json');

const ALL = REG.rows(MODULES);
const TALLY = REG.tally(ALL);
const RUNS = EVID.entries();
const PASSING = new Set(RUNS.filter((e) => e.exit_code === 0).map((e) => e.command));

/* ── what each rung costs to claim, in one place ──────────────────────────── */
const LADDER = [
  ['NOT STARTED', 'Nothing exists. A row here may cite no file at all — a status carrying ' +
    'a path is not "not started", and the gate refuses the pair.'],
  ['SPECIFIED', 'Written down in a register somebody can read. Every app in the module list ' +
    'is at least this, which is why it is the floor and not an achievement.'],
  ['DESIGNED', 'Specified, and the decision is argued somewhere with what would make it ' +
    'wrong — an architecture note, a stack layer, or a rule carrying its “never”.'],
  ['IMPLEMENTED', 'Code exists and runs. Tests may exist; they are not in the gated suite, ' +
    'so nothing would notice if they broke.'],
  ['TESTED', 'An automated test drives it, passes, runs inside `npm test`, **and that run ' +
    'is recorded in `docs/verification/EVIDENCE.md` with exit 0**. Three conditions, all ' +
    'checked by a gate. “There is a test file” earns IMPLEMENTED, not this.'],
  ['VERIFIED', 'Tested, and additionally checked against a source outside this repository. ' +
    'Nothing here is at this rung, and the gate refuses to let anything be put there. That ' +
    'is not modesty: the one time an engine in this project was checked against an outside ' +
    'document, the document found a defect that hundreds of internal checks had agreed with.'],
  ['PRODUCTION-READY', 'Deployed, reachable and smoke-tested there. Nothing is here either, ' +
    'and nothing can be until something is actually deployed somewhere.'],
  ['BLOCKED', 'Cannot proceed, and the row names by what. A blocker naming no obstacle is ' +
    'refused.'],
  ['DEPRECATED', 'Was real, is being withdrawn.'],
];

/* ── the document ─────────────────────────────────────────────────────────── */
const esc = (s) => String(s).replace(/\|/g, '\\|');
const L = [];
const w = (s) => L.push(s);

w('# Requirements registry');
w('');
w('One row per capability, the rung it has reached, and the thing that proves it.');
w('');
w('This exists because the honest answer to “how much of this works” used to live in a');
w('sentence rather than in the repository. Twice in one session that sentence was wrong in');
w('a way nothing could contradict — a claim that there was no continuous integration while');
w('the workflow file sat in the tree, and an archive reported at a size and file count that');
w('were both read off the wrong line. A row here is a claim with a receipt attached, and');
w('`node brand/site/checkregistry.js` refuses the claim when the receipt is missing.');
w('');
w('**Nothing in this document is typed.** Every status, path, command and count is read');
w('from `brand/site/registry.js`, `brand/site/modules.js`, `brand/site/built.js` and');
w('`docs/verification/EVIDENCE.md` when it is generated. Regenerate with');
w('`node brand/delivery/website/mkregistry.js`.');
w('');
w('---');
w('');

w('## Where the project actually stands');
w('');
w('| Rung | Rows |');
w('|---|---:|');
REG.STATUSES.forEach((s) => { if (TALLY[s]) w(`| ${s} | ${TALLY[s]} |`); });
w(`| **Total** | **${ALL.length}** |`);
w('');
const empty = REG.STATUSES.filter((s) => !TALLY[s]);
w(`No row sits at ${empty.join(', ')}. VERIFIED and PRODUCTION-READY are empty **by rule** —`);
w('the gate refuses either one, because neither can be earned from inside a repository that');
w('has never been deployed or checked against anything outside itself.');
w('');
const apps = ALL.filter((r) => r.kind === 'app');
const tested = apps.filter((r) => r.status === 'TESTED');
w(`Of ${apps.length} apps, **${tested.length} have a recorded passing test** and`);
w(`${apps.filter((r) => r.status === 'IMPLEMENTED').length} are implemented without one.`);
w(`The remaining ${apps.filter((r) => r.status === 'SPECIFIED').length} are specified: written`);
w('down in full, and not standing up.');
w('');
w('---');
w('');

w('## What each rung costs to claim');
w('');
LADDER.forEach(([s, why]) => { w(`**${s}** — ${why}`); w(''); });
w('---');
w('');

w('## The evidence behind every TESTED row');
w('');
w('Each command below was run through `tools/evidence.js`, which records the exit code the');
w('process returned, the commit, whether the tree was dirty, and the SHA-256 of the files');
w('the run was about. `node tools/evidence.js --check` re-runs them all and reports where a');
w('result has moved.');
w('');
/* ONLY THE COMMANDS ROWS ACTUALLY REST ON, not the whole log. Listing every recorded run
   made this document change whenever anything at all was recorded, so recording a run
   through the evidence tool left the generated file stale and failed the next suite run —
   a document that invalidates itself as a side effect of using the tool it documents. The
   full log lives in docs/verification/EVIDENCE.md and is the place to read all of it. */
const CITED = [...new Set(ALL.map((r) => r.run).filter(Boolean))].sort();
w('| Command | Recorded exit | Rows resting on it |');
w('|---|---:|---:|');
CITED.forEach((cmd) => {
  const n = ALL.filter((r) => r.run === cmd).length;
  const rec = RUNS.filter((e) => e.command === cmd);
  const best = rec.some((e) => e.exit_code === 0) ? 0
    : (rec.length ? rec[rec.length - 1].exit_code : null);
  w(`| \`${esc(cmd)}\` | ${best === null ? '**never run**' : (best === 0 ? '0' : `**${best}**`)} | ${n} |`);
});
w('');
w('These are the commands a row in this document depends on. The log holds other runs');
w('besides — read `docs/verification/EVIDENCE.md` for all of them. Their number is left out');
w('of this document on purpose: it changes every time anything is recorded, and a generated');
w('file that goes stale as a side effect of using the tool it documents fails the build for');
w('a reason that has nothing to do with what it says.');
w('');
w('---');
w('');

w('## Capabilities that are not apps');
w('');
w('A registry of apps alone would report this project as far healthier than it is. It would');
w('never mention that nothing is deployed, that no outside integration is live, or that');
w('three whole product surfaces have not been started. Those sit in the same table, held to');
w('the same rung definitions.');
w('');
ALL.filter((r) => r.kind === 'capability').forEach((r) => {
  w(`### ${r.id} · ${r.name}`);
  w('');
  w(`**${r.status}**`);
  w('');
  if (r.files.length) {
    w('Files: ' + r.files.map((f) => `\`${f}\``).join(' · '));
    w('');
  }
  if (r.run) {
    w(`Proven by: \`${r.run}\` — recorded at exit 0.`);
    w('');
  }
  if (r.note) { w(r.note); w(''); }
  if (r.blocker) { w(`**Blocked by:** ${r.blocker}`); w(''); }
});
w('---');
w('');

w('## Every app, by module');
w('');
w('In the order the module list gives them. Re-ordering a sequence somebody specified is a');
w('second opinion nobody asked for.');
w('');
MODULES.forEach((m) => {
  const rs = ALL.filter((r) => r.module === m.n);
  const up = rs.filter((r) => r.status !== 'SPECIFIED').length;
  w(`### Module ${m.n} · ${m.name}`);
  w('');
  w(`${rs.length} app(s) · ${up} above SPECIFIED`);
  w('');
  w('| ID | App | Status | Proven by | What the rung does not mean |');
  w('|---|---|---|---|---|');
  rs.forEach((r) => {
    w(`| \`${r.id}\` | ${esc(r.name)} | ${r.status} | ` +
      `${r.run ? '`' + esc(r.run) + '`' : (r.files.length ? '`' + esc(r.files[0]) + '`' : '—')} | ` +
      `${r.note ? esc(r.note) : (r.blocker ? esc(r.blocker) : 'Specified in the module register; not standing up.')} |`);
  });
  w('');
});
w('---');
w('');
w('## How to change a row in this table');
w('');
w('Not by editing this file — it is generated and overwritten. Edit `brand/site/registry.js`,');
w('then run `node brand/site/checkregistry.js`. Raising a row to TESTED requires the command');
w('to appear in `docs/verification/EVIDENCE.md` at exit 0, which requires actually running it');
w('through `node tools/evidence.js`. There is no path from here to a higher rung that does not');
w('go through a command that really ran.');
w('');

/* ── every technical word this document uses ──────────────────────────────────
 * `only:` renders the words this text actually uses, carried to a fixed point so the
 * definitions' own vocabulary is covered too. A short document does not owe the reader all
 * forty terms; it owes an explanation of every one it used. Padding it with definitions of
 * words it never mentions would raise the coverage number and lower the document's worth,
 * which is the exact trade these gates exist to refuse. */
const body = L.join('\n');
const gloss = RENDER.glossarySection({ only: body, heading: '###' });
if (gloss) {
  L.push('---');
  L.push('');
  L.push('## Every technical word above, in plain language');
  L.push('');
  L.push(gloss);
}

const doc = L.join('\n');

/* ── the machine-readable half ────────────────────────────────────────────── */
const json = JSON.stringify({
  generated_from: 'brand/site/registry.js',
  regenerate_with: 'node brand/delivery/website/mkregistry.js',
  gate: 'node brand/site/checkregistry.js',
  statuses: REG.STATUSES,
  status_requires_file: REG.NEEDS_FILE,
  status_requires_recorded_run: REG.NEEDS_RUN,
  tally: TALLY,
  evidence_log: 'docs/verification/EVIDENCE.md',
  /* The commands rows depend on, not every command ever recorded — see the note beside the
     same table in the markdown. */
  commands_rows_depend_on: CITED,
  rows: ALL,
}, null, 2) + '\n';

/* ── write, or prove current ──────────────────────────────────────────────── */
if (checkOnly) {
  let stale = 0;
  const cmp = (file, want) => {
    const now = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (now !== want) {
      console.error(`mkregistry: ${path.relative(ROOT, file)} is out of date — ` +
        `run without --check`);
      stale++;
    }
  };
  cmp(MD, doc);
  cmp(JSONF, json);
  if (stale) process.exit(1);
  console.log(`mkregistry: both outputs current — ${ALL.length} rows, ` +
    `${CITED.length} command(s) cited, ${RUNS.length} recorded in the log`);
} else {
  fs.mkdirSync(path.dirname(JSONF), { recursive: true });
  fs.writeFileSync(MD, doc);
  fs.writeFileSync(JSONF, json);
  console.log(`REQUIREMENTS_REGISTRY.md written: ${Math.round(Buffer.byteLength(doc) / 1024)}KB · ` +
    `${ALL.length} rows (${apps.length} apps + ${REG.CAPABILITIES.length} capabilities)`);
  console.log(`docs/truth/requirements.json written: ` +
    `${Math.round(Buffer.byteLength(json) / 1024)}KB`);
  REG.STATUSES.forEach((s) => { if (TALLY[s]) console.log(`  ${s.padEnd(18)} ${TALLY[s]}`); });
  console.log(`  ${BUILT.onDisk() === null ? 'browser build absent from this tree' :
    BUILT.onDisk() + ' browser app(s) built on disk here'} — informational, not a status`);
}
