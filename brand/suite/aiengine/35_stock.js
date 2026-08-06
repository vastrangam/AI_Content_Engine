/* ═══════════ Vastrangam AI Engine — the stock library ═══════════
   Three tiers, free-first, the same shape as the model router:

     1. BUILT-IN   — Indian-ethnic motifs, borders, badges and textures DRAWN by the app.
                     Vector-crisp at any size, recoloured from the active theme, unlimited,
                     costs almost nothing in file size, and works with the wifi off.
     2. PHOTOS     — Openverse (no key at all) · Pexels · Unsplash (free key you paste).
     3. AI         — generated on demand through VAI.makeImage (Gemini → Pollinations).

   Anything you use or upload is saved into "My assets" and can be reused. */
var VSTOCK = (function () {
  'use strict';

  /* ── drawing helpers ── */
  function ctxOf(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function petal(c, cx, cy, r, rot, k) {
    c.beginPath();
    c.moveTo(cx, cy);
    c.quadraticCurveTo(cx + Math.cos(rot - k) * r, cy + Math.sin(rot - k) * r,
      cx + Math.cos(rot) * r, cy + Math.sin(rot) * r);
    c.quadraticCurveTo(cx + Math.cos(rot + k) * r, cy + Math.sin(rot + k) * r, cx, cy);
    c.closePath();
  }
  function ring(c, cx, cy, r, n, fn) { for (var i = 0; i < n; i++) fn(i, (i / n) * Math.PI * 2, cx, cy, r); }

  /* ── the built-in asset set ──────────────────────────────────────────────────────
     Every entry draws itself into a w×h box using only `fill` and `accent`, so the
     whole library recolours with the theme and stays sharp at any export size. */
  var ASSETS = [
    /* ── MOTIFS ── */
    { id: 'paisley', name: 'Paisley', cat: 'Motifs', draw: function (c, w, h, o) {
      var s = Math.min(w, h);
      c.translate(w / 2, h / 2); c.scale(s / 100, s / 100);
      c.beginPath();
      c.moveTo(0, -38);
      c.bezierCurveTo(30, -34, 34, 4, 8, 24);
      c.bezierCurveTo(-6, 34, -26, 26, -26, 8);
      c.bezierCurveTo(-26, -8, -8, -10, -4, 2);
      c.bezierCurveTo(-1, 12, -12, 16, -16, 10);
      c.lineWidth = 4; c.strokeStyle = o.fill; c.stroke();
      c.beginPath(); c.arc(-2, -12, 5, 0, 7); c.fillStyle = o.accent; c.fill();
      ring(c, 0, 0, 0, 5, function (i, a) {
        c.beginPath(); c.arc(6 + i * 3, -26 + i * 9, 2.2, 0, 7); c.fillStyle = o.accent; c.fill();
      });
    } },
    { id: 'mandala', name: 'Mandala', cat: 'Motifs', draw: function (c, w, h, o) {
      var cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 2;
      c.strokeStyle = o.fill; c.fillStyle = o.accent;
      [1, 0.76, 0.52].forEach(function (f, li) {
        var n = 12 + li * 4;
        ring(c, cx, cy, R * f, n, function (i, a) {
          petal(c, cx, cy, R * f, a, 0.16);
          c.lineWidth = Math.max(0.6, R * 0.012); c.stroke();
        });
      });
      c.beginPath(); c.arc(cx, cy, R * 0.16, 0, 7); c.fill();
      c.beginPath(); c.arc(cx, cy, R * 0.27, 0, 7); c.lineWidth = Math.max(0.8, R * 0.016); c.stroke();
    } },
    { id: 'lotus', name: 'Lotus', cat: 'Motifs', draw: function (c, w, h, o) {
      var cx = w / 2, cy = h * 0.72, R = Math.min(w, h) * 0.42;
      c.strokeStyle = o.fill; c.fillStyle = o.fill;
      for (var i = -3; i <= 3; i++) {
        var a = -Math.PI / 2 + i * 0.34, r = R * (1 - Math.abs(i) * 0.13);
        c.globalAlpha = i === 0 ? 1 : 0.82 - Math.abs(i) * 0.1;
        petal(c, cx, cy, r, a, 0.2); c.fill();
      }
      c.globalAlpha = 1;
      c.beginPath(); c.arc(cx, cy, R * 0.1, 0, 7); c.fillStyle = o.accent; c.fill();
    } },
    { id: 'marigold', name: 'Marigold', cat: 'Motifs', draw: function (c, w, h, o) {
      var cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 2;
      [1, 0.74, 0.5].forEach(function (f, li) {
        c.fillStyle = li % 2 ? o.accent : o.fill;
        ring(c, cx, cy, R * f, 14 - li * 2, function (i, a) { petal(c, cx, cy, R * f, a, 0.24); c.fill(); });
      });
      c.beginPath(); c.arc(cx, cy, R * 0.14, 0, 7); c.fillStyle = o.fill; c.fill();
    } },
    { id: 'diya', name: 'Diya lamp', cat: 'Motifs', draw: function (c, w, h, o) {
      var cx = w / 2, cy = h * 0.66, R = Math.min(w, h) * 0.4;
      c.fillStyle = o.fill;
      c.beginPath(); c.ellipse(cx, cy, R, R * 0.42, 0, 0, Math.PI); c.fill();
      c.beginPath(); c.ellipse(cx, cy, R, R * 0.18, 0, 0, 7); c.fill();
      c.fillStyle = o.accent;
      c.beginPath();
      c.moveTo(cx, cy - R * 0.22);
      c.bezierCurveTo(cx + R * 0.3, cy - R * 0.6, cx + R * 0.1, cy - R * 1.15, cx, cy - R * 1.3);
      c.bezierCurveTo(cx - R * 0.1, cy - R * 1.15, cx - R * 0.3, cy - R * 0.6, cx, cy - R * 0.22);
      c.fill();
    } },
    { id: 'jaali', name: 'Jaali lattice', cat: 'Motifs', draw: function (c, w, h, o) {
      var step = Math.min(w, h) / 5;
      c.strokeStyle = o.fill; c.lineWidth = Math.max(1, step * 0.09);
      for (var y = 0; y <= h + step; y += step) for (var x = 0; x <= w + step; x += step) {
        c.beginPath(); c.arc(x, y, step * 0.5, 0, 7); c.stroke();
        c.beginPath(); c.arc(x + step / 2, y + step / 2, step * 0.5, 0, 7); c.stroke();
      }
    } },
    { id: 'bandhani', name: 'Bandhani dots', cat: 'Motifs', draw: function (c, w, h, o) {
      var step = Math.min(w, h) / 7;
      for (var y = step / 2, r = 0; y < h + step; y += step, r++)
        for (var x = (r % 2 ? step : step / 2); x < w + step; x += step) {
          c.beginPath(); c.arc(x, y, step * 0.17, 0, 7); c.fillStyle = o.fill; c.fill();
          c.beginPath(); c.arc(x, y, step * 0.07, 0, 7); c.fillStyle = o.accent; c.fill();
        }
    } },
    { id: 'peacock', name: 'Peacock feather', cat: 'Motifs', draw: function (c, w, h, o) {
      var cx = w / 2, cy = h * 0.40, R = Math.min(w, h) * 0.27;
      /* quill */
      c.strokeStyle = o.fill; c.lineWidth = Math.max(1, R * 0.06); c.lineCap = 'round';
      c.beginPath(); c.moveTo(cx, cy + R * 0.7); c.lineTo(cx, h * 0.96); c.stroke();
      /* barbs fanning off the eye — this is what makes it read as a feather */
      c.lineWidth = Math.max(0.7, R * 0.028); c.globalAlpha = 0.75;
      for (var i = -9; i <= 9; i++) {
        if (!i) continue;
        var t = i / 9, a = -Math.PI / 2 + t * 1.25, len = R * (1.75 - Math.abs(t) * 0.55);
        c.beginPath(); c.moveTo(cx, cy + R * 0.55);
        c.quadraticCurveTo(cx + Math.cos(a) * len * 0.55, cy + R * 0.5 + Math.sin(a) * len * 0.5,
          cx + Math.cos(a) * len, cy + R * 0.35 + Math.sin(a) * len);
        c.stroke();
      }
      c.globalAlpha = 1;
      /* the eye */
      c.fillStyle = o.fill; c.beginPath(); c.ellipse(cx, cy, R * 0.82, R * 1.05, 0, 0, 7); c.fill();
      c.fillStyle = o.accent; c.beginPath(); c.ellipse(cx, cy + R * 0.1, R * 0.52, R * 0.66, 0, 0, 7); c.fill();
      c.fillStyle = o.fill; c.beginPath(); c.ellipse(cx, cy + R * 0.2, R * 0.24, R * 0.32, 0, 0, 7); c.fill();
    } },
    { id: 'kalash', name: 'Kalash', cat: 'Motifs', draw: function (c, w, h, o) {
      var cx = w / 2, R = Math.min(w, h) * 0.3;
      c.fillStyle = o.fill;
      c.beginPath(); c.ellipse(cx, h * 0.66, R, R * 0.9, 0, 0, 7); c.fill();
      c.fillRect(cx - R * 0.55, h * 0.42, R * 1.1, R * 0.3);
      c.fillStyle = o.accent;
      c.beginPath(); c.arc(cx, h * 0.34, R * 0.3, 0, 7); c.fill();
      ring(c, cx, h * 0.3, R * 0.5, 5, function (i, a) {
        petal(c, cx, h * 0.32, R * 0.55, -Math.PI / 2 + (i - 2) * 0.4, 0.2); c.fill();
      });
    } },
    { id: 'rangoli', name: 'Rangoli', cat: 'Motifs', draw: function (c, w, h, o) {
      var cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 3;
      ring(c, cx, cy, R, 8, function (i, a) {
        c.fillStyle = i % 2 ? o.accent : o.fill;
        petal(c, cx, cy, R, a, 0.3); c.fill();
      });
      ring(c, cx, cy, R * 0.55, 8, function (i, a) {
        c.fillStyle = i % 2 ? o.fill : o.accent;
        petal(c, cx, cy, R * 0.55, a + 0.39, 0.3); c.fill();
      });
    } },

    /* ── BORDERS & FRAMES ── */
    { id: 'temple-border', name: 'Temple border', cat: 'Borders', draw: function (c, w, h, o) {
      var n = 9, bw = w / n;
      c.fillStyle = o.fill; c.fillRect(0, 0, w, h * 0.22);
      for (var i = 0; i < n; i++) {
        c.beginPath(); c.moveTo(i * bw, h * 0.22); c.lineTo(i * bw + bw / 2, h * 0.82); c.lineTo((i + 1) * bw, h * 0.22);
        c.closePath(); c.fill();
        c.beginPath(); c.arc(i * bw + bw / 2, h * 0.36, bw * 0.1, 0, 7); c.fillStyle = o.accent; c.fill(); c.fillStyle = o.fill;
      }
    } },
    { id: 'zari-band', name: 'Zari band', cat: 'Borders', draw: function (c, w, h, o) {
      c.fillStyle = o.fill; c.fillRect(0, h * 0.34, w, h * 0.32);
      c.fillStyle = o.accent;
      c.fillRect(0, h * 0.2, w, h * 0.06); c.fillRect(0, h * 0.74, w, h * 0.06);
      for (var x = h * 0.25; x < w; x += h * 0.5) {
        c.beginPath(); c.arc(x, h * 0.5, h * 0.1, 0, 7); c.fill();
      }
    } },
    { id: 'gold-corners', name: 'Gold corners', cat: 'Borders', draw: function (c, w, h, o) {
      var s = Math.min(w, h) * 0.3, lw = Math.max(2, Math.min(w, h) * 0.03), p = lw;
      c.strokeStyle = o.fill; c.lineWidth = lw;
      [[p, p, 1, 1], [w - p, p, -1, 1], [p, h - p, 1, -1], [w - p, h - p, -1, -1]].forEach(function (k) {
        c.beginPath(); c.moveTo(k[0] + s * k[2], k[1]); c.lineTo(k[0], k[1]); c.lineTo(k[0], k[1] + s * k[3]); c.stroke();
        c.beginPath(); c.arc(k[0], k[1], lw * 0.9, 0, 7); c.fillStyle = o.accent; c.fill();
      });
    } },
    { id: 'double-rule', name: 'Double rule frame', cat: 'Borders', draw: function (c, w, h, o) {
      var i = Math.min(w, h) * 0.06, lw = Math.max(1.5, Math.min(w, h) * 0.012);
      c.strokeStyle = o.fill; c.lineWidth = lw; c.strokeRect(i, i, w - i * 2, h - i * 2);
      c.strokeStyle = o.accent; c.lineWidth = lw * 0.6; c.strokeRect(i * 1.9, i * 1.9, w - i * 3.8, h - i * 3.8);
    } },
    { id: 'scallop', name: 'Scallop edge', cat: 'Borders', draw: function (c, w, h, o) {
      var n = 10, r = w / n / 2;
      c.fillStyle = o.fill; c.fillRect(0, 0, w, h * 0.5);
      for (var i = 0; i < n; i++) { c.beginPath(); c.arc(i * 2 * r + r, h * 0.5, r, 0, Math.PI); c.fill(); }
      c.fillStyle = o.accent;
      for (i = 0; i < n; i++) { c.beginPath(); c.arc(i * 2 * r + r, h * 0.5 + r * 0.55, r * 0.16, 0, 7); c.fill(); }
    } },

    /* ── BADGES & TAGS ── */
    { id: 'sale-tag', name: 'Sale tag', cat: 'Badges', draw: function (c, w, h, o) {
      var r = Math.min(w, h) * 0.14;
      c.fillStyle = o.fill;
      c.beginPath();
      c.moveTo(w * 0.06, h * 0.5); c.lineTo(w * 0.3, h * 0.12); c.lineTo(w * 0.96, h * 0.12);
      c.lineTo(w * 0.96, h * 0.88); c.lineTo(w * 0.3, h * 0.88); c.closePath(); c.fill();
      c.beginPath(); c.arc(w * 0.34, h * 0.5, r * 0.42, 0, 7); c.fillStyle = o.accent; c.fill();
    } },
    { id: 'ribbon', name: 'Ribbon banner', cat: 'Badges', draw: function (c, w, h, o) {
      c.fillStyle = o.fill;
      c.beginPath();
      c.moveTo(w * 0.06, h * 0.3); c.lineTo(w * 0.94, h * 0.3); c.lineTo(w * 0.94, h * 0.7);
      c.lineTo(w * 0.06, h * 0.7); c.closePath(); c.fill();
      c.fillStyle = o.accent;
      c.beginPath(); c.moveTo(0, h * 0.22); c.lineTo(w * 0.06, h * 0.3); c.lineTo(w * 0.06, h * 0.7); c.lineTo(0, h * 0.78); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(w, h * 0.22); c.lineTo(w * 0.94, h * 0.3); c.lineTo(w * 0.94, h * 0.7); c.lineTo(w, h * 0.78); c.closePath(); c.fill();
    } },
    { id: 'rosette', name: 'Rosette seal', cat: 'Badges', draw: function (c, w, h, o) {
      var cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 2;
      c.fillStyle = o.fill;
      c.beginPath();
      for (var i = 0; i < 24; i++) {
        var a = i / 24 * Math.PI * 2, r = i % 2 ? R * 0.86 : R;
        c[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      c.closePath(); c.fill();
      c.beginPath(); c.arc(cx, cy, R * 0.66, 0, 7); c.strokeStyle = o.accent; c.lineWidth = Math.max(1, R * 0.06); c.stroke();
    } },
    { id: 'price-flag', name: 'Price flag', cat: 'Badges', draw: function (c, w, h, o) {
      c.fillStyle = o.fill;
      c.beginPath(); c.moveTo(0, h * 0.18); c.lineTo(w, h * 0.18); c.lineTo(w * 0.86, h * 0.5);
      c.lineTo(w, h * 0.82); c.lineTo(0, h * 0.82); c.closePath(); c.fill();
      c.fillStyle = o.accent; c.fillRect(0, h * 0.18, w * 0.06, h * 0.64);
    } },
    { id: 'starburst', name: 'Starburst', cat: 'Badges', draw: function (c, w, h, o) {
      var cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 1;
      c.fillStyle = o.fill; c.beginPath();
      for (var i = 0; i < 20; i++) {
        var a = i / 20 * Math.PI * 2, r = i % 2 ? R * 0.62 : R;
        c[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      c.closePath(); c.fill();
      c.beginPath(); c.arc(cx, cy, R * 0.44, 0, 7); c.fillStyle = o.accent; c.fill();
    } },

    /* ── TEXTURES ── */
    { id: 'grain', name: 'Film grain', cat: 'Textures', draw: function (c, w, h, o) {
      c.fillStyle = o.fill; c.fillRect(0, 0, w, h);
      var id = c.getImageData(0, 0, w, h), d = id.data;
      for (var i = 0; i < d.length; i += 4) { var n = (Math.random() - 0.5) * 120; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      c.putImageData(id, 0, 0);
    } },
    { id: 'silk-sheen', name: 'Silk sheen', cat: 'Textures', draw: function (c, w, h, o) {
      var g = c.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, o.fill); g.addColorStop(0.45, o.accent); g.addColorStop(0.55, o.accent); g.addColorStop(1, o.fill);
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.globalAlpha = 0.12; c.strokeStyle = '#fff'; c.lineWidth = Math.max(1, h * 0.006);
      for (var y = 0; y < h; y += Math.max(3, h / 40)) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + h * 0.06); c.stroke(); }
      c.globalAlpha = 1;
    } },
    { id: 'bokeh', name: 'Bokeh lights', cat: 'Textures', draw: function (c, w, h, o) {
      c.fillStyle = o.fill; c.fillRect(0, 0, w, h);
      for (var i = 0; i < 26; i++) {
        var r = Math.min(w, h) * (0.03 + Math.random() * 0.11);
        c.globalAlpha = 0.10 + Math.random() * 0.3;
        c.beginPath(); c.arc(Math.random() * w, Math.random() * h, r, 0, 7); c.fillStyle = o.accent; c.fill();
      }
      c.globalAlpha = 1;
    } },
    { id: 'mesh', name: 'Gradient mesh', cat: 'Textures', draw: function (c, w, h, o) {
      c.fillStyle = o.fill; c.fillRect(0, 0, w, h);
      [[0.2, 0.25, o.accent], [0.8, 0.35, o.fill], [0.5, 0.85, o.accent]].forEach(function (p) {
        var g = c.createRadialGradient(w * p[0], h * p[1], 0, w * p[0], h * p[1], Math.max(w, h) * 0.6);
        g.addColorStop(0, p[2]); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
      });
    } },
    { id: 'paper', name: 'Paper', cat: 'Textures', draw: function (c, w, h, o) {
      c.fillStyle = o.fill; c.fillRect(0, 0, w, h);
      c.globalAlpha = 0.06; c.strokeStyle = o.accent; c.lineWidth = 1;
      for (var i = 0; i < 220; i++) {
        var x = Math.random() * w, y = Math.random() * h, l = Math.random() * Math.min(w, h) * 0.12;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + (Math.random() - 0.5) * 4); c.stroke();
      }
      c.globalAlpha = 1;
    } },
    { id: 'chevron', name: 'Chevron', cat: 'Textures', draw: function (c, w, h, o) {
      var s = Math.min(w, h) / 6;
      c.strokeStyle = o.fill; c.lineWidth = s * 0.22;
      for (var y = -s; y < h + s * 2; y += s) {
        c.beginPath();
        for (var x = -s; x < w + s; x += s) { c.lineTo(x, y); c.lineTo(x + s / 2, y + s / 2); }
        c.stroke();
      }
    } },

    /* ── TRUST ICONS ── */
    { id: 'ic-ship', name: 'Free shipping', cat: 'Icons', draw: function (c, w, h, o) { icon(c, w, h, o, 'ship'); } },
    { id: 'ic-return', name: 'Easy returns', cat: 'Icons', draw: function (c, w, h, o) { icon(c, w, h, o, 'return'); } },
    { id: 'ic-fit', name: 'Custom fit', cat: 'Icons', draw: function (c, w, h, o) { icon(c, w, h, o, 'fit'); } },
    { id: 'ic-secure', name: 'Secure payment', cat: 'Icons', draw: function (c, w, h, o) { icon(c, w, h, o, 'shield'); } },
    { id: 'ic-star', name: 'Rated', cat: 'Icons', draw: function (c, w, h, o) { icon(c, w, h, o, 'star'); } },
    { id: 'ic-chat', name: 'WhatsApp us', cat: 'Icons', draw: function (c, w, h, o) { icon(c, w, h, o, 'chat'); } }
  ];

  function icon(c, w, h, o, kind) {
    var s = Math.min(w, h), cx = w / 2, cy = h / 2;
    c.strokeStyle = o.fill; c.fillStyle = o.fill;
    c.lineWidth = Math.max(1.5, s * 0.07); c.lineCap = 'round'; c.lineJoin = 'round';
    c.translate(cx, cy); c.scale(s / 100, s / 100); c.translate(-50, -50);
    c.beginPath();
    if (kind === 'ship') { c.rect(12, 34, 44, 32); c.moveTo(56, 44); c.lineTo(76, 44); c.lineTo(88, 56); c.lineTo(88, 66); c.lineTo(56, 66); c.stroke();
      c.beginPath(); c.arc(28, 72, 7, 0, 7); c.moveTo(80, 72); c.arc(73, 72, 7, 0, 7); c.stroke(); return; }
    if (kind === 'return') { c.arc(50, 50, 30, 0.6, 5.9); c.stroke(); c.beginPath(); c.moveTo(72, 26); c.lineTo(74, 44); c.lineTo(56, 42); c.stroke(); return; }
    if (kind === 'fit') { c.moveTo(30, 20); c.lineTo(30, 80); c.moveTo(70, 20); c.lineTo(70, 80); c.moveTo(30, 34); c.lineTo(70, 34); c.moveTo(30, 66); c.lineTo(70, 66); c.stroke();
      c.beginPath(); c.moveTo(44, 44); c.lineTo(56, 50); c.lineTo(44, 56); c.stroke(); return; }
    if (kind === 'shield') { c.moveTo(50, 16); c.lineTo(80, 28); c.lineTo(80, 52); c.quadraticCurveTo(80, 76, 50, 86); c.quadraticCurveTo(20, 76, 20, 52); c.lineTo(20, 28); c.closePath(); c.stroke();
      c.beginPath(); c.moveTo(38, 50); c.lineTo(47, 60); c.lineTo(64, 40); c.stroke(); return; }
    if (kind === 'star') { for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i / 10 * Math.PI * 2, r = i % 2 ? 16 : 36; c[i ? 'lineTo' : 'moveTo'](50 + Math.cos(a) * r, 50 + Math.sin(a) * r); } c.closePath(); c.fill(); return; }
    c.moveTo(22, 74); c.lineTo(28, 60); c.quadraticCurveTo(16, 44, 30, 32); c.quadraticCurveTo(52, 18, 72, 32);
    c.quadraticCurveTo(86, 46, 70, 60); c.quadraticCurveTo(52, 70, 34, 64); c.closePath(); c.stroke();
  }

  var CATS = ['Motifs', 'Borders', 'Badges', 'Textures', 'Icons'];
  function byId(id) { return ASSETS.filter(function (a) { return a.id === id; })[0]; }
  function list(cat, q) {
    return ASSETS.filter(function (a) {
      if (cat && cat !== 'All' && a.cat !== cat) return false;
      if (q) { var s = (a.name + ' ' + a.cat + ' ' + a.id).toLowerCase(); if (s.indexOf(String(q).toLowerCase()) < 0) return false; }
      return true;
    });
  }
  /* render one asset to a canvas — theme colours by default */
  function render(id, w, h, opts) {
    var a = byId(id); if (!a) return null;
    var t = (typeof VTheme !== 'undefined') ? VTheme.active() : { p1: '#5B2D8E', gold: '#C4975A' };
    var o = { fill: (opts && opts.fill) || t.p1, accent: (opts && opts.accent) || t.gold };
    var cv = ctxOf(w, h), c = cv.getContext('2d');
    if (opts && opts.bg) { c.fillStyle = opts.bg; c.fillRect(0, 0, w, h); }
    c.save(); try { a.draw(c, w, h, o); } catch (e) {} c.restore();
    return cv;
  }
  function dataURL(id, w, h, opts) { var cv = render(id, w, h, opts); return cv ? cv.toDataURL('image/png') : null; }

  /* ── TIER 2: real stock photos ───────────────────────────────────────────────────
     Openverse needs no key at all, so it is offered first. Pexels and Unsplash are
     free but want a key you paste — same free-first rule as the model router. */
  var PHOTO_PROVIDERS = [
    { id: 'openverse', name: 'Openverse', key: false, note: 'no key · openly licensed' },
    { id: 'pexels', name: 'Pexels', key: true, note: 'free key · ~200 req/hour' },
    { id: 'unsplash', name: 'Unsplash', key: true, note: 'free key · ~50 req/hour' }
  ];
  function searchPhotos(q, provider, cb) {
    provider = provider || 'openverse';
    var key = (typeof VAI !== 'undefined') ? VAI.getKey(provider) : '';
    var url, opts = {};
    if (provider === 'openverse') {
      url = 'https://api.openverse.org/v1/images/?q=' + encodeURIComponent(q) + '&page_size=24&license_type=all-cc';
    } else if (provider === 'pexels') {
      if (!key) return cb(null, 'Paste a free Pexels key on Connectors first');
      url = 'https://api.pexels.com/v1/search?query=' + encodeURIComponent(q) + '&per_page=24';
      opts = { headers: { Authorization: key } };
    } else {
      if (!key) return cb(null, 'Paste a free Unsplash key on Connectors first');
      url = 'https://api.unsplash.com/search/photos?query=' + encodeURIComponent(q) + '&per_page=24&client_id=' + encodeURIComponent(key);
    }
    fetch(url, opts).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 120)); });
      return r.json();
    }).then(function (j) {
      var out = [];
      if (provider === 'openverse') out = (j.results || []).map(function (x) {
        return { thumb: x.thumbnail || x.url, full: x.url, by: x.creator || '', src: x.foreign_landing_url || '', lic: x.license || '' };
      });
      else if (provider === 'pexels') out = (j.photos || []).map(function (x) {
        return { thumb: x.src.medium, full: x.src.large2x || x.src.large, by: x.photographer || '', src: x.url, lic: 'Pexels' };
      });
      else out = (j.results || []).map(function (x) {
        return { thumb: x.urls.small, full: x.urls.regular, by: (x.user && x.user.name) || '', src: x.links && x.links.html, lic: 'Unsplash' };
      });
      cb(out, null);
    }).catch(function (e) { cb(null, String(e.message || e).slice(0, 160)); });
  }

  return {
    ASSETS: ASSETS, CATS: CATS, list: list, byId: byId, render: render, dataURL: dataURL,
    PHOTO_PROVIDERS: PHOTO_PROVIDERS, searchPhotos: searchPhotos
  };
})();
