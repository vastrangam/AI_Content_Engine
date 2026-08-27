'use strict';
/* THE TENANT BUILD GUIDE — one business, from signing up to running live.
 *
 * WHY THIS FILE EXISTS SEPARATELY FROM tenant.js
 * tenant.js is the reference: what this business runs on, every rule, every calculation, what the
 * system refuses. It is organised by SUBJECT, because that is how you look something up. It is a
 * bad shape for the first week, when nobody has a subject yet — they have an empty account and a
 * business to move into it, and the only question that matters is what to do next.
 *
 * So this is the same business read in ORDER: sign up, companies, channels, people, products,
 * the making side, buying, selling, the first month, live. Every step says where you do it, what
 * changes it later, and what you should see when it worked.
 *
 * IT DOES NOT REPEAT THE RULES.
 * Where a step depends on a calculation — how a month’s pay is worked out, how a set is counted
 * complete, how a karigar unit’s outstanding balance is arrived at — this document says which
 * decision the step is making and leaves the arithmetic to the rules document. Two copies of a
 * formula is how two documents start disagreeing about somebody’s wages.
 *
 * THE READER HAS NO TERMINAL.
 * Same reader as tenant.js, same checker: no shell command, no person named, no rupee figure
 * attached to anybody. tenant.js exports checkParts() and this file uses it, so the two documents
 * cannot drift apart about what is allowed in front of this reader.
 *
 * THIS DESCRIBES A DESIGN. Nothing here claims to exist yet.
 *
 * Straight apostrophes read wrong in the PDF; use the typographic ’ in prose.
 */

const TENANT = require('./tenant.js');

/* ── Part 0 · the half-hour before anybody touches a screen ───────────────── */

const B0 = {
  n: 0,
  title: 'Before you open anything — the four decisions',
  lead: `Half an hour with the people who actually know, before a single screen is opened. Not
because the system needs it — every one of these can be changed later, from the app, with the past
left intact — but because deciding them in front of a form is how they get decided badly.

**Nothing here is permanent.** That is the point of writing them down now: you will change some of
them, and when you do you will want to know what you originally meant.`,
  terms: ['platform', 'tenant', 'module', 'role', 'permission'],
  steps: [
    {
      id: '0.1', label: 'WITH YOUR TEAM',
      do: 'Decide which businesses are separate companies and which are one',
      why: `A company is the unit that owns records, issues its own documents and closes its own
books. Two brands that share a bank account, a GST registration and a set of books are one company
with two brands. Two that file separately are two companies, even if the same people run both.
Getting this wrong is the one setup mistake that is genuinely awkward to unwind, because it is the
line every later report is drawn along.`,
      table: {
        head: ['Ask', 'If the answer is yes'],
        rows: [
          ['Does it file its own returns?', 'A separate company'],
          ['Does it issue invoices under its own name and number series?', 'A separate company'],
          ['Does it close its own books?', 'A separate company'],
          ['Is it just a different name on the same books?', 'A brand, not a company'],
        ],
      },
      change: 'A company can be added at any time and starts empty. Companies are never merged after ' +
        'the fact — the correct move is to stop using one from a date, which keeps its history readable.',
      done: 'Every business you run is on one of the two lists, and somebody can say why for each.',
    },
    {
      id: '0.2', label: 'WITH YOUR TEAM',
      do: 'List every way you sell, without worrying how many there are',
      why: `A marketplace, a shop platform, a website, a shop counter, a dealer, an export buyer —
each is a channel, and a channel is a row you add. There is no number to get right and no ceiling to
plan around. Six today and ten next season needs no change to anything, and neither does dropping
one in between.`,
      note: `The reason this is worth writing down at all is not the count — it is that two companies
may both sell on the same marketplace, and those are two different channels with two different
settlement accounts. A channel belongs to a company.`,
      change: 'Add, rename or stop a channel from a date, in the app. Orders already taken on it keep ' +
        'pointing at it, so last season still reports correctly.',
      done: 'Every route to a customer is on the list, each one attached to the company that sells through it.',
    },
    {
      id: '0.3', label: 'WITH YOUR TEAM',
      do: 'Agree what your words are, before the system offers you its own',
      why: `The system will happily call things whatever it calls them by default, and in six months
half your staff will be using its words and half yours, in the same conversation. Deciding early
costs nothing; deciding late means retraining people.`,
      example: {
        head: ['The system’s default', 'What you may call it'],
        rows: [
          ['Work order', 'Whatever your floor already says'],
          ['Component', 'The piece of a set — top, bottom, dupatta'],
          ['Contractor unit', 'The team, by the name it is known by'],
          ['Stage', 'The step in your own making sequence'],
        ],
      },
      change: 'Any label, any time, from the settings screen. It changes on every screen at once, ' +
        'for your business only, and nothing already recorded moves.',
      done: 'The words your staff already use are written down, and nobody has to translate.',
    },
    {
      id: '0.4', label: 'WITH YOUR TEAM',
      do: 'Name who is allowed to do what — especially who may close a month',
      why: `Most permissions are obvious and can be adjusted casually. One is not: closing an
accounting period is the action that stops anybody editing what is inside it. That is exactly what
makes it valuable and exactly what makes it worth restricting to people who understand what they are
freezing.`,
      warn: `Nobody, at any permission level, can switch off the record of who changed what. That is
one of the things this platform does not make optional, because a business that can edit away the
evidence of an edit has no evidence at all.`,
      done: 'Every role has a person, every person has a role, and closing a period is restricted to the people who should be doing it.',
    },
  ],
};

/* ── Part 1 · signing up and the companies ───────────────────────────────── */

const B1 = {
  n: 1,
  title: 'Day one — signing up, and your companies',
  lead: `You sign up the way you would for any other business software: an email, a plan, a
password of your own choosing. Nothing is installed and nothing is downloaded.

**You will never be asked for a marketplace, bank or account password. Not here, not later, not by
support.** Every outside connection this system makes uses a key you create on the other service and
can withdraw from the other service. If anything ever asks you for a marketplace password, it is not
this platform.`,
  companies: true,
  companiesLead: `The companies below are the ones this business runs today. They are rows, added in
the app, and the list is neither fixed nor a limit.`,
  steps: [
    {
      id: '1.1', label: 'IN THE APP',
      do: 'Create the account and choose the plan',
      why: `The plan decides how many companies and how many people you can have on the system, and
nothing else — every module and every rule is the same on every plan. There is no version of this
where a feature is withheld until you upgrade.`,
      expect: 'an empty account, with one administrator — you — and nothing else in it.',
      change: 'Move up or down a plan at any time. Moving down when you are over the limit tells you ' +
        'what is over, rather than choosing something to remove for you.',
      done: 'You can sign in, and you are the administrator.',
    },
    {
      id: '1.2', label: 'IN THE APP',
      do: 'Add your first company, with the details that appear on a document',
      why: `A company carries the legal name, the trading name, the registered address, the tax
registration and the document number series. These are what get printed on an invoice, so they are
worth entering carefully once rather than correcting on a customer’s copy later.`,
      needs: [
        'The legal name, exactly as registered',
        'The trading name, if it differs — this is what customers know you as',
        'The registered address and the place of supply',
        'The tax registration number for that state',
        'How your invoice numbers should look, and what they should start at',
      ],
      expect: 'the company on your list, with a short code beside it. That code is what prefixes ' +
        'its documents and its product numbers, so a person holding a printed invoice can tell ' +
        'which company issued it without reading the letterhead.',
      change: 'Every field is editable from a date. A changed address applies to documents issued ' +
        'from that date on; the ones already issued keep the address they were issued with, which ' +
        'is what makes them still valid.',
      done: 'One company exists, its details are what you would want printed on a customer’s invoice, and its number series starts where you want it to.',
    },
    {
      id: '1.3', label: 'IN THE APP',
      do: 'Add the rest of your companies, and say which ones trade with each other',
      why: `Where one of your companies sells to another, that sale is real for each of them and is
not a sale for the group. The system needs to know the pair to remove it from the group figure. Say
so now and every group report is right from the first month; say so later and you will be correcting
a number somebody has already seen.`,
      expect: 'a group total that is the sum of the companies minus what they sold each other — ' +
        'and both companies still showing their own full figures, because each of them really did ' +
        'make that sale.',
      change: 'Mark a pair as trading with each other, or stop marking them, from a date.',
      done: 'Every company exists, and any pair that invoices each other is marked as such.',
    },
  ],
};

/* ── Part 2 · channels ───────────────────────────────────────────────────── */

const B2 = {
  n: 2,
  title: 'Your channels — every way an order can reach you',
  lead: `A channel is one route from a customer to you. Add one for each, attached to the company
that sells through it. There is no correct number of these and no ceiling — the group figure is the
sum across whatever exists.`,
  channelKinds: true,
  channelKindsLead: `The kinds a channel can be are the ones the system itself recognises, read from
its own settings:`,
  steps: [
    {
      id: '2.1', label: 'IN THE APP',
      do: 'Add each channel, under the company that sells through it',
      why: `Two of your companies may both sell on the same marketplace under different seller
accounts. Those are two channels, not one, and keeping them separate is what makes each company’s
settlement reconcile to its own bank account.`,
      expect: 'each channel listed under its company, with its own settlement account and its own ' +
        'commission and fee settings.',
      change: 'Add one the day you open a new storefront. Nothing needs configuring anywhere else — ' +
        'the reports pick it up because they count rows.',
      done: 'Every route to a customer exists as a channel, and every channel belongs to exactly one company.',
    },
    {
      id: '2.2', label: 'OUTSIDE', terms: ['API', 'provider'],
      do: 'Create a key on each marketplace or shop platform, and paste it in',
      why: `The connection is made with a key you generate on the other service. You stay in control
of it: you can see what it is allowed to do, and you can withdraw it from that service without
anybody here being involved.`,
      manual: 'On the marketplace or shop platform’s own seller dashboard, in its developer or API section.',
      warn: `If any screen, message or person asks you for the marketplace **password** rather than a
key, stop. This platform never asks for one, and no legitimate integration needs one.`,
      expect: 'the channel showing as connected, and the first orders appearing without anybody ' +
        'typing them.',
      change: 'Withdraw the key on the other service and the connection stops. Orders already ' +
        'pulled in stay where they are — they are your records now.',
      done: 'Each connected channel is bringing its own orders in, and every key was created by you and can be withdrawn by you.',
    },
    {
      id: '2.3', label: 'IN THE APP',
      do: 'Set what each channel costs you, so a sale is worth what it is really worth',
      why: `A marketplace order and a shop-counter order at the same price are not the same money.
Commission, payment fees, shipping and returns come out of one and not the other. Recording them per
channel is what makes it possible to answer which channel is actually worth having.`,
      expect: 'each channel showing gross, its own deductions, and what is left — rather than one ' +
        'revenue figure that flatters whichever channel takes the biggest cut.',
      change: 'Rates change from a date. The month a marketplace changes its commission is split at ' +
        'that date, not applied backwards.',
      done: 'Every channel carries its own costs, and the net figure per channel is one you would act on.',
    },
  ],
};

/* ── Part 3 · people ─────────────────────────────────────────────────────── */

const B3 = {
  n: 3,
  title: 'Your people — and the five states somebody can be in',
  lead: `This is the part most systems get wrong, because most systems have two states — here or
gone — and a real workforce has five. Somebody on a month’s leave has not left. Somebody who worked
three days on trial never joined. Somebody who stopped last year may come back next month, on the
same record, without being re-onboarded.

**Get the states right and the rest of the people side follows.** Get them wrong and you will be
deleting and re-creating the same person, which loses their history exactly when you need it.`,
  payBasis: true,
  payBasisLead: `How somebody is paid is a setting on the person, effective-dated like everything
else. The bases the system carries — the values, never a person — are:`,
  steps: [
    {
      id: '3.1', label: 'WITH YOUR TEAM',
      do: 'Sort everybody into the five states before entering anybody',
      why: `Each state behaves differently, and choosing between them at the moment of entering
somebody is how a person on leave gets recorded as having left. The distinction that matters most is
the last one: a trial has no joining date and no leaving date, because neither ever happened.`,
      table: {
        head: ['State', 'What it means', 'What the system does'],
        rows: [
          ['**Working**', 'Employed, and working now', 'Attendance expected; pay computed'],
          ['**On leave**', 'Employed, not working this month', 'Still employed; the month is recorded as leave, not as absence'],
          ['**Inactive**', 'Stopped, and may come back', 'Sign-in stops; the record and the history stay, ready to reopen'],
          ['**Left**', 'Stopped, and that is that', 'Sign-in stops; the record stays; no new work assigned'],
          ['**Trial**', 'Came for a few days, was paid, and went', '**No employment record at all** — attendance and a payment, nothing derived'],
        ],
      },
      note: `Trial is the one worth reading twice. Somebody on trial is paid for the days they came
and nothing about them is calculated from a salary, because there is no salary — the payment **is**
the record. The cost still lands in the right company and the right month, and if you take them on
afterwards, the trial days are already there.`,
      change: 'A person moves between states from a date, and moving between them never rewrites ' +
        'what came before. Somebody inactive who returns starts a new spell — the gap stays visible, ' +
        'because it happened.',
      done: 'Everybody who has worked for you this year is in exactly one of the five states, and nobody is in the wrong one for convenience.',
    },
    {
      id: '3.2', label: 'IN THE APP',
      do: 'Enter each person, with the date they started rather than today’s date',
      why: `Entering somebody with today’s date because that is the day you did the data entry means
their first months do not exist. Their real start date is what makes their attendance, their pay and
their length of service correct, and it is not extra work to type it.`,
      needs: [
        'Their name and how you contact them',
        'The company they work for',
        'The date they actually started — the real one',
        'What they do, and what they are paid on: a monthly amount, an hourly rate, or per piece',
        'Their working hours, if they differ from your standard ones',
      ],
      warn: `Where you only know the month somebody started and not the day, record the month and
mark it as approximate. That is honest and stays correctable. Inventing the 1st is a number that
looks exact and is not, and nobody afterwards can tell which of the two you did.`,
      change: 'Every one of these is effective-dated. A raise in April is a new row from April; ' +
        'March still pays March’s rate, permanently.',
      done: 'Everybody is entered with their real start date, their real pay basis, and their own hours where those differ.',
    },
    {
      id: '3.3', label: 'IN THE APP',
      do: 'Set working hours per person, not per category of person',
      why: `Your packing staff may work a different clock from your tailoring floor, and a shift that
is stored as a property of a category cannot express that without inventing a new category. So the
clock belongs to the person: their own start, their own finish, their own monthly threshold, changed
from a date.`,
      note: `A monthly hours threshold is a number you state, never one the system works out by
multiplying a day by a count of days. Those two disagree — deliberately, because a month is not a
tidy multiple of anything — and the stated one is the one that is right.`,
      change: 'Change one person’s hours from a date and nobody else moves. Change a whole group by ' +
        'changing each person in it, which is slower and is also the only version that is true.',
      done: 'Every person carries their own hours and their own monthly threshold, and no two people share a setting merely because they are the same kind of person.',
    },
    {
      id: '3.4', label: 'ON A PHONE',
      do: 'Connect attendance to the phone your staff already have',
      why: `Attendance that requires a person to walk to a machine, or a supervisor to fill a
register, is attendance that gets reconstructed at month end from memory. A message from the phone
they already carry, in the language they already speak, is the version that actually gets recorded on
the day it happened.`,
      manual: 'On each person’s own phone. No app to install, and no smartphone required.',
      expect: 'the day’s attendance visible on the screen the same morning, with anything unusual ' +
        'flagged rather than silently accepted.',
      change: 'Switch the messaging provider without staff noticing — the phone number and the ' +
        'conversation stay the same.',
      done: 'Attendance for a normal day is recorded without anybody typing it into a screen, and the exceptions are the only thing a supervisor has to look at.',
    },
    {
      id: '3.5', label: 'WITH YOUR TEAM',
      do: 'Write down your leave, holiday and festival rules as they actually are',
      why: `Every business has these and almost none of them are written down, which means they are
whatever the person doing payroll remembers. They are settings here — how many Sundays are off, which
festivals are paid, who they apply to — and writing them down is what makes payroll reproducible
rather than remembered.`,
      note: `Where a rule genuinely does apply differently to different groups of staff, say so
explicitly as a rule about the group rather than leaving it to whoever runs payroll to remember. The
rules document sets out how each of these is applied.`,
      change: 'Any of them, from a date. Changing the festival list in October does not re-run ' +
        'September.',
      done: 'Your leave, weekly-off, holiday and festival rules exist as settings, and payroll would come out the same run by somebody who has never done it before.',
    },
  ],
};

/* ── Part 4 · products and sets ──────────────────────────────────────────── */

const B4 = {
  n: 4,
  title: 'Your products, and what a set actually contains',
  lead: `A garment is straightforward. A **set** is where the real work is, because a set is not one
thing — it is two or three pieces that have to exist together before anything can be sold, and the
pieces are made separately, by different people, at different times.`,
  setTypes: true,
  setTypesLead: `The set types this business works with, and what each one is made of, read from the
business’s own recorded composition:`,
  steps: [
    {
      id: '4.1', label: 'IN THE APP',
      do: 'Load your designs, and let the system read your own file rather than retyping it',
      why: `Your designs already exist in a file somewhere. Retyping several hundred of them into a
new system is both the slowest possible start and the one most likely to introduce errors that only
surface at a month end.`,
      expect: 'your own columns recognised by name rather than by position, so a file where ' +
        'somebody inserted a column last year still loads correctly.',
      warn: `Where a column cannot be matched, you are told which one and asked — not guessed at.
A guess here becomes a wrong cost on every piece of that design.`,
      change: 'Load a corrected file at any time. Loading again updates rather than duplicating, ' +
        'matched on the design number.',
      done: 'Every design you sell exists, with its number, its description and whether it is a single garment or a set.',
    },
    {
      id: '4.2', label: 'IN THE APP',
      do: 'Say what each set type contains — including which pieces are optional',
      why: `Whether a set needs three pieces or two decides when it is countable as finished, and
therefore when it can be sold and what it costs. A set type where the third piece is sometimes
included and sometimes not is a real thing and has to be expressible, rather than forced into one of
the two answers.`,
      note: `Where the composition of a set genuinely depends on the combination rather than on the
type — the same name covering more than one arrangement — record it that way. The system carries
both readings and reports where they differ, rather than picking one and being quietly wrong about
the other half of your stock.`,
      change: 'Add a set type, change what one contains, or mark a slot optional — from a date. ' +
        'Stock already counted keeps the composition it was counted under.',
      done: 'Every set type says what it contains, every slot says whether it is required, and no set type is silently assumed to be three pieces.',
    },
    {
      id: '4.3', label: 'IN THE APP',
      do: 'Number your products so a person holding one can tell which company it belongs to',
      why: `A product number that carries the company code answers, from a label on a bag in a
warehouse, which of your businesses owns it. That question comes up constantly and the alternative is
looking it up.`,
      change: 'The code prefix belongs to the company and is set once. Products already numbered ' +
        'keep their numbers — renumbering existing stock is how two things end up with the same label.',
      done: 'Every product number identifies its company on sight, and the series is set to continue rather than restart.',
    },
  ],
};

/* ── Part 5 · the making side ────────────────────────────────────────────── */

const B5 = {
  n: 5,
  title: 'The making side — units, rate cards, and what gets counted',
  lead: `Work goes out to units — a lead person and the people who work with them — and comes back
as finished pieces. What you owe a unit is worked out from what came back, at the rate that applied
on the day it came back.

**A unit is not a person.** Units split, merge and change who is in them, and a unit that was one
last year and two this year is a date, not a contradiction. Everything is set up so that the earlier
period still resolves to what it actually was.`,
  identity: true,
  identityLead: `One person written four ways in four files is still one person, and one balance:`,
  steps: [
    {
      id: '5.1', label: 'IN THE APP', terms: ['database', 'table'],
      do: 'Create each making unit, by the name the floor already uses',
      why: `The unit is what earns, what gets paid and what carries an outstanding balance. Naming it
what your own people call it is what makes a payment screen legible to the person making the payment.`,
      expect: 'each unit with its lead, its members, and its own running balance of earned against ' +
        'paid.',
      change: 'Add or close a unit from a date. A unit that splits into two is closed on the last ' +
        'day it was one and the successors start on the next — which keeps the earlier period ' +
        'pooled, correctly, and the later one split.',
      done: 'Every unit that does work for you exists, with the people currently in it, and any unit that has changed shape has done so with dates rather than by being edited.',
    },
    {
      id: '5.2', label: 'IN THE APP',
      do: 'Enter the rate card per design, per component, from the date it applies',
      why: `What you pay for a top is not what you pay for a dupatta, and neither is what you paid
last season. The rate is per design, per component, from a date — which is what lets a report for
last season resolve last season’s rate while this season pays this season’s.`,
      warn: `A rate that has never been stated is not zero and must not be treated as zero. If work
comes back against a design with no rate on record, the system asks rather than paying nothing. A
piece rate nobody set is a question, not an amount.`,
      change: 'A new rate from a date closes the previous one the day before. Both stay on record, ' +
        'so a report for either period is answerable.',
      done: 'Every design a unit works on has a rate for every component, each with the date it starts from, and nothing anywhere is paying an amount nobody stated.',
    },
    {
      id: '5.3', label: 'IN THE APP',
      do: 'Record what goes out and what comes back, by component',
      why: `A set is finished when all its required pieces are back, and its pieces come back at
different times from different units. Counting at the component level is what makes "how many
complete sets do I have" answerable without somebody walking the floor.`,
      expect: 'complete sets, and separately the pieces waiting on one missing component — which ' +
        'is the number that tells you what to chase.',
      change: 'Record a correction as a correction rather than by editing the original. What was ' +
        'counted and what it was corrected to are both worth knowing.',
      done: 'Completed sets and incomplete ones are separate numbers, and the incomplete ones say which piece they are waiting for.',
    },
    {
      id: '5.4', label: 'IN THE APP',
      do: 'Pay against the balance, not against a figure somebody typed',
      why: `What a unit is owed is computed from the work that came back and the rates that applied,
recomputed each time rather than carried forward as a running total somebody once agreed. Payments
reduce it. The difference is the outstanding balance, and it is arrived at rather than remembered.`,
      note: `Where the computed figure and your own records disagree, the difference is reported as a
named difference rather than absorbed. A balance that ties out because somebody quietly adjusted it
is a balance nobody can check.`,
      done: 'Every unit has an outstanding balance you can explain line by line, and no figure in it came from a total rather than from the transactions underneath it.',
    },
  ],
};

/* ── Part 6 · buying ─────────────────────────────────────────────────────── */

const B6 = {
  n: 6,
  title: 'Buying — vendors, the first purchase, and what arrives',
  lead: `The buying side is three documents that have to agree: what you ordered, what arrived, and
what you were billed. When all three match, the bill is payable without anybody thinking about it.
When they do not, the difference is the whole point and is what should reach a person.`,
  serviceProviders: true,
  serviceProvidersLead: `Beyond material suppliers, the outside services this business uses are a
recorded list rather than a matter of memory:`,
  steps: [
    {
      id: '6.1', label: 'IN THE APP',
      do: 'Add your vendors with what you actually judge them on',
      why: `Price is the easiest thing to record and rarely the thing that decides who you buy from.
Lead time, how often they are short, and how often the quality comes back are what you actually use,
so they are what the vendor record carries.`,
      expect: 'each vendor with their terms, their lead time, and their history — rather than a ' +
        'name and a phone number.',
      change: 'Terms are effective-dated. A vendor who changes credit terms in June does not change ' +
        'what May was bought on.',
      done: 'Every vendor you buy from exists, with the terms you actually agreed and the measures you would actually choose them on.',
    },
    {
      id: '6.2', label: 'IN THE APP',
      do: 'Let what you need be worked out from what you have sold and what you hold',
      why: `Buying from a feeling produces both stockouts and dead stock, usually in the same season.
What you need is a calculation from what is committed, what is in hand and what is already on order —
and the useful part is that it can tell you the day you should have ordered rather than the day you
noticed.`,
      expect: 'a suggested requirement per material, with what it was calculated from shown next to ' +
        'it, so you can disagree with a number rather than just override it.',
      change: 'Reorder levels, lead times and safety margins are all settings, per material, ' +
        'effective-dated.',
      done: 'A purchase suggestion exists that somebody can check, and every figure in it says what it was derived from.',
    },
    {
      id: '6.3', label: 'IN THE APP',
      do: 'Raise the order, receive against it, and let the three documents match themselves',
      why: `Ordered, received, billed. A bill that matches both is passed without a conversation.
A bill that does not is stopped and shows which of the three disagrees and by how much — which is
the moment where money is actually saved, and the moment most systems handle by having somebody
notice.`,
      table: {
        head: ['The three', 'Where it comes from'],
        rows: [
          ['**Ordered**', 'The purchase order you raised'],
          ['**Received**', 'What was counted in at the door, by whoever counted it'],
          ['**Billed**', 'The vendor’s invoice'],
        ],
      },
      expect: 'bills in three groups — matched and payable, short or over and held, and awaiting ' +
        'receipt — rather than one list somebody works through.',
      change: 'The tolerance below which a difference is not worth stopping a bill for is a setting, ' +
        'per vendor or overall.',
      done: 'A bill that agrees with the order and the receipt is payable without intervention, and one that does not says exactly where the disagreement is.',
    },
    {
      id: '6.4', label: 'IN THE APP',
      do: 'Count what arrived at the door, in the unit it arrived in',
      why: `Stock accuracy is decided at the moment of receipt and almost nowhere else. Counting in
the unit it physically arrived in — and converting afterwards — is what stops a metre becoming a
piece somewhere between the door and the ledger.`,
      change: 'Conversions between units are settings per material, and changing one does not ' +
        'restate stock already received.',
      done: 'What was received is recorded in the unit it came in, by the person who counted it, on the day it arrived.',
    },
    {
      id: '6.5', label: 'IN THE APP',
      do: 'Count your stock without stopping the floor',
      why: `A full annual count is a day nobody works and a number nobody trusts by March. Counting a
slice at a time, continuously, keeps the figure accurate all year and never closes the floor.`,
      expect: 'a variance per count, with a reason recorded against it — because variance with no ' +
        'reason is a number that gets adjusted away and learned nothing from.',
      done: 'Stock is counted on a rolling basis, every variance carries a reason, and the book figure is one you would act on without recounting first.',
    },
  ],
};

/* ── Part 7 · selling ────────────────────────────────────────────────────── */

const B7 = {
  n: 7,
  title: 'Selling — the first order, the first invoice, the first payment',
  lead: `Now the part everything else was for. One order, taken properly, through to money in the
bank and an entry in the books — and once that works, the rest is volume.`,
  leadSources: true,
  leadSourcesLead: `Where an enquiry came from is a recorded list, because "how did they find us" is
only answerable if it was a choice rather than a text box:`,
  steps: [
    {
      id: '7.1', label: 'IN THE APP',
      do: 'Take one order, on one channel, for one customer',
      why: `Do this once by hand even if the channel will bring orders in by itself. It is the
fastest way to find out whether your set types, your product numbers and your tax settings are right,
and it is far cheaper to find out on an order you control.`,
      expect: 'the order priced correctly, the tax worked out from the place of supply, and the ' +
        'stock committed but not yet moved.',
      done: 'One order exists, on the right company, on the right channel, at the price and tax you expected.',
    },
    {
      id: '7.2', label: 'IN THE APP',
      do: 'Raise the invoice, and read it as your customer would',
      why: `The invoice is the one document from this system a customer actually sees. Its number
series, its address, its tax breakdown and its terms are all things you set up earlier, and this is
where you find out whether you set them up correctly.`,
      needs: [
        'The order it comes from',
        'The company issuing it, and therefore its number series',
        'The place of supply, which decides which taxes apply',
      ],
      expect: 'a document you would be content to send, numbered in the series you chose, with the ' +
        'tax split shown the way your customers expect to see it.',
      warn: `An invoice number is never reused and never edited. A mistake is corrected with a
credit note, which is slower and is also the only version that leaves both documents intact.`,
      done: 'One invoice exists, it is numbered in your own series, and you would send it to a customer as it stands.',
    },
    {
      id: '7.3', label: 'IN THE APP',
      do: 'Record the payment, and let the settlement reconcile itself',
      why: `A marketplace does not pay you the invoice amount — it pays a settlement, days later,
covering many orders, net of commissions, fees, returns and adjustments. Matching that back to
individual orders by hand is where most of a finance person’s week goes, and it is arithmetic.`,
      expect: 'the settlement broken down to the orders inside it, with every deduction named, and ' +
        'anything it cannot match listed rather than absorbed.',
      change: 'When a marketplace changes its fee structure, the change is dated. Old settlements ' +
        'still reconcile under the old structure.',
      done: 'A payment is recorded against the invoice, and a marketplace settlement can be broken back down to the orders and the deductions inside it.',
    },
    {
      id: '7.4', label: 'IN THE APP',
      do: 'Check that the sale reached the books by itself',
      why: `The point of the whole exercise. A sale, an invoice and a payment should each have
produced their own entries without anybody making a journal — and if they did not, now is when you
want to know, on one transaction, rather than at a month end on several hundred.`,
      expect: 'the entries on both sides, balancing, in the right company, in the right period, ' +
        'each one traceable back to the document that caused it.',
      done: 'One sale has gone from an order to a balanced entry in the books without anybody writing a journal, and every entry can be traced back to what caused it.',
    },
  ],
};

/* ── Part 8 · the first month ────────────────────────────────────────────── */

const B8 = {
  n: 8,
  title: 'The first month — attendance, payroll, and closing the books',
  lead: `The first month end is the real test, and the only one that finds the settings you got
wrong. Run it deliberately, with time, on a month you have already lived through — so you know what
the answer should be before the system tells you.`,
  steps: [
    {
      id: '8.1', label: 'IN THE APP',
      do: 'Look at the attendance exceptions, not at the attendance',
      why: `Most days are ordinary and reviewing them is wasted effort. What matters is the short
list: somebody who did not appear, somebody whose hours are impossible, somebody marked present on a
day their employment had ended. Reviewing that list is a few minutes; reviewing a full register is a
morning nobody has.`,
      expect: 'a short list of days that need a human, and everything else already settled.',
      done: 'Every exception for the month has been looked at by a person and either corrected or accepted, and the rest was never touched.',
    },
    {
      id: '8.2', label: 'IN THE APP',
      do: 'Run payroll for a month you already know the answer to',
      why: `Running it first on a month you have already paid means you have something to compare
against. Where the system disagrees with what you paid, one of the two is wrong, and finding out
which — now, on a month already settled — is the entire value of doing it this way round.`,
      note: `Expect small differences and investigate each one rather than accepting the total. A
difference usually means a threshold, a rate start date or a person’s hours were entered slightly
differently from the way you actually apply them. The rules document sets out exactly how each pay
basis is computed, so a difference is traceable rather than mysterious.`,
      warn: `Do not adjust a figure to make it match. Find the setting that produced it and correct
that, then re-run. A payroll corrected by adjustment matches this month and will be wrong again next
month, in a way nobody remembers the reason for.`,
      done: 'Payroll for a known month has been run, every difference against what was actually paid is explained by a setting, and the setting has been corrected rather than the figure.',
    },
    {
      id: '8.3', label: 'IN THE APP',
      do: 'Look at what each person and each unit actually produced',
      why: `Cost per piece, utilisation and where the work is stuck are the numbers that change what
you do next month, and none of them exists unless attendance and output are both recorded. Having
just done both, you have them for the first time.`,
      note: `A month somebody was not employed is not a month they performed badly, and is not
averaged in as one. A month with nothing recorded is reported as nothing recorded rather than as
zero. Both of those are accuracy rather than kindness — a wrong number about a real person follows
them.`,
      done: 'Cost per piece and utilisation exist for the month, and no figure in them is an average that quietly included a month somebody was not there.',
    },
    {
      id: '8.4', label: 'IN THE APP',
      do: 'File your returns from the system rather than from a spreadsheet',
      why: `The tax figures are already in the transactions. Producing the return from them, rather
than rebuilding it alongside them, is what makes what you filed and what your books say the same
number — which is the thing that is checked if anybody ever checks.`,
      expect: 'the return in the format required, and a reconciliation showing it agrees with the ' +
        'books line for line, with any difference named.',
      done: 'The return has been produced from the transactions, it agrees with the books, and any difference is named rather than adjusted away.',
    },
    {
      id: '8.5', label: 'IN THE APP',
      do: 'Close the period, and understand what closing means',
      why: `Closing freezes the period so that a report run today and the same report run next year
give the same answer. That is worth a great deal and it is why closing is restricted. Anything found
afterwards is corrected in the open period with an entry that says what it is correcting.`,
      warn: `A closed period does not reopen casually, and that is the feature. If everything can be
reopened, no report has ever meant anything.`,
      done: 'The month is closed, the figures are the ones you would report, and everybody who might want to change them knows how a correction is made instead.',
    },
  ],
};

/* ── Part 9 · live ───────────────────────────────────────────────────────── */

const B9 = {
  n: 9,
  title: 'Live — the daily rhythm, and what to check',
  terms: ['effective date', 'audit trail'],
  lead: `Setup is finished. What remains is a short daily habit and a shorter monthly one, and the
useful measure of whether the setup worked is how little of either there is.`,
  logs: true,
  logsLead: `Everything you change from here on is added rather than written over, which is what
makes a change today safe for a month already paid:`,
  dynamic: true,
  dynamicLead: `And this is the list in full — everything you can change without anybody’s
permission, who changes it, and what happens to records already made. It is here rather than in the
reference alone because a runbook that ends without it has taught somebody to set the business up
and not that they own it.`,
  steps: [
    {
      id: '9.1', label: 'IN THE APP',
      do: 'Check the exceptions each morning, and nothing else',
      why: `A dashboard that shows you everything shows you nothing. What deserves a morning is the
short list of things that are not as expected: attendance that needs a decision, bills held on a
mismatch, stock that has gone below where it should be, orders that have not moved.`,
      expect: 'a list short enough to work through with a cup of tea, and empty on a good day.',
      done: 'The morning check is a list of exceptions, it is usually short, and an empty one genuinely means nothing needs you.',
    },
    {
      id: '9.2', label: 'ON A PHONE',
      do: 'Let the day close itself from the floor',
      why: `What was finished today, by whom, is worth more recorded today from the floor than
reconstructed on the 30th from a supervisor’s memory. The phone the person already carries is what
makes that happen without a screen and without anybody waiting in line.`,
      done: 'The day’s work is recorded on the day it happened, by the people who did it, without anybody being sat in front of a computer.',
    },
    {
      id: '9.3', label: 'WITH YOUR TEAM',
      do: 'Change things — and notice that nothing broke',
      why: `The setup is only proven when you change something. Add a channel mid-season. Move
somebody to a different pay basis. Change what a set contains. Then re-run last month and confirm it
is unchanged to the rupee. That is the promise this whole design is built on, and it is worth
testing deliberately rather than discovering by accident.`,
      expect: 'the new arrangement in force from its date, the closed month identical to what it ' +
        'was, and no developer involved in either.',
      done: 'You have changed something significant, seen it take effect immediately, and confirmed that a closed period did not move.',
    },
    {
      id: '9.4', label: 'WITH YOUR TEAM',
      do: 'Decide what you would do if this were unavailable for a day',
      why: `Not a technical question. Orders still arrive and staff still work, and the difference
between an inconvenient day and a lost one is whether anybody decided beforehand what gets written
down by hand and entered afterwards.`,
      done: 'Somebody can say what happens to orders, attendance and dispatch during an unavailable day, and what gets entered afterwards.',
    },
  ],
};

module.exports = { parts: [B0, B1, B2, B3, B4, B5, B6, B7, B8, B9] };

/* ── the gate on this file ────────────────────────────────────────────────── */
/* Same checker as the reference document uses. Two parts lists, one set of rules about what may
   reach this reader — a shell command, a person’s name, somebody’s pay, build-state language. */
module.exports.check = function check() {
  return TENANT.checkParts(module.exports.parts);
};
