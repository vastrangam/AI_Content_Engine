'use strict';
/* THE CAPABILITY BENCHMARK — one row per product the owner named, and what this one has.
 *
 *   node brand/site/checkzoho.js --summary
 *
 * WHAT THE OWNER ASKED FOR
 * He pasted fifty-six product pages and asked for this project to be measured against them.
 * The URLs below are his, verbatim, in his order.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT COULD NOT BE DONE, SAID FIRST RATHER THAN DISCOVERED LATER
 *
 * The pages were not read. This environment's egress proxy refuses every host outside a
 * short allowlist — package registries, GitHub and the model API. Measured, not assumed:
 *
 *     www.zoho.com       CONNECT refused, 403 at the gateway
 *     zoho.com           CONNECT refused
 *     www.bigin.com      CONNECT refused
 *     en.wikipedia.org   CONNECT refused
 *     api.github.com     200
 *     registry.npmjs.org 200
 *
 * Both the shell and the fetch tool take that same proxy, so there is no route to those
 * pages from here at all. It is a network policy on the environment, not a missing
 * connector: nothing can be installed that changes it.
 *
 * SO EVERY ROW BELOW IS SPLIT INTO THREE KINDS OF STATEMENT, and the gate keeps them apart:
 *
 *   SOURCED     the url and the product name — taken from the owner's own message.
 *   DERIVED     which apps this project names for that capability, and the rung each has
 *               reached. Read from modules.js and registry.js by the gate, never typed.
 *   INFERRED    what the product on that page actually does. This is recollection, NOT the
 *               page, and it is why `fetched_on` is null on every row and `claims` must
 *               therefore be null too — checkzoho.js refuses a row that carries what a page
 *               says without the date somebody read it.
 *
 * That rule is the whole point of this file. An essay about competitors, written from
 * memory and formatted as a comparison table, would look exactly like a benchmark and be
 * worth nothing — and this session already produced two confident figures that were wrong
 * because nothing in the repository could contradict them.
 *
 * THE VERDICT IS A COVERAGE FACT, NOT A PRIORITY.
 *   COVERED       this project names at least one app for that capability. Whether it
 *                 matches the other product's DEPTH is unknown and cannot be known from
 *                 here — that needs the page.
 *   NO APP        this project names none. This is the finding that survives the missing
 *                 pages intact, because it is answered entirely by our own register.
 *   OUT OF SCOPE  deliberately not part of this product, with the reason stated.
 *
 * There is no MUST / SHOULD / FUTURE column. Ranking what to build next against a
 * competitor whose pages were never read would be a priority invented to fill a column,
 * and priority is the owner's decision to take with the coverage facts in front of him.
 */

const VERDICTS = ['COVERED', 'NO APP', 'OUT OF SCOPE'];

/* url · name · verdict · apps this project names · why.
   `apps` are spelled exactly as modules.js spells them; the gate checks every one. */
const ROWS = [
  { url: 'https://www.zoho.com/in/books/?ireft=nhome&src=all-products-phome',
    name: 'Books', verdict: 'COVERED',
    apps: ['Accounting', 'Invoicing', 'Finance Reports', 'GST & Tax'],
    why: 'Bookkeeping, invoicing and statutory returns are all named apps here, and the ' +
      'ledger behind two of them runs on the real database.' },

  { url: 'https://www.zoho.com/en-in/crm/?ireft=nhome&src=all-products-phome',
    name: 'CRM', verdict: 'COVERED',
    apps: ['CRM & Customer 360'],
    why: 'Lead to won and the lifetime after it, in one record.' },

  { url: 'https://www.bigin.com/en-in/?ireft=nhome&src=all-products-phome',
    name: 'Bigin', verdict: 'COVERED',
    apps: ['CRM & Customer 360'],
    why: 'A smaller packaging of the same capability class. Packaging is a pricing ' +
      'decision, not a second capability.' },

  { url: 'https://www.zoho.com/en-in/pos/?ireft=nhome&src=all-products-phome',
    name: 'POS', verdict: 'COVERED', apps: ['POS'],
    why: 'Counter billing drawing on the same stock number as every other channel.' },

  { url: 'https://www.zoho.com/forms/?ireft=nhome&src=all-products-phome',
    name: 'Forms', verdict: 'COVERED', apps: ['Forms & Feedback (NPS)'],
    why: 'Forms are named, tied to the record they are about rather than standing alone.' },

  { url: 'https://www.zoho.com/bookings/?ireft=nhome&src=all-products-phome',
    name: 'Bookings', verdict: 'NO APP', apps: [],
    why: 'Appointment scheduling against somebody’s availability is named nowhere in the ' +
      '22 modules. A trade that sells time rather than goods has nothing here.' },

  { url: 'https://www.zoho.com/campaigns/?ireft=nhome&src=all-products-phome',
    name: 'Campaigns', verdict: 'COVERED', apps: ['Campaigns'],
    why: 'Email campaigns to a list are named in module 17, beside the automation that ' +
      'triggers them and the CRM record the list is drawn from.' },

  { url: 'https://www.zoho.com/social/?ireft=nhome&src=all-products-phome',
    name: 'Social', verdict: 'COVERED', apps: ['Social Calendar', 'Publisher'],
    why: 'Scheduling and publishing across social channels are both named.' },

  { url: 'https://www.zoho.com/marketingautomation/?ireft=nhome&src=all-products-phome',
    name: 'Marketing Automation', verdict: 'COVERED', apps: ['Automation', 'Campaigns'],
    why: 'Named in module 17 beside the campaigns it automates.' },

  { url: 'https://www.zoho.com/sites/?ireft=nhome&src=all-products-phome',
    name: 'Sites', verdict: 'COVERED', apps: ['Website & Page Builder', 'Blog & Pages'],
    why: 'A site builder and the pages it publishes are both named.' },

  { url: 'https://www.zoho.com/landingpage/?ireft=nhome&src=all-products-phome',
    name: 'LandingPage', verdict: 'COVERED', apps: ['Website & Page Builder'],
    why: 'Maps to the same app as Sites. Whether a landing page needs its own builder — ' +
      'with the split testing that usually justifies one — is a depth question the page ' +
      'would answer and this environment cannot reach.' },

  { url: 'https://www.zoho.com/commerce/?ireft=nhome&src=all-products-phome',
    name: 'Commerce', verdict: 'COVERED',
    apps: ['Channels & Storefronts', 'D2C Sales', 'Catalog / PIM'],
    why: 'A storefront, its orders and the catalogue behind it are all named, and the ' +
      'orders half runs on the real database.' },

  { url: 'https://www.vikra.com/en-in/seller/',
    name: 'Vikra Seller', verdict: 'COVERED',
    apps: ['Marketplace OMS', 'Listing & Catalog Manager'],
    why: 'Selling through somebody else’s marketplace is module 15’s subject.' },

  { url: 'https://www.zoho.com/en-in/desk/?ireft=nhome&src=all-products-phome',
    name: 'Desk', verdict: 'COVERED', apps: ['Helpdesk & Live Chat', 'Knowledge Base'],
    why: 'Tickets tied to the order they are about, and the knowledge base beside them.' },

  { url: 'https://www.zoho.com/salesiq/?ireft=nhome&src=all-products-phome',
    name: 'SalesIQ', verdict: 'COVERED', apps: ['Helpdesk & Live Chat'],
    why: 'Live chat is named. Website visitor tracking and lead scoring from browsing ' +
      'behaviour are named nowhere, so this is covered at the name and probably not at ' +
      'the depth — which is exactly the distinction the unread pages would settle.' },

  { url: 'https://www.zoho.com/fsm/?ireft=nhome&src=all-products-phome',
    name: 'Field Service Management', verdict: 'NO APP', apps: [],
    why: 'Dispatching a technician to a site, with the job, the parts and the visit, is ' +
      'named nowhere. A service trade has nothing here.' },

  { url: 'https://www.zoho.com/lens/?ireft=nhome&src=all-products-phome',
    name: 'Lens', verdict: 'NO APP', apps: [],
    why: 'Remote assistance over a camera. AR / Virtual Try-On is a customer-facing ' +
      'fitting tool and is not the same capability.' },

  { url: 'https://www.zoho.com/solo/?ireft=nhome&src=all-products-phome',
    name: 'Solo', verdict: 'OUT OF SCOPE', apps: [],
    why: 'A bundle for a one-person business. This product is built around a company ' +
      'being a row and a group being the sum of them; a single-person packaging is a ' +
      'pricing decision, not a capability to build.' },

  { url: 'https://www.zoho.com/in/expense/?ireft=nhome&src=all-products-phome',
    name: 'Expense', verdict: 'COVERED', apps: ['Expenses'],
    why: 'Claiming, approving and posting a staff expense is named in module 12, and the ' +
      'advance a worker takes against pay is tracked separately in module 16 as a balance ' +
      'beside pay rather than a term inside it.' },

  { url: 'https://www.zoho.com/in/payroll/?ireft=nhome&src=all-products-phome',
    name: 'Payroll', verdict: 'COVERED',
    apps: ['Staff & Contractors', 'Payout Execution', 'Time-off & Advances'],
    why: 'Module 16 names the roster, the leave and advances beside it, and the payout.' },

  { url: 'https://www.zoho.com/in/inventory/?ireft=nhome&src=all-products-phome',
    name: 'Inventory', verdict: 'COVERED', apps: ['Stock', 'Catalog / PIM', 'Kit & Combo SKU'],
    why: 'One quantity per SKU per location per stage, and it runs on the real database.' },

  { url: 'https://www.zoho.com/en-in/erp/?ireft=nhome&src=all-products-phome',
    name: 'ERP', verdict: 'COVERED', apps: ['Identity, Settings & Audit', 'Industry Packs'],
    why: 'The whole-product comparison rather than a capability. What it is really asking ' +
      'is whether one system spans the business, which is what the 22 modules claim and ' +
      'what the requirements registry measures honestly.' },

  { url: 'https://www.zoho.com/in/billing/?ireft=nhome&src=all-products-phome',
    name: 'Billing', verdict: 'COVERED', apps: ['Subscriptions', 'Invoicing'],
    why: 'A schedule that raises its own invoice and chases a failed payment is named.' },

  { url: 'https://www.zoho.com/procurement/?ireft=nhome&src=all-products-phome',
    name: 'Procurement', verdict: 'COVERED', apps: ['Procurement', 'Vendor Management'],
    why: 'Named in module 07, and both are browser apps today.' },

  { url: 'https://www.zoho.com/spend/?ireft=nhome&src=all-products-phome',
    name: 'Spend', verdict: 'COVERED',
    apps: ['Expenses', 'Budget vs Actual', 'Open-to-Buy / Budget Ceiling'],
    why: 'Spend against a ceiling is named in three places, including the one that stops ' +
      'a purchase order rather than reporting on it afterwards.' },

  { url: 'https://www.zoho.com/in/invoice/?ireft=nhome&src=all-products-phome',
    name: 'Invoice', verdict: 'COVERED', apps: ['Invoicing'],
    why: 'Raising an invoice is named in module 12 and shares its numbering, tax setup and ' +
      'ledger posting with every other way this system sells — which is the point of it ' +
      'not being a separate product.' },

  { url: 'https://www.zoho.com/practice/?ireft=nhome&src=all-products-phome',
    name: 'Practice', verdict: 'OUT OF SCOPE', apps: [],
    why: 'A practice-management tool for an accounting firm handling many clients’ books. ' +
      'This product keeps one business’s own books across its own companies. Serving other ' +
      'people’s books is a different product with a different isolation model.' },

  { url: 'https://www.zoho.com/in/checkout/?ireft=nhome&src=all-products-phome',
    name: 'Checkout', verdict: 'NO APP', apps: [],
    why: 'A hosted payment page somebody sends a customer to. Orders are named; the ' +
      'checkout that collects the money is not.' },

  { url: 'https://www.zoho.com/in/payments/?ireft=nhome&src=all-products-phome',
    name: 'Payments', verdict: 'NO APP', apps: [],
    why: 'Payment Data Scope states which systems may ever see a card credential, which ' +
      'is a policy about payments and not a payments product. Taking money is named ' +
      'nowhere, and it is blocked besides: it needs live credentials this repository must ' +
      'never hold.' },

  { url: 'https://www.zoho.com/connect/?ireft=nhome&src=all-products-phome',
    name: 'Connect', verdict: 'COVERED', apps: ['Forum', 'Discuss'],
    why: 'An internal place to talk, named twice in module 20.' },

  { url: 'https://www.vanihq.com/?ireft=nhome&src=all-products-phome',
    name: 'Vani', verdict: 'NO APP', apps: [],
    why: 'Contextual comments left on a document or a page. Documents are filed against ' +
      'the record they belong to; annotating them in place is named nowhere.' },

  { url: 'https://www.zoho.com/teaminbox/?ireft=nhome&src=all-products-phome',
    name: 'TeamInbox', verdict: 'NO APP', apps: [],
    why: 'A shared mailbox several people answer from. Communications sends outward; ' +
      'nothing here receives into a queue a team works through.' },

  { url: 'https://www.zoho.com/sheet/?ireft=nhome&src=all-products-phome',
    name: 'Sheet', verdict: 'NO APP', apps: [],
    why: 'A spreadsheet. Excel Dashboard Builder reads workbooks; it is not one.' },

  { url: 'https://www.zoho.com/show/?ireft=nhome&src=all-products-phome',
    name: 'Show', verdict: 'NO APP', apps: [],
    why: 'Building and presenting slides. Named nowhere in the 22 modules, and nothing ' +
      'here is adjacent to it — the documents this system produces are ledgers, bills and ' +
      'packing slips, which are printed rather than presented.' },

  { url: 'https://www.zoho.com/officesuite/?ireft=nhome&src=all-products-phome',
    name: 'Office Suite', verdict: 'OUT OF SCOPE', apps: [],
    why: 'A word processor, spreadsheet and presentation tool. This is a system for ' +
      'running a business’s operations, and building an office suite beside it would be ' +
      'the widest possible way to be shallow everywhere.' },

  { url: 'https://www.zoho.com/todo/?ireft=nhome&src=all-products-phome',
    name: 'ToDo', verdict: 'NO APP', apps: [],
    why: 'A personal task list. Approvals and Projects & Cases are work assigned through ' +
      'a process, which is not the same thing as somebody’s own list.' },

  { url: 'https://www.zoho.com/pdfeditor/?ireft=nhome&src=all-products-phome',
    name: 'PDF Editor', verdict: 'NO APP', apps: [],
    why: 'Ask & Print produces PDFs and Documents & eSign files them. Editing a PDF that ' +
      'arrived from somewhere else is named nowhere.' },

  { url: 'https://www.zoho.com/people/?ireft=nhome&src=all-products-phome',
    name: 'People', verdict: 'COVERED',
    apps: ['Staff & Contractors', 'Time-off & Advances', 'Appraisal & Hiring'],
    why: 'The employee record, leave, and appraisal are all named in module 16.' },

  { url: 'https://www.zoho.com/recruit/?ireft=nhome&src=all-products-phome',
    name: 'Recruit', verdict: 'COVERED', apps: ['Recruitment'],
    why: 'Hiring is named in module 16 as its own app beside the appraisal cycle, so a ' +
      'candidate becomes an employee record rather than being re-entered.' },

  { url: 'https://www.zoho.com/shifts/?ireft=nhome&src=all-products-phome',
    name: 'Shifts', verdict: 'NO APP', apps: [],
    why: 'Building a rota and publishing it to staff is named nowhere, which is a real ' +
      'hole for a business whose floor runs in shifts — attendance is captured, and the ' +
      'schedule it is measured against is not.' },

  { url: 'https://www.zoho.com/workerly/?ireft=nhome&src=all-products-phome',
    name: 'Workerly', verdict: 'OUT OF SCOPE', apps: [],
    why: 'For a staffing agency placing temporary workers with client companies. This ' +
      'product employs its own people; placing them elsewhere is a different business.' },

  { url: 'https://www.zoho.com/vault/?ireft=nhome&src=all-products-phome',
    name: 'Vault', verdict: 'OUT OF SCOPE', apps: [],
    why: 'A password manager, and the one competitor capability this product refuses on ' +
      'purpose. Its standing promise is that it will never ask for a marketplace, bank or ' +
      'account password; storing them would contradict the promise directly. This is a ' +
      'difference to state out loud rather than a gap to close.' },

  { url: 'https://www.zoho.com/directory/?ireft=nhome&src=all-products-phome',
    name: 'Directory', verdict: 'COVERED', apps: ['Identity, Settings & Audit'],
    why: 'Users, roles and permissions are named. Single sign-on and syncing against an ' +
      'outside identity provider are not, so this is covered at the name and thin under it.' },

  { url: 'https://www.zoho.com/en-in/creator/?ireft=nhome&src=all-products-phome',
    name: 'Creator', verdict: 'NO APP', apps: [],
    why: 'Building an application without code. The requirements registry carries this as ' +
      'CAP-STUDIO, NOT STARTED: packs configure vocabulary and fields, and let nobody ' +
      'build a screen.' },

  { url: 'https://catalyst.zoho.com/',
    name: 'Catalyst', verdict: 'NO APP', apps: [],
    why: 'A developer platform to build and host services on. Carried as CAP-DEVPLATFORM, ' +
      'NOT STARTED — the internal API is four routes for two modules, with no versioning, ' +
      'no keys and no webhooks.' },

  { url: 'https://www.manageengine.com/saas-management/?ireft=nhome&src=all-products-phome',
    name: 'ManageEngine SaaS Management', verdict: 'OUT OF SCOPE', apps: [],
    why: 'Governing which SaaS subscriptions a company’s IT department pays for. That is ' +
      'an IT-department product, not part of running the operations of the business.' },

  { url: 'https://www.zoho.com/analytics/?ireft=nhome&src=all-products-phome',
    name: 'Analytics', verdict: 'COVERED', apps: ['Report Builder', 'CEO Dashboard'],
    why: 'Both are named and both open in a browser. Neither queries the database: the ' +
      'registry carries CAP-ANALYTICS as SPECIFIED, and the prototype computes over an ' +
      'in-page store.' },

  { url: 'https://www.zoho.com/dataprep/?ireft=nhome&src=all-products-phome',
    name: 'DataPrep', verdict: 'NO APP', apps: [],
    why: 'Cleaning and reshaping data before it is analysed. Master-Data Hygiene finds ' +
      'duplicates among customers, vendors and designs; it is not a transformation tool.' },

  { url: 'https://www.zoho.com/analytics/embedded-solutions.html?ireft=nhome&src=all-products-phome',
    name: 'Analytics — embedded', verdict: 'NO APP', apps: [],
    why: 'Putting somebody else’s dashboards inside your own product under your own ' +
      'brand. That needs the developer platform this project has not started.' },

  { url: 'https://www.zoho.com/analytics/online-dashboard-builder.html?ireft=nhome&src=all-products-phome',
    name: 'Analytics — dashboard builder', verdict: 'COVERED',
    apps: ['CEO Dashboard', 'Report Builder', 'Excel Dashboard Builder'],
    why: 'Three named apps, two of them browser prototypes today.' },

  { url: 'https://www.zoho.com/projects/?ireft=nhome&src=all-products-phome',
    name: 'Projects', verdict: 'COVERED', apps: ['Projects & Cases', 'Timesheets & Planning'],
    why: 'Named in module 20 with the time recorded against them.' },

  { url: 'https://www.zoho.com/sprints/?ireft=nhome&src=all-products-phome',
    name: 'Sprints', verdict: 'NO APP', apps: [],
    why: 'Agile iteration planning. Projects & Cases is not the same shape and does not ' +
      'claim to be.' },

  { url: 'https://www.zoho.com/bugtracker/?ireft=nhome&src=all-products-phome',
    name: 'BugTracker', verdict: 'NO APP', apps: [],
    why: 'Tracking defects in software. Quality Control inspects goods, not code.' },

  { url: 'https://www.zoho.com/dap/?ireft=nhome&src=all-products-phome',
    name: 'Digital Adoption Platform', verdict: 'NO APP', apps: [],
    why: 'In-product walkthroughs teaching people to use the software. Named nowhere, ' +
      'and worth noticing for a system whose users are a shop floor.' },

  { url: 'https://www.zoho.com/verticalstudio/?ireft=nhome&src=all-products-phome',
    name: 'Vertical Solutions Studio', verdict: 'NO APP', apps: [],
    why: 'Building an industry-specific application on the platform. Industry Packs are ' +
      'the nearest thing and are deliberately narrower — a pack may rename, extend and ' +
      'switch discretionary rules off, and may never invent a concept or carry code.' },

  { url: 'https://www.zoho.com/one/?ireft=nhome&src=all-products-phome',
    name: 'One', verdict: 'COVERED', apps: ['Identity, Settings & Audit'],
    why: 'The bundle of everything above under one account. Its comparison here is the ' +
      'whole requirements registry, not a single app.' },
];

/* ── the register's own checks, all answerable without the disk ────────────── */
function check() {
  const bad = [];
  const seen = new Set();
  ROWS.forEach((r, i) => {
    const at = `row ${i + 1} (${r.name || 'unnamed'})`;
    if (!r.url || !/^https:\/\//.test(r.url)) bad.push(`${at} has no https url`);
    if (seen.has(r.url)) bad.push(`${at} repeats a url already listed`);
    seen.add(r.url);
    if (!r.name) bad.push(`${at} has no product name`);
    if (!VERDICTS.includes(r.verdict)) {
      bad.push(`${at} carries verdict "${r.verdict}", which is not one of ${VERDICTS.join(', ')}`);
    }
    if (!r.why || r.why.length < 40) {
      bad.push(`${at} states no reason, or one too short to be one. A verdict with no ` +
        `reason is an opinion wearing a table.`);
    }
    /* THE SOURCING RULE. A row may not say what a page claims unless somebody read it. */
    if (r.claims && !r.fetched_on) {
      bad.push(`${at} carries what the page claims and no date anybody read it. That is ` +
        `recollection formatted as a benchmark, which is the one thing this file exists ` +
        `to refuse.`);
    }
    if (r.fetched_on && !r.claims) {
      bad.push(`${at} records a fetch date and no claim from the page — either the fetch ` +
        `found nothing, or the date is decoration.`);
    }
    if (r.verdict === 'COVERED' && !(r.apps || []).length) {
      bad.push(`${at} says COVERED and names no app. Covered by what?`);
    }
    if (r.verdict !== 'COVERED' && (r.apps || []).length) {
      bad.push(`${at} says ${r.verdict} and names ${r.apps.length} app(s). If an app ` +
        `covers it, the verdict is COVERED.`);
    }
  });
  return bad;
}

const tally = () => VERDICTS.reduce((t, v) => {
  t[v] = ROWS.filter((r) => r.verdict === v).length; return t;
}, {});

/* True for every row today, and stated as a function rather than a constant so that the
   day somebody runs this where the pages are reachable, filling in `fetched_on` and
   `claims` is all it takes. */
const unfetched = () => ROWS.filter((r) => !r.fetched_on);

module.exports = { ROWS, VERDICTS, check, tally, unfetched };
