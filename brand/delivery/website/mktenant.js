'use strict';
/* THE TENANT GUIDE — one business on the platform, in full.
 *
 *   node brand/delivery/website/mktenant.js   → VASTRANGAM_TENANT_GUIDE.md
 *
 * WHO READS THIS
 * A business using the platform. It installs nothing and has no terminal, which is why tenant.js
 * refuses any step carrying a shell command.
 *
 * WHERE THE CONTENT COMES FROM — ALL OF IT READ, NONE OF IT RETYPED
 *   tenant.js                    the parts and steps
 *   core/tests/core.test.js      the companies and their four separate identities
 *   core/schema.postgres.sql     the channel kinds the system actually allows
 *   engine/fixtures/set_types    what each set contains, and the evidence for it
 *   engine/fixtures/garment_*    the column layout and the inference order
 *   engine/fixtures/master.json  the PAY BASES ONLY — never a person, never an amount
 *   engine/vastrangam/gates.py   what the engine refuses to do
 *   dynamic.js                   everything a business can change, and how the past resolves
 *   rules.js, modules.js         the rulebook and the module list
 *
 * THE PRIVACY LINE, AND WHERE IT IS DRAWN
 * master.json holds real people, real employment dates and real salaries, and its own header calls
 * it the owner’s data. This generator reads that file for the SHAPE of a pay basis and the DISTINCT
 * basis names — nothing else. No key, no date, no amount, no name is ever emitted. There is a check
 * at the bottom that reads the finished document and refuses to write it if a name got through.
 *
 * THIS DESCRIBES A DESIGN. Nothing in the output claims to exist.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

const TENANT = require(path.join(SITE, 'tenant.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const RULES = require(path.join(SITE, 'rules.js'));
const FMT = require(path.join(SITE, 'guidefmt.js'));
const WORDS = require(path.join(SITE, 'plainwords.js'));
const DYN = require(path.join(SITE, 'dynamic.js'));

const OUT = path.join(ROOT, 'VASTRANGAM_TENANT_GUIDE.md');

/* Words that appear here in their EVERYDAY sense, not the technical one the glossary defines.
   Explaining the technical meaning beside one of these would teach the reader something false
   about their own vocabulary, so each is listed deliberately with its reason.

     job   "Job work" is this trade’s own term for making goods on contract for somebody else.
           It has nothing to do with a background job.
     row   Appears only as a spreadsheet row — "Row 3 garment-type labels" — quoted from this
           business’s own recorded file layout. Not a database row, and not mine to reword: it
           describes a real sheet that a real person fills in. */
const SKIP_TERMS = ['job', 'row'];

const NMOD = MODULES.length;
const NRULES = RULES.length;
const NDYN = DYN.ENTRIES.length;
const NFIXED = DYN.IMMUTABLE.length;
const DATE = new Date().toISOString().slice(0, 10);

const TOKENS = {
  __TENANT__: 'Vastrangam',
  __STORE__: 'vastrangam.com',
  __PLATFORM__: 'Medhava',
  __NMOD__: String(NMOD),
  __NRULES__: String(NRULES),
  __NDYN__: String(NDYN),
  __NFIXED__: String(NFIXED),
};

function sub(text) {
  if (text == null) return text;
  let s = String(text);
  for (const [k, v] of Object.entries(TOKENS)) s = s.split(k).join(v);
  const left = s.match(/__[A-Z][A-Z0-9_]*__/g);
  if (left) throw new Error(`mktenant: undefined token(s): ${[...new Set(left)].join(', ')}`);
  return s;
}

const esc = (s) => String(s).replace(/\|/g, '\\|');

/* ── glossary, first use only ────────────────────────────────────────────── */
const explained = new Set();
function termsBlock(terms) {
  const fresh = (terms || []).filter((t) => !explained.has(t.toLowerCase()));
  if (!fresh.length) return '';
  fresh.forEach((t) => explained.add(t.toLowerCase()));
  return fresh.map((t) => {
    const line = WORDS.firstUse(t);
    if (!line) throw new Error(`mktenant: "${t}" is not in plainwords.js`);
    return '> ' + line;
  }).join('\n>\n');
}

/* ── the companies, from the fixture that already uses them ──────────────── */
function companiesBlock() {
  const src = fs.readFileSync(path.join(ROOT, 'core', 'tests', 'core.test.js'), 'utf8');
  const rows = [];
  const re = /name:\s*'([^']+)',\s*brand_name:\s*'([^']+)',\s*brand_code:\s*'([^']+)',\s*invoice_prefix:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src))) rows.push([m[1], m[2], '`' + m[3] + '`', '`' + m[4] + '`']);
  if (rows.length < 3) throw new Error(`mktenant: found ${rows.length} companies, expected 3+`);
  return FMT.table({
    head: ['Legal name', 'Trades as', 'Brand code', 'Invoice prefix'],
    rows,
  }, sub);
}

/* ── channel kinds, from the database’s own constraint ───────────────────── */
function channelsBlock() {
  const sql = fs.readFileSync(path.join(ROOT, 'core', 'schema.postgres.sql'), 'utf8');
  const m = /CHECK \(kind IN \('d2c'[^)]*\)\)/.exec(sql);
  if (!m) throw new Error('mktenant: could not read the channel kinds from the schema');
  const kinds = m[0].match(/'([a-z0-9_]+)'/g).map((s) => s.replace(/'/g, ''));
  const meaning = {
    d2c: 'Your own shop — `__STORE__` is this one',
    marketplace: 'A marketplace account. One for each marketplace, for each company',
    b2b: 'Wholesale, usually on credit terms',
    export: 'Overseas, with its own documents',
    pos: 'A counter, drawing on the same stock as the shop',
    reseller: 'Somebody selling on your behalf',
  };
  return FMT.table({
    head: ['Kind', 'What it is'],
    rows: kinds.map((k) => ['`' + k + '`', meaning[k] || '—']),
  }, sub);
}

/* ── what each set contains ──────────────────────────────────────────────── */
function setTypesBlock() {
  const f = require(path.join(ROOT, 'engine', 'fixtures', 'set_types.json'));
  const comps = Object.values(f.compositions || {});
  if (!comps.length) throw new Error('mktenant: no set compositions found');
  const out = [
    FMT.table({
      head: ['Set type', 'What it contains', 'Designs checked'],
      rows: comps.map((c) => [
        esc(c.set_type),
        (c.slots || []).join(' + '),
        String(c.designs_tested != null ? c.designs_tested : '—'),
      ]),
    }, sub),
    '',
    `**These were not read off the names.** Each one was checked against real production records
until only one composition reproduced every design. Two of them prove why that mattered:`,
    '',
  ];
  const evidenced = comps.filter((c) => c.evidence && /records|reports/.test(c.evidence)).slice(0, 2);
  evidenced.forEach((c) => out.push(`- **${c.set_type}** — ${c.evidence}`));
  out.push('');
  return out.join('\n');
}

/* ── how a missing set type is worked out ────────────────────────────────── */
function inferenceBlock() {
  const g = require(path.join(ROOT, 'engine', 'fixtures', 'garment_columns.json'));
  const cols = Array.isArray(g.columns) ? g.columns.length : Object.keys(g.columns || {}).length;
  return [
    FMT.table({
      head: ['The set type for a design', 'How it is decided'],
      rows: [
        ['**Where it normally comes from**', 'Your rates master — the design, its set, its attribute and its rate'],
        ['**When that has no entry**', 'Worked out from which columns have numbers, checked most specific first'],
        ['**The order checked**', 'Lehenga · Anarkali · Kurti Palazzo · Kurti Plazo · Co-Ords · single column'],
        ['**What then happens**', 'The result is **flagged as worked out**, never presented as known'],
        ['**Columns in the report**', `${cols}, arranged in groups by set category`],
      ],
    }, sub),
    '',
    `The layout matters when somebody fills it in: ${esc(g._header_layout || '')}`,
  ].join('\n');
}

/* ── the pay bases — the VALUES only, never a person ─────────────────────── */
function payBasisBlock() {
  const m = require(path.join(ROOT, 'engine', 'fixtures', 'master.json'));
  const bases = [...new Set((m.pay_basis || []).map((e) => e.value))].filter(Boolean).sort();
  if (!bases.length) throw new Error('mktenant: no pay bases found');
  const meaning = {
    Flat: 'A fixed amount for the period, whatever the hours. Hours are recorded and reported, and never scale the pay.',
    Attendance: 'Resolved from the days and the attendance recorded for the period, against the rate in force on those dates.',
    Piece: 'Earned per unit of work completed, at the rate in force for that work on the date it was done.',
  };
  return [
    `**${bases.length} ways of being paid**, and a person can move between them — from a date, never
backwards by accident.`,
    '',
    FMT.table({
      head: ['Basis', 'How the figure is reached'],
      rows: bases.map((b) => ['**' + b + '**', meaning[b] || 'Defined by your own rules for this basis.']),
    }, sub),
    '',
    `Each person’s basis is held as a small history — what it became, and the date it started
applying — so asking "what was this person on in March" has an exact answer rather than requiring
somebody to remember.`,
  ].join('\n');
}

/* ── what the engine refuses ─────────────────────────────────────────────── */
function gatesBlock() {
  const src = fs.readFileSync(path.join(ROOT, 'engine', 'vastrangam', 'gates.py'), 'utf8');
  const rows = [];
  const re = /^def ([a-z_][a-z0-9_]*)\s*\([^)]*\)[^:]*:\s*\n\s*"""([^"\n]+)/gm;
  let m;
  while ((m = re.exec(src))) {
    if (m[1].startsWith('_') || ['report', 'all_passed'].includes(m[1])) continue;
    rows.push([`\`${m[1].replace(/_/g, ' ')}\``, esc(m[2].trim().replace(/\.$/, ''))]);
  }
  if (rows.length < 5) throw new Error(`mktenant: found ${rows.length} gates, expected several`);
  return [
    `**${rows.length} checks, and every one of them blocks the work rather than warning about it.**`,
    '',
    FMT.table({ head: ['The check', 'What it will not let through'], rows }, sub),
  ].join('\n');
}

/* ── everything that can be changed ──────────────────────────────────────── */
function dynamicBlock() {
  const out = [];
  DYN.areas().forEach((area) => {
    out.push(`### ${area}`, '');
    out.push(FMT.table({
      head: ['What you change', 'Who can', 'What happens at once', 'What happens to old records'],
      rows: DYN.ENTRIES.filter((e) => e.area === area).map((e) => [
        esc(e.what),
        e.who,
        esc(e.when.replace(/\n/g, ' ')),
        esc(e.past.replace(/\n/g, ' ')),
      ]),
    }, sub), '');
  });
  out.push('### What nobody can switch off', '');
  out.push(`Short on purpose. Every line is something your bank, your auditor, your customer or your
own staff is relying on — a setting that could remove it would remove their protection with it.`, '');
  out.push(FMT.table({
    head: ['Never changeable', 'Why'],
    rows: DYN.IMMUTABLE.map((m) => [esc(m.what), esc(m.why)]),
  }, sub), '');
  return out.join('\n');
}

/* ── the rulebook, by module ─────────────────────────────────────────────── */
function rulebookBlock() {
  const rows = MODULES.map((m) => {
    const mine = RULES.filter((r) => r.mod === m.n);
    return [m.n, esc(m.name), String(mine.length)];
  }).filter((r) => r[2] !== '0');
  return [
    `**${NRULES} rules across ${rows.length} modules.** Every one says what happens *and* what the
system will never do instead.`,
    '',
    FMT.table({ head: ['#', 'Module', 'Rules'], rows }, sub),
  ].join('\n');
}

/* ── the document ────────────────────────────────────────────────────────── */
function build() {
  const bad = TENANT.check();
  if (bad.length) {
    console.error(`mktenant: tenant.js has ${bad.length} problem(s)\n`);
    bad.forEach((b) => console.error('  ' + b));
    process.exit(1);
  }

  const nsteps = TENANT.parts.reduce((s, p) => s + p.steps.length, 0);

  const front = `# ${TOKENS.__TENANT__} — the tenant guide

**One business on ${TOKENS.__PLATFORM__}: everything it runs on, and how it changes any of it.**

${TENANT.parts.length} parts · ${nsteps} steps · compiled ${DATE}

---

## What this document is

**This describes a design. Nothing in it exists yet, and nothing in it claims to.**

It is written for the business, not for the people building the software. **You install nothing** —
no server, no software, no technical person. Everything here happens in a browser or on a phone.

It carries everything this business actually runs on: the companies, the channels, the products and
what each set contains, how work is counted and paid, how people and attendance are handled, what the
system refuses to do, and the rules that apply. Nothing is left out on the grounds that it is
detail — the detail is where the money is.

**Every technical word is explained the first time it appears**, in plain language, with an everyday
comparison. No prior knowledge is needed anywhere.

### Where you do each thing

| | |
|---|---|
| \`IN THE APP\` | On a screen, by an administrator |
| \`ON A PHONE\` | By anybody, from a basic phone, in their own language |
| \`WITH YOUR TEAM\` | A decision or an agreement, not a screen |
| \`OUTSIDE\` | On somebody else’s website — a marketplace, a shop platform |

### The promise this whole design keeps

**You can change anything, at any time, and it takes effect at once. And the past does not move.**

Every change carries the date it starts from. So a supervisor can leave on Tuesday without notice, a
replacement start Wednesday morning, both recorded the same day — and last month’s payroll, already
paid, still comes out to the same rupee. *Purana record mitta nahin; naye date se naya rule lagta
hai.*

Part 9 works that exact case through, and lists all ${NDYN} things you can change and the ${NFIXED}
nobody can switch off.

### About people

**No person is named anywhere in this document.** Names, salaries and employment details live in your
system, behind permissions — not in a file that gets printed, emailed and forwarded. Every rule here
is described by its shape, which is what makes it a rule rather than a list.

---

`;

  const blocks = {
    companies: companiesBlock(),
    channelKinds: channelsBlock(),
    setTypes: setTypesBlock(),
    inference: inferenceBlock(),
    payBasis: payBasisBlock(),
    gates: gatesBlock(),
    dynamic: dynamicBlock(),
    rulebook: rulebookBlock(),
  };

  const parts = [];
  for (const p of TENANT.parts) {
    const out = [`## Part ${p.n} · ${sub(p.title)}`, '', sub(p.lead), ''];
    const t = termsBlock(p.terms);
    if (t) out.push(t, '');
    for (const key of Object.keys(blocks)) if (p[key]) out.push(blocks[key], '');
    p.steps.forEach((s) => {
      const st = termsBlock(s.terms);
      const body = FMT.step(s, sub, blocks);
      out.push(st ? body.replace(/\n\n/, '\n\n' + st + '\n\n') : body);
    });
    parts.push(out.join('\n'));
  }

  const foot = `---

*Generated by \`brand/delivery/website/mktenant.js\` from \`brand/site/tenant.js\` and this
business’s own recorded logic — the companies, the channel kinds, the set compositions, the column
layout, the pay bases and the refusal checks are all read from source at generation time, never
retyped. Nothing here is maintained by editing this file: edit the source and regenerate.*
`;

  return front + parts.join('\n---\n\n') + '\n' + foot;
}

let DOC;
try {
  DOC = build();
} catch (e) {
  console.error('mktenant: refusing to write the document.\n');
  console.error('  ' + e.message.replace(/\n/g, '\n  '));
  console.error('\n  Nothing was written.');
  process.exit(1);
}

/* ── the checks that run on the finished document ────────────────────────── */

/* 1 · NO PERSON GOT THROUGH.
   The real names live in master.json. They are read here ONLY to check they are absent from the
   output, and never emitted — which is the one use of that list that makes the document safer
   rather than more dangerous. */
const roster = (() => {
  try {
    const m = require(path.join(ROOT, 'engine', 'fixtures', 'master.json'));
    const keys = new Set();
    ['people', 'employment', 'pay_basis', 'salary'].forEach((k) => {
      (m[k] || []).forEach((e) => { if (e && e.key) keys.add(String(e.key).toLowerCase()); });
    });
    return [...keys];
  } catch (_) { return []; }
})();
const leaked = roster.filter((n) => new RegExp('\\b' + n + '\\b', 'i').test(DOC));
if (leaked.length) {
  console.error(`mktenant: ${leaked.length} name(s) from the roster reached the document. ` +
    `Describe the rule by its shape, never by naming a person.`);
  process.exit(1);
}

/* 2 · every technical word explained */
const unexplained = WORDS.checkwords(DOC, { skip: SKIP_TERMS });
if (unexplained.length) {
  console.error(`mktenant: term(s) used but never explained: ${unexplained.join(', ')}\n`);
  /* Naming the term is not enough to fix it — the fix is to explain it where it FIRST appears,
     and finding that by eye in a 30KB document is the kind of search that gets abandoned. So
     the line is printed. */
  unexplained.forEach((t) => {
    const re = new RegExp('^.*\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 's?\\b.*$', 'im');
    const line = re.exec(DOC.replace(/\s+/g, ' '));
    console.error(`  "${t}" first appears in:`);
    console.error(`    ${(line ? line[0] : '').trim().slice(0, 150)}`);
  });
  console.error(`\n  Either add it to the \`terms\` of the step that first uses it, or — if the ` +
    `\n  everyday meaning was intended rather than the technical one — reword it.`);
  process.exit(1);
}

/* 3 · nothing claims to be built */
const claim = /\b(works today|not built|already built|still pending)\b/i.exec(DOC.replace(/\s+/g, ' '));
if (claim) {
  console.error(`mktenant: the document says "${claim[0]}" — it describes a design.`);
  process.exit(1);
}

/* 4 · no shell command reached a reader with no terminal */
if (/^\s*(npm|node|git|cd|mkdir|sudo|apt) /m.test(DOC)) {
  console.error('mktenant: a shell command reached the document — this reader has no terminal.');
  process.exit(1);
}

fs.writeFileSync(OUT, DOC);

const kb = Math.round(Buffer.byteLength(DOC) / 1024);
const nsteps = TENANT.parts.reduce((s, p) => s + p.steps.length, 0);
console.log(`${path.relative(ROOT, OUT)} written: ${kb}KB · ${TENANT.parts.length} parts · ` +
  `${nsteps} steps · ${(DOC.match(/```mermaid/g) || []).length} diagrams`);
console.log(`  read from source: companies, channel kinds, set compositions, column layout, ` +
  `pay bases, refusal checks, ${NDYN} changeable things, ${NRULES} rules`);
console.log(`  ${explained.size} terms explained on first use · ` +
  `${roster.length} roster names checked for, 0 present · no shell command`);
