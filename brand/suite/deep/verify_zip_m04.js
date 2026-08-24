'use strict';
/* The Module 04 ZIPs, opened the way a customer opens them.

   Everything else in this folder checks the files in out/. This checks the copies that came
   out of the archive, in the folders they came out into, with the names they came out under —
   because that is the only copy anybody will ever double-click, and a packaging step that
   quietly drops or renames a file breaks nothing until it is in somebody's Downloads folder.

   Run: node verify_zip_m02.js <folder the ZIPs were extracted into> */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const EXE = require('../chrome.js').chromePath();
const ROOT = process.argv[2];
if (!ROOT) { console.error('give me the folder the ZIPs were extracted into'); process.exit(2); }

let failures = 0;
const check = (name, ok, detail) => {
  if (!ok) failures++;
  console.log(`  ${ok ? '✓' : '✗ FAIL'}  ${name}${detail ? '   ' + detail : ''}`);
};

/* what each app must report, from tests.json — never a number typed here */
const TESTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'tests.json'), 'utf8'));
const APPS = [
  { n: '01', slug: 'CRM_Customer_360', tag: 'CRM' },
  { n: '02', slug: 'Documents_eSign', tag: 'DOC' },
  { n: '03', slug: 'Helpdesk_Live_Chat', tag: 'HD' },
  { n: '04', slug: 'All_Three_In_One', tag: 'U2' },
];
const EDS = [{ ed: 'MEDHAVA', key: 'ERP' }, { ed: 'VASTRANGAM', key: 'VAS' }];

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  for (const { ed, key } of EDS) {
    const base = path.join(ROOT, `${ed}_Module_04_CRM`);
    console.log('\n══ ' + ed);
    check('the edition folder is there', fs.existsSync(base), base);

    for (const f of [`${ed}_M04_Module_Overview.pdf`, `${ed}_M04_START_HERE.md`]) {
      const p = path.join(base, f);
      check('at the top level: ' + f, fs.existsSync(p) && fs.statSync(p).size > 4096,
        fs.existsSync(p) ? Math.round(fs.statSync(p).size / 1024) + 'KB' : 'missing');
    }

    for (const a of APPS) {
      const dir = path.join(base, `App_${a.n}_${a.slug}`);
      const stem = `${ed}_M04_App${a.n}_${a.slug}`;
      const html = path.join(dir, stem + '.html');
      const md = path.join(dir, stem + '_MANUAL.md');
      const pdf = path.join(dir, stem + '_WIRING.pdf');
      console.log(`\n  ── App ${a.n} · ${a.slug}`);
      check('the app, the manual and the wiring PDF are all in the folder',
        [html, md, pdf].every(fs.existsSync),
        [html, md, pdf].filter(x => !fs.existsSync(x)).map(x => path.basename(x)).join(' ') || 'all three');
      if (![html, md, pdf].every(fs.existsSync)) continue;

      const pdfBytes = fs.readFileSync(pdf);
      const pages = (pdfBytes.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
      check('the PDF is a real PDF with pages in it',
        pdfBytes.slice(0, 5).toString() === '%PDF-' && pages >= 8,
        pages + ' pages · ' + Math.round(pdfBytes.length / 1024 / 1024 * 10) / 10 + 'MB');

      const manual = fs.readFileSync(md, 'utf8');
      check('the manual tells them to look for this exact file',
        manual.indexOf(stem + '.html') >= 0, stem + '.html');

      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      const errors = [];
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
      await page.goto('file://' + html, { waitUntil: 'load' });
      const st = await page.evaluate(() => window.__selftest || null);
      const want = TESTS[a.tag + '_' + key].length;
      check('every self-test passes, from the file as it shipped',
        !!st && st.fail === 0 && st.pass === want,
        st ? st.pass + '/' + (st.pass + st.fail) + ' (expected ' + want + ')' : 'no results');

      const reach = await page.evaluate(() => (Medhava.M02V || {}).lastUnreachable);
      check('no button in it is without a screen', Array.isArray(reach) && reach.length === 0,
        reach === null ? 'the probe did not run' : (reach || []).join(', '));

      /* every screen opens, from this copy */
      const views = await page.$$eval('#nav a[data-v]', els => els.map(e => e.getAttribute('data-v')));
      let opened = 0;
      for (const v of views) {
        await page.click(`#nav a[data-v="${v}"]`).catch(() => {});
        await page.waitForTimeout(70);
        if (await page.$eval('#main h1', e => !!e.textContent).catch(() => false)) opened++;
      }
      check('every screen in the menu opens', opened === views.length, opened + '/' + views.length);
      check('nothing in the console', errors.length === 0, errors[0] || '');
      await page.close();
    }
  }
  await browser.close();
  console.log(`\n${failures === 0 ? 'BOTH ZIPS ARE GOOD AS SHIPPED' : failures + ' PROBLEM(S) IN THE SHIPPED ZIPS'}\n`);
  process.exit(failures ? 1 : 0);
})();
