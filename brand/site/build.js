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
const MK = c => `<svg viewBox="0 0 128 124" aria-hidden="true">${c?'':`<defs><linearGradient id="mg" x1=".05" y1="0" x2=".95" y2="1"><stop offset="0" stop-color="#19cba9"/><stop offset=".45" stop-color="#0fae90"/><stop offset="1" stop-color="#0a7660"/></linearGradient></defs>`}<path d="M22 108V36L64 80L106 36v72" fill="none" stroke="${c||'url(#mg)'}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><g fill="${c||'url(#mg)'}"><rect x="48" y="94" width="6.5" height="14" rx="3.2"/><rect x="61" y="86" width="6.5" height="22" rx="3.2"/><rect x="74" y="77" width="6.5" height="31" rx="3.2"/><rect x="87" y="68" width="6.5" height="40" rx="3.2"/></g><path d="M42 100C58 97 82 87 99 55" fill="none" stroke="${c||'url(#mg)'}" stroke-width="5" stroke-linecap="round"/><path d="M64 6c.8 9.6 2.5 11.8 12.1 12.6C66.5 19.4 64.8 21.6 64 31.2c-.8-9.6-2.5-11.8-12.1-12.6C61.5 17.8 63.2 15.6 64 6z" fill="${c||'url(#mg)'}"/></svg>`;

const MODULES = require('./modules.js');
/* Both counts are derived from modules.js and substituted into every partial, so the number
   in the hero, the proof bar, the title tag and the FAQ can never disagree again. */
const NMOD = MODULES.filter(m => !m.spine).length;
const NAPP = MODULES.reduce((s, m) => s + m.apps.length, 0);
const fill = t => String(t).split('__NMOD__').join(NMOD).split('__NAPP__').join(NAPP);

/* ── module section markup ── */
const modSection = (m, i) => `
<section class="mod ${m.spine?'spine':(i%2?'alt':'')}" id="m${m.n}">
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

const html = fill(`<!doctype html><html lang="en"><head>${HEAD}<style>${CSS}</style></head><body>
<a class="skip" href="#main">Skip to content</a>
${TOP}
<section class="modwrap" id="modules">
 <div class="wrap sec-head">
  <div class="eyebrow">Modules &amp; apps</div>
  <h2>${NMOD} modules. ${NAPP} apps. One login.</h2>
  <p class="lead">Each module is a complete area of your business. Turn on what you need today — everything else is already wired for the day you need it.</p>
 </div>
</section>
${MODULES.map(modSection).join('')}
${BOT}
</body></html>`);

fs.writeFileSync(path.join(D,'index.html'), html);
console.log('index.html written:', Math.round(html.length/1024)+'KB');

/* ── render ── */
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1360,height:1000}, deviceScaleFactor:2 });
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+path.join(D,'index.html'), { waitUntil:'networkidle' });
  await p.evaluate(()=>document.querySelectorAll('.rv').forEach(e=>{e.style.animation='none';e.style.opacity=1;e.style.transform='none';}));
  await p.waitForTimeout(500);

  /* capture each section WITH its height so pages can be packed */
  const items=[];
  const grab = async (sel,name)=>{ const el=await p.$(sel); if(!el) return;
    const h=await el.evaluate(e=>e.getBoundingClientRect().height);
    await el.screenshot({path:path.join(SH,name+'.png')}); items.push({name,h}); };
  await grab('header','00_header');
  const secs = await p.$$('main > section, section.modwrap, section.mod');
  for (let i=0;i<secs.length;i++){
    const id = await secs[i].evaluate(e=>e.id||e.className.split(' ')[0]);
    const nm = String(i+1).padStart(2,'0')+'_'+id.replace(/[^a-z0-9]/gi,'');
    const h  = await secs[i].evaluate(e=>e.getBoundingClientRect().height);
    await secs[i].screenshot({path:path.join(SH,nm+'.png')}); items.push({name:nm,h});
  }
  await grab('footer','99_footer');
  const ov = await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  console.log('sections:',items.length,'| overflow:',ov,'| errors:',errs.length,
              '| total height:',Math.round(items.reduce((a,x)=>a+x.h,0))+'px');
  await p.close();

  /* pack sections onto A4 portrait pages — no wasted space, nothing cut in half */
  const VW=1360;                       // css width the shots were taken at
  const PW=190, PH=272;                // mm of usable page area
  const mmPerPx = PW/VW;               // scale when image spans the page width
  const BUDGET  = PH/mmPerPx;          // css px that fit on one page (~1946)
  const pagesArr=[]; let cur=[], used=0;
  for (const it of items){
    const hh = Math.min(it.h, BUDGET);            // a giant section gets its own page
    if (used>0 && used+hh > BUDGET){ pagesArr.push(cur); cur=[]; used=0; }
    cur.push(it); used += hh;
  }
  if (cur.length) pagesArr.push(cur);

  const pgs = pagesArr.map((grp,i)=>
    `<div class="pp"><div class="stack">`+
    grp.map(g=>`<img src="file://${path.join(SH,g.name)}.png">`).join('')+
    `</div><div class="pf"><span>medhava.com — One business. One brain.</span><span>${i+1} / ${pagesArr.length}</span></div></div>`
  ).join('');

  const book = `<!doctype html><html><head><meta charset="utf-8"><style>
   *{margin:0;padding:0;box-sizing:border-box}@page{size:A4;margin:0}
   body{background:#fff;font-family:'Segoe UI',system-ui,Arial,sans-serif}
   .pp{width:210mm;height:297mm;page-break-after:always;position:relative;padding:10mm 10mm 13mm;background:#fff;overflow:hidden}
   .stack{display:flex;flex-direction:column}
   .stack img{width:100%;display:block}
   .pf{position:absolute;left:10mm;right:10mm;bottom:5mm;display:flex;justify-content:space-between;font-size:7.5px;color:#a8bcc4;letter-spacing:.04em}
  </style></head><body>${pgs}</body></html>`;
  fs.writeFileSync(path.join(D,'book.html'), book);
  const q = await b.newPage();
  await q.goto('file://'+path.join(D,'book.html'), { waitUntil:'networkidle' });
  await q.waitForTimeout(900);
  const out = path.join(D,'Medhava_Website.pdf');
  await q.pdf({ path:out, width:'210mm', height:'297mm', printBackground:true });
  await b.close();
  console.log('PDF:', Math.round(fs.statSync(out).size/1024)+'KB ·', pagesArr.length, 'pages');
})();
