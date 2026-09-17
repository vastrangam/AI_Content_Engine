'use strict';
/* THE BACKLOG — the lines of the master specification this product does not name at all.
 *
 *   node brand/site/checkbacklog.js --summary
 *
 * IT IS NOW EMPTY, AND THAT IS THE POINT OF IT.
 * This register held 109 lines: the specification items that mapped to no app whatsoever, as
 * distinct from the 551 that map to an app which is merely unbuilt. Every one of the 109 now
 * resolves to a named app in modules.js, so `ITEMS` is `[]` and the gate proves it rather
 * than asserting it.
 *
 * WHAT CHANGED, AND WHAT DELIBERATELY DID NOT
 * Nothing was built. The 109 became roughly fifty apps across nine new modules and a handful
 * of existing ones, every one entering at the lowest rung — so the app count rose sharply,
 * the tested ratio got WORSE, and the score fell. That is the honest direction of travel: the
 * denominator grew because the design stopped being silent, not because anything regressed.
 * The earlier version of this header argued the opposite — that adding them would make the
 * numbers look bad and they should stay here instead. That reasoning protected a number at
 * the cost of the design being quiet about a fifth of its own specification, and the owner
 * overruled it.
 *
 * ONE APP PER LINE WAS NOT THE ANSWER EITHER. 14 of the 109 are literal duplicates of one
 * another from different sections, and several are not applications at all — a dark theme and
 * a time-zone setting are not two products. Lines were grouped into apps that are genuinely
 * apps, which is why ~50 and not 109.
 *
 * THE THEMES ARE KEPT. They explain what each capability would mean and cost, and that
 * writing is now the intro prose of the modules those capabilities became. They are the
 * reasoning behind the shape of modules 23-31 and are worth keeping readable on their own.
 *
 * NOTHING HERE IS A COMMITMENT AND NOTHING HERE HAS A STATUS. checkbacklog.js still refuses a
 * row carrying one, because a status would make this read as a plan.
 *
 * THE GATE PROVES THE LIST, IT DOES NOT TRUST IT
 * It rebuilds the set of absent uncovered items from masterspec.js and requires exact
 * equality with what is here. Empty on both sides is the strongest form of that check: a line
 * that loses its app mapping reappears here automatically and fails the build.
 */

/* A theme is a capability somebody could decide to build. `module` is where it landed — a real
   module number in modules.js, checked. `capability` names a row in
   the requirements registry when one already covers the ground, so the two registers point at
   each other rather than describing the same hole twice. */
const THEMES = [
  {
    id: 'T-DEVPLATFORM', title: 'Developer platform — API, webhooks, functions, a builder',
    module: '23', capability: 'CAP-DEVPLATFORM',
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
    module: '24', capability: null,
    means: 'A board with stories, points and a sprint boundary, over the tasks that module 20 ' +
      'already has. Thirteen lines, one screen and one report.',
    cost: 'Self-contained and genuinely optional. Nothing else in the design depends on it, ' +
      'and a business running a garment factory may never want it.',
  },
  {
    id: 'T-MEETINGS', title: 'Meetings — scheduling, participants, polls, the record of a call',
    module: '25', capability: null,
    means: 'The half of meetings that is NOT live video: who is invited, when, who came, what ' +
      'was decided, and a poll. The video itself is in the constraints document because it ' +
      'needs media infrastructure; this half needs none.',
    cost: 'Small, and worth separating from video precisely because the useful part does not ' +
      'need the expensive part.',
  },
  {
    id: 'T-CALENDAR', title: 'Calendar — events, invitations, availability, shared calendars',
    module: '26', capability: null,
    means: 'Eleven lines that are one thing. Recurring events and time zones are where the ' +
      'difficulty actually is, and both are solved problems with a library rather than ' +
      'judgement.',
    cost: 'Moderate. Syncing to an outside calendar is in the constraints document; a calendar ' +
      'of its own is not.',
  },
  {
    id: 'T-MAILCLIENT', title: 'Mail handling — folders, filters, rules, signatures, a shared inbox',
    module: '27', capability: null,
    means: 'The reading and organising half of email. HOSTING mail is in the constraints ' +
      'document — deliverability and spam reputation are infrastructure — but once a mailbox ' +
      'exists somewhere, filtering and routing it is ordinary work.',
    cost: 'Only worth starting after a mail domain exists, which is a constraint, not a task.',
  },
  {
    id: 'T-DOCAPPS', title: 'Document applications — writing, presenting, notes, track changes',
    module: '28', capability: null,
    means: 'A word processor, a presentation tool and notes. Eight lines that are three ' +
      'substantial products, and the specification lists them as though they were features.',
    cost: 'The worst effort-to-value ratio in the backlog. Every business already has these, ' +
      'and nobody adopts a business system for its word processor.',
  },
  {
    id: 'T-LEARNING', title: 'Learning — courses, lessons, assessments, progress',
    module: '29', capability: null,
    means: 'Course material, the lessons inside it, an assessment at the end, and a record of ' +
      'who has completed what. Eight lines that are one straightforward application over data ' +
      'module 16 already holds about who works here.',
    cost: 'Small and genuinely useful in a factory, where a machine or a process has to be ' +
      'taught and the record of who was taught it matters for compliance.',
  },
  {
    id: 'T-INTEGRATION', title: 'Integration platform — triggers, actions, custom connectors',
    module: '30', capability: 'CAP-INTEGRATIONS',
    means: 'The connector framework, separate from any connector. The framework can be built ' +
      'and tested against recorded responses; the connectors need credentials and are in the ' +
      'constraints document.',
    cost: 'Only sensible after the API exists, because a connector framework with nothing to ' +
      'connect to is a demonstration.',
  },
  {
    id: 'T-IDENTITY', title: 'Identity and IT — MFA, password management, service management',
    module: '31', capability: 'CAP-THREATMODEL',
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
   typo here is a failure rather than a silent mismatch.

   EMPTY, because every line the specification asks for now resolves to a named app. The 109
   entries that stood here are not deleted history — each one became, or joined, an app in
   modules.js, and checkmasterspec.js can name which app any given line landed on. If one ever
   loses its mapping it reappears here on the next run and the build fails, which is the only
   reason this array still exists rather than the register being removed. */
const ITEMS = [
];

module.exports = { THEMES, ITEMS };
