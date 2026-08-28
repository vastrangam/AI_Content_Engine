'use strict';
/* MODULE 03 · INVENTORY — the one stock number, asked of a running database.
 *
 *   node medhava/test/inventory.test.js
 *
 * brand/site/rules.js carries 14 rules for Inventory. Five are enforced by medhava/server/
 * inventory.js and each has a check here. The other nine are SPECIFIED and deliberately have no
 * check — consignment stock, per-channel dated prices, dead-stock ageing and the rest are not
 * built, and a test for an unbuilt rule passes for the wrong reason.
 *
 * I3 IS THE ONE THAT CHANGED ANOTHER MODULE. Before this module existed, postSale() inserted into
 * stock_movements directly and nothing anywhere checked the balance — a sale of forty pieces from
 * a shelf holding twelve was recorded happily, and the on-hand figure went negative with no
 * refusal and no error. That is R03.2 unenforced, and it is invisible: the order looks right, the
 * invoice looks right, and the stock figure is a negative number somebody finds at a count.
 */

const assert = require('node:assert');

const db = require('../server/db.js');
const { seed, IDS } = require('../seed/demo.js');
const inv = require('../server/inventory.js');
const sales = require('../server/sales.js');

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

const ctxRead = (fn) => db.withContext(A1, fn);
const ctxWrite = (fn) => db.withTransaction(A1, fn);

async function firstItem(scope) {
  const r = await db.withContext(scope, (q) =>
    q('SELECT id, sku FROM items ORDER BY sku LIMIT 1'));
  return r.rows[0];
}
async function firstLocation(scope) {
  const r = await db.withContext(scope, (q) =>
    q('SELECT id, code FROM locations ORDER BY code LIMIT 1'));
  return r.rows[0];
}

async function main() {
  await db.open();
  await seed();
  const item = await firstItem(A1);
  const loc = await firstLocation(A1);

  /* ── I1 · R03.1 · on hand is DERIVED, and the channel lives on the movement ──
     RED: added a stored quantity column to items and read from it instead → the figure stopped
     changing when a movement was written, and this failed on the second read. */
  await test('I1  R03.1 · on hand is the sum of the movements, not a stored number', async () => {
    const before = await ctxRead((q) => inv.balance(q, item.id, loc.id));
    await ctxWrite((q) => inv.receive(q, IDS.coA1,
      { itemId: item.id, to: loc.id, quantity: 7, reference: 'I1' }));
    const after = await ctxRead((q) => inv.balance(q, item.id, loc.id));
    assert.strictEqual(after, before + 7,
      `on hand went from ${before} to ${after} after receiving 7. A figure that does not follow ` +
      `the movements is a second source of truth, and it drifts silently.`);

    /* And the channel is on the MOVEMENT, not on the stock. There is no per-channel balance to
       ask for, which is the whole of R03.1: the last piece sold on one marketplace has to vanish
       from the other ten at the same instant. */
    const cols = await ctxRead((q) => q(
      `SELECT column_name FROM information_schema.columns
        WHERE table_name = 'stock_movements' AND column_name = 'channel_id'`));
    assert.strictEqual(cols.rows.length, 1, 'the movement does not record a channel');
    const onStock = await ctxRead((q) => q(
      `SELECT column_name FROM information_schema.columns
        WHERE table_name = 'items' AND column_name LIKE '%qty%' AND column_name <> 'stock_alert_qty'`));
    assert.strictEqual(onStock.rows.length, 0,
      `items carries ${onStock.rows.map((r) => r.column_name).join(', ')} — a stored quantity ` +
      `beside a derived one is exactly the drift this rule forbids`);
  });

  /* ── I2 · R03.7 · a quantity is a whole number above zero ──
     RED: removed the qty() guard → a movement of -5 was accepted as "a reversal" and the balance
     silently fell, with nothing recording why. */
  await test('I2  R03.7 · a fractional, zero or negative quantity is refused', async () => {
    for (const bad of [0, -5, 1.5, 'three', null]) {
      await assert.rejects(
        () => ctxWrite((q) => inv.receive(q, IDS.coA1,
          { itemId: item.id, to: loc.id, quantity: bad })),
        (e) => e instanceof inv.StockRefused && e.rule === 'R03.7',
        `a quantity of ${JSON.stringify(bad)} was accepted`);
    }
  });

  /* ── I3 · R03.2 · NEGATIVE STOCK IS A FAULT, NOT A STATE ──
     The rule this module exists for, and the one that was unenforced until it did.
     RED: reverted postSale to INSERT into stock_movements directly → the oversized sale posted,
     the balance went to -28, and this failed on "the balance is negative". */
  await test('I3  R03.2 · issuing more than exists is refused, and the balance never goes below zero',
    async () => {
      const have = await ctxRead((q) => inv.balance(q, item.id, loc.id));
      await assert.rejects(
        () => ctxWrite((q) => inv.issue(q, IDS.coA1,
          { itemId: item.id, from: loc.id, quantity: have + 1 })),
        (e) => e instanceof inv.StockRefused && e.rule === 'R03.2',
        `issuing ${have + 1} from a shelf holding ${have} was accepted`);
      const after = await ctxRead((q) => inv.balance(q, item.id, loc.id));
      assert.strictEqual(after, have, 'the refused issue changed the balance anyway');
      assert.ok(after >= 0, `the balance is ${after}. Negative stock is a fault, not a state.`);
    });

  /* ── I4 · R03.2 meets R05.3 · A SALE THAT WOULD GO NEGATIVE IS REFUSED WHOLE ──
     The integration point, and the reason building module 03 changed module 05. A sale is one
     transaction: if the stock issue is refused, the order, the invoice and the ledger must go with
     it. Counted, because "it threw" is not evidence that nothing was written.
     RED: reverted the sale to insert stock directly → the order, invoice and two journal entries
     were all committed and the balance went negative. */
  await test('I4  a sale of more than exists is refused, and leaves no order, invoice or ledger entry',
    async () => {
      const have = await ctxRead((q) => inv.balance(q, item.id, loc.id));
      const count = async (t) => Number((await db.godView(`SELECT count(*)::int c FROM ${t}`))[0].c);
      const before = { orders: await count('sales_orders'), invoices: await count('invoices'),
                       entries: await count('journal_entries'), moves: await count('stock_movements') };

      let refused = null;
      try {
        await sales.postSale(A1, { channelCode: 'D2C', orderType: 'b2c',
          lines: [{ itemId: item.id, qty: have + 10, ratePaise: 1_00_000 }] });
      } catch (e) { refused = e; }

      assert.ok(refused, `a sale of ${have + 10} from a shelf holding ${have} was accepted`);
      assert.strictEqual(refused.rule, 'R03.2',
        `refused, but by "${refused.rule}" — the stock rule is the one that should have stopped it`);

      const after = { orders: await count('sales_orders'), invoices: await count('invoices'),
                      entries: await count('journal_entries'), moves: await count('stock_movements') };
      for (const k of Object.keys(before)) {
        assert.strictEqual(after[k], before[k],
          `${k} went from ${before[k]} to ${after[k]}. The sale was refused and this was left ` +
          `behind — a customer with no goods, or an invoice for a sale that never happened.`);
      }
      assert.strictEqual(await ctxRead((q) => inv.balance(q, item.id, loc.id)), have,
        'the balance moved despite the refusal');
    });

  /* ── I5 · a sale that DOES fit still works, and takes the stock down ──
     The positive control. Without it I3 and I4 would both pass against a module that refused
     every issue, and the suite would be green on software that cannot sell anything.
     RED: made inv.issue() always refuse → this failed while I3 and I4 stayed green, which is
     exactly the hole it is here to close. */
  await test('I5  a sale within stock posts, and the balance falls by what was sold', async () => {
    const have = await ctxRead((q) => inv.balance(q, item.id, loc.id));
    assert.ok(have >= 2, `this check needs at least 2 on hand, found ${have}`);
    const out = await sales.postSale(A1, { channelCode: 'D2C', orderType: 'b2c',
      lines: [{ itemId: item.id, qty: 2, ratePaise: 4_49_900 }] });
    assert.ok(out.orderNumber, 'the sale returned no order number');
    const after = await ctxRead((q) => inv.balance(q, item.id, loc.id));
    assert.strictEqual(after, have - 2,
      `sold 2 and the balance went from ${have} to ${after}`);
  });

  /* ── I6 · R03.6 · a movement from nowhere to nowhere ──
     RED: removed the check → the insert reached the database and died on the schema's own CHECK,
     so the caller got a constraint violation instead of a named rule, and this failed on the tag. */
  await test('I6  R03.6 · a movement naming neither a source nor a destination is refused',
    async () => {
      await assert.rejects(
        () => ctxWrite((q) => inv.move(q, IDS.coA1, { itemId: item.id, quantity: 1 })),
        (e) => e instanceof inv.StockRefused && e.rule === 'R03.6',
        'a movement from nowhere to nowhere was accepted');
    });

  /* ── I7 · R03.5 · value is computed, never stored ──
     RED: had onHand() read a valuation column instead of multiplying → the value stopped matching
     quantity × cost the moment a movement changed the quantity. */
  await test('I7  R03.5 · stock value is quantity times item cost, every time it is asked',
    async () => {
      const rows = await ctxRead((q) => inv.onHand(q));
      assert.ok(rows.length, 'no stock at all — this check needs something on the shelf');
      for (const r of rows) {
        assert.strictEqual(r.valuePaise, r.onHand * r.costPaise,
          `${r.sku}: value ${r.valuePaise} against ${r.onHand} × ${r.costPaise}`);
        assert.ok(Number.isInteger(r.valuePaise), `${r.sku} has a fractional value`);
      }
      /* And it follows the quantity rather than lagging it. */
      const one = rows[0];
      await ctxWrite((q) => inv.receive(q, IDS.coA1,
        { itemId: one.itemId, to: one.locationId, quantity: 3, reference: 'I7' }));
      const [again] = (await ctxRead((q) => inv.onHand(q, { itemId: one.itemId, locationId: one.locationId })));
      assert.strictEqual(again.valuePaise, (one.onHand + 3) * one.costPaise,
        'the value did not follow the quantity it describes');
    });

  /* ── I8 · stock is scoped like every other business record ──
     A CONTROL, NOT A GUARD, AND THE DIFFERENCE IS WORTH STATING.
     Every other check here was proven by breaking the thing it watches. This one could not be:
     no edit inside inventory.js makes it fail. onHand() runs on the `q` its caller hands it, and
     that connection is already the `authenticated` role with the company set — so the scoping is
     enforced a layer below this module and cannot be undone from inside it. Routing through
     db.asOwner does not escape either, for the reason recorded on godView in db.js: one
     connection, and the role is connection state.
     So this is here as a control on a NEW READ PATH rather than as a check with a red behind it.
     What actually guards isolation is medhava/test/isolation.test.js, where the plants do bite.
     Said plainly because a check with no proven failure looks exactly like one that has it. */
  await test('I8  one company cannot see another\'s stock', async () => {
    const mine = await db.withContext(A1, (q) => inv.onHand(q));
    const theirs = await db.withContext(A2, (q) => inv.onHand(q));
    const all = await db.godView(
      `SELECT count(DISTINCT (item_id, coalesce(to_location, from_location)))::int c
         FROM stock_movements`);
    assert.ok(mine.length > 0 && theirs.length > 0, 'one of the companies has no stock to compare');
    const overlap = mine.filter((m) => theirs.some((t) => t.itemId === m.itemId));
    assert.strictEqual(overlap.length, 0,
      `${overlap.map((o) => o.sku).join(', ')} appears in both companies' stock`);
    assert.ok(mine.length < Number(all[0].c),
      `this company sees ${mine.length} stock lines and the database holds ${all[0].c}. Equal ` +
      `means the scoping is doing nothing and every other check here is an accident.`);
  });

  console.log('');
  results.forEach(([mark, name]) => console.log(`  ${mark}  ${name}`));
  console.log('');
  console.log('  ' + '='.repeat(68));
  console.log(`  ${pass} passed, ${fail} failed`);
  if (!fail) {
    console.log('  Module 03 · Inventory — 5 of its 14 rules enforced and checked here.');
    console.log('  The other 9 are SPECIFIED and have no check, deliberately.');
  }
  console.log('');

  await db.close();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('\nthe suite itself failed:', e); process.exit(1); });
