'use strict';
/* MODULE 05 · SALES — the rules, asked of a running database.
 *
 *   node medhava/test/sales.test.js
 *
 * brand/site/rules.js carries 18 rules for Sales. Six of them are enforced by medhava/server/
 * sales.js and each has a check here; the other twelve are SPECIFIED and deliberately have no
 * check, because a test for an unbuilt rule is a test that passes for the wrong reason.
 *
 * S7 IS THE ONE THAT MATTERS. Rule R05.3 — "if the ledger refuses, the stock never moved" — is
 * the only rule in this module whose breach is completely invisible. Every other failure shows up
 * as a wrong number somebody eventually queries. A half-posted sale shows up as nothing at all:
 * the order is right, the customer has the goods, and the stock figure is short by one piece with
 * no record anywhere to reconcile it against. It is found at a physical count months later.
 *
 * RED BEFORE GREEN — each check below was proven by planting its failure and watching it catch it,
 * and what was planted is recorded on each one.
 */

const assert = require('node:assert');

const db = require('../server/db.js');
const { seed, IDS } = require('../seed/demo.js');
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

const count = async (table, where = '') =>
  Number((await db.godView(`SELECT count(*)::int c FROM ${table} ${where}`))[0].c);

async function itemsOf(scope) {
  const r = await db.withContext(scope, (q) =>
    q('SELECT id, sku, gst_rate, cost_paise FROM items ORDER BY sku'));
  return r.rows;
}

async function main() {
  await db.open();
  await seed();
  const mine = await itemsOf(A1);

  /* ── S1 · a sale writes all five things, or it is not a sale ──
     R05.2. Counted before and after, because "it returned an order number" is not evidence that
     an invoice or a ledger entry exists.
     RED: removed the stock_movements insert from postSale → "stock_movements did not change". */
  await test('S1  R05.2 · one sale writes order, lines, invoice, stock and ledger together',
    async () => {
      const before = {
        orders: await count('sales_orders'), lines: await count('sales_order_items'),
        invoices: await count('invoices'), moves: await count('stock_movements'),
        entries: await count('journal_entries'), jlines: await count('journal_lines'),
      };
      const out = await sales.postSale(A1, {
        channelCode: 'D2C', orderType: 'b2c',
        lines: [{ itemId: mine[0].id, qty: 2, ratePaise: 4_49_900 }],
      });
      assert.ok(out.orderNumber && out.invoiceNumber, 'no document numbers came back');
      const after = {
        orders: await count('sales_orders'), lines: await count('sales_order_items'),
        invoices: await count('invoices'), moves: await count('stock_movements'),
        entries: await count('journal_entries'), jlines: await count('journal_lines'),
      };
      for (const [what, n] of [['orders', 1], ['lines', 1], ['invoices', 1], ['moves', 1],
                               ['entries', 2], ['jlines', 5]]) {
        assert.strictEqual(after[what] - before[what], n,
          `${what} changed by ${after[what] - before[what]}, expected ${n}. A sale that writes ` +
          `some of these and not the others is the failure R05.2 exists to prevent.`);
      }
    });

  /* ── S2 · the money is right, and it is integer paise all the way ──
     THE THIRD LINE IS THE WHOLE CHECK, AND THE FIRST VERSION DID NOT HAVE IT.
     With ₹4,499 and ₹2,199 at 12%, the tax lands on an EVEN number of paise — so splitting it as
     a remainder and splitting it as two independent 6% roundings give the identical answer, and
     the check passed against both. Planting the broken split proved nothing; it was caught by
     nothing, which is how a decorative check is found.
     ₹1,000.25 at 12% is 12,003 paise — odd. The remainder split gives 6,001 + 6,002 = 12,003.
     Two independent roundings give 6,002 + 6,002 = 12,004, and invent a paisa of tax that was
     never charged. That is the paisa that makes a GSTR-1 not tie.
     RED: two independent 6% roundings → "CGST + SGST + IGST is 12004 against tax 12003". */
  await test('S2  the arithmetic ties, and the tax halves sum to the whole — including odd paise',
    async () => {
    const ODD = 1_00_025;                    // 12% of this is odd; see above
    const out = await sales.postSale(A1, {
      channelCode: 'D2C', orderType: 'b2c',
      lines: [{ itemId: mine[0].id, qty: 2, ratePaise: 4_49_900 },
              { itemId: mine[2].id, qty: 1, ratePaise: 2_19_900 },
              { itemId: mine[0].id, qty: 1, ratePaise: ODD }],
    });
    assert.strictEqual(out.subtotalPaise, 2 * 4_49_900 + 2_19_900 + ODD);
    assert.strictEqual(out.totalPaise, out.subtotalPaise + out.taxPaise);

    /* THE TAX IS CHECKED AGAINST AN INDEPENDENT RECOMPUTATION, NOT AGAINST ITS OWN PARTS.
       The first version asserted cgst + sgst + igst === taxPaise. That can never fail: sales.js
       BUILDS taxPaise by adding those three up, so the assertion restated its own arithmetic.
       Planting the broken split proved it — both halves became 6,002, the total became 12,004,
       and the check happily agreed with itself. A tautology reads exactly like a test.
       The honest question is whether the tax equals what the rate says it should be. */
    const expected = out.lines.reduce(
      (n, l) => n + Math.round((l.taxablePaise * l.gstRate) / 100), 0);
    assert.strictEqual(out.taxPaise, expected,
      `the invoice charges ${out.taxPaise} paise of tax; the rates on its own lines come to ` +
      `${expected}. A paisa invented or lost here is a paisa that makes a GST return not tie.`);
    assert.strictEqual(out.cgstPaise + out.sgstPaise + out.igstPaise, out.taxPaise,
      `the split does not add up to the tax it split`);
    for (const [k, v] of Object.entries(out)) {
      if (/Paise$/.test(k)) {
        assert.ok(Number.isInteger(v), `${k} is ${v}, which is not a whole number of paise`);
      }
    }
    /* And the same figures survived the round trip into the database, rather than only existing
       in the object this function returned. */
    const [inv] = (await db.withContext(A1, (q) => q(
      `SELECT taxable_paise, cgst_paise, sgst_paise, igst_paise, total_paise
         FROM invoices WHERE invoice_number = $1`, [out.invoiceNumber]))).rows;
    assert.strictEqual(Number(inv.taxable_paise), out.subtotalPaise);
    assert.strictEqual(Number(inv.total_paise), out.totalPaise);
  });

  /* ── S3 · the ledger balances ──
     RED: dropped the GST credit line from the sales entry → "the ledger does not balance:
     1254064 debit against 1119700 credit", refused inside the transaction, nothing saved. */
  await test('S3  every journal entry the sale posts balances to the paisa', async () => {
    const out = await sales.postSale(A1, {
      channelCode: 'AMZN', orderType: 'b2c',
      lines: [{ itemId: mine[1].id, qty: 1, ratePaise: 12_99_900 }],
    });
    const rows = (await db.withContext(A1, (q) => q(
      `SELECT e.id, e.voucher_type,
              coalesce(sum(l.debit_paise),0)::bigint d, coalesce(sum(l.credit_paise),0)::bigint c
         FROM journal_entries e JOIN journal_lines l ON l.entry_id = e.id
        WHERE e.reference = $1 GROUP BY e.id, e.voucher_type`, [out.orderNumber]))).rows;
    assert.strictEqual(rows.length, 2,
      `the sale posted ${rows.length} entries; the sale itself and its cost were expected`);
    for (const r of rows) {
      assert.strictEqual(String(r.d), String(r.c),
        `${r.voucher_type} has ${r.d} debit against ${r.c} credit`);
    }
    /* The cost entry is not decoration: without it every sale shows as pure profit. */
    assert.ok(rows.some((r) => r.voucher_type === 'journal' && Number(r.d) === out.costPaise),
      `no cost entry for ${out.costPaise} — the goods left inventory and nothing recorded it`);
  });

  /* ── S4 · R05.1 · the channel is required and must be this company's ──
     RED: removed the `if (!ch.rows.length) throw` after the lookup → channelId was undefined, the
     insert died on a NOT NULL constraint, and this failed because the error was a database
     message rather than a named rule.

     WHAT A FAILED PLANT TAUGHT HERE: deleting the `if (!code)` guard at the top of postSale
     changed nothing — an empty code simply finds no channel and the lookup refuses it with the
     same rule. That guard is belt-and-braces and only improves the message. The line that
     actually enforces R05.1 is the scoped lookup, and it is the row-level policy that makes
     another company's channel unfindable rather than any comparison this code performs. */
  await test('S4  R05.1 · a sale on no channel, or another company\'s channel, is refused',
    async () => {
      await assert.rejects(
        () => sales.postSale(A1, { orderType: 'b2c',
          lines: [{ itemId: mine[0].id, qty: 1, ratePaise: 100 }] }),
        (e) => e instanceof sales.SaleRefused && e.rule === 'R05.1',
        'a sale with no channel was accepted');
      /* POS belongs to Anjali Western. Asked for by Anjali Ethnic it must not resolve — and the
         reason it does not is the row-level policy, not a comparison this code performs. */
      await assert.rejects(
        () => sales.postSale(A1, { channelCode: 'POS', orderType: 'pos',
          lines: [{ itemId: mine[0].id, qty: 1, ratePaise: 100 }] }),
        (e) => e instanceof sales.SaleRefused && e.rule === 'R05.1',
        'a company sold on another company\'s channel');
    });

  /* ── S5 · R05.15 · a half-filled row is not a line ──
     RED: changed readLines to skip unusable rows instead of refusing → the sale posted with the
     bad line silently dropped, and this failed because no rejection came. */
  await test('S5  R05.15 · no item, zero quantity or a negative rate is refused, not skipped',
    async () => {
      const bad = [
        [{ qty: 1, ratePaise: 100 }, 'no item'],
        [{ itemId: mine[0].id, qty: 0, ratePaise: 100 }, 'zero quantity'],
        [{ itemId: mine[0].id, qty: 1.5, ratePaise: 100 }, 'a fractional quantity'],
        [{ itemId: mine[0].id, qty: 1, ratePaise: -100 }, 'a negative rate'],
      ];
      for (const [line, what] of bad) {
        await assert.rejects(
          () => sales.postSale(A1, { channelCode: 'D2C', orderType: 'b2c', lines: [line] }),
          (e) => e instanceof sales.SaleRefused && e.rule === 'R05.15',
          `a line with ${what} was accepted`);
      }
      await assert.rejects(
        () => sales.postSale(A1, { channelCode: 'D2C', orderType: 'b2c', lines: [] }),
        (e) => e instanceof sales.SaleRefused, 'a sale with no lines at all was accepted');
    });

  /* ── S6 · R05.16 · an export under LUT carries no GST ──
     RED: made the export flag apply per line from the item's own rate → the domestic 12% came
     through on the export invoice and this failed on "tax 155988 on an export". */
  await test('S6  R05.16 · an export under LUT carries no GST, and says so on the invoice',
    async () => {
      const out = await sales.postSale(A1, {
        channelCode: 'D2C', orderType: 'export', customerState: '99',
        lines: [{ itemId: mine[1].id, qty: 1, ratePaise: 12_99_900 }],
      });
      assert.strictEqual(out.taxPaise, 0,
        `tax ${out.taxPaise} on an export under LUT. The buyer queries the total and the rate is ` +
        `corrected afterwards, which is exactly what R05.16 forbids.`);
      assert.strictEqual(out.totalPaise, out.subtotalPaise);
      assert.ok(out.exportUnderLut, 'the result does not record that this was under LUT');
      const [inv] = (await db.withContext(A1, (q) => q(
        `SELECT is_export, export_type FROM invoices WHERE invoice_number = $1`,
        [out.invoiceNumber]))).rows;
      assert.strictEqual(inv.is_export, true, 'the invoice does not know it is an export');
      assert.strictEqual(inv.export_type, 'with_lut',
        'the invoice does not record WHY there is no GST on it');
      /* A domestic sale of the same item must still be taxed — otherwise this check would pass
         against a system that had simply stopped charging GST altogether. */
      const home = await sales.postSale(A1, {
        channelCode: 'D2C', orderType: 'b2c',
        lines: [{ itemId: mine[1].id, qty: 1, ratePaise: 12_99_900 }],
      });
      assert.ok(home.taxPaise > 0, 'the domestic control also came out untaxed');
    });

  /* ══ S7 · R05.3 · IF THE LEDGER REFUSES, THE STOCK NEVER MOVED ══════════════
     The rule whose breach is invisible. The failure is forced at the LAST write — the journal
     lines — so that by the time it happens the order, the invoice and the stock movement have all
     already been written. Anything short of a real transaction leaves them there.
     RED: this is the check that made db.withTransaction necessary. Run against the pre-transaction
     version of postSale it failed with 1 order, 1 invoice and 1 stock movement left behind and no
     ledger entry to explain any of them. */
  await test('S7  R05.3 · when the ledger refuses, the order, invoice and stock are all rolled back',
    async () => {
      const before = {
        orders: await count('sales_orders'), invoices: await count('invoices'),
        moves: await count('stock_movements'), entries: await count('journal_entries'),
        lines: await count('sales_order_items'),
      };

      /* Break the ledger at the last possible moment, in the database rather than in the code: a
         constraint that rejects the journal line the sale is about to write. Poisoning the schema
         rather than stubbing a function means the rollback is proven against the real write path,
         with nothing about postSale changed. */
      /* NOT VALID, and it matters: the checks above have already written perfectly good journal
         lines, so a plain ADD CONSTRAINT is rejected by the ROWS THAT ARE ALREADY THERE and the
         poison never attaches. NOT VALID skips the back-check and still enforces every new insert
         — which is precisely the failure this check needs and nothing more. */
      await db.asOwner((d) => d.exec(
        `ALTER TABLE journal_lines
           ADD CONSTRAINT s7_forced_failure CHECK (debit_paise < 0) NOT VALID`));

      let refused = null;
      try {
        await sales.postSale(A1, {
          channelCode: 'D2C', orderType: 'b2c',
          lines: [{ itemId: mine[0].id, qty: 3, ratePaise: 4_49_900 }],
        });
      } catch (e) { refused = e.message; }
      finally {
        await db.asOwner((d) => d.exec(
          `ALTER TABLE journal_lines DROP CONSTRAINT s7_forced_failure`));
      }

      assert.ok(refused, 'the sale reported success while the ledger was refusing every line');

      const after = {
        orders: await count('sales_orders'), invoices: await count('invoices'),
        moves: await count('stock_movements'), entries: await count('journal_entries'),
        lines: await count('sales_order_items'),
      };
      for (const what of Object.keys(before)) {
        assert.strictEqual(after[what], before[what],
          `${what} went from ${before[what]} to ${after[what]}. The ledger refused and this was ` +
          `left behind. Nothing about the running system looks wrong: the goods are gone, the ` +
          `books are untouched, and the shortage is found at a physical count months from now ` +
          `with no record to reconcile it against.`);
      }
    });

  /* ── S8 · a sale is scoped like everything else ──
     A write route is a new way to cross a company boundary, and the read tests do not cover it.
     RED: passed the request's own companyId into postSale instead of the session's → the sale
     landed in the other company and this failed on the count. */
  await test('S8  a sale posted by one company is invisible to the other', async () => {
    const theirs = await itemsOf(A2);
    const out = await sales.postSale(A2, {
      channelCode: 'POS', orderType: 'pos',
      lines: [{ itemId: theirs[0].id, qty: 1, ratePaise: 3_29_900 }],
    });
    const seenByOwner = await db.withContext(A2, (q) =>
      q('SELECT 1 FROM sales_orders WHERE order_number = $1', [out.orderNumber]));
    assert.strictEqual(seenByOwner.rows.length, 1, 'the company that made the sale cannot see it');
    const seenByOther = await db.withContext(A1, (q) =>
      q('SELECT 1 FROM sales_orders WHERE order_number = $1', [out.orderNumber]));
    assert.strictEqual(seenByOther.rows.length, 0,
      `the sister company can read ${out.orderNumber}. Two companies under one owner are still ` +
      `two sets of books.`);
    /* The invoice and the ledger entry too — scoping the order and leaking the invoice would be
       a leak of exactly the same information. */
    for (const [table, col] of [['invoices', 'invoice_number'], ['journal_entries', 'reference']]) {
      const leak = await db.withContext(A1, (q) =>
        q(`SELECT 1 FROM ${table} WHERE ${col} = $1`,
          [table === 'invoices' ? out.invoiceNumber : out.orderNumber]));
      assert.strictEqual(leak.rows.length, 0, `${table} leaked across the company boundary`);
    }
  });

  /* ── S9 · R05.13 · a sale to a sister company is marked as one ──
     RED: dropped counterparty_company_id from the insert → the entry posted as an ordinary
     outside sale and this failed on "the entry does not name the sister company". */
  await test('S9  R05.13 · a sale to a sister company records the counterparty', async () => {
    const out = await sales.postSale(A1, {
      channelCode: 'D2C', orderType: 'b2b', counterpartyCompanyId: IDS.coA2,
      lines: [{ itemId: mine[2].id, qty: 4, ratePaise: 2_19_900 }],
    });
    const [e] = (await db.withContext(A1, (q) => q(
      `SELECT counterparty_company_id FROM journal_entries
        WHERE reference = $1 AND voucher_type = 'sales_invoice'`, [out.orderNumber]))).rows;
    assert.strictEqual(e.counterparty_company_id, IDS.coA2,
      'the entry does not name the sister company, so this trade counts in the group turnover ' +
      'as though it happened with an outside customer');

    /* And the schema refuses a company as its own counterparty, whatever this code asks for. */
    await assert.rejects(
      () => sales.postSale(A1, {
        channelCode: 'D2C', orderType: 'b2b', counterpartyCompanyId: IDS.coA1,
        lines: [{ itemId: mine[0].id, qty: 1, ratePaise: 100 }],
      }),
      /violates check constraint|check constraint/i,
      'a company recorded a sale to itself');
  });

  /* ── S10 · document numbers are sequential within the company ──
     RED: counted through db.godView instead of the scoped `q` → both companies' documents fed one
     sequence and this failed with "invoice numbers went 1, 3, 5".

     AND WHAT THE FIRST PLANT SHOWED: dropping the `LIKE` from the count changed nothing, because
     the count already runs inside withTransaction and the row-level policy has scoped it to this
     company before the WHERE clause is even considered. Worth stating plainly — the per-company
     numbering is a property of the ISOLATION, not of the LIKE clause. The LIKE separates the
     financial years, which is a different job and not what this check is about. */
  await test('S10 invoice numbers run in their own company\'s sequence', async () => {
    const seq = [];
    for (let i = 0; i < 3; i++) {
      const out = await sales.postSale(A1, {
        channelCode: 'D2C', orderType: 'b2c',
        lines: [{ itemId: mine[0].id, qty: 1, ratePaise: 1_00_000 }],
      });
      seq.push(Number(out.invoiceNumber.split('/').pop()));
      /* A sale in the OTHER company between each one. If the sequence were global these would
         interleave and leave gaps. */
      const theirs = await itemsOf(A2);
      await sales.postSale(A2, { channelCode: 'AMZN', orderType: 'b2c',
        lines: [{ itemId: theirs[0].id, qty: 1, ratePaise: 1_00_000 }] });
    }
    for (let i = 1; i < seq.length; i++) {
      assert.strictEqual(seq[i], seq[i - 1] + 1,
        `invoice numbers went ${seq.join(', ')} — a gap means another company's sales are ` +
        `consuming this company's sequence, and the register cannot be reconciled.`);
    }
  });

  console.log('');
  results.forEach(([mark, name]) => console.log(`  ${mark}  ${name}`));
  console.log('');
  console.log('  ' + '='.repeat(68));
  console.log(`  ${pass} passed, ${fail} failed`);
  if (!fail) {
    console.log('  Module 05 · Sales — 6 of its 18 rules enforced and checked here.');
    console.log('  The other 12 are SPECIFIED and have no check, deliberately.');
  }
  console.log('');

  await db.close();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('\nthe suite itself failed:', e); process.exit(1); });
