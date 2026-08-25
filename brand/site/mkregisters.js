'use strict';
/* Inject the remaining registers into the plan of action, between markers.
 *
 *   node brand/site/mkregisters.js            write
 *   node brand/site/mkregisters.js --check    fail if writing would change anything
 *
 * WHY THIS EXISTS
 * mkrulebook.js put the 285 rules into this document because it carried 4 of them. Pointing the
 * same measurement at the other registers found the same hole three more times, in the same
 * document:
 *
 *     0 of 19 technical layers, and therefore 0 of the 57 named replacements
 *     1 of 24 things a business can change or can never switch off
 *     5 of 113 apps
 *     27 technical terms used and never explained
 *
 * Those are not decoration. Layers-and-replacements is the whole of Rule 1 — no capability
 * depends on one tool. Changeable-things is the whole of Rule 2 — nothing is static and the
 * past stays correct. A plan that names both rules on its front page and then prints neither
 * register has stated the intention and omitted the specification.
 *
 * Marker-injected rather than hand-written, so the document cannot drift from the sources.
 */
const fs = require('node:fs');
const path = require('node:path');
const REG = require('./registers.js');

const ROOT = path.join(__dirname, '..', '..');

/* Each block: its markers, what fills them, and which register it is answerable for.
   `used` renders only the terms the finished document actually uses — see glossarySection. */
const BLOCK = {
  APPS: { key: 'apps', body: () => REG.appsSection({ heading: '###' }) },
  STACK: { key: 'stack', body: () => REG.stackSection({ heading: '###' }) },
  DYNAMIC: { key: 'dynamic', body: () => REG.dynamicSection({ heading: '###' }) },
  /* Written last on purpose: the glossary must explain the words the blocks above introduce,
     so it is measured against the finished document, not the one before them. */
  GLOSSARY: { key: 'glossary', body: (doc, used) => REG.glossarySection({ heading: '###', only: used ? doc : null }) },
};

const TARGETS = [
  { file: 'MEDHAVA_PLAN_OF_ACTION.md', blocks: ['APPS', 'STACK', 'DYNAMIC', 'GLOSSARY'] },
  /* The runbook carries the words it uses and nothing else. It is not a specification, and a
     server administrator does not need the app list to deploy a machine — that decision, and
     the reason for it, is recorded in checkcoverage.js where somebody can argue with it. */
  { file: 'DEPLOYMENT.md', blocks: ['GLOSSARY'], usedOnly: true },
  /* The trade edition's plan. It sat outside every gate until the manifest existed, carrying
     1 of 19 layers and 1 of 24 changeable things while the neutral plan carried all of both. */
  { file: 'PLAN_OF_ACTION.md', blocks: ['APPS', 'STACK', 'DYNAMIC', 'GLOSSARY'] },
];

const check = process.argv.includes('--check');
let bad = 0;
let stale = 0;

for (const t of TARGETS) {
  const file = path.join(ROOT, t.file);
  if (!fs.existsSync(file)) { console.error(`mkregisters: ${t.file} not found`); process.exit(1); }

  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  for (const name of t.blocks) {
    const b = BLOCK[name];
    const open = `<!-- ${name} -->`;
    const close = `<!-- /${name} -->`;
    const a = src.indexOf(open);
    const z = src.indexOf(close);
    if (a < 0 || z < 0) {
      console.error(`mkregisters: ${t.file} has no ${open} … ${close} markers`);
      process.exit(1);
    }
    /* The glossary is rendered against the document with its own block emptied, so a term is
       never counted as "used" merely because its own definition mentions it. */
    const without = src.slice(0, a) + src.slice(z + close.length);
    src = src.slice(0, a + open.length) + '\n' + b.body(without, t.usedOnly) + '\n' + src.slice(z);
  }

  if (src !== before) { stale++; if (!check) fs.writeFileSync(file, src); }

  /* THE GATE. Injecting a block is not the same as the block being complete — the renderer
     could be wrong, or a source could have grown an entry the renderer skips. So the finished
     text is measured against every register it is answerable for, and a short one is refused. */
  const report = REG.audit(src);
  for (const name of t.blocks) {
    const r = report[BLOCK[name].key];
    if (r.missing.length || r.extra.length) {
      bad++;
      console.error(`mkregisters: ${t.file} is still short of ${r.label} — ` +
        `${r.missing.length} of ${r.total} absent` +
        (r.extra.length ? `, ${r.extra.length} incomplete` : ''));
      console.error('    ' + r.missing.concat(r.extra).slice(0, 6).join(' · '));
    } else if (r.direction === 'used-but-unexplained') {
      console.log(`  ${t.file}: every technical term it uses is explained`);
    } else {
      console.log(`  ${t.file}: ${r.total} ${r.label}, in full`);
    }
  }
}

if (bad) process.exit(1);
if (check && stale) {
  console.error('mkregisters: the injected registers are out of date — run without --check');
  process.exit(1);
}
console.log(check ? 'mkregisters: up to date' : 'mkregisters: written');
