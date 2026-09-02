'use strict';
/* WHERE THE SPECIFICATION CONTRADICTS ITSELF — recorded, not resolved.
 *
 * WHY THIS FILE EXISTS
 * Three specification documents have been supplied, the largest 5,676 lines assembled from several
 * earlier ones. In each place recorded below, two passages disagree — sometimes across documents,
 * more often inside one. Every one is a real fork in what the software should do, and every one
 * was found by reading rather than by a test, which is exactly the kind of finding that gets
 * mentioned once in a conversation and then lost. The count is not typed here: checkconflicts.js
 * derives it, because a number in a comment is the first thing to go stale.
 *
 * THE DECISION TAKEN ON THESE WAS: FLAG THEM, DO NOT RESOLVE THEM.
 * So `resolution` is null on every entry, and that is not an oversight — it is the answer. What
 * the repository currently does is recorded separately in `repo`, because "what we do today" and
 * "what is correct" are different claims and merging them is how a guess becomes a decision.
 *
 * NO PERSON IS NAMED HERE.
 * Several entries are about one worker's pay, or which roster a worker is on. The repository's own
 * rule is that a person's name does not go into a committed document, and a conflict being ABOUT
 * somebody does not suspend it. Each is described by role and the quoted lines are redacted where
 * the line is itself a list of names; the line numbers point at the exact rows in the owner's own
 * file, which is what somebody resolving it needs anyway.
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

/* MORE THAN ONE DOCUMENT NOW, WHICH IS WHY THIS EXISTS.
 *
 * The register was built around a single specification and every line number meant a line in it.
 * A second and third document then arrived — the staff and karigar master prompts — and they
 * contradict the first one AND themselves. Keeping one implicit source would have meant either
 * dropping those contradictions or filing them under line numbers in a file that does not have
 * those lines, which is worse than not recording them: it looks checkable and is not.
 *
 * So a conflict may name its `source`. Anything that does not gets the original, which is what
 * every entry written before this meant. */
const SOURCES = {
  master: SOURCE,
  staff: {
    file: 'STAFF_MASTER_PROMPT.md',
    lines: 205,
    note: 'Supplied as an upload, not committed here. Line numbers are 1-based in that file.',
  },
  karigar: {
    file: 'KARIGAR_MASTER_PROMPT.md',
    lines: 157,
    note: 'Supplied as an upload, not committed here. Line numbers are 1-based in that file.',
  },
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
    affects: ['Marketplace OMS', 'Channels & Storefronts', 'Reconciliation', 'Payout Cycles'],
    safe: 'Nothing is decided by the count, so nothing is at risk. A channel is a row and every sale carries its channel_id, so the system reports whatever channels exist rather than a number it was told to expect.',
    decide: 'Which channels are live today, and which are a target? The register can hold both, but a report headed “all marketplaces” means one of them.',
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
    affects: ['Catalog / PIM', 'Master-Data Hygiene', 'Stock'],
    safe: 'GF is used, following the two places that state the intent rather than restate the table. A SKU code is data, so a change is a migration of existing codes rather than an edit — which is why the choice is recorded rather than assumed.',
    decide: 'Is the second company’s SKU brand code EF or GF? If any code has already been printed, labelled or sent to a channel as EF, the answer decides a migration and not just a setting.',
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
    affects: ['Piece-rate & Contractors', 'Staff & Contractors', 'Payout Execution'],
    safe: 'Priced as a piece rate at ₹100 per hour, with all four contradicting statements cited beside it in the fixture rather than silently reconciled. Hours come from the work report and never from an attendance grid, so “no attendance” holds in the sense that can be honoured.',
    decide: 'Does “no attendance” mean no attendance-scaled salary, or that hours are not counted at all? The two readings pay differently in any month where recorded hours differ from the assumed ones.',
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
    affects: ['Staff & Contractors', 'Payout Execution', 'Piece-rate & Contractors'],
    safe: 'Carried as active, following the two lists that name him. His pay basis is piece rate, so the choice implies no salary and no threshold — a wrong answer here costs nothing until he is actually paid.',
    decide: 'Was this worker employed in FY2026-27? The answer decides whether his months appear in payroll at all.',
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
    affects: ['Staff & Contractors', 'Payout Execution', 'Time-off & Advances'],
    safe: 'Neither disputed figure is priced off. Pay is derived from the salary and the person’s own shift, which the source document itself calls the correct derivation, and the three legacy values are kept only so the legacy column can still be printed — marked as legacy in the fixture so nobody mistakes them for the live basis.',
    decide: 'Which monthly hour threshold is current for these four — 218, 220 or 230? It is only needed if the legacy column is ever to be paid from rather than printed.',
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
    affects: ['PLM & Development', 'Production Orders', 'BOM & Consumption'],
    safe: 'The 22 that are actually enumerated are used, and the count is pinned by a test — so a real 23rd appearing later is a visible failure rather than a silent widening.',
    decide: 'Was a 23rd garment column dropped from the table, or was the count never corrected? If a column is missing, every set composition derived from the 22 is derived from an incomplete list.',
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
    affects: ['PLM & Development', 'Piece-rate & Contractors', 'Design / IP Register'],
    safe: 'Only the five named in the section that is actually about rates are carried. The two names that appear nowhere else are carried nowhere, rather than being folded into a list they may not belong to.',
    decide: 'Are the two extra names designs with no rate, or designs whose set type had to be inferred? They are different problems, and the five shared names are what makes the conflation easy to miss.',
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
    repo: 'HALF OF THIS IS NOW SETTLED, BY THE OWNER, AND HALF IS NOT. He said of a set: “it can ' +
      'be 3 piece top bottom dupatta or it can be lehenga choli dupatta”. An OPTIONAL dupatta ' +
      'satisfies both readings at once — all 34 recorded designs still reconcile without one, and ' +
      'a design that ships one has somewhere to record it — so engine/fixtures/set_types.json now ' +
      'carries Dupatta on Lehenga Choli Set with required:false, which is what studio_core.js ' +
      'SET_RULES had said all along. The disagreement for that set type is gone and its entry has ' +
      'been removed from _javascript_table_differs. **Kurti Palazzo Set is untouched and still ' +
      'disagrees** — he has not spoken about that one, and resolving it by analogy would be ' +
      'inventing his answer. brand/site/checksets.js fails on any membership disagreement not ' +
      'written down and equally on a recorded one that has gone away, which is how the removal ' +
      'was forced rather than remembered.',
    affects: ['Production Orders', 'BOM & Consumption', 'Piece-rate & Contractors', 'Quality Control'],
    safe: 'One of the two set types is settled by the owner’s own words and now carries an optional dupatta, which satisfies the specification and the measured totals at once. The other is left exactly as the data reproduces it and is recorded as still disagreeing — a gate fails both on an undeclared disagreement and on a declared one that has quietly gone away.',
    decide: 'Does the second set type include a dupatta? Either the dupatta does not constrain those sets in practice, or the recorded totals were produced by a tool that had already dropped it — and only the person who ran the floor can say which.',
    resolution: 'Partly, and only the part he spoke to. Lehenga Choli Set carries an optional ' +
      'dupatta on the owner’s own words. Kurti Palazzo Set remains open.',
  },
  {
    id: 'C9',
    source: 'staff',
    title: 'Who was on the floor, against who the rate card says is present',
    says: [
      { at: 169, text: 'Working: <eight names, one of the two ironing staff among them>.' },
      { at: 89, text: '<ironing staff A> | Jun 2025 – present | 23,000 | 280 | 82.14' },
      { at: 90, text: '<ironing staff B> | Apr 2026 – present | 28,000 | 280 | 100.00' },
      { at: 171, text: 'Left: <one name> (Aug 2026).' },
    ],
    what: 'The floor list for 1 Sep 2026 names one of the two ironing staff as working and does ' +
      'not name the other at all. The rate card twelve lines earlier says BOTH are "present", ' +
      'and the Left line names only one person, who is not either of them. So the same document ' +
      'says one of them is working, implies the other is not, and separately says both are on ' +
      'the books — and a reader cannot tell whether the floor list is the payroll register or ' +
      'just who happened to be in the building that day. Asked directly, the owner gave a list ' +
      'that swaps which of the two is working, contradicting his own floor line. The quotes above are redacted: these lines are rosters and every one of them is a person, and a name does not enter a committed document because a conflict happens to be about somebody. The line numbers point at the rows in his own file, which is where the names are.',
    repo: 'The engine holds the list he stated when asked, because it is the most recent direct ' +
      'answer and he was shown the contradicting line before giving it. The roster is checked ' +
      'name for name against that list on every run, and the snapshot date it was true on is ' +
      'recorded beside it so it cannot quietly come to mean "now".',
    affects: ['Staff & Contractors', 'Payout Execution'],
    safe: 'The list the owner gave when asked directly is held, because it is the most recent answer and he was shown the contradicting line before giving it. The date it was true on is recorded beside it, so it cannot quietly come to mean “now”.',
    decide: 'Is the floor list the payroll register, or a note of who was in the building that day? Every roster question downstream turns on which of the two it is.',
    resolution: null,
  },
  {
    id: 'C10',
    source: 'staff',
    title: 'A contractor priced for a year the roster says he had already left',
    says: [
      { at: 101, text: '<contractor A> / <contractor B> FY26-27: **iron piece rates**, not salary.' },
      { at: 100, text: '<contractor A> FY25-26: ₹100 / hour iron (only if hours exist; FY25 register has no clock for him).' },
      { at: 169, text: 'Working: <eight names, one of the two contractors among them>.' },
    ],
    what: 'Two contractors are put on iron piece rates for FY2026-27, which begins 1 April 2026. ' +
      'The floor list for 1 September 2026 names one of them and not the other, and the owner ' +
      'separately confirmed a leaving date of 31 March 2026 for the one it omits — the day ' +
      'before the year those piece rates apply to. He also described both as people who "can ' +
      'come to work on contract basis" whenever needed, which is an arrangement neither an open ' +
      'spell nor a closed one describes: a closed spell cannot be paid, and an open one is ' +
      'employment nobody claims. The prior-year line adds a third reading, naming only one of ' +
      'them for the hourly rate the owner elsewhere gave to both. The quotes are redacted for the same reason as the entry above; the line numbers point at his own file.',
    repo: 'The confirmed leaving date is held, so that contractor resolves nothing in FY2026-27 ' +
      'and his months pay nobody. The operation\'s rate card is untouched and still prices the ' +
      'work, so recording a return is a spell and not a rate. Both contractors keep the prior ' +
      'year\'s hourly row, on the owner\'s direct answer that both had it.',
    affects: ['Staff & Contractors', 'Piece-rate & Contractors', 'Payout Execution'],
    safe: 'The confirmed leaving date is held, so that contractor resolves nothing in the year in question and his months pay nobody. The operation’s rate card is untouched, so recording a return is a spell rather than a rate.',
    decide: 'How should somebody who “can come to work on contract basis” be held? A closed spell cannot be paid and an open one is employment nobody is claiming — this needs a third shape, and naming it is the owner’s call.',
    resolution: null,
  },
];

module.exports = { SOURCE, SOURCES, CONFLICTS };
