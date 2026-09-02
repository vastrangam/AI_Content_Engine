'use strict';
/* MODULE 07 · PURCHASE — buying, asked of a running database.
 *
 *   node medhava/test/purchase.test.js
 *
 * brand/site/rules.js carries 12 rules for Purchase. Three are enforced by
 * medhava/server/purchase.js and each has a check here. The other nine — approval routing,
 * landed cost, dated vendor pricing, the job-work despatch, the insurance register and the
 * rest — are SPECIFIED and deliberately have no check. A test for an unbuilt rule passes for
 * the wrong reason, and a suite full of those is how 300 green checks agreed with a defect.
 *
 * P4 IS THE ONE THAT MATTERS MOST. R07.2 says a short receipt is recorded short and the
 * payable follows the RECEIVED quantity, never the ordered one. That is the rule a purchasing
 * system gets wrong in the direction that costs money: paying for what was promised rather
 * than for what turned up. The check computes what the ledger actually posted and compares it
 * against received × rate, so an implementation that quietly used the order total would fail
 * here rather than at a reconciliation months later.
 *
 * P8 IS THE ISOLATION ONE, and it is refused by the DATABASE. Receiving against another
 * company's purchase order does not reach a comparison in purchase.js — the row is invisible
 * to the session's role, so the lookup finds nothing. If row-level security were switched off,
 * this check would fail, which is the only reason it is worth having.
 */

const assert = require('node:assert');

const db = require('../server/db.js');
const { seed, IDS } = require('../seed/demo.js');
const purchase = require('../server/purchase.js');
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
const DORMANT = 'Dormant Trims Co (demo)';

async function onHandOf(scope, sku) {
  const rows = await db.withContext(scope, (q) => inv.onHand(q, {}));
  const line = rows.find((r) => r.sku === sku);
  return line ? Number(line.qty) : 0;
}
async function firstSku(scope) {
  const r = await db.withContext(scope, (q) =>
    q('SELECT sku FROM items ORDER BY sku LIMIT 1'));
  return r.rows[0].sku;
}
async function firstLocation(scope) {
  const r = await db.withContext(scope, (q) =>
    q('SELECT code FROM locations ORDER BY code LIMIT 1'));
  return r.rows[0].code;
}
/* What the ledger says is owed to vendors, read back rather than assumed. */
async function payable(scope) {
  const r = await db.withContext(scope, (q) => q(
    `SELECT coalesce(sum(l.credit_paise - l.debit_paise),0)::bigint owed
       FROM journal_lines l
       JOIN journal_entries e ON e.id = l.entry_id
       JOIN accounts a ON a.id = l.account_id
      WHERE a.code = '2000'`));
  return Number(r.rows[0].owed);
}

async function main() {
  await db.open();
  await seed();
  const sku = await firstSku(A1);
  const into = await firstLocation(A1);

  await test('P1  a purchase order is raised against an active vendor and moves no stock',
    async () => {
      const before = await onHandOf(A1, sku);
      const po = await purchase.raisePO(A1, {
        vendor: VENDOR,
        lines: [{ sku, qty: 10, ratePaise: 20000, gstRate: 5 }],
      });
      assert.match(po.poNumber, /^PO-\d{5}$/, `odd PO number ${po.poNumber}`);
      assert.strictEqual(po.status, 'open');
      assert.strictEqual(po.subtotalPaise, 200000, 'ten at 200.00 is 2000.00');
      assert.strictEqual(po.taxPaise, 10000, '5% of 2000.00 is 100.00');
      assert.strictEqual(await onHandOf(A1, sku), before,
        'raising an order moved stock. An order is a promise; nothing has arrived.');
    });

  await test('P2  R07.7 · an order against a dormant vendor is refused, and says which rule',
    async () => {
      await assert.rejects(
        () => purchase.raisePO(A1, {
          vendor: DORMANT, lines: [{ sku, qty: 1, ratePaise: 100, gstRate: 0 }],
        }),
        (e) => e instanceof purchase.PurchaseRefused && e.rule === 'R07.7'
          && /not active/.test(e.message),
        'a dormant vendor was accepted');
    });

  await test('P3  R07.7 · an order against a vendor that does not exist is refused',
    async () => {
      await assert.rejects(
        () => purchase.raisePO(A1, {
          vendor: 'Nobody At All', lines: [{ sku, qty: 1, ratePaise: 100 }],
        }),
        (e) => e.rule === 'R07.7', 'an invented vendor name was accepted');
    });

  await test('P4  R07.2 · a SHORT receipt adds only what arrived, and owes only for that',
    async () => {
      const po = await purchase.raisePO(A1, {
        vendor: VENDOR, lines: [{ sku, qty: 100, ratePaise: 5000, gstRate: 0 }],
      });
      const stockBefore = await onHandOf(A1, sku);
      const owedBefore = await payable(A1);

      const grn = await purchase.receive(A1, {
        poNumber: po.poNumber, into, lines: [{ sku, qty: 40 }],
      });

      assert.strictEqual(grn.status, 'open',
        'a short receipt closed the order. The other 60 are still owed by the vendor.');
      assert.strictEqual(grn.outstandingQty, 60, `outstanding is ${grn.outstandingQty}`);
      assert.strictEqual(await onHandOf(A1, sku), stockBefore + 40,
        'the stock movement did not match what was received');
      /* THE RULE, IN ARITHMETIC. 40 × 50.00 = 2000.00 — not 100 × 50.00. */
      assert.strictEqual(grn.payablePaise, 200000,
        `owed ${grn.payablePaise} for 40 received at 5000 paise; the ordered quantity was 100 ` +
        `and using it would give 500000`);
      assert.strictEqual(await payable(A1) - owedBefore, 200000,
        'the ledger owes a different amount from the receipt that produced it');
    });

  await test('P5  R07.2 · the rest of a short order can be received, and then it closes',
    async () => {
      const po = await purchase.raisePO(A1, {
        vendor: VENDOR, lines: [{ sku, qty: 30, ratePaise: 1000, gstRate: 0 }],
      });
      const first = await purchase.receive(A1, {
        poNumber: po.poNumber, into, lines: [{ sku, qty: 12 }] });
      assert.strictEqual(first.status, 'open');
      const second = await purchase.receive(A1, {
        poNumber: po.poNumber, into, lines: [{ sku, qty: 18 }] });
      assert.strictEqual(second.status, 'closed',
        'the order did not close when every line was satisfied');
      assert.strictEqual(second.outstandingQty, 0);
    });

  await test('P6  R07.11 · receiving MORE than was ordered is refused',
    async () => {
      const po = await purchase.raisePO(A1, {
        vendor: VENDOR, lines: [{ sku, qty: 5, ratePaise: 1000 }] });
      await assert.rejects(
        () => purchase.receive(A1, {
          poNumber: po.poNumber, into, lines: [{ sku, qty: 6 }] }),
        (e) => e.rule === 'R07.11' && /more than was ordered/.test(e.message),
        'an over-receipt was accepted, leaving a payable the order does not cover');
    });

  await test('P7  the ledger balances, and GST paid is an asset rather than a cost',
    async () => {
      const po = await purchase.raisePO(A1, {
        vendor: VENDOR, lines: [{ sku, qty: 10, ratePaise: 10000, gstRate: 12 }] });
      const grn = await purchase.receive(A1, {
        poNumber: po.poNumber, into, lines: [{ sku, qty: 10 }] });

      assert.strictEqual(grn.goodsPaise, 100000, 'ten at 100.00');
      assert.strictEqual(grn.taxPaise, 12000, '12% of 1000.00 is 120.00');
      assert.strictEqual(grn.payablePaise, 112000, 'the vendor is owed goods plus tax');

      const r = await db.withContext(A1, (q) => q(
        `SELECT a.code, sum(l.debit_paise)::bigint d, sum(l.credit_paise)::bigint c
           FROM journal_lines l
           JOIN journal_entries e ON e.id = l.entry_id
           JOIN accounts a ON a.id = l.account_id
          WHERE e.voucher_number = $1 GROUP BY a.code ORDER BY a.code`, [grn.grnNumber]));
      const by = new Map(r.rows.map((x) => [x.code, x]));
      assert.strictEqual(Number(by.get('1200').d), 100000,
        'inventory was debited with something other than the goods value');
      assert.strictEqual(Number(by.get('1300').d), 12000,
        'GST paid did not reach the input-credit account. Putting it into inventory instead ' +
        'would overstate the value of every item on the shelf by the tax rate.');
      assert.strictEqual(Number(by.get('2000').c), 112000);
      const debits = r.rows.reduce((n, x) => n + Number(x.d), 0);
      const credits = r.rows.reduce((n, x) => n + Number(x.c), 0);
      assert.strictEqual(debits, credits, `${debits} debit against ${credits} credit`);
    });

  await test('P8  a purchase order of one company cannot be received by another',
    async () => {
      const po = await purchase.raisePO(A1, {
        vendor: VENDOR, lines: [{ sku, qty: 3, ratePaise: 1000 }] });
      const theirLocation = await firstLocation(A2);
      await assert.rejects(
        () => purchase.receive(A2, {
          poNumber: po.poNumber, into: theirLocation, lines: [{ sku, qty: 3 }] }),
        (e) => e instanceof purchase.PurchaseRefused,
        'one company received against another company\'s purchase order');
    });

  await test('P9  a receipt against a closed order is refused',
    async () => {
      const po = await purchase.raisePO(A1, {
        vendor: VENDOR, lines: [{ sku, qty: 2, ratePaise: 1000 }] });
      await purchase.receive(A1, { poNumber: po.poNumber, into, lines: [{ sku, qty: 2 }] });
      await assert.rejects(
        () => purchase.receive(A1, {
          poNumber: po.poNumber, into, lines: [{ sku, qty: 1 }] }),
        (e) => /closed/.test(e.message), 'a closed order accepted more goods');
    });

  await test('P10 an item nobody ordered cannot be received against the order',
    async () => {
      const po = await purchase.raisePO(A1, {
        vendor: VENDOR, lines: [{ sku, qty: 2, ratePaise: 1000 }] });
      await assert.rejects(
        () => purchase.receive(A1, {
          poNumber: po.poNumber, into, lines: [{ sku: 'NOT-A-SKU', qty: 1 }] }),
        (e) => e.rule === 'R07.11', 'goods nobody ordered were received onto the order');
    });

  await test('P11 nothing is left behind when a receipt is refused',
    async () => {
      /* THE TRANSACTION, ASKED RATHER THAN ASSUMED. The over-receipt in P6 is refused after
         the GRN header has already been inserted, so if the transaction did not roll back
         there would be an orphan goods-receipt note with no lines — a document that says
         goods arrived and cannot say which. */
      const before = (await db.withContext(A1, (q) =>
        q('SELECT count(*)::int c FROM grn'))).rows[0].c;
      const po = await purchase.raisePO(A1, {
        vendor: VENDOR, lines: [{ sku, qty: 1, ratePaise: 1000 }] });
      await purchase.receive(A1, { poNumber: po.poNumber, into, lines: [{ sku, qty: 1 }] })
        .catch(() => {});
      const po2 = await purchase.raisePO(A1, {
        vendor: VENDOR, lines: [{ sku, qty: 1, ratePaise: 1000 }] });
      await purchase.receive(A1, { poNumber: po2.poNumber, into, lines: [{ sku, qty: 9 }] })
        .catch(() => {});
      const after = (await db.withContext(A1, (q) =>
        q('SELECT count(*)::int c FROM grn'))).rows[0].c;
      assert.strictEqual(after, before + 1,
        `${after - before} goods-receipt notes exist where 1 should. The refused receipt left ` +
        `a header behind, which is a document claiming goods arrived that cannot say which.`);
    });

  console.log('');
  results.forEach(([mark, name]) => console.log(`  ${mark}  ${name}`));
  console.log('');
  console.log('  ' + '='.repeat(68));
  console.log(`  ${pass} passed, ${fail} failed`);
  if (!fail) {
    console.log('  Module 07 · Purchase — 3 of its 12 rules enforced and checked here.');
    console.log('  The other 9 are SPECIFIED and have no check, deliberately.');
  }
  console.log('');

  await db.close();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('\nthe suite itself failed:', e); process.exit(1); });
