'use strict';
/* TWO BUSINESSES THAT LOOK NOTHING ALIKE, ON ONE CODEBASE.
 *
 * The platform's whole claim is that a clothing manufacturer and a steel plant run on the same
 * software, each seeing only its own records and each seeing them in its own words. A demo with
 * one tenant cannot show that, and a demo with two similar ones shows it weakly — so this seeds an
 * apparel maker and a steel fabricator, with different channels, different products and different
 * vocabulary.
 *
 * WHY THE FIGURES ARE ROUND AND OBVIOUSLY MADE UP
 * They are demonstration data. A seed carrying convincing-looking revenue is a seed somebody
 * eventually screenshots into a deck as though it were a customer's. These are plainly invented,
 * and the names say so.
 *
 * THIS IS DATA, AND VALUES BELONG HERE. Counts, names and rates in this file are exactly where
 * they should be. What must never happen is the same values appearing in medhava/server/, which
 * is why brand/site/checkstatic.js scans that tree and exempts this one.
 */

const { asOwner } = require('../server/db.js');

/* Fixed ids so the isolation screen can name the other company without a lookup, and so a restart
   does not change what the demo shows. */
const IDS = {
  tenantA: '11111111-1111-4111-8111-111111111111',
  tenantB: '22222222-2222-4222-8222-222222222222',
  coA1: 'a1a1a1a1-0000-4000-8000-000000000001',
  coA2: 'a1a1a1a1-0000-4000-8000-000000000002',
  coB1: 'b1b1b1b1-0000-4000-8000-000000000001',
};

const TENANTS = [
  { id: IDS.tenantA, name: 'Anjali Apparel Group (demo)' },
  { id: IDS.tenantB, name: 'Deccan Steel Works (demo)' },
];

const COMPANIES = [
  { id: IDS.coA1, tenant: IDS.tenantA, name: 'Anjali Ethnic (demo)',
    brand: 'Anjali Ethnic', code: 'AE', prefix: 'AE', state: '24' },
  { id: IDS.coA2, tenant: IDS.tenantA, name: 'Anjali Western (demo)',
    brand: 'Anjali Western', code: 'AW', prefix: 'AW', state: '24' },
  { id: IDS.coB1, tenant: IDS.tenantB, name: 'Deccan Steel (demo)',
    brand: 'Deccan Steel', code: 'DS', prefix: 'DS', state: '27' },
];

/* Channels differ by trade, which is the point — the steel plant sells to dealers and projects,
   not on a fashion marketplace. Neither list is a limit and nothing counts them. */
const CHANNELS = [
  { company: IDS.coA1, code: 'D2C', name: 'Own website', kind: 'd2c' },
  { company: IDS.coA1, code: 'AMZN', name: 'Amazon', kind: 'marketplace' },
  { company: IDS.coA1, code: 'MYNT', name: 'Myntra', kind: 'marketplace' },
  { company: IDS.coA2, code: 'AMZN', name: 'Amazon', kind: 'marketplace' },
  { company: IDS.coA2, code: 'POS', name: 'Showroom counter', kind: 'pos' },
  { company: IDS.coB1, code: 'DLR', name: 'Dealer network', kind: 'b2b' },
  { company: IDS.coB1, code: 'EXP', name: 'Export desk', kind: 'export' },
];

const PRODUCTS = [
  { company: IDS.coA1, code: 'AE-1001', name: 'Anarkali set, teal chinon', set: 'Anarkali Plazo Set', mrp: 4_49_900 },
  { company: IDS.coA1, code: 'AE-1002', name: 'Lehenga choli, ivory', set: 'Lehenga Choli Set', mrp: 12_99_900 },
  { company: IDS.coA1, code: 'AE-1003', name: 'Kurti palazzo, indigo', set: 'Kurti Plazo Set', mrp: 2_19_900 },
  { company: IDS.coA2, code: 'AW-2001', name: 'Co-ord set, sand', set: 'Co-Ords Set', mrp: 3_29_900 },
  { company: IDS.coA2, code: 'AW-2002', name: 'Shirt dress, olive', set: null, mrp: 1_89_900 },
  { company: IDS.coB1, code: 'DS-500', name: 'MS angle 50x50x5', set: null, mrp: 62_500 },
  { company: IDS.coB1, code: 'DS-501', name: 'MS channel 100x50', set: null, mrp: 1_45_000 },
];

/* The apparel companies both sell on Amazon. Two rows, two companies — and their figures never
   merge. This is the case a system with one global channel table gets wrong. */
const ORDERS = [
  { company: IDS.coA1, channel: 'AMZN', number: 'AE/26-27/0001', total: 8_99_800, type: 'b2c' },
  { company: IDS.coA1, channel: 'D2C', number: 'AE/26-27/0002', total: 4_49_900, type: 'b2c' },
  { company: IDS.coA1, channel: 'MYNT', number: 'AE/26-27/0003', total: 12_99_900, type: 'b2c' },
  { company: IDS.coA2, channel: 'AMZN', number: 'AW/26-27/0001', total: 3_29_900, type: 'b2c' },
  { company: IDS.coA2, channel: 'POS', number: 'AW/26-27/0002', total: 1_89_900, type: 'pos' },
  { company: IDS.coB1, channel: 'DLR', number: 'DS/26-27/0001', total: 48_75_000, type: 'b2b' },
  { company: IDS.coB1, channel: 'EXP', number: 'DS/26-27/0002', total: 92_40_000, type: 'export' },
];

/* A design is what you sell; an ITEM is the specific thing that leaves the shelf, and it is what
   a sale line and a stock movement both point at. One item per design here, because sizes and
   colours are module 03's subject and inventing a size grid to demonstrate a sale would be data
   nobody asked for. GST rates are the real Indian apparel ones — 5% under ₹1,000 and 12% above —
   because a demonstration that computes tax with a made-up rate teaches the wrong number. */
const ITEMS = [
  { company: IDS.coA1, design: 'AE-1001', sku: 'AE-1001-FS', hsn: '6204', gst: 12, cost: 1_75_000 },
  { company: IDS.coA1, design: 'AE-1002', sku: 'AE-1002-FS', hsn: '6204', gst: 12, cost: 5_40_000 },
  { company: IDS.coA1, design: 'AE-1003', sku: 'AE-1003-FS', hsn: '6204', gst: 12, cost: 88_000 },
  { company: IDS.coA2, design: 'AW-2001', sku: 'AW-2001-FS', hsn: '6204', gst: 12, cost: 1_30_000 },
  { company: IDS.coA2, design: 'AW-2002', sku: 'AW-2002-FS', hsn: '6204', gst: 5, cost: 74_000 },
  { company: IDS.coB1, design: 'DS-500', sku: 'DS-500-EA', hsn: '7216', gst: 18, cost: 48_000 },
  { company: IDS.coB1, design: 'DS-501', sku: 'DS-501-EA', hsn: '7216', gst: 18, cost: 1_12_000 },
];

/* Stock has to come FROM somewhere and go somewhere. A sale moves it out of the godown, and the
   schema's CHECK requires at least one end of the movement to be a real location. */
const LOCATIONS = [
  { company: IDS.coA1, code: 'GDN', name: 'Main godown', type: 'godown' },
  { company: IDS.coA2, code: 'GDN', name: 'Main godown', type: 'godown' },
  { company: IDS.coB1, code: 'YARD', name: 'Yard', type: 'godown' },
];

/* The smallest chart of accounts that can post a real sale and balance. Five accounts, and each
   one is needed by the entry: the customer owes (debit debtors), the business earned (credit
   sales), and the tax collected is not income — it is money held for the government (credit GST
   output). A chart that omitted the last one would post a balanced entry with the wrong profit. */
const ACCOUNTS = [
  { code: '1100', name: 'Sundry Debtors', type: 'asset' },
  { code: '1200', name: 'Inventory', type: 'asset' },
  { code: '2100', name: 'GST Output Payable', type: 'liability' },
  { code: '4000', name: 'Sales', type: 'income' },
  { code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
];

/* OPENING STOCK. Without it the seeded sales below would be issuing from an empty shelf, and
   module 03 now refuses that — correctly. Every business starts with a count, and this is that
   count: one receipt per item into its company's godown, dated at seeding. */
const OPENING_STOCK = [
  { sku: 'AE-1001-FS', qty: 40 }, { sku: 'AE-1002-FS', qty: 12 }, { sku: 'AE-1003-FS', qty: 65 },
  { sku: 'AW-2001-FS', qty: 30 }, { sku: 'AW-2002-FS', qty: 50 },
  { sku: 'DS-500-EA',  qty: 500 }, { sku: 'DS-501-EA', qty: 220 },
];

const USERS = [
  { email: 'owner@anjali.demo', name: 'Anjali (owner)', role: 'admin',
    companies: [IDS.coA1, IDS.coA2] },
  { email: 'shop@anjali.demo', name: 'Ethnic shop manager', role: 'manager',
    companies: [IDS.coA1] },
  { email: 'owner@deccan.demo', name: 'Deccan (owner)', role: 'admin',
    companies: [IDS.coB1] },
];

async function seed() {
  return asOwner(async (d) => {
    const has = await d.query('SELECT count(*)::int c FROM tenants');
    if (has.rows[0].c > 0) return { already: true };

    for (const t of TENANTS) {
      await d.query('INSERT INTO tenants (id, name, plan) VALUES ($1,$2,$3)', [t.id, t.name, 'demo']);
    }
    for (const c of COMPANIES) {
      await d.query(
        `INSERT INTO companies (id, tenant_id, name, brand_name, brand_code, invoice_prefix, state_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [c.id, c.tenant, c.name, c.brand, c.code, c.prefix, c.state]);
    }
    const chan = new Map();
    for (const ch of CHANNELS) {
      const r = await d.query(
        `INSERT INTO channels (company_id, code, name, kind) VALUES ($1,$2,$3,$4) RETURNING id`,
        [ch.company, ch.code, ch.name, ch.kind]);
      chan.set(ch.company + '/' + ch.code, r.rows[0].id);
    }
    const design = new Map();
    for (const p of PRODUCTS) {
      const r = await d.query(
        `INSERT INTO designs (company_id, design_code, design_name, set_type, target_mrp_paise)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [p.company, p.code, p.name, p.set, p.mrp]);
      design.set(p.company + '/' + p.code, { id: r.rows[0].id, mrp: p.mrp });
    }
    for (const it of ITEMS) {
      const dz = design.get(it.company + '/' + it.design);
      await d.query(
        `INSERT INTO items (company_id, design_id, sku, hsn_code, gst_rate, cost_paise, mrp_paise)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [it.company, dz.id, it.sku, it.hsn, it.gst, it.cost, dz.mrp]);
    }
    for (const l of LOCATIONS) {
      await d.query(`INSERT INTO locations (company_id, code, name, type) VALUES ($1,$2,$3,$4)`,
        [l.company, l.code, l.name, l.type]);
    }
    /* Every company gets its own chart. An account is a business record like any other and
       carries its company_id, so two companies' Sales accounts are two rows that never merge —
       the same rule as the channels above, one layer down. */
    for (const c of COMPANIES) {
      for (const a of ACCOUNTS) {
        await d.query(`INSERT INTO accounts (company_id, code, name, type) VALUES ($1,$2,$3,$4)`,
          [c.id, a.code, a.name, a.type]);
      }
    }
    for (const o of ORDERS) {
      await d.query(
        `INSERT INTO sales_orders (company_id, channel_id, order_number, order_date, order_type, total_paise)
         VALUES ($1,$2,$3, now(), $4, $5)`,
        [o.company, chan.get(o.company + '/' + o.channel), o.number, o.type, o.total]);
    }
    /* The opening count, written as real movements so the on-hand figure is DERIVED from the
       same source as every later change — module 03 keeps no stored quantity to seed. */
    const item = new Map();
    for (const r of (await d.query('SELECT id, sku, company_id FROM items')).rows) {
      item.set(r.sku, r);
    }
    const loc = new Map();
    for (const r of (await d.query('SELECT id, company_id FROM locations')).rows) {
      loc.set(r.company_id, r.id);
    }
    for (const s of OPENING_STOCK) {
      const it = item.get(s.sku);
      await d.query(
        `INSERT INTO stock_movements
           (company_id, item_id, to_location, qty, movement_type, reference)
         VALUES ($1,$2,$3,$4,'opening','opening count')`,
        [it.company_id, it.id, loc.get(it.company_id), s.qty]);
    }

    for (const u of USERS) {
      const r = await d.query(
        `INSERT INTO users (full_name, role) VALUES ($1,$2) RETURNING id`, [u.name, u.role]);
      for (const co of u.companies) {
        await d.query(
          `INSERT INTO user_companies (user_id, company_id, role) VALUES ($1,$2,$3)`,
          [r.rows[0].id, co, u.role]);
      }
      u.id = r.rows[0].id;
    }
    return { already: false };
  });
}

/* Sign-in is by email in this demo and the emails are not in the database — `users` has no email
   column, because who a person is and how they authenticate are different subjects and the schema
   only owns the first. A real deployment puts the second behind the identity provider from the
   stack register. Stated rather than left to look like an oversight. */
function accounts() {
  return USERS.map((u) => ({ email: u.email, name: u.name, role: u.role, companies: u.companies }));
}

module.exports = { seed, accounts, IDS, TENANTS, COMPANIES };
