/* ═══════════ Vastrangam AI Engine — Publisher (channels, calendar, publish log) ═══════════ */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };
  function chMeta(id) { return LIB.CHANNELS.filter(function (c) { return c.id === id; })[0] || { name: id, c: '#5B2D8E', ab: '?' }; }

  VA.view('pub', function () {
    var d = DB();
    var conn = d.channels.filter(function (c) { return c.connected; }).length;
    var sched = d.calendar.filter(function (c) { return c.status === 'Scheduled'; }).length;
    var tab = d.pubTab || 'calendar';
    var out = H.head('Publisher', 'Publisher', 'Push a content run to every channel from one screen. Preview the exact per-channel payload, schedule it on the calendar, and watch the publish log. Nothing static — the calendar and log recompute on every change.') +
      H.kpis([
        { l: 'Channels connected', v: conn + '/' + d.channels.length, d: 'ready to publish', icon: 'plug', tone: 'gold' },
        { l: 'Scheduled', v: sched, d: 'on the calendar', icon: 'cal', tone: 'blue' },
        { l: 'Published', v: d.publog.length, d: 'in the log', icon: 'send', tone: 'green' },
        { l: 'Runs to publish', v: d.runs.filter(function (r) { return r.pack; }).length, d: 'content packs', icon: 'pen', tone: 'violet' }
      ]) +
      '<div class="chiprow" style="margin:4px 0 16px">' +
      [['calendar', 'Calendar'], ['schedule', 'Schedule a run'], ['channels', 'Channels'], ['log', 'Publish log'], ['webhook', 'Webhook']].map(function (t) {
        return '<button class="chip' + (tab === t[0] ? ' on' : '') + '" data-act="pubtab" data-t="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>';
    if (tab === 'calendar') out += calendarTab(d);
    else if (tab === 'schedule') out += scheduleTab(d);
    else if (tab === 'channels') out += channelsTab(d);
    else if (tab === 'log') out += logTab(d);
    else if (tab === 'webhook') out += webhookTab(d);
    return out;
  });
  VA.action('pubtab', function (b) { DB().pubTab = b.getAttribute('data-t'); VA.save(); VA.render(); });

  function calendarTab(d) {
    var now = new Date(), y = now.getFullYear(), mo = now.getMonth();
    var first = new Date(y, mo, 1), startDow = first.getDay(), days = new Date(y, mo + 1, 0).getDate();
    var cells = '';
    var dh = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(function (x) { return '<div class="dh">' + x + '</div>'; }).join('');
    for (var i = 0; i < startDow; i++) cells += '<div class="cell mut"></div>';
    for (var dd = 1; dd <= days; dd++) {
      var iso = y + '-' + String(mo + 1).padStart(2, '0') + '-' + String(dd).padStart(2, '0');
      var evs = d.calendar.filter(function (c) { return c.date === iso; });
      cells += '<div class="cell"><div class="dn">' + dd + '</div>' + evs.map(function (e) {
        var m = chMeta(e.platform); var col = e.status === 'Published' ? '#2E9E6B' : m.c;
        return '<div class="ev" style="background:' + col + '22;color:' + col + '" title="' + esc(e.hook) + '">' + m.ab + ' ' + esc(e.format) + '</div>';
      }).join('') + '</div>';
    }
    return H.panel(monthName(mo) + ' ' + y + ' <span class="badge">' + d.calendar.length + ' scheduled/published</span>',
      '<div class="cal">' + dh + cells + '</div>') +
      H.panel('Everything on the calendar', H.table([
        { label: 'Date', k: 'date', cellcls: 'mono' },
        { label: 'Channel', fmt: function (e) { var m = chMeta(e.platform); return '<span class="channel" style="border:0;padding:0;margin:0;background:none"><span class="ci" style="background:' + m.c + ';width:22px;height:22px;font-size:10px">' + m.ab + '</span> ' + esc(m.name) + '</span>'; } },
        { label: 'Format', k: 'format' },
        { label: 'Hook', fmt: function (e) { return esc(e.hook); } },
        { label: 'Status', fmt: function (e) { return H.tag(e.status, e.status === 'Published' ? 'grn' : 'amb'); } },
        { label: '', fmt: function (e) { return e.status === 'Scheduled' ? '<button class="btn sm p" data-act="pubnow" data-id="' + e.id + '">Publish now</button>' : '<button class="btn sm gh d" data-act="calunsched" data-id="' + e.id + '">✕</button>'; } }
      ], d.calendar.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; })));
  }
  function monthName(m) { return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m]; }

  function scheduleTab(d) {
    var runs = d.runs.filter(function (r) { return r.pack; });
    return H.panel('Schedule a content run',
      '<div class="form f2">' + H.fields([
        { id: 'sc_run', label: 'Which run', type: 'select', options: runs.map(function (r) { return { v: r.id, label: r.pack.sku + ' · ' + r.pack.colour + ' ' + r.pack.cat }; }) },
        { id: 'sc_date', label: 'Date', ph: VA.todayISO(), value: VA.todayISO() },
        { id: 'sc_format', label: 'Format', type: 'select', options: ['Listing', 'Reel', 'Post', 'Story', 'Carousel', 'Ad'] }
      ]) + '<div class="fld full"><label>Channels</label><div class="chiprow" id="sc_chips">' +
        d.channels.map(function (c) { return '<button class="chip" data-act="scchip" data-id="' + c.id + '">' + esc(c.name) + (c.connected ? '' : ' <span class="hint">(not connected)</span>') + '</button>'; }).join('') + '</div></div>' +
        '<div class="fld full"><button class="btn p" data-act="scadd">Schedule to selected channels</button></div></div>' +
        '<p class="hint" style="margin-top:8px">Select one or more channels above, then schedule. Each becomes a calendar entry you can publish.</p>') +
      (d.pubDraft ? H.panel('Loaded from Content Engine', '<div class="good">Ready to schedule: <b>' + esc(d.pubDraft.sku) + '</b> — ' + esc(d.pubDraft.title) + '</div>') : '') +
      H.panel('Per-channel payload preview', payloadPreview(d, runs));
  }
  var scSel = {};
  VA.action('scchip', function (b) { var id = b.getAttribute('data-id'); scSel[id] = !scSel[id]; b.classList.toggle('on'); });
  VA.action('scadd', function () {
    var runId = VA.val('sc_run'), date = VA.val('sc_date') || VA.todayISO(), format = VA.val('sc_format');
    var run = DB().runs.filter(function (r) { return r.id === runId; })[0]; if (!run) { VA.toast('Pick a run'); return; }
    var chans = Object.keys(scSel).filter(function (k) { return scSel[k]; });
    if (!chans.length) { VA.toast('Select at least one channel'); return; }
    chans.forEach(function (ch) {
      DB().calendar.push({ id: VA.uid('c'), date: date, platform: ch, format: format, hook: run.pack.title, product: run.pack.sku, status: 'Scheduled' });
    });
    scSel = {}; DB().pubTab = 'calendar'; VA.save(); VA.toast('Scheduled to ' + chans.length + ' channel(s)'); VA.render();
  });
  function payloadPreview(d, runs) {
    var run = runs[runs.length - 1]; if (!run) return '<div class="empty">Generate a content run first.</div>';
    var p = run.pack;
    var shopify = 'Handle: ' + p.handle + '\nTitle: ' + p.title + '\nPrice: ' + p.price + '  Compare-at: ' + p.mrp + '\nSEO: ' + p.meta.title;
    var insta = 'Caption:\n' + p.social.post.split('\n\n').slice(0, 2).join('\n\n') + '\n[+ ' + p.social.hashtags.length + ' hashtags]';
    var amazon = 'Title: ' + p.marketplace.amazon.title.slice(0, 80) + '…\nBullet 1: ' + p.marketplace.amazon.bullets[0];
    return '<div class="two">' +
      '<div><b style="font-size:12px;color:var(--mut)">SHOPIFY</b><pre class="out">' + esc(shopify) + '</pre></div>' +
      '<div><b style="font-size:12px;color:var(--mut)">INSTAGRAM</b><pre class="out">' + esc(insta) + '</pre></div>' +
      '<div><b style="font-size:12px;color:var(--mut)">AMAZON</b><pre class="out">' + esc(amazon) + '</pre></div>' +
      '<div><b style="font-size:12px;color:var(--mut)">MEESHO</b><pre class="out">' + esc(p.marketplace.meesho) + '</pre></div>' +
      '</div><p class="hint" style="margin-top:8px">Each channel gets the copy shaped for it — the same run, five different voices. Nothing is invented at publish time; it is read from the run.</p>';
  }

  function channelsTab(d) {
    return H.panel('Channels <span class="badge">' + d.channels.filter(function (c) { return c.connected; }).length + ' connected</span>',
      d.channels.map(function (c) {
        var m = chMeta(c.id);
        return '<div class="channel"><div class="ci" style="background:' + m.c + '">' + m.ab + '</div>' +
          '<div class="cn"><b>' + esc(c.name) + '</b><span>' + esc(c.mode) + '</span></div>' +
          '<button class="btn sm ' + (c.connected ? 'd' : 'p') + '" data-act="chtoggle" data-id="' + c.id + '">' + (c.connected ? 'Disconnect' : 'Connect') + '</button></div>';
      }).join('')) +
      H.note('Connections use a scoped, revocable API key — never your marketplace or bank password. <b>Vastrangam AI Engine will never ask you for an account password.</b> If any screen ever does, it is not this app.');
  }
  VA.action('chtoggle', function (b) {
    var c = DB().channels.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0];
    c.connected = !c.connected; c.mode = c.connected ? 'Connected — API key' : 'Not connected'; VA.save(); VA.render();
    VA.toast(c.name + (c.connected ? ' connected' : ' disconnected'));
  });

  function logTab(d) {
    return H.panel('Publish log <span class="badge">' + d.publog.length + '</span>',
      H.table([
        { label: 'When', k: 'at', cellcls: 'mono' },
        { label: 'Channel', fmt: function (e) { var m = chMeta(e.platform); return '<span class="ci" style="background:' + m.c + ';width:20px;height:20px;font-size:10px;display:inline-grid">' + m.ab + '</span> ' + esc(m.name); } },
        { label: 'Product', k: 'product', cellcls: 'mono' },
        { label: 'Result', fmt: function (e) { return H.tag(e.result, e.result === 'Published' ? 'grn' : e.result === 'Failed' ? 'red' : 'amb'); } },
        { label: 'Note', fmt: function (e) { return esc(e.note); } },
        { label: '', fmt: function (e) { return e.result === 'Failed' ? '<button class="btn sm" data-act="pubretry" data-id="' + e.id + '">Retry</button>' : ''; } }
      ], d.publog.slice().reverse()));
  }
  VA.action('pubnow', function (b) {
    var d = DB(), ev = d.calendar.filter(function (c) { return c.id === b.getAttribute('data-id'); })[0]; if (!ev) return;
    var ch = d.channels.filter(function (c) { return c.id === ev.platform; })[0];
    if (ch && !ch.connected) { d.publog.push({ id: VA.uid('pl'), at: VA.todayISO() + ' now', platform: ev.platform, product: ev.product, result: 'Failed', note: 'channel not connected' }); VA.save(); VA.toast('Failed — connect the channel first'); VA.render(); return; }
    ev.status = 'Published';
    d.publog.push({ id: VA.uid('pl'), at: VA.todayISO() + ' now', platform: ev.platform, product: ev.product, result: 'Published', note: 'ok' });
    VA.save(); VA.toast('Published to ' + chMeta(ev.platform).name); VA.render();
  });
  VA.action('pubretry', function (b) {
    var e = DB().publog.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0]; if (e) { e.result = 'Published'; e.note = 'retried — ok'; VA.save(); VA.toast('Retried'); VA.render(); }
  });
  VA.action('calunsched', function (b) { var d = DB(); d.calendar = d.calendar.filter(function (c) { return c.id !== b.getAttribute('data-id'); }); VA.save(); VA.render(); });

  function webhookTab(d) {
    var run = d.runs.filter(function (r) { return r.pack; }).slice(-1)[0];
    var payload = run ? run.pack.webhook : '{ "status": "no run yet" }';
    return H.panel('Make / n8n webhook <span class="badge">automation handoff</span>',
      '<p class="hint">The payload the automation layer receives when a run is pushed. Valid JSON, lowercase snake_case keys — ready for Make or n8n.</p>' +
      '<pre class="out">' + esc(payload) + '</pre>' +
      '<div class="btnrow" style="margin-top:10px"><button class="btn sm p cp" data-act="copytext" data-id="whp">Copy payload</button></div>' +
      '<div id="whp" style="display:none">' + esc(payload) + '</div>') +
      H.note('Not locked to Make or n8n — the same JSON drives Zapier, Pabbly, or a plain webhook. No single automation tool required.');
  }
})();
