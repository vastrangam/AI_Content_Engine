/* ═══════════ Vastrangam AI Engine — templates & the design gallery ═══════════
   v2's "Web Banner" put the title through the right-hand edge, dropped the subtitle on top
   of it and parked the price pill over both, on a gradient that had nothing to do with the
   garment. This file replaces that with real templates: every element lives in a declared,
   non-overlapping slot, and every string is measured and fitted by VLAY before it is drawn.

   Eight layout archetypes × nine canvas sizes × the active theme = the gallery, all rendered
   live from the product photo and the content run — nothing here is a static picture. */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  var SERIF = 'Georgia, "Times New Roman", serif';
  var SANS = '"Trebuchet MS", "Segoe UI", Helvetica, sans-serif';

  /* ── canvas sizes ── */
  var SIZES = {
    igpost: { w: 1080, h: 1350, name: 'Instagram Post', group: 'Social' },
    igstory: { w: 1080, h: 1920, name: 'Instagram Story', group: 'Social' },
    reelcover: { w: 1080, h: 1920, name: 'Reel Cover', group: 'Social' },
    carousel: { w: 1080, h: 1080, name: 'Carousel Slide', group: 'Social' },
    banner: { w: 1500, h: 500, name: 'Web Banner', group: 'Store' },
    ythumb: { w: 1280, h: 720, name: 'YouTube Thumbnail', group: 'Video' },
    poster: { w: 1080, h: 1350, name: 'Festival Poster', group: 'Campaign' },
    sale: { w: 1080, h: 1080, name: 'Sale Post', group: 'Campaign' },
    mktcard: { w: 1100, h: 1100, name: 'Marketplace Card', group: 'Store' }
  };

  /* ── palettes: the active theme, plus the garment's own colour ── */
  function palettes(productHex) {
    var t = VTheme.active();
    var base = [
      { id: 'brand', name: 'Brand', bg1: t.ink, bg2: t.p1, ink: '#FBF6EC', sub: '#D8CCB6', accent: t.gold, chip: t.ink },
      { id: 'ivory', name: 'Ivory', bg1: '#F6F1E7', bg2: '#EFE6D6', ink: '#2A1B45', sub: '#6B5A86', accent: t.gold, chip: t.p1 },
      { id: 'ink', name: 'Ink', bg1: '#140A22', bg2: '#2A1147', ink: '#FFFFFF', sub: '#C9B8E6', accent: t.gold, chip: t.gold },
      { id: 'gold', name: 'Gold', bg1: '#3A2A12', bg2: '#8A6A2A', ink: '#FFF8EC', sub: '#F0DFC0', accent: '#FFFFFF', chip: '#1A0B38' }
    ];
    if (productHex) base.unshift({ id: 'product', name: 'From the garment', bg1: shade(productHex, -0.35), bg2: shade(productHex, 0.12), ink: '#FFFFFF', sub: 'rgba(255,255,255,.82)', accent: t.gold, chip: shade(productHex, -0.5) });
    return base;
  }
  /* relative luminance 0..1 — used to decide light or dark ink */
  function luma(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex) || ''); if (!m) return 0;
    var n = parseInt(m[1], 16);
    return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  }
  function shade(hex, amt) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex) || ''); if (!m) return '#5B2D8E';
    var n = parseInt(m[1], 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function f(v) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))); }
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }

  /* ── the eight archetypes ───────────────────────────────────────────────────────────
     Each returns named, NON-OVERLAPPING slots in normalised 0..1 coordinates. The
     self-test walks every archetype at every size and asserts no pair collides. */
  var ARCH = {
    fullbleed: { name: 'Full bleed', slots: function () { return {
      photo: { x: 0, y: 0, w: 1, h: 1 },
      brand: { x: .08, y: .05, w: .84, h: .07 },
      title: { x: .08, y: .60, w: .84, h: .18 },
      sub:   { x: .08, y: .795, w: .84, h: .07 },
      price: { x: .08, y: .88, w: .84, h: .08 } }; }, scrim: true, textOverPhoto: true },

    editorial: { name: 'Editorial split', slots: function (W, Hh) { var vert = Hh >= W; return vert ? {
      photo: { x: 0, y: 0, w: 1, h: .58 },
      brand: { x: .08, y: .635, w: .84, h: .05 },
      title: { x: .08, y: .70, w: .84, h: .15 },
      sub:   { x: .08, y: .865, w: .84, h: .05 },
      price: { x: .08, y: .925, w: .84, h: .055 } } : {
      photo: { x: 0, y: 0, w: .46, h: 1 },
      brand: { x: .52, y: .13, w: .42, h: .11 },
      title: { x: .52, y: .27, w: .42, h: .32 },
      sub:   { x: .52, y: .62, w: .42, h: .12 },
      price: { x: .52, y: .76, w: .42, h: .13 } }; } },

    framed: { name: 'Framed centre', slots: function () { return {
      photo: { x: 0, y: 0, w: 1, h: 1 },
      brand: { x: .14, y: .13, w: .72, h: .06 },
      title: { x: .12, y: .38, w: .76, h: .20 },
      sub:   { x: .16, y: .60, w: .68, h: .07 },
      price: { x: .28, y: .71, w: .44, h: .08 } }; }, scrim: true, frame: true, textOverPhoto: true },

    band: { name: 'Colour band', slots: function () { return {
      photo: { x: 0, y: 0, w: 1, h: .62 },
      brand: { x: .06, y: .665, w: .88, h: .05 },
      title: { x: .06, y: .725, w: .60, h: .16 },
      sub:   { x: .06, y: .895, w: .60, h: .06 },
      price: { x: .70, y: .74, w: .24, h: .16 } }; }, band: true },

    card: { name: 'Offset card', slots: function () { return {
      photo: { x: .06, y: .06, w: .88, h: .52 },
      brand: { x: .10, y: .635, w: .80, h: .05 },
      title: { x: .10, y: .695, w: .80, h: .155 },
      sub:   { x: .10, y: .865, w: .80, h: .05 },
      price: { x: .10, y: .925, w: .80, h: .05 } }; }, plain: true },

    type: { name: 'Type first', slots: function () { return {
      title: { x: .08, y: .16, w: .84, h: .28 },
      sub:   { x: .08, y: .46, w: .84, h: .09 },
      photo: { x: .20, y: .58, w: .60, h: .27 },
      brand: { x: .08, y: .875, w: .50, h: .05 },
      price: { x: .62, y: .875, w: .30, h: .05 } }; }, plain: true },

    diagonal: { name: 'Diagonal', slots: function () { return {
      photo: { x: 0, y: 0, w: 1, h: .55 },
      brand: { x: .07, y: .60, w: .86, h: .05 },
      title: { x: .07, y: .66, w: .86, h: .17 },
      sub:   { x: .07, y: .845, w: .86, h: .06 },
      price: { x: .07, y: .915, w: .86, h: .06 } }; }, diagonal: true },

    thirds: { name: 'Stacked thirds', slots: function () { return {
      brand: { x: .07, y: .045, w: .86, h: .05 },
      photo: { x: .07, y: .11, w: .86, h: .47 },
      title: { x: .07, y: .60, w: .86, h: .18 },
      sub:   { x: .07, y: .79, w: .86, h: .07 },
      price: { x: .07, y: .875, w: .86, h: .07 } }; }, plain: true }
  };

  /* ── the renderer ─────────────────────────────────────────────────────────────────
     Returns the list of painted rects so a test can assert nothing collided. */
  function render(cv, tpl, data, img) {
    var W = cv.width, Hh = cv.height, c = cv.getContext('2d');
    var a = ARCH[tpl.arch], pal = tpl.pal, slots = a.slots(W, Hh), painted = [];
    c.clearRect(0, 0, W, Hh);

    var full = { x: 0, y: 0, w: W, h: Hh };
    c.fillStyle = VLAY.linear(c, full, pal.bg1, pal.bg2, Hh > W ? 'v' : 'd');
    c.fillRect(0, 0, W, Hh);

    if (slots.photo) {
      var ps = VLAY.px(slots.photo, W, Hh);
      if (img && img.width) VLAY.cover(c, img, ps, a.plain ? Math.min(W, Hh) * 0.03 : 0);
      else {
        c.save();
        VLAY.roundRect(c, ps.x, ps.y, ps.w, ps.h, a.plain ? Math.min(W, Hh) * 0.03 : 0); c.clip();
        c.fillStyle = VLAY.linear(c, ps, shade(pal.bg1, -0.18), shade(pal.bg2, 0.16), 'd');
        c.fillRect(ps.x, ps.y, ps.w, ps.h);
        c.restore();
      }
    }

    /* scrim so text over a photo always has contrast — measured to the text zone */
    if (a.scrim) {
      var top = VLAY.px(slots.title, W, Hh).y - Hh * 0.08;
      var g = c.createLinearGradient(0, top, 0, Hh);
      g.addColorStop(0, 'rgba(10,4,22,0)'); g.addColorStop(0.45, 'rgba(10,4,22,.62)'); g.addColorStop(1, 'rgba(10,4,22,.92)');
      c.fillStyle = g; c.fillRect(0, top, W, Hh - top);
      /* a second small scrim behind the wordmark at the top */
      var bg2 = c.createLinearGradient(0, 0, 0, Hh * 0.22);
      bg2.addColorStop(0, 'rgba(10,4,22,.55)'); bg2.addColorStop(1, 'rgba(10,4,22,0)');
      c.fillStyle = bg2; c.fillRect(0, 0, W, Hh * 0.22);
    }
    if (a.band) {
      var by = VLAY.px(slots.brand, W, Hh).y - Hh * 0.03;
      c.fillStyle = pal.bg1; c.fillRect(0, by, W, Hh - by);
    }
    if (a.diagonal) {
      c.save(); c.beginPath();
      c.moveTo(0, Hh * 0.50); c.lineTo(W, Hh * 0.42); c.lineTo(W, Hh); c.lineTo(0, Hh); c.closePath();
      c.fillStyle = pal.bg1; c.fill(); c.restore();
    }
    if (a.frame) {
      var inset = Math.min(W, Hh) * 0.055;
      c.strokeStyle = pal.accent; c.lineWidth = Math.max(2, Math.min(W, Hh) * 0.004);
      c.strokeRect(inset, inset, W - inset * 2, Hh - inset * 2);
      c.globalAlpha = 0.4;
      c.strokeRect(inset * 1.5, inset * 1.5, W - inset * 3, Hh - inset * 3);
      c.globalAlpha = 1;
    }

    /* Pick the ink from what is ACTUALLY behind the text. A scrim is always dark, so white
       wins there; but a colour band or diagonal takes the palette's own background, and an
       ivory palette with white text is unreadable — which the gallery showed immediately. */
    var onDark = a.scrim ? true : (a.band || a.diagonal) ? luma(pal.bg1) < 0.55 : luma(pal.bg1) < 0.55;
    var inkOn = onDark ? '#FFFFFF' : pal.ink;
    var subOn = onDark ? 'rgba(255,255,255,.86)' : pal.sub;
    var over = !!a.scrim;

    if (slots.brand && data.brand !== false) {
      var br = VLAY.px(slots.brand, W, Hh);
      var r = VLAY.text(c, 'VASTRANGAM', br, { family: SERIF, weight: 700, align: 'center',
        fill: pal.accent, spaced: br.w * 0.012, max: Math.min(br.h, W * 0.032), min: 9, maxLines: 1 });
      if (r) painted.push(r);
    }
    if (slots.title && data.title) {
      var tr = VLAY.px(slots.title, W, Hh);
      painted.push(VLAY.text(c, data.title, tr, { family: SERIF, weight: 800, align: tpl.align || 'center',
        fill: inkOn, max: Math.floor(tr.h * 0.62), min: 14, maxLines: 3, lineHeight: 1.1,
        shadow: over ? 'rgba(0,0,0,.5)' : null }));
    }
    if (slots.sub && data.sub) {
      var sr = VLAY.px(slots.sub, W, Hh);
      painted.push(VLAY.text(c, data.sub, sr, { family: SANS, weight: 400, align: tpl.align || 'center',
        fill: subOn, max: Math.floor(sr.h * 0.62), min: 10, maxLines: 2 }));
    }
    /* price — a pill sized to its own text, so it can never sit under the title */
    if (slots.price && data.price) {
      var pr = VLAY.px(slots.price, W, Hh);
      var size = Math.min(pr.h * 0.5, W * 0.045);
      painted.push(VLAY.pill(c, data.price, pr.x + pr.w / 2, pr.y + pr.h / 2,
        { size: size, family: SANS, weight: 800, bg: pal.chip, fill: '#fff' }));
    }
    if (data.badge) {
      var bs = Math.min(W, Hh) * 0.05;
      c.save(); c.fillStyle = pal.accent;
      VLAY.roundRect(c, W - bs * 4.4, bs * 0.55, bs * 3.8, bs * 1.4, bs * 0.7); c.fill();
      c.fillStyle = '#1A0B38'; c.font = VLAY.font({ size: bs * 0.6, weight: 800, family: SANS });
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(String(data.badge), W - bs * 2.5, bs * 1.28);
      c.restore();
    }
    return painted.filter(Boolean);
  }

  /* ── the template catalogue: archetype × size × palette ── */
  function templates() {
    var pal = palettes(productHex());
    var list = [];
    var combos = [
      ['igpost', ['fullbleed', 'editorial', 'framed', 'card', 'thirds']],
      ['igstory', ['fullbleed', 'framed', 'diagonal', 'type']],
      ['reelcover', ['fullbleed', 'framed', 'type']],
      ['carousel', ['band', 'card', 'type', 'thirds', 'framed']],
      ['banner', ['editorial', 'fullbleed', 'band']],
      ['ythumb', ['editorial', 'fullbleed', 'diagonal', 'framed']],
      ['poster', ['framed', 'thirds', 'diagonal', 'fullbleed']],
      ['sale', ['band', 'type', 'card', 'fullbleed']],
      ['mktcard', ['card', 'thirds', 'editorial']]
    ];
    combos.forEach(function (row) {
      row[1].forEach(function (arch, i) {
        var p = pal[i % pal.length];
        list.push({ id: row[0] + '-' + arch + '-' + p.id, size: row[0], arch: arch, pal: p,
          name: SIZES[row[0]].name + ' · ' + ARCH[arch].name, group: SIZES[row[0]].group });
        if (i < 2) {
          var q = pal[(i + 2) % pal.length];
          if (q.id !== p.id) list.push({ id: row[0] + '-' + arch + '-' + q.id, size: row[0], arch: arch, pal: q,
            name: SIZES[row[0]].name + ' · ' + ARCH[arch].name + ' (' + q.name + ')', group: SIZES[row[0]].group });
        }
      });
    });
    return list;
  }

  /* ── the data a template is filled with ── */
  function latestPack() { var r = (DB().runs || []).filter(function (x) { return x.pack; }).slice(-1)[0]; return r ? r.pack : null; }
  function productHex() {
    var cats = DB().catalogue || [];
    for (var i = 0; i < cats.length; i++) for (var j = 0; j < cats[i].variants.length; j++) if (cats[i].variants[j].hex) return cats[i].variants[j].hex;
    return '';
  }
  function fillData(extra) {
    var p = latestPack(), d = { title: 'New Collection', sub: 'Crafted in Surat', price: '', badge: '' };
    if (p) {
      d.title = p.colour + ' ' + p.typeNoun;
      d.sub = [p.fabric, p.work, 'Custom-fit XS–3XL'].filter(Boolean).join(' · ');
      d.price = VA.inr(p.price);
    }
    if (extra) Object.keys(extra).forEach(function (k) { d[k] = extra[k]; });
    return d;
  }
  function heroImage(cb) {
    if (DB().canvasBG) { var b = new Image(); b.onload = function () { cb(b); }; b.onerror = function () { cb(null); }; b.src = DB().canvasBG; return; }
    var cats = DB().catalogue || [], key = null;
    for (var i = 0; i < cats.length && !key; i++)
      for (var j = 0; j < cats[i].variants.length && !key; j++)
        for (var k = 0; k < cats[i].variants[j].shots.length && !key; k++)
          if (cats[i].variants[j].shots[k].key) key = cats[i].variants[j].shots[k].key;
    if (!key) { cb(null); return; }
    VStore.getDataURL(key, function (u) {
      if (!u) { cb(null); return; }
      var im = new Image(); im.onload = function () { cb(im); }; im.onerror = function () { cb(null); }; im.src = u;
    });
  }

  /* ── the gallery screen ── */
  VA.view('gallery', function () {
    var list = templates(), groups = {};
    list.forEach(function (t) { (groups[t.group] = groups[t.group] || []).push(t); });
    var p = latestPack();
    return H.head('Design Studio', 'Template gallery', list.length + ' templates, every one rendered live from your product and your content — pick one and edit it on the canvas.') +
      (p ? '' : '<div class="panel" style="border-left:4px solid var(--gold);margin-bottom:14px"><div class="pb" style="padding:12px 14px"><b style="font-size:13px">No content run yet</b> <span class="hint">— templates fill with placeholder copy. Generate content first for the real thing.</span></div></div>') +
      '<div class="btnrow" style="margin-bottom:12px"><button class="btn sm" data-go="des">← Canvas editor</button><button class="btn sm p" data-act="galexport">Export every template (ZIP)</button></div>' +
      Object.keys(groups).map(function (g) {
        return H.panel(g + ' <span class="badge">' + groups[g].length + '</span>',
          '<div class="tplgrid" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))">' +
          groups[g].map(function (t) {
            var s = SIZES[t.size];
            return '<div class="tpltile" data-act="galopen" data-id="' + t.id + '" style="cursor:pointer">' +
              '<canvas class="galc" data-tid="' + t.id + '" width="' + s.w + '" height="' + s.h + '" style="width:100%;display:block;border-radius:8px"></canvas>' +
              '<div class="cap">' + esc(ARCH[t.arch].name) + '<span>' + s.w + '×' + s.h + ' · ' + esc(t.pal.name) + '</span></div></div>';
          }).join('') + '</div>');
      }).join('');
  });
  VA.view('gallery').after = function () {
    var list = templates(), byId = {};
    list.forEach(function (t) { byId[t.id] = t; });
    var data = fillData();
    heroImage(function (img) {
      [].slice.call(document.querySelectorAll('.galc')).forEach(function (cv) {
        var t = byId[cv.getAttribute('data-tid')];
        if (t) try { render(cv, t, data, img); } catch (e) {}
      });
    });
  };

  VA.action('galopen', function (b) {
    var id = b.getAttribute('data-id');
    if (!templates().filter(function (x) { return x.id === id; })[0]) return;
    DB().openTpl = id; DB().canvasData = null; VA.save(); VA.go('canvas');
  });
  VA.action('galexport', function () {
    var list = templates(), data = fillData();
    heroImage(function (img) {
      var entries = [];
      list.forEach(function (t) {
        var s = SIZES[t.size], cv = document.createElement('canvas'); cv.width = s.w; cv.height = s.h;
        try { render(cv, t, data, img); entries.push({ name: t.id + '.png', data: b64(cv.toDataURL('image/png')) }); } catch (e) {}
      });
      try { dlBlob(new Blob([VSheet.zip(entries)], { type: 'application/zip' }), 'vastrangam-templates.zip'); VA.toast(entries.length + ' templates exported'); }
      catch (e) { VA.toast('Export not available here'); }
    });
  });

  /* ── the single-template canvas (edit + export) ── */
  VA.view('canvas', function () {
    var id = DB().openTpl, t = templates().filter(function (x) { return x.id === id; })[0];
    if (!t) return H.head('Design Studio', 'Canvas', 'No template chosen.') + H.panel('', '<div class="empty">Pick one in the gallery. <button class="btn p" data-go="gallery">Open the gallery</button></div>');
    var s = SIZES[t.size], d = DB().canvasData || fillData();
    return H.head('Design Studio · ' + esc(s.name), esc(ARCH[t.arch].name), s.w + '×' + s.h + ' · every line is measured and fitted, so nothing can run off the canvas.') +
      '<div class="btnrow" style="margin-bottom:12px"><button class="btn sm" data-go="gallery">← Gallery</button>' +
      '<button class="btn sm p" data-act="cvexport">Export PNG</button>' +
      '<button class="btn sm" data-act="cvai">✦ AI backdrop</button>' +
      (DB().canvasBG ? '<button class="btn sm" data-act="cvnobg">Use my photo</button>' : '') + '</div>' +
      '<div class="studio"><div>' +
      '<canvas id="cvmain" width="' + s.w + '" height="' + s.h + '" style="width:100%;border-radius:12px;border:1px solid var(--line);display:block"></canvas>' +
      '</div><div>' +
      H.panel('Text', field('Title', 'title', d.title) + field('Subtitle', 'sub', d.sub) + field('Price', 'price', d.price) + field('Badge', 'badge', d.badge || '')) +
      H.panel('Palette', '<div style="display:flex;gap:7px;flex-wrap:wrap">' + palettes(productHex()).map(function (p) {
        return '<button class="btn sm" data-act="cvpal" data-p="' + p.id + '" title="' + esc(p.name) + '" style="width:34px;height:28px;padding:0;background:linear-gradient(120deg,' + p.bg1 + ',' + p.bg2 + ');border:2px solid ' + (p.id === t.pal.id ? 'var(--p2)' : 'var(--line)') + '"></button>';
      }).join('') + '</div>') +
      H.panel('Layout', '<div style="display:flex;gap:6px;flex-wrap:wrap">' + Object.keys(ARCH).map(function (k) {
        return '<button class="btn sm' + (k === t.arch ? ' p' : '') + '" data-act="cvarch" data-a="' + k + '">' + esc(ARCH[k].name) + '</button>';
      }).join('') + '</div>') +
      H.panel('Size', '<div style="display:flex;gap:6px;flex-wrap:wrap">' + Object.keys(SIZES).map(function (k) {
        return '<button class="btn sm' + (k === t.size ? ' p' : '') + '" data-act="cvsize" data-s="' + k + '">' + esc(SIZES[k].name) + '</button>';
      }).join('') + '</div><p class="hint" style="margin-top:8px">Magic resize — the layout refits itself to the new canvas.</p>') +
      '</div></div>';
  });
  function field(label, k, v) {
    return '<label class="fl">' + esc(label) + '</label><input value="' + esc(v || '') + '" data-cv="' + k + '" oninput="VA.CVedit(this)" style="width:100%;padding:7px 9px;border:1px solid var(--line2);border-radius:7px;margin-bottom:8px">';
  }
  VA.CVedit = function (el) {
    var d = DB().canvasData || fillData();
    d[el.getAttribute('data-cv')] = el.value;
    DB().canvasData = d; VA.save(); paintCanvas();
  };
  function paintCanvas() {
    var id = DB().openTpl, t = templates().filter(function (x) { return x.id === id; })[0];
    var cv = VA.$('cvmain'); if (!t || !cv) return;
    var d = DB().canvasData || fillData();
    heroImage(function (img) { render(cv, t, d, img); });
  }
  VA.view('canvas').after = function () { paintCanvas(); };
  function retarget(part, val) {
    var id = DB().openTpl || '', p = id.split('-');
    if (p.length < 3) return;
    p[part] = val; DB().openTpl = p.join('-'); VA.save(); VA.render();
  }
  VA.action('cvpal', function (b) { retarget(2, b.getAttribute('data-p')); });
  VA.action('cvarch', function (b) { retarget(1, b.getAttribute('data-a')); });
  VA.action('cvsize', function (b) { retarget(0, b.getAttribute('data-s')); });
  VA.action('cvnobg', function () { DB().canvasBG = null; VA.save(); paintCanvas(); VA.toast('Back to your catalogue photo'); });
  VA.action('cvexport', function () {
    var cv = VA.$('cvmain'); if (!cv) return;
    var a = document.createElement('a'); a.href = cv.toDataURL('image/png');
    a.download = (DB().openTpl || 'design') + '.png'; a.click();
    VA.toast('PNG exported');
  });
  VA.action('cvai', function () {
    var p = latestPack();
    var prompt = (p ? p.colour + ' ' + p.fabric + ' Indian ethnic wear editorial backdrop, soft studio light' : 'elegant Indian textile backdrop') + ', no text, no logos, no people';
    VA.toast('Generating a backdrop…');
    VAI.makeImage(prompt, { w: 1024, h: 1024 }).then(function (r) {
      DB().canvasBG = r.url; VA.save(); paintCanvas(); VA.toast('Backdrop from ' + r.provider);
    }).catch(function () { VA.toast('Could not generate a backdrop'); });
  });

  /* ── quick assets panel on the Design Studio template screen ── */
  var _after = VA.view('des').after;
  VA.view('des').after = function () {
    if (_after) _after();
    var main = document.getElementById('main'); if (!main || document.getElementById('desxtra')) return;
    if (document.getElementById('descanvas')) return;
    var el = document.createElement('div'); el.id = 'desxtra';
    var run = (DB().runs || []).filter(function (r) { return r.pack; }).slice(-1)[0];
    el.innerHTML = H.panel('Templates &amp; quick assets <span class="badge">from your content</span>',
      '<p class="hint" style="margin-bottom:10px">' + templates().length + ' live templates, or build one of the three you need most' + (run ? ' from ' + esc(run.pack.sku) : '') + '.</p>' +
      '<div class="btnrow">' +
      '<button class="btn sm p" data-go="gallery">Open the template gallery</button>' +
      '<button class="btn sm" data-act="desquick" data-k="banner">Web banner 1500×500</button>' +
      '<button class="btn sm" data-act="desquick" data-k="thumb">YouTube thumb 1280×720</button>' +
      '<button class="btn sm" data-act="desquick" data-k="carousel">Carousel (8 slides)</button>' +
      '</div>');
    main.appendChild(el);
  };
  /* resolve by size (+ preferred archetype) rather than a hardcoded id — the palette
     suffix changes as soon as the catalogue has a colour, so a fixed id can go missing */
  function pick(size, arch) {
    var all = templates().filter(function (t) { return t.size === size; });
    return (arch && all.filter(function (t) { return t.arch === arch; })[0]) || all[0];
  }
  VA.action('desquick', function (b) {
    var k = b.getAttribute('data-k');
    if (k === 'carousel') { buildCarousel(latestPack()); return; }
    var t = pick(k === 'banner' ? 'banner' : 'ythumb', 'editorial');
    if (!t) { VA.toast('No template available'); return; }
    DB().openTpl = t.id; DB().canvasData = null; VA.save(); VA.go('canvas');
    VA.toast((k === 'banner' ? 'Web banner' : 'YouTube thumbnail') + ' — fitted, edit and export');
  });

  /* ── carousel: exactly 8 slides, per the spec ── */
  function buildCarousel(p) {
    if (!p) { VA.toast('Generate a content run first'); return; }
    /* Each spec line reads `Stage — "the actual copy"`. The stage is a label, not a
       headline — put the quoted copy on the slide and keep the stage as a small tag. */
    var slides = (p.social.carousel || []).slice(0, 8).map(function (s, i) {
      var raw = String(s).replace(/#\S+/g, '').replace(/\s+/g, ' ').trim();
      var parts = raw.split('—');
      var stage = (parts[0] || '').replace(/[a-zA-Z]+:/, '').trim();
      var rest = parts.slice(1).join('—').trim() || raw;
      /* prefer the quoted sentence as the headline. Only real quote marks count — a bare
         apostrophe is usually possessive ("the bride's"), and treating it as a delimiter
         chopped the headline in half. */
      var q = rest.match(/[“"]([^“”"]{6,})[”"]/) || rest.match(/(?:^|\s)‘([^’]{6,})’/);
      var head = q ? q[1].trim() : rest.replace(/^[^A-Za-z0-9₹]+/, '').trim();
      var body = q ? rest.replace(q[0], '').replace(/^[\s+.,·-]+|[\s+.,·-]+$/g, '').trim() : '';
      if (head.length > 78) { body = head.slice(78).trim() + (body ? ' ' + body : ''); head = head.slice(0, 78).replace(/\s+\S*$/, ''); }
      return { stage: stage || ('Slide ' + (i + 1)), title: head || stage || ('Slide ' + (i + 1)), body: body.slice(0, 110) };
    });
    DB().carousel = { sku: p.sku, slides: slides, colour: p.colour, price: VA.inr(p.price) };
    VA.save(); VA.go('carousel'); VA.toast('Carousel — ' + slides.length + ' slides ready');
  }
  VA.view('carousel', function () {
    var c = DB().carousel;
    if (!c) return H.head('Design Studio', 'Carousel', 'No carousel built yet.') + H.panel('', '<div class="empty">Build one from Design Studio → Carousel. <button class="btn p" data-go="des">Go</button></div>');
    return H.head('Design Studio · Carousel', 'Carousel · ' + esc(c.sku), c.slides.length + ' slides, 1080×1080, themed and filled from your content.') +
      '<div class="btnrow" style="margin-bottom:12px"><button class="btn sm" data-go="des">← Design</button><button class="btn sm p" data-act="carexport">Export all slides (ZIP)</button></div>' +
      '<div class="tplgrid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">' +
      c.slides.map(function (s, i) { return '<div class="tpltile"><canvas id="car' + i + '" width="1080" height="1080" style="width:100%;display:block;border-radius:8px"></canvas><div class="cap">Slide ' + (i + 1) + ' · ' + esc(s.stage || '') + '<span>' + esc(s.title.slice(0, 34)) + '</span></div></div>'; }).join('') + '</div>';
  });
  VA.view('carousel').after = function () {
    var c = DB().carousel; if (!c) return;
    var pal = palettes(productHex());
    heroImage(function (img) {
      c.slides.forEach(function (s, i) {
        var cv = VA.$('car' + i); if (!cv) return;
        var tpl = i === 0 ? { arch: 'fullbleed', pal: pal[0], size: 'carousel' }
          : { arch: ['band', 'type', 'card', 'thirds'][i % 4], pal: pal[i % pal.length], size: 'carousel' };
        render(cv, tpl, { title: s.title, sub: s.body, price: i === 6 ? c.price : '', badge: s.stage || ((i + 1) + '/' + c.slides.length) },
          i === 0 ? img : null);
      });
    });
  };
  VA.action('carexport', function () {
    var c = DB().carousel; if (!c) return;
    var entries = [];
    c.slides.forEach(function (s, i) { var cv = VA.$('car' + i); if (cv) entries.push({ name: 'slide-' + String(i + 1).padStart(2, '0') + '.png', data: b64(cv.toDataURL('image/png')) }); });
    try { dlBlob(new Blob([VSheet.zip(entries)], { type: 'application/zip' }), c.sku + '-carousel.zip'); VA.toast(entries.length + ' slides exported'); }
    catch (e) { VA.toast('Export not available here'); }
  });

  function b64(u) { var s = atob(u.split(',')[1]), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  function dlBlob(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); }

  VA.DESIGN = { ARCH: ARCH, SIZES: SIZES, templates: templates, render: render, palettes: palettes, fillData: fillData };
})();
