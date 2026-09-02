# Vastrangam — One business. One brain.

**A unified ERP: 21 modules and 113 apps over one shared data core.**

> **The Vastrangam edition.** One industry-neutral engine, the same 21 modules and the same 113 apps — described in this trade’s own words. Only the wording and the master data differ; the code does not.


This file is the whole website in plain text — every module, every app, and what each one
reads and writes. It is generated from `modules.js`, the same file the website and every
PDF read, so nothing here can disagree with them.

| | |
|---|---|
| **Modules** | 21 business modules, plus the Platform spine underneath all of them |
| **Apps** | 113 |
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
        every one of the 113 apps reads and writes these, and only these
```

**Accepted — not ordered — is what counts.** You order 100 units. 100 arrive. Quality accepts 96.
Most systems increase stock by 100 and claim tax credit on 100. Vastrangam BOS increases stock by **96**,
claims input tax credit on **96**, raises a debit note for the 4 rejected, and lowers that
supplier's accept rate — automatically.

**Nothing derived is ever stored.** Outstanding, risk, performance, ageing, promise dates and
profit per product are all recomputed on read. They cannot drift out of step with the documents
underneath them.

---

## Every module and every app

### Platform — the spine under all 21
*The spine the whole house runs on.*

Not a module you open — the layer underneath all 21. Who can see what, how Vastrangam is configured, and a record of everything that ever happened.

**Reads from:** Every module
**Writes to:** Every module

| App | What it does | Status |
|---|---|---|
| Identity, Settings & Audit | Users, roles and permissions, company switching, tax and numbering setup — and an immutable record of everything that ever happened. | roadmap |
| Industry Packs | What your trade calls things, the stages your work moves through, the extra fields your records need, the documents you issue and the reference data you start with — all of it loaded as a row of configuration, never as a separate version of the software. Pick the pack that matches your trade and the whole system changes its words: the same order screen reads as a job, a matter, a consignment or an appointment, with the same columns underneath. A pack may rename what exists, add fields to tables that exist, and switch discretionary rules off; it may never invent a concept, add a field to a table that does not exist, contain any executable code, or switch off the guarantees — company scoping, the audit trail, money never being a float — because a trade may change its vocabulary and may not opt out of the things the books are trusted for. Adding a trade nobody anticipated is therefore a file somebody writes, not a release somebody ships. | roadmap |
| **Ask & Print** | At an exhibition in Hyderabad, send one line from your phone: “ledger Kalamandir”, “print slips”. It comes back as a PDF, or it prints at the Surat office — with nothing plugged into your phone and nothing at the office open to the internet. | ✅ built · 50 self-tests |
| Communications | WhatsApp commands and broadcasts, email and SMS, and the handful of scheduled jobs that carry a nudge to the right person without anyone remembering to send it. Every capability here has more than one interchangeable provider — none of them is ever the source of a figure the business reports. | roadmap |
| WhatsApp Command Console | The shop floor does not open a laptop. A karigar or a staff member sends a short message — in, out, today’s pieces, leave, an advance — and it becomes a real record: attendance with the time and place it was marked, a production report against the design, a request in the approvals queue. The end-of-day prompt asks what is still open and how long it needs, so tomorrow starts from what is actually pending rather than from memory. Marking attendance checks the phone is at the unit within the radius set for it, with a grace window; a person outside it is not refused, they are flagged for the manager, because a system that locks someone out of being paid for being early at the wrong gate has failed at its job. Every override is recorded with who made it. The words a worker types are in the language they speak, and nothing here ever asks for a password, a bank detail or a document number. | roadmap |
| Data Privacy & Consent | What a person’s data may be used for, captured as consent at the point it is given and honoured everywhere downstream — including the right to have it corrected or removed. Retention (how long a record is kept) and deletion (a person’s right to have their own data removed) are two different policies, tracked separately, because a rule that keeps records for the law and a request from a person to be forgotten do not resolve the same way. | roadmap |
| Provider Router & Cost Guard | The rule that no capability depends on one outside service, enforced at the moment it matters instead of merely promised. Every capability has an ordered fallback list ending on an option that needs nothing connected, so a courier API that stops answering at 9pm, or an AI key that hits its quota mid-catalogue, drops to the next option instead of stopping the work. A provider that keeps failing is tripped out of the list entirely and retried once after a cooldown rather than hammered; retries inside one provider wait twice as long each time. And every paid call is counted in paise against a ceiling you set — over the ceiling the paid provider is refused, not warned about, and the work completes on a free one. Because every capability is guaranteed a built-in or by-hand option, a spent budget can stop the spending without ever stopping the business. | roadmap |
| Payment Data Scope | A written statement of exactly which systems ever see a card or bank credential, and which never do — because every card-capable screen in this system hands that moment to a payment provider’s own secured field and never stores or even passes the number through application code. The statement is what an auditor or a partner asks for before they will connect to this system. | roadmap |

---

### Module 02 · Design & Sampling
*A style exists on paper before it exists as stock.*

A product moves from a first idea to something the business can actually make and sell — specification, sample rounds, costed trials and sign-off — before it is ever entered as a catalog record. Building this first means Inventory & Catalog never has to invent a style it has no real specification for.

**Reads from:** CRM
**Writes to:** Inventory & Catalog · Manufacturing

| App | What it does | Status |
|---|---|---|
| PLM & Development | Concept to a design that can actually be made: fabric and trim specification, sample rounds with the mill, costed trials against a target price, and sign-off — every version kept, so last season’s costing is still there. | roadmap |
| Design / IP Register | What protects a design once it exists — trademark or copyright status, the date it was first shown, and a flag the moment a near-identical listing turns up elsewhere. Every version already kept by PLM & Development gets a filed status here instead of just a date stamp, because a design with no ownership record on file is a design nobody can defend. | roadmap |

---

### Module 03 · Inventory & Catalog
*One stock number everyone trusts.*

The most important number in the house: one quantity per design and size, per godown, per stage — greige, dyed, in stitching, finished, listed. Read and written by every other module. And one product record every marketplace lists from.

**Reads from:** Design & Sampling · Every module
**Writes to:** Every module

| App | What it does | Status |
|---|---|---|
| Stock | Live quantity by design, size and location, fabric in metres and pieces in numbers, with reorder alerts, lot tracking, set kits and dead-stock ageing. | roadmap |
| Catalog / PIM | One record per design — fabric, work, length, colour, size chart, images, HSN, MRP and what each panel actually sells it at — scored for Myntra and Amazon readiness before it lists. It also carries the two things everything downstream needs: the code each panel knows the design by, mapped to yours, and the packed size and weight that decide the courier rate and settle every weight dispute. Every listing’s state on every panel is here too — live, waiting for approval, blocked, archived — with the quality score that decides whether anyone sees it. | roadmap |
| Kit & Combo SKU | A sellable SKU made of component SKUs — a three-piece set sold as one listing. Selling the kit decrements each component at order time, so stock is right for every piece in the set, not just the set itself. | roadmap |
| Master-Data Hygiene | Duplicate detection and merge across customers, vendors and designs, and a dead-stock register for what has not moved in months. Protects every downstream report from the same record existing twice under two names. | roadmap |

---

### Module 04 · CRM
*Know every boutique, chain and customer completely.*

One record per party — a Kalamandir or a Rajmandir, a Surat walk-in or a Myntra buyer — carrying every enquiry, order, return, agreement and conversation, whichever channel it arrived on.

**Reads from:** Every module
**Writes to:** Sales · E-commerce / OMS · Marketing

| App | What it does | Status |
|---|---|---|
| **CRM & Customer 360** | Enquiry to confirmed order, then the full lifetime: what they bought, what came back, what they are worth and which new range to show them first. | ✅ built · 42 self-tests |
| Documents & eSign | Mill agreements, job-work contracts, signed delivery challans, export documents and boutique credit terms filed against the party or order they belong to — found by that record, not by hunting through a folder. | roadmap |
| Helpdesk & Live Chat | A boutique asking where its parcel is, or a customer asking about a size — the question becomes a ticket tied to the order, with the whole history already open. | roadmap |
| Forms & Feedback (NPS) | A short form after delivery, and the score it produces attached to the design or item it is actually about — not just the buyer — so a complaint-prone item surfaces as a pattern instead of a scatter of individual gripes. | roadmap |

---

### Module 05 · Sales
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
| Subscriptions | A schedule that raises its own invoice on its cycle and follows up on its own when a payment fails — for anything sold as a standing order rather than a one-off. | roadmap |
| Customisation & Made-to-Measure | The order that does not exist in the catalogue: a buyer sends reference pictures and their own measurements, a price is agreed over several messages, and the piece is made for them. All of it is one record — the references, the measurement set, every quote in the negotiation and what was finally agreed, the advance taken to start work and the balance taken before dispatch. When the order is accepted it opens a production order like any other, so a bespoke piece is costed, stitched, checked and posted exactly as a catalogue piece is. Two legs of money on one order is the part most systems get wrong: the advance is earned when the work starts, the balance is owed until the piece ships, and the ledger shows both separately rather than one payment appearing when the whole thing is over. | roadmap |

---

### Module 06 · Planning & Requirements (MRP)
*Turn what is selling into what to buy and make.*

Confirmed orders and demand history have to become a plan before Purchase can buy anything or Manufacturing can start anything — otherwise buying and making are both just guessing. This module sits between the two: it reads what is actually selling and what is already committed, and turns that into requirement, not the other way around.

**Reads from:** Sales · E-commerce / OMS · Inventory & Catalog
**Writes to:** Purchase · Manufacturing

| App | What it does | Status |
|---|---|---|
| Demand Forecast & Signal | What sold, by SKU and by period, turned into a short-term forecast — the number every requisition and every production order downstream is measured against instead of a guess. | roadmap |
| Requirement Explosion (MRP run) | Confirmed demand exploded through the bill of materials into what raw material to buy and what to produce, and by when — so a purchase requisition or a production order always traces back to real demand, never to a feeling that stock is getting low. | roadmap |
| Open-to-Buy / Budget Ceiling | A spending ceiling set per period regardless of what the demand signal suggests, so a real signal cannot on its own commit more money than the business has decided to risk this season. Every requisition the MRP run drafts is checked against what is left of the ceiling before it goes to Purchase. | roadmap |

---

### Module 07 · Purchase
*Nothing over-billed by a mill gets paid.*

The buy side end to end — mills, dyers, job workers and packing suppliers — with the control that stops you paying for metres you rejected.

**Reads from:** Inventory & Catalog · Planning & Requirements (MRP) · Manufacturing
**Writes to:** Inventory & Catalog · Accounting & GST · Quality & Compliance

| App | What it does | Status |
|---|---|---|
| **Procurement** | Enquiry to purchase order to goods receipt, with a strict three-way match: you ordered 100 metres, 100 arrived, quality accepted 96, and the bill is only cleared for 96. | ✅ built · 23 self-tests |
| **Vendor Management** | Mill 360 — payables, ageing, a real risk score from accept rate and spend concentration, and sourcing that follows performance rather than habit. | ✅ built · 23 self-tests |
| Insurance Register | What cover exists over stock in transit, stock in the warehouse and product liability, matched against what is actually moving through Purchase and Warehouse right now — so real value in transit is never quietly running with no cover tracked anywhere. | roadmap |

---

### Module 08 · Manufacturing
*Know what a piece really costs to make.*

From the cut plan to the finished piece — what each karigar earned, what the dyer charged, what the zari cost, and what that design actually cost before you priced it.

**Reads from:** Purchase · Planning & Requirements (MRP) · Design & Sampling
**Writes to:** Inventory & Catalog · HR & Payroll · Accounting & GST · Quality & Compliance

| App | What it does | Status |
|---|---|---|
| Production Orders | Cutting, stitching, embroidery, washing, finishing and checking — your own stages, with work-in-progress visible at each and nothing lost at the dyer. | roadmap |
| Piece-rate & Contractors | Karigars paid by the piece: pooled set completion, per-garment rates, alterations, rework and advances resolved into one payout. | roadmap |
| BOM & Consumption | What each design consumes — metres of fabric, zari, lining, buttons, packing — costed at today’s mill rates. | roadmap |
| Maintenance | Machines and the building: what is due for service, when it was last done, what it cost, and what stopped while it was down. | roadmap |

---

### Module 09 · Quality & Compliance
*Certify what was received and what was made.*

Quality inspection used to live buried as one step inside Manufacturing; it stands on its own here because a rejection at goods-receipt and a rejection on the production floor are the same discipline, and because the certificates a business holds — the proof it follows a standard — belong next to the inspections that back them up, not scattered across email.

**Reads from:** Purchase · Manufacturing
**Writes to:** Purchase · Manufacturing · Inventory & Catalog

| App | What it does | Status |
|---|---|---|
| Quality Control | Accept, reject or send for rework, with reasons that feed the mill’s accept rate and the karigar’s record. | roadmap |
| Certificate & Compliance Register | Every standard the business or a vendor holds — a safety, labour or environmental certification — with its issue date, its expiry, and the audit that backs it, so a certificate about to lapse is visible before a buyer asks for it and finds it already expired. What this register tracks is what a sustainability report downstream is actually built from. | roadmap |

---

### Module 10 · Warehouse
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

### Module 11 · Logistics
*The courier network — rates, failed deliveries and the COD money.*

Booking one parcel happens on the order. This module is the network behind it: what Delhivery, Blue Dart and the rest charge to that pin code before you pick one, what happens to a delivery that fails in a small town, and whether the cash collected at the door reached your bank.

**Reads from:** Sales · E-commerce / OMS · Warehouse
**Writes to:** Accounting & GST · Sales · E-commerce / OMS

| App | What it does | Status |
|---|---|---|
| Rates & Zones | Every courier’s rate card by zone, weight slab and service — so the cheapest and the fastest option for this parcel are both known before it is booked. | roadmap |
| NDR & RTO Rescue | A failed delivery worked while it can still be saved — reattempt, call, correct the address — before it becomes a return you pay for twice. | roadmap |
| COD Remittance | What the courier collected at the door against what reached the Surat account, parcel by parcel, with every shortfall named and aged. | roadmap |
| Handover & Manifest | What is expected out today against what the pickup boy actually took, per courier and per service. The manifest to hand him, the one-time code to confirm it, and a signed note of what was left behind — so a parcel lost between the packing table and the van has an owner. | roadmap |
| Fleet | Your own delivery vehicles, if you run any — what each trip cost, what is due for service, and what that adds to freight. Optional; most businesses run couriers only. | roadmap |

---

### Module 12 · Accounting & GST
*Books that always balance — and no BUSY needed.*

A full double-entry ledger built for Indian compliance, keeping the books itself. B2B sales, returns, mill purchases, payments and receipts are entered by hand because a person decides them; every website, marketplace and counter sale posts itself.

**Reads from:** Every module
**Writes to:** Finance Reports · Treasury & Financial Planning

| App | What it does | Status |
|---|---|---|
| Accounting | Double-entry books where every voucher balances and the trial balance always ties. | roadmap |
| Invoicing | GST tax invoices and receipts, worked out from the lines to the paise. Where a panel raises its own invoice you keep both numbers on the order — theirs and your own series — so the panel’s paperwork and your books point at the same sale. | roadmap |
| Expenses | Spend captured by category with approvals, and bill OCR to save typing. | roadmap |
| GST & Tax | CGST, SGST, IGST, TDS, TCS, input credit, GSTR-1 and GSTR-3B — filed per registration, so a group where one company is registered and another is not files exactly what each one owes and nothing it does not. | roadmap |
| ITC Reconciliation | Every input credit matched against the government’s own GSTR-2A/2B before a return is filed, so a credit claimed is a credit that is actually on record. | roadmap |
| Receivables, Payables & PDC | Payments and receipts allocated against named open invoices, and a register for post-dated cheques that posts only on the date they are realised, not the date they were written. | roadmap |
| Fixed Assets & Depreciation | The asset register with both Straight-Line and Written-Down-Value depreciation tracked side by side, and disposal posting its gain or loss straight to the books. | roadmap |
| Year-End Close & Period Lock | Profit-and-loss accounts reset and balance-sheet accounts carry forward at year end, and a reviewed period locks against backdated edits until an admin unlocks it — an act that is itself logged. | roadmap |
| Finance Reports | P&L, balance sheet, and profit by channel, design and SKU — so you know which anarkali actually earned money after commission, shipping and returns. | roadmap |

---

### Module 13 · Treasury & Financial Planning
*Know what cash is coming, not just what already arrived.*

Accounting records what happened; this module is concerned with what happens next — how much cash is actually expected, when, and whether spend against a budget is on track before the month closes and turns the answer into history.

**Reads from:** Accounting & GST · Sales · Purchase
**Writes to:** Accounting & GST

| App | What it does | Status |
|---|---|---|
| Cash Flow Forecast | Expected receipts and expected payments laid out by week, drawn from open invoices and open bills rather than typed in by hand — so a cash shortfall is visible weeks before the date it would actually bite. | roadmap |
| Banking & Reconciliation | Bank statement lines matched against the ledger’s own record of what should have moved, with anything unmatched surfaced instead of silently carried forward. | roadmap |
| Budget vs Actual | A budget set per category and period, and actual spend from Accounting tracked against it as the period runs — not only after it closes, when the only thing left to do is explain the variance. | roadmap |

---

### Module 14 · Settlement
*Get paid what the panels owe you — cycle by cycle.*

Matching one payout to one order line happens in OMS. This is the level above: the settlement cycle each panel runs, the commission it actually charged against the rate card it published, and the TCS it deducted in your name.

**Reads from:** E-commerce / OMS · Accounting & GST
**Writes to:** Accounting & GST

| App | What it does | Status |
|---|---|---|
| Payout Cycles | Every settlement cycle each panel runs — what it should pay, what actually landed in the bank, and on which day — so a late payout is visible the day it is late, not at month end. | roadmap |
| Fee & Commission Audit | The commission a panel publishes for a category against what it actually took, style by style. A quiet rate change is caught the first time it is applied, not at year end — and your seller tier sits on the same screen, because the tier is what the rate card hangs off, and slipping out of one quietly costs more than any single deduction. | roadmap |
| TCS & TDS Register | Every rupee the panels deducted as TCS, and TDS on job work, matched against the portal’s own figures — so the credit you claim is the credit you are owed. | roadmap |

---

### Module 15 · E-commerce / OMS
*Seven panels, one queue — and every rupee accounted for.*

Stop logging into Myntra, then Flipkart, then Ajio. Every marketplace order lands in one pipeline and your stock goes out to all of them — then the money side closes out in the same module: what the panel paid, what it kept as commission, what came back, and what it still owes you.

**Reads from:** Inventory & Catalog · CRM · Sales · Accounting & GST · Logistics · Settlement
**Writes to:** Inventory & Catalog · Accounting & GST · Warehouse · Logistics · Settlement

| App | What it does | Status |
|---|---|---|
| **Marketplace OMS** | Myntra, Flipkart, Ajio, Amazon, Meesho, Nykaa and JioMart in a single queue — processed all together, channel-wise, or design-wise. The stages the panels really use, with the right cut-off counting down on each order — a quick-commerce or air-shipped order is not due at the same hour as a standard one. Priority orders at the top, and the day grouped by design so a Muskan Purple is picked once for eleven parcels instead of eleven times. | ✅ built · 51 self-tests |
| **Order Management** | One pipeline from new to delivered, whether the order came from a seller panel, your Shopify or WooCommerce site, a dealer or the counter. | ✅ built · 55 self-tests |
| Manual Data Check | The order and return sheets you already download from the panels, and the offline registers from the three shops — one file or a whole ZIP — read back as ten cross-checks: net sale after commission and fees, month, design, state, wrong returns, SPF claims, ads, payouts and GST. Every figure clicks through to the transactions behind it. | roadmap |
| Reconciliation | Match every marketplace payout to the order line that earned it, and expose the gap. | roadmap |
| Claims & Disputes | Weight disputes, SPF shortfalls, parcels lost in transit and returns that came back with a different piece inside — filed as claims with the packing footage attached, and answered before they close. A claim awaiting your reply is money; one closed for no response is nothing, so the days left sit beside the amount. | roadmap |
| Returns / RMA | Customer returns, courier returns and wrong returns kept apart — because only one of the three is really your fault, and only one of them turns into dead stock. | roadmap |
| Channels & Storefronts | Connect a channel once and it stays in step: catalogue out, price out, stock out, orders in. Seven marketplaces and any website platform — Shopify, WooCommerce, Magento, BigCommerce, Wix or a custom site over its own API — each switchable without touching your data. Shopsy and any other storefront a channel runs alongside its main one counts as its own channel here. Where a channel has no open interface, its own downloaded report is a first-class way in. A channel may also know you by a different trading name — that is a label on the channel, not a second company, so it tags the order and the payout without ever splitting your books. | roadmap |
| Labels & Documents | The panel gives you a PDF; this hands the packing table something it can work from. Cropped to 4×6 for every channel, your design code printed large where the panel left it off, the invoice and slip merged behind it, and the whole batch to the label printer in one job. Reprint one parcel without redoing the lot — and no customer’s name and address is ever uploaded to an outside website to be cropped. | roadmap |
| Listing & Catalog Manager | Bulk-create and bulk-edit listings across every channel from the one product record in Inventory & Catalog, and catch the mismatches that quietly cost sales: listed but out of stock, or in stock but never listed. | roadmap |
| Size / Fit Recommendation AI | A fit suggestion at the point of purchase, built from the item’s own measurements and the return history of buyers who picked each size — aimed straight at the return reason that costs the most: the right item in the wrong size. | roadmap |
| AR / Virtual Try-On | A way to see drape, fit and colour on a screen before buying, for items where a flat photo alone leaves too much to guess. | roadmap |

---

### Module 16 · HR & Payroll
*Pay everyone right, on time.*

Office staff on a monthly salary and karigars paid by the piece, in one register, with attendance driving both and the festival advance already deducted.

**Reads from:** Manufacturing
**Writes to:** Accounting & GST

| App | What it does | Status |
|---|---|---|
| Staff & Contractors | Attendance marked by tap, effective-dated salary, and karigar piece-rate earnings in a single register. | roadmap |
| Time-off & Advances | Leave, Diwali advances, and exactly how they change this month’s payout before you approve it. | roadmap |
| Appraisal & Hiring | Performance reviews and a hiring pipeline that ends in an employee record. | roadmap |
| Recruitment | The pipeline before someone becomes an employee — an opening, the people who applied for it, a trial piece where the work itself is the interview, and the decision with its reason kept. It matters more here than in most trades: a karigar is taken on for skill on a particular garment, and the trial output is the evidence, so it is recorded against the design and the rate that would apply rather than remembered as an impression. A candidate who is not taken on now stays findable when the same skill is needed in a busy month, and their personal documents are held under the same consent and retention rules as anyone else’s, not in a folder on somebody’s phone. | roadmap |
| Payout Execution | Where the calculation in the earnings register actually turns into money leaving the business — bank batch, UPI, cash against a signed receipt — with the method and the reference recorded against every payout, so the register’s total and the money that actually moved can always be checked against each other. | roadmap |

---

### Module 17 · Marketing
*Sell more without cutting the price.*

Plan the festive calendar, run the campaigns, and let rules keep you competitive on the panels without giving the margin away.

**Reads from:** Inventory & Catalog · CRM
**Writes to:** Sales · E-commerce / OMS

| App | What it does | Status |
|---|---|---|
| Social Calendar | Plan and publish across every channel from one calendar. | roadmap |
| Campaigns | Email, SMS and WhatsApp campaigns measured on real revenue, not opens. | roadmap |
| Repricing Engine | Rules per panel and per design — floor, ceiling, match-lowest and a festive override — so a Diwali sale does not quietly go below cost. And what each change actually did: a design whose orders fell after a price rise shows as exactly that, next to the rule that raised it. | roadmap |
| Automation | If this happens, do that — across any module, without writing code. | roadmap |
| Blog & Pages | How to drape it, what to wear it to, which fabric for which season — written, scheduled and published to your own site with the meta and internal links already set. | roadmap |
| Events | Trade shows and exhibitions worked as a channel of their own — booth, budget and every lead captured on the floor landing straight in CRM instead of on a stack of business cards. | roadmap |
| Website & Page Builder | The storefront itself, built by dragging sections into place rather than by editing a theme file — hero, product grid, size guide, lookbook, contact form — each block reading live from the catalogue, so a price or a stock state on a landing page is the same number the order screen uses instead of a figure someone pasted in and forgot. Blog & Pages above writes articles into a site that already exists; this is for the businesses that do not have one, and it is the gap that shows up plainly when this module list is set beside a mature open-source ERP: they ship a full site builder next to the blog, and until now this did not. | roadmap |
| Markdown / Clearance Optimization | The same rule engine that reprices for competitiveness, aimed at ageing stock instead: when to start discounting it and by how much, before it becomes a warehouse write-off rather than a sale at a lower margin. | roadmap |

---

### Module 18 · AI Content Engine
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
| Motion Renderer | A reel rendered from a page of HTML and CSS — the same layers, fonts and brand colours the Design Studio already uses — into a real MP4, on this machine, with nothing uploaded. It is not a screen recording: the clock is faked, the animation is seeked to the exact instant of each frame, and only then is that frame captured, so the render does not care whether the machine was busy. Rendering the same festival banner twice produces the same file to the byte, which is what makes a reel something you can check and re-cut rather than something you have to watch all the way through and hope about. | roadmap |
| Narration Studio | A voice over the reel, in the language the buyer actually speaks — the same script the Content Engine wrote, spoken. The default needs nothing installed and no key, because every modern browser can already speak; a self-hosted or cloud voice sits behind it as an interchangeable provider for anyone who wants a cloned or branded one. Long scripts are split at sentence boundaries and rejoined, so a two-minute description is not cut off at whatever limit a service imposes. A voice cloned from a real person is only ever used with that person’s recorded consent, filed against them in Data Privacy & Consent like any other permission. | roadmap |
| Image Generation Slot | Generated imagery — a model on a background you do not have to shoot, a festival backdrop, a lifestyle scene — as a capability with interchangeable providers rather than a bet on one service: a queue of jobs, a preview while it works, inpainting to fix one region, upscaling and face correction. This one needs a graphics card. Image models cannot run on an ordinary office machine or on the container this system is built in, so what ships is the queue, the review screen and the provider slot, with the generating itself done by whichever engine you point it at — your own GPU box, or a cloud service, swapped without touching anything else. Said plainly here because the alternative is a screen that looks finished and produces nothing. | roadmap |
| Publisher | One push sends the listing, images and copy to the website and every panel, and reports back what went live and what a panel rejected, with the reason. | roadmap |

---

### Module 19 · SEO, AEO & AIO
*Be found by a search box, an answer box and an AI.*

Content already exists once this module is reached; here it is made findable — by a traditional search engine, by the answer box above the results, and by the AI assistants now answering shopping questions directly instead of sending someone to a results page.

**Reads from:** Inventory & Catalog · AI Content Engine
**Writes to:** Marketing

| App | What it does | Status |
|---|---|---|
| Technical SEO & Schema | Structured data, sitemaps and page-level technical checks against your own storefront and content pages, so a search engine can read what a page is actually about instead of guessing from the text alone. | roadmap |
| Answer-Engine Optimization | Content shaped to be quoted directly by an answer box or a voice assistant — a clear, citable answer near the top of the page — rather than written only for a person to scroll through. | roadmap |
| AI-Engine Visibility Tracking | Whether and how this business is actually cited when someone asks an AI assistant a shopping question in this category, tracked over time — the same discipline as rank tracking, aimed at a newer kind of result page. | roadmap |

---

### Module 20 · Projects & Collaboration
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
| Automation Studio | The place a person builds “when this happens, do that” by dragging it out and watching it run — a trigger, the steps after it, a branch where the answer decides which way to go — over the same event stream every module already writes to. Marketing’s Automation aims that idea at campaigns; this is the general one, reaching any module: a payment marked short holds the next dispatch and opens a claim, a karigar’s pooled sets crossing a threshold raises the payout for approval, a return marked damaged writes off the piece and messages the buyer. Every run is kept — what fired it, each step, what each step returned — because an automation nobody can inspect afterwards is a rule the business cannot trust with its money. | roadmap |
| Discuss | The conversation attached to the record it is about — this order, this mill bill, this dispute — so a year later the reason for the decision is still sitting beside it. | roadmap |
| Knowledge Base | A searchable internal wiki of standard operating procedures, scoped to the role it applies to, so how a task is meant to be done is written down once instead of carried in one person’s head. | roadmap |

---

### Module 21 · Dashboard & BI
*See the whole house without asking anyone.*

Every number rolls up here as work happens — the day’s marketplace orders, what the karigars finished, what is still lying at the dyer, what the mills are owed. No exports, no waiting for month-end.

**Reads from:** Every module
**Writes to:** —

| App | What it does | Status |
|---|---|---|
| **CEO Dashboard** | Cash, sales by channel, stock by design, profit per piece and the alerts that matter — one screen, refreshed as the day runs. | ✅ built · 30 self-tests |
| **Report Builder** | Drag the fields you want into a report and save it for the whole team. | ✅ built · 40 self-tests |
| Group Consolidation | Ethnic Fashion, Vastrangam and Adini Couture as one set of figures, inter-company transfers removed, so the group position is real rather than three spreadsheets added together. Adini Couture has no registration of its own and mainly does job work — it still counts in the group, without being pulled into a return it does not belong in. Add the fourth company the day you open it. | roadmap |
| Excel Dashboard Builder | A full workbook — financial summary, HR, purchase, sales, inventory and production, GST, expenses — generated from the live records behind every other screen, with each company shown as its own row and a consolidated row that is a formula over them, never a separately typed total. | roadmap |
| ESG / Sustainability Reporting | Water usage, chemical compliance, waste and packaging, reported from the same certificate and audit records Quality & Compliance already keeps — so a sustainability report is a query over evidence already on file, not a separate exercise assembled once a year from scratch. | roadmap |

---

### Module 22 · AI Assistant, Agents & Automation
*Ask the house a question — and let the routine work run itself.*

Last for the same reason Dashboard & BI is late: something that answers questions about the whole business can only be built once the whole business is in one place. Three different things live here and the difference between them matters. An ASSISTANT answers a question you asked, from the records, with the records attached. A CHATBOT holds the same conversation with your customer instead of you. An AGENT is given a job rather than a question and works out the steps itself. That last one is what separates this module from Automation Studio in Module 20, where a person draws the steps in advance and the rule runs the same way every time; and from Automation in Module 17, which fires marketing campaigns and nothing else. Both of those stay exactly as they are — this module sits above them and calls them, rather than replacing either. Module 18 writes content; this module answers and acts.

**Reads from:** Every module
**Writes to:** Projects & Collaboration · CRM · Marketing

| App | What it does | Status |
|---|---|---|
| AI Assistant | Ask in your own words — “what did Myntra actually pay us last week, and what is still short?”, “which designs did Kalamandir return most” — and get the answer with the rows it came from underneath it, each clicking through to the record. It reads the same ledger and the same settlement lines the accounts screen reads, so its figure and the books agree. When it cannot find the answer it says so; it never puts a plausible number in place of a real one. | roadmap |
| AI Chatbot | The same engine facing your buyer, on the website and on WhatsApp: where is my order, will the L fit me, I want to return this saree. It reads the real order and the real size chart, not a script written last season, and it says “let me get someone” for anything about money or a complaint — handing over into the Surat helpdesk queue with the whole chat already attached. It never asks a buyer for a card number, a bank detail or a password. | roadmap |
| AI Agents | A job rather than a question: “chase every unmatched payout line from last week and draft the claim for each.” It works out the steps and stops where a person has to decide. Filing the claim, moving money, changing a price or messaging a boutique all wait for your yes. | roadmap |
| Agent Guardrails & Run Log | What each agent is allowed to touch, written down as a scope rather than trusted to a prompt, and every run recorded step by step: what started it, what it read, what it proposed, what a person approved, what it actually changed. Kept in the same audit trail as everything else, with the same absence of an off switch. An agent whose working nobody can inspect afterwards is not a colleague, it is an unexplained entry in the books. | roadmap |
| Knowledge & Retrieval | The index that makes the answers grounded: your own designs, rate cards, settlement files, standard procedures and past decisions, searchable so a reply quotes what is actually on file instead of what a model remembers about the trade in general. Permission-scoped at the row, so two people asking the same question get answers drawn only from what each of them may already see. | roadmap |

---

## The rules that hold everywhere

1. **No app depends on any single outside company.** Every capability — books, marketplaces,
   AI writing, automation, couriers, payments, messaging, storage, GST, printing, barcode — is a
   capability with many interchangeable providers. Each one has a built-in or by-hand option, so
   the app works fully with **nothing connected at all**. Four self-tests check this at every launch.
2. **The books are Vastrangam BOS's own.** No accounting package is required, ever. Tally, BUSY, Marg,
   Zoho and QuickBooks are options for people already running one — nothing assumes them and no
   figure is ever sourced from one.
3. **Nothing asks for an account password.** Outside services connect with a scoped, revocable
   key. *Vastrangam BOS will never ask you for a marketplace, bank or account password. If any screen
   ever does, it is not Vastrangam BOS.*
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

*Vastrangam BOS · One business. One brain. · 21 modules · 113 apps · one shared data core*
