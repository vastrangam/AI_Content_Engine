'use strict';
/* The audit trail. There is no way to switch it off, and that is the point.

   Companies (Accounts) Rules, MCA, effective FY2023-24: accounting software
   must maintain an audit trail of every edit to every transaction, the feature
   must not be capable of being disabled, and the record must be preserved for
   eight years. The accounting master prompt §8 restates it in the form that
   matters to whoever writes the code:

       "this logging must be architecturally impossible to turn off, not just a
        settings toggle defaulting to 'on'."

   So this module exposes no flag, reads no setting, and takes no `enabled`
   option. The only way to write an audited table is through write(), and the
   only way to skip the audit is to not use it — which the structural audit in
   brand/suite/deep/audit.js will fail the build for.

   It records before and after as JSON, which is what makes a dispute
   answerable: not "someone changed the price", but "this person changed it from
   this to that at this moment". */

const { normalise } = require('./db');

/** Tables whose every change must be logged. Anything touching money, stock,
 *  price, tax, pay or master data belongs here. */
const AUDITED = new Set([
  'companies', 'users', 'user_companies',
  'effective_log',
  'designs', 'items', 'kit_items', 'locations',
  'stock', 'stock_movements',
  'accounts', 'journal_entries', 'journal_lines', 'period_locks',
]);

class AuditError extends Error {}

function nowIso() { return new Date().toISOString(); }

/** Write a row and record what happened, in one transaction. Either both land
 *  or neither does — an unaudited change is not a change we are allowed to make. */
function write(db, {
  table, id, action, before = null, after = null,
  companyId = null, by = null, at = null, apply,
}) {
  if (!AUDITED.has(table)) {
    throw new AuditError(
      `${table} is not in the audited set. Add it to core/audit.js AUDITED, or ` +
      `explain in review why a change to it never needs to be answerable.`
    );
  }
  if (!['insert', 'update', 'void', 'restore'].includes(action)) {
    throw new AuditError(`unknown audit action: ${action}`);
  }
  return db.tx(() => {
    const result = typeof apply === 'function' ? apply(db) : undefined;
    db.run(
      `INSERT INTO audit_log
         (company_id, table_name, record_id, action, before_json, after_json, changed_by, changed_at)
       VALUES (?,?,?,?,?,?,?,?)`,
      [companyId, table, String(id), action,
       before == null ? null : JSON.stringify(before),
       after == null ? null : JSON.stringify(after),
       by, at || nowIso()]
    );
    return result;
  });
}

/** Insert through the audit. */
function insert(db, table, row, { companyId = null, by = null, at = null } = {}) {
  return write(db, {
    table, id: row.id ?? row.key ?? '(auto)', action: 'insert',
    after: row, companyId: companyId ?? row.company_id ?? null, by, at,
    apply: (d) => d.insert(table, row),
  });
}

/** Update through the audit. Reads the current row first so `before` is real
 *  and not something the caller believed was there. */
function update(db, table, id, changes, { companyId = null, by = null, at = null } = {}) {
  const before = db.get(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  if (!before) throw new AuditError(`${table}: no row ${id} to update`);
  const cols = Object.keys(changes);
  return write(db, {
    table, id, action: 'update', before, after: { ...before, ...changes },
    companyId: companyId ?? before.company_id ?? null, by, at,
    apply: (d) => d.run(
      `UPDATE ${table} SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
      [...cols.map((c) => normalise(changes[c])), id]
    ),
  });
}

/** Void — the only removal. Nothing is ever hard-deleted. */
function voidRow(db, table, id, { companyId = null, by = null, at = null, reason = null } = {}) {
  const before = db.get(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  if (!before) throw new AuditError(`${table}: no row ${id} to void`);
  const when = at || nowIso();
  return write(db, {
    table, id, action: 'void', before, after: { ...before, deleted_at: when, reason },
    companyId: companyId ?? before.company_id ?? null, by, at: when,
    apply: (d) => d.softDelete(table, id, when),
  });
}

function restore(db, table, id, opts = {}) {
  const before = db.get(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  if (!before) throw new AuditError(`${table}: no row ${id} to restore`);
  return write(db, {
    table, id, action: 'restore', before, after: { ...before, deleted_at: null },
    companyId: opts.companyId ?? before.company_id ?? null, by: opts.by, at: opts.at,
    apply: (d) => d.run(`UPDATE ${table} SET deleted_at = NULL WHERE id = ?`, [id]),
  });
}

/** The history of one record, oldest first — what a dispute is answered with. */
function history(db, table, id) {
  return db.all(
    `SELECT * FROM audit_log WHERE table_name = ? AND record_id = ? ORDER BY id`,
    [table, String(id)]
  ).map((r) => ({
    ...r,
    before: r.before_json ? JSON.parse(r.before_json) : null,
    after: r.after_json ? JSON.parse(r.after_json) : null,
  }));
}

module.exports = { AUDITED, AuditError, write, insert, update, voidRow, restore, history, nowIso };
