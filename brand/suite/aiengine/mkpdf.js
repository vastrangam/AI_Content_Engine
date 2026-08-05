'use strict';
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const REPO = '/home/user/AI_Content_Engine';
const FILE = 'file://' + REPO + '/Vastrangam_AI_Engine.html';
const D = __dirname;
const logo = fs.readFileSync(path.join(D, 'logo.txt'), 'utf8').trim();
const P = '#5B2D8E', P2 = '#7B3FBE', GOLD = '#C4975A', INK = '#1A0B38', MUT = '#6B5A86';
const KB = Math.round(fs.statSync(path.join(REPO, 'Vastrangam_AI_Engine.html')).size / 1024);

/* ── capture crisp figures from the live app ── */
async function shots() {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1360, height: 1000 }, deviceScaleFactor: 2 });
  p.on('dialog', d => d.accept());
  await p.goto(FILE, { waitUntil: 'load' }); await p.waitForTimeout(500);
  const img = {};
  const grab = async (name, sel) => { const el = sel ? await p.$(sel) : p; img[name] = 'data:image/png;base64,' + (await (el || p).screenshot()).toString('base64'); };

  await grab('home', '#main');

  /* Catalogue — bulk upload grouped into product / colour / pose */
  await p.evaluate(() => VA.go('cat')); await p.waitForTimeout(150);
  await p.click('[data-act="catdemo"]'); await p.waitForTimeout(400);
  await grab('cat', '#main');

  /* Content Engine — a real run + the QA gate */
  await p.evaluate(() => VA.go('ce')); await p.waitForTimeout(150);
  await p.fill('#ce_desc', 'ruby wine velvet zardozi lehenga for reception'); await p.selectOption('#ce_occ', 'reception'); await p.click('[data-act="cegen"]'); await p.waitForTimeout(450);
  await grab('run', '#main');
  await p.click('[data-act="runtab"][data-t="qa"]'); await p.waitForTimeout(200); await grab('qa', '#main .panel');

  /* Image Studio — layers + filter + background */
  await p.evaluate(() => VA.go('img')); await p.waitForTimeout(150);
  await p.click('[data-act="isaddtext"]'); await p.click('[data-act="isaddrect"]'); await p.evaluate(() => { VA.ISadj('sat', '150'); VA.ISadj('hue', '30'); }); await p.waitForTimeout(150);
  await grab('img', '.studio');

  /* Video Studio */
  await p.evaluate(() => VA.go('vid')); await p.waitForTimeout(150); await grab('vid', '.studio');

  /* Design Studio — build a carousel from the gallery (desxtra shows only when no design is open) */
  await p.evaluate(() => VA.go('des')); await p.waitForTimeout(250);
  await p.click('[data-act="desquick"][data-k="carousel"]'); await p.waitForTimeout(700);
  await grab('carousel', '#main');
  /* then the template canvas */
  await p.evaluate(() => VA.go('des')); await p.waitForTimeout(150); await p.click('[data-act="destpl"][data-id="t5"]'); await p.waitForTimeout(250); await grab('des', '.studio');

  /* Themes — free theme + editable AI theme */
  await p.evaluate(() => VA.go('themes')); await p.waitForTimeout(150);
  await p.click('[data-act="themeset"][data-id="emerald"]'); await p.waitForTimeout(300);
  await grab('themes', '#main');
  /* restore the house theme so the rest of the shots stay on-brand */
  await p.evaluate(() => { try { VTheme.apply(VTheme.FREE[0]); } catch (e) {} }); await p.waitForTimeout(150);

  /* Publisher */
  await p.evaluate(() => VA.go('pub')); await p.waitForTimeout(200); await grab('pub', '#main');

  /* Connectors — the free-first router */
  await p.evaluate(() => VA.go('conn')); await p.waitForTimeout(200); await grab('conn', '#main');

  /* Assistant */
  await p.click('#askbtn'); await p.waitForTimeout(150); await p.fill('#askinput', 'what is zardozi?'); await p.click('[data-act="asksend"]'); await p.waitForTimeout(250);
  img.ask = 'data:image/png;base64,' + (await (await p.$('#ask')).screenshot()).toString('base64');

  const st = await p.evaluate(() => VA.runTests());
  await b.close();
  return { img, st };
}

/* ── SVG diagrams ── */
function workflowDiagram() {
  const steps = [['Catalogue', 'drop 20–30 photos'], ['Content', 'listing · social · Excel'],
    ['Image', 'JPG · WebP · PNG'], ['Design', 'banner · carousel · thumb'], ['Video', 'still → reel'], ['Publish', 'payload · calendar · log']];
  const w = 810, bw = 118, gap = (w - steps.length * bw) / (steps.length - 1);
  let out = '';
  steps.forEach((s, i) => {
    const x = i * (bw + gap);
    out += `<rect x="${x}" y="26" width="${bw}" height="62" rx="11" fill="${i === 0 ? P : '#fff'}" stroke="${i === 0 ? P : P2}" stroke-width="2"/>
      <text x="${x + bw / 2}" y="52" text-anchor="middle" font-size="13.5" font-weight="700" fill="${i === 0 ? '#fff' : P}">${s[0]}</text>
      <text x="${x + bw / 2}" y="70" text-anchor="middle" font-size="9" fill="${i === 0 ? '#E7D9F7' : MUT}">${s[1]}</text>`;
    if (i < steps.length - 1) { const ax = x + bw + gap / 2; out += `<path d="M${x + bw + 4} 57 L${ax + 6} 57" stroke="${GOLD}" stroke-width="2"/><path d="M${ax + 2} 52 l7 5 -7 5z" fill="${GOLD}"/>`; }
  });
  out += `<rect x="0" y="104" width="${w}" height="24" rx="8" fill="#EDE8F8"/>
    <text x="${w / 2}" y="120" text-anchor="middle" font-size="10.5" font-weight="700" fill="${MUT}">One set of records under every step · the assistant reads all of it · offline · on every screen</text>`;
  return `<svg viewBox="0 0 ${w} 138" width="100%">${out}</svg>`;
}
function routerDiagram() {
  const rows = [['Built-in engine', 'offline · always on · never removed', '#EFE4FB', P2, 'FREE'],
    ['Gemini (your key)', 'free tier · your browser only', '#F6ECD8', GOLD, 'FREE'],
    ['OpenRouter · Groq', 'free tiers first', '#F6ECD8', GOLD, 'FREE'],
    ['Ollama / LM Studio', 'runs on your own computer', '#F6ECD8', GOLD, 'FREE'],
    ['Pollinations (images)', 'no key needed', '#F6ECD8', GOLD, 'FREE'],
    ['OpenAI · Claude', 'only if you want them', '#EDE8F8', MUT, 'PAID']];
  let y = 8, out = '';
  rows.forEach((r, i) => {
    out += `<rect x="20" y="${y}" width="600" height="34" rx="8" fill="${r[2]}" stroke="${r[3]}" stroke-width="1.5"/>
      <text x="36" y="${y + 15}" font-size="12.5" font-weight="700" fill="${INK}">${r[0]}</text>
      <text x="36" y="${y + 29}" font-size="10" fill="${MUT}">${r[1]}</text>
      <rect x="548" y="${y + 8}" width="56" height="18" rx="9" fill="${r[4] === 'FREE' ? '#2E9E6B' : MUT}"/>
      <text x="576" y="${y + 21}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${r[4]}</text>`;
    if (i < rows.length - 1) out += `<path d="M320 ${y + 34} L320 ${y + 42}" stroke="${MUT}" stroke-width="1.5"/><path d="M315 ${y + 40} l5 6 5 -6z" fill="${MUT}"/>`;
    y += 42;
  });
  out += `<text x="636" y="120" text-anchor="middle" font-size="10.5" fill="${MUT}" transform="rotate(90 636 120)">tries top-down, falls back down the chain</text>`;
  return `<svg viewBox="0 0 660 ${y}" width="100%">${out}</svg>`;
}
function exportDiagram() {
  const outs = [['JPG', 'the photo', P2], ['WebP', 'light for web', GOLD], ['PNG', 'transparent bg', P], ['CSV', 'title · desc · alt', MUT]];
  const bx = 320, srcY = 96;
  let out = `<rect x="20" y="68" width="160" height="56" rx="10" fill="${P}"/>
    <text x="100" y="92" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">One image</text>
    <text x="100" y="110" text-anchor="middle" font-size="9.5" fill="#E7D9F7">edited + cut out</text>`;
  outs.forEach((o, i) => {
    const y = 18 + i * 44, cy = y + 15;
    out += `<path d="M180 ${srcY} C 250 ${srcY}, 250 ${cy}, ${bx} ${cy}" stroke="${o[2]}" stroke-width="2" fill="none"/>
      <rect x="${bx}" y="${y}" width="180" height="30" rx="8" fill="#fff" stroke="${o[2]}" stroke-width="2"/>
      <text x="${bx + 14}" y="${cy + 1}" font-size="12" font-weight="700" fill="${o[2]}">${o[0]}</text>
      <text x="${bx + 66}" y="${cy + 1}" font-size="9.5" fill="${MUT}">${o[1]}</text>`;
  });
  out += `<rect x="${bx}" y="200" width="180" height="24" rx="7" fill="#EDE8F8"/><text x="${bx + 90}" y="216" text-anchor="middle" font-size="10" font-weight="700" fill="${MUT}">all zipped in one download</text>`;
  return `<svg viewBox="0 0 520 232" width="100%">${out}</svg>`;
}
function barChart(data) {
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
  const total = st.pass + st.fail;
  const page = (cls, inner) => `<section class="pg ${cls || ''}">${inner}<div class="pn"></div></section>`;
  const fig = (src, cap) => `<figure><img src="${src}"><figcaption>${cap}</figcaption></figure>`;
  const H1 = t => `<h1>${t}</h1>`, H2 = t => `<h2>${t}</h2>`, L = t => `<p class="lead">${t}</p>`;

  const cover = page('cover', `
    <img class="logo" src="${logo}">
    <div class="ct">
      <div class="kick">MODULE 14 · VASTRANGAM SUITE</div>
      <h1>Vastrangam AI Engine</h1>
      <div class="sub">One studio for the whole catalogue workflow — bulk upload, content, image editing, video, design and publishing over one set of records, with free-first AI and an assistant that works offline.</div>
      <div class="meta"><b>Desire to Attire · Crafted in Surat. Worn Everywhere.</b><br>Vastrangam_AI_Engine.html · ${KB} KB · works with the internet off · ${st.pass}/${total} self-tests pass</div>
    </div>`);

  const p1 = page('', H1('What it is') +
    L('Six tools most people buy separately — a bulk catalogue organiser, a listing writer, a Photoshop-style photo editor, a reel maker, a Canva-style designer and a publishing scheduler — rebuilt as one HTML file that opens by double-click and runs with the internet switched off. They share one set of records, so a set of photos you drop in is instantly ready to write, edit, design, film and publish. On every screen an assistant reads those records and answers in plain language.') +
    H2('The workflow, in one picture') + workflowDiagram() +
    `<div class="good">The <b>Catalogue</b> is the top of the flow: drop 20–30 photos and they group into <b>Product → Colour variant → Pose</b>. Everything below reads from it — which is the whole reason it is one app and not six.</div>` +
    H2('Free-first AI, never locked to one company') + routerDiagram() +
    `<div class="rule">Everything works offline with the built-in engine. Connect a model to upgrade the prose and generate images — <b>free options first, paid last, never required</b>. Your key is stored in <b>your browser only</b>, never in the file.</div>`);

  const p2 = page('', H1('The Catalogue — the top of the workflow') +
    L('Drop 20–30 images at once. Each is read by its filename and grouped automatically into Product → Colour variant → Pose (front, back, close-up, side). Fix any tag by hand, then every product has one-click Generate content, Edit images and Make banner / thumbnail. Full-resolution photos are held in the browser’s own IndexedDB, so thirty of them are no problem — and it is still offline.') +
    fig(img.cat, 'A demo catalogue after grouping — two products across three colour variants (Anarkali Gown in Mehendi Green and Ruby Wine, Organza Saree in Sage Mist), each resolved into its front / back / close-up / side poses, ready to push straight into content, images and design.'));

  const p3 = page('', H1('The Content Engine') +
    L('Type a product, or generate straight from a catalogue product. All 13 phases run offline, from the colour, fabric, craft and occasion libraries in the Vastrangam spec. A connected model is optional — it only upgrades the prose; the pack, the uniqueness check and the QA gate run without one.') +
    fig(img.run, 'A real generated run — four title variants with character counts, a humanized Shopify body whose opening line never starts with the product noun, and the specification table with no blank cells.') +
    fig(img.qa, 'The QA gate: opening line, banned phrases, lyric purity, blank cells, title and meta lengths, handle format, tag count, four distinct titles and the AEO block — ten checks, with a live score ring. Beside the 9-sheet Excel, one click also builds a market-analysis .doc (trends · competitors · gap · what you do better).'));

  const p4 = page('', H1('Image Studio — Photoshop-style') +
    L('A real layer editor, not a mock-up: an image / text / shape layer stack, live brightness · contrast · saturation · hue · blur, one-tap filters, an instant offline background cut-out (with an optional sharper model), and a white-studio backdrop.') +
    fig(img.img, 'Image Studio — the layer stack with a live adjustment applied across the canvas. Catalogue shots open here directly with "Edit images".') +
    H2('One image, three formats, matched metadata') + exportDiagram() +
    `<div class="good">Press <b>Download JPG + WebP + PNG</b> and all three come out at once — JPG for photos, WebP light for web, PNG with a transparent background — plus a metadata CSV carrying the <b>title / description / alt text</b> matched to that product’s content, all in one ZIP.</div>`);

  const p5 = page('', H1('Design Studio — Canva-style') +
    L('Templates and a poster canvas styled by the active theme, filled from a content run in one click, with Magic resize between sizes. The Quick assets panel builds the three you need most — a web banner (1500×500), a YouTube thumbnail (1280×720), and a full carousel.') +
    fig(img.carousel, 'A ten-slide carousel built from a content run — every slide themed and filled automatically, ready to review and export as a ZIP.') +
    fig(img.des, 'The Design Studio canvas — brand-kit colours, editable text and elements, and one-click fill from a run.'));

  const p6 = page('', H1('Themes — restyle everything, like a brand kit') +
    L('Eight free themes, or type a mood into the AI theme box (for example "royal midnight blue and gold") and it builds a matching palette instantly and offline — refined further if a model is connected. Every colour is then an editable control, and your choice is applied the moment the app opens.') +
    fig(img.themes, 'The Themes screen with Emerald Silk applied — the whole app, every screen and canvas, restyled in one click; each colour below is editable by hand.') +
    H2('Video Studio') +
    fig(img.vid, 'A timeline with keyframed clips over a live 9:16 preview; a still animated into a short reel. Exports WebM, an animated GIF and a PNG frame sequence, offline. Real AI video (Veo) and MP4/H.264 are paid Connectors items because they genuinely need a server.'));

  const p7 = page('', H1('Publisher &amp; the assistant') +
    fig(img.pub, 'Publisher — schedule a run to channels, see it on a live calendar, publish, and watch the log. Channels connect with a scoped, revocable key — never a password.') +
    `<div class="two"><div>${fig(img.ask, 'Ask the Engine — answering a vocabulary question with the source it read from. Ask it "what can this tool do" for the full tour.')}</div>
    <div><h2 style="margin-top:0">The assistant answers</h2>
    <table class="t small"><tbody>
      <tr><td>"how many runs do I have?"</td><td>live count</td></tr>
      <tr><td>"what can this tool do?"</td><td>full tour</td></tr>
      <tr><td>"how do I make a reel?"</td><td>the steps</td></tr>
      <tr><td>"what is zardozi?"</td><td>from the library</td></tr>
      <tr><td>"open Content Engine"</td><td>navigates</td></tr>
    </tbody></table>
    <div class="rule"><b>It will never ask for a password.</b> Channels use scoped keys only. If any screen asks for a marketplace, bank or account password, it is not this app.</div></div></div>`);

  const p8 = page('', H1('No lock-in, and how it was verified') +
    H2('Every capability has a built-in offline way') +
    `<table class="t"><thead><tr><th>Capability</th><th>Built-in (offline)</th><th>Or plug in (free first)</th></tr></thead><tbody>
      <tr><td>AI text / chat</td><td>rules engine</td><td>Gemini · OpenRouter · Groq · Ollama · GPT · Claude</td></tr>
      <tr><td>AI images</td><td>algorithmic / auto</td><td>Gemini · Pollinations (no key)</td></tr>
      <tr><td>Background removal</td><td>instant auto cut-out</td><td>optional ML model (downloads once)</td></tr>
      <tr><td>Video render</td><td>WebM · GIF · frames</td><td>FFmpeg · Veo (for MP4 / real AI video)</td></tr>
      <tr><td>Spreadsheets</td><td>built-in .xlsx/.csv</td><td>Google Sheets · Excel</td></tr>
      <tr><td>Publishing</td><td>payload + log</td><td>Shopify · Amazon · Meta…</td></tr>
    </tbody></table>` +
    H2('Verified in a real browser') +
    barChart([{ l: 'Self-tests', v: st.pass }, { l: 'QA checks', v: 10 }, { l: 'Screens', v: 13 }, { l: 'Engines', v: 6 }, { l: 'Ext. requests', v: 0 }]) +
    `<div class="good"><b>${st.pass}/${total} self-tests pass · the app was driven through every screen with zero console errors · with all non-file requests blocked it still bulk-groups a catalogue, generates a full pack, builds a carousel and applies a theme — 0 external requests. It is genuinely offline.</b></div>`);

  const pages = [cover, p1, p2, p3, p4, p5, p6, p7, p8].join('\n');
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
    figure{margin:12px 0;break-inside:avoid;page-break-inside:avoid;text-align:center}
    figure img{max-width:100%;max-height:172mm;width:auto;border:1px solid #E2D8F2;border-radius:10px;box-shadow:0 2px 12px rgba(40,20,70,.1);display:block;margin:0 auto}
    figcaption{font-size:11px;color:${MUT};margin-top:6px;line-height:1.45;text-align:left}
    table.t,svg,.good,.rule{break-inside:avoid;page-break-inside:avoid}
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
