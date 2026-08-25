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


/* ── THE FULL RULEBOOK — every rule, not a count ─────────────────────────────
   The previous version of this document printed "Module 05 · 18 rules" and nothing else.
   A count is not a rulebook: it tells a reader how much they are not being shown.

   Every rule carries four things and all four are rendered. The one that matters most is
   `never` — what the system refuses to do instead — because that is the half a business
   relies on when nobody is watching, and it was entirely absent. */
function rulebookFullBlock() {
  const out = [];
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
    rulebookFull: rulebookFullBlock(),
    attendance: attendanceBlock(),
    salary: salaryBlock(),
    productivity: productivityBlock(),
    accounting: accountingBlock(),
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
    const line = re.exec(DOC);   // the real lines — a collapsed doc has only one
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

/* ── 5 · THE COVERAGE GATE ───────────────────────────────────────────────────
   THE CHECK THAT SHOULD HAVE EXISTED FROM THE START.

   Every other check in this file asks "is what is here correct?". Not one of them asked
   "is anything missing?" — which is how a document containing ZERO of 285 rules passed
   every check, was rendered, verified, read, committed and delivered.

   Correctness gates catch a wrong statement. Only a coverage gate catches an absent one,
   and an absent one is worse: a reader cannot see a gap, so they assume the document is
   whole. This refuses to write unless the thing is actually complete. */
const gaps = [];

/* 5a · every rule, by number. A count is not coverage — the previous version reported
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

/* 5d · the payroll and attendance logic the engine encodes. A function the engine defines
        and this document never mentions is logic that silently did not travel. */
const ENGINE_TERMS = (() => {
  const out = new Set();
  for (const f of ['pay.py', 'attendance.py', 'allocation.py']) {
    try {
      const src = fs.readFileSync(path.join(ROOT, 'engine', 'vastrangam', f), 'utf8');
      (src.match(/^def ([a-z][a-z0-9_]*)/gm) || [])
        .map((d) => d.replace('def ', ''))
        .filter((n) => !n.startsWith('_'))
        .forEach((n) => out.add(n));
    } catch (_) { /* the file is optional; its absence is not a coverage failure */ }
  }
  return [...out];
})();
/* Matched on the words, not the function name — a document should say "blended daily",
   never `blended_daily`. */
const missingLogic = ENGINE_TERMS.filter((t) => {
  const words = t.replace(/_/g, ' ');
  return !new RegExp(words.replace(/ /g, '[ -]'), 'i').test(DOC);
});
if (missingLogic.length) {
  gaps.push(`payroll and attendance logic the engine encodes but this document never ` +
    `explains: ${missingLogic.join(', ')}`);
}

/* 5e · the accounting vocabulary. Zero occurrences of these was the single clearest
        signal that a whole subject had been skipped, so it becomes a check. */
const ACCOUNTING = ['ledger', 'debit', 'credit', 'input credit', 'voucher', 'period lock'];
const missingAcct = ACCOUNTING.filter((t) => !new RegExp('\\b' + t, 'i').test(DOC));
if (missingAcct.length) gaps.push(`accounting subjects never mentioned: ${missingAcct.join(', ')}`);

if (gaps.length) {
  console.error(`mktenant: the document is INCOMPLETE. Refusing to write it.\n`);
  gaps.forEach((g) => console.error('  · ' + g));
  console.error(`\n  Asked for "every rule and every piece of logic, nothing skipped".`);
  console.error(`  A correctness check cannot catch an absence. This one can.`);
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
