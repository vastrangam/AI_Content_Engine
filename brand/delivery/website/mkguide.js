'use strict';
/* THE BUILD GUIDE — the technical design of the platform.
 *
 *   node brand/delivery/website/mkguide.js   → MEDHAVA_BUILD_GUIDE.md
 *
 * WHAT THIS DOCUMENT IS
 * How the platform is designed and built: architecture, database, backend, frontend, storage,
 * memory, sign-in, integrations, background work, search, the model layer, and how it is run.
 * Its reader is whoever is building it.
 *
 * IT DESCRIBES A DESIGN, NOT AN INVENTORY.
 * Nothing in the output claims to exist. The build-state labels this generator used to emit —
 * WORKS TODAY, SPEC, NOT BUILT — are gone, because in a document where every line is "to be
 * built" they would all say the same thing, and a label that never varies is noise that a
 * reader reasonably mistakes for information.
 *
 * WHAT IS PULLED IN, AND FROM WHERE
 *   guide.js       the parts and the steps
 *   stack.js       what each layer is built on and what replaces it — by `layer` on a part
 *   plainwords.js  every technical term, explained on FIRST use only — by `terms`
 *   dynamic.js     what a customer can change without a developer
 *   modules.js     the build order in Part 12
 *   rules.js       how many rules each module owes
 *
 * No count is typed. A stale "104 apps" sat in a pull-request title for weeks because somebody
 * typed it once and the list moved underneath it.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

const GUIDE = require(path.join(SITE, 'guide.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const RULES = require(path.join(SITE, 'rules.js'));
const TOOLS = require(path.join(SITE, 'tools.js'));
const FMT = require(path.join(SITE, 'guidefmt.js'));
const WORDS = require(path.join(SITE, 'plainwords.js'));
const { LAYERS } = require(path.join(SITE, 'stack.js'));
const DYN = require(path.join(SITE, 'dynamic.js'));
const RULEBOOK = require(path.join(SITE, 'rulebook.js'));

/* ── the counts, every one derived ───────────────────────────────────────── */
const NMOD = MODULES.length;
const NAPP = MODULES.reduce((s, m) => s + m.apps.length, 0);
const NRULES = RULES.length;
const NTOOLS = TOOLS.tools.length;
const NPACKS = fs.readdirSync(path.join(ROOT, 'core', 'packs')).filter((f) => f.endsWith('.json')).length;
const NLAYER = LAYERS.length;
const NSWAP = LAYERS.reduce((s, l) => s + (l.swaps || []).length, 0);
const NDYN = DYN.ENTRIES.length;
const NFIXED = DYN.IMMUTABLE.length;
const NSPINE = MODULES.filter((m) => m.spine).length;
const DATE = new Date().toISOString().slice(0, 10);

const NAME = 'Medhava';

/* ── token substitution ──────────────────────────────────────────────────── */
const TOKENS = {
  __NAME__: NAME,
  __NMOD__: String(NMOD),
  __NAPP__: String(NAPP),
  __NRULES__: String(NRULES),
  __NTOOLS__: String(NTOOLS),
  __NPACKS__: String(NPACKS),
  __NLAYER__: String(NLAYER),
  __NSWAP__: String(NSWAP),
};

function sub(text) {
  if (text == null) return text;
  let s = String(text);
  for (const [k, v] of Object.entries(TOKENS)) s = s.split(k).join(v);
  const left = s.match(/__[A-Z][A-Z0-9_]*__/g);
  if (left) throw new Error(`mkguide: undefined token(s): ${[...new Set(left)].join(', ')}`);
  return s;
}

/* ── glossary, on first use only ─────────────────────────────────────────── */
/* Explaining a word every time it appears makes a document unreadable; explaining it never
   leaves a reader stranded at exactly the word they needed. So: once, where it first comes up,
   and this set remembers which are already done. */
const explained = new Set();
function termsBlock(terms) {
  const fresh = (terms || []).filter((t) => !explained.has(t.toLowerCase()));
  if (!fresh.length) return '';
  fresh.forEach((t) => explained.add(t.toLowerCase()));
  return fresh.map((t) => {
    const line = WORDS.firstUse(t);
    if (!line) throw new Error(`mkguide: "${t}" is not in plainwords.js`);
    return '> ' + line.replace(/\n/g, '\n> ');
  }).join('\n>\n');
}

/* ── what a layer is built on, and what replaces it ──────────────────────── */
function layerBlock(id) {
  const l = LAYERS.find((x) => x.id === id);
  if (!l) throw new Error(`mkguide: no stack layer "${id}"`);
  const out = [
    `**${l.layer} — ${l.does}**`, '',
    sub(l.why), '',
    /* A real header. An empty one renders as a dark bar with nothing in it, which reads as a
       fault rather than as a design choice. */
    FMT.table({
      head: ['This layer', l.layer],
      rows: [
        ['**Built on**', l.def],
        ...(l.swaps || []).map((s, i) => [i === 0 ? '**Can be replaced with**' : '', s]),
        ['**Everything talks to**', '`' + l.iface + '`'],
        ['**Switching costs**', l.cost],
      ],
    }, sub),
  ];
  return out.join('\n');
}

/* ── the architecture picture ────────────────────────────────────────────── */
/* Left to right and six nodes wide. A tall top-down chart once could not fit inside a page
   and the printer silently dropped it, producing a heading above a blank sheet with every
   automated check passing. Wide and short prints. */
const ARCH = `\`\`\`mermaid
flowchart LR
  A["Screens<br/>what you see"] --> B["The API<br/>the doorway"]
  B --> C["Services<br/>the business rules"]
  C --> D["Adapters<br/>one per outside service"]
  C --> E["Data<br/>records and locks"]
  F["Settings<br/>every customer’s own"] -.->|"shapes"| A
  F -.->|"shapes"| C
\`\`\``;

/* ── Part 12, the build order, from the module list ──────────────────────── */
/* NOT reordered. The modules are numbered in dependency order already, and re-sorting a list
   somebody numbered is not an improvement — it is a second opinion nobody asked for. */
function buildOrder() {
  const out = [
    '### The modules, in the order they are built', '',
    `${NMOD} modules. Module 01 is the spine — not something you open, the layer everything else
stands on — which is why ${NMOD} modules is also ${NMOD - NSPINE} you use plus one underneath them.`,
    '',
    `Each row says what has to exist before it can start, and how many rules it must satisfy before
it is finished.`,
    '',
  ];
  out.push(FMT.table({
    head: ['#', 'Module', 'Needs first', 'Rules to satisfy'],
    rows: MODULES.map((m) => [
      m.n,
      m.name.replace(/\|/g, '\\|') + (m.spine ? ' *(spine)*' : ''),
      (m.reads || []).join(', ').replace(/\|/g, '\\|') || '—',
      String(RULES.filter((r) => r.mod === m.n).length),
    ]),
  }, sub), '');
  out.push(`**A module is finished when every rule for it is satisfied and proven by a test** — not
when its screens exist. Screens can be demonstrated; rules are what the books rely on.`, '');
  return out.join('\n');
}

/* ── what a customer can change ──────────────────────────────────────────── */
function dynamicBlock() {
  const out = [
    '## Part 13 · What a customer can change without you', '',
    `The measure of whether this design succeeded. Everything in this table is changed by the
customer, in the app, taking effect immediately — and none of it requires a developer, a release or a
phone call.`,
    '',
    `**${NDYN} things, across ${DYN.areas().length} areas.** For each one, the column that matters
most is the last: what happens to records already made.`,
    '',
  ];
  DYN.areas().forEach((area) => {
    out.push(`### ${area}`, '');
    out.push(FMT.table({
      head: ['What changes', 'Who', 'Immediately', 'Records already made'],
      rows: DYN.ENTRIES.filter((e) => e.area === area).map((e) => [
        e.what.replace(/\|/g, '\\|'),
        e.who,
        e.when.replace(/\n/g, ' ').replace(/\|/g, '\\|'),
        e.past.replace(/\n/g, ' ').replace(/\|/g, '\\|'),
      ]),
    }, sub), '');
  });
  out.push('### What can never be switched off', '');
  out.push(`Short on purpose. Every line is something a bank, an auditor, a customer or an employee
relies on, and a setting that could remove it would remove their protection too.`, '');
  out.push(FMT.table({
    head: ['Never changeable', 'Why'],
    rows: DYN.IMMUTABLE.map((m) => [m.what.replace(/\|/g, '\\|'), m.why.replace(/\|/g, '\\|')]),
  }, sub), '');
  return out.join('\n');
}

/* ── the document ────────────────────────────────────────────────────────── */
function build() {
  const bad = GUIDE.check();
  if (bad.length) {
    console.error(`mkguide: guide.js has ${bad.length} problem(s)\n`);
    bad.forEach((b) => console.error('  ' + b));
    process.exit(1);
  }

  const nsteps = GUIDE.parts.reduce((s, p) => s + p.steps.length, 0);

  const front = `# ${NAME} — the build guide

**How this platform is designed and built.**

${GUIDE.parts.length + 1} parts · ${nsteps} decisions · ${NLAYER} technical layers · compiled ${DATE}

---

## What this document is

**This describes a design. Nothing in it exists yet, and nothing in it claims to.** Every part is a
decision to be made and built. Where it says *done when*, that means the decision is made, written
down and proven by a test — not that something is running.

It is written for whoever builds the platform. A business using the platform installs nothing and
needs none of this; onboarding one is a separate document written for a reader with no terminal.

**Every technical word is explained the first time it appears**, in plain language, with an everyday
comparison where one helps. No prior knowledge is assumed anywhere in this document.

---

## The two rules everything obeys

**1 · No capability depends on one tool.** Every one of the ${NLAYER} layers names what it is built
on, **${NSWAP} named replacements** between them, and the interface the rest of the code talks to.
That last part is what makes switching a settings change rather than a rewrite. A check refuses any
layer with fewer than two alternatives or no interface, so the rule cannot quietly rot into a
paragraph nobody kept.

**2 · Nothing is static, and the past stays correct.** A customer can add, edit or remove anything at
any time, and it takes effect at once. Every change carries the date it starts from and who made it,
and is added rather than written over. So a supervisor can leave on Tuesday and a replacement start on
Wednesday, changed the same morning — and last month’s payroll, already paid, does not move by a
rupee. *Purana record mitta nahin; naye date se naya rule lagta hai.*

Part 13 lists all ${NDYN} things a customer can change, and the ${NFIXED} that can never be switched
off.

---

`;

  const parts = [];
  for (const p of GUIDE.parts) {
    const out = [`## Part ${p.n} · ${sub(p.title)}`, '', sub(p.lead), ''];

    const t = termsBlock(p.terms);
    if (t) out.push(t, '');
    if (p.diagram === 'architecture') out.push(ARCH, '');
    if (p.layer) out.push(layerBlock(p.layer), '');

    p.steps.forEach((s) => {
      const st = termsBlock(s.terms);
      const body = FMT.step(s, sub);
      /* The explanation goes above the step that first needs the word, not after it. */
      out.push(st ? body.replace(/\n\n/, '\n\n' + st + '\n\n') : body);
    });

    if (p.buildOrder) out.push(buildOrder());
    parts.push(out.join('\n'));
  }

  parts.push(dynamicBlock());

  /* THE RULEBOOK, IN FULL.
     This document had 0 of 285. The rules ARE the specification a developer implements —
     a build guide that names how many exist and prints none of them has described the
     shape of the work and omitted the work. */
  parts.push(['## Part 14 · The rulebook — what the system must refuse', '',
    `Every module is finished when its rules hold. Not when its screens exist — screens can be
demonstrated, rules are what the books rely on. So they are here in full rather than counted.`,
    '', RULEBOOK.render()].join('\n'));

  const foot = `---

## Every layer, and what replaces it

The whole of Rule 1 on one page.

${FMT.table({
    head: ['Layer', 'Built on', 'Alternatives', 'Talks to'],
    rows: LAYERS.map((l) => [
      l.layer.replace(/\|/g, '\\|'),
      l.def.replace(/\|/g, '\\|'),
      String((l.swaps || []).length),
      '`' + l.iface + '`',
    ]),
  }, sub)}

---

*Generated by \`brand/delivery/website/mkguide.js\` from \`brand/site/guide.js\`, \`stack.js\`,
\`plainwords.js\`, \`dynamic.js\` and the canonical lists. Every count is read from its source at
generation time — no module count, layer count or rule count is typed by hand. Nothing here is
maintained by editing this file: edit the source and regenerate.*
`;

  return front + parts.join('\n---\n\n') + '\n' + foot;
}

let DOC;
try {
  DOC = build();
} catch (e) {
  console.error('mkguide: refusing to write the document.\n');
  console.error('  ' + e.message.replace(/\n/g, '\n  '));
  console.error('\n  Nothing was written.');
  process.exit(1);
}

/* THE OUTPUT IS CHECKED, NOT ASSUMED.
   Two things a reader would notice and I would not: a technical word used but never explained,
   and build-state language claiming something exists in a document that describes a design. */
const unexplained = WORDS.checkwords(DOC);
if (unexplained.length) {
  console.error(`mkguide: ${unexplained.length} term(s) used but never explained: ` +
    unexplained.join(', '));
  console.error('  Add them to the `terms` of the step that first uses them.');
  process.exit(1);
}
const claim = /\b(works today|not built|already built|still pending)\b/i.exec(DOC.replace(/\s+/g, ' '));
if (claim) {
  console.error(`mkguide: the document says "${claim[0]}" — it describes a design, so nothing ` +
    `in it is built or pending.`);
  process.exit(1);
}

/* THE COVERAGE GATE — the one this generator did not have.
   mktenant.js gained it and this did not, so four documents shipped carrying 0 or 4 of 285
   rules and every check they had passed. A gate applied to one document is not a gate. */
const short = RULEBOOK.missingFrom(DOC);
if (short.ids.length || short.nevers.length) {
  console.error('mkguide: the document is INCOMPLETE. Refusing to write it.\n');
  if (short.ids.length) {
    console.error(`  · ${short.ids.length} of ${short.total} rules are absent — ` +
      `first few: ${short.ids.slice(0, 6).map((r) => r.id).join(', ')}`);
  }
  if (short.nevers.length) {
    console.error(`  · ${short.nevers.length} rules appear without what the system will never ` +
      `do instead`);
  }
  process.exit(1);
}

const OUT = path.join(ROOT, 'MEDHAVA_BUILD_GUIDE.md');
fs.writeFileSync(OUT, DOC);

const kb = Math.round(Buffer.byteLength(DOC) / 1024);
const nsteps = GUIDE.parts.reduce((s, p) => s + p.steps.length, 0);
console.log(`${path.relative(ROOT, OUT)} written: ${kb}KB · ${GUIDE.parts.length + 1} parts · ` +
  `${nsteps} decisions · ${(DOC.match(/```mermaid/g) || []).length} diagrams`);
console.log(`  derived: ${NLAYER} layers · ${NSWAP} alternatives · ${NMOD} modules · ${NAPP} apps · ` +
  `${NRULES} rules · ${NDYN} changeable · ${NFIXED} fixed · ${NPACKS} packs · ${NTOOLS} tools`);
console.log(`  ${explained.size} technical terms explained on first use · no unexplained term remains`);
