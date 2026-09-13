'use strict';
/* THE PARAMETERS — every dimension this product is measured on, and the gap on each.
 *
 *   node brand/site/checkbenchmark.js --summary
 *
 * WHY THIS EXISTS BESIDE zoho.js AND DOES NOT REPLACE IT
 * zoho.js answers one question: for each product the owner named, do we name an app? That is
 * a COVERAGE fact, it is answered entirely from our own register, and it is worth keeping.
 * It cannot answer the question actually asked here — "where are we failing, and by how
 * much" — because coverage says nothing about depth, and because nothing outside the app
 * list is in it at all. Most of the distance to a mature product is not in the app list.
 *
 * WHAT CHANGED, AND A CORRECTION TO SOMETHING THIS REPOSITORY ASSERTS
 * zoho.js's header states there is "no route to those pages from here at all", and every one
 * of its 56 rows is therefore unread. Direct fetch really is blocked — re-measured on the day
 * below, www.zoho.com returns EGRESS_BLOCKED from the fetch tool. But WEB SEARCH works and
 * returns substantive content carrying the vendor's own URLs, which that conclusion ruled
 * out. So a sourced comparison IS possible, and it is this file.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE EVIDENCE STANDARD, WHICH IS WEAKER HERE THAN ELSEWHERE AND SAYS SO
 *
 * Competitor claims come from SEARCH RESULTS, not from reading the vendor's page. That is
 * thinner evidence: a snippet is not a page, some results are third-party review sites, and
 * any of it can be out of date. So every claim carries the url it came from, the day it was
 * found, and `method: 'search'` — and a parameter with no source is UNMEASURED rather than
 * estimated. There are no percentages in this file that nobody measured.
 *
 * OUR SIDE IS NEVER TYPED. Each row names registry rows or a recorded run, and
 * checkbenchmark.js RESOLVES them at gate time. A row that stores its own answer is refused.
 * That is the rule that stops this becoming a document which flatters the thing it measures.
 *
 * THE VERDICTS
 *   BEHIND      they have it and we do not, or ours is at a lower rung. Must name what closes it.
 *   PARITY      both have it standing up. Refused while our own rung is SPECIFIED or lower.
 *   AHEAD       we have something they were not found to have. Same rung rule applies.
 *   UNMEASURED  nobody has compared these. Ours is still stated; theirs is not guessed.
 */

/* The day every search below was run. One constant, because a date typed per row is a date
   that will be wrong on one of them. */
const FOUND_ON = '2026-09-13';

/* URLs are named once and cited by key. A url typed twice is a url that disagrees with
   itself after the first edit. */
const SOURCES = {
  ZOHO_INV_FEATURES: 'https://www.zoho.com/us/inventory/features/',
  ZOHO_INV_WAREHOUSE: 'https://www.zoho.com/us/inventory/warehouse-inventory-management/',
  ZOHO_INV_MOBILE: 'https://www.zoho.com/us/inventory/mobile-apps/',
  ZOHO_COMPLIANCE: 'https://www.zoho.com/compliance.html',
  ZOHO_CREATOR_SECURE: 'https://www.zoho.com/creator/evaluation-guide/secure.html',
  ZOHO_DEVELOPER: 'https://www.zoho.com/developer/',
  ZOHO_DEV_WEBHOOKS: 'https://www.zoho.com/developer/help/extensions/automation/webhooks.html',
  ZOHO_ZIA: 'https://www.zoho.com/zia/',
  ZOHO_DESK_ZIA: 'https://www.zoho.com/desk/zia.html',
  UNI_HOME: 'https://unicommerce.com/',
  UNI_MARKETPLACE: 'https://unicommerce.com/integrations/marketplace-cart-integration/',
  UNI_INVENTORY: 'https://unicommerce.com/inventory-management-system/',
  UNI_RETURNS: 'https://unicommerce.com/ecommerce-returns-management/',
  UNI_ACCOUNTING: 'https://unicommerce.com/integrations/accounting-integration/',
  EASY_HOME: 'https://www.easyecom.io/',
  EASY_INVENTORY: 'https://easyecom.io/whatsnew-category/inventory',
};

/* ── the eleven dimensions ─────────────────────────────────────────────────
   Ordered so the ones that decide whether the software can be USED come before the ones
   that decide whether it looks complete on a comparison table. That ordering is the whole
   argument of the parity plan: an app list is cheap to lengthen and expensive to make true. */
const DIMENSIONS = [
  { id: 'data', n: 1, title: 'Data and correctness',
    why: 'Whether the numbers can be trusted. Everything else is decoration if one company ' +
      'can read another\'s rows or money drifts by a paisa a thousand times.' },
  { id: 'depth', n: 2, title: 'Depth inside an area',
    why: 'Not whether a screen exists but whether it handles the day: partial receipts, ' +
      'returns, corrections, approvals, the awkward cases that are most of real work.' },
  { id: 'coverage', n: 3, title: 'Functional coverage',
    why: 'Whether an app exists for an area at all. The cheapest dimension to score well on ' +
      'and the easiest to mistake for progress.' },
  { id: 'ops', n: 4, title: 'Deployment and operability',
    why: 'Whether it runs somewhere a business can reach, stays there, and tells somebody ' +
      'when it stops. Nothing here is a feature and all of it is the difference between ' +
      'software and a repository.' },
  { id: 'scale', n: 5, title: 'Scale and performance',
    why: 'How it behaves at a volume nobody has tried. Cheap to ignore until the first ' +
      'month-end when it matters at once.' },
  { id: 'security', n: 6, title: 'Security and compliance',
    why: 'Whether anybody has attacked it on purpose, and whether an enterprise buyer\'s ' +
      'procurement form can be answered at all.' },
  { id: 'integrations', n: 7, title: 'Integrations',
    why: 'Marketplaces, couriers, tax portals, banks, payment providers. The dimension where ' +
      'the Indian marketplace-operations products set the bar, not Zoho.' },
  { id: 'platform', n: 8, title: 'Platform and extensibility',
    why: 'Whether somebody outside this project can build on it — a public API, webhooks, ' +
      'SDKs, a way to make a screen without code, a place to publish an extension.' },
  { id: 'ai', n: 9, title: 'AI',
    why: 'The weakest dimension here by a distance, and the one where shipping early does ' +
      'the most damage: an assistant that is confidently wrong about stock or wages is ' +
      'worse than no assistant.' },
  { id: 'mobile', n: 10, title: 'Mobile and offline',
    why: 'The work that happens away from a desk — attendance, production, receiving — and ' +
      'what happens to it when there is no signal.' },
  { id: 'commercial', n: 11, title: 'Commercial readiness',
    why: 'Pricing, support, an SLA, documentation, onboarding, and getting a business\'s ' +
      'existing data in. None of it is code and all of it decides whether anyone adopts it.' },
];

/* ── the parameters ────────────────────────────────────────────────────────
 * `measure` is how OUR side is resolved, never what it is:
 *    { registry: [ids] }  the best rung among those registry rows
 *    { evidence: 'V-X' }  a recorded run in docs/verification/EVIDENCE.md at exit 0
 *    { none: 'reason' }   nothing exists for this and the reason is stated
 * `theirs` is a list of sourced claims, or [] meaning nobody measured it.
 */
const ROWS = [
  /* ── 1 · DATA AND CORRECTNESS ─────────────────────────────────────────── */
  {
    id: 'P-DATA-ISO', dim: 'data', parameter: 'One company cannot read another company’s rows',
    measure: { registry: ['CAP-ISOLATION'], evidence: 'V-SCHEMA' },
    theirs: [],
    verdict: 'AHEAD',
    gap: 'No gap found. This is proven against a real Postgres with the application ' +
      'connecting as a restricted role — and it only proves anything because the role is ' +
      'neither superuser nor table owner, or every policy would be inert and the test would ' +
      'pass while checking nothing.',
    close: null,
  },
  {
    id: 'P-DATA-MONEY', dim: 'data', parameter: 'Money is exact, not floating point',
    measure: { registry: ['CAP-SCHEMA'], evidence: 'V-SCHEMA' },
    theirs: [],
    verdict: 'UNMEASURED',
    gap: 'Ours is integer paise and the schema test refuses a float money column. What any ' +
      'of the three comparison products do internally is not something a marketing page ' +
      'states, so nobody has compared this and this row does not pretend otherwise.',
    close: null,
  },
  {
    id: 'P-DATA-AUDIT', dim: 'data', parameter: 'Every change leaves an append-only trail',
    measure: { registry: ['CAP-SCHEMA'] },
    theirs: [],
    verdict: 'UNMEASURED',
    gap: 'The audit table and the effective-dated tenant log exist in the schema. Whether ' +
      'they are written on every path that changes a business record has not been tested ' +
      'end to end, and no competitor page was found stating their equivalent.',
    close: { work: 'A test that mutates through every write path and asserts the trail ' +
      'caught each one, rather than trusting that each caller remembered.', size: 'M' },
  },

  /* ── 2 · DEPTH INSIDE AN AREA ─────────────────────────────────────────── */
  {
    id: 'P-DEPTH-DAY', dim: 'depth', parameter: 'A business can run one real working day end to end',
    measure: { registry: ['CAP-SCHEMA'], evidence: 'V-DAY' },
    theirs: [
      { product: 'Zoho Inventory', src: 'ZOHO_INV_FEATURES',
        claim: 'Presents end-to-end inventory management across sales, purchases, warehouses ' +
          'and fulfilment as shipping product features.' },
    ],
    verdict: 'BEHIND',
    gap: 'Three of the five steps run and compose on the real database — buy, receive, sell — ' +
      'proven together rather than module by module. The two that do not are MAKE and SHIP: ' +
      'module 08 Manufacturing and module 11 Logistics are specified and unbuilt, so no ' +
      'business could run its actual day here.',
    close: { work: 'Build module 08 so a production order consumes what was bought, then ' +
      'module 11 so a shipment carries away what was sold, then extend the working-day test ' +
      'from three steps to five.', size: 'L' },
  },
  {
    id: 'P-DEPTH-PARTIAL', dim: 'depth', parameter: 'Partial and short receipts against a purchase order',
    measure: { registry: ['CAP-SCHEMA'], evidence: 'V-DAY' },
    theirs: [
      { product: 'Zoho Inventory', src: 'ZOHO_INV_WAREHOUSE',
        claim: 'Picklists for warehouse pickers, stock transfers between warehouses, batch ' +
          'and expiry tracking with unique identifier codes, and low-stock notifications.' },
      { product: 'Unicommerce', src: 'UNI_INVENTORY',
        claim: 'Inventory tracking with real-time synchronisation and multi-location ' +
          'warehouse management, updating a marketplace automatically when an item goes ' +
          'out of stock.' },
      { product: 'EasyEcom', src: 'EASY_INVENTORY',
        claim: 'Inventory modules covering multi-location sync and forecasting, alongside ' +
          'warehouse inward, storage and fulfilment.' },
    ],
    verdict: 'BEHIND',
    gap: 'A short delivery is handled — the working-day test orders 60 and receives 40, with ' +
      'the two numbers deliberately different so a module using the wrong one has nowhere to ' +
      'hide. Batch and expiry tracking, picklists and warehouse-to-warehouse transfer are ' +
      'named on the comparison side and are not built here.',
    close: { work: 'Batch/lot and expiry as first-class columns with a test that refuses to ' +
      'issue expired stock, then picklists, then inter-warehouse transfer as a stock move ' +
      'that balances.', size: 'L' },
  },
  {
    id: 'P-DEPTH-RETURNS', dim: 'depth', parameter: 'Returns, and the money that comes back with them',
    measure: { none: 'No returns app is above SPECIFIED.' },
    theirs: [
      { product: 'Unicommerce', src: 'UNI_RETURNS',
        claim: 'A centralised panel to manage account reconciliation for marketplace returns ' +
          'and inventory against all returns.' },
      { product: 'EasyEcom', src: 'EASY_HOME',
        claim: 'Payment, inventory and return reconciliation across all marketplaces.' },
    ],
    verdict: 'BEHIND',
    gap: 'Returns are specified and unbuilt. For a seller on several marketplaces this is not ' +
      'an edge case — it is a daily flow where stock comes back, a credit note is due, and ' +
      'the marketplace settlement has already deducted something.',
    close: { work: 'A return that reverses the stock move and raises the credit note in one ' +
      'transaction, with a test asserting the ledger and the warehouse still agree afterwards.',
      size: 'M' },
    depends_on: ['P-DEPTH-DAY'],
  },

  /* ── 3 · FUNCTIONAL COVERAGE ──────────────────────────────────────────── */
  {
    id: 'P-COV-AREAS', dim: 'coverage', parameter: 'An app exists for each area a suite is expected to cover',
    measure: { registry: ['CAP-DOCS'] },
    theirs: [
      { product: 'Zoho', src: 'ZOHO_DEVELOPER',
        claim: 'Presents a suite of many separate products with a shared developer platform ' +
          'and marketplace behind them.' },
    ],
    verdict: 'BEHIND',
    gap: 'The coverage register reports 30 areas where an app is named, 20 with none at all, ' +
      'and 6 deliberately out of scope — but of the 30 named, only 11 have any app above ' +
      'SPECIFIED. Coverage on paper is 60%; coverage that stands up is 22%.',
    close: { work: 'Not by adding app names. The honest move is to raise the 30 already ' +
      'named before naming more, which is what the parity plan orders.', size: 'L' },
  },

  /* ── 4 · DEPLOYMENT AND OPERABILITY ───────────────────────────────────── */
  {
    id: 'P-OPS-DEPLOYED', dim: 'ops', parameter: 'Deployed anywhere a business can reach',
    measure: { registry: ['CAP-DEPLOY'] },
    theirs: [
      { product: 'Zoho', src: 'ZOHO_CREATOR_SECURE',
        claim: 'A 99.9% uptime SLA backed by owned data-centre infrastructure.' },
    ],
    verdict: 'BEHIND',
    gap: 'Nothing has ever been deployed anywhere. This is the single largest gap in the ' +
      'whole register and it is why the requirements gate refuses to let any row reach ' +
      'VERIFIED or PRODUCTION-READY: neither can be earned from inside a repository that ' +
      'has never been checked from outside itself.',
    close: { blocker: 'A rented machine, a domain and credentials. None of the three can be ' +
      'obtained by any AI, and DEPLOYMENT.md is the runbook that has never been followed by ' +
      'anybody, so expect it to be wrong in small ways the first time.' },
  },
  {
    id: 'P-OPS-BACKUP', dim: 'ops', parameter: 'A backup that somebody has actually restored',
    measure: { registry: ['CAP-MONITOR'] },
    theirs: [],
    baseline: 'Ordinary operational practice, not a competitor: a backup that has never been ' +
      'restored has not been shown to be readable, and the first time anybody finds out is ' +
      'the day they need it.',
    verdict: 'BEHIND',
    gap: 'No backup has been taken and none restored. A backup nobody has restored is not a ' +
      'backup, it is a hope with a filename.',
    close: { blocker: 'Follows the first deployment — there is nothing to back up until ' +
      'something runs.' },
    depends_on: ['P-OPS-DEPLOYED'],
  },
  {
    id: 'P-OPS-ALERT', dim: 'ops', parameter: 'An alert reaches somebody before a customer notices',
    measure: { registry: ['CAP-MONITOR'] },
    theirs: [
      { product: 'Zoho', src: 'ZOHO_CREATOR_SECURE',
        claim: 'A 99.9% uptime SLA backed by owned data-centre infrastructure.' },
    ],
    verdict: 'BEHIND',
    gap: 'Monitoring is specified. There is no health check answering anywhere, no uptime ' +
      'checker pointed at it, and no alert has ever fired — so the honest uptime figure for ' +
      'this product is not 0%, it is undefined.',
    close: { work: 'The health endpoint, an external uptime checker, and one deliberate ' +
      'outage to prove the alert arrives.', size: 'S' },
    depends_on: ['P-OPS-DEPLOYED'],
  },
  {
    id: 'P-OPS-CI', dim: 'ops', parameter: 'Every change is gated before it lands',
    measure: { registry: ['CAP-CI'], evidence: 'V-FULL2' },
    theirs: [],
    verdict: 'AHEAD',
    gap: 'No gap found on our side, and nothing comparable was sourced. Every push runs the ' +
      'full suite plus a browser clickthrough of every app page, and a claim cannot reach ' +
      'TESTED in the registry without a recorded run to point at.',
    close: null,
  },

  /* ── 5 · SCALE AND PERFORMANCE ────────────────────────────────────────── */
  {
    id: 'P-SCALE-VOL', dim: 'scale', parameter: 'Behaviour at a volume nobody has tried',
    measure: { registry: ['CAP-SCALE'] },
    theirs: [
      { product: 'Unicommerce', src: 'UNI_HOME',
        claim: 'Positions itself as India’s leading e-commerce enablement SaaS platform for ' +
          'order, warehouse and multi-channel inventory operations.' },
    ],
    verdict: 'BEHIND',
    gap: 'Not started. The largest test posts across a 10 × 10 company-channel grid and then ' +
      '11 × 11 with no code changed, which proves the SHAPE has no ceiling — it says nothing ' +
      'about a million order lines, a month-end report, or twenty people using it at once.',
    close: { work: 'Generate a year of plausible volume, then measure: the slowest query, ' +
      'the report that times out, and the first thing that locks. Record the numbers so the ' +
      'next run can be compared to them.', size: 'M' },
    depends_on: ['P-DEPTH-DAY'],
  },

  /* ── 6 · SECURITY AND COMPLIANCE ──────────────────────────────────────── */
  {
    id: 'P-SEC-THREAT', dim: 'security', parameter: 'Somebody has attacked it on purpose',
    measure: { registry: ['CAP-THREATMODEL'] },
    theirs: [],
    baseline: 'Ordinary security practice, not a competitor: a system holding several ' +
      'companies’ money and staff data is expected to have been probed by somebody trying ' +
      'to break it, and this one never has.',
    verdict: 'BEHIND',
    gap: 'Not started. Isolation is proven against an honest caller; nobody has written down ' +
      'who the attacker is and then tried to be them. A policy that holds for correct code ' +
      'says little about one that is being probed.',
    close: { work: 'Name the attacker — a signed-in user of another company, a staff account ' +
      'with the wrong role, a stolen session — then write a test per attacker that tries and ' +
      'must fail.', size: 'M' },
  },
  {
    id: 'P-SEC-CERT', dim: 'security', parameter: 'Certifications an enterprise buyer asks for',
    measure: { none: 'No certification has been sought and none could be, for software that ' +
      'has never been deployed.' },
    theirs: [
      { product: 'Zoho', src: 'ZOHO_COMPLIANCE',
        claim: 'ISO 27001, ISO 27017 and ISO 27018 certified, and SOC 2 Type II across ' +
          'Security, Confidentiality, Processing Integrity, Availability and Privacy, with ' +
          'audits conducted annually.' },
      { product: 'Zoho', src: 'ZOHO_CREATOR_SECURE',
        claim: 'GDPR compliance stated from 25 May 2018, with ISO/IEC 27701 named as the ' +
          'privacy-management extension to 27001.' },
    ],
    verdict: 'BEHIND',
    gap: 'Nothing, against a documented wall of certifications. This is the gap that cannot ' +
      'be closed by writing code: certification audits an operating organisation, not a ' +
      'repository, and they take money and elapsed months.',
    close: { blocker: 'A deployed system, an operating company behind it, an auditor, and a ' +
      'budget. Worth starting only when there is a customer who is asking for it.' },
    depends_on: ['P-OPS-DEPLOYED'],
  },

  /* ── 7 · INTEGRATIONS ─────────────────────────────────────────────────── */
  {
    id: 'P-INT-MARKET', dim: 'integrations', parameter: 'Live marketplace and cart connections',
    measure: { registry: ['CAP-INTEGRATIONS'] },
    theirs: [
      { product: 'Unicommerce', src: 'UNI_MARKETPLACE',
        claim: 'Support for 160+ integrations across marketplaces, carts, logistics partners ' +
          'and ERP/PoS, naming Amazon, Shopify, Flipkart, Meesho, FirstCry, JioMart, AJIO, ' +
          'BigCommerce and Magento among them.' },
      { product: 'EasyEcom', src: 'EASY_HOME',
        claim: 'Multi sales-channel integration in one place with real-time inventory ' +
          'synchronisation across all channels.' },
    ],
    verdict: 'BEHIND',
    gap: 'Zero live connections, and the registry marks this BLOCKED rather than unbuilt for ' +
      'a reason that will not change: every marketplace, courier, tax portal and bank feed ' +
      'needs live credentials, and this repository must never hold one.',
    close: { blocker: 'Seller accounts and API credentials for each marketplace, held by the ' +
      'business and entered at runtime — never committed. The code that uses them can be ' +
      'built and tested against recorded responses before any credential exists.' },
  },
  {
    id: 'P-INT-COURIER', dim: 'integrations', parameter: 'Courier allocation and tracking',
    measure: { none: 'Module 11 Logistics is specified and unbuilt.' },
    theirs: [
      { product: 'Unicommerce', src: 'UNI_HOME',
        claim: 'End-to-end logistics management automating courier allocation through to ' +
          'returns, with delivery to 19,000+ pincodes and automatic switching to the next ' +
          'logistics partner on error.' },
    ],
    verdict: 'BEHIND',
    gap: 'Nothing. Automatic failover to a second courier when the first errors is a concrete ' +
      'bar stated on the comparison side, and it is the kind of behaviour that only exists if ' +
      'it was designed in rather than added later.',
    close: { work: 'Courier as data rather than code — the same pattern as the trade packs — ' +
      'with allocation rules and a recorded-response test for failover.', size: 'M' },
    depends_on: ['P-DEPTH-DAY'],
  },
  {
    id: 'P-INT-SETTLE', dim: 'integrations', parameter: 'Marketplace settlement reconciliation',
    measure: { none: 'No settlement app is above SPECIFIED.' },
    theirs: [
      { product: 'EasyEcom', src: 'EASY_HOME',
        claim: 'Automated payment reconciliation to track and prevent unpaid orders, extra ' +
          'shipping costs and wrong deductions.' },
      { product: 'Unicommerce', src: 'UNI_ACCOUNTING',
        claim: 'UniReco aligns marketplace settlements with invoices for GST compliance, and ' +
          'accounting integration with Tally and Busy.' },
    ],
    verdict: 'BEHIND',
    gap: 'Nothing built. For a seller across several marketplaces this is where the money ' +
      'actually leaks — wrong deductions and unpaid orders that nobody catches because ' +
      'nothing compares the settlement file to the invoice.',
    close: { work: 'Import a settlement file, match it to orders, and report what does not ' +
      'reconcile. The reporting-what-failed half matters more than the matching half.',
      size: 'M' },
    depends_on: ['P-INT-MARKET'],
  },

  /* ── 8 · PLATFORM AND EXTENSIBILITY ───────────────────────────────────── */
  {
    id: 'P-PLAT-API', dim: 'platform', parameter: 'A public API with versioning, keys and rate limits',
    measure: { registry: ['CAP-DEVPLATFORM'] },
    theirs: [
      { product: 'Zoho', src: 'ZOHO_DEV_WEBHOOKS',
        claim: 'Documented webhooks and functions exposed as REST APIs on the developer ' +
          'platform.' },
    ],
    verdict: 'BEHIND',
    gap: 'Not started. Sign-in, sessions and company switching work, but there is no surface ' +
      'anything outside this project could call — no versioning, no keys, no rate limits, no ' +
      'webhooks out.',
    close: { work: 'Build it as its own slice with the same gates as everything else, and ' +
      'decide the sign-on model BEFORE the mobile app, because changing it afterwards means ' +
      'reissuing every credential.', size: 'L' },
    depends_on: ['P-DEPTH-DAY'],
  },
  {
    id: 'P-PLAT-STUDIO', dim: 'platform', parameter: 'Building a screen or flow without code',
    measure: { registry: ['CAP-STUDIO'] },
    theirs: [
      { product: 'Zoho Creator', src: 'ZOHO_DEVELOPER',
        claim: 'A low-code application platform with drag-and-drop builders for web and ' +
          'mobile applications, workflows and business rules.' },
    ],
    verdict: 'BEHIND',
    gap: 'Not started. The trade packs already make a great deal configurable as data rather ' +
      'than code, which is the foundation this would build on, but there is no screen a ' +
      'person could use to do it.',
    close: { work: 'Deliberately late. A studio over an unstable schema builds a second ' +
      'system beside the first, and the schema is not stable until the working day is.',
      size: 'L' },
    depends_on: ['P-PLAT-API'],
  },
  {
    id: 'P-PLAT-MARKET', dim: 'platform', parameter: 'A marketplace where others publish extensions',
    measure: { registry: ['CAP-MARKETPLACE'] },
    theirs: [
      { product: 'Zoho', src: 'ZOHO_DEVELOPER',
        claim: 'Sigma as an extension development platform and Zoho Marketplace as the store ' +
          'where extensions are published.' },
    ],
    verdict: 'BEHIND',
    gap: 'Not started, and correctly last. A marketplace with no third-party developers is an ' +
      'empty shop, and there are none until the public API exists and somebody outside this ' +
      'project has a reason to use it.',
    close: { work: 'Not scheduled. Revisit when the API has users who are not us.', size: 'L' },
    depends_on: ['P-PLAT-API'],
  },

  /* ── 9 · AI ───────────────────────────────────────────────────────────── */
  {
    id: 'P-AI-ROUTER', dim: 'ai', parameter: 'A model provider that fails over and cannot overspend',
    measure: { none: 'brand/suite/router.js runs its own self-test, but CAP-AI is SPECIFIED ' +
      'and the router is not wired into the product.' },
    theirs: [
      { product: 'Zoho Zia', src: 'ZOHO_ZIA',
        claim: 'A proprietary AI engine integrated natively across more than 55 Zoho ' +
          'applications.' },
    ],
    verdict: 'BEHIND',
    gap: 'The one AI piece that runs. Provider fallback, a circuit breaker and a spend ceiling ' +
      'are implemented and self-tested — and none of it is connected to the product, so no ' +
      'screen can call a model today.',
    close: { work: 'Wire the router behind a gateway the application calls, so there is one ' +
      'place where spend, fallback and refusal are enforced rather than one per caller.',
      size: 'S' },
  },
  {
    id: 'P-AI-EVAL', dim: 'ai', parameter: 'A way to tell whether an answer was right',
    measure: { registry: ['CAP-AI'] },
    theirs: [
      { product: 'Zoho Zia', src: 'ZOHO_ZIA',
        claim: 'Predictive analytics, lead scoring, anomaly detection, sentiment analysis and ' +
          'image recognition presented as shipping capabilities.' },
    ],
    verdict: 'BEHIND',
    gap: 'There is no evaluation set. This is the row that governs every other AI row: ' +
      'without a fixed set of questions with known-correct answers, no quality claim about ' +
      'anything the system says can be made, defended, or noticed getting worse.',
    close: { work: 'Fifty questions a real user would ask about their own data, each with the ' +
      'answer computed from the database, run on every change like any other test.',
      size: 'M' },
  },
  {
    id: 'P-AI-PERM', dim: 'ai', parameter: 'What an agent is allowed to do on a company’s data',
    measure: { registry: ['CAP-AI'] },
    theirs: [
      { product: 'Zoho Zia', src: 'ZOHO_ZIA',
        claim: 'An Agent Studio for building agents that take real actions across Zoho apps — ' +
          'retrieving records, creating tasks, analysing documents.' },
    ],
    verdict: 'BEHIND',
    gap: 'No permission model exists. An agent that can act needs narrower limits than the ' +
      'person who invoked it, not the same ones, and the isolation policies in the database ' +
      'answer a different question — which company, not which action.',
    close: { work: 'Agent permissions as their own layer, defaulting to read-only, with every ' +
      'action it takes written to a run log a person can read afterwards.', size: 'M' },
    depends_on: ['P-AI-ROUTER'],
  },
  {
    id: 'P-AI-CHAT', dim: 'ai', parameter: 'A chatbot that answers from the business’s own data',
    measure: { registry: ['APP-22-02'] },
    theirs: [
      { product: 'Zoho Desk', src: 'ZOHO_DESK_ZIA',
        claim: 'An Answer Bot using the knowledge base to respond across website and ' +
          'messaging channels, with generative replies.' },
      { product: 'Zoho Zia', src: 'ZOHO_ZIA',
        claim: 'Three layers described: assist (summaries, suggestions), deflection ' +
          '(customer-facing answer bots) and autonomous (AI agents).' },
    ],
    verdict: 'BEHIND',
    gap: 'Specified, nothing built. It is also the row most likely to be built too early: a ' +
      'chatbot demonstrates well on day one and is the fastest way to put a confident wrong ' +
      'answer about stock or wages in front of a worker.',
    close: { work: 'After the evaluation set and the permission model, not before. The order ' +
      'is the recommendation.', size: 'M' },
    depends_on: ['P-AI-EVAL', 'P-AI-PERM'],
  },

  /* ── 10 · MOBILE AND OFFLINE ──────────────────────────────────────────── */
  {
    id: 'P-MOB-APP', dim: 'mobile', parameter: 'A phone app at all',
    measure: { registry: ['CAP-MOBILE'] },
    theirs: [
      { product: 'Zoho Inventory', src: 'ZOHO_INV_MOBILE',
        claim: 'Android and iOS apps, with the phone camera usable as a barcode scanner to ' +
          'look up item and stock details.' },
    ],
    verdict: 'BEHIND',
    gap: 'There is no mobile code in this project at all. It also needs accounts no AI can ' +
      'hold — Apple and Google developer accounts, both paid and both requiring identity ' +
      'verification that takes days and blocks release.',
    close: { blocker: 'Apple and Google developer accounts. Start the verification early ' +
      'because it is slow; the code can be built against the shared API meanwhile.' },
    depends_on: ['P-PLAT-API'],
  },
  {
    id: 'P-MOB-OFFLINE', dim: 'mobile', parameter: 'Work captured with no signal, reconciled later',
    measure: { registry: ['CAP-MOBILE'] },
    theirs: [],
    verdict: 'UNMEASURED',
    gap: 'Nothing built here. On the comparison side this was searched for specifically and ' +
      'the result stated plainly that offline behaviour was not described in what it found — ' +
      'so their side is unmeasured rather than assumed absent, which would have been the ' +
      'convenient reading.',
    close: { work: 'The hard part is not caching, it is deciding who wins when two people ' +
      'changed the same thing offline. That is a business rule and must be written down ' +
      'before any code.', size: 'M' },
    depends_on: ['P-MOB-APP'],
  },

  /* ── 11 · COMMERCIAL READINESS ────────────────────────────────────────── */
  {
    id: 'P-COM-MIGRATE', dim: 'commercial', parameter: 'Getting an existing business’s data in',
    measure: { registry: ['CAP-PACKS'], evidence: 'V-PACKS' },
    theirs: [],
    baseline: 'Ordinary adoption practice, not a competitor: any business considering a new system already has years of items, stock and balances somewhere, and a product with no way to bring them across is one nobody can switch to.',
    verdict: 'BEHIND',
    gap: 'Trade configuration loads from packs and the payroll engine reads real workbooks, ' +
      'so the pieces exist — but there is no migration path a business could follow to bring ' +
      'its ledger, its stock and its history across, and adoption dies at exactly that step.',
    close: { work: 'An importer for the three things every business already has in a ' +
      'spreadsheet: items, opening stock, and opening balances — each rejecting a bad row by ' +
      'name rather than failing the file.', size: 'M' },
    depends_on: ['P-DEPTH-DAY'],
  },
  {
    id: 'P-COM-DOCS', dim: 'commercial', parameter: 'Documentation a person can actually follow',
    measure: { registry: ['CAP-DOCS'], evidence: 'V-COVERAGE' },
    theirs: [],
    verdict: 'AHEAD',
    gap: 'No gap found. Every delivered document is generated from a register and gated: a ' +
      'count cannot be typed, a command quoted in a runbook must resolve, and a document ' +
      'may not use a technical term it never explains. Nothing comparable was sourced, so ' +
      'this is AHEAD only on our own evidence.',
    close: null,
  },
  {
    id: 'P-COM-SUPPORT', dim: 'commercial', parameter: 'Support, an SLA, and somebody to call',
    measure: { none: 'There is no support function, because there is no running system and ' +
      'no customer.' },
    theirs: [
      { product: 'Zoho', src: 'ZOHO_CREATOR_SECURE',
        claim: 'A 99.9% uptime SLA backed by owned data-centre infrastructure.' },
    ],
    verdict: 'BEHIND',
    gap: 'Nothing exists. Not a defect — it is what it means to be pre-deployment — but it ' +
      'belongs on the list because it is a real reason a buyer says no, and no amount of ' +
      'software closes it.',
    close: { blocker: 'Follows a first customer. Not work to schedule now.' },
    depends_on: ['P-OPS-DEPLOYED'],
  },
];

module.exports = { FOUND_ON, SOURCES, DIMENSIONS, ROWS };
