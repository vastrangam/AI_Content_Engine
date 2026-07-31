'use strict';
/* The canonical module order — read straight from the website's module data, so a roadmap
   table in any PDF or START_HERE can never drift from what the site publishes.
   16 numbered modules + the Platform layer = 41 apps. */
const path = require('path');
const MODULES = require(path.join(__dirname, '..', '..', 'site', 'modules.js'));

const NUMBERED = MODULES.filter(m => m.n !== '17');          // 01–16
const PLATFORM = MODULES.filter(m => m.n === '17')[0];       // the spine, not a numbered module

/* status: { '01':'Delivered', '02':'Delivered — this ZIP', '03':'Next' } */
function rows(status) {
  const out = NUMBERED.map(m => ({
    n: m.n,
    name: m.name,
    apps: m.apps.map(a => a[0]).join(' · '),
    count: m.apps.length,
    status: status[m.n] || '',
  }));
  out.push({ n: '—', name: 'Platform', apps: PLATFORM.apps.map(a => a[0]).join(' · '),
             count: PLATFORM.apps.length, status: 'The spine every module runs on' });
  return out;
}

/* Compact HTML table for the PDF books. `highlight` gets bolded. */
function htmlTable(status, highlight) {
  const r = rows(status);
  const body = r.map(x => {
    const on = x.n === highlight;
    const w = s => on ? `<b>${s}</b>` : s;
    return `<tr><td>${w(x.n)}</td><td>${w(x.name + ' — ' + x.apps)}</td><td>${x.status ? w(x.status) : ''}</td></tr>`;
  }).join('');
  return `<table><thead><tr><th>#</th><th>Module &amp; apps</th><th>Status</th></tr></thead><tbody>${body}</tbody></table>`;
}

/* Markdown table for READ_ME_FIRST / START_HERE. */
function mdTable(status, highlight) {
  const r = rows(status);
  const lines = r.map(x => {
    const on = x.n === highlight;
    const w = s => (on && s ? `**${s}**` : s);
    return `| ${w(x.n)} | ${w(x.name + ' — ' + x.apps)} | ${w(x.status)} |`;
  });
  return ['| # | Module & apps | Status |', '|---|---|---|'].concat(lines).join('\n');
}

function totals() {
  return { modules: NUMBERED.length, apps: MODULES.reduce((s, m) => s + m.apps.length, 0) };
}

module.exports = { rows, htmlTable, mdTable, totals, NUMBERED, PLATFORM };
