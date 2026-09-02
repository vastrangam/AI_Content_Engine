"""The run log — Part 12.

The data keeps being corrected, so every run records what it saw and what moved.

A number that moved because a source file was fixed is expected, and it must be
visible. A number that moved while every input stayed identical is a regression,
and it fails the build.
"""

from __future__ import annotations

import datetime as _dt
import hashlib
import json
from dataclasses import asdict, is_dataclass
from pathlib import Path


def file_hash(path) -> str:
    p = Path(path)
    if not p.exists():
        return "missing"
    h = hashlib.sha256()
    with p.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()[:16]


def _plain(value):
    if is_dataclass(value) and not isinstance(value, type):
        return _plain(asdict(value))
    if isinstance(value, dict):
        return {str(k): _plain(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_plain(v) for v in value]
    if isinstance(value, (_dt.date, _dt.datetime)):
        return value.isoformat()
    if isinstance(value, float):
        return round(value, 4)
    return value


def flatten(figures, prefix="") -> dict:
    """Every number in a result tree, addressable by path."""
    out = {}
    data = _plain(figures)
    if isinstance(data, dict):
        for k, v in data.items():
            out.update(flatten(v, f"{prefix}.{k}" if prefix else str(k)))
    elif isinstance(data, list):
        for i, v in enumerate(data):
            out.update(flatten(v, f"{prefix}[{i}]"))
    elif isinstance(data, (int, float)) and not isinstance(data, bool):
        out[prefix] = float(data)
    return out


class RunLog:
    def __init__(self, directory):
        self.dir = Path(directory)
        self.dir.mkdir(parents=True, exist_ok=True)

    @property
    def path(self) -> Path:
        return self.dir / "run_log.json"

    def previous(self) -> dict | None:
        runs = self._all()
        return runs[-1] if runs else None

    def _all(self) -> list:
        if not self.path.exists():
            return []
        return json.loads(self.path.read_text(encoding="utf-8"))

    def record(self, *, sources, gates, figures, note="") -> dict:
        """Write this run, and the diff against the one before it."""
        previous = self.previous()
        now = flatten(figures)
        before = previous["figures"] if previous else {}

        moved = []
        for key in sorted(set(now) | set(before)):
            old, new = before.get(key), now.get(key)
            if old is None and new is None:
                continue
            if old is None or new is None or abs(new - old) > 1e-6:
                moved.append({"figure": key, "was": old, "now": new,
                              "change": None if old is None or new is None
                                        else round(new - old, 4)})

        hashes = {str(s): file_hash(s) for s in sources}
        inputs_changed = bool(previous) and hashes != previous.get("sources")
        regression = bool(previous) and bool(moved) and not inputs_changed

        run = {
            "run_id": _dt.datetime.now().strftime("%Y%m%d-%H%M%S"),
            "timestamp": _dt.datetime.now().isoformat(timespec="seconds"),
            "note": note,
            "sources": hashes,
            "first_run": previous is None,
            "inputs_changed": inputs_changed,
            "gates": [{"gate": g.gate, "passed": g.passed, "detail": g.detail}
                      for g in gates],
            "gates_passed": all(g.passed for g in gates),
            "figures": now,
            "moved": moved,
            "regression": regression,
        }
        runs = self._all() + [run]
        self.path.write_text(json.dumps(runs, indent=2, ensure_ascii=False), encoding="utf-8")
        return run

    @staticmethod
    def summary(run: dict) -> str:
        lines = [f"run {run['run_id']}   {run['timestamp']}"]
        if run["note"]:
            lines.append(f"  {run['note']}")
        for g in run["gates"]:
            lines.append(f"  {'ok  ' if g['passed'] else 'FAIL'} {g['gate']}"
                         + (f" — {g['detail']}" if g["detail"] else ""))
        if run.get("first_run"):
            lines.append(f"  first run — {len(run['moved'])} figures recorded as the "
                         f"baseline, nothing to compare against yet")
        elif run["moved"]:
            why = "inputs changed" if run["inputs_changed"] else "INPUTS IDENTICAL"
            lines.append(f"  {len(run['moved'])} figures moved ({why}):")
            for m in run["moved"][:25]:
                lines.append(f"    {m['figure']}: {m['was']} -> {m['now']}")
            if len(run["moved"]) > 25:
                lines.append(f"    ... and {len(run['moved']) - 25} more")
        else:
            lines.append("  no figure moved")
        if run["regression"]:
            lines.append("  REGRESSION — figures moved with no input change. Build fails.")
        return "\n".join(lines)
