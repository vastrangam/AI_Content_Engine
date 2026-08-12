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
                     PER_PIECE, PIECE_RATE, Master)
from .logs import Unresolved

NOT_EMPLOYED = "Not employed"
NO_DATA = "No Data"
EMPLOYED = "Employed"
UNRESOLVED = "Unresolvable"


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
    utilisation: float | None = None
    utilisation_hours: float | None = None
    notes: list = field(default_factory=list)

    @property
    def employed(self) -> bool:
        return self.state in (EMPLOYED, NO_DATA)

    @property
    def rated(self) -> bool:
        """Whether this month belongs in an average. Not-employed never does."""
        return self.state == EMPLOYED


def month_pay(master: Master, book: AttendanceBook, staff: str, month,
              units: float | None = None) -> MonthPay:
    """One person, one month. The only place earning is calculated."""
    month = Month.of(month)
    r = MonthPay(staff, month)

    # 1. Employed? If not, stop. This is not an absence and not a gap.
    if not master.employed(staff, month):
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
    """No salary, no threshold, no attendance row. Output times rate."""
    rate = master.piece_rate.maybe(r.staff, r.month)
    if rate is None:
        r.state = UNRESOLVED
        r.notes.append(f"piece-rate staff with no rate in force for {r.month}")
        return r
    r.piece_rate = float(rate.get("rate") if isinstance(rate, dict) else rate)
    r.unit_kind = rate.get("unit", PER_PIECE) if isinstance(rate, dict) else PER_HOUR
    r.units = float(units or 0.0)
    # §3.5 — "Wage = hours logged against designs in the Staff Report sheet x
    # their flat Rs/hr rate." No threshold, no attendance, no scaling.
    r.earning = r.units * r.piece_rate
    r.state = EMPLOYED if units is not None else NO_DATA
    if units is None:
        r.notes.append("piece-rate staff with no output recorded for the month")
    r.notes.append(f"piece-rate {r.piece_rate:g} {r.unit_kind} — no threshold applies")
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
        if basis == PIECE_RATE:
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
        if basis != PIECE_RATE:
            continue
        rate = master.piece_rate.maybe(staff, m)
        if rate is None:
            continue
        value = rate.get("rate") if isinstance(rate, dict) else rate
        unit = rate.get("unit", PER_PIECE) if isinstance(rate, dict) else PER_HOUR
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
    """
    for m in fy_months(fy):
        if not master.employed(staff, m):
            continue
        rate = master.piece_rate.maybe(staff, m)
        if rate is None:
            continue
        value = rate.get("rate") if isinstance(rate, dict) else rate
        unit = rate.get("unit", PER_PIECE) if isinstance(rate, dict) else PER_HOUR
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
