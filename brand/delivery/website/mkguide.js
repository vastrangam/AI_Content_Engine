'use strict';
/* THE BUILD GUIDE — for the people building the platform.
 *
 *   node brand/delivery/website/mkguide.js   → MEDHAVA_BUILD_GUIDE.md
 *
 * THE READER IS A DEVELOPER. A TENANT HAS ITS OWN GUIDE.
 * This used to build twice — once neutral, once for a trade — on the assumption that a trade
 * gets its own edition of the software to build and deploy. It does not. A trade is a TENANT:
 * an account, an industry pack and its own rows, all created in a browser. The trade "build
 * guide" therefore opened by telling a clothing manufacturer to install Node and clone a
 * repository, which is a long document written for entirely the wrong person.
 *
 * Onboarding a tenant is now mktenant.js, and it contains no shell commands at all — tenant.js
 * refuses a step that carries one.
 *
 * WHAT THIS DOCUMENT IS FOR, AND WHY IT IS NOT ANY OF THE OTHERS
 * The six existing documents answer "what is this system" and "what is the plan". Neither
 * answers "what do I type on Monday morning". This one is a runbook: numbered steps, each
 * with a command, what should come back, and the condition that makes it finished.
 *
 * Where DEPLOYMENT.md already says something well, this POINTS AT IT rather than restating
 * it. A second copy of a working runbook is a copy that goes stale the first time the
 * original is corrected, and the reader has no way to tell which one is current.
 *
 * WHAT COMES FROM WHERE
 *   guide.js       the parts and steps — the prose
 *   guidefmt.js    how a step is rendered, shared with the tenant guide
 *   modules.js     Part 7, generated: every module, every app, in the order they are numbered
 *   built.js       which apps actually exist today
 *   rules.js       the rulebook, and which rules a module still owes
 *   tools.js       how many capabilities the free-first register covers
 *   packs/         how many trades ship as configuration
 *   schema         how many tables the production database has
 *
 * Nothing in the output is a number typed by hand. That is not a stylistic preference: a
 * stale "104 apps" sat in a pull-request title for weeks because somebody typed it once and
 * the list moved underneath it.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

/* ── the canonical sources ────────────────────────────────────────────────── */
const GUIDE = require(path.join(SITE, 'guide.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const RULES = require(path.join(SITE, 'rules.js'));
const TOOLS = require(path.join(SITE, 'tools.js'));
const { BUILT, builtIn, verify } = require(path.join(SITE, 'built.js'));
const FMT = require(path.join(SITE, 'guidefmt.js'));

/* ── the counts, every one derived ───────────────────────────────────────── */
const NMOD = MODULES.length;
const NAPP = MODULES.reduce((s, m) => s + m.apps.length, 0);
const NBUILT = MODULES.reduce((s, m) => s + builtIn(m), 0);
const NRULES = RULES.length;
const NENF = RULES.filter((r) => r.state === 'ENFORCED').length;
const NTOOLS = TOOLS.tools.length;
const NPACKS = fs.readdirSync(path.join(ROOT, 'core', 'packs')).filter((f) => f.endsWith('.json')).length;
const NTABLES = (fs.readFileSync(path.join(ROOT, 'core', 'schema.postgres.sql'), 'utf8')
  .match(/CREATE TABLE IF NOT EXISTS/g) || []).length;
/* The spine is the module every other module runs on — it is why the website says one
   number of modules and the documents say another, and both are right. */
const NSPINE = MODULES.filter((m) => m.spine).length;
const NBUSINESS = NMOD - NSPINE;
const DATE = new Date().toISOString().slice(0, 10);

/* ── one guide, because there is one codebase ────────────────────────────── */
/* This used to build twice, once per edition, with a shape gate binding the pair. That was wrong
   about the product: a trade is a TENANT — a row, a pack and its own data — not a second build.
   The trade edition's "build guide" therefore opened by telling a clothing manufacturer to install
   Node and clone a repository, which is 42 pages of instructions for the wrong reader. Onboarding
   a tenant is now its own document, written for somebody with no terminal: mktenant.js.

   The edition overlay itself is untouched and still right. It changes WORDS on the website, the
   screenshots and the product documents, which is the product working. It was never supposed to
   fork the build. */
const EDITION = {
  key: 'MEDHAVA',
  NAME: 'Medhava',
  DOMAIN: 'medhava.com',
  REPO: 'medhava-bos',
  PACK: 'the pack that matches your trade',
  out: path.join(ROOT, 'MEDHAVA_BUILD_GUIDE.md'),
  strap: 'Building the platform, from an empty folder to a running business.',
  role: `**This is the platform guide, and there is only one.** Medhava is one business operating
system that any trade can run, because what a trade calls things arrives as a row of configuration
rather than as a separate version of the software.

Everything you build here is the engine every tenant shares. **A tenant is a customer** — a business
that signs up, takes a plan, and runs up to twenty companies inside one account, each selling through
every channel. A tenant creates rows in a browser; it does not clone this repository, run this
toolchain or deploy this server. Onboarding one has its own guide, written for a reader with no
terminal.`,
};

/* ── token substitution ──────────────────────────────────────────────────── */
const TOKENS = {
  __NAME__: EDITION.NAME,
  __DOMAIN__: EDITION.DOMAIN,
  __REPO__: EDITION.REPO,
  __PACK__: EDITION.PACK,
  __NMOD__: String(NMOD),
  __NAPP__: String(NAPP),
  __NBUILT__: String(NBUILT),
  __NRULES__: String(NRULES),
  __NENF__: String(NENF),
  __NTOOLS__: String(NTOOLS),
  __NPACKS__: String(NPACKS),
  __NTABLES__: String(NTABLES),
};

function sub(text) {
  if (text == null) return text;
  let s = String(text);
  for (const [k, v] of Object.entries(TOKENS)) s = s.split(k).join(v);
  /* A token nobody defined would print as __SOMETHING__ in a delivered document, which
     looks like a bug to a reader and is one. */
  const left = s.match(/__[A-Z][A-Z0-9_]*__/g);
  if (left) throw new Error(`mkguide: undefined token(s) in the text: ${[...new Set(left)].join(', ')}`);
  return s;
}

/* ── Part 7, generated from the module list ──────────────────────────────── */
/* NOT reordered. The modules are numbered in build-dependency order already — what a later
   module needs exists by the time it is built — and re-sorting a list somebody numbered is
   not an improvement, it is a second opinion nobody asked for. */
function partSeven() {
  /* No edition overlay here any more. This document is read by whoever is building the
     platform, and they build the neutral one — the trade wording is a tenant's runtime
     configuration, not something a developer compiles in. */

  /* The first sentence of an app description, which is the part that says what it is.
     The rest says how it behaves, and belongs in the documents that have room for it. */
  const firstSentence = (s) => {
    const t = String(s).trim();
    const i = t.search(/\.\s/);
    return (i > 0 ? t.slice(0, i + 1) : t).replace(/\|/g, '\\|');
  };

  const out = [
    '## Part 7 · Build the modules',
    '',
    `${NMOD} modules, ${NAPP} apps. **${NBUILT} of them work today** and the rest are designed and not
yet written — each app below says which it is, so no step here quietly assumes software nobody has
built.`,
    '',
    `The order is the order the modules are numbered, and that is already the build order: what a later
module needs, an earlier one has made. Module 01 is the spine — not a module you open, the layer
everything else stands on — which is why ${NMOD} modules is also ${NBUSINESS} modules you use plus one
underneath them. Both figures describe the same system.`,
    '',
    `**A module is finished when its rules are enforced, not when its screens exist.** The rulebook
carries ${NRULES} rules and ${NENF} of them are proven by a test today. Each module below lists what it
still owes, and that list is the honest definition of done for it.`,
    '',
  ];

  MODULES.forEach((m) => {
    const mine = RULES.filter((r) => r.mod === m.n);
    const enf = mine.filter((r) => r.state === 'ENFORCED');
    const nb = builtIn(m);

    out.push(`### Module ${m.n} · ${m.name}${m.spine ? ' — the spine' : ''}`, '');
    out.push(`*${sub(m.tag)}*`, '');
    out.push(`**${nb} of ${m.apps.length} apps working · ${enf.length} of ${mine.length} rules enforced**`, '');

    out.push(FMT.table({
      head: ['App', 'State', 'What it is'],
      rows: m.apps.map((a) => [
        a[0].replace(/\|/g, '\\|'),
        BUILT.has(a[0]) ? '`WORKS TODAY`' : '`SPEC`',
        firstSentence(a[2]),
      ]),
    }, sub), '');

    if (m.reads && m.reads.length) {
      out.push(`**Needs first:** ${m.reads.join(', ')}  `);
      out.push(`**Feeds:** ${(m.writes || []).join(', ')}`, '');
    }

    if (enf.length) {
      out.push('**Already proven:**', '');
      enf.forEach((r) => out.push(`- \`${r.id}\` ${r.title} — proved by \`${r.by}\``));
      out.push('');
    }
    const owed = mine.filter((r) => r.state !== 'ENFORCED');
    if (owed.length) {
      out.push(`**Still owed — ${owed.length} rule${owed.length === 1 ? '' : 's'} designed but not yet proven:**`, '');
      owed.forEach((r) => out.push(`- \`${r.id}\` ${r.title}`));
      out.push('');
    }
    out.push(`**Done when:** all ${mine.length} rules for this module are ENFORCED — each naming a test ` +
      `that exists and really runs — and its ${m.apps.length} apps read and write the shared data core ` +
      `rather than storage of their own.`, '');
  });

  return out.join('\n');
}

/* ── the two diagrams ────────────────────────────────────────────────────── */
/* Both left-to-right and deliberately small. A tall top-down flowchart once could not fit
   inside break-inside:avoid on any page, so the printer silently dropped it and produced a
   heading above a blank sheet — with every automated check passing. Wide and short prints. */
const ROADMAP = `\`\`\`mermaid
flowchart LR
  A["0 · close<br/>the old project"] --> B["1 · start the<br/>slow clocks"]
  B --> C["2 · your<br/>machine"]
  C --> D["3 · the new<br/>repository"]
  D --> E["4 · the site<br/>live"]
  E --> F["5 · the<br/>services"]
  F --> G["6 · the apps,<br/>as a demo"]
  G --> H["7 · build the<br/>modules"]
\`\`\``;

const SPLIT = `\`\`\`mermaid
flowchart LR
  subgraph P["CODE — one engine"]
    M["${NMOD} modules"]
    S["${NTABLES} tables"]
    R["${NRULES} rules"]
  end
  subgraph D["DATA — a row each"]
    K["industry pack"]
    W["word overlay"]
    C["companies<br/>and channels"]
  end
  P -.->|"reads"| D
\`\`\``;

/* ── the document ────────────────────────────────────────────────────────── */
function build() {
  const bad = GUIDE.check();
  if (bad.length) {
    console.error(`mkguide: guide.js has ${bad.length} problem(s)\n`);
    bad.forEach((b) => console.error('  ' + b));
    process.exit(1);
  }
  const bp = verify(MODULES);
  if (bp.length) {
    console.error('mkguide: built.js does not agree with modules.js\n');
    bp.forEach((b) => console.error('  ' + b));
    process.exit(1);
  }

  const nsteps = GUIDE.parts.reduce((s, p) => s + p.steps.length, 0);

  const front = `# ${EDITION.NAME} — the build guide

**${sub(EDITION.strap)}**

${NMOD} modules · ${NAPP} apps · ${NBUILT} working today · compiled ${DATE}

---

## What this document is

A runbook. Ten parts, ${nsteps} numbered steps, and every step carries three things a plan does not:

- **the command** — what to type, or the exact place to click
- **what you should see** — so "did that work?" has an answer instead of a feeling
- **done when** — the condition that makes it finished rather than attempted

It starts at an empty folder and ends with the modules being built one at a time. It assumes nothing
is installed and nothing is set up.

${sub(EDITION.role)}

${ROADMAP}

---

## Read this before step 0.1

**Every step is labelled, and the labels are the honest part.**

| Label | Means |
|---|---|
| \`WORKS TODAY\` | The command runs now. Each one was run while writing this. |
| \`MANUAL\` | No command — a browser, a phone, a form, or somebody else’s website. |
| \`DEMO\` | It runs, but on its own storage rather than the shared data core. |
| \`SPEC\` | Designed and documented. The code does not exist yet. |
| \`NOT BUILT\` | Nothing exists. This step *is* the work. |

**Where this guide sends you somewhere else, go there.** \`DEPLOYMENT.md\` holds every server command
and is written to be followed line by line. Restating it here would create a second copy that goes
stale the first time the original is corrected — and you would have no way to tell which one was
current.

**What is actually finished, stated once so no step has to hedge:** ${NBUILT} of ${NAPP} apps run
today, and they run on their own storage rather than the shared core. The industry pack engine is
finished and proven — a trade nobody designed for is added during the test run, from a plain
configuration file, with no code written. Tenancy is **not** finished, and Part 8 says exactly what is
missing rather than letting the schema’s completeness imply otherwise.

${SPLIT}

**What is a row and what is code.** The ${NMOD} modules, the ${NTABLES} tables and the ${NRULES} rules
are code — the same for everyone. A company, a channel, a location, a stage, a role and an entire
trade are rows. That is why adding a trade is a file somebody writes rather than a release somebody
ships, and why there is no ceiling on companies or channels anywhere in the software.

---

`;

  const parts = [];
  for (const p of GUIDE.parts) {
    if (p.n === 8) parts.push(partSeven());   // Part 7 is generated, and sits before Part 8
    parts.push(FMT.part(p, sub));
  }

  const foot = `---

## If you decide to fork instead

This guide assumes Medhava is the product and a trade is configuration loaded on top. The alternative
is a hard fork — copy everything twice and let the two diverge.

It is simpler on day one and it costs the thing the product is sold on. \`core/packs.js\` refuses to
be a fork by construction; \`checkneutral.js\` and the edition shape gate stop meaning anything once
there are two engines to be neutral about; and the ${NRULES}-rule rulebook becomes two rulebooks that
have to be corrected in parallel forever. The ${NPACKS} shipped packs and the test that invents a
seventh trade at run time would all be describing a claim no longer true.

If you fork anyway, the honest move is to delete those gates rather than leave them passing on a
claim that has quietly stopped holding.

---

*Generated by \`brand/delivery/website/mkguide.js\` from \`brand/site/guide.js\` and the canonical
lists. Every count in this document is read from its source at generation time — no module count, app
name, rule count or table count is typed by hand. Nothing here is maintained by editing this file:
edit the source and regenerate.*
`;

  return front + parts.join('\n---\n\n') + '\n' + foot;
}

const DOC = build();
fs.writeFileSync(EDITION.out, DOC);

const kb = Math.round(Buffer.byteLength(DOC) / 1024);
const nsteps = GUIDE.parts.reduce((s, p) => s + p.steps.length, 0);
console.log(`${path.relative(ROOT, EDITION.out)} written: ${kb}KB · ${EDITION.key} · ` +
  `10 parts · ${nsteps} steps + ${NMOD} modules · ` +
  `${(DOC.match(/```mermaid/g) || []).length} diagrams`);
console.log(`  derived: ${NMOD} modules (${NBUSINESS} + ${NSPINE} spine) · ${NAPP} apps · ` +
  `${NBUILT} built · ${NRULES} rules (${NENF} enforced) · ${NTABLES} tables · ` +
  `${NPACKS} packs · ${NTOOLS} tool capabilities`);
