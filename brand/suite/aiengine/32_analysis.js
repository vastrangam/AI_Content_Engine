/* ═══════════ Vastrangam AI Engine — the full report .doc and the platform .xlsx ═══════════

   Two downloads, and they are the two the user asked for by name.

   1. The report .doc follows the fourteen sections of Vastrangam_Product_Content_Report.docx
      exactly, so what comes out of the engine opens in Word looking like the document they
      already work from — and every paragraph is editable, because it is a real Word document
      (HTML with the Word namespace), not a locked PDF.

   2. The platform .xlsx is the one you upload. Sheet 1 is the Shopify import in its 61
      columns; the rest are Amazon, Flipkart, Myntra, Ajio and Meesho in their own column
      orders, plus image SEO and the calendar. No sheet mixes two platforms, because no
      platform accepts a mixed file. */
(function () {
  'use strict';
  var DB = function () { return VA.DB; };

  /* ── the offline fallback for the analysis sections, used when no research ran ── */
  function analysis(p) {
    var occ = p.occ.replace('-', ' '), typeNoun = p.typeNoun, colour = p.colour, fabric = p.fabric, work = p.work;
    var floor = { 'Anarkali Suit': 779, 'Lehenga Choli': 1200, 'Saree': 650, 'Kurti': 220, 'Sharara Set': 900, 'Palazzo Set': 700, 'Salwar Suit Set': 650, 'Dress (Western)': 350 }[p.cat] || 700;
    return {
      title: colour + ' ' + p.cat + ' — Market & Competitive Analysis',
      market: 'This is a Surat-made design family, resold widely across value→premium. At catalogue quantity the ' + p.cat.toLowerCase() + ' construction lands near ₹' + floor + '/piece; the same design retails from marketplaces at the value end up to designer houses at multiples of that. You are not competing on the product — everyone can buy the same catalogue. You compete on fit, story, photography and trust.',
      trends: [
        colour + ' is a searched shade for ' + occ + ' — name it in the title, not just "' + fabric.toLowerCase() + ' ' + typeNoun.toLowerCase() + '".',
        'Buyers compare spec sheets: publish flare in metres, dupatta length, weight in grams — most listings give nothing to compare.',
        'Custom-fit XS–3XL is a structural edge over value sellers who ship four sizes and hope.',
        'Real-place photography (not flat-lay) reads a full price band higher; the detail/back shot is what sells ' + work.toLowerCase() + '.'
      ],
      competitors: [
        { tier: 'Value (Meesho, Flipkart pool)', how: 'lists it as "embroidered ' + typeNoun.toLowerCase() + ' with dupatta"; wins on price + COD', beat: 'do not chase them on price — beat them on trust (real photos, custom-fit)' },
        { tier: 'Mid (cbazaar, Mirraw, Indo Era)', how: 'faux georgette, heavy discounting, generic titles', beat: 'name the occasion + the trims (' + work.toLowerCase() + ', moti hem); undercut on price while beating on sizes' },
        { tier: 'Premium (Kalki, Pernia\'s, Lashkaraa)', how: 'owns the search phrase, ships weeks out', beat: 'take their Google traffic with the words they don\'t use, and win on same-week dispatch' }
      ],
      gaps: [
        'Nobody names what ' + colour.toLowerCase() + ' is FOR at a ' + occ + ' — the single most searchable true thing.',
        'Nobody names the trims — "' + work.toLowerCase() + '" reads three times more expensive than "embroidery".',
        'Four or five sizes everywhere — custom XS–3XL is open ground.',
        'Flat-lay photography — your real-place hero + a detail shot changes the price band.'
      ],
      better: [
        'Custom-stitched to measurement, XS–3XL, no extra charge — answers "will it fit my waist and fall right?"',
        'Publish the spec sheet buyers want to compare (flare, weight, dupatta length).',
        'Lead the listing with the occasion the colour is for, not the fabric.',
        'Same-week dispatch against premium houses that ship weeks out.'
      ]
    };
  }

  /* ── small builders so the fourteen sections read the same way ── */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function h1(t) { return '<h1>' + esc(t) + '</h1>'; }
  function h2(n, t) { return '<h2>' + n + ' · ' + esc(t) + '</h2>'; }
  function h3(t) { return '<h3>' + esc(t) + '</h3>'; }
  function para(t) { return t ? '<p>' + esc(t).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') + '</p>' : ''; }
  function raw(t) { return t ? '<p>' + t + '</p>' : ''; }
  function ul(a) { return (a && a.length) ? '<ul>' + a.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : ''; }
  function kv(rows) {
    return '<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%">' +
      rows.filter(function (r) { return r[1] !== '' && r[1] != null; })
        .map(function (r) { return '<tr><td width="30%" style="background:#F5F1E8"><b>' + esc(r[0]) + '</b></td><td>' + esc(r[1]) + '</td></tr>'; }).join('') +
      '</table>';
  }
  function tbl(head, rows) {
    if (!rows || !rows.length) return '';
    return '<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%">' +
      '<tr style="background:#241436;color:#FBF6EC">' + head.map(function (h) { return '<th align="left">' + esc(h) + '</th>'; }).join('') + '</tr>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</table>';
  }
  function pre(t) { return t ? '<p style="font-family:Consolas,monospace;font-size:10pt;background:#FAF7F0;padding:8px;white-space:pre-wrap">' + esc(t) + '</p>' : ''; }

  /* ── the fourteen sections ────────────────────────────────────────────────────────
     Numbered and titled to match Vastrangam_Product_Content_Report.docx so the two
     documents sit side by side. Sections fill from the deep run where it ran, and from
     the offline libraries where it did not — the document is never half-empty. */
  function report(p) {
    var d = p.deep || {}, a = analysis(p), occ = String(p.occ).replace(/-/g, ' ');
    var S = [];

    S.push(h1('Vastrangam Premium Product Report'));
    S.push('<p style="color:#6B5A86"><b>' + esc(p.title) + '</b><br>' +
      esc(p.sku) + ' &nbsp;·&nbsp; ' + esc(p.cat) + ' &nbsp;·&nbsp; ' + esc(p.colour) +
      ' &nbsp;·&nbsp; generated ' + esc(VA.todayISO()) +
      ' &nbsp;·&nbsp; depth: ' + esc((VDEEP.DEPTHS[p.depth] || { label: 'offline' }).label) + '</p>');
    S.push('<p style="color:#6B5A86;font-size:9pt">Every paragraph in this document is editable. Change anything, save it, and use it as your own.</p><hr>');

    /* 1 — the sub-headings below match Vastrangam's own sample report exactly, so this
       document and the one they already work from sit side by side */
    S.push(h2(1, 'Executive Summary'));
    S.push(h3('Product Overview'));
    S.push(para(p.colour + ' ' + p.fabric + ' ' + p.cat + ' with ' + p.work + ' work, built for ' + occ +
      '. ' + p.dims + '. Custom-stitched XS–3XL at no extra charge, made in Surat, dispatched within the week. ' +
      'Selling at ' + VA.inr(p.price) + ' against an MRP of ' + VA.inr(p.mrp) + '.'));
    S.push(h3('Product Vision'));
    S.push(para(d.dna && d.dna.voice ? d.dna.voice :
      'Sell the occasion, not the fabric. Every asset in this report answers one question a buyer is already asking, in words she would use herself.'));
    S.push(h3('USP'));
    S.push(ul(a.better));
    S.push(h3('Brand Positioning'));
    S.push(para('Vastrangam sits between the value marketplaces and the designer houses: marketplace price, designer fit. ' +
      'The defensible ground is custom sizing XS–3XL, Surat manufacture and same-week dispatch — three things a reseller cannot copy from a catalogue.'));

    /* 2 */
    S.push(h2(2, 'Product Analysis'));
    S.push(kv([
      ['SKU', p.sku], ['Handle', p.handle], ['Category', p.cat], ['Colour', p.colour],
      ['Colourways', p.variants ? p.variants.map(function (v) { return v.colour; }).join(', ') : p.colour],
      ['Fabric', p.fabric], ['Work', p.work], ['Occasion', occ], ['Composition', p.dims],
      ['Sizes', 'XS–3XL, custom-stitched'], ['Care', 'Dry clean only'],
      ['Selling price', VA.inr(p.price)], ['MRP', VA.inr(p.mrp)], ['Country of origin', 'India (Surat)'], ['HSN', '6204']
    ]));
    if (p.userNotes) { S.push(h3('What you told the engine')); S.push(para(p.userNotes)); }
    S.push(h3('Design Highlights'));
    S.push(para(d.market || a.market));
    S.push(h3('Occasion Suitability'));
    S.push(d.market
      ? '<p style="color:#6B5A86;font-size:9pt">Named sellers, prices and listing titles are in the section above, taken from live search during this run.</p>'
      : tbl(['Tier', 'How they sell it', 'How you beat them'], a.competitors.map(function (c) { return [c.tier, c.how, c.beat]; })));
    S.push(h3('Competitive Advantages'));
    S.push(ul(a.gaps));

    /* 3 */
    S.push(h2(3, 'Customer Persona'));
    S.push(d.psych ? para(d.psych) : para(
      'She is 24 to 38, in a tier-1 or tier-2 city, spending ' + VA.inr(Math.round(p.price * 0.7)) + ' to ' + VA.inr(Math.round(p.price * 1.6)) +
      ' on one outfit for someone else\'s wedding. She has been burned by a size chart before. She wants to be photographed, not noticed.'));

    /* 4 */
    S.push(h2(4, 'Buyer Psychology'));
    S.push(d.hooks
      ? tbl(['Hook', 'The tension it opens', 'Use it on'], d.hooks.map(function (h) { return [h.line, h.why, h.use]; }))
      : ul(['The fit fear — will this actually sit right on my waist?',
            'The price fear — is this the same piece Meesho sells for half?',
            'The trying-too-hard fear — will I look like I am competing with the bride?',
            'The delivery fear — will it arrive before the function?']));

    /* 5 */
    S.push(h2(5, 'Product Story'));
    S.push(raw(p.bodyHTML.replace(/<table[\s\S]*?<\/table>/g, '')));
    if (d.whenWhere) { S.push(h3('When and where she wears this')); S.push(para(d.whenWhere)); }

    /* 6 */
    S.push(h2(6, 'SEO Content'));
    S.push(kv([['SEO title', p.meta.title + '  (' + p.meta.title.length + ' chars)'],
               ['Meta description', p.meta.desc + '  (' + p.meta.desc.length + ' chars)'],
               ['URL handle', p.handle]]));
    S.push(h3('Tags'));
    S.push(para(p.tags.join(' · ')));
    if (d.keywords) { S.push(h3('Primary & Secondary Keywords')); S.push(para(d.keywords)); }
    S.push(h3('Search Tags & FAQ'));
    S.push(tbl(['Question', 'Answer'], p.faq.map(function (f) { return [f.q, f.a]; })));

    /* 7 */
    S.push(h2(7, 'Product Listing'));
    S.push(h3('Shopify'));
    S.push(kv([['Title', p.title], ['Handle', p.handle], ['Price', VA.inr(p.price)], ['Compare-at', VA.inr(p.mrp)]]));
    S.push(ul(p.bullets));
    S.push(h3('Amazon'));
    S.push(kv([['Title', p.marketplace.amazon.title], ['Backend keywords', p.marketplace.amazon.keywords]]));
    S.push(ul(p.marketplace.amazon.bullets));
    if (p.marketplace.amazon.desc) S.push(para(p.marketplace.amazon.desc));
    S.push(h3('Myntra')); S.push(para(p.marketplace.myntra));
    S.push(h3('Flipkart')); S.push(pre(p.marketplace.flipkart));
    S.push(h3('Ajio')); S.push(para(p.marketplace.ajio));
    S.push(h3('Meesho')); S.push(para(p.marketplace.meesho));

    /* 8 */
    S.push(h2(8, 'Social Media Kit'));
    S.push(h3('Instagram Caption')); S.push(para(p.social.post));
    S.push(h3('Carousel Copy')); S.push(ul(p.social.carousel));
    S.push(h3('Reel Script')); S.push(ul(p.social.reel.acts));
    S.push(para('Voiceover: ' + p.social.reel.vo));
    if (d.storyPolls) { S.push(h3('WhatsApp Promotion & Story Stickers')); S.push(ul(d.storyPolls)); }

    /* 9 */
    S.push(h2(9, 'Advertising Kit'));
    S.push(d.ads
      ? tbl(['Funnel', 'Angle', 'Primary text', 'Headline'], d.ads.map(function (x) { return [x.funnel, x.angle, x.primary, x.headline + (x.desc ? ' / ' + x.desc : '')]; }))
      : tbl(['Angle', 'Copy'], p.ads.map(function (x) { return [x.angle, x.t]; })));
    S.push(h3('Email'));
    S.push(kv([['Subject', p.email.subject], ['Preheader', p.email.preheader], ['Hero', p.email.hero],
               ['Body', p.email.body], ['CTA', p.email.cta1 + ' · ' + p.email.cta2]]));

    /* 10 */
    S.push(h2(10, 'Marketplace Assets'));
    S.push(h3('Product Specifications & Image SEO'));
    S.push(tbl(['#', 'Alt text'], (p.imageSEO || []).map(function (t, i) { return [i + 1, t]; })));
    S.push(h3('Thumbnails'));
    S.push(tbl(['Platform', 'Size', 'Line 1', 'Line 2'], p.thumbs.map(function (t) { return [t.plat, t.px, t.line1 || '', t.line2 || '']; })));
    if (d.size) {
      S.push(h3('Care Instructions & Size Chart'));
      S.push(para(d.size.intro)); S.push(ul(d.size.help || [])); S.push(para(d.size.cta));
    }

    /* 11 */
    S.push(h2(11, 'AI Creative Prompts'));
    S.push(tbl(['Use', 'Prompt'], creativePrompts(p)));

    /* 12 */
    S.push(h2(12, 'Growth Strategy & 30-Day Content Calendar'));
    S.push(para('Week 1 discovery, week 2 proof, week 3 objection-handling, week 4 offer. ' +
      'Every entry below is postable as written — the caption is finished copy, not a reminder to write one.'));
    S.push(d.calendar
      ? tbl(['Day', 'Channel', 'Format', 'Hook', 'Caption'], d.calendar.map(function (x) { return [x.day, x.channel, x.format, x.hook, x.caption || '']; }))
      : '<p style="color:#6B5A86">Run this product at <b>Deep</b> depth to write the 30 days.</p>');
    if (d.scale) {
      S.push(h3('Marketing Strategy'));
      S.push(tbl(['Asset', 'Copy'], d.scale.map(function (x) { return [x.kind, x.text]; })));
    }

    /* 13 */
    S.push(h2(13, 'Suno AI Song Lyrics'));
    S.push(pre(p.suno));
    if (d.sunoEnglish) S.push(para('What it says: ' + d.sunoEnglish));

    /* 14 */
    S.push(h2(14, 'Cinematic Video Script (30 Seconds)'));
    if (d.video) {
      if (d.video.logline) S.push(para('Logline: ' + d.video.logline));
      S.push(tbl(['Timecode', 'Shot', 'Beat', 'On screen'],
        (d.video.scenes || []).map(function (s) { return [s.tc, s.shot, s.beat, s.onScreen || '—']; })));
      if (d.video.endCard) S.push(para('End card: ' + d.video.endCard));
    } else {
      S.push(tbl(['Timecode', 'Shot', 'On screen'], [
        ['00:00–00:03', 'hands open the dupatta, ' + p.work.toLowerCase() + ' catches light', 'the colour you are allowed to wear'],
        ['00:03–00:15', 'she turns, flare opens, cut to the hem', '—'],
        ['00:15–00:20', 'full-length, courtyard wide', 'Custom-fit · XS–3XL · Crafted in Surat']
      ]));
    }

    if ((p.sources || []).length) {
      S.push('<hr>' + h2('A', 'Sources opened during this run'));
      S.push('<ol>' + p.sources.map(function (s) {
        return '<li><a href="' + esc(s.uri) + '">' + esc(s.title || s.uri) + '</a></li>';
      }).join('') + '</ol>');
    }
    S.push('<hr><p style="color:#6B5A86;font-size:9pt"><i>Vastrangam · Crafted in Surat · written by Vastrangam AI Engine. ' +
      'Vastrangam AI Engine will never ask you for a marketplace, bank or account password. If any screen ever does, it is not this app.</i></p>');
    return S.join('\n');
  }

  function creativePrompts(p) {
    var base = p.colour + ' ' + p.fabric.toLowerCase() + ' ' + p.cat.toLowerCase() + ' with ' + p.work.toLowerCase() + ' work';
    return [
      ['Hero shot', 'Full-length editorial photograph of an Indian woman wearing a ' + base + ', standing in a Surat courtyard at golden hour, natural light, shallow depth of field, 85mm, no harsh shadows, shot on film'],
      ['Detail shot', 'Extreme close-up of the ' + p.work.toLowerCase() + ' on ' + p.fabric.toLowerCase() + ', raking side light showing thread relief, macro lens, neutral background'],
      ['Flat-lay', 'Overhead flat-lay of a ' + base + ' folded on a linen surface with brass jhumkas and dried marigold, soft daylight, muted palette'],
      ['Lifestyle', 'Candid photograph, same woman mid-turn at a mehendi function, string lights bokeh behind her, motion in the fabric, documentary style'],
      ['Background plate', 'Empty Indian haveli courtyard at dusk, marigold garlands, warm practical lighting, no people, 9:16 vertical, for compositing'],
      ['Video establishing', 'Slow dolly-in through a carved wooden doorway into a lit courtyard, evening, cinematic, anamorphic, 24fps motion blur']
    ];
  }

  /* Word-openable .doc — HTML with the Word namespace, which Word, Google Docs and Pages
     all open as a normal editable document. A real .docx zip would need a zip writer for
     one output; this needs none and stays fully editable, which was the point. */
  function toDoc(p, body, title) {
    return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" ' +
      'xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>' + esc(title || p.sku) + '</title>' +
      '<style>body{font-family:Georgia,serif;color:#241436;line-height:1.55;font-size:11pt}' +
      'h1{color:#241436;font-size:22pt;margin:0 0 4px}h2{color:#241436;font-size:15pt;border-bottom:1px solid #E6DCCA;padding-bottom:4px;margin-top:26px}' +
      'h3{color:#8E6730;font-size:12pt;margin:16px 0 4px}table{margin:8px 0}td,th{vertical-align:top;font-size:10pt}' +
      'ul{margin:6px 0 6px 18px}li{margin:4px 0}a{color:#8E6730}</style></head><body>' + body + '</body></html>';
  }
  function download(name, html, mime) {
    var blob = new Blob(['﻿' + html], { type: mime });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  VA.action('dlreport', function (b) {
    var run = DB().runs.filter(function (r) { return r.id === b.getAttribute('data-id'); })[0]; if (!run) return;
    download(run.pack.sku + '-content-report.doc', toDoc(run.pack, report(run.pack), 'Vastrangam Product Content Report'), 'application/msword');
    VA.toast('14-section report downloaded — open it in Word and edit anything');
  });
  VA.action('dldoc', function (b) {
    var run = DB().runs.filter(function (r) { return r.id === b.getAttribute('data-id'); })[0]; if (!run) return;
    var p = run.pack, a = analysis(p), d = p.deep || {};
    var body = h1(a.title) + kv([['SKU', p.sku], ['Category', p.cat], ['Colour', p.colour], ['Fabric', p.fabric]]) +
      h2(1, 'The market') + para(d.market || a.market) +
      h2(2, 'Trends to ride') + ul(a.trends) +
      h2(3, 'Competitor analysis') + tbl(['Tier', 'How they sell it', 'How you beat them'], a.competitors.map(function (c) { return [c.tier, c.how, c.beat]; })) +
      h2(4, 'Gap analysis') + ul(a.gaps) +
      h2(5, 'What you can do better') + ul(a.better);
    download(p.sku + '-market-analysis.doc', toDoc(p, body, 'Market analysis'), 'application/msword');
    VA.toast('Market analysis .doc downloaded');
  });

  /* ── the upload-ready workbook ───────────────────────────────────────────────────
     One sheet per platform in that platform's own column order. Shopify is the 61-column
     import; the others are the columns their bulk-upload templates ask for. */
  function platformSheets(p) {
    var rows = (p.variants && p.variants.length) ? VSPEC.rowsVariants(p, p.variants) : VSPEC.rows(p, p.shots);
    var shopify = [VSPEC.COLS].concat(rows.map(function (r) {
      return VSPEC.COLS.map(function (c) { return String(r[c] == null ? '' : r[c]).replace(/\n/g, ' '); });
    }));
    var cols = p.variants && p.variants.length ? p.variants : [{ colour: p.colour, shots: p.shots }];
    var sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
    var m = p.marketplace;

    /* the column order Vastrangam's own Amazon sheet uses — matched so the file drops
       straight into the workflow they already have, no re-mapping */
    var amazon = [['Amazon Seller SKU', 'Brand', 'Product Title (<=200)',
      'Bullet 1', 'Bullet 2', 'Bullet 3', 'Bullet 4', 'Bullet 5',
      'Product Description', 'Backend Keywords (<=250 bytes)',
      'Selling Price (INR)', 'MRP (INR)', 'Browse Category', 'Color', 'Size', 'HSN', 'Country of Origin']];
    cols.forEach(function (v) {
      sizes.forEach(function (sz) {
        amazon.push([skuOf(p, v) + '-' + sz, 'Vastrangam', m.amazon.title.slice(0, 200),
          m.amazon.bullets[0] || '', m.amazon.bullets[1] || '', m.amazon.bullets[2] || '',
          m.amazon.bullets[3] || '', m.amazon.bullets[4] || '',
          (m.amazon.desc || strip(p.bodyHTML)).slice(0, 2000), m.amazon.keywords,
          p.price, p.mrp, p.cat, v.colour || p.colour, sz, '6204', 'India']);
      });
    });

    var flip = [['Seller SKU ID', 'Brand', 'Product Name', 'MRP', 'Your selling price', 'Fullfillment by',
      'Procurement type', 'Stock', 'HSN', 'Country Of Origin', 'Color', 'Size', 'Fabric', 'Occasion',
      'Ornamentation Type', 'Fabric Care', 'Description', 'Key Features']];
    cols.forEach(function (v) {
      sizes.forEach(function (sz) {
        flip.push([skuOf(p, v) + '-' + sz, 'Vastrangam', p.title, p.mrp, p.price, 'Seller', 'Domestic', 25, '6204',
          'IN', v.colour || p.colour, sz, p.fabric, cap(String(p.occ).replace(/-/g, ' ')), p.work, 'Dry Clean Only',
          strip(p.bodyHTML).slice(0, 3000), p.bullets.join(' | ')]);
      });
    });

    function simple(head, desc) {
      var out = [head];
      cols.forEach(function (v) {
        sizes.forEach(function (sz) {
          out.push([skuOf(p, v) + '-' + sz, 'Vastrangam', p.title, v.colour || p.colour, sz, p.fabric, p.work,
            cap(String(p.occ).replace(/-/g, ' ')), p.mrp, p.price, 25, desc]);
        });
      });
      return out;
    }
    var head = ['Style ID', 'Brand', 'Product Name', 'Colour', 'Size', 'Fabric', 'Work', 'Occasion', 'MRP', 'Selling Price', 'Stock', 'Description'];

    /* their Image SEO sheet: Image Filename, Product Title, Color, SKU Code, Description, Alt Text */
    var imgs = [['Image Filename', 'Product Title', 'Color', 'SKU Code', 'Description', 'Alt Text (SEO)']];
    var i = 0;
    cols.forEach(function (v) {
      (v.shots || []).forEach(function (sh) {
        imgs.push([sh.name || (skuOf(p, v) + '_' + String(v.colour || '').replace(/\s+/g, '-')),
          p.title, v.colour || p.colour, skuOf(p, v),
          strip(p.meta.desc), (p.imageSEO || [])[i] || '']);
        i++;
      });
    });

    /* their Post & Story sheet, column for column */
    var cal = [['SKU', 'Product Name', 'Platform', 'Post Type', 'Hook Line', 'Caption Full', 'CTA',
      'Hashtags (30)', 'Alt Text', 'Visual Direction', 'Story Frame 1', 'Story Frame 2', 'Story Frame 3',
      'Poll/Sticker', 'Highlight Category', 'Publish Date', 'Publish Time', 'Status',
      'AEO Answer Line', 'SGO Trigger Word']];
    var t0 = new Date();
    var tags = (p.social.hashtags || []).join(' ');
    var polls = (p.deep && p.deep.storyPolls) || [];
    var car = p.social.carousel || [];
    ((p.deep && p.deep.calendar) || []).forEach(function (x, ix) {
      cal.push([skuOf(p, cols[0] || {}), p.title, x.channel, x.format, x.hook, x.caption || '',
        'DM to order · WhatsApp +91 87580 38161', tags, (p.imageSEO || [])[0] || '',
        (p.social.reel.acts || [])[0] || '', car[1] || '', car[2] || '', car[3] || '',
        polls[ix % (polls.length || 1)] || '', cap(String(p.occ).replace(/-/g, ' ')),
        new Date(t0.getTime() + (x.day - 1) * 86400000).toISOString().slice(0, 10),
        '19:30', 'Scheduled',
        (p.faq[0] && p.faq[0].a) || '', String(p.work)]);
    });

    var out = [
      { name: 'Shopify', rows: shopify },
      { name: 'Amazon', rows: amazon },
      { name: 'Flipkart', rows: flip },
      { name: 'Myntra', rows: simple(head, m.myntra) },
      { name: 'Ajio', rows: simple(head, m.ajio) },
      { name: 'Meesho', rows: simple(head, m.meesho) },
      { name: 'Image SEO', rows: imgs }
    ];
    /* a header-only sheet just makes the upload look broken — only ship the calendar when
       a Deep run actually wrote one */
    if (cal.length > 1) out.push({ name: 'Post & Story', rows: cal });
    return out;
  }
  function skuOf(p, v) {
    var base = String(p.skuBase || p.sku || '').replace(/[^A-Za-z0-9]+$/, '');
    return v.colour ? base + '_' + String(v.colour).toUpperCase().replace(/\s+/g, '_') : base;
  }
  function strip(h) { return String(h).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  VA.action('dlplatxlsx', function (b) {
    var run = DB().runs.filter(function (r) { return r.id === b.getAttribute('data-id'); })[0]; if (!run) return;
    var sheets = {};
    platformSheets(run.pack).forEach(function (s) { sheets[s.name] = s.rows; });
    try {
      VSheet.saveXlsx(run.pack.sku + '-platform-upload.xlsx', sheets);
      VA.toast('Platform workbook downloaded — one sheet per marketplace');
    } catch (e) { VA.toast('Export failed here — try the CSV instead'); }
  });

  VA.ANALYSIS = { analysis: analysis, toDoc: toDoc, report: report, platformSheets: platformSheets, download: download };
})();
