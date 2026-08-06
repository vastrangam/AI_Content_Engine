/* ═══════════ Vastrangam AI Engine — Catalogue (bulk upload → vision → product → colour → pose) ═══════════
   v3: the app LOOKS AT THE PHOTO. v2 read filenames, which is useless on real files —
   `WhatsApp Image 2026-08-06 at 00.49.42.jpg` carries no product, no colour, no pose, so
   every one of 30 images had to be tagged by hand. Gemini vision now reads the garment,
   the premium colour name, the fabric, the craft and the camera angle straight off the
   image, and also flags a supplier watermark or a two-in-one collage.

   Filename parsing survives only as the DRAFT path when no key is connected — and it says so. */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  var POSES = ['front', 'back', 'closeup', 'side', 'detail', 'look'];
  var POSEWORD = { front: 'Front', back: 'Back', closeup: 'Close-up', side: 'Side', detail: 'Detail', look: 'Full look' };

  /* ── draft fallback: filename tokens (only when there is no vision) ── */
  function detectPose(name) {
    var n = String(name).toLowerCase();
    if (/back|rear|behind/.test(n)) return 'back';
    if (/close|closeup|close-up|zoom|macro|detail|fabric/.test(n)) return 'closeup';
    if (/side|profile|angle/.test(n)) return 'side';
    if (/look|full|ootd|style/.test(n)) return 'look';
    if (/front|main|hero|_1\b|-1\b/.test(n)) return 'front';
    return 'front';
  }
  function detectColour(name) {
    var n = String(name).toLowerCase();
    var cols = ['mehendi', 'green', 'red', 'maroon', 'wine', 'blue', 'navy', 'teal', 'peacock', 'pink', 'rani', 'rose',
      'purple', 'lavender', 'mustard', 'yellow', 'gold', 'orange', 'rust', 'black', 'white', 'ivory', 'cream', 'grey', 'gray', 'sage', 'pista'];
    for (var i = 0; i < cols.length; i++) if (n.indexOf(cols[i]) >= 0) return cap(cols[i]);
    return '';
  }
  function detectProduct(name) {
    var n = String(name).replace(/\.[a-z0-9]+$/i, '').toLowerCase();
    n = n.replace(/(front|back|close-?up|side|detail|look|hero|main|rear|profile|zoom|macro)/g, ' ');
    n = n.replace(/\b(mehendi|green|red|maroon|wine|blue|navy|teal|peacock|pink|rani|rose|purple|lavender|mustard|yellow|gold|orange|rust|black|white|ivory|cream|grey|gray|sage|pista)\b/g, ' ');
    n = n.replace(/[_\-#0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
    /* camera-roll junk carries no product information at all — say so rather than inventing one */
    if (/whatsapp|image|img|photo|screenshot|dsc|pxl|untitled/.test(n) || !n) return '';
    return n.split(' ').map(cap).join(' ');
  }
  function cap(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }

  /* ── the vision contract ────────────────────────────────────────────────────────────
     A strict schema means the model returns facts we can group on, not prose. */
  var SHOT_SCHEMA = {
    type: 'object',
    properties: {
      garment: { type: 'string', description: 'Specific garment type, e.g. Anarkali Gown, Banarasi Saree, Lehenga Choli, Kurti Set, Sharara Suit' },
      category: { type: 'string', enum: ['saree', 'lehenga', 'anarkali', 'kurti', 'gown', 'suit', 'dupatta', 'blouse', 'other'] },
      colourName: { type: 'string', description: 'Premium two-word colour name as a boutique would write it, e.g. Mehendi Green, Ruby Wine, Sage Mist, Peacock Teal. Never a plain word like "green".' },
      colourHex: { type: 'string', description: 'Approximate dominant garment colour as #rrggbb' },
      fabric: { type: 'string', description: 'Best-guess fabric, e.g. Roman Silk, Georgette, Organza, Chinon, Velvet' },
      work: { type: 'string', description: 'Craft or embroidery visible, e.g. Zari Weaving, Zardozi, Sequin, Mirror, Printed' },
      pose: { type: 'string', enum: ['front', 'back', 'closeup', 'side', 'detail', 'look'], description: 'Camera angle of the garment' },
      modelPresent: { type: 'boolean', description: 'True if a human model is wearing the garment' },
      isCollage: { type: 'boolean', description: 'True if this single image contains two or more separate photos tiled together' },
      hasWatermark: { type: 'boolean', description: 'True if any logo, brand name, phone number or watermark text is overlaid on the image' },
      watermarkNote: { type: 'string', description: 'Where the watermark sits and what it reads, or empty string' },
      quality: { type: 'string', enum: ['excellent', 'good', 'usable', 'poor'] },
      groupKey: { type: 'string', description: 'A short stable key identifying this exact garment across its different angles, e.g. "mehendi-green-anarkali". Photos of the SAME garment from different angles MUST share this key.' }
    },
    required: ['garment', 'category', 'colourName', 'pose', 'isCollage', 'hasWatermark', 'groupKey']
  };
  var SHOT_PROMPT =
    'You are cataloguing Indian ethnic womenswear for a Surat boutique. Look at this photograph and ' +
    'report only what you can actually see. Identify the garment type, the dominant colour (give it a ' +
    'premium two-word boutique name, never a plain word), the likely fabric and the visible craft. ' +
    'Say which camera angle this is: front, back, closeup, side, detail or full look. ' +
    'Flag whether any watermark, logo, brand name or phone number is overlaid on the photo. ' +
    'Flag whether the file is actually two or more photos tiled into one image. ' +
    'Finally give a groupKey that will be identical for every photo of this same garment.';

  /* ── screens ─────────────────────────────────────────────────────────────────────── */
  VA.view('cat', function () {
    var d = DB(), cats = d.catalogue || [], m = VAI.mode();
    var total = cats.reduce(function (s, p) { return s + p.variants.reduce(function (a, v) { return a + v.shots.length; }, 0); }, 0);
    return H.head('Catalogue', 'Catalogue', 'Drop 20–30 photos. The app reads each one and groups them into Product → Colour → Pose by itself. This is the top of the workflow — content, image edits, design and video all read from here.') +
      modeBanner(m) +
      H.kpis([
        { l: 'Products', v: cats.length, d: 'in the catalogue', icon: 'cart', tone: 'gold' },
        { l: 'Colour variants', v: cats.reduce(function (s, p) { return s + p.variants.length; }, 0), d: 'across products', icon: 'spark', tone: 'violet' },
        { l: 'Images', v: total, d: 'read & grouped', icon: 'image', tone: 'blue' },
        { l: 'With content', v: cats.filter(function (p) { return p.runId; }).length, d: 'generated', cls: 'g', icon: 'pen', tone: 'green' }
      ]) +
      H.panel('Upload the catalogue',
        '<div id="drop" style="border:2px dashed var(--line2);border-radius:14px;padding:26px;text-align:center;background:var(--surf2);cursor:pointer" data-act="catpick">' +
        '<div style="font-size:32px">📦</div><b style="font-size:15px;color:var(--p2)">Drop 20–30 photos here</b>' +
        '<p class="hint">' + (m.id === 'ai'
          ? 'Any filenames at all — straight off your phone or WhatsApp. Each photo is read and tagged automatically.'
          : 'Connect Gemini on <b>Connectors</b> and photos tag themselves. Without it, names like <code>mehendi-green-front.jpg</code> are the only clue available.') +
        '</p></div>' +
        '<input type="file" id="catfile" accept="image/*" multiple style="display:none">' +
        (cats.length ? '' : '<p class="hint" style="margin-top:10px">Nothing yet. Upload a set, or <button class="btn sm" data-act="catdemo">load a demo catalogue</button> to see the grouping.</p>')) +
      (d.catPending ? pendingPanel(d) : '') +
      cats.map(function (p) { return productPanel(p); }).join('');
  });
  VA.view('cat').after = function () {
    var f = VA.$('catfile'); if (f) f.onchange = function () { if (f.files.length) ingest(f.files); };
    var drop = VA.$('drop');
    if (drop) {
      drop.ondragover = function (e) { e.preventDefault(); drop.style.background = 'var(--surf)'; };
      drop.ondragleave = function () { drop.style.background = 'var(--surf2)'; };
      drop.ondrop = function (e) { e.preventDefault(); drop.style.background = 'var(--surf2)'; if (e.dataTransfer.files.length) ingest(e.dataTransfer.files); };
    }
  };

  function modeBanner(m) {
    if (m.id === 'ai') return '';
    return '<div class="panel" style="border-left:4px solid var(--gold);margin-bottom:14px"><div class="pb" style="padding:12px 14px">' +
      '<b style="font-size:13px">' + esc(m.label) + '</b> <span class="hint">— ' + esc(m.note) + '</span>' +
      '<div style="margin-top:8px"><button class="btn sm p" data-go="conn">Connect a model</button></div></div></div>';
  }

  /* ── the pending review table ── */
  function pendingPanel(d) {
    var p = d.catPending, busy = p.filter(function (r) { return r.status === 'queued' || r.status === 'reading'; }).length;
    var flags = p.filter(function (r) { return r.hasWatermark || r.isCollage; }).length;
    return H.panel('Just uploaded <span class="badge">' + p.length + ' photos</span>' +
      (busy ? ' <span class="badge" style="background:var(--gold);color:#fff">reading ' + (p.length - busy) + '/' + p.length + '</span>' : ''),
      (busy
        ? '<div style="height:6px;background:var(--surf2);border-radius:4px;overflow:hidden;margin-bottom:10px"><div style="height:100%;width:' + Math.round((p.length - busy) / p.length * 100) + '%;background:linear-gradient(90deg,var(--p2),var(--gold));transition:width .3s"></div></div>' +
          '<p class="hint" style="margin-bottom:10px">Reading each photo — garment, colour, fabric, craft and angle. This runs a few at a time to stay inside the free tier.</p>'
        : '<p class="hint" style="margin-bottom:10px">Everything below was read from the photos themselves. Change anything you disagree with, then confirm.</p>') +
      (flags ? '<div class="hint" style="margin-bottom:10px;color:var(--gold)"><b>' + flags + '</b> photo(s) flagged — a supplier watermark or a two-in-one collage. Both are fixable in Image Studio after grouping.</div>' : '') +
      H.table([
        { label: 'Photo', fmt: function (r) {
          return '<div style="display:flex;align-items:center;gap:7px"><img src="' + r.thumb + '" style="width:38px;height:48px;object-fit:cover;border-radius:5px;border:1px solid var(--line)">' +
            '<span>' + statusChip(r) + '</span></div>'; } },
        { label: 'Product', fmt: function (r) { return '<input value="' + esc(r.product) + '" data-pid="' + r.id + '" data-f="product" oninput="VA.CATedit(this)" style="width:140px;padding:4px 7px;border:1px solid var(--line2);border-radius:6px">'; } },
        { label: 'Colour', fmt: function (r) { return '<div style="display:flex;align-items:center;gap:5px">' + (r.colourHex ? '<span style="width:14px;height:14px;border-radius:4px;border:1px solid var(--line);background:' + esc(r.colourHex) + ';display:inline-block"></span>' : '') + '<input value="' + esc(r.colour) + '" data-pid="' + r.id + '" data-f="colour" oninput="VA.CATedit(this)" style="width:110px;padding:4px 7px;border:1px solid var(--line2);border-radius:6px"></div>'; } },
        { label: 'Fabric · craft', fmt: function (r) { return '<span class="hint">' + esc([r.fabric, r.work].filter(Boolean).join(' · ') || '—') + '</span>'; } },
        { label: 'Pose', fmt: function (r) { return '<select data-pid="' + r.id + '" data-f="pose" onchange="VA.CATedit(this)" style="padding:4px 6px;border:1px solid var(--line2);border-radius:6px">' + POSES.map(function (po) { return '<option value="' + po + '"' + (r.pose === po ? ' selected' : '') + '>' + POSEWORD[po] + '</option>'; }).join('') + '</select>'; } },
        { label: 'Flags', fmt: function (r) {
          var out = [];
          if (r.hasWatermark) out.push('<span class="badge" style="background:var(--gold);color:#fff" title="' + esc(r.watermarkNote || '') + '">watermark</span>');
          if (r.isCollage) out.push('<span class="badge" style="background:var(--p2);color:#fff">2-in-1</span>');
          if (r.quality === 'poor') out.push('<span class="badge">low qual</span>');
          return out.join(' ') || '<span class="hint">—</span>'; } }
      ], p) +
      '<div class="btnrow" style="margin-top:12px">' +
      '<button class="btn p" data-act="catconfirm"' + (busy ? ' disabled' : '') + '>Confirm &amp; group into ' + countProducts(p) + ' product(s)</button>' +
      (busy ? '' : '<button class="btn" data-act="catreread">Read again</button>') +
      '<button class="btn" data-act="catclear">Discard</button></div>');
  }
  function statusChip(r) {
    if (r.status === 'reading') return '<span class="badge" style="background:var(--p2);color:#fff">reading…</span>';
    if (r.status === 'queued') return '<span class="badge">queued</span>';
    if (r.status === 'draft') return '<span class="badge" title="No AI connected — guessed from the filename">draft</span>';
    if (r.status === 'failed') return '<span class="badge" style="background:#B4402F;color:#fff" title="' + esc(r.error || '') + '">failed</span>';
    return '<span class="badge" style="background:#2E9E6B;color:#fff">read ✓</span>';
  }
  function countProducts(p) { var s = {}; p.forEach(function (r) { if (r.product) s[r.product] = 1; }); return Object.keys(s).length || 1; }

  function productPanel(p) {
    var det = p.details || {};
    return H.panel('<span class="channel" style="border:0;padding:0;background:none;margin:0"><span class="ci" style="background:linear-gradient(96deg,var(--p1),var(--p2));width:26px;height:26px">' + VA.icon('cart') + '</span> ' + esc(p.name) + '</span> <span class="badge">' + p.variants.length + ' colour · ' + p.variants.reduce(function (a, v) { return a + v.shots.length; }, 0) + ' images</span>',
      (det.fabric || det.work ? '<p class="hint" style="margin-bottom:10px">' + esc([det.category, det.fabric, det.work].filter(Boolean).join(' · ')) + '</p>' : '') +
      p.variants.map(function (v) {
        return '<div style="margin-bottom:12px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
          (v.hex ? '<span style="width:14px;height:14px;border-radius:4px;border:1px solid var(--line);background:' + esc(v.hex) + ';display:inline-block"></span>' : '') +
          '<b style="font-size:13px">' + esc(v.colour || 'Default') + '</b><span class="hint">' + v.shots.length + ' poses</span></div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' + v.shots.map(function (sh) {
            return '<div style="text-align:center;position:relative">' +
              (sh.hasWatermark ? '<span style="position:absolute;top:2px;right:2px;background:var(--gold);color:#fff;font-size:8px;padding:1px 4px;border-radius:4px;font-weight:700">WM</span>' : '') +
              '<img src="' + sh.thumb + '" style="width:64px;height:82px;object-fit:cover;border-radius:7px;border:1px solid var(--line)">' +
              '<div class="hint" style="font-size:10px;margin-top:2px">' + POSEWORD[sh.pose] + '</div></div>';
          }).join('') + '</div></div>';
      }).join('') +
      '<div class="btnrow" style="margin-top:8px">' +
      (p.runId ? '<button class="btn sm" data-act="catopenrun" data-id="' + p.runId + '">Open content →</button>' : '<button class="btn sm p" data-act="catgen" data-id="' + p.id + '">Generate content</button>') +
      '<button class="btn sm" data-act="catedit" data-id="' + p.id + '">Edit images</button>' +
      '<button class="btn sm" data-act="catdesign" data-id="' + p.id + '">Make banner / thumbnail</button>' +
      '<button class="btn sm d" data-act="catdel" data-id="' + p.id + '">Delete</button></div>');
  }

  /* ── ingest ────────────────────────────────────────────────────────────────────────
     Read → thumbnail → store the full image → queue a vision pass on a smaller copy. */
  function ingest(files) {
    var arr = [].slice.call(files).filter(function (f) { return /image\//.test(f.type); }).slice(0, 60);
    if (!arr.length) { VA.toast('No images in that drop'); return; }
    var pending = [], read = 0;
    VA.toast('Reading ' + arr.length + ' photos…');
    arr.forEach(function (f, idx) {
      var rd = new FileReader();
      rd.onload = function (e) {
        var full = e.target.result;
        resize(full, 120, function (thumb) {
          resize(full, 768, function (small) {
            var id = VA.uid('sh'), key = 'img_' + id;
            VStore.putDataURL(key, full, function () {
              pending[idx] = {
                id: id, key: key, name: f.name, thumb: thumb, small: small,
                product: '', colour: '', colourHex: '', fabric: '', work: '', pose: 'front',
                hasWatermark: false, isCollage: false, quality: '', groupKey: '', status: 'queued'
              };
              if (++read === arr.length) {
                DB().catPending = pending.filter(Boolean);
                VA.save(); VA.render();
                analyseAll();
              }
            });
          });
        });
      };
      rd.readAsDataURL(f);
    });
  }
  function resize(dataURL, w, cb) {
    var im = new Image();
    im.onload = function () {
      var scale = Math.min(1, w / im.width), W = Math.max(1, Math.round(im.width * scale)), Hh = Math.max(1, Math.round(im.height * scale));
      var c = document.createElement('canvas'); c.width = W; c.height = Hh;
      c.getContext('2d').drawImage(im, 0, 0, W, Hh);
      cb(c.toDataURL('image/jpeg', 0.82));
    };
    im.onerror = function () { cb(dataURL); };
    im.src = dataURL;
  }

  /* run the vision pass over everything still queued, one at a time (VAI throttles) */
  function analyseAll() {
    var rows = (DB().catPending || []).filter(function (r) { return r.status === 'queued'; });
    if (!rows.length) return;
    if (!VAI.hasVision()) {
      rows.forEach(function (r) {
        r.product = detectProduct(r.name); r.colour = detectColour(r.name); r.pose = detectPose(r.name);
        r.status = 'draft';
      });
      VA.save(); VA.render();
      VA.toast('No AI connected — tagged from filenames only (draft)');
      return;
    }
    var i = 0, redrawAt = 0;
    function next() {
      if (i >= rows.length) {
        VA.save(); VA.render();
        VA.toast('Read ' + rows.length + ' photos — check the grouping');
        return;
      }
      var r = rows[i++];
      r.status = 'reading';
      if (Date.now() > redrawAt) { redrawAt = Date.now() + 400; VA.render(); }
      VAI.vision(r.small, SHOT_PROMPT, SHOT_SCHEMA)
        .then(function (v) { apply(r, v); r.status = 'read'; })
        .catch(function (e) {
          r.status = 'failed'; r.error = String(e.message || e).slice(0, 120);
          /* never leave a row unusable — fall back to the filename guess */
          r.product = detectProduct(r.name) || 'Product'; r.colour = detectColour(r.name); r.pose = detectPose(r.name);
        })
        .then(function () { VA.save(); VA.render(); next(); });
    }
    next();
  }
  function apply(r, v) {
    r.product = v.garment || detectProduct(r.name) || 'Product';
    r.colour = v.colourName || '';
    r.colourHex = /^#[0-9a-f]{6}$/i.test(v.colourHex || '') ? v.colourHex : '';
    r.fabric = v.fabric || ''; r.work = v.work || '';
    r.pose = POSES.indexOf(v.pose) >= 0 ? v.pose : 'front';
    r.category = v.category || '';
    r.hasWatermark = !!v.hasWatermark; r.watermarkNote = v.watermarkNote || '';
    r.isCollage = !!v.isCollage; r.modelPresent = !!v.modelPresent;
    r.quality = v.quality || ''; r.groupKey = v.groupKey || '';
  }

  /* ── actions ── */
  VA.action('catpick', function () { VA.$('catfile').click(); });
  VA.action('catclear', function () { DB().catPending = null; VA.save(); VA.render(); });
  VA.action('catreread', function () {
    (DB().catPending || []).forEach(function (r) { r.status = 'queued'; });
    VA.save(); VA.render(); analyseAll();
  });
  VA.CATedit = function (el) {
    var id = el.getAttribute('data-pid'), f = el.getAttribute('data-f'), row = (DB().catPending || []).filter(function (r) { return r.id === id; })[0];
    if (row) { row[f] = el.value; VA.save(); }
  };

  VA.action('catconfirm', function () {
    var d = DB(), p = (d.catPending || []).filter(function (r) { return r.status !== 'queued' && r.status !== 'reading'; });
    if (!p.length) { VA.toast('Still reading — one moment'); return; }
    /* group on what was seen: product name, then colour. groupKey breaks ties when the
       model named the same garment slightly differently between angles. */
    var byProd = {};
    p.forEach(function (r) {
      var pk = (r.product || 'Product').trim();
      byProd[pk] = byProd[pk] || {};
      var ck = (r.colour || 'Default').trim();
      byProd[pk][ck] = byProd[pk][ck] || [];
      byProd[pk][ck].push({ id: r.id, key: r.key, name: r.name, thumb: r.thumb, pose: r.pose, hasWatermark: r.hasWatermark, isCollage: r.isCollage, hex: r.colourHex });
    });
    d.catalogue = d.catalogue || [];
    var made = 0;
    Object.keys(byProd).forEach(function (pn) {
      var sample = p.filter(function (r) { return (r.product || 'Product').trim() === pn; })[0] || {};
      var variants = Object.keys(byProd[pn]).map(function (cn) {
        var shots = byProd[pn][cn];
        return { colour: cn === 'Default' ? '' : cn, hex: (shots[0] || {}).hex || '', shots: shots };
      });
      d.catalogue.push({
        id: VA.uid('cp'), name: pn, variants: variants,
        details: { category: sample.category || '', fabric: sample.fabric || '', work: sample.work || '', modelPresent: !!sample.modelPresent },
        runId: null
      });
      made++;
    });
    d.catPending = null; VA.save();
    VA.toast('Grouped into ' + made + ' product(s)'); VA.render();
  });

  VA.action('catdel', function (b) { var d = DB(); d.catalogue = d.catalogue.filter(function (p) { return p.id !== b.getAttribute('data-id'); }); VA.save(); VA.render(); });
  VA.action('catopenrun', function (b) { DB().openRun = b.getAttribute('data-id'); VA.go('run'); });

  VA.action('catgen', function (b) {
    var p = DB().catalogue.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0]; if (!p) return;
    var v = p.variants[0] || {}, det = p.details || {};
    VA.CE.run({
      desc: [v.colour, det.fabric, det.work, p.name].filter(Boolean).join(' '),
      colour: v.colour || '', fabric: det.fabric || '', work: det.work || '',
      cat: det.category || '', occ: 'festive', catId: p.id
    });
  });
  VA.action('catedit', function (b) {
    var p = DB().catalogue.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
    if (p && p.variants[0] && p.variants[0].shots[0]) { DB().imgLoadKey = p.variants[0].shots[0].key; DB().imgLoadCat = p.id; VA.go('img'); VA.toast('Loading into Image Studio…'); }
    else VA.go('img');
  });
  VA.action('catdesign', function (b) {
    var p = DB().catalogue.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
    DB().desFromCat = p ? p.id : null; VA.go('des'); VA.toast('Design Studio — pick banner / thumbnail');
  });

  VA.action('catdemo', function () {
    var d = DB(); d.catalogue = d.catalogue || [];
    var demo = [['Anarkali Gown', [['Mehendi Green', '#4E7A2A'], ['Ruby Wine', '#7A1F3D']], 'Roman Silk', 'Zari Weaving'],
                ['Organza Saree', [['Sage Mist', '#9CAF88']], 'Organza', 'Sequin']];
    demo.forEach(function (row) {
      var variants = row[1].map(function (col) {
        return { colour: col[0], hex: col[1], shots: ['front', 'back', 'closeup', 'side'].map(function (po) {
          return { id: VA.uid('sh'), key: null, name: col[0] + '-' + po, thumb: swatch(col[1], po), pose: po };
        }) };
      });
      d.catalogue.push({ id: VA.uid('cp'), name: row[0], variants: variants, details: { fabric: row[2], work: row[3] }, runId: null });
    });
    VA.save(); VA.toast('Demo catalogue loaded'); VA.render();
  });
  function swatch(hex, pose) {
    var c = document.createElement('canvas'); c.width = 120; c.height = 150; var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 120, 150); g.addColorStop(0, hex || '#5B2D8E'); g.addColorStop(1, '#1A0B38');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 120, 150);
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '700 13px Georgia'; ctx.textAlign = 'center'; ctx.fillText(pose, 60, 80);
    return c.toDataURL('image/jpeg', 0.7);
  }

  VA.CAT = {
    detectPose: detectPose, detectColour: detectColour, detectProduct: detectProduct,
    POSES: POSES, SHOT_SCHEMA: SHOT_SCHEMA, analyseAll: analyseAll
  };
})();
