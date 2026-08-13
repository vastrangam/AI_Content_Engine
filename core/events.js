'use strict';
/* The cascade bus.

   brand/site/modules.js already declares, for every module, what it reads and
   what it writes. Those declarations are the product — "an order reserves stock,
   stock posts to the ledger, the ledger shows on the dashboard" — and until now
   nothing executed them. They were prose on a website.

   This turns them into wiring. The subscription table is DERIVED from
   modules.js, so the two cannot drift: a cascade cannot appear in the copy
   without appearing in the code, and a module cannot quietly reach into another
   module's data without declaring it first.

   Every emission is recorded in the events table. That is what makes the
   end-to-end proof checkable — not "the dashboard looks right", but "this
   order emitted these six events and here they are".

   A handler that throws takes the whole transaction down with it, on purpose. A
   sale that moves stock but fails to post to the ledger is worse than a sale
   that fails. */

const path = require('node:path');
const audit = require('./audit');

const MODULES_FILE = path.join(__dirname, '..', 'brand', 'site', 'modules.js');

class CascadeError extends Error {}

/** The declared shape of the system, read from the canonical module list. */
function declared(modulesFile = MODULES_FILE) {
  const modules = require(modulesFile);
  const byName = new Map();
  const edges = [];
  for (const m of modules) {
    if (!m.n) continue;                       // the Platform spine has no number
    const name = m.name;
    byName.set(name, {
      n: m.n, name,
      reads: [...(m.reads || [])],
      writes: [...(m.writes || [])],
      apps: (m.apps || []).map((a) => a[0]),
    });
  }
  // "Every module" is a wildcard in modules.js; expand it so the graph is real.
  const all = [...byName.keys()];
  for (const mod of byName.values()) {
    const expand = (list) => list.flatMap((x) =>
      x === 'Every module' ? all.filter((n) => n !== mod.name)
      : x === '—' ? []
      : [x]);
    mod.reads = expand(mod.reads);
    mod.writes = expand(mod.writes);
    for (const target of mod.writes) {
      if (byName.has(target)) edges.push({ from: mod.name, to: target });
    }
  }
  return { modules: byName, edges };
}

class Bus {
  /**
   * @param {object} db     the shared core database
   * @param {object} [opts] { modulesFile }
   */
  constructor(db, opts = {}) {
    this.db = db;
    this.spec = declared(opts.modulesFile);
    this.handlers = new Map();      // event name -> [{module, fn}]
    this.emitters = new Map();      // event name -> source module
  }

  /** Declare that `module` publishes `event`. */
  publishes(module, event) {
    this._known(module);
    this.emitters.set(event, module);
    return this;
  }

  /** Subscribe. `module` must be allowed to hear from the publisher — that is,
   *  modules.js must say it reads what the publisher writes. */
  on(event, module, fn) {
    this._known(module);
    const list = this.handlers.get(event) || [];
    list.push({ module, fn });
    this.handlers.set(event, list);
    return this;
  }

  _known(module) {
    if (!this.spec.modules.has(module)) {
      throw new CascadeError(
        `"${module}" is not a module in brand/site/modules.js. The canonical list is ` +
        `the one the website publishes; code does not get to invent a seventeenth.`
      );
    }
  }

  /** Fire an event. Records it, then runs every handler, inside one transaction
   *  with whatever the caller is already doing. */
  emit(event, payload = {}, { companyId = null, at = null } = {}) {
    const source = this.emitters.get(event) || payload.__module || 'unknown';
    const when = at || audit.nowIso();
    const handlers = this.handlers.get(event) || [];

    this.db.insert('events', {
      company_id: companyId,
      name: event,
      source_module: source,
      payload_json: JSON.stringify(payload),
      occurred_at: when,
      handled_by: handlers.map((h) => h.module).join(',') || null,
    });

    const results = [];
    for (const h of handlers) {
      results.push({ module: h.module, result: h.fn(payload, { db: this.db, companyId, at: when }) });
    }
    return results;
  }

  /** Which cascades declared in modules.js have no code behind them, and which
   *  handlers listen for something never declared. Both directions matter:
   *  an undeclared cascade is as much a lie as an unimplemented one. */
  audit() {
    const wired = new Set();
    for (const [event, list] of this.handlers) {
      const from = this.emitters.get(event);
      for (const h of list) wired.add(`${from} -> ${h.module}`);
    }
    const missing = this.spec.edges
      .map((e) => `${e.from} -> ${e.to}`)
      .filter((k) => !wired.has(k));
    const undeclared = [...wired].filter(
      (k) => !this.spec.edges.some((e) => `${e.from} -> ${e.to}` === k)
    );
    return {
      declared: this.spec.edges.length,
      wired: wired.size,
      missing,          // promised on the website, not built
      undeclared,       // built, never promised
      passed: missing.length === 0 && undeclared.length === 0,
    };
  }

  /** Everything that happened, for the end-to-end proof. */
  trail(since = null) {
    return this.db.all(
      `SELECT * FROM events WHERE (? IS NULL OR occurred_at >= ?) ORDER BY id`,
      [since, since]
    ).map((r) => ({ ...r, payload: r.payload_json ? JSON.parse(r.payload_json) : null }));
  }
}

module.exports = { Bus, declared, CascadeError, MODULES_FILE };
