# What is inside VASTRANGAM_TENANT.zip

**All 172 files, every one of them, with what each file says it is.** Not a selection and not a summary of the interesting ones — the list below is the complete
contents of the archive, and a checker opens the real zip and fails the build if a
single entry is in one and not in the other.

---

## How to read this

| | |
|---|---:|
| Files in the archive | **172** |
| Total size on disk | 10.8 MB |
| Files whose description was read out of the file itself | 128 |
| Data files described by their own top-level keys | 11 |
| Images, fonts and rendered PDFs — no readable header | 25 |
| Files carrying no description at all, named below | 6 |

**Nothing in the "what it is" column was written about a file.** Each line was read 
*out of* the file — the header comment a source file opens with, the first heading of
a document, the top-level keys of a data file. A file that carries no description is
reported as carrying none rather than given a guess, because a gap that says so can be
closed and a guess cannot be found.

**This archive is a configuration, not a program.** It cannot be run on its own and
it is not meant to be: it unzips *over* an extracted product archive and completes
it. That is checked by extracting the product, running its suite with no tenant
present, unzipping this over it, and running both suites again.

---

## Where the files are, and what each area is for

| Area | Files | Size |
|---|---:|---:|
| Start here | 1 | — |
| The delivered documents | 15 | 1.4 MB |
| The payroll and attendance engine | 35 | 568 KB |
| The AI content engine | 18 | 208 KB |
| The registers — the lists everything else is derived from | 4 | 1.4 MB |
| The document generators and the archive builders | 28 | 2.7 MB |
| The earlier prototype app line | 66 | 1.0 MB |
| Logos, fonts and the brand sheet | 3 | 2.5 MB |
| Deployment, tooling and the build | 2 | 1.0 MB |

---

## Start here

**1 file · —.** Written by the archive builder at the moment the archive was made. These are the first things to open: one names the commands that run everything else, the other says which of these files are worth reading and what each costs to read.

| File | What it says it is | Size |
|---|---|---:|
| `VASTRANGAM_START_HERE.md` | Written into the archive when it is built — what this is, and the commands that run it. | — |

---

## The delivered documents

**15 files · 1.4 MB.** The reading matter — the plan, the design argued, the runbook, the rulebook, the audits, and this contents list. Each .md has a .pdf beside it rendered from the same source, so the two cannot disagree.

| File | What it says it is | Size |
|---|---|---:|
| `PLAN_OF_ACTION.md` | One platform. Every function. | 304 KB |
| `PROJECT_REPORT.md` | Every module, every rule, every conflict, and the order to build it. | 82 KB |
| `SAMPLE_RUN_Teal_Chinon_Anarkali.md` | Generated with the Humanized Engine. | 14 KB |
| `VASTRANGAM_BUILD_GUIDE.md` | Setting this business up on Medhava, in order: from signing up to running live. | 56 KB |
| `VASTRANGAM_CONTENTS.md` | Every file in this archive, with what each one says it is — the document you are reading. | — |
| `VASTRANGAM_MODULES_COMPLETE.md` | This is not the plan. The plan lists what each module is for. | 52 KB |
| `VASTRANGAM_PROMPT.md` | Set the business up on Medhava, and build its own apps. | 19 KB |
| `VASTRANGAM_RULES_AND_LOGIC.md` | Everything this business runs on: every rule, every calculation, and what the system refuses. | 250 KB |
| `VASTRANGAM_TENANT.SKILL.md` | You are setting up one business on a platform you are not building. | 12 KB |
| `Vastrangam_AI_Content_Engine.SKILL.md` | A single engine that converts any Vastrangam product into world-class, search-ranked output for any channel. | 5 KB |
| `Vastrangam_AI_Content_Engine.md` | World-Class Omni-Channel Listing & Content System · Analysis-First · Phase 0 + 13 Phases · Ranks on SEO · AEO · AIO · SGO · SGE · GEO · SXO Channels: the storefront platform · Amazon · Flipkart ·… | 61 KB |
| `Vastrangam_AI_Engine_MANUAL.md` | Module 14 · One studio, the whole catalogue workflow, one file. | 33 KB |
| `Vastrangam_Build_Roadmap.md` | Everything, in one file: the ten stages from idea to launch, then all 31 modules, all 165 apps and all 302 rules in full — each rule with what the system does, what it refuses to do instead, and the… | 255 KB |
| `Vastrangam_Content_Engine_Humanized.md` | Write like a person who loves this craft. | 17 KB |
| `Vastrangam_Final_As_Tenant.md` | One business on Medhava: how it is set up, and everything it runs on. | 306 KB |

---

## The payroll and attendance engine

**35 files · 568 KB.** Reads the business’s own workbooks, resolves every staff-month to a rate and a basis, and reports what it could NOT resolve rather than paying zero. This is the single most finished piece of software in either archive.

| File | What it says it is | Size |
|---|---|---:|
| `engine/README.md` | The rules live here. The data does not. | 12 KB |
| `engine/fixtures/acceptance_16a.json` | keys: _about, _source, _which_files_these_came_from, _what_can_be_checked_today, period, karigar, offline_sales, ecommerce | 4 KB |
| `engine/fixtures/channels.json` | keys: _about, _this_is_today_s_data_not_a_design, _the_owner_will_set_these_himself, _a_discrepancy_left_standing_rather_than_resolved, _a_channel_belongs_to_a_company, _kinds, as_of, channels (+2 more) | 3 KB |
| `engine/fixtures/garment_columns.json` | keys: _about, _why_it_matters, _header_layout, columns, set_types, _inference_order, _authority, _column_count_discrepancy | 5 KB |
| `engine/fixtures/holidays.json` | keys: _about, _why_this_is_a_file_and_not_a_rule, _religion_is_read_here_and_nowhere_else, _absence_is_not_a_default, _dates_are_the_owner_s_and_this_list_is_deliberately_empty, policy, applies_to_kinds, observances (+3 more) | 4 KB |
| `engine/fixtures/karigar_units.json` | keys: _about, _why_this_file_exists, _membership_is_dated_because_teams_change, _spelling, as_of, active_units, active_members, units (+2 more) | 5 KB |
| `engine/fixtures/locked_lists.json` | keys: _about, _what_locked_means, service_providers, crm_lead_sources, no_rate_designs | 3 KB |
| `engine/fixtures/master.json` | keys: _about, _derivation, _november_threshold, _provisional, people, employment, pay_basis, salary (+36 more) | 40 KB |
| `engine/fixtures/rule_change_log.json` | keys: _about, _how, entries | 2 KB |
| `engine/fixtures/set_types.json` | keys: _about, _why_this_cannot_be_guessed, _how_these_were_derived, _confirm, _required_means, _why_they_are_all_null, _who_decides, _slotless_members (+5 more) | 11 KB |
| `engine/recalc.py` | Recalculate a built workbook and refuse to pass it if anything is wrong. | 7 KB |
| `engine/run.py` | Run the engine over real files. | 20 KB |
| `engine/tests/derive_slot_optionality.py` | Measure what an EMPTY slot means, per set type — instead of asserting it. | 5 KB |
| `engine/tests/fixture_to_template.py` | Write master.json back out as a Staff & Karigar Master Data workbook. | 8 KB |
| `engine/tests/make_template.py` | Build a Staff & Karigar Master Data workbook to §1.1's exact shape. | 10 KB |
| `engine/tests/selftest.py` | Self-tests — Part 11. | 146 KB |
| `engine/tests/validate.py` | VALIDATE THE ENGINE AGAINST YOUR OWN WORKBOOKS — one command, one folder. | 8 KB |
| `engine/vastrangam/__init__.py` | Vastrangam staff and karigar engine. | 2 KB |
| `engine/vastrangam/allocation.py` | Cost allocation — Part 6. | 3 KB |
| `engine/vastrangam/attendance.py` | Attendance codes and the attendance book — Part 4.1 and Part 5. | 4 KB |
| `engine/vastrangam/calendar_util.py` | Months, dates and financial years. | 5 KB |
| `engine/vastrangam/gates.py` | Validation gates — Part 10. | 23 KB |
| `engine/vastrangam/karigar.py` | Karigar — Part 8. | 20 KB |
| `engine/vastrangam/karigar_run.py` | The karigar pipeline, end to end — §7 and §8. | 15 KB |
| `engine/vastrangam/logs.py` | Effective-dated logs — Part 2 and Part 3 of the spec. | 9 KB |
| `engine/vastrangam/master.py` | Master data — the six effective-dated logs, the alias table, the shift table. | 33 KB |
| `engine/vastrangam/names.py` | Names in, one identity out. | 3 KB |
| `engine/vastrangam/parsing.py` | Parsing — Part 9. Survives any file shape. | 20 KB |
| `engine/vastrangam/pay.py` | Staff pay — Combined Master Prompt §3. | 28 KB |
| `engine/vastrangam/performance.py` | Performance bands — Part 7. | 3 KB |
| `engine/vastrangam/runlog.py` | The run log — Part 12. | 5 KB |
| `engine/vastrangam/sheetstyle.py` | How every sheet in the deliverable looks — Combined Master Prompt §6. | 6 KB |
| `engine/vastrangam/template.py` | The Staff & Karigar Master Data workbook — §1 of the Universal Master Prompt. | 26 KB |
| `engine/vastrangam/workbook.py` | The deliverable — one workbook per financial year. | 67 KB |
| `engine/vastrangam/xlsx.py` | Workbooks in, plain rows out. | 4 KB |

---

## The AI content engine

**18 files · 208 KB.** A separate server for drafting product copy and imagery, with its own keys entered at runtime and never stored in the repository.

| File | What it says it is | Size |
|---|---|---:|
| `app/.env.example` | Vastrangam AI Engine · settings Copy this file to .env and fill in what you have. | 2 KB |
| `app/README.md` | This is the same engine as the single HTML file, running properly: as an app on your own computer, with your work stored in a real place instead of inside one browser. | 5 KB |
| `app/build.cjs` | build the web app from the same modules the single file uses | 7 KB |
| `app/package-lock.json` | keys: name, version, lockfileVersion, requires, packages | 46 KB |
| `app/package.json` | keys: name, version, private, description, type, scripts, engines, dependencies | 781 B |
| `app/server/ai.js` | the Gemini proxy | 7 KB |
| `app/server/browsertest.js` | npm run test:browser — drive the real app in a real browser | 25 KB |
| `app/server/env.js` | .env, read before anything else | 1 KB |
| `app/server/index.js` | Vastrangam AI Engine — the server | 11 KB |
| `app/server/selftest.js` | npm test — does the server actually work? | 14 KB |
| `app/server/setup-supabase.js` | npm run setup:supabase | 3 KB |
| `app/server/singlefiletest.js` | the offline single file, opened the way you open it | 7 KB |
| `app/server/store.js` | where the work lives | 5 KB |
| `app/server/verify.js` | npm run verify — the whole thing, three times | 2 KB |
| `app/server/video.js` | MP4, properly | 7 KB |
| `app/start-vastrangam.bat` | @echo off REM REM Vastrangam AI Engine REM REM Double-click this file. | 2 KB |
| `app/web/00_bridge.js` | browser → server | 7 KB |
| `research/build_mehendi_green_anarkali_doc.js` | *no description in the file itself* | 55 KB |

---

## The registers — the lists everything else is derived from

**4 files · 1.4 MB.** Modules, apps, rules, tools, the stack, the requirements registry, and the checkers that gate them. No count in any document here is typed: it is read from one of these files, which is why the counts have changed twice without a document going stale.

| File | What it says it is | Size |
|---|---|---:|
| `brand/site/INDEX_VASTRANGAM.md` | A unified ERP: 21 modules and 113 apps over one shared data core. | 48 KB |
| `brand/site/book_vastrangam.html` | Vastrangam BOS — One business. One brain. \| Unified ERP with 165 apps | 692 KB |
| `brand/site/edition_vastrangam.js` | THE VASTRANGAM EDITION — the same software, described in one trade's own words. | 37 KB |
| `brand/site/index_vastrangam.html` | Vastrangam BOS — One business. One brain. \| Unified ERP with 165 apps | 692 KB |

---

## The document generators and the archive builders

**28 files · 2.7 MB.** Every delivered document is written by a script in here, from the registers above. To change a document you change its generator or its register, never the document — a hand-edit is overwritten the next time anything is built.

| File | What it says it is | Size |
|---|---|---:|
| `brand/delivery/Domain9_Purchase/App01_Procurement/FormatB_Vastrangam/Procurement.html` | Medhava · Procurement (Vastrangam) | 48 KB |
| `brand/delivery/Domain9_Purchase/App01_Procurement/FormatB_Vastrangam/Procurement_BUILD_PROMPT.md` | Module 1 · Supply Chain & Procurement — App 1 of 6 RFQ → PO → GRN → 3-way match → vendor scorecard, wired to Stock, Finance (a desktop accounting package), Manufacturing/Karigar. | 13 KB |
| `brand/delivery/Domain9_Purchase/App02_VendorManagement/FormatB_Vastrangam/VendorManagement.html` | Medhava · Vendor Management (Vastrangam) | 47 KB |
| `brand/delivery/Domain9_Purchase/App02_VendorManagement/FormatB_Vastrangam/VendorManagement_BUILD_PROMPT.md` | Domain 9 · Purchase — App 2 of 2 Mill 360 → bills & payments → aging → risk → performance-based sourcing, wired to Procurement, Finance (a desktop accounting package) and Quality. | 12 KB |
| `brand/delivery/website/VASTRANGAM_BOS/Vastrangam_BOS_Data_Studio.html` | Vastrangam BOS · Data Studio | 346 KB |
| `brand/delivery/website/VASTRANGAM_BOS/Vastrangam_BOS_Website.md` | The Business Operating System for Vastrangam Group: 31 modules and 165 apps over one shared data core. | 94 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m01.png` | *binary — carries no readable header* | 112 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m02.png` | *binary — carries no readable header* | 100 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m03.png` | *binary — carries no readable header* | 121 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m04.png` | *binary — carries no readable header* | 93 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m05.png` | *binary — carries no readable header* | 105 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m06.png` | *binary — carries no readable header* | 87 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m07.png` | *binary — carries no readable header* | 92 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m08.png` | *binary — carries no readable header* | 89 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m09.png` | *binary — carries no readable header* | 94 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m10.png` | *binary — carries no readable header* | 91 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m11.png` | *binary — carries no readable header* | 95 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m12.png` | *binary — carries no readable header* | 89 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m13.png` | *binary — carries no readable header* | 92 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m14.png` | *binary — carries no readable header* | 94 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m15.png` | *binary — carries no readable header* | 89 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m16.png` | *binary — carries no readable header* | 97 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m17.png` | *binary — carries no readable header* | 101 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m18.png` | *binary — carries no readable header* | 95 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m19.png` | *binary — carries no readable header* | 96 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m20.png` | *binary — carries no readable header* | 99 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m21.png` | *binary — carries no readable header* | 98 KB |
| `brand/delivery/website/VASTRANGAM_BOS/shots/m22.png` | *binary — carries no readable header* | 134 KB |

---

## The earlier prototype app line

**66 files · 1.0 MB.** Sixteen single-file browser apps and the tooling that builds them, from before the core existed. They run with no server and no database, which is both why they were useful and why they are not the product.

| File | What it says it is | Size |
|---|---|---:|
| `brand/suite/aiengine/05_store.js` | Vastrangam AI Engine — image store (IndexedDB) localStorage cannot hold 20–30 full-resolution photos. | 3 KB |
| `brand/suite/aiengine/10_kernel.js` | Vastrangam AI Engine — runtime kernel One global VA. | 15 KB |
| `brand/suite/aiengine/15_themes.js` | Vastrangam AI Engine — theme engine Free themes + an AI theme generator, applied live by writing CSS custom properties onto :root. | 6 KB |
| `brand/suite/aiengine/16_theme_screen.js` | Vastrangam AI Engine — Themes screen (free + AI, fully editable) | 4 KB |
| `brand/suite/aiengine/20_data.js` | Vastrangam AI Engine — data + libraries The vocabulary libraries from the Content Engine spec, so generation is real and offline. | 18 KB |
| `brand/suite/aiengine/22_catalogue.js` | Vastrangam AI Engine — Catalogue (bulk upload → vision → product → colour → pose) v3: the app LOOKS AT THE PHOTO. | 30 KB |
| `brand/suite/aiengine/23_composer.js` | Vastrangam AI Engine — the composer | 9 KB |
| `brand/suite/aiengine/25_ai.js` | Vastrangam AI Engine — the AI engine (primary path) v3 inverts v2. | 29 KB |
| `brand/suite/aiengine/27_edit.js` | Vastrangam AI Engine — click anything, change it | 5 KB |
| `brand/suite/aiengine/28_studio.js` | Vastrangam AI Engine — the AI Studio | 13 KB |
| `brand/suite/aiengine/29_brief.js` | Vastrangam AI Engine — the product brief chat | 21 KB |
| `brand/suite/aiengine/30_content_engine.js` | Vastrangam AI Engine — Content Engine (offline 13-phase generator) | 46 KB |
| `brand/suite/aiengine/31_run_view.js` | Content run detail — the full generated pack | 29 KB |
| `brand/suite/aiengine/32_analysis.js` | Vastrangam AI Engine — the full report .doc and the platform .xlsx | 25 KB |
| `brand/suite/aiengine/33_spec.js` | Vastrangam AI Engine — the spec layer (the 61-column storefront import + the real QA gate) v2 shipped a 23-column sheet, 20 hashtags and a 10-slide carousel. | 22 KB |
| `brand/suite/aiengine/34_sku.js` | Vastrangam AI Engine — SKU parsing & colour-variant grouping The catalogue used to treat RAYON_FOILPAN_WINE, RAYON_FOILPAN_BLACK, RAYON_FOILPAN_BLUE and RAYON_FOILPAN_RED as four unrelated products, each with its own title. | 8 KB |
| `brand/suite/aiengine/35_stock.js` | Vastrangam AI Engine — the stock library Three tiers, free-first, the same shape as the model router: | 21 KB |
| `brand/suite/aiengine/36_library.js` | Vastrangam AI Engine — the Library screen One place for every asset, in free-first order: Built-in (offline, unlimited) → My assets → Photos (Openverse free, Pexels/Unsplash keyed) → AI generated Anything can be sent straight into the… | 15 KB |
| `brand/suite/aiengine/37_deep.js` | Vastrangam AI Engine — the deep 14-phase research + humanization run | 35 KB |
| `brand/suite/aiengine/38_inpaint.js` | Vastrangam AI Engine — inpainting engine (watermark eraser) These six algorithms are the user's own, ported verbatim from their Vastrangam_Image_Studio_Pro.html so nothing they already had is lost. | 23 KB |
| `brand/suite/aiengine/39_studio_embed.js` | Vastrangam AI Engine — Image Studio Pro, embedded whole The previous Image Studio was a re-interpretation and it lost most of what the original tool did. | 12 KB |
| `brand/suite/aiengine/45_gif.js` | Compact GIF89a encoder — self-contained, offline Web-safe 216-colour palette + greys, nearest-colour mapping, LZW compression. | 3 KB |
| `brand/suite/aiengine/50_video_studio.js` | Vastrangam AI Engine — Video Studio (timeline, keyframes, preview, offline export) | 26 KB |
| `brand/suite/aiengine/55_layout.js` | Vastrangam AI Engine — layout engine This exists because of one screenshot: a "Web Banner" where the title ran off the right edge of the canvas, the subtitle sat on top of the title, and the price pill sat on top of both. | 9 KB |
| `brand/suite/aiengine/60_design_studio.js` | Vastrangam AI Engine — Design Studio (templates, brand kit, canvas) | 11 KB |
| `brand/suite/aiengine/61_design_extra.js` | Vastrangam AI Engine — templates & the design gallery v2's "Web Banner" put the title through the right-hand edge, dropped the subtitle on top of it and parked the price pill over both, on a gradient that had nothing to do with the garment. | 28 KB |
| `brand/suite/aiengine/70_publisher.js` | Vastrangam AI Engine — Publisher (channels, calendar, publish log) | 12 KB |
| `brand/suite/aiengine/80_records_files.js` | Vastrangam AI Engine — Records + Files | 9 KB |
| `brand/suite/aiengine/90_assistant.js` | Vastrangam AI Engine — Assistant (offline, reads live records, on every screen) A rules-based expert that always works with no internet and no key. | 16 KB |
| `brand/suite/aiengine/95_system.js` | Vastrangam AI Engine — Connectors, Wiring, Backup & Health, self-tests | 10 KB |
| `brand/suite/aiengine/96_router.js` | Vastrangam AI Engine — Connectors as the free-first model router Overrides the Connectors screen with the real router: free options first, paid last, keys pasted here and stored in the browser only (never committed). | 8 KB |
| `brand/suite/aiengine/97_tests_v2.js` | Vastrangam AI Engine — v2 self-tests (catalogue, themes, router, analysis) | 2 KB |
| `brand/suite/aiengine/98_tests_v3.js` | Vastrangam AI Engine — v3 self-tests Every check here corresponds to something the user actually found broken in v2. | 36 KB |
| `brand/suite/aiengine/99_boot.js` | Vastrangam AI Engine — nav + boot | 3 KB |
| `brand/suite/aiengine/app.css` | Vastrangam AI Engine — self-contained styles (no CDN, works offline) | 31 KB |
| `brand/suite/aiengine/assemble.js` | *no description in the file itself* | 7 KB |
| `brand/suite/aiengine/display-OFL.txt` | *no description in the file itself* | 4 KB |
| `brand/suite/aiengine/display.woff2` | *binary — carries no readable header* | 18 KB |
| `brand/suite/aiengine/favicon.txt` | *no description in the file itself* | 5 KB |
| `brand/suite/aiengine/logo.txt` | *no description in the file itself* | 22 KB |
| `brand/suite/aiengine/mkpdf.js` | *no description in the file itself* | 37 KB |
| `brand/suite/aiengine/ref/SAMPLE_REPORT_STRUCTURE.md` | Taken from the sample .docx in their Drive folder. | 2 KB |
| `brand/suite/aiengine/studio_bridge.js` | bridge injected into Vastrangam Image Studio Pro The studio itself is embedded byte-for-byte — its UI, queue, watermark eraser, split, SKU stamp, batch and language toggle are all exactly as built. | 5 KB |
| `brand/suite/aiengine/studio_pro.html` | Vastrangam Image Studio Pro | 207 KB |
| `brand/suite/aiengine/studio_shims.js` | offline shims for the embedded Image Studio Pro Their tool pulls JSZip and SheetJS from CDNs with synchronous <script src> tags in the head. | 4 KB |
| `brand/suite/aiengine/studio_skin.css` | skin applied to Image Studio Pro inside the app | 3 KB |
| `brand/suite/deep/askprint/config_vastrangam.js` | Format B — Vastrangam (ethnic wear). | 7 KB |
| `brand/suite/deep/b2b/config_vastrangam.js` | Format B — Vastrangam (wholesale to boutiques, chains and Surat trade). | 4 KB |
| `brand/suite/deep/crm/config_vastrangam.js` | Format B — Vastrangam. Its own buyers, mills and marketplaces — the same engine as the | 15 KB |
| `brand/suite/deep/d2c/config_vastrangam.js` | Format B — Vastrangam (ethnic-wear D2C). | 5 KB |
| `brand/suite/deep/dashboard/config_vastrangam.js` | Format B — Vastrangam. Its own companies, seller names, mills and marketplaces — the same | 5 KB |
| `brand/suite/deep/docs/config_vastrangam.js` | Format B — Vastrangam. Its own buyers, mills and marketplaces — the same engine as the | 15 KB |
| `brand/suite/deep/export/config_vastrangam.js` | Format B — Vastrangam (ethnic wear to the Gulf, UK, US and Australia). | 5 KB |
| `brand/suite/deep/groupcons/config_vastrangam.js` | Format B — Vastrangam. Its own companies, seller names, mills and marketplaces — the same | 5 KB |
| `brand/suite/deep/helpdesk/config_vastrangam.js` | Format B — Vastrangam. Its own buyers, mills and marketplaces — the same engine as the | 15 KB |
| `brand/suite/deep/m04unified/config_vastrangam.js` | Format B — Vastrangam. Its own buyers, mills and marketplaces — the same engine as the | 15 KB |
| `brand/suite/deep/m21unified/config_vastrangam.js` | Format B — Vastrangam. Its own companies, seller names, mills and marketplaces — the same | 7 KB |
| `brand/suite/deep/oms/config_vastrangam.js` | Format B — Vastrangam (ethnic wear). | 9 KB |
| `brand/suite/deep/ordman/config_vastrangam.js` | Format B — Vastrangam (ethnic wear). | 11 KB |
| `brand/suite/deep/pos/config_vastrangam.js` | Format B — Vastrangam (the Surat showroom counter). | 4 KB |
| `brand/suite/deep/procurement/GUIDE_Vastrangam.md` | Module 1 · Supply Chain & Procurement — App 1 of 6 RFQ → PO → GRN → 3-way match → vendor scorecard, wired to Stock, Finance (a desktop accounting package), Manufacturing/Karigar. | 13 KB |
| `brand/suite/deep/procurement/config_vastrangam.js` | Format B — Vastrangam (ethnic-wear D2C + marketplace, textile). | 3 KB |
| `brand/suite/deep/quotes/config_vastrangam.js` | Format B — Vastrangam (quoting boutiques, chains and exhibition buyers). | 5 KB |
| `brand/suite/deep/reports/config_vastrangam.js` | Format B — Vastrangam. Its own companies, seller names, mills and marketplaces — the same | 7 KB |
| `brand/suite/deep/vendors/GUIDE_Vastrangam.md` | Domain 9 · Purchase — App 2 of 2 Mill 360 → bills & payments → aging → risk → performance-based sourcing, wired to Procurement, Finance (a desktop accounting package) and Quality. | 12 KB |
| `brand/suite/deep/vendors/config_vastrangam.js` | Format B — Vastrangam (ethnic-wear D2C + marketplace). | 3 KB |

---

## Logos, fonts and the brand sheet

**3 files · 2.5 MB.** The visual identity used by the website and the rendered PDFs.

| File | What it says it is | Size |
|---|---|---:|
| `brand/identity/vastrangam-icon.png` | *binary — carries no readable header* | 81 KB |
| `brand/identity/vastrangam-logo.png` | *binary — carries no readable header* | 12 KB |
| `brand/tools/Vastrangam_Finance_Tool.html` | Vastrangam Group — Finance | 2.4 MB |

---

## Deployment, tooling and the build

**2 files · 1.0 MB.** The service unit, the web-server blocks, the PDF renderer, the evidence log and the checks that run on every push. Nothing here is business logic; all of it is how the business logic gets onto a machine and stays honest.

| File | What it says it is | Size |
|---|---|---:|
| `.claude/skills/vastrangam-data-studio/SKILL.md` | What this is | 6 KB |
| `Vastrangam_AI_Engine.html` | Vastrangam AI Engine | 1018 KB |

---

## The PDFs, in a separate archive

**5 documents · `VASTRANGAM_PDF.zip`.** These are not in `VASTRANGAM_TENANT.zip` and that is deliberate. The archive states its own total size in the note inside it; this page cannot, because one of the files below is the PDF of this page.

Each one is rendered from a markdown file of the same name, and that markdown IS in
this archive. So for anything reading the archive to build the software, the PDF was
a second copy of a document it reads worse — and between them they were nearly half
the archive's size. They ship in `VASTRANGAM_PDF.zip` instead, for reading.

**If a PDF and its markdown ever disagree, the markdown is right.** The PDF is
rendered from it, so a PDF saying something different is an older rendering. In the
repository `node brand/site/checkcoverage.js` fails the build when a PDF is older
than its own source.

| Document | Size |
|---|---:|
| `VASTRANGAM_BUILD_GUIDE.pdf` | 279 KB |
| `VASTRANGAM_CONTENTS.pdf` | — |
| `VASTRANGAM_RULES_AND_LOGIC.pdf` | 1.0 MB |
| `Vastrangam_Build_Roadmap.pdf` | 1.1 MB |
| `Vastrangam_Final_As_Tenant.pdf` | 1.2 MB |

---

## The files that describe themselves, and the ones that do not

6 files in this archive carry no description of any kind — no header comment,
no title, nothing readable at the top. They are named here rather than given a
sentence somebody invented, and adding a header to any of them is a real improvement
to the file rather than to this document:

- `brand/suite/aiengine/assemble.js` — 7 KB, no description in the file itself
- `brand/suite/aiengine/display-OFL.txt` — 4 KB, no description in the file itself
- `brand/suite/aiengine/favicon.txt` — 5 KB, no description in the file itself
- `brand/suite/aiengine/logo.txt` — 22 KB, no description in the file itself
- `brand/suite/aiengine/mkpdf.js` — 37 KB, no description in the file itself
- `research/build_mehendi_green_anarkali_doc.js` — 55 KB, no description in the file itself

The 25 images, fonts and rendered PDFs are not in that list. A PNG has no header to read, and
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

**10 words.** Every technical term this document uses, in plain
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

### backup

A copy of everything, kept somewhere else, so a mistake or a failure does not lose your work.

*Zaroori kaagzaat ki photocopy, doosri jagah rakhi hui. Asli jal jaaye toh bhi kaam nahin rukta.*

### queue

A waiting line for work that does not have to finish this second — sending a hundred messages, building a big report.

*Darzi ki dukaan ka parchi system. Kaam parchi pe likh ke lag gaya line mein; customer khada intezaar nahin karta.*

### deployment

Putting a new version of the software in place so people start using it.

*Nayi dukaan kholna ya purani ko naya roop dena — jab tak shutter nahin uthta, customer ko farq nahin padta.*

### model

The piece of artificial intelligence that reads or writes text, tags a photograph, or answers a question.

*Ek bahut padha-likha assistant. Kaam accha karta hai, par har baat pe usse poochho toh kharcha aur waqt dono lagta hai.*

