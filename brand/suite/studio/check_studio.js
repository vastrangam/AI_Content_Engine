'use strict';
/* Drive the built page the way a person drives it.

   verify_studio.js checks the arithmetic in Node. This checks the thing that is
   actually delivered: it opens Vastrangam_BOS_Data_Studio.html in a real browser
   with the network switched off, drops real workbooks onto the drop zone, clicks
   the button, reads the figures off the screen, and clicks every download. A tool
   whose engine is right but whose button does nothing is not a working tool.

   Run:  node brand/suite/studio/check_studio.js <folder with the workbooks>
*/

const fs = require('node:fs');
const path = require('node:path');

const PAGE = path.join(__dirname, '..', '..', 'delivery', 'website', 'VASTRANGAM_BOS', 'Vastrangam_BOS_Data_Studio.html');
const DIR = process.argv[2] || process.env.STUDIO_DATA || '';

if (!fs.existsSync(PAGE)) {
  console.error('No built page. Run: node brand/suite/studio/build_studio.js');
  process.exit(1);
}
if (!DIR || !fs.existsSync(DIR)) {
  console.log('No data directory given, so the page was not driven.\n' +
    'usage: node brand/suite/studio/check_studio.js <folder with the workbooks>\n' +
    'Reporting this as unverified rather than as a pass.');
  process.exit(2);
}

/* The same resolution tools/report_pdf.js uses: this machine already carries a
   Chromium for the browser tests, and nothing is downloaded. */
const REPO = path.resolve(__dirname, '..', '..', '..');
const MODULES = [path.join(REPO, 'app', 'node_modules', 'playwright-core'), process.env.PW_CORE].filter(Boolean);
const EXES = [
  process.env.CHROME,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
].filter(Boolean);

let chromium, EXE;
try {
  for (const m of MODULES) { try { ({ chromium } = require(m)); break; } catch (_) { /* next */ } }
  if (!chromium) { try { ({ chromium } = require('playwright-core')); } catch (_) {} }
  if (!chromium) ({ chromium } = require('playwright'));
  EXE = EXES.find((p) => fs.existsSync(p));
  if (!EXE) throw new Error('no chromium executable — set CHROME');
} catch (e) {
  console.log('No browser available here (' + e.message + '), so the page was not driven.');
  console.log('Reporting the click-through as UNVERIFIED rather than as a pass.');
  process.exit(2);
}

let pass = 0; const fail = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`ok   ${name}`); }
  else { fail.push(name); console.log(`FAIL ${name}${detail ? '\n       ' + detail : ''}`); }
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({ acceptDownloads: true });

  /* Every outbound request is refused. If the page needs the network for
     anything at all, this is where it shows up. */
  const attempted = [];
  await ctx.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith('file:') || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
    attempted.push(url);
    return route.abort();
  });

  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message || e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.goto('file://' + PAGE);
  await page.waitForLoadState('domcontentloaded');

  check('the page loads with no script error', errors.length === 0, errors.slice(0, 3).join(' | '));
  check('it asked the network for nothing', attempted.length === 0, attempted.slice(0, 3).join(' | '));
  check('the real logo is embedded, not a placeholder',
    await page.locator('img.logo').count() === 1);
  check('the button starts disabled — there is nothing to build yet',
    await page.locator('#run').isDisabled());

  const files = [
    'Ecommerce_Sales_Return_FY2025-26.xlsx',
    'Karigar_Reports_FY2025-26.xlsx',
    'Stitching_Rate.xlsx'
  ].map((f) => path.join(DIR, f)).filter((p) => fs.existsSync(p));

  await page.setInputFiles('#file', files);
  await page.waitForFunction(() => document.querySelectorAll('#files .file').length > 0, null, { timeout: 120000 });

  const tags = await page.locator('#files .tag').allTextContents();
  check('each workbook is filed by what is inside it',
    tags.includes('sale & return') && tags.includes('karigar grid') && tags.includes('rate master'),
    'saw: ' + tags.join(', '));
  check('the button is now live', await page.locator('#run').isEnabled());

  await page.locator('#run').click();
  await page.waitForFunction(() => document.querySelectorAll('#out .card').length >= 2, null, { timeout: 180000 });

  const stat = async (card, label) => {
    const v = await page.locator(`#out .card:nth-of-type(${card}) .stat`).evaluateAll((nodes, want) => {
      const hit = nodes.find((n) => n.querySelector('span').textContent.trim() === want);
      return hit ? hit.querySelector('b').textContent.trim() : null;
    }, label);
    return v;
  };

  check('the e-commerce figures on screen are the verified ones',
    await stat(1, 'items') === '107' && await stat(1, 'net sale') === '5,527' &&
    await stat(1, 'total inventory') === '5,614' && await stat(1, 'no price on file') === '50',
    `items=${await stat(1, 'items')} net=${await stat(1, 'net sale')} inv=${await stat(1, 'total inventory')} noprice=${await stat(1, 'no price on file')}`);

  check('the karigar figures on screen are the verified ones',
    await stat(2, 'designs') === '128' && await stat(2, 'karigars') === '20' &&
    await stat(2, 'completed sets') === '16,662' && await stat(2, 'pieces stitched') === '36,229',
    `designs=${await stat(2, 'designs')} karigars=${await stat(2, 'karigars')} sets=${await stat(2, 'completed sets')} pieces=${await stat(2, 'pieces stitched')}`);

  check('every table shows its grand total, even past the display limit',
    await page.locator('#out tfoot tr.grand').count() === 3,
    `${await page.locator('#out tfoot tr.grand').count()} total rows found, expected 3`);

  {
    const shown = await page.locator('#out .card:nth-of-type(1) tfoot tr.grand td').allTextContents();
    check('the e-commerce total row carries the verified numbers',
      shown.includes('9,917') && shown.includes('5,527') && shown.includes('5,614'),
      shown.join(' | '));
  }
  check('items with no price are flagged on screen',
    await page.locator('#out tr.flag').count() >= 1);

  /* Click every download and keep what comes back. */
  const OUT = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'studio-click-'));
  const buttons = page.locator('#out .dl');
  const total = await buttons.count();
  const saved = [];
  for (let i = 0; i < total; i++) {
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), buttons.nth(i).click()]);
    const name = dl.suggestedFilename();
    const to = path.join(OUT, name);
    await dl.saveAs(to);
    saved.push({ name, size: fs.statSync(to).size, path: to });
  }
  check('every download button produces a file', saved.length === total && total === 3,
    saved.map((s) => `${s.name} ${s.size}B`).join(', '));

  /* The downloaded bytes must be a workbook, not an error page. */
  const X = require('../xlsx.js');
  let readable = 0; const shapes = [];
  for (const s of saved) {
    try {
      const wb = X.readXlsx(new Uint8Array(fs.readFileSync(s.path)));
      readable++;
      shapes.push(`${s.name}: ${wb.names.length} sheet(s)`);
    } catch (e) { shapes.push(`${s.name}: UNREADABLE — ${e.message}`); }
  }
  check('every downloaded workbook opens', readable === saved.length, shapes.join(' | '));

  const eco = saved.find((s) => /Ecommerce_Complete/.test(s.name));
  if (eco) {
    const wb = X.readXlsx(new Uint8Array(fs.readFileSync(eco.path)));
    const rows = wb.sheets[wb.names[0]];
    const totals = rows[rows.length - 1];
    check('the downloaded e-commerce file carries every item and a totals row',
      rows.length === 110 && String(totals[1]).trim() === 'GRAND TOTAL',
      `${rows.length} rows, last row starts "${totals[1]}"`);
  }

  check('driving the whole page raised no error', errors.length === 0, errors.slice(0, 3).join(' | '));
  check('and still nothing was asked of the network', attempted.length === 0, attempted.slice(0, 3).join(' | '));

  await browser.close();

  console.log('\n' + '='.repeat(70));
  console.log(`${pass} passed, ${fail.length} failed`);
  for (const f of fail) console.log(`  FAIL ${f}`);
  process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.error('check_studio crashed:', e); process.exit(1); });
