"""Self-tests — Part 11.

Fixed inputs with known answers. These must reproduce on every run, forever.

Run it:  python3 engine/tests/selftest.py

One line per check, `ok` or `FAIL` with the reason. No framework needed, because
this has to run on the owner's machine the day something looks wrong.
"""

from __future__ import annotations

import datetime as dt
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from vastrangam import (ATTENDANCE, DAILY_WAGE, FLAT, PIECE_RATE, AttendanceBook,
                        Master, Month, RunLog, allocate, blended_daily,
                        blended_hourly,
                        complete_sets, cost_per_piece_table, fy_pay, month_pay,
                        normalise, pool, roll_up, summarise, template,
                        total_payroll, weighted_rate)
from vastrangam.allocation import WorkRow
from vastrangam.attendance import UnknownCode
from vastrangam.calendar_util import DateError, fy_months, fy_of, parse_date
from vastrangam.gates import (allocation_ties_to_payroll, combined_equals_periods,
                              components_tie_to_design, earnings_tie_to_source,
                              flat_staff_are_flat, hours_reference_covers_everyone,
                              logs_resolve_once, no_formula_errors,
                              no_person_names_in_logic, nothing_dropped,
                              bottleneck_uses_the_set_composition,
                              piece_rate_never_uses_salary,
                              reconciliation_matches_summary, rows_price_themselves)
from vastrangam.karigar import (ALL_MEMBERS, BOTTOM, DEFAULT_SET_RULE, DUPATTA,
                                POPULATED, TOP,
                                KarigarRegistry, classify_components,
                                master_rate_conflict, parse_component_type,
                                variance_line)
from vastrangam.logs import Ambiguous, EffectiveLog, SpellLog, Unresolved
from vastrangam.names import AliasTable
from vastrangam.parsing import (Entry, find_headers, map_columns, parse_sku,
                                read_attendance_grid, read_sku_sheet, read_wide)
from vastrangam.pay import (EMPLOYED, NOT_EMPLOYED, NO_DATA, UNRESOLVED,
                            MultiYearRefused)
from vastrangam.performance import BELOW, SATISFACTORY
from vastrangam.template import infer_pay_basis

FIXTURE = ROOT / "fixtures" / "master.json"

PASS, FAIL = [], []


def check(name, condition, detail=""):
    (PASS if condition else FAIL).append(name)
    print(f"{'ok  ' if condition else 'FAIL'} {name}" + (f" — {detail}" if detail else ""))


def near(a, b, tol=0.01):
    return a is not None and abs(a - b) <= tol


def raises(exc, fn, *a, **k):
    try:
        fn(*a, **k)
    except exc:
        return True
    except Exception:
        return False
    return False


# ===========================================================================
# PART 1 — THE LAW: effective-dated logs
# ===========================================================================

def test_logs():
    print("\n--- the six logs, resolve and setValue ---")

    log = EffectiveLog("salary")
    log.set_value("x", "2025-04-01", 15000)
    log.set_value("x", "2025-06-01", 18000)
    rows = log.rows("x")
    check("set_value closes the open row instead of overwriting it",
          len(rows) == 2 and rows[0].to == dt.date(2025, 5, 31) and rows[1].to is None,
          " / ".join(r.span for r in rows))

    check("history is never rewritten — an earlier from-date is refused",
          raises(ValueError, log.set_value, "x", "2025-05-01", 99999))

    check("resolve returns what was in force that month",
          log.resolve("x", "2025-05") == 15000 and log.resolve("x", "2025-06") == 18000)

    check("zero matches is an error, not zero",
          raises(Unresolved, log.resolve, "x", "2025-03"))

    check("a value never silently becomes 0 for an unknown person",
          raises(Unresolved, log.resolve, "nobody", "2025-06"))

    # A row dated into the future must simply start working when that month runs.
    log.set_value("x", "2026-04-01", 20000)
    check("a future-dated row activates by itself",
          log.resolve("x", "2026-03") == 18000 and log.resolve("x", "2026-04") == 20000)

    overlap = EffectiveLog("bad")
    overlap.add("x", "2025-04-01", "2025-12-31", 1)
    overlap.add("x", "2025-06-01", None, 2)
    check("two rows in force for one month is Ambiguous, never a silent pick",
          raises(Ambiguous, overlap.resolve, "x", "2025-07"))

    seg = overlap.segments("x", "2025-06")
    check("segments show which rows touched the month and for how many days",
          len(seg) == 2 and {d for _, d in seg} == {30},
          str([(r.value, d) for r, d in seg]))

    check("maybe() is only for optional values", overlap.maybe("nobody", "2025-06") is None)


def test_spells():
    print("\n--- employment spells ---")

    s = SpellLog()
    s.join("x", "2025-04-01", "2025-08-31")
    s.join("x", "2026-01-01")           # left, then came back
    check("a person can leave and return — two spells, not an edit", len(s.spells("x")) == 2)
    check("the gap between spells is not employment",
          s.employed("x", "2025-07") and not s.employed("x", "2025-10")
          and s.employed("x", "2026-02"))
    check("overlapping spells are refused", raises(ValueError, s.join, "x", "2026-03-01"))
    check("a spell that ends mid-month still covers that month",
          s.employed("x", "2025-08"))


def test_names():
    print("\n--- names to identities ---")

    a = AliasTable()
    a.register("surender", "Surender", "SURENDAR", "SURENDER")
    check("every written form of a name resolves to one id",
          a.lookup("surendar") == a.lookup("  SURENDER ") == "surender")
    check("an unknown name resolves to nothing rather than a guess",
          a.lookup("Sarfaraz") is None)

    a.register("mustakim", "Mustakim")
    proposals = a.propose("Mostakim")
    check("a near match is proposed, never applied",
          proposals and proposals[0][0] == "mustakim" and a.lookup("Mostakim") is None,
          str(proposals))

    check("team names normalise the same either way",
          normalise("Sajid & Aamir") == normalise("Sajid and Aamir"))
    check("one alias cannot mean two people",
          raises(ValueError, a.register, "someone_else", "Surender"))


def test_dates():
    print("\n--- dates ---")

    check("DD-MM-YYYY is read the Indian way",
          parse_date("05-06-2025") == dt.date(2025, 6, 5))
    check("a four-digit year first means ISO",
          parse_date("2025-06-05") == dt.date(2025, 6, 5))
    check("Excel serials are read", parse_date(45748) == dt.date(2025, 4, 1))
    check("rubbish in a date cell raises rather than defaulting to today",
          raises(DateError, parse_date, "n/a"))
    check("a financial year starts in April",
          fy_of("2025-03-31") == "2024-25" and fy_of("2025-04-01") == "2025-26")


# ===========================================================================
# PART 9 — PARSING
# ===========================================================================

def test_parsing():
    print("\n--- parsing ---")

    rows = [
        ["Date", "Ibrahim", "Muskan"],          # 0 real: a date sits beneath it
        ["01-04-2025", "P", "P"],
        [None, None, None],
        ["Date", "Ibrahim", "Muskan"],          # 3 stray: another header beneath
        ["Date", "Ibrahim", "Karim"],           # 4 real
        ["01-05-2025", "P", "P"],
    ]
    found = find_headers(rows)
    check("a header is real only when a date sits beneath it",
          found.real == [0, 4] and found.stray == [3], f"real={found.real} stray={found.stray}")

    # The owner's corrected file puts the first header on row 1. A parser that
    # skipped a fixed number of rows would have quietly eaten a whole month.
    check("a header on the very first row is still found", 0 in found.real)

    header = ["Date", "Muskan", "Ibrahim"]      # columns swapped since last time
    cols = map_columns(header, {"date": ["date"]})
    check("columns are found by name, not position", cols["date"] == 0)

    check("a missing required column raises instead of reading the wrong one",
          raises(KeyError, map_columns, header, {"qty": ["qty"]}, ["qty"]))

    for text, code, set_type in [
        ("V508 (Top)", "V508", "Top"),
        ("V508-TOP", "V508", "Top"),
        ("v508 top & bottom", "v508", "Top & Bottom"),
        ("V508", "V508", None),
    ]:
        sku = parse_sku(text)
        check(f"SKU {text!r} reads as {code} / {set_type}",
              sku.code == code and sku.set_type == set_type,
              f"got {sku.code} / {sku.set_type}")


def test_attendance_grid():
    print("\n--- reading an attendance grid ---")

    master = Master.from_json(FIXTURE)
    book = AttendanceBook()
    grid = [
        ["Date", "Ibrahim", "MUSKAN", "Someone New"],
        ["01-08-2025", "P", "H", "P"],
        ["02-08-2025", "P", None, "X"],
        ["Date", "Muskan", "Ibrahim"],     # stray — no date beneath
        ["Date", "Muskan", "Ibrahim"],     # real, and the columns have swapped
        ["03-08-2025", "P", "PL"],
    ]
    review = []
    marks, review = read_attendance_grid(
        grid, lambda n: master.resolve_person(n, "grid"), book, "test", review=review)

    check("marks land on the right person even after the columns swap",
          book.get("ibrahim", "2025-08-03") == "PL" and book.get("muskan", "2025-08-03") == "P")
    check("a blank cell is not a mark", book.get("muskan", "2025-08-02") is None)
    check("an unreadable mark goes to Needs Review, never dropped silently",
          any("X" == str(r["what"]) for r in review), json.dumps(review[-1:], default=str))
    check("a stray header is reported with its row number",
          any("stray header" in r["reason"] for r in review))
    check("an unknown name becomes provisional and blocks payroll",
          master.people["?Someone New"].status == "NEEDS_SETUP")


def test_wide_and_sku():
    print("\n--- the two input shapes ---")

    wide = [
        ["Date", "Karigar", "Design", "Full Set", "Top", "Dupatta"],
        ["01-04-2025", "Sajid", "V508", 10, None, 4],
        ["02-04-2025", "Sajid", "V509", None, 6, None],
    ]
    entries, review = read_wide(wide, lambda n: n, "wide")
    check("every populated cell in a wide row is one independent entry",
          len(entries) == 3, f"{len(entries)} entries")
    check("a design may skip a column inside its group without shifting the rest",
          {(e.what, e.set_type, e.qty) for e in entries}
          == {("V508", "Full Set", 10.0), ("V508", "Dupatta", 4.0), ("V509", "Top", 6.0)})

    sheet = [
        ["Date", "SKU", "Qty", "Rate", "Value", "Paid"],
        ["01-04-2025", "V508 (Top)", 10, 120, 1200, 1000],
        ["02-04-2025", "V508", 5, 120, 600, None],
    ]
    entries, review = read_sku_sheet(sheet, "sohrab", unit="sohrab")
    check("a SKU sheet parses its suffix and keeps the unit id",
          len(entries) == 2 and entries[0].set_type == "Top" and entries[0].who == "sohrab")
    check("blocks may run in any order — order comes from the dates, not the rows",
          entries[0].date < entries[1].date)


# ===========================================================================
# PART 4 AND 5 — PAY
# ===========================================================================

def _one_person(gender="M", salary=45000, thr_days=28, thr_hours=280, basis=ATTENDANCE):
    m = Master()
    m.add_person("p", "Person", gender)
    m.employment.join("p", "2025-04-01")
    m.pay_basis.set_value("p", "2025-04-01", basis)
    m.salary.set_value("p", "2025-04-01", salary)
    m.threshold_days.set_value("p", "2025-04-01", thr_days)
    m.threshold_hours.set_value("p", "2025-04-01", thr_hours)
    return m


def test_pay_rules():
    print("\n--- the pay rules ---")

    # Full attendance earns exactly the monthly salary: 20 + 2 + 2 + 1 + 1 = 26.
    m = _one_person(salary=26000, thr_days=26)
    book = AttendanceBook()
    day = dt.date(2025, 4, 1)
    plan = ["P"] * 20 + ["H"] * 4 + ["HL"] * 2 + ["OD"] + ["PL"]
    for i, code in enumerate(plan):
        book.mark("p", day + dt.timedelta(days=i), code)
    r = month_pay(m, book, "p", "2025-04")
    check("20P + 4H + 2HL + 1OD + 1PL on a 26-day threshold earns exactly the salary",
          near(r.days_equivalent, 26) and near(r.earning, 26000),
          f"{r.days_equivalent} days -> {r.earning:,.2f}")

    # Paid is not productive: HL and PL carry a day of pay and no hours at all.
    # 17 weekdays + 3 Sundays present, 4 weekday half days, one Sunday on duty:
    # 17x10 + 3x5 + 4x5 + 1x5 = 210 hours against 26 paid days.
    check("a holiday and a paid leave are paid but produce nothing",
          near(r.productive_hours, 210),
          f"{r.productive_hours} productive hours against {r.days_equivalent} paid days")

    swapped = AttendanceBook()
    for i, code in enumerate(plan):
        swapped.mark("p", day + dt.timedelta(days=i), "A" if code in ("HL", "PL") else code)
    r2 = month_pay(m, swapped, "p", "2025-04")
    check("marking those same days absent changes the pay but not the hours",
          near(r2.productive_hours, r.productive_hours) and r2.earning < r.earning,
          f"{r.earning:,.0f} paid vs {r2.earning:,.0f}, both {r.productive_hours} hours")

    # Uncapped in both directions.
    m = _one_person(salary=45000, thr_days=27)
    book = AttendanceBook()
    for i in range(30):
        book.mark("p", dt.date(2025, 4, 1) + dt.timedelta(days=i), "P")
    r = month_pay(m, book, "p", "2025-04")
    check("30 days worked against a 27-day threshold pays for 30",
          near(r.earning, 50000), f"{r.earning:,.2f}")

    # Flat means flat.
    m = _one_person(salary=18000, basis=FLAT)
    r_full = month_pay(m, book, "p", "2025-04")
    empty = AttendanceBook()
    for i in range(30):
        empty.mark("p", dt.date(2025, 4, 1) + dt.timedelta(days=i), "A")
    r_none = month_pay(m, empty, "p", "2025-04")
    check("flat pay does not move with attendance, in either direction",
          near(r_full.earning, 18000) and near(r_none.earning, 18000))

    # One divisor. §3.5 prices the month on days; §3.6.3 derives the reference
    # hourly rate from that daily rate, not from the legacy hours threshold.
    m = _one_person(gender="F", salary=9000, thr_days=28, thr_hours=230)
    r = month_pay(m, AttendanceBook(), "p", "2025-04")
    check("the daily rate is the salary over the threshold DAYS",
          near(r.daily_rate, 9000 / 28, 0.001), f"{r.daily_rate:.4f}")
    check("the hourly rate is that daily rate over the weekday shift, not the "
          "salary over the legacy hours threshold",
          near(r.hourly_rate, (9000 / 28) / 8, 0.001)
          and not near(r.hourly_rate, 9000 / 230, 0.001),
          f"hourly {r.hourly_rate:.4f}; 9000/230 would have been {9000 / 230:.4f}")
    check("the legacy hours threshold is still resolvable, and still drives nothing",
          near(r.threshold_hours, 230.0))


def test_hours_table():
    print("\n--- the shift hours table ---")

    # April 2025: 30 days, 4 Sundays. 26 x 10 + 4 x 5 = 280.
    m = _one_person()
    book = AttendanceBook()
    for i in range(30):
        book.mark("p", dt.date(2025, 4, 1) + dt.timedelta(days=i), "P")
    r = month_pay(m, book, "p", "2025-04")
    check("30 present days for a man is 280 hours", near(r.productive_hours, 280),
          f"{r.productive_hours}")

    # Same month, a woman, one weekday absent: 25 x 8 + 4 x 5.5 = 222.
    m = _one_person(gender="F", salary=9000, thr_hours=230)
    book = AttendanceBook()
    for i in range(30):
        d = dt.date(2025, 4, 1) + dt.timedelta(days=i)
        book.mark("p", d, "A" if d.day == 30 else "P")
    r = month_pay(m, book, "p", "2025-04")
    check("29 present days for a woman is 222 hours", near(r.productive_hours, 222),
          f"{r.productive_hours}")


def test_three_states():
    print("\n--- the three states ---")

    m = _one_person()
    m.employment.leave("p", "2025-09-30")
    book = AttendanceBook()
    book.mark("p", "2025-04-01", "P")

    not_employed = month_pay(m, book, "p", "2025-11")
    no_data = month_pay(m, book, "p", "2025-05")
    absent_book = AttendanceBook()
    for i in range(30):
        absent_book.mark("p", dt.date(2025, 6, 1) + dt.timedelta(days=i), "A")
    absent = month_pay(m, absent_book, "p", "2025-06")

    check("not employed is not an absence",
          not_employed.state == NOT_EMPLOYED and not not_employed.rated)
    check("employed with nothing recorded is No Data, not Below Average",
          no_data.state == NO_DATA and no_data.earning == 0)
    check("employed and marked absent is a real zero, and is scored",
          absent.state == EMPLOYED and absent.earning == 0 and absent.rated)

    ratings = summarise(m, [not_employed, no_data, absent])
    r = ratings["p"]
    check("only the months that count go into the average",
          r["not_employed"] == 1 and r["no_data"] == 1 and r["counted"] == 1)
    check("a genuinely absent month scores Below Average",
          r["bands"][BELOW] == 1)


def test_piece_rate():
    print("\n--- piece-rate staff ---")

    m = Master()
    m.add_person("p", "Person")
    m.employment.join("p", "2025-04-01")
    m.pay_basis.set_value("p", "2025-04-01", PIECE_RATE)
    m.piece_rate.set_value("p", "2025-04-01", {"rate": 100, "unit": "per_hour"})

    r = month_pay(m, AttendanceBook(), "p", "2025-04", units=42)
    check("piece-rate pay needs no salary, threshold or attendance row",
          near(r.earning, 4200) and r.salary == 0 and r.threshold_days == 0,
          f"{r.units} x {r.piece_rate} = {r.earning:,.2f}")

    # The FY2026-27 rate has not been supplied. That must be visible, not zero.
    m.piece_rate.set_value("p", "2026-04-01", None)
    m.piece_rate._rows["p"] = [row for row in m.piece_rate.rows("p") if row.value is not None]
    r = month_pay(m, AttendanceBook(), "p", "2026-06", units=10)
    check("a missing piece rate reports Unresolvable rather than earning zero",
          r.state == UNRESOLVED and r.earning == 0, "; ".join(r.notes))


def uncited_piece_rates(data) -> list[str]:
    """Every piece_rate row in a master file that the master spec does not support.

    A citation must exist, must be a sentence rather than a word, and must contain
    the rate it is citing — so raising 100 to 120 without re-reading the source
    leaves the citation no longer supporting the number, and this returns it.
    """
    cited = {k: v for k, v in (data.get("_rate_sources") or {}).items()
             if not k.startswith("_")}
    problems = []
    for row in data.get("piece_rate", []):
        key = row["key"]
        source = cited.get(key)
        value = row.get("value") or {}
        rate = value.get("rate") if isinstance(value, dict) else value
        if not isinstance(source, str) or len(source.strip()) < 60:
            problems.append(f"{key}: no citation in _rate_sources")
            continue
        shown = f"{rate:g}" if isinstance(rate, (int, float)) else str(rate)
        if shown not in source:
            problems.append(f"{key}: cited, but the citation does not contain {shown}")
    return problems


def test_no_uncited_piece_rate():
    """A rate on a real person's pay may not be a plausible guess. §Part 1.

    One was: this file carried 100 per_hour for a contractor the master spec
    mentions four times and never gives a rate for, the same figure as the other
    piece-rate contractor. It is gone, and this is the check that stops the next
    one — including a negative control, because a gate that has never failed has
    not been shown to work.
    """
    print("\n--- every piece rate is cited, or it is not in the file ---")

    data = json.loads(FIXTURE.read_text(encoding="utf-8"))
    problems = uncited_piece_rates(data)
    check("no piece rate in the fixture is uncited", not problems, "; ".join(problems))

    # THE NEGATIVE CONTROL. Plant the exact mistake that was made.
    planted = json.loads(FIXTURE.read_text(encoding="utf-8"))
    planted["piece_rate"].append({"key": "ikram", "from": "2025-04-01", "to": None,
                                  "value": {"rate": 100, "unit": "per_hour"}})
    check("and planting an uncited rate is caught",
          any(p.startswith("ikram:") for p in uncited_piece_rates(planted)),
          "; ".join(uncited_piece_rates(planted)) or "the gate did not fire")

    # The other half: a cited rate that has since been edited away from its source.
    moved = json.loads(FIXTURE.read_text(encoding="utf-8"))
    moved["piece_rate"][0]["value"]["rate"] = 120
    check("and so is a rate raised without re-reading the source",
          any("does not contain 120" in p for p in uncited_piece_rates(moved)),
          "; ".join(uncited_piece_rates(moved)) or "the gate did not fire")

    # Everyone on Piece-rate with no rate is named and explained, not merely absent.
    stated = {r["key"] for r in data["piece_rate"]}
    piece_people = {r["key"] for r in data["pay_basis"] if r["value"] == PIECE_RATE}
    explained = {k for k in (data.get("_no_rate_stated") or {}) if not k.startswith("_")}
    check("every piece-rate person without a rate is listed with why",
          piece_people - stated == explained,
          f"no rate: {sorted(piece_people - stated)} / explained: {sorted(explained)}")

    # And the engine's own law holds for them against the REAL file, not a mock:
    # a missing rate reports Unresolvable, it does not post zero. (R08.4)
    master = Master.from_json(FIXTURE)
    for key in sorted(piece_people - stated):
        r = month_pay(master, AttendanceBook(), key, "2025-06", units=40)
        check(f"{key} has no rate, so the month is Unresolvable rather than zero pay",
              r.state == UNRESOLVED and r.earning == 0, "; ".join(r.notes))


# ===========================================================================
# PART 11 — THE FIXTURE: known answers
# ===========================================================================

# §3.6.3 — Blended FY Hourly Rate = Blended FY Daily Rate / 10 male, / 8 female.
# The men are unchanged from the old salary/threshold-hours derivation, because
# 28 days x 10 hours is exactly the 280-hour threshold and 27 x 10 is 270. The
# three women move, because 28 x 8 is 224 and their hours threshold was 230:
#   Muskan  9,000/28/8 = 40.1786   was 9,000/230 = 39.1304
#   Bharti  8,500/28/8 = 37.9464   was 8,500/230 = 36.9565
#   Maasi   8,000/28/8 = 35.7143   was 8,000/230 = 34.7826
EXPECTED_BLENDED = {
    "ibrahim": 164.43, "karim": 63.49, "muskan": 40.18, "surender": 82.14,
    "jamil": 160.71, "sarfaraz": 117.86, "krishna": 53.57, "shivam": 53.57,
    "bharti": 37.95, "maasi": 35.71,
}

# §3.6.3's other half — the daily rate the hourly one is derived from.
EXPECTED_BLENDED_DAILY = {
    "ibrahim": 1644.35, "karim": 634.92, "muskan": 321.43, "surender": 821.43,
    "jamil": 1607.14, "sarfaraz": 1178.57, "krishna": 535.71, "shivam": 535.71,
    "bharti": 303.57, "maasi": 285.71,
}


def test_blended_rates():
    print("\n--- the ten blended hourly rates, FY2025-26 ---")

    master = Master.from_json(FIXTURE)
    for staff, want in EXPECTED_BLENDED.items():
        got = blended_hourly(master, staff, "2025-26")
        check(f"blended hourly {staff} = {want}", near(got, want, 0.005), f"got {got:.4f}")

    for staff, want in EXPECTED_BLENDED_DAILY.items():
        got = blended_daily(master, staff, "2025-26")
        check(f"blended daily {staff} = {want}", near(got, want, 0.005), f"got {got:.4f}")

    for staff, want in EXPECTED_BLENDED.items():
        hours = 10.0 if master.person(staff).group == "M" else 8.0
        check(f"{staff}'s hourly rate is the daily rate over the weekday shift",
              near(blended_daily(master, staff, "2025-26") / hours, want, 0.005))

    # Ibrahim joined in August. Averaged over twelve months he would look cheap.
    naive = _naive_blended(master, "ibrahim", "2025-26")
    check("averaging over months a person did not work understates the rate",
          naive < EXPECTED_BLENDED["ibrahim"] - 1,
          f"employed-months {EXPECTED_BLENDED['ibrahim']} vs all-months {naive:.2f}")


def _naive_blended(master, staff, fy):
    """Deliberately wrong: the literal twelve-month average §3.6.3 could be read
    as asking for, scored here so the cost of that reading is on the record."""
    from vastrangam.calendar_util import fy_months
    rates = []
    for m in fy_months(fy):
        try:
            rates.append(float(master.salary.resolve(staff, m))
                         / float(master.threshold_days.resolve(staff, m)) / 10.0)
        except Unresolved:
            rates.append(0.0)
    return sum(rates) / len(rates)


def test_karim_flat_year():
    print("\n--- the flat-pay year ---")

    master = Master.from_json(FIXTURE)
    book = AttendanceBook()          # deliberately empty: flat pay ignores it
    rows = fy_pay(master, book, "karim", "2025-26")
    earned = round(sum(r.earning for r in rows), 2)
    check("flat pay for FY2025-26 is 2 months at 15,000 plus 10 at 18,000 = 2,10,000",
          near(earned, 210000), f"{earned:,.2f}")
    check("the salary step is read from the log, not from a rule about a person",
          near(rows[0].earning, 15000) and near(rows[2].earning, 18000),
          f"Apr {rows[0].earning:,.0f}, Jun {rows[2].earning:,.0f}")

    paid = 275000
    check("paying more than was earned is an advance, not an overpayment",
          round(earned - paid, 2) == -65000, f"outstanding {earned - paid:,.2f}")

    check("a flat-pay month is rated for information only",
          summarise(master, [r for r in rows if r.state == EMPLOYED]) == {}
          or all(m.informational for m in summarise(master, rows)["karim"]["months"]
                 if m.band in (SATISFACTORY, BELOW)))


def test_forward_dated_policy():
    print("\n--- policy that has not happened yet ---")

    master = Master.from_json(FIXTURE)
    check("Karim's April 2026 salary step is already in the log and waiting",
          master.salary.resolve("karim", "2026-03") == 18000
          and master.salary.resolve("karim", "2026-04") == 20000)
    check("the November threshold change applies to the two men it was set for",
          master.threshold_hours.resolve("karim", "2025-11") == 270
          and master.threshold_hours.resolve("surender", "2025-11") == 280)
    check("the new joiners are simply not employed before they joined",
          not master.employed("upender", "2026-03") and master.employed("upender", "2026-04"))


# ===========================================================================
# PART 8 — KARIGAR
# ===========================================================================

def test_karigar_identity():
    print("\n--- karigar identity ---")

    reg = KarigarRegistry()
    reg.add_unit("unit_sajid", "Sajid", "Sajid & Aamir")
    reg.label("unit_sajid", "2025-04-01", "Sajid", ["Sajid"])
    reg.label("unit_sajid", "2026-04-01", "Sajid & Aamir", ["Sajid", "Aamir"])
    reg.add_member("unit_sajid", "Sajid", "2025-04-01")
    reg.add_member("unit_sajid", "Aamir", "2026-04-01")

    check("one unit carries the label it had in that period",
          reg.label_for("unit_sajid", "2025-06") == "Sajid"
          and reg.label_for("unit_sajid", "2026-06") == "Sajid & Aamir")
    check("a unit that became a team is still one unit, so the money follows it",
          reg.alias.lookup("Sajid & Aamir") == reg.alias.lookup("Sajid") == "unit_sajid")
    check("headcount is people, not units",
          reg.headcount("2025-06") == {"unit_sajid": 1}
          and reg.headcount("2026-06") == {"unit_sajid": 2})

    reg.add_unit("unit_mustakim", "Mustakim")
    check("a name that is nearly a match is queued for a decision, not merged",
          reg.resolve("Mostakim") is None and reg.review[-1]["proposed_merges"])
    reg.confirm_merge("Mostakim", "unit_mustakim")
    check("once the merge is confirmed the question is never asked again",
          reg.resolve("Mostakim") == "unit_mustakim")

    reg.add_unit("unit_vendor", "Some Vendor", job_work=True)
    reg.label("unit_vendor", "2025-04-01", "Some Vendor")
    check("a job-work vendor is labelled as one, because its rate bundles more work",
          reg.label_for("unit_vendor", "2025-06").endswith("(Job Work)"))


def test_the_two_set_rules():
    """Book 2 §4.2.2/§4.2.3 and §16A.5 state incompatible rules. Both are
    implemented; this pins what each one does so neither can drift."""
    print("\n--- the two readings of the set-completion rule ---")

    APS = (TOP, BOTTOM, DUPATTA)          # Anarkali Plazo Set — 3 member columns
    KPS = (TOP, BOTTOM)                   # Kurti Plazo Set — 2 member columns

    # V518: 22 Anarkali, 22 Dupatta, no Plazo at all.
    v518 = {TOP: 22, BOTTOM: 0, DUPATTA: 22}
    check("ALL_MEMBERS makes V518 zero — the set needs a bottom and none exists",
          complete_sets(v518, APS, ALL_MEMBERS).complete_sets == 0)
    check("POPULATED makes V518 twenty-two — §4.2.3's named special case",
          complete_sets(v518, APS, POPULATED).complete_sets == 22)

    # GreenKurtiPlazzo: the dupattas are not part of a Kurti Plazo Set at all.
    green = {TOP: 854, BOTTOM: 855, DUPATTA: 194}
    for rule in (ALL_MEMBERS, POPULATED):
        check(f"a component outside the set's members never constrains it ({rule})",
              complete_sets(green, KPS, rule).complete_sets == 854,
              str(complete_sets(green, KPS, rule).complete_sets))
    check("and those 194 dupattas are surplus in full",
          complete_sets(green, KPS).surplus[DUPATTA] == 194)

    check("the rule used is recorded on the result, never left implicit",
          complete_sets(v518, APS, POPULATED).rule == POPULATED)


def test_per_slot_optionality():
    """Whether an empty slot is fatal is a fact about the GARMENT, not one rule
    for the whole business. An Anarkali Plazo Set without its dupatta may be an
    error; a Lehenga Choli Set genuinely ships without one. §Part 2."""
    print("\n--- per-slot optionality: required, optional, and undecided ---")

    APS = (TOP, BOTTOM, DUPATTA)
    v518 = {TOP: 22, BOTTOM: 0, DUPATTA: 22}   # no bottoms at all

    r = complete_sets(v518, APS, POPULATED, {BOTTOM: True})
    check("a slot marked required makes the design zero even under §2.2",
          r.complete_sets == 0 and not r.unresolved, f"{r.complete_sets} sets")

    r = complete_sets(v518, APS, ALL_MEMBERS, {BOTTOM: False})
    check("a slot marked optional drops out even under the all-members reading",
          r.complete_sets == 22 and not r.unresolved, f"{r.complete_sets} sets")

    # UNDECIDED. The number does not move — declaring a question does not answer
    # it — but the other reading is computed and the slot is named.
    r = complete_sets(v518, APS, POPULATED, {BOTTOM: None})
    check("an undecided slot leaves the number exactly where §2.2 had it",
          r.complete_sets == 22, f"{r.complete_sets} sets")
    check("and carries the other reading beside it, with the slot named",
          r.alt_complete_sets == 0 and r.unresolved == (BOTTOM,),
          f"other reading {r.alt_complete_sets}, because of {r.unresolved}")

    # THE NEGATIVE CONTROL, and the thing that keeps the flag worth reading: a
    # design whose empty slots do not change the answer is never flagged.
    full = {TOP: 22, BOTTOM: 22, DUPATTA: 22}
    r = complete_sets(full, APS, POPULATED, {BOTTOM: None, DUPATTA: None})
    check("a design with nothing empty is not flagged, however undecided its type",
          r.complete_sets == 22 and not r.unresolved and r.alt_complete_sets == 0)

    only_dup = {TOP: 0, BOTTOM: 0, DUPATTA: 5}
    r = complete_sets(only_dup, APS, POPULATED, {TOP: None, BOTTOM: None})
    check("two undecided empties are both named, not just the first",
          set(r.unresolved) == {TOP, BOTTOM} and r.alt_complete_sets == 0,
          str(r.unresolved))

    # Slots nobody flagged behave exactly as they did before flags existed.
    for rule in (ALL_MEMBERS, POPULATED):
        check(f"an unflagged slot follows the whole-business rule, unchanged ({rule})",
              complete_sets(v518, APS, rule, {DUPATTA: None}).complete_sets
              == complete_sets(v518, APS, rule).complete_sets)

    # And the fixture the engine actually reads.
    data = json.loads((ROOT / "fixtures" / "set_types.json").read_text())
    comps = data["compositions"]
    missing = [c["set_type"] for c in comps if "required" not in c]
    check("every set type in the fixture answers the question for every slot",
          not missing and all(sorted(c["required"]) == sorted(c["slots"]) for c in comps),
          str(missing))
    values = {v for c in comps for v in c["required"].values()}
    check("and every answer is one of the three the engine understands",
          values <= {True, False, None}, str(values))
    # Not an assertion that null is correct — an assertion that the file says so
    # out loud, so nobody reads these numbers as settled.
    check("a fixture with an undecided slot explains why, in the fixture",
          (None not in values) or ("_why_they_are_all_null" in data
                                   and len(data["_why_they_are_all_null"]) > 200))


def test_acceptance_16a():
    """§16A's own gate: 'a mismatch means a bug, not a new answer'.

    What can be checked without the source files is checked here and is not
    nothing — the thirteen per-set-type rows must add up to the four totals
    printed beside them. What cannot be checked is named, file by file, instead
    of being quietly skipped.
    """
    print("\n--- §16A, the owner's own acceptance targets ---")

    a = json.loads((ROOT / "fixtures" / "acceptance_16a.json").read_text())
    k = a["karigar"]
    rows = k["by_set_type"]

    check("§16A names thirteen set types", len(rows) == 13, str(len(rows)))
    for field, total in (("designs", "designs"), ("sets", "complete_sets"),
                         ("pieces", "pieces"), ("cost", "cost")):
        got = sum(r[field] for r in rows)
        check(f"the per-set-type {field} add up to the stated {k[total]:,}",
              got == k[total], f"{got:,}")

    check("the five no-rate designs are named, not just counted",
          len(k["no_rate_designs"]) == 5 and all(k["no_rate_designs"]),
          ", ".join(k["no_rate_designs"]))
    check("the top design's pieces and sets are consistent with its set type",
          k["top_design"]["pieces"] >= k["top_design"]["sets"],
          f"{k['top_design']['sets']:,} sets / {k['top_design']['pieces']:,} pieces")

    e = a["ecommerce"]
    check("§16A's e-commerce net sale is its own sale minus its own return",
          e["sale"] - e["return"] == e["net_sale"],
          f"{e['sale']:,} - {e['return']:,} = {e['sale'] - e['return']:,}, "
          f"stated {e['net_sale']:,}")
    o = a["offline_sales"]
    check("and the three offline stores add to the offline total",
          sum(s["pieces"] for s in o["by_store"]) == o["pieces"],
          str(sum(s["pieces"] for s in o["by_store"])))

    # The gate itself. It is not skipped for want of an environment variable —
    # it is skipped because two named files have never been supplied.
    import os
    reports = os.environ.get("VAS_KARIGAR_REPORTS")
    rates = os.environ.get("VAS_STITCHING_RATES")
    if not (reports and rates and Path(reports).exists() and Path(rates).exists()):
        print("SKIP the §16A run — it needs BOTH source files, and neither has ever "
              "been supplied:\n"
              "       VAS_KARIGAR_REPORTS  Karigar_Reports_April_2025_to_June_2027.xlsx\n"
              "       VAS_STITCHING_RATES  Stitching_Rates_Master.xlsx\n"
              "     Everything verified so far used a report DERIVED from them, over a "
              "different period — 158 designs to §16A's 143. See PROJECT_REPORT.md §0.2.")
        return

    from vastrangam import xlsx
    from vastrangam.karigar_run import run as run_karigar

    sheets = dict(xlsx.all_sheets(reports))
    sheets.update(xlsx.all_sheets(rates))
    # Both readings, side by side, against the owner's figure. Neither is
    # adjusted to fit — if neither reproduces 25,307 that is the finding.
    for rule in (POPULATED, ALL_MEMBERS):
        got = run_karigar(sheets, rule=rule).totals
        check(f"§16A: {k['complete_sets']:,} complete sets under the {rule} reading",
              got["complete_sets"] == k["complete_sets"],
              f"got {got['complete_sets']:,}")
        check(f"§16A: {k['pieces']:,} pieces under the {rule} reading",
              round(got["pieces"]) == k["pieces"], f"got {got['pieces']:,}")


def test_locked_lists():
    """Short lists this trade fixed by decision, carried as data rather than prose.

    Both lived only in prose — one of them only in a superseded report — so the
    tenant guide could drift from the specification and nothing would notice.
    """
    print("\n--- the closed lists ---")

    f = json.loads((ROOT / "fixtures" / "locked_lists.json").read_text())

    sp = f["service_providers"]
    check("seven service providers, one per service", len(sp["list"]) == 7, str(len(sp["list"])))
    services = [r["service"] for r in sp["list"]]
    check("no service is sent to two different first choices",
          len(set(services)) == len(services), str(services))
    check("every entry names both the service and who does it",
          all(r.get("service") and r.get("vendor") for r in sp["list"]))

    src = f["crm_lead_sources"]
    check("five lead sources, in the order the source states them",
          src["list"] == ["IndiaMART", "Website", "WhatsApp", "Walk-in", "Forum"],
          str(src["list"]))

    # A closed list a tenant could never extend would contradict every other page
    # of the tenant guide, so the file has to say which way it means "locked".
    check("the file says what locked does and does not mean",
          len(f.get("_what_locked_means", "")) > 120)
    for key in ("service_providers", "crm_lead_sources", "no_rate_designs"):
        check(f"{key} says whether it is locked, and cites where it came from",
              isinstance(f[key].get("_locked"), bool) and len(f[key].get("_source", "")) > 40)

    # The one that is NOT locked says why, so 'locked: false' is a decision.
    check("the unlocked list explains why it is not a decision",
          len(f["no_rate_designs"].get("_why_not_locked", "")) > 80)

    # And it agrees with §16A, which named the same five.
    a = json.loads((ROOT / "fixtures" / "acceptance_16a.json").read_text())
    check("the five no-rate designs match §16A's, name for name",
          f["no_rate_designs"]["list"] == a["karigar"]["no_rate_designs"],
          str(f["no_rate_designs"]["list"]))


def test_v101_worked_example():
    """Book 2 §4.3's worked example — a known answer that must never move."""
    print("\n--- the V101 worked example (§4.3) ---")

    counts = {TOP: 5027, BOTTOM: 5027, DUPATTA: 4972}
    r = complete_sets(counts, (TOP, BOTTOM, DUPATTA))
    check("V101 pooled 5027 / 5027 / 4972 makes 4,972 sets",
          r.complete_sets == 4972, str(r.complete_sets))
    check("with extras of 55 Anarkali, 55 Plazo and 0 Dupatta",
          r.surplus[TOP] == 55 and r.surplus[BOTTOM] == 55 and r.surplus[DUPATTA] == 0,
          str(r.surplus))
    # Earnings are per piece actually stitched, not per completed set (§16A.5).
    cost = 5027 * 30 + 5027 * 12 + 4972 * 8
    check("and a stitching cost of 5027x30 + 5027x12 + 4972x8 = 2,50,910",
          cost == 250910, f"{cost:,}")


def test_garment_columns_fixture():
    """The 23 columns and 13 set types of §4.1, carried as data."""
    print("\n--- the 23 garment columns (§4.1) ---")

    data = json.loads((ROOT / "fixtures" / "garment_columns.json").read_text())
    cols = data["columns"]
    sets = data["set_types"]
    # The source says "23 garment columns" twice and enumerates 22 (C to X,
    # indices 2-23). The set-type map uses all 22 and references no 23rd. The
    # fixture holds what exists; this pins the count so a real 23rd column
    # appearing later is a visible change rather than a silent one.
    check("the 22 garment columns the source actually enumerates are present",
          len(cols) == 22, str(len(cols)))
    check("their indices run 2 to 23 with none missing",
          [c["index"] for c in cols] == list(range(2, 24)))
    check("all 13 set types are present", len(sets) == 13, str(len(sets)))

    dupattas = [c["name"] for c in cols if "dupatta" in c["name"].lower()]
    check("there are four distinct dupatta columns, not one",
          len(dupattas) == 4, str(dupattas))

    names = {c["name"] for c in cols}
    orphans = [m for st in sets for m in st["members"] if m not in names]
    check("every set type's members are real columns", not orphans, str(orphans))

    kps = next(s for s in sets if s["set_type"] == "Kurti Plazo Set")
    check("Kurti Plazo Set has two members and no dupatta among them",
          len(kps["members"]) == 2 and not any("Dupatta" in m for m in kps["members"]),
          str(kps["members"]))


def test_component_labels():
    print("\n--- reading component and set-type labels ---")

    for label, want in [
        ("Full Set", (TOP, BOTTOM, DUPATTA)),
        ("Top/Body only", (TOP,)),
        ("Bottom only", (BOTTOM,)),
        ("Dupatta only", (DUPATTA,)),
        ("Top/Body + Dupatta", (TOP, DUPATTA)),
    ]:
        check(f"component {label!r} fills {want}", parse_component_type(label) == want,
              str(parse_component_type(label)))

    # The trap: the label contains the word Dupatta and means the opposite.
    check("'Top & Bottom (no Dupatta)' does not conjure a dupatta",
          parse_component_type("Top & Bottom (no Dupatta)") == (TOP, BOTTOM),
          str(parse_component_type("Top & Bottom (no Dupatta)")))

    check("a set type's name is read for the garments it lists",
          parse_component_type("Lehenga Choli Set", False) == (TOP, BOTTOM)
          and parse_component_type("Dupatta Set", False) == (DUPATTA,))
    check("a set type naming no garment yields nothing rather than guessing all three",
          parse_component_type("Alter Set", False) == ()
          and parse_component_type("Uniform Set", False) == ())


def test_set_completion():
    print("\n--- the set-completion bottleneck ---")

    counts = pool([("Anarkali", 60), ("Plazo", 43), ("Dupatta", 23)])
    check("garments pool into Top, Bottom and Dupatta",
          counts == {TOP: 60, BOTTOM: 43, DUPATTA: 23}, str(counts))

    # §2.2 — "Total Complete Sets = the smallest POPULATED slot". An empty slot
    # drops out of the minimum instead of zeroing pieces that were made and paid.
    three = complete_sets({TOP: 22, BOTTOM: 0, DUPATTA: 22}, (TOP, BOTTOM, DUPATTA))
    check("§2.2 — 22 tops and 22 dupattas with no bottoms are 22 complete sets",
          three.complete_sets == 22, str(three.complete_sets))
    check("nothing is left over, because both populated slots were consumed",
          three.surplus[TOP] == 0 and three.surplus[DUPATTA] == 0, str(three.surplus))
    check("the default rule is the populated reading",
          DEFAULT_SET_RULE == POPULATED and three.rule == POPULATED)

    older = complete_sets({TOP: 22, BOTTOM: 0, DUPATTA: 22},
                          (TOP, BOTTOM, DUPATTA), ALL_MEMBERS)
    check("the older all-slots reading is still available, and still says zero",
          older.complete_sets == 0 and older.surplus[TOP] == 22, str(older.complete_sets))

    two = complete_sets({TOP: 854, BOTTOM: 855, DUPATTA: 194}, (TOP, BOTTOM))
    check("a two-piece set ships 854 sets, not the 194 the dupattas would allow",
          two.complete_sets == 854, str(two.complete_sets))
    check("the dupattas outside the set's composition are surplus in full",
          two.surplus[DUPATTA] == 194 and two.surplus[BOTTOM] == 1)

    check("with no composition given, the populated slots are used and said so",
          complete_sets({TOP: 5, DUPATTA: 3}).complete_sets == 3)

    r = complete_sets(counts)
    check("60 Anarkali, 43 Plazo and 23 Dupatta make 23 complete sets",
          r.complete_sets == 23, str(r.complete_sets))
    check("the surpluses are 37 Anarkali and 20 Plazo, and they are not merged",
          r.surplus[TOP] == 37 and r.surplus[BOTTOM] == 20 and r.surplus[DUPATTA] == 0,
          str(r.surplus))
    check("20 bodies are waiting on a dupatta, and that is its own line",
          r.pending_dupatta == 20)

    sets = pool([("Full Set", 10), ("Top & Bottom", 5), ("Dupatta", 2)])
    check("a full set adds one to all three slots",
          sets == {TOP: 15, BOTTOM: 15, DUPATTA: 12}, str(sets))
    check("with 12 dupattas against 15 bodies, 12 sets ship",
          complete_sets(sets).complete_sets == 12)


def test_karigar_money():
    print("\n--- karigar money ---")

    rate = weighted_rate([(100, 120.0), (50, 150.0)])
    check("the rate is what was actually paid, weighted by quantity",
          near(rate, (100 * 120 + 50 * 150) / 150, 0.0001), f"{rate:.4f}")
    check("with nothing paid yet, the master rate stands",
          weighted_rate([], 130.0) == 130.0)

    check("a design ties out exactly through a visible variance line",
          variance_line(18000.0, 17994.5) == 5.5)

    ledger = roll_up([("a", 1000), ("a", 500), ("b", 200)], [("a", 2000)])
    check("earnings and payments roll up to the unit, whatever it was called",
          ledger["a"].earned == 1500 and ledger["a"].outstanding == -500)
    check("a negative outstanding is an advance", ledger["a"].is_advance)
    check("a unit with no payment still shows its outstanding",
          ledger["b"].outstanding == 200)

    conflict = master_rate_conflict([
        {"from": "2025-04-01", "rate": 120}, {"from": "2026-04-01", "rate": 135}])
    check("when two periods disagree on a rate the later one applies and both are flagged",
          conflict["applied"]["rate"] == 135 and len(conflict["superseded"]) == 1)


# ===========================================================================
# PART 6 AND 10 — ALLOCATION AND GATES
# ===========================================================================

def test_allocation():
    print("\n--- cost allocation ---")

    master = Master.from_json(FIXTURE)
    work = [
        WorkRow("D1", "ibrahim", 100), WorkRow("D1", "muskan", 50),
        WorkRow("D2", "ibrahim", 40),
    ]
    payroll = 500000.0
    result = allocate(master, "2025-26", work, {"D1": 200, "D2": 100}, payroll)

    d1 = result["designs"]["D1"]
    want = 100 * EXPECTED_BLENDED["ibrahim"] + 50 * EXPECTED_BLENDED["muskan"]
    check("a design costs its hours times the blended rate",
          near(d1.cost, want, 1.0), f"{d1.cost:,.2f} vs {want:,.2f}")
    check("cost per piece divides by the quantity made",
          near(d1.cost_per_piece, d1.cost / 200, 0.01))
    check("unallocated labour is its own line and is never folded into a design",
          near(result["unallocated_labour"], payroll - result["allocated_cost"], 0.01),
          f"{result['unallocated_labour']:,.2f} of {payroll:,.2f}")

    table = cost_per_piece_table(result)
    check("the cost table holds one row per design and no totals row",
          len(table) == 2 and not any(str(r["design"]).upper().startswith("TOTAL")
                                      for r in table))
    # The mistake that once doubled this report exactly: summing a TOTAL row in
    # with the detail rows it totals.
    with_total = table + [{"design": "TOTAL (all designs)",
                           "cost": sum(r["cost"] for r in table)}]
    check("summing a totals row together with its detail rows doubles the cost",
          near(sum(r["cost"] for r in with_total), 2 * result["allocated_cost"], 1.0))


def test_gates():
    print("\n--- the validation gates ---")

    master = Master.from_json(FIXTURE)
    months = list(Month.of("2025-04").__class__(2025, m) for m in range(4, 13))

    g = logs_resolve_once(master, months)
    check("gate: every log resolves exactly one row per employed staff-month",
          g.passed, g.detail or f"{len(g.offenders)} offenders")

    # The one exception, and both halves of it. A piece-rate person the source
    # names without ever stating a rate is reported on every run and does not
    # fail the build; the same person NOT listed as such does fail it.
    check("gate: a rate the source never states is reported, not buried",
          g.known and all(o["log"] == "piece_rate" for o in g.known)
          and "never states one" in g.detail,
          g.detail)

    unlisted = Master.from_json(FIXTURE)
    unlisted.no_rate_stated = {}
    g2 = logs_resolve_once(unlisted, months)
    check("gate: the same missing rate, unexplained, fails the build",
          not g2.passed and any(o["log"] == "piece_rate" for o in g2.offenders),
          g2.detail)

    broken = Master.from_json(FIXTURE)
    broken.salary._rows["surender"] = []
    g = logs_resolve_once(broken, months)
    check("gate: a deleted salary row fails the build instead of paying zero",
          not g.passed and any(o["staff"] == "surender" for o in g.offenders))

    check("gate: design components must tie to the recorded total",
          components_tie_to_design({"D1": {"a": 60.0, "b": 40.0}}, {"D1": 100.0}).passed
          and not components_tie_to_design({"D1": {"a": 60.0}}, {"D1": 100.0}).passed)

    check("gate: karigar earnings must equal the parsed source rows",
          earnings_tie_to_source(roll_up([("a", 100), ("b", 50)], []), [100, 50]).passed)

    check("gate: combined columns must equal the sum of each period",
          combined_equals_periods({"a": 300.0}, {"a": {"fy1": 100.0, "fy2": 200.0}}).passed
          and not combined_equals_periods({"a": 300.0}, {"a": {"fy1": 100.0}}).passed)

    check("gate: design cost plus unallocated must equal the payroll exactly",
          allocation_ties_to_payroll(
              {"allocated_cost": 400.0, "unallocated_labour": 100.0,
               "payroll_total": 500.0}).passed)

    check("gate: no source row may vanish",
          nothing_dropped(100, 95, 5).passed and not nothing_dropped(100, 95, 2).passed)

    check("gate: no formula may carry an error token",
          no_formula_errors(["=A1+B1"]).passed
          and not no_formula_errors(["=#REF!+B1"]).passed)

    # The gate that keeps the whole thing data-independent.
    names = [p["name"] for p in json.loads(FIXTURE.read_text())["people"]]
    g = no_person_names_in_logic([ROOT / "vastrangam"], names)
    check("gate: no logic anywhere references a person by name", g.passed,
          g.detail or json.dumps(g.offenders[:3]))


def test_run_log(tmp):
    print("\n--- the run log ---")

    log = RunLog(tmp)
    figures = {"payroll": 975649.0, "designs": 160}
    gates = [allocation_ties_to_payroll(
        {"allocated_cost": 400.0, "unallocated_labour": 100.0, "payroll_total": 500.0})]

    first = log.record(sources=[FIXTURE], gates=gates, figures=figures, note="first")
    check("the first run records every figure", first["figures"]["payroll"] == 975649.0)

    same = log.record(sources=[FIXTURE], gates=gates, figures=figures, note="unchanged")
    check("running again with the same inputs moves nothing",
          not same["moved"] and not same["regression"])

    moved = log.record(sources=[FIXTURE], gates=gates,
                       figures={"payroll": 975700.0, "designs": 160}, note="drift")
    check("a figure that moves while the inputs are identical is a regression",
          moved["regression"] and moved["moved"][0]["figure"] == "payroll",
          f"{moved['moved'][0]['was']} -> {moved['moved'][0]['now']}")

    changed = tmp / "source.txt"
    changed.write_text("v1")
    log.record(sources=[FIXTURE, changed], gates=gates, figures=figures, note="baseline")
    changed.write_text("v2")
    after = log.record(sources=[FIXTURE, changed], gates=gates,
                       figures={"payroll": 980000.0, "designs": 160}, note="owner fixed data")
    check("a figure that moves because a source changed is expected and visible",
          after["inputs_changed"] and after["moved"] and not after["regression"])


# ===========================================================================

# ===========================================================================
# THE UNIVERSAL MASTER PROMPT — §1.2 inference, §4.1 comparison, §7.1 structure
# ===========================================================================

def test_two_pricings():
    print("\n--- the two pricings, side by side ---")

    # A 30-day April, all present. Days-equivalent 30 against a 28-day
    # threshold; hours 280 against a 280-hour threshold. The day threshold sits
    # below the length of the month, the hour threshold does not — which is the
    # whole of the difference.
    m = _one_person(salary=45000, thr_days=28, thr_hours=280)
    book = AttendanceBook()
    for i in range(30):
        book.mark("p", dt.date(2025, 4, 1) + dt.timedelta(days=i), "P")
    r = month_pay(m, book, "p", "2025-04")
    check("the paid figure is days-scaled", near(r.earning, 45000 * 30 / 28, 0.01),
          f"{r.earning:,.2f}")
    check("§3.5 leaves no hours-scaled second pricing on the row",
          not hasattr(r, "earning_hours_scaled"))
    check("the hourly rate is the daily rate over the weekday shift, not "
          "the salary over a threshold",
          near(r.hourly_rate, (45000 / 28) / 10, 0.0001), f"{r.hourly_rate:.4f}")

    flat = _one_person(salary=18000, basis=FLAT)
    rf = month_pay(flat, book, "p", "2025-04")
    check("flat pay is the full salary whatever the attendance",
          near(rf.earning, 18000))

    check("a multi-year payroll is refused rather than blended",
          raises(MultiYearRefused, total_payroll, m, book, "2025-26 to 2026-27"))


def test_daily_wage_basis():
    print("\n--- the daily-wage basis (§1.2, §4.2) ---")

    m = Master()
    m.add_person("p", "Person")
    m.employment.join("p", "2025-04-01")
    m.pay_basis.set_value("p", "2025-04-01", DAILY_WAGE)
    m.daily_wage.set_value("p", "2025-04-01", 450)
    book = AttendanceBook()
    for i in range(20):
        book.mark("p", dt.date(2025, 4, 1) + dt.timedelta(days=i), "P")
    r = month_pay(m, book, "p", "2025-04")
    check("a stated daily wage needs no salary and no threshold",
          near(r.earning, 9000) and r.salary == 0, f"20 x 450 = {r.earning:,.2f}")
    check("a stated daily wage still yields an hourly rate for the Work Report",
          near(r.hourly_rate, 45.0), f"{r.hourly_rate:.4f}")


def test_basis_inference():
    print("\n--- §1.2 pay-basis inference ---")

    cases = [
        ("salary and threshold filled", 45000, 280, None, ATTENDANCE),
        ("daily wage, no salary", None, None, 450, DAILY_WAGE),
        ("salary only", 18000, None, None, FLAT),
        ("nothing filled", None, None, None, PIECE_RATE),
    ]
    for label, salary, hours, wage, want in cases:
        got, why = infer_pay_basis(salary, hours, wage)
        check(f"{label} infers {want}", got == want, f"got {got} — {why}")

    got, why = infer_pay_basis(None, 280, None)
    check("the one combination §1.2 cannot price is refused, not paid zero",
          got is None and "§4.3" in why, why[:90])


def test_template_reader():
    print("\n--- reading the master workbook (§1.1) ---")

    import tempfile
    sys.path.insert(0, str(ROOT / "tests"))
    from make_template import build

    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "demo.xlsx"
        build(path, demo=True)
        got = template.load(path)

        check("all three tabs are found by name",
              all(got.sheets_found.get(k) for k in
                  ("staff_master", "hours_reference", "karigar_master")),
              str(got.sheets_found))

        bases = {}
        for ident in got.master.people:
            try:
                bases[got.master.person(ident).name] = got.master.pay_basis.resolve(
                    ident, "2025-09")
            except Unresolved:
                bases[got.master.person(ident).name] = None
        check("every §1.2 branch resolves from the filled columns",
              [bases.get(n) for n in ("Aarav", "Divya", "Eshan")]
              == [ATTENDANCE, DAILY_WAGE, PIECE_RATE], str(bases))
        check("an explicit Pay Basis column overrides the inference",
              bases.get("Chetan") == FLAT)
        check("the unpriceable combination gets no basis and is flagged",
              bases.get("Farhan") is None
              and any("Farhan" == r.what for r in got.master.review))
        check("Inactive is recorded without dropping the person",
              got.master.people["S007"].roster == "Inactive")

        check("Hours Reference drives the shift table, in the company's own words",
              got.master.shift_hours[("Male", "Weekday")] == 10.0
              and got.master.shift_hours[("Female", "Sunday")] == 5.5,
              str(got.master.shift_hours))
        check("'Sunday / Weekly Off' is understood as the rest day",
              got.master.shift("S001", "2025-04-06") == 5.0
              and got.master.shift("S001", "2025-04-07") == 10.0)
        check("a title row is not mistaken for a header",
              len(got.master.shift_hours) == 4, str(got.master.shift_hours))

        check("an optional log replaces the single current value with history",
              [r.value for r in got.master.salary.rows("S003")] == [15000.0, 18000.0],
              str([r.span for r in got.master.salary.rows("S003")]))
        check("hours and days thresholds are separate logs and move together",
              [r.value for r in got.master.threshold_hours.rows("S001")] == [280.0, 270.0]
              and [r.value for r in got.master.threshold_days.rows("S001")] == [28.0, 27.0])

        check("the karigar master gives identity and a reference rate only",
              got.karigar.units["K001"].reference_rate == 120.0)

        # The part that matters most about this file.
        check("personal and banking details never reach the master data",
              not any(k in json.dumps(got.master.to_json())
                      for k in ("aadhaar", "Aadhaar", "ifsc", "IFSC", "account_no")))
        check("and the object holding them refuses to be written out",
              raises(PermissionError, got.contacts.to_json))


def test_template_round_trip():
    print("\n--- the same data through a completely different path ---")

    import tempfile
    sys.path.insert(0, str(ROOT / "tests"))
    from fixture_to_template import build as to_workbook

    original = Master.from_json(FIXTURE)
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "round_trip.xlsx"
        to_workbook(path, FIXTURE)
        got = template.load(path).master

    check("every person survives the trip through Excel",
          sorted(p.name for p in got.people.values())
          == sorted(p.name for p in original.people.values()))

    logs = ("pay_basis", "salary", "daily_wage", "threshold_days", "threshold_hours")
    mismatched = []
    for ident in original.people:
        for m in fy_months("2025-26"):
            for log in logs:
                a = getattr(original, log).maybe(ident, m)
                b = getattr(got, log).maybe(ident, m)
                if a != b:
                    mismatched.append(f"{ident} {m} {log}: {a} != {b}")
    check("every log resolves to the same value in every month of the year",
          not mismatched, "; ".join(mismatched[:3]))

    rates = {i: (round(blended_hourly(original, i, "2025-26"), 4),
                 round(blended_hourly(got, i, "2025-26"), 4))
             for i in original.people}
    check("the blended rates come out identical",
          all(a == b for a, b in rates.values()),
          str({k: v for k, v in rates.items() if v[0] != v[1]}))

    check("a rest day written as 'Sunday / Weekly Off' still pays Sunday hours",
          got.shift("muskan", "2025-04-06") == original.shift("muskan", "2025-04-06"))


def test_component_structure():
    print("\n--- §7.1 components classified by structure ---")

    # Names the engine has never seen. Only the rate card's own shape says
    # which slot each one fills.
    card = {
        "Full Set": ["Choga", "Ghagra", "Dupatta"],
        "Top & Bottom": ["Choga", "Ghagra"],
        "Dupatta": ["Dupatta"],
    }
    review = []
    slots = classify_components(card, review)
    check("a component paired with Dupatta is body, and order says which half",
          slots == {"Choga": TOP, "Ghagra": BOTTOM, "Dupatta": DUPATTA}, str(slots))
    check("no fallback was needed, so nothing was flagged", not review, str(review))

    counts = pool([("Choga", 60), ("Ghagra", 43), ("Dupatta", 23)], slots)
    check("unknown garment names still pool correctly through the rate card",
          complete_sets(counts).complete_sets == 23)

    stray = []
    classify_components({"Odd": ["Anarkali"]}, stray)
    check("when structure cannot settle a component the name table fires — and says so",
          any("fell back" in r["reason"] for r in stray), str(stray))

    lost = []
    classify_components({"Odd": ["Zzz Thing"]}, lost)
    check("a component neither structure nor the name table can place is reported",
          any("needs a slot" in r["reason"] for r in lost), str(lost))


def test_new_gates():
    print("\n--- the §11 gates ---")

    master = Master.from_json(FIXTURE)
    book = AttendanceBook()
    rows = [month_pay(master, book, "karim", m) for m in
            [Month.of("2025-04"), Month.of("2025-09")]]
    check("gate: a flat month equals the salary in force",
          flat_staff_are_flat(rows).passed)
    broken = rows[0]
    broken.earning = broken.salary * 0.5
    check("gate: a flat month scaled by attendance fails",
          not flat_staff_are_flat(rows).passed)

    check("gate: every category has an Hours Reference row",
          hours_reference_covers_everyone(master).passed)
    missing = Master.from_json(FIXTURE)
    missing.shift_hours = {("M", "Weekday"): 10.0, ("M", "Sunday"): 5.0}
    g = hours_reference_covers_everyone(missing)
    check("gate: a missing category fails instead of costing zero hours",
          not g.passed and g.offenders, g.detail)

    piece = [month_pay(master, book, "joginder", Month.of("2025-06"))]
    check("gate: piece-rate months carry no salary or threshold",
          piece_rate_never_uses_salary(master, piece).passed)

    check("gate: reconciliation equals the monthly rows",
          reconciliation_matches_summary({"karim": sum(r.earning for r in rows)},
                                         rows).passed)


# ===========================================================================
# THE CORPUS — real files, known answers. Skipped when the file is not here.
# ===========================================================================

KARIGAR_EXPECTED = {
    "earned": (3427498.25, 0.01),
    "paid": (2912868.00, 0.01),
    "outstanding": (514630.25, 0.01),
    "pieces": (54436.5, 0.01),
    "complete_sets": (31024, 0),      # §2.2, the smallest POPULATED slot
    "designs": (158, 0),
    "rows": (1695, 0),
}

# The eleven designs where §2.2 and the delivered file part company. Every one
# of them is a design the file recorded as ZERO sets while pieces were made and
# paid for — the empty slot zeroed the design under the older reading. Nothing
# moves in the other direction: no design loses sets under §2.2.
SETS_RESCUED_BY_RULE_2_2 = {
    "ANB Ville": 120, "V518": 22, "V502": 12, "V530": 12, "V528": 12,
    "V513": 12, "V537": 12, "V282": 6, "V293": 2, "Black Anarkali": 2,
    "V152": 1,
}


def test_stray_header_on_the_real_file():
    """Set VAS_CORPUS_OLD to the uncorrected staff workbook.

    That file carries a wrong header on row 1 — four names that belong to
    people who were not employed that year, sitting above twelve correct block
    headers. A parser that trusts row 1 attributes four people's whole year to
    four other people. The structural rule rejects it, so the corrected file and
    the uncorrected one must produce exactly the same marks.
    """
    import os
    from vastrangam import xlsx
    from vastrangam.parsing import find_headers

    old, new = os.environ.get("VAS_CORPUS_OLD"), os.environ.get("VAS_CORPUS")
    print("\n--- the stray header, on the real file ---")
    if not (old and new and Path(old).exists() and Path(new).exists()):
        print("SKIP — set VAS_CORPUS_OLD and VAS_CORPUS to the two staff workbooks")
        return

    books = {}
    for label, path in (("old", old), ("new", new)):
        master = Master.from_json(FIXTURE)
        book = AttendanceBook()
        rows = xlsx.sheet_rows(path, "Attendence")
        read_attendance_grid(rows, lambda n: master.resolve_person(n, "a"), book, "a",
                             not_people=master.non_person_columns)
        books[label] = book
        found = find_headers(rows)
        if label == "old":
            check("the wrong header on row 1 of the uncorrected file is caught",
                  0 in found.stray, f"real={found.real[:3]} stray={found.stray}")

    same = {k: books["old"].marks_in_month(k, "2025-11")
            for k in sorted(books["old"].keys())}
    other = {k: books["new"].marks_in_month(k, "2025-11")
             for k in sorted(books["new"].keys())}
    check("correcting the header changes nothing, because the stray was never read",
          same == other and books["old"].count() == books["new"].count(),
          f"{books['old'].count()} vs {books['new'].count()} marks")

    for ghost in ("upender", "priyanka", "rupsa", "selima"):
        check(f"{ghost} gets none of somebody else's attendance",
              not books["old"].months(ghost), str(books["old"].months(ghost)))


def test_karigar_corpus():
    """Point VAS_KARIGAR at the karigar workbook and these must reproduce.

    Every figure is recomputed from the 1,695 transaction rows. None is read
    off a totals row — that is the whole point.
    """
    import os
    from vastrangam import xlsx
    from vastrangam.karigar_run import run as run_karigar

    path = os.environ.get("VAS_KARIGAR")
    print("\n--- the karigar corpus (real file) ---")
    if not path or not Path(path).exists():
        print("SKIP the karigar figures — set VAS_KARIGAR to the karigar workbook to "
              "check 34,27,498 earned / 29,12,868 paid / 5,14,630 outstanding / "
              "54,436 pieces")
        return

    sheets = xlsx.all_sheets(path)
    result = run_karigar(sheets)
    check("the run uses §2.2's populated reading unless told otherwise",
          result.totals["set_rule"] == POPULATED)
    for key, (want, tol) in KARIGAR_EXPECTED.items():
        got = result.totals[key]
        check(f"karigar {key} = {want:,}", abs(got - want) <= tol, f"got {got:,}")

    check("earnings split by period tie to the source's own per-year columns",
          result.totals["by_period"] == result.totals["source_earned_by_period"],
          f"{result.totals['by_period']} vs {result.totals['source_earned_by_period']}")

    # Every design's bottleneck, against the count the file recorded.
    recorded, matched = {}, 0
    for name, rows in sheets.items():
        if "combined production" not in normalise(name):
            continue
        for r in rows[2:]:
            design = str(r[1]).strip() if len(r) > 1 and r[1] else ""
            if not design or design.startswith("▸") or len(r) < 4:
                continue
            try:
                recorded[design] = int(float(r[3]))
            except (TypeError, ValueError):
                continue
    for design, want in recorded.items():
        got = result.designs.get(design)
        if got is not None and got.complete_sets == want:
            matched += 1
    check(f"§2.2 agrees with the file on the other designs "
          f"({len(recorded) - len(SETS_RESCUED_BY_RULE_2_2)} of {len(recorded)})",
          matched == len(recorded) - len(SETS_RESCUED_BY_RULE_2_2) and recorded,
          f"{matched} of {len(recorded)}")

    # Where they differ, they differ for one reason and in one direction.
    moved = {d: result.designs[d].complete_sets for d, w in recorded.items()
             if d in result.designs and result.designs[d].complete_sets != w}
    check("exactly the eleven designs the file zeroed are the ones that move",
          moved == SETS_RESCUED_BY_RULE_2_2,
          str({k: v for k, v in moved.items() if SETS_RESCUED_BY_RULE_2_2.get(k) != v}))
    check("every one of them was recorded as zero in the file, and none loses sets",
          all(recorded[d] == 0 for d in moved) and all(v > 0 for v in moved.values()))
    check("the movement is +213 sets, 30,811 to 31,024",
          sum(moved.values()) - sum(recorded[d] for d in moved) == 213
          and result.totals["complete_sets"] - sum(recorded.values()) == 213)

    # The older reading is still exact against the delivered report — that is
    # what makes it worth keeping, and what proves the parse is not the problem.
    older = run_karigar(sheets, rule=ALL_MEMBERS)
    check("the older all-slots reading still reproduces the file exactly, "
          "all 158 designs",
          all(older.designs[d].complete_sets == w for d, w in recorded.items()
              if d in older.designs)
          and older.totals["complete_sets"] == 30811,
          f"{older.totals['complete_sets']:,}")

    check("no production row fails to multiply out",
          rows_price_themselves(result.entries).passed)
    check("no design reports more sets than its scarcest required piece",
          bottleneck_uses_the_set_composition(result.designs).passed)


CORPUS_EXPECTED = {
    # §4 asks for "Total Staff Payroll Earning (all pay bases)". The published
    # 9,75,649 is the days-based half only: it leaves out Joginder, whose 518
    # iron hours at Rs 100 were being charged to designs by the allocation while
    # his wage was missing from the payroll — so unallocated labour was 51,800
    # smaller than it really is, and the staff account looked 33,374 overpaid
    # when it is in fact 18,426 owed.
    "payroll_total": (1027449, 1.0),
    "payroll_days_based": (975649, 1.0),
    "payroll_piece_rate": (51800, 0.01),
    "paid_total": (1009023, 0.01),
    "logged_hours": (10388, 0.01),
    "designs": (159, 0),                 # 159 real designs; the 160th row is TOTAL
}


def test_corpus():
    """Point VAS_CORPUS at the staff workbook and these must reproduce.

        VAS_CORPUS=/path/Staff_Report_FY_202526.xlsx python3 engine/tests/selftest.py
    """
    import os
    import subprocess
    import tempfile

    path = os.environ.get("VAS_CORPUS")
    print("\n--- the corpus (real files) ---")
    if not path or not Path(path).exists():
        print("SKIP the corpus figures — set VAS_CORPUS to the staff workbook to check "
              "9,75,649 payroll / 10,09,023 paid / 10,388 hours / 159 designs")
        return

    with tempfile.TemporaryDirectory() as tmp:
        run = subprocess.run(
            [sys.executable, str(ROOT / "run.py"), "--fy", "2025-26",
             "--attendance", path, "--work", path, "--payments", path,
             "--out", tmp],
            capture_output=True, text=True)
        check("the engine runs the real workbook with every gate passing",
              run.returncode == 0, run.stdout.strip().splitlines()[-1] if run.stdout else run.stderr[:200])
        figures = json.loads((Path(tmp) / "figures.json").read_text())

    for key, (want, tol) in CORPUS_EXPECTED.items():
        got = figures.get(key)
        check(f"corpus {key} = {want:,}", got is not None and abs(got - want) <= tol,
              f"got {got:,.2f}" if isinstance(got, (int, float)) else str(got))

    for staff, want in EXPECTED_BLENDED.items():
        got = figures["blended_hourly"].get(staff)
        check(f"corpus blended hourly {staff}", near(got, want, 0.005), f"got {got}")


def test_workbook_build():
    """The deliverable itself — §2.4, §3.6, §4, §6.

    Built from the fixture, then recalculated by LibreOffice and checked cell by
    cell. A total written as a formula is worth insisting on precisely because
    it can be checked this way; a total written as a number could only be
    trusted.
    """
    import tempfile
    from vastrangam import workbook as wbmod
    from vastrangam.allocation import WorkRow, allocate

    print("\n--- the deliverable workbook ---")
    master = Master.from_json(FIXTURE)
    book = AttendanceBook()
    # A month of real marks for one person, so the COUNTIFS have something to
    # count and the Monthly Summary has a row that is not all zeroes.
    for i in range(30):
        d = dt.date(2025, 4, 1) + dt.timedelta(days=i)
        book.mark("muskan", d, "P" if d.weekday() != 6 else "HL")
    payroll = total_payroll(master, book, "2025-26", fy_units={"joginder": 100.0})
    work_rows = [WorkRow("Design A", "muskan", 12.0, "Packing"),
                 WorkRow("Design A", "joginder", 100.0, "Iron"),
                 WorkRow("Design B", "muskan", 8.0, "Thread Cutting")]
    quantities = {"Design A": 50, "Design B": 20}
    allocation = allocate(master, "2025-26", work_rows, quantities, payroll["total"])

    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "FY2025-26.xlsx"
        built = wbmod.build(path, wbmod.Inputs(
            fy="2025-26", master=master, book=book, payroll=payroll,
            allocation=allocation, work_rows=work_rows, quantities=quantities,
            payments={"muskan": 5000.0}, karigar=None, review=[]))

        check("every sheet the two pipelines call for is present",
              built.sheets == wbmod.SHEET_ORDER,
              f"{len(built.sheets)} sheets")
        check("the Overview sits immediately after the two Read Me sheets, per §4",
              built.sheets[:3] == [wbmod.READ_ME_KARIGAR, wbmod.READ_ME_STAFF,
                                   wbmod.OVERVIEW])
        check("a missing karigar side skips its sheets and says so rather than "
              "fabricating them",
              wbmod.K_EARNINGS in built.skipped and wbmod.ST_MONTHLY not in built.skipped,
              f"{len(built.skipped)} skipped")

        import openpyxl
        wb = openpyxl.load_workbook(path)
        totals = 0
        for ws in wb:
            for row in ws.iter_rows():
                for c in row:
                    if isinstance(c.value, str) and c.value.startswith("="):
                        totals += 1
        check("the workbook is formulas, not typed-in numbers", totals > 300,
              f"{totals:,} formula cells")
        check("gridlines are off on every sheet, per §6",
              all(not ws.sheet_view.showGridLines for ws in wb))
        check("every sheet with a header row is frozen below it, per §6",
              all(wb[n].freeze_panes for n in
                  (wbmod.ST_MONTHLY, wbmod.ST_ATTENDANCE, wbmod.OVERVIEW)))

        import recalc
        try:
            result = recalc.check(path, built.expect)
        except recalc.RecalcUnavailable as exc:
            print(f"SKIP the recalculation — {str(exc).splitlines()[0]}")
            return
        check("§6 — zero formula errors across every sheet",
              not result["errors"],
              "; ".join(f"{e['sheet']}!{e['cell']} {e['value']}"
                        for e in result["errors"][:4]))
        check("no formula recalculates to nothing unless it was written to",
              not result["empty"],
              "; ".join(f"{e['sheet']}!{e['cell']}" for e in result["empty"][:4]))
        check("every figure the engine computed, Excel arrives at independently",
              not result["disagreements"],
              "; ".join(f"{d['where']} engine {d['want']} workbook {d['got']}"
                        for d in result["disagreements"][:4]))
        check("and it checked a real number of them", len(built.expect) >= 3,
              f"{len(built.expect)} checked cells")


def main():
    import tempfile

    print("Vastrangam engine — self-tests")
    print("=" * 70)

    test_logs()
    test_spells()
    test_names()
    test_dates()
    test_parsing()
    test_attendance_grid()
    test_wide_and_sku()
    test_pay_rules()
    test_hours_table()
    test_three_states()
    test_piece_rate()
    test_no_uncited_piece_rate()
    test_blended_rates()
    test_karim_flat_year()
    test_forward_dated_policy()
    test_karigar_identity()
    test_component_labels()
    test_the_two_set_rules()
    test_per_slot_optionality()
    test_acceptance_16a()
    test_locked_lists()
    test_v101_worked_example()
    test_garment_columns_fixture()
    test_set_completion()
    test_karigar_money()
    test_allocation()
    test_gates()
    test_two_pricings()
    test_daily_wage_basis()
    test_basis_inference()
    test_template_reader()
    test_template_round_trip()
    test_component_structure()
    test_new_gates()
    test_workbook_build()
    with tempfile.TemporaryDirectory() as tmp:
        test_run_log(Path(tmp))
    test_corpus()
    test_stray_header_on_the_real_file()
    test_karigar_corpus()

    print("=" * 70)
    print(f"{len(PASS)} passed, {len(FAIL)} failed")
    for name in FAIL:
        print(f"  FAIL {name}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
