/* ═══════════ Vastrangam AI Engine — the AI engine (primary path) ═══════════
   v3 inverts v2. The model is no longer an optional "upgrade" bolted onto a template
   engine — it is how the app reads photos, researches the market and edits images.
   The offline path still exists, but it is honestly labelled DRAFT rather than
   pretending to be world-class.

     vision(blob, schema)      → reads a photo, returns structured JSON
     research(query)           → Google Search grounding: real sellers, real URLs
     json(prompt, schema)      → structured text output
     text(prompt)              → prose
     editImage(blob, instr)    → gemini-2.5-flash-image ("nano banana") edit
     makeImage(prompt)         → generate an image

   Free-tier discipline is built in, because the free tier is what the user has:
     · ~10 requests/minute throttle, queued (never fire 30 photos at once)
     · exponential backoff on 429 / 503
     · results cached by content hash, so re-running a catalogue costs nothing
     · every call degrades: gemini → openrouter/groq → offline draft

   Keys live in localStorage only. Never hardcoded, never committed. */
var VAI = (function () {
  'use strict';
  var LSKEY = 'vastrangam_ai_keys_v1';
  function cfg() { try { return JSON.parse(localStorage.getItem(LSKEY) || '{}'); } catch (e) { return {}; } }
  function saveCfg(c) { try { localStorage.setItem(LSKEY, JSON.stringify(c)); } catch (e) {} }
  function setKey(prov, key) { var c = cfg(); c[prov] = key; saveCfg(c); }
  function getKey(prov) { return cfg()[prov] || ''; }

  /* ── models ────────────────────────────────────────────────────────────────────────
     v3 hardcoded gemini-2.5-* and every call failed once Google moved on: a retired model
     id returns 404 no matter how good the key is, which is exactly the "I checked all but
     the error keeps coming" symptom. So nothing here is authoritative. These are only a
     LAST-RESORT fallback; the real list is discovered from the key with models.list and
     cached, and Connectors → Diagnose shows the true status of every one. */
  var FALLBACK = {
    text: ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-flash-latest'],
    image: ['gemini-3.1-flash-image-preview', 'gemini-2.5-flash-image', 'gemini-2.5-flash-image-preview']
  };
  var M = { text: FALLBACK.text[0], vision: FALLBACK.text[0], image: FALLBACK.image[0], imageAlt: FALLBACK.image[1] };
  var ROOT = 'https://generativelanguage.googleapis.com/v1beta/';
  var BASE = ROOT + 'models/';
  var MKEY = 'vastrangam_ai_models_v1';

  /* how good a model is for our purposes — higher wins. Newer families first, and
     "flash" over "pro" because the free tier is where this app lives. */
  function scoreText(id) {
    var s = 0, n = id.toLowerCase();
    if (/gemini-3\.6/.test(n)) s += 60; else if (/gemini-3\.5/.test(n)) s += 55;
    else if (/gemini-3/.test(n)) s += 50; else if (/gemini-2\.5/.test(n)) s += 30;
    else if (/gemini-2/.test(n)) s += 20; else s += 5;
    if (/flash/.test(n)) s += 10;
    if (/lite/.test(n)) s -= 6;
    if (/pro/.test(n)) s -= 4;                 /* usually not on the free tier */
    if (/image|tts|embed|aqa|live|native-audio/.test(n)) s -= 100;
    if (/preview|exp/.test(n)) s -= 3;
    if (/latest/.test(n)) s += 1;
    return s;
  }
  function scoreImage(id) {
    var s = 0, n = id.toLowerCase();
    if (!/image|banana/.test(n)) return -100;
    if (/gemini-3/.test(n)) s += 50; else if (/gemini-2\.5/.test(n)) s += 30; else s += 10;
    if (/flash/.test(n)) s += 10;
    if (/pro/.test(n)) s -= 4;
    if (/preview|exp/.test(n)) s -= 2;
    return s;
  }

  /* GET models.list — the only reliable source of what this key can actually use */
  function listModels(opts) {
    opts = opts || {};
    var key = getKey('gemini');
    if (!key) return Promise.reject(new Error('no key'));
    return withTimeout(fetch(ROOT + 'models?key=' + encodeURIComponent(key)).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 240)); });
      return r.json();
    }), 25000).then(function (j) {
      var all = (j.models || []).map(function (m) {
        return {
          id: String(m.name || '').replace(/^models\//, ''),
          methods: m.supportedGenerationMethods || m.supported_generation_methods || [],
          display: m.displayName || m.display_name || '',
          desc: m.description || ''
        };
      }).filter(function (m) { return m.id; });
      var usable = all.filter(function (m) { return m.methods.indexOf('generateContent') >= 0; });
      return { all: all, usable: usable };
    });
  }

  /* discover once, cache the choice, and fall back to the shipped ids if discovery fails */
  function pickModels(force) {
    if (!force) {
      try {
        var c = JSON.parse(localStorage.getItem(MKEY) || 'null');
        if (c && c.text && (Date.now() - c.at) < 7 * 864e5) { M.text = M.vision = c.text; M.image = c.image || M.image; return Promise.resolve(c); }
      } catch (e) {}
    }
    return listModels().then(function (r) {
      var t = r.usable.map(function (m) { return m.id; }).filter(function (id) { return scoreText(id) > 0; })
        .sort(function (a, b) { return scoreText(b) - scoreText(a); })[0];
      var i = r.usable.map(function (m) { return m.id; }).filter(function (id) { return scoreImage(id) > 0; })
        .sort(function (a, b) { return scoreImage(b) - scoreImage(a); })[0];
      var chosen = { text: t || FALLBACK.text[0], image: i || FALLBACK.image[0], at: Date.now(), count: r.usable.length };
      M.text = M.vision = chosen.text;
      if (i) { M.image = i; M.imageAlt = i; }
      try { localStorage.setItem(MKEY, JSON.stringify(chosen)); } catch (e) {}
      return chosen;
    });
  }

  /* is this even an API key? An OAuth token pasted here fails on every model, and the app
     should say so rather than let the user hunt through model names. */
  function keyShape(k) {
    k = String(k || '').trim();
    if (!k) return { ok: false, why: 'No key entered.' };
    if (/^AIza[0-9A-Za-z_-]{30,}$/.test(k)) return { ok: true, why: 'Looks like a Gemini API key.' };
    if (/^AQ\.|^ya29\./.test(k)) return { ok: false, why: 'This is a Google OAuth access token, not an API key. Gemini API keys start with "AIza" — create one at aistudio.google.com/apikey.' };
    if (/^AIza/.test(k)) return { ok: false, why: 'Starts with AIza but looks truncated — paste the whole key.' };
    return { ok: false, why: 'Not the shape of a Gemini API key (those start with "AIza").' };
  }

  /* Diagnose: try every candidate and report the REAL status for each, one row at a time */
  function diagnose(onRow) {
    var key = getKey('gemini');
    var shape = keyShape(key);
    var out = { shape: shape, models: [], listError: null };
    if (!shape.ok && !/^AIza/.test(String(key))) return Promise.resolve(out);
    return listModels().then(function (r) { return r; })
      .catch(function (e) { out.listError = String(e.message || e); return { usable: [], all: [] }; })
      .then(function (r) {
        var cands = r.usable.map(function (m) { return m.id; });
        if (!cands.length) cands = FALLBACK.text.concat(FALLBACK.image);
        /* keep it to the ones worth trying, newest first */
        var t = cands.filter(function (id) { return scoreText(id) > 0; }).sort(function (a, b) { return scoreText(b) - scoreText(a); }).slice(0, 5);
        var i = cands.filter(function (id) { return scoreImage(id) > 0; }).sort(function (a, b) { return scoreImage(b) - scoreImage(a); }).slice(0, 3);
        var list = t.map(function (id) { return { id: id, kind: 'text' }; })
          .concat(i.map(function (id) { return { id: id, kind: 'image' }; }));
        out.available = r.usable.length;
        return list.reduce(function (chain, m) {
          return chain.then(function () {
            return probe(m.id, m.kind).then(function (res) {
              var row = { id: m.id, kind: m.kind, status: res.status, ok: res.ok, detail: res.detail };
              out.models.push(row); if (onRow) try { onRow(row, out); } catch (e) {}
            });
          });
        }, Promise.resolve()).then(function () { return out; });
      });
  }
  function probe(id, kind) {
    var body = kind === 'image'
      ? { contents: [{ parts: [{ text: 'A single small solid red square.' }] }] }
      : { contents: [{ parts: [{ text: 'Reply with the single word OK.' }] }], generationConfig: { maxOutputTokens: 8 } };
    var key = getKey('gemini');
    return withTimeout(fetch(BASE + id + ':generateContent?key=' + encodeURIComponent(key), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    }).then(function (r) {
      return r.text().then(function (t) {
        if (r.ok) {
          var got = '';
          try { var j = JSON.parse(t); got = kind === 'image' ? (imageOf(j) ? 'returned an image' : 'no image in reply') : (textOf(j) || 'empty reply'); } catch (e) { got = 'ok'; }
          return { ok: kind === 'image' ? /returned an image/.test(got) : true, status: r.status, detail: String(got).slice(0, 90) };
        }
        var msg = t;
        try { var e = JSON.parse(t); msg = (e.error && (e.error.status + ' — ' + e.error.message)) || t; } catch (x) {}
        return { ok: false, status: r.status, detail: String(msg).slice(0, 160) };
      });
    }), 45000).catch(function (e) { return { ok: false, status: 0, detail: String(e.message || e).slice(0, 160) }; });
  }

  var PROVIDERS = [
    { id: 'builtin', name: 'Built-in engine', kind: 'text', free: true, key: false, note: 'offline · no key · draft quality' },
    { id: 'gemini', name: 'Gemini (Google)', kind: 'both', free: true, key: true, note: 'free tier · vision + search + image editing' },
    { id: 'pollinations', name: 'Pollinations', kind: 'image', free: true, key: false, note: 'free · no key · image generation' },
    { id: 'openrouter', name: 'OpenRouter', kind: 'text', free: true, key: true, note: 'has free models · one key, many models' },
    { id: 'groq', name: 'Groq', kind: 'text', free: true, key: true, note: 'free · very fast' },
    { id: 'ollama', name: 'Ollama (local)', kind: 'text', free: true, key: false, note: 'runs on your own machine · truly free' },
    { id: 'openai', name: 'OpenAI', kind: 'both', free: false, key: true, note: 'paid' },
    { id: 'claude', name: 'Claude (Anthropic)', kind: 'text', free: false, key: true, note: 'paid' }
  ];
  function prov(id) { return PROVIDERS.filter(function (p) { return p.id === id; })[0] || {}; }
  function textChain() {
    return ['gemini', 'openrouter', 'groq', 'openai', 'claude'].filter(function (p) { return !!getKey(p); });
  }
  function anyText() { return textChain().length > 0; }
  function hasVision() { return !!getKey('gemini'); }

  /* ── throttle: the free tier is ~10-15 requests/minute, so serialise with a gap ────────
     Every network call goes through q(). This is what stops a 30-photo catalogue from
     firing 30 parallel requests and getting a wall of 429s. */
  var MIN_GAP = 4200, lastAt = 0, chain = Promise.resolve(), inFlight = 0, done = 0, total = 0;
  var onProgress = null;
  function setProgress(fn) { onProgress = fn; }
  function tick() { if (onProgress) { try { onProgress({ done: done, total: total, inFlight: inFlight }); } catch (e) {} } }
  function q(fn) {
    total++; tick();
    var run = chain.then(function () {
      var wait = Math.max(0, MIN_GAP - (Date.now() - lastAt));
      return new Promise(function (r) { setTimeout(r, wait); });
    }).then(function () { lastAt = Date.now(); inFlight++; tick(); return fn(); })
      .then(function (v) { inFlight--; done++; tick(); return v; },
            function (e) { inFlight--; done++; tick(); throw e; });
    chain = run.catch(function () {});
    return run;
  }
  function resetProgress() { done = 0; total = 0; tick(); }

  var TIMEOUT = 60000;
  function withTimeout(p, ms) {
    return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, ms || TIMEOUT); })]);
  }

  /* ── retry with exponential backoff on rate limits / transient server errors ── */
  function retry(fn, tries) {
    tries = tries == null ? 3 : tries;
    return fn().catch(function (e) {
      var msg = String(e && e.message || e);
      var transient = /\b(429|500|502|503|504|timeout|network|Failed to fetch)\b/i.test(msg);
      if (!tries || !transient) throw e;
      var wait = (4 - tries) * 4000 + 3000;
      return new Promise(function (r) { setTimeout(r, wait); }).then(function () { return retry(fn, tries - 1); });
    });
  }

  /* ── cache: hash of (kind + input) → result. Re-running a catalogue is free. ──────────
     Kept in localStorage so it survives a reload; capped so it can never fill the quota. */
  var CKEY = 'vastrangam_ai_cache_v1', CAP = 120;
  function cache() { try { return JSON.parse(localStorage.getItem(CKEY) || '{}'); } catch (e) { return {}; } }
  function cacheGet(k) { var c = cache(); return c[k] ? c[k].v : undefined; }
  function cachePut(k, v) {
    try {
      var c = cache(); c[k] = { v: v, t: Date.now() };
      var keys = Object.keys(c);
      if (keys.length > CAP) {
        keys.sort(function (a, b) { return c[a].t - c[b].t; }).slice(0, keys.length - CAP).forEach(function (x) { delete c[x]; });
      }
      localStorage.setItem(CKEY, JSON.stringify(c));
    } catch (e) { /* quota — caching is an optimisation, never a requirement */ }
  }
  function clearCache() { try { localStorage.removeItem(CKEY); } catch (e) {} }
  /* FNV-1a over the string — fast, synchronous, and good enough to key a cache */
  function hash(s) {
    var h = 2166136261, i;
    s = String(s);
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h.toString(36) + '_' + s.length;
  }

  /* ── low-level Gemini call ───────────────────────────────────────────────────────── */
  function gem(model, body, ms) {
    var key = getKey('gemini');
    if (!key) return Promise.reject(new Error('no key'));
    var url = BASE + model + ':generateContent?key=' + encodeURIComponent(key);
    return withTimeout(fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error('gemini ' + r.status + ' ' + t.slice(0, 200)); });
      return r.json();
    }), ms);
  }
  function partsOf(j) { return (((j.candidates || [])[0] || {}).content || {}).parts || []; }
  function textOf(j) {
    return partsOf(j).filter(function (p) { return typeof p.text === 'string'; }).map(function (p) { return p.text; }).join('').trim();
  }
  function imageOf(j) {
    var p = partsOf(j).filter(function (x) { return x.inlineData || x.inline_data; })[0];
    if (!p) return null;
    var d = p.inlineData || p.inline_data;
    return 'data:' + (d.mimeType || d.mime_type || 'image/png') + ';base64,' + d.data;
  }
  /* models sometimes wrap JSON in prose or a ``` fence — dig it out rather than fail */
  function parseJSON(s) {
    if (!s) return null;
    try { return JSON.parse(s); } catch (e) {}
    var m = s.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) { try { return JSON.parse(m[1]); } catch (e) {} }
    var a = s.indexOf('{'), b = s.lastIndexOf('}');
    if (a >= 0 && b > a) { try { return JSON.parse(s.slice(a, b + 1)); } catch (e) {} }
    a = s.indexOf('['); b = s.lastIndexOf(']');
    if (a >= 0 && b > a) { try { return JSON.parse(s.slice(a, b + 1)); } catch (e) {} }
    return null;
  }
  function stripDataURL(u) { return String(u || '').replace(/^data:[^,]*,/, ''); }
  function mimeOf(u) { var m = String(u || '').match(/^data:([^;,]+)/); return m ? m[1] : 'image/jpeg'; }

  /* ── VISION ── read a photo, get structured facts back ─────────────────────────────
     This is what replaces filename guessing. `dataURL` is the image; `schema` is a
     Gemini responseSchema; `instruction` says what to look for. */
  function vision(dataURL, instruction, schema, opts) {
    opts = opts || {};
    if (!hasVision()) return Promise.reject(new Error('no vision provider'));
    var ck = 'v_' + hash(instruction + '|' + JSON.stringify(schema || {}) + '|' + dataURL);
    var hit = opts.noCache ? undefined : cacheGet(ck);
    if (hit !== undefined) return Promise.resolve(hit);
    var body = {
      contents: [{ parts: [
        { inline_data: { mime_type: mimeOf(dataURL), data: stripDataURL(dataURL) } },
        { text: instruction }
      ] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: opts.max || 1400 }
    };
    if (schema) { body.generationConfig.responseMimeType = 'application/json'; body.generationConfig.responseSchema = schema; }
    return q(function () { return retry(function () { return gem(M.vision, body); }); })
      .then(function (j) {
        var out = schema ? parseJSON(textOf(j)) : textOf(j);
        if (out == null) throw new Error('vision returned nothing usable');
        cachePut(ck, out);
        return out;
      });
  }

  /* ── RESEARCH ── Google Search grounding: real competitors, real URLs ──────────────
     The spec demands "real market + competitor analysis, not assumptions". This is the
     call that satisfies it. Returns { text, sources:[{title,uri}] }. */
  function research(query, opts) {
    opts = opts || {};
    if (!getKey('gemini')) return Promise.reject(new Error('no key'));
    var ck = 'r_' + hash(query);
    var hit = opts.noCache ? undefined : cacheGet(ck);
    if (hit !== undefined) return Promise.resolve(hit);
    var body = {
      contents: [{ parts: [{ text: query }] }],
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.3, maxOutputTokens: opts.max || 2600 }
    };
    return q(function () { return retry(function () { return gem(M.text, body, 75000); }); })
      .then(function (j) {
        var c = (j.candidates || [])[0] || {};
        var gm = c.groundingMetadata || c.grounding_metadata || {};
        var chunks = gm.groundingChunks || gm.grounding_chunks || [];
        var sources = chunks.map(function (x) {
          var w = x.web || {};
          return { title: w.title || '', uri: w.uri || '' };
        }).filter(function (s) { return s.uri; });
        var out = { text: textOf(j), sources: sources, queries: gm.webSearchQueries || gm.web_search_queries || [] };
        if (!out.text) throw new Error('research returned nothing');
        cachePut(ck, out);
        return out;
      });
  }

  /* ── JSON ── structured text output (no image) ──────────────────────────────────── */
  function json(prompt, schema, opts) {
    opts = opts || {};
    var ck = 'j_' + hash(prompt + '|' + JSON.stringify(schema || {}));
    var hit = opts.noCache ? undefined : cacheGet(ck);
    if (hit !== undefined) return Promise.resolve(hit);
    if (!getKey('gemini')) return Promise.reject(new Error('no key'));
    var body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: opts.temp == null ? 0.7 : opts.temp,
        maxOutputTokens: opts.max || 6000,
        responseMimeType: 'application/json'
      }
    };
    if (schema) body.generationConfig.responseSchema = schema;
    return q(function () { return retry(function () { return gem(M.text, body, 75000); }); })
      .then(function (j) {
        var out = parseJSON(textOf(j));
        if (out == null) throw new Error('model did not return JSON');
        cachePut(ck, out);
        return out;
      });
  }

  /* ── TEXT ── prose, with the provider chain and an offline draft fallback ───────── */
  function text(prompt, opts) {
    opts = opts || {};
    var order = textChain();
    if (!order.length) return Promise.resolve({ text: opts.fallback || '', provider: 'builtin', offline: true });
    return tryText(order, 0, prompt, opts);
  }
  function tryText(order, i, prompt, opts) {
    if (i >= order.length) return Promise.resolve({ text: opts.fallback || '', provider: 'builtin', offline: true });
    var id = order[i], call;
    if (id === 'gemini') {
      call = q(function () {
        return retry(function () {
          return gem(M.text, { contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: opts.temp == null ? 0.8 : opts.temp, maxOutputTokens: opts.max || 3000 } });
        });
      }).then(textOf);
    } else {
      var map = {
        openrouter: ['https://openrouter.ai/api/v1/chat/completions', opts.orModel || 'meta-llama/llama-3.3-70b-instruct:free'],
        groq: ['https://api.groq.com/openai/v1/chat/completions', opts.groqModel || 'llama-3.3-70b-versatile'],
        openai: ['https://api.openai.com/v1/chat/completions', 'gpt-4o-mini'],
        claude: [null, null]
      }[id];
      call = map && map[0] ? oaiText(prompt, opts, map[0], getKey(id), map[1]) : Promise.reject(new Error('unsupported'));
    }
    return withTimeout(call).then(function (t) { return { text: t, provider: id, offline: false }; })
      .catch(function () { return tryText(order, i + 1, prompt, opts); });
  }
  function oaiText(prompt, opts, url, key, model) {
    if (!key) return Promise.reject(new Error('no key'));
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({ model: model, messages: [{ role: 'user', content: prompt }], temperature: opts.temp == null ? 0.8 : opts.temp, max_tokens: opts.max || 3000 }) })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (j) { return (((j.choices || [])[0] || {}).message || {}).content || ''; });
  }

  /* ── EDIT IMAGE ── nano banana. Removes a watermark, changes a background, cleans a
     shot — given the image plus a plain-English instruction. Returns a dataURL. */
  function editImage(dataURL, instruction, opts) {
    opts = opts || {};
    if (!getKey('gemini')) return Promise.reject(new Error('no key'));
    var body = {
      contents: [{ parts: [
        { inline_data: { mime_type: mimeOf(dataURL), data: stripDataURL(dataURL) } },
        { text: instruction }
      ] }]
    };
    var models = [M.image, M.imageAlt];
    function attempt(i) {
      if (i >= models.length) return Promise.reject(new Error('image edit unavailable'));
      return q(function () { return retry(function () { return gem(models[i], body, 90000); }, 2); })
        .then(function (j) { var u = imageOf(j); if (!u) throw new Error('no image returned'); return u; })
        .catch(function (e) { if (i + 1 < models.length) return attempt(i + 1); throw e; });
    }
    return attempt(0);
  }

  /* ── MAKE IMAGE ── generate from a prompt; falls back to Pollinations (free, no key) */
  function makeImage(prompt, opts) {
    opts = opts || {}; var w = opts.w || 1024, h = opts.h || 1024;
    var body = { contents: [{ parts: [{ text: prompt }] }] };
    return q(function () { return retry(function () { return gem(M.image, body, 90000); }, 2); })
      .then(function (j) { var u = imageOf(j); if (!u) throw new Error('no image'); return { url: u, provider: 'gemini' }; })
      .catch(function () {
        return { provider: 'pollinations', url: 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) +
          '?width=' + w + '&height=' + h + '&nologo=true&seed=' + Math.floor(Math.random() * 1e6) };
      });
  }

  /* ── back-compat with v2 call sites ── */
  function callText(prompt, opts) { return text(prompt, opts); }
  function callImage(prompt, opts) { return makeImage(prompt, opts); }

  /* ── connectivity test ── */
  function test(id, cb) {
    if (id === 'gemini') {
      var shape = keyShape(getKey('gemini'));
      if (!shape.ok && !/^AIza/.test(String(getKey('gemini')))) { cb(false, shape.why); return; }
      /* discover what this key can actually use, then prove it with a real call */
      pickModels(true).then(function (chosen) {
        return probe(chosen.text, 'text').then(function (r) {
          if (r.ok) cb(true, 'Connected · ' + chosen.count + ' models available · using ' + chosen.text + (chosen.image ? ' + ' + chosen.image : ''));
          else cb(false, 'HTTP ' + r.status + ' — ' + r.detail);
        });
      }).catch(function (e) { cb(false, String(e.message || e).slice(0, 180)); });
    } else if (id === 'pollinations') {
      var im = new Image();
      im.onload = function () { cb(true, 'Pollinations reachable'); };
      im.onerror = function () { cb(false, 'unreachable'); };
      im.src = 'https://image.pollinations.ai/prompt/test?width=64&height=64&nologo=true&seed=' + Date.now();
    } else cb(!!getKey(id), getKey(id) ? 'key saved' : 'no key');
  }

  /* how the app should describe its own output right now — used across every screen so
     the app never claims world-class quality while running on templates */
  function mode() {
    if (hasVision()) return { id: 'ai', label: 'AI connected', note: 'vision · live market research · image editing' };
    if (anyText()) return { id: 'partial', label: 'Text model connected', note: 'no vision — photos still need manual tags' };
    return { id: 'draft', label: 'Draft — no AI connected', note: 'offline templates · connect Gemini on Connectors for real output' };
  }

  return {
    PROVIDERS: PROVIDERS, prov: prov, MODELS: M, FALLBACK: FALLBACK,
    listModels: listModels, pickModels: pickModels, diagnose: diagnose, keyShape: keyShape,
    scoreText: scoreText, scoreImage: scoreImage,
    cfg: cfg, setKey: setKey, getKey: getKey,
    vision: vision, research: research, json: json, text: text, editImage: editImage, makeImage: makeImage,
    callText: callText, callImage: callImage,
    test: test, anyText: anyText, hasVision: hasVision, textChain: textChain, mode: mode,
    setProgress: setProgress, resetProgress: resetProgress, clearCache: clearCache, hash: hash,
    _parseJSON: parseJSON
  };
})();
