/* ═══════════ Vastrangam AI Engine — Design Studio extras (banner · carousel · thumbnail) ═══════════
   One-click social/YouTube assets from a product + its content, plus a Carousel builder that
   exports every slide, and AI image backdrops (Gemini → Pollinations). Themed by the active theme. */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  /* inject a "Quick assets" panel into Design Studio's template screen */
  var _after = VA.view('des').after;
  VA.view('des').after = function () {
    if (_after) _after();
    var main = document.getElementById('main'); if (!main || document.getElementById('desxtra')) return;
    /* only on the template gallery (no design open) */
    if (document.getElementById('descanvas')) return;
    var el = document.createElement('div'); el.id = 'desxtra';
    var run = (DB().runs || []).filter(function (r) { return r.pack; }).slice(-1)[0];
    el.innerHTML = H.panel('Quick social & YouTube assets <span class="badge">from your content</span>',
      '<p class="hint" style="margin-bottom:10px">One click builds a themed asset filled from your latest run' + (run ? ' (' + esc(run.pack.sku) + ')' : '') + '. Edit it on the canvas, then export.</p>' +
      '<div class="btnrow">' +
      '<button class="btn sm p" data-act="desquick" data-k="banner">Web banner 1500×500</button>' +
      '<button class="btn sm p" data-act="desquick" data-k="thumb">YouTube thumb 1280×720</button>' +
      '<button class="btn sm p" data-act="desquick" data-k="carousel">Carousel (build all slides)</button>' +
      '<button class="btn sm" data-act="desai">AI image backdrop</button>' +
      '</div>');
    main.appendChild(el);
  };

  function latestPack() { var r = (DB().runs || []).filter(function (x) { return x.pack; }).slice(-1)[0]; return r ? r.pack : null; }
  function themeGrad() { var t = VTheme.active(); return 'linear-gradient(135deg,' + t.p1 + ',' + t.p2 + ')'; }

  VA.action('desquick', function (b) {
    var k = b.getAttribute('data-k'), p = latestPack();
    if (k === 'carousel') { buildCarousel(p); return; }
    var size = k === 'banner' ? { w: 1500, h: 500, name: 'Web Banner' } : { w: 1280, h: 720, name: 'YouTube Thumbnail' };
    var title = p ? p.colour + ' ' + p.typeNoun : 'New Collection';
    var sub = p ? p.fabric + ' · ' + p.work + ' · Crafted in Surat' : 'Crafted in Surat';
    VA.DESOPEN({ tplId: 'quick', name: size.name, w: size.w, h: size.h, bg: themeGrad(),
      els: [
        { type: 'text', role: 'brand', text: 'VASTRANGAM', x: 0.5, y: 0.16, size: size.w / 22, fill: VTheme.active().gold, align: 'center', bold: true, spaced: true },
        { type: 'text', role: 'title', text: title, x: 0.5, y: k === 'thumb' ? 0.5 : 0.48, size: size.w / (k === 'thumb' ? 13 : 16), fill: '#FFFFFF', align: 'center', bold: true },
        { type: 'text', role: 'sub', text: sub, x: 0.5, y: k === 'thumb' ? 0.68 : 0.66, size: size.w / 34, fill: '#EADFFB', align: 'center' },
        (p ? { type: 'text', role: 'price', text: VA.inr(p.price), x: 0.5, y: 0.85, size: size.w / 18, fill: '#FFFFFF', align: 'center', bold: true, pill: VTheme.active().p1 } : null)
      ].filter(Boolean) });
    VA.toast(size.name + ' built — edit and export');
  });

  function buildCarousel(p) {
    if (!p) { VA.toast('Generate a content run first'); return; }
    var slides = p.social.carousel.map(function (s, i) {
      var parts = s.split('—'); var head = (parts[0] || '').replace(/[a-zA-Z]+:/, '').trim(); var body = (parts.slice(1).join('—') || s).replace(/"/g, '').trim();
      return { title: head || ('Slide ' + (i + 1)), body: body.slice(0, 90) };
    });
    DB().carousel = { sku: p.sku, slides: slides, colour: p.colour, cur: 0 };
    VA.save(); VA.go('carousel'); VA.toast('Carousel — ' + slides.length + ' slides ready');
  }

  /* a dedicated Carousel screen that renders + exports every slide */
  VA.view('carousel', function () {
    var c = DB().carousel;
    if (!c) return H.head('Design Studio', 'Carousel', 'No carousel built yet.') + H.panel('', '<div class="empty">Build one from Design Studio → Carousel. <button class="btn p" data-go="des">Go</button></div>');
    return H.head('Design Studio · Carousel', 'Carousel · ' + esc(c.sku), c.slides.length + ' slides, 1080×1080, themed and filled from your content.') +
      '<div class="btnrow" style="margin-bottom:12px"><button class="btn sm" data-go="des">← Design</button><button class="btn sm p" data-act="carexport">Export all slides (ZIP)</button></div>' +
      '<div class="tplgrid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">' +
      c.slides.map(function (s, i) { return '<div class="tpltile"><canvas id="car' + i + '" width="1080" height="1080" style="width:100%;display:block"></canvas><div class="cap">Slide ' + (i + 1) + '<span>' + esc(s.title.slice(0, 30)) + '</span></div></div>'; }).join('') + '</div>';
  });
  VA.view('carousel').after = function () {
    var c = DB().carousel; if (!c) return;
    c.slides.forEach(function (s, i) { drawSlide(VA.$('car' + i), s, i, c); });
  };
  function drawSlide(cv, s, i, c) {
    if (!cv) return; var ctx = cv.getContext('2d'), W = 1080, t = VTheme.active();
    var g = ctx.createLinearGradient(0, 0, W, W); g.addColorStop(0, t.p1); g.addColorStop(1, t.p2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 4; ctx.strokeRect(54, 54, W - 108, W - 108);
    ctx.fillStyle = t.gold; ctx.font = '700 34px Georgia'; ctx.textAlign = 'center'; ctx.fillText('V A S T R A N G A M', W / 2, 130);
    ctx.fillStyle = '#fff'; ctx.font = '800 62px Georgia';
    wrap(ctx, s.title, W / 2, 420, W - 200, 70);
    ctx.font = '400 34px Georgia'; ctx.fillStyle = '#EADFFB';
    wrap(ctx, s.body, W / 2, 640, W - 220, 46);
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '600 26px Georgia'; ctx.fillText((i + 1) + ' / ' + c.slides.length, W / 2, W - 90);
  }
  function wrap(ctx, text, x, y, maxW, lh) {
    var words = String(text).split(' '), line = '', lines = [];
    words.forEach(function (w) { var t = line + w + ' '; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w + ' '; } else line = t; });
    lines.push(line); var oy = y - (lines.length - 1) * lh / 2;
    lines.forEach(function (l, i) { ctx.fillText(l.trim(), x, oy + i * lh); });
  }
  VA.action('carexport', function () {
    var c = DB().carousel; if (!c) return;
    var entries = {};
    c.slides.forEach(function (s, i) { var cv = VA.$('car' + i); if (cv) entries['slide-' + String(i + 1).padStart(2, '0') + '.png'] = b(cv.toDataURL('image/png')); });
    try { var list = Object.keys(entries).map(function (k) { return { name: k, data: entries[k] }; }); var zip = VSheet.zip(list); dlBlob(new Blob([zip], { type: 'application/zip' }), c.sku + '-carousel.zip'); VA.toast(c.slides.length + ' slides exported'); }
    catch (e) { VA.toast('Export not available here'); }
  });
  function b(u) { var s = atob(u.split(',')[1]), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  function dlBlob(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); }

  /* AI image backdrop into the current design (Gemini → Pollinations) */
  VA.action('desai', function () {
    var p = latestPack();
    var prompt = (p ? p.colour + ' ' + p.fabric + ' ' + p.cat + ' Indian ethnic wear, editorial studio photo, ' + p.occ.replace('-', ' ') : 'Indian ethnic wear editorial studio photo') + ', high detail, elegant';
    VA.toast('Generating a backdrop…');
    VAI.callImage(prompt, { w: 1024, h: 1024 }).then(function (res) {
      DB().aiBackdrop = res.url; VA.save(); VA.toast('Backdrop from ' + res.provider + ' — open a template to place it');
    }).catch(function () { VA.toast('Image generation unavailable offline'); });
  });
})();
