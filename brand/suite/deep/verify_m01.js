'use strict';
/* Module 01 · the combined app, driven the way a person would drive it.

   check_deep.js proves every button can be pressed without an error. This proves something
   different and more important: that pressing them CHANGES THE RIGHT NUMBERS. It types a sale
   in and watches the dashboard, the reports and the group roll-up all move by the same amount;
   edits it; deletes it and watches every figure come back exactly; then uploads a real .xlsx
   with one bad row in it and checks that the good rows land, the bad one is refused by name,
   and nothing was silently dropped. Finally it downloads the Excel export and re-reads it in
   Node with the same engine, to prove what comes out can go back in.

   Run: node verify_m01.js */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path'), os = require('os');
const OUT = path.join(__dirname, 'out');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SHEET = require(path.join(__dirname, '..', 'xlsx.js'));

let failures = 0;
const check = (name, ok, detail) => {
  if (!ok) failures++;
  console.log(`  ${ok ? '✓' : '✗ FAIL'}  ${name}${detail ? '   ' + detail : ''}`);
};

/* Every build carries its own companies and channels, so the fixture is built from the app. */
function fixture(dir, co, channel) {
  const rows = [
    ['Company', 'Month', 'Channel', 'Gross', 'Returns', 'Units'],
    [co, '2026-07', channel, 50000, 5000, 30],
    [co, '2026-07', channel, 30000, 0, 20],
    ['NO SUCH COMPANY', '2026-07', channel, 99999, 0, 10],   /* must be refused, by name */
  ];
  const f = path.join(dir, 'upload-test.xlsx');
  fs.writeFileSync(f, Buffer.from(SHEET.writeXlsx({ Sales: rows })));
  return f;
}

async function run(file) {
  console.log('\n── ' + file);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'm01-'));
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('dialog', d => d.accept());
  await page.goto('file://' + path.join(OUT, file), { waitUntil: 'load' });

  /* The three figures that must always move together, read straight off the live app. */
  const figures = () => page.evaluate(() => {
    const DB = Medhava.DB, M01 = Medhava.M01;
    return { dash: M01.netSales(DB),
             report: M01.report(DB, M01.defaultDef('sales')).total.v.net,
             group: M01.groupFigures(DB).net,
             sales: DB.sales.length };
  });
  const co = await page.evaluate(() => Medhava.DB.companies[0].id);
  const channel = await page.evaluate(() => Medhava.DB.sales[0].channel);

  const before = await figures();
  check('the three apps start on the same number', before.dash === before.report,
    `dashboard ${before.dash} · report ${before.report}`);

  /* ── 1 · add a record by typing it, exactly as a person would ── */
  await page.click('#nav a[data-v="records"]');
  await page.click('[data-act="settab"][data-t="sales"]');
  await page.selectOption('#r_co', co);
  await page.selectOption('#r_month', '2026-07');
  await page.selectOption('#r_channel', channel);
  await page.fill('#r_gross', '20000');
  await page.fill('#r_returns', '2000');
  await page.fill('#r_units', '12');
  await page.click('[data-act="saverec"]');
  await page.waitForTimeout(150);
  const added = await figures();
  check('typing one sale adds exactly one row', added.sales === before.sales + 1);
  check('the dashboard moved by the net of that sale', added.dash === before.dash + 18000,
    `${before.dash} → ${added.dash}`);
  check('every report moved by the same amount', added.report === before.report + 18000);
  check('the group figures moved by the same amount', added.group === before.group + 18000);

  /* ── 2 · edit it ── */
  const newId = await page.evaluate(() => Medhava.DB.sales[Medhava.DB.sales.length - 1].id);
  await page.click(`[data-act="editrec"][data-id="${newId}"]`);
  await page.waitForTimeout(120);
  const prefilled = await page.inputValue('#r_gross');
  check('editing pre-fills the row you clicked', Number(prefilled) === 20000, `gross box shows ${prefilled}`);
  await page.fill('#r_gross', '25000');
  await page.click('[data-act="saverec"]');
  await page.waitForTimeout(150);
  const edited = await figures();
  check('editing changes the figure and does not add a row',
    edited.sales === added.sales && edited.dash === before.dash + 23000);

  /* ── 3 · a bad row is refused, in the form as well as the importer ── */
  await page.click('[data-act="settab"][data-t="sales"]');
  await page.fill('#r_gross', '100');
  await page.evaluate(() => { document.getElementById('r_month').value = ''; });
  await page.click('[data-act="saverec"]');
  await page.waitForTimeout(150);
  const refusedText = await page.textContent('#main').catch(() => '');
  check('a row missing something required is refused, with the reason on screen',
    /Not accepted/.test(refusedText));
  check('the refused row was not added anyway', (await figures()).sales === edited.sales);

  /* ── 4 · delete it, and watch every figure come back exactly ── */
  await page.click(`[data-act="delrec"][data-id="${newId}"]`);
  await page.waitForTimeout(150);
  const after = await figures();
  check('deleting puts the dashboard back exactly', after.dash === before.dash);
  check('deleting puts every report back exactly', after.report === before.report);
  check('deleting puts the group figures back exactly', after.group === before.group);
  check('and the row count is back where it started', after.sales === before.sales);

  /* ── 5 · upload a real .xlsx, with one row that must be refused ── */
  const f = fixture(tmp, co, channel);
  await page.click('#nav a[data-v="files"]');
  await page.setInputFiles('#sheetIn', f);
  await page.waitForTimeout(400);
  const staged = await page.evaluate(() => Medhava.DB.pending);
  check('the upload was read and staged, not written straight in', !!staged && !!staged.sheets.length);
  check('it worked out which table the sheet belongs to', staged && staged.sheets[0].table === 'sales');
  check('two good rows accepted, one bad row refused',
    staged && staged.sheets[0].ok === 2 && staged.sheets[0].bad === 1,
    staged ? `ok ${staged.sheets[0].ok} · bad ${staged.sheets[0].bad}` : '');
  check('nothing was written before you chose', (await figures()).sales === before.sales);
  const why = staged ? staged.rejected.map(r => r.why).join(' ') : '';
  check('the refused row says which company it could not find', /no company "NO SUCH COMPANY"/.test(why), why.slice(0, 70));
  check('the refused row carries its line number', staged && staged.rejected[0].line === 4);

  await page.click('[data-act="commit"][data-mode="add"]');
  await page.waitForTimeout(250);
  const imported = await figures();
  check('committing brings in only the accepted rows', imported.sales === before.sales + 2);
  check('the dashboard moved by the net of what was accepted',
    imported.dash === before.dash + 75000, `${before.dash} → ${imported.dash}`);
  check('the group figures moved by the same amount', imported.group === before.group + 75000);
  check('an imported row can be edited like any other',
    await page.evaluate(() => Medhava.DB.sales.slice(-2).every(r => !!r.id)));

  /* ── 6 · download the Excel and read it back in Node with the same engine ── */
  const dl = await Promise.all([page.waitForEvent('download'), page.click('[data-act="xlsxdl"]')]);
  const saved = path.join(tmp, 'export.xlsx');
  await dl[0].saveAs(saved);
  const wb = SHEET.readXlsx(new Uint8Array(fs.readFileSync(saved)));
  check('the export is a real workbook a spreadsheet can open', wb.names.length >= 10, wb.names.length + ' sheets');
  check('it has one sheet per table, named as the app names them', wb.names.indexOf('Sales') >= 0);
  const salesRows = wb.sheets.Sales;
  check('the sales sheet has every record plus a heading row',
    salesRows.length === imported.sales + 1, `${salesRows.length} rows for ${imported.sales} records`);
  const objs = SHEET.toObjects(salesRows, [
    { k: 'co', l: 'Company' }, { k: 'month', l: 'Month' }, { k: 'channel', l: 'Channel' },
    { k: 'gross', l: 'Gross', type: 'num' }, { k: 'returns', l: 'Returns', type: 'num' }, { k: 'units', l: 'Units', type: 'num' }]);
  const netOut = Math.round(objs.rows.reduce((s, r) => s + r.gross - r.returns, 0) * 100) / 100;
  /* The export is every record, so it is compared with the app's whole-year, every-company
     figure — not the July one on screen. Comparing it with what happens to be on screen would
     be a test that passes only while the period switcher is where the test left it. */
  const netAll = await page.evaluate(() =>
    Medhava.M01.netSales(Medhava.M01.scope(Medhava.DB, 'all', 'all')));
  check('the figures survive the round trip out to Excel', netOut === netAll,
    `exported ${netOut} · in the app ${netAll}`);

  /* ── 7 · the group rules still hold after all that editing ── */
  const rules = await page.evaluate(() => {
    const DB = Medhava.DB, M01 = Medhava.M01, g = M01.groupFigures(DB);
    const unreg = M01.perCompany(DB).filter(c => !c.registered)[0];
    const brand = DB.brands[DB.brands.length - 1];
    return { elimOk: g.net === Math.round((g.addedNet - g.eliminated) * 100) / 100,
             refused: unreg ? M01.gstReturn(DB, unreg.id).refused === true : false,
             unregCounts: unreg ? unreg.net > 0 : false,
             brandRefused: M01.addCompany(DB, { id: 'QQ', name: brand.name }).refused === true };
  });
  check('internal billing is still removed from the group total', rules.elimOk);
  check('the unregistered company still counts in the figures', rules.unregCounts);
  check('and is still refused a return', rules.refused);
  check('a trading name still cannot be made into a company', rules.brandRefused);

  /* ── 8 · it survives a reload, because it was saved as you went ── */
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(200);
  const reloaded = await figures();
  check('everything you did is still there after a reload', reloaded.sales === imported.sales && reloaded.dash === imported.dash);

  check('no console or script errors through all of that', errors.length === 0, errors[0] || '');
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}

(async () => {
  for (const f of ['m01_ERP.html', 'm01_Vastrangam.html']) await run(f);
  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}\n`);
  process.exit(failures ? 1 : 0);
})();
