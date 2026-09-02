/* ═══════════ MP4, properly ═══════════

   A browser cannot encode H.264. That is why the single-file version only ever offered
   WebM and GIF, and why matching the Canva reels in the Drive folder was impossible there.

   A server can. This takes the frames the Video Studio already renders and runs ffmpeg over
   them at the format those reels use: 1080×1920 vertical, H.264 high profile, yuv420p so it
   plays everywhere including on an iPhone, and +faststart so it begins playing before it has
   finished downloading — which is what Instagram and WhatsApp want.

   If ffmpeg is not installed the app does not break: it says so plainly and keeps offering
   WebM, rather than failing silently or pretending. */

import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require_ = createRequire(import.meta.url);

/* the shape of the reels in Vastrangam's own Drive folder */
export const PRESETS = {
  reel:     { w: 1080, h: 1920, fps: 30, label: 'Instagram Reel / Shorts · 9:16' },
  story:    { w: 1080, h: 1920, fps: 30, label: 'Story · 9:16' },
  feed:     { w: 1080, h: 1350, fps: 30, label: 'Instagram feed · 4:5' },
  square:   { w: 1080, h: 1080, fps: 30, label: 'Square · 1:1' },
  youtube:  { w: 1920, h: 1080, fps: 30, label: 'YouTube · 16:9' }
};

let cached = null;
export function ffmpegPath() {
  if (cached !== null) return cached;

  /* the copy npm installed for us first — it is the one we know the version of, it is
     named ffmpeg.exe on Windows without anyone having to think about it, and it is there
     the moment `npm install` finishes. A system ffmpeg on PATH is the fallback. */
  const candidates = [];
  try { candidates.push(require_('ffmpeg-static')); } catch { /* not installed */ }
  candidates.push('ffmpeg');

  for (const c of candidates) {
    if (!c) continue;
    try {
      const r = spawnSync(c, ['-version'], { encoding: 'utf8' });
      if (r.status === 0) return (cached = c);
    } catch { /* keep looking */ }
  }
  return (cached = '');
}

export function available() {
  return !!ffmpegPath();
}

export function whyNot() {
  return available() ? '' :
    'ffmpeg is missing, so MP4 export is off. WebM, GIF and frames still work. ' +
    'To turn MP4 on: run  npm install  in this folder again (it ships ffmpeg), or on Windows ' +
    'run  winget install Gyan.FFmpeg  in PowerShell. Then restart the app.';
}

/* ── render jobs ───────────────────────────────────────────────────────────────────────
   A twenty-second reel at 1080×1920 is several hundred frames and well over a hundred
   megabytes. Posting that as one request would mean holding the whole reel in memory in
   the browser AND in the server, and it would blow past any sane body limit.

   So the browser opens a job, sends frames in small batches as it draws them, and asks
   for the encode at the end. Each frame is written to disk the moment it arrives, so the
   server's memory stays flat no matter how long the reel is. */

const jobs = new Map();
const JOB_TTL = 30 * 60 * 1000;

function sweep() {
  const now = Date.now();
  for (const [id, j] of jobs) {
    if (now - j.at > JOB_TTL) { cleanup(j.dir); jobs.delete(id); }
  }
}

export function newJob(ext = 'jpg') {
  sweep();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'va-reel-'));
  jobs.set(id, { dir, ext: /^(jpg|png)$/.test(ext) ? ext : 'jpg', n: 0, at: Date.now() });
  return { id, dir };
}

export function addFrames(id, buffers, startIndex = 0) {
  const j = jobs.get(id);
  if (!j) throw new Error('That render job has expired. Start the export again.');
  buffers.forEach((buf, k) => {
    const i = startIndex + k;
    fs.writeFileSync(path.join(j.dir, 'f' + String(i).padStart(5, '0') + '.' + j.ext), buf);
    if (i + 1 > j.n) j.n = i + 1;
  });
  j.at = Date.now();
  return j.n;
}

export function dropJob(id) {
  const j = jobs.get(id);
  if (j) { cleanup(j.dir); jobs.delete(id); }
}

/**
 * Encode a job that already has its frames on disk.
 *   id     — from newJob()
 *   preset — a key of PRESETS
 *   fps    — the rate the frames were DRAWN at; the output is forced to the preset's rate,
 *            so drawing 24 and playing 30 is fine and is what the app does
 *   audio  — optional path to an audio file laid under the video
 */
export function encodeJob(id, { preset = 'reel', fps, audio = null } = {}) {
  if (!available()) return Promise.reject(new Error(whyNot()));
  const j = jobs.get(id);
  if (!j) return Promise.reject(new Error('That render job has expired. Start the export again.'));
  if (!j.n) return Promise.reject(new Error('No frames were sent for that job.'));

  const P = PRESETS[preset] || PRESETS.reel;
  const inRate = Math.max(1, Math.min(60, Number(fps) || P.fps));
  const target = path.join(j.dir, 'reel.mp4');

  const args = ['-y', '-framerate', String(inRate), '-i', path.join(j.dir, 'f%05d.' + j.ext)];
  if (audio && fs.existsSync(audio)) args.push('-i', audio, '-shortest');

  args.push(
    /* pad rather than crop, so nothing of the garment is cut off at the edges */
    '-vf', `scale=${P.w}:${P.h}:force_original_aspect_ratio=decrease,pad=${P.w}:${P.h}:(ow-iw)/2:(oh-ih)/2:color=white,format=yuv420p`,
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-preset', 'medium',
    '-crf', '20',                 /* visually lossless for flat colour and fabric */
    '-pix_fmt', 'yuv420p',        /* without this it will not play on an iPhone */
    '-movflags', '+faststart',    /* starts playing before the download finishes */
    '-r', String(P.fps)
  );
  if (audio && fs.existsSync(audio)) args.push('-c:a', 'aac', '-b:a', '160k');
  args.push(target);

  return new Promise((resolve, reject) => {
    const p = spawn(ffmpegPath(), args);
    let err = '';
    p.stderr.on('data', d => { err += d.toString(); });
    p.on('error', reject);
    p.on('close', code => {
      if (code === 0 && fs.existsSync(target)) resolve({ file: target, dir: j.dir, id, preset: P, frames: j.n });
      else { reject(new Error('ffmpeg failed (' + code + '): ' + err.slice(-500))); }
    });
  });
}

/**
 * The one-shot form, for short reels and for the self-test: hand it the frames, get a file.
 *   frames — array of Buffers, one image per frame, in order
 */
export async function encode({ frames, preset = 'reel', fps, audio = null, ext = 'png' }) {
  if (!available()) throw new Error(whyNot());
  if (!frames?.length) throw new Error('No frames to encode.');
  const { id } = newJob(ext);
  try {
    addFrames(id, frames, 0);
    return await encodeJob(id, { preset, fps, audio });
  } catch (e) { dropJob(id); throw e; }
}

export function cleanup(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* nothing to clean */ }
}
