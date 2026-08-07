/* ═══════════ Vastrangam AI Engine — nav + boot ═══════════ */
(function () {
  'use strict';
  VA.nav([
    { label: 'Workflow', items: [
      { v: 'home', label: 'Overview', icon: 'grid' },
      { v: 'cat', label: 'Catalogue', icon: 'upload', badge: function () { return (VA.DB.catalogue || []).length; } },
      /* Content Engine, Image Studio and Video Studio are all tabs of the AI Studio now.
         Their screens still exist and still work — they are simply not three more places to
         get lost in, which is what a merged screen is for. */
      { v: 'studio', label: 'AI Studio', icon: 'spark', badge: function () { return VA.DB.runs.length; } },
      { v: 'gallery', label: 'Templates', icon: 'grid', badge: function () { try { return VA.DESIGN.templates().length; } catch (e) { return 0; } } },
      { v: 'lib', label: 'Library', icon: 'layers', badge: function () { try { return (VA.DB.myAssets || []).length + VSTOCK.ASSETS.length; } catch (e) { return 0; } } },
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
    try { VTheme.apply(VTheme.load()); } catch (e) {}
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
