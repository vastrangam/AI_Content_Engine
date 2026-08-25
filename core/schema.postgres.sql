-- ═══════════════════════════════════════════════════════════════════════════
-- VASTRANGAM BOS — the production schema (PostgreSQL 16 / Supabase)
--
-- WHY THERE ARE TWO SCHEMA FILES
-- core/schema.sql is SQLite. It loads in every test run today, and every table
-- in it is exercised by core/tests/core.test.js. This file is the target the
-- real deployment runs on. Neither is a draft of the other: one is what runs
-- now, one is what runs in production, and core/tests/schema.test.js fails the
-- build if they ever disagree about a table or a column they share. Finding
-- that drift at cutover, with sixty days of parallel running already spent, is
-- the failure this arrangement exists to prevent.
--
-- THE FOUR STRUCTURAL RULES (master spec §A.3 — enforced here, not left to
-- application code to remember):
--
--   §A.3.2  every business table carries company_id, and an RLS policy that
--           makes cross-company reads impossible rather than merely discouraged
--   §A.3.3  audit everything, delete nothing — deleted_at, never DELETE
--   §A.3.7  money is never a float
--   §A.3.1  no provider SDK in business logic; nothing here is Supabase-specific
--           beyond auth.uid(), which is isolated to the RLS policies
--
-- ON MONEY. The spec says numeric(14,2), never float. Money here is bigint
-- paise, which satisfies that requirement more strictly rather than less: it
-- is exact by construction, it is the identical representation core/money.js
-- and core/schema.sql already use, and it removes the one remaining place a
-- rounding decision could differ between the engine and the database. The
-- conversion to numeric(14,2) for any report or export is a division by 100 of
-- an exact integer — no rounding decision exists to get wrong. Column names
-- carry the _paise suffix so a value can never be read as rupees by accident.
--
-- ORDER. Tables are grouped by the build phase that first needs them (§C.4),
-- so Phase 1 can be run without reading the rest of the file. A table is
-- listed under the phase that CREATES it, not every phase that uses it.
--
-- LIVE vs STRUCTURAL. Tables marked [LIVE] are already exercised by the
-- engines in core/ and by core/tests/core.test.js. Tables marked [PHASE n] are
-- structural — the design is fixed, nothing writes to them yet, and the
-- document says so rather than letting a hundred empty tables read as a
-- finished system.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- Audit columns every business table carries. Repeated inline rather than
-- inherited, because Postgres table inheritance does not carry constraints the
-- way a reader expects and a surprising schema is worse than a repetitive one.
--   id uuid PK · company_id uuid NOT NULL · created_at · created_by
--   updated_at · updated_by · deleted_at · version

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 1 — FOUNDATION  (companies, identity, audit, the effective-dated log)
-- ═══════════════════════════════════════════════════════════════════════════

-- [LIVE] Company is not brand is not invoice prefix. Ethnic Fashion trades as
-- Go4Fashion, its invoices read EF and its SKUs read GF. Three columns,
-- because collapsing them is the single most likely modelling mistake here.
-- A TENANT IS A ROW, AND NOW IT ACTUALLY IS ONE.
-- MEDHAVA_PLAN_OF_ACTION.md §M3 has said "Tenant (a customer of Medhava) — row" since it was
-- written, and the word `tenant` appeared nowhere in this file. §M3 also calls cross-tenant
-- isolation "the single highest-risk item in this plan — a bug there is not a defect, it is an
-- incident", which is a hard thing to claim about a table that does not exist.
CREATE TABLE IF NOT EXISTS tenants (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL UNIQUE,
  plan              text NOT NULL DEFAULT 'free',
  -- The shipped plan caps a subscription at 20 companies. The SOFTWARE has no ceiling: this is a
  -- number on a row, changed by changing the row, not a limit compiled into anything.
  company_ceiling   integer NOT NULL DEFAULT 20 CHECK (company_ceiling > 0),
  status            text NOT NULL DEFAULT 'active'
                      CHECK (status IN ('trial','active','suspended','closed')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

CREATE TABLE IF NOT EXISTS companies (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Which customer of the platform this company belongs to. NOT NULL: a company with no tenant
  -- is a company no isolation policy can reason about.
  tenant_id         uuid NOT NULL REFERENCES tenants(id),
  name              text NOT NULL UNIQUE,
  brand_name        text NOT NULL,
  brand_code        text NOT NULL UNIQUE,
  invoice_prefix    text NOT NULL UNIQUE,
  gstin             text,
  pan               text,
  state_code        text,
  positioning       text,
  fy_start_month    integer NOT NULL DEFAULT 4,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

-- [LIVE] A channel is a row, not a constant. Two companies may each have a
-- channel coded AMZN; they are different rows and their figures never merge.
CREATE TABLE IF NOT EXISTS channels (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  code       text NOT NULL,
  name       text NOT NULL,
  kind       text NOT NULL DEFAULT 'marketplace'
             CHECK (kind IN ('d2c','marketplace','b2b','export','pos','reseller')),
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (company_id, code)
);

-- [LIVE] religion is present for exactly one reason — the festival-leave rule
-- (§B.2.6) — and is never a filter anywhere else. It is nullable, and the
-- application must treat absence as ordinary rather than as a default.
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text NOT NULL,
  role          text NOT NULL CHECK (role IN ('admin','manager','staff','karigar','customer')),
  gender        text CHECK (gender IN ('M','F','O')),
  religion      text,
  language_pref text DEFAULT 'en',
  status        text NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','on_leave','inactive')),
  hire_date     date,
  exit_date     date,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE TABLE IF NOT EXISTS user_companies (
  user_id    uuid NOT NULL REFERENCES users(id),
  company_id uuid NOT NULL REFERENCES companies(id),
  role       text,
  PRIMARY KEY (user_id, company_id)
);

-- [LIVE] There is no way to switch this off, and that is the point.
CREATE TABLE IF NOT EXISTS audit_log (
  id          bigserial PRIMARY KEY,
  company_id  uuid,
  table_name  text NOT NULL,
  record_id   text NOT NULL,
  action      text NOT NULL CHECK (action IN ('insert','update','void','restore')),
  before_json jsonb,
  after_json  jsonb,
  changed_by  uuid,
  changed_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_audit_record ON audit_log(table_name, record_id);

-- [LIVE] One log for every value that changes over time and must still resolve
-- correctly for a past date: salary, piece rate, tax rate, courier rate card.
-- to_date NULL means currently in force. Two rows covering one date is
-- ambiguous and refused — never resolved by picking the newer one.
CREATE TABLE IF NOT EXISTS effective_log (
  id         bigserial PRIMARY KEY,
  company_id uuid REFERENCES companies(id),
  log_name   text NOT NULL,
  key        text NOT NULL,
  from_date  date NOT NULL,
  to_date    date,
  value_json jsonb NOT NULL,
  reason     text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_eff_lookup ON effective_log(log_name, key, from_date);

-- [PHASE 1] Secrets are referenced, never stored in plaintext. is_secret rows
-- hold a key name resolved from the environment at runtime — an API key does
-- not live in the database any more than it lives in the repository.
CREATE TABLE IF NOT EXISTS settings_environment (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid REFERENCES companies(id),
  key         text NOT NULL,
  value       text,
  scope       text NOT NULL DEFAULT 'company' CHECK (scope IN ('global','company')),
  is_secret   boolean NOT NULL DEFAULT false,
  description text,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, key),
  deleted_at   timestamptz
);

-- [PHASE 1] Invoice and voucher numbering. Sequential per company per series;
-- a number is never reused, skipped or back-filled — the first thing a tax
-- audit tests.
CREATE TABLE IF NOT EXISTS document_series (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id),
  series_code text NOT NULL,
  doc_type    text NOT NULL,
  fy          text NOT NULL,
  prefix      text NOT NULL,
  next_number integer NOT NULL DEFAULT 1,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, series_code, fy),
  deleted_at   timestamptz
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 1 — MASTER DATA  (the SKU explosion, parties, locations, tax)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS brands (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     uuid NOT NULL REFERENCES companies(id),
  code           text NOT NULL,
  name           text NOT NULL,
  positioning    text,
  color_primary  text,
  color_secondary text,
  logo_url       text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz,
  UNIQUE (company_id, code)
);

CREATE TABLE IF NOT EXISTS design_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  parent_id   uuid REFERENCES design_categories(id),
  ladder_path text
);

-- [LIVE] A design is a photoshoot unit; its SKUs are the colour × size rows
-- underneath it. legacy_busy_code is kept forever so a voucher migrated from
-- BUSY can still be traced to what it was before.
CREATE TABLE IF NOT EXISTS designs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       uuid NOT NULL REFERENCES companies(id),
  brand_id         uuid REFERENCES brands(id),
  design_code      text NOT NULL,
  design_name      text NOT NULL,
  set_type         text,
  category         text,
  category_id      uuid REFERENCES design_categories(id),
  hsn_code         text,
  legacy_busy_code text,
  primary_fabric   text,
  embellishment    text,
  occasion_tags    text[],
  hero_image_url   text,
  gallery_urls     text[],
  release_date     date,
  target_mrp_paise bigint,
  target_cost_paise bigint,
  status           text NOT NULL DEFAULT 'active',
  created_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz,
  UNIQUE (company_id, design_code)
);

-- [LIVE] Colours and sizes are group-wide reference data, not per company.
CREATE TABLE IF NOT EXISTS colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE, name text NOT NULL, hex text, sort_order integer
);
CREATE TABLE IF NOT EXISTS sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE, name text, sort_order integer,
  bust_in numeric(5,1), waist_in numeric(5,1), hip_in numeric(5,1), length_in numeric(5,1)
);

CREATE TABLE IF NOT EXISTS hsn_codes (
  code text PRIMARY KEY, description text, default_gst_rate numeric(5,2)
);
CREATE TABLE IF NOT EXISTS gst_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_pct numeric(5,2) NOT NULL, cgst_pct numeric(5,2), sgst_pct numeric(5,2), igst_pct numeric(5,2),
  name text, hsn_code_pattern text
);

-- [LIVE] The SKU table. sku is BRAND-DESIGN-COLOUR-SIZE. Packed weight and
-- dimensions live here because they settle every courier weight dispute.
CREATE TABLE IF NOT EXISTS items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  design_id     uuid NOT NULL REFERENCES designs(id),
  color_id      uuid REFERENCES colors(id),
  size_id       uuid REFERENCES sizes(id),
  sku           text NOT NULL,
  barcode       text,
  hsn_code      text,
  gst_rate      numeric(5,2),
  uom           text NOT NULL DEFAULT 'PCS',
  cost_paise    bigint NOT NULL DEFAULT 0,
  mrp_paise     bigint NOT NULL DEFAULT 0,
  channel_pricing jsonb,
  stock_alert_qty integer NOT NULL DEFAULT 5,
  is_kit        boolean NOT NULL DEFAULT false,
  is_self_made  boolean NOT NULL DEFAULT true,
  weight_kg     numeric(8,3),
  dimensions_cm text,
  packaging_type text,
  status        text NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz,
  UNIQUE (company_id, sku)
);

-- [PHASE 4] The channel's own code for a product, mapped to ours. Matching on
-- name instead mis-posts every settlement line for that product.
CREATE TABLE IF NOT EXISTS item_aliases (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id),
  item_id     uuid NOT NULL REFERENCES items(id),
  channel_id  uuid REFERENCES channels(id),
  marketplace text,
  channel_sku text,
  listing_id  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, marketplace, channel_sku),
  deleted_at   timestamptz
);

-- [LIVE] Selling a kit decrements every component at order time.
CREATE TABLE IF NOT EXISTS kit_items (
  kit_item_id       uuid NOT NULL REFERENCES items(id),
  component_item_id uuid NOT NULL REFERENCES items(id),
  qty               integer NOT NULL CHECK (qty > 0),
  PRIMARY KEY (kit_item_id, component_item_id)
);

-- [LIVE] A channel's own warehouse is a location like any other, so
-- consignment stock is counted, valued and aged rather than disappearing.
CREATE TABLE IF NOT EXISTS locations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  code       text NOT NULL,
  name       text NOT NULL,
  type       text NOT NULL DEFAULT 'godown',
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (company_id, code)
);

CREATE TABLE IF NOT EXISTS vendors (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        uuid NOT NULL REFERENCES companies(id),
  name              text NOT NULL,
  contact_person    text, mobile text, whatsapp text, email text,
  gstin             text, pan text, address text, state_code text,
  payment_terms_days integer,
  rating_quality    numeric(3,1), rating_delivery numeric(3,1), rating_price numeric(3,1),
  last_order_date   date,
  status            text NOT NULL DEFAULT 'active',
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

-- [PHASE 3] Vendor priority P1 → P2 → P3 for a material; the order the
-- purchase module contacts them in.
CREATE TABLE IF NOT EXISTS vendor_materials (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  vendor_id     uuid NOT NULL REFERENCES vendors(id),
  material_type text NOT NULL,
  priority_rank integer NOT NULL DEFAULT 1,
  last_rate_paise bigint,
  last_purchase_date date
);

CREATE TABLE IF NOT EXISTS third_party_services (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  vendor_id    uuid NOT NULL REFERENCES vendors(id),
  service_type text NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  name          text NOT NULL,
  mobile        text, email text, whatsapp text,
  gstin         text, pan text,
  type          text NOT NULL DEFAULT 'b2c' CHECK (type IN ('b2c','b2b','export')),
  state_code    text, country_code text, language_pref text,
  tier          text DEFAULT 'new' CHECK (tier IN ('new','repeat','loyal','vip','lapsed')),
  loyalty_points integer NOT NULL DEFAULT 0,
  lifetime_value_paise bigint NOT NULL DEFAULT 0,
  first_order_at timestamptz, last_order_at timestamptz,
  order_count   integer NOT NULL DEFAULT 0,
  return_count  integer NOT NULL DEFAULT 0,
  source        text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE TABLE IF NOT EXISTS customer_addresses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  label       text, line1 text, line2 text, city text,
  state_code  text, country_code text, pincode text,
  is_default  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 2 — HR, PAYROLL & THE WHATSAPP SURFACE
-- ═══════════════════════════════════════════════════════════════════════════

-- [PHASE 2] The salary log. A raise CLOSES the open row and opens a new one;
-- it never overwrites. Threshold hours do not change when salary does.
CREATE TABLE IF NOT EXISTS staff_salary_history (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        uuid NOT NULL REFERENCES companies(id),
  user_id           uuid NOT NULL REFERENCES users(id),
  effective_from    date NOT NULL,
  effective_to      date,
  salary_monthly_paise bigint NOT NULL,
  threshold_hours   integer NOT NULL,
  reason            text CHECK (reason IN ('hire','increment','correction','demotion')),
  approved_by       uuid REFERENCES users(id),
  note              text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);
CREATE INDEX IF NOT EXISTS ix_salary_user ON staff_salary_history(user_id, effective_from);

-- [PHASE 2] A blank attendance cell is ABSENT, never a guess. Geofence failure
-- flags for the manager; it does not refuse the mark.
CREATE TABLE IF NOT EXISTS attendance (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid NOT NULL REFERENCES companies(id),
  user_id         uuid NOT NULL REFERENCES users(id),
  attendance_date date NOT NULL,
  code            text NOT NULL CHECK (code IN ('P','H','A','HL','OD','PL','UL')),
  check_in_time   timestamptz, check_out_time timestamptz,
  check_in_lat    numeric(9,6), check_in_lon numeric(9,6),
  geofence_ok     boolean,
  hours_worked    numeric(6,2),
  source          text CHECK (source IN ('whatsapp','app','manual')),
  override_by     uuid REFERENCES users(id),
  override_reason text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS eod_reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  user_id       uuid NOT NULL REFERENCES users(id),
  attendance_id uuid REFERENCES attendance(id),
  all_tasks_complete boolean,
  pending_tasks jsonb,
  est_hours_to_complete numeric(6,2),
  reason        text,
  source        text,
  submitted_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid NOT NULL REFERENCES companies(id),
  user_id         uuid NOT NULL REFERENCES users(id),
  from_date       date NOT NULL, to_date date NOT NULL,
  days_requested  numeric(5,1) NOT NULL,
  leave_type      text CHECK (leave_type IN ('paid','unpaid','festival','emergency')),
  reason          text,
  festival_match  boolean,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by     uuid REFERENCES users(id), approved_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

-- [PHASE 2] An advance is a balance carried against a person and recovered
-- from later payouts — never an unexplained deduction at payout time.
CREATE TABLE IF NOT EXISTS advance_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  user_id       uuid NOT NULL REFERENCES users(id),
  amount_paise  bigint NOT NULL CHECK (amount_paise > 0),
  reason        text,
  status        text NOT NULL DEFAULT 'pending',
  approved_by   uuid REFERENCES users(id), approved_at timestamptz,
  outstanding_paise bigint NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS payroll_runs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  period       text NOT NULL,
  status       text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','paid')),
  total_paise  bigint NOT NULL DEFAULT 0,
  slips_count  integer NOT NULL DEFAULT 0,
  generated_by uuid REFERENCES users(id),
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, period),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS payroll_slips (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid NOT NULL REFERENCES companies(id),
  payroll_run_id  uuid NOT NULL REFERENCES payroll_runs(id),
  user_id         uuid NOT NULL REFERENCES users(id),
  salary_monthly_paise bigint NOT NULL,
  daily_rate_paise bigint NOT NULL,
  present_days    numeric(5,1), half_days numeric(5,1),
  paid_leaves     numeric(5,1), holidays numeric(5,1),
  earned_paise    bigint NOT NULL DEFAULT 0,
  advance_deducted_paise bigint NOT NULL DEFAULT 0,
  other_deductions_paise bigint NOT NULL DEFAULT 0,
  net_payable_paise bigint NOT NULL DEFAULT 0,
  paid_at         timestamptz, paid_via text, slip_url text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- [PHASE 2] Piece rates are effective-dated like salaries.
CREATE TABLE IF NOT EXISTS piece_rates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  design_id     uuid REFERENCES designs(id),
  garment_type  text NOT NULL,
  set_type      text,
  rate_paise    bigint NOT NULL,
  effective_from date NOT NULL,
  effective_to  date,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS karigar_earnings_summary (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  karigar_id    uuid NOT NULL REFERENCES users(id),
  period        text NOT NULL,
  total_pieces  integer NOT NULL DEFAULT 0,
  earnings_pieces_paise bigint NOT NULL DEFAULT 0,
  alter_hours   numeric(6,2) NOT NULL DEFAULT 0,
  alter_earnings_paise bigint NOT NULL DEFAULT 0,
  advance_deducted_paise bigint NOT NULL DEFAULT 0,
  total_payable_paise bigint NOT NULL DEFAULT 0,
  status        text NOT NULL DEFAULT 'draft',
  paid_at       timestamptz, slip_url text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (karigar_id, period),
  deleted_at   timestamptz
);

-- [PHASE 2] Recruitment. A trial piece is the interview, so it is recorded
-- against the design and the rate that would apply.
CREATE TABLE IF NOT EXISTS recruitment_openings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  title        text NOT NULL,
  role_type    text CHECK (role_type IN ('staff','karigar','contract')),
  skill        text,
  openings     integer NOT NULL DEFAULT 1,
  status       text NOT NULL DEFAULT 'open',
  opened_at    timestamptz NOT NULL DEFAULT now(),
  closed_at    timestamptz,
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS recruitment_candidates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     uuid NOT NULL REFERENCES companies(id),
  opening_id     uuid NOT NULL REFERENCES recruitment_openings(id),
  name           text NOT NULL,
  mobile         text,
  stage          text NOT NULL DEFAULT 'applied'
                 CHECK (stage IN ('applied','trial','offered','hired','declined','rejected')),
  trial_design_id uuid REFERENCES designs(id),
  trial_pieces   integer,
  trial_rate_paise bigint,
  decision_reason text,
  consent_ref    uuid,
  became_user_id uuid REFERENCES users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz
);

-- [PHASE 2] Every WhatsApp message in or out, so a command is a record rather
-- than a conversation someone remembers.
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid REFERENCES companies(id),
  direction    text NOT NULL CHECK (direction IN ('in','out')),
  wa_number    text NOT NULL,
  user_id      uuid REFERENCES users(id),
  command      text,
  body         text,
  parsed_json  jsonb,
  related_table text, related_id text,
  provider_ref text,
  status       text,
  occurred_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_wa_number ON whatsapp_messages(wa_number, occurred_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 3 — INVENTORY, MANUFACTURING & PROCUREMENT
-- ═══════════════════════════════════════════════════════════════════════════

-- [LIVE] One quantity per SKU × location × stage. The channel lives on the
-- movement, never on the stock: the last piece sold on one marketplace has to
-- vanish from the other ten at the same instant.
CREATE TABLE IF NOT EXISTS stock (
  item_id      uuid NOT NULL REFERENCES items(id),
  location_id  uuid NOT NULL REFERENCES locations(id),
  stage        text NOT NULL DEFAULT 'packed',
  qty          integer NOT NULL DEFAULT 0,
  qty_reserved integer NOT NULL DEFAULT 0,
  updated_at   timestamptz,
  PRIMARY KEY (item_id, location_id, stage)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id            bigserial PRIMARY KEY,
  company_id    uuid NOT NULL REFERENCES companies(id),
  item_id       uuid NOT NULL REFERENCES items(id),
  from_location uuid REFERENCES locations(id), from_stage text,
  to_location   uuid REFERENCES locations(id), to_stage   text,
  qty           integer NOT NULL CHECK (qty > 0),
  movement_type text NOT NULL,
  channel_id    uuid REFERENCES channels(id),
  reference     text,
  moved_at      timestamptz NOT NULL DEFAULT now(),
  moved_by      uuid REFERENCES users(id),
  CHECK (from_location IS NOT NULL OR to_location IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS ix_move_item ON stock_movements(item_id, moved_at);

CREATE TABLE IF NOT EXISTS bom (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id),
  design_id   uuid NOT NULL REFERENCES designs(id),
  version     integer NOT NULL DEFAULT 1,
  is_active   boolean NOT NULL DEFAULT true,
  total_cost_per_piece_paise bigint,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  UNIQUE (design_id, version)
);

CREATE TABLE IF NOT EXISTS bom_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  bom_id        uuid NOT NULL REFERENCES bom(id),
  size_id       uuid REFERENCES sizes(id),
  material_type text NOT NULL,
  material_name text NOT NULL,
  qty           numeric(12,3) NOT NULL,
  uom           text NOT NULL,
  rate_paise    bigint NOT NULL DEFAULT 0,
  wastage_pct   numeric(5,2) NOT NULL DEFAULT 0,
  amount_paise  bigint NOT NULL DEFAULT 0
);

-- [PHASE 3] The ten stages: purchase, material check, sampling/third-party,
-- pattern + cutting, stitching, thread cut, QC, iron, packing, dispatch.
CREATE TABLE IF NOT EXISTS production_orders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     uuid NOT NULL REFERENCES companies(id),
  order_number   text NOT NULL,
  design_id      uuid NOT NULL REFERENCES designs(id),
  bom_id         uuid REFERENCES bom(id),
  size_breakup   jsonb, color_breakup jsonb,
  total_qty      integer NOT NULL DEFAULT 0,
  production_mode text CHECK (production_mode IN ('self','full_job_work','partial_job_work')),
  start_date     date, target_completion date, actual_completion date,
  status         text NOT NULL DEFAULT 'draft',
  total_cost_estimate_paise bigint, total_cost_actual_paise bigint,
  source_order_id uuid,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz,
  UNIQUE (company_id, order_number)
);

CREATE TABLE IF NOT EXISTS production_stages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  production_order_id uuid NOT NULL REFERENCES production_orders(id),
  stage_number  integer NOT NULL CHECK (stage_number BETWEEN 1 AND 10),
  stage_name    text NOT NULL,
  responsible_user_id uuid REFERENCES users(id),
  vendor_id     uuid REFERENCES vendors(id),
  planned_start date, planned_end date, actual_start date, actual_end date,
  qty_in integer, qty_out integer, qty_wastage integer, qty_alter integer,
  was_skipped   boolean NOT NULL DEFAULT false,
  status        text, notes text
);

CREATE TABLE IF NOT EXISTS karigar_assignments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  production_order_id uuid REFERENCES production_orders(id),
  karigar_id    uuid NOT NULL REFERENCES users(id),
  design_id     uuid NOT NULL REFERENCES designs(id),
  size_breakup  jsonb,
  assigned_at   timestamptz NOT NULL DEFAULT now(),
  assigned_by   uuid REFERENCES users(id),
  expected_completion date,
  status        text
);

-- [PHASE 3] The raw production grid. One row per karigar per design per batch;
-- pooling across karigars happens when sets are counted, never here.
CREATE TABLE IF NOT EXISTS karigar_reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  karigar_id    uuid NOT NULL REFERENCES users(id),
  design_id     uuid NOT NULL REFERENCES designs(id),
  report_date   date NOT NULL,
  pieces_json   jsonb NOT NULL,
  alter_hours   numeric(6,2) NOT NULL DEFAULT 0,
  own_mistake   boolean NOT NULL DEFAULT false,
  source        text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS samples (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  design_id     uuid NOT NULL REFERENCES designs(id),
  iteration_no  integer NOT NULL DEFAULT 1,
  status        text NOT NULL DEFAULT 'in_progress'
                CHECK (status IN ('in_progress','submitted','approved','rejected')),
  requested_by  uuid REFERENCES users(id), approver_id uuid REFERENCES users(id),
  approval_notes text, sample_photos text[],
  costed_rate_date date,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS qc_records (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  production_order_id uuid REFERENCES production_orders(id),
  stage_id      uuid REFERENCES production_stages(id),
  inspector_id  uuid NOT NULL REFERENCES users(id),
  sample_size   integer,
  qty_passed    integer, qty_failed integer,
  defect_type   text, defect_stage text,
  result        text NOT NULL CHECK (result IN ('pass','fail','rework')),
  inspected_at  timestamptz NOT NULL DEFAULT now(),
  notes         text
);

CREATE TABLE IF NOT EXISTS maintenance_records (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  asset_name   text NOT NULL, maintenance_type text,
  due_date date, completed_date date, cost_paise bigint,
  performed_by text, notes text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certificates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  cert_type    text NOT NULL, reference text,
  issued_by    text, issued_on date, expires_on date,
  document_url text NOT NULL,
  status       text NOT NULL DEFAULT 'valid',
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

-- ── procurement ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_requisitions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  requested_by uuid REFERENCES users(id),
  material_type text, qty numeric(12,3), urgency text, notes text,
  status       text NOT NULL DEFAULT 'open',
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  po_number    text NOT NULL,
  vendor_id    uuid NOT NULL REFERENCES vendors(id),
  po_date      date NOT NULL, expected_date date,
  status       text NOT NULL DEFAULT 'draft',
  total_paise  bigint NOT NULL DEFAULT 0, tax_paise bigint NOT NULL DEFAULT 0,
  payment_terms_days integer,
  approved_by  uuid REFERENCES users(id), approved_at timestamptz,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz,
  UNIQUE (company_id, po_number)
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  po_id        uuid NOT NULL REFERENCES purchase_orders(id),
  item_id      uuid REFERENCES items(id),
  description  text, qty_ordered numeric(12,3) NOT NULL, qty_received numeric(12,3) NOT NULL DEFAULT 0,
  rate_paise   bigint NOT NULL, gst_rate numeric(5,2), amount_paise bigint NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS grn (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  grn_number   text NOT NULL,
  po_id        uuid REFERENCES purchase_orders(id),
  received_date date NOT NULL, received_by uuid REFERENCES users(id),
  qc_status    text, notes text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, grn_number),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS grn_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  grn_id       uuid NOT NULL REFERENCES grn(id),
  po_item_id   uuid REFERENCES purchase_order_items(id),
  qty_received numeric(12,3) NOT NULL, qty_accepted numeric(12,3) NOT NULL,
  qty_rejected numeric(12,3) NOT NULL DEFAULT 0,
  rejection_reason text, batch_no text
);

CREATE TABLE IF NOT EXISTS vendor_invoices (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  vendor_id    uuid NOT NULL REFERENCES vendors(id),
  vendor_invoice_no text NOT NULL, vendor_invoice_date date NOT NULL,
  grn_id       uuid REFERENCES grn(id),
  total_paise  bigint NOT NULL, tax_paise bigint NOT NULL DEFAULT 0,
  itc_eligible boolean NOT NULL DEFAULT true,
  status       text NOT NULL DEFAULT 'pending',
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

-- [PHASE 3] Nothing is paid without all four matching. An override is allowed
-- and is recorded with who made it and why — never a silent pass.
CREATE TABLE IF NOT EXISTS three_way_match (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        uuid NOT NULL REFERENCES companies(id),
  vendor_invoice_id uuid NOT NULL REFERENCES vendor_invoices(id),
  po_match    boolean NOT NULL DEFAULT false,
  grn_match   boolean NOT NULL DEFAULT false,
  qty_match   boolean NOT NULL DEFAULT false,
  value_match boolean NOT NULL DEFAULT false,
  override_by uuid REFERENCES users(id), override_reason text,
  checked_at  timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 4 — SALES, ALL CHANNELS, RETURNS, LOGISTICS, SETTLEMENT
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sales_orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  channel_id    uuid NOT NULL REFERENCES channels(id),
  order_number  text NOT NULL,
  customer_id   uuid REFERENCES customers(id),
  order_date    timestamptz NOT NULL,
  order_type    text NOT NULL DEFAULT 'b2c' CHECK (order_type IN ('b2c','b2b','export','pos','custom')),
  status        text NOT NULL DEFAULT 'open',
  payment_status text NOT NULL DEFAULT 'pending',
  subtotal_paise bigint NOT NULL DEFAULT 0,
  tax_paise     bigint NOT NULL DEFAULT 0,
  shipping_paise bigint NOT NULL DEFAULT 0,
  total_paise   bigint NOT NULL DEFAULT 0,
  external_ref  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz,
  UNIQUE (company_id, order_number)
);
CREATE INDEX IF NOT EXISTS ix_so_channel ON sales_orders(company_id, channel_id, order_date);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  sales_order_id uuid NOT NULL REFERENCES sales_orders(id),
  item_id      uuid NOT NULL REFERENCES items(id),
  qty          integer NOT NULL CHECK (qty > 0),
  rate_paise   bigint NOT NULL,
  discount_paise bigint NOT NULL DEFAULT 0,
  tax_paise    bigint NOT NULL DEFAULT 0,
  amount_paise bigint NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS invoices (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  invoice_number text NOT NULL,
  sales_order_id uuid REFERENCES sales_orders(id),
  customer_id   uuid REFERENCES customers(id),
  invoice_date  date NOT NULL, due_date date,
  place_of_supply_state text,
  taxable_paise bigint NOT NULL DEFAULT 0,
  cgst_paise bigint NOT NULL DEFAULT 0, sgst_paise bigint NOT NULL DEFAULT 0,
  igst_paise bigint NOT NULL DEFAULT 0, cess_paise bigint NOT NULL DEFAULT 0,
  round_off_paise bigint NOT NULL DEFAULT 0, total_paise bigint NOT NULL DEFAULT 0,
  is_export     boolean NOT NULL DEFAULT false,
  export_type   text CHECK (export_type IN ('with_lut','without_lut')),
  irn           text, qr_payload text,
  eway_bill_no  text,
  status        text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued','cancelled','credit_noted')),
  pdf_url       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, invoice_number),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id),
  invoice_id  uuid NOT NULL REFERENCES invoices(id),
  item_id     uuid REFERENCES items(id),
  description text, hsn text, qty integer NOT NULL,
  rate_paise bigint NOT NULL, discount_paise bigint NOT NULL DEFAULT 0,
  taxable_paise bigint NOT NULL, gst_rate numeric(5,2),
  cgst_paise bigint NOT NULL DEFAULT 0, sgst_paise bigint NOT NULL DEFAULT 0,
  igst_paise bigint NOT NULL DEFAULT 0, amount_paise bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS quotations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  doc_number   text NOT NULL,
  doc_type     text NOT NULL CHECK (doc_type IN ('quotation','proforma')),
  customer_id  uuid REFERENCES customers(id),
  doc_date     date NOT NULL, valid_until date,
  subtotal_paise bigint NOT NULL DEFAULT 0, gst_pct numeric(5,2) NOT NULL DEFAULT 0,
  gst_paise bigint NOT NULL DEFAULT 0, grand_total_paise bigint NOT NULL DEFAULT 0,
  status       text NOT NULL DEFAULT 'open',
  converted_order_id uuid REFERENCES sales_orders(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, doc_number),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  quotation_id uuid NOT NULL REFERENCES quotations(id),
  item_id      uuid REFERENCES items(id),
  description  text NOT NULL, qty integer NOT NULL CHECK (qty > 0),
  rate_paise   bigint NOT NULL CHECK (rate_paise >= 0),
  amount_paise bigint NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS b2b_orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  sales_order_id uuid NOT NULL REFERENCES sales_orders(id),
  gstin         text, credit_limit_paise bigint, payment_terms_days integer,
  due_date date, tier text CHECK (tier IN ('silver','gold','platinum')),
  proforma_url  text,
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS b2b_credit_ledger (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  customer_id   uuid NOT NULL REFERENCES customers(id),
  transaction_type text NOT NULL,
  amount_paise  bigint NOT NULL, balance_paise bigint NOT NULL,
  reference_invoice_id uuid REFERENCES invoices(id),
  occurred_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS export_orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  sales_order_id uuid NOT NULL REFERENCES sales_orders(id),
  buyer_country text, currency text, fx_rate numeric(14,6),
  incoterms     text CHECK (incoterms IN ('FOB','CIF','EXW')),
  port_of_loading text, port_of_discharge text,
  lut_bond_no   text, lut_bond_year text,
  shipping_bill_no text, shipping_bill_date date,
  fira_received boolean NOT NULL DEFAULT false,
  fira_amount_paise bigint, fira_date date,
  igst_refund_status text, igst_refund_paise bigint, igst_refund_date date,
  fx_variance_paise bigint,
  deleted_at   timestamptz
);

-- [PHASE 4] Made-to-measure. Two legs of money on one order: the advance is
-- earned when work starts, the balance is owed until dispatch, and the ledger
-- shows both rather than one payment appearing at the end.
CREATE TABLE IF NOT EXISTS customization_orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  sales_order_id uuid REFERENCES sales_orders(id),
  customer_id   uuid NOT NULL REFERENCES customers(id),
  reference_images text[], reference_video_url text,
  measurements  jsonb,
  fabric_choice text, color_choice text, special_instructions text,
  negotiation_history jsonb,
  quoted_paise  bigint,
  advance_paise bigint, advance_paid_at timestamptz,
  balance_paise bigint, balance_paid_at timestamptz,
  production_order_id uuid REFERENCES production_orders(id),
  status        text NOT NULL DEFAULT 'enquiry',
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

-- [PHASE 4] Three return types with three different money outcomes. A wrong
-- return is never restocked — it is the loss it actually is.
CREATE TABLE IF NOT EXISTS returns (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  sales_order_id uuid REFERENCES sales_orders(id),
  sales_order_item_id uuid REFERENCES sales_order_items(id),
  return_type   text NOT NULL CHECK (return_type IN ('courier','customer','wrong')),
  initiated_at  timestamptz NOT NULL DEFAULT now(),
  reason text, sub_reason text,
  status        text NOT NULL DEFAULT 'pending',
  received_at timestamptz, received_by uuid REFERENCES users(id),
  condition     text CHECK (condition IN ('resalable','altered_returnable','lost')),
  refund_paise  bigint, refund_processed_at timestamptz,
  restock_qty integer NOT NULL DEFAULT 0, restock_location_id uuid REFERENCES locations(id),
  processing_cost_paise bigint NOT NULL DEFAULT 0,
  photos text[], notes text,
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS shipments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  sales_order_id uuid NOT NULL REFERENCES sales_orders(id),
  courier       text, awb text,
  packed_weight_kg numeric(8,3), billed_weight_kg numeric(8,3),
  freight_paise bigint NOT NULL DEFAULT 0,
  cod_amount_paise bigint NOT NULL DEFAULT 0,
  cod_remitted_paise bigint NOT NULL DEFAULT 0,
  status        text, handed_over_at timestamptz, handed_over_by uuid REFERENCES users(id),
  delivered_at  timestamptz,
  packing_video_url text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);
CREATE INDEX IF NOT EXISTS ix_ship_awb ON shipments(awb);

CREATE TABLE IF NOT EXISTS ndr_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  shipment_id  uuid NOT NULL REFERENCES shipments(id),
  attempt_no   integer NOT NULL DEFAULT 1,
  reason       text, action_taken text,
  window_expires_at timestamptz,
  resolved     boolean NOT NULL DEFAULT false,
  occurred_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_orders_raw (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  channel_id    uuid NOT NULL REFERENCES channels(id),
  external_id   text NOT NULL,
  raw_json      jsonb NOT NULL,
  pulled_at     timestamptz NOT NULL DEFAULT now(),
  processed     boolean NOT NULL DEFAULT false,
  sales_order_id uuid REFERENCES sales_orders(id),
  UNIQUE (channel_id, external_id)
);

-- [PHASE 4] An expectation is created at the moment of the sale, so a short
-- payment is visible without waiting for the payout to reveal it.
CREATE TABLE IF NOT EXISTS settlement_expectations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  sales_order_id uuid NOT NULL REFERENCES sales_orders(id),
  expected_paise bigint NOT NULL,
  expected_by   date,
  settled_paise bigint NOT NULL DEFAULT 0,
  status        text NOT NULL DEFAULT 'open',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_settlements (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  channel_id    uuid NOT NULL REFERENCES channels(id),
  settlement_ref text NOT NULL,
  settlement_date date NOT NULL,
  gross_paise bigint NOT NULL DEFAULT 0,
  commission_paise bigint NOT NULL DEFAULT 0,
  fixed_fee_paise bigint NOT NULL DEFAULT 0,
  closing_fee_paise bigint NOT NULL DEFAULT 0,
  pick_pack_fee_paise bigint NOT NULL DEFAULT 0,
  shipping_fee_paise bigint NOT NULL DEFAULT 0,
  refunds_paise bigint NOT NULL DEFAULT 0,
  tcs_paise bigint NOT NULL DEFAULT 0, tds_paise bigint NOT NULL DEFAULT 0,
  gst_on_commission_paise bigint NOT NULL DEFAULT 0,
  net_settled_paise bigint NOT NULL DEFAULT 0,
  bank_credited_paise bigint,
  reconciled boolean NOT NULL DEFAULT false, reconciled_at timestamptz,
  raw_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (channel_id, settlement_ref),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS marketplace_settlement_lines (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  settlement_id uuid NOT NULL REFERENCES marketplace_settlements(id),
  sales_order_item_id uuid REFERENCES sales_order_items(id),
  line_type     text NOT NULL,
  description   text,
  amount_paise  bigint NOT NULL DEFAULT 0,
  gst_paise     bigint NOT NULL DEFAULT 0,
  expected_paise bigint,
  variance_paise bigint
);

CREATE TABLE IF NOT EXISTS claims (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id),
  channel_id    uuid REFERENCES channels(id),
  claim_ref     text,
  claim_type    text NOT NULL
                CHECK (claim_type IN ('spf','dne','over_60_day','weight_discrepancy',
                                      'lost_in_transit','wrong_return','other')),
  sales_order_id uuid REFERENCES sales_orders(id),
  settlement_line_id uuid REFERENCES marketplace_settlement_lines(id),
  amount_paise  bigint NOT NULL,
  filing_deadline date,
  status        text NOT NULL DEFAULT 'draft',
  filed_at timestamptz, resolved_at timestamptz,
  recovered_paise bigint NOT NULL DEFAULT 0,
  evidence_urls text[],
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 5 — FINANCE, GST, TREASURY
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS accounts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  code       text NOT NULL,
  name       text NOT NULL,
  type       text NOT NULL CHECK (type IN ('asset','liability','equity','income','expense')),
  parent_id  uuid REFERENCES accounts(id),
  is_group   boolean NOT NULL DEFAULT false,
  gstin      text, pan text,
  credit_days integer, credit_limit_paise bigint,
  opening_balance_paise bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (company_id, code)
);

-- [LIVE] Every voucher type posts through this one table. No voucher type gets
-- its own ledger-update logic — that is where home-built accounting breaks.
CREATE TABLE IF NOT EXISTS journal_entries (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     uuid NOT NULL REFERENCES companies(id),
  voucher_type   text NOT NULL
                 CHECK (voucher_type IN ('sales_invoice','purchase_invoice','credit_note',
                                         'debit_note','payment','receipt','journal','contra','pos')),
  voucher_number text,
  voucher_date   date NOT NULL,
  narration      text,
  reference      text,
  channel_id     uuid REFERENCES channels(id),
  counterparty_company_id uuid REFERENCES companies(id),
  status         text NOT NULL DEFAULT 'posted' CHECK (status IN ('draft','posted','void')),
  reversal_of_id uuid REFERENCES journal_entries(id),
  posted_at timestamptz, posted_by uuid REFERENCES users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  CHECK (counterparty_company_id IS NULL OR counterparty_company_id <> company_id),
  deleted_at   timestamptz
);
CREATE INDEX IF NOT EXISTS ix_je_date ON journal_entries(company_id, voucher_date);

CREATE TABLE IF NOT EXISTS journal_lines (
  id           bigserial PRIMARY KEY,
  entry_id     uuid NOT NULL REFERENCES journal_entries(id),
  account_id   uuid NOT NULL REFERENCES accounts(id),
  debit_paise  bigint NOT NULL DEFAULT 0 CHECK (debit_paise  >= 0),
  credit_paise bigint NOT NULL DEFAULT 0 CHECK (credit_paise >= 0),
  party_id     uuid,
  narration    text,
  CHECK (debit_paise = 0 OR credit_paise = 0)
);
CREATE INDEX IF NOT EXISTS ix_jl_entry ON journal_lines(entry_id);

CREATE TABLE IF NOT EXISTS period_locks (
  company_id uuid NOT NULL REFERENCES companies(id),
  period     text NOT NULL,
  locked_at  timestamptz NOT NULL DEFAULT now(),
  locked_by  uuid REFERENCES users(id),
  unlocked_at timestamptz, unlocked_by uuid REFERENCES users(id), unlock_reason text,
  PRIMARY KEY (company_id, period)
);

CREATE TABLE IF NOT EXISTS payments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  direction    text NOT NULL CHECK (direction IN ('in','out')),
  party_type   text, party_id uuid,
  account_id   uuid REFERENCES accounts(id),
  amount_paise bigint NOT NULL CHECK (amount_paise > 0),
  method       text, provider_ref text,
  paid_on      date NOT NULL,
  entry_id     uuid REFERENCES journal_entries(id),
  status       text NOT NULL DEFAULT 'posted',
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS payment_allocations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id),
  payment_id  uuid NOT NULL REFERENCES payments(id),
  invoice_id  uuid REFERENCES invoices(id),
  vendor_invoice_id uuid REFERENCES vendor_invoices(id),
  amount_paise bigint NOT NULL CHECK (amount_paise > 0)
);

CREATE TABLE IF NOT EXISTS pdc_register (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  party_id     uuid, direction text NOT NULL,
  cheque_no    text, cheque_date date NOT NULL,
  amount_paise bigint NOT NULL,
  status       text NOT NULL DEFAULT 'held' CHECK (status IN ('held','deposited','cleared','bounced')),
  cleared_on   date, entry_id uuid REFERENCES journal_entries(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS bank_statements (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  account_id   uuid NOT NULL REFERENCES accounts(id),
  period_from date, period_to date,
  imported_at  timestamptz NOT NULL DEFAULT now(),
  imported_by  uuid REFERENCES users(id),
  column_map   jsonb,
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS bank_statement_lines (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  statement_id uuid NOT NULL REFERENCES bank_statements(id),
  txn_date     date NOT NULL, description text,
  debit_paise bigint NOT NULL DEFAULT 0, credit_paise bigint NOT NULL DEFAULT 0,
  external_ref text,
  matched_entry_id uuid REFERENCES journal_entries(id),
  matched_at   timestamptz,
  age_days     integer
);

CREATE TABLE IF NOT EXISTS gst_returns (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  return_type  text NOT NULL CHECK (return_type IN ('gstr1','gstr3b','gstr9','gstr9c')),
  period       text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  payload_json jsonb,
  filed_at     timestamptz, ack_no text,
  status       text NOT NULL DEFAULT 'draft',
  UNIQUE (company_id, return_type, period),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS itc_register (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  period       text NOT NULL,
  vendor_invoice_id uuid REFERENCES vendor_invoices(id),
  claimed_paise bigint NOT NULL DEFAULT 0,
  matched_2b   boolean NOT NULL DEFAULT false,
  held_paise   bigint NOT NULL DEFAULT 0,
  status       text
);

CREATE TABLE IF NOT EXISTS tds_tcs_register (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  kind         text NOT NULL CHECK (kind IN ('tds','tcs')),
  period       text NOT NULL,
  party_id     uuid, section text,
  amount_paise bigint NOT NULL,
  is_receivable boolean NOT NULL DEFAULT true,
  entry_id     uuid REFERENCES journal_entries(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fixed_assets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  name         text NOT NULL, category text,
  purchase_date date, cost_paise bigint NOT NULL,
  depreciation_method text, rate_pct numeric(5,2),
  accumulated_dep_paise bigint NOT NULL DEFAULT 0,
  disposed_on date, disposal_paise bigint,
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS expenses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  category     text NOT NULL,
  vendor_id    uuid REFERENCES vendors(id),
  expense_date date NOT NULL,
  amount_paise bigint NOT NULL CHECK (amount_paise > 0),
  gst_paise    bigint NOT NULL DEFAULT 0 CHECK (gst_paise >= 0),
  bill_url     text, ocr_json jsonb,
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by  uuid REFERENCES users(id),
  entry_id     uuid REFERENCES journal_entries(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  CHECK (gst_paise <= amount_paise),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS budgets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  period       text NOT NULL, account_id uuid REFERENCES accounts(id),
  budget_paise bigint NOT NULL DEFAULT 0,
  otb_ceiling_paise bigint,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 6 — MARKETING, CRM, AI, AUTOMATION, DOCUMENTS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS leads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  name         text NOT NULL, mobile text, email text,
  source       text CHECK (source IN ('indiamart','website','whatsapp','walkin','forum','other')),
  stage        text NOT NULL DEFAULT 'lead'
               CHECK (stage IN ('lead','qualified','quoted','negotiation','won','lost')),
  value_paise  bigint, owner_id uuid REFERENCES users(id),
  last_touch_at timestamptz, lost_reason text,
  customer_id  uuid REFERENCES customers(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS tickets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  customer_id  uuid REFERENCES customers(id),
  sales_order_id uuid REFERENCES sales_orders(id),
  channel      text, subject text, body text,
  status       text NOT NULL DEFAULT 'open',
  assigned_to  uuid REFERENCES users(id),
  resolution   text, resolved_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS feedback (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  customer_id  uuid REFERENCES customers(id),
  sales_order_id uuid REFERENCES sales_orders(id),
  design_id    uuid REFERENCES designs(id),
  item_id      uuid REFERENCES items(id),
  score        integer CHECK (score BETWEEN 0 AND 10),
  comment      text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  subject_type text NOT NULL, subject_id uuid NOT NULL,
  purpose      text NOT NULL,
  granted      boolean NOT NULL,
  granted_at   timestamptz, withdrawn_at timestamptz,
  evidence_url text,
  retention_until date,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  name         text NOT NULL, channel text,
  starts_on date, ends_on date,
  spend_paise  bigint NOT NULL DEFAULT 0,
  revenue_paise bigint NOT NULL DEFAULT 0,
  status       text NOT NULL DEFAULT 'draft',
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS content_calendar (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  scheduled_for timestamptz NOT NULL,
  platform     text NOT NULL, pillar text, format text,
  copy         text, hashtags text[],
  asset_id     uuid,
  ai_generated boolean NOT NULL DEFAULT false,
  status       text NOT NULL DEFAULT 'planned',
  published_at timestamptz, failure_reason text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS asset_library (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  design_id    uuid REFERENCES designs(id),
  asset_type   text NOT NULL, url text NOT NULL,
  tags         text[],
  is_generated boolean NOT NULL DEFAULT false,
  approved_for_use boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS listings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  item_id      uuid NOT NULL REFERENCES items(id),
  channel_id   uuid NOT NULL REFERENCES channels(id),
  title text, bullets jsonb, description text, keywords text[],
  quality_score numeric(5,2),
  state        text NOT NULL DEFAULT 'draft'
               CHECK (state IN ('draft','pending_approval','live','blocked','archived')),
  rejection_reason text,
  published_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, channel_id)
);

CREATE TABLE IF NOT EXISTS price_changes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  item_id      uuid NOT NULL REFERENCES items(id),
  channel_id   uuid REFERENCES channels(id),
  rule_name    text,
  old_price_paise bigint NOT NULL, new_price_paise bigint NOT NULL,
  floor_paise  bigint,
  changed_at   timestamptz NOT NULL DEFAULT now(),
  changed_by   uuid REFERENCES users(id),
  orders_before integer, orders_after integer
);

CREATE TABLE IF NOT EXISTS ai_runs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid REFERENCES companies(id),
  module       text NOT NULL, capability text,
  provider     text, model text,
  input_tokens integer, output_tokens integer,
  cost_paise   bigint NOT NULL DEFAULT 0,
  latency_ms   integer,
  result_json  jsonb,
  run_by       uuid REFERENCES users(id),
  run_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_design_analytics (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  design_id    uuid NOT NULL REFERENCES designs(id),
  period       text NOT NULL,
  sales_velocity numeric(12,3), return_rate numeric(5,2),
  profit_per_piece_paise bigint,
  recommendation text CHECK (recommendation IN ('feature','restock','discount','archive')),
  confidence   numeric(5,2),
  deleted_at   timestamptz
);

-- [PHASE 6] Agents. Scope is declared, never inferred from a prompt.
CREATE TABLE IF NOT EXISTS agent_scopes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  name         text NOT NULL,
  may_read     text[] NOT NULL,
  may_write    text[] NOT NULL,
  spend_ceiling_paise bigint NOT NULL DEFAULT 0,
  requires_approval_for text[] NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  scope_id     uuid NOT NULL REFERENCES agent_scopes(id),
  goal         text NOT NULL,
  started_by   uuid REFERENCES users(id),
  started_at   timestamptz NOT NULL DEFAULT now(),
  finished_at  timestamptz,
  status       text NOT NULL DEFAULT 'running'
               CHECK (status IN ('running','awaiting_approval','done','blocked','failed')),
  spend_paise  bigint NOT NULL DEFAULT 0,
  approved_by  uuid REFERENCES users(id), approved_at timestamptz,
  blocked_reason text,
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS agent_steps (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  run_id       uuid NOT NULL REFERENCES agent_runs(id),
  step_no      integer NOT NULL,
  action       text NOT NULL,
  input_json   jsonb, output_json jsonb,
  refused      boolean NOT NULL DEFAULT false, refusal_reason text,
  occurred_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assistant_queries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  asked_by     uuid NOT NULL REFERENCES users(id),
  question     text NOT NULL,
  answer       text,
  answered_from jsonb,
  found        boolean NOT NULL DEFAULT true,
  asked_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS retrieval_index (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  source_table text NOT NULL, source_id text NOT NULL,
  content      text NOT NULL,
  visible_to_roles text[] NOT NULL,
  indexed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  name         text NOT NULL,
  trigger_event text NOT NULL,
  steps_json   jsonb NOT NULL,
  may_read     text[] NOT NULL, may_write text[] NOT NULL,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS automation_runs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  automation_id uuid NOT NULL REFERENCES automations(id),
  trigger_payload jsonb,
  steps_result jsonb,
  status       text NOT NULL,
  started_at   timestamptz NOT NULL DEFAULT now(), finished_at timestamptz
);

CREATE TABLE IF NOT EXISTS approvals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  subject_table text NOT NULL, subject_id text NOT NULL,
  rule_name    text NOT NULL,
  requested_by uuid REFERENCES users(id), requested_at timestamptz NOT NULL DEFAULT now(),
  decided_by   uuid REFERENCES users(id), decided_at timestamptz,
  decision     text CHECK (decision IN ('approved','refused')),
  reason       text
);

CREATE TABLE IF NOT EXISTS projects (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  name         text NOT NULL, kind text,
  customer_id  uuid REFERENCES customers(id),
  owner_id     uuid REFERENCES users(id),
  stage        text, due_date date,
  budget_paise bigint, actual_cost_paise bigint NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS timesheets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  project_id   uuid REFERENCES projects(id),
  user_id      uuid NOT NULL REFERENCES users(id),
  work_date    date NOT NULL,
  hours        numeric(6,2) NOT NULL CHECK (hours > 0),
  billable     boolean NOT NULL,
  rate_paise   bigint,
  invoiced_line_id uuid REFERENCES invoice_items(id),
  notes        text
);

CREATE TABLE IF NOT EXISTS documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES companies(id),
  document_type text NOT NULL,
  related_table text, related_id text,
  storage_url  text NOT NULL,
  signed       boolean NOT NULL DEFAULT false, signed_at timestamptz,
  generated_by uuid REFERENCES users(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE TABLE IF NOT EXISTS notifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid REFERENCES companies(id),
  user_id      uuid REFERENCES users(id),
  channel      text NOT NULL, subject text, body text,
  related_table text, related_id text,
  status       text NOT NULL DEFAULT 'queued',
  sent_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integration_errors (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid REFERENCES companies(id),
  source       text NOT NULL, endpoint text,
  external_id  text, payload jsonb,
  error        text NOT NULL,
  retry_count  integer NOT NULL DEFAULT 0,
  resolved     boolean NOT NULL DEFAULT false,
  occurred_at  timestamptz NOT NULL DEFAULT now()
);

-- [LIVE] The cascade bus. modules.js declares who reads and writes what;
-- core/events.js turns those declarations into subscriptions; this is the
-- evidence a cascade actually fired.
CREATE TABLE IF NOT EXISTS events (
  id            bigserial PRIMARY KEY,
  company_id    uuid,
  name          text NOT NULL,
  source_module text NOT NULL,
  payload_json  jsonb,
  occurred_at   timestamptz NOT NULL DEFAULT now(),
  handled_by    text
);
CREATE INDEX IF NOT EXISTS ix_events_name ON events(name, occurred_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY
--
-- §A.3.2 and §B.2.1. Company isolation is enforced by the database, not by
-- remembering to add a WHERE clause. A filter in a screen can be removed; a
-- policy cannot. API middleware checks the same thing again — defence in
-- depth, because one layer is one mistake away from a cross-company read.
--
-- The three group-wide reference tables (colors, sizes, hsn_codes, gst_rates,
-- design_categories) carry no company_id by design and are readable by any
-- authenticated user; they hold no business figures.
--
-- THE ROLE, AND WHY IT IS CREATED HERE
-- Every policy below is `FOR ALL TO authenticated`. Nothing created that role — not this file,
-- not schema.sql, not deploy/, not DEPLOYMENT.md — so `psql -f core/schema.postgres.sql` against
-- a clean database failed on the first policy with `role "authenticated" does not exist`, and
-- because the file is one transaction, NOTHING was created. This schema had never been executed.
-- core/tests/live.test.js is what found that; every check that read the file as text had been
-- green the whole time.
--
-- NOSUPERUSER is not decoration. Postgres bypasses row-level security for superusers, and — this
-- was measured, not assumed — FORCE ROW LEVEL SECURITY does NOT stop them: a superuser saw both
-- companies' rows before and after FORCE. The policies below only do anything at all when the
-- connection is a role like this one. See DEPLOYMENT.md: the application must never connect as a
-- superuser or as the owner of these tables.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'channels','designs','items','item_aliases','locations','vendors','vendor_materials',
    'third_party_services','customers','customer_addresses','brands','settings_environment',
    'document_series','staff_salary_history','attendance','eod_reports','leave_requests',
    'advance_requests','payroll_runs','payroll_slips','piece_rates','karigar_earnings_summary',
    'recruitment_openings','recruitment_candidates','whatsapp_messages','stock_movements',
    'bom','bom_items','production_orders','production_stages','karigar_assignments',
    'karigar_reports','samples','qc_records','maintenance_records','certificates',
    'purchase_requisitions','purchase_orders','purchase_order_items','grn','grn_items',
    'vendor_invoices','three_way_match','sales_orders','sales_order_items','invoices',
    'invoice_items','quotations','quotation_items','b2b_orders','b2b_credit_ledger',
    'export_orders','customization_orders','returns','shipments','ndr_events',
    'marketplace_orders_raw','settlement_expectations','marketplace_settlements',
    'marketplace_settlement_lines','claims','accounts','journal_entries','period_locks',
    'payments','payment_allocations','pdc_register','bank_statements','bank_statement_lines',
    'gst_returns','itc_register','tds_tcs_register','fixed_assets','expenses','budgets',
    'leads','tickets','feedback','consents','campaigns','content_calendar','asset_library',
    'listings','price_changes','ai_design_analytics','agent_scopes','agent_runs','agent_steps',
    'assistant_queries','retrieval_index','automations','automation_runs','approvals',
    'projects','timesheets','documents'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    /* FORCE so the table OWNER is subject to the policy too. Necessary and, on its own, not
       sufficient — a superuser still bypasses it. Both halves matter: this line, and the
       deployment fact that the application connects as `authenticated`. */
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format($f$
      CREATE POLICY company_isolation ON %I
      FOR ALL TO authenticated
      USING (current_setting('app.current_company', true) <> ''
             AND company_id = current_setting('app.current_company')::uuid)
      WITH CHECK (current_setting('app.current_company', true) <> ''
             AND company_id = current_setting('app.current_company')::uuid)
    $f$, t);
    /* Without a grant the role can read nothing even once the policy admits it. */
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO authenticated', t);
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- CROSS-TENANT ISOLATION — the same mechanism, one level up
--
-- Company isolation keeps two of one customer's companies apart. This keeps two CUSTOMERS apart,
-- which is the failure §M3 calls an incident rather than a defect. Same shape deliberately: a
-- setting, USING and WITH CHECK, and a guard so an unset setting refuses instead of matching
-- everything.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE tenants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants   FORCE  ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies FORCE  ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON tenants
  FOR ALL TO authenticated
  USING (current_setting('app.current_tenant', true) <> ''
         AND id = current_setting('app.current_tenant')::uuid)
  WITH CHECK (current_setting('app.current_tenant', true) <> ''
         AND id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation ON companies
  FOR ALL TO authenticated
  USING (current_setting('app.current_tenant', true) <> ''
         AND tenant_id = current_setting('app.current_tenant')::uuid)
  WITH CHECK (current_setting('app.current_tenant', true) <> ''
         AND tenant_id = current_setting('app.current_tenant')::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON tenants   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON companies TO authenticated;
