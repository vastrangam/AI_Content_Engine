/* ═══════════ Vastrangam AI Engine — the product brief chat ═══════════

   "i want a chat box like how i am chatting in this box n then you are giving reply. so i can
   write down some details about fabrics, work, size."

   So this is a real conversation, not a form with a chat skin. You type what you know — "rayon
   with foil print, 3/4 sleeve, M to XXL, we sell at 899" — it replies like a person, and every
   detail it picks up lands in the brief on the right where you can see and correct it. When it
   has enough, it says so and the Generate button takes the whole brief into the engine.

   It works with no key: the offline extractor reads the fabric, craft, colour, occasion, sizes,
   price and category straight out of the sentence using the same libraries the engine uses. A
   connected model makes the reply conversational and catches what the rules miss. */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  var FIELDS = [
    ['category', 'Category'], ['colour', 'Colour'], ['fabric', 'Fabric'], ['work', 'Work'],
    ['occasion', 'Occasion'], ['sizes', 'Sizes'], ['sleeve', 'Sleeve'], ['neckline', 'Neckline'],
    ['length', 'Length'], ['price', 'Selling price'], ['mrp', 'MRP'], ['stock', 'Stock'],
    ['care', 'Care'], ['notes', 'Anything else']
  ];
  /* what the engine actually needs before a run is worth doing */
  var NEEDED = ['category', 'colour', 'fabric', 'work', 'occasion'];

  function brief() {
    var d = DB();
    if (!d.brief) d.brief = { msgs: [], facts: {} };
    return d.brief;
  }

  /* ── the offline extractor ──────────────────────────────────────────────────────
     Runs on every message whether or not a model is connected, so nothing depends on
     the network. The model's extraction is merged on top of it, never instead of it. */
  function extract(text, into) {
    var t = ' ' + String(text).toLowerCase() + ' ', f = into || {};
    function set(k, v) { if (v && !f[k]) f[k] = v; }

    /* set(), never assignment — what you typed first always wins over a later guess.
       Longest name first, so "Chinon Silk" is matched before the bare "Chinon" and
       "Salwar Suit Set" before "Suit". */
    longestFirst(LIB.FABRICS).forEach(function (x) { if (has(t, x)) set('fabric', x); });
    longestFirst(LIB.CRAFT).forEach(function (x) { if (has(t, x)) set('work', x); });
    Object.keys(LIB.OCC).forEach(function (x) { if (has(t, x.replace(/-/g, ' '))) set('occasion', x); });
    /* "lehenga and choli" is a lehenga — the vocabulary name is two words but a seller
       writes it however they speak, so fall back to the category detector the engine
       already uses, which scores on single words */
    longestFirst(LIB.CATS).forEach(function (x) { if (has(t, x.replace(/ \(Western\)/, ''))) set('category', x); });
    if (!f.category) {
      var guess = LIB.detectCategory(text);
      if (guess && anyWordOf(t, guess)) set('category', guess);
    }


  /* "vichitra silk" → "Vichitra Silk"; "kasab work" → "Kasab Work". Takes the material or
     craft word the seller used plus the qualifier in front of it, so an unlisted fabric
     still reaches the listing under its real name. */
  function unknownBefore(text, tailRe) {
    var words = String(text).split(/[^A-Za-z]+/).filter(Boolean);
    for (var i = 0; i < words.length; i++) {
      if (!tailRe.test(words[i])) continue;
      var prev = words[i - 1] || '';
      /* the qualifier must look like a name, not a filler word */
      if (!prev || prev.length < 3 || STOP.test(prev)) continue;
      return titleCase(prev + ' ' + words[i]);
    }
    return '';
  }
  var STOP = /^(this|that|with|and|the|is|are|its|it|for|from|in|on|of|our|we|a|an|has|have|pure|premium|soft|good|nice|fine|new|all|some|only|also)$/i;
  function titleCase(s) {
    return String(s).toLowerCase().replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
  }

    /* colour: the premium vocabulary first, then the base words it maps from */
    Object.keys(LIB.COLOURS).forEach(function (base) {
      LIB.COLOURS[base].forEach(function (nice) { if (has(t, nice)) set('colour', nice); });
      if (!f.colour && has(t, base)) set('colour', LIB.premiumColour(base));
    });

    var sizes = t.match(/\b(xs|s|m|l|xl|xxl|3xl|2xl)\b\s*(?:to|-|–|until)\s*\b(xs|s|m|l|xl|xxl|3xl|2xl)\b/i);
    if (sizes) set('sizes', sizes[0].toUpperCase().replace(/\s+/g, ' '));
    else if (/custom|stitch|made to measure|measurement/.test(t)) set('sizes', 'XS–3XL custom-stitched');

    /* Prices arrive every possible way — "₹899", "Rs 899/-", "899", "sell at 899, mrp 1799".
       Sizes and fractions are stripped first so 3XL and 3/4 are never read as money. A number
       labelled MRP is an MRP even when the selling price has a rupee sign and it does not. */
    var money = String(text).replace(/\b\d\s?xl\b/gi, ' ').replace(/\b\d\/\d\b/g, ' ');
    var lblMRP = money.match(/\b(?:mrp|m\.r\.p\.?|retail|compare at)\b[^\d]{0,12}([\d,]{3,7})/i);
    var lblSell = money.match(/\b(?:sell(?:ing)?|price|rate|offer|our)\b[^\d]{0,12}([\d,]{3,7})/i);
    if (lblMRP) set('mrp', VA.num(lblMRP[1].replace(/,/g, '')));
    if (lblSell) set('price', VA.num(lblSell[1].replace(/,/g, '')));

    var marked = money.match(/(?:₹|rs\.?|inr)\s?([\d,]{3,7})|\b([\d,]{3,7})\s?(?:rupees|rs\b|\/-)/gi) || [];
    var nums = marked.map(function (x) { return VA.num(x.replace(/[^\d]/g, '')); }).filter(function (n) { return n >= 99; });
    if (!nums.length) {
      /* no currency marker — accept bare numbers only when the sentence is talking about money,
         or when there is exactly one number in the whole message and it looks like a price */
      var bare = (money.match(/\b\d{3,6}\b/g) || []).map(VA.num).filter(function (n) { return n >= 199 && n <= 200000; });
      if (bare.length && (/price|sell|selling|rate|cost|mrp|retail|wholesale|@/.test(t) || bare.length === 1)) nums = bare;
    }
    nums = nums.filter(function (n, i, a) { return a.indexOf(n) === i; });
    if (nums.length === 1) set('price', nums[0]);
    if (nums.length > 1) { set('price', Math.min.apply(null, nums)); set('mrp', Math.max.apply(null, nums)); }

    var sl = t.match(/\b(sleeveless|full sleeve|half sleeve|short sleeve|three[\s-]?quarter|3\/4|cap sleeve|bell sleeve|puff sleeve)\b/);
    if (sl) set('sleeve', /3\/4|three/.test(sl[0]) ? 'three-quarter' : sl[0]);
    var nk = t.match(/\b(round neck|v.neck|boat neck|square neck|collar|keyhole|sweetheart|mandarin)\b/);
    if (nk) set('neckline', nk[0]);
    var ln = t.match(/\b(floor.length|ankle.length|knee.length|calf.length|midi|maxi|hip.length|thigh.length)\b/);
    if (ln) set('length', ln[0]);
    var st = t.match(/\b(\d{1,4})\s*(?:pcs|pieces|pieces in stock|in stock|qty|quantity)\b/);
    if (st) set('stock', VA.num(st[1]));
    if (/dry ?clean/.test(t)) set('care', 'Dry clean only');
    else if (/hand ?wash/.test(t)) set('care', 'Hand wash cold');
    else if (/machine ?wash/.test(t)) set('care', 'Machine wash gentle');

    /* ── never silently substitute ────────────────────────────────────────────────────
       A vocabulary is only ever a list of what we happened to think of. When a seller
       names a fabric or a craft we do not know, the honest thing is to USE THEIR WORD —
       not to fall quietly through to a default and describe a garment made of something
       else. That failure is invisible, and it is what put "roman silk" in a listing for
       a vichitra silk gown. */
    if (!f.fabric) { var uf = unknownBefore(text, MATERIAL_RE); if (uf) f.fabric = uf; }
    if (!f.work) { var uw = unknownBefore(text, CRAFT_RE); if (uw) f.work = uw; }
    return f;
  }
  var MATERIAL_RE = /^(silk|georgette|crepe|net|satin|cotton|linen|velvet|rayon|viscose|chiffon|organza|tissue|jacquard|brocade|knit|fabric)$/i;
  var CRAFT_RE = /^(work|print|embroidery|weaving|patti|kari|dana|zari|thread)$/i;

  function longestFirst(obj) {
    return Object.keys(obj).sort(function (a, b) { return b.length - a.length; });
  }
  /* does the text contain ANY distinctive word of this category name? "Lehenga Choli"
     is matched by someone writing "lehenga and choli", which no phrase test would catch. */
  function anyWordOf(t, name) {
    return String(name).replace(/ \(Western\)/, '').split(/\s+/)
      .filter(function (w) { return w.length > 3 && !/^(set|suit|and)$/i.test(w); })
      .some(function (w) { return has(t, w); });
  }
  /* whole words only — "Net" must not match inside "sangeet", "S" must not match inside anything */
  function has(haystack, needle) {
    var n = String(needle).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('(^|[^a-z0-9])' + n + '($|[^a-z0-9])', 'i').test(haystack);
  }

  function missing(f) { return NEEDED.filter(function (k) { return !f[k]; }); }

  /* A model will happily answer a field it was not asked about, and a sentence in the Fabric
     box is worse than an empty one. Anything the engine has a vocabulary for must match it;
     anything free-form is capped at a phrase; numbers must be numbers. */
  var VOCAB = {
    category: function () { return Object.keys(LIB.CATS); },
    fabric: function () { return Object.keys(LIB.FABRICS); },
    work: function () { return Object.keys(LIB.CRAFT); },
    occasion: function () { return Object.keys(LIB.OCC); }
  };
  function clean(k, v) {
    if (v == null || v === '') return '';
    if (k === 'price' || k === 'mrp' || k === 'stock') {
      /* "about 899 rupees" is a number as far as a seller is concerned */
      var m = String(v).match(/[\d,]{2,9}/);
      var n = m ? VA.num(m[0].replace(/,/g, '')) : 0;
      return n > 0 ? n : '';
    }
    var s = String(v).trim();
    if (VOCAB[k]) {
      var hit = VOCAB[k]().filter(function (x) { return x.toLowerCase() === s.toLowerCase(); })[0];
      if (hit) return hit;
      /* a near miss — "rayon fabric", "foil printing" — still counts, but only on a whole word,
         so a sentence never sneaks a stray "net" or "silk" into the Fabric box */
      hit = VOCAB[k]().filter(function (x) { return has(' ' + s.toLowerCase() + ' ', x); })
        .sort(function (a, b) { return b.length - a.length; })[0];
      /* and a whole sentence is not a spec, whatever word it happens to contain */
      if (s.length > 40 || /[.!?]\s/.test(s)) return '';
      return hit || '';
    }
    /* free-form: a phrase, never a paragraph */
    if (s.length > 60 || /[.!?]\s/.test(s)) return '';
    return s;
  }

  /* the offline reply — it names what it caught and asks for the next missing thing, which is
     what a person would do. No key, no network, no silence. */
  function offlineReply(caught, f) {
    var got = Object.keys(caught).filter(function (k) { return caught[k]; });
    var miss = missing(f);
    var lines = [];
    if (got.length) lines.push('Noted — ' + got.map(function (k) { return label(k).toLowerCase() + ' <b>' + esc(String(f[k])) + '</b>'; }).join(', ') + '.');
    else lines.push('I could not pick a spec out of that, so I have kept it as a note.');
    if (miss.length) {
      var next = miss[0];
      var ask = {
        category: 'What is it — kurti, anarkali, saree, lehenga, sharara, palazzo, salwar set or a western dress?',
        colour: 'What colour is this one? If there are several colourways, list them.',
        fabric: 'Which fabric? Rayon, roman silk, georgette, chinon, organza, cotton…',
        work: 'What work is on it — foil print, zari, sequins, thread, mirror, gota, digital print?',
        occasion: 'What is it for — festive, mehendi, sangeet, reception, wedding guest, bridal or daily?'
      }[next] || 'Tell me a little more.';
      lines.push(ask);
    } else {
      lines.push('That is everything the engine needs. Hit <b>Generate from this brief</b> and it will go and research the market for it.');
    }
    return lines.join('<br>');
  }
  function label(k) {
    for (var i = 0; i < FIELDS.length; i++) if (FIELDS[i][0] === k) return FIELDS[i][1];
    return k;
  }

  function send(q) {
    var b = brief();
    b.msgs.push({ who: 'you', text: esc(q) });
    var before = JSON.parse(JSON.stringify(b.facts));
    extract(q, b.facts);
    if (!b.facts.notes) b.facts.notes = q;
    else if (b.facts.notes.indexOf(q) < 0) b.facts.notes += ' · ' + q;
    var caught = {};
    Object.keys(b.facts).forEach(function (k) { if (b.facts[k] !== before[k] && k !== 'notes') caught[k] = b.facts[k]; });

    b.msgs.push({ who: 'ai', text: offlineReply(caught, b.facts), src: 'built-in · offline' });
    VA.save(); VA.render();

    if (!VAI.getKey('gemini')) return;

    /* the model gets the whole conversation and the brief so far, and returns a reply plus
       anything it noticed that the rules did not. Its facts never overwrite what you typed. */
    var idx = b.msgs.length;
    b.msgs.push({ who: 'ai', text: '<i>thinking…</i>', src: 'model' });
    VA.save(); VA.render();

    var schema = {
      type: 'object',
      properties: {
        reply: { type: 'string', description: 'your conversational reply, 1 to 3 sentences, warm and practical' },
        facts: {
          type: 'object',
          properties: {
            category: { type: 'string' }, colour: { type: 'string' }, fabric: { type: 'string' },
            work: { type: 'string' }, occasion: { type: 'string' }, sizes: { type: 'string' },
            sleeve: { type: 'string' }, neckline: { type: 'string' }, length: { type: 'string' },
            price: { type: 'number' }, mrp: { type: 'number' }, stock: { type: 'number' }, care: { type: 'string' }
          }
        },
        nextQuestion: { type: 'string', description: 'the single most useful thing still missing, phrased as a question' },
        ready: { type: 'boolean' }
      },
      required: ['reply']
    };
    var convo = b.msgs.filter(function (m) { return m.text.indexOf('thinking…') < 0; })
      .slice(-10).map(function (m) { return (m.who === 'you' ? 'SELLER: ' : 'YOU: ') + m.text.replace(/<[^>]+>/g, ''); }).join('\n');
    var prompt = 'You are taking a product brief from a Surat ethnic-wear seller, over chat. You know Indian ' +
      'garment manufacture: fabrics, embroidery, stitching, sizing, marketplace requirements.\n\n' +
      'THE BRIEF SO FAR (already captured — do not ask again for anything here):\n' +
      JSON.stringify(b.facts) + '\n\nTHE CONVERSATION:\n' + convo + '\n\n' +
      'Reply like a person who knows the trade. One to three sentences. Confirm what you understood in plain words, ' +
      'then ask for the ONE most useful thing still missing — never a list of questions.\n' +
      'In "facts", return only what you can actually infer from what the seller said. Never guess a price. ' +
      'Use these exact vocabularies where they fit:\n' +
      '· category: ' + Object.keys(LIB.CATS).join(', ') + '\n' +
      '· fabric: ' + Object.keys(LIB.FABRICS).join(', ') + '\n' +
      '· work: ' + Object.keys(LIB.CRAFT).join(', ') + '\n' +
      '· occasion: ' + Object.keys(LIB.OCC).join(', ') + '\n' +
      'Set ready true only when category, colour, fabric, work and occasion are all known.';

    VAI.json(prompt, schema, { temp: 0.6, max: 900, noCache: true }).then(function (a) {
      var bb = brief();
      if (!a || !a.reply) { bb.msgs.splice(idx, 1); VA.save(); VA.render(); return; }
      Object.keys(a.facts || {}).forEach(function (k) {
        var v = clean(k, a.facts[k]);
        if (v && !bb.facts[k]) bb.facts[k] = v;
      });
      bb.msgs[idx] = {
        who: 'ai',
        text: esc(a.reply).replace(/\n/g, '<br>') + (a.nextQuestion && !a.ready ? '<br><br><b>' + esc(a.nextQuestion) + '</b>' : ''),
        src: 'model'
      };
      bb.ready = !!a.ready || !missing(bb.facts).length;
      VA.save(); VA.render();
    }).catch(function (e) {
      var bb = brief();
      bb.msgs[idx] = { who: 'ai', text: '<i>The model did not answer (' + esc(String(e.message || e).slice(0, 70)) + ') — the offline reply above still stands.</i>', src: 'offline' };
      VA.save(); VA.render();
    });
  }

  /* ── the panel, rendered inside the Content Engine screen ── */
  function panel() {
    var b = brief();
    var msgs = b.msgs.length ? b.msgs : [{ who: 'ai', src: 'built-in · offline',
      text: 'Tell me about the piece in your own words — fabric, the work on it, sleeve, sizes, what you sell it for. ' +
        'Type it however you like. I will pull the specs out as you go and show them on the right.<br><br>' +
        '<span class="hint">For example: "rayon kurti with foil print, three-quarter sleeve, M to XXL, festive, we sell at 899"</span>' }];
    var chat = '<div id="brfbody" style="max-height:340px;overflow:auto;padding:4px 2px">' +
      msgs.map(function (m) {
        return '<div class="msg ' + (m.who === 'you' ? 'you' : 'ai') + '"><div class="av">' + (m.who === 'you' ? '🙂' : '✦') + '</div>' +
          '<div class="bub">' + m.text +
          (m.src ? '<span class="src" style="display:block;margin-top:5px;font-size:11px;opacity:.62">' + esc(m.src) + '</span>' : '') +
          '</div></div>';
      }).join('') + '</div>' +
      '<div class="btnrow" style="margin-top:10px">' +
      '<input id="brfinput" placeholder="Type the details — fabric, work, sleeve, sizes, price…" style="flex:1;min-width:200px">' +
      '<button class="btn p" data-act="brfsend">Send</button>' +
      '<button class="btn sm" data-act="brfclear">Clear</button></div>' +
      '<p class="hint" style="margin-top:6px">' + (VAI.getKey('gemini')
        ? 'The built-in extractor answers instantly, then the connected model replies on top of it.'
        : 'Working offline — the built-in extractor reads your fabrics, crafts, colours and occasions with no key. Connect Gemini on Connectors for a conversational reply.') + '</p>';

    var miss = missing(b.facts);
    var facts = FIELDS.map(function (f) {
      var v = b.facts[f[0]];
      if (f[0] === 'notes') return '';
      return '<div class="kv"><span>' + f[1] + '</span><b>' +
        (v ? esc(String(v)) : '<span class="hint">' + (NEEDED.indexOf(f[0]) >= 0 ? 'needed' : 'optional') + '</span>') + '</b></div>';
    }).join('') +
      (b.facts.notes ? '<div class="kv" style="display:block"><span>Your words</span><div class="hint" style="margin-top:3px">' + esc(b.facts.notes) + '</div></div>' : '') +
      '<div class="' + (miss.length ? 'warn' : 'good') + '" style="margin-top:10px">' +
      (miss.length ? 'Still needed: <b>' + miss.map(label).join(', ') + '</b>' : 'The brief is complete — this is enough for a full run.') + '</div>' +
      '<div class="btnrow" style="margin-top:10px">' +
      '<button class="btn p" data-act="brfgen">Generate from this brief</button>' +
      '<button class="btn" data-act="brffill">Copy into the form</button></div>';

    return '<div class="two">' +
      H.panel('Tell the engine about the product <span class="badge">chat</span>', chat) +
      H.panel('The brief it has built <span class="badge">' + (FIELDS.length - miss.length - 1) + '/' + (FIELDS.length - 1) + '</span>', facts) +
      '</div>';
  }

  function toInput() {
    var f = brief().facts;
    return {
      desc: [f.colour, f.fabric, f.work, f.category].filter(Boolean).join(' ') || f.notes || '',
      colour: f.colour || '', fabric: f.fabric || '', work: f.work || '',
      occ: f.occasion || 'festive', cat: f.category || '', price: f.price || '',
      notes: [f.notes, f.sizes && ('Sizes: ' + f.sizes), f.sleeve && ('Sleeve: ' + f.sleeve),
        f.neckline && ('Neckline: ' + f.neckline), f.length && ('Length: ' + f.length),
        f.care && ('Care: ' + f.care), f.mrp && ('MRP ₹' + f.mrp)].filter(Boolean).join(' · ')
    };
  }

  VA.action('brfsend', function () {
    var i = VA.$('brfinput'), q = i && i.value.trim();
    if (!q) { VA.toast('Type something first'); return; }
    i.value = ''; send(q);
  });
  VA.action('brfclear', function () { DB().brief = { msgs: [], facts: {} }; VA.save(); VA.render(); });
  VA.action('brffill', function () {
    var v = toInput();
    ['desc', 'colour', 'fabric', 'work', 'occ', 'cat', 'price', 'notes'].forEach(function (k) {
      var el = VA.$('ce_' + k); if (el && v[k]) el.value = v[k];
    });
    VA.toast('Copied into the form — edit anything before you generate');
  });
  VA.action('brfgen', function () {
    var miss = missing(brief().facts);
    if (miss.length > 2) { VA.toast('Tell me the ' + miss.slice(0, 2).map(label).join(' and ') + ' first'); return; }
    VA.CE.run(toInput());
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'brfinput') {
      e.preventDefault();
      var i = VA.$('brfinput'), q = i.value.trim();
      if (q) { i.value = ''; send(q); }
    }
  });

  window.VBRIEF = { panel: panel, extract: extract, cleanFact: clean, toInput: toInput, missing: missing, brief: brief, FIELDS: FIELDS, NEEDED: NEEDED };
})();
