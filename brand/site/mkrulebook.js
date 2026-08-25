'use strict';
/* Inject the full rulebook into a document, between markers.
 *
 *   node brand/site/mkrulebook.js            write
 *   node brand/site/mkrulebook.js --check    fail if writing would change anything
 *
 * WHY THIS EXISTS
 * MEDHAVA_PLAN_OF_ACTION.md carried 4 of 285 rules — it counted them in five places and
 * printed almost none. The rules are the specification; a plan that names how many exist
 * and shows them not at all has described the shape of the work and omitted the work.
 *
 * Marker-injected rather than hand-written, so the document cannot drift from rules.js.
 */
const fs = require('node:fs');
const path = require('node:path');
const RULEBOOK = require('./rulebook.js');

const ROOT = path.join(__dirname, '..', '..');
const TARGETS = ['MEDHAVA_PLAN_OF_ACTION.md'];
const OPEN = '<!-- RULEBOOK -->';
const CLOSE = '<!-- /RULEBOOK -->';

let changed = 0;
for (const t of TARGETS) {
  const file = path.join(ROOT, t);
  if (!fs.existsSync(file)) { console.error(`mkrulebook: ${t} not found`); process.exit(1); }
  const src = fs.readFileSync(file, 'utf8');
  const a = src.indexOf(OPEN);
  const b = src.indexOf(CLOSE);
  if (a < 0 || b < 0) {
    console.error(`mkrulebook: ${t} has no ${OPEN} … ${CLOSE} markers`);
    process.exit(1);
  }
  const body = '\n' + RULEBOOK.render({ heading: '###' }) + '\n';
  const out = src.slice(0, a + OPEN.length) + body + src.slice(b);
  if (out !== src) {
    changed++;
    if (!process.argv.includes('--check')) fs.writeFileSync(file, out);
  }
  const short = RULEBOOK.missingFrom(out);
  if (short.ids.length) {
    console.error(`mkrulebook: ${t} would still be missing ${short.ids.length} rules`);
    process.exit(1);
  }
  console.log(`  ${t}: ${short.total} rules, each with what the system will never do instead`);
}

if (process.argv.includes('--check') && changed) {
  console.error('mkrulebook: the injected rulebook is out of date — run without --check');
  process.exit(1);
}
console.log(process.argv.includes('--check') ? 'mkrulebook: up to date' : 'mkrulebook: written');
