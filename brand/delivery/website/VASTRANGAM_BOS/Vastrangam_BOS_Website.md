# Vastrangam BOS — one business, one brain

**The Business Operating System for Vastrangam Group: 21 modules and 104 apps over one shared data core.**

This file is the whole system in plain text — every module, every app, and what each one reads and
writes. It is generated from `brand/site/modules.js`, the same file the website and every PDF read,
so nothing here can disagree with them. The counts below are not typed in; they are counted from that
file each time this page is built.

| | |
|---|---|
| **Modules** | 21, built in dependency order — a module is only built once everything it needs exists |
| **Apps** | 104 |
| **Working today** | 16 — each opens in a browser, carries its own self-tests and passes the click-through audit in both editions |
| **Engine working, screen to come** | 2 — the arithmetic is written and passing its own tests on the command line; there is no screen on it yet, so it is not counted above |
| **Still to build** | 86 |
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

```
                  ┌───────────────────────────────────────┐
                  │          UNIFIED DATA CORE            │
                  │  Company · Item/SKU · Party ·         │
                  │  Stock · Ledger/Voucher · Order       │
                  └───────────────────────────────────────┘
                                   ▲ ▼
       every one of the 104 apps reads and writes these, and only these
```

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

The test of whether this is one system or 104 programs sharing a login: sell a single garment and
follow it.

```
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
```

---

## Every module and every app

Listed in build order. Each app is marked **working today** or **designed, not yet built** — nothing
is described as finished that is not.

### Module 01 · Platform
*The spine the whole house runs on.*

Not a module you open — the layer underneath all 21. Who can see what, how Vastrangam is configured, and a record of everything that ever happened.

**Reads from:** Every module
**Writes to:** Every module

| App | What it does | State |
|---|---|---|
| Identity, Settings & Audit | Users, roles and permissions, company switching, tax and numbering setup — and an immutable record of everything that ever happened. | designed, not yet built |
| **Ask & Print** | At an exhibition in Hyderabad, send one line from your phone: “ledger Kalamandir”, “print slips”. It comes back as a PDF, or it prints at the Surat office — with nothing plugged into your phone and nothing at the office open to the internet. | working today |
| Communications | WhatsApp commands and broadcasts, email and SMS, and the handful of scheduled jobs that carry a nudge to the right person without anyone remembering to send it. Every capability here has more than one interchangeable provider — none of them is ever the source of a figure the business reports. | designed, not yet built |
| Data Privacy & Consent | What a person’s data may be used for, captured as consent at the point it is given and honoured everywhere downstream — including the right to have it corrected or removed. Retention (how long a record is kept) and deletion (a person’s right to have their own data removed) are two different policies, tracked separately, because a rule that keeps records for the law and a request from a person to be forgotten do not resolve the same way. | designed, not yet built |
| **Provider Router & Cost Guard** | The rule that no capability depends on one outside service, enforced at the moment it matters instead of merely promised. Every capability has an ordered fallback list ending on an option that needs nothing connected, so a courier API that stops answering at 9pm, or an AI key that hits its quota mid-catalogue, drops to the next option instead of stopping the work. A provider that keeps failing is tripped out of the list entirely and retried once after a cooldown rather than hammered; retries inside one provider wait twice as long each time. And every paid call is counted in paise against a ceiling you set — over the ceiling the paid provider is refused, not warned about, and the work completes on a free one. Because every capability is guaranteed a built-in or by-hand option, a spent budget can stop the spending without ever stopping the business. | engine working, screen to come |
| Payment Data Scope | A written statement of exactly which systems ever see a card or bank credential, and which never do — because every card-capable screen in this system hands that moment to a payment provider’s own secured field and never stores or even passes the number through application code. The statement is what an auditor or a partner asks for before they will connect to this system. | designed, not yet built |

---

### Module 02 · Design & Sampling
*A style exists on paper before it exists as stock.*

A product moves from a first idea to something the business can actually make and sell — specification, sample rounds, costed trials and sign-off — before it is ever entered as a catalog record. Building this first means Inventory & Catalog never has to invent a style it has no real specification for.

**Reads from:** CRM
**Writes to:** Inventory & Catalog · Manufacturing

| App | What it does | State |
|---|---|---|
| PLM & Development | Concept to a design that can actually be made: fabric and trim specification, sample rounds with the mill, costed trials against a target price, and sign-off — every version kept, so last season’s costing is still there. | designed, not yet built |
| Design / IP Register | What protects a design once it exists — trademark or copyright status, the date it was first shown, and a flag the moment a near-identical listing turns up elsewhere. Every version already kept by PLM & Development gets a filed status here instead of just a date stamp, because a design with no ownership record on file is a design nobody can defend. | designed, not yet built |

---

### Module 03 · Inventory & Catalog
*One stock number everyone trusts.*

The most important number in the house: one quantity per design and size, per godown, per stage — greige, dyed, in stitching, finished, listed. Read and written by every other module. And one product record every marketplace lists from.

**Reads from:** Design & Sampling · Every module
**Writes to:** Every module

| App | What it does | State |
|---|---|---|
| Stock | Live quantity by design, size and location, fabric in metres and pieces in numbers, with reorder alerts, lot tracking, set kits and dead-stock ageing. | designed, not yet built |
| Catalog / PIM | One record per design — fabric, work, length, colour, size chart, images, HSN, MRP and what each panel actually sells it at — scored for Myntra and Amazon readiness before it lists. It also carries the two things everything downstream needs: the code each panel knows the design by, mapped to yours, and the packed size and weight that decide the courier rate and settle every weight dispute. Every listing’s state on every panel is here too — live, waiting for approval, blocked, archived — with the quality score that decides whether anyone sees it. | designed, not yet built |
| Kit & Combo SKU | A sellable SKU made of component SKUs — a three-piece set sold as one listing. Selling the kit decrements each component at order time, so stock is right for every piece in the set, not just the set itself. | designed, not yet built |
| Master-Data Hygiene | Duplicate detection and merge across customers, vendors and designs, and a dead-stock register for what has not moved in months. Protects every downstream report from the same record existing twice under two names. | designed, not yet built |

---

### Module 04 · CRM
*Know every boutique, chain and customer completely.*

One record per party — a Kalamandir or a Rajmandir, a Surat walk-in or a Myntra buyer — carrying every enquiry, order, return, agreement and conversation, whichever channel it arrived on.

**Reads from:** Every module
**Writes to:** Sales · E-commerce / OMS · Marketing

| App | What it does | State |
|---|---|---|
| **CRM & Customer 360** | Enquiry to confirmed order, then the full lifetime: what they bought, what came back, what they are worth and which new range to show them first. | working today |
| **Documents & eSign** | Mill agreements, job-work contracts, signed delivery challans, export documents and boutique credit terms filed against the party or order they belong to — found by that record, not by hunting through a folder. | working today |
| **Helpdesk & Live Chat** | A boutique asking where its parcel is, or a customer asking about a size — the question becomes a ticket tied to the order, with the whole history already open. | working today |
| Forms & Feedback (NPS) | A short form after delivery, and the score it produces attached to the design or item it is actually about — not just the buyer — so a complaint-prone item surfaces as a pattern instead of a scatter of individual gripes. | designed, not yet built |

---

### Module 05 · Sales
*Counter, wholesale, website and export — one order book.*

The Surat counter, the boutique wholesale book, the website and the export shipment all write to the same order and draw on the same stock number. And the parcel is followed to the door, because a sale is not done until the COD money is in.

**Reads from:** Inventory & Catalog · CRM · Warehouse · Logistics
**Writes to:** Inventory & Catalog · Accounting & GST · Warehouse · Logistics

| App | What it does | State |
|---|---|---|
| **D2C Sales** | Orders from your own storefront, cart to dispatch, with loyalty and partial COD on a ₹4,400 anarkali. | working today |
| **B2B & Credit** | Boutique and chain orders on credit limits and tier pricing, with outstanding aged against each party’s own agreed terms. | working today |
| **Export** | Commercial invoice, packing list, LUT bond and IGST-refund tracking for the Gulf and UK buyers. | working today |
| **POS** | Counter billing at Udhna that draws on the same stock as the website — no second stock register. | working today |
| **Quotes & Proforma** | Send a quote, convert it to a confirmed order in one click. | working today |
| Couriers & AWB | Book the parcel on the order, compare couriers for that pin code, print the label with the design code on it, and follow the AWB to the door. | designed, not yet built |
| Subscriptions | A schedule that raises its own invoice on its cycle and follows up on its own when a payment fails — for anything sold as a standing order rather than a one-off. | designed, not yet built |

---

### Module 06 · Planning & Requirements (MRP)
*Turn what is selling into what to buy and make.*

Confirmed orders and demand history have to become a plan before Purchase can buy anything or Manufacturing can start anything — otherwise buying and making are both just guessing. This module sits between the two: it reads what is actually selling and what is already committed, and turns that into requirement, not the other way around.

**Reads from:** Sales · E-commerce / OMS · Inventory & Catalog
**Writes to:** Purchase · Manufacturing

| App | What it does | State |
|---|---|---|
| Demand Forecast & Signal | What sold, by SKU and by period, turned into a short-term forecast — the number every requisition and every production order downstream is measured against instead of a guess. | designed, not yet built |
| Requirement Explosion (MRP run) | Confirmed demand exploded through the bill of materials into what raw material to buy and what to produce, and by when — so a purchase requisition or a production order always traces back to real demand, never to a feeling that stock is getting low. | designed, not yet built |
| Open-to-Buy / Budget Ceiling | A spending ceiling set per period regardless of what the demand signal suggests, so a real signal cannot on its own commit more money than the business has decided to risk this season. Every requisition the MRP run drafts is checked against what is left of the ceiling before it goes to Purchase. | designed, not yet built |

---

### Module 07 · Purchase
*Nothing over-billed by a mill gets paid.*

The buy side end to end — mills, dyers, job workers and packing suppliers — with the control that stops you paying for metres you rejected.

**Reads from:** Inventory & Catalog · Planning & Requirements (MRP) · Manufacturing
**Writes to:** Inventory & Catalog · Accounting & GST · Quality & Compliance

| App | What it does | State |
|---|---|---|
| **Procurement** | Enquiry to purchase order to goods receipt, with a strict three-way match: you ordered 100 metres, 100 arrived, quality accepted 96, and the bill is only cleared for 96. | working today |
| **Vendor Management** | Mill 360 — payables, ageing, a real risk score from accept rate and spend concentration, and sourcing that follows performance rather than habit. | working today |
| Insurance Register | What cover exists over stock in transit, stock in the warehouse and product liability, matched against what is actually moving through Purchase and Warehouse right now — so real value in transit is never quietly running with no cover tracked anywhere. | designed, not yet built |

---

### Module 08 · Manufacturing
*Know what a piece really costs to make.*

From the cut plan to the finished piece — what each karigar earned, what the dyer charged, what the zari cost, and what that design actually cost before you priced it.

**Reads from:** Purchase · Planning & Requirements (MRP) · Design & Sampling
**Writes to:** Inventory & Catalog · HR & Payroll · Accounting & GST · Quality & Compliance

| App | What it does | State |
|---|---|---|
| Production Orders | Cutting, stitching, embroidery, washing, finishing and checking — your own stages, with work-in-progress visible at each and nothing lost at the dyer. | designed, not yet built |
| Piece-rate & Contractors | Karigars paid by the piece: pooled set completion, per-garment rates, alterations, rework and advances resolved into one payout. | designed, not yet built |
| BOM & Consumption | What each design consumes — metres of fabric, zari, lining, buttons, packing — costed at today’s mill rates. | designed, not yet built |
| Maintenance | Machines and the building: what is due for service, when it was last done, what it cost, and what stopped while it was down. | designed, not yet built |

---

### Module 09 · Quality & Compliance
*Certify what was received and what was made.*

Quality inspection used to live buried as one step inside Manufacturing; it stands on its own here because a rejection at goods-receipt and a rejection on the production floor are the same discipline, and because the certificates a business holds — the proof it follows a standard — belong next to the inspections that back them up, not scattered across email.

**Reads from:** Purchase · Manufacturing
**Writes to:** Purchase · Manufacturing · Inventory & Catalog

| App | What it does | State |
|---|---|---|
| Quality Control | Accept, reject or send for rework, with reasons that feed the mill’s accept rate and the karigar’s record. | designed, not yet built |
| Certificate & Compliance Register | Every standard the business or a vendor holds — a safety, labour or environmental certification — with its issue date, its expiry, and the audit that backs it, so a certificate about to lapse is visible before a buyer asks for it and finds it already expired. What this register tracks is what a sustainability report downstream is actually built from. | designed, not yet built |

---

### Module 10 · Warehouse
*Pick the right design first time — and prove what you sent.*

Bin-level instructions and barcode scanning so the right piece leaves the godown and stock stays honest — and a recording of each parcel being packed, because a wrong-return claim is settled by footage, not by argument.

**Reads from:** Sales · E-commerce / OMS · Inventory & Catalog
**Writes to:** Inventory & Catalog · Sales · E-commerce / OMS

| App | What it does | State |
|---|---|---|
| Picking & Bins | Pick lists in walking order through the godown, by design and size, so nobody crosses the floor twice. | designed, not yet built |
| Barcode Operations | Scan to pick, pack, dispatch and run a physical stock count from a phone — the same scan whether the order came from a marketplace, your Shopify site or the counter. | designed, not yet built |
| Packing Video | Every parcel filmed as it is packed and indexed by its order number, so when a panel says the wrong piece was sent, the clip goes into the claim. | designed, not yet built |

---

### Module 11 · Logistics
*The courier network — rates, failed deliveries and the COD money.*

Booking one parcel happens on the order. This module is the network behind it: what Delhivery, Blue Dart and the rest charge to that pin code before you pick one, what happens to a delivery that fails in a small town, and whether the cash collected at the door reached your bank.

**Reads from:** Sales · E-commerce / OMS · Warehouse
**Writes to:** Accounting & GST · Sales · E-commerce / OMS

| App | What it does | State |
|---|---|---|
| Rates & Zones | Every courier’s rate card by zone, weight slab and service — so the cheapest and the fastest option for this parcel are both known before it is booked. | designed, not yet built |
| NDR & RTO Rescue | A failed delivery worked while it can still be saved — reattempt, call, correct the address — before it becomes a return you pay for twice. | designed, not yet built |
| COD Remittance | What the courier collected at the door against what reached the Surat account, parcel by parcel, with every shortfall named and aged. | designed, not yet built |
| Handover & Manifest | What is expected out today against what the pickup boy actually took, per courier and per service. The manifest to hand him, the one-time code to confirm it, and a signed note of what was left behind — so a parcel lost between the packing table and the van has an owner. | designed, not yet built |
| Fleet | Your own delivery vehicles, if you run any — what each trip cost, what is due for service, and what that adds to freight. Optional; most businesses run couriers only. | designed, not yet built |

---

### Module 12 · Accounting & GST
*Books that always balance — and no BUSY needed.*

A full double-entry ledger built for Indian compliance, keeping the books itself. B2B sales, returns, mill purchases, payments and receipts are entered by hand because a person decides them; every website, marketplace and counter sale posts itself.

**Reads from:** Every module
**Writes to:** Finance Reports · Treasury & Financial Planning

| App | What it does | State |
|---|---|---|
| Accounting | Double-entry books where every voucher balances and the trial balance always ties. | designed, not yet built |
| Invoicing | GST tax invoices and receipts, worked out from the lines to the paise. Where a panel raises its own invoice you keep both numbers on the order — theirs and your own series — so the panel’s paperwork and your books point at the same sale. | designed, not yet built |
| Expenses | Spend captured by category with approvals, and bill OCR to save typing. | designed, not yet built |
| GST & Tax | CGST, SGST, IGST, TDS, TCS, input credit, GSTR-1 and GSTR-3B — filed per registration, so a group where one company is registered and another is not files exactly what each one owes and nothing it does not. | designed, not yet built |
| ITC Reconciliation | Every input credit matched against the government’s own GSTR-2A/2B before a return is filed, so a credit claimed is a credit that is actually on record. | designed, not yet built |
| Receivables, Payables & PDC | Payments and receipts allocated against named open invoices, and a register for post-dated cheques that posts only on the date they are realised, not the date they were written. | designed, not yet built |
| Fixed Assets & Depreciation | The asset register with both Straight-Line and Written-Down-Value depreciation tracked side by side, and disposal posting its gain or loss straight to the books. | designed, not yet built |
| Year-End Close & Period Lock | Profit-and-loss accounts reset and balance-sheet accounts carry forward at year end, and a reviewed period locks against backdated edits until an admin unlocks it — an act that is itself logged. | designed, not yet built |
| Finance Reports | P&L, balance sheet, and profit by channel, design and SKU — so you know which anarkali actually earned money after commission, shipping and returns. | designed, not yet built |

---

### Module 13 · Treasury & Financial Planning
*Know what cash is coming, not just what already arrived.*

Accounting records what happened; this module is concerned with what happens next — how much cash is actually expected, when, and whether spend against a budget is on track before the month closes and turns the answer into history.

**Reads from:** Accounting & GST · Sales · Purchase
**Writes to:** Accounting & GST

| App | What it does | State |
|---|---|---|
| Cash Flow Forecast | Expected receipts and expected payments laid out by week, drawn from open invoices and open bills rather than typed in by hand — so a cash shortfall is visible weeks before the date it would actually bite. | designed, not yet built |
| Banking & Reconciliation | Bank statement lines matched against the ledger’s own record of what should have moved, with anything unmatched surfaced instead of silently carried forward. | designed, not yet built |
| Budget vs Actual | A budget set per category and period, and actual spend from Accounting tracked against it as the period runs — not only after it closes, when the only thing left to do is explain the variance. | designed, not yet built |

---

### Module 14 · Settlement
*Get paid what the panels owe you — cycle by cycle.*

Matching one payout to one order line happens in OMS. This is the level above: the settlement cycle each panel runs, the commission it actually charged against the rate card it published, and the TCS it deducted in your name.

**Reads from:** E-commerce / OMS · Accounting & GST
**Writes to:** Accounting & GST

| App | What it does | State |
|---|---|---|
| Payout Cycles | Every settlement cycle each panel runs — what it should pay, what actually landed in the bank, and on which day — so a late payout is visible the day it is late, not at month end. | designed, not yet built |
| Fee & Commission Audit | The commission a panel publishes for a category against what it actually took, style by style. A quiet rate change is caught the first time it is applied, not at year end — and your seller tier sits on the same screen, because the tier is what the rate card hangs off, and slipping out of one quietly costs more than any single deduction. | designed, not yet built |
| TCS & TDS Register | Every rupee the panels deducted as TCS, and TDS on job work, matched against the portal’s own figures — so the credit you claim is the credit you are owed. | designed, not yet built |

---

### Module 15 · E-commerce / OMS
*Seven panels, one queue — and every rupee accounted for.*

Stop logging into Myntra, then Flipkart, then Ajio. Every marketplace order lands in one pipeline and your stock goes out to all of them — then the money side closes out in the same module: what the panel paid, what it kept as commission, what came back, and what it still owes you.

**Reads from:** Inventory & Catalog · CRM · Sales · Accounting & GST · Logistics · Settlement
**Writes to:** Inventory & Catalog · Accounting & GST · Warehouse · Logistics · Settlement

| App | What it does | State |
|---|---|---|
| **Marketplace OMS** | Myntra, Flipkart, Ajio, Amazon, Meesho, Nykaa and JioMart in a single queue — processed all together, channel-wise, or design-wise. The stages the panels really use, with the right cut-off counting down on each order — a quick-commerce or air-shipped order is not due at the same hour as a standard one. Priority orders at the top, and the day grouped by design so a Muskan Purple is picked once for eleven parcels instead of eleven times. | working today |
| **Order Management** | One pipeline from new to delivered, whether the order came from a seller panel, your Shopify or WooCommerce site, a dealer or the counter. | working today |
| Manual Data Check | The order and return sheets you already download from the panels, and the offline registers from the three shops — one file or a whole ZIP — read back as ten cross-checks: net sale after commission and fees, month, design, state, wrong returns, SPF claims, ads, payouts and GST. Every figure clicks through to the transactions behind it. | designed, not yet built |
| Reconciliation | Match every marketplace payout to the order line that earned it, and expose the gap. | designed, not yet built |
| Claims & Disputes | Weight disputes, SPF shortfalls, parcels lost in transit and returns that came back with a different piece inside — filed as claims with the packing footage attached, and answered before they close. A claim awaiting your reply is money; one closed for no response is nothing, so the days left sit beside the amount. | designed, not yet built |
| Returns / RMA | Customer returns, courier returns and wrong returns kept apart — because only one of the three is really your fault, and only one of them turns into dead stock. | designed, not yet built |
| Channels & Storefronts | Connect a channel once and it stays in step: catalogue out, price out, stock out, orders in. Seven marketplaces and any website platform — Shopify, WooCommerce, Magento, BigCommerce, Wix or a custom site over its own API — each switchable without touching your data. Shopsy and any other storefront a channel runs alongside its main one counts as its own channel here. Where a channel has no open interface, its own downloaded report is a first-class way in. A channel may also know you by a different trading name — that is a label on the channel, not a second company, so it tags the order and the payout without ever splitting your books. | designed, not yet built |
| Labels & Documents | The panel gives you a PDF; this hands the packing table something it can work from. Cropped to 4×6 for every channel, your design code printed large where the panel left it off, the invoice and slip merged behind it, and the whole batch to the label printer in one job. Reprint one parcel without redoing the lot — and no customer’s name and address is ever uploaded to an outside website to be cropped. | designed, not yet built |
| Listing & Catalog Manager | Bulk-create and bulk-edit listings across every channel from the one product record in Inventory & Catalog, and catch the mismatches that quietly cost sales: listed but out of stock, or in stock but never listed. | designed, not yet built |
| Size / Fit Recommendation AI | A fit suggestion at the point of purchase, built from the item’s own measurements and the return history of buyers who picked each size — aimed straight at the return reason that costs the most: the right item in the wrong size. | designed, not yet built |
| AR / Virtual Try-On | A way to see drape, fit and colour on a screen before buying, for items where a flat photo alone leaves too much to guess. | designed, not yet built |

---

### Module 16 · HR & Payroll
*Pay everyone right, on time.*

Office staff on a monthly salary and karigars paid by the piece, in one register, with attendance driving both and the festival advance already deducted.

**Reads from:** Manufacturing
**Writes to:** Accounting & GST

| App | What it does | State |
|---|---|---|
| Staff & Contractors | Attendance marked by tap, effective-dated salary, and karigar piece-rate earnings in a single register. | designed, not yet built |
| Time-off & Advances | Leave, Diwali advances, and exactly how they change this month’s payout before you approve it. | designed, not yet built |
| Appraisal & Hiring | Performance reviews and a hiring pipeline that ends in an employee record. | designed, not yet built |
| Payout Execution | Where the calculation in the earnings register actually turns into money leaving the business — bank batch, UPI, cash against a signed receipt — with the method and the reference recorded against every payout, so the register’s total and the money that actually moved can always be checked against each other. | designed, not yet built |

---

### Module 17 · Marketing
*Sell more without cutting the price.*

Plan the festive calendar, run the campaigns, and let rules keep you competitive on the panels without giving the margin away.

**Reads from:** Inventory & Catalog · CRM
**Writes to:** Sales · E-commerce / OMS

| App | What it does | State |
|---|---|---|
| Social Calendar | Plan and publish across every channel from one calendar. | designed, not yet built |
| Campaigns | Email, SMS and WhatsApp campaigns measured on real revenue, not opens. | designed, not yet built |
| Repricing Engine | Rules per panel and per design — floor, ceiling, match-lowest and a festive override — so a Diwali sale does not quietly go below cost. And what each change actually did: a design whose orders fell after a price rise shows as exactly that, next to the rule that raised it. | designed, not yet built |
| Automation | If this happens, do that — across any module, without writing code. | designed, not yet built |
| Blog & Pages | How to drape it, what to wear it to, which fabric for which season — written, scheduled and published to your own site with the meta and internal links already set. | designed, not yet built |
| Events | Trade shows and exhibitions worked as a channel of their own — booth, budget and every lead captured on the floor landing straight in CRM instead of on a stack of business cards. | designed, not yet built |
| Website & Page Builder | The storefront itself, built by dragging sections into place rather than by editing a theme file — hero, product grid, size guide, lookbook, contact form — each block reading live from the catalogue, so a price or a stock state on a landing page is the same number the order screen uses instead of a figure someone pasted in and forgot. Blog & Pages above writes articles into a site that already exists; this is for the businesses that do not have one, and it is the gap that shows up plainly when this module list is set beside a mature open-source ERP: they ship a full site builder next to the blog, and until now this did not. | designed, not yet built |
| Markdown / Clearance Optimization | The same rule engine that reprices for competitiveness, aimed at ageing stock instead: when to start discounting it and by how much, before it becomes a warehouse write-off rather than a sale at a lower margin. | designed, not yet built |

---

### Module 18 · AI Content Engine
*Write it, shoot it, cut it — from your own catalogue.*

Listings, ads, reels and product photography generated from your own designs, in a voice that sounds like one person from Surat rather than a template — so the words match the piece and the picture is the size Myntra actually wants.

**Reads from:** Inventory & Catalog
**Writes to:** Marketing · E-commerce / OMS

| App | What it does | State |
|---|---|---|
| Content Engine | Fourteen stages in your own voice — buyer psychology, competitor reading, hooks, the product description, marketplace copy for Amazon and Myntra, ad variations, reel scripts, song lyrics for the reel, the calendar, size chart and alt text. | designed, not yet built |
| Image Studio | A phone photo becomes a listing image: layers, free transform, background removal, Myntra 1080×1440 and every other channel preset, watermark and SEO alt text. | designed, not yet built |
| Video Studio | Text and image to video, reels and ad cuts sized for every channel. | designed, not yet built |
| Design Studio | Banners, festive creatives and thumbnails — templates, layers, undo and redo, any colour, exact sizing and stock elements, exporting PNG, JPG or PDF at whatever size the panel or the printer asks for. | designed, not yet built |
| **Motion Renderer** | A reel rendered from a page of HTML and CSS — the same layers, fonts and brand colours the Design Studio already uses — into a real MP4, on this machine, with nothing uploaded. It is not a screen recording: the clock is faked, the animation is seeked to the exact instant of each frame, and only then is that frame captured, so the render does not care whether the machine was busy. Rendering the same festival banner twice produces the same file to the byte, which is what makes a reel something you can check and re-cut rather than something you have to watch all the way through and hope about. | engine working, screen to come |
| Narration Studio | A voice over the reel, in the language the buyer actually speaks — the same script the Content Engine wrote, spoken. The default needs nothing installed and no key, because every modern browser can already speak; a self-hosted or cloud voice sits behind it as an interchangeable provider for anyone who wants a cloned or branded one. Long scripts are split at sentence boundaries and rejoined, so a two-minute description is not cut off at whatever limit a service imposes. A voice cloned from a real person is only ever used with that person’s recorded consent, filed against them in Data Privacy & Consent like any other permission. | designed, not yet built |
| Image Generation Slot | Generated imagery — a model on a background you do not have to shoot, a festival backdrop, a lifestyle scene — as a capability with interchangeable providers rather than a bet on one service: a queue of jobs, a preview while it works, inpainting to fix one region, upscaling and face correction. This one needs a graphics card. Image models cannot run on an ordinary office machine or on the container this system is built in, so what ships is the queue, the review screen and the provider slot, with the generating itself done by whichever engine you point it at — your own GPU box, or a cloud service, swapped without touching anything else. Said plainly here because the alternative is a screen that looks finished and produces nothing. | designed, not yet built |
| Publisher | One push sends the listing, images and copy to the website and every panel, and reports back what went live and what a panel rejected, with the reason. | designed, not yet built |

---

### Module 19 · SEO, AEO & AIO
*Be found by a search box, an answer box and an AI.*

Content already exists once this module is reached; here it is made findable — by a traditional search engine, by the answer box above the results, and by the AI assistants now answering shopping questions directly instead of sending someone to a results page.

**Reads from:** Inventory & Catalog · AI Content Engine
**Writes to:** Marketing

| App | What it does | State |
|---|---|---|
| Technical SEO & Schema | Structured data, sitemaps and page-level technical checks against your own storefront and content pages, so a search engine can read what a page is actually about instead of guessing from the text alone. | designed, not yet built |
| Answer-Engine Optimization | Content shaped to be quoted directly by an answer box or a voice assistant — a clear, citable answer near the top of the page — rather than written only for a person to scroll through. | designed, not yet built |
| AI-Engine Visibility Tracking | Whether and how this business is actually cited when someone asks an AI assistant a shopping question in this category, tracked over time — the same discipline as rank tracking, aimed at a newer kind of result page. | designed, not yet built |

---

### Module 20 · Projects & Collaboration
*The work that is not an order — and the talking around it.*

An exhibition in Hyderabad, a boutique’s custom order, a new godown fit-out, a legal matter with a supplier. Work that is not a sales order still has a deadline, a cost and documents — and it belongs on the same records as everything else.

**Reads from:** CRM · Sales · HR & Payroll · Inventory & Catalog
**Writes to:** Accounting & GST · HR & Payroll · CRM

| App | What it does | State |
|---|---|---|
| Projects & Cases | An exhibition, a custom order for a chain, a fit-out or a dispute — stages you define, owners, deadlines, documents, hours and real cost, all on one record the ledger can see. | designed, not yet built |
| Timesheets & Planning | Who is on what this week and the hours that actually went in — against a project, an exhibition or a machine — with billable and non-billable kept apart. | designed, not yet built |
| Approvals | One queue for everything waiting on a yes: a mill purchase order, a boutique discount, a leave day, a credit note, a payment. The rule that sent it there is next to it, and the decision goes on the record. | designed, not yet built |
| Forum | Questions and answers that outlive a chat — for customers, dealers or staff — with the useful ones kept where the next person will actually find them. | designed, not yet built |
| Automation Studio | The place a person builds “when this happens, do that” by dragging it out and watching it run — a trigger, the steps after it, a branch where the answer decides which way to go — over the same event stream every module already writes to. Marketing’s Automation aims that idea at campaigns; this is the general one, reaching any module: a payment marked short holds the next dispatch and opens a claim, a karigar’s pooled sets crossing a threshold raises the payout for approval, a return marked damaged writes off the piece and messages the buyer. Every run is kept — what fired it, each step, what each step returned — because an automation nobody can inspect afterwards is a rule the business cannot trust with its money. | designed, not yet built |
| Discuss | The conversation attached to the record it is about — this order, this mill bill, this dispute — so a year later the reason for the decision is still sitting beside it. | designed, not yet built |
| Knowledge Base | A searchable internal wiki of standard operating procedures, scoped to the role it applies to, so how a task is meant to be done is written down once instead of carried in one person’s head. | designed, not yet built |

---

### Module 21 · Dashboard & BI
*See the whole house without asking anyone.*

Every number rolls up here as work happens — the day’s marketplace orders, what the karigars finished, what is still lying at the dyer, what the mills are owed. No exports, no waiting for month-end.

**Reads from:** Every module
**Writes to:** —

| App | What it does | State |
|---|---|---|
| **CEO Dashboard** | Cash, sales by channel, stock by design, profit per piece and the alerts that matter — one screen, refreshed as the day runs. | working today |
| **Report Builder** | Drag the fields you want into a report and save it for the whole team. | working today |
| **Group Consolidation** | Ethnic Fashion, Vastrangam and Adini Couture as one set of figures, inter-company transfers removed, so the group position is real rather than three spreadsheets added together. Adini Couture has no registration of its own and mainly does job work — it still counts in the group, without being pulled into a return it does not belong in. Add the fourth company the day you open it. | working today |
| Excel Dashboard Builder | A full workbook — financial summary, HR, purchase, sales, inventory and production, GST, expenses — generated from the live records behind every other screen, with each company shown as its own row and a consolidated row that is a formula over them, never a separately typed total. | designed, not yet built |
| ESG / Sustainability Reporting | Water usage, chemical compliance, waste and packaging, reported from the same certificate and audit records Quality & Compliance already keeps — so a sustainability report is a query over evidence already on file, not a separate exercise assembled once a year from scratch. | designed, not yet built |

---

## Companies and channels — how many is up to you

You have three companies and sell on seven marketplaces. Neither of those is a setting this system
was built around, and neither is a ceiling. A company is a **row**. A channel is a **row**. Every
business record carries the company it belongs to, and every sale carries the channel it came
through. Ten companies selling on ten channels each is the same three tables and the same code as
three and seven.

```
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
```

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

> **This is checked, not claimed.** `core/tests/core.test.js` builds ten companies with ten
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
   limitation, not a passing test.
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
4. **The gap is stated, not buried.** 16 of 104 apps work today. A further 2 have a working,
   tested engine but no screen on it yet, and are counted separately rather than folded in to make
   the first number look larger. The remaining 86 are designed and specified. Those 16 still
   run on their own storage, and rewiring them onto the shared core is the first job of Module 01 —
   until that is done they are good tools, not yet one system.
5. **Uncertainty is surfaced, not smoothed over.** Where something cannot be verified, it is reported
   as unverified rather than presented as fact.

---

*Vastrangam BOS · one business, one brain · 21 modules · 104 apps · one shared data core · 16 working today*
