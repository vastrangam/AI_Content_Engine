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

/* ── AND THE COUNTS NOBODY PUT BETWEEN MARKERS ─────────────────────────────
   The block above is derived. That did not stop "113 tables" being typed into the prose of two
   documents and a diagram box — and staying there while the real count went to 114 and then to
   151. One of them sat four hundred lines from the derived figure IN THE SAME FILE, so a reader
   could see both numbers without scrolling.

   A marker only protects what somebody thought to wrap. This scans every delivered document for a
   typed table count and refuses any that matches no derived source.

   NOT EVERY TABLE COUNT IS THE SCHEMA'S. This check originally compared against the schema total
   alone, and the first document to describe a SUBSET tripped it: the architect says how many
   tables Part V specifies, which is 43 of the 151 and correct. That is a false positive, and the
   wrong fix would have been to reword the sentence until the regex stopped seeing it — the number
   would then be just as typed and just as able to drift, with the gate blinded rather than
   satisfied.

   So the rule is the one that was always meant: a table count in prose must equal a count this
   repository derives, and the check says which one it matched. Every allowed figure below is read
   from the schema or from partv.js at run time, so if any of them moves, a document still carrying
   the old figure matches nothing and is refused exactly as before. */
function derivedTableCounts(c) {
  const PARTV = require('../../core/partv.js');
  return [
    { n: c.tables, what: 'the schema' },
    { n: PARTV.TABLES.length, what: 'the tables Part V specifies' },
    { n: PARTV.NEW_TABLES.length, what: 'the Part V tables that were added' },
    { n: PARTV.EXTENSIONS.length, what: 'the Part V tables folded into existing ones' },
  ];
}

function typedTableCounts(c) {
  const MANIFEST = require('../delivery/manifest.js');
  const allowed = derivedTableCounts(c);
  const wrong = [];
  for (const d of MANIFEST.DOCS) {
    const file = path.join(ROOT, d.md);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    text.split('\n').forEach((line, i) => {
      const m = line.match(/(\d{2,4})\s+tables\b/);
      if (!m) return;
      if (allowed.some((a) => a.n === Number(m[1]))) return;
      wrong.push(`${d.md}:${i + 1}  says "${m[1]} tables", which is not ` +
        allowed.map((a) => `${a.n} (${a.what})`).join(', '));
    });
  }
  return wrong;
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
    const typed = typedTableCounts(c);
    if (typed.length) {
      console.error('mkcounts: a table count was typed, not derived, and it has gone stale:\n  ' +
        typed.join('\n  ') + '\n  Correct it, or put it between the markers so it cannot drift again.');
      process.exit(1);
    }
    console.log('mkcounts: up to date and idempotent · every typed table count matches a derived ' +
      'source (' + derivedTableCounts(c).map((a) => `${a.n} = ${a.what}`).join(' · ') + ')');
  } else {
    fs.writeFileSync(DOC, after);
    const typed = typedTableCounts(c);
    console.log('mkcounts: ' + Object.entries(c).map(([k, v]) => `${k} ${v}`).join(' · '));
    if (typed.length) {
      console.log('  typed table counts that disagree (--check fails on these):\n    ' +
        typed.join('\n    '));
    }
  }
}

module.exports = { counts, block };
