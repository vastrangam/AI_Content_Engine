'use strict';
/* HD screenshots of every screen of Module 21, in populated states, for the PDF books.
   Four apps × two editions. Every shot is taken from the shipped file at double resolution,
   after the screen has been driven into the state the book talks about — a filter actually
   applied, an alert actually cleared, a refusal actually triggered, a spreadsheet actually
   uploaded. Nothing here is staged in a mock-up. */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path'), os = require('os');
const OUT = path.join(__dirname, 'out'), SH = path.join(__dirname, 'shots');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SHEET = require(path.join(__dirname, '..', 'xlsx.js'));
if (!fs.existsSync(SH)) fs.mkdirSync(SH, { recursive: true });

const BUILDS = [
  { file: 'dashboard_ERP.html', tag: 'DASH_ERP', kind: 'dash' },
  { file: 'dashboard_Vastrangam.html', tag: 'DASH_VAS', kind: 'dash' },
  { file: 'reports_ERP.html', tag: 'REP_ERP', kind: 'rep' },
  { file: 'reports_Vastrangam.html', tag: 'REP_VAS', kind: 'rep' },
  { file: 'groupcons_ERP.html', tag: 'GRP_ERP', kind: 'grp' },
  { file: 'groupcons_Vastrangam.html', tag: 'GRP_VAS', kind: 'grp' },
  { file: 'm21_ERP.html', tag: 'UNI_ERP', kind: 'uni' },
  { file: 'm21_Vastrangam.html', tag: 'UNI_VAS', kind: 'uni' },
];

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'm01shots-'));
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  for (const bd of BUILDS) {
    const page = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, acceptDownloads: true });
    page.on('dialog', d => d.accept());
    await page.goto('file://' + path.join(OUT, bd.file), { waitUntil: 'load' });
    const shot = async (name) => {
      await page.waitForTimeout(160);
      /* a toast is a two-second thing; a screenshot is forever. Wait it out rather than
         printing a book with a black pill sitting on top of a table row. */
      await page.waitForFunction(() => {
        var t = document.getElementById('toast');
        return !t || !t.classList.contains('show');
      }, { timeout: 4000 }).catch(() => {});
      await page.screenshot({ path: path.join(SH, bd.tag + '_' + name + '.png'), fullPage: true });
      process.stdout.write('  ' + bd.tag + '_' + name + '\n');
    };
    const view = async (v) => { await page.click(`#nav a[data-v="${v}"]`); await page.waitForTimeout(160); };
    const co1 = await page.evaluate(() => Medhava.DB.companies[0].id);

    if (bd.kind === 'dash') {
      await view('dash'); await shot('dash');
      /* the period dial is live: same screen, April */
      await page.click('[data-act="setp"][data-p="2026-04"]'); await shot('dash_april');
      await page.click('[data-act="setp"][data-p="2026-07"]');
      /* the company dial is live too: same screen, one company */
      await page.click(`[data-act="setco"][data-c="${co1}"]`); await shot('dash_onecompany');
      await page.click('[data-act="setco"][data-c="all"]');
      await view('sales'); await shot('sales');
      await view('money'); await shot('money');
      await view('stock'); await shot('stock');
      await view('companies'); await shot('companies');
      await view('alerts'); await shot('alerts');
      const c = await page.$('#main [data-act="clear"]');
      if (c) { await c.click(); await page.waitForTimeout(500); await shot('alerts_cleared'); }
      await view('wiring'); await shot('wiring');
      await view('connect'); await shot('connect');
      await view('backup'); await page.waitForTimeout(2200); await shot('backup');

    } else if (bd.kind === 'rep') {
      await view('build'); await shot('build');
      await page.selectOption('#f_field', 'gross').catch(() => {});
      await page.selectOption('#f_op', '>=').catch(() => {});
      await page.fill('#f_val', '60000').catch(() => {});
      await page.click('[data-act="addf"]'); await page.waitForTimeout(300);
      await shot('build_filtered');
      await page.click('[data-act="clearf"]'); await page.waitForTimeout(300);
      /* the same records grouped by company instead of channel — identical total */
      await page.selectOption('#r_group', 'company').catch(() => {});
      await page.selectOption('#r_sort', 'net').catch(() => {});
      await page.click('[data-act="run"]'); await page.waitForTimeout(300);
      await shot('build_bycompany');
      await view('lib'); await shot('lib');
      await page.click('#main [data-act="tpl"][data-i="6"]'); await page.waitForTimeout(400);
      await shot('build_stock');
      await page.fill('#r_name', 'Where the cash is sitting').catch(() => {});
      await page.click('[data-act="savedef"]'); await page.waitForTimeout(400);
      await view('saved'); await shot('saved');
      await view('wiring'); await shot('wiring');
      await view('connect'); await shot('connect');
      await view('backup'); await page.waitForTimeout(2200); await shot('backup');

    } else if (bd.kind === 'grp') {
      await view('group'); await shot('group');
      await view('compare'); await shot('compare');
      await view('internal'); await shot('internal');
      await view('returns'); await shot('returns');
      /* a registered company: figures come back */
      const okBtn = await page.$$('#main [data-act="filereturn"]');
      if (okBtn[0]) { await okBtn[0].click(); await page.waitForTimeout(400); await shot('returns_ok'); }
      /* the one with no registration: refused, in words */
      const btns = await page.$$('#main [data-act="filereturn"]');
      if (btns.length) { await btns[btns.length - 1].click(); await page.waitForTimeout(400); await shot('returns_refused'); }
      await view('cos'); await shot('cos');
      /* try to turn a trading name into a company — the refusal is the feature */
      const tb = await page.$('#main [data-act="trybrand"]');
      if (tb) { await tb.click(); await page.waitForTimeout(500); await shot('cos_refused'); }
      await view('wiring'); await shot('wiring');
      await view('connect'); await shot('connect');
      await view('backup'); await page.waitForTimeout(2200); await shot('backup');

    } else {
      await view('dash'); await shot('dash');
      await view('records'); await shot('records');
      /* a row being edited, pre-filled from the table below it */
      const ed = await page.$('#main [data-act="editrec"]');
      if (ed) { await ed.click(); await page.waitForTimeout(300); await shot('records_edit'); }
      await page.click('[data-act="canceledit"]').catch(() => {});
      await page.click('[data-act="settab"][data-t="companies"]'); await page.waitForTimeout(250);
      await shot('records_companies');
      await page.click('[data-act="settab"][data-t="sales"]'); await page.waitForTimeout(200);
      await view('files'); await shot('files');
      /* a real upload, with one row that must be refused */
      const channel = await page.evaluate(() => Medhava.DB.sales[0].channel);
      const f = path.join(tmp, 'upload.xlsx');
      fs.writeFileSync(f, Buffer.from(SHEET.writeXlsx({ Sales: [
        ['Company', 'Month', 'Channel', 'Gross', 'Returns', 'Units'],
        [co1, '2026-07', channel, 50000, 5000, 30],
        [co1, '2026-07', channel, 30000, 0, 20],
        ['NO SUCH COMPANY', '2026-07', channel, 99999, 0, 10]] })));
      await page.setInputFiles('#sheetIn', f); await page.waitForTimeout(600);
      await shot('files_staged');
      await page.click('[data-act="commit"][data-mode="add"]'); await page.waitForTimeout(500);
      await shot('files_done');
      await view('dash'); await shot('dash_after');
      await view('group'); await shot('group');
      await view('build'); await shot('build');
      await view('wiring'); await shot('wiring');
      await view('connect'); await shot('connect');
      await view('backup'); await page.waitForTimeout(2200); await shot('backup');
    }
    await page.close();
  }
  await b.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('\nshots done');
})();
