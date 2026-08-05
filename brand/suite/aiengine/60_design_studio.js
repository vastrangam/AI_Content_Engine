/* ═══════════ Vastrangam AI Engine — Design Studio (templates, brand kit, canvas) ═══════════ */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  var D = { design: null, sel: -1 };

  function newDesign(tpl) {
    return {
      tplId: tpl.id, name: tpl.name, w: tpl.w, h: tpl.h, bg: tpl.bg,
      els: [
        { type: 'text', role: 'brand', text: 'VASTRANGAM', x: 0.5, y: 0.12, size: tpl.w / 16, fill: '#C4975A', align: 'center', bold: true, spaced: true },
        { type: 'text', role: 'title', text: 'New Mehendi Collection', x: 0.5, y: 0.62, size: tpl.w / 12, fill: '#FFFFFF', align: 'center', bold: true },
        { type: 'text', role: 'sub', text: 'Handwoven · Festive · Made in Surat', x: 0.5, y: 0.72, size: tpl.w / 26, fill: '#EADFFB', align: 'center' },
        { type: 'text', role: 'price', text: '₹2,499', x: 0.5, y: 0.86, size: tpl.w / 13, fill: '#FFFFFF', align: 'center', bold: true, pill: '#5B2D8E' }
      ]
    };
  }

  VA.view('des', function () {
    var d = DB();
    if (!D.design) {
      return H.head('Design Studio', 'Design Studio', 'Pick a template, edit it on a real canvas, apply your brand kit, resize to any size, and export a PNG — offline.') +
        H.panel('Templates <span class="badge">' + d.templates.length + '</span>',
          '<div class="tplgrid">' + d.templates.map(function (t) {
            return '<div class="tpltile" data-act="destpl" data-id="' + t.id + '"><div class="pv" style="background:' + t.bg + '">' + esc(t.name) + '</div>' +
              '<div class="cap">' + esc(t.name) + '<span>' + t.w + '×' + t.h + '</span></div></div>';
          }).join('') + '</div>') +
        H.panel('Brand kit', brandKit(d));
    }
    return H.head('Design Studio · ' + esc(D.design.name), esc(D.design.name), D.design.w + '×' + D.design.h) +
      '<div class="btnrow" style="margin-bottom:10px"><button class="btn sm" data-act="desback">← Templates</button>' +
      '<button class="btn sm p" data-act="desexport">Export PNG</button>' +
      '<button class="btn sm gold" data-act="desmagic">Magic resize</button></div>' +
      '<div class="studio"><div><div class="stage"><canvas id="descanvas"></canvas></div>' +
      '<div class="note" style="margin-top:10px">Click an element on the canvas to edit it. Elements: ' + D.design.els.length + '</div></div>' +
      '<div class="sidepanel">' +
      H.panel('Add', '<div class="btnrow"><button class="btn sm" data-act="desaddtext">+ Text</button><button class="btn sm" data-act="desfromrun">From a content run</button></div>' +
        '<div class="fld" style="margin-top:8px"><label>Load run</label><select id="desrun"><option value="">— pick —</option>' + d.runs.filter(function (r) { return r.pack; }).map(function (r) { return '<option value="' + r.id + '">' + esc(r.pack.sku + ' · ' + r.pack.colour) + '</option>'; }).join('') + '</select></div>') +
      (D.sel >= 0 ? H.panel('Selected element', elEditor()) : '') +
      H.panel('Background', bgPicker(d)) +
      H.panel('Brand kit', brandKit(d)) +
      '</div></div>';
  });
  VA.view('des').after = function () { if (D.design) mountDes(); };

  function brandKit(d) {
    return '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:8px">' + d.brand.colours.map(function (c) {
      return '<span class="swatch" style="background:' + c.v + '" title="' + esc(c.n) + '" onclick="VA.DESapplybrand(\'' + c.v + '\')"></span>'; }).join('') + '</div>' +
      '<p class="hint">Fonts: ' + d.brand.fonts.join(' · ') + '</p><p class="hint">' + esc(d.brand.site) + ' · ' + esc(d.brand.whatsapp) + '</p>' +
      '<p class="hint" style="margin-top:6px">Tap a swatch to recolour the selected element.</p>';
  }
  function bgPicker(d) {
    var grads = ['linear-gradient(135deg,#5B2D8E,#9B6FD8)', 'linear-gradient(135deg,#4A2D82,#C4963A)', 'linear-gradient(135deg,#C0392B,#C4963A)', 'linear-gradient(135deg,#2E9E6B,#5B2D8E)', 'linear-gradient(135deg,#12091C,#7B3FBE)'];
    return '<div style="display:flex;gap:7px;flex-wrap:wrap">' + grads.map(function (g) {
      return '<span class="swatch" style="background:' + g + ';width:34px;height:34px" onclick="VA.DESsetbg(\'' + g.replace(/'/g, '') + '\')"></span>'; }).join('') + '</div>';
  }
  function elEditor() {
    var e = D.design.els[D.sel]; if (!e) return '';
    return '<div class="fld"><label>Text</label><input value="' + esc(e.text) + '" oninput="VA.DESset(\'text\',this.value)"></div>' +
      '<div class="slider"><div class="lb"><span>Size</span><span>' + Math.round(e.size) + 'px</span></div><input type="range" min="16" max="' + Math.round(D.design.w / 6) + '" value="' + Math.round(e.size) + '" oninput="VA.DESset(\'size\',this.value)"></div>' +
      '<div class="btnrow" style="margin-bottom:8px"><button class="btn sm" data-act="desnudge" data-d="u">↑</button><button class="btn sm" data-act="desnudge" data-d="d">↓</button><button class="btn sm" data-act="desalign" data-a="left">⟸</button><button class="btn sm" data-act="desalign" data-a="center">⟺</button><button class="btn sm" data-act="desalign" data-a="right">⟹</button></div>' +
      '<div><b style="font-size:11px;color:var(--mut)">COLOUR</b><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:5px">' +
      ['#FFFFFF', '#C4975A', '#5B2D8E', '#EADFFB', '#12091C', '#2E9E6B'].map(function (c) { return '<span class="swatch" style="background:' + c + '" onclick="VA.DESset(\'fill\',\'' + c + '\')"></span>'; }).join('') + '</div></div>' +
      '<button class="btn sm d" data-act="desdel" style="margin-top:10px">Delete element</button>';
  }

  function mountDes() {
    var cv = VA.$('descanvas'); if (!cv) return; cv.width = D.design.w; cv.height = D.design.h;
    drawDes();
    var drag = null;
    cv.onpointerdown = function (e) {
      var r = cv.getBoundingClientRect(); var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      for (var i = D.design.els.length - 1; i >= 0; i--) { var el = D.design.els[i]; if (Math.abs(py - el.y) < 0.06) { D.sel = i; drag = { i: i, oy: py - el.y }; VA.render(); cv.setPointerCapture(e.pointerId); return; } }
      D.sel = -1; VA.render();
    };
    cv.onpointermove = function (e) { if (!drag) return; var r = cv.getBoundingClientRect(); D.design.els[drag.i].y = Math.max(0.04, Math.min(0.96, (e.clientY - r.top) / r.height - drag.oy)); drawDes(); };
    cv.onpointerup = function () { drag = null; };
  }
  function drawDes() {
    var cv = VA.$('descanvas'); if (!cv) return; var ctx = cv.getContext('2d'), W = D.design.w, Hh = D.design.h;
    /* gradient bg parsed from css string */
    var m = /linear-gradient\([^,]+,\s*([^,]+),\s*([^)]+)\)/.exec(D.design.bg);
    if (m) { var g = ctx.createLinearGradient(0, 0, W, Hh); g.addColorStop(0, m[1].trim()); g.addColorStop(1, m[2].trim()); ctx.fillStyle = g; } else ctx.fillStyle = '#5B2D8E';
    ctx.fillRect(0, 0, W, Hh);
    /* subtle inner frame */
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = Math.max(2, W / 300); ctx.strokeRect(W * 0.05, Hh * 0.05, W * 0.9, Hh * 0.9);
    D.design.els.forEach(function (e, i) {
      ctx.save(); ctx.fillStyle = e.fill; ctx.textAlign = e.align || 'center'; ctx.textBaseline = 'middle';
      ctx.font = (e.bold ? '700 ' : '400 ') + e.size + 'px Georgia,serif';
      var x = e.align === 'left' ? W * 0.08 : e.align === 'right' ? W * 0.92 : W * e.x;
      var txt = e.spaced ? e.text.split('').join(' ') : e.text;
      if (e.pill) { var tw = ctx.measureText(txt).width; ctx.fillStyle = e.pill; roundRect(ctx, W * e.x - tw / 2 - e.size * 0.6, Hh * e.y - e.size * 0.75, tw + e.size * 1.2, e.size * 1.5, e.size * 0.75); ctx.fill(); ctx.fillStyle = e.fill; }
      ctx.fillText(txt, x, Hh * e.y);
      if (D.sel === i) { ctx.strokeStyle = '#C4975A'; ctx.lineWidth = Math.max(2, W / 340); ctx.setLineDash([W / 80, W / 80]); var tw2 = ctx.measureText(txt).width; ctx.strokeRect(x - (e.align === 'center' ? tw2 / 2 : e.align === 'right' ? tw2 : 0) - 6, Hh * e.y - e.size * 0.7, tw2 + 12, e.size * 1.4); ctx.setLineDash([]); }
      ctx.restore();
    });
  }
  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  /* actions */
  VA.action('destpl', function (b) { var t = DB().templates.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0]; D.design = newDesign(t); D.sel = -1; VA.render(); });
  VA.action('desback', function () { D.design = null; VA.render(); });
  VA.action('desaddtext', function () { D.design.els.push({ type: 'text', text: 'New text', x: 0.5, y: 0.5, size: D.design.w / 20, fill: '#fff', align: 'center' }); D.sel = D.design.els.length - 1; VA.render(); });
  VA.action('desdel', function () { D.design.els.splice(D.sel, 1); D.sel = -1; VA.render(); });
  VA.action('desnudge', function (b) { var e = D.design.els[D.sel]; if (!e) return; e.y += b.getAttribute('data-d') === 'u' ? -0.02 : 0.02; drawDes(); });
  VA.action('desalign', function (b) { var e = D.design.els[D.sel]; if (e) { e.align = b.getAttribute('data-a'); drawDes(); } });
  VA.action('desmagic', function () {
    /* magic resize: cycle to the next template size, keep elements proportional */
    var order = DB().templates, cur = order.map(function (t) { return t.id; }).indexOf(D.design.tplId);
    var nx = order[(cur + 1) % order.length]; D.design.tplId = nx.id; D.design.name = nx.name;
    var fx = nx.w / D.design.w; D.design.w = nx.w; D.design.h = nx.h;
    D.design.els.forEach(function (e) { e.size *= fx; }); VA.render(); VA.toast('Resized to ' + nx.name + ' — elements reflowed');
  });
  VA.action('desfromrun', function () {
    var run = DB().runs.filter(function (r) { return r.id === VA.val('desrun'); })[0]; if (!run) { VA.toast('Pick a run'); return; }
    var p = run.pack;
    D.design.els.forEach(function (e) {
      if (e.role === 'title') e.text = p.colour + ' ' + p.typeNoun;
      if (e.role === 'sub') e.text = p.fabric + ' · ' + p.work + ' · Made in Surat';
      if (e.role === 'price') e.text = VA.inr(p.price);
    });
    VA.render(); VA.toast('Design filled from ' + p.sku);
  });
  VA.action('desexport', function () {
    D.sel = -1; drawDes(); var cv = VA.$('descanvas');
    try { cv.toBlob(function (blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vastrangam-' + VA.slug(D.design.name) + '-' + D.design.w + 'x' + D.design.h + '.png'; a.click(); VA.toast('Design exported'); }, 'image/png'); }
    catch (e) { VA.toast('Export not available here'); }
    VA.render();
  });
  VA.DESset = function (k, v) { var e = D.design.els[D.sel]; if (!e) return; e[k] = (k === 'size') ? +v : v; drawDes(); if (k === 'fill') VA.render(); };
  VA.DESsetbg = function (g) { D.design.bg = g; drawDes(); };
  VA.DESapplybrand = function (c) { if (D.design && D.sel >= 0) { D.design.els[D.sel].fill = c; drawDes(); VA.render(); } else VA.toast('Select an element first'); };

  VA.DESSTATE = D;
})();
