"""The Staff & Karigar Master Data workbook — §1 of the Universal Master Prompt.

The prompt keeps mechanics in the prompt and company data in this workbook, which
is the same split the engine already makes: rules in code, data in the logs. So
this module does one job — turn the three tabs into the logs that already exist.

It reads by column name, never by position, so a company can add a column or
reorder them and nothing breaks.

**Personal and banking data never leaves this module.** Aadhaar, PAN, bank name,
account number, IFSC, UPI, phone and address are returned in a separate object
that nothing else writes to disk. They are not attached to the Master, so they
cannot reach a JSON dump, a report or a commit by accident.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from .calendar_util import DateError, parse_date
from .karigar import KarigarRegistry
from .attendance import SUNDAY, WEEKDAY
from .master import (ACTIVE, ATTENDANCE, DAILY_WAGE, FLAT, INACTIVE, PER_HOUR,
                     PER_PIECE, PIECE_RATE, Master)
from .names import normalise
from .parsing import MissingColumn, cell, is_blank, map_columns

# §1.1. Every field is optional except a name — a company that does not collect
# Aadhaar simply leaves the column out.
STAFF_COLUMNS = {
    "staff_id": ["staff id", "id", "emp id", "employee id", "code"],
    "name": ["name", "staff name", "employee name"],
    "gender": ["gender", "sex"],
    "role": ["role", "designation", "post"],
    "kra": ["kra", "responsibility"],
    "phone": ["phone", "mobile", "contact"],
    "address": ["address"],
    "aadhaar": ["aadhaar", "aadhar", "aadhaar no", "uid"],
    "pan": ["pan", "pan no"],
    "bank_name": ["bank name", "bank"],
    "account_no": ["account no", "account number", "a/c no", "account"],
    "ifsc": ["ifsc", "ifsc code"],
    "upi": ["upi id", "upi"],
    "monthly_salary": ["monthly salary", "salary"],
    "threshold_hour": ["threshold hour", "threshold hours", "monthly hours"],
    "threshold_day": ["threshold day", "threshold days", "monthly days"],
    "daily_wage": ["daily wage", "daily rate", "per day"],
    "join_date": ["join date", "joining date", "doj", "date of joining"],
    "leave_date": ["leave date", "exit date", "last working day", "relieving date"],
    "status": ["status", "active"],
    "pay_basis": ["pay basis", "basis"],
    "shift_group": ["category", "shift group", "hours category"],
}

# What must never be written anywhere. Read, held in memory, and dropped.
SENSITIVE = ("phone", "address", "aadhaar", "pan", "bank_name", "account_no",
             "ifsc", "upi")

HOURS_COLUMNS = {
    "category": ["category", "gender", "group", "department", "shift"],
    "day_type": ["day type", "daytype", "day"],
    "hours": ["present", "p hours", "present hours", "hours", "p"],
    "notes": ["notes", "note", "remark", "remarks"],
}

KARIGAR_COLUMNS = {
    "karigar_id": ["karigar id", "id", "code"],
    "name": ["karigar name", "name"],
    "kra": ["kra"],
    "phone": ["phone", "mobile", "contact"],
    "address": ["address"],
    "aadhaar": ["aadhaar", "aadhar", "uid"],
    "pan": ["pan"],
    "bank_name": ["bank name", "bank"],
    "account_no": ["account no", "account number", "a/c no"],
    "ifsc": ["ifsc"],
    "upi": ["upi id", "upi"],
    "earning_per_piece": ["earning", "per piece", "earning per piece wise",
                          "earning per piece"],
    "join_date": ["join date", "joining date", "doj"],
    "status": ["status"],
}

LOG_COLUMNS = {
    "staff": ["staff", "name", "staff name", "employee"],
    "from": ["effective from", "from", "start"],
    "to": ["effective to", "to", "end"],
    "value": ["rate", "value", "salary", "threshold", "amount", "wage"],
}

SHEET_ALIASES = {
    "staff_master": ["staff master", "staff"],
    "hours_reference": ["hours reference", "hours ref", "hours"],
    "karigar_master": ["karigar master", "karigar"],
    "salary_log": ["salary log"],
    "threshold_hours_log": ["threshold hours log", "threshold hour log"],
    "threshold_days_log": ["threshold days log", "threshold day log"],
    "threshold_log": ["threshold log"],
    "daily_wage_log": ["daily wage log"],
    "pay_basis_log": ["pay basis log", "basis log"],
    "piece_rate_log": ["piece rate log", "piece rate"],
    "hourly_rate_log": ["hourly rate log", "hourly rate", "rate per hour log"],
    "piece_rate_card": ["piece rate card", "rate card", "operation rate card"],
}

PIECE_RATE_COLUMNS = dict(LOG_COLUMNS, unit=["unit", "per", "basis"])
HOURLY_RATE_COLUMNS = dict(PIECE_RATE_COLUMNS, operation=["operation", "work", "process"])
# The rate card has no Staff column at all, which is the whole point of it.
RATE_CARD_COLUMNS = {
    "operation": ["operation", "work", "process"],
    "garment": ["garment", "item", "product", "design"],
    "from": ["effective from", "from", "start", "w e f"],
    "to": ["effective to", "to", "end", "until"],
    "value": ["rate", "value", "amount", "per piece"],
}


@dataclass
class Contacts:
    """Personal and banking details, held in memory only.

    Nothing in the engine serialises this. It exists so a payment run can look
    up an account number, and it is deliberately awkward to write out.
    """

    staff: dict = field(default_factory=dict)
    karigar: dict = field(default_factory=dict)

    def to_json(self):
        raise PermissionError(
            "personal and banking details are never written to a file by this "
            "engine. Read them from the master workbook at the moment you need "
            "them; do not persist them alongside the reports."
        )


@dataclass
class TemplateLoad:
    master: Master
    karigar: KarigarRegistry
    contacts: Contacts
    review: list = field(default_factory=list)
    sheets_found: dict = field(default_factory=dict)


def _find_sheet(sheets: dict, kind: str):
    wanted = SHEET_ALIASES[kind]
    for name in sheets:
        if normalise(name) in {normalise(w) for w in wanted}:
            return name, sheets[name]
    for name in sheets:                       # then a looser containment match
        key = normalise(name)
        if any(normalise(w) in key for w in wanted):
            return name, sheets[name]
    return None, None


def _rows_of(sheet, columns, required, where, review, min_columns=2):
    """Header found structurally: the first row that carries the required names.

    A header must also map at least two columns and hold at least two filled
    cells. Without that, a one-cell title like 'Working Hours Reference' is a
    valid header for a table wanting an 'hours' column — and the whole tab then
    reads as gibberish while appearing to have been read.
    """
    for i, row in enumerate(sheet):
        filled = [c for c in row if c is not None and str(c).strip()]
        if len(filled) < min_columns:
            continue
        try:
            cols = map_columns(row, columns, required)
        except MissingColumn:
            continue
        if len(cols) < min_columns:
            continue
        out = []
        for n, r in enumerate(sheet[i + 1:], start=i + 2):
            if is_blank(r):
                continue
            record = {k: cell(r, idx) for k, idx in cols.items()}
            record["_where"] = f"{where} row {n}"
            out.append(record)
        return out
    review.append({"where": where, "what": "sheet",
                   "reason": f"no header row carries all of {list(required)}"})
    return []


def _number(value):
    if value is None or (isinstance(value, str) and not value.strip()):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _text(value):
    if value is None:
        return None
    s = str(value).strip()
    return s or None


def infer_pay_basis(salary, threshold_hour, daily_wage) -> tuple[str | None, str]:
    """§1.2 — the basis follows from which columns are filled.

    Returns the basis and a note. One combination has no valid answer and is
    returned as None rather than guessed.
    """
    has_salary = salary is not None
    has_hours = threshold_hour is not None
    has_wage = daily_wage is not None

    if has_salary and has_hours:
        return ATTENDANCE, "salary and threshold both present"
    if not has_salary and has_wage:
        return DAILY_WAGE, "no salary, daily wage present"
    if not has_salary and has_hours and not has_wage:
        # §1.2 calls this Flat, but §4.3 pays Flat staff their full Monthly
        # Salary — and the salary is blank. There is nothing to pay. Refuse it.
        return None, (
            "salary blank with a threshold hour set: §1.2 reads this as Flat, "
            "but §4.3 pays Flat staff their monthly salary and there is none. "
            "Fill the salary, or state the basis in the Pay Basis column"
        )
    if not (has_salary or has_hours or has_wage):
        return PIECE_RATE, "no salary, threshold or wage — rate lives in the work report"
    if has_salary and not has_hours and not has_wage:
        return FLAT, "salary only, no threshold and no daily wage"
    return ATTENDANCE, "salary, threshold and daily wage all present — salary basis used"


def _basis_from_column(value):
    if value is None:
        return None
    key = normalise(value)
    for basis in (FLAT, ATTENDANCE, DAILY_WAGE, PIECE_RATE):
        if normalise(basis) == key or normalise(basis).split("-")[0] == key:
            return basis
    if key.startswith("piece"):
        return PIECE_RATE
    if key.startswith("daily"):
        return DAILY_WAGE
    if key.startswith("attend") or key.startswith("hour"):
        return ATTENDANCE
    if key.startswith("flat") or key.startswith("fix"):
        return FLAT
    return None


def load(path, fy_start="2025-04-01", rule_changes=None) -> TemplateLoad:
    """Read the workbook into a Master, a KarigarRegistry and held-aside contacts."""
    from . import xlsx

    sheets = xlsx.all_sheets(path)
    master, karigar, contacts, review = Master(), KarigarRegistry(), Contacts(), []
    found = {}

    # -- Hours Reference first: pay cannot be priced without it --------------
    name, sheet = _find_sheet(sheets, "hours_reference")
    found["hours_reference"] = name
    if sheet:
        rows = _rows_of(sheet, HOURS_COLUMNS, ["hours"], name, review)
        table, unreadable = {}, 0
        for r in rows:
            hours = _number(r.get("hours"))
            if hours is None:
                # The guidance notes under the table have text in one column and
                # nothing else. They are not rows, and they are not errors.
                if _text(r.get("day_type")) or _text(r.get("hours")):
                    review.append({"where": r["_where"], "what": r.get("hours"),
                                   "reason": "present hours is not a number"})
                    unreadable += 1
                continue
            table[(_text(r.get("category")) or "*",
                   _canonical_day_type(r.get("day_type")))] = hours
        if table:
            master.shift_hours = table
        else:
            # Never quietly keep a built-in table. §4.5 forbids assuming one.
            master.shift_hours = {}
            review.append({"where": name, "what": "Hours Reference",
                           "reason": f"no usable rows ({unreadable} unreadable) — "
                                     f"hours cannot be priced, and no default is "
                                     f"substituted"})
    else:
        review.append({"where": str(path), "what": "Hours Reference",
                       "reason": "tab not found — §4.5 forbids assuming a generic "
                                 "hours table, so hours cannot be priced"})

    # -- Staff Master --------------------------------------------------------
    name, sheet = _find_sheet(sheets, "staff_master")
    found["staff_master"] = name
    if not sheet:
        review.append({"where": str(path), "what": "Staff Master",
                       "reason": "tab not found"})
        return TemplateLoad(master, karigar, contacts, review, found)

    overrides = {normalise(k): v for k, v in (rule_changes or {}).items()}

    for r in _rows_of(sheet, STAFF_COLUMNS, ["name"], name, review):
        person_name = _text(r.get("name"))
        if not person_name:
            continue
        ident = _text(r.get("staff_id")) or person_name
        # Kept as written. The Hours Reference category is matched against this
        # word, and folding "Male" to "M" would stop it matching a table that
        # says "Male" — §4.5 flags a category with no row, so a silent rename
        # here would turn a working file into a flagged one.
        gender = _text(r.get("gender")) or "M"
        status_text = normalise(r.get("status")) or "active"
        roster = INACTIVE if status_text.startswith("inactive") else ACTIVE

        aliases = [person_name]
        if _text(r.get("staff_id")):
            aliases.append(_text(r["staff_id"]))
        master.add_person(ident, person_name, gender, aliases,
                          _text(r.get("shift_group")),
                          [_text(r.get("role"))] if _text(r.get("role")) else (),
                          "OK", roster)

        contacts.staff[ident] = {k: _text(r.get(k)) for k in SENSITIVE
                                 if _text(r.get(k))}

        # Employment. §1.1 has a Join Date; an exit date is only present if the
        # company added the column. Without a join date the person cannot be
        # placed in time at all, so that is an error rather than a default.
        joined = _safe_date(r.get("join_date"), r["_where"], review)
        if joined is None:
            review.append({"where": r["_where"], "what": person_name,
                           "reason": "no join date — the person cannot be placed "
                                     "in any month, so no pay can be resolved"})
            continue
        master.employment.join(ident, joined,
                               _safe_date(r.get("leave_date"), r["_where"], review))

        salary = _number(r.get("monthly_salary"))
        thr_hour = _number(r.get("threshold_hour"))
        thr_day = _number(r.get("threshold_day"))
        wage = _number(r.get("daily_wage"))

        basis = _basis_from_column(r.get("pay_basis"))
        why = "stated in the Pay Basis column"
        if basis is None:
            basis, why = infer_pay_basis(salary, thr_hour, wage)
        override = overrides.get(normalise(person_name)) or overrides.get(normalise(ident))
        if override:
            basis, why = override, "Rule Change Log override (§6)"
        if basis is None:
            master.flag(person_name, why, r["_where"])
            continue
        master.pay_basis.add(ident, joined, None, basis)

        if salary is not None:
            master.salary.add(ident, joined, None, salary)
        if wage is not None:
            master.daily_wage.add(ident, joined, None, wage)
        if thr_hour is not None:
            master.threshold_hours.add(ident, joined, None, thr_hour)

        # §1.1 has no Threshold Day column, and the day threshold cannot be
        # derived from the hour one: 280 / 10 gives 28 for a ten-hour day, but
        # 230 / 8 gives 28.75 where the real threshold is 28. So it is read when
        # present, derived with a flag when not, and never silently assumed.
        if thr_day is not None:
            master.threshold_days.add(ident, joined, None, thr_day)
        elif basis == ATTENDANCE and thr_hour:
            weekday = _weekday_hours(master, gender, _text(r.get("shift_group")))
            if weekday:
                derived = round(thr_hour / weekday, 4)
                master.threshold_days.add(ident, joined, None, derived)
                review.append({
                    "where": r["_where"], "what": person_name,
                    "reason": f"no Threshold Day column — derived {derived:g} days "
                              f"from {thr_hour:g} hours at {weekday:g} h/day. Add a "
                              f"Threshold Day column; this derivation is exact for a "
                              f"ten-hour day and wrong for an eight-hour one",
                })
            else:
                review.append({"where": r["_where"], "what": person_name,
                               "reason": "no Threshold Day column and no weekday hours "
                                         "to derive it from — pay cannot be resolved"})

    # -- Karigar Master ------------------------------------------------------
    name, sheet = _find_sheet(sheets, "karigar_master")
    found["karigar_master"] = name
    if sheet:
        for r in _rows_of(sheet, KARIGAR_COLUMNS, ["name"], name, review):
            label = _text(r.get("name"))
            if not label:
                continue
            ident = _text(r.get("karigar_id")) or label
            karigar.add_unit(ident, label)
            joined = _safe_date(r.get("join_date"), r["_where"], review)
            karigar.label(ident, joined or fy_start, label)
            contacts.karigar[ident] = {k: _text(r.get(k)) for k in SENSITIVE
                                       if _text(r.get(k))}
            rate = _number(r.get("earning_per_piece"))
            if rate is not None:
                # §1.3 — a headline reference only, never the per-design rate card.
                karigar.units[ident].reference_rate = rate

    # -- optional effective-dated logs (§4.6) --------------------------------
    _load_log(sheets, "salary_log", master.salary, master, review, found)
    _load_log(sheets, "daily_wage_log", master.daily_wage, master, review, found)
    _load_log(sheets, "threshold_hours_log", master.threshold_hours, master, review, found)
    _load_log(sheets, "threshold_days_log", master.threshold_days, master, review, found)
    _load_log(sheets, "pay_basis_log", master.pay_basis, master, review, found, text=True)
    _load_piece_rates(sheets, master, review, found)
    _load_hourly_rates(sheets, master, review, found)
    _load_rate_card(sheets, master, review, found)
    _split_personal_hours(master)

    name, _sheet = _find_sheet(sheets, "threshold_log")
    if _sheet is not None and not found.get("threshold_hours_log"):
        review.append({
            "where": name, "what": "Threshold Log",
            "reason": "§4.6 names one Threshold Log, but hours and days are separate "
                      "thresholds that can move together — split it into "
                      "'Threshold Hours Log' and 'Threshold Days Log'",
        })

    return TemplateLoad(master, karigar, contacts, review, found)


def _canonical_day_type(value) -> str:
    """'Sunday / Weekly Off', 'Weekly Off', 'Sun' all mean the same day.

    A company that writes its own wording for the rest day should not have to
    match a string the engine chose. Anything not recognisable as the rest day
    is a weekday; a blank cell means the row applies to every day.
    """
    text = normalise(value)
    if not text:
        return "*"
    if any(word in text for word in ("sunday", "sun", "weekly off", "week off",
                                     "rest", "holiday")):
        return SUNDAY
    return WEEKDAY


def _weekday_hours(master: Master, gender, group):
    for key in ((group or gender, "Weekday"), (group or gender, "*"), ("*", "Weekday"),
                ("*", "*")):
        if key in master.shift_hours:
            return master.shift_hours[key]
    return None


def _load_piece_rates(sheets, master, review, found):
    """A tab that used to hold two different things, and now holds one.

    It was "the rate for piece-rate staff, with the unit it is per" — a Staff column, a
    rate, and a unit that could say per piece or per hour. That worked while both kinds
    of rate belonged to a person. They do not: a piece rate belongs to an OPERATION on a
    GARMENT and is shared by everyone doing that work, while a rate per hour is genuinely
    the person's. Two facts that were sharing one tab.

    So a row here quoted PER HOUR is loaded into the hourly log, where it belongs and
    where the pay code looks for it. A row quoted per piece against a person's name is
    sent to review rather than loaded, because there is no longer anywhere to put it that
    would not be a guess about which garment it prices — and a rate silently attached to
    the wrong garment is money, not a formatting problem.
    """
    name, sheet = _find_sheet(sheets, "piece_rate_log")
    found["piece_rate_log"] = name
    if not sheet:
        return
    for r in _rows_of(sheet, PIECE_RATE_COLUMNS, ["staff", "from", "value"], name, review):
        ident = master.alias.lookup(r["staff"])
        if ident is None:
            review.append({"where": r["_where"], "what": r["staff"],
                           "reason": "piece rate log: name is not in Staff Master"})
            continue
        rate = _number(r["value"])
        if rate is None:
            review.append({"where": r["_where"], "what": r["value"],
                           "reason": "piece rate is not a number"})
            continue
        if "hour" not in normalise(r.get("unit")):
            review.append({
                "where": r["_where"], "what": r["staff"],
                "reason": "a rate per piece belongs to an operation on a garment, not to a "
                          "person — move it to the production rate card, or say 'per hour' "
                          "here if it really is an hourly rate",
            })
            continue
        master.hourly_rate.add(ident, r["from"], r.get("to"), {
            "rate": rate, "unit": PER_HOUR, "operation": None,
        })


def _load_rate_card(sheets, master, review, found):
    """The piece rates, addressed by the operation and the garment they price.

    The owner states each one once — "Iron · Anarkali 7.5", "Dhaga Cutting · Dupatta 1" —
    and everybody doing that operation is paid at it. Nobody's name appears, which is
    what makes adding the fourth person to an operation a row in the roster rather than
    a rate somebody has to remember to copy.
    """
    name, sheet = _find_sheet(sheets, "piece_rate_card")
    found["piece_rate_card"] = name
    if not sheet:
        return
    for r in _rows_of(sheet, RATE_CARD_COLUMNS,
                      ["operation", "garment", "from", "value"], name, review):
        rate = _number(r["value"])
        if rate is None:
            review.append({"where": r["_where"], "what": r["value"],
                           "reason": "piece rate is not a number"})
            continue
        master.piece_rate.add(f"{_text(r['operation'])}|{_text(r['garment'])}",
                              r["from"], r.get("to"), rate)


def _split_personal_hours(master):
    """An Hours Reference row whose Category is a PERSON is that person's own clock.

    Two people here work 09:00-17:30 with a 09:00-13:00 Sunday — neither the male shift
    nor the female one — and one master's Sunday carries no lunch break at all. Their
    hours are facts about them, not about a category, and the only honest place to write
    that in a workbook is a row against their name.

    It runs after Staff Master, because deciding whether a Category cell holds a category
    or somebody's name needs the alias table, and the alias table does not exist until
    the staff tab has been read. Leaving such a row in the category table would price
    every future person put in that category at two other people's hours.
    """
    if not master.shift_hours:
        return
    category, personal = {}, {}
    for (cat, kind), hours in master.shift_hours.items():
        ident = master.alias.lookup(cat) if cat and cat != "*" else None
        (personal if ident else category)[((ident or cat), kind)] = hours
    master.shift_hours = category
    master.shift_hours_by_person.update(personal)


def _load_hourly_rates(sheets, master, review, found):
    """A person's own rate per hour, with the work it was agreed for.

    §1.2 puts output rates in the production file, and for output priced per piece that
    is right. A rate quoted per hour has nowhere to live there — the work report carries
    hours, not rates — so this optional tab is where it goes. Without it those months
    resolve as Unresolvable, which is correct but not useful.
    """
    name, sheet = _find_sheet(sheets, "hourly_rate_log")
    found["hourly_rate_log"] = name
    if not sheet:
        return
    for r in _rows_of(sheet, HOURLY_RATE_COLUMNS, ["staff", "from", "value"], name, review):
        ident = master.alias.lookup(r["staff"])
        if ident is None:
            review.append({"where": r["_where"], "what": r["staff"],
                           "reason": "hourly rate log: name is not in Staff Master"})
            continue
        rate = _number(r["value"])
        if rate is None:
            review.append({"where": r["_where"], "what": r["value"],
                           "reason": "hourly rate is not a number"})
            continue
        master.hourly_rate.add(ident, r["from"], r.get("to"), {
            "rate": rate, "unit": PER_HOUR,
            "operation": (r.get("operation") or None),
        })


def _load_log(sheets, kind, log, master, review, found, text=False):
    """Replace the synthesised open row with real history, when a tab supplies it."""
    name, sheet = _find_sheet(sheets, kind)
    found[kind] = name
    if not sheet:
        return
    rows = _rows_of(sheet, LOG_COLUMNS, ["staff", "from", "value"], name, review)
    if not rows:
        return
    touched = set()
    for r in rows:
        ident = master.alias.lookup(r["staff"])
        if ident is None:
            review.append({"where": r["_where"], "what": r["staff"],
                           "reason": f"{kind}: name is not in Staff Master"})
            continue
        if ident not in touched:
            log._rows.pop(ident, None)     # the synthesised row gives way to history
            touched.add(ident)
        value = _text(r["value"]) if text else _number(r["value"])
        if value is None:
            review.append({"where": r["_where"], "what": r["value"],
                           "reason": f"{kind}: value is not usable"})
            continue
        log.add(ident, r["from"], r.get("to"), value)


def _safe_date(value, where, review):
    if value is None or (isinstance(value, str) and not value.strip()):
        return None
    try:
        return parse_date(value)
    except DateError as exc:
        review.append({"where": where, "what": value, "reason": str(exc)})
        return None
