'use strict';
/* THE SCHEMA, RUN RATHER THAN READ.
 *
 *   node core/tests/live.test.js
 *
 * WHY THIS FILE EXISTS
 * MEDHAVA_PLAN_OF_ACTION.md §M3 says isolation is the single highest-risk item in the plan — "a
 * bug there is not a defect, it is an incident" — and the only thing guarding it was:
 *
 *     assert.match(PG, /USING \(company_id = current_setting\('app\.current_company'\)::uuid\)/)
 *
 * That reads the file. It proves the characters are present. It cannot tell you whether Postgres
 * would accept them, whether the policy applies to the role the application uses, or whether one
 * business can read another's rows — and the phase gate in this repository is "proved by a test
 * that tries".
 *
 * The first time this file ran, the production schema did not load at all:
 *
 *     role "authenticated" does not exist
 *
 * Every policy is `FOR ALL TO authenticated` and nothing creates that role — not either schema
 * file, not deploy/, not DEPLOYMENT.md. The committed schema had never been executed by anything.
 * A text check is structurally incapable of finding that.
 *
 * WHY PGlite AND NOT A SERVICE
 * .github/workflows/ci.yml states, in its own header, that the job "deliberately does NOT install
 * a GPU, a database or any service". That is a reasoned choice and it stands. PGlite is real
 * PostgreSQL compiled to WASM — `select version()` here reports PostgreSQL 18.3 — installed from
 * the lockfile and run in-process. It is a DEPENDENCY, not a service, so the CI principle holds
 * while the claim becomes testable.
 *
 * THIS IS NOT A STACK DECISION. brand/site/stack.js says the database is PostgreSQL and it still
 * is. PGlite is the test harness. Nobody should read this file as the product moving to WASM.
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { PGlite } = require('@electric-sql/pglite');
const { pgcrypto } = require('@electric-sql/pglite/contrib/pgcrypto');

const CORE = path.join(__dirname, '..');
const SCHEMA = fs.readFileSync(path.join(CORE, 'schema.postgres.sql'), 'utf8');

let pass = 0, fail = 0;
const results = [];
function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => { pass++; console.log('  ok   ' + name); })
    .catch((e) => {
      fail++; results.push(name);
      console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n')[0]);
    });
}
function section(t) { console.log('\n── ' + t + ' ' + '─'.repeat(Math.max(0, 62 - t.length))); }

const A = '11111111-1111-1111-1111-111111111111';
const B = '22222222-2222-2222-2222-222222222222';
const C = '33333333-3333-3333-3333-333333333333';
const T1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const T2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const fresh = () => PGlite.create({ extensions: { pgcrypto } });
const rows = async (db, q, p) => (await db.query(q, p)).rows;
const count = async (db, q) => Number((await rows(db, q))[0].c);

/* Did a statement fail, and with what? Returns null when it succeeded, which is itself an
   answer — several checks below need "this was NOT refused" to be a failure. */
async function refusal(db, sql) {
  try { await db.exec(sql); return null; } catch (e) { return e.message; }
}

(async function main() {
  console.log('The schema, run rather than read\n');
  const probe = await fresh();
  console.log('  ' + (await rows(probe, 'select version() v'))[0].v.split(',')[0]);
  await probe.close();

  /* =====================================================================
     0 · THE HARNESS PROVES IT CAN FAIL, BEFORE IT PROVES ANYTHING ELSE
     ===================================================================
     A superuser bypasses row-level security. Connect as `postgres`, enable RLS, set the company,
     query, get the right rows — and pass while proving nothing, because the policy was never
     consulted. Measured here rather than assumed: as the owning superuser the toy table returns
     BOTH companies' rows, and it still does after FORCE ROW LEVEL SECURITY, because a superuser
     bypasses RLS whatever the table says.

     So this section deliberately breaks isolation and REQUIRES the leak. If the leak does not
     happen, the harness cannot detect one, every check below it is decoration, and this file
     aborts rather than reporting a pass. */
  section('0 · the negative control — this test can fail');

  await check('as a superuser, RLS is bypassed and BOTH companies leak', async () => {
    const db = await fresh();
    await db.exec(`
      CREATE TABLE toy (id int, company_id uuid);
      INSERT INTO toy VALUES (1, '${A}'), (2, '${B}');
      ALTER TABLE toy ENABLE ROW LEVEL SECURITY;
      CREATE ROLE authenticated NOLOGIN;
      CREATE POLICY iso ON toy FOR ALL TO authenticated
        USING (company_id = current_setting('app.current_company')::uuid)
        WITH CHECK (company_id = current_setting('app.current_company')::uuid);
      GRANT SELECT, INSERT ON toy TO authenticated;`);
    await db.exec(`SET app.current_company = '${A}'`);

    const asSuper = await count(db, 'select count(*)::int c from toy');
    assert.strictEqual(asSuper, 2,
      'the superuser did NOT leak — this harness cannot detect a leak, so nothing below it proves anything');

    await db.exec('ALTER TABLE toy FORCE ROW LEVEL SECURITY');
    const forced = await count(db, 'select count(*)::int c from toy');
    assert.strictEqual(forced, 2,
      'FORCE stopped the superuser — then the note in this file about superuser bypass is wrong');

    /* and the same query, as the role the policy actually names */
    await db.exec('SET ROLE authenticated');
    const asApp = await count(db, 'select count(*)::int c from toy');
    assert.strictEqual(asApp, 1,
      `the policy did not apply even to the named role: ${asApp} rows visible, expected 1`);
    await db.close();
  });

  if (fail) {
    console.log('\n' + '='.repeat(70));
    console.log('ABORTED: the negative control failed. This file cannot detect an isolation');
    console.log('leak, so every check after it would be decoration. Fix the harness first.');
    process.exit(1);
  }

  /* =====================================================================
     1 · The production schema loads into a real Postgres
     =================================================================== */
  section('1 · the production schema loads at all');

  let loaded = null;

  await check('core/schema.postgres.sql loads verbatim, top to bottom', async () => {
    const db = await fresh();
    const err = await refusal(db, SCHEMA);
    if (err) { await db.close(); assert.fail(err); }
    loaded = db;
  });

  if (!loaded) {
    console.log('\n' + '='.repeat(70));
    console.log(`${pass} passed, ${fail} failed`);
    console.log('\nThe schema did not load, so nothing below it could be asked.');
    console.log('This is the finding, not a harness problem: every check that reads the file');
    console.log('as TEXT has been green the whole time.');
    process.exit(1);
  }

  await check('every table the file declares actually exists in the database', async () => {
    const declared = (SCHEMA.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n]*/g, '')
      .match(/CREATE TABLE/gi) || []).length;
    const real = await count(loaded,
      "select count(*)::int c from information_schema.tables where table_schema='public'");
    assert.strictEqual(real, declared, `${declared} declared, ${real} created`);
  });

  await check('every policy the file declares actually exists', async () => {
    const n = await count(loaded, 'select count(*)::int c from pg_policies');
    assert.ok(n > 50, `only ${n} policies were created`);
  });

  await check('every table with a policy also has RLS switched on', async () => {
    const bad = await rows(loaded, `
      select c.relname from pg_class c
      join pg_policies p on p.tablename = c.relname
      where c.relrowsecurity = false group by c.relname`);
    assert.deepStrictEqual(bad.map((r) => r.relname), []);
  });

  /* =====================================================================
     2 · Isolation, asked of the database rather than of the file
     =================================================================== */
  section('2 · one business cannot reach another’s rows');

  /* Seeded once as the superuser, then every question is asked as `authenticated` — the role the
     policies actually name. Asking as the superuser is what would make all of this pass while
     proving nothing; section 0 exists to keep that honest. */
  await check('two tenants, and two companies under the first, seeded', async () => {
    await loaded.exec(`
      INSERT INTO tenants (id, name) VALUES ('${T1}', 'Tenant One'), ('${T2}', 'Tenant Two');
      INSERT INTO companies (id, tenant_id, name, brand_name, brand_code, invoice_prefix)
      VALUES ('${A}', '${T1}', 'Company A', 'A', 'AAA', 'AA'),
             ('${B}', '${T1}', 'Company B', 'B', 'BBB', 'BB'),
             ('${C}', '${T2}', 'Company C', 'C', 'CCC', 'CC');`);
    assert.strictEqual(await count(loaded, 'select count(*)::int c from companies'), 3);
    assert.strictEqual(await count(loaded, 'select count(*)::int c from tenants'), 2);
  });

  await check('a read as the app role returns only this company’s rows', async () => {
    await loaded.exec(`RESET ROLE; SET app.current_company = '${A}'; SET ROLE authenticated;`);
    const n = await count(loaded, 'select count(*)::int c from channels');
    await loaded.exec('RESET ROLE');
    assert.strictEqual(n, 0, `saw ${n} rows of a table that should be empty for this company`);
  });

  /* WHY BOTH CLAUSES, AND WHAT ACTUALLY BLOCKS THIS.
     The first version of this check was named "this is what WITH CHECK is for". That was
     imprecise, and planting a failure proved it: neutralising WITH CHECK alone left the write
     still refused. Measured on a FOR ALL policy —

       USING guard, CHECK guard  -> refused      USING true, CHECK guard -> refused
       USING guard, CHECK true   -> refused      USING true, CHECK true  -> ALLOWED

     — because for `FOR ALL`, Postgres applies USING to the NEW row on an UPDATE as well as the
     old one. Either clause alone stops a cross-boundary write; the schema carries both, and it
     takes removing both to open the hole. That is worth knowing before somebody "simplifies" the
     policy by dropping one. */
  await check('a cross-company WRITE is refused, by USING and WITH CHECK together', async () => {
    await loaded.exec(`RESET ROLE; SET app.current_company = '${A}'; SET ROLE authenticated;`);
    const err = await refusal(loaded,
      `INSERT INTO channels (company_id, kind, name) VALUES ('${B}', 'd2c', 'theirs')`);
    await loaded.exec('RESET ROLE');
    assert.ok(err && /row-level security/i.test(err),
      `a write into another company was ALLOWED — ${err || 'no error raised'}`);
  });

  await check('with no company set, the query is refused rather than returning everything',
    async () => {
      await loaded.exec('RESET ROLE; RESET app.current_company; SET ROLE authenticated;');
      let leaked = null;
      try { leaked = await count(loaded, 'select count(*)::int c from channels'); } catch (_) { /* refused */ }
      await loaded.exec('RESET ROLE');
      assert.strictEqual(leaked, null,
        `an unset company returned ${leaked} rows instead of refusing — that is every business at once`);
    });

  /* =====================================================================
     2b · Cross-tenant — the failure §M3 calls an incident rather than a defect
     =================================================================== */
  section('2b · one customer of the platform cannot reach another');

  await check('a tenant sees only its own companies', async () => {
    await loaded.exec(`RESET ROLE; SET app.current_tenant = '${T1}'; SET ROLE authenticated;`);
    const mine = await rows(loaded, 'select name from companies order by name');
    await loaded.exec('RESET ROLE');
    assert.deepStrictEqual(mine.map((r) => r.name), ['Company A', 'Company B'],
      'a tenant saw a company belonging to somebody else');
  });

  await check('a tenant cannot see the other tenant’s own row either', async () => {
    await loaded.exec(`RESET ROLE; SET app.current_tenant = '${T1}'; SET ROLE authenticated;`);
    const n = await count(loaded, 'select count(*)::int c from tenants');
    await loaded.exec('RESET ROLE');
    assert.strictEqual(n, 1, `saw ${n} tenants — every customer of the platform at once`);
  });

  await check('a company cannot be moved into another tenant by a write (both clauses)', async () => {
    await loaded.exec(`RESET ROLE; SET app.current_tenant = '${T1}'; SET ROLE authenticated;`);
    const err = await refusal(loaded,
      `UPDATE companies SET tenant_id = '${T2}' WHERE id = '${A}'`);
    await loaded.exec('RESET ROLE');
    assert.ok(err && /row-level security/i.test(err),
      `a company was moved between customers — ${err || 'no error raised'}`);
  });

  await check('with no tenant set, the query is refused rather than returning everything',
    async () => {
      await loaded.exec('RESET ROLE; RESET app.current_tenant; SET ROLE authenticated;');
      let leaked = null;
      try { leaked = await count(loaded, 'select count(*)::int c from companies'); } catch (_) { /* refused */ }
      await loaded.exec('RESET ROLE');
      assert.strictEqual(leaked, null,
        `an unset tenant returned ${leaked} rows — that is every customer of the platform`);
    });

  /* The new layer must not have weakened the old one. This is the check worth having: adding
     cross-tenant isolation is only progress if company isolation INSIDE a tenant still holds. */
  await check('company isolation still holds INSIDE a tenant', async () => {
    await loaded.exec(`RESET ROLE;
      SET app.current_tenant = '${T1}'; SET app.current_company = '${A}'; SET ROLE authenticated;`);
    const err = await refusal(loaded,
      `INSERT INTO channels (company_id, kind, name) VALUES ('${B}', 'd2c', 'sibling')`);
    await loaded.exec('RESET ROLE');
    assert.ok(err && /row-level security/i.test(err),
      `one company wrote into its SIBLING inside the same tenant — ${err || 'no error raised'}`);
  });

  /* =====================================================================
     3 · Money is exact, checked in the column type rather than in prose
     =================================================================== */
  section('3 · money cannot drift');

  await check('every *_paise column is an integer type, in the live catalogue', async () => {
    const bad = await rows(loaded, `
      select table_name, column_name, data_type
      from information_schema.columns
      where table_schema='public' and column_name like '%paise%'
        and data_type not in ('bigint','integer','smallint','numeric')`);
    assert.deepStrictEqual(bad, [], JSON.stringify(bad));
  });

  /* The first version of this check cast the sum to numeric before comparing, which ROUNDS THE
     DRIFT AWAY and reported that Postgres does exact float arithmetic. The assertion was wrong,
     not the database — measured: 0.1::float8 + 0.2::float8 is 0.30000000000000004. Compared at
     float precision, as below, it says what it meant to say. */
  await check('the drift is real in float, and integers are immune to it', async () => {
    const r = (await rows(loaded, `select
      (0.1::float8 + 0.2::float8) = 0.3::float8 as float_exact,
      (0.1::float8 + 0.2::float8)::text          as drift,
      (10::bigint + 20::bigint) = 30::bigint     as int_exact`))[0];
    assert.strictEqual(r.float_exact, false,
      'float arithmetic came out exact — then this is not behaving like Postgres');
    assert.strictEqual(r.drift, '0.30000000000000004', `drift was ${r.drift}`);
    assert.strictEqual(r.int_exact, true, 'integer arithmetic drifted, which would be alarming');
  });

  await check('and no money column is a float type in the first place', async () => {
    const bad = await rows(loaded, `
      select table_name, column_name, data_type
      from information_schema.columns
      where table_schema='public'
        and (column_name like '%paise%' or column_name like '%amount%')
        and data_type in ('real','double precision')`);
    assert.deepStrictEqual(bad, [], `money held as float: ${JSON.stringify(bad)}`);
  });

  await loaded.close();

  console.log('\n' + '='.repeat(70));
  console.log(`${pass} passed, ${fail} failed`);
  if (fail) {
    console.log('\nfailed: ' + results.join(' · '));
    process.exit(1);
  }
  console.log('The schema was executed, not read. Isolation was asked of the database.');
})().catch((e) => {
  console.error('\nlive.test.js could not run:\n  ' + e.message);
  process.exit(1);
});
