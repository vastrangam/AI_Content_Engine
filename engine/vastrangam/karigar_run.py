"""The karigar pipeline, end to end — §7 and §8.

Reads production and payments, rolls both up to the paying unit, works out the
set-completion bottleneck per design, and reports what does not tie.

Nothing here reads a total off the source. Every figure is recomputed from the
transaction rows, and the source's own totals are used only to check the answer.
"""

from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import dataclass, field

from .karigar import (ALL_MEMBERS, DEFAULT_SET_RULE, KarigarRegistry, Ledger,
                      POPULATED, SetResult, complete_sets,
                      parse_component_type, roll_up, weighted_rate, variance_line)
from .names import normalise
from .parsing import cell, is_blank, map_columns, read_karigar_rows
from .parsing import MissingColumn

PERIOD_COLUMNS = ("earned", "paid", "outstanding")


@dataclass
class KarigarResult:
    entries: list = field(default_factory=list)
    units: dict = field(default_factory=dict)       # unit id -> Ledger
    by_period: dict = field(default_factory=dict)   # unit id -> {period: earned}
    paid_by_period: dict = field(default_factory=dict)
    designs: dict = field(default_factory=dict)     # design -> SetResult
    set_types: dict = field(default_factory=dict)   # design -> required slots
    design_value: dict = field(default_factory=dict)
    totals: dict = field(default_factory=dict)
    review: list = field(default_factory=list)


def read_production(sheets: dict, registry: KarigarRegistry, review=None) -> list:
    """Every production row, from whichever sheet holds them.

    A unit that has never been seen is registered from the label it was written
    with. §7.1 is explicit that each source keeps its own naming and merges are
    proposed rather than invented, so a new label becomes a new unit and any
    near match is surfaced for a person to confirm.
    """
    review = review if review is not None else []
    for name, rows in sheets.items():
        if "raw transaction" not in normalise(name) and "audit" not in normalise(name):
            continue
        entries, review = read_karigar_rows(rows, name, review)
        for e in entries:
            label = e.extra["label"]
            ident = registry.alias.lookup(label)
            if ident is None:
                ident = label
                registry.add_unit(ident, label,
                                  job_work="job work" in normalise(label))
                near = [p for p in registry.alias.propose(label) if p[0] != ident]
                if near:
                    registry.review.append({
                        "what": label, "where": e.where,
                        "reason": "new karigar label, close to one already known",
                        "proposed_merges": near,
                    })
            e.who = ident
        return entries, review
    review.append({"where": "workbook", "what": "production",
                   "reason": "no raw-transaction sheet found"})
    return [], review


def read_payment_summary(sheets: dict, registry: KarigarRegistry, review=None):
    """Per-unit payments, split by period.

    The source keeps one column trio per financial year plus a combined trio.
    The combined columns are never read as data — they are recomputed and then
    checked against, which is the whole point of the gate in §11.
    """
    review = review if review is not None else []
    paid, earned, combined = defaultdict(dict), defaultdict(dict), {}
    for name, rows in sheets.items():
        if "payment summary" not in normalise(name):
            continue
        header_at = next((i for i, r in enumerate(rows)
                          if any(normalise(c or "").endswith("earned rs")
                                 or normalise(c or "").endswith("earned")
                                 for c in r)), None)
        if header_at is None:
            continue
        header = rows[header_at]
        periods = {}
        for i, h in enumerate(header):
            text = normalise(h)
            if not text:
                continue
            for kind in PERIOD_COLUMNS:
                if text.endswith(kind) or text.endswith(f"{kind} rs"):
                    period = text.rsplit(kind, 1)[0].strip()
                    key = "combined" if normalise(period).startswith("combined") or not period \
                        else canonical_period(period)
                    periods.setdefault(key, {})[kind] = i
        who = map_columns(header, {"karigar": ["karigar", "name"]}, ["karigar"])["karigar"]

        for r in rows[header_at + 1:]:
            if is_blank(r):
                continue
            label = str(cell(r, who) or "").strip()
            if not label or normalise(label).startswith("total") \
                    or normalise(str(cell(r, 0) or "")).startswith("grand total"):
                continue
            ident = registry.alias.lookup(label) or label
            for period, cols in periods.items():
                if "paid" in cols:
                    value = _num(cell(r, cols["paid"]))
                    if value is not None:
                        (combined if period == "combined" else paid[ident])[
                            "paid" if period == "combined" else period] = value
                if "earned" in cols and period != "combined":
                    value = _num(cell(r, cols["earned"]))
                    if value is not None:
                        earned[ident][period] = value
        break
    return paid, earned, review


def canonical_period(text) -> str:
    """'FY2025-26', 'fy2025 26' and '2025-26' are one period.

    They arrive spelled differently from the production sheet and the payment
    header, and a period that does not match itself makes the combined-versus-
    periods gate compare two disjoint sets and pass by accident.
    """
    digits = [d for d in re.findall(r"\d{2,4}", str(text or ""))]
    if len(digits) >= 2:
        start = digits[0]
        end = digits[1][-2:]
        return f"FY{start}-{end}"
    return str(text or "").strip() or "unknown"


def _num(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def run(sheets: dict, registry: KarigarRegistry | None = None,
        rule: str = DEFAULT_SET_RULE) -> KarigarResult:
    registry = registry or KarigarRegistry()
    result = KarigarResult()

    entries, result.review = read_production(sheets, registry)
    result.entries = entries
    result.set_types = read_set_types(sheets, result.review)

    # Earnings, per unit and per period, recomputed from the rows.
    by_period = defaultdict(lambda: defaultdict(float))
    for e in entries:
        by_period[e.who][canonical_period(e.extra["period"])] += e.value or 0.0
    result.by_period = {u: dict(p) for u, p in by_period.items()}

    paid, source_earned, result.review = read_payment_summary(
        sheets, registry, result.review)
    result.paid_by_period = {u: dict(p) for u, p in paid.items()}

    result.units = roll_up(
        [(u, sum(p.values())) for u, p in result.by_period.items()],
        [(u, sum(p.values())) for u, p in result.paid_by_period.items()],
    )

    # The bottleneck, per design. A full set counts toward all three slots, and
    # the minimum is taken over what the Set Type requires — not over whatever
    # happens to have been produced.
    slots = defaultdict(lambda: defaultdict(float))
    value = defaultdict(float)
    for e in entries:
        for slot in e.extra.get("slots") or parse_component_type(e.set_type):
            slots[e.what][slot] += e.qty
        value[e.what] += e.value or 0.0
    for design, counts in slots.items():
        result.designs[design] = complete_sets(
            {k: int(v) for k, v in counts.items()},
            result.set_types.get(design), rule)
    result.design_value = dict(value)

    result.totals = {
        "set_rule": rule,
        "rows": len(entries),
        "pieces": round(sum(e.qty for e in entries), 2),
        "earned": round(sum(sum(p.values()) for p in result.by_period.values()), 2),
        "paid": round(sum(sum(p.values()) for p in result.paid_by_period.values()), 2),
        "units": len(result.units),
        "designs": len(result.designs),
        "complete_sets": sum(d.complete_sets for d in result.designs.values()),
        "by_period": _period_totals(result.by_period),
        "paid_by_period": _period_totals(result.paid_by_period),
        "source_earned_by_period": _period_totals(source_earned),
    }
    result.totals["outstanding"] = round(
        result.totals["earned"] - result.totals["paid"], 2)
    return result


def _period_totals(by_unit: dict) -> dict:
    out = defaultdict(float)
    for periods in by_unit.values():
        for period, value in periods.items():
            out[period] += value
    return {k: round(v, 2) for k, v in sorted(out.items())}


def load_compositions(path=None) -> dict:
    """The Set Type composition table — what each set actually contains.

    Read first, because it is the only source that can be right. The name is a
    fallback and what was produced is the fallback after that.
    """
    import json
    from pathlib import Path as _Path
    path = _Path(path or _Path(__file__).resolve().parents[1] / "fixtures" / "set_types.json")
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    return {normalise(c["set_type"]): tuple(c["slots"])
            for c in data.get("compositions", [])}


def read_set_types(sheets: dict, review=None, compositions=None) -> dict:
    """What each design's Set Type calls for.

    'Anarkali Plazo Set' is a top and a bottom. 'Lehenga Choli Set' is a bottom
    and a top. 'Dupatta Set' is a dupatta. The name lists the garments, so the
    same reader that handles a component label handles this — no separate table
    of set types to maintain, and a company that sells something new needs no
    code change.

    A name that yields no garment at all — 'Alter Set', 'Uniform Set' — returns
    nothing, and the caller falls back to the slots actually produced.
    """
    review = review if review is not None else []
    compositions = load_compositions() if compositions is None else compositions
    out, seen_by_name, seen_unknown = {}, set(), set()
    for name, rows in sheets.items():
        if "combined production" not in normalise(name) and \
                "item wise" not in normalise(name):
            continue
        try:
            header_at = next(i for i, r in enumerate(rows)
                             if _maps(r, ["design", "set_type"]))
        except StopIteration:
            continue
        cols = map_columns(rows[header_at],
                           {"design": ["design name", "design"],
                            "set_type": ["set type", "settype"]},
                           ["design", "set_type"])
        for r in rows[header_at + 1:]:
            if is_blank(r):
                continue
            design = str(cell(r, cols["design"]) or "").strip()
            label = cell(r, cols["set_type"])
            if not design or design.startswith("▸") or label is None:
                continue
            known = compositions.get(normalise(label))
            if known:
                out.setdefault(design, known)
                continue
            slots = parse_component_type(label, bare_set_means_all=False)
            if slots:
                out.setdefault(design, slots)
                seen_by_name.add(str(label))
            elif str(label) not in seen_unknown:
                seen_unknown.add(str(label))
                review.append({"where": name, "what": label,
                               "reason": "set type is not in the composition table and "
                                         "names no garment — the bottleneck falls back "
                                         "to whatever was produced"})
    for label in sorted(seen_by_name):
        review.append({"where": "set types", "what": label,
                       "reason": "composition taken from the set type's name, which is "
                                 "a guess — add it to fixtures/set_types.json to be sure"})
    return out


def _maps(row, wanted) -> bool:
    try:
        map_columns(row, {"design": ["design name", "design"],
                          "set_type": ["set type", "settype"]}, wanted)
        return True
    except MissingColumn:
        return False
