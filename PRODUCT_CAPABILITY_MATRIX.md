# Product capability matrix

Every one of the 113 apps, under its module, with the rung it has reached
and the 0–5 score that rung translates to.

This is the same measurement as the requirements registry, arranged by where a thing
lives rather than by what proves it. A reader asking "how much of module 12 exists"
gets an answer here in one row of a table; the registry answers "and what proves it"
and carries the evidence.

---

## Module by module

| # | Module | Apps | Tested | Implemented | Specified | Score |
|---|---|---:|---:|---:|---:|---:|
| 01 | Platform | 8 | 2 | 0 | 6 | 1.8 |
| 02 | Design & Sampling | 2 | 0 | 0 | 2 | 1 |
| 03 | Inventory & Catalog | 4 | 1 | 0 | 3 | 1.8 |
| 04 | CRM | 4 | 3 | 0 | 1 | 3.3 |
| 05 | Sales | 8 | 5 | 0 | 3 | 2.9 |
| 06 | Planning & Requirements (MRP) | 3 | 0 | 0 | 3 | 1 |
| 07 | Purchase | 3 | 2 | 0 | 1 | 3 |
| 08 | Manufacturing | 4 | 0 | 0 | 4 | 1 |
| 09 | Quality & Compliance | 2 | 0 | 0 | 2 | 1 |
| 10 | Warehouse | 3 | 0 | 0 | 3 | 1 |
| 11 | Logistics | 5 | 0 | 0 | 5 | 1 |
| 12 | Accounting & GST | 9 | 0 | 0 | 9 | 1 |
| 13 | Treasury & Financial Planning | 3 | 0 | 0 | 3 | 1 |
| 14 | Settlement | 3 | 0 | 0 | 3 | 1 |
| 15 | E-commerce / OMS | 11 | 2 | 0 | 9 | 1.5 |
| 16 | HR & Payroll | 5 | 0 | 0 | 5 | 1 |
| 17 | Marketing | 8 | 0 | 0 | 8 | 1 |
| 18 | AI Content Engine | 8 | 1 | 0 | 7 | 1.4 |
| 19 | SEO, AEO & AIO | 3 | 0 | 0 | 3 | 1 |
| 20 | Projects & Collaboration | 7 | 0 | 0 | 7 | 1 |
| 21 | Dashboard & BI | 5 | 3 | 0 | 2 | 2.8 |
| 22 | AI Assistant, Agents & Automation | 5 | 0 | 0 | 5 | 1 |
| | **All 22** | **113** | **19** | **0** | **94** | **1.5** |

A module scoring 1.0 has nothing standing up in it at all. **14 of the
22 score exactly 1.0** — modules 02, 06, 08, 09, 10, 11, 12, 13, 14, 16, 17, 19, 20, 22. Only
8 modules contain a single thing that runs.

---

## The capabilities that are not apps

| ID | Capability | Rung | Score |
|---|---|---|---:|
| `CAP-ISOLATION` | Tenant isolation in the database | TESTED | 4 |
| `CAP-SCHEMA` | The production schema | TESTED | 4 |
| `CAP-PACKS` | Trade configuration as data | TESTED | 4 |
| `CAP-GROUP` | Multi-company consolidation | TESTED | 4 |
| `CAP-SHELL` | Sign-in, session and the web shell | TESTED | 4 |
| `CAP-CI` | Continuous integration | IMPLEMENTED | 3 |
| `CAP-EVIDENCE` | Verification evidence capture | TESTED | 4 |
| `CAP-DOCS` | Generated, gated documentation | TESTED | 4 |
| `CAP-DEPLOY` | Deployment to a production environment | NOT STARTED | 0 |
| `CAP-MONITOR` | Monitoring, alerting and health checks | SPECIFIED | 1 |
| `CAP-INTEGRATIONS` | Live outside integrations | BLOCKED | 0 |
| `CAP-AI` | AI gateway, agent permissions and evaluation | SPECIFIED | 1 |
| `CAP-ANALYTICS` | Query engine and report builder on real data | SPECIFIED | 1 |
| `CAP-DEVPLATFORM` | Developer platform — public API, webhooks, SDKs | NOT STARTED | 0 |
| `CAP-STUDIO` | Studio — building screens and flows without code | NOT STARTED | 0 |
| `CAP-MARKETPLACE` | Extension marketplace | NOT STARTED | 0 |
| `CAP-MOBILE` | Mobile | SPECIFIED | 1 |
| `CAP-THREATMODEL` | Threat model and adversarial security testing | NOT STARTED | 0 |
| `CAP-SCALE` | Behaviour at production scale | NOT STARTED | 0 |

A matrix of apps alone would never mention that nothing is deployed, no integration is
live, and four product surfaces have not been started. Those are rows here at the same
rung definitions, for that reason.

---

## Every app

### Module 01 · Platform

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Identity, Settings & Audit | SPECIFIED | 1 | — |
| Industry Packs | SPECIFIED | 1 | — |
| Ask & Print | TESTED | 4 | `npm run apps` |
| Communications | SPECIFIED | 1 | — |
| WhatsApp Command Console | SPECIFIED | 1 | — |
| Data Privacy & Consent | SPECIFIED | 1 | — |
| Provider Router & Cost Guard | TESTED | 4 | `npm run selftest` |
| Payment Data Scope | SPECIFIED | 1 | — |

### Module 02 · Design & Sampling

| App | Rung | Score | Proven by |
|---|---|---:|---|
| PLM & Development | SPECIFIED | 1 | — |
| Design / IP Register | SPECIFIED | 1 | — |

### Module 03 · Inventory & Catalog

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Stock | TESTED | 4 | `npm run medhava` |
| Catalog / PIM | SPECIFIED | 1 | — |
| Kit & Combo SKU | SPECIFIED | 1 | — |
| Master-Data Hygiene | SPECIFIED | 1 | — |

### Module 04 · CRM

| App | Rung | Score | Proven by |
|---|---|---:|---|
| CRM & Customer 360 | TESTED | 4 | `npm run apps` |
| Documents & eSign | TESTED | 4 | `npm run apps` |
| Helpdesk & Live Chat | TESTED | 4 | `npm run apps` |
| Forms & Feedback (NPS) | SPECIFIED | 1 | — |

### Module 05 · Sales

| App | Rung | Score | Proven by |
|---|---|---:|---|
| D2C Sales | TESTED | 4 | `npm run medhava` |
| B2B & Credit | TESTED | 4 | `npm run apps` |
| Export | TESTED | 4 | `npm run apps` |
| POS | TESTED | 4 | `npm run apps` |
| Quotes & Proforma | TESTED | 4 | `npm run apps` |
| Couriers & AWB | SPECIFIED | 1 | — |
| Subscriptions | SPECIFIED | 1 | — |
| Customisation & Made-to-Measure | SPECIFIED | 1 | — |

### Module 06 · Planning & Requirements (MRP)

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Demand Forecast & Signal | SPECIFIED | 1 | — |
| Requirement Explosion (MRP run) | SPECIFIED | 1 | — |
| Open-to-Buy / Budget Ceiling | SPECIFIED | 1 | — |

### Module 07 · Purchase

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Procurement | TESTED | 4 | `npm run apps` |
| Vendor Management | TESTED | 4 | `npm run apps` |
| Insurance Register | SPECIFIED | 1 | — |

### Module 08 · Manufacturing

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Production Orders | SPECIFIED | 1 | — |
| Piece-rate & Contractors | SPECIFIED | 1 | — |
| BOM & Consumption | SPECIFIED | 1 | — |
| Maintenance | SPECIFIED | 1 | — |

### Module 09 · Quality & Compliance

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Quality Control | SPECIFIED | 1 | — |
| Certificate & Compliance Register | SPECIFIED | 1 | — |

### Module 10 · Warehouse

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Picking & Bins | SPECIFIED | 1 | — |
| Barcode Operations | SPECIFIED | 1 | — |
| Packing Video | SPECIFIED | 1 | — |

### Module 11 · Logistics

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Rates & Zones | SPECIFIED | 1 | — |
| NDR & RTO Rescue | SPECIFIED | 1 | — |
| COD Remittance | SPECIFIED | 1 | — |
| Handover & Manifest | SPECIFIED | 1 | — |
| Fleet | SPECIFIED | 1 | — |

### Module 12 · Accounting & GST

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Accounting | SPECIFIED | 1 | — |
| Invoicing | SPECIFIED | 1 | — |
| Expenses | SPECIFIED | 1 | — |
| GST & Tax | SPECIFIED | 1 | — |
| ITC Reconciliation | SPECIFIED | 1 | — |
| Receivables, Payables & PDC | SPECIFIED | 1 | — |
| Fixed Assets & Depreciation | SPECIFIED | 1 | — |
| Year-End Close & Period Lock | SPECIFIED | 1 | — |
| Finance Reports | SPECIFIED | 1 | — |

### Module 13 · Treasury & Financial Planning

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Cash Flow Forecast | SPECIFIED | 1 | — |
| Banking & Reconciliation | SPECIFIED | 1 | — |
| Budget vs Actual | SPECIFIED | 1 | — |

### Module 14 · Settlement

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Payout Cycles | SPECIFIED | 1 | — |
| Fee & Commission Audit | SPECIFIED | 1 | — |
| TCS & TDS Register | SPECIFIED | 1 | — |

### Module 15 · E-commerce / OMS

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Marketplace OMS | TESTED | 4 | `npm run apps` |
| Order Management | TESTED | 4 | `npm run apps` |
| Manual Data Check | SPECIFIED | 1 | — |
| Reconciliation | SPECIFIED | 1 | — |
| Claims & Disputes | SPECIFIED | 1 | — |
| Returns / RMA | SPECIFIED | 1 | — |
| Channels & Storefronts | SPECIFIED | 1 | — |
| Labels & Documents | SPECIFIED | 1 | — |
| Listing & Catalog Manager | SPECIFIED | 1 | — |
| Size / Fit Recommendation AI | SPECIFIED | 1 | — |
| AR / Virtual Try-On | SPECIFIED | 1 | — |

### Module 16 · HR & Payroll

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Staff & Contractors | SPECIFIED | 1 | — |
| Time-off & Advances | SPECIFIED | 1 | — |
| Appraisal & Hiring | SPECIFIED | 1 | — |
| Recruitment | SPECIFIED | 1 | — |
| Payout Execution | SPECIFIED | 1 | — |

### Module 17 · Marketing

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Social Calendar | SPECIFIED | 1 | — |
| Campaigns | SPECIFIED | 1 | — |
| Repricing Engine | SPECIFIED | 1 | — |
| Automation | SPECIFIED | 1 | — |
| Blog & Pages | SPECIFIED | 1 | — |
| Events | SPECIFIED | 1 | — |
| Website & Page Builder | SPECIFIED | 1 | — |
| Markdown / Clearance Optimization | SPECIFIED | 1 | — |

### Module 18 · AI Content Engine

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Content Engine | SPECIFIED | 1 | — |
| Image Studio | SPECIFIED | 1 | — |
| Video Studio | SPECIFIED | 1 | — |
| Design Studio | SPECIFIED | 1 | — |
| Motion Renderer | TESTED | 4 | `npm run selftest` |
| Narration Studio | SPECIFIED | 1 | — |
| Image Generation Slot | SPECIFIED | 1 | — |
| Publisher | SPECIFIED | 1 | — |

### Module 19 · SEO, AEO & AIO

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Technical SEO & Schema | SPECIFIED | 1 | — |
| Answer-Engine Optimization | SPECIFIED | 1 | — |
| AI-Engine Visibility Tracking | SPECIFIED | 1 | — |

### Module 20 · Projects & Collaboration

| App | Rung | Score | Proven by |
|---|---|---:|---|
| Projects & Cases | SPECIFIED | 1 | — |
| Timesheets & Planning | SPECIFIED | 1 | — |
| Approvals | SPECIFIED | 1 | — |
| Forum | SPECIFIED | 1 | — |
| Automation Studio | SPECIFIED | 1 | — |
| Discuss | SPECIFIED | 1 | — |
| Knowledge Base | SPECIFIED | 1 | — |

### Module 21 · Dashboard & BI

| App | Rung | Score | Proven by |
|---|---|---:|---|
| CEO Dashboard | TESTED | 4 | `npm run apps` |
| Report Builder | TESTED | 4 | `npm run apps` |
| Group Consolidation | TESTED | 4 | `npm run apps` |
| Excel Dashboard Builder | SPECIFIED | 1 | — |
| ESG / Sustainability Reporting | SPECIFIED | 1 | — |

### Module 22 · AI Assistant, Agents & Automation

| App | Rung | Score | Proven by |
|---|---|---:|---|
| AI Assistant | SPECIFIED | 1 | — |
| AI Chatbot | SPECIFIED | 1 | — |
| AI Agents | SPECIFIED | 1 | — |
| Agent Guardrails & Run Log | SPECIFIED | 1 | — |
| Knowledge & Retrieval | SPECIFIED | 1 | — |


---

## Where every number here comes from

Nothing in this document is typed. It is generated by
`node brand/delivery/website/mkaudit.js` and every figure is read at that moment from
the register that owns it:

| Fact | Register | Gate |
|---|---|---|
| modules and apps | `brand/site/modules.js` | `checkneutral.js`, `checkshape.js` |
| what each has reached | `brand/site/registry.js` | `checkregistry.js` |
| the 0–5 score and the queue | `brand/site/audit.js` | `checkaudit.js` |
| the capability comparison | `brand/site/zoho.js` | `checkzoho.js` |
| rules and their proofs | `brand/site/rules.js` | `checkrules.js` |
| recorded runs | `docs/verification/EVIDENCE.md` | `tools/evidence.js --check` |

A figure in this document that disagrees with its register means the document is stale.
Regenerate it; `npm test` refuses a stale one.

---

## Every technical word above, in plain language

**17 words.** Every technical term this document uses, in plain
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

### industry pack

A settings file that teaches the system your trade — what you call things, the stages your work moves through, the documents you issue.

*Ek hi machine, alag-alag saancha. Saancha badal do, wahi machine doosri cheez banane lagti hai.*

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

### API

The agreed way two pieces of software talk to each other, so one can ask the other for something and get a predictable answer.

*Waiter. Aap kitchen mein nahin jaate — waiter ko order dete ho, wahi khaana le aata hai. Waiter badal jaaye toh bhi order dene ka tarika wahi rehta hai.*

### queue

A waiting line for work that does not have to finish this second — sending a hundred messages, building a big report.

*Darzi ki dukaan ka parchi system. Kaam parchi pe likh ke lag gaya line mein; customer khada intezaar nahin karta.*

### environment

A separate running copy of the system — one for trying things, one that customers actually use.

*Rehearsal aur asli show. Practice alag jagah, taaki galti sabke saamne na ho.*

### deployment

Putting a new version of the software in place so people start using it.

*Nayi dukaan kholna ya purani ko naya roop dena — jab tak shutter nahin uthta, customer ko farq nahin padta.*

### continuous integration

A robot that checks every change automatically, before anyone can put it live.

*Quality-check wala banda gate pe khada. Har maal nikalne se pehle usse guzarta hai.*

### model

The piece of artificial intelligence that reads or writes text, tags a photograph, or answers a question.

*Ek bahut padha-likha assistant. Kaam accha karta hai, par har baat pe usse poochho toh kharcha aur waqt dono lagta hai.*

### provider

A company whose service the system uses — for messages, for payments, for artificial intelligence, for delivery.

*Supplier. Ek supplier maal na de toh doosre se le lo — kaam nahin rukna chahiye.*

### role

What a person is allowed to see and do — a manager sees more than a counter staff member.

*Chaabi ka guccha. Manager ke paas zyada chaabiyaan, staff ke paas kam.*

### permission

One specific thing a role is allowed to do, like approving a discount or viewing salaries.

*Guchhe ki ek chaabi. Ek chaabi ek darwaza.*

