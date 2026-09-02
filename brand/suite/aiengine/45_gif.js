/* ═══════════ Compact GIF89a encoder — self-contained, offline ═══════════
   Web-safe 216-colour palette + greys, nearest-colour mapping, LZW compression.
   Enough to turn a handful of canvas frames into a looping animated GIF with no library. */
var VGif = (function () {
  'use strict';
  /* palette: 216 web-safe + 40 greys = 256 */
  var PAL = [], LUT = new Int16Array(4096).fill(-1);
  (function () {
    var steps = [0, 51, 102, 153, 204, 255];
    for (var r = 0; r < 6; r++) for (var g = 0; g < 6; g++) for (var b = 0; b < 6; b++) PAL.push([steps[r], steps[g], steps[b]]);
    for (var i = 0; i < 40; i++) { var v = Math.round(i / 39 * 255); PAL.push([v, v, v]); }
  })();
  function nearest(r, g, b) {
    var key = (r >> 4) << 8 | (g >> 4) << 4 | (b >> 4);
    if (LUT[key] >= 0) return LUT[key];
    var best = 0, bd = 1e9;
    for (var i = 0; i < PAL.length; i++) { var p = PAL[i], dr = p[0] - r, dg = p[1] - g, db = p[2] - b, d = dr * dr + dg * dg + db * db; if (d < bd) { bd = d; best = i; } }
    LUT[key] = best; return best;
  }

  function lzw(indices, w, h) {
    var minCode = 8, clear = 1 << minCode, eoi = clear + 1;
    var out = [], cur = 0, curBits = 0;
    function emit(code, bits) { cur |= code << curBits; curBits += bits; while (curBits >= 8) { out.push(cur & 255); cur >>= 8; curBits -= 8; } }
    var dict = {}, next = eoi + 1, codeSize = minCode + 1;
    function reset() { dict = {}; for (var i = 0; i < clear; i++) dict[i] = i; next = eoi + 1; codeSize = minCode + 1; }
    reset(); emit(clear, codeSize);
    var prefix = indices[0] + '';
    for (var i = 1; i < indices.length; i++) {
      var k = indices[i], key = prefix + ',' + k;
      if (dict[key] != null) prefix = key;
      else { emit(dict[prefix], codeSize); dict[key] = next++; if (next > (1 << codeSize) && codeSize < 12) codeSize++; if (next >= 4096) { emit(clear, codeSize); reset(); } prefix = k + ''; }
    }
    emit(dict[prefix], codeSize); emit(eoi, codeSize); if (curBits > 0) out.push(cur & 255);
    return out;
  }

  function encode(frames, w, h, delayCs) {
    var bytes = [];
    function b(v) { bytes.push(v & 255); }
    function s(str) { for (var i = 0; i < str.length; i++) b(str.charCodeAt(i)); }
    function w16(v) { b(v); b(v >> 8); }
    s('GIF89a'); w16(w); w16(h); b(0xF7); b(0); b(0);            /* global colour table, 256 */
    for (var i = 0; i < 256; i++) { var p = PAL[i] || [0, 0, 0]; b(p[0]); b(p[1]); b(p[2]); }
    b(0x21); b(0xFF); b(11); s('NETSCAPE2.0'); b(3); b(1); w16(0); b(0);  /* loop forever */
    frames.forEach(function (data) {
      b(0x21); b(0xF9); b(4); b(0); w16(delayCs); b(0); b(0);   /* graphic control */
      b(0x2C); w16(0); w16(0); w16(w); w16(h); b(0);            /* image descriptor */
      var idx = new Uint8Array(w * h);
      for (var i = 0, j = 0; i < data.length; i += 4, j++) idx[j] = nearest(data[i], data[i + 1], data[i + 2]);
      b(8);
      var comp = lzw(idx, w, h);
      for (var k = 0; k < comp.length;) { var n = Math.min(255, comp.length - k); b(n); for (var m = 0; m < n; m++) b(comp[k++]); }
      b(0);
    });
    b(0x3B);
    return new Uint8Array(bytes);
  }
  return { encode: encode };
})();
