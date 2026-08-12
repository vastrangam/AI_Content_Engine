# The staff and karigar engine

The rules live here. The data does not.

Nothing in this code names a person, a date or a rate. Every decision reads an
effective-dated log at run time. That is the whole design, and it exists for one
reason: you will keep correcting the files, and a correction should be a re-run,
never a rewrite.

---

## Run it

```
python3 engine/tests/selftest.py     # every rule, one line per check
python3 engine/run.py --self-test    # the gates and the run log, on the fixture alone
```

On real files:

```
python3 engine/run.py --fy 2025-26 \
    --attendance Staff_Report_FY_202526.xlsx \
    --work       Staff_Report_FY_202526.xlsx \
    --payments   Staff_Report_FY_202526.xlsx \
    --out        engine/out
```

It prints the gate results and a diff against the previous run, writes
`figures.json`, `needs_review.json`, `cost_per_piece.json` and `run_log.json`,
and **exits non-zero if any gate fails** — so a build that does not tie out
cannot be mistaken for one that does.

Python 3.11 and `openpyxl`. The rules themselves need neither: `openpyxl` is
only for reading workbooks, and it is imported inside the functions that need it.

---

## Correcting data

Everything you would want to change is in `engine/fixtures/master.json` — a
salary, a joining date, a threshold, a name someone spells three ways. Edit it
and run again. No code changes, ever. If you find yourself needing to change
code to fix a number, that is a bug in the engine, not in your file.

Three fields are worth knowing:

| | |
|---|---|
| `employment` | one row per **spell**. Somebody who left and came back has two rows, not an edited one. A gap between spells is not employment, and months inside it are excluded from every average |
| `salary`, `threshold_days`, `threshold_hours`, `pay_basis`, `piece_rate` | each is a log. Close the old row, open a new one from the date the change took effect. A row dated into the future simply starts working when that month comes |
| `_provisional` | everything I inferred rather than was told. Read this first |

**The two thresholds are separate on purpose.** `daily_rate = salary ÷ threshold
days` and `hourly_rate = salary ÷ threshold hours`. For the men they happen to
agree — 28 days at 10 hours is the 280-hour threshold. For the women they do
not: 28 × 8 is 224, and the hours threshold is 230. Neither is ever derived from
the other.

---

## The three states

A month is one of three things, and collapsing them is the most expensive
mistake in the whole system.

- **Not employed** — no spell covers it. Not an absence. Excluded from every
  average, count and rating.
- **No Data** — employed, but nothing was recorded. A tracking gap. Earns zero,
  rated "No Data", never "Below Average", and flagged.
- **Absent** — employed, marked, and the mark is A or blank. A real zero, scored
  normally.

In FY2025-26 the source held 2,215 blank cells against 152 marked 'A'. Reading
those blanks as absences would have scored eight people as failing months they
never worked.

---

## The gates

Every run checks these. A failure blocks delivery.

| Gate | Why |
|---|---|
| Every log resolves exactly one row per employed staff-month | zero matches is an **error**, not zero — that is how someone earns ₹0 without anyone noticing |
| Design cost + unallocated labour = total payroll | unallocated labour is real (holidays, paid leave, idle, unlogged hours) and hiding it makes cost per piece look better than it is |
| Every source row is matched or in Needs Review | nothing is ever dropped |
| Zero formula errors, zero broken references | |
| No logic references a person by name | the gate that keeps all of the above true |

The last one is not decoration. It caught three real names sitting in one of my
own docstrings during this build, twice.

---

## What the self-tests pin down

These reproduce on every run, forever:

- **The ten blended hourly rates** — 164.43, 63.49, 39.13, 82.14, 160.71,
  117.86, 53.57, 53.57, 36.96, 34.78. Not typed in: derived from the salary and
  threshold ladders, so if you change a salary the test tells you what moved.
- **Full attendance earns exactly the salary** — 20P + 4H + 2HL + 1OD + 1PL
  against a 26-day threshold.
- **Uncapped both ways** — 30 days worked against a 27-day threshold pays for 30.
- **Flat means flat** — the same earning whether the month is fully present or
  fully absent.
- **The hours table** — 30 present days for a man is 280 hours; 29 for a woman
  is 222. Sundays are 5 and 5.5 hours, and the lunch half-hour comes off daily.
- **The bottleneck** — 60 tops, 43 bottoms and 23 dupattas make 23 sets, with 37
  and 20 surplus, and those surpluses are never merged.
- **A totals row summed in with its own detail rows doubles the cost.** That one
  is a test because it happened.

With `VAS_CORPUS` pointed at the staff workbook, four more run against the real
file: payroll ₹9,75,649, paid ₹10,09,023, 10,388 logged hours, 159 designs.

```
VAS_CORPUS=/path/Staff_Report_FY_202526.xlsx python3 engine/tests/selftest.py
```

---

## The run log

Every run appends to `run_log.json`: the source file hashes, the gate results,
and every figure that moved since last time.

A number that moved because you fixed a file is expected, and you should be able
to see it. A number that moved while every input stayed byte-identical is a
regression, and the build fails.

---

## What is still missing

1. **Joginder & Ikram's FY2026-27 ₹/piece for the iron job.** FY2025-26 is
   settled at ₹100/hr. Those months currently report **Unresolvable**, not zero,
   so the hole stays visible instead of quietly reading as free labour.
2. **FY2026-27 is incomplete** — attendance stops on 4 August 2026, September to
   December are empty calendars, the work report is pending.
3. **The 14-sheet master workbook** — the entire money side.

---

## The files

| | |
|---|---|
| `vastrangam/logs.py` | the effective-dated log. `set_value` closes and appends; `resolve` raises rather than returning zero |
| `vastrangam/master.py` | the six logs, the shift table, the code table, the bands |
| `vastrangam/pay.py` | the two divisors, the three pay bases, the three states |
| `vastrangam/parsing.py` | structural header detection, mapping by name, the three file shapes |
| `vastrangam/karigar.py` | unit versus person, the bottleneck, rates and advances |
| `vastrangam/gates.py` | the checks that block a bad build |
| `vastrangam/runlog.py` | what moved, and whether it was allowed to |
| `vastrangam/xlsx.py` | the only module that knows what a spreadsheet is |
| `fixtures/master.json` | your data. Yours to correct |
