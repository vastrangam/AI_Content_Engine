'use strict';
/* SCREENSHOTS OF THE PRODUCT SCREENS, one per module.

   WHY THESE ARE REAL RENDERS AND NOT DRAWINGS
   The markdown documents had no pictures at all, so they explained the software in prose and
   asked the reader to imagine it. The styled website already showed 46 screens — but only
   because build.js drew them, and build.js exports nothing.

   So this renders the SAME markup (brand/site/uishot.js) with the SAME stylesheet
   (brand/site/site.css) in a real browser and photographs the result. A screenshot in a PDF
   therefore cannot show something the website does not: there is one renderer and one
   stylesheet, and if either changes, these change with it on the next run.

   The figures on the screens are illustrative — the same representative data the website
   carries, labelled as such wherever they appear. No screen here is a photograph of a live
   customer system, and nothing claims to be.

   Run:  node brand/delivery/website/mkshots.js            → MEDHAVA screens
         node brand/delivery/website/mkshots.js vastrangam → the trade edition's own screens

   The Vastrangam side is wired but nothing consumes it yet; it exists so switching that
   edition on later is a flag rather than a second program.
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

/* Resolved the same way build.js resolves it. An absolute path into a scratchpad — which is
   what brand/suite/deep/shot.js still hardcodes — is ephemeral and dies in a fresh clone. */
const { chromium } = (() => {
  const candidates = [
    process.env.PW_CORE,
    path.join(ROOT, 'app', 'node_modules', 'playwright-core'),
    'playwright-core',
    'playwright',
  ].filter(Boolean);
  for (const c of candidates) {
    try { return require(c); } catch (_) { /* try the next one */ }
  }
  throw new Error('playwright-core not found — set PW_CORE to its folder');
})();

const CHROME = require(path.join(ROOT, 'brand/suite/chrome.js')).chromePath();

const { oneShot } = require(path.join(SITE, 'uishot.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const BASE_SHOTS = require(path.join(SITE, 'shots.js'));

const VAS = process.argv[2] === 'vastrangam';
const ED = VAS ? require(path.join(SITE, 'edition_vastrangam.js')) : null;
/* Same merge build.js does. Note the fall-through: a module the edition does not override
   keeps the neutral screen, which is deliberate there and harmless here. */
const SHOTS = ED ? Object.assign({}, BASE_SHOTS, ED.shots || {}) : BASE_SHOTS;

const OUTDIR = path.join(__dirname, VAS ? 'VASTRANGAM_BOS' : 'MEDHAVA_BOS', 'shots');

/* One screen per module: the FIRST one. Modules that carry several carry them to make the
   side-by-side sector argument on the website, and that argument needs the website's layout
   to land — in a document, one screen per module is the readable choice. */
const first = (raw) => (Array.isArray(raw) ? raw[0] : raw);

const CSS = fs.readFileSync(path.join(SITE, 'site.css'), 'utf8');

/* Every screen on one page, photographed element by element. Twenty-two page loads would
   take twenty-two times as long and prove nothing extra. */
function pageHtml(items) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${CSS}
html,body{background:var(--paper);margin:0;padding:0}
.wrapshot{width:900px;padding:20px;background:var(--paper);box-sizing:border-box}
.wrapshot .shotcap{display:flex;align-items:center;gap:7px;margin:0 0 9px 2px;
  font-size:12.5px;font-weight:650;color:var(--mut);letter-spacing:-.01em}
.wrapshot .shotdot{width:7px;height:7px;border-radius:50%;background:var(--teal);flex:0 0 7px}
</style></head><body>
${items.map((it) => `<div class="wrapshot" id="${it.id}">
  ${it.sector ? `<div class="shotcap"><span class="shotdot"></span>${it.sector}</div>` : ''}
  ${oneShot(it.s)}
</div>`).join('\n')}
</body></html>`;
}

(async () => {
  const items = MODULES.map((m) => {
    const s = first(SHOTS[m.n]);
    if (!s) return null;
    return { id: 'm' + m.n, n: m.n, name: m.name, sector: s.sector || '', s, title: s.t };
  }).filter(Boolean);

  const missing = MODULES.filter((m) => !SHOTS[m.n]).map((m) => m.n);
  if (missing.length) {
    /* Loud rather than a quiet gap: a module with no picture is the one a reader assumes
       does not exist, and the document would simply be missing an image with no explanation. */
    console.error(`mkshots: no screen defined for module(s) ${missing.join(', ')} — ` +
      `add one to brand/site/shots.js rather than shipping a document with a hole in it`);
    process.exit(1);
  }

  fs.mkdirSync(OUTDIR, { recursive: true });

  const html = pageHtml(items);
  const tmp = path.join(OUTDIR, '_render.html');
  fs.writeFileSync(tmp, html);

  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage({
    viewport: { width: 1000, height: 1200 },
    deviceScaleFactor: 2,          // sharp when the PDF scales it down
  });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

  await page.goto('file://' + tmp, { waitUntil: 'load' });

  const written = [];
  for (const it of items) {
    const out = path.join(OUTDIR, it.id + '.png');
    await page.locator('#' + it.id).screenshot({ path: out });
    const kb = Math.round(fs.statSync(out).size / 1024);
    written.push({ id: it.id, kb, title: it.title, sector: it.sector });
  }
  await browser.close();
  fs.unlinkSync(tmp);

  if (errs.length) {
    console.error('mkshots: the render page raised errors:\n  ' + errs.join('\n  '));
    process.exit(1);
  }

  /* A blank or near-blank PNG still writes successfully and still embeds successfully, and
     the only place it shows up is the finished document. Catch it here. */
  const thin = written.filter((w) => w.kb < 8);
  if (thin.length) {
    console.error('mkshots: these came out too small to be a real screen — ' +
      thin.map((t) => `${t.id} (${t.kb}KB)`).join(', '));
    process.exit(1);
  }

  const total = written.reduce((s, w) => s + w.kb, 0);
  console.log(`${path.relative(ROOT, OUTDIR)}: ${written.length} screens · ` +
    `${total}KB total · ${VAS ? 'VASTRANGAM' : 'MEDHAVA'}`);
  written.forEach((w) => console.log(
    `  ${w.id}  ${String(w.kb).padStart(4)}KB  ${w.sector ? '[' + w.sector + '] ' : ''}${w.title}`));
})();
