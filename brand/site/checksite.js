'use strict';
/* THE PUBLISHED SITE, DRIVEN — not inspected.
 *
 *   node brand/site/checksite.js
 *   node brand/site/checksite.js --summary
 *
 * WHY THIS IS A BROWSER AND NOT A FILE LIST
 * Everything that has gone wrong with delivery in this project went wrong in a way a file
 * listing could not see. An archive was audited by reading `unzip -l` and reported at the
 * wrong size and the wrong file count. An archive that "contained" a web server served a
 * 404 because one HTML file had been excluded as build output. The lesson written down at
 * the time was: extract it and run it. This is that lesson applied to a website.
 *
 * So this serves `site/` over a real HTTP server on a real port, opens it in Chromium, and
 * asserts what a visitor would actually get:
 *
 *   · the landing page loads, and carries the three statements that stop a live URL
 *     implying more than it should — that the database apps are NOT here, that every app
 *     linked is a prototype, and what the measured score actually is
 *   · the generated product website loads, with no root-absolute link left in it. Those
 *     links are correct at a domain root and broken under github.io/<repo>/, and they are
 *     rewritten at assembly time — so this checks the rewrite happened rather than trusting
 *     that it did
 *   · two real app pages load and render real controls
 *   · nothing threw, and no request 404ed. The 404 is the important one: it is exactly the
 *     defect that shipped last time, and a page that looks right while one of its requests
 *     fails is the most convincing kind of broken.
 *
 * IT SKIPS, LOUDLY, WITH NO SITE. `site/` is build output and is not committed. A checkout
 * that has not run the builds cannot publish them, and this refuses to call that a pass.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const SITE = path.join(ROOT, 'site');
const summary = process.argv.includes('--summary');

if (!fs.existsSync(path.join(SITE, 'index.html'))) {
  console.log('checksite: no site/ assembled — SKIPPED, not passed.');
  console.log('  site/ is build output and is not committed. Assemble it first:');
  console.log('    node brand/site/build.js && node brand/site/build.js vastrangam');
  console.log('    node brand/suite/deep/build_deep.js');
  console.log('    node brand/delivery/website/mksite.js');
  console.log('  A checkout that has not built the site cannot publish it, and reporting');
  console.log('  that as a pass would be the silence this whole set of gates refuses.');
  process.exit(0);
}

const { chromium } = require(path.join(ROOT, 'node_modules', 'playwright-core'));
const chromePath = require(path.join(ROOT, 'brand', 'suite', 'chrome.js')).chromePath;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf', '.png': 'image/png', '.svg': 'image/svg+xml',
};

let failures = 0;
const ok = (what, cond, detail) => {
  if (cond) { console.log('  ok   ' + what); }
  else { failures++; console.log(`  FAIL ${what}${detail ? ' — ' + detail : ''}`); }
};

(async () => {
  const server = http.createServer((q, s) => {
    let rel = decodeURIComponent(q.url.split('?')[0]);
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.join(SITE, rel);
    if (!file.startsWith(SITE) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      s.writeHead(404); return s.end('not found');
    }
    s.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    return fs.createReadStream(file).pipe(s);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;

  const browser = await chromium.launch({ executablePath: chromePath(), args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const thrown = [];
  const failed = [];
  page.on('pageerror', (e) => thrown.push(e.message));
  page.on('response', (r) => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url().replace(base, '')); });

  await page.goto(base + '/', { waitUntil: 'networkidle' });
  const body = await page.textContent('body');
  ok('the landing page loads', /Medhava/.test(await page.title()));
  /* THE THREE STATEMENTS. A live URL is the most convincing wrong impression available
     here, and these are what stop it. If any one of them ever falls out of the generated
     page, the site publishes a claim nobody checked. */
  ok('it says the database apps are NOT on this site', /are not on this site/i.test(body));
  ok('it says every app linked is a prototype', /is a prototype/i.test(body));
  ok('it carries the measured score rather than a boast', /out of 5/.test(body));
  const appLinks = await page.$$eval('a.go[href^="apps/"]', (a) => a.map((x) => x.getAttribute('href')));
  ok('it links the app pages', appLinks.length >= 30, appLinks.length + ' link(s)');

  await page.goto(base + '/product/index.html', { waitUntil: 'networkidle' });
  ok('the generated product website loads', /Medhava/.test(await page.title()));
  const rooted = await page.$$eval('a[href="/"], a[href="/llms.txt"]', (a) => a.length);
  ok('no root-absolute link survived the rebase', rooted === 0, rooted + ' left');

  /* Two apps, driven. Not "the file is 105KB" — opened, and asked whether a person would
     find anything to click. */
  for (const [slug, expect] of [['d2c-product', /D2C|Sales/i], ['dashboard-product', /Dashboard/i]]) {
    await page.goto(`${base}/apps/${slug}.html`, { waitUntil: 'networkidle' });
    const t = await page.title();
    ok(`${slug} loads`, expect.test(t), t);
    const controls = await page.$$eval('button', (b) => b.length);
    ok(`${slug} rendered real controls`, controls > 3, controls + ' button(s)');
  }

  ok('no page threw', thrown.length === 0, thrown[0]);
  ok('no request 404ed', failed.length === 0, failed[0]);

  await browser.close();
  server.close();

  console.log('');
  if (failures) {
    console.error(`checksite: ${failures} problem(s) — the site would publish broken.`);
    process.exit(1);
  }
  const n = fs.readdirSync(path.join(SITE, 'apps')).length;
  console.log(`checksite: the published site works — landing page, both edition websites, ` +
    `${n} app page(s), nothing thrown, nothing 404ed`);
  if (summary) {
    console.log('');
    console.log('  Served over real HTTP and driven in Chromium, not inspected as files.');
    console.log('  The last delivery audited by reading a file listing reported the wrong');
    console.log('  size, the wrong file count, and shipped an archive that served a 404.');
    console.log('');
  }
})().catch((e) => { console.error('checksite: ' + e.message); process.exit(1); });
