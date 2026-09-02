"""Karigar — Part 8.

The paying unit is not the person. Six units on the payroll are fifteen people.
A unit that worked alone one year and as a team the next is one id with two
labels, never two rows — otherwise last year's outstanding never meets this
year's payment.
"""

from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import dataclass, field

from .calendar_util import Month, parse_date
from .logs import EffectiveLog, SpellLog, Unresolved
from .names import AliasTable, normalise

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

# The last resort, not the method. §7.1 is explicit that components are to be
# classified from the rate card's own structure rather than from a list of
# garment names — a company that sells shararas and one that sells skirts should
# not need this file edited. classify_components() below does the real work;
# this table only catches what structure could not settle, and every time it
# fires it says so in Needs Review.
GARMENT_SLOTS = {
    "ANARKALI": TOP, "KURTA": TOP, "KURTI": TOP, "TOP": TOP, "GOWN": TOP,
    "PLAZO": BOTTOM, "PALAZZO": BOTTOM, "PANT": BOTTOM, "SALWAR": BOTTOM,
    "SHARARA": BOTTOM, "BOTTOM": BOTTOM, "SKIRT": BOTTOM,
    "DUPATTA": DUPATTA, "STOLE": DUPATTA,
}

# The one anchor §7.1 does allow: Dupatta is Dupatta. Everything paired with it
# inside a Set Type is body, and which half of the body follows from the order
# the rate card lists them in.
DUPATTA_WORDS = ("dupatta", "stole", "odhni", "chunni")

JOB_WORK_SUFFIX = " (Job Work)"


@dataclass
class Unit:
    """The paying unit. Earnings, payments and outstanding roll up here."""

    id: str
    job_work: bool = False
    # §1.3 — the headline per-piece figure from Karigar Master. A reference for
    # people to read, never the per-design rate card the pipeline prices with.
    reference_rate: float | None = None


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
    required: tuple = ()          # the slots the Set Type actually calls for
    rule: str = ""                # which reading of the rule produced this
    complete_sets: int = 0
    surplus: dict = field(default_factory=dict)
    pending_dupatta: int = 0
    extra_dupatta: int = 0
    # What the OTHER reading of the empty slots would have given, and which
    # slots are the reason the two disagree. Empty means the two readings agree
    # and the design's count does not depend on an undecided question.
    alt_complete_sets: int = 0
    unresolved: tuple = ()


_NEGATION = re.compile(r"\b(no|without|less|excl|excluding)\s+([a-z]+)")

# Which slot each word speaks for. Used only to read a component-type label,
# which is a description of the garment parts rather than a garment name — a
# label saying "Top & Bottom" means those slots whatever the company calls the
# actual garments.
_SLOT_WORDS = {
    TOP: ("top", "body", "kurta", "kurti", "anarkali", "gown", "choli", "blouse"),
    BOTTOM: ("bottom", "plazo", "palazzo", "pant", "salwar", "sharara", "skirt",
             "lehenga"),
    DUPATTA: DUPATTA_WORDS,
}
_WHOLE_SET = ("full set", "complete set", "3 pc", "3pc", "full suit")


def parse_component_type(label, bare_set_means_all: bool = True) -> tuple:
    """Read a Component Type label into the slots it fills.

    Handles the shapes a report actually uses — 'Full Set', 'Top/Body only',
    'Dupatta only', 'Top & Bottom (no Dupatta)', 'Top/Body + Dupatta'.

    The negation matters and is easy to miss: 'Top & Bottom (no Dupatta)'
    contains the word Dupatta, and reading it as a dupatta would invent a
    garment that was explicitly not made.

    `bare_set_means_all` decides what a lone 'Set' means. As a component label
    it is the whole set, all three pieces. As the *name* of a set type —
    'Uniform Set', 'Alter Set' — the word is only a suffix and says nothing
    about composition, so the caller wants nothing back and falls through to
    whatever was actually produced.
    """
    text = normalise(label)
    if not text:
        return ()
    excluded = set()
    for _, word in _NEGATION.findall(text):
        for slot, words in _SLOT_WORDS.items():
            if any(w.startswith(word) or word.startswith(w) for w in words):
                excluded.add(slot)
    text = _NEGATION.sub(" ", text)

    if any(phrase in text for phrase in _WHOLE_SET):
        return tuple(s for s in SLOTS if s not in excluded)

    found = [slot for slot, words in _SLOT_WORDS.items()
             if slot not in excluded and any(w in text for w in words)]
    if found:
        return tuple(s for s in SLOTS if s in found)
    if bare_set_means_all and "set" in text.split():
        return tuple(s for s in SLOTS if s not in excluded)
    return ()


def is_dupatta(name) -> bool:
    key = str(name or "").strip().lower()
    return any(word in key for word in DUPATTA_WORDS)


def classify_components(set_types: dict, review=None) -> dict:
    """Work out which slot each rate-card component fills, from structure alone.

    `set_types` is {set type name: [component names, in the order the rate card
    lists them]} — exactly what a rate card gives you.

    The reasoning, in order:
      * anything named like a dupatta is the Dupatta.
      * a Set Type holding one body component tells you that component is a
        body, and if the Set Type's own name says which half, that settles it.
      * a Set Type holding two body components is listing them top-first, which
        is how every rate card in this trade is written.
      * a component structure cannot settle falls back to the garment-name
        table, and the fallback is reported rather than assumed correct.

    A component that two Set Types disagree about is decided by the larger Set
    Type, which carries more structure, and the disagreement is reported.
    """
    review = review if review is not None else []
    slots: dict[str, str] = {}
    evidence: dict[str, int] = {}

    def claim(component, slot, weight):
        previous = slots.get(component)
        if previous and previous != slot and evidence.get(component, 0) >= weight:
            review.append({"what": component, "reason":
                           f"rate card implies both {previous} and {slot} — kept "
                           f"{previous}, which came from a larger set type"})
            return
        if previous and previous != slot:
            review.append({"what": component, "reason":
                           f"rate card implies both {previous} and {slot} — took "
                           f"{slot} from a larger set type"})
        slots[component] = slot
        evidence[component] = max(weight, evidence.get(component, 0))

    for set_name, components in set_types.items():
        bodies = []
        for c in components:
            if is_dupatta(c):
                claim(c, DUPATTA, 3)
            else:
                bodies.append(c)
        if len(bodies) == 1:
            named = SET_TYPE_SLOTS.get(str(set_name).strip().upper())
            body_named = [s for s in (named or ()) if s != DUPATTA]
            if len(body_named) == 1:
                claim(bodies[0], body_named[0], 2)
        elif len(bodies) == 2:
            claim(bodies[0], TOP, 3)
            claim(bodies[1], BOTTOM, 3)
        elif len(bodies) > 2:
            review.append({"what": set_name, "reason":
                           f"set type lists {len(bodies)} body components — the "
                           f"engine cannot tell which is top and which is bottom"})

    for components in set_types.values():
        for c in components:
            if c in slots:
                continue
            guess = _slot_from_name(c)
            if guess:
                slots[c] = guess
                review.append({"what": c, "reason":
                               f"structure did not settle this component; fell back "
                               f"to the garment-name table and read it as {guess}"})
            else:
                review.append({"what": c, "reason":
                               "component fits no set type and no known garment name "
                               "— it needs a slot before it can be counted"})
    return slots


def _slot_from_name(name: str) -> str | None:
    key = str(name).strip().upper()
    if key in GARMENT_SLOTS:
        return GARMENT_SLOTS[key]
    for word, slot in GARMENT_SLOTS.items():
        if word in key:
            return slot
    return None


def slot_of(name: str, slots: dict | None = None) -> str | None:
    """A component's slot. Pass the map from classify_components when you have
    a rate card; the garment-name table is only the fallback."""
    if slots:
        if name in slots:
            return slots[name]
        for component, slot in slots.items():
            if str(component).strip().upper() == str(name).strip().upper():
                return slot
    return _slot_from_name(name)


def pool(rows, component_slots: dict | None = None) -> dict[str, int]:
    """Turn production rows into slot counts.

    A row is (set_type, qty) or (component, qty) — either resolves to slots, and
    a full set adds one to all three because that is one of each. Pass the map
    from classify_components when a rate card is available.
    """
    counts = {s: 0 for s in SLOTS}
    for name, qty in rows:
        key = str(name).strip().upper()
        slots = SET_TYPE_SLOTS.get(key)
        if slots is None:
            got = slot_of(name, component_slots)
            slots = (got,) if got else ()
        for s in slots:
            counts[s] += int(qty)
    return counts


# The set-completion rule. The Combined Master Prompt §2.2 settles it:
#
#     "Total Complete Sets = the smallest populated slot."
#
# So an empty slot does not make the design zero — it drops out of the minimum,
# and the pieces that were genuinely made and paid for are counted. POPULATED is
# the rule.
#
#   POPULATED    §2.2 — the minimum across only the slots that actually hold
#                pieces. 22 tops and 22 dupattas with no bottoms is 22 sets.
#
#   ALL_MEMBERS  the older reading, where every member slot must be populated or
#                the design counts zero. Kept because both delivered reports were
#                built this way, so a figure that came from one of them can still
#                be reproduced. It is never the default.
#
# The difference on FY2025-27 is 213 sets: 30,811 under ALL_MEMBERS, 31,024 here.
ALL_MEMBERS = "all"
POPULATED = "populated"
DEFAULT_SET_RULE = POPULATED


def _keep(required, counts, flags, rule, unknown_counts) -> tuple:
    """Which member slots go into the minimum, one empty slot at a time.

    An empty slot is the only interesting case, and what it means depends on who
    has said what about it:

      flag True   — it counts anyway, so the design is 0. The set genuinely
                    needs this piece and none was made.
      flag False  — it drops out. The set genuinely ships without this piece.
      flag None   — DECLARED unknown. Follows `rule` for the number, and the
                    caller computes the other reading too so the disagreement
                    is visible instead of being decided here by default.
      no flag     — follows `rule`, silently. This is what every caller that
                    passes no slot rules gets, and it is the behaviour that
                    existed before per-slot flags did.
    """
    keep = []
    for s in required:
        if int(counts.get(s, 0)) > 0:
            keep.append(s)
            continue
        if s in flags:
            flag = flags[s]
            if flag is True:
                keep.append(s)
            elif flag is None and unknown_counts:
                keep.append(s)
            # flag False — the set ships without it. Never counted.
            continue
        if rule == ALL_MEMBERS:
            keep.append(s)
    return tuple(keep)


def complete_sets(counts: dict[str, int], required=None,
                  rule: str = DEFAULT_SET_RULE, slot_rules=None) -> SetResult:
    """The bottleneck — the smallest of the pieces a set needs.

    `required` is the set type's member columns. A component outside them is
    surplus in full: a Kurti Plazo Set is a top and a bottom, so a dupatta made
    against it never constrains the count.

    `rule` decides what an EMPTY member column means, and the two readings give
    different answers on real data:

      * ALL_MEMBERS — 22 tops and 22 dupattas with no bottoms is 0 sets, because
        the set needs a bottom and none exists.
      * POPULATED — the same case is 22 sets, because 22 tops and 22 dupattas
        were genuinely made and paid for.

    `slot_rules` is the per-slot answer to that same question — {slot: True |
    False | None} — because it is not one question for the whole business. An
    Anarkali Plazo Set without its dupatta may well be an error; a Lehenga Choli
    Set genuinely ships without one. Whether each is which is a fact about the
    garment, so it lives in fixtures/set_types.json as data.

    A slot declared None is declared UNKNOWN, and that is not the same as having
    no opinion. The number still follows `rule` — nothing silently changes
    because a question was written down — but the other reading is computed as
    `alt_complete_sets` and the slot is named in `unresolved`, so a design whose
    count depends on an undecided question says so instead of looking settled.
    A design whose empty slots do not change the answer is never flagged, which
    is what keeps the flag worth reading.

    With `required` left out, the populated slots are used either way — the
    right fallback for a set type whose name gives no composition.
    """
    r = SetResult(slots=dict(counts))
    required = tuple(required or ())
    flags = dict(slot_rules or {})
    if not required:
        populated = {s: n for s, n in counts.items() if n > 0}
        if not populated:
            return r
        required = tuple(populated)
        flags = {}
    else:
        members = required
        other = _keep(members, counts, flags, rule, unknown_counts=(rule != ALL_MEMBERS))
        required = _keep(members, counts, flags, rule, unknown_counts=(rule == ALL_MEMBERS))
        # Nothing kept means every member slot is empty. The minimum over the
        # whole composition is 0, which is the answer — not a minimum over an
        # empty list, and not a silent drop to some other slot's count.
        required = required or members
        other = other or members
        if other != required:
            r.alt_complete_sets = min(int(counts.get(s, 0)) for s in other)
            r.unresolved = tuple(s for s in set(required) ^ set(other)
                                 if flags.get(s, "unset") is None)
    r.required = required
    r.rule = rule

    r.complete_sets = min(int(counts.get(s, 0)) for s in required)
    # Anything outside the set's own composition is surplus in full.
    r.surplus = {s: int(n) - (r.complete_sets if s in required else 0)
                 for s, n in counts.items()}
    # Bodies waiting on a dupatta — reported, but the surpluses stay unmerged.
    r.pending_dupatta = min(r.surplus.get(TOP, 0), r.surplus.get(BOTTOM, 0)) \
        if DUPATTA in required else 0
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
