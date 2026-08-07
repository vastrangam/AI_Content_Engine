/* ═══════════ Vastrangam AI Engine — click anything, change it ═══════════

   "no static page or button, i can click on any text, image, page, tab and i can edit"

   Any element carrying data-edit is editable in place. Click it, type, click away — it
   saves to the run's pack under that path and every screen reading that pack updates. No
   modal, no separate edit mode, no Save button to hunt for.

     <div class="ed" data-edit="social.post" data-sku="VL1029">…</div>

   The path is dotted and resolves into the pack, so "social.carousel.3" is slide four and
   "marketplace.amazon.title" is the Amazon title. An edit is your word: it is marked as
   yours, and a later AI pass will not overwrite it. */
(function () {
  'use strict';
  var DB = function () { return VA.DB; };

  function packFor(sku) {
    var runs = DB().runs || [];
    for (var i = runs.length - 1; i >= 0; i--) if (runs[i].pack && runs[i].pack.sku === sku) return runs[i];
    return null;
  }

  /* walk a dotted path and set the leaf; arrays are indexed numerically */
  function setPath(obj, path, value) {
    var parts = String(path).split('.'), o = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var k = parts[i];
      if (o[k] == null) o[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      o = o[k];
    }
    var last = parts[parts.length - 1];
    /* keep the original type — a number field must not silently become a string */
    var was = o[last];
    o[last] = (typeof was === 'number' && String(value).trim() !== '' && !isNaN(value)) ? Number(value) : value;
    return true;
  }
  function getPath(obj, path) {
    return String(path).split('.').reduce(function (o, k) { return (o == null) ? undefined : o[k]; }, obj);
  }

  function commit(el) {
    var path = el.getAttribute('data-edit'), sku = el.getAttribute('data-sku');
    if (!path) return;
    var run = sku ? packFor(sku) : null;
    var value = el.tagName === 'PRE' || el.getAttribute('data-html') !== 'true'
      ? el.innerText.replace(/ /g, ' ')
      : el.innerHTML;
    var before = el.getAttribute('data-was');
    if (before != null && before === value) return;      /* nothing changed */

    if (run) {
      setPath(run.pack, path, value);
      /* an edit is a fact about the product, not a suggestion — record it so a later AI
         phase leaves it alone, and so you can see what you have changed by hand */
      run.pack.edited = run.pack.edited || {};
      run.pack.edited[path] = true;
      /* the title and the SKU appear in several places; keep the record row in step */
      if (path === 'title') run.title = value;
      /* the QA gate scores what will actually ship, so re-score after every edit */
      try {
        run.pack.qa = VSPEC.qa(run.pack, (DB().runs || []).filter(function (r) { return r.id !== run.id; }));
        run.qa = run.pack.qa.pct;
      } catch (e) {}
    } else {
      /* an editable that is not tied to a pack still persists — brand fields, notes … */
      DB().edits = DB().edits || {};
      DB().edits[path] = value;
    }
    el.setAttribute('data-was', value);
    VA.save();
    VA.toast('Saved' + (run && run.pack.qa ? ' — QA now ' + run.pack.qa.pct + '%' : ''));
  }

  /* one delegated pair of listeners for the whole app, so anything rendered later is
     editable without being registered anywhere */
  document.addEventListener('focusin', function (e) {
    var el = e.target.closest && e.target.closest('[data-edit]');
    if (!el) return;
    el.setAttribute('data-was', el.innerText.replace(/ /g, ' '));
  });
  document.addEventListener('focusout', function (e) {
    var el = e.target.closest && e.target.closest('[data-edit]');
    if (el) commit(el);
  });
  document.addEventListener('keydown', function (e) {
    var el = e.target.closest && e.target.closest('[data-edit]');
    if (!el) return;
    /* Escape abandons the edit, Enter commits a single-line field */
    if (e.key === 'Escape') { el.innerText = el.getAttribute('data-was') || ''; el.blur(); }
    if (e.key === 'Enter' && el.getAttribute('data-multiline') !== 'true' && el.tagName !== 'PRE') {
      e.preventDefault(); el.blur();
    }
  });

  /* make every data-edit element contenteditable after each render — done here rather than
     in the markup so no view has to remember to add the attribute */
  var _render = VA.render;
  VA.render = function () {
    _render();
    [].forEach.call(document.querySelectorAll('[data-edit]'), function (el) {
      if (el.getAttribute('contenteditable') === 'true') return;
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'false');
      el.classList.add('ed');
      if (!el.getAttribute('title')) el.setAttribute('title', 'Click to edit · Esc to cancel');
    });
  };

  VA.EDIT = { setPath: setPath, getPath: getPath, commit: commit, packFor: packFor };
})();
