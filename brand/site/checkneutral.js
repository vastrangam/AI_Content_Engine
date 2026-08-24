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

const fs = require('node:fs');
const path = require('node:path');
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

  /* 3 · the RENDERED neutral page, not just the module list.
     modules.js is not the only place words come from. build.js has prose of its own — the flow
     band it draws says "the karigar paid for it", and that is correct only because VASINTRO
     gates the whole section to the trade edition. Nothing checked that. So the built page is
     scanned too: it is clean today, and the point is that until now nothing was stopping it
     from not being. Skipped rather than failed when the page has not been built yet, because a
     fresh clone has no index.html and this should not be the thing that blocks the first run. */
  const built = path.join(__dirname, 'index.html');
  if (fs.existsSync(built)) {
    const html = fs.readFileSync(built, 'utf8');
    /* The <style> block carries author comments and colour names, not reader-facing copy, and
       the base64 logo is a haystack of random letters — both are stripped before matching. */
    const visible = html
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/data:[a-z/+]+;base64,[A-Za-z0-9+/=]+/g, ' ')
      /* The industries band is exempt, and has to be: its entire job is to name trades —
         "Textile & apparel · Mills and trim suppliers" is that card doing exactly what it is
         for. Checking a list of industries for mentioning an industry would be checking the
         one section that is supposed to fail. Same reasoning exempts the sector labels on the
         product screens, which say which trade's figures a screen carries. */
      .replace(/<div class="indg">[\s\S]*?<\/div>\s*<\/div>/i, ' ')
      .replace(/<figcaption class="shotcap">[\s\S]*?<\/figcaption>/gi, ' ');
    TRADE_WORDS.forEach((w) => {
      const re = new RegExp('\\b' + w.replace(/ /g, '\\s+'), 'i');
      if (re.test(visible)) {
        P(`the BUILT neutral page (index.html) contains "${w}" — a trade word reached the ` +
          `edition that is supposed to have none. Check build.js for prose that is not gated ` +
          `to the trade edition.`);
      }
    });
  }

  /* 3b · the build guide's prose.
     guide.js is a second neutral source: one file of steps, formatted into both editions,
     with the trade's name arriving only as a token the generator substitutes. That makes it
     exactly as capable of leaking a trade word as modules.js was — and its own header claims
     this check exists, so it has to. Comments are skipped for the same reason as above: a
     comment explaining that a concept is called one thing in one trade is doing its job. */
  const guidePath = path.join(__dirname, 'guide.js');
  if (fs.existsSync(guidePath)) {
    const G = require('./guide.js');
    const prose = [];
    G.parts.forEach((p) => {
      prose.push([`part ${p.n} title`, p.title], [`part ${p.n} lead`, p.lead]);
      p.steps.forEach((s) => {
        ['do', 'why', 'note', 'warn', 'manual', 'expect', 'done'].forEach((k) => {
          if (s[k]) prose.push([`step ${s.id} ${k}`, s[k]]);
        });
        (s.needs || []).forEach((n, i) => prose.push([`step ${s.id} needs[${i}]`, n]));
        if (s.table) s.table.rows.forEach((r) => r.forEach((c) => prose.push([`step ${s.id} table`, c])));
      });
    });
    prose.forEach(([where, text]) => {
      TRADE_WORDS.forEach((w) => {
        const re = new RegExp('\\b' + w.replace(/ /g, '\\s+'), 'i');
        if (re.test(String(text || ''))) {
          P(`guide.js ${where}: contains "${w}" — the build guide is written once for BOTH ` +
            `editions, so a trade word here reaches the neutral one. Use a token the ` +
            `generator substitutes instead.`);
        }
      });
    });
  }

  /* 4 · an overlay key that names nothing does nothing, silently */
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
