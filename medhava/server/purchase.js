'use strict';
/* MODULE 07 · PURCHASE — buying, which is the half of a working day this platform did not have.
 *
 * WHAT WAS MISSING, AND WHY IT MATTERED MORE THAN A MISSING SCREEN
 * Stock could be issued and a sale could be posted, and nothing could put stock there. Every
 * demonstration therefore began with a quantity somebody had seeded, which is the shape of a
 * demo rather than a system: the most important number in the product had exactly one way in,
 * and it was a fixture.
 *
 * A PURCHASE IS TWO EVENTS, AND CONFLATING THEM IS THE CLASSIC DEFECT
 * The order is a promise. The receipt is a fact. They happen days apart, the second rarely
 * matches the first exactly, and a system that treats them as one thing has to choose which lie
 * to tell — either the stock arrives when the order is placed, or the order is only real once
 * everything has come. So they are separate here:
 *
 *     raisePO      the promise. No stock moves. Nothing is owed yet.
 *     receive      the fact. Stock arrives, the vendor is owed, the order is updated.
 *
 * THE RULES THIS FILE ENFORCES, BY NUMBER, FROM brand/site/rules.js
 *   R07.2   a short receipt is recorded short, and the payable follows the RECEIVED quantity —
 *           never the ordered one, and never by quietly receiving the full amount to make a
 *           later three-way match succeed
 *   R07.7   a vendor with no active record cannot be transacted against
 *   R07.11  the payable is arithmetic: received quantity × the agreed purchase-order rate,
 *           computed here rather than accepted from the caller
 *
 * WHAT THIS FILE DELIBERATELY DOES NOT DO
 * The vendor invoice, and therefore the full three-way match of R07.11, is not built. Neither
 * is approval routing (R07.6), landed cost (R07.4) or dated vendor pricing (R07.5). They are
 * not stubbed: an empty approvalRequired() would read as a control that exists. What IS built
 * is the arithmetic half of R07.11 that a receipt can already answer — the payable equals
 * received × agreed rate — because that much is decidable without an invoice.
 *
 * MONEY IS INTEGER PAISE, as everywhere else here, and every division rounds explicitly.
 */

const db = require('./db.js');
const inventory = require('./inventory.js');

class PurchaseRefused extends Error {
  constructor(message, rule) { super(message); this.rule = rule; }
}

const paise = (n) => {
  const v = Number(n);
  if (!Number.isInteger(v)) throw new PurchaseRefused(`${n} is not a whole number of paise`);
  if (v < 0) throw new PurchaseRefused(`${n} is negative; a rate cannot be`);
  return v;
};

/* ── QUANTITY IS MODULE 03'S QUESTION, AND IS ASKED THERE ─────────────────────
   This file first defined its own rule — three decimals allowed, because the schema column is
   numeric(12,3) and cloth is bought by the metre. Inventory refuses anything that is not a
   whole number (R03.7), so a purchase of 2.5 metres would have been accepted by every check
   in this file and then refused, confusingly, deep inside a stock movement. Two answers to
   one question, and the looser one written by whoever needed it to be looser.

   So the rule is inventory's, imported rather than restated. If whole-number-only is ever
   wrong for this business, R03.7 is where that argument belongs — changing it here would
   only have hidden the disagreement. */
const qty = (n, what) => {
  try { return inventory.qty(n, what); }
  catch (e) { throw new PurchaseRefused(e.message, e.rule || 'R03.7'); }
};

/* ── R07.7 · the vendor must exist, in THIS company, and be active ─────────────
   "NEVER paying to detail typed onto the payment itself." The lookup is scoped, so a vendor id
   belonging to another company is not found rather than found-and-rejected: the database policy
   does the refusing and no comparison in this file has to remember to. Status is checked here
   because "exists" and "may be transacted against" are different questions, and a dormant
   vendor is exactly the record somebody reactivates by accident. */
async function activeVendor(q, name) {
  const r = await q(
    `SELECT id, name, status FROM vendors
      WHERE name = $1 AND deleted_at IS NULL`, [String(name || '').trim()]);
  if (!r.rows.length) {
    throw new PurchaseRefused(
      `no vendor named "${name}" in this company. A purchase order is raised against a ` +
      `record, never against a name typed onto the order.`, 'R07.7');
  }
  const v = r.rows[0];
  if (v.status !== 'active') {
    throw new PurchaseRefused(
      `vendor "${v.name}" is ${v.status}, not active. R07.7 refuses it here rather than at ` +
      `payment time, because an order raised against a dormant vendor is a payment nobody ` +
      `has decided to make yet.`, 'R07.7');
  }
  return v;
}

function readLines(raw) {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new PurchaseRefused('a purchase order with no lines is not an order');
  }
  return raw.map((l, i) => {
    const where = `line ${i + 1}`;
    if (!l || !l.sku) throw new PurchaseRefused(`${where} names no item`);
    return {
      sku: String(l.sku).trim(),
      qty: qty(l.qty, `${where} quantity`),
      rate: paise(l.ratePaise),
      gstRate: l.gstRate === undefined || l.gstRate === null ? 0 : Number(l.gstRate),
    };
  });
}

/* ── the promise ──────────────────────────────────────────────────────────── */
async function raisePO(scope, input) {
  const lines = readLines(input && input.lines);

  return db.withTransaction(scope, async (q) => {
    const vendor = await activeVendor(q, input.vendor);

    const items = new Map((await q(
      `SELECT id, sku FROM items WHERE deleted_at IS NULL`)).rows.map((r) => [r.sku, r.id]));
    lines.forEach((l) => {
      if (!items.has(l.sku)) {
        throw new PurchaseRefused(
          `no item with SKU ${l.sku} in this company — a purchase order cannot order ` +
          `something the catalogue has never heard of`);
      }
    });

    /* The number runs in this company's own sequence, like the invoice number does. Two
       companies both raising PO-0001 on the same day is correct and the UNIQUE constraint on
       (company_id, po_number) is what makes it so. */
    const n = (await q(
      `SELECT count(*)::int c FROM purchase_orders WHERE deleted_at IS NULL`)).rows[0].c;
    const poNumber = `PO-${String(n + 1).padStart(5, '0')}`;

    let total = 0;
    let tax = 0;
    const priced = lines.map((l) => {
      const amount = Math.round(l.qty * l.rate);
      const lineTax = Math.round(amount * l.gstRate) / 100;
      total += amount;
      tax += Math.round(lineTax);
      return { ...l, amount };
    });

    const po = (await q(
      `INSERT INTO purchase_orders
         (company_id, po_number, vendor_id, po_date, status, total_paise, tax_paise)
       VALUES ($1,$2,$3, current_date, 'open', $4, $5) RETURNING id`,
      [scope.companyId, poNumber, vendor.id, total, tax])).rows[0].id;

    for (const l of priced) {
      await q(
        `INSERT INTO purchase_order_items
           (company_id, po_id, item_id, qty_ordered, rate_paise, gst_rate, amount_paise)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [scope.companyId, po, items.get(l.sku), l.qty, l.rate, l.gstRate, l.amount]);
    }

    return {
      poNumber, vendor: vendor.name, status: 'open',
      subtotalPaise: total, taxPaise: tax, totalPaise: total + tax,
      lines: priced.map((l) => ({ sku: l.sku, qty: l.qty, ratePaise: l.rate,
        gstRate: l.gstRate, amountPaise: l.amount })),
    };
  });
}

/* ── the fact ─────────────────────────────────────────────────────────────── */
async function receive(scope, input) {
  const received = Array.isArray(input && input.lines) ? input.lines : [];
  if (!received.length) throw new PurchaseRefused('a receipt with no lines received nothing');

  return db.withTransaction(scope, async (q) => {
    const po = (await q(
      `SELECT id, po_number, vendor_id, status FROM purchase_orders
        WHERE po_number = $1 AND deleted_at IS NULL`,
      [String(input.poNumber || '').trim()])).rows;
    if (!po.length) {
      /* THE CROSS-COMPANY CASE, AND WHY IT LOOKS LIKE THIS.
         Receiving against another company's purchase order does not reach a comparison in this
         file — the row is simply not visible to this session's role, so the lookup finds
         nothing and this is the message. The refusal is the database's, which is the only kind
         that cannot be forgotten by a later edit. */
      throw new PurchaseRefused(
        `no purchase order ${input.poNumber} in this company`, 'R07.11');
    }
    const order = po[0];
    if (order.status === 'closed') {
      throw new PurchaseRefused(
        `${order.po_number} is closed. Receiving against a closed order would add stock ` +
        `nobody ordered and a payable nobody agreed.`, 'R07.11');
    }

    const poItems = (await q(
      `SELECT i.id, i.item_id, i.qty_ordered, i.qty_received, i.rate_paise, i.gst_rate, it.sku
         FROM purchase_order_items i JOIN items it ON it.id = i.item_id
        WHERE i.po_id = $1`, [order.id])).rows;
    const bySku = new Map(poItems.map((r) => [r.sku, r]));

    const loc = (await q(
      `SELECT id, code FROM locations WHERE code = $1 AND deleted_at IS NULL`,
      [String(input.into || '').trim()])).rows;
    if (!loc.length) {
      throw new PurchaseRefused(
        `no location ${input.into} in this company — goods arrive somewhere specific, and ` +
        `"received" with no place is a number nobody can go and count`);
    }

    const n = (await q(`SELECT count(*)::int c FROM grn WHERE deleted_at IS NULL`)).rows[0].c;
    const grnNumber = `GRN-${String(n + 1).padStart(5, '0')}`;
    const grn = (await q(
      `INSERT INTO grn (company_id, grn_number, po_id, received_date)
       VALUES ($1,$2,$3, current_date) RETURNING id`,
      [scope.companyId, grnNumber, order.id])).rows[0].id;

    let goodsValue = 0;
    let taxValue = 0;
    const detail = [];

    for (const r of received) {
      const line = bySku.get(String(r.sku || '').trim());
      if (!line) {
        throw new PurchaseRefused(
          `${order.po_number} has no line for ${r.sku}. Receiving something that was never ` +
          `ordered is not a short receipt, it is a different delivery.`, 'R07.11');
      }
      const got = qty(r.qty, `received quantity for ${r.sku}`);

      /* ── R07.11 · over-receipt is refused ────────────────────────────────────
         "NEVER passing an invoice whose value exceeds received quantity × agreed rate." An
         over-receipt makes that impossible to satisfy later: the goods are on the shelf and
         the agreed order does not cover them. Refused at the door, where somebody can still
         send the excess back, rather than at payment, where they cannot. */
      const already = Number(line.qty_received);
      const ordered = Number(line.qty_ordered);
      if (already + got > ordered + 1e-9) {
        throw new PurchaseRefused(
          `${r.sku}: ${ordered} ordered, ${already} already received, and this receipt adds ` +
          `${got}. Receiving more than was ordered leaves a payable the purchase order does ` +
          `not cover.`, 'R07.11');
      }

      /* ── R07.2 · the payable follows the RECEIVED quantity ───────────────────
         "NEVER receiving the full quantity to make the match pass." The amount owed is
         computed here from what actually arrived and the rate that was agreed — it is not
         read from the request, and it is not the order's total. A short receipt therefore
         owes less, automatically, and the order stays open for the rest. */
      const amount = Math.round(got * Number(line.rate_paise));
      const lineTax = Math.round(amount * Number(line.gst_rate || 0)) / 100;
      goodsValue += amount;
      taxValue += Math.round(lineTax);

      await q(
        `INSERT INTO grn_items (company_id, grn_id, po_item_id, qty_received, qty_accepted)
         VALUES ($1,$2,$3,$4,$4)`, [scope.companyId, grn, line.id, got]);
      await q(
        `UPDATE purchase_order_items SET qty_received = qty_received + $2 WHERE id = $1`,
        [line.id, got]);

      /* The stock movement, through module 03 rather than beside it. Inventory owns what a
         receipt means — the location, the balance, the refusal of a nonsense quantity — and a
         second implementation here would be a second answer to the most important number in
         the product. */
      await inventory.receive(q, scope.companyId, {
        itemId: line.item_id, to: loc[0].id, quantity: got,
        reference: `${grnNumber} against ${order.po_number}`,
      });

      detail.push({ sku: line.sku, ordered, previouslyReceived: already, received: got,
        outstanding: Math.round((ordered - already - got) * 1000) / 1000,
        ratePaise: Number(line.rate_paise), amountPaise: amount });
    }

    /* ── the ledger ───────────────────────────────────────────────────────────
       The mirror of a sale. The goods become an asset, the tax becomes a claim against the
       government, and the vendor is owed the sum of both. GST paid on a purchase is NOT part
       of the cost of the goods — it comes back — and adding it to Inventory would overstate
       the value of everything on the shelf by the tax rate. */
    const acc = new Map((await q(
      `SELECT id, code FROM accounts WHERE deleted_at IS NULL`)).rows.map((r) => [r.code, r.id]));
    for (const need of ['1200', '1300', '2000']) {
      if (!acc.has(need)) {
        throw new PurchaseRefused(`the chart of accounts is missing ${need}`, 'R07.11');
      }
    }
    /* 'journal', NOT 'purchase_invoice', AND THE DIFFERENCE IS THE POINT.
       The schema's CHECK offers purchase_invoice and it would have been the obvious choice —
       it is also false. No vendor invoice has arrived at a goods receipt; the invoice comes
       later and is what R07.11's three-way match is against. Typing an entry as an invoice
       that does not exist is precisely what R07.3 warns about, and it would make a later
       reconciliation match a document nobody has. This is a journal entry recording that
       goods arrived and a liability was incurred, which is what actually happened. */
    const entry = (await q(
      `INSERT INTO journal_entries
         (company_id, voucher_type, voucher_number, voucher_date, narration, reference, status, posted_at)
       VALUES ($1,'journal',$2, current_date, $3, $4, 'posted', now()) RETURNING id`,
      [scope.companyId, grnNumber, `Goods received on ${order.po_number}`,
        order.po_number])).rows[0].id;

    const line = (code, debit, credit, narration) => q(
      `INSERT INTO journal_lines (entry_id, account_id, debit_paise, credit_paise, narration)
       VALUES ($1,$2,$3,$4,$5)`, [entry, acc.get(code), debit, credit, narration]);

    await line('1200', goodsValue, 0, 'Inventory received');
    if (taxValue > 0) await line('1300', taxValue, 0, 'GST paid, reclaimable');
    await line('2000', 0, goodsValue + taxValue, 'Owed to vendor');

    /* Asked, not assumed — the same check the sale makes, for the same reason. Every path
       above is integer arithmetic, so this should never fire, which is why it is here. */
    const [bal] = (await q(
      `SELECT coalesce(sum(debit_paise),0)::bigint d, coalesce(sum(credit_paise),0)::bigint c
         FROM journal_lines WHERE entry_id = $1`, [entry])).rows;
    if (String(bal.d) !== String(bal.c)) {
      throw new PurchaseRefused(
        `the ledger does not balance: ${bal.d} debit against ${bal.c} credit. Nothing has ` +
        `been saved — the goods never arrived, because a receipt that posts an unbalanced ` +
        `entry is worse than one that did not post.`, 'R07.11');
    }

    /* ── R07.2 · what "received short" leaves behind ──────────────────────────
       The order closes only when every line is satisfied. Anything less stays open with the
       outstanding quantity on it, which is the record that makes a short delivery visible
       instead of merely smaller. */
    const rest = (await q(
      `SELECT coalesce(sum(qty_ordered - qty_received),0)::numeric outstanding
         FROM purchase_order_items WHERE po_id = $1`, [order.id])).rows[0].outstanding;
    const closed = Number(rest) <= 1e-9;
    if (closed) {
      await q(`UPDATE purchase_orders SET status = 'closed' WHERE id = $1`, [order.id]);
    }

    return {
      grnNumber, poNumber: order.po_number,
      status: closed ? 'closed' : 'open',
      outstandingQty: Math.round(Number(rest) * 1000) / 1000,
      goodsPaise: goodsValue, taxPaise: taxValue, payablePaise: goodsValue + taxValue,
      into: loc[0].code,
      lines: detail,
    };
  });
}

module.exports = { raisePO, receive, PurchaseRefused, readLines, activeVendor };
