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
 *   engine/fixtures/locked_lists the closed lists — the seven service providers and the five
 *                                lead sources, which lived only in prose until now
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
const TBUILD = require(path.join(SITE, 'tenantbuild.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const RULES = require(path.join(SITE, 'rules.js'));
const FMT = require(path.join(SITE, 'guidefmt.js'));
const WORDS = require(path.join(SITE, 'plainwords.js'));
const DYN = require(path.join(SITE, 'dynamic.js'));
const REG = require(path.join(SITE, 'registers.js'));

/* THREE DOCUMENTS FROM ONE RENDERER.
 *
 * This file used to write one document, VASTRANGAM_TENANT_GUIDE.md, which was both the setup
 * runbook and the rules reference. That is two readers in one file: somebody in their first week
 * with an empty account, and somebody nine months in looking up how a month is computed. The
 * first needs an order and the second needs an index, and a document that serves both serves the
 * second — because the ordering that makes a reference usable is the ordering that makes a first
 * week impossible to follow.
 *
 * So: the ordered runbook and the rules reference are separate documents, and the third is the
 * two of them bound together for anybody who wants one file. All three are rendered by the code
 * below rather than by three generators, because three copies of the rendering is how three
 * documents start disagreeing about the same table. */
const DOCS = {
  build: {
    file: 'VASTRANGAM_BUILD_GUIDE.md',
    parts: TBUILD.parts,
    check: TBUILD.check,
    /* The runbook does not carry the rulebook, so the coverage gate that demands all 285 would
       fail it for being what it is. It gets the gates that DO apply to it. */
    full: false,
  },
  rules: {
    file: 'VASTRANGAM_RULES_AND_LOGIC.md',
    parts: TENANT.parts,
    check: TENANT.check,
    full: true,
  },
};
const FINAL = 'Vastrangam_Final_As_Tenant.md';

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

/* What the fixture says happens when one of a set's pieces was never stitched.
   Three answers, and the third is the honest one today: nobody has decided, so
   the report shows both counts and marks the design rather than choosing. */
function emptySlotAnswer(c) {
  const req = c.required || {};
  const answers = (c.slots || []).map((s) => req[s]);
  if (answers.every((v) => v === true)) return 'the design counts zero sets';
  if (answers.every((v) => v === false)) return 'that piece drops out of the count';
  if (answers.every((v) => v === null || v === undefined)) return '**your decision** — both counts shown';
  return (c.slots || []).map((s, i) => `${s}: ${
    req[s] === true ? 'needed' : req[s] === false ? 'optional' : 'your decision'}`).join(' · ');
}

/* ── what each set contains ──────────────────────────────────────────────── */
function setTypesBlock() {
  const f = require(path.join(ROOT, 'engine', 'fixtures', 'set_types.json'));
  const comps = Object.values(f.compositions || {});
  if (!comps.length) throw new Error('mktenant: no set compositions found');
  const out = [
    FMT.table({
      head: ['Set type', 'What it contains', 'Designs checked', 'If a piece is missing'],
      rows: comps.map((c) => [
        esc(c.set_type),
        (c.slots || []).join(' + '),
        String(c.designs_tested != null ? c.designs_tested : '—'),
        emptySlotAnswer(c),
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

/* ── the closed lists ─────────────────────────────────────────────────────
   Two short lists this business fixed by decision. Both lived only in prose — one of them only in
   a superseded report — so the guide could drift from the specification and nothing would notice.
   Read from engine/fixtures/locked_lists.json now, with the same "what locked does and does not
   mean" sentence in both places, because a closed list a tenant cannot extend would contradict
   every other page of this guide. */
function lockedList(key, head, rows) {
  const f = require(path.join(ROOT, 'engine', 'fixtures', 'locked_lists.json'));
  const block = f[key];
  if (!block || !Array.isArray(block.list)) throw new Error(`mktenant: no locked list "${key}"`);
  return [
    FMT.table({ head, rows: rows(block.list) }, sub),
    '',
    `**Closed today, not closed forever.** ${esc(f._what_locked_means)}`,
    '',
  ].join('\n');
}

function serviceProvidersBlock() {
  return lockedList('service_providers',
    ['Service sent out', 'Who does it first'],
    (list) => list.map((r) => [esc(r.service), esc(r.vendor)]));
}

function leadSourcesBlock() {
  return lockedList('crm_lead_sources',
    ['Where a lead came from'],
    (list) => list.map((s) => [esc(s)]));
}

/* A block that owes an introduction gets it from tenant.js, beside the flag that turns it on —
   so the sentence and the switch cannot end up in different files disagreeing. */
function leadIn(part, key) {
  return part[key] ? sub(part[key]) + '\n' : '';
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
/* One renderer, shared with the build guide and the plan. This file and mkguide.js had each
   grown a private copy of this table, which is how two documents start disagreeing about the
   same fact without either of them being edited. */
function dynamicBlock() {
  return REG.dynamicSection({ heading: '###', intro: false, fmt: FMT, sub });
}

/* ── what the platform is built on, and what replaces it ─────────────────── */
/* This document carried 0 of the 19 layers. A tenant chooses none of them — which is exactly
   why they are entitled to see that none of them is a trap. */
function stackBlock() {
  return REG.stackSection({ heading: '###', intro: false });
}

/* ── everything you get, named ───────────────────────────────────────────── */
function appsBlock() {
  return REG.appsSection({ heading: '###', intro: false });
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


/* ── THE FULL RULEBOOK — every rule, not a count ─────────────────────────────
   The previous version of this document printed "Module 05 · 18 rules" and nothing else.
   A count is not a rulebook: it tells a reader how much they are not being shown.

   Every rule carries four things and all four are rendered. The one that matters most is
   `never` — what the system refuses to do instead — because that is the half a business
   relies on when nobody is watching, and it was entirely absent. */
function rulebookFullBlock() {
  const out = [];
  /* THE RULES BRING VOCABULARY NO STEP INTRODUCED.
     Every other section of this document declares its technical words on the step that
     first uses them. The rulebook has no steps — it is the register printed whole — so a
     word arriving inside a rule had nowhere to be explained, and the glossary gate
     correctly refused the entire document rather than let a reader meet one cold. */
  const intro = termsBlock(['rollback', 'cutover']);
  if (intro) out.push(intro, '');
  MODULES.forEach((m) => {
    const mine = RULES.filter((r) => r.mod === m.n);
    if (!mine.length) return;
    out.push(`### Module ${m.n} · ${esc(m.name)} — ${mine.length} rules`, '');
    mine.forEach((r) => {
      /* A three-row table repeated 285 times is 285 empty header bars and a great deal of
         rule. A labelled list carries the same three facts, reads faster, and lets the eye
         find `never` — which is the line that matters. */
      out.push(`**\`${r.id}\` ${esc(r.title)}**`, '');
      out.push(`- **When** ${esc(r.when)}`);
      out.push(`- **Then** ${esc(r.then)}`);
      out.push(`- **Never** ${esc(r.never || '—')}`, '');
    });
  });
  return out.join('\n');
}

/* ── ATTENDANCE — the codes, and paid versus productive ──────────────────────
   Read out of the engine so the document cannot describe a code the software does not
   have, or miss one it does. */
function attendanceBlock() {
  const src = fs.readFileSync(path.join(ROOT, 'engine', 'vastrangam', 'attendance.py'), 'utf8');
  const rows = [];
  const re = /"([A-Z]{1,2})":\s*Code\("[A-Z]{1,2}",\s*"([^"]+)",\s*([\d.]+),\s*([\d.]+)\)/g;
  let m;
  while ((m = re.exec(src))) rows.push([`\`${m[1]}\``, m[2], m[3], m[4]]);
  if (rows.length < 5) throw new Error(`mktenant: found ${rows.length} attendance codes, expected 7`);

  const aliases = (src.match(/CODE_ALIASES = \{[\s\S]*?\n\}/) || [''])[0];
  const nAlias = (aliases.match(/"/g) || []).length / 4;

  return [
    `**${rows.length} codes.** Each one carries two separate numbers, and keeping them separate
is the whole point of this table.`,
    '',
    FMT.table({
      head: ['Code', 'Means', 'Counts for pay', 'Counts for work'],
      rows,
    }, sub),
    '',
    `**Look at Holiday and Paid leave.** Both count a full day for pay and **zero** for work.
That is not a rounding choice — it is the truth, and it is why this system has a figure called
unallocated labour instead of quietly spreading a holiday across the designs somebody made that
week. Paid is not the same as productive, and a system that merges them overstates how expensive
every design was.`,
    '',
    `**About ${Math.round(nAlias)} written forms are understood** — a person may write \`P\`,
\`Present\`, \`1\` or \`Full\` and all four mean the same thing. What is deliberately NOT a code is a
**blank cell**: a blank is a state, not a mark, and what it means is decided from the employment
dates rather than guessed.`,
    '',
    `**Read code** is the step that turns what somebody wrote into one of the codes above. Anything
it does not recognise **stops the run and names the cell** — never guessed at, never treated as
absent.`,
    '',
    `**Day type** decides whether a date is a weekday or a Sunday for that person, because the shift
length differs and so does what a mark on it is worth. It is resolved from the calendar, not from
whoever is entering the data.`,
    '',
    `**The code table is data.** Add a code, change what one is worth, or override the whole table
for your business — every calculation downstream follows, because none of them names a code.`,
  ].join('\n');
}

/* ── SALARY — the actual calculation ─────────────────────────────────────────
   Four bases and four states, read from the engine constants so the document cannot
   disagree with the software about how many there are. */
function salaryBlock() {
  const src = fs.readFileSync(path.join(ROOT, 'engine', 'vastrangam', 'pay.py'), 'utf8');
  const bases = ['FLAT', 'ATTENDANCE', 'DAILY_WAGE', 'PIECE_RATE']
    .map((k) => {
      const mm = new RegExp('^' + k + ' = "([^"]+)"', 'm').exec(src)
        || new RegExp('^' + k + ' = "([^"]+)"', 'm').exec(
          fs.readFileSync(path.join(ROOT, 'engine', 'vastrangam', 'master.py'), 'utf8'));
      return mm ? mm[1] : null;
    }).filter(Boolean);

  const how = {
    'Flat': 'The full monthly salary, every month, **whatever the attendance**. No scaling up and none down.',
    'Attendance': 'The daily rate times the days worked. **Uncapped in both directions** — 30 days against a 27-day threshold pays for 30, and 20 days pays for 20.',
    'Daily-wage': 'A daily rate that is simply stated. There is no monthly salary to divide and no threshold to divide it by.',
    'Piece-rate': 'Output times the rate. **No salary, no threshold, no attendance row** enters this calculation at all.',
  };

  return [
    `**${bases.length} ways of being paid.** A person can move between them, from a date.`,
    '',
    FMT.table({
      head: ['Basis', 'How the month is calculated'],
      rows: bases.map((b) => ['**' + b + '**', how[b] || 'By your own rule for this basis.']),
    }, sub),
    '',
    `**Month pay** is the name of the one figure that pays a person for a month. There is exactly
one, per person, per month — and everything downstream reads it and nothing else. Two ways of pricing
the same month is how two departments arrive at two different totals.`,
    '',
    '#### The order month pay is resolved in',
    '',
    `It stops at the first thing that fails, and says which — it never carries on with a
substitute.`,
    '',
    FMT.table({
      head: ['#', 'It asks', 'If there is no answer'],
      rows: [
        ['1', 'Was this person employed in this month at all?', 'Stop. **This is not an absence and not a gap** — they were not there'],
        ['2', 'Which basis was in force, on these dates?', 'Stop and say so. Never fall back to a default basis'],
        ['3', 'What was the salary, the threshold in days, the threshold in hours?', 'Stop and name what is missing. **Never treat a missing value as zero**'],
        ['4', 'What attendance was marked?', 'A code with no hours defined stops this month and says why'],
        ['5', 'Which of the states does this month fall into?', 'See the table below'],
      ],
    }, sub),
    '',
    '#### The four states a month can be in',
    '',
    FMT.table({
      head: ['State', 'What it means', 'Why it is separate'],
      rows: [
        ['**Employed**', 'Employed, and attendance was recorded', 'The normal case'],
        ['**No data**', 'Employed, and nothing was recorded', 'A tracking gap worth chasing'],
        ['**Not employed**', 'Outside their employment dates', 'Not a failure. They were not there, so it is not a missing month'],
        ['**Unresolvable**', 'Something needed was missing', 'Reported by name, never silently priced at zero'],
      ],
    }, sub),
    '',
    `Merging these four is how a report ends up listing people as having failed months they never
worked in.`,
    '',
    '#### The daily rate, the hourly rate, and which one may pay anybody',
    '',
    FMT.table({
      head: ['Figure', 'How it is reached', 'What it may be used for'],
      rows: [
        ['**Daily rate**', 'The salary divided by the threshold in days', 'Paying an attendance-based month'],
        ['**Hourly rate**', 'The daily rate divided by that person’s **own shift length**', '**The work report only.** It pays nobody'],
        ['**Blended daily**', 'The average of that year’s monthly daily rates, across **employed months only**', 'Costing a design across a year'],
        ['**Blended hourly**', 'The blended daily rate over the shift length — or, for piece-rate people, their stated rate per hour', 'Costing hours onto designs'],
      ],
    }, sub),
    '',
    `**Employed months only, and that word carries weight.** Averaging a twelve-month window across
an eight-month spell understates the rate by a third — and that understated rate then understates
every design that person ever touched. A month somebody was not employed has no daily rate to
average. It is not a zero. It is not a month.`,
    '',
    `**Shift length is per group, read from a table** — not written into the formula. A business
whose working day is not the same as yours changes one table and nothing else.`,
    '',
    `**Piece rate wage** is its own calculation: hours logged against designs times that person’s
flat rate per hour. No threshold, no attendance, no scaling — the rate is given outright.`,
    '',
    `**FY pay** is the same person across one whole financial year, month by month. Which leads
directly to the rule below.`,
    '',
    '#### Staff pay does not add up across financial years',
    '',
    `Refused outright, rather than allowed and quietly wrong. Piece-rate earnings **are** additive
across years — the same design earns the same way whenever it was made. Staff pay is not, because
the threshold, the salary and the basis are all specific to a period. A combined threshold across
two years is not a bigger number or a smaller one; it is a meaningless one.`,
    '',
    `**Total payroll covers every person, every month, every basis — nothing excluded quietly.**
A piece-rate contractor whose hours are charged to designs but whose wage is left out of the payroll
makes unallocated labour look smaller than it really is.`,
  ].join('\n');
}

/* ── PRODUCTIVITY AND COST ───────────────────────────────────────────────── */
function productivityBlock() {
  return [
    `Hours get logged against designs. Costing them means turning hours into money and putting that
money onto the design that consumed it — **and showing plainly what would not go anywhere.**`,
    '',
    '#### Utilisation — two of them, never merged',
    '',
    FMT.table({
      head: ['Measure', 'How it is reached', 'What it tells you'],
      rows: [
        ['**By days**', 'Days worked against the threshold in days', 'Whether the month was a full one'],
        ['**By hours**', 'Productive hours against the threshold in hours', 'Whether those days were productive'],
      ],
    }, sub),
    '',
    `Somebody can be at a hundred per cent on days and well under on hours — a month full of
holidays and paid leave does exactly that. One number would hide it.`,
    '',
    '#### Unallocated labour, and why it stays visible',
    '',
    `Every hour that could not be attached to a design stays in its own figure. Holidays, paid
leave, time on nothing in particular, anybody whose rate could not be resolved. **It is never spread
across the designs to make the sum come out neat.**`,
    '',
    `Spreading it would make every design look slightly more expensive than it was, and would hide
the one number worth acting on: how much paid time is not reaching product.`,
    '',
    '#### Cost per piece',
    '',
    `The **cost per piece table** carries one line per design and nothing else: hours logged, money
those hours cost, quantity made, and the cost of one piece.
And one rule about the shape of it — **there is no TOTAL row**. A totals row sitting in the
same table as the detail rows is how a cost report gets added to itself and reports double.`,
    '',
    `Any row whose person has no resolvable rate is listed separately by name of design and hours,
rather than being costed at zero and blended into the average.`,
  ].join('\n');
}

/* ── ACCOUNTING ──────────────────────────────────────────────────────────── */
function accountingBlock() {
  return [
    `Every operational action posts to the books by itself, from the record that caused it. Nothing
is re-keyed into accounts, because re-keying is where the two versions of the truth appear.`,
    '',
    '#### What each action posts',
    '',
    FMT.table({
      head: ['When this happens', 'What is debited', 'What is credited'],
      rows: [
        ['A sale is invoiced', 'The customer, or the bank on a cash sale', 'Sales, and the output tax'],
        ['Money is received', 'Bank', 'The customer'],
        ['Stock leaves on a sale', 'Cost of goods sold', 'Stock in hand'],
        ['A return is accepted', 'Sales returns, and the output tax reversed', 'The customer'],
        ['Material is received', 'Stock in hand, and the input tax credit', 'The supplier'],
        ['A supplier is paid', 'The supplier', 'Bank'],
        ['Wages are posted', 'Wages, by category', 'Payable to the person or the unit'],
        ['A payout is settled', 'Bank, plus the commission and fees', 'The amount expected from that channel'],
      ],
    }, sub),
    '',
    `Every line above is one half of a pair, and neither half can exist without the other. **A
voucher that does not balance is refused at the moment it is made** — never saved and reported on
later.`,
    '',
    '#### Tax',
    '',
    FMT.table({
      head: ['', ''],
      rows: [
        ['**Rate**', 'Per item category, effective-dated. An invoice keeps the rate that applied on **its own** date'],
        ['**Split**', 'Within the state and outside it are different, decided from the two places, never from a setting somebody chose'],
        ['**Input credit**', 'Claimed on goods **accepted**, not on goods received. Rejected material never earns a credit'],
        ['**Deductions at source**', 'Tracked per party and per section, with the certificate against the record'],
        ['**Returns**', 'Generated from the vouchers, per registration — never typed from a summary'],
      ],
    }, sub),
    '',
    '#### Period locks, and correcting a filed month',
    '',
    `Once a period is filed it is **locked**. It cannot be edited, and that is deliberate: a closed
month that can still change is a month you cannot rely on having filed correctly.`,
    '',
    `A correction is a **new entry that names what it corrects**, dated in an open period. So the
original filing still reproduces exactly what was filed, the correction is visible as a correction,
and anybody asking "why does this differ" gets an answer instead of a mystery.`,
  ].join('\n');
}


/* ── THE EIGHT CASCADES AND FIVE FLOWS ───────────────────────────────────────
   RESTORED. An earlier version of this document carried these; a rewrite dropped all
   thirteen and nothing noticed, because every check asked "is what is here correct?"
   and none asked "is anything that was here gone?"

   Read out of PLAN_OF_ACTION.md at generation time, never copied — and the counts are
   asserted, so a cascade cannot leave the acceptance test by being edited out. */
const N_CASCADES = 8;
const N_FLOWS = 5;

function cascadesBlock() {
  const md = fs.readFileSync(path.join(ROOT, 'PLAN_OF_ACTION.md'), 'utf8');
  const sec = md.split('### The eight cascades that must fire by themselves')[1];
  if (!sec) throw new Error('mktenant: the cascades section is not in PLAN_OF_ACTION.md');
  const rows = [];
  sec.split(/\n---/)[0].split('\n').forEach((line) => {
    const m = /^\|\s*\*\*(.+?)\*\*([^|]*)\|\s*(.+?)\s*\|\s*$/.exec(line);
    if (m) rows.push({ action: (m[1] + m[2]).trim(), result: m[3].trim() });
  });
  if (rows.length !== N_CASCADES) {
    throw new Error(`mktenant: found ${rows.length} cascades, expected ${N_CASCADES}`);
  }
  const out = [
    `**A single action must update every consequence of it, in one go, with nobody re-keying
anything.** If one of these needs a person to carry a number from one screen to another, it is not a
system — it is a set of screens that happen to be next to each other.`,
    '',
  ];
  rows.forEach((r, i) => {
    out.push(`**${i + 1} · ${esc(r.action)}**`, '');
    out.push(`Do that one thing. Every item below must then be true without you touching it:`, '');
    r.result.split('→').map((x) => x.trim()).filter(Boolean).forEach((x) => out.push(`- ${esc(x)}`));
    out.push('');
  });
  return out.join('\n');
}

function flowsBlock() {
  const md = fs.readFileSync(path.join(ROOT, 'PLAN_OF_ACTION.md'), 'utf8');
  const sec = md.split('## A5 · THE FIVE END-TO-END FLOWS')[1];
  if (!sec) throw new Error('mktenant: the flows section is not in PLAN_OF_ACTION.md');
  const body = sec.split('\n## ')[0];
  const rows = [];
  const re = /### (Flow \d+ · [^\n]+)\n+```mermaid\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(body))) rows.push({ title: m[1].trim(), mermaid: m[2].trim() });
  if (rows.length !== N_FLOWS) {
    throw new Error(`mktenant: found ${rows.length} flows, expected ${N_FLOWS}`);
  }
  const out = [
    `A cascade proves one action fans out correctly. A flow proves the business can be **run**,
start to finish. Each crosses many parts of the system, which is the point — the gaps between them
are where systems usually fail.`,
    '',
  ];
  rows.forEach((r) => {
    out.push(`### ${esc(r.title.replace(/^Flow \d+ · /, ''))}`, '');
    /* The picture and the words. Nine nodes across a page renders at about four point —
       drawn, correctly sized, past every check, and unreadable. The list is parsed out of
       the very diagram above it, so the two cannot disagree. */
    out.push('```mermaid', r.mermaid, '```', '');
    const labels = [...r.mermaid.matchAll(/\[\s*"([^"]+)"\s*\]/g)]
      .map((x) => x[1].replace(/<br\s*\/?>/gi, ' ').trim());
    const seen = new Set();
    const ordered = labels.filter((l) => (seen.has(l) ? false : seen.add(l)));
    if (ordered.length) {
      out.push('**The same chain, step by step:**', '');
      ordered.forEach((l, k) => out.push(`${k + 1}. ${esc(l)}`));
      out.push('');
    }
  });
  return out.join('\n');
}

/* ── ONE NAME, ONE IDENTITY ─────────────────────────────────────────────── */
function identityBlock() {
  return [
    `A name written in capitals, in mixed case, with a trailing space, or with one letter
transposed is still the same person. So **the system never compares written names.** It compares
ids: names in, **one identity** out. There is exactly one place where a written name becomes an id.`,
    '',
    FMT.table({
      head: ['', ''],
      rows: [
        ['**What is compared**', 'The id. Never the spelling'],
        ['**Where a name becomes an id**', 'One place, and only one'],
        ['**Where the spellings live**', 'An alias table — which is data you edit, not code'],
        ['**An exact alias**', 'Resolves silently. It is already your answer, given earlier'],
        ['**A near match**', '**Proposed, never applied.** A merge is a decision'],
        ['**Once you decide**', 'Stored. You are asked once, not every month'],
      ],
    }, sub),
    '',
    `Merging two people who are actually different silently combines two balances, and separating
them afterwards means unpicking every payment either of them ever received. That is why the system
will not do it on your behalf, however confident the match looks.`,
  ].join('\n');
}

/* ── THE EFFECTIVE-DATED LOG ─────────────────────────────────────────────── */
function logsBlock() {
  return [
    `Every value that can change over time is kept as a log rather than as a single figure — a
salary, a rate, a threshold, a role, a person’s basis.`,
    '',
    FMT.table({
      head: ['', ''],
      rows: [
        ['**A value is never overwritten**', 'The open entry is closed off and a new one is **appended**'],
        ['**History stays intact**', 'Every earlier value is still there, with the dates it applied between'],
        ['**A future date is allowed**', 'An entry dated ahead **activates by itself** when that month arrives'],
        ['**Superseded is not deleted**', 'An entry that has been replaced stays readable, because a report for an earlier period still needs it'],
        ['**No match is an error**', 'Never zero'],
      ],
    }, sub),
    '',
    `That last line is worth reading twice. **Silently returning zero is how a person earns nothing
without anyone noticing** — the run completes, the report looks normal, and somebody is not paid.
So the system stops and names what it could not resolve, for whom, and for which month.`,
    '',
    `This is also how you set a change in advance. A rate agreed today and starting next month is
entered today with next month’s date, and it applies itself on the first — nobody has to remember.`,
  ].join('\n');
}

/* ── HOW YOUR OWN FILES ARE READ ─────────────────────────────────────────── */
function readingBlock() {
  return [
    `Your files are not tidy, and they should not have to be. Two rules do the heavy lifting.`,
    '',
    '#### A heading is only a heading if there is a date under it',
    '',
    `Structural, not cosmetic — so it works whether or not somebody has tidied the sheet. A stray
heading sitting on top of another heading is recognised as stray, instead of quietly eating a month
of data underneath it.`,
    '',
    '#### Columns are found by name, never by position',
    '',
    `**Columns move when somebody joins or leaves. People do not.** Reading by position means the
day a column is inserted, every figure after it belongs to the wrong person — and nothing about that
looks wrong on screen. Reading by name means you can add a column, remove one, or reorder the whole
sheet and nothing breaks.`,
    '',
    `The same rule governs the master workbook: it is read **by column name**, so your business can
add a column of its own whenever it needs one.`,
    '',
    '#### Where personal and banking details stop',
    '',
    `Identity numbers, bank name, account number, IFSC, UPI, phone and address are read into a
**separate object that nothing else writes to disk.** Personal and banking data **never leaves** the
module that reads it, and none of it is attached to the master record the rest of the system passes
around.`,
    '',
    `So a report, an export, a backup of the working data or a file sent to somebody cannot carry
them, because they were never in it. That is a stronger guarantee than a permission, which somebody
can be granted.`,
  ].join('\n');
}

/* ── THE DELIVERABLE — the workbook itself ──────────────────────────────── */
function deliverableBlock() {
  const src = fs.readFileSync(path.join(ROOT, 'engine', 'vastrangam', 'workbook.py'), 'utf8');
  const m = /SHEET_ORDER = \[([\s\S]*?)\]/.exec(src);
  const n = m ? (m[1].match(/[A-Z_]{2,}/g) || []).length : 0;
  return [
    `One workbook per financial year. **${n} sheets**: two Read Me sheets, the combined
productivity overview, then nine for the making side and nine for the staff side.`,
    '',
    '#### The rule that governs every cell in it',
    '',
    `**Every derived cell is a live formula referencing the sheets beside it — never a typed-in
number.** A total is not written as the number the system worked out. It is written as the
calculation that produces it from the rows next to it, so you can click any figure and see it being
made.`,
    '',
    `> **A figure only the system can produce is a figure nobody can audit.**`,
    '',
    `What *is* written as a plain value: the source facts. An attendance mark, a salary from the
log, a quantity made, a rate. Everything derived from them is a formula.`,
    '',
    '#### And the formulas are checked by something that is not the system',
    '',
    `A spreadsheet file can be written full of formulas that turn out to be broken, and it looks
finished until somebody opens it. So after building, the workbook is opened in a **separate
spreadsheet program**, every formula recalculated, and the result read back and compared against
what the system itself calculated.`,
    '',
    `Two independent answers to the same question. If they differ, the workbook does not ship.`,
    '',
    '#### A missing side is said plainly, never filled in',
    '',
    `A missing side is not an error. If only one side of the data was provided, the workbook is
built from what exists, the other side’s sheets are skipped, and it **says so plainly** — rather than
fabricating the missing side so the file looks complete.`,
  ].join('\n');
}

/* ── PERFORMANCE BANDS ──────────────────────────────────────────────────── */
function performanceBlock() {
  const src = fs.readFileSync(path.join(ROOT, 'engine', 'vastrangam', 'performance.py'), 'utf8');
  const bands = (src.match(/^(SATISFACTORY|AVERAGE|BELOW) = "([^"]+)"/gm) || [])
    .map((l) => /"([^"]+)"/.exec(l)[1]);
  return [
    `People are banded against the average — and the whole difficulty is deciding which months
belong in that average at all.`,
    '',
    FMT.table({
      head: ['Band', 'What it means'],
      rows: bands.map((b) => ['**' + b + '**', 'Measured against the average of the months that count']),
    }, sub),
    '',
    '#### Which months count',
    '',
    FMT.table({
      head: ['Month', 'In the average?', 'Scored as'],
      rows: [
        ['Employed, with attendance', 'Yes', 'Its actual band'],
        ['Employed, nothing recorded', 'No', '**No Data** — called what it is'],
        ['Outside their employment dates', 'No', 'Nothing. They were not there'],
      ],
    }, sub),
    '',
    `**Neither of the last two is ever scored as below average**, and that is not a kindness — it is
accuracy. A month somebody did not work is not a month they worked badly, and averaging it in as a
zero produces a number that is wrong about a real person, on a record that follows them.`,
  ].join('\n');
}

/* ── THE MAKING SIDE, IN FULL ───────────────────────────────────────────── */
function karigarDeepBlock() {
  return [
    '#### Which slot a component fills is worked out from structure, not from its name',
    '',
    `A rate card lists components. Which piece of a set each one is — the top, the bottom, the
dupatta — is decided from the structure of the card itself, not by reading the label and hoping. A
label is what somebody typed; structure is what the data actually shows.`,
    '',
    '#### What was actually paid, weighted by quantity',
    '',
    `A design may have been paid at more than one rate across a period. The rate reported is
**weighted by quantity**, not a plain average of the rates — twenty pieces at one rate and two at
another is not the midpoint of the two rates, and treating it as such misstates the cost of every
one of those twenty-two pieces.`,
    '',
    '#### When two periods disagree about a rate',
    '',
    `**The later one wins, and both are kept.** The recent decision is the operative one, and the
earlier one stays visible so a report for the earlier period still resolves what applied then — and
so the disagreement itself is on the record rather than silently resolved.`,
    '',
    '#### The adjustment that makes a design tie out',
    '',
    `Where the computed figure and the raw recorded figure differ, the difference is carried as a
**named adjustment** rather than being absorbed. A design that ties out because somebody quietly
nudged it is a design nobody can check.`,
    '',
    '#### Everything lands on the unit, whatever it was called that period',
    '',
    `Earnings, payments and the outstanding balance all roll up to the paying unit — through
whatever label the source used in that period. One unit, one continuous balance, however many names
it has been written under.`,
    '',
    '#### Nothing is read off a total',
    '',
    `Every figure is **recomputed from the transaction rows**. The totals your own source files
carry are used only to check the answer — never as the answer. And where the two disagree, the
difference is reported rather than reconciled away.`,
  ].join('\n');
}

/* ── THE CONTENT ENGINE'S PHASES, READ FROM THE ENGINE'S OWN SPECIFICATION ───
   The owner asked for "ai content engine all steps" and got eleven rules and no steps. The steps
   were never missing from the repository — they are in Vastrangam_AI_Content_Engine.md, which is
   the file the engine itself is written against. So they are PARSED out of it rather than retyped,
   and a phase renamed there appears here on the next build. Retyping sixteen headings would have
   been faster and would have started drifting the same afternoon. */
function contentPhasesBlock() {
  const src = path.join(ROOT, 'Vastrangam_AI_Content_Engine.md');
  if (!fs.existsSync(src)) {
    throw new Error('Vastrangam_AI_Content_Engine.md is missing — the content engine phases are ' +
      'read from it, and inventing them here is exactly what this reads it to avoid');
  }
  const text = fs.readFileSync(src, 'utf8');
  /* Headings look like "## 🧠 PHASE 0 — BUYER PSYCHOLOGY ENGINE". The emoji varies and is not
     content; the number and the name are. */
  const phases = [...text.matchAll(/^#{2,3}\s*\S*\s*PHASE\s+([0-9]+[A-Z]?)\s*[—-]\s*(.+?)\s*$/gm)]
    .map((m) => [m[1], m[2].replace(/\s+/g, ' ').trim()]);
  if (phases.length < 10) {
    throw new Error(`only ${phases.length} content-engine phases found in ` +
      `Vastrangam_AI_Content_Engine.md — the heading shape changed, and a short list here would ` +
      `look like a short pipeline`);
  }
  /* Title case, with a NAMED list of the acronyms rather than a rule that guesses at them.
     Guessing was tried twice: lowercasing everything gave "Content Dna", and keeping any short
     all-caps token gave "Viral HOOK" and "AD Variation". Both are wrong in a way a reader notices,
     and the set of real acronyms here is four words long — so it is written down, and a fifth one
     appearing is a one-line edit rather than a cleverer regex that will be wrong differently. */
  const ACRONYMS = ['DNA', 'SKU', 'AI', 'SEO'];
  const nice = (t) => t.toLowerCase()
    .replace(/(^|[\s([])([a-z])/g, (_, a, b) => a + b.toUpperCase())
    .replace(new RegExp(`\\b(${ACRONYMS.join('|')})\\b`, 'gi'), (w) => w.toUpperCase());
  return [
    FMT.table({
      head: ['Phase', 'What it does'],
      rows: phases.map(([n, t]) => ['**' + n + '**', nice(t)]),
    }, sub),
    '',
    `**${phases.length} phases, and the order is the point.** Each one reads what the ones before it
established, which is why the analysis phases come first and why skipping them does not save time —
it produces output the later phases then build on top of nothing.`,
  ].join('\n');
}

/* ── the blocks every document may draw on ───────────────────────────────── */
/* Computed once. A part asks for one by setting its flag, so a part still declares only WHAT it
   wants and never how it is drawn — and the runbook and the reference therefore show the same
   company table, the same channel kinds and the same set compositions, because there is one. */
const BLOCKS = {
  companies: companiesBlock(),
  channelKinds: channelsBlock(),
  setTypes: setTypesBlock(),
  serviceProviders: serviceProvidersBlock(),
  leadSources: leadSourcesBlock(),
  inference: inferenceBlock(),
  payBasis: payBasisBlock(),
  gates: gatesBlock(),
  dynamic: dynamicBlock(),
  stack: stackBlock(),
  apps: appsBlock(),
  rulebook: rulebookBlock(),
  rulebookFull: rulebookFullBlock(),
  attendance: attendanceBlock(),
  salary: salaryBlock(),
  productivity: productivityBlock(),
  accounting: accountingBlock(),
  cascades: cascadesBlock(),
  flows: flowsBlock(),
  identity: identityBlock(),
  reading: readingBlock(),
  logs: logsBlock(),
  deliverable: deliverableBlock(),
  performance: performanceBlock(),
  karigarDeep: karigarDeepBlock(),
  contentPhases: contentPhasesBlock(),
};

/* A term is explained on FIRST use — per document, not per process. The three documents are read
   separately, so a word explained in the runbook is still a new word in the reference. */
function resetTerms() { explained.clear(); }

function renderParts(parts) {
  const out = [];
  for (const p of parts) {
    const sec = [`## Part ${p.n} · ${sub(p.title)}`, '', sub(p.lead), ''];
    const t = termsBlock(p.terms);
    if (t) sec.push(t, '');
    for (const key of Object.keys(BLOCKS)) {
      if (!p[key]) continue;
      const intro = leadIn(p, key + 'Lead');
      sec.push(intro ? intro + '\n' + BLOCKS[key] : BLOCKS[key], '');
    }
    p.steps.forEach((s) => {
      const st = termsBlock(s.terms);
      const body = FMT.step(s, sub, BLOCKS);
      sec.push(st ? body.replace(/\n\n/, '\n\n' + st + '\n\n') : body);
    });
    out.push(sec.join('\n'));
  }
  return out.join('\n---\n\n');
}

/* ── what every one of the three says about itself ───────────────────────── */

const PROMISE = `### The promise this whole design keeps

**You can change anything, at any time, and it takes effect at once. And the past does not move.**

Every change carries the date it starts from. So a supervisor can leave on Tuesday without notice, a
replacement start Wednesday morning, both recorded the same day — and last month’s payroll, already
paid, still comes out to the same rupee. *Purana record mitta nahin; naye date se naya rule lagta
hai.*

### Where you do each thing

| | |
|---|---|
| \`IN THE APP\` | On a screen, by an administrator |
| \`ON A PHONE\` | By anybody, from a basic phone, in their own language |
| \`WITH YOUR TEAM\` | A decision or an agreement, not a screen |
| \`OUTSIDE\` | On somebody else’s website — a marketplace, a shop platform |

### About people

**No person is named anywhere in these documents.** Names, salaries and employment details live in
your system, behind permissions — not in a file that gets printed, emailed and forwarded. Every rule
here is described by its shape, which is what makes it a rule rather than a list.

### One thing that is never asked of you

**This system will never ask you for a marketplace, bank or account password.** Every outside
connection uses a key you create on the other service and can withdraw from the other service. If
anything ever asks you for one of those passwords, it is not this platform.`;

function frontBuild(nparts, nsteps) {
  return `# ${TOKENS.__TENANT__} — the build guide

**Setting this business up on ${TOKENS.__PLATFORM__}, in order: from signing up to running live.**

${nparts} parts · ${nsteps} steps · compiled ${DATE}

---

## What this document is

**This describes a design. Nothing in it exists yet, and nothing in it claims to.**

It is the ordered path. Part 0 is the half-hour before anybody opens a screen; Part 9 is the daily
rhythm once setup is finished. In between: your companies, your channels, your people, your products
and what a set contains, the making side, buying, selling, and the first month end run deliberately
on a month you already know the answer to.

**You install nothing** — no server, no software, no technical person. Everything here happens in a
browser or on a phone.

**It does not repeat the rules.** Where a step depends on a calculation — how a month’s pay is
computed, when a set counts as complete, how a unit’s outstanding balance is arrived at — this
document says what the step decides and leaves the arithmetic to *${TOKENS.__TENANT__} — the rules
and logic*, which carries all ${NRULES} rules and every formula in full. Two copies of a formula is
how two documents start disagreeing about somebody’s wages.

**Every technical word is explained the first time it appears**, in plain language, with an everyday
comparison. No prior knowledge is needed anywhere.

${PROMISE}

---

`;
}

function frontRules(nparts, nsteps) {
  return `# ${TOKENS.__TENANT__} — the rules and the logic

**Everything this business runs on: every rule, every calculation, and what the system refuses.**

${nparts} parts · ${nsteps} sections · ${NRULES} rules · compiled ${DATE}

---

## What this document is

**This describes a design. Nothing in it exists yet, and nothing in it claims to.**

It is the reference, organised by subject rather than in order, because that is how somebody looks
something up nine months in. *${TOKENS.__TENANT__} — the build guide* is the other half: the same
business in the order you set it up.

It carries the companies, the channels, the products and what each set contains, how work is counted
and paid, how attendance and pay are computed, what the system refuses to do, and all ${NRULES}
rules — **each with what the system will never do instead**, which is the half you rely on when
nobody is watching. Nothing is left out on the grounds that it is detail; the detail is where the
money is.

**Every technical word is explained the first time it appears**, in plain language, with an everyday
comparison. No prior knowledge is needed anywhere.

${PROMISE}

Part 9 works the changing-things case through, and lists all ${NDYN} things you can change and the
${NFIXED} nobody can switch off.

---

`;
}

const FOOT = `---

*Generated by \`brand/delivery/website/mktenant.js\` from \`brand/site/tenant.js\`,
\`brand/site/tenantbuild.js\` and this business’s own recorded logic — the companies, the channel
kinds, the set compositions, the column layout, the pay bases, the closed lists and the refusal
checks are all read from source at generation time, never retyped. Nothing here is maintained by
editing this file: edit the source and regenerate.*
`;

/* ── build one document ──────────────────────────────────────────────────── */
function buildDoc(key) {
  const d = DOCS[key];
  const bad = d.check();
  if (bad.length) {
    console.error(`mktenant: ${key} has ${bad.length} problem(s)\n`);
    bad.forEach((b) => console.error('  ' + b));
    process.exit(1);
  }
  const nsteps = d.parts.reduce((s, p) => s + p.steps.length, 0);
  resetTerms();
  const front = key === 'build' ? frontBuild(d.parts.length, nsteps)
    : frontRules(d.parts.length, nsteps);
  return front + renderParts(d.parts) + '\n' + FOOT;
}

/* ── the checks that run on every finished document ──────────────────────── */

/* 1 · NO PERSON GOT THROUGH.
   The real names live in master.json. They are read here ONLY to check they are absent from the
   output, and never emitted — which is the one use of that list that makes a document safer
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

function commonChecks(name, DOC) {
  const leaked = roster.filter((n) => new RegExp('\\b' + n + '\\b', 'i').test(DOC));
  if (leaked.length) {
    console.error(`mktenant: ${leaked.length} name(s) from the roster reached ${name}. ` +
      `Describe the rule by its shape, never by naming a person.`);
    process.exit(1);
  }

  /* 2 · every technical word explained */
  const unexplained = WORDS.checkwords(DOC, { skip: SKIP_TERMS });
  if (unexplained.length) {
    console.error(`mktenant: ${name} — term(s) used but never explained: ${unexplained.join(', ')}\n`);
    /* Naming the term is not enough to fix it — the fix is to explain it where it FIRST appears,
       and finding that by eye in a 30KB document is the kind of search that gets abandoned. So
       the line is printed. */
    unexplained.forEach((t) => {
      const re = new RegExp('^.*\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 's?\\b.*$', 'im');
      const line = re.exec(DOC);
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
    console.error(`mktenant: ${name} says "${claim[0]}" — it describes a design.`);
    process.exit(1);
  }

  /* 4 · no shell command reached a reader with no terminal */
  if (/^\s*(npm|node|git|cd|mkdir|sudo|apt) /m.test(DOC)) {
    console.error(`mktenant: a shell command reached ${name} — this reader has no terminal.`);
    process.exit(1);
  }
}

/* ── 5 · THE COVERAGE GATE ───────────────────────────────────────────────────
   THE CHECK THAT SHOULD HAVE EXISTED FROM THE START.

   Every other check in this file asks "is what is here correct?". Not one of them asked
   "is anything missing?" — which is how a document containing ZERO of 285 rules passed
   every check, was rendered, verified, read, committed and delivered.

   Correctness gates catch a wrong statement. Only a coverage gate catches an absent one,
   and an absent one is worse: a reader cannot see a gap, so they assume the document is
   whole. This refuses to write unless the thing is actually complete.

   It runs on the documents that CLAIM to be complete — the rules reference and the merged
   file. The build guide does not claim it: it says in its own front matter that the rules
   live in the other document, and naming that in its manifest entry is what keeps the
   exemption honest rather than convenient. */
const ENGINE_COVERAGE = {
  'pay.py': ['month pay', 'blended daily', 'blended hourly', 'piece rate wage', 'financial year'],
  'attendance.py': ['read code', 'day type', 'paid', 'productive'],
  'allocation.py': ['unallocated', 'cost per piece', 'utilisation'],
  'karigar.py': ['paying unit', 'bottleneck', 'alias', 'weighted by quantity', 'later one wins'],
  'karigar_run.py': ['recomputed', 'does not tie'],
  'gates.py': ['blocks the work', 'refuses'],
  'workbook.py': ['live formula', 'never a typed-in number', 'Read Me', 'missing side'],
  'parsing.py': ['header', 'by name', 'columns move'],
  'template.py': ['by column name', 'never leaves', 'separate'],
  'master.py': ['effective', 'owner'],
  'logs.py': ['append', 'superseded'],
  'calendar_util.py': ['financial year'],
  'names.py': ['one identity', 'never compares'],
  'performance.py': ['band', 'not a month they worked badly'],
  /* No reader-facing logic — formatting and file mechanics only. Listed so the
     directory check passes and so the decision is visible rather than an omission. */
  'sheetstyle.py': [],
  'xlsx.py': [],
  'runlog.py': [],
  '__init__.py': [],
};

function coverageGate(name, DOC) {
  const gaps = [];

  /* 5a · every rule, by number. A count is not coverage — an earlier version reported
          "18 rules" for a module and printed not one of them. */
  const missingRules = RULES.filter((r) => !DOC.includes(r.id));
  if (missingRules.length) {
    gaps.push(`${missingRules.length} of ${RULES.length} rules are absent — ` +
      `first few: ${missingRules.slice(0, 6).map((r) => r.id).join(', ')}`);
  }

  /* 5b · every rule needs its `never`. The half that says what the system refuses is the
          half a business actually relies on, and it is the easiest half to drop. */
  const missingNever = RULES.filter((r) => r.never && !DOC.includes(r.never.slice(0, 40)));
  if (missingNever.length) {
    gaps.push(`${missingNever.length} rules appear without what the system will never do ` +
      `instead — that is the half you rely on when nobody is watching`);
  }

  /* 5c · every module carrying rules must have a section of its own. */
  const modsWithRules = [...new Set(RULES.map((r) => r.mod))];
  const missingMods = modsWithRules.filter((n) => {
    const m = MODULES.find((x) => x.n === n);
    return m && !DOC.includes(m.name);
  });
  if (missingMods.length) gaps.push(`modules with rules but no section: ${missingMods.join(', ')}`);

  /* 5d · EVERY FILE OF ENCODED LOGIC, NOT THE THREE I HAPPENED TO REMEMBER.
          The first version of this gate checked pay.py, attendance.py and allocation.py —
          the three that had just been written about. It passed a document that had never
          touched workbook.py (1,394 lines), parsing.py, template.py, karigar_run.py or
          names.py. A gate only checks what somebody thought to ask it.

          So the map above is keyed by FILE, and the gate lists the directory: a file with
          no entry fails the build. A new piece of logic cannot be added to the engine and
          silently skipped — somebody has to decide what it owes. */
  const engineDir = path.join(ROOT, 'engine', 'vastrangam');
  const engineFiles = fs.existsSync(engineDir)
    ? fs.readdirSync(engineDir).filter((f) => f.endsWith('.py')) : [];

  const unlisted = engineFiles.filter((f) => !(f in ENGINE_COVERAGE));
  if (unlisted.length) {
    gaps.push(`engine files with no coverage decision at all: ${unlisted.join(', ')} — ` +
      `add what each owes this document, or an empty list saying it owes nothing`);
  }

  const thin = [];
  for (const [file, needs] of Object.entries(ENGINE_COVERAGE)) {
    if (!engineFiles.includes(file) || !needs.length) continue;
    const missing = needs.filter((t) => !new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/ /g, '[ \\n-]+'), 'i').test(DOC));
    if (missing.length) thin.push(`${file} → ${missing.join(', ')}`);
  }
  if (thin.length) {
    gaps.push(`engine logic this document does not carry:\n      ` + thin.join('\n      '));
  }

  /* 5e · the accounting vocabulary. Zero occurrences of these was the single clearest
          signal that a whole subject had been skipped, so it becomes a check. */
  const ACCOUNTING = ['ledger', 'debit', 'credit', 'input credit', 'voucher', 'period lock'];
  const missingAcct = ACCOUNTING.filter((t) => !new RegExp('\\b' + t, 'i').test(DOC));
  if (missingAcct.length) gaps.push(`accounting subjects never mentioned: ${missingAcct.join(', ')}`);

  /* 5f · THE SUBJECTS THE OWNER ASKED FOR BY NAME.
          He listed them in one message: "attendance rules whatsapp in n out logic? work update?
          holiday n festival rules? staff performance rules n logic? vendor management rules n
          logic? raw material procurement logic? ai content engine all steps?"

          Five of those seven were absent or down to a single passing mention, and every gate in
          this file passed the document anyway — because 5a to 5e ask whether the rules and the
          engine files are covered, and a subject that belongs to no rule id and no .py file is
          invisible to all of them. A gate only checks what somebody thought to ask it, and this is
          what he thought to ask.

          EACH PATTERN IS A LOAD-BEARING PHRASE, NOT A KEYWORD.
          The first version used the obvious words — /festival/, /vendor/, /performance/ — and every
          one passed. "Festival" was matching a sentence about a pricing app and a sentence about
          generated imagery, while the holiday and festival RULES he asked for were absent, and this
          gate reported them covered. A gate that fires on a coincidental noun is worse than no
          gate. So each pattern below can only match if the subject is genuinely treated. */
  const ASKED_FOR = [
    ['the WhatsApp IN/OUT punch', /unmatched IN or OUT|OUT with no IN|IN with no OUT/i],
    ['the end-of-day work update', /a day with attendance and no update/i],
    ['holiday and festival rules', /a full day of pay and zero hours|paid day that produced nothing/i],
    ['the festival flag doing only one job', /festival flag matches a festival-leave request/i],
    ['staff performance banding', /not a month they worked badly/i],
    ['vendor management and the three-way match', /Match three documents before paying a supplier/i],
    ['raw material procurement', /Committed \+ Safety/i],
    ['the content engine, phase by phase', /phases, and the order is the point/i],
    ['e-invoicing', /reference number and a code printed on the face/i],
    ['the weekly off belonging to a person', /nobody acquires it by resembling them/i],
    ['a trial with no employment record', /the amount handed over \*\*is\*\* the record/i],
    ['religion deciding holidays and nothing else', /raises and is named|never consulted/i],
    ['a rate that ended with no successor', /Naming the new basis is not the same as stating the new rate/i],
  ];
  const untreated = ASKED_FOR.filter(([, re]) => !re.test(DOC.replace(/\s+/g, ' '))).map(([w]) => w);
  if (untreated.length) {
    gaps.push(`subjects the owner asked for by name and this document does not treat: ` +
      untreated.join(', '));
  }

  if (gaps.length) {
    console.error(`mktenant: ${name} is INCOMPLETE. Refusing to write it.\n`);
    gaps.forEach((g) => console.error('  · ' + g));
    console.error(`\n  Asked for "every rule and every piece of logic, nothing skipped".`);
    console.error(`  A correctness check cannot catch an absence. This one can.`);
    process.exit(1);
  }
}

/* ── 6 · THE GATE ON THE RUNBOOK ─────────────────────────────────────────────
   The build guide is exempt from the rulebook coverage gate, and an exemption with nothing
   behind it is just a document that stopped being checked. So it gets the gate that matches
   what it IS: an ordered path with no gaps in the order, that reaches the end, and that
   sends the reader to the rules rather than paraphrasing them. */
function runbookGate(name, DOC, parts) {
  const gaps = [];

  const ns = parts.map((p) => p.n);
  for (let i = 0; i < ns.length; i++) {
    if (ns[i] !== i) { gaps.push(`the parts are not a complete run from 0 — found ${ns.join(', ')}`); break; }
  }

  /* Every step must be reachable in the document by its own id, in order. A step that exists in
     the source and never rendered is exactly the failure a reader cannot see. */
  const steps = parts.flatMap((p) => p.steps.map((s) => s.id));
  const absent = steps.filter((id) => !DOC.includes(`${id} ·`));
  if (absent.length) gaps.push(`${absent.length} step(s) never rendered: ${absent.slice(0, 6).join(', ')}`);

  /* The path has to actually arrive. A setup runbook that stops at "add your products" has
     described the easy half. */
  const ARRIVES = [
    ['an invoice', /invoice/i],
    ['a payment or settlement', /settlement|payment/i],
    ['payroll', /payroll/i],
    ['closing a period', /clos(e|ing) (the )?(period|month|books)/i],
    ['the daily rhythm afterwards', /each morning|daily/i],
  ];
  const missed = ARRIVES.filter(([, re]) => !re.test(DOC.replace(/\s+/g, ' '))).map(([w]) => w);
  if (missed.length) gaps.push(`the path never reaches: ${missed.join(', ')}`);

  /* And it must say where the rules live, rather than quietly leaving the reader to wonder.
     Whitespace-normalised: the phrase is wrapped across a line break in the source and the
     printer joins it back together, so a raw match on the source misses what a reader sees.
     The same mistake let "already\nbuilt" through a banned-phrase check once. */
  const flat = DOC.replace(/\s+/g, ' ');
  if (!/rules and (the )?logic/i.test(flat)) {
    gaps.push('nothing tells the reader which document carries the rules and the formulas');
  }

  if (gaps.length) {
    console.error(`mktenant: ${name} is INCOMPLETE. Refusing to write it.\n`);
    gaps.forEach((g) => console.error('  · ' + g));
    process.exit(1);
  }
}

/* ── run ─────────────────────────────────────────────────────────────────── */

let built;
try {
  built = { build: buildDoc('build'), rules: buildDoc('rules') };
} catch (e) {
  console.error('mktenant: refusing to write the documents.\n');
  console.error('  ' + e.message.replace(/\n/g, '\n  '));
  console.error('\n  Nothing was written.');
  process.exit(1);
}

/* THE MERGED FILE IS THE TWO OF THEM, NOT A THIRD ACCOUNT OF THE SAME BUSINESS.
   It is built by concatenating what was already checked, so it cannot say anything neither of
   its halves says — and it is then put through both gates again, because a merge that silently
   dropped a half would otherwise pass on the strength of its parts having passed. */
const merged = [
  `# ${TOKENS.__TENANT__} — as a tenant, in full`,
  '',
  `**One business on ${TOKENS.__PLATFORM__}: how it is set up, and everything it runs on.**`,
  '',
  `Two documents in one file — the build guide first, the rules and the logic second. Both are also`,
  `published separately; this is for anybody who would rather hold one thing. Compiled ${DATE}.`,
  '',
  '---',
  '',
  '# Book one · the build guide',
  '',
  built.build,
  '',
  '---',
  '',
  '# Book two · the rules and the logic',
  '',
  built.rules,
].join('\n');

const outputs = [
  [DOCS.build.file, built.build, false, DOCS.build.parts],
  [DOCS.rules.file, built.rules, true, null],
  [FINAL, merged, true, DOCS.build.parts],
];

for (const [file, DOC, full, parts] of outputs) {
  commonChecks(file, DOC);
  if (full) coverageGate(file, DOC);
  if (parts) runbookGate(file, DOC, parts);
}

for (const [file, DOC] of outputs) {
  fs.writeFileSync(path.join(ROOT, file), DOC);
  const kb = Math.round(Buffer.byteLength(DOC) / 1024);
  console.log(`${file} written: ${kb}KB`);
}

const nb = DOCS.build.parts.reduce((s, p) => s + p.steps.length, 0);
const nr = DOCS.rules.parts.reduce((s, p) => s + p.steps.length, 0);
console.log(`  build guide: ${DOCS.build.parts.length} parts · ${nb} steps, in order, ending live`);
console.log(`  rules and logic: ${DOCS.rules.parts.length} parts · ${nr} sections · ` +
  `${NRULES} rules, each with what the system will never do instead`);
console.log(`  read from source: companies, channel kinds, set compositions, column layout, ` +
  `pay bases, refusal checks, ${NDYN} changeable things`);
console.log(`  ${roster.length} roster names checked for, 0 present · no shell command · ` +
  `every technical term explained in each document separately`);
