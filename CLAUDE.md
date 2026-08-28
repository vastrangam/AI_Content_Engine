# Working agreement for this repository

This file is loaded automatically at the start of every session. Read it before doing anything else.
It exists because real work was rejected here for real reasons, and those reasons are written down so
they are not repeated.

---

## 1 · What this project is

The **Vastrangam BOS** — a Business Operating System for a Surat ethnic & western fashion
manufacturer running three sister companies (Vastrangam / Ethnic Fashion trading as Go4Fashion /
Adini Couture) across D2C, seven marketplaces, B2B and export.

**Three companies and seven marketplaces is today's DATA, not the design.** A company is a row and
a channel is a row; every business record carries its `company_id`, every sale also carries its
`channel_id`, and the group figure is the sum minus inter-company trade. Nothing is built around
the number three or the number seven. Proven, not asserted: `core/tests/core.test.js` posts across
a **10 × 10 grid** (₹2,10,500 gross → ₹50,000 eliminated → ₹1,60,500 group) and then runs 11 × 11
with no code changed; `m21unified` adds an eleventh channel and a fourth company to a running app;
the Data Studio emits one pair of columns per company found in the uploaded sheets. Never write a
ceiling into copy — the shipped plan cap is 20 companies and says so, and the software has none of
its own.

**22 modules · 113 apps.** Two editions build from one structure: `MEDHAVA` (industry-neutral) and
`VASTRANGAM` (this trade's own words). Never type these counts — derive them from
`brand/site/modules.js`, which is why they have already changed twice.

**The delivered documents describe a DESIGN, not an inventory.** They carry no "working today" or
"not built" markers, because every line of them would say the same thing and a label that never
varies is noise. `mkguide.js` and `mktenant.js` refuse to write a document containing build-state
language. When something is finished it will say so, naming the test that proves it.

Karigar & staff payroll is **one module of twenty-two**, not the product. If a request says "all
modules", it means all twenty-two.

**Every module also has a rulebook.** `brand/site/rules.js` holds 285 numbered rules, each stating
what happens *and* what the system will never do instead. A rule marked ENFORCED must name a file
and a test that really exist — `brand/site/checkrules.js` fails the build otherwise, so a rule
cannot claim a proof it does not have. Do not add a rule without a `never`; it is a description,
and the checker rejects it.

---

## 2 · The operating protocol

Every non-trivial task follows this sequence. Do not skip a phase because the task looks simple.

**READ → MAP → PLAN → EXECUTE → TEST → AUDIT → REPORT**

- **READ.** Read the full request and every applicable document *before* acting. Inspect the repo.
  Search for an existing implementation before writing a new one. If told "read everything", actually
  read it.
- **MAP.** List every requirement separately. Do not merge two requirements into one — that is how
  one of them gets silently dropped.
- **PLAN.** State the approach, the files affected, the risks, the assumptions, and how the result
  will be tested. If the user asked for a plan, **stop here and deliver the plan.**
- **EXECUTE.** Smallest coherent change. Follow existing patterns. Do not rewrite unrelated files or
  build a parallel system beside a working one.
- **TEST.** Run the checks in §6. Fix failures before claiming anything.
- **AUDIT.** Compare the result against every original requirement: **PASS / PARTIAL / FAIL /
  BLOCKED.** No PASS without evidence.
- **REPORT.** What was done, what was verified, what is still open, and anything needing a decision.

**Never trade correctness for speed.** A slower verified result beats a fast incomplete one.

---

## 3 · Hard rules — these are what "cheating" means here

1. **Never fabricate.** Not requirements, APIs, file contents, config, business rules, data, test
   results, or successful execution. If it was not run, do not say it passed. If it was not read, do
   not cite it.
2. **Never claim something is finished when it is not.** Every deliverable is labelled **tool / stub
   / mockup / spec**. A mockup stays labelled a mockup even when a working version would be more
   impressive to show.
3. **Never restate the plan in longer words and present it as new work.** A document that only
   re-narrates what the user already has is not a deliverable. If the only honest thing to say is
   "this cannot be made deeper until the thing exists", say that.
4. **Never copy the user's own words back to them** as if they were your output.
5. **Never re-order what the user specified.** If modules are to be presented 01→21, present them
   01→21. Dependency-reordering something the user numbered is not an improvement.
6. **Never take an action that was not asked for.** If the request is a plan, do not write code. If
   the request is a document, do not refactor the build.
7. **Derive, never retype.** Counts, module names and app names come from the canonical source (§5)
   programmatically. A number typed from memory will drift and is treated as fabrication.
8. **Verify output, do not assume it.** Rendered a PDF? Extract its text and confirm. Renamed files?
   Re-run the tests. Built the site? Check the exit code and the error count.
9. **Report failure plainly.** If tests fail, show the output. If a step was skipped, name it. Do not
   bury a gap in optimistic prose.
10. **No meta-talk in deliverables.** No apologies, no "as I mentioned", no narration of your own
    process inside a document meant for a reader.

---

## 4 · Security constraints — non-negotiable

- **Never hardcode or commit API keys.** Keys are entered in-app at runtime only. `app/.env` and
  `app/data/` are gitignored and stay that way.
- **Never use, store, echo or act on a marketplace, bank or account password**, even if one is pasted
  into the conversation. The product's own promise is: *this system will never ask you for a
  marketplace, bank or account password.* Honour it in the code and in the conversation.
- Aadhaar, PAN, bank and UPI details may be read into memory for a computation but are never
  serialised into a committed file.
- **Never commit the model identifier** to commit messages, PR bodies, code comments or any pushed
  artifact.
- Before pushing: scan the diff for keys and secrets.

---

## 5 · Canonical sources — where truth lives

Do not restate these from memory; read them.

| Truth | Lives in |
|---|---|
| Modules, apps, order, reads/writes | `brand/site/modules.js` — the one canonical list |
| The production database | `core/schema.postgres.sql` — gated by `core/tests/schema.test.js` (text) **and `core/tests/live.test.js`, which loads it into a real Postgres** |
| That isolation actually holds | `core/tests/live.test.js` — the app role must be neither superuser nor table owner, or every policy is inert. See DEPLOYMENT.md §6a |
| The rules each module enforces | `brand/site/rules.js` — checked by `checkrules.js`, injected by `mkrules.js` |
| The tools we build on, free first | `brand/site/tools.js` — gated by `checktools.js`: a paid tool must name its free option AND its trigger |
| The neutral edition's product screens | `brand/site/shots.js` — 46 screens across 12 sectors; a module may carry several |
| The Medhava product plan | `MEDHAVA_PLAN_OF_ACTION.md` (`PLAN_OF_ACTION.md` is Vastrangam's — one trade adopting the engine) |
| Vastrangam trade wording | `brand/site/edition_vastrangam.js` — **words only, never structure** |
| The build plan | `PLAN_OF_ACTION.md` (Vastrangam) · `MEDHAVA_PLAN_OF_ACTION.md` (the product) |
| How a trade is configured | `core/packs.js` + `core/packs/*.json` — gated by `core/tests/packs.test.js` |
| What a business changed AFTER its pack | **`core/tenant.js`** — effective-dated, append-only. The six things `dynamic.js` attributes to Admin. Not to be confused with `brand/site/tenant.js`, which is the tenant guide's prose |
| That no trade's SHAPE reaches the neutral edition | `brand/site/checkshape.js` + `sectors.js` + `reach.js` — `checkneutral.js` reads WORDS and is blind to shape; both must pass |
| What we deliver, and to which edition | `brand/delivery/manifest.js` — read by `mkbundle.js` AND `checkcoverage.js`, so a document cannot ship ungated or be gated without shipping |
| Free-first tool choices | `brand/site/tools.js` — gated by `brand/site/checktools.js` |
| The landing page (generated) | `brand/delivery/website/mklanding.js [vastrangam]` → `brand/delivery/website/{MEDHAVA,VASTRANGAM}_BOS/*.md` |
| The four-part Medhava BOS (generated) | `brand/delivery/website/mkfinal.js` → `Medhava_BOS.md` — landing + architect + plan + build guide, read from their own files. There is no trade edition of it; the tenant has its own three |
| That no trade word reaches the neutral edition | `brand/site/checkneutral.js` — gates `modules.js` and the overlay |
| The one product-screen renderer | `brand/site/uishot.js` — used by `build.js` AND `mkshots.js`, so a screenshot is the website's own screen |
| The walkthrough's words | `brand/site/walkthrough.js` — read by `mklanding.js` (markdown) AND `build.js` (the styled page) |
| The design argued, with what would make each decision wrong | `brand/site/architect.js` — every section owes a `wrong_if`; `check()` refuses one without it |
| The build guide's steps | `brand/site/guide.js` — for whoever builds the platform; every step owes a `done`, and `checkneutral.js` scans its prose. Part 13 is the ordered path from an empty machine to a deployed product, command and check per stage |
| The tenant's rules and logic | `brand/site/tenant.js` — the reference, by subject. Deliberately NOT neutral, and `checkParts()` refuses any step carrying a shell command |
| The tenant's ordered setup path | `brand/site/tenantbuild.js` — signing up to running live, held to `tenant.js`'s own checker so the two cannot drift about what may reach this reader |
| What an agent is handed to build from | `brand/site/skills.js` → `mkskills.js` — every path and command in a skill is checked to exist before it is written |
| That nothing a tenant owns is compiled in | `brand/site/checkstatic.js` — 4 rules over the engine and app trees; the exempt list carries a reason per entry |
| How a runbook step renders | `brand/site/guidefmt.js` — one formatter, both runbooks |
| Every technical word, in plain language | `brand/site/plainwords.js` — one glossary, with a Hinglish analogy each; a document may not use a term it never explains |
| What each layer is built on, and its swaps | `brand/site/stack.js` — gated by `checkstack.js`: every layer owes a default, 2+ named alternatives and an interface |
| What a tenant can change, and how the past resolves | `brand/site/dynamic.js` — effective-dated and append-only |
| Which apps really work | `brand/site/built.js` — one list, read by `mkfinal.js` and `mkguide.js` |
| The screenshots in the documents | `brand/delivery/website/mkshots.js` → `MEDHAVA_BOS/shots/m01–m22.png` |
| The derived module map | `brand/site/mkdiagrams.js` — read from the `reads` field, injected between markers |
| Where Chromium is | `brand/suite/chrome.js` — asked once; 17 files used to hardcode one machine's path |
| How it goes live | `DEPLOYMENT.md` + `deploy/` — the runbook, nginx blocks and the systemd unit |
| Which apps really exist | `brand/suite/deep/out/*.html` — 16 apps, each built twice (`_ERP` and `_Vastrangam`), plus the two unified delivery builds `m04_*` and `m21_*` |

**The edition overlay may change wording only.** `build.js` compares the structural shape before and
after applying it and fails the build if the overlay altered a module number, an app name or an app
count. Do not defeat that check.

---

## 6 · How to verify anything here

```bash
node brand/site/build.js              # Medhava edition  → expect: overflow 0 | errors 0
node brand/site/build.js vastrangam   # Vastrangam edition → expect: overflow 0 | errors 0
node brand/site/mkindex.js            # regenerate INDEX.md + llms.txt
node brand/site/checkrules.js --summary  # the rulebook → expect: all valid, + the per-module table
node brand/site/checkstack.js --summary  # no capability depends on one tool → 19 layers, 57 swaps
node brand/site/checktools.js --summary  # free-first register → expect: all valid, + what is actually paid
node brand/site/checkneutral.js --summary # no trade word in modules.js OR the built index.html
npm ci                                # the toolchain, from the committed lockfile
npm test                              # every engine check and register gate in one command
node brand/site/mkdiagrams.js --check    # the module map matches modules.js and is idempotent
node core/tests/schema.test.js        # the two schemas agree · company_id + RLS · no float money
node core/tests/live.test.js          # the schema RUN, not read — real Postgres, real isolation
node core/tests/packs.test.js         # the packs AND the tenant overlay → 0 failures
node brand/site/checkshape.js --summary  # every trade shown is configurable · apps per trade
node brand/site/checkcoverage.js --summary  # every delivered document × every register
node brand/site/checktools.js --summary  # every paid tool names its free option and its trigger
node brand/site/mkcounts.js           # derive the counts in MEDHAVA_PLAN_OF_ACTION.md
node brand/site/mkcounts.js --check   # prove they are current and the injection is idempotent
node brand/site/mkrules.js            # inject the rules into PLAN_OF_ACTION.md (markers only)
node brand/site/mkrules.js --check    # prove the injection is idempotent
node brand/suite/router.js --selftest            # provider fallback, breaker, spend ceiling
node brand/suite/studio/motion_render.js --selftest  # renders a real MP4 and probes it
node brand/suite/deep/build_deep.js   # all built apps    → expect: 0 test failures
node brand/suite/deep/check_deep.js <name>   # click every control → expect: 0 with problems
node brand/suite/deep/verify_m21.js   # a module driven as a person would drive it
node brand/site/checkstatic.js --summary  # no count, rate, threshold, shift or name compiled in
# THE ENGINE AGAINST THE BUSINESS'S OWN BOOKS. The five VAS_* variables that switch
# these on were documented only in the test source and a superseded report, so the
# one person who needed them could not find them. One command, one folder now:
npm run validate -- /path/to/workbooks   # exits non-zero and names what it could NOT check
node brand/delivery/website/mkskills.js --check  # both skills current; every path and command real
# THE TEN DELIVERED DOCUMENTS, IN DEPENDENCY ORDER. Getting this order wrong is how a PDF
# ends up older than its own markdown — build.js writes the two WEBSITE pdfs, so it runs
# AFTER mklanding writes their markdown, not before.
node brand/delivery/website/mkshots.js                # 22 module screens → MEDHAVA_BOS/shots/
node brand/delivery/website/mkshots.js vastrangam
node brand/delivery/website/mklanding.js              # Medhava website .md
node brand/delivery/website/mklanding.js vastrangam   # Vastrangam website .md
node brand/site/build.js                              # ← the website PDFs, after their .md
node brand/site/build.js vastrangam
node brand/delivery/website/mkarchitect.js            # MEDHAVA_ARCHITECT.md
node brand/delivery/website/mkguide.js                # MEDHAVA_BUILD_GUIDE.md
node brand/delivery/website/mkconflicts.js            # SPEC_CONFLICTS.md
# ONE generator, THREE tenant documents. They address different readers and are not a pair:
#   the build guide     — the ordered path, first week. No formulas; it names where they live.
#   the rules and logic — the reference, by subject, all 285 rules with every "never".
#   the merge           — both, concatenated from what was already checked, re-gated.
# It also refuses to build if a cascade or flow has left PLAN_OF_ACTION.md §A0/§A5, because
# that is the acceptance test shrinking.
node brand/delivery/website/mktenant.js
node brand/delivery/website/mkfinal.js                # Medhava_BOS.md — needs all four parts
node brand/delivery/website/mkskills.js               # the two SKILL.md files
# the sendable archives — run LAST, they copy whatever the PDFs currently are
node brand/delivery/website/mkbundle.js               # MEDHAVA.zip
node brand/delivery/website/mkbundle.js vastrangam    # VASTRANGAM.zip
# THE BUILD ARCHIVE, which is a different thing from the delivery archives. Those carry
# documents and cannot build anything — measured: 18 of 22 paths absent, every command
# broken. This one carries the repository. --verify does not inspect the file list and
# conclude; it unzips into a scratch directory, runs `npm ci`, and runs the suite from the
# extract, then prints that run's real exit code. Gitignored output — the generator is what
# is committed, because an archive of this repository inside this repository is 22MB per
# regeneration, forever.
node brand/delivery/website/mkstarter.js --verify     # MEDHAVA_STARTER.zip

# document → PDF (run from the repo root; paths are repo-relative)
python3 tools/report_pdf.py <file>.md && node tools/report_pdf.js <file>.html
```

**Rendering a document is not done until the PDF is inspected.** Diagrams are staged as
`<pre class="mermaid">` in the HTML and rendered by headless Chromium during the PDF step. Confirm by
extracting the PDF text with `pdfplumber` — if `flowchart`, `-->` or backticks survive into the PDF,
the diagrams did **not** render.

---

## 7 · Lessons already paid for — do not repeat these

- **A bulk rename can silently overwrite.** Renaming `02→04` while a different `04` still exists
  destroys the second one. Always rename in two phases: everything to unique temporary names first,
  then temporary names to final names. Reset and redo rather than patch a half-broken rename.
- **Renaming a file is not the job.** Every internal reference moves too: `require()` paths, registry
  `num:` fields, output filenames, packaged archive contents, and display text like "Module 01 of
  16". Regenerate from the source scripts wherever the pipeline supports it instead of hand-editing
  derived files.
- **A document about unbuilt software cannot be made deep by adding words.** Depth comes from real
  screens, real columns and real worked examples. For anything not built, describe the intended
  screen concretely and mark it **SPEC**.
- **Straight apostrophes break `modules.js`.** The file uses `'` quoting; use the typographic `’`
  inside prose.
- **Gitignored build artifacts survive `git checkout`.** After reverting a bad change, check for
  stale generated files left behind.

---

## 8 · Git

- Work on the branch you were given; never push elsewhere without being asked.
- Commit messages: what changed, why, and what was verified — no model identifier.
- `git push -u origin <branch>`; retry network failures with backoff.
- After pushing, open a **draft** PR if no open one exists for the branch.

---

## 9 · When to stop and ask

Stop and ask when two requirements genuinely conflict, a critical input is missing, an action is
destructive and irreversible, or the request is materially ambiguous. For small ambiguity, choose the
safest reading and **write down the assumption** in the report.

Do not ask a question the user has already answered — search the conversation and the documents
first. Being asked the same thing twice is itself a failure.
