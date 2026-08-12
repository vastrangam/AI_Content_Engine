"""Staff pay — Part 3, 4 and 5.

Two divisors, on purpose:

    daily_rate  = salary / threshold_days
    hourly_rate = salary / threshold_hours

For the men these agree, because 28 days x 10 hours is the 280-hour threshold.
For the women they do not: 28 x 8 is 224, and the hours threshold is 230. So the
hourly rate is never derived from the daily rate, and the daily rate is never
derived from the hourly one.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from statistics import fmean

from .attendance import AttendanceBook, day_type
from .calendar_util import Month, fy_months
from .master import ATTENDANCE, FLAT, PER_HOUR, PER_PIECE, PIECE_RATE, Master
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
    earning: float = 0.0
    utilisation: float | None = None
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

    try:
        r.salary = float(master.salary.resolve(staff, month))
        r.threshold_days = float(master.threshold_days.resolve(staff, month))
        r.threshold_hours = float(master.threshold_hours.resolve(staff, month))
    except Unresolved as exc:
        r.state, r.notes = UNRESOLVED, [str(exc)]
        return r

    r.daily_rate = r.salary / r.threshold_days if r.threshold_days else 0.0
    r.hourly_rate = r.salary / r.threshold_hours if r.threshold_hours else 0.0

    # The attendance itself.
    for d, code in marks.items():
        c = master.codes[code]
        r.days_equivalent += c.pay_weight
        r.productive_hours += c.hours_factor * master.shift(staff, d)

    # §5 — the three states. A blank month inside a spell is a tracking gap,
    # not eight people failing months they never worked.
    r.state = EMPLOYED if marks else NO_DATA
    if r.state == NO_DATA:
        r.notes.append("employed but no attendance recorded")

    if r.basis == FLAT:
        # Flat means flat. Not scaled up for overtime, not scaled down for absence.
        r.earning = r.salary
        r.notes.append("flat pay — attendance does not change the earning")
    else:
        # Uncapped in both directions: 30 days on a 27-day threshold pays for 30.
        r.earning = r.daily_rate * r.days_equivalent

    if r.threshold_days:
        r.utilisation = r.days_equivalent / r.threshold_days
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


def blended_hourly(master: Master, staff: str, fy) -> float:
    """One rate for a whole-FY aggregate that carries no dates.

    Averaged over employed months only. Averaging a twelve-month window across
    an eight-month spell understates the rate, which then understates every
    design that person touched.
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
            rate = master.piece_rate.maybe(staff, m)
            if rate is None:
                continue
            value = rate.get("rate") if isinstance(rate, dict) else rate
            unit = rate.get("unit", PER_PIECE) if isinstance(rate, dict) else PER_HOUR
            if unit == PER_HOUR:
                rates.append(float(value))
            continue
        try:
            salary = float(master.salary.resolve(staff, m))
            hours = float(master.threshold_hours.resolve(staff, m))
        except Unresolved:
            continue
        if hours:
            rates.append(salary / hours)
    return fmean(rates) if rates else 0.0


def total_payroll(master: Master, book: AttendanceBook, fy,
                  units: dict | None = None) -> dict:
    """Every person, every month of the FY. Nothing is excluded silently."""
    units = units or {}
    rows, by_staff, unresolved = [], {}, []
    for staff in sorted(master.people):
        got = fy_pay(master, book, staff, fy, units.get(staff))
        rows.extend(got)
        by_staff[staff] = round(sum(g.earning for g in got), 2)
        unresolved.extend(g for g in got if g.state == UNRESOLVED)
    return {
        "fy": str(fy),
        "rows": rows,
        "by_staff": by_staff,
        "total": round(sum(by_staff.values()), 2),
        "unresolved": unresolved,
    }
