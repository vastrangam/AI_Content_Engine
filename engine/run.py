#!/usr/bin/env python3
"""Run the engine over real files.

    python3 engine/run.py --self-test
    python3 engine/run.py --fy 2025-26 --attendance Staff_Report.xlsx \\
                          --work Work_Report.xlsx --payments Payments.xlsx

Every run prints the gate results and a diff against the run before it, then
exits non-zero if any gate failed — so a build that does not tie out cannot be
mistaken for one that does.

Nothing here decides anything. It reads files, calls the rules, and writes what
came back.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from vastrangam import (AttendanceBook, Master, RunLog, allocate, blended_daily,
                        blended_hourly,
                        cost_per_piece_table, fy_months, report, total_payroll)
from vastrangam.allocation import WorkRow
from vastrangam.karigar import KarigarRegistry
from vastrangam.gates import (all_passed, allocation_ties_to_payroll,
                              bottleneck_uses_the_set_composition,
                              combined_equals_periods, earnings_tie_to_source,
                              rows_price_themselves,
                              flat_staff_are_flat, hours_reference_covers_everyone,
                              logs_resolve_once, no_formula_errors,
                              no_person_names_in_logic, nothing_dropped,
                              piece_rate_never_uses_salary,
                              reconciliation_matches_summary, roster_is_explained)
from vastrangam.parsing import (MissingColumn, read_attendance_grid,
                                read_role_matrix, read_table)
from vastrangam.pay import EMPLOYED, NOT_EMPLOYED, NO_DATA, UNRESOLVED

FIXTURE = ROOT / "fixtures" / "master.json"
RULES = ROOT / "fixtures" / "rule_change_log.json"
DEFAULT_OUT = ROOT / "out"


def read_rule_changes(path):
    """§6 — the pay-basis decisions that override what §1.2 would infer."""
    p = Path(path)
    if not p.exists():
        return {}, []
    data = json.loads(p.read_text(encoding="utf-8"))
    overrides, entries = {}, data.get("entries", [])
    for e in entries:
        if not e.get("pay_basis"):
            continue
        who = e["who"]
        for name in ([who] if isinstance(who, str) else who):
            overrides[name] = e["pay_basis"]
    return overrides, entries


def load_master(path, rule_changes):
    """A workbook or the JSON fixture. The workbook is the company's own file."""
    p = Path(path)
    if p.suffix.lower() in (".xlsx", ".xlsm"):
        from vastrangam import template
        got = template.load(p, rule_changes=rule_changes)
        return got.master, got.karigar, got.review, got.sheets_found
    return Master.from_json(p), None, [], {}


def load_sheets(path):
    from vastrangam import xlsx
    if not xlsx.cached_values_present(path):
        print(f"  ! {Path(path).name} holds formulas with no calculated values behind "
              f"them.\n    Open it in Excel or LibreOffice once and save, or the "
              f"figures will read as empty.")
    return xlsx.all_sheets(path)


def read_attendance(master, book, path, review):
    """Every sheet of the workbook, as a month calendar."""
    read = 0
    for name, rows in load_sheets(path).items():
        try:
            got, _ = read_attendance_grid(
                rows, lambda n: master.resolve_person(n, name), book, name,
                review=review, not_people=master.non_person_columns)
            read += got
        except MissingColumn as exc:
            review.append({"where": name, "what": "sheet", "reason": str(exc)})
    return read


def read_work(master, path, review):
    """The work report: a whole-FY aggregate with no month inside it.

    Two shapes are accepted. The matrix — people across the top, roles beneath —
    is what the current files use. The long form, one row per design and person,
    is what an export would produce. Both land in the same WorkRow list.
    """
    rows, quantities = [], {}
    for name, sheet in load_sheets(path).items():
        try:
            entries, qty, _ = read_role_matrix(
                sheet, lambda n: master.resolve_person(n, name), name,
                review=review, not_people=master.non_person_columns)
        except MissingColumn:
            pass
        else:
            quantities.update(qty)
            rows.extend(WorkRow(e.what, e.who, e.qty, e.set_type or "") for e in entries)
            continue

    wanted = {"design": ["design", "sku", "style", "item"],
              "staff": ["staff", "name", "worker", "employee"],
              "role": ["role", "process", "job"],
              "hours": ["hours", "hrs", "time"],
              "quantity": ["quantity", "qty", "pcs", "pieces"]}
    for name, sheet in load_sheets(path).items():
        try:
            table, _ = read_table(sheet, wanted, ["design", "staff", "hours"],
                                  name, review)
        except MissingColumn:
            continue
        for r in table:
            design = str(r["design"]).strip()
            if r.get("quantity") is not None:
                try:
                    quantities[design] = max(quantities.get(design, 0),
                                             float(r["quantity"]))
                except (TypeError, ValueError):
                    review.append({"where": r["_where"], "what": r["quantity"],
                                   "reason": "quantity is not a number"})
            if r.get("staff") is None or r.get("hours") is None:
                continue
            try:
                hours = float(r["hours"])
            except (TypeError, ValueError):
                review.append({"where": r["_where"], "what": r["hours"],
                               "reason": "hours is not a number"})
                continue
            if not hours:
                continue
            rows.append(WorkRow(design, master.resolve_person(r["staff"], name),
                                hours, str(r.get("role") or "")))
    return rows, quantities


def read_payments(master, path, review):
    wanted = {"staff": ["staff", "name", "employee", "paid to"],
              "amount": ["amount", "paid", "payment", "value"],
              "date": ["date"]}
    out = {}
    for name, sheet in load_sheets(path).items():
        try:
            table, _ = read_table(sheet, wanted, ["staff", "amount"], name, review)
        except MissingColumn:
            continue
        for r in table:
            try:
                amount = float(r["amount"])
            except (TypeError, ValueError):
                review.append({"where": r["_where"], "what": r["amount"],
                               "reason": "payment amount is not a number"})
                continue
            ident = master.resolve_person(r["staff"], name)
            out[ident] = round(out.get(ident, 0.0) + amount, 2)
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description="Run the Vastrangam staff engine.")
    ap.add_argument("--master", default=str(FIXTURE),
                    help="master data: the Staff & Karigar Master Data workbook "
                         "(.xlsx), or the JSON fixture")
    ap.add_argument("--rules", default=str(RULES),
                    help="Rule Change Log JSON — overrides inferred pay basis (§6)")
    ap.add_argument("--fy", default="2025-26", help="financial year, e.g. 2025-26")
    ap.add_argument("--attendance", help="attendance workbook (.xlsx)")
    ap.add_argument("--work", help="work report workbook (.xlsx)")
    ap.add_argument("--payments", help="payments workbook (.xlsx)")
    ap.add_argument("--karigar", help="karigar production and payment workbook (.xlsx)")
    ap.add_argument("--rule", choices=["all", "populated", "both"], default="populated",
                    help="set-completion reading: 'populated' = §2.2, the smallest "
                         "populated slot (default) · 'all' = the older reading where an "
                         "empty slot makes the design zero · 'both' prints the two")
    ap.add_argument("--out", default=str(DEFAULT_OUT), help="where to write results")
    ap.add_argument("--self-test", action="store_true",
                    help="run on the fixture alone — no source files needed")
    args = ap.parse_args(argv)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    review: list = []

    print(f"Vastrangam engine — FY{args.fy}")
    print("=" * 70)

    overrides, rule_entries = read_rule_changes(args.rules)
    master, karigar, load_review, sheets = load_master(args.master, overrides)
    review.extend(load_review)
    months = list(fy_months(args.fy))
    print(f"master        {args.master}")
    if sheets:
        print("              tabs: " + ", ".join(
            f"{k}={'—' if not v else v}" for k, v in sheets.items() if v is not None))
    print(f"              {len(master.people)} people, "
          f"{len(master.employment)} spells, {len(master.salary)} salary rows")
    if overrides:
        print(f"rule changes  {len(rule_entries)} entries, "
              f"{len(overrides)} pay-basis overrides")

    book = AttendanceBook()
    marks = 0
    if args.attendance:
        marks = read_attendance(master, book, args.attendance, review)
        print(f"attendance    {marks} marks read from {Path(args.attendance).name}")
    else:
        print("attendance    none supplied — every employed month reports No Data")

    payroll = total_payroll(master, book, args.fy)
    states = {s: 0 for s in (EMPLOYED, NO_DATA, NOT_EMPLOYED, UNRESOLVED)}
    for row in payroll["rows"]:
        states[row.state] = states.get(row.state, 0) + 1

    print(f"payroll       {payroll['total']:,.2f}   (§3.5 — days-based)")
    print(f"              {states[EMPLOYED]} employed months, {states[NO_DATA]} no data, "
          f"{states[NOT_EMPLOYED]} not employed, {states[UNRESOLVED]} unresolvable")

    work_rows, quantities, allocation = [], {}, None
    if args.work:
        work_rows, quantities = read_work(master, args.work, review)
        allocation = allocate(master, args.fy, work_rows, quantities, payroll["total"])
        print(f"designs       {allocation['design_count']} designs, "
              f"{allocation['logged_hours']:,.2f} hours")
        print(f"              {allocation['allocated_cost']:,.2f} allocated, "
              f"{allocation['unallocated_labour']:,.2f} unallocated labour")

    payments = read_payments(master, args.payments, review) if args.payments else {}
    if payments:
        total_paid = round(sum(payments.values()), 2)
        print(f"paid          {total_paid:,.2f} "
              f"({total_paid - payroll['total']:+,.2f} against earnings)")

    # -- karigar -------------------------------------------------------------

    kg = None
    if args.karigar:
        from vastrangam.karigar_run import run as run_karigar
        from vastrangam.karigar import ALL_MEMBERS, POPULATED
        sheets_kg = load_sheets(args.karigar)
        primary = ALL_MEMBERS if args.rule == "all" else POPULATED
        kg = run_karigar(sheets_kg, karigar, rule=primary)
        other = None
        if args.rule == "both":
            other = run_karigar(sheets_kg, KarigarRegistry(), rule=ALL_MEMBERS)
        review.extend(kg.review)
        t = kg.totals
        print(f"karigar       {t['rows']:,} rows, {t['units']} units, "
              f"{t['designs']} designs, {t['pieces']:,.1f} pieces")
        print(f"              {t['earned']:,.2f} earned, {t['paid']:,.2f} paid, "
              f"{t['outstanding']:,.2f} outstanding")
        print(f"              {t['complete_sets']:,} complete sets  "
              f"(rule: {t['set_rule']} — an empty slot "
              f"{'makes the design zero' if t['set_rule'] == ALL_MEMBERS else 'drops out'})")
        if other:
            gap = other.totals["complete_sets"] - t["complete_sets"]
            print(f"              {other.totals['complete_sets']:,} complete sets under the "
                  f"older all-slots reading ({gap:+,}) — kept only so the delivered "
                  f"reports can still be reproduced")
        for period in sorted(set(t["by_period"]) | set(t["paid_by_period"])):
            print(f"              {period}  earned {t['by_period'].get(period, 0):>13,.2f}"
                  f"   paid {t['paid_by_period'].get(period, 0):>13,.2f}")

    # -- gates --------------------------------------------------------------

    print("\ngates")
    gates = [
        logs_resolve_once(master, months),
        hours_reference_covers_everyone(master),
        flat_staff_are_flat(payroll["rows"]),
        piece_rate_never_uses_salary(master, payroll["rows"]),
        reconciliation_matches_summary(payroll["by_staff"], payroll["rows"]),
        roster_is_explained(master, sorted(book.keys())),
    ]
    if allocation:
        gates.append(allocation_ties_to_payroll(allocation))
    if kg:
        gates.append(earnings_tie_to_source(
            kg.units, [e.value or 0.0 for e in kg.entries]))
        gates.append(combined_equals_periods(
            {u: led.earned for u, led in kg.units.items()}, kg.by_period))
        gates.append(rows_price_themselves(kg.entries))
        gates.append(bottleneck_uses_the_set_composition(kg.designs))
    source_rows = marks + len(work_rows) + (len(kg.entries) if kg else 0)
    gates.append(nothing_dropped(source_rows + len(review), source_rows, len(review)))
    if args.attendance or args.work or args.karigar:
        from vastrangam import xlsx
        found = []
        for f in (args.attendance, args.work, args.payments, args.karigar):
            if f:
                found.extend(xlsx.formulas(f))
        gates.append(no_formula_errors(found))
    # Only real master names. A provisional name invented while reading a file
    # is not something the logic could have been written around.
    names = [p.name for p in master.people.values() if p.status == "OK"]
    gates.append(no_person_names_in_logic([ROOT / "vastrangam", ROOT / "run.py"], names))
    print(report(gates))

    # -- outputs ------------------------------------------------------------

    figures = {
        "payroll_total": payroll["total"],
        "by_staff": payroll["by_staff"],
        "months": {k: v for k, v in states.items()},
        "blended_daily": {s: round(blended_daily(master, s, args.fy), 4)
                          for s in sorted(master.people)},
        "blended_hourly": {s: round(blended_hourly(master, s, args.fy), 4)
                           for s in sorted(master.people)},
    }
    if allocation:
        figures["designs"] = allocation["design_count"]
        figures["logged_hours"] = allocation["logged_hours"]
        figures["allocated_cost"] = allocation["allocated_cost"]
        figures["unallocated_labour"] = allocation["unallocated_labour"]
    if payments:
        figures["paid_total"] = round(sum(payments.values()), 2)
    if kg:
        figures["karigar"] = {k: v for k, v in kg.totals.items() if k != "rows"}

    (out_dir / "figures.json").write_text(
        json.dumps(figures, indent=2, ensure_ascii=False), encoding="utf-8")
    (out_dir / "needs_review.json").write_text(
        json.dumps(review + [r.__dict__ for r in master.review], indent=2,
                   ensure_ascii=False, default=str), encoding="utf-8")
    if allocation:
        (out_dir / "cost_per_piece.json").write_text(
            json.dumps(cost_per_piece_table(allocation), indent=2), encoding="utf-8")

    sources = [args.master] + [f for f in (args.attendance, args.work, args.payments,
                                           args.karigar) if f]
    run = RunLog(out_dir).record(sources=sources, gates=gates, figures=figures,
                                note=f"FY{args.fy}")
    print("\n" + RunLog.summary(run))

    n_review = len(review) + len(master.review)
    if n_review:
        print(f"\n{n_review} rows in Needs Review — {out_dir / 'needs_review.json'}")
    print(f"results       {out_dir}")

    if not all_passed(gates) or run["regression"]:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
