'use strict';
/* Module 05 · Sales — drives the real job in each of the five apps and asserts the result,
   then captures HD screenshots for the PDF books. A control that looks alive but changes
   nothing fails the run. */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out'), SH = path.join(__dirname, 'shots');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
if (!fs.existsSync(SH)) fs.mkdirSync(SH, { recursive: true });

const BUILDS = [
  { app: 'd2c', file: 'd2c_ERP.html', tag: 'D2C_ERP' },
  { app: 'd2c', file: 'd2c_Vastrangam.html', tag: 'D2C_VAS' },
  { app: 'b2b', file: 'b2b_ERP.html', tag: 'B2B_ERP' },
  { app: 'b2b', file: 'b2b_Vastrangam.html', tag: 'B2B_VAS' },
  { app: 'export', file: 'export_ERP.html', tag: 'EXP_ERP' },
  { app: 'export', file: 'export_Vastrangam.html', tag: 'EXP_VAS' },
  { app: 'pos', file: 'pos_ERP.html', tag: 'POS_ERP' },
  { app: 'pos', file: 'pos_Vastrangam.html', tag: 'POS_VAS' },
  { app: 'quotes', file: 'quotes_ERP.html', tag: 'QT_ERP' },
  { app: 'quotes', file: 'quotes_Vastrangam.html', tag: 'QT_VAS' },
];

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let bad = 0, totalSteps = 0;
  for (const bd of BUILDS) {
    const page = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
    const errors = []; let steps = 0;
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    page.on('dialog', d => d.accept());
    await page.goto('file://' + path.join(OUT, bd.file), { waitUntil: 'load' });

    const shot = async (name) => {
      await page.waitForTimeout(150);
      if (!(await page.$('#main h1'))) { errors.push('blank screen at ' + name); return; }
      await page.screenshot({ path: path.join(SH, bd.tag + '_' + name + '.png'), fullPage: true });
    };
    const view = async (v) => { await page.click(`#nav a[data-v="${v}"]`); await page.waitForTimeout(130); };
    const ev = async (fn, a) => await page.evaluate(fn, a);
    const assert = (ok, msg) => { steps++; if (!ok) errors.push(msg); };

    if (bd.app === 'd2c') {
      await view('dash');   await shot('dash');
      await view('orders'); await shot('orders');
      // place an order
      const n0 = await ev(() => Medhava.DB.orders.length);
      await page.fill('#o_cust', 'Sanjana Rao');
      await page.selectOption('#o_item', { index: 1 });
      await page.fill('#o_qty', '2');
      await page.selectOption('#o_pay', 'prepaid');
      await page.selectOption('#o_cpn', { index: 1 });
      await page.click('[data-act="neworder"]'); await page.waitForTimeout(320);
      assert(await ev(() => Medhava.DB.orders.length) === n0 + 1, 'placing an order did not add one');
      await shot('orders_added');
      // the COD advance rule must refuse a pack
      const codIdx = await ev(() => Medhava.DB.orders.findIndex(o => o.pay === 'cod' && o.status === 'confirmed'));
      if (codIdx >= 0) {
        await ev(i => { Medhava.DB.orders[i].status = 'confirmed'; }, codIdx);
        await page.click(`#main [data-act="advance"][data-i="${codIdx}"]`); await page.waitForTimeout(300);
        assert(await ev(i => Medhava.DB.orders[i].status, codIdx) === 'confirmed',
          'the COD advance rule let an under-paid order be packed');
        await shot('orders_cod_refused');
      }
      await view('carts');  await shot('carts');
      const c0 = await ev(() => Medhava.DB.orders.length);
      await page.click('#main [data-act="recover"]'); await page.waitForTimeout(320);
      assert(await ev(() => Medhava.DB.orders.length) === c0 + 1, 'recovering a cart did not create an order');
      assert(await ev(() => Medhava.DB.carts.some(c => c.done === 'won')), 'the cart was not marked recovered');
      await shot('carts_recovered');
      await view('loyal');  await shot('loyal');
      const redeem = await page.$('#main [data-act="redeem"]');
      if (redeem) { const before = await ev(() => JSON.stringify(Medhava.DB.spent));
        await redeem.click(); await page.waitForTimeout(300);
        assert(await ev(() => JSON.stringify(Medhava.DB.spent)) !== before, 'redeeming points changed nothing');
        await shot('loyal_redeemed'); }
    }

    if (bd.app === 'b2b') {
      await view('dash');   await shot('dash');
      await view('orders'); await shot('orders');
      // an order that breaks the limit must go on hold, not be approved
      const held0 = await ev(() => Medhava.DB.orders.filter(o => o.status === 'onhold').length);
      await page.selectOption('#b_buyer', { index: 4 });
      await page.selectOption('#b_item', { index: 3 });
      await page.fill('#b_qty', '400');
      await page.click('[data-act="neworder"]'); await page.waitForTimeout(340);
      assert(await ev(() => Medhava.DB.orders.filter(o => o.status === 'onhold').length) === held0 + 1,
        'an over-limit order was not put on hold');
      await shot('orders_onhold');
      // a normal order goes through
      await page.selectOption('#b_buyer', { index: 0 });
      await page.selectOption('#b_item', { index: 2 });
      await page.fill('#b_qty', '20');
      await page.click('[data-act="neworder"]'); await page.waitForTimeout(320);
      assert(await ev(() => Medhava.DB.orders.filter(o => o.status === 'draft').length) > 0,
        'a within-limit order was refused');
      await view('credit'); await shot('credit');
      const lim0 = await ev(() => Medhava.DB.buyers[0].limit);
      await page.selectOption('#c_buyer', { index: 0 });
      await page.fill('#c_limit', String(lim0 + 250000));
      await page.click('[data-act="setlimit"]'); await page.waitForTimeout(300);
      assert(await ev(() => Medhava.DB.buyers[0].limit) === lim0 + 250000, 'the limit did not change');
      await shot('credit_raised');
      await view('ageing'); await shot('ageing');
    }

    if (bd.app === 'export') {
      await view('dash');   await shot('dash');
      // one exchange rate moves every rupee figure
      await page.fill('#x_fx', '90');
      await page.click('[data-act="setfx"]'); await page.waitForTimeout(320);
      assert(await ev(() => Medhava.DB.fx) === 90, 'the exchange rate did not change');
      await shot('dash_fx');
      await page.fill('#x_fx', '83.5'); await page.click('[data-act="setfx"]'); await page.waitForTimeout(250);
      await view('orders'); await shot('orders');
      // a shipment with a missing paper must not be allowed to sail
      const dIdx = await ev(() => Medhava.DB.orders.findIndex(o => o.status === 'docs'));
      if (dIdx >= 0) {
        await page.click(`#main [data-act="advance"][data-i="${dIdx}"]`); await page.waitForTimeout(300);
        assert(await ev(i => Medhava.DB.orders[i].status, dIdx) === 'docs',
          'a shipment sailed with missing papers');
        await shot('orders_blocked');
      }
      await view('docs');   await shot('docs');
      // tick the missing papers, then it may sail
      for (let k = 0; k < 5; k++) {
        const btns = await page.$$(`#main [data-act="toggledoc"][data-i="${dIdx}"]`);
        for (const btn of btns) {
          const txt = await btn.innerText();
          if (!txt.startsWith('✓')) { await btn.click(); await page.waitForTimeout(120); break; }
        }
      }
      assert(await ev(i => Object.values(Medhava.DB.orders[i].docs).filter(Boolean).length, dIdx) === 5,
        'ticking the documents did not complete the set');
      await shot('docs_complete');
      await view('orders');
      await page.click(`#main [data-act="advance"][data-i="${dIdx}"]`); await page.waitForTimeout(300);
      assert(await ev(i => Medhava.DB.orders[i].status, dIdx) === 'shipped',
        'a complete shipment was still blocked');
      await view('tax');    await shot('tax');
      const r = await page.$('#main [data-act="refund"]');
      if (r) { await r.click(); await page.waitForTimeout(300);
        assert(await ev(() => Medhava.DB.orders.some(o => o.refunded)), 'the refund was not recorded');
        await shot('tax_refunded'); }
    }

    if (bd.app === 'pos') {
      await view('till');   await shot('till');
      // build a cart
      await page.click('#main [data-act="add"]'); await page.waitForTimeout(200);
      await page.click('#main [data-act="add"]'); await page.waitForTimeout(200);
      assert(await ev(() => Medhava.DB.cart.length) > 0, 'nothing went into the cart');
      await shot('till_cart');
      // billing must be refused while money is short
      await page.fill('#p_disc', '10'); await page.fill('#p_cash', '100');
      await page.click('[data-act="settender"]'); await page.waitForTimeout(250);
      const bills0 = await ev(() => Medhava.DB.bills.length);
      await page.click('[data-act="bill"]'); await page.waitForTimeout(300);
      assert(await ev(() => Medhava.DB.bills.length) === bills0, 'a bill printed before it was paid for');
      await shot('till_short');
      // pay it properly and print
      const due = await ev(() => { const DB = Medhava.DB; return 99999999; });
      await page.fill('#p_cash', '99999'); await page.click('[data-act="settender"]'); await page.waitForTimeout(250);
      await page.click('[data-act="bill"]'); await page.waitForTimeout(350);
      assert(await ev(() => Medhava.DB.bills.length) === bills0 + 1, 'the bill did not print when fully paid');
      assert(await ev(() => Medhava.DB.cart.length) === 0, 'the cart was not cleared after billing');
      await shot('till_billed');
      await view('day');    await shot('day');
      await view('close');
      const exp = await ev(() => { const DB = Medhava.DB; return null; });
      await page.fill('#z_cash', '1');
      await page.click('[data-act="closeday"]'); await page.waitForTimeout(320);
      assert(await ev(() => Medhava.DB.closed === true), 'the day did not close');
      await shot('close_short');
      await page.click('[data-act="reopen"]'); await page.waitForTimeout(250);
      await view('stock');  await shot('stock');
    }

    if (bd.app === 'quotes') {
      await view('dash');   await shot('dash');
      await view('list');   await shot('list');
      const q0 = await ev(() => Medhava.DB.quotes.length);
      await page.fill('#q_cust', 'Bandhej House (Jodhpur)');
      await page.selectOption('#q_item', { index: 1 });
      await page.fill('#q_qty', '40'); await page.fill('#q_disc', '6');
      await page.selectOption('#q_val', '15');
      await page.click('[data-act="newquote"]'); await page.waitForTimeout(320);
      assert(await ev(() => Medhava.DB.quotes.length) === q0 + 1, 'the quote was not raised');
      await shot('list_added');
      // an expired quote must not be advanceable
      const eIdx = await ev(() => {
        const days = (f, t) => Math.round((new Date(t) - new Date(f)) / 86400000);
        return Medhava.DB.quotes.findIndex(q => {
          const exp = new Date(q.date); exp.setDate(exp.getDate() + q.validity);
          return days('2026-07-31', exp.toISOString().slice(0, 10)) < 0 && q.status === 'sent';
        });
      });
      if (eIdx >= 0) {
        const was = await ev(i => Medhava.DB.quotes[i].status, eIdx);
        await page.click(`#main [data-act="advance"][data-i="${eIdx}"]`).catch(() => {});
        await page.waitForTimeout(300);
        assert(await ev(i => Medhava.DB.quotes[i].status, eIdx) === was,
          'an expired quote was advanced');
        // re-quote it instead
        const before = await ev(() => Medhava.DB.quotes.length);
        await page.click(`#main [data-act="requote"][data-i="${eIdx}"]`); await page.waitForTimeout(320);
        assert(await ev(() => Medhava.DB.quotes.length) === before + 1, 're-quoting created nothing');
        await shot('list_requoted');
      }
      // open a quote that is still open, so the revise form is actually there
      await ev(() => { const q = Medhava.DB.quotes.filter(x => x.status === 'draft' || x.status === 'sent')[0];
        if (q) { Medhava.DB.sel = q.id; } });
      await view('one'); await page.waitForTimeout(250);
      await shot('one');
      const rv = await page.$('[data-act="revise"]');
      if (rv) {
        const n = await ev(() => Medhava.DB.quotes.filter(q => q.id === Medhava.DB.sel)[0].revs.length);
        await page.fill('#r_qty', '45'); await page.fill('#r_disc', '14');
        await rv.click(); await page.waitForTimeout(320);
        assert(await ev(() => Medhava.DB.quotes.filter(q => q.id === Medhava.DB.sel)[0].revs.length) === n + 1,
          'the revision was not saved');
        await shot('one_revised');
      }
    }

    await view('wiring');  await shot('wiring');
    await view('connect'); await shot('connect');
    await view('backup'); await page.waitForTimeout(2200); await shot('backup');

    const st = await page.evaluate(() => window.__selftest);
    const ok = st && st.fail === 0 && errors.length === 0;
    if (!ok) bad++;
    totalSteps += steps;
    console.log(`${ok ? 'OK ' : 'XX '} ${bd.file.padEnd(24)} tests ${st.pass}/${st.pass + st.fail}  asserted ${steps} step${steps === 1 ? '' : 's'}  errs ${errors.length}${errors.length ? ' :: ' + errors.join(' | ').slice(0, 220) : ''}`);
    await page.close();
  }
  await b.close();
  console.log(`\n${BUILDS.length} builds · ${totalSteps} workflow assertions · ${bad} with problems`);
  process.exit(bad ? 1 : 0);
})();
