'use strict';
/* WHAT THIS BUSINESS CHANGED AFTER THE PACK — the layer the documents promised and the engine
 * did not have.
 *
 * WHY THIS FILE EXISTS
 * brand/site/dynamic.js names six things and attributes every one of them to **Admin**, changed
 * in the app, taking effect the same minute:
 *
 *     vocabulary · stages · fields · documents · rules-on · modules-on
 *
 * The engine could express none of them at the tenant level. `term(pack, concept)` read the pack
 * and nothing else. `resolve(pack)` took one pack. `validate()` had no idea what a module was.
 * A pack is a file in core/packs/, so every one of those six was a code change by whoever owns
 * this repository — which is precisely what the design says configuring a business must never be.
 *
 * A promise a document makes and the code cannot keep is the beginning of a fabrication. This
 * closes it.
 *
 * WHAT AN OVERLAY IS
 * A pack is where a trade STARTS. An overlay is what this business changed afterwards, and it
 * obeys the same law as everything else here:
 *
 *   APPEND-ONLY.  A value is never overwritten. A change is a new entry carrying the date it
 *                 starts from and who made it. Resolving as of a past date gives what applied
 *                 then, so a closed month does not move because somebody renamed something today.
 *
 *   FUTURE-DATED ENTRIES SELF-ACTIVATE. An entry dated next month is stored now and simply
 *                 becomes the answer when that date arrives. Nobody has to remember.
 *
 *   NO MATCH IS AN ERROR, NEVER ZERO. Asking for a state before anything existed raises rather
 *                 than quietly returning the neutral default, because a silent default is how a
 *                 wrong number reaches a real person's payslip.
 *
 * WHAT AN OVERLAY MAY NEVER DO
 * Rename a word, add a field, reorder a stage, switch a discretionary rule, turn a module off —
 * all of that is theirs. Switching off the audit trail, company scoping, the posting rules or
 * the Platform module is not, and never becomes theirs by being asked twice.
 */

const path = require('node:path');

const CORE = __dirname;

class TenantError extends Error {}

/* ── what a module may never be ──────────────────────────────────────────────
   Module 01 is the spine: identity, permissions, settings and the audit trail. A business that
   could switch it off could switch off the record of having switched it off. */
const MODULE_ALWAYS_ON = ['01'];
const MODULE_ALWAYS_ON_SET = new Set(MODULE_ALWAYS_ON);

/* The module list lives on the brand side because the documents render from it. If it is ever
   absent — a trimmed deployment — module switching is refused rather than silently accepted,
   which is the safe direction and the same choice packs.js makes about the rulebook. */
let _modules = null;
function moduleIds() {
  if (_modules) return _modules;
  try {
    const mods = require(path.join(CORE, '..', 'brand', 'site', 'modules.js'));
    _modules = new Set(mods.map((m) => m.n));
  } catch (_) {
    _modules = new Set();
  }
  return _modules;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (s) => typeof s === 'string' && DATE.test(s) && !Number.isNaN(Date.parse(s));

/* ── validating one entry ────────────────────────────────────────────────── */

/** Everything wrong with one overlay entry, as a list. Empty means it is acceptable. */
function validateEntry(entry, opts) {
  const o = opts || {};
  const p = [];
  const at = (entry && entry.from) || '(no date)';

  if (!entry || typeof entry !== 'object') return ['not an object'];

  if (!entry.tenant_id || typeof entry.tenant_id !== 'string') {
    p.push(`${at}: no tenant_id — an unowned change cannot be scoped or audited`);
  }
  if (!isDate(entry.from)) {
    p.push(`${at}: "from" must be a YYYY-MM-DD date — a change with no start date cannot be ` +
      `resolved as of any moment, which is the whole mechanism`);
  }
  if (!entry.by || typeof entry.by !== 'string') {
    p.push(`${at}: no "by" — every change records who made it, or the audit trail has a hole ` +
      `exactly where somebody would look`);
  }

  /* An overlay is DATA, the same as a pack. A function inside one would make changing a word a
     code deployment again, which is the thing this file exists to end. */
  (function noCode(node, trail) {
    if (typeof node === 'function') { p.push(`${at}: contains a function at ${trail} — an overlay is data`); return; }
    if (node && typeof node === 'object') {
      Object.keys(node).forEach((k) => noCode(node[k], trail ? trail + '.' + k : k));
    }
  })(entry, '');

  /* vocabulary — only concepts the engine has */
  const concepts = o.concepts || new Set();
  Object.keys(entry.vocabulary || {}).forEach((k) => {
    if (concepts.size && !concepts.has(k)) {
      p.push(`${at}: vocabulary names "${k}", which is not a concept this engine has`);
    } else if (typeof entry.vocabulary[k] !== 'string' || !entry.vocabulary[k].trim()) {
      p.push(`${at}: vocabulary "${k}" must be a non-empty word`);
    }
  });

  /* modules — real module numbers, and never the spine */
  const known = moduleIds();
  const mods = entry.modules || {};
  Object.keys(mods).forEach((n) => {
    if (known.size && !known.has(n)) {
      p.push(`${at}: modules mention "${n}", which is not a module`);
    }
    const v = mods[n];
    const off = v === false || (v && v.on === false);
    if (off && MODULE_ALWAYS_ON_SET.has(n)) {
      p.push(`${at}: tries to switch off module ${n}, which is the spine — identity, ` +
        `permissions, settings and the audit trail. A business that could switch it off could ` +
        `switch off the record of having done so`);
    }
    if (v !== true && v !== false && !(v && typeof v === 'object' && typeof v.on === 'boolean')) {
      p.push(`${at}: modules.${n} must be true, false, or { on: boolean }`);
    }
  });

  /* rules — real ids, and nothing immutable switched off */
  const ruleIds = o.ruleIds || new Set();
  const immutable = o.immutable || new Set();
  Object.keys(entry.rules || {}).forEach((id) => {
    if (ruleIds.size && !ruleIds.has(id)) {
      p.push(`${at}: rules mention "${id}", which is not in the rulebook`);
    }
    const v = entry.rules[id];
    const off = v === false || (v && v.enabled === false);
    if (off && immutable.has(id)) {
      p.push(`${at}: tries to switch off ${id}, which nobody may switch off`);
    }
  });

  /* stages — ordered, unique, and they still have to end somewhere */
  Object.keys(entry.stages || {}).forEach((pipeline) => {
    const list = entry.stages[pipeline];
    if (!Array.isArray(list) || !list.length) {
      p.push(`${at}: stages.${pipeline} must be a non-empty list`); return;
    }
    const keys = new Set();
    list.forEach((s, i) => {
      if (!s || !s.key || !s.name) p.push(`${at}: stages.${pipeline}[${i}] needs a key and a name`);
      if (s && s.key && keys.has(s.key)) p.push(`${at}: stages.${pipeline} repeats "${s.key}"`);
      if (s && s.key) keys.add(s.key);
    });
    if (!list.some((s) => s && s.terminal)) {
      p.push(`${at}: stages.${pipeline} has no terminal stage — work put into it could never leave`);
    }
  });

  return p;
}

/* ── the log ─────────────────────────────────────────────────────────────── */

/** Accept an entry onto the log. Append-only: the log is returned as a NEW array, sorted by
 *  date, and nothing already in it is altered. */
function append(entries, entry, opts) {
  const problems = validateEntry(entry, opts);
  if (problems.length) {
    throw new TenantError(`overlay entry refused:\n  ${problems.join('\n  ')}`);
  }
  const next = (entries || []).concat([JSON.parse(JSON.stringify(entry))]);
  next.sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0));
  return Object.freeze(next.map((e) => Object.freeze(e)));
}

/** The entries in force at a moment: everything dated on or before it. */
function inForce(entries, asOf) {
  if (!isDate(asOf)) throw new TenantError(`"${asOf}" is not a YYYY-MM-DD date`);
  return (entries || []).filter((e) => e.from <= asOf);
}

/** The merged overlay as of a date: later entries win, key by key.
 *
 *  Deliberately NOT a deep merge of everything. Vocabulary, rules and modules merge per key,
 *  because those are independent settings. Stages and documents REPLACE wholesale, because a
 *  half-merged pipeline is a pipeline nobody designed — if a business reorders its stages it is
 *  stating the new order, not contributing to one. */
function resolveOverlay(entries, asOf) {
  const live = inForce(entries, asOf);
  const out = { vocabulary: {}, rules: {}, modules: {}, fields: {}, stages: {}, documents: null, sources: [] };
  for (const e of live) {
    Object.assign(out.vocabulary, e.vocabulary || {});
    Object.assign(out.rules, e.rules || {});
    Object.assign(out.modules, e.modules || {});
    Object.keys(e.fields || {}).forEach((t) => {
      out.fields[t] = (out.fields[t] || []).concat(e.fields[t]);
    });
    Object.keys(e.stages || {}).forEach((pipe) => { out.stages[pipe] = e.stages[pipe]; });
    if (e.documents) out.documents = e.documents;
    out.sources.push({ from: e.from, by: e.by });
  }
  return out;
}

/** Is a module on for this business as of a date?
 *
 *  A module the overlay never mentions is ON: the module list is the default and the overlay is
 *  an exception list, never a permission list. Getting that backwards would mean a module added
 *  next year silently appears for nobody. */
function moduleOn(entries, n, asOf) {
  if (MODULE_ALWAYS_ON_SET.has(n)) return { on: true, immutable: true };
  const v = resolveOverlay(entries, asOf).modules[n];
  if (v === undefined) return { on: true, immutable: false };
  if (typeof v === 'boolean') return { on: v, immutable: false };
  return { on: v.on !== false, immutable: false };
}

/** Every change ever made to one thing, oldest first — what an auditor asks for.
 *  Superseded is not deleted: an entry that no longer wins is still in the answer, marked. */
function history(entries, area, key) {
  const rows = [];
  (entries || []).forEach((e) => {
    const bag = e[area];
    if (!bag) return;
    const has = Array.isArray(bag) ? false : Object.prototype.hasOwnProperty.call(bag, key);
    if (!has) return;
    rows.push({ from: e.from, by: e.by, value: bag[key] });
  });
  if (!rows.length) {
    /* No match is an error, never zero. */
    throw new TenantError(`nothing has ever set ${area}.${key} — that is not the same as it ` +
      `being unset, and returning a default here would hide the difference`);
  }
  return rows.map((r, i) => Object.assign({}, r, { superseded: i < rows.length - 1 }));
}

module.exports = {
  TenantError, MODULE_ALWAYS_ON,
  validateEntry, append, inForce, resolveOverlay, moduleOn, history, moduleIds,
};
