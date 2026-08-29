"""Staff pay — Combined Master Prompt §3.

One divisor. §3.5 is explicit that pay is days-based, not hours-based:

    daily_rate  = resolved salary / resolved threshold days

Hours never price a month. They are a reference column, and their only job is
the Work Report's cost-per-piece — which §3.6.3 derives from the daily rate
rather than from a threshold:

    hourly_rate = daily_rate / that person's weekday shift hours   (10 M / 8 F)

So the Threshold Hours log survives as the legacy reference column §3.6.3 calls
it, and drives nothing. For the men the two derivations happen to agree — 28
days x 10 hours is 280 — and for the women they do not: 9,000/28/8 is 40.18 an
hour where 9,000/230 was 39.13.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from statistics import fmean

from .attendance import WEEKDAY, AttendanceBook, day_type
from .calendar_util import Month, fy_months
from .master import (ATTENDANCE, DAILY_WAGE, DAY_SCALED, FLAT, PER_HOUR,
                     PER_PIECE, PIECE_RATE, HOURLY, Master)
from .logs import Unresolved

NOT_EMPLOYED = "Not employed"
NO_DATA = "No Data"
EMPLOYED = "Employed"
UNRESOLVED = "Unresolvable"
# A fifth state, and the only one with no employment behind it. "Staff Trial:
# can be anyone who worked for few days or weeks and left and we paid."
TRIAL = "Trial"


@dataclass
class MonthPay:
    staff: str
    month: Month
    state: str = NOT_EMPLOYED
    basis: str | None = None
    salary: float = 0.0
    threshold_days: float = 0.0
    threshold_hours: float = 0.0
    daily_rate: float = 0.0
    hourly_rate: float = 0.0
    days_equivalent: float = 0.0
    productive_hours: float = 0.0
    marked_days: int = 0
    units: float = 0.0
    unit_kind: str | None = None
    piece_rate: float = 0.0
    # THE paying figure. Everything downstream — allocation, reconciliation,
    # outstanding — reads this and only this. §3.5 leaves no second pricing:
    # hours are informational and never scale a month's pay.
    earning: float = 0.0
    # A COLUMN BESIDE THE PAY, NEVER A TERM INSIDE IT.
    # The owner: "Is advance amount, should not include in salary, keep it seperate, they
    # will deduct later in few months, just keep a column and mention as advance." So this
    # is reported and `earning` above is untouched by it. Netting the two would answer
    # neither question — what the month earned, and what is still owed back — and a reader
    # handed one merged figure cannot recover either.
    advance_balance: float = 0.0
    utilisation: float | None = None
    utilisation_hours: float | None = None
    notes: list = field(default_factory=list)

    @property
    def employed(self) -> bool:
        return self.state in (EMPLOYED, NO_DATA)

    @property
    def rated(self) -> bool:
        """Whether this month belongs in an average. Not-employed never does, and
        neither does a trial — somebody who came for four days is not a person
        having a bad month, and averaging them in says something false about a
        real person on a record that follows them."""
        return self.state == EMPLOYED


def month_pay(master: Master, book: AttendanceBook, staff: str, month,
              units: float | None = None) -> MonthPay:
    """One person, one month. The only place earning is calculated."""
    month = Month.of(month)
    r = MonthPay(staff, month)
    # Carried on every row, whatever happens below — including the rows that stop early.
    # A month that could not be priced is exactly when somebody goes looking for what is
    # outstanding, and a balance that disappears on the unresolved rows is worse than one
    # that was never shown.
    r.advance_balance = master.advance_balance(staff, month)

    # 1. Employed? If not, there are three different answers and they are not
    #    interchangeable.
    if not master.employed(staff, month):
        paid = master.trial_pay.maybe(staff, month)
        if paid is not None:
            # A TRIAL. No spell, no salary, no threshold, no basis — none of those
            # ever happened, so nothing here is derived from anything. The payment
            # IS the record, and it is reported exactly as it was handed over.
            r.state = TRIAL
            r.earning = float(paid)
            r.marked_days = len(book.marks_in_month(staff, month))
            r.notes.append(
                "trial — no employment record. The payment is the record, not a "
                "figure worked out from one"
            )
            return r
        if book.marks_in_month(staff, month):
            # Attendance for somebody with no spell and no payment. This is the
            # dangerous one: it looks exactly like a trial and it is a hole. Paying
            # zero would post cleanly, reconcile, and be discovered by the person
            # who was not paid.
            r.state = UNRESOLVED
            r.notes.append(
                f"{staff}: attendance recorded in {month} with no employment spell "
                f"and no trial payment. If this was a trial, record what was paid; "
                f"the payment is the only record a trial has"
            )
            return r
        # Genuinely not here. Not an absence and not a gap.
        r.state = NOT_EMPLOYED
        return r

    # 2-5. Resolve what was in force. Zero matches is an error, not zero.
    try:
        r.basis = master.basis_of(staff, month)
    except Unresolved as exc:
        r.state, r.notes = UNRESOLVED, [str(exc)]
        return r

    marks = book.marks_in_month(staff, month)
    r.marked_days = len(marks)

    if r.basis == PIECE_RATE:
        return _piece_rate(master, r, units)

    if r.basis == HOURLY:
        return _hourly(master, r, units)

    if r.basis == DAILY_WAGE:
        # A stated daily wage. There is no monthly salary to divide and no
        # threshold to divide it by — the rate is simply given.
        try:
            r.daily_rate = float(master.daily_wage.resolve(staff, month))
        except Unresolved as exc:
            r.state, r.notes = UNRESOLVED, [str(exc)]
            return r
        r.threshold_days = float(master.threshold_days.maybe(staff, month) or 0.0)
        r.threshold_hours = float(master.threshold_hours.maybe(staff, month) or 0.0)
    else:
        try:
            r.salary = float(master.salary.resolve(staff, month))
            r.threshold_days = float(master.threshold_days.resolve(staff, month))
            r.threshold_hours = float(master.threshold_hours.resolve(staff, month))
        except Unresolved as exc:
            r.state, r.notes = UNRESOLVED, [str(exc)]
            return r
        r.daily_rate = r.salary / r.threshold_days if r.threshold_days else 0.0
    # §3.6.3 — the hourly rate is the daily rate over the person's own weekday
    # shift, not the salary over a threshold. Used by the Work Report and by
    # nothing that pays anyone.
    r.hourly_rate = _hourly_from_daily(master, staff, r.daily_rate)

    # The attendance itself. A category with no hours row stops this month and
    # says why — the same treatment a missing salary gets. It must not bring the
    # whole run down: the gate that reports it can only run if the run finishes.
    for d, code in marks.items():
        c = master.codes[code]
        r.days_equivalent += c.pay_weight
        try:
            r.productive_hours += c.hours_factor * master.shift(staff, d)
        except LookupError as exc:
            r.state, r.notes = UNRESOLVED, [str(exc)]
            return r

    # §5 — the three states. A blank month inside a spell is a tracking gap,
    # not eight people failing months they never worked.
    r.state = EMPLOYED if marks else NO_DATA
    if r.state == NO_DATA:
        r.notes.append("employed but no attendance recorded")

    if r.basis == FLAT:
        # §3.5 — "paid their full resolved monthly salary every month regardless
        # of attendance". No scaling in either direction.
        r.earning = r.salary
        r.notes.append("flat pay — attendance does not change the earning")
    else:
        # §3.5 — "pay scales up if someone works MORE than threshold, down if
        # LESS." Uncapped both ways: 30 days against a 27-day threshold pays 30.
        r.earning = r.daily_rate * r.days_equivalent

    if r.threshold_days:
        r.utilisation = r.days_equivalent / r.threshold_days
    if r.threshold_hours:
        r.utilisation_hours = r.productive_hours / r.threshold_hours
    return r


def _piece_rate(master: Master, r: MonthPay, units) -> MonthPay:
    """No salary, no threshold, no attendance row. Output times the rate for that garment.

    THE RATE IS NOT THE PERSON'S. It belongs to an operation on a garment — "Iron ·
    Anarkali 7.5", "Dhaga Cutting · Dupatta 1" — and the owner states each one once.
    So a month cannot be priced from a single number of "units": ironing 100 dupattas
    and ironing 100 anarkalis are 200 and 750, and a scalar cannot tell them apart.

    `units` is therefore a mapping of garment to count. A bare number is refused rather
    than multiplied by whichever rate happened to be found first, because that refusal
    costs somebody a question and the alternative costs them the difference.
    """
    operation = master.operation_of(r.staff)
    if operation is None:
        r.state = UNRESOLVED
        r.notes.append(
            f"{r.staff}: on piece rate, but none of their recorded roles "
            f"{list(master.person(r.staff).roles or ()) or '(none)'} is an operation the rate "
            f"card prices {master.operations()}. Record the operation, or add its rates"
        )
        return r
    r.unit_kind = PER_PIECE

    if units is None:
        r.state = NO_DATA
        r.notes.append(f"piece-rate staff with no output recorded for {r.month}")
        return r
    if not isinstance(units, dict):
        r.state = UNRESOLVED
        r.notes.append(
            f"{r.staff}: a piece-rate month needs output BY GARMENT, not one total. "
            f"{operation} is priced per garment ({', '.join(master.garments_priced(operation))}), "
            f"so a single count of {units} cannot be priced without choosing a rate for them"
        )
        return r

    total, pieces, missing = 0.0, 0.0, []
    for garment, count in units.items():
        rate = master.piece_rate_for(operation, garment, r.month)
        if rate is None:
            missing.append(str(garment))
            continue
        total += float(count) * rate
        pieces += float(count)
    if missing:
        r.state = UNRESOLVED
        r.notes.append(
            f"{r.staff}: no {operation} rate in force for {r.month} on {', '.join(missing)}. "
            f"State the rate — an unpriced garment must not be paid as zero"
        )
        return r

    r.units = pieces
    r.earning = round(total, 2)
    # §3.5 — output times rate. No threshold, no attendance, no scaling.
    r.piece_rate = round(total / pieces, 4) if pieces else 0.0
    r.state = EMPLOYED
    r.notes.append(
        f"piece-rate {operation}: {pieces:g} pieces across {len(units)} garment(s) "
        f"— no threshold applies")
    return r


def _hourly(master: Master, r: MonthPay, units) -> MonthPay:
    """A stated rate per hour, times the hours worked. A SIXTH basis, not a piece rate.

    The owner described two people who worked one year on a stated rate per hour and the
    next on piece rate, coming in on contract whenever he needs them. Two bases for the
    same person in two years is exactly why the rate and the basis are separate logs —
    reading the basis off the size of the number would have made one figure mean an hourly
    rate in one year and a per-piece rate in the next.
    """
    rate = master.hourly_rate.maybe(r.staff, r.month)
    if rate is None:
        r.state = UNRESOLVED
        r.notes.append(f"{r.staff}: hourly staff with no rate in force for {r.month}")
        return r
    r.piece_rate = float(rate.get("rate") if isinstance(rate, dict) else rate)
    r.hourly_rate = r.piece_rate
    r.unit_kind = rate.get("unit", PER_HOUR) if isinstance(rate, dict) else PER_HOUR
    if units is None:
        r.state = NO_DATA
        r.notes.append(f"hourly staff with no hours recorded for {r.month}")
        return r
    r.units = float(units)
    r.earning = round(r.units * r.piece_rate, 2)
    r.state = EMPLOYED
    what = (rate.get("operation") if isinstance(rate, dict) else None) or "work"
    r.notes.append(f"hourly {r.piece_rate:g} per hour for {what} — no threshold applies")
    return r


def fy_pay(master: Master, book: AttendanceBook, staff: str, fy,
           units_by_month: dict | None = None) -> list[MonthPay]:
    units_by_month = units_by_month or {}
    out = []
    for m in fy_months(fy):
        out.append(month_pay(master, book, staff, m, units_by_month.get(m.key)))
    return out


def _weekday_hours(master: Master, staff: str) -> float:
    """The person's own weekday shift — 10 for the men, 8 for the women.

    Read from the shift table rather than written into the formula, so a company
    whose day is not ten hours changes a table and not this file.
    """
    try:
        group = master.person(staff).group
    except LookupError:
        return 0.0
    return float(master.shift_hours.get((group, WEEKDAY), 0.0))


def blended_daily(master: Master, staff: str, fy) -> float:
    """§3.6.3 — "Blended FY Daily Rate (avg of the 12 monthly Daily Rate figures)".

    Averaged over employed months only. Averaging a twelve-month window across
    an eight-month spell understates the rate by a third, which then understates
    every design that person touched. A month they were not employed has no
    daily rate to average, so it is not a zero — it is not a month.
    """
    rates = []
    for m in fy_months(fy):
        if not master.employed(staff, m):
            continue
        try:
            basis = master.basis_of(staff, m)
        except Unresolved:
            continue
        # Neither has a monthly salary to divide into a daily rate.
        if basis in (PIECE_RATE, HOURLY):
            continue
        try:
            if basis == DAILY_WAGE:
                rates.append(float(master.daily_wage.resolve(staff, m)))
                continue
            salary = float(master.salary.resolve(staff, m))
            days = float(master.threshold_days.resolve(staff, m))
        except Unresolved:
            continue
        if days:
            rates.append(salary / days)
    return fmean(rates) if rates else 0.0


def blended_hourly(master: Master, staff: str, fy) -> float:
    """§3.6.3 — "Blended FY Hourly Rate (= Blended Daily Rate / 10 male / 8
    female — used only by Work Report)".

    Piece-rate staff have no daily rate to divide: §3.5 gives them a flat Rs/hr
    outright, and that rate is what the Work Report costs their hours at.
    """
    rates = []
    for m in fy_months(fy):
        if not master.employed(staff, m):
            continue
        try:
            basis = master.basis_of(staff, m)
        except Unresolved:
            continue
        # THE RATE COMES FROM THE HOURLY LOG, NOT THE PIECE-RATE ONE.
        # A piece rate now belongs to an operation on a garment ("Iron | Anarkali = 7.5") and is
        # not attached to a person at all, so looking one up by name returns nothing. An hourly
        # rate IS a person's — "Joginder, iron, 100 per hour" — and lives in its own log, which is
        # what lets the same person be Hourly one year and Piece-rate the next.
        if basis != HOURLY:
            continue
        rate = master.hourly_rate.maybe(staff, m)
        if rate is None:
            continue
        value = rate.get("rate") if isinstance(rate, dict) else rate
        unit = rate.get("unit", PER_HOUR) if isinstance(rate, dict) else PER_HOUR
        if unit == PER_HOUR:
            rates.append(float(value))
    if rates:
        return fmean(rates)

    hours = _weekday_hours(master, staff)
    return blended_daily(master, staff, fy) / hours if hours else 0.0


def _hourly_from_daily(master: Master, staff: str, daily_rate: float) -> float:
    hours = _weekday_hours(master, staff)
    return daily_rate / hours if hours else 0.0


class MultiYearRefused(ValueError):
    """Staff pay does not sum across financial years — §9.

    Karigar earnings are additive across years: the same design earns the same
    way. Staff pay is not, because the threshold, the salary and the basis are
    all period-specific. A "combined threshold" across two years is not a
    smaller number or a bigger one, it is a meaningless one.
    """


def piece_rate_wage(master: Master, staff: str, fy, hours: float) -> float:
    """§3.5 — hours logged against designs times the flat rate per hour.

    An FY figure and not a monthly one, because §3.2.2 is explicit that the Work
    Report those hours come from is a whole-FY aggregate with no date column.
    Spreading it over twelve months would be inventing twelve facts.

    THE RATE IS READ FROM THE HOURLY LOG. It was read from the piece-rate one, which stopped
    being a person's the moment a rate became an operation's: an entry there now addresses
    an operation on a garment, so asking it for a person's name answers nothing at all.
    This function costs HOURS, so the hourly log is the only one that can answer it.
    """
    for m in fy_months(fy):
        if not master.employed(staff, m):
            continue
        rate = master.hourly_rate.maybe(staff, m)
        if rate is None:
            continue
        value = rate.get("rate") if isinstance(rate, dict) else rate
        unit = rate.get("unit", PER_HOUR) if isinstance(rate, dict) else PER_HOUR
        if unit == PER_HOUR:
            return round(float(hours) * float(value), 2)
    return 0.0


def total_payroll(master: Master, book: AttendanceBook, fy,
                  units: dict | None = None,
                  fy_units: dict | None = None) -> dict:
    """Every person, every month of one financial year. Nothing excluded silently.

    `fy_units` carries the whole-FY hours for piece-rate staff. §4 asks for
    "Total Staff Payroll Earning (all pay bases)", and a piece-rate contractor
    whose hours are charged to designs but whose wage is missing from the
    payroll makes unallocated labour smaller than it is.
    """
    if not isinstance(fy, str) or len(str(fy).split("-")) != 2:
        raise MultiYearRefused(
            f"total_payroll takes one financial year like '2025-26', not {fy!r}. "
            f"Run each year separately and report them side by side."
        )
    units, fy_units = units or {}, fy_units or {}
    rows, by_staff, unresolved = [], {}, []
    for staff in sorted(master.people):
        got = fy_pay(master, book, staff, fy, units.get(staff))
        rows.extend(got)
        by_staff[staff] = round(sum(g.earning for g in got), 2)
        unresolved.extend(g for g in got if g.state == UNRESOLVED)
    days_based = round(sum(by_staff.values()), 2)

    piece = {}
    for staff, hours in fy_units.items():
        if staff not in master.people or not hours:
            continue
        wage = piece_rate_wage(master, staff, fy, hours)
        if wage:
            piece[staff] = wage
            by_staff[staff] = round(by_staff.get(staff, 0.0) + wage, 2)
    piece_total = round(sum(piece.values()), 2)

    return {
        "fy": str(fy),
        "rows": rows,
        "by_staff": by_staff,
        # The two halves, both named, because they answer different questions —
        # and because the days-based figure alone is what earlier reports carried.
        "days_based_total": days_based,
        "piece_rate_total": piece_total,
        "piece_rate_by_staff": piece,
        "total": round(days_based + piece_total, 2),
        "unresolved": unresolved,
    }
