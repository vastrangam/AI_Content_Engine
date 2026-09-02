/* ═══════════ Vastrangam AI Engine — the Library screen ═══════════
   One place for every asset, in free-first order:
     Built-in (offline, unlimited) → My assets → Photos (Openverse free, Pexels/Unsplash keyed) → AI generated
   Anything can be sent straight into the Image Studio as a layer, or into a design as its backdrop. */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  function st() {
    var d = DB();
    d.lib = d.lib || { tab: 'builtin', cat: 'All', q: '', photos: [], photoProv: 'openverse', note: '', busy: false };
    return d.lib;
  }

  VA.view('lib', function () {
    var s = st(), mine = DB().myAssets || [];
    var tabs = [['builtin', 'Built-in', VSTOCK.ASSETS.length + ' assets · offline'],
      ['mine', 'My assets', mine.length + ' saved'],
      ['photos', 'Stock photos', 'Openverse free · Pexels · Unsplash'],
      ['ai', 'AI generated', 'Gemini · Pollinations']];
    return H.head('Library', 'Asset library', 'Motifs, borders, badges and textures drawn by the app — plus real stock photos and AI-generated backdrops. Free options first, and the built-in set never needs the internet.') +
      '<div class="btnrow" style="margin-bottom:12px">' + tabs.map(function (t) {
        return '<button class="btn sm' + (s.tab === t[0] ? ' p' : '') + '" data-act="libtab" data-t="' + t[0] + '" title="' + esc(t[2]) + '">' + esc(t[1]) + '</button>';
      }).join('') + '</div>' +
      (s.tab === 'builtin' ? builtinPane(s)
        : s.tab === 'mine' ? minePane(mine)
        : s.tab === 'photos' ? photoPane(s) : aiPane(s));
  });

  /* ── tier 1: built-in ── */
  function builtinPane(s) {
    var items = VSTOCK.list(s.cat, s.q);
    return H.panel('Drawn by the app <span class="badge">offline · any size</span>',
      '<div class="btnrow" style="margin-bottom:10px">' +
      ['All'].concat(VSTOCK.CATS).map(function (c) {
        return '<button class="btn sm' + (s.cat === c ? ' p' : '') + '" data-act="libcat" data-c="' + c + '">' + esc(c) + '</button>';
      }).join('') +
      '<input id="libq" value="' + esc(s.q) + '" placeholder="search assets…" oninput="VA.LIBq(this.value)" style="padding:6px 10px;border:1px solid var(--line2);border-radius:7px;min-width:150px">' +
      '</div>' +
      '<p class="hint" style="margin-bottom:10px">Every one is drawn fresh in your theme colours, so it stays sharp at any export size and recolours when you switch theme.</p>' +
      '<div class="tplgrid" style="grid-template-columns:repeat(auto-fill,minmax(122px,1fr))">' +
      items.map(function (a) {
        return '<div class="tpltile"><canvas class="libc" data-aid="' + a.id + '" width="240" height="240" style="width:100%;display:block;border-radius:8px;background:var(--surf2)"></canvas>' +
          '<div class="cap">' + esc(a.name) + '<span>' + esc(a.cat) + '</span></div>' +
          '<div class="btnrow" style="padding:0 8px 8px"><button class="btn sm" data-act="libimg" data-id="' + a.id + '">→ Image</button>' +
          '<button class="btn sm" data-act="libdes" data-id="' + a.id + '">→ Design</button></div></div>';
      }).join('') + '</div>' +
      (items.length ? '' : '<div class="empty">Nothing matches that search.</div>'));
  }
  VA.view('lib').after = function () {
    [].slice.call(document.querySelectorAll('.libc')).forEach(function (cv) {
      var id = cv.getAttribute('data-aid');
      try {
        var out = VSTOCK.render(id, cv.width, cv.height);
        if (out) cv.getContext('2d').drawImage(out, 0, 0);
      } catch (e) {}
    });
    [].slice.call(document.querySelectorAll('img[data-libthumb]')).forEach(function (im) {
      if (im.getAttribute('data-done')) return; im.setAttribute('data-done', '1');
      VStore.getDataURL(im.getAttribute('data-libthumb'), function (u) { if (u) im.src = u; });
    });
  };

  /* ── tier 2: my assets ── */
  function minePane(mine) {
    return H.panel('My assets <span class="badge">' + mine.length + '</span>',
      '<p class="hint" style="margin-bottom:10px">Anything you upload here, or send over from the Library, is kept for reuse. Stored in your browser, never uploaded.</p>' +
      '<div class="btnrow" style="margin-bottom:10px"><button class="btn sm p" data-act="libupload">Upload assets</button>' +
      '<input type="file" id="libfile" accept="image/*" multiple style="display:none"></div>' +
      (mine.length ? '<div class="tplgrid" style="grid-template-columns:repeat(auto-fill,minmax(122px,1fr))">' +
        mine.map(function (a) {
          return '<div class="tpltile"><img data-libthumb="' + esc(a.key) + '" src="" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;background:var(--surf2)">' +
            '<div class="cap">' + esc(a.name || 'asset') + '<span>' + esc(a.from || 'upload') + '</span></div>' +
            '<div class="btnrow" style="padding:0 8px 8px"><button class="btn sm" data-act="libmimg" data-k="' + esc(a.key) + '">→ Image</button>' +
            '<button class="btn sm" data-act="libmdes" data-k="' + esc(a.key) + '">→ Design</button>' +
            '<button class="btn sm d" data-act="libmdel" data-k="' + esc(a.key) + '">✕</button></div></div>';
        }).join('') + '</div>'
        : '<div class="empty">Nothing saved yet.</div>'));
  }

  /* ── tier 3: stock photos ── */
  function photoPane(s) {
    return H.panel('Stock photos <span class="badge">free first</span>',
      '<div class="btnrow" style="margin-bottom:9px">' +
      VSTOCK.PHOTO_PROVIDERS.map(function (p) {
        var have = !p.key || VAI.getKey(p.id);
        return '<button class="btn sm' + (s.photoProv === p.id ? ' p' : '') + '" data-act="libprov" data-p="' + p.id + '" title="' + esc(p.note) + '">' +
          esc(p.name) + (p.key ? (have ? ' ✓' : ' · key needed') : ' · no key') + '</button>';
      }).join('') + '</div>' +
      '<div class="btnrow" style="margin-bottom:10px">' +
      '<input id="libpq" value="' + esc(s.q) + '" placeholder="e.g. indian textile, marigold, silk fabric" onkeydown="if(event.key===\'Enter\')VA.LIBsearch()" style="flex:1;min-width:200px;padding:7px 10px;border:1px solid var(--line2);border-radius:7px">' +
      '<button class="btn sm p" data-act="libsearch">Search</button></div>' +
      (s.note ? '<div class="hint" style="margin-bottom:9px;color:var(--gold)">' + esc(s.note) + '</div>' : '') +
      (s.busy ? '<p class="hint">Searching…</p>' : '') +
      (s.photos && s.photos.length
        ? '<div class="tplgrid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">' +
          s.photos.map(function (ph, i) {
            return '<div class="tpltile"><img src="' + esc(ph.thumb) + '" referrerpolicy="no-referrer" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;background:var(--surf2)">' +
              '<div class="cap">' + esc((ph.by || 'unknown').slice(0, 22)) + '<span>' + esc(ph.lic || '') + '</span></div>' +
              '<div class="btnrow" style="padding:0 8px 8px"><button class="btn sm" data-act="libphoto" data-i="' + i + '">Use</button></div></div>';
          }).join('') + '</div>'
        : (s.busy ? '' : '<div class="empty">Search for a photo to begin.</div>')) +
      '<p class="hint" style="margin-top:10px">Openverse needs no key. For Pexels or Unsplash paste a free key on <b>Connectors</b>. Attribution is saved with the asset where the licence asks for it.</p>');
  }

  /* ── tier 4: AI generated ── */
  function aiPane(s) {
    return H.panel('Generate an asset <span class="badge">Gemini → Pollinations</span>',
      '<p class="hint" style="margin-bottom:10px">Describe a backdrop, prop or texture. Gemini is used when your key is connected; otherwise Pollinations, which needs no key at all.</p>' +
      '<div class="btnrow" style="margin-bottom:10px">' +
      '<input id="libaiq" value="' + esc(s.q) + '" placeholder="e.g. soft ivory silk backdrop, studio light, no text" onkeydown="if(event.key===\'Enter\')VA.LIBgen()" style="flex:1;min-width:220px;padding:7px 10px;border:1px solid var(--line2);border-radius:7px">' +
      '<button class="btn sm p" data-act="libgen">Generate</button></div>' +
      '<div class="btnrow" style="margin-bottom:10px">' +
      ['ivory silk studio backdrop, soft light, no text', 'marigold garland border on cream, flat lay',
       'dark green velvet texture, subtle sheen', 'gold bokeh on deep maroon, festive'].map(function (p) {
        return '<button class="btn sm" data-act="libpreset" data-p="' + esc(p) + '">' + esc(p.split(',')[0]) + '</button>';
      }).join('') + '</div>' +
      (s.busy ? '<p class="hint">Generating…</p>' : '') +
      (s.note ? '<div class="hint" style="color:var(--gold)">' + esc(s.note) + '</div>' : '') +
      (s.aiUrl ? '<img src="' + esc(s.aiUrl) + '" style="max-width:320px;width:100%;border-radius:10px;border:1px solid var(--line);display:block;margin-top:8px">' +
        '<div class="btnrow" style="margin-top:8px"><button class="btn sm" data-act="libaiuse">Save to My assets</button>' +
        '<button class="btn sm" data-act="libaides">Use as design backdrop</button></div>' : ''));
  }

  /* ── actions ── */
  VA.action('libtab', function (b) { st().tab = b.getAttribute('data-t'); VA.save(); VA.render(); });
  VA.action('libcat', function (b) { st().cat = b.getAttribute('data-c'); VA.save(); VA.render(); });
  VA.LIBq = function (v) { st().q = v; VA.save(); VA.render(); var i = VA.$('libq'); if (i) { i.focus(); i.setSelectionRange(v.length, v.length); } };
  VA.action('libprov', function (b) { st().photoProv = b.getAttribute('data-p'); VA.save(); VA.render(); });

  /* built-in → studios */
  /* assets go into the embedded Image Studio Pro queue, the same way catalogue photos do */
  function sendToImage(dataURL, name) {
    VA.go('img');
    setTimeout(function () {
      var msg = { type: 'va-add-images', images: [{ url: dataURL, name: (name || 'asset') + '.png' }] };
      if (VA.STUDIO && VA.STUDIO.isReady()) VA.STUDIO.send(msg);
      else {
        /* the frame is still booting — wait for its ready ping */
        var tries = 0, t = setInterval(function () {
          if (VA.STUDIO && VA.STUDIO.isReady()) { VA.STUDIO.send(msg); clearInterval(t); }
          else if (++tries > 40) clearInterval(t);
        }, 250);
      }
      VA.toast('Sent to the Image Studio queue');
    }, 300);
  }
  VA.action('libimg', function (b) {
    var id = b.getAttribute('data-id');
    sendToImage(VSTOCK.dataURL(id, 900, 900), (VSTOCK.byId(id) || {}).name);
  });
  VA.action('libdes', function (b) {
    var id = b.getAttribute('data-id');
    DB().canvasBG = VSTOCK.dataURL(id, 1400, 1400); VA.save();
    VA.toast('Set as the design backdrop'); VA.go('canvas');
  });

  /* my assets */
  VA.action('libupload', function () { VA.$('libfile').click(); });
  VA.view('lib').after2 = null;
  VA.action('libmimg', function (b) {
    VStore.getDataURL(b.getAttribute('data-k'), function (u) { if (u) sendToImage(u, 'asset'); });
  });
  VA.action('libmdes', function (b) {
    VStore.getDataURL(b.getAttribute('data-k'), function (u) { if (u) { DB().canvasBG = u; VA.save(); VA.toast('Set as the design backdrop'); VA.go('canvas'); } });
  });
  VA.action('libmdel', function (b) {
    var k = b.getAttribute('data-k');
    DB().myAssets = (DB().myAssets || []).filter(function (a) { return a.key !== k; });
    VStore.del(k); VA.save(); VA.render();
  });
  function saveAsset(dataURL, name, from, cb) {
    var key = 'ast_' + VA.uid('');
    VStore.putDataURL(key, dataURL, function () {
      DB().myAssets = DB().myAssets || [];
      DB().myAssets.unshift({ key: key, name: name, from: from, at: VA.todayISO() });
      VA.save(); if (cb) cb(key);
    });
  }
  VA.SAVEASSET = saveAsset;

  /* photos */
  VA.LIBsearch = function () { VA.action && document.querySelector('[data-act="libsearch"]').click(); };
  VA.action('libsearch', function () {
    var s = st(), q = (VA.$('libpq') || {}).value || s.q;
    if (!q) { VA.toast('Type what you are looking for'); return; }
    s.q = q; s.busy = true; s.note = ''; VA.save(); VA.render();
    VSTOCK.searchPhotos(q, s.photoProv, function (res, err) {
      s.busy = false;
      if (err) { s.note = err; s.photos = []; }
      else { s.photos = res || []; s.note = res && res.length ? '' : 'No results.'; }
      VA.save(); VA.render();
    });
  });
  VA.action('libphoto', function (b) {
    var s = st(), ph = s.photos[+b.getAttribute('data-i')];
    if (!ph) return;
    VA.toast('Fetching the full image…');
    fetch(ph.full).then(function (r) { return r.blob(); }).then(function (bl) {
      var fr = new FileReader();
      fr.onload = function () {
        saveAsset(fr.result, (ph.by || 'photo'), s.photoProv + (ph.by ? ' · ' + ph.by : ''), function () {
          VA.toast('Saved to My assets'); st().tab = 'mine'; VA.save(); VA.render();
        });
      };
      fr.readAsDataURL(bl);
    }).catch(function (e) { VA.toast('Could not fetch that image: ' + String(e.message || e).slice(0, 60)); });
  });

  /* AI */
  VA.LIBgen = function () { document.querySelector('[data-act="libgen"]').click(); };
  VA.action('libpreset', function (b) { st().q = b.getAttribute('data-p'); VA.save(); VA.render(); });
  VA.action('libgen', function () {
    var s = st(), q = (VA.$('libaiq') || {}).value || s.q;
    if (!q) { VA.toast('Describe what you want'); return; }
    s.q = q; s.busy = true; s.note = ''; VA.save(); VA.render();
    VAI.makeImage(q + ', no text, no logos, no watermark', { w: 1024, h: 1024 }).then(function (r) {
      s.busy = false; s.aiUrl = r.url; s.note = 'Generated by ' + r.provider; VA.save(); VA.render();
    }).catch(function (e) {
      s.busy = false; s.note = 'Could not generate: ' + String(e.message || e).slice(0, 120); VA.save(); VA.render();
    });
  });
  VA.action('libaiuse', function () {
    var s = st(); if (!s.aiUrl) return;
    fetch(s.aiUrl).then(function (r) { return r.blob(); }).then(function (bl) {
      var fr = new FileReader();
      fr.onload = function () { saveAsset(fr.result, 'AI backdrop', 'ai', function () { VA.toast('Saved to My assets'); st().tab = 'mine'; VA.save(); VA.render(); }); };
      fr.readAsDataURL(bl);
    }).catch(function () { VA.toast('Could not save that image'); });
  });
  VA.action('libaides', function () {
    var s = st(); if (!s.aiUrl) return;
    DB().canvasBG = s.aiUrl; VA.save(); VA.toast('Set as the design backdrop'); VA.go('canvas');
  });

  /* file input wiring, after every render of this screen */
  var _after = VA.view('lib').after;
  VA.view('lib').after = function () {
    if (_after) _after();
    var f = VA.$('libfile');
    if (f) f.onchange = function () {
      var files = [].slice.call(f.files).filter(function (x) { return /image\//.test(x.type); });
      if (!files.length) return;
      var left = files.length;
      files.forEach(function (file) {
        var fr = new FileReader();
        fr.onload = function () { saveAsset(fr.result, file.name.replace(/\.[a-z0-9]+$/i, ''), 'upload', function () { if (!--left) { VA.toast(files.length + ' saved'); VA.render(); } }); };
        fr.readAsDataURL(file);
      });
    };
  };
})();
