'use strict';
/* Builds the BOS landing page — the whole Business Operating System as one plain-text page you
   can read, search or send. One generator, two editions, exactly as brand/site/build.js does it:

     node brand/delivery/website/mklanding.js              → MEDHAVA, the industry-neutral edition
     node brand/delivery/website/mklanding.js vastrangam   → VASTRANGAM, one trade's own words

   Every module, every app and every count comes from brand/site/modules.js, the same file the
   website and every generated PDF read, so this page cannot claim something the software does not
   contain. Trade wording comes from edition_vastrangam.js, applied the same way build.js applies
   it — words only, never structure, and the shape gate below refuses to write the file if that
   ever stops being true.

   WHY THIS FILE TAKES AN ARGUMENT NOW
   It did not, and Medhava had no markdown generator at all. Its landing page was therefore a
   hand-maintained file, and a hand-maintained file drifts: the one in the repository claimed
   "15 modules and 65 apps" eight months after the module list had moved on. A document nobody
   generates is a document nobody can keep true, so the fix was a generator rather than a
   correction.

   Run:  node brand/delivery/website/mklanding.js [vastrangam]
   Then: python3 tools/report_pdf.py <the .md>  &&  node tools/report_pdf.js <the .html>
         (the styled PDF twin comes from brand/site/build.js — see the note at the foot)
*/
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..', '..');
const BASE = require(path.join(ROOT, 'brand/site/modules.js'));

const VAS = process.argv[2] === 'vastrangam';
/* The neutral edition has no overlay at all. That is the definition of neutral: not "a lighter
   set of trade words" but none, so anything that reads as a trade here is a bug. */
const ED = VAS ? require(path.join(ROOT, 'brand/site/edition_vastrangam.js')) : { modules: {} };

/* The product screens, merged exactly as build.js merges them, so the caption on a picture
   here names the same trade the website names for that module. */
const BASE_SHOTS = require(path.join(ROOT, 'brand/site/shots.js'));
const REG = require(path.join(ROOT, 'brand/site/registers.js'));
const SHOTS = VAS ? Object.assign({}, BASE_SHOTS, ED.shots || {}) : BASE_SHOTS;

/* The walkthrough's words, shared with the styled site so the page and this document cannot
   tell a reader two different stories. */
const WALK = require(path.join(ROOT, 'brand/site/walkthrough.js'));

/* The sixteen apps that exist as working files today. This list is the honest one: each of these
   opens in a browser, carries its own self-tests, and passes the click-through audit in both
   editions. Anything not on it is described as designed, never as done. */
const BUILT = new Set([
  'CEO Dashboard', 'Report Builder', 'Group Consolidation',
  'CRM & Customer 360', 'Documents & eSign', 'Helpdesk & Live Chat',
  'D2C Sales', 'B2B & Credit', 'Export', 'POS', 'Quotes & Proforma',
  'Marketplace OMS', 'Order Management',
  'Procurement', 'Vendor Management',
  'Ask & Print',
]);

/* Apps whose engine is written and passing its own tests on the command line, but which
   have no browser screen yet. Kept separate from BUILT because the sentence beside that
   count promises a browser check these have not had — and separate from "designed, not
   yet built" because the arithmetic is written and runs. Mirrors the same set in
   brand/site/build.js, so the markdown and the PDF cannot disagree about what is done.
     Provider Router & Cost Guard  node brand/suite/router.js --selftest
     Motion Renderer               node brand/suite/studio/motion_render.js --selftest */
const ENGINE = new Set([
  'Provider Router & Cost Guard',
  'Motion Renderer',
]);

/* words only, exactly as build.js does it — the overlay may not change structure */
const MODULES = BASE.map((m) => {
  const o = (ED.modules || {})[m.n] || {};
  return Object.assign({}, m, {
    tag: o.tag || m.tag,
    intro: (o.intro || m.intro).replace(/__NMOD__/g, String(BASE.length)),
    apps: m.apps.map((a) => ((o.apps && o.apps[a[0]]) ? [a[0], a[1], o.apps[a[0]]] : a)),
  });
});

/* THE SHAPE GATE. build.js has had one since the overlay existed; this file did not, so the
   markdown twin could in principle have shipped a structure the website never showed.

   Be precise about what it catches. As the mapping above is written, `a[0]` is carried through
   untouched, so no overlay FILE can move a name — the gate cannot fire from data alone. What it
   guards is the mapping code itself: the day somebody makes the overlay a little more powerful
   ("just let it override the app name too"), this stops the page being written instead of quietly
   shipping a document that disagrees with the website. Verified by making exactly that change and
   watching it exit 1. */
const shape = (l) => l.map((m) => m.n + ':' + m.apps.map((a) => a[0]).join('|')).join(' ');
if (shape(BASE) !== shape(MODULES)) {
  console.error('mklanding: the edition overlay changed the STRUCTURE, not just the words.');
  console.error('  A module number, an app name or an app count moved. Words only — see CLAUDE.md §5.');
  process.exit(1);
}

const NAPP = MODULES.reduce((s, m) => s + m.apps.length, 0);
const NMOD = MODULES.length;

/* ── the industry packs, read rather than typed ──────────────────────────────
   Only the neutral edition carries this section, and it is generated from the pack files
   themselves so a seventh pack appears on the page without anyone editing the page. */
let PACKS_API = null;
function packTable() {
  let packs = {};
  try {
    PACKS_API = require(path.join(ROOT, 'core/packs.js'));
    packs = PACKS_API.loadAll();
  } catch (_) { return null; }
  const rows = Object.values(packs).sort((a, b) => (a.rank || 99) - (b.rank || 99));
  if (!rows.length) return null;
  return rows;
}

/* The trade's own words for three concepts, shown side by side. Deliberately NOT written as
   "an order is a ..." — the retail pack calls an order an order, which made that sentence read
   "an order is a order", and the clinic's made it "a appointment". Naming the concepts once in
   the column header and listing the words underneath has no articles to get wrong. */
function packWords(p) {
  if (!PACKS_API) return '—';
  return ['customer', 'order', 'person']
    .map((c) => PACKS_API.term(p, c))
    .join(' · ');
}

function sectorList() {
  const out = new Set();
  Object.keys(SHOTS).forEach((k) => {
    (Array.isArray(SHOTS[k]) ? SHOTS[k] : [SHOTS[k]])
      .forEach((s) => { if (s && s.sector) out.add(s.sector); });
  });
  return [...out];
}

/* a pipe inside a cell would split the column, so it is escaped rather than trusted */
const cell = (s) => String(s).replace(/\|/g, '\\|').trim();

/* ── the screenshot for a module ──────────────────────────────────────────────
   A module described only in prose asks the reader to picture the software, which is the exact
   thing this page kept doing. The PNG is rendered by mkshots.js from the SAME markup and the
   SAME stylesheet the website uses, so what a reader sees here is not an artist's impression.

   Referenced by a relative path rather than inlined: a reader opening the .md in any markdown
   viewer sees the picture, and report_pdf.py base64-inlines it when it builds the PDF, so the
   PDF stays a single self-contained file. mkfinal.js rebases these when it composes the Final,
   which sits in a different directory.

   BOTH editions carry pictures now. This was Medhava-only for one change, on the argument that
   the request had been scoped that way — and the note here said turning the trade edition on
   would be `mkshots.js vastrangam` plus a flag. It was exactly that, which is the point of
   having built the shooter edition-aware rather than writing a Medhava-shaped one. */
const SHOTS_IN_MD = true;
/* Named once, here, because both the screenshot lookup and the COPY block below need it and
   the COPY block is defined further down. */
const OUT_SUB = VAS ? 'VASTRANGAM_BOS' : 'MEDHAVA_BOS';

function shotFor(m) {
  if (!SHOTS_IN_MD) return '';
  const rel = `shots/m${m.n}.png`;
  if (!fs.existsSync(path.join(__dirname, OUT_SUB, rel))) {
    console.error(`mklanding: ${rel} is missing — run "node brand/delivery/website/mkshots.js" ` +
      `first. A document with a hole where a screen should be is worse than one with no screens.`);
    process.exit(1);
  }
  const raw = SHOTS[m.n];
  const s = Array.isArray(raw) ? raw[0] : raw;
  const who = s && s.sector ? `${s.sector} · ` : '';
  /* The caption names the trade the figures are drawn from AND says they are illustrative,
     every time. A screenshot reads as evidence, and evidence that is actually an example has
     to say so where it is looked at rather than in a footnote nobody reaches. */
  return `\n![${who}${(s && s.t) || m.name} — illustrative figures](${rel})\n`;
}

function moduleBlock(m) {
  /* The third column used to carry build state — working today, designed, engine only. In a
     document describing a system to be built, every row would say the same thing, so the column
     said nothing and took a third of the width to say it. */
  const rows = m.apps.map((a) => `| **${cell(a[0])}** | ${cell(a[2])} |`).join('\n');

  return `### Module ${m.n} · ${m.name}
*${m.tag}.*

${m.intro}
${shotFor(m)}
**Reads from:** ${m.reads.join(' · ')}
**Writes to:** ${m.writes.join(' · ')}

| App | What it does |
|---|---|
${rows}
`;
}

/* ══ THE PER-EDITION COPY ═══════════════════════════════════════════════════
   Everything below this line that names a trade, a place or a company lives here and nowhere
   else. The skeleton underneath is shared, which is the whole argument the page is making:
   the same structure, the same counts, the same modules — different words on top. */

const COPY = {

vastrangam: {
  h1: 'Vastrangam BOS — one business, one brain',
  subtitle: `**The Business Operating System for Vastrangam Group: ${NMOD} modules and ${NAPP} apps over one shared data core.**`,
  rowCompanies: 'Vastrangam (invoices VS) · Ethnic Fashion trading as Go4Fashion (invoices EF, SKUs EF) · Adini Couture (invoices AC)',
  rowChannels: 'Amazon, Flipkart, Myntra, Meesho, Ajio, Nykaa, JioMart, plus your own storefront, the Surat counter, boutique wholesale and export',

  stockPara: `**One stock number, not one per channel.** The last piece sold at the Surat counter disappears from
Myntra and Flipkart in the same instant — not three hours later as a cancellation, because
cancellations are what a seller rating is lost to.`,

  acceptPara: `**Accepted — not ordered — is what counts.** You order 100 metres. 100 arrive. Quality accepts 96.
Most systems increase stock by 100 and claim tax credit on 100. This one increases stock by **96**,
claims input credit on **96**, raises a debit note for the 4 rejected, and lowers that mill's accept
rate — automatically.`,

  flowHeading: 'How one garment moves through it',
  flowLead: `The test of whether this is one system or ${NAPP} programs sharing a login: sell a single garment and
follow it.`,
  flowMake: `  ┌───────────────┐   the karigar who stitched it was paid for it, per raw
  │ 08 + 16 Make  │   piece, whether or not the piece completed a set
  │    and pay    │
  └───────┬───────┘`,

  companiesSection: `## Companies and channels — how many is up to you

You have three companies and sell on seven marketplaces. Neither of those is a setting this system
was built around, and neither is a ceiling. A company is a **row**. A channel is a **row**. Every
business record carries the company it belongs to, and every sale carries the channel it came
through. Ten companies selling on ten channels each is the same three tables and the same code as
three and seven.

\`\`\`
   COMPANIES (a row each)          CHANNELS (a row each, per company)
   ┌──────────────┐                ┌───────────────────────────────────────┐
   │ Vastrangam   │───────────────▶│ D2C · Amazon · Myntra · Flipkart ·    │
   │ Ethnic (EF)  │───────────────▶│ Ajio · Meesho · Nykaa · POS ·         │
   │ Adini        │───────────────▶│ B2B desk · Export buyer · …           │
   │ …the eighth  │───────────────▶│ …the eleventh                         │
   └──────────────┘                └───────────────────────────────────────┘
          │                                          │
          └──────────────┬───────────────────────────┘
                         ▼
              ONE stock number per SKU
        the channel is on the sale, never on the stock
\`\`\`

**Three things this buys you, and one it deliberately refuses.**

**Each company's books are its own.** Its trial balance balances on its own. No report can reach
across into another company's rows — not by convention, but because a journal line can only point at
an account that belongs to the same company, and a test checks that no line anywhere ever does.

**The group is the sum minus what you sold yourselves.** When Vastrangam sells to Ethnic, that is
revenue in one set of books and cost in another. Adding the companies up would report a group
turnover the group never earned from the outside world. Every entry that names a sister company is
eliminated at group level, and the consolidation returns all three numbers — gross, eliminated,
group — so you can see the elimination rather than take it on trust.

**The channel is a dimension of the sale, never of the stock.** You can read this month by channel,
by company, or by both. What you cannot do is keep a separate stock number per channel, and that is
on purpose: the last piece sold on one marketplace has to vanish from the other ten at that instant,
which per-channel inventory cannot do.

**And the tool follows your sheets.** Drop a workbook into the Data Studio and the report's columns
come from the sheets that are actually in it. Two companies today gives two pairs of columns; a
fourth company is a new sheet in the workbook, not a new version of the software.

> **This is checked, not claimed.** \`core/tests/core.test.js\` builds ten companies with ten
> channels each — a hundred channels — posts an order down every one plus ten inter-company sales,
> and asserts every company's books balance, that no journal line points at another company's
> account, and that the group figure is the plain sum **minus** inter-company trade: ₹2,10,500
> gross, ₹50,000 eliminated, ₹1,60,500 group. It then calls the same builder for eleven companies
> and eleven channels with no code changed. The Data Studio's own tests do the matching thing on the
> reporting side: ten companies in one workbook produce ten pairs of columns.`,

  verify4: `4. **Against the owner's own figures.** Where the business already knows the answer, the software has
   to reproduce it — and where it cannot, the reason is named rather than the number quietly
   adjusted. The reference report the business produced by hand covers April 2025 to June 2027 and
   totals **25,307 sets, 59,110 pieces and ₹26,90,062** across 143 designs and 29 karigar units.
   Run today against the workbooks as they now stand, the engine returns **16,662 sets, 36,229
   pieces and ₹17,45,911** across 128 designs and 20 karigars — because the FY2026-27 workbook has
   since been restructured into one payment sheet per team and no longer carries a design grid at
   all, so that year's rows cannot be read from it. The verification does not paper over this: it
   places **every** design in the reference report into a bucket with a named cause — matched
   exactly, changed at source, rate added since, incomplete-set rule, or only present in the
   FY2026-27 grid — and fails on any design whose difference has no explanation. There are
   currently none. A mismatch is a bug, not a rounding difference; an unreadable input is a stated
   limitation, not a passing test.`,

  extra: '',
  walkthrough: '__WALKTHROUGH__',
  footer: `*Vastrangam BOS · one business, one brain · ${NMOD} modules · ${NAPP} apps · one shared data core*`,
  outDir: OUT_SUB,
  outFile: 'Vastrangam_BOS_Website.md',
},

medhava: {
  h1: 'Medhava — one business, one brain',
  subtitle: `**One Business Operating System for any trade: ${NMOD} modules and ${NAPP} apps over one shared data core.**`,
  rowCompanies: 'As many as you have. A company is a row, not a setting — the shipped plan caps a subscription at 20 and the software itself has no ceiling',
  rowChannels: 'Any storefront, marketplace, counter, wholesale desk or export buyer — read from your own data, never from a list inside the code',

  stockPara: `**One stock number, not one per channel.** The last unit sold at the counter disappears from every
marketplace you sell on in the same instant — not three hours later as a cancellation, because
cancellations are what a seller rating is lost to.`,

  acceptPara: `**Accepted — not ordered — is what counts.** You order 100 units. 100 arrive. Quality accepts 96.
Most systems increase stock by 100 and claim tax credit on 100. This one increases stock by **96**,
claims input credit on **96**, raises a debit note for the 4 rejected, and lowers that supplier's
accept rate — automatically.`,

  flowHeading: 'How one order moves through it',
  flowLead: `The test of whether this is one system or ${NAPP} programs sharing a login: take a single order and
follow it. The words below are a product business's; a clinic, a law practice and a freight desk run
the same eight modules with their own words on them.`,
  flowMake: `  ┌───────────────┐   the person who made it was paid for it, per unit of
  │ 08 + 16 Make  │   work done, whether or not it completed a set
  │    and pay    │
  └───────┬───────┘`,

  companiesSection: `## Companies and channels — how many is up to you

Whatever number you have, it is not a setting this system was built around, and it is not a ceiling.
A company is a **row**. A channel is a **row**. Every business record carries the company it belongs
to, and every sale carries the channel it came through. Ten companies selling on ten channels each is
the same three tables and the same code as one company selling on one.

\`\`\`
   COMPANIES (a row each)          CHANNELS (a row each, per company)
   ┌──────────────┐                ┌───────────────────────────────────────┐
   │ Company 1    │───────────────▶│ Own storefront · marketplace ·        │
   │ Company 2    │───────────────▶│ counter · wholesale desk ·            │
   │ Company 3    │───────────────▶│ export buyer · …                      │
   │ …the eighth  │───────────────▶│ …the eleventh                         │
   └──────────────┘                └───────────────────────────────────────┘
          │                                          │
          └──────────────┬───────────────────────────┘
                         ▼
              ONE stock number per SKU
        the channel is on the sale, never on the stock
\`\`\`

**Three things this buys you, and one it deliberately refuses.**

**Each company's books are its own.** Its trial balance balances on its own. No report can reach
across into another company's rows — not by convention, but because a journal line can only point at
an account that belongs to the same company, and a test checks that no line anywhere ever does.

**The group is the sum minus what you sold yourselves.** When one company in a group sells to
another, that is revenue in one set of books and cost in another. Adding the companies up would
report a group turnover the group never earned from the outside world. Every entry that names a
sister company is eliminated at group level, and the consolidation returns all three numbers —
gross, eliminated, group — so you can see the elimination rather than take it on trust.

**The channel is a dimension of the sale, never of the stock.** You can read this month by channel,
by company, or by both. What you cannot do is keep a separate stock number per channel, and that is
on purpose: the last unit sold on one marketplace has to vanish from the others at that instant,
which per-channel inventory cannot do.

**And the reporting follows your own sheets.** The report's columns come from the sheets that are
actually in the workbook you give it. A fourth company is a new sheet, not a new version of the
software.

> **This is checked, not claimed.** \`core/tests/core.test.js\` builds ten companies with ten
> channels each — a hundred channels — posts an order down every one plus ten inter-company sales,
> and asserts every company's books balance, that no journal line points at another company's
> account, and that the group figure is the plain sum **minus** inter-company trade: ₹2,10,500
> gross, ₹50,000 eliminated, ₹1,60,500 group. It then calls the same builder for eleven companies
> and eleven channels with no code changed.`,

  verify4: `4. **Against a business's own figures.** Where a business already knows the answer, the software has
   to reproduce it — and where it cannot, the reason is named rather than the number quietly
   adjusted. In the worked implementation carried furthest, every record in the owner's hand-made
   reference report is placed into a bucket with a named cause — matched exactly, changed at source,
   rate added since, a rule that applies, or present only in a source file that has since been
   restructured and can no longer be read — and the check fails on any record whose difference has
   no explanation. A mismatch is a bug, not a rounding difference; an unreadable input is a stated
   limitation, not a passing test.`,

  extra: '__PACKS__',
  walkthrough: '__WALKTHROUGH__',
  footer: `*Medhava · one business, one brain · ${NMOD} modules · ${NAPP} apps · one shared data core*`,
  outDir: OUT_SUB,
  outFile: 'Medhava_Website.md',
},

};

const C = VAS ? COPY.vastrangam : COPY.medhava;

/* ── the walkthrough, for the neutral edition only ────────────────────────────
   Everything above this section describes the system. This one follows a person using it,
   because "22 modules over one data core" is an accurate sentence that tells a reader nothing
   about their Tuesday. Each step names the module doing the work and shows its real screen. */
function walkStep(n, title, body) {
  const rel = `shots/m${n}.png`;
  const raw = SHOTS[n];
  const s = Array.isArray(raw) ? raw[0] : raw;
  const who = s && s.sector ? `${s.sector} · ` : '';
  const img = (SHOTS_IN_MD && fs.existsSync(path.join(__dirname, OUT_SUB, rel)))
    ? `\n![${who}${(s && s.t) || title} — illustrative figures](${rel})\n` : '';
  return `**${title}**  ·  Module ${n}\n\n${body}\n${img}`;
}

/* The walkthrough CONTENT lives in brand/site/walkthrough.js so the styled website can render
   the same words. Here it is turned into markdown; build.js turns the same structure into HTML.
   Writing it twice was the alternative, and two copies of one narrative drift the first time
   either is corrected. */
function walkthroughSection() {
  const packs = packTable() || [];
  const byId = {};
  packs.forEach((p) => { byId[p.id] = p; });
  const word = (id, concept) => (PACKS_API && byId[id])
    ? PACKS_API.term(byId[id], concept) : concept;

  const w = WALK.sections(VAS ? 'vastrangam' : 'medhava', { nmod: NMOD, word });

  const body = w.sections.map((s) => {
    if (s.kind === 'head') return `### ${s.text}`;
    if (s.kind === 'prose') return s.text;
    if (s.kind === 'step') return walkStep(s.mod, s.title, s.body);
    /* flow: markdown gets the mermaid, because it can draw the decision and the loop back */
    return (s.heading ? `### ${s.heading}\n\n` : '') + '```mermaid\n' + s.mermaid + '\n```';
  }).join('\n\n');

  return `## ${w.title}\n\n${w.intro.join('\n\n')}\n\n${body}`;
}

/* ── the packs section, for the neutral edition only ─────────────────────── */
function packsSection() {
  const packs = packTable();
  const sectors = sectorList();
  if (!packs) return '';

  const rows = packs.map((p) => `| ${p.rank || '—'} | \`${p.id}\` | ${cell(p.sector)} | ` +
    `${cell(packWords(p))} | ` +
    `${Object.keys(p.stages || {}).length} | ${(p.documents || []).length} |`).join('\n');

  return `## Every industry, as a row of configuration

This is the part that makes "any trade" a fact rather than a claim. A trade is **not** a fork of the
software, a branch, or a bespoke build. It is a file: what this trade calls things, the stages its
work moves through, the extra fields its records need, the documents it issues, which discretionary
rules apply, and the reference data it starts with.

| Rank | Pack | Sector | Its words for customer · order · worker | Pipelines | Documents |
|---|---|---|---|---|---|
${rows}

The order is not taste. Manufacturing is the largest ERP user base — around a fifth of all users and
roughly a third of market revenue. Professional and financial services is next at 13.86%, and has no
stock at all, which makes it the hardest case for the claim. Distribution is 9.90%. Retail and
e-commerce is the largest warehouse-management segment at about 28%. Healthcare is under 5% of ERP
users today and the fastest-growing of them all at 22.37% a year. Transportation is the most-served
market among third-party logistics providers at 90%, and **order management ranks first** among the
technology services those providers offer.

**What a pack may never do.** A configuration file that can do anything is not configuration, it is
a hole. A pack may not contain executable code at any depth, invent a concept the engine does not
have, add a field to a table that does not exist, declare money as anything but integer paise, switch
off an immutable rule — company scoping, the audit trail, the posting rules, group elimination,
roster privacy — or be applied in part. Each of those refusals is a named test.

**One default worth stating on its own:** a rule a pack never mentions is **on**. The rulebook is the
default and a pack is an exception list, never a permission list. The other way round, every rule
added after a pack was written would silently apply to nobody using it.

**The test that decides whether this is a product.** \`core/tests/packs.test.js\` invents a
**commercial laundry** — a trade that appears nowhere in this software, in no pack, in no module and
in no rule — hands the engine a JSON string while the tests are running, and requires the whole
system to answer in that trade's words: an order reads as a docket, a work order as a wash load, a
customer as an account. Its pipeline resolves ordered and terminating, its fields land on real
tables, its rule switches resolve against the real rulebook, and it is refused the audit trail
exactly as the shipped packs are. A final assertion fails the build if the engine file ever contains
a single trade word — because an engine that knows one trade's words has an opinion about which
trades are normal.

${sectors.length ? `**And the product screens are drawn from ${sectors.length} sectors,** not one: ` +
  /* Comma-joined, and the source casing kept. A "·" join read as thirteen items because one
     sector is itself called "Homeware brand · D2C", and lower-casing turned HVAC into hvac. */
  sectors.join(', ') + `. The same module is shown with each of
their figures, one under the other, so the argument is made where it can be checked rather than
believed.` : ''}`;
}

/* ══ THE PAGE — one skeleton, both editions ════════════════════════════════ */

const DRAFT = `# ${C.h1}

${C.subtitle}

This file is the whole system in plain text — every module, every app, and what each one reads and
writes. It is generated from \`brand/site/modules.js\`, the same file the website and every PDF read,
so nothing here can disagree with them. The counts below are not typed in; they are counted from that
file each time this page is built.

| | |
|---|---|
| **Modules** | ${NMOD}, in dependency order — a module comes only after everything it draws on |
| **Apps** | ${NAPP} |
| **Companies** | ${C.rowCompanies} |
| **Shared data core** | Company · Item/SKU · Party · Stock · Ledger/Voucher · Order |
| **Key difference** | Not a suite of integrated apps. One application over one database, so there is no sync step and no second copy of any master record |
| **Compliance** | Double-entry books with CGST/SGST/IGST, TDS, TCS, input credit on **accepted** goods, GSTR-1 and GSTR-3B, filed per registration |
| **Channels** | ${C.rowChannels} |
| **Security** | Row-level isolation per company; outside services connect with scoped, revocable keys — **never account passwords** |
| **Deployment** | Hosted, or single-file apps that run by double-clicking with no install and no internet |

---

## The one idea

Every module reads and writes the **same six records**. That is the physical reason a single goods
receipt can touch stock, the books, quality and sourcing in the same instant.

\`\`\`
                  ┌───────────────────────────────────────┐
                  │          UNIFIED DATA CORE            │
                  │  Company · Item/SKU · Party ·         │
                  │  Stock · Ledger/Voucher · Order       │
                  └───────────────────────────────────────┘
                                   ▲ ▼
       every one of the ${NAPP} apps reads and writes these, and only these
\`\`\`

${C.stockPara}

${C.acceptPara}

**Nothing derived is ever stored.** Outstanding, ageing, risk, promise dates, cost per piece and
profit per design are recomputed on read. A stored total is a number that can drift away from the
documents underneath it; a computed one cannot.

---

## ${C.flowHeading}

${C.flowLead}

\`\`\`
  sold on a marketplace
          │
          ▼
  ┌───────────────┐   order lands in one queue, sorted by the time LEFT
  │ 15 OMS        │   on its cut-off — not the time it arrived
  └───────┬───────┘
          ▼
  ┌───────────────┐   stock down by one, on EVERY channel, same instant
  │ 03 Inventory  │
  └───────┬───────┘
          ▼
  ┌───────────────┐   picked from the named bin, in walking order, filmed
  │ 10 Warehouse  │
  └───────┬───────┘
          ▼
  ┌───────────────┐   cheapest and fastest both known before booking;
  │ 11 Logistics  │   COD collected at the door reconciled to the bank
  └───────┬───────┘
          ▼
  ┌───────────────┐   revenue and GST posted through ONE posting engine
  │ 12 Accounting │   — entries balance or they do not post
  └───────┬───────┘
          ▼
  ┌───────────────┐   weeks later the payout is matched to the paise, and
  │ 14 Settlement │   any shortfall is named and claimed before it expires
  └───────┬───────┘
          ▼
${C.flowMake}
          ▼
  ┌───────────────┐   every step a live figure — and every figure clicks
  │ 21 Dashboard  │   down to the record that produced it
  └───────────────┘

     one transaction · eight modules · one database
\`\`\`

---
${[
  C.extra === '__PACKS__' ? '\n' + packsSection() + '\n\n---\n' : '',
  C.walkthrough === '__WALKTHROUGH__' ? '\n' + walkthroughSection() + '\n\n---\n' : '',
].join('')}
## Every module and every app

Listed in build order.
is described as finished that is not.

${MODULES.map(moduleBlock).join('\n---\n\n')}
---

${C.companiesSection}

---

## The rules that hold everywhere

1. **No app depends on any single outside company.** Every capability — books, marketplaces, AI
   writing, couriers, payments, messaging, storage, GST, printing, barcode — has several
   interchangeable providers and a by-hand option, so the system works with nothing connected at all.
   **A provider named as the source of a figure is a bug**; providers move messages and money, the
   ledger originates numbers.
2. **The books are this system's own.** No other accounting package is required, ever. Tally, BUSY
   and Zoho remain available for anyone already running one — nothing assumes them, and no figure is
   ever sourced from one.
3. **Nothing ever asks for an account password.** Outside services connect with a scoped, revocable
   key. *This system will never ask you for a marketplace, bank or account password. If any screen
   ever does, it is not this system.*
4. **Money is integer paise, never a floating-point number**, because float arithmetic accumulates
   the error that eventually shows up as a trial balance that will not tie.
5. **Values that change over time are effective-dated** — a salary, a price, a tax rate, a
   commission. March payroll resolves the salary in force *in March*. A missing value is an error,
   never silently treated as zero.
6. **Nothing is deleted, only deactivated.** A person who leaves keeps their name attached to years
   of earnings, approvals and audit rows that must still resolve.
7. **The audit trail has no off switch.** Eight years, before-and-after values, as the MCA rule
   requires — because an audit trail that can be switched off is one that gets silenced exactly when
   it matters.
8. **Gates, not warnings.** Each app refuses one thing outright, because a warning gets clicked
   through on a busy afternoon. A cash-on-delivery order cannot be packed below its advance. A bill
   for more than was accepted cannot be paid. Every gate is also a self-test.
9. **It is not trained. It is built.** No model learns from your data. Every rule is written down,
   visible on the Wiring screen, and checked by a self-test — so it is right on day one.
10. **You can reach it from anywhere, but it cannot be reached into.** Ask & Print takes a plain line
    from your phone and sends a PDF back. The office reaches out; the internet never reaches in.

---

## How it is verified

Nothing ships because it looked right on a screen.

1. **The arithmetic, with no screen involved.** Each engine runs in isolation and its self-tests
   execute against seeded data.
2. **Every screen and every control, in a real browser.** Each build opens in headless Chromium;
   every screen is visited and every interactive control on it is clicked. Any console error fails
   the build.
3. **The real job, with the result asserted.** Not "does the button click" but "did the thing
   happen". A control that looks alive but changes nothing fails the build.
${C.verify4}
5. **A structural audit.** Every "comes from" on every Wiring screen must name a module that actually
   exists, no vendor name may ever be the source of a figure, and the app count in every file must
   match this one.
6. **The shipped copy, not the working copy.** The packaged archive is extracted and re-tested in the
   folder a customer would open it in, because a packaging step that quietly renames a file breaks
   nothing until it is in somebody's Downloads folder.

---

## The honesty charter

This is the standard the build is held to, and it is written down because a standard nobody wrote
down is a standard nobody can be held to.

1. **This page describes a design.** Everything on it is what the system is being built to be, and
   nothing on it claims to already exist. When a part of it is finished, it will say so with the test
   that proves it — never before.
2. **Counts are counted, never claimed.** Every module and app figure on this page is read from the
   canonical module list when the page is built. No number here was typed by hand.
3. **Progress is reported as it is.** If tests fail, the failure is shown with its output. If a step
   was skipped, it is named as skipped. "Done" means implemented, tested and checked against the
   original request — not "the code has been written".
4. **Every capability names its alternatives.** No part of this system depends on a single outside
   company. Each layer names what it is built on, at least two replacements, and the interface the
   rest of the code talks to — so changing a supplier is a setting, not a rebuild.
5. **Uncertainty is surfaced, not smoothed over.** Where something cannot be verified, it is reported
   as unverified rather than presented as fact.

---

## Every technical word on this page, in plain language

**This page uses ordinary words wherever ordinary words will do.** Where it could not, the term is
here — with an everyday comparison, because a sales page that assumes you already know the jargon is
selling to somebody else.

Only the words this page actually uses are listed. Padding it with definitions of terms that never
appear would improve a count and make the page worse.

__GLOSSARY__

---

${C.footer}
`;

/* THE GLOSSARY IS COMPUTED FROM THE FINISHED PAGE, not from a list somebody kept by hand.
   Which is why it is substituted here rather than interpolated above: the page has to exist
   before you can ask which words it used. Measured against the page with the glossary slot
   still empty, so a term never qualifies merely because its own definition mentions it. */
const PAGE = DRAFT.replace('__GLOSSARY__',
  REG.glossarySection({ heading: '###', intro: false, only: DRAFT.replace('__GLOSSARY__', '') }));

const OUTDIR = path.join(__dirname, C.outDir);
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });
/* Named to MATCH the PDF, deliberately. brand/site/build.js writes that edition's website PDF
   into this same folder, and an earlier pass renamed this to _Landing out of a worry that two
   documents were sharing one stem. They are not two documents. Both are generated from
   brand/site/modules.js — the same modules, the same apps, the same counts — one rendered as the
   styled page and one as markdown. A reader handed the .md and the .pdf is holding one document
   in two forms, which is exactly what the matched name says. The mismatched pair was the bug;
   do not "fix" this back. */
const OUT = path.join(OUTDIR, C.outFile);
fs.writeFileSync(OUT, PAGE);
const kb = Math.round(Buffer.byteLength(PAGE) / 1024);
console.log(`${path.relative(ROOT, OUT)} written: ${kb}KB · ${VAS ? 'VASTRANGAM' : 'MEDHAVA'} · ` +
  `${NMOD} modules · ${NAPP} apps`);
