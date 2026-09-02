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
