# Medhava — One business. One brain.

**A unified ERP: 15 modules and 62 apps over one shared data core.**

This file is the whole website in plain text — every module, every app, and what each one
reads and writes. It is generated from `modules.js`, the same file the website and every
PDF read, so nothing here can disagree with them.

| | |
|---|---|
| **Modules** | 15 business modules, plus the Platform spine underneath all of them |
| **Apps** | 62 |
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
        every one of the 62 apps reads and writes these, and only these
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
| Group Consolidation | Several companies, one set of figures — sales, cash, stock and profit rolled up across every company you run, inter-company entries removed, with years of history to compare against. | roadmap |

---

### Module 02 · CRM
*Know every customer completely — and answer them fast.*

One record per customer carrying every lead, order, return, document and conversation, whichever channel it came from. Whoever picks up the next question can already see everything that came before it.

**Reads from:** Every module
**Writes to:** Sales · E-commerce / OMS · Marketing

| App | What it does | Status |
|---|---|---|
| **CRM & Customer 360** | Lead to won, then the full lifetime: orders, returns, value and what to offer next. | ✅ built · 38 self-tests |
| Documents & eSign | Every agreement, receipt, certificate and scan filed against the record it belongs to — an order, a party, a case, an employee — so it is found by that record instead of by remembering a folder. Send one out for signature and the signed copy files itself back. | roadmap |
| Helpdesk & Live Chat | Questions arriving by chat, email or phone become tickets tied to the order or the account they are about, with the whole history already on the screen. | roadmap |

---

### Module 03 · Sales
*Every way you sell, one order book — to the doorstep.*

Retail counter, wholesale, export and your own website all write to the same order and draw on the same stock number. The courier side lives here too, so a sale is not finished when it is billed — it is finished when it is delivered and the COD money is in.

**Reads from:** Inventory & Catalog · CRM · Warehouse · Logistics
**Writes to:** Inventory & Catalog · Accounting & GST · Warehouse · Logistics

| App | What it does | Status |
|---|---|---|
| **D2C Sales** | Orders from your own storefront, cart to dispatch, with loyalty and partial COD. | ✅ built · 35 self-tests |
| **B2B & Credit** | Wholesale orders with credit limits, tier pricing and outstanding ageing. | ✅ built · 35 self-tests |
| **Export** | Commercial invoice, packing list, LUT bond and IGST-refund tracking. | ✅ built · 34 self-tests |
| **POS** | Counter billing that draws on the same stock as your website. | ✅ built · 33 self-tests |
| **Quotes & Proforma** | Send a quote, convert it to a confirmed order in one click. | ✅ built · 34 self-tests |
| Couriers & AWB | Book the shipment on the order itself, compare couriers, print the label and follow the AWB to the door. | roadmap |

---

### Module 04 · E-commerce / OMS
*Seven marketplaces, one queue — and every rupee accounted for.*

Stop logging into seven seller panels. Every marketplace order lands in one pipeline and your stock goes out to all of them — then the money side is closed out in the same module: what the panel paid, what it kept, what came back, and what you are still owed.

**Reads from:** Inventory & Catalog · CRM · Sales · Accounting & GST · Logistics · Settlement
**Writes to:** Inventory & Catalog · Accounting & GST · Warehouse · Logistics · Settlement

| App | What it does | Status |
|---|---|---|
| **Marketplace OMS** | Amazon, Flipkart, Myntra, Meesho, Ajio, Nykaa and JioMart in a single order queue. | ✅ built · 51 self-tests |
| **Order Management** | One pipeline from new to delivered, whatever channel it arrived on. | ✅ built · 55 self-tests |
| Manual Data Check | Upload the sheets you already download — marketplace orders and returns, and your own counter-shop registers, one file or a whole ZIP — and read ten cross-checks back: money, month, item, state, returns, claims, ads, payouts and GST. Every figure is clickable down to the transactions behind it, and the whole result downloads as Excel. | roadmap |
| Reconciliation | Match every marketplace payout to the order line that earned it, and expose the gap. | roadmap |
| Claims & Disputes | Turn shortfalls, weight disputes and lost parcels into filed claims with evidence. | roadmap |
| Returns / RMA | Customer, courier and wrong returns — and the dead stock they actually cost you. | roadmap |

---

### Module 05 · Warehouse
*Pick right the first time — and prove what you sent.*

Bin-level instructions and barcode scanning, so the right item leaves the building and stock stays honest — and a recording of each parcel being packed, so an argument about what was in it is settled by footage instead of by memory.

**Reads from:** Sales · E-commerce / OMS · Inventory & Catalog
**Writes to:** Inventory & Catalog · Sales · E-commerce / OMS

| App | What it does | Status |
|---|---|---|
| Picking & Bins | Pick lists that tell staff exactly which bin to walk to, in walking order. | roadmap |
| Barcode Operations | Scan to pick, pack, dispatch and run a physical stock count from a phone. | roadmap |
| Packing Video | Every parcel recorded as it is packed and indexed by its order number, so a wrong-item claim is answered with the clip. The footage attaches itself to the claim that needs it. | roadmap |

---

### Module 06 · Logistics
*The courier network itself — rates, failures and the COD money.*

Booking one parcel happens on the order, in Sales. This module is the network behind it: what every courier charges before you pick one, what happens to a delivery that fails, and whether the cash collected at the door actually reached your bank.

**Reads from:** Sales · E-commerce / OMS · Warehouse
**Writes to:** Accounting & GST · Sales · E-commerce / OMS

| App | What it does | Status |
|---|---|---|
| Rates & Zones | Every courier’s rate card by zone, weight slab and service — so the cheapest and the fastest option for this parcel are both known before it is booked. | roadmap |
| NDR & RTO Rescue | A failed delivery worked while it can still be saved — reattempt, call, correct the address — before it becomes a return you pay for twice. | roadmap |
| COD Remittance | What the courier collected at the door against what reached your bank, parcel by parcel, with every shortfall named and aged. | roadmap |

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
*Know what a unit really costs to make.*

From the first operation to the finished unit — including what every worker earned and what each product actually cost. You define the stages, the rates and the rules; nothing here is fixed to one trade.

**Reads from:** Sales · Purchase · Inventory & Catalog
**Writes to:** Inventory & Catalog · HR & Payroll · Accounting & GST

| App | What it does | Status |
|---|---|---|
| PLM & Development | First idea to something you can actually make: specification, sample rounds, costed trials and sign-off, with every version kept. A product, a machined part, a formulation or a service package all move through stages you set yourself. | roadmap |
| Production Orders | Your own stages from first operation to finished goods, with work-in-progress visible at each one. | roadmap |
| Piece-rate & Contractors | Output-based pay for anyone paid by the piece rather than the hour — pooled completion, per-unit rates, rework and advances resolved into a single payout. | roadmap |
| BOM & Consumption | What each product consumes, costed at today’s material rates. | roadmap |
| Quality Control | Accept, reject or rework — with reasons that feed the supplier scorecard. | roadmap |
| Maintenance | Machines, tools and assets: what is due for service, when it was last done, what it cost, and what stopped while it was down. Planned and breakdown work against the same asset record. | roadmap |

---

### Module 09 · Purchase
*Nothing over-billed gets paid.*

The buy side end to end — and the control that stops you paying for goods you rejected.

**Reads from:** Inventory & Catalog · Manufacturing
**Writes to:** Inventory & Catalog · Accounting & GST · Quality Control

| App | What it does | Status |
|---|---|---|
| **Procurement** | RFQ to purchase order to goods receipt, with a strict three-way match before any bill is paid. | ✅ built · 23 self-tests |
| **Vendor Management** | Vendor 360, payables, ageing, a real risk score, and sourcing that follows performance. | ✅ built · 23 self-tests |

---

### Module 10 · HR & Payroll
*Pay people right, on time.*

Salaries and output-based earnings in one register, with attendance driving both — whether people are on a monthly wage, an hourly rate or paid by what they finish.

**Reads from:** Manufacturing
**Writes to:** Accounting & GST

| App | What it does | Status |
|---|---|---|
| Staff & Contractors | Attendance, effective-dated salary and output-based earnings in a single register, whoever is on it. | roadmap |
| Time-off & Advances | Leave, festival advances, and exactly how they change this month’s payout. | roadmap |
| Appraisal & Hiring | Performance reviews and a hiring pipeline that ends in an employee record. | roadmap |

---

### Module 11 · Accounting & GST
*Books that always balance.*

A full double-entry ledger built for Indian compliance — not a tax report bolted onto a spreadsheet. Medhava keeps the books on its own: no other accounting package is required, ever.

**Reads from:** Every module
**Writes to:** Finance Reports

| App | What it does | Status |
|---|---|---|
| Accounting | Double-entry books where every voucher balances and the trial balance always ties. | roadmap |
| Invoicing | GST tax invoices and receipts, totals computed from the lines to the paise. | roadmap |
| Expenses | Spend captured by category with approvals, and bill OCR to save typing. | roadmap |
| GST & Tax | CGST, SGST, IGST, TDS, TCS, input credit, GSTR-1 and GSTR-3B. | roadmap |
| Finance Reports | P&L, balance sheet, and profit by channel, product and SKU. | roadmap |

---

### Module 12 · Settlement
*Get paid what you are owed — cycle by cycle.*

Matching one payout to one order line happens in OMS. This module is the level above it: the settlement cycles each panel runs, the fees it actually charged against the fees it published, and the tax it deducted on your behalf.

**Reads from:** E-commerce / OMS · Accounting & GST
**Writes to:** Accounting & GST

| App | What it does | Status |
|---|---|---|
| Payout Cycles | Every settlement cycle each panel runs — what it should pay, what actually landed in the bank, and on which day — so a late payout is visible the day it is late, not at month end. | roadmap |
| Fee & Commission Audit | The rate card a panel publishes against the rate it actually charged, category by category and SKU by SKU. A silent commission increase is caught the first time it is applied. | roadmap |
| TCS & TDS Register | Every rupee the panels deducted as TCS and TDS, matched against the portal’s own figures — so the credit you claim is the credit you are actually owed. | roadmap |

---

### Module 13 · Marketing
*Sell more without discounting.*

Plan content, run campaigns, and let rules keep your prices competitive while protecting margin.

**Reads from:** Inventory & Catalog · CRM
**Writes to:** Sales · E-commerce / OMS

| App | What it does | Status |
|---|---|---|
| Social Calendar | Plan and publish across every channel from one calendar. | roadmap |
| Campaigns | Email, SMS and WhatsApp campaigns measured on real revenue, not opens. | roadmap |
| Repricing Engine | Rules per channel and SKU — floor, ceiling, match-lowest, festival overrides. | roadmap |
| Automation | If this happens, do that — across any module, without writing code. | roadmap |
| Blog & Pages | Articles, landing pages and category copy written, scheduled and published to your own site, with the meta title, description and internal links set before it goes out. | roadmap |

---

### Module 14 · AI Content Engine
*Write it, shoot it, cut it — from the catalogue you already have.*

Listings, ads, email, product photography and reels, all generated from your own catalogue — so the words match the product and the picture is the right size for the channel it is going to. Words, images and video sit in one module because they are one job.

**Reads from:** Inventory & Catalog
**Writes to:** Marketing · E-commerce / OMS

| App | What it does | Status |
|---|---|---|
| Content Engine | Fourteen stages in your own voice, from buyer research and competitor reading through hooks, channel-ready listings, ads, social posts, video scripts, song lyrics, the publishing calendar and alt text — each written from your own catalogue, so the words match the thing. | roadmap |
| Image Studio | Layers, free transform, background removal, channel presets and SEO alt text — a phone photo becomes a channel-compliant product image. | roadmap |
| Video Studio | Text and image to video, reels and ad cuts sized for every channel. | roadmap |
| Design Studio | A full design surface — templates, layers, undo and redo, any colour, exact sizing, background images and stock elements — exporting PNG, JPG or PDF at whatever size the channel or the printer asks for. | roadmap |
| Publisher | One push sends the finished listing, picture and copy everywhere it has to appear — your storefront, each marketplace, each social account — and reports back what actually went live and what was rejected, with the reason. | roadmap |

---

### Module 15 · Projects & Collaboration
*The work that is not an order — and the talking around it.*

Not every business runs on orders. A law firm runs on cases, an agency on engagements, a workshop on jobs, a builder on sites. This module holds that work on the same records as everything else, so the time, the cost, the documents and the decisions attached to it end up in the books rather than in somebody’s inbox.

**Reads from:** CRM · Sales · HR & Payroll · Inventory & Catalog
**Writes to:** Accounting & GST · HR & Payroll · CRM

| App | What it does | Status |
|---|---|---|
| Projects & Cases | A project, a case file, an engagement or a job — whatever your work is called. Stages you define, owners, deadlines, documents, billable time and real cost, all on one record the ledger can see. | roadmap |
| Timesheets & Planning | Who is on what this week, and the hours that actually went in — against a project, a case, a job or a machine. Billable and non-billable separated, so a rate card turns straight into an invoice and a real cost. | roadmap |
| Approvals | One queue for everything waiting on a yes — a purchase order, a discount, a leave day, a credit note, a payment. The rule that sent it there is on the screen next to it, and the decision goes to the audit record. | roadmap |
| Forum | Questions and answers that outlive a chat — for customers, dealers or staff — with the useful ones kept where the next person will actually find them. | roadmap |
| Discuss | Conversation attached to the record it is about: this order, this bill, this case. A year later the reason for a decision is still sitting next to the decision. | roadmap |

---

### Platform — the spine under all 15
*The spine every module runs on.*

Not a module you open — the layer underneath all 15. Who can see what, how the system is configured, and a record of everything that ever happened.

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

*Medhava · One business. One brain. · 15 modules · 62 apps · one shared data core*
