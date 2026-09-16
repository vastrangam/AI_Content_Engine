# What is inside MEDHAVA_BOS.zip

**All 428 files, every one of them, with what each file says it is.** Not a selection and not a summary of the interesting ones — the list below is the complete
contents of the archive, and a checker opens the real zip and fails the build if a
single entry is in one and not in the other.

---

## How to read this

| | |
|---|---:|
| Files in the archive | **428** |
| Total size on disk | 18.6 MB |
| Files whose description was read out of the file itself | 311 |
| Data files described by their own top-level keys | 15 |
| Images, fonts and rendered PDFs — no readable header | 69 |
| Files carrying no description at all, named below | 30 |

**Nothing in the "what it is" column was written about a file.** Each line was read 
*out of* the file — the header comment a source file opens with, the first heading of
a document, the top-level keys of a data file. A file that carries no description is
reported as carrying none rather than given a guess, because a gap that says so can be
closed and a guess cannot be found.

**This archive is the product with no customer inside it.** It builds, tests and
runs with zero tenants installed — checked by extracting it into an empty directory,
running `npm ci`, and running `npm run test:product` there.

---

## Where the files are, and what each area is for

| Area | Files | Size |
|---|---:|---:|
| Start here | 2 | — |
| The delivered documents | 28 | 1.5 MB |
| The data core — the part every module reads and writes | 27 | 375 KB |
| The application that runs on the core | 18 | 211 KB |
| The registers — the lists everything else is derived from | 70 | 1.3 MB |
| The document generators and the archive builders | 61 | 3.4 MB |
| The earlier prototype app line | 184 | 10.0 MB |
| Logos, fonts and the brand sheet | 16 | 1.4 MB |
| Deployment, tooling and the build | 22 | 381 KB |

---

## Start here

**2 files · —.** Written by the archive builder at the moment the archive was made. These are the first things to open: one names the commands that run everything else, the other says which of these files are worth reading and what each costs to read.

| File | What it says it is | Size |
|---|---|---:|
| `READ_FIRST.md` | The reading order, priced. Which files in this archive are worth opening, which are generated output to skip, and roughly what each costs to read. | — |
| `START_HERE.md` | Written into the archive when it is built — what this is, and the commands that run it. | — |

---

## The delivered documents

**28 files · 1.5 MB.** The reading matter — the plan, the design argued, the runbook, the rulebook, the audits, and this contents list. Each .md has a .pdf beside it rendered from the same source, so the two cannot disagree.

| File | What it says it is | Size |
|---|---|---:|
| `AUDIT_REPORT.md` | Written under the anti-cheat protocol now installed at `.claude/skills/anti-cheat-protocol/SKILL.md`. | 9 KB |
| `BENCHMARK_GAPS.md` | 30 parameters across 11 dimensions. | 34 KB |
| `BUILD_QUEUE.md` | 8 tasks, in order, each an independently verifiable vertical slice. | 18 KB |
| `CLAUDE.md` | 0 · MEDHAVA IS THE PRODUCT. | 22 KB |
| `CONSTRAINTS.md` | 85 lines of the specification need something a repository cannot hold. | 17 KB |
| `CURRENT_STATE_AUDIT.md` | What is actually in this repository, counted at the moment this file was generated. | 11 KB |
| `DEPLOYMENT.md` | This describes a design. It is how the platform is deployed and run once it is built. | 15 KB |
| `GAP_ANALYSIS.md` | What is missing, what it holds up, and which gaps can be closed from inside this repository at all. | 13 KB |
| `HANDOFF.md` | You are one of several models working on this repository. | 5 KB |
| `MASTER_SPEC_COVERAGE.md` | 945 line items across 31 sections. | 8 KB |
| `MEDHAVA_ARCHITECT.md` | What this system is, and why it is shaped this way. | 54 KB |
| `MEDHAVA_BOS.SKILL.md` | You are building a platform: one piece of software that many separate businesses use at the same time, each seeing only its own information, each seeing it in its own words. | 11 KB |
| `MEDHAVA_BOS_PROMPT.md` | Build the platform. Paste this at the start of the session. | 21 KB |
| `MEDHAVA_BUILD_GUIDE.md` | How this platform is designed and built. | 187 KB |
| `MEDHAVA_CONTENTS.md` | Every file in this archive, with what each one says it is — the document you are reading. | — |
| `MEDHAVA_HOW_TO_BUILD.md` | Start here if you have just downloaded `MEDHAVA_BOS.zip`. | 23 KB |
| `MEDHAVA_PLAN_OF_ACTION.md` | One business operating system. | 185 KB |
| `Medhava_BOS.md` | One Business Operating System. | 506 KB |
| `Medhava_Build_Roadmap.md` | Everything, in one file: the ten stages from idea to launch, then all 22 modules, all 113 apps and all 293 rules in full — each rule with what the system does, what it refuses to do instead, and the… | 226 KB |
| `PARITY_PLAN.md` | Ordered so it can be worked from the top. | 14 KB |
| `PRODUCT_CAPABILITY_MATRIX.md` | Every one of the 113 apps, under its module, with the rung it has reached and the 0–5 score that rung translates to. | 15 KB |
| `REQUIREMENTS_REGISTRY.md` | One row per capability, the rung it has reached, and the thing that proves it. | 36 KB |
| `SETUP_CHECKLIST.md` | 8 steps, in the order they should happen. | 14 KB |
| `SEVEN_STAGE_ROADMAP.md` | Your seven, in your order, with your numbering. | 15 KB |
| `SPEC_CONFLICTS.md` | 10 places where the supplied specifications say two different things — sometimes across documents, more often inside one. | 27 KB |
| `START_HERE_OWNER.md` | This is the first thing to open. | 3 KB |
| `WORKING_WITH_AI_TOOLS.md` | Read this before your next session rather than when a limit runs out. | 5 KB |
| `ZOHO_CAPABILITY_BENCHMARK.md` | The 56 products the owner supplied, in his order, and what this project has against each. | 21 KB |

---

## The data core — the part every module reads and writes

**27 files · 375 KB.** The database schema, the money arithmetic, the ledger, stock, the audit trail and the trade packs. Nothing above it works without it, and the isolation test here is the single check that one company cannot read another’s rows.

| File | What it says it is | Size |
|---|---|---:|
| `core/audit.js` | The audit trail. There is no way to switch it off, and that is the point. | 5 KB |
| `core/db.js` | The one database. | 4 KB |
| `core/events.js` | The cascade bus. | 5 KB |
| `core/ledger.js` | The posting engine. One function. | 11 KB |
| `core/logs.js` | Effective-dated logs — ported rule for rule from the tenant engine's Python implementation, which is where the behaviour below was worked out and is tested against a real payroll. | 9 KB |
| `core/money.js` | Money — integer paise, never a float. | 6 KB |
| `core/packs.js` | THE INDUSTRY PACK ENGINE — a trade is a row, not a fork. | 22 KB |
| `core/packs/construction.json` | keys: id, name, sector, rank, why, vocabulary, plurals, stages (+4 more) | 6 KB |
| `core/packs/education.json` | keys: id, name, sector, rank, why, vocabulary, plurals, stages (+4 more) | 5 KB |
| `core/packs/field-service.json` | keys: id, name, sector, rank, why, vocabulary, plurals, stages (+4 more) | 5 KB |
| `core/packs/healthcare-clinic.json` | keys: id, name, sector, rank, why, vocabulary, plurals, stages (+4 more) | 4 KB |
| `core/packs/hospitality-food.json` | keys: id, name, sector, rank, why, vocabulary, plurals, stages (+4 more) | 5 KB |
| `core/packs/logistics-3pl.json` | keys: id, name, sector, rank, why, vocabulary, plurals, stages (+4 more) | 5 KB |
| `core/packs/manufacturing.json` | keys: id, name, sector, rank, why, vocabulary, plurals, stages (+4 more) | 5 KB |
| `core/packs/professional-services.json` | keys: id, name, sector, rank, why, vocabulary, plurals, stages (+4 more) | 4 KB |
| `core/packs/retail-ecommerce.json` | keys: id, name, sector, rank, why, vocabulary, stages, fields (+3 more) | 4 KB |
| `core/packs/wholesale-distribution.json` | keys: id, name, sector, rank, why, vocabulary, plurals, stages (+4 more) | 4 KB |
| `core/partv.js` | PART V's 43 TABLES — where each one went, and why. | 17 KB |
| `core/schema.postgres.sql` | *no description in the file itself* | 105 KB |
| `core/schema.sql` | *no description in the file itself* | 13 KB |
| `core/stock.js` | Stock — one quantity per SKU, per location, per stage. | 7 KB |
| `core/tenant.js` | WHAT THIS BUSINESS CHANGED AFTER THE PACK — the layer the documents promised and the engine did not have. | 11 KB |
| `core/tests/core.test.js` | The core's self-tests. | 32 KB |
| `core/tests/live.test.js` | THE SCHEMA, RUN RATHER THAN READ. | 18 KB |
| `core/tests/packs.test.js` | THE GATE ON THE INDUSTRY PACK ENGINE. | 30 KB |
| `core/tests/partv.test.js` | PART V's 43 TABLES, ASKED OF A REAL DATABASE. | 15 KB |
| `core/tests/schema.test.js` | The gate on the production schema. | 18 KB |

---

## The application that runs on the core

**18 files · 211 KB.** The server, the screens and their tests — the part a person actually signs in to. This is the smallest of the code areas, which is an honest picture of where the project is: the design is large and the built part is not.

| File | What it says it is | Size |
|---|---|---:|
| `medhava/package.json` | keys: name, private, description, scripts | 243 B |
| `medhava/seed/demo.js` | TWO BUSINESSES THAT LOOK NOTHING ALIKE, ON ONE CODEBASE. | 13 KB |
| `medhava/server/api.js` | THE API — every business request carries a tenant and a company, or it is refused. | 13 KB |
| `medhava/server/auth.js` | SESSIONS — kept deliberately small, and deliberately not clever. | 1 KB |
| `medhava/server/db.js` | THE DATABASE, AND THE ONE LINE THAT DECIDES WHETHER ISOLATION EXISTS. | 9 KB |
| `medhava/server/index.js` | THE MEDHAVA SERVER. | 5 KB |
| `medhava/server/inventory.js` | MODULE 03 · INVENTORY — the one stock number, and the rule that keeps it honest. | 7 KB |
| `medhava/server/purchase.js` | MODULE 07 · PURCHASE — buying, which is the half of a working day this platform did not have. | 17 KB |
| `medhava/server/sales.js` | MODULE 05 · SALES — the write side, and the first place this platform creates a business record. | 16 KB |
| `medhava/test/day.test.js` | ONE WORKING DAY, END TO END — the test the maturity level rests on. | 11 KB |
| `medhava/test/inventory.test.js` | MODULE 03 · INVENTORY — the one stock number, asked of a running database. | 13 KB |
| `medhava/test/isolation.test.js` | THE SLICE, ASKED RATHER THAN ASSERTED. | 24 KB |
| `medhava/test/purchase.test.js` | MODULE 07 · PURCHASE — buying, asked of a running database. | 12 KB |
| `medhava/test/sales.test.js` | MODULE 05 · SALES — the rules, asked of a running database. | 21 KB |
| `medhava/test/shell.test.js` | THE SHELL, DRIVEN IN A REAL BROWSER. | 17 KB |
| `medhava/web/app.js` | The shell. Deliberately plain JavaScript — no build step, no framework, nothing to install. | 22 KB |
| `medhava/web/index.html` | Medhava — Business Operating System | 1 KB |
| `medhava/web/style.css` | Medhava — the platform shell. | 7 KB |

---

## The registers — the lists everything else is derived from

**70 files · 1.3 MB.** Modules, apps, rules, tools, the stack, the requirements registry, and the checkers that gate them. No count in any document here is typed: it is read from one of these files, which is why the counts have changed twice without a document going stale.

| File | What it says it is | Size |
|---|---|---:|
| `brand/site/INDEX.md` | A unified ERP: 21 modules and 113 apps over one shared data core. | 49 KB |
| `brand/site/architect.js` | THE ARCHITECT — what Medhava IS, and why it is that. | 27 KB |
| `brand/site/audit.js` | THE AUDIT REGISTER — the score, the maturity level, and what to build next. | 28 KB |
| `brand/site/backlog.js` | THE BACKLOG — the 109 lines of the master specification this product does not name at all. | 14 KB |
| `brand/site/benchmark.js` | THE PARAMETERS — every dimension this product is measured on, and the gap on each. | 36 KB |
| `brand/site/bottom.html` | FLAGSHIP FEATURES | 23 KB |
| `brand/site/build.js` | Medhava — builds the COMPLETE website (index.html) with every module and every app from modules.js as real web sections, then renders it to a PDF that looks like the website. | 53 KB |
| `brand/site/built.js` | WHICH APPS ACTUALLY EXIST — one list, because two lists disagree. | 7 KB |
| `brand/site/checkaudit.js` | THE AUDIT REGISTER, CHECKED. | 11 KB |
| `brand/site/checkbacklog.js` | THE BACKLOG, CHECKED AGAINST THE SHEET THAT PRODUCED IT. | 8 KB |
| `brand/site/checkbenchmark.js` | THE PARAMETERS REGISTER, CHECKED — because a benchmark is the easiest document to fake. | 16 KB |
| `brand/site/checkcompetitor.js` | NOTHING MEDHAVA SHIPS NAMES A COMPETITOR. | 10 KB |
| `brand/site/checkconflicts.js` | THE CONFLICT REGISTER, CHECKED. | 11 KB |
| `brand/site/checkcontents.js` | THE CONTENTS DOCUMENTS, CHECKED AGAINST THE ACTUAL ZIP FILES. | 24 KB |
| `brand/site/checkcoverage.js` | EVERY DELIVERED DOCUMENT, MEASURED AGAINST EVERY REGISTER. | 9 KB |
| `brand/site/checkedition.js` | NO MEDHAVA-NAMED ARTEFACT MAY CARRY A TRADE WORD. | 9 KB |
| `brand/site/checkhandover.js` | THE HANDOVER PACK, CHECKED — because this one is read by somebody who cannot check it. | 9 KB |
| `brand/site/checkmasterspec.js` | THE MASTER-SPEC COVERAGE REGISTER, CHECKED. | 13 KB |
| `brand/site/checkneutral.js` | The gate on the neutral edition. | 14 KB |
| `brand/site/checkprivacy.js` | NOBODY REAL IS NAMED IN A TRACKED FILE, AND NO TRACKED FILE PAIRS A PERSON WITH MONEY. | 13 KB |
| `brand/site/checkregistry.js` | THE TRUTH REGISTRY, CHECKED — the gate that refuses a status nothing proves. | 10 KB |
| `brand/site/checkroadmap.js` | THE ROADMAPS, CHECKED — the one document pair that publishes build state. | 9 KB |
| `brand/site/checkrules.js` | The gate on the rulebook. | 5 KB |
| `brand/site/checksets.js` | TWO TABLES DESCRIBE THE SAME GARMENTS. | 8 KB |
| `brand/site/checkshape.js` | THE STRUCTURAL NEUTRALITY GATE — does this platform have the SHAPE of one trade? | 10 KB |
| `brand/site/checksite.js` | THE PUBLISHED SITE, DRIVEN — not inspected. | 7 KB |
| `brand/site/checkstack.js` | THE GATE ON RULE 1 — no capability depends on one tool. | 5 KB |
| `brand/site/checkstatic.js` | NOTHING IS STATIC — CHECKED, NOT PROMISED. | 10 KB |
| `brand/site/checktools.js` | The gate on the tools register. | 5 KB |
| `brand/site/checkzoho.js` | THE CAPABILITY BENCHMARK, CHECKED. | 8 KB |
| `brand/site/conflicts.js` | WHERE THE SPECIFICATION CONTRADICTS ITSELF — recorded, not resolved. | 23 KB |
| `brand/site/describe.js` | WHAT EACH FILE SAYS IT IS — read from the file, never typed about it. | 10 KB |
| `brand/site/dynamic.js` | RULE 2 — NOTHING IS STATIC, AND THE PAST STAYS CORRECT. | 13 KB |
| `brand/site/editions.js` | WHICH EDITIONS ARE INSTALLED — asked once, in one place. | 3 KB |
| `brand/site/guide.js` | THE BUILD GUIDE — how this platform is designed and built. | 68 KB |
| `brand/site/guidefmt.js` | ONE FORMATTER, TWO RUNBOOKS. | 5 KB |
| `brand/site/handover.js` | THE SEVEN STAGES, IN THE OWNER'S OWN ORDER AND HIS OWN NUMBERING. | 13 KB |
| `brand/site/head.html` | __PRODUCT__ — One business. One brain. \| Unified ERP with __NAPP__ apps | 6 KB |
| `brand/site/howto.js` | HOW TO BUILD MEDHAVA — the path from a downloaded archive to a working app. | 23 KB |
| `brand/site/llms.txt` | *no description in the file itself* | 6 KB |
| `brand/site/logo.js` | THE MEDHAVA MARK — drawn to the brand sheet, in one place. | 4 KB |
| `brand/site/masterspec.js` | THE OWNER'S MASTER BUILD PROMPT, ENCODED — and what this product has against each line. | 55 KB |
| `brand/site/mkcounts.js` | The counts in MEDHAVA_PLAN_OF_ACTION.md, derived rather than typed. | 7 KB |
| `brand/site/mkdiagrams.js` | THE MODULE MAP, DERIVED — not drawn by hand. | 7 KB |
| `brand/site/mkindex.js` | Builds INDEX.md — the whole website as one plain-text page you can read, search or send. | 12 KB |
| `brand/site/mkregisters.js` | Inject the remaining registers into the plan of action, between markers. | 6 KB |
| `brand/site/mkrulebook.js` | Inject the full rulebook into a document, between markers. | 2 KB |
| `brand/site/mkrules.js` | Put the rulebook into PLAN_OF_ACTION.md — and nothing else into it. | 10 KB |
| `brand/site/modules.js` | THE canonical list. The website, every PDF, INDEX.md, llms.txt and the structural audit all | 45 KB |
| `brand/site/plainwords.js` | PLAIN WORDS — every technical term explained once, the same way, everywhere. | 14 KB |
| `brand/site/prompts.js` | THE TWO MASTER BUILD PROMPTS, AS DATA. | 32 KB |
| `brand/site/reach.js` | WHO EACH APP IS ACTUALLY FOR — the register that makes structural bias visible. | 12 KB |
| `brand/site/registers.js` | EVERY REGISTER, MEASURED THE SAME WAY — and rendered from one implementation. | 12 KB |
| `brand/site/registry.js` | THE TRUTH REGISTRY — one row per capability, and what proves it. | 22 KB |
| `brand/site/roadmap.js` | THE TEN STAGES — idea to launch, and what each one owes. | 18 KB |
| `brand/site/rulebook.js` | THE RULEBOOK, RENDERED — one implementation, every document. | 2 KB |
| `brand/site/rules.js` | THE RULEBOOK — the canonical list, in the same spirit as modules.js. | 107 KB |
| `brand/site/sectors.js` | WHICH TRADES THIS PLATFORM ACTUALLY SERVES — the join between what the website SHOWS and what the engine can CONFIGURE. | 7 KB |
| `brand/site/setup.js` | WHAT TO BUY AND SWITCH ON, IN ORDER — the owner's own stack, sequenced. | 11 KB |
| `brand/site/shots.js` | ONE LIVE-LOOKING SCREEN PER MODULE — the neutral edition. | 32 KB |
| `brand/site/site.css` | TOKENS — from the Medhava mark Teal → blue → violet, with a gold star. | 48 KB |
| `brand/site/skills.js` | THE TWO SKILLS, AS DATA. | 26 KB |
| `brand/site/stack.js` | THE STACK — every technical layer, its default, and what it can be replaced with. | 18 KB |
| `brand/site/tenant.js` | THE TENANT GUIDE — one business on the platform, in full. | 61 KB |
| `brand/site/tenantbuild.js` | THE TENANT BUILD GUIDE — one business, from signing up to running live. | 46 KB |
| `brand/site/tools.js` | THE TOOLS REGISTER — free first, paid only when something forces it. | 12 KB |
| `brand/site/top.html` | __HERO_H1__ | 11 KB |
| `brand/site/uishot.js` | THE LIVE-LOOKING PRODUCT SCREEN — one renderer, used everywhere. | 2 KB |
| `brand/site/walkthrough.js` | THE WALKTHROUGH — the content, once, for two very different renderers. | 15 KB |
| `brand/site/zoho.js` | THE CAPABILITY BENCHMARK — one row per product the owner named, and what this one has. | 24 KB |

---

## The document generators and the archive builders

**61 files · 3.4 MB.** Every delivered document is written by a script in here, from the registers above. To change a document you change its generator or its register, never the document — a hand-edit is overwritten the next time anything is built.

| File | What it says it is | Size |
|---|---|---:|
| `brand/delivery/Brand/Medhava_Brand_Identity.png` | *binary — carries no readable header* | 562 KB |
| `brand/delivery/Brand/icon-16.png` | *binary — carries no readable header* | 342 B |
| `brand/delivery/Brand/icon-180.png` | *binary — carries no readable header* | 7 KB |
| `brand/delivery/Brand/icon-32.png` | *binary — carries no readable header* | 741 B |
| `brand/delivery/Brand/icon-512.png` | *binary — carries no readable header* | 10 KB |
| `brand/delivery/Brand/icon-64.png` | *binary — carries no readable header* | 2 KB |
| `brand/delivery/Brand/medhava-icon.svg` | *a drawing — no title element to read* | 682 B |
| `brand/delivery/Brand/medhava-mark-white.svg` | *a drawing — no title element to read* | 407 B |
| `brand/delivery/Brand/medhava-mark.svg` | *a drawing — no title element to read* | 649 B |
| `brand/delivery/Domain9_Purchase/App01_Procurement/FormatA_UnifiedERP_anyIndustry/Procurement.html` | Medhava · Procurement (Unified ERP) | 48 KB |
| `brand/delivery/Domain9_Purchase/App01_Procurement/FormatA_UnifiedERP_anyIndustry/Procurement_BUILD_PROMPT.md` | Module 1 · Supply Chain & Procurement — App 1 of 6 RFQ → PO → GRN → 3-way match → vendor scorecard, wired to Stock, Finance, Manufacturing/Planning. | 13 KB |
| `brand/delivery/Domain9_Purchase/App02_VendorManagement/FormatA_UnifiedERP_anyIndustry/VendorManagement.html` | Medhava · Vendor Management (Unified ERP) | 47 KB |
| `brand/delivery/Domain9_Purchase/App02_VendorManagement/FormatA_UnifiedERP_anyIndustry/VendorManagement_BUILD_PROMPT.md` | Domain 9 · Purchase — App 2 of 2 Vendor 360 → bills & payments → aging → risk → performance-based sourcing, wired to Procurement, Finance and Quality. | 13 KB |
| `brand/delivery/Domain9_Purchase/README.md` | Business towards Intelligence | 3 KB |
| `brand/delivery/manifest.js` | WHAT WE DELIVER — one answer, read by everything that needs it. | 57 KB |
| `brand/delivery/module01/READ_ME_FIRST_Module_01_Dashboard_BI.md` | इस ZIP में दो अलग-अलग versions हैं. | 15 KB |
| `brand/delivery/website/MEDHAVA_BOS/Medhava_Website.md` | One Business Operating System for any trade: 22 modules and 113 apps over one shared data core. | 74 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m01.png` | *binary — carries no readable header* | 108 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m02.png` | *binary — carries no readable header* | 108 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m03.png` | *binary — carries no readable header* | 120 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m04.png` | *binary — carries no readable header* | 101 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m05.png` | *binary — carries no readable header* | 106 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m06.png` | *binary — carries no readable header* | 93 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m07.png` | *binary — carries no readable header* | 97 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m08.png` | *binary — carries no readable header* | 96 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m09.png` | *binary — carries no readable header* | 96 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m10.png` | *binary — carries no readable header* | 95 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m11.png` | *binary — carries no readable header* | 101 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m12.png` | *binary — carries no readable header* | 95 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m13.png` | *binary — carries no readable header* | 95 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m14.png` | *binary — carries no readable header* | 92 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m15.png` | *binary — carries no readable header* | 91 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m16.png` | *binary — carries no readable header* | 103 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m17.png` | *binary — carries no readable header* | 100 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m18.png` | *binary — carries no readable header* | 94 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m19.png` | *binary — carries no readable header* | 101 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m20.png` | *binary — carries no readable header* | 99 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m21.png` | *binary — carries no readable header* | 95 KB |
| `brand/delivery/website/MEDHAVA_BOS/shots/m22.png` | *binary — carries no readable header* | 133 KB |
| `brand/delivery/website/mkall.js` | ONE ARCHIVE, BOTH EDITIONS — everything, for reading. | 4 KB |
| `brand/delivery/website/mkarchitect.js` | THE ARCHITECT — what Medhava is, and why it is that. | 15 KB |
| `brand/delivery/website/mkaudit.js` | THE AUDIT-PHASE DOCUMENTS — four views of the same measured facts. | 40 KB |
| `brand/delivery/website/mkbenchmark.js` | WHERE THIS PRODUCT IS BEHIND, AND THE ORDER TO CLOSE IT IN. | 15 KB |
| `brand/delivery/website/mkbundle.js` | THE DELIVERY BUNDLE — the documents in a form that works away from this repository. | 7 KB |
| `brand/delivery/website/mkconflicts.js` | WHERE THE SPECIFICATION CONTRADICTS ITSELF. | 9 KB |
| `brand/delivery/website/mkcontents.js` | EVERY FILE IN EACH ARCHIVE, WITH WHAT IT SAYS IT IS. | 27 KB |
| `brand/delivery/website/mkfinal.js` | THE MEDHAVA BOS — the four platform documents as one file. | 13 KB |
| `brand/delivery/website/mkguide.js` | THE BUILD GUIDE — the technical design of the platform. | 17 KB |
| `brand/delivery/website/mkhandoff.js` | HANDOFF.md — THE ONE PROMPT ANY MODEL READS TO TAKE OVER. | 10 KB |
| `brand/delivery/website/mkhandover.js` | THE HANDOVER PACK — what to buy, what to do, and how to carry this to another tool. | 19 KB |
| `brand/delivery/website/mkhowto.js` | MEDHAVA_HOW_TO_BUILD.md — the followable path, generated and gated. | 12 KB |
| `brand/delivery/website/mklanding.js` | Builds the BOS landing page — the whole Business Operating System as one plain-text page you can read, search or send. | 39 KB |
| `brand/delivery/website/mkmasterspec.js` | THE COVERAGE SHEET — every line of the owner's master prompt, and where this stands on it. | 18 KB |
| `brand/delivery/website/mkprompts.js` | THE TWO MASTER BUILD PROMPTS — paste one at the start of a session and build. | 18 KB |
| `brand/delivery/website/mkregistry.js` | THE REQUIREMENTS REGISTRY — what is standing up, what is written down, and what proves it. | 13 KB |
| `brand/delivery/website/mkroadmap.js` | THE BUILD ROADMAP — one document per edition, carrying the whole life of the product. | 26 KB |
| `brand/delivery/website/mkshots.js` | SCREENSHOTS OF THE PRODUCT SCREENS, one per module. | 6 KB |
| `brand/delivery/website/mksite.js` | THE PUBLISHED SITE — the website and the browser apps, assembled for a real URL. | 14 KB |
| `brand/delivery/website/mkskills.js` | THE TWO SKILLS — an agent opens one and can start. | 11 KB |
| `brand/delivery/website/mkstarter.js` | THE TWO BUILD ARCHIVES — the product, and one tenant, and never the two in one file. | 54 KB |
| `brand/delivery/website/mktenant.js` | THE TENANT GUIDE — one business on the platform, in full. | 71 KB |

---

## The earlier prototype app line

**184 files · 10.0 MB.** Sixteen single-file browser apps and the tooling that builds them, from before the core existed. They run with no server and no database, which is both why they were useful and why they are not the product.

| File | What it says it is | Size |
|---|---|---:|
| `brand/suite/README.md` | Eight real, single-file business apps that share one engine kernel and one SmartHub-teal design system — the same visual language and architecture as the flagship Medhava OMS. | 3 KB |
| `brand/suite/RULES.md` | Rules that hold across all fifteen modules and the Platform spine. | 8 KB |
| `brand/suite/apps/01_accounting.js` | *no description in the file itself* | 7 KB |
| `brand/suite/apps/02_inventory.js` | *no description in the file itself* | 8 KB |
| `brand/suite/apps/03_purchase.js` | *no description in the file itself* | 6 KB |
| `brand/suite/apps/04_vendors.js` | *no description in the file itself* | 6 KB |
| `brand/suite/apps/05_invoicing.js` | *no description in the file itself* | 6 KB |
| `brand/suite/apps/06_expenses.js` | *no description in the file itself* | 5 KB |
| `brand/suite/apps/07_crm.js` | *no description in the file itself* | 6 KB |
| `brand/suite/apps/08_catalog.js` | *no description in the file itself* | 5 KB |
| `brand/suite/apps/09_orders.js` | *no description in the file itself* | 7 KB |
| `brand/suite/apps/10_shipping.js` | *no description in the file itself* | 6 KB |
| `brand/suite/apps/11_returns.js` | *no description in the file itself* | 6 KB |
| `brand/suite/apps/12_reconcile.js` | *no description in the file itself* | 5 KB |
| `brand/suite/apps/13_warehouse.js` | *no description in the file itself* | 5 KB |
| `brand/suite/apps/14_production.js` | *no description in the file itself* | 6 KB |
| `brand/suite/apps/15_materials.js` | *no description in the file itself* | 5 KB |
| `brand/suite/apps/16_hr.js` | *no description in the file itself* | 5 KB |
| `brand/suite/build_suite.js` | Builds every app in apps/ into out/<NN>_<Name>/{app.html, guide.md}. | 4 KB |
| `brand/suite/chrome.js` | WHERE CHROMIUM IS — asked once, answered the same way everywhere. | 4 KB |
| `brand/suite/deep/apps.js` | THE BROWSER APP LIST — one canonical answer, because a second one would drift. | 3 KB |
| `brand/suite/deep/askprint/config_generic.js` | Format A — Unified ERP (any industry). | 7 KB |
| `brand/suite/deep/askprint/core.js` | Medhava — Ask & Print (Platform · App 2) You are in another city. | 38 KB |
| `brand/suite/deep/audit.js` | Structural audit of the whole suite. | 24 KB |
| `brand/suite/deep/b2b/config_generic.js` | Format A — Unified ERP (any industry). | 4 KB |
| `brand/suite/deep/b2b/core.js` | Medhava — B2B & Credit (Module 03 · App 2) Wholesale orders with a real credit limit, tier pricing, and ageing that decides who gets the next order. | 27 KB |
| `brand/suite/deep/bookcss.js` | *no description in the file itself* | 5 KB |
| `brand/suite/deep/bookparts.js` | Shared page furniture for every module's PDF books — the extra CSS, the logo mark, the document wrapper, the page numberer, the cover, and the self-test table. | 15 KB |
| `brand/suite/deep/build_deep.js` | Builds a deep app (config + core) into out/<name>.html and verifies its engine (seed + self-tests) in Node. | 5 KB |
| `brand/suite/deep/check_deep.js` | Full interaction check for the deep apps: opens every view, clicks EVERY interactive control (buttons with data-act / data-go), and fails on any console error, page error or failed self-test. | 4 KB |
| `brand/suite/deep/crm/config_generic.js` | Format A — Unified ERP (any industry). | 15 KB |
| `brand/suite/deep/crm/core.js` | Medhava — CRM & Customer 360 (Module 02 · App 1) | 10 KB |
| `brand/suite/deep/d2c/config_generic.js` | Format A — Unified ERP (any industry). | 5 KB |
| `brand/suite/deep/d2c/core.js` | Medhava — D2C Sales (Module 03 · App 1) Your own storefront: cart → order → packed → shipped → delivered, with coupons, part-paid COD, loyalty points and abandoned-cart recovery. | 25 KB |
| `brand/suite/deep/dashboard/config_generic.js` | Format A — Unified ERP (any industry). | 5 KB |
| `brand/suite/deep/dashboard/core.js` | Medhava — CEO Dashboard (Module 01 · App 1) | 8 KB |
| `brand/suite/deep/docs/config_generic.js` | Format A — Unified ERP (any industry). | 15 KB |
| `brand/suite/deep/docs/core.js` | Medhava — Documents & eSign (Module 02 · App 2) | 9 KB |
| `brand/suite/deep/dumptests.js` | Runs each deep app's engine in a sandbox and writes the self-test names to tests.json, so the PDF books quote the real test list rather than a hand-typed copy. | 4 KB |
| `brand/suite/deep/export/config_generic.js` | Format A — Unified ERP (any industry). | 5 KB |
| `brand/suite/deep/export/core.js` | Medhava — Export (Module 03 · App 3) An export order is a document problem, not a selling problem. | 26 KB |
| `brand/suite/deep/groupcons/config_generic.js` | Format A — Unified ERP (any industry). | 5 KB |
| `brand/suite/deep/groupcons/core.js` | Medhava — Group Consolidation (Module 01 · App 3) | 8 KB |
| `brand/suite/deep/helpdesk/config_generic.js` | Format A — Unified ERP (any industry). | 15 KB |
| `brand/suite/deep/helpdesk/core.js` | Medhava — Helpdesk & Live Chat (Module 02 · App 3) | 10 KB |
| `brand/suite/deep/m04lib.js` | Medhava — Module 02 · the shared engine. | 33 KB |
| `brand/suite/deep/m04unified/config_generic.js` | Format A — Unified ERP (any industry). | 15 KB |
| `brand/suite/deep/m04unified/core.js` | Medhava — Module 04 · CRM, all three apps in one (Module 04 · App 4) | 27 KB |
| `brand/suite/deep/m04views.js` | Medhava — Module 02 · the shared screens. | 41 KB |
| `brand/suite/deep/m21lib.js` | Medhava — Module 01 · the shared engine. | 44 KB |
| `brand/suite/deep/m21unified/config_generic.js` | Format A — Unified ERP (any industry). | 7 KB |
| `brand/suite/deep/m21unified/core.js` | Medhava — Module 21 · Dashboard & BI, all three apps in one (Module 21 · App 4) | 28 KB |
| `brand/suite/deep/m21views.js` | Medhava — Module 01 · the shared screens. | 50 KB |
| `brand/suite/deep/manualparts.js` | Shared manual sections for every module's MANUAL.md — the install steps, the data/backup chapters, the troubleshooting list, and the wrapper that puts the whole manual inside one fenced block. | 17 KB |
| `brand/suite/deep/mkbook.js` | Generates the illustrated PDF tour (~17 pages) for a Procurement format, embedding HD screenshots. | 23 KB |
| `brand/suite/deep/mkbook_app.js` | A data-driven app book. Every app from Module 03 onward supplies a spec — cover copy, the | 6 KB |
| `brand/suite/deep/mkbook_m04.js` | Module 04 · CRM — the illustrated process PDFs. | 38 KB |
| `brand/suite/deep/mkbook_m05.js` | Module 05 · Sales — five app books (× 2 editions) + the module book, all through the shared data-driven generator so every layout and every page count is automatic. | 55 KB |
| `brand/suite/deep/mkbook_m15.js` | Module 15 · E-commerce / OMS — two app books (× 2 editions) + the module book, all through the shared data-driven generator so every layout and every page count is automatic. | 40 KB |
| `brand/suite/deep/mkbook_m21.js` | Module 21 · Dashboard & BI — the illustrated process PDFs. | 77 KB |
| `brand/suite/deep/mkbook_vendors.js` | Generates the illustrated PDF tour (17 pages) for Vendor Management, embedding HD screenshots. | 19 KB |
| `brand/suite/deep/mkmanual_m04.js` | Generates MANUAL.md for each app × each edition of Module 04 — eight in all. | 59 KB |
| `brand/suite/deep/mkmanual_m05.js` | Generates MANUAL.md for all five apps × both formats of Module 05 · Sales. | 37 KB |
| `brand/suite/deep/mkmanual_m15.js` | Generates MANUAL.md for both apps × both editions of Module 15 · E-commerce / OMS. | 27 KB |
| `brand/suite/deep/mkmanual_m21.js` | Generates MANUAL.md for each app × each edition of Module 21 — eight in all. | 52 KB |
| `brand/suite/deep/module_m04.js` | Module 04 — the single description of the module. | 13 KB |
| `brand/suite/deep/module_m05.js` | Module 05 · Sales — the single description of the module. | 13 KB |
| `brand/suite/deep/module_m15.js` | Module 15 · E-commerce / OMS — the single description of the module. | 8 KB |
| `brand/suite/deep/module_m21.js` | Module 21 — the single description of the module. | 12 KB |
| `brand/suite/deep/oms/config_generic.js` | Format A — Unified ERP (any industry). | 9 KB |
| `brand/suite/deep/oms/core.js` | Medhava — Marketplace OMS (Module 04 · App 1) Seven seller panels, one queue. | 37 KB |
| `brand/suite/deep/ordman/config_generic.js` | Format A — Unified ERP (any industry). | 11 KB |
| `brand/suite/deep/ordman/core.js` | Medhava — Order Management (Module 04 · App 2) One order book for every channel, and the two things that actually decide whether a customer is happy: WHERE the order ships from, and WHETHER the date you promised was ever possible. | 50 KB |
| `brand/suite/deep/pack_m04.js` | Module 04 — packs the two edition ZIPs from the one shared module description the PDF book also reads, so the two can never disagree. | 237 B |
| `brand/suite/deep/pack_m05.js` | Module 05 · Sales — packs the two edition ZIPs from the one shared module description the PDF book also reads, so the two can never disagree. | 246 B |
| `brand/suite/deep/pack_m15.js` | Module 15 · E-commerce / OMS — packs the two edition ZIPs from the one shared module description the PDF book also reads, so the two can never disagree. | 257 B |
| `brand/suite/deep/pack_m21.js` | Module 21 — packs the two edition ZIPs from the one shared module description the PDF book also reads, so the two can never disagree. | 237 B |
| `brand/suite/deep/packparts.js` | Shared packager for every module ZIP. | 20 KB |
| `brand/suite/deep/pos/config_generic.js` | Format A — Unified ERP (any industry). | 4 KB |
| `brand/suite/deep/pos/core.js` | Medhava — POS (Module 03 · App 4) Counter billing on the SAME stock number the website reads. | 25 KB |
| `brand/suite/deep/procurement/GUIDE_ERP.md` | Module 1 · Supply Chain & Procurement — App 1 of 6 RFQ → PO → GRN → 3-way match → vendor scorecard, wired to Stock, Finance, Manufacturing/Planning. | 13 KB |
| `brand/suite/deep/procurement/config_generic.js` | Format A — Unified ERP (any industry). | 3 KB |
| `brand/suite/deep/procurement/core.js` | Medhava Procurement — deep engine (RFQ → PO → GRN → 3-way match → vendor scorecard). | 21 KB |
| `brand/suite/deep/quotes/config_generic.js` | Format A — Unified ERP (any industry). | 5 KB |
| `brand/suite/deep/quotes/core.js` | Medhava — Quotes & Proforma (Module 03 · App 5) A quote is a promise with an expiry date. | 26 KB |
| `brand/suite/deep/reports/config_generic.js` | Format A — Unified ERP (any industry). | 6 KB |
| `brand/suite/deep/reports/core.js` | Medhava — Report Builder (Module 01 · App 2) | 9 KB |
| `brand/suite/deep/roadmap.js` | The canonical module order — read straight from the website's module data, so a roadmap table in any PDF or START_HERE can never drift from what the site publishes. | 2 KB |
| `brand/suite/deep/shot.js` | playwright-core was required from an absolute path inside a session scratchpad — a directory reclaimed when that session ends and absent from a fresh clone entirely. | 1 KB |
| `brand/suite/deep/shots/ERP_dash.png` | *binary — carries no readable header* | 234 KB |
| `brand/suite/deep/shots/ERP_grn.png` | *binary — carries no readable header* | 248 KB |
| `brand/suite/deep/shots/ERP_match.png` | *binary — carries no readable header* | 208 KB |
| `brand/suite/deep/shots/ERP_po.png` | *binary — carries no readable header* | 292 KB |
| `brand/suite/deep/shots/ERP_rfq.png` | *binary — carries no readable header* | 162 KB |
| `brand/suite/deep/shots/ERP_scorecard.png` | *binary — carries no readable header* | 196 KB |
| `brand/suite/deep/shots/ERP_vendors.png` | *binary — carries no readable header* | 237 KB |
| `brand/suite/deep/shots/ERP_wiring.png` | *binary — carries no readable header* | 366 KB |
| `brand/suite/deep/shots/VAS_dash.png` | *binary — carries no readable header* | 234 KB |
| `brand/suite/deep/shots/VAS_grn.png` | *binary — carries no readable header* | 240 KB |
| `brand/suite/deep/shots/VAS_match.png` | *binary — carries no readable header* | 207 KB |
| `brand/suite/deep/shots/VAS_po.png` | *binary — carries no readable header* | 288 KB |
| `brand/suite/deep/shots/VAS_rfq.png` | *binary — carries no readable header* | 164 KB |
| `brand/suite/deep/shots/VAS_scorecard.png` | *binary — carries no readable header* | 197 KB |
| `brand/suite/deep/shots/VAS_vendors.png` | *binary — carries no readable header* | 231 KB |
| `brand/suite/deep/shots/VAS_wiring.png` | *binary — carries no readable header* | 375 KB |
| `brand/suite/deep/shots/VERP_aging.png` | *binary — carries no readable header* | 242 KB |
| `brand/suite/deep/shots/VERP_dash.png` | *binary — carries no readable header* | 199 KB |
| `brand/suite/deep/shots/VERP_directory.png` | *binary — carries no readable header* | 224 KB |
| `brand/suite/deep/shots/VERP_ledger.png` | *binary — carries no readable header* | 261 KB |
| `brand/suite/deep/shots/VERP_risk.png` | *binary — carries no readable header* | 223 KB |
| `brand/suite/deep/shots/VERP_sourcing.png` | *binary — carries no readable header* | 219 KB |
| `brand/suite/deep/shots/VERP_v360.png` | *binary — carries no readable header* | 235 KB |
| `brand/suite/deep/shots/VERP_wiring.png` | *binary — carries no readable header* | 364 KB |
| `brand/suite/deep/shots/VVAS_aging.png` | *binary — carries no readable header* | 240 KB |
| `brand/suite/deep/shots/VVAS_dash.png` | *binary — carries no readable header* | 200 KB |
| `brand/suite/deep/shots/VVAS_directory.png` | *binary — carries no readable header* | 230 KB |
| `brand/suite/deep/shots/VVAS_ledger.png` | *binary — carries no readable header* | 266 KB |
| `brand/suite/deep/shots/VVAS_risk.png` | *binary — carries no readable header* | 223 KB |
| `brand/suite/deep/shots/VVAS_sourcing.png` | *binary — carries no readable header* | 228 KB |
| `brand/suite/deep/shots/VVAS_v360.png` | *binary — carries no readable header* | 238 KB |
| `brand/suite/deep/shots/VVAS_wiring.png` | *binary — carries no readable header* | 380 KB |
| `brand/suite/deep/shots_m04.js` | HD screenshots of every screen of Module 04, in populated states, for the PDF books. | 9 KB |
| `brand/suite/deep/shots_m05.js` | Module 05 · Sales — drives the real job in each of the five apps and asserts the result, then captures HD screenshots for the PDF books. | 13 KB |
| `brand/suite/deep/shots_m15.js` | Module 15 · E-commerce / OMS — drives the real job in both apps and asserts the RESULT of every click, then captures HD screenshots for the PDF books. | 16 KB |
| `brand/suite/deep/shots_m21.js` | HD screenshots of every screen of Module 21, in populated states, for the PDF books. | 8 KB |
| `brand/suite/deep/tests.json` | keys: D2C_ERP, D2C_VAS, B2B_ERP, B2B_VAS, EXP_ERP, EXP_VAS, POS_ERP, POS_VAS (+28 more) | 116 KB |
| `brand/suite/deep/vendors/GUIDE_ERP.md` | Domain 9 · Purchase — App 2 of 2 Vendor 360 → bills & payments → aging → risk → performance-based sourcing, wired to Procurement, Finance and Quality. | 13 KB |
| `brand/suite/deep/vendors/config_generic.js` | Format A — Unified ERP (any industry). | 2 KB |
| `brand/suite/deep/vendors/core.js` | Medhava Vendor Management — deep engine. | 21 KB |
| `brand/suite/deep/verify_m04.js` | Module 04 · the combined app, driven the way a person would drive it. | 14 KB |
| `brand/suite/deep/verify_m04_manual.js` | Every concrete claim the Module 04 manuals make, checked against the shipped HTML. | 22 KB |
| `brand/suite/deep/verify_m21.js` | Module 21 · the combined app, driven the way a person would drive it. | 11 KB |
| `brand/suite/deep/verify_zip_m04.js` | The Module 04 ZIPs, opened the way a customer opens them. | 5 KB |
| `brand/suite/design.css` | Vanijo Suite — shared SmartHub-teal design system (system fonts). | 8 KB |
| `brand/suite/kernel.js` | Medhava Suite kernel — shared UI runtime + components + store + self-tests. | 14 KB |
| `brand/suite/out/01_Accounting/app.html` | Medhava · Accounting | 31 KB |
| `brand/suite/out/01_Accounting/guide.md` | Double-entry books, GST & P&L — every voucher balances. | 1 KB |
| `brand/suite/out/02_Inventory/app.html` | Medhava · Inventory | 32 KB |
| `brand/suite/out/02_Inventory/guide.md` | Multi-location stock, valuation & reorder — quantities that always reconcile. | 1 KB |
| `brand/suite/out/03_Purchase/app.html` | Medhava · Purchase | 29 KB |
| `brand/suite/out/03_Purchase/guide.md` | Purchase orders, goods receipt & bill matching — from indent to inwards. | 1 KB |
| `brand/suite/out/04_Vendors/app.html` | Medhava · Vendors | 30 KB |
| `brand/suite/out/04_Vendors/guide.md` | Vendor master, payables & aging — know exactly whom you owe, and when. | 1 KB |
| `brand/suite/out/05_Invoicing/app.html` | Medhava · Invoicing | 30 KB |
| `brand/suite/out/05_Invoicing/guide.md` | GST tax invoices & receipts — totals that add up to the paise. | 1 KB |
| `brand/suite/out/06_Expenses/app.html` | Medhava · Expenses | 29 KB |
| `brand/suite/out/06_Expenses/guide.md` | Spend capture, categories & approvals — every rupee accounted, by head. | 1 KB |
| `brand/suite/out/07_CRM/app.html` | Medhava · CRM | 30 KB |
| `brand/suite/out/07_CRM/guide.md` | Leads, pipeline & stages — see weighted value move from New to Won. | 1 KB |
| `brand/suite/out/08_CatalogPIM/app.html` | Medhava · Catalog / PIM | 29 KB |
| `brand/suite/out/08_CatalogPIM/guide.md` | One product record, every channel — completeness scored before you list. | 1 KB |
| `brand/suite/out/09_SalesOrders/app.html` | Medhava · Sales Orders | 30 KB |
| `brand/suite/out/09_SalesOrders/guide.md` | Every channel, one order book — capture to delivered, value at each step. | 1 KB |
| `brand/suite/out/10_Shipping/app.html` | Medhava · Shipping | 30 KB |
| `brand/suite/out/10_Shipping/guide.md` | AWBs, couriers & delivery status — track RTO and freight in one board. | 1 KB |
| `brand/suite/out/11_ReturnsRMA/app.html` | Medhava · Returns / RMA | 29 KB |
| `brand/suite/out/11_ReturnsRMA/guide.md` | Return requests, reasons & refunds — close the loop from RMA to restock. | 1 KB |
| `brand/suite/out/12_Reconciliation/app.html` | Medhava · Reconciliation | 29 KB |
| `brand/suite/out/12_Reconciliation/guide.md` | Marketplace payouts vs orders — every rupee of fee and shortfall, found. | 1 KB |
| `brand/suite/out/13_Warehouse/app.html` | Medhava · Warehouse | 29 KB |
| `brand/suite/out/13_Warehouse/guide.md` | Bin-level pick lists — pick progress and accuracy on one board. | 1 KB |
| `brand/suite/out/14_Production/app.html` | Medhava · Production | 29 KB |
| `brand/suite/out/14_Production/guide.md` | Karigar work orders & piece-rate wages — WIP to finished, wages that add up. | 1 KB |
| `brand/suite/out/15_MaterialsBOM/app.html` | Medhava · Materials / BOM | 29 KB |
| `brand/suite/out/15_MaterialsBOM/guide.md` | Raw materials & bills of materials — costed product recipes from live rates. | 1 KB |
| `brand/suite/out/16_HRPayroll/app.html` | Medhava · HR / Payroll | 29 KB |
| `brand/suite/out/16_HRPayroll/guide.md` | Headcount, attendance & pro-rated payroll — salaries from days present. | 1 KB |
| `brand/suite/out/README.md` | Eight real, single-file business apps that share one engine kernel and one SmartHub-teal design system — the same visual language and architecture as the flagship Medhava OMS. | 3 KB |
| `brand/suite/out/README_BATCH2.md` | Eight more real, single-file apps on the same engine kernel and SmartHub-teal design system as Batch 1 and the flagship OMS. | 2 KB |
| `brand/suite/providers.js` | Medhava — Connectors: the no-lock-in layer, shared by every app in every module. | 18 KB |
| `brand/suite/render_check.js` | *no description in the file itself* | 2 KB |
| `brand/suite/router.js` | Medhava — Provider Router & Cost Guard. | 20 KB |
| `brand/suite/studio/build_studio.js` | Assemble Vastrangam_BOS_Data_Studio.html — one file, opened by double-clicking. | 14 KB |
| `brand/suite/studio/check_studio.js` | Drive the built page the way a person drives it. | 8 KB |
| `brand/suite/studio/motion_render.js` | Vastrangam BOS — Motion Renderer: HTML/CSS in, a real MP4 out. | 19 KB |
| `brand/suite/studio/skill_runner.js` | Vastrangam BOS — the Node-side door onto the same engine the browser tool uses. | 8 KB |
| `brand/suite/studio/studio_core.js` | Vastrangam BOS — Data Studio, the engine. | 30 KB |
| `brand/suite/studio/studio_dashboard.js` | Vastrangam BOS — the dashboard, honestly named. | 15 KB |
| `brand/suite/studio/studio_reports.js` | The three deliverable workbooks, laid out exactly as the master prompts spell them: the E-commerce report, the Karigar production view, and the four-sheet Karigar cost report. | 16 KB |
| `brand/suite/studio/studio_ui.js` | Vastrangam BOS — Data Studio, the part a person touches. | 16 KB |
| `brand/suite/studio/studio_xlsx.js` | A workbook writer that can carry formatting. | 13 KB |
| `brand/suite/studio/verify_studio.js` | Vastrangam BOS — Data Studio, checked against the business's own output. | 33 KB |
| `brand/suite/template.html` | __TITLE__ | 5 KB |
| `brand/suite/xlsx.js` | Medhava Suite — spreadsheets, with nothing behind them. | 25 KB |

---

## Logos, fonts and the brand sheet

**16 files · 1.4 MB.** The visual identity used by the website and the rendered PDFs.

| File | What it says it is | Size |
|---|---|---:|
| `brand/identity/Medhava_Brand_Identity.png` | *binary — carries no readable header* | 562 KB |
| `brand/identity/Medhava_MyLogo.png` | *binary — carries no readable header* | 605 KB |
| `brand/identity/brandsheet.html` | Medhava — Brand Identity | 9 KB |
| `brand/identity/icon-16.png` | *binary — carries no readable header* | 342 B |
| `brand/identity/icon-180.png` | *binary — carries no readable header* | 7 KB |
| `brand/identity/icon-32.png` | *binary — carries no readable header* | 741 B |
| `brand/identity/icon-512.png` | *binary — carries no readable header* | 10 KB |
| `brand/identity/icon-64.png` | *binary — carries no readable header* | 2 KB |
| `brand/identity/medhava-appicon.svg` | *a drawing — no title element to read* | 877 B |
| `brand/identity/medhava-favicon.svg` | *a drawing — no title element to read* | 877 B |
| `brand/identity/medhava-final-mark.svg` | *a drawing — no title element to read* | 1 KB |
| `brand/identity/medhava-icon.svg` | *a drawing — no title element to read* | 682 B |
| `brand/identity/medhava-logo.png` | *binary — carries no readable header* | 267 KB |
| `brand/identity/medhava-mark-white.svg` | *a drawing — no title element to read* | 534 B |
| `brand/identity/medhava-mark.svg` | *a drawing — no title element to read* | 752 B |
| `brand/identity/mylogo.html` | Medhava — my logo | 11 KB |

---

## Deployment, tooling and the build

**22 files · 381 KB.** The service unit, the web-server blocks, the PDF renderer, the evidence log and the checks that run on every push. Nothing here is business logic; all of it is how the business logic gets onto a machine and stays honest.

| File | What it says it is | Size |
|---|---|---:|
| `.claude/skills/anti-cheat-protocol/SKILL.md` | Anti-Cheat Protocol | 5 KB |
| `.github/workflows/ci.yml` | The checks in CLAUDE.md §6, run on every push. | 8 KB |
| `.github/workflows/pages.yml` | THE SITE, PUBLISHED — the one part of this product that can actually go live from here. | 6 KB |
| `.gitignore` | Regenerable build intermediates — rebuild with the scripts in the same folder. | 6 KB |
| `MASTER_SPEC_COVERAGE.xlsx` | *binary — carries no readable header* | 70 KB |
| `deploy/medhava-app.service` | The Node app as a service. | 1 KB |
| `deploy/nginx/app.medhava.com.conf` | app.medhava.com — the Node app (app/server/index.js, port 3000). | 1 KB |
| `deploy/nginx/medhava.com.conf` | medhava.com — the marketing site. | 1 KB |
| `deploy/nginx/n8n.medhava.com.conf` | n8n.medhava.com — self-hosted automation. | 1 KB |
| `deploy/publish-site.sh` | Publish the built marketing site to the VPS. | 1 KB |
| `docs/truth/requirements.json` | keys: generated_from, regenerate_with, gate, statuses, status_requires_file, status_requires_recorded_run, tally, evidence_log (+2 more) | 48 KB |
| `docs/verification/EVIDENCE.md` | Every entry below is one command that was actually run, with the exit code the process returned, the revision it ran against, and the SHA-256 of the files it was about. | 52 KB |
| `package-lock.json` | keys: name, version, lockfileVersion, requires, packages | 51 KB |
| `package.json` | keys: name, version, private, description, license, engines, scripts, dependencies (+1 more) | 6 KB |
| `private/research/SOURCE_REGISTER.md` | Every document and image supplied for this project, read in full, recorded here so that nothing is ever cited again from a filename. | 43 KB |
| `tools/evidence.js` | EVIDENCE CAPTURE — the record that does not depend on my word. | 12 KB |
| `tools/evidence.test.js` | THE EVIDENCE TOOL, TESTED — because a check that only holds while somebody remembers to run it is not a check. | 10 KB |
| `tools/history_check.sh` | DOES ANY COMMIT ON THIS BRANCH STILL CARRY A REAL PERSON'S NAME? | 3 KB |
| `tools/masterspec_xlsx.py` | MASTER_SPEC_COVERAGE.xlsx — every line of the master specification, and where this stands. | 10 KB |
| `tools/report_pdf.js` | Print a rendered HTML page to PDF. | 5 KB |
| `tools/report_pdf.py` | Turn PROJECT_REPORT.md into a branded HTML page, ready for printing to PDF. | 20 KB |
| `tools/scrub_roster.js` | REPLACE THE REAL ROSTER WITH A SYNTHETIC ONE OF THE SAME SHAPE. | 21 KB |

---

## The PDFs, in a separate archive

**24 documents · `MEDHAVA_PDF.zip`.** These are not in `MEDHAVA_BOS.zip` and that is deliberate. The archive states its own total size in the note inside it; this page cannot, because one of the files below is the PDF of this page.

Each one is rendered from a markdown file of the same name, and that markdown IS in
this archive. So for anything reading the archive to build the software, the PDF was
a second copy of a document it reads worse — and between them they were nearly half
the archive's size. They ship in `MEDHAVA_PDF.zip` instead, for reading.

**If a PDF and its markdown ever disagree, the markdown is right.** The PDF is
rendered from it, so a PDF saying something different is an older rendering. In the
repository `node brand/site/checkcoverage.js` fails the build when a PDF is older
than its own source.

| Document | Size |
|---|---:|
| `BENCHMARK_GAPS.pdf` | 193 KB |
| `BUILD_QUEUE.pdf` | 169 KB |
| `CONSTRAINTS.pdf` | 127 KB |
| `CURRENT_STATE_AUDIT.pdf` | 136 KB |
| `DEPLOYMENT.pdf` | 152 KB |
| `GAP_ANALYSIS.pdf` | 138 KB |
| `MASTER_SPEC_COVERAGE.pdf` | 124 KB |
| `MEDHAVA_ARCHITECT.pdf` | 246 KB |
| `MEDHAVA_BUILD_GUIDE.pdf` | 843 KB |
| `MEDHAVA_CONTENTS.pdf` | — |
| `MEDHAVA_HOW_TO_BUILD.pdf` | 200 KB |
| `MEDHAVA_PLAN_OF_ACTION.pdf` | 939 KB |
| `Medhava_BOS.pdf` | 3.7 MB |
| `Medhava_Build_Roadmap.pdf` | 1.0 MB |
| `PARITY_PLAN.pdf` | 122 KB |
| `PRODUCT_CAPABILITY_MATRIX.pdf` | 153 KB |
| `REQUIREMENTS_REGISTRY.pdf` | 243 KB |
| `SETUP_CHECKLIST.pdf` | 138 KB |
| `SEVEN_STAGE_ROADMAP.pdf` | 149 KB |
| `SPEC_CONFLICTS.pdf` | 176 KB |
| `START_HERE_OWNER.pdf` | 78 KB |
| `WORKING_WITH_AI_TOOLS.pdf` | 108 KB |
| `ZOHO_CAPABILITY_BENCHMARK.pdf` | 164 KB |
| `brand/delivery/website/MEDHAVA_BOS/Medhava_Website.pdf` | 2.1 MB |

---

## Where a file in this archive still names one business

**10 of the 428 descriptions below quote a file whose own header names a particular trade.** They are not redacted, because every
description on this page is the file’s own words and a tidied quotation would be a
different claim from the one the file makes. They are listed instead:

- `brand/site/checksets.js`
- `brand/suite/out/14_Production/guide.md`
- `brand/suite/studio/build_studio.js`
- `brand/suite/studio/motion_render.js`
- `brand/suite/studio/skill_runner.js`
- `brand/suite/studio/studio_core.js`
- `brand/suite/studio/studio_dashboard.js`
- `brand/suite/studio/studio_reports.js`
- `brand/suite/studio/studio_ui.js`
- `brand/suite/studio/verify_studio.js`

All but one are in the earlier prototype app line, which is committed build output
from before the product and the customer were separated. The build reports the same
thing every time it runs it. The product’s own engine — everything under `core/` and
`medhava/` — contains none, and that is the ring that has to be empty.

---

## The files that describe themselves, and the ones that do not

30 files in this archive carry no description of any kind — no header comment,
no title, nothing readable at the top. They are named here rather than given a
sentence somebody invented, and adding a header to any of them is a real improvement
to the file rather than to this document:

- `brand/delivery/Brand/medhava-icon.svg` — 682 B, a drawing — no title element to read
- `brand/delivery/Brand/medhava-mark-white.svg` — 407 B, a drawing — no title element to read
- `brand/delivery/Brand/medhava-mark.svg` — 649 B, a drawing — no title element to read
- `brand/identity/medhava-appicon.svg` — 877 B, a drawing — no title element to read
- `brand/identity/medhava-favicon.svg` — 877 B, a drawing — no title element to read
- `brand/identity/medhava-final-mark.svg` — 1 KB, a drawing — no title element to read
- `brand/identity/medhava-icon.svg` — 682 B, a drawing — no title element to read
- `brand/identity/medhava-mark-white.svg` — 534 B, a drawing — no title element to read
- `brand/identity/medhava-mark.svg` — 752 B, a drawing — no title element to read
- `brand/site/llms.txt` — 6 KB, no description in the file itself
- `brand/suite/apps/01_accounting.js` — 7 KB, no description in the file itself
- `brand/suite/apps/02_inventory.js` — 8 KB, no description in the file itself
- `brand/suite/apps/03_purchase.js` — 6 KB, no description in the file itself
- `brand/suite/apps/04_vendors.js` — 6 KB, no description in the file itself
- `brand/suite/apps/05_invoicing.js` — 6 KB, no description in the file itself
- `brand/suite/apps/06_expenses.js` — 5 KB, no description in the file itself
- `brand/suite/apps/07_crm.js` — 6 KB, no description in the file itself
- `brand/suite/apps/08_catalog.js` — 5 KB, no description in the file itself
- `brand/suite/apps/09_orders.js` — 7 KB, no description in the file itself
- `brand/suite/apps/10_shipping.js` — 6 KB, no description in the file itself
- `brand/suite/apps/11_returns.js` — 6 KB, no description in the file itself
- `brand/suite/apps/12_reconcile.js` — 5 KB, no description in the file itself
- `brand/suite/apps/13_warehouse.js` — 5 KB, no description in the file itself
- `brand/suite/apps/14_production.js` — 6 KB, no description in the file itself
- `brand/suite/apps/15_materials.js` — 5 KB, no description in the file itself
- `brand/suite/apps/16_hr.js` — 5 KB, no description in the file itself
- `brand/suite/deep/bookcss.js` — 5 KB, no description in the file itself
- `brand/suite/render_check.js` — 2 KB, no description in the file itself
- `core/schema.postgres.sql` — 105 KB, no description in the file itself
- `core/schema.sql` — 13 KB, no description in the file itself

The 69 images, fonts and rendered PDFs are not in that list. A PNG has no header to read, and
the most a contents page can honestly say about one is its name and its size, which it does.

---

## How to check this document is true

Do not take its word for it. From the repository:

```
node brand/site/checkcontents.js --summary
```

That opens both built archives and compares them entry by entry against these
documents. It fails if the archive holds a file this page does not list, if this page
lists a file the archive does not hold, if a stated count is not the length of its own
list, or if a description here is not text that really occurs in the file it describes.

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

### backup

A copy of everything, kept somewhere else, so a mistake or a failure does not lose your work.

*Zaroori kaagzaat ki photocopy, doosri jagah rakhi hui. Asli jal jaaye toh bhi kaam nahin rukta.*

### integer paise

Money stored as a whole number of paise instead of a decimal, so amounts are exact and rounding can never quietly lose a rupee.

*Paisa hamesha poore paise mein ginte hain, aadha-adhoora kabhi nahin — isliye hisaab kabhi ek rupya idhar-udhar nahin hota.*

### audit trail

An automatic record of every change — what changed, who changed it, and when.

*Har entry ke saath naam aur time apne aap likha jaata hai. Baad mein koi bole "maine nahin kiya", toh register bata deta hai.*

### API

The agreed way two pieces of software talk to each other, so one can ask the other for something and get a predictable answer.

*Waiter. Aap kitchen mein nahin jaate — waiter ko order dete ho, wahi khaana le aata hai. Waiter badal jaaye toh bhi order dene ka tarika wahi rehta hai.*

### queue

A waiting line for work that does not have to finish this second — sending a hundred messages, building a big report.

*Darzi ki dukaan ka parchi system. Kaam parchi pe likh ke lag gaya line mein; customer khada intezaar nahin karta.*

### job

One piece of work taken off the queue and done in the background.

*Line mein se uthayi gayi ek parchi, ab uska kaam ho raha hai.*

### deployment

Putting a new version of the software in place so people start using it.

*Nayi dukaan kholna ya purani ko naya roop dena — jab tak shutter nahin uthta, customer ko farq nahin padta.*

### model

The piece of artificial intelligence that reads or writes text, tags a photograph, or answers a question.

*Ek bahut padha-likha assistant. Kaam accha karta hai, par har baat pe usse poochho toh kharcha aur waqt dono lagta hai.*

### provider

A company whose service the system uses — for messages, for payments, for artificial intelligence, for delivery.

*Supplier. Ek supplier maal na de toh doosre se le lo — kaam nahin rukna chahiye.*

