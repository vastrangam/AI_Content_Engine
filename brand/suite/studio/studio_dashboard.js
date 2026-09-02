/* Vastrangam BOS — the dashboard, honestly named.

   "Give me a Power BI dashboard report" was one of the two example requests
   this was built for. There is no Power BI runtime here — .pbix is a
   proprietary binary format that only Power BI Desktop writes, and pretending
   to produce one would be exactly the kind of claim this codebase's rules
   forbid. What ships instead is what a Power BI dashboard actually gives a
   reader: KPI tiles up top, a handful of charts that answer the questions a
   manager actually asks, in one file that opens by double-clicking with the
   network off — same rule as the rest of this suite.

   Every number on this page comes from the same ecommerce()/karigar() result
   verify_studio.js already checked against real data. This file draws it, it
   does not compute it. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.StudioDashboard = api;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  var fmt = function (n) { return Math.round(n || 0).toLocaleString('en-IN'); };
  var rupees = function (n) {
    return '₹' + (Math.round((n || 0) * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  var PALETTE = ['#6b4fa8', '#128f77', '#c7883a', '#a8321f', '#3a6ea8', '#8a6100', '#4a235a', '#0b6b59'];

  /* ── chart primitives: plain inline SVG, no library, crisp at any zoom ──── */

  /** Horizontal bar list — the workhorse for "top N by X". Long labels stay
   *  readable because the bar grows sideways, not up. */
  function hbars(items, opts) {
    opts = opts || {};
    var w = opts.width || 640, rowH = opts.rowH || 30, gap = 6, labelW = opts.labelW || 190;
    var barW = w - labelW - 70;
    var max = Math.max.apply(null, items.map(function (x) { return x.value; }).concat([1]));
    var h = items.length * (rowH + gap);
    var money = !!opts.money;
    var rows = items.map(function (x, i) {
      var y = i * (rowH + gap);
      var bw = Math.max(2, (x.value / max) * barW);
      var color = opts.color || PALETTE[i % PALETTE.length];
      return '<text x="' + (labelW - 8) + '" y="' + (y + rowH / 2 + 4) + '" text-anchor="end" ' +
        'font-size="12.5" fill="var(--ink-soft)">' + esc(trim(x.label, 26)) + '</text>' +
        '<rect x="' + labelW + '" y="' + y + '" width="' + bw + '" height="' + rowH + '" rx="5" fill="' + color + '"/>' +
        '<text x="' + (labelW + bw + 8) + '" y="' + (y + rowH / 2 + 4) + '" font-size="12.5" font-weight="600" ' +
        'fill="var(--ink)">' + (money ? rupees(x.value) : fmt(x.value)) + '</text>';
    }).join('');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="' + h + '" role="img" aria-label="' +
      esc(opts.label || 'chart') + '">' + rows + '</svg>';
  }

  /** A two-or-more-slice donut — used for coverage (priced vs not, rate OK vs
   *  not) where the whole point is the proportion, not the exact count. */
  function donut(parts, opts) {
    opts = opts || {};
    var size = opts.size || 168, r = size / 2 - 14, cx = size / 2, cy = size / 2, cw = 22;
    var total = parts.reduce(function (s, p) { return s + p.value; }, 0) || 1;
    var a0 = -90, segs = '';
    parts.forEach(function (p, i) {
      var frac = p.value / total, a1 = a0 + frac * 360;
      segs += arc(cx, cy, r, a0, a1, p.color || PALETTE[i % PALETTE.length], cw);
      a0 = a1;
    });
    var legend = parts.map(function (p, i) {
      return '<div class="dlg"><span style="background:' + (p.color || PALETTE[i % PALETTE.length]) + '"></span>' +
        esc(p.label) + ' <b>' + fmt(p.value) + '</b></div>';
    }).join('');
    return '<div class="donutwrap"><svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '">' +
      segs + '<text x="' + cx + '" y="' + (cy + 5) + '" text-anchor="middle" font-size="19" font-weight="700" ' +
      'fill="var(--ink)">' + fmt(total) + '</text></svg><div class="dleg">' + legend + '</div></div>';
  }
  function arc(cx, cy, r, a0, a1, color, w) {
    if (a1 - a0 >= 359.999) a1 = a0 + 359.999;         // a full circle degenerates as an SVG arc otherwise
    var p0 = pt(cx, cy, r, a0), p1 = pt(cx, cy, r, a1);
    var large = (a1 - a0) > 180 ? 1 : 0;
    return '<path d="M' + p0.x + ' ' + p0.y + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + p1.x + ' ' + p1.y +
      '" fill="none" stroke="' + color + '" stroke-width="' + w + '"/>';
  }
  function pt(cx, cy, r, deg) {
    var rad = (deg * Math.PI) / 180;
    /* Four decimals, not two: a 100%-vs-0% split draws its "full circle" as
       359.999 degrees so SVG has two distinct endpoints to trace between. At
       two decimals that near-360-degree point rounds right back to the start
       coordinate, the path collapses to zero length, and the circle silently
       fails to draw — which is exactly the split a rate-coverage or
       price-coverage chart hits whenever nothing is missing. */
    return { x: (cx + r * Math.cos(rad)).toFixed(4), y: (cy + r * Math.sin(rad)).toFixed(4) };
  }
  function trim(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  /* ── the page shell — shared between both dashboards ─────────────────── */

  var CSS = '\n:root{--ink:#1d1b2e;--ink-soft:#57536e;--ink-faint:#7d7996;--paper:#faf8fc;--card:#ffffff;' +
    '--line:#e6e1ee;--violet:#6b4fa8;--violet-deep:#4a235a;--violet-wash:#f4ecf7;--teal:#128f77;' +
    '--teal-wash:#e6f6f2;--amber:#8a6100;--amber-wash:#fdf3dc;--red:#a8321f;--red-wash:#fadbd8;' +
    '--shadow:0 1px 2px rgba(29,27,46,.05),0 8px 24px -12px rgba(74,35,90,.18)}\n' +
    '*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);' +
    'font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}\n' +
    '.wrap{max-width:1180px;margin:0 auto;padding:28px 24px 64px}\n' +
    'header.top{background:var(--violet-deep);color:#fff;padding:22px 24px}\n' +
    'header.top .in{max-width:1180px;margin:0 auto;display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}\n' +
    'header.top h1{margin:0;font-size:22px;letter-spacing:-.01em}\n' +
    'header.top span{color:#d9caea;font-size:13px}\n' +
    '.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:22px 0}\n' +
    '.stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 17px;box-shadow:var(--shadow)}\n' +
    '.stat b{display:block;font-size:25px;letter-spacing:-.02em}\n' +
    '.stat span{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-faint)}\n' +
    '.stat.bad b{color:var(--red)}.stat.good b{color:#0b6b59}.stat.money b{color:#0b6b59}\n' +
    '.grid{display:grid;grid-template-columns:2fr 1fr;gap:16px;align-items:start}\n' +
    '@media(max-width:760px){.grid{grid-template-columns:1fr}}\n' +
    '.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px;' +
    'margin-bottom:16px;box-shadow:var(--shadow)}\n' +
    '.card h2{margin:0 0 4px;font-size:16.5px}\n' +
    '.card p.sub{margin:0 0 16px;color:var(--ink-soft);font-size:13px}\n' +
    '.donutwrap{display:flex;align-items:center;gap:18px;flex-wrap:wrap}\n' +
    '.dlg{display:flex;align-items:center;gap:8px;font-size:13px;margin:6px 0}\n' +
    '.dlg span{width:11px;height:11px;border-radius:3px;display:inline-block}\n' +
    '.dlg b{margin-left:auto;font-variant-numeric:tabular-nums}\n' +
    '.warn{background:var(--red-wash);border:1px solid #f0b8b0;border-radius:10px;padding:12px 15px;' +
    'font-size:13.5px;color:var(--red);margin-top:10px}\n' +
    'footer{max-width:1180px;margin:0 auto;padding:0 24px;color:var(--ink-faint);font-size:12.5px}\n' +
    '@media print{body{background:#fff}}\n';

  function page(title, sub, body) {
    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(title) + '</title><style>' + CSS + '</style></head><body>' +
      '<header class="top"><div class="in"><h1>' + esc(title) + '</h1><span>' + esc(sub) + '</span></div></header>' +
      '<div class="wrap">' + body + '</div>' +
      '<footer>Vastrangam BOS · built from the same figures the Excel report carries — nothing here is a separate calculation.</footer>' +
      '</body></html>';
  }

  /* ── ecommerce dashboard ──────────────────────────────────────────────── */

  function ecommerceDashboard(r) {
    var n = r.header.length, t = r.totals;
    var byNetDesc = r.rows.slice().sort(function (a, b) { return b[n - 4] - a[n - 4]; });
    var topSellers = byNetDesc.slice(0, 10).map(function (row) { return { label: row[1], value: row[n - 4] }; });
    var byWrong = r.rows.filter(function (row) { return row[n - 3] > 0; })
      .sort(function (a, b) { return b[n - 3] - a[n - 3]; }).slice(0, 8)
      .map(function (row) { return { label: row[1], value: row[n - 3] }; });
    var perCo = r.companies.map(function (c) { return { label: c.name, value: c.saleQty }; });
    var retRate = r.companies.map(function (c) {
      return { label: c.name, value: c.saleQty ? Math.round((c.returnQty / c.saleQty) * 1000) / 10 : 0 };
    });

    var body = '' +
      '<div class="stats">' +
      '<div class="stat"><b>' + fmt(r.items) + '</b><span>items</span></div>' +
      '<div class="stat"><b>' + fmt(t[n - 6]) + '</b><span>sale qty</span></div>' +
      '<div class="stat"><b>' + fmt(t[n - 5]) + '</b><span>return qty</span></div>' +
      '<div class="stat good"><b>' + fmt(t[n - 4]) + '</b><span>net sale</span></div>' +
      '<div class="stat bad"><b>' + fmt(t[n - 3]) + '</b><span>wrong returns</span></div>' +
      '<div class="stat"><b>' + fmt(t[n - 2]) + '</b><span>total inventory</span></div>' +
      '<div class="stat' + (r.noPrice.length ? ' bad' : ' good') + '"><b>' + fmt(r.noPrice.length) +
      '</b><span>no price on file</span></div>' +
      '</div>' +
      '<div class="grid">' +
      '<div>' +
      '<div class="card"><h2>Top sellers</h2><p class="sub">Ranked by net sale quantity (sale minus return).</p>' +
      hbars(topSellers, { label: 'top sellers by net sale quantity' }) + '</div>' +
      (byWrong.length ? '<div class="card"><h2>Wrong returns, worst first</h2>' +
        '<p class="sub">Flagged in the Wrong Return column of the source workbook — never guessed.</p>' +
        hbars(byWrong, { label: 'items with the most wrong returns', color: 'var(--red)' }) + '</div>' : '') +
      '<div class="card"><h2>Sale quantity by company</h2>' +
      hbars(perCo, { label: 'sale quantity by company' }) + '</div>' +
      '</div>' +
      '<div>' +
      '<div class="card"><h2>Price coverage</h2><p class="sub">' + fmt(r.priceListSize) + ' items on the price list.</p>' +
      donut([{ label: 'Priced', value: r.items - r.noPrice.length, color: '#128f77' },
        { label: 'No price', value: r.noPrice.length, color: '#a8321f' }]) + '</div>' +
      '<div class="card"><h2>Return rate by company</h2><p class="sub">Returns as a % of that company’s sale quantity.</p>' +
      hbars(retRate, { label: 'return rate percent by company', money: false }) + '</div>' +
      (r.noPrice.length ? '<div class="warn"><b>' + fmt(r.noPrice.length) + ' items have no price on file</b> — ' +
        'none guessed: ' + r.noPrice.slice(0, 10).map(esc).join(', ') + (r.noPrice.length > 10 ? ', …' : '') + '</div>' : '') +
      '</div>' +
      '</div>';

    var names = r.companies.map(function (c) { return c.name; }).join(' + ');
    return page('E-commerce Dashboard', names + ' · ' + fmt(r.items) + ' items', body);
  }

  /* ── karigar dashboard ────────────────────────────────────────────────── */

  function karigarDashboard(r) {
    var topKarigars = r.karigars.slice(0, 10).map(function (k) { return { label: k.karigar, value: k.earnings }; });
    var topDesigns = r.designs.slice().sort(function (a, b) { return b.cost - a.cost; }).slice(0, 10)
      .map(function (d) { return { label: d.design, value: d.cost }; });
    var bySet = {};
    r.designs.forEach(function (d) { bySet[d.setType] = (bySet[d.setType] || 0) + d.sets; });
    var setBars = Object.keys(bySet).sort(function (a, b) { return bySet[b] - bySet[a]; })
      .map(function (k) { return { label: k, value: bySet[k] }; });

    var body = '' +
      '<div class="stats">' +
      '<div class="stat"><b>' + fmt(r.totals.designs) + '</b><span>designs</span></div>' +
      '<div class="stat"><b>' + fmt(r.totals.karigars) + '</b><span>karigars</span></div>' +
      '<div class="stat good"><b>' + fmt(r.totals.sets) + '</b><span>completed sets</span></div>' +
      '<div class="stat"><b>' + fmt(r.totals.pieces) + '</b><span>pieces stitched</span></div>' +
      '<div class="stat money"><b>' + rupees(r.totals.cost) + '</b><span>stitching cost</span></div>' +
      '<div class="stat' + (r.noRate.length ? ' bad' : ' good') + '"><b>' + fmt(r.noRate.length) +
      '</b><span>no rate on file</span></div>' +
      '</div>' +
      '<div class="grid">' +
      '<div>' +
      '<div class="card"><h2>Top karigars by earnings</h2><p class="sub">Per raw piece — a piece that never joined a set is still paid for.</p>' +
      hbars(topKarigars, { label: 'top karigars by earnings', money: true }) + '</div>' +
      '<div class="card"><h2>Top designs by stitching cost</h2>' +
      hbars(topDesigns, { label: 'top designs by cost', money: true, color: 'var(--teal)' }) + '</div>' +
      '</div>' +
      '<div>' +
      '<div class="card"><h2>Rate coverage</h2><p class="sub">Every design against the Stitching Rates Master.</p>' +
      donut([{ label: 'Has a rate', value: r.totals.designs - r.noRate.length, color: '#128f77' },
        { label: 'No rate — costed ₹0', value: r.noRate.length, color: '#a8321f' }]) + '</div>' +
      '<div class="card"><h2>Completed sets by set type</h2>' +
      hbars(setBars, { label: 'completed sets by set type' }) + '</div>' +
      (r.noRate.length ? '<div class="warn"><b>' + fmt(r.noRate.length) + ' designs have no rate on file</b> — ' +
        'costed at ₹0 rather than guessed: ' + r.noRate.slice(0, 10).map(esc).join(', ') +
        (r.noRate.length > 10 ? ', …' : '') + '</div>' : '') +
      '</div>' +
      '</div>';

    return page('Karigar Dashboard', fmt(r.totals.designs) + ' designs · ' + fmt(r.totals.karigars) +
      ' karigars · ' + rupees(r.totals.cost), body);
  }

  return { ecommerceDashboard: ecommerceDashboard, karigarDashboard: karigarDashboard, hbars: hbars, donut: donut };
}));
