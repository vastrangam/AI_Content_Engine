'use strict';
/* WHERE THE SPECIFICATION CONTRADICTS ITSELF — recorded, not resolved.
 *
 * WHY THIS FILE EXISTS
 * Vastrangam_ERP_Complete_Master.md is 5,676 lines assembled from several earlier documents, and
 * in seven places two of those documents disagree. Every one of them is a real fork in what the
 * software should do, and every one was found by reading rather than by a test — which is exactly
 * the kind of finding that gets mentioned once in a conversation and then lost.
 *
 * THE DECISION TAKEN ON THESE WAS: FLAG THEM, DO NOT RESOLVE THEM.
 * So `resolution` is null on every entry, and that is not an oversight — it is the answer. What
 * the repository currently does is recorded separately in `repo`, because "what we do today" and
 * "what is correct" are different claims and merging them is how a guess becomes a decision.
 *
 * NO PERSON IS NAMED HERE.
 * Two of the seven are about one worker's pay and one worker's roster membership. The repository's
 * own rule is that a person's name does not go into a committed document, and a conflict does not
 * suspend it. Each is described by role, and the line numbers point at the exact rows — which is
 * what somebody resolving it needs anyway.
 *
 * EVERY LINE NUMBER BELOW WAS READ, NOT REMEMBERED. brand/site/checkconflicts.js refuses an entry
 * that loses its line references or its `repo` column, so this cannot decay into a list of vague
 * worries.
 */

/* The document these line numbers refer to. It is an upload, not a repository file — naming it
   with its length is what lets somebody confirm they are holding the same copy. */
const SOURCE = {
  file: 'Vastrangam_ERP_Complete_Master.md',
  lines: 5676,
  note: 'Supplied as an upload, not committed here. Line numbers are 1-based in that file.',
};

const CONFLICTS = [
  {
    id: 'C1',
    title: 'How many marketplaces',
    says: [
      { at: 319, text: 'unifies D2C + 6 marketplaces + B2B + export under one roof' },
      { at: 2300, text: 'selling D2C + 6 marketplaces + B2B + export' },
      { at: 141, text: 'Sales — Marketplace — Amazon/Flipkart/Myntra/Meesho/Ajio order pull' },
      { at: 1996, text: 'an ecommerce sales / return / settlement Excel (Amazon, Flipkart, Myntra, Meesho, Ajio, Nykaa, …)' },
      { at: 5228, text: 'Multi-marketplace order mgmt (Amazon/Flipkart/Myntra/Meesho/Ajio/Nykaa/JioMart + Shopify/Woo) … add Nykaa + JioMart to connector list' },
    ],
    what: 'The count is stated as six, twice. The list that recurs through the integration and ' +
      'module sections names five. A sixth appears only where uploaded files are read. A seventh ' +
      'appears exactly once, in a gap-analysis row which says in the same breath that the sixth ' +
      'and seventh still need adding — so the document is describing a target in one place and ' +
      'today’s connectors in another, and never says which the six is.',
    repo: 'Seven channels, and the number is data rather than design: a channel is a row, every ' +
      'sale carries its channel_id, and core/tests/core.test.js posts across a 10 × 10 grid to ' +
      'prove no count is built in. Adding or removing one is an entry, not a change.',
    resolution: null,
  },
  {
    id: 'C2',
    title: 'The second company’s SKU brand code — EF or GF',
    says: [
      { at: 2307, text: '| Ethnic Fashion | Go4Fashion | EF | `EF` | Value / contemporary — the row’s SKU brand code column reads EF' },
      { at: 2310, text: 'SKUs use the brand code (VS / EF / AC)' },
      { at: 2311, text: 'Deliberate split for the 2nd entity: company Ethnic Fashion, invoice prefix EF, but brand/SKU code GF (Go4Fashion)' },
      { at: 2592, text: 'Company/brand/prefix | Vastrangam·VS / Ethnic Fashion·GF·EF / Adini·AC' },
    ],
    what: 'The §1.1 table is headed “canonical — never confuse”, and its own SKU brand code cell ' +
      'says EF; the bullet directly beneath it says the split from EF to GF is deliberate, and ' +
      'the §16 rule index agrees with the bullet. Two say EF, two say GF, and they are four lines ' +
      'apart. A SKU code decides what every item of that brand is called, so this is not cosmetic.',
    repo: 'GF, following the deliberate-split bullet and the rule index — the two places that ' +
      'state the intent rather than restate the table.',
    resolution: null,
  },
  {
    id: 'C3',
    title: 'One contract worker’s wage, stated two ways',
    says: [
      { at: 2379, text: '§3.3 locked formulas: “… wage = Piece Rate, no attendance (2026-27)”' },
      { at: 2600, text: '§3.3 rate table: “… | hours × ₹100 | 3.3”' },
      { at: 3406, text: '“… wage = Staff Report hours × Rs 100/hr (no monthly salary, no attendance tracking)”' },
      { at: 3561, text: 'Part IV sheet formula: “# … wage = total … hours × 100”' },
      { at: 4290, text: 'acceptance checklist: “… wages = hours × Rs 100/hr (no attendance row)”' },
    ],
    what: 'The locked-formula block calls it a piece rate with no attendance; four other places ' +
      'price it off hours at ₹100 an hour. Hours are an attendance measure, so “no attendance” ' +
      'and “hours × rate” cannot both be operative. The likeliest reading is that “no attendance” ' +
      'means no attendance-scaled monthly salary rather than no hours recorded — but that is a ' +
      'reading, and this file does not make readings.',
    repo: 'Piece-rate at ₹100 per hour, with the rate cited against all four statements in ' +
      'engine/fixtures/master.json under _rate_sources. The hours are taken from the work report, ' +
      'never from an attendance grid.',
    resolution: null,
  },
  {
    id: 'C4',
    title: 'The same worker is on two rosters and off a third',
    says: [
      { at: 509, text: 'Book 1 §A.6: active FY26-27 staff, ending “… ; contract [worker]”' },
      { at: 3380, text: 'Power BI staff master, currently active FY2026-27: the worker’s row is present, “Iron (Piece rate)”' },
      { at: 2333, text: 'Book 2 §2.1 “Staff — active (FY2026-27)”: the table lists eight people and this worker is not among them' },
    ],
    what: 'Two of the document’s three active-staff lists carry this worker and the third omits ' +
      'him. The omission is silent — he is not moved to the “confirm current status” table below ' +
      'it either, which is where a departure would have been recorded. Whether he is employed in ' +
      'FY2026-27 decides whether his months appear in payroll at all.',
    repo: 'Carried as active, following the two lists that name him, and his pay basis is ' +
      'piece-rate so no salary or threshold is implied by the choice.',
    resolution: null,
  },
  {
    id: 'C5',
    title: 'Female threshold hours — 218, 220 or 230',
    says: [
      { at: 1956, text: 'Book 1, Staff active FY2026-27: every female row’s Threshold reads 218' },
      { at: 2339, text: 'Book 2 §2.1, the same four people: every female row’s Threshold reads 220' },
      { at: 3376, text: 'Power BI staff master: one woman’s Threshold Hrs/Mo reads 230 while the other three read 220' },
      { at: 2376, text: '§3.3 formula: “Productivity / hour = salary / (Female ? 220 : 270)”' },
    ],
    what: 'Three of the document’s own staff tables give three different monthly hour thresholds ' +
      'for the same four women — 218, 220, and 220-with-one-at-230 — and the productivity formula ' +
      'hard-codes 220 for every woman regardless. The figure divides a salary, so the spread is ' +
      'worth about five per cent of an hourly cost.',
    repo: 'Neither figure is priced off. The daily rate is salary ÷ threshold DAYS and the hourly ' +
      'rate is that ÷ the person’s own shift, which §3.6.3 itself calls the correct derivation and ' +
      'the Threshold Hrs/Mo column legacy. The legacy values are kept so the legacy column can ' +
      'still be printed, and engine/fixtures/master.json says so in _threshold_hours_are_legacy.',
    resolution: null,
  },
  {
    id: 'C6',
    title: '23 garment columns claimed, 22 enumerated',
    says: [
      { at: 1973, text: 'It defines 23 garment columns (Anarkali, Plazo, Dupatta variants, …) grouped into 13 Set Types' },
      { at: 2401, text: 'Col A = Karigar name, Col B = Design Name, Col C onward = the 23 garment columns' },
      { at: 2403, text: '§4.1 heading: “The 23 garment-type columns → 13 Set Types”' },
      { at: 2404, text: 'the enumeration under that heading runs “2 Anarkali · 3 Plazo · … · 23 Alter” — indices 2 to 23, twenty-two of them' },
    ],
    what: 'The count 23 is stated three times and the enumeration under it lists 22, running C to ' +
      'X with none missing. The set-type map uses all 22 and references no 23rd. Either a column ' +
      'was dropped from the table or the count was never corrected.',
    repo: 'The 22 that are actually enumerated, in engine/fixtures/garment_columns.json, with the ' +
      'count pinned by a test so a real 23rd appearing later is a visible change and not a silent ' +
      'one.',
    resolution: null,
  },
  {
    id: 'C7',
    title: '“The remaining 5” designs, followed by seven names',
    says: [
      { at: 3255, text: 'Design → Set Type mapping comes from Stitching_Rates_Master.xlsx for 138 of 143 designs. The remaining 5 (Avinya, JennyBlack, JennyRed, LNB Lehenga, V4B, V527, Yeshan Cotton Sample) were inferred' },
      { at: 2625, text: '§16A: 5 no-rate designs (Avinya, LNB Lehenga, V4B, V527, Yeshan Cotton Sample) costed ₹0 & flagged' },
    ],
    what: 'Two problems in one sentence. The count says five and the list holds seven, and 143 ' +
      'minus 138 is five. Two of the seven names appear nowhere else in the document. Separately, ' +
      'this list is not the same list as §16A’s five, and the two describe different things — a ' +
      'design whose SET TYPE had to be inferred is not the same as a design with NO RATE. They ' +
      'share five names, which is what makes the conflation easy to miss.',
    repo: 'The five no-rate designs are carried by name in engine/fixtures/acceptance_16a.json, ' +
      'from §16A. The two names unique to the other list are carried nowhere, because nothing ' +
      'else in the document mentions them.',
    resolution: null,
  },
  {
    id: 'C8',
    title: 'Two set types: what the spec says they contain, and what the data reproduces',
    says: [
      { at: 2404, text: '§4.1 column map: “7 Dupatta(Kurti Palazzo) … 10 Dupatta(Lehenga Choli)”' },
      { at: 2406, text: '§4.1 set-type map: “Kurti Palazzo Set (5,6,7) · Lehenga Choli Set (8,9,10)” — three columns each, the third a dupatta' },
      { at: 2409, text: '§4.2.2: “Lehenga Choli = MIN(Blouse, Lehenga, Dupatta) when Dupatta>0, else MIN(Blouse, Lehenga)”' },
    ],
    what: 'The specification is explicit that both of these set types include a dupatta. The ' +
      'repository’s composition table says they do not, and did not get there by reading the ' +
      'name: each composition is the only one of the six possible slot combinations that ' +
      'reproduces the recorded Total Complete Sets for every design of that type — 25 designs for ' +
      'one, 34 for the other — in the karigar report. So a stated rule and a measured outcome ' +
      'disagree, which is the most useful kind of disagreement and the one hardest to settle from ' +
      'the document alone: either the dupatta genuinely does not constrain those sets in practice, ' +
      'or the recorded totals were themselves produced by a tool that had already dropped it.',
    repo: 'Two answers, and they are now visibly two. engine/fixtures/set_types.json carries the ' +
      'derived composition and the Python engine uses it; studio_core.js SET_RULES carries the ' +
      'spec’s composition and the Data Studio uses it. Nothing compared them until ' +
      'brand/site/checksets.js, which now fails on any membership disagreement not written down ' +
      'and on any recorded one that has gone away.',
    resolution: null,
  },
];

module.exports = { SOURCE, CONFLICTS };
