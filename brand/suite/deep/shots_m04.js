'use strict';
/* Module 04 · E-commerce / OMS — drives the real job in both apps and asserts the RESULT of every
   click, then captures HD screenshots for the PDF books. A control that looks alive but changes
   nothing fails the run. */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out'), SH = path.join(__dirname, 'shots');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
if (!fs.existsSync(SH)) fs.mkdirSync(SH, { recursive: true });

const BUILDS = [
  { app: 'oms', file: 'oms_ERP.html', tag: 'OMS_ERP', paritySku: 'FG-102' },
  { app: 'oms', file: 'oms_Vastrangam.html', tag: 'OMS_VAS', paritySku: 'VS-SAR-02' },
  { app: 'ordman', file: 'ordman_ERP.html', tag: 'ORD_ERP', teachId: 'OM-7120', teachSku: 'FG-102', chan: 'CH-MKT' },
  { app: 'ordman', file: 'ordman_Vastrangam.html', tag: 'ORD_VAS', teachId: 'VS-O-7120', teachSku: 'VS-SAR-02', chan: 'CH-MKT' },
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
    // the text of the table row an order appears in — how a derived date is checked from outside
    const rowOf = async (id) => await page.evaluate(oid => {
      const tr = [...document.querySelectorAll('#main tbody tr')].find(r => r.textContent.includes(oid));
      return tr ? tr.textContent.replace(/\s+/g, ' ').trim() : '';
    }, id);

    if (bd.app === 'oms') {
      await view('dash');  await shot('dash');
      await view('queue'); await shot('queue');
      // the top of the queue is the most urgent order, and advancing it moves exactly one stage
      const top = await ev(() => {
        const b = document.querySelector('#main [data-act="advance"]');
        return b ? Number(b.getAttribute('data-i')) : -1;
      });
      assert(top >= 0, 'the dispatch queue had nothing to advance');
      if (top >= 0) {
        const was = await ev(i => Medhava.DB.orders[i].status, top);
        await page.click(`#main [data-act="advance"][data-i="${top}"]`); await page.waitForTimeout(320);
        const now = await ev(i => Medhava.DB.orders[i].status, top);
        assert(now !== was, 'advancing the top of the queue changed nothing');
        assert(['accepted', 'packed', 'dispatched'].indexOf(now) >= 0, 'the order jumped to a stage it should not reach');
        await shot('queue_advanced');
      }
      // cancelling a marketplace order must give the stock back
      const cIdx = await ev(() => {
        const b = document.querySelector('#main [data-act="cancel"]');
        return b ? Number(b.getAttribute('data-i')) : -1;
      });
      if (cIdx >= 0) {
        const before = await ev(i => { const o = Medhava.DB.orders[i]; return { sku: o.sku, qty: o.qty, stock: Medhava.DB.stock[o.sku] }; }, cIdx);
        await page.click(`#main [data-act="cancel"][data-i="${cIdx}"]`); await page.waitForTimeout(320);
        assert(await ev(i => Medhava.DB.orders[i].status, cIdx) === 'cancelled', 'the order was not cancelled');
        assert(await ev(s => Medhava.DB.stock[s], before.sku) === before.stock + before.qty,
          'cancelling did not give the stock back');
        await shot('queue_cancelled');
      }
      await view('markets'); await shot('markets');
      await view('listings'); await shot('listings');
      // levelling a broken price must put every panel on the list price
      const spread0 = await ev(s => {
        const p = (Medhava.DB.prices || {})[s] || {};
        return Object.keys(p).length;
      }, bd.paritySku);
      assert(spread0 > 0, 'the demonstration data has no price left out of line');
      await page.click(`#main [data-act="levelup"][data-s="${bd.paritySku}"]`); await page.waitForTimeout(340);
      const levelled = await ev(s => {
        const p = (Medhava.DB.prices || {})[s] || {};
        const vals = Object.keys(p).map(k => p[k]);
        return vals.length > 1 && vals.every(v => v === vals[0]);
      }, bd.paritySku);
      assert(levelled, 'levelling the price did not put every panel on one number');
      await shot('listings_levelled');
      // a delivered order coming back is recorded against the marketplace it came from
      const rIdx = await ev(() => {
        const b = document.querySelector('#main [data-act="ret"]');
        return b ? Number(b.getAttribute('data-i')) : -1;
      });
      await view('queue');
      const rBtn = await page.$('#main [data-act="ret"]');
      if (rBtn) {
        const i = Number(await rBtn.getAttribute('data-i'));
        const before = await ev(k => { const o = Medhava.DB.orders[k]; return { sku: o.sku, qty: o.qty, stock: Medhava.DB.stock[o.sku] }; }, i);
        await rBtn.click(); await page.waitForTimeout(320);
        assert(await ev(k => Medhava.DB.orders[k].status, i) === 'returned', 'the return was not recorded');
        assert(await ev(s => Medhava.DB.stock[s], before.sku) === before.stock + before.qty,
          'a returned piece did not come back into stock');
        await shot('queue_returned');
      }
    }

    if (bd.app === 'ordman') {
      await view('dash'); await shot('dash');
      await view('book'); await shot('book');
      // the channel filter must actually filter
      const all = await ev(() => document.querySelectorAll('#main tbody tr').length);
      await page.selectOption('#f_ch', bd.chan);
      await page.click('[data-act="setch"]'); await page.waitForTimeout(320);
      assert(await ev(() => Medhava.DB.fch) === bd.chan, 'the channel filter was not remembered');
      const some = await ev(() => document.querySelectorAll('#main tbody tr').length);
      assert(some < all, 'filtering to one channel showed just as many rows');
      await shot('book_filtered');
      await page.selectOption('#f_ch', ''); await page.click('[data-act="setch"]'); await page.waitForTimeout(250);

      // GATE 1 — an order nothing can serve must refuse to be allocated.
      // The Allocate button lives on the order book; the allocation desk shows WHY it cannot move.
      const backIdx = await ev(() => {
        const DB = Medhava.DB;
        return DB.orders.findIndex(o => o.status === 'new' && !o.loc &&
          Object.keys(DB.stockAt[o.sku] || {}).every(l => DB.stockAt[o.sku][l] < o.qty));
      });
      assert(backIdx >= 0, 'the demonstration data has no backorder to refuse');
      if (backIdx >= 0) {
        await page.click(`#main [data-act="allocbest"][data-i="${backIdx}"]`); await page.waitForTimeout(300);
        assert(await ev(i => Medhava.DB.orders[i].status, backIdx) === 'new',
          'an order no warehouse can serve was allocated anyway');
        assert(await ev(i => Medhava.DB.orders[i].loc, backIdx) === '',
          'a backorder was given a warehouse');
      }
      await view('alloc'); await shot('alloc');
      // GATE 3 — moving stock changes the date the customer is promised
      await view('book');
      const before = await rowOf(bd.teachId);
      assert(!!before, 'the teaching order is missing from the order book');
      await view('alloc');
      const stock0 = await ev(s => JSON.parse(JSON.stringify(Medhava.DB.stockAt[s])), bd.teachSku);
      await page.selectOption('#t_sku', bd.teachSku);
      await page.selectOption('#t_from', 'W2');
      await page.selectOption('#t_to', 'W3');
      await page.fill('#t_qty', '1');
      await page.click('[data-act="transfer"]'); await page.waitForTimeout(340);
      const stock1 = await ev(s => JSON.parse(JSON.stringify(Medhava.DB.stockAt[s])), bd.teachSku);
      assert(stock1.W2 === stock0.W2 - 1 && stock1.W3 === stock0.W3 + 1, 'the stock did not move between warehouses');
      assert(stock1.W1 + stock1.W2 + stock1.W3 === stock0.W1 + stock0.W2 + stock0.W3,
        'moving stock changed the total, which it must never do');
      await shot('alloc_moved');
      await view('book');
      const after = await rowOf(bd.teachId);
      assert(after !== before, 'moving the stock did not change the promise on the order');
      await shot('book_repromised');
      // moving it back, so the book screenshots stay comparable
      await view('alloc');
      await page.selectOption('#t_sku', bd.teachSku);
      await page.selectOption('#t_from', 'W3'); await page.selectOption('#t_to', 'W2');
      await page.fill('#t_qty', '1');
      await page.click('[data-act="transfer"]'); await page.waitForTimeout(300);
      // allocating for real takes the stock off that shelf
      const okIdx = await ev(() => {
        const DB = Medhava.DB;
        return DB.orders.findIndex(o => o.status === 'new' &&
          Object.keys(DB.stockAt[o.sku] || {}).some(l => DB.stockAt[o.sku][l] >= o.qty));
      });
      if (okIdx >= 0) {
        const s0 = await ev(i => { const o = Medhava.DB.orders[i]; return { sku: o.sku, qty: o.qty, at: JSON.parse(JSON.stringify(Medhava.DB.stockAt[o.sku])) }; }, okIdx);
        await page.click(`#main [data-act="allocbest"][data-i="${okIdx}"]`); await page.waitForTimeout(340);
        const o1 = await ev(i => { const o = Medhava.DB.orders[i]; return { status: o.status, loc: o.loc, at: JSON.parse(JSON.stringify(Medhava.DB.stockAt[o.sku])) }; }, okIdx);
        assert(o1.status === 'allocated' && !!o1.loc, 'the order was not allocated');
        assert(o1.at[o1.loc] === s0.at[o1.loc] - s0.qty, 'allocating did not take the stock off that shelf');
        assert(Object.keys(s0.at).filter(l => l !== o1.loc).every(l => o1.at[l] === s0.at[l]),
          'allocating touched a warehouse it had nothing to do with');
        await shot('alloc_allocated');
      }
      await view('promise'); await shot('promise');

      await view('returns'); await shot('returns');
      // GATE 2 — no money out before the parcel is back
      const notBack = await ev(() => Medhava.DB.orders.findIndex(o => (o.status === 'returned' || o.status === 'rto') && !o.recv));
      assert(notBack >= 0, 'the demonstration data has no parcel still coming back');
      if (notBack >= 0) {
        await page.click(`#main [data-act="payref"][data-i="${notBack}"]`); await page.waitForTimeout(300);
        assert(await ev(i => Number(Medhava.DB.orders[i].refund), notBack) === 0,
          'a refund was paid on a parcel that had not come back');
        await shot('returns_refused');
        // book it in — still no money, because nobody has looked at it
        await page.click(`#main [data-act="receive"][data-i="${notBack}"]`); await page.waitForTimeout(300);
        assert(await ev(i => Medhava.DB.orders[i].recv, notBack) === true, 'the parcel was not booked in');
        await page.click(`#main [data-act="payref"][data-i="${notBack}"]`); await page.waitForTimeout(300);
        assert(await ev(i => Number(Medhava.DB.orders[i].refund), notBack) === 0,
          'a refund was paid on a parcel nobody had looked at');
        // look at it, then the money may go
        const st0 = await ev(i => { const o = Medhava.DB.orders[i]; return { sku: o.sku, qty: o.qty, loc: o.loc, at: Medhava.DB.stockAt[o.sku][o.loc], val: o.qty * o.rate }; }, notBack);
        await page.click(`#main [data-act="inspgood"][data-i="${notBack}"]`); await page.waitForTimeout(300);
        await page.click(`#main [data-act="payref"][data-i="${notBack}"]`); await page.waitForTimeout(340);
        assert(await ev(i => Number(Medhava.DB.orders[i].refund), notBack) === st0.val,
          'a resaleable return did not refund the whole amount');
        assert(await ev(a => Medhava.DB.stockAt[a.sku][a.loc], st0) === st0.at + st0.qty,
          'a resaleable piece did not go back into stock');
        await shot('returns_refunded');
      }
      // a damaged return pays only part, and the piece is NOT added back
      const dmg = await ev(() => Medhava.DB.orders.findIndex(o => o.insp === 'damaged' && !Number(o.refund)));
      if (dmg >= 0) {
        const d0 = await ev(i => { const o = Medhava.DB.orders[i]; return { sku: o.sku, loc: o.loc, at: Medhava.DB.stockAt[o.sku][o.loc], val: o.qty * o.rate }; }, dmg);
        await page.click(`#main [data-act="payref"][data-i="${dmg}"]`); await page.waitForTimeout(340);
        const paid = await ev(i => Number(Medhava.DB.orders[i].refund), dmg);
        assert(paid > 0 && paid < d0.val, 'a damaged return was refunded in full');
        assert(await ev(a => Medhava.DB.stockAt[a.sku][a.loc], d0) === d0.at,
          'a damaged piece was quietly added back to stock');
        await shot('returns_damaged');
      }
    }

    await view('wiring');  await shot('wiring');
    await view('connect'); await shot('connect');
    await view('backup'); await page.waitForTimeout(2200); await shot('backup');

    const st = await page.evaluate(() => window.__selftest);
    const ok = st && st.fail === 0 && errors.length === 0;
    if (!ok) bad++;
    totalSteps += steps;
    console.log(`${ok ? 'OK ' : 'XX '} ${bd.file.padEnd(24)} tests ${st.pass}/${st.pass + st.fail}  asserted ${steps} step${steps === 1 ? '' : 's'}  errs ${errors.length}${errors.length ? ' :: ' + errors.join(' | ').slice(0, 260) : ''}`);
    await page.close();
  }
  await b.close();
  console.log(`\n${BUILDS.length} builds · ${totalSteps} workflow assertions · ${bad} with problems`);
  process.exit(bad ? 1 : 0);
})();
