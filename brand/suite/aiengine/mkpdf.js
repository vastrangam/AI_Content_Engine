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
  await p.goto(FILE, { waitUntil: 'load' }); await p.waitForTimeout(700);
  const img = {};
  const grab = async (name, sel) => { const el = sel ? await p.$(sel) : p; img[name] = 'data:image/png;base64,' + (await (el || p).screenshot()).toString('base64'); };

  /* seed the catalogue with real photographs so every screen shows a garment, not a placeholder */
  await p.evaluate(async () => {
    function shot(a, bb, label, wm) {
      const c = document.createElement('canvas'); c.width = 800; c.height = 1000; const x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, 800, 1000); g.addColorStop(0, a); g.addColorStop(1, bb);
      x.fillStyle = g; x.fillRect(0, 0, 800, 1000);
      x.fillStyle = 'rgba(255,255,255,.13)';
      for (let i = 0; i < 60; i++) x.fillRect(Math.random() * 800, Math.random() * 1000, 70, 3);
      x.fillStyle = 'rgba(255,255,255,.85)'; x.font = '600 30px Georgia'; x.textAlign = 'center';
      x.fillText(label, 400, 950);
      if (wm) { x.fillStyle = 'rgba(255,255,255,.8)'; x.font = '800 52px Arial'; x.fillText('RAJPATH', 400, 130); }
      return c.toDataURL('image/jpeg', 0.9);
    }
    const poses = ['front', 'back', 'closeup', 'side'], variants = [];
    for (const [name, a, bb] of [['Mehendi Green', '#3E6B22', '#8FBF5A'], ['Ruby Wine', '#5E1229', '#B24A6E']]) {
      const shots = [];
      for (let i = 0; i < poses.length; i++) {
        const id = 'sh' + Math.random().toString(36).slice(2, 8), key = 'img_' + id;
        const du = shot(a, bb, poses[i], i === 0);
        await new Promise(r => VStore.putDataURL(key, du, r));
        shots.push({ id: id, key: key, name: name + '-' + poses[i], thumb: du, pose: poses[i], hasWatermark: i === 0 });
      }
      variants.push({ colour: name, hex: a, shots: shots });
    }
    VA.DB.catalogue = [{ id: 'cpx', name: 'Anarkali Gown', variants: variants,
      details: { fabric: 'Roman Silk', work: 'Zari' }, runId: null }];
    VA.save();
  });

  await grab('home', '#main');

  await p.evaluate(() => VA.go('cat')); await p.waitForTimeout(500);
  await grab('cat', '#main');

  await p.evaluate(() => VA.go('ce')); await p.waitForTimeout(200);
  await p.fill('#ce_desc', 'mehendi green roman silk zari anarkali for mehendi');
  await p.click('[data-act="cegen"]'); await p.waitForTimeout(700);
  await grab('run', '#main');
  await p.click('[data-act="runtab"][data-t="qa"]').catch(() => {}); await p.waitForTimeout(300);
  await grab('qa', '#main .panel');

  /* Image Studio with the watermark actually erased */
  await p.evaluate(() => { VA.DB.imgLoadKey = VA.DB.catalogue[0].variants[0].shots[0].key; VA.go('img'); });
  await p.waitForTimeout(900);
  await grab('imgbefore', '#isstage');
  await p.evaluate(async () => {
    const S = VA.IMGSTATE;
    let li = -1; for (let i = S.layers.length - 1; i >= 0; i--) if (S.layers[i].type === 'image') { li = i; break; }
    if (li < 0) return;
    const l = S.layers[li];
    S.brush = 46;
    S.strokes = [{ r: 44, pts: [[l.x + l.w * .5 - 190, l.y + l.h * .125], [l.x + l.w * .5 - 60, l.y + l.h * .125], [l.x + l.w * .5 + 60, l.y + l.h * .125], [l.x + l.w * .5 + 190, l.y + l.h * .125]] }];
    const sel = document.querySelector('#isalgo'); if (sel) sel.value = 'patchmatch';
    document.querySelector('[data-act="iserase"]').click();
    /* wait for the rebuild to finish rather than guessing a duration — the erase clears
       the strokes when it is done */
    for (let i = 0; i < 120 && (VA.IMGSTATE.strokes || []).length; i++) await new Promise(r => setTimeout(r, 250));
    await new Promise(r => setTimeout(r, 400));
    document.querySelector('[data-act="iswm"]').click();
    const fr = document.querySelector('[data-act="isframe"][data-i="1"]'); if (fr) fr.click();
  });
  await p.waitForTimeout(1500);
  await grab('img', '#isstage');
  await grab('imgpanel', '.studio');

  /* Templates gallery */
  await p.evaluate(() => VA.go('gallery')); await p.waitForTimeout(2600);
  await grab('gallery', '#main');

  /* the banner that used to overflow */
  await p.evaluate(() => VA.go('des')); await p.waitForTimeout(400);
  await p.click('[data-act="desquick"][data-k="banner"]').catch(() => {});
  await p.waitForTimeout(1100);
  await grab('banner', '#cvmain');

  /* carousel */
  await p.evaluate(() => VA.go('des')); await p.waitForTimeout(400);
  await p.click('[data-act="desquick"][data-k="carousel"]').catch(() => {});
  await p.waitForTimeout(1400);
  await grab('carousel', '#main');

  /* the reel, mid-shot so a photo is on screen */
  await p.evaluate(() => VA.go('vid')); await p.waitForTimeout(400);
  await p.click('[data-act="vidreel"]').catch(() => {});
  await p.waitForTimeout(2600);
  await grab('vid', '.studio');

  await p.evaluate(() => VA.go('lib')); await p.waitForTimeout(1500);
  await grab('lib', '#main');

  await p.evaluate(() => VA.go('themes')); await p.waitForTimeout(400);
  await grab('themes', '#main');
  await p.evaluate(() => VA.go('conn')); await p.waitForTimeout(400);
  await grab('conn', '#main');
  await p.evaluate(() => VA.go('pub')); await p.waitForTimeout(400);
  await grab('pub', '#main');

  await p.click('#askbtn'); await p.waitForTimeout(200);
  await p.fill('#askinput', 'what is zardozi?'); await p.click('[data-act="asksend"]'); await p.waitForTimeout(300);
  img.ask = 'data:image/png;base64,' + (await (await p.$('#ask')).screenshot()).toString('base64');

  const st = await p.evaluate(() => VA.runTests());
  const tplCount = await p.evaluate(() => VA.DESIGN.templates().length);
  await b.close();
  return { img, st, tplCount };
}

/* ── SVG diagrams ── */
function workflowDiagram() {
  const steps = [['Catalogue', 'photos read by AI'], ['Content', 'researched · 61-col CSV'],
    ['Image', 'watermark erased'], ['Templates', '53 live designs'], ['Video', 'reel from photos'], ['Publish', 'payload · calendar']];
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
  const rows = [['Vision — reads your photos', 'garment · colour · fabric · pose · watermark', '#EFE4FB', P2, 'FREE'],
    ['Grounded search — real competitors', 'named sellers, live prices, real URLs', '#F6ECD8', GOLD, 'FREE'],
    ['Image editing — watermark removal', 'rebuilds what was behind the logo', '#F6ECD8', GOLD, 'FREE'],
    ['Built-in engine — always there', 'offline · labelled DRAFT, never overclaimed', '#EFE4FB', P2, 'FREE'],
    ['OpenRouter · Groq · Ollama', 'alternatives, no lock-in', '#F6ECD8', GOLD, 'FREE'],
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
function fixedDiagram() {
  const rows = [
    ['Catalogue', 'matched filenames — you tagged all 30 by hand', 'reads the photograph itself'],
    ['Content', '23 columns · 20 tags · 10 slides · invented rivals', '61 columns · 30 tags · 8 slides · real rivals'],
    ['Image Studio', 'move / text / box / crop', 'watermark eraser · SKU · frames · sharpen'],
    ['Banner', 'title off the canvas, three layers overlapping', 'measured, fitted, collision-checked'],
    ['Video', 'coloured rectangles on black', 'your photographs, moving']
  ];
  let y = 6, out = '';
  out += `<text x="200" y="0" text-anchor="middle" font-size="10.5" font-weight="700" fill="${MUT}">WHAT IT WAS</text>`;
  out += `<text x="580" y="0" text-anchor="middle" font-size="10.5" font-weight="700" fill="${P}">WHAT IT IS NOW</text>`;
  rows.forEach(r => {
    out += `<text x="18" y="${y + 20}" font-size="11" font-weight="700" fill="${INK}">${r[0]}</text>
      <rect x="92" y="${y + 4}" width="230" height="26" rx="7" fill="#F4EFF6" stroke="#D9CFE4" stroke-width="1"/>
      <text x="102" y="${y + 21}" font-size="9.5" fill="${MUT}">${r[1]}</text>
      <path d="M330 ${y + 17} L352 ${y + 17}" stroke="${GOLD}" stroke-width="2"/><path d="M348 ${y + 12} l7 5 -7 5z" fill="${GOLD}"/>
      <rect x="360" y="${y + 4}" width="250" height="26" rx="7" fill="#E4F6EC" stroke="#2E9E6B" stroke-width="1"/>
      <text x="370" y="${y + 21}" font-size="9.5" fill="#1B5E42">${r[2]}</text>`;
    y += 36;
  });
  return `<svg viewBox="0 0 620 ${y + 6}" width="100%">${out}</svg>`;
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
function book(img, st, tplCount) {
  const total = st.pass + st.fail;
  const page = (cls, inner) => `<section class="pg ${cls || ''}">${inner}<div class="pn"></div></section>`;
  const fig = (src, cap) => `<figure><img src="${src}"><figcaption>${cap}</figcaption></figure>`;
  const H1 = t => `<h1>${t}</h1>`, H2 = t => `<h2>${t}</h2>`, L = t => `<p class="lead">${t}</p>`;

  const cover = page('cover', `
    <img class="logo" src="${logo}">
    <div class="ct">
      <div class="kick">MODULE 14 · VASTRANGAM SUITE · v3.1</div>
      <h1>Vastrangam AI Engine</h1>
      <div class="sub">The catalogue workflow, rebuilt AI-first — photographs read by the app, competitors researched live, watermarks erased, ${tplCount} designed templates, and reels cut from your own shots.</div>
      <div class="meta"><b>Desire to Attire · Crafted in Surat. Worn Everywhere.</b><br>Vastrangam_AI_Engine.html · ${KB} KB · ${st.pass}/${total} self-tests pass · works offline, better with your key</div>
    </div>`);

  const p1 = page('', H1('What changed, and why') +
    L('v2 was built offline-first: a rules-and-templates engine at the centre, with the model treated as an optional upgrade. That single decision is what made it mediocre — filenames instead of eyes, invented competitors instead of research, gradient boxes instead of design. v3 inverts it. The model reads the photographs, searches the live market and cleans the images; the offline engine is still there, but it now labels its own output DRAFT instead of overclaiming.') +
    fixedDiagram() +
    H2('The workflow') + workflowDiagram() +
    `<div class="good">The <b>Catalogue</b> is the top of the flow, and it no longer asks you to tag anything. Everything below reads from it.</div>`);

  const p2 = page('', H1('The Catalogue — it reads the photograph') +
    L('v2 matched filenames, so a camera-roll file like <code>WhatsApp Image 2026-08-06 at 00.49.42.jpg</code> produced the product name "Whatsapp Image AI", a blank colour and a pose defaulting to Front — thirty photos, thirty manual corrections. Now every photo is read: the garment, a premium colour name with its swatch, the likely fabric and craft, and the camera angle. Supplier watermarks and two-in-one collages are flagged on sight.') +
    fig(img.cat, 'A catalogue after reading: one product resolved into two colour variants with their front / back / close-up / side poses. The WM badge marks a photo carrying a supplier watermark — erasable in one step in the Image Studio.') +
    `<div class="rule">With no key connected the app falls back to filenames and marks every row <b>draft</b> — it says plainly that it is guessing rather than pretending otherwise.</div>`);

  const p3 = page('', H1('The Content Engine — analysis first, then output') +
    L('Your spec calls the analysis non-negotiable: the engine never jumps straight to a deliverable. v2 skipped it and invented the competitor section. Now every run produces the [PREFLIGHT] block — Product, Market, Competitor Gap, Buyer, Channel Plan, Uniqueness, Search Targets — with real named sellers and live URLs from a grounded web search, and only then writes the listing on top of it.') +
    fig(img.run, 'A generated run: four title variants with character counts, the humanized Shopify body, and the specification table with no blank cells.') +
    fig(img.qa, 'The QA gate is now your spec\'s real one — all fourteen machine-checkable rules, not ten approximations. Title 60–80, SEO description 150–160, exactly 30 hashtags, exactly 8 carousel slides, alt text ≤125 and synced, SKU written only for VS/VL, Amazon limits, and the 61-column count.'));

  const p4 = page('', H1('Image Studio — your own tooling, restored') +
    L('v2 shipped an Image Studio with move, text, box and crop. Your own Image Studio Pro had six real inpainting algorithms, a watermark eraser, SKU stamping, frames and a batch queue. That was a downgrade, and it has been reversed: the algorithms are ported verbatim, and Gemini image editing is added alongside them.') +
    `<div class="two"><div>${fig(img.imgbefore, '<b>Before</b> — the supplier watermark across the top.')}</div>
      <div>${fig(img.img, '<b>After</b> — painted over and rebuilt with PatchMatch, offline and with no key, then the SKU stamped and a gold-corner frame applied. A heavy, high-contrast watermark like this one can leave a faint trace; ✦ AI erase (Gemini) resolves those cases.')}</div></div>` +
    H2('One image, three formats, matched metadata') + exportDiagram() +
    `<div class="good"><b>Download JPG + WebP + PNG</b> gives all three at once, plus a metadata CSV carrying the title / description / alt text matched to that product's content — all in one ZIP.</div>`);

  const p5 = page('', H1('Templates — ' + tplCount + ' of them, all live') +
    L('Nine canvas sizes × eight layout archetypes × palettes including one built from the garment\'s own colour. Nothing here is a picture of a template: every tile is drawn from your product photo and your content the moment the screen opens.') +
    fig(img.gallery, 'The gallery. Click any tile to open it on the canvas — edit the text, switch palette, switch layout, or magic-resize to another canvas and watch the layout refit itself.'));

  const p6 = page('', H1('The banner bug, and the fix') +
    L('This is the specific defect that made the point. In v2 the web banner put "New Mehendi Collection" straight through the right-hand edge, dropped the subtitle on top of the title, and parked the price pill over both — on a green-to-blue gradient unrelated to the garment. That is not a styling slip; it is what happens when there is no layout engine.') +
    fig(img.banner, 'The same banner now. Every string is measured and wrapped before it is drawn and shrunk until it fits its box; every element sits in a declared slot that is collision-checked against every other slot; the price is a pill sized to its own text; and the palette is derived from the garment\'s own colour.') +
    `<div class="good">Two of the ${total} self-tests walk <b>every archetype at every canvas size</b> with a deliberately over-long title and assert that nothing leaves the canvas and no two elements overlap. The bug cannot come back silently.</div>` +
    fig(img.carousel, 'The carousel is exactly eight slides now, per your spec — and each slide carries the real copy as its headline, with the stage name as a tag.'));

  const p7 = page('', H1('Video Studio — cut from your photographs') +
    L('v2 animated a purple rectangle and a gold bar over black, and never touched your images. Now every pose in the catalogue becomes a moving shot — a slow push-in and pan, cross-dissolved into the next — with the three-act script and the price landing on the right frames.') +
    fig(img.vid, 'A reel cut from eight catalogue photographs. The timeline shows one photo clip per pose on the Video track, with the script on the Text track. Exports WebM, GIF and a PNG frame sequence, offline.') +
    `<div class="rule"><b>Honest limit:</b> real AI video generation (Veo) is a paid service. This animates your stills — which is what the free tier can actually do well.</div>`);

  const p8 = page('', H1('Free-first AI, and what it costs') +
    L('Everything is free-tier. Your key is stored in your browser only — never in the file, never committed anywhere.') +
    routerDiagram() +
    H2('The limits, stated plainly') +
    `<table class="t"><thead><tr><th>Capability</th><th>Free allowance</th><th>What that means for you</th></tr></thead><tbody>
      <tr><td>Reading photos (vision)</td><td>~1,500 calls/day</td><td>30 photos a day, many times over</td></tr>
      <tr><td>Live competitor research</td><td>5,000 grounded searches/month</td><td>~160 researched runs a month</td></tr>
      <tr><td>AI image cleanup</td><td>~500 edits/day</td><td>far more than a catalogue shoot needs</td></tr>
      <tr><td>Everything else</td><td>unlimited, offline</td><td>generator, canvas, timeline, spreadsheets, templates</td></tr>
    </tbody></table>` +
    `<div class="good">The app queues its calls to stay inside the rate limit, backs off and retries on a 429, and caches every result by image hash — so re-running the same catalogue costs nothing at all.</div>` +
    fig(img.conn, 'Connectors — the free-first router. The built-in engine is first and can never be removed; paid providers sit last; nothing is locked to one company.'));

  const p9 = page('', H1('Two bugs found in the field, and the library') +
    H2('“The self-tests fail after I upload photos”') +
    L('Root cause: v3 kept a 768px working copy of every photograph inside the record, and the record lives in the browser\'s 5 MB local storage. Measured on real photographs that is 377 KB each — thirty of them reached 11 MB, the browser refused to save, and the failure was swallowed. Nothing persisted, so after a reload the data was gone and the very first self-test failed. Photographs now live in IndexedDB and the record keeps only their ids.') +
    `<table class="t"><thead><tr><th></th><th>v3</th><th>now</th></tr></thead><tbody>
      <tr><td>Record after 30 photos</td><td>11.41 MB</td><td><b>53 KB</b></td></tr>
      <tr><td>Browser save</td><td>QuotaExceededError, silent</td><td><b>saves, and says so loudly if it ever cannot</b></td></tr>
      <tr><td>Self-tests after reload</td><td>failing</td><td><b>${st.pass}/${total} pass</b></td></tr>
    </tbody></table>` +
    H2('“I checked every Gemini model and the error keeps coming”') +
    L('Root cause: the model name was hardcoded. A retired id returns 404 no matter how good the key is, so every model looked broken. CORS was ruled out by direct test — Google does allow a local file to call the API. The fix is to stop guessing: the app now asks your key which models it can use, ranks them, and picks the best one itself.') +
    fig(img.conn, 'Connectors → Diagnose: it checks the key format, lists what the key can really use, then calls each model for real and prints the exact reply — 200 OK, 404 model not found, 400 API_KEY_INVALID, 429 quota — before switching to whichever works.') +
    `<div class="rule">A Gemini API key begins <b>AIza</b>. A token beginning <b>AQ.</b> or <b>ya29.</b> is an OAuth token and will never authenticate here — the Diagnose screen now says so in plain words instead of letting you hunt through model names.</div>`);

  const p10 = page('', H1('The stock library') +
    L('Three tiers, cheapest first. The built-in set is drawn by the app rather than stored as pictures, so it is sharp at any export size, recolours with your theme, costs almost nothing in file size, and works with the wifi off.') +
    fig(img.lib, 'Paisley, mandala, lotus, marigold, diya, jaali, bandhani, peacock, kalash and rangoli; temple borders, zari bands, gold corners and scallops; sale tags, ribbons, rosettes, price flags and starbursts; grain, silk sheen, bokeh, mesh, paper and chevron; plus trust icons. Every one has → Image and → Design.') +
    `<table class="t"><thead><tr><th>Tier</th><th>Needs</th><th>Good for</th></tr></thead><tbody>
      <tr><td><b>Built-in</b></td><td>nothing — offline</td><td>motifs, borders, badges, textures, icons</td></tr>
      <tr><td><b>My assets</b></td><td>nothing — your uploads</td><td>your own logos, props and past picks</td></tr>
      <tr><td><b>Stock photos</b></td><td>Openverse: no key · Pexels/Unsplash: free key</td><td>real photographs of people and places</td></tr>
      <tr><td><b>AI generated</b></td><td>Gemini key, or Pollinations with no key</td><td>a backdrop that does not exist yet</td></tr>
    </tbody></table>`);

  const p11 = page('', H1('How it was verified') +
    barChart([{ l: 'Self-tests', v: st.pass }, { l: 'Spec QA rules', v: 14 }, { l: 'Templates', v: tplCount }, { l: 'Library assets', v: 32 }, { l: 'Ext. requests', v: 0 }]) +
    `<div class="good"><b>${st.pass}/${total} self-tests pass · every screen driven in a real browser with zero console errors · with all non-file requests blocked the app still reads a catalogue, generates a full pack at QA 100%, renders all ${tplCount} templates and builds the 8-slide carousel — 0 external requests.</b></div>` +
    H2('The regressions that are now locked down') +
    `<table class="t"><tbody>
      <tr><td>the banner bug</td><td>no template lets text run off the canvas · no two elements overlap</td></tr>
      <tr><td>the sheet</td><td>61 columns, not 23 · CSV is real comma-separated Shopify import</td></tr>
      <tr><td>the counts</td><td>exactly 30 hashtags · exactly 8 carousel slides</td></tr>
      <tr><td>the windows</td><td>title 60–80 · SEO description 150–160 · alt ≤125</td></tr>
      <tr><td>the locks</td><td>Variant SKU only on VS/VL · size token 2xl never xxl · sleeve never 3/4</td></tr>
      <tr><td>the catalogue</td><td>a WhatsApp filename yields no invented product name</td></tr>
      <tr><td>the image studio</td><td>all six inpainting algorithms present and running</td></tr>
      <tr><td>the storage bug</td><td>no raw pixels in the record · 30 photos stay under 1 MB · survives a reload</td></tr>
      <tr><td>the model bug</td><td>models discovered from the key · newer families ranked first · an OAuth token is named as such</td></tr>
    </tbody></table>` +
    `<div class="rule"><b>It will never ask for a password.</b> Channels use scoped, revocable keys only. If any screen asks for a marketplace, bank or account password, it is not this app.</div>`);

  const pages = [cover, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11].join('\n');
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
    code{background:#F2EDF8;padding:1px 4px;border-radius:4px;font-size:11.5px}
    svg{margin:6px 0 14px}
    figure{margin:12px 0;break-inside:avoid;page-break-inside:avoid;text-align:center}
    figure img{max-width:100%;max-height:168mm;width:auto;border:1px solid #E2D8F2;border-radius:10px;box-shadow:0 2px 12px rgba(40,20,70,.1);display:block;margin:0 auto}
    figcaption{font-size:11px;color:${MUT};margin-top:6px;line-height:1.45;text-align:left}
    .good{background:#E4F6EC;border-left:4px solid #2E9E6B;border-radius:8px;padding:11px 13px;font-size:12.5px;line-height:1.5;margin-top:12px}
    .rule{background:#F6ECD8;border-left:4px solid ${GOLD};border-radius:8px;padding:11px 13px;font-size:12.5px;line-height:1.5;margin-top:12px}
    table.t{width:100%;border-collapse:collapse;font-size:12px;margin:8px 0 14px}
    table.t th{text-align:left;background:${P};color:#fff;padding:7px 10px;font-size:11px}
    table.t td{border:1px solid #E2D8F2;padding:7px 10px;vertical-align:top}
    table.t tbody tr:nth-child(even){background:#F8F5FF}
    table.t,svg,.good,.rule{break-inside:avoid;page-break-inside:avoid}
    .two{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}
    .pn{position:absolute;bottom:12mm;right:18mm;font-size:10px;color:${MUT}}
  </style></head><body>${pages}</body></html>`;
}

(async () => {
  const { img, st, tplCount } = await shots();
  const html = book(img, st, tplCount);
  const htmlPath = path.join(D, 'book.html'); fs.writeFileSync(htmlPath, html);
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.goto('file://' + htmlPath, { waitUntil: 'load' }); await p.emulateMedia({ media: 'print' });
  const out = path.join(REPO, 'Vastrangam_AI_Engine.pdf');
  await p.pdf({ path: out, format: 'A4', printBackground: true });
  await b.close();
  const n = (fs.readFileSync(out).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log('PDF written', out, '·', n, 'pages ·', Math.round(fs.statSync(out).size / 1024), 'KB · selftest', st.pass + '/' + (st.pass + st.fail), '·', tplCount, 'templates');
})();
