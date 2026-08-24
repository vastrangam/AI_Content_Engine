'use strict';
/* playwright-core was required from an absolute path inside a session scratchpad — a
   directory reclaimed when that session ends and absent from a fresh clone entirely.
   This file was the last one still doing it. */
const { chromium } = require('../chrome.js').playwright();
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out'), SH = path.join(__dirname, 'shots');
const EXE = require('../chrome.js').chromePath();
if (!fs.existsSync(SH)) fs.mkdirSync(SH, { recursive: true });
// args: file, view, view, ...
const [file, ...views] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(OUT, file), { waitUntil: 'load' });
  for (const v of views) {
    await page.click(`#nav a[data-v="${v}"]`);
    await page.waitForTimeout(200);
    const out = path.join(SH, file.replace('.html', '') + '_' + v + '.png');
    await page.screenshot({ path: out, fullPage: true });
    console.log(out);
  }
  await browser.close();
})();
