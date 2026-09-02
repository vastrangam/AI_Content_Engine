'use strict';
/* Runs each deep app's engine in a sandbox and writes the self-test names to tests.json,
   so the PDF books quote the real test list rather than a hand-typed copy. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const r2 = n => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const num = n => (n == null || n === '' || isNaN(n) ? 0 : Number(n));
/* An app may be built from shared engine/view files as well as its own core; the same list
   build_deep.js uses, so the test names quoted in a book are the ones the shipped file runs. */
const LIBS = {
  dashboard: ['m21lib.js', 'm21views.js'], reports: ['m21lib.js', 'm21views.js'],
  groupcons: ['m21lib.js', 'm21views.js'], m21unified: ['m21lib.js', 'm21views.js', '../xlsx.js'],
  crm: ['m04lib.js', 'm04views.js'], docs: ['m04lib.js', 'm04views.js'],
  helpdesk: ['m04lib.js', 'm04views.js'], m04unified: ['m04lib.js', 'm04views.js', '../xlsx.js'],
};
function run(dir, cfg) {
  const libs = (LIBS[dir] || []).map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
  const code = '(function(){\n' + fs.readFileSync(path.join(__dirname, dir, cfg), 'utf8') + '\n' + libs + '\n'
    + fs.readFileSync(path.join(__dirname, dir, 'core.js'), 'utf8') + '\n})();';
  const V = { app: s => { V._spec = s; }, H: {}, DB: {}, r2, num,
    money: n => String(n), inr: n => String(n), esc: s => String(s), toast: () => {}, save: () => {}, go: () => {}, render: () => {} };
  const sb = { window: undefined, document: undefined, module: { exports: {} }, Medhava: V, console };
  sb.global = sb; vm.createContext(sb); vm.runInContext(code, sb);
  const spec = V._spec; const DB = {}; spec.seed(DB);
  const PR = require(path.join(__dirname, '..', 'providers.js'));
  if (spec.uses) PR.seed(DB, spec.uses);
  const log = []; const t = (name, cond) => log.push({ name, ok: !!cond });
  spec.tests(t, DB);
  /* the no-lock-in checks are part of every app's test list, so they appear in the PDF too */
  if (spec.uses) PR.tests(t, DB, spec.uses);
  return log;
}
const out = {
  D2C_ERP: run('d2c', 'config_generic.js'),
  D2C_VAS: run('d2c', 'config_vastrangam.js'),
  B2B_ERP: run('b2b', 'config_generic.js'),
  B2B_VAS: run('b2b', 'config_vastrangam.js'),
  EXP_ERP: run('export', 'config_generic.js'),
  EXP_VAS: run('export', 'config_vastrangam.js'),
  POS_ERP: run('pos', 'config_generic.js'),
  POS_VAS: run('pos', 'config_vastrangam.js'),
  QT_ERP: run('quotes', 'config_generic.js'),
  QT_VAS: run('quotes', 'config_vastrangam.js'),
  CRM_ERP: run('crm', 'config_generic.js'),
  CRM_VAS: run('crm', 'config_vastrangam.js'),
  DOC_ERP: run('docs', 'config_generic.js'),
  DOC_VAS: run('docs', 'config_vastrangam.js'),
  HD_ERP: run('helpdesk', 'config_generic.js'),
  HD_VAS: run('helpdesk', 'config_vastrangam.js'),
  U2_ERP: run('m04unified', 'config_generic.js'),
  U2_VAS: run('m04unified', 'config_vastrangam.js'),
  DASH_ERP: run('dashboard', 'config_generic.js'),
  DASH_VAS: run('dashboard', 'config_vastrangam.js'),
  REP_ERP: run('reports', 'config_generic.js'),
  REP_VAS: run('reports', 'config_vastrangam.js'),
  GRP_ERP: run('groupcons', 'config_generic.js'),
  GRP_VAS: run('groupcons', 'config_vastrangam.js'),
  UNI_ERP: run('m21unified', 'config_generic.js'),
  UNI_VAS: run('m21unified', 'config_vastrangam.js'),
  OMS_ERP: run('oms', 'config_generic.js'),
  OMS_VAS: run('oms', 'config_vastrangam.js'),
  ORD_ERP: run('ordman', 'config_generic.js'),
  ORD_VAS: run('ordman', 'config_vastrangam.js'),
  AP_ERP: run('askprint', 'config_generic.js'),
  AP_VAS: run('askprint', 'config_vastrangam.js'),
  PROC_ERP: run('procurement', 'config_generic.js'),
  PROC_VAS: run('procurement', 'config_vastrangam.js'),
  VEND_ERP: run('vendors', 'config_generic.js'),
  VEND_VAS: run('vendors', 'config_vastrangam.js'),
};
fs.writeFileSync(path.join(__dirname, 'tests.json'), JSON.stringify(out, null, 1));
Object.keys(out).forEach(k => console.log(k, out[k].length, 'tests,', out[k].filter(t => !t.ok).length, 'failing'));
