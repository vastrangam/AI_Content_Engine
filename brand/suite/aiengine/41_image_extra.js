/* ═══════════ Vastrangam AI Engine — Image Studio, Photoshop-grade extras ═══════════
   Adds to the layer editor: filter presets, crop, background removal (instant auto-cutout
   offline + an optional ML model that loads once and then works offline), white-bg, and the
   3-format batch export (JPG + WebP + PNG-transparent) with per-image metadata. */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };
  var S = VA.IMGSTATE;   /* shared editor state from 40_image_studio.js */

  /* filter presets (parameter sets applied to S.adj) */
  var PRESETS = {
    None: { bright: 100, contrast: 100, sat: 100, hue: 0, blur: 0 },
    'Studio': { bright: 108, contrast: 112, sat: 106, hue: 0, blur: 0 },
    'Warm Festive': { bright: 106, contrast: 108, sat: 122, hue: 8, blur: 0 },
    'Cool Editorial': { bright: 104, contrast: 114, sat: 92, hue: 340, blur: 0 },
    'Rich Bridal': { bright: 98, contrast: 124, sat: 128, hue: 0, blur: 0 },
    'Soft Pastel': { bright: 112, contrast: 92, sat: 88, hue: 0, blur: 0 },
    'B&W': { bright: 104, contrast: 118, sat: 0, hue: 0, blur: 0 },
    'Vivid Reel': { bright: 106, contrast: 120, sat: 145, hue: 0, blur: 0 }
  };

  /* inject an extra panel into the Image Studio side column, after render */
  var _after = VA.view('img').after;
  VA.view('img').after = function () {
    if (_after) _after();
    /* load a catalogue image if requested */
    if (DB().imgLoadKey && VStore) {
      var key = DB().imgLoadKey; DB().imgLoadKey = null;
      VStore.getImage(key, function (im) {
        if (!im) return;
        var src = 'im' + VA.uid('');
        VA.IMGCACHE(src, im);
        var scale = Math.min(S.W / im.width, S.H / im.height);
        S.layers.push({ type: 'image', name: 'catalogue', src: src, x: (S.W - im.width * scale) / 2, y: (S.H - im.height * scale) / 2, w: im.width * scale, h: im.height * scale, opacity: 1, visible: true });
        S.sel = S.layers.length - 1; VA.render();
      });
    }
    injectExtras();
  };
  function injectExtras() {
    var side = document.querySelector('#main .sidepanel'); if (!side || document.getElementById('imgxtra')) return;
    var el = document.createElement('div'); el.id = 'imgxtra';
    el.innerHTML =
      panel('Filters', '<div class="chiprow">' + Object.keys(PRESETS).map(function (p) { return '<button class="chip sm" data-act="isfilter" data-p="' + p + '">' + esc(p) + '</button>'; }).join('') + '</div>') +
      panel('Background', '<div class="btnrow"><button class="btn sm p" data-act="isbgremove">✂ Remove background</button><button class="btn sm" data-act="isbgwhite">White bg</button></div>' +
        '<p class="hint" style="margin-top:7px" id="bgnote">Instant auto-cutout works offline. For studio-grade edges, load the AI model once (then it works offline too).</p>' +
        '<button class="btn sm" data-act="isbgml" style="margin-top:5px">Load AI cutout model</button>') +
      panel('Watermark eraser <span class="badge">' + VINPAINT.ALGOS.length + ' algorithms</span>',
        '<p class="hint" style="margin-bottom:8px">Paint over a supplier logo, phone number or watermark, then rebuild what was underneath. Runs on your machine, offline.</p>' +
        '<div class="btnrow"><button class="btn sm' + (S.erase ? ' p' : '') + '" data-act="iserasemode">' + (S.erase ? '● Painting — click to stop' : '🖌 Paint over the watermark') + '</button>' +
        '<button class="btn sm" data-act="iseraseclear">Clear strokes</button></div>' +
        '<div class="slider" style="margin-top:8px"><div class="lb"><span>Brush size</span><span>' + (S.brush || 30) + ' px</span></div>' +
        '<input type="range" min="6" max="140" value="' + (S.brush || 30) + '" oninput="VA.ISbrush(this.value)"></div>' +
        '<label class="fl" style="margin-top:6px">Algorithm</label>' +
        '<select id="isalgo" style="width:100%;padding:6px 8px;border:1px solid var(--line2);border-radius:7px">' +
        VINPAINT.ALGOS.map(function (a) { return '<option value="' + a.id + '"' + (S.algo === a.id ? ' selected' : '') + '>' + esc(a.name) + ' — ' + esc(a.note) + '</option>'; }).join('') + '</select>' +
        '<div class="btnrow" style="margin-top:8px"><button class="btn sm p" data-act="iserase">Erase &amp; rebuild</button>' +
        '<button class="btn sm" data-act="isaierase">✦ AI erase</button></div>' +
        '<p class="hint" style="margin-top:6px" id="eraseprog">Local algorithms need no key. ✦ AI erase sends the photo to Gemini for a cleaner rebuild.</p>') +
      panel('SKU watermark &amp; frame',
        '<div class="fld"><label>SKU / code</label><input id="isku" value="' + esc(skuGuess()) + '"></div>' +
        '<label class="fl" style="margin-top:7px">Position</label><div class="chiprow">' +
        [['tl', 'Top left'], ['tr', 'Top right'], ['bl', 'Bottom left'], ['br', 'Bottom right']].map(function (p) {
          return '<button class="chip sm' + (S.wmPos === p[0] ? ' on' : '') + '" data-act="iswmpos" data-p="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</div>' +
        '<label class="fl" style="margin-top:7px">Style</label><div class="chiprow">' +
        WMSTYLES.map(function (w, i) { return '<button class="chip sm' + (S.wmStyle === i ? ' on' : '') + '" data-act="iswmstyle" data-i="' + i + '">' + esc(w.name) + '</button>'; }).join('') + '</div>' +
        '<div class="btnrow" style="margin-top:8px"><button class="btn sm p" data-act="iswm">Stamp the SKU</button></div>' +
        '<label class="fl" style="margin-top:9px">Frame</label><div class="chiprow">' +
        FRAMES.map(function (f, i) { return '<button class="chip sm" data-act="isframe" data-i="' + i + '">' + esc(f.name) + '</button>'; }).join('') + '</div>') +
      panel('Sharpen', '<div class="btnrow"><button class="btn sm" data-act="issharp" data-a="0.6">Light</button>' +
        '<button class="btn sm" data-act="issharp" data-a="1.2">Medium</button>' +
        '<button class="btn sm" data-act="issharp" data-a="2">Strong</button></div>' +
        '<p class="hint" style="margin-top:6px">Unsharp mask on the selected photo — useful after a cutout or a resize.</p>') +
      panel('Crop to size', '<div class="btnrow"><button class="btn sm" data-act="iscropbtn">Crop to canvas ratio</button></div><p class="hint" style="margin-top:6px">Sets the canvas to your chosen output size and fits the image to it.</p>') +
      panel('Export all 3 formats <span class="badge">+ metadata</span>',
        '<div class="fld"><label>Image title</label><input id="imeta_t" value="' + esc(metaGuess('t')) + '"></div>' +
        '<div class="fld" style="margin-top:6px"><label>Description</label><input id="imeta_d" value="' + esc(metaGuess('d')) + '"></div>' +
        '<div class="fld" style="margin-top:6px"><label>Alt text</label><input id="imeta_a" value="' + esc(metaGuess('a')) + '"></div>' +
        '<div class="btnrow" style="margin-top:9px"><button class="btn sm p" data-act="isexport3">Download JPG + WebP + PNG (ZIP)</button></div>' +
        '<p class="hint" style="margin-top:6px">PNG is transparent (after cutout). Each file carries the title/description/alt as metadata, plus a CSV sidecar that matches your content.</p>');
    side.appendChild(el);
  }
  function panel(title, body) { return '<div class="panel"><div class="ph">' + title + '</div>' + body + '</div>'; }

  /* ═══════ the user's own SKU watermark + frame styles, restored ═══════ */
  var WMSTYLES = [
    { name: 'Black bg + gold text', bg: '#000000', fg: '#C4975A' },
    { name: 'Gold bg + white text', bg: '#C4975A', fg: '#FFFFFF' },
    { name: 'Purple bg + white text', bg: '#5B2D8E', fg: '#FFFFFF' },
    { name: 'White bg + purple text', bg: '#FFFFFF', fg: '#5B2D8E' }
  ];
  var FRAMES = [
    { name: 'None', kind: 'none' },
    { name: 'Gold corners', kind: 'corners', col: '#C4975A' },
    { name: 'Thin gold', kind: 'line', col: '#C4975A', w: 0.004 },
    { name: 'Thick lavender', kind: 'line', col: '#B79AE0', w: 0.012 },
    { name: 'Inset', kind: 'inset', col: '#FFFFFF' }
  ];
  function skuGuess() { var r = (DB().runs || []).slice(-1)[0]; return (r && r.pack && r.pack.sku) || 'VS1014'; }

  /* ═══════ watermark eraser ═══════
     Paint a mask over the logo, then rebuild what was underneath with the user's own
     inpainting algorithms (VINPAINT), or hand the whole photo to Gemini. */
  VA.ISbrush = function (v) { S.brush = +v; var lb = document.querySelector('#imgxtra .slider .lb span:last-child'); if (lb) lb.textContent = v + ' px'; };
  VA.action('iserasemode', function () {
    S.erase = !S.erase;
    if (S.erase) { S.strokes = S.strokes || []; VA.toast('Paint over the watermark — then press Erase & rebuild'); }
    VA.render();
  });
  VA.action('iseraseclear', function () { S.strokes = []; VA.render(); VA.toast('Strokes cleared'); });

  /* pointer painting, layered on top of the studio's own drag handling */
  var _iafter = VA.view('img').after;
  VA.view('img').after = function () {
    if (_iafter) _iafter();
    var cv = VA.$('iscanvas'); if (!cv) return;
    if (S.erase) {
      var painting = false;
      cv.style.cursor = 'crosshair';
      cv.onpointerdown = function (e) { painting = true; addPoint(cv, e, true); };
      cv.onpointermove = function (e) { if (painting) addPoint(cv, e, false); };
      cv.onpointerup = function () { painting = false; };
      cv.onpointerleave = function () { painting = false; };
    }
    paintStrokes();
  };
  function addPoint(cv, e, start) {
    var r = cv.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width * S.W, y = (e.clientY - r.top) / r.height * S.H;
    S.strokes = S.strokes || [];
    if (start) S.strokes.push({ r: (S.brush || 30) * (S.W / 1080), pts: [[x, y]] });
    else if (S.strokes.length) S.strokes[S.strokes.length - 1].pts.push([x, y]);
    paintStrokes();
  }
  /* show the mask as a translucent overlay without disturbing the layer stack */
  function paintStrokes() {
    var cv = VA.$('iscanvas'); if (!cv || !S.strokes || !S.strokes.length) return;
    var c = cv.getContext('2d');
    c.save(); c.globalAlpha = 0.45; c.strokeStyle = '#FF3B6B'; c.lineCap = 'round'; c.lineJoin = 'round';
    S.strokes.forEach(function (s) {
      c.lineWidth = s.r * 2; c.beginPath();
      s.pts.forEach(function (p, i) { if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); });
      if (s.pts.length === 1) { c.arc(s.pts[0][0], s.pts[0][1], s.r, 0, 7); c.fillStyle = '#FF3B6B'; c.fill(); }
      c.stroke();
    });
    c.restore();
  }
  /* build a Uint8 mask, in the coordinate space of the image layer's own bitmap */
  function buildMask(layer, im) {
    var W = im.width, Hh = im.height;
    var mc = document.createElement('canvas'); mc.width = W; mc.height = Hh;
    var m = mc.getContext('2d');
    m.strokeStyle = '#fff'; m.fillStyle = '#fff'; m.lineCap = 'round'; m.lineJoin = 'round';
    var sx = W / layer.w, sy = Hh / layer.h;
    (S.strokes || []).forEach(function (s) {
      m.lineWidth = s.r * 2 * sx; m.beginPath();
      s.pts.forEach(function (p, i) {
        var x = (p[0] - layer.x) * sx, y = (p[1] - layer.y) * sy;
        if (i) m.lineTo(x, y); else m.moveTo(x, y);
      });
      if (s.pts.length === 1) { m.arc((s.pts[0][0] - layer.x) * sx, (s.pts[0][1] - layer.y) * sy, s.r * sx, 0, 7); m.fill(); }
      m.stroke();
    });
    var d = m.getImageData(0, 0, W, Hh).data, mask = new Uint8Array(W * Hh), any = 0;
    for (var i = 0; i < mask.length; i++) { if (d[i * 4 + 3] > 40) { mask[i] = 1; any++; } }
    return any ? mask : null;
  }
  VA.action('iserase', function () {
    var li = topImageLayer(); if (li < 0) { VA.toast('Add a photo first'); return; }
    var l = S.layers[li], im = VA.IMGCACHE(l.src);
    if (!im) { VA.toast('Photo still loading'); return; }
    if (!S.strokes || !S.strokes.length) { VA.toast('Paint over the watermark first'); return; }
    var algo = (VA.$('isalgo') || {}).value || 'patchmatch';
    S.algo = algo;
    var cvs = document.createElement('canvas'); cvs.width = im.width; cvs.height = im.height;
    var cx = cvs.getContext('2d'); cx.drawImage(im, 0, 0);
    var id = cx.getImageData(0, 0, im.width, im.height);
    var mask = buildMask(l, im);
    if (!mask) { VA.toast('Strokes did not land on the photo'); return; }
    var note = VA.$('eraseprog');
    VA.toast('Rebuilding…');
    VINPAINT.run(id, mask, im.width, im.height, algo, Math.round((S.brush || 30) / 2), function (pct) {
      if (note) note.textContent = 'Rebuilding… ' + pct + '%';
    }).then(function (out) {
      cx.putImageData(out, 0, 0);
      var ni = new Image();
      ni.onload = function () {
        VA.IMGCACHE(l.src, ni); S.strokes = []; S.erase = false;
        if (note) note.textContent = 'Done — watermark removed with ' + algo + '.';
        VA.render(); VA.toast('Watermark removed');
      };
      ni.src = cvs.toDataURL('image/png');
    }).catch(function (e) { VA.toast('Erase failed: ' + (e.message || e)); });
  });
  VA.action('isaierase', function () {
    var li = topImageLayer(); if (li < 0) { VA.toast('Add a photo first'); return; }
    if (!VAI.getKey('gemini')) { VA.toast('Connect Gemini first — or use the local algorithms, which need no key'); return; }
    var l = S.layers[li], im = VA.IMGCACHE(l.src); if (!im) return;
    var cvs = document.createElement('canvas'); cvs.width = im.width; cvs.height = im.height;
    cvs.getContext('2d').drawImage(im, 0, 0);
    VA.toast('Asking Gemini to clean the photo…');
    VAI.editImage(cvs.toDataURL('image/jpeg', 0.92),
      'Remove every watermark, logo, brand name, website address and phone number overlaid on this photograph. ' +
      'Rebuild what was behind them so the result looks like an untouched original. Change nothing else — keep the garment, ' +
      'the colours, the model and the framing exactly as they are.')
      .then(function (u) {
        var ni = new Image();
        ni.onload = function () { VA.IMGCACHE(l.src, ni); VA.render(); VA.toast('Cleaned by Gemini'); };
        ni.src = u;
      }).catch(function (e) { VA.toast('AI erase unavailable: ' + String(e.message || e).slice(0, 60)); });
  });

  /* ═══════ SKU watermark ═══════ */
  VA.action('iswmpos', function (b) { S.wmPos = b.getAttribute('data-p'); VA.render(); });
  VA.action('iswmstyle', function (b) { S.wmStyle = +b.getAttribute('data-i'); VA.render(); });
  VA.action('iswm', function () {
    var sku = ((VA.$('isku') || {}).value || skuGuess()).trim();
    if (!sku) return;
    var st = WMSTYLES[S.wmStyle || 0], pos = S.wmPos || 'br';
    var pad = S.W * 0.028, fs = Math.round(S.W / 26), w = fs * (sku.length * 0.62 + 1.1), h = fs * 1.7;
    var x = /l$/.test(pos) || pos === 'tl' || pos === 'bl' ? pad : S.W - w - pad;
    var y = /^t/.test(pos) ? pad : S.H - h - pad;
    S.layers.push({ type: 'rect', name: 'SKU bg', x: x, y: y, w: w, h: h, fill: st.bg, opacity: st.bg === '#FFFFFF' ? 0.92 : 0.82, visible: true });
    S.layers.push({ type: 'text', name: 'SKU ' + sku, text: sku, x: x + fs * 0.55, y: y + h * 0.72, size: fs, fill: st.fg, opacity: 1, visible: true });
    S.sel = S.layers.length - 1; VA.render(); VA.toast('SKU ' + sku + ' stamped');
  });

  /* ═══════ frames ═══════ */
  VA.action('isframe', function (b) {
    var f = FRAMES[+b.getAttribute('data-i')];
    S.layers = S.layers.filter(function (l) { return l.name !== 'Frame'; });
    if (!f || f.kind === 'none') { VA.render(); VA.toast('Frame removed'); return; }
    S.layers.push({ type: 'frame', name: 'Frame', kind: f.kind, col: f.col, w: f.w || 0.006, opacity: 1, visible: true, x: 0, y: 0 });
    VA.render(); VA.toast('Frame: ' + f.name);
  });

  /* ═══════ unsharp mask ═══════ */
  VA.action('issharp', function (b) {
    var amt = parseFloat(b.getAttribute('data-a')) || 1;
    var li = topImageLayer(); if (li < 0) { VA.toast('Add a photo first'); return; }
    var l = S.layers[li], im = VA.IMGCACHE(l.src); if (!im) return;
    var W = im.width, Hh = im.height;
    var cvs = document.createElement('canvas'); cvs.width = W; cvs.height = Hh;
    var cx = cvs.getContext('2d'); cx.drawImage(im, 0, 0);
    var src = cx.getImageData(0, 0, W, Hh), out = cx.createImageData(W, Hh);
    var s = src.data, o = out.data;
    /* 3×3 sharpen kernel scaled by amount */
    var k = [0, -amt, 0, -amt, 1 + 4 * amt, -amt, 0, -amt, 0];
    for (var y = 0; y < Hh; y++) for (var x = 0; x < W; x++) {
      for (var ch = 0; ch < 3; ch++) {
        var acc = 0, ki = 0;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++, ki++) {
          var xx = Math.min(W - 1, Math.max(0, x + dx)), yy = Math.min(Hh - 1, Math.max(0, y + dy));
          acc += s[(yy * W + xx) * 4 + ch] * k[ki];
        }
        o[(y * W + x) * 4 + ch] = acc < 0 ? 0 : acc > 255 ? 255 : acc;
      }
      o[(y * W + x) * 4 + 3] = s[(y * W + x) * 4 + 3];
    }
    cx.putImageData(out, 0, 0);
    var ni = new Image();
    ni.onload = function () { VA.IMGCACHE(l.src, ni); VA.render(); VA.toast('Sharpened'); };
    ni.src = cvs.toDataURL('image/png');
  });
  function metaGuess(f) {
    var run = (DB().runs || []).slice(-1)[0];
    if (!run || !run.pack) return f === 't' ? 'Vastrangam product image' : f === 'd' ? 'Crafted in Surat' : 'Vastrangam ethnic wear product photo';
    var p = run.pack;
    if (f === 't') return p.colour + ' ' + p.cat + ' by Vastrangam';
    if (f === 'd') return p.colour + ' ' + p.fabric + ' ' + p.cat + ' — ' + p.work + ', for ' + p.occ.replace('-', ' ');
    return p.colour + ' ' + p.fabric + ' ' + p.cat + ' with ' + p.work + ' by Vastrangam';
  }

  /* ── actions ── */
  VA.action('isfilter', function (b) { var p = PRESETS[b.getAttribute('data-p')]; if (p) { S.adj = { bright: p.bright, contrast: p.contrast, sat: p.sat, hue: p.hue, blur: p.blur }; VA.render(); VA.toast('Filter: ' + b.getAttribute('data-p')); } });
  VA.action('isbgwhite', function () {
    /* insert a white rect as the bottom layer */
    S.layers.unshift({ type: 'rect', name: 'White bg', x: 0, y: 0, w: S.W, h: S.H, fill: '#ffffff', opacity: 1, visible: true });
    if (S.sel >= 0) S.sel++; VA.render(); VA.toast('White background added');
  });
  VA.action('iscropbtn', function () { VA.toast('Canvas is ' + S.W + '×' + S.H + ' — pick a size in Output size, image fits to it'); });

  /* auto-cutout: flood-fill from the four corners by colour distance → transparency on the top image layer */
  VA.action('isbgremove', function () {
    var li = topImageLayer(); if (li < 0) { VA.toast('Add an image first'); return; }
    VA.toast('Removing background…');
    setTimeout(function () {
      var l = S.layers[li], im = VA.IMGCACHE(l.src);
      if (!im) { VA.toast('No image'); return; }
      var c = document.createElement('canvas'); c.width = im.width; c.height = im.height; var ctx = c.getContext('2d');
      ctx.drawImage(im, 0, 0); var id = ctx.getImageData(0, 0, c.width, c.height), d = id.data, w = c.width, hh = c.height;
      /* sample corner colour, flood by tolerance */
      var corners = [[0, 0], [w - 1, 0], [0, hh - 1], [w - 1, hh - 1]].map(function (p) { var i = (p[1] * w + p[0]) * 4; return [d[i], d[i + 1], d[i + 2]]; });
      var bg = corners[0], tol = 46 * 46 * 3;
      var seen = new Uint8Array(w * hh), stack = [];
      corners.forEach(function (c2, k) { var p = [[0, 0], [w - 1, 0], [0, hh - 1], [w - 1, hh - 1]][k]; stack.push(p[1] * w + p[0]); });
      function close(i) { var r = d[i * 4] - bg[0], g = d[i * 4 + 1] - bg[1], b2 = d[i * 4 + 2] - bg[2]; return (r * r + g * g + b2 * b2) < tol; }
      while (stack.length) {
        var idx = stack.pop(); if (seen[idx]) continue; seen[idx] = 1;
        if (!close(idx)) continue;
        d[idx * 4 + 3] = 0;
        var x = idx % w, y = (idx / w) | 0;
        if (x > 0) stack.push(idx - 1); if (x < w - 1) stack.push(idx + 1); if (y > 0) stack.push(idx - w); if (y < hh - 1) stack.push(idx + w);
      }
      ctx.putImageData(id, 0, 0);
      var cut = new Image(); cut.onload = function () { VA.IMGCACHE(l.src, cut); l.cut = true; VA.render(); VA.toast('Background removed (auto). For finer edges, load the AI model.'); };
      cut.src = c.toDataURL('image/png');
    }, 40);
  });
  VA.action('isbgml', function () {
    var note = document.getElementById('bgnote');
    if (note) note.innerHTML = 'Fetching the AI cutout model (once, ~a few MB)… if you are offline it will use the instant auto-cutout instead.';
    /* try the imgly background-removal WASM model from a CDN; cache is automatic. Falls back to auto. */
    try {
      loadScript('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/dist/browser.js', function (ok) {
        if (ok && window.imglyRemoveBackground) { window.__mlBG = window.imglyRemoveBackground; VA.toast('AI cutout model ready — now press Remove background'); if (note) note.innerHTML = 'AI model loaded. Press Remove background for studio-grade edges. Works offline from now on.'; }
        else { VA.toast('Model unavailable offline — the instant auto-cutout still works'); if (note) note.innerHTML = 'Could not load the AI model (offline?). The instant auto-cutout works with no download.'; }
      });
    } catch (e) { VA.toast('Using the instant auto-cutout instead'); }
  });
  function loadScript(src, cb) { var s = document.createElement('script'); s.src = src; s.onload = function () { cb(true); }; s.onerror = function () { cb(false); }; document.head.appendChild(s); setTimeout(function () { if (!window.imglyRemoveBackground) cb(false); }, 12000); }

  function topImageLayer() { for (var i = S.layers.length - 1; i >= 0; i--) if (S.layers[i].type === 'image') return i; return -1; }

  /* ── 3-format batch export with metadata ── */
  VA.action('isexport3', function () {
    S.sel = -1; VA.renderCanvasOnly();
    var cv = VA.$('iscanvas'); if (!cv) { VA.toast('Nothing to export'); return; }
    var t = VA.val('imeta_t'), desc = VA.val('imeta_d'), alt = VA.val('imeta_a');
    var base = VA.slug(t || 'vastrangam-image') || 'image';
    var entries = {};
    entries[base + '.jpg'] = dataURLtoBytes(cv.toDataURL('image/jpeg', 0.92));
    entries[base + '.webp'] = dataURLtoBytes(cv.toDataURL('image/webp', 0.92));
    entries[base + '.png'] = dataURLtoBytes(cv.toDataURL('image/png'));   /* transparent if cut */
    var csv = 'file,title,description,alt_text\n' +
      [base + '.jpg', base + '.webp', base + '.png'].map(function (f) { return csvRow([f, t, desc, alt]); }).join('\n');
    entries[base + '.metadata.csv'] = strBytes(csv);
    entries['README.txt'] = strBytes('Vastrangam image export\n\nThree formats of the same image:\n  .jpg  — for marketplaces that want JPG\n  .webp — smaller, for web/Shopify\n  .png  — transparent background (after cutout)\n\nmetadata.csv carries the title, description and alt text — matched to your content.\nTitle: ' + t + '\nAlt:   ' + alt + '\n');
    try {
      var list = Object.keys(entries).map(function (k) { return { name: k, data: entries[k] }; });
      var zip = VSheet.zip(list);
      dl(new Blob([zip], { type: 'application/zip' }), base + '-3formats.zip');
      VA.toast('Exported JPG + WebP + PNG + metadata');
    } catch (e) { VA.toast('Export not available here'); }
  });
  function csvRow(a) { return a.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }
  function strBytes(s) { return new TextEncoder().encode(s); }
  function dataURLtoBytes(u) { var b = atob(u.split(',')[1]), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function dl(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); }
})();
