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
const MANIFEST = require(path.join(ROOT, 'brand', 'delivery', 'manifest.js'));

/* THE PDFs THAT SHIP ARE THE DELIVERED ONES, AND THE MANIFEST ALREADY DECIDES WHICH THOSE ARE.
   Including every .pdf put 42 of them in the product archive and took it to 131MB: 7 delivered
   documents and 35 rendered manuals from the prototype app line. Excluding all of them shipped a
   guide with no readable copy for somebody who wants to print it. The manifest is the existing
   answer to "which documents does this edition deliver", so it is the answer here too — no second
   list to keep in step with the first. */
const DELIVERED_PDF = new Set(
  MANIFEST.editions().flatMap((ed) => MANIFEST.forEdition(ed).map((d) => d.pdf)).filter(Boolean));

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
const DROP = /\.(zip|docx)$/i;

/* COMMITTED BUILD OUTPUT OF THE SUPERSEDED PROTOTYPE LINE.
   brand/suite/deep/pkg|pkgsrc|manuals hold 16 prototype apps packaged twice, once per edition.
   Nothing in the repository depends on them — no npm script, no gate — and the MEDHAVA-named ones
   were built before brand/suite/kernel.js stopped defaulting the company name to one customer, so
   they still print that customer in their header. They are output, they are stale, and the defect
   that produced them is fixed at its source. brand/site/checkedition.js names the same set and
   says the same thing, so the two cannot disagree about what is excluded and why. */
const STALE_PROTOTYPE = /^brand\/suite\/deep\/(pkg|pkgsrc|manuals)\//;
/* ── THE BUILT WEBSITE IS NOT SOURCE, AND IT IS A THIRD OF THE READING ─────
 * brand/site/book.html and index.html are what build.js produces. Measured from the
 * archive: 2.0MB and 1.0MB, roughly 513,000 and 264,000 tokens — together about 31% of
 * every readable byte in the product archive. An agent handed the zip has no use for
 * either; it reads the registers they were generated FROM.
 *
 * The same argument as the PDFs, and the same evidence: they are regenerated by one
 * command. checkneutral.js already says in its own comment that a fresh clone has no
 * index.html and skips rather than failing, so nothing here depends on their presence —
 * and --verify proves that by running the product suite from the extract without them.
 */
const isBuiltSite = (f) => /^brand\/site\/(book|index)\.html$/.test(f);

const isUndeliveredPdf = (f) => /\.pdf$/i.test(f) && !DELIVERED_PDF.has(f);
const isRenderedDocument = (f) =>
  /\.html$/i.test(f) && fs.existsSync(path.join(ROOT, f.replace(/\.html$/i, '.md')));

function tracked() {
  /* git's own stderr is silenced, not the error. Inside an extracted archive there is no
     .git, and mkcontents.js catches the throw and reports SKIPPED — but git had already
     printed "fatal: not a git repository" to the terminal first, so a run that succeeded
     showed two fatal lines in the middle of it. The throw still happens and is still
     handled; only the misleading line is gone. */
  return execSync('git ls-files -z',
    { cwd: ROOT, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
    .toString('utf8').split('\0').filter(Boolean)
    .filter((f) => !DROP.test(f) && !isRenderedDocument(f) && !STALE_PROTOTYPE.test(f)
                   && !isUndeliveredPdf(f) && !isBuiltSite(f));
}

/* ── FOUR ARCHIVES, NOT TWO — and the same one list still decides ──────────
 *
 * The PDFs were 13.8MB of the product archive's 29.3MB and 3.5MB of the tenant's 9.0MB:
 * 47% and 39%. Every one of them is rendered from a `.md` that is in the same archive, so
 * an agent handed the zip carries a second copy of every document in a format it reads
 * worse. Nothing referred to them from inside: no skill, prompt, guide or start page names
 * a .pdf path, and checkcoverage.js — which keeps each PDF current with its markdown —
 * runs in `check`, never in `check:product`, so it never runs from an extract.
 *
 * They are not deleted. They move to their own archive per edition, because a person
 * reading on a phone wants the PDF and an agent building the software does not.
 *
 * WHY PER EDITION AND NOT ONE BUNDLE. §0 of the working agreement: the product ships with
 * no customer inside it, and every tracked file belongs to exactly one archive. One mixed
 * PDF bundle would be a third thing holding both, and the partition check would have to be
 * loosened to permit it. Four archives keep it — and make it a STRONGER claim than before,
 * since the complement is now checked four ways rather than two.
 *
 * TENANT_RE still decides. `pdfs()` and `contents()` differ only in which side of one
 * predicate they keep; there is no second list of what belongs to whom.
 */
const isPdf = (f) => /\.pdf$/i.test(f);


const mine = (f, tenant) => (tenant ? TENANT_RE.test(f) : !TENANT_RE.test(f));

const contents = (tenant) => tracked().filter((f) => mine(f, tenant) && !isPdf(f));
const pdfs = (tenant) => tracked().filter((f) => mine(f, tenant) && isPdf(f));

/* The generated note each archive carries. Different names on purpose — see build(). */
const NOTE_NAME = (tenant) => (tenant ? 'VASTRANGAM_START_HERE.md' : 'START_HERE.md');
const READ_FIRST_NAME = 'READ_FIRST.md';
const PDF_ZIP = (tenant) => (tenant ? 'VASTRANGAM_PDF.zip' : 'MEDHAVA_PDF.zip');
const PDF_NOTE = (tenant) => (tenant ? 'VASTRANGAM_PDF_README.md' : 'MEDHAVA_PDF_README.md');

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

/* ── READ_FIRST.md — THE READING ORDER, PRICED ────────────────────────────
 *
 * THE PROBLEM THIS SOLVES, MEASURED RATHER THAN ASSERTED. An agent handed this archive has
 * 416 files and no order. Reading all of the readable ones costs roughly 1.7 million tokens
 * — more than any single context window — so it will not read them all; it will read
 * whatever it happens to open first. That is the actual failure: not too much material, but
 * no signal about which of it is load-bearing. MEDHAVA_CONTENTS.md lists every file with
 * what it is, which answers "what is this file" and not "should I open it".
 *
 * WHY THE COSTS ARE PRINTED. "Read the registers, skip the generated documents" is advice
 * anybody could ignore. "This document is 130,000 tokens and is a concatenation of four
 * files that are also in this archive" is a decision the reader can make. Every number
 * below is measured from the file at build time — none is typed, and none survives an edit
 * to the file it describes.
 *
 * THE ESTIMATE IS LABELLED AS ONE. Tokens are approximated at four bytes each, which is the
 * usual rule of thumb for English prose and runs somewhat low on dense source code. It is
 * stated as an approximation in the document itself, because a figure that looks exact and
 * is not is worse than an honest range.
 *
 * WHAT IS DERIVED AND WHAT IS CHOSEN. The skip table is derived: every document
 * brand/delivery/manifest.js lists for this edition, with the generator the manifest itself
 * names, so the claim "this is generated, read its source instead" cannot drift from the
 * register that decides it. The read-first list is a judgement and is written down as one —
 * but every path in it is checked to exist in the archive before the file is written, the
 * same rule mkskills.js applies to skills, and for the same reason: a reading list naming a
 * file nobody can open wastes the reader's time before it saves any.
 */

/* [path, what reading it gets you]. Order is the reading order. */
const READ_NOW = [
  ['MEDHAVA_HOW_TO_BUILD.md',
   'the ordered path from this archive to a running website, then the loop you repeat once ' +
   'per app. Start here and you will not need to guess at any step below.'],
  ['CLAUDE.md',
   'the working agreement — what counts as finished here, what counts as cheating, and the ' +
   'rule that decides every question about the product/tenant split.'],
  ['package.json',
   'every command there is. `test:product` is the one that must be green before you build ' +
   'on this; the rest of the scripts name the gates by what they check.'],
  ['brand/site/modules.js',
   'the one canonical list of modules and apps, with what each reads and writes. Every ' +
   'count in every document is derived from this file — never retype one.'],
  ['brand/site/built.js',
   'which apps actually work, as against which are designed. Read this before you believe ' +
   'any document that describes a screen.'],
  ['brand/site/stack.js',
   'what each layer is built on, the alternatives, and the interface between them — so a ' +
   'change of tool is a change of one layer.'],
];

const READ_WHEN = [
  ['core/schema.postgres.sql',
   'before you touch data. Every table, its company_id and its row-level policy.'],
  ['brand/site/rules.js',
   'before you implement a module\'s behaviour. Each rule says what happens and what the ' +
   'system will never do instead; the ones marked ENFORCED name the test that proves it.'],
  ['brand/site/registry.js',
   'when you need the requirement behind an app — the capability rows the documents cite.'],
  ['MEDHAVA_CONTENTS.md',
   'when you are looking for a file. Every file in this archive, with one line on what it is.'],
];

function readFirst(files) {
  const has = new Set(files);
  const bytes = (f) => fs.statSync(path.join(ROOT, f)).size;
  /* Four bytes per token. Approximate, and said to be — see the header. Three scales,
     because "~1730k tokens" and "6759 KB" are both technically right and neither is a
     figure a reader can hold; the point of printing a cost is that it lands. */
  const tok = (n) => {
    const t = n / 4;
    if (t >= 100000) return `~${(t / 1e6).toFixed(1)}M`;
    if (t >= 1000) return `~${Math.round(t / 1000)}k`;
    return `~${Math.round(t)}`;
  };
  const kb = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB`
                                      : `${Math.round(n / 1024)} KB`);

  const TEXT = /\.(md|js|json|sql|txt|ya?ml|py|sh|html|css)$/i;
  const readable = files.filter((f) => TEXT.test(f));
  const total = readable.reduce((n, f) => n + bytes(f), 0);

  const listed = new Set([...READ_NOW, ...READ_WHEN].map(([f]) => f));
  const sum = (list) => list.reduce((n, [f]) => n + bytes(f), 0);

  const row = ([f, why]) => `| \`${f}\` | ${kb(bytes(f))} | ${tok(bytes(f))} | ${why} |`;

  /* THE SKIP TABLE IS READ OUT OF THE MANIFEST, NOT WRITTEN HERE. */
  const MANIFEST = require(path.join(ROOT, 'brand/delivery/manifest.js'));
  const generated = MANIFEST.forEdition('MEDHAVA')
    .filter((d) => has.has(d.md) && !listed.has(d.md))
    .map((d) => ({ f: d.md, b: bytes(d.md), gen: d.generator }))
    .sort((a, b) => b.b - a.b);
  const genBytes = generated.reduce((n, d) => n + d.b, 0);

  const proto = readable.filter((f) => /^brand\/suite\/deep\//.test(f));
  const protoBytes = proto.reduce((n, f) => n + bytes(f), 0);

  const nowBytes = sum(READ_NOW);
  const whenBytes = sum(READ_WHEN);
  const restBytes = total - nowBytes - whenBytes - genBytes - protoBytes;
  const restCount = readable.length - READ_NOW.length - READ_WHEN.length
                    - generated.length - proto.length;

  const pct = (n) => `${(n * 100 / total).toFixed(1)}%`;

  return `# Read these, in this order — and skip these

This archive holds ${files.length + 2} files — ${readable.length} of them readable text, the
rest mostly screenshots and icons. Reading all ${readable.length} costs roughly **${tok(total)} tokens**,
which does not fit in one context window, so the question is not whether to skip material but
which material to skip. This page answers that with the measured cost of each choice.

**The token figures are approximations**, four bytes to a token — about right for prose, a
little low for dense source. They are measured from the files in this archive at the moment it
was built, not typed from memory.

---

## Read now — ${READ_NOW.length} files, ${kb(nowBytes)}, ${tok(nowBytes)} tokens (${pct(nowBytes)} of the archive)

This is enough to know what the product is, what exists, and what to do next.

| File | Size | Tokens | What reading it gets you |
|---|---:|---:|---|
${READ_NOW.map(row).join('\n')}

\`${NOTE_NAME(false)}\` is the other page worth opening now; it is short and it tells you how to
prove your copy of this archive works before you build on it.

## Read when you need it — ${READ_WHEN.length} files, ${kb(whenBytes)}, ${tok(whenBytes)} tokens

Open these when the work reaches them, not before.

| File | Size | Tokens | When |
|---|---:|---:|---|
${READ_WHEN.map(row).join('\n')}

---

## Do not read: the generated documents — ${generated.length} files, ${kb(genBytes)}, ${tok(genBytes)} tokens (${pct(genBytes)})

Every one of these is **output**. It was written by the command in the last column, from the
registers in the read-first list above. Reading one costs you the register's content a second
time, in prose, with the structure flattened out of it — and if you were to edit one, the next
run of its generator would discard the edit.

They ship because a person reads them. An agent reads what generated them.

| Document | Size | Tokens | Generated by |
|---|---:|---:|---|
${generated.map((d) => `| \`${d.f}\` | ${kb(d.b)} | ${tok(d.b)} | \`${d.gen}\` |`).join('\n')}

## Do not read: the superseded prototype line — ${proto.length} files, ${kb(protoBytes)}, ${tok(protoBytes)} tokens (${pct(protoBytes)})

\`brand/suite/deep/\` holds an earlier line of 16 single-file browser apps. Nothing in the
product depends on it and no gate reads it. It is kept because \`npm run apps\` still builds
from it, and it is named here so you do not spend a context window learning an approach that
was replaced by \`core/\` and \`medhava/\`.

## Everything else — ${restCount} files, ${kb(restBytes)}, ${tok(restBytes)} tokens (${pct(restBytes)})

Generators, gates, registers, tests, the deploy scripts and the website's own sources. Open
them by name when something sends you to one. \`MEDHAVA_CONTENTS.md\` says what each is.

---

## What this page is not

It is not a claim that the archive is small. It is ${kb(total)} of readable material and this
page does not change that by one byte — it says which ${pct(nowBytes + whenBytes)} of it is
load-bearing, so the rest is skipped deliberately rather than missed by accident.

It is also not a substitute for \`${NOTE_NAME(false)}\`, which tells you how to verify this
copy, or for \`MEDHAVA_HOW_TO_BUILD.md\`, which is the actual sequence of work.
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

/* A BUILD ARCHIVE HOLDS NO PDF, AND THAT IS ENFORCED RATHER THAN MERELY ARRANGED.
   The PDFs leave because contents() filters them out — one predicate, easily lost in a
   later edit, and nothing downstream would notice: the archive would simply get 14MB
   heavier again and every other gate would still pass. So both build gates assert it. */
/* And refused on the way in, so the exclusion cannot be undone by one edit to the filter
   without the gate noticing. */
function refuseBuiltSite(files, which) {
  const found = files.filter(isBuiltSite);
  return found.length
    ? [`${found.length} built website file(s) are in the ${which} archive (${found.join(', ')}). ` +
       `They are output of \`node brand/site/build.js\` and together are about a third of ` +
       `everything readable in the archive — an agent reads the registers they came from.`]
    : [];
}

/* A READING LIST THAT NAMES A FILE NOBODY CAN OPEN IS WORSE THAN NO READING LIST.
   It costs the reader a search before it saves them anything, and it is the easiest thing
   here to get wrong: a path in READ_NOW is a string nothing else validates, so a rename
   elsewhere in the repository leaves it pointing at nothing and every other gate still
   passes. mkskills.js applies this rule to skills for the same reason. Every backticked
   token that looks like a path must be in the archive or be one of the generated notes. */
/* AND THE CURATED LISTS ARE CHECKED BEFORE THEY ARE MEASURED, NOT AFTER.
   The first version checked only the finished text, which meant readFirst() had already
   called statSync on every path in READ_NOW to price it. A path that does not exist at all
   therefore died inside fs with a stack trace and no message — the plant that proved this
   printed `ENOENT ... brand/site/whatIsBuilt.js` and exited before any gate ran. A gate that
   only catches the half of a mistake that happens not to crash is not the gate it claims to
   be, so the list is validated first and priced second. */
function refuseReadingList(files) {
  const has = new Set(files);
  const bad = [...READ_NOW, ...READ_WHEN].map(([f]) => f).filter((f) => !has.has(f));
  return bad.length
    ? [`${bad.length} file(s) in the ${READ_FIRST_NAME} reading list are not in the product ` +
       `archive: ${bad.join(', ')}. The list is a judgement, but the paths in it are not — ` +
       `a rename anywhere in the repository leaves one pointing at nothing.`]
    : [];
}

function refuseUnrealPaths(text, files, which) {
  const has = new Set(files);
  const generatedNotes = new Set([NOTE_NAME(false), NOTE_NAME(true), READ_FIRST_NAME,
    PDF_NOTE(false), PDF_NOTE(true)]);
  const looksLikePath = (t) =>
    /^[\w./-]+$/.test(t) && (t.includes('/') || /\.(md|js|json|sql|ya?ml|py|sh|css|html)$/i.test(t));
  const bad = [];
  const seen = new Set();
  for (const m of text.matchAll(/`([^`\n]+)`/g)) {
    const t = m[1].trim();
    if (!looksLikePath(t) || seen.has(t)) continue;
    seen.add(t);
    /* A directory is named with a trailing slash; it is real if anything in the archive
       is under it. */
    const ok = t.endsWith('/')
      ? files.some((f) => f.startsWith(t))
      : (has.has(t) || generatedNotes.has(t));
    if (!ok) bad.push(t);
  }
  return bad.length
    ? [`the ${which} archive's ${READ_FIRST_NAME} names ${bad.length} path(s) that are not in ` +
       `it: ${bad.slice(0, 6).join(', ')}. A reading list is only worth its accuracy — a path ` +
       `that resolves to nothing costs the reader a search and returns them nothing.`]
    : [];
}

function refusePdfs(files, which) {
  const found = files.filter(isPdf);
  return found.length
    ? [`${found.length} PDF(s) are in the ${which} BUILD archive, starting with ` +
       `${found.slice(0, 4).join(', ')}. PDFs ship in ${PDF_ZIP(which === 'tenant')} — a ` +
       `build archive carries the markdown they were rendered from, not a second copy of it.`]
    : [];
}

function gateProduct(files, note) {
  const has = new Set(files);
  const bad = refusePdfs(files, 'product').concat(refuseBuiltSite(files, 'product'))
    .concat(refuseReadingList(files));
  /* Only priced once the paths are known to be real — see refuseReadingList. */
  if (!bad.some((m) => m.includes(READ_FIRST_NAME))) {
    bad.push(...refuseUnrealPaths(readFirst(files), files, 'product'));
  }

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
  const bad = refusePdfs(files, 'tenant').concat(refuseBuiltSite(files, 'tenant'));
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
  /* The four-way complement used to live here. It moved to gatePartition(), which runs
     before anything is built — see the note there. It belongs to all four archives, and
     while it sat in this one gate it fired FIRST and masked the gates it was standing in
     front of: three plants aimed at gatePdf's own rules were caught by this sum instead,
     so those rules were never actually seen to work. */
  if (!note.includes('MEDHAVA_BOS.zip')) {
    bad.push('the tenant note does not tell the reader which archive it installs onto');
  }
  return bad;
}

/* ── the PDF archives ──────────────────────────────────────────────────────
 * One per edition, holding only that edition's rendered documents. They are for reading,
 * not for building: nothing in them is code, and unzipping one over a build archive would
 * put back exactly the 14MB the split removed.
 *
 * PATHS ARE KEPT AS THEY ARE IN THE REPOSITORY rather than flattened. Twenty-four of the
 * twenty-five sit at the root and read the same either way; the twenty-fifth,
 * brand/delivery/website/MEDHAVA_BOS/Medhava_Website.pdf, is the largest of them all, and
 * flattening it would put a file called Medhava_Website.pdf beside Medhava_BOS.pdf with
 * nothing to say which is which. Keeping the path also means the contents document names
 * every PDF by the same path it uses everywhere else.
 */
function gatePdf(files, tenant) {
  const bad = [];
  const which = tenant ? 'tenant' : 'product';

  const notPdf = files.filter((f) => !isPdf(f));
  if (notPdf.length) {
    bad.push(`${notPdf.length} file(s) in the ${which} PDF archive are not PDFs, starting ` +
      `with ${notPdf.slice(0, 4).join(', ')}. This archive is for reading; anything that ` +
      `belongs to the build belongs in the build archive.`);
  }

  /* The same rule as the build archives, for the same reason: a product artifact carries no
     customer's file. Without this the Medhava PDF zip is the one place the separation could
     quietly break, because nobody would think to look in it. */
  if (!tenant) {
    const named = files.filter((f) => TENANT_RE.test(f));
    if (named.length) {
      bad.push(`${named.length} tenant PDF(s) are in the product's PDF archive, starting ` +
        `with ${named.slice(0, 4).join(', ')}`);
    }
  }

  const other = new Set(pdfs(!tenant));
  const overlap = files.filter((f) => other.has(f));
  if (overlap.length) {
    bad.push(`${overlap.length} PDF(s) are in BOTH PDF archives, starting with ` +
      `${overlap.slice(0, 3).join(', ')} — a partition, not a copy`);
  }

  if (!files.length) {
    bad.push(`the ${which} PDF archive would be empty. Either no document is rendered for ` +
      `this edition, or the split has stopped finding them — and an empty archive that ` +
      `builds successfully tells the reader neither.`);
  }
  return bad;
}

function pdfNote(tenant) {
  const list = pdfs(tenant);
  const mb = (list.reduce((n, f) => n + fs.statSync(path.join(ROOT, f)).size, 0)
    / 1024 / 1024).toFixed(1);
  const build = tenant ? 'VASTRANGAM_TENANT.zip' : 'MEDHAVA_BOS.zip';
  return `# The ${tenant ? 'Vastrangam' : 'Medhava'} documents, as PDFs

${list.length} documents · ${mb}MB. This archive is for **reading**. There is no code in it
and nothing here needs to be installed.

Each of these was rendered from a markdown file of the same name, and that markdown is in
\`${build}\` — which is the archive to hand to Claude, Codex or anyone building the software.
They read the markdown; the PDF is for you.

**If the two ever disagree, the markdown is right.** The PDF is rendered from it, so a PDF
that says something different is simply an older rendering. In the repository
\`node brand/site/checkcoverage.js\` fails the build when a PDF is older than its own source.

| Document | Size |
|---|---:|
${list.map((f) => `| \`${f}\` | ${Math.round(fs.statSync(path.join(ROOT, f)).size / 1024)} KB |`).join('\n')}

Every file in this archive is also listed, with what it is, in
\`${tenant ? 'VASTRANGAM_CONTENTS.md' : 'MEDHAVA_CONTENTS.md'}\` inside \`${build}\`.
`;
}

function buildPdf(tenant) {
  const files = pdfs(tenant);
  const bad = gatePdf(files, tenant);
  if (bad.length) {
    console.error(`mkstarter: ${bad.length} problem(s) with ${PDF_ZIP(tenant)}:\n  ` +
      bad.join('\n  '));
    process.exit(1);
  }

  const stageDir = path.join(os.tmpdir(), tenant ? 'mk-tenant-pdf' : 'mk-product-pdf');
  fs.rmSync(stageDir, { recursive: true, force: true });
  for (const f of files) {
    const dest = path.join(stageDir, f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(ROOT, f), dest);
  }
  fs.writeFileSync(path.join(stageDir, PDF_NOTE(tenant)), pdfNote(tenant));

  const out = path.join(ROOT, PDF_ZIP(tenant));
  fs.rmSync(out, { force: true });
  execFileSync('zip', ['-qr', out, '.'], { cwd: stageDir, maxBuffer: 64 * 1024 * 1024 });

  const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(1);
  console.log(`${PDF_ZIP(tenant)}: ${mb}MB · ${files.length + 1} files`);
  return { out, files };
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
  /* Only the product archive carries a reading list, and it is built AFTER the gate rather
     than handed to it — pricing a list of paths means opening them, so the gate has to have
     said they exist first. The tenant archive is a configuration of 173 files unzipped OVER
     an extracted product: its reader already has READ_FIRST.md, and a second, partial one
     would have to be right about both trees at once. */
  const reading = tenant ? null : readFirst(files);

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
  if (reading) fs.writeFileSync(path.join(root, READ_FIRST_NAME), reading);

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
  console.log(`${path.basename(out)}: ${mb}MB · ${files.length + 1 + (reading ? 1 : 0)} files`);
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

/* ── THE PARTITION, CHECKED BEFORE ANYTHING IS WRITTEN ─────────────────────
 * Every tracked file is in exactly one of the four archives. This used to be a two-way sum
 * inside gateTenant; with the PDFs split out it has to count four ways, and it has to run
 * HERE rather than inside one archive's gate.
 *
 * Not for tidiness — because of what it did while it sat in gateTenant. That gate runs
 * before the PDF archives are built, so this sum was reached first and reported a count
 * mismatch for problems that gatePdf existed to describe precisely. Three plants aimed at
 * gatePdf were caught by this line instead, which means those rules had never been seen to
 * fire and I would have shipped them believing they worked.
 *
 * Running first is also the honest order: if the four lists do not partition the tracked
 * set, nothing below is worth building.
 */
function gatePartition() {
  const lists = [
    ['product', contents(false)],
    ['product PDFs', pdfs(false)],
    ['tenant', contents(true)],
    ['tenant PDFs', pdfs(true)],
  ];
  const bad = [];
  const all = tracked();
  const sum = lists.reduce((n, [, l]) => n + l.length, 0);
  if (sum !== all.length) {
    bad.push(`the four archives hold ${lists.map(([n, l]) => `${l.length} ${n}`).join(' + ')} ` +
      `= ${sum} files against ${all.length} tracked. Something was dropped or duplicated.`);
  }
  /* A count can match while two lists both claim one file and both miss another, so the
     overlaps are checked by name and not inferred from the total. */
  for (let i = 0; i < lists.length; i++) {
    for (let j = i + 1; j < lists.length; j++) {
      const other = new Set(lists[j][1]);
      const both = lists[i][1].filter((f) => other.has(f));
      if (both.length) {
        bad.push(`${both.length} file(s) are in both the ${lists[i][0]} and ${lists[j][0]} ` +
          `archives, starting with ${both.slice(0, 3).join(', ')}`);
      }
    }
  }
  if (bad.length) {
    console.error(`mkstarter: the four archives are not a partition:\n  ${bad.join('\n  ')}`);
    process.exit(1);
  }
  return lists;
}

function main() {
  gatePartition();
  const product = build(false);
  const tenantArchive = (wantTenant || both) ? build(true) : null;
  /* THE PDF ARCHIVE IS BUILT BESIDE ITS BUILD ARCHIVE, ALWAYS. Making it a separate flag
     would mean a run that shipped a build archive with no PDFs anywhere — the documents
     would have left and arrived nowhere, and the run would look successful. */
  const productPdf = buildPdf(false);
  const tenantPdf = (wantTenant || both) ? buildPdf(true) : null;

  console.log(`  ${NMODULES} modules · ${NAPPS} apps · ${NTABLES} tables · ${NRULES} rules ` +
              `(${NENFORCED} enforced) — every count read from source`);
  console.log('  gate: no tenant path in the product archive; no trade word in its entry documents');
  console.log(`  gate: no PDF in either build archive — ${productPdf.files.length} product ` +
    `and ${tenantPdf ? tenantPdf.files.length : pdfs(true).length} tenant document(s) ship ` +
    `in ${PDF_ZIP(false)} and ${PDF_ZIP(true)} instead`);

  if (!verify) {
    console.log('\n  Run with --verify to extract and actually run it, --both to prove the ' +
                'split rejoins.');
    return;
  }

  /* ── the product must build with NO tenant anywhere ─────────────────────── */

  /* THIS DIRECTORY USED TO BE IMMORTAL, AND IT COST A SESSION ITS DISK.
   *
   * mkdtempSync made a fresh directory each run and nothing ever removed it. Each one holds
   * the extracted product PLUS the node_modules that `npm ci` puts in it — well over half a
   * gigabyte — and with --both the tenant is unzipped over the top as well. Five verify runs
   * in one session filled the writable allowance completely: `df` showed 0 bytes free with
   * the repository barely changed, every subsequent command died on ENOSPC, and the failure
   * looked like a broken machine rather than litter this script left behind.
   *
   * So a successful run cleans up after itself. A FAILING one deliberately does not: the
   * whole value of extracting and running the archive is being able to go and look at the
   * tree that failed, and deleting the evidence on the way out would make every failure
   * unreproducible. The path is printed either way, so it is always clear which happened. */
  const boxes = [];
  const sweep = () => {
    for (const b of boxes.splice(0)) {
      try { fs.rmSync(b, { recursive: true, force: true }); } catch { /* best effort */ }
    }
  };
  const keep = (why) => {
    if (boxes.length) {
      console.log(`\n  left in place for inspection (${why}): ${boxes.join(', ')}`);
      console.log('  Delete it yourself once you have looked — it is ~600MB with node_modules.');
      boxes.length = 0;
    }
  };
  process.on('exit', (code) => { if (code === 0) sweep(); else keep(`exit ${code}`); });

  const box = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-product-'));
  boxes.push(box);
  console.log(`\n  product: extracting into ${box}`);
  execFileSync('unzip', ['-q', product.out, '-d', box]);
  const tree = path.join(box, 'medhava-bos');

  /* THE EXTRACT IS ASKED, NOT THE FILE LIST. gateProduct already refuses a PDF in the list
     it is handed — but that list is what the builder INTENDED to zip, and this is what a
     person actually unzips. They are the same today and the whole point of a verify step is
     that it does not assume so. */
  const strayPdf = execSync(`find "${tree}" -name '*.pdf' -not -path '*/node_modules/*' || true`)
    .toString().trim().split('\n').filter(Boolean);
  if (strayPdf.length) {
    console.error(`\n  ${strayPdf.length} PDF(s) survived into the extracted product:\n    ` +
      strayPdf.map((f) => path.relative(tree, f)).slice(0, 6).join('\n    '));
    console.error(`  They belong in ${PDF_ZIP(false)}. The build archive carries the ` +
      'markdown they were rendered from.');
    process.exit(1);
  }
  console.log(`  extracted product contains 0 PDFs — checked in the unzipped tree, not in ` +
    'the file list the builder used');

  console.log(`  toolchain: ${install(tree)}`);

  /* A COUNT THAT ONLY PRINTS IS NOT A GATE, AND THIS ONE PRINTED 113.
   *
   * It used to say "files mentioning a trade anywhere in the extracted product: N" and
   * carry on regardless. Anybody reading the run saw a number with nothing to compare it
   * to; N could double and the output would look exactly as healthy. CLAUDE.md §0 opens
   * with this measurement — 153 entries in an archive labelled the starter kit — so the
   * one line that reports it is the last place it should be advisory.
   *
   * It is split into rings, and the innermost one FAILS.
   *
   *   ENGINE — core/ and medhava/ are the product's own database, server and tests. A
   *   trade word here is not a comment about a customer, it is the customer inside the
   *   product. This is the ring that fails, and it is at zero: the schema was headed
   *   "VASTRANGAM BOS", the core test seeded that company by name with one real
   *   employee, a real godown and a real design, and the identity mockup printed the
   *   trading name on screen.
   *
   *   EVERYTHING ELSE is reported with its own count and not failed on, because two
   *   large groups genuinely belong there and one does not yet: the files whose SUBJECT
   *   is the separation (build.js loads an edition by name; deploy/publish-site.sh
   *   builds either; ci.yml runs both), comments recording a defect that was fixed, and
   *   the earlier prototype app line under brand/suite/, which is committed BUILD OUTPUT
   *   carrying a fallback that is fixed at its origin but has not been regenerated.
   *   That last group is real debt and is named here rather than folded into a total,
   *   so it cannot pass as one of the first two.
   */
  const strayList = execSync(
    `grep -ril vastrangam "${tree}" --exclude-dir=node_modules || true`)
    .toString().trim().split('\n').filter(Boolean)
    .map((f) => path.relative(tree, f));
  const ENGINE = /^(core|medhava)\//;
  const PROTOTYPE = /^brand\/suite\//;
  const inEngine = strayList.filter((f) => ENGINE.test(f));
  const inPrototype = strayList.filter((f) => PROTOTYPE.test(f));
  const elsewhere = strayList.filter((f) => !ENGINE.test(f) && !PROTOTYPE.test(f));
  console.log(`  trade word in the product's own engine (core/, medhava/): ${inEngine.length}` +
              (inEngine.length ? '  ← FAILS' : '  ← the ring that must be empty'));
  console.log(`  in the earlier prototype app line (brand/suite/): ${inPrototype.length} ` +
              `— committed build output, not regenerated`);
  console.log(`  elsewhere (edition dispatch, and comments about the split): ${elsewhere.length}`);
  if (inEngine.length) {
    inEngine.forEach((f) => console.log(`      ${f}`));
    console.log('\n  The product\'s own engine names a trade. §0: the product must build, ' +
                'test and run with zero tenants installed.');
    process.exit(1);
  }

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

/* ── run when invoked, EXPORT when required ───────────────────────────────
   TENANT_RE is described in the working agreement as "the one list that decides" which
   tree is the product's and which is the tenant's. mkcontents.js has to answer exactly
   that question to write each archive's table of contents, and a second copy of this
   regexp somewhere else is how the two would come to disagree about a file — silently,
   because both would still pass their own checks. So it is exported rather than copied,
   and this file still runs unchanged as a script. */
if (require.main === module) main();

module.exports = { TENANT_RE, tracked, contents, pdfs, NOTE_NAME, READ_FIRST_NAME, PDF_ZIP,
  PDF_NOTE, DELIVERED_PDF };
