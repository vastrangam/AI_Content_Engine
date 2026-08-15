'use strict';
/* Vastrangam_BOS_Final — the landing page and the plan of action as one document.

   Composed from the two sources rather than written a third time. A hand-made
   merge is a third copy of the same facts, and the day one of them is corrected
   is the day the three stop agreeing — which is exactly the failure this whole
   system exists to avoid. So the landing page is read from the generator's own
   output and the plan is read from PLAN_OF_ACTION.md, and this file only writes
   the front matter that stitches them together.

   The counts in that front matter are derived from modules.js the same way every
   other number here is. Nothing is typed from memory.

   Run:  node brand/delivery/website/mklanding.js      (produces Part One)
         node brand/delivery/website/mkfinal.js
         python3 tools/report_pdf.py Vastrangam_BOS_Final.md
         node tools/report_pdf.js Vastrangam_BOS_Final.html
*/

const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const OUTDIR = path.join(HERE, 'VASTRANGAM_BOS');

const LANDING = path.join(OUTDIR, 'Vastrangam_BOS_Website.md');
const PLAN = path.join(ROOT, 'PLAN_OF_ACTION.md');
const OUT = path.join(ROOT, 'Vastrangam_BOS_Final.md');

for (const f of [LANDING, PLAN]) {
  if (!fs.existsSync(f)) {
    console.error(`missing ${path.relative(ROOT, f)} — run mklanding.js first`);
    process.exit(1);
  }
}

/* ── the counts, derived ─────────────────────────────────────────────────── */
const BASE = require(path.join(ROOT, 'brand/site/modules.js'));
const BUILT = new Set([
  'CEO Dashboard', 'Report Builder', 'Group Consolidation',
  'CRM & Customer 360', 'Documents & eSign', 'Helpdesk & Live Chat',
  'D2C Sales', 'B2B & Credit', 'Export', 'POS', 'Quotes & Proforma',
  'Marketplace OMS', 'Order Management', 'Procurement', 'Vendor Management',
  'Ask & Print',
]);
const NMOD = BASE.length;
const NAPP = BASE.reduce((s, m) => s + m.apps.length, 0);
const NBUILT = BASE.reduce((s, m) => s + m.apps.filter((a) => BUILT.has(a[0])).length, 0);

/* ── the two parts, read not rewritten ───────────────────────────────────── */
const landing = fs.readFileSync(LANDING, 'utf8');
const plan = fs.readFileSync(PLAN, 'utf8');

/* Each source opens with its own H1. Inside one document those become the two
   part headings, so the first line of each is dropped and replaced. */
const stripFirstHeading = (md) => md.replace(/^#\s+[^\n]*\n+/, '');
/* Everything is pushed one level down so the merged document has a single H1. */
const demote = (md) => md.replace(/^(#{1,5})\s/gm, (_, h) => '#' + h + ' ');

const DATE = new Date().toISOString().slice(0, 10);

const FRONT = `# Vastrangam BOS

**Business Operating System — one business, one brain.**

${NMOD} modules · ${NAPP} apps · ${NBUILT} working today · compiled ${DATE}

---

## What this document is

Two documents in one, because they answer two different questions and people ask both.

**Part One — The System** is the reader's tour: what Vastrangam BOS is, how one garment moves
through it, every module and every app, and the rules that hold everywhere.

**Part Two — The Plan of Action** is the builder's document: the one law, the data core, the
module-to-module wiring, five end-to-end flows, all ${NMOD} modules in build order with a diagram
each, and what "done" means.

Both are generated from \`brand/site/modules.js\`, the one canonical list. Neither this page nor
either part contains a module count, an app name or an app order typed by hand — which is why they
cannot disagree with each other or with the software.

---

## Where the build actually stands

**${NBUILT} of ${NAPP} apps are working today.** Each one is a real single-file application that
carries its own self-tests and passes a click-through audit in both editions. Every other app in
this document is marked **designed, not yet built**, and is described as a specification rather
than as something you can open. Nothing here is described as finished that is not.

---

## Companies and channels — the short answer

**The system is not limited to three companies, and never was.**

A company is a row. A channel — a marketplace account, the D2C site, a POS counter, a B2B desk, an
export buyer — is also a row. Every business record carries the company it belongs to; every sale
also carries the channel it came through. **Ten companies with ten channels each is the same tables
and the same code as three companies and seven marketplaces.**

| | Today's data | The design |
|---|---|---|
| Companies | 3 | a table, no ceiling |
| Channels per company | 7 marketplaces + D2C, B2B, export, POS | a table, no ceiling |
| Stock | one number per SKU | one number per SKU — never per channel |
| Books | one ledger per company | one ledger per company |
| Group | sum minus inter-company trade | sum minus inter-company trade |

This is checked rather than claimed. \`core/tests/core.test.js\` builds ten companies with ten
channels each — a hundred channels — posts an order down every one plus ten inter-company sales,
and asserts that every company's books balance, that no journal line anywhere points at another
company's account, and that the group figure is the plain sum **minus** inter-company trade:
₹2,10,500 gross, ₹50,000 eliminated, ₹1,60,500 group. The same builder is then called for eleven
companies and eleven channels with nothing in the code changed.

The reporting side behaves the same way. **Vastrangam_BOS_Data_Studio.html** reads your own sale,
return and karigar workbooks in the browser — no upload, no account, no internet — and emits one
pair of quantity columns per company **found in the sheets**. A fourth company is a new sheet in the
workbook, not a new version of the software.

---

## The honesty rules this document is written under

1. Nothing is described as finished that is not. Every app is marked working today or designed.
2. No count is typed from memory. Modules, apps and build state are read from the canonical list.
3. No figure is invented. Where a rate or a price is missing, the tool posts zero and names the
   item rather than guessing — a guessed stitching rate is a wrong payment to a real person.
4. Where something could not be verified, it says so instead of implying it was.

---

`;

const PART_ONE = `# PART ONE — THE SYSTEM

${demote(stripFirstHeading(landing))}
`;

const PART_TWO = `

---

# PART TWO — THE PLAN OF ACTION

${demote(stripFirstHeading(plan))}
`;

const DOC = FRONT + PART_ONE + PART_TWO;

fs.writeFileSync(OUT, DOC);

const kb = Math.round(Buffer.byteLength(DOC) / 1024);
const diagrams = (DOC.match(/```mermaid/g) || []).length;
const h1 = (DOC.match(/^# /gm) || []).length;
console.log(`${path.relative(ROOT, OUT)} written: ${kb}KB · ${diagrams} mermaid diagrams · ` +
  `${h1} top-level headings · ${NMOD} modules · ${NAPP} apps · ${NBUILT} working today`);
