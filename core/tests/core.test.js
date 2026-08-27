'use strict';
/* The core's self-tests.

   The last one is the one that matters. Everything before it checks a part;
   that one checks the thing that did not exist before Phase 0 — an order that
   moves stock in one module and posts to the ledger in another, in a single
   transaction, with the trial balance still balancing and an audit row for
   every change.

   Run:  node core/tests/core.test.js
*/

const assert = require('node:assert');
const path = require('node:path');

const money = require('../money');
const { EffectiveLog, SpellLog, Unresolved, Ambiguous, monthSpan } = require('../logs');
const { open } = require('../db');
const audit = require('../audit');
const ledger = require('../ledger');
const stock = require('../stock');
const { Bus, declared } = require('../events');

let pass = 0; const fail = [];
function check(name, fn) {
  try { fn(); pass += 1; console.log(`ok   ${name}`); }
  catch (e) { fail.push(name); console.log(`FAIL ${name}\n       ${e.message.split('\n')[0]}`); }
}
function section(t) { console.log(`\n--- ${t} ---`); }

// ===========================================================================
section('money — integer paise, never a float');

check('the classic float error cannot happen here', () => {
  assert.strictEqual(0.1 + 0.2 === 0.3, false, 'floats still misbehave, as expected');
  assert.strictEqual(money.add(money.paise(0.1), money.paise(0.2)), money.paise(0.3));
});

check('rupees in, paise out', () => {
  assert.strictEqual(money.paise(1), 100);
  assert.strictEqual(money.paise('1,234.56'), 123456);
  assert.strictEqual(money.paise('₹ 2,000'), 200000);
  assert.strictEqual(money.paise(-45.5), -4550);
  assert.strictEqual(money.paise(''), 0);
});

check('an amount finer than a paisa is refused rather than silently rounded', () => {
  assert.throws(() => money.paise(1.005), /finer than one paisa/);
});

check('Indian digit grouping', () => {
  assert.strictEqual(money.format(money.paise(9756488)), '₹97,56,488.00');
  assert.strictEqual(money.format(money.paise(-1234.5)), '-₹1,234.50');
});

check('a split always sums back to the original — no paisa lost or invented', () => {
  const parts = money.split(money.paise(100), 3);
  assert.strictEqual(parts.reduce((a, b) => a + b, 0), money.paise(100));
  assert.deepStrictEqual(parts, [3334, 3333, 3333]);
});

check('an allocation in proportion also sums back exactly', () => {
  const parts = money.allocate(money.paise(1000), [1, 1, 1]);
  assert.strictEqual(parts.reduce((a, b) => a + b, 0), money.paise(1000));
});

check('round-off returns the difference, for its own ledger', () => {
  const { amount, difference } = money.roundOff(money.paise(99.6));
  assert.strictEqual(amount, money.paise(100));
  assert.strictEqual(difference, 40);
});

// ===========================================================================
section('effective-dated logs — zero matches is an error, not zero');

check('a raise closes the open row instead of overwriting it', () => {
  const log = new EffectiveLog('salary');
  log.setValue('karim', '2025-04-01', 15000);
  log.setValue('karim', '2025-06-01', 18000);
  const rows = log.rows('karim');
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(rows[0].to, '2025-05-31');
  assert.strictEqual(rows[1].to, null);
});

check('history still resolves to what was actually in force', () => {
  const log = new EffectiveLog('salary');
  log.setValue('karim', '2025-04-01', 15000);
  log.setValue('karim', '2025-06-01', 18000);
  assert.strictEqual(log.resolve('karim', '2025-05'), 15000);
  assert.strictEqual(log.resolve('karim', '2025-06'), 18000);
});

check('a future-dated raise activates by itself when that month arrives', () => {
  const log = new EffectiveLog('salary');
  log.setValue('muskan', '2025-04-01', 9000);
  log.setValue('muskan', '2026-08-01', 10000);
  assert.strictEqual(log.resolve('muskan', '2026-07'), 9000);
  assert.strictEqual(log.resolve('muskan', '2026-08'), 10000);
});

check('a nothing-in-force month raises, and never returns zero', () => {
  const log = new EffectiveLog('salary');
  log.setValue('p', '2025-04-01', 1000);
  assert.throws(() => log.resolve('p', '2025-03'), Unresolved);
  assert.throws(() => log.resolve('nobody', '2025-04'), Unresolved);
});

check('two rows covering one month is ambiguous, not a coin toss', () => {
  const log = new EffectiveLog('rate');
  log.add('x', '2025-04-01', '2025-06-30', 5);
  log.add('x', '2025-05-01', null, 7);
  assert.throws(() => log.resolve('x', '2025-05'), Ambiguous);
});

check('backdating over an open row is refused — that would rewrite history', () => {
  const log = new EffectiveLog('salary');
  log.setValue('p', '2025-06-01', 100);
  assert.throws(() => log.setValue('p', '2025-05-01', 200), /rewriting history/);
});

check('a tax rate resolves on a date, so old invoices stay correct', () => {
  const gst = new EffectiveLog('gst_rate');
  gst.setValue('6204', '2020-01-01', 5);
  gst.setValue('6204', '2025-09-22', 12);
  assert.strictEqual(gst.on('6204', '2025-09-21'), 5);
  assert.strictEqual(gst.on('6204', '2025-09-22'), 12);
});

check('a spell log lets a person leave and come back', () => {
  const spells = new SpellLog('employment');
  spells.join('p', '2024-04-01', '2025-03-31');
  spells.join('p', '2026-04-01');
  assert.strictEqual(spells.active('p', '2024-06'), true);
  assert.strictEqual(spells.active('p', '2025-09'), false);
  assert.strictEqual(spells.active('p', '2026-06'), true);
});

check('month spans handle February and the year end', () => {
  assert.strictEqual(monthSpan('2024-02').last, '2024-02-29');
  assert.strictEqual(monthSpan('2025-02').last, '2025-02-28');
  assert.strictEqual(monthSpan('2025-12').last, '2025-12-31');
});

// ===========================================================================
section('the database — one store, and nothing is ever deleted');

function seed() {
  const db = open(':memory:');
  const now = '2026-04-01T00:00:00Z';
  // The three companies, with the naming trap intact.
  for (const c of [
    { id: 'vs', name: 'Vastrangam',     brand_name: 'Vastrangam',    brand_code: 'VS', invoice_prefix: 'VS', state_code: '24' },
    { id: 'ef', name: 'Ethnic Fashion', brand_name: 'Go4Fashion',    brand_code: 'EF', invoice_prefix: 'EF', state_code: '24' },
    { id: 'ac', name: 'Adini',          brand_name: 'Adini Couture', brand_code: 'AC', invoice_prefix: 'AC', state_code: '24' },
  ]) db.insert('companies', { ...c, fy_start_month: 4, is_active: 1, created_at: now });

  db.insert('locations', { id: 'godown', company_id: 'vs', code: 'GD', name: 'Udhna Godown', type: 'godown', created_at: now });
  db.insert('designs', { id: 'muspur', company_id: 'vs', design_code: 'MUSPUR', design_name: 'MuskanPurple Anarkali', set_type: 'Anarkali Plazo Set', status: 'active', created_at: now });
  db.insert('items', { id: 'sku1', company_id: 'vs', design_id: 'muspur', sku: 'VS-MUSPUR-LAV-M', cost_paise: money.paise(600), mrp_paise: money.paise(2000), gst_rate: 12, uom: 'PCS', is_kit: 0, status: 'active', created_at: now });

  for (const a of [
    { id: 'debtors', code: '1100', name: 'Sundry Debtors', type: 'asset' },
    { id: 'stockac', code: '1200', name: 'Stock-in-hand',  type: 'asset' },
    { id: 'sales',   code: '4000', name: 'Sales',          type: 'income' },
    { id: 'ogst',    code: '2200', name: 'Output IGST',    type: 'liability' },
    { id: 'cogs',    code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
    { id: 'roundoff', code: '5900', name: 'Round Off',     type: 'expense' },
  ]) db.insert('accounts', { ...a, company_id: 'vs', is_group: 0, created_at: now });

  return db;
}

check('the schema loads and the three companies keep three different codes', () => {
  const db = seed();
  const ef = db.get('SELECT * FROM companies WHERE id = ?', ['ef']);
  assert.strictEqual(ef.name, 'Ethnic Fashion');
  assert.strictEqual(ef.brand_code, 'EF');
  assert.strictEqual(ef.invoice_prefix, 'EF');
  db.close();
});

check('an audited insert leaves a before/after trail', () => {
  const db = seed();
  audit.insert(db, 'designs', {
    id: 'd2', company_id: 'vs', design_code: 'KAJWHT', design_name: 'Kajal White',
    status: 'active', created_at: '2026-04-01T00:00:00Z',
  }, { companyId: 'vs', by: 'praveen' });
  const trail = audit.history(db, 'designs', 'd2');
  assert.strictEqual(trail.length, 1);
  assert.strictEqual(trail[0].action, 'insert');
  assert.strictEqual(trail[0].after.design_code, 'KAJWHT');
  assert.strictEqual(trail[0].changed_by, 'praveen');
  db.close();
});

check('an update records what it was as well as what it became', () => {
  const db = seed();
  audit.update(db, 'items', 'sku1', { mrp_paise: money.paise(2500) }, { by: 'vishal' });
  const [entry] = audit.history(db, 'items', 'sku1');
  assert.strictEqual(entry.before.mrp_paise, money.paise(2000));
  assert.strictEqual(entry.after.mrp_paise, money.paise(2500));
  db.close();
});

check('voiding is the only removal, and it is reversible', () => {
  const db = seed();
  audit.voidRow(db, 'items', 'sku1', { by: 'praveen', reason: 'discontinued' });
  assert.ok(db.get('SELECT deleted_at FROM items WHERE id = ?', ['sku1']).deleted_at);
  audit.restore(db, 'items', 'sku1', { by: 'praveen' });
  assert.strictEqual(db.get('SELECT deleted_at FROM items WHERE id = ?', ['sku1']).deleted_at, null);
  assert.strictEqual(audit.history(db, 'items', 'sku1').length, 2);
  db.close();
});

check('a table nobody thought to audit is refused, rather than slipping through', () => {
  const db = seed();
  assert.throws(
    () => audit.write(db, { table: 'events', id: '1', action: 'insert', apply: () => {} }),
    /not in the audited set/
  );
  db.close();
});

// ===========================================================================
section('the ledger — one posting engine');

check('a balanced entry posts', () => {
  const db = seed();
  const r = ledger.post(db, {
    companyId: 'vs', voucherType: 'sales', voucherDate: '2026-04-10',
    narration: '1 lehenga, out of state',
    lines: [
      { account: 'debtors', debit: money.paise(2240) },
      { account: 'sales',   credit: money.paise(2000) },
      { account: 'ogst',    credit: money.paise(240) },
    ],
  });
  assert.strictEqual(r.total, money.paise(2240));
  assert.ok(ledger.trialBalance(db, 'vs').balanced);
  db.close();
});

check('an unbalanced entry is refused, with the gap named', () => {
  const db = seed();
  assert.throws(() => ledger.post(db, {
    companyId: 'vs', voucherType: 'sales', voucherDate: '2026-04-10',
    lines: [
      { account: 'debtors', debit: money.paise(2240) },
      { account: 'sales',   credit: money.paise(2000) },
    ],
  }), /does not balance.*off by/s);
  db.close();
});

check('a line cannot be a debit and a credit at once', () => {
  const db = seed();
  assert.throws(() => ledger.post(db, {
    companyId: 'vs', voucherType: 'journal', voucherDate: '2026-04-10',
    lines: [{ account: 'sales', debit: 100, credit: 100 }, { account: 'debtors', debit: 100 }],
  }), /debit or a credit, never both/);
  db.close();
});

check('the trial balance is computed from the lines, never stored', () => {
  const db = seed();
  for (let i = 0; i < 25; i++) {
    ledger.post(db, {
      companyId: 'vs', voucherType: 'sales', voucherDate: '2026-04-10',
      lines: [{ account: 'debtors', debit: money.paise(112) },
              { account: 'sales', credit: money.paise(100) },
              { account: 'ogst', credit: money.paise(12) }],
    });
  }
  const tb = ledger.trialBalance(db, 'vs');
  assert.ok(tb.balanced);
  assert.strictEqual(tb.debit, money.paise(2800));
  assert.strictEqual(ledger.balance(db, 'vs', 'sales'), money.paise(2500));
  db.close();
});

check('a locked period refuses a backdated entry', () => {
  const db = seed();
  ledger.lockPeriod(db, 'vs', '2026-04', { by: 'praveen' });
  assert.throws(() => ledger.post(db, {
    companyId: 'vs', voucherType: 'sales', voucherDate: '2026-04-10',
    lines: [{ account: 'debtors', debit: 100 }, { account: 'sales', credit: 100 }],
  }), /is locked/);
  db.close();
});

check('unlocking a period is itself recorded', () => {
  const db = seed();
  ledger.lockPeriod(db, 'vs', '2026-04', { by: 'praveen' });
  ledger.unlockPeriod(db, 'vs', '2026-04', { by: 'praveen', reason: 'late vendor bill' });
  const rows = db.all(`SELECT * FROM audit_log WHERE table_name = 'period_locks' ORDER BY id`);
  assert.strictEqual(rows.length, 2);
  assert.strictEqual(rows[1].action, 'void');
  db.close();
});

// ===========================================================================
section('stock — one number, and kits expand');

check('a receipt then an issue leaves the right number', () => {
  const db = seed();
  stock.receive(db, { companyId: 'vs', itemId: 'sku1', qty: 10, locationId: 'godown' });
  stock.issueForSale(db, { companyId: 'vs', itemId: 'sku1', qty: 3, locationId: 'godown', reference: 'SO-1' });
  assert.strictEqual(stock.onHand(db, 'sku1'), 7);
  assert.strictEqual(stock.movements(db, 'sku1').length, 2);
  db.close();
});

check('issuing more than exists is refused — negative stock is a fault, not a state', () => {
  const db = seed();
  stock.receive(db, { companyId: 'vs', itemId: 'sku1', qty: 2, locationId: 'godown' });
  assert.throws(
    () => stock.issueForSale(db, { companyId: 'vs', itemId: 'sku1', qty: 5, locationId: 'godown' }),
    /only 2 there/
  );
  assert.strictEqual(stock.onHand(db, 'sku1'), 2, 'the failed issue moved nothing');
  db.close();
});

check('selling a kit decrements every component', () => {
  const db = seed();
  const now = '2026-04-01T00:00:00Z';
  for (const id of ['top', 'bottom', 'dupatta']) {
    db.insert('items', { id, company_id: 'vs', design_id: 'muspur', sku: `VS-MUSPUR-${id}`, cost_paise: 0, mrp_paise: 0, uom: 'PCS', is_kit: 0, status: 'active', created_at: now });
    stock.receive(db, { companyId: 'vs', itemId: id, qty: 5, locationId: 'godown' });
  }
  db.insert('items', { id: 'set3', company_id: 'vs', design_id: 'muspur', sku: 'VS-MUSPUR-SET', cost_paise: 0, mrp_paise: 0, uom: 'PCS', is_kit: 1, status: 'active', created_at: now });
  for (const c of ['top', 'bottom', 'dupatta']) db.insert('kit_items', { kit_item_id: 'set3', component_item_id: c, qty: 1 });

  stock.issueForSale(db, { companyId: 'vs', itemId: 'set3', qty: 2, locationId: 'godown', reference: 'SO-9' });
  for (const c of ['top', 'bottom', 'dupatta']) assert.strictEqual(stock.onHand(db, c), 3, c);
  db.close();
});

check('stock value ties to the item cost', () => {
  const db = seed();
  stock.receive(db, { companyId: 'vs', itemId: 'sku1', qty: 4, locationId: 'godown' });
  assert.strictEqual(stock.valuation(db, 'vs').total, money.paise(2400));
  db.close();
});

/* The three below back rules R03.6, R03.7 and R03.4 in brand/site/rules.js.
   Each was written because the rulebook claimed a refusal, and a claimed
   refusal with no test behind it is exactly what that document exists to
   stop being possible. */

check('a movement with neither a source nor a destination is refused', () => {
  const db = seed();
  assert.throws(
    () => stock.move(db, { companyId: 'vs', itemId: 'sku1', qty: 1 }),
    /source, a destination, or both/,
    'quantity that comes from nowhere and goes nowhere is not a movement'
  );
  db.close();
});

check('a quantity must be a whole number above zero', () => {
  const db = seed();
  for (const bad of [0, -3, 2.5]) {
    assert.throws(
      () => stock.receive(db, { companyId: 'vs', itemId: 'sku1', qty: bad, locationId: 'godown' }),
      /whole number above zero/,
      `${bad} should be refused`
    );
  }
  /* a reversal is its own movement with its own reason, never a negative one */
  assert.strictEqual(stock.onHand(db, 'sku1'), 0, 'nothing was written by the refused calls');
  db.close();
});

check('a kit that lists no components is refused, not silently sold as nothing', () => {
  const db = seed();
  db.insert('items', {
    id: 'emptykit', company_id: 'vs', design_id: 'muspur', sku: 'VS-EMPTY',
    cost_paise: 0, mrp_paise: 0, uom: 'PCS', is_kit: 1, status: 'active',
    created_at: '2026-04-01T00:00:00Z',
  });
  assert.throws(
    () => stock.explode(db, 'emptykit', 1),
    /lists no components/
  );
  db.close();
});

// ===========================================================================
section('the cascade bus — modules.js is the wiring diagram');

check('the canonical module list is read, not invented', () => {
  const spec = declared();
  // Derived, not typed. A count written here by hand goes stale the day a module
  // is added, and a stale number in a test is a test that passes while lying.
  const canonical = require(path.join(__dirname, '..', '..', 'brand', 'site', 'modules.js'));
  const numbered = canonical.filter((m) => m.n).length;
  assert.strictEqual(spec.modules.size, numbered, `modules.js declares ${numbered}`);
  assert.ok(spec.edges.length > 20, `${spec.edges.length} declared cascades`);
});

check('a module not in modules.js cannot subscribe', () => {
  const db = seed();
  const bus = new Bus(db);
  assert.throws(() => bus.on('anything', 'Module Seventeen', () => {}), /not a module/);
  db.close();
});

check('an emission is recorded whether or not anyone listens', () => {
  const db = seed();
  const bus = new Bus(db);
  bus.publishes('Sales', 'order.placed');
  bus.emit('order.placed', { order: 'SO-1' }, { companyId: 'vs' });
  const trail = bus.trail();
  assert.strictEqual(trail.length, 1);
  assert.strictEqual(trail[0].payload.order, 'SO-1');
  db.close();
});

check('a handler that throws takes the whole transaction with it', () => {
  const db = seed();
  const bus = new Bus(db);
  bus.publishes('Sales', 'order.placed');
  bus.on('order.placed', 'Inventory & Catalog', () => { throw new Error('stock refused'); });
  stock.receive(db, { companyId: 'vs', itemId: 'sku1', qty: 5, locationId: 'godown' });
  assert.throws(() => db.tx(() => {
    stock.issueForSale(db, { companyId: 'vs', itemId: 'sku1', qty: 1, locationId: 'godown' });
    bus.emit('order.placed', {}, { companyId: 'vs' });
  }), /stock refused/);
  assert.strictEqual(stock.onHand(db, 'sku1'), 5, 'the issue rolled back with the failed cascade');
  db.close();
});

// ===========================================================================
section('THE PROOF — one order, three modules, one transaction');

check('a sale moves stock and posts to the ledger, or does neither', () => {
  const db = seed();
  const bus = new Bus(db);

  bus.publishes('Sales', 'order.placed');

  // Inventory hears the order and takes the stock out.
  bus.on('order.placed', 'Inventory & Catalog', (o, { db: d }) =>
    stock.issueForSale(d, {
      companyId: o.companyId, itemId: o.itemId, qty: o.qty,
      locationId: 'godown', reference: o.orderId,
    }));

  // Accounting hears the same order and posts the sale and the cost of goods.
  bus.on('order.placed', 'Accounting & GST', (o, { db: d }) => {
    const net = money.mul(money.paise(o.price), o.qty);
    const gst = money.mul(net, 0.12);
    const cost = money.mul(
      d.get('SELECT cost_paise FROM items WHERE id = ?', [o.itemId]).cost_paise, o.qty
    );
    ledger.post(d, {
      companyId: o.companyId, voucherType: 'sales', voucherDate: o.date, reference: o.orderId,
      lines: [
        { account: 'debtors', debit: money.add(net, gst) },
        { account: 'sales',   credit: net },
        { account: 'ogst',    credit: gst },
      ],
    });
    ledger.post(d, {
      companyId: o.companyId, voucherType: 'journal', voucherDate: o.date, reference: o.orderId,
      narration: 'cost of goods sold',
      lines: [{ account: 'cogs', debit: cost }, { account: 'stockac', credit: cost }],
    });
  });

  stock.receive(db, { companyId: 'vs', itemId: 'sku1', qty: 10, locationId: 'godown' });

  db.tx(() => bus.emit('order.placed', {
    companyId: 'vs', orderId: 'SO-1001', itemId: 'sku1', qty: 2, price: 2000, date: '2026-04-10',
  }, { companyId: 'vs' }));

  // Stock moved.
  assert.strictEqual(stock.onHand(db, 'sku1'), 8, 'stock came down');
  // The books balance.
  const tb = ledger.trialBalance(db, 'vs');
  assert.ok(tb.balanced, `trial balance off by ${tb.difference}`);
  // Revenue is a query over the ledger, not a counter.
  assert.strictEqual(ledger.balance(db, 'vs', 'sales'), money.paise(4000));
  assert.strictEqual(ledger.balance(db, 'vs', 'ogst'), money.paise(480));
  assert.strictEqual(ledger.balance(db, 'vs', 'cogs'), money.paise(1200));
  // The cascade is on the record.
  const trail = bus.trail();
  assert.strictEqual(trail.length, 1);
  assert.ok(trail[0].handled_by.includes('Inventory & Catalog'));
  assert.ok(trail[0].handled_by.includes('Accounting & GST'));
  // And every change is answerable.
  assert.ok(db.value(`SELECT COUNT(*) FROM audit_log`) >= 3);
  db.close();
});

check('and if the ledger refuses, the stock never moved', () => {
  const db = seed();
  const bus = new Bus(db);
  bus.publishes('Sales', 'order.placed');
  bus.on('order.placed', 'Inventory & Catalog', (o, { db: d }) =>
    stock.issueForSale(d, { companyId: 'vs', itemId: o.itemId, qty: o.qty, locationId: 'godown' }));
  bus.on('order.placed', 'Accounting & GST', (o, { db: d }) =>
    ledger.post(d, {                        // deliberately unbalanced
      companyId: 'vs', voucherType: 'sales', voucherDate: '2026-04-10',
      lines: [{ account: 'debtors', debit: money.paise(100) },
              { account: 'sales',   credit: money.paise(90) }],
    }));

  stock.receive(db, { companyId: 'vs', itemId: 'sku1', qty: 10, locationId: 'godown' });
  assert.throws(() => db.tx(() =>
    bus.emit('order.placed', { itemId: 'sku1', qty: 2 }, { companyId: 'vs' })), /does not balance/);

  assert.strictEqual(stock.onHand(db, 'sku1'), 10, 'stock is untouched');
  assert.strictEqual(db.value('SELECT COUNT(*) FROM journal_entries'), 0);
  assert.strictEqual(db.value('SELECT COUNT(*) FROM events'), 0, 'the event rolled back too');
  db.close();
});

// ===========================================================================
section('scale — the schema does not know how many companies or channels there are');

/* Three companies and seven marketplaces is the data this business has today.
   Nothing in core/ is built around either number: companies is a table, channels
   is a table, and every business row carries company_id. So the honest way to
   answer "can it hold ten companies and ten channels each" is not to say yes in
   a document — it is to build the 10 x 10 grid, post through all hundred
   combinations, and check the three things that would break first:

     · every company's own figures are right, and its books still balance
     · no company can see another's rows
     · the group is the sum MINUS the trade the companies did with each other

   The third is the one a spreadsheet gets wrong. Adding up three companies that
   sell to each other reports a group turnover the group never earned. */

const N_CO = 10;
const N_CH = 10;
const CO = (i) => `co${String(i).padStart(2, '0')}`;
const CH = (i, j) => `${CO(i)}_ch${String(j).padStart(2, '0')}`;
/* Deterministic and different for every cell of the grid, so a figure that
   leaked between two companies or two channels cannot coincidentally match. */
const NET = (i, j) => money.paise(1000 + 100 * i + 10 * j);
const GST = (i, j) => money.mul(NET(i, j), 0.12);
const INTERCO = money.paise(5000);          // each company sells this to the next

/** Build a group of `n` companies with `m` channels each and post one sale down
 *  every channel, plus one sale to a sister company. Takes n and m as arguments
 *  precisely because nothing below reads a constant. */
function grid(n = N_CO, m = N_CH) {
  const db = open(':memory:');
  const now = '2026-04-01T00:00:00Z';
  const ACCOUNTS = [
    ['debtors', '1100', 'Sundry Debtors', 'asset'],
    ['stockac', '1200', 'Stock-in-hand', 'asset'],
    ['sales', '4000', 'Sales', 'income'],
    ['ogst', '2200', 'Output IGST', 'liability'],
    ['cogs', '5000', 'Cost of Goods Sold', 'expense'],
  ];

  for (let i = 1; i <= n; i++) {
    const c = CO(i);
    db.insert('companies', {
      id: c, name: `Company ${i}`, brand_name: `Brand ${i}`,
      brand_code: `B${String(i).padStart(2, '0')}`,
      invoice_prefix: `P${String(i).padStart(2, '0')}`,
      state_code: '24', fy_start_month: 4, is_active: 1, created_at: now,
    });
    db.insert('locations', { id: `${c}_gd`, company_id: c, code: 'GD', name: 'Godown', type: 'godown', created_at: now });
    db.insert('designs', { id: `${c}_d`, company_id: c, design_code: 'D1', design_name: 'Design 1', status: 'active', created_at: now });
    db.insert('items', {
      id: `${c}_sku`, company_id: c, design_id: `${c}_d`, sku: `${c}-D1-M`,
      cost_paise: money.paise(600), mrp_paise: money.paise(2000), gst_rate: 12,
      uom: 'PCS', is_kit: 0, status: 'active', created_at: now,
    });
    for (const [id, code, name, type] of ACCOUNTS) {
      db.insert('accounts', { id: `${c}_${id}`, company_id: c, code, name, type, is_group: 0, created_at: now });
    }
    for (let j = 1; j <= m; j++) {
      db.insert('channels', {
        id: CH(i, j), company_id: c, code: `CH${String(j).padStart(2, '0')}`,
        name: `Channel ${j}`, kind: j === 1 ? 'd2c' : 'marketplace',
        is_active: 1, created_at: now,
      });
    }
    stock.receive(db, { companyId: c, itemId: `${c}_sku`, qty: 100, locationId: `${c}_gd` });
  }

  // One sale down every channel of every company: n x m orders in total.
  for (let i = 1; i <= n; i++) {
    const c = CO(i);
    for (let j = 1; j <= m; j++) {
      const net = NET(i, j), gst = GST(i, j);
      db.tx(() => {
        stock.issueForSale(db, {
          companyId: c, itemId: `${c}_sku`, qty: 1, locationId: `${c}_gd`,
          channelId: CH(i, j), reference: `SO-${i}-${j}`,
        });
        ledger.post(db, {
          companyId: c, voucherType: 'sales', voucherDate: '2026-04-10',
          reference: `SO-${i}-${j}`, channelId: CH(i, j),
          lines: [
            { account: `${c}_debtors`, debit: money.add(net, gst) },
            { account: `${c}_sales`, credit: net },
            { account: `${c}_ogst`, credit: gst },
          ],
        });
      });
    }
    // …and one sale to the sister company next door, which the group must not count.
    const sister = CO(i === n ? 1 : i + 1);
    ledger.post(db, {
      companyId: c, voucherType: 'sales', voucherDate: '2026-04-11',
      narration: 'stock transfer to sister company', counterpartyCompanyId: sister,
      lines: [
        { account: `${c}_debtors`, debit: INTERCO },
        { account: `${c}_sales`, credit: INTERCO },
      ],
    });
  }
  return db;
}

check('ten companies and ten channels each is a hundred channels, not a limit', () => {
  const db = grid();
  assert.strictEqual(db.value('SELECT COUNT(*) FROM companies'), N_CO);
  assert.strictEqual(db.value('SELECT COUNT(*) FROM channels'), N_CO * N_CH);
  assert.strictEqual(db.value('SELECT COUNT(*) FROM journal_entries'), N_CO * (N_CH + 1));
  db.close();
});

check('every one of the hundred cells posted its own figure, channel by channel', () => {
  const db = grid();
  for (let i = 1; i <= N_CO; i++) {
    const byCh = ledger.byChannel(db, CO(i), '4000');
    const onChannels = byCh.filter((r) => r.channelId !== '(direct)');
    assert.strictEqual(onChannels.length, N_CH, `company ${i} sells on ${N_CH} channels`);
    for (let j = 1; j <= N_CH; j++) {
      const row = byCh.find((r) => r.channelId === CH(i, j));
      assert.strictEqual(row.amount, NET(i, j), `company ${i} channel ${j}`);
    }
    // The inter-company sale had no channel, so it lands apart from all ten.
    assert.strictEqual(byCh.find((r) => r.channelId === '(direct)').amount, INTERCO);
  }
  db.close();
});

check("each company's own books add up, and still balance", () => {
  const db = grid();
  for (let i = 1; i <= N_CO; i++) {
    let expected = INTERCO;
    for (let j = 1; j <= N_CH; j++) expected = money.add(expected, NET(i, j));
    assert.strictEqual(ledger.balance(db, CO(i), `${CO(i)}_sales`), expected, `company ${i} sales`);
    const tb = ledger.trialBalance(db, CO(i));
    assert.ok(tb.balanced, `company ${i} trial balance off by ${tb.difference}`);
  }
  db.close();
});

check('one company cannot read another company\'s rows', () => {
  const db = grid();
  // Reading company 2's sales account from company 1's books returns nothing —
  // the account belongs to a company, and balance() will not cross the line.
  assert.strictEqual(ledger.balance(db, CO(1), `${CO(2)}_sales`), 0);
  // And company 1's trial balance is built only from company 1's entries.
  const tb1 = ledger.trialBalance(db, CO(1));
  const all = db.value('SELECT SUM(debit_paise) FROM journal_lines');
  assert.ok(tb1.debit < all, 'one company is not the whole group');
  assert.strictEqual(
    db.value(`SELECT COUNT(*) FROM journal_entries e
                JOIN journal_lines l ON l.entry_id = e.id
                JOIN accounts a ON a.id = l.account_id
               WHERE e.company_id <> a.company_id`),
    0, 'no line ever points at another company\'s account'
  );
  db.close();
});

check('stock is one number per SKU, with the channel recorded on the movement', () => {
  const db = grid();
  for (let i = 1; i <= N_CO; i++) {
    // 100 received, one sold down each of ten channels.
    assert.strictEqual(stock.onHand(db, `${CO(i)}_sku`), 100 - N_CH, `company ${i} on hand`);
    const sold = stock.soldByChannel(db, CO(i), `${CO(i)}_sku`);
    assert.strictEqual(sold.length, N_CH);
    for (const row of sold) assert.strictEqual(row.qty, 1);
  }
  db.close();
});

check('the group is the sum MINUS what the companies sold each other', () => {
  const db = grid();
  const all = Array.from({ length: N_CO }, (_, k) => CO(k + 1));
  const c = ledger.consolidate(db, all, { accountCode: '4000' });

  // Worked out here from the grid, not read back from the same query.
  let outside = 0;
  for (let i = 1; i <= N_CO; i++) for (let j = 1; j <= N_CH; j++) outside = money.add(outside, NET(i, j));
  const internal = money.mul(INTERCO, N_CO);

  assert.strictEqual(c.per.length, N_CO, 'every company appears in the consolidation');
  assert.strictEqual(c.gross, money.add(outside, internal), 'gross is the plain sum');
  assert.strictEqual(c.eliminated, internal, 'every inter-company sale is eliminated');
  assert.strictEqual(c.group, outside, 'the group only counts trade with the outside world');
  assert.ok(c.group < c.gross, 'summing the companies would have overstated the group');
  db.close();
});

check('an eleventh company and an eleventh channel need no code change', () => {
  // The same builder, asked for more. Nothing in core/ was edited between the
  // two calls — which is the whole answer to "is it capped at three?"
  const db = grid(11, 11);
  assert.strictEqual(db.value('SELECT COUNT(*) FROM companies'), 11);
  assert.strictEqual(db.value('SELECT COUNT(*) FROM channels'), 121);
  assert.strictEqual(ledger.byChannel(db, CO(11), '4000').filter((r) => r.channelId !== '(direct)').length, 11);

  const all = Array.from({ length: 11 }, (_, k) => CO(k + 1));
  const c = ledger.consolidate(db, all, { accountCode: '4000' });
  let outside = 0;
  for (let i = 1; i <= 11; i++) for (let j = 1; j <= 11; j++) outside = money.add(outside, NET(i, j));
  assert.strictEqual(c.group, outside);
  assert.strictEqual(c.eliminated, money.mul(INTERCO, 11));
  for (let i = 1; i <= 11; i++) assert.ok(ledger.trialBalance(db, CO(i)).balanced, `company ${i}`);
  db.close();
});

check('an entry cannot be its own counterparty', () => {
  const db = seed();
  assert.throws(() => ledger.post(db, {
    companyId: 'vs', voucherType: 'sales', voucherDate: '2026-04-10',
    counterpartyCompanyId: 'vs',
    lines: [{ account: 'debtors', debit: 100 }, { account: 'sales', credit: 100 }],
  }), /own company as the counterparty/);
  db.close();
});

check('a channel belongs to a company — two companies may both call one AMZN', () => {
  const db = grid(2, 2);
  const codes = db.all('SELECT company_id, code FROM channels ORDER BY company_id, code');
  assert.strictEqual(codes.length, 4);
  assert.strictEqual(codes.filter((r) => r.code === 'CH01').length, 2, 'the same code under two companies');
  // …but not twice under one.
  assert.throws(() => db.insert('channels', {
    id: 'dup', company_id: CO(1), code: 'CH01', name: 'again',
    kind: 'marketplace', is_active: 1, created_at: '2026-04-01T00:00:00Z',
  }), /UNIQUE/);
  db.close();
});

// ===========================================================================
console.log('\n' + '='.repeat(70));
console.log(`${pass} passed, ${fail.length} failed`);
for (const f of fail) console.log(`  FAIL ${f}`);
process.exit(fail.length ? 1 : 0);
