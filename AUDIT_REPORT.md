# Audit — separating the product from the tenant

Written under the anti-cheat protocol now installed at
`.claude/skills/anti-cheat-protocol/SKILL.md`. Every PASS below names a command that was actually
run and what it printed. Nothing is marked PASS on reasoning.

---

## The requirements, as given

> *"u kept Vastrangam inside Medhava why? … if zoho was build then they kept any tenant inside it
> since day one? … why don't you keep both separate … as of now just build Medhava only … give me
> complete zip files for Unified Medhava BOS zip file … and u can make ready Vastrangam files too
> seperately … merge this anti cheating skill too"*

---

## Audit table

| # | Requirement | Status | Evidence |
|---|---|---|---|
| R1 | Confirm the criticism against the actual repo rather than agree from memory | **PASS** | `unzip -l MEDHAVA_STARTER.zip \| grep -ic vastrangam` → **153**. `node -e "…scripts.test"` → `npm run check && npm run engine && …`, where `engine` = `python3 engine/tests/selftest.py`. The product's own test ran the tenant's payroll engine. |
| R2 | The product must build and test with **no tenant installed** | **PASS** | Product-only tree built from `git ls-files` minus `TENANT_RE`; `npm run test:product` → **exit 0**. Before the work, the same tree failed: `Cannot find module './edition_vastrangam.js'`, then 4 more gates in sequence. |
| R3 | No product gate may require a tenant's file | **PASS** | Every command in `check:product` run individually against the tenant-free tree → **`0 product gate(s) failing on a tenant-free checkout`**. Fixed: `checkneutral.js`, `checksets.js`, `mkrules.js`, `mkregisters.js`, `mkprompts.js`. |
| R4 | A skipped tenant check must announce itself, never pass quietly | **PASS** | `mkskills: 1 tenant artefact(s) SKIPPED, not passed — VASTRANGAM_TENANT.SKILL.md (VASTRANGAM)`; same from `mkprompts`, `checksets`, `mkregisters`, `checkneutral`. |
| R5 | No product file may name a specific tenant to do its job | **PASS** | `build.js` was `EDNAME === 'vastrangam' ? require('./edition_vastrangam.js') : null` — now loads `edition_<name>.js` generically. `node brand/site/build.js acme` → `no edition "acme" is installed … Installed: MEDHAVA, VASTRANGAM`. Both real editions still build: `overflow: 0 \| errors: 0`. |
| R6 | The product's entry documents must contain no trade word | **PASS** | Gate added in `mkprompts.js`; it fired twice on real content — `MEDHAVA_BOS_PROMPT.md … names a trade: karigar`, and `MEDHAVA_BOS.SKILL.md … names a trade: vastrangam`. After fixes: `grep -ci vastrangam MEDHAVA_BOS_PROMPT.md` → **0**; `grep -ci vastrangam MEDHAVA_BOS.SKILL.md` → **0**. |
| R7 | Deliver a complete **Medhava-only** archive | **PASS** | `MEDHAVA_BOS.zip` — **439 files, 15.6MB**. Files whose path names a trade: **0**. `engine/`, `app/`, `brand/suite/aiengine/` absent (`ls` → `No such file or directory`). Verified by extraction: `npm ci`, then `npm run test:product` → **exit 0**. |
| R8 | Deliver a separate **Vastrangam** archive, ready for future changes | **PASS** | `VASTRANGAM_TENANT.zip` — **213 files, 6.0MB**: `engine/`, `app/`, `research/`, `brand/suite/aiengine/`, `edition_vastrangam.js`, the tenant documents. Carries its own `START_HERE.md` with the install command. Reconciles exactly: 261 tenant files tracked − 48 pdf/zip/docx − 1 rendered .html = 212, + `START_HERE.md` = **213**. |
| R9 | The split must lose nothing | **PASS** | `mkstarter.js --verify --both`: extract product → `test:product` **exit 0** with zero tenants; unzip tenant over it → `test:product` **exit 0** and `test:tenant` **313 passed, 0 failed**. Gate also asserts the two archives are a partition: no file in both, and the counts sum to every tracked file. |
| R10 | Merge the anti-cheat skill so it always applies | **PASS** | `.claude/skills/anti-cheat-protocol/SKILL.md` installed; the runtime listed it back as an available skill. Referenced from `CLAUDE.md §0` and from the product archive's `START_HERE.md`. |
| R11 | Nothing else in the repo may regress | **PASS** | Full `npm test` → **exit 0**. `checkcoverage: all valid — 10 documents × 6 registers … every PDF current`; `313 passed`, `31 passed`, `14 passed`, `13 passed`, `10 passed`, `9 passed`, all `0 failed`. |
| R12 | Build Medhava only from now on | **PASS** | Recorded as `CLAUDE.md §0`, which is loaded automatically at the start of every session: *"When the owner says 'build Medhava', the tenant is out of scope."* |

**No row is PARTIAL, FAIL or BLOCKED.**

---

## Known limitation, stated rather than buried

**158 files in the product archive still contain the word "vastrangam" somewhere in their text.**
That number is real and I am not going to describe the archive as free of it.

What those are, checked by reading them:

- **`brand/site/build.js`, `editions.js`, `checkneutral.js`** — edition-aware machinery. Code that
  supports overlays has to be able to name one, and `checkneutral.js` must contain the denylist to
  be able to enforce it. Removing the word here would remove the guard.
- **`brand/suite/deep/*`** — the prototype app builders, which emit an `_ERP` and a `_Vastrangam`
  variant of each app. Product-side tooling that happens to build both editions.
- **comments and `CLAUDE.md`** — the project's own history, including why this separation exists.

What is **not** in the product archive: the tenant's payroll engine, its fixtures, its documents,
its content-engine server, its overlay, and any file whose path names it. No tenant **data**, no
tenant **code**, no tenant **documents** — 0 by path, verified above.

If you want the narrative mentions gone as well, say so and I will do that as its own pass. I have
not done it unasked because it is churn across ~158 files and would delete the explanation of why
the split exists.

---

## Files changed

**Added**
- `brand/site/editions.js` — which editions are installed, discovered by overlay presence
- `.claude/skills/anti-cheat-protocol/SKILL.md`
- `AUDIT_REPORT.md`

**Modified**
- `brand/site/build.js` — loads `edition_<name>.js` generically
- `brand/site/checkneutral.js` — overlay half optional, announced when skipped
- `brand/site/checksets.js` — tenant fixture optional, announced
- `brand/site/mkrules.js`, `brand/site/mkregisters.js` — tenant documents optional, announced
- `brand/delivery/website/mkprompts.js` — edition-tagged rows; product prompt gated on trade words
- `brand/delivery/website/mkskills.js` — skills filtered by installed edition
- `brand/delivery/website/mkstarter.js` — rewritten: two archives, partition gate, `--both`
- `brand/site/prompts.js`, `brand/site/skills.js` — trade references removed from product text
- `package.json` — `check:product`, `test:product`, `test:tenant`
- `CLAUDE.md` — new **§0**, the product/tenant rule
- `.gitignore` — the generated archives

**Deleted**
- `MEDHAVA_AND_VASTRANGAM.zip` — the mixed archive this work exists to replace

---

## Decisions taken, and the one that is yours

**Taken, with the reasoning stated:** `brand/suite/deep/` and `brand/suite/studio/` stay on the
product side. They are dual-edition tooling, not a tenant's data, and `npm run selftest` depends
on them. `app/` and `brand/suite/aiengine/` went to the tenant, because both are the AI content
engine built for this trade.

**Yours:** whether the ~158 narrative mentions should be purged from the product archive. It is a
separate pass and I would rather you decide than have me churn 158 files uninvited.

---

## Corrections to an earlier version of this report

Both archive figures in the first version were wrong, and they were wrong the same way: I read
`unzip -l`'s summary line, which counts **directory entries** as files and reports the
**uncompressed** total, and wrote those down as the file count and the archive size.

| | First reported | Actual |
|---|---|---|
| `MEDHAVA_BOS.zip` | 540 files, 24.6MB | **439 files, 15.6MB** |
| `VASTRANGAM_TENANT.zip` | 285 files, 13.6MB | **213 files, 6.0MB** |

Neither error changes a conclusion — every PASS above rests on an exit code, not on a file count —
but a number stated without checking what the command actually reports is exactly what this
protocol exists to stop, and it went into a document whose subject is evidence.

**A second, larger one:** the archives first delivered were built at 12:17 and 12:11, and the fix
that made CI pass was committed at 12:21. `brand/delivery/manifest.js` is inside the product
archive, so the copy sent out contained the version that fails CI. Proven rather than assumed:
`unzip -p MEDHAVA_BOS.zip medhava-bos/brand/delivery/manifest.js | grep -c AUDIT_REPORT.md` → `0`
against `1` in the repository. Rebuilt and re-verified end to end.
