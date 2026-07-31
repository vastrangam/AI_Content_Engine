'use strict';
/* Builds INDEX.md — the whole website as one plain-text page you can read, search or send.
   Every module, every app, every wiring line comes from modules.js, so it can never say
   something the site does not. Run it after build.js. */
const fs = require('fs'), path = require('path');
const D = __dirname;
const MODULES = require('./modules.js');
const NMOD = MODULES.filter(m => !m.spine).length;
const NAPP = MODULES.reduce((s, m) => s + m.apps.length, 0);
const BUILT = require(path.join(D, '..', 'suite', 'deep', 'tests.json'));

/* which apps are actually built, and how many self-tests each carries */
const DONE = {
  'CEO Dashboard': 'DASH_ERP', 'Report Builder': 'REP_ERP',
  'CRM & Customer 360': 'CRM_ERP',
  'D2C Sales': 'D2C_ERP', 'B2B & Credit': 'B2B_ERP', 'Export': 'EXP_ERP',
  'POS': 'POS_ERP', 'Quotes & Proforma': 'QT_ERP',
  'Marketplace OMS': 'OMS_ERP', 'Order Management': 'ORD_ERP',
  'Procurement': 'PROC_ERP', 'Vendor Management': 'VEND_ERP',
  'Ask & Print': 'AP_ERP',
};
const tests = n => (BUILT[DONE[n]] || []).length;
const built = n => !!DONE[n] && !!BUILT[DONE[n]];

const rows = [];
let doneApps = 0;
MODULES.forEach(m => m.apps.forEach(a => { if (built(a[0])) doneApps++; }));

const md = `# Medhava — One business. One brain.

**A unified ERP: ${NMOD} modules and ${NAPP} apps over one shared data core.**

This file is the whole website in plain text — every module, every app, and what each one
reads and writes. It is generated from \`modules.js\`, the same file the website and every
PDF read, so nothing here can disagree with them.

| | |
|---|---|
| **Modules** | ${NMOD} business modules, plus the Platform spine underneath all of them |
| **Apps** | ${NAPP} |
| **Built and shipping** | ${doneApps} |
| **Shared data core** | Item/SKU · Party · Stock · Ledger/Voucher · Order |
| **Key difference** | Not a suite of integrated apps. One application, so there is no sync step and no duplicate master data |
| **Compliance** | Double-entry accounting with CGST/SGST/IGST, TDS, TCS, input credit on accepted goods, GSTR-1 and GSTR-3B |
| **Channels** | Amazon, Flipkart, Myntra, Meesho, Ajio, Nykaa, JioMart, plus Shopify and WooCommerce |
| **Security** | Row-level security per company; integrations use revocable scoped API keys — **never account passwords** |
| **Deployment** | Hosted multi-tenant cloud, or single-file offline apps that run by double-clicking with no install |

---

## The one idea

Every module reads and writes the **same five records**. That is the physical reason a single
goods receipt can touch stock, the books, quality and sourcing at the same instant.

\`\`\`
                    ┌─────────────────────────────────┐
                    │        UNIFIED DATA CORE        │
                    │  Item/SKU · Party · Stock ·     │
                    │  Ledger/Voucher · Order         │
                    └─────────────────────────────────┘
                                   ▲ ▼
        every one of the ${NAPP} apps reads and writes these, and only these
\`\`\`

**Accepted — not ordered — is what counts.** You order 100 metres. 100 arrive. Quality accepts 96.
Most systems increase stock by 100 and claim tax credit on 100. Medhava increases stock by **96**,
claims input tax credit on **96**, raises a debit note for the 4 rejected, and lowers that mill's
accept rate — automatically.

**Nothing derived is ever stored.** Outstanding, risk, performance, ageing, promise dates and
profit-per-design are all recomputed on read. They cannot drift out of step with the documents
underneath them.

---

## Every module and every app

${MODULES.map(m => {
  const head = m.spine
    ? `### Platform — the spine under all ${NMOD}`
    : `### Module ${m.n} · ${m.name}`;
  const apps = m.apps.map(a => {
    const b = built(a[0]);
    return `| ${b ? '**' + a[0] + '**' : a[0]} | ${a[2]} | ${b ? '✅ built · ' + tests(a[0]) + ' self-tests' : 'roadmap'} |`;
  }).join('\n');
  return `${head}
*${m.tag}.*

${m.intro}

**Reads from:** ${m.reads.join(' · ')}
**Writes to:** ${m.writes.join(' · ')}

| App | What it does | Status |
|---|---|---|
${apps}`;
}).join('\n\n---\n\n')}

---

## The rules that hold everywhere

1. **No app depends on any single outside company.** Every capability — books, marketplaces,
   AI writing, automation, couriers, payments, messaging, storage, GST, printing, barcode — is a
   capability with many interchangeable providers. Each one has a built-in or by-hand option, so
   the app works fully with **nothing connected at all**. Four self-tests check this at every launch.
2. **The books are Medhava's own.** No accounting package is required, ever. Tally, BUSY, Marg,
   Zoho and QuickBooks are options for people already running one — nothing assumes them and no
   figure is ever sourced from one.
3. **Nothing asks for an account password.** Outside services connect with a scoped, revocable
   key. *Medhava will never ask you for a marketplace, bank or account password. If any screen
   ever does, it is not Medhava.*
4. **Every figure is derived, never stored.**
5. **Gates, not warnings.** Each app refuses one thing outright, because a warning gets clicked
   through on a busy afternoon. Every gate is also a self-test.
6. **It is not trained. It is built.** No model learns from your data. Every rule is written down,
   visible on the Wiring screen, and checked by a self-test — so it is correct on day one.
7. **You can reach it from anywhere, but it cannot be reached into.** Ask & Print takes a plain
   line from your phone. The office reaches out; the internet never reaches in.

---

## How it is verified

Nothing ships on the basis that it looked right on screen.

1. **The arithmetic, with no screen involved.** Each engine runs in isolation and its self-tests
   execute against the seeded data.
2. **Every screen and every control, in a real browser.** Each build opens in headless Chromium;
   every screen is visited and every interactive control on it is clicked. Any console error fails
   the build.
3. **The real job, with the result asserted.** Not "does the button click" but "did the thing
   happen". A control that looks alive but changes nothing fails the build.
4. **A structural audit.** \`node suite/deep/audit.js\` checks that every "comes from" on every
   Wiring screen names a module that actually exists, that no vendor name is ever the source of a
   figure, that no text is double-escaped, and that the app count in every file matches this one.

---

*Medhava · One business. One brain. · ${NMOD} modules · ${NAPP} apps · one shared data core*
`;

fs.writeFileSync(path.join(D, 'INDEX.md'), md);

/* llms.txt — the same facts, compressed for a machine reader. It used to be typed by hand and
   drifted into saying two different app counts on two different lines. Now the module list and
   every count come from modules.js, so it cannot disagree with the site. */
const llms = `# Medhava

> Medhava is a unified ERP: ${NMOD} modules and ${NAPP} apps that share one data core and one event bus.
> Tagline: One business. One brain.

## What Medhava is
A single application — not a suite of integrated applications. All ${NAPP} apps read and write the same
five core entities: Item/SKU, Party, Stock, Ledger/Voucher, Order. Because the data is shared, one
action (for example a goods receipt) simultaneously updates stock, the general ledger, quality
records and the vendor scorecard. There is no synchronisation step and no duplicate master data.

## Key facts
- Modules: ${NMOD}. Apps: ${NAPP}. Data cores: 1.
- Accounting: double-entry with CGST/SGST/IGST, TDS, TCS, GSTR-1 and GSTR-3B. Medhava keeps the
  books itself; no outside accounting package is required at any point.
- Input tax credit is computed on ACCEPTED quantity only, never ordered quantity.
- Stock: one number per SKU per location per stage, pushed to every sales channel.
- Marketplaces: Amazon, Flipkart, Myntra, Meesho, Ajio, Nykaa, JioMart, Shopify, WooCommerce.
- No lock-in: every capability (books, marketplaces, AI, automation, couriers, payments, messaging,
  storage, GST, printing, barcode) is a capability with many interchangeable providers, each with a
  built-in or by-hand option, so the software is complete with nothing connected.
- Security: row-level security per company; integrations use revocable scoped API keys.
  Medhava never requests or stores account passwords.
- Deployment: hosted multi-tenant cloud, plus single-file HTML apps that run offline by double-click.
- Origin: built in India for Indian compliance; industry-neutral configuration available.

## The ${NMOD} modules
${MODULES.map((m, i) => `${i + 1}. ${m.name} (${m.apps.length}) — ${m.apps.map(a => a[0]).join(', ')}`).join('\n')}

## Distinctive capabilities
- Three-way match: a supplier bill passes only when purchase order, goods receipt and invoice agree
  on price and quantity; mismatches are held with a plain-language reason.
- Vendor risk model: blends weak performance (max 50), spend concentration (max 30) and overdue
  bills (max 20). A supplier at 99% performance can still be medium-risk if 44% of spend sits there.
- Settlement reconciliation: marketplace payouts matched to order lines, exposing commission, TCS,
  weight discrepancies and short payments, with a claim pack.
- Manual data check: the order and return sheets already downloaded from the seller panels are read
  straight from Excel or a ZIP of Excels and turned into ten cross-checks, every figure clickable
  down to the transactions behind it.
- Karigar piece-rate manufacturing: pooled set completion, per-garment rates, advances, and true
  cost-per-piece per design.
- Ask & Print: a plain message from a phone returns a ledger, a bill or the day's packing slips, or
  prints them at the office. The office dials out; the internet never reaches in. Nothing that moves
  money can be asked for by message, by anybody.

## How Medhava differs from Zoho and Odoo
Zoho and Odoo are suites of separate applications connected by integrations. Medhava is one
application with ${NMOD} modules over one data core, so master data is never duplicated and cross-module
updates are immediate rather than scheduled.

## Pricing
Starter ₹0 (1 user, 1 company, 1 channel). Growth ₹7,499/month billed annually (15 users, 3
companies, all channels). Enterprise ₹24,999/month billed annually (unlimited users, manufacturing,
group consolidation, SSO). All plans include all ${NMOD} modules.

## Contact
hello@medhava.com · https://medhava.com/
`;
fs.writeFileSync(path.join(D, 'llms.txt'), llms);

console.log('INDEX.md + llms.txt written:', Math.round(md.length / 1024) + 'KB ·', NMOD, 'modules ·', NAPP, 'apps ·', doneApps, 'built');
