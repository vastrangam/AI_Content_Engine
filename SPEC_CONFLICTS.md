# Where the specification contradicts itself

10 places where the supplied specifications say two different things — sometimes across documents, more often inside one. 37 line references, each quoted so you can check it against your own copy.

| Document | Lines | Entries |
|---|---:|---:|
| `Vastrangam_ERP_Complete_Master.md` | 5,676 | 8 |
| `STAFF_MASTER_PROMPT.md` | 205 | 2 |

**None of these is resolved here, and that is the decision rather than an omission.** Each entry says what the specification says, and separately what this repository does today. Those are two different claims: "what we do" is not "what is correct", and writing them in one column is how a guess becomes a decision nobody remembers taking.

**No person is named.** Several entries are about one worker's pay, or which roster a worker is on. A person's name does not go into a document that gets sent, and a conflict being about them does not change that — each is described by role, and where a quoted line is itself a list of names the quote is redacted. The line numbers point at the exact rows in your own copy, which is what resolving it needs anyway.

Supplied as an upload, not committed here. Line numbers are 1-based in that file.


**The technical words on this page, before they appear.** Most of them arrive inside lines quoted from the specification, so they cannot be reworded away.

- **module** — One area of work in the system — sales, purchase, staff, accounts. Each is a set of screens that belong together. *Dukaan ke alag-alag counters. Ek counter bikri ka, ek kharidi ka, ek hisaab-kitaab ka.*
- **table** — One kind of information inside the database — all your customers in one, all your orders in another. *Almari ka ek khaana. Ek khaane mein sirf customers, doosre mein sirf orders.*
- **migration** — A recorded change to the shape of the database, so every copy of the system can be updated the same way, in the same order. *Naksha badla toh likh ke rakha — taaki har site pe wahi badlav, usi tarike se ho.*
- **role** — What a person is allowed to see and do — a manager sees more than a counter staff member. *Chaabi ka guccha. Manager ke paas zyada chaabiyaan, staff ke paas kam.*
- **database** — Where all the information is kept, arranged so any of it can be found instantly and nothing gets lost. *Ek badi almari jisme har cheez apne fix khaane mein rakhi hai — dhoondhne ke liye poori almari palatni nahin padti.*

---

## The 10, at a glance

| | Conflict | Document | Where it says both things | Affects | Open |
|---|---|---|---|---|---|
| **C1** | How many marketplaces | Vastrangam_ERP_Complete_Master.md | L319 · L2300 · L141 · L1996 · L5228 | 4 app(s) | yes |
| **C2** | The second company’s SKU brand code — EF or GF | Vastrangam_ERP_Complete_Master.md | L2307 · L2310 · L2311 · L2592 | 3 app(s) | yes |
| **C3** | One contract worker’s wage, stated two ways | Vastrangam_ERP_Complete_Master.md | L2379 · L2600 · L3406 · L3561 · L4290 | 3 app(s) | yes |
| **C4** | The same worker is on two rosters and off a third | Vastrangam_ERP_Complete_Master.md | L509 · L3380 · L2333 | 3 app(s) | yes |
| **C5** | Female threshold hours — 218, 220 or 230 | Vastrangam_ERP_Complete_Master.md | L1956 · L2339 · L3376 · L2376 | 3 app(s) | yes |
| **C6** | 23 garment columns claimed, 22 enumerated | Vastrangam_ERP_Complete_Master.md | L1973 · L2401 · L2403 · L2404 | 3 app(s) | yes |
| **C7** | “The remaining 5” designs, followed by seven names | Vastrangam_ERP_Complete_Master.md | L3255 · L2625 | 3 app(s) | yes |
| **C8** | Two set types: what the spec says they contain, and what the data reproduces | Vastrangam_ERP_Complete_Master.md | L2404 · L2406 · L2409 | 4 app(s) | resolved |
| **C9** | Who was on the floor, against who the rate card says is present | STAFF_MASTER_PROMPT.md | L169 · L89 · L90 · L171 | 2 app(s) | yes |
| **C10** | A contractor priced for a year the roster says he had already left | STAFF_MASTER_PROMPT.md | L101 · L100 · L169 | 3 app(s) | yes |

### What is waiting on a decision

One question per entry, phrased as the question the person who can answer it would be
asked. Every one is held safely in the meantime — each entry says how, and the gate
refuses an entry that does not say.

**C1** — Which channels are live today, and which are a target? The register can hold both, but a report headed “all marketplaces” means one of them.

**C2** — Is the second company’s SKU brand code EF or GF? If any code has already been printed, labelled or sent to a channel as EF, the answer decides a migration and not just a setting.

**C3** — Does “no attendance” mean no attendance-scaled salary, or that hours are not counted at all? The two readings pay differently in any month where recorded hours differ from the assumed ones.

**C4** — Was this worker employed in FY2026-27? The answer decides whether his months appear in payroll at all.

**C5** — Which monthly hour threshold is current for these four — 218, 220 or 230? It is only needed if the legacy column is ever to be paid from rather than printed.

**C6** — Was a 23rd garment column dropped from the table, or was the count never corrected? If a column is missing, every set composition derived from the 22 is derived from an incomplete list.

**C7** — Are the two extra names designs with no rate, or designs whose set type had to be inferred? They are different problems, and the five shared names are what makes the conflation easy to miss.

**C8** — Does the second set type include a dupatta? Either the dupatta does not constrain those sets in practice, or the recorded totals were produced by a tool that had already dropped it — and only the person who ran the floor can say which.

**C9** — Is the floor list the payroll register, or a note of who was in the building that day? Every roster question downstream turns on which of the two it is.

**C10** — How should somebody who “can come to work on contract basis” be held? A closed spell cannot be paid and an open one is employment nobody is claiming — this needs a third shape, and naming it is the owner’s call.


---

## C1 · How many marketplaces

*In `Vastrangam_ERP_Complete_Master.md` — 5,676 lines.*

**What the specification says**

| Line | What is written there |
|---|---|
| **L319** | unifies D2C + 6 marketplaces + B2B + export under one roof |
| **L2300** | selling D2C + 6 marketplaces + B2B + export |
| **L141** | Sales — Marketplace — Amazon/Flipkart/Myntra/Meesho/Ajio order pull |
| **L1996** | an ecommerce sales / return / settlement Excel (Amazon, Flipkart, Myntra, Meesho, Ajio, Nykaa, …) |
| **L5228** | Multi-marketplace order mgmt (Amazon/Flipkart/Myntra/Meesho/Ajio/Nykaa/JioMart + Shopify/Woo) … add Nykaa + JioMart to connector list |

**Why that is a conflict.** The count is stated as six, twice. The list that recurs through the integration and module sections names five. A sixth appears only where uploaded files are read. A seventh appears exactly once, in a gap-analysis row which says in the same breath that the sixth and seventh still need adding — so the document is describing a target in one place and today’s connectors in another, and never says which the six is.

**What this repository does today.** Seven channels, and the number is data rather than design: a channel is a row, every sale carries its channel_id, and core/tests/core.test.js posts across a 10 × 10 grid to prove no count is built in. Adding or removing one is an entry, not a change.

**What it affects.** Marketplace OMS · Channels & Storefronts · Reconciliation · Payout Cycles

**What happens while it is undecided.** Nothing is decided by the count, so nothing is at risk. A channel is a row and every sale carries its channel_id, so the system reports whatever channels exist rather than a number it was told to expect.

**The decision required.** Which channels are live today, and which are a target? The register can hold both, but a report headed “all marketplaces” means one of them.

**Resolution: open.** Nobody has decided, and nothing here has decided on their behalf.

---

## C2 · The second company’s SKU brand code — EF or GF

*In `Vastrangam_ERP_Complete_Master.md` — 5,676 lines.*

**What the specification says**

| Line | What is written there |
|---|---|
| **L2307** | \| Ethnic Fashion \| Go4Fashion \| EF \| `EF` \| Value / contemporary — the row’s SKU brand code column reads EF |
| **L2310** | SKUs use the brand code (VS / EF / AC) |
| **L2311** | Deliberate split for the 2nd entity: company Ethnic Fashion, invoice prefix EF, but brand/SKU code GF (Go4Fashion) |
| **L2592** | Company/brand/prefix \| Vastrangam·VS / Ethnic Fashion·GF·EF / Adini·AC |

**Why that is a conflict.** The §1.1 table is headed “canonical — never confuse”, and its own SKU brand code cell says EF; the bullet directly beneath it says the split from EF to GF is deliberate, and the §16 rule index agrees with the bullet. Two say EF, two say GF, and they are four lines apart. A SKU code decides what every item of that brand is called, so this is not cosmetic.

**What this repository does today.** GF, following the deliberate-split bullet and the rule index — the two places that state the intent rather than restate the table.

**What it affects.** Catalog / PIM · Master-Data Hygiene · Stock

**What happens while it is undecided.** GF is used, following the two places that state the intent rather than restate the table. A SKU code is data, so a change is a migration of existing codes rather than an edit — which is why the choice is recorded rather than assumed.

**The decision required.** Is the second company’s SKU brand code EF or GF? If any code has already been printed, labelled or sent to a channel as EF, the answer decides a migration and not just a setting.

**Resolution: open.** Nobody has decided, and nothing here has decided on their behalf.

---

## C3 · One contract worker’s wage, stated two ways

*In `Vastrangam_ERP_Complete_Master.md` — 5,676 lines.*

**What the specification says**

| Line | What is written there |
|---|---|
| **L2379** | §3.3 locked formulas: “… wage = Piece Rate, no attendance (2026-27)” |
| **L2600** | §3.3 rate table: “… \| hours × ₹100 \| 3.3” |
| **L3406** | “… wage = Staff Report hours × Rs 100/hr (no monthly salary, no attendance tracking)” |
| **L3561** | Part IV sheet formula: “# … wage = total … hours × 100” |
| **L4290** | acceptance checklist: “… wages = hours × Rs 100/hr (no attendance row)” |

**Why that is a conflict.** The locked-formula block calls it a piece rate with no attendance; four other places price it off hours at ₹100 an hour. Hours are an attendance measure, so “no attendance” and “hours × rate” cannot both be operative. The likeliest reading is that “no attendance” means no attendance-scaled monthly salary rather than no hours recorded — but that is a reading, and this file does not make readings.

**What this repository does today.** Piece-rate at ₹100 per hour, with the rate cited against all four statements in engine/fixtures/master.json under _rate_sources. The hours are taken from the work report, never from an attendance grid.

**What it affects.** Piece-rate & Contractors · Staff & Contractors · Payout Execution

**What happens while it is undecided.** Priced as a piece rate at ₹100 per hour, with all four contradicting statements cited beside it in the fixture rather than silently reconciled. Hours come from the work report and never from an attendance grid, so “no attendance” holds in the sense that can be honoured.

**The decision required.** Does “no attendance” mean no attendance-scaled salary, or that hours are not counted at all? The two readings pay differently in any month where recorded hours differ from the assumed ones.

**Resolution: open.** Nobody has decided, and nothing here has decided on their behalf.

---

## C4 · The same worker is on two rosters and off a third

*In `Vastrangam_ERP_Complete_Master.md` — 5,676 lines.*

**What the specification says**

| Line | What is written there |
|---|---|
| **L509** | Book 1 §A.6: active FY26-27 staff, ending “… ; contract [worker]” |
| **L3380** | Power BI staff master, currently active FY2026-27: the worker’s row is present, “Iron (Piece rate)” |
| **L2333** | Book 2 §2.1 “Staff — active (FY2026-27)”: the table lists eight people and this worker is not among them |

**Why that is a conflict.** Two of the document’s three active-staff lists carry this worker and the third omits him. The omission is silent — he is not moved to the “confirm current status” table below it either, which is where a departure would have been recorded. Whether he is employed in FY2026-27 decides whether his months appear in payroll at all.

**What this repository does today.** Carried as active, following the two lists that name him, and his pay basis is piece-rate so no salary or threshold is implied by the choice.

**What it affects.** Staff & Contractors · Payout Execution · Piece-rate & Contractors

**What happens while it is undecided.** Carried as active, following the two lists that name him. His pay basis is piece rate, so the choice implies no salary and no threshold — a wrong answer here costs nothing until he is actually paid.

**The decision required.** Was this worker employed in FY2026-27? The answer decides whether his months appear in payroll at all.

**Resolution: open.** Nobody has decided, and nothing here has decided on their behalf.

---

## C5 · Female threshold hours — 218, 220 or 230

*In `Vastrangam_ERP_Complete_Master.md` — 5,676 lines.*

**What the specification says**

| Line | What is written there |
|---|---|
| **L1956** | Book 1, Staff active FY2026-27: every female row’s Threshold reads 218 |
| **L2339** | Book 2 §2.1, the same four people: every female row’s Threshold reads 220 |
| **L3376** | Power BI staff master: one woman’s Threshold Hrs/Mo reads 230 while the other three read 220 |
| **L2376** | §3.3 formula: “Productivity / hour = salary / (Female ? 220 : 270)” |

**Why that is a conflict.** Three of the document’s own staff tables give three different monthly hour thresholds for the same four women — 218, 220, and 220-with-one-at-230 — and the productivity formula hard-codes 220 for every woman regardless. The figure divides a salary, so the spread is worth about five per cent of an hourly cost.

**What this repository does today.** Neither figure is priced off. The daily rate is salary ÷ threshold DAYS and the hourly rate is that ÷ the person’s own shift, which §3.6.3 itself calls the correct derivation and the Threshold Hrs/Mo column legacy. The legacy values are kept so the legacy column can still be printed, and engine/fixtures/master.json says so in _threshold_hours_are_legacy.

**What it affects.** Staff & Contractors · Payout Execution · Time-off & Advances

**What happens while it is undecided.** Neither disputed figure is priced off. Pay is derived from the salary and the person’s own shift, which the source document itself calls the correct derivation, and the three legacy values are kept only so the legacy column can still be printed — marked as legacy in the fixture so nobody mistakes them for the live basis.

**The decision required.** Which monthly hour threshold is current for these four — 218, 220 or 230? It is only needed if the legacy column is ever to be paid from rather than printed.

**Resolution: open.** Nobody has decided, and nothing here has decided on their behalf.

---

## C6 · 23 garment columns claimed, 22 enumerated

*In `Vastrangam_ERP_Complete_Master.md` — 5,676 lines.*

**What the specification says**

| Line | What is written there |
|---|---|
| **L1973** | It defines 23 garment columns (Anarkali, Plazo, Dupatta variants, …) grouped into 13 Set Types |
| **L2401** | Col A = Karigar name, Col B = Design Name, Col C onward = the 23 garment columns |
| **L2403** | §4.1 heading: “The 23 garment-type columns → 13 Set Types” |
| **L2404** | the enumeration under that heading runs “2 Anarkali · 3 Plazo · … · 23 Alter” — indices 2 to 23, twenty-two of them |

**Why that is a conflict.** The count 23 is stated three times and the enumeration under it lists 22, running C to X with none missing. The set-type map uses all 22 and references no 23rd. Either a column was dropped from the table or the count was never corrected.

**What this repository does today.** The 22 that are actually enumerated, in engine/fixtures/garment_columns.json, with the count pinned by a test so a real 23rd appearing later is a visible change and not a silent one.

**What it affects.** PLM & Development · Production Orders · BOM & Consumption

**What happens while it is undecided.** The 22 that are actually enumerated are used, and the count is pinned by a test — so a real 23rd appearing later is a visible failure rather than a silent widening.

**The decision required.** Was a 23rd garment column dropped from the table, or was the count never corrected? If a column is missing, every set composition derived from the 22 is derived from an incomplete list.

**Resolution: open.** Nobody has decided, and nothing here has decided on their behalf.

---

## C7 · “The remaining 5” designs, followed by seven names

*In `Vastrangam_ERP_Complete_Master.md` — 5,676 lines.*

**What the specification says**

| Line | What is written there |
|---|---|
| **L3255** | Design → Set Type mapping comes from Stitching_Rates_Master.xlsx for 138 of 143 designs. The remaining 5 (Avinya, JennyBlack, JennyRed, LNB Lehenga, V4B, V527, Yeshan Cotton Sample) were inferred |
| **L2625** | §16A: 5 no-rate designs (Avinya, LNB Lehenga, V4B, V527, Yeshan Cotton Sample) costed ₹0 & flagged |

**Why that is a conflict.** Two problems in one sentence. The count says five and the list holds seven, and 143 minus 138 is five. Two of the seven names appear nowhere else in the document. Separately, this list is not the same list as §16A’s five, and the two describe different things — a design whose SET TYPE had to be inferred is not the same as a design with NO RATE. They share five names, which is what makes the conflation easy to miss.

**What this repository does today.** The five no-rate designs are carried by name in engine/fixtures/acceptance_16a.json, from §16A. The two names unique to the other list are carried nowhere, because nothing else in the document mentions them.

**What it affects.** PLM & Development · Piece-rate & Contractors · Design / IP Register

**What happens while it is undecided.** Only the five named in the section that is actually about rates are carried. The two names that appear nowhere else are carried nowhere, rather than being folded into a list they may not belong to.

**The decision required.** Are the two extra names designs with no rate, or designs whose set type had to be inferred? They are different problems, and the five shared names are what makes the conflation easy to miss.

**Resolution: open.** Nobody has decided, and nothing here has decided on their behalf.

---

## C8 · Two set types: what the spec says they contain, and what the data reproduces

*In `Vastrangam_ERP_Complete_Master.md` — 5,676 lines.*

**What the specification says**

| Line | What is written there |
|---|---|
| **L2404** | §4.1 column map: “7 Dupatta(Kurti Palazzo) … 10 Dupatta(Lehenga Choli)” |
| **L2406** | §4.1 set-type map: “Kurti Palazzo Set (5,6,7) · Lehenga Choli Set (8,9,10)” — three columns each, the third a dupatta |
| **L2409** | §4.2.2: “Lehenga Choli = MIN(Blouse, Lehenga, Dupatta) when Dupatta>0, else MIN(Blouse, Lehenga)” |

**Why that is a conflict.** The specification is explicit that both of these set types include a dupatta. The repository’s composition table says they do not, and did not get there by reading the name: each composition is the only one of the six possible slot combinations that reproduces the recorded Total Complete Sets for every design of that type — 25 designs for one, 34 for the other — in the karigar report. So a stated rule and a measured outcome disagree, which is the most useful kind of disagreement and the one hardest to settle from the document alone: either the dupatta genuinely does not constrain those sets in practice, or the recorded totals were themselves produced by a tool that had already dropped it.

**What this repository does today.** HALF OF THIS IS NOW SETTLED, BY THE OWNER, AND HALF IS NOT. He said of a set: “it can be 3 piece top bottom dupatta or it can be lehenga choli dupatta”. An OPTIONAL dupatta satisfies both readings at once — all 34 recorded designs still reconcile without one, and a design that ships one has somewhere to record it — so engine/fixtures/set_types.json now carries Dupatta on Lehenga Choli Set with required:false, which is what studio_core.js SET_RULES had said all along. The disagreement for that set type is gone and its entry has been removed from _javascript_table_differs. **Kurti Palazzo Set is untouched and still disagrees** — he has not spoken about that one, and resolving it by analogy would be inventing his answer. brand/site/checksets.js fails on any membership disagreement not written down and equally on a recorded one that has gone away, which is how the removal was forced rather than remembered.

**What it affects.** Production Orders · BOM & Consumption · Piece-rate & Contractors · Quality Control

**What happens while it is undecided.** One of the two set types is settled by the owner’s own words and now carries an optional dupatta, which satisfies the specification and the measured totals at once. The other is left exactly as the data reproduces it and is recorded as still disagreeing — a gate fails both on an undeclared disagreement and on a declared one that has quietly gone away.

**The decision required.** Does the second set type include a dupatta? Either the dupatta does not constrain those sets in practice, or the recorded totals were produced by a tool that had already dropped it — and only the person who ran the floor can say which.

**Resolution.** Partly, and only the part he spoke to. Lehenga Choli Set carries an optional dupatta on the owner’s own words. Kurti Palazzo Set remains open.

---

## C9 · Who was on the floor, against who the rate card says is present

*In `STAFF_MASTER_PROMPT.md` — 205 lines.*

**What the specification says**

| Line | What is written there |
|---|---|
| **L169** | Working: <eight names, one of the two ironing staff among them>. |
| **L89** | <ironing staff A> \| Jun 2025 – present \| 23,000 \| 280 \| 82.14 |
| **L90** | <ironing staff B> \| Apr 2026 – present \| 28,000 \| 280 \| 100.00 |
| **L171** | Left: <one name> (Aug 2026). |

**Why that is a conflict.** The floor list for 1 Sep 2026 names one of the two ironing staff as working and does not name the other at all. The rate card twelve lines earlier says BOTH are "present", and the Left line names only one person, who is not either of them. So the same document says one of them is working, implies the other is not, and separately says both are on the books — and a reader cannot tell whether the floor list is the payroll register or just who happened to be in the building that day. Asked directly, the owner gave a list that swaps which of the two is working, contradicting his own floor line. The quotes above are redacted: these lines are rosters and every one of them is a person, and a name does not enter a committed document because a conflict happens to be about somebody. The line numbers point at the rows in his own file, which is where the names are.

**What this repository does today.** The engine holds the list he stated when asked, because it is the most recent direct answer and he was shown the contradicting line before giving it. The roster is checked name for name against that list on every run, and the snapshot date it was true on is recorded beside it so it cannot quietly come to mean "now".

**What it affects.** Staff & Contractors · Payout Execution

**What happens while it is undecided.** The list the owner gave when asked directly is held, because it is the most recent answer and he was shown the contradicting line before giving it. The date it was true on is recorded beside it, so it cannot quietly come to mean “now”.

**The decision required.** Is the floor list the payroll register, or a note of who was in the building that day? Every roster question downstream turns on which of the two it is.

**Resolution: open.** Nobody has decided, and nothing here has decided on their behalf.

---

## C10 · A contractor priced for a year the roster says he had already left

*In `STAFF_MASTER_PROMPT.md` — 205 lines.*

**What the specification says**

| Line | What is written there |
|---|---|
| **L101** | <contractor A> / <contractor B> FY26-27: **iron piece rates**, not salary. |
| **L100** | <contractor A> FY25-26: ₹100 / hour iron (only if hours exist; FY25 register has no clock for him). |
| **L169** | Working: <eight names, one of the two contractors among them>. |

**Why that is a conflict.** Two contractors are put on iron piece rates for FY2026-27, which begins 1 April 2026. The floor list for 1 September 2026 names one of them and not the other, and the owner separately confirmed a leaving date of 31 March 2026 for the one it omits — the day before the year those piece rates apply to. He also described both as people who "can come to work on contract basis" whenever needed, which is an arrangement neither an open spell nor a closed one describes: a closed spell cannot be paid, and an open one is employment nobody claims. The prior-year line adds a third reading, naming only one of them for the hourly rate the owner elsewhere gave to both. The quotes are redacted for the same reason as the entry above; the line numbers point at his own file.

**What this repository does today.** The confirmed leaving date is held, so that contractor resolves nothing in FY2026-27 and his months pay nobody. The operation's rate card is untouched and still prices the work, so recording a return is a spell and not a rate. Both contractors keep the prior year's hourly row, on the owner's direct answer that both had it.

**What it affects.** Staff & Contractors · Piece-rate & Contractors · Payout Execution

**What happens while it is undecided.** The confirmed leaving date is held, so that contractor resolves nothing in the year in question and his months pay nobody. The operation’s rate card is untouched, so recording a return is a spell rather than a rate.

**The decision required.** How should somebody who “can come to work on contract basis” be held? A closed spell cannot be paid and an open one is employment nobody is claiming — this needs a third shape, and naming it is the owner’s call.

**Resolution: open.** Nobody has decided, and nothing here has decided on their behalf.

---

## What happens to this file

It is generated from `brand/site/conflicts.js` and checked by `brand/site/checkconflicts.js`, which runs with every other gate. An entry that loses a line reference, loses the quoted text at one, loses its "what this repository does" column, names an affected app that does not exist, stops saying what happens while it is undecided, or states its decision as anything but a question, fails the build. So the register can be argued with, added to, or closed — it cannot quietly become vague.

When one of the 9 is decided, the decision goes in `conflicts.js` as the entry's resolution and this page regenerates. Until then every one of them stays open in writing.

