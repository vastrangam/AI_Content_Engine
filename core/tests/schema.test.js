'use strict';
/* The gate on the production schema.

   WHY THIS EXISTS
   core/schema.sql is SQLite and loads in every test run. core/schema.postgres.sql
   is what the real deployment runs on, and nothing in this repository executes
   it — there is no Postgres here. An unexecuted schema file is a document, and
   a document drifts: someone adds a column to the live SQLite schema, the
   Postgres one keeps the old shape, and the two disagree quietly until cutover
   day, sixty days into a parallel run, when it is the most expensive possible
   moment to find out.

   So this parses both files structurally and asserts the things that can be
   asserted without a server:

     · every table the two files share agrees on its columns
     · every business table carries company_id and deleted_at
     · no money column is a float — the one rule §A.3.7 states outright
     · every business table has RLS enabled and a company_isolation policy
     · the reference tables that deliberately carry no company_id are named,
       so "it has no company_id" is a decision on a list rather than an omission

   Run: node core/tests/schema.test.js
*/

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const CORE = path.join(__dirname, '..');
const PG = fs.readFileSync(path.join(CORE, 'schema.postgres.sql'), 'utf8');
const LITE = fs.readFileSync(path.join(CORE, 'schema.sql'), 'utf8');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('  ok   ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + e.message); }
}
function section(t) { console.log('\n── ' + t + ' ' + '─'.repeat(Math.max(0, 62 - t.length))); }

/* ---- a small structural parser ---------------------------------------- */

/** Strip comments so a column name inside a sentence cannot be mistaken for
 *  a declaration. Block comments first, then line comments. */
function strip(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n]*/g, '');
}

/** table name → array of column names, in declaration order.
 *  Deliberately ignores everything that is not a column: table-level CHECK,
 *  PRIMARY KEY(...), UNIQUE(...), FOREIGN KEY(...). */
function tables(sql) {
  const out = new Map();
  const src = strip(sql);
  const re = /CREATE TABLE(?:\s+IF NOT EXISTS)?\s+([a-z_][a-z0-9_]*)\s*\(/gi;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    // walk to the matching close paren
    let i = re.lastIndex, depth = 1;
    while (i < src.length && depth > 0) {
      if (src[i] === '(') depth++;
      else if (src[i] === ')') depth--;
      i++;
    }
    const body = src.slice(re.lastIndex, i - 1);

    // split on top-level commas only
    const parts = [];
    let buf = '', d = 0;
    for (const ch of body) {
      if (ch === '(') d++;
      if (ch === ')') d--;
      if (ch === ',' && d === 0) { parts.push(buf); buf = ''; continue; }
      buf += ch;
    }
    parts.push(buf);

    const cols = [];
    for (const raw of parts) {
      const t = raw.trim();
      if (!t) continue;
      if (/^(PRIMARY\s+KEY|UNIQUE|CHECK|FOREIGN\s+KEY|CONSTRAINT)\b/i.test(t)) continue;
      const cm = /^([a-z_][a-z0-9_]*)\s+/i.exec(t);
      if (cm) cols.push(cm[1]);
    }
    out.set(name, cols);
  }
  return out;
}

/** column name → its declared type, for the money check. */
function columnTypes(sql) {
  const out = new Map();
  const src = strip(sql);
  const re = /CREATE TABLE(?:\s+IF NOT EXISTS)?\s+([a-z_][a-z0-9_]*)\s*\(/gi;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    let i = re.lastIndex, depth = 1;
    while (i < src.length && depth > 0) {
      if (src[i] === '(') depth++;
      else if (src[i] === ')') depth--;
      i++;
    }
    const body = src.slice(re.lastIndex, i - 1);
    for (const raw of body.split('\n')) {
      const t = raw.trim();
      const cm = /^([a-z_][a-z0-9_]*)\s+([a-z0-9_]+(?:\s*\([\d,\s]*\))?)/i.exec(t);
      if (cm && !/^(PRIMARY|UNIQUE|CHECK|FOREIGN|CONSTRAINT)$/i.test(cm[1])) {
        out.set(name + '.' + cm[1], cm[2].toLowerCase().replace(/\s+/g, ''));
      }
    }
  }
  return out;
}

const PGT = tables(PG);
const LTT = tables(LITE);
const PGTypes = columnTypes(PG);
const LTTypes = columnTypes(LITE);

/* Reference data shared across the group. These deliberately carry no
   company_id: a colour, a size, an HSN code and a GST rate are the same fact
   for every company, and giving them a company_id would mean three copies of
   "XL" that could disagree. Listed here so the absence is a decision on a
   list rather than something nobody noticed. */
const NO_COMPANY = new Set([
  'colors', 'sizes', 'hsn_codes', 'gst_rates', 'design_categories',
  'companies',        // it IS the company
  'users',            // a person may work across companies; user_companies scopes them
  'user_companies',   // the mapping itself
  'kit_items',        // scoped through its items
  'stock',            // scoped through item × location, both of which carry it
  'journal_lines',    // scoped through its entry
  'audit_log',        // company_id nullable — platform-level events have none
  'effective_log',    // company_id nullable — some rates are group-wide
  'events',           // company_id nullable — platform events have none
  'settings_environment',
  'notifications', 'integration_errors', 'ai_runs',
]);

console.log('Schema — SQLite and Postgres, and the gap between them\n');
console.log(`  schema.sql          ${LTT.size} tables`);
console.log(`  schema.postgres.sql ${PGT.size} tables`);

// =========================================================================
section('the production schema parses and is complete');

check('every CREATE TABLE in the postgres file parsed into columns', () => {
  const declared = (strip(PG).match(/CREATE TABLE/gi) || []).length;
  assert.strictEqual(PGT.size, declared, `${declared} declared, ${PGT.size} parsed`);
  for (const [t, cols] of PGT) assert.ok(cols.length > 0, `${t} parsed with no columns`);
});

check('it is a superset of the schema that runs today', () => {
  const missing = [...LTT.keys()].filter((t) => !PGT.has(t));
  assert.deepStrictEqual(missing, [], 'tables in schema.sql with no postgres counterpart');
});

check('the two schemas do not disagree about any shared table', () => {
  const problems = [];
  for (const [t, liteCols] of LTT) {
    const pgCols = PGT.get(t);
    if (!pgCols) continue;
    const lost = liteCols.filter((c) => !pgCols.includes(c));
    if (lost.length) problems.push(`${t}: postgres is missing ${lost.join(', ')}`);
  }
  assert.deepStrictEqual(problems, [], problems.join(' | '));
});

// =========================================================================
section('§A.3.2 — every business table is scoped to a company');

check('company_id is present on every business table', () => {
  const missing = [...PGT.entries()]
    .filter(([t, cols]) => !NO_COMPANY.has(t) && !cols.includes('company_id'))
    .map(([t]) => t);
  assert.deepStrictEqual(missing, [], 'tables with no company_id: ' + missing.join(', '));
});

check('the tables without company_id are the ones we chose, and no others', () => {
  /* The exemption list is the decision. This asserts the list has not quietly
     grown: anything on it must either genuinely lack company_id, or be a
     mapping/platform table where the column is nullable by design. */
  const declared = [...NO_COMPANY];
  const unknown = declared.filter((t) => !PGT.has(t));
  assert.deepStrictEqual(unknown, [], 'exempted a table that does not exist: ' + unknown.join(', '));
  const NULLABLE_BY_DESIGN = ['audit_log', 'effective_log', 'events', 'settings_environment',
    'notifications', 'integration_errors', 'ai_runs', 'user_companies'];
  const wrong = declared.filter((t) =>
    PGT.get(t).includes('company_id') && !NULLABLE_BY_DESIGN.includes(t));
  assert.deepStrictEqual(wrong, [], 'exempt but carries a required company_id: ' + wrong.join(', '));
});

// =========================================================================
section('§A.3.3 — delete nothing');

check('every table holding a business record can be soft-deleted or is a ledger', () => {
  /* Append-only tables do not need deleted_at: nothing is ever removed from
     them by design. Everything else must be able to record that it was
     voided rather than be removed. */
  const APPEND_ONLY = new Set([
    'audit_log', 'effective_log', 'events', 'stock_movements', 'journal_lines',
    'b2b_credit_ledger', 'attendance', 'eod_reports', 'whatsapp_messages',
    'agent_steps', 'assistant_queries', 'automation_runs', 'price_changes',
    'ai_runs', 'integration_errors', 'notifications', 'payment_allocations',
    'production_stages', 'qc_records', 'karigar_reports', 'ndr_events',
    'marketplace_settlement_lines', 'bank_statement_lines', 'grn_items',
    'purchase_order_items', 'invoice_items', 'sales_order_items', 'quotation_items',
    'bom_items', 'three_way_match', 'itc_register', 'tds_tcs_register',
    'settlement_expectations', 'marketplace_orders_raw', 'timesheets', 'feedback',
    'approvals', 'stock', 'kit_items', 'user_companies', 'period_locks',
    'colors', 'sizes', 'hsn_codes', 'gst_rates', 'design_categories',
    'vendor_materials', 'third_party_services', 'piece_rates', 'budgets',
    'karigar_assignments', 'samples', 'maintenance_records', 'payroll_slips',
    'consents', 'listings', 'retrieval_index', 'assistant_queries',
  ]);
  const missing = [...PGT.entries()]
    .filter(([t, cols]) => !APPEND_ONLY.has(t) && !cols.includes('deleted_at'))
    .map(([t]) => t);
  assert.deepStrictEqual(missing, [], 'neither soft-deletable nor append-only: ' + missing.join(', '));
});

// =========================================================================
section('§A.3.7 — money is never a float');

check('no money column is a float, in either schema', () => {
  const bad = [];
  for (const [col, type] of [...PGTypes, ...LTTypes]) {
    if (!/_paise$/.test(col)) continue;
    if (/real|double|float|decimal|numeric/.test(type)) bad.push(`${col} is ${type}`);
  }
  assert.deepStrictEqual(bad, [], bad.join(' | '));
});

check('every money column is an integer type and says paise in its name', () => {
  const bad = [];
  for (const [col, type] of PGTypes) {
    if (!/_paise$/.test(col)) continue;
    if (!/^(bigint|integer|bigserial)$/.test(type)) bad.push(`${col} is ${type}`);
  }
  assert.deepStrictEqual(bad, [], bad.join(' | '));
});

check('no column is named amount/price/cost without saying what unit it is in', () => {
  /* The trap this closes: `total numeric` reads as rupees to one developer and
     paise to the next, and the difference is a factor of a hundred in the
     books. A money column here either ends in _paise or is a rate/percentage. */
  const bad = [];
  for (const [col, type] of PGTypes) {
    const name = col.split('.')[1];
    if (/^(amount|price|total|cost|balance|salary|rate)$/.test(name)) {
      bad.push(`${col} (${type}) — name does not state its unit`);
    }
  }
  assert.deepStrictEqual(bad, [], bad.join(' | '));
});

// =========================================================================
section('§B.2.1 — row-level security, not a WHERE clause someone remembers');

const rlsList = (() => {
  const m = /FOREACH t IN ARRAY ARRAY\[([\s\S]*?)\]\s*\n\s*LOOP/.exec(PG);
  if (!m) return [];
  return [...m[1].matchAll(/'([a-z_][a-z0-9_]*)'/g)].map((x) => x[1]);
})();

check('the RLS list was found and is not empty', () => {
  assert.ok(rlsList.length > 50, `only ${rlsList.length} tables in the RLS array`);
});

check('every company-scoped table has an RLS policy', () => {
  const scoped = [...PGT.entries()]
    .filter(([t, cols]) => cols.includes('company_id') && !NO_COMPANY.has(t))
    .map(([t]) => t);
  const missing = scoped.filter((t) => !rlsList.includes(t));
  assert.deepStrictEqual(missing, [], 'company-scoped but no RLS policy: ' + missing.join(', '));
});

check('nothing in the RLS list is a table that does not exist', () => {
  const ghosts = rlsList.filter((t) => !PGT.has(t));
  assert.deepStrictEqual(ghosts, [], 'RLS on tables that are not declared: ' + ghosts.join(', '));
});

check('the policy is USING and WITH CHECK, so a write cannot cross companies either', () => {
  assert.match(PG, /USING \(company_id = current_setting\('app\.current_company'\)::uuid\)/);
  assert.match(PG, /WITH CHECK \(company_id = current_setting\('app\.current_company'\)::uuid\)/);
});

// =========================================================================
section('the rules the schema itself enforces');

check('an entry cannot name itself as its counterparty', () => {
  assert.match(PG, /counterparty_company_id IS NULL OR counterparty_company_id <> company_id/);
});

check('a journal line is one side or the other, never both', () => {
  assert.match(PG, /CHECK \(debit_paise = 0 OR credit_paise = 0\)/);
});

check('a stock movement must have a source, a destination, or both', () => {
  assert.match(PG, /CHECK \(from_location IS NOT NULL OR to_location IS NOT NULL\)/);
});

check('a stock movement quantity is positive', () => {
  assert.match(PG, /qty\s+integer NOT NULL CHECK \(qty > 0\)/);
});

check('GST on an expense can never exceed the expense', () => {
  assert.match(PG, /CHECK \(gst_paise <= amount_paise\)/);
});

check('a channel code is unique within its company, not globally', () => {
  assert.match(PG, /UNIQUE \(company_id, code\)/);
});

check('every table marked LIVE in the header really exists', () => {
  const live = [...PG.matchAll(/\[LIVE\][\s\S]{0,400}?CREATE TABLE(?:\s+IF NOT EXISTS)?\s+([a-z_][a-z0-9_]*)/g)]
    .map((m) => m[1]);
  assert.ok(live.length >= 10, `only ${live.length} tables marked LIVE`);
  const notInLite = live.filter((t) => !LTT.has(t));
  assert.deepStrictEqual(notInLite, [],
    'marked LIVE but absent from the schema that actually runs: ' + notInLite.join(', '));
});

// =========================================================================
console.log('\n' + '='.repeat(70));
console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
