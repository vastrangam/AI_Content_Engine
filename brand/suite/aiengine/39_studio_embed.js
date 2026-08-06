/* ═══════════ Vastrangam AI Engine — Image Studio Pro, embedded whole ═══════════
   The previous Image Studio was a re-interpretation and it lost most of what the original
   tool did. This screen is the original tool itself, byte-for-byte, running in a frame:
   the same queue, watermark eraser with all six algorithms, multi-image split, SKU
   watermark, frames, batch CSV, output presets and the English/Hindi toggle.

   The only added code is a small bridge (studio_bridge.js) that lets the Catalogue push
   photos into its queue and pull the finished images back out. */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };
  var ready = false, pendingSend = null;

  VA.view('img', function () {
    var d = DB(), cats = d.catalogue || [];
    var queued = cats.reduce(function (s, p) { return s + p.variants.reduce(function (a, v) { return a + v.shots.filter(function (x) { return x.key; }).length; }, 0); }, 0);
    return H.head('Image Studio', 'Image Studio Pro', 'Your own editor, whole and unchanged — queue, watermark eraser, split, SKU stamp, frames, batch export and the language toggle. Catalogue photos load straight into its queue.') +
      '<div class="btnrow" style="margin-bottom:10px">' +
      '<button class="btn sm p" data-act="stusend">Load ' + queued + ' catalogue photo(s) into the queue</button>' +
      '<button class="btn sm" data-act="stucollect">Bring edited images back</button>' +
      '<button class="btn sm" data-act="stufull">Full screen</button>' +
      '<span class="hint" style="align-self:center">' + (ready ? 'studio ready' : 'starting…') + '</span></div>' +
      '<div id="stuslot" style="height:78vh;min-height:560px"></div>';
  });

  /* A Blob URL rather than srcdoc — srcdoc is an attribute and a 240 KB document in one is
     unreliable; a blob is a real document load. */
  var blobURL = null;
  function studioURL() {
    if (blobURL) return blobURL;
    if (typeof STUDIO_HTML !== 'string' || !STUDIO_HTML) return '';
    try { blobURL = URL.createObjectURL(new Blob([STUDIO_HTML], { type: 'text/html;charset=utf-8' })); }
    catch (e) { blobURL = ''; }
    return blobURL;
  }

  /* The frame lives OUTSIDE #main and is only positioned over it. The app re-renders #main
     on every state change, so an iframe inside it would be destroyed and reloaded each
     time — which both broke the load and would have thrown away the editing queue. Keeping
     it persistent means the queue, the undo history and the current edit all survive
     navigating away and back. */
  var host = null, frame = null;
  function ensureHost() {
    if (host) return host;
    host = document.createElement('div');
    host.id = 'stuhost';
    host.style.cssText = 'position:absolute;display:none;z-index:5;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff';
    frame = document.createElement('iframe');
    frame.id = 'stuframe';
    frame.style.cssText = 'width:100%;height:100%;border:0;display:block';
    host.appendChild(frame);
    document.body.appendChild(host);
    var u = studioURL();
    if (u) frame.src = u;
    else frame.srcdoc = '<p style="font:14px sans-serif;padding:20px">Studio not bundled.</p>';
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return host;
  }
  function place() {
    var slot = document.getElementById('stuslot');
    if (!host) return;
    if (!slot || VA.state.view !== 'img') { host.style.display = 'none'; return; }
    var r = slot.getBoundingClientRect();
    host.style.display = 'block';
    host.style.left = (r.left + window.scrollX) + 'px';
    host.style.top = (r.top + window.scrollY) + 'px';
    host.style.width = r.width + 'px';
    host.style.height = r.height + 'px';
  }
  VA.view('img').after = function () { ensureHost(); place(); };
  /* hide it the moment any other screen renders */
  var _render = VA.render;
  VA.render = function () { _render(); place(); };

  window.addEventListener('message', function (ev) {
    var d = ev.data || {};
    if (d.type === 'va-studio-ready') {
      ready = true;
      /* hand the key over so it is never typed twice */
      var k = VAI.getKey('gemini');
      if (k) send({ type: 'va-key', key: k });
      if (pendingSend) { send(pendingSend); pendingSend = null; }
      var hint = document.querySelector('#main .btnrow .hint');
      if (hint) hint.textContent = 'studio ready';
    }
    if (d.type === 'va-added') VA.toast(d.count + ' photo(s) loaded into the studio queue');
    if (d.type === 'va-collected') {
      var imgs = d.images || [];
      if (!imgs.length) { VA.toast('Nothing in the studio queue yet'); return; }
      var left = imgs.length, saved = 0;
      imgs.forEach(function (im) {
        var key = 'edt_' + VA.uid('');
        VStore.putDataURL(key, im.url, function () {
          DB().myAssets = DB().myAssets || [];
          DB().myAssets.unshift({ key: key, name: im.name || 'edited', from: 'image studio', at: VA.todayISO() });
          saved++;
          if (!--left) { VA.save(); VA.toast(saved + ' edited image(s) saved to My assets'); }
        });
      });
    }
  });

  /* "Wine Rayon Rayon Foilpan front" reads badly — the fabric and the product name often
     share a word. Drop the repeat, keep the first occurrence. */
  function dedupeWords(str) {
    var seen = {}, out = [];
    String(str).split(/\s+/).forEach(function (w) {
      var k = w.toLowerCase();
      if (k && seen[k]) return;
      seen[k] = 1; out.push(w);
    });
    return out.join(' ');
  }

  function send(msg) {
    var f = VA.$('stuframe');
    if (f && f.contentWindow) f.contentWindow.postMessage(msg, '*');
  }

  /* every catalogue photo, with its SKU metadata, into the studio queue */
  VA.action('stusend', function () {
    var cats = DB().catalogue || [], jobs = [], meta = {};
    cats.forEach(function (p) {
      p.variants.forEach(function (v) {
        v.shots.forEach(function (sh) {
          if (!sh.key) return;
          var base = String(sh.name || '').replace(/\.[^.]+$/, '');
          jobs.push({ key: sh.key, name: sh.name || (p.name + '-' + sh.pose + '.jpg') });
          meta[base] = {
            title: p.name + (v.colour ? ' — ' + v.colour : ''),
            sku: (p.baseKey || '') + (v.colour ? '_' + String(v.colour).toUpperCase().replace(/\s+/g, '_') : ''),
            colour: v.colour || '',
            desc: [p.details && p.details.fabric, p.details && p.details.work].filter(Boolean).join(' · '),
            alt: dedupeWords([v.colour, p.details && p.details.fabric, p.name, sh.pose].filter(Boolean).join(' ')) + ' by Vastrangam'
          };
        });
      });
    });
    if (!jobs.length) { VA.toast('Upload a catalogue first'); return; }
    VA.toast('Loading ' + jobs.length + ' photo(s)…');
    var out = [], left = jobs.length;
    jobs.forEach(function (j, i) {
      VStore.getDataURL(j.key, function (u) {
        if (u) out[i] = { url: u, name: j.name };
        if (!--left) {
          var msg = { type: 'va-add-images', images: out.filter(Boolean), meta: meta };
          if (ready) send(msg); else pendingSend = msg;
        }
      });
    });
  });
  VA.action('stucollect', function () { send({ type: 'va-collect' }); });
  VA.action('stufull', function () {
    var w = host; if (!w) return;
    if (w.requestFullscreen) w.requestFullscreen();
    else VA.toast('Full screen not available in this browser');
  });

  VA.STUDIO = { send: send, isReady: function () { return ready; } };
})();
