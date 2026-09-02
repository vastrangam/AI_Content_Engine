/* A workbook writer that can carry formatting.

   brand/suite/xlsx.js writes values and nothing else, on purpose: sixteen apps
   depend on it and it stays small. But both master prompts specify a formatted
   report — merged title bands, coloured section headers, a teal grand-total row
   driven by real =SUM() formulas, frozen panes, currency formats — and a bare
   grid is not the thing the business asked for. So the styling lives here, in
   its own file, and xlsx.js is left untouched.

   What this adds over the plain writer:
     · styles.xml — fonts, fills, borders, number formats, alignment
     · merged cells, frozen panes, column widths, row heights
     · <f> formulas, so a total in the delivered file recalculates rather than
       being a number somebody typed
     · gridlines off

   A cell is { v, s, f } — value, style id, optional formula. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.StudioXlsx = api;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function xesc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      /* control characters are illegal in XML and Excel refuses the whole file */
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  }
  function colName(n) {
    var s = '';
    while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; }
    return s;
  }

  /* ── the style sheet ──────────────────────────────────────────────────────
     Styles are declared by name and resolved to the numeric ids Excel wants, so
     nothing above this file counts fonts. */
  function Styles() {
    this.fonts = [{ sz: 11, name: 'Calibri' }];
    this.fills = [{ pattern: 'none' }, { pattern: 'gray125' }];   // both reserved by the format
    this.borders = [{}];
    this.numFmts = [];
    this.xfs = [{ font: 0, fill: 0, border: 0 }];
    this.named = {};
  }
  Styles.prototype._idx = function (list, obj) {
    var key = JSON.stringify(obj);
    for (var i = 0; i < list.length; i++) if (JSON.stringify(list[i]) === key) return i;
    list.push(obj); return list.length - 1;
  };
  /** define('header', { bold:true, color:'FFFFFF', fill:'8E44AD', size:9, … }) */
  Styles.prototype.define = function (name, d) {
    d = d || {};
    var font = this._idx(this.fonts, {
      sz: d.size || 9, name: d.font || 'Arial',
      b: !!d.bold, i: !!d.italic, color: d.color || null
    });
    var fill = d.fill ? this._idx(this.fills, { pattern: 'solid', fg: d.fill }) : 0;
    var border = d.border ? this._idx(this.borders, { color: d.border === true ? 'BFBFBF' : d.border }) : 0;
    var numFmt = 0;
    if (d.numFmt) {
      var at = this.numFmts.indexOf(d.numFmt);
      if (at < 0) { this.numFmts.push(d.numFmt); at = this.numFmts.length - 1; }
      numFmt = 164 + at;                                   // 164 is the first id free for custom formats
    }
    var xf = { font: font, fill: fill, border: border, numFmt: numFmt, align: d.align || null, wrap: !!d.wrap, indent: d.indent || 0 };
    this.named[name] = this._idx(this.xfs, xf);
    return this.named[name];
  };
  Styles.prototype.id = function (name) {
    return Object.prototype.hasOwnProperty.call(this.named, name) ? this.named[name] : 0;
  };
  Styles.prototype.xml = function () {
    var f = this.fonts.map(function (x) {
      return '<font><sz val="' + (x.sz || 11) + '"/><name val="' + xesc(x.name || 'Calibri') + '"/>' +
        (x.b ? '<b/>' : '') + (x.i ? '<i/>' : '') +
        (x.color ? '<color rgb="FF' + x.color + '"/>' : '') + '</font>';
    }).join('');
    var fl = this.fills.map(function (x) {
      if (x.pattern === 'solid') return '<fill><patternFill patternType="solid"><fgColor rgb="FF' + x.fg + '"/><bgColor indexed="64"/></patternFill></fill>';
      return '<fill><patternFill patternType="' + x.pattern + '"/></fill>';
    }).join('');
    var b = this.borders.map(function (x) {
      if (!x.color) return '<border><left/><right/><top/><bottom/><diagonal/></border>';
      var s = '<left style="thin"><color rgb="FF' + x.color + '"/></left>' +
        '<right style="thin"><color rgb="FF' + x.color + '"/></right>' +
        '<top style="thin"><color rgb="FF' + x.color + '"/></top>' +
        '<bottom style="thin"><color rgb="FF' + x.color + '"/></bottom>';
      return '<border>' + s + '<diagonal/></border>';
    }).join('');
    var nf = this.numFmts.map(function (code, i) {
      return '<numFmt numFmtId="' + (164 + i) + '" formatCode="' + xesc(code) + '"/>';
    }).join('');
    var xf = this.xfs.map(function (x) {
      var al = (x.align || x.wrap || x.indent)
        ? '<alignment' + (x.align ? ' horizontal="' + x.align + '"' : '') +
          ' vertical="center"' + (x.wrap ? ' wrapText="1"' : '') +
          (x.indent ? ' indent="' + x.indent + '"' : '') + '/>'
        : '';
      return '<xf numFmtId="' + (x.numFmt || 0) + '" fontId="' + (x.font || 0) + '" fillId="' + (x.fill || 0) +
        '" borderId="' + (x.border || 0) + '" xfId="0"' +
        (x.numFmt ? ' applyNumberFormat="1"' : '') + (x.font ? ' applyFont="1"' : '') +
        (x.fill ? ' applyFill="1"' : '') + (x.border ? ' applyBorder="1"' : '') +
        (al ? ' applyAlignment="1">' + al + '</xf>' : '/>');
    }).join('');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      (nf ? '<numFmts count="' + this.numFmts.length + '">' + nf + '</numFmts>' : '') +
      '<fonts count="' + this.fonts.length + '">' + f + '</fonts>' +
      '<fills count="' + this.fills.length + '">' + fl + '</fills>' +
      '<borders count="' + this.borders.length + '">' + b + '</borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="' + this.xfs.length + '">' + xf + '</cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      '</styleSheet>';
  };

  /* ── a sheet ──────────────────────────────────────────────────────────── */
  function Sheet(name) {
    this.name = name; this.rows = []; this.merges = []; this.cols = [];
    this.freeze = null; this.heights = {};
  }
  /** push a row of cells; each is a value, or { v, s, f } */
  Sheet.prototype.add = function (cells) { this.rows.push(cells || []); return this.rows.length; };
  Sheet.prototype.merge = function (r1, c1, r2, c2) {
    this.merges.push(colName(c1) + r1 + ':' + colName(c2) + r2);
  };
  Sheet.prototype.widths = function (list) { this.cols = list || []; };
  Sheet.prototype.height = function (row, h) { this.heights[row] = h; };
  Sheet.prototype.freezeAt = function (row) { this.freeze = row; };
  Sheet.prototype.xml = function () {
    var self = this;
    var body = this.rows.map(function (row, ri) {
      var cells = (row || []).map(function (cell, ci) {
        var c = (cell && typeof cell === 'object' && !(cell instanceof Date)) ? cell : { v: cell };
        var ref = colName(ci + 1) + (ri + 1);
        var s = c.s ? ' s="' + c.s + '"' : '';
        if (c.f) return '<c r="' + ref + '"' + s + '><f>' + xesc(c.f) + '</f></c>';
        if (c.v === null || c.v === undefined || c.v === '') return s ? '<c r="' + ref + '"' + s + '/>' : '';
        if (typeof c.v === 'number' && isFinite(c.v)) return '<c r="' + ref + '"' + s + '><v>' + c.v + '</v></c>';
        return '<c r="' + ref + '"' + s + ' t="inlineStr"><is><t xml:space="preserve">' + xesc(c.v) + '</t></is></c>';
      }).join('');
      var h = self.heights[ri + 1] ? ' ht="' + self.heights[ri + 1] + '" customHeight="1"' : '';
      return '<row r="' + (ri + 1) + '"' + h + '>' + cells + '</row>';
    }).join('');
    var cols = this.cols.length
      ? '<cols>' + this.cols.map(function (w, i) {
        return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>';
      }).join('') + '</cols>' : '';
    /* showGridLines="0" is in the spec for every sheet in both workbooks. */
    var pane = this.freeze
      ? '<pane ySplit="' + (this.freeze - 1) + '" topLeftCell="A' + this.freeze + '" activePane="bottomLeft" state="frozen"/>' +
        '<selection pane="bottomLeft"/>'
      : '';
    var views = '<sheetViews><sheetView workbookViewId="0" showGridLines="0">' + pane + '</sheetView></sheetViews>';
    var merges = this.merges.length
      ? '<mergeCells count="' + this.merges.length + '">' +
        this.merges.map(function (m) { return '<mergeCell ref="' + m + '"/>'; }).join('') + '</mergeCells>' : '';
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      views + cols + '<sheetData>' + body + '</sheetData>' + merges + '</worksheet>';
  };

  /* ── the workbook, zipped by xlsx.js's own writer ─────────────────────── */
  function Workbook() { this.sheets = []; this.styles = new Styles(); }
  Workbook.prototype.sheet = function (name) {
    var s = new Sheet(String(name).replace(/[\\\/\?\*\[\]:]/g, ' ').slice(0, 31) || 'Sheet');
    this.sheets.push(s); return s;
  };
  /** @param {function} zip  the ZIP writer, passed in so this file stays free of one */
  Workbook.prototype.build = function (zip, bytesOfUtf8) {
    var sheets = this.sheets;
    var parts = [
      { name: '[Content_Types].xml', data: bytesOfUtf8(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        sheets.map(function (_, i) {
          return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
        }).join('') + '</Types>') },
      { name: '_rels/.rels', data: bytesOfUtf8(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>') },
      { name: 'xl/workbook.xml', data: bytesOfUtf8(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
        sheets.map(function (s, i) {
          return '<sheet name="' + xesc(s.name) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>';
        }).join('') + '</sheets></workbook>') },
      { name: 'xl/_rels/workbook.xml.rels', data: bytesOfUtf8(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        sheets.map(function (_, i) {
          return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>';
        }).join('') +
        '<Relationship Id="rId' + (sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        '</Relationships>') },
      { name: 'xl/styles.xml', data: bytesOfUtf8(this.styles.xml()) }
    ];
    sheets.forEach(function (s, i) {
      parts.push({ name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: bytesOfUtf8(s.xml()) });
    });
    return zip(parts);
  };

  /* ── the palette both master prompts specify, in one place ───────────── */
  var PALETTE = {
    title: '2C3E50', header: '8E44AD', section: '4A235A', total: '1ABC9C',
    subtotal: 'D4E6F1', alt: 'F4ECF7', bad: 'FADBD8', badInk: 'C0392B',
    sets: {
      'Anarkali Plazo Set': 'E8D5F5', 'Kurti Palazzo Set': 'D5EAF5',
      'Lehenga Choli Set': 'F5D5E8', 'Kurti Plazo Set': 'D5F5E8',
      'Top Set': 'FFF3CD', 'Bottom Wear Set': 'FFE0CC', 'Uniform Set': 'E8E8E8',
      'Dupatta Set': 'F0E6FF', 'Co-Ords Set': 'CCF5F0', 'Kurta Set': 'F5F0CC',
      'Alter Set': 'F5CCCC', 'Readymade Saree Set': 'CCE5FF', 'Readymade Blouse Set': 'FFE5CC'
    }
  };

  return { Workbook: Workbook, Styles: Styles, Sheet: Sheet, PALETTE: PALETTE, colName: colName, xesc: xesc };
}));
