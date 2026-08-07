'use strict';
const fs = require('fs'), path = require('path');
const D = __dirname;
const R = f => fs.readFileSync(path.join(D, f), 'utf8');
const logo = fs.readFileSync(path.join(D, 'logo.txt'), 'utf8').trim();
const favicon = fs.existsSync(path.join(D, 'favicon.txt')) ? fs.readFileSync(path.join(D, 'favicon.txt'), 'utf8').trim() : logo;

/* the suite spreadsheet engine, re-aliased to VSheet so the shipped file carries no other brand name */
const REPO = '/home/user/AI_Content_Engine';
let xlsx = fs.readFileSync(path.join(REPO, 'brand', 'suite', 'xlsx.js'), 'utf8');
xlsx = xlsx.replace(/MedhavaSheet/g, 'VSheet');

const css = (function () {
  /* The display face is embedded as a data URI so the file stays one self-contained
     document — no CDN, no network, works with the wifi off. Fraunces, SIL OFL 1.1;
     display-OFL.txt ships beside this script. 18 KB on disk, 24 KB as base64. */
  const face = fs.readFileSync(path.join(D, 'display.woff2')).toString('base64');
  return R('app.css').replace('VA_DISPLAY_FONT', "data:font/woff2;base64," + face);
})();

/* ── the user's own Image Studio Pro, embedded byte-for-byte ──────────────────────────
   The tool's own code is untouched. Two build-time changes make it work offline inside
   this file:

   1. Its two CDN <script src> tags (JSZip, SheetJS) are removed and replaced by local
      shims over the spreadsheet engine already bundled here. Those tags are synchronous
      and in the head, so with no network the HTML parser stalls on them and the document
      never gets past </head> — the studio appeared blank for exactly that reason.
   2. A bridge script is appended so the Catalogue can push photos into its queue and pull
      the finished images back.

   It ships base64-encoded: escaping a 210 KB document into a JS string literal ends the
   parent's script block at the first literal </script>. */
let studio = R('studio_pro.html');
const bridge = R('studio_bridge.js');
const shims = R('studio_shims.js');
const TAG = 'scr' + 'ipt';

/* Drop every external dependency — none can resolve offline.
   The stylesheet matters as much as the scripts: a PENDING stylesheet blocks the next
   inline script from executing, so a hanging Google Fonts request freezes the parser and
   the document never gets past the head. That is precisely what made the studio blank. */
studio = studio.replace(/<script\b[^>]*\bsrc="https?:\/\/[^"]*"[^>]*><\/script>\s*/gi, '');
studio = studio.replace(/<link\b[^>]*href="https?:\/\/[^"]*"[^>]*>\s*/gi, '');
/* keep their typography intent with fonts that exist on every machine */
studio = studio.replace(/font-family:\s*['"]?Cormorant Garamond['"]?/gi, "font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif");
studio = studio.replace(/font-family:\s*['"]?Jost['"]?/gi, "font-family:'Jost','Trebuchet MS','Segoe UI',sans-serif");
/* the spreadsheet engine + the shims go in first, so their code finds JSZip and XLSX ready.
   The skin is appended LAST so it wins the cascade over the tool's own stylesheet — it only
   repaints and hides the duplicate logo bar; no behaviour of theirs is touched. */
studio = studio.replace('</head>',
  '<' + TAG + '>' + xlsx + '\n</' + TAG + '>\n<' + TAG + '>' + shims + '\n</' + TAG + '>\n' +
  '<style>' + R('studio_skin.css') + '</style>\n</head>');
studio = studio.replace('</body>', '<' + TAG + '>\n' + bridge + '\n</' + TAG + '>\n</body>');

const studioConst =
  'var STUDIO_B64 = "' + Buffer.from(studio, 'utf8').toString('base64') + '";\n' +
  'var STUDIO_HTML = (function(){ try {\n' +
  '  var bin = atob(STUDIO_B64), a = new Uint8Array(bin.length);\n' +
  '  for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);\n' +
  '  return new TextDecoder("utf-8").decode(a);\n' +
  '} catch (e) { return ""; } })();';

const js = ['05_store.js', '10_kernel.js', '15_themes.js', '16_theme_screen.js', '20_data.js',
  '25_ai.js', '22_catalogue.js', '23_composer.js', '33_spec.js', '34_sku.js', '35_stock.js', '36_library.js','37_deep.js', '29_brief.js', '30_content_engine.js', '31_run_view.js', '32_analysis.js',
  '38_inpaint.js', '39_studio_embed.js', '45_gif.js', '50_video_studio.js',
  '55_layout.js', '60_design_studio.js', '61_design_extra.js', '70_publisher.js', '80_records_files.js',
  '90_assistant.js', '95_system.js', '96_router.js', '97_tests_v2.js', '98_tests_v3.js', '99_boot.js'].map(R).join('\n\n');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Vastrangam AI Engine</title>
<meta name="description" content="Vastrangam AI Engine — content, image, video, design and publishing in one offline studio.">
<link rel="icon" type="image/png" href="${favicon}">
<style>
${css}
</style>
</head>
<body>
<header id="top">
  <button class="tbtn" id="hamb" aria-label="Menu"><svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
  <div class="brand"><img src="${logo}" alt="Vastrangam"></div>
  <div class="appchip"><svg viewBox="0 0 24 24"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" stroke="#fff" fill="none" stroke-width="2"/></svg> Module 14 · one studio</div>
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
  <div class="ah"><img src="${logo}" alt=""><div class="t"><b>Vastrangam Engine</b><span>reads your records · works offline</span></div>
    <button class="x" data-act="askclear" title="Clear">⟲</button><button class="x" data-act="askclose">✕</button></div>
  <div class="body" id="askbody"></div>
  <div class="sugg" id="asksugg"></div>
  <div class="foot"><div class="row"><input id="askinput" placeholder="Ask anything — e.g. how do I make a reel?" autocomplete="off">
    <button data-act="asksend"><svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg></button></div>
    <div class="prov" id="askprov"></div></div>
</aside>

<div id="toast"></div>
<div id="modal"><div class="box"><div class="mh"></div><div class="mb"></div></div></div>

<script>
/* ── inlined spreadsheet engine (offline .xlsx / .csv / .zip) ── */
${xlsx}
window.VSheet = (typeof VSheet !== 'undefined') ? VSheet : window.VSheet;
</script>
<script>
${studioConst}
</script>
<script>
${js}
</script>
</body>
</html>`;

const out = path.join(REPO, 'Vastrangam_AI_Engine.html');
fs.writeFileSync(out, html);
console.log('written', out, '·', Math.round(html.length / 1024), 'KB');
