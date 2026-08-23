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

/** Everything a screen needs to render itself for this trade, in one call. */
function resolve(pack) {
  const vocab = {};
  CONCEPTS.forEach((c) => { vocab[c] = term(pack, c); });
  return {
    id: pack.id,
    name: pack.name,
    sector: pack.sector,
    vocabulary: vocab,
    pipelines: Object.keys(pack.stages || {}),
    tablesExtended: Object.keys(pack.fields || {}),
    documents: documents(pack).map((d) => d.key),
    rulesChanged: Object.keys(pack.rules || {}),
    seedCounts: Object.keys(pack.seed || {}).reduce((a, k) => {
      a[k] = (pack.seed[k] || []).length; return a;
    }, {}),
  };
}

module.exports = {
  CONCEPTS, IMMUTABLE, FIELD_TYPES, PackError,
  validate, load, loadAll,
  term, stages, fields, documents, ruleState, seed, resolve,
  schemaTables, ruleIds,
};
