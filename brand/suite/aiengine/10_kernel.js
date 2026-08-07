/* ═══════════ Vastrangam AI Engine — runtime kernel ═══════════
   One global VA. Everything is a view function returning HTML + an actions map.
   State lives in VA.DB, persisted to localStorage. Nothing static: every screen is
   recomputed on render, every button is wired through one delegated click handler. */
var VA = (function () {
  'use strict';
  var KEY = 'vastrangam_ai_engine_v1';
  var DB = {}, VIEWS = {}, ACTIONS = {}, NAV = [], TESTS = [], state = { view: 'home' };

  /* ── tiny utils ── */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function r2(n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; }
  function num(n) { return (n == null || n === '' || isNaN(n)) ? 0 : Number(n); }
  function inr(n) { return '₹' + Number(r2(n)).toLocaleString('en-IN'); }
  function money(n) { return inr(n); }
  function uid(p) { return (p || 'id') + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e4).toString(36); }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function $(id) { return document.getElementById(id); }

  /* ── icons (inline stroke svg, no external font) ── */
  var IC = {
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    pen: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z',
    image: 'M3 3h18v18H3zM3 15l5-5 4 4 3-3 6 6', img2: 'M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
    film: 'M2 3h20v18H2zM7 3v18M17 3v18M2 8h5M17 8h5M2 16h5M17 16h5',
    layout: 'M3 3h18v18H3zM3 9h18M9 21V9',
    send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
    layers: 'M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5',
    upload: 'M12 15V3M7 8l5-5 5 5M5 21h14',
    plug: 'M9 2v6M15 2v6M7 8h10v4a5 5 0 01-10 0zM12 17v5',
    flow: 'M4 4h6v6H4zM14 14h6v6h-6zM10 7h4M17 10v4M7 10v7h7',
    save: 'M5 3h14l2 2v16H3V3zM7 3v6h10V3M7 21v-7h10v7',
    users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.8',
    spark: 'M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
    chat: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
    check: 'M20 6L9 17l-5-5', bell: 'M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',
    coin: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v12M9 9h4.5a1.5 1.5 0 010 3H9m0 0h4.5a1.5 1.5 0 010 3H9',
    cal: 'M3 4h18v18H3zM3 9h18M8 2v4M16 2v4', book: 'M4 4h13a2 2 0 012 2v14H6a2 2 0 01-2-2zM4 4v14',
    doc: 'M6 2h9l5 5v15H6zM15 2v5h5', crop: 'M6 2v14a2 2 0 002 2h14M2 6h14a2 2 0 012 2v14',
    type: 'M4 7V4h16v3M9 20h6M12 4v16', shapes: 'M8.5 3l5.5 9H3zM17.5 22a4.5 4.5 0 100-9 4.5 4.5 0 000 9z',
    move: 'M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20',
    play: 'M5 3l14 9-14 9z', download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
    magic: 'M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8l1.4 1.4M17.8 6.2l1.4-1.4M3 21l9-9M12.2 6.2L10.8 4.8',
    tag: 'M20 10l-8 8-9-9V3h6zM7 7h.01', eye: 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z',
    reset: 'M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8M3 3v5h5', trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    plus: 'M12 5v14M5 12h14', star: 'M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z',
    globe: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 010 20a15 15 0 010-20',
    music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z',
    cart: 'M9 22a1 1 0 100-2 1 1 0 000 2zM20 22a1 1 0 100-2 1 1 0 000 2zM1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6'
  };
  function icon(n, cls) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' + (cls || '') + '"><path d="' + (IC[n] || IC.grid) + '"/></svg>'; }

  /* ── HTML component helpers ── */
  var H = {
    head: function (crumb, title, sub) {
      return '<div class="h"><div class="crumb">' + esc(crumb) + '</div><h1>' + esc(title) + '</h1>' +
        (sub ? '<p>' + sub + '</p>' : '') + '</div>';
    },
    kpis: function (arr, cls) {
      return '<div class="kpis ' + (cls || '') + '">' + arr.map(function (k) {
        return '<div class="kpi tone-' + (k.tone || 'violet') + '"><div class="ic">' + icon(k.icon || 'spark') + '</div>' +
          '<div class="l">' + esc(k.l) + '</div><div class="v ' + (k.cls || '') + '">' + k.v + '</div>' +
          '<div class="d">' + esc(k.d || '') + '</div></div>';
      }).join('') + '</div>';
    },
    panel: function (title, body, foot) {
      return '<div class="panel">' + (title ? '<div class="ph">' + title + '</div>' : '') + body +
        (foot ? '<div class="btnrow" style="margin-top:12px">' + foot + '</div>' : '') + '</div>';
    },
    table: function (cols, rows, foot) {
      var th = cols.map(function (c) { return '<th class="' + (c.align === 'r' ? 'r' : '') + '">' + esc(c.label) + '</th>'; }).join('');
      var body = rows.length ? rows.map(function (r) {
        return '<tr>' + cols.map(function (c) {
          var v = c.fmt ? c.fmt(r) : esc(r[c.k]);
          var cc = typeof c.cellcls === 'function' ? c.cellcls(r) : (c.cellcls || '');
          return '<td class="' + (c.align === 'r' ? 'r ' : '') + cc + '">' + v + '</td>';
        }).join('') + '</tr>';
      }).join('') : '<tr><td colspan="' + cols.length + '"><div class="empty">Nothing here yet.</div></td></tr>';
      return '<div class="tblwrap"><table class="tbl"><thead><tr>' + th + '</tr></thead><tbody>' + body + '</tbody></table></div>' +
        (foot ? '<div class="btnrow" style="margin-top:11px">' + foot + '</div>' : '');
    },
    tag: function (t, k) { return '<span class="tag t-' + (k || 'gray') + '">' + esc(t) + '</span>'; },
    bar: function (pct) { return '<div class="bar"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%"></i></div>'; },
    note: function (t) { return '<div class="note">' + t + '</div>'; },
    fields: function (fs) {
      return fs.map(function (f) {
        var w = f.wide || f.full ? ' full' : '';
        var lab = '<label>' + esc(f.label) + '</label>';
        var inp;
        if (f.type === 'select') inp = '<select id="' + f.id + '">' + (f.options || []).map(function (o) {
          var v = typeof o === 'object' ? o.v : o, l = typeof o === 'object' ? o.label : o;
          return '<option value="' + esc(v) + '"' + (String(f.value) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>';
        }).join('') + '</select>';
        else if (f.type === 'textarea') inp = '<textarea id="' + f.id + '" placeholder="' + esc(f.ph || '') + '">' + esc(f.value || '') + '</textarea>';
        else inp = '<input id="' + f.id + '" type="' + (f.type === 'num' ? 'number' : 'text') + '" value="' + esc(f.value == null ? '' : f.value) + '" placeholder="' + esc(f.ph || '') + '">';
        return '<div class="fld' + w + '">' + lab + inp + '</div>';
      }).join('');
    },
    form: function (fs, submit, act, cls) {
      return '<div class="form ' + (cls || 'f2') + '">' + H.fields(fs) +
        '<div class="fld full"><button class="btn p" data-act="' + act + '">' + esc(submit) + '</button></div></div>';
    },
    copy: function (id) { return '<button class="btn sm cp" data-act="copy" data-t="' + id + '">Copy</button>'; }
  };
  function val(id) { var e = $(id); return e ? e.value : ''; }

  /* ── persistence ── */
  /* localStorage is ~5 MB. v3 put 768px analysis copies of every photo inside the DB, so a
     real 30-photo upload reached 11 MB and setItem threw — silently, because this used to
     swallow the error and only dim a badge. Nothing persisted, and after a reload the
     self-tests failed. Photos now live in IndexedDB; this stays quota-aware anyway, so a
     full disk can never again fail quietly. */
  var SCHEMA = 3;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(DB)); setSaved(true); return true; }
    catch (e) {
      /* first casualty is the AI response cache — it is an optimisation, never data */
      try { localStorage.removeItem('vastrangam_ai_cache_v1'); } catch (e2) {}
      try { localStorage.setItem(KEY, JSON.stringify(DB)); setSaved(true); return true; }
      catch (e3) {
        setSaved(false);
        warnQuota(e3);
        return false;
      }
    }
  }
  function warnQuota(e) {
    var kb = 0; try { kb = Math.round(JSON.stringify(DB).length / 1024); } catch (x) {}
    if (typeof toast === 'function') toast('Storage full — your work is NOT being saved (' + kb + ' KB). Export a backup from Backup & Health.');
    var el = $('saved');
    if (el) el.title = 'Browser storage is full (' + kb + ' KB). ' + String(e && e.name || e);
    try { console.error('[Vastrangam] localStorage quota exceeded at', kb, 'KB —', e); } catch (x) {}
  }

  function load(SEED) {
    var raw = null; try { raw = localStorage.getItem(KEY); } catch (e) {}
    if (raw) { try { DB = JSON.parse(raw); } catch (e) { DB = {}; } }
    if (!DB || !DB.__v) { DB = SEED(); DB.__v = SCHEMA; save(); return; }
    if (DB.__v < SCHEMA) migrate(SEED);
  }
  /* upgrade an older stored database in place rather than half-using it */
  function migrate(SEED) {
    var seed = SEED(), k;
    /* backfill any key the newer seed has that the stored DB does not */
    for (k in seed) if (Object.prototype.hasOwnProperty.call(seed, k) && DB[k] === undefined) DB[k] = seed[k];
    /* v3 moved photos out of the record — drop any inline pixel payload left behind */
    if (Array.isArray(DB.catPending)) {
      DB.catPending.forEach(function (r) { delete r.small; if (r.thumb && r.thumb.length > 8000) delete r.thumb; });
    }
    DB.__v = SCHEMA;
    save();
  }
  function setSaved(ok) {
    var e = $('saved'); if (!e) return;
    e.className = 'saved' + (ok ? '' : ' warn');
    e.innerHTML = '<b></b>' + (ok ? 'saved' : 'session only');
  }

  /* ── router / render ── */
  /* Navigate. This calls VA.render, NOT the local render — several modules wrap VA.render to
     do work after a screen is drawn (making edit fields editable, positioning the studio
     frame, refreshing the assistant). Calling the local one silently skipped all of them on
     every navigation, so those features only worked when something else happened to call
     VA.render directly. */
  function go(v) {
    state.view = v;
    var sh = $('shell'); if (sh) sh.classList.remove('open');
    (VA && VA.render ? VA.render : render)();
    window.scrollTo(0, 0);
  }
  var lastView = null;
  function render() {
    var v = state.view, fn = VIEWS[v] || VIEWS.home;
    var m = $('main');
    m.innerHTML = fn();
    /* the entrance stagger belongs to ARRIVING somewhere, not to every keystroke — a run in
       progress re-renders many times a minute, and animating that would be seasick */
    m.classList.toggle('fresh', v !== lastView);
    lastView = v;
    [].forEach.call(document.querySelectorAll('#nav a[data-v]'), function (a) {
      a.className = a.getAttribute('data-v') === v ? 'on' : '';
    });
    /* the counts beside each screen were computed once at boot, so they still read zero after
       you had uploaded a catalogue — they are live now */
    NAV.forEach(function (g) {
      g.items.forEach(function (it) {
        if (!it.badge) return;
        var el = document.querySelector('#nav a[data-v="' + it.v + '"] .badge');
        if (el) { try { el.textContent = it.badge(); } catch (e) {} }
      });
    });
    if (typeof fn.after === 'function') try { fn.after(); } catch (e) { console.error(e); }
  }
  function toast(m) {
    var t = $('toast'); if (!t) return; t.textContent = m; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
  function modal(title, body) {
    var m = $('modal'); m.querySelector('.mh').innerHTML = esc(title) + '<button class="x" data-act="closemodal" style="border:0;background:var(--surf);width:28px;height:28px;border-radius:8px;cursor:pointer">✕</button>';
    m.querySelector('.mb').innerHTML = body; m.classList.add('show');
  }
  function closeModal() { $('modal').classList.remove('show'); }

  /* ── self-tests ── */
  function runTests() {
    var log = [], pass = 0, fail = 0;
    function t(name, cond) { var ok = !!cond; log.push({ name: name, ok: ok }); ok ? pass++ : fail++; }
    var probe; try { probe = clone(DB); } catch (e) { probe = DB; }
    TESTS.forEach(function (fn) { try { fn(t, probe); } catch (e) { log.push({ name: 'threw: ' + e.message, ok: false }); fail++; } });
    VA.selftest = { pass: pass, fail: fail, log: log };
    return VA.selftest;
  }

  /* ── registration ── */
  function view(name, fn) { if (fn === undefined) return VIEWS[name]; VIEWS[name] = fn; return fn; }
  function action(name, fn) { ACTIONS[name] = fn; }
  /* fire a registered action without a click — the composer hands work off to another
     screen's own button rather than duplicating what that button does */
  function run(name, el) { var fn = ACTIONS[name]; if (fn) fn(el || document.createElement('button')); }
  function nav(groups) { NAV = groups; }
  function test(fn) { TESTS.push(fn); }

  function buildNav() {
    var html = NAV.map(function (g) {
      return '<div class="grp">' + esc(g.label) + '</div>' + g.items.map(function (it) {
        return '<a data-v="' + it.v + '">' + icon(it.icon) + '<span>' + esc(it.label) + '</span>' +
          (it.badge ? '<span class="badge">' + it.badge() + '</span>' : '') + '</a>';
      }).join('');
    }).join('');
    $('nav').innerHTML = html;
  }

  /* ── boot ── */
  function boot(SEED) {
    load(SEED);
    buildNav();
    runTests();
    render();
    setSaved(true);
    /* one delegated click handler for the whole app */
    document.body.addEventListener('click', function (e) {
      var nv = e.target.closest('#nav a[data-v]'); if (nv) { go(nv.getAttribute('data-v')); return; }
      var g = e.target.closest('[data-go]'); if (g) { go(g.getAttribute('data-go')); return; }
      var b = e.target.closest('[data-act]'); if (b) {
        var fn = ACTIONS[b.getAttribute('data-act')];
        if (fn) { e.preventDefault(); fn(b); }
      }
    });
    $('hamb').onclick = function () { $('shell').classList.toggle('open'); };
    $('navback').onclick = function () { $('shell').classList.remove('open'); };
  }

  return {
    get DB() { return DB; }, set DB(v) { DB = v; },
    H: H, icon: icon, esc: esc, r2: r2, num: num, inr: inr, money: money, uid: uid, slug: slug,
    clone: clone, todayISO: todayISO, val: val, save: save, go: go, render: render, toast: toast,
    modal: modal, closeModal: closeModal, view: view, action: action, run: run, nav: nav, test: test,
    runTests: runTests, boot: boot, state: state, $: $, actions: ACTIONS, views: VIEWS
  };
})();
