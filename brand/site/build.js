'use strict';
/* Medhava — builds the COMPLETE website (index.html) with every module and every app
   from modules.js as real web sections, then renders it to a PDF that looks like the website. */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const D = __dirname, SH = path.join(D, 'shots');
if (!fs.existsSync(SH)) fs.mkdirSync(SH);

const I = {
  grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  chart:'M4 20V4M4 20h16M8 20v-6M13 20V9M18 20v-9',
  users:'M9 8a3.2 3.2 0 1 0 0 6.4A3.2 3.2 0 0 0 9 8zM3.5 21a5.5 5.5 0 0 1 11 0M16 7a3 3 0 0 1 0 6M18.5 21a5 5 0 0 0-3-4.6',
  cart:'M3 4h2l2.2 11.2A2 2 0 0 0 9.2 17h8.1a2 2 0 0 0 2-1.6L21 8H6M9.5 20.5h.01M17.5 20.5h.01',
  store:'M4 9V5h16v4a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-4 0zM5 11v8h14v-8',
  globe:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18',
  tag:'M3 12V4h8l9 9-8 8-9-9zM7.5 7.5h.01',
  doc:'M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6',
  box:'M12 3 4 7v10l8 4 8-4V7zM4 7l8 4 8-4M12 21V11',
  scan:'M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M7 12h10',
  truck:'M2 6h12v9H2zM14 9h4l3 3v3h-7M7 18.5h.01M17.5 18.5h.01',
  thread:'M6 3v6a6 6 0 0 0 12 0V3M6 21v-6a6 6 0 0 1 12 0v6',
  layers:'M12 3 3 8l9 5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  check:'M5 12l5 5 9-10',
  coin:'M12 3c3.9 0 7 1.3 7 3s-3.1 3-7 3-7-1.3-7-3 3.1-3 7-3zM5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6',
  scale:'M12 3v18M5 7h14M5 7 2.5 13h5zM19 7l-2.5 6h5zM8 21h8',
  pct:'M5 19 19 5M7.5 5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM16.5 14a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  sync:'M4 12a8 8 0 0 1 13-6l3 2M20 12a8 8 0 0 1-13 6l-3-2M20 4v4h-4M4 20v-4h4',
  ret:'M9 4 4 9l5 5M4 9h10a6 6 0 0 1 0 12H8',
  cal:'M3 4h18v17H3zM3 9h18M8 2v4M16 2v4',
  mail:'M3 5h18v14H3zM4 7l8 6 8-6',
  bolt:'M13 2 4 14h7l-1 8 9-12h-7z',
  spark:'M12 3l1.8 4.8L18.5 9l-4.7 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.2zM18 14l.9 2.3L21 17l-2.1.8L18 20l-.9-2.2L15 17l2.1-.7z',
  image:'M3 4h18v16H3zM8.5 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM4 17l5-5 4 4 3-3 4 4',
  play:'M4 4h16v16H4zM10 9l5 3-5 3z',
  wrench:'M21 4a5 5 0 0 1-6.5 6.5L6 19l-2-2 8.5-8.5A5 5 0 0 1 19 2z',
  bell:'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0',
  print:'M7 8V3h10v5M7 19H4v-8h16v8h-3M7 15h10v6H7zM17.5 12.5h.01',
  shield:'M12 3l7 3v5.5c0 4.4-2.9 8.2-7 9.5-4.1-1.3-7-5.1-7-9.5V6zM9 12l2.2 2.2L15.5 10',
  sheet:'M4 4h16v16H4zM4 9h16M4 14h16M9.5 9v11M15 9v11',
  factory:'M3 21V10l6 4V10l6 4V7l6 4v10zM7 21v-4M13 21v-4M19 21v-4'
};
const ic = k => `<svg class="ai" viewBox="0 0 24 24" aria-hidden="true"><path d="${I[k]||I.grid}"/></svg>`;
const LOGO = require('./logo.js');
/* The brand lockup exactly as supplied — mark, wordmark and tagline in one file, used
   untouched. It is embedded as a data URI so the page remains a single self-contained
   file that cannot arrive with a broken image. logo.js still draws the app icon and the
   favicon, which have to be square and scale to 16 px. */
const IDENT = path.join(D, '..', 'identity');
const asDataUri = (file) => {
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,` + fs.readFileSync(file).toString('base64');
};
/* An edition brings its own lockup by dropping a file in brand/identity. Nothing here
   invents a mark: if the file is absent the header and footer fall back to the wordmark
   set in type, which is honest about being a placeholder rather than pretending to be a
   logo somebody designed. Adding the file and rebuilding is the whole integration. */
const editionLockup = (stem) => {
  for (const ext of ['.png', '.svg', '.jpg', '.jpeg']) {
    const f = path.join(IDENT, stem + ext);
    if (fs.existsSync(f)) return asDataUri(f);
  }
  return null;
};
/* The <img> carries the file's own pixel size so the browser reserves the right-shaped box
   before the image decodes. Reading it from the file rather than typing it is the same rule
   as the module counts: a number typed by hand drifts the moment the file is replaced, and
   a lockup of a different aspect ratio would then be squeezed into the previous one's box. */
const pixelSize = (file) => {
  const b = fs.readFileSync(file);
  if (b.slice(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')))   // PNG: IHDR is always first
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {                               // JPEG: walk to the frame header
    let i = 2;
    while (i < b.length - 9) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m === 0xd8 || m === 0xd9 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
      const len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
        return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + len;
    }
  }
  const svg = /<svg[^>]*\bwidth="(\d+(?:\.\d+)?)"[^>]*\bheight="(\d+(?:\.\d+)?)"/.exec(b.toString('utf8', 0, 2048))
           || /<svg[^>]*\bviewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/.exec(b.toString('utf8', 0, 2048));
  return svg ? { w: Math.round(+svg[1]), h: Math.round(+svg[2]) } : null;
};
const lockupSize = (stem) => {
  for (const ext of ['.png', '.svg', '.jpg', '.jpeg']) {
    const f = path.join(IDENT, stem + ext);
    if (fs.existsSync(f)) return pixelSize(f);
  }
  return null;
};
const LOCKUP = asDataUri(path.join(IDENT, 'medhava-logo.png'));
const BASE = require('./modules.js');
const BASE_SHOTS = require('./shots.js');

/* ── EDITIONS ────────────────────────────────────────────────────────────────────────
   node build.js              → the MEDHAVA edition: neutral, any industry
   node build.js vastrangam   → the VASTRANGAM edition: the same structure in one trade's words

   The overlay may only replace WORDS. Module numbers, app names, app order and both counts
   come from modules.js in either edition, so the two PDFs can never disagree about what the
   software contains — which is the claim the two editions exist to prove. */
const EDNAME = (process.argv[2] || 'medhava').toLowerCase();
const ED = EDNAME === 'vastrangam' ? require('./edition_vastrangam.js') : null;
const MODULES = !ED ? BASE : BASE.map(m => {
  const o = (ED.modules || {})[m.n] || {};
  const apps = m.apps.map(a => (o.apps && o.apps[a[0]]) ? [a[0], a[1], o.apps[a[0]], a[3]] : a);
  return Object.assign({}, m, { tag: o.tag || m.tag, intro: o.intro || m.intro, apps });
});
const SHOTS = ED ? Object.assign({}, BASE_SHOTS, ED.shots || {}) : BASE_SHOTS;
/* the overlay is words only — prove it rather than trusting it */
if (ED) {
  const shape = l => l.map(m => m.n + ':' + m.apps.map(a => a[0]).join('|')).join(' ');
  if (shape(BASE) !== shape(MODULES)) {
    console.error('EDITION ERROR: the overlay changed the structure, not just the wording.');
    process.exit(1);
  }
}
/* Both counts are derived from modules.js and substituted into every partial, so the number
   in the hero, the proof bar, the title tag and the FAQ can never disagree again. */
const NMOD = MODULES.filter(m => !m.spine).length;
const NAPP = MODULES.reduce((s, m) => s + m.apps.length, 0);

/* ── WHAT ACTUALLY EXISTS ────────────────────────────────────────────────────────────
   The apps below are built: each one is a working single-file app in suite/deep/out that
   carries its own self-tests and passes the click-through audit in both editions. The list
   lives here rather than in modules.js because modules.js is the shared structure both
   editions read, and only the VASTRANGAM edition publishes build state today.

   Saying "working today" about something that is not is the one claim this site must never
   make, so the badge is driven by this list and nothing else. */
const BUILT = new Set([
  'CEO Dashboard', 'Report Builder', 'Group Consolidation',
  'CRM & Customer 360', 'Documents & eSign', 'Helpdesk & Live Chat',
  'D2C Sales', 'B2B & Credit', 'Export', 'POS', 'Quotes & Proforma',
  'Marketplace OMS', 'Order Management',
  'Procurement', 'Vendor Management',
  'Ask & Print',
]);

/* Apps whose ENGINE is written and passing its own tests, but which have no
   browser screen yet. They are not in BUILT, because the sentence next to
   that number promises every one of those apps is "checked in a real
   browser" — and these are Node-side engines with no screen to check. They
   are not "to build" either, because the hard part of each is done and runs.

   A third badge is the only honest answer. Each name here must be backed by
   a command anyone can run:
     Provider Router & Cost Guard  node brand/suite/router.js --selftest
     Motion Renderer               node brand/suite/studio/motion_render.js --selftest */
const ENGINE = new Set([
  'Provider Router & Cost Guard',
  'Motion Renderer',
]);
const VAS = EDNAME === 'vastrangam';
const NBUILT = MODULES.reduce((s, m) => s + m.apps.filter(a => BUILT.has(a[0])).length, 0);
const NENG = MODULES.reduce((s, m) => s + m.apps.filter(a => ENGINE.has(a[0])).length, 0);

/* ── WHOSE PRODUCT THIS IS ───────────────────────────────────────────────────────────
   The neutral build is Medhava, the industry-agnostic engine. The Vastrangam build is
   that engine delivered as this house's own Business Operating System, and it carries no
   other company's name anywhere — not in the title, the structured data, the logo or the
   storage key. The partials hold __PRODUCT__ and __DOMAIN__ rather than either name, so
   one substitution decides it and neither build can leak the other's brand. */
const PRODUCT = VAS ? 'Vastrangam BOS' : 'Medhava';
const DOMAIN  = VAS ? 'vastrangam.com' : 'medhava.com';
/* The comparison table sets the product name with its last three letters individually
   coloured from the mark. Written as one word it would be invisible to a plain rename —
   which is exactly how "MEDHAVA" survived the first pass and reached the Vastrangam PDF.
   Keeping it as its own token lets the neutral build keep the coloured letters untouched
   while the Vastrangam build simply says its own name. */
const PRODUCT_MARKED = VAS ? PRODUCT
  : 'Medh<i class="t">a</i><i class="b">v</i><i class="v">a</i>';
const THEMEKEY = VAS ? 'vastrangam-theme' : 'medhava-theme';

/* The lockup: the edition's own file if one has been supplied, otherwise the wordmark set
   in type. The fallback is deliberately typographic — a placeholder that looks like a
   placeholder beats a mark nobody designed. */
const ED_LOCKUP = VAS ? editionLockup('vastrangam-logo') : LOCKUP;
const ED_LOCKUP_PX = VAS ? lockupSize('vastrangam-logo') : pixelSize(path.join(IDENT, 'medhava-logo.png'));
const LOCKUP_DIM = ED_LOCKUP_PX ? ` width="${ED_LOCKUP_PX.w}" height="${ED_LOCKUP_PX.h}"` : '';
const ALT = `${PRODUCT} — One business. One brain.`;
const wordmark = (cls) => `<span class="${cls} wmk"><b>${PRODUCT.split(' ')[0]}</b>${
  PRODUCT.split(' ').slice(1).join(' ') ? ' <i>' + PRODUCT.split(' ').slice(1).join(' ') + '</i>' : ''}</span>`;
const MARK_HEADER = ED_LOCKUP
  ? `<img class="blogo" src="${ED_LOCKUP}" alt="${ALT}"${LOCKUP_DIM}>`
  : wordmark('blogo');
const MARK_FOOTER = ED_LOCKUP
  ? `<span class="flogo"><img src="${ED_LOCKUP}" alt="${ALT}"${LOCKUP_DIM}></span>`
  : `<span class="flogo">${wordmark('')}</span>`;
/* logo.js draws the Medhava mark. The Vastrangam build must not use it, so until a
   Vastrangam icon is supplied its favicon and app icon are a plain gradient tile with a
   typeset initial — no borrowed mark, and no invented one. */
const initialTile = (id, r) => LOGO.dataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">` +
  `<defs>${LOGO.grad(id)}</defs>` +
  `<rect width="64" height="64" rx="${r}" fill="url(#${id})"/>` +
  `<text x="32" y="45" text-anchor="middle" font-family="Georgia,serif" font-size="40" font-weight="700" fill="#fff">${PRODUCT[0]}</text></svg>`);
/* Day mode only means the picker itself goes — a control that offers a night mode the
   edition does not ship would be a button that lies. */
const THEME_TOGGLE = VAS ? '' :
  '<button class="tt" type="button" aria-pressed="false" aria-label="Switch between day and night"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg><span class="ttl">Night</span></button>';
const ED_ICON = VAS ? editionLockup('vastrangam-icon') : null;
const ED_ICON_PX = VAS ? lockupSize('vastrangam-icon') : null;
const MARK_SHOT = VAS
  ? (ED_ICON
      ? `<span class="sm"><img src="${ED_ICON}" alt=""${ED_ICON_PX ? ` width="${ED_ICON_PX.w}" height="${ED_ICON_PX.h}"` : ''}></span>`
      : `<span class="sm"><span class="wmk sml"><b>${PRODUCT.split(' ')[0]}</b></span></span>`)
  : '<span class="sm">' + LOGO.tile('lgs', 26) + '</span>';
const FAVICON = VAS ? (ED_ICON || initialTile('fvv', 32)) : LOGO.dataUri(LOGO.circle('fv'));
const APPICON = VAS ? (ED_ICON || initialTile('aiv', 12)) : LOGO.dataUri(LOGO.tile('ai'));
/* The link's type must describe the bytes behind it. logo.js draws SVG, but an edition that
   supplies its own icon can hand over a PNG, and declaring that PNG as SVG is a browser's
   licence to ignore the favicon entirely — so the type is read off the data URI, not assumed.
   A data URI ends its media type at the first ';' (base64) or ',' (the payload itself), and
   logo.js writes the un-encoded form, so both terminators have to be honoured. */
const FAVICON_TYPE = ' type="' + (/^data:([^;,]+)/.exec(FAVICON) || [, 'image/svg+xml'])[1] + '"';

/* Edition-only styling, appended after site.css rather than written into it. site.css is
   inlined verbatim into both builds, so a rule added there would change the neutral page
   too; keeping it here is what lets the Medhava output stay byte-for-byte identical.
   The wordmark's second word inherits its colour from whatever sits around it, so it is
   correct against the light header and the dark footer without a rule for each. */
const EDCSS = !VAS ? '' : `<style>
.wmk{display:inline-flex;align-items:baseline;gap:.34em;font-weight:700;letter-spacing:-.02em;line-height:1;white-space:nowrap}
.wmk b{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
/* written out rather than taken from a token: both logo plates are a fixed near-white, and
   the footer's own text colour is light — inheriting it put "BOS" at 2.03:1 on that plate.
   A literal ink keeps it readable in day and night alike. */
.wmk i{font-style:normal;font-weight:600;font-size:.46em;letter-spacing:.14em;text-transform:uppercase;color:#334155}
.blogo.wmk{height:auto;display:inline-flex;font-size:27px;padding:9px 14px}
.flogo .wmk{font-size:23px}
.wmk.sml{font-size:13px;color:#334155}
/* the square mark in the product screen's title bar — sized to the row, not to the file */
.sbar .sm img{height:22px;width:22px;display:block}
</style>`;
/* Medhava keeps the badge it has always had — its output must not move. */
const appOn = a => (VAS ? (BUILT.has(a[0]) || ENGINE.has(a[0])) : !!a[3]);
const appBadge = a => (VAS
  ? (BUILT.has(a[0]) ? '<span class="lv">working today</span>'
    : ENGINE.has(a[0]) ? '<span class="lv">engine working · screen to come</span>'
    : '<span class="chip">to build</span>')
  : (a[3] ? '<span class="lv">live</span>' : ''));
const SUFFIX = ED ? '_' + ED.id.toLowerCase() : '';
const fill = t => String(t)
  .split('__PRODUCT_MARKED__').join(PRODUCT_MARKED)
  .split('__PRODUCT__').join(PRODUCT).split('__DOMAIN__').join(DOMAIN)
  .split('__NMOD__').join(NMOD).split('__NAPP__').join(NAPP)
  .split('__HERO_H1__').join(E('heroH1'))
  .split('__HERO_LEAD__').join(E('heroLead'))
  .split('__IND_HEAD__').join(E('indHead'))
  .split('__IND_LEAD__').join(E('indLead'))
  .split('__IND_CARDS__').join(indCards)
  .split('__EDITION_BADGE__').join(EDBADGE)
  .split('__SHOT_CO__').join(E('shotCo'))
  .split('__SHOT_ROWS__').join(shotRows)
  .split('__FEAT_PR_H__').join(E('featPrH'))
  .split('__FEAT_PR_P__').join(E('featPrP'))
  .split('__SEO_TRADE__').join(E('seoTrade'))
  .split('__PR_SHORT__').join(E('prShort'))
  .split('__PR_NOTEBOOK__').join(E('prNotebook'))
  .split('__PR_PAYROLL__').join(E('prPayroll'))
  .split('__SUPPLIER__').join(E('supplier'))
  .split('__THEME_TOGGLE__').join(THEME_TOGGLE)
  .split('__MARK_HEADER__').join(MARK_HEADER)
  .split('__MARK_FOOTER__').join(MARK_FOOTER)
  .split('__MARK_SHOT__').join(MARK_SHOT)
  .split('__FAVICON_TYPE__').join(FAVICON_TYPE)
  .split('__FAVICON__').join(FAVICON)
  .split('__APPICON__').join(APPICON);

/* ── the live-looking product screen ──────────────────────────────────────────────
   A module described only in prose asks the reader to picture the software. A screen with
   real figures on it does the explaining instead — which is the single biggest thing the
   professional suites do that a plain feature list does not. */
const cell = c => Array.isArray(c)
  ? `<td><span class="ug ${c[1]||''}">${c[0]}</span></td>` : `<td>${c}</td>`;
const shot = m => {
  const s = SHOTS[m.n]; if (!s) return '';
  return `<div class="ui">
  <div class="uibar"><i class="d1"></i><i class="d2"></i><i class="d3"></i><span>${s.t}</span></div>
  <div class="uibody">
   <div class="uik">${s.k.map(k=>`<div class="uikc ${k[2]||''}"><span class="l">${k[0]}</span><span class="v">${k[1]}</span></div>`).join('')}</div>
   <div class="uitw"><table class="uit"><thead><tr>${s.c.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${s.r.map(r=>`<tr>${r.map(cell).join('')}</tr>`).join('')}</tbody></table></div>
   ${s.b ? `<div class="uib">${s.b.map(b=>`<div class="uibr"><span>${b[0]}</span><i><b style="width:${b[1]}%"></b></i><em>${b[1]}%</em></div>`).join('')}</div>` : ''}
  </div>
 </div>`;
};

/* ── module section markup ── */
const modSection = (m, i) => `
<section class="mod c${(i%4)+1} ${m.spine?'spine':(i%2?'alt':'')}" id="m${m.n}">
 <div class="wrap">
  <div class="mpill">${ic(m.icon)}<b>${m.name}</b>
   <span class="mpn">${m.spine?'The spine under all '+NMOD:'Module '+m.n}</span>
   <span class="mpc">${m.apps.length} app${m.apps.length>1?'s':''}</span>
   ${m.live?'<span class="mpl">available now</span>':''}</div>
  <div class="mgrid">
   <div class="mleft">
    <h2>${m.tag}</h2>
    <p class="mintro">${m.intro}</p>
    <div class="wire">
     <div class="wl"><span class="wt in">Reads from</span>${m.reads.map(r=>`<span class="wc">${r}</span>`).join('')}</div>
     <div class="wl"><span class="wt out">Writes to</span>${m.writes.map(r=>`<span class="wc">${r}</span>`).join('')}</div>
    </div>
   </div>
   <div class="mright">${shot(m)}</div>
  </div>
  <div class="atiles">${m.apps.map(a=>`<span class="at"><span class="ati">${ic(a[1])}</span><span class="atn">${a[0]}</span></span>`).join('')}</div>
  <div class="apps a2">
   ${m.apps.map(a=>`<article class="app${appOn(a)?' on':''}">
     <div class="aic">${ic(a[1])}</div>
     <div class="atx"><h3>${a[0]}${appBadge(a)}</h3><p>${a[2]}</p></div>
    </article>`).join('')}
  </div>
 </div>
</section>`;

/* site.css is shared, and its opening comment names the mark the tokens were taken from.
   The Vastrangam build carries no other company's name in any byte it ships, comments
   included, so the word is substituted here rather than edited in the shared file — which
   is what keeps the neutral build byte-for-byte unchanged. */
const CSS = fs.readFileSync(path.join(D,'site.css'),'utf8')
  .replace(/Medhava/g, m => (VAS ? 'Vastrangam' : m));
const HEAD = fs.readFileSync(path.join(D,'head.html'),'utf8');
const TOP = fs.readFileSync(path.join(D,'top.html'),'utf8');
const BOT = fs.readFileSync(path.join(D,'bottom.html'),'utf8');

/* the page furniture that has to read differently per edition */
const NEUTRAL = {
  heroH1: 'Run your whole business<br>on <span class="gt">one system</span>',
  heroLead: 'Medhava replaces the eleven tools you run today — accounting, stock, marketplace orders, manufacturing, staff and GST — with <b>one application</b> where every number agrees with every other one. Record a goods receipt once, and your stock, your books, your quality record and your supplier score all move in the same instant.',
  indHead: 'One engine, any industry',
  indLead: 'Every app ships in two builds: a neutral unified-ERP configuration, and an industry configuration. The engine, formulas and tests are identical — only the master data differs.',
  badge: 'Any industry',
  featPrH: 'Piece-rate and contractor pay',
  featPrP: 'Pooled completion, per-unit rates, rework hours and advances roll into one payout for anyone paid by output rather than by the hour — and into a true cost per unit for every product.',
  seoTrade: 'services',
  supplier: 'supplier',
  prShort: 'piece-rate and output-based wages',
  prNotebook: 'contractor wages',
  prPayroll: 'piece-rate payroll',
  shotCo: 'Acme Industries',
  /* the sample suppliers on the hero screenshot. Neutral edition: no trade in the names. */
  shotRows: [['Northgate Components','99%','medium','a'],['Harbour Metals','100%','low','g'],
             ['PioneerSupply Co.','64%','watch','r'],['Delta Packaging','98%','low','g']],
  indCards: [
    ['\uD83E\uDDF5','Textile &amp; apparel','Mills and trim suppliers, fabric in metres and pieces in numbers on one item master, piece-rate pay, design-wise costing, HSN 5007/5208, marketplace returns and wrong-return dead stock.'],
    ['\uD83D\uDC8A','Medical &amp; pharma','Distributors, batch and expiry tracking, QC pass rate as accept rate, cold-chain locations, and a regulated document trail nobody can quietly edit.'],
    ['\uD83C\uDFED','Manufacturing','Component suppliers, multi-level BOM, fill rate driving line stoppages, work orders, scrap and rework accounted where they happen.'],
    ['\uD83D\uDEE0\uFE0F','Services','Subcontractors, milestone acceptance in place of goods receipt, timesheets, retainer billing and project profitability.'],
    ['\uD83D\uDEF8','Drone &amp; precision','Serial and lot tracking to the individual unit, calibration as a production stage you define, and certification paperwork filed against the batch it belongs to.'],
    ['\u2696\uFE0F','Law firms','A matter instead of an order: hearings, filings, opposing parties and e-signed engagement letters on one record. Time against the matter becomes the bill.'],
    ['\uD83D\uDCD8','Chartered accountants','Clients, engagements and statutory deadlines in one calendar; staff hours costed per engagement; the practice\u2019s own books kept in the same system.'],
    ['\uD83D\uDCE6','Trading &amp; export','Multi-warehouse stock with one number, credit limits and ageing per buyer, commercial invoice, LUT bond and IGST refund — plus every channel in one queue.'],
  ],
};
const E = k => (ED && ED[k]) || NEUTRAL[k];
const indCards = E('indCards').map((c,i) =>
  `<div class="card rv${i?' d'+i:''}"><div class="ic">${c[0]}</div><h3>${c[1]}</h3><p>${c[2]}</p></div>`).join('');
const EDBADGE = `<span class="edb">${E('badge')}</span>`;
const shotRows = E('shotRows').map(r =>
  `<div class="r"><span>${r[0]}</span><span>${r[1]} · <span class="tg ${r[3]}">${r[2]}</span></span></div>`).join('');

/* ── THE VASTRANGAM EDITION'S OWN SECTIONS ───────────────────────────────────────────
   The landing-page material, rendered as real website sections rather than a text document:
   what the system is at a glance, the one idea underneath it, one garment followed through
   eight modules, and the standards the build is held to.

   Every class used here already exists in site.css and already passes the contrast gate —
   nothing new is invented, which is why these sections look like the rest of the site
   instead of like something bolted on. They are empty strings in the MEDHAVA edition, so
   that build is byte-for-byte what it was. */
const glanceRow = (k, v) => `<dt>${k}</dt><dd>${v}</dd>`;
const VASINTRO = !VAS ? '' : `
<section id="glance">
 <div class="wrap sec-head rv">
  <div class="eyebrow"><span class="ebhl">Where the build stands</span></div>
  <h2>${NBUILT} apps working today, ${NENG} more with their engine running. ${NAPP - NBUILT - NENG} still to build.</h2>
  <p class="lead">Nothing on this page is called finished unless it is. Every app further down carries a
   badge saying which it is, and the counts here are counted from the module list each time this page is
   built — never typed in.</p>
 </div>
 <div class="wrap">
  <div class="facts rv">
   <h3>The honest count</h3>
   <dl>
    ${glanceRow('Modules', `${NMOD} business modules, plus the Platform spine underneath them — ${NMOD + 1} numbered in build order`)}
    ${glanceRow('Apps', String(NAPP))}
    ${glanceRow('Working today', `${NBUILT} — each carries its own self-tests and is checked in a real browser, in both editions`)}
    ${glanceRow('Engine working, screen to come', `${NENG} — the hard part is written and passing its own tests on the command line, but there is no screen yet, so they are not counted above`)}
    ${glanceRow('Still to build', `${NAPP - NBUILT - NENG} — designed and specified, not yet written`)}
    ${glanceRow('Build order', 'Dependency order: a module is started only once everything it needs already exists')}
    ${glanceRow('Companies', 'Vastrangam (invoices VS) · Ethnic Fashion trading as Go4Fashion (invoices EF, SKUs GF) · Adini Couture (invoices AC)')}
   </dl>
  </div>
 </div>
</section>

<section id="oneidea">
 <div class="wrap sec-head rv">
  <div class="eyebrow"><span class="ebhl">The one idea</span></div>
  <h2>Every module reads and writes the same six records.</h2>
  <p class="lead">That is the physical reason a single goods receipt can touch stock, the books, quality and
   sourcing in the same instant — not a promise about integration, a consequence of the design.</p>
 </div>
 <div class="wrap core-wrap">
  <div class="rv">
   <h3>One stock number, not one per channel</h3>
   <p class="mintro">The last piece sold at the Surat counter disappears from Myntra and Flipkart in the same
    instant — not three hours later as a cancellation, because cancellations are what a seller rating is lost to.</p>
   <h3>Accepted — not ordered — is what counts</h3>
   <p class="mintro">You order 100 metres. 100 arrive. Quality accepts 96. Most systems raise stock by 100 and
    claim tax credit on 100. This one raises stock by <b>96</b>, claims input credit on <b>96</b>, raises a debit
    note for the 4 rejected, and lowers that mill's accept rate — automatically.</p>
   <h3>Nothing derived is ever stored</h3>
   <p class="mintro">Outstanding, ageing, risk, promise dates, cost per piece and profit per design are recomputed
    on read. A stored total can drift away from the documents underneath it; a computed one cannot.</p>
  </div>
  <div class="core rv d1">
   <div class="cc"><b>UNIFIED DATA CORE</b>
    <div class="ents"><span>Company</span><span>Item/SKU</span><span>Party</span><span>Stock</span><span>Ledger</span><span>Order</span></div>
   </div>
   <div class="fl">
    <div class="i">05 Sales writes</div><div class="o">03 Stock moves</div>
    <div class="i">07 Purchase writes</div><div class="o">12 Ledger posts</div>
    <div class="i">08 Manufacturing writes</div><div class="o">16 Payout follows</div>
    <div class="i">15 OMS writes</div><div class="o">14 Settlement matches</div>
    <div class="i">every module writes</div><div class="o">21 Dashboard reads</div>
   </div>
  </div>
 </div>
</section>

<section id="scale">
 <div class="wrap sec-head rv">
  <div class="eyebrow"><span class="ebhl">Companies and channels</span></div>
  <h2>Three companies and seven marketplaces is your data — not a ceiling.</h2>
  <p class="lead">A company is a row. A channel — a marketplace account, the D2C site, the counter, the
   B2B desk, an export buyer — is also a row. Every record carries the company it belongs to and every
   sale carries the channel it came through, so <b>ten companies selling on ten channels each is the same
   tables and the same code</b> as three and seven.</p>
 </div>
 <div class="wrap">
  <div class="facts rv">
   <h3>What is fixed, and what is not</h3>
   <dl>
    <dt>Companies</dt><dd>A row each. The software sets no limit of its own.</dd>
    <dt>Channels</dt><dd>A row each. The eleventh marketplace is a row, not a release.</dd>
    <dt>Stock</dt><dd>One number per SKU. Never one per channel.</dd>
    <dt>The group figure</dt><dd>The sum minus inter-company trade, with the elimination shown.</dd>
   </dl>
  </div>
  <div class="rv d1">
   <h3>Each company's books are its own</h3>
   <p class="mintro">Its trial balance balances on its own, and no journal line can point at an account
    belonging to a different company. That is checked by a test, not left to discipline.</p>
   <h3>The group is the sum minus what you sold yourselves</h3>
   <p class="mintro">A sister company buying from a sister company is revenue in one set of books and cost
    in another. Adding the companies up would report turnover the group never earned from the outside
    world, so every entry naming a sister company is eliminated — and all three figures are returned,
    so you can see the elimination rather than trust it.</p>
   <h3>The channel is a dimension of the sale, never of the stock</h3>
   <p class="mintro">Read any month by channel, by company, or by both. What you cannot keep is a separate
    stock number per channel — the last piece sold on one marketplace has to vanish from the other ten in
    that instant, which per-channel inventory cannot do.</p>
   <p class="mintro"><b>Checked, not claimed.</b> The core test posts across a 10 × 10 grid — a hundred
    channels — and asserts every company's books balance, that no line reaches into another company, and
    that the group is ₹2,10,500 gross minus ₹50,000 inter-company = ₹1,60,500. It then runs 11 × 11 with
    nothing in the code changed. In the working Dashboard &amp; BI app you can add the fourth company and
    the eleventh channel yourself and watch every figure hold.</p>
  </div>
 </div>
</section>

<section class="blk blk-violet" id="garment">
 <div class="wrap sec-head rv">
  <div class="eyebrow"><span class="ebhl">The proof</span></div>
  <h2>One garment. Eight modules. One database.</h2>
  <p class="lead">The test of whether this is one system or ${NAPP} programs sharing a login: sell a single
   garment and follow it. Every step below is the same record, moving — nothing is re-keyed between them.</p>
 </div>
 <div class="wrap">
  <div class="flow rv">
   <span class="fb">15 · Order lands in one queue</span><span class="ar">→</span>
   <span class="fb">03 · Stock down on every channel</span><span class="ar">→</span>
   <span class="fb">10 · Picked from the named bin, filmed</span><span class="ar">→</span>
   <span class="fb">11 · Courier booked, COD banked</span><span class="ar">→</span>
   <span class="fb">12 · Revenue and GST posted</span><span class="ar">→</span>
   <span class="fb">14 · Payout matched to the paise</span><span class="ar">→</span>
   <span class="fb">08 + 16 · The karigar paid for it</span><span class="ar">→</span>
   <span class="fb">21 · Every figure clicks back down</span>
  </div>
 </div>
</section>
`;

const VASTRUST = !VAS ? '' : `
<section class="blk blk-ink" id="standards">
 <div class="wrap sec-head rv">
  <div class="eyebrow"><span class="ebhl">How it is kept straight</span></div>
  <h2>The rules, the checks, and what we will not claim.</h2>
  <p class="lead">Software that runs a business earns trust by being checkable, not by being described well.
   These are the standards this build is held to — written down, because a standard nobody wrote down is a
   standard nobody can be held to.</p>
 </div>
 <div class="wrap">
  <div class="gapg">
   <div class="gc rv">
    <div class="gch">The rules that hold everywhere</div>
    <div class="gcw">Integrity</div>
    <ul>
     <li class="y">No app depends on any single outside company — every capability has interchangeable providers and a by-hand option</li>
     <li class="y">A provider named as the source of a figure is a bug; the ledger originates numbers</li>
     <li class="y">The books are this system's own — no other accounting package is ever required</li>
     <li class="y">Money is integer paise, never a floating-point number</li>
     <li class="y">Salaries, prices, tax rates and commissions are effective-dated — March payroll uses March's salary</li>
    </ul>
   </div>
   <div class="gc rv d1">
    <div class="gch">What it refuses to do</div>
    <div class="gcw">Safety</div>
    <ul>
     <li class="y">Never asks for a marketplace, bank or account password — scoped, revocable keys only</li>
     <li class="y">Nothing is deleted, only deactivated — history must still resolve</li>
     <li class="y">The audit trail has no off switch: 8 years, before-and-after values</li>
     <li class="y">Gates, not warnings — a COD order cannot be packed below its advance, a bill for more than was accepted cannot be paid</li>
     <li class="y">It is not trained, it is built — no model learns from your data</li>
    </ul>
   </div>
   <div class="gc rv d2">
    <div class="gch">How it is verified</div>
    <div class="gcw">Evidence</div>
    <ul>
     <li class="y">The arithmetic runs with no screen involved, against seeded data</li>
     <li class="y">Every screen and every control is clicked in a real browser — any console error fails the build</li>
     <li class="y">Not "did the button click" but "did the thing happen"</li>
     <li class="y">Against the owner's own figures — and where a source file has since changed shape, the gap is named, not hidden</li>
     <li class="y">The shipped archive is re-tested after extraction, not just the working copy</li>
    </ul>
   </div>
   <div class="gc rv d3">
    <div class="gch">What we will not claim</div>
    <div class="gcw">Honesty</div>
    <ul>
     <li class="y">Nothing is called finished that is not — every app above is marked working today or to build</li>
     <li class="y">Counts are counted from the source at build time, never typed by hand</li>
     <li class="y">If a test fails, the failure is shown with its output</li>
     <li class="n">The ${NBUILT} working apps still run on their own storage — rewiring them onto the shared core is the first job of Module 01</li>
     <li class="n">${NAPP - NBUILT - NENG} apps are designed and specified, not yet written; ${NENG} more have a working engine but no screen on it yet</li>
    </ul>
   </div>
  </div>
 </div>
</section>
`;

const BODY = fill(`
<a class="skip" href="#main">Skip to content</a>
${TOP}${VASINTRO}
<section class="modwrap blk blk-grad" id="modules">
 <div class="wrap sec-head">
  <div class="eyebrow"><span class="ebhl">Modules &amp; apps</span></div>
  <h2>${NMOD} modules. ${NAPP} apps. One login.</h2>
  <p class="lead">Each module is a complete area of your business. Turn on what you need today — everything else is already wired for the day you need it.</p>
 </div>
 <div class="wrap">
  <div class="modindex">
   ${MODULES.map(m=>`<a class="mx" href="#m${m.n}"><b>${m.n}</b><span>${m.name}</span><i>${m.apps.length} app${m.apps.length>1?'s':''}</i></a>`).join('')}
  </div>
 </div>
</section>
${MODULES.map(modSection).join('')}${VASTRUST}
${BOT}`);

/* The Vastrangam edition ships day mode only, so it never asks the browser what the reader
   prefers and never stores a choice — it simply is light. Medhava keeps the picker. */
const THEMEJS = VAS
  ? `<script>document.documentElement.setAttribute('data-theme','light');</script>`
  : `<script>(function(){try{var t=localStorage.getItem('${THEMEKEY}');
 if(!t)t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
 document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>`;
/* the pricing switch — a real control on the site; the PDF prints the yearly state */
const BILLJS = `<script>(function(){document.addEventListener('click',function(e){
 var b=e.target.closest('.pt');if(!b)return;
 var box=b.closest('#pricing');box.setAttribute('data-bill',b.dataset.bill);
 box.querySelectorAll('.pt').forEach(function(x){x.classList.toggle('on',x===b);});});})();</script>`;
const TOGGLEJS = VAS ? '' : `<script>(function(){var r=document.documentElement;
 function set(t){r.setAttribute('data-theme',t);try{localStorage.setItem('${THEMEKEY}',t);}catch(e){}
   document.querySelectorAll('.tt').forEach(function(b){b.setAttribute('aria-pressed',t==='dark');
     b.querySelector('.ttl').textContent=t==='dark'?'Day':'Night';});}
 document.addEventListener('click',function(e){var b=e.target.closest('.tt');if(!b)return;
   set(r.getAttribute('data-theme')==='dark'?'light':'dark');});
 set(r.getAttribute('data-theme')||'light');})();</script>`;

/* the live page — one theme at a time, with the toggle */
const html = `<!doctype html><html lang="en"><head>${fill(HEAD)}<style>${CSS}</style>${EDCSS}</head><body>
${THEMEJS}${BODY}${TOGGLEJS}${BILLJS}
</body></html>`;

/* The printed book. Medhava prints both halves — light, then dark — so one file shows the
   product in both. The Vastrangam edition prints day mode only, so the book is the light
   half and nothing else. */
const book = VAS
  ? `<!doctype html><html lang="en" data-theme="light"><head>${fill(HEAD)}<style>${CSS}</style>${EDCSS}</head><body>
<div class="themepart" data-theme="light">${BODY}</div>
</body></html>`
  : `<!doctype html><html lang="en"><head>${fill(HEAD)}<style>${CSS}</style>${EDCSS}</head><body>
<div class="themepart" data-theme="light">${BODY}</div>
<div class="themebreak"></div>
<div class="themepart" data-theme="dark">${BODY}</div>
</body></html>`;
fs.writeFileSync(path.join(D,'book'+SUFFIX+'.html'), book);

fs.writeFileSync(path.join(D,'index'+SUFFIX+'.html'), html);
console.log((ED?ED.id:'MEDHAVA'), 'index'+SUFFIX+'.html written:', Math.round(html.length/1024)+'KB');

/* ── render ──────────────────────────────────────────────────────────────────────
   Straight from the HTML to the PDF, so the text stays vector and stays sharp at any zoom.
   book.html carries the whole page twice — the light half, a page break, then the dark half —
   so one file holds both, and each half opens with the header, the logo and the full menu. ── */
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1180,height:1400} });
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+path.join(D,'book'+SUFFIX+'.html'), { waitUntil:'networkidle' });
  await p.emulateMedia({ media:'print' });
  await p.evaluate(()=>document.querySelectorAll('.rv').forEach(e=>{e.style.animation='none';e.style.opacity=1;e.style.transform='none';}));
  await p.waitForTimeout(800);
  const ov = await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);

  /* ── CONTRAST GATE ────────────────────────────────────────────────────────────────
     Same-colour text on same-colour background is the one design bug that is invisible
     to whoever wrote the CSS and obvious to everybody else. So it is measured, not
     eyeballed: every text node is resolved against the surface actually behind it and
     checked to WCAG AA. book.html carries both themes, so one pass covers day and night. */
  const low = await p.evaluate(() => {
    const lum = c => { const s=c.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});
      return .2126*s[0]+.7152*s[1]+.0722*s[2]; };
    /* Chrome resolves color-mix() to color(srgb r g b) with 0-1 components */
    const px = s => { const n=(s.match(/[\d.]+/g)||[0,0,0]).slice(0,3).map(Number);
      return /^color\(/.test(s) ? n.map(v=>v*255) : n; };
    const alpha = s => { const m=s.match(/[\d.]+/g); return m&&m.length>3?+m[3]:1; };
    const over = (fg,a,bg) => fg.map((v,i)=>v*a+bg[i]*(1-a));
    const bgOf = el => { let n=el, st=[];
      while(n){ const cs=getComputedStyle(n);
        if(cs.backgroundImage && cs.backgroundImage!=='none') return null;   /* gradient: by eye */
        const a=alpha(cs.backgroundColor);
        if(a>0){ st.push([px(cs.backgroundColor),a]); if(a>=.999) break; }
        n=n.parentElement; }
      let base=[255,255,255];
      for(let i=st.length-1;i>=0;i--) base=over(st[i][0],st[i][1],base);
      return base; };
    const out=[];
    document.querySelectorAll('body *').forEach(el=>{
      const txt=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).length;
      if(!txt) return;
      const cs=getComputedStyle(el);
      if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0) return;
      if(cs.webkitTextFillColor==='rgba(0, 0, 0, 0)') return;                /* gradient text */
      const r=el.getBoundingClientRect(); if(!r.width||!r.height) return;
      const bg=bgOf(el); if(!bg) return;
      const fg=over(px(cs.color), alpha(cs.color), bg);
      const L1=lum(fg), L2=lum(bg);
      const ratio=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
      const size=parseFloat(cs.fontSize);
      const need=(size>=24||(size>=18.66&&+cs.fontWeight>=600))?3:4.5;
      if(ratio<need) out.push(el.tagName.toLowerCase()+'.'+[...el.classList].join('.')+
        ' — '+ratio.toFixed(2)+':1, needs '+need+' — "'+
        el.textContent.trim().slice(0,40)+'"');
    });
    return [...new Set(out)];
  });
  if (low.length) {
    console.error('\nCONTRAST GATE FAILED — ' + low.length + ' text/background pairs below WCAG AA:');
    low.slice(0, 20).forEach(l => console.error('  · ' + l));
    await b.close(); process.exit(1);
  }
  /* The Vastrangam edition is delivered as the BOS website, alongside its markdown twin in
     the delivery folder, so the pair a reader is given sits together in one place. */
  const outDir = VAS ? path.join(D, '..', 'delivery', 'website', 'VASTRANGAM_BOS') : D;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, VAS ? 'Vastrangam_BOS_Website.pdf' : 'Medhava_Website.pdf');
  await p.pdf({ path:out, format:'A4', printBackground:true, scale:0.673,
                margin:{top:'0mm',bottom:'0mm',left:'0mm',right:'0mm'} });
  await p.close();
  console.log('PDF:', path.basename(out), Math.round(fs.statSync(out).size/1024)+'KB (vector text,',
              'light + dark in one file) | overflow:', ov, '| errors:', errs.length);
  await b.close();
})();
