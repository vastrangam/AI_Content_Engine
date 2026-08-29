'use strict';
/* Effective-dated logs — ported rule for rule from the tenant engine's Python
 * implementation, which is where the behaviour below was worked out and is tested
 * against a real payroll. That file is not in this archive: it belongs to a tenant, and
 * the product ships without one. Naming its path here sent a reader to a file they do
 * not have and put a customer's name in the product's own engine, which is the one
 * place §0 says it may never be.

   A value is never overwritten. The open row is closed and a new one appended,
   so history stays intact and a future-dated row activates by itself when that
   month arrives.

   The rule that matters most, and the reason this is a shared primitive rather
   than something each module reinvents:

       Zero matches is an ERROR, not zero.

   Silently returning 0 is how a person earns nothing without anyone noticing,
   how a tax rate becomes 0% for a month, and how a price becomes free. Every
   log in the system — salary, threshold, piece rate, GST rate, commission,
   channel price, credit limit — resolves through here.

   The accounting prompt asks for exactly this shape independently (§4:
   "tax rate must be versioned by effective date, not a single static field, so
   historical invoices remain correct"), which is why it lives in core/ and not
   in the payroll module.

   Pure. No database, no DOM. */

const FOREVER = '9999-12-31';

class Unresolved extends Error {
  constructor(log, key, when) {
    super(`${log}: nothing in force for ${JSON.stringify(key)} in ${when}`);
    this.name = 'Unresolved';
    this.log = log; this.key = key; this.when = when;
  }
}

class Ambiguous extends Error {
  constructor(log, key, when, rows) {
    const spans = rows.map((r) => r.span).join(' / ');
    super(`${log}: ${rows.length} rows in force for ${JSON.stringify(key)} in ${when} -> ${spans}`);
    this.name = 'Ambiguous';
    this.log = log; this.key = key; this.when = when; this.rows = rows;
  }
}

/* -- dates ---------------------------------------------------------------
   ISO strings throughout. They compare correctly with <= and >=, they survive
   JSON without a timezone shifting them by a day, and SQLite stores them as
   text. A Date object here would be a bug waiting for a machine in another
   timezone to run payroll. */

function isoDate(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value).trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(text);           // dd-mm-yyyy
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  throw new Error(`not a date: ${value}`);
}

/** '2025-04' or '2025-04-17' -> {first, last} of that month. */
function monthSpan(month) {
  const text = String(month).trim();
  const m = /^(\d{4})-(\d{1,2})/.exec(text);
  if (!m) throw new Error(`not a month: ${month}`);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const last = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const mm = String(mo).padStart(2, '0');
  return { key: `${y}-${mm}`, first: `${y}-${mm}-01`, last: `${y}-${mm}-${last}` };
}

function dayBefore(iso) {
  const d = new Date(`${isoDate(iso)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const ms = new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`);
  return Math.round(ms / 86400000);
}

class LogRow {
  constructor(key, frm, to, value) {
    this.key = key;
    this.frm = isoDate(frm);
    this.to = to == null ? null : isoDate(to);
    this.value = value;
    Object.freeze(this);
  }
  get open() { return this.to === null; }
  get end() { return this.to === null ? FOREVER : this.to; }
  get span() { return `${this.frm}..${this.open ? 'open' : this.to}`; }
  coversMonth(span) { return this.frm <= span.last && this.end >= span.first; }
  coversDate(d) { return this.frm <= d && d <= this.end; }
  /** How many days of the month this row is actually in force for. */
  daysIn(span) {
    const lo = this.frm > span.first ? this.frm : span.first;
    const hi = this.end < span.last ? this.end : span.last;
    return Math.max(0, daysBetween(lo, hi) + 1);
  }
}

class EffectiveLog {
  constructor(name) {
    this.name = name;
    this._rows = new Map();
  }

  // -- writing ------------------------------------------------------------

  /** The only way policy changes. Close the open row, append the new one.
   *  Rows that already ended are never touched, and a from-date at or before
   *  the open row's start is refused because it would rewrite history. */
  setValue(key, frm, value) {
    const from = isoDate(frm);
    if (!from) throw new Error(`${this.name}: setValue needs a from-date for ${key}`);
    const rows = this._rows.get(key) || [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.open) {
        if (from <= row.frm) {
          throw new Error(
            `${this.name}: ${JSON.stringify(key)} already opens at ${row.frm} — cannot ` +
            `start a new row at ${from} without rewriting history`
          );
        }
        rows[i] = new LogRow(key, row.frm, dayBefore(from), row.value);
      }
    }
    const row = new LogRow(key, from, null, value);
    rows.push(row);
    rows.sort((a, b) => (a.frm < b.frm ? -1 : a.frm > b.frm ? 1 : 0));
    this._rows.set(key, rows);
    return row;
  }

  /** Load a closed row verbatim. For importers replaying known history. */
  add(key, frm, to, value) {
    const row = new LogRow(key, frm, to, value);
    if (row.to && row.to < row.frm) {
      throw new Error(`${this.name}: ${key} ends ${row.to} before it starts ${row.frm}`);
    }
    const rows = this._rows.get(key) || [];
    rows.push(row);
    rows.sort((a, b) => (a.frm < b.frm ? -1 : a.frm > b.frm ? 1 : 0));
    this._rows.set(key, rows);
    return row;
  }

  load(entries) {
    for (const e of entries) this.add(e.key, e.from, e.to ?? null, e.value);
    return this;
  }

  // -- reading ------------------------------------------------------------

  keys() { return [...this._rows.keys()]; }

  rows(key) {
    if (key === undefined) return [...this._rows.values()].flat();
    return [...(this._rows.get(key) || [])];
  }

  overlapping(key, month) {
    const span = monthSpan(month);
    return (this._rows.get(key) || []).filter((r) => r.coversMonth(span));
  }

  /** The value in force for that month. Exactly one row must match. */
  resolve(key, month) { return this.resolveRow(key, month).value; }

  resolveRow(key, month) {
    const hits = this.overlapping(key, month);
    if (hits.length === 0) throw new Unresolved(this.name, key, monthSpan(month).key);
    if (hits.length > 1) throw new Ambiguous(this.name, key, monthSpan(month).key, hits);
    return hits[0];
  }

  /** For genuinely optional logs only — a piece rate for a salaried person.
   *  Never use this to paper over a missing salary, threshold or tax rate: a
   *  missing mandatory value must reach the caller as Unresolved. */
  maybe(key, month, fallback = null) {
    try { return this.resolve(key, month); }
    catch (e) { if (e instanceof Unresolved) return fallback; throw e; }
  }

  /** Every row touching the month with the days it was in force. resolve()
   *  demands one row because pay is a monthly figure; when a value genuinely
   *  changes mid-month the log is ambiguous by design, and this is how a report
   *  shows why without guessing at proration. */
  segments(key, month) {
    const span = monthSpan(month);
    return this.overlapping(key, month).map((r) => ({ row: r, days: r.daysIn(span) }));
  }

  /** The value in force on a single date. For daily rules — a GST rate on an
   *  invoice date, a price on an order date — not for monthly pay. */
  on(key, when) {
    const d = isoDate(when);
    for (const r of this._rows.get(key) || []) if (r.coversDate(d)) return r.value;
    throw new Unresolved(this.name, key, String(d).slice(0, 7));
  }

  toJSON() {
    return this.rows()
      .sort((a, b) => (a.key === b.key ? (a.frm < b.frm ? -1 : 1) : a.key < b.key ? -1 : 1))
      .map((r) => ({ key: r.key, from: r.frm, to: r.to, value: r.value }));
  }

  get size() { return this.rows().length; }
}

/** A spell log — employment, a channel being connected, a vendor being active.
 *  Unlike EffectiveLog it carries no value and a key may have several spells,
 *  because a person can leave and come back. */
class SpellLog {
  constructor(name) { this.name = name; this._rows = new Map(); }

  join(key, frm, to = null) {
    const rows = this._rows.get(key) || [];
    rows.push(new LogRow(key, frm, to, true));
    rows.sort((a, b) => (a.frm < b.frm ? -1 : 1));
    this._rows.set(key, rows);
    return rows[rows.length - 1];
  }

  keys() { return [...this._rows.keys()]; }
  rows(key) { return key === undefined ? [...this._rows.values()].flat() : [...(this._rows.get(key) || [])]; }

  /** Was this key active at any point during that month? */
  active(key, month) {
    const span = monthSpan(month);
    return (this._rows.get(key) || []).some((r) => r.coversMonth(span));
  }

  activeOn(key, when) {
    const d = isoDate(when);
    return (this._rows.get(key) || []).some((r) => r.coversDate(d));
  }

  toJSON() {
    return this.rows().map((r) => ({ key: r.key, from: r.frm, to: r.to }));
  }
}

module.exports = {
  FOREVER, Unresolved, Ambiguous, LogRow, EffectiveLog, SpellLog,
  isoDate, monthSpan, dayBefore, daysBetween,
};
