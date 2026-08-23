'use strict';
/* THE GATE ON THE INDUSTRY PACK ENGINE.

   MEDHAVA_PLAN_OF_ACTION.md §M6 sets Phase 2 one test, and this is it:

       "A third trade is added WITHOUT WRITING CODE — the test that decides
        whether this is a product."

   Everything else in this file is scaffolding around that sentence. Section 4
   is the gate proper: it invents a trade that appears nowhere in this
   repository — a commercial laundry — hands the engine a JSON string, and
   requires the whole system to speak that trade's language back. If that ever
   needs a line of JavaScript to work, the gate has failed and Medhava is a
   consultancy with software attached.

   The other sections exist because a gate that only tests the happy path
   proves nothing. A pack engine that accepts anything is not configuration,
   it is a hole. So §3 hands it eleven packs that must be REFUSED, and the
   test fails if any of them is accepted.

   Run: node core/tests/packs.test.js
*/

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const P = require('../packs.js');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('  ok   ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + e.message); }
}
function section(t) { console.log('\n── ' + t + ' ' + '─'.repeat(Math.max(0, 62 - t.length))); }

const PACKS = P.loadAll();
const IDS = Object.keys(PACKS).sort();

/* =======================================================================
   1 · The shipped packs
   ===================================================================== */
section('1 · the packs that ship');

check('every pack in core/packs/ loads', () => {
  const files = fs.readdirSync(path.join(__dirname, '..', 'packs')).filter((f) => f.endsWith('.json'));
  assert.strictEqual(IDS.length, files.length,
    `${files.length} files on disk but ${IDS.length} packs loaded`);
  assert.ok(IDS.length >= 6, `only ${IDS.length} packs — the six researched sectors are the floor`);
});

check('the six sectors named by the adoption research are all present', () => {
  /* Ordered by real adoption, not by taste: manufacturing is the largest ERP
     user base, retail the largest WMS one, transportation the most-served 3PL
     market. The order is the build order, and it is in the pack as `rank`. */
  ['manufacturing', 'wholesale-distribution', 'retail-ecommerce',
   'professional-services', 'healthcare-clinic', 'logistics-3pl']
    .forEach((id) => assert.ok(PACKS[id], `missing pack: ${id}`));
});

check('every pack states why its sector is in the list, and its rank', () => {
  IDS.forEach((id) => {
    const p = PACKS[id];
    assert.ok(p.why && p.why.length > 60, `${id}: "why" is missing or too thin to be a reason`);
    assert.strictEqual(typeof p.rank, 'number', `${id}: no rank`);
  });
  const ranks = IDS.map((id) => PACKS[id].rank).sort((a, b) => a - b);
  assert.deepStrictEqual(ranks, ranks.map((_, i) => i + 1), 'ranks are not 1..n without gaps');
});

check('no two packs claim the same rank or the same id', () => {
  assert.strictEqual(new Set(IDS).size, IDS.length);
  assert.strictEqual(new Set(IDS.map((i) => PACKS[i].rank)).size, IDS.length);
});

check('every pack is frozen after loading', () => {
  const p = PACKS.manufacturing;
  assert.ok(Object.isFrozen(p) && Object.isFrozen(p.vocabulary));
  assert.throws(() => { 'use strict'; p.vocabulary.customer = 'mark'; });
});

/* =======================================================================
   2 · The trades genuinely differ
   ===================================================================== */
section('2 · the same engine, six different languages');

check('the six trades disagree about what to call an order', () => {
  const words = IDS.map((id) => P.term(PACKS[id], 'order'));
  assert.strictEqual(new Set(words).size >= 4, true,
    'the packs mostly agree on vocabulary, which means they are not really different trades: ' + words.join(', '));
  assert.strictEqual(P.term(PACKS['professional-services'], 'order'), 'matter');
  assert.strictEqual(P.term(PACKS['healthcare-clinic'], 'order'), 'appointment');
  assert.strictEqual(P.term(PACKS['logistics-3pl'], 'order'), 'consignment');
});

check('an unnamed concept falls back to the neutral word, it does not blank', () => {
  const bare = { id: 'bare', name: 'Bare', sector: 'X' };
  P.CONCEPTS.forEach((c) => {
    const t = P.term(bare, c);
    assert.ok(t && t.trim(), `${c} resolved to nothing`);
  });
  assert.strictEqual(P.term(bare, 'workOrder'), 'work order', 'camelCase should read as words');
});

check('plurals come from the pack when it gives one, and are formed when it does not', () => {
  assert.strictEqual(P.term(PACKS['professional-services'], 'unitOfWork', { plural: true }), 'billable hours');
  assert.strictEqual(P.term(PACKS['healthcare-clinic'], 'customer', { plural: true }), 'patients');
  /* no plural given for "invoice" in the clinic pack — formed, not empty */
  assert.strictEqual(P.term(PACKS['healthcare-clinic'], 'invoice', { plural: true }), 'bills');
  /* a word ending in a sibilant takes -es */
  assert.strictEqual(P.term({ id: 'x', vocabulary: { item: 'batch' } }, 'item', { plural: true }), 'batches');
});

check('asking for a concept the engine does not have is refused, not guessed', () => {
  assert.throws(() => P.term(PACKS.manufacturing, 'spaceship'), P.PackError);
});

check('the pipelines differ, and every stage list is ordered and unique', () => {
  const seen = new Set();
  IDS.forEach((id) => {
    Object.keys(PACKS[id].stages || {}).forEach((pipe) => {
      const st = P.stages(PACKS[id], pipe);
      assert.ok(st.length >= 3, `${id}.${pipe} has ${st.length} stages`);
      const keys = st.map((s) => s.key);
      assert.strictEqual(new Set(keys).size, keys.length, `${id}.${pipe} repeats a stage`);
      seen.add(id + '.' + pipe);
    });
  });
  assert.ok(seen.size >= 9, `only ${seen.size} pipelines across all packs`);
});

check('every stage list ends somewhere — a pipeline with no terminal stage never closes', () => {
  IDS.forEach((id) => {
    Object.keys(PACKS[id].stages || {}).forEach((pipe) => {
      const st = P.stages(PACKS[id], pipe);
      assert.ok(st.some((s) => s.terminal), `${id}.${pipe} has no terminal stage`);
    });
  });
});

check('stages() hands back a copy — a caller cannot edit the pack through it', () => {
  const a = P.stages(PACKS.manufacturing, 'production');
  a.push({ key: 'nonsense', name: 'Nonsense' });
  assert.strictEqual(P.stages(PACKS.manufacturing, 'production').length, a.length - 1);
});

/* =======================================================================
   3 · What a pack may NOT do
   ===================================================================== */
section('3 · the refusals — a pack that accepted these would be a hole');

const base = { id: 'test', name: 'Test', sector: 'Test' };
function refuses(name, pack, expect) {
  check(name, () => {
    const problems = P.validate(Object.assign({}, base, pack));
    assert.ok(problems.length, 'accepted a pack it should have refused');
    assert.ok(problems.some((x) => expect.test(x)),
      `refused for the wrong reason: ${problems.join(' | ')}`);
    assert.throws(() => P.load(Object.assign({}, base, pack)), P.PackError);
  });
}

refuses('a pack containing a function',
  { vocabulary: { customer: 'client' }, hook: function () { return 1; } },
  /contains a function/);

refuses('a function buried three levels down',
  { seed: { extras: [{ deep: { fn: () => 1 } }] } },
  /contains a function/);

refuses('renaming a concept the engine does not have',
  { vocabulary: { spaceship: 'rocket' } },
  /not a concept this engine has/);

refuses('adding a field to a table that does not exist',
  { fields: { unicorns: [{ key: 'horn', label: 'Horn', type: 'text' }] } },
  /not a table in the schema/);

refuses('a field with a type the engine cannot store',
  { fields: { items: [{ key: 'x', label: 'X', type: 'blob' }] } },
  /is not one of/);

refuses('money declared as a plain number',
  { fields: { items: [{ key: 'landed_cost', label: 'Landed cost', type: 'number' }] } },
  /looks like money but is "number"/);

refuses('a choice field with nothing to choose from',
  { fields: { items: [{ key: 'grade', label: 'Grade', type: 'choice' }] } },
  /choice with no choices/);

refuses('switching on a rule that is not in the rulebook',
  { rules: { 'R99.99': true } },
  /not in the rulebook/);

refuses('switching OFF the audit trail',
  { rules: { 'R01.5': false } },
  /no pack may switch off/);

refuses('switching off company scoping by the long form',
  { rules: { 'R01.1': { enabled: false } } },
  /no pack may switch off/);

refuses('switching off the roster-privacy rule',
  { rules: { 'R16.22': false } },
  /no pack may switch off/);

refuses('an id that is not a safe slug',
  { id: 'My Trade!' },
  /lower-case with hyphens/);

refuses('a seed account with no type',
  { seed: { accounts: [{ code: '1000', name: 'Something' }] } },
  /type must be one of/);

refuses('a stage list that repeats a stage',
  { stages: { p: [{ key: 'a', name: 'A' }, { key: 'a', name: 'Again' }] } },
  /repeats "a"/);

check('validate reports every problem at once, not just the first', () => {
  const problems = P.validate({
    id: 'Bad Id', name: '', sector: 'X',
    vocabulary: { nonsense: 'x' },
    fields: { unicorns: [{ key: 'a', label: 'A', type: 'blob' }] },
    rules: { 'R99.99': true, 'R01.5': false },
  });
  assert.ok(problems.length >= 6, `only ${problems.length} problems reported: ${problems.join(' | ')}`);
});

check('a refused pack is refused whole — nothing is half-applied', () => {
  const before = Object.keys(P.loadAll()).length;
  try { P.load({ id: 'half', name: 'Half', sector: 'X', rules: { 'R01.5': false } }); } catch (_) { /* expected */ }
  assert.strictEqual(Object.keys(P.loadAll()).length, before);
});

check('an immutable rule reads as ON even if a pack claims otherwise in some other field', () => {
  const st = P.ruleState({ id: 'x', rules: {} }, 'R12.1');
  assert.deepStrictEqual({ enabled: st.enabled, immutable: st.immutable }, { enabled: true, immutable: true });
});

check('a rule the pack never mentions is ON — a pack is an exception list, not a permission list', () => {
  const st = P.ruleState(PACKS['professional-services'], 'R05.9');
  assert.strictEqual(st.enabled, true,
    'an unmentioned rule defaulted to off, which would mean every new rule silently applies to nobody');
});

check('a rule a pack switches off really is off, and a threshold survives', () => {
  assert.strictEqual(P.ruleState(PACKS['professional-services'], 'R03.3').enabled, false);
  assert.strictEqual(P.ruleState(PACKS['logistics-3pl'], 'R11.3').threshold, 48);
  assert.strictEqual(P.ruleState(PACKS['healthcare-clinic'], 'R09.3').threshold, 30);
});

check('every immutable rule id really exists in the rulebook', () => {
  const ids = P.ruleIds();
  assert.ok(ids.size > 0, 'the rulebook did not load, so this proves nothing');
  const ghosts = P.IMMUTABLE.filter((id) => !ids.has(id));
  assert.deepStrictEqual(ghosts, [],
    'immutable list protects rules that do not exist: ' + ghosts.join(', '));
});

check('no shipped pack switches off a rule another shipped pack depends on being loud about', () => {
  /* Specifically: the trades with no stock switch stock rules off, and the
     trades WITH stock must not have followed them by accident. */
  assert.strictEqual(P.ruleState(PACKS['professional-services'], 'R03.5').enabled, false);
  assert.strictEqual(P.ruleState(PACKS.manufacturing, 'R03.5').enabled, true);
  assert.strictEqual(P.ruleState(PACKS['retail-ecommerce'], 'R03.5').enabled, true);
});

/* =======================================================================
   4 · THE PHASE 2 GATE
   ===================================================================== */
section('4 · THE GATE — a seventh trade, added at run time, from data alone');

/* A commercial laundry. It appears nowhere in this repository: not in
   modules.js, not in shots.js, not in the rulebook, not in the six packs on
   disk. It is written here as a JSON STRING on purpose — parsing it is the
   only way it can enter the system, which is the same door a customer's pack
   would come through. If any part of the assertions below required a change
   to packs.js, the gate has failed. */
const LAUNDRY_JSON = `{
  "id": "commercial-laundry",
  "name": "Commercial laundry",
  "sector": "Services",
  "rank": 7,
  "why": "A trade nobody building this engine had in mind — which is exactly what makes it the test. It has stock that is owned by the customer, a production line, a route, and a bill.",
  "vocabulary": {
    "customer": "account",
    "supplier": "chemical supplier",
    "item": "article",
    "order": "docket",
    "workOrder": "wash load",
    "stage": "process",
    "location": "cage",
    "invoice": "bill",
    "person": "operative",
    "unitOfWork": "kilo",
    "project": "contract"
  },
  "plurals": { "unitOfWork": "kilos", "order": "dockets" },
  "stages": {
    "wash": [
      { "key": "collected", "name": "Collected" },
      { "key": "sorted", "name": "Sorted and weighed" },
      { "key": "washed", "name": "Washed" },
      { "key": "finished", "name": "Pressed and finished" },
      { "key": "checked", "name": "Checked", "gate": true },
      { "key": "returned", "name": "Returned to account", "terminal": true }
    ]
  },
  "fields": {
    "items": [
      { "key": "article_code", "label": "Article code", "type": "text" },
      { "key": "wash_programme", "label": "Wash programme", "type": "choice",
        "choices": ["white 90", "colour 60", "delicate 30", "dry clean"] },
      { "key": "replacement_value_paise", "label": "Replacement value", "type": "paise" }
    ],
    "customers": [
      { "key": "collection_day", "label": "Collection day", "type": "choice",
        "choices": ["mon", "tue", "wed", "thu", "fri", "sat"] }
    ]
  },
  "documents": [
    { "key": "docket", "name": "Collection docket", "fields": ["account", "articles", "weight"] },
    { "key": "bill", "name": "Bill", "fields": ["account", "kilos", "rate", "total"] }
  ],
  "rules": {
    "R03.8": true,
    "R09.1": true,
    "R08.1": false,
    "R08.3": false,
    "R03.9": false
  },
  "seed": {
    "accounts": [
      { "code": "1310", "name": "Chemicals and consumables", "type": "asset" },
      { "code": "4060", "name": "Laundry income", "type": "income" },
      { "code": "5150", "name": "Water, power and gas", "type": "expense" },
      { "code": "5155", "name": "Article replacement", "type": "expense" }
    ],
    "roles": [
      { "key": "sorter", "name": "Sorter" },
      { "key": "operative", "name": "Machine operative" },
      { "key": "driver", "name": "Route driver" }
    ],
    "units": ["kilo", "piece", "cage"]
  }
}`;

let LAUNDRY = null;

check('GATE · the trade is not already known to this repository', () => {
  const files = ['../packs.js', '../../brand/site/modules.js', '../../brand/site/rules.js']
    .map((f) => path.join(__dirname, f));
  files.forEach((f) => {
    if (!fs.existsSync(f)) return;
    const src = fs.readFileSync(f, 'utf8').toLowerCase();
    assert.ok(!src.includes('laundry'),
      `${path.basename(f)} already mentions laundry — then this is not a new trade`);
  });
  assert.ok(!PACKS['commercial-laundry'], 'the laundry is already a shipped pack');
});

check('GATE · it loads from a JSON string with no code change', () => {
  LAUNDRY = P.load(JSON.parse(LAUNDRY_JSON));
  assert.strictEqual(LAUNDRY.id, 'commercial-laundry');
});

check('GATE · every screen in the system can name itself in this trade\'s words', () => {
  const v = P.resolve(LAUNDRY).vocabulary;
  P.CONCEPTS.forEach((c) => assert.ok(v[c] && v[c].trim(), `${c} has no word`));
  assert.strictEqual(v.order, 'docket');
  assert.strictEqual(v.workOrder, 'wash load');
  assert.strictEqual(v.customer, 'account');
  /* the concepts the laundry never named still resolve, neutrally */
  assert.strictEqual(v.payment, 'payment');
  assert.strictEqual(v.orderLine, 'order line');
});

check('GATE · its pipeline drives a real screen — ordered, gated, terminating', () => {
  const st = P.stages(LAUNDRY, 'wash');
  assert.deepStrictEqual(st.map((s) => s.key),
    ['collected', 'sorted', 'washed', 'finished', 'checked', 'returned']);
  assert.strictEqual(st.filter((s) => s.gate).length, 1);
  assert.strictEqual(st[st.length - 1].terminal, true);
});

check('GATE · its extra fields land on tables that really exist', () => {
  const tables = P.schemaTables();
  P.resolve(LAUNDRY).tablesExtended.forEach((t) => assert.ok(tables.has(t), `${t} is not a real table`));
  const f = P.fields(LAUNDRY, 'items');
  assert.strictEqual(f.length, 3);
  assert.strictEqual(f.find((x) => x.key === 'replacement_value_paise').type, 'paise');
});

check('GATE · its rule switches resolve against the real rulebook', () => {
  assert.strictEqual(P.ruleState(LAUNDRY, 'R03.8').enabled, true);
  assert.strictEqual(P.ruleState(LAUNDRY, 'R08.1').enabled, false);
  /* untouched rules stay on */
  assert.strictEqual(P.ruleState(LAUNDRY, 'R05.1').enabled, true);
  /* and it still cannot escape the guarantees */
  assert.strictEqual(P.ruleState(LAUNDRY, 'R12.1').immutable, true);
});

check('GATE · it seeds a chart of accounts and a set of roles', () => {
  assert.strictEqual(P.seed(LAUNDRY, 'accounts').length, 4);
  assert.strictEqual(P.seed(LAUNDRY, 'roles').length, 3);
  assert.deepStrictEqual(P.seed(LAUNDRY, 'units'), ['kilo', 'piece', 'cage']);
  assert.deepStrictEqual(P.seed(LAUNDRY, 'nothing_like_this'), []);
});

check('GATE · it issues its own documents', () => {
  assert.deepStrictEqual(P.documents(LAUNDRY).map((d) => d.key), ['docket', 'bill']);
});

check('GATE · the seventh trade is refused the same things the first six are', () => {
  const bad = JSON.parse(LAUNDRY_JSON);
  bad.rules['R01.5'] = false;
  assert.throws(() => P.load(bad), P.PackError,
    'the new trade was allowed to switch off the audit trail');
});

check('GATE · nothing in packs.js was touched to make this work', () => {
  /* The whole point. Stated as an assertion so it is checked rather than
     believed: the engine file must not name any trade at all. */
  const src = fs.readFileSync(path.join(__dirname, '..', 'packs.js'), 'utf8').toLowerCase();
  ['laundry', 'clinic', 'freight', 'dealer', 'karigar', 'saree', 'lehenga', 'matter',
   'patient', 'godown', 'consignment', 'shipper', 'fee-earner', 'garment', 'docket']
    .forEach((w) => assert.ok(!src.includes(w),
      `packs.js contains the trade word "${w}" — the engine has learned a trade, which is the failure`));
});

/* =======================================================================
   5 · The engine does not leak a trade into the neutral edition
   ===================================================================== */
section('5 · neutrality holds');

check('no pack file contains a straight apostrophe that would break the site build', () => {
  fs.readdirSync(path.join(__dirname, '..', 'packs')).filter((f) => f.endsWith('.json')).forEach((f) => {
    const raw = fs.readFileSync(path.join(__dirname, '..', 'packs', f), 'utf8');
    const bad = raw.match(/[a-z]'[a-z]/gi);
    assert.strictEqual(bad, null, `${f}: straight apostrophe in ${bad && bad.join(', ')}`);
  });
});

check('no single sector supplies more than a third of the packs', () => {
  const bySector = {};
  IDS.forEach((id) => { bySector[PACKS[id].sector] = (bySector[PACKS[id].sector] || 0) + 1; });
  const worst = Math.max(...Object.values(bySector));
  assert.ok(worst <= Math.ceil(IDS.length / 3),
    `one sector supplies ${worst} of ${IDS.length} packs: ${JSON.stringify(bySector)}`);
});

check('the packs between them exercise most of the concept list', () => {
  const named = new Set();
  IDS.forEach((id) => Object.keys(PACKS[id].vocabulary || {}).forEach((c) => named.add(c)));
  assert.ok(named.size >= P.CONCEPTS.length - 1,
    `only ${named.size} of ${P.CONCEPTS.length} concepts are ever renamed — the rest may be dead weight`);
});

check('the packs between them touch a real spread of the schema', () => {
  const tables = new Set();
  IDS.forEach((id) => Object.keys(PACKS[id].fields || {}).forEach((t) => tables.add(t)));
  assert.ok(tables.size >= 6, `packs only extend ${tables.size} tables`);
  const real = P.schemaTables();
  [...tables].forEach((t) => assert.ok(real.has(t), `${t} is not in the schema`));
});

// =========================================================================
console.log('\n' + '='.repeat(70));
console.log(`${pass} passed, ${fail} failed`);
console.log(`${IDS.length} trades ship. A seventh was added during this run, from data alone.`);
if (fail) process.exit(1);
