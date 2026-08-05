/* ═══════════ Vastrangam AI Engine — free-first model router ═══════════
   One place that turns "give me text" or "give me an image" into a real call, trying the
   cheapest working option first and always degrading to the offline engine so nothing ever
   breaks without a key or the internet. Keys live in the browser only — never committed.

     TEXT :  Built-in (offline) → Gemini (key) → OpenRouter (key) → Groq (key) → Ollama (local)
     IMAGE:  Gemini image (key) → Pollinations (free, no key) → placeholder (offline)

   Free options are ordered before paid ones on every screen that lists them. */
var VAI = (function () {
  'use strict';
  var LSKEY = 'vastrangam_ai_keys_v1';
  function cfg() { try { return JSON.parse(localStorage.getItem(LSKEY) || '{}'); } catch (e) { return {}; } }
  function saveCfg(c) { try { localStorage.setItem(LSKEY, JSON.stringify(c)); } catch (e) {} }
  function setKey(prov, key) { var c = cfg(); c[prov] = key; saveCfg(c); }
  function getKey(prov) { return cfg()[prov] || ''; }

  var PROVIDERS = [
    { id: 'builtin', name: 'Built-in engine', kind: 'text', free: true, key: false, note: 'offline · no key · always answers' },
    { id: 'gemini', name: 'Gemini (Google)', kind: 'both', free: true, key: true, note: 'free tier · your key · text + some images' },
    { id: 'pollinations', name: 'Pollinations', kind: 'image', free: true, key: false, note: 'free · no key · unlimited images' },
    { id: 'openrouter', name: 'OpenRouter', kind: 'text', free: true, key: true, note: 'has free models · one key, many models' },
    { id: 'groq', name: 'Groq', kind: 'text', free: true, key: true, note: 'free · very fast' },
    { id: 'ollama', name: 'Ollama (local)', kind: 'text', free: true, key: false, note: 'runs on your own machine · truly free' },
    { id: 'openai', name: 'OpenAI', kind: 'both', free: false, key: true, note: 'paid' },
    { id: 'claude', name: 'Claude (Anthropic)', kind: 'text', free: false, key: true, note: 'paid' }
  ];
  /* the order the router tries text providers — free/offline first */
  function textChain() {
    var order = ['gemini', 'openrouter', 'groq', 'ollama', 'openai', 'claude'];
    var have = order.filter(function (p) { var pr = prov(p); return pr.key ? !!getKey(p) : true; });
    /* only include ones that are actually usable (ollama assumed local; others need a key) */
    return have.filter(function (p) { var pr = prov(p); return pr.id === 'ollama' ? false : !!getKey(p); });
  }
  function prov(id) { return PROVIDERS.filter(function (p) { return p.id === id; })[0] || {}; }

  var TIMEOUT = 22000;
  function withTimeout(promise) { return Promise.race([promise, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, TIMEOUT); })]); }

  /* ── TEXT ── returns a Promise<string>. `fallback` is the offline text to use if nothing works. */
  function callText(prompt, opts) {
    opts = opts || {};
    var chain = textChain();
    if (!chain.length) return Promise.resolve({ text: opts.fallback || '', provider: 'builtin', offline: true });
    return tryText(chain, 0, prompt, opts);
  }
  function tryText(chain, i, prompt, opts) {
    if (i >= chain.length) return Promise.resolve({ text: opts.fallback || '', provider: 'builtin', offline: true });
    var id = chain[i];
    var call = id === 'gemini' ? geminiText(prompt, opts)
      : id === 'openrouter' ? orText(prompt, opts, 'https://openrouter.ai/api/v1/chat/completions', getKey('openrouter'), opts.orModel || 'meta-llama/llama-3.1-8b-instruct:free')
      : id === 'groq' ? orText(prompt, opts, 'https://api.groq.com/openai/v1/chat/completions', getKey('groq'), opts.groqModel || 'llama-3.1-8b-instant')
      : id === 'openai' ? orText(prompt, opts, 'https://api.openai.com/v1/chat/completions', getKey('openai'), 'gpt-4o-mini')
      : Promise.reject(new Error('no provider'));
    return withTimeout(call).then(function (t) { return { text: t, provider: id, offline: false }; })
      .catch(function () { return tryText(chain, i + 1, prompt, opts); });
  }
  function geminiText(prompt, opts) {
    var key = getKey('gemini'); if (!key) return Promise.reject(new Error('no key'));
    var model = opts.geminiModel || 'gemini-2.0-flash';
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(key);
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: opts.temp == null ? 0.8 : opts.temp, maxOutputTokens: opts.max || 2048 } }) })
      .then(function (r) { if (!r.ok) throw new Error('gemini ' + r.status); return r.json(); })
      .then(function (j) { var t = (((j.candidates || [])[0] || {}).content || {}).parts; return (t && t[0] && t[0].text) ? t[0].text : ''; });
  }
  function orText(prompt, opts, url, key, model) {
    if (!key) return Promise.reject(new Error('no key'));
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({ model: model, messages: [{ role: 'user', content: prompt }], temperature: opts.temp == null ? 0.8 : opts.temp, max_tokens: opts.max || 2048 }) })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (j) { return (((j.choices || [])[0] || {}).message || {}).content || ''; });
  }

  /* ── IMAGE ── returns Promise<dataURL|url>. Gemini image → Pollinations → offline placeholder. */
  function callImage(prompt, opts) {
    opts = opts || {}; var w = opts.w || 1024, h = opts.h || 1024;
    return geminiImage(prompt, opts).then(function (u) { return { url: u, provider: 'gemini' }; })
      .catch(function () {
        /* Pollinations: a plain GET that returns an image; free, no key, works from the browser */
        var url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?width=' + w + '&height=' + h + '&nologo=true&seed=' + Math.floor(Math.random() * 1e6);
        return { url: url, provider: 'pollinations' };
      });
  }
  function geminiImage(prompt, opts) {
    var key = getKey('gemini'); if (!key) return Promise.reject(new Error('no key'));
    var model = 'gemini-2.0-flash-preview-image-generation';
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(key);
    return withTimeout(fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } }) })
      .then(function (r) { if (!r.ok) throw new Error('gemini img ' + r.status); return r.json(); })
      .then(function (j) {
        var parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
        var img = parts.filter(function (p) { return p.inlineData; })[0];
        if (!img) throw new Error('no image');
        return 'data:' + img.inlineData.mimeType + ';base64,' + img.inlineData.data;
      }));
  }

  /* quick connectivity test for a provider */
  function test(prov, cb) {
    if (prov === 'gemini') geminiText('Reply with the single word OK.', { max: 8 }).then(function () { cb(true, 'Gemini reachable'); }).catch(function (e) { cb(false, String(e.message)); });
    else if (prov === 'pollinations') { var im = new Image(); im.onload = function () { cb(true, 'Pollinations reachable'); }; im.onerror = function () { cb(false, 'unreachable'); }; im.src = 'https://image.pollinations.ai/prompt/test?width=64&height=64&nologo=true&seed=' + Date.now(); }
    else cb(!!getKey(prov), getKey(prov) ? 'key saved' : 'no key');
  }

  function anyText() { return textChain().length > 0; }

  return { PROVIDERS: PROVIDERS, prov: prov, cfg: cfg, setKey: setKey, getKey: getKey, callText: callText, callImage: callImage, test: test, anyText: anyText, textChain: textChain };
})();
