/* Medhava Suite — spreadsheets, with nothing behind them.

   Reads and writes real .xlsx workbooks and .csv files with NO library, no CDN, no account
   and no internet. Every byte of it is here. That is not showing off: an ERP whose "upload
   your Excel" button needs a 2 MB download from somebody else's server is an ERP that stops
   working the day that server does — which is exactly the dependency the no-lock-in rule
   forbids, and it would be a strange rule to hold for AI and couriers but not for the one
   button every single customer presses on day one.

   An .xlsx file is a ZIP of XML. So this file contains, in order:
     1. CRC-32 and a raw DEFLATE decompressor  (needed to READ what Excel wrote)
     2. a ZIP reader and a ZIP writer          (the container)
     3. an .xlsx reader and an .xlsx writer    (the XML inside it)
     4. a CSV reader and writer                (the same shape, far simpler)
     5. table helpers — rows of objects in, rows of objects out

   Everything in and out is the same plain shape: an array of arrays, first row = headings.
   Nothing above this file needs to know what a ZIP is. */
var MedhavaSheet = (function (root) {
  'use strict';

  /* ─────────────────────────── 1 · CRC-32 and DEFLATE ─────────────────────────── */

  var CRCT = (function () {
    var t = new Int32Array(256), c, n, k;
    for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c; }
    return t;
  })();
  function crc32(buf) {
    var c = -1, i;
    for (i = 0; i < buf.length; i++) c = CRCT[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  }

  /* A raw-DEFLATE decompressor (RFC 1951). Excel always deflates, so without this we could
     write workbooks but never read one — which would make the upload button a decoration. */
  function Bits(src) { this.b = src; this.p = 0; this.bit = 0; }
  Bits.prototype.get = function (n) {
    var v = 0, i;
    for (i = 0; i < n; i++) {
      if (this.p >= this.b.length) throw new Error('This file ends in the middle of a record — it looks truncated.');
      v |= ((this.b[this.p] >> this.bit) & 1) << i;
      if (++this.bit === 8) { this.bit = 0; this.p++; }
    }
    return v;
  };
  Bits.prototype.align = function () { if (this.bit) { this.bit = 0; this.p++; } };

  /* A canonical Huffman table, built from code lengths — the only form DEFLATE uses. */
  function huff(lengths) {
    var max = 0, i;
    for (i = 0; i < lengths.length; i++) if (lengths[i] > max) max = lengths[i];
    var blCount = new Int32Array(max + 1);
    for (i = 0; i < lengths.length; i++) if (lengths[i]) blCount[lengths[i]]++;
    var code = 0, next = new Int32Array(max + 2), b;
    for (b = 1; b <= max; b++) { code = (code + blCount[b - 1]) << 1; next[b] = code; }
    var codes = new Int32Array(lengths.length);
    for (i = 0; i < lengths.length; i++) if (lengths[i]) codes[i] = next[lengths[i]]++;
    /* decode by walking one bit at a time — slower than a lookup table, but a tenth of the code
       and still far faster than the user can notice on a spreadsheet */
    var byLen = {};
    for (i = 0; i < lengths.length; i++) if (lengths[i]) { (byLen[lengths[i]] = byLen[lengths[i]] || {})[codes[i]] = i; }
    return { max: max, byLen: byLen };
  }
  function decode(bits, tab) {
    var code = 0, len = 0;
    while (len <= tab.max) {
      code = (code << 1) | bits.get(1); len++;
      var row = tab.byLen[len];
      if (row && row[code] !== undefined) return row[code];
    }
    throw new Error('This file uses a compression code we could not read.');
  }
  var LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
  var LEXT = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  var DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
  var DEXT = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  var CLORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
  var FIXLIT = (function () { var l = new Int32Array(288), i;
    for (i = 0; i < 144; i++) l[i] = 8; for (; i < 256; i++) l[i] = 9;
    for (; i < 280; i++) l[i] = 7; for (; i < 288; i++) l[i] = 8; return huff(l); })();
  var FIXDIST = (function () { var l = new Int32Array(30), i; for (i = 0; i < 30; i++) l[i] = 5; return huff(l); })();

  function inflateRaw(src, hint) {
    var bits = new Bits(src), out = new Uint8Array(Math.max(hint || 0, src.length * 4) + 64), o = 0;
    function push(b) { if (o >= out.length) { var n = new Uint8Array(out.length * 2); n.set(out); out = n; } out[o++] = b; }
    for (;;) {
      var last = bits.get(1), type = bits.get(2), lit, dist;
      if (type === 0) {
        bits.align();
        var len = src[bits.p] | (src[bits.p + 1] << 8); bits.p += 4;
        for (var i = 0; i < len; i++) push(src[bits.p++]);
      } else {
        if (type === 1) { lit = FIXLIT; dist = FIXDIST; }
        else if (type === 2) {
          var hlit = bits.get(5) + 257, hdist = bits.get(5) + 1, hclen = bits.get(4) + 4;
          var cl = new Int32Array(19), j;
          for (j = 0; j < hclen; j++) cl[CLORDER[j]] = bits.get(3);
          var clt = huff(cl), all = new Int32Array(hlit + hdist), k = 0, prev = 0;
          while (k < hlit + hdist) {
            var s = decode(bits, clt), rep;
            if (s < 16) { all[k++] = prev = s; }
            else if (s === 16) { rep = bits.get(2) + 3; while (rep--) all[k++] = prev; }
            else if (s === 17) { rep = bits.get(3) + 3; while (rep--) all[k++] = 0; }
            else { rep = bits.get(7) + 11; while (rep--) all[k++] = 0; }
          }
          lit = huff(all.subarray(0, hlit)); dist = huff(all.subarray(hlit));
        } else throw new Error('This file is compressed in a way we do not recognise.');
        for (;;) {
          var sym = decode(bits, lit);
          if (sym === 256) break;
          if (sym < 256) { push(sym); continue; }
          var li = sym - 257, ln = LBASE[li] + bits.get(LEXT[li]);
          var ds = decode(bits, dist), dd = DBASE[ds] + bits.get(DEXT[ds]);
          for (var q = 0; q < ln; q++) push(out[o - dd]);
        }
      }
      if (last) break;
    }
    return out.subarray(0, o);
  }

  /* ─────────────────────────── 2 · the ZIP container ─────────────────────────── */

  function u16(b, p) { return b[p] | (b[p + 1] << 8); }
  function u32(b, p) { return (b[p] | (b[p + 1] << 8) | (b[p + 2] << 16) | (b[p + 3] << 24)) >>> 0; }

  function unzip(bytes) {
    var end = -1, i;
    for (i = bytes.length - 22; i >= 0 && i > bytes.length - 66000; i--)
      if (u32(bytes, i) === 0x06054b50) { end = i; break; }
    if (end < 0) throw new Error('This does not look like an .xlsx file — it is not a zip archive.');
    var count = u16(bytes, end + 10), off = u32(bytes, end + 16), files = {};
    for (i = 0; i < count; i++) {
      if (u32(bytes, off) !== 0x02014b50) break;
      var method = u16(bytes, off + 10), csize = u32(bytes, off + 20), usize = u32(bytes, off + 24);
      var nlen = u16(bytes, off + 28), elen = u16(bytes, off + 30), clen = u16(bytes, off + 32);
      var lho = u32(bytes, off + 42);
      var name = utf8(bytes.subarray(off + 46, off + 46 + nlen));
      var lnlen = u16(bytes, lho + 26), lelen = u16(bytes, lho + 28), data = lho + 30 + lnlen + lelen;
      var raw = bytes.subarray(data, data + csize);
      files[name] = method === 0 ? raw : inflateRaw(raw, usize);
      off += 46 + nlen + elen + clen;
    }
    return files;
  }

  /* We write STORED (uncompressed) entries. A valid zip does not have to be compressed, Excel,
     LibreOffice, Numbers and Google Sheets all open them, and it saves carrying a compressor
     for the sake of a file that is a few hundred kilobytes at worst. */
  function zip(entries) {
    var parts = [], central = [], offset = 0;
    entries.forEach(function (e) {
      var name = bytesOfUtf8(e.name), data = e.data;
      var crc = crc32(data);
      var local = new Uint8Array(30 + name.length);
      var dv = new DataView(local.buffer);
      dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0, true);
      dv.setUint16(8, 0, true); dv.setUint16(10, 0, true); dv.setUint16(12, 0x2821, true);
      dv.setUint32(14, crc, true); dv.setUint32(18, data.length, true); dv.setUint32(22, data.length, true);
      dv.setUint16(26, name.length, true); dv.setUint16(28, 0, true);
      local.set(name, 30);
      parts.push(local, data);
      var cd = new Uint8Array(46 + name.length), cv = new DataView(cd.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
      cv.setUint16(8, 0, true); cv.setUint16(10, 0, true); cv.setUint16(12, 0, true); cv.setUint16(14, 0x2821, true);
      cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
      cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true);
      cd.set(name, 46);
      central.push(cd);
      offset += local.length + data.length;
    });
    var cdSize = central.reduce(function (s, c) { return s + c.length; }, 0);
    var eocd = new Uint8Array(22), ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, entries.length, true); ev.setUint16(10, entries.length, true);
    ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true);
    var all = parts.concat(central, [eocd]);
    var total = all.reduce(function (s, p) { return s + p.length; }, 0);
    var out = new Uint8Array(total), o = 0;
    all.forEach(function (p) { out.set(p, o); o += p.length; });
    return out;
  }

  function utf8(bytes) {
    var s = '', i = 0, c;
    while (i < bytes.length) {
      c = bytes[i++];
      if (c < 0x80) s += String.fromCharCode(c);
      else if (c < 0xE0) s += String.fromCharCode(((c & 0x1F) << 6) | (bytes[i++] & 0x3F));
      else if (c < 0xF0) s += String.fromCharCode(((c & 0x0F) << 12) | ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F));
      else { var cp = ((c & 0x07) << 18) | ((bytes[i++] & 0x3F) << 12) | ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F);
        cp -= 0x10000; s += String.fromCharCode(0xD800 + (cp >> 10), 0xDC00 + (cp & 0x3FF)); }
    }
    return s;
  }
  function bytesOfUtf8(str) {
    var out = [], i, c;
    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xC0 | (c >> 6), 0x80 | (c & 63));
      else if (c >= 0xD800 && c <= 0xDBFF) {
        var cp = 0x10000 + ((c - 0xD800) << 10) + (str.charCodeAt(++i) - 0xDC00);
        out.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      } else out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return new Uint8Array(out);
  }

  /* ─────────────────────────── 3 · the .xlsx XML ─────────────────────────── */

  function xesc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    }).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  }
  function xunesc(s) {
    return String(s).replace(/&#(\d+);/g, function (_, d) { return String.fromCharCode(+d); })
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  }
  function colNum(ref) { /* "AB12" → 27 (1-based) */
    var n = 0, i = 0;
    while (i < ref.length && ref[i] >= 'A' && ref[i] <= 'Z') { n = n * 26 + (ref.charCodeAt(i) - 64); i++; }
    return n;
  }
  function colName(n) { var s = ''; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = (n - 1 - r) / 26; } return s; }

  /* Read every sheet of a workbook into { name: [[cell,…],…] }, first row included as-is. */
  function readXlsx(bytes) {
    var files = unzip(bytes);
    var ss = [];
    if (files['xl/sharedStrings.xml']) {
      var sx = utf8(files['xl/sharedStrings.xml']);
      (sx.match(/<si[\s>][\s\S]*?<\/si>|<si\/>/g) || []).forEach(function (si) {
        var txt = (si.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || []).map(function (t) {
          return xunesc(t.replace(/<t[^>]*>/, '').replace(/<\/t>/, ''));
        }).join('');
        ss.push(txt);
      });
    }
    /* sheet order and names come from workbook.xml; the file each one lives in comes from rels */
    var rels = {};
    if (files['xl/_rels/workbook.xml.rels'])
      (utf8(files['xl/_rels/workbook.xml.rels']).match(/<Relationship[^>]*>/g) || []).forEach(function (r) {
        var id = (r.match(/Id="([^"]+)"/) || [])[1], tg = (r.match(/Target="([^"]+)"/) || [])[1];
        if (id && tg) rels[id] = tg.replace(/^\/?xl\//, '').replace(/^\//, '');
      });
    var out = {}, order = [], n = 0;
    /* `<sheet ` with the space is deliberate: without it the pattern also matches the
       `<sheets>` wrapper and every workbook grows a phantom first tab. */
    (utf8(files['xl/workbook.xml'] || new Uint8Array(0)).match(/<sheet\s[^>]*\/?>/g) || []).forEach(function (s) {
      n++;
      var name = xunesc((s.match(/name="([^"]*)"/) || [])[1] || ('Sheet' + n));
      var rid = (s.match(/r:id="([^"]+)"/) || [])[1];
      var target = (rid && rels[rid]) || ('worksheets/sheet' + n + '.xml');
      var raw = files['xl/' + target] || files[target];
      if (!raw) return;
      out[name] = readSheet(utf8(raw), ss); order.push(name);
    });
    if (!order.length && files['xl/worksheets/sheet1.xml'])
      { out.Sheet1 = readSheet(utf8(files['xl/worksheets/sheet1.xml']), ss); order.push('Sheet1'); }
    return { sheets: out, names: order };
  }
  function readSheet(xml, ss) {
    var rows = [];
    (xml.match(/<row[\s>][\s\S]*?<\/row>|<row[^>]*\/>/g) || []).forEach(function (rx) {
      var cells = [], maxc = 0;
      (rx.match(/<c[\s>][\s\S]*?<\/c>|<c[^>]*\/>/g) || []).forEach(function (cx) {
        var ref = (cx.match(/ r="([A-Z]+)\d+"/) || [])[1];
        var ci = ref ? colNum(ref) : cells.length + 1;
        var t = (cx.match(/ t="([^"]+)"/) || [])[1];
        var v, m;
        if (t === 'inlineStr') { m = cx.match(/<t[^>]*>([\s\S]*?)<\/t>/); v = m ? xunesc(m[1]) : ''; }
        else { m = cx.match(/<v>([\s\S]*?)<\/v>/); v = m ? xunesc(m[1]) : '';
          if (t === 's') v = ss[Number(v)] == null ? '' : ss[Number(v)];
          else if (t === 'b') v = v === '1' ? 'TRUE' : 'FALSE';
          else if (v !== '' && !isNaN(v)) v = Number(v); }
        cells[ci - 1] = v; if (ci > maxc) maxc = ci;
      });
      for (var i = 0; i < maxc; i++) if (cells[i] === undefined) cells[i] = '';
      rows.push(cells);
    });
    return rows;
  }

  /* Write a workbook: { "Sheet name": [[…],[…]] }. Strings go inline, so no shared-string table
     to keep in step — one less thing that can be wrong. */
  function writeXlsx(sheets) {
    var names = Object.keys(sheets).map(function (n) { return String(n).replace(/[\\\/\?\*\[\]:]/g, ' ').slice(0, 31) || 'Sheet'; });
    var seen = {}; names = names.map(function (n) { var b = n, i = 2; while (seen[n.toLowerCase()]) n = (b.slice(0, 28) + ' ' + i++); seen[n.toLowerCase()] = 1; return n; });
    var keys = Object.keys(sheets);
    var entries = [
      { name: '[Content_Types].xml', data: bytesOfUtf8(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        keys.map(function (_, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join('') +
        '</Types>') },
      { name: '_rels/.rels', data: bytesOfUtf8(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>') },
      { name: 'xl/workbook.xml', data: bytesOfUtf8(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
        names.map(function (n, i) { return '<sheet name="' + xesc(n) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join('') +
        '</sheets></workbook>') },
      { name: 'xl/_rels/workbook.xml.rels', data: bytesOfUtf8(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        keys.map(function (_, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join('') +
        '</Relationships>') }
    ];
    keys.forEach(function (k, i) {
      entries.push({ name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: bytesOfUtf8(sheetXml(sheets[k])) });
    });
    return zip(entries);
  }
  function sheetXml(rows) {
    var body = (rows || []).map(function (row, ri) {
      var cells = (row || []).map(function (v, ci) {
        var ref = colName(ci + 1) + (ri + 1);
        if (v === null || v === undefined || v === '') return '';
        if (typeof v === 'number' && isFinite(v)) return '<c r="' + ref + '"><v>' + v + '</v></c>';
        return '<c r="' + ref + '" t="inlineStr"><is><t xml:space="preserve">' + xesc(v) + '</t></is></c>';
      }).join('');
      return '<row r="' + (ri + 1) + '">' + cells + '</row>';
    }).join('');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + body + '</sheetData></worksheet>';
  }

  /* ─────────────────────────── 4 · CSV ─────────────────────────── */

  function readCsv(text) {
    text = String(text).replace(/^﻿/, '');
    var rows = [], row = [], cur = '', q = false, i = 0, c;
    while (i < text.length) {
      c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i += 2; continue; } q = false; i++; continue; }
        cur += c; i++;
      } else if (c === '"') { q = true; i++; }
      else if (c === ',') { row.push(cell(cur)); cur = ''; i++; }
      else if (c === '\r') { i++; }
      else if (c === '\n') { row.push(cell(cur)); rows.push(row); row = []; cur = ''; i++; }
      else { cur += c; i++; }
    }
    if (cur !== '' || row.length) { row.push(cell(cur)); rows.push(row); }
    return rows;
    function cell(s) { s = s.trim(); return (s !== '' && !isNaN(s) && /^-?[\d.]+$/.test(s)) ? Number(s) : s; }
  }
  function writeCsv(rows) {
    return (rows || []).map(function (r) {
      return (r || []).map(function (v) {
        v = v == null ? '' : String(v);
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }).join(',');
    }).join('\n');
  }

  /* ─────────────────────────── 5 · rows of objects ─────────────────────────── */

  /* A table is [[heading,…],[value,…],…]. Turn it into objects using a column map:
       cols = [{k:'gross', l:'Gross', type:'num'}, …]
     Headings are matched case- and space-insensitively against both k and l, so a sheet
     saved as "Net Sales" still lands in `net`. Unknown columns are ignored, not fatal —
     a real export from a marketplace panel always carries columns you do not want. */
  function norm(s) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function toObjects(rows, cols) {
    if (!rows || !rows.length) return { rows: [], mapped: [], ignored: [], missing: cols.map(function (c) { return c.l; }) };
    var head = rows[0].map(norm), idx = {}, mapped = [], missing = [];
    cols.forEach(function (c) {
      var at = head.indexOf(norm(c.k)); if (at < 0) at = head.indexOf(norm(c.l));
      if (at >= 0) { idx[c.k] = at; mapped.push(c.l); } else missing.push(c.l);
    });
    var used = Object.keys(idx).map(function (k) { return idx[k]; });
    var ignored = rows[0].filter(function (h, i) { return used.indexOf(i) < 0 && String(h).trim() !== ''; }).map(String);
    var out = [];
    for (var r = 1; r < rows.length; r++) {
      var line = rows[r]; if (!line || line.every(function (v) { return v === '' || v == null; })) continue;
      var o = {}, any = false;
      cols.forEach(function (c) {
        var v = idx[c.k] === undefined ? '' : line[idx[c.k]];
        if (c.type === 'num') { v = (v === '' || v == null || isNaN(v)) ? 0 : Number(v); if (v) any = true; }
        else { v = String(v == null ? '' : v).trim(); if (v) any = true; }
        o[c.k] = v;
      });
      if (any) out.push(o);
    }
    return { rows: out, mapped: mapped, ignored: ignored, missing: missing };
  }
  function fromObjects(list, cols) {
    return [cols.map(function (c) { return c.l; })].concat((list || []).map(function (o) {
      return cols.map(function (c) { return o[c.k] == null ? '' : o[c.k]; });
    }));
  }

  /* ─────────────────────────── browser plumbing ─────────────────────────── */

  function download(name, bytes, mime) {
    var blob = new Blob([bytes], { type: mime || 'application/octet-stream' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function saveXlsx(name, sheets) { download(name, writeXlsx(sheets), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); }
  function saveCsv(name, rows) { download(name, '﻿' + writeCsv(rows), 'text/csv;charset=utf-8'); }

  /* One entry point for "the user picked a file": works out what it is and hands back sheets. */
  function readFile(file, done, fail) {
    var isX = /\.xlsx$/i.test(file.name), rd = new FileReader();
    rd.onerror = function () { fail('That file could not be read from disk.'); };
    rd.onload = function () {
      try {
        if (isX) { var wb = readXlsx(new Uint8Array(rd.result)); done(wb.sheets, wb.names, 'xlsx'); }
        else { var rows = readCsv(rd.result); var nm = file.name.replace(/\.[^.]+$/, ''); var s = {}; s[nm] = rows; done(s, [nm], 'csv'); }
      } catch (e) { fail(e.message || 'That file could not be read.'); }
    };
    if (isX) rd.readAsArrayBuffer(file); else rd.readAsText(file);
  }

  var API = { crc32: crc32, inflateRaw: inflateRaw, unzip: unzip, zip: zip,
    readXlsx: readXlsx, writeXlsx: writeXlsx, readCsv: readCsv, writeCsv: writeCsv,
    toObjects: toObjects, fromObjects: fromObjects, colName: colName, colNum: colNum,
    saveXlsx: saveXlsx, saveCsv: saveCsv, download: download, readFile: readFile,
    utf8: utf8, bytesOfUtf8: bytesOfUtf8 };

  if (root) root.MedhavaSheet = API;
  return API;
})(typeof window !== 'undefined' ? window : null);
if (typeof module !== 'undefined' && module.exports) module.exports = MedhavaSheet;
