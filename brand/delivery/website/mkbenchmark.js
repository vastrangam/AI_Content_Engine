'use strict';
/* WHERE THIS PRODUCT IS BEHIND, AND THE ORDER TO CLOSE IT IN.
 *
 *   node brand/delivery/website/mkbenchmark.js
 *   node brand/delivery/website/mkbenchmark.js --check
 *
 * Two documents from one register, because they answer two questions and a reader wants one
 * of them at a time:
 *
 *   BENCHMARK_GAPS.md   every parameter, where we stand, where they stand, and the gap.
 *                       A reference, read by dimension, not from the top.
 *   PARITY_PLAN.md      what to do about it, in order. Read from the top.
 *
 * EVERY FIGURE IS RESOLVED, NOT WRITTEN. Our rung on each parameter comes from registry.js
 * at generation time and the score and maturity come from audit.js, so these documents
 * cannot claim more than the gated registers allow — and when somebody builds module 08,
 * the next generation says so without anybody editing a sentence.
 *
 * THE ORDER IN PARITY_PLAN IS DEPTH-FIRST, AND THAT WAS A DECISION
 * The owner chose it against the alternative of breadth-first. It is also the defensible
 * one: 98 of 113 apps are already specified-and-unbuilt, so adding more app names would
 * pile shallow coverage on shallow coverage, and the coverage register already reports 30
 * areas named against only 11 with anything above SPECIFIED. The ordering here follows the
 * dependency graph in benchmark.js, which the gate checks points backwards.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');
const B = require(path.join(SITE, 'benchmark.js'));
const REGISTRY = require(path.join(SITE, 'registry.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const AUDIT = require(path.join(SITE, 'audit.js'));
const ZOHO = require(path.join(SITE, 'zoho.js'));
const RENDER = require(path.join(SITE, 'registers.js'));

const check = process.argv.includes('--check');

const ROWS = REGISTRY.rows(MODULES);
const BY_ID = new Map(ROWS.map((r) => [r.id, r]));
const SCORE = AUDIT.score(ROWS);

const LADDER = ['NOT STARTED', 'BLOCKED', 'SPECIFIED', 'DESIGNED', 'IMPLEMENTED', 'TESTED',
  'VERIFIED', 'PRODUCTION-READY'];
const rank = (s) => { const i = LADDER.indexOf(s); return i < 0 ? 0 : i; };

/* The same resolution the gate does. Kept here rather than imported because the gate's copy
   also reports failures; this one only needs the answer. Both read the same registry, and
   checkbenchmark.js fails the build if they could disagree about a row. */
function ours(row) {
  const m = row.measure || {};
  let rung = 'NOT STARTED';
  const from = [];
  (m.registry || []).forEach((id) => {
    const r = BY_ID.get(id);
    if (!r) return;
    from.push(`\`${id}\` ${r.status}`);
    if (rank(r.status) > rank(rung)) rung = r.status;
  });
  if (m.none) from.push(m.none);
  if (m.evidence) from.push(`recorded run \`${m.evidence}\``);
  return { rung, from };
}

const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

/* ── document 1 · the gaps ─────────────────────────────────────────────────── */
function gaps() {
  const L = [];
  const w = (s) => L.push(s);

  const behind = B.ROWS.filter((r) => r.verdict === 'BEHIND');
  const blocked = B.ROWS.filter((r) => r.close && r.close.blocker);
  const claims = B.ROWS.reduce((n, r) => n + (r.theirs || []).length, 0);

  w('# Where this product is behind');
  w('');
  w(`**${B.ROWS.length} parameters across ${B.DIMENSIONS.length} dimensions. ` +
    `${behind.length} are behind.** This is the list of what is missing, measured rather ` +
    'than felt.');
  w('');
  w('---');
  w('');
  w('## How to read this, and what it is worth');
  w('');
  w('| | |');
  w('|---|---:|');
  w(`| Parameters measured | ${B.ROWS.length} |`);
  w(`| Behind | **${behind.length}** |`);
  w(`| Nobody has compared | ${B.ROWS.filter((r) => r.verdict === 'UNMEASURED').length} |`);
  w(`| Ahead, on our own evidence | ${B.ROWS.filter((r) => r.verdict === 'AHEAD').length} |`);
  w(`| Cannot be closed by writing code | ${blocked.length} |`);
  w(`| Sourced claims about other products | ${claims} |`);
  w(`| Overall score, out of 5 | **${SCORE.mean}** |`);
  w(`| Maturity | **Level ${AUDIT.MATURITY.level} — ${AUDIT.MATURITY.name}** |`);
  w('');
  w('**The evidence on the two sides is not equally strong, and that is stated rather than');
  w('hidden.** Our side is resolved from the requirements registry at the moment this page');
  w('was generated — it cannot be typed and cannot flatter. The other side comes from **web');
  w(`searches run on ${B.FOUND_ON}**, each carrying the address it came from. That is`);
  w('thinner: a search result is not the vendor’s page, some of them are third-party review');
  w('sites, and any of it can be out of date. Where nothing was found, the parameter says');
  w('**UNMEASURED** instead of guessing.');
  w('');
  w('There are no estimated percentages anywhere in this document.');
  w('');

  /* the dimensions */
  w('---');
  w('');
  w('## The eleven dimensions');
  w('');
  w('| # | Dimension | Behind |');
  w('|---:|---|---:|');
  B.DIMENSIONS.forEach((d) => {
    const mine = B.ROWS.filter((r) => r.dim === d.id);
    const b = mine.filter((r) => r.verdict === 'BEHIND').length;
    w(`| ${d.n} | ${d.title} | ${b} of ${mine.length} |`);
  });
  w('');
  w('They are in that order on purpose. The ones that decide whether the software can be');
  w('*used* come before the ones that decide whether it *looks* complete on a comparison');
  w('table — an app list is cheap to lengthen and expensive to make true.');
  w('');

  B.DIMENSIONS.forEach((d) => {
    const mine = B.ROWS.filter((r) => r.dim === d.id);
    if (!mine.length) return;
    w('---');
    w('');
    w(`## ${d.n} · ${d.title}`);
    w('');
    w(d.why);
    w('');
    mine.forEach((r) => {
      const o = ours(r);
      w(`### ${r.parameter}`);
      w('');
      w(`**${r.verdict}** · our rung: **${o.rung}**` +
        (o.from.length ? ` · from ${o.from.join(', ')}` : ''));
      w('');
      w(r.gap);
      w('');
      if ((r.theirs || []).length) {
        w('| Product | What its pages say | Source |');
        w('|---|---|---|');
        /* THE ADDRESS, VISIBLE AS TEXT — not hidden behind the word "link".
           A markdown link renders as its label, so in the PDF every source read "link"
           with no address anywhere on the page. A sourced claim whose source a reader
           cannot see or type is not meaningfully sourced, and these documents are printed
           and read on paper more than they are clicked. */
        r.theirs.forEach((t) => {
          w(`| ${esc(t.product)} | ${esc(t.claim)} | ${esc(B.SOURCES[t.src])} |`);
        });
        w('');
        w(`*Found by search on ${B.FOUND_ON}. Not read from the page — see above.*`);
        w('');
      } else if (r.baseline) {
        w(`**Behind what:** ${r.baseline}`);
        w('');
      }
      if (r.close && r.close.blocker) {
        w(`**Cannot be closed by writing code.** ${r.close.blocker}`);
        w('');
      } else if (r.close && r.close.work) {
        w(`**What closes it** *(size ${r.close.size})* — ${r.close.work}`);
        w('');
      }
      if ((r.depends_on || []).length) {
        /* Named, not id'd. "Comes after P-DEPTH-DAY" means nothing to a reader who has not
           memorised the register's keys, and this document is a reference they arrive at
           from the middle. */
        const names = r.depends_on.map((id) => {
          const o = B.ROWS.find((x) => x.id === id);
          return o ? o.parameter : id;
        });
        w(`*Comes after: ${names.join(' · ')}*`);
        w('');
      }
    });
  });

  /* the coverage register, which answers a different question and is still worth carrying */
  w('---');
  w('');
  w('## And the coverage question, which is separate');
  w('');
  const cov = { COVERED: 0, 'NO APP': 0, 'OUT OF SCOPE': 0 };
  ZOHO.ROWS.forEach((r) => { cov[r.verdict] = (cov[r.verdict] || 0) + 1; });
  w(`The parameters above measure DEPTH. Coverage — whether an app is named for an area at`);
  w(`all — is a different question with its own register, and it answers:`);
  w('');
  w(`**${cov.COVERED} areas with an app named · ${cov['NO APP']} with none · ` +
    `${cov['OUT OF SCOPE']} deliberately out of scope.**`);
  w('');
  w('Those verdicts are answered entirely from our own register and need nobody else’s');
  w('page, which is why they survive intact. The areas with no app at all:');
  w('');
  ZOHO.ROWS.filter((r) => r.verdict === 'NO APP')
    .forEach((r) => w(`- ${r.name}`));
  w('');
  return L.join('\n');
}

/* ── document 2 · the plan ─────────────────────────────────────────────────── */
function plan() {
  const L = [];
  const w = (s) => L.push(s);

  /* THE ORDER IS THE DEPENDENCY GRAPH, NOT A PREFERENCE TYPED HERE. Rows come in register
     order, which the gate proves has every dependency pointing backwards — so working this
     list from the top can never reach an item whose prerequisite is still below it. */
  const work = B.ROWS.filter((r) => r.close && r.close.work);
  const blocked = B.ROWS.filter((r) => r.close && r.close.blocker);
  const done = B.ROWS.filter((r) => !r.close);

  /* A DEPENDENCY IS SHOWN AS A POSITION IN THIS LIST, OR AS THE BLOCKER IT REALLY IS.
     The first draft printed the register's own ids — "comes after P-DEPTH-DAY" — which a
     reader cannot map to a numbered row, and worse, some of those ids are rows that are
     BLOCKED and therefore not in this list at all. So the document promised "every
     prerequisite is above it" while item 6 waited on something that was nowhere. Both are
     fixed here: a prerequisite in the work list prints as its number, and one that is
     blocked prints as a blocker by name, which is the honest thing for a reader to see
     before they pick up the item and discover it. */
  const pos = new Map(work.map((r, i) => [r.id, i + 1]));
  const blockedIds = new Map(blocked.map((r) => [r.id, r]));
  const dep = (id) => (pos.has(id) ? `#${pos.get(id)}`
    : blockedIds.has(id) ? `**blocked:** ${blockedIds.get(id).parameter}`
      : id);
  const waitsOnBlocker = (r) => (r.depends_on || []).some((d) => blockedIds.has(d));

  w('# The plan to close the gaps');
  w('');
  w('Ordered so it can be worked from the top. Every prerequisite that is **work** sits');
  w('above the item that needs it — checked, not asserted: `checkbenchmark.js` fails the');
  w('build if a dependency points forwards.');
  w('');
  const waiting = work.filter(waitsOnBlocker);
  if (waiting.length) {
    w(`**${waiting.length} of these items do not wait on work at all — they wait on a`);
    w('blocker**, which is something only the owner can supply. They are left in position');
    w('rather than moved to the end, because their place in the order is still right; what');
    w('changes is that no amount of work below them unblocks them. Each says so in its row.');
    w('');
  }
  w('---');
  w('');
  w('## The decision this order rests on');
  w('');
  w('**Depth in one trade before breadth across many.** The alternative was to fill the');
  w('areas with no app at all, which makes a comparison table look better sooner. It was');
  w('rejected for a measurable reason: of the areas where an app is already named, only a');
  w('third have anything above SPECIFIED. Adding names would pile shallow coverage on');
  w('shallow coverage.');
  w('');
  w('It is also the only place a product this size can win. Nobody out-builds a fifty-app');
  w('suite on breadth. What a suite of separate apps does badly is exactly what a single');
  w('data core does well — a piece-rate, a marketplace settlement and the ledger being the');
  w('same rows rather than three apps synced nightly.');
  w('');
  w('---');
  w('');
  w(`## The work, in order — ${work.length} items`);
  w('');
  w('| # | Item | Size | Comes after |');
  w('|---:|---|:---:|---|');
  work.forEach((r, i) => {
    w(`| ${i + 1} | ${esc(r.parameter)} | ${r.close.size} | ` +
      `${(r.depends_on || []).map(dep).join(', ') || '—'} |`);
  });
  w('');

  work.forEach((r, i) => {
    const o = ours(r);
    w(`### ${i + 1}. ${r.parameter}`);
    w('');
    w(`*${B.DIMENSIONS.find((d) => d.id === r.dim).title} · size ${r.close.size} · ` +
      `our rung today: ${o.rung}*`);
    w('');
    w(r.close.work);
    w('');
    if ((r.depends_on || []).length) {
      w(`Comes after ${r.depends_on.map(dep).join(' and ')}.` +
        (waitsOnBlocker(r) ? ' Work below this item does not unblock it.' : ''));
      w('');
    }
  });

  w('---');
  w('');
  w(`## What no amount of code closes — ${blocked.length} items`);
  w('');
  w('These are not work to schedule. Each needs something only the owner can supply, and');
  w('listing them as tasks would hide that.');
  w('');
  work.length === 0 ? w('') : null;
  blocked.forEach((r) => {
    w(`### ${r.parameter}`);
    w('');
    w(r.close.blocker);
    w('');
  });

  w('---');
  w('');
  w('## Where nothing needs doing');
  w('');
  if (done.length) {
    done.forEach((r) => w(`- **${r.parameter}** — ${r.verdict}`));
  } else {
    w('Nothing on the list is finished.');
  }
  w('');
  w('---');
  w('');
  w('## What this plan does not promise');
  w('');
  w(`The score today is **${SCORE.mean} out of 5** and the maturity is **Level ` +
    `${AUDIT.MATURITY.level}, ${AUDIT.MATURITY.name}**. Finishing every item above does not`);
  w('make this equal to a suite that has been shipping for twenty years, and no honest');
  w('document can tell you how many months it is. What it does is remove every gap that was');
  w('measured — and name the ones that were never measured rather than quietly scoring them');
  w('as passes.');
  w('');
  w('Nothing here is deployed. Nothing here is live.');
  w('');
  return L.join('\n');
}

/* ── write, or prove current ───────────────────────────────────────────────── */
function finish(text) {
  const gloss = RENDER.glossarySection({ only: text, heading: '###' });
  return text + (gloss
    ? '\n---\n\n## Every technical word above, in plain language\n\n' + gloss
    : '') + '\n';
}

const OUTPUTS = [
  ['BENCHMARK_GAPS.md', gaps],
  ['PARITY_PLAN.md', plan],
];

let bad = 0;
OUTPUTS.forEach(([name, build]) => {
  const file = path.join(ROOT, name);
  const text = finish(build());
  if (check) {
    const now = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (now !== text) {
      console.error(`mkbenchmark: ${name} is out of date — run without --check.`);
      bad++;
    } else {
      console.log(`mkbenchmark: ${name} is current`);
    }
    return;
  }
  fs.writeFileSync(file, text);
  console.log(`${name}  ${Math.round(text.length / 1024)}KB`);
});

if (!check) {
  const behind = B.ROWS.filter((r) => r.verdict === 'BEHIND').length;
  console.log(`  ${B.ROWS.length} parameters · ${behind} behind · ` +
    `${B.ROWS.filter((r) => r.close && r.close.work).length} items of work · ` +
    `${B.ROWS.filter((r) => r.close && r.close.blocker).length} blocked on the owner · ` +
    `score ${SCORE.mean}/5, maturity ${AUDIT.MATURITY.level}`);
}
process.exit(bad ? 1 : 0);
