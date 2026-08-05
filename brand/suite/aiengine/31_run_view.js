/* ═══════════ Content run detail — the full generated pack ═══════════ */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };
  var _cnt = 0;
  function block(title, text, mono) {
    var id = 'cp' + (_cnt++);
    var el = mono ? '<pre class="out" id="' + id + '">' + esc(text) + '</pre>' : '<div id="' + id + '">' + text + '</div>';
    return '<div class="panel"><div class="ph">' + esc(title) + '<span class="badge">copy-ready</span>' +
      '<button class="btn sm cp" data-act="copytext" data-id="' + id + '" style="margin-left:auto">Copy</button></div>' + el + '</div>';
  }

  VA.view('run', function () {
    var d = DB(), run = d.runs.filter(function (r) { return r.id === d.openRun; })[0];
    if (!run || !run.pack) return H.head('Content Engine', 'No run open', 'Generate a pack from the Content Engine.') +
      H.panel('', '<div class="empty">Nothing to show. <button class="btn p" data-go="ce">Go to Content Engine</button></div>');
    var p = run.pack;
    var tab = d.runTab || 'listing';
    var tabs = [['listing', 'Shopify listing'], ['social', 'Social'], ['video', 'Video & Suno'], ['ads', 'Ads & email'],
      ['market', 'Marketplaces'], ['qa', 'QA & uniqueness'], ['excel', '9-sheet export']];
    var out = H.head('Content Engine · ' + p.sku, p.colour + ' ' + p.cat, esc(p.title)) +
      '<div class="btnrow" style="margin-bottom:6px"><button class="btn sm" data-go="ce">← All runs</button>' +
      '<button class="btn sm gold" data-act="sendtopub" data-id="' + run.id + '">Send to Publisher →</button>' +
      '<button class="btn sm" data-act="runmd" data-id="' + run.id + '">Run as .md</button>' +
      '<button class="btn sm" data-act="dldoc" data-id="' + run.id + '">Analysis .doc</button>' +
      '<button class="btn sm" data-act="dlxlsx" data-id="' + run.id + '">9-sheet .xlsx</button>' +
      '<button class="btn sm" data-act="aiupgrade" data-id="' + run.id + '">✦ AI upgrade</button>' +
      '<span style="margin-left:auto"></span>' + H.tag('QA ' + p.qa.pct + '%', p.qa.pct >= 90 ? 'grn' : 'amb') +
      ' ' + H.tag(run.unique && run.unique.unique ? 'unique' : 'check dup', run.unique && run.unique.unique ? 'blu' : 'amb') + '</div>' +
      '<div class="chiprow" style="margin:12px 0 16px">' + tabs.map(function (t) {
        return '<button class="chip' + (tab === t[0] ? ' on' : '') + '" data-act="runtab" data-t="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>';

    if (tab === 'listing') out += listingTab(p);
    else if (tab === 'social') out += socialTab(p);
    else if (tab === 'video') out += videoTab(p);
    else if (tab === 'ads') out += adsTab(p);
    else if (tab === 'market') out += marketTab(p);
    else if (tab === 'qa') out += qaTab(p, run);
    else if (tab === 'excel') out += excelTab(p, run);
    return out;
  });
  VA.action('runtab', function (b) { DB().runTab = b.getAttribute('data-t'); VA.save(); VA.render(); });

  function listingTab(p) {
    _cnt = 0;
    var titlesTbl = H.table([{ label: 'Angle', k: 'a' }, { label: 'Title', fmt: function (r) { return esc(r.t) + ' <span class="hint">(' + r.t.length + ' chars)</span>'; } }],
      Object.keys(p.titles).map(function (k) { return { a: k, t: p.titles[k] }; }));
    return (p.aiOpening ? H.panel('AI-upgraded opening <span class="badge">from your model</span>', '<div class="good">' + esc(p.aiOpening) + '</div>') : '') +
      H.panel('Four title variants', titlesTbl) +
      block('Shopify body (HTML — paste into Col 3)', p.bodyHTML, true) +
      H.panel('Handle · SEO · tags · care',
        '<div class="kv"><span>Handle</span><b class="mono">' + esc(p.handle) + '</b></div>' +
        '<div class="kv"><span>SEO title</span><b>' + esc(p.meta.title) + '</b></div>' +
        '<div class="kv"><span>Meta description</span><b>' + esc(p.meta.desc) + '</b></div>' +
        '<div class="kv"><span>Price</span><b>' + VA.inr(p.price) + ' <span class="hint">(MRP ' + VA.inr(p.mrp) + ')</span></b></div>' +
        '<div style="margin-top:10px"><b style="font-size:12px;color:var(--mut)">TAGS</b><div class="chiprow" style="margin-top:6px">' +
        p.tags.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div></div>') +
      H.panel('Feature highlights', '<ul style="margin-left:18px">' + p.bullets.map(function (b) { return '<li style="margin:5px 0">' + esc(b) + '</li>'; }).join('') + '</ul>') +
      H.panel('FAQ <span class="badge">AIO / SGE</span>', p.faq.map(function (f) {
        return '<div class="kv" style="display:block"><b>' + esc(f.q) + '</b><div class="hint" style="margin-top:3px">' + esc(f.a) + '</div></div>';
      }).join('')) +
      block('SEO blog opener', p.blog, true);
  }
  function socialTab(p) {
    _cnt = 100;
    var carousel = '<ol style="margin-left:18px">' + p.social.carousel.map(function (s) { return '<li style="margin:4px 0">' + esc(s) + '</li>'; }).join('') + '</ol>';
    var reel = p.social.reel.acts.map(function (a) { return '<div class="cl"><span class="d">▸</span><div>' + esc(a) + '</div></div>'; }).join('') +
      '<div class="good"><b>Voiceover (ElevenLabs):</b> ' + esc(p.social.reel.vo) + '</div>';
    return block('Instagram post (caption + 20 hashtags)', p.social.post, true) +
      H.panel('Carousel — 10 slides', carousel) +
      H.panel('Reel / Short — 3 acts', '<div class="cascade">' + reel + '</div>') +
      H.panel('Thumbnails to render', H.table([{ label: 'Ratio', k: 'ratio' }, { label: 'Size', k: 'px', cellcls: 'mono' }, { label: 'Platform', k: 'plat' }], p.thumbs) +
        '<p class="hint" style="margin-top:8px">Build these in <b>Design Studio</b> — the sizes are already there as templates.</p>');
  }
  function videoTab(p) {
    _cnt = 200;
    var scenes = '⏱️ [00:00–00:03] — HOOK\nVisual:      hands open the dupatta, ' + p.work.toLowerCase() + ' catches light\nCamera:      slow push-in\nText Screen: "the colour you are allowed to wear"\nMusic Beat:  soft → drop\nLyric:       (mukhda drops)\n\n' +
      '⏱️ [00:03–00:15] — REVEAL\nVisual:      she turns, flare opens, cut to hem\nCamera:      orbit + tilt down\nMotion:      ' + p.fabric.toLowerCase() + ' moving\nText Screen: NONE\nMusic Beat:  build\n\n' +
      '⏱️ [00:15–00:20] — CTA\nVisual:      full-length, courtyard wide\nText Screen: "Custom-fit · XS–3XL · Crafted in Surat · @vastrangam"\nMusic Beat:  swell → fade';
    return block('Cinematic scene breakdown (30s)', scenes, true) +
      block('Suno song — zero product words', p.suno, true) +
      H.panel('Build it', '<div class="good">Take this straight into <b>Video Studio</b> — the timeline is already sized 9:16, and it exports WebM, GIF and a PNG frame sequence offline.</div>' +
        '<div class="btnrow" style="margin-top:10px"><button class="btn p" data-go="vid">Open Video Studio →</button></div>');
  }
  function adsTab(p) {
    _cnt = 300;
    return H.panel('Three ad angles', p.ads.map(function (a) {
      return '<div class="kv" style="display:block"><b>' + esc(a.angle) + '</b><div class="hint" style="margin-top:3px">' + esc(a.t) + '</div></div>';
    }).join('')) +
      H.panel('Email campaign', '<div class="kv"><span>Subject</span><b>' + esc(p.email.subject) + '</b></div>' +
        '<div class="kv"><span>Preheader</span><b>' + esc(p.email.preheader) + '</b></div>' +
        '<div class="kv" style="display:block"><span>Hero line</span><b>' + esc(p.email.hero) + '</b></div>' +
        '<div class="kv" style="display:block"><span>Body</span><div style="margin-top:3px">' + esc(p.email.body) + '</div></div>' +
        '<div class="kv"><span>CTA</span><b>' + esc(p.email.cta1) + ' · ' + esc(p.email.cta2) + '</b></div>') +
      block('Make / n8n webhook payload (valid JSON)', p.webhook, true);
  }
  function marketTab(p) {
    _cnt = 400;
    var m = p.marketplace;
    return block('Amazon — title', m.amazon.title, true) +
      H.panel('Amazon — 5 bullets + backend keywords', '<ul style="margin-left:18px">' + m.amazon.bullets.map(function (b) { return '<li style="margin:5px 0">' + esc(b) + '</li>'; }).join('') + '</ul>' +
        '<div class="note" style="margin-top:9px"><b>Backend keywords:</b> ' + esc(m.amazon.keywords) + '</div>') +
      block('Flipkart — category attributes', m.flipkart, true) +
      H.panel('Myntra · Ajio · Meesho',
        '<div class="kv" style="display:block"><b>Myntra</b><div class="hint" style="margin-top:3px">' + esc(m.myntra) + '</div></div>' +
        '<div class="kv" style="display:block"><b>Ajio</b><div class="hint" style="margin-top:3px">' + esc(m.ajio) + '</div></div>' +
        '<div class="kv" style="display:block"><b>Meesho</b><div class="hint" style="margin-top:3px">' + esc(m.meesho) + '</div></div>');
  }
  function qaTab(p, run) {
    var pct = p.qa.pct;
    var ring = qaRing(pct);
    var rows = p.qa.checks.map(function (c) {
      return '<div class="kv"><span>' + esc(c.name) + '</span><b>' + (c.ok ? H.tag('pass', 'grn') : H.tag('fail', 'red')) + '</b></div>';
    }).join('');
    return H.panel('QA gate <span class="badge">machine-checkable</span>',
      '<div class="qaring">' + ring + '<div><b style="font-size:15px">' + p.qa.pass + ' of ' + p.qa.total + ' checks pass</b>' +
      '<p class="hint">These run on every generated pack. A fail means the pack should not ship as-is.</p></div></div>' +
      '<div style="margin-top:14px">' + rows + '</div>') +
      H.panel('Uniqueness', '<div class="' + (run.unique && run.unique.unique ? 'good' : 'warn') + '">' + esc(run.unique ? run.unique.note : 'Not checked') + '</div>') +
      H.panel('Voice memory (learns from your edits)', '<div class="cascade">' + DB().voiceMemory.map(function (v) { return '<div class="cl"><span class="d">•</span><div>' + esc(v) + '</div></div>'; }).join('') + '</div>');
  }
  function qaRing(pct) {
    var c = 2 * Math.PI * 30, off = c * (1 - pct / 100);
    var col = pct >= 90 ? '#2E9E6B' : pct >= 70 ? '#C77E28' : '#C0392B';
    return '<svg class="ring" viewBox="0 0 74 74"><circle cx="37" cy="37" r="30" fill="none" stroke="#EDE8F8" stroke-width="8"/>' +
      '<circle cx="37" cy="37" r="30" fill="none" stroke="' + col + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" transform="rotate(-90 37 37)"/>' +
      '<text x="37" y="42" text-anchor="middle" font-size="17" font-weight="800" fill="' + col + '">' + pct + '%</text></svg>';
  }
  function excelTab(p, run) {
    var sheets = VA.buildSheets(p);
    return H.panel('9-sheet Excel export <span class="badge">no blanks</span>',
      '<p class="hint">One workbook, nine sheets — the exact structure from your Phase 11 spec. Written by the built-in spreadsheet engine, so it downloads with the internet off.</p>' +
      H.table([{ label: 'Sheet', fmt: function (s) { return '<b>' + esc(s.name) + '</b>'; } }, { label: 'Rows', fmt: function (s) { return s.rows.length; }, cellcls: 'mono' }, { label: 'Columns', fmt: function (s) { return s.rows[0] ? s.rows[0].length : 0; }, cellcls: 'mono' }],
        sheets) +
      '<div class="btnrow" style="margin-top:12px"><button class="btn p" data-act="dlxlsx" data-id="' + run.id + '"><svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg> Download the 9-sheet .xlsx</button>' +
      '<button class="btn" data-act="dlcsv" data-id="' + run.id + '">Shopify sheet as CSV</button></div>') +
      H.panel('Shopify master — first columns (preview)', H.table(
        (sheets[0].rows[0] || []).slice(0, 6).map(function (h, i) { return { label: h, k: 'c' + i }; }),
        sheets[0].rows.slice(1, 3).map(function (r) { var o = {}; r.slice(0, 6).forEach(function (v, i) { o['c' + i] = String(v).slice(0, 40); }); return o; })));
  }

  /* build the 9 sheets from a pack */
  VA.buildSheets = function (p) {
    var C = LIB.CATS[p.cat];
    var shopHead = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
      'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Variant SKU', 'Variant Price', 'Variant Compare At Price',
      'Variant Inventory Qty', 'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Alt Text',
      'SEO Title', 'SEO Description', 'Status'];
    var shopRow = [p.handle, p.title, p.bodyHTML.replace(/\n/g, ' '), 'Vastrangam', C.cat, p.cat, p.tags.join(', '), 'TRUE',
      C.opt, C.opt === 'Color' ? VA.slug(p.colour) : 's', C.opt === 'Color' ? 'Size' : 'Color', C.opt === 'Color' ? 's' : VA.slug(p.colour),
      C.sku ? p.sku : '', p.price, p.mrp, 25, 'TRUE', 'TRUE', p.sku + '_hero.webp',
      p.colour + ' ' + p.fabric + ' ' + p.cat + ' by Vastrangam', p.meta.title, p.meta.desc, 'active'];
    var m = p.marketplace;
    return [
      { name: 'Shopify Master', rows: [shopHead, shopRow] },
      { name: 'Amazon', rows: [['SKU', 'Title', 'Bullet1', 'Bullet2', 'Bullet3', 'Bullet4', 'Bullet5', 'Backend Keywords', 'Price', 'MRP'],
        [p.sku, m.amazon.title].concat(m.amazon.bullets).concat([m.amazon.keywords, p.price, p.mrp])] },
      { name: 'Flipkart', rows: [['SKU', 'Category', 'Attributes', 'Price', 'MRP', 'Country'], [p.sku, p.cat, m.flipkart, p.price, p.mrp, 'IN']] },
      { name: 'Myntra Ajio Meesho', rows: [['Platform', 'Copy'], ['Myntra', m.myntra], ['Ajio', m.ajio], ['Meesho', m.meesho]] },
      { name: 'Social', rows: [['Format', 'Content'], ['Instagram Post', p.social.post], ['Carousel', p.social.carousel.join(' | ')], ['Reel VO', p.social.reel.vo], ['Hashtags', p.social.hashtags.join(' ')]] },
      { name: 'Video Suno', rows: [['Asset', 'Content'], ['Suno lyrics', p.suno], ['Reel Act 1', p.social.reel.acts[0]], ['Reel Act 2', p.social.reel.acts[1]], ['Reel Act 3', p.social.reel.acts[2]]] },
      { name: 'Ads Email', rows: [['Type', 'Content']].concat(p.ads.map(function (a) { return [a.angle + ' ad', a.t]; })).concat([['Email subject', p.email.subject], ['Email body', p.email.body]]) },
      { name: 'Calendar', rows: [['Date', 'Platform', 'Format', 'Hook', 'Status'],
        [VA.todayISO(), 'instagram', 'Reel', p.social.reel.acts[0].slice(0, 40), 'Draft'],
        [VA.todayISO(), 'shopify', 'Listing', p.title, 'Draft']] },
      { name: 'Webhook', rows: [['Field', 'Value'], ['payload', p.webhook]] }
    ];
  };

  VA.action('dlxlsx', function (b) {
    var run = DB().runs.filter(function (r) { return r.id === b.getAttribute('data-id'); })[0];
    var sheets = {}; VA.buildSheets(run.pack).forEach(function (s) { sheets[s.name] = s.rows; });
    try { VSheet.saveXlsx(run.pack.sku + '-content.xlsx', sheets); VA.toast('9-sheet workbook downloaded'); }
    catch (e) { VA.toast('Download not available here'); }
  });
  VA.action('dlcsv', function (b) {
    var run = DB().runs.filter(function (r) { return r.id === b.getAttribute('data-id'); })[0];
    var rows = VA.buildSheets(run.pack)[0].rows;
    try { VSheet.saveCsv(run.pack.sku + '-shopify.csv', rows); VA.toast('Shopify CSV downloaded'); }
    catch (e) { VA.toast('Download not available here'); }
  });
  VA.action('runmd', function (b) {
    var run = DB().runs.filter(function (r) { return r.id === b.getAttribute('data-id'); })[0];
    var md = VA.runToMarkdown(run.pack);
    var blob = new Blob([md], { type: 'text/markdown' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = run.pack.sku + '-content-pack.md'; a.click();
    VA.toast('Run downloaded as Markdown');
  });
  VA.action('copytext', function (b) {
    var el = VA.$(b.getAttribute('data-id')); if (!el) return;
    var t = el.innerText || el.textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { VA.toast('Copied'); }, function () { VA.toast('Select and copy manually'); });
    else VA.toast('Select and copy manually');
  });
  VA.action('sendtopub', function (b) {
    var run = DB().runs.filter(function (r) { return r.id === b.getAttribute('data-id'); })[0];
    DB().pubDraft = { sku: run.pack.sku, title: run.pack.title }; VA.go('pub'); VA.toast('Loaded into Publisher');
  });

  VA.runToMarkdown = function (p) {
    var L = [];
    L.push('# ' + p.title, '', '**SKU:** ' + p.sku + ' · **Category:** ' + p.cat + ' · **QA:** ' + p.qa.pct + '%', '');
    L.push('## Titles'); Object.keys(p.titles).forEach(function (k) { L.push('- **' + k + ':** ' + p.titles[k]); });
    L.push('', '## Shopify body', '```html', p.bodyHTML, '```', '');
    L.push('**Handle:** `' + p.handle + '`  ', '**SEO title:** ' + p.meta.title + '  ', '**Meta:** ' + p.meta.desc, '');
    L.push('**Tags:** ' + p.tags.join(', '), '');
    L.push('## Instagram post', '', p.social.post, '');
    L.push('## Suno song', '```', p.suno, '```', '');
    L.push('## Marketplaces', '- **Amazon:** ' + p.marketplace.amazon.title, '- **Myntra:** ' + p.marketplace.myntra,
      '- **Ajio:** ' + p.marketplace.ajio, '- **Meesho:** ' + p.marketplace.meesho, '');
    L.push('## Flipkart attributes', '```', p.marketplace.flipkart, '```');
    return L.join('\n');
  };
})();
