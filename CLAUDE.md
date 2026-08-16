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

**22 modules · 109 apps · 16 apps working today, 2 more with a working engine and no screen yet.**
Two editions build from one structure: `MEDHAVA` (industry-neutral) and `VASTRANGAM` (this trade's
own words). Never type these counts — derive them from `brand/site/modules.js`, which is why they
have already changed twice.

Karigar & staff payroll is **one module of twenty-two**, not the product. If a request says "all
modules", it means all twenty-two.

**Every module also has a rulebook.** `brand/site/rules.js` holds 242 numbered rules, each stating
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
| The rules each module enforces | `brand/site/rules.js` — checked by `checkrules.js`, injected by `mkrules.js` |
| Vastrangam trade wording | `brand/site/edition_vastrangam.js` — **words only, never structure** |
| The build plan | `PLAN_OF_ACTION.md` |
| The landing page (generated) | `brand/delivery/website/mklanding.js` |
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
node brand/site/mkrules.js            # inject the rules into PLAN_OF_ACTION.md (markers only)
node brand/site/mkrules.js --check    # prove the injection is idempotent
node brand/suite/router.js --selftest            # provider fallback, breaker, spend ceiling
node brand/suite/studio/motion_render.js --selftest  # renders a real MP4 and probes it
node brand/suite/deep/build_deep.js   # all built apps    → expect: 0 test failures
node brand/suite/deep/check_deep.js <name>   # click every control → expect: 0 with problems
node brand/suite/deep/verify_m21.js   # a module driven as a person would drive it
node brand/delivery/website/mklanding.js     # regenerate the BOS landing page

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
