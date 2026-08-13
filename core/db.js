'use strict';
/* The one database.

   Before this file, every app in brand/suite/out kept its own localStorage key
   (kernel.js: KEY = 'medhava_' + spec.id). Sixty-five apps, sixty-five private
   databases, and therefore no cascades: an order could not move stock and stock
   could not post to the ledger. This is the fix, and everything else in core/
   depends on it.

   Two backends behind one interface, the same split app/server/store.js already
   chose and for the same stated reason — "moving to Supabase later changes
   nothing you can see". Today it is SQLite via node:sqlite, which ships with
   Node 22 and needs no native build. Tomorrow it is Postgres. Nothing above
   this file knows which.

   Writes go through tx(). Not as a style preference: a sale that moves stock
   and posts to the ledger must do both or neither, or the trial balance stops
   balancing and the business stops trusting the software (accounting prompt
   §16 — the failure mode "that pushes people back to Excel"). */

const fs = require('node:fs');
const path = require('node:path');

const SCHEMA = path.join(__dirname, 'schema.sql');

class Db {
  /** @param {string} file  ':memory:' for tests, a path otherwise. */
  constructor(file = ':memory:') {
    const { DatabaseSync } = require('node:sqlite');
    if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
    this.file = file;
    this.raw = new DatabaseSync(file);
    this.raw.exec('PRAGMA foreign_keys = ON');
    this.raw.exec('PRAGMA journal_mode = WAL');
    this.raw.exec(fs.readFileSync(SCHEMA, 'utf8'));
    this._depth = 0;
  }

  // -- reading -------------------------------------------------------------

  all(sql, params = []) { return this.raw.prepare(sql).all(...params); }
  get(sql, params = []) { return this.raw.prepare(sql).get(...params) ?? null; }
  /** A single scalar — the first column of the first row, or null. */
  value(sql, params = []) {
    const row = this.get(sql, params);
    return row ? Object.values(row)[0] : null;
  }

  // -- writing -------------------------------------------------------------

  run(sql, params = []) { return this.raw.prepare(sql).run(...params); }
  exec(sql) { return this.raw.exec(sql); }

  /** All or nothing. Nests safely via savepoints, so a module can wrap its own
   *  work in a transaction without knowing whether a caller already did. */
  tx(fn) {
    const nested = this._depth > 0;
    const name = `sp_${this._depth}`;
    this.raw.exec(nested ? `SAVEPOINT ${name}` : 'BEGIN');
    this._depth += 1;
    try {
      const out = fn(this);
      this._depth -= 1;
      this.raw.exec(nested ? `RELEASE ${name}` : 'COMMIT');
      return out;
    } catch (err) {
      this._depth -= 1;
      this.raw.exec(nested ? `ROLLBACK TO ${name}` : 'ROLLBACK');
      throw err;
    }
  }

  /** Insert a row from a plain object. Returns the object as written. */
  insert(table, row) {
    const cols = Object.keys(row);
    const sql = `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`;
    this.run(sql, cols.map((c) => normalise(row[c])));
    return row;
  }

  /** There is no delete(). §A.3.3 — "Staff never get a 'delete' action; they
   *  get 'deactivate' / 'void'. Admin can restore anything." Soft-delete is the
   *  only removal, and core/audit.js records it. */
  softDelete(table, id, when) {
    return this.run(`UPDATE ${table} SET deleted_at = ? WHERE id = ?`, [when, id]);
  }

  close() { this.raw.close(); }
}

function normalise(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') return JSON.stringify(v);
  return v;
}

function open(file) { return new Db(file); }

module.exports = { Db, open, normalise };
