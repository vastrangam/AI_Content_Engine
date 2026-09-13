'use strict';
/* THE OWNER'S MASTER BUILD PROMPT, ENCODED — and what this product has against each line.
 *
 *   node brand/site/checkmasterspec.js --summary
 *
 * WHAT THIS IS
 * He pasted a 31-section specification for a Zoho-class business operating system and asked
 * one answerable question: of everything in it, how much does this cover, how much is
 * missing, and how much can never be covered from here. Every line item below is his, in
 * his order and his words. Nothing was added to make the list look better and nothing was
 * dropped to make the score look better — checkmasterspec.js counts the items and refuses a
 * stated total that disagrees with the list.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE THREE THINGS EACH ITEM CARRIES, AND THE ONE IT DOES NOT
 *
 *   text        his words for the capability
 *   maps        the app id(s) in this product that correspond to it, or null for nothing.
 *               THIS IS A JUDGEMENT AND THE GATE CANNOT CHECK JUDGEMENT. It proves every id
 *               is a real app and resolves its rung from the requirements registry; it
 *               cannot prove that "Lead scoring" belongs against CRM & Customer 360 rather
 *               than somewhere else. Every row prints the app it was mapped to precisely so
 *               that the reader can disagree with any one of them.
 *   impossible  set only when the item needs something that cannot be obtained from inside
 *               a repository — a carrier, a payment licence, a bank's credentials, an
 *               app-store account, a deployed host, an audited certification — with the
 *               reason. Not a synonym for hard. A synonym for "no amount of code".
 *
 * WHAT IT DOES NOT CARRY IS THE ANSWER. No row stores whether it is covered. That is
 * resolved from registry.js at gate time, so this file cannot flatter the thing it measures
 * and cannot go stale when somebody builds one of the 94 specified apps.
 *
 * THE COMPETITOR COLUMNS ARE SOURCED PER SECTION, NOT PER LINE
 * 900 sourced claims is not something anybody has. Each section carries one `src` key into
 * benchmark.js's SOURCES, found by search on the date recorded there, and every line in that
 * section inherits it marked `section-level`. A section with no key reads NOT MEASURED all
 * the way down. That is a real finding about what nobody has compared, not a gap in effort.
 */

/* Source keys come from benchmark.js so there is one url register, not two that drift. */
const { SOURCES, FOUND_ON } = require('./benchmark.js');

/* An item is [text, maps, impossible?].
     maps        'APP-04-01' · ['APP-04-01','APP-05-01'] · null
     impossible  a sentence, present only when no code closes it            */
const S = (n, id, title, src, blocks) => ({ n, id, title, src, blocks });
const B = (title, items) => ({ title, items });

const SECTIONS = [

  /* ══ 1 ═══════════════════════════════════════════════════════════════════ */
  S(1, 'S01', 'Platform architecture', 'ZOHO_CREATOR_SECURE', [
    B('Core architecture', [
      ['Organization', 'APP-01-01'],
      ['Users', 'APP-01-01'],
      ['Roles', 'APP-01-01'],
      ['Permissions', 'APP-01-01'],
      ['Departments', 'APP-16-01'],
      ['Teams', 'APP-16-01'],
      ['Locations', 'APP-03-01'],
      ['Applications', 'APP-01-01'],
      ['Modules', 'APP-01-01'],
      ['Records', 'APP-01-01'],
      ['Workflows', 'APP-20-05'],
      ['Automation', 'APP-17-04'],
      ['Notifications', 'APP-01-04'],
      ['Reports', 'APP-21-02'],
      ['Analytics', 'APP-21-01'],
      ['AI', 'APP-22-01'],
      ['Integrations', null, 'Every live integration needs a third party’s credentials, and this repository must never hold one.'],
      ['APIs', null],
    ]),
    B('The platform must support', [
      ['Multi-tenant architecture', 'APP-01-01'],
      ['Multiple organizations', 'APP-21-03'],
      ['Multiple branches', 'APP-03-01'],
      ['Multiple warehouses', 'APP-10-01'],
      ['Multiple currencies', 'APP-05-03'],
      ['Multiple tax jurisdictions', 'APP-12-04'],
      ['Multiple languages', 'APP-01-02'],
      ['Multiple time zones', null],
      ['Role-based access control', 'APP-01-01'],
      ['User-level permissions', 'APP-01-01'],
      ['Module-level permissions', 'APP-01-01'],
      ['Field-level permissions', 'APP-01-01'],
      ['Record-level permissions', 'APP-01-01'],
      ['Department-level permissions', 'APP-01-01'],
      ['Approval hierarchies', 'APP-20-03'],
      ['Audit logs', 'APP-01-01'],
      ['Activity history', 'APP-01-01'],
      ['Data import/export', 'APP-03-04'],
      ['Backups', null, 'A backup needs a running system and somewhere to put it. Nothing is deployed.'],
      ['API access', null],
      ['Webhooks', null],
      ['OAuth', null, 'OAuth is against somebody else’s identity provider and needs a registered application and secret.'],
      ['Third-party integrations', null, 'Needs live credentials per provider.'],
      ['Mobile-responsive interface', 'APP-01-01'],
      ['Dark/light mode', null],
      ['Global search', 'APP-22-05'],
      ['Universal command/search bar', 'APP-01-03'],
      ['Notification center', 'APP-01-04'],
      ['User profile', 'APP-01-01'],
      ['Organization settings', 'APP-01-01'],
      ['Billing/subscription management', 'APP-05-07'],
    ]),
  ]),

  /* ══ 2 ═══════════════════════════════════════════════════════════════════ */
  S(2, 'S02', 'Master application hub', 'ZOHO_DEVELOPER', [
    B('Sales', [
      ['CRM', 'APP-04-01'], ['Lead management', 'APP-04-01'], ['Sales pipeline', 'APP-04-01'],
      ['Quotes', 'APP-05-05'], ['Orders', 'APP-15-02'], ['Contacts', 'APP-04-01'],
      ['Accounts', 'APP-04-01'],
      ['Telephony', null, 'Needs a telephony carrier and a number. No software substitutes for one.'],
      ['Appointment booking', null],
    ]),
    B('Marketing', [
      ['Email marketing', 'APP-17-02'], ['Marketing automation', 'APP-17-04'],
      ['Social media', 'APP-17-01'], ['Surveys', 'APP-04-04'],
      ['Landing pages', 'APP-17-07'], ['Website analytics', 'APP-19-03'],
      ['Campaign management', 'APP-17-02'], ['Events', 'APP-17-06'],
      ['Webinars', null, 'Needs live video infrastructure — media servers and bandwidth, not application code.'],
    ]),
    B('Customer service', [
      ['Help desk', 'APP-04-03'], ['Live chat', 'APP-04-03'],
      ['Knowledge base', 'APP-20-07'], ['Customer portal', 'APP-04-01'],
      ['Service contracts', 'APP-04-02'], ['SLAs', 'APP-04-03'],
      ['Customer satisfaction', 'APP-04-04'],
    ]),
    B('Finance', [
      ['Accounting', 'APP-12-01'], ['Invoicing', 'APP-12-02'], ['Expenses', 'APP-12-03'],
      ['Billing', 'APP-05-07'],
      ['Payments', null, 'Taking a payment needs a licensed gateway and its credentials.'],
      ['Procurement', 'APP-07-01'], ['Payroll', 'APP-16-05'], ['Financial analytics', 'APP-12-09'],
    ]),
    B('Commerce', [
      ['E-commerce', 'APP-15-07'], ['POS', 'APP-05-04'], ['Inventory', 'APP-03-01'],
      ['Order management', 'APP-15-02'], ['Warehouse management', 'APP-10-01'],
    ]),
    B('People', [
      ['HR', 'APP-16-01'], ['Recruitment', 'APP-16-04'], ['Attendance', 'APP-16-02'],
      ['Leave', 'APP-16-02'], ['Shifts', 'APP-16-02'], ['Payroll', 'APP-16-05'],
      ['Performance', 'APP-16-03'], ['Learning', null], ['Employee engagement', null],
    ]),
    B('Collaboration', [
      ['Email', null, 'Business email means hosting mailboxes on a domain with deliverability and spam reputation — infrastructure, not a feature.'],
      ['Calendar', null], ['Chat', 'APP-20-06'],
      ['Meetings', null, 'Needs live audio/video infrastructure.'],
      ['Documents', 'APP-04-02'], ['Spreadsheets', 'APP-21-04'], ['Presentations', null],
      ['Notes', null], ['Team workspace', 'APP-20-01'], ['Shared inbox', null],
    ]),
    B('Projects', [
      ['Project management', 'APP-20-01'], ['Agile management', null],
      ['Issue tracking', 'APP-20-01'], ['Timesheets', 'APP-20-02'],
      ['Resource planning', 'APP-20-02'],
    ]),
    B('Data and analytics', [
      ['BI dashboards', 'APP-21-01'], ['Data preparation', 'APP-03-04'],
      ['Data warehouse', null], ['Reports', 'APP-21-02'],
      ['Forecasting', 'APP-06-01'], ['KPI management', 'APP-21-01'],
    ]),
    B('Automation', [
      ['Workflow builder', 'APP-20-05'], ['Integration platform', null, 'A connector is only real when it holds a live credential for the service it connects to.'],
      ['RPA', null], ['Process management', 'APP-20-05'], ['Custom applications', null],
    ]),
    B('Developer platform', [
      ['Low-code builder', null], ['APIs', null], ['Webhooks', null], ['Functions', null],
      ['Developer console', null], ['App marketplace', null],
    ]),
    B('AI', [
      ['AI assistant', 'APP-22-01'], ['AI agents', 'APP-22-03'],
      ['Natural-language search', 'APP-22-05'], ['Predictions', 'APP-06-01'],
      ['Recommendations', 'APP-15-10'], ['Document intelligence', 'APP-22-05'],
      ['Conversational analytics', 'APP-22-01'],
    ]),
    B('Security and IT', [
      ['Identity', 'APP-01-01'],
      ['SSO', null, 'Single sign-on is against an outside identity provider and needs a registered application with it.'],
      ['MFA', null], ['Password management', null],
      ['Endpoint management', null, 'Needs an agent installed on every device — a fleet, not a repository.'],
      ['IT service management', null], ['Monitoring', null, 'Needs something deployed to monitor.'],
      ['Security analytics', null],
    ]),
    B('Contracts and legal', [
      ['Contract lifecycle', 'APP-04-02'], ['Contract templates', 'APP-04-02'],
      ['Approvals', 'APP-20-03'],
      ['E-signatures', 'APP-04-02', 'A signature with legal standing needs an accredited provider and an audit trail they stand behind.'],
      ['Renewals', 'APP-04-02'], ['Compliance', 'APP-09-02'],
    ]),
  ]),

  /* ══ 3 ═══════════════════════════════════════════════════════════════════ */
  S(3, 'S03', 'CRM', 'ZOHO_ZIA', [
    B('Modules', [
      ['Leads', 'APP-04-01'], ['Contacts', 'APP-04-01'], ['Accounts', 'APP-04-01'],
      ['Deals', 'APP-04-01'], ['Products', 'APP-03-02'], ['Price books', 'APP-03-02'],
      ['Vendors', 'APP-07-02'], ['Quotes', 'APP-05-05'], ['Sales orders', 'APP-15-02'],
      ['Invoices', 'APP-12-02'], ['Activities', 'APP-04-01'], ['Tasks', 'APP-20-01'],
      ['Calls', null, 'Logging a call is possible; placing one needs a carrier.'],
      ['Meetings', null], ['Notes', 'APP-04-01'], ['Attachments', 'APP-04-02'],
      ['Campaigns', 'APP-17-02'], ['Territories', null], ['Forecasts', 'APP-06-01'],
      ['Custom modules', null],
    ]),
    B('Lead functionality', [
      ['Lead capture', 'APP-04-04'], ['Web forms', 'APP-04-04'], ['Lead imports', 'APP-03-04'],
      ['Lead assignment', 'APP-04-01'], ['Lead routing', 'APP-04-01'],
      ['Lead scoring', 'APP-04-01'], ['Lead qualification', 'APP-04-01'],
      ['Lead nurturing', 'APP-17-04'], ['Duplicate detection', 'APP-03-04'],
      ['Lead conversion', 'APP-04-01'], ['Source tracking', 'APP-17-02'],
      ['Campaign attribution', 'APP-17-02'], ['Automated follow-up', 'APP-17-04'],
    ]),
    B('Sales functionality', [
      ['Multiple pipelines', 'APP-04-01'], ['Custom deal stages', 'APP-04-01'],
      ['Deal probability', 'APP-04-01'], ['Sales forecasting', 'APP-06-01'],
      ['Sales targets', 'APP-13-03'], ['Territory management', null],
      ['Sales quotas', 'APP-13-03'], ['Pipeline analysis', 'APP-21-01'],
      ['Deal alerts', 'APP-01-04'], ['Automated activities', 'APP-17-04'],
      ['Follow-up reminders', 'APP-01-04'], ['Approval workflows', 'APP-20-03'],
      ['Sales cadences', 'APP-17-04'],
    ]),
    B('Customer 360', [
      ['Customer profile', 'APP-04-01'], ['Purchase history', 'APP-04-01'],
      ['Communication history', 'APP-01-04'], ['Support tickets', 'APP-04-03'],
      ['Quotes', 'APP-05-05'], ['Orders', 'APP-15-02'], ['Invoices', 'APP-12-02'],
      ['Payments', 'APP-12-06'], ['Campaign interactions', 'APP-17-02'],
      ['Website activity', 'APP-19-03'], ['Tasks', 'APP-20-01'],
      ['Calls', null], ['Meetings', null], ['Notes', 'APP-04-01'],
      ['Relationship maps between customers, contacts, companies, deals, orders and cases', 'APP-04-01'],
    ]),
  ]),

  /* ══ 4 ═══════════════════════════════════════════════════════════════════ */
  S(4, 'S04', 'Marketing', null, [
    B('Email marketing', [
      ['Contact lists', 'APP-17-02'], ['Segmentation', 'APP-17-02'], ['Campaigns', 'APP-17-02'],
      ['Newsletters', 'APP-17-02'], ['Email templates', 'APP-17-02'],
      ['Personalization', 'APP-17-02'], ['Dynamic content', 'APP-17-02'],
      ['A/B testing', 'APP-17-02'], ['Scheduling', 'APP-17-01'],
      ['Autoresponders', 'APP-17-04'], ['Drip campaigns', 'APP-17-04'],
      ['Email journeys', 'APP-17-04'],
      ['Open tracking', null, 'Needs a sending domain with reputation and a provider that reports opens.'],
      ['Click tracking', null, 'Same: a tracked link is served by the sending provider.'],
      ['Bounce tracking', null, 'Bounces are reported by the sending provider.'],
      ['Unsubscribe management', 'APP-01-06'], ['Campaign analytics', 'APP-17-02'],
    ]),
    B('Marketing automation', [
      ['Customer journeys', 'APP-17-04'], ['Lead scoring', 'APP-04-01'],
      ['Behavioral triggers', 'APP-17-04'], ['Website tracking', 'APP-19-03'],
      ['Form submissions', 'APP-04-04'], ['Campaign attribution', 'APP-17-02'],
      ['Conversion tracking', 'APP-19-03'], ['Audience segmentation', 'APP-17-02'],
      ['Automated campaigns', 'APP-17-04'], ['CRM synchronization', 'APP-04-01'],
    ]),
    B('Social media', [
      ['Social accounts', 'APP-17-01', 'Connecting an account needs each platform’s API credentials and app review.'],
      ['Publishing', 'APP-18-08', 'Posting to a platform needs its credentials.'],
      ['Scheduling', 'APP-17-01'], ['Content calendar', 'APP-17-01'], ['Drafts', 'APP-17-01'],
      ['Approval workflows', 'APP-20-03'],
      ['Comments', null, 'Reading comments needs platform credentials.'],
      ['Mentions', null, 'Reading mentions needs each platform’s credentials and its rate limits.'],
      ['Social listening', null, 'Needs paid listening APIs.'],
      ['Engagement', null], ['Analytics', 'APP-17-01'],
    ]),
    B('Landing pages', [
      ['Drag-and-drop builder', 'APP-17-07'], ['Templates', 'APP-17-07'],
      ['Forms', 'APP-04-04'], ['Popups', 'APP-17-07'],
      ['Conversion tracking', 'APP-19-03'], ['A/B testing', 'APP-17-07'],
      ['SEO', 'APP-19-01'], ['Analytics', 'APP-19-03'],
      ['Custom domains', null, 'Needs a domain and a host that serves it.'],
    ]),
    B('Surveys', [
      ['Survey builder', 'APP-04-04'], ['Conditional logic', 'APP-04-04'],
      ['Question branching', 'APP-04-04'], ['Templates', 'APP-04-04'],
      ['Distribution', 'APP-01-04'], ['QR codes', 'APP-10-02'],
      ['Analytics', 'APP-04-04'], ['Customer feedback', 'APP-04-04'],
    ]),
    B('Events', [
      ['Event creation', 'APP-17-06'], ['Registration', 'APP-17-06'], ['Tickets', 'APP-17-06'],
      ['Attendees', 'APP-17-06'], ['Speakers', 'APP-17-06'], ['Sponsors', 'APP-17-06'],
      ['Sessions', 'APP-17-06'], ['Event website', 'APP-17-07'],
      ['Check-in', 'APP-10-02'], ['QR codes', 'APP-10-02'],
      ['Notifications', 'APP-01-04'], ['Event analytics', 'APP-17-06'],
    ]),
    B('Webinars', [
      ['Registration', 'APP-17-06'], ['Landing pages', 'APP-17-07'],
      ['Invitations', 'APP-01-04'], ['Reminders', 'APP-01-04'],
      ['Video', null, 'Live video needs media infrastructure.'],
      ['Screen sharing', null, 'Live video is media infrastructure — servers, bandwidth and relays, not application code.'],
      ['Polls', null], ['Q&A', null], ['Chat', 'APP-20-06'],
      ['Recording', null, 'Needs the live video layer first.'],
      ['Attendance analytics', 'APP-17-06'],
    ]),
  ]),

  /* ══ 5 ═══════════════════════════════════════════════════════════════════ */
  S(5, 'S05', 'Customer support / helpdesk', 'ZOHO_DESK_ZIA', [
    B('Ticketing', [
      ['Ticket creation', 'APP-04-03'],
      ['Email-to-ticket', 'APP-04-03', 'Needs a mailbox the system can read, on a real domain.'],
      ['Web tickets', 'APP-04-03'], ['Chat tickets', 'APP-04-03'],
      ['Phone tickets', null, 'A ticket raised on a call needs a telephony carrier and a number.'],
      ['Social tickets', null, 'Needs platform credentials.'],
      ['Ticket assignment', 'APP-04-03'], ['Ticket routing', 'APP-04-03'],
      ['Priority', 'APP-04-03'], ['Categories', 'APP-04-03'], ['Status', 'APP-04-03'],
      ['Tags', 'APP-04-03'], ['Ticket queues', 'APP-04-03'], ['SLA', 'APP-04-03'],
      ['Escalation', 'APP-04-03'], ['Automated workflows', 'APP-20-05'],
      ['Macros', 'APP-04-03'], ['Templates', 'APP-04-03'],
    ]),
    B('Support', [
      ['Knowledge base', 'APP-20-07'], ['Help center', 'APP-20-07'],
      ['Community', 'APP-20-04'], ['Customer portal', 'APP-04-01'],
      ['Multi-brand support', 'APP-01-02'], ['Service contracts', 'APP-04-02'],
      ['Customer satisfaction', 'APP-04-04'], ['Feedback', 'APP-04-04'],
      ['Surveys', 'APP-04-04'], ['Agent performance', 'APP-21-02'],
      ['Response-time analytics', 'APP-21-02'], ['Resolution analytics', 'APP-21-02'],
    ]),
    B('Live chat', [
      ['Website chat', 'APP-04-03'], ['Chat routing', 'APP-04-03'],
      ['Chatbots', 'APP-22-02'], ['AI chatbot', 'APP-22-02'],
      ['Visitor information', 'APP-19-03'], ['Proactive chat', 'APP-04-03'],
      ['Chat history', 'APP-04-03'],
    ]),
  ]),

  /* ══ 6 ═══════════════════════════════════════════════════════════════════ */
  S(6, 'S06', 'Finance and accounting', 'ZOHO_BOOKS_FEATURES', [
    B('Chart of accounts', [
      ['Assets', 'APP-12-01'], ['Liabilities', 'APP-12-01'], ['Equity', 'APP-12-01'],
      ['Revenue', 'APP-12-01'], ['Expenses', 'APP-12-01'], ['Cost of goods sold', 'APP-12-01'],
    ]),
    B('Transactions', [
      ['Sales', 'APP-05-01'], ['Purchases', 'APP-07-01'], ['Payments', 'APP-12-06'],
      ['Receipts', 'APP-12-06'], ['Expenses', 'APP-12-03'], ['Journals', 'APP-12-01'],
      ['Transfers', 'APP-13-02'], ['Credit notes', 'APP-12-02'],
      ['Debit notes', 'APP-12-02'], ['Refunds', 'APP-15-06'],
    ]),
    B('Accounts receivable', [
      ['Customers', 'APP-04-01'], ['Estimates', 'APP-05-05'], ['Quotes', 'APP-05-05'],
      ['Sales orders', 'APP-15-02'], ['Invoices', 'APP-12-02'],
      ['Recurring invoices', 'APP-05-07'], ['Payment tracking', 'APP-12-06'],
      ['Payment reminders', 'APP-12-06'], ['Customer statements', 'APP-12-06'],
    ]),
    B('Accounts payable', [
      ['Vendors', 'APP-07-02'], ['Purchase orders', 'APP-07-01'], ['Bills', 'APP-12-06'],
      ['Vendor credits', 'APP-12-06'], ['Vendor payments', 'APP-16-05'],
      ['Payment schedules', 'APP-12-06'],
    ]),
    B('Banking', [
      ['Bank accounts', 'APP-13-02'],
      ['Bank feeds', null, 'A feed is the bank’s own credentialed connection, or an aggregator’s.'],
      ['Transaction matching', 'APP-13-02'], ['Reconciliation', 'APP-13-02'],
      ['Transfers', 'APP-13-02'], ['Cash management', 'APP-13-01'],
    ]),
    B('Taxes', [
      ['GST', 'APP-12-04'], ['Tax rates', 'APP-12-04'], ['Tax groups', 'APP-12-04'],
      ['Tax reports', 'APP-12-04'], ['TDS', 'APP-14-03'],
      ['E-invoicing', 'APP-12-02', 'An IRN comes from the government portal and needs registered credentials.'],
      ['E-way bills', 'APP-11-04', 'Same portal, same credential requirement.'],
      ['Tax reconciliation', 'APP-12-05'],
    ]),
    B('Financial reports', [
      ['Profit & Loss', 'APP-12-09'], ['Balance Sheet', 'APP-12-09'],
      ['Cash Flow', 'APP-13-01'], ['Trial Balance', 'APP-12-09'],
      ['General Ledger', 'APP-12-01'], ['Accounts Receivable', 'APP-12-06'],
      ['Accounts Payable', 'APP-12-06'], ['Tax reports', 'APP-12-04'],
      ['Expense reports', 'APP-12-03'], ['Revenue reports', 'APP-12-09'],
      ['Product profitability', 'APP-21-01'], ['Customer profitability', 'APP-21-01'],
    ]),
  ]),

  /* ══ 7 ═══════════════════════════════════════════════════════════════════ */
  S(7, 'S07', 'Expense management', null, [
    B('Expenses', [
      ['Expense entry', 'APP-12-03'], ['Receipt upload', 'APP-12-03'],
      ['OCR', 'APP-22-05'], ['Expense categories', 'APP-12-03'],
      ['Expense reports', 'APP-12-03'], ['Employee reimbursement', 'APP-16-02'],
      ['Approval workflows', 'APP-20-03'],
      ['Corporate cards', null, 'Needs a card issuer relationship.'],
      ['Card transactions', null, 'The transaction feed is the card issuer’s, released under their agreement.'],
      ['Mileage', 'APP-12-03'], ['Travel expenses', 'APP-12-03'],
      ['Per diem', 'APP-12-03'], ['Advances', 'APP-16-02'],
      ['Expense policies', 'APP-12-03'], ['Budgets', 'APP-13-03'],
      ['Accounting synchronization', 'APP-12-01'], ['Expense analytics', 'APP-12-03'],
    ]),
  ]),

  /* ══ 8 ═══════════════════════════════════════════════════════════════════ */
  S(8, 'S08', 'Billing and subscriptions', 'ZOHO_BOOKS_FEATURES', [
    B('Billing', [
      ['Products', 'APP-03-02'], ['Plans', 'APP-05-07'], ['Add-ons', 'APP-05-07'],
      ['Subscriptions', 'APP-05-07'], ['Recurring billing', 'APP-05-07'],
      ['One-time billing', 'APP-12-02'], ['Usage-based billing', 'APP-05-07'],
      ['Coupons', 'APP-17-08'], ['Discounts', 'APP-17-08'], ['Taxes', 'APP-12-04'],
      ['Invoices', 'APP-12-02'], ['Credit notes', 'APP-12-02'],
      ['Refunds', 'APP-15-06'],
      ['Payment retries', null, 'A retry is a second attempt against a payment gateway.'],
      ['Dunning', 'APP-12-06'], ['Revenue recognition', 'APP-12-01'],
      ['Customer portal', 'APP-04-01'], ['Subscription analytics', 'APP-05-07'],
    ]),
  ]),

  /* ══ 9 ═══════════════════════════════════════════════════════════════════ */
  S(9, 'S09', 'Procurement', null, [
    B('Procure to pay', [
      ['Purchase requisition', 'APP-07-01'], ['RFQ', 'APP-07-01'],
      ['Supplier quotations', 'APP-07-01'], ['Supplier selection', 'APP-07-02'],
      ['Purchase order', 'APP-07-01'], ['Goods receipt', 'APP-07-01'],
      ['Bill', 'APP-12-06'], ['Approval', 'APP-20-03'],
      ['Payment', 'APP-16-05'], ['Accounting', 'APP-12-01'],
    ]),
    B('Features', [
      ['Vendors', 'APP-07-02'], ['Supplier database', 'APP-07-02'], ['RFQs', 'APP-07-01'],
      ['Quotations', 'APP-07-01'], ['Purchase orders', 'APP-07-01'],
      ['Purchase approvals', 'APP-20-03'], ['Contracts', 'APP-04-02'],
      ['Goods receipts', 'APP-07-01'], ['Invoice matching', 'APP-12-05'],
      ['Spend management', 'APP-13-03'], ['Supplier evaluation', 'APP-07-02'],
      ['Procurement analytics', 'APP-07-01'], ['Budgets', 'APP-06-03'],
    ]),
  ]),

  /* ══ 10 ══════════════════════════════════════════════════════════════════ */
  S(10, 'S10', 'Inventory', 'ZOHO_INV_FEATURES', [
    B('Items', [
      ['Products', 'APP-03-02'], ['SKUs', 'APP-03-02'], ['Variants', 'APP-03-02'],
      ['Categories', 'APP-03-02'], ['Brands', 'APP-03-02'], ['Units', 'APP-03-02'],
      ['Price lists', 'APP-03-02'], ['Barcodes', 'APP-10-02'],
      ['Serial numbers', 'APP-10-02'], ['Batch numbers', 'APP-09-01'],
      ['Expiry dates', 'APP-09-01'],
    ]),
    B('Warehouses', [
      ['Multiple warehouses', 'APP-10-01'], ['Storage locations', 'APP-10-01'],
      ['Bins', 'APP-10-01'], ['Stock transfers', 'APP-03-01'],
      ['Stock adjustments', 'APP-03-01'], ['Stock counts', 'APP-03-01'],
      ['Opening stock', 'APP-03-01'], ['Stock reservations', 'APP-03-01'],
    ]),
    B('Inventory movements', [
      ['Purchase receipt', 'APP-07-01'], ['Sales shipment', 'APP-11-04'],
      ['Transfer', 'APP-03-01'], ['Return', 'APP-15-06'], ['Damage', 'APP-09-01'],
      ['Adjustment', 'APP-03-01'], ['Consumption', 'APP-08-03'],
      ['Production', 'APP-08-01'], ['Rework', 'APP-08-01'],
    ]),
    B('Inventory intelligence', [
      ['Reorder point', 'APP-06-02'], ['Minimum stock', 'APP-06-02'],
      ['Maximum stock', 'APP-06-02'], ['Low-stock alerts', 'APP-01-04'],
      ['Dead-stock identification', 'APP-17-08'], ['Inventory valuation', 'APP-12-01'],
      ['Stock aging', 'APP-03-01'], ['Inventory turnover', 'APP-21-01'],
      ['Demand forecasting', 'APP-06-01'],
    ]),
  ]),

  /* ══ 11 ══════════════════════════════════════════════════════════════════ */
  S(11, 'S11', 'E-commerce', 'EASY_HOME', [
    B('Storefront', [
      ['Homepage', 'APP-17-07'], ['Categories', 'APP-03-02'], ['Product pages', 'APP-15-09'],
      ['Search', 'APP-15-09'], ['Filters', 'APP-15-09'], ['Product variants', 'APP-03-02'],
      ['Size/color options', 'APP-03-02'], ['Wishlist', 'APP-15-07'],
      ['Cart', 'APP-15-07'],
      ['Checkout', null, 'Checkout ends at a payment gateway, which needs a licence and credentials.'],
      ['Customer accounts', 'APP-04-01'],
    ]),
    B('Orders', [
      ['Order creation', 'APP-15-02'],
      ['Payment', null, 'Taking money needs a licensed payment gateway and its credentials.'],
      ['Fulfillment', 'APP-10-01'], ['Packing', 'APP-10-03'],
      ['Shipment', 'APP-11-04'],
      ['Tracking', 'APP-05-06', 'Tracking numbers come from the carrier’s API.'],
      ['Returns', 'APP-15-06'], ['Refunds', 'APP-15-06'],
      ['Exchanges', 'APP-15-06'], ['Cancellation', 'APP-15-02'],
    ]),
    B('Marketing', [
      ['Coupons', 'APP-17-08'], ['Discounts', 'APP-17-08'], ['Promotions', 'APP-17-08'],
      ['Abandoned cart', 'APP-17-04'], ['Customer segmentation', 'APP-17-02'],
      ['Product recommendations', 'APP-15-10'], ['Reviews', 'APP-04-04'],
      ['Loyalty', 'APP-04-01'],
    ]),
    B('Store administration', [
      ['Products', 'APP-03-02'], ['Inventory', 'APP-03-01'], ['Customers', 'APP-04-01'],
      ['Orders', 'APP-15-02'], ['Shipping', 'APP-11-01'], ['Taxes', 'APP-12-04'],
      ['Payments', null, 'Taking money needs a licensed payment gateway and its credentials.'],
      ['Analytics', 'APP-21-01'], ['SEO', 'APP-19-01'],
      ['Domains', null, 'Needs a registrar and a host.'],
      ['Themes', 'APP-17-07'], ['CMS', 'APP-17-05'], ['Blog', 'APP-17-05'],
    ]),
  ]),

  /* ══ 12 ══════════════════════════════════════════════════════════════════ */
  S(12, 'S12', 'POS', null, [
    B('Retail POS', [
      ['Store selection', 'APP-05-04'], ['Register', 'APP-05-04'], ['Cashier', 'APP-05-04'],
      ['Barcode scanner', 'APP-10-02'], ['Product lookup', 'APP-03-02'],
      ['Cart', 'APP-05-04'], ['Discounts', 'APP-17-08'], ['Taxes', 'APP-12-04'],
      ['Payments', null, 'Needs a gateway or a card terminal.'],
      ['Cash', 'APP-05-04'],
      ['Card', null, 'Needs a terminal and an acquirer.'],
      ['UPI', null, 'Needs a registered VPA and a provider.'],
      ['Returns', 'APP-15-06'], ['Exchanges', 'APP-15-06'],
      ['Receipts', 'APP-01-03'], ['Customer lookup', 'APP-04-01'],
      ['Loyalty', 'APP-04-01'], ['Inventory synchronization', 'APP-03-01'],
      ['Daily closing', 'APP-05-04'], ['Sales reports', 'APP-21-02'],
    ]),
  ]),
  /* ══ 13 ══════════════════════════════════════════════════════════════════ */
  S(13, 'S13', 'HR', 'ZOHO_PEOPLE', [
    B('Employee database', [
      ['Employee profiles', 'APP-16-01'], ['Personal information', 'APP-16-01'],
      ['Employment information', 'APP-16-01'], ['Departments', 'APP-16-01'],
      ['Designations', 'APP-16-01'], ['Reporting managers', 'APP-16-01'],
      ['Documents', 'APP-04-02'], ['Skills', 'APP-16-03'], ['Qualifications', 'APP-16-03'],
    ]),
    B('Employee lifecycle', [
      ['Recruitment', 'APP-16-04'], ['Hiring', 'APP-16-03'], ['Onboarding', 'APP-16-01'],
      ['Probation', 'APP-16-01'], ['Transfers', 'APP-16-01'],
      ['Promotions', 'APP-16-03'], ['Offboarding', 'APP-16-01'],
    ]),
    B('Attendance', [
      ['Clock-in/out', 'APP-16-02'], ['Attendance', 'APP-16-02'], ['Shifts', 'APP-16-02'],
      ['Overtime', 'APP-16-05'], ['Breaks', 'APP-16-02'], ['Late arrivals', 'APP-16-02'],
      ['Early departures', 'APP-16-02'], ['Attendance policies', 'APP-16-02'],
    ]),
    B('Leave', [
      ['Leave types', 'APP-16-02'], ['Leave balances', 'APP-16-02'],
      ['Leave requests', 'APP-16-02'], ['Approval', 'APP-20-03'],
      ['Holidays', 'APP-16-02'], ['Leave calendar', 'APP-16-02'],
    ]),
    B('Performance', [
      ['Goals', 'APP-16-03'], ['OKRs', 'APP-16-03'], ['KPIs', 'APP-21-01'],
      ['Reviews', 'APP-16-03'], ['Appraisals', 'APP-16-03'], ['Feedback', 'APP-16-03'],
      ['Competencies', 'APP-16-03'], ['Performance reports', 'APP-21-02'],
    ]),
    B('Learning', [
      ['Courses', null], ['Lessons', null], ['Training', null], ['Assessments', null],
      ['Certifications', 'APP-09-02'], ['Learning paths', null],
      ['Employee progress', null],
    ]),
  ]),

  /* ══ 14 ══════════════════════════════════════════════════════════════════ */
  S(14, 'S14', 'Recruitment', null, [
    B('Recruitment', [
      ['Job openings', 'APP-16-04'], ['Candidate database', 'APP-16-04'],
      ['Resume upload', 'APP-16-04'], ['Resume parsing', 'APP-22-05'],
      ['Candidate matching', 'APP-16-04'], ['Candidate pipeline', 'APP-16-04'],
      ['Interview scheduling', 'APP-16-04'], ['Recruiter assignment', 'APP-16-04'],
      ['Client management', 'APP-04-01'],
      ['Job boards', null, 'Posting to a board needs that board’s account and API.'],
      ['Candidate portal', 'APP-16-04'],
      ['Email', null, 'Needs a sending domain and provider.'],
      ['Assessments', null], ['Hiring workflows', 'APP-20-05'],
      ['Recruitment analytics', 'APP-21-02'], ['AI candidate matching', 'APP-22-01'],
    ]),
  ]),

  /* ══ 15 ══════════════════════════════════════════════════════════════════ */
  S(15, 'S15', 'Payroll', 'ZOHO_PAYROLL_LEAVE', [
    B('Payroll', [
      ['Salary structures', 'APP-16-05'], ['Employees', 'APP-16-01'],
      ['Earnings', 'APP-16-05'], ['Deductions', 'APP-16-05'], ['Benefits', 'APP-16-05'],
      ['Bonuses', 'APP-16-05'], ['Overtime', 'APP-16-05'],
      ['Attendance integration', 'APP-16-02'], ['Leave integration', 'APP-16-02'],
      ['Tax calculation', 'APP-14-03'], ['Payroll processing', 'APP-16-05'],
      ['Payslips', 'APP-16-05'], ['Payroll reports', 'APP-16-05'],
      ['Employee self-service', 'APP-16-01'], ['Reimbursements', 'APP-16-02'],
      ['Compliance', 'APP-09-02'],
    ]),
  ]),

  /* ══ 16 ══════════════════════════════════════════════════════════════════ */
  S(16, 'S16', 'Project management', 'ZOHO_PROJECTS', [
    B('Projects', [
      ['Projects', 'APP-20-01'], ['Project templates', 'APP-20-01'], ['Tasks', 'APP-20-01'],
      ['Subtasks', 'APP-20-01'], ['Milestones', 'APP-20-01'], ['Dependencies', 'APP-20-01'],
      ['Gantt charts', 'APP-20-02'], ['Kanban boards', 'APP-20-01'],
      ['Calendar', null], ['Timesheets', 'APP-20-02'], ['Issues', 'APP-20-01'],
      ['Documents', 'APP-04-02'], ['Forums', 'APP-20-04'], ['Comments', 'APP-20-06'],
      ['Mentions', 'APP-20-06'], ['Notifications', 'APP-01-04'],
      ['Project budgets', 'APP-13-03'], ['Resource allocation', 'APP-20-02'],
      ['Client access', 'APP-04-01'], ['Reports', 'APP-21-02'], ['Dashboards', 'APP-21-01'],
    ]),
  ]),

  /* ══ 17 ══════════════════════════════════════════════════════════════════ */
  S(17, 'S17', 'Agile development', null, [
    B('Agile', [
      ['Product backlog', null], ['Epics', null], ['User stories', null],
      ['Sprints', null], ['Scrum boards', null], ['Story points', null],
      ['Sprint planning', null], ['Sprint reviews', null], ['Retrospectives', null],
      ['Velocity', null], ['Burndown', null], ['Release planning', null],
      ['Timesheets', 'APP-20-02'], ['Issue tracking', 'APP-20-01'],
    ]),
  ]),

  /* ══ 18 ══════════════════════════════════════════════════════════════════ */
  S(18, 'S18', 'Document management', null, [
    B('Storage', [
      ['Cloud storage', null, 'Storing customers’ files needs storage somewhere deployed, with its cost and its backups.'],
      ['Folders', 'APP-04-02'], ['Team folders', 'APP-04-02'],
      ['Shared folders', 'APP-04-02'], ['Permissions', 'APP-01-01'],
      ['File upload', 'APP-04-02'], ['File preview', 'APP-04-02'],
      ['File versioning', 'APP-04-02'], ['Comments', 'APP-20-06'],
      ['Mentions', 'APP-20-06'], ['Search', 'APP-22-05'],
      ['File sharing', 'APP-04-02'], ['External sharing', 'APP-04-02'],
      ['Document recovery', null], ['Desktop synchronization', null, 'Needs a desktop client installed on each machine.'],
      ['Mobile access', null, 'Needs a mobile app and the store accounts to release it.'],
    ]),
    B('Document applications', [
      ['Word processor', null], ['Spreadsheet', 'APP-21-04'],
      ['Presentation', null], ['Notes', null],
    ]),
    B('Document features', [
      ['Collaboration', null], ['Comments', 'APP-20-06'], ['Track changes', null],
      ['Version history', 'APP-04-02'], ['Templates', 'APP-04-02'],
      ['Sharing', 'APP-04-02'], ['Export/import', 'APP-03-04'],
      ['PDF generation', 'APP-01-03'],
    ]),
  ]),

  /* ══ 19 ══════════════════════════════════════════════════════════════════ */
  S(19, 'S19', 'Email', null, [
    B('Business email', [
      ['Custom domains', null, 'Needs a registrar, DNS and mail records.'],
      ['Mailboxes', null, 'Hosting mail is infrastructure with deliverability and spam reputation attached.'],
      ['Aliases', null, 'Hosting mail is infrastructure with deliverability and spam reputation attached.'],
      ['Groups', null, 'Hosting mail is infrastructure with deliverability and spam reputation attached.'],
      ['Shared mailboxes', null, 'Hosting mail is infrastructure with deliverability and spam reputation attached.'],
      ['Inbox', null, 'Hosting mail is infrastructure with deliverability and spam reputation attached.'],
      ['Sent', null, 'Hosting mail is infrastructure with deliverability and spam reputation attached.'],
      ['Drafts', null, 'Hosting mail is infrastructure with deliverability and spam reputation attached.'],
      ['Spam', null, 'Spam filtering is judged against a sending reputation nobody has built yet.'],
      ['Filters', null], ['Folders', null], ['Labels', null], ['Search', null],
      ['Attachments', null], ['Signatures', null], ['Vacation responder', null],
      ['Email rules', null], ['Email forwarding', null],
      ['Email security', null, 'SPF, DKIM and DMARC are DNS on a domain nobody has pointed yet.'],
      ['Admin controls', null],
    ]),
  ]),

  /* ══ 20 ══════════════════════════════════════════════════════════════════ */
  S(20, 'S20', 'Calendar', null, [
    B('Calendar', [
      ['Events', null], ['Recurring events', null], ['Invitations', null],
      ['Shared calendars', null], ['Team calendars', null], ['Resource booking', null],
      ['Reminders', 'APP-01-04'], ['Availability', null], ['Time zones', null],
      ['Scheduling', null],
      ['Calendar synchronization', null, 'Syncing to an outside calendar needs that provider’s credentials.'],
    ]),
  ]),

  /* ══ 21 ══════════════════════════════════════════════════════════════════ */
  S(21, 'S21', 'Team chat', null, [
    B('Chat', [
      ['Direct messages', 'APP-20-06'], ['Group chats', 'APP-20-06'],
      ['Channels', 'APP-20-06'], ['Threads', 'APP-20-06'], ['Replies', 'APP-20-06'],
      ['File sharing', 'APP-04-02'], ['Mentions', 'APP-20-06'],
      ['Reactions', 'APP-20-06'], ['Search', 'APP-22-05'],
      ['Audio calls', null, 'Needs live media infrastructure.'],
      ['Video calls', null, 'Live video is media infrastructure — servers, bandwidth and relays, not application code.'],
      ['Screen sharing', null, 'Live video is media infrastructure — servers, bandwidth and relays, not application code.'],
      ['Bots', 'APP-22-03'], ['Commands', 'APP-01-03'], ['Workflows', 'APP-20-05'],
      ['Notifications', 'APP-01-04'], ['Announcements', 'APP-01-04'],
    ]),
  ]),

  /* ══ 22 ══════════════════════════════════════════════════════════════════ */
  S(22, 'S22', 'Video meetings', null, [
    B('Meetings', [
      ['Meetings', null, 'Live video is media infrastructure — servers, bandwidth and turn relays, not application code.'],
      ['Video', null, 'Live video is media infrastructure — servers, bandwidth and relays, not application code.'],
      ['Audio', null, 'Live video is media infrastructure — servers, bandwidth and relays, not application code.'],
      ['Screen sharing', null, 'Live video is media infrastructure — servers, bandwidth and relays, not application code.'],
      ['Recording', null, 'Recording needs the live media layer that does not exist to record.'],
      ['Chat', 'APP-20-06'], ['Polls', null], ['Q&A', null],
      ['Participant management', null], ['Co-hosts', null], ['Moderators', null],
      ['Scheduling', null],
      ['Calendar integration', null, 'Needs an outside calendar provider’s credentials.'],
      ['Webinar mode', null, 'Needs the live video layer first.'],
      ['Analytics', null],
    ]),
  ]),

  /* ══ 23 ══════════════════════════════════════════════════════════════════ */
  S(23, 'S23', 'Shared team inbox', null, [
    B('Shared inbox', [
      ['Shared inboxes', null, 'Needs hosted mail on a real domain.'],
      ['Team email', null, 'Hosting mail is infrastructure with deliverability and spam reputation attached.'],
      ['Assignment', 'APP-04-03'], ['Threads', 'APP-04-03'],
      ['Internal comments', 'APP-20-06'], ['Tags', 'APP-04-03'],
      ['Mentions', 'APP-20-06'], ['SLA', 'APP-04-03'],
      ['Email templates', 'APP-17-02'], ['Automation', 'APP-20-05'],
      ['Analytics', 'APP-21-02'],
    ]),
  ]),

  /* ══ 24 ══════════════════════════════════════════════════════════════════ */
  S(24, 'S24', 'Low-code app builder', 'ZOHO_DEVELOPER', [
    B('Builder', [
      ['Drag-and-drop UI', null], ['Forms', 'APP-04-04'], ['Tables', 'APP-21-04'],
      ['Reports', 'APP-21-02'], ['Dashboards', 'APP-21-01'], ['Pages', 'APP-17-05'],
      ['Databases', null], ['Relationships', null], ['Workflows', 'APP-20-05'],
      ['Approvals', 'APP-20-03'], ['Permissions', 'APP-01-01'], ['Portals', 'APP-04-01'],
      ['Custom domains', null, 'Needs a registrar and a host.'],
      ['APIs', null], ['Webhooks', null], ['Custom functions', null],
      ['Scripting', null], ['App deployment', null, 'Needs somewhere to deploy to.'],
      ['App versioning', null],
    ]),
  ]),

  /* ══ 25 ══════════════════════════════════════════════════════════════════ */
  S(25, 'S25', 'Workflow automation', null, [
    B('Trigger types', [
      ['Record created', 'APP-20-05'], ['Record updated', 'APP-20-05'],
      ['Record deleted', 'APP-20-05'], ['Field changed', 'APP-20-05'],
      ['Form submitted', 'APP-04-04'],
      ['Payment received', null, 'The event comes from a gateway.'],
      ['Order created', 'APP-15-02'], ['Inventory threshold', 'APP-06-02'],
      ['Date/time', 'APP-20-05'], ['Scheduled event', 'APP-20-05'],
      ['Webhook', null], ['API', null],
      ['Customer action', 'APP-19-03'], ['Employee action', 'APP-16-02'],
      ['AI event', 'APP-22-03'],
    ]),
    B('Actions', [
      ['Create record', 'APP-20-05'], ['Update record', 'APP-20-05'],
      ['Delete record', 'APP-20-05'], ['Send email', null, 'Needs a sending domain and provider.'],
      ['Send notification', 'APP-01-04'],
      ['Send SMS', null, 'Needs an SMS provider and a registered sender.'],
      ['Create task', 'APP-20-01'], ['Assign owner', 'APP-20-01'],
      ['Request approval', 'APP-20-03'], ['Call webhook', null],
      ['Execute function', null], ['Update another application', 'APP-20-05'],
      ['Generate document', 'APP-01-03'], ['Trigger AI agent', 'APP-22-03'],
    ]),
    B('Logic', [
      ['IF', 'APP-20-05'], ['ELSE', 'APP-20-05'], ['AND', 'APP-20-05'],
      ['OR', 'APP-20-05'], ['Conditions', 'APP-20-05'], ['Branches', 'APP-20-05'],
      ['Loops', 'APP-20-05'], ['Delays', 'APP-20-05'], ['Schedules', 'APP-20-05'],
      ['Error handling', 'APP-20-05'], ['Retry', 'APP-20-05'], ['Logs', 'APP-22-04'],
    ]),
  ]),

  /* ══ 26 ══════════════════════════════════════════════════════════════════ */
  S(26, 'S26', 'Integration platform', 'ZOHO_DEV_WEBHOOKS', [
    B('Integration', [
      ['Triggers', null], ['Actions', null], ['Conditions', 'APP-20-05'],
      ['Multi-step workflows', 'APP-20-05'], ['Webhooks', null], ['APIs', null],
      ['OAuth', null, 'Against somebody else’s provider, needing a registered application.'],
      ['API keys', null, 'A key is issued by the service being integrated with.'],
      ['Custom connectors', null], ['Data transformation', 'APP-03-04'],
      ['Error handling', 'APP-20-05'], ['Logs', 'APP-22-04'],
      ['Retry', 'APP-20-05'], ['Scheduling', 'APP-20-05'],
    ]),
  ]),

  /* ══ 27 ══════════════════════════════════════════════════════════════════ */
  S(27, 'S27', 'Data preparation', null, [
    B('Data prep', [
      ['Data import', 'APP-03-04'], ['CSV import', 'APP-03-04'],
      ['Excel import', 'APP-21-04'],
      ['API ingestion', null, 'Ingesting from a service needs its credentials.'],
      ['Data profiling', 'APP-03-04'], ['Data cleaning', 'APP-03-04'],
      ['Deduplication', 'APP-03-04'], ['Validation', 'APP-03-04'],
      ['Transformation', 'APP-03-04'], ['Formatting', 'APP-03-04'],
      ['Enrichment', null], ['Data masking', 'APP-01-06'],
      ['Data pipelines', null], ['Scheduled imports', 'APP-20-05'],
      ['Export', 'APP-03-04'],
    ]),
  ]),

  /* ══ 28 ══════════════════════════════════════════════════════════════════ */
  S(28, 'S28', 'Business analytics', 'ZOHO_ANALYTICS_GANTT', [
    B('Data sources', [
      ['CRM', 'APP-04-01'], ['Finance', 'APP-12-09'], ['Inventory', 'APP-03-01'],
      ['Commerce', 'APP-15-02'], ['HR', 'APP-16-01'], ['Projects', 'APP-20-01'],
      ['Support', 'APP-04-03'], ['Marketing', 'APP-17-02'],
      ['External databases', null, 'Needs the other database’s credentials.'],
      ['APIs', null], ['CSV', 'APP-03-04'], ['Excel', 'APP-21-04'],
    ]),
    B('Visualization', [
      ['KPI cards', 'APP-21-01'], ['Tables', 'APP-21-02'], ['Charts', 'APP-21-01'],
      ['Bar charts', 'APP-21-01'], ['Line charts', 'APP-21-01'],
      ['Pie charts', 'APP-21-01'], ['Funnel charts', 'APP-21-01'],
      ['Maps', null], ['Pivot tables', 'APP-21-04'], ['Cohort analysis', 'APP-21-02'],
      ['Dashboards', 'APP-21-01'],
    ]),
    B('Analytics', [
      ['Revenue', 'APP-12-09'], ['Profit', 'APP-12-09'], ['Margin', 'APP-21-01'],
      ['Sales', 'APP-21-01'], ['Customer acquisition', 'APP-17-02'],
      ['Customer retention', 'APP-04-01'], ['Inventory', 'APP-03-01'],
      ['Expenses', 'APP-12-03'], ['Cash flow', 'APP-13-01'],
      ['Employee performance', 'APP-16-03'], ['Marketing ROI', 'APP-17-02'],
      ['Support performance', 'APP-04-03'], ['Project performance', 'APP-20-01'],
    ]),
    B('Report features', [
      ['Filters', 'APP-21-02'], ['Drill-down', 'APP-21-02'],
      ['Scheduled reports', 'APP-20-05'],
      ['Email reports', null, 'Needs a sending domain and provider.'],
      ['Alerts', 'APP-01-04'], ['Forecasting', 'APP-06-01'],
      ['Data blending', 'APP-21-03'], ['Embedded analytics', null],
    ]),
  ]),

  /* ══ 29 ══════════════════════════════════════════════════════════════════ */
  S(29, 'S29', 'AI platform', 'ZOHO_ZIA', [
    B('What the AI must understand', [
      ['CRM data', 'APP-22-05'], ['Sales', 'APP-22-05'], ['Customers', 'APP-22-05'],
      ['Orders', 'APP-22-05'], ['Inventory', 'APP-22-05'], ['Finance', 'APP-22-05'],
      ['Employees', 'APP-22-05'], ['Projects', 'APP-22-05'], ['Support', 'APP-22-05'],
      ['Marketing', 'APP-22-05'], ['Analytics', 'APP-22-05'],
    ]),
    B('AI features', [
      ['Natural-language search', 'APP-22-05'],
      ['Ask questions about business data', 'APP-22-01'],
      ['Generate reports', 'APP-21-02'], ['Summarize customers', 'APP-22-01'],
      ['Summarize tickets', 'APP-22-01'],
      ['Summarize meetings', null, 'There is no meeting layer to summarise.'],
      ['Draft emails', 'APP-18-01'], ['Draft quotations', 'APP-05-05'],
      ['Generate product descriptions', 'APP-18-01'],
      ['Generate marketing content', 'APP-18-01'],
      ['Predict sales', 'APP-06-01'], ['Predict churn', 'APP-22-01'],
      ['Predict inventory demand', 'APP-06-01'],
      ['Detect anomalies', 'APP-14-02'], ['Recommend actions', 'APP-22-01'],
      ['Identify overdue tasks', 'APP-20-01'],
      ['Identify financial risks', 'APP-13-01'], ['Explain dashboards', 'APP-22-01'],
    ]),
  ]),

  /* ══ 30 ══════════════════════════════════════════════════════════════════ */
  S(30, 'S30', 'AI agents', 'ZOHO_ZIA', [
    B('The agents', [
      ['Sales Agent', 'APP-22-03'], ['Marketing Agent', 'APP-22-03'],
      ['Support Agent', 'APP-22-03'], ['Finance Agent', 'APP-22-03'],
      ['Inventory Agent', 'APP-22-03'], ['HR Agent', 'APP-22-03'],
      ['Operations Agent', 'APP-22-03'], ['Analytics Agent', 'APP-22-03'],
    ]),
    B('What an agent must be able to do', [
      ['Read authorized data', 'APP-22-04'], ['Reason over business records', 'APP-22-03'],
      ['Recommend actions', 'APP-22-01'], ['Execute authorized actions', 'APP-22-04'],
      ['Create tasks', 'APP-20-01'],
      ['Send messages', null, 'Sending needs a mail or messaging provider.'],
      ['Update records', 'APP-22-04'], ['Generate reports', 'APP-21-02'],
      ['Trigger workflows', 'APP-20-05'],
      ['Every agent action respects permissions and produces an audit log', 'APP-22-04'],
    ]),
  ]),

  /* ══ 31 ══════════════════════════════════════════════════════════════════ */
  S(31, 'S31', 'Contract management', null, [
    B('Contracts', [
      ['Contract templates', 'APP-04-02'], ['Contract creation', 'APP-04-02'],
      ['Clauses', 'APP-04-02'], ['Contract repository', 'APP-04-02'],
      ['Review', 'APP-20-03'], ['Negotiation', 'APP-04-02'],
      ['Approval', 'APP-20-03'],
      ['E-signature', 'APP-04-02', 'A signature with legal standing needs an accredited provider that stands behind the audit trail.'],
      ['Renewal', 'APP-04-02'], ['Expiry alerts', 'APP-01-04'],
      ['Obligations', 'APP-04-02'], ['Compliance', 'APP-09-02'],
    ]),
  ]),
];

module.exports = { SECTIONS, SOURCES, FOUND_ON };
