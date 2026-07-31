# Medhava — One business. One brain.

**A unified ERP: 16 modules and 41 apps over one shared data core.**

This file is the whole website in plain text — every module, every app, and what each one
reads and writes. It is generated from `modules.js`, the same file the website and every
PDF read, so nothing here can disagree with them.

| | |
|---|---|
| **Modules** | 16 business modules, plus the Platform spine underneath all of them |
| **Apps** | 41 |
| **Built and shipping** | 13 |
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

```
                    ┌─────────────────────────────────┐
                    │        UNIFIED DATA CORE        │
                    │  Item/SKU · Party · Stock ·     │
                    │  Ledger/Voucher · Order         │
                    └─────────────────────────────────┘
                                   ▲ ▼
        every one of the 41 apps reads and writes these, and only these
```

**Accepted — not ordered — is what counts.** You order 100 metres. 100 arrive. Quality accepts 96.
Most systems increase stock by 100 and claim tax credit on 100. Medhava increases stock by **96**,
claims input tax credit on **96**, raises a debit note for the 4 rejected, and lowers that mill's
accept rate — automatically.

**Nothing derived is ever stored.** Outstanding, risk, performance, ageing, promise dates and
profit-per-design are all recomputed on read. They cannot drift out of step with the documents
underneath them.

---

## Every module and every app

### Module 01 · Dashboard & BI
*See the whole business without asking anyone.*

Every number in Medhava rolls up here as work happens — no exports, no waiting for month-end, no asking three people for their sheet.

**Reads from:** Every module
**Writes to:** —

| App | What it does | Status |
|---|---|---|
| **CEO Dashboard** | Cash, sales, stock, profit and alerts on one screen, refreshed as work happens. | ✅ built · 23 self-tests |
| **Report Builder** | Drag the fields you want into a report and save it for the whole team. | ✅ built · 34 self-tests |

---

### Module 02 · CRM
*Know every customer completely.*

One record per customer carrying every lead, order, return and conversation — whichever channel it came from.

**Reads from:** Sales · OMS · Marketing
**Writes to:** Sales · Marketing

| App | What it does | Status |
|---|---|---|
| **CRM & Customer 360** | Lead to won, then the full lifetime: orders, returns, value and what to offer next. | ✅ built · 38 self-tests |

---

### Module 03 · Sales
*Every way you sell, one order book.*

Retail counter, wholesale, export and your own website all write to the same order and draw on the same stock number.

**Reads from:** Inventory · CRM · Catalog
**Writes to:** Inventory · Accounting · Logistics

| App | What it does | Status |
|---|---|---|
| **D2C Sales** | Orders from your own storefront, cart to dispatch, with loyalty and partial COD. | ✅ built · 35 self-tests |
| **B2B & Credit** | Wholesale orders with credit limits, tier pricing and outstanding ageing. | ✅ built · 35 self-tests |
| **Export** | Commercial invoice, packing list, LUT bond and IGST-refund tracking. | ✅ built · 34 self-tests |
| **POS** | Counter billing that draws on the same stock as your website. | ✅ built · 33 self-tests |
| **Quotes & Proforma** | Send a quote, convert it to a confirmed order in one click. | ✅ built · 34 self-tests |

---

### Module 04 · E-commerce / OMS
*Seven marketplaces, one queue.*

Stop logging into seven seller panels. Every marketplace order lands in one pipeline, and your stock goes out to all of them.

**Reads from:** Inventory · Catalog · CRM
**Writes to:** Inventory · Accounting · Settlement · Logistics

| App | What it does | Status |
|---|---|---|
| **Marketplace OMS** | Amazon, Flipkart, Myntra, Meesho, Ajio, Nykaa and JioMart in a single order queue. | ✅ built · 51 self-tests |
| **Order Management** | One pipeline from new to delivered, whatever channel it arrived on. | ✅ built · 55 self-tests |

---

### Module 05 · Warehouse
*Pick right the first time.*

Bin-level instructions and barcode scanning, so the right piece leaves the building and stock stays honest.

**Reads from:** Orders · Inventory
**Writes to:** Inventory · Logistics

| App | What it does | Status |
|---|---|---|
| Picking & Bins | Pick lists that tell staff exactly which bin to walk to, in walking order. | roadmap |
| Barcode Operations | Scan to pick, pack, dispatch and run a physical stock count from a phone. | roadmap |

---

### Module 06 · Logistics
*Ship, track, and stop RTO losses.*

One-click labels across couriers, live tracking, COD remittance, and a workflow that rescues failed deliveries before they turn into returns.

**Reads from:** Orders
**Writes to:** Accounting · Settlement

| App | What it does | Status |
|---|---|---|
| Couriers & AWB | Compare couriers, print labels, track shipments and reconcile COD remittance. | roadmap |

---

### Module 07 · Inventory & Catalog
*One number everyone trusts.*

The most important number in the system: one quantity per SKU, per location, per stage — read and written by every other module. And one product record that every channel lists from.

**Reads from:** Every module
**Writes to:** Every module

| App | What it does | Status |
|---|---|---|
| Stock | Live quantity by SKU, location and stage, with reorder alerts, batches, kits and dead-stock. | roadmap |
| Catalog / PIM | One product record — attributes, images, pricing and HSN — scored for channel readiness before it lists. | roadmap |

---

### Module 08 · Manufacturing
*Know what a piece really costs.*

From cut plan to finished piece — including what every artisan earned and what every design actually cost to make.

**Reads from:** Sales · Materials
**Writes to:** Inventory · HR · Accounting

| App | What it does | Status |
|---|---|---|
| Production Orders | Ten stages from cutting to finishing, with work-in-progress visible at each. | roadmap |
| Karigar & Piece-rate | Pooled set completion, per-garment rates, alterations and advances into one payout. | roadmap |
| BOM & Consumption | What each design consumes, costed at today’s material rates. | roadmap |
| Quality Control | Accept, reject or rework — with reasons that feed the supplier scorecard. | roadmap |

---

### Module 09 · Purchase
*Nothing over-billed gets paid.*

The buy side end to end — and the control that stops you paying for goods you rejected.

**Reads from:** Inventory · Manufacturing
**Writes to:** Inventory · Accounting · Quality

| App | What it does | Status |
|---|---|---|
| **Procurement** | RFQ to purchase order to goods receipt, with a strict three-way match before any bill is paid. | ✅ built · 23 self-tests |
| **Vendor Management** | Vendor 360, payables, ageing, a real risk score, and sourcing that follows performance. | ✅ built · 23 self-tests |

---

### Module 10 · HR & Payroll
*Pay people right, on time.*

Staff salaries and artisan piece-rate earnings in one register, with attendance driving both.

**Reads from:** Manufacturing
**Writes to:** Accounting

| App | What it does | Status |
|---|---|---|
| Staff & Karigar | Attendance, effective-dated salary and artisan earnings in a single register. | roadmap |
| Time-off & Advances | Leave, festival advances, and exactly how they change this month’s payout. | roadmap |
| Appraisal & Hiring | Performance reviews and a hiring pipeline that ends in an employee record. | roadmap |

---

### Module 11 · Accounting & GST
*Books that always balance.*

A full double-entry ledger built for Indian compliance — not a tax report bolted onto a spreadsheet.

**Reads from:** Every module
**Writes to:** Finance Reports

| App | What it does | Status |
|---|---|---|
| Accounting | Double-entry books where every voucher balances and the trial balance always ties. | roadmap |
| Invoicing | GST tax invoices and receipts, totals computed from the lines to the paise. | roadmap |
| Expenses | Spend captured by category with approvals, and bill OCR to save typing. | roadmap |
| GST & Tax | CGST, SGST, IGST, TDS, TCS, input credit, GSTR-1 and GSTR-3B. | roadmap |
| Finance Reports | P&L, balance sheet, and profit by channel, design and SKU. | roadmap |

---

### Module 12 · Settlement
*Get paid what you are owed.*

Marketplaces deduct commission, TCS, weight charges and penalties. This module finds every rupee they kept by mistake.

**Reads from:** OMS · Accounting
**Writes to:** Accounting

| App | What it does | Status |
|---|---|---|
| Reconciliation | Match every marketplace payout to the order that earned it, and expose the gap. | roadmap |
| Claims & Disputes | Turn shortfalls, weight disputes and lost parcels into filed claims with evidence. | roadmap |
| Returns / RMA | Customer, courier and wrong returns — and the dead stock they actually cost you. | roadmap |

---

### Module 13 · Marketing
*Sell more without discounting.*

Plan content, run campaigns, and let rules keep your prices competitive while protecting margin.

**Reads from:** Catalog · CRM
**Writes to:** Sales · OMS

| App | What it does | Status |
|---|---|---|
| Social Calendar | Plan and publish across every channel from one calendar. | roadmap |
| Campaigns | Email, SMS and WhatsApp campaigns measured on real revenue, not opens. | roadmap |
| Repricing Engine | Rules per channel and SKU — floor, ceiling, match-lowest, festival overrides. | roadmap |
| Automation | If this happens, do that — across any module, without writing code. | roadmap |

---

### Module 14 · AI Content Engine
*Write once, sell everywhere.*

Listings, ads and email written from your own catalogue — so the words actually match the product.

**Reads from:** Catalog
**Writes to:** Marketing · OMS

| App | What it does | Status |
|---|---|---|
| Content Engine | Channel-ready listings, social posts, ads, blogs and email in your own voice. | roadmap |

---

### Module 15 · Image Studio
*Studio photos without a studio.*

Turn a phone photo into a channel-compliant product image, at the exact size each marketplace demands.

**Reads from:** Catalog
**Writes to:** Catalog · Marketing

| App | What it does | Status |
|---|---|---|
| Image Studio | Layers, free transform, background removal, channel presets and SEO alt text. | roadmap |

---

### Module 16 · Video Studio
*Reels from photos you already have.*

Product video and reels generated from your existing catalogue images.

**Reads from:** Catalog · Image Studio
**Writes to:** Marketing

| App | What it does | Status |
|---|---|---|
| Video Studio | Text and image to video, reels and ad cuts sized for every channel. | roadmap |

---

### Platform — the spine under all 16
*The spine every module runs on.*

Not a module you open — the layer underneath all sixteen. Who can see what, how the system is configured, and a record of everything that ever happened.

**Reads from:** Every module
**Writes to:** Every module

| App | What it does | Status |
|---|---|---|
| Identity, Settings & Audit | Users, roles and permissions, company switching, tax and numbering setup — and an immutable record of everything that ever happened. | roadmap |
| **Ask & Print** | Ask from your phone, anywhere: a ledger, a bill, today’s packing slips. It comes back as a PDF — or prints on the office printer, with nothing plugged into your phone. | ✅ built · 50 self-tests |

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
4. **A structural audit.** `node suite/deep/audit.js` checks that every "comes from" on every
   Wiring screen names a module that actually exists, that no vendor name is ever the source of a
   figure, that no text is double-escaped, and that the app count in every file matches this one.

---

*Medhava · One business. One brain. · 16 modules · 41 apps · one shared data core*
