'use strict';
/* Runs each deep app's engine in a sandbox and writes the self-test names to tests.json,
   so the PDF books quote the real test list rather than a hand-typed copy. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const r2 = n => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const num = n => (n == null || n === '' || isNaN(n) ? 0 : Number(n));
function run(dir, cfg) {
  const code = '(function(){\n' + fs.readFileSync(path.join(__dirname, dir, cfg), 'utf8') + '\n'
    + fs.readFileSync(path.join(__dirname, dir, 'core.js'), 'utf8') + '\n})();';
  const V = { app: s => { V._spec = s; }, H: {}, DB: {}, r2, num,
    money: n => String(n), inr: n => String(n), esc: s => String(s), toast: () => {}, save: () => {}, go: () => {}, render: () => {} };
  const sb = { window: undefined, document: undefined, module: { exports: {} }, Medhava: V, console };
  sb.global = sb; vm.createContext(sb); vm.runInContext(code, sb);
  const spec = V._spec; const DB = {}; spec.seed(DB);
  const log = []; spec.tests((name, cond) => log.push({ name, ok: !!cond }), DB);
  return log;
}
const out = {
  DASH_ERP: run('dashboard', 'config_generic.js'),
  DASH_VAS: run('dashboard', 'config_vastrangam.js'),
  REP_ERP: run('reports', 'config_generic.js'),
  REP_VAS: run('reports', 'config_vastrangam.js'),
};
fs.writeFileSync(path.join(__dirname, 'tests.json'), JSON.stringify(out, null, 1));
Object.keys(out).forEach(k => console.log(k, out[k].length, 'tests,', out[k].filter(t => !t.ok).length, 'failing'));
