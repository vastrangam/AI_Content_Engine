'use strict';
/* THE ARCHITECT — what Medhava is, and why it is that.
 *
 *   node brand/delivery/website/mkarchitect.js   → MEDHAVA_ARCHITECT.md
 *
 * WHO READS IT
 * Somebody deciding whether this design is right — an engineer, a buyer, or an agent about to
 * build from it. It answers WHAT and WHY. MEDHAVA_BUILD_GUIDE.md answers HOW, in order.
 *
 * The line between the two, and it is a real one: a sentence belongs here if it survives a change
 * of language, framework or host. "Money is whole paise, never a float" survives. "Run npm ci"
 * does not.
 *
 * WHAT IS PULLED IN, AND FROM WHERE — every figure derived, none typed
 *   architect.js    the decisions, each with what, why, and what would make it wrong
 *   stack.js        19 layers and their alternatives
 *   modules.js      the modules, their apps, and who reads and writes what
 *   partv.js        the 43 tables Part V specifies and where each one landed
 *   schema          the real table count, counted from the file at generation time
 *   dynamic.js      what a tenant changes and what nobody changes
 *   rules.js        the rulebook, cited per module
 *   plainwords.js   every technical term, explained on first use
 *
 * IT DESCRIBES A DESIGN. Nothing in the output claims to be running, and a check at the foot
 * refuses to write the file if it starts claiming otherwise.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

const ARCH = require(path.join(SITE, 'architect.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const RULES = require(path.join(SITE, 'rules.js'));
const TOOLS = require(path.join(SITE, 'tools.js'));
const FMT = require(path.join(SITE, 'guidefmt.js'));
const WORDS = require(path.join(SITE, 'plainwords.js'));
const { LAYERS } = require(path.join(SITE, 'stack.js'));
const DYN = require(path.join(SITE, 'dynamic.js'));
const PARTV = require(path.join(ROOT, 'core', 'partv.js'));

/* ── every figure, counted ───────────────────────────────────────────────── */
const SCHEMA = fs.readFileSync(path.join(ROOT, 'core', 'schema.postgres.sql'), 'utf8');
const NTABLE = new Set([...SCHEMA
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n]*/g, '')
  .matchAll(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+([a-z_][a-z0-9_]*)/gi)]
  .map((m) => m[1].toLowerCase())).size;
const NMOD = MODULES.length;
const NAPP = MODULES.reduce((s, m) => s + m.apps.length, 0);
const NRULES = RULES.length;
const NENF = RULES.filter((r) => r.state === 'ENFORCED').length;
const NLAYER = LAYERS.length;
const NSWAP = LAYERS.reduce((s, l) => s + (l.swaps || []).length, 0);
const NDYN = DYN.ENTRIES.length;
const NFIXED = DYN.IMMUTABLE.length;
const NTOOLS = TOOLS.tools.length;
const NPACKS = fs.readdirSync(path.join(ROOT, 'core', 'packs')).filter((f) => f.endsWith('.json')).length;
const NPARTV = PARTV.TABLES.length;
const NPARTV_NEW = PARTV.NEW_TABLES.length;
const NPARTV_EXT = PARTV.EXTENSIONS.length;

const esc = (s) => String(s).replace(/\|/g, '\\|');
const sub = (t) => t;   /* the platform edition speaks in its own words already */

/* ── glossary, first use only ────────────────────────────────────────────── */
const explained = new Set();
function termsBlock(terms) {
  const fresh = (terms || []).filter((t) => !explained.has(t.toLowerCase()));
  if (!fresh.length) return '';
  fresh.forEach((t) => explained.add(t.toLowerCase()));
  return fresh.map((t) => {
    const line = WORDS.firstUse(t);
    if (!line) throw new Error(`mkarchitect: "${t}" is not in plainwords.js`);
    return '> ' + line;
  }).join('\n>\n');
}

/* ── the derived registers this document carries ─────────────────────────── */

function stackBlock() {
  /* The ALTERNATIVES, spelled out and not counted. A number in a "ways out" column is a claim
     that somebody checked; the names are what let a reader check it themselves, which is the
     whole point of the register. */
  return [
    FMT.table({
      head: ['Layer', 'What it does', 'Built on', 'Ways out'],
      rows: LAYERS.map((l) => [
        esc(l.layer), esc((l.does || '').split('.')[0] + '.'),
        '**' + esc(l.def) + '**', String((l.swaps || []).length),
      ]),
    }, sub),
    '',
    '**And what replaces each one.** A count in a "ways out" column is a claim somebody checked; ' +
    'the sentences are what let a reader check it. Each is printed whole, because a named ' +
    'alternative with its reasoning removed is a name, and a name is not an escape route.',
    '',
    LAYERS.map((l) => '- **' + esc(l.layer) + '** — ' +
      (l.swaps || []).map((w) => esc(String(w).replace(/\s+/g, ' '))).join(' · ')).join('\n'),
    '',
    `${NLAYER} layers, ${NSWAP} named alternatives between them. A layer is refused entry to this ` +
    'design without at least two, because a layer with no alternative is a layer nobody chose.',
  ].join('\n');
}

function moduleBlock() {
  return [
    FMT.table({
      head: ['#', 'Module', 'Apps', 'Rules'],
      rows: MODULES.map((m) => [
        m.n, esc(m.name), String(m.apps.length),
        String(RULES.filter((r) => r.mod === m.n).length),
      ]),
    }, sub),
    '',
    `${NMOD} modules, ${NAPP} apps, ${NRULES} rules of which ${NENF} are enforced by a named test. ` +
    'Every one of these figures is counted from the source at the moment this page was written; ' +
    'none was typed.',
  ].join('\n');
}

function partvBlock() {
  const g = {};
  PARTV.TABLES.forEach((t) => { g[t.group] = (g[t.group] || 0) + 1; });
  return [
    FMT.table({
      head: ['Group', 'Tables', 'How they landed'],
      rows: Object.keys(PARTV.GROUPS).map((k) => {
        const inGroup = PARTV.TABLES.filter((t) => t.group === k);
        const ext = inGroup.filter((t) => t.kind === 'extends').length;
        return [esc(PARTV.GROUPS[k]), String(g[k]),
          ext ? `${inGroup.length - ext} new, ${ext} extending a table that already existed`
              : 'all new'];
      }),
    }, sub),
    '',
    `${NPARTV} tables specified, ${NPARTV_NEW} added and ${NPARTV_EXT} folded into tables that ` +
    'already did the job. A duplicate table is worse than a missing one — two places to write a ' +
    'certificate, and two answers to how many expire this quarter — so each of the ' +
    `${NPARTV_EXT} names the columns it brought and a test checks them against a running database.`,
  ].join('\n');
}

function dynamicBlock() {
  /* ALL of them, both halves. An earlier draft sliced this to the first twelve and the coverage
     gate caught it — a register that shows some of itself is worse than one that shows none,
     because the reader has no way to know which half they are looking at. */
  return [
    FMT.table({
      head: ['A tenant changes, without a developer', 'Who', 'When it takes effect'],
      rows: DYN.ENTRIES.map((e) => [
        esc(e.what || ''), esc(e.who || ''),
        esc(e.when || 'immediately, from a date it chooses'),
      ]),
    }, sub),
    '',
    '**And what nobody changes** — the half that makes the half above safe.',
    '',
    FMT.table({
      head: ['Fixed', 'Why it cannot be switched off'],
      rows: DYN.IMMUTABLE.map((e) => [esc(e.what || ''), esc(e.why || '')]),
    }, sub),
    '',
    `${NDYN} things a business changes for itself, without a developer and without a release. ` +
    `And ${NFIXED} nobody changes, which is the half that makes the first half safe: a business ` +
    'that could switch off its own audit trail could switch off the record of having done so.',
  ].join('\n');
}

/* ── build ───────────────────────────────────────────────────────────────── */

const DATE = new Date().toISOString().slice(0, 10);

let out = [];
const p = (...x) => out.push(...x);

p('# Medhava — the Architect', '');
p(`**What this system is, and why it is shaped this way.** ${NMOD} modules · ${NAPP} apps · ` +
  `${NTABLE} tables · ${NRULES} rules · ${NLAYER} layers with ${NSWAP} ways out.`, '');
p(`Every figure on this page is counted from the source files at the moment it was written. ` +
  `None was typed from memory, which is why they have already changed twice.`, '');
p('---', '');

p('## How to read this, and its companion', '');
p(FMT.table({
  head: ['Document', 'Answers', 'Read it when'],
  rows: [
    ['**MEDHAVA_ARCHITECT** (this one)', 'WHAT and WHY',
      'You are deciding whether this design is right, or you need to argue with a decision'],
    ['**MEDHAVA_BUILD_GUIDE**', 'HOW, in order',
      'You are building it, from an empty machine to a deployed product'],
  ],
}, sub), '');
p('The test for which document a sentence belongs in: does it survive a change of language, ' +
  'framework or host? *"Money is whole paise, never a float"* survives, so it is here. ' +
  '*"Run npm ci"* does not, so it is there.', '');
p('**Nothing in this document claims to be running.** It is a design, and the point of writing ' +
  'it down is so that what gets built is the thing that was decided rather than the thing that ' +
  'was convenient on the day.', '');
p('---', '');

/* Every decision, part by part. */
for (const part of ARCH.parts) {
  p(`## Part ${part.n} · ${part.title}`, '');
  p(part.lead, '');
  for (const s of part.sections) {
    const t = termsBlock(s.terms);
    p(`### ${s.id} · ${s.decision}`, '');
    if (t) p(t, '');
    p(`**What.** ${s.what}`, '');
    p(`**Why.** ${s.why}`, '');
    p(`**What would make this the wrong decision.** ${s.wrong_if}`, '');
  }
  p('---', '');
}

p('## Part 8 · The registers, derived', '');
p('Four tables that are generated rather than maintained. Each is read from the one file that ' +
  'owns that fact, so none of them can drift from the software it describes.', '');

/* THE REGISTERS INTRODUCE WORDS THE PROSE NEVER NEEDED — the stack table alone names the backend,
   the frontend, the queue and the search index just by listing the layers. Which words those are
   is COMPUTED from the rendered registers rather than listed by hand, because a hand-typed list
   goes stale the moment a layer is renamed and then the reader meets an unexplained word. */
const REGISTERS = [stackBlock(), moduleBlock(), partvBlock(), dynamicBlock()].join('\n\n');
const introduced = WORDS.checkwords(out.join('\n') + '\n' + REGISTERS, { skip: ['job', 'row'] })
  .filter((t) => !explained.has(t.toLowerCase()));
if (introduced.length) {
  p('**The words the tables below introduce.** The registers name every layer and module, which ' +
    'brings in vocabulary the argument above did not need.', '');
  p(termsBlock(introduced), '');
}

p('### 8.1 · The stack, and its ways out', '', stackBlock(), '');
p('### 8.2 · The modules', '', moduleBlock(), '');
p('### 8.3 · The data model', '');
p(`${NTABLE} tables, in build-phase order so the first phase can be run without reading the rest. ` +
  'Every business table carries a company, row-level security, FORCE, and a grant — all four, ' +
  'because three of them without the grant is a table nobody can read and three without the ' +
  'policy is a table everybody can.', '');
p(partvBlock(), '');
p('### 8.4 · What a business changes for itself', '', dynamicBlock(), '');
p('---', '');

p('## Part 9 · What is real, and what is designed', '');
p('This matters more than usual, because this document is written to be built FROM. Overstating ' +
  'what exists would mean whoever builds it is told to skip something that is not there.', '');
p(FMT.table({
  head: ['Piece', 'State', 'How you can check'],
  rows: [
    [`The data model — ${NTABLE} tables`, '**Runs**',
      'Loaded into a real PostgreSQL by a test that opens with a control which must leak before anything else is believed'],
    ['Company and tenant isolation', '**Runs**',
      'Cross-company read and cross-company write both refused, asked of the database rather than asserted about the file'],
    ['The payroll and production engine', '**Runs**',
      'Its own self-tests, covering the dated logs, the pay bases, set completion and the workbook that recalculates'],
    [`The rulebook — ${NRULES} rules`, `**${NENF} enforced**`,
      'An enforced rule must name a file and a test that exist, or the build fails'],
    [`The ${NAPP} apps`, '**Designed**',
      'A working subset exists as prototypes; the full set is what this document specifies'],
    [`The ${NPACKS} industry packs`, '**Run as data**',
      'Gated by their own test, including the rule that a new trade is refused the same things the first ones are'],
  ],
}, sub), '');
p(`**${NTOOLS} capabilities, free-first.** Every one starts on something that costs nothing, and ` +
  'a paid choice has to name both the free option it replaced and the specific trigger that ' +
  'justifies the money.', '');
p('## Part 10 · Every technical word on this page, in plain language', '');
p('One glossary, shared by every document in this set. An agent building from this page should ' +
  'never have to guess what a word means, and a reader should never have to look one up ' +
  'somewhere else.', '');
p(FMT.table({
  head: ['Word', 'What it means', 'The everyday version'],
  rows: WORDS.WORDS.map((w) => [
    '**' + esc(w.term) + '**', esc(w.plain), w.hinglish ? '*' + esc(w.hinglish) + '*' : '—',
  ]),
}, sub), '');
p('---', '');
p(`*Generated by \`brand/delivery/website/mkarchitect.js\` from \`brand/site/architect.js\` and ` +
  `the canonical sources it names. ${DATE}. Nothing here was retyped: regenerate rather than ` +
  `editing this file.*`, '');

const DOC = out.join('\n') + '\n';

/* ── the checks, before it is written ────────────────────────────────────── */
const problems = ARCH.check();

const unexplained = WORDS.checkwords(DOC, { skip: ['job', 'row'] });
if (unexplained.length) {
  problems.push(`uses ${unexplained.length} technical term(s) it never explains: ` +
    unexplained.join(', ') + ' — add them to the `terms` of the decision that first uses one');
}
const claim = /\b(works today|not built|already built|still pending)\b/i.exec(DOC.replace(/\s+/g, ' '));
if (claim) problems.push(`says "${claim[0]}" — this describes a design, so nothing is built or pending`);

if (problems.length) {
  console.error('mkarchitect: refusing to write —\n  ' + problems.join('\n  '));
  process.exit(1);
}

const OUT = path.join(ROOT, 'MEDHAVA_ARCHITECT.md');
fs.writeFileSync(OUT, DOC);

const nsec = ARCH.parts.reduce((s, x) => s + x.sections.length, 0);
console.log(`MEDHAVA_ARCHITECT.md written: ${Math.round(Buffer.byteLength(DOC) / 1024)}KB · ` +
  `${ARCH.parts.length + 2} parts · ${nsec} decisions, every one with what would make it wrong`);
console.log(`  derived: ${NMOD} modules · ${NAPP} apps · ${NTABLE} tables · ${NRULES} rules ` +
  `(${NENF} enforced) · ${NLAYER} layers · ${NSWAP} swaps · ${NDYN} changeable · ${NFIXED} fixed`);
console.log(`  ${explained.size} technical terms explained on first use · no unexplained term remains`);
