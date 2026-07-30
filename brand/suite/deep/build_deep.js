'use strict';
// Builds a deep app (config + core) into out/<name>.html and verifies its engine (seed + self-tests) in Node.
const fs = require('fs'), path = require('path'), vm = require('vm');
const SUITE = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out');
const css = fs.readFileSync(path.join(SUITE, 'design.css'), 'utf8');
const kernel = fs.readFileSync(path.join(SUITE, 'kernel.js'), 'utf8');
const template = fs.readFileSync(path.join(SUITE, 'template.html'), 'utf8');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function buildOne(configFile, coreFile, outName, title) {
  const config = fs.readFileSync(configFile, 'utf8');
  const core = fs.readFileSync(coreFile, 'utf8');
  const appCode = '(function(){\n' + config + '\n' + core + '\n})();';
  // verify in a sandbox
  const r2 = n => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  const num = n => (n == null || n === '' || isNaN(n) ? 0 : Number(n));
  const V = { app: s => { V._spec = s; }, H: {}, DB: {}, r2, num,
    money: n => String(n), inr: n => String(n), esc: s => String(s), toast: () => {}, save: () => {}, go: () => {}, render: () => {} };
  const sandbox = { window: undefined, document: undefined, module: { exports: {} }, Medhava: V, console };
  sandbox.global = sandbox; vm.createContext(sandbox);
  vm.runInContext(appCode, sandbox, { filename: coreFile });
  const spec = V._spec || sandbox.module.exports;
  const DB = {}; spec.seed(DB);
  const log = []; let pass = 0, fail = 0;
  const t = (name, cond) => { const ok = !!cond; log.push({ name, ok }); ok ? pass++ : fail++; };
  try { spec.tests(t, DB); } catch (e) { log.push({ name: 'threw: ' + e.message, ok: false }); fail++; }
  const html = template.replace('__TITLE__', title).replace('/*CSS*/', css).replace('/*KERNEL*/', kernel).replace('/*APP*/', appCode);
  fs.writeFileSync(path.join(OUT, outName), html);
  console.log(`${fail === 0 ? 'OK ' : 'XX '} ${outName.padEnd(34)} tests ${pass}/${pass + fail}  ${Math.round(html.length / 1024)}KB`);
  if (fail) log.filter(l => !l.ok).forEach(l => console.log('     FAIL:', l.name));
  return { pass, fail, log };
}

const APPS = [
  { dir: 'crm',         out: 'crm',         title: 'CRM & Customer 360' },
  { dir: 'dashboard',   out: 'dashboard',   title: 'CEO Dashboard' },
  { dir: 'reports',     out: 'reports',     title: 'Report Builder' },
  { dir: 'procurement', out: 'procurement', title: 'Procurement' },
  { dir: 'vendors',     out: 'vendors',     title: 'Vendor Management' },
];
let totalFail = 0;
for (const a of APPS) {
  const P = path.join(__dirname, a.dir);
  if (!fs.existsSync(P)) continue;
  totalFail += buildOne(path.join(P, 'config_generic.js'), path.join(P, 'core.js'), a.out + '_ERP.html', 'Medhava \u00b7 ' + a.title + ' (Unified ERP)').fail;
  totalFail += buildOne(path.join(P, 'config_vastrangam.js'), path.join(P, 'core.js'), a.out + '_Vastrangam.html', 'Medhava \u00b7 ' + a.title + ' (Vastrangam)').fail;
}
console.log(`\nDeep build · ${totalFail} test failures`);
process.exit(totalFail ? 1 : 0);
