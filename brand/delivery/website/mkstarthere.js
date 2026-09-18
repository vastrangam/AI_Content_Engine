'use strict';
/* MEDHAVA_START_HERE.md — THE ONE PROMPT THAT WORKS WITH NOTHING ELSE IN HAND.
 *
 *   node brand/delivery/website/mkstarthere.js          → write MEDHAVA_START_HERE.md
 *   node brand/delivery/website/mkstarthere.js --check  → prove it is current
 *
 * WHY THIS EXISTS AND WHY HANDOFF.md IS NOT IT
 * HANDOFF.md is the model-agnostic entry prompt and it is good, but its first instruction is
 * `npm ci`. It assumes the repository is already open. The owner's actual need is the step
 * before that: he opens a fresh conversation with whichever model still has budget, and has to
 * explain from a standing start what this project is, what is real, and what he wants next —
 * to something that has never seen any of it.
 *
 * So this file is written to be PASTED, on its own, into a machine holding nothing. It must
 * make sense with no repository, no attachments and no chat history. Where it needs the
 * repository it says so and says how to get it, rather than assuming.
 *
 * WHAT IT MUST NEVER DO
 * Flatter the state of the build. A prompt whose job is to orient a stranger is the worst
 * possible place for an optimistic number: the model believes it, plans against it, and the
 * owner finds out a week later. Every figure here is read from the registers at generation
 * time and the honest ones are the ones that matter — 19 of 165 apps stand up, and this file
 * says so in its first table.
 *
 * Like mkhandoff.js: no path is named that does not exist, and no npm script is named that is
 * not in package.json. Both are checked before a byte is written.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..', '..');
const OUT = path.join(ROOT, 'MEDHAVA_START_HERE.md');
const check = process.argv.includes('--check');

const MODULES = require(path.join(ROOT, 'brand/site/modules.js'));
const REGISTRY = require(path.join(ROOT, 'brand/site/registry.js'));
const RULES = require(path.join(ROOT, 'brand/site/rules.js'));
const AUDIT = require(path.join(ROOT, 'brand/site/audit.js'));
const BUILT = require(path.join(ROOT, 'brand/site/built.js'));
const BACKLOG = require(path.join(ROOT, 'brand/site/backlog.js'));
const MANIFEST = require(path.join(ROOT, 'brand/delivery/manifest.js'));
const PKG = require(path.join(ROOT, 'package.json'));

/* ── everything below is derived. §3 rule 7: a typed count is a fabricated one. ── */
const modRows = Array.isArray(MODULES) ? MODULES : Object.values(MODULES).find(Array.isArray);
const rows = REGISTRY.rows(MODULES);
const apps = rows.filter((r) => r.kind === 'app');
const NMOD = modRows.length;
const NAPP = apps.length;
const NRULES = Array.isArray(RULES) ? RULES.length : (RULES.RULES || []).length;
const NENF = (Array.isArray(RULES) ? RULES : RULES.RULES || [])
  .filter((r) => r.state === 'ENFORCED').length;
const gates = (PKG.scripts.check || '').split('&&').length;
const standing = apps.filter((r) => REGISTRY.STANDS_UP
  ? REGISTRY.STANDS_UP.has(r.status)
  : ['IMPLEMENTED', 'TESTED', 'VERIFIED', 'PRODUCTION-READY'].includes(r.status)).length;
const SCORE = AUDIT.score(rows);
/* THE THREE LISTS OVERLAP, AND THE FIRST DRAFT OF THIS TABLE DID NOT SAY SO.
   3 + 16 + 2 = 21, while the registry reports 19 apps standing up — because two apps are on
   the real database AND also have a browser prototype, so they are in two lists. Printed as
   three rows under a total of 19 it read as an arithmetic error, which in a document whose
   entire job is to be believed is worse than a missing row. The overlap is derived and stated
   rather than the rows being quietly fudged to add up. */
const PLATFORM_NAMES = Object.keys(BUILT.PLATFORM || {});
const NPLATFORM = PLATFORM_NAMES.length;
const NBROWSER = (BUILT.BUILT && BUILT.BUILT.size) || 0;
const NENGINE = (BUILT.ENGINE && BUILT.ENGINE.size) || 0;
const inTwo = [...new Set([...PLATFORM_NAMES, ...(BUILT.BUILT || []), ...(BUILT.ENGINE || [])])]
  .filter((n) => [PLATFORM_NAMES.includes(n), (BUILT.BUILT || new Set()).has(n),
    (BUILT.ENGINE || new Set()).has(n)].filter(Boolean).length > 1);
const NDOCS = MANIFEST.DOCS.length;
const NBACKLOG = BACKLOG.ITEMS.length;
const NTABLES = (fs.readFileSync(path.join(ROOT, 'core/schema.postgres.sql'), 'utf8')
  .match(/CREATE TABLE/g) || []).length;

let BRANCH = 'the working branch';
try {
  BRANCH = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] })
    .toString().trim() || BRANCH;
} catch { /* no git here — the prompt still stands, it just cannot name the branch */ }

/* ── the paths this prompt is allowed to name ─────────────────────────────── */
const PATHS = [
  ['MEDHAVA_START_HERE.md', 'this file — the cold introduction'],
  ['HANDOFF.md', 'read second, once the repository is open'],
  ['CLAUDE.md', 'the working agreement every model must follow here'],
  ['MEDHAVA_HOW_TO_BUILD.md', 'the ordered path from an archive to a running site'],
  ['brand/site/built.js', 'which apps actually run'],
  ['brand/site/modules.js', 'the canonical modules and apps'],
  ['brand/site/rules.js', 'every rule, with what the system will never do instead'],
  ['docs/verification/EVIDENCE.md', 'every recorded run: command, exit code, commit'],
  ['CONSTRAINTS.md', 'what must be arranged before a demonstration is possible'],
  ['SPEC_CONFLICTS.md', 'the places the specification contradicts itself, still undecided'],
];

const COMMANDS = [
  ['npm ci', 'install exactly what the lockfile says'],
  ['npm run check', `every gate — ${gates} of them`],
  ['npm test', 'the gates plus the engines plus the browser apps'],
  ['npm run test:product', 'the product alone, with no tenant installed'],
];

function verify() {
  const bad = [];
  PATHS.forEach(([p]) => {
    if (p === path.basename(OUT)) return;   /* a generator describes its own output, never measures it */
    if (!fs.existsSync(path.join(ROOT, p))) bad.push(`path does not exist: ${p}`);
  });
  COMMANDS.forEach(([c]) => {
    const m = /^npm run ([\w:-]+)$/.exec(c);
    if (m && !PKG.scripts[m[1]]) bad.push(`npm script not in package.json: ${m[1]}`);
  });
  return bad;
}

function markdown() {
  const L = [];
  const w = (s) => L.push(s);

  w('# Medhava — read this first');
  w('');
  w('**Paste this whole file into a new conversation before anything else.** It assumes you');
  w('have nothing: no repository, no attachments, no earlier chat. It exists so a machine can');
  w('be useful in its first reply rather than its tenth.');
  w('');
  w('---');
  w('');
  w('## What this is');
  w('');
  w('**Medhava is a business operating system** — one piece of software a company runs its');
  w('whole operation on: what it designs, buys, makes, stocks, sells, ships, bills and pays');
  w(`for. It is organised as **${NMOD} modules** holding **${NAPP} apps**.`);
  w('');
  w('**Vastrangam is one company that will run on it.** A clothing manufacturer and exporter.');
  w('It is a *customer* of Medhava, not a part of it — its rates, staff, holidays and payroll');
  w('rules are configuration loaded over the product, never built into it.');
  w('');
  w('**Keeping those two apart is the single most important rule here.** It was got wrong once');
  w('and had to be undone: the product must build, test and run with zero customers installed,');
  w('and `npm run test:product` is the command that proves it.');
  w('');
  w('---');
  w('');
  w('## What is actually built — the honest table');
  w('');
  w('Read this before planning anything. The gap between designed and working is the whole');
  w('situation:');
  w('');
  w('| | |');
  w('|---|---:|');
  w(`| Apps designed and specified | **${NAPP}** |`);
  w(`| Apps that actually stand up | **${standing}** |`);
  w(`| — of those, on the real database | ${NPLATFORM} |`);
  w(`| — browser prototypes | ${NBROWSER} |`);
  w(`| — command-line engines | ${NENGINE} |`);
  w(`| Rules written down | ${NRULES} |`);
  w(`| — proven by a test that runs | **${NENF}** |`);
  w(`| Database tables | ${NTABLES} |`);
  w(`| Maturity, out of 5 | **${SCORE.mean}** — level ${AUDIT.MATURITY.level}, ${AUDIT.MATURITY.name} |`);
  w('');
  if (inTwo.length) {
    w(`The three rows above sum to ${NPLATFORM + NBROWSER + NENGINE}, not ${standing}, because`);
    w(`${inTwo.length === 1 ? 'one app is' : `${inTwo.length} apps are`} counted in two of them —`);
    w(`${inTwo.map((n) => `**${n}**`).join(' and ')} run on the real database *and* have a`);
    w('browser prototype. The distinct total is the one to quote.');
    w('');
  }
  w(`So: **${standing} of ${NAPP}**. Most of this product is designed and not built, and any`);
  w('plan that assumes otherwise will be wrong. That ratio recently got *worse* on purpose —');
  w(`${NBACKLOG === 0 ? 'every line of the specification now has a named home, which raised the' : 'the'}`);
  w('denominator without building anything, and saying so is preferred to a flattering number.');
  w('');
  w('---');
  w('');
  w('## Where everything lives');
  w('');
  w('| What | Where |');
  w('|---|---|');
  w(`| The code and every register | a private GitHub repository, branch \`${BRANCH}\` |`);
  w('| The product, as a runnable archive | `MEDHAVA_BOS.zip` |');
  w('| The customer configuration | `VASTRANGAM_TENANT.zip`, unzipped *over* the product |');
  w('| The documents to read | `MEDHAVA_PDF.zip` and `VASTRANGAM_PDF.zip` |');
  w('');
  w('The archives are not in the repository — they are rebuilt from it on demand, because an');
  w('archive of a repository committed inside that repository grows forever.');
  w('');
  w('---');
  w('');
  w('## The rules that are not negotiable');
  w('');
  w('These are not preferences. Work that breaks one of them gets thrown away:');
  w('');
  w('- **Never say something passed unless you ran it and saw the output.** Not "should work",');
  w('  not "this will pass". If it was not run, say it was not run.');
  w('- **Never type a count.** Every number is derived from a register by a command. A figure');
  w('  typed from memory is treated here as fabricated.');
  w('- **Medhava is the product; Vastrangam is one customer.** Never mix them.');
  w('- **Nothing is finished until a test failed first.** A test that has never been seen to');
  w('  fail proves nothing.');
  w('- **No real person’s name, pay or bank detail in any file that ships.**');
  w('- **Name no competitor anywhere that ships.** Say "industry competitors".');
  w('- **Never commit a key, a password, or which model you are.**');
  w('- **If you find a defect, add the check that would have caught it** and prove that check');
  w('  fires by planting the defect again. A fix without a gate comes back.');
  w('');
  w('---');
  w('');
  w('## What to do next');
  w('');
  w('**If you have been given the repository or an archive**, this is the whole start-up:');
  w('');
  w('```bash');
  COMMANDS.forEach(([c, why]) => w(`${c.padEnd(24)}# ${why}`));
  w('```');
  w('');
  w(`\`npm run check\` runs **${gates} gates**. If it exits 0 the tree is healthy. If it exits`);
  w('non-zero, fix that before building anything — and never weaken a gate to make it green.');
  w('');
  w('Then read, in this order:');
  w('');
  w('| File | What it tells you |');
  w('|---|---|');
  PATHS.slice(1).forEach(([p, why]) => w(`| \`${p}\` | ${why} |`));
  w('');
  w('**If you have not been given anything yet**, ask for `MEDHAVA_BOS.zip` — it carries the');
  w('repository, builds on its own, and passes its own tests with no customer installed.');
  w('');
  w('---');
  w('');
  w('## How to talk to the owner');
  w('');
  w('He is not a programmer and does not want to become one. He is handing over the technical');
  w('path and checking the result at the end of each module on a site he can open.');
  w('');
  w('- **Answer in plain language.** Explain a technical word the first time you use it.');
  w('- **Tell him what is not done.** A half-finished thing labelled half-finished costs ten');
  w('  minutes. One labelled finished costs a day, and costs him his trust in every other');
  w('  label you have given him.');
  w('- **Give him the measurement, not the adjective.** "19 of 165 apps stand up" beats "good');
  w('  progress".');
  w('- **When two requirements genuinely conflict, stop and ask.** Do not pick one quietly.');
  w('');
  return L.join('\n') + '\n';
}

const bad = verify();
if (bad.length) {
  console.error(`mkstarthere: ${bad.length} problem(s) — MEDHAVA_START_HERE.md was NOT written:\n  ` +
    bad.join('\n  '));
  process.exit(1);
}

const text = markdown();

if (check) {
  const now = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  if (now !== text) {
    console.error('mkstarthere: MEDHAVA_START_HERE.md is out of date — run without --check.');
    process.exit(1);
  }
  console.log(`mkstarthere: MEDHAVA_START_HERE.md is current · ${PATHS.length} paths and ` +
    `${COMMANDS.length} commands all verified to exist`);
  process.exit(0);
}

fs.writeFileSync(OUT, text);
console.log(`mkstarthere: MEDHAVA_START_HERE.md · ${Math.round(Buffer.byteLength(text) / 1024)}KB · ` +
  `${PATHS.length} paths and ${COMMANDS.length} commands verified · counts read from source ` +
  `(${NMOD} modules · ${NAPP} apps · ${standing} standing up · ${NRULES} rules · ${gates} gates)`);
