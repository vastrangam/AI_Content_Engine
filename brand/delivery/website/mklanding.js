'use strict';
/* Builds the VASTRANGAM BOS landing page — the whole Business Operating System as one plain-text
   page you can read, search or send.

   Every module, every app and every count comes from brand/site/modules.js, the same file the
   website and every generated PDF read, so this page cannot claim something the software does not
   contain. The trade wording comes from edition_vastrangam.js, applied the same way build.js
   applies it — words only, never structure.

   Run:  node brand/delivery/website/mklanding.js
   Then: python3 tools/report_pdf.py <the .md>  &&  node tools/report_pdf.js <the .html>
*/
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..', '..');
const BASE = require(path.join(ROOT, 'brand/site/modules.js'));
const ED = require(path.join(ROOT, 'brand/site/edition_vastrangam.js'));

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

/* words only, exactly as build.js does it — the overlay may not change structure */
const MODULES = BASE.map((m) => {
  const o = (ED.modules || {})[m.n] || {};
  return Object.assign({}, m, {
    tag: o.tag || m.tag,
    intro: (o.intro || m.intro).replace(/__NMOD__/g, String(BASE.length)),
    apps: m.apps.map((a) => ((o.apps && o.apps[a[0]]) ? [a[0], a[1], o.apps[a[0]]] : a)),
  });
});

const NAPP = MODULES.reduce((s, m) => s + m.apps.length, 0);
const NBUILT = MODULES.reduce((s, m) => s + m.apps.filter((a) => BUILT.has(a[0])).length, 0);
const NMOD = MODULES.length;

/* a pipe inside a cell would split the column, so it is escaped rather than trusted */
const cell = (s) => String(s).replace(/\|/g, '\\|').trim();

function moduleBlock(m) {
  const rows = m.apps.map((a) => {
    const built = BUILT.has(a[0]);
    const name = built ? `**${cell(a[0])}**` : cell(a[0]);
    const state = built ? 'working today' : 'designed, not yet built';
    return `| ${name} | ${cell(a[2])} | ${state} |`;
  }).join('\n');

  return `### Module ${m.n} · ${m.name}
*${m.tag}.*

${m.intro}

**Reads from:** ${m.reads.join(' · ')}
**Writes to:** ${m.writes.join(' · ')}

| App | What it does | State |
|---|---|---|
${rows}
`;
}

const PAGE = `# Vastrangam BOS — one business, one brain

**The Business Operating System for Vastrangam Group: ${NMOD} modules and ${NAPP} apps over one shared data core.**

This file is the whole system in plain text — every module, every app, and what each one reads and
writes. It is generated from \`brand/site/modules.js\`, the same file the website and every PDF read,
so nothing here can disagree with them. The counts below are not typed in; they are counted from that
file each time this page is built.

| | |
|---|---|
| **Modules** | ${NMOD}, built in dependency order — a module is only built once everything it needs exists |
| **Apps** | ${NAPP} |
| **Working today** | ${NBUILT} |
| **Still to build** | ${NAPP - NBUILT} |
| **Companies** | Vastrangam (invoices VS) · Ethnic Fashion trading as Go4Fashion (invoices EF, SKUs GF) · Adini Couture (invoices AC) |
| **Shared data core** | Company · Item/SKU · Party · Stock · Ledger/Voucher · Order |
| **Key difference** | Not a suite of integrated apps. One application over one database, so there is no sync step and no second copy of any master record |
| **Compliance** | Double-entry books with CGST/SGST/IGST, TDS, TCS, input credit on **accepted** goods, GSTR-1 and GSTR-3B, filed per registration |
| **Channels** | Amazon, Flipkart, Myntra, Meesho, Ajio, Nykaa, JioMart, plus your own storefront, the Surat counter, boutique wholesale and export |
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

**One stock number, not one per channel.** The last piece sold at the Surat counter disappears from
Myntra and Flipkart in the same instant — not three hours later as a cancellation, because
cancellations are what a seller rating is lost to.

**Accepted — not ordered — is what counts.** You order 100 metres. 100 arrive. Quality accepts 96.
Most systems increase stock by 100 and claim tax credit on 100. This one increases stock by **96**,
claims input credit on **96**, raises a debit note for the 4 rejected, and lowers that mill's accept
rate — automatically.

**Nothing derived is ever stored.** Outstanding, ageing, risk, promise dates, cost per piece and
profit per design are recomputed on read. A stored total is a number that can drift away from the
documents underneath it; a computed one cannot.

---

## How one garment moves through it

The test of whether this is one system or ${NAPP} programs sharing a login: sell a single garment and
follow it.

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
  ┌───────────────┐   the karigar who stitched it was paid for it, per raw
  │ 08 + 16 Make  │   piece, whether or not the piece completed a set
  │    and pay    │
  └───────┬───────┘
          ▼
  ┌───────────────┐   every step a live figure — and every figure clicks
  │ 21 Dashboard  │   down to the record that produced it
  └───────────────┘

     one transaction · eight modules · one database
\`\`\`

---

## Every module and every app

Listed in build order. Each app is marked **working today** or **designed, not yet built** — nothing
is described as finished that is not.

${MODULES.map(moduleBlock).join('\n---\n\n')}
---

## Companies and channels — how many is up to you

You have three companies and sell on seven marketplaces. Neither of those is a setting this system
was built around, and neither is a ceiling. A company is a **row**. A channel is a **row**. Every
business record carries the company it belongs to, and every sale carries the channel it came
through. Ten companies selling on ten channels each is the same three tables and the same code as
three and seven.

\`\`\`
   COMPANIES (a row each)          CHANNELS (a row each, per company)
   ┌──────────────┐                ┌───────────────────────────────────────┐
   │ Vastrangam   │───────────────▶│ D2C · Amazon · Myntra · Flipkart ·    │
   │ Ethnic (GF)  │───────────────▶│ Ajio · Meesho · Nykaa · POS ·         │
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
> reporting side: ten companies in one workbook produce ten pairs of columns.

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
4. **Against the owner's own figures.** Where the business already knows the answer, the software has
   to reproduce it exactly — the karigar costing run must return **25,307 sets, 59,110 pieces and
   ₹26,90,062** across 143 designs and 29 karigar units, with the 5 no-rate designs flagged rather
   than guessed. A mismatch is a bug, not a rounding difference.
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

1. **Nothing is called finished that is not.** Every deliverable is labelled tool, stub, mockup or
   spec. A mockup stays labelled a mockup even when a working version would be more impressive to
   show. Generation features stay badged as mockups until a real paid API is actually wired.
2. **Counts are counted, never claimed.** Every module and app figure on this page is read from the
   canonical module list when the page is built. No number here was typed by hand.
3. **Progress is reported as it is.** If tests fail, the failure is shown with its output. If a step
   was skipped, it is named as skipped. "Done" means implemented, tested and checked against the
   original request — not "the code has been written".
4. **The gap is stated, not buried.** ${NBUILT} of ${NAPP} apps work today. The other ${NAPP - NBUILT} are designed and
   specified. Those ${NBUILT} still run on their own storage, and rewiring them onto the shared core is
   the first job of Module 01 — until that is done they are good tools, not yet one system.
5. **Uncertainty is surfaced, not smoothed over.** Where something cannot be verified, it is reported
   as unverified rather than presented as fact.

---

*Vastrangam BOS · one business, one brain · ${NMOD} modules · ${NAPP} apps · one shared data core · ${NBUILT} working today*
`;

const OUTDIR = path.join(__dirname, 'VASTRANGAM_BOS');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });
/* The markdown twin of the PDF the site build renders into this same folder, so the pair a
   reader is handed sits together and carries the same name. */
/* Named Landing, not Website. brand/site/build.js writes Vastrangam_BOS_Website.pdf
   into this same folder from different source, and two unrelated documents sharing
   one stem is how somebody ends up reading the one that does not say what they were
   told it says. */
const OUT = path.join(OUTDIR, 'Vastrangam_BOS_Landing.md');
fs.writeFileSync(OUT, PAGE);
const kb = Math.round(Buffer.byteLength(PAGE) / 1024);
console.log(`${path.relative(ROOT, OUT)} written: ${kb}KB · ${NMOD} modules · ${NAPP} apps · ${NBUILT} working today`);
