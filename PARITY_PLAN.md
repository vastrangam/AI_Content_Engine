# The plan to close the gaps

Ordered so it can be worked from the top. Every prerequisite that is **work** sits
above the item that needs it — checked, not asserted: `checkbenchmark.js` fails the
build if a dependency points forwards.

**3 of these items do not wait on work at all — they wait on a
blocker**, which is something only the owner can supply. They are left in position
rather than moved to the end, because their place in the order is still right; what
changes is that no amount of work below them unblocks them. Each says so in its row.

---

## The decision this order rests on

**Depth in one trade before breadth across many.** The alternative was to fill the
areas with no app at all, which makes a comparison table look better sooner. It was
rejected for a measurable reason: of the areas where an app is already named, only a
third have anything above SPECIFIED. Adding names would pile shallow coverage on
shallow coverage.

It is also the only place a product this size can win. Nobody out-builds a fifty-app
suite on breadth. What a suite of separate apps does badly is exactly what a single
data core does well — a piece-rate, a marketplace settlement and the ledger being the
same rows rather than three apps synced nightly.

---

## The work, in order — 19 items

| # | Item | Size | Comes after |
|---:|---|:---:|---|
| 1 | Every change leaves an append-only trail | M | — |
| 2 | A business can run one real working day end to end | L | — |
| 3 | Partial and short receipts against a purchase order | L | — |
| 4 | Returns, and the money that comes back with them | M | #2 |
| 5 | An app exists for each area a suite is expected to cover | L | — |
| 6 | An alert reaches somebody before a customer notices | S | **blocked:** Deployed anywhere a business can reach |
| 7 | Behaviour at a volume nobody has tried | M | #2 |
| 8 | Somebody has attacked it on purpose | M | — |
| 9 | Courier allocation and tracking | M | #2 |
| 10 | Marketplace settlement reconciliation | M | **blocked:** Live marketplace and cart connections |
| 11 | A public API with versioning, keys and rate limits | L | #2 |
| 12 | Building a screen or flow without code | L | #11 |
| 13 | A marketplace where others publish extensions | L | #11 |
| 14 | A model provider that fails over and cannot overspend | S | — |
| 15 | A way to tell whether an answer was right | M | — |
| 16 | What an agent is allowed to do on a company’s data | M | #14 |
| 17 | A chatbot that answers from the business’s own data | M | #15, #16 |
| 18 | Work captured with no signal, reconciled later | M | **blocked:** A phone app at all |
| 19 | Getting an existing business’s data in | M | #2 |

### 1. Every change leaves an append-only trail

*Data and correctness · size M · our rung today: TESTED*

A test that mutates through every write path and asserts the trail caught each one, rather than trusting that each caller remembered.

### 2. A business can run one real working day end to end

*Depth inside an area · size L · our rung today: TESTED*

Build module 08 so a production order consumes what was bought, then module 11 so a shipment carries away what was sold, then extend the working-day test from three steps to five.

### 3. Partial and short receipts against a purchase order

*Depth inside an area · size L · our rung today: TESTED*

Batch/lot and expiry as first-class columns with a test that refuses to issue expired stock, then picklists, then inter-warehouse transfer as a stock move that balances.

### 4. Returns, and the money that comes back with them

*Depth inside an area · size M · our rung today: NOT STARTED*

A return that reverses the stock move and raises the credit note in one transaction, with a test asserting the ledger and the warehouse still agree afterwards.

Comes after #2.

### 5. An app exists for each area a suite is expected to cover

*Functional coverage · size L · our rung today: TESTED*

Not by adding app names. The honest move is to raise the 30 already named before naming more, which is what the parity plan orders.

### 6. An alert reaches somebody before a customer notices

*Deployment and operability · size S · our rung today: SPECIFIED*

The health endpoint, an external uptime checker, and one deliberate outage to prove the alert arrives.

Comes after **blocked:** Deployed anywhere a business can reach. Work below this item does not unblock it.

### 7. Behaviour at a volume nobody has tried

*Scale and performance · size M · our rung today: NOT STARTED*

Generate a year of plausible volume, then measure: the slowest query, the report that times out, and the first thing that locks. Record the numbers so the next run can be compared to them.

Comes after #2.

### 8. Somebody has attacked it on purpose

*Security and compliance · size M · our rung today: NOT STARTED*

Name the attacker — a signed-in user of another company, a staff account with the wrong role, a stolen session — then write a test per attacker that tries and must fail.

### 9. Courier allocation and tracking

*Integrations · size M · our rung today: NOT STARTED*

Courier as data rather than code — the same pattern as the trade packs — with allocation rules and a recorded-response test for failover.

Comes after #2.

### 10. Marketplace settlement reconciliation

*Integrations · size M · our rung today: NOT STARTED*

Import a settlement file, match it to orders, and report what does not reconcile. The reporting-what-failed half matters more than the matching half.

Comes after **blocked:** Live marketplace and cart connections. Work below this item does not unblock it.

### 11. A public API with versioning, keys and rate limits

*Platform and extensibility · size L · our rung today: NOT STARTED*

Build it as its own slice with the same gates as everything else, and decide the sign-on model BEFORE the mobile app, because changing it afterwards means reissuing every credential.

Comes after #2.

### 12. Building a screen or flow without code

*Platform and extensibility · size L · our rung today: NOT STARTED*

Deliberately late. A studio over an unstable schema builds a second system beside the first, and the schema is not stable until the working day is.

Comes after #11.

### 13. A marketplace where others publish extensions

*Platform and extensibility · size L · our rung today: NOT STARTED*

Not scheduled. Revisit when the API has users who are not us.

Comes after #11.

### 14. A model provider that fails over and cannot overspend

*AI · size S · our rung today: NOT STARTED*

Wire the router behind a gateway the application calls, so there is one place where spend, fallback and refusal are enforced rather than one per caller.

### 15. A way to tell whether an answer was right

*AI · size M · our rung today: SPECIFIED*

Fifty questions a real user would ask about their own data, each with the answer computed from the database, run on every change like any other test.

### 16. What an agent is allowed to do on a company’s data

*AI · size M · our rung today: SPECIFIED*

Agent permissions as their own layer, defaulting to read-only, with every action it takes written to a run log a person can read afterwards.

Comes after #14.

### 17. A chatbot that answers from the business’s own data

*AI · size M · our rung today: SPECIFIED*

After the evaluation set and the permission model, not before. The order is the recommendation.

Comes after #15 and #16.

### 18. Work captured with no signal, reconciled later

*Mobile and offline · size M · our rung today: SPECIFIED*

The hard part is not caching, it is deciding who wins when two people changed the same thing offline. That is a business rule and must be written down before any code.

Comes after **blocked:** A phone app at all. Work below this item does not unblock it.

### 19. Getting an existing business’s data in

*Commercial readiness · size M · our rung today: TESTED*

An importer for the three things every business already has in a spreadsheet: items, opening stock, and opening balances — each rejecting a bad row by name rather than failing the file.

Comes after #2.

---

## What no amount of code closes — 6 items

These are not work to schedule. Each needs something only the owner can supply, and
listing them as tasks would hide that.

### Deployed anywhere a business can reach

A rented machine, a domain and credentials. None of the three can be obtained by any AI, and DEPLOYMENT.md is the runbook that has never been followed by anybody, so expect it to be wrong in small ways the first time.

### A backup that somebody has actually restored

Follows the first deployment — there is nothing to back up until something runs.

### Certifications an enterprise buyer asks for

A deployed system, an operating company behind it, an auditor, and a budget. Worth starting only when there is a customer who is asking for it.

### Live marketplace and cart connections

Seller accounts and API credentials for each marketplace, held by the business and entered at runtime — never committed. The code that uses them can be built and tested against recorded responses before any credential exists.

### A phone app at all

Apple and Google developer accounts. Start the verification early because it is slow; the code can be built against the shared API meanwhile.

### Support, an SLA, and somebody to call

Follows a first customer. Not work to schedule now.

---

## Where nothing needs doing

- **One company cannot read another company’s rows** — AHEAD
- **Money is exact, not floating point** — UNMEASURED
- **Every change is gated before it lands** — AHEAD
- **Documentation a person can actually follow** — AHEAD

---

## What this plan does not promise

The score today is **1.5 out of 5** and the maturity is **Level 3, Prototype**. Finishing every item above does not
make this equal to a suite that has been shipping for twenty years, and no honest
document can tell you how many months it is. What it does is remove every gap that was
measured — and name the ones that were never measured rather than quietly scoring them
as passes.

Nothing here is deployed. Nothing here is live.

---

## Every technical word above, in plain language

**15 words.** Every technical term this document uses, in plain
language, with an everyday comparison. Nothing here assumes you already know any of them.


### platform

One piece of software that many separate businesses use at the same time, each seeing only its own information.

*Ek badi building jisme bahut saare offices hain. Building ek hai, par har office ki chaabi alag — koi kisi aur ke office mein nahin ghus sakta.*

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

### backup

A copy of everything, kept somewhere else, so a mistake or a failure does not lose your work.

*Zaroori kaagzaat ki photocopy, doosri jagah rakhi hui. Asli jal jaaye toh bhi kaam nahin rukta.*

### API

The agreed way two pieces of software talk to each other, so one can ask the other for something and get a predictable answer.

*Waiter. Aap kitchen mein nahin jaate — waiter ko order dete ho, wahi khaana le aata hai. Waiter badal jaaye toh bhi order dene ka tarika wahi rehta hai.*

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

### role

What a person is allowed to see and do — a manager sees more than a counter staff member.

*Chaabi ka guccha. Manager ke paas zyada chaabiyaan, staff ke paas kam.*

### permission

One specific thing a role is allowed to do, like approving a discount or viewing salaries.

*Guchhe ki ek chaabi. Ek chaabi ek darwaza.*

