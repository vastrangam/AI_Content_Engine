'use strict';
/* THE BACKLOG — the 109 lines of the master specification this product does not name at all.
 *
 *   node brand/site/checkbacklog.js --summary
 *
 * WHY THIS IS A SEPARATE REGISTER AND NOT MORE APPS IN modules.js
 * The coverage sheet found 660 uncovered lines. 551 of them are ALREADY in the design —
 * they map to an app that is SPECIFIED and unbuilt, so there is nothing to add. Only these
 * 109 are genuinely absent.
 *
 * Adding them to modules.js as apps was the obvious move and is the wrong one. The app count
 * would go from 113 to 222, every new row entering at the lowest rung, so the score falls and
 * the headline becomes "19 of 222 tested". The numbers would get worse because the
 * denominator grew while nothing was built — which is the opposite of what a register is for.
 * So they live here, named and tracked, and the app register keeps describing what exists.
 *
 * NOTHING HERE IS A COMMITMENT AND NOTHING HERE HAS A STATUS. These are not tasks anybody
 * scheduled. They are the lines somebody would otherwise discover missing in a year, written
 * down once so the discovery happens now. checkbacklog.js refuses a row carrying a status,
 * because a status would make this look like a plan.
 *
 * THE GATE PROVES THE LIST IS EXACTLY THE 109
 * Not a selection of them, and not those plus a few more. It rebuilds the set of absent
 * uncovered items from masterspec.js and requires exact equality — so a line cannot be
 * quietly dropped to make the backlog look shorter, and one of the 551 cannot be smuggled in
 * to make it look longer.
 *
 * THEMES, BECAUSE 109 TASKS IS A LIE
 * These are not 109 independent pieces of work. They are twelve capabilities, and most of the
 * count comes from one of them being enumerated in detail — twelve Agile lines are one Agile
 * board, not twelve features. Each theme says what building it would actually mean and what
 * it would cost, which is the only honest way to read the number.
 */

/* A theme is a capability somebody could decide to build. `module` is where it would live if
   it were built — a real module number in modules.js, checked. `capability` names a row in
   the requirements registry when one already covers the ground, so the two registers point at
   each other rather than describing the same hole twice. */
const THEMES = [
  {
    id: 'T-DEVPLATFORM', title: 'Developer platform — API, webhooks, functions, a builder',
    module: '01', capability: 'CAP-DEVPLATFORM',
    means: 'One decision, not twenty-five: whether anything outside this project may call it. ' +
      'A versioned HTTP surface with keys, rate limits and webhooks out, and then the low-code ' +
      'builder on top of it. Twenty-five of the 109 lines are this one capability enumerated ' +
      'from four different sections of the specification.',
    cost: 'The largest item in the backlog by a distance, and the one with the widest blast ' +
      'radius: the sign-on model has to be settled before the mobile app, because changing it ' +
      'afterwards means reissuing every credential.',
  },
  {
    id: 'T-AGILE', title: 'Agile delivery — backlog, sprints, boards, burndown',
    module: '20', capability: null,
    means: 'A board with stories, points and a sprint boundary, over the tasks that module 20 ' +
      'already has. Thirteen lines, one screen and one report.',
    cost: 'Self-contained and genuinely optional. Nothing else in the design depends on it, ' +
      'and a business running a garment factory may never want it.',
  },
  {
    id: 'T-MEETINGS', title: 'Meetings — scheduling, participants, polls, the record of a call',
    module: '20', capability: null,
    means: 'The half of meetings that is NOT live video: who is invited, when, who came, what ' +
      'was decided, and a poll. The video itself is in the constraints document because it ' +
      'needs media infrastructure; this half needs none.',
    cost: 'Small, and worth separating from video precisely because the useful part does not ' +
      'need the expensive part.',
  },
  {
    id: 'T-CALENDAR', title: 'Calendar — events, invitations, availability, shared calendars',
    module: '20', capability: null,
    means: 'Eleven lines that are one thing. Recurring events and time zones are where the ' +
      'difficulty actually is, and both are solved problems with a library rather than ' +
      'judgement.',
    cost: 'Moderate. Syncing to an outside calendar is in the constraints document; a calendar ' +
      'of its own is not.',
  },
  {
    id: 'T-MAILCLIENT', title: 'Mail handling — folders, filters, rules, signatures, a shared inbox',
    module: '04', capability: null,
    means: 'The reading and organising half of email. HOSTING mail is in the constraints ' +
      'document — deliverability and spam reputation are infrastructure — but once a mailbox ' +
      'exists somewhere, filtering and routing it is ordinary work.',
    cost: 'Only worth starting after a mail domain exists, which is a constraint, not a task.',
  },
  {
    id: 'T-DOCAPPS', title: 'Document applications — writing, presenting, notes, track changes',
    module: '04', capability: null,
    means: 'A word processor, a presentation tool and notes. Eight lines that are three ' +
      'substantial products, and the specification lists them as though they were features.',
    cost: 'The worst effort-to-value ratio in the backlog. Every business already has these, ' +
      'and nobody adopts a business system for its word processor.',
  },
  {
    id: 'T-LEARNING', title: 'Learning — courses, lessons, assessments, progress',
    module: '16', capability: null,
    means: 'Course material, the lessons inside it, an assessment at the end, and a record of ' +
      'who has completed what. Eight lines that are one straightforward application over data ' +
      'module 16 already holds about who works here.',
    cost: 'Small and genuinely useful in a factory, where a machine or a process has to be ' +
      'taught and the record of who was taught it matters for compliance.',
  },
  {
    id: 'T-INTEGRATION', title: 'Integration platform — triggers, actions, custom connectors',
    module: '20', capability: 'CAP-INTEGRATIONS',
    means: 'The connector framework, separate from any connector. The framework can be built ' +
      'and tested against recorded responses; the connectors need credentials and are in the ' +
      'constraints document.',
    cost: 'Only sensible after the API exists, because a connector framework with nothing to ' +
      'connect to is a demonstration.',
  },
  {
    id: 'T-IDENTITY', title: 'Identity and IT — MFA, password management, service management',
    module: '01', capability: 'CAP-THREATMODEL',
    means: 'A second factor on sign-in, and the internal-IT half of the specification. MFA is ' +
      'the one here that matters for a real deployment; the rest is a product for IT ' +
      'departments, which a manufacturer is not.',
    cost: 'MFA is small and should be done before anyone signs in over the internet. The other ' +
      'three are a different product.',
  },
  {
    id: 'T-DATAPIPE', title: 'Data pipelines, enrichment and a warehouse',
    module: '21', capability: 'CAP-ANALYTICS',
    means: 'Scheduled movement of data into somewhere shaped for reporting rather than for ' +
      'transactions.',
    cost: 'Premature. A warehouse is what you build when queries against the live database ' +
      'start hurting, and nothing has ever run at a volume that could hurt.',
  },
  {
    id: 'T-TERRITORY', title: 'Sales territories',
    module: '04', capability: null,
    means: 'Dividing customers and targets by region or team, and reporting against that ' +
      'division.',
    cost: 'Small. Matters when there is a sales team large enough to divide, and not before.',
  },
  {
    id: 'T-SMALL', title: 'Seven small independent lines',
    module: '01', capability: null,
    means: 'Time zones, a dark theme, appointment booking, employee engagement, social ' +
      'engagement, maps in reports, and embedded analytics. Genuinely unrelated to each other ' +
      'and to everything above.',
    cost: 'Each is hours to days. They are grouped only because grouping them stops six ' +
      'one-line themes pretending to be structure.',
  },
];

/* [section number, block, the line's own words, theme]. The first three must match
   masterspec.js exactly — the gate rebuilds this list from there and requires equality, so a
   typo here is a failure rather than a silent mismatch. */
const ITEMS = [
  [1, "Core architecture", "APIs", "T-DEVPLATFORM"],
  [1, "The platform must support", "Multiple time zones", "T-SMALL"],
  [1, "The platform must support", "API access", "T-DEVPLATFORM"],
  [1, "The platform must support", "Webhooks", "T-DEVPLATFORM"],
  [1, "The platform must support", "Dark/light mode", "T-SMALL"],
  [2, "Sales", "Appointment booking", "T-SMALL"],
  [2, "People", "Learning", "T-LEARNING"],
  [2, "People", "Employee engagement", "T-SMALL"],
  [2, "Collaboration", "Calendar", "T-CALENDAR"],
  [2, "Collaboration", "Presentations", "T-DOCAPPS"],
  [2, "Collaboration", "Notes", "T-DOCAPPS"],
  [2, "Collaboration", "Shared inbox", "T-MAILCLIENT"],
  [2, "Projects", "Agile management", "T-AGILE"],
  [2, "Data and analytics", "Data warehouse", "T-DATAPIPE"],
  [2, "Automation", "RPA", "T-DEVPLATFORM"],
  [2, "Automation", "Custom applications", "T-DEVPLATFORM"],
  [2, "Developer platform", "Low-code builder", "T-DEVPLATFORM"],
  [2, "Developer platform", "APIs", "T-DEVPLATFORM"],
  [2, "Developer platform", "Webhooks", "T-DEVPLATFORM"],
  [2, "Developer platform", "Functions", "T-DEVPLATFORM"],
  [2, "Developer platform", "Developer console", "T-DEVPLATFORM"],
  [2, "Developer platform", "App marketplace", "T-DEVPLATFORM"],
  [2, "Security and IT", "MFA", "T-IDENTITY"],
  [2, "Security and IT", "Password management", "T-IDENTITY"],
  [2, "Security and IT", "IT service management", "T-IDENTITY"],
  [2, "Security and IT", "Security analytics", "T-IDENTITY"],
  [3, "Modules", "Meetings", "T-MEETINGS"],
  [3, "Modules", "Territories", "T-TERRITORY"],
  [3, "Modules", "Custom modules", "T-DEVPLATFORM"],
  [3, "Sales functionality", "Territory management", "T-TERRITORY"],
  [3, "Customer 360", "Calls", "T-MEETINGS"],
  [3, "Customer 360", "Meetings", "T-MEETINGS"],
  [4, "Social media", "Engagement", "T-SMALL"],
  [4, "Webinars", "Polls", "T-MEETINGS"],
  [4, "Webinars", "Q&A", "T-MEETINGS"],
  [13, "Learning", "Courses", "T-LEARNING"],
  [13, "Learning", "Lessons", "T-LEARNING"],
  [13, "Learning", "Training", "T-LEARNING"],
  [13, "Learning", "Assessments", "T-LEARNING"],
  [13, "Learning", "Learning paths", "T-LEARNING"],
  [13, "Learning", "Employee progress", "T-LEARNING"],
  [14, "Recruitment", "Assessments", "T-LEARNING"],
  [16, "Projects", "Calendar", "T-CALENDAR"],
  [17, "Agile", "Product backlog", "T-AGILE"],
  [17, "Agile", "Epics", "T-AGILE"],
  [17, "Agile", "User stories", "T-AGILE"],
  [17, "Agile", "Sprints", "T-AGILE"],
  [17, "Agile", "Scrum boards", "T-AGILE"],
  [17, "Agile", "Story points", "T-AGILE"],
  [17, "Agile", "Sprint planning", "T-AGILE"],
  [17, "Agile", "Sprint reviews", "T-AGILE"],
  [17, "Agile", "Retrospectives", "T-AGILE"],
  [17, "Agile", "Velocity", "T-AGILE"],
  [17, "Agile", "Burndown", "T-AGILE"],
  [17, "Agile", "Release planning", "T-AGILE"],
  [18, "Storage", "Document recovery", "T-DOCAPPS"],
  [18, "Document applications", "Word processor", "T-DOCAPPS"],
  [18, "Document applications", "Presentation", "T-DOCAPPS"],
  [18, "Document applications", "Notes", "T-DOCAPPS"],
  [18, "Document features", "Collaboration", "T-DOCAPPS"],
  [18, "Document features", "Track changes", "T-DOCAPPS"],
  [19, "Business email", "Filters", "T-MAILCLIENT"],
  [19, "Business email", "Folders", "T-MAILCLIENT"],
  [19, "Business email", "Labels", "T-MAILCLIENT"],
  [19, "Business email", "Search", "T-MAILCLIENT"],
  [19, "Business email", "Attachments", "T-MAILCLIENT"],
  [19, "Business email", "Signatures", "T-MAILCLIENT"],
  [19, "Business email", "Vacation responder", "T-MAILCLIENT"],
  [19, "Business email", "Email rules", "T-MAILCLIENT"],
  [19, "Business email", "Email forwarding", "T-MAILCLIENT"],
  [19, "Business email", "Admin controls", "T-MAILCLIENT"],
  [20, "Calendar", "Events", "T-CALENDAR"],
  [20, "Calendar", "Recurring events", "T-CALENDAR"],
  [20, "Calendar", "Invitations", "T-CALENDAR"],
  [20, "Calendar", "Shared calendars", "T-CALENDAR"],
  [20, "Calendar", "Team calendars", "T-CALENDAR"],
  [20, "Calendar", "Resource booking", "T-CALENDAR"],
  [20, "Calendar", "Availability", "T-CALENDAR"],
  [20, "Calendar", "Time zones", "T-CALENDAR"],
  [20, "Calendar", "Scheduling", "T-CALENDAR"],
  [22, "Meetings", "Polls", "T-MEETINGS"],
  [22, "Meetings", "Q&A", "T-MEETINGS"],
  [22, "Meetings", "Participant management", "T-MEETINGS"],
  [22, "Meetings", "Co-hosts", "T-MEETINGS"],
  [22, "Meetings", "Moderators", "T-MEETINGS"],
  [22, "Meetings", "Scheduling", "T-MEETINGS"],
  [22, "Meetings", "Analytics", "T-MEETINGS"],
  [24, "Builder", "Drag-and-drop UI", "T-DEVPLATFORM"],
  [24, "Builder", "Databases", "T-DEVPLATFORM"],
  [24, "Builder", "Relationships", "T-DEVPLATFORM"],
  [24, "Builder", "APIs", "T-DEVPLATFORM"],
  [24, "Builder", "Webhooks", "T-DEVPLATFORM"],
  [24, "Builder", "Custom functions", "T-DEVPLATFORM"],
  [24, "Builder", "Scripting", "T-DEVPLATFORM"],
  [24, "Builder", "App versioning", "T-DEVPLATFORM"],
  [25, "Trigger types", "Webhook", "T-DEVPLATFORM"],
  [25, "Trigger types", "API", "T-DEVPLATFORM"],
  [25, "Actions", "Call webhook", "T-DEVPLATFORM"],
  [25, "Actions", "Execute function", "T-DEVPLATFORM"],
  [26, "Integration", "Triggers", "T-INTEGRATION"],
  [26, "Integration", "Actions", "T-INTEGRATION"],
  [26, "Integration", "Webhooks", "T-INTEGRATION"],
  [26, "Integration", "APIs", "T-INTEGRATION"],
  [26, "Integration", "Custom connectors", "T-INTEGRATION"],
  [27, "Data prep", "Enrichment", "T-DATAPIPE"],
  [27, "Data prep", "Data pipelines", "T-DATAPIPE"],
  [28, "Data sources", "APIs", "T-DEVPLATFORM"],
  [28, "Visualization", "Maps", "T-SMALL"],
  [28, "Report features", "Embedded analytics", "T-SMALL"],
];

module.exports = { THEMES, ITEMS };
