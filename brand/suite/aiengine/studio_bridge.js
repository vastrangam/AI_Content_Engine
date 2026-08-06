/* ═══════════ bridge injected into Vastrangam Image Studio Pro ═══════════
   The studio itself is embedded byte-for-byte — its UI, queue, watermark eraser, split,
   SKU stamp, batch and language toggle are all exactly as built. This script is the ONLY
   addition, and it only talks to the outside: it accepts photos from the Catalogue and
   reports edited results back. Nothing in the tool's own code is modified. */
(function () {
  'use strict';
  function post(msg) { try { parent.postMessage(msg, '*'); } catch (e) {} }

  function dataURLtoFile(url, name, cb) {
    try {
      var parts = String(url).split(','), mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/jpeg';
      var bin = atob(parts[1]), arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      cb(new File([arr], name || 'image.jpg', { type: mime }));
    } catch (e) { cb(null); }
  }

  window.addEventListener('message', function (ev) {
    var d = ev.data || {};

    /* Catalogue → Studio: put these photos in the queue */
    if (d.type === 'va-add-images' && d.images && d.images.length) {
      var files = [], left = d.images.length;
      d.images.forEach(function (it, i) {
        dataURLtoFile(it.url, it.name, function (f) {
          if (f) files[i] = f;
          if (!--left) {
            var list = files.filter(Boolean);
            if (list.length && typeof loadFiles === 'function') {
              loadFiles(list);
              /* prefill each entry's metadata from the catalogue, once it has loaded */
              if (d.meta) setTimeout(function () {
                try {
                  entries.forEach(function (e) {
                    var m = d.meta[e.name] || d.meta[e.name + '.jpg'];
                    if (m) {
                      e.meta.title = m.title || e.meta.title;
                      e.meta.sku = m.sku || e.meta.sku;
                      e.meta.color = m.colour || e.meta.color;
                      e.meta.desc = m.desc || e.meta.desc;
                      e.meta.alt = m.alt || e.meta.alt;
                    }
                  });
                  if (typeof renderQueue === 'function') renderQueue();
                } catch (e2) {}
              }, 400);
            }
            post({ type: 'va-added', count: list.length });
          }
        });
      });
    }

    /* pass the key through so it never has to be typed twice */
    if (d.type === 'va-key' && d.key) {
      var el = document.getElementById('gemini-key');
      if (el) { el.value = d.key; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
    }

    /* Studio → Catalogue: hand back every finished image */
    if (d.type === 'va-collect') {
      var out = [];
      try {
        (entries || []).forEach(function (e) {
          var cv = e.edited || null;
          if (!cv && e.img) {
            cv = document.createElement('canvas');
            cv.width = e.img.naturalWidth || e.img.width;
            cv.height = e.img.naturalHeight || e.img.height;
            cv.getContext('2d').drawImage(e.img, 0, 0);
          }
          if (cv) out.push({ name: e.name, meta: e.meta, url: cv.toDataURL('image/jpeg', 0.92) });
        });
      } catch (e3) {}
      post({ type: 'va-collected', images: out });
    }
  });

  /* let the parent know the tool is up and how many photos are already queued */
  function ready() { post({ type: 'va-studio-ready', queued: (window.entries || []).length }); }
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready);
})();
