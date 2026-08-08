/* ═══════════ the offline single file, opened the way you open it ═══════════

   Vastrangam_AI_Engine.html is your fallback: one file, double-clicked, no server, no
   installation, works on a laptop with the wifi off. Both it and the app are built from the
   same modules in brand/suite/aiengine, so a fix meant for one lands in both — and so can a
   break. This opens the real file from disk, blocks every http request at the browser so a
   sneaked-in CDN tag cannot hide, and checks it still stands on its own.

       npm run test:file        (npm run verify runs it too)
*/

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
const REPO = path.join(HERE, '..', '..');
const FILE = path.join(REPO, 'Vastrangam_AI_Engine.html');
const SRC = path.join(REPO, 'brand', 'suite', 'aiengine');

const results = [];
const ok = (name, pass, note = '') => {
  results.push({ name, pass, note: String(note).slice(0, 150) });
  console.log('   ' + (pass ? ' ok ' : 'FAIL') + '  ' + name + (note ? '  · ' + String(note).slice(0, 110) : ''));
};

async function main() {
  console.log('\n  Vastrangam AI Engine — the offline single file');
  console.log('  ' + '─'.repeat(58) + '\n');

  /* rebuild it from the same modules the app uses, so this can never test a stale copy */
  const b = spawnSync(process.execPath, [path.join(SRC, 'assemble.js')], { encoding: 'utf8' });
  ok('the file rebuilds from the shared modules', b.status === 0, (b.stdout || b.stderr || '').trim().slice(0, 90));
  ok('the file exists', fs.existsSync(FILE),
    fs.existsSync(FILE) ? Math.round(fs.statSync(FILE).size / 1024) + ' KB' : FILE);

  /* No key may ever be baked into this file — it is the check that matters most here,
     because this file gets shared.

     A whole key, not a prefix: the app's own self-tests build fake keys by concatenation
     ('AIzaSy' + 'a'.repeat(33)) to check the shape-validator, so only the six-letter prefix
     appears as a literal. Matching that would fail forever for no reason, and a check that
     cries wolf is a check that gets ignored. Google's keys are AIzaSy + 33, or AQ. + ~35;
     either at full length, contiguous, is a real key and must not be here. */
  const text = fs.readFileSync(FILE, 'utf8');
  const found = text.match(/AIzaSy[A-Za-z0-9_-]{30,}|AQ\.[A-Za-z0-9_-]{25,}/);
  ok('no API key is baked into the file', !found,
    found ? 'FOUND ' + found[0].slice(0, 10) + '… — remove it before sharing this file'
          : 'nothing that looks like a key');
  ok('nothing loads from another site', !/<(script|link)\b[^>]*(src|href)="https?:/i.test(text), 'no remote tags');

  const { chromium } = await playwright();
  const browser = await chromium.launch(
    process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {});
  const page = await (await browser.newContext()).newPage();

  const errors = [], external = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  /* block at the browser, not just by reading the source — anything built at runtime is
     caught here too */
  await page.route(u => /^https?:/i.test(u.toString()), r => {
    external.push(r.request().url()); r.abort();
  });

  try {
    await page.goto('file://' + FILE, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction('window.VA && VA.selftest', null, { timeout: 30000 });

    const st = await page.evaluate(() => VA.runTests());
    ok('its self-tests pass', st.fail === 0, st.pass + ' / ' + (st.pass + st.fail) +
      (st.fail ? ' — failing: ' + st.log.filter(l => !l.ok).map(l => l.name).join('; ') : ''));

    const alone = await page.evaluate(() => ({
      server: typeof window.VASERVER,
      store: (window.VStore && VStore.url) ? 'server' : 'in the browser',
      screens: Object.keys(VA.views).length
    }));
    ok('it does not expect a server', alone.server === 'undefined', 'VASERVER is ' + alone.server);
    ok('it keeps photographs in the browser, as it must', alone.store === 'in the browser', alone.store);
    ok('every screen is there', alone.screens >= 15, alone.screens + ' screens');

    /* the Image Studio, from an inlined document rather than a URL */
    await page.evaluate(() => VA.go('img'));
    await page.waitForTimeout(2500);
    const frame = await page.evaluate(() => {
      const f = document.getElementById('stuframe');
      return { src: (f && f.src) || '', srcdoc: (f && f.srcdoc) || '' };
    });
    ok('the Image Studio loads from the file itself', /^blob:/.test(frame.src),
      frame.src.slice(0, 32) || frame.srcdoc.slice(0, 60));

    /* and it says the truth about MP4 rather than offering a button that cannot work */
    await page.evaluate(() => VA.go('vid'));
    await page.waitForTimeout(600);
    const mp4 = await page.evaluate(() => {
      const btn = !!document.querySelector('[data-act="vidmp4"]');
      const w = [].slice.call(document.querySelectorAll('#main .warn')).map(e => e.innerText).join(' ');
      return { btn, w: w.replace(/\s+/g, ' ') };
    });
    ok('MP4 is not offered where it cannot work', mp4.btn === false, 'no MP4 button');
    ok('and it explains why, and where MP4 is', /no browser can encode H\.264/i.test(mp4.w) && /app/i.test(mp4.w),
      mp4.w.slice(0, 90));

    ok('it made no request to the internet', external.length === 0, external.slice(0, 3).join(' '));
    ok('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  } catch (e) {
    ok('the run completed without throwing', false, String(e.stack || e.message).slice(0, 300));
  }

  await browser.close();

  const pad = Math.max(...results.map(r => r.name.length));
  console.log('\n  ' + '─'.repeat(58));
  results.forEach(r => console.log('  ' + (r.pass ? '  ok  ' : ' FAIL ') + r.name.padEnd(pad + 2) + (r.note ? '· ' + r.note : '')));
  const failed = results.filter(r => !r.pass);
  console.log('  ' + '─'.repeat(58));
  console.log('  ' + (results.length - failed.length) + ' / ' + results.length + ' passed' +
    (failed.length ? '  —  ' + failed.length + ' FAILED' : ''));
  console.log('');
  process.exit(failed.length ? 1 : 0);
}

main();
