'use strict';
/* Medhava — builds the COMPLETE website (index.html) with all 16 modules + 41 apps
   as real web sections, then renders it to a PDF that looks like the website. */
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
  print:'M7 8V3h10v5M7 19H4v-8h16v8h-3M7 15h10v6H7zM17.5 12.5h.01'
};
const ic = k => `<svg class="ai" viewBox="0 0 24 24" aria-hidden="true"><path d="${I[k]||I.grid}"/></svg>`;
const MK = (c,id) => { const g = id||('mg'+Math.random().toString(36).slice(2,7));
  return `<svg viewBox="0 0 128 124" aria-hidden="true">${c?'':`<defs><linearGradient id="${g}" x1=".04" y1="0" x2=".96" y2="1"><stop offset="0" stop-color="#00b09b"/><stop offset=".52" stop-color="#2563eb"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs>`}<path d="M22 108V36L64 80L106 36v72" fill="none" stroke="${c||`url(#${g})`}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><g fill="${c||`url(#${g})`}"><rect x="48" y="94" width="6.5" height="14" rx="3.2"/><rect x="61" y="86" width="6.5" height="22" rx="3.2"/><rect x="74" y="77" width="6.5" height="31" rx="3.2"/><rect x="87" y="68" width="6.5" height="40" rx="3.2"/></g><path d="M42 100C58 97 82 87 99 55" fill="none" stroke="${c||`url(#${g})`}" stroke-width="5" stroke-linecap="round"/><path d="M64 4c1 11.4 3 14 14.4 15-11.4 1-13.4 3.6-14.4 15-1-11.4-3-14-14.4-15C61 18 63 15.4 64 4z" fill="${c||'#f7b703'}"/></svg>`;};

const LOGO = require('./logo.js');
const MODULES = require('./modules.js');
/* Both counts are derived from modules.js and substituted into every partial, so the number
   in the hero, the proof bar, the title tag and the FAQ can never disagree again. */
const NMOD = MODULES.filter(m => !m.spine).length;
const NAPP = MODULES.reduce((s, m) => s + m.apps.length, 0);
const fill = t => String(t)
  .split('__NMOD__').join(NMOD).split('__NAPP__').join(NAPP)
  .split('__MARK_HEADER__').join('<span class="bm">'+LOGO.mark('lgh')+'</span>')
  .split('__MARK_FOOTER__').join('<span class="bm">'+LOGO.mark('lgf','#fff')+'</span>')
  .split('__MARK_SHOT__').join('<span class="sm">'+LOGO.tile('lgs',26)+'</span>')
  .split('__FAVICON__').join(LOGO.dataUri(LOGO.circle('fv')))
  .split('__APPICON__').join(LOGO.dataUri(LOGO.tile('ai')));

/* ── module section markup ── */
const modSection = (m, i) => `
<section class="mod c${(i%4)+1} ${m.spine?'spine':(i%2?'alt':'')}" id="m${m.n}">
 <div class="wrap">
  <div class="mhead">
   <div class="mic">${ic(m.icon)}</div>
   <div class="mtx">
    <div class="meye">${m.spine?'Platform · the spine under all '+NMOD:'Module '+m.n}${m.live?' · <b class="lvb">available now</b>':''}</div>
    <h2>${m.name}</h2>
    <p class="mtag">${m.tag}.</p>
   </div>
   <div class="mcount"><b>${m.apps.length}</b><span>app${m.apps.length>1?'s':''}</span></div>
  </div>
  <p class="mintro">${m.intro}</p>
  <div class="wire">
   <div class="wl"><span class="wt in">Reads from</span>${m.reads.map(r=>`<span class="wc">${r}</span>`).join('')}</div>
   <div class="wl"><span class="wt out">Writes to</span>${m.writes.map(r=>`<span class="wc">${r}</span>`).join('')}</div>
  </div>
  <div class="apps ${m.apps.length>=4?'a2':m.apps.length===1?'a1':'a2'}">
   ${m.apps.map(a=>`<article class="app${a[3]?' on':''}">
     <div class="aic">${ic(a[1])}</div>
     <div class="atx"><h3>${a[0]}${a[3]?'<span class="lv">live</span>':''}</h3><p>${a[2]}</p></div>
    </article>`).join('')}
  </div>
 </div>
</section>`;

const CSS = fs.readFileSync(path.join(D,'site.css'),'utf8');
const HEAD = fs.readFileSync(path.join(D,'head.html'),'utf8');
const TOP = fs.readFileSync(path.join(D,'top.html'),'utf8');
const BOT = fs.readFileSync(path.join(D,'bottom.html'),'utf8');

const BODY = fill(`
<a class="skip" href="#main">Skip to content</a>
${TOP}
<section class="modwrap w-violet" id="modules">
 <div class="wrap sec-head">
  <div class="eyebrow">Modules &amp; apps</div>
  <h2>${NMOD} modules. ${NAPP} apps. One login.</h2>
  <p class="lead">Each module is a complete area of your business. Turn on what you need today — everything else is already wired for the day you need it.</p>
 </div>
</section>
${MODULES.map(modSection).join('')}
${BOT}`);

const THEMEJS = `<script>(function(){try{var t=localStorage.getItem('medhava-theme');
 if(!t)t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
 document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>`;
const TOGGLEJS = `<script>(function(){var r=document.documentElement;
 function set(t){r.setAttribute('data-theme',t);try{localStorage.setItem('medhava-theme',t);}catch(e){}
   document.querySelectorAll('.tt').forEach(function(b){b.setAttribute('aria-pressed',t==='dark');
     b.querySelector('.ttl').textContent=t==='dark'?'Day':'Night';});}
 document.addEventListener('click',function(e){var b=e.target.closest('.tt');if(!b)return;
   set(r.getAttribute('data-theme')==='dark'?'light':'dark');});
 set(r.getAttribute('data-theme')||'light');})();</script>`;

/* the live page — one theme at a time, with the toggle */
const html = `<!doctype html><html lang="en"><head>${fill(HEAD)}<style>${CSS}</style></head><body>
${THEMEJS}${BODY}${TOGGLEJS}
</body></html>`;

/* the printed book — BOTH themes in one file, light half then dark half, each opening
   with the header, the logo and the whole menu. */
const book = `<!doctype html><html lang="en"><head>${fill(HEAD)}<style>${CSS}</style></head><body>
<div class="themepart" data-theme="light">${BODY}</div>
<div class="themebreak"></div>
<div class="themepart" data-theme="dark">${BODY}</div>
</body></html>`;
fs.writeFileSync(path.join(D,'book.html'), book);

fs.writeFileSync(path.join(D,'index.html'), html);
console.log('index.html written:', Math.round(html.length/1024)+'KB');

/* ── render ──────────────────────────────────────────────────────────────────────
   Straight from the HTML to the PDF, so the text stays vector and stays sharp at any zoom.
   book.html carries the whole page twice — the light half, a page break, then the dark half —
   so one file holds both, and each half opens with the header, the logo and the full menu. ── */
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1180,height:1400} });
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+path.join(D,'book.html'), { waitUntil:'networkidle' });
  await p.emulateMedia({ media:'print' });
  await p.evaluate(()=>document.querySelectorAll('.rv').forEach(e=>{e.style.animation='none';e.style.opacity=1;e.style.transform='none';}));
  await p.waitForTimeout(800);
  const ov = await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  const out = path.join(D,'Medhava_Website.pdf');
  await p.pdf({ path:out, format:'A4', printBackground:true, scale:0.673,
                margin:{top:'0mm',bottom:'0mm',left:'0mm',right:'0mm'} });
  await p.close();
  console.log('PDF:', path.basename(out), Math.round(fs.statSync(out).size/1024)+'KB (vector text,',
              'light + dark in one file) | overflow:', ov, '| errors:', errs.length);
  await b.close();
})();
