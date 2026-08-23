'use strict';
/* The counts in MEDHAVA_PLAN_OF_ACTION.md, derived rather than typed.

   WHY THIS EXISTS
   That document opens by saying every count in it is read from the canonical
   files. For a while that sentence was not true — the figures were typed, and
   they were already wrong by the time the pack engine landed and the rule count
   moved. A claim about provenance that nothing enforces is exactly the kind of
   thing this repository is not supposed to contain, so this file makes it true:
   it reads modules.js, rules.js, shots.js, tools.js, the schema and the packs
   directory, and writes the figures between markers.

   Like mkrules.js, it touches ONLY what is between the markers. Everything a
   person wrote by hand is left byte-identical, which is what makes running it
   safe at any time.

   Run:  node brand/site/mkcounts.js          write the counts in
         node brand/site/mkcounts.js --check  prove the injection is idempotent
*/

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const DOC = path.join(ROOT, 'MEDHAVA_PLAN_OF_ACTION.md');

function counts() {
  const MODULES = require('./modules.js');
  const RULES = require('./rules.js');
  const SHOTS = require('./shots.js');
  const { tools } = require('./tools.js');

  const nShot = (k) => (Array.isArray(SHOTS[k]) ? SHOTS[k].length : (SHOTS[k] ? 1 : 0));
  const screens = MODULES.reduce((s, m) => s + nShot(m.n), 0);
  const sectors = new Set();
  Object.keys(SHOTS).forEach((k) => {
    const v = Array.isArray(SHOTS[k]) ? SHOTS[k] : [SHOTS[k]];
    v.forEach((s) => { if (s && s.sector) sectors.add(s.sector); });
  });

  const sql = fs.readFileSync(path.join(ROOT, 'core', 'schema.postgres.sql'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n]*/g, '');
  const tables = new Set([...sql.matchAll(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+([a-z_][a-z0-9_]*)/gi)]
    .map((m) => m[1]));

  const packDir = path.join(ROOT, 'core', 'packs');
  const packs = fs.existsSync(packDir)
    ? fs.readdirSync(packDir).filter((f) => f.endsWith('.json')) : [];

  return {
    modules: MODULES.length,
    apps: MODULES.reduce((s, m) => s + m.apps.length, 0),
    rules: RULES.length,
    enforced: RULES.filter((r) => r.state === 'ENFORCED').length,
    tables: tables.size,
    screens,
    sectors: sectors.size,
    tools: tools.length,
    packs: packs.length,
    immutable: require(path.join(ROOT, 'core', 'packs.js')).IMMUTABLE.length,
  };
}

function block(c) {
  return `**${c.modules} modules · ${c.apps} apps · ${c.rules} rules (${c.enforced} enforced) · ` +
    `${c.tables} tables · ${c.screens} product screens across ${c.sectors} sectors · ` +
    `${c.tools} tool capabilities · ${c.packs} industry packs.**
Every count in this line is read from \`brand/site/modules.js\`, \`brand/site/rules.js\`,
\`brand/site/shots.js\`, \`brand/site/tools.js\`, \`core/schema.postgres.sql\` and \`core/packs/\`
by \`brand/site/mkcounts.js\` — no figure here was typed from memory.`;
}

const OPEN = '<!-- COUNTS -->';
const CLOSE = '<!-- /COUNTS -->';

function inject(src, c) {
  const i = src.indexOf(OPEN), j = src.indexOf(CLOSE);
  if (i < 0 || j < 0) {
    throw new Error(`markers ${OPEN} / ${CLOSE} not found in ${path.basename(DOC)}`);
  }
  return src.slice(0, i + OPEN.length) + '\n' + block(c) + '\n' + src.slice(j);
}

if (require.main === module) {
  const c = counts();
  const before = fs.readFileSync(DOC, 'utf8');
  const after = inject(before, c);

  if (process.argv.includes('--check')) {
    const twice = inject(after, c);
    if (twice !== after) { console.error('mkcounts: injection is NOT idempotent'); process.exit(1); }
    if (after !== before) {
      console.error('mkcounts: the document is out of date — run without --check');
      process.exit(1);
    }
    console.log('mkcounts: up to date and idempotent');
  } else {
    fs.writeFileSync(DOC, after);
    console.log('mkcounts: ' + Object.entries(c).map(([k, v]) => `${k} ${v}`).join(' · '));
  }
}

module.exports = { counts, block };
