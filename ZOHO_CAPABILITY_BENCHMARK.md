# Capability benchmark

The 56 products the owner supplied, in his order, and what this
project has against each.

## Read this part first

**56 of the 56 pages were not read.** This environment's egress
proxy refuses every host outside a short allowlist. Measured, not assumed:

| Host | Result |
|---|---|
| `www.zoho.com` | CONNECT refused — 403 at the gateway |
| `zoho.com` | CONNECT refused |
| `www.bigin.com` | CONNECT refused |
| `en.wikipedia.org` | CONNECT refused |
| `api.github.com` | 200 |
| `registry.npmjs.org` | 200 |

The shell and the fetch tool take the same proxy, so there is no route to those pages
from here at all. This is a network policy on the environment, not a missing connector:
nothing can be installed that changes it.

**So each row separates three kinds of statement, and a gate keeps them apart:**

- **Sourced** — the URL and the product name, from the owner’s own message.
- **Derived** — which apps this project names, and the rung each has reached. Read
  from the registers by `checkzoho.js`, never typed.
- **Inferred** — what the other product does. This is recollection, not the page.

`checkzoho.js` refuses any row that states what a page claims without recording the day
somebody read it. That rule is the whole point: an essay about competitors written from
memory and formatted as a comparison table looks exactly like a benchmark and is worth
nothing.

**There is no MUST / SHOULD / FUTURE column.** Ranking what to build next against pages
nobody read would be a priority invented to fill a column. What to build next is in
`BUILD_QUEUE.md`, ordered by what this project can verify about itself.

---

## What the comparison does establish

Our own coverage, which is answered entirely by our own register and survives the
unread pages intact.

| Verdict | Count | Meaning |
|---|---:|---|
| COVERED | 30 | this project names at least one app for it. Whether it matches in DEPTH is unknown and needs the page. |
| NO APP | 20 | this project names none. |
| OUT OF SCOPE | 6 | deliberately not part of this product, with the reason stated. |

Of the 30 covered, **11 have at least one app that is
implemented or tested**. The other 19 are covered on
paper: named in the module register, not standing up.

---

## Every row

| Product | Verdict | This project names | Rung | Why |
|---|---|---|---|---|
| [Books](https://www.zoho.com/in/books/?ireft=nhome&src=all-products-phome) | COVERED | Accounting, Invoicing, Finance Reports, GST & Tax | SPECIFIED | Bookkeeping, invoicing and statutory returns are all named apps here. Not one of the four is built: a posted sale writes its own balanced ledger entry, and nothing reads those entries back as books. |
| [CRM](https://www.zoho.com/en-in/crm/?ireft=nhome&src=all-products-phome) | COVERED | CRM & Customer 360 | TESTED | Lead to won and the lifetime after it, in one record. |
| [Bigin](https://www.bigin.com/en-in/?ireft=nhome&src=all-products-phome) | COVERED | CRM & Customer 360 | TESTED | A smaller packaging of the same capability class. Packaging is a pricing decision, not a second capability. |
| [POS](https://www.zoho.com/en-in/pos/?ireft=nhome&src=all-products-phome) | COVERED | POS | TESTED | Counter billing drawing on the same stock number as every other channel. |
| [Forms](https://www.zoho.com/forms/?ireft=nhome&src=all-products-phome) | COVERED | Forms & Feedback (NPS) | SPECIFIED | Forms are named, tied to the record they are about rather than standing alone. |
| [Bookings](https://www.zoho.com/bookings/?ireft=nhome&src=all-products-phome) | NO APP | — | — | Appointment scheduling against somebody’s availability is named nowhere in the 22 modules. A trade that sells time rather than goods has nothing here. |
| [Campaigns](https://www.zoho.com/campaigns/?ireft=nhome&src=all-products-phome) | COVERED | Campaigns | SPECIFIED | Email campaigns to a list are named in module 17, beside the automation that triggers them and the CRM record the list is drawn from. |
| [Social](https://www.zoho.com/social/?ireft=nhome&src=all-products-phome) | COVERED | Social Calendar, Publisher | SPECIFIED | Scheduling and publishing across social channels are both named. |
| [Marketing Automation](https://www.zoho.com/marketingautomation/?ireft=nhome&src=all-products-phome) | COVERED | Automation, Campaigns | SPECIFIED | Named in module 17 beside the campaigns it automates. |
| [Sites](https://www.zoho.com/sites/?ireft=nhome&src=all-products-phome) | COVERED | Website & Page Builder, Blog & Pages | SPECIFIED | A site builder and the pages it publishes are both named. |
| [LandingPage](https://www.zoho.com/landingpage/?ireft=nhome&src=all-products-phome) | COVERED | Website & Page Builder | SPECIFIED | Maps to the same app as Sites. Whether a landing page needs its own builder — with the split testing that usually justifies one — is a depth question the page would answer and this environment cannot reach. |
| [Commerce](https://www.zoho.com/commerce/?ireft=nhome&src=all-products-phome) | COVERED | Channels & Storefronts, D2C Sales, Catalog / PIM | TESTED | A storefront, its orders and the catalogue behind it are all named, and the orders half runs on the real database. |
| [Vikra Seller](https://www.vikra.com/en-in/seller/) | COVERED | Marketplace OMS, Listing & Catalog Manager | TESTED | Selling through somebody else’s marketplace is module 15’s subject. |
| [Desk](https://www.zoho.com/en-in/desk/?ireft=nhome&src=all-products-phome) | COVERED | Helpdesk & Live Chat, Knowledge Base | TESTED | Tickets tied to the order they are about, and the knowledge base beside them. |
| [SalesIQ](https://www.zoho.com/salesiq/?ireft=nhome&src=all-products-phome) | COVERED | Helpdesk & Live Chat | TESTED | Live chat is named. Website visitor tracking and lead scoring from browsing behaviour are named nowhere, so this is covered at the name and probably not at the depth — which is exactly the distinction the unread pages would settle. |
| [Field Service Management](https://www.zoho.com/fsm/?ireft=nhome&src=all-products-phome) | NO APP | — | — | Dispatching a technician to a site, with the job, the parts and the visit, is named nowhere. A service trade has nothing here. |
| [Lens](https://www.zoho.com/lens/?ireft=nhome&src=all-products-phome) | NO APP | — | — | Remote assistance over a camera. AR / Virtual Try-On is a customer-facing fitting tool and is not the same capability. |
| [Solo](https://www.zoho.com/solo/?ireft=nhome&src=all-products-phome) | OUT OF SCOPE | — | — | A bundle for a one-person business. This product is built around a company being a row and a group being the sum of them; a single-person packaging is a pricing decision, not a capability to build. |
| [Expense](https://www.zoho.com/in/expense/?ireft=nhome&src=all-products-phome) | COVERED | Expenses | SPECIFIED | Claiming, approving and posting a staff expense is named in module 12, and the advance a worker takes against pay is tracked separately in module 16 as a balance beside pay rather than a term inside it. |
| [Payroll](https://www.zoho.com/in/payroll/?ireft=nhome&src=all-products-phome) | COVERED | Staff & Contractors, Payout Execution, Time-off & Advances | SPECIFIED | Module 16 names the roster, the leave and advances beside it, and the payout. |
| [Inventory](https://www.zoho.com/in/inventory/?ireft=nhome&src=all-products-phome) | COVERED | Stock, Catalog / PIM, Kit & Combo SKU | TESTED | One quantity per SKU per location per stage, and it runs on the real database. |
| [ERP](https://www.zoho.com/en-in/erp/?ireft=nhome&src=all-products-phome) | COVERED | Identity, Settings & Audit, Industry Packs | SPECIFIED | The whole-product comparison rather than a capability. What it is really asking is whether one system spans the business, which is what the 22 modules claim and what the requirements registry measures honestly. |
| [Billing](https://www.zoho.com/in/billing/?ireft=nhome&src=all-products-phome) | COVERED | Subscriptions, Invoicing | SPECIFIED | A schedule that raises its own invoice and chases a failed payment is named. |
| [Procurement](https://www.zoho.com/procurement/?ireft=nhome&src=all-products-phome) | COVERED | Procurement, Vendor Management | TESTED | Named in module 07, and both are browser apps today. |
| [Spend](https://www.zoho.com/spend/?ireft=nhome&src=all-products-phome) | COVERED | Expenses, Budget vs Actual, Open-to-Buy / Budget Ceiling | SPECIFIED | Spend against a ceiling is named in three places, including the one that stops a purchase order rather than reporting on it afterwards. |
| [Invoice](https://www.zoho.com/in/invoice/?ireft=nhome&src=all-products-phome) | COVERED | Invoicing | SPECIFIED | Raising an invoice is named in module 12 and shares its numbering, tax setup and ledger posting with every other way this system sells — which is the point of it not being a separate product. |
| [Practice](https://www.zoho.com/practice/?ireft=nhome&src=all-products-phome) | OUT OF SCOPE | — | — | A practice-management tool for an accounting firm handling many clients’ books. This product keeps one business’s own books across its own companies. Serving other people’s books is a different product with a different isolation model. |
| [Checkout](https://www.zoho.com/in/checkout/?ireft=nhome&src=all-products-phome) | NO APP | — | — | A hosted payment page somebody sends a customer to. Orders are named; the checkout that collects the money is not. |
| [Payments](https://www.zoho.com/in/payments/?ireft=nhome&src=all-products-phome) | NO APP | — | — | Payment Data Scope states which systems may ever see a card credential, which is a policy about payments and not a payments product. Taking money is named nowhere, and it is blocked besides: it needs live credentials this repository must never hold. |
| [Connect](https://www.zoho.com/connect/?ireft=nhome&src=all-products-phome) | COVERED | Forum, Discuss | SPECIFIED | An internal place to talk, named twice in module 20. |
| [Vani](https://www.vanihq.com/?ireft=nhome&src=all-products-phome) | NO APP | — | — | Contextual comments left on a document or a page. Documents are filed against the record they belong to; annotating them in place is named nowhere. |
| [TeamInbox](https://www.zoho.com/teaminbox/?ireft=nhome&src=all-products-phome) | NO APP | — | — | A shared mailbox several people answer from. Communications sends outward; nothing here receives into a queue a team works through. |
| [Sheet](https://www.zoho.com/sheet/?ireft=nhome&src=all-products-phome) | NO APP | — | — | A spreadsheet. Excel Dashboard Builder reads workbooks; it is not one. |
| [Show](https://www.zoho.com/show/?ireft=nhome&src=all-products-phome) | NO APP | — | — | Building and presenting slides. Named nowhere in the 22 modules, and nothing here is adjacent to it — the documents this system produces are ledgers, bills and packing slips, which are printed rather than presented. |
| [Office Suite](https://www.zoho.com/officesuite/?ireft=nhome&src=all-products-phome) | OUT OF SCOPE | — | — | A word processor, spreadsheet and presentation tool. This is a system for running a business’s operations, and building an office suite beside it would be the widest possible way to be shallow everywhere. |
| [ToDo](https://www.zoho.com/todo/?ireft=nhome&src=all-products-phome) | NO APP | — | — | A personal task list. Approvals and Projects & Cases are work assigned through a process, which is not the same thing as somebody’s own list. |
| [PDF Editor](https://www.zoho.com/pdfeditor/?ireft=nhome&src=all-products-phome) | NO APP | — | — | Ask & Print produces PDFs and Documents & eSign files them. Editing a PDF that arrived from somewhere else is named nowhere. |
| [People](https://www.zoho.com/people/?ireft=nhome&src=all-products-phome) | COVERED | Staff & Contractors, Time-off & Advances, Appraisal & Hiring | SPECIFIED | The employee record, leave, and appraisal are all named in module 16. |
| [Recruit](https://www.zoho.com/recruit/?ireft=nhome&src=all-products-phome) | COVERED | Recruitment | SPECIFIED | Hiring is named in module 16 as its own app beside the appraisal cycle, so a candidate becomes an employee record rather than being re-entered. |
| [Shifts](https://www.zoho.com/shifts/?ireft=nhome&src=all-products-phome) | NO APP | — | — | Building a rota and publishing it to staff is named nowhere, which is a real hole for a business whose floor runs in shifts — attendance is captured, and the schedule it is measured against is not. |
| [Workerly](https://www.zoho.com/workerly/?ireft=nhome&src=all-products-phome) | OUT OF SCOPE | — | — | For a staffing agency placing temporary workers with client companies. This product employs its own people; placing them elsewhere is a different business. |
| [Vault](https://www.zoho.com/vault/?ireft=nhome&src=all-products-phome) | OUT OF SCOPE | — | — | A password manager, and the one competitor capability this product refuses on purpose. Its standing promise is that it will never ask for a marketplace, bank or account password; storing them would contradict the promise directly. This is a difference to state out loud rather than a gap to close. |
| [Directory](https://www.zoho.com/directory/?ireft=nhome&src=all-products-phome) | COVERED | Identity, Settings & Audit | SPECIFIED | Users, roles and permissions are named. Single sign-on and syncing against an outside identity provider are not, so this is covered at the name and thin under it. |
| [Creator](https://www.zoho.com/en-in/creator/?ireft=nhome&src=all-products-phome) | NO APP | — | — | Building an application without code. The requirements registry carries this as CAP-STUDIO, NOT STARTED: packs configure vocabulary and fields, and let nobody build a screen. |
| [Catalyst](https://catalyst.zoho.com/) | NO APP | — | — | A developer platform to build and host services on. Carried as CAP-DEVPLATFORM, NOT STARTED — the internal API is four routes for two modules, with no versioning, no keys and no webhooks. |
| [ManageEngine SaaS Management](https://www.manageengine.com/saas-management/?ireft=nhome&src=all-products-phome) | OUT OF SCOPE | — | — | Governing which SaaS subscriptions a company’s IT department pays for. That is an IT-department product, not part of running the operations of the business. |
| [Analytics](https://www.zoho.com/analytics/?ireft=nhome&src=all-products-phome) | COVERED | Report Builder, CEO Dashboard | TESTED | Both are named and both open in a browser. Neither queries the database: the registry carries CAP-ANALYTICS as SPECIFIED, and the prototype computes over an in-page store. |
| [DataPrep](https://www.zoho.com/dataprep/?ireft=nhome&src=all-products-phome) | NO APP | — | — | Cleaning and reshaping data before it is analysed. Master-Data Hygiene finds duplicates among customers, vendors and designs; it is not a transformation tool. |
| [Analytics — embedded](https://www.zoho.com/analytics/embedded-solutions.html?ireft=nhome&src=all-products-phome) | NO APP | — | — | Putting somebody else’s dashboards inside your own product under your own brand. That needs the developer platform this project has not started. |
| [Analytics — dashboard builder](https://www.zoho.com/analytics/online-dashboard-builder.html?ireft=nhome&src=all-products-phome) | COVERED | CEO Dashboard, Report Builder, Excel Dashboard Builder | TESTED | Three named apps, two of them browser prototypes today. |
| [Projects](https://www.zoho.com/projects/?ireft=nhome&src=all-products-phome) | COVERED | Projects & Cases, Timesheets & Planning | SPECIFIED | Named in module 20 with the time recorded against them. |
| [Sprints](https://www.zoho.com/sprints/?ireft=nhome&src=all-products-phome) | NO APP | — | — | Agile iteration planning. Projects & Cases is not the same shape and does not claim to be. |
| [BugTracker](https://www.zoho.com/bugtracker/?ireft=nhome&src=all-products-phome) | NO APP | — | — | Tracking defects in software. Quality Control inspects goods, not code. |
| [Digital Adoption Platform](https://www.zoho.com/dap/?ireft=nhome&src=all-products-phome) | NO APP | — | — | In-product walkthroughs teaching people to use the software. Named nowhere, and worth noticing for a system whose users are a shop floor. |
| [Vertical Solutions Studio](https://www.zoho.com/verticalstudio/?ireft=nhome&src=all-products-phome) | NO APP | — | — | Building an industry-specific application on the platform. Industry Packs are the nearest thing and are deliberately narrower — a pack may rename, extend and switch discretionary rules off, and may never invent a concept or carry code. |
| [One](https://www.zoho.com/one/?ireft=nhome&src=all-products-phome) | COVERED | Identity, Settings & Audit | SPECIFIED | The bundle of everything above under one account. Its comparison here is the whole requirements registry, not a single app. |

---

## The one refused on purpose

**Vault** — A password manager, and the one competitor capability this product refuses on purpose. Its standing promise is that it will never ask for a marketplace, bank or account password; storing them would contradict the promise directly. This is a difference to state out loud rather than a gap to close.

Every other OUT OF SCOPE row is a product for a different kind of business. This one
is a capability this project could build and will not, and it is worth saying out
loud rather than leaving in a table: a difference stated is a position, and a
difference buried is a gap.

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

**14 words.** Every technical term this document uses, in plain
language, with an everyday comparison. Nothing here assumes you already know any of them.


### platform

One piece of software that many separate businesses use at the same time, each seeing only its own information.

*Ek badi building jisme bahut saare offices hain. Building ek hai, par har office ki chaabi alag — koi kisi aur ke office mein nahin ghus sakta.*

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

### API

The agreed way two pieces of software talk to each other, so one can ask the other for something and get a predictable answer.

*Waiter. Aap kitchen mein nahin jaate — waiter ko order dete ho, wahi khaana le aata hai. Waiter badal jaaye toh bhi order dene ka tarika wahi rehta hai.*

### queue

A waiting line for work that does not have to finish this second — sending a hundred messages, building a big report.

*Darzi ki dukaan ka parchi system. Kaam parchi pe likh ke lag gaya line mein; customer khada intezaar nahin karta.*

### job

One piece of work taken off the queue and done in the background.

*Line mein se uthayi gayi ek parchi, ab uska kaam ho raha hai.*

### environment

A separate running copy of the system — one for trying things, one that customers actually use.

*Rehearsal aur asli show. Practice alag jagah, taaki galti sabke saamne na ho.*

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

