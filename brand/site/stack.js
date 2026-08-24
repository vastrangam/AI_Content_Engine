'use strict';
/* THE STACK — every technical layer, its default, and what it can be replaced with.
 *
 * RULE 1, WRITTEN DOWN: NO CAPABILITY DEPENDS ON ONE TOOL.
 * Not as an intention — as a structure. Every layer here names three things:
 *
 *   default   ONE choice, so building can start on Monday. A design that picks nothing
 *             cannot be executed; it just moves the decision to whoever reads it.
 *   swaps     at least TWO real replacements. Not "or something similar" — named things
 *             that actually do the job, so the choice is provably not a corner.
 *   iface     the name in OUR code that everything else talks to. This is the part that
 *             makes the swap cheap. Business logic calls the interface, never the product,
 *             so replacing the product means writing one new adapter and changing one
 *             setting — never hunting through the whole system for mentions of a vendor.
 *
 * checkstack.js refuses a layer missing any of the three. So the rule cannot quietly rot
 * into a paragraph somebody wrote once and nobody kept.
 *
 * WHY THE DEFAULTS LEAN OPEN
 * Where two options are close, the one that can also be self-hosted wins. Not ideology:
 * a product you can run yourself can never be taken away, repriced past what you can pay,
 * or shut down. That is the difference between changing a supplier and losing a business.
 *
 * WHAT IS DELIBERATELY NOT HERE
 * Prices, free-tier limits and vendor terms. They change every few months, and a document
 * carrying a stale price is worse than one carrying none — somebody budgets from it.
 * brand/site/tools.js holds the cost side with its own asOf date; this file holds the
 * engineering side. Check any current price at the source before committing money.
 *
 * Straight apostrophes read wrong in the PDF; use the typographic ’ in prose.
 */

const LAYERS = [
  /* ── keeping the information ──────────────────────────────────────────── */
  {
    id: 'db',
    layer: 'The database',
    does: 'Keeps every record — customers, orders, stock, vouchers — and answers questions about them.',
    why: `PostgreSQL is open source, runs anywhere, and has the two things this design needs
built in: locks at the record level so one business cannot read another’s rows, and exact whole-number
arithmetic so money never drifts. Any managed Postgres service is a hosting decision, not a database
decision — the same schema runs on all of them.`,
    def: 'PostgreSQL',
    swaps: [
      'A managed Postgres service — same database, somebody else runs the machine',
      'Postgres on your own server — the software is free, you supply the machine',
      'MySQL or MariaDB, if a team already knows them well — the schema needs rework for the record-level locks',
    ],
    iface: 'DatabaseService',
    cost: 'Moving between Postgres hosts is a dump and a restore. Moving off Postgres entirely means rewriting the isolation layer, which is the one part worth not moving.',
  },
  {
    id: 'files',
    layer: 'File storage',
    does: 'Keeps photographs, invoices and scanned documents — the things too big to sit in the database.',
    why: `Almost every file service speaks the same request format, so one adapter reaches most of
them. That makes this the cheapest layer in the whole system to change your mind about.`,
    def: 'Any S3-compatible object store',
    swaps: [
      'A different S3-compatible provider — usually a URL and a key change',
      'Files on your own server’s disk, with a backup copy elsewhere',
      'A self-hosted object store such as MinIO, which speaks the same format',
    ],
    iface: 'FileStore',
    cost: 'Copy the files across and change the address. Nothing above this layer notices.',
  },
  {
    id: 'cache',
    layer: 'Cache and short-term memory',
    does: 'Holds recently used answers and sign-in sessions so common screens open instantly.',
    why: `Nothing here is the only copy of anything. If the cache is wiped the system simply asks the
database again and is a little slower for a minute — so this layer can be replaced, restarted or
removed entirely without risking a single record.`,
    def: 'Redis, or a Redis-compatible store',
    swaps: [
      'Valkey — the open-source continuation of the same thing, same commands',
      'Memory inside the application itself, which is enough until traffic grows',
      'A database table, slower but with nothing extra to run',
    ],
    iface: 'CacheService',
    cost: 'Near zero by design. Losing the cache loses no data, which is the whole reason it is safe to change.',
  },

  /* ── doing the work ───────────────────────────────────────────────────── */
  {
    id: 'runtime',
    layer: 'The backend runtime',
    does: 'Runs the business rules, checks permissions, writes records and calculates totals.',
    why: `The same language runs on the browser side, so one team can work across the whole system
and code that validates a form can be shared with the code that validates the saved record — no rule
gets written twice and no two versions of it drift apart.`,
    def: 'Node.js with TypeScript',
    swaps: [
      'Any container host — the code is ordinary and carries no host-specific parts',
      'Python or Go for a service that genuinely suits them, talking over the same API',
      'A different Node framework — the business logic sits outside the framework on purpose',
    ],
    iface: 'the HTTP API contract',
    cost: 'Low, because the rules live in plain functions rather than inside a framework. Moving a service means moving the functions and putting a different door in front of them.',
  },
  {
    id: 'api',
    layer: 'The API',
    does: 'The agreed way the screens, the mobile view and any outside system ask the backend for things.',
    why: `Ordinary web requests over predictable addresses. Anything can call it — a browser, a phone,
a spreadsheet, another company’s software — without a special library.`,
    def: 'REST over HTTPS, with a written schema',
    swaps: [
      'GraphQL for read-heavy screens, over the same underlying services',
      'A direct connection for live screens that must update by themselves',
      'Scheduled file exchange for partners who cannot call an API at all',
    ],
    iface: 'the published API schema',
    cost: 'Adding a second style is additive — the services underneath do not change.',
  },
  {
    id: 'ui',
    layer: 'The frontend',
    does: 'Everything a person sees and clicks — screens, forms, tables, dashboards.',
    why: `Screens are drawn FROM SETTINGS rather than written one by one. A tenant that renames a
field, adds a column or turns a module off gets a different screen with no new code written — which
is the only way one system can serve a steel plant and a single creator without becoming two systems.`,
    def: 'React with TypeScript, screens generated from configuration',
    swaps: [
      'Vue or Svelte — the screen definitions are plain data and do not care what draws them',
      'Server-rendered pages where speed on a weak connection matters more than interaction',
      'A native mobile shell reading the same screen definitions',
    ],
    iface: 'the screen definition format',
    cost: 'Moderate, and bounded: what a screen contains is data, so a rewrite replaces the painter, not the paintings.',
  },

  /* ── work that happens on its own ─────────────────────────────────────── */
  {
    id: 'jobs',
    layer: 'Background work',
    does: 'Does the things nobody should have to wait for — sending a thousand messages, building a month-end report, pulling orders overnight.',
    why: `Every job is written so that running it twice does the same thing as running it once. That
single discipline is what makes it safe to retry after a failure, and it is worth more than any
particular queue product.`,
    def: 'A queue backed by the database, with named workers',
    swaps: [
      'A Redis-backed queue when volume outgrows the database',
      'A hosted queue service, behind the same interface',
      'An external workflow tool such as n8n for steps a non-programmer should be able to edit',
    ],
    iface: 'JobQueue',
    cost: 'Low. Jobs are plain functions with a name; the queue only decides when they run.',
  },
  {
    id: 'search',
    layer: 'Search',
    does: 'Finds a product, a customer or a document by a few typed letters, instantly.',
    why: `Postgres can search well enough for a long time, and starting there means one less thing
running, one less thing to back up, and one less thing to keep in step with the database.`,
    def: 'PostgreSQL full-text search',
    swaps: [
      'OpenSearch or Elasticsearch when catalogues grow large',
      'Meilisearch or Typesense — small, fast, self-hostable',
      'A hosted search service behind the same interface',
    ],
    iface: 'SearchService',
    cost: 'Low, and it is a one-way door you can walk back through: the records stay in the database either way, so a search engine is only ever a faster copy.',
  },

  /* ── who you are, and what you may do ─────────────────────────────────── */
  {
    id: 'auth',
    layer: 'Sign-in and permissions',
    does: 'Proves who somebody is, then decides what they are allowed to see and change.',
    why: `Who you are and what you may do are kept apart deliberately. Sign-in can be handed to an
outside service — or to a customer’s own company login — while permissions stay ours, because they
depend on the company and role structure no outside service knows about.`,
    def: 'Sessions issued by the platform, with permissions checked in the backend and again in the database',
    swaps: [
      'An identity provider for sign-in only, with permissions still decided here',
      'A customer’s own company sign-in, for enterprises that require it',
      'Self-hosted Keycloak or Authentik, when nothing may leave the building',
    ],
    iface: 'IdentityService',
    cost: 'Low for sign-in, by design. Permissions never move, so the expensive half is never in play.',
  },
  {
    id: 'secrets',
    layer: 'Keys and passwords the system uses',
    does: 'Holds the connection details and keys the software needs, away from the code.',
    why: `A key in the code is a key in every copy of the code forever. Keeping them outside means one
can be replaced in a minute without changing a line.`,
    def: 'Environment variables on the server, readable only by the service account',
    swaps: [
      'A managed secrets service, when there are enough of them to be worth it',
      'Self-hosted Vault or Infisical',
      'Encrypted files kept outside source control',
    ],
    iface: 'ConfigService',
    cost: 'Very low — the code asks for a name and does not care where the value came from.',
  },

  /* ── talking to the outside world ─────────────────────────────────────── */
  {
    id: 'messaging',
    layer: 'Messages to customers and staff',
    does: 'Sends WhatsApp messages, text messages and email — reminders, confirmations, statements.',
    why: `**Each tenant connects its own accounts.** The platform is built with a place for them to
plug in and never holds one central account of its own — a business’s conversations with its own
customers belong to that business. The platform’s job is the plug, not the account.`,
    def: 'A message service with one adapter per provider, per tenant',
    swaps: [
      'Any WhatsApp provider — the adapter changes, the code that decides what to send does not',
      'Text message and email as fallbacks when a message cannot be delivered',
      'A shared inbox or an export, for a tenant with no messaging account at all',
    ],
    iface: 'MessageService',
    cost: 'One adapter per provider. Switching is a settings change made by the tenant, not a release made by us.',
  },
  {
    id: 'commerce',
    layer: 'Storefronts and marketplaces',
    does: 'Brings orders in from a shop website or a marketplace, and sends stock and prices back out.',
    why: `Every one of these is treated as a channel with an adapter. Adding a marketplace is writing
one adapter and creating one record — never a change to how orders work.`,
    def: 'A channel adapter per storefront or marketplace',
    swaps: [
      'A different storefront platform — a new adapter, and orders keep arriving',
      'File import for a channel with no connection available',
      'Manual entry, which must always remain possible',
    ],
    iface: 'ChannelAdapter',
    cost: 'One adapter each. The order, the stock number and the books never change shape.',
  },
  {
    id: 'pay',
    layer: 'Taking payments',
    does: 'Collects money from customers online.',
    why: `Card details are handed straight to the payment provider’s own secured field and never touch
this system — so there is nothing sensitive here to protect, and switching provider moves no card
data, because none was ever held.`,
    def: 'A payment adapter per provider, with the card field hosted by the provider',
    swaps: [
      'Any other payment provider, behind the same interface',
      'Bank transfer and UPI details recorded against the invoice',
      'Cash on delivery, reconciled when the courier settles',
    ],
    iface: 'PaymentService',
    cost: 'One adapter. No card data ever moves, because none is ever stored.',
  },
  {
    id: 'ship',
    layer: 'Delivery and couriers',
    does: 'Books a shipment, prints the label, and follows it to the door.',
    why: 'Rate cards and tracking differ per courier; what a shipment IS does not.',
    def: 'A courier adapter per carrier',
    swaps: [
      'A courier aggregator, which is itself just one more adapter',
      'A different carrier directly',
      'Manual booking with the tracking number typed in — always available',
    ],
    iface: 'CourierService',
    cost: 'One adapter each.',
  },

  /* ── the AI side ──────────────────────────────────────────────────────── */
  {
    id: 'ai',
    layer: 'Artificial intelligence',
    does: 'Writes descriptions, tags photographs, summarises, and answers questions about your own data.',
    why: `Ordered fallback, a breaker on anything failing repeatedly, and a spend ceiling that REFUSES
rather than warns. Because every capability also has an option that costs nothing, a spent budget can
stop the spending without ever stopping the business.`,
    def: 'A router in front of several providers, ending on one that needs nothing bought',
    swaps: [
      'Any hosted model provider — an entry in the router, not a change to the system',
      'A model running on your own machine, for work that is routine or private',
      'Templates and rules with no model at all, which must always remain the last resort',
    ],
    iface: 'ModelRouter',
    cost: 'A list entry. The router exists precisely so changing provider is never a project.',
  },

  /* ── running it ───────────────────────────────────────────────────────── */
  {
    id: 'host',
    layer: 'Where it runs',
    does: 'The machines that serve the website and the application.',
    why: `The application is packaged as an ordinary container with nothing host-specific inside it.
That single decision is what keeps every hosting option open, forever.`,
    def: 'Containers on a virtual server',
    swaps: [
      'A managed container platform, when scaling by hand stops being fun',
      'A different cloud, or a different country, for the same container',
      'A machine in your own office, for data that must not leave it',
    ],
    iface: 'the container image',
    cost: 'Low by construction. If moving hosts is ever hard, something host-specific has leaked in and that is the bug.',
  },
  {
    id: 'ci',
    layer: 'Source control and automatic checks',
    does: 'Keeps the history of every change and runs every test before anything goes live.',
    why: 'Git itself is the thing that matters, and git is not owned by anybody. The host is a convenience.',
    def: 'Git, with automatic checks on every change',
    swaps: [
      'A different hosting service — a git repository moves with one command',
      'Self-hosted Gitea or Forgejo',
      'A separate build service reading the same repository',
    ],
    iface: 'the test commands themselves',
    cost: 'Very low. The checks are ordinary commands, so any system that can run a command can run them.',
  },
  {
    id: 'watch',
    layer: 'Watching it',
    does: 'Reports errors, measures speed, and tells you when something stops answering.',
    why: 'Standard formats mean the tool that reads them is replaceable without changing what the system emits.',
    def: 'Structured logs and error reporting, in an open format',
    swaps: [
      'Any hosted error-tracking service',
      'Self-hosted GlitchTip, or a Grafana and Prometheus stack',
      'Log files plus an uptime checker, which is enough at the start',
    ],
    iface: 'Logger and the metric format',
    cost: 'Low — the system emits a standard shape and does not know who is reading it.',
  },
  {
    id: 'docs',
    layer: 'Making documents',
    does: 'Produces invoices, statements, labels and reports as files a person can print or send.',
    why: 'What a document SAYS is data. How it is drawn is replaceable, and should be.',
    def: 'HTML templates printed to PDF by a headless browser',
    swaps: [
      'A dedicated PDF library for very high volume',
      'A hosted document service',
      'Spreadsheet or CSV output, which some readers prefer anyway',
    ],
    iface: 'DocumentRenderer',
    cost: 'Low. Templates are content; the renderer is a tool.',
  },
];

module.exports = { LAYERS };
