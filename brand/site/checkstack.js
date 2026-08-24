'use strict';
/* THE GATE ON RULE 1 — no capability depends on one tool.
 *
 * WHY A GATE AND NOT A PARAGRAPH
 * "We will not lock ourselves to one vendor" is the easiest sentence in software to write and
 * the easiest to stop meaning. It stays true for exactly as long as somebody remembers it,
 * and the day a layer gets added in a hurry with one obvious choice and no alternative, the
 * sentence is already false and nothing says so.
 *
 * So the rule is checked instead. Every layer must carry:
 *
 *   default   one named choice, so building can begin
 *   swaps     TWO OR MORE real replacements, each naming something specific
 *   iface     the name in our own code that everything else talks to
 *   cost      what switching actually costs — an honest answer, including "high"
 *
 * The interface requirement is the one that does the real work. Two alternatives listed in a
 * document mean nothing if the business logic calls a vendor directly, because then switching
 * is a search-and-replace through the whole system. Naming the interface forces the question
 * "what would the rest of the code talk to instead?" to be answered while the layer is being
 * designed, which is the only time the answer is cheap.
 *
 * Run:  node brand/site/checkstack.js
 *       node brand/site/checkstack.js --summary
 */

const { LAYERS } = require('./stack.js');

/* A swap that says nothing commits to nothing. These are the phrases that look like an
   alternative while naming none — the software equivalent of "or similar". */
const VAGUE = [
  /^or something (else|similar)/i,
  /^(any )?(other|another) (tool|option|service|product)s?\.?$/i,
  /^alternatives? exists?/i,
  /^many options/i,
  /^etc\.?$/i,
  /^tbd$/i,
  /^to be decided$/i,
];

function run() {
  const problems = [];
  const P = (m) => problems.push(m);
  const seen = new Set();

  if (!LAYERS.length) P('the stack register is empty');

  LAYERS.forEach((l, i) => {
    const where = `layer ${i + 1} (${l.id || 'no id'})`;

    for (const k of ['id', 'layer', 'does', 'why', 'def', 'iface', 'cost']) {
      if (!l[k] || !String(l[k]).trim()) P(`${where}: missing "${k}"`);
    }

    if (seen.has(l.id)) P(`${where}: duplicate id "${l.id}"`);
    seen.add(l.id);

    /* THE RULE ITSELF. One alternative is a preference between two things; two is a
       genuine choice, and a genuine choice is what stops a layer becoming a corner. */
    const swaps = l.swaps || [];
    if (swaps.length < 2) {
      P(`${where}: names ${swaps.length} alternative${swaps.length === 1 ? '' : 's'}, needs at ` +
        `least 2 — a layer with one option is a dependency, whatever the document calls it`);
    }
    swaps.forEach((s, j) => {
      if (!String(s || '').trim()) P(`${where}: alternative ${j + 1} is empty`);
      if (VAGUE.some((re) => re.test(String(s).trim()))) {
        P(`${where}: alternative ${j + 1} — "${s}" commits to nothing. Name a specific ` +
          `thing that actually does this job, or admit there is no alternative.`);
      }
    });

    /* An interface is what makes a swap cheap. Without one, the alternatives above are a
       list of things you would have to rewrite the system to reach. */
    if (l.iface && /^(none|n\/a|—|-)$/i.test(String(l.iface).trim())) {
      P(`${where}: no interface. Two alternatives behind no interface means switching is a ` +
        `rewrite, so the alternatives are decorative. Name what the rest of the code talks to.`);
    }

    /* An honest cost, including an expensive one, is information. A missing one is a gap
       somebody discovers on the day they try to switch. */
    if (l.cost && /^(low|none|easy|trivial)\.?$/i.test(String(l.cost).trim())) {
      P(`${where}: the switching cost is one word. Say what actually has to be done, ` +
        `even when the answer really is "very little".`);
    }

    if (/[a-z]'[a-z]/i.test([l.why, l.does, l.cost].join(' '))) {
      P(`${where}: straight apostrophe in prose — use the typographic ’`);
    }
  });

  return problems;
}

function summary() {
  const nsw = LAYERS.reduce((s, l) => s + (l.swaps || []).length, 0);
  console.log(`  ${LAYERS.length} layers · ${nsw} named alternatives · ` +
    `${(nsw / LAYERS.length).toFixed(1)} per layer on average`);
  console.log(`  every layer names the interface the rest of the code talks to\n`);
  const w = Math.max(...LAYERS.map((l) => l.layer.length));
  LAYERS.forEach((l) => {
    console.log(`  ${l.layer.padEnd(w)}  ${String((l.swaps || []).length).padStart(2)} swaps  ` +
      `→ ${l.iface}`);
  });
}

if (require.main === module) {
  const problems = run();
  if (problems.length) {
    console.error(`checkstack: ${problems.length} problem(s)\n`);
    problems.forEach((p) => console.error('  ' + p));
    process.exit(1);
  }
  console.log(`checkstack: ${LAYERS.length} layers — every one has a default, at least two ` +
    `alternatives, and an interface`);
  if (process.argv.includes('--summary')) { console.log(''); summary(); }
}

module.exports = { run, summary };
