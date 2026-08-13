'use strict';
/* The posting engine. One function. Every voucher calls it.

   Accounting master prompt §3:

       "Every voucher writes to the general ledger through one shared posting
        engine — no voucher type should have its own separate ledger-update
        logic. This is where most home-built accounting tools break (numbers
        stop matching between modules)."

   And §16, the integrity rule that gives the whole system its shape:

       "Every financial figure must trace back to a ledger entry, and every
        ledger entry must trace back to a voucher. No report should ever compute
        a number independently of the ledger."

   So a dashboard's "sales this month" is a query over journal_lines, never a
   counter someone kept up to date. That is why every shallow demo in
   brand/suite/out is wrong in the same way: each computed its own figures from
   its own private store, and nothing reconciled.

   Money is integer paise throughout. A journal that balances in floats is a
   journal that stops balancing at scale. */

const money = require('./money');
const audit = require('./audit');

class LedgerError extends Error {}

/** Post one balanced entry. Refuses anything that would leave the books wrong.
 *
 *  lines: [{ account, debit } | { account, credit }] in PAISE.
 */
function post(db, {
  companyId, voucherType, voucherDate, lines,
  voucherNumber = null, narration = null, reference = null,
  id = null, by = null, at = null,
}) {
  if (!companyId) throw new LedgerError('every entry belongs to a company (§A.3.2)');
  if (!voucherType) throw new LedgerError('every entry names its voucher type');
  if (!voucherDate) throw new LedgerError('every entry carries a voucher date');
  if (!Array.isArray(lines) || lines.length < 2) {
    throw new LedgerError('a double entry needs at least two lines');
  }

  const period = String(voucherDate).slice(0, 7);
  const locked = db.get(
    'SELECT 1 AS x FROM period_locks WHERE company_id = ? AND period = ?',
    [companyId, period]
  );
  if (locked) {
    throw new LedgerError(
      `${period} is locked for this company. A locked period cannot take a backdated ` +
      `entry — an admin must unlock it, and the unlock is itself audited.`
    );
  }

  let debits = 0, credits = 0;
  const prepared = lines.map((l, i) => {
    const debit = Math.trunc(l.debit || 0);
    const credit = Math.trunc(l.credit || 0);
    if (debit < 0 || credit < 0) throw new LedgerError(`line ${i + 1}: negative amount — swap the side instead`);
    if (debit && credit) throw new LedgerError(`line ${i + 1}: a line is a debit or a credit, never both`);
    if (!debit && !credit) throw new LedgerError(`line ${i + 1}: no amount`);
    if (!l.account) throw new LedgerError(`line ${i + 1}: no account`);
    debits += debit; credits += credit;
    return { account: l.account, debit, credit, party: l.party ?? null, narration: l.narration ?? null };
  });

  if (debits !== credits) {
    throw new LedgerError(
      `entry does not balance: debits ${money.format(debits)} vs credits ${money.format(credits)} ` +
      `(off by ${money.format(debits - credits)})`
    );
  }

  const entryId = id || `je_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const when = at || audit.nowIso();

  return db.tx(() => {
    audit.insert(db, 'journal_entries', {
      id: entryId, company_id: companyId, voucher_type: voucherType,
      voucher_number: voucherNumber, voucher_date: voucherDate,
      narration, reference, status: 'posted', posted_at: when, posted_by: by,
      created_at: when,
    }, { companyId, by, at: when });

    for (const l of prepared) {
      db.insert('journal_lines', {
        entry_id: entryId, account_id: l.account,
        debit_paise: l.debit, credit_paise: l.credit,
        party_id: l.party, narration: l.narration,
      });
    }
    return { id: entryId, total: debits, lines: prepared.length };
  });
}

/** Void an entry. Never deleted — reversed and marked, so the trail survives. */
function voidEntry(db, entryId, { by = null, at = null, reason = null } = {}) {
  const entry = db.get('SELECT * FROM journal_entries WHERE id = ?', [entryId]);
  if (!entry) throw new LedgerError(`no entry ${entryId}`);
  if (entry.status === 'void') throw new LedgerError(`${entryId} is already void`);
  return audit.update(db, 'journal_entries', entryId, { status: 'void' },
    { companyId: entry.company_id, by, at });
}

/** The trial balance. It must come to zero, and this is the query that proves
 *  it — computed from the lines, never from a stored total. */
function trialBalance(db, companyId, { upto = null } = {}) {
  const rows = db.all(
    `SELECT a.id, a.code, a.name, a.type,
            SUM(l.debit_paise)  AS debit,
            SUM(l.credit_paise) AS credit
       FROM journal_lines l
       JOIN journal_entries e ON e.id = l.entry_id
       JOIN accounts a        ON a.id = l.account_id
      WHERE e.company_id = ? AND e.status = 'posted'
        AND (? IS NULL OR e.voucher_date <= ?)
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code`,
    [companyId, upto, upto]
  );
  const debit = rows.reduce((s, r) => s + (r.debit || 0), 0);
  const credit = rows.reduce((s, r) => s + (r.credit || 0), 0);
  return { rows, debit, credit, difference: debit - credit, balanced: debit === credit };
}

/** A single account's balance, signed the way its type reads. */
function balance(db, companyId, accountId, { upto = null } = {}) {
  const r = db.get(
    `SELECT a.type,
            COALESCE(SUM(l.debit_paise),0)  AS debit,
            COALESCE(SUM(l.credit_paise),0) AS credit
       FROM accounts a
       LEFT JOIN journal_lines l   ON l.account_id = a.id
       LEFT JOIN journal_entries e ON e.id = l.entry_id AND e.status = 'posted'
      WHERE a.id = ? AND a.company_id = ?
        AND (? IS NULL OR e.voucher_date IS NULL OR e.voucher_date <= ?)
      GROUP BY a.type`,
    [accountId, companyId, upto, upto]
  );
  if (!r) return 0;
  // Assets and expenses are debit-natured; the rest are credit-natured.
  return ['asset', 'expense'].includes(r.type) ? r.debit - r.credit : r.credit - r.debit;
}

function lockPeriod(db, companyId, period, { by = null, at = null } = {}) {
  const when = at || audit.nowIso();
  return audit.insert(db, 'period_locks',
    { company_id: companyId, period, locked_at: when, locked_by: by },
    { companyId, by, at: when });
}

function unlockPeriod(db, companyId, period, { by = null, at = null, reason = null } = {}) {
  const row = db.get('SELECT * FROM period_locks WHERE company_id = ? AND period = ?', [companyId, period]);
  if (!row) throw new LedgerError(`${period} is not locked`);
  // The unlock is the thing an auditor asks about, so it is recorded explicitly.
  return audit.write(db, {
    table: 'period_locks', id: `${companyId}:${period}`, action: 'void',
    before: row, after: { ...row, unlocked: true, reason },
    companyId, by, at,
    apply: (d) => d.run('DELETE FROM period_locks WHERE company_id = ? AND period = ?', [companyId, period]),
  });
}

module.exports = { LedgerError, post, voidEntry, trialBalance, balance, lockPeriod, unlockPeriod };
