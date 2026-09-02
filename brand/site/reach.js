'use strict';
/* WHO EACH APP IS ACTUALLY FOR — the register that makes structural bias visible.
 *
 * WHY THIS FILE EXISTS
 * `checkneutral.js` proves no trade WORD reaches the neutral edition. It cannot see that
 * `Size / Fit Recommendation AI`, `AR / Virtual Try-On`, `NDR & RTO Rescue`, `COD Remittance`,
 * `Packing Video` and `Markdown / Clearance Optimization` are one trade's apps wearing neutral
 * names. A law practice opens none of them. A dairy co-operative opens none of them. Both were
 * told, on a page that passed every check, that this is a platform for any industry.
 *
 * So every app declares one of two things, and there is no third option:
 *
 *   universal: true     every business on the platform opens this
 *   sectors: [...]      only these trades do
 *
 * An app that declares neither is an assumption nobody wrote down, and `checkshape.js` fails the
 * build on it. That is the whole point: the failure mode was never a wrong answer, it was no
 * answer at all.
 *
 * HOW TO READ THE SCOPED ONES
 * A scoped app is not a defect. A restaurant does not need an export invoice and should not be
 * shown one. The defect is a map where one trade's scoped apps outnumber everybody else's put
 * together — and that is what `checkshape.js --summary` prints, so a person can look at the
 * spread and decide.
 *
 * These are judgements. Each is arguable, and arguing with one is the correct use of this file.
 */

/* The trades, named exactly as sectors.js and the product screens name them. */
const DRONE = 'Drone & precision manufacturer';
const PARTS = 'Precision components maker';
const DAIRY = 'Dairy co-operative';
const CLINIC = 'Multi-doctor clinic';
const FREIGHT = 'Freight forwarder';
const LAW = 'Law practice';
const AGENCY = 'Creative agency';
const HOMEWARE = 'Homeware brand · D2C';
const RESTAURANT = 'Restaurant group';
const TRAINING = 'Training institute';
const INTERIOR = 'Interior contractor';
const HVAC = 'HVAC service firm';

/* Useful groupings, so a change of mind is one edit rather than twelve. */
const MAKERS = [DRONE, PARTS, DAIRY];                       /* things come off a line */
const SITE_WORK = [INTERIOR, HVAC];                          /* work happens elsewhere */
const GOODS = [...MAKERS, HOMEWARE, RESTAURANT, FREIGHT, INTERIOR, HVAC, CLINIC];
const SHIPPERS = [...MAKERS, HOMEWARE, FREIGHT];             /* parcels and consignments */
const SELLS_ONLINE = [HOMEWARE, RESTAURANT, TRAINING, CLINIC, AGENCY, LAW, HVAC];
const PROJECT_LED = [AGENCY, LAW, INTERIOR, HVAC, TRAINING, DRONE];

const U = (app) => ({ app, universal: true });
const S = (app, sectors) => ({ app, sectors });

const REACH = [
  /* ── 01 · Platform — the spine. Nothing here is optional for anybody. ───── */
  U('Identity, Settings & Audit'),
  U('Industry Packs'),
  U('Ask & Print'),
  U('Communications'),
  U('WhatsApp Command Console'),
  U('Data Privacy & Consent'),
  U('Provider Router & Cost Guard'),
  U('Payment Data Scope'),

  /* ── 02 · Design & Sampling — businesses that develop a thing before selling it */
  S('PLM & Development', [...MAKERS, HOMEWARE, AGENCY]),
  S('Design / IP Register', [...MAKERS, HOMEWARE, AGENCY]),

  /* ── 03 · Inventory & Catalog ────────────────────────────────────────────
     Stock is the clearest case that "universal" would have been a lie: the
     professional-services pack switches off eight stock rules because a law
     practice has no stock at all. */
  S('Stock', GOODS),
  S('Catalog / PIM', [...MAKERS, HOMEWARE, RESTAURANT, HVAC]),
  S('Kit & Combo SKU', [HOMEWARE, RESTAURANT, ...MAKERS]),
  U('Master-Data Hygiene'),

  /* ── 04 · CRM — everybody has somebody who owes them money ──────────────── */
  U('CRM & Customer 360'),
  U('Documents & eSign'),
  U('Helpdesk & Live Chat'),
  U('Forms & Feedback (NPS)'),

  /* ── 05 · Sales ─────────────────────────────────────────────────────────── */
  S('D2C Sales', [HOMEWARE, RESTAURANT, TRAINING, CLINIC]),
  S('B2B & Credit', [...MAKERS, HOMEWARE, FREIGHT, INTERIOR, HVAC, AGENCY]),
  S('Export', [...MAKERS, HOMEWARE, FREIGHT]),
  S('POS', [HOMEWARE, RESTAURANT, CLINIC]),
  U('Quotes & Proforma'),
  S('Couriers & AWB', SHIPPERS),
  S('Subscriptions', [HVAC, TRAINING, CLINIC, AGENCY, HOMEWARE]),
  S('Customisation & Made-to-Measure', [...MAKERS, HOMEWARE, INTERIOR]),

  /* ── 06 · Planning & Requirements ───────────────────────────────────────── */
  S('Demand Forecast & Signal', [...MAKERS, HOMEWARE, RESTAURANT]),
  S('Requirement Explosion (MRP run)', [...MAKERS, RESTAURANT, INTERIOR]),
  S('Open-to-Buy / Budget Ceiling', [HOMEWARE, RESTAURANT, ...MAKERS]),

  /* ── 07 · Purchase — everybody buys something from somebody ─────────────── */
  U('Procurement'),
  U('Vendor Management'),
  U('Insurance Register'),

  /* ── 08 · Manufacturing — and the two trades that make without a factory ── */
  S('Production Orders', [...MAKERS, RESTAURANT]),
  S('Piece-rate & Contractors', [...MAKERS, INTERIOR]),
  S('BOM & Consumption', [...MAKERS, RESTAURANT, INTERIOR]),
  S('Maintenance', [...MAKERS, RESTAURANT, FREIGHT, ...SITE_WORK]),

  /* ── 09 · Quality & Compliance ──────────────────────────────────────────── */
  S('Quality Control', [...MAKERS, RESTAURANT, CLINIC, ...SITE_WORK]),
  U('Certificate & Compliance Register'),

  /* ── 10 · Warehouse ─────────────────────────────────────────────────────── */
  S('Picking & Bins', [...MAKERS, HOMEWARE, FREIGHT, HVAC]),
  S('Barcode Operations', [...MAKERS, HOMEWARE, FREIGHT, CLINIC]),
  /* The plainest single-trade app in the whole map: filming a parcel exists to win a
     marketplace dispute about what was in the box. */
  S('Packing Video', [HOMEWARE]),

  /* ── 11 · Logistics ─────────────────────────────────────────────────────── */
  S('Rates & Zones', SHIPPERS),
  S('NDR & RTO Rescue', [HOMEWARE]),
  S('COD Remittance', [HOMEWARE, RESTAURANT]),
  S('Handover & Manifest', SHIPPERS),
  S('Fleet', [FREIGHT, DAIRY, RESTAURANT, HVAC]),

  /* ── 12 · Accounting & GST — the books are the books ────────────────────── */
  U('Accounting'),
  U('Invoicing'),
  U('Expenses'),
  U('GST & Tax'),
  U('ITC Reconciliation'),
  U('Receivables, Payables & PDC'),
  U('Fixed Assets & Depreciation'),
  U('Year-End Close & Period Lock'),
  U('Finance Reports'),

  /* ── 13 · Treasury & Financial Planning ─────────────────────────────────── */
  U('Cash Flow Forecast'),
  U('Banking & Reconciliation'),
  U('Budget vs Actual'),

  /* ── 14 · Settlement — money that arrives late, minus a commission ──────── */
  S('Payout Cycles', [HOMEWARE, RESTAURANT]),
  S('Fee & Commission Audit', [HOMEWARE, RESTAURANT]),
  U('TCS & TDS Register'),

  /* ── 15 · E-commerce / OMS ───────────────────────────────────────────────
     Eleven apps, and the honest reading is that most of them are one trade's.
     This module is the single biggest reason a shape check was needed. */
  S('Marketplace OMS', [HOMEWARE]),
  S('Order Management', [HOMEWARE, RESTAURANT, ...MAKERS]),
  S('Manual Data Check', [HOMEWARE, RESTAURANT]),
  S('Reconciliation', [HOMEWARE, RESTAURANT]),
  S('Claims & Disputes', [HOMEWARE, FREIGHT]),
  S('Returns / RMA', [HOMEWARE, ...MAKERS]),
  S('Channels & Storefronts', [HOMEWARE, RESTAURANT]),
  S('Labels & Documents', SHIPPERS),
  S('Listing & Catalog Manager', [HOMEWARE]),
  S('Size / Fit Recommendation AI', [HOMEWARE]),
  S('AR / Virtual Try-On', [HOMEWARE]),

  /* ── 16 · HR & Payroll — everybody pays somebody ────────────────────────── */
  U('Staff & Contractors'),
  U('Time-off & Advances'),
  U('Appraisal & Hiring'),
  U('Recruitment'),
  U('Payout Execution'),

  /* ── 17 · Marketing ─────────────────────────────────────────────────────── */
  U('Social Calendar'),
  U('Campaigns'),
  S('Repricing Engine', [HOMEWARE, RESTAURANT]),
  U('Automation'),
  U('Blog & Pages'),
  S('Events', [TRAINING, RESTAURANT, AGENCY, CLINIC]),
  U('Website & Page Builder'),
  S('Markdown / Clearance Optimization', [HOMEWARE]),

  /* ── 18 · AI Content Engine ─────────────────────────────────────────────
     Marked universal deliberately, and it is arguable. A law practice does make a
     brochure and a clinic does post to social. Scoping these to "visual trades"
     would have flattered the spread in the summary without being truer. */
  U('Content Engine'),
  U('Image Studio'),
  U('Video Studio'),
  U('Design Studio'),
  U('Motion Renderer'),
  U('Narration Studio'),
  U('Image Generation Slot'),
  U('Publisher'),

  /* ── 19 · SEO, AEO & AIO — for whoever wants to be found by a stranger ─── */
  S('Technical SEO & Schema', SELLS_ONLINE),
  S('Answer-Engine Optimization', SELLS_ONLINE),
  S('AI-Engine Visibility Tracking', SELLS_ONLINE),

  /* ── 20 · Projects & Collaboration ──────────────────────────────────────── */
  S('Projects & Cases', PROJECT_LED),
  S('Timesheets & Planning', PROJECT_LED),
  U('Approvals'),
  U('Forum'),
  U('Automation Studio'),
  U('Discuss'),
  U('Knowledge Base'),

  /* ── 21 · Dashboard & BI — seeing the business is not optional ──────────── */
  U('CEO Dashboard'),
  U('Report Builder'),
  U('Group Consolidation'),
  U('Excel Dashboard Builder'),
  S('ESG / Sustainability Reporting', [...MAKERS, FREIGHT, INTERIOR]),

  /* ── 22 · AI Assistant, Agents & Automation ─────────────────────────────── */
  U('AI Assistant'),
  U('AI Chatbot'),
  U('AI Agents'),
  U('Agent Guardrails & Run Log'),
  U('Knowledge & Retrieval'),
];

/** Is this file itself well formed, and does it talk about real trades? */
function check(appNames, sectorNames) {
  const bad = [];
  const known = new Set(sectorNames || []);
  const seen = new Set();

  for (const r of REACH) {
    if (!r.app) { bad.push('an entry with no app name'); continue; }
    if (seen.has(r.app)) bad.push(`"${r.app}": declared twice`);
    seen.add(r.app);

    const hasScope = Array.isArray(r.sectors) && r.sectors.length > 0;
    if (r.universal && hasScope) {
      bad.push(`"${r.app}": says universal AND names trades — it is one or the other`);
    }
    if (!r.universal && !hasScope) {
      bad.push(`"${r.app}": declares neither universal nor any trade`);
    }
    (r.sectors || []).forEach((s) => {
      if (!known.has(s)) bad.push(`"${r.app}": names "${s}", which is not a trade this platform shows`);
    });
    if (hasScope && new Set(r.sectors).size !== r.sectors.length) {
      bad.push(`"${r.app}": names the same trade twice`);
    }
    /* An app scoped to every trade there is has not been scoped, it has been listed. */
    if (hasScope && known.size && r.sectors.length === known.size) {
      bad.push(`"${r.app}": names every trade — say universal instead`);
    }
  }
  return bad;
}

module.exports = { REACH, check };
