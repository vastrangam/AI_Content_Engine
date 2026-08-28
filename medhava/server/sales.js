'use strict';
/* MODULE 05 · SALES — the write side, and the first place this platform creates a business record.
 *
 * WHAT A SALE ACTUALLY IS
 * Not a row in an orders table. A sale is five writes that are only correct together:
 *
 *     the order and its lines      what was agreed
 *     the invoice and its lines    what the customer is billed, and the tax on it
 *     the stock movement           the goods leaving the godown
 *     the journal entry            the customer owing, the business earning, the tax held
 *     the cost entry               the goods leaving the balance sheet into cost of sales
 *
 * Every one of them, or none. That is R05.2, and R05.3 says what "none" means when the last one
 * refuses: the stock never moved. Those two rules are the reason db.withTransaction exists.
 *
 * WHY THIS MATTERS MORE THAN IT SOUNDS
 * A half-posted sale does not throw and does not look wrong. The order is there, the customer has
 * the goods, and the stock figure is one short — forever, with nothing to reconcile it against.
 * It surfaces at a physical count months later as "we are short", and no amount of looking at the
 * order book explains it, because the order book is right.
 *
 * THE RULES THIS FILE ENFORCES, BY NUMBER
 *   R05.1   every sale carries its company and its channel
 *   R05.2   stock, invoice and ledger post together
 *   R05.3   if the ledger refuses, the stock never moved
 *   R05.13  a sale to a sister company is marked as one
 *   R05.15  a line with no quantity or a negative rate is not a line
 *   R05.16  an export line under LUT carries no GST
 * Each is named at the code that enforces it, and each has a check in
 * medhava/test/sales.test.js that was proven to fail before it passed.
 *
 * WHAT THIS FILE DELIBERATELY DOES NOT DO
 * Credit limits (R05.8), price floors and approvals (R05.5), quote conversion (R05.4) and
 * dispatch checks (R05.9) are SPECIFIED and not built. They are not stubbed here — an empty
 * function named checkCreditLimit() reads as a control that exists.
 */

const db = require('./db.js');
const inventory = require('./inventory.js');

/* Money is integer paise everywhere. 0.1 + 0.2 = 0.30000000000000004 in float64, and a settlement
   out by a paisa is a settlement somebody reconciles by hand. Every figure below is an integer and
   every division rounds explicitly. */
const paise = (n) => {
  const v = Number(n);
  if (!Number.isInteger(v)) throw new SaleRefused(`${n} is not a whole number of paise`);
  return v;
};

class SaleRefused extends Error {
  constructor(message, rule) { super(message); this.rule = rule; }
}

/* ── R05.15 · a half-filled row is not a line ─────────────────────────────────
   "NEVER letting a half-filled row contribute a number to the total." The web form will happily
   send a row somebody started and abandoned. Dropping it silently would be its own defect — the
   total would be right and the order would be missing something the customer asked for — so an
   unusable line is REFUSED and named, not skipped. */
function readLines(raw) {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new SaleRefused('a sale needs at least one line', 'R05.15');
  }
  return raw.map((l, i) => {
    const where = `line ${i + 1}`;
    if (!l || !l.itemId) throw new SaleRefused(`${where} names no item`, 'R05.15');
    const qty = Number(l.qty);
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new SaleRefused(`${where} has quantity ${JSON.stringify(l.qty)}; a line needs a whole ` +
        `quantity above zero`, 'R05.15');
    }
    const rate = paise(l.ratePaise);
    if (rate < 0) {
      throw new SaleRefused(`${where} has a negative rate. A refund is a credit note, not a sale ` +
        `line with a minus in it`, 'R05.15');
    }
    return { itemId: String(l.itemId), qty, rate };
  });
}

/* ── the tax, computed once ──────────────────────────────────────────────────
   Split into CGST and SGST for a sale inside the state, IGST across states. The halves are
   derived so they cannot disagree with the whole: CGST is computed and SGST is the remainder,
   which is what keeps an odd paisa from vanishing. Splitting a 12% tax on ₹4,499 as two 6%
   roundings loses a paisa about half the time, and that paisa is what makes a GSTR-1 not tie. */
function taxOn(taxablePaise, ratePercent, interState) {
  const total = Math.round((taxablePaise * ratePercent) / 100);
  if (interState) return { cgst: 0, sgst: 0, igst: total };
  const cgst = Math.floor(total / 2);
  return { cgst, sgst: total - cgst, igst: 0 };
}

/**
 * Post a sale. Everything, or nothing.
 *
 * @param scope  {tenantId, companyId} — from the session, never from the request body
 * @param input  {channelCode, orderType, lines[], customerState?, exportUnderLut?,
 *                counterpartyCompanyId?}
 */
async function postSale(scope, input) {
  return db.withTransaction(scope, async (q) => {
    /* ── R05.1 · the channel is required, and must be this company's ──────────
       "NEVER leaving either to be inferred later from the document number or the warehouse."
       The company comes from the session and is never read from the request. The channel is
       looked up WITHIN this company's scope, so a channel id belonging to another company simply
       is not found — the policy does the refusing, not a comparison this code remembered. */
    const code = String(input.channelCode || '').trim();
    if (!code) throw new SaleRefused('a sale must name the channel it came in on', 'R05.1');
    const ch = await q('SELECT id, code FROM channels WHERE code = $1 AND deleted_at IS NULL', [code]);
    if (!ch.rows.length) {
      throw new SaleRefused(`this company has no channel "${code}"`, 'R05.1');
    }
    const channelId = ch.rows[0].id;

    const lines = readLines(input.lines);

    /* Items are read inside the same scope, for the same reason. */
    const ids = [...new Set(lines.map((l) => l.itemId))];
    const found = await q(
      `SELECT i.id, i.sku, i.hsn_code, i.gst_rate, i.cost_paise, d.design_name
         FROM items i JOIN designs d ON d.id = i.design_id
        WHERE i.id = ANY($1::uuid[]) AND i.deleted_at IS NULL`, [ids]);
    const item = new Map(found.rows.map((r) => [r.id, r]));
    for (const id of ids) {
      if (!item.has(id)) throw new SaleRefused(`no item ${id} in this company`, 'R05.1');
    }

    /* ── R05.16 · an export under LUT carries no GST ──────────────────────────
       "NEVER applying the domestic rate and correcting it after the buyer queries the total."
       The decision is made once, here, and every line reads it — rather than each line deciding
       for itself, which is how one line in a twelve-line invoice keeps the domestic rate. */
    const isExport = input.orderType === 'export';
    const underLut = isExport && input.exportUnderLut !== false;
    const [me] = (await q('SELECT state_code FROM companies WHERE id = $1', [scope.companyId])).rows;
    const buyerState = String(input.customerState || me.state_code);
    const interState = isExport || buyerState !== me.state_code;

    let subtotal = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0, costTotal = 0;
    const priced = lines.map((l) => {
      const it = item.get(l.itemId);
      const taxable = l.qty * l.rate;
      const rate = underLut ? 0 : Number(it.gst_rate || 0);
      const t = taxOn(taxable, rate, interState);
      subtotal += taxable;
      cgstTotal += t.cgst; sgstTotal += t.sgst; igstTotal += t.igst;
      costTotal += l.qty * Number(it.cost_paise || 0);
      return { ...l, it, taxable, gstRate: rate, ...t,
               amount: taxable + t.cgst + t.sgst + t.igst };
    });
    const taxTotal = cgstTotal + sgstTotal + igstTotal;
    const total = subtotal + taxTotal;

    /* Document numbers are sequential within a company and a financial year. India's runs April
       to March, so a sale on 31 March and one on 1 April belong to different years — using the
       calendar year here would put them in the same series and the register would be wrong for
       exactly the two weeks anybody is looking at it. */
    const now = new Date();
    const fyStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    const fy = `${String(fyStart).slice(2)}-${String(fyStart + 1).slice(2)}`;
    const [{ prefix }] = (await q(
      'SELECT invoice_prefix AS prefix FROM companies WHERE id = $1', [scope.companyId])).rows;
    const next = async (table, column, like) => {
      const r = await q(
        `SELECT count(*)::int n FROM ${table} WHERE ${column} LIKE $1`, [like + '%']);
      return String(r.rows[0].n + 1).padStart(4, '0');
    };
    const orderNo = `${prefix}/${fy}/${await next('sales_orders', 'order_number', `${prefix}/${fy}/`)}`;
    const invNo = `${prefix}/INV/${fy}/${await next('invoices', 'invoice_number', `${prefix}/INV/${fy}/`)}`;

    /* ── the order ───────────────────────────────────────────────────────── */
    const [order] = (await q(
      `INSERT INTO sales_orders
         (company_id, channel_id, order_number, order_date, order_type,
          subtotal_paise, tax_paise, total_paise, status)
       VALUES ($1,$2,$3, now(), $4, $5,$6,$7, 'confirmed') RETURNING id`,
      [scope.companyId, channelId, orderNo, input.orderType || 'b2c',
       subtotal, taxTotal, total])).rows;

    for (const p of priced) {
      await q(
        `INSERT INTO sales_order_items
           (company_id, sales_order_id, item_id, qty, rate_paise, tax_paise, amount_paise)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [scope.companyId, order.id, p.itemId, p.qty, p.rate,
         p.cgst + p.sgst + p.igst, p.amount]);
    }

    /* ── the invoice ─────────────────────────────────────────────────────── */
    const [inv] = (await q(
      `INSERT INTO invoices
         (company_id, invoice_number, sales_order_id, invoice_date, place_of_supply_state,
          taxable_paise, cgst_paise, sgst_paise, igst_paise, total_paise, is_export, export_type)
       VALUES ($1,$2,$3, current_date, $4, $5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [scope.companyId, invNo, order.id, buyerState, subtotal,
       cgstTotal, sgstTotal, igstTotal, total, isExport,
       isExport ? (underLut ? 'with_lut' : 'without_lut') : null])).rows;

    for (const p of priced) {
      await q(
        `INSERT INTO invoice_items
           (company_id, invoice_id, item_id, description, hsn, qty, rate_paise,
            taxable_paise, gst_rate, cgst_paise, sgst_paise, igst_paise, amount_paise)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [scope.companyId, inv.id, p.itemId, p.it.design_name, p.it.hsn_code, p.qty, p.rate,
         p.taxable, p.gstRate, p.cgst, p.sgst, p.igst, p.amount]);
    }

    /* ── the stock, out of the godown ────────────────────────────────────── */
    const loc = await q(`SELECT id FROM locations WHERE deleted_at IS NULL ORDER BY code LIMIT 1`);
    if (!loc.rows.length) {
      throw new SaleRefused('this company has no location to ship from', 'R05.2');
    }
    /* THROUGH MODULE 03, NOT STRAIGHT INTO THE TABLE.
       This used to INSERT into stock_movements directly, so a sale of more pieces than exist was
       recorded happily and the balance went negative — R03.2 says an issue below zero is refused,
       and nothing here was asking. Issuing through inventory.issue() puts that rule in the path of
       every sale, inside this same transaction: a refusal takes the order, the invoice and the
       ledger with it, which is R05.3 doing its job on a fault R03.2 found. */
    for (const p of priced) {
      await inventory.issue(q, scope.companyId, {
        itemId: p.itemId, from: loc.rows[0].id, quantity: p.qty,
        type: 'sale', channelId, reference: orderNo,
      });
    }

    /* ── the ledger ──────────────────────────────────────────────────────────
       Two entries: the sale, and the cost of it. Keeping them separate is not tidiness — the
       first is what the customer owes and what was earned, the second is what it cost to earn,
       and a business that posts only the first shows every sale as pure profit. */
    const acc = new Map((await q('SELECT id, code FROM accounts WHERE deleted_at IS NULL')).rows
      .map((r) => [r.code, r.id]));
    for (const need of ['1100', '1200', '2100', '4000', '5000']) {
      if (!acc.has(need)) {
        throw new SaleRefused(`the chart of accounts is missing ${need}`, 'R05.2');
      }
    }

    /* ── R05.13 · a sale to a sister company is marked as one ─────────────────
       "NEVER posting it as an ordinary outside sale, which inflates the group turnover by trade
       it never did." The schema's own CHECK refuses a counterparty equal to the company, so a
       sale to yourself cannot be recorded even if this code asked it to. */
    const sister = input.counterpartyCompanyId || null;
    const entry = async (type, narration) => (await q(
      `INSERT INTO journal_entries
         (company_id, voucher_type, voucher_number, voucher_date, narration, reference,
          channel_id, counterparty_company_id, status, posted_at)
       VALUES ($1,$2,$3, current_date, $4,$5,$6,$7,'posted', now()) RETURNING id`,
      [scope.companyId, type, invNo, narration, orderNo, channelId, sister])).rows[0].id;

    const line = (id, accountCode, debit, credit, narration) => q(
      `INSERT INTO journal_lines (entry_id, account_id, debit_paise, credit_paise, narration)
       VALUES ($1,$2,$3,$4,$5)`, [id, acc.get(accountCode), debit, credit, narration]);

    const sale = await entry('sales_invoice', `Sale ${orderNo} on ${ch.rows[0].code}`);
    await line(sale, '1100', total, 0, 'Customer owes');
    await line(sale, '4000', 0, subtotal, 'Sales');
    if (taxTotal > 0) await line(sale, '2100', 0, taxTotal, 'GST collected, held for government');

    const cogs = await entry('journal', `Cost of ${orderNo}`);
    await line(cogs, '5000', costTotal, 0, 'Cost of goods sold');
    await line(cogs, '1200', 0, costTotal, 'Inventory reduced');

    /* THE ENTRY MUST BALANCE, AND IT IS ASKED RATHER THAN ASSUMED.
       Every arithmetic path above is integer, so this should never fire — which is exactly why it
       is here. A rounding change three months from now that unbalances a journal by one paisa
       would otherwise post successfully and be found by an accountant, not by this. */
    const [bal] = (await q(
      `SELECT coalesce(sum(debit_paise),0)::bigint d, coalesce(sum(credit_paise),0)::bigint c
         FROM journal_lines WHERE entry_id = ANY($1::uuid[])`, [[sale, cogs]])).rows;
    if (String(bal.d) !== String(bal.c)) {
      throw new SaleRefused(
        `the ledger does not balance: ${bal.d} debit against ${bal.c} credit. Nothing has been ` +
        `saved — the whole sale is rolled back, because a sale that posts an unbalanced entry is ` +
        `worse than one that did not post.`, 'R05.2');
    }

    return {
      orderNumber: orderNo, invoiceNumber: invNo, channel: ch.rows[0].code,
      subtotalPaise: subtotal, taxPaise: taxTotal, totalPaise: total, costPaise: costTotal,
      cgstPaise: cgstTotal, sgstPaise: sgstTotal, igstPaise: igstTotal,
      interState, exportUnderLut: underLut,
      lines: priced.map((p) => ({
        sku: p.it.sku, name: p.it.design_name, qty: p.qty, ratePaise: p.rate,
        gstRate: p.gstRate, taxablePaise: p.taxable, amountPaise: p.amount,
      })),
    };
  });
}

module.exports = { postSale, SaleRefused, taxOn, readLines };
