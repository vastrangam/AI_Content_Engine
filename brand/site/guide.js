'use strict';
/* THE BUILD GUIDE — how this platform is designed and built.
 *
 * WHAT CHANGED, AND WHY
 * The previous version of this file was a going-live runbook. It opened by telling the reader to
 * verify a Meta business account and open a messaging provider account before writing any code.
 * Those are a TENANT's concerns — one customer connecting its own accounts. The platform needs no
 * messaging account of its own to be built; it needs a place for a tenant to plug one in. A
 * document about building the platform that begins with somebody else's onboarding is answering a
 * question nobody asked.
 *
 * So this is now what it should always have been: the technical design. The architecture, the
 * database, the backend, the frontend, storage, memory, sign-in, integrations, background work,
 * search, the model layer, and how it is run. Every layer says what it does in words anybody can
 * follow, what it is built on, and what it can be replaced with.
 *
 * THIS DESCRIBES A DESIGN, NOT AN INVENTORY.
 * Nothing here claims to exist. There are no "working today" or "not built" markers, because they
 * would all say the same thing and a label that never varies is noise. Every step is a decision to
 * be made and built, and "done" means the decision is made, written down and agreed — not that
 * code is running.
 *
 * WHERE THE CONTENT COMES FROM
 *   stack.js       what each layer is built on, and its alternatives — pulled in by `layer`
 *   plainwords.js  every technical term, explained once — pulled in by `terms`
 *   dynamic.js     what a tenant can change without a developer
 *   modules.js     the module list, for the build order
 *
 * A step must say what makes it done. A step with no `done` is a suggestion, and a suggestion in
 * a design document is where a team later discovers nobody actually decided.
 *
 * Straight apostrophes read wrong in the PDF; use the typographic ’ in prose.
 */

/* ── Part 0 · what is being built ─────────────────────────────────────────── */

const P0 = {
  n: 0,
  title: 'What you are building',
  lead: `One piece of software that many separate businesses use at the same time, each seeing only
its own information, each seeing it in its own words.

The businesses will not resemble each other. A steel plant, a clothing manufacturer, a car maker, a
retail chain, an education company, a single creator selling courses — all of them, on the same code.
That is the whole design problem, and every decision in this document exists to serve it.

**The trap to avoid is building one system and then bending it.** The moment a customer needs a
change and the answer is "we will add a setting for you", the software has started to fork, and in
two years there are as many versions as customers. The way out is to decide early that the things
that differ between businesses are **data**, not code — their words, their steps, their extra fields,
their documents, which parts they use at all — and that the code is the same for everyone, forever.`,
  terms: ['platform', 'tenant', 'module'],
  steps: [
    {
      id: '0.1',
      do: 'Write down what is code and what is data, before writing any code',
      why: `This is the most expensive decision in the project and the cheapest one to get right at
the start. Anything on the "data" side can be changed by a customer, in the app, in a minute. Anything
on the "code" side needs a developer and a release. Put something on the wrong side and you either
ship a rigid product or an unmaintainable one.`,
      table: {
        head: ['This is data — the customer changes it', 'This is code — the same for everyone'],
        rows: [
          ['What they call things', 'That records have to name their owner'],
          ['The steps their work moves through', 'That money is exact'],
          ['Extra fields on any record', 'That every change is recorded'],
          ['Which modules they use', 'How the modules work'],
          ['Their companies, channels, locations', 'That one business cannot read another'],
          ['Their documents and numbering', 'The rulebook the books rely on'],
          ['Which outside services they connect', 'The shape of the connection'],
        ],
      },
      done: 'The two lists exist and the team agrees on them. Every later argument about a feature starts by asking which column it belongs in.',
    },
    {
      id: '0.2',
      do: 'Adopt the two rules that everything else obeys',
      why: `Both exist because of the same fear: that in three years you cannot change something you
need to change. One is about the tools underneath you. The other is about the business on top.`,
      table: {
        head: ['Rule', 'What it means in practice'],
        rows: [
          ['**No capability depends on one tool**',
            'Every layer names one default so work can start, at least two replacements, and the interface the rest of the code talks to. Swapping is a settings change, never a rewrite.'],
          ['**Nothing is static, and the past stays correct**',
            'A customer can add, edit or remove anything, any time, taking effect at once. Every change carries the date it starts from — so last month’s figures do not move.'],
        ],
      },
      note: `The second rule is the harder one and it is worth being blunt about why. A system that
lets you overwrite freely will happily change a payroll total for a month you already paid out. A
system that locks the past makes you phone a developer when a supervisor quits on a Tuesday. The
effective date is what gives you both: *purana record mitta nahin, naye date se naya rule lagta hai.*`,
      done: 'Both rules are written into the project’s working agreement, and there is a check that fails the build when either is broken.',
    },
    {
      id: '0.3',
      do: 'Decide the shape: one code base, many businesses, one database',
      why: `Three ways exist to serve many businesses. Give each its own copy of everything —
simple at three customers, unmanageable at fifty, because every fix has to be applied fifty times.
Give each its own database — safer-feeling, but a change to the shape of the data has to run
everywhere and one of them will fail while the others succeed. Or keep everyone in one database with
a lock at the record level, which is one system to fix, one shape to change, and one thing that must
be got exactly right.`,
      terms: ['row-level security', 'database'],
      done: 'The choice is written down with its consequence stated: the record-level lock is now the single most important piece of code in the system, and it is tested before anything is built on top of it.',
    },
  ],
};

/* ── Part 1 · the shape of the whole thing ────────────────────────────────── */

const P1 = {
  n: 1,
  title: 'The shape of the whole thing',
  lead: `Before any single piece, the map. Six layers, each talking only to the one below it, so a
change in one does not ripple through the rest.`,
  diagram: 'architecture',
  steps: [
    {
      id: '1.1',
      do: 'Separate the six layers and keep them separate',
      why: `The reason for layers is not tidiness. It is that a layer with a clear edge can be
replaced without touching anything else, and a layer whose edges have blurred cannot be replaced at
all. Most systems that become impossible to change did not decide to be — they just let the screens
start talking directly to the database, one shortcut at a time.`,
      table: {
        head: ['Layer', 'What lives there', 'What it must never do'],
        rows: [
          ['Screens', 'What the user sees and clicks', 'Contain a business rule, or reach the database directly'],
          ['The API', 'The doorway the screens knock on', 'Decide anything — it only carries requests'],
          ['Services', 'The business rules. The real system', 'Know which outside company provides anything'],
          ['Adapters', 'One per outside service', 'Contain a business rule'],
          ['Data', 'The records, and the locks on them', 'Trust the layers above it'],
          ['Settings', 'Every customer’s own configuration', 'Ever require a release to change'],
        ],
      },
      terms: ['frontend', 'backend', 'API', 'adapter'],
      done: 'The layer boundaries are agreed and there is a check that fails when the code of one layer mentions another it should not know about.',
    },
    {
      id: '1.2',
      do: 'Put every business rule in one place, away from everything replaceable',
      why: `The rules are the only part of this system that is genuinely yours. Frameworks change,
databases get swapped, the screen library goes out of fashion. If the rule that says a dispatch cannot
exceed what was ordered lives inside a screen or inside a database feature, it dies with that thing.
Written as plain functions that take values and return decisions, it outlives all of them — and it can
be tested without starting a database or opening a browser.`,
      done: 'A rule can be tested by calling it directly, with no database, no browser and no network. If a test for a rule needs any of those, the rule is in the wrong place.',
    },
    {
      id: '1.3',
      do: 'Forbid any outside company’s code inside the business rules',
      why: `The instant a service calls a payment provider or a messaging provider directly, that
provider is welded into your system. Every alternative listed in any document becomes decorative,
because reaching it means finding and rewriting every mention. The adapter layer exists precisely to
hold that damage in one small, replaceable place.`,
      terms: ['provider', 'interface'],
      done: 'A search for any provider’s name outside the adapters folder returns nothing, and that search runs automatically on every change.',
    },
  ],
};

/* ── Part 2 · the database ────────────────────────────────────────────────── */

const P2 = {
  n: 2,
  title: 'The database — where everything is kept',
  lead: `The most important layer, and the one where mistakes are least recoverable. A wrong screen
is a bad afternoon; a wrong data shape is a year of workarounds.`,
  terms: ['schema', 'migration'],
  layer: 'db',
  steps: [
    {
      id: '2.1',
      do: 'Build the lock between businesses first, before anything else',
      why: `Everything else in this document assumes it. If it is added later, every table you have
created by then has to be revisited, and the one that gets missed is the one that leaks. It also has to live in
the database rather than only in the application, because the application will one day have a bug and
the lock has to survive it.`,
      terms: ['row-level security', 'table', 'row'],
      done: `A test creates two businesses with real records, asks for the other one’s record by its
exact identifier, and gets nothing back. The same test, run with the lock removed, fails — because a
test that has never failed has not been shown to test anything.`,
      warn: `Test the case where no business is selected at all. Depending on how the setting is read,
that either refuses or quietly returns **everything** — and the second one is a silent, total leak
that every other test would pass straight over.`,
    },
    {
      id: '2.2',
      do: 'Give every business record the same standard columns',
      why: `Repetitive on purpose. Every business table carries the same handful of columns for who
owns the record, when it was made, who made it, when it last changed, and whether it has been ended.
Doing this everywhere means every feature that depends on them — history, undo, audit, reporting —
works everywhere, instead of working on the tables somebody remembered.`,
      table: {
        head: ['Column', 'What it is for'],
        rows: [
          ['identifier', 'Names this one record, unique across the whole system'],
          ['company', 'Which of the customer’s companies it belongs to'],
          ['created at / created by', 'When, and by whom'],
          ['updated at / updated by', 'The same for the last change'],
          ['ended at', 'Set when a record stops applying. **Never deleted**'],
          ['version', 'Stops two people silently overwriting each other'],
        ],
      },
      terms: ['audit trail'],
      done: 'A check reads the schema and fails if any business table is missing one of these.',
    },
    {
      id: '2.3',
      do: 'Store money as whole units, never as a decimal',
      why: `Decimal arithmetic on money loses fractions in ways nobody can trace. Every amount is a
whole number of paise, and every column carrying money says so in its name so a value can never be
read as rupees by mistake. Converting for a report is a division by a hundred of an exact number —
there is no rounding decision left to get wrong.`,
      terms: ['integer paise'],
      done: 'A check fails if any money column is a decimal type, and the arithmetic is proven with a test that would fail under decimals.',
    },
    {
      id: '2.4',
      do: 'Make every changeable value effective-dated, and append-only',
      why: `This is the mechanism that gives a customer complete freedom without breaking their
history. A rate, a role, a person’s position, a tax percentage — none is a single value. Each is a
list of values with the date each started applying. Asking "what was the rate on the 3rd of last
month" is then an ordinary question with an exact answer, rather than an archaeology project.`,
      table: {
        head: ['Column', 'What it is for'],
        rows: [
          ['what', 'The thing being set — a rate, a role, a position'],
          ['who it applies to', 'The person, the item, the company'],
          ['value', 'What it became'],
          ['from date', 'When it started applying'],
          ['to date', 'Empty means still in force'],
          ['changed by', 'The person who made the change'],
        ],
      },
      terms: ['effective date'],
      done: `A report for a past month is run twice — once before a rate change and once after — and
returns the identical figure both times.`,
      note: `Two rows covering the same date for the same thing is a data error, not a preference.
The check for it runs on write, because by the time it shows up in a report the wrong number has
already been paid to somebody.`,
    },
    {
      id: '2.5',
      do: 'Record every change automatically, with no way to switch it off',
      why: `Not a feature — a foundation. A dispute about what a figure was six months ago is answered
by the record or it is not answered at all. Because it cannot be disabled, nobody has to remember to
enable it, and no configuration mistake can quietly remove it.`,
      done: 'Changing any record writes a history entry naming what changed, from what, to what, by whom and when — and there is no setting anywhere that stops it.',
    },
  ],
};

/* ── Part 3 · the backend ─────────────────────────────────────────────────── */

const P3 = {
  n: 3,
  title: 'The backend — where the work actually happens',
  lead: `The part nobody sees, which does everything that matters: checks the rules, saves the
records, calculates the totals, and refuses what should be refused.`,
  layer: 'runtime',
  terms: ['backend'],
  steps: [
    {
      id: '3.1',
      do: 'Organise the backend by what it does, not by what technology it uses',
      why: `Group the code by business area — sales, stock, payroll, accounts — rather than by
technical type. A person fixing how a discount works then opens one folder instead of five, and a
whole area can be lifted into its own service later without unpicking it from everything else.`,
      done: 'Someone new can find where a business rule lives from the name of the business area alone, without being told.',
    },
    {
      id: '3.2',
      do: 'Make one action do all of its consequences, or none of them',
      why: `A sale reduces stock, raises an invoice, posts to the ledger and updates what the customer
owes. If three of those succeed and one fails, the books are wrong and nobody knows. All of it happens
together or none of it does — and the middle state never exists, even for a moment, even if the
machine loses power in between.`,
      done: 'A test interrupts an action half way through and confirms the records are exactly as they were before it started.',
    },
    {
      id: '3.3',
      do: 'Design the API so a screen never decides anything',
      why: `Screens exist on phones, on laptops, and eventually in places nobody planned for. Every
one of them must reach the same rules. The moment a screen calculates a total or decides whether an
approval is needed, that logic has to be repeated in the next screen — and the two will disagree.`,
      terms: ['API'],
      done: 'Every calculation and every permission decision can be reproduced by calling the API directly, with no screen involved.',
    },
    {
      id: '3.4',
      do: 'Make the API answer honestly when something is refused',
      why: `A refusal is information. "Not allowed" tells a user nothing and generates a support call;
"this dispatch is 12 more than the order allows" tells them what to do. And a refusal caused by
somebody else’s change must say so, rather than looking like their own mistake.`,
      done: 'Every refusal names what was refused and why, in words a user can act on without phoning anyone.',
    },
  ],
};

/* ── Part 4 · the frontend ────────────────────────────────────────────────── */

const P4 = {
  n: 4,
  title: 'The frontend — the screens, drawn from settings',
  lead: `The single idea that makes one system serve every industry: **screens are described as
data, not written one by one.** A screen definition says which fields, in what order, with what
labels, under what conditions. Change the definition and the screen changes — no code, no release.`,
  layer: 'ui',
  terms: ['frontend'],
  steps: [
    {
      id: '4.1',
      do: 'Describe screens as settings rather than building them individually',
      why: `Hand-built screens are the reason most business software cannot be customised. Every
customer request becomes a code change, and the code grows a branch for each customer until nobody
can safely change anything. If the screen is a description, a customer adding a field is a new line in
their own settings — and it affects nobody else at all.`,
      table: {
        head: ['A screen definition says', 'So a customer can'],
        rows: [
          ['Which fields appear, and in what order', 'Hide what they do not use, promote what they do'],
          ['What each field is called', 'Use their own trade’s words'],
          ['Which are required', 'Enforce their own discipline'],
          ['Which extra fields they added', 'Record what only they need'],
          ['What the columns and filters are', 'See their work the way they think about it'],
          ['Which actions the buttons offer', 'Match their own process'],
        ],
      },
      done: 'Adding a field to a screen for one customer is done in the app, takes effect at once, and changes nothing for any other customer.',
    },
    {
      id: '4.2',
      do: 'Build one design system and use it everywhere',
      why: `Every screen drawn from the same set of parts means the system feels like one product
rather than twenty. It also means an improvement to a table — better sorting, better behaviour on a
phone — arrives everywhere at once instead of being reimplemented per screen.`,
      done: 'A new screen can be assembled from existing parts without writing new visual code.',
    },
    {
      id: '4.3',
      do: 'Design for a bad connection and a small screen first',
      why: `The people entering most of the data are not at a desk. They are on a shop floor, in a
godown, on a site, on a phone, on a connection that comes and goes. A screen that only works on a
fast laptop connection is a screen that does not get used, and the data it should have captured gets
written on paper instead.`,
      done: 'Every screen that captures data is usable one-handed on a phone, and says clearly what happened if the connection dropped mid-save.',
    },
    {
      id: '4.4',
      do: 'Let a customer turn whole modules on and off',
      why: `A creator selling courses has no godown. A steel plant has no reels to publish. Showing
everybody every module makes the product look bloated to all of them and correct for none. The menu is
a setting, so each business ends up with a system that looks built for it.`,
      done: 'Turning a module off removes it from the menu and keeps every record it ever held — tidying a menu never destroys data.',
    },
  ],
};

/* ── Part 5 · storage and memory ──────────────────────────────────────────── */

const P5 = {
  n: 5,
  title: 'Storage and memory — files, speed, and what is remembered',
  lead: `Three different things that get confused with each other: where files live, what is kept
handy for speed, and what the assistant is allowed to know.`,
  layer: 'files',
  terms: ['storage', 'cache'],
  steps: [
    {
      id: '5.1',
      do: 'Keep files outside the database, and never trust their names',
      why: `Photographs and scans are large, and a database is an expensive place to keep large
things. They go in a file store, with the database holding only a reference. A file also arrives from
outside, so its name and its claimed type are somebody else’s input: both are checked, and the file is
stored under a name the system chose.`,
      done: 'A file can be uploaded, fetched and deleted through one interface, and swapping the file store underneath changes one setting.',
    },
    {
      id: '5.2',
      do: 'Make every file access ask permission, every time',
      why: `The most common serious leak in business software is a file link that works for anybody
who has it. A photograph of a signed document is as sensitive as the record it belongs to, and it
must inherit exactly the same permission, checked on every single fetch.`,
      done: 'A link to another business’s file, used by someone from a different business, is refused — proven by a test that tries it.',
    },
    {
      id: '5.3',
      do: 'Use the cache only for things that can be safely lost',
      why: `The cache exists to make common screens fast. The moment anything is kept **only** in the
cache, restarting it loses data — and caches get restarted routinely. Everything in there is a copy;
losing the whole thing costs a slow minute and nothing else.`,
      done: 'The cache can be wiped completely while the system is running, and nothing is lost but speed.',
    },
    {
      id: '5.4',
      do: 'Decide exactly what the assistant may remember, and for how long',
      why: `An assistant that answers questions about a business needs to see that business’s data —
and must never see another’s, must never keep it after the question is answered, and must never learn
from it in a way that could surface it elsewhere. This is a decision to make deliberately at design
time, because discovering it later means discovering it the wrong way.`,
      table: {
        head: ['May remember', 'May never'],
        rows: [
          ['The current conversation, until it ends', 'Cross a business boundary, ever'],
          ['What the user is looking at right now', 'Retain business data after answering'],
          ['Settings and vocabulary for this business', 'Be used to train anything'],
          ['A saved answer the user chose to keep', 'Hold a password, a key or a card number'],
        ],
      },
      terms: ['model'],
      done: 'The retention rules are written down, enforced in code, and a test proves one business’s question cannot reach another’s data.',
    },
  ],
};

/* ── Part 6 · sign-in and permissions ─────────────────────────────────────── */

const P6 = {
  n: 6,
  title: 'Sign-in and permissions',
  lead: `Two separate questions kept deliberately apart: who are you, and what may you do. The first
can be handed to somebody else. The second never can.`,
  layer: 'auth',
  terms: ['authentication', 'role', 'permission'],
  steps: [
    {
      id: '6.1',
      do: 'Separate proving who somebody is from deciding what they may do',
      why: `Large customers will insist on using their own company sign-in, and that is reasonable —
it is how they remove access when somebody leaves. But no outside sign-in system knows that this
person may approve purchases up to a limit in one of your companies and only view stock in another.
That decision stays here, always.`,
      done: 'Sign-in can be switched to an outside provider without any change to how permissions work.',
    },
    {
      id: '6.2',
      do: 'Make permissions specific to the company, not just the person',
      why: `Somebody who works across two companies in a group is not the same person in both. Giving
one blanket level of access across a group is how a figure from one company ends up in a report for
another, and it cannot be untangled afterwards.`,
      done: 'A user working in two companies sees exactly what their role allows in each, and this is proven by a test that tries to cross.',
    },
    {
      id: '6.3',
      do: 'Check permission in the backend and again in the database',
      why: `Hiding a button is not security — it is tidiness. The check that matters happens where the
data is. Two layers, because one layer is one mistake away from an incident, and the layers fail
independently.`,
      done: 'A request that bypasses the screens entirely is still refused, proven by calling the API directly with a role that should not be allowed.',
    },
  ],
};

/* ── Part 7 · the outside world ───────────────────────────────────────────── */

const P7 = {
  n: 7,
  title: 'Talking to the outside world',
  lead: `Messages, storefronts, marketplaces, couriers, payments. Every one is somebody else’s
system, every one will change without warning, and every one will be down at some point. The design
assumes all three.`,
  layer: 'messaging',
  steps: [
    {
      id: '7.1',
      do: 'Build the plug, not the account — every connection belongs to the customer',
      why: `**This is worth being exact about.** The platform needs no messaging account, no
marketplace seller account and no payment account of its own. A business’s conversations with its own
customers, and its own selling accounts, belong to that business. What the platform provides is the
place to plug them in, and the code that knows how to talk to each kind.

Building it the other way — one central account that everyone shares — makes the platform the account
holder for other people’s customers, and makes every customer dependent on a relationship they have no
control over.`,
      terms: ['adapter'],
      done: 'A customer connects their own accounts in the app, and the platform holds no account of its own for any of these.',
    },
    {
      id: '7.2',
      do: 'Give every capability an ordered fallback, ending somewhere that needs nothing',
      why: `A courier service stops answering at nine at night. A messaging provider hits a limit
mid-broadcast. A model provider runs out of quota half way through. In each case the work must
continue down the list rather than stop — and the last item must be something that needs no outside
service at all, even if that means a manual step. That last item is what turns an outage into an
inconvenience.`,
      terms: ['fallback', 'circuit breaker'],
      done: 'Every capability has a written fallback order whose final entry needs nothing bought or connected, and a test proves the work completes when the first choice is unavailable.',
    },
    {
      id: '7.3',
      do: 'Stop hammering a service that keeps failing',
      why: `When an outside service is broken, retrying it constantly makes everything slow while
achieving nothing. After a few failures it is taken out of the list, the work moves to the next
option, and it is tried again once after a pause.`,
      done: 'A provider failing repeatedly is taken out of use automatically, and returns by itself once it recovers.',
    },
    {
      id: '7.4',
      do: 'Never let an outside system be the source of a figure the business reports',
      why: `Numbers come from your own records. An outside service can tell you a payout happened;
what that payout **means** to your books is decided here, from your own data, against what you
expected. Otherwise a mistake in somebody else’s system silently becomes a mistake in your accounts.`,
      done: 'Every figure in every report can be traced to a record in this system, never to an outside response that was taken on trust.',
    },
  ],
};

/* ── Part 8 · background work and search ──────────────────────────────────── */

const P8 = {
  n: 8,
  title: 'Work that happens on its own, and finding things',
  lead: `Nobody should watch a progress bar while a thousand messages send or a month closes.`,
  layer: 'jobs',
  terms: ['queue', 'job'],
  steps: [
    {
      id: '8.1',
      do: 'Make every background job safe to run twice',
      why: `Machines restart, connections drop, and a job that was half done gets picked up again.
If running it twice sends the message twice or posts the payment twice, every failure becomes a
cleanup. Written so that running it again reaches the same result, a failure becomes a retry.`,
      done: 'Every job is run twice deliberately in a test, and the result is identical to running it once.',
    },
    {
      id: '8.2',
      do: 'Let a job that fails be seen, understood and retried',
      why: `A job that fails silently is worse than one that fails loudly — the work simply never
happened and nobody finds out until a customer asks. Failures are visible, keep the reason, and can be
retried without a developer.`,
      done: 'A failed job appears in a screen with its reason, and an admin can retry it.',
    },
    {
      id: '8.3',
      do: 'Start with the database for search, and keep records the source of truth',
      why: `A separate search engine is another thing to run, back up and keep in step. The database
can search well enough for a long time. When a separate engine is eventually needed, it is a faster
copy — never the place the records live — so it can be rebuilt from scratch at any time.`,
      terms: ['search index'],
      done: 'Search can be turned off entirely and every record remains reachable, if less conveniently.',
    },
  ],
};

/* ── Part 9 · the model layer ─────────────────────────────────────────────── */

const P9 = {
  n: 9,
  title: 'The artificial intelligence layer',
  lead: `Useful for writing descriptions, tagging photographs, summarising and answering questions.
Dangerous when it becomes something the business cannot operate without, or a bill nobody capped.`,
  layer: 'ai',
  terms: ['model', 'spend ceiling'],
  steps: [
    {
      id: '9.1',
      do: 'Put a router in front of every model, never call one directly',
      why: `Providers change price, change quality, change terms and disappear. A router means the
system asks for a capability — "write a description", "tag this photograph" — and the router decides
who does it, in what order, and what happens when one fails. Adding or removing a provider is a list
entry.`,
      done: 'Adding a new provider requires no change to any business rule, and removing one changes nothing but the list.',
    },
    {
      id: '9.2',
      do: 'Cap the spending, and make the cap refuse rather than warn',
      why: `A warning arrives after the money is gone. The ceiling is checked before each paid call,
and over it the paid provider is simply refused — the work then completes on an option that costs
nothing. Because every capability is guaranteed a free path, a spent budget stops the spending without
ever stopping the business.`,
      done: 'With the ceiling set to zero, every capability still completes its work, proven by a test that sets it to zero and runs the full set.',
    },
    {
      id: '9.3',
      do: 'Never let a model decide anything that moves money or stock',
      why: `A model is good at language and unreliable about facts. It may draft, suggest, classify
and summarise. It may not approve a payment, adjust a stock figure, post to the ledger or change a
price by itself. The line is not about how good the model is — it is that a wrong number produced by a
person can be traced to a decision, and a wrong number produced by a model cannot.`,
      done: 'An assistant asked to move money declines and produces a request for a person to approve. This is tested by asking it to.',
    },
    {
      id: '9.4',
      do: 'Make every answer traceable to the records it came from',
      why: `An assistant that answers "your best-selling item last month" must be answerable when
somebody disagrees. Every answer carries what it looked at, so a wrong answer is a question about the
data rather than a mystery.`,
      done: 'Every assistant answer can be expanded to show the records behind it, and those records can be opened.',
    },
  ],
};

/* ── Part 10 · running it ─────────────────────────────────────────────────── */

const P10 = {
  n: 10,
  title: 'Running it',
  lead: `Getting it built is half. Being able to change it every week for years without fear is the
other half, and it is the half that decides whether the product survives.`,
  layer: 'ci',
  terms: ['environment', 'deployment', 'continuous integration', 'rollback', 'observability', 'uptime'],
  steps: [
    {
      id: '10.1',
      do: 'Keep separate copies for trying things and for real customers',
      why: `Nobody should learn that a change breaks payroll by watching it break a real payroll. A
practice copy carries realistic but not real data, so mistakes cost an afternoon rather than a
customer.`,
      done: 'A change can be tried end to end somewhere that no customer can see.',
    },
    {
      id: '10.2',
      do: 'Make a robot check every change before a person can release it',
      why: `Human review catches design mistakes. It does not reliably catch that a change broke
something three modules away. Automatic checks do, on every single change, without getting tired or
being in a hurry on a Friday evening.`,
      done: 'No change reaches customers without every check passing, and this cannot be skipped by anyone.',
    },
    {
      id: '10.3',
      do: 'Be able to put the previous version back in minutes',
      why: `Something will get through. What separates a scare from an incident is how fast the last
working version can return. If going back is difficult, the pressure will be to fix forward under
stress, which is how a small problem becomes a large one.`,
      done: 'Going back to the previous version is one command, practised at least once before anyone depends on it.',
    },
    {
      id: '10.4',
      do: 'Package it so it can run anywhere',
      why: `The moment something host-specific gets in, the hosting choice is locked and moving means
a project. Packaged as an ordinary container with nothing host-specific inside, moving is a decision
rather than an undertaking.`,
      done: 'The same package runs on a laptop, on a rented server, and on a managed platform, with only settings differing.',
    },
    {
      id: '10.5',
      do: 'Be able to see what is happening without guessing',
      why: `When something is slow or wrong at four in the afternoon with customers waiting, the
question is where — and guessing is expensive. Structured records of what happened, how long it took
and what failed turn that into a lookup.`,
      done: 'A failure can be traced from the user’s click to the exact operation that failed, without adding new logging first.',
    },
    {
      id: '10.6',
      do: 'Back it up, and prove the backup by restoring it',
      why: `An untested backup is a belief, not a protection. The only proof is a restore into a
scratch copy, done deliberately, before it is ever needed.`,
      terms: ['backup'],
      done: 'A backup has been restored into a scratch environment and checked, and that is repeated on a schedule.',
    },
  ],
};

/* ── Part 11 · security ───────────────────────────────────────────────────── */

const P11 = {
  n: 11,
  title: 'Security, stated plainly',
  lead: `Short, because these are absolutes rather than preferences.`,
  steps: [
    {
      id: '11.1',
      do: 'Never ask anyone for a marketplace, bank or account password',
      why: `Every connection is made with a key the customer creates and can withdraw. A password
hands over an account that cannot be taken back and cannot be limited. This is a promise the product
makes, so nothing in the software, the documents or a support conversation may ever break it.`,
      done: 'No screen, no form and no support process anywhere asks for one, and the product says so openly.',
    },
    {
      id: '11.2',
      do: 'Keep keys out of the code, always',
      why: `A key written into the code is in every copy of that code, forever, including copies you
no longer control. Kept outside, a key can be replaced in a minute.`,
      terms: ['encryption'],
      done: 'A search of the whole history finds no key, and that search runs automatically on every change.',
    },
    {
      id: '11.3',
      do: 'Treat identity documents and bank details as read-once, never stored',
      why: `Identity and bank numbers may be needed for a calculation or a payment file. They are used
and not written into anything that is kept, because a stored copy is a liability that grows quietly
until the day it is stolen.`,
      done: 'No committed file and no exported document contains an identity number, a bank account or a card number.',
    },
    {
      id: '11.4',
      do: 'Let a person’s data be corrected and removed on request',
      why: `Keeping a record for the law and removing a person’s data on request are two different
obligations that resolve differently, and a system with only one of them will breach the other.`,
      done: 'Both are separate, recorded settings, and a request of either kind can be carried out and evidenced.',
    },
  ],
};

/* ── Part 12 · the order of building ──────────────────────────────────────── */

const P12 = {
  n: 12,
  title: 'What order to build it in',
  lead: `The order is not a preference. Each stage exists because the next one cannot be trusted
without it, and each finishes when a test proves it rather than when the code is written.`,
  buildOrder: true,
  steps: [
    {
      id: '12.1',
      do: 'Finish a stage only when its test passes, never when its code is written',
      why: `"Done" is the most abused word in software. A stage that is finished because somebody
believes it is finished will be discovered later, from the far side of three stages built on top of
it. A stage finished because a test proves it can be built on.`,
      done: 'Every stage has one written test that decides it, agreed before the stage starts.',
    },
    {
      id: '12.2',
      do: 'Build the modules in the order they are numbered',
      why: `They are numbered in the order their dependencies allow. A product exists before it is
stock; a customer exists before a sale; demand exists before a purchase; stock exists before it moves;
the books exist before they close. Building out of order means inventing the thing you need and
correcting it later.`,
      done: 'No module is started before the ones it reads from can supply real records.',
    },
  ],
};

/* ── Part 13 · the ordered path, empty machine to deployed ────────────────── */
/* WHY THIS PART EXISTS, AND WHY IT IS LAST.
 *
 * Parts 0 to 12 are the design, layer by layer. That is the right shape for deciding, and the
 * wrong shape for doing: a reader who has agreed every decision still does not know what to type
 * first. The owner asked for exactly the missing half — "break it into easy steps with guidelines
 * for how I start, till deployment, step by step" — and a design document that answers everything
 * except where to begin has not answered him.
 *
 * So this part is the same system read the other way round: not by layer, but in the order the
 * work can actually be done, with the command and the check that decides each stage. It is last
 * because every stage here points back at a decision one of the earlier parts made, and reading
 * the order before the reasons produces somebody typing commands they cannot defend.
 *
 * THE COMMANDS ARE THE DEFAULTS, THE CHECKS ARE THE INVARIANTS.
 * Every command below uses the default tool from the stack register. Swap a layer and the command
 * changes; the check does not, because the check states what must be true and not what runs it.
 * That is the whole of Rule 1 in operation, and it is why the checks are written out separately
 * rather than folded into the commands.
 *
 * SEVERAL STAGES ARE PROVEN BY BEING MADE TO FAIL FIRST.
 * A check that has only ever been green is a check nobody has tested. Isolation, money and the
 * anti-hard-coding gate each say here how to make them go red on purpose before trusting them,
 * because all three fail silently — a running system with no isolation at all looks exactly like
 * a running system.
 */

const P13 = {
  n: 13,
  title: 'From an empty machine to a live product — the order, with the commands',
  lead: `Everything before this part is *what* to build and *why*. This part is *when*, and what to
type. It assumes a machine with nothing on it and ends with a real sale, entered by a real person, in
a real company, visible in that company’s books and invisible to every other business on the platform.

**Seventeen stages. Each one has a command, and a check that decides it.** A stage is not finished
because its code is written — it is finished because its check passes, and several of the checks here
must first be made to fail on purpose, because what they guard against fails silently.

| | Stage | What it settles |
|---|---|---|
| 13.1–13.2 | The machine and the repository | The tools answer, and there is a way to run a check |
| 13.3–13.5 | The database and its roles | One business cannot read another — proven, not configured |
| 13.6–13.7 | Money and dates | Amounts are exact, and last month does not move |
| 13.8–13.10 | Backend, settings, screens | The system runs, and its shape comes from data |
| 13.11–13.12 | The modules and the trade | Built in order, and a second trade proves the first |
| 13.13–13.15 | Checks, packaging, the machine | Every change is gated, one package moves everywhere |
| 13.16–13.17 | The first sale, and going back | The only proof, and the way out |

**Every command below uses the default tool named in the stack register — and the check does not.**
That separation is deliberate and it is the whole of Rule 1 in operation: the command says what to
type with the tools Parts 2 to 10 chose, and the check says what must be true regardless. Decide any
layer differently and you rewrite the command; the check is unchanged, word for word.`,
  terms: ['industry pack'],
  steps: [
    {
      id: '13.1',
      do: 'Put the tools on the machine and write down which versions',
      why: `Four tools, and nothing else, before any code exists: something to run the backend,
something to talk to the database, source control, and a way to package the result. Writing the
versions into the repository rather than remembering them is what stops the sentence "it works on
mine" from ever being the diagnosis — the version that built it is the version that runs it.`,
      cmd: `node --version      # the backend runtime
psql --version      # the database client
git --version       # source control
docker --version    # how it gets packaged`,
      check: `node --version && psql --version && git --version && docker --version`,
      checkExpect: 'four version lines and no error. Put each one in the repository — the runtime ' +
        'version in the project file, the database version in the deployment settings — so a ' +
        'machine that disagrees is caught by a check rather than by a bug.',
      note: `These are the defaults from the stack register. A different runtime or a different
database changes these four lines and changes nothing else in this part.`,
      done: 'Every tool answers with a version, and every version is written in the repository rather than remembered by a person.',
    },
    {
      id: '13.2',
      do: 'Create the repository, and give it a check command before it has anything to check',
      why: `The command that runs the checks should be added on the first day, when it is trivial and
nobody is under pressure, not on the day somebody needs it. A project that gets its test command late
gets it while something is broken, and a test command written while something is broken is written to
pass.`,
      cmd: `git init
npm init -y
npm pkg set scripts.test="node --test"
npm pkg set scripts.check="npm test"
npm test`,
      checkExpect: 'it runs and it passes, with no tests. That is the point — the command itself is ' +
        'proven to work before anything depends on the answer it gives.',
      check: `npm test && echo "the check command works"`,
      done: 'One command runs every check the project has, it exits non-zero when any of them fails, and it existed before the first feature did.',
    },
    {
      id: '13.3',
      do: 'Create the database and three roles — and connect as the weakest of them',
      why: `This is the single line that decides whether isolation exists at all. The policies are
written against a role that cannot log in; the application connects as a login role that inherits it
and owns nothing. A superuser is never subject to a policy — not even one marked to force it — so an
application that connects as the superuser has every policy in the schema and no isolation whatsoever,
and nothing about the running system would look wrong.`,
      cmd: `createdb medhava

# the role that owns the tables — migrations run as this one
psql medhava -c "CREATE ROLE app_owner NOLOGIN;"

# the role every isolation policy names
psql medhava -c "CREATE ROLE authenticated NOLOGIN NOSUPERUSER;"

# the role the application connects as: not a superuser, not the owner
psql medhava -c "CREATE ROLE medhava_app LOGIN PASSWORD '...';"   # from the secret store, never from a file
psql medhava -c "GRANT authenticated TO medhava_app;"`,
      check: `psql medhava -Atc "SELECT rolname, rolsuper FROM pg_roles WHERE rolname = 'medhava_app';"`,
      checkExpect: '`medhava_app|f`. If the second column is `t`, stop here — everything built on ' +
        'top of it will be tested against a role that cannot fail the test.',
      warn: `The password goes in from the secret store at the moment the role is created, and into
nothing else. A key committed once is in every copy of that history forever, and rotating it does not
remove it from the copies.`,
      done: 'The application’s login role exists, is neither a superuser nor the owner of any table, and the connection string used by every environment names it.',
    },
    {
      id: '13.4',
      do: 'Write the schema as numbered, forward-only files, and rebuild it from empty',
      why: `A schema kept as one file that people edit has no history, and the only copy that is
certainly correct is whichever machine somebody last ran it on. Numbered files that only ever go
forward can be replayed onto an empty database, which means the schema is a thing you can rebuild
rather than a thing you have.`,
      cmd: `mkdir -p migrations
# migrations/0001_tenants_and_companies.sql
# migrations/0002_row_level_security.sql
# migrations/0003_ledger.sql   ... and so on, never edited once applied

for f in migrations/*.sql; do psql -q -v ON_ERROR_STOP=1 medhava -f "$f"; done`,
      check: `createdb medhava_rebuild
for f in migrations/*.sql; do psql -q -v ON_ERROR_STOP=1 medhava_rebuild -f "$f"; done
pg_dump -s medhava_rebuild | sha256sum
dropdb medhava_rebuild`,
      checkExpect: 'the same hash every time, from an empty database. Run it again after the next ' +
        'migration and the hash must change once and stay stable — a hash that differs between two ' +
        'runs of the same files means something in the schema depends on the order two people ' +
        'happened to work in.',
      done: 'The whole schema can be rebuilt from nothing by replaying the files in order, and doing so twice gives byte-identical results.',
    },
    {
      id: '13.5',
      do: 'Make the isolation test fail on purpose before believing that it passes',
      why: `Isolation is the one thing on this platform that fails silently. Every screen works, every
report returns numbers, every customer is happy, and one business is reading another’s orders. A test
that has only ever passed cannot tell you whether it is testing anything, so make it fail first — as
the role that bypasses the policy — and only then trust the pass.`,
      cmd: `# two companies, one order each, then ask for one company as two different roles

# (a) as the superuser — the policy is never consulted
psql medhava -Atc "SET app.current_company = 'A'; SELECT count(*) FROM sales_order;"

# (b) as the application role — the policy applies
psql "postgresql://medhava_app@localhost/medhava" \\
     -Atc "SET app.current_company = 'A'; SELECT count(*) FROM sales_order;"`,
      check: `# and the third case, which is the one people forget
psql "postgresql://medhava_app@localhost/medhava" -Atc "SELECT count(*) FROM sales_order;"`,
      checkExpect: '(a) gives `2` — both companies, because a superuser bypasses the policy even ' +
        'when the table is set to force it. (b) gives `1`. The third, with no company set at all, ' +
        'must **raise an error** — not return `2`, and not return `0`. An unset value that matches ' +
        'everything is the same defect as no policy, arrived at by a different route.',
      warn: `If (a) returns one row as well, the test is not testing anything — either the two
companies are not both in the table, or the connection is not the one you think it is. Fix the test
until it can fail, before you record that it passes.`,
      done: 'The isolation check has been seen red as the wrong role and green as the right one, the unset case raises, and all three runs are in the automatic checks.',
    },
    {
      id: '13.6',
      do: 'Store money as whole paise in integers, and see for yourself why',
      why: `Money kept as a decimal fraction is wrong by amounts too small to notice and large enough
to break a reconciliation. It is not a rounding preference — it is that the number the machine stores
is not the number you typed, and the difference compounds across a month of postings.`,
      cmd: `psql medhava -Atc "SELECT 0.1::float8 + 0.2::float8;"
psql medhava -Atc "SELECT (10 + 20)::bigint;"`,
      expect: 'the first prints `0.30000000000000004`. That is the entire argument. The second ' +
        'prints `30`, and always will.',
      check: `# the gate, so that the next person cannot reintroduce it
psql medhava -Atc "SELECT table_name || '.' || column_name
                     FROM information_schema.columns
                    WHERE data_type IN ('real','double precision')
                      AND (column_name LIKE '%amount%' OR column_name LIKE '%paise%'
                           OR column_name LIKE '%price%' OR column_name LIKE '%rate%');"`,
      checkExpect: 'nothing at all. One row means an amount somewhere is a fraction, and the month ' +
        'it corrupts will be a month that has already been paid.',
      done: 'Every money column is a whole-number type in paise, the gate that finds a fractional one runs on every change, and the gate has been seen to catch a planted column.',
    },
    {
      id: '13.7',
      do: 'Make every changeable value a dated row, and make a missing one raise rather than return zero',
      why: `A rate changes in April and last March must not move by a rupee. So a value is never
overwritten: the row in force is closed the day before, and a new row is added starting from the new
date. A value asked for on a date no row covers is an error — never zero, and never the nearest one.
Zero is the dangerous answer because it looks like an answer: it pays somebody nothing, posts cleanly,
and is discovered by the person who was not paid.`,
      table: {
        head: ['Column', 'Why it is there'],
        rows: [
          ['`tenant_id`, `company_id`', 'Every row names its owner. This is what the isolation policy reads.'],
          ['`subject_id`', 'Whose value this is — a person, a design, a channel, a tax code.'],
          ['`value`', 'Whole paise for money, a plain number for hours, text for a label.'],
          ['`from_date`', 'The day it starts applying. May be in the future — it activates by itself.'],
          ['`to_date`', 'Empty means still in force. Set to the day before the next row starts.'],
          ['`entered_by`, `entered_at`', 'Who changed it and when. Never edited, never deleted.'],
        ],
      },
      check: `# ask for a date before the first row exists
curl -fsS "http://localhost:3000/api/rate?subject=SOME_ID&on=1990-01-01"`,
      checkExpect: 'an error that names the subject and the date. If it returns `0`, or the earliest ' +
        'rate, or an empty object, the resolver is guessing — and a resolver that guesses will guess ' +
        'in payroll.',
      warn: `Adding a row must never update one. If any code path writes over a value instead of
closing it and appending, the audit trail has a hole exactly where somebody would want one.`,
      done: 'Values resolve by date, a future-dated row activates on its own day, a closed period returns what it returned at the time, and a date with no row raises an error naming what was asked for.',
    },
    {
      id: '13.8',
      do: 'Start the backend with two endpoints — one that says it is alive, one that refuses you',
      why: `Before any business logic, prove the two things every later stage assumes: the process
answers, and it refuses a request that carries no session. Every business request sets the tenant and
the company on the connection before it touches a table, and a request that cannot say who it is has
nothing to set.`,
      cmd: `npm run dev

# in another terminal
curl -fsS http://localhost:3000/health
curl -s -o /dev/null -w '%{http_code}\\n' http://localhost:3000/api/sales-orders`,
      check: `test "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/sales-orders)" = "401" \\
  && echo "refused, as it should be"`,
      checkExpect: 'the health endpoint answers, and the business endpoint gives `401` — not `200` ' +
        'with an empty list, which is what a system with no isolation returns and which reads as ' +
        'success in every log you will ever look at.',
      done: 'The process answers on its health endpoint, every business endpoint refuses an unauthenticated request, and an authenticated one sets the tenant and company on the connection before its first query.',
    },
    {
      id: '13.9',
      do: 'Add the gate that refuses a compiled-in value, and watch it go red',
      why: `The promise the whole product rests on is that a business changes its own values without a
developer. That promise survives exactly as long as nobody types a count, a rate, a threshold or a
person’s name into the code, and prose asking them not to has never stopped anybody. A gate does.`,
      cmd: `npm pkg set scripts.check="npm test && node tools/checkstatic.js"`,
      check: `# plant one, prove the gate catches it, then take it back out
echo 'const CHANNELS = 7;' >> src/config.ts
npm run check          # must exit non-zero and name the file and the line
git checkout src/config.ts
npm run check          # green again`,
      checkExpect: 'red, then green. The words to refuse are the ones a tenant owns — how many ' +
        'channels or companies, a rupee rate, an hours threshold, a shift, and any name from the ' +
        'staff list. Structure may be constant; a value somebody would ever want to change may not.',
      note: `Seed files, tests and documents are exempt, and the exemption is written down with its
reason. Tests in particular must be able to say a number out loud — that is how they prove the number
came through from the data rather than from the code.`,
      done: 'The gate runs inside the one check command, it has been seen to fail on a planted literal, and its exempt list names a reason for every entry.',
    },
    {
      id: '13.10',
      do: 'Draw the screens from settings, and change a word without a release',
      why: `The screens are the place a per-customer fork starts, because a label is the smallest
possible thing to hard-code and the easiest to justify once. If the first screen reads its words,
its columns and its steps from settings, every screen after it will, and the answer to "can you
change what we call this" is never a release.`,
      cmd: `# one list screen, generated from the module and field settings — no per-customer file`,
      check: `# change the word, reload, do not deploy anything
curl -fsS -X PATCH http://localhost:3000/api/settings/labels \\
     -H 'content-type: application/json' \\
     -d '{"sales_order":"Order Sheet"}'`,
      checkExpect: 'the screen says *Order Sheet* on the next load, in that business only, with ' +
        'nothing rebuilt and nothing restarted, and every other business unaffected.',
      done: 'A label, a column and a workflow step can each be changed by a customer in the app, take effect immediately, and affect no other customer.',
    },
    {
      id: '13.11',
      do: 'Build the modules in the numbered order, and finish each one on its rules',
      why: `The numbering in Part 12 is dependency order, not preference: a product exists before it is
stock, a customer before a sale, stock before it moves, the books before they close. Building out of
order means inventing the record you need and correcting it later, and the correction is always
larger than the wait would have been. A module is finished when its rules hold — not when its screens
exist, because screens can be demonstrated and rules are what the books rely on.`,
      cmd: `# one module at a time, in the order of the table in Part 12
npm run check          # every rule for every module built so far, on every change`,
      check: `npm run check -- --module 04`,
      checkExpect: 'every rule belonging to that module reported by name, each one passing, and the ' +
        'count matching the rulebook. A module reporting fewer rules than the rulebook lists for it ' +
        'has rules nobody wrote a check for.',
      done: 'No module is started before the ones it reads from can supply real records, and none is called finished until every rule the rulebook lists for it passes by name.',
    },
    {
      id: '13.12',
      do: 'Configure one trade entirely as data, then a second one, to prove the first was not special',
      why: `A single configured trade proves nothing — the code may simply have been written for it.
The second one is the test, and it has to be a trade that does not resemble the first: different
words, different stages, different documents, different modules switched on. If the second needs one
line of code, the design has not held and it is far cheaper to learn that now than at the fourth
customer.`,
      cmd: `# a settings file per trade — words, stages, documents, which modules are on
npm run pack:load -- packs/apparel.json
npm run pack:load -- packs/steel.json`,
      check: `git diff --stat HEAD~1 -- src/`,
      checkExpect: 'no change under `src/` between loading the first trade and the second. Settings ' +
        'files changed; code did not.',
      done: 'Two unlike trades run on the same code, each seeing its own words and its own stages, and configuring the second one changed no source file.',
    },
    {
      id: '13.13',
      do: 'Run every check automatically on every change, and prove it can refuse one',
      why: `A check that runs when somebody remembers is a report. A check that runs on every change
and can block it is a gate. The difference matters most on the day somebody is in a hurry, which is
the day the check exists for.`,
      cmd: `# one job, running the same command a developer runs
# .github/workflows/check.yml  →  npm ci && npm run check`,
      check: `# push a change that breaks a gate on purpose, on a branch
git checkout -b prove-the-gate
echo 'const COMPANIES = 3;' >> src/config.ts
git commit -am "prove the gate" && git push -u origin prove-the-gate`,
      checkExpect: 'the automatic check fails and the change cannot be merged. Delete the branch ' +
        'afterwards — but not before somebody has seen it refused.',
      done: 'Every check runs on every change, a change that fails one cannot be merged, and that refusal has been observed rather than assumed.',
    },
    {
      id: '13.14',
      do: 'Package once, and move that exact package between environments',
      why: `Rebuilding for each environment means the thing that was tested is not the thing that was
released, and the difference between them is discovered by customers. Build one package, name it after
the exact change it was built from, and promote that same package forward.`,
      cmd: `docker build -t medhava:"$(git rev-parse --short HEAD)" .
docker push medhava:"$(git rev-parse --short HEAD)"`,
      check: `docker image inspect --format '{{index .RepoDigests 0}}' medhava:"$(git rev-parse --short HEAD)"`,
      checkExpect: 'a digest. The same digest must appear in the practice environment and in the ' +
        'live one — if they differ, two different things were released and only one of them was tested.',
      done: 'One package per change, named after the change, and the digest running live is the digest that passed the checks.',
    },
    {
      id: '13.15',
      do: 'Put it on a machine — and follow the server runbook, which owns this part',
      why: `The machine, the names, the certificates, the web server in front, the backups and the
watching are one subject with one document, and splitting it across two is how a step gets done in one
of them. What belongs here is only the order: the machine is secured before anything listens on it,
the names point at it before certificates are requested, and the database role from 13.3 is the one in
the connection string.`,
      cmd: `# the runbook, in its own order:
#   secure the machine  →  swap space  →  DNS  →  web server and certificates
#   →  the database role  →  settings and keys  →  backups  →  watching`,
      check: `curl -fsS https://app.example.com/health
curl -s -o /dev/null -w '%{http_code}\\n' https://app.example.com/api/sales-orders`,
      checkExpect: 'the health endpoint answers over an encrypted connection, and the business ' +
        'endpoint still gives `401` from the public internet exactly as it did on the laptop.',
      warn: `The connection string uses the login role from 13.3, not the superuser. This is the one
place where a deployment quietly undoes an isolation model that every test in the repository proves —
because the tests connect as the right role and the server does not have to.`,
      done: 'Every name resolves and loads over an encrypted connection, the service starts on its own after a reboot, a backup has been restored into a scratch environment, and the application connects as the role that is neither superuser nor owner.',
    },
    {
      id: '13.16',
      do: 'Put one real sale all the way through, and then fail to find it as somebody else',
      why: `The only proof that matters. Not a test fixture and not a demonstration — one order a
person actually took, invoiced, paid, and posted, appearing in that company’s books and in the group
figure with inter-company trade removed. Everything before this stage is a component working. This is
the system working.`,
      walkthrough: [
        'Sign in as a real person in a real company.',
        'Enter one order, on one channel, for one customer.',
        'Raise the invoice from it, with the document numbering the settings say.',
        'Record the payment against the invoice.',
        'Open that company’s books and find the entry, on both sides.',
        'Open the group figure and confirm the amount is the sum across companies, minus anything sold between them.',
        'Sign out. Sign in as a different business on the same platform, and look for the order.',
      ],
      check: `# the last line of the walkthrough, as a query rather than as a click
psql "postgresql://medhava_app@localhost/medhava" \\
     -Atc "SET app.current_tenant = 'OTHER'; SELECT count(*) FROM sales_order;"`,
      checkExpect: '`0`. Nothing found — not a refusal, not an empty screen with a warning. The other ' +
        'business has no way to learn that the order exists at all.',
      done: 'One genuine order has gone from entry to a posted, paid, reconciled entry in the right company’s books and into the group figure, and a second business on the same platform cannot see any trace of it.',
    },
    {
      id: '13.17',
      do: 'Practise going back before anybody depends on it',
      why: `Every deployment is reversible in principle and reversible in practice only if somebody has
done it. The moment to find out that going back needs a database change nobody wrote is not the moment
you need to go back. Practise it on a working day, deliberately, with nothing wrong.`,
      cmd: `# redeploy the previous package by its digest, on purpose, while everything is fine
docker service update --image medhava@sha256:PREVIOUS medhava_app`,
      check: `time (docker service update --image medhava@sha256:PREVIOUS medhava_app \\
        && curl -fsS https://app.example.com/health)`,
      checkExpect: 'the previous version answering, and a time you would be willing to accept at ' +
        'three in the morning. Write that number down — it is the real recovery time, and it is ' +
        'usually not the one people assume.',
      note: `Schema changes are the part that does not simply go back. A migration that only adds is
safe to leave in place while the code returns to the previous package; one that removes or renames is
not, which is why removals are done as a separate later change once nothing reads the old shape.`,
      done: 'Going back to the previous package has been done deliberately at least once, it is one command, and the time it took is recorded rather than estimated.',
    },
  ],
};

module.exports = { parts: [P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13] };

/* ── the gate on this file ────────────────────────────────────────────────── */
module.exports.check = function check() {
  const bad = [];
  const ids = new Set();
  for (const p of module.exports.parts) {
    if (typeof p.n !== 'number' || !p.title || !p.lead) bad.push(`part ${p.n}: missing n, title or lead`);
    for (const s of p.steps) {
      if (!s.done) bad.push(`step ${s.id}: no "done when" — that makes it a suggestion`);
      if (!s.do) bad.push(`step ${s.id}: no action`);
      if (!s.why && !s.table) bad.push(`step ${s.id}: neither a reason nor a shape — say why it is done this way`);
      if (ids.has(s.id)) bad.push(`step ${s.id}: duplicate id`);
      ids.add(s.id);
      /* Build-state language has no place in a document describing a design. Every step
         would carry the same answer, and a reader who meets "not built yet" in a design
         document reasonably concludes the rest of it IS built. */
      /* Whitespace-normalised, because a phrase split across a line break is still the
         phrase. "already\nbuilt" slipped past this check and reached the PDF, where the
         printer joined the lines back together and printed exactly what was banned. */
      const prose = [s.do, s.why, s.note, s.warn, s.done].filter(Boolean).join(' ').replace(/\s+/g, ' ');
      const banned = /\b(works today|not built|already built|still pending|TODO)\b/i.exec(prose);
      if (banned) bad.push(`step ${s.id}: says "${banned[0]}" — this document describes a design, so nothing in it is built or pending`);
      if (/'/.test(prose)) bad.push(`step ${s.id}: straight apostrophe in prose — use the typographic ’`);
    }
  }
  return bad;
};
