'use strict';
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let bad = 0;
  const folders = fs.readdirSync(OUT).filter(f => fs.statSync(path.join(OUT, f)).isDirectory()).sort();
  for (const folder of folders) {
    const file = path.join(OUT, folder, 'app.html');
    const page = await browser.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    await page.goto('file://' + file, { waitUntil: 'networkidle' });
    // shell built?
    const navCount = await page.$$eval('#nav a[data-v]', a => a.length);
    const h1 = await page.$eval('#main h1', e => e.textContent).catch(() => null);
    const selftest = await page.evaluate(() => window.__selftest || null);
    // click through every nav view
    const views = await page.$$eval('#nav a[data-v]', els => els.map(e => e.getAttribute('data-v')));
    let rendered = 0;
    for (const v of views) {
      await page.click(`#nav a[data-v="${v}"]`);
      const has = await page.$eval('#main h1', e => !!e.textContent).catch(() => false);
      if (has) rendered++;
    }
    // fire the primary form action if present on first view
    await page.click(`#nav a[data-v="${views[0]}"]`);
    const actBtn = await page.$('#main [data-act]:not([data-act^="_"])');
    if (actBtn) { await actBtn.click().catch(() => {}); await page.waitForTimeout(120); }
    const ok = navCount > 0 && h1 && selftest && selftest.fail === 0 && rendered === views.length && errors.length === 0;
    if (!ok) bad++;
    console.log(`${ok ? 'OK ' : 'XX '} ${folder.padEnd(20)} nav ${navCount} views ${rendered}/${views.length} tests ${selftest ? selftest.pass + '/' + (selftest.pass + selftest.fail) : '-'} errs ${errors.length}${errors.length ? ' :: ' + errors[0].slice(0, 90) : ''}`);
    await page.close();
  }
  await browser.close();
  console.log(`\n${folders.length} apps rendered · ${bad} with problems`);
  process.exit(bad ? 1 : 0);
})();
