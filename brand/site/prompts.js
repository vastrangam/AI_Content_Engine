'use strict';
/* THE TWO MASTER BUILD PROMPTS, AS DATA.
 *
 *   brand/delivery/website/mkprompts.js  →  MEDHAVA_BOS_PROMPT.md
 *                                           VASTRANGAM_PROMPT.md
 *
 * WHAT THESE ARE, AND HOW THEY DIFFER FROM THE SKILLS
 * A skill is short and is invoked automatically when a request matches it. A prompt is long, and
 * it is what you PASTE at the start of a session to say what is being built and under what rules.
 * Both ship. They do not overlap: the skill says which document answers which question; the prompt
 * is the standing brief the whole build runs under.
 *
 * WHY THEY ARE GENERATED
 * The owner's own template ran to seventy-three sections of excellent generic engineering
 * discipline and named not one file in this repository. An agent reading it would rebuild the
 * 151-table schema it already has. So every count, every path and every command below is read
 * from source at generation time and checked to exist before the file is written — the same gate
 * mkskills.js uses, for the same reason: the failure mode of a build prompt is being confidently
 * specific about something that is not there.
 *
 * THE READER RUNS THIS LOCALLY.
 * The owner: "I will paste this in claude code which runs in my own computer first and I can check
 * in my chrome browser." So section 0 of each prompt gets something ON SCREEN before anything else
 * — a build that produces a page, and an app that serves one. A twenty-phase plan whose first
 * visible result arrives at phase twelve is a plan nobody finishes.
 */

/* ── what both prompts say, in one place ──────────────────────────────────── */
/* Two copies of "never invent a tax rate" is how two documents start disagreeing about what is
   forbidden. These are written once and rendered into both. */

const COMMON = {
  priorities: [
    'Business correctness',
    'Security',
    'Data integrity',
    'Architectural integrity',
    'Reliability',
    'Testability',
    'Maintainability',
    'Scalability',
    'Developer experience',
    'Performance',
    'User experience',
  ],

  missing: `**Do not invent it. Do not use zero. Do not use a default.**

If a rate, a threshold, a date, a tax percentage or a policy is not stated anywhere you can point
at, the correct output is a question naming exactly what is missing and what depends on it:

> **Missing:** the piece rate for X, from April
> **Why it matters:** every month of that year is unpayable without it
> **What depends on it:** payroll, cost per piece, the worker's running balance
> **Safe options:** raise and name the person, which is what the engine does today

**Zero is the dangerous answer, because it looks like an answer.** It posts cleanly, it
reconciles, and it is discovered by the person who was not paid. Every gate in this repository
that could have caught a guessed figure was written after one got through.`,

  redgreen: `**A check that has only ever been green has not been shown to work.**

For anything that fails silently — tenant isolation, money, authorization, an anti-hardcoding gate —
the order is:

1. Write or identify the check.
2. **Break the thing on purpose and watch the check go red.**
3. Fix it.
4. Watch it go green.
5. Run the regression.

Isolation is the sharpest case: as a superuser every policy is bypassed and **every screen still
works**. A system with no isolation at all looks exactly like a system with perfect isolation. The
only way to know which one you have is to have seen the test fail.

This repository does it this way throughout, and each planted failure is recorded in the commit
that added the gate. Follow the same practice; do not take an untested green as evidence.`,

  fake: `Absolutely prohibited:

- fake API responses · fake payment success · fake marketplace sync · fake shipping updates
- fake AI execution · dashboard numbers that are not computed from records
- placeholder functions that report success · empty handlers that return 200
- swallowed exceptions · hidden TODOs · disabled tests · disabled security
- mocked production paths presented as real
- **claiming a test passed when it was not run**

If something is incomplete, say it is incomplete. An honest gap is cheap; a gap dressed as a
finished feature is found by a customer.`,

  prohibitions: [
    'invent a business rule, a tax rate, a threshold or any financial value',
    'hardcode a company count, a channel count, a rate, a person’s name or a schedule',
    'bypass authorization, tenant isolation or row-level security',
    'let an AI agent run arbitrary SQL, or reach the database without going through a business service',
    'commit an API key, a password, a token or a private key',
    'ask anyone for a marketplace, bank or account password',
    'switch off the audit trail, or make it optional',
    'overwrite history — close the row and append a new one',
    'use floating point for money',
    'weaken a gate, a test or CI to get a green build',
    'create a second master record for a concept the kernel already owns',
    'fork the source for one customer',
    'claim work is complete when it is not',
  ],

  done: `A feature is **not** done because the code compiles, a screen exists, or a demo worked.

It is done when **all** of these are true:

- the business behaviour is correct
- authorization is enforced server-side
- tenant and company isolation hold, and have been seen to fail without them
- database constraints protect the invariants
- money is exact and balances
- history is preserved and a closed period does not move
- errors are explicit — nothing degrades to zero or to a silent success
- the operation is idempotent where it can be retried
- it is audited
- tests exist, and they were **run**, and the output is reported
- no fake behaviour and no inappropriate hardcoding remain
- the existing gates still pass`,

  report: `After every substantial task, report in this shape — and report what actually happened,
not what was intended:

**IMPLEMENTED** — what changed.
**ARCHITECTURE** — how it fits, and what it deliberately did not touch.
**DATABASE** — tables, migrations, indexes, constraints.
**SECURITY** — authorization, isolation, what an attacker would try.
**TESTS RUN** — the actual commands and their actual output.
**PLANTED FAILURES** — what you broke on purpose, and what went red.
**FAILED / UNRESOLVED** — genuine problems, not softened.
**SKIPPED** — anything not run, and why.
**NEXT STEP** — the smallest next slice.

Never write "all tests pass" unless you ran them. Never write "production ready" without evidence.`,

  uncertain: `When two things conflict, resolve in this order:

    the existing implementation
        ↓
    the existing tests
        ↓
    the existing data model
        ↓
    the business rules in \`brand/site/rules.js\`
        ↓
    the architectural principles in MEDHAVA_ARCHITECT.md
        ↓
    engineering judgement

Do not replace a working business rule because you prefer a different design. If there is a real
conflict, name it, say which invariant it touches, and ask — do not change behaviour silently.

**\`SPEC_CONFLICTS.md\` already lists the places this business's own specification says two
different things**, quoted with line numbers and deliberately unresolved. If your work touches one,
ask the owner. A resolution invented here becomes a wrong figure in a real month.`,
};

/* ── the platform ─────────────────────────────────────────────────────────── */

const MEDHAVA = {
  file: 'MEDHAVA_BOS_PROMPT.md',
  edition: 'MEDHAVA',
  title: 'MEDHAVA — MASTER BUILD PROMPT',
  strap: 'Build the platform. Paste this at the start of the session.',

  role: `You are the Principal Architect, Principal Engineer, Database Architect, Security Engineer,
AI/Agent Architect, QA Lead and DevOps Engineer for MEDHAVA. Operate as a senior engineering
organisation, not as a code generator.`,

  vision: `MEDHAVA is an AI-native **Business Operating System**: one piece of software that many
unrelated businesses run on at the same time, each seeing only its own records, each seeing them in
its own words. A clothing manufacturer, a steel plant, a school and one person selling courses — the
same code.

It covers ERP, CRM, sales, procurement, MRP, manufacturing, quality, inventory, warehouse,
logistics, accounting and GST, treasury, settlement, OMS and e-commerce, HR and payroll, marketing,
the AI content engine, SEO, projects, business intelligence, and an AI assistant with agents and
automation.

**These are not separate applications.** They share one identity system, one tenant model, one
company model, one permission system, one master-data model, one transaction model, one event
system, one workflow engine, one document system, one audit trail and one AI context layer.

> ONE BUSINESS OS · ONE CANONICAL BUSINESS TRUTH · MANY DOMAINS.`,

  isnot: `Do not turn MEDHAVA into any of these:

- a generic ERP, or a pile of CRUD screens
- a chatbot with database access
- disconnected SaaS products sharing a logo
- an application hardcoded for one industry
- fake integrations, or a dashboard of numbers nobody can trace
- an AI wrapper around CRUD APIs
- unrelated microservices`,

  /* THE SECTION THE OWNER'S OWN TEMPLATE COULD NOT HAVE. */
  exists: `**Read this before you write anything. Most of what you are about to design has been
designed, and some of it is built and tested.** An agent that starts from the module list rebuilds
a 151-table schema that already runs.`,

  absent: `**The platform application does not exist.** No backend, no API, no sign-in, no
multi-tenant runtime. The schema is designed and proven; nothing serves it. The 113 apps are
specified and not built.

This prompt is the brief for building that. It is not a description of something finished, and
nothing in this repository claims otherwise.`,

  /* THE PRECONDITION. Found by extracting MEDHAVA.zip and checking this prompt against it: 18 of
     the 22 paths it names are not in the archive, and every command in it fails. The gate on
     mkprompts.js checks paths against the REPOSITORY — which is right, and is blind to somebody
     handing an agent the documents instead. So the prompt checks its own input, in one line,
     before it has promised anything. */
  precondition: `**This prompt needs the REPOSITORY, not the documents archive.**

The zip of documents and PDFs is for a person to read. It carries no source, no schema, no tests and
no package file — so every path below would be missing and every command would fail. Check first:

\`\`\`bash
ls core/schema.postgres.sql brand/site/modules.js package.json
\`\`\`

**Three files listed → you have the repository. Carry on.**

**"No such file" → stop.** You have the documents archive. Get the repository and start again.

Do not work around this by inferring the code from the documents. The documents describe a design;
the repository holds a @NT@-table schema, a tested engine and the gates that keep them honest.
Rebuilding from prose what already exists in source is the most expensive mistake available here.`,

  screen: `The owner runs this locally and checks the result in Chrome. **Get something on screen
before anything else** — a twenty-phase plan whose first visible result arrives at phase twelve is a
plan nobody finishes.

Two things render today, from a clean clone:`,

  screenSteps: [
    ['npm ci', 'the toolchain, from the committed lockfile'],
    ['npm test', 'every gate and every engine check — expect exit 0 before you change anything'],
    ['node brand/site/build.js', 'writes brand/site/index.html — open that file in Chrome. This is the Medhava website, generated from brand/site/modules.js.'],
  ],

  screenApp: `And the platform itself, which runs:

    npm ci && npm start                       →  http://localhost:4000

Open it in Chrome. Sign in as \`owner@anjali.demo\` — an apparel group with two companies — or
\`owner@deccan.demo\`, a steel works with one. Two unrelated businesses on one database.

Look at **Isolation** first. It shows what your company can see against what the database
actually holds, and the gap is enforced by PostgreSQL row-level security rather than by a filter
the code remembered to add. Then **Record a sale**: one transaction moves the stock, raises the
invoice and posts the ledger, or none of it happens.

That is the house style the remaining screens should meet, and it is the product — no tenant is
installed and none is needed to run it.`,

  kernel: `The Business Kernel owns the concepts every domain shares. **No domain may create a
competing version of one.**

Tenant · Organization · Company · Business Unit · Branch · Department · User · Role · Permission ·
Party · Customer · Supplier · Product · SKU · Variant · Category · Warehouse · Location · Inventory ·
Order · Invoice · Payment · Ledger · Voucher · Document · Channel · Workflow · Event · Audit Record

CRM must not create a second customer master. OMS must not create a second inventory truth. WMS must
not keep its own stock quantities. Marketing must not keep its own product facts. **AI must never
become the source of transactional truth.**`,

  tenancy: `One business must never see another's data. Defence in depth, and every layer is
required:

    Authentication → Tenant context → Company context → Application authorization
        → Database row-level security → Audit

**Unset context fails closed.** An unset company must refuse, never match everything. Write the
guard — \`current_setting('app.current_company', true) <> ''\` — in both USING and WITH CHECK, and
know what it does and does not cover: it catches a company set to the EMPTY STRING. A company
never set at all is NULL, \`NULL <> ''\` is NULL rather than false, so the cast is still reached and
Postgres raises instead. Both refuse and no row escapes either way. Assert WHICH one your database
does, by name, in a test — otherwise a test that merely catches "some error" will call a cast
accident a deliberate guard, and will keep passing when one is swapped for the other.

The application connects as a login role that is **neither a superuser nor the owner of the
tables**. This is the single line that decides whether isolation exists at all: a superuser bypasses
every policy even when the table forces it, and nothing about the running system looks wrong.

Test isolation across every one of: list · search · detail · create · update · delete · reports ·
exports · files · notifications · background jobs · integrations · analytics · AI retrieval · AI
tools.`,

  money: `Money is **exact integer minor units — paise**. Never floating point.

Run this once and you will not need convincing:

    SELECT 0.1::float8 + 0.2::float8;     →  0.30000000000000004

Financial operations must balance, be auditable, be company-scoped, preserve history, support
reconciliation, prevent duplicate posting, and respect accounting periods and configured tax rules.

**Never invent a GST rate, a tax rule, an accounting policy or a financial threshold.**`,

  dated: `Any value a business can change must preserve historical correctness.

The row in force is **closed the day before** and a new row appended. Nothing is overwritten. A
future-dated row activates by itself on its day. A value asked for on a date no row covers is an
**error** — never zero, never the current value, never the nearest one.

This is why a rate change in April leaves March paying March's rate, permanently, and why a closed
month does not move when somebody edits a setting today.`,

  packs: `Industry customisation is configuration, not code. A pack may define terminology, stages,
extra fields, documents, reference data and configurable rules.

A pack may **never** contain executable code, invent a concept the engine does not have, extend a
table that does not exist, declare money as anything but integer paise, switch off an immutable
rule, or be applied in part.

A new industry must run through the same engine with **no change to core source**.`,

  ai: `AI is a platform layer, not a feature. Separate the AI assistant, the customer chatbot, the
agents, the deterministic automation and the content engine — they have different risk profiles.

**AI never reaches the database directly.**

    WRONG:  Agent → arbitrary SQL → database
    RIGHT:  Agent → authorized tool → business service → authorization → validation
                → database → audit → event

An agent obeys the same business rules as a person using a screen. It has explicit capabilities;
high-risk actions — payments, refunds, price changes, financial posting, external commitments —
require policy and human approval. An agent may never escalate its own privileges, and retrieval
must be permission-aware: never surface through RAG what the asker could not read directly.

Put a router in front of the providers, with fallback, circuit breaking and a spend ceiling.
\`brand/suite/router.js --selftest\` already proves that shape works.`,

  phases: [
    ['0', 'Foundation, and something on screen', 'Clone, `npm ci`, `npm test` green, `node brand/site/build.js`, open index.html in Chrome. You have changed nothing yet and you can see the product.'],
    ['1', 'Identity, tenancy, company, permissions', 'The three database roles. Isolation proven by being made to fail as the superuser first.'],
    ['2', 'Business kernel and master data', 'The canonical entities. Money as paise. Effective-dated values that raise on a miss.'],
    ['3', 'Industry packs and configuration', 'A trade is a row. Load a second, unlike trade and change no source file.'],
    ['4', 'Core operations', 'Documents, numbering, workflow states, the event spine.'],
    ['5', 'CRM and sales', 'One customer master, feeding everything downstream.'],
    ['6', 'Procurement, inventory, warehouse', 'Ledger-based stock. Ordered ≠ received ≠ accepted ≠ stocked.'],
    ['7', 'Manufacturing, quality, MRP', 'Components, stages, the requirement calculation with its working shown.'],
    ['8', 'OMS, e-commerce, logistics', 'Channels as rows. One stock number per SKU, never per channel.'],
    ['9', 'Accounting, GST, treasury, settlement', 'A sale reaching the books without anybody writing a journal.'],
    ['10', 'HR, payroll, projects', 'The five employment states — working, on leave, inactive, left, and on trial with no employment record at all. Every rate and threshold is an effective-dated row, never a constant.'],
    ['11', 'Marketing, content, SEO', 'The content engine on real product data.'],
    ['12', 'Workflow and automation', 'Trigger → condition → action, respecting permissions, approvals and spend limits.'],
    ['13', 'AI gateway and model router', 'Provider fallback, breaker, spend ceiling.'],
    ['14', 'AI assistant and retrieval', 'Permission-aware RAG. Retrieval is not transactional truth.'],
    ['15', 'AI agents, tools, approvals', 'Explicit capabilities. High-risk actions gated by a human.'],
    ['16', 'Business intelligence', 'Every KPI traceable to the transactions that produced it.'],
    ['17', 'Integrations', 'One adapter per provider, behind an interface.'],
    ['18', 'Security hardening', 'The full isolation matrix, prompt-injection defence, secret handling.'],
    ['19', 'Performance and reliability', 'Measured, not guessed. Retries, duplicates, replay, restart.'],
    ['20', 'Production deployment', 'Follow DEPLOYMENT.md. Then one real transaction end to end.'],
  ],

  first: `**Do not generate a large amount of code as your first action.**

1. Read MEDHAVA_ARCHITECT.md end to end — it argues every decision and says what would make each
   one wrong.
2. Read the ordered path at the end of MEDHAVA_BUILD_GUIDE.md — 17 stages, each with its command
   and the check that decides it.
3. Read \`core/schema.postgres.sql\`. Most tables exist.
4. Run \`npm test\` and see it green before you change anything.
5. Build \`node brand/site/build.js\` and open the page in Chrome.
6. Then propose the first vertical slice — one capability, all the way down: model, database,
   service, authorization, API, events, UI, tests, observability.
7. Implement only that slice. Test it. Break it on purpose. Report exactly what ran.`,
};

/* ── the tenant ───────────────────────────────────────────────────────────── */

const VASTRANGAM = {
  file: 'VASTRANGAM_PROMPT.md',
  edition: 'VASTRANGAM',
  title: 'VASTRANGAM — MASTER BUILD PROMPT',
  strap: 'Set the business up on Medhava, and build its own apps. Paste this at the start of the session.',

  role: `You are the Implementation Architect and Principal Engineer for VASTRANGAM on MEDHAVA. Two
jobs, in this order: **configure the tenant**, then **build the apps this trade needs that the
platform does not give every business.**`,

  vision: `Vastrangam is a Surat ethnic and western fashion manufacturer running sister companies
across D2C, marketplaces, B2B and export. It is **one business on the Medhava platform** — not a
separate product, not a fork.

Everything that makes it Vastrangam is **data**: its companies, its channels, its people and their
five employment states, its set compositions, its rate cards, its holiday rules, its words. The code
underneath is the same code a steel plant runs.

On top of that sit apps this trade genuinely needs and a generic platform would not carry — the AI
content engine that turns a garment into listings and reels, the data studio that reads the owner's
own workbooks, the image studio.`,

  isnot: `Do not:

- fork Medhava for this customer
- hardcode "three companies" or "seven marketplaces" anywhere — the owner's own words are *"it can
  be 6 or 7 or 10, why are you holding it so strong"*
- build a second customer, product or stock master because the trade's screens want a different shape
- invent a rate, a threshold or a set composition the owner has not stated
- put a person's name into logic`,

  exists: `**The rules and the calculations are already built and tested.** You are not writing
payroll from scratch. Read the engine before you touch this subject.`,

  absent: `The tenant is **configured in fixtures, not loaded into a running system**, because the
platform runtime does not exist yet. The apps that do exist run standalone.

Several values are deliberately **not** set, and the engine raises rather than guessing:

- a piece rate the owner never stated
- the FY2026-27 rates for two contract workers — he named the basis, not the amount
- the holiday calendar, which ships empty because festival dates are his
- company assignment on the channels`,

  /* THE PRECONDITION. Found by extracting MEDHAVA.zip and checking this prompt against it: 18 of
     the 22 paths it names are not in the archive, and every command in it fails. The gate on
     mkprompts.js checks paths against the REPOSITORY — which is right, and is blind to somebody
     handing an agent the documents instead. So the prompt checks its own input, in one line,
     before it has promised anything. */
  precondition: `**This prompt needs the REPOSITORY, not the documents archive.**

The zip of documents and PDFs is for a person to read. It carries no source, no schema, no tests and
no package file — so every path below would be missing and every command would fail. Check first:

\`\`\`bash
ls core/schema.postgres.sql brand/site/modules.js package.json
\`\`\`

**Three files listed → you have the repository. Carry on.**

**"No such file" → stop.** You have the documents archive. Get the repository and start again.

Do not work around this by inferring the code from the documents. The documents describe a design;
the repository holds a @NT@-table schema, a tested engine and the gates that keep them honest.
Rebuilding from prose what already exists in source is the most expensive mistake available here.`,

  screen: `Run it locally and look at it in Chrome. Both of these work from a clean clone today:`,

  screenSteps: [
    ['npm ci', 'the toolchain'],
    ['npm test', 'every gate — expect exit 0'],
    ['node brand/site/build.js vastrangam', 'writes brand/site/index_vastrangam.html — open it in Chrome, in this trade’s own words'],
    ['python3 engine/tests/selftest.py', 'the engine: payroll, attendance, karigar costing, set completion'],
  ],

  screenApp: `And the app that actually serves:

    cd app && npm install && npm start        →  http://localhost:3000

That is the Vastrangam AI Engine — the content engine with a real server behind it. Open it in
Chrome. Also openable directly as files: \`brand/suite/deep/out/*.html\`, the built module screens.`,

  data: `**Every value below is a row with a date, and the owner owns all of them.** Your job is the
structure that lets him change them; it is never to freeze them.

A supervisor leaves on Tuesday and a replacement starts Wednesday, both recorded that morning — and
last month's payroll, already paid, comes out to the same rupee. *Purana record mitta nahin; naye
date se naya rule lagta hai.*`,

  people: `**Five states, and they are not interchangeable.** Most systems have two, and that is the
single biggest source of wrong pay here.

| State | Employment spell | What it means |
|---|---|---|
| Working | open | Attendance expected, pay computed |
| On leave | open, not working | Employed. **Not** a bad month, **not** having left |
| Inactive | closed, re-associable | Stopped and may return, on a new spell with the gap intact |
| Left | closed | Stopped |
| **Trial** | **none at all** | Came for days, was paid, went. **The payment is the whole record** |

Trial is the structural one: no joining date, no leaving date, no salary, because none of those
happened. The system must accept attendance and a payment for somebody with **no employment record**
— and attendance with no spell **and no payment** must be **refused, never paid zero**.`,

  religion: `The owner: *"RELIGION FOR HOLIDAY PURPOSE."*

Recorded for the people he named one for, and nobody else. **Absence means not recorded** — a
holiday scoped to a religion, matched against somebody with none on file, **raises and names them**.
Including them grants a paid day on an assumption; excluding them withholds one on the same
assumption.

\`gates.religion_only_decides_holidays()\` fails the build if the field is read anywhere that
computes pay, hours, performance or permission. **Do not weaken that gate.**`,

  apps: `Build these on the platform, not beside it. Each reads the canonical product and business
data — never its own copy.

| App | What it does | What exists today |
|---|---|---|
| AI Content Engine | A garment → listings, social, reels, ads, SEO, the Excel pack. Analysis-first: it reads the product before it writes a word | Runs at localhost:3000, and its full pipeline is specified |
| Data Studio | Reads the owner's own sale, return and karigar workbooks in the browser — no upload, no account | Built, and checked against real workbooks |
| Image Studio | Product imagery | Built |
| The module screens | Per-module operational screens in this trade's words | Four built as standalone HTML |

**The content engine must never invent a product fact.** If it cannot identify the garment, it says
so and stops — a confident description of something it could not see is the one output that costs
more than no output, because nobody checks the confident ones.`,

  validate: `The logic is checked by hundreds of tests that need no data. Those prove the **logic**.
They do not prove it reproduces **this business**.

    npm run validate -- /path/to/the/folder/your/workbooks/are/in

One folder. It works out which file is which, wires everything up, runs the suite. Nothing is
uploaded or copied.

**Read what it says it could not check.** With a workbook missing it exits non-zero and names the
figures that were never verified — because "313 passed" under a missing input is the sentence people
remember and the one that misleads.`,

  phases: [
    ['0', 'Get it on screen', '`npm ci`, `npm test` green, build the trade edition, open it in Chrome. Change nothing yet.'],
    ['1', 'Read the conflicts before resolving one', '`SPEC_CONFLICTS.md`. Seven are open on purpose. If your work touches one, ask.'],
    ['2', 'The industry pack', 'This trade as configuration: words, stages, documents, which modules are on.'],
    ['3', 'Companies and channels', 'Rows. Assert no count of either, anywhere.'],
    ['4', 'People', 'The five states. Per-person hours and thresholds. The weekly off belongs to named people, not to a category.'],
    ['5', 'Products and set composition', 'What each set contains, and which slots are optional. Both readings reported where it is undecided.'],
    ['6', 'The making side', 'Units, rate cards by date, components. A unit that split is a date, not a contradiction.'],
    ['7', 'Attendance and pay', 'IN and OUT as a pair. The end-of-day update. Holidays pay and produce nothing.'],
    ['8', 'Buying and selling', 'The three-way match. Settlement broken back down to its orders.'],
    ['9', 'The month end', 'Run payroll first on a month already paid. Correct the setting, never the figure.'],
    ['10', 'The apps', 'Content engine, data studio, image studio — on the platform, reading canonical data.'],
    ['11', 'Validate against the real books', '`npm run validate` with the owner’s workbooks. Read what it could not check.'],
    ['12', 'Live', 'The daily exception list. Then change something significant and confirm the closed month did not move.'],
  ],

  first: `**Do not generate a large amount of code as your first action.**

1. Read \`SPEC_CONFLICTS.md\` — know what is open before you resolve anything.
2. Read VASTRANGAM_RULES_AND_LOGIC.md for the subject you are about to touch.
3. Read the engine file that already implements it — \`engine/vastrangam/\`.
4. Run \`python3 engine/tests/selftest.py\` and see it green.
5. Build the trade edition and open it in Chrome.
6. Then propose one vertical slice and build only that.
7. Report exactly what you ran and what it printed.`,
};

const PROMPTS = [MEDHAVA, VASTRANGAM];

module.exports = { PROMPTS, COMMON };

/* ── the gate on this file ────────────────────────────────────────────────── */
/* Shape only. Whether the paths and commands are REAL is mkprompts.js's job, because that needs
   the filesystem and this file is data. */
module.exports.check = function check() {
  const bad = [];
  const seen = new Set();
  for (const p of PROMPTS) {
    if (!p.file || !p.title || !p.role) { bad.push('a prompt is missing file, title or role'); continue; }
    if (seen.has(p.file)) bad.push(`${p.file}: listed twice`);
    seen.add(p.file);

    /* The section that stops an agent rebuilding what is already here. Without it this is the
       owner's generic template again, and his ran to 73 sections naming not one real file. */
    if (!p.exists || !p.absent) {
      bad.push(`${p.file}: must say what already EXISTS and what does NOT — an agent that does ` +
        `not know rebuilds the schema`);
    }
    /* He runs it locally and looks at it in Chrome. A prompt whose first visible result is
       twenty phases away is a prompt nobody finishes. */
    if (!(p.screenSteps || []).length) {
      bad.push(`${p.file}: no way to get something on screen before building anything`);
    }
    /* PROVEN BY EXTRACTING THE ARCHIVE AND CHECKING THE PROMPT AGAINST IT.
       18 of the 22 paths were absent, every command was broken, and there was not a word of
       warning anywhere. mkprompts.js checks paths against the REPOSITORY — correct, and blind to
       somebody handing an agent the documents zip instead. A prompt that does not check its own
       input fails ten minutes in, looking like the agent's fault. */
    if (!p.precondition || !/^ls /m.test(p.precondition)) {
      bad.push(`${p.file}: no precondition check — handed the documents archive instead of the ` +
        `repository, this prompt would name files that are not there and say nothing`);
    }
    if (!(p.phases || []).length) bad.push(`${p.file}: no phase order`);
    (p.phases || []).forEach((row, i) => {
      if (!Array.isArray(row) || row.length !== 3) bad.push(`${p.file}: phase ${i} is malformed`);
    });
    if (!p.first || !/first action/i.test(p.first)) {
      bad.push(`${p.file}: must say what to do FIRST, and that it is not writing code`);
    }
  }
  if (!COMMON.prohibitions.length) bad.push('COMMON: nothing is prohibited');
  if (!/never|not/i.test(COMMON.missing)) bad.push('COMMON: no rule for a missing value');
  return bad;
};
