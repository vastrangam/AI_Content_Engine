'use strict';
/* ONE WORKING DAY, END TO END — the test the maturity level rests on.
 *
 *   node medhava/test/day.test.js
 *
 * WHY THIS FILE EXISTS AND WHAT IT IS ALLOWED TO DECIDE
 * brand/site/audit.js carries a maturity level for the whole product, and a level with no
 * stated next condition is a mood rather than a measurement. So it names one:
 *
 *     "Level 4, Functional, would mean a business could run a real day of its work end to
 *      end in this system. The nearest honest test is one working day — buy something,
 *      receive it, make something from it, sell it, ship it, and see all four in the ledger."
 *
 * This is that test, as far as the product can currently go. Writing the condition down and
 * never running it is exactly how a level becomes a mood, and checkaudit.js caps the level at
 * Prototype until something changes — so this file is the only thing that can lift it, and it
 * lifts it only by passing.
 *
 * WHAT IT DELIBERATELY DOES NOT CLAIM
 * The named condition has five steps and this covers three: buy, receive, sell. Nothing here
 * makes anything (module 08 is not built) and nothing ships it (module 11 is not built), so
 * the sentence in audit.js is not yet satisfied in full and the maturity level does not move
 * to 4 on the strength of this file alone. What it does prove is that the three modules that
 * DO exist compose — which is a different and smaller claim, and the one the evidence
 * supports.
 *
 * PER-MODULE TESTS CANNOT FIND WHAT THIS FINDS. inventory.test.js proves stock moves,
 * purchase.test.js proves a receipt posts, sales.test.js proves a sale posts. Every one of
 * them seeds its own starting position. This one starts from a real purchase and carries the
 * same goods all the way through, so a disagreement between modules about what a quantity or
 * a rupee means has somewhere to show up.
 */

const assert = require('node:assert');

const db = require('../server/db.js');
const { seed, IDS } = require('../seed/demo.js');
const purchase = require('../server/purchase.js');
const sales = require('../server/sales.js');
const inv = require('../server/inventory.js');

let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  try { await fn(); pass++; results.push(['ok  ', name]); }
  catch (e) {
    fail++; results.push(['FAIL', name]);
    console.error(`\n  FAIL  ${name}\n        ${String(e.message).split('\n').join('\n        ')}\n`);
  }
}

const A1 = { tenantId: IDS.tenantA, companyId: IDS.coA1 };
const A2 = { tenantId: IDS.tenantA, companyId: IDS.coA2 };
const VENDOR = 'Surat Fabric House (demo)';

const ctx = (scope, fn) => db.withContext(scope, fn);

/* THE FIELD IS `onHand`, AND READING `qty` COST THIS FILE ITS FIRST THREE CHECKS.
   Written as `Number(r.qty)` it returned NaN for every row, so every quantity assertion
   compared NaN against NaN — and assert.strictEqual uses Object.is, under which NaN EQUALS
   NaN. D2 and D3 reported green while proving nothing at all. Only D6, which asks whether a
   number is greater than zero rather than whether it equals another, could tell: NaN > 0 is
   false. A check that can only pass is not a check, and three of them shipped green for
   about four minutes. */
async function onHand(scope, sku) {
  const rows = await ctx(scope, (q) => inv.onHand(q, {}));
  const mine = rows.filter((r) => r.sku === sku);
  return mine.reduce((n, r) => {
    const v = Number(r.onHand);
    if (!Number.isFinite(v)) {
      throw new Error(`onHand returned ${JSON.stringify(r.onHand)} for ${r.sku}. A quantity ` +
        `that is not a number must stop the test rather than be compared, because NaN ` +
        `equals NaN under assert.strictEqual and the comparison would pass.`);
    }
    return n + v;
  }, 0);
}
/* The ledger, by account, read back from what was actually posted. */
async function ledger(scope) {
  const r = await ctx(scope, (q) => q(
    `SELECT a.code, coalesce(sum(l.debit_paise),0)::bigint d,
            coalesce(sum(l.credit_paise),0)::bigint c
       FROM journal_lines l
       JOIN journal_entries e ON e.id = l.entry_id
       JOIN accounts a ON a.id = l.account_id
      GROUP BY a.code`));
  const m = new Map(r.rows.map((x) => [x.code, { d: Number(x.d), c: Number(x.c) }]));
  return (code) => m.get(code) || { d: 0, c: 0 };
}

async function main() {
  await db.open();
  await seed();

  const first = (await ctx(A1, (q) =>
    q('SELECT id, sku FROM items ORDER BY sku LIMIT 1'))).rows[0];
  const location = (await ctx(A1, (q) =>
    q('SELECT id, code FROM locations ORDER BY code LIMIT 1'))).rows[0];
  const sku = first.sku;

  /* THE DELIVERY IS SHORT ON PURPOSE, and the first version of this file was not.
     Ordering 60 and receiving 60 makes "received" and "ordered" the same number, so a
     purchase module that used the wrong one would pass every check here — proven by
     planting exactly that defect, which changed nothing. A real day is rarely a full
     delivery, and a composition test whose numbers all coincide is a test that cannot tell
     the modules apart. 60 ordered, 40 delivered, 25 sold: every figure below is distinct,
     so a module reaching for the wrong one has nowhere to hide. */
  const BUY_QTY = 60;
  const GOT_QTY = 40;             // short by 20 — the order stays open for the rest
  const BUY_RATE = 1_00_000;      // ₹1,000.00 a piece, in paise
  const SELL_QTY = 25;
  const SELL_RATE = 2_50_000;     // ₹2,500.00 a piece

  const opening = await onHand(A1, sku);
  const before = await ledger(A1);
  let received;

  await test('D1  buy — a purchase order is raised, and nothing has arrived yet',
    async () => {
      const po = await purchase.raisePO(A1, {
        vendor: VENDOR, lines: [{ sku, qty: BUY_QTY, ratePaise: BUY_RATE, gstRate: 0 }] });
      assert.strictEqual(po.status, 'open');
      assert.strictEqual(await onHand(A1, sku), opening,
        'stock changed when the order was raised. An order is a promise.');
      global.__po = po;
    });

  await test('D2  receive — the goods arrive, stock rises by exactly what was received',
    async () => {
      received = await purchase.receive(A1, {
        poNumber: global.__po.poNumber, into: location.code,
        lines: [{ sku, qty: GOT_QTY }] });
      assert.strictEqual(received.status, 'open',
        'a short receipt closed the order — the other 20 are still owed by the vendor');
      assert.strictEqual(received.outstandingQty, BUY_QTY - GOT_QTY);
      assert.strictEqual(await onHand(A1, sku), opening + GOT_QTY,
        `stock is ${await onHand(A1, sku)} where ${opening + GOT_QTY} was expected — ` +
        `${GOT_QTY} arrived, not the ${BUY_QTY} that were ordered`);
      assert.strictEqual(received.payablePaise, GOT_QTY * BUY_RATE,
        `the vendor is owed ${received.payablePaise} where ${GOT_QTY * BUY_RATE} is what ` +
        `arrived times the agreed rate; ${BUY_QTY * BUY_RATE} would be paying for the order`);
    });

  await test('D3  sell — the same goods leave, and stock falls by exactly what was sold',
    async () => {
      const out = await sales.postSale(A1, {
        channelCode: 'D2C', orderType: 'b2c',
        lines: [{ itemId: first.id, qty: SELL_QTY, ratePaise: SELL_RATE }] });
      assert.ok(out.orderNumber && out.invoiceNumber, 'the sale produced no documents');
      assert.strictEqual(await onHand(A1, sku), opening + GOT_QTY - SELL_QTY,
        'the stock left after the sale does not match what ARRIVED minus what was sold');
    });

  await test('D4  the ledger tells the same story as the warehouse',
    async () => {
      const after = await ledger(A1);
      /* THE ONE ARITHMETIC THAT SPANS THREE MODULES. What the vendor is owed came from the
         purchase; what the customer owes came from the sale; the inventory account was
         debited by one and credited by the other. If any two of the three modules disagreed
         about a rupee, it would land here and nowhere else. */
      const owedToVendor = (after('2000').c - after('2000').d)
        - (before('2000').c - before('2000').d);
      assert.strictEqual(owedToVendor, GOT_QTY * BUY_RATE,
        `the ledger owes the vendor ${owedToVendor} for goods the receipt priced at ` +
        `${GOT_QTY * BUY_RATE}. ${BUY_QTY * BUY_RATE} would mean the ledger paid for the ` +
        `order rather than for the delivery.`);

      const owedByCustomer = (after('1100').d - after('1100').c)
        - (before('1100').d - before('1100').c);
      assert.ok(owedByCustomer > 0, 'the customer owes nothing after a sale');

      const inventoryUp = (after('1200').d - before('1200').d);
      assert.strictEqual(inventoryUp, GOT_QTY * BUY_RATE,
        'the inventory account did not rise by the value of the goods that actually arrived');
    });

  await test('D5  every journal entry the day produced balances',
    async () => {
      const r = await ctx(A1, (q) => q(
        `SELECT e.voucher_number,
                coalesce(sum(l.debit_paise),0)::bigint d,
                coalesce(sum(l.credit_paise),0)::bigint c
           FROM journal_entries e JOIN journal_lines l ON l.entry_id = e.id
          GROUP BY e.id, e.voucher_number
         HAVING coalesce(sum(l.debit_paise),0) <> coalesce(sum(l.credit_paise),0)`));
      assert.strictEqual(r.rows.length, 0,
        `${r.rows.length} entr${r.rows.length === 1 ? 'y does' : 'ies do'} not balance: ` +
        r.rows.map((x) => `${x.voucher_number} ${x.d}/${x.c}`).join(', '));
    });

  await test('D6  the whole day is invisible to another company',
    async () => {
      /* THE CHECK THAT WOULD FAIL IF ROW-LEVEL SECURITY WERE OFF. Everything above was done
         as one company. A second company in the SAME tenant must see none of it — not the
         purchase order, not the goods receipt, not the journal entries. This is the claim the
         whole platform rests on, asked after a real day's work rather than on an empty
         database where it is easy to satisfy. */
      const theirs = await ctx(A2, (q) => q(
        `SELECT (SELECT count(*)::int FROM purchase_orders WHERE po_number = $1) po,
                (SELECT count(*)::int FROM grn WHERE grn_number = $2) grn,
                (SELECT count(*)::int FROM journal_entries WHERE voucher_number = $2) je`,
        [global.__po.poNumber, received.grnNumber]));
      const t = theirs.rows[0];
      assert.strictEqual(t.po, 0, 'another company can see this company\'s purchase order');
      assert.strictEqual(t.grn, 0, 'another company can see this company\'s goods receipt');
      assert.strictEqual(t.je, 0, 'another company can see this company\'s journal entries');

      const mineNow = await onHand(A1, sku);
      const theirsNow = await onHand(A2, sku);
      assert.ok(mineNow > 0, 'this company has no stock, so the comparison proves nothing');
      assert.strictEqual(theirsNow, 0,
        `the other company sees ${theirsNow} of an item that is not theirs`);
    });

  console.log('');
  results.forEach(([mark, name]) => console.log(`  ${mark}  ${name}`));
  console.log('');
  console.log('  ' + '='.repeat(68));
  console.log(`  ${pass} passed, ${fail} failed`);
  if (!fail) {
    console.log('  Bought, received and sold the same goods on the real database, and the');
    console.log('  ledger agrees with the warehouse. Three of the five steps the maturity');
    console.log('  level names: nothing here MAKES anything or SHIPS anything, because');
    console.log('  modules 08 and 11 are not built. The level does not move on this alone.');
  }
  console.log('');

  await db.close();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('\nthe suite itself failed:', e); process.exit(1); });
