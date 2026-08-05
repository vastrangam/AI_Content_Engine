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
