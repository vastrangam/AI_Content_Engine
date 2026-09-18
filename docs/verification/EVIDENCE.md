# Verification evidence

Every entry below is one command that was actually run, with the exit code the process
returned, the revision it ran against, and the SHA-256 of the files it was about.

**This file is appended to, never rewritten.** It is tamper-EVIDENT rather than
tamper-proof: anybody with write access to this repository can edit it, and no comment
can prevent that. What it does buy is that a claim now has to disagree with a recorded
exit code rather than merely with somebody's memory. `node tools/evidence.js --check`
re-runs each recorded command and reports where the result has moved.

An entry records what happened. It does not rule on whether the requirement passed —
a tool that graded its own output would be the circular proof this file exists to stop.

Secrets are redacted from captured output. Redaction is never applied to hide a failure.

---






## V-ENGINE · exit 0

The tenant payroll engine, end to end

| | |
|---|---|
| Command | `python3 engine/tests/selftest.py` |
| Exit code | **0** |
| Ran | 2026-09-02T03:40:35.511Z → 2026-09-02T03:40:45.096Z (9.6s) |
| Commit | `754a379d4ef57bc401389d93a4bb8205e3b721b7` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
ok   a figure that moves because a source changed is expected and visible

--- the corpus (real files) ---
SKIP the corpus figures — set VAS_CORPUS to the staff workbook to check 9,75,649 payroll / 10,09,023 paid / 10,388 hours / 159 designs

--- the stray header, on the real file ---
SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks

--- the karigar corpus (real file) ---
SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
======================================================================
397 passed, 0 failed
```
</details>

---

## V-MEDHAVA · exit 0

The platform: isolation, inventory, sales, and the shell driven in Chromium

| | |
|---|---|
| Command | `npm run medhava` |
| Exit code | **0** |
| Ran | 2026-09-02T03:40:45.193Z → 2026-09-02T03:41:25.756Z (40.6s) |
| Commit | `754a379d4ef57bc401389d93a4bb8205e3b721b7` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
  ok    B1  the sign-in card actually disappears after signing in
  ok    B2  a two-company account is asked which company, not shown a blank page
  ok    B3  the isolation screen shows a visible-versus-actual figure for each thing
  ok    B4  changing the company changes what the screen shows
  ok    B5  every module page opens and is labelled as specified, not built
  ok    B7  a sale can be recorded on the screen, and the receipt names both documents
  ok    B8  a sale the rules refuse is explained by rule number on the screen
  ok    B6  the page threw nothing and no request failed

  ====================================================================
  9 passed, 0 failed
  Driven in Chromium: clicked, switched company, and opened every module.
```
</details>

---

## V-CORE · exit 0

The schema run against real PostgreSQL, and isolation proven with a non-superuser role

| | |
|---|---|
| Command | `node core/tests/live.test.js` |
| Exit code | **0** |
| Ran | 2026-09-02T03:41:31.278Z → 2026-09-02T03:41:46.650Z (15.4s) |
| Commit | `754a379d4ef57bc401389d93a4bb8205e3b721b7` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
  ok   a company cannot be moved into another tenant by a write (both clauses)
  ok   with no tenant set, the query is refused rather than returning everything
  ok   company isolation still holds INSIDE a tenant

── 3 · money cannot drift ────────────────────────────────────────
  ok   every *_paise column is an integer type, in the live catalogue
  ok   the drift is real in float, and integers are immune to it
  ok   and no money column is a float type in the first place

======================================================================
17 passed, 0 failed
The schema was executed, not read. Isolation was asked of the database.
```
</details>

---

## V-FULL · exit 1  ← NON-ZERO

> **Cause, found after this run:** `mkprompts --check` compared the whole
> document including its generation date, so the gate went red when the calendar
> rolled from 30 August to 2 September with nothing else changed. Fixed by
> normalising only that field. Superseded by **V-FULL2**, which exits 0.
> The failing entry is kept rather than deleted — §2 Rule 6.

Every register gate and every engine check in one command

| | |
|---|---|
| Command | `npm test` |
| Exit code | **1** |
| Ran | 2026-09-02T03:41:46.731Z → 2026-09-02T03:42:18.963Z (32.2s) |
| Commit | `754a379d4ef57bc401389d93a4bb8205e3b721b7` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `package.json` — `4693f35d7a38f4dc94bd554802ca2fea171a0446d98c50d6b0aee3fb94e165da` (3,538 bytes)

<details><summary>Last lines of real output</summary>

```
  MEDHAVA_HOW_TO_BUILD.md: every technical term it uses is explained
  PLAN_OF_ACTION.md: 113 apps, in full
  PLAN_OF_ACTION.md: 19 stack layers, in full
  PLAN_OF_ACTION.md: 24 changeable things, in full
  PLAN_OF_ACTION.md: every technical term it uses is explained
mkregisters: up to date
checkcoverage: all valid — 13 documents × 6 registers, every pair decided, every "full" verified, every PDF current
mkcounts: up to date and idempotent · every typed table count matches a derived source (151 = the schema · 43 = the tables Part V specifies · 37 = the Part V tables that were added · 6 = the Part V tables folded into existing ones)
mkdiagrams: up to date and idempotent
mkskills: 2 skills · 29 paths and 16 commands all verified to exist · no count typed
mkprompts: MEDHAVA_BOS_PROMPT.md is out of date — run without --check
mkprompts: VASTRANGAM_PROMPT.md is out of date — run without --check
```
</details>

---

## V-FULL2 · exit 0

Every register gate and every engine check, after the date-drift fix

| | |
|---|---|
| Command | `npm test` |
| Exit code | **0** |
| Ran | 2026-09-02T03:43:40.426Z → 2026-09-02T03:44:39.647Z (59.2s) |
| Commit | `754a379d4ef57bc401389d93a4bb8205e3b721b7` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
  ok    B1  the sign-in card actually disappears after signing in
  ok    B2  a two-company account is asked which company, not shown a blank page
  ok    B3  the isolation screen shows a visible-versus-actual figure for each thing
  ok    B4  changing the company changes what the screen shows
  ok    B5  every module page opens and is labelled as specified, not built
  ok    B7  a sale can be recorded on the screen, and the receipt names both documents
  ok    B8  a sale the rules refuse is explained by rule number on the screen
  ok    B6  the page threw nothing and no request failed

  ====================================================================
  9 passed, 0 failed
  Driven in Chromium: clicked, switched company, and opened every module.
```
</details>

---

## V-PRODUCT · exit 0

The product alone, as a customer receives it

| | |
|---|---|
| Command | `npm run test:product` |
| Exit code | **0** |
| Ran | 2026-09-02T03:44:39.726Z → 2026-09-02T03:45:27.044Z (47.3s) |
| Commit | `754a379d4ef57bc401389d93a4bb8205e3b721b7` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
  ok    B1  the sign-in card actually disappears after signing in
  ok    B2  a two-company account is asked which company, not shown a blank page
  ok    B3  the isolation screen shows a visible-versus-actual figure for each thing
  ok    B4  changing the company changes what the screen shows
  ok    B5  every module page opens and is labelled as specified, not built
  ok    B7  a sale can be recorded on the screen, and the receipt names both documents
  ok    B8  a sale the rules refuse is explained by rule number on the screen
  ok    B6  the page threw nothing and no request failed

  ====================================================================
  9 passed, 0 failed
  Driven in Chromium: clicked, switched company, and opened every module.
```
</details>

---

## V-SELFTEST · exit 0

Provider Router and Motion Renderer — the two engine apps the registry raises to TESTED.

| | |
|---|---|
| Command | `npm run selftest` |
| Exit code | **0** |
| Ran | 2026-09-02T04:12:01.703Z → 2026-09-02T04:12:06.285Z (4.6s) |
| Commit | `c362065872d4d546193db24b6e5be74482f3cc64` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `brand/suite/router.js` — `fec7417060b1748b7408621b6246b50493b05051f6182902af7fb82f35c6e737` (20,427 bytes)
  - `brand/suite/studio/motion_render.js` — `253c8f608b224e15491dc5b6f2c36d274b7681e172920f8361be585dec6a59d9` (19,043 bytes)

<details><summary>Last lines of real output</summary>

```
  ok   the resolution is what was asked for
  ok   the frame rate is what was asked for
  ok   the duration is one second (±40ms)
  ok   the frames are not all identical (something actually moved)
  ok   nearly every frame differs from the last
  ok   a second render produces frame-for-frame identical images
  ok   and a byte-identical MP4
  ok   a CSS keyframe animation alone produces motion (infinite animations seek)
  ok   a vertical reel renders at 9:16
  ok   odd pixel dimensions are corrected, not crashed on

14 passed, 0 failed
```
</details>

---

## V-SCHEMA · exit 0

CAP-SCHEMA — the two schemas agree, every business table company-scoped, no float money.

| | |
|---|---|
| Command | `node core/tests/schema.test.js` |
| Exit code | **0** |
| Ran | 2026-09-02T04:12:06.386Z → 2026-09-02T04:12:06.478Z (0.1s) |
| Commit | `c362065872d4d546193db24b6e5be74482f3cc64` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `core/schema.postgres.sql` — `744268d6c8ee12a03aababb478d407615042a914b00ffa017694c72102cf3a50` (107,035 bytes)

<details><summary>Last lines of real output</summary>

```

── the rules the schema itself enforces ──────────────────────────
  ok   an entry cannot name itself as its counterparty
  ok   a journal line is one side or the other, never both
  ok   a stock movement must have a source, a destination, or both
  ok   a stock movement quantity is positive
  ok   GST on an expense can never exceed the expense
  ok   a channel code is unique within its company, not globally
  ok   every table marked LIVE in the header really exists

======================================================================
24 passed, 0 failed
```
</details>

---

## V-PACKS · exit 0

CAP-PACKS — the trade packs and the effective-dated tenant overlay.

| | |
|---|---|
| Command | `node core/tests/packs.test.js` |
| Exit code | **0** |
| Ran | 2026-09-02T04:12:06.585Z → 2026-09-02T04:12:06.679Z (0.1s) |
| Commit | `c362065872d4d546193db24b6e5be74482f3cc64` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `core/packs.js` — `7c3fdad24eab976824da9cd3e310a026336bedbb9bace37fb17193a23e7bc448` (22,270 bytes)
  - `core/tenant.js` — `ec793f1b21ffb33574d910e71e46ee48fcb2ea5bbbcc96bc950fc0119ea846f6` (11,191 bytes)

<details><summary>Last lines of real output</summary>

```
  ok   an entry with no date, no author or a function inside it is refused
  ok   a module the overlay never mentions is ON — the overlay is an exception list
  ok   turning a module off hides it and keeps every record — turning it back on restores them

── 6b · a business that is genuinely two trades ──────────────────
  ok   two packs that disagree are refused with BOTH named, not silently merged
  ok   two packs that do not disagree merge, and the first one named wins the sector
  ok   the tenant overlay beats BOTH packs — it is the last word, by design

======================================================================
58 passed, 0 failed
10 trades ship. A seventh was added during this run, from data alone.
```
</details>

---

## V-GROUP · exit 0

CAP-GROUP — a 10x10 company/channel grid, then 11x11 with no code changed.

| | |
|---|---|
| Command | `node core/tests/core.test.js` |
| Exit code | **0** |
| Ran | 2026-09-02T04:12:10.921Z → 2026-09-02T04:12:11.441Z (0.5s) |
| Commit | `c362065872d4d546193db24b6e5be74482f3cc64` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
ok   ten companies and ten channels each is a hundred channels, not a limit
ok   every one of the hundred cells posted its own figure, channel by channel
ok   each company's own books add up, and still balance
ok   one company cannot read another company's rows
ok   stock is one number per SKU, with the channel recorded on the movement
ok   the group is the sum MINUS what the companies sold each other
ok   an eleventh company and an eleventh channel need no code change
ok   an entry cannot be its own counterparty
ok   a channel belongs to a company — two companies may both call one AMZN

======================================================================
49 passed, 0 failed
```
</details>

---

## V-EVTEST · exit 0

CAP-EVIDENCE — the evidence tool's own plants, committed rather than run by hand.

| | |
|---|---|
| Command | `node tools/evidence.test.js` |
| Exit code | **0** |
| Ran | 2026-09-02T04:12:11.528Z → 2026-09-02T04:12:11.729Z (0.2s) |
| Commit | `c362065872d4d546193db24b6e5be74482f3cc64` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `tools/evidence.js` — `4bfeef91e3033a54ff90f92adc61b67f47ef7725851d8df60be6da635037ffe6` (12,125 bytes)
  - `tools/evidence.test.js` — `632aadcc848ff272869be7591381214e6950209c8f0bbdce4a5ca3b94b10fd8d` (9,917 bytes)

<details><summary>Last lines of real output</summary>

```
  ok   a supersession with no cause does not earn it either
  ok   both halves written down DOES earn it
  ok   the evidence log is byte-identical to how this test found it

exit propagation — recording a failure is still a failure
  ok   wrapping a command that exits 3 makes the wrapper exit non-zero
  ok   the recorded exit code is the command’s own, not the wrapper’s
  ok   the failing run was appended to the log with its own exit code
  ok   the log is byte-identical again afterwards, to the hash, not to the eye
  ok   and carries no trace of this test’s fixture entry

evidence.test: 21 passed, 0 failed
```
</details>

---

## V-COVERAGE · exit 0

CAP-DOCS — every delivered document against every register.

| | |
|---|---|
| Command | `node brand/site/checkcoverage.js` |
| Exit code | **0** |
| Ran | 2026-09-02T04:12:11.836Z → 2026-09-02T04:12:12.247Z (0.4s) |
| Commit | `c362065872d4d546193db24b6e5be74482f3cc64` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `brand/delivery/manifest.js` — `371cdb899f0552257a5d098973f6ae34d88f4092e40012a6101e425bb74d4757` (27,048 bytes)

<details><summary>Last lines of real output</summary>

```
checkcoverage: all valid — 13 documents × 6 registers, every pair decided, every "full" verified, every PDF current
```
</details>

---

## V-REGISTRY · exit 0

The truth registry's own gate: every file cited exists, every TESTED claim matches a recorded passing run, and the registry agrees with built.js.

| | |
|---|---|
| Command | `node brand/site/checkregistry.js` |
| Exit code | **0** |
| Ran | 2026-09-02T04:21:08.619Z → 2026-09-02T04:21:08.731Z (0.1s) |
| Commit | `c362065872d4d546193db24b6e5be74482f3cc64` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `brand/site/registry.js` — `1261c766a06146ec082213f05727f9ca775d203de35dc7e93e2ff09fcbb3c6e4` (19,081 bytes)
  - `docs/truth/requirements.json` — `e0c188749951de116d2f300d6524c107ebf433ff2afcc42ccfc1ded6703f64d8` (44,964 bytes)

<details><summary>Last lines of real output</summary>

```
checkregistry: 132 rows valid — 113 apps + 19 capabilities; every file cited exists; every TESTED/VERIFIED/PRODUCTION-READY claim matches a passing run in EVIDENCE.md; registry and built.js agree
```
</details>

---

## V-TRAP · exit 0

Proving the generated registry no longer goes stale when an unrelated run is recorded.

| | |
|---|---|
| Command | `node brand/site/checkregistry.js` |
| Exit code | **0** |
| Ran | 2026-09-02T04:21:22.352Z → 2026-09-02T04:21:22.427Z (0.1s) |
| Commit | `c362065872d4d546193db24b6e5be74482f3cc64` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
checkregistry: 132 rows valid — 113 apps + 19 capabilities; every file cited exists; every TESTED/VERIFIED/PRODUCTION-READY claim matches a passing run in EVIDENCE.md; registry and built.js agree
```
</details>

---

## V-ZOHO · exit 0

The capability benchmark: 56 rows, every app named is real, every verdict carries a reason, and no row claims what a page says without the day it was read.

| | |
|---|---|
| Command | `node brand/site/checkzoho.js` |
| Exit code | **0** |
| Ran | 2026-09-02T04:30:55.359Z → 2026-09-02T04:30:55.415Z (0.1s) |
| Commit | `1535ab556cf695ea1ac8a4439442f95db020d084` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `brand/site/zoho.js` — `0ca8d4cc975f9954a4c79b1e6af6ea023387e8a462a0b37776f4ccace6c9d7d6` (22,982 bytes)

<details><summary>Last lines of real output</summary>

```
checkzoho: 56 rows valid — every app named is real, every verdict carries a reason, and no row claims what a page says without the day it was read (56 of 56 unread)
```
</details>

---

## V-AUDIT · exit 0

The audit register: score bounded by the gated rung, maturity capped while nothing is deployed, every queue task citing a real requirement.

| | |
|---|---|
| Command | `node brand/site/checkaudit.js` |
| Exit code | **0** |
| Ran | 2026-09-02T04:42:55.271Z → 2026-09-02T04:42:55.331Z (0.1s) |
| Commit | `d5b8b394bd3a7464cd3353dafb2695f658cea123` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `brand/site/audit.js` — `46b1326927f633fbba383e724039f513999ba75d6db79fbd7207961c98f0da2e` (23,888 bytes)
  - `BUILD_QUEUE.md` — `9a4495177d4185f2cdaf59ea3ce5017cae1875e51e225c5334cdec006f43e6e5` (18,069 bytes)

<details><summary>Last lines of real output</summary>

```
checkaudit: valid — 8 queue tasks, every requirement cited is a real registry row, every dependency points backwards; score 1.4/5 across 132 rows, recomputed from the gated rungs; maturity level 3 (Prototype)
```
</details>

---

## V-CONFLICTS · exit 0

The conflict register with its three new columns: what each contradiction affects, what the system does while it is undecided, and the question somebody has to answer.

| | |
|---|---|
| Command | `node brand/site/checkconflicts.js` |
| Exit code | **0** |
| Ran | 2026-09-02T04:49:13.599Z → 2026-09-02T04:49:13.655Z (0.1s) |
| Commit | `692c3fcccc2c19d001411101008578278e1a920f` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `brand/site/conflicts.js` — `cf4836f251b5f5e26dfb93e26f1e1cdf9fb644c7a6051b8fabff49e089837787` (23,213 bytes)
  - `SPEC_CONFLICTS.md` — `936d34be42b80d3a42bb09c0514a325e72f2cd2771c1772cc4d9007fe480ef4b` (27,955 bytes)

<details><summary>Last lines of real output</summary>

```
checkconflicts: all valid — 10 conflicts, 37 line references, every one quoted; 9 unresolved by decision; no person named
```
</details>

---

## V-ARCHIVE · exit 0

The product archive extracted, npm ci run, and npm run test:product run inside it with ZERO tenants installed; then the tenant unzipped over it and both suites run again. Not inspected — actually run.

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **0** |
| Ran | 2026-09-02T04:56:44.411Z → 2026-09-02T04:58:40.578Z (116.2s) |
| Commit | `dcdfead3b147832d4c684c5533524337d9093fc8` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```

    SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks
    
    --- the karigar corpus (real file) ---
    SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
    ======================================================================
    397 passed, 0 failed

  tenant suite, which could not run before the overlay: exit 0

  Product alone: passes with no tenant. Product + tenant: both suites pass.
  The split is a partition — every tracked file in exactly one archive — and it rejoins.
```
</details>

---

## V-SITE · exit 0

The assembled site served over real HTTP and driven in Chromium: the landing page carries the three statements that stop a live URL implying more than it should, no root-absolute link survived the rebase, two apps load with real controls, nothing threw and nothing 404ed.

| | |
|---|---|
| Command | `node brand/site/checksite.js` |
| Exit code | **0** |
| Ran | 2026-09-02T14:49:02.986Z → 2026-09-02T14:49:06.026Z (3s) |
| Commit | `90c5645022ef8f5d2f234a901424634ad113b793` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `brand/delivery/website/mksite.js` — `70aae11d5481badc7219167a8212911cef9f6caa015751fbc465896c3bb3a5a2` (14,830 bytes)
  - `brand/site/checksite.js` — `9ad31bf2cfafd736cf885cc09b738296474aed059f914216b8b4c30af0bec685` (6,853 bytes)

<details><summary>Last lines of real output</summary>

```
  ok   it carries the measured score rather than a boast
  ok   it links the app pages
  ok   the generated product website loads
  ok   no root-absolute link survived the rebase
  ok   d2c-product loads
  ok   d2c-product rendered real controls
  ok   dashboard-product loads
  ok   dashboard-product rendered real controls
  ok   no page threw
  ok   no request 404ed

checksite: the published site works — landing page, both edition websites, 36 app page(s), nothing thrown, nothing 404ed
```
</details>

---

## V-APPS · exit 0

Q01: every browser app built and its own self-tests run, now inside npm test. Each app's assertions are gated, so a broken control turns the suite red instead of going unnoticed.

| | |
|---|---|
| Command | `npm run apps` |
| Exit code | **0** |
| Ran | 2026-09-02T15:08:01.807Z → 2026-09-02T15:08:02.329Z (0.5s) |
| Commit | `eaff2397e101d3c8b03c6b9afda5fd457cd45db0` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `brand/suite/deep/apps.js` — `1768d72372d77c8939e9ced1d49bde5ab6bef66c0fa2db9c2beb5c2646b4e7a0` (2,633 bytes)

<details><summary>Last lines of real output</summary>

```
OK  procurement_ERP.html               tests 23/23  70KB
OK  procurement_Vastrangam.html        tests 23/23  70KB
OK  vendors_ERP.html                   tests 23/23  69KB
OK  vendors_Vastrangam.html            tests 23/23  69KB
OK  oms_ERP.html                       tests 51/51  91KB
OK  oms_Vastrangam.html                tests 51/51  92KB
OK  ordman_ERP.html                    tests 55/55  105KB
OK  ordman_Vastrangam.html             tests 55/55  106KB
OK  askprint_ERP.html                  tests 50/50  90KB
OK  askprint_Vastrangam.html           tests 50/50  91KB

Deep build · 0 test failures
```
</details>

---

## V-MEDHAVA2 · exit 0

The platform suite with module 07 in it: isolation, inventory, sales, purchase and the browser shell. Purchase order to goods receipt now runs on the real database inside row-level security — the half of a working day this platform did not have.

| | |
|---|---|
| Command | `npm run medhava` |
| Exit code | **0** |
| Ran | 2026-09-02T15:18:36.634Z → 2026-09-02T15:19:01.879Z (25.2s) |
| Commit | `1c09b58866da511562cf0fae5dd682e3fdeca1d6` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `medhava/server/purchase.js` — `baf47270c65804be4b88add7c96aaa4c91cd5210b6bb52420a5287bdc962eb53` (17,510 bytes)
  - `medhava/test/purchase.test.js` — `ee286248a4ca837865cdaf19af594e22f2cbd69595829ff5228b21955fd0f73f` (12,358 bytes)

<details><summary>Last lines of real output</summary>

```
  ok    B1  the sign-in card actually disappears after signing in
  ok    B2  a two-company account is asked which company, not shown a blank page
  ok    B3  the isolation screen shows a visible-versus-actual figure for each thing
  ok    B4  changing the company changes what the screen shows
  ok    B5  every module page opens and is labelled as specified, not built
  ok    B7  a sale can be recorded on the screen, and the receipt names both documents
  ok    B8  a sale the rules refuse is explained by rule number on the screen
  ok    B6  the page threw nothing and no request failed

  ====================================================================
  9 passed, 0 failed
  Driven in Chromium: clicked, switched company, and opened every module.
```
</details>

---

## V-DAY · exit 0

One working day composed from three modules on the real database: buy 60, receive 40 short, sell 25 — the ledger agreeing with the warehouse, and none of it visible to a second company. Three of the five steps the maturity level names; nothing here makes or ships anything.

| | |
|---|---|
| Command | `npm run medhava` |
| Exit code | **0** |
| Ran | 2026-09-02T15:22:53.825Z → 2026-09-02T15:23:22.316Z (28.5s) |
| Commit | `1c09b58866da511562cf0fae5dd682e3fdeca1d6` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `medhava/test/day.test.js` — `3d10be8a223c5519a2c3c30d89d87e5f695a9fd46d57d8a635e5c9b0670b7483` (11,754 bytes)

<details><summary>Last lines of real output</summary>

```
  ok    B1  the sign-in card actually disappears after signing in
  ok    B2  a two-company account is asked which company, not shown a blank page
  ok    B3  the isolation screen shows a visible-versus-actual figure for each thing
  ok    B4  changing the company changes what the screen shows
  ok    B5  every module page opens and is labelled as specified, not built
  ok    B7  a sale can be recorded on the screen, and the receipt names both documents
  ok    B8  a sale the rules refuse is explained by rule number on the screen
  ok    B6  the page threw nothing and no request failed

  ====================================================================
  9 passed, 0 failed
  Driven in Chromium: clicked, switched company, and opened every module.
```
</details>

---

## V-ARCHIVE2 · exit 0

Both archives rebuilt with module 07, the working-day test, the live-site generator and the six audit documents inside. Extracted, npm ci run, npm run test:product run with ZERO tenants, then the tenant unzipped over it and both suites run again.

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **0** |
| Ran | 2026-09-02T15:31:04.484Z → 2026-09-02T15:33:11.319Z (126.8s) |
| Commit | `36d018aadfca33fda2b15d10708a9e3130cdd70d` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```

    SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks
    
    --- the karigar corpus (real file) ---
    SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
    ======================================================================
    397 passed, 0 failed

  tenant suite, which could not run before the overlay: exit 0

  Product alone: passes with no tenant. Product + tenant: both suites pass.
  The split is a partition — every tracked file in exactly one archive — and it rejoins.
```
</details>

---

## V-HANDOVER · exit 0

the handover pack's gate: every document the owner is sent to exists, every command he is told to type resolves against package.json or the filesystem, every step says how he knows it worked, and no customer is named in the product's own handover

| | |
|---|---|
| Command | `node brand/site/checkhandover.js` |
| Exit code | **0** |
| Ran | 2026-09-12T02:37:23.207Z → 2026-09-12T02:37:23.265Z (0.1s) |
| Commit | `0d674e81471ac164042cb704719df33cf1b85fb1` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
checkhandover: the handover pack is sound — 8 setup steps and 7 stages, every document they point at exists, every command they quote is real, every step says how you know it worked, no customer named
```
</details>

---

## V-ARCHIVE3 · exit 0

both archives rebuilt with the handover pack inside: the product extracted and its suite run with zero tenants, then the tenant unzipped over it and both suites run again

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **0** |
| Ran | 2026-09-12T02:40:46.375Z → 2026-09-12T02:42:31.076Z (104.7s) |
| Commit | `0d674e81471ac164042cb704719df33cf1b85fb1` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```

    SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks
    
    --- the karigar corpus (real file) ---
    SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
    ======================================================================
    397 passed, 0 failed

  tenant suite, which could not run before the overlay: exit 0

  Product alone: passes with no tenant. Product + tenant: both suites pass.
  The split is a partition — every tracked file in exactly one archive — and it rejoins.
```
</details>

---

## V-CONTENTS · exit 0

the two contents documents checked against the real archives: every entry in each zip's central directory appears in its document, every path in each document is in its zip, each stated count is the length of its own list, and every quoted description was re-read from the file it describes

| | |
|---|---|
| Command | `node brand/site/checkcontents.js` |
| Exit code | **0** |
| Ran | 2026-09-12T03:27:33.190Z → 2026-09-12T03:27:33.730Z (0.5s) |
| Commit | `0e6c5dc894d8723c06d9ef70cee7de2cc5f51dae` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
checkcontents: both contents documents are complete and true — 606 files listed across two archives, 424 description(s) re-read from the files they describe, 2 on binary files that cannot be searched for text, every entry matched against the built archive
```
</details>

---

## V-ARCHIVE4 · exit 1  ← NON-ZERO

both archives rebuilt with their own contents documents inside: product extracted into a clean directory and its suite run with zero tenants, then the tenant unzipped over it and both suites run again

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **1** |
| Ran | 2026-09-12T03:28:07.951Z → 2026-09-12T03:28:31.785Z (23.8s) |
| Commit | `0e6c5dc894d8723c06d9ef70cee7de2cc5f51dae` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
        node brand/site/checkcontents.js
    checkcontents: MEDHAVA_CONTENTS.md says START_HERE.md is "Written into the archive when it is built — what this is, and the comm…", and that text is no longer in the file. Regenerate — a description that was true when written and is not true now is the exact drift this document exists to make impossible.
    checkcontents: VASTRANGAM_CONTENTS.md has not been generated — run node brand/delivery/website/mkcontents.js
    
    checkcontents: 2 problem(s).

  npm run test:product with ZERO tenants installed: exit 1
  The product archive does NOT build.
checkcontents: MEDHAVA_CONTENTS.md says START_HERE.md is "Written into the archive when it is built — what this is, and the comm…", and that text is no longer in the file. Regenerate — a description that was true when written and is not true now is the exact drift this document exists to make impossible.
checkcontents: VASTRANGAM_CONTENTS.md has not been generated — run node brand/delivery/website/mkcontents.js

checkcontents: 2 problem(s).
```
</details>

---

## V-ARCHIVE4 · exit 1  ← NON-ZERO

both archives rebuilt with their own contents documents inside: the product extracted into a clean directory and its suite run with zero tenants, then the tenant unzipped over it and both suites run again

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **1** |
| Ran | 2026-09-12T03:29:40.888Z → 2026-09-12T03:30:07.681Z (26.8s) |
| Commit | `0e6c5dc894d8723c06d9ef70cee7de2cc5f51dae` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
  stderr: Buffer(69) [Uint8Array] [
    102,  97, 116,  97, 108,  58,  32, 110, 111, 116,  32,
     97,  32, 103, 105, 116,  32, 114, 101, 112, 111, 115,
    105, 116, 111, 114, 121,  32,  40, 111, 114,  32,  97,
    110, 121,  32, 111, 102,  32, 116, 104, 101,  32, 112,
     97, 114, 101, 110, 116,  32, 100, 105, 114, 101,  99,
    116, 111, 114, 105, 101, 115,  41,  58,  32,  46, 103,
    105, 116,  10
  ]
}

Node.js v22.22.2
```
</details>

---

## V-ARCHIVE4 · exit 0

both archives rebuilt with their own contents documents inside: the product extracted into a clean directory and its suite run with zero tenants, then the tenant unzipped over it and both suites run again

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **0** |
| Ran | 2026-09-12T03:32:29.506Z → 2026-09-12T03:34:21.439Z (111.9s) |
| Commit | `0e6c5dc894d8723c06d9ef70cee7de2cc5f51dae` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
    SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
    ======================================================================
    397 passed, 0 failed

  tenant suite, which could not run before the overlay: exit 0

  Product alone: passes with no tenant. Product + tenant: both suites pass.
  The split is a partition — every tracked file in exactly one archive — and it rejoins.
fatal: not a git repository (or any of the parent directories): .git
fatal: not a git repository (or any of the parent directories): .git
fatal: not a git repository (or any of the parent directories): .git
fatal: not a git repository (or any of the parent directories): .git
```
</details>

---

## V-PDFSPLIT · exit 0

the four archives checked against each other and against the two contents documents: every entry in each of the four zips is named in its document, nothing named is absent, and no file is in two archives

| | |
|---|---|
| Command | `node brand/site/checkcontents.js` |
| Exit code | **0** |
| Ran | 2026-09-12T07:08:39.539Z → 2026-09-12T07:08:40.095Z (0.6s) |
| Commit | `f5c541a1d7599eb0f4baa2b3dba498a4bd8b34a6` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
checkcontents: both contents documents are complete and true — 581 files across the two build archives and 25 across the two PDF archives, 424 description(s) re-read from the files they describe, every entry in all four matched against the built archive
```
</details>

---

## V-ARCHIVE5 · exit 0

all four archives rebuilt with the PDFs split out: the product extracted into a clean directory, asserted to contain zero PDFs in the unzipped tree, npm ci run and its suite run with zero tenants, then the tenant unzipped over it and both suites run again

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **0** |
| Ran | 2026-09-12T07:08:43.629Z → 2026-09-12T07:10:24.894Z (101.3s) |
| Commit | `f5c541a1d7599eb0f4baa2b3dba498a4bd8b34a6` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```

    SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks
    
    --- the karigar corpus (real file) ---
    SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
    ======================================================================
    397 passed, 0 failed

  tenant suite, which could not run before the overlay: exit 0

  Product alone: passes with no tenant. Product + tenant: both suites pass.
  The split is a partition — every tracked file in exactly one archive — and it rejoins.
```
</details>

---

## V-BENCHMARK · exit 0

the parameters register checked: every claim about another product carries the address it came from and the day it was found, our own side on each parameter resolved from the requirements registry rather than stored, and every behind row naming what would close it

| | |
|---|---|
| Command | `node brand/site/checkbenchmark.js` |
| Exit code | **0** |
| Ran | 2026-09-13T05:48:30.507Z → 2026-09-13T05:48:30.556Z (0s) |
| Commit | `69b0082cd1d5d0d2db0fd102d0100225a25a8596` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
checkbenchmark: 29 parameters across 11 dimensions — every claim about another product carries its url and the day it was found (27 claim(s), 16 source(s), 2026-09-13), our side resolved from the requirements registry rather than stored, every BEHIND row naming what closes it
```
</details>

---

## V-ARCHIVE6 · exit 0

all four archives rebuilt carrying the benchmark documents: the product extracted into a clean directory, asserted to hold zero PDFs in the unzipped tree, npm ci run and its suite run with zero tenants, then the tenant unzipped over it and both suites run again

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **0** |
| Ran | 2026-09-13T05:51:21.085Z → 2026-09-13T05:53:00.551Z (99.5s) |
| Commit | `69b0082cd1d5d0d2db0fd102d0100225a25a8596` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```

    SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks
    
    --- the karigar corpus (real file) ---
    SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
    ======================================================================
    397 passed, 0 failed

  tenant suite, which could not run before the overlay: exit 0

  Product alone: passes with no tenant. Product + tenant: both suites pass.
  The split is a partition — every tracked file in exactly one archive — and it rejoins.
```
</details>

---

## V-MASTERSPEC · exit 0

the master-spec coverage register checked: every mapped app id real, every verdict resolved from the requirements registry rather than stored, every not-possible line naming what makes it so, and the stated total equal to the length of the list

| | |
|---|---|
| Command | `node brand/site/checkmasterspec.js` |
| Exit code | **0** |
| Ran | 2026-09-13T06:42:51.507Z → 2026-09-13T06:42:51.557Z (0.1s) |
| Commit | `fdb647fba521410e1215a6733ab95adea064813b` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
checkmasterspec: 31 sections · 945 line items — 200 covered (21%), 660 uncovered (70%), 85 not possible from here (9%); every mapped app id real, every verdict resolved from the requirements registry rather than stored
```
</details>

---

## V-ARCHIVE7 · exit 1  ← NON-ZERO

all four archives rebuilt carrying the coverage sheet: the product extracted into a clean directory, asserted to hold zero PDFs, its suite run with zero tenants, then the tenant unzipped over it and both suites run again

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **1** |
| Ran | 2026-09-13T06:42:51.647Z → 2026-09-13T06:43:16.231Z (24.6s) |
| Commit | `fdb647fba521410e1215a6733ab95adea064813b` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
      These documents count files tracked by git, and there is no repository
      here to count. Nothing about them can be verified from this directory,
      and this refuses to report that as a pass.
    mkhandover: all 4 documents current — 8 setup steps, 7 stages, score 1.5/5 read from the registers
    mkbenchmark: BENCHMARK_GAPS.md is current
    mkbenchmark: PARITY_PLAN.md is current
    mkmasterspec: MASTER_SPEC_COVERAGE.md is current
    mkmasterspec: masterspec.data.json is out of date — run without --check.

  npm run test:product with ZERO tenants installed: exit 1
  The product archive does NOT build.
mkmasterspec: masterspec.data.json is out of date — run without --check.
```
</details>

---

## V-ARCHIVE7 · exit 0

all four archives rebuilt carrying the coverage sheet: the product extracted into a clean directory, asserted to hold zero PDFs, its suite run with zero tenants, then the tenant unzipped over it and both suites run again

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **0** |
| Ran | 2026-09-13T06:44:06.250Z → 2026-09-13T06:45:50.030Z (103.8s) |
| Commit | `fdb647fba521410e1215a6733ab95adea064813b` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```

    SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks
    
    --- the karigar corpus (real file) ---
    SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
    ======================================================================
    397 passed, 0 failed

  tenant suite, which could not run before the overlay: exit 0

  Product alone: passes with no tenant. Product + tenant: both suites pass.
  The split is a partition — every tracked file in exactly one archive — and it rejoins.
```
</details>

---

## V-BACKLOG · exit 0

the 109 absent lines, rebuilt from the coverage register and matching it exactly

| | |
|---|---|
| Command | `node brand/site/checkbacklog.js` |
| Exit code | **0** |
| Ran | 2026-09-13T21:55:48.055Z → 2026-09-13T21:55:48.123Z (0.1s) |
| Commit | `901875463c71705c1f29c16e6cd10b047431c815` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
checkbacklog: 109 lines the design does not name, in 12 themes — rebuilt from the coverage register and matching it exactly, every module and capability real, nothing carrying a status
```
</details>

---

## V-ARCHIVE8 · exit 0

the product archive extracted and RUN with the two built HTML files absent, then the tenant unzipped over it

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **0** |
| Ran | 2026-09-13T21:55:51.532Z → 2026-09-13T21:58:04.797Z (133.3s) |
| Commit | `901875463c71705c1f29c16e6cd10b047431c815` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```

    SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks
    
    --- the karigar corpus (real file) ---
    SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
    ======================================================================
    397 passed, 0 failed

  tenant suite, which could not run before the overlay: exit 0

  Product alone: passes with no tenant. Product + tenant: both suites pass.
  The split is a partition — every tracked file in exactly one archive — and it rejoins.
```
</details>

---

## V-ARCHIVE8 · exit 0

final: all four archives rebuilt, product extracted and run with no tenant, tenant unzipped over it

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **0** |
| Ran | 2026-09-13T22:04:27.937Z → 2026-09-13T22:06:34.788Z (126.9s) |
| Commit | `901875463c71705c1f29c16e6cd10b047431c815` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```

    SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks
    
    --- the karigar corpus (real file) ---
    SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
    ======================================================================
    397 passed, 0 failed

  tenant suite, which could not run before the overlay: exit 0

  Product alone: passes with no tenant. Product + tenant: both suites pass.
  The split is a partition — every tracked file in exactly one archive — and it rejoins.
```
</details>

---

## V-PRIVACY · exit 0

no tracked file names a real person or pairs one with money; the payroll engine still runs on the synthetic roster

| | |
|---|---|
| Command | `node brand/site/checkprivacy.js` |
| Exit code | **0** |
| Ran | 2026-09-14T04:52:39.232Z → 2026-09-14T04:52:50.604Z (11.4s) |
| Commit | `0951aedeb7b78d2b4b24fc689032877aed465617` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
checkprivacy: 842 tracked files — none of the 35 real names, ids or aliases appears in any of them; 26 data file(s) scanned, none pairing a person with money
```
</details>

---

## V-ENGINE-SYNTH · exit 0

the payroll engine proven against the synthetic roster, 397 checks

| | |
|---|---|
| Command | `python3 engine/tests/selftest.py` |
| Exit code | **0** |
| Ran | 2026-09-14T04:52:50.669Z → 2026-09-14T04:52:52.994Z (2.3s) |
| Commit | `0951aedeb7b78d2b4b24fc689032877aed465617` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
ok   a figure that moves because a source changed is expected and visible

--- the corpus (real files) ---
SKIP the corpus figures — set VAS_CORPUS to the staff workbook to check 9,75,649 payroll / 10,09,023 paid / 10,388 hours / 159 designs

--- the stray header, on the real file ---
SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks

--- the karigar corpus (real file) ---
SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
======================================================================
397 passed, 0 failed
```
</details>

---

## V-HISTORY · exit 0

the rewritten branch history searched blob by blob for every real roster string

| | |
|---|---|
| Command | `/tmp/claude-0/histcheck.sh refs/heads/claude/ai-content-platform-design-44swji` |

**Cause, found after this run:** the command lives in a scratch directory, so nobody but the
session that wrote it — in the container that still holds it — can re-run it. That defeats the
one promise this log makes, which `HANDOFF.md` now leans on directly: *if a commit claims
something, re-run that command rather than believing it.* `node tools/evidence.js --check`
found it, which is the check doing exactly its job on its own keeper.

The check itself was correct and its result stands: 14 matching blob lines on the scrubbed
branch against 3476 on the un-rewritten backup, and the two matching PDFs confirmed clean by
extracting their rendered text. Only the *location* of the script was wrong, not the finding.

It is not deleted. Removing it would erase the record that the mistake was made, and a log that
quietly drops its own embarrassments is not evidence of anything.

Superseded by **V-HISTORY**, re-recorded against the committed `tools/history_check.sh`.
| Exit code | **0** |
| Ran | 2026-09-14T05:17:21.604Z → 2026-09-14T05:17:27.012Z (5.4s) |
| Commit | `104a7230414632a299c60adf6d785fbf553b79cc` on `claude/ai-content-platform-design-44swji` |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
objects reachable from refs/heads/claude/ai-content-platform-design-44swji: 4287
blob contents matching any real roster string: 14
```
</details>

---

## V-HISTORY · exit 0

the scrubbed branch history, checked by a COMMITTED tool — the earlier entry pointed at a scratch path no other model could run

| | |
|---|---|
| Command | `tools/history_check.sh refs/heads/claude/ai-content-platform-design-44swji` |
| Exit code | **0** |
| Ran | 2026-09-16T21:49:35.846Z → 2026-09-16T21:49:41.013Z (5.2s) |
| Commit | `c49a7d860f751b1a9329b76da6774b6a5f03bb63` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
history_check: refs/heads/claude/ai-content-platform-design-44swji — 4307 objects reachable, 14 blob line(s) matching a real name
  Non-zero. Identify each one before concluding: a text file is a real leak, a PDF or
  other compressed binary is very likely a chance byte sequence and must be confirmed
  by extracting its rendered text before it is called either way.
```
</details>

---

## V-COMPETITOR · exit 0

the competitor gate, now over every tracked file rather than only archived ones; five isolating plants proven separately

| | |
|---|---|
| Command | `node brand/site/checkcompetitor.js --summary` |
| Exit code | **0** |
| Ran | 2026-09-16T23:58:47.705Z → 2026-09-16T23:59:00.955Z (13.3s) |
| Commit | `95ca453abe933d52cc6a0e5b9f7ae76e093c76a8` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
  uses correctly. A case-insensitive gate would flag good prose and get itself
  switched off.

  3 format literal(s) are removed before the search, each one a
  third party's own wire format rather than a mention of it. Every other
  appearance in the same file still fails:
    60×  product.metafields.shopify.
        brand/suite/aiengine/33_spec.js · The storefront's own metafield namespace, written into 13 of the 61 column headers of its produc…
    4×  'Variant Inventory Tracker'] = 'shopify'
        brand/suite/aiengine/33_spec.js · The import format's value meaning 'this platform tracks the stock itself'. The field takes an en…
    1×  if zoho was build then they kept any tenant inside it
        AUDIT_REPORT.md · The owner's own sentence, quoted with his spelling because it is the reason the product and the …
```
</details>

---

## V-ARCHIVE5 · exit 0

after the competitor research moved out of the repository: the product archive extracted and RUN with zero tenants, then the tenant unzipped over it and both suites run again

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **0** |
| Ran | 2026-09-16T23:59:03.371Z → 2026-09-17T00:00:58.831Z (115.5s) |
| Commit | `95ca453abe933d52cc6a0e5b9f7ae76e093c76a8` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```

    SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks
    
    --- the karigar corpus (real file) ---
    SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
    ======================================================================
    397 passed, 0 failed

  tenant suite, which could not run before the overlay: exit 0

  Product alone: passes with no tenant. Product + tenant: both suites pass.
  The split is a partition — every tracked file in exactly one archive — and it rejoins.
```
</details>

---

## V-RESTRUCTURE · exit 0

the 109 absent specification lines each given a named app; 22 modules to 31, 113 apps to 165

| | |
|---|---|
| Command | `node brand/site/checkbacklog.js` |
| Exit code | **0** |
| Ran | 2026-09-17T21:37:48.056Z → 2026-09-17T21:37:48.103Z (0s) |
| Commit | `b56aab93162ac1d7d5bbf64c9cb481e03ac6c989` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
checkbacklog: 0 lines the design does not name, in 12 themes — rebuilt from the coverage register and matching it exactly, every module and capability real, nothing carrying a status
```
</details>

---

## V-PRIVACY-BLOB · exit 0

checkprivacy confirms a compressed or base64 hit by extraction instead of reporting the container; proven by plants in an html blob and inside a zip

| | |
|---|---|
| Command | `node brand/site/checkprivacy.js` |
| Exit code | **0** |
| Ran | 2026-09-17T21:37:54.754Z → 2026-09-17T21:38:06.219Z (11.5s) |
| Commit | `b56aab93162ac1d7d5bbf64c9cb481e03ac6c989` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
checkprivacy: 833 tracked files — none of the 35 real names, ids or aliases appears in any of them; 26 data file(s) scanned, none pairing a person with money
```
</details>

---

## V-ARCHIVE-RESTRUCTURE · exit 0

both archives extracted, npm ci, product suite run with zero tenants, then the tenant overlaid and both suites run again, after the 22-to-31 module restructure

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **0** |
| Ran | 2026-09-17T21:38:06.301Z → 2026-09-17T21:39:43.557Z (97.3s) |
| Commit | `b56aab93162ac1d7d5bbf64c9cb481e03ac6c989` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `MEDHAVA_BOS.zip` — `7795466fed96bb958bff076fe88b9984c2385d56e21aabd0042c93faa6205ab4` (13,988,399 bytes)
  - `VASTRANGAM_TENANT.zip` — `55fa3632a1cdd3252e36048d4646ea55fc800488df16a65a49512163b741000d` (5,580,513 bytes)

<details><summary>Last lines of real output</summary>

```

    SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks
    
    --- the karigar corpus (real file) ---
    SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
    ======================================================================
    397 passed, 0 failed

  tenant suite, which could not run before the overlay: exit 0

  Product alone: passes with no tenant. Product + tenant: both suites pass.
  The split is a partition — every tracked file in exactly one archive — and it rejoins.
```
</details>

---

## V-DEDUP · exit 0

the two merged reprints retired: 26 documents to 24, 2.50MB of reading to 1.66MB, line duplication 89.6% to 60.9%, 60 distinct lines lost out of 6762

| | |
|---|---|
| Command | `node brand/site/checkcoverage.js` |
| Exit code | **0** |
| Ran | 2026-09-18T05:19:04.231Z → 2026-09-18T05:19:04.668Z (0.4s) |
| Commit | `cb52efafc2371300a2e43ae03a4ea456df7bde29` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
checkcoverage: all valid — 24 documents × 6 registers, every pair decided, every "full" verified, every PDF current
```
</details>

---

## V-ARCHIVE-DEDUP · exit 0

both archives extracted, npm ci, product suite run with zero tenants, tenant overlaid, both suites run again, after the two merged documents were retired

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarter.js --verify --both` |
| Exit code | **0** |
| Ran | 2026-09-18T05:19:04.753Z → 2026-09-18T05:20:40.434Z (95.7s) |
| Commit | `cb52efafc2371300a2e43ae03a4ea456df7bde29` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - `MEDHAVA_BOS.zip` — `bb8daaf78e6e9c616693a920467c905d07d25069eb3440b0206677bfbf56471b` (14,703,040 bytes)
  - `VASTRANGAM_TENANT.zip` — `91594fc816dd7e2baee64f114c502efd79b3663f7daa50a06e06f47475bb8574` (6,379,699 bytes)

<details><summary>Last lines of real output</summary>

```

    SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks
    
    --- the karigar corpus (real file) ---
    SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / 54,436 pieces
    ======================================================================
    397 passed, 0 failed

  tenant suite, which could not run before the overlay: exit 0

  Product alone: passes with no tenant. Product + tenant: both suites pass.
  The split is a partition — every tracked file in exactly one archive — and it rejoins.
```
</details>

---

## V-STARTHERE · exit 0

MEDHAVA_START_HERE.md: the cold-context prompt, every path and command verified before writing, counts derived from the registers

| | |
|---|---|
| Command | `node brand/delivery/website/mkstarthere.js --check` |
| Exit code | **0** |
| Ran | 2026-09-18T05:57:46.361Z → 2026-09-18T05:57:46.419Z (0.1s) |
| Commit | `9334c42cac38445573a2c94fa7a6a1aae70b7088` on `claude/ai-content-platform-design-44swji` — **working tree dirty** |
| Environment | node v22.22.2 · linux x64 |

Artifacts:
  - none recorded

<details><summary>Last lines of real output</summary>

```
mkstarthere: MEDHAVA_START_HERE.md is current · 10 paths and 4 commands all verified to exist
```
</details>

---
