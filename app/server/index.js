/* ═══════════ Vastrangam AI Engine — the server ═══════════

   Start it with  npm start  (or double-click start-vastrangam.bat on Windows) and open
   http://localhost:3000

   What the server is for, in order of how much it matters:

   1. Your Gemini key stops living in the browser. It sits in .env on the machine running
      this and is never sent to the page.
   2. Your work stops living in one browser. It is a file on disk now, or a row in Supabase
      when you connect one — the same catalogue on your laptop and your phone.
   3. Photos read several at a time instead of one, so a thirty-photo catalogue is a minute.
   4. Real MP4, through ffmpeg, at the size your Canva reels use. A browser cannot do this. */

/* FIRST — it fills process.env, and store.js reads it the moment it is imported */
import './env.js';

import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as store from './store.js';
import * as ai from './ai.js';
import * as video from './video.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.join(HERE, '..', 'web');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const STARTED = new Date().toISOString();

app.use(express.json({ limit: '64mb' }));
app.use(express.urlencoded({ extended: true, limit: '64mb' }));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 40 * 1024 * 1024 } });

/* Nothing under /api is ever cached.

   Without this the browser is free to cache a GET with no cache headers, and it does: after
   a restart the app was still being handed the OLD /api/health, so a key that had just been
   removed still looked present. The same trap applies to /api/doc, which would quietly serve
   yesterday's catalogue. Images are the exception and set their own header. */
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
});

/* one shared password, and only when you have set one. On your own machine you have not,
   and being asked to log in to your own laptop is friction with no benefit. */
app.use((req, res, next) => {
  const pw = process.env.APP_PASSWORD;
  if (!pw || req.path === '/api/health' || !req.path.startsWith('/api/')) return next();
  if (req.get('x-va-pass') === pw) return next();
  res.status(401).json({ error: 'This app is password-protected. Enter the password in the app.' });
});

/* ── health: the first thing to check when something looks wrong ─────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    version: '4.0.0',
    /* which process is answering. Worth a line: a stale server left listening on the port
       will happily answer as if it were the one you just started, and every symptom after
       that points somewhere else entirely. */
    pid: process.pid,
    startedAt: STARTED,
    storage: store.backend,
    gemini: process.env.GEMINI_API_KEY ? 'key set on the server' : 'no server key — the app will ask for one',
    mp4: video.available() ? 'ready' : 'off',
    mp4Note: video.whyNot(),
    ...store.stats()
  });
});

/* ── the workspace: the same object the browser has always used ──────────────────────── */
app.get('/api/doc', async (req, res) => {
  try { res.json({ doc: await store.loadDoc() }); }
  catch (e) { res.status(500).json({ error: String(e.message) }); }
});
app.put('/api/doc', async (req, res) => {
  try { res.json(await store.saveDoc(req.body?.doc ?? {})); }
  catch (e) { res.status(500).json({ error: String(e.message) }); }
});

/* ── photographs ─────────────────────────────────────────────────────────────────────── */
app.put('/api/image/:key', upload.single('file'), async (req, res) => {
  try {
    const buf = req.file ? req.file.buffer
      : Buffer.from(String(req.body?.dataURL || '').split(',')[1] || '', 'base64');
    if (!buf.length) return res.status(400).json({ error: 'empty image' });
    await store.putImage(req.params.key, buf, req.file?.mimetype || 'image/jpeg');
    res.json({ ok: true, bytes: buf.length });
  } catch (e) { res.status(500).json({ error: String(e.message) }); }
});
app.get('/api/image/:key', async (req, res) => {
  try {
    const buf = await store.getImage(req.params.key);
    if (!buf) return res.status(404).end();
    res.set('Content-Type', 'image/jpeg').set('Cache-Control', 'private, max-age=86400').send(buf);
  } catch (e) { res.status(500).json({ error: String(e.message) }); }
});
app.delete('/api/image/:key', async (req, res) => {
  try { res.json(await store.delImage(req.params.key)); }
  catch (e) { res.status(500).json({ error: String(e.message) }); }
});

/* ── the model, proxied ──────────────────────────────────────────────────────────────── */
function needKey(req, res) {
  const k = ai.keyFrom(req);
  if (!k) { res.status(400).json({ error: 'No Gemini key. Put one in .env as GEMINI_API_KEY, or enter it in the app.' }); return null; }
  return k;
}
app.get('/api/ai/models', async (req, res) => {
  const k = needKey(req, res); if (!k) return;
  try { res.json(await ai.models(k)); }
  catch (e) { res.status(502).json({ error: String(e.message) }); }
});
app.post('/api/ai/vision', async (req, res) => {
  const k = needKey(req, res); if (!k) return;
  try {
    const { dataURL, prompt, schema } = req.body || {};
    const mime = (String(dataURL).match(/^data:([^;,]+)/) || [])[1] || 'image/jpeg';
    const b64 = String(dataURL).replace(/^data:[^,]*,/, '');
    res.json(await ai.vision(k, b64, mime, prompt, schema));
  } catch (e) { res.status(502).json({ error: String(e.message) }); }
});
app.post('/api/ai/json', async (req, res) => {
  const k = needKey(req, res); if (!k) return;
  try { res.json(await ai.json(k, req.body?.prompt, req.body?.schema, req.body?.opts)); }
  catch (e) { res.status(502).json({ error: String(e.message) }); }
});
app.post('/api/ai/research', async (req, res) => {
  const k = needKey(req, res); if (!k) return;
  try { res.json(await ai.research(k, req.body?.query, req.body?.opts)); }
  catch (e) { res.status(502).json({ error: String(e.message) }); }
});
app.get('/api/ai/pace', (req, res) => res.json(ai.pace()));

/* ── MP4 ─────────────────────────────────────────────────────────────────────────────── */
app.get('/api/video/presets', (req, res) => {
  res.json({ available: video.available(), why: video.whyNot(), presets: video.PRESETS });
});
const toBuf = (f) => Buffer.from(String(f).replace(/^data:[^,]*,/, ''), 'base64');

/* the one-shot form — fine for a short reel, and what the self-test uses */
app.post('/api/video/mp4', async (req, res) => {
  try {
    const { frames = [], preset = 'reel', fps, ext = 'png' } = req.body || {};
    if (!frames.length) return res.status(400).json({ error: 'No frames sent.' });
    const r = await video.encode({ frames: frames.map(toBuf), preset, fps, ext });
    sendMp4(res, r, preset);
  } catch (e) { res.status(500).json({ error: String(e.message) }); }
});

/* the streamed form — the browser draws frames and posts them in batches, so a two-minute
   reel costs the same memory as a two-second one on both sides */
app.post('/api/video/job', (req, res) => {
  if (!video.available()) return res.status(503).json({ error: video.whyNot() });
  try { res.json({ ok: true, job: video.newJob(req.body?.ext || 'jpg').id }); }
  catch (e) { res.status(500).json({ error: String(e.message) }); }
});
app.post('/api/video/job/:id/frames', (req, res) => {
  try {
    const { frames = [], start = 0 } = req.body || {};
    if (!frames.length) return res.status(400).json({ error: 'No frames in this batch.' });
    res.json({ ok: true, total: video.addFrames(req.params.id, frames.map(toBuf), Number(start) || 0) });
  } catch (e) { res.status(400).json({ error: String(e.message) }); }
});
app.post('/api/video/job/:id/encode', async (req, res) => {
  try {
    const { preset = 'reel', fps } = req.body || {};
    const r = await video.encodeJob(req.params.id, { preset, fps });
    sendMp4(res, r, preset);
  } catch (e) {
    video.dropJob(req.params.id);
    res.status(500).json({ error: String(e.message) });
  }
});
app.delete('/api/video/job/:id', (req, res) => { video.dropJob(req.params.id); res.json({ ok: true }); });

function sendMp4(res, r, preset) {
  const size = fs.statSync(r.file).size;
  res.set('Content-Type', 'video/mp4')
     .set('Content-Length', String(size))
     .set('X-Va-Frames', String(r.frames || 0))
     .set('X-Va-Size', r.preset.w + 'x' + r.preset.h)
     .set('Content-Disposition',
       `attachment; filename="vastrangam-${preset}-${r.preset.w}x${r.preset.h}.mp4"`);
  const s = fs.createReadStream(r.file);
  s.pipe(res);
  const done = () => { if (r.id) video.dropJob(r.id); else video.cleanup(r.dir); };
  s.on('end', done);
  res.on('close', done);
}

/* ── the app itself ──────────────────────────────────────────────────────────────────── */
app.use(express.static(WEB, { maxAge: '1h', index: 'index.html' }));
app.get('*', (req, res) => res.sendFile(path.join(WEB, 'index.html')));

const listener = app.listen(PORT, () => {
  const line = (s) => console.log('  ' + s);
  console.log('');
  console.log('  Vastrangam AI Engine');
  line('─'.repeat(52));
  line('open        http://localhost:' + PORT);
  line('storage     ' + store.backend);
  line('gemini      ' + (process.env.GEMINI_API_KEY ? 'key set on the server' : 'not set — the app will ask'));
  line('mp4         ' + (video.available() ? 'ready' : 'off · ' + video.whyNot()));
  line('─'.repeat(52));
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});

/* "EADDRINUSE" and a stack trace tells you nothing. This does. */
listener.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error('');
    console.error('  The Vastrangam AI Engine is already running on port ' + PORT + '.');
    console.error('');
    console.error('  Open http://localhost:' + PORT + ' — it is already there.');
    console.error('  If you think it is not, close the other window, or start this one on a');
    console.error('  different port:   set PORT=3001   and run it again.');
    console.error('');
    process.exit(1);
  }
  throw e;
});
