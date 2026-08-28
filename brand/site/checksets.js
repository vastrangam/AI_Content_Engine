'use strict';
/* TWO TABLES DESCRIBE THE SAME GARMENTS. THEY DO NOT AGREE.
 *
 *   node brand/site/checksets.js
 *   node brand/site/checksets.js --summary
 *
 * WHY THIS FILE EXISTS
 * What a set type contains, and what an EMPTY slot of it means, is written down
 * twice:
 *
 *   engine/fixtures/set_types.json   read by the Python engine. Its compositions
 *                                    were DERIVED — each is the only slot
 *                                    combination that reproduces the recorded
 *                                    totals for every design of that type.
 *   studio_core.js SET_RULES         read by the Data Studio, in the browser and
 *                                    in Node. Its answers were ASSERTED.
 *
 * Nothing compared them, so they drifted: three set types disagree on which
 * garments even belong, and the browser table quietly decides — for all thirteen
 * — the exact question the fixture says nobody has decided.
 *
 * WHAT IS GATED, AND WHAT IS ONLY REPORTED
 *   GATED     membership. A set type in both files must contain the same slots,
 *             or the disagreement must be written down in the fixture's
 *             `_javascript_table_differs` with a reason somebody can argue with.
 *   GATED     every member garment either maps to a slot or is listed in
 *             `_slotless_members`. A garment silently mapping to nothing is how
 *             a piece stops constraining a set without anybody noticing.
 *   REPORTED  optionality. The fixture says every slot is undecided; the browser
 *             table answers all of them. Disagreeing with "undecided" is not a
 *             contradiction — it is an unconfirmed assertion, and the list of
 *             them is what the owner needs in order to decide.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const FIXTURE = path.join(ROOT, 'engine', 'fixtures', 'set_types.json');
const CORE = path.join(ROOT, 'brand', 'suite', 'studio', 'studio_core.js');

const summary = process.argv.includes('--summary');
let failures = 0;
const fail = (msg) => { failures++; console.error(msg); };

/* THIS IS A TENANT CHECK, AND IT SAYS SO WHEN THERE IS NO TENANT.
 *
 * It reconciles one trade's set compositions (what a Lehenga Choli Set contains) against the
 * studio's own rules. Both halves are that trade's data — the product has no opinion about what a
 * garment set contains, and a clinic or a steel works installing this platform has no set types
 * at all.
 *
 * It used to read the fixture at load time and die with an ENOENT on a product-only checkout,
 * which made a TENANT's data a build dependency of the PRODUCT. It now skips, loudly: a skipped
 * check that announces itself is honest, and one that quietly passes is not. */
if (!fs.existsSync(FIXTURE)) {
  console.log('checksets: no trade fixture installed — SKIPPED, not passed.');
  console.log(`  ${path.relative(ROOT, FIXTURE)} is a tenant's data. With no tenant configured`);
  console.log('  there are no set compositions to reconcile, and this check has nothing to say.');
  process.exit(0);
}

const fixture = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
const core = require(CORE);
const RULES = core.SET_RULES;

const byName = {};
fixture.compositions.forEach((c) => { byName[c.set_type] = c; });

const differs = fixture._javascript_table_differs || {};
const slotless = fixture._slotless_members || {};
const notListed = String(fixture._not_listed || '');

/* ── 1 · every member garment places into a slot, or is declared unplaceable ── */
const unplaced = [];
Object.keys(RULES).forEach((setType) => {
  RULES[setType].members.forEach((piece) => {
    if (core.slotOfPiece(piece)) return;
    if (Object.prototype.hasOwnProperty.call(slotless, piece)) return;
    unplaced.push(`${setType} · ${piece}`);
  });
});
if (unplaced.length) {
  fail(`checksets: ${unplaced.length} member garment(s) map to no slot and are not ` +
    `declared:\n    ${unplaced.join('\n    ')}\n` +
    '  Either add the word to SLOT_WORDS in studio_core.js, or record it in the ' +
    'fixture\'s _slotless_members saying why it has no slot.');
}
Object.keys(slotless).filter((k) => !k.startsWith('_')).forEach((piece) => {
  if (String(slotless[piece]).trim().length < 60) {
    fail(`checksets: _slotless_members["${piece}"] has no real reason — a word, not a sentence.`);
  }
});

/* ── 2 · membership agrees, or the disagreement is written down ──────────── */
const memberRows = [];
Object.keys(RULES).forEach((setType) => {
  const c = byName[setType];
  if (!c) {
    /* A set type the fixture deliberately leaves out. _not_listed names them. */
    if (!notListed.includes(setType)) {
      fail(`checksets: studio_core knows "${setType}" and the fixture neither lists it ` +
        'nor explains its absence in _not_listed.');
    }
    memberRows.push([setType, '—', 'not in the fixture, on purpose']);
    return;
  }
  const jsSlots = [...new Set(RULES[setType].members.map(core.slotOfPiece).filter(Boolean))];
  const same = jsSlots.length === c.slots.length &&
    c.slots.every((s) => jsSlots.includes(s));
  if (same) {
    memberRows.push([setType, c.slots.join('+'), 'agree']);
    return;
  }
  const why = differs[setType];
  if (typeof why !== 'string' || why.trim().length < 60) {
    fail(`\nchecksets: "${setType}" disagrees about what it contains, and nobody wrote ` +
      'it down.\n' +
      `  fixture      ${c.slots.join(' + ')}   (derived from ${c.designs_tested} designs)\n` +
      `  studio_core  ${jsSlots.join(' + ')}   (from members ${RULES[setType].members.join(', ')})\n` +
      '  Record it in the fixture\'s _javascript_table_differs with a reason, or make ' +
      'the two agree. A silent disagreement is two different set counts for one garment.');
  }
  memberRows.push([setType, `${c.slots.join('+')}  vs  ${jsSlots.join('+')}`, 'differs, recorded']);
});

/* A recorded disagreement that no longer exists is stale — it would excuse a
   future one nobody looked at. */
Object.keys(differs).filter((k) => !k.startsWith('_')).forEach((setType) => {
  const row = memberRows.find((r) => r[0] === setType);
  if (!row || row[2] !== 'differs, recorded') {
    fail(`checksets: _javascript_table_differs names "${setType}", which does not ` +
      'disagree (or does not exist). Remove the entry rather than leave it standing.');
  }
});

/* ── 3 · optionality — reported, because the fixture says it is undecided ─── */
const asserted = [];
Object.keys(RULES).forEach((setType) => {
  const c = byName[setType];
  if (!c || !c.required) return;
  const optional = RULES[setType].optional || [];
  RULES[setType].members.forEach((piece) => {
    const slot = core.slotOfPiece(piece);
    if (!slot || !(slot in c.required)) return;
    const decided = c.required[slot];
    const js = optional.includes(piece) ? false : true;   // in `optional` = not required
    if (decided === null || decided === undefined) {
      asserted.push([setType, piece, js ? 'required' : 'optional']);
    } else if (decided !== js) {
      fail(`checksets: "${setType}" · ${piece} — the fixture decided ` +
        `${decided ? 'required' : 'optional'} and studio_core says ` +
        `${js ? 'required' : 'optional'}. The fixture is meant to win; ` +
        'applySetTypeFixture did not apply.');
    }
  });
});

/* ── summary ─────────────────────────────────────────────────────────────── */
if (summary && !failures) {
  const w = memberRows.reduce((m, r) => Math.max(m, r[0].length), 0);
  console.log('\n  what each set type contains');
  memberRows.forEach((r) => console.log(`      ${r[0].padEnd(w)}  ${r[1].padEnd(28)} ${r[2]}`));
  if (asserted.length) {
    console.log(`\n  ${asserted.length} slot(s) the browser table answers and the fixture ` +
      'calls undecided');
    console.log('  (reported, not failed — an unconfirmed assertion is not a contradiction)');
    const w2 = asserted.reduce((m, r) => Math.max(m, r[0].length), 0);
    asserted.forEach((r) => console.log(`      ${r[0].padEnd(w2)}  ${r[1].padEnd(18)} ${r[2]}`));
  }
  console.log('');
}

if (failures) {
  console.error(`\nchecksets: ${failures} problem(s) across ${Object.keys(RULES).length} set types.`);
  process.exit(1);
}
console.log(`checksets: all valid — ${Object.keys(RULES).length} set types, membership agreed ` +
  `or recorded; ${asserted.length} slot(s) asserted by studio_core and undecided in the fixture`);
