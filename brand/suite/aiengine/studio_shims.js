/* ═══════════ offline shims for the embedded Image Studio Pro ═══════════
   Their tool pulls JSZip and SheetJS from CDNs with synchronous <script src> tags in the
   head. Offline — which is the whole point of this app — those never resolve, the HTML
   parser stalls on them and the document never gets past </head>. So the CDN tags are
   removed and these stand in, backed by the spreadsheet engine already bundled here.
   The tool's own code is untouched; it just finds JSZip and XLSX already defined. */
(function () {
  'use strict';

  /* ── JSZip: new JSZip() · .file() · .folder() · .generateAsync({type:'blob'}) ── */
  if (typeof window.JSZip === 'undefined') {
    function Zip(prefix) { this._p = prefix || ''; this._f = (prefix ? null : []); this._root = this; }
    Zip.prototype.file = function (name, data) {
      var root = this._root || this;
      root._f.push({ name: this._p + name, data: data });
      return this;
    };
    Zip.prototype.folder = function (name) {
      var z = new Zip((this._p || '') + String(name).replace(/\/+$/, '') + '/');
      z._root = this._root || this;
      return z;
    };
    Zip.prototype.generateAsync = function (opts) {
      var root = this._root || this, list = root._f || [];
      return Promise.all(list.map(function (e) { return toBytes(e.data).then(function (b) { return { name: e.name, data: b }; }); }))
        .then(function (entries) {
          var bytes = VSheet.zip(entries);
          var type = (opts && opts.type) || 'blob';
          if (type === 'blob') return new Blob([bytes], { type: 'application/zip' });
          if (type === 'uint8array') return bytes;
          if (type === 'arraybuffer') return bytes.buffer;
          return new Blob([bytes], { type: 'application/zip' });
        });
    };
    function toBytes(d) {
      if (d instanceof Uint8Array) return Promise.resolve(d);
      if (d instanceof ArrayBuffer) return Promise.resolve(new Uint8Array(d));
      if (typeof Blob !== 'undefined' && d instanceof Blob)
        return d.arrayBuffer().then(function (b) { return new Uint8Array(b); });
      if (typeof d === 'string') {
        /* a bare base64 payload (their canvas exports) or plain text */
        var m = d.match(/^data:[^,]*;base64,(.*)$/);
        var b64 = m ? m[1] : (/^[A-Za-z0-9+/=\s]+$/.test(d) && d.length > 64 ? d : null);
        if (b64) {
          var bin = atob(b64.replace(/\s+/g, '')), a = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
          return Promise.resolve(a);
        }
        return Promise.resolve(new TextEncoder().encode(d));
      }
      return Promise.resolve(new Uint8Array(0));
    }
    window.JSZip = Zip;
  }

  /* ── SheetJS: only XLSX.read and XLSX.utils.sheet_to_json are used ── */
  if (typeof window.XLSX === 'undefined') {
    window.XLSX = {
      read: function (data, opts) {
        var rows = [];
        try {
          if (typeof data === 'string' && !(opts && /array|binary|buffer/.test(opts.type || ''))) {
            rows = VSheet.readCsv(data);
          } else {
            var arr = data instanceof Uint8Array ? data
              : data instanceof ArrayBuffer ? new Uint8Array(data)
              : new Uint8Array(0);
            var wb = VSheet.readXlsx(arr);
            rows = (wb && wb.rows) ? wb.rows : (wb && wb[0] && wb[0].rows) ? wb[0].rows : [];
          }
        } catch (e) { rows = []; }
        var name = 'Sheet1', sheets = {};
        sheets[name] = { __rows: rows };
        return { SheetNames: [name], Sheets: sheets };
      },
      utils: {
        sheet_to_json: function (sheet, opts) {
          var rows = (sheet && sheet.__rows) || [];
          if (opts && opts.header === 1) return rows;
          var head = rows[0] || [];
          return rows.slice(1).map(function (r) {
            var o = {};
            head.forEach(function (h, i) { o[String(h)] = r[i] == null ? '' : r[i]; });
            return o;
          });
        }
      }
    };
  }
})();
