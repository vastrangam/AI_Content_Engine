/* ═══════════ build the web app from the same modules the single file uses ═══════════

   There is exactly one copy of the UI. The offline HTML and this app are built from the
   same files in brand/suite/aiengine — so a fix lands in both and neither can drift.

   The difference is only what wraps them: the single file inlines everything and stores
   your work in the browser; the app serves them as separate scripts and stores your work
   on the server. 00_bridge.js is what makes that swap, and it loads first. */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const SRC = path.join(REPO, 'brand', 'suite', 'aiengine');
const WEB = path.join(__dirname, 'web');
const R = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');

fs.mkdirSync(WEB, { recursive: true });

const logo = R('logo.txt').trim();
const favicon = fs.existsSync(path.join(SRC, 'favicon.txt')) ? R('favicon.txt').trim() : logo;

/* the display face, copied out so the browser can cache it rather than re-parse 24 KB of
   base64 on every load — the one place the app should NOT copy the single file */
fs.copyFileSync(path.join(SRC, 'display.woff2'), path.join(WEB, 'display.woff2'));
fs.copyFileSync(path.join(SRC, 'display-OFL.txt'), path.join(WEB, 'display-OFL.txt'));
fs.writeFileSync(path.join(WEB, 'app.css'), R('app.css').replace('VA_DISPLAY_FONT', "'display.woff2'"));

/* the spreadsheet engine, re-aliased exactly as the single file does */
fs.writeFileSync(path.join(WEB, 'sheet.js'),
  fs.readFileSync(path.join(REPO, 'brand', 'suite', 'xlsx.js'), 'utf8').replace(/MedhavaSheet/g, 'VSheet') +
  '\nwindow.VSheet = (typeof VSheet !== "undefined") ? VSheet : window.VSheet;\n');

/* the Image Studio, prepared the same way — CDN tags out, shims and skin in */
let studio = R('studio_pro.html');
const TAG = 'scr' + 'ipt';
studio = studio.replace(/<script\b[^>]*\bsrc="https?:\/\/[^"]*"[^>]*><\/script>\s*/gi, '');
studio = studio.replace(/<link\b[^>]*href="https?:\/\/[^"]*"[^>]*>\s*/gi, '');
studio = studio.replace(/font-family:\s*['"]?Cormorant Garamond['"]?/gi, "font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif");
studio = studio.replace(/font-family:\s*['"]?Jost['"]?/gi, "font-family:'Jost','Trebuchet MS','Segoe UI',sans-serif");
studio = studio.replace('</head>',
  `<${TAG} src="/sheet.js"></${TAG}>\n<${TAG}>${R('studio_shims.js')}</${TAG}>\n` +
  `<style>${R('studio_skin.css')}</style>\n</head>`);
studio = studio.replace('</body>', `<${TAG}>\n${R('studio_bridge.js')}\n</${TAG}>\n</body>`);
fs.writeFileSync(path.join(WEB, 'studio.html'), studio);

/* Every module, in load order, copied verbatim — except 05_store.js.

   That one is the IndexedDB image store, and in the app the photographs belong on the
   server. 00_bridge.js already provides a VStore with the same three methods; shipping
   05_store.js as well would redeclare VStore at top level AFTER the bridge and silently
   win, and every photo would go back into the browser. The single file still uses it. */
const MODULES = ['10_kernel.js', '15_themes.js', '16_theme_screen.js', '20_data.js',
  '25_ai.js', '22_catalogue.js', '23_composer.js', '33_spec.js', '34_sku.js', '35_stock.js',
  '36_library.js', '37_deep.js', '29_brief.js', '27_edit.js', '28_studio.js', '30_content_engine.js',
  '31_run_view.js', '32_analysis.js', '38_inpaint.js', '39_studio_embed.js', '45_gif.js',
  '50_video_studio.js', '55_layout.js', '60_design_studio.js', '61_design_extra.js', '70_publisher.js',
  '80_records_files.js', '90_assistant.js', '95_system.js', '96_router.js', '97_tests_v2.js',
  '98_tests_v3.js', '99_boot.js'];

fs.mkdirSync(path.join(WEB, 'm'), { recursive: true });
MODULES.forEach(f => fs.writeFileSync(path.join(WEB, 'm', f), R(f)));

/* The studio is a real document the server hands out, so the frame points straight at it.

   The single file has to inline the whole thing and make a Blob URL, because there is no
   server to ask. Here there is — and a same-origin URL means the frame is readable from
   the page, so the Image Studio can finally be tested rather than assumed. */
fs.writeFileSync(path.join(WEB, 'm', '00_studio_src.js'),
  '/* the embedded editor is served as its own document in the app build */\n' +
  'var STUDIO_HTML = "";\n' +
  'window.VA_STUDIO_URL = "/studio.html";\n');

const scripts = ['/00_bridge.js', '/sheet.js', '/m/00_studio_src.js']
  .concat(MODULES.map(f => '/m/' + f))
  .map(s => `<script src="${s}"></script>`).join('\n');

fs.writeFileSync(path.join(WEB, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<title>Vastrangam AI Engine</title>
<meta name="description" content="Catalogue, content, images and video for Vastrangam.">
<meta name="theme-color" content="#241436">
<link rel="icon" type="image/png" href="${favicon}">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="stylesheet" href="/app.css">
</head>
<body>
<header id="top">
  <button class="tbtn" id="hamb" aria-label="Menu"><svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
  <div class="brand"><img src="${logo}" alt="Vastrangam"></div>
  <div class="grow"></div>
  <div class="saved" id="saved"><b></b>saved</div>
</header>
<div id="shell">
  <div id="navback"></div>
  <nav id="nav"></nav>
  <main id="main"></main>
</div>

<button id="askbtn" data-act="asktoggle"><svg viewBox="0 0 24 24" style="stroke:#fff;fill:none;stroke-width:2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> Ask the Engine</button>
<aside id="ask">
  <div class="ah"><img src="${logo}" alt=""><div class="t"><b>Vastrangam Engine</b><span>reads your records</span></div>
    <button class="x" data-act="askclear" title="Clear">⟲</button><button class="x" data-act="askclose">✕</button></div>
  <div class="body" id="askbody"></div>
  <div class="sugg" id="asksugg"></div>
  <div class="foot"><div class="row"><input id="askinput" placeholder="Ask anything — e.g. how do I make a reel?" autocomplete="off">
    <button data-act="asksend"><svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg></button></div>
    <div class="prov" id="askprov"></div></div>
</aside>

<div id="toast"></div>
<div id="modal"><div class="box"><div class="mh"></div><div class="mb"></div></div></div>

${scripts}
</body>
</html>
`);

/* installable on a phone home screen — a hosted app should be, and it costs four lines */
fs.writeFileSync(path.join(WEB, 'manifest.webmanifest'), JSON.stringify({
  name: 'Vastrangam AI Engine', short_name: 'Vastrangam',
  start_url: '/', display: 'standalone',
  background_color: '#F5F1E8', theme_color: '#241436',
  icons: [{ src: favicon, sizes: '512x512', type: 'image/png' }]
}, null, 2));

console.log('app built →', WEB);
console.log('  ' + MODULES.length + ' modules · studio.html · app.css · display.woff2 · manifest');
