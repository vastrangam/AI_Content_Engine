'use strict';
/* THE AUDIT REGISTER — the score, the maturity level, and what to build next.
 *
 *   node brand/site/checkaudit.js --summary
 *   node brand/delivery/website/mkaudit.js
 *
 * WHAT LIVES HERE AND WHAT DOES NOT
 * The status of every capability lives in registry.js and is proven by checkregistry.js.
 * This file holds the three things that register deliberately refuses to hold:
 *
 *   SCORES     the 0–5 scale the master prompt asks for, expressed as a mapping FROM the
 *              rungs registry.js already gates. It is a translation, not a second opinion:
 *              nothing here can score a row higher than its evidence allows, because the
 *              score is a function of the rung and the rung is gated.
 *   MATURITY   one level for the product as a whole, with the argument for it and the
 *              specific thing that would have to become true to move up. A maturity level
 *              with no stated next condition is a mood.
 *   QUEUE      what to build next, as vertical slices, each carrying the fields §51 asks
 *              for. Never "build the ERP".
 *
 * WHY THE SCORE IS A FUNCTION AND NOT A COLUMN
 * A hand-entered score is the single easiest number in this whole project to inflate, and
 * it would be inflated by exactly the mechanism that produced this session's worst defect:
 * I would be scoring my own work against my own memory of it. Deriving it from the gated
 * rung means the only way to raise a score is to earn the rung, which means a recorded
 * passing run. §54 says "never inflate scores"; this makes inflating one require lying to
 * a gate rather than editing a table.
 *
 * AND THE FUNCTION ITSELF IS BOUNDED, which it was not at first. This paragraph originally
 * ended at the line above, and a plant disproved it immediately: changing SPECIFIED from 1
 * to 3 in the map below moved the product's mean from 1.4 to 2.9 and no gate objected. A
 * function whose definition can be edited is a column with extra steps. checkaudit.js now
 * bounds every entry in SCORE_OF by what the registry ladder demands of that rung — a rung
 * needing no file on disk cannot score above 1, a rung needing no recorded run cannot score
 * above 3, and only PRODUCTION-READY may reach 5 — so the map cannot be loosened without
 * loosening the ladder, which has gates of its own.
 *
 * WHAT THE QUEUE DELIBERATELY DOES NOT CARRY
 * No estimate in days. I have no basis for one — no velocity from this project, no
 * comparable delivered, and inventing "3 days" would be the same class of statement as the
 * archive figures I got wrong twice. Complexity is carried instead, as S/M/L with the
 * reason it is that size, which is a judgement I can actually defend.
 */

const REGISTRY = require('./registry.js');

/* ── §54 · the 0–5 scale, as a translation of the gated rung ───────────────── */
const SCALE = [
  [0, 'absent'],
  [1, 'concept or specification only'],
  [2, 'partial implementation'],
  [3, 'implemented but weakly verified'],
  [4, 'tested and verified'],
  [5, 'production-grade'],
];

/* Each rung maps to one score, and the mapping is argued rather than asserted. */
const SCORE_OF = {
  'NOT STARTED': 0,
  'BLOCKED': 0,
  'SPECIFIED': 1,
  'DESIGNED': 1,
  /* 3, not 2. These run and carry their own self-tests — that is more than "partial".
     But those tests are outside `npm test`, so nothing would notice them breaking, which
     is precisely what "weakly verified" describes. */
  'IMPLEMENTED': 3,
  'TESTED': 4,
  'VERIFIED': 4,
  'PRODUCTION-READY': 5,
  /* Withdrawn on purpose. It scores 0 because it contributes nothing to what the
     product can do today, and it is scored rather than skipped for the same reason
     BLOCKED is: a total that quietly omits rows is a flattering total. */
  'DEPRECATED': 0,
};

const SCORE_WHY = {
  0: 'Nothing exists, or nothing can proceed. BLOCKED scores 0 rather than being left out ' +
    'of the average: an average that quietly skips what cannot be built is flattering.',
  1: 'Written down in a register a person can read, and not standing up. This is where 98 ' +
    'of 113 apps sit, and calling it 1 rather than 2 is the honest reading of a document.',
  3: 'Runs, and carries its own self-tests — more than partial. Those tests sit outside ' +
    '`npm test`, so nothing would notice them breaking, which is what weakly verified means.',
  4: 'A test drives it, it passes, it runs inside `npm test`, and that run is recorded in ' +
    'the evidence log with exit 0. Not 5: 5 needs a deployment nothing here has had.',
  5: 'Deployed and running for real. Nothing in this project is here.',
};

/* ── §55 · one maturity level for the whole product ────────────────────────── */
const LEVELS = [
  [0, 'Idea'], [1, 'Specification'], [2, 'Architecture'], [3, 'Prototype'],
  [4, 'Functional'], [5, 'Tested'], [6, 'Verified'], [7, 'Production'],
  [8, 'Scaled'], [9, 'Mature ecosystem'],
];

const MATURITY = {
  level: 3,
  name: 'Prototype',
  because:
    'Two slices — stock movement and a posted sale — run on the real database inside ' +
    'row-level security, with tests in the gated suite and recorded passing runs. Sixteen ' +
    'more open in a browser over an in-page store. Everything else is a specification. ' +
    'Individually, those two slices have reached level 5; the product has not, because a ' +
    'product’s level is not the best thing in it.',
  /* THE PART THAT MAKES A LEVEL A MEASUREMENT RATHER THAN A MOOD. */
  next_level_needs:
    'Level 4, Functional, would mean a business could run a real day of its work end to ' +
    'end in this system. It cannot: nothing purchases, nothing manufactures, nothing pays ' +
    'anybody, and nothing closes a period. The nearest honest test is one working day — ' +
    'buy something, receive it, make something from it, sell it, ship it, and see all four ' +
    'in the ledger — with every step on the real database. Not one of those five steps ' +
    'exists today beyond the selling.',
  /* NO NUMBER IN THIS SENTENCE, on purpose. It used to read "3,152 lines of product code",
     typed, while the current-state audit derived 3,164 from the files in the same document —
     two numbers for one subject, one page apart, which is the drift every register in this
     project exists to stop. The sentence's whole point is that the figure does not matter,
     so carrying one was self-defeating as well as wrong. */
  not_measured_by:
    'Not by code volume. The number of lines of product code is neither evidence for this ' +
    'level nor against it, and a rewrite that halved it would change nothing here. The ' +
    'current-state audit counts it because a reader asks; nothing in this level rests on it.',
};

/* ── §51 · the build queue, as vertical slices ─────────────────────────────── */
const RISKS = ['LOW', 'MEDIUM', 'HIGH'];
const SIZES = ['S', 'M', 'L'];

/* `requirements` name rows in the requirements registry — checkaudit.js resolves each one
   and fails on an id that does not exist, so a task cannot cite work nobody registered.
   `depends_on` names other task ids here. */
const QUEUE = [
  {
    id: 'Q01',
    title: 'Put the sixteen browser apps inside the gated suite',
    capability: 'Regression safety for work already done',
    requirements: ['CAP-CI'],
    depends_on: [],
    risk: 'LOW', size: 'S',
    risk_why: 'Adds a check to an existing pipeline; changes no product behaviour. The ' +
      'realistic bad outcome is that it goes red on day one, which is the point.',
    size_why: 'One script already exists (build_deep.js, check_deep.js) and already ' +
      'passes when run by hand. The work is wiring and whatever it turns out those two ' +
      'find once they must pass every time.',
    why_first:
      'Sixteen apps are at score 3 solely because their tests are not gated. This is the ' +
      'only task in the queue that raises real scores without writing a feature, and it ' +
      'protects everything built after it. Left undone, every later slice is built on ' +
      'sixteen things nothing is watching.',
    acceptance: [
      '`npm test` runs build_deep.js and check_deep.js and fails when either does',
      'a deliberately broken control in one app turns the suite red, proven before green',
      'the run is recorded through tools/evidence.js at exit 0',
      'registry.js raises those apps only after that recorded run exists',
    ],
    tests: 'The existing per-app self-tests and the click-through audit, unchanged — the ' +
      'work is making them mandatory, not writing new ones.',
    verification: 'checkregistry.js refuses the raised rung until the command appears in ' +
      'EVIDENCE.md at exit 0, so this cannot be marked done by editing a register.',
    evidence: 'A V-DEEP entry in docs/verification/EVIDENCE.md.',
    blockers: [],
    files: ['package.json', 'brand/site/registry.js', 'docs/verification/EVIDENCE.md'],
  },
  {
    id: 'Q02',
    title: 'Purchase order to goods receipt, on the real database',
    capability: 'Buying — the first half of the working day that does not exist',
    requirements: ['APP-07-01', 'APP-07-02', 'APP-03-01'],
    depends_on: ['Q01'],
    risk: 'MEDIUM', size: 'L',
    risk_why: 'It writes to stock, which is the number every other module reads. A receipt ' +
      'that posts twice or posts outside its company is the most expensive defect ' +
      'available in this system.',
    size_why: 'A new server module, two screens, the vendor record behind them, and the ' +
      'ledger posting on receipt. Comparable to the sales slice, which was the largest ' +
      'piece of work done so far.',
    why_first:
      'Stock and sales exist; nothing puts stock there. Until something does, every ' +
      'demonstration begins with a seeded quantity nobody bought, which is the shape of a ' +
      'demo rather than a system.',
    acceptance: [
      'a purchase order raised against a vendor, received in part, and received in full',
      'receiving increases stock at the receiving location and nowhere else',
      'the ledger entry balances and carries the company it belongs to',
      'a receipt against another company’s order is refused by the database, not the code',
      'a partial receipt leaves the order open with the right outstanding quantity',
    ],
    tests: 'medhava/test/purchase.test.js, each rule proven red before green, driven ' +
      'through a non-superuser role so the policies are live.',
    verification: '`npm run medhava` in the gated suite, recorded through evidence.js.',
    evidence: 'A recorded run, and the registry rows for Procurement and Vendor ' +
      'Management raised to TESTED by it.',
    blockers: [],
    files: ['medhava/server/purchase.js', 'medhava/test/purchase.test.js',
      'medhava/web/index.html', 'core/schema.postgres.sql', 'brand/site/registry.js'],
  },
  {
    id: 'Q03',
    title: 'One working day, end to end, as a single test',
    capability: 'The thing that decides whether this is level 4',
    requirements: ['APP-03-01', 'APP-05-01', 'APP-07-01'],
    depends_on: ['Q02'],
    risk: 'MEDIUM', size: 'M',
    risk_why: 'It will find the seams between modules that per-module tests cannot, which ' +
      'is what it is for. Expect it to fail first for real reasons.',
    size_why: 'No new feature — one test that drives what Q02 and the sales slice already ' +
      'built, plus whatever it exposes between them.',
    why_first:
      'The maturity level in this register names this exact test as the condition for ' +
      'level 4. Writing the condition down and never running it is how a level becomes a ' +
      'mood.',
    acceptance: [
      'buy, receive, sell, and see all of it in the ledger, in one test, one company',
      'stock returns to its opening figure when the same quantity is bought and sold',
      'the same run against a second company sees none of the first company’s rows',
    ],
    tests: 'medhava/test/day.test.js — a scenario, not a unit test.',
    verification: 'In `npm run medhava`, recorded. The maturity level in audit.js may ' +
      'only be raised to 4 in the same commit that adds this passing.',
    evidence: 'A recorded run, cited by the maturity level itself.',
    blockers: [],
    files: ['medhava/test/day.test.js', 'brand/site/audit.js'],
  },
  {
    id: 'Q04',
    title: 'A first deployment, and a smoke test that proves it answered',
    capability: 'CAP-DEPLOY — nothing has ever been installed anywhere',
    requirements: ['CAP-DEPLOY', 'CAP-MONITOR'],
    depends_on: ['Q03'],
    risk: 'HIGH', size: 'M',
    risk_why: 'Everything about production is untested here: no server has run this, no ' +
      'certificate has been issued, no backup has been restored. The runbook has never ' +
      'been followed by anybody.',
    size_why: 'The runbook, the nginx blocks and the systemd unit are written. The work is ' +
      'doing it once for real and fixing what the writing got wrong.',
    why_first:
      'Deployment blocks monitoring, blocks any production-readiness claim, and is the ' +
      'single largest gap between what this project describes and what it is. It is placed ' +
      'after Q03 because deploying something that cannot do a day’s work is a demonstration.',
    acceptance: [
      'the product runs on a machine that is not a developer’s',
      'a smoke test hits the running instance and asserts a real response, from outside it',
      'the database role there is neither superuser nor table owner — checked on that box',
      'a restore from backup is performed once and the restored data checked',
    ],
    tests: 'A smoke test run against the deployed URL, not against localhost.',
    verification: 'Recorded through evidence.js from a machine that can reach it.',
    evidence: 'A recorded run naming the host, and the registry row raised only then.',
    blockers: [
      'Needs a server, a domain and credentials, none of which exist and none of which ' +
      'this repository may ever hold. This task cannot start inside this environment: the ' +
      'egress proxy refuses everything but package registries and GitHub.',
    ],
    files: ['DEPLOYMENT.md', 'deploy/', 'brand/site/registry.js'],
  },
  {
    id: 'Q05',
    title: 'Write down who the attacker is, then test as them',
    capability: 'CAP-THREATMODEL — isolation is proven against an honest client only',
    requirements: ['CAP-THREATMODEL', 'CAP-ISOLATION'],
    depends_on: ['Q01'],
    risk: 'HIGH', size: 'M',
    risk_why: 'Not that the work is hard, but that its findings will be. A first ' +
      'adversarial pass against a system nobody has attacked usually finds something.',
    size_why: 'A threat model document from the registers that already exist, and a test ' +
      'file that tries the things it names.',
    why_first:
      'Every isolation test here drives the system the way it is meant to be driven. That ' +
      'proves the policy is switched on; it does not prove it cannot be got around. The ' +
      'strongest claim in this repository currently rests on tests that never try.',
    acceptance: [
      'a written threat model naming who, what they want, and what they can already reach',
      'a test that attempts a cross-company read by every route the API exposes',
      'a test that confirms the app role cannot disable a policy, and fails if it can',
      'every attempt is refused, and each refusal names the rule that refused it',
    ],
    tests: 'medhava/test/adversarial.test.js.',
    verification: 'In the gated suite, recorded. Red first: temporarily grant the app role ' +
      'ownership and confirm the suite goes red, then take it back.',
    evidence: 'A recorded run, plus the red-first result written into the commit.',
    blockers: [],
    files: ['THREAT_MODEL.md', 'medhava/test/adversarial.test.js'],
  },
  {
    id: 'Q06',
    title: 'A shift rota, and attendance measured against it',
    capability: 'The clearest NO APP finding against a competitor’s named product',
    requirements: ['APP-16-01'],
    depends_on: ['Q01'],
    risk: 'LOW', size: 'M',
    risk_why: 'Self-contained. It reads the roster and writes a schedule; nothing ' +
      'downstream depends on it yet.',
    size_why: 'A new record type, a screen to build the rota on, and the join to ' +
      'attendance that gives it its point.',
    why_first:
      'Attendance is captured and there is no schedule to measure it against, so "late" ' +
      'and "absent" have no definition in the system. It is the one NO APP row that is ' +
      'already half-built by something else here.',
    acceptance: [
      'a rota published for a week, per person, per unit',
      'attendance compared to the rota produces late, absent and unplanned-present',
      'changing a published rota keeps the old one, effective-dated, and never overwrites',
    ],
    tests: 'Per-rule tests, red before green.',
    verification: 'In the gated suite, recorded.',
    evidence: 'A recorded run of the gated suite, and the Staff & Contractors row raised ' +
      'only by it. Until then this is the largest NO APP row still open.',
    blockers: [],
    files: ['medhava/server/roster.js', 'medhava/test/roster.test.js',
      'core/schema.postgres.sql'],
  },
  {
    id: 'Q07',
    title: 'A query engine behind the report builder',
    capability: 'CAP-ANALYTICS — the dashboards compute over an in-page store',
    requirements: ['CAP-ANALYTICS', 'APP-21-01', 'APP-21-02'],
    depends_on: ['Q02'],
    risk: 'MEDIUM', size: 'L',
    risk_why: 'A reporting layer that can read across companies is the fastest way to ' +
      'defeat the isolation everything else here rests on. It must run as the same ' +
      'restricted role as everything else, with no exception.',
    size_why: 'A query builder, its safety boundary, and rewiring two existing screens ' +
      'onto it.',
    why_first:
      'The dashboards are the most convincing thing in the repository to look at and the ' +
      'least connected to anything. Every figure on them today is computed from data the ' +
      'page itself holds.',
    acceptance: [
      'a report defined once and run against the real database',
      'the same report run by two companies returns each company’s own figures only',
      'no report can be written that reads a row its runner could not read directly',
      'a group figure is the sum minus inter-company trade, as core.test.js already proves',
    ],
    tests: 'Including an attempt to write a cross-company report, which must be refused.',
    verification: 'In the gated suite, recorded.',
    evidence: 'A recorded run that includes the refused cross-company report, because the ' +
      'refusal is the part worth having on record.',
    blockers: [],
    files: ['medhava/server/reports.js', 'medhava/test/reports.test.js'],
  },
  {
    id: 'Q08',
    title: 'Behaviour at a volume nobody has tried',
    capability: 'CAP-SCALE — every test here runs on a handful of rows',
    requirements: ['CAP-SCALE'],
    depends_on: ['Q02', 'Q07'],
    risk: 'MEDIUM', size: 'M',
    /* "not at a million" was the natural phrasing and is avoided on purpose: the trade
       denylist matches a word PREFIX, so `mill` — a textile mill — matches "million", and
       this sentence tripped a neutrality scan of the generated document. The denylist is
       deliberately aggressive because a missed trade word in the product edition is
       expensive and a false positive is not, so the sentence moves rather than the gate. */
    risk_why: 'The likely finding is that some query is fine at ten rows and not at ' +
      'production volume. Better found here than by a business at month end.',
    size_why: 'A generator for realistic volume, and the measurements. No feature.',
    why_first:
      'Nothing in this repository supports any statement about speed, and the schema has ' +
      '151 tables with row-level security on all of them — which is exactly the shape ' +
      'where a missing index is invisible until it is not.',
    acceptance: [
      'a stated volume per table that a real business of this size would reach in a year',
      'the working-day scenario run at that volume, with times recorded',
      'every query plan for the slowest ten reviewed, and each index added named',
    ],
    tests: 'A load scenario, not part of `npm test` — it is too slow — but recorded.',
    verification: 'Recorded through evidence.js with the volumes in the entry.',
    evidence: 'A recorded run carrying the numbers, so a later claim about speed has ' +
      'something to disagree with.',
    blockers: [],
    files: ['medhava/test/volume.test.js'],
  },
];

/* ── the register's own checks ─────────────────────────────────────────────── */
function check() {
  const bad = [];
  const ids = new Set();
  const registryIds = new Set(REGISTRY.rows(require('./modules.js')).map((r) => r.id));

  if (!Object.prototype.hasOwnProperty.call(SCORE_OF, 'NOT STARTED')) {
    bad.push('the score map does not cover every rung on the registry ladder');
  }
  REGISTRY.STATUSES.forEach((s) => {
    if (!Object.prototype.hasOwnProperty.call(SCORE_OF, s)) {
      bad.push(`the rung ${s} has no score. A rung nobody scored is a row missing from ` +
        `every total, and the total looks fine.`);
    }
  });

  const lvl = LEVELS.find((l) => l[0] === MATURITY.level);
  if (!lvl) bad.push(`maturity level ${MATURITY.level} is not on the scale`);
  else if (lvl[1] !== MATURITY.name) {
    bad.push(`maturity level ${MATURITY.level} is "${lvl[1]}", not "${MATURITY.name}"`);
  }
  ['because', 'next_level_needs', 'not_measured_by'].forEach((k) => {
    if (!MATURITY[k] || MATURITY[k].length < 60) {
      bad.push(`the maturity level states no ${k}. A level with no argument and no stated ` +
        `next condition is a mood, not a measurement.`);
    }
  });

  QUEUE.forEach((t, i) => {
    const at = `${t.id || `task ${i + 1}`}`;
    if (!/^Q\d\d$/.test(t.id || '')) bad.push(`${at} has no id of the form Q01`);
    if (ids.has(t.id)) bad.push(`${at} is used twice`);
    ids.add(t.id);

    ['title', 'capability', 'risk_why', 'size_why', 'why_first', 'tests',
      'verification', 'evidence'].forEach((k) => {
      if (!t[k] || String(t[k]).length < 20) {
        bad.push(`${at} has no ${k}, or one too short to be one`);
      }
    });
    if (!RISKS.includes(t.risk)) bad.push(`${at} carries risk "${t.risk}"`);
    if (!SIZES.includes(t.size)) bad.push(`${at} carries size "${t.size}"`);
    if (!(t.acceptance || []).length) bad.push(`${at} states no acceptance criteria`);
    if ((t.acceptance || []).some((a) => a.length < 15)) {
      bad.push(`${at} has an acceptance criterion too short to check anything`);
    }
    if (!(t.files || []).length) bad.push(`${at} names no file it expects to change`);
    if (!(t.requirements || []).length) {
      bad.push(`${at} cites no requirement. A task that satisfies nothing registered is ` +
        `work somebody decided to do rather than work that was asked for.`);
    }
    (t.requirements || []).forEach((r) => {
      if (!registryIds.has(r)) {
        bad.push(`${at} cites requirement ${r}, which is not a row in the requirements ` +
          `registry.`);
      }
    });
    (t.depends_on || []).forEach((d) => {
      if (!QUEUE.some((x) => x.id === d)) {
        bad.push(`${at} depends on ${d}, which is not a task in this queue`);
      }
      if (d >= t.id) {
        bad.push(`${at} depends on ${d}, which comes after it. A queue whose dependencies ` +
          `point forwards is not an order.`);
      }
    });
    /* §51, verbatim: never make a task "build entire ERP". */
    if (/\b(entire|whole|all)\s+(erp|system|product|platform)\b/i.test(t.title)) {
      bad.push(`${at} is titled "${t.title}", which is not a task. §51 forbids it by name.`);
    }
  });
  return bad;
}

/* Score a set of registry rows. Returns the distribution and the mean, and the mean is
   reported to one decimal because two would be a precision this input does not have. */
function score(rows) {
  const dist = {};
  SCALE.forEach(([n]) => { dist[n] = 0; });
  rows.forEach((r) => { dist[SCORE_OF[r.status]] += 1; });
  const total = rows.reduce((s, r) => s + SCORE_OF[r.status], 0);
  return { dist, total, mean: Math.round((total / rows.length) * 10) / 10, n: rows.length };
}

module.exports = {
  SCALE, SCORE_OF, SCORE_WHY, LEVELS, MATURITY, QUEUE, RISKS, SIZES, check, score,
};
