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
# A FIFTH BASIS, because the owner named one the other four cannot express.
# Joginder was "100 rs per hour rate for iron" in FY2025-26 and on piece rate from FY2026-27.
# That is not Daily-wage (the day is not the unit), not Piece-rate (the piece is not the unit),
# and not Attendance (there is no monthly salary to divide). Folding it into any of them would
# make the wrong number look right — and the basis CHANGES for the same person the next year,
# which is exactly why the basis is an effective-dated row rather than a property of a person.
HOURLY = "Hourly"
BASES = (FLAT, ATTENDANCE, DAILY_WAGE, PIECE_RATE, HOURLY)

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
    # RELIGION DECIDES HOLIDAYS AND NOTHING ELSE.
    # The owner: "RELIGION FOR HOLIDAY PURPOSE". None means NOT RECORDED, which is
    # not a default and not a guess — an observance for one religion, matched
    # against somebody with None here, raises and names them rather than quietly
    # granting or withholding a paid day. gates.religion_only_decides_holidays()
    # fails the build if this field is read by anything computing pay, hours,
    # performance or permission.
    religion: str | None = None

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

        # ── the three logs added when the owner supplied the rest of the roster ──
        # hourly_rate is a SECOND BASIS, not a second rate: Joginder was 100/hour for iron in
        # FY2025-26 and on piece rate from FY2026-27. Two logs, so the engine can say which basis
        # applied in a month rather than inferring it from the size of the number.
        self.hourly_rate = EffectiveLog("hourly_rate")
        # An advance is money already handed over, carried as a balance against the person and
        # recovered from later payouts. It is NEVER a line inside salary.
        self.advance = EffectiveLog("advance")
        self.advance_recovered: dict[str, float] = {}
        # The clock behind the hours, so a shift of 10.0 can show it is 09:30-20:00 less a 30
        # minute unpaid break rather than a figure somebody typed.
        self.shift_clock: list = []
        # A person whose own clock differs from their group's. Sanjana and Kalyani work neither
        # the male nor the female shift; Esadul's Sunday carries no lunch break.
        self.shift_hours_by_person: dict = {}

        # WHO WAS ON THE FLOOR, AND ON WHAT DATE THAT WAS TRUE.
        # A roster list with no as-of date cannot close anybody's spell, so the date is
        # kept beside the list rather than assumed to be "now" — "now" moves, and a
        # person's employment must not move with it.
        self.roster_snapshot: str | None = None
        # People who are gone and for whom no leaving date was ever stated. Their spell
        # stays open; departure_is_unresolved() is what reads this.
        self.departure_undated: set[str] = set()

        # Shift hours are a lookup table, never a literal inside a formula.
        # Male 10h weekday / 5h Sunday. Female 8h weekday / 5.5h Sunday
        # (09:30-15:30 less the half-hour lunch, which applies every day).
        self.shift_hours: dict[tuple[str, str], float] = {
            ("M", WEEKDAY): 10.0, ("M", SUNDAY): 5.0,
            ("F", WEEKDAY): 8.0,  ("F", SUNDAY): 5.5,
        }
        # THE HOLIDAY CALENDAR. Empty means "nothing configured yet", which is
        # reported as exactly that — never as "this business observes no holidays",
        # which is a different statement and a false one.
        self.holidays: list[dict] = []
        self.holiday_policy: dict = {"paid_by_default": True, "half_day_allowed": True}

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

        # A rate that RAN and then STOPPED, with nothing stated for after it.
        # Deliberately a second dict rather than more entries in the one above:
        # no_rate_stated means "never had a rate at all", the self-test reads it
        # that way, and folding a second meaning in made both readings wrong. The
        # gate treats the two alike — an absence with a written reason is reported,
        # not fatal — and only this file knows they are two different facts.
        self.rate_ended_no_successor: dict[str, str] = {}

    # -- people --------------------------------------------------------------

    def add_person(self, ident, name=None, gender="M", aliases=(), shift_group=None,
                   roles=(), status="OK", roster=ACTIVE, religion=None) -> Person:
        p = Person(ident, name or ident, gender, shift_group, list(roles), status, roster,
                   religion)
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
        # A PERSON'S OWN ROW WINS, AND IS THE REASON THIS IS NOT A GENDER TABLE.
        # Sanjana and Kalyani work 09:00-17:30 with a 09:00-13:00 Sunday — neither the male
        # clock nor the female one — and Esadul's Sunday carries no lunch break at all. Their
        # shift_group was 'Packing', which had no Hours Reference row, so the gate correctly
        # refused to price their day. Inventing a 'Packing' category would have been wrong
        # twice: it is not a category anybody works, and the next person put in Packing would
        # silently inherit two other people's hours.
        mine = {(normalise(k), normalise(t)): h
                for (k, t), h in self.shift_hours_by_person.items()}
        for key in ((ident, kind), (ident, "*")):
            got = mine.get((normalise(key[0]), normalise(key[1])))
            if got is not None:
                return got
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

    # ── piece rates, which belong to an operation on a garment ───────────────

    def operations(self) -> list[str]:
        """Every operation the rate card prices, read from the card itself."""
        return sorted({str(k).split("|")[0] for k in self.piece_rate.keys()})

    def garments_priced(self, operation: str) -> list[str]:
        pre = normalise(operation)
        return sorted(str(k).split("|", 1)[1] for k in self.piece_rate.keys()
                      if normalise(str(k).split("|")[0]) == pre and "|" in str(k))

    def piece_rate_for(self, operation: str, garment: str, month) -> float | None:
        """The rate for one operation on one garment in one month, or None.

        Matched on the normalised words so 'Dhaga cutting' in a production sheet finds
        'Dhaga Cutting' on the rate card. A miss is None and never zero: an operation
        priced at nothing is a rate somebody meant to state, and paying it as zero is
        the failure this whole log exists to prevent.
        """
        op, want = normalise(operation), normalise(garment)
        mine = [(str(k).split("|", 1), k) for k in self.piece_rate.keys() if "|" in str(k)]
        mine = [(p[1], k) for p, k in mine if normalise(p[0]) == op]

        def value(key):
            got = self.piece_rate.maybe(key, month)
            if got is None:
                return None
            return float(got.get("rate") if isinstance(got, dict) else got)

        for name, key in mine:
            if normalise(name) == want:
                return value(key)

        # A CARD ENTRY MAY NAME SEVERAL GARMENTS AT ONE RATE, and the owner writes them
        # exactly that way: "Anarkali/Kurti/Kurta 1.5", "Uniform Shirt/Pant 1.5". A
        # production sheet says "Anarkali". Refusing that would refuse a garment he
        # actually priced, so each alternative in a slash-list is matched too.
        #
        # BUT ONLY WHEN EXACTLY ONE ENTRY CLAIMS IT. Splitting this operation's card
        # gives "Pant" from both "Uniform Shirt/Pant" and "Pant/Plazo/Bottom", at two
        # different rates. Picking either is a coin toss with somebody's wages on it, so
        # an ambiguous name returns None and the caller reports it — the same answer a
        # garment nobody priced gets, for the same reason.
        claimed = [key for name, key in mine
                   if want in {normalise(a) for a in str(name).split("/")}]
        if len(claimed) == 1:
            return value(claimed[0])
        return None

    def operation_of(self, ident: str, logged=None) -> str | None:
        """Which priced operation this person did — from the production log first.

        THE LOG WINS, AND THAT IS THE OWNER'S OWN RULE. Of the one person on piece rate
        for whom he named no work, he wrote: "use the process she is logged against."
        So the operation is not an attribute of a person at all. It is a fact about the
        month, read off the Staff Report's process row, and somebody who irons in April
        and cuts thread in May is two different rates and one person.

        `logged` is that month's process — a string, or several. The recorded role is
        the fallback, for the people whose work never changes and who have no line in
        the production file for a month they were still paid for.

        Neither answering returns None, which every caller must report. Guessing prices
        somebody's month at a rate nobody agreed, and the guess looks exactly like a
        fact once it is in a total.
        """
        priced = {normalise(o): o for o in self.operations()}
        if logged is None:
            candidates = ()
        elif isinstance(logged, str):
            candidates = (logged,)
        else:
            candidates = tuple(logged)
        for source in (candidates, tuple(self.person(ident).roles or ())):
            for name in source:
                got = priced.get(normalise(name))
                if got:
                    return got
        return None

    def employed(self, ident: str, month) -> bool:
        """Whether this person was on the books this month.

        A BOOL, because for almost everybody it is one — the spell either covers the
        month or it does not, and a gap is a real answer rather than an error. The one
        case it cannot answer is `departure_undated`, and that is asked separately
        through departure_is_unresolved() rather than by making this raise: dozens of
        call sites read this in a boolean context and turning it into a raising method
        would have made a missing leaving date crash a payroll run instead of reporting
        one person's month as unresolved.
        """
        return self.employment.employed(ident, month)

    def departure_is_unresolved(self, ident: str, month) -> bool:
        """This person is gone, nobody said when, and the month is on the wrong side of
        the one date we do have.

        The owner named who was on the floor on a given day and, for five people who
        were not, said plainly: "Record that they are gone without inventing a date."

        So the spell stays open and this answers the question the open spell cannot.
        Before the snapshot they were employed and that is not in doubt. From the
        snapshot on, the honest answer is neither "employed" (they are not) nor "not
        employed" (nobody said when that started) — it is UNRESOLVED, which pays nothing
        and stays on the report until somebody supplies the date.

        Without the snapshot date there is nothing to compare against, so this is False
        and the open spell is taken at face value: a roster with no as-of date cannot
        make anybody's month unresolvable.
        """
        if ident not in self.departure_undated or self.roster_snapshot is None:
            return False
        return Month.of(month) >= Month.of(self.roster_snapshot)

    def advance_balance(self, ident: str, month) -> float:
        """What is still owed back on money already handed over. Never a pay deduction.

        The owner: "Is advance amount, should not include in salary, keep it seperate,
        they will deduct later in few months, just keep a column and mention as advance."

        Zero means nothing outstanding, which is a real answer here — an advance is
        either recorded against somebody or it is not, and there is no month where the
        engine has to guess. That is why this returns a number rather than raising the
        way a missing salary does.
        """
        given = self.advance.maybe(ident, month)
        if given is None:
            return 0.0
        return float(given) - float(self.advance_recovered.get(ident, 0) or 0)

    def rate_absence_explained(self) -> dict[str, str]:
        """Every person whose missing piece rate has a written reason, whichever kind.

        Two facts, two fields, one question. A rate nobody ever stated and a rate
        that ended with no successor are different things to record and the same
        thing to a gate: an absence somebody has accounted for in writing, which is
        reported on every run rather than failing the build — and which still pays
        nobody, because a month that needs the rate reports Unresolvable.
        """
        merged = dict(self.no_rate_stated)
        merged.update(self.rate_ended_no_successor)
        return merged

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

    def holiday_on(self, ident: str, d) -> dict | None:
        """The observance that applies to this person on this date, or None.

        Raises RELIGION_NOT_RECORDED when an observance is scoped to a religion and
        this person has none on file. That is the whole reason absence is not a
        default: including them grants a paid day on an assumption, excluding them
        withholds one on the same assumption, and both are decisions about a real
        person that nobody actually made.
        """
        d = parse_date(d)
        for obs in self.holidays:
            if parse_date(obs.get("date")) != d:
                continue
            scope = obs.get("applies_to") or {"kind": "all"}
            kind = scope.get("kind", "all")
            if kind == "all":
                return obs
            if kind == "people":
                if ident in (scope.get("value") or []):
                    return obs
                continue
            if kind == "religion":
                mine = self.person(ident).religion
                if mine is None:
                    raise LookupError(
                        f"{ident}: {obs.get('name')!r} on {d} applies to "
                        f"{scope.get('value')!r} and no religion is recorded for this person. "
                        f"Record it, or scope the day to a named list of people — it must not "
                        f"be decided by assuming one"
                    )
                if normalise(mine) == normalise(str(scope.get("value"))):
                    return obs
                continue
            raise ValueError(f"unknown applies_to kind {kind!r} in {obs.get('name')!r}")
        return None

    def holiday_is_paid(self, obs: dict) -> object:
        """Paid, unpaid or half. A holiday pays and produces nothing — those are two
        different numbers, and a system that conflates them reports the factory at
        its most productive on the days nobody worked."""
        if obs is None:
            return False
        if "paid" in obs:
            return obs["paid"]
        return self.holiday_policy.get("paid_by_default", True)

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
                 "roster": p.roster, "religion": p.religion,
                 "aliases": self.alias.aliases(p.id)}
                for p in (self.people[i] for i in sorted(self.people))
            ],
            # The undated departures ride on their own row, because a spell with an open
            # end and a spell whose end nobody stated look identical in JSON and are not
            # the same fact. Losing the flag on a save would silently put five people
            # back on the payroll.
            "_roster_snapshot": self.roster_snapshot,
            "employment": [
                dict(s, **({"left_date_not_stated": True}
                           if s["key"] in self.departure_undated else {}))
                for s in self.employment.to_json()
            ],
            "pay_basis": self.pay_basis.to_json(),
            "salary": self.salary.to_json(),
            "daily_wage": self.daily_wage.to_json(),
            "threshold_days": self.threshold_days.to_json(),
            "threshold_hours": self.threshold_hours.to_json(),
            # WRITTEN BACK IN THE SHAPE from_json READS, not in the log's internal one.
            # A piece rate is addressed "<operation>|<garment>" inside the log and stated as two
            # fields in the file; emitting the composite key would have produced a file this
            # class cannot read back — a save that loses the data it saved.
            "piece_rate": [
                dict(zip(("operation", "garment"), (str(r["key"]).split("|") + [""])[:2]),
                     **{"from": r["from"], "to": r["to"], "value": r["value"]})
                for r in self.piece_rate.to_json()
            ],
            "hourly_rate": [
                {"key": r["key"],
                 "operation": (r["value"] or {}).get("operation")
                 if isinstance(r["value"], dict) else None,
                 "from": r["from"], "to": r["to"],
                 "value": r["value"].get("rate") if isinstance(r["value"], dict) else r["value"],
                 "unit": r["value"].get("unit", PER_HOUR)
                 if isinstance(r["value"], dict) else PER_HOUR}
                for r in self.hourly_rate.to_json()
            ],
            "advance": [
                dict(r, recovered=self.advance_recovered.get(r["key"], 0))
                for r in self.advance.to_json()
            ],
            "weekly_off": self.weekly_off.to_json(),
            "trial_pay": self.trial_pay.to_json(),
            "leave": self.leave.to_json(),
            "shift_clock": list(self.shift_clock),
            # Both kinds of row, because a person's own clock is not a category and dropping it
            # here would put Sanjana and Kalyani back on hours neither of them works.
            "shift_hours": [
                {"group": g, "day_type": t, "hours": h}
                for (g, t), h in sorted(self.shift_hours.items())
            ] + [
                {"key": k, "day_type": t, "hours": h}
                for (k, t), h in sorted(self.shift_hours_by_person.items())
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
                p.get("shift_group"), p.get("roles") or (), p.get("status", "OK"),
                p.get("roster", ACTIVE), p.get("religion"),
            )
        m.roster_snapshot = data.get("_roster_snapshot")
        for s in data.get("employment", []):
            m.employment.join(s["key"], s["joined"], s.get("left"))
            # Gone, with no date. The spell stays OPEN — writing a date here would be
            # inventing the one fact the owner said not to invent — and the person is
            # remembered separately so their months after the snapshot resolve as
            # unresolved rather than as a quiet "still employed".
            if s.get("left_date_not_stated"):
                m.departure_undated.add(s["key"])
        for s_ in data.get("leave", []):
            m.leave.join(s_["key"], s_["joined"], s_.get("left"))
        for name in ("pay_basis", "salary", "daily_wage", "threshold_days",
                     "threshold_hours", "weekly_off", "trial_pay"):
            getattr(m, name).load(data.get(name, []))

        # A PIECE RATE BELONGS TO AN OPERATION ON A GARMENT, NOT TO A PERSON.
        # It used to be loaded as a person-keyed effective log, which forced two wrong things:
        # a rate could only exist if somebody was named against it, and the same rate had to be
        # repeated for every person doing that work. The owner states them once — "Iron ·
        # Anarkali 7.5" — and who is on piece rate at all is pay_basis, a different question.
        # The key is "<operation>|<garment>", so the effective-dating machinery is unchanged.
        m.piece_rate.load([
            {"key": f"{r['operation']}|{r['garment']}", "from": r["from"],
             "to": r.get("to"), "value": r["value"]}
            for r in data.get("piece_rate", [])
        ])

        # An hourly rate for piece work is a different basis, not a different rate — Joginder was
        # 100/hour for iron in FY2025-26 and moved to piece rate in FY2026-27. Keeping them in
        # separate logs is what lets the engine say WHICH basis applied in a given month rather
        # than guessing from the number.
        # KEYED BY THE PERSON, WITH THE OPERATION AS DATA ON THE ROW.
        # The key was "<person>|<operation>" for one commit, which forced every reader to guess
        # the operation before it could ask the question — pay.py did it by trying "joginder|Iron"
        # first, a trade's own word compiled into the engine. An hourly rate is a person's; what
        # they were doing for it is a fact about the row, not part of its address.
        m.hourly_rate.load([
            {"key": r["key"], "from": r["from"], "to": r.get("to"),
             "value": r["value"] if isinstance(r["value"], dict) else {
                 "rate": r["value"], "unit": r.get("unit", PER_HOUR),
                 "operation": r.get("operation"),
             }}
            for r in data.get("hourly_rate", [])
        ])

        # AN ADVANCE IS A BALANCE, NEVER A LINE INSIDE SALARY. The owner: "should not include in
        # salary, keep it seperate, they will deduct later in few months". Recovery reduces this
        # balance; it never touches the salary figure, because the two answer different questions
        # and a reader who sees them merged can reconstruct neither.
        m.advance.load([
            {"key": r["key"], "from": r["from"], "to": r.get("to"), "value": r["value"]}
            for r in data.get("advance", [])
        ])
        m.advance_recovered = {r["key"]: r.get("recovered", 0) for r in data.get("advance", [])}

        # The clock, kept so the hours can be DERIVED rather than asserted.
        m.shift_clock = list(data.get("shift_clock", []))
        if data.get("shift_hours"):
            # A row is keyed by its GROUP (M/F/Packing) or by a PERSON. Sanjana and Kalyani work
            # neither the male nor the female clock, and Esadul's Sunday has no lunch break at
            # all — so a person's own row must be able to exist and must win. Storing only the
            # group would round all three into a shape none of them works.
            m.shift_hours = {
                (r["group"], r["day_type"]): float(r["hours"])
                for r in data["shift_hours"] if "group" in r
            }
            m.shift_hours_by_person = {
                (r["key"], r["day_type"]): float(r["hours"])
                for r in data["shift_hours"] if "key" in r
            }
        if data.get("bands"):
            m.bands.update(data["bands"])
        if data.get("non_person_columns"):
            m.non_person_columns = {normalise(c) for c in data["non_person_columns"]}
        m.rate_ended_no_successor = {
            k: v for k, v in (data.get("_rate_ends_and_no_successor_stated") or {}).items()
            if not k.startswith("_")
        }
        m.no_rate_stated = {
            k: v for k, v in (data.get("_no_rate_stated") or {}).items()
            if not k.startswith("_")
        }
        return m

    def load_holidays(self, data) -> "Master":
        """The calendar, from its own file. Kept separate from master.json because
        it is the one list that changes every single year."""
        if isinstance(data, (str, Path)):
            data = json.loads(Path(data).read_text(encoding="utf-8"))
        self.holidays = list(data.get("observances") or [])
        self.holiday_policy.update(data.get("policy") or {})
        return self

    def save(self, path) -> Path:
        path = Path(path)
        path.write_text(json.dumps(self.to_json(), indent=2, ensure_ascii=False), encoding="utf-8")
        return path

    def __repr__(self):
        return (f"<Master {len(self.people)} people, "
                f"{len(self.employment)} spells, {len(self.salary)} salary rows>")
