/* ═══════════ Vastrangam AI Engine — nav + boot ═══════════ */
(function () {
  'use strict';
  VA.nav([
    { label: 'Studio', items: [
      { v: 'home', label: 'Overview', icon: 'grid' },
      { v: 'ce', label: 'Content Engine', icon: 'pen', badge: function () { return VA.DB.runs.length; } },
      { v: 'img', label: 'Image Studio', icon: 'image' },
      { v: 'vid', label: 'Video Studio', icon: 'film' },
      { v: 'des', label: 'Design Studio', icon: 'layout' },
      { v: 'pub', label: 'Publisher', icon: 'send', badge: function () { return VA.DB.calendar.filter(function (c) { return c.status === 'Scheduled'; }).length; } }
    ] },
    { label: 'Your records', items: [
      { v: 'records', label: 'Records', icon: 'layers' },
      { v: 'files', label: 'Upload & download', icon: 'upload' }
    ] },
    { label: 'System', items: [
      { v: 'conn', label: 'Connectors', icon: 'plug' },
      { v: 'wiring', label: 'Wiring', icon: 'flow' },
      { v: 'backup', label: 'Backup & Health', icon: 'save' }
    ] }
  ]);

  /* keep the assistant dock in step with the current screen (contextual suggestions) */
  var _render = VA.render;
  VA.render = function () { _render(); var ask = VA.$('ask'); if (ask && ask.classList.contains('show')) VA.renderAsk(); };

  /* boot when DOM is ready */
  function start() {
    VA.boot(LIB.seed);
    /* the seed runs before the generator exists, so its example runs carry no pack yet —
       backfill a real one for each so they open, score QA and satisfy the self-tests. */
    var d = VA.DB, changed = false;
    (d.runs || []).forEach(function (r) {
      if (!r.pack) {
        r.pack = VA.CE.generate({ desc: r.title, colour: r.colour, fabric: r.fabric, work: r.work, occ: r.occ, cat: r.cat, label: r.label, price: r.price, sku: r.sku });
        r.qa = r.pack.qa.pct; r.title = r.pack.title;
        r.unique = VA.CE.uniqueness(r.pack, []); changed = true;
      }
    });
    if (changed) { VA.save(); VA.runTests(); VA.render(); }
    VA.renderAsk();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
