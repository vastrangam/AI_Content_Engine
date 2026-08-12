"""Months, dates and financial years.

Indian conventions throughout: DD-MM-YYYY on input, financial year runs April to March.
Nothing here knows a person, a rate or a policy — it is arithmetic only.
"""

from __future__ import annotations

import calendar
import datetime as _dt
import re
from dataclasses import dataclass

# Excel's day 1 is 1900-01-01, and Excel wrongly believes 1900 was a leap year,
# so serials from 61 onward line up with this epoch.
_EXCEL_EPOCH = _dt.date(1899, 12, 30)

_ISO = re.compile(r"^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$")
_DMY = re.compile(r"^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$")


class DateError(ValueError):
    """A value that was meant to be a date could not be read as one."""


def parse_date(value):
    """Read a date from anything a spreadsheet might hand us. None stays None.

    Four digits first means ISO. Otherwise it is DD-MM-YYYY, because that is what
    the source files use, and guessing per-row would silently swap day and month
    on the twelve days a month where both readings are valid.
    """
    if value is None:
        return None
    if isinstance(value, _dt.datetime):
        return value.date()
    if isinstance(value, _dt.date):
        return value
    if isinstance(value, bool):
        raise DateError(f"not a date: {value!r}")
    if isinstance(value, (int, float)):
        serial = int(value)
        if serial < 1:
            raise DateError(f"not a date serial: {value!r}")
        return _EXCEL_EPOCH + _dt.timedelta(days=serial)

    text = str(value).strip()
    if not text:
        return None
    text = text.split(" ")[0].split("T")[0]

    m = _ISO.match(text)
    if m:
        y, mo, d = (int(x) for x in m.groups())
        return _make(y, mo, d, text)

    m = _DMY.match(text)
    if m:
        d, mo, y = (int(x) for x in m.groups())
        if y < 100:
            y += 2000 if y < 70 else 1900
        return _make(y, mo, d, text)

    raise DateError(f"not a date: {value!r}")


def _make(y, mo, d, text):
    try:
        return _dt.date(y, mo, d)
    except ValueError as exc:
        raise DateError(f"not a date: {text!r} ({exc})") from exc


def looks_like_date(value) -> bool:
    """True when the cell carries a date. Used by structural header detection."""
    try:
        return parse_date(value) is not None
    except DateError:
        return False


@dataclass(frozen=True, order=True)
class Month:
    """A calendar month. Comparable, hashable, and the unit every rule resolves on."""

    year: int
    month: int

    def __post_init__(self):
        if not 1 <= self.month <= 12:
            raise ValueError(f"month out of range: {self.month}")

    @staticmethod
    def of(value) -> "Month":
        """From a Month, a date, or a 'YYYY-MM' / 'YYYY-MM-DD' string."""
        if isinstance(value, Month):
            return value
        if isinstance(value, (_dt.date, _dt.datetime)):
            d = value.date() if isinstance(value, _dt.datetime) else value
            return Month(d.year, d.month)
        text = str(value).strip()
        m = re.match(r"^(\d{4})[-/](\d{1,2})$", text)
        if m:
            return Month(int(m.group(1)), int(m.group(2)))
        return Month.of(parse_date(text))

    @property
    def first_day(self) -> _dt.date:
        return _dt.date(self.year, self.month, 1)

    @property
    def last_day(self) -> _dt.date:
        return _dt.date(self.year, self.month, calendar.monthrange(self.year, self.month)[1])

    @property
    def days(self) -> int:
        return calendar.monthrange(self.year, self.month)[1]

    def dates(self):
        for i in range(self.days):
            yield self.first_day + _dt.timedelta(days=i)

    def next(self) -> "Month":
        return Month(self.year + (self.month == 12), self.month % 12 + 1)

    def prev(self) -> "Month":
        return Month(self.year - (self.month == 1), (self.month - 2) % 12 + 1)

    @property
    def key(self) -> str:
        return f"{self.year:04d}-{self.month:02d}"

    @property
    def label(self) -> str:
        return f"{calendar.month_abbr[self.month]} {self.year}"

    def __str__(self):
        return self.key


def fy_of(value) -> str:
    """The financial year a month falls in, as 'YYYY-YY'. April starts it."""
    m = Month.of(value)
    start = m.year if m.month >= 4 else m.year - 1
    return f"{start}-{str(start + 1)[2:]}"


def fy_months(fy: str):
    """The twelve months of a financial year, April first. Accepts '2025-26' or '2025'."""
    start = int(str(fy).strip().split("-")[0])
    m = Month(start, 4)
    for _ in range(12):
        yield m
        m = m.next()


def months_between(first, last):
    """Every month from first to last inclusive."""
    a, b = Month.of(first), Month.of(last)
    if b < a:
        return
    while a <= b:
        yield a
        a = a.next()


def day_before(d: _dt.date) -> _dt.date:
    return d - _dt.timedelta(days=1)
