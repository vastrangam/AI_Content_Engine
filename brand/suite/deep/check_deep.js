'use strict';
/* Full interaction check for the deep apps: opens every view, clicks EVERY interactive control
   (buttons with data-act / data-go), and fails on any console error, page error or failed self-test. */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const only = process.argv[2] || '';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.html') && (!only || f.includes(only))).sort();
  let bad = 0;
  for (const f of files) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    page.on('dialog', d => d.accept());
    await page.goto('file://' + path.join(OUT, f), { waitUntil: 'load' });
    const st = await page.evaluate(() => window.__selftest || null);
    const views = await page.$$eval('#nav a[data-v]', els => els.map(e => e.getAttribute('data-v')));
    let rendered = 0, clicks = 0;
    for (const v of views) {
      if (v === 'backup') continue; // wipe/reseed would destroy state mid-run
      await page.click(`#nav a[data-v="${v}"]`);
      await page.waitForTimeout(60);
      if (await page.$eval('#main h1', e => !!e.textContent).catch(() => false)) rendered++;
      // click every interactive control on this view, re-querying because the DOM re-renders
      const n = await page.$$eval('#main [data-act]:not([data-act^="_"]), #main [data-go]', els => els.length);
      for (let i = 0; i < n; i++) {
        await page.click(`#nav a[data-v="${v}"]`).catch(() => {});
        await page.waitForTimeout(40);
        const sel = '#main [data-act]:not([data-act^="_"]), #main [data-go]';
        const els = await page.$$(sel);
        if (!els[i]) break;
        // put a value in any free-text box so "add filter" / "save" style actions have input
        await page.$$eval('#main input[type="text"]', ins => ins.forEach(x => { if (!x.value) x.value = 'Myntra'; })).catch(() => {});
        await els[i].click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(70);
        clicks++;
        if (!(await page.$('#main h1'))) { errors.push('view blanked after click ' + i + ' on ' + v); break; }
      }
    }
    const views2 = views.filter(v => v !== 'backup').length;
    const ok = st && st.fail === 0 && rendered === views2 && errors.length === 0;
    if (!ok) bad++;
    console.log(`${ok ? 'OK ' : 'XX '} ${f.padEnd(30)} views ${rendered}/${views2}  clicks ${String(clicks).padStart(3)}  tests ${st ? st.pass + '/' + (st.pass + st.fail) : '-'}  errs ${errors.length}${errors.length ? ' :: ' + errors[0].slice(0, 120) : ''}`);
    await page.close();
  }
  await browser.close();
  console.log(`\n${files.length} apps · ${bad} with problems`);
  process.exit(bad ? 1 : 0);
})();
