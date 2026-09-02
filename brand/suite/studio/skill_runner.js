'use strict';
/* Vastrangam BOS — the Node-side door onto the same engine the browser tool uses.

   Vastrangam_BOS_Data_Studio.html is for a person clicking buttons in a browser.
   This is for a Claude session with an uploaded file and a specific sentence —
   "give me the karigar and payment report" — that should produce exactly that
   and nothing else. Same studio_core.js, same studio_reports.js, same
   studio_dashboard.js: there is no second implementation to drift from the one
   verify_studio.js already checked against real data.

   Usage:
     node skill_runner.js --only <mode> [--out <dir>] <file.xlsx> [<file2.xlsx> ...]

   Modes (pick exactly what was asked for — never "all" unless that is the ask):
     ecommerce            Ecommerce_Complete_Sale_Updated.xlsx
     ecommerce-dashboard  E-commerce HTML dashboard (the "Power BI-style" output)
     karigar-production   Karigar_Premium_Production.xlsx (quantities only)
     karigar-cost         Karigar_Production_Cost_Report.xlsx (4 sheets incl. payment/earnings)
     karigar-dashboard    Karigar HTML dashboard
     all                  everything the uploaded files support

   Exit code is nonzero on any failure — a skill that silently produced nothing
   is worse than one that told Claude it couldn't.
*/

const fs = require('node:fs');
const path = require('node:path');

const X = require('../xlsx.js');
const Core = require('./studio_core.js');
const Reports = require('./studio_reports.js');
const Dash = require('./studio_dashboard.js');

const MODES = [
  'ecommerce', 'ecommerce-dashboard',
  'karigar-production', 'karigar-cost', 'karigar-dashboard',
  'all',
];

function parseArgs(argv) {
  const out = { only: null, outDir: process.cwd(), files: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--only') { out.only = argv[++i]; continue; }
    if (a === '--out') { out.outDir = argv[++i]; continue; }
    if (a === '--help' || a === '-h') { out.help = true; continue; }
    out.files.push(a);
  }
  return out;
}

function usage() {
  return [
    'usage: node skill_runner.js --only <mode> [--out <dir>] <file.xlsx> [...]',
    '',
    'modes: ' + MODES.join(', '),
  ].join('\n');
}

function loadWorkbook(file) {
  return X.readXlsx(new Uint8Array(fs.readFileSync(file)));
}

function writeXlsx(outDir, name, workbookObj) {
  const bytes = workbookObj.build(X.zip, X.bytesOfUtf8);
  const p = path.join(outDir, name);
  fs.writeFileSync(p, Buffer.from(bytes));
  return p;
}

function writeHtml(outDir, name, html) {
  const p = path.join(outDir, name);
  fs.writeFileSync(p, html);
  return p;
}

/** Merge every uploaded workbook that looks like an e-commerce sale/return
 *  file into one sheet set — several files become several companies' worth of
 *  columns, exactly as the browser tool does it. */
function mergeEcommerceSheets(wbs) {
  const sheets = {}; const names = [];
  wbs.forEach((wb) => {
    wb.names.forEach((n) => {
      const key = names.includes(n) ? `${n} (${wb.__file})` : n;
      sheets[key] = wb.sheets[n]; names.push(key);
    });
  });
  return { sheets, names };
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.only) { console.log(usage()); process.exit(args.help ? 0 : 1); }
  if (!MODES.includes(args.only)) {
    console.error(`Unknown mode "${args.only}".\n\n${usage()}`);
    process.exit(1);
  }
  if (!args.files.length) { console.error('No input files given.\n\n' + usage()); process.exit(1); }
  const missing = args.files.filter((f) => !fs.existsSync(f));
  if (missing.length) { console.error('File(s) not found: ' + missing.join(', ')); process.exit(1); }

  fs.mkdirSync(args.outDir, { recursive: true });

  const wbs = args.files.map((f) => {
    const wb = loadWorkbook(f);
    wb.__file = path.basename(f);
    return wb;
  });

  /* Classify every uploaded workbook the same way the browser tool does —
     shared logic, so a file that reads as "karigar" here reads as "karigar"
     there too. */
  const byRole = { ecommerce: [], karigar: [], rates: [], unknown: [] };
  wbs.forEach((wb) => { byRole[Core.classify(wb)].push(wb); });

  if (byRole.unknown.length) {
    console.error('Not recognised as a sale/return, karigar or rate-master workbook: ' +
      byRole.unknown.map((wb) => wb.__file).join(', '));
  }

  const written = [];
  const wantsEcommerce = ['ecommerce', 'ecommerce-dashboard', 'all'].includes(args.only);
  const wantsKarigar = ['karigar-production', 'karigar-cost', 'karigar-dashboard', 'all'].includes(args.only);

  let ecoResult = null;
  if (wantsEcommerce) {
    if (!byRole.ecommerce.length) {
      console.error(`--only ${args.only} needs a sale/return workbook (with "<Company> Sale" / "<Company> Return" sheets) — none of the files given classify as one.`);
      process.exit(1);
    }
    const merged = mergeEcommerceSheets(byRole.ecommerce);
    ecoResult = Core.ecommerce(merged.sheets, merged.names);
  }

  let karResult = null;
  if (wantsKarigar) {
    const grids = byRole.karigar.map((wb) => {
      const gn = Core.sheetWith(wb, ['KARIGAR', 'DESIGN NAME'], 10);
      return gn ? wb.sheets[gn] : null;
    }).filter(Boolean);
    if (!grids.length) {
      console.error(`--only ${args.only} needs a karigar production grid — none of the files given classify as one.`);
      process.exit(1);
    }
    let rateRows = null;
    const rateSource = byRole.rates[0] || byRole.karigar.find((wb) => Core.sheetWith(wb, ['DESIGN NAME', 'SET', 'ATTRIBUTE', 'RATE'], 8));
    if (rateSource) {
      const rn = Core.sheetWith(rateSource, ['DESIGN NAME', 'SET', 'ATTRIBUTE', 'RATE'], 8);
      if (rn) rateRows = rateSource.sheets[rn];
    } else {
      console.error('No Stitching Rates Master found — every piece will be costed at ₹0 and every design flagged. Add the rate master for real figures.');
    }
    karResult = Core.karigar(grids, rateRows || []);
  }

  if (args.only === 'ecommerce' || args.only === 'all') {
    written.push(writeXlsx(args.outDir, 'Ecommerce_Complete_Sale_Updated.xlsx', Reports.ecommerceWorkbook(ecoResult)));
  }
  if (args.only === 'ecommerce-dashboard' || args.only === 'all') {
    written.push(writeHtml(args.outDir, 'Ecommerce_Dashboard.html', Dash.ecommerceDashboard(ecoResult)));
  }
  if (args.only === 'karigar-production' || args.only === 'all') {
    written.push(writeXlsx(args.outDir, 'Karigar_Premium_Production.xlsx', Reports.productionWorkbook(karResult)));
  }
  if (args.only === 'karigar-cost' || args.only === 'all') {
    written.push(writeXlsx(args.outDir, 'Karigar_Production_Cost_Report.xlsx', Reports.costWorkbook(karResult)));
  }
  if (args.only === 'karigar-dashboard' || args.only === 'all') {
    written.push(writeHtml(args.outDir, 'Karigar_Dashboard.html', Dash.karigarDashboard(karResult)));
  }

  /* A short, machine-readable summary on stdout — a session driving this as a
     skill reads this rather than re-deriving the figures by re-parsing files. */
  const summary = { mode: args.only, files: written };
  if (ecoResult) {
    summary.ecommerce = {
      companies: ecoResult.companies.map((c) => c.name),
      items: ecoResult.items, noPrice: ecoResult.noPrice.length,
    };
  }
  if (karResult) {
    summary.karigar = {
      designs: karResult.totals.designs, karigars: karResult.totals.karigars,
      sets: karResult.totals.sets, pieces: karResult.totals.pieces,
      cost: karResult.totals.cost, noRate: karResult.noRate.length,
    };
  }
  console.log(JSON.stringify(summary, null, 2));
  console.log('\nwrote ' + written.length + ' file(s):');
  written.forEach((p) => console.log('  ' + p));
}

if (require.main === module) run();
module.exports = { run, parseArgs, MODES };
