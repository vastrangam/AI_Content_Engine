/* ═══════════ Vastrangam AI Engine — Connectors as the free-first model router ═══════════
   Overrides the Connectors screen with the real router: free options first, paid last, keys
   pasted here and stored in the browser only (never committed). Every job still works with
   the built-in offline engine if nothing is connected. */
(function () {
  'use strict';
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
      '<div class="two">' +
      H.panel('Video · background removal', H.table([{ label: 'Capability', k: 'c' }, { label: 'Free (offline)', fmt: function (r) { return H.tag(r.f, 'grn'); } }, { label: 'Paid, last', k: 'p' }], [
        { c: 'Video render', f: 'WebM · GIF · frames', p: 'Veo · Kling · Runway (MP4)' },
        { c: 'Background removal', f: 'auto-cutout · AI model (once)', p: 'remove.bg paid' },
        { c: 'Automation', f: 'webhook JSON', p: 'Make · n8n · Zapier' }
      ])) +
      H.panel('The rule', '<div class="good">Nothing here is required. The app generates content, edits images, builds video and exports spreadsheets with <b>none of these connected</b>. Connect one only to upgrade a step — and swap it any time without touching the rest.</div>' +
        '<p class="hint" style="margin-top:9px">Your Gemini key is used for text and image generation on its free tier. It is stored only in this browser and never written into the file or the repository.</p>');
  });
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
