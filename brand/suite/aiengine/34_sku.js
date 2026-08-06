/* ═══════════ Vastrangam AI Engine — SKU parsing & colour-variant grouping ═══════════
   The catalogue used to treat RAYON_FOILPAN_WINE, RAYON_FOILPAN_BLACK, RAYON_FOILPAN_BLUE
   and RAYON_FOILPAN_RED as four unrelated products, each with its own title. They are one
   product in four colours: ONE handle, ONE title, ONE description, with each colour a
   variant and every pose an image under it.

   Splitting the colour off the end is not quite "take the last underscore chunk", because
   ROYAL_BLUE and ROSE_GOLD are two chunks. So we match the longest known colour phrase at
   the end of the SKU first, and only fall back to the last chunk when nothing is known. */
var VSKU = (function () {
  'use strict';

  /* colour vocabulary — longest phrases first so ROYAL BLUE beats BLUE */
  var COLOURS = [
    'ROYAL BLUE', 'NAVY BLUE', 'SKY BLUE', 'POWDER BLUE', 'PEACOCK BLUE', 'TEAL BLUE',
    'ROSE GOLD', 'ANTIQUE GOLD', 'OLD ROSE', 'DUSTY ROSE', 'BABY PINK', 'HOT PINK', 'RANI PINK',
    'BOTTLE GREEN', 'MEHENDI GREEN', 'OLIVE GREEN', 'SAGE GREEN', 'PISTA GREEN', 'FOREST GREEN',
    'MUSTARD YELLOW', 'LEMON YELLOW', 'COFFEE BROWN', 'CHOCOLATE BROWN', 'RUST ORANGE',
    'OFF WHITE', 'DARK GREY', 'LIGHT GREY', 'STEEL GREY', 'WINE RED', 'BLOOD RED', 'CHERRY RED',
    'SEA GREEN', 'MINT GREEN', 'LAVENDER PURPLE', 'DEEP PURPLE', 'JET BLACK',
    'WINE', 'MAROON', 'BLACK', 'WHITE', 'RED', 'BLUE', 'GREEN', 'YELLOW', 'PINK', 'PURPLE',
    'ORANGE', 'BROWN', 'GREY', 'GRAY', 'BEIGE', 'CREAM', 'IVORY', 'GOLD', 'SILVER', 'PEACH',
    'TEAL', 'RANI', 'MUSTARD', 'OLIVE', 'SAGE', 'PISTA', 'MEHENDI', 'LAVENDER', 'MAGENTA',
    'TURQUOISE', 'CORAL', 'RUST', 'MAUVE', 'ONION', 'FIROZI', 'GAJRI', 'CHIKU', 'SKY', 'NAVY'
  ].sort(function (a, b) { return b.length - a.length; });

  function norm(s) {
    return String(s || '')
      .replace(/\.[a-z0-9]{2,5}$/i, '')                 /* drop the extension */
      .replace(/[_\-.]+/g, ' ')                          /* separators → spaces */
      .replace(/\s+/g, ' ')
      .trim();
  }
  /* pose words that may trail the filename — stripped before colour matching */
  var POSE_RE = /\b(front|back|side|closeup|close up|close|detail|look|hero|main|rear|profile|zoom|macro|full|\d{1,2})\b\s*$/i;
  function stripPose(s) {
    var prev;
    do { prev = s; s = s.replace(POSE_RE, '').trim(); } while (s !== prev && s);
    return s;
  }

  /* RAYON_FOILPAN_ROYAL_BLUE-front.jpg → { base:'RAYON FOILPAN', colour:'Royal Blue', … } */
  function parse(name) {
    var raw = norm(name);
    var pose = detectPose(name);
    var body = stripPose(raw).toUpperCase();
    var colour = '', base = body;

    for (var i = 0; i < COLOURS.length; i++) {
      var c = COLOURS[i];
      /* the colour must sit at the END of the SKU, on a word boundary */
      if (body === c || body.slice(-(c.length + 1)) === ' ' + c) {
        colour = c;
        base = body.slice(0, body.length - c.length).trim();
        break;
      }
    }
    if (!colour) {
      /* nothing known — fall back to the last chunk, which is the documented convention */
      var parts = body.split(' ');
      if (parts.length > 1) { colour = parts.pop(); base = parts.join(' '); }
    }
    return {
      base: titleise(base) || titleise(body),
      baseKey: (base || body).toUpperCase().replace(/\s+/g, '_'),
      colour: titleise(colour),
      pose: pose,
      raw: raw
    };
  }
  function detectPose(name) {
    var n = String(name).toLowerCase();
    if (/\bback\b|rear|behind/.test(n)) return 'back';
    if (/close ?-?up|closeup|zoom|macro|detail|fabric/.test(n)) return 'closeup';
    if (/\bside\b|profile|angle/.test(n)) return 'side';
    if (/\blook\b|full|ootd/.test(n)) return 'look';
    return 'front';
  }
  function titleise(s) {
    return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim()
      .replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
  }
  /* does this filename look like a real SKU rather than camera-roll junk? */
  function looksLikeSKU(name) {
    var n = norm(name);
    if (/whatsapp|screenshot|^img |^dsc |^pxl |^photo |untitled/i.test(n)) return false;
    return /[_\-]/.test(String(name)) && n.split(' ').length >= 2;
  }

  /* group a set of catalogue rows into products → colour variants → poses */
  function group(rows) {
    var byBase = {};
    rows.forEach(function (r) {
      var p = r.sku ? parse(r.sku) : parse(r.name);
      /* anything the user typed by hand wins over the filename */
      var base = (r.product && r.productManual) ? r.product : p.base;
      var colour = (r.colour && r.colourManual) ? r.colour : (p.colour || r.colour || 'Default');
      var key = (base || 'Product').toUpperCase();
      byBase[key] = byBase[key] || { name: base || 'Product', baseKey: p.baseKey, variants: {} };
      byBase[key].variants[colour] = byBase[key].variants[colour] || [];
      byBase[key].variants[colour].push({
        id: r.id, key: r.key, thumbKey: r.thumbKey, name: r.name,
        pose: (r.poseManual ? r.pose : (p.pose || r.pose || 'front')),
        hasWatermark: r.hasWatermark, isCollage: r.isCollage, hex: r.colourHex
      });
    });
    return Object.keys(byBase).map(function (k) {
      var b = byBase[k];
      return {
        name: b.name, baseKey: b.baseKey,
        variants: Object.keys(b.variants).map(function (c) {
          var shots = b.variants[c];
          /* front first, then back, closeup, side — a predictable image order */
          var order = { front: 0, look: 1, back: 2, side: 3, closeup: 4, detail: 5 };
          shots.sort(function (x, y) { return (order[x.pose] == null ? 9 : order[x.pose]) - (order[y.pose] == null ? 9 : order[y.pose]); });
          return { colour: c === 'Default' ? '' : c, hex: (shots[0] || {}).hex || '', shots: shots };
        })
      };
    });
  }

  return { parse: parse, group: group, COLOURS: COLOURS, looksLikeSKU: looksLikeSKU, titleise: titleise, detectPose: detectPose };
})();
