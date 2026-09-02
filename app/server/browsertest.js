/* ═══════════ npm run test:browser — drive the real app in a real browser ═══════════

   The self-test proves the server answers. This proves the APP works: it opens Chromium at
   the running server, clicks through the screens the way you would, and checks the things
   that have actually broken before.

   In particular it checks the four things I got wrong writing this app blind:
     · photographs land on the server, not in the browser's IndexedDB
     · the Image Studio frame really loads its document
     · a key in .env means the app stops asking for one
     · MP4 exports, and what comes back is H.264 at the size that was asked for

   and the one thing the single file could never do at all:
     · stop the server, start it again, reload — the work is still there.

       npm run test:browser        (npm run verify runs it three times)
*/

import './env.js';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { ffmpegPath } from './video.js';

/* Playwright is not a dependency of this app.

   It is a browser-automation tool that weighs a couple of hundred megabytes once its
   Chromium is downloaded, and the person running the Vastrangam app has no use for it —
   `npm test` covers the server without it. So it is asked for only when a browser test is
   actually run, and if it is not there this says exactly what to type. */
async function playwright() {
  try { return await import('playwright'); }
  catch {
    console.log('\n  This test drives a real browser, and Playwright is not installed.');
    console.log('  It is not part of the app — only of testing it. To install it, once:\n');
    console.log('      npm install --no-save playwright');
    console.log('      npx playwright install chromium\n');
    console.log('  Then run this again. (npm test needs none of this.)\n');
    process.exit(2);
  }
}


const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.TEST_PORT || 3988);
const BASE = 'http://127.0.0.1:' + PORT;
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'va-browsertest-'));
const DL = path.join(DATA, 'downloads');
fs.mkdirSync(DL, { recursive: true });

const results = [];
const ok = (name, pass, note = '') => {
  results.push({ name, pass, note: String(note).slice(0, 150) });
  /* printed as it happens, not only at the end — a run that hangs should still say how
     far it got, which is exactly what the first version of this file failed to do */
  console.log('   ' + (pass ? ' ok ' : 'FAIL') + '  ' + name + (note ? '  · ' + String(note).slice(0, 110) : ''));
};
const stage = (s) => console.log('  … ' + s);

/* Anything that can wait forever gets a deadline and a name, so a stall says which step
   stalled instead of the whole run just stopping. */
function within(ms, label, p) {
  return Promise.race([
    Promise.resolve(p),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after ' + ms + 'ms: ' + label)), ms))
  ]);
}

/* ── a real photograph, named the way Vastrangam names them ─────────────────────────── */
function png(w, h, rgb) {
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    const row = y * (1 + w * 3);
    for (let x = 0; x < w; x++) {
      raw[row + 1 + x * 3] = (rgb[0] + x) & 255;
      raw[row + 2 + x * 3] = (rgb[1] + y) & 255;
      raw[row + 3 + x * 3] = rgb[2];
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))
  ]);
}
let CRC_T = null;
function crc32(buf) {
  if (!CRC_T) {
    CRC_T = new Int32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC_T[n] = c; }
  }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

const SHOTS = [
  { name: 'VICHITRA_KASAB_WINE_front.png', rgb: [120, 20, 50] },
  { name: 'VICHITRA_KASAB_WINE_back.png', rgb: [110, 25, 55] },
  { name: 'VICHITRA_KASAB_ROYAL_BLUE_front.png', rgb: [30, 40, 130] }
];

/* The key phase is deliberately separate and short.

   With a key set, every catalogue upload calls Gemini — and with a FAKE key it calls,
   fails, backs off and retries, which turns a two-minute test into a twenty-minute one
   that looks like a hang. So the key is only present for the one check that needs it;
   everything else runs the way the app runs before you have entered a key, which is a
   path worth proving anyway. */
function startServer({ key = '' } = {}) {
  const s = spawn(process.execPath, [path.join(HERE, 'index.js')], {
    env: { ...process.env, PORT: String(PORT), DATA_DIR: DATA, APP_PASSWORD: '', GEMINI_API_KEY: key },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  s.stdout.on('data', () => {}); s.stderr.on('data', () => {});
  children.add(s);
  s.once('exit', () => children.delete(s));
  return s;
}
/* Wait for OUR server, identified by pid.

   A stale server left listening on this port from an earlier run will answer /api/health
   perfectly happily — with its own data folder and its own key. That is exactly what
   happened here, and it made four unrelated checks fail for a reason that was nowhere
   near them. Matching the pid makes that impossible to mistake again. */
async function waitUp(proc) {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(BASE + '/api/health');
      if (r.ok) {
        const h = await r.json();
        if (!proc || h.pid === proc.pid) return true;
        if (proc.exitCode !== null) {
          throw new Error('port ' + PORT + ' is held by another process (pid ' + h.pid +
            '). Stop it and run this again.');
        }
      }
    } catch (e) {
      if (/held by another process/.test(e.message)) throw e;
    }
    await new Promise(r => setTimeout(r, 250));
  }
  return false;
}

/* nothing this test starts may outlive it — a leaked server is what caused the confusion
   above, and an exit handler is cheaper than finding it again */
const children = new Set();
function reap() { for (const c of children) { try { c.kill('SIGKILL'); } catch { /* gone */ } } }
process.on('exit', reap);
['SIGINT', 'SIGTERM'].forEach(sig => process.on(sig, () => { reap(); process.exit(1); }));
async function waitDown(proc) {
  if (proc.exitCode !== null || proc.signalCode !== null) return true;
  const exited = new Promise(r => proc.once('exit', r));
  proc.kill('SIGTERM');
  /* a server that will not go quietly gets ten seconds and then SIGKILL — waiting forever
     for a stuck process is how a test turns into a hang with nothing to show for it */
  const gone = await Promise.race([
    exited.then(() => true),
    new Promise(r => setTimeout(() => r(false), 10000))
  ]);
  if (!gone) { proc.kill('SIGKILL'); await exited; }
  for (let i = 0; i < 40; i++) {
    try { await fetch(BASE + '/api/health'); } catch { return true; }
    await new Promise(r => setTimeout(r, 150));
  }
  return false;
}

async function main() {
  console.log('\n  Vastrangam AI Engine — browser test');
  console.log('  ' + '─'.repeat(58));
  console.log('  data folder  ' + DATA);
  console.log('  url          ' + BASE + '\n');

  spawnSync(process.execPath, [path.join(HERE, '..', 'build.cjs')], { stdio: 'ignore' });

  let server = startServer({ key: 'TEST_KEY_NOT_A_REAL_ONE' });
  ok('server is up, and it is the one this test started', await waitUp(server));

  /* PW_CHROME lets a machine point at a Chromium it already has, rather than downloading
     another copy. Without it Playwright uses the one it manages itself. */
  const { chromium } = await playwright();
  const browser = await chromium.launch(
    process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {});
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 }, acceptDownloads: true });
  const page = await ctx.newPage();

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  try {
    stage('opening the app');
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction('window.VA && VA.selftest', null, { timeout: 20000 });
    await page.waitForFunction('window.__VA_HEALTH', null, { timeout: 15000 }).catch(() => {});

    /* ── 1 · the app's own self-tests, run inside the app ────────────────────────────── */
    const st = await page.evaluate(() => VA.runTests());
    ok('the app self-tests pass', st.fail === 0, st.pass + ' / ' + (st.pass + st.fail) +
      (st.fail ? ' — failing: ' + st.log.filter(l => !l.ok).map(l => l.name).join('; ') : ''));

    /* ── 2 · a key in .env means the app stops asking ────────────────────────────────── */
    const keyState = await page.evaluate(() => ({
      flag: !!window.__VA_SERVER_KEY,
      health: (window.__VA_HEALTH || {}).gemini || '',
      getKey: (window.VAI && VAI.getKey) ? VAI.getKey('gemini') : ''
    }));
    ok('the server key is recognised', keyState.flag === true, keyState.health);
    ok('VAI reports it has a key', !!keyState.getKey, 'getKey → ' + keyState.getKey);

    /* the key has done its job — take it away, so the rest of the run does not spend
       minutes calling Google with a key that was never real */
    stage('stopping the server to take the key back out');
    ok('the server stops on request', await within(20000, 'stop the server', waitDown(server)));
    server = startServer({ key: '' });
    ok('and starts again without a key', await within(30000, 'restart the server', waitUp(server)));
    stage('reloading the app');
    await within(40000, 'reload after restart', page.goto(BASE, { waitUntil: 'domcontentloaded' }));
    await page.waitForFunction('window.VA && VA.selftest', null, { timeout: 20000 });
    await page.waitForFunction('window.__VA_HEALTH', null, { timeout: 15000 }).catch(() => {});
    const noKey = await page.evaluate(() => ({
      flag: !!window.__VA_SERVER_KEY,
      health: (window.__VA_HEALTH || {}).gemini || '(health never arrived)'
    }));
    ok('with no key in .env the app knows to ask', noKey.flag === false, noKey.health);
    /* the phase above ran with a key that was never real, so Google refusing it is the
       expected outcome, not a defect. Console errors are counted from here on. */
    errors.length = 0;

    /* ── 3 · the workspace is the server's, not localStorage's ───────────────────────── */
    const wired = await page.evaluate(() => ({
      doc: typeof window.VADOC === 'object',
      store: !!(window.VStore && VStore.url),          /* only the server VStore has url() */
      ai: !!(window.VAI && VAI.pace && VAI.pace().server)
    }));
    ok('the workspace is wired to the server', wired.doc);
    ok('the image store is the server one, not IndexedDB', wired.store,
      wired.store ? 'VStore.url() exists' : '05_store.js won the load order again');
    ok('the model calls go through the server', wired.ai);

    stage('uploading photographs');
    /* ── 4 · upload photographs the way you would ────────────────────────────────────── */
    await page.evaluate(() => VA.go('cat'));
    await page.waitForSelector('#catfile', { state: 'attached' });
    const wasThere = await page.evaluate(() => (VA.DB.catalogue || []).length);

    const files = SHOTS.map(s => ({ name: s.name, mimeType: 'image/png', buffer: png(240, 360, s.rgb) }));
    await page.setInputFiles('#catfile', files);

    /* every row has been read (or, with no key, tagged from its filename) */
    await page.waitForFunction(
      () => (VA.DB.catPending || []).length === 3 &&
        (VA.DB.catPending || []).every(r => r.status !== 'queued' && r.status !== 'reading'),
      null, { timeout: 60000 }
    ).catch(() => {});
    const pending = await page.evaluate(() => (VA.DB.catPending || []).map(r => r.status + ':' + (r.colour || '?')));
    ok('all three photographs are read', pending.length === 3 && !pending.some(s => /^(queued|reading)/.test(s)),
      pending.join(' · '));

    /* then the grouping, from the button you would press */
    await page.click('[data-act="catconfirm"]');
    await page.waitForFunction((n) => (VA.DB.catalogue || []).length > n, wasThere, { timeout: 15000 }).catch(() => {});

    const cat = await page.evaluate((n) => {
      const added = (VA.DB.catalogue || []).slice(n);
      return {
        products: added.length,
        shots: added.reduce((a, p) => a + p.variants.reduce((m, v) => m + v.shots.filter(s => s.key).length, 0), 0),
        colours: added.reduce((a, p) => a.concat(p.variants.map(v => v.colour)), [])
      };
    }, wasThere);
    ok('three photographs land in the catalogue', cat.shots === 3, cat.shots + ' shots · ' + cat.products + ' product(s)');
    ok('the two colours group under one design',
      cat.products === 1 && cat.colours.length === 2,
      cat.products + ' product · colours: ' + cat.colours.join(', '));

    /* the whole point: the bytes are on the server. Uploading three photographs is three
       requests, so poll for them rather than guessing at a sleep. */
    const imgDir = path.join(DATA, 'images');
    let onDisk = [];
    for (let i = 0; i < 60; i++) {
      onDisk = fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : [];
      if (onDisk.length >= 3) break;
      await page.waitForTimeout(500);
    }
    ok('the photographs are files on the server, not in the browser',
      onDisk.length >= 3, onDisk.length + ' file(s) in ' + imgDir);

    const idb = await page.evaluate(async () => {
      if (!window.indexedDB || !indexedDB.databases) return -1;
      const dbs = await indexedDB.databases();
      return dbs.filter(d => /vastrangam_ai_images/.test(d.name || '')).length;
    });
    ok('nothing was written to IndexedDB', idb === 0, idb < 0 ? 'this browser cannot list them' : idb + ' image database(s)');

    stage('opening the Image Studio');
    /* ── 5 · the Image Studio frame really loads ─────────────────────────────────────── */
    await page.evaluate(() => VA.go('img'));
    await page.waitForSelector('#stuframe', { timeout: 15000 });
    const frameSrc = await page.getAttribute('#stuframe', 'src');
    ok('the studio frame points at a real page', frameSrc === '/studio.html', frameSrc);

    const stu = page.frame({ url: u => /studio\.html/.test(u.toString()) });
    ok('the studio document is reachable from the app', !!stu, stu ? 'same-origin' : 'no frame');
    if (stu) {
      await stu.waitForLoadState('domcontentloaded');
      await stu.waitForFunction('document.body && document.body.children.length > 3', null, { timeout: 15000 }).catch(() => {});
      const inside = await stu.evaluate(() => ({
        title: document.title,
        nodes: document.body.querySelectorAll('*').length,
        text: (document.body.innerText || '').slice(0, 60)
      }));
      ok('the studio rendered its own interface', inside.nodes > 100, inside.nodes + ' elements · ' + inside.title);
      ok('the studio is not the "not bundled" placeholder', !/not bundled/i.test(inside.text), inside.text.replace(/\n/g, ' '));
    }

    stage('walking the AI Studio tabs');
    /* ── 6 · the AI Studio: three tabs, in place, no redirect ────────────────────────── */
    await page.evaluate((n) => {
      /* work on the garment we just uploaded, not whichever one happened to be first */
      const added = (VA.DB.catalogue || []).slice(n)[0];
      VA.go('studio');
      if (added) { VA.DB.studio.product = added.id; VA.render(); }
    }, wasThere);
    await page.waitForTimeout(400);
    for (const tab of ['content', 'images', 'video', 'content']) {
      await page.evaluate((t) => { VA.DB.studio.tab = t; VA.render(); }, tab);
      await page.waitForTimeout(500);
      const where = await page.evaluate(() => ({ view: VA.state.view, tab: (VA.DB.studio || {}).tab }));
      ok('AI Studio stays put on the ' + tab + ' tab',
        where.view === 'studio' && where.tab === tab, 'view=' + where.view + ' tab=' + where.tab);
    }
    /* a product with no content shows the effort buttons instead of the steps, which is
       right — so press one, the way you would, and then look */
    const needsRun = await page.evaluate(() => !!document.querySelector('[data-act="stugen"]'));
    if (needsRun) {
      stage('generating content for that product');
      const added = await page.evaluate((n) => ((VA.DB.catalogue || []).slice(n)[0] || {}).id, wasThere);
      await page.click('[data-act="stugen"][data-d="quick"]');
      /* generating opens the finished run — that is the right thing for it to do, so wait
         for the run to exist rather than for the Studio to change under us */
      await page.waitForFunction((id) => (VA.DB.runs || []).some(r => r.pack && (r.fromCat === id || r.catId === id)),
        added, { timeout: 120000 }).catch(() => {});
      /* then come back to the Studio, which is where the thirteen steps live */
      await page.evaluate((id) => {
        VA.go('studio');
        VA.DB.studio.product = id;
        VA.DB.studio.tab = 'content';
        VA.render();
      }, added);
      await page.waitForTimeout(600);
    }
    const steps = await page.evaluate(() => document.querySelectorAll('#main .step').length);
    ok('the AI Content tab lists every step', steps >= 15, steps + ' steps' + (needsRun ? ' (after generating)' : ''));

    /* ── 7 · click-to-edit really writes through ─────────────────────────────────────── */
    await page.evaluate(() => { VA.DB.studio.tab = 'content'; VA.render(); });
    await page.waitForTimeout(300);
    /* Open a step that actually holds something.

       A step with nothing written in it renders its "not written yet" line, which is
       correct and is not editable — there is nothing there to edit. The Studio marks those
       .thin, so pick one that is not. */
    await page.evaluate(() => {
      const h = document.querySelector('#main .step:not(.thin) .step-h');
      if (h) h.click();
    });
    await page.waitForTimeout(400);
    const edit = await page.evaluate(() => {
      const el = document.querySelector('#main [data-edit]');
      if (!el) return { found: false };
      return { found: true, editable: el.isContentEditable, path: el.getAttribute('data-edit') };
    });
    ok('content on screen is editable', edit.found && edit.editable,
      edit.found ? edit.path + ' · contenteditable=' + edit.editable : 'no [data-edit] on screen');

    stage('exporting an MP4');
    /* ── 8 · MP4, pressed from the interface ─────────────────────────────────────────── */
    await page.evaluate(() => VA.go('vid'));
    await page.waitForSelector('[data-act="vidmp4"]', { timeout: 15000 });
    /* a short reel — this is a test, not a render farm */
    await page.evaluate(() => { VA.VIDSTATE.dur = 2; VA.render(); });
    await page.waitForTimeout(300);
    await page.selectOption('#vidmp4preset', 'reel').catch(() => {});

    const dlPromise = page.waitForEvent('download', { timeout: 120000 });
    await page.click('[data-act="vidmp4"]');
    let mp4File = '';
    try {
      const d = await dlPromise;
      mp4File = path.join(DL, d.suggestedFilename());
      await d.saveAs(mp4File);
    } catch (e) {
      ok('MP4 downloads from the Video Studio', false, String(e.message).slice(0, 120));
    }
    if (mp4File && fs.existsSync(mp4File)) {
      const buf = fs.readFileSync(mp4File);
      ok('MP4 downloads from the Video Studio', true, path.basename(mp4File) + ' · ' + Math.round(buf.length / 1024) + ' KB');
      ok('the download is a real MP4, not a renamed WebM',
        buf.slice(4, 8).toString('ascii') === 'ftyp', JSON.stringify(buf.slice(4, 12).toString('ascii')));
      const probe = probeVideo(mp4File);
      ok('the stream is H.264 at 1080×1920', /h264/i.test(probe) && /1080x1920/.test(probe), probe || 'no probe available');
    }

    stage('restarting the server to check the work survives');
    /* ── 9 · restart the server, reload — is the work still there? ───────────────────── */
    await page.evaluate(() => (window.VADOC ? VADOC.flush() : null));
    await page.waitForTimeout(600);

    const before = await page.evaluate(() => ({
      products: (VA.DB.catalogue || []).length,
      shots: (VA.DB.catalogue || []).reduce((n, p) => n + p.variants.reduce((m, v) => m + v.shots.length, 0), 0),
      runs: (VA.DB.runs || []).length
    }));

    ok('the server stops cleanly', await within(20000, 'second stop', waitDown(server)));
    server = startServer({ key: '' });
    ok('the server starts again', await within(30000, 'second start', waitUp(server)));

    await within(40000, 'reload after the second restart', page.goto(BASE, { waitUntil: 'domcontentloaded' }));
    await page.waitForFunction('window.VA && VA.DB', null, { timeout: 20000 });
    const after = await page.evaluate(() => ({
      products: (VA.DB.catalogue || []).length,
      shots: (VA.DB.catalogue || []).reduce((n, p) => n + p.variants.reduce((m, v) => m + v.shots.length, 0), 0),
      runs: (VA.DB.runs || []).length
    }));
    ok('the catalogue survives a server restart',
      after.products === before.products && after.shots === before.shots,
      before.products + ' product / ' + before.shots + ' shots  →  ' + after.products + ' / ' + after.shots);
    ok('the content runs survive too', after.runs === before.runs, before.runs + ' → ' + after.runs);

    /* and the photographs themselves still display */
    const shown = await page.evaluate(async () => {
      const c = VA.DB.catalogue || [];
      const key = c[0] && c[0].variants[0] && c[0].variants[0].shots[0] && c[0].variants[0].shots[0].key;
      if (!key) return 'no key';
      const r = await fetch(VStore.url(key));
      return r.ok ? 'ok ' + (await r.blob()).size + ' bytes' : 'HTTP ' + r.status;
    });
    ok('a photograph still loads after the restart', /^ok /.test(shown), shown);

    /* ── 10 · nothing reaches the internet, and nothing threw ────────────────────────── */
    const external = await page.evaluate(() =>
      performance.getEntriesByType('resource').map(e => e.name).filter(n => !n.startsWith(location.origin) && !/^(data|blob):/.test(n)));
    ok('the app makes no external requests', external.length === 0, external.slice(0, 3).join(' '));
    ok('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  } catch (e) {
    ok('the run completed without throwing', false, String(e.stack || e.message).slice(0, 400));
  }

  await browser.close();
  await waitDown(server);
  /* a failed run keeps its data folder — you cannot look at what went wrong in a folder
     that has already been deleted */
  const anyFailed = results.some(r => !r.pass);
  if (!anyFailed || process.env.KEEP_DATA !== '1') {
    try { fs.rmSync(DATA, { recursive: true, force: true }); } catch { /* fine */ }
  } else console.log('\n  kept for inspection: ' + DATA);

  const pad = Math.max(...results.map(r => r.name.length));
  console.log('\n  ' + '─'.repeat(58));
  results.forEach(r => console.log('  ' + (r.pass ? '  ok  ' : ' FAIL ') + r.name.padEnd(pad + 2) + (r.note ? '· ' + r.note : '')));
  const failed = results.filter(r => !r.pass);
  console.log('  ' + '─'.repeat(58));
  console.log('  ' + (results.length - failed.length) + ' / ' + results.length + ' passed' + (failed.length ? '  —  ' + failed.length + ' FAILED' : ''));
  console.log('');
  process.exit(failed.length ? 1 : 0);
}

function probeVideo(file) {
  try {
    const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
      'stream=codec_name,width,height', '-of', 'csv=p=0', file], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) {
      const [c, w, h] = r.stdout.trim().split(',');
      return c + ' ' + w + 'x' + h;
    }
  } catch { /* fall through */ }
  const bin = ffmpegPath();
  if (!bin) return '';
  const r = spawnSync(bin, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const line = ((r.stderr || '').match(/Stream #0:0.*Video:.*/) || [''])[0];
  const codec = (line.match(/Video:\s*([a-z0-9]+)/i) || [])[1] || '';
  const dims = (line.match(/\b(\d{2,5}x\d{2,5})\b/) || [])[1] || '';
  return (codec + ' ' + dims).trim();
}

main();
