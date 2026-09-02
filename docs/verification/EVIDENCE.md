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
