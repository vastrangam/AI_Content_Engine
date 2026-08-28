'use strict';
/* Put the rulebook into PLAN_OF_ACTION.md — and nothing else into it.

   THE CONSTRAINT THAT SHAPED THIS FILE
   PLAN_OF_ACTION.md is hand-written and has been edited by its owner. A
   generator that rewrote whole sections would quietly undo that work, and the
   loss would only be noticed later, by which time the wording is gone. So this
   writes ONLY between markers:

     <!-- RULES:12 -->   … replaced every run …   <!-- /RULES:12 -->

   Everything outside a marker pair is copied through byte for byte. If a
   module has no markers yet, they are inserted once, immediately before that
   module's "Reads ←" line, and from then on only the inside is touched. A
   module section that has been restructured so that anchor is gone is
   reported and skipped rather than guessed at — a generator that gambles on
   where to write is worse than one that says it could not tell.

   Run:
     node brand/site/mkrules.js            write
     node brand/site/mkrules.js --check    fail if writing would change anything
                                           (used to prove the run is idempotent)
*/

const fs = require('node:fs');
const path = require('node:path');

const D = __dirname;
const REPO = path.resolve(D, '..', '..');
const PLAN = path.join(REPO, 'PLAN_OF_ACTION.md');

const MODULES = require('./modules.js');
const RULES = require('./rules.js');
const { run: checkRules } = require('./checkrules.js');

const open = (n) => `<!-- RULES:${n} -->`;
const close = (n) => `<!-- /RULES:${n} -->`;

/* a pipe inside a table cell would split the column */
const cell = (s) => String(s).replace(/\|/g, '\\|').trim();

function block(n) {
  const mine = RULES.filter((r) => r.mod === n);
  if (!mine.length) return '';
  const enforced = mine.filter((r) => r.state === 'ENFORCED').length;

  const lines = [];
  lines.push(`**The rulebook — ${mine.length} rules, ${enforced} enforced by a test that runs today**`);
  lines.push('');
  lines.push('| # | The rule | When | Then | Never | State |');
  lines.push('|---|---|---|---|---|---|');
  mine.forEach((r) => {
    /* No <br/> here. report_pdf.py escapes HTML, so a tag in a cell prints as
       a literal tag in the reader's PDF — which is exactly what it did the
       first time this ran. A separator survives every renderer. */
    const state = r.state === 'ENFORCED'
      ? `**ENFORCED** · ${cell(r.by.replace(/›/g, '·'))}`
      : 'SPECIFIED';
    lines.push(`| ${r.id} | **${cell(r.title)}** | ${cell(r.when)} | ${cell(r.then)} | ${cell(r.never)} | ${state} |`);
  });
  return lines.join('\n');
}

/* The whole rulebook at a glance, for the front of Part II. */
function index() {
  const lines = [];
  const total = RULES.length;
  const enforced = RULES.filter((r) => r.state === 'ENFORCED').length;
  lines.push('## THE RULEBOOK AT A GLANCE');
  lines.push('');
  lines.push(`**${total} rules across ${MODULES.length} modules. ${enforced} of them are enforced by a test that runs`);
  lines.push('today; the rest are specified.** Every rule states what happens, and what the system will');
  lines.push('*not* do instead — because the refusal is the half a business can actually rely on. A rule');
  lines.push('marked ENFORCED names the file and the test that proves it, and `brand/site/checkrules.js`');
  lines.push('fails if that test cannot be found, so a rule here cannot claim a proof it does not have.');
  lines.push('');
  lines.push('The specified ones are not filler — they are the build queue, in the order the modules are');
  lines.push('built. That is the number to watch: it is meant to fall, build by build, and it can be');
  lines.push('counted rather than claimed.');
  lines.push('');
  lines.push('| Module | Rules | Enforced | Specified |');
  lines.push('|---|---|---|---|');
  MODULES.forEach((m) => {
    const mine = RULES.filter((r) => r.mod === m.n);
    const e = mine.filter((r) => r.state === 'ENFORCED').length;
    lines.push(`| ${m.n} · ${cell(m.name)} | ${mine.length} | ${e} | ${mine.length - e} |`);
  });
  lines.push(`| **Total** | **${total}** | **${enforced}** | **${total - enforced}** |`);
  return lines.join('\n');
}

/* The module map in A3. It was hand-typed and had already drifted twice — once
   to 98 apps, once to 104 — so it is generated now. The build-state counts come
   from the same two lists build.js uses, kept here rather than imported because
   build.js is a script that renders on load. */
const BUILT = new Set([
  'CEO Dashboard', 'Report Builder', 'Group Consolidation',
  'CRM & Customer 360', 'Documents & eSign', 'Helpdesk & Live Chat',
  'D2C Sales', 'B2B & Credit', 'Export', 'POS', 'Quotes & Proforma',
  'Marketplace OMS', 'Order Management',
  'Procurement', 'Vendor Management',
  'Ask & Print',
]);
const ENGINE = new Set(['Provider Router & Cost Guard', 'Motion Renderer']);

function moduleMap() {
  const lines = [];
  lines.push('| # | Module | Apps | Built | Engine | To build |');
  lines.push('|---|---|---|---|---|---|');
  let ta = 0, tb = 0, te = 0;
  MODULES.forEach((m) => {
    const b = m.apps.filter((a) => BUILT.has(a[0])).length;
    const e = m.apps.filter((a) => ENGINE.has(a[0])).length;
    ta += m.apps.length; tb += b; te += e;
    lines.push(`| ${m.n} | ${cell(m.name)} | ${m.apps.length} | ${b} | ${e} | ${m.apps.length - b - e} |`);
  });
  lines.push(`| | **Total** | **${ta}** | **${tb}** | **${te}** | **${ta - tb - te}** |`);
  return lines.join('\n');
}

/* ---- writing ---------------------------------------------------------- */

function inject(src) {
  const problems = [];
  let out = src;

  MODULES.forEach((m) => {
    const body = block(m.n);
    if (!body) return;
    const o = open(m.n), c = close(m.n);
    const wrapped = `${o}\n\n${body}\n\n${c}`;

    const oi = out.indexOf(o);
    if (oi >= 0) {
      const ci = out.indexOf(c, oi);
      if (ci < 0) { problems.push(`Module ${m.n}: opening marker with no closing marker`); return; }
      out = out.slice(0, oi) + wrapped + out.slice(ci + c.length);
      return;
    }

    /* first time for this module — anchor the markers just above "Reads ←",
       which every module section carries */
    const head = new RegExp(`^# MODULE ${m.n} · `, 'm');
    const hm = head.exec(out);
    if (!hm) { problems.push(`Module ${m.n}: no "# MODULE ${m.n} · " heading found`); return; }
    const nextHead = out.indexOf('\n# MODULE ', hm.index + 1);
    const end = nextHead < 0 ? out.length : nextHead;
    const section = out.slice(hm.index, end);
    const anchor = /\*\*Reads\*\* ←/.exec(section);
    if (!anchor) { problems.push(`Module ${m.n}: no "**Reads** ←" line to anchor to`); return; }
    const at = hm.index + anchor.index;
    out = out.slice(0, at) + wrapped + '\n\n' + out.slice(at);
  });

  /* the A3 module map, replaced in place */
  {
    const mo = '<!-- MODULEMAP -->', mc = '<!-- /MODULEMAP -->';
    const wrappedMap = `${mo}\n\n${moduleMap()}\n\n${mc}`;
    const mi = out.indexOf(mo);
    if (mi >= 0) {
      const me = out.indexOf(mc, mi);
      out = out.slice(0, mi) + wrappedMap + out.slice(me + mc.length);
    } else {
      /* first run: swallow the hand-typed table that is already there */
      const tbl = /^\| # \| Module \| Apps \|[\s\S]*?^\| \| \*\*Total\*\*.*$/m.exec(out);
      if (!tbl) problems.push('no module-map table found in A3 to take over');
      else out = out.slice(0, tbl.index) + wrappedMap + out.slice(tbl.index + tbl[0].length);
    }
  }

  /* the index goes once, at the top of Part II */
  const idx = index();
  const io = '<!-- RULEINDEX -->', ic = '<!-- /RULEINDEX -->';
  const wrappedIdx = `${io}\n\n${idx}\n\n${ic}`;
  const ii = out.indexOf(io);
  if (ii >= 0) {
    const ie = out.indexOf(ic, ii);
    out = out.slice(0, ii) + wrappedIdx + out.slice(ie + ic.length);
  } else {
    const p2 = /^# PART II — THE 21 MODULES.*$/m.exec(out) || /^# PART II\b.*$/m.exec(out);
    if (!p2) problems.push('no "# PART II" heading to put the rule index under');
    else {
      const at = p2.index + p2[0].length;
      out = out.slice(0, at) + '\n\n' + wrappedIdx + out.slice(at);
    }
  }

  return { out, problems };
}

function main() {
  const bad = checkRules();
  if (bad.length) {
    console.error('mkrules: refusing to write — checkrules found problems:\n');
    bad.forEach((p) => console.error('  ' + p));
    process.exit(1);
  }

  /* THE DOCUMENT THIS WRITES INTO BELONGS TO A TENANT.
     PLAN_OF_ACTION.md is the builder's plan in one trade's words; MEDHAVA_PLAN_OF_ACTION.md is
     the product's. On a product-only checkout the trade's plan is not present, and injecting the
     rulebook into a document that does not exist is not a failure — there is nothing to inject
     into. checkRules() above has already run, so the rulebook itself is still gated either way;
     what is skipped is only the injection, and it says so. */
  if (!fs.existsSync(PLAN)) {
    console.log(`mkrules: ${path.basename(PLAN)} is not present — injection SKIPPED, not passed.`);
    console.log('  That document is a tenant\'s plan. The rulebook itself was still checked above.');
    return;
  }

  const src = fs.readFileSync(PLAN, 'utf8');
  const { out, problems } = inject(src);
  if (problems.length) {
    console.error('mkrules: could not place every block:\n');
    problems.forEach((p) => console.error('  ' + p));
    process.exit(1);
  }

  const checkOnly = process.argv.includes('--check');
  if (checkOnly) {
    if (out !== src) {
      console.error('mkrules --check: the file would change — run mkrules.js and commit the result');
      process.exit(1);
    }
    console.log('mkrules --check: PLAN_OF_ACTION.md is up to date');
    return;
  }

  fs.writeFileSync(PLAN, out);
  const total = RULES.length;
  const enforced = RULES.filter((r) => r.state === 'ENFORCED').length;
  console.log(`PLAN_OF_ACTION.md: ${total} rules injected across ${MODULES.length} modules ` +
    `(${enforced} enforced, ${total - enforced} specified)`);
}

if (require.main === module) main();
module.exports = { block, index, inject };
