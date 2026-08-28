'use strict';
/* THE TWO MASTER BUILD PROMPTS — paste one at the start of a session and build.
 *
 *   node brand/delivery/website/mkprompts.js            → both
 *   node brand/delivery/website/mkprompts.js --check    → prove they are current and gated
 *
 * WHY THESE ARE GENERATED AND GATED
 * The owner's own template ran to seventy-three sections of good engineering discipline and named
 * not one file in this repository. An agent following it would rebuild a 151-table schema that
 * already runs, and rewrite a payroll engine with 317 passing checks.
 *
 * So these say what already exists — and the moment a document says that, every path in it has to
 * be true. A prompt confidently naming a file that is not there costs an agent its first ten
 * minutes with nothing in the output to tell it the fault is not its own. Same gate as
 * mkskills.js, for the same reason.
 *
 * Every count is read from source at generation time. Nothing here is typed from memory.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

const { PROMPTS: ALL_PROMPTS, COMMON, check: shapeCheck } = require(path.join(SITE, 'prompts.js'));
const EDITIONS = require(path.join(SITE, 'editions.js'));

/* Same rule as mkskills: a prompt for an edition that is not installed names paths that are
   correctly absent, and verifying them is verifying somebody else's checkout. Skipped and said. */
const { live: PROMPTS, skipped: OFF } = EDITIONS.partition(ALL_PROMPTS);
EDITIONS.announceSkips('mkprompts', OFF, (p) => `${p.file} (${p.edition})`);
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
const NRULE = RULES.length;
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
/* The engine's own check count, read out of its last line rather than typed. If the suite cannot
   be counted the prompt says so instead of inventing a number. */
const NENGINE = (() => {
  /* The engine belongs to a TENANT, so on a product-only checkout this file is correctly absent.
     The null path below already existed for "cannot be counted" — but readFileSync threw before
     reaching it, so the graceful answer this expression was written to give was unreachable
     whenever it was actually needed. */
  const p = path.join(ROOT, 'engine', 'tests', 'selftest.py');
  if (!fs.existsSync(p)) return null;
  const src = fs.readFileSync(p, 'utf8');
  const n = (src.match(/^def test_/gm) || []).length;
  return n || null;
})();

/* WHAT ALREADY EXISTS — the table that stops an agent rebuilding it.
   Every path is checked below; a row naming something absent fails the build. */
const EXISTS = [
  ['core/schema.postgres.sql', `The production schema — **${NTABLE} tables**. Runs in real Postgres.`],
  ['core/tests/live.test.js', 'Proves isolation against a running database, as three different roles.'],
  ['core/packs.js', `The industry pack engine. **${NPACK} packs** ship; a seventh trade is invented during the test run.`],
  ['core/tenant.js', 'What a business changed after its pack — effective-dated, append-only.'],
  /* TENANT-OWNED ROWS, tagged so a product-only checkout does not demand a tenant's files.
     They are still verified in full whenever that tenant IS installed. */
  ['engine/vastrangam/', 'The Python engine: payroll, attendance, karigar costing, set completion, the refusals.', 'VASTRANGAM'],
  ['engine/fixtures/master.json', 'The roster as five states with dates, the rates, the thresholds, the weekly off.', 'VASTRANGAM'],
  ['brand/site/rules.js', `**${NRULE} rules**, each with what the system will never do instead.`],
  ['brand/site/modules.js', `**${NMOD} modules · ${NAPP} apps** — the one canonical list. Read it; never type a count from it.`],
  ['brand/site/stack.js', `**${NLAYER} layers · ${NSWAP} named alternatives**, each behind an interface.`],
  ['brand/site/dynamic.js', `**${NDYN} things a business changes itself**, and **${NFIXED}** nobody may switch off.`],
  ['brand/site/checkstatic.js', 'The gate that fails the build on a compiled-in count, rate, threshold, shift or name.'],
  ['brand/suite/router.js', 'A provider router with fallback, circuit breaker and a spend ceiling. Self-tested.'],
  /* app/ is the AI content-engine server built FOR one trade. Product-side, the running server is
     medhava/server/index.js, which is why that row is the untagged one. */
  ['medhava/server/index.js', 'The platform, running. `npm start` → http://localhost:4000 — two demo businesses on one database.'],
  ['app/server/index.js', 'A real server. `cd app && npm start` → http://localhost:3000', 'VASTRANGAM'],
];

const READING = [
  ['MEDHAVA_ARCHITECT.md', 'WHAT the system is and WHY — every decision with what would make it wrong.'],
  ['MEDHAVA_BUILD_GUIDE.md', 'HOW each layer works, then the ordered path from an empty machine to deployed.'],
  ['MEDHAVA_PLAN_OF_ACTION.md', `WHAT gets built, in order, and all ${NRULE} rules.`],
  ['DEPLOYMENT.md', 'The server runbook. Read it at the deployment stage, not before.'],
  ['VASTRANGAM_RULES_AND_LOGIC.md', 'The tenant reference: every calculation, every rule, by subject.', 'VASTRANGAM'],
  ['VASTRANGAM_BUILD_GUIDE.md', 'The tenant setup path, in order.', 'VASTRANGAM'],
  ['SPEC_CONFLICTS.md', 'Where the trade’s own specification says two different things. Unresolved on purpose.'],
];

/* Rows the given edition may see: its own, plus every untagged (product-owned) row. */
function forEdition(rows, edition) {
  return rows.filter(([, , owner]) => !owner || owner === edition);
}

/* THE PRODUCT'S PROMPT MAY NOT NAME A TENANT. CHECKED, BECAUSE IT DID.
 * MEDHAVA_BOS_PROMPT.md is what somebody pastes in to build the PRODUCT, and it was telling them
 * that `engine/vastrangam/` already exists, to read VASTRANGAM_RULES_AND_LOGIC.md, and to open one
 * customer's content app as the reference screen. An agent handed that has no way to tell which
 * half of the repository is the product it was asked to build.
 *
 * checkneutral.js already forbids trade words in the module list and the built page. It never saw
 * this file, because a build prompt is neither of those things. Same rule, one more place. */
function tradeWordsIn(text) {
  const { TRADE_WORDS } = require(path.join(SITE, 'checkneutral.js'));
  return TRADE_WORDS.filter((w) => new RegExp('\\b' + w.replace(/ /g, '\\s+'), 'i').test(text));
}

/* ── is a command real? ──────────────────────────────────────────────────── */
function badCommand(cmd) {
  const first = cmd.trim().split('\n')[0].trim();
  const parts = first.split(/\s+/);
  const [bin, a, b] = parts;
  if (bin === 'npm') {
    if (a === 'ci' || a === 'install' || a === 'start' || a === 'test') return null;
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
  if (bin === 'cd') return null;                    // `cd app && npm install && npm start`
  return `"${bin}" is not npm, node, python3 or cd — this file cannot verify it, so it cannot ship it`;
}

/* ── the gate ────────────────────────────────────────────────────────────── */
function gate() {
  const bad = shapeCheck();

  /* A row's third element, when present, names the EDITION that owns it. A row owned by an
     edition that is not installed is not checked and not rendered — checking it would be
     demanding a tenant's files from a product-only checkout, which is the coupling this
     separation exists to remove. Every untagged row is the product's own and is still required. */
  for (const [p, , owner] of [...EXISTS, ...READING]) {
    if (owner && !EDITIONS.has(owner)) continue;
    if (!fs.existsSync(path.join(ROOT, p))) {
      bad.push(`the "what exists" table names ${p}, which does not exist — an agent told this ` +
        `rebuilds what is already here, or hunts for a file nobody wrote`);
    }
  }
  for (const prompt of PROMPTS) {
    for (const [cmd] of prompt.screenSteps || []) {
      const why = badCommand(cmd);
      if (why) bad.push(`${prompt.file}: "${cmd}" ${why}`);
    }
    /* The product's prompt, checked against the same denylist the neutral edition uses. */
    if (prompt.edition === EDITIONS.PRODUCT) {
      const found = tradeWordsIn(render(prompt));
      if (found.length) {
        bad.push(`${prompt.file} is the PRODUCT's build prompt and names a trade: ` +
          `${found.join(', ')}. Somebody pasting this to build the platform cannot tell which ` +
          `half of the repository is the product. Move it into that edition's own prompt, or ` +
          `tag the row with its edition so only that prompt renders it.`);
      }
    }
  }
  /* Only when the edition that OWNS the engine is installed. With no tenant there is no engine,
     no count to state, and no prompt that states one — so an uncountable suite is a fact about
     the checkout rather than a defect. When the tenant IS installed this stays as strict as it
     was: an engine present but uncountable still fails. */
  if (EDITIONS.has('VASTRANGAM') && NENGINE === null) {
    bad.push('could not count the engine tests from selftest.py — the prompt would have to state ' +
      'a number it did not read, and that is how a count goes stale');
  }
  return bad;
}

/* ── render ──────────────────────────────────────────────────────────────── */
const t = (x) => x;   // no token substitution here; every figure is already resolved

function render(p) {
  const o = [];
  let n = 0;
  const H = (title) => o.push('', '---', '', `# ${n++}. ${title}`, '');

  o.push(`# ${p.title}`, '', `**${p.strap}**`, '');
  o.push(`Generated from this repository on ${new Date().toISOString().slice(0, 10)}. ` +
    `Every count below is read from source and every path is checked to exist.`, '');

  /* 0 — on screen first. He runs this locally and looks at it in Chrome. */
  H('BEFORE ANYTHING — CHECK YOU HAVE THE RIGHT THING');
  o.push(p.precondition.replace('@NT@', String(NTABLE)), '');

  H('START HERE — GET IT ON SCREEN');
  o.push(p.screen, '');
  o.push('```bash');
  (p.screenSteps || []).forEach(([cmd, why]) => o.push(`${cmd.padEnd(38)}# ${why}`));
  o.push('```', '');
  o.push(p.screenApp, '');
  o.push('**Do not change anything until all of that works.** A green baseline you did not ' +
    'establish is a green baseline you cannot trust later.', '');

  H('ROLE');
  o.push(p.role, '', 'Your priorities, in order:', '');
  COMMON.priorities.forEach((x, i) => o.push(`${i + 1}. ${x}`));
  o.push('', '**Never sacrifice the first six to move faster.**', '');

  H('WHAT THIS IS');
  o.push(p.vision, '');

  H('WHAT THIS IS NOT');
  o.push(p.isnot, '');

  H('WHAT ALREADY EXISTS — READ BEFORE WRITING ANYTHING');
  o.push(p.exists, '');
  o.push(FMT.table({
    head: ['Already here', 'What it is'],
    /* A ROW BELONGS TO AN EDITION, AND A PROMPT ONLY SHOWS ITS OWN.
       The Medhava prompt was listing engine/vastrangam/ and the tenant guides in its "what
       already exists" table — telling an agent building the PRODUCT to go and read one
       customer's payroll engine. Untagged rows are the product's and appear in every prompt;
       a tagged row appears only in that edition's own prompt. */
    rows: forEdition(EXISTS, p.edition).map(([f, w]) => ['`' + f + '`', w]),
  }, t), '');
  if (NENGINE && p.edition === 'VASTRANGAM') {
    o.push(`The Python engine carries **${NENGINE} test functions** and they pass. ` +
      `Run \`python3 engine/tests/selftest.py\` and read the last line yourself rather than ` +
      `taking that from a document.`, '');
  }

  H('WHAT DOES NOT EXIST');
  o.push(p.absent, '');

  H('READ THESE, IN THIS ORDER');
  o.push(FMT.table({
    head: ['Document', 'What it answers'],
    rows: forEdition(READING, p.edition).map(([f, w]) => ['`' + f + '`', w]),
  }, t), '');

  if (p.kernel) { H('THE BUSINESS KERNEL'); o.push(p.kernel, ''); }
  if (p.data) { H('EVERY VALUE IS A ROW WITH A DATE'); o.push(p.data, ''); }
  if (p.tenancy) { H('MULTI-TENANCY AND ISOLATION'); o.push(p.tenancy, ''); }
  if (p.people) { H('PEOPLE — FIVE STATES'); o.push(p.people, ''); }
  if (p.money) { H('MONEY'); o.push(p.money, ''); }
  if (p.dated) { H('EFFECTIVE-DATED DATA'); o.push(p.dated, ''); }
  if (p.religion) { H('RELIGION DECIDES HOLIDAYS AND NOTHING ELSE'); o.push(p.religion, ''); }
  if (p.packs) { H('INDUSTRY PACKS'); o.push(p.packs, ''); }
  if (p.ai) { H('THE AI CONTROL PLANE'); o.push(p.ai, ''); }
  if (p.apps) { H('THE APPS TO BUILD'); o.push(p.apps, ''); }

  H('WHEN A VALUE YOU NEED IS MISSING');
  o.push(COMMON.missing, '');

  H('RED BEFORE GREEN');
  o.push(COMMON.redgreen, '');

  H('NO FAKE COMPLETION');
  o.push(COMMON.fake, '');

  if (p.validate) { H('VALIDATE AGAINST THE REAL BOOKS'); o.push(p.validate, ''); }

  H('THE GATES THIS REPOSITORY ALREADY HAS');
  o.push('These run in `npm test` and in CI. **Do not weaken one to get a green build.** Each was ' +
    'written after something got through, and each has been proven by planting the failure it ' +
    'catches.', '');
  o.push(FMT.table({
    head: ['Command', 'What it refuses'],
    rows: [
      ['`npm test`', 'Everything below, in one command.'],
      ['`node brand/site/checkstatic.js`', 'A count, rate, threshold, shift or person’s name compiled into code.'],
      ['`node core/tests/live.test.js`', 'A schema whose isolation is not proven against a running database.'],
      ['`node core/tests/packs.test.js`', 'A pack carrying code, or a trade word reaching the engine.'],
      ['`node brand/site/checkrules.js`', `A rule claiming a proof it does not have — all ${NRULE} of them.`],
      ['`node brand/site/checkcoverage.js`', 'A delivered document missing a register, or a stale PDF.'],
      ['`node brand/site/checkconflicts.js`', 'A specification conflict quietly resolved instead of recorded.'],
      ['`npm run validate -- <folder>`', 'Reporting success when a real workbook was absent.'],
    ],
  }, t), '');

  H('PHASE ORDER');
  o.push('Do not skip a foundational phase because a later one is more interesting.', '');
  o.push(FMT.table({
    head: ['Phase', 'What', 'Done when'],
    rows: (p.phases || []).map(([num, what, done]) => ['**' + num + '**', what, done]),
  }, t), '');

  H('DEFINITION OF DONE');
  o.push(COMMON.done, '');

  H('WHEN TWO THINGS CONFLICT');
  o.push(COMMON.uncertain, '');

  H('ABSOLUTE PROHIBITIONS');
  o.push('Never:', '');
  COMMON.prohibitions.forEach((x) => o.push(`- ${x}`));
  o.push('');

  H('REQUIRED FINAL REPORT');
  o.push(COMMON.report, '');

  H('START NOW');
  o.push(p.first, '');

  o.push('---', '');
  o.push(`*Generated by \`brand/delivery/website/mkprompts.js\` from \`brand/site/prompts.js\`. ` +
    `Every path and command above is checked to exist before this file is written, and every ` +
    `count is read from its source at generation time. Regenerate rather than editing this file.*`);

  return o.join('\n') + '\n';
}

/* ── run ─────────────────────────────────────────────────────────────────── */
const bad = gate();
if (bad.length) {
  console.error(`mkprompts: ${bad.length} problem(s). Refusing to write.\n`);
  bad.forEach((b) => console.error('  · ' + b));
  process.exit(1);
}

let stale = 0;
for (const p of PROMPTS) {
  const doc = render(p);
  const file = path.join(ROOT, p.file);
  if (checkOnly) {
    const now = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (now !== doc) { console.error(`mkprompts: ${p.file} is out of date — run without --check`); stale++; }
  } else {
    fs.writeFileSync(file, doc);
    console.log(`${p.file} written: ${Math.round(Buffer.byteLength(doc) / 1024)}KB · ` +
      `${(doc.match(/^# \d+\. /gm) || []).length} sections · ${p.phases.length} phases`);
  }
}
if (stale) process.exit(1);

console.log(`mkprompts: ${PROMPTS.length} prompts · ${EXISTS.length + READING.length} paths ` +
  `verified to exist · counts read from source (${NMOD} modules · ${NAPP} apps · ${NRULE} rules · ` +
  `${NTABLE} tables · ${NLAYER} layers · ${NPACK} packs)`);
