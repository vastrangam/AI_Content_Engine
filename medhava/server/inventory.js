'use strict';
/* MODULE 03 · INVENTORY — the one stock number, and the rule that keeps it honest.
 *
 * WHAT THIS OWNS
 * How much there is. Every other module asks; none of them keeps its own copy. That is R03.1, and
 * the `never` on it is the reason: "keeping a separate stock figure per channel — the last piece
 * sold on one marketplace has to vanish from the other ten at the same instant, which per-channel
 * inventory cannot do."
 *
 * SO ON-HAND IS DERIVED, NOT STORED
 * There is no quantity column anywhere. On-hand is the sum of movements in minus movements out,
 * per item and location. A stored figure is a second source of truth that drifts from the first
 * one silently, and the drift is only ever found by counting the shelf.
 *
 * THE RULES THIS FILE ENFORCES
 *   R03.1  one number per item and location; the channel is on the MOVEMENT, never on the stock
 *   R03.2  an issue that would go below zero is refused — negative stock is a fault, not a state
 *   R03.5  value is computed from quantity × item cost, never stored separately
 *   R03.6  every movement names a source, a destination, or both
 *   R03.7  a quantity is a whole number above zero
 *
 * AND IT CHANGES MODULE 05, WHICH IS THE POINT OF BUILDING IT
 * postSale() used to INSERT into stock_movements directly, so a sale could take stock negative and
 * nothing anywhere refused it. It now issues through this module, inside the same transaction — so
 * a sale of more than exists is refused whole, and the order, invoice and ledger go with it. That
 * is R03.2 and R05.3 meeting: the first says the issue is refused, the second says nothing else
 * survives it.
 */

const db = require('./db.js');

class StockRefused extends Error {
  constructor(message, rule) { super(message); this.rule = rule; }
}

/* ── R03.7 · a quantity is a whole number above zero ─────────────────────────
   "NEVER accepting a negative movement as a shorthand for a reversal — a reversal is its own
   movement with its own reason." A minus sign in a quantity column is an audit trail that cannot
   be read: nothing records WHY it went back. */
function qty(n, where) {
  const v = Number(n);
  if (!Number.isInteger(v)) {
    throw new StockRefused(`${where}: ${JSON.stringify(n)} is not a whole quantity`, 'R03.7');
  }
  if (v <= 0) {
    throw new StockRefused(
      `${where}: a quantity must be above zero. A reversal is its own movement with its own ` +
      `reason, not a negative number in this one.`, 'R03.7');
  }
  return v;
}

/**
 * How much there is, per item and location — derived from the movements, never stored.
 * Returns rows of { itemId, sku, name, locationId, locationCode, onHand, costPaise, valuePaise }.
 */
async function onHand(q, { itemId = null, locationId = null } = {}) {
  /* IN and OUT are summed separately and subtracted, rather than signing the quantity, because
     the quantity column is CHECK (qty > 0) — see R03.7. The direction lives in which end of the
     movement names the location, which is also what makes a transfer one row instead of two. */
  const r = await q(`
    WITH moved AS (
      SELECT item_id, to_location   AS loc,  qty AS q FROM stock_movements WHERE to_location   IS NOT NULL
      UNION ALL
      SELECT item_id, from_location AS loc, -qty AS q FROM stock_movements WHERE from_location IS NOT NULL
    )
    SELECT i.id AS item_id, i.sku, i.cost_paise, d.design_name, l.id AS loc_id, l.code AS loc_code,
           coalesce(sum(m.q), 0)::bigint AS on_hand
      FROM moved m
      JOIN items i     ON i.id = m.item_id
      JOIN designs d   ON d.id = i.design_id
      JOIN locations l ON l.id = m.loc
     WHERE ($1::uuid IS NULL OR i.id = $1) AND ($2::uuid IS NULL OR l.id = $2)
     GROUP BY i.id, i.sku, i.cost_paise, d.design_name, l.id, l.code
     ORDER BY i.sku, l.code`, [itemId, locationId]);

  return r.rows.map((x) => {
    const n = Number(x.on_hand);
    const cost = Number(x.cost_paise || 0);
    return {
      itemId: x.item_id, sku: x.sku, name: x.design_name,
      locationId: x.loc_id, locationCode: x.loc_code,
      onHand: n, costPaise: cost,
      /* R03.5 · "NEVER storing a valuation that can drift from the quantity it is supposed to
         describe." Computed here, every time, from the two numbers it is made of. */
      valuePaise: n * cost,
    };
  });
}

/** The single balance for one item at one location. 0 when it has never moved. */
async function balance(q, itemId, locationId) {
  const rows = await onHand(q, { itemId, locationId });
  return rows.length ? rows[0].onHand : 0;
}

/**
 * Record a movement. The one way stock changes.
 *
 * @param q            the scoped query function, from withContext or withTransaction
 * @param companyId    from the session, never from a request
 * @param m            { itemId, from, to, quantity, type, channelId?, reference? }
 */
async function move(q, companyId, m) {
  const n = qty(m.quantity, m.type || 'movement');

  /* ── R03.6 · a movement from nowhere to nowhere ────────────────────────────
     "NEVER accepting a movement from nowhere to nowhere, which is how quantity appears without a
     cause." The schema carries the same CHECK; this refuses it first, by name, so the caller gets
     a rule rather than a constraint violation. */
  if (!m.from && !m.to) {
    throw new StockRefused(
      'a movement must name where the stock came from, where it went, or both. A movement with ' +
      'neither is a quantity appearing without a cause.', 'R03.6');
  }

  /* ── R03.2 · negative stock is a fault, not a state ────────────────────────
     Checked INSIDE the caller's transaction, so a refusal takes everything with it. The balance is
     read immediately before the write; two concurrent issues are serialised by the transaction. */
  if (m.from) {
    const have = await balance(q, m.itemId, m.from);
    if (have < n) {
      const [item] = (await q('SELECT sku FROM items WHERE id = $1', [m.itemId])).rows;
      throw new StockRefused(
        `${item ? item.sku : m.itemId}: ${n} would be issued and only ${have} ${have === 1 ? 'is' : 'are'} ` +
        `on hand. The issue is refused. Recording it and leaving a negative balance moves the ` +
        `problem to whoever reconciles the month.`, 'R03.2');
    }
  }

  await q(
    `INSERT INTO stock_movements
       (company_id, item_id, from_location, to_location, qty, movement_type, channel_id, reference)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    /* R03.1 · the channel is recorded ON THE MOVEMENT. There is no per-channel stock figure to
       keep in step, because there is no per-channel stock figure. */
    [companyId, m.itemId, m.from || null, m.to || null, n,
     m.type || 'adjust', m.channelId || null, m.reference || null]);

  return { itemId: m.itemId, quantity: n, from: m.from || null, to: m.to || null };
}

/** Goods arriving. A receipt has a destination and no source. */
const receive = (q, companyId, m) => move(q, companyId, { ...m, to: m.to, from: null,
                                                          type: m.type || 'receipt' });

/** Goods leaving — a sale, a write-off, a consumption. Subject to R03.2. */
const issue = (q, companyId, m) => move(q, companyId, { ...m, from: m.from, to: null,
                                                        type: m.type || 'issue' });

module.exports = { onHand, balance, move, receive, issue, StockRefused, qty };
