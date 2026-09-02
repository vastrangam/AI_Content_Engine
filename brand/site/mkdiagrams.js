'use strict';
/* THE MODULE MAP, DERIVED — not drawn by hand.

   MEDHAVA_PLAN_OF_ACTION.md needed a picture of how the modules feed each other. That picture
   could have been drawn once and pasted in, and it would have been wrong within two commits:
   the module list has already changed shape three times in this repository, and a hand-drawn
   diagram has no way of noticing.

   So the graph is read out of the `reads` field on every module in brand/site/modules.js — the
   same field the website renders as "Reads from" — and emitted as mermaid. Add a module, or
   change what one reads, and the diagram changes on the next run with nobody editing it.

   TWO THINGS THIS DELIBERATELY DOES
   · "Every module" is not drawn as 22 edges. Six modules declare it, and drawing it literally
     would put 132 lines on the page and communicate nothing. It becomes one hub node with a
     note, which is what the sentence actually means.
   · A `reads` entry that names something which is not a module fails the build. That field is
     free text, so a typo or a renamed module would otherwise produce a diagram with a dangling
     node and nobody would notice until a reader asked what it was.

   Run:  node brand/site/mkdiagrams.js            print the mermaid block
         node brand/site/mkdiagrams.js --inject   write it into MEDHAVA_PLAN_OF_ACTION.md
         node brand/site/mkdiagrams.js --check    prove the injection is current and idempotent
*/

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const DOC = path.join(ROOT, 'MEDHAVA_PLAN_OF_ACTION.md');
const MODULES = require('./modules.js');

const EVERY = /every module/i;

/* The bands are the build order already encoded in the list, named so the picture reads as a
   sequence rather than a cloud. Membership is by module number, so a module cannot silently
   fall out of the diagram: anything unlisted lands in "Across the business" and is still drawn. */
const BANDS = [
  ['Foundation',        ['01', '02', '03', '04']],
  ['Selling',           ['05', '15']],
  ['Planning & making', ['06', '07', '08', '09']],
  ['Moving it',         ['10', '11']],
  ['The money',         ['12', '13', '14']],
  ['People & demand',   ['16', '17', '18', '19']],
];

function bandOf(n) {
  const hit = BANDS.find(([, list]) => list.includes(n));
  return hit ? hit[0] : 'Across the business';
}

/** id safe for mermaid: M05 rather than the display name. */
const id = (n) => 'M' + n;

function build() {
  const byName = {};
  MODULES.forEach((m) => { byName[m.name] = m.n; });

  const edges = [];
  const hubs = [];
  const bad = [];

  MODULES.forEach((m) => {
    (m.reads || []).forEach((r) => {
      if (EVERY.test(r)) { hubs.push(m.n); return; }
      const from = byName[r];
      if (!from) { bad.push(`module ${m.n} reads "${r}", which is not a module name`); return; }
      edges.push([from, m.n]);
    });
  });

  if (bad.length) {
    console.error('mkdiagrams: the module graph does not resolve\n  ' + bad.join('\n  '));
    process.exit(1);
  }
  return { edges, hubs: [...new Set(hubs)] };
}

/* ONE DIAGRAM PER BAND, NOT ONE DIAGRAM.

   The first version of this drew all 22 modules and all 44 edges on one page. It rendered —
   mermaid drew it, the PDF contained it, every automated check passed — and it was completely
   unreadable: a tangle of crossing lines with the labels shrunk to about four points. That is
   the failure mode this repository names outright: a green check is not a legible page, and
   the only way to know was to render it and look at it.

   So the graph is cut along the bands. Each diagram shows one band and the modules that feed
   it — six to nine nodes, a handful of edges, at a size a person can read. The information is
   identical; it is the page that changed. */
function bandDiagram(name, members, edges) {
  const byNum = {};
  MODULES.forEach((m) => { byNum[m.n] = m; });
  const nums = new Set(members.map((m) => m.n));

  /* edges landing in this band, and the outside modules that feed them */
  const inbound = edges.filter(([, to]) => nums.has(to));
  const feeders = [...new Set(inbound.map(([from]) => from).filter((n) => !nums.has(n)))];

  const L = ['```mermaid', 'flowchart LR'];
  L.push('  classDef me fill:#EFE7F8,stroke:#6B3CA6,color:#241436,stroke-width:1.4px;');
  L.push('  classDef up fill:#FAFAFB,stroke:#CFC7D8,color:#4A4458;');

  feeders.forEach((n) => L.push(`  ${id(n)}["${n} · ${byNum[n].name.replace(/"/g, "'")}"]:::up`));
  members.forEach((m) => L.push(`  ${id(m.n)}["${m.n} · ${m.name.replace(/"/g, "'")}"]:::me`));
  inbound.forEach(([from, to]) => L.push(`  ${id(from)} --> ${id(to)}`));
  L.push('```');
  return `**${name}** — what it reads, and from where.\n\n` + L.join('\n');
}

function mermaid() {
  const { edges, hubs } = build();
  const groups = {};
  MODULES.forEach((m) => {
    const b = bandOf(m.n);
    (groups[b] = groups[b] || []).push(m);
  });

  const order = [...BANDS.map(([b]) => b), 'Across the business'];
  const blocks = order
    .filter((b) => groups[b])
    .map((b) => bandDiagram(b, groups[b], edges));

  /* The "Every module" readers, said once in words. Drawn literally they would be 132 edges
     and would tell a reader nothing they cannot be told in a sentence. */
  const hubNote = hubs.length
    ? `\n**${hubs.map((n) => n).join(', ')}** declare that they read *every module*: they sit on the\n`
      + `shared data core rather than on any one upstream module, which is why no arrow into them is\n`
      + `drawn above. Everything else reads exactly what the arrows show.\n`
    : '';

  return blocks.join('\n\n') + '\n' + hubNote;
}

function stats() {
  const { edges, hubs } = build();
  return { modules: MODULES.length, edges: edges.length, hubs: hubs.length };
}

const OPEN = '<!-- MODULEGRAPH -->';
const CLOSE = '<!-- /MODULEGRAPH -->';

function inject(src) {
  const i = src.indexOf(OPEN), j = src.indexOf(CLOSE);
  if (i < 0 || j < 0) {
    throw new Error(`markers ${OPEN} / ${CLOSE} not found in ${path.basename(DOC)}`);
  }
  return src.slice(0, i + OPEN.length) + '\n' + mermaid() + '\n' + src.slice(j);
}

if (require.main === module) {
  const s = stats();
  if (process.argv.includes('--check')) {
    const before = fs.readFileSync(DOC, 'utf8');
    const after = inject(before);
    if (inject(after) !== after) { console.error('mkdiagrams: injection is NOT idempotent'); process.exit(1); }
    if (after !== before) { console.error('mkdiagrams: the diagram is out of date — run --inject'); process.exit(1); }
    console.log('mkdiagrams: up to date and idempotent');
  } else if (process.argv.includes('--inject')) {
    fs.writeFileSync(DOC, inject(fs.readFileSync(DOC, 'utf8')));
    console.log(`mkdiagrams: module graph injected — ${s.modules} modules · ${s.edges} named edges · ` +
      `${s.hubs} read the shared core`);
  } else {
    console.log(mermaid());
  }
}

module.exports = { mermaid, stats, build };
