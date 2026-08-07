/* ═══════════ Vastrangam AI Engine — the AI Studio ═══════════

   "merge content engine page with image studio and Video Studio together with help of
    button. if i click on top on AI Content then i can see all content and i can download
    complete 13 step content from step one to step 13 in doc file and excel sheet product
    listing for all platform."

   So: ONE screen, one product, three tabs.

       AI Content  ·  Images  ·  Video

   The product picker sits above the tabs, so whichever tab you are on you are always
   working on the same garment. AI Content lists all thirteen steps in order with the two
   downloads at the top; Images is the embedded Image Studio with that product's photos in
   its queue; Video is the reel cut from the same photos.

   Content Engine, Image Studio and Video Studio remain as their own screens — this is the
   place you go when you want all three on one product, which is the normal case. */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  var TABS = [
    { id: 'content', label: 'AI Content', icon: 'pen' },
    { id: 'images', label: 'Images', icon: 'image' },
    { id: 'video', label: 'Video', icon: 'film' }
  ];

  /* the thirteen steps, in the order the spec lays them out, each pointing at the part of
     the pack that holds it — so the screen is generated from the pack, never hardcoded */
  var STEPS = [
    { n: 0, id: 'psych', label: 'Buyer Psychology', get: function (p) { return p.deep && p.deep.psych; },
      fallback: 'Run at Standard or Deep and this fills with what real buyers say.' },
    { n: 1, id: 'market', label: 'Market Intelligence', get: function (p) { return p.deep && p.deep.market; },
      fallback: 'Run at Quick or deeper for a live competitor teardown with real prices.' },
    { n: 2, id: 'hooks', label: 'Viral Hooks', get: function (p) { return p.deep && p.deep.hooks; } },
    { n: 3, id: 'dna', label: 'Content DNA', get: function (p) { return p.deep && p.deep.dna; } },
    { n: 4, id: 'listing', label: 'Product Content', get: function (p) { return p.bodyHTML; }, html: true },
    { n: '4C', id: 'social', label: 'Social Kit', get: function (p) { return p.social; } },
    { n: '4D', id: 'thumbs', label: 'Thumbnails', get: function (p) { return p.thumbs; } },
    { n: 5, id: 'ads', label: 'Ad Variations', get: function (p) { return p.ads; } },
    { n: 6, id: 'video', label: 'Cinematic Video', get: function (p) { return (p.deep && p.deep.video) || p.social.reel; } },
    { n: 7, id: 'suno', label: 'Suno Lyrics', get: function (p) { return p.suno; } },
    { n: 8, id: 'market8', label: 'Marketplaces', get: function (p) { return p.marketplace; } },
    { n: 9, id: 'scale', label: 'Scale Engine', get: function (p) { return p.deep && p.deep.scale; } },
    { n: 10, id: 'calendar', label: '30-Day Calendar', get: function (p) { return p.deep && p.deep.calendar; } },
    { n: 12, id: 'size', label: 'Size Chart', get: function (p) { return (p.deep && p.deep.size) || p.dims; } },
    { n: 13, id: 'alt', label: 'SKU & Alt Text', get: function (p) { return p.imageSEO; } }
  ];

  function st() {
    var d = DB();
    if (!d.studio) d.studio = { tab: 'content', product: null, openStep: null };
    var cats = d.catalogue || [];
    /* always land on a real product — the first one, until you pick another */
    if (!d.studio.product || !cats.filter(function (c) { return c.id === d.studio.product; }).length) {
      d.studio.product = cats.length ? cats[0].id : null;
    }
    return d.studio;
  }
  function product() {
    var s = st();
    return (DB().catalogue || []).filter(function (c) { return c.id === s.product; })[0] || null;
  }
  /* the run belonging to this product, if one has been generated */
  function runFor(p) {
    if (!p) return null;
    var runs = DB().runs || [];
    var byId = runs.filter(function (r) { return r.fromCat === p.id || r.catId === p.id; });
    if (byId.length) return byId[byId.length - 1];
    return p.runId ? runs.filter(function (r) { return r.id === p.runId; })[0] || null : null;
  }

  VA.view('studio', function () {
    var s = st(), p = product(), run = runFor(p), cats = DB().catalogue || [];

    var head = H.head('AI Studio', 'AI Studio',
      'One product, three studios. Content, images and video all read the same garment — pick it once here.');

    if (!cats.length) {
      return head + H.panel('', '<div class="empty"><b>Nothing to work on yet</b>' +
        '<span>Drop your photos on the Catalogue and they will appear here.</span>' +
        '<button class="btn p" data-go="cat">Go to the Catalogue</button></div>');
    }

    var picker = '<div class="stu-pick">' +
      '<span class="cmp-picklabel">Product</span>' +
      '<div class="segbar">' + cats.map(function (c) {
        return '<button class="seg' + (c.id === s.product ? ' on' : '') + '" data-act="stupick" data-v="' + c.id + '">' +
          esc(c.name) + '<span class="segsub">' + c.variants.length + ' colour</span></button>';
      }).join('') + '</div></div>';

    var tabs = '<div class="chiprow stu-tabs">' + TABS.map(function (t) {
      return '<button class="chip' + (s.tab === t.id ? ' on' : '') + '" data-act="stutab" data-v="' + t.id + '">' +
        VA.icon(t.icon) + ' ' + t.label + '</button>';
    }).join('') + '</div>';

    var body = s.tab === 'images' ? imagesTab(p)
      : s.tab === 'video' ? videoTab(p)
      : contentTab(p, run);

    return head + picker + tabs + '<div id="stubody">' + body + '</div>';
  });

  /* Every tab renders HERE. The first version called VA.go('img') and VA.go('vid') instead,
     which meant that once you had clicked Images the choice was saved and every later visit
     to AI Studio bounced straight back out to the Image Studio — permanently. That was a
     shortcut, and a shortcut is exactly what a merged screen must not be. */
  VA.view('studio').after = function () {
    var s = st();
    if (s.tab === 'images') { if (VA.STUDIO && VA.STUDIO.mount) VA.STUDIO.mount(); return; }
    if (s.tab === 'video') { if (VA.VIDEO && VA.VIDEO.mount) VA.VIDEO.mount(); return; }
    VA.CAT.hydrateThumbs();
  };

  /* the embedded editor is hosted outside #main and positioned over this slot, so it keeps
     its queue and undo history while you move between tabs */
  function imagesTab(p) {
    var n = p ? p.variants.reduce(function (a, v) { return a + v.shots.filter(function (x) { return x.key; }).length; }, 0) : 0;
    return '<div class="btnrow" style="margin-bottom:10px">' +
      '<button class="btn sm p" data-act="stusend">Load ' + n + ' photo(s) of ' + esc(p ? p.name : '') + ' into the queue</button>' +
      '<button class="btn sm" data-act="stucollect">Bring edited images back</button>' +
      '<button class="btn sm" data-act="stufull">Full screen</button></div>' +
      '<div class="btnrow" style="margin-bottom:10px">' +
      '<span class="hint" style="align-self:center">Download the whole queue as:</span>' +
      '<button class="btn sm gold" data-act="studl" data-f="jpeg">↓ JPG</button>' +
      '<button class="btn sm gold" data-act="studl" data-f="webp">↓ WebP</button>' +
      '<button class="btn sm gold" data-act="studl" data-f="png">↓ PNG (transparent)</button></div>' +
      '<div id="stuslot" style="height:76vh;min-height:560px"></div>';
  }
  /* the timeline is the Video Studio's own view, rendered inside this screen */
  function videoTab() {
    try { return VA.view('vid')().replace(/^<div class="h">[\s\S]*?<\/div>/, ''); }
    catch (e) { return H.panel('', '<div class="empty">The video timeline could not start.</div>'); }
  }

  /* ── AI Content: every step, in order, with the two downloads on top ── */
  function contentTab(p, run) {
    if (!run || !run.pack) {
      return H.panel('No content yet for ' + esc(p ? p.name : 'this product'),
        '<div class="empty"><b>Nothing generated for this product</b>' +
        '<span>Choose an effort and run it. The offline pack is written instantly; effort decides how much live research goes on top.</span>' +
        '<div class="btnrow">' + Object.keys(VDEEP.DEPTHS).map(function (k) {
          return '<button class="btn' + (DB().depth === k ? ' p' : '') + '" data-act="stugen" data-d="' + k + '">' +
            VDEEP.DEPTHS[k].label + ' · ' + VDEEP.DEPTHS[k].calls + '</button>';
        }).join('') + '</div></div>');
    }
    var pack = run.pack;
    var written = (pack.phaseLog || []).filter(function (r) { return r.state === 'done'; }).length;

    var bar = '<div class="stu-bar">' +
      '<button class="btn p" data-act="dlreport" data-id="' + run.id + '">' + VA.icon('doc') + ' Download all 13 steps (.doc)</button>' +
      '<button class="btn gold" data-act="dlplatxlsx" data-id="' + run.id + '">' + VA.icon('grid') + ' Platform listing (.xlsx)</button>' +
      '<button class="btn" data-act="dlxlsx" data-id="' + run.id + '">9-sheet .xlsx</button>' +
      '<button class="btn" data-act="runmd" data-id="' + run.id + '">.md</button>' +
      '<span style="margin-left:auto"></span>' +
      H.tag('QA ' + pack.qa.pct + '%', pack.qa.pct >= 90 ? 'grn' : 'amb') +
      (written ? ' ' + H.tag(written + '/' + (pack.phaseLog || []).length + ' phases', 'blu') : '') +
      '</div>' +
      '<div class="btnrow" style="margin:0 0 16px"><span class="hint" style="align-self:center">Re-run at:</span>' +
      Object.keys(VDEEP.DEPTHS).map(function (k) {
        return '<button class="btn sm' + (run.depth === k ? ' p' : '') + '" data-act="rundeepen" data-id="' + run.id + '" data-d="' + k + '">' +
          VDEEP.DEPTHS[k].label + ' · ' + VDEEP.DEPTHS[k].calls + '</button>';
      }).join('') +
      '<button class="btn sm" data-act="openrun" data-id="' + run.id + '">Open the full run →</button></div>';

    var steps = STEPS.map(function (step, i) {
      var v = null;
      try { v = step.get(pack); } catch (e) {}
      var has = v && (typeof v !== 'object' || (Array.isArray(v) ? v.length : Object.keys(v).length));
      var open = st().openStep === step.id;
      return '<div class="step' + (open ? ' open' : '') + (has ? '' : ' thin') + '">' +
        '<button class="step-h" data-act="stustep" data-v="' + step.id + '">' +
        '<span class="step-n">' + step.n + '</span>' +
        '<span class="step-l">' + esc(step.label) + '</span>' +
        (has ? '' : '<span class="hint">not written yet</span>') +
        '<span class="step-x">' + (open ? '−' : '+') + '</span></button>' +
        (open ? '<div class="step-b">' + render(step, v, pack) + '</div>' : '') +
        '</div>';
    }).join('');

    return bar + '<div class="steps">' + steps + '</div>';
  }

  /* render whatever shape a step holds, and make every text field editable in place */
  function render(step, v, pack) {
    if (!v) return '<p class="hint">' + esc(step.fallback || 'Not written yet — run at a deeper effort.') + '</p>';
    if (step.html) return '<div class="ed" data-edit="bodyHTML" data-sku="' + esc(pack.sku) + '">' + v + '</div>';
    if (typeof v === 'string') return '<pre class="out ed" data-edit="' + step.id + '" data-sku="' + esc(pack.sku) + '">' + esc(v) + '</pre>';
    if (Array.isArray(v)) {
      if (!v.length) return '<p class="hint">Empty.</p>';
      if (typeof v[0] === 'string') return '<ul class="steplist">' + v.map(function (x, i) {
        return '<li class="ed" data-edit="' + step.id + '.' + i + '" data-sku="' + esc(pack.sku) + '">' + esc(x) + '</li>';
      }).join('') + '</ul>';
      return H.table(Object.keys(v[0]).map(function (k) {
        return { label: k, fmt: function (r) { return esc(String(r[k] == null ? '' : r[k])); } };
      }), v);
    }
    return '<div>' + Object.keys(v).map(function (k) {
      var x = v[k];
      var txt = typeof x === 'string' ? x : Array.isArray(x) ? x.join('\n') : JSON.stringify(x, null, 1);
      return '<div class="kv" style="display:block"><b>' + esc(k) + '</b>' +
        '<div class="ed" style="margin-top:3px;white-space:pre-wrap" data-edit="' + step.id + '.' + esc(k) + '" data-sku="' + esc(pack.sku) + '">' + esc(txt) + '</div></div>';
    }).join('') + '</div>';
  }

  VA.action('stutab', function (b) { st().tab = b.getAttribute('data-v'); VA.save(); VA.render(); });
  VA.action('stupick', function (b) { st().product = b.getAttribute('data-v'); st().openStep = null; VA.save(); VA.render(); });
  VA.action('stustep', function (b) {
    var id = b.getAttribute('data-v'), s = st();
    s.openStep = s.openStep === id ? null : id;
    VA.save(); VA.render();
  });
  VA.action('stugen', function (b) {
    var p = product(); if (!p) return;
    DB().depth = b.getAttribute('data-d');
    DB().composer = DB().composer || {}; DB().composer.forProduct = p.id;
    VA.save();
    VA.COMPOSER.runProduct(p);
  });

  VA.STUDIO_VIEW = { STEPS: STEPS, TABS: TABS, product: product, runFor: runFor, state: st };
})();
