/* ═══════════ npm test — does the server actually work? ═══════════

   This starts a real server on a spare port, pointed at a throwaway data folder so your
   own catalogue is never touched, and then uses it the way the app does: saves a
   workspace, reads it back, stores a photograph, fetches it, deletes it, and encodes a
   short MP4 through ffmpeg and checks what came back really is H.264 at the right size.

   Run it any time you are not sure whether something is broken:

       npm test

   Every line prints pass or fail with a reason. It exits non-zero if anything failed, so
   it is also safe to hang automation off. */

import './env.js';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { ffmpegPath } from './video.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.TEST_PORT || 3987);
const BASE = 'http://127.0.0.1:' + PORT;
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'va-selftest-'));

const results = [];
function ok(name, pass, note = '') { results.push({ name, pass, note }); }

/* the server this test starts must never outlive it */
let server = null;
function reap() { try { server && server.kill('SIGKILL'); } catch { /* gone */ } }
process.on('exit', reap);
['SIGINT', 'SIGTERM'].forEach(sig => process.on(sig, () => { reap(); process.exit(1); }));

async function get(p, init) { return fetch(BASE + p, init); }
async function jget(p, init) {
  const r = await get(p, init);
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch { j = { error: t.slice(0, 200) }; }
  return { status: r.status, body: j, res: r };
}
const jpost = (p, body) => jget(p, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
});

/* A real PNG, built here rather than pasted as base64 — a fixture typed by hand is a
   fixture that can be quietly corrupt, and then the test fails for a reason that has
   nothing to do with the app. */
function png(w, h, rgb) {
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    const row = y * (1 + w * 3);
    raw[row] = 0;                                   /* filter: none */
    for (let x = 0; x < w; x++) {
      raw[row + 1 + x * 3] = rgb[0];
      raw[row + 2 + x * 3] = rgb[1];
      raw[row + 3 + x * 3] = rgb[2];
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32 ? zlib.crc32(body) : crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;  /* 8-bit truecolour */
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ]);
}
let CRC_T = null;
function crc32(buf) {
  if (!CRC_T) {
    CRC_T = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      CRC_T[n] = c;
    }
  }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

const TINY_PNG = png(2, 2, [180, 40, 90]);

/* One frame, at the aspect the reel actually uses so the scale filter has real work to do.
   The encoder scales whatever it gets up to the preset, which is exactly the path the app
   takes when the canvas is a different size from the chosen export. */
const FRAME = 'data:image/png;base64,' + png(108, 192, [36, 20, 54]).toString('base64');

async function main() {
  console.log('\n  Vastrangam AI Engine — server self-test');
  console.log('  ' + '─'.repeat(58));
  console.log('  data folder  ' + DATA);
  console.log('  port         ' + PORT + '\n');

  server = spawn(process.execPath, [path.join(HERE, 'index.js')], {
    env: { ...process.env, PORT: String(PORT), DATA_DIR: DATA, APP_PASSWORD: '' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let serverLog = '';
  server.stdout.on('data', d => { serverLog += d; });
  server.stderr.on('data', d => { serverLog += d; });

  /* Wait for it to answer rather than guessing at a sleep — and check the pid, because a
     stale server from an earlier run will answer this port just as convincingly while
     using a different data folder entirely. */
  let up = false, foreign = 0;
  for (let i = 0; i < 60 && !up; i++) {
    try {
      const r = await get('/api/health');
      if (r.ok) { const h = await r.json(); if (h.pid === server.pid) up = true; else foreign = h.pid; }
    } catch { /* not yet */ }
    if (!up) await new Promise(r => setTimeout(r, 250));
  }
  ok('server starts and answers /api/health', up,
    up ? 'pid ' + server.pid
       : foreign ? 'port ' + PORT + ' is held by pid ' + foreign + ' — stop it and run again'
                 : serverLog.slice(-400));

  if (up) {
    try {
      /* ── health ─────────────────────────────────────────────────────────────────── */
      const h = await jget('/api/health');
      ok('health reports a storage backend', !!h.body.storage, h.body.storage);
      ok('health reports the Gemini key state', !!h.body.gemini, h.body.gemini);
      ok('health reports MP4 state', !!h.body.mp4, h.body.mp4 + (h.body.mp4Note ? ' · ' + h.body.mp4Note.slice(0, 60) : ''));

      /* ── the workspace round-trip: the whole point of the app ────────────────────── */
      const doc = { catalogue: [{ id: 'p1', name: 'Vichitra Silk Saree' }], runs: [{ id: 'r1' }], marker: Date.now() };
      const put = await jget('/api/doc', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doc }) });
      ok('workspace saves', put.status === 200 && put.body.ok, put.body.where || put.body.error);

      const back = await jget('/api/doc');
      ok('workspace reads back identical',
        JSON.stringify(back.body.doc) === JSON.stringify(doc),
        back.body.doc ? 'marker ' + back.body.doc.marker : 'nothing came back');

      ok('the workspace is a real file on disk',
        fs.existsSync(path.join(DATA, 'workspace.json')),
        path.join(DATA, 'workspace.json'));

      /* ── photographs ────────────────────────────────────────────────────────────── */
      const key = 'selftest_shot_1';
      const put1 = await jget('/api/image/' + key, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataURL: 'data:image/png;base64,' + TINY_PNG.toString('base64') })
      });
      ok('photo uploads', put1.status === 200 && put1.body.ok, 'bytes ' + (put1.body.bytes || 0));

      const img = await get('/api/image/' + key);
      const got = Buffer.from(await img.arrayBuffer());
      ok('photo comes back byte-for-byte', img.ok && got.equals(TINY_PNG), got.length + ' bytes');

      ok('photo landed in the data folder, not the browser',
        fs.existsSync(path.join(DATA, 'images', key)),
        path.join(DATA, 'images', key));

      const del = await jget('/api/image/' + key, { method: 'DELETE' });
      const gone = await get('/api/image/' + key);
      ok('photo deletes', del.status === 200 && gone.status === 404, 'then 404');

      /* ── the model proxy, without spending a call ────────────────────────────────── */
      const noKey = await jget('/api/ai/models', { headers: { 'x-va-key': '' } });
      if (process.env.GEMINI_API_KEY) {
        ok('AI proxy uses the server key', noKey.status !== 400, 'a key is set in .env, so it tried the call');
      } else {
        ok('AI proxy asks for a key rather than failing silently',
          noKey.status === 400 && /key/i.test(noKey.body.error || ''), noKey.body.error);
      }
      const pace = await jget('/api/ai/pace');
      ok('AI pool reports its lanes', pace.body.lanes > 0, pace.body.lanes + ' lanes');

      /* ── MP4 ────────────────────────────────────────────────────────────────────── */
      const pres = await jget('/api/video/presets');
      ok('MP4 presets include a 1080×1920 reel',
        !!(pres.body.presets && pres.body.presets.reel && pres.body.presets.reel.w === 1080 && pres.body.presets.reel.h === 1920),
        Object.keys(pres.body.presets || {}).join(' · '));

      if (pres.body.available) {
        /* the batched path — the one the app actually uses */
        const job = await jpost('/api/video/job', { ext: 'png' });
        ok('a render job opens', !!job.body.job, job.body.job || job.body.error);

        const frames = Array.from({ length: 12 }, () => FRAME);
        const add = await jpost('/api/video/job/' + job.body.job + '/frames', { start: 0, frames });
        ok('frames upload in a batch', add.body.total === 12, 'server holds ' + add.body.total);

        const enc = await get('/api/video/job/' + job.body.job + '/encode', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preset: 'reel', fps: 12 })
        });
        const mp4 = Buffer.from(await enc.arrayBuffer());
        ok('encode returns something', enc.ok && mp4.length > 0, mp4.length + ' bytes · ' + (enc.headers.get('X-Va-Size') || '?'));

        /* is it REALLY an mp4, or a renamed something-else? ftyp is at byte 4 of every one */
        ok('the bytes are a real MP4 container', mp4.slice(4, 8).toString('ascii') === 'ftyp',
          JSON.stringify(mp4.slice(4, 12).toString('ascii')));

        /* and is the video stream H.264 at the size we asked for? ffprobe, not a guess */
        const out = path.join(DATA, 'selftest.mp4');
        fs.writeFileSync(out, mp4);
        const probe = ffprobe(out);
        ok('the video stream is H.264', /h264/i.test(probe), probe || 'ffprobe not available');
        ok('the video is 1080×1920', /\b1080x1920\b/.test(probe), probe.match(/\d+x\d+/)?.[0] || '?');
        ok('it starts playing before it finishes downloading (+faststart)',
          mp4.indexOf(Buffer.from('moov')) < mp4.indexOf(Buffer.from('mdat')) && mp4.indexOf(Buffer.from('moov')) > 0,
          'moov before mdat');
      } else {
        ok('MP4 is off, and says why in plain words',
          typeof pres.body.why === 'string' && pres.body.why.length > 20, pres.body.why);
      }

      /* ── the app itself is served ────────────────────────────────────────────────── */
      const idx = await get('/');
      const html = await idx.text();
      ok('the app page is served', idx.ok && /Vastrangam AI Engine/.test(html), idx.status + ' · ' + html.length + ' bytes');
      ok('the bridge loads before every module', html.indexOf('/00_bridge.js') > 0 &&
        html.indexOf('/00_bridge.js') < html.indexOf('/m/10_kernel.js'), 'bridge first');
      ok('the IndexedDB store is NOT shipped in the app', !/05_store\.js/.test(html),
        'photos go to the server');

      const stu = await get('/studio.html');
      const stuHtml = await stu.text();
      ok('the Image Studio is a real page at /studio.html',
        stu.ok && stuHtml.length > 50000, stuHtml.length + ' bytes');
      ok('the Image Studio has no calls to the internet in it',
        !/<script[^>]+src="https?:/i.test(stuHtml) && !/<link[^>]+href="https?:/i.test(stuHtml),
        'no CDN tags');
    } catch (e) {
      ok('the run completed without throwing', false, String(e.stack || e.message).slice(0, 300));
    }
  }

  server.kill('SIGKILL');
  await new Promise(r => setTimeout(r, 200));
  try { fs.rmSync(DATA, { recursive: true, force: true }); } catch { /* fine */ }

  const pad = Math.max(...results.map(r => r.name.length));
  results.forEach(r => {
    console.log('  ' + (r.pass ? '  ok  ' : ' FAIL ') + r.name.padEnd(pad + 2) + (r.note ? '· ' + r.note : ''));
  });
  const failed = results.filter(r => !r.pass);
  console.log('  ' + '─'.repeat(58));
  console.log('  ' + (results.length - failed.length) + ' / ' + results.length + ' passed' +
    (failed.length ? '  —  ' + failed.length + ' FAILED' : ''));
  console.log('');
  process.exit(failed.length ? 1 : 0);
}

/* ffprobe when it is there; otherwise ffmpeg -i, which prints the same stream line to
   stderr. ffmpeg-static ships ffmpeg but not ffprobe, so the fallback is the usual case. */
function ffprobe(file) {
  try {
    const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=codec_name,width,height', '-of', 'csv=p=0', file], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) {
      const [codec, w, h] = r.stdout.trim().split(',');
      return codec + ' ' + w + 'x' + h;
    }
  } catch { /* fall through to ffmpeg */ }

  const bin = ffmpegPath();
  if (!bin) return '';
  const r = spawnSync(bin, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const line = ((r.stderr || '').match(/Stream #0:0.*Video:.*/) || [''])[0];
  const codec = (line.match(/Video:\s*([a-z0-9]+)/i) || [])[1] || '';
  const dims = (line.match(/\b(\d{2,5}x\d{2,5})\b/) || [])[1] || '';
  return (codec + ' ' + dims).trim();
}

main();
