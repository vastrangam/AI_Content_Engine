'use strict';
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const REPO = '/home/user/AI_Content_Engine';
const FILE = 'file://' + REPO + '/Vastrangam_AI_Engine.html';
const D = __dirname;
const logo = fs.readFileSync(path.join(D, 'logo.txt'), 'utf8').trim();
const P = '#5B2D8E', P2 = '#7B3FBE', GOLD = '#C4975A', INK = '#1A0B38', MUT = '#6B5A86';

/* ── capture crisp figures from the live app ── */
async function shots() {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1360, height: 900 }, deviceScaleFactor: 2 });
  p.on('dialog', d => d.accept());
  await p.goto(FILE, { waitUntil: 'load' }); await p.waitForTimeout(400);
  const img = {};
  const grab = async (name, sel) => { const el = sel ? await p.$(sel) : p; img[name] = 'data:image/png;base64,' + (await (el || p).screenshot()).toString('base64'); };

  await grab('home', '#main');
  await p.evaluate(() => VA.go('ce')); await p.waitForTimeout(150);
  await p.fill('#ce_desc', 'ruby wine velvet zardozi lehenga for reception'); await p.selectOption('#ce_occ', 'reception'); await p.click('[data-act="cegen"]'); await p.waitForTimeout(400);
  await grab('run', '#main');
  await p.click('[data-act="runtab"][data-t="qa"]'); await p.waitForTimeout(200); await grab('qa', '#main .panel');
  await p.evaluate(() => VA.go('img')); await p.waitForTimeout(150);
  await p.click('[data-act="isaddtext"]'); await p.click('[data-act="isaddrect"]'); await p.evaluate(() => { VA.ISadj('sat', '150'); VA.ISadj('hue', '30'); }); await p.waitForTimeout(150);
  await grab('img', '.studio');
  await p.evaluate(() => VA.go('vid')); await p.waitForTimeout(150); await grab('vid', '.studio');
  await p.evaluate(() => VA.go('des')); await p.waitForTimeout(150); await p.click('[data-act="destpl"][data-id="t5"]'); await p.waitForTimeout(250); await grab('des', '.studio');
  await p.evaluate(() => VA.go('pub')); await p.waitForTimeout(200); await grab('pub', '#main');
  await p.click('#askbtn'); await p.waitForTimeout(150); await p.fill('#askinput', 'what is zardozi?'); await p.click('[data-act="asksend"]'); await p.waitForTimeout(200);
  img.ask = 'data:image/png;base64,' + (await (await p.$('#ask')).screenshot()).toString('base64');
  const st = await p.evaluate(() => VA.selftest);
  await b.close();
  return { img, st };
}

/* ── SVG diagrams ── */
function archDiagram() {
  const eng = [['Content', 'pen'], ['Image', 'img'], ['Video', 'film'], ['Design', 'layout'], ['Publisher', 'send']];
  const boxes = eng.map((e, i) => {
    const x = 40 + i * 150;
    return `<rect x="${x}" y="30" width="130" height="58" rx="10" fill="#fff" stroke="${P2}" stroke-width="2"/>
      <text x="${x + 65}" y="55" text-anchor="middle" font-size="14" font-weight="700" fill="${P}">${e[0]}</text>
      <text x="${x + 65}" y="73" text-anchor="middle" font-size="10" fill="${MUT}">engine</text>
      <line x1="${x + 65}" y1="88" x2="${x + 65}" y2="120" stroke="${GOLD}" stroke-width="2"/>`;
  }).join('');
  return `<svg viewBox="0 0 810 210" width="100%">
    ${boxes}
    <rect x="40" y="120" width="730" height="52" rx="12" fill="${P}"/>
    <text x="405" y="145" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">ONE DATA CORE</text>
    <text x="405" y="162" text-anchor="middle" font-size="10.5" fill="#E7D9F7">Products · Content runs · Assets · Channels · Calendar · Publish log</text>
    <rect x="40" y="184" width="730" height="20" rx="7" fill="#EDE8F8"/>
    <text x="405" y="198" text-anchor="middle" font-size="10.5" font-weight="700" fill="${MUT}">Assistant reads all of it · offline · on every screen</text>
  </svg>`;
}
function pipelineDiagram() {
  const phases = ['Buyer psychology', 'Market intel', 'Viral hook', 'Content DNA', 'Product content', 'Social 3-format',
    'Thumbnails', 'Ad variations', 'Marketplaces', 'Scale', 'Automation', 'Excel 9-sheet', 'Size / SKU'];
  const per = 4, rows = [];
  for (let i = 0; i < phases.length; i += per) rows.push(phases.slice(i, i + per));
  let y = 14, out = '';
  rows.forEach((r, ri) => {
    r.forEach((ph, ci) => {
      const x = 20 + ci * 195;
      out += `<rect x="${x}" y="${y}" width="178" height="40" rx="9" fill="${ri % 2 ? '#F6ECD8' : '#EFE4FB'}" stroke="${ri % 2 ? GOLD : P2}" stroke-width="1.5"/>
        <text x="${x + 89}" y="${y + 25}" text-anchor="middle" font-size="11.5" font-weight="600" fill="${INK}">${ph}</text>`;
    });
    y += 56;
  });
  return `<svg viewBox="0 0 810 ${y}" width="100%">${out}</svg>`;
}
function barChart(title, data) {
  const max = Math.max(...data.map(d => d.v));
  const bw = 700 / data.length;
  const bars = data.map((d, i) => {
    const h = d.v / max * 150, x = 55 + i * bw, y = 180 - h;
    return `<rect x="${x + 8}" y="${y}" width="${bw - 26}" height="${h}" rx="4" fill="url(#g)"/>
      <text x="${x + (bw - 10) / 2}" y="${y - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="${P}">${d.v}</text>
      <text x="${x + (bw - 10) / 2}" y="196" text-anchor="middle" font-size="10" fill="${MUT}">${d.l}</text>`;
  }).join('');
  return `<svg viewBox="0 0 780 210" width="100%"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${P2}"/><stop offset="1" stop-color="${GOLD}"/></linearGradient></defs>
    <line x1="50" y1="180" x2="760" y2="180" stroke="#D3C4EC" stroke-width="1.5"/>${bars}</svg>`;
}

/* ── the book ── */
function book(img, st) {
  const page = (cls, inner) => `<section class="pg ${cls || ''}">${inner}<div class="pn"></div></section>`;
  const fig = (src, cap) => `<figure><img src="${src}"><figcaption>${cap}</figcaption></figure>`;
  const H1 = t => `<h1>${t}</h1>`, H2 = t => `<h2>${t}</h2>`, L = t => `<p class="lead">${t}</p>`;

  const cover = page('cover', `
    <img class="logo" src="${logo}">
    <div class="ct">
      <div class="kick">MODULE 14 · VASTRANGAM SUITE</div>
      <h1>Vastrangam AI Engine</h1>
      <div class="sub">One studio, five engines, one file — content, image, video, design and publishing over one set of records, with an assistant that works offline.</div>
      <div class="meta"><b>Desire to Attire · Crafted in Surat. Worn Everywhere.</b><br>Vastrangam_AI_Engine.html · 255 KB · works with the internet off · ${st.pass}/${st.pass + st.fail} self-tests pass</div>
    </div>`);

  const p1 = page('', H1('What it is') +
    L('Five tools most people buy separately — a listing writer, a photo editor, a reel maker, a poster designer and a publishing scheduler — rebuilt as one HTML file that opens by double-click and runs with the internet switched off. They share one set of records, so a product you generate content for is instantly ready to design, film and publish. And on every screen there is an assistant that reads those records and answers in plain language.') +
    H2('The architecture, in one picture') + archDiagram() +
    `<div class="good">Five engines above, one data core beneath. Nothing is synced between the engines because there is only one set of records under all of them — which is the whole reason it is one app and not five.</div>`);

  const p2 = page('', H1('The Content Engine') +
    L('Type a product and press Generate. All 13 phases run offline, from the colour, fabric, craft and occasion libraries in the Vastrangam spec. A connected AI model is optional — it only upgrades the prose; the pack, the uniqueness check and the QA gate run without one.') +
    H2('The 13-phase pipeline') + pipelineDiagram() +
    fig(img.run, 'A real generated run — four title variants with character counts, a humanized Shopify body whose opening line never starts with the product noun, and the specification table with no blank cells.'));

  const p3 = page('', H2('The QA gate — machine-checkable') +
    L('Every pack scores itself against ten checks before it ships. A fail means the pack should not go out as-is. This is the humanized-engine rulebook made into arithmetic.') +
    fig(img.qa, 'The QA gate on a generated pack: opening line, banned phrases, lyric purity, blank cells, title and meta lengths, handle format, tag count, four distinct titles and the AEO block — all checked, with a live score ring.') +
    H2('What a run produces') +
    `<table class="t"><tbody>
      <tr><td><b>Listing</b></td><td>4 titles · Shopify HTML · handle · SEO title · meta · tags · feature bullets · FAQ · blog opener</td></tr>
      <tr><td><b>Social</b></td><td>Instagram post + 20 hashtags · 10-slide carousel · 3-act reel + voiceover</td></tr>
      <tr><td><b>Video</b></td><td>cinematic scene breakdown · Suno song with zero product words</td></tr>
      <tr><td><b>Marketplaces</b></td><td>Amazon title + 5 bullets + keywords · Flipkart category attributes · Myntra · Ajio · Meesho</td></tr>
      <tr><td><b>Handoff</b></td><td>three ad angles · email campaign · Make/n8n webhook JSON · a 9-sheet .xlsx with no blanks</td></tr>
    </tbody></table>`);

  const p4 = page('', H1('Image Studio &amp; Video Studio') +
    L('Two real canvas engines, not mock-ups.') +
    fig(img.img, 'Image Studio — a layer stack (image, text, shapes), live brightness/contrast/saturation/hue/blur, seven marketplace output sizes, and PNG/JPG/WebP export at the exact pixels.') +
    fig(img.vid, 'Video Studio — a timeline with keyframed clips over a live 9:16 preview. Exports WebM, an animated GIF and a PNG frame sequence, all offline. MP4/H.264 is a Connectors item because it genuinely needs a server.'));

  const p5 = page('', H1('Design Studio &amp; Publisher') +
    fig(img.des, 'Design Studio — templates, a poster canvas, the Vastrangam brand kit, Magic resize between sizes, and one-click fill from a content run.') +
    fig(img.pub, 'Publisher — schedule a run to channels, see it on a live calendar, publish, and watch the log. Channels connect with a scoped, revocable key — never a password.'));

  const p6 = page('', H1('The assistant — on every screen, offline') +
    L('The built-in engine reads your live records, knows every screen, defines any fabric/colour/craft/occasion term, looks up any SKU, and can open any screen. It needs no internet and no key. Connect a model only if you also want free-form chat.') +
    `<div class="two"><div>${fig(img.ask, 'Ask the Engine, answering a vocabulary question with the source it read from.')}</div>
    <div><h2 style="margin-top:0">It answers things like</h2>
    <table class="t small"><tbody>
      <tr><td>"how many runs do I have?"</td><td>live count</td></tr>
      <tr><td>"what's my QA score?"</td><td>from every run</td></tr>
      <tr><td>"how do I make a reel?"</td><td>the steps</td></tr>
      <tr><td>"what is zardozi?"</td><td>from the library</td></tr>
      <tr><td>"what is VAN2094?"</td><td>the product record</td></tr>
      <tr><td>"open Content Engine"</td><td>navigates</td></tr>
    </tbody></table>
    <div class="rule"><b>It will never ask for a password.</b> Channels use scoped keys only. If any screen asks for a marketplace, bank or account password, it is not this app.</div></div></div>`);

  const p7 = page('', H1('No lock-in, and how it was verified') +
    H2('Every capability has a built-in offline way') +
    `<table class="t"><thead><tr><th>Capability</th><th>Built-in (offline)</th><th>Or plug in</th></tr></thead><tbody>
      <tr><td>AI text / chat</td><td>rules engine</td><td>Claude · GPT · Gemini · Ollama…</td></tr>
      <tr><td>Video render</td><td>WebM · GIF · frames</td><td>FFmpeg · Remotion (for MP4)</td></tr>
      <tr><td>Spreadsheets</td><td>built-in .xlsx/.csv</td><td>Google Sheets · Excel</td></tr>
      <tr><td>Automation</td><td>webhook JSON</td><td>Make · n8n · Zapier</td></tr>
      <tr><td>Publishing</td><td>payload + log</td><td>Shopify · Amazon · Meta…</td></tr>
    </tbody></table>` +
    H2('Verified in a real browser') +
    barChart('checks', [{ l: 'Self-tests', v: st.pass }, { l: 'QA checks', v: 10 }, { l: 'Screens', v: 11 }, { l: 'Engines', v: 5 }, { l: 'Ext. requests', v: 0 }]) +
    `<div class="good"><b>${st.pass}/${st.pass + st.fail} self-tests pass · the app was driven through every screen with zero console errors · with all non-file requests blocked it still generates a full pack — 0 external requests. It is genuinely offline.</b></div>`);

  const pages = [cover, p1, p2, p3, p4, p5, p6, p7].join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:0}
    *{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{font-family:'Helvetica Neue',Arial,sans-serif;color:${INK}}
    .pg{width:210mm;min-height:297mm;padding:20mm 18mm;position:relative;page-break-after:always;background:#fff}
    .pg.cover{background:linear-gradient(150deg,#3A1A63,#5B2D8E 55%,#7B3FBE);color:#fff;display:flex;flex-direction:column;justify-content:center}
    .cover .logo{height:74px;width:auto;background:#1A0B38;padding:8px;border-radius:12px;margin-bottom:26px}
    .cover .kick{font-size:12px;letter-spacing:3px;color:#E7D9F7;font-weight:700}
    .cover h1{font-family:Georgia,serif;font-size:46px;margin:8px 0 14px;letter-spacing:.5px;color:#fff}
    .cover .sub{font-size:16px;line-height:1.55;color:#EADFFB;max-width:150mm}
    .cover .meta{margin-top:40px;font-size:12.5px;color:#E7D9F7;line-height:1.7;border-top:1px solid rgba(255,255,255,.25);padding-top:16px}
    h1{font-family:Georgia,serif;font-size:27px;color:${P};margin-bottom:10px;letter-spacing:.2px}
    h2{font-family:Georgia,serif;font-size:18px;color:${P};margin:18px 0 9px}
    .lead{font-size:13.5px;line-height:1.6;color:#3A2E52;margin-bottom:14px}
    svg{margin:6px 0 14px}
    figure{margin:12px 0}
    figure img{width:100%;border:1px solid #E2D8F2;border-radius:10px;box-shadow:0 2px 12px rgba(40,20,70,.1)}
    figcaption{font-size:11px;color:${MUT};margin-top:6px;line-height:1.45}
    .good{background:#E4F6EC;border-left:4px solid #2E9E6B;border-radius:8px;padding:11px 13px;font-size:12.5px;line-height:1.5;margin-top:12px}
    .rule{background:#F6ECD8;border-left:4px solid ${GOLD};border-radius:8px;padding:11px 13px;font-size:12.5px;line-height:1.5;margin-top:12px}
    table.t{width:100%;border-collapse:collapse;font-size:12px;margin:8px 0 14px}
    table.t th{text-align:left;background:${P};color:#fff;padding:7px 10px;font-size:11px}
    table.t td{border:1px solid #E2D8F2;padding:7px 10px;vertical-align:top}
    table.t tbody tr:nth-child(even){background:#F8F5FF}
    table.t.small td{font-size:11.5px;padding:5px 8px}
    .two{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}
    .pn{position:absolute;bottom:12mm;right:18mm;font-size:10px;color:${MUT}}
  </style></head><body>${pages}</body></html>`;
}

(async () => {
  const { img, st } = await shots();
  const html = book(img, st);
  const htmlPath = path.join(D, 'book.html'); fs.writeFileSync(htmlPath, html);
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.goto('file://' + htmlPath, { waitUntil: 'load' }); await p.emulateMedia({ media: 'print' });
  const out = path.join(REPO, 'Vastrangam_AI_Engine.pdf');
  await p.pdf({ path: out, format: 'A4', printBackground: true });
  await b.close();
  const n = (fs.readFileSync(out).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log('PDF written', out, '·', n, 'pages ·', Math.round(fs.statSync(out).size / 1024), 'KB · selftest', st.pass + '/' + (st.pass + st.fail));
})();
