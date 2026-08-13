'use strict';
/* Money — integer paise, never a float.

   ERP master prompt §A.3.7 is not a style note: "Decimal arithmetic in money
   columns (never float). Use numeric(14,2) in Postgres."

   JavaScript has one number type and it is binary floating point. 0.1 + 0.2 is
   0.30000000000000004, and ₹0.1 + ₹0.2 must be ₹0.30 exactly or a trial balance
   stops balancing. So money in this system is an integer count of paise, and it
   only becomes a decimal string at the edge where a person reads it.

   The karigar workbook already proved the cost of not doing this: the Work
   Report drifted ₹0.24 from the engine because one side rounded per line and
   the other summed unrounded. That is a rounding argument nobody should have to
   have twice.

   Everything here is pure. No database, no DOM, so the rules can be tested with
   nothing else loaded. */

/** The largest amount we will handle, in paise. numeric(14,2) is 12 digits of
 *  rupees, which is ₹999,999,999,999.99 — well inside Number.MAX_SAFE_INTEGER
 *  once expressed in paise, so integer arithmetic here is exact. */
const MAX_PAISE = 99999999999999;

class MoneyError extends Error {}

/** Rupees (number or string) to integer paise. Rejects anything that would
 *  silently lose a fraction of a paisa. */
function paise(rupees) {
  if (typeof rupees === 'bigint') return checked(Number(rupees) * 100);
  if (typeof rupees === 'number') {
    if (!Number.isFinite(rupees)) throw new MoneyError(`not a finite amount: ${rupees}`);
    // Round half away from zero at the paisa, the way an invoice does.
    const scaled = rupees * 100;
    const r = scaled < 0 ? -Math.round(-scaled) : Math.round(scaled);
    if (Math.abs(scaled - r) > 1e-6) {
      throw new MoneyError(
        `${rupees} is finer than one paisa — round it deliberately before it becomes money`
      );
    }
    return checked(r);
  }
  const text = String(rupees == null ? '' : rupees).trim().replace(/[₹,\s]/g, '');
  if (text === '') return 0;
  if (!/^-?\d+(\.\d+)?$/.test(text)) throw new MoneyError(`not an amount: ${rupees}`);
  const neg = text.startsWith('-');
  const [whole, frac = ''] = text.replace('-', '').split('.');
  if (frac.length > 2 && /[1-9]/.test(frac.slice(2))) {
    throw new MoneyError(`${rupees} is finer than one paisa`);
  }
  const p = Number(whole) * 100 + Number((frac + '00').slice(0, 2));
  return checked(neg ? -p : p);
}

function checked(p) {
  if (!Number.isInteger(p)) throw new MoneyError(`paise must be a whole number, got ${p}`);
  if (Math.abs(p) > MAX_PAISE) throw new MoneyError(`amount out of range: ${p} paise`);
  return p;
}

/** Integer paise back to a Number of rupees, for display only. Never feed the
 *  result of this back into arithmetic. */
function rupees(p) {
  return checked(p) / 100;
}

/** The string a person reads. Indian digit grouping, always two decimals. */
function format(p, { symbol = '₹' } = {}) {
  checked(p);
  const neg = p < 0;
  const abs = Math.abs(p);
  const whole = String(Math.floor(abs / 100));
  const frac = String(abs % 100).padStart(2, '0');
  // Indian grouping: last three digits, then pairs.
  const head = whole.length > 3 ? whole.slice(0, -3) : '';
  const tail = whole.slice(-3);
  const grouped = (head ? head.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' : '') + tail;
  return `${neg ? '-' : ''}${symbol}${grouped}.${frac}`;
}

const add = (...xs) => checked(xs.reduce((s, x) => s + checked(x), 0));
const sub = (a, b) => checked(checked(a) - checked(b));
const neg = (a) => checked(-checked(a));

/** Multiply money by a plain count or rate. Rounds half away from zero, once,
 *  at the paisa — the same rule the engine and the workbook both apply. */
function mul(p, factor) {
  checked(p);
  if (!Number.isFinite(factor)) throw new MoneyError(`not a factor: ${factor}`);
  const exact = p * factor;
  return checked(exact < 0 ? -Math.round(-exact) : Math.round(exact));
}

function div(p, divisor) {
  if (!Number.isFinite(divisor) || divisor === 0) {
    throw new MoneyError(`cannot divide money by ${divisor}`);
  }
  return mul(p, 1 / divisor);
}

/** Split an amount into n parts that sum back to exactly the original.
 *  The remainder paise go to the earliest parts, so nothing is lost or invented
 *  — which is what makes a settlement allocation tie out. */
function split(p, n) {
  checked(p);
  if (!Number.isInteger(n) || n <= 0) throw new MoneyError(`cannot split into ${n}`);
  const base = Math.trunc(p / n);
  let rest = p - base * n;
  const step = rest < 0 ? -1 : 1;
  return Array.from({ length: n }, () => {
    if (rest !== 0) { rest -= step; return base + step; }
    return base;
  });
}

/** Allocate an amount in proportion to weights, exactly. Used by the settlement
 *  engine to spread a fee across order lines without a stray paisa. */
function allocate(p, weights) {
  checked(p);
  const total = weights.reduce((s, w) => s + w, 0);
  if (!(total > 0)) return weights.map(() => 0);
  const parts = weights.map((w) => Math.trunc((p * w) / total));
  let rest = p - parts.reduce((s, x) => s + x, 0);
  const step = rest < 0 ? -1 : 1;
  // Give the remainder to the largest weights first — the conventional rule,
  // and stable, so the same input always allocates the same way.
  const order = weights.map((w, i) => [w, i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; rest !== 0; k = (k + 1) % order.length) {
    parts[order[k][1]] += step;
    rest -= step;
  }
  return parts;
}

/** Round to the nearest rupee, returning the rounded amount and the difference.
 *  The accounting prompt §14 requires the difference to post to its own Round
 *  Off ledger, "never silently absorbed into the sale amount (which would
 *  corrupt GST calculation)". */
function roundOff(p) {
  checked(p);
  const r = Math.round(p / 100) * 100;
  return { amount: r, difference: r - p };
}

module.exports = {
  MoneyError, MAX_PAISE,
  paise, rupees, format,
  add, sub, neg, mul, div,
  split, allocate, roundOff,
  zero: 0,
};
