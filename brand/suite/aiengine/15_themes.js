/* ═══════════ Vastrangam AI Engine — theme engine ═══════════
   Free themes + an AI theme generator, applied live by writing CSS custom properties onto
   :root. Every colour is editable. The active theme (and any edits) are stored so they
   survive a reload. Nothing static — switch a theme and every screen restyles instantly. */
var VTheme = (function () {
  'use strict';
  var LS = 'vastrangam_theme_v1';

  var FREE = [
    /* the shipped default — deep ink chrome, unbleached parchment, one antique gold accent.
       It has to match the tokens in app.css exactly, or applying a theme on boot would
       repaint the app into a different palette than the stylesheet was designed around. */
    { id: 'atelier', name: 'Vastrangam Atelier', p1: '#4E2A7A', p2: '#6B3CA6', gold: '#B08343', bg: '#F5F1E8', ink: '#241436', warm: true },
    { id: 'purple', name: 'Vastrangam Purple', p1: '#5B2D8E', p2: '#7B3FBE', gold: '#C4975A', bg: '#F4F0FB', ink: '#1A0B38' },
    { id: 'ivory', name: 'Ivory Luxe', p1: '#8A6D3B', p2: '#B08D57', gold: '#C0392B', bg: '#FBF8F2', ink: '#2A2018', warm: true },
    { id: 'emerald', name: 'Emerald Silk', p1: '#0F6B4F', p2: '#12A06E', gold: '#C4975A', bg: '#EEF7F2', ink: '#0C2A20' },
    { id: 'midnight', name: 'Midnight Couture', p1: '#1E2A5E', p2: '#3A4EA0', gold: '#D4AF37', bg: '#EEF0F8', ink: '#0C1030' },
    { id: 'marigold', name: 'Marigold Festive', p1: '#B5460F', p2: '#E67E22', gold: '#7B3FBE', bg: '#FDF4EC', ink: '#3A1A08' },
    { id: 'rose', name: 'Rani Rose', p1: '#9B1B5A', p2: '#D6337F', gold: '#C4975A', bg: '#FCF0F5', ink: '#3A0A22' },
    { id: 'teal', name: 'Peacock Teal', p1: '#0E5A66', p2: '#12909E', gold: '#E0A33A', bg: '#EDF6F7', ink: '#08282E' },
    { id: 'onyx', name: 'Onyx Dark', p1: '#2A2340', p2: '#5B4B86', gold: '#C4975A', bg: '#17131F', ink: '#F0EAF8', dark: true }
  ];

  /* ── colour maths (hex ↔ hsl, mix, shade) ── */
  function h2r(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function r2h(r) { return '#' + r.map(function (x) { return Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'); }).join(''); }
  function mix(a, b, t) { var A = h2r(a), B = h2r(b); return r2h([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); }
  function shade(c, amt) { var A = h2r(c); return r2h([A[0] + amt, A[1] + amt, A[2] + amt]); }
  function hsl2hex(h, s, l) {
    s /= 100; l /= 100; var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
    var f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
    return r2h([f(0) * 255, f(8) * 255, f(4) * 255]);
  }

  /* derive the full CSS-var set from a small theme spec */
  function derive(t) {
    var dark = !!t.dark;
    /* Neutrals mixed toward pure white go cold and chalky on a warm ground. Mixing toward
       the theme's own paper instead keeps card, rule and muted text in the same family as
       the background, which is most of what separates a designed palette from a generated one. */
    var paper = dark ? '#17131F' : '#FFFDF8';
    var tint = t.warm ? t.gold : t.p2;
    return {
      '--p1': t.p1, '--p2': t.p2, '--p3': mix(t.p2, paper, .35), '--p4': mix(t.p2, paper, .62),
      '--gold': t.gold, '--gold-d': shade(t.gold, -34), '--gold-s': mix(t.bg, t.gold, dark ? .2 : .13),
      '--ink': t.ink, '--ink2': dark ? mix(t.ink, t.p2, .2) : mix(t.ink, t.p2, .3),
      '--mut': dark ? mix(t.ink, t.p1, .35) : mix(t.ink, t.bg, .58),
      '--hint': dark ? mix(t.ink, t.p1, .5) : mix(t.ink, t.bg, .72),
      '--bg': t.bg, '--surf': mix(t.bg, tint, dark ? .12 : .07), '--surf2': dark ? shade(t.bg, 10) : mix(t.bg, paper, .55),
      '--card': dark ? shade(t.bg, 14) : paper,
      '--line': mix(t.bg, tint, dark ? .22 : .16), '--line2': mix(t.bg, tint, dark ? .34 : .27)
    };
  }
  function apply(t) {
    var vars = derive(t), root = document.documentElement;
    Object.keys(vars).forEach(function (k) { root.style.setProperty(k, vars[k]); });
    /* the header gradient + brand chip read from p1/p2 already via CSS; nothing else to do */
    save(t);
  }
  function save(t) { try { localStorage.setItem(LS, JSON.stringify(t)); } catch (e) {} }
  function load() { try { var t = JSON.parse(localStorage.getItem(LS)); return t && t.p1 ? t : FREE[0]; } catch (e) { return FREE[0]; } }
  function active() { return load(); }
  function isActive(id) { return active().id === id; }

  /* ── AI theme: a palette from a prompt, algorithmic (offline), model-upgradable ── */
  function fromPrompt(text) {
    var t = String(text).toLowerCase();
    /* pick a base hue from words, else hash the text */
    var hueMap = { purple: 275, violet: 275, lavender: 268, blue: 220, navy: 225, teal: 185, green: 150, emerald: 158, mint: 150,
      pink: 330, rose: 338, red: 358, maroon: 350, wine: 345, gold: 45, yellow: 48, mustard: 44, orange: 28, rust: 20, peach: 30,
      black: 260, dark: 258, midnight: 230, ivory: 40, cream: 42, brown: 28, sand: 38 };
    var hue = null; for (var w in hueMap) if (t.indexOf(w) >= 0) { hue = hueMap[w]; break; }
    if (hue == null) { var s = 0; for (var i = 0; i < t.length; i++) s = (s * 31 + t.charCodeAt(i)) % 360; hue = s; }
    var dark = /dark|midnight|night|onyx|noir|black/.test(t);
    var lux = /luxe|luxury|premium|couture|royal|regal|elegant/.test(t);
    var p1 = hsl2hex(hue, lux ? 55 : 62, dark ? 40 : 34);
    var p2 = hsl2hex(hue, lux ? 48 : 60, dark ? 55 : 46);
    var goldHue = (hue + 180) % 360; if (/gold/.test(t)) goldHue = 45;
    var gold = hsl2hex(/gold|warm|festive|marigold/.test(t) ? 42 : goldHue, 55, 48);
    var bg = dark ? hsl2hex(hue, 24, 10) : hsl2hex(hue, 40, 96);
    var ink = dark ? hsl2hex(hue, 30, 92) : hsl2hex(hue, 45, 12);
    return { id: 'ai', name: 'AI theme · ' + (text || 'custom').slice(0, 22), p1: p1, p2: p2, gold: gold, bg: bg, ink: ink, dark: dark };
  }

  return { FREE: FREE, apply: apply, active: active, isActive: isActive, fromPrompt: fromPrompt, derive: derive, load: load };
})();
