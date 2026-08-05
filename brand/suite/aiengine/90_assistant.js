/* ═══════════ Vastrangam AI Engine — Assistant (offline, reads live records, on every screen) ═══════════
   A rules-based expert that always works with no internet and no key. It knows every screen,
   every vocabulary term, and reads your live DB to answer with real figures and the screen it
   read from. If you connect a model on the Connectors screen, free-form chat upgrades — but the
   engine below never needs one. */
(function () {
  'use strict';
  var esc = VA.esc, DB = function () { return VA.DB; };

  var SCREENS = {
    ce: 'Content Engine — type a product and press Generate. It runs all 13 phases offline and produces titles, Shopify HTML, tags, meta, FAQ, social, Suno lyrics, ads, all five marketplaces, email, webhook and a 9-sheet Excel.',
    img: 'Image Studio — a real layer editor. Drop a photo, add text and shapes, adjust brightness/contrast/saturation/hue live, resize to any of 7 marketplace sizes, and export PNG/JPG/WebP at the exact pixels.',
    vid: 'Video Studio — a timeline with keyframed clips and a live preview. Exports WebM, an animated GIF and a PNG frame sequence, all offline. MP4 needs a server (see Connectors).',
    des: 'Design Studio — pick a template, edit it on a canvas, apply the brand kit, Magic-resize between sizes, export PNG.',
    pub: 'Publisher — push a run to channels. Preview the per-channel payload, schedule on the calendar, publish, and watch the log.',
    records: 'Records — add, edit or delete any table: products, assets, channels, calendar, publish log.',
    files: 'Files — upload .xlsx or .csv, or download everything back out. The spreadsheet engine is inside this file, so it works offline.'
  };

  function stat() {
    var d = DB();
    return {
      runs: d.runs.length, products: d.products.length, assets: d.assets.length,
      scheduled: d.calendar.filter(function (c) { return c.status === 'Scheduled'; }).length,
      published: d.publog.filter(function (p) { return p.result === 'Published'; }).length,
      channels: d.channels.filter(function (c) { return c.connected; }).length, channelsAll: d.channels.length,
      avgQA: d.runs.length ? Math.round(d.runs.reduce(function (s, r) { return s + (r.qa || 100); }, 0) / d.runs.length) : 100,
      lastRun: d.runs.slice(-1)[0]
    };
  }

  /* the brain */
  function respond(q) {
    var t = q.toLowerCase().trim(), d = DB(), s = stat();
    function A(text, src) { return { text: text, src: src }; }

    if (/^(hi|hello|hey|namaste|help|what can you|start)/.test(t))
      return A('I\'m the Vastrangam engine — I work offline and read your live records. Ask me things like <b>"how many content runs do I have?"</b>, <b>"how do I make a reel?"</b>, <b>"what is roman silk?"</b>, or <b>"what\'s my QA score?"</b>. I can also open any screen — try "open Content Engine". Say <b>"what can this tool do"</b> for the full tour.', 'Built-in · no internet needed');

    if (/what (can|does) (this|the) (tool|app|engine)|guide me|full tour|show me everything|what are the features|capabilities/.test(t))
      return A('Here is everything, top to bottom of the workflow:<br><br>' +
        '<b>1 · Catalogue</b> — drop 20–30 images at once; they group into Product → Colour → Pose.<br>' +
        '<b>2 · Content Engine</b> — the whole 13-phase pack: titles, Shopify HTML, tags, FAQ, social, Suno, all 5 marketplaces, a 9-sheet Excel AND a market-analysis .doc (trends · competitors · gap · what you do better).<br>' +
        '<b>3 · Image Studio</b> — Photoshop-style layers, filters, crop, background removal, and export every image as JPG + WebP + PNG(transparent) with matching title/description/alt metadata.<br>' +
        '<b>4 · Design Studio</b> — Canva-style templates, themes + an AI theme, and one-click banner, carousel and YouTube thumbnail.<br>' +
        '<b>5 · Video Studio</b> — a still animated into a 10s reel + the 3×10s script.<br>' +
        '<b>6 · Publisher</b> — schedule to channels, calendar, publish log.<br><br>' +
        'All offline. Connect Gemini or any model on <b>Connectors</b> to upgrade prose and generate images — never required. Ask "how do I…" about any of these.', 'The full tour');

    /* navigation */
    var navMap = { 'content engine': 'ce', 'image studio': 'img', 'video studio': 'vid', 'design studio': 'des', publisher: 'pub', records: 'records', files: 'files', home: 'home', connectors: 'conn' };
    for (var k in navMap) if ((t.indexOf('open ') === 0 || t.indexOf('go to') >= 0 || t.indexOf('take me') >= 0) && t.indexOf(k) >= 0) { setTimeout(function () { VA.go(navMap[k]); }, 300); return A('Opening ' + cap(k) + '…', 'Navigation'); }

    /* live counts */
    if (/how many.*run|number of run|runs do i|content run/.test(t)) return A('You have <b>' + s.runs + '</b> content run' + (s.runs === 1 ? '' : 's') + '. Average QA score across them is <b>' + s.avgQA + '%</b>.', 'Read from Content Engine → Every run');
    if (/how many.*product|number of product|products/.test(t)) return A('There are <b>' + s.products + '</b> products in your catalog. Top one: <b>' + esc(d.products[0].name) + '</b> at ' + VA.inr(d.products[0].price) + '.', 'Read from Records → Products');
    if (/schedul/.test(t)) return A('<b>' + s.scheduled + '</b> item' + (s.scheduled === 1 ? ' is' : 's are') + ' scheduled on the calendar. Open <b>Publisher → Calendar</b> to see them by date.', 'Read from Publisher → Calendar');
    if (/publish/.test(t) && !/how/.test(t)) return A('<b>' + s.published + '</b> item' + (s.published === 1 ? ' has' : 's have') + ' been published so far. The full log is on <b>Publisher → Publish log</b>.', 'Read from Publisher → Publish log');
    if (/channel/.test(t) && !/how do/.test(t)) return A('<b>' + s.channels + ' of ' + s.channelsAll + '</b> channels are connected: ' + d.channels.filter(function (c) { return c.connected; }).map(function (c) { return c.name; }).join(', ') + '. Connect more on <b>Publisher → Channels</b>.', 'Read from Publisher → Channels');
    if (/qa|quality|score/.test(t)) { var lr = s.lastRun; return A('Average QA is <b>' + s.avgQA + '%</b> across ' + s.runs + ' runs.' + (lr && lr.pack ? ' Your latest, <b>' + esc(lr.pack.sku) + '</b>, scored <b>' + lr.qa + '%</b> — ' + lr.pack.qa.pass + '/' + lr.pack.qa.total + ' checks pass.' : ''), 'Read from Content Engine → QA'); }

    /* how-to */
    if (/how.*(generate|create|write|content|listing|pack)/.test(t)) return A(SCREENS.ce + '<br><br>Open it and use "New content run", or pick a product from the catalog and hit Generate.', 'Content Engine');
    if (/how.*(resize|image|photo|crop|export.*image|marketplace size)/.test(t)) return A(SCREENS.img, 'Image Studio');
    if (/how.*(video|reel|short|animat)/.test(t)) return A(SCREENS.vid + '<br><br>Tip: in Video Studio, pick a content run under "Add clip" and hit <b>Build a reel from it</b> — it lays out the text automatically.', 'Video Studio');
    if (/how.*(poster|design|template|banner|thumbnail)/.test(t)) return A(SCREENS.des, 'Design Studio');
    if (/how.*(publish|schedule|channel|post it|go live)/.test(t)) return A(SCREENS.pub + '<br><br>Generate a run → open it → <b>Send to Publisher</b> → pick channels and a date → Schedule → Publish now.', 'Publisher');
    if (/how.*(excel|csv|export|download|9 sheet|xlsx)/.test(t)) return A('Open any content run → <b>9-sheet export</b> tab → Download the .xlsx. Or on <b>Files</b>, download every record as Excel. The spreadsheet engine is inside this file, so it works with the wifi off.', 'Files / run export');

    /* vocabulary lookups */
    for (var f in LIB.FABRICS) if (t.indexOf(f.toLowerCase()) >= 0) return A('<b>' + f + '</b> — ' + LIB.FABRICS[f].s + '. Typical weight ' + LIB.FABRICS[f].w + '.', 'Fabric library');
    for (var c in LIB.CRAFT) if (t.indexOf(c.toLowerCase()) >= 0) return A('<b>' + c + '</b> — ' + LIB.CRAFT[c] + '.', 'Craft & embroidery library');
    for (var o in LIB.OCC) if (t.indexOf(o.replace('-', ' ')) >= 0 || t.indexOf(o) >= 0) return A('<b>' + cap(o.replace('-', ' ')) + '</b> — ' + LIB.OCC[o].c + '. Lighting: ' + LIB.OCC[o].light + '.', 'Occasion intelligence');
    if (/colour|color name|premium name/.test(t)) return A('I never use basic colour names — I map them to premium ones. For example green → ' + LIB.COLOURS.green.slice(0, 4).join(', ') + '. Just describe the product and the Content Engine picks the right one.', 'Colour vocabulary');

    /* SKU / product lookup */
    var skuMatch = t.match(/v[a-z]{1,3}\d{3,4}/i);
    if (skuMatch) {
      var sku = skuMatch[0].toUpperCase();
      var pr = d.products.filter(function (x) { return x.sku.toUpperCase() === sku; })[0];
      var rn = d.runs.filter(function (x) { return x.sku && x.sku.toUpperCase() === sku; })[0];
      if (pr) return A('<b>' + esc(pr.name) + '</b> (' + sku + ') — ' + pr.fabric + ', ' + pr.work + ', for ' + pr.occ.replace('-', ' ') + '. Price ' + VA.inr(pr.price) + ' (MRP ' + VA.inr(pr.mrp) + '), ' + pr.stock + ' in stock, label ' + pr.label + '.', 'Read from Records → Products');
      if (rn) return A('<b>' + sku + '</b> has a content run — ' + esc(rn.title) + ', QA ' + rn.qa + '%. Open it from Content Engine.', 'Read from Content Engine');
      return A('I don\'t see <b>' + sku + '</b> in your records yet. Add it under Records → Products, or generate a run for it.', 'Records');
    }

    /* policy / security / lock-in */
    if (/password|login|bank|account/.test(t)) return A('The Vastrangam AI Engine <b>never asks for a marketplace, bank or account password</b>. Channels connect with a scoped, revocable API key only. If any screen ever asks for a password, it is not this app.', 'Security policy');
    if (/offline|internet|wifi|lock.?in|dependen|cdn/.test(t)) return A('Everything here runs offline — the generator, the canvas, the timeline, the spreadsheet engine and me. Nothing is fetched from a CDN. You are not locked to any one AI or automation tool: connect Claude, GPT, Gemini or a local model if you want, or use none.', 'No-lock-in policy');
    if (/who are you|which model|are you (chatgpt|claude|gpt)|real ai/.test(t)) return A('I\'m the <b>built-in engine</b> — a rules expert that reads your live records, works with no internet and no key, and knows every screen. If you connect a model on the <b>Connectors</b> screen, free-form questions can also go to it — but I always answer on my own first.', 'About the assistant');
    if (/flipkart|amazon|myntra|ajio|meesho|marketplace/.test(t)) return A('Every content run produces real per-marketplace copy: Amazon title + 5 bullets + backend keywords, Flipkart\'s category attribute set, and Myntra/Ajio/Meesho voices. Open a run → <b>Marketplaces</b> tab.', 'Content Engine → Marketplaces');
    if (/suno|song|music|lyric/.test(t)) return A('The Suno lyrics come out with <b>zero product words</b> — the colour and the drape are the reason she\'s remembered, none of it is sung. Open a run → <b>Video & Suno</b> tab.', 'Content Engine → Video & Suno');

    /* fallback with a live nudge */
    return A('I can answer about your ' + s.runs + ' runs, ' + s.products + ' products, the calendar and every screen — and I can define any fabric, colour, craft or occasion. Try <b>"how do I make a reel?"</b> or <b>"what is zardozi?"</b>, or tap a suggestion below.', 'Built-in · offline');
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function suggestions() {
    var v = VA.state.view;
    var byView = {
      ce: ['How do I generate a pack?', 'What\'s my QA score?', 'What is roman silk?'],
      img: ['How do I resize an image?', 'Export at Myntra size', 'How many layers can I add?'],
      vid: ['How do I make a reel?', 'Can I export a GIF offline?', 'Why no MP4?'],
      des: ['How does Magic resize work?', 'Apply my brand colours', 'What sizes are there?'],
      pub: ['How many are scheduled?', 'How do I publish?', 'Which channels are connected?'],
      home: ['How many runs do I have?', 'How do I make a reel?', 'What is zardozi?']
    };
    return byView[v] || ['How many runs do I have?', 'How do I generate content?', 'What is mehendi occasion?'];
  }

  /* ── render the dock ── */
  VA.renderAsk = function () {
    var d = DB(), msgs = d.aiChat || [];
    if (!msgs.length) msgs = [{ who: 'ai', text: respond('hi').text, src: respond('hi').src }];
    var body = msgs.map(function (m) {
      return '<div class="msg ' + (m.who === 'you' ? 'you' : 'ai') + '"><div class="av">' + (m.who === 'you' ? '🙂' : '✦') + '</div>' +
        '<div class="bub">' + m.text + (m.src ? '<span class="src">' + esc(m.src) + '</span>' : '') + '</div></div>';
    }).join('');
    VA.$('askbody').innerHTML = body;
    VA.$('asksugg').innerHTML = suggestions().map(function (s) { return '<button data-act="asksug" data-q="' + esc(s) + '">' + esc(s) + '</button>'; }).join('');
    var prov = d.provider === 'built-in' ? '<b>Built-in engine</b> · works offline, no key' : 'Free-form via <b>' + esc(d.provider) + '</b> · built-in still answers first';
    VA.$('askprov').innerHTML = prov + ' · <a data-act="askprovset">change</a>';
    var b = VA.$('askbody'); b.scrollTop = b.scrollHeight;
  };
  function push(who, text, src) { var d = DB(); d.aiChat = d.aiChat || []; d.aiChat.push({ who: who, text: text, src: src }); VA.save(); }

  /* built-in answers first; if it was only the generic fallback AND a model is connected,
     the model's answer is appended (never replacing the built-in one). */
  function send(q) {
    push('you', esc(q)); var r = respond(q); push('ai', r.text, r.src); VA.renderAsk();
    var generic = /Built-in · offline/.test(r.src || '');
    if (generic && typeof VAI !== 'undefined' && VAI.anyText()) {
      push('ai', '<i>Asking the connected model…</i>', 'routing');
      var idx = DB().aiChat.length - 1; VA.renderAsk();
      var ctx = 'You are the Vastrangam AI Engine assistant helping a Surat ethnic-wear seller. Answer briefly and practically. Question: ' + q;
      VAI.callText(ctx, { max: 400, fallback: '' }).then(function (res) {
        var chat = DB().aiChat;
        if (res.text && res.text.trim()) chat[idx] = { who: 'ai', text: esc(res.text.trim()).replace(/\n/g, '<br>'), src: res.provider };
        else chat.splice(idx, 1);
        VA.save(); VA.renderAsk();
      }).catch(function () { DB().aiChat.splice(idx, 1); VA.save(); VA.renderAsk(); });
    }
  }
  VA.action('asktoggle', function () { VA.$('ask').classList.toggle('show'); VA.renderAsk(); });
  VA.action('askclose', function () { VA.$('ask').classList.remove('show'); });
  VA.action('asksend', function () { var inp = VA.$('askinput'), q = inp.value.trim(); if (!q) return; inp.value = ''; send(q); });
  VA.action('asksug', function (b) { send(b.getAttribute('data-q')); });
  VA.action('askclear', function () { DB().aiChat = []; VA.save(); VA.renderAsk(); });
  VA.action('askprovset', function () {
    VA.modal('Connect an AI model (optional)',
      '<p class="hint" style="margin-bottom:12px">The built-in engine already answers everything about your records and screens, offline. Connect a model only if you also want free-form conversation. Your choice — no lock-in.</p>' +
      '<div class="fld"><label>Provider</label><select id="provsel">' + ['built-in', 'Claude (Anthropic)', 'OpenAI', 'Gemini (Google)', 'Mistral', 'Groq', 'OpenRouter', 'Ollama (local)', 'LM Studio (local)'].map(function (p) { return '<option' + (DB().provider === p ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></div>' +
      '<div class="note" style="margin-top:12px">A hosted key or a local model (Ollama / LM Studio) is used only for free-form chat. It is never required, and the app never sends your records anywhere without you choosing to.</div>' +
      '<div class="btnrow" style="margin-top:14px"><button class="btn p" data-act="provsave">Save</button><button class="btn" data-act="closemodal">Cancel</button></div>');
  });
  VA.action('provsave', function () { DB().provider = VA.val('provsel'); VA.save(); VA.closeModal(); VA.renderAsk(); VA.toast('Assistant set to ' + DB().provider); });
  VA.action('closemodal', function () { VA.closeModal(); });

  /* keyboard: Enter to send */
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'askinput') { e.preventDefault(); var inp = VA.$('askinput'); if (inp && inp.value.trim()) { var q = inp.value.trim(); inp.value = ''; send(q); } } });

  VA.ASK = { respond: respond };
})();
