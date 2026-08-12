"""Cost allocation — Part 6.

    design_cost      = work report hours x blended hourly rate
    cost_per_piece   = total design cost / quantity
    unallocated      = total payroll - the sum of every design cost

Unallocated labour gets its own line, always. It is real — holidays, paid leave,
idle time, hours nobody logged — and folding it into the designs makes every
cost per piece look better than it is.

Stitching never appears here. That is the karigar pipeline, and mixing the two
double-counts the garment.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field

from .master import Master, PIECE_RATE
from .pay import blended_hourly


@dataclass
class WorkRow:
    """One line of the work report: a whole-FY total, with no month inside it."""

    design: str
    staff: str
    hours: float
    role: str = ""


@dataclass
class DesignCost:
    design: str
    quantity: float = 0.0
    hours: float = 0.0
    cost: float = 0.0
    by_staff: dict = field(default_factory=dict)

    @property
    def cost_per_piece(self) -> float | None:
        return round(self.cost / self.quantity, 2) if self.quantity else None


def allocate(master: Master, fy, work_rows, quantities: dict,
             payroll_total: float, rates: dict | None = None) -> dict:
    """Spread logged hours across designs, and show what did not spread."""
    rates = dict(rates or {})
    for row in work_rows:
        if row.staff not in rates:
            rates[row.staff] = round(blended_hourly(master, row.staff, fy), 4)

    designs: dict[str, DesignCost] = {}
    unknown_rate = []
    for row in work_rows:
        d = designs.setdefault(row.design, DesignCost(row.design))
        rate = rates.get(row.staff, 0.0)
        if not rate:
            unknown_rate.append({"design": row.design, "staff": row.staff, "hours": row.hours})
        cost = row.hours * rate
        d.hours += row.hours
        d.cost += cost
        entry = d.by_staff.setdefault(row.staff, {"hours": 0.0, "rate": rate, "cost": 0.0})
        entry["hours"] += row.hours
        entry["cost"] += cost

    for name, d in designs.items():
        d.quantity = float(quantities.get(name, 0) or 0)
        d.hours = round(d.hours, 4)
        d.cost = round(d.cost, 2)
        for e in d.by_staff.values():
            e["hours"], e["cost"] = round(e["hours"], 4), round(e["cost"], 2)

    allocated = round(sum(d.cost for d in designs.values()), 2)
    total_hours = round(sum(d.hours for d in designs.values()), 4)
    return {
        "fy": str(fy),
        "designs": designs,
        "rates": rates,
        "design_count": len(designs),
        "logged_hours": total_hours,
        "allocated_cost": allocated,
        "payroll_total": round(payroll_total, 2),
        # The line that must never be hidden.
        "unallocated_labour": round(payroll_total - allocated, 2),
        "unknown_rate": unknown_rate,
    }


def cost_per_piece_table(result: dict) -> list[dict]:
    """One row per design, plus nothing else. No TOTAL row — a totals row summed
    together with the detail rows is how a cost report doubles itself."""
    return [
        {"design": d.design, "quantity": d.quantity, "hours": d.hours,
         "cost": d.cost, "cost_per_piece": d.cost_per_piece}
        for d in sorted(result["designs"].values(), key=lambda x: x.design)
    ]
