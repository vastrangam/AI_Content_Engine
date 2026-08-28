#!/usr/bin/env python3
"""VALIDATE THE ENGINE AGAINST YOUR OWN WORKBOOKS — one command, one folder.

    python3 engine/tests/validate.py /path/to/your/workbooks

WHY THIS EXISTS

The engine's logic is checked by 317 self-tests that need no data at all. Five
more checks exist that run against the BUSINESS'S OWN files and reproduce its real
figures — payroll, karigar earnings, hours, pieces — and those had to be switched
on by setting five environment variables whose names appeared nowhere in any
delivered document. They sat in the test source and in a superseded report.

So the one person who most needs to run them — the owner, checking the engine
against books he already knows the answer to — had no way to find out they were
there. Writing rules is this side of the line; running them against real data is
his. Making that runnable was never his job and it was always mine.

This takes a FOLDER and works out which file is which, so nothing has to be
renamed or typed. It reports what it found, what it could not, and what each
missing file would have proved.

NOTHING LEAVES THE MACHINE. The workbooks are read where they sit. They are not
copied, uploaded or sent anywhere, and this script has no network code in it.

WHAT IT WILL NOT DO

It will not report success because a file was absent. A check that quietly passes
when its input is missing is indistinguishable from one that ran and found nothing
wrong, and the second is the answer people remember. Anything that did not run is
listed as NOT RUN, with the figures it would have verified.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent

# WHAT EACH WORKBOOK IS FOR, AND HOW IT IS RECOGNISED.
#
# Matched on words in the filename rather than an exact name, because these files
# are the owner's to name and a runner that demands one particular spelling is a
# runner that gets abandoned on the first mismatch. Where two files score equally
# for one slot the runner REFUSES to choose — silently picking between two of
# somebody's workbooks is how the wrong month gets validated and believed.
WORKBOOKS = [
    {
        "var": "VAS_CORPUS",
        "what": "the staff workbook — attendance and payroll",
        "wants": ["staff"],
        "avoid": ["old", "uncorrected", "previous", "karigar"],
        "proves": "9,75,649 payroll · 10,09,023 paid · 10,388 hours · 159 designs",
    },
    {
        "var": "VAS_CORPUS_OLD",
        "what": "the EARLIER, uncorrected staff workbook",
        "wants": ["staff", "old"],
        "avoid": ["karigar"],
        "proves": "that a correction between two versions is detected rather than absorbed",
        "optional": True,
    },
    {
        "var": "VAS_KARIGAR",
        "what": "the karigar production and payment workbook",
        "wants": ["karigar", "production"],
        "avoid": ["reports", "rates"],
        "proves": "34,27,498 earned · 29,12,868 paid · 5,14,630 outstanding · 54,436 pieces",
    },
    {
        "var": "VAS_KARIGAR_REPORTS",
        "what": "the karigar reports workbook (April 2025 onward)",
        "wants": ["karigar", "reports"],
        "avoid": ["rates"],
        "proves": "the §16A run — the combined-period reconciliation",
        "optional": True,
    },
    {
        "var": "VAS_STITCHING_RATES",
        "what": "the stitching rates master",
        "wants": ["stitching", "rates"],
        "avoid": [],
        "proves": "that every piece costs what the rate master says, rather than zero",
        "optional": True,
    },
]


def score(name: str, spec: dict) -> int:
    """How well a filename fits a slot. Negative means it does not fit at all.

    EVERY word must match, not merely one. Scoring on "any" put the same file in
    both VAS_CORPUS and VAS_CORPUS_OLD — the current staff workbook fitted "staff"
    for one slot and "staff" of "staff, old" for the other — which would have run
    the two-version comparison against a file and ITSELF, and passed. A test that
    compares something with itself always agrees.
    """
    low = name.lower()
    if any(a in low for a in spec["avoid"]):
        return -1
    if not all(w in low for w in spec["wants"]):
        return -1
    return len(spec["wants"])


def check_reader() -> str | None:
    """The library that reads spreadsheets, checked before anything is promised.

    Without it every workbook raises deep inside the engine and the owner gets a
    stack trace where an answer should be. Better to say so in one line, first.
    """
    try:
        import openpyxl  # noqa: F401
    except ImportError:
        return ("openpyxl is not installed, so no spreadsheet can be opened.\n"
                "    pip install openpyxl\n"
                "  Nothing else is needed — the engine itself has no dependencies.")
    return None


def main(argv) -> int:
    if len(argv) < 2:
        print(__doc__)
        print("Give me the folder your workbooks are in.\n")
        return 2

    folder = Path(argv[1]).expanduser()
    if not folder.is_dir():
        print(f"validate: {folder} is not a folder.")
        return 2

    books = sorted(p for p in folder.rglob("*.xls*") if not p.name.startswith("~$"))
    if not books:
        print(f"validate: no spreadsheet found under {folder}")
        return 2

    problem = check_reader()
    if problem:
        print(f"validate: {problem}")
        return 2

    print(f"\nLooking in {folder} — {len(books)} workbook(s) found.\n")

    env = dict(os.environ)
    # A file already given to one slot is not offered to another. The word match
    # above should prevent it; this is the second line of defence, because the
    # failure it guards against is invisible — a comparison that agrees with
    # itself looks exactly like a comparison that passed.
    claimed: set[Path] = set()
    chosen: dict[str, Path] = {}
    missing = []

    for spec in WORKBOOKS:
        free = [b for b in books if b not in claimed]
        ranked = sorted(((score(b.name, spec), b) for b in free), key=lambda t: -t[0]) or [(-1, None)]
        best = ranked[0][0]
        if best <= 0:
            missing.append(spec)
            continue
        tied = [b for s, b in ranked if s == best]
        if len(tied) > 1:
            print(f"  ?  {spec['var']:<22} {len(tied)} files fit equally: "
                  f"{', '.join(t.name for t in tied)}")
            print(f"     Set {spec['var']} yourself to say which. "
                  f"Not guessing between your own files.")
            missing.append(spec)
            continue
        chosen[spec["var"]] = tied[0]
        claimed.add(tied[0])
        env[spec["var"]] = str(tied[0])
        print(f"  ok {spec['var']:<22} {tied[0].name}")

    for spec in missing:
        mark = "--" if spec.get("optional") else "!!"
        print(f"  {mark} {spec['var']:<22} not found — {spec['what']}")
        print(f"     would have proved: {spec['proves']}")

    print()
    if not chosen:
        print("Nothing to validate against. The logic checks still run on their own:")
        print("    python3 engine/tests/selftest.py")
        return 1

    print(f"Running the suite with {len(chosen)} of {len(WORKBOOKS)} workbooks wired in.\n")
    print("=" * 70)
    result = subprocess.run([sys.executable, str(HERE / "selftest.py")],
                            env=env, cwd=str(ROOT))
    print("=" * 70)

    required_missing = [s for s in missing if not s.get("optional")]
    if required_missing:
        print(f"\nNOT FULLY VALIDATED. {len(required_missing)} required workbook(s) were absent, "
              f"so these figures were never checked:")
        for spec in required_missing:
            print(f"  · {spec['proves']}")
        print("\nThe suite above may say every test passed. It passed the tests it could RUN.")
        return result.returncode or 1

    if result.returncode == 0:
        print("\nEvery check ran, including the ones against your own figures.")
    return result.returncode


if __name__ == "__main__":
    sys.exit(main(sys.argv))
