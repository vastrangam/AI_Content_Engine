'use strict';
/* The gate on the neutral edition.

   WHY THIS EXISTS
   modules.js opens by saying, in its own header:

       "NOTHING HERE MAY ASSUME AN INDUSTRY ... audit section 8 fails the
        build if it leaks in here."

   No such check existed. The sentence was true as an intention and false as a
   fact, and four app descriptions had quietly drifted into one trade's
   vocabulary — a karigar in Module 01 and Module 20, a karigar and a garment in
   Module 16, a stitched piece in Module 05. All four were reaching the MEDHAVA
   edition, which is the industry-neutral one, so a dental clinic reading the
   page was being told about karigars.

   A claim about neutrality that nothing enforces is exactly the kind of thing
   this repository is not supposed to contain. So this file enforces it:

     · no word from one trade's vocabulary may appear in the neutral data
     · the overlay may change words and may never change structure — same
       module numbers, same app names, same app counts
     · every app the overlay names must exist. A key that matches nothing does
       nothing, silently, which is how trade wording disappears from the trade
       edition without anyone being told

   WHAT IS NOT ON THE LIST, AND WHY
   Generic labour and trade terms stay. "Piece-rate" is on Module 08 as an app
   name and belongs there: a packing hall, a farm and a call centre all pay by
   the piece. The list below is this trade's OWN words and this group's own
   names — the ones that make a neutral page read as one company's software.

   Run:  node brand/site/checkneutral.js
         node brand/site/checkneutral.js --summary
*/

const BASE = require('./modules.js');
const ED = require('./edition_vastrangam.js');

/* One trade's vocabulary, and this group's own names and places. Matched on a
   word boundary so "milling" is not caught by "mill" and "millions" never is. */
const TRADE_WORDS = [
  // the garments
  'saree', 'sari', 'lehenga', 'anarkali', 'chinon', 'kurta', 'kurti',
  'dupatta', 'salwar', 'churidar', 'sherwani', 'blouse',
  // the work and the people
  'karigar', 'garment', 'stitch', 'stitching', 'stitched', 'embroider',
  'embroidery', 'tailor', 'tailoring', 'dyeing',
  // the trade's own partners and places
  'boutique', 'mill', 'surat', 'udhna', 'hyderabad',
  // the group
  'vastrangam', 'adini', 'go4fashion', 'ethnic fashion', 'muskan',
];

/* Every string a reader actually sees, per module. Comments are deliberately
   NOT scanned: a comment explaining that a concept is called a matter in one
   trade and a job in another is doing its job, and is never rendered. */
function neutralStrings(m) {
  return [
    ['tag', m.tag],
    ['intro', m.intro],
    ...m.apps.map((a) => ['app name: ' + a[0], a[0]]),
    ...m.apps.map((a) => ['app: ' + a[0], a[2]]),
  ];
}

/* the overlay applied exactly as build.js and mklanding.js apply it */
function applied() {
  return BASE.map((m) => {
    const o = (ED.modules || {})[m.n] || {};
    return Object.assign({}, m, {
      tag: o.tag || m.tag,
      intro: o.intro || m.intro,
      apps: m.apps.map((a) => ((o.apps && o.apps[a[0]]) ? [a[0], a[1], o.apps[a[0]]] : a)),
    });
  });
}

function run() {
  const problems = [];
  const P = (m) => problems.push(m);

  /* 1 · no trade word in the neutral data */
  BASE.forEach((m) => {
    neutralStrings(m).forEach(([where, text]) => {
      TRADE_WORDS.forEach((w) => {
        const re = new RegExp('\\b' + w.replace(/ /g, '\\s+'), 'i');
        if (re.test(String(text || ''))) {
          P(`module ${m.n} ${where}: contains "${w}" — that is one trade's word, and MEDHAVA ` +
            `is the edition with no trade. Move the sentence to edition_vastrangam.js and ` +
            `write a neutral one here.`);
        }
      });
    });
  });

  /* 2 · the overlay may change words, never structure */
  const shape = (list) => list.map((m) => m.n + ':' + m.apps.map((a) => a[0]).join('|')).join(' ');
  if (shape(BASE) !== shape(applied())) {
    P('the edition overlay changed the structure, not just the words — a module number, ' +
      'an app name or an app count moved');
  }

  /* 3 · an overlay key that names nothing does nothing, silently */
  Object.keys(ED.modules || {}).forEach((n) => {
    const m = BASE.find((x) => x.n === n);
    if (!m) { P(`the overlay names module ${n}, which is not in the module list`); return; }
    Object.keys((ED.modules[n] || {}).apps || {}).forEach((appName) => {
      if (!m.apps.some((a) => a[0] === appName)) {
        P(`the overlay names "${appName}" in module ${n}, which is not an app there — ` +
          `that entry is doing nothing, and the trade wording it carries is not being applied`);
      }
    });
  });

  return problems;
}

function summary() {
  const A = applied();
  const overridden = Object.keys(ED.modules || {}).reduce(
    (s, n) => s + Object.keys((ED.modules[n] || {}).apps || {}).length, 0);
  const napp = BASE.reduce((s, m) => s + m.apps.length, 0);

  console.log(`  ${BASE.length} modules · ${napp} apps · ${TRADE_WORDS.length} trade words watched`);
  console.log(`  ${Object.keys(ED.modules || {}).length} modules carry edition wording`);
  console.log(`  ${overridden} of ${napp} app descriptions are rewritten for the trade edition`);
  console.log(`  the other ${napp - overridden} read the same in both editions, which is the point`);
  console.log(`\n  structure identical across editions: ${shapeSame(A) ? 'yes' : 'NO'}`);
  return { modules: BASE.length, apps: napp, overridden };
}

function shapeSame(A) {
  const shape = (l) => l.map((m) => m.n + ':' + m.apps.map((a) => a[0]).join('|')).join(' ');
  return shape(BASE) === shape(A);
}

if (require.main === module) {
  const problems = run();
  if (problems.length) {
    console.error(`checkneutral: ${problems.length} problem(s)\n`);
    problems.forEach((p) => console.error('  ' + p));
    process.exit(1);
  }
  console.log(`checkneutral: the neutral edition carries no trade vocabulary — clean`);
  if (process.argv.includes('--summary')) { console.log(''); summary(); }
}

module.exports = { run, summary, TRADE_WORDS };
