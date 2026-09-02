'use strict';
/* THE DATABASE, AND THE ONE LINE THAT DECIDES WHETHER ISOLATION EXISTS.
 *
 * This loads core/schema.postgres.sql — the real production schema, all 151 tables — into a real
 * PostgreSQL. Not a mock, not a reimplementation: PGlite is PostgreSQL compiled to WASM and
 * `select version()` reports 18.3. It is a dependency in the lockfile, not a service, so the app
 * runs on a laptop with nothing installed and still gets real policies, real constraints and real
 * transactions.
 *
 * THIS IS NOT A STACK DECISION. brand/site/stack.js says the database is PostgreSQL and it still
 * is. In production this file opens a connection pool against a server instead; everything above
 * it is unchanged, because everything above it only ever calls withContext().
 *
 * WHY EVERY QUERY GOES THROUGH withContext()
 * A superuser bypasses every row-level policy — even on a table set to FORCE ROW LEVEL SECURITY.
 * That was measured against a running database in core/tests/live.test.js, not assumed:
 *
 *     connected as superuser / table owner   → BOTH companies visible
 *     the same, after FORCE ROW LEVEL SECURITY → BOTH companies visible
 *     connected as `authenticated`           → one
 *
 * So an application that talks to the database as itself has every policy in the schema and no
 * isolation whatsoever, and nothing about the running system looks wrong. Every screen works.
 * Every report returns numbers. One business is reading another's orders.
 *
 * The only defence is that business queries are physically unable to run as the owning role.
 * withContext() sets the tenant and the company, drops to `authenticated`, runs the caller's work,
 * and resets — and there is no other exported way to reach the data.
 *
 * FAILING CLOSED
 * An unset company does not mean "all companies". The policy is written so that an empty setting
 * matches nothing, and withContext() refuses to run at all without both values. Both halves
 * matter: the policy stops a mistake in this file, and this file stops a mistake in the policy.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const SCHEMA_PATH = path.join(ROOT, 'core', 'schema.postgres.sql');

let db = null;

/** The one connection. Opened once, on first use. */
async function open() {
  if (db) return db;
  /* Imported lazily and by dynamic import: PGlite is ESM, this file is CommonJS like the rest of
     the repository, and requiring it at module load would make every consumer async for no
     reason. */
  const { PGlite } = await import('@electric-sql/pglite');
  const { pgcrypto } = await import('@electric-sql/pglite/contrib/pgcrypto');

  db = await PGlite.create({ extensions: { pgcrypto } });
  await db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

  /* USAGE on the schema and the sequences, which the schema does not grant. Without these the app
     connects as a role that can reach no table at all — fail-safe, and useless.

     THEN THE DELETE, AND WHY THIS LINE IS NOT DECORATION.
     The design says a business record is closed or corrected, never deleted. The first version of
     this file expressed that by granting SELECT/INSERT/UPDATE and no DELETE, and claimed in a
     comment that the omission enforced the rule. It enforced nothing: core/schema.postgres.sql
     already runs `GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO authenticated` for every table,
     and a later GRANT cannot take away what an earlier one gave. The role had DELETE the whole
     time and the comment said otherwise — which is worse than not having the rule, because
     somebody reading this file would have stopped looking.

     A REVOKE actually removes it, and medhava/test/isolation.test.js issues a DELETE and requires
     it to be refused, so the claim now has to stay true. The schema and this file disagree on
     purpose: the schema grants what the PLATFORM may permit, this slice takes away what the
     APPLICATION permits. If deletes are ever allowed, delete this line rather than letting the
     two drift apart quietly. */
  await db.exec(`
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    REVOKE DELETE ON ALL TABLES IN SCHEMA public FROM authenticated;
  `);
  return db;
}

/** Seeding and migrations run as the owner. Business requests must never use this. */
async function asOwner(fn) {
  const d = await open();
  return fn(d);
}

class ContextError extends Error {}

/**
 * Run work as the application role, scoped to one tenant and one company.
 *
 * Nothing that serves a request may reach the database any other way. The caller gets a `q`
 * function and nothing else — no connection, no escape hatch.
 */
async function withContext(ctx, fn) {
  if (!ctx || !ctx.tenantId || !ctx.companyId) {
    /* Not a 500 and not an empty list. An empty list is the answer that looks like success and
       is the reason this check exists at all. */
    throw new ContextError(
      'refusing to query without both a tenant and a company. An unset context is not ' +
      '"everything" and it is not "nothing" — it is a bug, and returning rows for it is how one ' +
      'business ends up reading another.');
  }
  const d = await open();
  /* Parameters cannot be used for SET, so the two values are validated as UUIDs rather than
     escaped. Anything else never reaches the statement. */
  for (const [k, v] of [['tenant', ctx.tenantId], ['company', ctx.companyId]]) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v))) {
      throw new ContextError(`${k} id is not a uuid: ${JSON.stringify(v)}`);
    }
  }
  await d.exec(
    `RESET ROLE;
     SET app.current_tenant  = '${ctx.tenantId}';
     SET app.current_company = '${ctx.companyId}';
     SET ROLE authenticated;`);
  contextDepth++;
  try {
    return await fn((sql, params) => d.query(sql, params));
  } finally {
    contextDepth--;
    /* Always, including on the way out of a thrown error. A connection left as `authenticated`
       would break the next seeding call; a connection left as the OWNER would silently serve the
       next request with no isolation at all, which is far worse and completely invisible. */
    await d.exec('RESET ROLE');
  }
}

/**
 * The same as withContext, but everything inside it is ONE transaction.
 *
 * WHY THIS IS A SEPARATE FUNCTION AND NOT A FLAG
 * A sale is not one write. It deducts stock, raises an invoice and posts to the ledger, and rule
 * R05.2 says those happen together — while R05.3 says what must happen when the last of them
 * refuses: the stock never moved. Without a transaction there is no way to honour the second one.
 * The goods are gone, the books are untouched, and nothing in the running system looks wrong. The
 * stock report is simply short by one piece, and it stays short forever, because there is no
 * record of a sale to reconcile it against.
 *
 * That failure is silent, permanent, and found weeks later during a physical count. It is the
 * reason this exists before any screen that writes.
 *
 * ROLLBACK IS IN A finally, AND ALSO IN A catch
 * If the caller throws, the transaction is rolled back and the error is re-thrown unchanged — the
 * caller's error is the useful one and must not be replaced by a rollback error. If the ROLLBACK
 * itself fails there is nothing left to do but surface both.
 */
async function withTransaction(ctx, fn) {
  return withContext(ctx, async (q) => {
    await q('BEGIN');
    try {
      const out = await fn(q);
      await q('COMMIT');
      return out;
    } catch (e) {
      try { await q('ROLLBACK'); }
      catch (rollbackFailed) {
        e.rollbackAlsoFailed = rollbackFailed.message;
      }
      throw e;
    }
  });
}

/**
 * For the isolation screen: what the database holds regardless of who is asking.
 *
 * IT REFUSES TO RUN INSIDE A SCOPED CONTEXT, AND THAT IS THE WHOLE POINT.
 * PGlite is one connection. `SET ROLE authenticated` is connection state, so a godView called
 * while withContext is still on the stack runs AS `authenticated` and comes back scoped — a god
 * view that quietly is not one. It returns a smaller number, no error, and any check comparing
 * "what you can see" against "what is there" then compares a figure with itself and passes.
 *
 * That was not hypothetical: a planted defect in the sales numbering was supposed to be caught by
 * exactly such a comparison and was not, because the godView inside it had been scoped by the
 * surrounding transaction. The wrong answer was silent.
 *
 * Resetting the role here would be worse — it would silently unscope the caller's remaining
 * queries mid-transaction. So the honest move is to refuse, loudly, and let the caller restructure.
 */
let contextDepth = 0;

async function godView(sql, params) {
  if (contextDepth > 0) {
    throw new ContextError(
      'godView was called inside withContext/withTransaction. There is one connection, so it ' +
      'would run as the scoped role and return a scoped answer while calling itself a god view — ' +
      'silently, with no error and a plausible number. Take the call outside the context.');
  }
  return asOwner(async (d) => (await d.query(sql, params)).rows);
}

async function close() {
  if (db) { await db.close(); db = null; }
}

module.exports = { open, asOwner, withContext, withTransaction, godView, close, ContextError,
                   SCHEMA_PATH };
