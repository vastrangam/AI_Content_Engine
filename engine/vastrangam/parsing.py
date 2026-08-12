"""Parsing — Part 9. Survives any file shape.

Two rules do the heavy lifting:

  * A header row is real only if the row beneath it carries a date. This is
    structural, so it works whether or not the source has been tidied up, and a
    header sitting on another header is recognised as stray instead of eating a
    month of data.

  * Columns are mapped by name, per block, through the alias table. Columns
    move when someone joins or leaves; people do not.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .calendar_util import DateError, looks_like_date, parse_date
from .karigar import GARMENT_SLOTS, SET_TYPE_SLOTS
from .names import normalise


def cell(row, index):
    try:
        value = row[index]
    except (IndexError, TypeError):
        return None
    if isinstance(value, str) and not value.strip():
        return None
    return value


def is_blank(row) -> bool:
    return all(cell(row, i) is None for i in range(len(row or ())))


# -- header detection -------------------------------------------------------

@dataclass
class Headers:
    real: list = field(default_factory=list)
    stray: list = field(default_factory=list)


def find_headers(rows, marker: str = "date", date_col: int = 0) -> Headers:
    """Where the real headers are, and which ones are strays.

    A row whose first cell reads like the header label is only a header if the
    row underneath it holds a date. Anything else is a leftover.
    """
    want = normalise(marker)
    candidates = [
        i for i, r in enumerate(rows)
        if cell(r, date_col) is not None and normalise(cell(r, date_col)) == want
    ]
    out = Headers()
    for i in candidates:
        below = rows[i + 1] if i + 1 < len(rows) else None
        if below is not None and looks_like_date(cell(below, date_col)):
            out.real.append(i)
        else:
            out.stray.append(i)
    return out


@dataclass
class Block:
    header_row: int
    header: list
    rows: list = field(default_factory=list)


def blocks(rows, marker: str = "date", date_col: int = 0):
    """Split a sheet into header-plus-data blocks.

    Blocks may run in any order, including reverse chronological. Nothing here
    infers order from position — the dates inside decide.
    """
    found = find_headers(rows, marker, date_col)
    stops = sorted(found.real + found.stray) + [len(rows)]
    out = []
    for start in found.real:
        end = next(s for s in stops if s > start)
        body = [r for r in rows[start + 1:end] if not is_blank(r)]
        out.append(Block(start, list(rows[start]), body))
    return out, found.stray


# -- column mapping ---------------------------------------------------------

class MissingColumn(KeyError):
    """A column the report cannot be built without was not in this block."""


def _has_words(text: str, phrase: str) -> bool:
    """Does `phrase` appear in `text` as a run of whole words?"""
    words, want = text.split(), phrase.split()
    if not want:
        return False
    return any(words[i:i + len(want)] == want for i in range(len(words) - len(want) + 1))


def map_columns(header, wanted: dict, required=()) -> dict:
    """{canonical: column index}, matched by name. Never by position.

    `wanted` is {canonical: [written forms]}. A form matches a header cell when
    the normalised strings are equal, or when the form appears inside the cell —
    'Total Qty' still finds 'qty'.
    """
    cells = [(i, normalise(h)) for i, h in enumerate(header) if h is not None and normalise(h)]
    out = {}
    for canonical, forms in wanted.items():
        keys = [normalise(f) for f in ([forms] if isinstance(forms, str) else forms)]
        hit = next((i for i, text in cells if text in keys), None)
        if hit is None:
            # Whole words only. Plain substring matching let a one-letter alias
            # like 'p' find the p in 'Day Type', which quietly read a column of
            # weekday names as a column of hours.
            hit = next((i for i, text in cells
                        if any(k and _has_words(text, k) for k in keys)), None)
        if hit is not None:
            out[canonical] = hit
    missing = [c for c in required if c not in out]
    if missing:
        raise MissingColumn(
            f"block header is missing {missing} — found {[t for _, t in cells]}"
        )
    return out


def map_people(header, resolve, skip=(), not_people=()) -> dict:
    """Every remaining header cell is a person's column. Resolved through the
    alias table, so a new joiner never shifts anyone else's data.

    `not_people` is the table of headings that are never a name — Date, Day,
    Total and so on. It is data, held on the Master, so adding one is an entry
    rather than a change to this function.
    """
    skipped = set(skip)
    blocked = {normalise(n) for n in not_people}
    out = {}
    for i, h in enumerate(header):
        key = normalise(h) if h is not None else ""
        if i in skipped or not key or key in blocked:
            continue
        ident = resolve(h)
        if ident is not None:
            out[i] = ident
    return out


# -- SKU text ---------------------------------------------------------------

_BRACKETS = str.maketrans({"(": " ", ")": " ", "[": " ", "]": " ", "{": " ", "}": " ",
                           "-": " ", "_": " ", "/": " "})


@dataclass
class Sku:
    raw: str
    code: str
    set_type: str | None = None
    slots: tuple = ()


def parse_sku(text) -> Sku:
    """'V508 (Top)', 'V508-TOP', 'v508 top & bottom' — all the same thing.

    Case-insensitive, brackets optional. The longest matching suffix wins, so
    'Top & Bottom' is never read as 'Top'.
    """
    raw = str(text or "").strip()
    flat = " ".join(raw.translate(_BRACKETS).split())
    upper = flat.upper()

    known = sorted(
        list(SET_TYPE_SLOTS) + list(GARMENT_SLOTS),
        key=lambda k: -len(k),
    )
    for name in known:
        cleaned = " ".join(name.translate(_BRACKETS).split()).upper()
        if upper.endswith(" " + cleaned) or upper == cleaned:
            code = flat[: len(flat) - len(cleaned)].strip() if upper != cleaned else ""
            slots = SET_TYPE_SLOTS.get(name) or (GARMENT_SLOTS[name],)
            return Sku(raw, code, name.title(), tuple(slots))
    return Sku(raw, flat)


# -- the two input shapes ---------------------------------------------------

@dataclass
class Entry:
    """One parsed production or attendance fact. Every non-null cell is one."""

    where: str
    date: object = None
    who: str | None = None
    what: str | None = None
    set_type: str | None = None
    qty: float = 0.0
    rate: float | None = None
    value: float | None = None
    paid: float | None = None
    extra: dict = field(default_factory=dict)


def read_wide(rows, resolve_person, sheet="", marker="date", date_col=0,
              fixed=None, review=None):
    """One row per karigar x design, quantities split into columns by set type.

    Each populated column is matched to its master attribute by name, so a
    design may skip a column inside its group without shifting the rest. Every
    non-null cell is one independent entry.
    """
    fixed = fixed or {"design": ["design", "sku", "item", "style"],
                      "karigar": ["karigar", "name", "worker", "vendor"]}
    review = review if review is not None else []
    out = []
    found, strays = blocks(rows, marker, date_col)
    for stray in strays:
        review.append({"where": f"{sheet} row {stray + 1}",
                       "reason": "stray header — no date beneath it", "what": "header"})
    for block in found:
        cols = map_columns(block.header, fixed)
        used = {date_col, *cols.values()}
        qty_cols = {
            i: parse_sku(h).set_type or str(h).strip()
            for i, h in enumerate(block.header)
            if i not in used and h is not None and normalise(h)
        }
        for n, row in enumerate(block.rows):
            when = _safe_date(cell(row, date_col), f"{sheet} row {block.header_row + 2 + n}", review)
            who = cell(row, cols["karigar"]) if "karigar" in cols else None
            design = cell(row, cols["design"]) if "design" in cols else None
            ident = resolve_person(who) if who is not None else None
            for i, set_type in qty_cols.items():
                q = cell(row, i)
                if q is None:
                    continue
                try:
                    qty = float(q)
                except (TypeError, ValueError):
                    review.append({"where": f"{sheet} row {block.header_row + 2 + n}",
                                   "what": q, "reason": f"quantity under {set_type!r} is not a number"})
                    continue
                if not qty:
                    continue
                out.append(Entry(f"{sheet} row {block.header_row + 2 + n}", when, ident,
                                 str(design) if design else None, set_type, qty))
    return out, review


def read_sku_sheet(rows, sheet="", unit=None, marker="date", date_col=0, review=None):
    """Date | SKU | Qty | Rate | Value | Paid — one sheet per unit."""
    review = review if review is not None else []
    wanted = {
        "date": ["date"], "sku": ["sku", "design", "item"], "qty": ["qty", "quantity", "pcs"],
        "rate": ["rate"], "value": ["value", "amount", "total"], "paid": ["paid", "payment"],
    }
    out = []
    found, strays = blocks(rows, marker, date_col)
    for stray in strays:
        review.append({"where": f"{sheet} row {stray + 1}",
                       "reason": "stray header — no date beneath it", "what": "header"})
    for block in found:
        cols = map_columns(block.header, wanted, required=["sku", "qty"])
        for n, row in enumerate(block.rows):
            where = f"{sheet} row {block.header_row + 2 + n}"
            sku = parse_sku(cell(row, cols["sku"]))
            out.append(Entry(
                where,
                _safe_date(cell(row, date_col), where, review),
                unit,
                sku.code or sku.raw,
                sku.set_type,
                _number(cell(row, cols.get("qty")), where, "qty", review) or 0.0,
                _number(cell(row, cols.get("rate")), where, "rate", review),
                _number(cell(row, cols.get("value")), where, "value", review),
                _number(cell(row, cols.get("paid")), where, "paid", review),
                {"sku": sku.raw, "slots": sku.slots},
            ))
    return out, review


def read_attendance_grid(rows, resolve_person, book, sheet="", marker="date",
                         date_col=0, review=None, not_people=()):
    """A month calendar: dates down the left, one column per person.

    This is the shape the entry template produces, and the shape the old files
    already have. Names come from the header of the block being read, never
    carried over from the block before it.
    """
    review = review if review is not None else []
    found, strays = blocks(rows, marker, date_col)
    for stray in strays:
        review.append({"where": f"{sheet} row {stray + 1}",
                       "reason": "stray header — no date beneath it", "what": "header"})
    marks = 0
    for block in found:
        people = map_people(block.header, resolve_person, {date_col}, not_people)
        good = {i: 0 for i in people}
        bad: dict[int, list] = {i: [] for i in people}
        for n, row in enumerate(block.rows):
            where = f"{sheet} row {block.header_row + 2 + n}"
            when = _safe_date(cell(row, date_col), where, review)
            if when is None:
                continue
            for i, ident in people.items():
                mark = cell(row, i)
                if mark is None:
                    continue          # blank is a state, decided later, not here
                try:
                    book.mark(ident, when, mark)
                    marks += 1
                    good[i] += 1
                except ValueError as exc:
                    bad[i].append({"where": where, "what": mark, "reason": str(exc)})
        # A column that produced nothing readable is not a person's column. Say
        # that once, about the column, instead of once per cell underneath it.
        for i, ident in people.items():
            if not bad[i]:
                continue
            if good[i] == 0 and len(bad[i]) > 2:
                review.append({
                    "where": f"{sheet} column {i + 1} ({block.header[i]!r})",
                    "what": block.header[i],
                    "reason": f"column holds no attendance codes at all "
                              f"({len(bad[i])} unreadable cells) — it does not look "
                              f"like a person's column",
                    "examples": [b["what"] for b in bad[i][:3]],
                })
            else:
                review.extend(bad[i])
    return marks, review


def read_role_matrix(rows, resolve_person, sheet="", fixed=None, review=None,
                     not_people=()):
    """The work report shape: people across the top, their roles beneath.

        (blank) (blank)  <person A>          <person B>
        Design  Quantity Pattern  Sampling Cutting QC
        V508    2786              150      300     230

    The lower header is found structurally — it is the row carrying the fixed
    column names. The upper one is forward-filled, because a person spanning
    four role columns is one merged cell and three empties.

    Every populated cell is one entry: design x person x role x hours.
    """
    fixed = fixed or {"design": ["design name", "design", "sku", "style"],
                      "quantity": ["quantity", "qty", "pcs", "pieces"]}
    review = review if review is not None else []
    blocked = {normalise(n) for n in not_people}

    role_row = None
    for i, row in enumerate(rows):
        try:
            cols = map_columns(row, fixed, ["design"])
        except MissingColumn:
            continue
        role_row, role_cols = i, cols
        break
    if role_row is None:
        raise MissingColumn(f"{sheet}: no row carries a design column")
    if role_row == 0:
        raise MissingColumn(f"{sheet}: no person row above the role row")

    # Forward-fill the person row across the columns each name spans.
    people, current = {}, None
    for i, value in enumerate(rows[role_row - 1]):
        key = normalise(value) if value is not None else ""
        if key and key not in blocked:
            current = resolve_person(value)
        if i in role_cols.values():
            current = None          # the fixed columns belong to nobody
            continue
        if current is not None:
            people[i] = current

    entries, quantities = [], {}
    for n, row in enumerate(rows[role_row + 1:], start=role_row + 2):
        if is_blank(row):
            continue
        design = cell(row, role_cols["design"])
        if design is None:
            continue
        design = str(design).strip()
        # A totals row is not a design. Summing it in with the rows it totals is
        # exactly how a cost report doubles itself.
        if normalise(design).startswith("total"):
            continue
        if "quantity" in role_cols:
            q = cell(row, role_cols["quantity"])
            if q is not None:
                try:
                    quantities[design] = float(q)
                except (TypeError, ValueError):
                    review.append({"where": f"{sheet} row {n}", "what": q,
                                   "reason": "quantity is not a number"})
        for i, ident in people.items():
            value = cell(row, i)
            if value is None:
                continue
            try:
                hours = float(value)
            except (TypeError, ValueError):
                review.append({"where": f"{sheet} row {n}", "what": value,
                               "reason": f"hours under column {i + 1} is not a number"})
                continue
            if not hours:
                continue
            role = cell(rows[role_row], i)
            entries.append(Entry(f"{sheet} row {n}", None, ident, design,
                                 str(role or ""), hours))
    return entries, quantities, review


def read_table(rows, wanted: dict, required=(), sheet="", review=None):
    """A plain table with no date column — the work report shape.

    The header is found by looking for the first row that carries every required
    column name, so a title row, a blank row or a logo above it changes nothing.
    """
    review = review if review is not None else []
    out = []
    header_at = None
    for i, row in enumerate(rows):
        try:
            cols = map_columns(row, wanted, required)
        except MissingColumn:
            continue
        header_at = i
        break
    if header_at is None:
        raise MissingColumn(f"{sheet}: no row carries all of {list(required)}")
    for n, row in enumerate(rows[header_at + 1:], start=header_at + 2):
        if is_blank(row):
            continue
        record = {k: cell(row, i) for k, i in cols.items()}
        record["_where"] = f"{sheet} row {n}"
        out.append(record)
    return out, review


def _safe_date(value, where, review):
    try:
        return parse_date(value)
    except DateError as exc:
        review.append({"where": where, "what": value, "reason": str(exc)})
        return None


def _number(value, where, what, review):
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        review.append({"where": where, "what": value, "reason": f"{what} is not a number"})
        return None
