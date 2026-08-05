/* ═══════════ Vastrangam AI Engine — Video Studio (timeline, keyframes, preview, offline export) ═══════════ */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  var V = {
    W: 1080, H: 1920, dur: 20, t: 0, playing: false, sel: -1, raf: null,
    clips: [
      { track: 'BG', type: 'bg', color: '#4A2D82', start: 0, end: 20 },
      { track: 'Text', type: 'text', text: 'the colour you\nare allowed to wear', x: 0.5, y: 0.42, size: 62, fill: '#FFFFFF', start: 0.2, end: 6, anim: 'fade' },
      { track: 'Text', type: 'text', text: 'Custom-fit · XS–3XL\nCrafted in Surat\n@vastrangam', x: 0.5, y: 0.5, size: 46, fill: '#C4975A', start: 15, end: 20, anim: 'up' },
      { track: 'Shape', type: 'rect', x: 0.5, y: 0.7, w: 0.5, h: 0.02, color: '#C4975A', start: 3, end: 15, anim: 'grow' }
    ]
  };
  var TRACKS = ['BG', 'Video', 'Shape', 'Text'];

  VA.view('vid', function () {
    return H.head('Video Studio', 'Video Studio', 'A working timeline with keyframed clips and a live preview. Exports WebM, an animated GIF and a PNG frame sequence — all offline. MP4/H.264 needs a server; it is on the Connectors screen.') +
      '<div class="studio"><div>' +
      '<div class="stage" style="min-height:auto;background:#111"><canvas id="vidcanvas" style="max-height:62vh"></canvas></div>' +
      '<div class="btnrow" style="margin-top:10px">' +
      '<button class="btn p" data-act="vidplay">' + (V.playing ? '❚❚ Pause' : '▶ Play') + '</button>' +
      '<button class="btn sm" data-act="vidstop">⏹ Stop</button>' +
      '<span class="mono" style="color:var(--mut);font-size:12px">' + V.t.toFixed(1) + 's / ' + V.dur + 's</span>' +
      '<span style="flex:1"></span>' +
      '<div class="fld" style="flex-direction:row;align-items:center;gap:6px"><label style="margin:0">Duration</label><input id="viddur" type="number" value="' + V.dur + '" style="width:64px" oninput="VA.VIDdur(this.value)"> s</div>' +
      '</div>' +
      scrubBar() + timeline() +
      '</div>' +
      '<div class="sidepanel">' +
      H.panel('Add clip', '<div class="btnrow"><button class="btn sm p" data-act="vidaddtext">+ Text</button><button class="btn sm" data-act="vidaddshape">+ Shape</button><button class="btn sm" data-act="vidaddbg">Set BG</button></div>' +
        '<div class="fld" style="margin-top:9px"><label>Load a Suno / reel script from a content run</label>' +
        '<select id="vidrun"><option value="">— pick a run —</option>' + DB().runs.filter(function (r) { return r.pack; }).map(function (r) { return '<option value="' + r.id + '">' + esc(r.pack.sku + ' · ' + r.pack.colour) + '</option>'; }).join('') + '</select></div>' +
        '<button class="btn sm" data-act="vidfromrun" style="margin-top:6px">Build a reel from it</button>') +
      (V.sel >= 0 ? H.panel('Selected clip', clipEditor()) : '') +
      H.panel('Aspect', '<div class="btnrow">' +
        aspBtn('9:16 Reel', 1080, 1920) + aspBtn('1:1 Square', 1080, 1080) + aspBtn('16:9 Wide', 1920, 1080) + '</div>') +
      H.panel('Export <span class="badge">offline</span>',
        '<div class="btnrow"><button class="btn sm p" data-act="vidwebm">WebM</button><button class="btn sm" data-act="vidgif">GIF</button><button class="btn sm" data-act="vidframes">Frames (ZIP)</button><button class="btn sm" data-act="vidjson">JSON</button></div>' +
        '<div class="warn" style="margin-top:9px"><b>MP4 / H.264</b> is not encoded in-browser — see <a data-go="conn" style="cursor:pointer;text-decoration:underline">Connectors</a> for the render service. Everything above works with the wifi off.</div>') +
      '</div></div>';
  });
  VA.view('vid').after = function () { mountVideo(); };

  function aspBtn(l, w, h) { return '<button class="btn sm' + (V.W === w && V.H === h ? ' p' : '') + '" data-act="vidasp" data-w="' + w + '" data-h="' + h + '">' + l + '</button>'; }
  function scrubBar() {
    var ticks = ''; for (var i = 0; i <= V.dur; i += Math.max(1, Math.round(V.dur / 10))) ticks += '<span class="tk" style="left:' + (i / V.dur * 100) + '%">' + i + 's</span>';
    return '<div class="scrub" id="vidscrub"><div class="pin" style="left:' + (V.t / V.dur * 100) + '%"></div>' + ticks + '</div>';
  }
  function timeline() {
    var html = '<div class="timeline">';
    TRACKS.forEach(function (tr) {
      html += '<div class="track"><div class="tname">' + tr + '</div><div class="lane" data-track="' + tr + '">';
      V.clips.forEach(function (c, i) {
        if (c.track !== tr) return;
        var left = c.start / V.dur * 100, w = (c.end - c.start) / V.dur * 100;
        html += '<div class="clip' + (V.sel === i ? ' on' : '') + '" data-act="vidsel" data-i="' + i + '" style="left:' + left + '%;width:' + w + '%">' + esc(clipLabel(c)) + '</div>';
      });
      html += '</div></div>';
    });
    html += '</div>';
    return html;
  }
  function clipLabel(c) { return c.type === 'text' ? (c.text || '').split('\n')[0] : c.type === 'bg' ? 'Background' : c.type; }

  function clipEditor() {
    var c = V.clips[V.sel]; if (!c) return '';
    var out = '<div class="form" style="gap:9px">' +
      '<div class="fld" style="flex-direction:row;gap:8px"><div style="flex:1"><label>Start (s)</label><input type="number" step="0.1" value="' + c.start + '" oninput="VA.VIDset(\'start\',this.value)"></div>' +
      '<div style="flex:1"><label>End (s)</label><input type="number" step="0.1" value="' + c.end + '" oninput="VA.VIDset(\'end\',this.value)"></div></div>';
    if (c.type === 'text') out += '<div class="fld"><label>Text (use Enter for lines)</label><textarea oninput="VA.VIDset(\'text\',this.value)" style="min-height:60px">' + esc(c.text) + '</textarea></div>' +
      '<div class="fld"><label>Size ' + c.size + 'px</label><input type="range" min="24" max="140" value="' + c.size + '" oninput="VA.VIDset(\'size\',this.value)"></div>';
    out += '<div class="fld"><label>Animation</label><select onchange="VA.VIDset(\'anim\',this.value)">' +
      ['none', 'fade', 'up', 'down', 'grow', 'zoom'].map(function (a) { return '<option' + (c.anim === a ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select></div>';
    out += '</div><button class="btn sm d" data-act="viddel" style="margin-top:8px">Delete clip</button>';
    return out;
  }

  /* ── render a frame at time t ── */
  function frameAt(ctx, t) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, V.W, V.H);
    V.clips.forEach(function (c) {
      if (t < c.start || t > c.end) return;
      var local = (t - c.start), dur = (c.end - c.start), p = dur > 0 ? local / dur : 1;
      var alpha = 1, dx = 0, dy = 0, scale = 1, gw = 1;
      if (c.anim === 'fade') alpha = Math.min(1, local / 0.5) * Math.min(1, (c.end - t) / 0.5);
      if (c.anim === 'up') { dy = (1 - Math.min(1, local / 0.6)) * V.H * 0.06; alpha = Math.min(1, local / 0.6); }
      if (c.anim === 'down') { dy = -(1 - Math.min(1, local / 0.6)) * V.H * 0.06; alpha = Math.min(1, local / 0.6); }
      if (c.anim === 'zoom') scale = 1 + p * 0.12;
      if (c.anim === 'grow') gw = Math.min(1, local / 0.8);
      ctx.save(); ctx.globalAlpha = alpha;
      if (c.type === 'bg') { ctx.globalAlpha = 1; var grad = ctx.createLinearGradient(0, 0, V.W, V.H); grad.addColorStop(0, c.color); grad.addColorStop(1, shade(c.color, -30)); ctx.fillStyle = grad; ctx.fillRect(0, 0, V.W, V.H); }
      else if (c.type === 'rect') { ctx.fillStyle = c.color; var w = c.w * V.W * gw, h = c.h * V.H; ctx.fillRect(c.x * V.W - w / 2, c.y * V.H - h / 2, w, h); }
      else if (c.type === 'text') {
        ctx.fillStyle = c.fill; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        var sz = c.size * scale; ctx.font = '700 ' + sz + 'px Georgia,serif';
        var lines = (c.text || '').split('\n'); var cy = c.y * V.H + dy - (lines.length - 1) * sz * 0.6;
        lines.forEach(function (ln, i) { ctx.fillText(ln, c.x * V.W, cy + i * sz * 1.2); });
      }
      ctx.restore();
    });
  }
  function shade(hex, amt) { var n = parseInt(hex.slice(1), 16); var r = Math.max(0, Math.min(255, (n >> 16) + amt)), g = Math.max(0, Math.min(255, (n >> 8 & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt)); return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); }

  function mountVideo() {
    var cv = VA.$('vidcanvas'); if (!cv) return; cv.width = V.W; cv.height = V.H;
    drawFrame();
    var sc = VA.$('vidscrub'); if (sc) sc.onpointerdown = function (e) { var r = sc.getBoundingClientRect(); V.t = Math.max(0, Math.min(V.dur, (e.clientX - r.left) / r.width * V.dur)); V.playing = false; drawFrame(); updatePin(); };
  }
  function drawFrame() { var cv = VA.$('vidcanvas'); if (!cv) return; frameAt(cv.getContext('2d'), V.t); }
  function updatePin() { var p = document.querySelector('#vidscrub .pin'); if (p) p.style.left = (V.t / V.dur * 100) + '%'; var lab = document.querySelector('.mono'); }

  function play() {
    if (V.playing) { stop(); return; }
    V.playing = true; VA.render(); var last = performance.now();
    function loop(now) { if (!V.playing) return; V.t += (now - last) / 1000; last = now; if (V.t >= V.dur) { V.t = 0; } drawFrame(); updatePin(); V.raf = requestAnimationFrame(loop); }
    V.raf = requestAnimationFrame(loop);
  }
  function stop() { V.playing = false; if (V.raf) cancelAnimationFrame(V.raf); VA.render(); }

  /* ── actions ── */
  VA.action('vidplay', play);
  VA.action('vidstop', function () { V.playing = false; if (V.raf) cancelAnimationFrame(V.raf); V.t = 0; VA.render(); });
  VA.action('vidsel', function (b) { V.sel = +b.getAttribute('data-i'); VA.render(); });
  VA.action('viddel', function () { V.clips.splice(V.sel, 1); V.sel = -1; VA.render(); });
  VA.action('vidaddtext', function () { V.clips.push({ track: 'Text', type: 'text', text: 'New line', x: 0.5, y: 0.5, size: 54, fill: '#fff', start: 0, end: Math.min(5, V.dur), anim: 'fade' }); V.sel = V.clips.length - 1; VA.render(); });
  VA.action('vidaddshape', function () { V.clips.push({ track: 'Shape', type: 'rect', x: 0.5, y: 0.6, w: 0.4, h: 0.02, color: '#C4975A', start: 0, end: Math.min(6, V.dur), anim: 'grow' }); V.sel = V.clips.length - 1; VA.render(); });
  VA.action('vidaddbg', function () { var bg = V.clips.filter(function (c) { return c.type === 'bg'; })[0]; if (bg) { bg.color = ['#4A2D82', '#5B2D8E', '#C0392B', '#2E9E6B', '#12091C'][Math.floor(Math.random() * 5)]; drawFrame(); VA.toast('Background changed'); } });
  VA.action('vidasp', function (b) { V.W = +b.getAttribute('data-w'); V.H = +b.getAttribute('data-h'); VA.render(); });
  VA.action('vidfromrun', function () {
    var id = VA.val('vidrun'); var run = DB().runs.filter(function (r) { return r.id === id; })[0]; if (!run) { VA.toast('Pick a run'); return; }
    var p = run.pack; V.dur = 20;
    V.clips = [
      { track: 'BG', type: 'bg', color: '#4A2D82', start: 0, end: 20 },
      { track: 'Text', type: 'text', text: 'the colour you\nare allowed to wear', x: 0.5, y: 0.42, size: 60, fill: '#fff', start: 0.2, end: 6, anim: 'fade' },
      { track: 'Text', type: 'text', text: p.colour + '\n' + p.fabric, x: 0.5, y: 0.5, size: 70, fill: '#C4975A', start: 6, end: 14, anim: 'zoom' },
      { track: 'Text', type: 'text', text: 'Custom-fit · XS–3XL\nCrafted in Surat\n@vastrangam', x: 0.5, y: 0.5, size: 44, fill: '#fff', start: 15, end: 20, anim: 'up' }
    ];
    V.sel = -1; VA.render(); VA.toast('Reel built from ' + p.sku);
  });
  VA.VIDdur = function (v) { V.dur = Math.max(3, Math.min(90, +v || 20)); };
  VA.VIDset = function (k, v) { var c = V.clips[V.sel]; if (!c) return; if (k === 'start' || k === 'end' || k === 'size') c[k] = +v; else c[k] = v; drawFrame(); if (k !== 'text') VA.render(); };

  /* export */
  VA.action('vidjson', function () { var blob = new Blob([JSON.stringify({ W: V.W, H: V.H, dur: V.dur, clips: V.clips }, null, 2)], { type: 'application/json' }); dl(blob, 'vastrangam-reel.json'); });
  VA.action('vidframes', function () {
    var n = 24, cv = document.createElement('canvas'); cv.width = V.W; cv.height = V.H; var ctx = cv.getContext('2d');
    var entries = {};
    for (var i = 0; i < n; i++) { frameAt(ctx, i / n * V.dur); entries['frame-' + String(i).padStart(3, '0') + '.png'] = dataURLtoBytes(cv.toDataURL('image/png')); }
    try { var list = Object.keys(entries).map(function (k) { return { name: k, data: entries[k] }; });
      var zip = VSheet.zip(list); dl(new Blob([zip], { type: 'application/zip' }), 'vastrangam-frames.zip'); VA.toast(n + ' frames zipped'); }
    catch (e) { VA.toast('Frame export not available here'); }
  });
  VA.action('vidgif', function () {
    VA.toast('Encoding GIF…');
    setTimeout(function () {
      var scale = Math.min(1, 360 / V.W); var gw = Math.round(V.W * scale), gh = Math.round(V.H * scale);
      var cv = document.createElement('canvas'); cv.width = gw; cv.height = gh; var ctx = cv.getContext('2d');
      var big = document.createElement('canvas'); big.width = V.W; big.height = V.H; var bctx = big.getContext('2d');
      var n = 16, frames = [];
      for (var i = 0; i < n; i++) { frameAt(bctx, i / n * V.dur); ctx.drawImage(big, 0, 0, gw, gh); frames.push(ctx.getImageData(0, 0, gw, gh).data); }
      try { var bytes = VGif.encode(frames, gw, gh, Math.round(V.dur / n * 100)); dl(new Blob([bytes], { type: 'image/gif' }), 'vastrangam-reel.gif'); VA.toast('GIF exported (' + gw + '×' + gh + ')'); }
      catch (e) { VA.toast('GIF export failed here'); }
    }, 40);
  });
  VA.action('vidwebm', function () {
    var cv = VA.$('vidcanvas'); if (!cv || !cv.captureStream || !window.MediaRecorder) { VA.toast('WebM recording not supported in this browser — use GIF or Frames'); return; }
    try {
      var stream = cv.captureStream(30); var rec = new MediaRecorder(stream, { mimeType: 'video/webm' }); var chunks = [];
      rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      rec.onstop = function () { dl(new Blob(chunks, { type: 'video/webm' }), 'vastrangam-reel.webm'); VA.toast('WebM exported'); V.playing = false; };
      VA.toast('Recording ' + V.dur + 's…'); rec.start(); V.t = 0; V.playing = true;
      var last = performance.now();
      function loop(now) { V.t += (now - last) / 1000; last = now; frameAt(cv.getContext('2d'), V.t); if (V.t < V.dur && V.playing) requestAnimationFrame(loop); else { V.playing = false; rec.stop(); } }
      requestAnimationFrame(loop);
    } catch (e) { VA.toast('WebM not available here'); }
  });

  function dl(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); }
  function dataURLtoBytes(u) { var b = atob(u.split(',')[1]), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }

  VA.VIDSTATE = V;
})();
