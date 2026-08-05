/* ═══════════ Vastrangam AI Engine — image store (IndexedDB) ═══════════
   localStorage cannot hold 20–30 full-resolution photos. Image bytes live in IndexedDB;
   the DB only keeps lightweight records (id, name, metadata) that point at a blob key.
   Everything degrades gracefully if IndexedDB is unavailable (falls back to an in-memory map). */
var VStore = (function () {
  'use strict';
  var DBNAME = 'vastrangam_ai_images', STORE = 'blobs', db = null, mem = {}, ready = false;

  function open(cb) {
    if (ready) return cb && cb();
    if (!window.indexedDB) { ready = true; return cb && cb(); }
    try {
      var req = indexedDB.open(DBNAME, 1);
      req.onupgradeneeded = function (e) { var d = e.target.result; if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE); };
      req.onsuccess = function (e) { db = e.target.result; ready = true; cb && cb(); };
      req.onerror = function () { ready = true; cb && cb(); };
    } catch (e) { ready = true; cb && cb(); }
  }
  function put(key, blob, cb) {
    open(function () {
      if (!db) { mem[key] = blob; return cb && cb(key); }
      try { var t = db.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(blob, key); t.oncomplete = function () { cb && cb(key); }; t.onerror = function () { mem[key] = blob; cb && cb(key); }; }
      catch (e) { mem[key] = blob; cb && cb(key); }
    });
  }
  function get(key, cb) {
    open(function () {
      if (mem[key]) return cb(mem[key]);
      if (!db) return cb(null);
      try { var r = db.transaction(STORE, 'readonly').objectStore(STORE).get(key); r.onsuccess = function () { cb(r.result || null); }; r.onerror = function () { cb(null); }; }
      catch (e) { cb(null); }
    });
  }
  function del(key, cb) {
    open(function () { delete mem[key]; if (!db) return cb && cb(); try { db.transaction(STORE, 'readwrite').objectStore(STORE).delete(key); } catch (e) {} cb && cb(); });
  }
  /* convenience: store a data URL, get it back as a data URL (for canvas use) */
  function putDataURL(key, dataURL, cb) { put(key, dataURLtoBlob(dataURL), cb); }
  function getDataURL(key, cb) { get(key, function (blob) { if (!blob) return cb(null); var r = new FileReader(); r.onload = function () { cb(r.result); }; r.readAsDataURL(blob); }); }
  function getImage(key, cb) { getDataURL(key, function (u) { if (!u) return cb(null); var im = new Image(); im.onload = function () { cb(im); }; im.onerror = function () { cb(null); }; im.src = u; }); }
  function dataURLtoBlob(u) { var p = u.split(','), mime = (p[0].match(/:(.*?);/) || [])[1] || 'image/png', b = atob(p[1]), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return new Blob([a], { type: mime }); }

  return { open: open, put: put, get: get, del: del, putDataURL: putDataURL, getDataURL: getDataURL, getImage: getImage, dataURLtoBlob: dataURLtoBlob };
})();
