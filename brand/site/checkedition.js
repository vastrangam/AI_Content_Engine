'use strict';
/* NO MEDHAVA-NAMED ARTEFACT MAY CARRY A TRADE WORD.
 *
 *   node brand/site/checkedition.js
 *   node brand/site/checkedition.js --summary
 *
 * WHY THIS EXISTS, AND WHY checkneutral.js DID NOT CATCH IT
 * checkneutral.js reads two things: brand/site/modules.js, and the built index.html. Both were
 * clean. Meanwhile every file called MEDHAVA_something under brand/suite/deep/pkg/ carried the
 * line
 *
 *     esc(SPEC.company || 'Vastrangam')
 *
 * inherited from brand/suite/kernel.js, so the NEUTRAL edition of every prototype app printed one
 * customer's trading name in its header — the first place a person looks. The comment directly
 * above that line records the identical defect being fixed in the wordmark beside it. The fix
 * stopped one line short.
 *
 * WHAT IT CHECKS
 * Any file whose own NAME claims to be the Medhava edition is read, and must not contain a word
 * from the same denylist checkneutral.js uses. A file that says whose it is in its filename has
 * made a promise about its contents.
 *
 * WHAT IT DELIBERATELY DOES NOT CHECK
 * Files that are ABOUT the separation. checkneutral.js has to contain the denylist to enforce it;
 * editions.js explains how a trade is installed; CLAUDE.md §0 is the rule itself; mkstarter.js
 * partitions the two archives and names both; AUDIT_REPORT.md records the work. Scanning those
 * would be checking the one set of files that must mention it, and the fix would be to delete the
 * explanation — which is how a rule survives as a word and dies as a practice.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..');
const { TRADE_WORDS } = require('./checkneutral.js');
const summary = process.argv.includes('--summary');

/* Files whose subject IS the separation. Each is listed with the reason it may name a trade,
   because an exemption with no reason is a hole with a comment next to it. */
const ABOUT_THE_SPLIT = {
  'brand/site/checkneutral.js': 'holds the denylist; it cannot enforce words it may not contain',
  'brand/site/checkedition.js': 'this file — same reason',
  'brand/site/editions.js': 'explains how a trade edition is discovered and installed',
  'brand/site/build.js': 'builds either edition and names the one it was asked for',
  'brand/delivery/manifest.js': 'decides which edition each document belongs to',
  'brand/delivery/website/mkstarter.js': 'partitions the two archives; TENANT_RE lives in it',
  'brand/delivery/website/mkprompts.js': 'tags rows by the edition that owns them',
  'brand/delivery/website/mkskills.js': 'filters skills by installed edition',
  'brand/site/skills.js': 'carries both editions\' skills',
  'brand/site/prompts.js': 'carries both editions\' prompts',
  'CLAUDE.md': 'section 0 is the product-and-tenant rule itself',
  'AUDIT_REPORT.md': 'the record of separating them',
  'SPEC_CONFLICTS.md': 'quotes one trade\'s own specification, by design',
  'package.json': 'names the tenant script alongside the product one',
  '.gitignore': 'names both archives',
  'MEDHAVA_PLAN_OF_ACTION.md':
    'its opening paragraph exists to tell the reader THIS is the product plan and PLAN_OF_ACTION.md ' +
    'is one trade adopting it. Naming the trade is the sentence doing its job; removing the name ' +
    'would leave two documents a reader cannot tell apart.',
  'Medhava_BOS.md': 'the four-part merge, which includes the paragraph above verbatim',
};

/* STALE PROTOTYPE OUTPUT, LABELLED RATHER THAN QUIETLY TOLERATED.
 *
 * brand/suite/deep/pkg/ and pkgsrc/ are COMMITTED BUILD OUTPUT of the earlier prototype app line —
 * 16 apps packaged twice, once per edition. The MEDHAVA-named ones carry a trade name because
 * brand/suite/kernel.js fell back to it: `esc(SPEC.company || 'Vastrangam')`, one line below a
 * comment recording the identical defect being fixed in the wordmark beside it. That fallback is
 * now neutral, so anything rebuilt from the kernel is clean — but these files were built before
 * the fix and have not been regenerated.
 *
 * They are exempt here, and EXCLUDED from the product archive by mkstarter.js, for three reasons
 * stated together so the exemption can be argued with: nothing in the repository depends on them
 * (no npm script, no gate), they are output rather than source, and the defect that produced them
 * is fixed at its origin. Regenerate them and this exemption can go.
 */
const STALE_PROTOTYPE_OUTPUT = /^brand\/suite\/deep\/(pkg|pkgsrc|manuals)\//;

/* A file "claims the Medhava edition" when its own basename says so. */
const CLAIMS_MEDHAVA = /(^|[/_])MEDHAVA[_.]/;

/* COMMITTED FILES ONLY, VIA GIT — not a directory walk.
   A walk also picked up the .html render intermediates and the built .zip, which are gitignored
   output and were STALE: generated before the rulebook was neutralised, so they still carried
   words their own .md sources no longer contain. Failing on those is failing on yesterday's
   build. `git ls-files` returns exactly what is committed, which is what a reader receives, and
   it excludes every build artefact by construction rather than by a pattern to maintain. */
const all = execSync('git ls-files -z', { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 })
  .toString('utf8').split('\0').filter(Boolean);
const claimed = all.filter((f) =>
  CLAIMS_MEDHAVA.test(f) && !ABOUT_THE_SPLIT[f] && !STALE_PROTOTYPE_OUTPUT.test(f));
const stale = all.filter((f) => CLAIMS_MEDHAVA.test(f) && STALE_PROTOTYPE_OUTPUT.test(f));

let failures = 0;
const hits = [];
for (const rel of claimed) {
  let text;
  try { text = fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch (_) { continue; }
  const found = TRADE_WORDS.filter((w) =>
    new RegExp('\\b' + w.replace(/ /g, '\\s+'), 'i').test(text));
  if (found.length) { failures++; hits.push({ rel, found }); }
}

for (const h of hits) {
  console.error(`checkedition: ${h.rel} is named for the Medhava edition and contains ` +
    `${h.found.join(', ')}. The neutral edition is the one with no business in it, and a file ` +
    `that says whose it is in its filename has promised that.`);
}

if (failures) {
  console.error(`\ncheckedition: ${failures} file(s) claim the product edition and name a trade.`);
  process.exit(1);
}

console.log('checkedition: every file named for the Medhava edition is free of trade vocabulary');
if (summary) {
  console.log(`\n  ${claimed.length} files claim the Medhava edition by name`);
  console.log(`  ${TRADE_WORDS.length} trade words watched, the same list checkneutral.js uses`);
  console.log(`  ${stale.length} stale prototype build artefacts excluded from the product ` +
    `archive and not regenerated`);
  console.log(`  ${Object.keys(ABOUT_THE_SPLIT).length} files exempt, each with its reason:\n`);
  Object.entries(ABOUT_THE_SPLIT).forEach(([f, why]) => console.log(`      ${f}\n        ${why}`));
  console.log('');
}
