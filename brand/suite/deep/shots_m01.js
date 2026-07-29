'use strict';
/* HD screenshots of every screen of Module 01, in populated states, for the PDF books. */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out'), SH = path.join(__dirname, 'shots');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
if (!fs.existsSync(SH)) fs.mkdirSync(SH, { recursive: true });

const BUILDS = [
  { file: 'dashboard_ERP.html', tag: 'DASH_ERP' },
  { file: 'dashboard_Vastrangam.html', tag: 'DASH_VAS' },
  { file: 'reports_ERP.html', tag: 'REP_ERP' },
  { file: 'reports_Vastrangam.html', tag: 'REP_VAS' },
];

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  for (const bd of BUILDS) {
    const page = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
    page.on('dialog', d => d.accept());
    await page.goto('file://' + path.join(OUT, bd.file), { waitUntil: 'load' });
    const shot = async (name) => {
      await page.waitForTimeout(160);
      await page.screenshot({ path: path.join(SH, bd.tag + '_' + name + '.png'), fullPage: true });
      process.stdout.write('  ' + bd.tag + '_' + name + '\n');
    };
    const view = async (v) => { await page.click(`#nav a[data-v="${v}"]`); await page.waitForTimeout(140); };

    if (bd.tag.startsWith('DASH')) {
      await view('dash');   await shot('dash');
      // prove the period switcher is live: same screen, April
      await page.click('[data-act="setp"][data-p="2026-04"]'); await shot('dash_april');
      await page.click('[data-act="setp"][data-p="2026-07"]');
      await view('sales');  await shot('sales');
      await view('money');  await shot('money');
      await view('stock');  await shot('stock');
      await view('alerts'); await shot('alerts');
      // clear one alert to show the cleared state
      const c = await page.$('#main [data-act="clear"]');
      if (c) { await c.click(); await page.waitForTimeout(500); await shot('alerts_cleared'); }
      await view('wiring'); await shot('wiring');
      await view('backup'); await page.waitForTimeout(2200); await shot('backup');
    } else {
      await view('build');  await shot('build');
      // add a filter so the filtered state is documented
      await page.selectOption('#f_field', 'gross').catch(() => {});
      await page.selectOption('#f_op', '>=').catch(() => {});
      await page.fill('#f_val', '100000').catch(() => {});
      await page.click('[data-act="addf"]'); await page.waitForTimeout(300);
      await shot('build_filtered');
      await page.click('[data-act="clearf"]'); await page.waitForTimeout(300);
      // group by month instead, to show a different shape
      await page.selectOption('#r_group', 'monthLabel').catch(() => {});
      await page.selectOption('#r_sort', 'label').catch(() => {});
      await page.selectOption('#r_dir', 'asc').catch(() => {});
      await page.click('[data-act="run"]'); await page.waitForTimeout(300);
      await shot('build_bymonth');
      await view('lib');    await shot('lib');
      // load a ready-made report, then save it so "saved" is populated
      await page.click('#main [data-act="tpl"][data-i="5"]'); await page.waitForTimeout(400);
      await shot('build_stock');
      await page.fill('#r_name', 'Where the cash is sitting').catch(() => {});
      await page.click('[data-act="savedef"]'); await page.waitForTimeout(400);
      await view('saved');  await shot('saved');
      await view('wiring'); await shot('wiring');
      await view('backup'); await page.waitForTimeout(2200); await shot('backup');
    }
    await page.close();
  }
  await b.close();
  console.log('\nshots done');
})();
