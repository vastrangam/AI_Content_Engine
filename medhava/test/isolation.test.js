'use strict';
/* THE SLICE, ASKED RATHER THAN ASSERTED.
 *
 *   node medhava/test/isolation.test.js
 *
 * WHAT THIS TESTS, AND WHY IT IS THE ONLY THING WORTH TESTING FIRST
 * Everything else in the platform is a feature. This is the promise: two businesses on one
 * installation, and neither can reach the other's records. Every screen in every one of the 113
 * apps is wrong if this is wrong, and — the part that matters — NOTHING LOOKS WRONG when it is.
 * Broken isolation does not throw. It returns rows. Every report renders, every total adds up,
 * and one company is reading another's orders.
 *
 * So the questions are put to a real PostgreSQL, running the real core/schema.postgres.sql, over
 * the real HTTP routes. Not a mock of the policy — the policy.
 *
 * RED BEFORE GREEN
 * A passing test proves nothing until it has been seen to fail. Every check below was proven by
 * planting its failure first and watching this file catch it; what was planted, and what this
 * file said, is recorded on each one. The negative controls (T3, T11) exist because two of these
 * checks would have passed against a database with NO isolation at all, and a green suite that
 * cannot tell those apart is decoration.
 */

const assert = require('node:assert');
const http = require('node:http');

const db = require('../server/db.js');
const { seed, IDS } = require('../seed/demo.js');
const { server } = require('../server/index.js');

let pass = 0, fail = 0;
const results = [];

async function test(name, fn) {
  try { await fn(); pass++; results.push(['ok  ', name]); }
  catch (e) {
    fail++; results.push(['FAIL', name]);
    console.error(`\n  FAIL  ${name}\n        ${String(e.message).split('\n').join('\n        ')}\n`);
  }
}

/* ── a client, so the routes are exercised the way a browser exercises them ── */

let PORT = 0;
function request(method, path, { body, cookie } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : Buffer.from(JSON.stringify(body));
    const req = http.request({ host: '127.0.0.1', port: PORT, method, path, headers: {
      ...(payload ? { 'content-type': 'application/json', 'content-length': payload.length } : {}),
      ...(cookie ? { cookie } : {}),
    } }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch (_) { parsed = raw; }
        const set = res.headers['set-cookie'] || [];
        resolve({ status: res.statusCode, body: parsed,
                  cookie: (set[0] || '').split(';')[0] || null });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const signIn = async (email) => {
  const r = await request('POST', '/api/session', { body: { email } });
  assert.strictEqual(r.status, 200, `could not sign in as ${email}: ${JSON.stringify(r.body)}`);
  return r.cookie;
};

/* ── run ─────────────────────────────────────────────────────────────────── */

async function main() {
  await db.open();
  await seed();
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  PORT = server.address().port;

  const facts = await db.godView(
    `SELECT (SELECT count(*)::int FROM information_schema.tables WHERE table_schema='public') tables,
            (SELECT count(*)::int FROM pg_policies WHERE schemaname='public') policies,
            version() v`);
  const f = facts[0];
  console.log('');
  console.log(`  ${String(f.v).split(',')[0]}`);
  console.log(`  ${f.tables} tables · ${f.policies} row-level policies · schema executed, not read`);
  console.log('');

  /* ── T1 · the precondition. Without this every other pass below is meaningless ──
     A superuser bypasses every policy, FORCE ROW LEVEL SECURITY included — measured in
     core/tests/live.test.js. If the app role were a superuser or the table owner, T2 to T10 would
     all still pass and would all be proving nothing. This check is first for that reason.
     RED: `ALTER ROLE authenticated SUPERUSER` → 4 passed, 9 failed. T1 said "the app role is a
     SUPERUSER: every policy is inert", and T2 through T6, T8, T11 and T13 fell with it. That
     spread is the point: one line of deployment turns every guarantee in this file off at once. */
  await test('T1  the app role is neither a superuser nor the owner of the tables', async () => {
    const [role] = await db.godView(
      `SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = 'authenticated'`);
    assert.ok(role, 'the role `authenticated` does not exist — no policy applies to anybody');
    assert.strictEqual(role.rolsuper, false, 'the app role is a SUPERUSER: every policy is inert');
    assert.strictEqual(role.rolbypassrls, false, 'the app role has BYPASSRLS: every policy is inert');
    const [owner] = await db.godView(
      `SELECT tableowner FROM pg_tables WHERE schemaname='public' AND tablename='sales_orders'`);
    assert.notStrictEqual(owner.tableowner, 'authenticated',
      'the app role OWNS the tables. FORCE ROW LEVEL SECURITY covers the owner, but relying on ' +
      'it is one ALTER away from silent exposure.');
  });

  /* ── T2 · isolation on a list, the everyday case ──
     RED: re-created the policy as `USING (true)` → "the three companies together see 21 orders
     and the database holds 7". Each company saw all seven. */
  await test('T2  each company lists only its own orders, and the parts sum to the whole', async () => {
    const seen = {};
    for (const [label, tenant, company] of [
      ['ethnic',  IDS.tenantA, IDS.coA1],
      ['western', IDS.tenantA, IDS.coA2],
      ['steel',   IDS.tenantB, IDS.coB1],
    ]) {
      const r = await db.withContext({ tenantId: tenant, companyId: company },
        (q) => q('SELECT count(*)::int c FROM sales_orders'));
      seen[label] = r.rows[0].c;
    }
    const [all] = await db.godView('SELECT count(*)::int c FROM sales_orders');
    const total = seen.ethnic + seen.western + seen.steel;
    assert.strictEqual(total, all.c,
      `the three companies together see ${total} orders and the database holds ${all.c}. ` +
      `Fewer means a row belongs to nobody; more means a row is visible twice.`);
    assert.ok(seen.ethnic > 0 && seen.western > 0 && seen.steel > 0,
      `a company seeing nothing would satisfy the sum only if the others made it up: ` +
      JSON.stringify(seen));
  });

  /* ── T3 · THE NEGATIVE CONTROL for T2 ──
     T2 passes against a database with no isolation whatsoever if each company happens to hold the
     same rows. This is the check that tells the two apart: as the owner, ALL of them are visible.
     RED: the same `USING (true)` plant → "the owner sees 7 and the scoped role sees 7. Equal
     means the role drop is doing nothing and every other pass in this file is an accident." */
  await test('T3  the same query as the owner sees every company — so T2 came from the policy',
    async () => {
      const [all] = await db.godView('SELECT count(*)::int c FROM sales_orders');
      const one = await db.withContext({ tenantId: IDS.tenantA, companyId: IDS.coA1 },
        (q) => q('SELECT count(*)::int c FROM sales_orders'));
      assert.ok(all.c > one.rows[0].c,
        `the owner sees ${all.c} and the scoped role sees ${one.rows[0].c}. Equal means the role ` +
        `drop is doing nothing and every other pass in this file is an accident.`);
    });

  /* ── T4 · isolation on a detail fetch, by a key the other company knows ──
     A list query is easy to scope. The dangerous route is the one that takes an identifier from
     the URL, because that identifier is guessable and the row exists.
     RED: the same `USING (true)` plant → "the other company in the SAME business fetched
     AE/26-27/0001 by name." Two companies under one owner are still two sets of books. */
  await test('T4  a company cannot fetch another company\'s order by its number', async () => {
    const mine = await db.withContext({ tenantId: IDS.tenantA, companyId: IDS.coA1 },
      (q) => q('SELECT order_number FROM sales_orders ORDER BY order_number LIMIT 1'));
    const number = mine.rows[0].order_number;
    const theirs = await db.withContext({ tenantId: IDS.tenantA, companyId: IDS.coA2 },
      (q) => q('SELECT order_number FROM sales_orders WHERE order_number = $1', [number]));
    assert.strictEqual(theirs.rows.length, 0,
      `the other company in the SAME business fetched ${number} by name. Two companies under one ` +
      `owner are still two sets of books.`);
  });

  /* ── T5 · isolation on a write. USING protects reads; WITH CHECK protects writes ──
     A policy with USING and no WITH CHECK reads correctly and lets one company INSERT rows INTO
     another. Nothing about the running system looks wrong; the row simply appears in somebody
     else's ledger.

     THE PLANTED ROW IS OTHERWISE COMPLETELY LEGAL, and it took a plant to notice that it was not.
     The first version omitted channel_id; with WITH CHECK dropped the insert was still refused —
     by a NOT NULL constraint. The `refused, but not by the policy` assertion below caught that
     and is the only reason it was found — but the check would have been proving that sales_orders
     has a NOT NULL column rather than that the policy stops the write. It now carries a real
     channel belonging to the VICTIM company, so nothing but the policy can refuse it.
     RED: dropped WITH CHECK, kept USING → "the insert was accepted. A row now sits in a company
     that did not write it." Reads stayed correctly scoped the whole time; only the write leaked,
     which is exactly the shape of the bug this check exists for. */
  await test('T5  a company cannot insert a row belonging to another company', async () => {
    const before = await db.godView('SELECT count(*)::int c FROM sales_orders');
    const [chan] = await db.godView(
      'SELECT id FROM channels WHERE company_id = $1 LIMIT 1', [IDS.coA1]);
    let refused = null;
    try {
      await db.withContext({ tenantId: IDS.tenantA, companyId: IDS.coA2 }, (q) =>
        q(`INSERT INTO sales_orders
             (company_id, channel_id, order_number, order_date, order_type, total_paise)
           VALUES ($1, $2, $3, now(), 'b2c', 100)`,
          [IDS.coA1, chan.id, 'PLANTED/BY/AW']));
    } catch (e) { refused = String(e.message).split('\n')[0]; }
    const after = await db.godView('SELECT count(*)::int c FROM sales_orders');
    assert.ok(refused, 'the insert was accepted. A row now sits in a company that did not write it.');
    assert.match(refused, /row-level security/i,
      `refused, but not by the policy: ${refused}. A NOT NULL or a unique constraint refusing it ` +
      `today would stop refusing it the moment the planted row differed.`);
    assert.strictEqual(after[0].c, before[0].c, 'the refused row was written anyway');
  });

  /* ── T6 · no context is not "everything", and not "nothing" ──
     The single most dangerous state: a request that forgot to set the company. If the policy read
     `company_id = current_setting(...)` with no guard, an unset setting is NULL, the comparison is
     NULL, and the answer is an empty list — which looks exactly like a company with no orders.
     Refusing is the only answer that cannot be mistaken for a fact.
     RED: re-created the policy as `company_id::text = coalesce(current_setting(…, true), '')` —
     no cast, no guard, so an unset company matches nothing instead of raising → "an unset company
     returned 0 rows instead of an error". Quiet, plausible, and completely wrong. */
  await test('T6  a query with no company set is refused by the database, not answered with []',
    async () => {
      const out = await db.asOwner(async (d) => {
        await d.exec('RESET ROLE; RESET app.current_tenant; RESET app.current_company;');
        await d.exec('SET ROLE authenticated');
        try {
          const r = await d.query('SELECT count(*)::int c FROM sales_orders');
          return { refused: false, rows: r.rows[0].c };
        } catch (e) {
          return { refused: true, why: String(e.message).split('\n')[0] };
        } finally { await d.exec('RESET ROLE'); }
      });
      assert.ok(out.refused,
        `an unset company returned ${out.rows} rows instead of an error. An empty result is not a ` +
        `refusal: it is indistinguishable from a company that genuinely has no orders, and it is ` +
        `what a request that forgot its context will silently render as a screen of zeroes.`);
      /* WHICH refusal, named. The policy's guard covers a company set to the empty string; a
         company never set at all is NULL, NULL <> '' is NULL rather than false, and the cast is
         reached — so the raise comes from the cast. Both are fail-closed and no row escapes
         either way. This assertion is the record of which one actually happens, so that
         tightening the guard is a deliberate change with a test to update and not a silent one. */
      assert.match(out.why, /invalid input syntax for type uuid/,
        `refused, but by something new: ${out.why}. If the policy guard was tightened on purpose, ` +
        `update this line in the same commit — see core/schema.postgres.sql at company_isolation.`);
    });

  /* ── T7 · the application refuses before the database has to ──
     Two independent defences. The policy stops a mistake in medhava/server/db.js; withContext
     stops a mistake in the policy. Either alone is one edit from exposure.
     RED: turned the guard at the top of withContext into `if (false)` → "withContext(null) ran
     instead of refusing", and nothing else in the file noticed. */
  await test('T7  withContext refuses a missing tenant or company before touching the database',
    async () => {
      for (const bad of [null, {}, { tenantId: IDS.tenantA }, { companyId: IDS.coA1 }]) {
        await assert.rejects(
          () => db.withContext(bad, (q) => q('SELECT 1')),
          (e) => e instanceof db.ContextError,
          `withContext(${JSON.stringify(bad)}) ran instead of refusing`);
      }
      await assert.rejects(
        () => db.withContext({ tenantId: IDS.tenantA, companyId: "' OR '1'='1" }, (q) => q('SELECT 1')),
        (e) => e instanceof db.ContextError,
        'a company id that is not a uuid reached a SET statement that cannot be parameterised');
    });

  /* ── T8 · a business record is closed or corrected, never deleted ──
     This test found a real defect and is the reason it is here. db.js granted SELECT/INSERT/UPDATE
     and claimed the missing DELETE enforced the rule; the schema had already granted DELETE to the
     same role, and a GRANT cannot take back what a GRANT gave. The role could delete, and the
     comment said it could not. db.js now REVOKEs, and this makes the claim answer for itself.
     RED: removed the REVOKE → "3 orders were deleted. A closed month must stay closed." The
     delete removed exactly the rows the policy admitted, which is every row that company can
     see — and T11 fell too, because one of the two companies then had nothing left to list. */
  await test('T8  the application role cannot delete a business record', async () => {
    const before = await db.godView('SELECT count(*)::int c FROM sales_orders');
    let refused = null;
    try {
      await db.withContext({ tenantId: IDS.tenantA, companyId: IDS.coA1 },
        (q) => q('DELETE FROM sales_orders'));
    } catch (e) { refused = String(e.message).split('\n')[0]; }
    const after = await db.godView('SELECT count(*)::int c FROM sales_orders');
    assert.strictEqual(after[0].c, before[0].c,
      `${before[0].c - after[0].c} orders were deleted. A closed month must stay closed.`);
    assert.ok(refused, 'the DELETE was accepted and merely matched nothing — which it will stop ' +
      'doing the moment the policy widens by one row.');
    assert.match(refused, /permission denied/i,
      `refused, but not by the grant: ${refused}. If the policy refused it instead, the role can ` +
      `still delete anything the policy admits, which is every row it can see.`);
  });

  /* ── T9 · an unauthenticated request is refused, not answered emptily ──
     `200 []` is what a system with broken isolation returns, and it reads as success in every log
     anybody will ever look at.
     RED: returned `json(res, 200, [])` from guard() when there was no session → "/api/orders
     answered 200 with no session: []." */
  await test('T9  every business route refuses an unauthenticated request with 401', async () => {
    for (const path of ['/api/orders', '/api/products', '/api/channels', '/api/isolation']) {
      const r = await request('GET', path);
      assert.strictEqual(r.status, 401,
        `${path} answered ${r.status} with no session: ${JSON.stringify(r.body).slice(0, 120)}. ` +
        `An empty list is the answer that looks like success.`);
    }
  });

  /* ── T10 · a company id in a request body is a request, never an authority ──
     RED: made POST /api/company skip the membership check → it answered 200, and the steel
     owner's session came back carrying tenantId 2222… with companyId a1a1… — one business's
     tenant and another's company, which is precisely the pair no policy in the schema compares. */
  await test('T10 a signed-in user cannot switch into a company they do not belong to', async () => {
    const cookie = await signIn('owner@deccan.demo');
    const r = await request('POST', '/api/company', { cookie, body: { companyId: IDS.coA1 } });
    assert.strictEqual(r.status, 403,
      `switching into another tenant's company answered ${r.status}: ${JSON.stringify(r.body)}`);
    const after = await request('GET', '/api/orders', { cookie });
    assert.strictEqual(after.status, 200);
    assert.ok(after.body.orders.every((o) => o.number.startsWith('DS/')),
      'after the refused switch the session is reading somebody else\'s orders: ' +
      JSON.stringify(after.body.orders.map((o) => o.number)));
  });

  /* ── T11 · over HTTP, end to end, with the negative control attached ──
     The same account, two companies, one session: the list must change when the company changes,
     and the two lists must not overlap. The overlap check is the control — two identical lists
     would pass a naive "each returned some orders" test.
     RED: had guard() pass `companies[0].id` instead of the session's chosen company → "both
     companies returned AE/26-27/0001, AE/26-27/0002, AE/26-27/0003". The company selector was
     still on the screen and still changed; it just no longer changed anything. */
  await test('T11 one account, two companies: the orders change and never overlap', async () => {
    const cookie = await signIn('owner@anjali.demo');
    const me = await request('GET', '/api/me', { cookie });
    const companies = me.body.companies.map((c) => c.id);
    assert.strictEqual(companies.length, 2, 'this check needs an account with two companies');

    const lists = [];
    for (const id of companies) {
      const sw = await request('POST', '/api/company', { cookie, body: { companyId: id } });
      assert.strictEqual(sw.status, 200, `could not switch: ${JSON.stringify(sw.body)}`);
      const r = await request('GET', '/api/orders', { cookie });
      assert.strictEqual(r.status, 200);
      lists.push(r.body.orders.map((o) => o.number));
    }
    const overlap = lists[0].filter((n) => lists[1].includes(n));
    assert.strictEqual(overlap.length, 0, `both companies returned ${overlap.join(', ')}`);
    assert.ok(lists[0].length && lists[1].length,
      `one company returned nothing: ${JSON.stringify(lists)}`);

    /* And the control: the two lists together are what the database holds for this tenant. */
    const [all] = await db.godView(
      `SELECT count(*)::int c FROM sales_orders o JOIN companies co ON co.id = o.company_id
        WHERE co.tenant_id = $1`, [IDS.tenantA]);
    assert.strictEqual(lists[0].length + lists[1].length, all.c,
      `the two companies see ${lists[0].length + lists[1].length} orders between them and the ` +
      `tenant holds ${all.c}`);
  });

  /* ── T12 · the module list is read, never typed ──
     brand/site/modules.js is the one canonical list and it has changed twice. Anything in the
     server that said "22" would be wrong on the third change and nothing would notice.
     RED: served `MODULES.slice(0, 22)` with the names replaced by "Module 01"…"Module 22" → the
     count still matched and this failed on the names, listing all 22 real ones against the fake. */
  await test('T12 the modules the API serves are the canonical list, not a copy', async () => {
    const MODULES = require('../../brand/site/modules.js');
    const r = await request('GET', '/api/modules');
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.modules.length, MODULES.length,
      `the API serves ${r.body.modules.length} modules and brand/site/modules.js has ` +
      `${MODULES.length}`);
    assert.deepStrictEqual(r.body.modules.map((m) => m.name), MODULES.map((m) => m.name),
      'the API\'s module names differ from the canonical list, in order or in wording');
    const apps = r.body.modules.reduce((n, m) => n + m.apps.length, 0);
    const canonical = MODULES.reduce((n, m) => n + m.apps.length, 0);
    assert.strictEqual(apps, canonical, `${apps} apps served against ${canonical} canonical`);
  });

  /* ── T13 · money never becomes a float ──
     0.1::float8 + 0.2::float8 = 0.30000000000000004, and a settlement that is off by a paisa is a
     settlement somebody has to reconcile by hand.
     RED: multiplied the API's money conversion by 1.0001 → "DS/26-27/0001 carries 4875487.5,
     which is not a whole number of paise". core/tests/schema.test.js guards the COLUMN; this
     guards the value that actually reaches a screen. */
  await test('T13 money crosses the API as whole paise', async () => {
    /* The single-company account, deliberately. Signing in with two companies chooses none — the
       first draft of this used the two-company owner, got the 409 that says so, and tried to
       iterate the error body. The 409 is the API behaving correctly; the test was wrong. */
    const cookie = await signIn('owner@deccan.demo');
    const r = await request('GET', '/api/orders', { cookie });
    assert.strictEqual(r.status, 200, `orders answered ${r.status}: ${JSON.stringify(r.body)}`);
    for (const o of r.body.orders) {
      assert.ok(Number.isInteger(o.totalPaise),
        `${o.number} carries ${o.totalPaise}, which is not a whole number of paise`);
    }
    assert.ok(r.body.orders.length, 'no orders came back, so nothing was actually checked');
    const p = await request('GET', '/api/products', { cookie });
    assert.strictEqual(p.status, 200, `products answered ${p.status}`);
    assert.ok(p.body.products.length, 'no products came back, so nothing was actually checked');
    for (const d of p.body.products) {
      assert.ok(Number.isInteger(d.mrpPaise), `${d.code} carries ${d.mrpPaise}`);
    }
  });

  /* ── report ──────────────────────────────────────────────────────────── */
  console.log('');
  results.forEach(([mark, name]) => console.log(`  ${mark}  ${name}`));
  console.log('');
  console.log('  ' + '='.repeat(68));
  console.log(`  ${pass} passed, ${fail} failed`);
  if (!fail) {
    console.log('  Two businesses, one installation, one schema. Neither can reach the other,');
    console.log('  and the reason is PostgreSQL — not a filter this code remembered to add.');
  }
  console.log('');

  await new Promise((r) => server.close(r));
  await db.close();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('\nthe suite itself failed:', e); process.exit(1); });
