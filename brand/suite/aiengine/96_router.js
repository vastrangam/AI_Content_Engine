/* ═══════════ Vastrangam AI Engine — Connectors as the free-first model router ═══════════
   Overrides the Connectors screen with the real router: free options first, paid last, keys
   pasted here and stored in the browser only (never committed). Every job still works with
   the built-in offline engine if nothing is connected. */
(function () {
  'use strict';
  /* Design Studio and Themes were removed. Old links and saved deep-links still point at
     them, so send those to the screens that took their place rather than showing a blank. */
  var GONE = { des: 'gallery', themes: 'lib' };
  var _go = VA.go;
  VA.go = function (v) { return _go(GONE[v] || v); };
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  VA.view('conn', function () {
    var chain = VAI.textChain();
    return H.head('Connectors', 'Connectors · model router', 'Free options first, paid last. Paste a key and it stays in your browser — never in the file, never committed. Everything still works with the built-in offline engine if you connect nothing.') +
      H.kpis([
        { l: 'Text engine', v: chain.length ? VAI.prov(chain[0]).name.split(' ')[0] : 'Built-in', d: chain.length ? '+ offline fallback' : 'offline, no key', icon: 'chat', tone: 'violet' },
        { l: 'Image engine', v: VAI.getKey('gemini') ? 'Gemini' : 'Pollinations', d: VAI.getKey('gemini') ? 'free tier · your key' : 'free · no key', icon: 'image', tone: 'gold' },
        { l: 'Keys stored', v: Object.keys(VAI.cfg()).filter(function (k) { return VAI.cfg()[k]; }).length, d: 'in this browser only', icon: 'plug', tone: 'green' }
      ]) +
      H.panel('Text & chat <span class="badge">free first</span>',
        VAI.PROVIDERS.filter(function (p) { return p.kind !== 'image'; }).map(function (p) { return provRow(p); }).join('')) +
      H.panel('Images <span class="badge">free first</span>',
        VAI.PROVIDERS.filter(function (p) { return p.kind === 'image' || p.kind === 'both'; }).map(function (p) { return provRow(p); }).join('')) +
      diagPanel() +
      '<div class="two">' +
      H.panel('Video · background removal', H.table([{ label: 'Capability', k: 'c' }, { label: 'Free (offline)', fmt: function (r) { return H.tag(r.f, 'grn'); } }, { label: 'Paid, last', k: 'p' }], [
        { c: 'Video render', f: 'WebM · GIF · frames', p: 'Veo · Kling · Runway (MP4)' },
        { c: 'Background removal', f: 'auto-cutout · AI model (once)', p: 'remove.bg paid' },
        { c: 'Automation', f: 'webhook JSON', p: 'Make · n8n · Zapier' }
      ])) +
      H.panel('The rule', '<div class="good">Nothing here is required. The app generates content, edits images, builds video and exports spreadsheets with <b>none of these connected</b>. Connect one only to upgrade a step — and swap it any time without touching the rest.</div>' +
        '<p class="hint" style="margin-top:9px">Your Gemini key is used for text and image generation on its free tier. It is stored only in this browser and never written into the file or the repository.</p>');
  });
  /* ═══════ Diagnose ═══════
     "I checked all the models but the error keeps coming" is not something a user should
     ever have to do by hand. This asks the key which models it can use, then actually calls
     each one and prints the real HTTP status and Google's own error text. */
  function diagPanel() {
    var d = DB().aiDiag, shape = VAI.keyShape(VAI.getKey('gemini'));
    var body =
      '<p class="hint" style="margin-bottom:9px">Asks your key which models it can use, then makes a real call to each and shows exactly what came back. Use this instead of guessing model names.</p>' +
      '<div class="btnrow"><button class="btn sm p" data-act="aidiag">Run diagnosis</button>' +
      (d ? '<button class="btn sm" data-act="aidiagclear">Clear</button>' : '') + '</div>' +
      '<div style="margin-top:10px;padding:9px 11px;border-radius:8px;background:' + (shape.ok ? 'var(--surf2)' : '#FBEAE6') + ';font-size:12.5px">' +
      '<b>Key format:</b> ' + (shape.ok ? '✓ ' : '✗ ') + esc(shape.why) + '</div>' +
      '<div id="diagout">' + (d ? diagTable(d) : '') + '</div>';
    return H.panel('Diagnose the connection <span class="badge">which model works?</span>', body);
  }
  function diagTable(d) {
    var rows = d.models || [];
    return (d.listError ? '<div class="hint" style="margin-top:9px;color:#B4402F"><b>models.list failed:</b> ' + esc(d.listError) + '</div>' : '') +
      (d.available != null ? '<p class="hint" style="margin-top:9px">Your key can use <b>' + d.available + '</b> models. Tried the best candidates:</p>' : '') +
      (rows.length ? H.table([
        { label: 'Model', fmt: function (r) { return '<span class="mono" style="font-size:11.5px">' + esc(r.id) + '</span>'; } },
        { label: 'For', fmt: function (r) { return H.tag(r.kind, r.kind === 'image' ? 'amb' : 'vio'); } },
        { label: 'Result', fmt: function (r) { return r.ok ? H.tag('✓ works', 'grn') : H.tag(r.status ? 'HTTP ' + r.status : 'no reply', 'red'); } },
        { label: 'What came back', fmt: function (r) { return '<span class="hint" style="font-size:11px">' + esc(r.detail || '') + '</span>'; } }
      ], rows) : '<p class="hint" style="margin-top:9px">No result yet.</p>') +
      (rows.filter(function (r) { return r.ok; }).length
        ? '<div class="good" style="margin-top:10px">Working models found — the app has switched to the best one automatically. Nothing else to do.</div>'
        : rows.length ? '<div class="rule" style="margin-top:10px">Nothing worked. If every row says <b>400 API_KEY_INVALID</b> the key is wrong or truncated; <b>403</b> usually means the key is restricted to certain sites or the Generative Language API is not enabled; <b>429</b> means the free quota is spent for now. Create a fresh key at <b>aistudio.google.com/apikey</b>.</div>' : '');
  }
  VA.action('aidiag', function () {
    if (!VAI.getKey('gemini')) { VA.toast('Paste your Gemini key first'); return; }
    VA.toast('Diagnosing — calling each model for real…');
    var out = VA.$('diagout'); if (out) out.innerHTML = '<p class="hint" style="margin-top:9px">Testing models one at a time…</p>';
    VAI.diagnose(function (row, sofar) {
      var o = VA.$('diagout'); if (o) o.innerHTML = diagTable(sofar);
    }).then(function (res) {
      DB().aiDiag = res; VA.save();
      var okc = (res.models || []).filter(function (r) { return r.ok; }).length;
      if (okc) VAI.pickModels(true).catch(function () {});
      VA.render();
      VA.toast(okc ? okc + ' model(s) working — switched automatically' : 'No model worked — see the table');
    }).catch(function (e) { VA.toast('Diagnosis failed: ' + String(e.message || e).slice(0, 80)); });
  });
  VA.action('aidiagclear', function () { DB().aiDiag = null; VA.save(); VA.render(); });

  function provRow(p) {
    var have = p.key ? !!VAI.getKey(p.id) : true;
    var freeTag = p.free ? H.tag('free', 'grn') : H.tag('paid', 'amb');
    return '<div class="channel"><div class="ci" style="background:' + (p.free ? 'linear-gradient(96deg,#2E9E6B,#12909E)' : 'linear-gradient(96deg,#8B79A8,#6B5A86)') + '">' + (p.name[0]) + '</div>' +
      '<div class="cn"><b>' + esc(p.name) + ' ' + freeTag + '</b><span>' + esc(p.note) + '</span></div>' +
      (p.key ? '<div style="display:flex;gap:6px;align-items:center"><input id="k_' + p.id + '" type="password" value="' + esc(VAI.getKey(p.id)) + '" placeholder="paste key" style="width:150px;padding:6px 9px;border:1px solid var(--line2);border-radius:7px;font-size:12px">' +
        '<button class="btn sm p" data-act="savekey" data-id="' + p.id + '">Save</button>' + (p.id === 'gemini' || p.id === 'pollinations' ? '<button class="btn sm" data-act="testkey" data-id="' + p.id + '">Test</button>' : '') + '</div>'
        : '<span class="tag t-grn">no key needed</span>') + '</div>';
  }
  VA.action('savekey', function (b) { var id = b.getAttribute('data-id'); VAI.setKey(id, VA.val('k_' + id)); VA.toast(VAI.prov(id).name + ' key saved (this browser only)'); VA.render(); });
  VA.action('testkey', function (b) {
    var id = b.getAttribute('data-id'); VAI.setKey(id, VA.val('k_' + id) || VAI.getKey(id)); VA.toast('Testing ' + VAI.prov(id).name + '…');
    VAI.test(id, function (ok, msg) { VA.toast(VAI.prov(id).name + ': ' + msg); });
  });
})();
