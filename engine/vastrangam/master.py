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

        # WEEKLY OFF — how many Sundays a month this person does not work.
        #
        # The owner: "2 Sunday every month as week off, only for Karim and Ibrahim,
        # from Nov 2025 till present." It is per person and dated, exactly like every
        # other policy here, because a weekly-off arrangement given to two people is
        # not a company rule and must not become one.
        #
        # IT DOES NOT COMPUTE THE THRESHOLD, AND MUST NOT.
        # Those two also moved from a 280-hour month to 270 on the same date, and
        # 280 - 2 x 5.0 (the male Sunday shift) is exactly 270. That agreement is
        # worth CHECKING and is not a derivation: the threshold is a number the owner
        # states, and a system that recomputed it would silently change somebody's
        # month the next time a shift table was edited. Two facts, both recorded,
        # cross-checked by a test.
        self.weekly_off = EffectiveLog("weekly_off")

        # LEAVE — employed, and not working this month.
        #
        # A spell log rather than an effective-dated value, for the same reason
        # employment is one: a gap is meaningful and "not on leave" is an answer
        # rather than an error. Leave sits INSIDE an employment spell; it never
        # closes one. Somebody on a month's leave has not left.
        self.leave = SpellLog("leave")

        # TRIAL PAY — what was actually handed to somebody who has no employment
        # spell at all.
        #
        # "Staff Trial: can be anyone who worked for few days or weeks and left and
        # we paid." No joining date, no leaving date, no salary, because none of
        # those ever happened. So nothing about a trial can be DERIVED, and the
        # payment itself is the whole record. Keyed by person, dated to the month
        # it was paid in.
        self.trial_pay = EffectiveLog("trial_pay")

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

        # People the source names as piece-rate and never gives a rate for, each
        # with the reason. This is NOT permission to pay them zero — month_pay
        # still reports Unresolvable. It is the difference between "the rate is
        # missing and nobody noticed" and "the rate was never stated, here is
        # where we looked", which is the difference between a build failure and
        # a standing open question.
        self.no_rate_stated: dict[str, str] = {}

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
        # Matched on the normalised words, so "Male" in Staff Master finds
        # "male" in Hours Reference without either file being rewritten.
        table = {(normalise(g), normalise(t)): h for (g, t), h in self.shift_hours.items()}
        for key in ((group, kind), (group, "*"), ("*", kind), ("*", "*")):
            got = table.get((normalise(key[0]), normalise(key[1])))
            if got is not None:
                return got
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

    def on_leave(self, ident: str, month) -> bool:
        """Employed, and not working this month. Not the same as absent, and not
        the same as having left — a month on leave is neither a bad month nor a
        month outside somebody's employment."""
        return self.leave.employed(ident, month)

    def sundays_off(self, ident: str, month) -> float:
        """Sundays a month this person does not work. No row means none — that is
        the ordinary arrangement here, and an arrangement nobody was given is a
        real answer rather than a missing one."""
        got = self.weekly_off.maybe(ident, month)
        return 0.0 if got is None else float(got)

    def on_trial(self, ident: str, month) -> bool:
        """Never employed, and paid anyway. The payment is the record."""
        return (not self.employed(ident, month)
                and self.trial_pay.maybe(ident, month) is not None)

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
            "weekly_off": self.weekly_off.to_json(),
            "trial_pay": self.trial_pay.to_json(),
            "leave": self.leave.to_json(),
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
        for s_ in data.get("leave", []):
            m.leave.join(s_["key"], s_["joined"], s_.get("left"))
        for name in ("pay_basis", "salary", "daily_wage", "threshold_days",
                     "threshold_hours", "piece_rate", "weekly_off", "trial_pay"):
            getattr(m, name).load(data.get(name, []))
        if data.get("shift_hours"):
            m.shift_hours = {
                (r["group"], r["day_type"]): float(r["hours"]) for r in data["shift_hours"]
            }
        if data.get("bands"):
            m.bands.update(data["bands"])
        if data.get("non_person_columns"):
            m.non_person_columns = {normalise(c) for c in data["non_person_columns"]}
        m.no_rate_stated = {
            k: v for k, v in (data.get("_no_rate_stated") or {}).items()
            if not k.startswith("_")
        }
        return m

    def save(self, path) -> Path:
        path = Path(path)
        path.write_text(json.dumps(self.to_json(), indent=2, ensure_ascii=False), encoding="utf-8")
        return path

    def __repr__(self):
        return (f"<Master {len(self.people)} people, "
                f"{len(self.employment)} spells, {len(self.salary)} salary rows>")
