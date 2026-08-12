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

## Where your data lives

Two options, and the engine reads either.

**The Staff & Karigar Master Data workbook** (§1 of the Universal Master Prompt).
Build a blank one to fill in:

```
python3 engine/tests/make_template.py Master_Data.xlsx
python3 engine/run.py --master Master_Data.xlsx --fy 2025-26 --attendance ...
```

Three tabs — Staff Master, Hours Reference, Karigar Master — plus optional
Salary Log, Threshold Hours Log and Threshold Days Log when a rate changed
part-way through and past months should be priced at what applied then.

**Keep that workbook out of this repository.** It holds Aadhaar, PAN, bank
account, IFSC and UPI. The reader holds those fields in memory for a payment
run and refuses to write them anywhere — the object carrying them raises if you
try to serialise it, and there is a test that proves it. Keep the file where
your payroll records already live.

**Or `engine/fixtures/master.json`** — the same data as JSON, with no personal
or banking fields in it at all. That is what the tests run against.

Either way: edit the data and run again. No code changes, ever. If you find
yourself needing to change code to fix a number, that is a bug in the engine,
not in your file.

### Pay basis is worked out, not typed

§1.2 — the basis follows from which columns you filled:

| Filled | Basis |
|---|---|
| Monthly Salary + Threshold Hour | Attendance |
| Daily Wage, no salary | Daily-wage |
| Monthly Salary only | Flat |
| none of the three | Piece-rate — the rate lives in the work report |

Fill the Pay Basis column only to override that. One combination has no valid
answer — a threshold with no salary, which §1.2 reads as Flat while §4.3 pays
Flat staff a salary that is not there. The engine refuses to price it and says
so, rather than paying zero.

Two overrides sit above the inference, in that order: the Pay Basis column, then
`fixtures/rule_change_log.json` (§6). The Rule Change Log is what makes flat pay
correct for someone whose columns look attendance-based — without it the
inference would quietly take over.

### Threshold Day is not Threshold Hour divided by a day

§1.1 has no Threshold Day column, and it cannot be derived reliably: 280 hours
at a ten-hour day is 28 days, but 230 hours at an eight-hour day is 28.75 where
the real threshold is 28. The template adds the column. If you leave it out, the
engine derives it and flags every row where it did.

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

## Two pricings, one of them paid

Every month is priced twice and both are reported:

| | FY2025-26 |
|---|---|
| **Days-scaled — `(Salary ÷ Threshold Days) × Days-Equivalent`. This is what is paid.** | **₹9,75,648.81** |
| Hours-scaled — `Salary × (Actual Hours ÷ Threshold Hours)`, §4.1. Comparison only. | ₹9,23,269.10 |

₹52,380 apart, and the days figure is the one that matches the reported total.
The cause is structural: the day threshold is 28 while months run 30–31 days, so
days-equivalent routinely clears it, whereas hours rarely clear 280. Per person
the gap runs from ₹436 to ₹22,202. Flat and piece-rate staff show the same
figure in both columns, because nothing scales either of them.

Allocation, reconciliation and outstanding read the paid figure and only the
paid figure. The comparison column exists to settle the argument with numbers
rather than opinions.

**Staff pay never sums across financial years** (§9). Thresholds, salaries and
bases are all period-specific, so a combined figure across two years is not a
smaller number or a bigger one — it is a meaningless one. `total_payroll`
refuses the request. Karigar earnings do sum across years, because the same
design earns the same way.

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
| Every category resolves to an Hours Reference row | a missing row would read as a month of zero hours instead of as the missing row it is |
| Flat staff earn exactly their salary, whatever the attendance | a mid-year raise may change the figure; attendance never may |
| Piece-rate staff never draw on Staff Master | their rate lives in the work report, by definition |
| Reconciliation FY earning = the sum of the monthly rows | no figure is maintained twice |
| Every roster mismatch is listed | Inactive-but-working, and working-but-not-in-Master, are both flags — never a silent include or exclude |
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
- **Components are classified by structure, not by garment name.** Given a rate
  card of Choga, Ghagra and Dupatta — words the engine has never seen — it works
  out top, bottom and dupatta from the Set Type groups alone. The garment-name
  table is a last resort, and it reports itself every time it fires.
- **Personal and banking fields never reach the master data**, and the object
  holding them refuses to be written to a file.

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
| `vastrangam/template.py` | the Staff & Karigar Master Data workbook, and the only place personal details exist |
| `vastrangam/xlsx.py` | the only module that knows what a spreadsheet is |
| `fixtures/master.json` | your data. Yours to correct |
| `fixtures/rule_change_log.json` | §6. Append-only. Overrides the inferred pay basis |
| `tests/make_template.py` | builds the blank master workbook to fill in |

---

## Not built yet

The Excel writer — §5's seven staff sheets, §7.4's eight karigar sheets, §8's
Combined Productivity Overview, §9's multi-FY workbook and §10's styling. The
engine computes all of it; nothing formats it into a workbook yet. Worth saying
in advance: LibreOffice cannot open .xlsx in the environment this was built in,
so when that lands, formulas will be checked by recomputing them independently
rather than by recalculating the workbook.
