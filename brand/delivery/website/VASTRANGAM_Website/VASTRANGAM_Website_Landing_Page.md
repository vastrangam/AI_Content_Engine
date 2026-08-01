# Vastrangam — One business. One brain.

**A unified ERP: 15 modules and 63 apps over one shared data core.**

> **The Vastrangam edition.** The same engine, the same 15 modules and the same 63 apps as the Medhava edition — described in this trade’s own words. Only the wording and the master data differ; the code does not.


This file is the whole website in plain text — every module, every app, and what each one
reads and writes. It is generated from `modules.js`, the same file the website and every
PDF read, so nothing here can disagree with them.

| | |
|---|---|
| **Modules** | 15 business modules, plus the Platform spine underneath all of them |
| **Apps** | 63 |
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
        every one of the 63 apps reads and writes these, and only these
```

**Accepted — not ordered — is what counts.** You order 100 units. 100 arrive. Quality accepts 96.
Most systems increase stock by 100 and claim tax credit on 100. Medhava increases stock by **96**,
claims input tax credit on **96**, raises a debit note for the 4 rejected, and lowers that
supplier's accept rate — automatically.

**Nothing derived is ever stored.** Outstanding, risk, performance, ageing, promise dates and
profit per product are all recomputed on read. They cannot drift out of step with the documents
underneath them.

---

## Every module and every app

### Module 01 · Dashboard & BI
*See the whole house without asking anyone.*

Every number rolls up here as work happens — the day’s marketplace orders, what the karigars finished, what is still lying at the dyer, what the mills are owed. No exports, no waiting for month-end.

**Reads from:** Every module
**Writes to:** —

| App | What it does | Status |
|---|---|---|
| **CEO Dashboard** | Cash, sales by channel, stock by design, profit per piece and the alerts that matter — one screen, refreshed as the day runs. | ✅ built · 23 self-tests |
| **Report Builder** | Drag the fields you want into a report and save it for the whole team. | ✅ built · 34 self-tests |
| Group Consolidation | Vastrangam and the ethnic-wear arm as one set of figures, inter-company transfers removed, so the group position is real rather than two spreadsheets added together. | roadmap |

---

### Module 02 · CRM
*Know every boutique, chain and customer completely.*

One record per party — a Kalamandir or a Rajmandir, a Surat walk-in or a Myntra buyer — carrying every enquiry, order, return, agreement and conversation, whichever channel it arrived on.

**Reads from:** Every module
**Writes to:** Sales · E-commerce / OMS · Marketing

| App | What it does | Status |
|---|---|---|
| **CRM & Customer 360** | Enquiry to confirmed order, then the full lifetime: what they bought, what came back, what they are worth and which new range to show them first. | ✅ built · 38 self-tests |
| Documents & eSign | Mill agreements, job-work contracts, signed delivery challans, export documents and boutique credit terms filed against the party or order they belong to — found by that record, not by hunting through a folder. | roadmap |
| Helpdesk & Live Chat | A boutique asking where its parcel is, or a customer asking about a size — the question becomes a ticket tied to the order, with the whole history already open. | roadmap |

---

### Module 03 · Sales
*Counter, wholesale, website and export — one order book.*

The Surat counter, the boutique wholesale book, the website and the export shipment all write to the same order and draw on the same stock number. And the parcel is followed to the door, because a sale is not done until the COD money is in.

**Reads from:** Inventory & Catalog · CRM · Warehouse · Logistics
**Writes to:** Inventory & Catalog · Accounting & GST · Warehouse · Logistics

| App | What it does | Status |
|---|---|---|
| **D2C Sales** | Orders from your own storefront, cart to dispatch, with loyalty and partial COD on a ₹4,400 anarkali. | ✅ built · 35 self-tests |
| **B2B & Credit** | Boutique and chain orders on credit limits and tier pricing, with outstanding aged against each party’s own agreed terms. | ✅ built · 35 self-tests |
| **Export** | Commercial invoice, packing list, LUT bond and IGST-refund tracking for the Gulf and UK buyers. | ✅ built · 34 self-tests |
| **POS** | Counter billing at Udhna that draws on the same stock as the website — no second stock register. | ✅ built · 33 self-tests |
| **Quotes & Proforma** | Send a quote, convert it to a confirmed order in one click. | ✅ built · 34 self-tests |
| Couriers & AWB | Book the parcel on the order, compare couriers for that pin code, print the label with the design code on it, and follow the AWB to the door. | roadmap |

---

### Module 04 · E-commerce / OMS
*Seven panels, one queue — and every rupee accounted for.*

Stop logging into Myntra, then Flipkart, then Ajio. Every marketplace order lands in one pipeline and your stock goes out to all of them — then the money side closes out in the same module: what the panel paid, what it kept as commission, what came back, and what it still owes you.

**Reads from:** Inventory & Catalog · CRM · Sales · Accounting & GST · Logistics · Settlement
**Writes to:** Inventory & Catalog · Accounting & GST · Warehouse · Logistics · Settlement

| App | What it does | Status |
|---|---|---|
| **Marketplace OMS** | Myntra, Flipkart, Ajio, Amazon, Meesho, Nykaa and JioMart in a single queue — processed all together, or channel-wise, or design-wise, whichever way you want to pick and pack today. | ✅ built · 51 self-tests |
| **Order Management** | One pipeline from new to delivered, whether the order came from a seller panel, your Shopify or WooCommerce site, a dealer or the counter. | ✅ built · 55 self-tests |
| Manual Data Check | The order and return sheets you already download from the panels, and the offline registers from the three shops — one file or a whole ZIP — read back as ten cross-checks: net sale after commission and fees, month, design, state, wrong returns, SPF claims, ads, payouts and GST. Every figure clicks through to the transactions behind it. | roadmap |
| Reconciliation | Match every marketplace payout to the order line that earned it, and expose the gap. | roadmap |
| Claims & Disputes | Weight disputes, SPF shortfalls, parcels lost in transit and returns that came back with a different piece inside — filed as claims with the packing footage attached. | roadmap |
| Returns / RMA | Customer returns, courier returns and wrong returns kept apart — because only one of the three is really your fault, and only one of them turns into dead stock. | roadmap |
| Channels & Storefronts | Connect a channel once and it stays in step: catalogue out, price out, stock out, orders in. Seven marketplaces and any website platform — Shopify, WooCommerce, Magento, BigCommerce, Wix or a custom site over its own API — each switchable without touching your data. | roadmap |

---

### Module 05 · Warehouse
*Pick the right design first time — and prove what you sent.*

Bin-level instructions and barcode scanning so the right piece leaves the godown and stock stays honest — and a recording of each parcel being packed, because a wrong-return claim is settled by footage, not by argument.

**Reads from:** Sales · E-commerce / OMS · Inventory & Catalog
**Writes to:** Inventory & Catalog · Sales · E-commerce / OMS

| App | What it does | Status |
|---|---|---|
| Picking & Bins | Pick lists in walking order through the godown, by design and size, so nobody crosses the floor twice. | roadmap |
| Barcode Operations | Scan to pick, pack, dispatch and run a physical stock count from a phone — the same scan whether the order came from a marketplace, your Shopify site or the counter. | roadmap |
| Packing Video | Every parcel filmed as it is packed and indexed by its order number, so when a panel says the wrong piece was sent, the clip goes into the claim. | roadmap |

---

### Module 06 · Logistics
*The courier network — rates, failed deliveries and the COD money.*

Booking one parcel happens on the order. This module is the network behind it: what Delhivery, Blue Dart and the rest charge to that pin code before you pick one, what happens to a delivery that fails in a small town, and whether the cash collected at the door reached your bank.

**Reads from:** Sales · E-commerce / OMS · Warehouse
**Writes to:** Accounting & GST · Sales · E-commerce / OMS

| App | What it does | Status |
|---|---|---|
| Rates & Zones | Every courier’s rate card by zone, weight slab and service — so the cheapest and the fastest option for this parcel are both known before it is booked. | roadmap |
| NDR & RTO Rescue | A failed delivery worked while it can still be saved — reattempt, call, correct the address — before it becomes a return you pay for twice. | roadmap |
| COD Remittance | What the courier collected at the door against what reached the Surat account, parcel by parcel, with every shortfall named and aged. | roadmap |

---

### Module 07 · Inventory & Catalog
*One stock number everyone trusts.*

The most important number in the house: one quantity per design and size, per godown, per stage — greige, dyed, in stitching, finished, listed. Read and written by every other module. And one product record every marketplace lists from.

**Reads from:** Every module
**Writes to:** Every module

| App | What it does | Status |
|---|---|---|
| Stock | Live quantity by design, size and location, fabric in metres and pieces in numbers, with reorder alerts, lot tracking, set kits and dead-stock ageing. | roadmap |
| Catalog / PIM | One record per design — fabric, work, length, colour, size chart, images, HSN and price — scored for Myntra and Amazon readiness before it is listed anywhere. | roadmap |

---

### Module 08 · Manufacturing
*Know what a piece really costs to make.*

From the cut plan to the finished piece — what each karigar earned, what the dyer charged, what the zari cost, and what that design actually cost before you priced it.

**Reads from:** Sales · Purchase · Inventory & Catalog
**Writes to:** Inventory & Catalog · HR & Payroll · Accounting & GST

| App | What it does | Status |
|---|---|---|
| PLM & Development | Concept to a design that can actually be made: fabric and trim specification, sample rounds with the mill, costed trials against a target price, and sign-off — every version kept, so last season’s costing is still there. | roadmap |
| Production Orders | Cutting, stitching, embroidery, washing, finishing and checking — your own stages, with work-in-progress visible at each and nothing lost at the dyer. | roadmap |
| Piece-rate & Contractors | Karigars paid by the piece: pooled set completion, per-garment rates, alterations, rework and advances resolved into one payout. | roadmap |
| BOM & Consumption | What each design consumes — metres of fabric, zari, lining, buttons, packing — costed at today’s mill rates. | roadmap |
| Quality Control | Accept, reject or send for rework, with reasons that feed the mill’s accept rate and the karigar’s record. | roadmap |
| Maintenance | Machines and the building: what is due for service, when it was last done, what it cost, and what stopped while it was down. | roadmap |

---

### Module 09 · Purchase
*Nothing over-billed by a mill gets paid.*

The buy side end to end — mills, dyers, job workers and packing suppliers — with the control that stops you paying for metres you rejected.

**Reads from:** Inventory & Catalog · Manufacturing
**Writes to:** Inventory & Catalog · Accounting & GST · Quality Control

| App | What it does | Status |
|---|---|---|
| **Procurement** | Enquiry to purchase order to goods receipt, with a strict three-way match: you ordered 100 metres, 100 arrived, quality accepted 96, and the bill is only cleared for 96. | ✅ built · 23 self-tests |
| **Vendor Management** | Mill 360 — payables, ageing, a real risk score from accept rate and spend concentration, and sourcing that follows performance rather than habit. | ✅ built · 23 self-tests |

---

### Module 10 · HR & Payroll
*Pay everyone right, on time.*

Office staff on a monthly salary and karigars paid by the piece, in one register, with attendance driving both and the festival advance already deducted.

**Reads from:** Manufacturing
**Writes to:** Accounting & GST

| App | What it does | Status |
|---|---|---|
| Staff & Contractors | Attendance marked by tap, effective-dated salary, and karigar piece-rate earnings in a single register. | roadmap |
| Time-off & Advances | Leave, Diwali advances, and exactly how they change this month’s payout before you approve it. | roadmap |
| Appraisal & Hiring | Performance reviews and a hiring pipeline that ends in an employee record. | roadmap |

---

### Module 11 · Accounting & GST
*Books that always balance — and no BUSY needed.*

A full double-entry ledger built for Indian compliance, keeping the books itself. B2B sales, returns, mill purchases, payments and receipts are entered by hand because a person decides them; every website, marketplace and counter sale posts itself.

**Reads from:** Every module
**Writes to:** Finance Reports

| App | What it does | Status |
|---|---|---|
| Accounting | Double-entry books where every voucher balances and the trial balance always ties. | roadmap |
| Invoicing | GST tax invoices and receipts, totals computed from the lines to the paise. | roadmap |
| Expenses | Spend captured by category with approvals, and bill OCR to save typing. | roadmap |
| GST & Tax | CGST, SGST, IGST, TDS, TCS, input credit, GSTR-1 and GSTR-3B. | roadmap |
| Finance Reports | P&L, balance sheet, and profit by channel, design and SKU — so you know which anarkali actually earned money after commission, shipping and returns. | roadmap |

---

### Module 12 · Settlement
*Get paid what the panels owe you — cycle by cycle.*

Matching one payout to one order line happens in OMS. This is the level above: the settlement cycle each panel runs, the commission it actually charged against the rate card it published, and the TCS it deducted in your name.

**Reads from:** E-commerce / OMS · Accounting & GST
**Writes to:** Accounting & GST

| App | What it does | Status |
|---|---|---|
| Payout Cycles | Every settlement cycle each panel runs — what it should pay, what actually landed in the bank, and on which day — so a late payout is visible the day it is late, not at month end. | roadmap |
| Fee & Commission Audit | The commission Myntra publishes for a category against the commission it actually took, style by style. A quiet rate change is caught the first time it is applied, not at year end. | roadmap |
| TCS & TDS Register | Every rupee the panels deducted as TCS, and TDS on job work, matched against the portal’s own figures — so the credit you claim is the credit you are owed. | roadmap |

---

### Module 13 · Marketing
*Sell more without cutting the price.*

Plan the festive calendar, run the campaigns, and let rules keep you competitive on the panels without giving the margin away.

**Reads from:** Inventory & Catalog · CRM
**Writes to:** Sales · E-commerce / OMS

| App | What it does | Status |
|---|---|---|
| Social Calendar | Plan and publish across every channel from one calendar. | roadmap |
| Campaigns | Email, SMS and WhatsApp campaigns measured on real revenue, not opens. | roadmap |
| Repricing Engine | Rules per panel and per design — floor, ceiling, match-lowest and a festive override — so a Diwali sale does not quietly go below cost. | roadmap |
| Automation | If this happens, do that — across any module, without writing code. | roadmap |
| Blog & Pages | How to drape it, what to wear it to, which fabric for which season — written, scheduled and published to your own site with the meta and internal links already set. | roadmap |

---

### Module 14 · AI Content Engine
*Write it, shoot it, cut it — from your own catalogue.*

Listings, ads, reels and product photography generated from your own designs, in a voice that sounds like one person from Surat rather than a template — so the words match the piece and the picture is the size Myntra actually wants.

**Reads from:** Inventory & Catalog
**Writes to:** Marketing · E-commerce / OMS

| App | What it does | Status |
|---|---|---|
| Content Engine | Fourteen stages in your own voice — buyer psychology, competitor reading, hooks, the product description, marketplace copy for Amazon and Myntra, ad variations, reel scripts, song lyrics for the reel, the calendar, size chart and alt text. | roadmap |
| Image Studio | A phone photo becomes a listing image: layers, free transform, background removal, Myntra 1080×1440 and every other channel preset, watermark and SEO alt text. | roadmap |
| Video Studio | Text and image to video, reels and ad cuts sized for every channel. | roadmap |
| Design Studio | Banners, festive creatives and thumbnails — templates, layers, undo and redo, any colour, exact sizing and stock elements, exporting PNG, JPG or PDF at whatever size the panel or the printer asks for. | roadmap |
| Publisher | One push sends the listing, images and copy to the website and every panel, and reports back what went live and what a panel rejected, with the reason. | roadmap |

---

### Module 15 · Projects & Collaboration
*The work that is not an order — and the talking around it.*

An exhibition in Hyderabad, a boutique’s custom order, a new godown fit-out, a legal matter with a supplier. Work that is not a sales order still has a deadline, a cost and documents — and it belongs on the same records as everything else.

**Reads from:** CRM · Sales · HR & Payroll · Inventory & Catalog
**Writes to:** Accounting & GST · HR & Payroll · CRM

| App | What it does | Status |
|---|---|---|
| Projects & Cases | An exhibition, a custom order for a chain, a fit-out or a dispute — stages you define, owners, deadlines, documents, hours and real cost, all on one record the ledger can see. | roadmap |
| Timesheets & Planning | Who is on what this week and the hours that actually went in — against a project, an exhibition or a machine — with billable and non-billable kept apart. | roadmap |
| Approvals | One queue for everything waiting on a yes: a mill purchase order, a boutique discount, a leave day, a credit note, a payment. The rule that sent it there is next to it, and the decision goes on the record. | roadmap |
| Forum | Questions and answers that outlive a chat — for customers, dealers or staff — with the useful ones kept where the next person will actually find them. | roadmap |
| Discuss | The conversation attached to the record it is about — this order, this mill bill, this dispute — so a year later the reason for the decision is still sitting beside it. | roadmap |

---

### Platform — the spine under all 15
*The spine the whole house runs on.*

Not a module you open — the layer underneath all 15. Who can see what, how Vastrangam is configured, and a record of everything that ever happened.

**Reads from:** Every module
**Writes to:** Every module

| App | What it does | Status |
|---|---|---|
| Identity, Settings & Audit | Users, roles and permissions, company switching, tax and numbering setup — and an immutable record of everything that ever happened. | roadmap |
| **Ask & Print** | At an exhibition in Hyderabad, send one line from your phone: “ledger Kalamandir”, “print slips”. It comes back as a PDF, or it prints at the Surat office — with nothing plugged into your phone and nothing at the office open to the internet. | ✅ built · 50 self-tests |

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

*Medhava · One business. One brain. · 15 modules · 63 apps · one shared data core*
