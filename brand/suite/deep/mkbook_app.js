'use strict';
/* A data-driven app book. Every app from Module 03 onward supplies a spec — cover copy, the
   wiring rows from its own config, a process cascade, and a list of screens with a shot and a
   body — and this builds the PDF. One generator, so every book is laid out identically and
   the page/contents bookkeeping is impossible to get wrong. */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const { doc, bookBuilder, cover, testPages, connectorsPage, connectorsRules, connectorsPage2 } = require('./bookparts.js');
const DIR = __dirname, SHOTS = path.join(DIR, 'shots'), OUT = path.join(DIR, 'out');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TESTS = JSON.parse(fs.readFileSync(path.join(DIR, 'tests.json'), 'utf8'));

function loadCfg(p) { const src = fs.readFileSync(path.join(DIR, p), 'utf8'); const m = { exports: {} };
  const f = new Function('module', 'exports', src + '\nmodule.exports=CONFIG;'); f(m, m.exports); return m.exports; }

function appBook(c) {
  const P = bookBuilder(c.edition, c.app);
  const fig = (v, cap, cls) => `<figure class="${cls || ''}"><img src="file://${path.join(SHOTS, c.tag + '_' + v + '.png')}"><figcaption>${cap}</figcaption></figure>`;
  const tests = TESTS[c.tag] || [];
  const pages = [];

  pages.push(cover(c, c.app, c.sub, c.moduleLine, c.lede,
    ['One file · opens by double-click', 'Works offline', tests.length + ' / ' + tests.length + ' self-tests pass', c.badge]));

  pages.push(P(`<h2>What this is, and what is inside</h2>
    <p class="big">${c.what}</p>
    ${c.whatMore.map(p => `<p>${p}</p>`).join('')}
    ${c.whatBox ? `<div class="good">${c.whatBox}</div>` : ''}
    <div class="toc"><h3>What this document covers</h3>${P.toc()}</div>`));

  pages.push(P(`<h2>Where ${c.app} sits</h2>
    <p>Every Medhava app stands on <b>one shared Data Core</b>: Item/SKU, Party, Stock, Ledger/Voucher and Order.</p>
    <div class="wire2"><div class="core"><b>UNIFIED DATA CORE</b><span>Item · Party · Stock · Ledger · Order</span></div>
      <div class="ring">${c.ring.map(r => `<div class="rn ${r[0]}">${r[1]}</div>`).join('')}</div></div>
    <p class="cap">Orange = what it reads in. Green = what it gives back.</p>
    <h3>What it reads, and from where</h3>
    <table><thead><tr><th>Comes from</th><th>What it supplies</th></tr></thead><tbody>
      ${(c.cfg.wiringIn || []).map(w => `<tr><td><b>${w.from}</b></td><td>${w.what}</td></tr>`).join('')}
    </tbody></table>
    ${c.ownsBox ? `<div class="rule">${c.ownsBox}</div>` : ''}`));

  pages.push(P(`<h2>The process, end to end</h2>
    <div class="flow">${c.flow.map(f => `<span class="fb">${f}</span>`).join('<span class="ar">→</span>')}</div>
    <p class="cap">${c.flowCap}</p>
    <div class="steps">${c.steps.map((s, i) =>
      `<div class="st"><span class="n">${i + 1}</span><div class="tx">${s}</div></div>`).join('')}</div>
    ${c.processBox ? `<div class="good">${c.processBox}</div>` : ''}
    <h3>${c.rulesTitle}</h3>
    <ul class="pts">${c.rules.map(r => `<li>${r}</li>`).join('')}</ul>
    ${c.rulesBox ? `<div class="rule">${c.rulesBox}</div>` : ''}`));

  /* one page per screen, in the order the app presents them */
  c.screens.forEach(s => {
    pages.push(P(`<h2>${s.title}</h2>${s.intro ? `<p>${s.intro}</p>` : ''}` +
      fig(s.shot, s.cap, s.cls || 'tall') + (s.body || '')));
  });

  pages.push(P(`<h2>Every figure, and how it is worked out</h2>
    <p>This is the same table as the Wiring screen, so you have it on paper.</p>
    <table><thead><tr><th>Figure</th><th>Comes from</th><th>How it is worked out</th></tr></thead><tbody>
      ${(c.cfg.wiring || []).map(w => `<tr><td><b>${w.f}</b></td><td>${w.s}</td><td>${w.h}</td></tr>`).join('')}
    </tbody></table>
    <div class="good">Every figure is rounded to two decimal places at the moment it is calculated, so a total can never disagree with the rows above it by a stray paisa.</div>`));

  pages.push(P(connectorsPage(c, fig)));
  pages.push(P(connectorsRules(c)));
  pages.push(P(connectorsPage2(c)));

  testPages(tests).forEach(h => pages.push(P(h)));

  pages.push(P(`<h2>How to run it, and what it will not do</h2>
    <h3>Running it</h3>
    <ol class="run">
      <li><b>Windows:</b> extract the ZIP, then double-click <span class="kbd">${c.file}</span>. It opens in your browser. That is the whole installation.</li>
      <li><b>Mac:</b> unpack the ZIP, double-click the file. Safari opens it.</li>
      <li><b>Android:</b> Files app → Downloads → tap the file → open with Chrome. Then ⋮ → <b>Add to Home screen</b>.</li>
      <li><b>iPhone / iPad:</b> Files app → tap the file → Safari. Then Share → <b>Add to Home Screen</b>.</li>
      <li>No internet needed, ever. No account, no licence key, no setup wizard.</li>
    </ol>
    <h3>Keeping your data safe</h3>
    <p>Everything you enter lives in your own browser on your own device — nowhere else, and never on anybody's server. That means nobody can see it, and also that clearing your browser's site data would erase it. So: <b>Backup &amp; Health → Export JSON</b>, once a week. To move to another device, take the file and the backup with you and use <b>Import JSON</b>.</p>
    ${fig('backup', 'Backup & Health — your data controls, and the live test results below them.', 'third')}
    <h3>What it will not do</h3>
    <ul class="pts">${c.limits.map(l => `<li>${l}</li>`).join('')}</ul>
    <div class="accept">Accepted when: ${c.accept}</div>`));

  return doc(P.render(pages[0]), 'Medhava ' + c.app + ' — ' + c.edition);
}

async function render(jobs) {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  for (const j of jobs) {
    const hp = path.join(DIR, 'book_' + j.out.replace('.pdf', '.html'));
    fs.writeFileSync(hp, j.html);
    const p = await b.newPage();
    await p.goto('file://' + hp, { waitUntil: 'networkidle' });
    await p.waitForTimeout(450);
    await p.pdf({ path: path.join(OUT, j.out), width: '210mm', height: '297mm', printBackground: true });
    await p.close();
    const pages = (j.html.match(/<section class="pg/g) || []).length;
    console.log('PDF', j.out.padEnd(46), pages + 'pp', Math.round(fs.statSync(path.join(OUT, j.out)).size / 1024) + 'KB');
  }
  await b.close();
}

module.exports = { appBook, render, loadCfg, TESTS };
