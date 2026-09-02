'use strict';
// Builds every app in apps/ into out/<NN>_<Name>/{app.html, guide.md}.
// Also verifies each app's DOM-free engine (seed + self-tests) in Node.
const fs = require('fs'), path = require('path'), vm = require('vm');
const DIR = __dirname, APPS = path.join(DIR, 'apps'), OUT = path.join(DIR, 'out');
const css = fs.readFileSync(path.join(DIR, 'design.css'), 'utf8');
const kernel = fs.readFileSync(path.join(DIR, 'kernel.js'), 'utf8');
const template = fs.readFileSync(path.join(DIR, 'template.html'), 'utf8');

function loadSpec(file) {
  // run the app file in a sandbox where Medhava.app captures the spec (no DOM needed)
  const code = fs.readFileSync(file, 'utf8');
  let captured = null;
  const r2 = n => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  const sandbox = { window: undefined, document: undefined, module: { exports: {} },
    Medhava: { app: s => { captured = s; }, H: {}, DB: {}, money: n => String(n), inr: n => String(n),
      num: n => (n == null || n === '' || isNaN(n) ? 0 : Number(n)), r2, esc: s => String(s), toast: () => {}, save: () => {}, go: () => {} },
    console };
  sandbox.global = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: file });
  return captured || sandbox.module.exports;
}
function verify(spec) {
  const DB = {}; spec.seed(DB);
  const log = []; let pass = 0, fail = 0;
  const t = (name, cond) => { const ok = !!cond; log.push({ name, ok }); ok ? pass++ : fail++; };
  try { if (spec.tests) spec.tests(t, DB); } catch (e) { log.push({ name: 'threw: ' + e.message, ok: false }); fail++; }
  return { pass, fail, log };
}
function guide(spec, res) {
  const nav = spec.nav.filter(n => n.v !== 'backup').map(n => `- **${n.label}**`).join('\n');
  return `# Medhava · ${spec.name}\n\n> ${spec.tagline || ''}\n\n**Real, running software** — open \`app.html\` by double-clicking (any modern browser, works offline). ` +
    `Your data is saved in the browser (localStorage) and survives refreshes.\n\n## Screens\n${nav}\n\n` +
    `## What works\n${(spec.about || 'A working, seeded demo of this module in the Medhava suite — interactive screens, real calculations, and a self-test suite.')}\n\n` +
    `- Seeded with realistic demo data on first open.\n- **${res.pass}/${res.pass + res.fail} self-tests pass** (see Backup & Health).\n` +
    `- Export/import a JSON backup; reload demo data; wipe — all under **Backup & Health**.\n- Same teal SmartHub design system and engine kernel as every app in the suite.\n\n` +
    `## Honest limits (v1)\n- Local-first, single browser. The hosted, multi-tenant version syncs the same engines to the Medhava backend (see the platform bundle).\n` +
    `- This is a consistent working demo, not the full depth of the flagship OMS/Accounting apps.\n- Desktop-optimized; a mobile drawer nav is included.\n`;
}

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);
const files = fs.readdirSync(APPS).filter(f => f.endsWith('.js')).sort();
let totalFail = 0; const index = [];
for (const f of files) {
  const spec = loadSpec(path.join(APPS, f));
  const res = verify(spec);
  const nn = f.slice(0, 2);
  const folder = nn + '_' + (spec.name.replace(/[^A-Za-z0-9]+/g, ''));
  const dir = path.join(OUT, folder); if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  const appCode = fs.readFileSync(path.join(APPS, f), 'utf8');
  const html = template.replace('__TITLE__', 'Medhava · ' + spec.name)
    .replace('/*CSS*/', css).replace('/*KERNEL*/', kernel).replace('/*APP*/', appCode);
  fs.writeFileSync(path.join(dir, 'app.html'), html);
  fs.writeFileSync(path.join(dir, 'guide.md'), guide(spec, res));
  totalFail += res.fail;
  index.push({ folder, name: spec.name, tests: `${res.pass}/${res.pass + res.fail}`, fail: res.fail, kb: Math.round(html.length / 1024) });
  console.log(`${res.fail === 0 ? 'OK ' : 'XX '} ${spec.name.padEnd(22)} tests ${res.pass}/${res.pass + res.fail}  ${Math.round(html.length / 1024)}KB`);
}
console.log(`\n${files.length} apps built · ${totalFail} test failures`);
module.exports = { index };
