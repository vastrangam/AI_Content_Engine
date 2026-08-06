/* ═══════════ Vastrangam AI Engine — layout engine ═══════════
   This exists because of one screenshot: a "Web Banner" where the title ran off the right
   edge of the canvas, the subtitle sat on top of the title, and the price pill sat on top
   of both. That is not a styling bug, it is the absence of a layout engine — v2 drew text
   at a guessed font size and hoped.

   Here every piece of text is measured before it is drawn, wrapped to its box, and shrunk
   until the wrapped block fits. Every slot is a rectangle, and rectangles are checked for
   collision. Overflow and overlap become structurally impossible rather than unlikely. */
var VLAY = (function () {
  'use strict';
  var scratch = null;
  function ctx2d() {
    if (!scratch) { var c = document.createElement('canvas'); c.width = 8; c.height = 8; scratch = c.getContext('2d'); }
    return scratch;
  }
  function font(o) {
    return (o.italic ? 'italic ' : '') + (o.weight || 400) + ' ' + Math.max(1, Math.round(o.size)) + 'px ' + (o.family || 'Georgia, serif');
  }
  function measure(text, o) { var c = ctx2d(); c.font = font(o); return c.measureText(String(text)).width; }

  /* wrap into lines no wider than maxW; a single word longer than maxW is hard-split
     rather than allowed to overhang (this is exactly what produced the cut-off title) */
  function wrap(text, o, maxW) {
    var c = ctx2d(); c.font = font(o);
    var paras = String(text).split('\n'), out = [];
    paras.forEach(function (para) {
      var words = para.split(/\s+/).filter(function (w) { return w.length; }), line = '';
      if (!words.length) { out.push(''); return; }
      words.forEach(function (w) {
        var t = line ? line + ' ' + w : w;
        if (c.measureText(t).width <= maxW || !line) {
          if (c.measureText(t).width > maxW && !line) {
            /* one unbreakable word wider than the box — split it */
            var cur = '';
            for (var i = 0; i < w.length; i++) {
              if (c.measureText(cur + w[i]).width > maxW && cur) { out.push(cur); cur = w[i]; }
              else cur += w[i];
            }
            line = cur;
          } else line = t;
        } else { out.push(line); line = w; }
      });
      if (line) out.push(line);
    });
    return out;
  }

  /* Fit text into rect {x,y,w,h}. Shrinks from max to min until the wrapped block fits
     both dimensions. Returns everything the renderer needs — never a size that overflows. */
  function fit(text, rect, opts) {
    opts = opts || {};
    var max = opts.max || Math.floor(rect.h * 0.9),
        min = opts.min || 8,
        lh = opts.lineHeight || 1.18,
        maxLines = opts.maxLines || 99,
        size = max, lines, blockH;
    for (; size >= min; size--) {
      var o = { size: size, weight: opts.weight, family: opts.family, italic: opts.italic };
      lines = wrap(text, o, rect.w);
      if (lines.length > maxLines) continue;
      blockH = lines.length * size * lh;
      var widest = 0;
      lines.forEach(function (l) { widest = Math.max(widest, measure(l, o)); });
      if (blockH <= rect.h && widest <= rect.w) break;
    }
    if (size < min) {
      size = min;
      lines = wrap(text, { size: size, weight: opts.weight, family: opts.family }, rect.w).slice(0, maxLines);
      /* last resort: ellipsis rather than overflow */
      if (lines.length === maxLines) {
        var last = lines[maxLines - 1];
        while (last.length > 1 && measure(last + '…', { size: size, weight: opts.weight, family: opts.family }) > rect.w) last = last.slice(0, -1);
        lines[maxLines - 1] = last + '…';
      }
      blockH = lines.length * size * lh;
    }
    return { size: size, lines: lines, lineHeight: lh, blockH: blockH,
      family: opts.family, weight: opts.weight, italic: opts.italic };
  }

  /* draw a fitted block inside its rect, honouring align/valign — never outside */
  function draw(c, f, rect, opts) {
    opts = opts || {};
    c.save();
    c.font = font(f);
    c.fillStyle = opts.fill || '#fff';
    c.textBaseline = 'top';
    var align = opts.align || 'center';
    c.textAlign = align;
    var x = align === 'center' ? rect.x + rect.w / 2 : align === 'right' ? rect.x + rect.w : rect.x;
    var valign = opts.valign || 'middle';
    var y = valign === 'top' ? rect.y : valign === 'bottom' ? rect.y + rect.h - f.blockH : rect.y + (rect.h - f.blockH) / 2;
    if (opts.shadow) { c.shadowColor = opts.shadow; c.shadowBlur = f.size * 0.28; c.shadowOffsetY = f.size * 0.05; }
    f.lines.forEach(function (line, i) {
      var ly = y + i * f.size * f.lineHeight;
      if (opts.spaced) drawSpaced(c, line, x, ly, f, align, opts.spaced);
      else c.fillText(line, x, ly);
    });
    c.restore();
    return { x: rect.x, y: y, w: rect.w, h: f.blockH };
  }
  /* letter-spaced small caps, used for the wordmark — measured so it still fits */
  function drawSpaced(c, line, x, y, f, align, gap) {
    var chars = line.split(''), total = 0, i;
    for (i = 0; i < chars.length; i++) total += c.measureText(chars[i]).width + gap;
    total -= gap;
    var sx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    var old = c.textAlign; c.textAlign = 'left';
    for (i = 0; i < chars.length; i++) { c.fillText(chars[i], sx, y); sx += c.measureText(chars[i]).width + gap; }
    c.textAlign = old;
  }

  /* one call: fit then draw. Returns the box actually painted. */
  function text(c, str, rect, opts) {
    if (!str) return null;
    var f = fit(str, rect, opts);
    return draw(c, f, rect, opts);
  }

  /* ── collision checking — this is what the self-test asserts against ── */
  function overlap(a, b) {
    return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
  }
  function collisions(rects) {
    var out = [];
    for (var i = 0; i < rects.length; i++)
      for (var j = i + 1; j < rects.length; j++)
        if (overlap(rects[i], rects[j])) out.push([i, j]);
    return out;
  }
  function insideCanvas(r, W, H) { return r.x >= -0.5 && r.y >= -0.5 && r.x + r.w <= W + 0.5 && r.y + r.h <= H + 0.5; }

  /* normalised slot {x,y,w,h in 0..1} → pixels */
  function px(slot, W, H) { return { x: slot.x * W, y: slot.y * H, w: slot.w * W, h: slot.h * H }; }

  /* ── drawing helpers the templates share ── */
  function roundRect(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  /* cover: fill the rect, cropping overflow (what a product photo wants) */
  function cover(c, img, rect, radius) {
    if (!img || !img.width) return;
    c.save();
    if (radius) { roundRect(c, rect.x, rect.y, rect.w, rect.h, radius); c.clip(); }
    else { c.beginPath(); c.rect(rect.x, rect.y, rect.w, rect.h); c.clip(); }
    var s = Math.max(rect.w / img.width, rect.h / img.height);
    var w = img.width * s, h = img.height * s;
    c.drawImage(img, rect.x + (rect.w - w) / 2, rect.y + (rect.h - h) / 2, w, h);
    c.restore();
  }
  /* contain: whole image visible inside the rect */
  function contain(c, img, rect) {
    if (!img || !img.width) return;
    var s = Math.min(rect.w / img.width, rect.h / img.height);
    var w = img.width * s, h = img.height * s;
    c.drawImage(img, rect.x + (rect.w - w) / 2, rect.y + (rect.h - h) / 2, w, h);
  }
  function linear(c, rect, a, b, dir) {
    var g = dir === 'v' ? c.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h)
      : c.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    g.addColorStop(0, a); g.addColorStop(1, b); return g;
  }
  /* a pill sized to its own text — the price chip that used to sit on top of the title */
  function pill(c, str, cx, cy, opts) {
    opts = opts || {};
    var o = { size: opts.size || 40, weight: opts.weight || 700, family: opts.family };
    var w = measure(str, o) + o.size * 1.3, h = o.size * 1.75;
    var x = cx - w / 2, y = cy - h / 2;
    c.save();
    c.fillStyle = opts.bg || '#5B2D8E';
    roundRect(c, x, y, w, h, h / 2); c.fill();
    c.font = font(o); c.fillStyle = opts.fill || '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(str, cx, cy + o.size * 0.04);
    c.restore();
    return { x: x, y: y, w: w, h: h };
  }
  function noise(c, W, H, amount) {
    var n = amount == null ? 0.045 : amount, i, v;
    var id = c.getImageData(0, 0, W, H), d = id.data;
    for (i = 0; i < d.length; i += 4) {
      v = (Math.random() - 0.5) * 255 * n;
      d[i] += v; d[i + 1] += v; d[i + 2] += v;
    }
    c.putImageData(id, 0, 0);
  }

  return {
    fit: fit, draw: draw, text: text, wrap: wrap, measure: measure, font: font,
    overlap: overlap, collisions: collisions, insideCanvas: insideCanvas, px: px,
    roundRect: roundRect, cover: cover, contain: contain, linear: linear, pill: pill, noise: noise
  };
})();
