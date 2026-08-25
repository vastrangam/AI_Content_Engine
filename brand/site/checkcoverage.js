'use strict';
/* EVERY DELIVERED DOCUMENT, MEASURED AGAINST EVERY REGISTER.
 *
 *   node brand/site/checkcoverage.js
 *   node brand/site/checkcoverage.js --summary
 *
 * WHY THIS FILE EXISTS
 * Three times now the same failure has been found by the same method and fixed one document at
 * a time:
 *
 *   1. The tenant guide printed "Module 05 · 18 rules" and none of the rules. Fixed inside
 *      mktenant.js.
 *   2. The other four documents then shipped carrying 0, 4, 0 and 4 of 285 — because the gate
 *      had been written into the generator for the one document somebody complained about.
 *      Fixed by sharing the gate.
 *   3. Pointing the same measurement at the OTHER registers found the plan carrying 0 of 19
 *      technical layers, 1 of 24 changeable things, 5 of 113 apps and 27 technical terms it
 *      used and never explained. Nothing could see it, because every gate that existed asked
 *      "is what is here correct?" and none asked "is anything missing?"
 *
 * So this file does not check a document. It checks that a DECISION EXISTS for every document
 * and every register — `full`, or a written reason. A register nobody has decided about is the
 * failure, and it fails here rather than in a reader's hands.
 *
 * Adding a seventh register to registers.js breaks this file until somebody decides what each
 * document does about it. That is the point.
 */

const fs = require('node:fs');
const path = require('node:path');
const REG = require('./registers.js');

const ROOT = path.join(__dirname, '..', '..');

/* Words that appear in their EVERYDAY sense in a document, not the technical one the glossary
   defines. Explaining the technical meaning beside one of these would teach a reader something
   false about their own vocabulary, so each is listed with its reason where it is used. */
const TRADE_WORDS = {
  /* "Job work" is this trade's own term for making goods on contract. Nothing to do with a
     background job. And "row" appears only as a spreadsheet row, quoted from the business's own
     recorded file layout — not a database row, and not mine to reword. */
  'VASTRANGAM_TENANT_GUIDE.md': ['job', 'row'],
};

/* ── the declarations ────────────────────────────────────────────────────────
   `full` means every item, checked. Anything else is a reason, and a reason is a sentence
   somebody can disagree with — which is the only kind worth recording. */
const DOCS = [
  {
    file: 'MEDHAVA_BUILD_GUIDE.md',
    what: 'how the platform is engineered, for whoever builds it',
    decide: {
      rules: 'full',
      modules: 'full',
      stack: 'full',
      dynamic: 'full',
      glossary: 'full',
      apps: 'The 113 apps are product scope, and this document is the engineering design — ' +
        'layer by layer, not screen by screen. The full list is in the plan of action, which ' +
        'is the document that owns scope, and in the merged BOS which carries both.',
    },
  },
  {
    file: 'MEDHAVA_PLAN_OF_ACTION.md',
    what: 'what is being built, in what order, and the rules it must satisfy',
    decide: {
      rules: 'full', modules: 'full', apps: 'full', stack: 'full', dynamic: 'full', glossary: 'full',
    },
  },
  {
    file: 'Medhava_BOS_Final.md',
    what: 'the website, the plan and the build guide as one document',
    decide: {
      rules: 'full', modules: 'full', apps: 'full', stack: 'full', dynamic: 'full', glossary: 'full',
    },
  },
  {
    file: 'VASTRANGAM_TENANT_GUIDE.md',
    what: 'one business on the platform — its own data, rules and logic',
    decide: {
      rules: 'full', modules: 'full', apps: 'full', stack: 'full', dynamic: 'full', glossary: 'full',
    },
  },
  {
    file: 'brand/delivery/website/MEDHAVA_BOS/Medhava_Website.md',
    what: 'the landing page — what the product is, for somebody deciding whether to look further',
    decide: {
      modules: 'full',
      apps: 'full',
      rules: 'A landing page that opened with 285 numbered rules would not be read, and the ' +
        'reader who wants them is one click from the plan of action, which carries every one. ' +
        'The page states the rules that decide a purchase — no lock-in, nothing static, no ' +
        'password ever asked for — and names where the rest live.',
      stack: 'Same reason. The promise a buyer needs is "you are not locked in"; the 19-layer ' +
        'register that proves it belongs in the plan and the build guide, and the page says so.',
      dynamic: 'Same reason. The page makes the claim; the plan carries the register.',
      glossary: 'A sales page is written in the reader’s words, not in terms needing a glossary. ' +
        'It is measured the same way as every other document — a technical word it does use ' +
        'still has to be explained where it is used.',
    },
  },
  {
    file: 'DEPLOYMENT.md',
    what: 'the server runbook — putting the platform on a machine and keeping it there',
    decide: {
      rules: 'This is an operations runbook for one machine, not a specification of what the ' +
        'software does. The rules are enforced by the software wherever it is deployed, and ' +
        'they do not change with the server it runs on.',
      modules: 'Same reason — the deployment is identical whichever modules a business has on.',
      apps: 'The machine does not know how many apps the software has, and deploying it does not ' +
        'change with the answer. Naming 113 screens in a runbook would lengthen the one document ' +
        'somebody reads at three in the morning with a fault in front of them.',
      stack: 'This document deploys the choices; the register that names the alternatives, and ' +
        'what each swap costs, is the build guide’s.',
      dynamic: 'Nothing here is a customer-facing setting. What a business can change is the ' +
        'tenant guide’s subject and the plan’s register.',
      glossary: 'Written for somebody who administers a server, and measured the same way as ' +
        'every other document — a technical word it uses still has to be explained where it is ' +
        'used.',
    },
  },
];

/* ── run ─────────────────────────────────────────────────────────────────── */
const summary = process.argv.includes('--summary');
const registerKeys = Object.keys(REG.REGISTERS);
let failures = 0;
const rows = [];

for (const d of DOCS) {
  const file = path.join(ROOT, d.file);
  if (!fs.existsSync(file)) {
    console.error(`checkcoverage: ${d.file} not found — generate it first`);
    failures++;
    continue;
  }

  /* A register with no decision recorded is the failure this file exists to catch. */
  const undecided = registerKeys.filter((k) => !(k in d.decide));
  if (undecided.length) {
    console.error(`checkcoverage: ${d.file} has no decision for: ${undecided.join(', ')}`);
    console.error('  Every register is either carried in full or skipped for a written reason. ' +
      'A register nobody decided about is how four documents shipped empty.');
    failures++;
  }
  const unknown = Object.keys(d.decide).filter((k) => !registerKeys.includes(k));
  if (unknown.length) {
    console.error(`checkcoverage: ${d.file} decides about registers that do not exist: ${unknown.join(', ')}`);
    failures++;
  }

  const doc = fs.readFileSync(file, 'utf8');
  const report = REG.audit(doc, { glossary: { skip: TRADE_WORDS[d.file] || [] } });

  for (const key of registerKeys) {
    const r = report[key];
    const decision = d.decide[key];
    const carried = r.total - r.missing.length;

    if (decision === 'full') {
      if (r.missing.length || r.extra.length) {
        failures++;
        console.error(`\ncheckcoverage: ${d.file} declares ${r.label} in FULL and is short.`);
        if (r.missing.length) {
          console.error(`  ${r.missing.length} of ${r.total} absent: ` +
            r.missing.slice(0, 8).join(' · ') + (r.missing.length > 8 ? ' …' : ''));
        }
        if (r.extra.length) {
          console.error(`  ${r.extra.length} incomplete: ` +
            r.extra.slice(0, 6).join(' · ') + (r.extra.length > 6 ? ' …' : ''));
        }
      }
      rows.push([d.file, r.label, `${carried}/${r.total}`, 'full']);
    } else if (typeof decision === 'string' && decision.trim().length >= 60) {
      /* A skip needs a reason a person could argue with. "N/A" is not one, and a short
         reason is how a real omission gets waved through. */
      rows.push([d.file, r.label, `${carried}/${r.total}`, 'reasoned skip']);
    } else if (decision !== undefined) {
      failures++;
      console.error(`\ncheckcoverage: ${d.file} skips ${r.label} without a real reason.`);
      console.error('  A skip is a decision, and a decision needs a sentence somebody can ' +
        'disagree with — not a word.');
    }

    /* THE ONE THING A SKIP NEVER EXCUSES.
       The glossary is measured in the other direction: not "does this document carry all 39
       words" but "does it explain every technical word it actually uses". No document is
       allowed to skip that, because using a word and never explaining it is a defect in the
       page whatever the page is for. */
    if (key === 'glossary' && decision !== 'full' && r.missing.length) {
      failures++;
      console.error(`\ncheckcoverage: ${d.file} uses ${r.missing.length} technical term(s) it ` +
        `never explains: ${r.missing.join(', ')}`);
      console.error('  This is the one check a skip does not excuse. Explain it where it is ' +
        'first used, or reword it if the everyday meaning was intended.');
    }
  }
}

if (summary && !failures) {
  const w = [0, 0, 0, 0];
  rows.forEach((r) => r.forEach((c, i) => { w[i] = Math.max(w[i], String(c).length); }));
  let last = '';
  for (const r of rows) {
    if (r[0] !== last) { console.log(''); last = r[0]; }
    const doc = r[0] === last && rows.filter((x) => x[0] === r[0])[0] === r ? r[0] : '';
    console.log(`  ${doc.padEnd(w[0])}  ${r[1].padEnd(w[1])}  ${String(r[2]).padStart(w[2])}  ${r[3]}`);
  }
  console.log('');
}

if (failures) {
  console.error(`\ncheckcoverage: ${failures} problem(s). ` +
    `${DOCS.length} documents × ${registerKeys.length} registers.`);
  process.exit(1);
}
console.log(`checkcoverage: all valid — ${DOCS.length} documents × ${registerKeys.length} ` +
  `registers, every pair decided and every "full" verified`);
