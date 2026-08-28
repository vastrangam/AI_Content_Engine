'use strict';
/* THE API — every business request carries a tenant and a company, or it is refused.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE
 * A business route may not reach the database except through db.withContext(), which drops to the
 * `authenticated` role first. There is deliberately no other way in: db.js exports no connection.
 *
 * WHY 401 AND NOT AN EMPTY LIST
 * An unauthenticated request that returns `200 []` reads as success in every log anyone will ever
 * look at, and it is exactly what a system with broken isolation returns. It has to be a refusal,
 * and the refusal has to be the default rather than something each route remembers — so `guard`
 * wraps every business route and there is no route that opts out.
 *
 * THE MODULE LIST IS READ, NEVER TYPED.
 * brand/site/modules.js is the one canonical list and it has changed twice. Anything here that
 * said "22 modules" would be wrong on the third change and nothing would notice.
 */

const path = require('node:path');
const db = require('./db.js');
const sessions = require('./auth.js');
const sales = require('./sales.js');

const ROOT = path.join(__dirname, '..', '..');
const MODULES = require(path.join(ROOT, 'brand', 'site', 'modules.js'));
const { accounts, TENANTS, COMPANIES } = require('../seed/demo.js');

const json = (res, code, body) => {
  const s = JSON.stringify(body);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8',
                        'content-length': Buffer.byteLength(s) });
  res.end(s);
};

/** Every business route goes through this. There is no version that skips it.
 *
 * IT FORWARDS THE BODY, AND FOR A WHILE IT DID NOT.
 * index.js calls a route as (req, res, ctx, ctx, body). This wrapper accepted only three of those
 * and passed on four, so every GUARDED route received `undefined` where the body should be. That
 * cost nothing while every guarded route was a GET with no body — and broke the first write route
 * the moment there was one, in a way that pointed the wrong direction: the browser posted a
 * perfectly good channel code and the server answered "a sale must name the channel it came in
 * on". The payload was right, the rule was right, and the argument list was wrong.
 *
 * Caught by driving the form in a browser. medhava/test/sales.test.js calls postSale directly and
 * was green throughout, because it never went through a route.
 */
function guard(handler) {
  return async (req, res, ctx, _ctxAgain, body) => {
    if (!ctx.session) {
      return json(res, 401, { error: 'not signed in' });
    }
    if (!ctx.session.companyId) {
      return json(res, 409, { error: 'no company chosen', companies: ctx.session.companies });
    }
    const scope = { tenantId: ctx.session.tenantId, companyId: ctx.session.companyId };
    try {
      return await handler(req, res, scope, ctx, body);
    } catch (e) {
      if (e instanceof db.ContextError) return json(res, 500, { error: e.message });
      throw e;
    }
  };
}

const money = (paise) => Number(paise || 0);

const ROUTES = {
  /* ── open ───────────────────────────────────────────────────────────── */

  'GET /api/health': async (req, res) => json(res, 200, { ok: true }),

  'GET /api/accounts': async (req, res) =>
    /* A demo needs a way in. Real deployments use the identity provider from the stack register;
       this lists the seeded people so nobody has to read a seed file to sign in. */
    json(res, 200, accounts().map(({ email, name, role }) => ({ email, name, role }))),

  'POST /api/session': async (req, res, ctx, _c, body) => {
    const who = accounts().find((a) => a.email === String(body.email || '').toLowerCase().trim());
    if (!who) return json(res, 401, { error: 'no such account' });
    const companies = COMPANIES.filter((c) => who.companies.includes(c.id));
    const tenantId = companies.length ? companies[0].tenant : null;
    const s = sessions.create({
      email: who.email, name: who.name, role: who.role, tenantId,
      companies: companies.map((c) => ({ id: c.id, name: c.name, code: c.code })),
      /* One company available means one company chosen. Making somebody pick from a list of one
         is a screen that exists to be clicked through. */
      companyId: companies.length === 1 ? companies[0].id : null,
    });
    res.setHeader('set-cookie', `mid=${s.id}; HttpOnly; SameSite=Lax; Path=/`);
    return json(res, 200, sessions.publicView(s));
  },

  'DELETE /api/session': async (req, res, ctx) => {
    if (ctx.session) sessions.destroy(ctx.session.id);
    res.setHeader('set-cookie', 'mid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
    return json(res, 200, { ok: true });
  },

  'GET /api/me': async (req, res, ctx) =>
    ctx.session ? json(res, 200, sessions.publicView(ctx.session))
                : json(res, 401, { error: 'not signed in' }),

  'POST /api/company': async (req, res, ctx, _c, body) => {
    if (!ctx.session) return json(res, 401, { error: 'not signed in' });
    const wanted = String(body.companyId || '');
    if (!ctx.session.companies.some((c) => c.id === wanted)) {
      /* Not 404. Asking for a company you have no claim on is refused as a permission failure,
         and it is recorded that way, because the two are different events. */
      return json(res, 403, { error: 'you are not a member of that company' });
    }
    ctx.session.companyId = wanted;
    return json(res, 200, sessions.publicView(ctx.session));
  },

  /* The 22 modules and their apps, read from the canonical list. Open because it is product
     scope, not business data — it is identical for every tenant. */
  'GET /api/modules': async (req, res) => json(res, 200, {
    modules: MODULES.map((m) => ({ n: m.n, name: m.name, spine: !!m.spine,
                                   apps: m.apps.map((a) => (typeof a === 'string' ? a : a.name)) })),
  }),

  /* ── scoped to one company, by the database ─────────────────────────── */

  'GET /api/channels': guard(async (req, res, scope) => {
    const rows = await db.withContext(scope, (q) =>
      q(`SELECT code, name, kind FROM channels WHERE deleted_at IS NULL ORDER BY code`));
    return json(res, 200, { channels: rows.rows });
  }),

  'GET /api/products': guard(async (req, res, scope) => {
    const rows = await db.withContext(scope, (q) =>
      q(`SELECT design_code, design_name, set_type, target_mrp_paise
           FROM designs WHERE deleted_at IS NULL ORDER BY design_code`));
    return json(res, 200, {
      products: rows.rows.map((r) => ({
        code: r.design_code, name: r.design_name, set: r.set_type,
        mrpPaise: money(r.target_mrp_paise),
      })),
    });
  }),

  'GET /api/orders': guard(async (req, res, scope) => {
    const rows = await db.withContext(scope, (q) =>
      q(`SELECT o.order_number, o.order_type, o.total_paise, o.order_date, c.code AS channel
           FROM sales_orders o JOIN channels c ON c.id = o.channel_id
          WHERE o.deleted_at IS NULL ORDER BY o.order_number`));
    return json(res, 200, {
      orders: rows.rows.map((r) => ({
        number: r.order_number, type: r.order_type, channel: r.channel,
        totalPaise: money(r.total_paise), date: r.order_date,
      })),
    });
  }),

  /* The sellable things, with the tax each carries. A sale line needs an ITEM, not a design —
     a design is what you make, an item is what leaves the shelf. */
  'GET /api/items': guard(async (req, res, scope) => {
    const rows = await db.withContext(scope, (q) =>
      q(`SELECT i.id, i.sku, i.hsn_code, i.gst_rate, i.mrp_paise, d.design_name
           FROM items i JOIN designs d ON d.id = i.design_id
          WHERE i.deleted_at IS NULL ORDER BY i.sku`));
    return json(res, 200, {
      items: rows.rows.map((r) => ({
        id: r.id, sku: r.sku, name: r.design_name, hsn: r.hsn_code,
        gstRate: Number(r.gst_rate), mrpPaise: money(r.mrp_paise),
      })),
    });
  }),

  /* ── THE FIRST WRITE ROUTE IN THE PLATFORM ────────────────────────────────
     Everything above this line reads. This one creates a business record, and it is guarded
     exactly like the reads: the company comes from the session, never from the body. A company id
     arriving in a request is a request, not an authority — which is why postSale takes `scope`
     and is never handed anything the client sent about who it is. */
  'POST /api/orders': guard(async (req, res, scope, _c, body) => {
    try {
      const result = await sales.postSale(scope, body || {});
      return json(res, 201, result);
    } catch (e) {
      if (e instanceof sales.SaleRefused) {
        /* 422, not 500. The request was understood and refused by a business rule, and the rule
           that refused it is named — so the screen can say WHICH rule, and so a refusal is never
           mistaken for the server falling over. */
        return json(res, 422, { error: e.message, rule: e.rule || null });
      }
      throw e;
    }
  }),

  /* ── the screen that makes the promise visible ───────────────────────── */
  /* Most software asks you to take isolation on trust, because the only honest demonstration is
     to show what you CANNOT see — and a screen showing nothing looks like a screen that is
     broken. So this returns both numbers: what the database holds, and what this company can
     reach. The gap is the product. */
  'GET /api/isolation': guard(async (req, res, scope) => {
    const questions = [
      ['sales_orders', 'orders'],
      ['designs', 'products'],
      ['channels', 'channels'],
    ];
    const out = [];
    for (const [table, label] of questions) {
      const mine = await db.withContext(scope, (q) =>
        q(`SELECT count(*)::int c FROM ${table} WHERE deleted_at IS NULL`));
      const all = await db.godView(`SELECT count(*)::int c FROM ${table} WHERE deleted_at IS NULL`);
      out.push({ what: label, visibleToYou: mine.rows[0].c, inTheDatabase: all[0].c });
    }

    /* And the harder question: what happens with NO company set at all.
    
       THIS CHECK WAS WRONG THE FIRST TIME AND SAID SO CONFIDENTLY. It ran the SET and the SELECT
       as one prepared statement, which PGlite refuses — so the screen reported "the database
       refuses it" while proving nothing whatsoever about the policy. A check that passes for the
       wrong reason is worse than no check, and it was on the one screen whose entire job is to
       prove something. It now runs them separately, so the answer comes from the policy. */
    const unset = await db.asOwner(async (d) => {
      await d.exec('RESET ROLE; RESET app.current_tenant; RESET app.current_company;');
      await d.exec('SET ROLE authenticated');
      try {
        const r = await d.query('SELECT count(*)::int c FROM sales_orders');
        return { refused: false, rows: r.rows[0].c };
      } catch (e) {
        return { refused: true, why: String(e.message).split('\n')[0] };
      } finally {
        await d.exec('RESET ROLE');
      }
    });

    const tenants = await db.godView('SELECT count(*)::int c FROM tenants');
    return json(res, 200, {
      you: { company: scope.companyId, tenant: scope.tenantId },
      counts: out,
      tenantsOnThisInstallation: tenants[0].c,
      unsetContext: unset,
      how: 'Every figure on the left is what the database returns when this company asks. Every ' +
           'figure on the right is what it actually holds. The application is connected as a role ' +
           'that is neither a superuser nor the owner of the tables, so the gap is enforced by ' +
           'PostgreSQL row-level security, not by a filter this code remembered to add.',
    });
  }),
};

module.exports = { ROUTES, json };
