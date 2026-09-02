/* ═══════════ Vastrangam AI Engine — the deep 14-phase research + humanization run ═══════════

   The old run made two calls: one research, one rewrite. That is why the output read like a
   catalogue — one model pass cannot do buyer psychology, competitor teardown, hooks, listing
   prose, social, ads, video, lyrics and five marketplaces at the same depth. It averages.

   This runs each phase as its OWN call, on its own prompt, building on the phases before it.
   Depth is chosen per product:

     Quick     · 2 calls   · one grounded research pass + one prose rewrite (the old behaviour)
     Standard  · 7 calls   · psychology, market, hooks, listing, social, marketplace
     Deep      · 16 calls  · every phase in the table, each written separately

   The humanization table decides what each phase is allowed to touch. Free prose is written by
   the model under the LAW below; the structured half — tags, meta, specs, timecodes, prices,
   attribute schema, filenames — is generated offline and never handed to the model to "improve",
   because that is exactly where models drift and break the QA gate. */
(function () {
  'use strict';

  /* ── THE LAW ──────────────────────────────────────────────────────────────────────
     Injected into every prompt that writes prose. Written as rules a sub-editor would
     give, not as adjectives, because "be human" produces the opposite. */
  var LAW = [
    'HOW TO WRITE (this is a house style, not a suggestion — copy that breaks it is rejected):',
    '• One person telling another something true. A short sentence. Then a longer one that earns it.',
    '• Every paragraph carries one concrete detail only somebody who handled the garment would write —',
    '  a weight, a hem, a way it moves under light, what it does when she sits down.',
    '• Never open with the product noun (saree, lehenga, anarkali, kurti, gown, dress, suit, outfit, ensemble).',
    '• Never open with a rhetorical question, and never open with "Introducing".',
    '• Banned outright, in any form: elevate your, must-have, look no further, in today\'s world, unleash,',
    '  game-changer, dive into, tapestry, a testament to, nestled, boasts, seamless, curated for the modern',
    '  woman, embark, delve, in the realm of, when it comes to, unlock, moreover, furthermore, in conclusion,',
    '  it\'s worth noting, "not just X, but Y", "whether you\'re X or Y".',
    '• No three-adjective stacks. No exclamation marks except inside a quoted line of dialogue.',
    '• Indian English written for an Indian buyer. Rupees, WhatsApp, dispatch, stitching — not "shipping".',
    '• Say the true specific thing instead of the grand vague one. "Sits 2 inches above the ankle" beats "perfect length".',
    'STRUCTURED FIELDS are given to you already correct. Do not rewrite, reorder or embellish them.'
  ].join('\n');

  /* the humanization table exactly as specified — this is also what the UI shows */
  var TABLE = [
    ['0', 'Buyer Psychology', 'The way pain-points and desires are phrased', 'segment tags'],
    ['1', 'Market Intelligence', 'Competitor "why they win" narrative', 'the comparison table'],
    ['2', 'Viral Hooks', 'Every hook — real, specific, scroll-stopping', '—'],
    ['3', 'Content DNA', 'Voice templates rewritten to sound spoken', '—'],
    ['4', 'Product Content', 'HTML description paragraphs, FAQ answers, "when and where"', 'specs table, tags, meta'],
    ['4C', 'Social', 'All captions, all 8 slides, all scripts', 'hashtag list'],
    ['4D', 'Thumbnails', 'Overlay text lines', 'dimensions'],
    ['5', 'Ad Variations', 'Every primary text, headline, hook', 'funnel labels'],
    ['6', 'Cinematic Video', 'On-screen text and emotional beats', 'timecodes'],
    ['7', 'Suno Music', 'Lyrics (banned-word law)', 'style tags'],
    ['8', 'Marketplace', 'Amazon bullets, Myntra/Ajio descriptions', 'attribute schema, HSN, size'],
    ['9', 'Scale Engine', 'Every asset it multiplies', 'counts'],
    ['10', 'Calendar', 'Caption and hook columns', 'date, time, status'],
    ['11', 'Excel Sheets', 'Any free-text cell', 'IDs, prices, dimensions'],
    ['12', 'Size Chart', 'The intro and CTA line only', 'the measurement numbers'],
    ['13', 'SKU Metadata', 'Alt-text readability', 'filename, SKU']
  ];

  var DEPTHS = {
    quick: { label: 'Quick', note: 'The market teardown and the listing prose. About a minute.' },
    standard: { label: 'Standard', note: 'Psychology, market, hooks, listing, social and the five marketplaces. Three to four minutes.' },
    deep: { label: 'Deep', note: 'Every phase in the table written separately, each one building on the last. Eight to twelve minutes.' }
  };

  function facts(p) {
    return 'PRODUCT\n' +
      '· ' + p.colour + ' ' + p.fabric + ' ' + p.cat + ', ' + p.work + ' work\n' +
      '· For: ' + String(p.occ).replace(/-/g, ' ') + '\n' +
      '· Price ' + VA.inr(p.price) + ' against an MRP of ' + VA.inr(p.mrp) + '\n' +
      '· ' + p.dims + '; custom-stitched XS–3XL at no extra charge\n' +
      '· Seller: Vastrangam, Surat. Dispatch within the week. Dry clean only.\n' +
      (p.variants && p.variants.length ? '· Colourways in this listing: ' + p.variants.map(function (v) { return v.colour; }).join(', ') + '\n' : '') +
      (p.userNotes ? '· What the seller told us: ' + p.userNotes + '\n' : '');
  }
  function carry(p, keys) {
    var d = p.deep || {}, out = [];
    keys.forEach(function (k) {
      var v = d[k];
      if (!v) return;
      out.push('── ' + k.toUpperCase() + ' (established earlier in this run, build on it, do not contradict it)\n' +
        (typeof v === 'string' ? v : JSON.stringify(v)).slice(0, 2200));
    });
    return out.join('\n\n');
  }

  /* ── THE PHASES ───────────────────────────────────────────────────────────────────
     grounded:true sends the prompt through Google Search grounding, so competitors and
     prices are real and come back with URLs. The rest are structured JSON calls. */
  var PHASES = [
    {
      id: 'psych', n: '0', label: 'Buyer Psychology', min: 'standard', grounded: true,
      human: 'pain-points and desires', struct: 'segment tags',
      ask: function (p) {
        return 'Search the live web for how Indian women actually talk about buying ' + p.cat.toLowerCase() +
          ' for a ' + String(p.occ).replace(/-/g, ' ') + ' — Reddit, forums, YouTube comments, review sections, blogs.\n\n' + facts(p) + '\n' +
          'Report what you FOUND, not what you assume:\n' +
          '1. SEGMENT — who she is, her age band, city tier, what she spends on one outfit.\n' +
          '2. THE FIVE PAINS — in her own words where you can quote them. The fit fear, the price fear, the ' +
          '"will I look like I am trying too hard" fear, and two more you actually found.\n' +
          '3. THE DESIRE UNDER THE DESIRE — what she is really buying. Not "an outfit".\n' +
          '4. THE OBJECTION THAT KILLS THE SALE — the last thing she thinks before closing the tab.\n' +
          '5. TRIGGER WORDS — the phrases that made people in those threads say "I need this".\n\n' + LAW;
      },
      apply: function (p, r) { p.deep.psych = r.text; pushSrc(p, r.sources); }
    },
    {
      id: 'market', n: '1', label: 'Market Intelligence', min: 'quick', grounded: true,
      human: 'the "why they win" narrative', struct: 'the comparison table',
      ask: function (p) {
        return 'Search the live web right now and give me a real competitor teardown for this product.\n\n' + facts(p) + '\n' +
          'You must NAME REAL SELLERS with real listings. Never invent one. If you cannot verify a seller, say so.\n\n' +
          '1. PRICE BAND — what this exact kind of piece actually sells for today across Amazon, Myntra, Flipkart, Ajio, Meesho and independent sites. Give the numbers you found.\n' +
          '2. SIX COMPETITORS — for each: seller name, the site, their price, their exact listing title, and in one honest sentence WHY THEY WIN. Not a summary — the mechanism.\n' +
          '3. WHAT ALL SIX GET WRONG — the specific thing missing from every one of those listings.\n' +
          '4. THE GAP VASTRANGAM OWNS — one sentence, and it must be defensible with custom-fit XS–3XL, Surat manufacture and same-week dispatch.\n' +
          '5. THE PRICE STORY — how to justify ' + VA.inr(p.price) + ' against what you found.\n\n' + LAW;
      },
      apply: function (p, r) { p.deep.market = r.text; pushSrc(p, r.sources); }
    },
    {
      id: 'keywords', n: '1b', label: 'Search & AEO targets', min: 'deep', grounded: true,
      human: 'the question phrasing', struct: 'the keyword list',
      ask: function (p) {
        return 'Search and report the REAL search behaviour around this product in India.\n\n' + facts(p) + '\n' +
          '1. PRIMARY KEYWORD — the one phrase this listing should own, with the reason.\n' +
          '2. TWELVE LONG-TAIL PHRASES people actually type, ordered by how winnable they are for a small Surat seller.\n' +
          '3. SIX VOICE AND AI-OVERVIEW QUESTIONS — full questions as spoken ("what should I wear to a mehendi if I am not the bride").\n' +
          '4. THE PHRASES TO AVOID because the big marketplaces already own them outright.\n' +
          '5. SEASONALITY — when demand for this peaks in the Indian calendar.\n\n' + LAW;
      },
      apply: function (p, r) { p.deep.keywords = r.text; pushSrc(p, r.sources); }
    },
    {
      id: 'hooks', n: '2', label: 'Viral Hooks', min: 'standard',
      human: 'every hook', struct: '—',
      schema: {
        type: 'object',
        properties: {
          hooks: { type: 'array', items: { type: 'object', properties: {
            line: { type: 'string' }, why: { type: 'string' }, use: { type: 'string' } },
            required: ['line', 'why', 'use'] } }
        }, required: ['hooks']
      },
      ask: function (p) {
        return 'Write 12 opening hooks for this product. A hook is the first 6 to 12 words — the thing that stops a thumb.\n\n' +
          facts(p) + '\n' + carry(p, ['psych', 'market']) + '\n\n' +
          'Rules for hooks specifically:\n' +
          '• Each one must be a sentence a real person would say out loud.\n' +
          '• At least four must come straight out of the pains found above.\n' +
          '• No hook may contain the product noun.\n' +
          '• No two may share an opening word.\n' +
          '• "why" says in one line what tension it opens. "use" is one of: reel, carousel, ad, listing, email, thumbnail.\n\n' + LAW;
      },
      apply: function (p, a) { if (a && a.hooks) p.deep.hooks = a.hooks.slice(0, 12); }
    },
    {
      id: 'dna', n: '3', label: 'Content DNA', min: 'deep',
      human: 'voice templates, spoken', struct: '—',
      schema: {
        type: 'object',
        properties: {
          voice: { type: 'string' }, avoid: { type: 'array', items: { type: 'string' } },
          signatures: { type: 'array', items: { type: 'string' } },
          openers: { type: 'array', items: { type: 'string' } },
          closers: { type: 'array', items: { type: 'string' } }
        }, required: ['voice', 'signatures']
      },
      ask: function (p) {
        return 'Define the voice this whole run will be written in, for this specific product and this specific buyer.\n\n' +
          facts(p) + '\n' + carry(p, ['psych']) + '\n\n' +
          '· voice: one paragraph a copywriter could follow, describing how this brand sounds when it talks about THIS piece.\n' +
          '· signatures: 6 sentence shapes that belong to this brand — write them as real example sentences about this product, not as patterns.\n' +
          '· openers: 5 ways to start a paragraph that are not the product noun and not a question.\n' +
          '· closers: 5 ways to end without a call to action shout.\n' +
          '· avoid: 8 things this brand never says.\n\n' + LAW;
      },
      apply: function (p, a) { if (a) p.deep.dna = a; }
    },
    {
      id: 'listing', n: '4', label: 'Product Content', min: 'quick',
      human: 'description paragraphs, FAQ answers, when and where', struct: 'specs table, tags, meta',
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '60 to 80 characters, Title Case' },
          seoTitle: { type: 'string', description: '60 characters or fewer, ending "| Vastrangam"' },
          seoDescription: { type: 'string', description: 'between 150 and 160 characters' },
          opening: { type: 'string', description: 'first paragraph, 45 to 70 words, must not begin with the product noun' },
          second: { type: 'string', description: 'second paragraph about the craft and the fabric, 45 to 70 words' },
          whenWhere: { type: 'string', description: 'one paragraph: exactly when and where she wears this, and when she should not' },
          bullets: { type: 'array', items: { type: 'string' }, description: 'exactly 5 feature bullets' },
          faq: { type: 'array', items: { type: 'object', properties: { q: { type: 'string' }, a: { type: 'string' } }, required: ['q', 'a'] }, description: '6 questions a real buyer asks, answered plainly' },
          blog: { type: 'string', description: '180 words opening a blog post on this' }
        }, required: ['title', 'seoTitle', 'seoDescription', 'opening', 'second', 'bullets', 'faq']
      },
      ask: function (p) {
        return 'Write the listing prose for this product. This is the page that has to rank and convert.\n\n' +
          facts(p) + '\n' + carry(p, ['psych', 'market', 'keywords', 'dna', 'hooks']) + '\n\n' +
          'MACHINE-CHECKED LIMITS — a violation is a failure, count the characters:\n' +
          '• title 60–80 characters. • seoTitle 60 maximum. • seoDescription 150–160.\n' +
          '• opening must not start with the product noun, and must not repeat any competitor\'s angle from above.\n' +
          '• Every FAQ answer under 45 words, and answer the actual question in the first sentence.\n' +
          '• The five bullets each carry a number or a named material. No bullet may be an adjective sentence.\n' +
          '• Answer the gap identified above — that is the entire point of this listing.\n\n' + LAW;
      },
      apply: function (p, a) { applyListing(p, a); }
    },
    {
      id: 'social', n: '4C', label: 'Social kit', min: 'standard',
      human: 'captions, 8 slides, scripts', struct: 'hashtag list',
      schema: {
        type: 'object',
        properties: {
          caption: { type: 'string', description: 'Instagram caption, 60 to 110 words, no hashtags' },
          carousel: { type: 'array', items: { type: 'object', properties: {
            slide: { type: 'string', description: 'the on-slide headline, 8 words maximum' },
            body: { type: 'string', description: 'the supporting line, 20 words maximum' } }, required: ['slide', 'body'] },
            description: 'exactly 8 slides, a real story arc' },
          reel: { type: 'array', items: { type: 'string' }, description: '3 shot directions, each starting with its timecode' },
          vo: { type: 'string', description: 'the voiceover, under 45 words, spoken rhythm' },
          storyPolls: { type: 'array', items: { type: 'string' }, description: '3 Instagram story poll or question stickers' }
        }, required: ['caption', 'carousel', 'reel', 'vo']
      },
      ask: function (p) {
        return 'Write the social kit. The hashtag list is already fixed and is NOT yours to write.\n\n' +
          facts(p) + '\n' + carry(p, ['psych', 'hooks', 'dna']) + '\n\n' +
          '• The caption opens on one of the hooks above, then earns it. It never announces a product.\n' +
          '• The 8 carousel slides are a story: tension → refusal → reveal → craft → styling → proof → price → close.\n' +
          '  Slide text is what a person reads in under a second. No slide repeats another slide\'s verb.\n' +
          '• The reel is three shots with timecodes 0–3s, 3–15s, 15–20s. Describe what the camera sees, not the mood.\n' +
          '• The voiceover must sound like it was spoken, not read. Contractions. Uneven line lengths.\n\n' + LAW;
      },
      apply: function (p, a) {
        if (!a) return;
        if (a.caption) p.social.post = a.caption + '\n\n' + p.social.hashtags.join(' ');
        if (a.carousel && a.carousel.length >= 8) {
          p.social.carousel = a.carousel.slice(0, 8).map(function (s, i) {
            return (i + 1) + ' · ' + s.slide + ' — ' + s.body + (i === 0 ? ' ' + p.social.hashtags.join(' ') : '');
          });
        }
        if (a.reel && a.reel.length) p.social.reel.acts = a.reel.slice(0, 3);
        if (a.vo) p.social.reel.vo = a.vo;
        if (a.storyPolls) p.deep.storyPolls = a.storyPolls;
      }
    },
    {
      id: 'thumbs', n: '4D', label: 'Thumbnail overlays', min: 'deep',
      human: 'overlay text lines', struct: 'dimensions',
      schema: {
        type: 'object',
        properties: { overlays: { type: 'array', items: { type: 'object', properties: {
          plat: { type: 'string' }, line1: { type: 'string' }, line2: { type: 'string' } },
          required: ['plat', 'line1'] } } }, required: ['overlays']
      },
      ask: function (p) {
        return 'Write the text that goes ON the thumbnail images. The sizes are fixed and are not yours to change: ' +
          p.thumbs.map(function (t) { return t.plat + ' ' + t.px; }).join(', ') + '.\n\n' +
          facts(p) + '\n' + carry(p, ['hooks']) + '\n\n' +
          '• line1 is at most 4 words and must be legible at thumbnail size on a phone.\n' +
          '• line2 is optional, at most 6 words, and must add information rather than repeat line1.\n' +
          '• Never put the price on a YouTube thumbnail. Never put more than 7 words total on a Reel cover.\n\n' + LAW;
      },
      apply: function (p, a) {
        if (!a || !a.overlays) return;
        p.thumbs = p.thumbs.map(function (t, i) {
          var o = a.overlays[i] || {};
          return { ratio: t.ratio, px: t.px, plat: t.plat, line1: o.line1 || '', line2: o.line2 || '' };
        });
      }
    },
    {
      id: 'ads', n: '5', label: 'Ad Variations', min: 'deep',
      human: 'primary text, headline, hook', struct: 'funnel labels',
      schema: {
        type: 'object',
        properties: { ads: { type: 'array', items: { type: 'object', properties: {
          funnel: { type: 'string', description: 'exactly one of: TOF, MOF, BOF' },
          angle: { type: 'string' }, primary: { type: 'string', description: 'primary text, 40 to 90 words' },
          headline: { type: 'string', description: '40 characters maximum' },
          desc: { type: 'string', description: '30 characters maximum' } },
          required: ['funnel', 'angle', 'primary', 'headline'] } } }, required: ['ads']
      },
      ask: function (p) {
        return 'Write 6 Meta ad variations — 2 top of funnel, 2 middle, 2 bottom. The funnel labels are fixed.\n\n' +
          facts(p) + '\n' + carry(p, ['psych', 'market', 'hooks']) + '\n\n' +
          '• TOF sells the tension, never the product. MOF sells the proof and the fit. BOF sells the price and the deadline.\n' +
          '• The headline is 40 characters maximum. Count them.\n' +
          '• No two ads may open with the same word, and none may open with the product noun.\n' +
          '• Every claim must be one we can defend: custom-fit XS–3XL, Surat manufacture, same-week dispatch, dry clean only.\n\n' + LAW;
      },
      apply: function (p, a) {
        if (!a || !a.ads || !a.ads.length) return;
        p.deep.ads = a.ads;
        p.ads = a.ads.map(function (x) { return { angle: x.funnel + ' · ' + x.angle, t: x.primary + '\n\n▸ ' + x.headline + (x.desc ? ' — ' + x.desc : '') }; });
      }
    },
    {
      id: 'video', n: '6', label: 'Cinematic Video', min: 'deep',
      human: 'on-screen text and emotional beats', struct: 'timecodes',
      schema: {
        type: 'object',
        properties: {
          logline: { type: 'string' },
          scenes: { type: 'array', items: { type: 'object', properties: {
            tc: { type: 'string', description: 'the timecode, e.g. 00:00–00:04' },
            shot: { type: 'string', description: 'what the camera sees' },
            beat: { type: 'string', description: 'the emotional beat' },
            onScreen: { type: 'string', description: 'the words burned on screen, 6 words maximum' } },
            required: ['tc', 'shot', 'beat'] } },
          endCard: { type: 'string' }
        }, required: ['logline', 'scenes']
      },
      ask: function (p) {
        return 'Write a 30-second cinematic script. The timecodes are fixed: 00:00–00:04, 00:04–00:10, 00:10–00:17, 00:17–00:24, 00:24–00:30.\n\n' +
          facts(p) + '\n' + carry(p, ['psych', 'dna']) + '\n\n' +
          '• There is a person in this film and something changes for her. No mood-board montage.\n' +
          '• "shot" is what a camera operator could execute: lens distance, movement, what is in frame.\n' +
          '• "beat" is what the viewer feels at that second, in four words or fewer.\n' +
          '• On-screen words are 6 maximum and never repeat the voiceover.\n' +
          '• The end card carries the brand and one reason, nothing else.\n\n' + LAW;
      },
      apply: function (p, a) { if (a) p.deep.video = a; }
    },
    {
      id: 'suno', n: '7', label: 'Suno lyrics', min: 'deep',
      human: 'the lyrics', struct: 'style tags',
      schema: {
        type: 'object',
        properties: {
          style: { type: 'string', description: 'the bracketed style tag line' },
          lyrics: { type: 'string', description: 'the lyric body with (Mukhda) / (Antara) / (Outro) section markers' },
          english: { type: 'string', description: 'a plain English gloss of what it says' }
        }, required: ['style', 'lyrics']
      },
      ask: function (p) {
        return 'Write a Hinglish song for a ' + String(p.occ).replace(/-/g, ' ') + ' film. Suno will sing this.\n\n' +
          facts(p) + '\n' + carry(p, ['psych']) + '\n\n' +
          'THE BANNED-WORD LAW for lyrics — breaking it makes the song unusable:\n' +
          '• No product word may appear anywhere: ' + LIB.PRODUCT_NOUNS.join(', ') + '.\n' +
          '• No brand name, no price, no "custom fit", no "buy", no "shop", no size.\n' +
          '• Nothing that reads as advertising. This is a song about a woman at an occasion, nothing else.\n' +
          '• Hinglish that scans when sung — count the syllables in each line against the line above it.\n' +
          '• Mukhda, then two Antaras, then the Mukhda again, then a held Outro.\n' +
          '• The style tag line stays in square brackets and lists genre, language, instruments, mood, voice, bpm.';
      },
      apply: function (p, a) {
        if (!a || !a.lyrics) return;
        var bad = LIB.PRODUCT_NOUNS.some(function (n) { return a.lyrics.toLowerCase().indexOf(n) >= 0; });
        if (bad) { p.deep.sunoRejected = 'A product word appeared in the lyrics — the offline song was kept.'; return; }
        p.suno = (a.style || '') + '\n\n' + a.lyrics;
        p.deep.sunoEnglish = a.english || '';
      }
    },
    {
      id: 'market8', n: '8', label: 'Marketplace copy', min: 'standard',
      human: 'Amazon bullets, Myntra and Ajio descriptions', struct: 'attribute schema, HSN, size',
      schema: {
        type: 'object',
        properties: {
          amazonTitle: { type: 'string', description: 'brand first, 200 characters maximum' },
          amazonBullets: { type: 'array', items: { type: 'string' }, description: 'exactly 5, each under 200 characters, each opening with a capitalised benefit phrase' },
          amazonDesc: { type: 'string', description: 'the A+ style description, 120 to 180 words' },
          keywords: { type: 'string', description: 'backend search terms, comma separated, 250 bytes maximum, no repetition of the title' },
          myntra: { type: 'string', description: '60 to 90 words in Myntra voice' },
          ajio: { type: 'string', description: '50 to 80 words in Ajio voice' },
          meesho: { type: 'string', description: 'one short value-first line' }
        }, required: ['amazonTitle', 'amazonBullets', 'myntra', 'ajio']
      },
      ask: function (p) {
        return 'Write the marketplace copy. The attribute schema, HSN code, size chart and prices are already fixed and are NOT yours to write:\n' +
          p.marketplace.flipkart + '\n\n' + facts(p) + '\n' + carry(p, ['market', 'keywords', 'psych']) + '\n\n' +
          '• Amazon bullets: 5, each opening with a capitalised benefit phrase then a colon, each carrying a number or a named material.\n' +
          '• Backend keywords never repeat a word already in the Amazon title — that wastes the byte budget.\n' +
          '• Myntra is written for a scroller: short, current, no heritage speech.\n' +
          '• Ajio is written flatter and more editorial than Myntra. They must not read like the same paragraph rewritten.\n' +
          '• Nothing may claim a certification, a fabric blend percentage or an origin we have not stated above.\n\n' + LAW;
      },
      apply: function (p, a) {
        if (!a) return;
        var m = p.marketplace;
        if (a.amazonTitle) m.amazon.title = a.amazonTitle.slice(0, 200);
        if (a.amazonBullets && a.amazonBullets.length) m.amazon.bullets = a.amazonBullets.slice(0, 5);
        if (a.keywords) m.amazon.keywords = trimBytes(a.keywords, 250);
        if (a.amazonDesc) m.amazon.desc = a.amazonDesc;
        if (a.myntra) m.myntra = a.myntra;
        if (a.ajio) m.ajio = a.ajio;
        if (a.meesho) m.meesho = a.meesho;
      }
    },
    {
      id: 'scale', n: '9', label: 'Scale Engine', min: 'deep',
      human: 'every asset it multiplies', struct: 'counts',
      schema: {
        type: 'object',
        properties: { assets: { type: 'array', items: { type: 'object', properties: {
          kind: { type: 'string' }, text: { type: 'string' }, note: { type: 'string' } },
          required: ['kind', 'text'] } } }, required: ['assets']
      },
      ask: function (p) {
        return 'Multiply this listing into 15 more assets that reuse the same research without repeating the same sentences.\n\n' +
          facts(p) + '\n' + carry(p, ['hooks', 'psych', 'dna']) + '\n\n' +
          'Give a mix across these kinds: whatsapp broadcast, story text, pinterest description, youtube shorts title, ' +
          'google shopping title, review request, reel comment reply, influencer brief line, packaging insert card, ' +
          'thank-you note, restock alert, size-help DM, festival greeting, bundle offer, and one abandoned-cart line.\n' +
          '• "text" is the finished copy, ready to send. Not a description of what to write.\n' +
          '• No two assets may share an opening sentence.\n\n' + LAW;
      },
      apply: function (p, a) { if (a && a.assets) p.deep.scale = a.assets; }
    },
    {
      id: 'calendar', n: '10', label: '30-day calendar', min: 'deep',
      human: 'caption and hook columns', struct: 'date, time, status',
      schema: {
        type: 'object',
        properties: { days: { type: 'array', items: { type: 'object', properties: {
          day: { type: 'number' }, channel: { type: 'string' }, format: { type: 'string' },
          hook: { type: 'string' }, caption: { type: 'string' } },
          required: ['day', 'channel', 'format', 'hook'] } } }, required: ['days']
      },
      ask: function (p) {
        return 'Plan 30 days of posting for this one product. Days, channels and formats are the structure; the hooks and captions are the writing.\n\n' +
          facts(p) + '\n' + carry(p, ['hooks', 'psych']) + '\n\n' +
          '• Exactly 30 entries, day 1 to day 30.\n' +
          '• channel is one of: Instagram, Facebook, WhatsApp, Pinterest, YouTube Shorts, Email.\n' +
          '• format is one of: Reel, Carousel, Story, Static, Short, Broadcast, Newsletter.\n' +
          '• The month must build: discovery in week 1, proof in week 2, objection-handling in week 3, offer in week 4.\n' +
          '• caption is 20 to 40 words, finished and postable. Never "post about the fabric".\n' +
          '• No hook may be reused inside the 30 days.\n\n' + LAW;
      },
      apply: function (p, a) { if (a && a.days) p.deep.calendar = a.days.slice(0, 30); }
    },
    {
      id: 'size', n: '12', label: 'Size chart copy', min: 'deep',
      human: 'the intro and CTA line only', struct: 'the measurement numbers',
      schema: {
        type: 'object',
        properties: { intro: { type: 'string', description: '30 to 50 words' }, cta: { type: 'string', description: 'one line' },
          help: { type: 'array', items: { type: 'string' }, description: '3 short measuring tips' } },
        required: ['intro', 'cta']
      },
      ask: function (p) {
        return 'Write only the words around the size chart. The measurements themselves are fixed and are NOT yours to write or change.\n\n' +
          facts(p) + '\n' + carry(p, ['psych']) + '\n\n' +
          '• The intro answers the fit fear found in the psychology above, in plain language, without reassurance-speak.\n' +
          '• The CTA points at WhatsApp +91 87580 38161 and asks for two numbers, bust and waist.\n' +
          '• The three tips are things people get wrong when measuring themselves at home.\n\n' + LAW;
      },
      apply: function (p, a) { if (a) p.deep.size = a; }
    },
    {
      id: 'alt', n: '13', label: 'Image alt text', min: 'deep',
      human: 'alt-text readability', struct: 'filename, SKU',
      schema: {
        type: 'object',
        properties: { alts: { type: 'array', items: { type: 'string' } } }, required: ['alts']
      },
      ask: function (p) {
        var current = (p.imageSEO || []).map(function (a, i) { return (i + 1) + '. ' + a; }).join('\n');
        return 'Rewrite these image alt texts so a screen reader reads them as sentences, not as keyword strings. ' +
          'The filenames and SKUs they belong to are fixed and must not appear in your output.\n\n' + facts(p) + '\n\n' +
          'CURRENT ALT TEXT, in order — return exactly the same number, in the same order:\n' + current + '\n\n' +
          '• Each under 125 characters.\n' +
          '• Each describes what is actually visible in that shot, then who it is by.\n' +
          '• No word repeated twice inside one alt text.\n' +
          '• Keep the colour and the garment in every one, because that is what the alt text is for.';
      },
      apply: function (p, a) {
        if (!a || !a.alts || !a.alts.length) return;
        var alts = a.alts.map(function (s) { return String(s).slice(0, 125); });
        /* both lists have to move together — Rule 6 checks that Shopify col 35 is identical
           to the Image SEO sheet, so the rewrite is handed to the row builder too */
        p.altOverride = alts;
        p.imageSEO = alts;
        p.deep.altRewritten = true;
      }
    }
  ];

  function pushSrc(p, sources) {
    if (!sources || !sources.length) return;
    p.sources = p.sources || [];
    var seen = {};
    p.sources.forEach(function (s) { seen[s.uri] = 1; });
    sources.forEach(function (s) { if (s.uri && !seen[s.uri]) { seen[s.uri] = 1; p.sources.push(s); } });
  }
  function trimBytes(s, max) {
    s = String(s);
    while (unescape(encodeURIComponent(s)).length > max) s = s.slice(0, -8);
    return s;
  }
  function esc2(s) { return String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* the listing phase writes into the same fields the offline generator built, through the
     same fitters, so a model that ignores the character limits still cannot break the QA gate */
  function applyListing(p, a) {
    if (!a) return;
    var occLabel = String(p.occ).replace(/-/g, ' ');
    if (a.title) { p.title = VA.CE.fitTitle(a.title, p.colour, p.fabric, p.work, p.typeNoun, occLabel); p.titles.SEO = p.title; }
    if (a.seoTitle) p.meta.title = a.seoTitle.slice(0, 60);
    if (a.seoDescription) p.meta.desc = VA.CE.fitMeta(a.seoDescription, p.colour, p.typeNoun, p.fabric, occLabel, p.work, []);
    if (a.opening && a.second) {
      p.bodyHTML = p.bodyHTML.replace(/<p>[\s\S]*?<\/p>\n\n<p>[\s\S]*?<\/p>/,
        '<p>' + esc2(a.opening) + '</p>\n\n<p>' + esc2(a.second) + '</p>');
      p.aiOpening = a.opening;
    }
    if (a.whenWhere) p.deep.whenWhere = a.whenWhere;
    if (a.bullets && a.bullets.length) p.bullets = a.bullets.slice(0, 5);
    if (a.faq && a.faq.length) p.faq = a.faq.slice(0, 6);
    if (a.blog) p.blog = a.blog;
    p.aiWritten = true;
  }

  function wanted(depth) {
    var rank = { quick: 0, standard: 1, deep: 2 }, want = rank[depth] == null ? 1 : rank[depth];
    return PHASES.filter(function (ph) { return rank[ph.min] <= want; });
  }

  /* ── THE RUN ──────────────────────────────────────────────────────────────────────
     Sequential on purpose: each phase reads what the phases before it established, which
     is the whole reason the output stops sounding generic. A phase that fails is recorded
     and skipped — one bad call never loses the other fifteen. */
  function run(pack, depth, onPhase) {
    var list = wanted(depth);
    pack.deep = pack.deep || {};
    pack.depth = depth;
    pack.phaseLog = list.map(function (ph) {
      return { id: ph.id, n: ph.n, label: ph.label, human: ph.human, struct: ph.struct, state: 'waiting' };
    });
    var i = 0;
    function log(ix, state, note) {
      pack.phaseLog[ix].state = state;
      if (note) pack.phaseLog[ix].note = note;
      if (onPhase) onPhase(pack.phaseLog[ix], ix, list.length);
    }
    function step() {
      if (i >= list.length) return Promise.resolve(pack);
      var ph = list[i], ix = i++;
      log(ix, 'running');
      var t0 = Date.now();
      var call = ph.grounded
        ? VAI.research(ph.ask(pack), { max: 3000 })
        : VAI.json(ph.ask(pack), ph.schema, { temp: 0.85, max: ph.id === 'calendar' || ph.id === 'scale' ? 8000 : 6000 });
      return call
        .then(function (out) {
          ph.apply(pack, out);
          log(ix, 'done', Math.round((Date.now() - t0) / 1000) + 's');
        })
        .catch(function (e) {
          log(ix, 'failed', String(e.message || e).slice(0, 90));
        })
        .then(step);
    }
    return step();
  }

  /* the call count is never written by hand — it is counted off the phase list, so the label
     on the button can never disagree with what the button actually does */
  Object.keys(DEPTHS).forEach(function (k) {
    DEPTHS[k].calls = wanted(k).length + ' calls';
  });

  window.VDEEP = {
    LAW: LAW, TABLE: TABLE, PHASES: PHASES, DEPTHS: DEPTHS,
    run: run, wanted: wanted, facts: facts, applyListing: applyListing
  };
})();
