"""Measure what an EMPTY slot means, per set type — instead of asserting it.

    VAS_KARIGAR=/path/to/Karigar_Production_and_Payment_Report_FY202527.xlsx \
        python3 engine/tests/derive_slot_optionality.py

WHY THIS EXISTS
engine/fixtures/set_types.json records, for every slot of every set type, whether
an empty one means the design is zero sets (`required: true`) or drops out of the
minimum (`false`). Every entry says `null` — undecided — and the fixture explains
why: the compositions were derived by finding which slot SET reproduces the
recorded totals, and that says nothing about what an EMPTY one of them means.

A slot only answers that question on a design where it is actually empty. So this
script finds those designs and reads the answer off the recorded count:

    slot empty, the file recorded 0 sets            → the slot is REQUIRED
    slot empty, the file recorded min(the others)   → the slot is OPTIONAL
    slot empty, the file recorded something else    → neither; reported as is
    the slot is never empty for this set type       → the data cannot say

It prints one line per set type and slot and changes nothing. Setting a flag is
the owner's decision; this only makes it a decision with evidence under it rather
than a guess. Where the evidence for one slot points both ways, that is printed
too — a split is a real finding about the source, not something to average away.
"""

from __future__ import annotations

import os
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from vastrangam import xlsx                              # noqa: E402
from vastrangam.karigar import POPULATED                 # noqa: E402
from vastrangam.karigar_run import run as run_karigar    # noqa: E402
from vastrangam.names import normalise                   # noqa: E402

REQUIRED, OPTIONAL, NEITHER = "required", "optional", "neither"


def recorded_sets(sheets: dict) -> dict:
    """Total Complete Sets as the FILE recorded it, per design."""
    out = {}
    for name, rows in sheets.items():
        if "combined production" not in normalise(name):
            continue
        for r in rows[2:]:
            design = str(r[1]).strip() if len(r) > 1 and r[1] else ""
            if not design or design.startswith("▸") or len(r) < 4:
                continue
            try:
                out[design] = int(float(r[3]))
            except (TypeError, ValueError):
                continue
    return out


def verdict(counts: dict, slot: str, members, recorded: int) -> str:
    """What one design says about one empty slot."""
    others = [int(counts.get(s, 0)) for s in members if s != slot]
    loose = min(others) if others else 0
    if recorded == 0 and loose > 0:
        return REQUIRED
    if recorded == loose and loose > 0:
        return OPTIONAL
    return NEITHER


def main() -> int:
    path = os.environ.get("VAS_KARIGAR")
    if not path or not Path(path).exists():
        print("Set VAS_KARIGAR to the karigar workbook. Nothing is measured without it,\n"
              "and a number that was not measured is not an answer.")
        return 2

    sheets = xlsx.all_sheets(path)
    result = run_karigar(sheets, rule=POPULATED)
    recorded = recorded_sets(sheets)

    # (set type, slot) -> {verdict: [designs]}
    evidence = defaultdict(lambda: defaultdict(list))
    never_empty = defaultdict(set)

    for design, res in result.designs.items():
        label = result.set_labels.get(design)
        members = result.set_types.get(design)
        if not label or not members or design not in recorded:
            continue
        for slot in members:
            if int(res.slots.get(slot, 0)) > 0:
                never_empty[(label, slot)].add(design)
                continue
            evidence[(label, slot)][
                verdict(res.slots, slot, members, recorded[design])].append(design)

    keys = sorted(set(evidence) | set(never_empty))
    print(f"\n{len(keys)} set-type slots, measured against {len(recorded):,} recorded designs\n")
    width = max((len(f"{a} · {b}") for a, b in keys), default=20)
    for key in keys:
        label, slot = key
        by = evidence.get(key, {})
        empties = sum(len(v) for v in by.values())
        head = f"{label} · {slot}".ljust(width)
        if not empties:
            print(f"  {head}  never empty in {len(never_empty[key])} designs — "
                  f"the data cannot say")
            continue
        parts = [f"{k}={len(v)}" for k, v in sorted(by.items())]
        answers = [k for k in (REQUIRED, OPTIONAL) if by.get(k)]
        if len(answers) == 1 and not by.get(NEITHER):
            says = f"→ {answers[0]}"
        elif len(answers) == 1:
            says = f"→ {answers[0]}, with {len(by[NEITHER])} design(s) matching neither"
        elif len(answers) == 2:
            says = "→ SPLIT — the source answers both ways for this slot"
        else:
            says = "→ no design settles it"
        print(f"  {head}  {empties} empty ({', '.join(parts)})  {says}")

    print("\nNothing was written. Set the flags in engine/fixtures/set_types.json.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
