'use strict';
/* THE ARCHITECT — what Medhava IS, and why it is that.
 *
 * WHO READS THIS, AND WHAT MAKES IT DIFFERENT FROM THE BUILD GUIDE
 * Two documents, one subject, and the split is deliberate:
 *
 *   MEDHAVA_ARCHITECT     WHAT and WHY. The shape of the thing. Every decision, the reason it was
 *                         made, and what it would cost to make the other one. You could read this
 *                         and argue with the design without touching a keyboard.
 *   MEDHAVA_BUILD_GUIDE   HOW, in order. Empty machine to deployed product, step by step, every
 *                         command with the check that says it worked.
 *
 * The test for whether a sentence belongs here: does it survive a change of language, framework
 * or host? "Money is stored as whole paise, never a float" survives. "Run npm ci" does not.
 *
 * WHERE THE CONTENT COMES FROM — READ, NEVER RETYPED
 *   stack.js        19 layers, what each is built on, 57 alternatives
 *   modules.js      22 modules, 113 apps, and who reads and writes what
 *   partv.js        Part V’s 43 tables and where each one went
 *   schema.postgres.sql  the real table count, read at generation time
 *   dynamic.js      what a tenant changes, and the six things nobody changes
 *   rules.js        285 rules — cited by count and by module, not restated
 *   packs.js        how a trade is configured
 *
 * A section must say what would make the decision WRONG. A design document that only lists what
 * was chosen is a sales brochure; the value is in knowing which way each decision could fall and
 * what it would cost to reverse. `wrong_if` is required on every decision, and check() refuses a
 * section without one.
 *
 * THIS DESCRIBES A DESIGN. Nothing here claims to be running. Two agents are going to be pointed
 * at this document and told to build from it — if it implied the product existed, both would be
 * told to build something already done.
 *
 * Straight apostrophes read wrong in the PDF; use the typographic ’ in prose.
 */

/* ── Part 1 · the problem the shape solves ────────────────────────────────── */

const P1 = {
  n: 1,
  title: 'One system, many businesses, none of them alike',
  lead: `Medhava is one piece of software that many separate businesses run their whole operation
on. Each sees only its own information. Each sees it in its own words. None of them has a copy of
the code.

That last sentence is the entire design problem, and everything else in this document follows from
it. The moment one customer gets a branch in the code — a special case, a fork, a "we will add a
setting just for you" — the software has started to split, and in two years there are as many
versions as there are customers, each needing its own fix for the same bug.

**So the things that differ between businesses are DATA, not code.** Their words, their steps,
their extra fields, their rules, their rates, their people, how many companies they run and how many
places they sell. A steel plant, a clothing manufacturer, a clinic, a law practice and a single
creator selling courses all run the same build. What differs is what is in their rows.`,
  sections: [
    {
      id: '1.1',
      decision: 'A business is a row, not a deployment',
      what: `Every customer of Medhava is a **tenant** — one row in one table, on the same
database as every other tenant. Not a copy of the software, not a separate server, not a schema of
their own.`,
      why: `The alternative is a deployment per customer, and it is a trap that looks like safety.
Fifty customers becomes fifty upgrades, fifty backups, fifty places a security fix has to land, and
the first time one of them lags a version the support answer becomes "which build are you on".
One row means one upgrade for everybody and one place to look when something is wrong.`,
      wrong_if: `A customer needs data physically separate for a regulator, or one customer is so
large its load hurts the others. Both are real, and both are answered the same way — that tenant
moves to its own database with the SAME schema and the SAME code. The design survives; only the
hosting changes. What would break the design is a customer needing different LOGIC.`,
      terms: ['platform', 'tenant', 'database', 'row'],
    },
    {
      id: '1.2',
      decision: 'Isolation is the database’s job, never a WHERE clause somebody remembers',
      what: `Every business table carries \`company_id\`. Row-level security policies are attached
in the database itself, so a query that forgets to filter returns nothing rather than everything.
The same mechanism one level up keeps two TENANTS apart, on \`tenant_id\`.`,
      why: `A filter in a screen can be removed by anybody editing that screen. A policy in the
database cannot be removed by editing a screen. The application checks the same thing again at its
own layer — two independent layers, because one layer is one mistake away from a customer reading
another customer’s orders.

Three details decide whether this works at all, and all three are easy to get wrong:
\`FORCE ROW LEVEL SECURITY\` so the table’s owner is subject to its own policy; the application
connecting as a role that is **neither superuser nor table owner**, because Postgres bypasses RLS
for superusers and FORCE does not stop them; and an explicit guard so an UNSET company setting
refuses rather than matching everything.`,
      wrong_if: `Nothing here is wrong-if. This is the one decision in the document with no
acceptable alternative: a cross-tenant leak is not a defect, it is an incident, and it is the
single highest-risk item in the whole design.`,
      terms: ['row-level security', 'table'],
    },
    {
      id: '1.3',
      decision: 'The count of anything a business owns is a row count',
      what: `How many companies, how many channels, how many modules are switched on, how many
people — none of these numbers appears in the code. They are counted from rows.`,
      why: `This tenant runs three companies and sells on seven channels today. Both numbers have
already changed once during the writing of this system, and the owner’s own words about the second
were "marketplace can be 6 or 7 or 10, why are you holding it so strong". He is right, and a number
in the code would make him wrong.

The proof is not a promise: the core test posts across a **10 x 10 grid** of companies and
channels, then runs 11 x 11 with no code changed, and \`brand/site/checkstatic.js\` fails the build
if a business count is ever compiled in.`,
      wrong_if: `Never. A count in the code is always a bug waiting for a customer to grow.`,
      terms: ['schema'],
    },
  ],
};

/* ── Part 2 · time, and why it is in everything ───────────────────────────── */

const P2 = {
  n: 2,
  title: 'Every value has a date, and the past does not move',
  lead: `A salary is not a number. It is a number **that was true between two dates**, and the
difference decides whether last year’s books still add up after somebody gets a raise.

This is the idea that most business software gets wrong, and it is worth being blunt about the
failure mode: a system that stores "salary = 20,000" and lets somebody edit it has just changed
what every past month costs. The payroll for last April silently becomes a different number. Nobody
notices until an auditor asks.`,
  sections: [
    {
      id: '2.1',
      decision: 'Effective-dated and append-only, everywhere a value can change',
      what: `A change never overwrites. The open row is closed at the day before the change, and a
new row is appended carrying the date it starts from and who made it. Asking for a value "as of"
any date returns what applied then.`,
      why: `Three properties fall out of it and all three matter:

**Future-dated entries activate themselves.** A raise recorded today for next month is simply the
answer when next month is processed. Nobody has to remember.

**A closed month does not move.** Renaming something today cannot change what last year cost.

**No match is an error, never zero.** Asking for a value before anything ever set it raises rather
than quietly returning nothing — because a silent zero is how a wrong number reaches a real
person’s payslip, and a raise is a question somebody answers in a minute.`,
      wrong_if: `A value genuinely has no history and never will — a colour name, a country code.
Dating those adds ceremony for nothing. The test is whether anybody would ever ask "what was it in
March".`,
      terms: ['effective date', 'audit trail'],
    },
    {
      id: '2.2',
      decision: 'A person is a series of spells, not a join date and a leave date',
      what: `Employment is a list of periods with gaps allowed. Somebody can work, leave, and come
back on a new spell with their history intact and nothing about the old spell rewritten.`,
      why: `Because that is what actually happens. This tenant has, right now, five different
states in play and they are not interchangeable:

somebody **working** · somebody **on leave** for a month, still on the roster · somebody
**inactive who can return** — the owner’s words about one contract worker are "we can associate in
future" and about two others "they can come to work as contract basis whenever I need" · somebody
who has **left** · and a **trial**, who came for a few days, was paid, and went.

Collapsing those into one "active" flag loses the difference between a person on leave and a person
gone, which is the difference between a payslip and no payslip.`,
      wrong_if: `Never, in any business that employs people. The moment a model cannot express
"came back", somebody starts keeping the truth in a spreadsheet beside the system.`,
      terms: [],
    },
    {
      id: '2.3',
      decision: 'A trial has no employment record at all, and is still paid',
      what: `Somebody can be paid for days worked without ever being onboarded — no spell, no
salary history, no threshold. The **payment is the record**.`,
      why: `The owner’s description: "can come today and leave tomorrow if we didn’t like them or
negotiation failed". A system that requires a person to exist before attendance or a payment can be
entered cannot represent that day, so the day gets entered wrongly or not at all — and either way
the wage is missing from the books.

Nothing is derived for a trial, so nothing raises "salary missing" — there is no salary to miss.
The cost still lands in the right company and the right month. If the trial works out, they become
a regular person with a start date and the trial days stay in history as trial days.`,
      wrong_if: `A business that legally cannot pay anybody without a contract on file. Then the
contract becomes the precondition — but that is a RULE the tenant switches on, not a shape the
software forces on everybody.`,
      terms: [],
    },
  ],
};

/* ── Part 3 · money ───────────────────────────────────────────────────────── */

const P3 = {
  n: 3,
  title: 'Money, and the two mistakes that are hard to reverse',
  lead: `Two decisions about money have to be right before the first invoice is posted, because
both are effectively impossible to fix afterwards on live data.`,
  sections: [
    {
      id: '3.1',
      decision: 'Money is whole paise in an integer. Never a float.',
      what: `Every money column is an integer number of paise and its name says so — \`_paise\`.
No money value is ever a floating-point type, and a gate reads both schemas to prove it.`,
      why: `The arithmetic is not approximately right, it is wrong in a way that accumulates.
In a real database, \`0.1 + 0.2\` in floating point is \`0.30000000000000004\` — measured, not
quoted from a blog. Across a hundred thousand invoice lines that becomes a reconciliation nobody
can close, and the errors are unevenly distributed so they do not cancel out.

The naming half matters as much as the type: \`total numeric\` reads as rupees to one developer and
paise to the next, and the difference is a factor of a hundred in the books.`,
      wrong_if: `Never. There is no version of this where floats are acceptable for money.`,
      terms: ['integer paise'],
    },
    {
      id: '3.2',
      decision: 'Double-entry underneath, whatever the screen looks like',
      what: `Every financial event produces balanced journal entries. Screens can look like
anything; the ledger underneath is the ledger.`,
      why: `Because the alternative — a "transactions" table with a sign column — cannot answer
"why does this balance not match" without a human reading rows. Double entry answers it
structurally: if the two sides disagree, the entry was refused when it was written, not discovered
at year end.`,
      wrong_if: `A business that never needs a balance sheet. Almost none, once they have a
lender, an auditor or a tax authority.`,
      terms: [],
    },
    {
      id: '3.3',
      decision: 'A missing rate posts nothing and says so',
      what: `Where a value needed for a calculation was never supplied, the calculation reports
**Unresolvable** and pays zero, flagged. It never guesses, never carries a neighbour’s figure
forward, and never silently posts zero as though zero were the answer.`,
      why: `This rule exists because it was broken. One contract worker’s file carried ₹100/hour
copied from a different contract worker, because that figure was to hand and the real one had never
been stated. It looked completely reasonable and it was fiction, and fiction on a payslip is the
worst kind. The rate was removed and every remaining rate now has to cite the line that states it.

Two people in this tenant are on piece rate with no rate stated. Their months raise. That is the
system working.`,
      wrong_if: `Never. "Approximately paid" is not a thing.`,
      terms: [],
    },
  ],
};

/* ── Part 4 · the shape of the software ───────────────────────────────────── */

const P4 = {
  n: 4,
  title: 'Modules, apps and the cascade between them',
  lead: `The system is organised as modules. A module is one area of work — sales, purchase,
staff, accounts — and holds a set of screens that belong together. Each module declares what it
READS and what it WRITES, and those declarations are what wire the system together.`,
  sections: [
    {
      id: '4.1',
      decision: 'Modules declare their reads and writes, and the wiring is derived from that',
      what: `No module calls another module directly. Each says what it produces and what it
consumes; the connections between them are generated from those declarations, and the module
dependency map in the documents is drawn from the same source rather than maintained by hand.`,
      why: `Hand-drawn architecture diagrams are wrong within a month of being drawn, and nobody
finds out because nothing checks them. A derived one cannot drift: if a module starts writing
something new, the map changes on the next build. It also means a module can be switched OFF for a
tenant who does not need it, and what breaks is knowable in advance.`,
      wrong_if: `A module needs to call another one synchronously and wait — a real case for
tight, latency-sensitive work. Then it is a direct call, declared as such, and the exception is
visible rather than being one more undocumented arrow.`,
      terms: ['module'],
    },
    {
      id: '4.2',
      decision: 'A rulebook, where every rule says what the system will NEVER do instead',
      what: `Every module carries numbered rules. Each states what happens **and** what the system
refuses to do in its place. A rule marked ENFORCED must name a file and a test that really exist,
and the build fails otherwise.`,
      why: `"The system validates input" is not a rule, it is a mood. "A stock movement quantity
must be positive; a zero or negative quantity is refused, never absorbed as a correction" is a
rule — it tells you what somebody was tempted to do instead and why that was rejected.

The \`never\` half is what makes a rulebook checkable. A rule without one is a description, and
the checker rejects it as such.`,
      wrong_if: `Never — but the risk is real: a rulebook can rot into 285 sentences nobody reads.
The defence is that the rules are injected into the documents from one source and the ENFORCED ones
have to point at a passing test.`,
      terms: [],
    },
    {
      id: '4.3',
      decision: 'Configuration is a pack, and what a business changed after is an overlay',
      what: `A trade starts from a **pack** — the words, stages, fields and modules that suit that
industry. Everything the business changes afterwards is an **overlay**: effective-dated,
append-only, and resolved as of any date.`,
      why: `Two different lifetimes. A pack is where a trade STARTS and is versioned with the
software. An overlay is what one business did on a Tuesday, and it must be changeable by that
business without anyone touching the repository.

Before the overlay existed, six things the documents promised a tenant could change — its
vocabulary, stages, fields, documents, which rules are on and which modules are on — were all files
in the source tree, which meant every one of them was a code deployment by the vendor. A promise a
document makes and the code cannot keep is the beginning of a fabrication.`,
      wrong_if: `A tenant needs something no pack or overlay can express. That is a real signal —
it means the thing they need is genuinely code, and the right answer is a new capability for
everybody, not a branch for them.`,
      terms: ['industry pack'],
    },
  ],
};

/* ── Part 5 · what it is built on ─────────────────────────────────────────── */

const P5 = {
  n: 5,
  title: 'The stack, and the fact that none of it is load-bearing',
  lead: `Nineteen layers, each with a default choice, at least two named alternatives, and the
interface that makes swapping one possible. The register is generated from a single source and a
gate refuses a layer that names fewer than two ways out.`,
  sections: [
    {
      id: '5.1',
      decision: 'Every layer names its alternatives before it is chosen',
      what: `A layer is not allowed into the design without naming what could replace it and what
the interface between it and everything else is.`,
      why: `Not because the alternatives will be used — most never are — but because being forced
to name them is what proves the layer was chosen rather than defaulted to. A layer with no
alternative is a layer nobody thought about, and it is the one that becomes impossible to move
three years later when its vendor triples the price.`,
      wrong_if: `The alternatives listed are not real. A named alternative nobody has checked is
worse than an honest "this one is load-bearing", because it manufactures confidence.`,
      terms: ['interface', 'adapter'],
    },
    {
      id: '5.2',
      decision: 'Free first, and a paid tool must name its free option and its trigger',
      what: `Every capability starts on something free. Where a paid tool is chosen, the register
must record what the free option was and the specific trigger that justifies paying.`,
      why: `A small manufacturer’s software budget is real money. "We use the paid one because it
is better" is not a decision, it is a preference. "We use the paid one once outbound messages pass
X a month, because below that the free tier covers it" is a decision somebody can check against
their own numbers.`,
      wrong_if: `A free option does not exist for a capability. Then the register says so plainly
rather than inventing one.`,
      terms: ['provider', 'fallback'],
    },
  ],
};

/* ── Part 6 · the database ────────────────────────────────────────────────── */

const P6 = {
  n: 6,
  title: 'The data model',
  lead: `One schema, in build-phase order, so the first phase can be run without reading the rest.
Every business table carries \`company_id\`, row-level security, FORCE, and a grant — all four,
because three of them without the grant is a table nobody can read, and three without the policy is
a table everybody can.`,
  sections: [
    {
      id: '6.1',
      decision: 'The schema is executed by a test, not read by one',
      what: `The production schema is loaded into a real PostgreSQL in the test suite and the
isolation is asked of the database rather than asserted about the file.`,
      why: `Because a text check is structurally incapable of finding the thing that was actually
wrong. The committed schema passed every text assertion for months and had **never been executed**
— the first time anything ran it, it failed on its very first policy with \`role "authenticated"
does not exist\`, and because the file is one transaction, nothing was created at all.

The test also opens with a negative control that deliberately leaks and REQUIRES the leak: if the
harness cannot detect a cross-company read, every check after it is decoration and the file aborts
rather than reporting a pass.`,
      wrong_if: `Never. "Proved by a test that tries" is the standard, and a schema nothing runs
is a document.`,
      terms: ['migration'],
    },
    {
      id: '6.2',
      decision: 'Delete nothing — soft-delete, or be an append-only log',
      what: `Every table that holds a business record can record that it was voided. Tables that
are genuinely event logs do not need it, and each one says in its own words why it is an event
rather than a record.`,
      why: `Because "who deleted the March invoice" has to have an answer. The exemption list is
the interesting part: a table added to it instead of given the column is the rule being waved
through, which is why each exemption has to justify itself.`,
      wrong_if: `Data a regulator requires to be truly erased. Then erasure is a deliberate,
audited operation with its own record — not the ordinary delete path.`,
      terms: [],
    },
  ],
};

/* ── Part 7 · what it refuses ─────────────────────────────────────────────── */

const P7 = {
  n: 7,
  title: 'What the system refuses to do, on purpose',
  lead: `A design is defined as much by its refusals as its features. These are not limitations to
be lifted later; they are the decisions that make the rest trustworthy.`,
  sections: [
    {
      id: '7.1',
      decision: 'It never asks for a marketplace, bank or account password',
      what: `Not at onboarding, not for a migration, not "just this once" for support. Connections
are made with keys the platform is granted, which the tenant can revoke.`,
      why: `A password gives away everything the account can do, forever, to anybody who later
reads the place it was stored. A key can be scoped and revoked. This is written into the product’s
own promise, and the code and the conversation both have to honour it — including refusing a
password that somebody volunteers.`,
      wrong_if: `Never, and the pressure to bend it is real: a marketplace with no API, a migration
that would be quicker by logging in as the customer. The answer to both is that the work is done a
slower way or not at all. A promise with an exception is not a promise.`,
      terms: ['encryption'],
    },
    {
      id: '7.2',
      decision: 'A raw API key is never stored, and there is nowhere to store one',
      what: `Keys are shown once at issuance. What is kept is a hash and a scope. The table has
**no column** a raw key could be written to.`,
      why: `A "we never log credentials" flag beside a raw-key column is a promise the schema
itself breaks. The way a schema keeps that promise is by having nowhere to break it, and a test
asserts the absence of such a column rather than the presence of a flag.`,
      wrong_if: `Never. If a key genuinely must be replayable — some payment gateways ask for it —
that is a secret store with its own access log and its own rules, not a column on a business table
that every report can read.`,
      terms: ['permission'],
    },
    {
      id: '7.3',
      decision: 'A person’s name never appears in logic',
      what: `No branch anywhere is taken because of who somebody is. Behaviour follows a flag the
person carries — flat-salary, piece-rate, trial — and the flag is data.`,
      why: `\`if (staff === 'Karim')\` works until Karim leaves, and then it silently applies to
nobody while everybody assumes it still works. It also means the rule cannot be given to the next
person without a developer. Two separate gates enforce this, one for each language.`,
      wrong_if: `Never. The temptation appears whenever one person is genuinely an exception — and
that is precisely when the exception should become a flag, because an exception worth coding is an
exception worth naming.`,
      terms: ['role'],
    },
  ],
};

const PARTS = [P1, P2, P3, P4, P5, P6, P7];

/* ── the gate on this file ────────────────────────────────────────────────── */

const check = () => {
  const bad = [];
  const seen = new Set();
  for (const p of PARTS) {
    if (!p.title || !p.lead) bad.push(`part ${p.n}: needs a title and a lead`);
    if (!p.sections || !p.sections.length) bad.push(`part ${p.n}: has no sections`);
    for (const s of p.sections || []) {
      if (seen.has(s.id)) bad.push(`${s.id}: used twice`);
      seen.add(s.id);
      if (!s.decision) bad.push(`${s.id}: states no decision`);
      if (!s.what || s.what.length < 40) bad.push(`${s.id}: does not say WHAT was decided`);
      if (!s.why || s.why.length < 80) bad.push(`${s.id}: does not say WHY`);
      /* THE ONE THIS FILE EXISTS FOR. A design document that only lists what was chosen is a
         brochure. The value is in knowing which way the decision could fall. */
      if (!s.wrong_if || s.wrong_if.length < 20) {
        bad.push(`${s.id}: no "wrong_if". Every decision must say what would make it the wrong ` +
          'one — even if the answer is "never", which is itself a claim worth writing down.');
      }
      /* Inline code is stripped before the apostrophe check. The rule is about PROSE, and a
         sentence showing `if (staff === 'Karim')` is quoting a language whose string quote is an
         apostrophe. Replacing it would misquote the code and teach the reader something false. */
      const prose = [s.what, s.why, s.wrong_if].join(' ')
        .replace(/`[^`]*`/g, ' ').replace(/\s+/g, ' ');
      const banned = /\b(works today|not built|already built|still pending|TODO)\b/i.exec(prose);
      if (banned) {
        bad.push(`${s.id}: says "${banned[0]}" — this document describes a design, so nothing in ` +
          'it is built or pending');
      }
      if (/'/.test(prose)) bad.push(`${s.id}: straight apostrophe in prose — use the typographic ’`);
    }
  }
  return bad;
};

module.exports = { parts: PARTS, check };
