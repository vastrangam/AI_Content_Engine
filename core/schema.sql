-- The shared core. One database, every module.
--
-- Follows ERP master prompt §B.1. Three rules from §A.3 are structural here and
-- not left to application code to remember:
--
--   §A.3.2  every business table carries company_id
--   §A.3.3  audit everything, delete nothing — deleted_at, never DELETE
--   §A.3.7  money is an integer count of paise, never a float
--
-- SQLite has no DECIMAL, so every money column is INTEGER paise. That is not a
-- compromise for SQLite's sake: it is the same representation core/money.js
-- uses, and it is exact. Postgres later takes numeric(14,2) from the same
-- integers without a rounding decision.

PRAGMA foreign_keys = ON;

-- ── companies ───────────────────────────────────────────────────────────────
-- Company is not brand is not prefix. Ethnic Fashion trades as Go4Fashion, its
-- invoices read EF, and its SKUs read GF. Three columns, because collapsing
-- them to one is the single most likely modelling mistake in this system.
CREATE TABLE IF NOT EXISTS companies (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL UNIQUE,   -- legal + what reports group by
  brand_name        TEXT NOT NULL,          -- customer-facing
  brand_code        TEXT NOT NULL UNIQUE,   -- 2 chars, used in SKUs  (VS/GF/AC)
  invoice_prefix    TEXT NOT NULL UNIQUE,   -- used in invoice numbers (VS/EF/AC)
  gstin             TEXT,
  pan               TEXT,
  state_code        TEXT,                   -- drives CGST+SGST vs IGST
  positioning       TEXT,
  fy_start_month    INTEGER NOT NULL DEFAULT 4,
  is_active         INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL,
  deleted_at        TEXT
);

-- ── people and access ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin','manager','staff','karigar','customer')),
  gender        TEXT CHECK (gender IN ('M','F','O')),
  religion      TEXT,                       -- festival-leave rule only (§B.2.6)
  language_pref TEXT DEFAULT 'en',
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','on_leave','inactive')),
  hire_date     TEXT,
  exit_date     TEXT,
  created_at    TEXT NOT NULL,
  deleted_at    TEXT
);

CREATE TABLE IF NOT EXISTS user_companies (
  user_id    TEXT NOT NULL REFERENCES users(id),
  company_id TEXT NOT NULL REFERENCES companies(id),
  role       TEXT,
  PRIMARY KEY (user_id, company_id)
);

-- ── the audit trail ─────────────────────────────────────────────────────────
-- MCA rule, FY2023-24 onward: an audit trail of every edit, which cannot be
-- disabled, retained 8 years. The accounting prompt §8 is explicit that this
-- "must be architecturally impossible to turn off, not just a settings toggle".
-- So there is no flag here, no config, and core/audit.js is the only writer.
CREATE TABLE IF NOT EXISTS audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id  TEXT,
  table_name  TEXT NOT NULL,
  record_id   TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('insert','update','void','restore')),
  before_json TEXT,
  after_json  TEXT,
  changed_by  TEXT,
  changed_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_audit_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS ix_audit_when   ON audit_log(changed_at);

-- ── effective-dated values ──────────────────────────────────────────────────
-- One table for every log: salary, threshold days, piece rate, GST rate,
-- commission, channel price, credit limit. core/logs.js is the only reader, so
-- "zero rows in force" surfaces as Unresolved everywhere rather than as zero.
CREATE TABLE IF NOT EXISTS effective_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id TEXT REFERENCES companies(id),
  log_name   TEXT NOT NULL,
  key        TEXT NOT NULL,
  from_date  TEXT NOT NULL,
  to_date    TEXT,                      -- NULL = open, currently in force
  value_json TEXT NOT NULL,
  reason     TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_eff ON effective_log(log_name, key, from_date);

-- ── master data: the four-level SKU hierarchy (§A.5) ────────────────────────
CREATE TABLE IF NOT EXISTS designs (
  id             TEXT PRIMARY KEY,
  company_id     TEXT NOT NULL REFERENCES companies(id),
  design_code    TEXT NOT NULL,             -- MUSPUR
  design_name    TEXT NOT NULL,             -- MuskanPurple Anarkali
  set_type       TEXT,                      -- from the Stitching Rates Master
  category       TEXT,
  hsn_code       TEXT,
  legacy_busy_code TEXT,
  status         TEXT NOT NULL DEFAULT 'active',
  created_at     TEXT NOT NULL,
  deleted_at     TEXT,
  UNIQUE (company_id, design_code)
);

CREATE TABLE IF NOT EXISTS colors (id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, hex TEXT);
CREATE TABLE IF NOT EXISTS sizes  (id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT, sort_order INTEGER);

-- The SKU. Its string is DERIVED from the structured fields (§A.5: "searching /
-- grouping / analytics always uses the structured fields, never substring-
-- matching on the SKU"), and kept here only so a barcode can be scanned.
CREATE TABLE IF NOT EXISTS items (
  id            TEXT PRIMARY KEY,
  company_id    TEXT NOT NULL REFERENCES companies(id),
  design_id     TEXT NOT NULL REFERENCES designs(id),
  color_id      TEXT REFERENCES colors(id),
  size_id       TEXT REFERENCES sizes(id),
  sku           TEXT NOT NULL,
  barcode       TEXT,
  hsn_code      TEXT,
  gst_rate      REAL,
  uom           TEXT NOT NULL DEFAULT 'PCS',
  cost_paise    INTEGER NOT NULL DEFAULT 0,
  mrp_paise     INTEGER NOT NULL DEFAULT 0,
  is_kit        INTEGER NOT NULL DEFAULT 0,   -- feature-gap #1
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TEXT NOT NULL,
  deleted_at    TEXT,
  UNIQUE (company_id, sku)
);

-- A kit is a sellable SKU made of component SKUs. Selling it expands here and
-- decrements each component, so stock stays one number per SKU.
CREATE TABLE IF NOT EXISTS kit_items (
  kit_item_id       TEXT NOT NULL REFERENCES items(id),
  component_item_id TEXT NOT NULL REFERENCES items(id),
  qty               INTEGER NOT NULL CHECK (qty > 0),
  PRIMARY KEY (kit_item_id, component_item_id)
);

CREATE TABLE IF NOT EXISTS locations (
  id         TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  code       TEXT NOT NULL,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'godown',
  created_at TEXT NOT NULL,
  UNIQUE (company_id, code)
);

-- ── stock: one quantity per SKU per location per stage ──────────────────────
CREATE TABLE IF NOT EXISTS stock (
  item_id      TEXT NOT NULL REFERENCES items(id),
  location_id  TEXT NOT NULL REFERENCES locations(id),
  stage        TEXT NOT NULL DEFAULT 'packed',
  qty          INTEGER NOT NULL DEFAULT 0,
  qty_reserved INTEGER NOT NULL DEFAULT 0,
  updated_at   TEXT,
  PRIMARY KEY (item_id, location_id, stage)
);

-- Every transition writes one row. Immutable — this is the ledger of stock, and
-- the quantities above are only its running balance.
CREATE TABLE IF NOT EXISTS stock_movements (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id    TEXT NOT NULL REFERENCES companies(id),
  item_id       TEXT NOT NULL REFERENCES items(id),
  from_location TEXT, from_stage TEXT,
  to_location   TEXT, to_stage   TEXT,
  qty           INTEGER NOT NULL,
  movement_type TEXT NOT NULL,
  reference     TEXT,
  moved_at      TEXT NOT NULL,
  moved_by      TEXT
);
CREATE INDEX IF NOT EXISTS ix_move_item ON stock_movements(item_id, moved_at);

-- ── books: one posting engine, every voucher ────────────────────────────────
-- Accounting prompt §3: "every voucher writes to the general ledger through one
-- shared posting engine — no voucher type should have its own separate
-- ledger-update logic. This is where most home-built accounting tools break."
CREATE TABLE IF NOT EXISTS accounts (
  id         TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  code       TEXT NOT NULL,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('asset','liability','equity','income','expense')),
  parent_id  TEXT REFERENCES accounts(id),
  is_group   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  deleted_at TEXT,
  UNIQUE (company_id, code)
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id             TEXT PRIMARY KEY,
  company_id     TEXT NOT NULL REFERENCES companies(id),
  voucher_type   TEXT NOT NULL,
  voucher_number TEXT,
  voucher_date   TEXT NOT NULL,
  narration      TEXT,
  reference      TEXT,
  status         TEXT NOT NULL DEFAULT 'posted' CHECK (status IN ('draft','posted','void')),
  posted_at      TEXT,
  posted_by      TEXT,
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_je_date ON journal_entries(company_id, voucher_date);

CREATE TABLE IF NOT EXISTS journal_lines (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id     TEXT NOT NULL REFERENCES journal_entries(id),
  account_id   TEXT NOT NULL REFERENCES accounts(id),
  debit_paise  INTEGER NOT NULL DEFAULT 0 CHECK (debit_paise  >= 0),
  credit_paise INTEGER NOT NULL DEFAULT 0 CHECK (credit_paise >= 0),
  party_id     TEXT,
  narration    TEXT,
  CHECK (debit_paise = 0 OR credit_paise = 0)   -- a line is one side or the other
);
CREATE INDEX IF NOT EXISTS ix_jl_entry ON journal_lines(entry_id);

-- Once a period is locked, no backdated edit is possible without an admin
-- unlock — and the unlock itself is audited (accounting prompt §8).
CREATE TABLE IF NOT EXISTS period_locks (
  company_id TEXT NOT NULL REFERENCES companies(id),
  period     TEXT NOT NULL,               -- 'YYYY-MM'
  locked_at  TEXT NOT NULL,
  locked_by  TEXT,
  PRIMARY KEY (company_id, period)
);

-- ── the cascade bus ─────────────────────────────────────────────────────────
-- Every cross-module effect is an event, recorded. modules.js declares which
-- module reads and writes what; core/events.js turns those declarations into
-- subscriptions, and this table is the evidence that a cascade actually fired.
CREATE TABLE IF NOT EXISTS events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id   TEXT,
  name         TEXT NOT NULL,
  source_module TEXT NOT NULL,
  payload_json TEXT,
  occurred_at  TEXT NOT NULL,
  handled_by   TEXT
);
CREATE INDEX IF NOT EXISTS ix_events_name ON events(name, occurred_at);
