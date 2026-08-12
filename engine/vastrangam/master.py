"""Master data — the six effective-dated logs, the alias table, the shift table.

Every rule in the engine reads from here. Nothing reads from a literal.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from .attendance import DEFAULT_CODES, SUNDAY, WEEKDAY, Code, day_type
from .calendar_util import Month, parse_date
from .logs import EffectiveLog, SpellLog, Unresolved
from .names import AliasTable, normalise

FLAT = "Flat"
ATTENDANCE = "Attendance"
DAILY_WAGE = "Daily-wage"
PIECE_RATE = "Piece-rate"
BASES = (FLAT, ATTENDANCE, DAILY_WAGE, PIECE_RATE)

# Attendance and Daily-wage share one formula — rate x days-equivalent. They
# differ only in where the rate comes from: derived from the salary and the day
# threshold, or stated outright as a daily wage.
DAY_SCALED = (ATTENDANCE, DAILY_WAGE)

ACTIVE = "Active"
INACTIVE = "Inactive"

PER_HOUR = "per_hour"
PER_PIECE = "per_piece"

NEEDS_SETUP = "NEEDS_SETUP"


@dataclass
class Person:
    id: str
    name: str
    gender: str = "M"
    shift_group: str | None = None   # defaults to gender; kept separate so a
    roles: list = field(default_factory=list)   # shift change is not a sex change
    status: str = "OK"               # OK | NEEDS_SETUP — is this record usable
    roster: str = ACTIVE             # Active | Inactive — is this person current

    @property
    def group(self) -> str:
        return self.shift_group or self.gender


@dataclass
class Review:
    """Nothing is ever dropped. It lands here with a reason."""

    what: str
    reason: str
    where: str = ""
    detail: dict = field(default_factory=dict)


class Master:
    def __init__(self):
        self.people: dict[str, Person] = {}
        self.alias = AliasTable()

        self.employment = SpellLog("employment")
        self.pay_basis = EffectiveLog("pay_basis")
        self.salary = EffectiveLog("salary")
        self.daily_wage = EffectiveLog("daily_wage")
        self.threshold_days = EffectiveLog("threshold_days")
        self.threshold_hours = EffectiveLog("threshold_hours")
        self.piece_rate = EffectiveLog("piece_rate")

        # Shift hours are a lookup table, never a literal inside a formula.
        # Male 10h weekday / 5h Sunday. Female 8h weekday / 5.5h Sunday
        # (09:30-15:30 less the half-hour lunch, which applies every day).
        self.shift_hours: dict[tuple[str, str], float] = {
            ("M", WEEKDAY): 10.0, ("M", SUNDAY): 5.0,
            ("F", WEEKDAY): 8.0,  ("F", SUNDAY): 5.5,
        }
        self.codes: dict[str, Code] = dict(DEFAULT_CODES)
        self.bands = {"satisfactory": 0.90, "average": 0.70}
        # Column headings that are never a person. A table, not a rule, so a new
        # one is an entry here rather than an edit to the parser.
        self.non_person_columns = {
            "date", "day", "days", "weekday", "month", "year", "total", "totals",
            "remark", "remarks", "note", "notes", "sr", "sr no", "s no", "sl no",
            "serial", "present", "absent", "holiday", "summary",
        }
        self.review: list[Review] = []

    # -- people --------------------------------------------------------------

    def add_person(self, ident, name=None, gender="M", aliases=(), shift_group=None,
                   roles=(), status="OK", roster=ACTIVE) -> Person:
        p = Person(ident, name or ident, gender, shift_group, list(roles), status, roster)
        self.people[ident] = p
        self.alias.register(ident, name or ident, *aliases, display=p.name)
        return p

    def resolve_person(self, name, where: str = "") -> str:
        """A written name to an id. Unknown names become provisional, never dropped
        and never guessed — payroll is blocked for them until someone confirms."""
        ident = self.alias.lookup(name)
        if ident:
            return ident
        ident = f"?{str(name).strip()}"
        if ident not in self.people:
            self.add_person(ident, str(name).strip(), status=NEEDS_SETUP)
            self.flag(
                str(name).strip(),
                "name has no master record — payroll blocked until it is set up",
                where,
                {"near_matches": self.alias.propose(name)},
            )
        return ident

    def person(self, ident: str) -> Person:
        try:
            return self.people[ident]
        except KeyError:
            raise LookupError(f"no such person: {ident!r}") from None

    def flag(self, what, reason, where="", detail=None) -> Review:
        r = Review(str(what), reason, where, detail or {})
        self.review.append(r)
        return r

    # -- policy --------------------------------------------------------------

    def shift(self, ident: str, d) -> float:
        """Shift hours for one person on one date.

        A company where everyone works the same hours has one row with the
        category and day type left blank — '*' here — and it applies to all.
        A category with no row at all is an error, never a silent zero (§4.5).
        """
        d = parse_date(d)
        group = self.person(ident).group
        kind = day_type(d)
        for key in ((group, kind), (group, "*"), ("*", kind), ("*", "*")):
            if key in self.shift_hours:
                return self.shift_hours[key]
        raise LookupError(
            f"no Hours Reference row matches category {group!r} on a {kind} — "
            f"add one rather than letting the hours read as zero"
        )

    def basis_of(self, ident: str, month) -> str:
        b = self.pay_basis.resolve(ident, month)
        if b not in BASES:
            raise ValueError(f"{ident}: unknown pay basis {b!r} in {month}")
        return b

    def employed(self, ident: str, month) -> bool:
        return self.employment.employed(ident, month)

    def active_in(self, months) -> list[str]:
        return [i for i in sorted(self.people) if any(self.employed(i, m) for m in months)]

    # -- persistence ---------------------------------------------------------

    def to_json(self) -> dict:
        return {
            "people": [
                {"id": p.id, "name": p.name, "gender": p.gender,
                 "shift_group": p.shift_group, "roles": p.roles, "status": p.status,
                 "roster": p.roster, "aliases": self.alias.aliases(p.id)}
                for p in (self.people[i] for i in sorted(self.people))
            ],
            "employment": self.employment.to_json(),
            "pay_basis": self.pay_basis.to_json(),
            "salary": self.salary.to_json(),
            "daily_wage": self.daily_wage.to_json(),
            "threshold_days": self.threshold_days.to_json(),
            "threshold_hours": self.threshold_hours.to_json(),
            "piece_rate": self.piece_rate.to_json(),
            "shift_hours": [
                {"group": g, "day_type": t, "hours": h}
                for (g, t), h in sorted(self.shift_hours.items())
            ],
            "bands": self.bands,
            "non_person_columns": sorted(self.non_person_columns),
        }

    @staticmethod
    def from_json(data) -> "Master":
        if isinstance(data, (str, Path)):
            data = json.loads(Path(data).read_text(encoding="utf-8"))
        m = Master()
        for p in data.get("people", []):
            m.add_person(
                p["id"], p.get("name"), p.get("gender", "M"), p.get("aliases", ()),
                p.get("shift_group"), p.get("roles", ()), p.get("status", "OK"),
                p.get("roster", ACTIVE),
            )
        for s in data.get("employment", []):
            m.employment.join(s["key"], s["joined"], s.get("left"))
        for name in ("pay_basis", "salary", "daily_wage", "threshold_days",
                     "threshold_hours", "piece_rate"):
            getattr(m, name).load(data.get(name, []))
        if data.get("shift_hours"):
            m.shift_hours = {
                (r["group"], r["day_type"]): float(r["hours"]) for r in data["shift_hours"]
            }
        if data.get("bands"):
            m.bands.update(data["bands"])
        if data.get("non_person_columns"):
            m.non_person_columns = {normalise(c) for c in data["non_person_columns"]}
        return m

    def save(self, path) -> Path:
        path = Path(path)
        path.write_text(json.dumps(self.to_json(), indent=2, ensure_ascii=False), encoding="utf-8")
        return path

    def __repr__(self):
        return (f"<Master {len(self.people)} people, "
                f"{len(self.employment)} spells, {len(self.salary)} salary rows>")
