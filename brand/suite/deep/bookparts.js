'use strict';
/* Shared page furniture for every module's PDF books — the extra CSS, the logo mark,
   the document wrapper, the page numberer, the cover, and the self-test table. */
const CSS = require('./bookcss.js');

const EXTRA = `
.pg2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px}
.cardbox{border:1px solid #dcebe5;border-radius:10px;padding:12px 14px;background:#f7fbfa}
.cardbox b{color:#0b6a58;font-size:12.5px;display:block;margin-bottom:4px}
.cardbox span{font-size:11.5px;line-height:1.55;color:#31473f;display:block}
.steps{margin-top:12px}
.st{display:flex;gap:12px;align-items:flex-start;padding:9px 0;border-bottom:1px dashed #dcebe5}
.st:last-child{border-bottom:none}
.st .n{flex:0 0 26px;height:26px;border-radius:8px;background:#0fae90;color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center}
.st .tx{font-size:12px;line-height:1.55;color:#31473f}
.st .tx b{color:#0b3b31}
.rule{background:#fff8ee;border:1px solid #f2ddc0;border-radius:9px;padding:10px 13px;margin:7px 0;font-size:11.5px;color:#7a4f16}
.rule b{color:#8a4b0c}
.good{background:#e7f5f0;border:1px solid #bfe6d9;border-radius:9px;padding:10px 13px;margin:7px 0;font-size:11.5px;color:#0b6a58}
.two-col{column-count:2;column-gap:16px}
.two-col li{break-inside:avoid}
figure.tall img{max-height:196mm;width:auto;max-width:100%;display:block;margin:0 auto}
figure.half img{max-width:72%;display:block;margin:0 auto}
figure.third img{max-width:46%;display:block;margin:0 auto}
.vs th:first-child{width:22%}
.kbd{background:#0f2a25;color:#d7f2e9;border-radius:5px;padding:1px 6px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10.5px}
/* the app's status pills, so a tag printed in the book looks like the tag on screen */
.tag{display:inline-block;font-size:9.5px;font-weight:700;padding:3px 9px;border-radius:20px;letter-spacing:.02em;white-space:nowrap}
.t-grn{background:#e7f5f0;color:#0b6a58;border:1px solid #bfe6d9}
.t-blu{background:#e9eefc;color:#1e40af;border:1px solid #cbd7fa}
.t-amb{background:#fff3e6;color:#9a5a22;border:1px solid #f2d8bd}
.t-red{background:#fdeaea;color:#a01a1a;border:1px solid #f5c9c9}
.t-gray{background:#eef2f1;color:#5b6f69;border:1px solid #dbe5e2}
/* stage ladder — used by pipeline-style modules */
.ladder{display:flex;gap:0;align-items:flex-end;margin:16px 0 4px;justify-content:center}
.rung{flex:1;max-width:120px;text-align:center}
.rung .bx{background:#0fae90;color:#fff;border-radius:9px 9px 0 0;font-weight:700;font-size:11.5px;padding:8px 6px}
.rung .od{background:#e7f5f0;border:1px solid #bfe6d9;border-top:none;border-radius:0 0 9px 9px;font-size:15px;font-weight:800;color:#0b6a58;padding:7px 6px}
.rung .cp{font-size:9.5px;color:#7d938c;margin-top:5px;line-height:1.35}
.rung:nth-child(1) .bx{background:#8fd3c4}
.rung:nth-child(2) .bx{background:#5cc4ac}
.rung:nth-child(3) .bx{background:#25b294}
.rung:nth-child(4) .bx{background:#0b8f76}
`;

const mark = `<span class="mk"><svg width="26" height="26" viewBox="0 0 40 40"><path d="M9 31V15l11 11 11-11v16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 5c.25 3.1.8 3.8 3.9 4.05-3.1.25-3.65.95-3.9 4.05-.25-3.1-.8-3.8-3.9-4.05C19.2 8.8 19.75 8.1 20 5z" fill="#fff"/></svg></span>`;

function doc(pagesHtml, title) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${CSS}${EXTRA}</style></head><body>${pagesHtml}</body></html>`;
}
function mkPager(edition, total, appName) {
  let n = 1; /* the cover is page 1 */
  return (inner) => { n++; return `<section class="pg"><div class="pgbody">${inner}</div><div class="foot"><span>Medhava · ${appName} — ${edition}</span><span>${n} / ${total}</span></div></section>`; };
}
function cover(c, h1, sub, moduleLine, lede, badges) {
  return `<section class="pg cover"><div class="cwrap">
    <div class="logo">${mark} Medhava</div>
    <div class="ed">${c.edition}</div>
    <h1>${h1}</h1>
    <div class="sub">${sub}</div>
    <div class="module">${moduleLine}</div>
    <p class="lede">${lede}</p>
    <div class="badges">${badges.map(b => `<span>${b}</span>`).join('')}</div>
    <div class="cfoot">${c.co} · FY 2026-27 · Medhava design system</div></div></section>`;
}
/* The Connectors page. Every app book gets the same one, so the no-lock-in promise
   is documented identically everywhere and cannot be forgotten in a module. */
function connectorsPage(c, fig) {
  return `<h2>Connectors — nothing is locked to one company</h2>
    <p class="big">This is the promise, and the app checks it on itself every time it opens:
    <b>no Medhava app depends on any single outside service.</b> Not one accounting package,
    not one marketplace, not one AI company, not one automation tool, not one courier.</p>
    ${fig('connect', '"Outside services required: 0" is not a marketing line — it is one of this app\'s self-tests.', 'tall')}`;
}
function connectorsRules(c) {
  return `<h2>The three rules the app enforces on itself</h2>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>No capability has only one choice.</b> Every one has at least three; most have eight to twelve.</div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>Every capability has a built-in or by-hand option</b> — so the app is fully usable with <b>nothing connected at all</b>. No account anywhere, no internet, no subscription. That is how it ships, and it is the default it starts on.</div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>Every capability has an option you can host yourself</b> — so you are never forced to send your business data to somebody else's cloud, whatever the fashion of the day is.</div></div>
    </div>
    <p>All three appear as ordinary self-tests on the <b>Backup &amp; Health</b> screen, in plain English, alongside the rest — so you can confirm them yourself in five seconds.</p>
    <div class="rule"><b>Switching a provider never changes a figure.</b> The arithmetic lives in Medhava, not in the service. Move from one courier to another and every past shipping record stays exactly as it was — only new labels come from somewhere else. There is a self-test for exactly this: <i>"switching a provider changes nothing else in your data"</i>.</div>
    <h3>What the four tags on the screen mean</h3>
    <table><thead><tr><th>Tag</th><th>What it means for you</th></tr></thead><tbody>
      <tr><td><span class="tag t-grn">built in</span></td><td>Ships inside Medhava. Needs nothing, costs nothing, works offline.</td></tr>
      <tr><td><span class="tag t-blu">you host it</span></td><td>You run it on your own machine or server. Your data never leaves your control.</td></tr>
      <tr><td><span class="tag t-amb">their cloud</span></td><td>Somebody else's service, connected with a scoped, revocable key.</td></tr>
      <tr><td><span class="tag t-gray">by hand</span></td><td>A person does it, or a CSV goes in and out. Always available.</td></tr>
    </tbody></table>
    <div class="good"><b>Why this rule exists at all.</b> Software that can only work with one outside company is not a tool you own — it is a bet on somebody else staying cheap, staying available and staying in business. Every capability here has a way out, including a way that needs nobody.</div>`;
}
function connectorsPage2(c) {
  return `<h2>What this app can be wired to</h2>
    <p>${c.app || 'This app'} uses <b>${c.capCount}</b> capabilities and offers <b>${c.altCount}</b> alternatives across them. Every one is a button on the Connectors screen — click it and you have switched.</p>
    <table><thead><tr><th>Capability</th><th>The options, in full</th></tr></thead><tbody>
      ${c.capRows.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td></tr>`).join('')}
    </tbody></table>
    <div class="rule"><b>Cloud services use a scoped, revocable key — never your password.</b> A key can be limited to only what it needs and cancelled in one click from the service's own side, without touching your login. <b>Medhava will never ask you for a marketplace, bank or account password.</b> If any screen ever does, it is not Medhava.</div>
    <h3>What if the tool you use is not on the list?</h3>
    <p>Then it becomes one more button. A provider is a small adapter — read from there, write to there — and the app around it does not change, because the arithmetic never lived in the provider. Adding one does not touch a single figure, a single screen or a single self-test.</p>
    <table><thead><tr><th>When a provider is added or swapped</th><th>What happens</th></tr></thead><tbody>
      <tr><td>Your existing records</td><td>Untouched. Nothing is migrated, because nothing was stored in the provider.</td></tr>
      <tr><td>Every figure on every screen</td><td>Identical — there is a self-test that proves this.</td></tr>
      <tr><td>Your saved work and settings</td><td>Untouched.</td></tr>
      <tr><td>The self-tests</td><td>Same list, same names, still passing.</td></tr>
      <tr><td>What you have to relearn</td><td>Nothing. The screens do not change.</td></tr>
    </tbody></table>
    <div class="good"><b>The practical version of the promise:</b> if a service you use doubles its price, changes its terms, or shuts down, you click a different button. You do not change software, you do not re-enter data, and you do not lose a day.</div>`;
}

/* Collects page bodies and numbers them at the end, so a book's page total is always
   whatever it actually is — there is no number to keep in step by hand. */
function bookBuilder(edition, appName) {
  const bodies = [];
  const P = function (inner) { bodies.push(inner); return ''; };
  /* The contents list is built from the pages that actually exist, at render time.
     There is no hand-kept list to fall out of step. */
  P.toc = function () { return '<!--MEDHAVA_TOC-->'; };
  P.render = function (coverHtml) {
    const total = bodies.length + 1;
    const toc = '<ol>' + bodies.map(function (b) {
      const m = /<h2>([\s\S]*?)<\/h2>/.exec(b);
      const t = m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
      return '<li>' + t + '</li>';
    }).join('') + '</ol>';
    let n = 1;
    return coverHtml + bodies.map(function (b) { n++;
      return `<section class="pg"><div class="pgbody">${b.replace('<!--MEDHAVA_TOC-->', toc)}</div><div class="foot"><span>Medhava · ${appName} — ${edition}</span><span>${n} / ${total}</span></div></section>`;
    }).join('');
  };
  return P;
}

/* A long test list is split across pages instead of overflowing one. */
function testPages(list, perPage) {
  perPage = perPage || 24;
  const nPages = Math.max(1, Math.ceil(list.length / perPage));
  const per = Math.ceil(list.length / nPages); /* balanced, so no page is nearly empty */
  const chunks = []; for (let i = 0; i < list.length; i += per) chunks.push(list.slice(i, i + per));
  return chunks.map(function (ch, i) {
    const head = chunks.length === 1
      ? `<h2>The ${list.length} self-tests, in full</h2>`
      : `<h2>The ${list.length} self-tests, in full <span style="font-size:14px;color:#7d938c">(${i + 1} of ${chunks.length})</span></h2>`;
    const intro = i === 0
      ? `<p>These run every time the app opens, <b>before</b> anything is shown. Menu → <b>Backup &amp; Health</b> to see them live. They are written in plain language on purpose — you should be able to read what was checked.</p>`
      : `<p>Continued. The last group are the <b>Connectors</b> checks — the ones that keep the no-lock-in promise honest.</p>`;
    const tail = i === chunks.length - 1
      ? `<div class="good"><b>If you ever see a red "fail", stop trusting the numbers on screen.</b> Take a backup, reload the file, and report which line failed. Software that tells you when it is broken is worth more than software that is quietly wrong.</div>`
      : '';
    return head + intro + testTable(ch) + tail;
  });
}

function testTable(list) {
  return `<table class="tt"><thead><tr><th>Result</th><th>What was checked</th></tr></thead><tbody>${
    list.map(t => `<tr><td class="pass">${t.ok ? '✓ pass' : '✗ FAIL'}</td><td>${t.name.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td></tr>`).join('')}</tbody></table>`;
}

module.exports = { CSS, EXTRA, mark, doc, mkPager, bookBuilder, cover, testTable, testPages, connectorsPage, connectorsRules, connectorsPage2 };
