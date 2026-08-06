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
    var tabs = [['listing', 'Shopify listing'], ['research', 'Research'], ['social', 'Social'], ['video', 'Video & Suno'],
      ['ads', 'Ads & email'], ['market', 'Marketplaces'], ['plan', 'Plan & scale'], ['qa', 'QA & phases'], ['excel', 'Exports']];
    var out = H.head('Content Engine · ' + p.sku, p.colour + ' ' + p.cat, esc(p.title)) +
      '<div class="btnrow" style="margin-bottom:6px"><button class="btn sm" data-go="ce">← All runs</button>' +
      '<button class="btn sm gold" data-act="sendtopub" data-id="' + run.id + '">Send to Publisher →</button>' +
      '<button class="btn sm" data-act="runmd" data-id="' + run.id + '">Run as .md</button>' +
      '<button class="btn sm" data-act="dlreport" data-id="' + run.id + '">Full report .doc</button>' +
      '<button class="btn sm" data-act="dlplatxlsx" data-id="' + run.id + '">Platform .xlsx</button>' +
      '<button class="btn sm" data-act="dlxlsx" data-id="' + run.id + '">9-sheet .xlsx</button>' +
      '<span style="margin-left:auto"></span>' + H.tag('QA ' + p.qa.pct + '%', p.qa.pct >= 90 ? 'grn' : 'amb') +
      ' ' + H.tag(run.unique && run.unique.unique ? 'unique' : 'check dup', run.unique && run.unique.unique ? 'blu' : 'amb') + '</div>' +
      stageBar(run, p) +
      '<div class="chiprow" style="margin:12px 0 16px">' + tabs.map(function (t) {
        return '<button class="chip' + (tab === t[0] ? ' on' : '') + '" data-act="runtab" data-t="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>';

    if (tab === 'listing') out += listingTab(p);
    else if (tab === 'research') out += researchTab(p);
    else if (tab === 'social') out += socialTab(p);
    else if (tab === 'video') out += videoTab(p);
    else if (tab === 'ads') out += adsTab(p);
    else if (tab === 'market') out += marketTab(p);
    else if (tab === 'plan') out += planTab(p);
    else if (tab === 'qa') out += qaTab(p, run);
    else if (tab === 'excel') out += excelTab(p, run);
    return out;
  });

  /* live progress while the phases run, and the depth switch once they have finished */
  function stageBar(run, p) {
    var log = p.phaseLog || [];
    if (run.stage && run.stage !== 'done' && run.stage !== 'draft') {
      var done = log.filter(function (r) { return r.state === 'done' || r.state === 'failed'; }).length;
      return '<div class="panel" style="padding:12px"><b>' + esc(run.stage) + '</b>' +
        '<div style="height:7px;border-radius:4px;background:var(--line);margin-top:8px;overflow:hidden">' +
        '<div style="height:100%;width:' + (log.length ? Math.round(done / log.length * 100) : 5) + '%;background:linear-gradient(90deg,#5B2D8E,#C9A227);transition:width .4s"></div></div>' +
        '<p class="hint" style="margin-top:6px">Each phase is its own call, and each one reads what the phases before it found. Leave this open — it fills in as it goes.</p></div>';
    }
    return '<div class="btnrow" style="margin-bottom:4px"><span class="hint" style="align-self:center">Depth:</span>' +
      Object.keys(VDEEP.DEPTHS).map(function (k) {
        return '<button class="btn sm' + (run.depth === k ? ' p' : '') + '" data-act="rundeepen" data-id="' + run.id + '" data-d="' + k + '">' +
          VDEEP.DEPTHS[k].label + ' · ' + VDEEP.DEPTHS[k].calls + '</button>';
      }).join('') +
      (log.length ? '<span class="hint" style="align-self:center;margin-left:6px">' +
        log.filter(function (r) { return r.state === 'done'; }).length + '/' + log.length + ' phases written</span>' : '') + '</div>';
  }
  /* the 30 planned days become 30 real calendar entries, dated from today */
  VA.action('cal2pub', function (b) {
    var run = DB().runs.filter(function (r) { return r.id === b.getAttribute('data-id'); })[0];
    var days = run && run.pack.deep && run.pack.deep.calendar;
    if (!days || !days.length) { VA.toast('Run at Deep depth first'); return; }
    var t0 = new Date();
    days.forEach(function (x) {
      var dt = new Date(t0.getTime() + (x.day - 1) * 86400000);
      DB().calendar.push({
        id: VA.uid('c'), date: dt.toISOString().slice(0, 10), platform: x.channel, format: x.format,
        hook: x.hook, caption: x.caption || '', product: run.pack.sku, status: 'Scheduled'
      });
    });
    VA.save(); VA.toast(days.length + ' days scheduled'); VA.go('pub');
  });

  VA.action('rundeepen', function (b) {
    var run = DB().runs.filter(function (r) { return r.id === b.getAttribute('data-id'); })[0];
    if (run) VA.CE.deepen(run, b.getAttribute('data-d'));
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
  /* ── Research ── everything the grounded phases actually found, with the live URLs ── */
  function researchTab(p) {
    _cnt = 600;
    var d = p.deep || {};
    if (!d.psych && !d.market && !d.keywords) {
      return H.panel('No research on this run yet',
        '<div class="warn">This pack was written offline. Pick <b>Standard</b> or <b>Deep</b> above and the engine will search the live market — real sellers, real prices, real URLs.</div>');
    }
    var src = (p.sources || []).length
      ? H.panel('Sources the model actually opened <span class="badge">' + p.sources.length + '</span>',
          '<div class="cascade">' + p.sources.map(function (s) {
            return '<div class="cl"><span class="d">↗</span><div><a href="' + esc(s.uri) + '" target="_blank" rel="noopener">' +
              esc(s.title || s.uri) + '</a></div></div>';
          }).join('') + '</div><p class="hint" style="margin-top:8px">These are the pages Google Search grounding returned during this run. Open one to check a price yourself.</p>')
      : '';
    return (d.market ? block('Market and competitor teardown', d.market, true) : '') +
      (d.psych ? block('Buyer psychology — what she is really afraid of', d.psych, true) : '') +
      (d.keywords ? block('Search and AEO targets', d.keywords, true) : '') +
      (d.hooks ? H.panel('Viral hooks <span class="badge">' + d.hooks.length + '</span>',
        H.table([{ label: 'Hook', fmt: function (h) { return '<b>' + esc(h.line) + '</b>'; } },
                 { label: 'Why it works', fmt: function (h) { return esc(h.why); } },
                 { label: 'Use it on', fmt: function (h) { return H.tag(h.use, 'blu'); } }], d.hooks)) : '') +
      (d.dna ? H.panel('Content DNA — the voice for this product',
        '<div class="good">' + esc(d.dna.voice) + '</div>' +
        '<div style="margin-top:10px"><b style="font-size:12px;color:var(--mut)">SENTENCE SHAPES THAT BELONG TO THIS BRAND</b><ul style="margin:6px 0 0 18px">' +
        (d.dna.signatures || []).map(function (s) { return '<li style="margin:4px 0">' + esc(s) + '</li>'; }).join('') + '</ul></div>' +
        ((d.dna.avoid || []).length ? '<div class="warn" style="margin-top:10px"><b>Never says:</b> ' + esc(d.dna.avoid.join(' · ')) + '</div>' : '')) : '') +
      src;
  }

  /* ── Plan & scale ── the 30-day calendar, the multiplied assets, the size-chart words ── */
  function planTab(p) {
    _cnt = 700;
    var d = p.deep || {};
    if (!d.calendar && !d.scale && !d.size) {
      return H.panel('Nothing planned yet',
        '<div class="warn">The 30-day calendar, the 15 multiplied assets and the size-chart copy are written at <b>Deep</b> depth. Switch depth above and run it again.</div>');
    }
    return (d.calendar ? H.panel('30-day calendar <span class="badge">' + d.calendar.length + ' days</span>',
      H.table([{ label: 'Day', fmt: function (r) { return '<b>' + r.day + '</b>'; }, cellcls: 'mono' },
               { label: 'Channel', fmt: function (r) { return H.tag(r.channel, 'blu'); } },
               { label: 'Format', k: 'format' },
               { label: 'Hook', fmt: function (r) { return '<b>' + esc(r.hook) + '</b>'; } },
               { label: 'Caption', fmt: function (r) { return '<span class="hint">' + esc(r.caption || '') + '</span>'; } }], d.calendar) +
      '<div class="btnrow" style="margin-top:10px"><button class="btn sm p" data-act="cal2pub" data-id="' + (DB().openRun || '') + '">Send all ' + d.calendar.length + ' to the Publisher calendar</button></div>') : '') +
      (d.scale ? H.panel('Scale engine <span class="badge">' + d.scale.length + ' assets</span>',
        d.scale.map(function (a) {
          return '<div class="kv" style="display:block"><b>' + esc(a.kind) + '</b>' +
            '<div style="margin-top:3px">' + esc(a.text) + '</div>' +
            (a.note ? '<div class="hint" style="margin-top:2px">' + esc(a.note) + '</div>' : '') + '</div>';
        }).join('')) : '') +
      (d.size ? H.panel('Size chart copy <span class="hint">the numbers stay exactly as they are</span>',
        '<div class="good">' + esc(d.size.intro) + '</div>' +
        ((d.size.help || []).length ? '<ul style="margin:10px 0 0 18px">' + d.size.help.map(function (h) { return '<li style="margin:4px 0">' + esc(h) + '</li>'; }).join('') + '</ul>' : '') +
        '<div class="note" style="margin-top:10px"><b>' + esc(d.size.cta) + '</b></div>') : '') +
      (d.whenWhere ? block('When and where she wears this', d.whenWhere, true) : '');
  }

  function socialTab(p) {
    _cnt = 100;
    var carousel = '<ol style="margin-left:18px">' + p.social.carousel.map(function (s) { return '<li style="margin:4px 0">' + esc(s) + '</li>'; }).join('') + '</ol>';
    var reel = p.social.reel.acts.map(function (a) { return '<div class="cl"><span class="d">▸</span><div>' + esc(a) + '</div></div>'; }).join('') +
      '<div class="good"><b>Voiceover (ElevenLabs):</b> ' + esc(p.social.reel.vo) + '</div>';
    return block('Instagram post (caption + 20 hashtags)', p.social.post, true) +
      H.panel('Carousel — 10 slides', carousel) +
      H.panel('Reel / Short — 3 acts', '<div class="cascade">' + reel + '</div>') +
      ((p.deep && p.deep.storyPolls) ? H.panel('Story stickers', '<div class="cascade">' +
        p.deep.storyPolls.map(function (s) { return '<div class="cl"><span class="d">?</span><div>' + esc(s) + '</div></div>'; }).join('') + '</div>') : '') +
      H.panel('Thumbnails to render <span class="hint">sizes fixed, words written</span>',
        H.table([{ label: 'Ratio', k: 'ratio' }, { label: 'Size', k: 'px', cellcls: 'mono' }, { label: 'Platform', k: 'plat' },
                 { label: 'Overlay', fmt: function (t) { return t.line1 ? '<b>' + esc(t.line1) + '</b>' + (t.line2 ? '<div class="hint">' + esc(t.line2) + '</div>' : '') : '<span class="hint">run Deep to write these</span>'; } }], p.thumbs) +
        '<p class="hint" style="margin-top:8px">Build these in <b>Design Studio</b> — the sizes are already there as templates.</p>');
  }
  function videoTab(p) {
    _cnt = 200;
    var v = p.deep && p.deep.video;
    var scenes = v
      ? (v.logline ? 'LOGLINE — ' + v.logline + '\n\n' : '') +
        (v.scenes || []).map(function (s) {
          return '⏱️ [' + s.tc + ']\nVisual:      ' + s.shot + '\nBeat:        ' + s.beat +
            '\nText Screen: ' + (s.onScreen || 'NONE');
        }).join('\n\n') + (v.endCard ? '\n\nEND CARD — ' + v.endCard : '')
      : '⏱️ [00:00–00:03] — HOOK\nVisual:      hands open the dupatta, ' + p.work.toLowerCase() + ' catches light\nCamera:      slow push-in\nText Screen: "the colour you are allowed to wear"\nMusic Beat:  soft → drop\nLyric:       (mukhda drops)\n\n' +
        '⏱️ [00:03–00:15] — REVEAL\nVisual:      she turns, flare opens, cut to hem\nCamera:      orbit + tilt down\nMotion:      ' + p.fabric.toLowerCase() + ' moving\nText Screen: NONE\nMusic Beat:  build\n\n' +
        '⏱️ [00:15–00:20] — CTA\nVisual:      full-length, courtyard wide\nText Screen: "Custom-fit · XS–3XL · Crafted in Surat · @vastrangam"\nMusic Beat:  swell → fade';
    return block('Cinematic scene breakdown (30s)' + (v ? '' : ' — built-in draft'), scenes, true) +
      block('Suno song — zero product words', p.suno, true) +
      ((p.deep && p.deep.sunoEnglish) ? H.panel('What the lyrics say', '<div class="hint">' + esc(p.deep.sunoEnglish) + '</div>') : '') +
      ((p.deep && p.deep.sunoRejected) ? H.panel('Lyrics rejected', '<div class="warn">' + esc(p.deep.sunoRejected) + '</div>') : '') +
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
      phasePanel(p) +
      H.panel('Voice memory (learns from your edits)', '<div class="cascade">' + DB().voiceMemory.map(function (v) { return '<div class="cl"><span class="d">•</span><div>' + esc(v) + '</div></div>'; }).join('') + '</div>');
  }

  /* The humanization table, with what each phase did on THIS run. The two right-hand columns
     are the contract: the model writes the left one, the engine owns the right one. */
  function phasePanel(p) {
    var log = {}, ran = p.phaseLog || [];
    ran.forEach(function (r) { log[r.label] = r; });
    var rows = VDEEP.TABLE.map(function (t) {
      var r = log[t[1]] || null;
      return { n: t[0], label: t[1], human: t[2], struct: t[3], state: r ? r.state : 'offline', note: r ? (r.note || '') : '' };
    });
    return H.panel('The 16 phases <span class="badge">' + ran.filter(function (r) { return r.state === 'done'; }).length + ' written this run</span>',
      '<p class="hint" style="margin-bottom:10px">The left column is what a model is allowed to write. The right column is generated by the engine and never handed to a model — that is what keeps the character limits, prices, HSN codes and filenames correct.</p>' +
      H.table([
        { label: '#', k: 'n', cellcls: 'mono' },
        { label: 'Phase', fmt: function (r) { return '<b>' + esc(r.label) + '</b>'; } },
        { label: 'Humanized', fmt: function (r) { return esc(r.human); } },
        { label: 'Stays structured', fmt: function (r) { return '<span class="hint">' + esc(r.struct) + '</span>'; } },
        { label: 'This run', fmt: function (r) {
          if (r.state === 'done') return H.tag('written ' + r.note, 'grn');
          if (r.state === 'failed') return H.tag('failed', 'red') + '<div class="hint">' + esc(r.note) + '</div>';
          if (r.state === 'running') return H.tag('running…', 'blu');
          if (r.state === 'waiting') return H.tag('queued', 'amb');
          return '<span class="hint">built-in copy</span>';
        } }
      ], rows));
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
    var plat = VA.ANALYSIS.platformSheets(p);
    return H.panel('Upload-ready workbook <span class="badge">one sheet per platform</span>',
      '<p class="hint">This is the file you upload. Sheet 1 is the Shopify import in its 61 columns; every other sheet is a single marketplace in that marketplace\'s own column order, sized across XS–3XL for each colourway. No sheet mixes two platforms, because no platform accepts a mixed file.</p>' +
      H.table([{ label: 'Sheet', fmt: function (s) { return '<b>' + esc(s.name) + '</b>'; } },
               { label: 'Rows', fmt: function (s) { return s.rows.length - 1; }, cellcls: 'mono' },
               { label: 'Columns', fmt: function (s) { return s.rows[0] ? s.rows[0].length : 0; }, cellcls: 'mono' }], plat) +
      '<div class="btnrow" style="margin-top:12px"><button class="btn p" data-act="dlplatxlsx" data-id="' + run.id + '">Download the platform .xlsx</button>' +
      '<button class="btn" data-act="dlcsv" data-id="' + run.id + '">Shopify sheet as CSV</button></div>') +
      H.panel('The full report <span class="badge">14 sections, editable</span>',
        '<p class="hint">The same fourteen sections as your Product Content Report — executive summary, product analysis, persona, buyer psychology, story, SEO, listings for all five platforms, social kit, ads, marketplace assets, creative prompts, growth calendar, Suno lyrics and the 30-second script. It opens in Word, Google Docs or Pages and every paragraph is editable.</p>' +
        '<div class="btnrow" style="margin-top:10px"><button class="btn p" data-act="dlreport" data-id="' + run.id + '">Download the 14-section report .doc</button>' +
        '<button class="btn" data-act="dldoc" data-id="' + run.id + '">Market analysis only .doc</button>' +
        '<button class="btn" data-act="runmd" data-id="' + run.id + '">Everything as .md</button></div>') +
      H.panel('9-sheet Excel export <span class="badge">no blanks</span>',
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
    /* Sheet 1 is the real 61-column Shopify master — one row for the product, then one
       row per extra image, exactly as a Shopify import expects. */
    var specRows = (p.variants && p.variants.length) ? VSPEC.rowsVariants(p, p.variants) : VSPEC.rows(p, p.shots);
    var shopSheet = [VSPEC.COLS].concat(specRows.map(function (r) {
      return VSPEC.COLS.map(function (c) { return String(r[c] == null ? '' : r[c]).replace(/\n/g, ' '); });
    }));
    var m = p.marketplace;
    return [
      { name: 'Shopify Master', rows: shopSheet },
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
