'use strict';
/* THE TENANT GUIDE — onboarding one business, and proving the platform on it.
 *
 *   node brand/delivery/website/mktenant.js   → VASTRANGAM_TENANT_GUIDE.md
 *
 * WHY THIS IS NOT mkguide.js WITH A FLAG
 * mkguide.js writes the BUILD guide: install the toolchain, clone the repo, harden a server, run
 * CI. Its reader is building the platform. This document's reader is a customer OF the platform,
 * who installs nothing and has no terminal. The first version of this document was the build
 * guide with the words changed, and it opened by telling a clothing manufacturer to run `git
 * init` — which is why the two are now separate programs writing separate documents.
 *
 * THE PART THAT MATTERS IS THE ACCEPTANCE TEST
 * This tenant was loaded with real data, real rules and real logic to answer one question: does
 * the platform work? So the eight cascades (§A0) and five end-to-end flows (§A5) become checks.
 *
 * THEY ARE READ OUT OF THE PLAN, NOT COPIED INTO THIS FILE.
 * A copy would be a second version of the acceptance criteria, free to drift from the one the
 * plan states. So both are parsed at generation time, and the generator REFUSES if it does not
 * find exactly the number the plan promises — a cascade cannot leave the acceptance test by
 * being quietly edited out of the source.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

const TENANT = require(path.join(SITE, 'tenant.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const RULES = require(path.join(SITE, 'rules.js'));
const { builtIn } = require(path.join(SITE, 'built.js'));
const FMT = require(path.join(SITE, 'guidefmt.js'));

const PLAN = path.join(ROOT, 'PLAN_OF_ACTION.md');
const OUT = path.join(ROOT, 'VASTRANGAM_TENANT_GUIDE.md');

/* How many the plan promises. If the plan grows a ninth cascade, this file must be updated
   deliberately — the alternative is a generator that silently accepts any number, which would
   let a cascade disappear from the acceptance test with nothing to notice. */
const N_CASCADES = 8;
const N_FLOWS = 5;

/* ── derived counts ──────────────────────────────────────────────────────── */
const NMOD = MODULES.length;
const NAPP = MODULES.reduce((s, m) => s + m.apps.length, 0);
const NBUILT = MODULES.reduce((s, m) => s + builtIn(m), 0);
const NRULES = RULES.length;
const NENF = RULES.filter((r) => r.state === 'ENFORCED').length;
const NPACKS = fs.readdirSync(path.join(ROOT, 'core', 'packs')).filter((f) => f.endsWith('.json')).length;
const NTABLES = (fs.readFileSync(path.join(ROOT, 'core', 'schema.postgres.sql'), 'utf8')
  .match(/CREATE TABLE IF NOT EXISTS/g) || []).length;
const DATE = new Date().toISOString().slice(0, 10);

/* ── the company fixtures, read from the test that already uses them ─────── */
/* These three companies with their real codes exist in core/tests/core.test.js, where they are
   seeded and asserted. Reading them from there rather than retyping them means the document
   cannot describe a company the engine does not actually test. */
function companies() {
  const src = fs.readFileSync(path.join(ROOT, 'core', 'tests', 'core.test.js'), 'utf8');
  const rows = [];
  const re = /\{\s*id:\s*'[a-z]+',\s*name:\s*'([^']+)',\s*brand_name:\s*'([^']+)',\s*brand_code:\s*'([^']+)',\s*invoice_prefix:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src))) rows.push({ name: m[1], brand: m[2], code: m[3], prefix: m[4] });
  if (rows.length < 3) {
    throw new Error(`mktenant: found ${rows.length} companies in core.test.js, expected at least 3 — ` +
      `the fixture shape changed, and this document would otherwise invent them`);
  }
  return rows;
}

/* ── the channel kinds the database actually allows ──────────────────────── */
function channelKinds() {
  const sql = fs.readFileSync(path.join(ROOT, 'core', 'schema.postgres.sql'), 'utf8');
  const m = /kind\s+text\s+NOT NULL\s+DEFAULT\s+'[a-z]+'\s*\n?\s*CHECK \(kind IN \(([^)]+)\)\)/.exec(sql);
  if (!m) throw new Error('mktenant: could not read the channel kinds out of the schema');
  return m[1].split(',').map((s) => s.trim().replace(/'/g, ''));
}

/* ── the eight cascades, parsed out of §A0 ───────────────────────────────── */
function cascades() {
  const md = fs.readFileSync(PLAN, 'utf8');
  const sec = md.split('### The eight cascades that must fire by themselves')[1];
  if (!sec) throw new Error('mktenant: §A0 cascades section not found in PLAN_OF_ACTION.md');
  const body = sec.split(/\n---/)[0];
  const rows = [];
  body.split('\n').forEach((line) => {
    const m = /^\|\s*\*\*(.+?)\*\*([^|]*)\|\s*(.+?)\s*\|\s*$/.exec(line);
    if (m) rows.push({ action: (m[1] + m[2]).trim(), result: m[3].trim() });
  });
  if (rows.length !== N_CASCADES) {
    throw new Error(`mktenant: found ${rows.length} cascades in PLAN_OF_ACTION.md §A0, expected ` +
      `${N_CASCADES}. Either a cascade was removed — in which case it has silently left the ` +
      `acceptance test — or one was added and N_CASCADES needs updating deliberately.`);
  }
  return rows;
}

/* ── the five flows, parsed out of §A5 ───────────────────────────────────── */
function flows() {
  const md = fs.readFileSync(PLAN, 'utf8');
  const sec = md.split('## A5 · THE FIVE END-TO-END FLOWS')[1];
  if (!sec) throw new Error('mktenant: §A5 flows section not found in PLAN_OF_ACTION.md');
  const body = sec.split('\n## ')[0];
  const rows = [];
  const re = /### (Flow \d+ · [^\n]+)\n+```mermaid\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(body))) rows.push({ title: m[1].trim(), mermaid: m[2].trim() });
  if (rows.length !== N_FLOWS) {
    throw new Error(`mktenant: found ${rows.length} flows in PLAN_OF_ACTION.md §A5, expected ` +
      `${N_FLOWS}. A flow has left the acceptance test, or one was added and N_FLOWS needs ` +
      `updating deliberately.`);
  }
  return rows;
}

/* ── tokens ──────────────────────────────────────────────────────────────── */
const TOKENS = {
  __TENANT__: 'Vastrangam',
  __STORE__: 'vastrangam.com',
  __PLATFORM__: 'Medhava',
  __PACK__: 'manufacturing',
  __NMOD__: String(NMOD),
  __NAPP__: String(NAPP),
  __NBUILT__: String(NBUILT),
  __NRULES__: String(NRULES),
  __NENF__: String(NENF),
  __NPACKS__: String(NPACKS),
  __NTABLES__: String(NTABLES),
};

function sub(text) {
  if (text == null) return text;
  let s = String(text);
  for (const [k, v] of Object.entries(TOKENS)) s = s.split(k).join(v);
  const left = s.match(/__[A-Z][A-Z0-9_]*__/g);
  if (left) throw new Error(`mktenant: undefined token(s): ${[...new Set(left)].join(', ')}`);
  return s;
}

/* ── the three findings, with their evidence ─────────────────────────────── */
/* Each one was found by reading the platform's own code while writing this document, and each
   names the file that proves it. A finding without a file is an opinion. */
const FINDINGS = [
  {
    n: 1,
    title: 'There is no tenant in the database',
    what: `The plan says a tenant is a row, above company — that is what makes onboarding a
business data entry rather than a deployment. **No \`tenants\` table exists** in either schema
file, and the word does not appear in \`modules.js\` or anywhere in \`core/\`. Companies exist;
the level above them does not.`,
    why: `Every promise in Part 0 about one account holding up to 20 companies rests on a layer
that is not modelled. And the isolation between two tenants — the thing that keeps another
business from reading yours — has nowhere to hang.`,
    evidence: '`core/schema.postgres.sql`, `core/schema.sql` — searched, absent',
    kind: 'not built',
  },
  {
    n: 2,
    title: 'A tenant cannot override a word its pack got wrong',
    what: `\`term()\` resolves a concept’s name from the **pack only** — there is no tenant-level
override. The shipped \`manufacturing\` pack speaks discrete manufacturing: it calls an item a
*part* and a person an *operator*. A clothing manufacturer says *piece* and *karigar*.`,
    why: `The product’s claim is that the screens use your words. For this tenant they use words
from a neighbouring trade, and there is no supported way to correct them short of writing a new
pack. Close-but-wrong vocabulary is worse than generic vocabulary, because it reads as though
somebody chose it.`,
    evidence: '`core/packs.js` — `term()` reads `pack.vocabulary` and nothing else',
    kind: 'not built',
  },
  {
    n: 3,
    title: 'A tenant gets one pack, and this business spans two',
    what: `\`resolve()\` takes a single pack. Of the ${NPACKS} shipped, this business is both
\`manufacturing\` (it makes what it sells) and \`retail-ecommerce\` (it sells across D2C,
marketplaces, B2B and export). Neither alone describes it, and there is no apparel pack.`,
    why: `A business that makes and sells is not unusual — it is most of the target market. If one
pack per tenant is the intended design, the packs need to cover combined trades. If packs are
meant to compose, that is not built.`,
    evidence: '`core/packs.js` — `resolve(pack)`, single argument; `core/packs/` — no apparel pack',
    kind: 'design question',
  },
];

function findingsBlock() {
  const out = [];
  FINDINGS.forEach((f) => {
    out.push(`### Finding ${f.n} · ${f.title}  \`${f.kind.toUpperCase()}\``, '');
    out.push(sub(f.what), '');
    out.push(`**Why it matters.** ${sub(f.why)}`, '');
    out.push(`**Evidence:** ${f.evidence}`, '');
  });
  return out.join('\n');
}

/* ── rendered blocks the data file asks for by flag ──────────────────────── */
function companiesBlock() {
  const c = companies();
  return [
    FMT.table({
      head: ['Legal name', 'Trades as', 'Brand code', 'Invoice prefix'],
      rows: c.map((r) => [r.name, r.brand, '`' + r.code + '`', '`' + r.prefix + '`']),
    }, sub),
    '',
    `Look at the second row. The company is **${c[1].name}**, it trades as **${c[1].brand}**, its ` +
    `SKUs read \`${c[1].code}\` and its invoices read \`${c[1].prefix}\` — four fields, three ` +
    `different answers. Collapse any two of them and its invoices carry a name that is not its ` +
    `registered one.`,
  ].join('\n');
}

function channelsBlock() {
  const kinds = channelKinds();
  const meaning = {
    d2c: 'Your own storefront — `vastrangam.com` is this',
    marketplace: 'A marketplace account. One row per marketplace per company',
    b2b: 'Wholesale, on credit terms',
    export: 'Overseas, with its own documents',
    pos: 'A counter, drawing on the same stock as the website',
    reseller: 'Somebody selling on your behalf',
  };
  return FMT.table({
    head: ['Kind', 'What it is'],
    rows: kinds.map((k) => ['`' + k + '`', meaning[k] || '—']),
  }, sub);
}

function cascadesBlock() {
  const c = cascades();
  const out = [
    '## Part 7 · The eight cascades',
    '',
    `These are the checks that decide whether this is a system or a set of screens. **A single
action must update every consequence of it, in one transaction, with nobody re-keying anything.**
If one of these needs a human to carry a number from one screen to another, the platform has
failed at the only thing that makes it a platform.`,
    '',
    `Each row is a check: do the thing on the left, then confirm **every** item on the right
happened by itself.`,
    '',
  ];
  c.forEach((row, i) => {
    /* The heading already names the action. Repeating it as a "Do:" line underneath was
       filler, and filler in a checklist is the thing a reader learns to skip past. */
    out.push(`### Check 7.${i + 1} · ${row.action}`, '');
    out.push(`Do that one thing. **Every item below must then be true, without you touching it:**`, '');
    row.result.split('→').map((s) => s.trim()).filter(Boolean)
      .forEach((s) => out.push(`- ${s}`));
    out.push('');
    out.push(`**Done when:** all of the above are true from the one action, and you can click the ` +
      `dashboard figure down to the voucher that produced it.`, '');
  });
  out.push(`> **Where these came from.** Read out of \`PLAN_OF_ACTION.md\` §A0 when this document ` +
    `was generated, not copied into it. If a cascade is edited out of that section, this generator ` +
    `refuses to build rather than quietly shipping a shorter acceptance test.`, '');
  return out.join('\n');
}

function flowsBlock() {
  const f = flows();
  const out = [
    '## Part 8 · The five end-to-end flows',
    '',
    `A cascade proves one action fans out correctly. A flow proves the business can be **run**
start to finish. Each crosses many modules, which is the point — no module completes any of them
alone, and the gaps between modules are where systems usually fail.`,
    '',
    `Run each one with real data, once. Not a demo record — a real design, a real order, a real
karigar report.`,
    '',
  ];
  f.forEach((row, i) => {
    out.push(`### Check 8.${i + 1} · ${row.title.replace(/^Flow \d+ · /, '')}`, '');
    out.push('```mermaid', row.mermaid, '```', '');

    /* THE SAME CHAIN, AS A LIST, AND WHY IT IS HERE
       These flows run to nine steps. Nine nodes side by side across an A4 page leaves each one
       about 20mm wide, and the label inside it renders at roughly four point — drawn, correctly
       sized, past every automated check, and unreadable. That is the same failure as the tall
       flowchart that vanished into a blank page: the guard proves a diagram EXISTS, never that a
       person can read it.

       So the steps are also listed. Not a second copy — parsed out of the very mermaid printed
       above, so the two cannot disagree. The picture carries the shape; the list carries the
       words. */
    const labels = [...row.mermaid.matchAll(/\[\s*"([^"]+)"\s*\]/g)]
      .map((m) => m[1].replace(/<br\s*\/?>/gi, ' ').trim());
    const seen = new Set();
    const ordered = labels.filter((l) => (seen.has(l) ? false : seen.add(l)));
    if (ordered.length) {
      out.push('**The same chain, step by step:**', '');
      ordered.forEach((l, k) => out.push(`${k + 1}. ${l}`));
      out.push('');
    }

    out.push(`**Done when:** one real case has travelled the whole chain above, every step ` +
      `triggered by the one before it, and the figure at the end can be traced back to the ` +
      `record at the start.`, '');
  });
  out.push(`> Read out of \`PLAN_OF_ACTION.md\` §A5 at generation time. Same rule as Part 7: if a ` +
    `flow disappears from the plan, this document refuses to build.`, '');
  return out.join('\n');
}

/* ── the document ────────────────────────────────────────────────────────── */
function build() {
  const bad = TENANT.check();
  if (bad.length) {
    console.error(`mktenant: tenant.js has ${bad.length} problem(s)\n`);
    bad.forEach((b) => console.error('  ' + b));
    process.exit(1);
  }

  const nsteps = TENANT.parts.reduce((s, p) => s + p.steps.length, 0);
  const ncheck = N_CASCADES + N_FLOWS;

  const front = `# ${TOKENS.__TENANT__} — the tenant guide

**Onboarding one business onto ${TOKENS.__PLATFORM__}, and proving the platform on it.**

${nsteps} steps · ${ncheck} acceptance checks · compiled ${DATE}

---

## What this document is

Two things, and the second is the reason it exists.

**Onboarding.** How this business gets set up on the platform: its trade, its companies, its
channels, its data, its people. Every step says what to do, what you should see, and the condition
that makes it finished.

**The acceptance test.** This tenant was given complete data, real rules and real logic in order to
answer one question — *does the platform actually work?* Parts 7 and 8 are ${ncheck} checks derived
from the platform's own stated criteria. Each either passes or finds something.

**You install nothing.** No repository, no server, no toolchain. Those belong to the people building
${TOKENS.__PLATFORM__} and they have their own guide. Everything here happens in a browser.

${FMT.LABELS}

**What is actually finished, stated once so no step has to hedge:** ${NBUILT} of ${NAPP} apps run
today, and they run on their own storage rather than the shared core. The industry pack engine is
finished and proven. Tenancy is **not** — and Part 9 opens with that, rather than letting the rest of
the document imply otherwise.

---

`;

  const extra = {
    companies: companiesBlock(),
    channelKinds: channelsBlock(),
    findings: findingsBlock(),
  };

  const parts = [];
  for (const p of TENANT.parts) {
    if (p.n === 9) { parts.push(cascadesBlock()); parts.push(flowsBlock()); }
    parts.push(FMT.part(p, sub, extra));
  }

  const foot = `---

*Generated by \`brand/delivery/website/mktenant.js\` from \`brand/site/tenant.js\`, the canonical
lists, and the acceptance criteria in \`PLAN_OF_ACTION.md\`. Every count, every company code, every
channel kind, every cascade and every flow is read from its source at generation time. Nothing here
is maintained by editing this file — edit the source and regenerate.*
`;

  return front + parts.join('\n---\n\n') + '\n' + foot;
}

/* A refusal here is a message to a person, not a crash. The parse gates above are the ones most
   likely to fire — somebody edits the plan, and this stops. A stack trace makes that read like a
   bug in the generator; the message alone makes it read like what it is, which is the gate doing
   its job. Same reasoning as the browser resolver naming the fix instead of throwing a launch
   trace. */
let DOC;
try {
  DOC = build();
} catch (e) {
  console.error('mktenant: refusing to write the document.\n');
  console.error('  ' + e.message.replace(/\n/g, '\n  '));
  console.error('\n  Nothing was written.');
  process.exit(1);
}
fs.writeFileSync(OUT, DOC);

const kb = Math.round(Buffer.byteLength(DOC) / 1024);
const nsteps = TENANT.parts.reduce((s, p) => s + p.steps.length, 0);
console.log(`${path.relative(ROOT, OUT)} written: ${kb}KB · ${TOKENS.__TENANT__} · ` +
  `${TENANT.parts.length} parts · ${nsteps} steps · ` +
  `${N_CASCADES} cascades + ${N_FLOWS} flows = ${N_CASCADES + N_FLOWS} acceptance checks · ` +
  `${(DOC.match(/```mermaid/g) || []).length} diagrams`);
console.log(`  derived: ${companies().length} companies from the fixtures · ` +
  `${channelKinds().length} channel kinds from the schema · ${NMOD} modules · ${NAPP} apps · ` +
  `${NBUILT} built · ${NRULES} rules (${NENF} enforced) · ${NTABLES} tables · ${NPACKS} packs`);
console.log(`  ${FINDINGS.length} findings carried, each naming the file that proves it`);
