"""Self-tests — Part 11.

Fixed inputs with known answers. These must reproduce on every run, forever.

Run it:  python3 engine/tests/selftest.py

One line per check, `ok` or `FAIL` with the reason. No framework needed, because
this has to run on the owner's machine the day something looks wrong.
"""

from __future__ import annotations

import datetime as dt
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIX = ROOT / "fixtures"
sys.path.insert(0, str(ROOT))

from vastrangam import (ATTENDANCE, DAILY_WAGE, FLAT, HOURLY, PIECE_RATE,
                        AttendanceBook,
                        Master, Month, RunLog, allocate, blended_daily,
                        blended_hourly,
                        complete_sets, cost_per_piece_table, fy_pay, month_pay,
                        normalise, pool, roll_up, summarise, template,
                        total_payroll, weighted_rate)
from vastrangam.allocation import WorkRow
from vastrangam.attendance import UnknownCode
from vastrangam.calendar_util import DateError, fy_months, fy_of, parse_date
from vastrangam.gates import religion_only_decides_holidays
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
from vastrangam import pay
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

    # A full month earns exactly the monthly salary — measured in HOURS, which is the
    # divisor the owner stated. 20 + 2 + 2 + 1 + 1 = 26 paid days, and those same days
    # are 240 paid hours once each one is priced at its own shift: three of the twenty
    # present days and the on-duty day fall on Sundays, which are shorter.
    m = _one_person(salary=26000, thr_days=26, thr_hours=240)
    book = AttendanceBook()
    day = dt.date(2025, 4, 1)
    plan = ["P"] * 20 + ["H"] * 4 + ["HL"] * 2 + ["OD"] + ["PL"]
    for i, code in enumerate(plan):
        book.mark("p", day + dt.timedelta(days=i), code)
    r = month_pay(m, book, "p", "2025-04")
    check("20P + 4H + 2HL + 1OD + 1PL is 26 paid days and 240 paid hours",
          near(r.days_equivalent, 26) and near(r.paid_hours, 240),
          f"{r.days_equivalent} days, {r.paid_hours} paid hours")
    check("and a full month against a 240-hour threshold earns exactly the salary",
          near(r.earning, 26000), f"{r.earning:,.2f}")

    # Paid is not productive: HL and PL carry a day of pay and no hours at all.
    # 17 weekdays + 3 Sundays present, 4 weekday half days, one Sunday on duty:
    # 17x10 + 3x5 + 4x5 + 1x5 = 210 hours against 26 paid days.
    check("a holiday and a paid leave are paid but produce nothing",
          near(r.productive_hours, 210),
          f"{r.productive_hours} productive hours against {r.days_equivalent} paid days")

    # THE TWO HOUR FIGURES, AND THE 30 HOURS BETWEEN THEM.
    # The owner's ruling was "salaried yes, hourly no": a salaried person is paid for a
    # holiday, and the productive figure that costs designs still shows nothing was made.
    # Two holidays and one paid leave at a 10-hour shift is exactly the 30-hour gap.
    check("paid hours exceed productive hours by exactly the holiday and paid-leave time",
          near(r.paid_hours - r.productive_hours, 30),
          f"{r.paid_hours} paid vs {r.productive_hours} productive")
    check("and the month is paid on the paid hours, not the productive ones",
          near(r.earning, r.paid_hours * r.hourly_rate, 0.01)
          and not near(r.earning, r.productive_hours * r.hourly_rate, 0.01),
          f"{r.earning:,.2f}; productive would have paid "
          f"{r.productive_hours * r.hourly_rate:,.2f}")

    swapped = AttendanceBook()
    for i, code in enumerate(plan):
        swapped.mark("p", day + dt.timedelta(days=i), "A" if code in ("HL", "PL") else code)
    r2 = month_pay(m, swapped, "p", "2025-04")
    check("marking those same days absent changes the pay but not the hours",
          near(r2.productive_hours, r.productive_hours) and r2.earning < r.earning,
          f"{r.earning:,.0f} paid vs {r2.earning:,.0f}, both {r.productive_hours} hours")

    # Uncapped in both directions. 30 days from 1 Apr is 26 weekdays and 4 Sundays,
    # so 26x10 + 4x5 = 280 paid hours against a 250-hour threshold.
    m = _one_person(salary=45000, thr_days=27, thr_hours=250)
    book = AttendanceBook()
    for i in range(30):
        book.mark("p", dt.date(2025, 4, 1) + dt.timedelta(days=i), "P")
    r = month_pay(m, book, "p", "2025-04")
    check("280 hours worked against a 250-hour threshold pays for 280",
          near(r.paid_hours, 280) and near(r.earning, 45000 * 280 / 250, 0.01),
          f"{r.paid_hours} hours -> {r.earning:,.2f}")

    # Flat means flat.
    m = _one_person(salary=18000, basis=FLAT)
    r_full = month_pay(m, book, "p", "2025-04")
    empty = AttendanceBook()
    for i in range(30):
        empty.mark("p", dt.date(2025, 4, 1) + dt.timedelta(days=i), "A")
    r_none = month_pay(m, empty, "p", "2025-04")
    check("flat pay does not move with attendance, in either direction",
          near(r_full.earning, 18000) and near(r_none.earning, 18000))

    # THE DIVISOR IS THE THRESHOLD HOURS. This block asserted the opposite in so many
    # words — "the hourly rate is that daily rate over the weekday shift, not the salary
    # over the legacy hours threshold", and "the legacy hours threshold still drives
    # nothing". It passed because it checked the engine against the same arithmetic the
    # engine used. The owner's instruction is the other one, and the difference is a
    # rupee an hour for every woman on the roster.
    m = _one_person(gender="F", salary=9000, thr_days=28, thr_hours=230)
    r = month_pay(m, AttendanceBook(), "p", "2025-04")
    check("the rate per hour is the salary over the threshold HOURS",
          near(r.hourly_rate, 9000 / 230, 0.001), f"{r.hourly_rate:.4f}")
    check("and it is NOT the daily rate over the weekday shift, which is a different number",
          not near(r.hourly_rate, (9000 / 28) / 8, 0.001),
          f"{r.hourly_rate:.4f} vs the old {(9000 / 28) / 8:.4f}")
    check("the old figure is still computed, so the two can be compared side by side",
          near(r.hourly_rate_days_based, (9000 / 28) / 8, 0.001),
          f"{r.hourly_rate_days_based:.4f}")
    check("the daily rate is still the salary over the threshold DAYS, for daily-wage staff",
          near(r.daily_rate, 9000 / 28, 0.001), f"{r.daily_rate:.4f}")


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
    """The two output bases, which are NOT the same basis with a different unit.

    Hourly is a rate the person holds: hours times their figure. Piece-rate is a rate
    the OPERATION holds on each GARMENT, shared by everyone doing that work — so a
    piece-rate month cannot be priced from one number of "units" at all. Ironing a
    hundred dupattas and a hundred anarkalis are different money.
    """
    print("\n--- the two output bases ---")

    # ── hourly: the rate is the person's ────────────────────────────────────
    m = Master()
    m.add_person("p", "Person")
    m.employment.join("p", "2025-04-01")
    m.pay_basis.set_value("p", "2025-04-01", HOURLY)
    m.hourly_rate.set_value("p", "2025-04-01", {"rate": 100, "unit": "per_hour"})

    r = month_pay(m, AttendanceBook(), "p", "2025-04", units=42)
    check("hourly pay needs no salary, threshold or attendance row",
          near(r.earning, 4200) and r.salary == 0 and r.threshold_days == 0,
          f"{r.units} x {r.piece_rate} = {r.earning:,.2f}")

    # The FY2026-27 rate has not been supplied. That must be visible, not zero.
    m.hourly_rate.set_value("p", "2026-04-01", None)
    m.hourly_rate._rows["p"] = [row for row in m.hourly_rate.rows("p") if row.value is not None]
    r = month_pay(m, AttendanceBook(), "p", "2026-06", units=10)
    check("a missing hourly rate reports Unresolvable rather than earning zero",
          r.state == UNRESOLVED and r.earning == 0, "; ".join(r.notes))

    # ── piece rate: the rate is the operation's, per garment ────────────────
    q = Master()
    q.add_person("q", "Other", roles=("Pressing",))
    q.employment.join("q", "2025-04-01")
    q.pay_basis.set_value("q", "2025-04-01", PIECE_RATE)
    q.piece_rate.set_value("Pressing|Gown", "2025-04-01", 7.5)
    q.piece_rate.set_value("Pressing|Scarf", "2025-04-01", 2.0)

    r = month_pay(q, AttendanceBook(), "q", "2025-04", units={"Gown": 100, "Scarf": 100})
    check("a piece-rate month is priced garment by garment, never at one blended rate",
          near(r.earning, 950) and r.units == 200 and r.salary == 0,
          f"{r.units} pieces = {r.earning:,.2f}")

    r = month_pay(q, AttendanceBook(), "q", "2025-04", units=200)
    check("one total with no garment breakdown is refused, not multiplied by a guess",
          r.state == UNRESOLVED and r.earning == 0, "; ".join(r.notes))

    r = month_pay(q, AttendanceBook(), "q", "2025-04", units={"Gown": 10, "Cape": 10})
    check("a garment the rate card does not price is named, not paid as zero",
          r.state == UNRESOLVED and r.earning == 0 and "Cape" in " ".join(r.notes),
          "; ".join(r.notes))

    q.people["q"].roles = ()
    r = month_pay(q, AttendanceBook(), "q", "2025-04", units={"Gown": 10})
    check("and a piece-rate person doing no priced operation stops the month",
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
    # A piece-rate row is keyed by OPERATION and GARMENT; an hourly row by person and operation.
    # It used to be keyed by person alone, which could not express "Iron · Anarkali 7.5" at all —
    # the rate had to be attached to whoever happened to be doing the work that year.
    def keyed(r):
        # A row keyed by OPERATION and GARMENT ("Iron|Anarkali"), or an hourly row keyed by
        # person and operation ("joginder|Iron"). A bare `key` is accepted too, because the
        # negative control below plants exactly that shape and must keep working.
        if "operation" in r and "garment" in r: return f"{r['operation']}|{r['garment']}"
        if "operation" in r: return f"{r['key']}|{r['operation']}"
        return r["key"]
    rows = [{**r, "key": keyed(r)}
            for r in list(data.get("piece_rate", [])) + list(data.get("hourly_rate", []))]
    for row in rows:
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
    # The victim has to be somebody with NO citation. This planted on "ikram" until
    # the owner stated his FY2025-26 rate and it acquired one — at which point the
    # plant stopped planting anything and the test passed for the wrong reason. So
    # the victim is now CHOSEN as a person the citations do not cover, which cannot
    # go stale the same way.
    planted = json.loads(FIXTURE.read_text(encoding="utf-8"))
    cited = set(planted["_rate_sources"]) | set(planted["_no_rate_stated"])
    victim = next(p["id"] for p in planted["people"] if p["id"] not in cited)
    planted["piece_rate"].append({"key": victim, "from": "2025-04-01", "to": None,
                                  "value": {"rate": 100, "unit": "per_hour"}})
    check(f"and planting an uncited rate is caught ({victim})",
          any(p.startswith(f"{victim}:") for p in uncited_piece_rates(planted)),
          "; ".join(uncited_piece_rates(planted)) or "the gate did not fire")

    # The other half: a cited rate that has since been edited away from its source.
    moved = json.loads(FIXTURE.read_text(encoding="utf-8"))
    # The value is a plain number now that a rate belongs to an operation rather than carrying a
    # unit per person; the hourly log is where {"rate", "unit"} still lives.
    moved["piece_rate"][0]["value"] = 120
    check("and so is a rate raised without re-reading the source",
          any("does not contain 120" in p for p in uncited_piece_rates(moved)),
          "; ".join(uncited_piece_rates(moved)) or "the gate did not fire")

    # Everyone on Piece-rate with no rate is named and explained, not merely absent.
    # A piece rate is no longer attached to a person, so "does this person have a rate" is now
    # "is there a rate for the operation they do". Someone on Piece-rate whose operation has no
    # rate is the real defect; someone on Piece-rate at all is not.
    # THE FIELD IS `roles`, A LIST. This read p.get("role"), which is not a key any person
    # carries, so it was None for all 22 and matched an operation for none of them —
    # every piece-rate person looked rateless and the comparison below only agreed
    # because the explained list happened to hold the same names.
    stated = ({r["key"] for r in data.get("hourly_rate", [])}
              | {p["id"] for p in data["people"]
                 if any(r["operation"] in (p.get("roles") or [])
                        for r in data.get("piece_rate", []))})
    piece_people = {r["key"] for r in data["pay_basis"] if r["value"] == PIECE_RATE}
    # BOTH kinds of explained absence. A rate nobody ever stated and a rate that
    # ended with no successor are different facts in different fields, and the same
    # answer to this question: is the absence accounted for in writing?
    explained = {k for k in (data.get("_no_rate_stated") or {}) if not k.startswith("_")}
    ended = {k for k in (data.get("_rate_ends_and_no_successor_stated") or {})
             if not k.startswith("_")}
    check("every piece-rate person without a rate is listed with why",
          piece_people - stated == explained,
          f"no rate: {sorted(piece_people - stated)} / explained: {sorted(explained)}")
    check("and a rate that ended with no successor is explained in its own field",
          ended and all(len(data["_rate_ends_and_no_successor_stated"][k]) > 40 for k in ended),
          str(sorted(ended)))

    # And the engine's own law holds for them against the REAL file, not a mock:
    # a missing rate reports Unresolvable, it does not post zero. (R08.4)
    #
    # THE MONTH IS DERIVED FROM THE PERSON'S OWN SPELL, never typed. A hard-coded
    # month passed for as long as everyone happened to be employed in it, and
    # broke the day somebody joined later — reporting "Not employed", which is
    # also correct and is not what this check is asking about. The question is
    # what happens in a month they DID work, so the month has to come from them.
    master = Master.from_json(FIXTURE)
    for key in sorted(piece_people - stated):
        spells = master.employment.spells(key)
        assert spells, f"{key} is on the pay_basis log with no employment spell"
        joined = spells[0].joined
        worked = f"{joined.year + (joined.month == 12):04d}-{(joined.month % 12) + 1:02d}"
        r = month_pay(master, AttendanceBook(), key, worked, units=40)
        check(f"{key} has no rate, so a month they worked ({worked}) is "
              f"Unresolvable rather than zero pay",
              r.state == UNRESOLVED and r.earning == 0,
              "; ".join(r.notes) or f"state {r.state}")


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
# HIS OWN RATE CARD. Three of these were wrong — muskan 40.18, bharti 37.95, maasi
# 35.71 — and wrong because the engine divided the daily rate by the weekday shift
# instead of dividing the salary by the threshold hours. The two agree for a
# 280/28/10 man and part company for everybody else, so the men in this table never
# noticed and the women were each paid a rate about a rupee an hour out.
EXPECTED_BLENDED = {
    "ibrahim": 164.43, "karim": 63.49, "muskan": 39.13, "surender": 82.14,
    "jamil": 160.71, "sarfaraz": 117.86, "krishna": 53.57, "shivam": 53.57,
    "bharti": 36.96, "maasi": 34.78,
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

    # THE RULE, REPLACED. This asserted "X's hourly rate is the daily rate over the
    # weekday shift" — the arithmetic that was wrong. It passed for ten years' worth of
    # runs because it tested the code against itself: the same wrong formula on both
    # sides. The rule is the owner's, and the right side of it is now his own card.
    for staff, want in EXPECTED_BLENDED.items():
        month = next(m for m in fy_months("2025-26") if master.employed(staff, m))
        check(f"{staff}'s rate per hour is salary over threshold hours",
              near(pay.hourly_rate(master, staff, month),
                   float(master.salary.resolve(staff, month))
                   / float(master.threshold_hours.resolve(staff, month)), 1e-9))

    # And the two formulas really do differ — for the women, and only for them. A check
    # that both give `want` would pass whichever one the engine used.
    parted = {i for i in EXPECTED_BLENDED
              if not near(blended_daily(master, i, "2025-26")
                          / (10.0 if master.person(i).group == "M" else 8.0),
                          EXPECTED_BLENDED[i], 0.005)}
    check("the old days-based reading disagrees with his card for exactly the women",
          parted == {i for i in EXPECTED_BLENDED
                     if not master.person(i).gender.upper().startswith("M")},
          f"parted: {sorted(parted)}")

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

    # THE CASH DOES NOT MOVE, SO SOMETHING ELSE HAS TO SHOW THE HOURS.
    # The owner: "Karim and Upender have a fixed monthly salary figure for cash planning
    # … Still TRACK earned = hours x (salary / threshold) so under-hours is visible."
    # A flat month with an empty attendance book earns the full salary and no hours at
    # all — which is exactly the case where one number tells you nothing and two tell
    # you everything.
    apr = rows[0]
    check("a flat month pays the salary in full whatever the hours",
          near(apr.earning, 15000) and near(apr.paid_hours, 0), f"{apr.earning:,.2f}")
    check("and the hours entitlement is tracked separately, not folded into the pay",
          near(apr.earned_at_rate, 0) and near(apr.variance, 15000),
          f"earned_at_rate {apr.earned_at_rate:,.2f} · variance {apr.variance:,.2f}")

    # A FULL MONTH CLOSES THE VARIANCE. Otherwise the column would just be the salary
    # every month and would prove nothing about hours at all.
    full = AttendanceBook()
    for i in range(30):
        full.mark("karim", dt.date(2025, 4, 1) + dt.timedelta(days=i), "P")
    worked = month_pay(master, full, "karim", "2025-04")
    check("a fully worked flat month still pays the same salary",
          near(worked.earning, 15000), f"{worked.earning:,.2f}")
    check("but its variance is far smaller, because the hours nearly cover it",
          abs(worked.variance) < abs(apr.variance) / 2
          and near(worked.earned_at_rate, worked.paid_hours * worked.hourly_rate, 0.01),
          f"{worked.paid_hours} hours -> earned {worked.earned_at_rate:,.2f}, "
          f"variance {worked.variance:,.2f}")
    check("and an attendance month's variance is zero by construction — cash IS the hours",
          near(month_pay(master, full, "esadul", "2025-04").variance, 0),
          f"{month_pay(master, full, 'esadul', '2025-04').variance:,.2f}")


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


def test_karigar_units_fixture():
    """The teams, as data, with membership dated because teams change.

    A unit is the thing that earns and is paid; a person is a member of one.
    The source says a group is never split, so the unit is the ledger key.
    """
    print("\n--- the karigar units ---")

    f = json.loads((ROOT / "fixtures" / "karigar_units.json").read_text())
    units = f["units"]
    active = [u for u in units if u["to"] is None]
    closed = [u for u in units if u["to"] is not None]

    check("five units are active", len(active) == f["active_units"], str(len(active)))

    def size(u):
        """A member list may carry a count like '+3' for people not named."""
        n = 0
        for m in u["members"]:
            n += int(m[1:]) if m.startswith("+") else 1
        return n

    total = sum(size(u) for u in active)
    check(f"and they hold {f['active_members']} people between them",
          total == f["active_members"], str(total))

    # THE ONE THAT MATTERS: a team that merged or split is a DATE, not a mistake.
    joint = next(u for u in units if u["id"] == "rabiyul_ekabat_joint")
    check("the FY2025-26 joint unit is closed, not deleted",
          joint["to"] == "2026-03-31" and joint["from"] == "2025-04-01",
          f"{joint['from']} to {joint['to']}")
    parts = [u for u in active if u["id"] in ("rabiyul_team", "ekabot_team")]
    check("and the two units that replaced it start the day after it ends",
          len(parts) == 2 and all(u["from"] == "2026-04-01" for u in parts),
          str([u["from"] for u in parts]))
    check("so no month is covered by both the joint unit and its parts",
          all(u["from"] > joint["to"] for u in parts))

    # Ekabot / Ekabat resolve to one unit rather than to a winner.
    ek = next(u for u in units if u["id"] == "ekabot_team")
    low = [a.lower() for a in ek["aliases"]]
    check("Ekabot and Ekabat are the same unit, through the alias list",
          "ekabot" in low and "ekabat" in low, str(ek["aliases"]))

    check("every unit says what basis it is paid on", all(u.get("pay_basis") for u in units))
    check("every unit carries a from-date", all(u.get("from") for u in units))
    check("no rate is stored here — money comes from the rates master",
          not any("rate" in k for u in units for k in u if k != "pay_basis"))
    check("every closed unit says why it closed or when, in words",
          all(any(k.startswith("_") for k in u) for u in closed))


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
    # THE WINDOW IS DERIVED, NOT TYPED — every month anybody is employed in.
    #
    # It was 2025-04..2025-12, and the assertions below quietly stopped testing anything
    # the moment the only rateless piece-rate person in that window acquired a rate. So it
    # became "the months where the missing-rate case exists", which was right until the
    # owner supplied the rate card — Iron and Dhaga Cutting, every garment priced — and
    # closed the case. Deriving the window from a case that no longer exists would shrink
    # the gate to nothing again, in the opposite direction.
    months = [m for m in (Month(y, mo) for y in (2025, 2026, 2027) for mo in range(1, 13))
              if any(master.employed(k, m) for k in master.people)]
    check("the window contains at least one employed month",
          bool(months), "nobody in the roster is employed in any month")

    g = logs_resolve_once(master, months)
    check("gate: every log resolves exactly one row per employed staff-month",
          g.passed, g.detail or f"{len(g.offenders)} offenders")

    # THE EXCEPTION, AND BOTH HALVES OF IT — ON A PLANTED ABSENCE, NOT A REAL ONE.
    #
    # A piece-rate person whose work the rate card does not price is reported on every run
    # and does not fail the build; the same person NOT listed as explained does fail it.
    # There is no longer a real example, because the owner stated every rate — so the
    # absence is planted by taking a piece-rate person's operation away. A control with no
    # subject passes over an empty set, which is the same as not running.
    who = next(s for s in sorted(master.people)
               if any(r.value == "Piece-rate" for r in master.pay_basis.rows(s)))
    holed = Master.from_json(FIXTURE)
    holed.people[who].roles = ()
    # ADDED TO the real explanations, not swapped for them. Replacing the dict removed the
    # one person whose absence the file really does account for, so the plant passed and
    # 17 genuine months failed alongside it — a control that fires for the wrong reason.
    holed.no_rate_stated = dict(holed.no_rate_stated,
                                **{who: "planted: this person's operation was removed"})
    g1 = logs_resolve_once(holed, months)
    # THE PLANTED PERSON'S OWN ROWS, not every explained absence in the file.
    # This asserted that EVERY known row was a piece_rate one, which held until five
    # people were recorded as gone with no leaving date stated — an explained absence of
    # a different kind, correctly reported on the same list. The control was reading the
    # whole list to prove something about one person.
    mine = [o for o in g1.known if o["staff"] == who]
    check("gate: a rate the source never states is reported, not buried",
          mine and all(o["log"] == "piece_rate" for o in mine)
          and "never states one" in g1.detail, g1.detail)
    check("and reporting it does NOT fail the build", g1.passed, g1.detail)

    unlisted = Master.from_json(FIXTURE)
    unlisted.people[who].roles = ()
    # OUT OF BOTH FIELDS. rate_absence_explained() merges them, so leaving the person in
    # the second one left them explained and the control never fired.
    unlisted.no_rate_stated = {k: v for k, v in unlisted.no_rate_stated.items() if k != who}
    unlisted.rate_ended_no_successor = {
        k: v for k, v in unlisted.rate_ended_no_successor.items() if k != who}
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

    # A 30-day April, all present. Days-equivalent 30 against a 28-day threshold;
    # hours 280 against a 280-hour threshold. The day threshold sits below the length of
    # the month, the hour threshold does not — which is the whole of the difference, and
    # the reason the two readings pay different money for the same month.
    m = _one_person(salary=45000, thr_days=28, thr_hours=280)
    book = AttendanceBook()
    for i in range(30):
        book.mark("p", dt.date(2025, 4, 1) + dt.timedelta(days=i), "P")
    r = month_pay(m, book, "p", "2025-04")
    check("the paid figure is HOURS-scaled — 280 worked against a 280-hour threshold",
          near(r.paid_hours, 280) and near(r.earning, 45000, 0.01), f"{r.earning:,.2f}")
    check("and the days reading would have paid more for the same month",
          near(45000 * 30 / 28, 48214.29, 0.01)
          and r.earning < 45000 * 30 / 28,
          f"hours {r.earning:,.2f} vs days {45000 * 30 / 28:,.2f}")
    check("§3.5 leaves no hours-scaled second pricing on the row",
          not hasattr(r, "earning_hours_scaled"))
    check("the rate per hour is the salary over the threshold hours",
          near(r.hourly_rate, 45000 / 280, 0.0001), f"{r.hourly_rate:.4f}")

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



def test_weekly_off():
    """2 Sundays a month, for two named people, from a date.

    The owner: "2 Sunday every month as week off, ONLY FOR KARIM AND IBRAHIM FROM
    NOV 2025 TILL PRESENT." This was given and went nowhere — it appeared in no
    fixture and no document, and nothing noticed, because nothing was asking.
    """
    print("\n--- the weekly off ---")
    master = Master.from_json(FIX / "master.json")

    check("Karim has 2 Sundays off from Nov 2025",
          master.sundays_off("karim", "2025-11") == 2, str(master.sundays_off("karim", "2025-11")))
    check("Ibrahim has 2 Sundays off from Nov 2025",
          master.sundays_off("ibrahim", "2025-11") == 2)

    # The date matters as much as the people. October is before it.
    check("neither had it in October 2025",
          master.sundays_off("karim", "2025-10") == 0
          and master.sundays_off("ibrahim", "2025-10") == 0)

    # AND NOBODY ELSE HAS IT. An arrangement given to two people that quietly
    # became a company rule is the failure this test exists for.
    others = [i for i in master.people if i not in ("karim", "ibrahim")]
    spread = [i for i in others if master.sundays_off(i, "2026-01") != 0]
    check("nobody else acquired it", not spread, str(spread))

    # It applies while they are employed, and stops because employment stops —
    # not because a second date repeats that fact somewhere it could disagree.
    check("Ibrahim is not employed after Aug 2026", not master.employed("ibrahim", "2026-09"))


def test_weekly_off_agrees_with_threshold():
    """The two facts agree, and neither is computed from the other.

    Karim and Ibrahim moved from a 280-hour month to 270 on the same date they got
    two Sundays off, and 280 - 2 x 5.0 (the male Sunday shift) is exactly 270. That
    is worth CHECKING and must never become a derivation: the threshold is a number
    the owner states. A system that recomputed it would silently restate a closed,
    already-paid month the next time somebody edited the shift table.
    """
    print("\n--- the weekly off agrees with the threshold, and does not compute it ---")
    master = Master.from_json(FIX / "master.json")
    sunday = master.shift_hours[("M", "Sunday")]

    for who in ("karim", "ibrahim"):
        before = float(master.threshold_hours.resolve(who, "2025-10"))
        after = float(master.threshold_hours.resolve(who, "2025-11"))
        off = master.sundays_off(who, "2025-11")
        check(f"{who}: {before:.0f} - {off:.0f} x {sunday} = {after:.0f}, as stated",
              before - off * sunday == after, f"{before} {off} {sunday} {after}")

    # The proof that it is NOT derived: change the shift table and the stated
    # threshold does not move. A derivation would have followed it.
    master.shift_hours[("M", "Sunday")] = 4.0
    check("editing the shift table does not restate a stated threshold",
          float(master.threshold_hours.resolve("karim", "2025-11")) == 270.0)


def test_trial_has_no_employment_record():
    """The claim three documents make, finally with something behind it.

    "Staff Trial: can be anyone who worked for few days or weeks and left and we
    paid" and "staff trail no joining no leaving". So: no spell, no salary, no
    threshold, no basis. The payment is the entire record.

    This test exists because the documents said all of that while the fixture had
    no trial in it and nothing checked. A claim with no test behind it is the thing
    this repository calls fabrication, and it was one.
    """
    print("\n--- the trial ---")
    master = Master.from_json(FIX / "master.json")
    book = AttendanceBook()
    trial = "trial_2026_08_a"

    check("the trial person exists", trial in master.people)
    check("and has NO employment spell — that absence is the point",
          not master.employment.spells(trial), str(master.employment.spells(trial)))
    check("and no salary, no threshold and no pay basis",
          master.salary.maybe(trial, "2026-08") is None
          and master.threshold_days.maybe(trial, "2026-08") is None
          and master.pay_basis.maybe(trial, "2026-08") is None)

    r = month_pay(master, book, trial, "2026-08")
    check("the month resolves rather than failing", r.state == pay.TRIAL, r.state)
    check("and pays exactly what was recorded, derived from nothing",
          r.earning == float(master.trial_pay.resolve(trial, "2026-08")), str(r.earning))
    check("nothing complains that a salary is missing",
          not any("salary" in n.lower() for n in r.notes), str(r.notes))
    check("a trial is not counted as employed", not r.employed)
    check("and never enters a performance average", not r.rated)

    # A month nobody paid them for is a month they were not there.
    check("a month with no trial payment is Not employed, not a zero-rupee month",
          month_pay(master, book, trial, "2026-06").state == pay.NOT_EMPLOYED)


def test_trial_without_a_payment_raises():
    """THE NEGATIVE CONTROL — the case that looks identical and is a hole.

    Attendance recorded for somebody with no employment spell and no payment. It
    reads exactly like a trial. Paying zero would post cleanly, reconcile, and be
    discovered by the person who was not paid — so it must be refused instead.
    """
    print("\n--- a trial nobody recorded a payment for ---")
    master = Master.from_json(FIX / "master.json")
    master.add_person("trial_unpaid", "Trial (unpaid)")

    book = AttendanceBook()
    for day in (1, 2, 3):
        book.mark("trial_unpaid", f"2026-08-0{day}", "P")

    r = month_pay(master, book, "trial_unpaid", "2026-08")
    check("it is refused rather than paid", r.state == pay.UNRESOLVED, r.state)
    check("it does NOT pay zero", r.earning == 0.0 and r.state != pay.TRIAL)
    check("and the message says what to record",
          any("the payment is the only record" in n for n in r.notes), str(r.notes))


def test_leave_is_not_absence_and_not_leaving():
    """The owner: "kajal on leave for a month".

    Three states that a lesser system collapses into one: employed and working,
    employed and on leave, and gone. A month on leave is not a month somebody
    worked badly, and it is not a month they had left.
    """
    print("\n--- leave ---")
    master = Master.from_json(FIX / "master.json")

    check("she is on leave in that month", master.on_leave("kajal", "2026-09"))
    check("and still employed through it — leave never closes a spell",
          master.employed("kajal", "2026-09"))
    check("she is not on leave the month before", not master.on_leave("kajal", "2026-08"))
    check("and not the month after", not master.on_leave("kajal", "2026-10"))

    # Leave belongs to whoever was given it, like every other policy here.
    on_leave = [i for i in master.people if master.on_leave(i, "2026-09")]
    check("nobody else is on leave that month", on_leave == ["kajal"], str(on_leave))

    # A blank month inside a spell is a tracking gap and reports as one. It must
    # not silently become a bad month for somebody who was on approved leave.
    r = month_pay(master, AttendanceBook(), "kajal", "2026-09")
    check("a month on leave never enters a performance average", not r.rated, r.state)



# ===========================================================================
# THE ROSTER, READ BACK
#
# The owner sent the whole staff list — role, religion, salary with its dates,
# threshold hours, shift clock, pay basis and the advances outstanding — and then
# asked the only question that matters about it:
#
#     "tell me where u have mentioned all staff reports of religion, gender,
#      salary, threshold hours and all other details"
#
# He was right to ask. Religion was two prose keys and no data; the piece rates
# were two wrong entries. The file has it now, and a file having it is not the
# same as the engine reading it, so the table below is HIS message transcribed
# and every figure in it is resolved out of the engine and compared.
#
# It is written per person on purpose. A loop over whatever the fixture happens
# to contain would agree with the fixture no matter what the fixture said, which
# is the failure this test exists to catch.
# ===========================================================================

# name → (religion, gender, roles, [(month, salary)], [(month, threshold hours)])
ROSTER_AS_STATED = {
    "esadul":   ("Muslim", "M", ("Master",),        [("2025-09", 45000)], [("2025-09", 280)]),
    "sarfaraz": ("Muslim", "M", ("Master",),        [("2025-09", 33000)], [("2025-09", 280)]),
    "jamil":    ("Muslim", "M", ("Master",),        [("2025-09", 45000)], [("2025-09", 280)]),
    # "Aug 2025 to Aug 2026 ... Apr to Oct 2025 280, Nov 2025 to present 270"
    "ibrahim":  ("Muslim", "M", ("Master",),        [("2025-09", 45000), ("2026-01", 45000)],
                                                    [("2025-09", 280), ("2026-01", 270)]),
    # "Apr-May 2025 15000, Jun 2025-Mar 2026 18000, Apr 2026-present 20000"
    "karim":    ("Muslim", "M", ("Supervisor",),    [("2025-04", 15000), ("2025-09", 18000),
                                                     ("2026-06", 20000)],
                                                    [("2025-09", 280), ("2026-01", 270)]),
    # "Apr 2025-Jul 2026 9000, Aug 2026-present 10000"
    "muskan":   ("Muslim", "F", ("Packing",),       [("2025-09", 9000), ("2026-09", 10000)],
                                                    [("2025-09", 230)]),
    "bharti":   ("Hindu",  "F", ("Dhaga Cutting",), [("2025-09", 8500)], [("2025-09", 230)]),
    "maasi":    ("Hindu",  "F", ("Dhaga Cutting",), [("2025-09", 8000)], [("2025-09", 230)]),
    "selima":   ("Muslim", "F", ("Dhaga Cutting",), [("2026-06", 9000)], [("2026-06", 230)]),
    "rupsa":    ("Muslim", "F", ("Dhaga Cutting",), [("2026-06", 9000)], [("2026-06", 230)]),
    "priyanka": ("Hindu",  "F", ("Dhaga Cutting",), [("2026-06", 9000)], [("2026-06", 230)]),
    "surender": ("Hindu",  "M", ("Iron",),          [("2025-09", 23000)], [("2025-09", 280)]),
    "upender":  ("Hindu",  "M", ("Iron",),          [("2026-06", 28000)], [("2026-06", 280)]),
    "shivam":   ("Hindu",  "M", ("Packing",),       [("2025-09", 15000)], [("2025-09", 280)]),
    "krishna":  ("Hindu",  "M", ("Packing",),       [("2025-09", 15000)], [("2025-09", 280)]),
    # HE GAVE THESE FOUR PAY AND NO WORK. "Pooja (female, hindu, piece rate)", "Kajal
    # (female, hindu, 10000)", and two on 12000 with their own clock. So the roles tuple is
    # empty — this file had a role for each of them that he never gave, filled in from the
    # shape of the rest of the roster, and it read exactly like something he had said.
    "kajal":    ("Hindu",  "F", (),                 [("2026-09", 10000)], [("2026-09", 230)]),
    "sanjana":  ("Hindu",  "F", (),                 [("2026-09", 12000)], [("2026-09", 220)]),
    "kalyani":  ("Hindu",  "F", (),                 [("2026-09", 12000)], [("2026-09", 220)]),
    "pooja":    ("Hindu",  "F", (),                 [], []),
    # No religion was stated for these two, and none is invented.
    "joginder": (None,     "M", ("Iron",),          [], []),
    "ikram":    (None,     "M", ("Iron",),          [], []),
}

# The four he gave no work for. Named here so removing one from ROSTER_AS_STATED cannot
# quietly turn "he never said" into "we checked and it matches".
NO_ROLE_STATED = ("pooja", "kajal", "sanjana", "kalyani")


def test_the_roster_he_stated_is_what_the_engine_resolves():
    print("\n--- the roster he stated, resolved out of the engine ---")
    master = Master.from_json(FIXTURE)

    missing = [k for k in ROSTER_AS_STATED if k not in master.people]
    check("every person he named is in the roster", not missing, str(missing))

    wrong = []
    for ident, (religion, gender, roles, salaries, thresholds) in ROSTER_AS_STATED.items():
        if ident not in master.people:
            continue
        p = master.people[ident]
        if p.religion != religion:
            wrong.append(f"{ident} religion {p.religion} != {religion}")
        if not p.gender.upper().startswith(gender):
            wrong.append(f"{ident} gender {p.gender} != {gender}")
        for want in roles:
            if want not in (p.roles or ()):
                wrong.append(f"{ident} roles {list(p.roles or ())} lack {want!r}")
        for month, amount in salaries:
            got = master.salary.maybe(ident, month)
            if got is None or abs(float(got) - amount) > 0.005:
                wrong.append(f"{ident} salary {month} {got} != {amount}")
        for month, hours in thresholds:
            got = master.threshold_hours.maybe(ident, month)
            if got is None or abs(float(got) - hours) > 0.005:
                wrong.append(f"{ident} threshold_hours {month} {got} != {hours}")
    check("religion, gender, role, salary and threshold hours all resolve to what he stated",
          not wrong, "; ".join(wrong[:4]))

    # AND NOTHING HE DID NOT STATE IS SITTING THERE LOOKING LIKE HE DID.
    # This is the half that was failing silently: four people carried an operation nobody
    # ever gave them. For three it changed no money, and it would still have been read as
    # his instruction the next time somebody opened the file.
    invented = [i for i in NO_ROLE_STATED if master.people[i].roles]
    check("the four he gave no work for carry no invented one",
          not invented, str({i: master.people[i].roles for i in invented}))
    raw = json.loads(FIXTURE.read_text(encoding="utf-8"))
    check("and the file says out loud which four those are, and what it cost",
          len(raw.get("_roles_the_owner_did_not_state", "")) > 200)

    # THE ONE PLACE IT COSTS SOMETHING. A salaried month is priced from salary and
    # threshold, so a missing operation changes nothing. A piece-rate month cannot be
    # priced at all — and stopping to ask is the right answer, not a rate picked for her.
    r = month_pay(master, AttendanceBook(), "pooja", "2026-09")
    check("the one on piece rate with no operation stops the month instead of paying a guess",
          r.state == UNRESOLVED and r.earning == 0, "; ".join(r.notes))
    same = month_pay(master, AttendanceBook(), "kajal", "2026-10")
    check("and her salaried colleagues stop for a missing attendance sheet, not a missing rate",
          same.state == NO_DATA and near(same.salary, 10000)
          and not any("operation" in n for n in same.notes),
          f"{same.state}: {'; '.join(same.notes)}")

    # THE THRESHOLD IS THE PERSON'S, NOT THEIR GENDER'S. Two people moved from 280 to
    # 270 in Nov 2025 and the rest did not, so a gender default would have moved
    # everybody or nobody. Proven by the pair disagreeing with a man who kept 280.
    moved = {i for i in master.people
             if master.threshold_hours.maybe(i, "2025-09") == 280
             and master.threshold_hours.maybe(i, "2026-01") == 270}
    stayed = {i for i in master.people
              if master.threshold_hours.maybe(i, "2026-01") == 280}
    check("the November move to 270 is per person, and others on 280 did not move",
          moved and stayed and not (moved & stayed), f"moved {sorted(moved)} kept {sorted(stayed)}")

    # And nobody carries a threshold by inheriting their gender's.
    #
    # basis_of() RAISES when a person is employed with no pay basis in force, and this
    # was a bare comprehension: a fixture with one such person aborted the whole suite
    # on this line, six checks before the one that would have named the real cause. An
    # unresolvable basis is a finding — it belongs in the list, not in a traceback.
    nothreshold = []
    for i in sorted(master.people):
        if not master.employed(i, "2026-09") or master.departure_is_unresolved(i, "2026-09"):
            continue
        try:
            basis = master.basis_of(i, Month.of("2026-09"))
        except Unresolved as exc:
            nothreshold.append(f"{i}: {exc}")
            continue
        if basis in (FLAT, ATTENDANCE) and master.threshold_hours.maybe(i, "2026-09") is None:
            nothreshold.append(f"{i}: no threshold_hours row")
    check("every salaried person employed that month carries their own threshold row",
          not nothreshold, "; ".join(nothreshold))


# The owner's own words for 1 Sep 2026. Typed out because a list derived from the
# fixture would agree with the fixture whatever the fixture said — and these dates have
# now been lost twice, once by an employment rewrite that silently reopened four spells.
ACTIVE_ON_SNAPSHOT = ("esadul", "karim", "upender", "muskan",
                      "sanjana", "kalyani", "ikram", "pooja")
ON_LEAVE_ON_SNAPSHOT = ("kajal",)
GONE_WITH_NO_DATE = ("surender", "shivam", "krishna", "jamil", "sarfaraz")

# THE SEVEN DATES THAT WERE ACTUALLY STATED, spelled out.
#
# Nothing checked these. Dropping one of them — priyanka's, planted — failed no test at
# all, because "who is working" is satisfied by a spell that closed on ANY date before
# the snapshot, and every other check reads a month far from the boundary. So a leaving
# date could move by four months, or vanish and be replaced by a different mechanism,
# and the suite would stay green. That is how they were lost the first time.
LEFT_ON = {
    "ibrahim": "2026-08-31", "bharti": "2026-03-31", "maasi": "2026-03-31",
    "selima": "2026-07-31", "rupsa": "2026-07-31", "priyanka": "2026-07-31",
    "joginder": "2026-03-31",
}


def test_the_roster_on_the_snapshot_resolves_name_for_name():
    """Who was on the floor on 1 Sep 2026, resolved out of the engine and compared.

    The owner gave this list directly, and it OVERRIDES his own uploaded document, which
    names Surender working and does not name Upender. Both readings are recorded in
    SPEC_CONFLICTS.md; the engine holds the one he stated last.
    """
    print("\n--- the roster on the snapshot, name for name ---")
    master = Master.from_json(FIXTURE)
    when = "2026-09"

    check("the file states the date its roster was true on, rather than meaning 'now'",
          master.roster_snapshot == "2026-09-01", str(master.roster_snapshot))

    working = {i for i in master.people
               if master.employed(i, when)
               and not master.departure_is_unresolved(i, when)
               and not master.on_leave(i, when)}
    check("exactly the people he listed are working, and nobody else",
          working == set(ACTIVE_ON_SNAPSHOT),
          f"extra {sorted(working - set(ACTIVE_ON_SNAPSHOT))} "
          f"missing {sorted(set(ACTIVE_ON_SNAPSHOT) - working)}")

    check("the one he put on leave is employed and not working",
          all(master.employed(i, when) and master.on_leave(i, when)
              for i in ON_LEAVE_ON_SNAPSHOT))

    # EVERY STATED LEAVING DATE, TO THE DAY — and the month either side of it.
    # The date itself, because nothing checked it; the two months, because a date that
    # is merely "before the snapshot" satisfies every other check in this file while
    # being months wrong, which is worth real money to the person it belongs to.
    wrong = []
    for who, day in LEFT_ON.items():
        spells = master.employment.spells(who)
        got = spells[-1].left.isoformat() if spells and spells[-1].left else None
        if got != day:
            wrong.append(f"{who} left {got}, stated {day}")
            continue
        last = Month.of(day[:7])
        if not master.employed(who, last):
            wrong.append(f"{who} is not employed in {last.key}, the month he left in")
        nxt = Month(last.year + (last.month == 12), last.month % 12 + 1)
        if master.employed(who, nxt):
            wrong.append(f"{who} is still employed in {nxt.key}, after leaving")
    check("every stated leaving date is held to the day, and the month either side of it",
          not wrong, "; ".join(wrong))

    check("and nobody has both a stated leaving date and an unstated one",
          not (set(LEFT_ON) & master.departure_undated),
          str(sorted(set(LEFT_ON) & master.departure_undated)))

    # GONE, WITH NOBODY HAVING SAID WHEN — three separate claims, and only one is true.
    for who in GONE_WITH_NO_DATE:
        r = month_pay(master, AttendanceBook(), who, when)
        check(f"{who}: the month is unresolved, not quietly paid",
              r.state == UNRESOLVED and r.earning == 0, f"{r.state} {r.earning}")
        check(f"{who}: and the note says exactly what is missing",
              any("leaving date" in n for n in r.notes), "; ".join(r.notes))

    # BEFORE the snapshot they were employed, and that was never in doubt.
    check("and their earlier months are untouched — the absence starts at the snapshot",
          all(not master.departure_is_unresolved(w, "2026-01") and master.employed(w, "2026-01")
              for w in GONE_WITH_NO_DATE))

    # It must not fail the build. It is an absence somebody accounted for in writing.
    months = [Month.of(when)]
    g = logs_resolve_once(master, months)
    check("the undated departures are reported on every run, and do not fail the build",
          g.passed and {o["staff"] for o in g.known} >= set(GONE_WITH_NO_DATE), g.detail)

    raw = json.loads(FIXTURE.read_text(encoding="utf-8"))
    check("and the file says out loud that no date was given, and why none was invented",
          len(raw.get("_departures_with_no_date_stated", "")) > 200)


def test_the_clock_derives_the_hours_rather_than_asserting_them():
    """The owner gave times, not hours, and then gave the rule for the difference:

        "Male weekday 09:30-20:00 = 10 h; Sunday 09:30-15:00 = 5 h (30min lunch break)
         FeMale weekday 09:30-18:00 = 8h; Sunday 09:30-15:30 = 5.5 h (30min lunch break)
         (30 min lunch break or 1 hour lunch break should not consider as productive hour)"

    So the hours are DERIVED — out minus in minus the break — and the derivation is
    checked here rather than trusted. A typed 10.0 with a clock beside it saying 09:30
    to 20:00 is two facts that can drift apart silently, and the one people read is the
    clock while the one that pays them is the number.
    """
    print("\n--- the clock, and the break that is not productive ---")
    raw = json.loads(FIXTURE.read_text(encoding="utf-8"))
    master = Master.from_json(FIXTURE)

    def hours(entry):
        def mins(t):
            h, m = str(t).split(":")
            return int(h) * 60 + int(m)
        return (mins(entry["out"]) - mins(entry["in"]) - entry["lunch_minutes"]) / 60.0

    stated = {("M", "Weekday"): 10.0, ("M", "Sunday"): 5.0,
              ("F", "Weekday"): 8.0, ("F", "Sunday"): 5.5}
    wrong = []
    for c in raw["shift_clock"]:
        want = stated.get((c.get("group"), c["day_type"]))
        if want is not None and abs(hours(c) - want) > 1e-9:
            wrong.append(f"{c.get('group')} {c['day_type']}: clock gives {hours(c)}, not {want}")
    check("every clock the owner gave derives the hours he gave with it",
          not wrong, "; ".join(wrong))

    check("and the table the engine prices from is those same four numbers",
          {k: master.shift_hours[k] for k in stated} == stated, str(master.shift_hours))

    # THE BREAK IS THE WHOLE POINT. Ten hours on the clock is not ten hours of work.
    male_weekday = next(c for c in raw["shift_clock"]
                        if c.get("group") == "M" and c["day_type"] == "Weekday")
    check("an unpaid break is subtracted, so elapsed time is never paid as productive",
          male_weekday["lunch_minutes"] == 30 and hours(male_weekday) == 10.0,
          f"09:30-20:00 is 10.5 elapsed, {hours(male_weekday)} productive")

    # A PERSON'S OWN CLOCK BEATS THEIR CATEGORY'S — the two on 09:00-17:30 with a
    # 09:00-13:00 Sunday work neither the male shift nor the female one, and one
    # master's Sunday carries no break at all.
    # Derived from the CLOCK, so deleting an hours row is caught here rather than only by
    # the coverage gate three sections down. The first version compared against one
    # category's Sunday and passed with both people's rows deleted.
    want = {(c["key"], c["day_type"]): hours(c) for c in raw["shift_clock"] if "key" in c}
    check("everybody the owner gave their own times for has their own hours row",
          set(want) == set(master.shift_hours_by_person),
          f"clock has {sorted(set(want) - set(master.shift_hours_by_person))}, "
          f"table has {sorted(set(master.shift_hours_by_person) - set(want))}")

    A_SUNDAY, A_WEEKDAY = "2026-09-06", "2026-09-07"
    wrong = []
    for (ident, kind), h in want.items():
        if ident not in master.people:
            continue
        got = master.shift(ident, A_SUNDAY if kind == "Sunday" else A_WEEKDAY)
        if abs(got - h) > 1e-9:
            wrong.append(f"{ident} {kind}: priced at {got}, own clock says {h}")
    check("and each of them is priced from their own clock, not their category's",
          want and not wrong, "; ".join(wrong))

    # At least one of them must actually DIFFER from their category, or the rule that a
    # person's row wins is being proved by a row that changes nothing.
    # Compared against the GENDER category, which is the table everybody else is priced
    # from. Comparing against person.group compared two of them against 'Packing', which
    # has no row at all — the very reason they needed their own — so nothing qualified and
    # the check failed on correct data.
    differs = sorted({i for (i, k), h in want.items()
                      if i in master.people
                      and master.shift_hours.get(
                          (master.people[i].gender.upper()[:1], k)) != h})
    check("at least one own clock really differs from the category it would otherwise use",
          differs, f"none of {sorted({i for i, _k in want})} differs from their gender's hours")
    check("and their category still prices everybody else",
          master.shift("muskan", "2026-09-06") == 5.5
          and master.shift("muskan", "2026-09-07") == 8.0)


def test_pay_per_hour_is_salary_over_that_month_s_threshold():
    """The owner: "Salary calculation should be like Monthly Salary/monthly threshold hour".

    Both halves read at the month being paid, which is the part worth a test: one of
    these people changed salary and threshold on different dates, so a per-hour figure
    that fixed either half would be wrong for the months in between.
    """
    print("\n--- per hour is this month's salary over this month's threshold ---")
    master = Master.from_json(FIXTURE)

    def per_hour(ident, month):
        salary = master.salary.resolve(ident, month)
        return float(salary) / float(master.threshold_hours.resolve(ident, month))

    # His own worked examples, in his own numbers.
    check("45000 against a 280-hour month is 160.71 per hour",
          near(per_hour("ibrahim", "2025-09"), 45000 / 280, 0.005),
          f'{per_hour("ibrahim", "2025-09"):.4f}')
    check("and the same salary against 270 from November is 166.67",
          near(per_hour("ibrahim", "2026-01"), 45000 / 270, 0.005),
          f'{per_hour("ibrahim", "2026-01"):.4f}')
    check("a mid-year raise moves the numerator on its own date",
          near(per_hour("karim", "2025-04"), 15000 / 280, 0.005)
          and near(per_hour("karim", "2025-09"), 18000 / 280, 0.005))
    check("and the threshold moves the denominator on a DIFFERENT date",
          near(per_hour("karim", "2026-01"), 18000 / 270, 0.005)
          and near(per_hour("karim", "2026-06"), 20000 / 270, 0.005))

    # NEITHER FIGURE IS STORED. If it were, the file would carry a number that the two
    # it came from can silently stop agreeing with.
    raw = json.loads(FIXTURE.read_text(encoding="utf-8"))
    check("no per-hour figure is written into the file — it is computed from the two logs",
          not any(k.endswith("per_hour") or k == "rate_per_hour" for k in raw),
          str([k for k in raw]))


def test_an_advance_is_a_balance_beside_the_pay_and_never_inside_it():
    """The owner: "Is advance amount, should not include in salary, keep it seperate,
    they will deduct later in few months, just keep a column and mention as advance".
    """
    print("\n--- an advance is a column, not a deduction ---")
    master = Master.from_json(FIXTURE)

    owing = {i: master.advance_balance(i, "2026-09")
             for i in master.advance.keys()}
    check("the advances he named are carried against the people he named them for",
          {k: v for k, v in owing.items() if v} == {"karim": 65000.0, "muskan": 15000.0,
                                                    "vinay": 5000.0},
          str(owing))

    # ONE OF THEM IS NOT ON THE ROSTER, AND IS STILL OWED. Dropping the row because the
    # person has no employment spell would lose real money; inventing a spell for them
    # would put somebody on the payroll who is not employed.
    raw = json.loads(FIXTURE.read_text(encoding="utf-8"))
    off_roster = [k for k in owing if k not in master.people]
    check("an advance to somebody who is not on the roster is kept, and says so",
          off_roster and len(raw.get("_vinay_is_not_on_the_roster", "")) > 40, str(off_roster))

    # THE PROPERTY THAT MATTERS. The month pays exactly what it earned.
    with_advance = month_pay(master, AttendanceBook(), "karim", "2026-09")
    check("a month with an advance outstanding still pays the salary in force, untouched",
          near(with_advance.earning, 20000) and with_advance.advance_balance == 65000.0,
          f"earned {with_advance.earning:,.2f} · advance {with_advance.advance_balance:,.2f}")

    clear = month_pay(master, AttendanceBook(), "upender", "2026-09")
    check("and somebody with no advance is not made to look like they owe zero by accident",
          clear.advance_balance == 0.0 and "upender" not in master.advance.keys())

    # Recovery reduces the balance and touches nothing else.
    master.advance_recovered["karim"] = 20000
    after = month_pay(master, AttendanceBook(), "karim", "2026-09")
    check("recovering part of it moves the balance and leaves the pay alone",
          after.advance_balance == 45000.0 and near(after.earning, with_advance.earning),
          f"{after.advance_balance:,.2f} after 20,000 recovered")


def test_religion_is_recorded_only_where_it_was_given():
    """The owner: "RELIGION FOR HOLIDAY PURPOSE".

    So it is recorded — and only for the people he actually named one for. Absence
    means NOT RECORDED, which is not a default and not a guess.
    """
    print("\n--- religion ---")
    master = Master.from_json(FIX / "master.json")

    known = {i: p.religion for i, p in master.people.items() if p.religion}
    check("religion is recorded for the people he named one for", len(known) >= 6, str(known))
    check("and for nobody else — absence is not a default",
          all(master.people[i].religion is None
              for i in master.people if i not in known))
    check("every recorded value is one he actually gave",
          set(known.values()) <= {"Muslim", "Hindu"}, str(set(known.values())))


def test_religion_decides_holidays_and_nothing_else():
    """The gate, run over the engine.

    The risk is not that somebody sets out to make pay depend on religion. It is
    that an attribute on a person quietly acquires a second job — which is exactly
    how shift_group came to be keyed to gender, the mistake this repository already
    paid for once.
    """
    print("\n--- religion decides holidays and nothing else ---")
    r = religion_only_decides_holidays([ROOT / "vastrangam"])
    check(r.gate, r.passed, r.detail + " " + str(r.offenders[:3]))


def test_a_holiday_scoped_to_a_religion_raises_for_an_unrecorded_person():
    """THE NEGATIVE CONTROL, and the reason absence is not a default.

    Including somebody grants a paid day on an assumption. Excluding them withholds
    one on the same assumption. Both are decisions about a real person that nobody
    made, and the second is the one they find out about on payday.
    """
    print("\n--- a holiday nobody can decide ---")
    master = Master.from_json(FIX / "master.json")
    master.holidays = [{
        "name": "A festival", "date": "2026-10-20",
        "applies_to": {"kind": "religion", "value": "Hindu"},
    }]

    got = master.holiday_on("kajal", "2026-10-20")           # Hindu, recorded
    check("it applies to somebody whose religion matches", got is not None)
    check("and not to somebody whose religion is recorded and differs",
          master.holiday_on("esadul", "2026-10-20") is None)

    # THE VICTIM IS CHOSEN, NOT NAMED. This said "karim" until the owner stated his religion, at
    # which point the check was asking about somebody who HAS one and could only pass by accident.
    # The same staleness the piece-rate control already learned, one file over.
    nobody = next((pid for pid, p in master.people.items() if p.religion is None), None)
    check("somebody in the roster has no religion recorded, or this check proves nothing",
          nobody is not None, str(sorted(master.people)))
    try:
        master.holiday_on(nobody, "2026-10-20")              # no religion recorded
        check("an unrecorded religion RAISES rather than deciding", False, "it returned")
    except LookupError as exc:
        check("an unrecorded religion RAISES rather than deciding", True)
        check("and the message names the person and says what to do",
              nobody in str(exc) and "named list" in str(exc), str(exc)[:120])

    # A day given to named people needs no religion at all, which is the honest
    # shape whenever an arrangement is not really about a category.
    master.holidays = [{
        "name": "A day off", "date": "2026-10-21",
        "applies_to": {"kind": "people", "value": ["karim"]},
    }]
    check("a day scoped to named people never consults religion",
          master.holiday_on("karim", "2026-10-21") is not None
          and master.holiday_on("muskan", "2026-10-21") is None)


def test_holiday_calendar_ships_empty_and_says_so():
    """An empty calendar means "nothing configured yet" and never "this business
    observes no holidays". Those are different statements and the second is false."""
    print("\n--- the holiday calendar ---")
    f = json.loads((FIX / "holidays.json").read_text(encoding="utf-8"))
    check("it ships with no observances", f["observances"] == [])
    check("and says why, rather than looking like an oversight",
          len(f.get("_dates_are_the_owner_s_and_this_list_is_deliberately_empty", "")) > 200)
    check("a holiday pays by default and produces nothing",
          f["policy"]["paid_by_default"] is True)
    kinds = {k["kind"] for k in f["applies_to_kinds"]}
    check("a day can be scoped to everyone, a religion, or named people",
          kinds == {"all", "religion", "people"}, str(kinds))


def test_joginder_and_ikram_are_two_periods():
    """The owner: "Joginder/Ikram worked in fy2025-26 on 100/hour, in FY2026-27 on
    piece rate."

    The hourly row was left OPEN, so June 2026 resolved to 100 per hour — last
    year's rate paid into this year — while a note in the fixture claimed the
    opposite was happening. Ikram had no rate at any date at all.
    """
    print("\n--- two periods, not one open row ---")
    master = Master.from_json(FIX / "master.json")

    # READ FROM THE HOURLY LOG, WHICH IS WHERE A PERSON'S RATE PER HOUR LIVES.
    # This asked master.piece_rate, and was right until a piece rate stopped being a
    # person's: it is now the operation's rate on a garment, so that log holds no row
    # under anybody's name and the question could only ever answer None.
    for who in ("joginder", "ikram"):
        got = master.hourly_rate.maybe(who, "2025-06")
        check(f"{who}: FY2025-26 is the 100 per hour he stated",
              got and got.get("rate") == 100 and got.get("unit") == "per_hour", str(got))
        check(f"{who}: FY2026-27 has NO hourly rate — the basis changed, it did not carry over",
              master.hourly_rate.maybe(who, "2026-06") is None,
              str(master.hourly_rate.maybe(who, "2026-06")))
    # AND THE SUCCESSOR BASIS IS PRICED — for the one of them still on the books.
    #
    # The owner's roster for 2026-09-01 does not include joginder, and he confirmed the
    # 2026-03-31 leaving date when it was put to him. That closes his spell before
    # FY2026-27 begins, so he has no basis to resolve in it — while his own document
    # says "Joginder / Ikram FY26-27: iron piece rates". Both statements are his. The
    # date is the one he affirmed most recently, so it is what the engine holds, and the
    # contradicting line is recorded in SPEC_CONFLICTS.md rather than quietly dropped.
    check("ikram: FY2026-27 is piece rate, priced by the operation he does",
          master.basis_of("ikram", Month.of("2026-06")) == PIECE_RATE
          and master.piece_rate_for(master.operation_of("ikram"), "Anarkali", "2026-06") == 7.5,
          f"{master.operation_of('ikram')}")
    check("joginder: left before FY2026-27, so that year resolves nothing for him",
          not master.employed("joginder", "2026-06")
          and raises(Unresolved, lambda: master.basis_of("joginder", Month.of("2026-06"))))
    check("and the rate card he would have been paid from is still there, unchanged",
          master.piece_rate_for("Iron", "Anarkali", "2026-06") == 7.5)

    # And the absence is RECORDED as deliberate, not left to look like a gap.
    # Recorded in its OWN field. _no_rate_stated means "never had a rate at all" and
    # an existing gate reads it that way; a rate that ran and stopped is a different
    # fact, and folding it in would have made both readings wrong. That gate caught
    # this on the first run, which is the only reason it is two fields now.
    raw = json.loads((FIX / "master.json").read_text(encoding="utf-8"))
    for who in ("joginder", "ikram"):
        check(f"{who}: the ended rate with no successor is recorded as deliberate",
              len(raw["_rate_ends_and_no_successor_stated"].get(who, "")) > 40)
        check(f"{who}: and is NOT filed as never having had a rate",
              who not in raw["_no_rate_stated"])


def test_lehenga_choli_carries_an_optional_dupatta():
    """The owner: "it can be lehenga choli dupatta". The production file reconciles
    on Top+Bottom for all 34 designs.

    Both are true. A REQUIRED dupatta would break the 34; no dupatta slot at all
    would lose the ones that have one. Optional is the only reading that keeps both.
    """
    print("\n--- the dupatta on a lehenga choli ---")
    f = json.loads((FIX / "set_types.json").read_text(encoding="utf-8"))
    lc = next(c for c in f["compositions"] if c["set_type"] == "Lehenga Choli Set")

    check("the dupatta is a slot", "Dupatta" in lc["slots"], str(lc["slots"]))
    check("and it is NOT required — zero dupattas is still a set",
          lc["required"]["Dupatta"] is False, str(lc["required"]))
    check("the two pieces that decide the count are still undecided, not assumed",
          lc["required"]["Top"] is None and lc["required"]["Bottom"] is None)
    check("and the evidence records both the file and what the owner said",
          "34" in lc["evidence"] and "dupatta" in lc["evidence"].lower())


def test_channels_are_rows_with_no_count_asserted():
    """"Marketplace can be 6 or 7 or 10, why are you holding it so strong." """
    print("\n--- the channels ---")
    f = json.loads((FIX / "channels.json").read_text(encoding="utf-8"))

    names = [c["name"] for c in f["channels"]]
    check("the names he gave are recorded rather than lost", len(names) >= 7, str(names))
    check("every row says it was named by the owner rather than invented",
          all(c.get("_owner_named") for c in f["channels"]))
    check("the file says this is today’s data and not a limit",
          len(f.get("_this_is_today_s_data_not_a_design", "")) > 200)

    # HE SAID SIX AND LISTED SEVEN. Recorded, not quietly corrected.
    check("the six-versus-seven discrepancy is recorded rather than resolved",
          "SEVEN" in f.get("_a_discrepancy_left_standing_rather_than_resolved", ""))

    # And no count of them is asserted anywhere that computes.
    check("nothing in the file states how many channels there are",
          not re.search(r"\b(six|seven|eight|[0-9]+)\s+channels\b",
                        json.dumps(f), re.I))


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
    test_the_roster_he_stated_is_what_the_engine_resolves()
    test_the_roster_on_the_snapshot_resolves_name_for_name()
    test_the_clock_derives_the_hours_rather_than_asserting_them()
    test_pay_per_hour_is_salary_over_that_month_s_threshold()
    test_an_advance_is_a_balance_beside_the_pay_and_never_inside_it()
    test_religion_is_recorded_only_where_it_was_given()
    test_religion_decides_holidays_and_nothing_else()
    test_a_holiday_scoped_to_a_religion_raises_for_an_unrecorded_person()
    test_holiday_calendar_ships_empty_and_says_so()
    test_joginder_and_ikram_are_two_periods()
    test_lehenga_choli_carries_an_optional_dupatta()
    test_channels_are_rows_with_no_count_asserted()
    test_weekly_off()
    test_weekly_off_agrees_with_threshold()
    test_trial_has_no_employment_record()
    test_trial_without_a_payment_raises()
    test_leave_is_not_absence_and_not_leaving()
    test_karigar_units_fixture()
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
