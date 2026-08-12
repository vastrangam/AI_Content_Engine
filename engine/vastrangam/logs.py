"""Effective-dated logs — Part 2 and Part 3 of the spec.

A value is never overwritten. The open row is closed and a new one appended, so
history stays intact and a future-dated row activates by itself when that month
is reached.

Zero matches is an error, not zero. Silently returning 0 is how a person earns
nothing without anyone noticing.
"""

from __future__ import annotations

import datetime as _dt
from dataclasses import dataclass, field
from typing import Any, Iterable

from .calendar_util import Month, day_before, parse_date

FOREVER = _dt.date(9999, 12, 31)


class Unresolved(LookupError):
    """No row in this log covers that month. The month is unresolvable."""

    def __init__(self, log: str, key: str, month: Month):
        self.log, self.key, self.month = log, key, month
        super().__init__(f"{log}: nothing in force for {key!r} in {month}")


class Ambiguous(LookupError):
    """More than one row covers that month. The log contradicts itself."""

    def __init__(self, log: str, key: str, month: Month, rows):
        self.log, self.key, self.month, self.rows = log, key, month, rows
        spans = " / ".join(r.span for r in rows)
        super().__init__(f"{log}: {len(rows)} rows in force for {key!r} in {month} -> {spans}")


@dataclass(frozen=True)
class LogRow:
    key: str
    frm: _dt.date
    to: _dt.date | None
    value: Any

    @property
    def open(self) -> bool:
        return self.to is None

    @property
    def end(self) -> _dt.date:
        return self.to or FOREVER

    @property
    def span(self) -> str:
        return f"{self.frm.isoformat()}..{'open' if self.open else self.to.isoformat()}"

    def covers_month(self, month: Month) -> bool:
        return self.frm <= month.last_day and self.end >= month.first_day

    def covers_date(self, d: _dt.date) -> bool:
        return self.frm <= d <= self.end

    def days_in(self, month: Month) -> int:
        """How many days of the month this row is actually in force for."""
        lo = max(self.frm, month.first_day)
        hi = min(self.end, month.last_day)
        return max(0, (hi - lo).days + 1)


class EffectiveLog:
    """One effective-dated log. Keyed by staff id, karigar id — whatever it tracks."""

    def __init__(self, name: str):
        self.name = name
        self._rows: dict[str, list[LogRow]] = {}

    # -- writing -------------------------------------------------------------

    def set_value(self, key: str, frm, value) -> LogRow:
        """The only way policy changes. Close the open row, append the new one.

        Rows that already ended are never touched. A from-date earlier than the
        open row's start would rewrite history, so it is refused.
        """
        frm = parse_date(frm)
        if frm is None:
            raise ValueError(f"{self.name}: set_value needs a from-date for {key!r}")
        rows = self._rows.setdefault(key, [])
        for i, row in enumerate(rows):
            if row.open:
                if frm <= row.frm:
                    raise ValueError(
                        f"{self.name}: {key!r} already opens at {row.frm} — "
                        f"cannot start a new row at {frm} without rewriting history"
                    )
                rows[i] = LogRow(key, row.frm, day_before(frm), row.value)
        row = LogRow(key, frm, None, value)
        rows.append(row)
        rows.sort(key=lambda r: r.frm)
        return row

    def add(self, key: str, frm, to, value) -> LogRow:
        """Load a closed row verbatim. Used by importers replaying known history."""
        row = LogRow(key, parse_date(frm), parse_date(to), value)
        if row.to and row.to < row.frm:
            raise ValueError(f"{self.name}: {key!r} ends {row.to} before it starts {row.frm}")
        rows = self._rows.setdefault(key, [])
        rows.append(row)
        rows.sort(key=lambda r: r.frm)
        return row

    def load(self, entries: Iterable[dict]) -> "EffectiveLog":
        """Bulk load. Each entry is {key, from, to?, value}."""
        for e in entries:
            self.add(e["key"], e["from"], e.get("to"), e["value"])
        return self

    # -- reading -------------------------------------------------------------

    def keys(self):
        return list(self._rows)

    def rows(self, key: str | None = None) -> list[LogRow]:
        if key is None:
            return [r for rs in self._rows.values() for r in rs]
        return list(self._rows.get(key, ()))

    def overlapping(self, key: str, month) -> list[LogRow]:
        month = Month.of(month)
        return [r for r in self._rows.get(key, ()) if r.covers_month(month)]

    def resolve(self, key: str, month) -> Any:
        """The value in force for that month. Exactly one row must match."""
        return self.resolve_row(key, month).value

    def resolve_row(self, key: str, month) -> LogRow:
        month = Month.of(month)
        hits = self.overlapping(key, month)
        if not hits:
            raise Unresolved(self.name, key, month)
        if len(hits) > 1:
            raise Ambiguous(self.name, key, month, hits)
        return hits[0]

    def maybe(self, key: str, month, default=None):
        """For genuinely optional logs only — a piece rate for a salaried person.

        Never use this to paper over a missing salary or threshold. A missing
        mandatory value must reach the caller as Unresolved.
        """
        try:
            return self.resolve(key, month)
        except Unresolved:
            return default

    def segments(self, key: str, month) -> list[tuple[LogRow, int]]:
        """Every row touching the month with the days it was in force.

        `resolve` demands one row because pay is a monthly figure. When a value
        genuinely changes mid-month the log is ambiguous by design — this is how
        a report shows why, and how proration could be added without guessing.
        """
        month = Month.of(month)
        return [(r, r.days_in(month)) for r in self.overlapping(key, month)]

    def on(self, key: str, when) -> Any:
        """The value in force on a single date. Used by daily rules, not pay."""
        d = parse_date(when)
        for r in self._rows.get(key, ()):
            if r.covers_date(d):
                return r.value
        raise Unresolved(self.name, key, Month.of(d))

    def to_json(self) -> list[dict]:
        out = []
        for r in sorted(self.rows(), key=lambda r: (r.key, r.frm)):
            out.append(
                {
                    "key": r.key,
                    "from": r.frm.isoformat(),
                    "to": r.to.isoformat() if r.to else None,
                    "value": r.value,
                }
            )
        return out

    def __len__(self):
        return sum(len(v) for v in self._rows.values())

    def __repr__(self):
        return f"<EffectiveLog {self.name}: {len(self)} rows, {len(self._rows)} keys>"


@dataclass
class Spell:
    """One period of employment. A person may have many — they leave and return."""

    key: str
    joined: _dt.date
    left: _dt.date | None = None

    def covers(self, month) -> bool:
        month = Month.of(month)
        end = self.left or _dt.date(9999, 12, 31)
        return self.joined <= month.last_day and end >= month.first_day

    @property
    def span(self) -> str:
        return f"{self.joined.isoformat()}..{'open' if not self.left else self.left.isoformat()}"


class SpellLog:
    """Employment spells. Deliberately not an EffectiveLog: gaps are meaningful,
    overlaps are not, and 'not employed' is an answer rather than an error."""

    def __init__(self, name: str = "employment"):
        self.name = name
        self._spells: dict[str, list[Spell]] = {}

    def join(self, key: str, joined, left=None) -> Spell:
        s = Spell(key, parse_date(joined), parse_date(left))
        if s.left and s.left < s.joined:
            raise ValueError(f"{key!r} left {s.left} before joining {s.joined}")
        for other in self._spells.get(key, ()):
            if _overlap(s, other):
                raise ValueError(f"{key!r} has overlapping spells {other.span} and {s.span}")
        self._spells.setdefault(key, []).append(s)
        self._spells[key].sort(key=lambda x: x.joined)
        return s

    def leave(self, key: str, left) -> Spell:
        """Close the open spell. Returning later is a new spell, not an edit."""
        left = parse_date(left)
        for s in self._spells.get(key, ()):
            if s.left is None:
                s.left = left
                return s
        raise LookupError(f"{key!r} has no open spell to close")

    def spells(self, key: str) -> list[Spell]:
        return list(self._spells.get(key, ()))

    def keys(self):
        return list(self._spells)

    def employed(self, key: str, month) -> bool:
        return any(s.covers(month) for s in self._spells.get(key, ()))

    def employed_months(self, key: str, months) -> list[Month]:
        return [m for m in months if self.employed(key, m)]

    def to_json(self) -> list[dict]:
        return [
            {"key": s.key, "joined": s.joined.isoformat(),
             "left": s.left.isoformat() if s.left else None}
            for k in sorted(self._spells)
            for s in self._spells[k]
        ]

    def __len__(self):
        return sum(len(v) for v in self._spells.values())


def _overlap(a: Spell, b: Spell) -> bool:
    a_end = a.left or _dt.date(9999, 12, 31)
    b_end = b.left or _dt.date(9999, 12, 31)
    return a.joined <= b_end and b.joined <= a_end
