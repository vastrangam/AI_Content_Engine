'use strict';
/* THE TRUTH REGISTRY — one row per capability, and what proves it.
 *
 *   node brand/site/checkregistry.js --summary
 *   node brand/delivery/website/mkregistry.js
 *
 * WHY THIS EXISTS
 * Every register in this repository answers "what is designed". None of them answered
 * "what is standing up", and the one place that came close — built.js — covers apps only
 * and says nothing about isolation, deployment, integrations or the things that were never
 * started at all. So the honest answer to "how much of this works" lived in my sentences,
 * and my sentences were wrong twice in one session: I said the repository had no CI while
 * .github/workflows/ci.yml sat in the tree, and I reported an archive's size and file count
 * from a summary line I had misread. Both were confident. Nothing could contradict either.
 *
 * A row here is a claim with a receipt attached, and checkregistry.js refuses the claim
 * when the receipt is missing.
 *
 * THE STATUS LADDER, AND WHAT EACH RUNG COSTS TO CLAIM
 * The master prompt asks for NOT STARTED · SPECIFIED · DESIGNED · IMPLEMENTED · TESTED ·
 * VERIFIED · PRODUCTION-READY · BLOCKED · DEPRECATED. A ladder whose rungs are not defined
 * is a ladder anybody can climb, so each one is defined by what the gate demands for it:
 *
 *   NOT STARTED      nothing exists. No evidence permitted — a row with a file attached is
 *                    not "not started", and the gate says so.
 *   SPECIFIED        written down in a register somebody can read. Every app in modules.js
 *                    is at least this, which is why it is the default and not an achievement.
 *   DESIGNED         specified AND the decision is argued somewhere with what would make it
 *                    wrong — architect.js, stack.js, a rule carrying its "never".
 *   IMPLEMENTED      code exists and runs. Tests may exist; they are not in the gated suite,
 *                    so nothing stops them rotting.
 *   TESTED           an automated test drives it, passes, runs inside `npm test`, AND that
 *                    run is recorded in docs/verification/EVIDENCE.md with exit 0. Three
 *                    conditions, all checked. "There is a test file" earns IMPLEMENTED.
 *   VERIFIED         TESTED, and additionally checked against a source outside this
 *                    repository. NOTHING in the product is at this rung today. That is not
 *                    modesty — the one time an engine here was checked against an outside
 *                    document, the document found a defect that three hundred internal
 *                    checks had agreed with.
 *   PRODUCTION-READY deployed, reachable, and smoke-tested there. Nothing is here either.
 *   BLOCKED          cannot proceed, and the row says by what. A blocker naming no obstacle
 *                    is refused.
 *   DEPRECATED       was real, is being withdrawn.
 *
 * HOW A ROW GETS ITS STATUS
 * Not by being typed. Every app in modules.js starts at SPECIFIED and is raised only by an
 * entry in EVIDENCE below, so the 113 rows cannot drift out of step with the module list —
 * an app renamed in modules.js and not here is caught, and an entry here naming an app that
 * does not exist is caught. Retyping 113 rows is how the count in one document stops
 * matching the count in another; §7 of the working agreement, applied to itself.
 *
 * WHAT IS DELIBERATELY NOT HERE
 * No percentage complete. A number like "62% done" is unfalsifiable and every one of the
 * thirty-four defects this session would have been invisible inside it.
 */

const STATUSES = [
  'NOT STARTED', 'SPECIFIED', 'DESIGNED', 'IMPLEMENTED',
  'TESTED', 'VERIFIED', 'PRODUCTION-READY', 'BLOCKED', 'DEPRECATED',
];

/* Rungs that demand a receipt. Below IMPLEMENTED a register entry is the evidence and the
   gate checks the register instead; at IMPLEMENTED and above a file must exist on disk. */
const NEEDS_FILE = ['IMPLEMENTED', 'TESTED', 'VERIFIED', 'PRODUCTION-READY'];
/* Rungs that additionally demand a recorded, passing run in EVIDENCE.md. */
const NEEDS_RUN = ['TESTED', 'VERIFIED', 'PRODUCTION-READY'];

/* ── apps raised above SPECIFIED ──────────────────────────────────────────────
 * Keys are app names spelled exactly as modules.js spells them; the gate checks that.
 * `files` must exist. `run` must be a command recorded in EVIDENCE.md at exit 0.
 * `note` is the honest qualifier — what the rung does NOT mean for this row. */
const APPS = {
  'Stock': {
    status: 'TESTED',
    files: ['medhava/server/inventory.js', 'medhava/test/inventory.test.js'],
    run: 'npm run medhava',
    note: 'Receipt, issue and transfer against the real database inside row-level ' +
      'security. Reorder alerts, batches, kits and dead-stock are specified and absent.',
  },
  'D2C Sales': {
    status: 'TESTED',
    files: ['medhava/server/sales.js', 'medhava/test/sales.test.js'],
    run: 'npm run medhava',
    note: 'One order posts lines, invoice, stock movement and ledger in a single ' +
      'transaction. No storefront connected — the order arrives over the API, not from ' +
      'a shop. A prototype browser screen of the same name exists separately.',
  },
  'Provider Router & Cost Guard': {
    status: 'TESTED',
    files: ['brand/suite/router.js'],
    run: 'npm run selftest',
    note: 'Fallback order, breaker and spend ceiling all exercised. No provider is ' +
      'actually connected: the selftest drives fakes, so this proves the rule, not the ' +
      'integration.',
  },
  /* Q02. Raised from the browser-prototype default below, which it also still is — the
     prototype screen came first and this is the platform implementation behind it. */
  'Procurement': {
    status: 'TESTED',
    files: ['medhava/server/purchase.js', 'medhava/test/purchase.test.js'],
    run: 'npm run medhava',
    note: 'A purchase order raised against an active vendor, then received — in part or in ' +
      'full — against the real database inside row-level security. A short receipt adds only ' +
      'what arrived and owes only for that; the order stays open for the rest. What is NOT ' +
      'here: the vendor invoice, and so the full three-way match of R07.11, plus approval ' +
      'routing, landed cost and dated vendor pricing. Nine of module 07’s twelve rules are ' +
      'specified and unenforced, and none of them is stubbed.',
  },
  'Motion Renderer': {
    status: 'TESTED',
    files: ['brand/suite/studio/motion_render.js'],
    run: 'npm run selftest',
    note: 'Renders a real MP4 and probes it. Command-line only — there is no screen.',
  },
};

/* THESE WERE IMPLEMENTED UNTIL Q01, AND THE ONLY REASON WAS THAT NOBODY RAN THEIR TESTS.
   Each app has always carried its own assertions — 35 of them for the sales screen, 50 for
   Ask & Print — and build_deep.js has always run them. It was simply not inside `npm test`,
   so a broken control would have gone unnoticed until somebody thought to look. That is
   precisely the distance the ladder puts between IMPLEMENTED and TESTED, and closing it
   needed no new feature: `npm run apps` is now in the gated suite and recorded.

   WHAT THE RUNG STILL DOES NOT MEAN. TESTED says a gated automated test drives it. It does
   not say there is a database behind it, and there is not — every one of these computes
   over a store inside the page. The rows that run on the real database are the two in
   PLATFORM above, and they are a different and stronger claim. */
const BROWSER_NOTE = 'Opens in a browser and carries its own self-tests, which now run ' +
  'inside `npm test` — a broken control turns the suite red. Still a prototype: there is ' +
  'no shared database behind it, so nothing entered is stored anywhere or seen by anyone ' +
  'else. The full click-through of every control runs in its own CI job.';

const BROWSER = [
  'CEO Dashboard', 'Report Builder', 'Group Consolidation',
  'CRM & Customer 360', 'Documents & eSign', 'Helpdesk & Live Chat',
  'B2B & Credit', 'Export', 'POS', 'Quotes & Proforma',
  'Marketplace OMS', 'Order Management', 'Procurement', 'Vendor Management',
  'Ask & Print',
];
BROWSER.forEach((name) => {
  /* AN APP ALREADY RAISED ABOVE KEEPS ITS OWN ENTRY. Procurement is both — a browser
     prototype and, since Q02, a platform implementation — and this loop runs after the
     literal entries, so without this guard it would silently overwrite the stronger claim
     with the weaker one and nothing would report the loss. */
  if (APPS[name]) return;
  APPS[name] = {
    status: 'TESTED',
    files: ['brand/suite/deep/apps.js', 'brand/suite/deep/build_deep.js'],
    run: 'npm run apps',
    note: BROWSER_NOTE,
  };
});

/* ── the things that are not apps ─────────────────────────────────────────────
 * A registry of apps alone would report this project as far healthier than it is: it would
 * never mention that nothing is deployed, no integration is live, and three whole product
 * surfaces have not been started. Those belong in the same table as the apps, at the same
 * rung definitions, or the table is flattering. */
const CAPABILITIES = [
  { id: 'CAP-ISOLATION', name: 'Tenant isolation in the database', status: 'TESTED',
    files: ['core/schema.postgres.sql', 'core/tests/live.test.js', 'medhava/test/isolation.test.js'],
    run: 'node core/tests/live.test.js',
    note: 'The schema is loaded into a real Postgres and driven by a role that is neither ' +
      'superuser nor table owner — without that role the policies are inert and the test ' +
      'would pass while proving nothing.' },

  { id: 'CAP-SCHEMA', name: 'The production schema', status: 'TESTED',
    files: ['core/schema.postgres.sql', 'core/tests/schema.test.js'],
    run: 'node core/tests/schema.test.js',
    note: '151 tables that execute, every business table company-scoped, money as integer ' +
      'paise. Never loaded with production-scale data; nothing here is a performance claim.' },

  { id: 'CAP-PACKS', name: 'Trade configuration as data', status: 'TESTED',
    files: ['core/packs.js', 'core/tenant.js', 'core/tests/packs.test.js'],
    run: 'node core/tests/packs.test.js',
    note: 'A pack renames and extends; it may not invent a concept or carry executable ' +
      'code. The effective-dated tenant overlay is checked in the same run.' },

  { id: 'CAP-GROUP', name: 'Multi-company consolidation', status: 'TESTED',
    files: ['core/tests/core.test.js'],
    run: 'node core/tests/core.test.js',
    note: 'Posted across a 10 x 10 grid and then 11 x 11 with no code changed, so the ' +
      'arithmetic carries no ceiling of its own.' },

  { id: 'CAP-SHELL', name: 'Sign-in, session and the web shell', status: 'TESTED',
    files: ['medhava/server/auth.js', 'medhava/server/api.js', 'medhava/web/index.html',
      'medhava/test/shell.test.js'],
    run: 'npm run medhava',
    note: 'Sign-in, company switching and a screen that shows isolation refusing a ' +
      'cross-company read. Single server, no session store, no password reset.' },

  { id: 'CAP-CI', name: 'Continuous integration', status: 'IMPLEMENTED',
    files: ['.github/workflows/ci.yml'],
    note: 'Runs the suite on push. Not recorded here as TESTED because what proves a CI ' +
      'file is a run on the service, and this register only counts runs recorded in this ' +
      'repository. I claimed twice this session that there was no CI at all.' },

  { id: 'CAP-EVIDENCE', name: 'Verification evidence capture', status: 'TESTED',
    files: ['tools/evidence.js', 'tools/evidence.test.js', 'docs/verification/EVIDENCE.md'],
    run: 'node tools/evidence.test.js',
    note: 'Records command, exit code, commit, dirty tree and artifact hashes. ' +
      'Tamper-evident, not tamper-proof: anyone with write access can edit the file. ' +
      'The test plants a drifted exit code and a hand-waved excuse and requires both to ' +
      'be refused — it began as two checks I ran by hand, which is a check that only ' +
      'holds while somebody remembers to run it.' },

  { id: 'CAP-DOCS', name: 'Generated, gated documentation', status: 'TESTED',
    files: ['brand/delivery/manifest.js', 'brand/site/checkcoverage.js'],
    run: 'node brand/site/checkcoverage.js',
    note: 'Every delivered document is generated from a register and refuses to ship ' +
      'ungated. It documents a design; a gated document is not a working feature.' },

  { id: 'CAP-DEPLOY', name: 'Deployment to a production environment', status: 'NOT STARTED',
    blocker: 'No server, no domain and no credentials exist. DEPLOYMENT.md and deploy/ are ' +
      'a written runbook, which is a plan for deploying and not a deployment. Nothing has ' +
      'ever been installed anywhere from them.' },

  { id: 'CAP-PUBLISH', name: 'The static site published at a public URL', status: 'BLOCKED',
    files: ['brand/delivery/website/mksite.js', 'brand/site/checksite.js',
      '.github/workflows/pages.yml'],
    blocker: 'Blocked on one repository setting, not on any code. The site is assembled by ' +
      'mksite.js and verified by checksite.js, which serves it over real HTTP and drives it ' +
      'in Chromium — 13 assertions, recorded. The workflow that would publish it cannot: ' +
      'creating a GitHub Pages site needs administration rights the Actions token does not ' +
      'have here, and the attempt fails with "Resource not accessible by integration". ' +
      'Pages has never been enabled on this repository — the runs from July failed the same ' +
      'way. Settings → Pages → Build and deployment → Source: GitHub Actions is the whole ' +
      'fix, and it is the owner\'s to make. `enablement: true` was expected to do it ' +
      'unattended and does not.',
    note: 'This is deliberately its own row rather than folded into CAP-DEPLOY. They are ' +
      'different things: CAP-DEPLOY is the product server with its database, which cannot ' +
      'be deployed from this environment at all, and this is a static site that is built, ' +
      'verified and one setting away from being live.' },

  { id: 'CAP-MONITOR', name: 'Monitoring, alerting and health checks', status: 'SPECIFIED',
    blocker: 'Nothing to monitor until something is deployed. Depends on CAP-DEPLOY.' },

  { id: 'CAP-INTEGRATIONS', name: 'Live outside integrations', status: 'BLOCKED',
    blocker: 'Every marketplace, courier, tax portal, bank feed and payment provider needs ' +
      'live credentials, and this repository must never hold one. This cannot be raised ' +
      'from inside the repository at all — it needs an environment holding secrets that no ' +
      'commit ever sees. Simulating one and calling it connected is the failure this whole ' +
      'register exists to make impossible.' },

  { id: 'CAP-AI', name: 'AI gateway, agent permissions and evaluation', status: 'SPECIFIED',
    blocker: 'The provider router is the one piece that runs. There is no gateway, no ' +
      'permission model for what an agent may do on a company’s data, and no ' +
      'evaluation set, so no quality claim can be made about any answer the system gives.' },

  { id: 'CAP-ANALYTICS', name: 'Query engine and report builder on real data', status: 'SPECIFIED',
    blocker: 'The prototype report builder computes over an in-page store. There is no ' +
      'query engine against the database.' },

  { id: 'CAP-DEVPLATFORM', name: 'Developer platform — public API, webhooks, SDKs',
    status: 'NOT STARTED',
    blocker: 'Not begun. The internal API is four routes for two modules and is not a ' +
      'public surface: no versioning, no keys, no rate limiting, no webhook delivery.' },

  { id: 'CAP-STUDIO', name: 'Studio — building screens and flows without code',
    status: 'NOT STARTED',
    blocker: 'Not begun. Packs configure vocabulary and fields; they do not let anyone ' +
      'build a screen.' },

  { id: 'CAP-MARKETPLACE', name: 'Extension marketplace', status: 'NOT STARTED',
    blocker: 'Not begun, and it cannot begin before CAP-DEVPLATFORM: there is nothing for ' +
      'a third party to extend.' },

  { id: 'CAP-MOBILE', name: 'Mobile', status: 'SPECIFIED',
    blocker: 'The shell is responsive markup that has never been opened on a phone by any ' +
      'check here. A responsive claim nobody has tested is a claim, and this register ' +
      'will not count it as a result.' },

  { id: 'CAP-THREATMODEL', name: 'Threat model and adversarial security testing',
    status: 'NOT STARTED',
    blocker: 'Isolation is proven against an honest client. Nobody has written down who ' +
      'the attacker is, and no test attacks the system the way one would.' },

  { id: 'CAP-SCALE', name: 'Behaviour at production scale', status: 'NOT STARTED',
    blocker: 'Every test here runs on a handful of rows. No load test, no query plan ' +
      'reviewed, no index measured. Nothing in this repository supports any statement ' +
      'about speed under real volume.' },
];

/* ── building the table ───────────────────────────────────────────────────────
 * One row per app in modules.js, in the order modules.js gives them, then the
 * cross-cutting rows. Order is never rearranged: §3 rule 5. */
function rows(MODULES) {
  const out = [];
  MODULES.forEach((m) => {
    m.apps.forEach((a) => {
      const name = a[0];
      const e = APPS[name] || null;
      out.push({
        id: `APP-${m.n}-${String(out.filter((r) => r.module === m.n).length + 1).padStart(2, '0')}`,
        kind: 'app',
        module: m.n,
        module_name: m.name,
        name,
        status: e ? e.status : 'SPECIFIED',
        files: e ? e.files : [],
        run: (e && e.run) || null,
        blocker: (e && e.blocker) || null,
        note: (e && e.note) || null,
      });
    });
  });
  CAPABILITIES.forEach((c) => out.push({
    id: c.id,
    kind: 'capability',
    module: null,
    module_name: null,
    name: c.name,
    status: c.status,
    files: c.files || [],
    run: c.run || null,
    blocker: c.blocker || null,
    note: c.note || null,
  }));
  return out;
}

/* Counts, derived — never typed anywhere. */
function tally(all) {
  const t = {};
  STATUSES.forEach((s) => { t[s] = 0; });
  all.forEach((r) => { t[r.status] += 1; });
  return t;
}

/* ── the register's own internal checks ───────────────────────────────────────
 * Everything here is answerable without touching the disk; checkregistry.js does the
 * file-and-run half. Split that way so this module can be required by a document
 * generator without the generator needing a Postgres or a recorded evidence file. */
function check() {
  const bad = [];
  const seen = new Set();

  Object.entries(APPS).forEach(([name, e]) => {
    if (!STATUSES.includes(e.status)) {
      bad.push(`app "${name}" carries status "${e.status}", which is not on the ladder`);
    }
    if (NEEDS_FILE.includes(e.status) && !(e.files || []).length) {
      bad.push(`app "${name}" claims ${e.status} and names no file. That rung means code ` +
        `exists, so it owes a path`);
    }
    if (NEEDS_RUN.includes(e.status) && !e.run) {
      bad.push(`app "${name}" claims ${e.status} and names no command. That rung means a ` +
        `test drives it, so it owes the command that does`);
    }
    if (e.status === 'NOT STARTED' && (e.files || []).length) {
      bad.push(`app "${name}" is NOT STARTED and names ${e.files.length} file(s). One of ` +
        `those two is false`);
    }
    if (!e.note && !e.blocker) {
      bad.push(`app "${name}" carries neither a note nor a blocker. Every row owes the ` +
        `reader what its rung does NOT mean — that qualifier is the whole point of this ` +
        `register`);
    }
  });

  CAPABILITIES.forEach((c) => {
    if (!c.id || !/^CAP-[A-Z]+$/.test(c.id)) {
      bad.push(`capability "${c.name}" has id "${c.id}", which is not of the form CAP-NAME`);
    }
    if (seen.has(c.id)) bad.push(`capability id ${c.id} is used twice`);
    seen.add(c.id);
    if (!STATUSES.includes(c.status)) {
      bad.push(`${c.id} carries status "${c.status}", which is not on the ladder`);
    }
    if (NEEDS_FILE.includes(c.status) && !(c.files || []).length) {
      bad.push(`${c.id} claims ${c.status} and names no file`);
    }
    if (NEEDS_RUN.includes(c.status) && !c.run) {
      bad.push(`${c.id} claims ${c.status} and names no command`);
    }
    /* THE ONE THAT MATTERS MOST HERE. A row saying "not started" with no reason is a
       silence a reader fills in optimistically. Every unbuilt thing states why. */
    if (!NEEDS_FILE.includes(c.status) && !c.blocker) {
      bad.push(`${c.id} is ${c.status} and states no blocker. An unbuilt capability with ` +
        `no reason written down reads as an oversight rather than a decision`);
    }
    if (c.status === 'NOT STARTED' && (c.files || []).length) {
      bad.push(`${c.id} is NOT STARTED and names a file. One of those two is false`);
    }
    if (!c.note && !c.blocker) bad.push(`${c.id} carries neither a note nor a blocker`);
  });

  /* Nothing may sit at the top two rungs while this register is generated from a machine
     that has never deployed anything. If a later hand raises one, it has to delete this
     check and explain itself in the diff. */
  const top = [...Object.entries(APPS).map(([n, e]) => [n, e.status]),
    ...CAPABILITIES.map((c) => [c.id, c.status])]
    .filter(([, s]) => s === 'VERIFIED' || s === 'PRODUCTION-READY');
  top.forEach(([n, s]) => {
    bad.push(`${n} claims ${s}. Nothing in this repository can reach that rung: VERIFIED ` +
      `needs a check against a source outside it, and PRODUCTION-READY needs a deployment ` +
      `that has never happened`);
  });

  return bad;
}

module.exports = {
  STATUSES, NEEDS_FILE, NEEDS_RUN, APPS, CAPABILITIES, BROWSER,
  rows, tally, check,
};
