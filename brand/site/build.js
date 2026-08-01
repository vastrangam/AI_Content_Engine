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
const LOCKUP = 'data:image/png;base64,' +
  fs.readFileSync(path.join(D, '..', 'identity', 'medhava-logo.png')).toString('base64');
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
const SUFFIX = ED ? '_' + ED.id.toLowerCase() : '';
const fill = t => String(t)
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
  .split('__MARK_HEADER__').join('<img class="blogo" src="'+LOCKUP+'" alt="Medhava — One business. One brain." width="952" height="364">')
  .split('__MARK_FOOTER__').join('<span class="flogo"><img src="'+LOCKUP+'" alt="Medhava — One business. One brain." width="952" height="364"></span>')
  .split('__MARK_SHOT__').join('<span class="sm">'+LOGO.tile('lgs',26)+'</span>')
  .split('__FAVICON__').join(LOGO.dataUri(LOGO.circle('fv')))
  .split('__APPICON__').join(LOGO.dataUri(LOGO.tile('ai')));

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

const BODY = fill(`
<a class="skip" href="#main">Skip to content</a>
${TOP}
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
${MODULES.map(modSection).join('')}
${BOT}`);

const THEMEJS = `<script>(function(){try{var t=localStorage.getItem('medhava-theme');
 if(!t)t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
 document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>`;
/* the pricing switch — a real control on the site; the PDF prints the yearly state */
const BILLJS = `<script>(function(){document.addEventListener('click',function(e){
 var b=e.target.closest('.pt');if(!b)return;
 var box=b.closest('#pricing');box.setAttribute('data-bill',b.dataset.bill);
 box.querySelectorAll('.pt').forEach(function(x){x.classList.toggle('on',x===b);});});})();</script>`;
const TOGGLEJS = `<script>(function(){var r=document.documentElement;
 function set(t){r.setAttribute('data-theme',t);try{localStorage.setItem('medhava-theme',t);}catch(e){}
   document.querySelectorAll('.tt').forEach(function(b){b.setAttribute('aria-pressed',t==='dark');
     b.querySelector('.ttl').textContent=t==='dark'?'Day':'Night';});}
 document.addEventListener('click',function(e){var b=e.target.closest('.tt');if(!b)return;
   set(r.getAttribute('data-theme')==='dark'?'light':'dark');});
 set(r.getAttribute('data-theme')||'light');})();</script>`;

/* the live page — one theme at a time, with the toggle */
const html = `<!doctype html><html lang="en"><head>${fill(HEAD)}<style>${CSS}</style></head><body>
${THEMEJS}${BODY}${TOGGLEJS}${BILLJS}
</body></html>`;

/* the printed book — BOTH themes in one file, light half then dark half, each opening
   with the header, the logo and the whole menu. */
const book = `<!doctype html><html lang="en"><head>${fill(HEAD)}<style>${CSS}</style></head><body>
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
  const out = path.join(D, (ED ? ED.company : 'Medhava') + '_Website.pdf');
  await p.pdf({ path:out, format:'A4', printBackground:true, scale:0.673,
                margin:{top:'0mm',bottom:'0mm',left:'0mm',right:'0mm'} });
  await p.close();
  console.log('PDF:', path.basename(out), Math.round(fs.statSync(out).size/1024)+'KB (vector text,',
              'light + dark in one file) | overflow:', ov, '| errors:', errs.length);
  await b.close();
})();
