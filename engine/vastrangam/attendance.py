"""Attendance codes and the attendance book — Part 4.1 and Part 5.

Paid is not the same as productive. A holiday and a paid leave both carry a full
day of pay and zero hours of work. That gap is real, and it is why unallocated
labour exists in the cost report instead of being quietly spread over designs.
"""

from __future__ import annotations

import datetime as _dt
from dataclasses import dataclass

from .calendar_util import Month, parse_date

WEEKDAY = "Weekday"
SUNDAY = "Sunday"


@dataclass(frozen=True)
class Code:
    code: str
    meaning: str
    pay_weight: float
    hours_factor: float  # of the day's shift hours


# The table is data. Add a code here, or override it on the Master, and every
# formula downstream follows — none of them names a code.
DEFAULT_CODES: dict[str, Code] = {
    "P":  Code("P",  "Present",           1.0, 1.0),
    "H":  Code("H",  "Half day",          0.5, 0.5),
    "HL": Code("HL", "Holiday",           1.0, 0.0),
    "OD": Code("OD", "On duty, offsite",  1.0, 1.0),
    "PL": Code("PL", "Paid leave",        1.0, 0.0),
    "UL": Code("UL", "Unpaid leave",      0.0, 0.0),
    "A":  Code("A",  "Absent",            0.0, 0.0),
}

# What people actually type. Blank is not here on purpose: a blank cell is a
# state, not a code, and §5 decides what it means from the employment spell.
CODE_ALIASES = {
    "P": "P", "PRESENT": "P", "1": "P", "FULL": "P",
    "H": "H", "HALF": "H", "HD": "H", "0.5": "H", "½": "H",
    "HL": "HL", "HOL": "HL", "HOLIDAY": "HL",
    "OD": "OD", "ONDUTY": "OD", "ON DUTY": "OD",
    "PL": "PL", "PAID LEAVE": "PL", "PAIDLEAVE": "PL",
    "UL": "UL", "UNPAID LEAVE": "UL", "UNPAIDLEAVE": "UL", "LWP": "UL",
    "A": "A", "ABSENT": "A", "0": "A", "AB": "A",
}


class UnknownCode(ValueError):
    """A cell held something that is not an attendance code. Never guessed."""


def read_code(value) -> str | None:
    """Normalise a written mark. Blank stays blank — that is a state, not a code."""
    if value is None:
        return None
    text = str(value).strip().upper()
    if not text or text in {"-", "--", "NA", "N/A"}:
        return None
    if text in CODE_ALIASES:
        return CODE_ALIASES[text]
    raise UnknownCode(f"not an attendance code: {value!r}")


def day_type(d: _dt.date) -> str:
    return SUNDAY if d.weekday() == 6 else WEEKDAY


class AttendanceBook:
    """Every mark, by person and date. One mark per person per day."""

    def __init__(self, codes: dict[str, Code] | None = None):
        self.codes = dict(codes or DEFAULT_CODES)
        self._marks: dict[str, dict[_dt.date, str]] = {}
        self.conflicts: list[dict] = []

    def mark(self, key: str, when, code) -> None:
        """Record one day. A second, different mark for the same day is a conflict
        — kept, flagged, and never silently overwritten."""
        d = parse_date(when)
        if d is None:
            return
        c = read_code(code)
        if c is None:
            return
        if c not in self.codes:
            raise UnknownCode(f"code {c!r} is not in the code table")
        existing = self._marks.setdefault(key, {}).get(d)
        if existing is not None and existing != c:
            self.conflicts.append(
                {"key": key, "date": d.isoformat(), "kept": existing, "rejected": c}
            )
            return
        self._marks[key][d] = c

    def get(self, key: str, when) -> str | None:
        d = parse_date(when)
        return self._marks.get(key, {}).get(d)

    def keys(self):
        return list(self._marks)

    def marks_in_month(self, key: str, month) -> dict[_dt.date, str]:
        month = Month.of(month)
        lo, hi = month.first_day, month.last_day
        return {d: c for d, c in sorted(self._marks.get(key, {}).items()) if lo <= d <= hi}

    def has_rows(self, key: str, month) -> bool:
        """Any mark at all. Distinguishes 'no data' from 'absent all month'."""
        return bool(self.marks_in_month(key, month))

    def months(self, key: str) -> list[Month]:
        return sorted({Month.of(d) for d in self._marks.get(key, {})})

    def count(self) -> int:
        return sum(len(v) for v in self._marks.values())

    def __repr__(self):
        return f"<AttendanceBook {self.count()} marks, {len(self._marks)} people>"
