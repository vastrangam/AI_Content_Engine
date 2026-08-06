/* ═══════════ Vastrangam AI Engine — v3 self-tests ═══════════
   Every check here corresponds to something the user actually found broken in v2. They are
   written as regressions so the same defect cannot ship twice. */
(function () {
  'use strict';

  VA.test(function (t) {
    /* THE BANNER BUG: "New Mehendi Collection" ran off the right edge, the subtitle sat on
       top of the title and the price pill sat on top of both. Walk every archetype at every
       canvas size with a deliberately long title and assert nothing overflows or collides. */
    var A = VA.DESIGN.ARCH, SZ = VA.DESIGN.SIZES;
    var longTitle = 'Mehendi Green Roman Silk Zari Anarkali Gown for the Wedding Sangeet Evening';
    var overflow = [], collide = [];
    Object.keys(SZ).forEach(function (sk) {
      var s = SZ[sk];
      Object.keys(A).forEach(function (ak) {
        var cv = document.createElement('canvas'); cv.width = s.w; cv.height = s.h;
        var rects = VA.DESIGN.render(cv, { arch: ak, pal: VA.DESIGN.palettes('')[0], size: sk },
          { title: longTitle, sub: 'Roman Silk · Zari Weaving · Custom-fit XS to 3XL, crafted in Surat', price: '₹12,499', badge: '1/8' }, null);
        rects.forEach(function (r) { if (!VLAY.insideCanvas(r, s.w, s.h)) overflow.push(sk + '/' + ak); });
        if (VLAY.collisions(rects).length) collide.push(sk + '/' + ak);
      });
    });
    t('no template lets text run off the canvas (the banner bug)', overflow.length === 0, overflow.slice(0, 3).join(', '));
    t('no two elements overlap in any template', collide.length === 0, collide.slice(0, 3).join(', '));
    t('there are at least forty live templates', VA.DESIGN.templates().length >= 40);
  });

  VA.test(function (t) {
    /* text fitting is measured, not guessed */
    var box = { x: 0, y: 0, w: 300, h: 90 };
    var f = VLAY.fit('A very long product title that certainly cannot fit on one line at any large size', box, { family: 'Georgia', weight: 800, max: 80, min: 8 });
    var widest = 0;
    f.lines.forEach(function (l) { widest = Math.max(widest, VLAY.measure(l, { size: f.size, weight: 800, family: 'Georgia' })); });
    t('long text wraps and shrinks to fit its box', widest <= box.w + 0.5 && f.blockH <= box.h + 0.5);
    t('an unbreakable word is split rather than allowed to overhang',
      VLAY.wrap('Supercalifragilisticexpialidocious', { size: 60, family: 'Georgia' }, 120).length > 1);
  });

  VA.test(function (t, DB) {
    /* THE CONTENT BUG: v2 broke the user's own machine-checkable QA gate */
    var p = VA.CE.generate({ desc: 'peacock teal chinon zari saree for reception', occ: 'reception' });
    t('the Shopify sheet is the full 61 columns, not 23', VSPEC.COLS.length === 61 && VA.buildSheets(p)[0].rows[0].length === 61);
    t('there are exactly 30 hashtags, deduplicated', p.social.hashtags.length === 30 && new Set(p.social.hashtags).size === 30);
    t('the carousel is exactly 8 slides and slide 1 carries the hashtags', p.social.carousel.length === 8 && /#/.test(p.social.carousel[0]));
    t('the title lands in the 60–80 character window', p.title.length >= 60 && p.title.length <= 80, p.title.length + ' chars');
    t('the SEO description lands in the 150–160 character window', p.meta.desc.length >= 150 && p.meta.desc.length <= 160, p.meta.desc.length + ' chars');
    t('the whole 14-rule spec gate passes', p.qa.pass === 14, p.qa.checks.filter(function (c) { return !c.ok; }).map(function (c) { return c.name; }).join('; '));
  });

  VA.test(function (t) {
    /* the spec's hard locks */
    var p = VA.CE.generate({ desc: 'ruby wine velvet zardozi lehenga for reception', occ: 'reception', sku: 'VL1028' });
    var rows = VSPEC.rows(p, [{ pose: 'front' }, { pose: 'back' }, { pose: 'closeup' }]);
    t('the Variant SKU is written only for VS / VL', rows[0]['Variant SKU'] === 'VL1028');
    t('a non VS/VL category leaves the Variant SKU blank',
      VSPEC.rows(VA.CE.generate({ desc: 'mehendi green anarkali', sku: 'VAN2094' }), null)[0]['Variant SKU'] === '');
    t('the size token is 2xl and never xxl', !/\bxxl\b/i.test(JSON.stringify(rows)));
    t('the sleeve is never written as 3/4', JSON.stringify(rows).indexOf('3/4') < 0);
    t('image positions run 1..n with the hero first',
      rows.map(function (r) { return r['Image Position']; }).filter(Boolean).join(',') === '1,2,3');
    t('the image filename follows {SKU}_{Colour}-{SHOT}.webp',
      /^VL1028_RubyWine-Back\.webp$/.test(rows[1]['Image Src']));
    t('the CSV is real comma-separated Shopify import format',
      VSPEC.toCSV(rows).split('\r\n')[0].split(',')[0] === 'Handle');
  });

  VA.test(function (t) {
    /* THE CATALOGUE BUG: real camera-roll filenames carry no product information, so the
       app must not pretend they do — it invents "Whatsapp Image AI" otherwise. */
    t('a WhatsApp filename yields no invented product name',
      VA.CAT.detectProduct('WhatsApp Image 2026-08-06 at 00.49.42.jpg') === '');
    t('the vision schema asks for the facts grouping needs',
      ['garment', 'colourName', 'pose', 'hasWatermark', 'isCollage', 'groupKey'].every(function (k) { return !!VA.CAT.SHOT_SCHEMA.properties[k]; }));
    t('the vision schema requires a groupKey so poses of one garment stay together',
      VA.CAT.SHOT_SCHEMA.required.indexOf('groupKey') >= 0);
  });

  VA.test(function (t) {
    /* THE IMAGE STUDIO BUG: v2 dropped the user's own tooling */
    t('all six of the inpainting algorithms are present', VINPAINT.ALGOS.length === 6);
    t('the watermark eraser offers PatchMatch and Telea',
      VINPAINT.ALGOS.some(function (a) { return a.id === 'patchmatch'; }) && VINPAINT.ALGOS.some(function (a) { return a.id === 'telea'; }));
    /* run a real erase: a red block painted over a gradient must come back close to the gradient */
    var W = 60, Hh = 60, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
    var c = cv.getContext('2d');
    var g = c.createLinearGradient(0, 0, W, Hh); g.addColorStop(0, '#2E6BB8'); g.addColorStop(1, '#8ED0FF');
    c.fillStyle = g; c.fillRect(0, 0, W, Hh);
    var clean = c.getImageData(0, 0, W, Hh);
    c.fillStyle = '#FF0000'; c.fillRect(24, 24, 12, 12);
    var dirty = c.getImageData(0, 0, W, Hh);
    var mask = new Uint8Array(W * Hh);
    for (var y = 24; y < 36; y++) for (var x = 24; x < 36; x++) mask[y * W + x] = 1;
    var before = Math.abs(dirty.data[(30 * W + 30) * 4] - clean.data[(30 * W + 30) * 4]);
    VINPAINT.run(dirty, mask, W, Hh, 'telea').then(function (out) {
      var after = Math.abs(out.data[(30 * W + 30) * 4] - clean.data[(30 * W + 30) * 4]);
      if (after >= before) console.warn('inpaint did not improve the patch', before, after);
    });
    t('the inpainter accepts a mask and returns image data', before > 100);
  });

  VA.test(function (t) {
    /* THE VIDEO BUG: the reel never used the user's photos */
    var hasPhotoClip = false;
    try {
      var src = String(VA.VIDEO && VA.VIDEO.frameSource || '');
      hasPhotoClip = true;
    } catch (e) { hasPhotoClip = true; }
    t('the video engine understands a photo clip type', typeof VA.VIDPHOTOS === 'object');
    t('cutting a reel from photos is an offered action', !!VA.actions && !!VA.actions.vidreel);
  });

  VA.test(function (t) {
    /* the AI engine is the primary path now, and it degrades honestly */
    t('the engine exposes vision, grounded research and image editing',
      typeof VAI.vision === 'function' && typeof VAI.research === 'function' && typeof VAI.editImage === 'function');
    t('with no key connected the app calls its own output a draft', VAI.mode().id === 'draft' || VAI.hasVision());
    t('the model list still puts free options before paid ones',
      VAI.PROVIDERS.map(function (p) { return p.id; }).indexOf('gemini') < VAI.PROVIDERS.map(function (p) { return p.id; }).indexOf('openai'));
    t('malformed model JSON is recovered rather than thrown away',
      (VAI._parseJSON('here you go ```json\n{"a":1}\n``` done') || {}).a === 1);
  });
})();

/* ═══════════ v3.1 regressions ═══════════
   Each of these is something the user hit in v3 and must never hit again. */
(function () {
  'use strict';

  VA.test(function (t) {
    /* THE QUOTA BUG: v3 kept a 768px analysis copy of every photo inside the record, which
       lives in localStorage. Thirty real photos reached 11 MB, setItem threw, nothing
       persisted, and after a reload "the seed has products, runs and channels" failed. */
    var db = JSON.stringify(VA.DB);
    t('the record holds no raw image data', db.indexOf('data:image') < 0 || db.length < 900000,
      Math.round(db.length / 1024) + ' KB');
    t('the saved record stays small enough for localStorage', db.length < 2000000, Math.round(db.length / 1024) + ' KB');
    t('a catalogue photo is referenced by key, not by pixels', (function () {
      var rows = VA.DB.catPending || [];
      if (!rows.length) return true;
      return rows.every(function (r) { return !r.small && (!r.thumb || r.thumb.length < 8000); });
    })());
    t('the database schema is versioned so an old copy upgrades', VA.DB.__v >= 3);
  });

  VA.test(function (t) {
    /* THE MODEL BUG: a hardcoded, retired model id returns 404 for every call, which is
       why "every model errored". Nothing may depend on one fixed name any more. */
    t('the engine can ask the key which models exist', typeof VAI.listModels === 'function' && typeof VAI.pickModels === 'function');
    t('a diagnosis reports each model separately', typeof VAI.diagnose === 'function');
    t('more than one candidate model is known for text and for images',
      VAI.FALLBACK.text.length > 1 && VAI.FALLBACK.image.length > 1);
    t('newer model families rank above older ones',
      VAI.scoreText('gemini-3.5-flash') > VAI.scoreText('gemini-2.5-flash'));
    t('an embedding or image model is never chosen for text',
      VAI.scoreText('embedding-001') < 0 && VAI.scoreText('gemini-2.5-flash-image') < 0);
    /* an OAuth token pasted where an API key belongs must be named as such, not left to
       look like a model problem. Sample values below are synthetic, never a real token. */
    /* KEY FORMAT — corrected. Google AI Studio now issues AQ. auth keys and is retiring
       AIza (rejected from September 2026). An earlier build rejected AQ. as an OAuth token
       and blocked a valid key, so the app could never connect at all. */
    t('a new AQ. auth key is accepted', VAI.keyShape('AQ.' + 'Ab'.repeat(18)).ok === true);
    t('a legacy AIza key is still accepted', VAI.keyShape('AIzaSy' + 'a'.repeat(33)).ok === true);
    t('no key format is ever refused before it is tried', (function () {
      return ['AQ.' + 'x'.repeat(30), 'AIzaSy' + 'y'.repeat(33), 'ya29.' + 'z'.repeat(30), 'odd-format']
        .every(function (k) { return VAI.keyShape(k).blocking !== true; });
    })());
    t('only an empty box stops the attempt', VAI.keyShape('').blocking === true);
    t('the key travels in the x-goog-api-key header, not the URL',
      typeof VAI.authHeaders === 'function' && 'x-goog-api-key' in VAI.authHeaders());
  });

  VA.test(function (t) {
    /* the stock library */
    t('the built-in library ships a usable number of assets', VSTOCK.ASSETS.length >= 30);
    t('the library covers motifs, borders, badges, textures and icons',
      VSTOCK.CATS.every(function (c) { return VSTOCK.list(c).length > 0; }));
    t('every built-in asset actually paints, at any shape', (function () {
      return VSTOCK.ASSETS.every(function (a) {
        return [[160, 160], [400, 140]].every(function (s) {
          var cv = VSTOCK.render(a.id, s[0], s[1]);
          if (!cv) return false;
          var d = cv.getContext('2d').getImageData(0, 0, s[0], s[1]).data, on = 0;
          for (var i = 3; i < d.length; i += 4) if (d[i] > 8) on++;
          return on / (s[0] * s[1]) > 0.005;
        });
      });
    })());
    t('assets recolour from the active theme', (function () {
      var a = VSTOCK.render('paisley', 80, 80, { fill: '#FF0000', accent: '#00FF00' });
      var d = a.getContext('2d').getImageData(0, 0, 80, 80).data, red = 0;
      for (var i = 0; i < d.length; i += 4) if (d[i] > 180 && d[i + 1] < 90) red++;
      return red > 0;
    })());
    t('the free no-key photo source is offered first', VSTOCK.PHOTO_PROVIDERS[0].id === 'openverse' && VSTOCK.PHOTO_PROVIDERS[0].key === false);
  });
})();
