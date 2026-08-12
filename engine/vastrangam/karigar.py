"""Karigar — Part 8.

The paying unit is not the person. Six units on the payroll are fifteen people.
A unit that worked alone one year and as a team the next is one id with two
labels, never two rows — otherwise last year's outstanding never meets this
year's payment.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field

from .calendar_util import Month, parse_date
from .logs import EffectiveLog, SpellLog, Unresolved
from .names import AliasTable

TOP, BOTTOM, DUPATTA = "Top", "Bottom", "Dupatta"
SLOTS = (TOP, BOTTOM, DUPATTA)

# Set type to the slots it fills. Data, so a new set type is a table entry.
SET_TYPE_SLOTS = {
    "FULL SET": (TOP, BOTTOM, DUPATTA),
    "SET": (TOP, BOTTOM, DUPATTA),
    "3PC": (TOP, BOTTOM, DUPATTA),
    "TOP & BOTTOM": (TOP, BOTTOM),
    "TOP AND BOTTOM": (TOP, BOTTOM),
    "2PC": (TOP, BOTTOM),
    "TOP & DUPATTA": (TOP, DUPATTA),
    "TOP": (TOP,),
    "BOTTOM": (BOTTOM,),
    "DUPATTA": (DUPATTA,),
}

# Garment names to the slot they occupy. Anarkali is a top, plazo is a bottom.
GARMENT_SLOTS = {
    "ANARKALI": TOP, "KURTA": TOP, "KURTI": TOP, "TOP": TOP, "GOWN": TOP,
    "PLAZO": BOTTOM, "PALAZZO": BOTTOM, "PANT": BOTTOM, "SALWAR": BOTTOM,
    "SHARARA": BOTTOM, "BOTTOM": BOTTOM, "SKIRT": BOTTOM,
    "DUPATTA": DUPATTA, "STOLE": DUPATTA,
}

JOB_WORK_SUFFIX = " (Job Work)"


@dataclass
class Unit:
    """The paying unit. Earnings, payments and outstanding roll up here."""

    id: str
    job_work: bool = False


class KarigarRegistry:
    def __init__(self):
        self.units: dict[str, Unit] = {}
        self.alias = AliasTable()
        self.labels = EffectiveLog("karigar_label")   # value: {"label", "composition"}
        self.members = SpellLog("karigar_member")     # key: f"{unit}|{person}"
        self.confirmed_merges: dict[str, str] = {}
        self.review: list[dict] = []

    def add_unit(self, ident, *aliases, job_work=False) -> Unit:
        u = Unit(ident, job_work)
        self.units[ident] = u
        self.alias.register(ident, *aliases)
        return u

    def label(self, unit: str, frm, label: str, composition=()) -> None:
        """What the source called this unit in that period. Reports show this."""
        self.labels.set_value(unit, frm, {"label": label, "composition": list(composition)})

    def label_for(self, unit: str, month) -> str:
        try:
            value = self.labels.resolve(unit, month)
        except Unresolved:
            return self.alias.display(unit)
        name = value["label"]
        return name + JOB_WORK_SUFFIX if self.units[unit].job_work else name

    def add_member(self, unit: str, person: str, frm, to=None) -> None:
        self.members.join(f"{unit}|{person}", frm, to)

    def headcount(self, month) -> dict[str, int]:
        counts: dict[str, int] = defaultdict(int)
        for key in self.members.keys():
            unit = key.split("|", 1)[0]
            if self.members.employed(key, month):
                counts[unit] += 1
        return dict(counts)

    def resolve(self, name, where="") -> str | None:
        """Exact alias only. Near matches are proposed, never applied — a merge
        is a decision, and once it is made it is stored so it is asked once."""
        ident = self.alias.lookup(name)
        if ident:
            return ident
        key = str(name).strip()
        if key in self.confirmed_merges:
            return self.confirmed_merges[key]
        proposals = self.alias.propose(name)
        self.review.append({
            "what": key, "where": where,
            "reason": "karigar name not recognised",
            "proposed_merges": proposals,
        })
        return None

    def confirm_merge(self, name: str, unit: str) -> None:
        """Answer the question once. The alias becomes real from then on."""
        self.confirmed_merges[str(name).strip()] = unit
        self.alias.register(unit, name)


# -- set completion ---------------------------------------------------------

@dataclass
class SetResult:
    slots: dict = field(default_factory=dict)
    complete_sets: int = 0
    surplus: dict = field(default_factory=dict)
    pending_dupatta: int = 0
    extra_dupatta: int = 0


def slot_of(name: str) -> str | None:
    key = str(name).strip().upper()
    if key in GARMENT_SLOTS:
        return GARMENT_SLOTS[key]
    for word, slot in GARMENT_SLOTS.items():
        if word in key:
            return slot
    return None


def pool(rows) -> dict[str, int]:
    """Turn production rows into slot counts.

    A row is (set_type, qty) or (garment, qty) — either resolves to slots, and a
    full set adds one to all three because that is one of each.
    """
    counts = {s: 0 for s in SLOTS}
    for name, qty in rows:
        key = str(name).strip().upper()
        slots = SET_TYPE_SLOTS.get(key)
        if slots is None:
            got = slot_of(key)
            slots = (got,) if got else ()
        for s in slots:
            counts[s] += int(qty)
    return counts


def complete_sets(counts: dict[str, int]) -> SetResult:
    """The bottleneck. A set ships when all three pieces exist, so the smallest
    populated slot is the answer and everything above it is stock, not output."""
    populated = {s: n for s, n in counts.items() if n > 0}
    r = SetResult(slots=dict(counts))
    if not populated:
        return r
    r.complete_sets = min(populated.values())
    r.surplus = {s: n - r.complete_sets for s, n in counts.items()}
    # Bodies waiting on a dupatta — reported, but the surpluses stay unmerged.
    r.pending_dupatta = min(r.surplus.get(TOP, 0), r.surplus.get(BOTTOM, 0))
    r.extra_dupatta = r.surplus.get(DUPATTA, 0)
    return r


# -- rates and money --------------------------------------------------------

def weighted_rate(paid_rows, master_rate: float | None = None) -> float:
    """What was actually paid, weighted by quantity. The master rate is the
    fallback for a design nobody has been paid for yet."""
    qty = sum(q for q, _ in paid_rows if q)
    if not qty:
        return float(master_rate or 0.0)
    return sum(q * r for q, r in paid_rows) / qty


def variance_line(recorded_value: float, computed_value: float) -> float:
    """The adjustment that makes a design tie out exactly to its raw recorded
    value. Shown as its own line — a rounding difference you can see is fine,
    one that has been absorbed into the rate is not."""
    return round(recorded_value - computed_value, 2)


@dataclass
class Ledger:
    unit: str
    earned: float = 0.0
    paid: float = 0.0

    @property
    def outstanding(self) -> float:
        return round(self.earned - self.paid, 2)

    @property
    def is_advance(self) -> bool:
        return self.outstanding < 0


def roll_up(earnings, payments) -> dict[str, Ledger]:
    """Everything lands on the unit id, whatever label the period used."""
    out: dict[str, Ledger] = {}
    for unit, amount in earnings:
        out.setdefault(unit, Ledger(unit)).earned += float(amount)
    for unit, amount in payments:
        out.setdefault(unit, Ledger(unit)).paid += float(amount)
    for led in out.values():
        led.earned, led.paid = round(led.earned, 2), round(led.paid, 2)
    return out


def master_rate_conflict(entries) -> dict:
    """Two periods disagree on a design's rate. The later one wins and both are
    flagged — the winner is not the end of the conversation."""
    ordered = sorted(entries, key=lambda e: parse_date(e["from"]))
    return {
        "applied": ordered[-1],
        "superseded": ordered[:-1],
        "reason": "master rate differs between periods — most recent applied, all flagged",
    }
