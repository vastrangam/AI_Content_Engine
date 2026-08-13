'use strict';
/* Stock — one quantity per SKU, per location, per stage.

   modules.js calls this "the most important number in the system: one quantity
   per SKU, per location, per stage — read and written by every other module."
   The ERP prompt §A.3 puts it as a principle: inventory is NOT per-channel. The
   last piece sold on Amazon disappears from Flipkart in the same instant, not
   three hours later as a cancellation — because cancellations are what a
   marketplace account rating is lost to.

   Two things live here that are easy to get wrong and expensive to retrofit:

   1. Movements are the ledger; quantities are its running balance. Every
      transition writes an immutable row, so "how did we get to 4?" is always
      answerable.

   2. A kit expands at order time. A three-piece set sold as one listing is one
      sellable SKU made of component SKUs (feature-gap #1); selling it must
      decrement each component, or stock is wrong for every piece in the set. */

const audit = require('./audit');

class StockError extends Error {}

const STAGES = ['raw', 'cut', 'stitched', 'thread_cut', 'qc_passed', 'ironed', 'packed', 'dispatched'];

function level(db, itemId, locationId, stage = 'packed') {
  const r = db.get(
    'SELECT qty, qty_reserved FROM stock WHERE item_id = ? AND location_id = ? AND stage = ?',
    [itemId, locationId, stage]
  );
  return r ? { qty: r.qty, reserved: r.qty_reserved, available: r.qty - r.qty_reserved }
           : { qty: 0, reserved: 0, available: 0 };
}

function _bump(db, itemId, locationId, stage, delta, when) {
  const existing = db.get(
    'SELECT qty FROM stock WHERE item_id = ? AND location_id = ? AND stage = ?',
    [itemId, locationId, stage]
  );
  if (existing) {
    db.run(
      'UPDATE stock SET qty = qty + ?, updated_at = ? WHERE item_id = ? AND location_id = ? AND stage = ?',
      [delta, when, itemId, locationId, stage]
    );
  } else {
    db.insert('stock', {
      item_id: itemId, location_id: locationId, stage, qty: delta,
      qty_reserved: 0, updated_at: when,
    });
  }
}

/** Move stock and record why. `from` or `to` may be null for a receipt or an
 *  issue. Refuses to move more than is there — negative stock is a data fault,
 *  not a state the business can be in. */
function move(db, {
  companyId, itemId, qty, movementType, reference = null,
  from = null, to = null, by = null, at = null, allowNegative = false,
}) {
  if (!companyId) throw new StockError('every movement belongs to a company');
  if (!Number.isInteger(qty) || qty <= 0) throw new StockError(`quantity must be a whole number above zero, got ${qty}`);
  if (!from && !to) throw new StockError('a movement needs a source, a destination, or both');
  const when = at || audit.nowIso();

  const row = {
    company_id: companyId, item_id: itemId,
    from_location: from?.location ?? null, from_stage: from?.stage ?? null,
    to_location: to?.location ?? null, to_stage: to?.stage ?? null,
    qty, movement_type: movementType, reference, moved_at: when, moved_by: by,
  };

  // Stock is money. A quantity that changed with nobody able to say why is the
  // same failure as a ledger entry with no voucher behind it, so the movement
  // goes through the audit trail with the balance before and after it.
  return audit.write(db, {
    table: 'stock_movements', id: `${itemId}@${when}`, action: 'insert',
    companyId, by, at: when,
    before: { onHand: onHand(db, itemId) },
    after: row,
    apply: (d) => {
      if (from) {
        const have = level(d, itemId, from.location, from.stage);
        if (!allowNegative && have.qty < qty) {
          throw new StockError(
            `cannot move ${qty} of ${itemId} out of ${from.location}/${from.stage} — only ${have.qty} there. ` +
            `Negative stock means an issue beyond what exists; recount and fix rather than book it.`
          );
        }
        _bump(d, itemId, from.location, from.stage, -qty, when);
      }
      if (to) _bump(d, itemId, to.location, to.stage, qty, when);
      d.insert('stock_movements', row);
      return { itemId, qty, movementType, at: when };
    },
  });
}

/** What a sellable SKU actually consumes. A plain item is itself; a kit is its
 *  components, multiplied out. */
function explode(db, itemId, qty = 1) {
  const item = db.get('SELECT id, is_kit FROM items WHERE id = ?', [itemId]);
  if (!item) throw new StockError(`no such item: ${itemId}`);
  if (!item.is_kit) return [{ itemId, qty }];
  const parts = db.all(
    'SELECT component_item_id, qty FROM kit_items WHERE kit_item_id = ?', [itemId]
  );
  if (parts.length === 0) throw new StockError(`${itemId} is marked a kit but lists no components`);
  return parts.map((p) => ({ itemId: p.component_item_id, qty: p.qty * qty }));
}

/** Issue stock for a sale. Expands kits, so a set sold as one listing takes one
 *  of each component out. */
function issueForSale(db, { companyId, itemId, qty, locationId, stage = 'packed', reference, by, at }) {
  const moved = [];
  for (const part of explode(db, itemId, qty)) {
    moved.push(move(db, {
      companyId, itemId: part.itemId, qty: part.qty,
      movementType: 'sale', reference, by, at,
      from: { location: locationId, stage },
    }));
  }
  return moved;
}

function receive(db, { companyId, itemId, qty, locationId, stage = 'packed', movementType = 'purchase', reference, by, at }) {
  return move(db, { companyId, itemId, qty, movementType, reference, by, at, to: { location: locationId, stage } });
}

/** Total units of an item across every location and stage. */
function onHand(db, itemId) {
  return db.value('SELECT COALESCE(SUM(qty),0) FROM stock WHERE item_id = ?', [itemId]) || 0;
}

/** The value of stock, at the item's recorded cost. Ties to the balance sheet —
 *  the accounting prompt §7 requires the stock valuation report to match. */
function valuation(db, companyId, { stages = ['packed', 'qc_passed', 'ironed'] } = {}) {
  const marks = stages.map(() => '?').join(',');
  const rows = db.all(
    `SELECT i.id, i.sku, SUM(s.qty) AS qty, i.cost_paise,
            SUM(s.qty) * i.cost_paise AS value_paise
       FROM stock s JOIN items i ON i.id = s.item_id
      WHERE i.company_id = ? AND s.stage IN (${marks})
      GROUP BY i.id, i.sku, i.cost_paise
      HAVING SUM(s.qty) <> 0`,
    [companyId, ...stages]
  );
  return { rows, total: rows.reduce((s, r) => s + (r.value_paise || 0), 0) };
}

/** Everything that ever happened to an item, oldest first. */
function movements(db, itemId) {
  return db.all('SELECT * FROM stock_movements WHERE item_id = ? ORDER BY id', [itemId]);
}

module.exports = { StockError, STAGES, level, move, explode, issueForSale, receive, onHand, valuation, movements };
