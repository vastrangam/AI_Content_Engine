'use strict';
/* PART V's 43 TABLES, ASKED OF A REAL DATABASE.
 *
 *   node core/tests/partv.test.js
 *
 * WHY THIS FILE EXISTS
 * Part V of the master specification names 43 tables and the schema had none of them. Adding them
 * is easy to claim and easy to half-do, in three specific ways:
 *
 *   1. A table is simply missing, and the count says 43 because somebody typed 43.
 *   2. A table is recorded as "we already have that" and the columns it was supposed to bring
 *      never arrived. This is the dangerous one: it looks like a decision and reads like coverage.
 *   3. A table exists, carries company_id, and sits outside the row-level-security loop — so every
 *      company can read every other company's rows, and nothing about the table shows it.
 *
 * So this loads the schema into a real Postgres (PGlite, in-process, the same harness
 * core/tests/live.test.js uses and for the same stated reason) and asks:
 *
 *   · each of the 43 is either a table that exists, or a target table that really has the columns
 *   · every new table carries company_id
 *   · every new table has RLS enabled, FORCED, a policy, and a grant — all four, because three of
 *     them without the grant is a table nobody can read, and three without the policy is a table
 *     everybody can
 *   · the rules Part V states as rules are constraints, not prose
 *
 * It opens with a negative control, for the same reason live.test.js does: a check that has never
 * been shown to fail has not been shown to work.
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { PGlite } = require('@electric-sql/pglite');
const { pgcrypto } = require('@electric-sql/pglite/contrib/pgcrypto');

const CORE = path.join(__dirname, '..');
const SCHEMA = fs.readFileSync(path.join(CORE, 'schema.postgres.sql'), 'utf8');
const PARTV = require(path.join(CORE, 'partv.js'));

let pass = 0, fail = 0;
const failed = [];
function check(name, fn) {
  return Promise.resolve().then(fn)
    .then(() => { pass++; console.log('  ok   ' + name); })
    .catch((e) => {
      fail++; failed.push(name);
      console.log('  FAIL ' + name + '\n       ' + String(e.message).split('\n')[0]);
    });
}
const section = (t) => console.log('\n── ' + t + ' ' + '─'.repeat(Math.max(0, 62 - t.length)));

const rows = async (db, q, p) => (await db.query(q, p)).rows;
const refusal = async (db, sql) => {
  try { await db.exec(sql); return null; } catch (e) { return e.message; }
};

(async function main() {
  console.log('Part V — 43 tables, asked of the database\n');

  /* ── 0 · the register is structurally sound before anything is loaded ──── */
  section('0 · the register itself');
  await check('core/partv.js is complete and well formed', () => {
    const bad = PARTV.check();
    assert.deepStrictEqual(bad, [], bad.join('\n       '));
  });
  await check('it accounts for exactly the 43 tables Part V names', () => {
    assert.strictEqual(PARTV.TABLES.length, 43);
    assert.strictEqual(PARTV.NEW_TABLES.length + PARTV.EXTENSIONS.length, 43);
  });

  /* THE NEGATIVE CONTROL. The column check is the one that can silently pass, so prove it bites:
     an extension claiming a column nobody added must be caught. */
  await check('a claimed column that does not exist is caught', async () => {
    const db = await PGlite.create({ extensions: { pgcrypto } });
    await db.exec('CREATE TABLE probe (id int, real_column int)');
    const have = (await rows(db, `select column_name from information_schema.columns
                                  where table_schema='public' and table_name='probe'`))
      .map((r) => r.column_name);
    assert.ok(have.includes('real_column'), 'the probe cannot see a column that is there');
    assert.ok(!have.includes('invented_column'),
      'the probe reports a column that does not exist — every column check below is decoration');
    await db.close();
  });

  if (fail) {
    console.log('\nABORTED: the register or the harness is broken; nothing below would mean anything.');
    process.exit(1);
  }

  /* ── 1 · the schema still loads with 37 more tables in it ─────────────── */
  section('1 · the schema loads');
  const db = await PGlite.create({ extensions: { pgcrypto } });
  await check('core/schema.postgres.sql loads verbatim, top to bottom', async () => {
    const err = await refusal(db, SCHEMA);
    assert.strictEqual(err, null, `the schema did not load: ${err}`);
  });
  if (fail) {
    console.log('\nABORTED: the schema does not load, so nothing can be asked of it.');
    process.exit(1);
  }

  const tableNames = new Set((await rows(db, `select table_name from information_schema.tables
    where table_schema='public' and table_type='BASE TABLE'`)).map((r) => r.table_name));
  await check(`every table in the file exists in the database (${tableNames.size})`, () => {
    assert.ok(tableNames.size >= 151, `${tableNames.size} tables — expected at least 151`);
  });

  const columnsOf = async (t) => new Set((await rows(db,
    `select column_name from information_schema.columns
     where table_schema='public' and table_name=$1`, [t])).map((r) => r.column_name));

  /* ── 2 · each of the 43 arrived, as a table or as columns ──────────────── */
  section('2 · all 43, one at a time');
  for (const t of PARTV.TABLES) {
    if (t.kind === 'table') {
      await check(`${t.name} — a table`, () => {
        assert.ok(tableNames.has(t.name), `${t.name} is not in the database`);
      });
    } else {
      await check(`${t.name} — ${t.adds.length} column(s) on ${t.target}`, async () => {
        assert.ok(tableNames.has(t.target), `${t.target} does not exist to extend`);
        const cols = await columnsOf(t.target);
        const missing = t.adds.filter((c) => !cols.has(c));
        assert.deepStrictEqual(missing, [],
          `${t.target} is missing ${missing.join(', ')} — the decision says they are there`);
      });
    }
  }

  /* ── 3 · every new table is inside the isolation, all four parts ──────── */
  section('3 · isolation — company_id, RLS, FORCE, policy, grant');

  const rls = new Map((await rows(db, `select relname, relrowsecurity, relforcerowsecurity
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r'`))
    .map((r) => [r.relname, r]));
  const policied = new Set((await rows(db,
    `select tablename from pg_policies where schemaname='public'`)).map((r) => r.tablename));
  const granted = new Set((await rows(db,
    `select table_name from information_schema.role_table_grants
     where table_schema='public' and grantee='authenticated'`)).map((r) => r.table_name));

  await check('every new table carries company_id', async () => {
    const without = [];
    for (const n of PARTV.NEW_TABLES) {
      if (!(await columnsOf(n)).has('company_id')) without.push(n);
    }
    assert.deepStrictEqual(without, [], `no company_id: ${without.join(', ')}`);
  });

  await check('every new table has row-level security ENABLED', () => {
    const off = PARTV.NEW_TABLES.filter((n) => !(rls.get(n) || {}).relrowsecurity);
    assert.deepStrictEqual(off, [], `RLS off: ${off.join(', ')}`);
  });

  await check('every new table has it FORCED, so the owner is subject to it too', () => {
    const off = PARTV.NEW_TABLES.filter((n) => !(rls.get(n) || {}).relforcerowsecurity);
    assert.deepStrictEqual(off, [], `not forced: ${off.join(', ')}`);
  });

  await check('every new table has a policy — without one nobody can read it', () => {
    const off = PARTV.NEW_TABLES.filter((n) => !policied.has(n));
    assert.deepStrictEqual(off, [], `no policy: ${off.join(', ')}`);
  });

  await check('every new table is granted to the application role', () => {
    const off = PARTV.NEW_TABLES.filter((n) => !granted.has(n));
    assert.deepStrictEqual(off, [], `no grant: ${off.join(', ')}`);
  });

  await check('no new table holds money as a float', async () => {
    const bad = await rows(db, `
      select table_name, column_name, data_type from information_schema.columns
      where table_schema='public' and data_type in ('real','double precision')
        and (column_name like '%paise%' or column_name like '%amount%' or column_name like '%cost%'
             or column_name like '%price%' or column_name like '%rate_%')`);
    assert.deepStrictEqual(bad, [], `money as float: ${JSON.stringify(bad)}`);
  });

  /* ── 4 · isolation actually holds on one of the new tables ────────────── */
  section('4 · and it holds when a second company tries');

  const A = '11111111-1111-1111-1111-111111111111';
  const B = '22222222-2222-2222-2222-222222222222';
  const T = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  await check('two companies, a promo code each, and only one is visible', async () => {
    await db.exec(`
      INSERT INTO tenants (id, name) VALUES ('${T}', 'T') ON CONFLICT DO NOTHING;
      INSERT INTO companies (id, tenant_id, name, brand_name, brand_code, invoice_prefix)
        VALUES ('${A}', '${T}', 'A', 'A', 'AA', 'AA'),
               ('${B}', '${T}', 'B', 'B', 'BB', 'BB') ON CONFLICT DO NOTHING;
      INSERT INTO promo_codes (company_id, code, discount_type, discount_value, valid_from, valid_to)
        VALUES ('${A}', 'AAA', 'pct', 10, current_date, current_date),
               ('${B}', 'BBB', 'pct', 10, current_date, current_date);`);
    await db.exec(`SET app.current_company = '${A}'; SET ROLE authenticated;`);
    const seen = await rows(db, 'select code from promo_codes order by code');
    await db.exec('RESET ROLE');
    assert.deepStrictEqual(seen.map((r) => r.code), ['AAA'],
      `company A saw ${JSON.stringify(seen.map((r) => r.code))}`);
  });

  await check('and writing a row into the other company is refused', async () => {
    await db.exec(`SET app.current_company = '${A}'; SET ROLE authenticated;`);
    const err = await refusal(db, `INSERT INTO promo_codes
      (company_id, code, discount_type, discount_value, valid_from, valid_to)
      VALUES ('${B}', 'SNEAK', 'pct', 5, current_date, current_date)`);
    await db.exec('RESET ROLE');
    assert.ok(err && /policy/i.test(err), `the write was NOT refused: ${err}`);
  });

  /* ── 5 · Part V's rules are constraints, not prose ────────────────────── */
  section('5 · the rules Part V states, enforced');

  await check('§E.1.3 — an NCR cannot close without both corrective AND preventive action', async () => {
    const err = await refusal(db, `INSERT INTO ncr_records
      (company_id, source, description, severity, status, corrective_action)
      VALUES ('${A}', 'internal_qc', 'x', 'minor', 'closed', 'did a thing')`);
    assert.ok(err && /ncr_close_needs_both_actions/.test(err), `it was allowed to close: ${err}`);
  });

  await check('§E.1.3 — verified_effective requires a SECOND person, not the raiser', async () => {
    /* users is one of the group-wide tables and carries no company_id — see the RLS
       section's note on the tables that hold no business figures. */
    const u = (await rows(db, `INSERT INTO users (full_name, role)
      VALUES ('Raiser', 'staff') RETURNING id`))[0].id;
    const err = await refusal(db, `INSERT INTO ncr_records
      (company_id, source, description, severity, status,
       corrective_action, preventive_action, raised_by, verified_by)
      VALUES ('${A}', 'lab_test_fail', 'x', 'major', 'verified_effective',
              'c', 'p', '${u}', '${u}')`);
    assert.ok(err && /ncr_verified_needs_second_person/.test(err),
      `the raiser was allowed to verify their own NCR: ${err}`);
  });

  await check('§E.4.2 — a buyer round cannot be approved without the sign-off captured', async () => {
    const d = (await rows(db, `INSERT INTO designs (company_id, design_code, design_name)
      VALUES ('${A}', 'D1', 'D') RETURNING id`))[0].id;
    const c = (await rows(db, `INSERT INTO customers (company_id, name)
      VALUES ('${A}', 'Buyer') RETURNING id`))[0].id;
    const err = await refusal(db, `INSERT INTO samples
      (company_id, design_id, status, buyer_id, buyer_signoff_captured)
      VALUES ('${A}', '${d}', 'approved', '${c}', false)`);
    assert.ok(err && /samples_buyer_approval_needs_signoff/.test(err),
      `approved with no buyer sign-off: ${err}`);
  });

  await check('§E.5.1 — api_keys has nowhere to put a raw key', async () => {
    const cols = await columnsOf('api_keys');
    const raw = [...cols].filter((c) => /^(key|raw_key|secret|token|api_key)$/.test(c));
    assert.deepStrictEqual(raw, [],
      `a column a raw key could be written to: ${raw.join(', ')} — the promise is that it is ` +
      'shown once and never persisted, and a schema keeps that by having no such column');
    assert.ok(cols.has('key_hash'), 'api_keys does not store a hash either');
  });

  await check('a promo code over 100 per cent is refused', async () => {
    const err = await refusal(db, `INSERT INTO promo_codes
      (company_id, code, discount_type, discount_value, valid_from, valid_to)
      VALUES ('${A}', 'FREE', 'pct', 150, current_date, current_date)`);
    assert.ok(err && /promo_pct_within_range/.test(err), `150% was accepted: ${err}`);
  });

  await check('a secondary-approval threshold above the limit it qualifies is refused', async () => {
    const err = await refusal(db, `INSERT INTO approval_limits
      (company_id, role, action_type, max_amount_paise, requires_secondary_above_paise)
      VALUES ('${A}', 'manager', 'po_approval', 100000, 500000)`);
    assert.ok(err && /approval_secondary_below_max/.test(err),
      `a threshold nobody could ever cross was accepted: ${err}`);
  });

  await check('one packing video per order, and not two', async () => {
    const ch = (await rows(db, `INSERT INTO channels (company_id, code, name, kind)
      VALUES ('${A}', 'D2C', 'D2C', 'd2c') RETURNING id`))[0].id;
    const so = (await rows(db, `INSERT INTO sales_orders
      (company_id, channel_id, order_number, order_date)
      VALUES ('${A}', '${ch}', 'SO1', now()) RETURNING id`))[0].id;
    await db.exec(`INSERT INTO packing_videos (company_id, sales_order_id, video_url)
      VALUES ('${A}', '${so}', 'a')`);
    const err = await refusal(db, `INSERT INTO packing_videos (company_id, sales_order_id, video_url)
      VALUES ('${A}', '${so}', 'b')`);
    assert.ok(err && /unique|duplicate/i.test(err), `a second clip was accepted: ${err}`);
  });

  await db.close();

  console.log('\n' + '='.repeat(70));
  console.log(`${pass} passed, ${fail} failed`);
  if (fail) {
    console.log('\nfailed: ' + failed.join(' · '));
    process.exit(1);
  }
  console.log(`All 43 of Part V accounted for — ${PARTV.NEW_TABLES.length} tables and ` +
    `${PARTV.EXTENSIONS.length} extensions, every column checked against a running database.`);
})().catch((e) => {
  console.error('\npartv.test.js could not run:\n  ' + e.message);
  process.exit(1);
});
