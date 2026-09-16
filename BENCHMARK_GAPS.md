# Where this product is behind

**30 parameters across 11 dimensions. 24 are behind.** This is the list of what is missing, measured rather than felt.

---

## How to read this, and what it is worth

| | |
|---|---:|
| Parameters measured | 30 |
| Behind | **24** |
| Nobody has compared | 3 |
| Ahead, on our own evidence | 3 |
| Cannot be closed by writing code | 6 |
| Sourced claims about other products | 28 |
| Overall score, out of 5 | **1.5** |
| Maturity | **Level 3 — Prototype** |

**The evidence on the two sides is not equally strong, and that is stated rather than
hidden.** Our side is resolved from the requirements registry at the moment this page
was generated — it cannot be typed and cannot flatter. The other side comes from **web
searches run on 2026-09-13**, each carrying the address it came from. That is
thinner: a search result is not the vendor’s page, some of them are third-party review
sites, and any of it can be out of date. Where nothing was found, the parameter says
**UNMEASURED** instead of guessing.

There are no estimated percentages anywhere in this document.

---

## The eleven dimensions

| # | Dimension | Behind |
|---:|---|---:|
| 1 | Data and correctness | 0 of 3 |
| 2 | Depth inside an area | 3 of 3 |
| 3 | Functional coverage | 1 of 1 |
| 4 | Deployment and operability | 3 of 4 |
| 5 | Scale and performance | 1 of 1 |
| 6 | Security and compliance | 2 of 2 |
| 7 | Integrations | 4 of 4 |
| 8 | Platform and extensibility | 3 of 3 |
| 9 | AI | 4 of 4 |
| 10 | Mobile and offline | 1 of 2 |
| 11 | Commercial readiness | 2 of 3 |

They are in that order on purpose. The ones that decide whether the software can be
*used* come before the ones that decide whether it *looks* complete on a comparison
table — an app list is cheap to lengthen and expensive to make true.

---

## 1 · Data and correctness

Whether the numbers can be trusted. Everything else is decoration if one company can read another's rows or money drifts by a paisa a thousand times.

### One company cannot read another company’s rows

**AHEAD** · our rung: **TESTED** · from `CAP-ISOLATION` TESTED, recorded run `V-SCHEMA`

No gap found. This is proven against a real Postgres with the application connecting as a restricted role — and it only proves anything because the role is neither superuser nor table owner, or every policy would be inert and the test would pass while checking nothing.

### Money is exact, not floating point

**UNMEASURED** · our rung: **TESTED** · from `CAP-SCHEMA` TESTED, recorded run `V-SCHEMA`

Ours is integer paise and the schema test refuses a float money column. What any of the three comparison products do internally is not something a marketing page states, so nobody has compared this and this row does not pretend otherwise.

### Every change leaves an append-only trail

**UNMEASURED** · our rung: **TESTED** · from `CAP-SCHEMA` TESTED

The audit table and the effective-dated tenant log exist in the schema. Whether they are written on every path that changes a business record has not been tested end to end, and no competitor page was found stating their equivalent.

**What closes it** *(size M)* — A test that mutates through every write path and asserts the trail caught each one, rather than trusting that each caller remembered.

---

## 2 · Depth inside an area

Not whether a screen exists but whether it handles the day: partial receipts, returns, corrections, approvals, the awkward cases that are most of real work.

### A business can run one real working day end to end

**BEHIND** · our rung: **TESTED** · from `CAP-SCHEMA` TESTED, recorded run `V-DAY`

Three of the five steps run and compose on the real database — buy, receive, sell — proven together rather than module by module. The two that do not are MAKE and SHIP: module 08 Manufacturing and module 11 Logistics are specified and unbuilt, so no business could run its actual day here.

| Product | What its pages say | Source |
|---|---|---|
| Zoho Inventory | Presents end-to-end inventory management across sales, purchases, warehouses and fulfilment as shipping product features. | https://www.zoho.com/us/inventory/features/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size L)* — Build module 08 so a production order consumes what was bought, then module 11 so a shipment carries away what was sold, then extend the working-day test from three steps to five.

### Partial and short receipts against a purchase order

**BEHIND** · our rung: **TESTED** · from `CAP-SCHEMA` TESTED, recorded run `V-DAY`

A short delivery is handled — the working-day test orders 60 and receives 40, with the two numbers deliberately different so a module using the wrong one has nowhere to hide. Batch and expiry tracking, picklists and warehouse-to-warehouse transfer are named on the comparison side and are not built here.

| Product | What its pages say | Source |
|---|---|---|
| Zoho Inventory | Picklists for warehouse pickers, stock transfers between warehouses, batch and expiry tracking with unique identifier codes, and low-stock notifications. | https://www.zoho.com/us/inventory/warehouse-inventory-management/ |
| Unicommerce | Inventory tracking with real-time synchronisation and multi-location warehouse management, updating a marketplace automatically when an item goes out of stock. | https://unicommerce.com/inventory-management-system/ |
| EasyEcom | Inventory modules covering multi-location sync and forecasting, alongside warehouse inward, storage and fulfilment. | https://easyecom.io/whatsnew-category/inventory |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size L)* — Batch/lot and expiry as first-class columns with a test that refuses to issue expired stock, then picklists, then inter-warehouse transfer as a stock move that balances.

### Returns, and the money that comes back with them

**BEHIND** · our rung: **NOT STARTED** · from No returns app is above SPECIFIED.

Returns are specified and unbuilt. For a seller on several marketplaces this is not an edge case — it is a daily flow where stock comes back, a credit note is due, and the marketplace settlement has already deducted something.

| Product | What its pages say | Source |
|---|---|---|
| Unicommerce | A centralised panel to manage account reconciliation for marketplace returns and inventory against all returns. | https://unicommerce.com/ecommerce-returns-management/ |
| EasyEcom | Payment, inventory and return reconciliation across all marketplaces. | https://www.easyecom.io/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size M)* — A return that reverses the stock move and raises the credit note in one transaction, with a test asserting the ledger and the warehouse still agree afterwards.

*Comes after: A business can run one real working day end to end*

---

## 3 · Functional coverage

Whether an app exists for an area at all. The cheapest dimension to score well on and the easiest to mistake for progress.

### An app exists for each area a suite is expected to cover

**BEHIND** · our rung: **TESTED** · from `CAP-DOCS` TESTED

The coverage register reports 30 areas where an app is named, 20 with none at all, and 6 deliberately out of scope — but of the 30 named, only 11 have any app above SPECIFIED. Coverage on paper is 60%; coverage that stands up is 22%.

| Product | What its pages say | Source |
|---|---|---|
| Zoho | Presents a suite of many separate products with a shared developer platform and marketplace behind them. | https://www.zoho.com/developer/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size L)* — Not by adding app names. The honest move is to raise the 30 already named before naming more, which is what the parity plan orders.

---

## 4 · Deployment and operability

Whether it runs somewhere a business can reach, stays there, and tells somebody when it stops. Nothing here is a feature and all of it is the difference between software and a repository.

### Deployed anywhere a business can reach

**BEHIND** · our rung: **NOT STARTED** · from `CAP-DEPLOY` NOT STARTED

Nothing has ever been deployed anywhere. This is the single largest gap in the whole register and it is why the requirements gate refuses to let any row reach VERIFIED or PRODUCTION-READY: neither can be earned from inside a repository that has never been checked from outside itself.

| Product | What its pages say | Source |
|---|---|---|
| Zoho | A 99.9% uptime SLA backed by owned data-centre infrastructure. | https://www.zoho.com/creator/evaluation-guide/secure.html |

*Found by search on 2026-09-13. Not read from the page — see above.*

**Cannot be closed by writing code.** A rented machine, a domain and credentials. None of the three can be obtained by any AI, and DEPLOYMENT.md is the runbook that has never been followed by anybody, so expect it to be wrong in small ways the first time.

### A backup that somebody has actually restored

**BEHIND** · our rung: **SPECIFIED** · from `CAP-MONITOR` SPECIFIED

No backup has been taken and none restored. A backup nobody has restored is not a backup, it is a hope with a filename.

**Behind what:** Ordinary operational practice, not a competitor: a backup that has never been restored has not been shown to be readable, and the first time anybody finds out is the day they need it.

**Cannot be closed by writing code.** Follows the first deployment — there is nothing to back up until something runs.

*Comes after: Deployed anywhere a business can reach*

### An alert reaches somebody before a customer notices

**BEHIND** · our rung: **SPECIFIED** · from `CAP-MONITOR` SPECIFIED

Monitoring is specified. There is no health check answering anywhere, no uptime checker pointed at it, and no alert has ever fired — so the honest uptime figure for this product is not 0%, it is undefined.

| Product | What its pages say | Source |
|---|---|---|
| Zoho | A 99.9% uptime SLA backed by owned data-centre infrastructure. | https://www.zoho.com/creator/evaluation-guide/secure.html |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size S)* — The health endpoint, an external uptime checker, and one deliberate outage to prove the alert arrives.

*Comes after: Deployed anywhere a business can reach*

### Every change is gated before it lands

**AHEAD** · our rung: **IMPLEMENTED** · from `CAP-CI` IMPLEMENTED, recorded run `V-FULL2`

No gap found on our side, and nothing comparable was sourced. Every push runs the full suite plus a browser clickthrough of every app page, and a claim cannot reach TESTED in the registry without a recorded run to point at.

---

## 5 · Scale and performance

How it behaves at a volume nobody has tried. Cheap to ignore until the first month-end when it matters at once.

### Behaviour at a volume nobody has tried

**BEHIND** · our rung: **NOT STARTED** · from `CAP-SCALE` NOT STARTED

Not started. The largest test posts across a 10 × 10 company-channel grid and then 11 × 11 with no code changed, which proves the SHAPE has no ceiling — it says nothing about a million order lines, a month-end report, or twenty people using it at once.

| Product | What its pages say | Source |
|---|---|---|
| Unicommerce | Positions itself as India’s leading e-commerce enablement SaaS platform for order, warehouse and multi-channel inventory operations. | https://unicommerce.com/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size M)* — Generate a year of plausible volume, then measure: the slowest query, the report that times out, and the first thing that locks. Record the numbers so the next run can be compared to them.

*Comes after: A business can run one real working day end to end*

---

## 6 · Security and compliance

Whether anybody has attacked it on purpose, and whether an enterprise buyer's procurement form can be answered at all.

### Somebody has attacked it on purpose

**BEHIND** · our rung: **NOT STARTED** · from `CAP-THREATMODEL` NOT STARTED

Not started. Isolation is proven against an honest caller; nobody has written down who the attacker is and then tried to be them. A policy that holds for correct code says little about one that is being probed.

**Behind what:** Ordinary security practice, not a competitor: a system holding several companies’ money and staff data is expected to have been probed by somebody trying to break it, and this one never has.

**What closes it** *(size M)* — Name the attacker — a signed-in user of another company, a staff account with the wrong role, a stolen session — then write a test per attacker that tries and must fail.

### Certifications an enterprise buyer asks for

**BEHIND** · our rung: **NOT STARTED** · from No certification has been sought and none could be, for software that has never been deployed.

Nothing, against a documented wall of certifications. This is the gap that cannot be closed by writing code: certification audits an operating organisation, not a repository, and they take money and elapsed months.

| Product | What its pages say | Source |
|---|---|---|
| Zoho | ISO 27001, ISO 27017 and ISO 27018 certified, and SOC 2 Type II across Security, Confidentiality, Processing Integrity, Availability and Privacy, with audits conducted annually. | https://www.zoho.com/compliance.html |
| Zoho | GDPR compliance stated from 25 May 2018, with ISO/IEC 27701 named as the privacy-management extension to 27001. | https://www.zoho.com/creator/evaluation-guide/secure.html |

*Found by search on 2026-09-13. Not read from the page — see above.*

**Cannot be closed by writing code.** A deployed system, an operating company behind it, an auditor, and a budget. Worth starting only when there is a customer who is asking for it.

*Comes after: Deployed anywhere a business can reach*

---

## 7 · Integrations

Marketplaces, couriers, tax portals, banks, payment providers. The dimension where the Indian marketplace-operations products set the bar, not Zoho.

### Live marketplace and cart connections

**BEHIND** · our rung: **BLOCKED** · from `CAP-INTEGRATIONS` BLOCKED

Zero live connections, and the registry marks this BLOCKED rather than unbuilt for a reason that will not change: every marketplace, courier, tax portal and bank feed needs live credentials, and this repository must never hold one.

| Product | What its pages say | Source |
|---|---|---|
| Unicommerce | Support for 160+ integrations across marketplaces, carts, logistics partners and ERP/PoS, naming Amazon, Shopify, Flipkart, Meesho, FirstCry, JioMart, AJIO, a hosted storefront platform and a self-hosted storefront platform among them. | https://unicommerce.com/integrations/marketplace-cart-integration/ |
| EasyEcom | Multi sales-channel integration in one place with real-time inventory synchronisation across all channels. | https://www.easyecom.io/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**Cannot be closed by writing code.** Seller accounts and API credentials for each marketplace, held by the business and entered at runtime — never committed. The code that uses them can be built and tested against recorded responses before any credential exists.

### Courier allocation and tracking

**BEHIND** · our rung: **NOT STARTED** · from Module 11 Logistics is specified and unbuilt.

Nothing. Automatic failover to a second courier when the first errors is a concrete bar stated on the comparison side, and it is the kind of behaviour that only exists if it was designed in rather than added later.

| Product | What its pages say | Source |
|---|---|---|
| Unicommerce | End-to-end logistics management automating courier allocation through to returns, with delivery to 19,000+ pincodes and automatic switching to the next logistics partner on error. | https://unicommerce.com/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size M)* — Courier as data rather than code — the same pattern as the trade packs — with allocation rules and a recorded-response test for failover.

*Comes after: A business can run one real working day end to end*

### Bank feeds, and matching them to the books

**BEHIND** · our rung: **BLOCKED** · from `CAP-INTEGRATIONS` BLOCKED

Banking and reconciliation are specified and unbuilt, and the feed half of it is blocked rather than merely undone: an automatic bank feed is the bank’s own credentialed connection or an aggregator’s, and this repository must hold neither. The matching half — comparing a statement to the ledger and reporting what does not agree — is ordinary work that needs no credential at all.

| Product | What its pages say | Source |
|---|---|---|
| Zoho Books | Bank and credit-card accounts connected to import transactions automatically through third-party providers, categorise them, eliminate duplicate statement rows and reconcile for month-end close. | https://www.zoho.com/us/books/accounting-software/bank-reconciliation/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size M)* — Build the matching against an imported statement file first, which needs nobody’s permission and is where the value is; leave the live feed until there is a deployed system and a business willing to connect its bank to it.

*Comes after: A business can run one real working day end to end*

### Marketplace settlement reconciliation

**BEHIND** · our rung: **NOT STARTED** · from No settlement app is above SPECIFIED.

Nothing built. For a seller across several marketplaces this is where the money actually leaks — wrong deductions and unpaid orders that nobody catches because nothing compares the settlement file to the invoice.

| Product | What its pages say | Source |
|---|---|---|
| EasyEcom | Automated payment reconciliation to track and prevent unpaid orders, extra shipping costs and wrong deductions. | https://www.easyecom.io/ |
| Unicommerce | UniReco aligns marketplace settlements with invoices for GST compliance, and accounting integration with Tally and Busy. | https://unicommerce.com/integrations/accounting-integration/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size M)* — Import a settlement file, match it to orders, and report what does not reconcile. The reporting-what-failed half matters more than the matching half.

*Comes after: Live marketplace and cart connections*

---

## 8 · Platform and extensibility

Whether somebody outside this project can build on it — a public API, webhooks, SDKs, a way to make a screen without code, a place to publish an extension.

### A public API with versioning, keys and rate limits

**BEHIND** · our rung: **NOT STARTED** · from `CAP-DEVPLATFORM` NOT STARTED

Not started. Sign-in, sessions and company switching work, but there is no surface anything outside this project could call — no versioning, no keys, no rate limits, no webhooks out.

| Product | What its pages say | Source |
|---|---|---|
| Zoho | Documented webhooks and functions exposed as REST APIs on the developer platform. | https://www.zoho.com/developer/help/extensions/automation/webhooks.html |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size L)* — Build it as its own slice with the same gates as everything else, and decide the sign-on model BEFORE the mobile app, because changing it afterwards means reissuing every credential.

*Comes after: A business can run one real working day end to end*

### Building a screen or flow without code

**BEHIND** · our rung: **NOT STARTED** · from `CAP-STUDIO` NOT STARTED

Not started. The trade packs already make a great deal configurable as data rather than code, which is the foundation this would build on, but there is no screen a person could use to do it.

| Product | What its pages say | Source |
|---|---|---|
| Zoho Creator | A low-code application platform with drag-and-drop builders for web and mobile applications, workflows and business rules. | https://www.zoho.com/developer/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size L)* — Deliberately late. A studio over an unstable schema builds a second system beside the first, and the schema is not stable until the working day is.

*Comes after: A public API with versioning, keys and rate limits*

### A marketplace where others publish extensions

**BEHIND** · our rung: **NOT STARTED** · from `CAP-MARKETPLACE` NOT STARTED

Not started, and correctly last. A marketplace with no third-party developers is an empty shop, and there are none until the public API exists and somebody outside this project has a reason to use it.

| Product | What its pages say | Source |
|---|---|---|
| Zoho | Sigma as an extension development platform and Zoho Marketplace as the store where extensions are published. | https://www.zoho.com/developer/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size L)* — Not scheduled. Revisit when the API has users who are not us.

*Comes after: A public API with versioning, keys and rate limits*

---

## 9 · AI

The weakest dimension here by a distance, and the one where shipping early does the most damage: an assistant that is confidently wrong about stock or wages is worse than no assistant.

### A model provider that fails over and cannot overspend

**BEHIND** · our rung: **NOT STARTED** · from brand/suite/router.js runs its own self-test, but CAP-AI is SPECIFIED and the router is not wired into the product.

The one AI piece that runs. Provider fallback, a circuit breaker and a spend ceiling are implemented and self-tested — and none of it is connected to the product, so no screen can call a model today.

| Product | What its pages say | Source |
|---|---|---|
| Zoho Zia | A proprietary AI engine integrated natively across more than 55 Zoho applications. | https://www.zoho.com/zia/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size S)* — Wire the router behind a gateway the application calls, so there is one place where spend, fallback and refusal are enforced rather than one per caller.

### A way to tell whether an answer was right

**BEHIND** · our rung: **SPECIFIED** · from `CAP-AI` SPECIFIED

There is no evaluation set. This is the row that governs every other AI row: without a fixed set of questions with known-correct answers, no quality claim about anything the system says can be made, defended, or noticed getting worse.

| Product | What its pages say | Source |
|---|---|---|
| Zoho Zia | Predictive analytics, lead scoring, anomaly detection, sentiment analysis and image recognition presented as shipping capabilities. | https://www.zoho.com/zia/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size M)* — Fifty questions a real user would ask about their own data, each with the answer computed from the database, run on every change like any other test.

### What an agent is allowed to do on a company’s data

**BEHIND** · our rung: **SPECIFIED** · from `CAP-AI` SPECIFIED

No permission model exists. An agent that can act needs narrower limits than the person who invoked it, not the same ones, and the isolation policies in the database answer a different question — which company, not which action.

| Product | What its pages say | Source |
|---|---|---|
| Zoho Zia | An Agent Studio for building agents that take real actions across Zoho apps — retrieving records, creating tasks, analysing documents. | https://www.zoho.com/zia/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size M)* — Agent permissions as their own layer, defaulting to read-only, with every action it takes written to a run log a person can read afterwards.

*Comes after: A model provider that fails over and cannot overspend*

### A chatbot that answers from the business’s own data

**BEHIND** · our rung: **SPECIFIED** · from `APP-22-02` SPECIFIED

Specified, nothing built. It is also the row most likely to be built too early: a chatbot demonstrates well on day one and is the fastest way to put a confident wrong answer about stock or wages in front of a worker.

| Product | What its pages say | Source |
|---|---|---|
| Zoho Desk | An Answer Bot using the knowledge base to respond across website and messaging channels, with generative replies. | https://www.zoho.com/desk/zia.html |
| Zoho Zia | Three layers described: assist (summaries, suggestions), deflection (customer-facing answer bots) and autonomous (AI agents). | https://www.zoho.com/zia/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**What closes it** *(size M)* — After the evaluation set and the permission model, not before. The order is the recommendation.

*Comes after: A way to tell whether an answer was right · What an agent is allowed to do on a company’s data*

---

## 10 · Mobile and offline

The work that happens away from a desk — attendance, production, receiving — and what happens to it when there is no signal.

### A phone app at all

**BEHIND** · our rung: **SPECIFIED** · from `CAP-MOBILE` SPECIFIED

There is no mobile code in this project at all. It also needs accounts no AI can hold — Apple and Google developer accounts, both paid and both requiring identity verification that takes days and blocks release.

| Product | What its pages say | Source |
|---|---|---|
| Zoho Inventory | Android and iOS apps, with the phone camera usable as a barcode scanner to look up item and stock details. | https://www.zoho.com/us/inventory/mobile-apps/ |

*Found by search on 2026-09-13. Not read from the page — see above.*

**Cannot be closed by writing code.** Apple and Google developer accounts. Start the verification early because it is slow; the code can be built against the shared API meanwhile.

*Comes after: A public API with versioning, keys and rate limits*

### Work captured with no signal, reconciled later

**UNMEASURED** · our rung: **SPECIFIED** · from `CAP-MOBILE` SPECIFIED

Nothing built here. On the comparison side this was searched for specifically and the result stated plainly that offline behaviour was not described in what it found — so their side is unmeasured rather than assumed absent, which would have been the convenient reading.

**What closes it** *(size M)* — The hard part is not caching, it is deciding who wins when two people changed the same thing offline. That is a business rule and must be written down before any code.

*Comes after: A phone app at all*

---

## 11 · Commercial readiness

Pricing, support, an SLA, documentation, onboarding, and getting a business's existing data in. None of it is code and all of it decides whether anyone adopts it.

### Getting an existing business’s data in

**BEHIND** · our rung: **TESTED** · from `CAP-PACKS` TESTED, recorded run `V-PACKS`

Trade configuration loads from packs and the payroll engine reads real workbooks, so the pieces exist — but there is no migration path a business could follow to bring its ledger, its stock and its history across, and adoption dies at exactly that step.

**Behind what:** Ordinary adoption practice, not a competitor: any business considering a new system already has years of items, stock and balances somewhere, and a product with no way to bring them across is one nobody can switch to.

**What closes it** *(size M)* — An importer for the three things every business already has in a spreadsheet: items, opening stock, and opening balances — each rejecting a bad row by name rather than failing the file.

*Comes after: A business can run one real working day end to end*

### Documentation a person can actually follow

**AHEAD** · our rung: **TESTED** · from `CAP-DOCS` TESTED, recorded run `V-COVERAGE`

No gap found. Every delivered document is generated from a register and gated: a count cannot be typed, a command quoted in a runbook must resolve, and a document may not use a technical term it never explains. Nothing comparable was sourced, so this is AHEAD only on our own evidence.

### Support, an SLA, and somebody to call

**BEHIND** · our rung: **NOT STARTED** · from There is no support function, because there is no running system and no customer.

Nothing exists. Not a defect — it is what it means to be pre-deployment — but it belongs on the list because it is a real reason a buyer says no, and no amount of software closes it.

| Product | What its pages say | Source |
|---|---|---|
| Zoho | A 99.9% uptime SLA backed by owned data-centre infrastructure. | https://www.zoho.com/creator/evaluation-guide/secure.html |

*Found by search on 2026-09-13. Not read from the page — see above.*

**Cannot be closed by writing code.** Follows a first customer. Not work to schedule now.

*Comes after: Deployed anywhere a business can reach*

---

## And the coverage question, which is separate

The parameters above measure DEPTH. Coverage — whether an app is named for an area at
all — is a different question with its own register, and it answers:

**30 areas with an app named · 20 with none · 6 deliberately out of scope.**

Those verdicts are answered entirely from our own register and need nobody else’s
page, which is why they survive intact. The areas with no app at all:

- Bookings
- Field Service Management
- Lens
- Checkout
- Payments
- Vani
- TeamInbox
- Sheet
- Show
- ToDo
- PDF Editor
- Shifts
- Creator
- Catalyst
- DataPrep
- Analytics — embedded
- Sprints
- BugTracker
- Digital Adoption Platform
- Vertical Solutions Studio

---

## Every technical word above, in plain language

**21 words.** Every technical term this document uses, in plain
language, with an everyday comparison. Nothing here assumes you already know any of them.


### platform

One piece of software that many separate businesses use at the same time, each seeing only its own information.

*Ek badi building jisme bahut saare offices hain. Building ek hai, par har office ki chaabi alag — koi kisi aur ke office mein nahin ghus sakta.*

### tenant

One business using the platform. Its people, its data and its settings are its own.

*Us building mein ek office. Aapka office, aapka saamaan, aapka taala.*

### module

One area of work in the system — sales, purchase, staff, accounts. Each is a set of screens that belong together.

*Dukaan ke alag-alag counters. Ek counter bikri ka, ek kharidi ka, ek hisaab-kitaab ka.*

### database

Where all the information is kept, arranged so any of it can be found instantly and nothing gets lost.

*Ek badi almari jisme har cheez apne fix khaane mein rakhi hai — dhoondhne ke liye poori almari palatni nahin padti.*

### table

One kind of information inside the database — all your customers in one, all your orders in another.

*Almari ka ek khaana. Ek khaane mein sirf customers, doosre mein sirf orders.*

### row

One single record — one customer, one order, one payment.

*Register mein ek line. Ek line matlab ek entry.*

### schema

The written plan of what information the system keeps and how the pieces connect.

*Makaan ka naksha. Deewar uthane se pehle kaagaz pe tay hota hai kaunsa kamra kahaan hai.*

### migration

A recorded change to the shape of the database, so every copy of the system can be updated the same way, in the same order.

*Naksha badla toh likh ke rakha — taaki har site pe wahi badlav, usi tarike se ho.*

### backup

A copy of everything, kept somewhere else, so a mistake or a failure does not lose your work.

*Zaroori kaagzaat ki photocopy, doosri jagah rakhi hui. Asli jal jaaye toh bhi kaam nahin rukta.*

### integer paise

Money stored as a whole number of paise instead of a decimal, so amounts are exact and rounding can never quietly lose a rupee.

*Paisa hamesha poore paise mein ginte hain, aadha-adhoora kabhi nahin — isliye hisaab kabhi ek rupya idhar-udhar nahin hota.*

### API

The agreed way two pieces of software talk to each other, so one can ask the other for something and get a predictable answer.

*Waiter. Aap kitchen mein nahin jaate — waiter ko order dete ho, wahi khaana le aata hai. Waiter badal jaaye toh bhi order dene ka tarika wahi rehta hai.*

### storage

Where files are kept — photographs, invoices, scanned documents. Different from the database, which keeps information rather than files.

*Almari ke bagal wala godown. Register almari mein, par bade dabbe aur photo godown mein.*

### deployment

Putting a new version of the software in place so people start using it.

*Nayi dukaan kholna ya purani ko naya roop dena — jab tak shutter nahin uthta, customer ko farq nahin padta.*

### uptime

How much of the time the system is actually working and reachable.

*Dukaan mahine mein kitne din khuli rahi. Band rahi toh customer wapas chala gaya.*

### model

The piece of artificial intelligence that reads or writes text, tags a photograph, or answers a question.

*Ek bahut padha-likha assistant. Kaam accha karta hai, par har baat pe usse poochho toh kharcha aur waqt dono lagta hai.*

### provider

A company whose service the system uses — for messages, for payments, for artificial intelligence, for delivery.

*Supplier. Ek supplier maal na de toh doosre se le lo — kaam nahin rukna chahiye.*

### fallback

The next option the system automatically moves to when the first one fails or is unavailable.

*Bijli gayi toh inverter. Inverter gaya toh mombatti. Andhera kabhi nahin hota.*

### spend ceiling

A maximum amount the system is allowed to spend on paid services, after which it refuses to spend more instead of warning you.

*Jeb mein utne hi paise leke nikle jitna kharch karna hai. Khatam matlab khatam — udhaar nahin.*

### circuit breaker

A switch that takes a repeatedly failing service out of use for a while, instead of retrying it endlessly and slowing everything down.

*Ghar ka MCB. Baar-baar fault aa raha hai toh woh line hi kaat deta hai, poora ghar band nahin hota.*

### role

What a person is allowed to see and do — a manager sees more than a counter staff member.

*Chaabi ka guccha. Manager ke paas zyada chaabiyaan, staff ke paas kam.*

### permission

One specific thing a role is allowed to do, like approving a discount or viewing salaries.

*Guchhe ki ek chaabi. Ek chaabi ek darwaza.*

