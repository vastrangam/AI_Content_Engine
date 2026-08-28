'use strict';
/* THE TWO SKILLS, AS DATA.
 *
 *   brand/delivery/website/mkskills.js  →  MEDHAVA_BOS.SKILL.md
 *                                          VASTRANGAM_TENANT.SKILL.md
 *
 * WHAT A SKILL IS FOR HERE
 * An agent — Claude Code, Codex, anything that reads a repository and writes code — opens one of
 * these and can start. One says build the platform from nothing. The other says set a business up
 * on it and run it. Neither restates the documents; each says which document answers which
 * question, in what order to read them, and what to do at the two moments an agent is most likely
 * to go wrong: when a value it needs is missing, and when a check it wrote has never failed.
 *
 * WHY THIS IS DATA AND NOT TWO MARKDOWN FILES
 * A skill saying "22 modules · 113 apps" is stale the day the list moves, and in this repository
 * that list has already moved twice. Every figure in the output is read from its canonical source
 * at generation time, the same as every other document here.
 *
 * WHY EVERY PATH AND EVERY COMMAND IS CHECKED
 * The failure mode of a skill is not being wrong — it is being confidently specific about a file
 * that does not exist. An agent following it wastes its first ten minutes on a path nobody
 * checked, and there is nothing in the output to tell it the fault is not its own. So mkskills.js
 * refuses to write a skill naming a file that is not there or a command that will not run.
 *
 * THE FAIRNESS POINT
 * Both agents get the same file. If the skill leaves something to interpretation, the two builds
 * differ for a reason that has nothing to do with either agent, and the comparison measures the
 * skill instead of the agents. So every phase owes a check that decides it, and the checks are
 * commands rather than judgements.
 *
 * Straight apostrophes read wrong in the PDF; use the typographic ’ in prose.
 */

/* ── the platform ─────────────────────────────────────────────────────────── */

const MEDHAVA = {
  file: 'MEDHAVA_BOS.SKILL.md',
  edition: 'MEDHAVA',
  name: 'medhava-bos',
  title: 'Medhava BOS — build the platform from zero',
  description:
    'Use when building the Medhava Business Operating System from nothing — a multi-tenant ' +
    'platform where many unrelated businesses run on one codebase, each seeing only its own ' +
    'records and each seeing them in its own words. Triggers on requests to build, scaffold, ' +
    'implement or continue the platform, its database, its tenancy and company isolation, its ' +
    'industry packs, or any of its numbered modules. Read MEDHAVA_ARCHITECT.md before making any ' +
    'design decision and MEDHAVA_BUILD_GUIDE.md before typing any command. Do not use for setting ' +
    /* Named generically on purpose. This is the PRODUCT's skill, and it used to point at one
       specific customer's file by name — which reads to an agent as though that customer were
       part of the platform. Each tenant ships its own setup skill inside its own archive. */
    'up one business ON the platform — each tenant ships its own setup skill for that.',

  what: `You are building a **platform**: one piece of software that many separate businesses use at
the same time, each seeing only its own information, each seeing it in its own words. A steel plant,
a clothing manufacturer, a school and one person selling courses, on the same code. That is the whole
design problem, and every decision below exists to serve it.

**The trap.** The moment a customer needs something different and the answer is "we will add a
setting for you", the software has started to fork, and in two years there are as many versions as
customers. The way out is decided before any code: **what differs between businesses is data, not
code** — their words, their steps, their extra fields, their documents, which parts they use at all.`,

  reading: [
    ['MEDHAVA_ARCHITECT.md', 'WHAT the system is and WHY each decision is the way it is — and, for every one, what would make it the wrong decision. Read this before you decide anything.'],
    ['MEDHAVA_BUILD_GUIDE.md', 'HOW each layer works, and then the ordered path from an empty machine to a deployed product with the command and the check for every stage. Read the last part before you type anything.'],
    ['MEDHAVA_PLAN_OF_ACTION.md', 'WHAT gets built, in what order, and all 285 rules the finished system must satisfy — each with what it will never do instead.'],
    ['Medhava_BOS.md', 'All four documents in one file, if you would rather hold one thing.'],
    ['DEPLOYMENT.md', 'The server runbook: putting it on a machine and keeping it there. Read it at the deployment stage, not before.'],
  ],

  sources: [
    ['brand/site/modules.js', 'the modules and their apps — the one canonical list. Never type a count from it; read it.'],
    ['brand/site/rules.js', 'every rule the system must satisfy, each with what it will never do instead'],
    ['brand/site/stack.js', 'what each layer is built on, and the named alternatives behind one interface'],
    ['brand/site/dynamic.js', 'what a business changes without a developer, and the few things nobody may switch off'],
    ['brand/site/plainwords.js', 'every technical word, in plain language, with an everyday comparison'],
    ['brand/site/tools.js', 'the free-first register — a paid tool must name its free option and the trigger for paying'],
    ['core/schema.postgres.sql', 'the production schema. Read it before designing a table; most of them already exist here.'],
    ['core/packs.js', 'the industry pack engine — how a trade is configured as data'],
    ['core/tenant.js', 'what a business changed AFTER its pack, effective-dated and append-only'],
    ['core/partv.js', 'the tables Part V of the specification adds, and where each one landed'],
  ],

  order: [
    {
      n: 1,
      title: 'Read before you build',
      do: `Read MEDHAVA_ARCHITECT.md end to end, then the ordered path at the end of
MEDHAVA_BUILD_GUIDE.md. Then read \`core/schema.postgres.sql\`. Most of what you are about to design
has been designed; the fastest way to build the wrong thing is to start from the module list without
the argument underneath it.`,
      check: 'node brand/site/checkcoverage.js',
      done: 'You can say, without looking, why money is stored as whole paise and why the application connects as a role that is neither superuser nor table owner.',
    },
    {
      n: 2,
      title: 'The database, and the isolation that has to be proven',
      do: `Create the database and three roles — an owner, the role every policy names, and a login
role that inherits it and owns nothing. Apply the schema as numbered forward-only files. **Then make
the isolation test fail on purpose**: as the superuser it must return both companies, because a
superuser is never subject to a policy even when the table forces it. Only after seeing it red does a
green run mean anything.`,
      check: 'node core/tests/live.test.js',
      done: 'The schema runs in a real Postgres, one company cannot read another, and the test has been seen to fail as the wrong role.',
    },
    {
      n: 3,
      title: 'Money, and dates',
      do: `Every money column is a whole-number type in paise. Every value a business can change is a
dated row — the row in force is closed the day before and a new one appended, never overwritten. A
value asked for on a date no row covers is an **error**, never zero and never the nearest one.`,
      check: 'node core/tests/schema.test.js',
      done: 'No money column is a fraction, a future-dated row activates on its own day, a closed period returns what it returned at the time, and a date with no row raises.',
    },
    {
      n: 4,
      title: 'A trade is a row, not a fork',
      do: `Build the pack engine before the second customer, not after. A pack carries a trade’s
words, its stages, its extra fields, its documents and its starting reference data — and may never
contain executable code, invent a concept the engine does not have, extend a table that does not
exist, declare money as anything but integer paise, switch off an immutable rule, or be applied in
part.`,
      check: 'node core/tests/packs.test.js',
      done: 'Two unlike trades run on the same code, each in its own words, and configuring the second changed no source file.',
    },
    {
      n: 5,
      title: 'Companies and channels are rows, and so is their count',
      do: `A company is a row. A channel is a row. Every business record carries its company; every
sale also carries its channel. The group figure is the sum across companies **minus** what they sold
each other. Write no count of either into code — not in a constant, not in a type, not in a report.`,
      check: 'node core/tests/core.test.js',
      done: 'The books balance across a grid of companies and channels, no journal line points at another company’s account, and adding one more of either needs no code change.',
    },
    {
      n: 6,
      title: 'Nothing a business owns is compiled in',
      do: `Add the gate that refuses a count, a rate, a threshold, a shift or a person’s name written
into code, and **watch it go red** on a planted literal before trusting it. Structure may be
constant. A value somebody would ever want to change may not.`,
      check: 'node brand/site/checkstatic.js',
      done: 'The gate runs inside the one check command, it has been seen to fail on a planted literal, and every entry on its exempt list carries a written reason.',
    },
    {
      n: 7,
      title: 'The modules, in the order they are numbered',
      do: `Build them in the order \`brand/site/modules.js\` gives, which is dependency order: a
product exists before it is stock, a customer before a sale, stock before it moves, the books before
they close. **Do not reorder the list.** A module is finished when every rule the rulebook lists for
it passes by name — not when its screens exist.`,
      check: 'node brand/site/checkrules.js --summary',
      done: 'No module was started before the ones it reads from could supply real records, and none is called finished on the strength of its screens.',
    },
    {
      n: 8,
      title: 'Deploy, and then do one real transaction',
      do: `Follow DEPLOYMENT.md for the machine, the names, the certificates and the backups. Then
put one real order through to a posted, paid entry in the right company’s books — and sign in as a
different business and fail to find it. Not a refusal: **nothing found.**`,
      check: 'npm test',
      done: 'One genuine transaction has gone end to end, a second business on the same platform cannot see any trace of it, and going back to the previous release has been practised at least once.',
    },
  ],

  missing: `**Raise it. Never fill it in.**

If a rate, a threshold, a date or a name is not stated anywhere you can point at, the correct output
is a question naming exactly what is missing and what depends on it. Not zero, not the nearest value,
not a sensible default.

Zero is the dangerous answer because it looks like an answer: it posts cleanly, reconciles, and is
discovered by the person who was not paid. Every gate in this repository that could have caught a
guessed figure was written after one got through.`,

  never: [
    'Never type a count. Read `brand/site/modules.js`, `rules.js`, `stack.js` and the schema at the moment you need a number. Two counts in this repository went stale exactly this way.',
    'Never reorder something that is numbered. The module order is dependency order; a second opinion nobody asked for is not an improvement.',
    'Never hardcode a company count, a channel count, a rate, a threshold, a shift or a person’s name. Branch on a flag the record carries, never on who it is.',
    'Never let a check pass that has not first been made to fail. Isolation, money and the anti-hard-coding gate all fail silently, and a green that has never been red proves nothing.',
    'Never claim something is finished without naming the test that proves it, and never report a passing run you did not perform.',
    'Never commit a key, a token or a password — not once, not temporarily. A key committed once is in every copy of that history forever.',
    'Never ask anybody for a marketplace, bank or account password. Every outside connection uses a key the customer creates and can withdraw. That is a promise the product makes and it holds in the code.',
  ],
};

/* ── the tenant ───────────────────────────────────────────────────────────── */

const VASTRANGAM = {
  file: 'VASTRANGAM_TENANT.SKILL.md',
  edition: 'VASTRANGAM',
  name: 'vastrangam-tenant',
  title: 'Vastrangam — set the business up on the platform and run it',
  description:
    'Use when setting up or running Vastrangam as one business on the Medhava platform — its ' +
    'companies, its channels, its people and their five employment states, its products and set ' +
    'compositions, the making side and its rate cards, buying and the three-way match, selling ' +
    'and settlement, attendance, payroll, and the month end. Triggers on requests to onboard, ' +
    'configure, seed, or operate this tenant, or to implement or check any of its rules — ' +
    'attendance codes, pay computation, set completion, karigar costing, vendor matching, GST. ' +
    'Do not use for building the platform itself — that is MEDHAVA_BOS.SKILL.md.',

  what: `You are setting up **one business** on a platform you are not building. Nothing is installed.
Every value below is a row with a date, entered in the app, and the owner owns all of them.

**The rule that runs through everything.** Anything can be added, edited or removed at any moment and
it takes effect at once — and the past does not move, because every change carries the date it starts
from. A supervisor leaves on Tuesday, a replacement starts Wednesday, both recorded the same morning,
and last month’s payroll still comes out to the same rupee. *Purana record mitta nahin; naye date se
naya rule lagta hai.*

**So do not ask which values to freeze.** How many marketplaces, who is on this month’s roster, what
a set contains, what hours somebody works — every one of those is data the owner edits. Your job is
the structure that lets him.`,

  reading: [
    ['VASTRANGAM_BUILD_GUIDE.md', 'The ordered path: the half-hour before anybody opens a screen, then companies, channels, people, products, the making side, buying, selling, the first month end, live.'],
    ['VASTRANGAM_RULES_AND_LOGIC.md', 'The reference, by subject: every calculation, and all 285 rules each with what the system will never do instead.'],
    ['Vastrangam_Final_As_Tenant.md', 'Both of the above in one file.'],
    ['SPEC_CONFLICTS.md', 'The places the business’s own specification says two different things, quoted with line numbers and deliberately unresolved. Read it before you resolve one yourself.'],
  ],

  sources: [
    ['engine/fixtures/master.json', 'the roster, the employment spells, the pay bases and the shift groups — the seed data, where values are supposed to live'],
    ['engine/fixtures/karigar_units.json', 'the making units, their members, and the dates a unit split or closed'],
    ['engine/fixtures/set_types.json', 'what each set type contains, and which slots are optional'],
    ['engine/fixtures/locked_lists.json', 'the closed lists — the values a field may take'],
    ['engine/fixtures/garment_columns.json', 'the column layout of the business’s own files, matched by name so an inserted column does not break the read'],
    ['engine/vastrangam/pay.py', 'how a month’s pay is computed, per pay basis, across a financial-year boundary'],
    ['engine/vastrangam/attendance.py', 'the attendance codes, and the difference between paid and productive'],
    ['engine/vastrangam/karigar.py', 'the paying unit, the aliases, the weighting by quantity, and which period wins when two disagree'],
    ['engine/vastrangam/gates.py', 'what the engine refuses to do, and why each refusal is there'],
    ['engine/vastrangam/performance.py', 'the bands, and which months are allowed into the average'],
  ],

  order: [
    {
      n: 1,
      title: 'Read the conflicts before you resolve one',
      do: `Read SPEC_CONFLICTS.md first. The business’s own specification contradicts itself in
places, each quoted with its line numbers and left unresolved on purpose. If your work touches one,
**ask the owner** — a resolution invented here becomes a wrong figure in a real month.`,
      check: 'node brand/site/checkconflicts.js --summary',
      done: 'You know which questions are open, and you have not answered one on the owner’s behalf.',
    },
    {
      n: 2,
      title: 'Companies, channels, and the words',
      do: `Companies are the units that file, invoice and close their own books. Channels are every
route from a customer, each belonging to one company — two companies selling on the same marketplace
are two channels. **Assert no count of either anywhere.**`,
      check: 'node core/tests/core.test.js',
      done: 'Every company and every channel exists as a row, and nothing in any output states how many there are.',
    },
    {
      n: 3,
      title: 'People — five states, not two',
      do: `Working · on leave · inactive and can return · left · **on trial**. Trial is the
structural one: no joining date, no leaving date, no salary, because none of those happened. The
system must accept attendance and a payment for somebody with no employment spell at all; the payment
**is** the record, nothing is derived from it, and nothing raises "salary missing". Hours belong to
the person, not to a category of person.`,
      check: 'python3 engine/tests/selftest.py',
      done: 'Somebody on a month’s leave is not recorded as having left, somebody inactive returns on a new spell with the gap intact, and a trial person can be paid without an employment record.',
    },
    {
      n: 4,
      title: 'Products, and what a set actually contains',
      do: `A set is two or three pieces made separately that have to exist together before anything
can be sold. Record which slots are required and which are optional. Where the composition depends on
the combination rather than the type, record it that way and report both readings — do not pick one.`,
      check: 'node brand/site/checksets.js',
      done: 'Set completion is decided by the recorded composition, optional slots are expressible, and no set type is silently assumed to be three pieces.',
    },
    {
      n: 5,
      title: 'The making side',
      do: `Work goes to units and comes back as pieces, paid at the rate that applied on the day it
came back. A unit that was one last year and two this year is a **date**, not a contradiction: close
the joint unit on its last day and start the successors the next, so the earlier period stays pooled
and the later one splits. One person written four ways is one balance.`,
      check: 'python3 engine/tests/selftest.py',
      done: 'No month is covered by both a joint unit and its successors, every figure is recomputed from transaction rows rather than read off a total, and a design with no stated rate raises instead of paying nothing.',
    },
    {
      n: 6,
      title: 'Attendance, pay, and the first month end',
      do: `Run payroll first on a month already paid, so there is something to compare against. Where
the system disagrees with what was paid, **find the setting that produced it and correct that** — do
not adjust the figure. A payroll corrected by adjustment matches this month and is wrong again next
month, for a reason nobody remembers.`,
      check: 'python3 engine/tests/selftest.py',
      done: 'Every difference against a known month is explained by a setting, the setting was corrected rather than the number, and a month somebody was not employed is not averaged in as a bad month.',
    },
    {
      n: 7,
      title: 'Buying, selling, and closing',
      do: `Ordered, received, billed: a bill agreeing with both is payable without a conversation, and
one that does not says which of the three disagrees and by how much. On the selling side, a
marketplace settlement must break back down to the orders and the named deductions inside it. Then
close the period, and understand that a closed period not reopening casually is the feature.`,
      check: 'node core/tests/partv.test.js',
      done: 'A matched bill passes without intervention, a settlement reconciles to its orders, and the return produced from the transactions agrees with the books line for line.',
    },
    {
      n: 8,
      title: 'Check it against books somebody already knows the answer to',
      do: `The engine is checked by hundreds of tests that need no data at all, and those prove the
LOGIC. They do not prove it reproduces this business. Point the runner at the folder holding the
real workbooks and it wires up every source, runs the suite, and reports the figures back against
what the business already knows they should be.

**Read what it says it could NOT check.** A workbook missing means those figures were never
verified, and the runner exits non-zero and names them — because a suite reporting hundreds of
passes under a missing input is the sentence people remember and the one that misleads.`,
      check: 'npm run validate',
      done: 'The suite has run with the real workbooks wired in, every figure it reports has been compared against what the business knows to be true, and anything it could not check has been read rather than skipped past.',
    },
  ],

  missing: `**Raise it. Never fill it in.**

This business’s own records have gaps — a piece rate nobody stated, a joining date known only to the
month. The correct handling of each is to say so and keep it correctable:

- **A rate nobody stated is not zero.** Work coming back against a design with no rate on record
  raises, naming the design. A piece rate nobody set is a question, not an amount.
- **A date known to the month stays month-precision** and is marked approximate. Inventing the 1st
  produces a number that looks exact and is not, and nobody afterwards can tell which you did.
- **A month with nothing recorded is reported as nothing recorded**, never as zero, and never
  averaged into somebody’s performance as a bad month.`,

  never: [
    'Never name a person in logic. Branch on a flag the person carries — a pay basis, a shift group, a threshold — never on who they are.',
    'Never put a rate, a threshold, a shift or a roster count into code. They are rows with dates, and `brand/site/checkstatic.js` refuses them.',
    'Never overwrite a value. Close the row in force the day before and append the new one; the audit trail must not have a hole exactly where somebody would want one.',
    'Never resolve a specification conflict on the owner’s behalf. SPEC_CONFLICTS.md lists them with line numbers precisely so that they stay his to decide.',
    'Never read a figure off a total. Recompute from the transaction rows and use the source’s own totals only to check the answer — and where the two disagree, report the difference rather than reconciling it away.',
    'Never treat a state as its neighbour. On leave is not left, inactive is not left, and a trial is neither — it has no employment record at all.',
    'Never ask for or store a marketplace, bank or account password. The product’s promise is that it will never ask, and that holds in the conversation as well as in the code.',
  ],
};

const SKILLS = [MEDHAVA, VASTRANGAM];

module.exports = { SKILLS };

/* ── the gate on this file ────────────────────────────────────────────────── */
/* Shape only. Whether the paths and the commands are REAL is mkskills.js's job, because that
   needs the filesystem and this file is data. */
module.exports.check = function check() {
  const bad = [];
  const seen = new Set();
  for (const s of SKILLS) {
    if (!s.file || !s.name || !s.title) { bad.push(`a skill is missing file, name or title`); continue; }
    if (seen.has(s.name)) bad.push(`${s.name}: duplicate name`);
    seen.add(s.name);
    if (!/^[a-z][a-z0-9-]*$/.test(s.name)) bad.push(`${s.name}: a skill name is lowercase and hyphenated`);
    /* The description is what makes a skill get INVOKED. A vague one is a skill that never runs,
       which is indistinguishable from a skill that does not exist. */
    if (!s.description || s.description.length < 200) {
      bad.push(`${s.name}: the description is what decides whether this is invoked at all — say ` +
        `what it is for, what phrases trigger it, and what it is NOT for`);
    }
    if (!/Do not use for/i.test(s.description)) {
      bad.push(`${s.name}: the description does not say what it is NOT for. Two skills that do ` +
        `not each exclude the other will both fire on the same request.`);
    }
    if (!s.missing || !/never/i.test(s.missing)) {
      bad.push(`${s.name}: no rule for a missing value. That is the moment an agent invents one.`);
    }
    if (!(s.never || []).length) bad.push(`${s.name}: nothing it must never do`);
    if (!(s.order || []).length) bad.push(`${s.name}: no order to work in`);
    (s.order || []).forEach((p, i) => {
      if (p.n !== i + 1) bad.push(`${s.name} phase ${p.n}: out of order — phases run 1..n`);
      if (!p.title || !p.do) bad.push(`${s.name} phase ${p.n}: missing a title or an action`);
      if (!p.check) bad.push(`${s.name} phase ${p.n}: no command that decides it — a phase whose ` +
        `completion is a judgement makes two agents disagree for a reason that is not their fault`);
      if (!p.done) bad.push(`${s.name} phase ${p.n}: no "done when" — that makes it a suggestion`);
    });
    const prose = [s.what, s.missing, ...(s.never || []),
      ...(s.order || []).flatMap((p) => [p.do, p.done])].join(' ');
    if (/'/.test(prose)) bad.push(`${s.name}: straight apostrophe in prose — use the typographic ’`);
  }
  return bad;
};
