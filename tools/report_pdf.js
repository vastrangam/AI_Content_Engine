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

/* One answer to "where is Chromium", shared with every other script that asks — see
   brand/suite/chrome.js. This file used to carry its own list with a version-pinned path
   in it, which is how the CI runner ended up being told to launch a binary that exists on
   exactly one machine. CHROME still wins if it is set, because an explicit answer should. */
function chrome() {
  if (process.env.CHROME && fs.existsSync(process.env.CHROME)) return process.env.CHROME;
  return require(path.join(REPO, 'brand', 'suite', 'chrome.js')).chromePath();
}

/* The <title> report_pdf.py writes, read back off the page it wrote, so the two
   halves of the pipeline cannot disagree about what this document is called.
   Falls back to the filename if the page has no title. */
function docTitle() {
  try {
    const head = fs.readFileSync(HTML, 'utf8').slice(0, 4096);
    const m = /<title>([^<]+)<\/title>/i.exec(head);
    if (m) return m[1].replace(/&amp;/g, '&').trim();
  } catch (_) { /* fall through */ }
  return path.basename(HTML, '.html').replace(/_/g, ' ');
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

  /* EVERY DIAGRAM MUST HAVE DRAWN, AND HAVE A SIZE.

     "No unrendered `flowchart` text in the PDF" is the check that was being run, and it is
     also true of a diagram that silently vanished — which is exactly what happened: a tall
     top-down flowchart could not fit inside `break-inside:avoid` on any page, so the printer
     dropped it and produced a heading above a blank sheet. Every automated check passed.

     So the count of drawn SVGs must match the count of diagram blocks, and none may be
     zero-sized. The over-tall case is handled by max-height in the stylesheet; this catches
     the day that stops being enough. */
  const dia = await page.evaluate(() => {
    const blocks = [...document.querySelectorAll('.mermaid')];
    return blocks.map((b, i) => {
      const svg = b.querySelector('svg');
      const r = svg && svg.getBoundingClientRect();
      return { i, drawn: !!svg, w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0 };
    });
  });
  const broken = dia.filter((d) => !d.drawn || d.w < 4 || d.h < 4);
  if (broken.length) {
    console.error(`report_pdf: ${broken.length} of ${dia.length} diagram(s) did not draw:`);
    broken.forEach((d) => console.error(`  block #${d.i + 1}: drawn=${d.drawn} ${d.w}×${d.h}`));
    await browser.close();
    process.exit(1);
  }
  if (dia.length) console.log(`  ${dia.length} diagram(s) drawn`);
  await page.pdf({
    path: PDF,
    format: 'A4',
    printBackground: true,
    margin: { top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    /* The running footer names the document being printed. It used to say
       "Project Report" whatever was passed in, so every deliverable came out of
       the printer claiming to be a different one. */
    footerTemplate:
      '<div style="width:100%;font:8pt DM Sans,Arial;color:#6E6153;' +
      'padding:0 14mm;display:flex;justify-content:space-between">' +
      `<span>${docTitle()}</span>` +
      '<span class="pageNumber"></span></div>',
  });
  await browser.close();
  const kb = Math.round(fs.statSync(PDF).size / 1024);
  console.log(`wrote ${PDF}  (${kb} KB)`);
})().catch((e) => { console.error(e.message); process.exit(1); });
