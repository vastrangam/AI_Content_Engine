'use strict';
/* THE BUILD GUIDE — one generator, two editions.
 *
 *   node brand/delivery/website/mkguide.js              → MEDHAVA_BUILD_GUIDE.md
 *   node brand/delivery/website/mkguide.js vastrangam   → VASTRANGAM_BUILD_GUIDE.md
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
 *   guide.js       the parts and steps — the prose, written once for both editions
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
 *
 * THE SHAPE GATE
 * The two editions must differ in WORDS ONLY. Same parts, same step ids, same order. The
 * generator builds both and compares their skeletons; if the trade edition has gained,
 * lost or renumbered a step, it refuses to write either file. This is the same rule the
 * website is held to and for the same reason — an edition is a translation, not a fork.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

const VAS = process.argv[2] === 'vastrangam';

/* ── the canonical sources ────────────────────────────────────────────────── */
const GUIDE = require(path.join(SITE, 'guide.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const RULES = require(path.join(SITE, 'rules.js'));
const TOOLS = require(path.join(SITE, 'tools.js'));
const { BUILT, builtIn, verify } = require(path.join(SITE, 'built.js'));
const ED = VAS ? require(path.join(SITE, 'edition_vastrangam.js')) : null;

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

/* ── what each edition is called ─────────────────────────────────────────── */
const EDITION = VAS ? {
  key: 'VASTRANGAM',
  NAME: ED.company || 'Vastrangam',
  DOMAIN: 'vastrangam.com',
  domainAssumed: true,
  REPO: 'vastrangam-bos',
  PACK: 'manufacturing',
  out: path.join(ROOT, 'VASTRANGAM_BUILD_GUIDE.md'),
  strap: 'Building this trade’s own edition, from an empty folder to a running business.',
  role: `**This is a deployment guide.** ${'Vastrangam'} BOS is not a different piece of software from
Medhava — it is Medhava running with this trade’s vocabulary loaded. That is the whole claim the
product is sold on, and it is checked rather than asserted: the edition overlay may change words and
may never change structure, and the build fails if it moves a module number, renames an app or changes
an app count.

So this guide builds the same engine as the Medhava guide, then loads the \`${'manufacturing'}\` pack
and this trade’s wording on top. Every step number matches the Medhava guide exactly, because the two
documents are generated from one source.`,
} : {
  key: 'MEDHAVA',
  NAME: 'Medhava',
  DOMAIN: 'medhava.com',
  domainAssumed: false,
  REPO: 'medhava-bos',
  PACK: 'the pack that matches your trade',
  out: path.join(ROOT, 'MEDHAVA_BUILD_GUIDE.md'),
  strap: 'Building the product, from an empty folder to a running business.',
  role: `**This is the product guide.** Medhava is one business operating system that any trade can
run, because what a trade calls things arrives as a row of configuration rather than as a separate
version of the software.

Everything you build here is the engine. A specific trade — including the first one — is a pack and a
word overlay loaded on top, which is what the companion guide covers.`,
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

/* ── markdown helpers ────────────────────────────────────────────────────── */
const table = (t) => [
  '| ' + t.head.join(' | ') + ' |',
  '|' + t.head.map(() => '---').join('|') + '|',
  ...t.rows.map((r) => '| ' + r.join(' | ') + ' |'),
].join('\n');

const fence = (code, lang) => '```' + (lang || 'bash') + '\n' + code + '\n```';

/* Every step reads the same way, so a reader learns the shape once and then only has to
   read the parts that differ. */
function step(s) {
  const out = [`#### ${s.id} · ${sub(s.do)}  \`${s.label}\``, ''];
  if (s.why) out.push(sub(s.why), '');
  if (s.manual) out.push(`**Where:** ${sub(s.manual)}`, '');
  if (s.needs) {
    out.push('**Have ready:**', '');
    s.needs.forEach((n) => out.push(`- ${sub(n)}`));
    out.push('');
  }
  if (s.table) out.push(table({ head: s.table.head, rows: s.table.rows.map((r) => r.map(sub)) }), '');
  if (s.cmd) out.push(fence(sub(s.cmd)), '');
  if (s.expect) out.push(`**You should see:** ${sub(s.expect)}`, '');
  if (s.check) {
    out.push('**Check it:**', '', fence(sub(s.check)), '');
    if (s.checkExpect) out.push(`**Which should give:** ${sub(s.checkExpect)}`, '');
  }
  if (s.note) out.push(`> ${sub(s.note).replace(/\n/g, '\n> ')}`, '');
  if (s.warn) out.push(`> **Careful.** ${sub(s.warn).replace(/\n/g, '\n> ')}`, '');
  out.push(`**Done when:** ${sub(s.done)}`, '');
  return out.join('\n');
}

function part(p) {
  const out = [`## Part ${p.n} · ${sub(p.title)}`, '', sub(p.lead), ''];
  if (p.table) out.push(table({ head: p.table.head, rows: p.table.rows.map((r) => r.map(sub)) }), '');
  p.steps.forEach((s) => out.push(step(s)));
  if (p.cost) {
    out.push('### What it costs each month', '',
      table({ head: p.cost.head, rows: p.cost.rows.map((r) => r.map(sub)) }), '',
      sub(p.cost.note), '');
  }
  return out.join('\n');
}

/* ── Part 7, generated from the module list ──────────────────────────────── */
/* NOT reordered. The modules are numbered in build-dependency order already — what a later
   module needs exists by the time it is built — and re-sorting a list somebody numbered is
   not an improvement, it is a second opinion nobody asked for. */
function partSeven() {
  const applied = (m) => {
    if (!ED) return m;
    const o = (ED.modules || {})[m.n] || {};
    return Object.assign({}, m, {
      tag: o.tag || m.tag,
      apps: m.apps.map((a) => ((o.apps && o.apps[a[0]]) ? [a[0], a[1], o.apps[a[0]]] : a)),
    });
  };

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

  MODULES.map(applied).forEach((m) => {
    const mine = RULES.filter((r) => r.mod === m.n);
    const enf = mine.filter((r) => r.state === 'ENFORCED');
    const nb = builtIn(m);

    out.push(`### Module ${m.n} · ${m.name}${m.spine ? ' — the spine' : ''}`, '');
    out.push(`*${sub(m.tag)}*`, '');
    out.push(`**${nb} of ${m.apps.length} apps working · ${enf.length} of ${mine.length} rules enforced**`, '');

    out.push(table({
      head: ['App', 'State', 'What it is'],
      rows: m.apps.map((a) => [
        a[0].replace(/\|/g, '\\|'),
        BUILT.has(a[0]) ? '`WORKS TODAY`' : '`SPEC`',
        firstSentence(a[2]),
      ]),
    }), '');

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
    parts.push(part(p));
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

/* ── the shape gate ──────────────────────────────────────────────────────── */
/* Both editions, reduced to their skeleton. Words may differ; nothing else may.
 *
 * The steps half of this is cheap — both editions read one guide.js, so it can only catch
 * guide.js changing between the two runs. The half that does real work is Part 7, because
 * that IS built through the edition overlay: `applied()` merges the trade's wording into
 * every module and app before rendering. An overlay that renamed an app, dropped one, or
 * moved a module number would silently produce a trade document describing a different
 * system from the neutral one — the same failure build.js guards the website against, and
 * the reason this compares module and app names rather than only step ids. */
function skeleton() {
  const steps = GUIDE.parts
    .map((p) => p.n + ':' + p.steps.map((s) => s.id + '/' + s.label).join(','))
    .join(' | ');

  const applied = (m) => {
    if (!ED) return m;
    const o = (ED.modules || {})[m.n] || {};
    return Object.assign({}, m, {
      apps: m.apps.map((a) => ((o.apps && o.apps[a[0]]) ? [a[0], a[1], o.apps[a[0]]] : a)),
    });
  };
  /* Newline-separated, NOT space-separated: app names contain spaces ("Kit & Combo SKU"),
     so a space separator makes the failure message report a difference in the word "and"
     instead of naming the module that moved. */
  const mods = MODULES.map(applied)
    .map((m) => m.n + '[' + m.apps.map((a) => a[0]).join('|') + ']')
    .join('\n');

  return steps + '\n||\n' + mods;
}

const DOC = build();
const shape = skeleton();

/* CHECK BEFORE WRITING, not after.
   The first version of this wrote the document and then checked the shape, so a refusal
   still left the rejected file sitting on disk looking finished. A gate that fails after
   the damage is done is a log line, not a gate. */
const shapeFile = path.join(ROOT, '.guide-shape');
if (fs.existsSync(shapeFile)) {
  const prev = fs.readFileSync(shapeFile, 'utf8').trim();
  if (prev !== shape) {
    console.error('mkguide: the two editions do not describe the same system.\n');
    console.error('  An edition may change WORDS and may never change STRUCTURE — same parts,\n' +
      '  same step ids and labels, same module numbers, same app names and counts.\n');
    /* Name what moved. "They differ" sends somebody diffing two 90KB files by eye. */
    const [ps, pm] = prev.split('\n||\n');
    const [cs, cm] = shape.split('\n||\n');
    if (ps !== cs) console.error('  The STEPS differ — guide.js changed between the two runs.');
    if (pm !== cm) {
      console.error('  The MODULES differ — a module number, an app name or an app count moved.');
      const a = new Set((pm || '').split('\n'));
      const b = new Set((cm || '').split('\n'));
      [...b].filter((x) => !a.has(x)).slice(0, 5)
        .forEach((x) => console.error(`    only in this edition: ${x}`));
      [...a].filter((x) => !b.has(x)).slice(0, 5)
        .forEach((x) => console.error(`    only in the other:    ${x}`));
    }
    console.error(`\n  Nothing was written. Delete ${path.basename(shapeFile)} to start a fresh pair.`);
    process.exit(1);
  }
} else {
  fs.writeFileSync(shapeFile, shape + '\n');
}

fs.writeFileSync(EDITION.out, DOC);

const kb = Math.round(Buffer.byteLength(DOC) / 1024);
const nsteps = GUIDE.parts.reduce((s, p) => s + p.steps.length, 0);
console.log(`${path.relative(ROOT, EDITION.out)} written: ${kb}KB · ${EDITION.key} · ` +
  `10 parts · ${nsteps} steps + ${NMOD} modules · ` +
  `${(DOC.match(/```mermaid/g) || []).length} diagrams`);
console.log(`  derived: ${NMOD} modules (${NBUSINESS} + ${NSPINE} spine) · ${NAPP} apps · ` +
  `${NBUILT} built · ${NRULES} rules (${NENF} enforced) · ${NTABLES} tables · ` +
  `${NPACKS} packs · ${NTOOLS} tool capabilities`);
if (EDITION.domainAssumed) {
  console.log(`  NOTE: this guide writes ${EDITION.DOMAIN} throughout. That domain is ASSUMED — ` +
    `only medhava.com is confirmed. Substitute the real one before following it.`);
}
