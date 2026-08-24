'use strict';
/* Vastrangam BOS — Motion Renderer: HTML/CSS in, a real MP4 out.

   WHY FRAME-SEEKING AND NOT SCREEN-RECORDING
   The obvious way to turn a web animation into a video is to play it and
   record the screen. That way is wrong here, and the reason is the whole
   point of this file. A recording is at the mercy of whatever else the
   machine was doing: a slow frame during the render is a stutter baked into
   the customer's reel forever, and rendering the same festive banner twice
   gives two different files. You cannot check such a thing, because it never
   produces the same answer twice.

   So the clock is not real. Chromium is told the time is frame N ÷ fps, the
   animation is SEEKED to exactly that instant, and only then is the frame
   captured. Nothing is left to how fast the machine felt. Render the same
   scene on a busy server and an idle laptop and you get the same bytes —
   which is why the self-test below can assert byte-identical output rather
   than "it looked about right".

   Three clocks have to be faked for that to hold, and missing any one of
   them lets real time leak back in:
     · Date.now() and performance.now()  — anything measuring elapsed time
     · requestAnimationFrame             — the usual way JS drives motion
     · Web Animations / CSS animations   — seeked via currentTime

   The frames then go to the ffmpeg binary already vendored in this repo
   (ffmpeg-static, 7.0.2, libx264). Nothing is downloaded and nothing is
   uploaded: the whole render happens on the machine that runs it, which is
   the same promise every other tool in this suite makes.

   Usage:
     node motion_render.js --html scene.html --out reel.mp4 \
          [--width 1080] [--height 1920] [--fps 30] [--duration 3000]
     node motion_render.js --selftest
*/

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');

const REPO = path.resolve(__dirname, '..', '..', '..');

/* ---- where the two binaries live ------------------------------------- */

/* Chromium comes from the shared resolver; CHROME still overrides. */
const CHROME_CANDIDATES = [
  process.env.CHROME,
  (() => { try { return require('../chrome.js').chromePath(); } catch (_) { return null; } })(),
].filter(Boolean);

const FFMPEG_CANDIDATES = [
  process.env.FFMPEG,
  path.join(REPO, 'app', 'node_modules', 'ffmpeg-static', 'ffmpeg'),
].filter(Boolean);

const PW_CANDIDATES = [
  process.env.PW_CORE,
  path.join(REPO, 'app', 'node_modules', 'playwright-core'),
].filter(Boolean);

function firstExisting(list, what) {
  for (const c of list) if (c && fs.existsSync(c)) return c;
  throw new Error(what + ' not found — looked in: ' + list.join(', '));
}

function loadPlaywright() {
  for (const m of PW_CANDIDATES) {
    try { return require(m); } catch (_) { /* next */ }
  }
  try { return require('playwright-core'); } catch (_) {}
  throw new Error('playwright-core not found — set PW_CORE to its folder');
}

/* ---- the fake clock, injected before any page script runs ------------- */

/* This runs inside the page, before the page's own JavaScript. Everything
   that could read real time is replaced with something we drive by hand. */
function clockShim() {
  let virtualMs = 0;
  const rafQueue = [];
  let rafId = 0;

  const realNow = Date.now();
  Date.now = function () { return realNow + virtualMs; };
  if (window.performance) {
    window.performance.now = function () { return virtualMs; };
  }

  window.requestAnimationFrame = function (cb) {
    rafId += 1;
    rafQueue.push({ id: rafId, cb: cb });
    return rafId;
  };
  window.cancelAnimationFrame = function (id) {
    const i = rafQueue.findIndex(function (e) { return e.id === id; });
    if (i >= 0) rafQueue.splice(i, 1);
  };

  /* Called once per frame from Node. Moves every clock to `ms`, seeks every
     animation to that instant, and flushes any rAF callbacks the page
     registered — passing them the virtual timestamp, never the real one. */
  window.__seek = function (ms) {
    virtualMs = ms;

    if (document.getAnimations) {
      document.getAnimations().forEach(function (a) {
        try {
          a.pause();
          a.currentTime = ms;
        } catch (_) { /* an animation that refuses to seek is left alone */ }
      });
    }

    /* Drain rather than iterate: a callback that schedules the next frame
       (the usual rAF loop) must not spin forever inside one seek. */
    const due = rafQueue.splice(0, rafQueue.length);
    due.forEach(function (e) {
      try { e.cb(ms); } catch (_) { /* a broken callback must not stop the render */ }
    });

    /* A scene can expose its own hook for anything the above cannot express. */
    if (typeof window.onSeek === 'function') {
      try { window.onSeek(ms); } catch (_) {}
    }
    return true;
  };
}

/* ---- rendering -------------------------------------------------------- */

/**
 * render(options) → { out, frames, width, height, fps, durationMs, frameHashes }
 *
 *   html        path to an HTML file, OR
 *   htmlSource  a string of HTML to render directly
 *   out         path of the .mp4 to write
 *   width/height/fps/durationMs
 *   keepFrames  leave the PNG frames on disk (the self-test uses this)
 */
async function render(options) {
  const o = Object.assign({
    width: 1080, height: 1080, fps: 30, durationMs: 2000,
    keepFrames: false, quiet: false,
  }, options || {});

  if (!o.out) throw new Error('render() needs an `out` path');
  if (!o.html && !o.htmlSource) throw new Error('render() needs `html` or `htmlSource`');

  const chrome = firstExisting(CHROME_CANDIDATES, 'chromium');
  const ffmpeg = firstExisting(FFMPEG_CANDIDATES, 'ffmpeg');
  const { chromium } = loadPlaywright();

  const frameCount = Math.max(1, Math.round((o.durationMs / 1000) * o.fps));
  const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vbos-frames-'));

  const say = (m) => { if (!o.quiet) console.log(m); };
  say(`rendering ${frameCount} frames at ${o.width}x${o.height}, ${o.fps}fps`);

  const frameHashes = [];
  const browser = await chromium.launch({
    executablePath: chrome,
    args: [
      '--no-sandbox',
      '--disable-lcd-text',            /* subpixel AA varies — kill it for determinism */
      '--force-device-scale-factor=1',
      '--hide-scrollbars',
      '--force-color-profile=srgb',
      '--disable-font-subpixel-positioning',
    ],
  });

  try {
    const page = await browser.newPage({
      viewport: { width: o.width, height: o.height },
      deviceScaleFactor: 1,
    });
    await page.addInitScript(clockShim);

    /* Everything goes through goto(), including inline HTML, which is why
       htmlSource is spilled to a file first. setContent() does NOT re-run
       init scripts — the shim would silently not install and the page would
       animate on the real clock, which is exactly the bug this file exists
       to prevent, arriving through the back door. */
    let sourceFile = o.html ? path.resolve(o.html) : null;
    if (!sourceFile) {
      sourceFile = path.join(frameDir, '__scene.html');
      fs.writeFileSync(sourceFile, o.htmlSource);
    }
    await page.goto('file://' + sourceFile, { waitUntil: 'load' });

    /* Belt and braces: if the shim is missing, stop with a clear message
       rather than rendering a video that quietly used the wall clock. */
    const armed = await page.evaluate(() => typeof window.__seek === 'function');
    if (!armed) throw new Error('the deterministic clock failed to install — refusing to render');

    /* Fonts must be settled before the first capture, or frame 0 is rendered
       in a fallback face and every later frame in the real one — a flash the
       viewer sees and nobody can explain later. */
    await page.evaluate(() => document.fonts && document.fonts.ready);

    for (let i = 0; i < frameCount; i++) {
      const t = (i * 1000) / o.fps;
      await page.evaluate((ms) => window.__seek(ms), t);
      /* NOT animations:'disabled'. That option cancels infinite animations
         back to their initial state before each shot, so a spinning element
         renders un-rotated in every single frame while the rest of the scene
         moves normally — a video that looks almost right and is wrong. The
         animations are already paused and seeked by __seek above; this
         screenshot must capture them exactly as they were left. */
      const buf = await page.screenshot({ type: 'png' });
      frameHashes.push(crypto.createHash('sha256').update(buf).digest('hex'));
      fs.writeFileSync(
        path.join(frameDir, 'f' + String(i).padStart(6, '0') + '.png'), buf);
    }
  } finally {
    await browser.close();
  }

  await encode(ffmpeg, frameDir, o, say);

  if (!o.keepFrames) fs.rmSync(frameDir, { recursive: true, force: true });

  return {
    out: o.out, frames: frameCount, frameDir: o.keepFrames ? frameDir : null,
    width: o.width, height: o.height, fps: o.fps, durationMs: o.durationMs,
    frameHashes,
  };
}

function encode(ffmpeg, frameDir, o, say) {
  /* -bitexact keeps the encoder's name and a creation timestamp out of the
     container, so the same frames really do produce the same file — that is
     what makes the determinism check below meaningful instead of decorative. */
  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-fflags', '+bitexact', '-flags:v', '+bitexact',
    '-framerate', String(o.fps),
    '-i', path.join(frameDir, 'f%06d.png'),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    '-movflags', '+faststart',
    o.out,
  ];
  return new Promise((resolve, reject) => {
    const p = spawn(ffmpeg, args);
    let err = '';
    p.stderr.on('data', (d) => { err += d.toString(); });
    p.on('error', reject);
    p.on('close', (code) => {
      if (code !== 0) return reject(new Error('ffmpeg exited ' + code + '\n' + err));
      say('wrote ' + o.out);
      resolve();
    });
  });
}

/** Read back what was actually written, by asking ffmpeg to describe it.
 *  There is no ffprobe in this repo, so the information comes from ffmpeg's
 *  own report on the finished file — the file itself, not our intentions. */
function probe(file) {
  const ffmpeg = firstExisting(FFMPEG_CANDIDATES, 'ffmpeg');
  return new Promise((resolve, reject) => {
    const p = spawn(ffmpeg, ['-hide_banner', '-i', file]);
    let err = '';
    p.stderr.on('data', (d) => { err += d.toString(); });
    p.on('error', reject);
    p.on('close', () => {
      const stream = /Stream #\d+:\d+.*?: Video: (\w+).*?, (\d+)x(\d+)[^,]*,.*?([\d.]+) fps/.exec(err);
      const dur = /Duration: (\d+):(\d+):([\d.]+)/.exec(err);
      resolve({
        codec: stream ? stream[1] : null,
        width: stream ? Number(stream[2]) : null,
        height: stream ? Number(stream[3]) : null,
        fps: stream ? Number(stream[4]) : null,
        durationMs: dur
          ? Math.round((Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3])) * 1000)
          : null,
        raw: err,
      });
    });
  });
}

/* ---- a scene that proves the point ------------------------------------ */

/* Deliberately animated three different ways, because each one is a separate
   chance for real time to leak in: a CSS keyframe animation, a rAF loop, and
   a scene hook reading Date.now(). If any of the three were driven by the
   wall clock, two renders would differ and the self-test would catch it. */
function demoScene() {
  return `<!doctype html><meta charset="utf-8"><title>Motion demo</title>
<style>
  html,body{margin:0;height:100%;background:#0f1115;overflow:hidden}
  .wrap{height:100%;display:grid;place-items:center;font-family:Georgia,serif;color:#f4efe6}
  .bar{width:60%;height:14px;background:#2a2f3a;border-radius:99px;overflow:hidden}
  .fill{height:100%;width:0;background:linear-gradient(90deg,#c8a24a,#e8d9a8)}
  .spin{width:120px;height:120px;border-radius:24px;background:#c8a24a;
        animation:turn 2s linear infinite}
  @keyframes turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .t{font-size:28px;letter-spacing:.12em;text-transform:uppercase}
  .n{font-variant-numeric:tabular-nums;font-size:20px;color:#9aa3b2}
</style>
<div class="wrap">
  <div style="display:grid;gap:28px;justify-items:center">
    <div class="spin"></div>
    <div class="t">Vastrangam</div>
    <div class="bar"><div class="fill" id="fill"></div></div>
    <div class="n" id="tick">0</div>
  </div>
</div>
<script>
  /* 1 · a rAF loop — deterministic only because rAF is driven by the seeker */
  var fill = document.getElementById('fill');
  function loop(ts){ fill.style.width = Math.min(100, (ts/2000)*100) + '%';
                     requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  /* 2 · a scene hook reading the (faked) wall clock */
  var t0 = Date.now();
  window.onSeek = function(){
    document.getElementById('tick').textContent = String(Date.now() - t0).padStart(5,'0');
  };
  /* 3 · the CSS keyframe animation above, seeked via currentTime */
</script>`;
}

/* ---- self-test -------------------------------------------------------- */

async function selftest() {
  let pass = 0, fail = 0;
  const t = (name, cond) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name); }
  };

  console.log('Motion Renderer — self-test\n');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vbos-motion-'));
  const a = path.join(dir, 'a.mp4');
  const b = path.join(dir, 'b.mp4');

  const opts = {
    htmlSource: demoScene(), width: 480, height: 480,
    fps: 12, durationMs: 1000, quiet: true,
  };

  const r1 = await render(Object.assign({}, opts, { out: a }));
  t('an MP4 was actually written', fs.existsSync(a) && fs.statSync(a).size > 0);
  t('it is not a stub — real encoded video', fs.statSync(a).size > 5000);
  t('the expected number of frames was captured', r1.frames === 12);

  /* the file, described by ffmpeg reading it back */
  const p = await probe(a);
  t('ffmpeg reads it back as H.264', p.codec === 'h264');
  t('the resolution is what was asked for', p.width === 480 && p.height === 480);
  t('the frame rate is what was asked for', p.fps === 12);
  t('the duration is one second (±40ms)',
    p.durationMs !== null && Math.abs(p.durationMs - 1000) <= 40);

  /* motion actually happened — a video of one still frame would pass every
     check above and be worthless */
  const unique = new Set(r1.frameHashes).size;
  t('the frames are not all identical (something actually moved)', unique > 1);
  t('nearly every frame differs from the last', unique >= 10);

  /* the claim this whole file exists for */
  const r2 = await render(Object.assign({}, opts, { out: b }));
  t('a second render produces frame-for-frame identical images',
    r1.frameHashes.join() === r2.frameHashes.join());
  const h = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  t('and a byte-identical MP4', h(a) === h(b));

  /* A scene driven by a CSS keyframe animation and NOTHING else. The mixed
     demo above cannot catch a broken CSS path — its rAF bar and its clock
     text keep changing, so "the frames differ" stays true while the spinning
     element sits frozen at 0° in every frame. That is a real bug this file
     shipped with once, found by looking at a frame rather than at a green
     tick. This is the test that fails instead, next time. */
  const cssOnly = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;height:100%;background:#111;overflow:hidden}
.b{position:absolute;top:40px;left:0;width:80px;height:80px;background:#c8a24a;
   animation:slide 1s linear infinite}
@keyframes slide{from{left:0}to{left:400px}}</style><div class="b"></div>`;
  const e = path.join(dir, 'e.mp4');
  const re = await render(Object.assign({}, opts, {
    htmlSource: cssOnly, out: e, width: 480, height: 200, fps: 10, durationMs: 1000 }));
  t('a CSS keyframe animation alone produces motion (infinite animations seek)',
    new Set(re.frameHashes).size >= 9);

  /* portrait, the shape a reel actually ships in */
  const c = path.join(dir, 'c.mp4');
  await render(Object.assign({}, opts, { out: c, width: 270, height: 480 }));
  const pc = await probe(c);
  t('a vertical reel renders at 9:16', pc.width === 270 && pc.height === 480);

  /* odd dimensions must not break the encoder — yuv420p needs even sides */
  const d = path.join(dir, 'd.mp4');
  await render(Object.assign({}, opts, { out: d, width: 301, height: 201, durationMs: 250 }));
  const pd = await probe(d);
  t('odd pixel dimensions are corrected, not crashed on',
    pd.codec === 'h264' && pd.width % 2 === 0 && pd.height % 2 === 0);

  fs.rmSync(dir, { recursive: true, force: true });
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  if (fail) process.exit(1);
  return { pass, fail };
}

/* ---- CLI -------------------------------------------------------------- */

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--selftest') { o.selftest = true; continue; }
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) { o[k] = true; continue; }
      o[k] = /^\d+$/.test(v) ? Number(v) : v;
      i++;
    }
  }
  return o;
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  if (a.selftest) return selftest();
  if (!a.html || !a.out) {
    console.log([
      'usage: node motion_render.js --html <scene.html> --out <reel.mp4>',
      '                            [--width 1080] [--height 1920]',
      '                            [--fps 30] [--duration <ms>]',
      '       node motion_render.js --selftest',
    ].join('\n'));
    process.exit(1);
  }
  const r = await render({
    html: a.html, out: a.out,
    width: a.width || 1080, height: a.height || 1920,
    fps: a.fps || 30, durationMs: a.duration || 3000,
  });
  const p = await probe(r.out);
  console.log(JSON.stringify({ out: r.out, frames: r.frames, probe: {
    codec: p.codec, width: p.width, height: p.height,
    fps: p.fps, durationMs: p.durationMs } }, null, 2));
}

module.exports = { render, probe, demoScene, selftest };

if (require.main === module) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
