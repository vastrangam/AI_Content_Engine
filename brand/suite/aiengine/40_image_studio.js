/* ═══════════ Vastrangam AI Engine — Image Studio (real canvas, layers, adjustments) ═══════════ */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  var SIZES = [
    { n: 'Website', w: 1080, h: 1350 }, { n: 'Myntra', w: 1080, h: 1440 }, { n: 'Marketplace', w: 1100, h: 1100 },
    { n: 'Open Graph', w: 1200, h: 630 }, { n: 'Thumb', w: 400, h: 550 }, { n: 'Square', w: 1080, h: 1080 }, { n: 'Story', w: 1080, h: 1920 }
  ];
  /* editor state kept OUTSIDE DB (transient working canvas); DB stores nothing heavy */
  var S = { W: 1080, H: 1350, layers: [], sel: -1, adj: { bright: 100, contrast: 100, sat: 100, hue: 0, blur: 0 }, tool: 'move',
    hist: [], hi: -1, sizeName: 'Website' };
  var imgCache = {};

  function snapshot() { S.hist = S.hist.slice(0, S.hi + 1); S.hist.push(JSON.stringify({ layers: S.layers, adj: S.adj, W: S.W, H: S.H })); if (S.hist.length > 40) S.hist.shift(); S.hi = S.hist.length - 1; }
  function undo() { if (S.hi > 0) { S.hi--; restore(); } }
  function redo() { if (S.hi < S.hist.length - 1) { S.hi++; restore(); } }
  function restore() { var s = JSON.parse(S.hist[S.hi]); S.layers = s.layers; S.adj = s.adj; S.W = s.W; S.H = s.H; VA.render(); }

  VA.view('img', function () {
    return H.head('Image Studio', 'Image Studio', 'A real layer-based editor. Drop a photo, add text and shapes, adjust it live, resize to any marketplace size, and export at the exact pixels — all offline.') +
      '<div class="studio"><div>' +
      '<div class="tools">' +
      tool('move', 'move', 'Move') + tool('type', 'type', 'Text') + tool('rect', 'shapes', 'Rectangle') + tool('ellipse', 'image', 'Ellipse') + tool('crop', 'crop', 'Crop') +
      '<span style="flex:1"></span>' +
      '<button class="tool" data-act="isundo">↶ Undo</button><button class="tool" data-act="isredo">↷ Redo</button>' +
      '</div>' +
      '<div class="stage" id="isstage"><canvas id="iscanvas"></canvas>' +
      (S.layers.length ? '' : '<div class="empty" style="position:absolute"><div style="font-size:34px">🖼️</div><b style="font-size:16px;color:var(--p2)">Drop an image here</b><p>or use the buttons on the right</p></div>') +
      '</div>' +
      '<div class="note" style="margin-top:10px">Canvas <b>' + S.W + '×' + S.H + '</b> · ' + S.layers.length + ' layer' + (S.layers.length === 1 ? '' : 's') + ' · click a layer then drag it on the canvas. Tool: <b>' + S.tool + '</b></div>' +
      '</div>' +
      '<div class="sidepanel">' +
      H.panel('Add', '<div class="btnrow"><button class="btn sm p" data-act="ispick">📷 Image</button><button class="btn sm" data-act="isaddtext">+ Text</button><button class="btn sm" data-act="isaddrect">+ Box</button><button class="btn sm" data-act="isnew">New</button></div>' +
        '<input type="file" id="isfile" accept="image/*" style="display:none">') +
      H.panel('Layers <span class="badge">' + S.layers.length + '</span>', layerList()) +
      (S.sel >= 0 ? H.panel('Selected layer', selEditor()) : '') +
      H.panel('Adjust <span class="badge">live</span>', adjust()) +
      H.panel('Output size', sizeGrid()) +
      H.panel('Export', '<div class="btnrow"><button class="btn sm p" data-act="isexport" data-f="png">PNG</button><button class="btn sm" data-act="isexport" data-f="jpeg">JPG</button><button class="btn sm" data-act="isexport" data-f="webp">WebP</button></div>' +
        '<p class="hint" style="margin-top:8px">Exports at the exact ' + S.W + '×' + S.H + ' pixels. All in this file — works with the wifi off.</p>') +
      '</div></div>';
  });
  VA.view('img').after = function () { mountCanvas(); };
  function tool(id, ic, label) { return '<button class="tool' + (S.tool === id ? ' on' : '') + '" data-act="istool" data-t="' + id + '">' + VA.icon(ic) + ' ' + label + '</button>'; }

  function layerList() {
    if (!S.layers.length) return '<div class="empty" style="padding:16px">No layers yet.</div>';
    return S.layers.map(function (l, i) {
      var idx = S.layers.length - 1 - i; var L = S.layers[idx];
      return '<div class="layer' + (S.sel === idx ? ' on' : '') + '" data-act="issel" data-i="' + idx + '">' +
        '<span class="eye" data-act="istog" data-i="' + idx + '">' + (L.visible === false ? '◌' : '👁') + '</span>' +
        '<span class="nm">' + esc(L.name) + '</span>' +
        '<span class="btnrow"><button class="btn sm gh" data-act="isup" data-i="' + idx + '">↑</button><button class="btn sm gh" data-act="isdn" data-i="' + idx + '">↓</button><button class="btn sm gh d" data-act="isdel" data-i="' + idx + '">✕</button></span></div>';
    }).join('');
  }
  function selEditor() {
    var l = S.layers[S.sel]; if (!l) return '';
    var common = '<div class="slider"><div class="lb"><span>Opacity</span><span>' + Math.round((l.opacity == null ? 1 : l.opacity) * 100) + '%</span></div>' +
      '<input type="range" min="0" max="100" value="' + Math.round((l.opacity == null ? 1 : l.opacity) * 100) + '" data-act="issetop" oninput="VA.ISliveop(this.value)"></div>' +
      '<div class="btnrow" style="margin-bottom:8px"><button class="btn sm" data-act="isnudge" data-d="l">←</button><button class="btn sm" data-act="isnudge" data-d="u">↑</button><button class="btn sm" data-act="isnudge" data-d="d">↓</button><button class="btn sm" data-act="isnudge" data-d="r">→</button>' +
      '<button class="btn sm" data-act="isscale" data-d="-">−</button><button class="btn sm" data-act="isscale" data-d="+">＋</button><button class="btn sm" data-act="iscenter">Center</button></div>';
    if (l.type === 'text') {
      common += '<div class="fld"><label>Text</label><input id="istext" value="' + esc(l.text) + '" oninput="VA.ISlivetext(this.value)"></div>' +
        '<div class="slider"><div class="lb"><span>Size</span><span>' + l.size + 'px</span></div><input type="range" min="18" max="220" value="' + l.size + '" oninput="VA.ISlivesize(this.value)"></div>' +
        colourRow(l.fill, 'ISlivecolor');
    } else if (l.type === 'rect' || l.type === 'ellipse') {
      common += colourRow(l.fill, 'ISlivecolor');
    }
    return common;
  }
  function colourRow(cur, fn) {
    var cols = ['#5B2D8E', '#7B3FBE', '#C4975A', '#FFFFFF', '#12091C', '#2E9E6B', '#C0392B', '#E67E22', '#F43397'];
    return '<div style="margin-top:6px"><b style="font-size:11px;color:var(--mut)">COLOUR</b><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:5px">' +
      cols.map(function (c) { return '<span class="swatch' + (c === cur ? ' on' : '') + '" style="background:' + c + '" onclick="VA.' + fn + '(\'' + c + '\')"></span>'; }).join('') + '</div></div>';
  }
  function adjust() {
    function sl(k, label, min, max) { return '<div class="slider"><div class="lb"><span>' + label + '</span><span>' + S.adj[k] + (k === 'hue' ? '°' : '%') + '</span></div>' +
      '<input type="range" min="' + min + '" max="' + max + '" value="' + S.adj[k] + '" oninput="VA.ISadj(\'' + k + '\',this.value)"></div>'; }
    return sl('bright', 'Brightness', 40, 180) + sl('contrast', 'Contrast', 40, 200) + sl('sat', 'Saturation', 0, 250) + sl('hue', 'Hue', 0, 360) + sl('blur', 'Blur', 0, 12) +
      '<button class="btn sm" data-act="isadjreset" style="margin-top:4px">Reset adjustments</button>';
  }
  function sizeGrid() {
    return '<div class="sizegrid">' + SIZES.map(function (z) {
      return '<div class="sizetile' + (S.sizeName === z.n ? ' on' : '') + '" data-act="issize" data-w="' + z.w + '" data-h="' + z.h + '" data-n="' + z.n + '"><b>' + z.w + '×' + z.h + '</b><span>' + z.n + '</span></div>';
    }).join('') + '</div>';
  }

  /* ── canvas mount + render ── */
  function mountCanvas() {
    var cv = VA.$('iscanvas'); if (!cv) return;
    if (!S.hist.length) snapshot();
    drawCanvas();
    var stage = VA.$('isstage');
    stage.ondragover = function (e) { e.preventDefault(); };
    stage.ondrop = function (e) { e.preventDefault(); var f = e.dataTransfer.files[0]; if (f) loadImageFile(f); };
    var f = VA.$('isfile'); if (f) f.onchange = function () { if (f.files[0]) loadImageFile(f.files[0]); };
    /* drag to move selected layer */
    var drag = null;
    cv.onpointerdown = function (e) {
      var r = cv.getBoundingClientRect(), sx = S.W / r.width, sy = S.H / r.height;
      var px = (e.clientX - r.left) * sx, py = (e.clientY - r.top) * sy;
      /* hit-test top-down */
      for (var i = S.layers.length - 1; i >= 0; i--) { var l = S.layers[i]; if (l.visible === false) continue; if (hit(l, px, py)) { S.sel = i; drag = { i: i, ox: px - l.x, oy: py - l.y }; drawCanvas(); syncLayerPanel(); cv.setPointerCapture(e.pointerId); return; } }
      S.sel = -1; drawCanvas(); syncLayerPanel();
    };
    cv.onpointermove = function (e) {
      if (!drag) return; var r = cv.getBoundingClientRect(), sx = S.W / r.width, sy = S.H / r.height;
      var l = S.layers[drag.i]; l.x = (e.clientX - r.left) * sx - drag.ox; l.y = (e.clientY - r.top) * sy - drag.oy; drawCanvas();
    };
    cv.onpointerup = function () { if (drag) { snapshot(); drag = null; } };
  }
  function hit(l, px, py) {
    if (l.type === 'text') { var w = l.size * (l.text || '').length * 0.55, h = l.size * 1.2; return px >= l.x && px <= l.x + w && py >= l.y - h && py <= l.y; }
    return px >= l.x && px <= l.x + (l.w || 100) && py >= l.y && py <= l.y + (l.h || 100);
  }
  function drawCanvas() {
    var cv = VA.$('iscanvas'); if (!cv) return; cv.width = S.W; cv.height = S.H;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, S.W, S.H);
    var a = S.adj; ctx.filter = 'brightness(' + a.bright + '%) contrast(' + a.contrast + '%) saturate(' + a.sat + '%) hue-rotate(' + a.hue + 'deg) blur(' + a.blur + 'px)';
    S.layers.forEach(function (l, i) {
      if (l.visible === false) return; ctx.save(); ctx.globalAlpha = l.opacity == null ? 1 : l.opacity;
      if (l.type === 'image' && imgCache[l.src]) ctx.drawImage(imgCache[l.src], l.x, l.y, l.w, l.h);
      else if (l.type === 'rect') { ctx.fillStyle = l.fill; ctx.fillRect(l.x, l.y, l.w, l.h); }
      else if (l.type === 'ellipse') { ctx.fillStyle = l.fill; ctx.beginPath(); ctx.ellipse(l.x + l.w / 2, l.y + l.h / 2, l.w / 2, l.h / 2, 0, 0, 7); ctx.fill(); }
      else if (l.type === 'text') { ctx.fillStyle = l.fill; ctx.font = '700 ' + l.size + 'px Georgia,serif'; ctx.textBaseline = 'alphabetic'; ctx.fillText(l.text, l.x, l.y); }
      ctx.restore();
    });
    /* selection outline (not filtered) */
    ctx.filter = 'none';
    if (S.sel >= 0 && S.layers[S.sel]) { var l = S.layers[S.sel]; ctx.strokeStyle = '#C4975A'; ctx.lineWidth = Math.max(2, S.W / 400); ctx.setLineDash([S.W / 90, S.W / 90]);
      if (l.type === 'text') { var w = l.size * (l.text || '').length * 0.55; ctx.strokeRect(l.x - 4, l.y - l.size, w + 8, l.size * 1.25); }
      else ctx.strokeRect(l.x - 2, l.y - 2, (l.w || 100) + 4, (l.h || 100) + 4); ctx.setLineDash([]); }
  }
  function syncLayerPanel() { /* re-render only side to reflect selection without losing canvas */ VA.render(); }

  function loadImageFile(f) {
    var rd = new FileReader();
    rd.onload = function (ev) {
      var im = new Image();
      im.onload = function () {
        var src = 'im' + VA.uid('');
        imgCache[src] = im;
        /* fit into canvas */
        var scale = Math.min(S.W / im.width, S.H / im.height);
        var w = im.width * scale, h = im.height * scale;
        S.layers.push({ type: 'image', name: f.name.slice(0, 22), src: src, x: (S.W - w) / 2, y: (S.H - h) / 2, w: w, h: h, opacity: 1, visible: true });
        S.sel = S.layers.length - 1; snapshot(); VA.render();
      };
      im.src = ev.target.result;
    };
    rd.readAsDataURL(f);
  }

  /* ── actions ── */
  VA.action('istool', function (b) { S.tool = b.getAttribute('data-t'); VA.render(); });
  VA.action('ispick', function () { VA.$('isfile').click(); });
  VA.action('isnew', function () { S.layers = []; S.sel = -1; snapshot(); VA.render(); VA.toast('New canvas'); });
  VA.action('isaddtext', function () { S.layers.push({ type: 'text', name: 'Text', text: 'CRAFTED IN SURAT', x: S.W * 0.1, y: S.H * 0.5, size: Math.round(S.W / 12), fill: '#5B2D8E', opacity: 1, visible: true }); S.sel = S.layers.length - 1; snapshot(); VA.render(); });
  VA.action('isaddrect', function () { S.layers.push({ type: 'rect', name: 'Box', x: S.W * 0.2, y: S.H * 0.2, w: S.W * 0.6, h: S.H * 0.15, fill: '#C4975A', opacity: 0.9, visible: true }); S.sel = S.layers.length - 1; snapshot(); VA.render(); });
  VA.action('issel', function (b) { S.sel = +b.getAttribute('data-i'); VA.render(); });
  VA.action('istog', function (b) { var i = +b.getAttribute('data-i'); S.layers[i].visible = S.layers[i].visible === false; snapshot(); VA.render(); });
  VA.action('isdel', function (b) { var i = +b.getAttribute('data-i'); S.layers.splice(i, 1); S.sel = -1; snapshot(); VA.render(); });
  VA.action('isup', function (b) { var i = +b.getAttribute('data-i'); if (i < S.layers.length - 1) { var t = S.layers[i]; S.layers[i] = S.layers[i + 1]; S.layers[i + 1] = t; S.sel = i + 1; snapshot(); VA.render(); } });
  VA.action('isdn', function (b) { var i = +b.getAttribute('data-i'); if (i > 0) { var t = S.layers[i]; S.layers[i] = S.layers[i - 1]; S.layers[i - 1] = t; S.sel = i - 1; snapshot(); VA.render(); } });
  VA.action('isnudge', function (b) { var l = S.layers[S.sel]; if (!l) return; var s = S.W / 40; var d = b.getAttribute('data-d'); if (d === 'l') l.x -= s; if (d === 'r') l.x += s; if (d === 'u') l.y -= s; if (d === 'd') l.y += s; snapshot(); drawCanvas(); });
  VA.action('isscale', function (b) { var l = S.layers[S.sel]; if (!l) return; var f = b.getAttribute('data-d') === '+' ? 1.1 : 0.9; if (l.type === 'text') l.size = Math.round(l.size * f); else { l.w *= f; l.h *= f; } snapshot(); drawCanvas(); });
  VA.action('iscenter', function () { var l = S.layers[S.sel]; if (!l) return; if (l.type === 'text') { l.x = S.W * 0.1; } else { l.x = (S.W - l.w) / 2; l.y = (S.H - l.h) / 2; } snapshot(); drawCanvas(); });
  VA.action('isadjreset', function () { S.adj = { bright: 100, contrast: 100, sat: 100, hue: 0, blur: 0 }; snapshot(); VA.render(); });
  VA.action('issize', function (b) { S.W = +b.getAttribute('data-w'); S.H = +b.getAttribute('data-h'); S.sizeName = b.getAttribute('data-n'); snapshot(); VA.render(); VA.toast('Canvas → ' + S.W + '×' + S.H); });
  VA.action('isundo', undo); VA.action('isredo', redo);
  VA.action('isexport', function (b) {
    var fmt = b.getAttribute('data-f'); var cv = VA.$('iscanvas'); if (!cv) return;
    S.sel = -1; drawCanvas();
    var mime = 'image/' + fmt;
    try { cv.toBlob(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vastrangam-' + S.W + 'x' + S.H + '.' + (fmt === 'jpeg' ? 'jpg' : fmt); a.click(); VA.toast('Exported ' + S.W + '×' + S.H + ' ' + fmt.toUpperCase()); }, mime, 0.92); }
    catch (e) { VA.toast('Export not available here'); }
    VA.render();
  });
  /* live handlers bound to VA for inline oninput */
  VA.ISadj = function (k, v) { S.adj[k] = +v; drawCanvas(); var lb = document.querySelector('[oninput*="' + k + '"]'); };
  VA.ISliveop = function (v) { if (S.layers[S.sel]) { S.layers[S.sel].opacity = v / 100; drawCanvas(); } };
  VA.ISlivetext = function (v) { if (S.layers[S.sel]) { S.layers[S.sel].text = v; drawCanvas(); } };
  VA.ISlivesize = function (v) { if (S.layers[S.sel]) { S.layers[S.sel].size = +v; drawCanvas(); } };
  VA.ISlivecolor = function (c) { if (S.layers[S.sel]) { S.layers[S.sel].fill = c; snapshot(); VA.render(); } };

  /* hooks for the Photoshop-grade extras (41_image_extra.js) */
  VA.IMGCACHE = function (src, im) { if (im !== undefined) { imgCache[src] = im; return im; } return imgCache[src]; };
  VA.renderCanvasOnly = function () { drawCanvas(); };
  VA.IMGSTATE = S;
})();
