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
function testTable(list) {
  return `<table class="tt"><thead><tr><th>Result</th><th>What was checked</th></tr></thead><tbody>${
    list.map(t => `<tr><td class="pass">${t.ok ? '✓ pass' : '✗ FAIL'}</td><td>${t.name.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td></tr>`).join('')}</tbody></table>`;
}

module.exports = { CSS, EXTRA, mark, doc, mkPager, cover, testTable };
