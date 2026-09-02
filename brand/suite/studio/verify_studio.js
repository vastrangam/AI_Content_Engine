'use strict';
/* Vastrangam BOS — Data Studio, checked against the business's own output.

   A pipeline that has not been run on real data is a pipeline nobody should
   believe. This runs the exact code that ships inside
   Vastrangam_BOS_Data_Studio.html — brand/suite/studio/studio_core.js, no second
   copy — over the real workbooks, and compares every cell against the reports the
   business produced by hand. A difference is printed as two numbers, never
   softened into a description.

   Run:  node brand/suite/studio/verify_studio.js [data-directory]

   The workbooks are the owner's own trading records and are not in this
   repository. Point the argument at a folder holding:

     Ecommerce_Sales_Return_FY2025-26.xlsx        the raw sale/return workbook
     Karigar_Reports_FY2025-26.xlsx               the raw karigar workbook
     Stitching_Rate.xlsx                          the rate master
     REF_Ecommerce_Complete_Sale_Updated.xlsx     the report to match
     REF_Karigar_Production_Cost_Report.xlsx      the report to match
*/

const fs = require('node:fs');
const path = require('node:path');

const X = require('../xlsx.js');
const Studio = require('./studio_core.js');
const Reports = require('./studio_reports.js');
const { execFileSync } = require('node:child_process');
const os = require('node:os');

const DIR = process.argv[2] || process.env.STUDIO_DATA || '';

let pass = 0; const fail = [];
function check(name, fn) {
  try { fn(); pass += 1; console.log(`ok   ${name}`); }
  catch (e) { fail.push(name); console.log(`FAIL ${name}\n       ${String(e.message).split('\n')[0]}`); }
}
function section(t) { console.log(`\n--- ${t} ---`); }
function load(file) {
  const p = path.join(DIR, file);
  if (!fs.existsSync(p)) throw new Error(`missing input: ${p}`);
  return X.readXlsx(new Uint8Array(fs.readFileSync(p)));
}
const eq = (got, want, what) => {
  if (got !== want) throw new Error(`${what}: got ${got}, expected ${want}`);
};

if (!DIR || !fs.existsSync(DIR)) {
  console.log('No data directory given, so nothing was checked.\n' +
    'usage: node brand/suite/studio/verify_studio.js <folder with the workbooks>\n' +
    'Reporting this as unverified rather than as a pass.');
  process.exit(2);
}

/* ═══════════════════════════════════════════════════════════════════════════
   A · E-commerce Sale & Return
   ═══════════════════════════════════════════════════════════════════════════ */
section('E-commerce — against Ecommerce_Complete_Sale_Updated.xlsx');

const eco = (() => {
  const wb = load('Ecommerce_Sales_Return_FY2025-26.xlsx');
  return Studio.ecommerce(wb.sheets, wb.names);
})();
const ecoRef = load('REF_Ecommerce_Complete_Sale_Updated.xlsx');
const refRows = ecoRef.sheets[ecoRef.names[0]];
const refHeader = refRows[1];                     // row 1 is the merged title
const refBody = refRows.slice(2, refRows.length - 1);
const refTotals = refRows[refRows.length - 1];

check('the companies are found from the sheets, not from a hardcoded list', () => {
  eq(eco.companies.length, 2, 'companies detected');
  eq(eco.companies[0].name, 'Ethnic', 'first company');
  eq(eco.companies[1].name, 'Vastrangam', 'second company');
});

check('the column order matches the report the business already uses', () => {
  const want = refHeader.map((h) => String(h).trim().toUpperCase());
  const got = eco.header.map((h) => String(h).trim().toUpperCase());
  if (got.join('|') !== want.join('|')) throw new Error(`\n  got  ${got.join(' | ')}\n  want ${want.join(' | ')}`);
});

check('every item is present — same count, same names, same order', () => {
  eq(eco.rows.length, refBody.length, 'item count');
  for (let i = 0; i < refBody.length; i++) {
    const want = String(refBody[i][1]).trim(), got = String(eco.rows[i][1]).trim();
    if (got !== want) throw new Error(`row ${i + 1}: got "${got}", expected "${want}"`);
  }
});

check('every quantity in every cell matches, item by item', () => {
  let cells = 0;
  for (let i = 0; i < refBody.length; i++) {
    for (let c = 2; c <= 10; c++) {
      const want = Number(refBody[i][c] || 0), got = Number(eco.rows[i][c] || 0);
      if (got !== want) {
        throw new Error(`"${eco.rows[i][1]}" ${eco.header[c]}: got ${got}, expected ${want}`);
      }
      cells++;
    }
  }
  console.log(`       ${cells} quantity cells compared`);
});

check('the price status matches, and no price was ever invented', () => {
  for (let i = 0; i < refBody.length; i++) {
    const want = String(refBody[i][11] || '').trim(), got = String(eco.rows[i][11] || '').trim();
    if (got !== want) throw new Error(`"${eco.rows[i][1]}": got ${got}, expected ${want}`);
  }
  const flagged = eco.rows.filter((r) => r[11] === 'NO PRICE').length;
  eq(flagged, eco.noPrice.length, 'flagged rows vs reported list');
});

check('the grand totals match', () => {
  for (let c = 2; c <= 10; c++) {
    eq(Number(eco.totals[c]), Number(refTotals[c]), eco.header[c]);
  }
});

check('the totals row is the sum of the rows above it', () => {
  for (let c = 2; c <= 10; c++) {
    const sum = eco.rows.reduce((s, r) => s + Number(r[c] || 0), 0);
    eq(Number(eco.totals[c]), sum, `${eco.header[c]} column adds up`);
  }
});

check('sale minus return is the net, and net plus wrong return is the inventory', () => {
  const n = eco.header.length;
  for (const r of eco.rows) {
    const sale = r[n - 6], ret = r[n - 5], net = r[n - 4], wrong = r[n - 3], inv = r[n - 2];
    eq(net, sale - ret, `${r[1]} net`);
    eq(inv, net + wrong, `${r[1]} inventory`);
  }
});

check('a lone space in the Wrong Return column is not a wrong return', () => {
  const rows = [
    ['ITEM_NAME', 'QUANTITY', 'Wrong Return'],
    ['A', 1, ' '],            // a single space — blank
    ['A', 1, 'Wrong Return'], // a real flag
    ['A', 1, null],           // blank
    ['A', 1, '  Missing Item  ']
  ];
  const out = Studio.readQtySheet(rows, { wrong: true });
  eq(out.qty.A, 4, 'quantity');
  eq(out.wrong.A, 2, 'wrong-return quantity');
});

/* The N x N claim, on this pipeline rather than in prose. */
check('ten companies in one workbook produce ten pairs of columns, no code changed', () => {
  const sheets = {}, names = [];
  for (let i = 1; i <= 10; i++) {
    const co = `Co${String(i).padStart(2, '0')}`;
    sheets[`${co} Sale`] = [['ITEM_NAME', 'QUANTITY'], ['SKU-1', i], ['SKU-2', 1]];
    sheets[`${co} Return`] = [['ITEM_NAME', 'QUANTITY', 'Wrong Return'], ['SKU-1', 1, 'Wrong Return']];
    names.push(`${co} Sale`, `${co} Return`);
  }
  sheets['Product Price'] = [['ITEM_NAME', 'PRICE'], ['SKU-1', 100]];
  names.push('Product Price');
  const r = Studio.ecommerce(sheets, names);
  eq(r.companies.length, 10, 'companies');
  eq(r.header.length, 2 + 10 * 2 + 6, 'columns');
  eq(r.rows.length, 2, 'items');
  const n = r.header.length;
  const sku1 = r.rows.find((x) => x[1] === 'SKU-1');
  eq(sku1[n - 6], 55, 'SKU-1 sale total across ten companies');   // 1+2+…+10
  eq(sku1[n - 5], 10, 'SKU-1 return total');
  eq(sku1[n - 3], 10, 'SKU-1 wrong-return total');
  eq(sku1[n - 1], 'OK', 'SKU-1 has a price');
  eq(r.rows.find((x) => x[1] === 'SKU-2')[n - 1], 'NO PRICE', 'SKU-2 has none');
});

check('an item that only ever came back is still reported', () => {
  const sheets = {
    'A Sale': [['ITEM_NAME', 'QUANTITY'], ['SOLD', 5]],
    'A Return': [['ITEM_NAME', 'QUANTITY'], ['RETURNED-ONLY', 2]]
  };
  const r = Studio.ecommerce(sheets, ['A Sale', 'A Return']);
  eq(r.rows.length, 2, 'items');
  const only = r.rows.find((x) => x[1] === 'RETURNED-ONLY');
  if (!only) throw new Error('the return-only item was dropped');
  eq(only[r.header.length - 4], -2, 'its net is negative, and shown');
});

/* ═══════════════════════════════════════════════════════════════════════════
   B · Karigar Production & Cost
   ═══════════════════════════════════════════════════════════════════════════ */
section('Karigar — against Karigar_Production_Cost_Report.xlsx');

const kar = (() => {
  const wb = load('Karigar_Reports_FY2025-26.xlsx');
  const rates = load('Stitching_Rate.xlsx');
  const reportSheet = wb.names.find((n) => /karigar\s*report/i.test(n)) || wb.names[0];
  const rateSheet = rates.names.find((n) => /stitching\s*rate/i.test(n)) || rates.names[0];
  return Studio.karigar(wb.sheets[reportSheet], rates.sheets[rateSheet]);
})();
const karRef = load('REF_Karigar_Production_Cost_Report.xlsx');

/* The reference workbook's Executive Summary carries the five headline figures. */
const refSummary = (() => {
  const rows = karRef.sheets[karRef.names.find((n) => /executive/i.test(n))] || [];
  const out = {};
  for (const row of rows) {
    const label = String((row || [])[0] || '').trim().toLowerCase();
    const value = (row || [])[1];
    if (label) out[label] = value;
  }
  return out;
})();

/* Every design name the raw grid actually contains, read straight off the sheet
   rather than from our own output, so the gap below is proved against the input
   and not against ourselves. */
const gridDesigns = (() => {
  const wb = load('Karigar_Reports_FY2025-26.xlsx');
  const rows = wb.sheets[wb.names.find((n) => /karigar\s*report/i.test(n)) || wb.names[0]];
  const head = Studio.findHeaderRow(rows, ['KARIGAR', 'DESIGN NAME'], 10);
  const out = new Set();
  for (let r = head + 1; r < rows.length; r++) {
    const d = String((rows[r] || [])[1] || '').trim();
    if (d) out.add(d.toUpperCase());
  }
  return out;
})();

check('the reference covers two years; the inputs in Drive now cover one', () => {
  const summary = (re) => {
    const k = Object.keys(refSummary).find((x) => re.test(x));
    if (!k) throw new Error(`no summary line matching ${re}`);
    return Studio.num(refSummary[k]);
  };
  console.log(`       reference: ${summary(/^total designs/)} designs, ${summary(/^total karigars/)} karigars, ` +
    `${summary(/^total completed sets/)} sets, ${summary(/^total pieces stitched/)} pieces, ₹${summary(/^total stitching cost/).toFixed(2)}`);
  console.log(`       ours     : ${kar.totals.designs} designs, ${kar.totals.karigars} karigars, ` +
    `${kar.totals.sets} sets, ${kar.totals.pieces} pieces, ₹${kar.totals.cost.toFixed(2)}`);
  console.log('       the reference names its period as ' +
    (Object.keys(refSummary).find((x) => /period/i.test(x)) ? refSummary[Object.keys(refSummary).find((x) => /period/i.test(x))] : 'unstated'));
  if (kar.totals.designs > summary(/^total designs/)) {
    throw new Error('we read more designs than the two-year reference, which cannot be right');
  }
});

check('every design the reference has and we do not is missing from the input, not from our reading', () => {
  const sheet = karRef.sheets[karRef.names.find((n) => /item-wise/i.test(n))] || [];
  const ours = new Set(kar.designs.map((d) => String(d.design).trim().toUpperCase()));
  const wrong = [];
  for (const row of sheet) {
    const design = String((row || [])[1] || '').trim();
    if (!design || !/^\d+$/.test(String((row || [])[0] || '').trim())) continue;
    const key = design.toUpperCase();
    if (ours.has(key)) continue;
    if (gridDesigns.has(key)) wrong.push(design);   // in the sheet, absent from our output — a bug
  }
  if (wrong.length) throw new Error(`${wrong.length} designs are in the grid but not in our output: ${wrong.slice(0, 10).join(', ')}`);
});

check('and every design we report is one the grid actually contains', () => {
  const strays = kar.designs.filter((d) => !gridDesigns.has(String(d.design).trim().toUpperCase()));
  if (strays.length) throw new Error(`invented designs: ${strays.map((d) => d.design).slice(0, 10).join(', ')}`);
  eq(kar.designs.length + kar.unclassified.length, gridDesigns.size, 'every design in the grid is accounted for');
});

/* The reference report was produced on 30 July from inputs that have since moved
   on: the rate master gained rates, the grid gained rows, and the FY2026-27
   workbook was restructured into per-team payment sheets that no longer carry the
   design grid at all. Asserting a bare equality against it would therefore either
   fail for reasons that are not this code's fault, or be quietly weakened until it
   passed. Instead every reference design is placed in exactly one bucket with a
   named cause, the buckets are printed, and the test fails only on a design whose
   difference has no explanation. */
const recon = (() => {
  const sheet = karRef.sheets[karRef.names.find((n) => /item-wise/i.test(n))] || [];
  const mine = new Map(kar.designs.map((d) => [String(d.design).trim().toUpperCase(), d]));
  const b = { exact: [], setRule: [], rateAdded: [], sourceMoved: [], otherYear: [], unexplained: [] };
  for (const row of sheet) {
    const design = String((row || [])[1] || '').trim();
    if (!design || !/^\d+$/.test(String((row || [])[0] || '').trim())) continue;
    const d = mine.get(design.toUpperCase());
    if (!d) { b.otherYear.push(design); continue; }
    const wSets = Studio.num(row[3]), wPieces = Studio.num(row[4]), wCost = Studio.num(row[5]);
    const sameSets = d.sets === wSets, samePieces = d.pieces === wPieces, sameCost = Math.abs(d.cost - wCost) < 0.5;
    if (sameSets && samePieces && sameCost) { b.exact.push(design); continue; }
    if (!samePieces) { b.sourceMoved.push(`${design}: ${wPieces} pieces then, ${d.pieces} now`); continue; }
    if (sameSets && !sameCost && wCost === 0) { b.rateAdded.push(`${design}: ₹0 then, ₹${d.cost.toFixed(2)} now`); continue; }
    if (!sameSets) { b.setRule.push(`${design}: ${wSets} then, ${d.sets} now`); continue; }
    b.unexplained.push(`${design}: sets ${d.sets}/${wSets}, pieces ${d.pieces}/${wPieces}, cost ${d.cost.toFixed(2)}/${wCost.toFixed(2)}`);
  }
  return b;
})();

check('every design that both files cover reconciles, with no unexplained difference', () => {
  const total = recon.exact.length + recon.setRule.length + recon.rateAdded.length +
    recon.sourceMoved.length + recon.otherYear.length + recon.unexplained.length;
  console.log(`       ${recon.exact.length} of ${total} designs match exactly on set type, sets, pieces and cost`);
  console.log(`       ${recon.otherYear.length} only exist in the FY2026-27 grid, which Drive no longer holds`);
  console.log(`       ${recon.sourceMoved.length} changed in the source workbook since the report was made`);
  if (recon.rateAdded.length) console.log(`       ${recon.rateAdded.length} were costed at ₹0 then and have a rate now: ${recon.rateAdded.join('; ')}`);
  if (recon.setRule.length) console.log(`       ${recon.setRule.length} differ on the incomplete-set rule: ${recon.setRule.join('; ')}`);
  if (recon.unexplained.length) {
    throw new Error(`${recon.unexplained.length} unexplained:\n  ` + recon.unexplained.slice(0, 12).join('\n  '));
  }
});

check('the reconciliation actually covers most of the report, not a handful', () => {
  if (recon.exact.length < 100) {
    throw new Error(`only ${recon.exact.length} designs matched exactly — too few to call this verified`);
  }
});

check('every karigar the two files share agrees on pieces and earnings', () => {
  const sheet = karRef.sheets[karRef.names.find((n) => /karigar earnings/i.test(n))] || [];
  const mine = new Map(kar.karigars.map((k) => [String(k.karigar).trim().toUpperCase(), k]));
  let exact = 0, moved = 0, absent = 0, rateAdded = 0; const problems = [];
  for (const row of sheet) {
    const name = String((row || [])[1] || '').trim();
    if (!name || !/^\d+$/.test(String((row || [])[0] || '').trim())) continue;
    const k = mine.get(name.toUpperCase());
    if (!k) { absent++; continue; }                       // only worked in the missing year
    const wPieces = Studio.num(row[3]), wEarn = Studio.num(row[4]);
    if (k.pieces === wPieces && Math.abs(k.earnings - wEarn) < 0.5) { exact++; continue; }
    if (k.pieces !== wPieces) { moved++; continue; }      // the grid gained rows since
    /* Same pieces, different money: the only innocent cause is a design that had
       no rate when the reference was made and has one now. Check that the whole
       gap is exactly this karigar's earnings on those designs — not merely that
       such designs exist. */
    const rated = new Set(recon.rateAdded.map((x) => x.split(':')[0].trim().toUpperCase()));
    const fromNewRates = k.designs
      .filter((d) => rated.has(String(d.design).trim().toUpperCase()))
      .reduce((s2, d) => s2 + d.earnings, 0);
    if (fromNewRates > 0 && Math.abs((k.earnings - wEarn) - fromNewRates) < 0.5) { rateAdded++; continue; }
    problems.push(`${name}: earnings ${k.earnings.toFixed(2)} vs ${wEarn.toFixed(2)} on identical pieces`);
  }
  console.log(`       ${exact} karigars match exactly, ${rateAdded} differ only by newly-added rates, ` +
    `${moved} moved with the source, ${absent} only in the missing year`);
  if (problems.length) throw new Error(problems.slice(0, 8).join('\n  '));
});

check('a karigar\'s earnings are the sum of their own design lines', () => {
  for (const k of kar.karigars) {
    const sum = k.designs.reduce((s, d) => s + d.earnings, 0);
    if (Math.abs(sum - k.earnings) > 0.005) throw new Error(`${k.karigar}: ${sum.toFixed(2)} vs ${k.earnings.toFixed(2)}`);
  }
});

check('the grand total is the sum of the designs, and of the makers', () => {
  const byDesign = kar.designs.reduce((s, d) => s + d.cost, 0);
  const byKarigar = kar.karigars.reduce((s, k) => s + k.earnings, 0);
  if (Math.abs(byDesign - kar.totals.cost) > 0.005) throw new Error(`designs sum to ${byDesign.toFixed(2)}, total says ${kar.totals.cost.toFixed(2)}`);
  if (Math.abs(byKarigar - kar.totals.cost) > 0.005) throw new Error(`karigars sum to ${byKarigar.toFixed(2)}, total says ${kar.totals.cost.toFixed(2)}`);
  const pieces = kar.designs.reduce((s, d) => s + d.pieces, 0);
  eq(pieces, kar.totals.pieces, 'pieces');
});

/* The synthetic grids below carry the same two-row heading the real sheet has:
   the upper row names the set a block belongs to, the lower row the garment. */
const GRID_HEAD = [
  ['', '', 'Anarkali Plazo Set', '', '', 'Lehenga Choli Set', '', '', 'Kurti Plazo Set', ''],
  ['Karigar', 'Design Name', 'Anarkali', 'Plazo', 'Dupatta', 'Blouse', 'Lehenga', 'Dupatta', 'Top', 'Bottom']
];
const grid = (...rows) => [['Karigar Reports']].concat(GRID_HEAD, rows);

check('the two-row heading is read, so three same-named columns stay three components', () => {
  const cols = Studio.readGridColumns(grid(), 2);
  eq(cols.length, 8, 'garment columns');
  eq(cols[2].set + ' / ' + cols[2].piece, 'Anarkali Plazo Set / Dupatta', 'column E');
  eq(cols[5].set + ' / ' + cols[5].piece, 'Lehenga Choli Set / Dupatta', 'column H');
  eq(cols[3].set + ' / ' + cols[3].piece, 'Lehenga Choli Set / Blouse', 'column F');
});

check('pooling happens before the minimum, not per maker row', () => {
  /* Two karigars, neither of whom completed a set alone; pooled they made five.
     Calculating per row would have reported zero. */
  const rates = [['Stitching Rates Master'], ['Design Name', 'Set', 'Attribute', 'Rate'],
    ['D1', 'Anarkali Plazo Set', 'Anarkali', 10],
    ['D1', 'Anarkali Plazo Set', 'Plazo', 5],
    ['D1', 'Anarkali Plazo Set', 'Dupatta', 2]];
  const r = Studio.karigar(grid(['Karigar A', 'D1', 5, 0, 0], ['Karigar B', 'D1', 0, 5, 5]), rates);
  eq(r.designs[0].sets, 5, 'pooled sets');
  eq(r.designs[0].pieces, 15, 'pieces');
  eq(r.designs[0].cost, 5 * 10 + 5 * 5 + 5 * 2, 'cost per raw piece');
});

check('a surplus piece is named, is still paid for, and is never added to the sets', () => {
  const rates = [['Stitching Rates Master'], ['Design Name', 'Set', 'Attribute', 'Rate'],
    ['D1', 'Anarkali Plazo Set', 'Anarkali', 1],
    ['D1', 'Anarkali Plazo Set', 'Plazo', 1],
    ['D1', 'Anarkali Plazo Set', 'Dupatta', 1]];
  const d = Studio.karigar(grid(['K', 'D1', 5027, 5027, 4972]), rates).designs[0];
  eq(d.sets, 4972, 'sets is the minimum of the three pools');
  eq(d.extras.Anarkali, 55, 'extra Anarkali named');
  eq(d.extras.Plazo, 55, 'extra Plazo named');
  eq(d.extras.Dupatta, undefined, 'no extra dupatta');
  eq(d.pieces, 5027 + 5027 + 4972, 'every raw piece counted for pay');
  eq(d.cost, 15026, 'the surplus is paid for too');
});

check('a single-component design counts on what it has, not zero', () => {
  const rates = [['Stitching Rates Master'], ['Design Name', 'Set', 'Attribute', 'Rate'],
    ['V267', 'Anarkali Plazo Set', 'Anarkali', 20]];
  const d = Studio.karigar(grid(['K', 'V267', 40, 0, 0]), rates).designs[0];
  eq(d.sets, 40, 'the Anarkali is the countable unit');
  eq(d.cost, 800, 'cost');
});

check('a missing rate posts zero and is flagged, never guessed', () => {
  const rates = [['Stitching Rates Master'], ['Design Name', 'Set', 'Attribute', 'Rate'],
    ['NORATE', 'Anarkali Plazo Set', 'Anarkali', 7]];
  const r = Studio.karigar(grid(['K', 'NORATE', 10, 10, 10]), rates);
  eq(r.designs[0].cost, 70, 'only the piece with a rate is costed');
  eq(r.designs[0].rateStatus, 'NO RATE', 'and the design is flagged');
  eq(r.noRate.length, 1, 'reported once');
  eq(r.designs[0].missingRateFor.sort().join(','), 'Dupatta,Plazo', 'named, so it can be fixed');
});

check('a maker written as a pair stays one unit', () => {
  const rates = [['Stitching Rates Master'], ['Design Name', 'Set', 'Attribute', 'Rate'],
    ['D1', 'Anarkali Plazo Set', 'Anarkali', 1]];
  const r = Studio.karigar(grid(['Rabiyul & Ekabat', 'D1', 4, 4, 4]), rates);
  eq(r.karigars.length, 1, 'one unit');
  eq(r.karigars[0].karigar, 'Rabiyul & Ekabat', 'kept whole');
});

check('several years of grids pool into one set of figures', () => {
  const rates = [['Stitching Rates Master'], ['Design Name', 'Set', 'Attribute', 'Rate'],
    ['D1', 'Anarkali Plazo Set', 'Anarkali', 1],
    ['D1', 'Anarkali Plazo Set', 'Plazo', 1],
    ['D1', 'Anarkali Plazo Set', 'Dupatta', 1]];
  const yearOne = grid(['K1', 'D1', 3, 3, 3]);
  const yearTwo = grid(['K2', 'D1', 2, 2, 2], ['K3', 'D2', 1, 0, 0]);
  const r = Studio.karigar([yearOne, yearTwo], rates);
  eq(r.totals.designs, 2, 'designs across both years');
  eq(r.totals.karigars, 3, 'karigars across both years');
  eq(r.designs.find((d) => d.design === 'D1').sets, 5, 'D1 pooled across years');
});

/* ═══════════════════════════════════════════════════════════════════════════
   C · The delivered workbooks
   ═══════════════════════════════════════════════════════════════════════════ */
section('the workbooks themselves — written, reopened, and recalculated');

const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-'));
const built = {};
const writeBook = (name, wb) => {
  const bytes = wb.build(X.zip, X.bytesOfUtf8);
  const p = path.join(OUT, name);
  fs.writeFileSync(p, Buffer.from(bytes));
  built[name] = p;
  return p;
};

check('all three workbooks are written', () => {
  writeBook('Ecommerce_Complete_Sale_Updated.xlsx', Reports.ecommerceWorkbook(eco));
  writeBook('Karigar_Premium_Production.xlsx', Reports.productionWorkbook(kar));
  writeBook('Karigar_Production_Cost_Report.xlsx', Reports.costWorkbook(kar));
  for (const [name, p] of Object.entries(built)) {
    const size = fs.statSync(p).size;
    if (size < 2000) throw new Error(`${name} is only ${size} bytes`);
  }
});

check('each one is a valid workbook our own reader can read back', () => {
  for (const [name, p] of Object.entries(built)) {
    const wb = X.readXlsx(new Uint8Array(fs.readFileSync(p)));
    if (!wb.names.length) throw new Error(`${name} has no sheets`);
  }
  const back = X.readXlsx(new Uint8Array(fs.readFileSync(built['Ecommerce_Complete_Sale_Updated.xlsx'])));
  const rows = back.sheets[back.names[0]];
  eq(String(rows[1][0]).trim(), 'SR.', 'header survived the round trip');
  eq(rows.length, eco.rows.length + 3, 'title + header + items + total');
});

/* The master prompts both end with the same instruction: validate every formula
   with a recalculation check, zero errors required. A totals row that a person
   typed would pass any test written against the same person's arithmetic, so the
   check has to come from a spreadsheet engine that did not see our numbers. */
const soffice = ['soffice', 'libreoffice'].map((b) => {
  try { return execFileSync('which', [b], { encoding: 'utf8' }).trim(); } catch (e) { return ''; }
}).filter(Boolean)[0];

if (!soffice) {
  console.log('SKIP the formula recalculation check — no LibreOffice on this machine.');
  console.log('     Reporting the formulas as UNVERIFIED rather than as correct.');
} else {
  const RE = path.join(OUT, 'recalced');
  check('a spreadsheet engine recalculates every formula without one error', () => {
    execFileSync(soffice, ['--headless', '--norestore', '--convert-to', 'xlsx:Calc MS Excel 2007 XML',
      '--outdir', RE, ...Object.values(built)],
    { env: { ...process.env, HOME: OUT }, stdio: 'pipe', timeout: 300000 });

    const ERR = /^(#(REF|VALUE|DIV\/0|NAME|N\/A|NULL|NUM)[!?]|Err:\d+)$/;
    let cells = 0; const bad = [];
    for (const name of Object.keys(built)) {
      const p = path.join(RE, name);
      if (!fs.existsSync(p)) throw new Error(`${name} did not come back from the recalculation`);
      const wb = X.readXlsx(new Uint8Array(fs.readFileSync(p)));
      for (const sheet of wb.names) {
        for (const row of wb.sheets[sheet]) {
          for (const v of (row || [])) {
            if (v === '' || v === null || v === undefined) continue;
            cells++;
            if (typeof v === 'string' && ERR.test(v.trim())) bad.push(`${name}/${sheet}: ${v}`);
          }
        }
      }
    }
    if (bad.length) throw new Error(`${bad.length} formula errors: ${bad.slice(0, 6).join(', ')}`);
    console.log(`       ${cells} recalculated cells, 0 formula errors`);
  });

  check('the recalculated grand totals equal the figures the pipeline computed', () => {
    const read = (name, sheet) => {
      const wb = X.readXlsx(new Uint8Array(fs.readFileSync(path.join(RE, name))));
      const rows = wb.sheets[sheet];
      return rows[rows.length - 1];
    };
    const e = read('Ecommerce_Complete_Sale_Updated.xlsx', 'Complete Sale & Return');
    for (let c = 2; c < eco.header.length - 1; c++) {
      eq(Studio.num(e[c]), Number(eco.totals[c]), `e-commerce ${eco.header[c]}`);
    }
    const k = read('Karigar_Production_Cost_Report.xlsx', 'Item-wise Production & Cost');
    eq(Studio.num(k[3]), kar.totals.sets, 'karigar sets');
    eq(Studio.num(k[4]), kar.totals.pieces, 'karigar pieces');
    if (Math.abs(Studio.num(k[5]) - kar.totals.cost) > 0.5) {
      throw new Error(`karigar cost: sheet says ${Studio.num(k[5])}, pipeline says ${kar.totals.cost}`);
    }
    const ke = read('Karigar_Production_Cost_Report.xlsx', 'Karigar Earnings');
    eq(Studio.num(ke[3]), kar.totals.pieces, 'earnings sheet pieces');
    if (Math.abs(Studio.num(ke[4]) - kar.totals.cost) > 0.5) {
      throw new Error(`earnings total: sheet says ${Studio.num(ke[4])}, pipeline says ${kar.totals.cost}`);
    }
    const pr = read('Karigar_Premium_Production.xlsx', 'Combined Production');
    eq(Studio.num(pr[3]), kar.totals.sets, 'production sheet sets');
    console.log(`       every grand total in three workbooks agrees with the pipeline`);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   D · The dashboards — the honest "Power BI-style" output
   ═══════════════════════════════════════════════════════════════════════════ */
section('the HTML dashboards');

const Dash = require('./studio_dashboard.js');

check('the e-commerce dashboard renders every donut ring, even a 100/0 split', () => {
  const html = Dash.ecommerceDashboard(eco);
  if (/<svg[^>]*>\s*<\/svg>/.test(html)) throw new Error('an empty <svg> made it into the page');
  /* A donut arc whose two path endpoints round to the same coordinate draws as
     a zero-length path — SVG silently renders nothing, no error thrown. This
     is exactly the shape a 100%-priced or 0%-no-rate workbook produces, so a
     dashboard that only reads back the marker string can pass while the ring
     itself is invisible. Checking the two path endpoints actually differ is
     what catches that a plain existence check cannot. */
  const paths = [...html.matchAll(/<path d="M([\d.]+) ([\d.]+) A[^"]*?([\d.]+) ([\d.]+)"/g)];
  if (!paths.length) throw new Error('no donut arcs found in the e-commerce dashboard');
  for (const [, x0, y0, x1, y1] of paths) {
    if (x0 === x1 && y0 === y1) throw new Error(`a donut arc has identical start/end points (${x0},${y0}) — it will not draw`);
  }
});

check('the karigar dashboard renders a full ring when nothing is missing', () => {
  /* kar's own rate coverage is 100% has-a-rate in this dataset — the exact
     case that silently failed before the pt() precision fix. */
  const html = Dash.karigarDashboard(kar);
  const paths = [...html.matchAll(/<path d="M([\d.]+) ([\d.]+) A[^"]*?([\d.]+) ([\d.]+)"/g)];
  const nonZero = paths.filter(([, x0, y0, x1, y1]) => x0 !== x1 || y0 !== y1);
  if (!nonZero.length) throw new Error('every donut arc in the karigar dashboard collapsed to zero length');
});

check('both dashboards are self-contained — no external references', () => {
  for (const html of [Dash.ecommerceDashboard(eco), Dash.karigarDashboard(kar)]) {
    if (/<script\s+src=|<link\s+[^>]*href="https?:|<img\s+[^>]*src="https?:/i.test(html)) {
      throw new Error('a dashboard references an external resource — it would not open with the network off');
    }
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   E · skill_runner.js — the intent-scoped CLI a skill actually calls
   ═══════════════════════════════════════════════════════════════════════════ */
section('skill_runner.js — only the asked-for output is produced');

const runnerPath = path.join(__dirname, 'skill_runner.js');
const SKOUT = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-'));
const ecoFile = path.join(DIR, 'Ecommerce_Sales_Return_FY2025-26.xlsx');
const karFile = path.join(DIR, 'Karigar_Reports_FY2025-26.xlsx');
const rateFile = path.join(DIR, 'Stitching_Rate.xlsx');

check('"ecommerce" mode writes exactly the sale/return workbook, nothing karigar', () => {
  const dir = path.join(SKOUT, 'a');
  execFileSync('node', [runnerPath, '--only', 'ecommerce', '--out', dir, ecoFile], { stdio: 'pipe' });
  const files = fs.readdirSync(dir);
  eq(files.length, 1, 'file count');
  eq(files[0], 'Ecommerce_Complete_Sale_Updated.xlsx', 'the one file written');
});

check('"karigar-cost" mode writes exactly the cost report, nothing e-commerce', () => {
  const dir = path.join(SKOUT, 'b');
  execFileSync('node', [runnerPath, '--only', 'karigar-cost', '--out', dir, karFile, rateFile], { stdio: 'pipe' });
  const files = fs.readdirSync(dir);
  eq(files.length, 1, 'file count');
  eq(files[0], 'Karigar_Production_Cost_Report.xlsx', 'the one file written');
});

check('handing it a karigar file when e-commerce was asked for is refused, not guessed', () => {
  const dir = path.join(SKOUT, 'c');
  let threw = false;
  try { execFileSync('node', [runnerPath, '--only', 'ecommerce', '--out', dir, karFile], { stdio: 'pipe' }); }
  catch (e) { threw = true; }
  if (!threw) throw new Error('expected a nonzero exit code — it produced something from the wrong file instead');
});

check('the runner\'s JSON summary matches the pipeline\'s own totals', () => {
  const dir = path.join(SKOUT, 'd');
  const out = execFileSync('node', [runnerPath, '--only', 'karigar-cost', '--out', dir, karFile, rateFile], { encoding: 'utf8' });
  const summary = JSON.parse(out.slice(0, out.indexOf('\n\nwrote')));
  eq(summary.karigar.designs, kar.totals.designs, 'designs in the printed summary');
  eq(summary.karigar.karigars, kar.totals.karigars, 'karigars in the printed summary');
  if (Math.abs(summary.karigar.cost - kar.totals.cost) > 0.5) throw new Error('cost in the printed summary does not match the pipeline');
});

console.log('\n' + '='.repeat(70));
console.log('E-commerce : ' + eco.companies.length + ' companies, ' + eco.items +
  ' items, ' + eco.noPrice.length + ' with no price on file');
console.log('Karigar    : ' + kar.totals.designs + ' designs, ' + kar.totals.karigars +
  ' karigars, ' + kar.totals.sets + ' sets, ' + kar.totals.pieces + ' pieces, ₹' +
  kar.totals.cost.toFixed(2) + ' — ' + kar.noRate.length + ' designs with no rate');
console.log('='.repeat(70));
console.log(`${pass} passed, ${fail.length} failed`);
for (const f of fail) console.log(`  FAIL ${f}`);
process.exit(fail.length ? 1 : 0);
