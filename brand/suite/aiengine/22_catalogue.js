/* ═══════════ Vastrangam AI Engine — Catalogue (bulk upload → product → colour → pose) ═══════════
   Drop 20–30 images at once. They are grouped into Product → Colour variant → Pose by reading
   the filename, then you fix anything by hand. This is the top of the workflow: everything
   downstream (content, image edits, design, video) reads from the catalogue. */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  var POSES = ['front', 'back', 'closeup', 'side', 'detail', 'look'];
  var POSEWORD = { front: 'Front', back: 'Back', closeup: 'Close-up', side: 'Side', detail: 'Detail', look: 'Full look' };
  function detectPose(name) {
    var n = name.toLowerCase();
    if (/back|rear|behind/.test(n)) return 'back';
    if (/close|closeup|close-up|zoom|macro|detail|fabric/.test(n)) return 'closeup';
    if (/side|profile|angle/.test(n)) return 'side';
    if (/look|full|ootd|style/.test(n)) return 'look';
    if (/front|main|hero|_1\b|-1\b/.test(n)) return 'front';
    return 'front';
  }
  function detectColour(name) {
    var n = name.toLowerCase();
    var cols = ['mehendi', 'green', 'red', 'maroon', 'wine', 'blue', 'navy', 'teal', 'peacock', 'pink', 'rani', 'rose',
      'purple', 'lavender', 'mustard', 'yellow', 'gold', 'orange', 'rust', 'black', 'white', 'ivory', 'cream', 'grey', 'gray', 'sage', 'pista'];
    for (var i = 0; i < cols.length; i++) if (n.indexOf(cols[i]) >= 0) return cap(cols[i]);
    return '';
  }
  function detectProduct(name) {
    /* strip extension, pose words, colour words, numbers → a product stem */
    var n = name.replace(/\.[a-z0-9]+$/i, '').toLowerCase();
    n = n.replace(/(front|back|close-?up|side|detail|look|hero|main|rear|profile|zoom|macro)/g, ' ');
    n = n.replace(/\b(mehendi|green|red|maroon|wine|blue|navy|teal|peacock|pink|rani|rose|purple|lavender|mustard|yellow|gold|orange|rust|black|white|ivory|cream|grey|gray|sage|pista)\b/g, ' ');
    n = n.replace(/[_\-#0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
    return n ? n.split(' ').map(cap).join(' ') : 'Product';
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ── screens ── */
  VA.view('cat', function () {
    var d = DB(), cats = d.catalogue || [];
    var total = cats.reduce(function (s, p) { return s + p.variants.reduce(function (a, v) { return a + v.shots.length; }, 0); }, 0);
    return H.head('Catalogue', 'Catalogue', 'Drop a whole catalogue of images at once. They group into Product → Colour → Pose automatically, and you fix anything by hand. This is the top of the workflow — content, image edits, design and video all read from here.') +
      H.kpis([
        { l: 'Products', v: cats.length, d: 'in the catalogue', icon: 'cart', tone: 'gold' },
        { l: 'Colour variants', v: cats.reduce(function (s, p) { return s + p.variants.length; }, 0), d: 'across products', icon: 'spark', tone: 'violet' },
        { l: 'Images', v: total, d: 'uploaded & grouped', icon: 'image', tone: 'blue' },
        { l: 'With content', v: cats.filter(function (p) { return p.runId; }).length, d: 'generated', cls: 'g', icon: 'pen', tone: 'green' }
      ]) +
      H.panel('Upload the catalogue',
        '<div id="drop" style="border:2px dashed var(--line2);border-radius:14px;padding:26px;text-align:center;background:var(--surf2);cursor:pointer" data-act="catpick">' +
        '<div style="font-size:32px">📦</div><b style="font-size:15px;color:var(--p2)">Drop 20–30 images here</b>' +
        '<p class="hint">or click to choose. Name them like <code>mehendi-green-front.jpg</code> and they group themselves — front, back, close-up, side.</p></div>' +
        '<input type="file" id="catfile" accept="image/*" multiple style="display:none">' +
        (cats.length ? '' : '<p class="hint" style="margin-top:10px">Nothing yet. Upload a set, or <button class="btn sm" data-act="catdemo">load a demo catalogue</button> to see the grouping.</p>')) +
      (d.catPending ? pendingPanel(d) : '') +
      cats.map(function (p) { return productPanel(p); }).join('') ||
      '';
  });
  VA.view('cat').after = function () {
    var f = VA.$('catfile'); if (f) f.onchange = function () { if (f.files.length) ingest(f.files); };
    var drop = VA.$('drop'); if (drop) { drop.ondragover = function (e) { e.preventDefault(); drop.style.background = 'var(--surf)'; }; drop.ondragleave = function () { drop.style.background = 'var(--surf2)'; }; drop.ondrop = function (e) { e.preventDefault(); drop.style.background = 'var(--surf2)'; if (e.dataTransfer.files.length) ingest(e.dataTransfer.files); }; }
  };

  function pendingPanel(d) {
    var p = d.catPending;
    return H.panel('Just uploaded <span class="badge">' + p.length + ' images</span>',
      '<p class="hint" style="margin-bottom:10px">Grouped by filename. Fix any product name or colour, then confirm — the images are already saved.</p>' +
      H.table([
        { label: 'Image', fmt: function (r) { return '<img src="' + r.thumb + '" style="width:38px;height:48px;object-fit:cover;border-radius:5px;border:1px solid var(--line)"> <span class="hint">' + esc(r.name.slice(0, 20)) + '</span>'; } },
        { label: 'Product', fmt: function (r) { return '<input value="' + esc(r.product) + '" data-pid="' + r.id + '" data-f="product" oninput="VA.CATedit(this)" style="width:130px;padding:4px 7px;border:1px solid var(--line2);border-radius:6px">'; } },
        { label: 'Colour', fmt: function (r) { return '<input value="' + esc(r.colour) + '" data-pid="' + r.id + '" data-f="colour" oninput="VA.CATedit(this)" style="width:100px;padding:4px 7px;border:1px solid var(--line2);border-radius:6px">'; } },
        { label: 'Pose', fmt: function (r) { return '<select data-pid="' + r.id + '" data-f="pose" onchange="VA.CATedit(this)" style="padding:4px 6px;border:1px solid var(--line2);border-radius:6px">' + POSES.map(function (po) { return '<option value="' + po + '"' + (r.pose === po ? ' selected' : '') + '>' + POSEWORD[po] + '</option>'; }).join('') + '</select>'; } }
      ], p) +
      '<div class="btnrow" style="margin-top:12px"><button class="btn p" data-act="catconfirm">Confirm & group into ' + countProducts(p) + ' product(s)</button><button class="btn" data-act="catclear">Discard</button></div>');
  }
  function countProducts(p) { var s = {}; p.forEach(function (r) { s[r.product] = 1; }); return Object.keys(s).length; }

  function productPanel(p) {
    return H.panel('<span class="channel" style="border:0;padding:0;background:none;margin:0"><span class="ci" style="background:linear-gradient(96deg,var(--p1),var(--p2));width:26px;height:26px">' + VA.icon('cart') + '</span> ' + esc(p.name) + '</span> <span class="badge">' + p.variants.length + ' colour · ' + p.variants.reduce(function (a, v) { return a + v.shots.length; }, 0) + ' images</span>',
      p.variants.map(function (v) {
        return '<div style="margin-bottom:12px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><b style="font-size:13px">' + esc(v.colour || 'Default') + '</b>' +
          '<span class="hint">' + v.shots.length + ' poses</span></div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' + v.shots.map(function (sh) {
            return '<div style="text-align:center"><img src="' + sh.thumb + '" style="width:64px;height:82px;object-fit:cover;border-radius:7px;border:1px solid var(--line)"><div class="hint" style="font-size:10px;margin-top:2px">' + POSEWORD[sh.pose] + '</div></div>';
          }).join('') + '</div></div>';
      }).join('') +
      '<div class="btnrow" style="margin-top:8px">' +
      (p.runId ? '<button class="btn sm" data-act="catopenrun" data-id="' + p.runId + '">Open content →</button>' : '<button class="btn sm p" data-act="catgen" data-id="' + p.id + '">Generate content</button>') +
      '<button class="btn sm" data-act="catedit" data-id="' + p.id + '">Edit images</button>' +
      '<button class="btn sm" data-act="catdesign" data-id="' + p.id + '">Make banner / thumbnail</button>' +
      '<button class="btn sm d" data-act="catdel" data-id="' + p.id + '">Delete</button></div>');
  }

  /* ── ingest: read files, thumbnail, guess grouping, store blobs ── */
  function ingest(files) {
    var arr = [].slice.call(files).filter(function (f) { return /image\//.test(f.type); }).slice(0, 60);
    var pending = [], done = 0;
    VA.toast('Reading ' + arr.length + ' images…');
    arr.forEach(function (f) {
      var rd = new FileReader();
      rd.onload = function (e) {
        var full = e.target.result;
        thumbnail(full, function (thumb) {
          var id = VA.uid('sh'), key = 'img_' + id;
          VStore.putDataURL(key, full, function () {
            pending.push({ id: id, key: key, name: f.name, thumb: thumb, product: detectProduct(f.name), colour: detectColour(f.name), pose: detectPose(f.name) });
            if (++done === arr.length) { DB().catPending = pending; VA.save(); VA.render(); VA.toast(arr.length + ' images ready — check the grouping'); }
          });
        });
      };
      rd.readAsDataURL(f);
    });
  }
  function thumbnail(dataURL, cb) {
    var im = new Image(); im.onload = function () {
      var w = 120, h = Math.round(im.height / im.width * w), c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(im, 0, 0, w, h); cb(c.toDataURL('image/jpeg', 0.7));
    }; im.onerror = function () { cb(dataURL); }; im.src = dataURL;
  }

  VA.action('catpick', function () { VA.$('catfile').click(); });
  VA.action('catclear', function () { DB().catPending = null; VA.save(); VA.render(); });
  VA.CATedit = function (el) {
    var id = el.getAttribute('data-pid'), f = el.getAttribute('data-f'), row = (DB().catPending || []).filter(function (r) { return r.id === id; })[0];
    if (row) { row[f] = el.value; VA.save(); }
  };
  VA.action('catconfirm', function () {
    var d = DB(), p = d.catPending || [];
    var byProd = {};
    p.forEach(function (r) {
      var pk = r.product || 'Product'; byProd[pk] = byProd[pk] || {}; var ck = r.colour || 'Default';
      byProd[pk][ck] = byProd[pk][ck] || []; byProd[pk][ck].push({ id: r.id, key: r.key, name: r.name, thumb: r.thumb, pose: r.pose });
    });
    d.catalogue = d.catalogue || [];
    Object.keys(byProd).forEach(function (pn) {
      var variants = Object.keys(byProd[pn]).map(function (cn) { return { colour: cn === 'Default' ? '' : cn, shots: byProd[pn][cn] }; });
      d.catalogue.push({ id: VA.uid('cp'), name: pn, variants: variants, details: {}, runId: null });
    });
    d.catPending = null; VA.save(); VA.toast('Grouped into ' + Object.keys(byProd).length + ' product(s)'); VA.render();
  });
  VA.action('catdel', function (b) { var d = DB(); d.catalogue = d.catalogue.filter(function (p) { return p.id !== b.getAttribute('data-id'); }); VA.save(); VA.render(); });
  VA.action('catopenrun', function (b) { DB().openRun = b.getAttribute('data-id'); VA.go('run'); });
  VA.action('catgen', function (b) {
    var p = DB().catalogue.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0]; if (!p) return;
    var colour = (p.variants[0] && p.variants[0].colour) || '';
    var pack = VA.CE.generate({ desc: p.name + ' ' + colour, colour: colour, occ: 'festive' });
    var run = { id: VA.uid('r'), at: VA.todayISO(), sku: pack.sku, cat: pack.cat, colour: pack.colour, fabric: pack.fabric, work: pack.work, occ: pack.occ, label: pack.label, price: pack.price, title: pack.title, qa: pack.qa.pct, unique: VA.CE.uniqueness(pack, DB().runs), pack: pack, fromCat: p.id };
    DB().runs.push(run); p.runId = run.id; DB().openRun = run.id; VA.save(); VA.toast('Content generated for ' + p.name); VA.go('run');
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
    /* build a small demo catalogue from generated gradient swatches so grouping is visible offline */
    var d = DB(); d.catalogue = d.catalogue || [];
    var demo = [['Anarkali Gown', ['Mehendi Green', 'Ruby Wine']], ['Organza Saree', ['Sage Mist']]];
    demo.forEach(function (row) {
      var variants = row[1].map(function (col) {
        return { colour: col, shots: ['front', 'back', 'closeup', 'side'].map(function (po) { return { id: VA.uid('sh'), key: null, name: col + '-' + po, thumb: swatch(col, po), pose: po }; }) };
      });
      d.catalogue.push({ id: VA.uid('cp'), name: row[0], variants: variants, details: {}, runId: null });
    });
    VA.save(); VA.toast('Demo catalogue loaded'); VA.render();
  });
  function swatch(colour, pose) {
    var c = document.createElement('canvas'); c.width = 120; c.height = 150; var ctx = c.getContext('2d');
    var map = { 'Mehendi Green': '#4E7A2A', 'Ruby Wine': '#7A1F3D', 'Sage Mist': '#9CAF88' };
    var base = map[colour] || '#5B2D8E';
    var g = ctx.createLinearGradient(0, 0, 120, 150); g.addColorStop(0, base); g.addColorStop(1, '#1A0B38'); ctx.fillStyle = g; ctx.fillRect(0, 0, 120, 150);
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '700 13px Georgia'; ctx.textAlign = 'center'; ctx.fillText(pose, 60, 80);
    return c.toDataURL('image/jpeg', 0.7);
  }

  VA.CAT = { detectPose: detectPose, detectColour: detectColour, detectProduct: detectProduct, POSES: POSES };
})();
