"""Performance bands — Part 7.

Not employed is excluded from every average. No Data is called No Data. Neither
is ever scored as Below Average, because a month someone did not work is not a
month they worked badly.
"""

from __future__ import annotations

from dataclasses import dataclass
from statistics import fmean

from .master import ATTENDANCE, FLAT, Master, PIECE_RATE
from .pay import EMPLOYED, NOT_EMPLOYED, NO_DATA, UNRESOLVED, MonthPay

SATISFACTORY = "Satisfactory"
AVERAGE = "Average"
BELOW = "Below Average"
INFORMATION_ONLY = "for information only — pay is not tied to attendance"


@dataclass
class Rating:
    staff: str
    month: str
    band: str
    utilisation: float | None
    informational: bool = False
    note: str = ""


def rate(master: Master, mp: MonthPay) -> Rating:
    if mp.state == NOT_EMPLOYED:
        return Rating(mp.staff, mp.month.key, NOT_EMPLOYED, None, True,
                      "no employment spell covers this month")
    if mp.state == UNRESOLVED:
        return Rating(mp.staff, mp.month.key, UNRESOLVED, None, True,
                      "; ".join(mp.notes))
    if mp.state == NO_DATA:
        return Rating(mp.staff, mp.month.key, NO_DATA, None, True,
                      "employed, but nothing was recorded — a tracking gap, not an absence")

    u = mp.utilisation
    if u is None:
        return Rating(mp.staff, mp.month.key, NO_DATA, None, True,
                      "no threshold in force, so utilisation cannot be measured")

    bands = master.bands
    band = (SATISFACTORY if u >= bands["satisfactory"]
            else AVERAGE if u >= bands["average"]
            else BELOW)
    informational = mp.basis in (FLAT, PIECE_RATE)
    return Rating(mp.staff, mp.month.key, band, round(u, 4), informational,
                  INFORMATION_ONLY if informational else "")


def summarise(master: Master, rows: list[MonthPay]) -> dict:
    """Per person, over the months that count."""
    out: dict[str, dict] = {}
    for mp in rows:
        r = rate(master, mp)
        s = out.setdefault(mp.staff, {
            "staff": mp.staff, "months": [], "counted": 0,
            "not_employed": 0, "no_data": 0, "unresolved": 0,
            "bands": {SATISFACTORY: 0, AVERAGE: 0, BELOW: 0},
            "utilisation": None, "informational": False,
        })
        s["months"].append(r)
        if r.band == NOT_EMPLOYED:
            s["not_employed"] += 1
        elif r.band == NO_DATA:
            s["no_data"] += 1
        elif r.band == UNRESOLVED:
            s["unresolved"] += 1
        else:
            s["counted"] += 1
            s["bands"][r.band] += 1
            s["informational"] = s["informational"] or r.informational
    for s in out.values():
        used = [r.utilisation for r in s["months"] if r.utilisation is not None]
        s["utilisation"] = round(fmean(used), 4) if used else None
        s["overall"] = (
            NO_DATA if not used else
            SATISFACTORY if s["utilisation"] >= master.bands["satisfactory"] else
            AVERAGE if s["utilisation"] >= master.bands["average"] else
            BELOW
        )
    return out
