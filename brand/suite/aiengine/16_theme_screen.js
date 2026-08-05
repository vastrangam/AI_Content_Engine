/* ═══════════ Vastrangam AI Engine — Themes screen (free + AI, fully editable) ═══════════ */
(function () {
  'use strict';
  var H = VA.H, esc = VA.esc, DB = function () { return VA.DB; };

  VA.view('themes', function () {
    var act = VTheme.active();
    return H.head('Themes', 'Themes', 'Free themes and an AI theme, applied live — switch one and every screen restyles. Every colour is editable, like Canva\'s brand kit.') +
      H.panel('Free themes',
        '<div class="tplgrid">' + VTheme.FREE.map(function (t) {
          var v = VTheme.derive(t);
          return '<div class="tpltile" data-act="themeset" data-id="' + t.id + '"' + (VTheme.isActive(t.id) ? ' style="border-color:var(--p2);box-shadow:0 0 0 2px var(--p2)"' : '') + '>' +
            '<div class="pv" style="background:linear-gradient(135deg,' + t.p1 + ',' + t.p2 + ')"><span style="background:' + t.gold + ';width:20px;height:20px;border-radius:50%;display:inline-block"></span></div>' +
            '<div class="cap">' + esc(t.name) + '<span>' + (VTheme.isActive(t.id) ? 'active' : 'apply') + '</span></div></div>';
        }).join('') + '</div>') +
      '<div class="two">' +
      H.panel('AI theme <span class="badge">from a prompt</span>',
        '<div class="fld"><label>Describe a mood, colour or occasion</label><input id="theme_prompt" placeholder="e.g. royal midnight blue and gold, luxury"></div>' +
        '<div class="btnrow" style="margin-top:9px"><button class="btn p" data-act="themeai"><svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg> Generate a theme</button></div>' +
        '<p class="hint" style="margin-top:8px">Works offline from the words you give it; if you have connected a model, it refines the palette. Applied instantly — tweak the colours below.</p>') +
      H.panel('Edit the active theme',
        editRow('Primary', 'p1', act.p1) + editRow('Secondary', 'p2', act.p2) + editRow('Gold / accent', 'gold', act.gold) +
        editRow('Background', 'bg', act.bg) + editRow('Ink / text', 'ink', act.ink) +
        '<label style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:12.5px"><input type="checkbox" id="theme_dark"' + (act.dark ? ' checked' : '') + ' onchange="VA.THEMEedit(\'dark\',this.checked)"> Dark theme</label>' +
        '<div class="btnrow" style="margin-top:10px"><button class="btn sm" data-act="themereset">Reset to Vastrangam Purple</button></div>') +
      '</div>';
  });
  function editRow(label, k, val) {
    return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><input type="color" value="' + val + '" oninput="VA.THEMEedit(\'' + k + '\',this.value)" style="width:38px;height:34px;border:1px solid var(--line2);border-radius:8px;cursor:pointer;padding:2px;background:#fff">' +
      '<div style="flex:1"><div style="font-size:12.5px;font-weight:600">' + esc(label) + '</div><div class="hint mono" style="font-size:11px">' + val + '</div></div></div>';
  }

  VA.action('themeset', function (b) { var t = VTheme.FREE.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0]; if (t) { VTheme.apply(t); VA.toast('Theme: ' + t.name); VA.render(); } });
  VA.action('themereset', function () { VTheme.apply(VTheme.FREE[0]); VA.render(); VA.toast('Reset'); });
  VA.action('themeai', function () {
    var prompt = VA.val('theme_prompt') || 'vastrangam festive purple gold';
    var t = VTheme.fromPrompt(prompt); VTheme.apply(t); VA.render(); VA.toast('AI theme applied — tweak it below');
    /* if a model is connected, refine asynchronously */
    if (VAI && VAI.anyText()) {
      VAI.callText('Give ONLY a JSON object with hex colours for a UI theme matching "' + prompt + '": {"p1","p2","gold","bg","ink"}. Deep primary, lighter secondary, contrasting accent, pale background (or dark if asked), readable ink. No prose.', { max: 200, fallback: '' })
        .then(function (r) { try { var m = r.text.match(/\{[^}]+\}/); if (m) { var j = JSON.parse(m[0]); if (j.p1 && j.bg) { j.id = 'ai'; j.name = 'AI theme · ' + prompt.slice(0, 20); j.dark = VTheme.active().dark; VTheme.apply(j); VA.render(); VA.toast('Refined by ' + r.provider); } } } catch (e) {} });
    }
  });
  VA.THEMEedit = function (k, v) { var t = VTheme.active(); t[k] = v; t.id = 'custom'; t.name = 'Custom'; VTheme.apply(t); if (k === 'dark') VA.render(); };
})();
