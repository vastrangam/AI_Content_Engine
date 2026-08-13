'use strict';
/* Print a rendered HTML page to PDF.
 *
 *   python3 tools/report_pdf.py && node tools/report_pdf.js
 *   python3 tools/report_pdf.py PLAN_OF_ACTION.md && node tools/report_pdf.js PLAN_OF_ACTION.html
 *
 * Chromium is already on this machine for the browser tests; nothing is
 * downloaded. If the executable moves, set CHROME to the new path.
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const HTML = path.resolve(REPO, process.argv[2] || 'PROJECT_REPORT.html');
const PDF = HTML.replace(/\.html$/, '.pdf');

const CANDIDATES = [
  process.env.CHROME,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
].filter(Boolean);

const MODULES = [
  path.join(REPO, 'app', 'node_modules', 'playwright-core'),
  process.env.PW_CORE,
].filter(Boolean);

function load() {
  for (const m of MODULES) {
    try { return require(m); } catch (_) { /* try the next one */ }
  }
  try { return require('playwright-core'); } catch (_) {}
  try { return require('playwright'); } catch (_) {}
  throw new Error('playwright-core not found — set PW_CORE to its folder');
}

function chrome() {
  for (const c of CANDIDATES) if (fs.existsSync(c)) return c;
  throw new Error('chromium not found — set CHROME to the executable');
}

(async () => {
  if (!fs.existsSync(HTML)) {
    throw new Error('run  python3 tools/report_pdf.py  first');
  }
  const { chromium } = load();
  const browser = await chromium.launch({
    executablePath: chrome(),
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.goto('file://' + HTML, { waitUntil: 'load' });
  // Wait for mermaid to finish drawing, or carry on if there are no diagrams.
  await page.waitForFunction(
    () => document.querySelectorAll('.mermaid').length === 0 ||
          document.body.dataset.mermaid === 'done' ||
          document.body.dataset.mermaid === 'error',
    null, { timeout: 60000 }
  ).catch(() => console.warn('  ! mermaid did not settle; printing anyway'));
  await page.waitForTimeout(600);
  await page.pdf({
    path: PDF,
    format: 'A4',
    printBackground: true,
    margin: { top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate:
      '<div style="width:100%;font:8pt DM Sans,Arial;color:#6E6153;' +
      'padding:0 14mm;display:flex;justify-content:space-between">' +
      '<span>Vastrangam Group ERP — Project Report</span>' +
      '<span class="pageNumber"></span></div>',
  });
  await browser.close();
  const kb = Math.round(fs.statSync(PDF).size / 1024);
  console.log(`wrote ${PDF}  (${kb} KB)`);
})().catch((e) => { console.error(e.message); process.exit(1); });
