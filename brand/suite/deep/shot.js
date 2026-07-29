'use strict';
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out'), SH = path.join(__dirname, 'shots');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
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
