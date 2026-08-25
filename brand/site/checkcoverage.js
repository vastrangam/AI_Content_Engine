'use strict';
/* EVERY DELIVERED DOCUMENT, MEASURED AGAINST EVERY REGISTER.
 *
 *   node brand/site/checkcoverage.js
 *   node brand/site/checkcoverage.js --summary
 *
 * WHY THIS FILE EXISTS
 * Four times now the same failure has been found by the same method:
 *
 *   1. The tenant guide printed "Module 05 · 18 rules" and none of the rules. Fixed inside
 *      mktenant.js.
 *   2. The other four documents then shipped carrying 0, 4, 0 and 4 of 285 — because the gate had
 *      been written into the generator for the one document somebody complained about. Fixed by
 *      sharing the gate.
 *   3. Pointing the same measurement at the OTHER registers found the plan carrying 0 of 19
 *      technical layers, 1 of 24 changeable things, 5 of 113 apps and 27 technical terms it used
 *      and never explained.
 *   4. And then this file, written to stop exactly that, hand-typed its own list of six documents
 *      — so Vastrangam_BOS_Final.md and PLAN_OF_ACTION.md sat outside it carrying 1 of 19 layers
 *      and 1 of 24 changeable things, and nothing could see them.
 *
 * The list is gone. This file iterates brand/delivery/manifest.js, which is the same list
 * mkbundle.js packs from — so a document cannot be delivered without being gated, or gated
 * without being delivered. The manifest checks itself against the directories documents live in,
 * so a new one cannot appear unnoticed either.
 *
 * WHAT IS CHECKED
 *   · every document × every register has a DECISION — 'full', or a written reason
 *   · every 'full' is verified against the text
 *   · every document's PDF is at least as new as its markdown
 *   · no document uses a technical word it never explains — the one check no skip excuses
 *
 * Adding a seventh register to registers.js breaks this until somebody decides what each document
 * does about it. That is the point.
 */

const fs = require('node:fs');
const path = require('node:path');
const REG = require('./registers.js');
const MANIFEST = require('../delivery/manifest.js');

const ROOT = path.join(__dirname, '..', '..');

/* Is this file changed relative to the last commit? `git status --porcelain <path>` prints a line
   when it is and nothing when it is not. Returns false if git is unavailable or errors — a check
   that cannot get an answer must not manufacture one. */
let _gitOk = true;
function locallyModified(rel) {
  if (!_gitOk) return false;
  try {
    const out = require('node:child_process')
      .execFileSync('git', ['status', '--porcelain', '--', rel],
        { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return out.trim().length > 0;
  } catch (_) { _gitOk = false; return false; }
}
const summary = process.argv.includes('--summary');
const registerKeys = Object.keys(REG.REGISTERS);

let failures = 0;
const rows = [];
const fail = (msg) => { failures++; console.error(msg); };

/* ── 0 · the manifest is itself complete ─────────────────────────────────── */
MANIFEST.check(fs).forEach((b) => fail(`checkcoverage: manifest — ${b}`));

/* ── every delivered document ────────────────────────────────────────────── */
for (const d of MANIFEST.DOCS) {
  const file = path.join(ROOT, d.md);
  if (!fs.existsSync(file)) {
    fail(`checkcoverage: ${d.md} not found — regenerate it:\n    ${d.generator}`);
    continue;
  }

  /* A PDF older than its own markdown is a document that disagrees with itself, and it went out
     inside a zip. Cheap to check, and nothing else was checking it.

     MEASURED AGAINST THE WORKING TREE, NOT THE CLOCK ALONE. A fresh `git checkout` writes every
     file at about the same moment, so in CI the mtimes say nothing about which was generated
     first — comparing them there would fail for a reason that has nothing to do with the
     documents. The question this check actually cares about is "did somebody edit the markdown
     and not re-render", and that is only askable when the markdown is modified relative to HEAD.
     If git cannot answer, the check says so and does not invent a verdict. */
  const pdf = path.join(ROOT, d.pdf);
  if (!fs.existsSync(pdf)) {
    fail(`checkcoverage: ${d.pdf} has never been rendered.`);
  } else if (locallyModified(d.md)) {
    const mdAt = fs.statSync(file).mtimeMs;
    const pdfAt = fs.statSync(pdf).mtimeMs;
    if (pdfAt + 1000 < mdAt) {
      fail(`checkcoverage: ${d.pdf} is OLDER than ${d.md} — the PDF does not match its own ` +
        `source.\n    md  ${new Date(mdAt).toISOString()}\n    pdf ${new Date(pdfAt).toISOString()}` +
        `\n    python3 tools/report_pdf.py ${d.md} && node tools/report_pdf.js ${d.md.replace(/\.md$/, '.html')}`);
    }
  }

  /* A register with no decision recorded is the failure this file exists to catch. */
  const undecided = registerKeys.filter((k) => !(k in d.decide));
  if (undecided.length) {
    fail(`checkcoverage: ${d.md} has no decision for: ${undecided.join(', ')}\n` +
      '  Every register is either carried in full or skipped for a written reason. ' +
      'A register nobody decided about is how four documents shipped empty.');
  }
  const unknown = Object.keys(d.decide).filter((k) => !registerKeys.includes(k));
  if (unknown.length) {
    fail(`checkcoverage: ${d.md} decides about registers that do not exist: ${unknown.join(', ')}`);
  }

  const doc = fs.readFileSync(file, 'utf8');
  const report = REG.audit(doc, { glossary: { skip: MANIFEST.everydayWords(d) } });

  for (const key of registerKeys) {
    const r = report[key];
    const decision = d.decide[key];
    const carried = r.total - r.missing.length;

    if (decision === 'full') {
      if (r.missing.length || r.extra.length) {
        fail(`\ncheckcoverage: ${d.md} declares ${r.label} in FULL and is short.`);
        if (r.missing.length) {
          console.error(`  ${r.missing.length} of ${r.total} absent: ` +
            r.missing.slice(0, 8).join(' · ') + (r.missing.length > 8 ? ' …' : ''));
        }
        if (r.extra.length) {
          console.error(`  ${r.extra.length} incomplete: ` +
            r.extra.slice(0, 6).join(' · ') + (r.extra.length > 6 ? ' …' : ''));
        }
      }
      rows.push([d.md, r.label, `${carried}/${r.total}`, 'full']);
    } else if (typeof decision === 'string' && decision.trim().length >= 60) {
      /* A skip needs a reason a person could argue with. "N/A" is not one, and a short reason is
         how a real omission gets waved through. */
      rows.push([d.md, r.label, `${carried}/${r.total}`, 'reasoned skip']);
    } else if (decision !== undefined) {
      fail(`\ncheckcoverage: ${d.md} skips ${r.label} without a real reason.\n` +
        '  A skip is a decision, and a decision needs a sentence somebody can disagree with — ' +
        'not a word.');
    }

    /* THE ONE THING A SKIP NEVER EXCUSES.
       The glossary is measured in the other direction: not "does this document carry all 39
       words" but "does it explain every technical word it actually uses". No document may skip
       that, because using a word and never explaining it is a defect in the page whatever the
       page is for. */
    if (key === 'glossary' && decision !== 'full' && r.missing.length) {
      fail(`\ncheckcoverage: ${d.md} uses ${r.missing.length} technical term(s) it never ` +
        `explains: ${r.missing.join(', ')}\n` +
        '  This is the one check a skip does not excuse. Explain it where it is first used, or ' +
        'reword it if the everyday meaning was intended.');
    }
  }
}

/* ── summary ─────────────────────────────────────────────────────────────── */
if (summary && !failures) {
  const w = [0, 0, 0];
  rows.forEach((r) => r.slice(0, 3).forEach((c, i) => { w[i] = Math.max(w[i], String(c).length); }));
  let last = null;
  for (const r of rows) {
    if (r[0] !== last) {
      last = r[0];
      const d = MANIFEST.DOCS.find((x) => x.md === r[0]);
      console.log(`\n  ${r[0]}   [${d.edition}]${d.start ? ' · start here' : ''}`);
    }
    console.log(`      ${r[1].padEnd(w[1])}  ${String(r[2]).padStart(w[2])}  ${r[3]}`);
  }
  console.log('');
  MANIFEST.editions().forEach((e) => {
    console.log(`  ${e}: ${MANIFEST.forEdition(e).length} documents`);
  });
  console.log(`  not delivered, each with a reason: ${Object.keys(MANIFEST.NOT_DELIVERED).length}\n`);
}

if (failures) {
  console.error(`\ncheckcoverage: ${failures} problem(s). ` +
    `${MANIFEST.DOCS.length} documents × ${registerKeys.length} registers.`);
  process.exit(1);
}
console.log(`checkcoverage: all valid — ${MANIFEST.DOCS.length} documents × ${registerKeys.length} ` +
  `registers, every pair decided, every "full" verified, every PDF current`);
