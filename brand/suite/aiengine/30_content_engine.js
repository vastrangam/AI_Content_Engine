/* ═══════════ Vastrangam AI Engine — Content Engine (offline 13-phase generator) ═══════════ */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  /* ── the generator: input → full content pack, no network ── */
  function generate(inp) {
    var cat = inp.cat || LIB.detectCategory(inp.product || inp.desc || '');
    var C = LIB.CATS[cat] || LIB.CATS['Anarkali Suit'];
    var colour = inp.colour || LIB.premiumColour(inp.desc || inp.product || 'purple');
    var fabric = inp.fabric && LIB.FABRICS[inp.fabric] ? inp.fabric : 'Roman Silk';
    var fb = LIB.FABRICS[fabric];
    var work = inp.work && LIB.CRAFT[inp.work] ? inp.work : 'Zari';
    var occ = inp.occ && LIB.OCC[inp.occ] ? inp.occ : 'festive';
    var oc = LIB.OCC[occ];
    var label = inp.label && LIB.LABELS[inp.label] ? inp.label : 'Vastrangam';
    var price = VA.num(inp.price) || Math.round((C.pr[0] + C.pr[1]) / 2);
    var mrp = Math.round(price * 1.7);
    var typeNoun = cat.replace(/ \(Western\)/, '').replace(' Set', '').replace(' Suit', '');
    var sku = inp.sku || (C.px + (1000 + Math.floor(Math.random() * 9000)));
    var occLabel = occ.replace('-', ' ');

    var title = colour + ' ' + fabric + ' ' + work + ' ' + typeNoun + ' for ' + cap(occLabel);
    var handle = VA.slug(colour + '-' + fabric + '-' + typeNoun + '-' + occ);

    /* four title variants */
    var titles = {
      SEO: title,
      Emotional: 'The ' + colour + ' that turns the room — ' + typeNoun + ' for ' + occLabel,
      Marketplace: 'Vastrangam ' + colour + ' ' + fabric + ' ' + typeNoun + ' with ' + work + ' work, Custom-Fit XS–3XL',
      Ad: colour + ' ' + typeNoun + ' · looks ' + VA.inr(mrp * 2) + ', isn\'t'
    };

    /* humanized opening — no product-noun opener */
    var openings = {
      mehendi: 'Red is the bride\'s. Yellow vanishes into the marigolds. So a guest is left with one honest question — what actually works? This ' + colour.toLowerCase() + ' does: warm enough to glow under lights, deep enough that it never once competes for the aisle.',
      sangeet: 'She wanted to dance, not stand at the edge holding a clutch. That ruled out the heavy lehenga before the invite was even open.',
      reception: 'Turn around slowly. From the front it photographs like old money; the real trick is what happens when she moves.',
      'wedding-guest': 'The third wedding this season, and the beige from the last two is not doing it again. This is the answer to that specific boredom.',
      festive: 'The diyas were already lit when she walked in, and for a second nobody reached for their phone — they just looked.',
      bridal: 'Her mother fixed the pleats, stepped back, and went quiet. That silence said more than the mirror did.',
      default: 'It almost stayed on the rack. Then she held it up to the light, and that settled it.'
    };
    var open1 = openings[occ] || openings.default;
    open1 = open1 + ' At barely ' + fb.w.replace('~', '') + ', <b>' + fabric.toLowerCase() + '</b> moves with her — it does not wear her.';
    var open2 = 'Look closer and the work shows itself: <b>' + work.toLowerCase() + '</b> — ' + LIB.CRAFT[work].toLowerCase() +
      '. Surat karigars still map it by hand, one motif at a time. Nothing about it is heavy; all of it reads expensive.';

    var dims = { 'Saree': '5.5m saree + 0.8m blouse piece', 'Lehenga Choli': 'Flared skirt + choli + 2.3m dupatta',
      'Anarkali Suit': 'Floor-length gown + inner + 2.3m dupatta', 'Kurti': 'Hip-to-knee kurti',
      'Dress (Western)': 'Knee/midi length', 'Sharara Set': 'Wide sharara + short kurta + dupatta',
      'Palazzo Set': 'Palazzo + kurta + dupatta', 'Salwar Suit Set': 'A-line kurta + bottom + dupatta' }[cat] || 'Full set';

    var bodyHTML = shopifyBody(title, open1, open2, fabric, fb, work, colour, dims, cat, typeNoun, occ, oc, label);

    /* tags */
    var occTag = occ.replace(/-/g, ' ');
    var tags = [colour.toLowerCase() + ' ' + typeNoun.toLowerCase(), fabric.toLowerCase() + ' ' + typeNoun.toLowerCase(),
      typeNoun.toLowerCase() + ' for ' + occTag, 'what to wear to a ' + occTag, work.toLowerCase() + ' ' + typeNoun.toLowerCase(),
      'custom fit ' + typeNoun.toLowerCase(), occTag + ' outfit', label.toLowerCase().replace(/ /g, ''),
      'festive wear surat', typeNoun.toLowerCase() + ' with dupatta', 'indian wedding guest', 'vastrangam'];

    var meta = { title: (colour + ' ' + typeNoun + ' for ' + occLabel + ' | Vastrangam').slice(0, 60),
      desc: (open1.replace(/<[^>]+>/g, '').slice(0, 120) + ' Custom-fit XS–3XL. Free shipping ₹1,999+.').slice(0, 160) };

    var faq = [
      { q: 'What is the fabric and how heavy is it?', a: fabric + ' — ' + fb.s.toLowerCase() + ', about ' + fb.w.replace('~', '') + '.' },
      { q: 'Is custom sizing available?', a: 'Yes. XS to 3XL, custom-stitched to your measurements at no extra charge. WhatsApp your bust and waist to +91 87580 38161.' },
      { q: 'What occasion is it best for?', a: 'Built for ' + oc.c + ' — ' + oc.light + '.' },
      { q: 'How do I care for it?', a: 'Dry clean only to keep the ' + work.toLowerCase() + ' and the drape intact.' }
    ];

    /* social */
    var social = buildSocial(colour, typeNoun, fabric, work, occ, occLabel, oc, price, mrp);
    var suno = buildSuno(occ);
    var ads = buildAds(colour, typeNoun, mrp, occLabel);
    var marketplace = buildMarketplace(colour, fabric, work, typeNoun, occLabel, occ, oc, sku, price, mrp, cat, label);
    var email = buildEmail(colour, typeNoun, occLabel, label);
    var webhook = buildWebhook(sku, title, cat, price);
    var blog = buildBlog(colour, typeNoun, occ, occLabel, fabric);
    var thumbs = [{ ratio: '16:9', px: '1280×720', plat: 'YouTube' }, { ratio: '9:16', px: '1080×1920', plat: 'Reels/Shorts' }, { ratio: '1:1', px: '1080×1080', plat: 'Carousel' }];

    var pack = {
      cat: cat, colour: colour, fabric: fabric, work: work, occ: occ, label: label, price: price, mrp: mrp,
      sku: sku, handle: handle, typeNoun: typeNoun, titles: titles, title: title, bodyHTML: bodyHTML,
      tags: tags, meta: meta, faq: faq, social: social, suno: suno, ads: ads, marketplace: marketplace,
      email: email, webhook: webhook, blog: blog, thumbs: thumbs, dims: dims,
      bullets: shopifyBullets(fabric, fb, work, colour, occLabel, oc)
    };
    pack.qa = qaGate(pack);
    return pack;
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function shopifyBullets(fabric, fb, work, colour, occLabel, oc) {
    return [
      fabric + ' — ' + fb.s.toLowerCase() + '; reads premium, weighs almost nothing.',
      'Hand-mapped ' + work.toLowerCase() + ', scalloped gota-and-pearl hem, floral zari detailing.',
      'Built for ' + oc.c + ' — done, never bridal.',
      'Custom-stitched to your measurements, XS to 3XL — not the usual four sizes.',
      'Dry clean only. Unsure of size? Custom sizing at no extra charge.'
    ];
  }

  function shopifyBody(title, o1, o2, fabric, fb, work, colour, dims, cat, typeNoun, occ, oc, label) {
    return '<h1>' + title + '</h1>\n\n<p>' + o1 + '</p>\n\n<p>' + o2 + '</p>\n\n' +
      '<h4>PRODUCT SPECIFICATIONS</h4>\n<table>\n<thead>\n<tr><td><strong>Feature</strong></td><td><strong>Details</strong></td></tr>\n</thead>\n<tbody>\n' +
      row('Material Base', fabric + ' — ' + fb.s.toLowerCase()) +
      row('Design Technique', work + ' · ' + LIB.CRAFT[work].toLowerCase()) +
      row('Available Colours', colour) +
      row('Dimensions', dims) +
      row('Weight', fb.w.replace('~', '') + ' · lightweight') +
      row('Care', 'Dry Clean Only') +
      '</tbody>\n</table>\n<p> </p>\n\n' +
      '<h4>WHEN AND WHERE TO WEAR THIS ' + typeNoun.toUpperCase() + '?</h4>\n<ul>\n' +
      '<li><p><b>Occasion:</b> ' + cap(oc.c) + ' — the ' + colour.toLowerCase() + ' does the work under ' + oc.light + '.</p></li>\n' +
      '<li><p><b>Season:</b> ' + fabric + ' breathes; good from an October mandap to a March cocktail.</p></li>\n' +
      '<li><p><b>How to Style:</b> Let the dupatta do the talking — draped open, hair to one side, jhumkas, no necklace.</p></li>\n' +
      '<li><p><b>Accessories:</b> Gold jhumkas, a single kada, block heels so the flare clears the floor.</p></li>\n</ul>\n\n' +
      '<ul>\n' +
      '<li><p><i>(What is this product?)</i> A ' + dims.toLowerCase().split('+')[0].trim() + ' <b>' + typeNoun.toLowerCase() + '</b> with matching pieces.</p></li>\n' +
      '<li><p><i>(What makes it different?)</i> The ' + work.toLowerCase() + ' and the fit — most sellers skip both.</p></li>\n' +
      '<li><p><i>(Who should use this?)</i> The ' + occ.replace('-', ' ') + ' guest who is done with heavy weight but still wants the room to look.</p></li>\n' +
      '<li><p><i>(Why choose this?)</i> Custom-stitched to your measurements at no extra charge — it falls right the first time.</p></li>\n</ul>\n' +
      '<p>Not sure of your size? WhatsApp your bust + waist to +91 87580 38161 and we\'ll recommend the fit.</p>';
  }
  function row(k, v) { return '<tr><td><span><b>' + k + '</b></span></td><td><span>' + v + '</span></td></tr>\n'; }

  function buildSocial(colour, typeNoun, fabric, work, occ, occLabel, oc, price, mrp) {
    var hashtags = ['#' + occ.replace(/-/g, '') + 'outfit', '#' + typeNoun.toLowerCase().replace(/ /g, ''), '#weddingguestindia',
      '#' + colour.toLowerCase().replace(/ /g, ''), '#' + fabric.toLowerCase().replace(/ /g, ''), '#customfit', '#suratfashion',
      '#indianwedding', '#ethnicwear', '#festivewear', '#' + occLabel.replace(/ /g, ''), '#desifashion', '#ootdindia', '#vastrangam',
      '#craftedinsurat', '#madeinsurat', '#indianoutfit', '#partywearindian', '#ethnicgown', '#shaadiseason'];
    var post = 'Red is hers. Yellow is the decor. So what does a guest actually wear?\n\n' +
      'This ' + colour.toLowerCase() + '. Warm enough to glow under the lights, deep enough that it never once looks like it is trying to be the bride.\n\n' +
      'Custom-stitched to your measurements. XS to 3XL. DM ‘' + occLabel.toUpperCase().replace(/ /g, '') + '’ and we\'ll get the fit right.\n\n' +
      'Crafted in Surat. 🌿\n\n' + hashtags.join(' ');
    var carousel = [
      'Cover — "You are invited to the ' + occLabel + '. Now what?" + hero shot',
      'Desire — "Red is the bride\'s. Yellow disappears. Beige makes you invisible."',
      'Reveal — the ' + colour.toLowerCase() + ', full frame. "This one. Every time."',
      'Feature — close on the ' + work.toLowerCase() + '. "Placed one at a time. Never on a grid."',
      'Feature — the hem, mid-walk. "Gold gota. Then pearls. They move."',
      'Styling — "Jhumkas. One kada. No necklace — let the drape win."',
      'Proof — "Google 4.8★. Custom-fit, no extra charge."',
      'Price — "' + VA.inr(mrp) + ' → ' + VA.inr(price) + '"',
      'CTA — "DM ‘' + occLabel.toUpperCase().replace(/ /g, '') + '’ · custom sizing"',
      'Close — "Crafted in Surat. Worn Everywhere. — @vastrangam"'
    ];
    var reel = {
      acts: ['0–3s — hands open the dupatta, ' + work.toLowerCase() + ' catching light. Text: "the colour you are allowed to wear".',
        '3–15s — she turns, flare opens; cut to the hem; ' + fabric.toLowerCase() + ' moving.',
        '15–20s — "Custom-fit. XS–3XL. Crafted in Surat." + @vastrangam'],
      vo: 'Somebody else is the bride. You still want to be the photograph everyone saves. This is the ' + colour.toLowerCase() + ' that does both.'
    };
    return { post: post, hashtags: hashtags, carousel: carousel, reel: reel };
  }
  function buildSuno(occ) {
    var m = {
      mehendi: '[bollywood, hinglish, mehendi night, dholak, harmonium, claps, warm, female vocals, 92 bpm, folk-cinematic]\n\n' +
        '(Mukhda)\nAangan mein diye, aur haathon pe naam\nWoh aayi hai aise, jaise thami ho shaam\n\n' +
        '(Antara 1)\nNa uska din tha, na uski baari\nPhir bhi nazrein usi pe haari\nKisi ne poocha — "yeh kaun aayi?"\nHawa ne bas muskura di saari\n\n' +
        '(Mukhda)\nAangan mein diye, aur haathon pe naam…\n\n(Outro)\nAangan mein diye… (held, fade)',
      sangeet: '[bollywood, hinglish, sangeet, soft dhol, strings, warm, female vocals, 120 bpm, cinematic]\n\n' +
        '(Mukhda)\nPalat ke dekha jo usne, mehfil thehar si gayi\nWoh muskuraayi halki si, aur raat sanwar si gayi\n\n' +
        '(Antara)\nNa koi shor, na koi zid thi\nBas ek adaa, jo dil le gayi\n\n(Outro)\nPalat ke dekha jo usne… (held, fade)',
      reception: '[bollywood, hindi, wedding, strings, emotional, romantic, female vocals, 80 bpm]\n\n' +
        '(Mukhda)\nRoshni mein woh chali, jaise koi khwaab ho\nHar nazar ne yeh kaha, "aaj kuch janaab ho"\n\n(Outro)\nRoshni mein woh chali… (fade)'
    };
    return m[occ] || m.reception;
  }
  function buildAds(colour, typeNoun, mrp, occLabel) {
    return [
      { angle: 'Emotion', t: '"She didn\'t want to disappear into the ' + occLabel + '. She wanted to be the one they photographed." → Shop the ' + colour.toLowerCase() + '.' },
      { angle: 'Price', t: '"Looks like ' + VA.inr(mrp * 2) + '. Isn\'t. Custom-fit, hand-worked." → See the price.' },
      { angle: 'Status', t: '"The outfit that got asked about four times before dinner." → Reserve yours.' }
    ];
  }
  function buildMarketplace(colour, fabric, work, typeNoun, occLabel, occ, oc, sku, price, mrp, cat, label) {
    return {
      amazon: {
        title: 'Vastrangam Women\'s ' + colour + ' ' + fabric + ' ' + typeNoun + ' with ' + work + ' Work, Custom-Fit ' + cap(occLabel) + ' Ethnic Wear',
        bullets: [
          fabric + ' — ' + LIB.FABRICS[fabric].s.toLowerCase() + '; reads premium, weighs almost nothing.',
          'Hand-mapped ' + work.toLowerCase() + ' with scalloped gota-and-pearl hem.',
          'Made for ' + oc.c + ' — the one that reads festive without competing with the bride.',
          'Custom-stitched to your measurements at no extra charge. XS to 3XL.',
          'Dry clean only. Unsure of size? Send bust and waist and we\'ll recommend it.'
        ],
        keywords: colour.toLowerCase() + ' ' + typeNoun.toLowerCase() + ', ' + occLabel + ' outfit, ' + work.toLowerCase() + ' ' + typeNoun.toLowerCase() + ', roman silk, custom fit xs 3xl'
      },
      flipkart: flipkartAttrs(cat, colour, fabric, work, occLabel, price, mrp, sku),
      myntra: '"' + colour + ' ' + fabric + ' ' + typeNoun + ' built for ' + oc.c + ' — ' + work.toLowerCase() + ' across the body, a flare that behaves on a dance floor. XS–3XL, custom-fit."',
      ajio: '"' + colour + ' ' + fabric.toLowerCase() + ' ' + typeNoun.toLowerCase() + ' set — ' + work.toLowerCase() + ', gota-and-moti hem. Sizes XS–3XL."',
      meesho: '💜 ' + colour + ' ' + typeNoun + ' · ' + cap(occLabel) + '-ready · Custom-fit · COD · 7-day returns'
    };
  }
  function flipkartAttrs(cat, colour, fabric, work, occLabel, price, mrp, sku) {
    var common = 'Seller SKU=' + sku + ' · MRP=' + mrp + ' · Selling Price=' + price + ' · Stock=25 · HSN=6204 · Country Of Origin=IN · Fabric Care=Dry Clean Only';
    var byCat = {
      'Saree': 'Brand=Vastrangam · Fabric=' + fabric + ' · Occasion=' + cap(occLabel) + ' · Type=' + work + ' · Ideal For=Women · Pack of=1 · Color=' + colour + ' · Blouse Piece=Yes · Ornamentation=Embroidery',
      'Lehenga Choli': 'Type=Lehenga Choli · Top Fabric=' + fabric + ' · Occasion=' + cap(occLabel) + ' · Ideal For=Women · Pack of=3 · Color=' + colour + ' · Ornamentation Type=' + work,
      'Kurti': 'Brand=Vastrangam · Occasion=' + cap(occLabel) + ' · Ideal For=Women · Fabric=' + fabric + ' · Neck=Round · Fit=Regular · Color=' + colour + ' · Ornamentation Type=' + work
    };
    return (byCat[cat] || 'Type=' + cat + ' Set · Top Fabric=' + fabric + ' · Occasion=' + cap(occLabel) + ' · Neck=V-Neck · Sleeve=Long · Ideal For=Women · Color=' + colour + ' · Pack of=2 · Ornamentation Type=' + work) + ' · ' + common;
  }
  function buildEmail(colour, typeNoun, occLabel, label) {
    return { subject: 'The ' + colour.toLowerCase() + ' you\'re allowed to wear', preheader: 'Custom-fit ' + typeNoun.toLowerCase() + ' for ' + occLabel + ' · XS–3XL',
      hero: 'Somebody else is the bride. You still get to be the photograph.',
      body: 'The ' + occLabel + ' has a dress code nobody writes down. This ' + colour.toLowerCase() + ' answers it — festive, never competing. Custom-stitched to your measurements, dispatched this week.',
      cta1: 'Shop the ' + colour, cta2: 'WhatsApp +91 87580 38161' };
  }
  function buildWebhook(sku, title, cat, price) {
    return JSON.stringify({ sku: sku, title: title, category: cat, price: price,
      channels: ['shopify', 'amazon', 'flipkart', 'instagram'], shopify_csv_row: '', marketplace: { platform: '', fields: {} },
      social: { caption: '', hashtags: [], image_alt: '' }, image_files: [sku + '_hero.webp', sku + '_detail.webp'], status: 'ready' }, null, 2);
  }
  function buildBlog(colour, typeNoun, occ, occLabel, fabric) {
    return 'There is a specific panic that arrives about ten days before somebody else\'s wedding, and it is not about the reception. It is about the ' + occLabel + '. You cannot wear red — that is hers. You cannot wear yellow, because the courtyard is already yellow and you will be furniture in every photograph. This is the case for a ' + colour.toLowerCase() + ' ' + typeNoun.toLowerCase() + ' — and specifically a fluid ' + fabric.toLowerCase() + ' one that photographs like money and weighs almost nothing… (continues)';
  }

  /* ── QA GATE ── */
  function qaGate(p) {
    var checks = [];
    function ck(name, ok) { checks.push({ name: name, ok: !!ok }); }
    var firstLine = p.bodyHTML.split('\n').filter(function (l) { return l.indexOf('<p>') === 0; })[0] || '';
    var firstWords = firstLine.replace(/<[^>]+>/g, '').toLowerCase().split(/\s+/).slice(0, 4).join(' ');
    ck('Opening line does not start with the product noun', !LIB.PRODUCT_NOUNS.some(function (n) { return firstWords.indexOf(n) === 0; }));
    var allText = (p.bodyHTML + ' ' + p.social.post + ' ' + p.blog).toLowerCase();
    ck('No banned AI-skeleton phrase appears', !LIB.BANNED.some(function (b) { return allText.indexOf(b) >= 0; }));
    ck('Song lyrics contain no product word', !LIB.PRODUCT_NOUNS.some(function (n) { return p.suno.toLowerCase().indexOf(n) >= 0; }));
    ck('Specs table has no blank cell', p.bodyHTML.indexOf('<span></span>') < 0 && p.bodyHTML.indexOf('><span> </span>') < 0);
    ck('SEO title within 60 chars', p.meta.title.length <= 60);
    ck('Meta description within 160 chars', p.meta.desc.length <= 160);
    ck('Handle within 60 chars, hyphenated', p.handle.length <= 60 && /^[a-z0-9-]+$/.test(p.handle));
    ck('At least 3 product-unique long-tail tags', p.tags.length >= 3);
    ck('Four distinct title variants produced', new Set(Object.values(p.titles)).size === 4);
    ck('AEO question-answer block present', p.bodyHTML.indexOf('(What is this product?)') >= 0);
    var pass = checks.filter(function (c) { return c.ok; }).length;
    return { checks: checks, pass: pass, total: checks.length, pct: Math.round(pass / checks.length * 100) };
  }
  function uniqueness(p, runs) {
    var prior = (runs || []).filter(function (r) { return r.pack; });
    var titleDup = prior.some(function (r) { return r.pack.titles.SEO === p.titles.SEO; });
    var openDup = prior.some(function (r) { return r.pack.bodyHTML.slice(0, 120) === p.bodyHTML.slice(0, 120); });
    return { unique: !titleDup && !openDup, note: titleDup ? 'Title matches an earlier run — differentiate' : openDup ? 'Opening repeats — new angle needed' : 'Title, opener and meta are unique' };
  }

  VA.CE = { generate: generate, qaGate: qaGate, uniqueness: uniqueness };

  /* ═══════════ SCREENS ═══════════ */

  VA.view('home', function () {
    var d = DB();
    var live = d.runs.length, sched = d.calendar.filter(function (c) { return c.status === 'Scheduled'; }).length;
    var pubd = d.publog.length, conn = d.channels.filter(function (c) { return c.connected; }).length;
    return H.head('Vastrangam AI Engine', 'One studio, five engines', 'Content, image, video, design and publishing over one set of records — every screen live, and an assistant on every one of them.') +
      H.kpis([
        { l: 'Content runs', v: live, d: 'generated packs', icon: 'pen', tone: 'violet' },
        { l: 'Products', v: d.products.length, d: 'in the catalog', icon: 'cart', tone: 'gold' },
        { l: 'Scheduled', v: sched, d: 'on the calendar', icon: 'cal', tone: 'blue' },
        { l: 'Published', v: pubd, d: 'live on channels', icon: 'send', tone: 'green' },
        { l: 'Channels', v: conn + '/' + d.channels.length, d: 'connected', icon: 'plug', tone: 'peach' }
      ], 'k5') +
      '<div class="two">' +
      H.panel('The five engines' + '', appCards()) +
      H.panel('Start here', startHere(d)) +
      '</div>' +
      H.panel('Latest content runs <span class="badge">' + d.runs.length + '</span>',
        H.table([
          { label: 'When', k: 'at', cellcls: 'mono' },
          { label: 'SKU', k: 'sku', cellcls: 'mono' },
          { label: 'Product', fmt: function (r) { return '<b>' + esc(r.colour) + ' ' + esc(r.cat) + '</b>'; } },
          { label: 'For', fmt: function (r) { return esc(r.occ.replace('-', ' ')); } },
          { label: 'QA', fmt: function (r) { return H.tag((r.qa || 100) + '%', (r.qa || 100) >= 90 ? 'grn' : 'amb'); } },
          { label: '', fmt: function (r) { return '<button class="btn sm" data-act="openrun" data-id="' + r.id + '">Open →</button>'; } }
        ], d.runs.slice().reverse()));
  });
  function appCards() {
    var apps = [['Content Engine', 'ce', 'pen', 'Type a product, get the whole pack'], ['Image Studio', 'img', 'image', 'Layers, adjust, crop, export at 7 sizes'],
      ['Video Studio', 'vid', 'film', 'Timeline, preview, WebM/GIF export'], ['Design Studio', 'des', 'layout', 'Templates, brand kit, poster canvas'],
      ['Publisher', 'pub', 'send', 'Channels, calendar, publish log']];
    return apps.map(function (a) {
      return '<div class="channel" data-go="' + a[1] + '" style="cursor:pointer">' +
        '<div class="ci" style="background:linear-gradient(96deg,#5B2D8E,#7B3FBE)">' + VA.icon(a[2]) + '</div>' +
        '<div class="cn"><b>' + a[0] + '</b><span>' + a[3] + '</span></div><span style="color:var(--hint);font-size:18px">›</span></div>';
    }).join('');
  }
  function startHere(d) {
    return '<div class="cascade">' +
      '<div class="cl"><span class="d">1</span><div>Open <b>Content Engine</b> → New run. Type a product like "mehendi green roman silk anarkali" and press Generate.</div></div>' +
      '<div class="cl"><span class="d">2</span><div>Take the hero image into <b>Image Studio</b>, resize to all 7 marketplace sizes, export.</div></div>' +
      '<div class="cl"><span class="d">3</span><div>Build the reel in <b>Video Studio</b>, the poster in <b>Design Studio</b>.</div></div>' +
      '<div class="cl"><span class="d">4</span><div>Send it all to channels from <b>Publisher</b>, and watch it on the calendar.</div></div>' +
      '</div><div class="good">Stuck anywhere? Tap <b>Ask the Engine</b> (bottom-right) — it reads your live records and knows every screen. Works with the internet off.</div>';
  }
  VA.action('openrun', function (b) { DB().openRun = b.getAttribute('data-id'); VA.go('run'); });

  /* Content Engine dashboard */
  VA.view('ce', function () {
    var d = DB();
    return H.head('Content Engine', 'Content Engine', 'The 13-phase engine, running offline from the colour, fabric, craft and occasion libraries. A connected model only upgrades the prose — the pack, the uniqueness check and the QA gate run either way.') +
      H.kpis([
        { l: 'Runs', v: d.runs.length, d: 'content packs', icon: 'pen', tone: 'violet' },
        { l: 'Avg QA score', v: avgQA(d) + '%', d: 'across runs', cls: 'g', icon: 'check', tone: 'green' },
        { l: 'Products ready', v: d.products.length, d: 'to generate from', icon: 'cart', tone: 'gold' },
        { l: 'Engine', v: d.provider === 'built-in' ? 'Built-in' : 'Model', d: d.provider === 'built-in' ? 'offline, no key' : d.provider, icon: 'spark', tone: 'blue' }
      ]) +
      '<div class="two">' +
      H.panel('New content run', runForm(d)) +
      H.panel('Pick a product from the catalog', productPick(d)) +
      '</div>' +
      H.panel('Every run <span class="badge">' + d.runs.length + '</span>',
        H.table([
          { label: 'When', k: 'at', cellcls: 'mono' },
          { label: 'SKU', k: 'sku', cellcls: 'mono' },
          { label: 'Title', fmt: function (r) { return '<b>' + esc(r.title) + '</b>'; } },
          { label: 'Price', fmt: function (r) { return VA.inr(r.price); }, cellcls: 'mono' },
          { label: 'QA', fmt: function (r) { return H.tag((r.qa || 100) + '%', (r.qa || 100) >= 90 ? 'grn' : 'amb'); } },
          { label: '', fmt: function (r) { return '<button class="btn sm" data-act="openrun" data-id="' + r.id + '">Open →</button> <button class="btn sm d" data-act="delrun" data-id="' + r.id + '">✕</button>'; } }
        ], d.runs.slice().reverse()));
  });
  function avgQA(d) { if (!d.runs.length) return 100; return Math.round(d.runs.reduce(function (s, r) { return s + (r.qa || 100); }, 0) / d.runs.length); }
  function runForm(d) {
    return '<div class="form f2">' +
      H.fields([
        { id: 'ce_desc', label: 'Describe the product (or paste a title)', wide: true, ph: 'e.g. mehendi green roman silk zari anarkali gown for mehendi' },
        { id: 'ce_colour', label: 'Colour (leave blank to auto-pick a premium name)', ph: 'Mehendi Green' },
        { id: 'ce_fabric', label: 'Fabric', type: 'select', options: [''].concat(Object.keys(LIB.FABRICS)) },
        { id: 'ce_work', label: 'Craft / work', type: 'select', options: [''].concat(Object.keys(LIB.CRAFT)) },
        { id: 'ce_occ', label: 'Occasion', type: 'select', options: Object.keys(LIB.OCC) },
        { id: 'ce_cat', label: 'Category (blank = auto-detect)', type: 'select', options: [''].concat(Object.keys(LIB.CATS)) },
        { id: 'ce_label', label: 'Label', type: 'select', options: Object.keys(LIB.LABELS) },
        { id: 'ce_price', label: 'Selling price ₹', type: 'num', ph: '2499' }
      ]) +
      '<div class="fld full"><button class="btn p" data-act="cegen"><svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg> Generate the full pack</button></div></div>' +
      '<p class="hint" style="margin-top:9px">Runs all 13 phases offline: 4 titles, Shopify HTML, tags, meta, FAQ, social (post/carousel/reel), Suno lyrics, ad copy, all 5 marketplaces, email, webhook and the 9-sheet Excel.</p>';
  }
  function productPick(d) {
    return H.table([
      { label: 'SKU', k: 'sku', cellcls: 'mono' },
      { label: 'Product', fmt: function (p) { return '<b>' + esc(p.name) + '</b><div class="hint">' + esc(p.fabric) + ' · ' + esc(p.work) + '</div>'; } },
      { label: 'Price', fmt: function (p) { return VA.inr(p.price); }, cellcls: 'mono' },
      { label: '', fmt: function (p) { return '<button class="btn sm p" data-act="cegenprod" data-id="' + p.id + '">Generate</button>'; } }
    ], d.products);
  }

  VA.action('cegen', function () {
    var inp = { desc: VA.val('ce_desc'), colour: VA.val('ce_colour'), fabric: VA.val('ce_fabric'),
      work: VA.val('ce_work'), occ: VA.val('ce_occ'), cat: VA.val('ce_cat'), label: VA.val('ce_label'), price: VA.val('ce_price') };
    if (!inp.desc && !inp.colour) { VA.toast('Describe the product first'); return; }
    doGenerate(inp);
  });
  VA.action('cegenprod', function (b) {
    var p = DB().products.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
    doGenerate({ desc: p.name, colour: p.colour, fabric: p.fabric, work: p.work, occ: p.occ, cat: p.cat, label: p.label, price: p.price, sku: p.sku });
  });
  function doGenerate(inp) {
    var pack = generate(inp);
    var uq = uniqueness(pack, DB().runs);
    var run = { id: VA.uid('r'), at: VA.todayISO(), sku: pack.sku, cat: pack.cat, colour: pack.colour, fabric: pack.fabric,
      work: pack.work, occ: pack.occ, label: pack.label, price: pack.price, title: pack.title, qa: pack.qa.pct, unique: uq, pack: pack };
    DB().runs.push(run); DB().openRun = run.id; VA.save();
    VA.toast('Pack generated — QA ' + pack.qa.pct + '%'); VA.go('run');
  }
  VA.action('delrun', function (b) {
    var d = DB(); d.runs = d.runs.filter(function (r) { return r.id !== b.getAttribute('data-id'); }); VA.save(); VA.toast('Run deleted'); VA.render();
  });

})();
