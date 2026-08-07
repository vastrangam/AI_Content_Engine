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
    return H.head('Catalogue', 'Catalogue', 'Drop the photos, say what you know, and choose how hard the engine should work. Everything downstream — content, images, design, video — reads from here.') +
      modeBanner(m) +
      VA.COMPOSER.panel() +
      '<input type="file" id="catfile" accept="image/*" multiple style="display:none">' +
      (cats.length || d.catPending ? '' :
        '<p class="hint" style="margin:-4px 0 18px">Nothing yet — upload a set, or <button class="btn sm" data-act="catdemo">load a demo catalogue</button> to see the grouping.</p>') +
      (cats.length ? H.kpis([
        { l: 'Products', v: cats.length, d: 'in the catalogue', icon: 'cart', tone: 'gold' },
        { l: 'Colour variants', v: cats.reduce(function (s, p) { return s + p.variants.length; }, 0), d: 'across products', icon: 'spark', tone: 'violet' },
        { l: 'Images', v: total, d: 'read & grouped', icon: 'image', tone: 'blue' },
        { l: 'With content', v: cats.filter(function (p) { return p.runId; }).length, d: 'generated', cls: 'g', icon: 'pen', tone: 'green' }
      ]) : '') +
      (d.catPending ? pendingPanel(d) : '') +
      cats.map(function (p) { return productPanel(p); }).join('');
  });
  VA.view('cat').after = function () {
    hydrateThumbs();
    var f = VA.$('catfile'); if (f) f.onchange = function () { if (f.files.length) ingest(f.files); };
    /* the whole composer is a drop target, not just the dashed strip inside it */
    var drop = VA.$('composer');
    if (drop) {
      drop.ondragover = function (e) { e.preventDefault(); drop.classList.add('over'); };
      drop.ondragleave = function (e) { if (!drop.contains(e.relatedTarget)) drop.classList.remove('over'); };
      drop.ondrop = function (e) { e.preventDefault(); drop.classList.remove('over'); if (e.dataTransfer.files.length) ingest(e.dataTransfer.files); };
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
        ? '<div style="height:6px;background:var(--surf2);border-radius:4px;overflow:hidden;margin-bottom:10px"><div style="height:100%;width:' + Math.round((p.length - busy) / p.length * 100) + '%;background:linear-gradient(90deg,var(--ink),var(--gold));transition:width .3s"></div></div>' +
          '<p class="hint" style="margin-bottom:10px">Reading each photo — garment, colour, fabric, craft and angle. This runs a few at a time to stay inside the free tier.</p>'
        : '<p class="hint" style="margin-bottom:10px">Everything below was read from the photos themselves. Change anything you disagree with, then confirm.</p>') +
      (flags ? '<div class="hint" style="margin-bottom:10px;color:var(--gold)"><b>' + flags + '</b> photo(s) flagged — a supplier watermark or a two-in-one collage. Both are fixable in Image Studio after grouping.</div>' : '') +
      H.table([
        { label: 'Photo', fmt: function (r) {
          return '<div style="display:flex;align-items:center;gap:8px">' + thumbTag(r, 38, 48) +
            '<div style="min-width:0">' + statusChip(r) +
            (r.status === 'failed' && r.error
              ? '<div class="failwhy">' + esc(r.error) + '</div>' +
                '<button class="btn sm" data-act="catretry" data-id="' + r.id + '" style="margin-top:5px">Retry this one</button>'
              : '') +
            '</div></div>'; } },
        { label: 'Design name', fmt: function (r) { return '<input class="cell" value="' + esc(r.product) + '" data-pid="' + r.id + '" data-f="product" oninput="VA.CATedit(this)" style="width:150px">' +
          (r.code ? '<div class="hint" style="margin-top:2px">design code ' + esc(r.code) + '</div>' : ''); } },
        { label: 'Colour', fmt: function (r) { return '<div style="display:flex;align-items:center;gap:6px">' + (r.colourHex ? '<span class="sw" style="background:' + esc(r.colourHex) + '"></span>' : '') + '<input class="cell" value="' + esc(r.colour) + '" data-pid="' + r.id + '" data-f="colour" oninput="VA.CATedit(this)" style="width:118px" placeholder="' + (r.status === 'read' ? '—' : 'from the photo') + '"></div>'; } },
        { label: 'Fabric · craft', fmt: function (r) { return '<span class="hint">' + esc([r.fabric, r.work].filter(Boolean).join(' · ') || '—') + '</span>'; } },
        { label: 'Pose', fmt: function (r) { return '<select class="cell" data-pid="' + r.id + '" data-f="pose" onchange="VA.CATedit(this)">' +
          (r.pose ? '' : '<option value="" selected>— reading —</option>') +
          POSES.map(function (po) { return '<option value="' + po + '"' + (r.pose === po ? ' selected' : '') + '>' + POSEWORD[po] + '</option>'; }).join('') + '</select>'; } },
        { label: 'Flags', fmt: function (r) {
          var out = [];
          if (r.hasWatermark) out.push('<span class="badge" style="background:var(--gold);color:#fff" title="' + esc(r.watermarkNote || '') + '">watermark</span>');
          if (r.isCollage) out.push('<span class="badge" style="background:var(--p2);color:#fff">2-in-1</span>');
          if (r.quality === 'poor') out.push('<span class="badge">low qual</span>');
          return out.join(' ') || '<span class="hint">—</span>'; } }
      ], p) +
      (p.filter(function (r) { return r.status === 'failed'; }).length
        ? '<div class="warn" style="margin-top:10px"><b>' + p.filter(function (r) { return r.status === 'failed'; }).length +
          ' photo(s) could not be read.</b> The reason is on each row. You can retry them, or just type the details yourself — ' +
          'anything you fill in by hand beats anything the model would have said.</div>'
        : '') +
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
    return H.panel('<span class="channel" style="border:0;padding:0;background:none;margin:0"><span class="ci" style="width:26px;height:26px">' + VA.icon('cart') + '</span> ' + esc(p.name) + '</span> <span class="badge">' + p.variants.length + ' colour · ' + p.variants.reduce(function (a, v) { return a + v.shots.length; }, 0) + ' images</span>',
      (det.fabric || det.work ? '<p class="hint" style="margin-bottom:10px">' + esc([det.category, det.fabric, det.work].filter(Boolean).join(' · ')) + '</p>' : '') +
      p.variants.map(function (v) {
        return '<div style="margin-bottom:12px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
          (v.hex ? '<span style="width:14px;height:14px;border-radius:4px;border:1px solid var(--line);background:' + esc(v.hex) + ';display:inline-block"></span>' : '') +
          '<b style="font-size:13px">' + esc(v.colour || 'Default') + '</b><span class="hint">' + v.shots.length + ' poses</span></div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' + v.shots.map(function (sh) {
            return '<div style="text-align:center;position:relative">' +
              (sh.hasWatermark ? '<span style="position:absolute;top:2px;right:2px;background:var(--gold);color:#fff;font-size:8px;padding:1px 4px;border-radius:4px;font-weight:700">WM</span>' : '') +
              thumbTag(sh, 64, 82) +
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
  /* Photos go to IndexedDB; the record keeps only ids. v3 kept a 768px analysis copy and a
     thumbnail inside the record itself — 377 KB each on a real photograph, so thirty of them
     pushed the database to 11 MB, localStorage threw QuotaExceededError, nothing persisted,
     and the self-tests failed after a reload. Never put pixels in the record. */
  function ingest(files) {
    var arr = [].slice.call(files).filter(function (f) { return /image\//.test(f.type); }).slice(0, 60);
    if (!arr.length) { VA.toast('No images in that drop'); return; }
    var pending = [], read = 0;
    VA.toast('Reading ' + arr.length + ' photos…');
    arr.forEach(function (f, idx) {
      var rd = new FileReader();
      rd.onload = function (e) {
        var full = e.target.result;
        resize(full, 160, function (thumb) {
          resize(full, 768, function (small) {
            var id = VA.uid('sh'), key = 'img_' + id, tk = 'thm_' + id, sk = 'sml_' + id;
            VStore.putDataURL(key, full, function () {
              VStore.putDataURL(tk, thumb, function () {
                VStore.putDataURL(sk, small, function () {
                  /* a real SKU filename already tells us product + colour + pose, so read
                     it immediately — vision then only has to confirm fabric/craft/quality */
                  /* the filename gives a provisional design name; the colour and the pose
                     are left blank on purpose until a photograph has actually been read */
                  var sk2 = VSKU.parse(f.name), known = VSKU.looksLikeSKU(f.name);
                  pending[idx] = {
                    id: id, key: key, thumbKey: tk, smallKey: sk, name: f.name,
                    sku: known ? f.name : '',
                    product: known ? sk2.base : '', colour: known ? sk2.colour : '',
                    code: sk2.code || '',
                    productManual: false, colourManual: false, poseManual: false,
                    colourHex: '', fabric: '', work: '',
                    pose: sk2.poseInName ? sk2.pose : '',
                    hasWatermark: false, isCollage: false, quality: '', groupKey: '',
                    status: 'queued'
                  };
                  if (++read === arr.length) {
                    DB().catPending = pending.filter(Boolean);
                    VA.save(); VA.render();
                    analyseAll();
                  }
                });
              });
            });
          });
        });
      };
      rd.readAsDataURL(f);
    });
  }

  /* thumbnails are resolved from IndexedDB after render — an <img data-thumb="key"> is
     filled in asynchronously, so no pixel data ever sits in the record */
  function hydrateThumbs() {
    [].slice.call(document.querySelectorAll('img[data-thumb]')).forEach(function (im) {
      var k = im.getAttribute('data-thumb');
      if (!k || im.getAttribute('data-done')) return;
      im.setAttribute('data-done', '1');
      VStore.getDataURL(k, function (u) { if (u) im.src = u; });
    });
  }
  /* a 1×1 transparent placeholder so the layout never jumps while thumbs load */
  var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  function thumbTag(r, w, h) {
    var k = r.thumbKey || '';
    return '<img ' + (k ? 'data-thumb="' + k + '" src="' + BLANK + '"' : 'src="' + (r.thumb || BLANK) + '"') +
      ' style="width:' + w + 'px;height:' + h + 'px;object-fit:cover;border-radius:6px;border:1px solid var(--line);background:var(--surf2)">';
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

  function withSmall(r, cb) {
    if (r.small) return cb(r.small);                       /* legacy record */
    if (!r.smallKey) return cb(null);
    VStore.getDataURL(r.smallKey, cb);
  }

  /* ── read every queued photo ────────────────────────────────────────────────────────
     This used to walk the list strictly one at a time and wait for each to finish. With a
     four-second gap, a 32-second timeout and three retries, two bad photos out of five
     took five minutes. VAI now runs several calls at once and paces itself against real
     429s, so this just feeds the queue and lets the pacer decide the rate. */
  function analyseAll() {
    var rows = (DB().catPending || []).filter(function (r) { return r.status === 'queued' || r.status === 'sku' || r.status === 'failed'; });
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
    VAI.setLanes(3);
    var left = rows.length, redrawAt = 0, t0 = Date.now();
    function paint(force) {
      if (!force && Date.now() < redrawAt) return;
      redrawAt = Date.now() + 500;
      VA.save(); VA.render();
    }
    rows.forEach(function (r) {
      r.status = 'reading'; r.error = '';
      withSmall(r, function (small) {
        if (!small) { r.status = 'failed'; r.error = 'the analysis copy of this photo is missing — re-upload it'; finish(); return; }
        VAI.vision(small, SHOT_PROMPT, SHOT_SCHEMA)
          .then(function (v) { apply(r, v); r.status = 'read'; })
          .catch(function (e) {
            r.status = 'failed';
            r.error = explain(e);
            /* never leave a row unusable — the filename guess stands in until you retry */
            r.product = r.product || detectProduct(r.name) || 'Product';
          })
          .then(finish);
      });
      function finish() {
        paint();
        if (!--left) {
          var ok = (DB().catPending || []).filter(function (x) { return x.status === 'read'; }).length;
          var bad = (DB().catPending || []).filter(function (x) { return x.status === 'failed'; }).length;
          paint(true);
          VA.toast(bad
            ? ok + ' read, ' + bad + ' failed in ' + Math.round((Date.now() - t0) / 1000) + 's — press Retry on the failed rows'
            : 'Read ' + ok + ' photos in ' + Math.round((Date.now() - t0) / 1000) + 's — check the grouping');
        }
      }
    });
    paint(true);
  }

  /* A row that just says "failed" is useless — you cannot act on it and you cannot tell
     anyone what went wrong. Every failure now carries a sentence you can act on. */
  function explain(e) {
    var m = String((e && e.message) || e || '').slice(0, 200);
    if (/\b429\b|quota|rate/i.test(m)) return 'Google rate-limited this call (429). The reader has slowed itself down — press Retry.';
    if (/\b40[13]\b|API_KEY|PERMISSION|unauthor/i.test(m)) return 'Your key was rejected. Check it on Connectors → Diagnose.';
    if (/\b404\b|not found|model/i.test(m)) return 'That model is not available to your key. Connectors → Diagnose picks a working one.';
    if (/timeout/i.test(m)) return 'No answer in 32 seconds. Usually a slow connection — press Retry.';
    if (/Failed to fetch|network|offline/i.test(m)) return 'No connection. The app still works offline; reconnect and press Retry.';
    if (/did not return JSON|returned nothing/i.test(m)) return 'The model replied with something unreadable. Press Retry.';
    if (/\b400\b/i.test(m)) return 'Google refused the request (400) — often an image it will not accept. Try re-saving that photo as a JPG.';
    return m || 'Unknown error.';
  }

  function apply(r, v) {
    var fromName = VSKU.parse(r.name);

    /* design name — the model names the garment, but a real filename names the design, and
       "Green Plazo" is more use to a seller than "Kurti Set". Prefer the filename here. */
    if (!r.productManual) {
      r.product = (r.sku && fromName.base) || v.garment || detectProduct(r.name) || 'Product';
    }
    /* colour and pose are pure observation — the photograph is the only honest source */
    if (!r.colourManual) r.colour = v.colourName || fromName.colour || '';
    if (!r.poseManual) {
      r.pose = POSES.indexOf(v.pose) >= 0 ? v.pose
        : (fromName.poseInName && fromName.pose) ? fromName.pose : 'front';
    }
    r.garment = v.garment || '';
    r.colourHex = /^#[0-9a-f]{6}$/i.test(v.colourHex || '') ? v.colourHex : '';
    r.fabric = v.fabric || ''; r.work = v.work || '';
    r.category = v.category || '';
    r.hasWatermark = !!v.hasWatermark; r.watermarkNote = v.watermarkNote || '';
    r.isCollage = !!v.isCollage; r.modelPresent = !!v.modelPresent;
    r.quality = v.quality || ''; r.groupKey = v.groupKey || '';
  }

  /* ── actions ── */
  VA.action('catpick', function () { VA.$('catfile').click(); });
  VA.action('catclear', function () { DB().catPending = null; VA.save(); VA.render(); });
  VA.action('catretry', function (b) {
    var r = (DB().catPending || []).filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
    if (!r) return;
    r.status = 'queued'; r.error = ''; VA.save(); VA.render(); analyseAll();
  });
  VA.action('catreread', function () {
    (DB().catPending || []).forEach(function (r) { r.status = 'queued'; });
    VA.save(); VA.render(); analyseAll();
  });
  VA.CATedit = function (el) {
    var id = el.getAttribute('data-pid'), f = el.getAttribute('data-f'), row = (DB().catPending || []).filter(function (r) { return r.id === id; })[0];
    if (row) {
      row[f] = el.value;
      if (f === 'product') row.productManual = true;
      if (f === 'colour') row.colourManual = true;
      if (f === 'pose') row.poseManual = true;
      VA.save();
    }
  };

  VA.action('catconfirm', function () {
    var d = DB(), p = (d.catPending || []).filter(function (r) { return r.status !== 'queued' && r.status !== 'reading'; });
    if (!p.length) { VA.toast('Still reading — one moment'); return; }
    /* RAYON_FOILPAN_WINE / _BLACK / _BLUE / _RED are ONE product in four colours, not four
       products. VSKU strips the colour off the end of the SKU and groups on what is left. */
    var products = VSKU.group(p);
    d.catalogue = d.catalogue || [];
    products.forEach(function (pr) {
      var sample = p.filter(function (r) { return (r.product || '') === pr.name; })[0] || p[0] || {};
      d.catalogue.push({
        id: VA.uid('cp'), name: pr.name, baseKey: pr.baseKey, variants: pr.variants,
        details: { category: sample.category || '', fabric: sample.fabric || '', work: sample.work || '',
                   garment: sample.garment || '', modelPresent: !!sample.modelPresent },
        runId: null
      });
    });
    d.catPending = null; VA.save();
    var colours = products.reduce(function (a, x) { return a + x.variants.length; }, 0);
    VA.toast('Grouped into ' + products.length + ' product(s) · ' + colours + ' colour variant(s)');
    VA.render();
  });

  VA.action('catdel', function (b) { var d = DB(); d.catalogue = d.catalogue.filter(function (p) { return p.id !== b.getAttribute('data-id'); }); VA.save(); VA.render(); });
  VA.action('catopenrun', function (b) { DB().openRun = b.getAttribute('data-id'); VA.go('run'); });

  /* Generate content for ONE catalogue product. Every value comes off that product —
     its own colours, its own fabric and craft, its own design name — so two products can
     never come out reading the same. The typed brief is layered on top by VA.COMPOSER,
     which is the single place that decides how brief and photograph combine. */
  VA.action('catgen', function (b) {
    var p = DB().catalogue.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0]; if (!p) return;
    VA.COMPOSER.runProduct(p);
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
    POSES: POSES, SHOT_SCHEMA: SHOT_SCHEMA, analyseAll: analyseAll,
    ingest: ingest, applyVision: apply, explain: explain, pendingPanel: pendingPanel, productPanel: productPanel,
    modeBanner: modeBanner, hydrateThumbs: hydrateThumbs
  };
})();
