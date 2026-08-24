'use strict';
/* THE TENANT GUIDE — onboarding one business onto the platform, and proving the platform works.
 *
 * WHY THIS IS A DIFFERENT DOCUMENT FROM guide.js
 * guide.js is the BUILD guide: install Node, clone the repo, harden a VPS, run CI. That is what
 * the people building the platform do. A tenant does none of it. A tenant signs up, picks its
 * trade, names its companies, connects its channels, loads its data and starts working — and the
 * first version of this document told a tenant to install a toolchain, which was 42 pages of
 * confidently wrong instructions.
 *
 * THIS FILE IS DELIBERATELY NOT NEUTRAL, AND THAT IS THE POINT
 * checkneutral.js scans modules.js and guide.js because those are read by BOTH editions. This one
 * describes ONE tenant — a textile manufacturer and trader. Its trade words are the content, not a
 * leak, which is why it is not on that gate's list. Do not "fix" a garment word here.
 *
 * THE SECOND HALF IS AN ACCEPTANCE TEST
 * This tenant exists to answer one question: does the platform actually work? So the eight cascades
 * and five end-to-end flows are not description — they are checks, each with an action and a result
 * that must come back. mkTenant reads both OUT of PLAN_OF_ACTION.md rather than copying them, so a
 * cascade cannot quietly leave the acceptance test by being edited out of the plan.
 *
 * A run that finds nothing has not been run properly. Part 9 is where findings go.
 *
 * TOKENS: __TENANT__ __STORE__ __PLATFORM__ __PACK__ and the derived counts, substituted by
 * mktenant.js. Straight apostrophes read wrong in the PDF; use the typographic ’ in prose.
 */

/* ── Part 0 · what a tenant is ────────────────────────────────────────────── */

const P0 = {
  n: 0,
  title: 'What you are on this platform',
  lead: `__PLATFORM__ is the software. **__TENANT__ is a tenant on it** — one business among many,
the same way a business is a tenant on Zoho or Odoo. You sign up, you take a plan, and you run your
companies inside it.

That distinction decides everything in this document. **You do not install anything.** No repository,
no server, no toolchain, no deployment. Those belong to the people building __PLATFORM__ and they
have their own guide. Everything here happens in a browser.`,
  steps: [
    {
      id: '0.1', label: 'MANUAL',
      do: 'Understand what is a row and what is code',
      why: `This is not trivia — it is why onboarding is a morning rather than a project. The
__NMOD__ modules, the __NTABLES__ tables and the __NRULES__ rules are **code**: identical for every
tenant, and nothing you do changes them. Your trade, your companies, your channels, your locations,
your stages and your roles are **rows**. Configuration, not a version of the software built for you.`,
      table: {
        head: ['Thing', 'Row or code', 'What that means for you'],
        rows: [
          ['Your account', 'row', 'Signing up creates it. No deployment.'],
          ['A company inside it', 'row', 'Up to **20** on the shipped plan. The software itself has no ceiling.'],
          ['A channel', 'row', 'A new marketplace is a row you add, not a release you wait for.'],
          ['Your trade’s words', 'row', 'An industry pack. The screens change wording, not structure.'],
          ['Location, stage, role', 'row', 'A godown, a production stage and a job title are all settings.'],
          ['The __NMOD__ modules', 'code', 'The same for every tenant. This is the product.'],
          ['The __NRULES__ rules', 'code', 'Which ones apply is configurable. What they refuse is not.'],
        ],
      },
      done: 'You can say which of the above you will be creating (rows) and which you will never touch (code).',
    },
    {
      id: '0.2', label: 'MANUAL',
      do: 'Know the two addresses and what each one is',
      why: `They are easy to confuse and confusing them wastes a day. **\`__STORE__\` is your shop** —
where customers browse apparel and buy. It runs on Shopify and it is not __PLATFORM__.
**__PLATFORM__ is where you run the business** — the orders from that shop arrive in it as one
channel among several.`,
      table: {
        head: ['Address', 'What it is', 'Who uses it'],
        rows: [
          ['`__STORE__`', 'Your Shopify storefront', 'Your customers'],
          ['the __PLATFORM__ app', 'The business operating system', 'You and your staff'],
        ],
      },
      done: 'You are clear that your storefront is a channel feeding the platform, not the platform itself.',
    },
    {
      id: '0.3', label: 'MANUAL',
      do: 'Know what this run is for',
      why: `You have given this tenant complete data, real rules and real logic. That is not so the
tenant can start trading tomorrow — it is so the platform gets **tested against a real business
instead of a demo**. Every check in Parts 7 and 8 either passes, or finds something. Findings are the
output.`,
      done: 'You expect this run to produce a list of gaps, and you have somewhere to write them down.',
      note: `Part 9 already carries three gaps found while writing this document, by reading the code
rather than by running anything. That is what the exercise is for.`,
    },
  ],
};

/* ── Part 1 · before day one ──────────────────────────────────────────────── */

const P1 = {
  n: 1,
  title: 'What to have ready before you start',
  lead: `Gathering these first turns onboarding into one sitting. Hunting for them mid-way turns it
into a week.`,
  steps: [
    {
      id: '1.1', label: 'MANUAL',
      do: 'Collect the registration details for every company',
      why: 'Each company issues its own invoices under its own registration, so each needs its own details.',
      needs: [
        'Legal name of each company — the registered one, not the trading name',
        'GSTIN and PAN for each company that has them',
        'The state each is registered in',
        'The invoice prefix each already uses, if the business has been trading',
        'The financial year start month (April, for an Indian business)',
      ],
      done: 'You have all of the above for every company you intend to create.',
      warn: `A company that does job work and has no registration of its own still belongs in the
group figures — it just must not be pulled into a return it does not belong in. Note which companies
are in that position now, rather than discovering it at filing time.`,
    },
    {
      id: '1.2', label: 'MANUAL',
      do: 'Export what you already have, as spreadsheets',
      why: `Everything gets imported with a validation report **before** anything commits, so messy
data is fine. Missing data is not — you cannot validate what you did not bring.`,
      needs: [
        'Customers — name, contact, address, GSTIN if B2B, and any outstanding balance',
        'Suppliers and vendors — the same',
        'Items and SKUs — code, description, HSN, MRP, GST rate, unit',
        'Opening stock — SKU, location, quantity, and the value you carry it at',
        'Opening balances, if you are not starting fresh',
      ],
      done: 'Five spreadsheets exist, exported from wherever the data lives today.',
    },
    {
      id: '1.3', label: 'MANUAL',
      do: 'Have Shopify admin access to the storefront',
      why: 'Connecting the shop as a channel needs admin on it. Getting that access can take a day if it sits with someone else.',
      done: 'You can sign in to the Shopify admin for `__STORE__` yourself.',
    },
  ],
};

/* ── Part 2 · sign up and load the pack ───────────────────────────────────── */

const P2 = {
  n: 2,
  title: 'Sign up and load your trade',
  lead: `The industry pack is what stops every screen being blank. It carries the vocabulary, the
stages your work moves through, the extra fields your records need, the documents you issue and a
starting chart of accounts — all as one configuration file, never a separate version of the software.`,
  steps: [
    {
      id: '2.1', label: 'SPEC',
      do: 'Create the account and choose a plan',
      why: 'The plan sets the company cap. The shipped default is 20; the software has no ceiling of its own.',
      manual: 'The __PLATFORM__ sign-up page.',
      done: 'The account exists and you know its company cap.',
      note: `Marked SPEC because self-serve sign-up is designed and not yet built — it is Phase 7. The
account is created for you until then.`,
    },
    {
      id: '2.2', label: 'SPEC',
      do: 'Load the `__PACK__` pack',
      why: `Of the __NPACKS__ packs shipped, \`__PACK__\` is the closest fit for a business that makes
what it sells. Loading it renames concepts across every screen at once — the same order record reads
in your trade’s words with identical columns underneath.`,
      done: 'Screens use trade vocabulary rather than generic labels, and the stage lists are populated.',
      warn: `**Read Part 9 finding 2 before you do this.** The shipped \`__PACK__\` pack speaks
*discrete manufacturing* — it calls an item a part and a person an operator. A clothing manufacturer
says piece and karigar. There is currently **no way for a tenant to override a pack’s word**, so this
step gives you close-but-wrong vocabulary. That is a real gap and it is written down rather than
worked around.`,
    },
  ],
};

/* ── Part 3 · the companies ───────────────────────────────────────────────── */

const P3 = {
  n: 3,
  title: 'Create your companies',
  lead: `A company is a row. Creating three is doing this three times, and a fourth the day you open
one. **Company, brand and invoice prefix are three separate fields** — collapsing them is the single
most likely mistake at this step, and this business is a live example of why they are separate.`,
  steps: [
    {
      id: '3.1', label: 'WORKS TODAY',
      do: 'Create each company with its own name, brand and prefix',
      why: `One of these companies trades under a name that is not its own, and its SKUs carry a
third code. If brand and legal name were one field, its invoices would carry the wrong name — which
is a compliance problem, not a cosmetic one.`,
      companies: true,   // filled from core/tests/core.test.js by the generator
      done: 'Every company exists with its legal name, trading name, brand code and invoice prefix set separately.',
    },
    {
      id: '3.2', label: 'WORKS TODAY',
      do: 'Check the group view adds up',
      why: `The group figure is the sum of the companies **minus trade between them**. Selling stock
from one of your own companies to another is not group revenue, and a system that counts it is
overstating the business to its owner.`,
      expect: 'Each company’s books balance on their own, and no ledger line in one points at another’s account.',
      done: 'The group total equals the sum of the companies minus inter-company sales, and you have checked one such sale.',
      note: `This is already proven in code rather than promised: the core test posts across a grid of
ten companies and ten channels, then runs eleven by eleven with nothing changed. Your three companies
are a small case of something tested much wider.`,
    },
  ],
};

/* ── Part 4 · the channels ────────────────────────────────────────────────── */

const P4 = {
  n: 4,
  title: 'Register your channels',
  lead: `A channel is where a sale came from. It is a row per company — two companies may each sell
on the same marketplace and they are two different rows whose figures never merge. **Stock stays one
number per SKU**, never split per channel, which is what stops the same piece being sold twice.`,
  steps: [
    {
      id: '4.1', label: 'WORKS TODAY',
      do: 'Add a channel row for every way each company sells',
      channelKinds: true,   // filled from the schema by the generator
      done: 'Every route to market you actually use exists as a row against the company that owns it.',
    },
    {
      id: '4.2', label: 'SPEC',
      do: 'Connect `__STORE__` as the Shopify D2C channel',
      why: `Orders placed on your shop become sales orders in __PLATFORM__ — stock reserved, invoice
raised, ledger posted — without anyone re-keying them. That automatic chain is checked in Part 7.`,
      manual: 'The channel row for `__STORE__`, kind `d2c`, then its Shopify connection settings.',
      done: 'An order placed on the storefront appears as a sales order without anyone typing it in.',
      warn: `Marked SPEC, and honestly so. The D2C Sales app names Shopify as a supported storefront,
but **the connector is not built** — no code in this platform talks to Shopify today. Writing this
step as though it works would be exactly the kind of claim these documents exist to prevent. Until it
is built, storefront orders come in through import like any other spreadsheet.`,
    },
  ],
};

/* ── Part 5 · the data ────────────────────────────────────────────────────── */

const P5 = {
  n: 5,
  title: 'Load the real data',
  lead: `Every import produces a validation report **before** anything commits. Errors come back as
rows to fix. Nothing is silently skipped — a silently skipped row is a wrong stock figure that nobody
can explain three months later.`,
  steps: [
    {
      id: '5.1', label: 'SPEC',
      do: 'Import in dependency order, checking each report before committing',
      why: 'Later imports reference earlier ones. Items need their categories; opening stock needs its items and locations.',
      table: {
        head: ['#', 'Import', 'Needs first'],
        rows: [
          ['1', 'Customers', '—'],
          ['2', 'Suppliers and vendors', '—'],
          ['3', 'Items and SKUs', 'the pack’s categories'],
          ['4', 'Locations', '—'],
          ['5', 'Opening stock', 'items, locations'],
          ['6', 'Opening balances', 'customers, suppliers'],
        ],
      },
      expect: 'A validation report for each, listing every problem row before anything is written.',
      done: 'All six imported, every validation report read, and every error row fixed rather than skipped.',
    },
    {
      id: '5.2', label: 'WORKS TODAY',
      do: 'Reconcile the imported figures against your own workbooks',
      why: `The number that matters is whether the platform agrees with what you already know. If
stock value or a karigar payout differs, one of the two is wrong and you need to know which **now**,
not after a month of trading on it.`,
      expect: 'Totals match your own sheets, or every difference has a named cause.',
      done: 'Stock quantity, stock value and outstanding balances agree with your books, or each gap is explained.',
      note: `A browser tool already exists that reads your own sale, return and karigar workbooks with
no upload and no account, and emits one pair of columns per company found in the sheets. It is the
fastest way to get a second opinion on these totals.`,
    },
  ],
};

/* ── Part 6 · people ──────────────────────────────────────────────────────── */

const P6 = {
  n: 6,
  title: 'Invite people and set roles',
  lead: 'Permissions are per company per role from the first minute, not bolted on once something goes wrong.',
  steps: [
    {
      id: '6.1', label: 'SPEC',
      do: 'Invite each person and give them a role in each company they work for',
      why: `Somebody who works for one company should not see another’s figures. That is enforced in
the database rather than only in the screens — but read Part 9 finding 1 before relying on it.`,
      done: 'Everyone can sign in and each sees only the companies they belong to.',
    },
    {
      id: '6.2', label: 'DEMO',
      do: 'Set up the WhatsApp route for the shop floor',
      why: `The people making the product do not open a laptop. A short message becomes a real record:
attendance with the time and place, a production report against the design, a request in the approvals
queue.`,
      done: 'One worker has sent one message and it became a record you can see.',
      warn: `Nothing in this route ever asks anyone for a password, a bank detail or a document
number, and it never will. If something claiming to be this system asks, it is not.`,
    },
  ],
};

/* ── Part 9 · what the run found ──────────────────────────────────────────── */

const P9 = {
  n: 9,
  title: 'What this run proved, and what it found',
  lead: `This is the output. A tenant run that produces a clean sheet has not been run properly — it
has been described. The three findings below were produced by reading the platform’s own code while
writing this guide, before a single check in Parts 7 and 8 was executed.`,
  findings: true,     // rendered by the generator, with the evidence paths
  steps: [
    {
      id: '9.1', label: 'MANUAL',
      do: 'Record every gap as it is found, with the evidence',
      why: `A gap described from memory turns into an argument later. A gap with a file and a line
number in it turns into a fix.`,
      table: {
        head: ['Write down', 'Why'],
        rows: [
          ['What you did', 'so it can be reproduced'],
          ['What you expected', 'from this guide, or from your own books'],
          ['What actually happened', 'the figure, the error, or the silence'],
          ['Where you looked', 'the screen, or the file and line'],
        ],
      },
      done: 'Every gap has those four things. None is only in somebody’s head.',
    },
    {
      id: '9.2', label: 'MANUAL',
      do: 'Separate "not built yet" from "built wrong"',
      why: `They need opposite responses. Not built is a schedule question and the plan already
answers it. Built wrong is a defect, and it means something that passed its own tests still gets a
real business’s figures wrong — which is worth stopping for.`,
      done: 'Each finding is marked as one or the other, and the built-wrong ones are raised immediately.',
    },
  ],
};

module.exports = { parts: [P0, P1, P2, P3, P4, P5, P6, P9] };

/* The same discipline guide.js is held to: a step with no `done` is a suggestion. */
module.exports.check = function check() {
  const bad = [];
  for (const p of module.exports.parts) {
    if (typeof p.n !== 'number' || !p.title || !p.lead) bad.push(`part ${p.n}: missing n, title or lead`);
    for (const s of p.steps) {
      if (!s.done) bad.push(`step ${s.id}: no "done when" — that makes it a suggestion`);
      if (!s.do) bad.push(`step ${s.id}: no action`);
      if (!s.label) bad.push(`step ${s.id}: no label — a reader cannot tell if this works today`);
      /* A tenant has no terminal. A step that hands one a shell command is a step written for
         the wrong reader, and that is the exact error the first version of this document made. */
      if (s.cmd) bad.push(`step ${s.id}: carries a shell command — a tenant has no terminal`);
      if (/'/.test([s.do, s.why, s.note, s.warn].filter(Boolean).join(' '))) {
        bad.push(`step ${s.id}: straight apostrophe in prose — use the typographic ’`);
      }
    }
  }
  return bad;
};
