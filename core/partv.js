'use strict';
/* PART V's 43 TABLES — where each one went, and why.
 *
 * WHY THIS FILE EXISTS
 * Part V of the master specification (§E.1–E.5.11) names 43 tables. None of them existed in
 * core/schema.postgres.sql by name, and four modules — 02 Design & Sampling, 09 Quality &
 * Compliance, 19 SEO/AEO/AIO, 20 Projects & Collaboration — were a module name and an app list
 * with no data model underneath.
 *
 * Adding 43 tables blind would have created six duplicates of tables this schema already has, and
 * a duplicate table is worse than a missing one: two places to write a certificate, and reports
 * that disagree about how many there are. So each of the 43 has a recorded decision:
 *
 *   kind: 'table'    a new table, because nothing here does this job
 *   kind: 'extends'  an existing table gains the columns, because it already does this job and
 *                    the specification's version differs by a handful of fields
 *
 * SIX OF THE 43 EXTEND FIVE EXISTING TABLES. Every one of those six names the columns it added,
 * and core/tests/partv.test.js loads the schema into a real Postgres and checks that the target
 * table really carries them. An "extends" decision with a column that is not there fails — which
 * is the whole point, because "we already have that" is the easiest way to lose a requirement.
 *
 * WHERE THE DECISION WENT THE OTHER WAY, IT SAYS SO. `fabric_trim_library` looks like
 * `vendor_materials` and is not: one is a library of materials, the other is which vendor supplies
 * a material and at what rate. `approval_limits` looks like `approvals` and is not: one is the
 * policy, the other is an instance of it. Each of those carries its `not_the_same_as`.
 */

/* Part V's own five groupings, in its own order. */
const GROUPS = {
  quality: 'E.1 · Quality & Compliance (Module 09)',
  seo: 'E.2 · SEO, AEO & AIO (Module 19)',
  tasks: 'E.3 · Projects & Collaboration — task coordination (Module 20)',
  design: 'E.4 · Design & Sampling (Module 02)',
  closures: 'E.5 · Partial-module closures',
};

const TABLES = [
  /* ── E.1 Quality & Compliance ─────────────────────────────────────────── */
  {
    name: 'compliance_certificates', group: 'quality', kind: 'extends', target: 'certificates',
    adds: ['cert_number', 'scope', 'reminder_days_before_expiry', 'owner_staff_id', 'notes'],
    why: 'certificates already holds a company’s own certificates with type, issuer, issue and ' +
      'expiry dates, a document and a status. Part V’s version differs by five fields and a wider ' +
      'status vocabulary. A second certificate table would mean two places to look for the fire ' +
      'NOC and two answers to how many expire this quarter.',
  },
  {
    name: 'fabric_lab_tests', group: 'quality', kind: 'table',
    why: 'Nothing here logs a test sent to an outside laboratory. qc_records is production QC — ' +
      'a person checking a garment on the floor — which is a different event with a different ' +
      'evidence trail.',
    not_the_same_as: 'qc_records: that is in-house inspection, this is an external lab with a ' +
      'report, a cost and a retest chain.',
  },
  {
    name: 'ncr_records', group: 'quality', kind: 'table',
    why: 'The non-conformance and corrective-action trail. Part V makes it mandatory: a lab test ' +
      'that fails creates one, so nothing is allowed to sit as “failed” with no follow-up.',
  },
  {
    name: 'buyer_audit_calendar', group: 'quality', kind: 'table',
    why: 'When a buyer is coming to audit the factory, what they found, and how many corrective ' +
      'action points are still open from it.',
  },

  /* ── E.2 SEO, AEO & AIO ───────────────────────────────────────────────── */
  {
    name: 'seo_page_meta', group: 'seo', kind: 'table',
    why: 'Title, description, canonical URL and target keywords per page. listings covers a ' +
      'marketplace listing, which is a different surface with different rules.',
    not_the_same_as: 'listings: that is one item on one marketplace; this is one page on the ' +
      'business’s own site.',
  },
  { name: 'structured_data_blocks', group: 'seo', kind: 'table',
    why: 'The JSON-LD a page publishes, and whether it last validated.' },
  { name: 'faq_answer_blocks', group: 'seo', kind: 'table',
    why: 'Question-and-answer blocks per item or collection, each approved before it goes live.' },
  { name: 'aio_crawler_feed', group: 'seo', kind: 'table',
    why: 'The llms.txt-style feed for AI answer engines — which page types it includes and when ' +
      'it last published.' },
  { name: 'sitemap_config', group: 'seo', kind: 'table',
    why: 'Which page types the sitemap includes, whether search engines are pinged on publish, ' +
      'and how many URLs it last carried.' },

  /* ── E.3 Task coordination ────────────────────────────────────────────── */
  {
    name: 'task_boards', group: 'tasks', kind: 'table',
    why: 'A kanban board belonging to a module, with its own ordered columns.',
    not_the_same_as: 'projects: a project has a customer, a budget and a due date. A board has ' +
      'columns and cards. Making one the other would give every board a budget and every project ' +
      'a Backlog column.',
  },
  { name: 'tasks', group: 'tasks', kind: 'table',
    why: 'A card on a board, optionally linked to any record in any module.' },
  { name: 'task_comments', group: 'tasks', kind: 'table',
    why: 'Comments on a task, and who was mentioned in each. The mentions are the point: Part V ' +
      'routes an @mention down the WhatsApp channel Communications already owns, so the list of ' +
      'mentioned staff has to be a stored column rather than something parsed out of the text ' +
      'each time somebody wants to know who was told.' },
  { name: 'task_activity_log', group: 'tasks', kind: 'table',
    why: 'Every move, assignment and completion — Part V’s rule is that moving out of Done ' +
      're-opens a task with no silent state loss, which needs a log rather than a timestamp.' },

  /* ── E.4 Design & Sampling ────────────────────────────────────────────── */
  { name: 'design_references', group: 'design', kind: 'table',
    why: 'Mood boards, trend references and tech packs, which may exist before a design or a SKU ' +
      'does — which is exactly why Part V sequences this module before Catalog.' },
  { name: 'tech_pack_versions', group: 'design', kind: 'table',
    why: 'Version control over a tech pack, with redline comments and who resolved them.' },
  {
    name: 'sample_rounds', group: 'design', kind: 'extends', target: 'samples',
    adds: ['round_type', 'buyer_id', 'buyer_signoff_captured', 'buyer_signoff_document_id',
      'buyer_comments', 'next_round_id'],
    why: 'samples already carries the design, the iteration number, the status, the photos and ' +
      'the approver — Part V calls that loop the execution layer and its own sample_rounds the ' +
      'state wrapper around it. Wrapping one table in another table with the same key is how two ' +
      'iteration counts start disagreeing; the six fields that make it a buyer-facing state ' +
      'machine go on the row that already exists.',
  },
  { name: 'sample_costing_sheets', group: 'design', kind: 'table',
    why: 'Quoting a design before an order exists, from estimates. Deliberately separate from the ' +
      'live BOM cost, which takes over once there is an order to cost.',
    not_the_same_as: 'bom / bom_items: those cost a real order from real rates. This is an ' +
      'estimate with a validity date that may never become an order.' },
  { name: 'fabric_trim_library', group: 'design', kind: 'table',
    why: 'A shared library of fabrics and trims — composition, GSM, swatch, cost, minimum order ' +
      'quantity — reusable by every design that references it.',
    not_the_same_as: 'vendor_materials: that says which vendor supplies a material type and at ' +
      'what rate, ranked by preference. This is the material itself.' },

  /* ── E.5 Partial-module closures ──────────────────────────────────────── */
  { name: 'api_keys', group: 'closures', kind: 'table',
    why: 'Scoped integration keys. Part V’s rule is that the raw key is shown once at issuance ' +
      'and never persisted, so this stores a hash and a scope and nothing else.' },
  { name: 'approval_limits', group: 'closures', kind: 'table',
    why: 'What a role may approve, by action type and rupee value, with an optional threshold ' +
      'above which a second approver is required.',
    not_the_same_as: 'approvals: that is one request and its decision. This is the policy that ' +
      'decides whether the request needed approving at all.' },

  { name: 'consignment_stock', group: 'closures', kind: 'table',
    why: 'Stock sitting somewhere else that is still ours, valued where it physically is so it ' +
      'never quietly drops off the books.' },
  { name: 'item_packed_dimensions', group: 'closures', kind: 'table',
    why: 'Packed weight and dimensions per item — the figure a courier’s charged weight is ' +
      'checked against at settlement.' },
  { name: 'catalog_seasons', group: 'closures', kind: 'table',
    why: 'A named season or collection — "Diwali 2026" — with the dates it runs between. The SKU ' +
      'hierarchy groups an item by what it IS; this groups it by when it is being sold, which is ' +
      'a different question and the one a buying plan asks.' },
  { name: 'catalog_season_items', group: 'closures', kind: 'table',
    why: 'Which items belong to a season — a grouping layer on top of the SKU hierarchy, which ' +
      'is unchanged.' },

  { name: 'esign_requests', group: 'closures', kind: 'table',
    why: 'A document sent to a party for signature, and what happened to it.',
    not_the_same_as: 'documents: that is the file and whether it ended up signed. This is the ' +
      'request — sent, viewed, declined, expired — which are states the file itself has no room ' +
      'for.' },
  {
    name: 'helpdesk_tickets', group: 'closures', kind: 'extends', target: 'tickets',
    adds: ['priority', 'first_response_at'],
    why: 'tickets already carries the company, the customer, the linked sales order, the subject, ' +
      'the status, the assignee and the resolution. Part V’s version adds a priority and a ' +
      'first-response timestamp. Two ticket tables would split one customer’s complaints across ' +
      'two queues.',
  },
  {
    name: 'certificate_expiry_watch', group: 'closures', kind: 'extends', target: 'certificates',
    adds: ['party_kind', 'party_id'],
    why: 'Part V asks for this as a separate register because it watches a CUSTOMER or VENDOR’s ' +
      'certificates rather than our own. In schema terms the two differ by exactly one column — ' +
      'whose certificate it is — and the expiry arithmetic is identical. So certificates gains a ' +
      'nullable party_kind/party_id pair, the same idiom documents already uses for a related ' +
      'record: null means ours, set means theirs. THE TWO REGISTERS REMAIN TWO ' +
      'REGISTERS; they are two views of one table rather than two tables that will drift.',
  },

  { name: 'pre_quote_costing', group: 'closures', kind: 'table',
    why: 'The costing behind a quote, pulled from a sample costing sheet when the design has one. ' +
      'Part V’s point is that a quote is never priced without a costing trail behind it.' },

  { name: 'rfqs', group: 'closures', kind: 'table',
    why: 'A request for quotation sent to several vendors at once, with a deadline.' },
  { name: 'vendor_portal_quotes', group: 'closures', kind: 'table',
    why: 'What each vendor quoted against an RFQ, and which one was selected.' },
  { name: 'vendor_scorecard_history', group: 'closures', kind: 'table',
    why: 'The monthly roll-up of a vendor’s on-time, quality and price variance — the trend, ' +
      'where the existing scorecard is only ever the current snapshot.' },

  {
    name: 'assets_register', group: 'closures', kind: 'extends', target: 'fixed_assets',
    adds: ['asset_type', 'location_id', 'in_service'],
    why: 'fixed_assets is the same machine seen from accounting — cost, depreciation, disposal. ' +
      'Part V wants it seen from the floor — what kind of thing it is, where it is, whether it is ' +
      'running. Those are three columns, not a second asset table; a machine that appears in one ' +
      'and not the other is how a depreciating asset gets serviced under a name nobody recognises.',
  },
  {
    name: 'maintenance_schedule', group: 'closures', kind: 'extends', target: 'maintenance_records',
    adds: ['asset_id', 'downtime_hours'],
    why: 'maintenance_records already tracks type, due date, completion, cost and who did it — ' +
      'but it names its asset in free text, so nothing ties a service to the asset that was ' +
      'serviced. The extension replaces that weakness with a real reference and adds the downtime ' +
      'Part V asks for. The free-text column stays for rows that predate the reference.',
  },

  { name: 'bin_locations', group: 'closures', kind: 'table',
    why: 'Zone, aisle, rack, shelf and bin — the map a pick route is sorted against.' },
  { name: 'item_bin_assignments', group: 'closures', kind: 'table',
    why: 'How much of an item sits in which bin. stock_movements says how much exists at a ' +
      'location; this says whereabouts inside that location to walk to, which is what turns a ' +
      'pick list into a route.' },
  { name: 'packing_videos', group: 'closures', kind: 'table',
    why: 'One clip per order, so a wrong-item claim is answered by pulling that exact clip.' },

  { name: 'courier_rate_cards', group: 'closures', kind: 'table',
    why: 'What a courier should have charged, by zone, weight slab and service — the ERP-side ' +
      'comparison against what it did charge.' },
  { name: 'dispatch_manifests', group: 'closures', kind: 'table',
    why: 'What was expected to go out against what the courier actually took, with the difference ' +
      'computed and signed for.' },

  { name: 'cash_flow_forecast', group: 'closures', kind: 'table',
    why: 'A rolling projection over receivables, payables and payroll due dates that are already ' +
      'in the system. Part V calls this the highest-value single addition because it needs no new ' +
      'data collection.' },

  { name: 'statutory_compliance_filings', group: 'closures', kind: 'table',
    why: 'PF, ESI and minimum-wage filings — due, filed, overdue, with the acknowledgement. The ' +
      'payroll tables hold the contribution figures and nothing held the filing.' },
  { name: 'appraisal_cycles', group: 'closures', kind: 'table',
    why: 'A named review period with a start, an end and whether it is still open.' },
  { name: 'appraisal_records', group: 'closures', kind: 'table',
    why: 'One person’s self rating, manager rating, final rating and next-period goals within a ' +
      'cycle.' },

  { name: 'promo_codes', group: 'closures', kind: 'table',
    why: 'Discount codes with their limits — total, per customer, minimum order value, and which ' +
      'items they apply to.' },
];

/* Tables in the schema the RLS loop must cover — every 'table' decision above. */
const NEW_TABLES = TABLES.filter((t) => t.kind === 'table').map((t) => t.name);
const EXTENSIONS = TABLES.filter((t) => t.kind === 'extends');

/** Everything structurally wrong with this register, as a list. */
function check() {
  const bad = [];
  const seen = new Set();
  for (const t of TABLES) {
    if (!t.name || !/^[a-z][a-z0-9_]*$/.test(t.name)) bad.push(`${t.name}: not a table name`);
    if (seen.has(t.name)) bad.push(`${t.name}: listed twice`);
    seen.add(t.name);
    if (!(t.group in GROUPS)) bad.push(`${t.name}: group "${t.group}" is not one of Part V’s`);
    if (!t.why || t.why.length < 60) bad.push(`${t.name}: no reason worth reading`);
    if (t.kind === 'extends') {
      if (!t.target) bad.push(`${t.name}: extends nothing`);
      if (!Array.isArray(t.adds) || !t.adds.length) {
        bad.push(`${t.name}: extends ${t.target} and names no column it added. ` +
          '"We already have that" with no column list is how a requirement is lost.');
      }
    } else if (t.kind !== 'table') {
      bad.push(`${t.name}: kind must be 'table' or 'extends'`);
    }
  }
  if (TABLES.length !== 43) {
    bad.push(`Part V names 43 tables and this register has ${TABLES.length}.`);
  }
  return bad;
}

module.exports = { GROUPS, TABLES, NEW_TABLES, EXTENSIONS, check };
