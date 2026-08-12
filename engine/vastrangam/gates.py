"""Validation gates — Part 10. A failure blocks delivery.

Each gate takes only what it needs, so a gate can run on a partial build. None
of them knows a person, a rate or a date.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

from .calendar_util import Month
from .logs import Ambiguous, Unresolved
from .names import normalise

TOLERANCE = 0.01   # one paisa

ERROR_TOKENS = ("#REF!", "#VALUE!", "#DIV/0!", "#NAME?", "#N/A", "#NULL!", "#NUM!")


@dataclass
class GateResult:
    gate: str
    passed: bool
    detail: str = ""
    offenders: list = field(default_factory=list)

    def __str__(self):
        mark = "ok  " if self.passed else "FAIL"
        return f"{mark} {self.gate}{(' — ' + self.detail) if self.detail else ''}"


def _close(a, b, tol=TOLERANCE) -> bool:
    return abs(round(a, 6) - round(b, 6)) <= tol


# 1 ---------------------------------------------------------------------------

def logs_resolve_once(master, months, logs=None) -> GateResult:
    """Every mandatory log gives exactly one row for every employed staff-month."""
    logs = logs or ["pay_basis", "salary", "threshold_days", "threshold_hours"]
    bad = []
    for staff in sorted(master.people):
        for month in months:
            if not master.employed(staff, month):
                continue
            try:
                basis = master.pay_basis.resolve(staff, month)
            except (Unresolved, Ambiguous) as exc:
                bad.append({"staff": staff, "month": Month.of(month).key,
                            "log": "pay_basis", "reason": str(exc)})
                continue
            # Piece-rate staff have no salary or threshold by definition.
            needed = ["piece_rate"] if basis == "Piece-rate" else [
                n for n in logs if n != "pay_basis"
            ]
            for name in needed:
                try:
                    getattr(master, name).resolve(staff, month)
                except (Unresolved, Ambiguous) as exc:
                    bad.append({"staff": staff, "month": Month.of(month).key,
                                "log": name, "reason": str(exc)})
    return GateResult(
        "Every log resolves exactly one row per employed staff-month",
        not bad,
        "" if not bad else f"{len(bad)} staff-months unresolved or contradictory",
        bad[:50],
    )


# 2 ---------------------------------------------------------------------------

def components_tie_to_design(components: dict, recorded: dict) -> GateResult:
    """Sum of a design's component values equals its raw recorded total."""
    bad = []
    for design, total in recorded.items():
        got = sum(components.get(design, {}).values()) if isinstance(
            components.get(design), dict) else sum(components.get(design, []))
        if not _close(got, total):
            bad.append({"design": design, "components": round(got, 2),
                        "recorded": round(total, 2), "gap": round(got - total, 2)})
    return GateResult("Sum of design components = the design's recorded total",
                      not bad, "" if not bad else f"{len(bad)} designs do not tie",
                      bad[:50])


# 3 ---------------------------------------------------------------------------

def earnings_tie_to_source(earnings: dict, source_rows) -> GateResult:
    """Karigar earnings equal the sum of the rows actually parsed."""
    got = sum(float(e.earned if hasattr(e, "earned") else e) for e in earnings.values())
    want = sum(float(r) for r in source_rows)
    ok = _close(got, want)
    return GateResult("Karigar earnings = sum of parsed source rows", ok,
                      "" if ok else f"engine {got:,.2f} vs source {want:,.2f} "
                                    f"(gap {got - want:,.2f})")


# 4 ---------------------------------------------------------------------------

def combined_equals_periods(combined: dict, per_period: dict) -> GateResult:
    """The combined column is the sum of each period's columns, per unit."""
    bad = []
    for unit, total in combined.items():
        parts = sum(per_period.get(unit, {}).values())
        if not _close(parts, total):
            bad.append({"unit": unit, "combined": round(total, 2),
                        "periods": round(parts, 2), "gap": round(parts - total, 2)})
    return GateResult("Combined columns = sum of each period's columns, per unit",
                      not bad, "" if not bad else f"{len(bad)} units do not tie", bad[:50])


# 5 ---------------------------------------------------------------------------

def allocation_ties_to_payroll(result: dict) -> GateResult:
    """Allocated cost plus unallocated labour is the payroll, exactly."""
    got = result["allocated_cost"] + result["unallocated_labour"]
    want = result["payroll_total"]
    ok = _close(got, want)
    return GateResult("Design cost + unallocated labour = total payroll", ok,
                      "" if ok else f"{got:,.2f} vs payroll {want:,.2f}")


# 6 ---------------------------------------------------------------------------

def nothing_dropped(source_count: int, matched: int, review: int) -> GateResult:
    """Every source row is either matched or in Needs Review. None vanish."""
    ok = (matched + review) == source_count
    return GateResult("Every source row is matched or in Needs Review", ok,
                      f"{source_count} rows in, {matched} matched, {review} in review"
                      + ("" if ok else f" — {source_count - matched - review} unaccounted for"))


# 7 ---------------------------------------------------------------------------

def no_formula_errors(formulas) -> GateResult:
    """No error token and no broken reference anywhere in the output workbook."""
    bad = [f for f in formulas if any(t in str(f) for t in ERROR_TOKENS)]
    return GateResult("Zero formula errors, zero broken references", not bad,
                      "" if not bad else f"{len(bad)} formulas carry an error token",
                      bad[:50])


# 8 ---------------------------------------------------------------------------

def no_person_names_in_logic(paths, names, extensions=(".py", ".js", ".cjs")) -> GateResult:
    """The gate that keeps the engine data-independent.

    If a person's name appears in the logic, then the day the owner corrects
    that person's data the code has to change too — which is exactly the failure
    this whole design exists to prevent. Fixtures and test data are exempt: they
    are data, and they are meant to name people.
    """
    keys = {normalise(n) for n in names if normalise(n)}
    bad = []
    for path in [Path(p) for p in paths]:
        files = [path] if path.is_file() else [
            f for f in path.rglob("*") if f.suffix in extensions
        ]
        for f in files:
            parts = {normalise(p) for p in f.parts}
            if parts & {"fixtures", "tests", "data"}:
                continue
            for n, line in enumerate(f.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
                stripped = line.strip()
                if stripped.startswith("#") or stripped.startswith("//"):
                    continue
                words = set(re.findall(r"[A-Za-z]+", line))
                for word in words:
                    if normalise(word) in keys:
                        bad.append({"file": str(f), "line": n, "name": word,
                                    "text": stripped[:120]})
    return GateResult("No logic references a person by name", not bad,
                      "" if not bad else f"{len(bad)} references found", bad[:50])


# 9 — §11, staff side ---------------------------------------------------------

def hours_reference_covers_everyone(master, dates=None) -> GateResult:
    """Every person's category resolves to an Hours Reference row.

    None silently defaulted to zero hours, which would read as a month of
    unpaid attendance rather than as the missing table row it actually is.
    """
    import datetime as _dt
    dates = dates or [_dt.date(2025, 4, 7), _dt.date(2025, 4, 6)]   # a weekday, a Sunday
    bad = []
    for ident, person in sorted(master.people.items()):
        # Someone with no master record has no stated category to match. That is
        # already reported as a missing record; repeating it here as a missing
        # hours row would point at the wrong file.
        if person.status != "OK":
            continue
        for d in dates:
            try:
                master.shift(ident, d)
            except LookupError as exc:
                bad.append({"staff": person.name, "category": person.group,
                            "reason": str(exc)})
                break
    return GateResult("Every category resolves to an Hours Reference row", not bad,
                      "" if not bad else f"{len(bad)} people have no hours table row",
                      bad[:50])


def flat_staff_are_flat(rows) -> GateResult:
    """A Flat month earns exactly the salary in force — never more, never less.

    Not "the same figure all year": a mid-year raise legitimately changes it.
    The property that matters is that the earning tracks the salary log and
    nothing else, so attendance cannot move it in either direction.
    """
    bad = []
    for r in rows:
        if r.basis != "Flat" or not r.employed:
            continue
        if not _close(r.earning, r.salary):
            bad.append({"staff": r.staff, "month": r.month.key,
                        "salary": round(r.salary, 2), "earning": round(r.earning, 2),
                        "days": r.days_equivalent})
    return GateResult("Flat staff earn exactly their salary, whatever the attendance",
                      not bad,
                      "" if not bad else f"{len(bad)} flat months differ from the salary",
                      bad[:50])


def piece_rate_never_uses_salary(master, rows) -> GateResult:
    """Piece-rate staff draw their rate from the work report, never Staff Master."""
    bad = []
    for r in rows:
        if r.basis != "Piece-rate":
            continue
        if r.salary or r.threshold_days or r.threshold_hours:
            bad.append({"staff": r.staff, "month": r.month.key,
                        "reason": "piece-rate month priced with a salary or threshold"})
    return GateResult("Piece-rate staff never draw on Staff Master", not bad,
                      "" if not bad else f"{len(bad)} piece-rate months used a salary",
                      bad[:50])


def reconciliation_matches_summary(by_staff: dict, monthly_rows,
                                   piece_rate: dict | None = None) -> GateResult:
    """FY earning in the reconciliation equals the sum of that person's months.

    A piece-rate wage is the one figure that legitimately has no months behind
    it: §3.2.2 says the Work Report it comes from is a whole-FY aggregate with
    no date column. So it is added back here explicitly rather than excused —
    if the FY figure and the months differ by anything other than exactly that
    wage, the gate still fails.
    """
    from collections import defaultdict
    piece_rate = piece_rate or {}
    summed = defaultdict(float)
    for r in monthly_rows:
        summed[r.staff] += r.earning
    for staff, wage in piece_rate.items():
        summed[staff] += wage
    bad = []
    for staff, total in by_staff.items():
        if not _close(summed.get(staff, 0.0), total):
            bad.append({"staff": staff, "reconciliation": round(total, 2),
                        "monthly_sum": round(summed.get(staff, 0.0), 2)})
    return GateResult("Reconciliation FY earning = sum of the monthly rows", not bad,
                      "" if not bad else f"{len(bad)} staff do not tie", bad[:50])


def roster_is_explained(master, seen_in_data) -> GateResult:
    """Anyone Inactive but working, or working but not in Master, is listed.

    §1.4 — a data-quality flag, never a silent inclusion or a silent exclusion.
    """
    listed = []
    for ident in seen_in_data:
        person = master.people.get(ident)
        if person is None or person.status == "NEEDS_SETUP":
            # A provisional id carries a '?' the written name does not, so the
            # comparison below has to be on the name, not the id.
            listed.append({"staff": person.name if person else str(ident).lstrip("?"),
                           "reason": "appears in the data with no Master record"})
        elif person.roster == "Inactive":
            listed.append({"staff": person.name, "reason": "marked Inactive in Master "
                                                           "but present in the data"})
    flagged = {normalise(r.what) for r in master.review}
    unlisted = [item for item in listed if normalise(item["staff"]) not in flagged]
    return GateResult("Every roster mismatch is listed rather than assumed", not unlisted,
                      f"{len(listed)} mismatches, all listed" if not unlisted
                      else f"{len(unlisted)} mismatches went unreported",
                      (unlisted or listed)[:50])


def rows_price_themselves(entries) -> GateResult:
    """Quantity times rate equals the value recorded on the row.

    The cheapest arithmetic in the file and the one most worth checking: if a
    single row does not multiply out, every total built on it is wrong and
    nothing else in the report will say so.
    """
    bad = []
    for e in entries:
        if e.rate is None or e.value is None:
            continue
        if not _close(e.qty * e.rate, e.value):
            bad.append({"where": e.where, "qty": e.qty, "rate": e.rate,
                        "value": e.value, "expected": round(e.qty * e.rate, 2)})
    return GateResult("Every production row's quantity x rate equals its value",
                      not bad, "" if not bad else f"{len(bad)} rows do not multiply out",
                      bad[:50])


def bottleneck_uses_the_set_composition(designs) -> GateResult:
    """No design's set count exceeds any slot the set actually requires.

    Catches the mistake this rule was written to prevent: counting over the
    slots that happen to be populated, so that tops and dupattas with no
    bottoms report as finished sets.
    """
    bad = []
    for name, r in designs.items():
        for slot in (r.required or ()):
            if r.complete_sets > int(r.slots.get(slot, 0)):
                bad.append({"design": name, "sets": r.complete_sets,
                            "slot": slot, "have": r.slots.get(slot, 0)})
    return GateResult("No design reports more sets than its scarcest required piece",
                      not bad, "" if not bad else f"{len(bad)} designs overcount",
                      bad[:50])


def report(results) -> str:
    lines = [str(r) for r in results]
    failed = [r for r in results if not r.passed]
    lines.append("")
    lines.append(f"{len(results) - len(failed)}/{len(results)} gates passed"
                 + ("" if not failed else "  — DELIVERY BLOCKED"))
    return "\n".join(lines)


def all_passed(results) -> bool:
    return all(r.passed for r in results)
