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
                        Master, Month, RunLog, allocate, blended_hourly,
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
from vastrangam.karigar import (BOTTOM, DUPATTA, TOP, KarigarRegistry,
                                classify_components, master_rate_conflict,
                                parse_component_type, variance_line)
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

    # The two divisors.
    m = _one_person(gender="F", salary=9000, thr_days=28, thr_hours=230)
    r = month_pay(m, AttendanceBook(), "p", "2025-04")
    check("daily and hourly rates use different divisors and are never derived "
          "from one another",
          near(r.daily_rate, 9000 / 28, 0.001) and near(r.hourly_rate, 9000 / 230, 0.001)
          and not near(r.hourly_rate, r.daily_rate / 8, 0.001),
          f"daily {r.daily_rate:.4f} (/28) vs hourly {r.hourly_rate:.4f} (/230); "
          f"daily/8 would have been {r.daily_rate / 8:.4f}")


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


# ===========================================================================
# PART 11 — THE FIXTURE: known answers
# ===========================================================================

EXPECTED_BLENDED = {
    "ibrahim": 164.43, "karim": 63.49, "muskan": 39.13, "surender": 82.14,
    "jamil": 160.71, "sarfaraz": 117.86, "krishna": 53.57, "shivam": 53.57,
    "bharti": 36.96, "maasi": 34.78,
}


def test_blended_rates():
    print("\n--- the ten blended hourly rates, FY2025-26 ---")

    master = Master.from_json(FIXTURE)
    for staff, want in EXPECTED_BLENDED.items():
        got = blended_hourly(master, staff, "2025-26")
        check(f"blended hourly {staff} = {want}", near(got, want, 0.005), f"got {got:.4f}")

    # Ibrahim joined in August. Averaged over twelve months he would look cheap.
    twelve = sum(
        blended_hourly.__wrapped__ if False else 0 for _ in ()
    )
    naive = _naive_blended(master, "ibrahim", "2025-26")
    check("averaging over months a person did not work understates the rate",
          naive < EXPECTED_BLENDED["ibrahim"] - 1,
          f"employed-months {EXPECTED_BLENDED['ibrahim']} vs all-months {naive:.2f}")


def _naive_blended(master, staff, fy):
    """Deliberately wrong: the twelve-month average, to show what it costs."""
    from vastrangam.calendar_util import fy_months
    rates = []
    for m in fy_months(fy):
        try:
            rates.append(float(master.salary.resolve(staff, m))
                         / float(master.threshold_hours.resolve(staff, m)))
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

    # The composition decides the answer, and getting it wrong is wrong in both
    # directions — this is the rule the real file corrected.
    three = complete_sets({TOP: 22, BOTTOM: 0, DUPATTA: 22}, (TOP, BOTTOM, DUPATTA))
    check("22 tops and 22 dupattas with no bottoms make no complete sets at all",
          three.complete_sets == 0, str(three.complete_sets))
    check("and all 44 pieces are reported as surplus",
          three.surplus[TOP] == 22 and three.surplus[DUPATTA] == 22)

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
    check("the comparison figure is hours-scaled",
          near(r.earning_hours_scaled, 45000.0, 0.01), f"{r.earning_hours_scaled:,.2f}")
    check("the gap between them is reported, not hidden",
          near(r.earning_gap, 45000 - 45000 * 30 / 28, 0.01), f"{r.earning_gap:,.2f}")

    flat = _one_person(salary=18000, basis=FLAT)
    rf = month_pay(flat, book, "p", "2025-04")
    check("flat pay prices the same either way, because nothing scales it",
          near(rf.earning, 18000) and near(rf.earning_hours_scaled, 18000)
          and rf.earning_gap == 0)

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
    check("with no salary there is no second pricing, so the column repeats "
          "the paid figure rather than showing zero",
          near(r.earning_hours_scaled, r.earning))


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
    "complete_sets": (30811, 0),
    "designs": (158, 0),
    "rows": (1695, 0),
}


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
    check(f"every design's complete-set count matches the file ({len(recorded)} designs)",
          matched == len(recorded) and recorded,
          f"{matched} of {len(recorded)}")

    check("no production row fails to multiply out",
          rows_price_themselves(result.entries).passed)
    check("no design reports more sets than its scarcest required piece",
          bottleneck_uses_the_set_composition(result.designs).passed)


CORPUS_EXPECTED = {
    "payroll_total": (975649, 1.0),      # to the rupee; the source figure is rounded
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
    test_blended_rates()
    test_karim_flat_year()
    test_forward_dated_policy()
    test_karigar_identity()
    test_component_labels()
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
    with tempfile.TemporaryDirectory() as tmp:
        test_run_log(Path(tmp))
    test_corpus()
    test_karigar_corpus()

    print("=" * 70)
    print(f"{len(PASS)} passed, {len(FAIL)} failed")
    for name in FAIL:
        print(f"  FAIL {name}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
