/* ═══════════ Vastrangam AI Engine — the composer ═══════════

   "how claude chat have options to upload images and wrong content and then you have
    option to pick model and efforts. so make it something very similiar."

   One box at the top of the Catalogue, and it is the way into the whole app. Drop photos
   on it, type what you know, choose which studio should run and how hard it should think,
   and press send. Everything else on that page is the result.

     Engine   Content Engine · Image Studio · Video Studio · All three
     Effort   Quick 2 calls · Standard 6 calls · Deep 16 calls

   The engine picker is where the "model" picker sits in a chat app, and it means the same
   thing: which brain handles this. The effort picker is the depth switch, so the choice is
   made once, here, and carries through to whatever runs. */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  var ENGINES = [
    { id: 'content', label: 'Content Engine', icon: 'pen', note: 'listings, social, ads, marketplaces' },
    { id: 'image', label: 'Image Studio', icon: 'image', note: 'clean up, resize, export' },
    { id: 'video', label: 'Video Studio', icon: 'film', note: 'cut a reel from the photos' },
    { id: 'all', label: 'All three', icon: 'spark', note: 'content, images and a reel' }
  ];

  function state() {
    var d = DB();
    if (!d.composer) d.composer = { engine: 'content', text: '', files: 0 };
    if (!d.depth) d.depth = 'standard';
    return d.composer;
  }

  /* ── the box ───────────────────────────────────────────────────────────────────── */
  function panel() {
    var c = state(), d = DB(), depth = d.depth;
    var pend = (d.catPending || []).length;
    var ready = (d.catalogue || []).length;
    var m = VAI.mode();

    return '<section class="composer" id="composer">' +
      '<div class="cmp-drop" id="cmpdrop" data-act="catpick">' +
      '<div class="cmp-dropicon">' + VA.icon('image') + '</div>' +
      '<div><b>Drop your photos here</b>' +
      '<p class="hint">Any filenames — straight off your phone or WhatsApp. ' +
      (m.id === 'ai' ? 'Each one is read: garment, colour, fabric, craft and camera angle.'
                     : 'Connect a model on Connectors and each one reads itself.') + '</p></div>' +
      (pend ? '<span class="cmp-count">' + pend + ' waiting</span>'
            : ready ? '<span class="cmp-count">' + ready + ' product' + (ready === 1 ? '' : 's') + ' ready</span>' : '') +
      '</div>' +

      '<textarea id="cmptext" class="cmp-text" rows="3" placeholder="Anything you want the engine to know — fabric, work, sizes, price story.&#10;e.g. rayon with foil print, 3/4 sleeve, sizes M to XXL only, we sell this at ₹899 wholesale">' + esc(c.text || '') + '</textarea>' +

      '<div class="cmp-bar">' +
      '<div class="cmp-picks">' +
      pick('Engine', ENGINES.map(function (e) {
        return { id: e.id, label: e.label, on: c.engine === e.id, act: 'cmpengine', note: e.note };
      })) +
      pick('Effort', Object.keys(VDEEP.DEPTHS).map(function (k) {
        return { id: k, label: VDEEP.DEPTHS[k].label, sub: VDEEP.DEPTHS[k].calls,
                 on: depth === k, act: 'cmpdepth', note: VDEEP.DEPTHS[k].note };
      })) +
      '</div>' +
      '<button class="btn p cmp-send" data-act="cmpsend">' + VA.icon('spark') + ' ' + esc(sendLabel(c.engine)) + '</button>' +
      '</div>' +
      '<p class="cmp-foot"><b>' + esc(VDEEP.DEPTHS[depth].label) + '</b> — ' + esc(VDEEP.DEPTHS[depth].note) +
      ' <span title="4 titles, Shopify HTML, tags, meta, FAQ, social, Suno lyrics, ads, all five marketplaces and the sheets">The full pack is written either way; effort decides how much live research goes on top.</span></p>' +
      '</section>';
  }

  function sendLabel(engine) {
    return engine === 'image' ? 'Open the photos in the studio'
      : engine === 'video' ? 'Cut the reel'
      : engine === 'all' ? 'Run all three'
      : 'Generate the full pack';
  }

  function pick(label, opts) {
    return '<div class="cmp-pick"><span class="cmp-picklabel">' + esc(label) + '</span>' +
      '<div class="segbar">' + opts.map(function (o) {
        return '<button class="seg' + (o.on ? ' on' : '') + '" data-act="' + o.act + '" data-v="' + o.id + '" title="' + esc(o.note || '') + '">' +
          esc(o.label) + (o.sub ? '<span class="segsub">' + esc(o.sub) + '</span>' : '') + '</button>';
      }).join('') + '</div></div>';
  }

  /* keep what was typed across the re-render that every choice triggers */
  function grab() {
    var t = VA.$('cmptext');
    if (t) { state().text = t.value; }
  }

  VA.action('cmpengine', function (b) { grab(); state().engine = b.getAttribute('data-v'); VA.save(); VA.render(); });
  VA.action('cmpdepth', function (b) { grab(); DB().depth = b.getAttribute('data-v'); VA.save(); VA.render(); });

  VA.action('cmpsend', function () {
    grab();
    var c = state(), d = DB(), text = (c.text || '').trim();

    /* the brief travels with whatever runs — it is the same field the Content Engine reads */
    if (text) {
      d.brief = d.brief || { msgs: [], facts: {} };
      VBRIEF.extract(text, d.brief.facts);
      d.brief.facts.notes = text;
    }
    if ((d.catPending || []).length) { VA.toast('Confirm the photos below first — then send'); return; }

    var cats = d.catalogue || [];
    if (!cats.length) {
      /* no catalogue yet: the typed brief is enough for the Content Engine on its own */
      if (c.engine === 'content' || c.engine === 'all') {
        if (!text) { VA.toast('Drop some photos, or describe the product first'); return; }
        VA.CE.run(VBRIEF.toInput());
        return;
      }
      VA.toast('Drop some photos first'); return;
    }

    if (c.engine === 'image') { VA.go('img'); VA.toast('Loading the catalogue into the studio queue…');
      setTimeout(function () { VA.run('stusend'); }, 900); return; }
    if (c.engine === 'video') { VA.go('vid'); VA.toast('Cutting a reel from your photos…');
      setTimeout(function () { VA.run('vidreel'); }, 500); return; }

    /* content, or all three — the run starts, and for "all" the images and the reel follow
       once it finishes, so the three do not fight over the same model quota at once */
    var p = cats[0];
    var job = runProduct(p, text);
    if (c.engine === 'all' && job && job.then) {
      job.then(function () {
        VA.toast('Content done — loading the photos into the studio');
        VA.go('img');
        setTimeout(function () { VA.run('stusend'); }, 900);
      });
    }
  });

  function runProduct(p, notes) {
    var v = p.variants[0] || {}, det = p.details || {};
    return VA.CE.run({
      desc: [v.colour, det.fabric, det.work, det.garment || p.name].filter(Boolean).join(' '),
      colour: v.colour || '', fabric: det.fabric || '', work: det.work || '',
      cat: det.category || '', occ: 'festive', catId: p.id,
      skuBase: p.baseKey || '', variants: p.variants,
      shots: (p.variants[0] || {}).shots || null,
      productName: p.name, notes: notes || ''
    });
  }

  VA.COMPOSER = { panel: panel, ENGINES: ENGINES, state: state, sendLabel: sendLabel };
})();
