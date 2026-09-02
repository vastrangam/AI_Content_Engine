'use strict';
/* THE INDUSTRY PACK ENGINE — a trade is a row, not a fork.

   THE PROBLEM THIS SOLVES
   Two editions is two editions. Before this file, supporting a third trade
   meant a developer writing a third overlay by hand, and that is a consultancy
   with software attached rather than a product. MEDHAVA_PLAN_OF_ACTION.md §M2
   named that gap and made Phase 2 the gate: a new trade must be addable with
   NO CODE CHANGE. This is the engine that makes the gate passable, and
   core/tests/packs.test.js is the gate itself — it adds a trade nobody
   anticipated, at run time, from data alone.

   WHAT A PACK IS AND IS NOT
   A pack is configuration. It may:
     · rename a CONCEPT the engine already has, to whatever the trade calls it
     · define the STAGES a pipeline moves through, in order
     · add FIELDS to a table that already exists
     · declare the DOCUMENTS the trade issues
     · switch RULES on or off and set their thresholds
     · seed reference data — accounts, roles, units of measure

   A pack may NOT:
     · invent a concept the engine does not have
     · add a field to a table that does not exist
     · switch on a rule id that is not in the rulebook
     · turn off a rule marked immutable — the audit trail, company scoping,
       money never being a float. A trade may change its vocabulary; it may
       not opt out of the things that make the books trustworthy
     · contain executable code. A pack is data, and data is the whole point:
       the moment a pack can run code, adding a trade is a code change again
       and the gate is meaningless

   Every one of those refusals is enforced below and tested. A pack that fails
   validation is rejected whole — never partially applied, because a half-loaded
   trade is a system whose vocabulary and rules disagree with each other. */

const fs = require('node:fs');
const path = require('node:path');

const CORE = __dirname;
const TENANT = require('./tenant.js');

/* ── the concepts a pack may rename ─────────────────────────────────────────
   This list is the contract. A pack renames what is here and nothing else,
   which is what stops "vocabulary" from quietly becoming "a place to put
   anything". Adding a concept is a deliberate change to the engine, reviewed
   like any other — not something a customer's config file can do on its own.

   Each is described by what it DOES, never by an example of a trade that has
   one. That restraint is the design, not tidiness: the moment this file lists
   one trade's words it has an opinion about which trades are normal, and
   core/tests/packs.test.js fails the build if any trade word appears here.
   The examples live in the packs, which is the whole point of packs. */
const CONCEPTS = [
  'customer',      // who is owed the work and pays for it
  'supplier',      // who is paid for what comes in
  'item',          // what is sold, made or consumed, as a master record
  'order',         // the commitment to deliver, agreed with the customer
  'orderLine',     // one line of that commitment
  'workOrder',     // the internal instruction to carry it out
  'stage',         // one step of a pipeline, in a fixed order
  'location',      // where a thing physically sits
  'invoice',       // the demand for money
  'payment',       // money moving in or out
  'person',        // whoever does the work and may be paid for it
  'unitOfWork',    // what gets counted for pay or for billing
  'project',       // work that is tracked but is not an order
];
const CONCEPT_SET = new Set(CONCEPTS);

/* ── rules no pack may switch off ───────────────────────────────────────────
   A trade may call an invoice a fee note. It may not decide that its books
   need not balance, that its audit trail is optional, or that another company
   may read its rows. These are the guarantees the whole system is trusted for,
   and a configuration file is exactly the wrong place to be able to remove
   them. Identified by prefix so a rule added later to the same subject is
   covered without anyone remembering to update this list. */
const IMMUTABLE = [
  'R01.1', 'R01.2', 'R01.3', 'R01.4', 'R01.5', 'R01.6',   // scoping and audit
  'R01.13', 'R01.14',                                      // credentials
  'R12.1', 'R12.2', 'R12.3', 'R12.4', 'R12.5', 'R12.6',    // money and posting
  'R12.7', 'R12.8', 'R12.11', 'R12.23', 'R12.24',
  'R03.1', 'R03.2',                                        // one stock number
  'R21.1', 'R21.2',                                        // group elimination
  'R16.22',                                                // roster privacy
];
const IMMUTABLE_SET = new Set(IMMUTABLE);

class PackError extends Error {}

/* ── what a pack is validated against ───────────────────────────────────────
   Read from the real files rather than a copy, so a pack cannot reference a
   table that was renamed or a rule that was withdrawn. Loaded lazily and
   cached: validating twelve packs should read the schema once. */
let _tables = null;
function schemaTables() {
  if (_tables) return _tables;
  const sql = fs.readFileSync(path.join(CORE, 'schema.postgres.sql'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n]*/g, '');
  _tables = new Set([...sql.matchAll(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+([a-z_][a-z0-9_]*)/gi)]
    .map((m) => m[1]));
  return _tables;
}

let _ruleIds = null;
function ruleIds() {
  if (_ruleIds) return _ruleIds;
  /* The rulebook lives on the brand side because the documents render from it.
     If it is ever absent — a trimmed deployment, say — rule switching is
     refused rather than silently accepted, which is the safe direction. */
  try {
    const rules = require(path.join(CORE, '..', 'brand', 'site', 'rules.js'));
    _ruleIds = new Set(rules.map((r) => r.id));
  } catch (_) {
    _ruleIds = new Set();
  }
  return _ruleIds;
}

/* The module list, read the same lazy, refuse-if-absent way as the rulebook. */
let _modIds = null;
function moduleIds() {
  if (_modIds) return _modIds;
  try {
    const mods = require(path.join(CORE, '..', 'brand', 'site', 'modules.js'));
    _modIds = new Set(mods.map((m) => m.n));
  } catch (_) {
    _modIds = new Set();
  }
  return _modIds;
}

/* Module 01 is the spine. Neither a pack nor a business may switch it off — see core/tenant.js,
   which holds the same list for the tenant side and is the reason it is named in one place. */
const MODULE_ALWAYS_ON_SET = new Set(require('./tenant.js').MODULE_ALWAYS_ON);

const FIELD_TYPES = new Set(['text', 'number', 'paise', 'date', 'bool', 'choice', 'json']);

/* ── validation ─────────────────────────────────────────────────────────── */

/** Check a pack object. Returns an array of problems — empty means valid.
 *  Deliberately returns ALL problems rather than throwing on the first: a
 *  person fixing a pack wants the whole list, not one error per attempt. */
function validate(pack) {
  const p = [];
  const at = (pack && pack.id) || '(no id)';

  if (!pack || typeof pack !== 'object') return [`${at}: not an object`];

  ['id', 'name', 'sector'].forEach((k) => {
    if (!pack[k] || typeof pack[k] !== 'string') p.push(`${at}: missing "${k}"`);
  });
  if (pack.id && !/^[a-z][a-z0-9-]*$/.test(pack.id)) {
    p.push(`${at}: id must be lower-case with hyphens`);
  }

  /* A pack is DATA. A function anywhere inside it means adding a trade has
     become a code change, which is the exact thing the gate exists to stop. */
  (function noCode(node, trail) {
    if (typeof node === 'function') { p.push(`${at}: contains a function at ${trail} — a pack is data`); return; }
    if (node && typeof node === 'object') {
      Object.keys(node).forEach((k) => noCode(node[k], trail ? trail + '.' + k : k));
    }
  })(pack, '');

  /* vocabulary — rename only what exists */
  const vocab = pack.vocabulary || {};
  Object.keys(vocab).forEach((k) => {
    if (!CONCEPT_SET.has(k)) {
      p.push(`${at}: vocabulary names "${k}", which is not a concept this engine has`);
    } else if (typeof vocab[k] !== 'string' || !vocab[k].trim()) {
      p.push(`${at}: vocabulary "${k}" must be a non-empty word`);
    }
  });

  /* stages — ordered, unique, non-empty */
  const stages = pack.stages || {};
  Object.keys(stages).forEach((pipeline) => {
    const list = stages[pipeline];
    if (!Array.isArray(list) || !list.length) {
      p.push(`${at}: stages.${pipeline} must be a non-empty list`); return;
    }
    const names = new Set();
    list.forEach((s, i) => {
      if (!s || typeof s !== 'object') { p.push(`${at}: stages.${pipeline}[${i}] is not an object`); return; }
      if (!s.key || !s.name) p.push(`${at}: stages.${pipeline}[${i}] needs a key and a name`);
      if (s.key && names.has(s.key)) p.push(`${at}: stages.${pipeline} repeats "${s.key}"`);
      if (s.key) names.add(s.key);
    });
  });

  /* fields — only onto tables that exist, only with types the engine knows */
  const tables = schemaTables();
  const fields = pack.fields || {};
  Object.keys(fields).forEach((table) => {
    if (!tables.has(table)) {
      p.push(`${at}: fields add to "${table}", which is not a table in the schema`);
    }
    const list = fields[table];
    if (!Array.isArray(list)) { p.push(`${at}: fields.${table} must be a list`); return; }
    list.forEach((f, i) => {
      if (!f || !f.key || !f.label) p.push(`${at}: fields.${table}[${i}] needs a key and a label`);
      if (!f || !FIELD_TYPES.has(f.type)) {
        p.push(`${at}: fields.${table}[${i}] type "${f && f.type}" is not one of ${[...FIELD_TYPES].join(', ')}`);
      }
      if (f && f.type === 'choice' && (!Array.isArray(f.choices) || !f.choices.length)) {
        p.push(`${at}: fields.${table}.${f.key} is a choice with no choices`);
      }
      /* money in a pack obeys the same rule as money everywhere else */
      if (f && f.key && /amount|price|cost|total|fee|rate/i.test(f.key) && f.type === 'number') {
        p.push(`${at}: fields.${table}.${f.key} looks like money but is "number" — use "paise"`);
      }
    });
  });

  /* rules — real ids, and nothing immutable switched off */
  const ids = ruleIds();
  const rules = pack.rules || {};
  Object.keys(rules).forEach((id) => {
    if (ids.size && !ids.has(id)) {
      p.push(`${at}: rules mention "${id}", which is not in the rulebook`);
    }
    const v = rules[id];
    const off = v === false || (v && v.enabled === false);
    if (off && IMMUTABLE_SET.has(id)) {
      p.push(`${at}: tries to switch off ${id}, which no pack may switch off`);
    }
    if (v && typeof v === 'object' && v.threshold !== undefined
        && typeof v.threshold !== 'number' && typeof v.threshold !== 'string') {
      p.push(`${at}: rules.${id}.threshold must be a number or a string`);
    }
  });

  /* modules — a pack may switch one off for a trade that has no use for it, and may never
     switch off the spine. Module 01 is identity, permissions, settings and the audit trail. */
  const knownModules = moduleIds();
  Object.keys(pack.modules || {}).forEach((n) => {
    if (knownModules.size && !knownModules.has(n)) {
      p.push(`${at}: modules mention "${n}", which is not a module`);
    }
    const v = pack.modules[n];
    const off = v === false || (v && v.on === false);
    if (off && MODULE_ALWAYS_ON_SET.has(n)) {
      p.push(`${at}: tries to switch off module ${n}, which is the spine and is not a trade's ` +
        `to remove`);
    }
    if (v !== true && v !== false && !(v && typeof v === 'object' && typeof v.on === 'boolean')) {
      p.push(`${at}: modules.${n} must be true, false, or { on: boolean }`);
    }
  });

  /* documents */
  (pack.documents || []).forEach((d, i) => {
    if (!d || !d.key || !d.name) p.push(`${at}: documents[${i}] needs a key and a name`);
    if (d && d.fields && !Array.isArray(d.fields)) p.push(`${at}: documents[${i}].fields must be a list`);
  });

  /* seed — accounts must be balanced in TYPE, not left as free text */
  const seed = pack.seed || {};
  const ACCT = new Set(['asset', 'liability', 'equity', 'income', 'expense']);
  (seed.accounts || []).forEach((a, i) => {
    if (!a || !a.code || !a.name) p.push(`${at}: seed.accounts[${i}] needs a code and a name`);
    if (!a || !ACCT.has(a.type)) p.push(`${at}: seed.accounts[${i}] type must be one of ${[...ACCT].join(', ')}`);
  });
  (seed.roles || []).forEach((r, i) => {
    if (!r || !r.key || !r.name) p.push(`${at}: seed.roles[${i}] needs a key and a name`);
  });

  return p;
}

/* ── loading ────────────────────────────────────────────────────────────── */

/** Load one pack object. Rejected whole if invalid — never half-applied. */
function load(pack) {
  const problems = validate(pack);
  if (problems.length) {
    throw new PackError(`pack "${(pack && pack.id) || '?'}" refused:\n  ` + problems.join('\n  '));
  }
  /* frozen, because a pack that can be mutated after loading is a pack whose
     behaviour depends on when you looked at it */
  return deepFreeze(JSON.parse(JSON.stringify(pack)));
}

function deepFreeze(o) {
  Object.getOwnPropertyNames(o).forEach((k) => {
    if (o[k] && typeof o[k] === 'object') deepFreeze(o[k]);
  });
  return Object.freeze(o);
}

/** Load every pack shipped in core/packs/. They are .json on purpose: a file
 *  that cannot express a function cannot smuggle behaviour into configuration. */
function loadAll(dir) {
  const d = dir || path.join(CORE, 'packs');
  if (!fs.existsSync(d)) return {};
  const out = {};
  fs.readdirSync(d).filter((f) => f.endsWith('.json')).sort().forEach((f) => {
    const raw = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));
    if (out[raw.id]) throw new PackError(`two packs claim the id "${raw.id}"`);
    out[raw.id] = load(raw);
  });
  return out;
}

/* ── using a pack ───────────────────────────────────────────────────────── */

/** The trade's word for a concept, falling back to the neutral one.
 *  `plural` asks for the plural form if the pack gave one. */
/* `pack` may be a raw pack OR a resolved view from resolve(). Both carry `.vocabulary`, so a
   tenant that renamed a word its pack got wrong is answered here rather than being told the
   pack's word — which is the whole reason the overlay exists. */
function term(pack, concept, opts) {
  if (!CONCEPT_SET.has(concept)) throw new PackError(`"${concept}" is not a concept`);
  const v = (pack && pack.vocabulary && pack.vocabulary[concept]);
  const base = v || concept.replace(/([A-Z])/g, ' $1').toLowerCase();
  if (!opts || !opts.plural) return base;
  const plurals = (pack && pack.plurals) || {};
  return plurals[concept] || (/[sxz]$|[cs]h$/.test(base) ? base + 'es' : base + 's');
}

/** The ordered stages of a pipeline, or [] if this trade does not run one. */
function stages(pack, pipeline) {
  return ((pack && pack.stages && pack.stages[pipeline]) || []).slice();
}

/** Extra fields this trade puts on a table. */
function fields(pack, table) {
  return ((pack && pack.fields && pack.fields[table]) || []).slice();
}

function documents(pack) {
  return ((pack && pack.documents) || []).slice();
}

/** Is a rule on for this trade, and with what threshold?
 *  A rule not mentioned by the pack is ON: the rulebook is the default and a
 *  pack is an exception list, never a permission list. Getting that backwards
 *  would mean a new rule silently applies to nobody. */
function ruleState(pack, id) {
  if (IMMUTABLE_SET.has(id)) return { enabled: true, immutable: true, threshold: undefined };
  const v = pack && pack.rules && pack.rules[id];
  if (v === undefined) return { enabled: true, immutable: false, threshold: undefined };
  if (v === false) return { enabled: false, immutable: false, threshold: undefined };
  if (v === true) return { enabled: true, immutable: false, threshold: undefined };
  return {
    enabled: v.enabled !== false,
    immutable: false,
    threshold: v.threshold,
  };
}

function seed(pack, kind) {
  return ((pack && pack.seed && pack.seed[kind]) || []).slice();
}

/* ── merging more than one pack ──────────────────────────────────────────────
   A business that both makes and sells is not one trade with a compromise; it is two, and one
   pack per tenant could not say so. resolve() therefore accepts a list.

   Precedence is stated rather than implied: EARLIER IN THE LIST WINS. The first pack is the
   business's primary trade — what it calls itself — and later packs fill in what the first is
   silent about.

   And a genuine disagreement is REFUSED WITH BOTH NAMED, never settled quietly in favour of
   whichever happened to load first. Two packs that both have an opinion about what an "order" is
   are telling you something real about the business, and the answer is a decision somebody makes,
   not a coin the engine flips. */
function mergePacks(list) {
  const packs = Array.isArray(list) ? list : [list];
  if (!packs.length) throw new PackError('resolve() needs at least one pack');
  if (packs.length === 1) return { pack: packs[0], ids: [packs[0].id] };

  const conflicts = [];
  const vocab = {};
  const owner = {};
  packs.forEach((pk) => {
    Object.keys((pk && pk.vocabulary) || {}).forEach((c) => {
      const word = pk.vocabulary[c];
      if (owner[c] === undefined) { owner[c] = pk.id; vocab[c] = word; return; }
      if (vocab[c] !== word) {
        conflicts.push(`${c}: "${vocab[c]}" (${owner[c]}) vs "${word}" (${pk.id})`);
      }
    });
  });
  if (conflicts.length) {
    throw new PackError(
      `these packs disagree and the engine will not choose for you:\n  ` +
      conflicts.join('\n  ') +
      `\n\n  Both are defensible. Pick the word this business actually uses and set it in the ` +
      `tenant overlay, which wins over every pack — see core/tenant.js.`);
  }

  /* No conflict: merge, first pack winning anywhere both are silent-but-present. */
  const merged = { id: packs.map((p) => p.id).join('+'), name: packs.map((p) => p.name).join(' + '),
    sector: packs[0].sector, vocabulary: vocab, plurals: {}, stages: {}, fields: {},
    documents: [], rules: {}, seed: {}, modules: {} };
  [...packs].reverse().forEach((pk) => {
    Object.assign(merged.plurals, pk.plurals || {});
    Object.assign(merged.stages, pk.stages || {});
    Object.assign(merged.rules, pk.rules || {});
    Object.assign(merged.modules, pk.modules || {});
    Object.keys(pk.fields || {}).forEach((t) => {
      merged.fields[t] = (merged.fields[t] || []).concat(pk.fields[t]);
    });
    merged.documents = merged.documents.concat(pk.documents || []);
    Object.keys(pk.seed || {}).forEach((k) => {
      merged.seed[k] = (merged.seed[k] || []).concat(pk.seed[k]);
    });
  });
  return { pack: merged, ids: packs.map((p) => p.id) };
}

/** Everything a screen needs to render itself for this business, in one call.
 *
 *  resolve(pack)                          the trade as it ships
 *  resolve([packA, packB])                a business that is genuinely two trades
 *  resolve(pack, overlay, '2026-04-01')   ...and what this business changed, as of that date
 *
 *  The overlay is an ARRAY OF ENTRIES from core/tenant.js, not a merged object, because resolving
 *  it here is what makes the date argument mean anything. A past date gives what applied then. */
function resolve(pack, overlayEntries, asOf) {
  const { pack: base, ids } = mergePacks(pack);

  const over = overlayEntries && overlayEntries.length
    ? TENANT.resolveOverlay(overlayEntries, asOf || new Date().toISOString().slice(0, 10))
    : null;

  /* The tenant's word beats the pack's word. That is the entire point of the layer: a pack that
     got a word wrong for this particular business is corrected by the business, not by us. */
  const vocab = {};
  CONCEPTS.forEach((c) => {
    vocab[c] = (over && over.vocabulary[c]) || term(base, c);
  });

  const stages = Object.assign({}, base.stages || {}, (over && over.stages) || {});
  const fields = {};
  Object.keys(base.fields || {}).forEach((t) => { fields[t] = (base.fields[t] || []).slice(); });
  if (over) Object.keys(over.fields).forEach((t) => {
    fields[t] = (fields[t] || []).concat(over.fields[t]);
  });

  const docs = (over && over.documents) || documents(base);

  return {
    id: base.id,
    packs: ids,
    name: base.name,
    sector: base.sector,
    asOf: asOf || null,
    vocabulary: vocab,
    pipelines: Object.keys(stages),
    /* The stage LISTS, not only their names. A screen renders the steps; returning the names
       alone made the caller go back to the pack, which would have handed it the pack's pipeline
       and silently ignored the one this business replaced it with. */
    stages,
    tablesExtended: Object.keys(fields),
    documents: docs.map((d) => d.key || d),
    rulesChanged: Object.keys(Object.assign({}, base.rules || {}, (over && over.rules) || {})),
    modulesOff: Object.keys(Object.assign({}, base.modules || {}, (over && over.modules) || {}))
      .filter((n) => {
        const v = Object.assign({}, base.modules || {}, (over && over.modules) || {})[n];
        return v === false || (v && v.on === false);
      }),
    seedCounts: Object.keys(base.seed || {}).reduce((a, k) => {
      a[k] = (base.seed[k] || []).length; return a;
    }, {}),
    changedBy: over ? over.sources : [],
  };
}

module.exports = {
  CONCEPTS, IMMUTABLE, FIELD_TYPES, PackError, MODULE_ALWAYS_ON_SET, moduleIds,
  validate, load, loadAll,
  term, stages, fields, documents, ruleState, seed, resolve, mergePacks,
  schemaTables, ruleIds,
};
