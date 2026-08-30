'use strict';
/* THE TEN STAGES — idea to launch, and what each one owes.
 *
 * WHAT THIS FILE IS FOR
 * The owner asked for one document per edition carrying the whole life of the product:
 * Idea, Product architecture, Design, Development, Infrastructure, Security, Testing,
 * Deployment, Monitoring, Launch. Eight of those already had material spread across
 * architect.js, guide.js, stack.js, shots.js, rules.js and DEPLOYMENT.md. Two did not.
 *
 * SO THIS HOLDS ONLY WHAT IS NOT DERIVABLE ELSEWHERE.
 * Every stage names the register it pulls from in `from`, and mkroadmap.js reads that
 * register at generation time rather than restating it here. Where a stage genuinely has
 * no register — the Idea, and the two that were missing — the prose lives here and
 * nowhere else, so there is exactly one copy of it.
 *
 * WHAT A STAGE OWES
 *   id       short key, used by the generator
 *   title    the stage as the owner named it
 *   what     what this stage actually is, in a paragraph a business owner can read
 *   owes     the concrete things that have to exist before the stage is finished
 *   done     how you know — the command, the test, or the artefact
 *   from     the registers this stage is rendered from, each of which must be a real file
 *   gap      what is NOT covered yet, stated plainly. Null when nothing is missing.
 *
 * `gap` IS NOT OPTIONAL DECORATION.
 * Two of these stages exist because a search across the whole repository for "monitor",
 * "alert", "launch" and "rollout" returned nothing at all. A roadmap that quietly filled
 * that in would have been the most confident-sounding part of the document and the least
 * true. Where a stage is thin, it says so, and checkroadmap.js refuses a stage whose
 * `gap` is a word rather than a sentence.
 *
 * Straight apostrophes read wrong in the PDF; use the typographic ’ in prose.
 */

const STAGES = [
  {
    id: 'idea',
    title: 'Idea',
    what:
`A business does not buy software. It buys the end of a particular daily aggravation, and
everything else is overhead it agrees to carry. So the idea is stated as the aggravation,
not as the product: a manufacturer selling through a shop, a website, several marketplaces
and a wholesale book keeps that business alive in a dozen spreadsheets and two WhatsApp
groups, and no two of them agree. Stock is a number somebody remembers. The tax return is
assembled by hand from files that were themselves assembled by hand. Nobody can say what a
finished item cost to make without an afternoon of work, and by then the answer has moved.

The system is one place where each of those facts is written once. Not a better
spreadsheet — a spreadsheet is a place to put a number, and the number is the easy part.
What is hard is the RULE around the number: who may change it, what happens to last
month’s books when they do, and what the system refuses to do when the number is wrong.

The product is that engine, sold to many businesses. A trade is a row of configuration
rather than a version of the software, because the moment one customer gets a branch in
the code the product has started to split, and in two years there are as many versions as
there are customers, each needing its own fix for the same bug.`,
    owes: [
      'The aggravation named in the customer’s own words, not the vendor’s',
      'What the business does today instead, and what that costs it',
      'The one thing that must be true for the product to be worth buying at all',
      'Who it is NOT for — a product for everybody is a product with no rules',
    ],
    done:
`Somebody who runs a business of this kind reads the first page and recognises their own
week in it. That is not a test a machine can run, and this document does not pretend
otherwise.`,
    from: [],
    gap: null,
  },

  {
    id: 'architecture',
    title: 'Product architecture',
    what:
`The shape of the thing, and the arguments for that shape. One database with the isolation
enforced by the database itself rather than by application code; one set of tables that
every trade shares; configuration as data rather than as forks; money as whole paise
because a decimal loses a rupee somewhere and never says where.

The part worth reading is not the decision but what would make it wrong. A design argued
only in its own favour is a sales document. Every decision in the architect register
carries a "wrong if" — the condition under which it should be revisited — and the
register’s own checker refuses a section that has none.`,
    owes: [
      'Every structural decision, with what would make it wrong',
      'The layers, what each is built on, and what could replace it',
      'What is shared between businesses and what is theirs alone',
      'The guarantees a trade configuration may never switch off',
    ],
    done:
`node brand/site/checkstack.js --summary — every layer has a default, at least two named
alternatives and an interface. No capability may depend on one product.`,
    from: ['brand/site/architect.js', 'brand/site/stack.js', 'brand/site/dynamic.js'],
    gap: null,
  },

  {
    id: 'design',
    title: 'Design',
    what:
`What a person actually sees, column by column. A screen specification here is not a
picture — it is the columns on the table, the rows that appear in it, and the buttons that
act on them, written down so the built screen can be compared against something.

The screens are specified per module rather than per app, and there are fewer of them than
there are apps. That is stated rather than smoothed over: a module with a screen has one
worked example of what its apps look like, and a module without one has a description and
no picture.`,
    owes: [
      'The columns, rows and controls of each specified screen',
      'One renderer, so a screenshot in a document is the website’s own screen',
      'The words each trade uses, as an overlay that may change vocabulary and never shape',
      'Every technical word explained in plain language on first use',
    ],
    done:
`node brand/site/build.js — the edition overlay is applied and the structural shape compared
before and after. The build fails if a trade’s words changed a module number, an app name
or an app count.`,
    from: ['brand/site/shots.js', 'brand/site/uishot.js', 'brand/site/plainwords.js'],
    gap: null,
  },

  {
    id: 'development',
    title: 'Development',
    what:
`Building it, module by module, in the order the modules are numbered. A module is not
finished when its screens exist — screens can be demonstrated. It is finished when its
rules hold and a test proves each one.

That is why the rulebook is the spine of this stage rather than an appendix to it. Every
rule states what the system does AND what it refuses to do instead, because the refusal is
the half a business relies on when nobody is watching.`,
    owes: [
      'Every rule for the module, satisfied and proven',
      'A test that fails before the fix and passes after it',
      'No count, rate, threshold or name belonging to a customer compiled into the code',
      'The build order respected — the spine before anything that stands on it',
    ],
    done:
`npm test — every register gate and every engine check in one command. A rule marked
enforced must name a file that exists and a test string findable inside it.`,
    from: ['brand/site/guide.js', 'brand/site/rules.js', 'brand/site/modules.js'],
    gap: null,
  },

  {
    id: 'infrastructure',
    title: 'Infrastructure',
    what:
`What it runs on, and what it would take to run on something else. Each layer names a
default, at least two alternatives, and the interface everything above it talks to — so
the promise “you are not locked in” is a sentence with a table behind it rather than a
digit with nothing behind it.

Free options come first, and a paid tool has to name both the free option it replaces and
the trigger that justifies the spend. A tool register with no free column is a shopping
list.`,
    owes: [
      'Every layer with its default, its alternatives and its interface',
      'The switching cost of each, stated rather than implied',
      'A free option named for every capability',
      'Any paid tool naming what it replaces and when it becomes worth it',
    ],
    done:
`node brand/site/checkstack.js --summary and node brand/site/checktools.js --summary —
19 layers with their swaps, and every paid tool naming its free option and its trigger.`,
    from: ['brand/site/stack.js', 'brand/site/tools.js', 'DEPLOYMENT.md'],
    gap: null,
  },

  {
    id: 'security',
    title: 'Security',
    what:
`The isolation is in the database, not in the application. Row-level security means one
business physically cannot read another’s records even when the code above has a bug — and
the check that matters is not that policies exist but that the connecting role is subject
to them. A superuser bypasses every policy, force or no force, so a system whose
application connects as its owner has policies that are decoration.

That is proven by loading the schema into a real PostgreSQL and asking for one company’s
rows as three different roles. Two of the three see everything.

The promises that follow are absolute rather than configurable: the system never asks for a
marketplace, bank or account password; personal and banking details are read into memory
for a computation and never written into a file the code repository can see; keys are
entered at runtime and never committed.`,
    owes: [
      'Isolation enforced by the database, with the application role neither superuser nor owner',
      'An audit row for every change, carrying what it was as well as what it became',
      'No credential, key or personal detail in any committed file',
      'A trade configuration that may never switch off a guarantee',
    ],
    done:
`node core/tests/live.test.js — the schema RUN, not read: real PostgreSQL, real policies,
and the app role proven to be neither superuser nor table owner.`,
    from: ['core/schema.postgres.sql', 'brand/site/rules.js', 'DEPLOYMENT.md'],
    gap: null,
  },

  {
    id: 'testing',
    title: 'Testing',
    what:
`A gate only checks what somebody thought to ask it, so the question here is not “do the
tests pass” but “would they fail”. Every check in this repository is proven by planting the
failure it is supposed to catch and confirming it fires. A plant that fires nothing means
the check is decoration, and several were rewritten after exactly that.

The registers are checked as hard as the code. A rule may not claim a proof it does not
have; a document may not use a technical word it never explains; a delivered PDF may not
be older than the file it was rendered from; a count may not be typed where it could be
derived.`,
    owes: [
      'Every check proven red before it is trusted green',
      'The negative control — a test that can fail, demonstrated failing',
      'Registers gated as strictly as code',
      'Counts derived at generation time, never typed',
    ],
    done:
`npm test exits 0, and each gate has a documented plant that makes it exit non-zero.`,
    from: ['brand/site/checkrules.js', 'brand/site/checkcoverage.js', 'core/tests/core.test.js'],
    gap: null,
  },

  {
    id: 'deployment',
    title: 'Deployment',
    what:
`From an empty machine to a running system: the database and its three roles, the schema
applied as ordered migrations that are never edited once applied, the application service,
the web server in front of it, certificates, and the automatic checks that run on every
change.

Migrations are the part people get wrong twice. Once by editing an applied migration, which
makes two installations diverge silently; once by having no way to roll one back.`,
    owes: [
      'Ordered migrations, never edited after they are applied',
      'Three database roles: owner, policy subject, and the application’s own',
      'The service, the web server in front of it, and certificates',
      'Automatic checks on every change, running the same suite a person runs',
    ],
    done:
`DEPLOYMENT.md followed end to end on a clean machine, and the deployed system passing the
same npm test the developer ran.`,
    from: ['DEPLOYMENT.md', 'brand/site/guide.js'],
    gap: null,
  },

  {
    id: 'monitoring',
    title: 'Monitoring',
    what:
`A system with no monitoring does not fail loudly. It fails on a Sunday, and the business
finds out on Monday from a customer.

So what is watched is written down, each signal with the level that counts as trouble and
the name of the person it wakes: disk left, error rate, queue depth, response time, failed
sign-ins, and the age of the last successful backup. An alert carries the signal, the
value, the level it passed and the first step to take — paging somebody with a number and
no instruction turns every incident into a research project starting from zero at three in
the morning.

And the backup rule, which is the one that costs the most when it is skipped: a backup is
not a backup until it has been restored. Counting a job that exited zero as protection is
how a business discovers on the worst day of its life that it has been writing an empty
file nightly.`,
    owes: [
      'Each watched signal with its level and the person it wakes',
      'Alerts that name the first step, not just the number',
      'A restore drill on a stated interval, comparing row counts against the source',
      'An audit retention period read from configuration rather than assumed',
    ],
    done:
`The restore drill runs on its interval and the restored row counts match the source. That
drill is not yet written — see the gap below.`,
    from: ['brand/site/stack.js', 'brand/site/rules.js'],
    gap:
`This stage was empty until now. A search across the rulebook, the build guide, the
architect document and the deployment runbook returned zero matches for “monitor”,
“alert”, “launch” and “rollout”; the whole of it was one stack layer called Watching it and
a backup section in the runbook. The rules are written and numbered now, and all of them
are SPECIFIED rather than ENFORCED: nothing here is proven by a test yet. The highest-value
next piece of work in this stage is the restore drill, because it is the one rule that can
be made real with a script rather than a decision.`,
  },

  {
    id: 'launch',
    title: 'Launch',
    what:
`Going live is a sequence, not a date. The old numbers and the new ones have to agree
before anybody stops using the old way: totals, row counts and opening balances compared
against the source, and every difference explained rather than waved through. A difference
that was noticed and accepted becomes a figure somebody has to defend later with no record
of where it came from.

Then both run at once over the same period and their outputs are compared, and the old way
is retired only when they agree — a cutover on a date rather than on evidence makes the
first real disagreement a production incident instead of a finding.

And the way back is written down and practised on a copy before it is needed, including
what happens to records created after the release. A rollback plan that was written and
never run is a plan in the same sense as an untested backup: believed until the one moment
it has to work.`,
    owes: [
      'A reconciled migration — every difference against the old system explained',
      'A parallel run, with both outputs compared over the same period',
      'A cutover decided by evidence rather than by a date',
      'A rollback rehearsed on a copy, including records created after the release',
    ],
    done:
`The parallel run agrees, the reconciliation has no unexplained difference, and the rollback
has been performed once on a copy.`,
    from: ['brand/site/rules.js'],
    gap:
`Like monitoring, this stage did not exist in any register before now and the rules in it
are all SPECIFIED. Nothing here has been done for a real business yet, and the sequence
above is a design rather than a report. The tenant’s own build guide carries an ordered
setup path from signing up to running live, which is the nearest thing to a rehearsal that
exists today.`,
  },
];

/* ── the checker, so a stage cannot decay into a heading ───────────────────── */
function check() {
  const bad = [];
  const ids = new Set();
  STAGES.forEach((s, i) => {
    const where = s.id || `stage #${i + 1}`;
    ['id', 'title', 'what', 'done'].forEach((k) => {
      if (!s[k] || !String(s[k]).trim()) bad.push(`${where}: missing "${k}"`);
    });
    if (ids.has(s.id)) bad.push(`${s.id}: duplicate id`);
    ids.add(s.id);

    if (!Array.isArray(s.owes) || s.owes.length < 3) {
      bad.push(`${where}: owes ${(s.owes || []).length} thing(s). A stage that owes fewer ` +
        `than three is a heading with a sentence under it.`);
    }
    if (String(s.what || '').length < 300) {
      bad.push(`${where}: "what" is ${String(s.what || '').length} chars. The owner asked ` +
        `for complete detail, not one-line theorems.`);
    }
    /* A gap of null is a claim: nothing is missing here. A gap of "TODO" is worse than
       either, so it has to be a real sentence or genuinely absent. */
    if (s.gap !== null && String(s.gap).trim().length < 120) {
      bad.push(`${where}: gap must be null — meaning nothing is missing — or a real ` +
        `explanation. A word here reads like an admission and tells nobody anything.`);
    }
    if (!Array.isArray(s.from)) bad.push(`${where}: "from" must be an array, even if empty`);

    ['what', 'done', 'gap'].forEach((k) => {
      if (s[k] && /[a-z]'[a-z]/i.test(s[k])) {
        bad.push(`${where}: straight apostrophe in "${k}" — use ’`);
      }
    });
  });
  return bad;
}

module.exports = { STAGES, check };
