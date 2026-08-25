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

module.exports = { parts: [P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12] };

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
