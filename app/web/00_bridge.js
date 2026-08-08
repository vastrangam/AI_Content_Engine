/* ═══════════ browser → server ═══════════

   The single-file app kept everything in the browser: the workspace in localStorage, the
   photographs in IndexedDB, the Gemini key in a text box. That is why work lived in one
   browser on one machine and why reading photos was slow.

   This file swaps those three seams for the server, and nothing above it changes. Every
   screen still reads VA.DB; VStore still takes and returns data URLs; VAI still exposes
   vision(), json() and research(). They just reach further now.

   It is deliberately the FIRST script on the page, so the modules that follow find the
   server versions already in place rather than installing the browser ones. */
(function () {
  'use strict';

  var API = '';                       /* same origin */
  var pass = sessionStorage.getItem('va_pass') || '';

  function headers(extra) {
    var h = { 'Content-Type': 'application/json' };
    if (pass) h['x-va-pass'] = pass;
    /* a key typed in the app is a fallback for anyone who has not put one in .env */
    var k = '';
    try { k = (JSON.parse(localStorage.getItem('vastrangam_keys_v1') || '{}') || {}).gemini || ''; } catch (e) {}
    if (k) h['x-va-key'] = k;
    if (extra) for (var n in extra) h[n] = extra[n];
    return h;
  }

  function req(method, url, body) {
    return fetch(API + url, {
      method: method, headers: headers(),
      body: body === undefined ? undefined : JSON.stringify(body)
    }).then(function (r) {
      if (r.status === 401) { askPassword(); throw new Error('password needed'); }
      return r.text().then(function (t) {
        var j; try { j = JSON.parse(t); } catch (e) { j = { error: t.slice(0, 300) }; }
        if (!r.ok) throw new Error(j.error || (r.status + ' ' + t.slice(0, 200)));
        return j;
      });
    });
  }

  function askPassword() {
    var p = window.prompt('This app is password-protected. Enter the password:');
    if (p) { pass = p; sessionStorage.setItem('va_pass', p); location.reload(); }
  }

  window.VASERVER = {
    req: req,
    /* for the calls that want the raw Response rather than parsed JSON — the MP4 export
       gets a video back, and running it through req() would try to JSON.parse it */
    headers: headers,
    health: function () { return req('GET', '/api/health'); },
    setPassword: function (p) { pass = p; sessionStorage.setItem('va_pass', p); }
  };

  /* ── 0 · does the server already hold a Gemini key? ────────────────────────────────
     If GEMINI_API_KEY is in .env then the app must stop asking for one. Ask once, at
     the top of the page, before any screen has rendered — the flag is read by
     VAI.getKey below, and by anything that shows a "no key yet" warning.

     It is deliberately not awaited. The app has to open with the wifi off too; if this
     never answers, the flag stays false and the app asks for a key exactly as before. */
  window.__VA_SERVER_KEY = false;
  window.__VA_HEALTH = null;
  window.VASERVER.ready = req('GET', '/api/health').then(function (h) {
    window.__VA_HEALTH = h;
    window.__VA_SERVER_KEY = /key set/i.test(String(h && h.gemini || ''));
    window.__VA_MP4 = h && h.mp4 === 'ready';
    try { if (window.VA && VA.render) VA.render(); } catch (e) {}
    return h;
  }).catch(function () { return null; });

  /* ── 1 · the workspace ────────────────────────────────────────────────────────────
     Saved to the server, debounced, and never on the critical path of a keystroke. */
  var saveTimer = null, pending = null, saving = false;
  window.VADOC = {
    load: function () { return req('GET', '/api/doc').then(function (r) { return r.doc; }); },
    save: function (doc) {
      pending = doc;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(flush, 400);
    },
    flush: flush
  };
  function flush() {
    if (saving || !pending) return Promise.resolve();
    var doc = pending; pending = null; saving = true;
    return req('PUT', '/api/doc', { doc: doc })
      .catch(function (e) { console.warn('save failed:', e.message); pending = doc; })
      .then(function () { saving = false; if (pending) flush(); });
  }
  /* a closing tab must not lose the last edit */
  window.addEventListener('beforeunload', function () {
    if (!pending) return;
    try {
      navigator.sendBeacon(API + '/api/doc',
        new Blob([JSON.stringify({ doc: pending })], { type: 'application/json' }));
    } catch (e) {}
  });

  /* ── 2 · photographs ──────────────────────────────────────────────────────────────
     Same interface as the old IndexedDB store, so nothing that uses it had to change. */
  var memo = {};
  window.VStore = {
    putDataURL: function (key, dataURL, cb) {
      req('PUT', '/api/image/' + encodeURIComponent(key), { dataURL: dataURL })
        .then(function () { memo[key] = dataURL; cb && cb(true); })
        .catch(function (e) { console.warn('image save failed:', e.message); cb && cb(false); });
    },
    getDataURL: function (key, cb) {
      if (memo[key]) return cb(memo[key]);
      fetch(API + '/api/image/' + encodeURIComponent(key), { headers: headers() })
        .then(function (r) { return r.ok ? r.blob() : null; })
        .then(function (b) {
          if (!b) return cb(null);
          var fr = new FileReader();
          fr.onload = function () { memo[key] = fr.result; cb(fr.result); };
          fr.readAsDataURL(b);
        })
        .catch(function () { cb(null); });
    },
    del: function (key, cb) {
      delete memo[key];
      req('DELETE', '/api/image/' + encodeURIComponent(key)).then(function () { cb && cb(true); }, function () { cb && cb(false); });
    },
    /* the URL form — much lighter than a data URL for an <img> */
    url: function (key) { return API + '/api/image/' + encodeURIComponent(key); }
  };

  /* ── 3 · the model ────────────────────────────────────────────────────────────────
     VAI is defined by 25_ai.js, which loads after this. So rather than defining it here
     and being overwritten, we wait for it and replace its three network methods. The
     key never reaches the browser; the server holds it. */
  window.VASERVER.attachAI = function () {
    if (typeof VAI === 'undefined') return false;
    VAI.vision = function (dataURL, prompt, schema) {
      return req('POST', '/api/ai/vision', { dataURL: dataURL, prompt: prompt, schema: schema });
    };
    VAI.json = function (prompt, schema, opts) {
      return req('POST', '/api/ai/json', { prompt: prompt, schema: schema, opts: opts || {} });
    };
    VAI.research = function (query, opts) {
      return req('POST', '/api/ai/research', { query: query, opts: opts || {} });
    };
    VAI.pace = function () { return { lanes: 6, gap: 120, server: true }; };
    VAI.setLanes = function () { /* the server decides its own concurrency */ };
    /* the server having a key counts as having one */
    var had = VAI.getKey;
    VAI.getKey = function (id) { return window.__VA_SERVER_KEY ? 'server' : had.call(VAI, id); };
    return true;
  };
})();
