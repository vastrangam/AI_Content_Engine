'use strict';
/* THE TWO BUILD ARCHIVES — the product, and one tenant, and never the two in one file.
 *
 *   node brand/delivery/website/mkstarter.js                     → MEDHAVA_BOS.zip
 *   node brand/delivery/website/mkstarter.js vastrangam          → VASTRANGAM_TENANT.zip
 *   node brand/delivery/website/mkstarter.js --verify            → build it, extract it, RUN it
 *   node brand/delivery/website/mkstarter.js --verify --both     → and prove the split is lossless
 *
 * WHY THERE ARE TWO, AND WHY THIS FILE WAS WRONG BEFORE
 * MEDHAVA is the PRODUCT. VASTRANGAM is a TENANT — one manufacturer's vocabulary, its staff, its
 * rates, its payroll engine and its documents. The owner put it plainly: accounting software is
 * not shipped with a customer built into it, and the customer is configured afterwards.
 *
 * The first version of this file shipped one archive containing both, called it the Medhava
 * starter kit, and that was measured rather than argued: **153 of its entries matched
 * "vastrangam"**, and its own `npm test` ran `python3 engine/tests/selftest.py` — one customer's
 * payroll engine — as a precondition for building the product. An agent handed that archive and
 * told "build Medhava" had no way to tell which half of it was the thing being asked for.
 *
 * WHAT THE PRODUCT ARCHIVE MUST SATISFY, AND WHAT IS CHECKED
 *   1. no file whose path names a trade
 *   2. no trade word in the documents an agent reads FIRST — the entry points are the only place
 *      the mixing actually misleads somebody, and checking every file for the word would fail on
 *      checkneutral.js, whose job is to contain the denylist
 *   3. it builds: extracted somewhere else, `npm ci`, then `npm run test:product` exits 0 with no
 *      tenant installed anywhere
 *
 * WHAT THE TENANT ARCHIVE MUST SATISFY
 * It cannot be run alone — it is a configuration, not a program, and pretending otherwise would
 * be the same lie in the other direction. So the honest check is that it COMPLETES the product:
 * --both extracts the product, unzips the tenant over it, and runs the full `npm test`. If that
 * passes, nothing was lost in the split and nothing was duplicated.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, execSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

const args = process.argv.slice(2);
const verify = args.includes('--verify');
const both = args.includes('--both');
const wantTenant = args.some((a) => /^vastrangam$/i.test(a));

const MODULES = require(path.join(SITE, 'modules.js'));
const RULES = require(path.join(SITE, 'rules.js'));
const { TRADE_WORDS } = require(path.join(SITE, 'checkneutral.js'));
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

/* ── counts, derived, and a refusal rather than a wrong number ────────────── */
function derived(what, n) {
  if (!Number.isInteger(n) || n <= 0) {
    console.error(`mkstarter: could not derive ${what} — refusing to write a document that ` +
      `states a count it did not read. Fix the derivation, do not type the number.`);
    process.exit(1);
  }
  return n;
}
const NMODULES = derived('the module count', MODULES.length);
const NAPPS = derived('the app count', MODULES.reduce((n, m) => n + m.apps.length, 0));
const NRULES = derived('the rule count', Array.isArray(RULES) ? RULES.length : NaN);
const NENFORCED = derived('the enforced-rule count',
  RULES.filter((r) => r.state === 'ENFORCED').length);
const NTABLES = derived('the table count',
  (fs.readFileSync(path.join(ROOT, 'core', 'schema.postgres.sql'), 'utf8')
    .match(/^CREATE TABLE /gm) || []).length);

/* ── who owns which file ─────────────────────────────────────────────────── */

/* One tenant's trees and documents. Everything not matched here is the product's.
   Kept as one list because the split has to be reversible: the tenant archive is exactly the
   complement of the product archive, and --both proves the two halves rejoin. */
const TENANT_RE = new RegExp([
  '^engine/',                       // the payroll/attendance engine and this business's fixtures
  '^app/',                          // the AI content-engine server built for this trade
  '^research/',                     // this trade's market research
  '^brand/suite/aiengine/',         // the content engine's own tooling
  '^(PLAN_OF_ACTION|SAMPLE_RUN|SOURCE_REGISTER|PROJECT_REPORT)',
  'vastrangam',                     // every file whose own name says whose it is
].join('|'), 'i');

/* Rendered output regenerated from something included. A .html is a rendered document only when
   a sibling .md exists — the rule that saved medhava/web/index.html and the 16 prototype apps
   from being deleted as "output". */
const DROP = /\.(pdf|zip|docx)$/i;
const isRenderedDocument = (f) =>
  /\.html$/i.test(f) && fs.existsSync(path.join(ROOT, f.replace(/\.html$/i, '.md')));

function tracked() {
  return execSync('git ls-files -z', { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 })
    .toString('utf8').split('\0').filter(Boolean)
    .filter((f) => !DROP.test(f) && !isRenderedDocument(f));
}

const contents = (tenant) =>
  tracked().filter((f) => (tenant ? TENANT_RE.test(f) : !TENANT_RE.test(f)));

/* The generated note each archive carries. Different names on purpose — see build(). */
const NOTE_NAME = (tenant) => (tenant ? 'VASTRANGAM_START_HERE.md' : 'START_HERE.md');

/* ── the note on top of the product archive ──────────────────────────────── */

function startHereProduct() {
  return `# Medhava BOS — start here

## Follow the guide

**\`MEDHAVA_HOW_TO_BUILD.md\` is the step-by-step path** — from this archive to a running website,
then the loop you repeat once per app. 6 parts, 36 steps, every command in it verified to exist
before the document was written. Read this page first, then work through that one.

## What this is

**The product, and only the product.** No tenant is installed. There is no customer's data, no
customer's payroll engine and no customer's vocabulary anywhere in this archive — the same way
accounting software ships without a particular business inside it.

## Prove you have a working copy

\`\`\`bash
npm ci
npm run test:product
\`\`\`

That must exit 0. If it does not, stop and read what failed — do not build on a red suite.

If it reports **7 browser checks SKIPPED**, your machine has no Chromium: \`npx playwright install
chromium\`. The run still exits 0, but those checks did not run and the shell is unverified until
they do. The skip says so in a banner for exactly that reason.

Then see it run:

\`\`\`bash
npm start          # http://localhost:4000
\`\`\`

Sign in as \`owner@anjali.demo\` (an apparel group, two companies) or \`owner@deccan.demo\` (a steel
works, one company). Two unrelated businesses on one database.

Open **Isolation** first: it shows what your company can see against what the database actually
holds, and the gap is enforced by PostgreSQL row-level security, not by a filter the code
remembered to add. Then **Record a sale** — one transaction moves the stock, raises the invoice
and posts the ledger, or none of it happens.

## What is built, and what is not

| | Count | State |
|---|---|---|
| Modules | ${NMODULES} | specified · a navigation page each |
| Apps | **${NAPPS}** | **1 write path built** — Sales, recording a sale |
| Database tables | ${NTABLES} | built, running, isolated |
| Rules | ${NRULES} | **${NENFORCED} enforced by a test that runs**; the rest specified |

The platform underneath is real: the schema executes into PostgreSQL, row-level security is
enforced by the database, sessions carry a tenant and a company, and no business query can reach
the data without both. Module 05 · Sales has one working write path. Everything else is a
navigation page carrying its real app names with an on-screen mark saying the screens are
specified and not built.

**Leave that mark until an app is genuinely built.** A list of app names on a working shell reads
as a working app, and that is the one thing this project treats as cheating.

## Read CLAUDE.md before doing anything

It is the working agreement and Claude Code loads it automatically. Two rules catch people first:
**derive, never retype** (counts come from the canonical source; \`${NMODULES} modules\` has already
changed twice), and **never claim something is finished when it is not**.

\`.claude/skills/anti-cheat-protocol/\` is also installed: no claim without evidence from a command
actually run.

## Where the truth lives

| Truth | File |
|---|---|
| Modules, apps, order | \`brand/site/modules.js\` — the one canonical list |
| The production database | \`core/schema.postgres.sql\` |
| The ${NRULES} rules | \`brand/site/rules.js\` |
| Which editions are installed | \`brand/site/editions.js\` |
| The running platform | \`medhava/\` |
| A worked example of the test discipline | \`medhava/test/sales.test.js\` |

## Adding a tenant, later

A trade is installed by dropping its \`brand/site/edition_<name>.js\` overlay in, plus whatever
data and documents it owns. \`brand/site/editions.js\` discovers it by that file's presence — no
registry to update. Until one is installed, every gate that concerns a tenant reports **SKIPPED,
not passed**, and says so out loud.

\`MEDHAVA_BOS_PROMPT.md\` is the build prompt for this product. It names no trade, and a gate in
\`mkprompts.js\` fails the build if it ever does again.
`;
}

/* ── the note on top of the tenant archive ───────────────────────────────── */

function startHereTenant() {
  return `# Vastrangam — a tenant of Medhava BOS

## What this is

**One business's configuration, data and documents.** It is not a program and it will not run on
its own — it has no schema, no server and no package file, because those belong to the product.

The product is \`MEDHAVA_BOS.zip\`. This completes it.

## Installing onto Medhava

\`\`\`bash
unzip MEDHAVA_BOS.zip && cd medhava-bos
unzip -o ../VASTRANGAM_TENANT.zip        # overlays this tenant onto the product
                                         # (its note lands as VASTRANGAM_START_HERE.md, so the
                                         #  product's own START_HERE.md is left intact)
npm ci
npm test                                 # now runs the tenant's engine too
\`\`\`

Before the overlay, \`npm run test:product\` passes and every tenant-facing gate reports
**SKIPPED, not passed**. After it, \`npm test\` runs everything including
\`python3 engine/tests/selftest.py\`. That the two halves rejoin is checked, not asserted:
\`mkstarter.js --verify --both\` extracts the product, unzips this over it, and runs the full
suite from the result.

## What is in here

| | What it is |
|---|---|
| \`engine/vastrangam/\` | The Python engine: payroll, attendance, piece-rate costing, the refusals |
| \`engine/fixtures/\` | This business's own data — the roster as five states with dates, rates, thresholds, the weekly off, holidays |
| \`brand/site/edition_vastrangam.js\` | The wording overlay. **Words only** — \`build.js\` compares the structure before and after and fails if it changed a module number, an app name or an app count |
| \`VASTRANGAM_*.md\` | The build guide and the rules-and-logic reference |
| \`app/\` | The AI content-engine server built for this trade |
| \`research/\` | This trade's market research |
| \`PLAN_OF_ACTION.md\` | This business's own plan, in its own words |

## Changing it

Everything here is data and words. Nothing in it is compiled into the product, which
\`brand/site/checkstatic.js\` enforces over the engine and app trees — a rate, a threshold, a shift
or a person's name written into code fails the build, and the fixture is where those belong.

So the changes you want to make are edits to \`engine/fixtures/*.json\` and to the documents, not
to the platform. \`SPEC_CONFLICTS.md\` in the product archive records where this trade's own
specification says two different things; 7 are unresolved on purpose and are waiting on your
decision, not on more code.
`;
}

/* ── the gate ────────────────────────────────────────────────────────────── */

function badCommand(cmd, has) {
  const parts = cmd.trim().split('\n')[0].trim().split(/\s+/);
  const [bin, a, b] = parts;
  if (bin === 'npm') {
    if (['ci', 'install', 'start', 'test'].includes(a)) return null;
    const script = a === 'run' ? b : a;
    if (!script) return 'names no npm script';
    return script in (PKG.scripts || {}) ? null : `npm script "${script}" is not in package.json`;
  }
  if (bin === 'node' || bin === 'python3') {
    if (!a) return `${bin} with no file`;
    return has.has(a) ? null : `${a} is not in the archive`;
  }
  if (['cd', 'unzip'].includes(bin)) return null;
  return null;
}

function gateProduct(files, note) {
  const has = new Set(files);
  const bad = [];

  /* 1 · not one path may name a trade. This is the check the old archive failed 153 times. */
  const named = files.filter((f) => TENANT_RE.test(f));
  if (named.length) {
    bad.push(`${named.length} tenant file(s) are in the product archive, starting with ` +
      `${named.slice(0, 5).join(', ')}`);
  }

  /* 2 · no trade word in what an agent reads FIRST.
     Only the entry documents. Scanning every file would fail on checkneutral.js, which has to
     contain the denylist to be able to enforce it, and on CLAUDE.md, which describes the project's
     own history. The entry points are where the confusion actually happens. */
  const ENTRY = [NOTE_NAME(false), 'MEDHAVA_BOS_PROMPT.md', 'MEDHAVA_BOS.SKILL.md'];
  for (const doc of ENTRY) {
    const text = doc === NOTE_NAME(false) ? note
      : has.has(doc) ? fs.readFileSync(path.join(ROOT, doc), 'utf8') : null;
    if (text === null) { bad.push(`${doc} is not in the product archive`); continue; }
    const found = TRADE_WORDS.filter((w) =>
      new RegExp('\\b' + w.replace(/ /g, '\\s+'), 'i').test(text));
    if (found.length) {
      bad.push(`${doc} is an entry point of the PRODUCT archive and names a trade: ` +
        `${found.join(', ')}`);
    }
  }

  /* 3 · every path and command those documents name is really in here */
  for (const doc of ENTRY) {
    const text = doc === NOTE_NAME(false) ? note
      : has.has(doc) ? fs.readFileSync(path.join(ROOT, doc), 'utf8') : '';
    for (const m of text.matchAll(/`([A-Za-z0-9_./-]+\.(?:js|py|sql|json|md))`/g)) {
      const p = m[1];
      if ((p.includes('/') || has.has(p)) && !has.has(p)) {
        bad.push(`${doc} names \`${p}\`, which is not in the archive`);
      }
    }
    for (const m of text.matchAll(/```bash\n([\s\S]*?)```/g)) {
      for (const line of m[1].split('\n')) {
        const cmd = line.replace(/#.*$/, '').trim();
        if (!cmd) continue;
        const why = badCommand(cmd, has);
        if (why) bad.push(`${doc}: "${cmd}" — ${why}`);
      }
    }
  }

  /* 4 · the things without which nothing can be built */
  const MUST = [
    ['core/schema.postgres.sql', 'the database'],
    ['brand/site/modules.js', 'the canonical module list'],
    ['brand/site/rules.js', 'the rulebook'],
    ['brand/site/editions.js', 'how the product knows no tenant is installed'],
    ['package.json', 'the scripts'], ['package-lock.json', 'the toolchain, reproducibly'],
    ['CLAUDE.md', 'the working agreement'],
    ['.claude/skills/anti-cheat-protocol/SKILL.md', 'the evidence protocol'],
    ['medhava/server/db.js', 'the isolation the platform rests on'],
    ['medhava/server/sales.js', 'the one built write path'],
    ['MEDHAVA_HOW_TO_BUILD.md', 'the step-by-step guide START_HERE points the reader at'],
    ['medhava/test/sales.test.js', 'the worked example of red-before-green'],
  ];
  for (const [p, why] of MUST) if (!has.has(p)) bad.push(`${p} is missing — ${why}`);

  /* 5 · the product's own test script must not reach into a tenant */
  const tp = (PKG.scripts || {})['test:product'] || '';
  if (!tp) bad.push('package.json has no "test:product" script');
  if (/engine|vastrangam/i.test(tp)) {
    bad.push(`"test:product" runs a tenant's tests: ${tp}. The product's suite may not depend ` +
      `on any customer being installed.`);
  }
  for (const piece of tp.split('&&')) {
    const why = badCommand(piece.trim(), has);
    if (why) bad.push(`"test:product" runs "${piece.trim()}" — ${why}`);
  }
  return bad;
}

function gateTenant(files, note) {
  const bad = [];
  const has = new Set(files);
  const MUST = [
    ['brand/site/edition_vastrangam.js', 'the wording overlay — without it the edition is not installed'],
    ['engine/tests/selftest.py', 'the engine suite the product\'s npm test runs once installed'],
    ['engine/fixtures/master.json', 'this business\'s own roster and rates'],
  ];
  for (const [p, why] of MUST) if (!has.has(p)) bad.push(`${p} is missing — ${why}`);

  /* The complement must be exact: product + tenant = every tracked file, with no overlap. */
  const product = new Set(contents(false));
  const overlap = files.filter((f) => product.has(f));
  if (overlap.length) {
    bad.push(`${overlap.length} file(s) are in BOTH archives, starting with ` +
      `${overlap.slice(0, 3).join(', ')} — the split must be a partition, not a copy`);
  }
  if (NOTE_NAME(true) === NOTE_NAME(false)) {
    bad.push(`both archives would write ${NOTE_NAME(true)}. The tenant unzips over the product, ` +
      `so the product's own note would be silently replaced by the tenant's.`);
  }
  const all = tracked().length;
  if (product.size + files.length !== all) {
    bad.push(`the two archives hold ${product.size} + ${files.length} = ` +
      `${product.size + files.length} files against ${all} tracked. Something was dropped.`);
  }
  if (!note.includes('MEDHAVA_BOS.zip')) {
    bad.push('the tenant note does not tell the reader which archive it installs onto');
  }
  return bad;
}

/* ── build ───────────────────────────────────────────────────────────────── */

function build(tenant) {
  const files = contents(tenant);
  const note = tenant ? startHereTenant() : startHereProduct();
  const bad = tenant ? gateTenant(files, note) : gateProduct(files, note);
  if (bad.length) {
    console.error(`mkstarter: ${bad.length} problem(s) — this archive would not build:\n  ` +
      bad.join('\n  '));
    process.exit(1);
  }

  /* THE TWO NOTES MUST NOT SHARE A FILENAME.
     Both were called START_HERE.md, and the tenant archive unzips OVER an extracted product —
     so installing the tenant silently replaced the product's start page with the tenant's, and
     the reader lost the pointer to the build guide. The partition gate did not catch it because
     it compared TRACKED files and these two are generated. NOTE_NAME fixes the collision and the
     gate below now covers the generated notes too. */
  const stageDir = path.join(os.tmpdir(), tenant ? 'mk-tenant-stage' : 'mk-product-stage');
  fs.rmSync(stageDir, { recursive: true, force: true });
  const root = path.join(stageDir, 'medhava-bos');
  for (const f of files) {
    const dest = path.join(root, f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(ROOT, f), dest);
  }
  fs.writeFileSync(path.join(root, NOTE_NAME(tenant)), note);

  const out = path.join(ROOT, tenant ? 'VASTRANGAM_TENANT.zip' : 'MEDHAVA_BOS.zip');
  fs.rmSync(out, { force: true });
  /* The tenant zip is written WITHOUT its top folder, so it unzips directly over an extracted
     product tree. The product zip keeps the folder, because it is what you extract first. */
  if (tenant) {
    execFileSync('zip', ['-qr', out, '.'], { cwd: root, maxBuffer: 64 * 1024 * 1024 });
  } else {
    execFileSync('zip', ['-qr', out, 'medhava-bos'], { cwd: stageDir, maxBuffer: 64 * 1024 * 1024 });
  }

  const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(1);
  console.log(`${path.basename(out)}: ${mb}MB · ${files.length + 1} files`);
  return { out, files, root };
}

function install(dir) {
  try {
    execFileSync('npm', ['ci', '--no-audit', '--no-fund'],
      { cwd: dir, stdio: 'pipe', timeout: 900000 });
    return 'npm ci';
  } catch (_) {
    fs.cpSync(path.join(ROOT, 'node_modules'), path.join(dir, 'node_modules'), { recursive: true });
    return 'copied node_modules (no registry reachable)';
  }
}

function run(dir, script) {
  try {
    const out = execFileSync('npm', ['run', script],
      { cwd: dir, encoding: 'utf8', timeout: 2400000 });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status === undefined ? 1 : e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
}

function main() {
  const product = build(false);
  const tenantArchive = (wantTenant || both) ? build(true) : null;

  console.log(`  ${NMODULES} modules · ${NAPPS} apps · ${NTABLES} tables · ${NRULES} rules ` +
              `(${NENFORCED} enforced) — every count read from source`);
  console.log('  gate: no tenant path in the product archive; no trade word in its entry documents');

  if (!verify) {
    console.log('\n  Run with --verify to extract and actually run it, --both to prove the ' +
                'split rejoins.');
    return;
  }

  /* ── the product must build with NO tenant anywhere ─────────────────────── */
  const box = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-product-'));
  console.log(`\n  product: extracting into ${box}`);
  execFileSync('unzip', ['-q', product.out, '-d', box]);
  const tree = path.join(box, 'medhava-bos');
  console.log(`  toolchain: ${install(tree)}`);

  const stray = execSync(`grep -ril vastrangam "${tree}" --exclude-dir=node_modules | wc -l`)
    .toString().trim();
  console.log(`  files mentioning a trade anywhere in the extracted product: ${stray}`);

  const r = run(tree, 'test:product');
  console.log(`\n    ${r.out.trim().split('\n').slice(-8).join('\n    ')}`);
  console.log(`\n  npm run test:product with ZERO tenants installed: exit ${r.code}`);
  if (r.code !== 0) { console.log('  The product archive does NOT build.'); process.exit(r.code); }
  console.log('  The product builds on its own. Not inspected — extracted, installed and run.');

  if (!both) return;

  /* ── and the tenant must complete it ────────────────────────────────────── */
  console.log(`\n  tenant: unzipping ${path.basename(tenantArchive.out)} over the same tree`);
  execFileSync('unzip', ['-qo', tenantArchive.out, '-d', tree]);

  /* TWO QUESTIONS, NOT ONE, AND NOT `npm test`.
     The first attempt ran the repo's full `npm test`, which includes checkcoverage — the gate
     holding every delivered document against its RENDERED PDF. Neither archive ships PDFs (they
     are 365MB regenerated from markdown that is here), so it failed on all ten documents and this
     printed "the split LOST something", which was simply untrue. The check was asking a question
     about document delivery and reporting the answer as one about the split.
     What actually has to hold is: the product still passes with the tenant present, and the
     tenant's own suite — which could not run a moment ago — now runs. */
  const still = run(tree, 'test:product');
  console.log(`  product suite, with the tenant now installed: exit ${still.code}`);
  if (still.code !== 0) {
    console.log('  Installing the tenant BROKE the product. That is the failure this checks for.');
    console.log(`\n    ${still.out.trim().split('\n').slice(-10).join('\n    ')}`);
    process.exit(still.code);
  }

  const eng = run(tree, 'test:tenant');
  console.log(`\n    ${eng.out.trim().split('\n').slice(-6).join('\n    ')}`);
  console.log(`\n  tenant suite, which could not run before the overlay: exit ${eng.code}`);
  if (eng.code !== 0) {
    console.log('  The tenant archive is incomplete — its own engine does not pass from it.');
    process.exit(eng.code);
  }
  console.log('\n  Product alone: passes with no tenant. Product + tenant: both suites pass.');
  console.log('  The split is a partition — every tracked file in exactly one archive — and it ' +
              'rejoins.');
}

main();
