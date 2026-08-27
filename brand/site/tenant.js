'use strict';
/* THE TENANT GUIDE — one business on the platform, in full.
 *
 * WHO READS THIS
 * A business that uses the platform. Not the people building it. This reader installs nothing,
 * clones nothing and has no terminal — check() below refuses any step carrying a shell command,
 * because an earlier version of this document opened by telling a clothing manufacturer to run
 * `git init`, which is a long document written for entirely the wrong person.
 *
 * WHAT IT CONTAINS
 * Everything this business actually runs on: its companies, its channels, its products and what
 * each set contains, how the making side counts and pays, how people and attendance work, what
 * the system refuses to do, and how every single one of those is changed by the business itself
 * without waiting for anybody.
 *
 * THE ONE RULE RUNNING THROUGH IT
 * Nothing is fixed. Everything can be added, edited or removed at any moment, and it takes effect
 * at once — and the past does not move, because every change carries the date it starts from.
 * A supervisor leaves on Tuesday without notice, a replacement starts Wednesday morning, both are
 * recorded the same day, and last month’s payroll still comes out to the rupee it came out to
 * before. Purana record mitta nahin; naye date se naya rule lagta hai.
 *
 * PERSONAL DATA
 * No person is named. Not one. The business’s own files hold the roster, the salaries and the
 * employment dates, and those are the owner’s to keep — a document that gets shared, printed and
 * emailed is not where anybody’s salary belongs. Every rule here is described by its SHAPE, which
 * is what makes it a rule rather than a list. check() enforces this.
 *
 * THIS DESCRIBES A DESIGN. Nothing here claims to exist yet.
 *
 * Straight apostrophes read wrong in the PDF; use the typographic ’ in prose.
 */

/* ── Part 0 · what you are ────────────────────────────────────────────────── */

const P0 = {
  n: 0,
  title: 'What you are on this platform',
  lead: `__PLATFORM__ is the software. **You are one business using it** — the same way a business
uses Zoho or Odoo. You sign up, you take a plan, and you run your companies inside it.

That decides everything in this document. **You install nothing.** No server, no software on a
laptop, no technical person needed. Everything here happens in a browser or on a phone.

The businesses on either side of you look nothing like yours — a steel plant, a school, somebody
selling courses. Same software underneath. What makes it yours is the settings: your words, your
steps, your companies, your channels, and which parts of it you use at all.`,
  terms: ['platform', 'tenant', 'module', 'role', 'permission'],
  steps: [
    {
      id: '0.1', label: 'WITH YOUR TEAM',
      do: 'Understand the one thing that makes this different',
      why: `Most business software gives you a fixed system and a support ticket. Here, the things
that make your business yours are **settings you control**, not code somebody has to change. That
means you are never waiting on a developer to run your business — and it also means the settings are
your responsibility to get right.`,
      table: {
        head: ['You change this yourself, any time', 'This is the same for every business'],
        rows: [
          ['What you call everything', 'That every record names its company'],
          ['The steps your work moves through', 'That money is exact to the paisa'],
          ['Extra fields on any record', 'That every change is recorded, permanently'],
          ['Which parts of the system you use', 'That nobody else can read your data'],
          ['Your companies, channels, godowns', 'The rules your books rely on'],
          ['Your rates, your people, your roles', 'That nothing is ever truly deleted'],
        ],
      },
      done: 'Whoever will administer this can say which column any given thing falls into.',
    },
    {
      id: '0.2', label: 'WITH YOUR TEAM',
      do: 'Know which two addresses do what',
      why: `Easy to confuse, and confusing them wastes a day. **\`__STORE__\` is your shop** — where
customers browse and buy. It is one of the ways you sell, and orders from it arrive here. **The
platform is where you run the business** — every order from every channel, the making, the stock, the
people, the books.`,
      done: 'Everyone understands the shop is one channel feeding the system, not the system itself.',
    },
  ],
};

/* ── Part 1 · companies ───────────────────────────────────────────────────── */

const P1 = {
  n: 1,
  title: 'Your companies',
  lead: `A company is a record you create. You have three today; the plan allows twenty, and the
software itself has no limit. A fourth opens the day you open it — no waiting, no upgrade, no call.

**Four things about a company are separate fields on purpose**, and collapsing any two of them is the
single most common modelling mistake in this whole system.`,
  companies: true,
  steps: [
    {
      id: '1.1', label: 'IN THE APP',
      do: 'Create each company with its four identities kept apart',
      why: `Look at the middle line of the list above. The company has one legal name, trades under a
different name, marks its stock with a third code, and numbers its invoices with a fourth. If any two
of those were one field, its invoices would carry a name that is not its registered name — which is a
compliance problem, not a cosmetic one.`,
      table: {
        head: ['Field', 'What it is', 'Where it shows'],
        rows: [
          ['Legal name', 'The registered entity', 'Invoices, returns, contracts'],
          ['Trading name', 'The name customers know', 'The shop, the packaging, marketing'],
          ['Brand code', 'The short code on stock', 'SKUs, labels, stock reports'],
          ['Invoice prefix', 'The letters before every document number', 'Invoice and voucher numbers'],
        ],
      },
      change: 'Add a company any time. Rename one any time — documents already issued keep the name they were issued under.',
      done: 'Every company exists with all four set separately, and a test invoice from each carries the right name and the right number.',
    },
    {
      id: '1.2', label: 'IN THE APP',
      do: 'Handle the company that has no registration of its own',
      why: `One of your companies does job work and has no registration. It still belongs in the group
figures — the work is real and the cost is real — but it must never be pulled into a return it does
not belong in. Those are two different questions and the system must answer them separately.`,
      change: 'Whether a company files its own returns is a setting on the company, changeable from a date — so the day it does get registered, you set it and nothing before that date moves.',
      done: 'The group total includes it, and no return anywhere includes it.',
    },
    {
      id: '1.3', label: 'IN THE APP',
      do: 'Check that trade between your own companies is removed from the group figure',
      why: `Selling stock from one of your companies to another is not group revenue. Counting it
means the group looks bigger than it is, and you are the person that number misleads.`,
      done: 'The group total equals the sum of the companies minus trade between them, checked against one such transfer you can point at.',
    },
  ],
};

/* ── Part 2 · channels ────────────────────────────────────────────────────── */

const P2 = {
  n: 2,
  title: 'Your channels — every way you sell',
  lead: `A channel is where a sale came from. You record one per company, so two of your companies can
each sell on the same marketplace and they stay separate, with figures that never merge.

**Stock stays one number per item.** Never split per channel. That single decision is what stops the
same piece being sold twice on two different marketplaces.`,
  channelKinds: true,
  leadSourcesLead: `A channel is where a **sale** came from. Where an **enquiry** came from is a
different question with a shorter answer, and you have already fixed the list:`,
  leadSources: true,
  steps: [
    {
      id: '2.1', label: 'IN THE APP',
      do: 'Add every route to market you actually use',
      change: 'A new marketplace is added in the app and selling the same day. Never a release, never a wait.',
      done: 'Every way you currently sell is recorded against the company that owns it.',
    },
    {
      id: '2.2', label: 'OUTSIDE',
      do: 'Connect each selling account with a key, never a password',
      why: `Every connection uses a key you create in that marketplace or shop, and can withdraw at
any time without changing anything else. **Nothing in this system will ever ask you for a marketplace,
bank or account password** — a password hands over an account you cannot take back or limit. If
anything ever asks, it is not us.`,
      done: 'Every channel is connected with its own key, and you know where to withdraw each one.',
    },
    {
      id: '2.3', label: 'IN THE APP',
      do: 'Decide what happens when a channel goes quiet',
      why: `Marketplaces change their systems without telling anyone. When orders stop arriving from
one, that must be visible rather than silent — a channel that quietly stops feeding is a week of
missing sales nobody noticed.`,
      done: 'A channel that has sent nothing for longer than it usually does raises a flag somebody sees.',
    },
  ],
};

/* ── Part 3 · products and what a set contains ────────────────────────────── */

const P3 = {
  n: 3,
  title: 'Your products, and what each set actually contains',
  lead: `This is the part most systems get wrong, and getting it wrong changes what you pay people.

You sell **sets**. A set is several pieces that go together, and different sets contain different
things. The critical fact: **you cannot tell what a set contains from its name.** An Anarkali Plazo
Set contains a dupatta. A Kurti Plazo Set does not. Neither name says so. Read the composition from
the name and you get one of them wrong whichever way you read it.`,
  setTypes: true,
  reading: true,
  steps: [
    {
      id: '3.1', label: 'IN THE APP',
      do: 'Record what each set type contains, as a list of slots',
      why: `Because the composition decides how many complete sets exist, and how many complete sets
decides what gets paid. This is not a description — it is an input to a payment.`,
      change: 'Add a set type, change what one contains, or retire one — any time, from a date. Sets already counted keep the composition that applied when they were counted.',
      done: 'Every set type you make has its slots recorded, and none of them was guessed from its name.',
    },
    {
      id: '3.2', label: 'WITH YOUR TEAM',
      do: 'Understand the three separate dupatta columns',
      why: `Your production report has **three different dupatta columns** — one for Anarkali Plazo,
one for Kurti Palazzo, one for Lehenga Choli — plus a standalone Dupatta Set column. A system with a
single dupatta slot cannot tell them apart, and would credit a Kurti Plazo design with a dupatta it
never had. The columns are separate because the garments are separate.`,
      done: 'Whoever fills the production report knows which dupatta column belongs to which set type.',
    },
    {
      id: '3.3', label: 'WITH YOUR TEAM',
      do: 'Know where the set type for a design comes from, and what happens when it is missing',
      why: `The set type for a design comes from your rates master. When a design has no entry there,
the system works it out from which columns have numbers in them — checking in a fixed order, most
specific first — and **flags the result as worked out rather than known**. A flag is not a failure; it
is the system refusing to pretend it was told something it inferred.`,
      inference: true,
      change: 'Add the design to the rates master and the flag disappears from that point on. Nothing already counted changes.',
      done: 'Every design either has a set type on record or is flagged as inferred, and somebody reviews the flagged list.',
    },
    {
      id: '3.4', label: 'WITH YOUR TEAM',
      do: 'Carry the column-count discrepancy openly rather than resolving it by guess',
      why: `Your own written specification says 23 garment columns in two places, and then lists 22 —
indices 2 to 23, columns C to X — with none unused. The system holds the 22 that are actually named.
If a 23rd exists in the real file it has never been named anywhere, and quietly inventing one would
silently mis-file whatever it holds.`,
      done: 'Somebody who knows the original file confirms whether 22 is right. Until then it stays flagged, not smoothed over.',
    },
  ],
};

/* ── Part 4 · the making side ─────────────────────────────────────────────── */

const P4 = {
  n: 4,
  title: 'The making side — counting and paying for work',
  identity: true,
  karigarDeep: true,
  lead: `The heart of the business, and the part with the most rules. Read this part slowly; every
line of it turns into somebody’s payment.`,
  steps: [
    {
      id: '4.1', label: 'WITH YOUR TEAM',
      do: 'Understand that the paying unit is not the same as the person',
      why: `Some units on your payroll are one person. Some are a team working under one name. The
unit is what earns, gets paid and carries an outstanding balance — and a unit that worked alone one
year and as a team the next is **the same unit with two labels**, each with the date it applied from.
Treating them as two units would split one balance in half.`,
      change: 'A unit can change its label and its members from a date. Both the old and the new are kept, so a report for either period shows what it was called then.',
      done: 'Every paying unit exists once, with its label history, and its outstanding balance is continuous across a change of composition.',
    },
    {
      id: '4.2', label: 'WITH YOUR TEAM',
      do: 'Count a complete set as the smallest of its slots — never the smallest of whatever was made',
      why: `**The most important calculation in the business.** If a set needs a top, a bottom and a
dupatta, then 100 tops, 90 bottoms and 40 dupattas is **40 complete sets** — the dupatta is the
bottleneck. Counting the smallest of whatever happened to be produced, instead of the smallest of what
the set actually requires, gets a different answer for any design where a slot was never populated at
all.`,
      example: {
        head: ['Made', 'Top', 'Bottom', 'Dupatta', 'Complete sets'],
        rows: [
          ['Anarkali Plazo Set — needs all three', '100', '90', '40', '**40**'],
          ['Kurti Plazo Set — needs two', '100', '90', '— *(not part of this set)*', '**90**'],
        ],
      },
      done: 'The set count for every design uses that design’s recorded composition, and a check proves it rather than assuming it.',
    },
    {
      id: '4.3', label: 'IN THE APP',
      do: 'Price every row from its own rate, and refuse the row that has none',
      why: `Every line of work carries its own rate, resolved for the date it was done. When a rate is
missing, the system **stops and names the row** — it does not fall back to a similar rate, an average,
or zero. A guessed rate is a wrong payment to a real person, and it is discovered weeks later by that
person.`,
      change: 'Rates are changed from a date. Work already priced keeps the rate that applied when it was done.',
      done: 'A row with no rate blocks the run and names itself. Nothing is ever priced at zero for want of a rate.',
    },
    {
      id: '4.4', label: 'WITH YOUR TEAM',
      do: 'Never merge two similar names automatically',
      why: `Two spellings of a name might be one unit or might be two. The system proposes a match and
**never applies one by itself**, because merging two people who are different silently combines two
balances and is very hard to untangle afterwards. Once you answer, the answer is stored — so you are
asked once, not every month.`,
      done: 'Every proposed merge was decided by a person, and the decision is recorded so it is never asked twice.',
    },
  ],
};

/* ── Part 5 · people, attendance and pay ──────────────────────────────────── */

const P5 = {
  n: 5,
  title: 'People, attendance and pay',
  lead: `Three ways of being paid, and the rules that keep them apart. **Nobody is named in this
document** — the roster is yours and stays in your system, not in a file that gets emailed around.`,
  payBasis: true,
  attendance: true,
  salary: true,
  productivity: true,
  performance: true,
  steps: [
    {
      id: '5.1', label: 'IN THE APP',
      do: 'Set each person’s pay basis, from a date',
      why: `A person can move from one basis to another — and when they do, the change applies from
its date and not before. A basis that applied backwards would rewrite months already paid.`,
      change: 'Change a basis any time, choosing the date it starts. Every earlier month recalculates to the basis that applied then.',
      done: 'Running last month twice, before and after a basis change, gives the same figure both times.',
    },
    {
      id: '5.2', label: 'WITH YOUR TEAM',
      do: 'Keep hours informational — never let them scale a month’s pay',
      why: `Hours are recorded and reported because they are useful to know. They do not multiply
anybody’s pay. There is exactly one figure that pays, per basis, and everything downstream —
allocation, reconciliation, outstanding — reads that one figure and nothing else. Two ways of pricing
the same month is how two departments end up with two different totals.`,
      done: 'One paying figure per person per month, and every downstream report traces to it.',
    },
    {
      id: '5.3', label: 'WITH YOUR TEAM',
      do: 'Treat "no match" as an error, never as zero',
      why: `**The single most dangerous default in payroll software.** When the system cannot find
what applied — no salary on record, no rate for a category, no hours reference — it must stop and say
so. Treating a missing value as zero pays somebody nothing and looks exactly like a correct run.`,
      done: 'Every missing value stops the run and names what is missing and for whom. No run completes with a silent zero in it.',
    },
    {
      id: '5.4', label: 'WITH YOUR TEAM',
      do: 'Separate the three states a blank month can mean',
      why: `A month with nothing recorded can mean three completely different things, and merging them
misreports people badly: the person was not employed then, or they were employed and the record is
missing, or they were employed and genuinely did no work. Only the middle one is a problem to chase.`,
      table: {
        head: ['A blank month means', 'What it is', 'What to do'],
        rows: [
          ['Outside their employment dates', 'Not a gap at all', 'Nothing — they were not there'],
          ['Inside employment, nothing recorded', 'A tracking gap', 'Find out what happened'],
          ['Inside employment, recorded as none', 'A real zero', 'Nothing — it is the truth'],
        ],
      },
      done: 'The three are reported separately, and nobody appears in a failure list for a month they were not employed.',
    },
    {
      id: '5.5', label: 'IN THE APP',
      do: 'Record advances against the unit, and settle them at payout',
      why: `An advance is money already given. It has to reduce what is due without disappearing from
the record, so both the person and you can see what was taken and what remains.`,
      change: 'Record an advance at any moment, from a phone. It affects the next payout immediately.',
      done: 'Every payout shows what was earned, what was advanced, and what was paid — and the three reconcile.',
    },
    {
      id: '5.6', label: 'ON A PHONE',
      do: 'Let the shop floor report without opening a computer',
      why: `The people making the product do not sit at a desk. A short message becomes a real record:
attendance with the time and place it was marked, production against the design, a request in the
approvals list. Anything that requires a laptop simply does not get recorded, and ends up on paper.`,
      warn: `Attendance marked outside the unit’s area is **flagged for a manager, never refused**. A
system that locks somebody out of being paid because they stood at the wrong gate has failed at its
job. Every override is recorded with who made it.`,
      done: 'A worker can mark attendance and report production from a basic phone, in their own language.',
    },
    {
      id: '5.11', label: 'WITH YOUR TEAM',
      do: 'Write down the holiday and festival rules, and keep paid separate from productive',
      why: `Every business has these and almost none of them are written down, which means they are
whatever the person running payroll remembers. Written down they are settings; remembered they are a
different answer each year, and the difference lands on somebody’s wages.

**The distinction that carries the whole subject is paid against productive.** A holiday is a full
day of pay and zero hours of production. Those are two different numbers and a system that treats
them as one flatters every efficiency figure that reads them — the factory looks more productive on
the days nobody worked.`,
      table: {
        head: ['The day is marked', 'It pays', 'It produces'],
        rows: [
          ['Present', 'A full day', 'A full day’s hours'],
          ['Half day', 'Half a day', 'Half a day’s hours'],
          ['**Holiday**', '**A full day**', '**Nothing** — nobody was making anything'],
          ['On duty, offsite', 'A full day', 'A full day — the work happened elsewhere'],
          ['**Paid leave**', '**A full day**', '**Nothing**'],
          ['Unpaid leave', 'Nothing', 'Nothing'],
          ['Absent', 'Nothing', 'Nothing'],
        ],
      },
      note: `**A festival flag matches a festival-leave request and does nothing else.** It is not a
pay rule, not a shift rule and not a permission — and the reason it is worth saying is that a flag
attached to a person is exactly the kind of thing that quietly acquires a second job later, at which
point somebody’s pay depends on a field nobody thought was about pay.`,
      warn: `A festival spike in demand is **never folded into the baseline**. A month that sold three
times the usual amount because of one festival is not a new normal, and averaging it in has the
system ordering for a festival all year.`,
      change: 'The holiday list, which days are paid, and who each rule applies to are settings with ' +
        'dates. Adding Diwali to next year’s list does not re-run last year’s payroll.',
      done: 'Holiday and festival rules exist as dated settings rather than in somebody’s memory, a paid day that produced nothing is counted as paid and not as productive, and no festival month has been averaged into a baseline.',
    },
    {
      id: '5.13', label: 'IN THE APP',
      do: 'End a rate on the date it ended, and let the next period ask rather than assume',
      why: `A rate left running with no end date does not stay put — it keeps applying. Somebody who
was paid by the hour last year and moves to piece work this year has **two periods**, and if the
hourly row is never closed, this year quietly pays last year’s figure. It reconciles, it posts, and
nobody sees it until somebody adds up what they were actually paid.

**Naming the new basis is not the same as stating the new rate.** Saying "from April it is piece
rate" says what kind of pay it is and not how much, and those are two facts. The second one has to
be given before anybody can be paid under it.`,
      table: {
        head: ['What is on record', 'What the system does'],
        rows: [
          ['A rate with an end date', 'Applies up to that date and no further'],
          ['The period after it, with a rate', 'Pays the new rate'],
          ['The period after it, with **no** rate', '**Raises, and names the person and the month.** It does not carry the old rate forward and it does not pay zero.'],
          ['Somebody who never had a rate at all', 'The same refusal, recorded in its own place — a rate that ended is a different fact from one that never existed'],
        ],
      },
      warn: `This is not a warning about carelessness. It is a warning about the shape of the
mistake: the wrong answer here **looks completely normal**. Last year’s rate is a real number that
was correct twelve months ago, so the payslip is plausible, the ledger balances, and the only person
who can tell is the one being paid.`,
      change: 'Close a rate from a date and add the next one whenever you know it. A month between ' +
        'the two raises until you do, which is the system asking rather than choosing.',
      done: 'Every rate has an end date once it has ended, a period with no rate stated raises and names who and when, and no closed month ever changed because a later rate was added.',
    },
    {
      id: '5.12', label: 'IN THE APP',
      do: 'Record religion where a holiday depends on it, and let it decide nothing else',
      why: `Some observances apply to everybody and some do not, and the only honest way to work
out who a religion-specific day applies to is to have recorded it. So the field exists **for that
one purpose**.

**The risk is not that somebody sets out to make pay depend on religion.** It is that an attribute
sitting on a person quietly acquires a second job — first a report groups by it, then something
defaults from it, and eventually a wage depends on a field nobody thought was about wages. That is
exactly how a shift came to be keyed to gender in the first version of this design, which is a
mistake already paid for once here.`,
      table: {
        head: ['A day can apply to', 'And is decided by'],
        rows: [
          ['**Everybody**', 'Nothing. Religion is never consulted.'],
          ['**One religion**', 'The recorded value, and only where one is recorded'],
          ['**A named list of people**', 'The list. Which is the honest shape whenever the arrangement is not really about a category at all.'],
        ],
      },
      warn: `Somebody whose religion nobody recorded, matched against a day scoped to a religion,
**raises and is named**. Including them grants a paid day on an assumption; excluding them withholds
one on the same assumption. Both are decisions about a real person that nobody actually made, and
the second is the one they find out about on payday.`,
      note: `This is checked rather than promised: a gate over the engine fails the build if the
field is read anywhere that computes pay, hours, performance or permission. It was proven by making
the pay calculation read it and watching the build go red.`,
      change: 'Record it, correct it or remove it at any time. Nothing already paid moves, because ' +
        'nothing already paid was ever decided by it.',
      done: 'A religion-scoped holiday resolves for the people it applies to, raises rather than guessing for anybody whose religion is not on file, and no other calculation in the system can read the field at all.',
    },
    {
      id: '5.9', label: 'IN THE APP',
      do: 'Give a weekly off to the people who have one, not to a category they belong to',
      why: `An arrangement made with two people is not a company policy, and the moment it is stored
as one it starts applying to the next person who happens to share their category. So it is a dated
row against each person: how many Sundays a month they do not work, from when.

Two of the men here have two Sundays off a month, from a date in the middle of the year. Nobody else
does — not the other men, not the other masters, not the people who joined later.`,
      table: {
        head: ['What is recorded', 'What is not'],
        rows: [
          ['This person, this many Sundays, from this date', 'A rule about men, or about masters, or about seniority'],
          ['Their stated monthly hours threshold, separately', 'A threshold worked out from the weekly off'],
          ['That the two agree, checked by a test', 'One computed from the other'],
        ],
      },
      note: `The threshold and the weekly off are **two facts, both recorded, cross-checked and never
derived from each other**. The two who have the weekly off also moved to a lower monthly threshold on
the same date, and the arithmetic lines up exactly — which is worth checking and must not become a
calculation. A system that recomputed the threshold would silently restate an already-paid month the
next time somebody edited the shift table.`,
      change: 'Add, change or end somebody’s weekly off from a date. Months already closed keep the ' +
        'arrangement that was in force when they were closed.',
      done: 'A weekly off belongs to a named person from a named date, nobody acquires it by resembling them, and the stated threshold beside it was never computed from it.',
    },
    {
      id: '5.10', label: 'IN THE APP',
      do: 'Pay somebody who was never employed, and let the payment be the whole record',
      why: `Somebody comes for four days, is paid, and goes — the trial did not work out or the
negotiation did not. There is no joining date, no leaving date and no salary, because none of those
ever happened. A system that requires an employment record before it will record a payment forces you
to invent one, and an invented joining date is a fact about a real person that was never true.

So the payment stands alone. Nothing about it is derived, nothing calculates it, and nothing reports
a missing salary — the amount handed over **is** the record.`,
      warn: `Attendance for somebody with no employment record and no payment is **refused, not paid
zero**. It looks exactly like a trial and it is a hole: zero posts cleanly, reconciles, and is
discovered by the person who was not paid. The system says what to record instead.`,
      note: `A trial is never averaged into anybody’s performance. Four days is not a person having a
bad month, and scoring it as one puts something false on a record that follows them.`,
      change: 'A trial who is taken on afterwards becomes a regular person from their real start ' +
        'date, and the trial days stay where they are rather than being rewritten into a spell.',
      done: 'A payment can be recorded for somebody with no employment record at all, nothing raises a missing salary against them, the cost still lands in the right company and month, and attendance with no payment behind it is refused rather than valued at nothing.',
    },
    {
      id: '5.7', label: 'ON A PHONE',
      do: 'Mark IN and OUT as two messages, and let the pair make the day',
      why: `A day is not a tick. It is an **IN** and an **OUT**, and everything worth knowing is in
the pair: how long somebody actually worked, whether they came late, whether they left early, whether
a half-day was a half-day. One message a day cannot tell you any of that, and a supervisor
reconstructing it at month end is guessing about somebody’s wages.`,
      table: {
        head: ['What arrives', 'What the system does with it'],
        rows: [
          ['**IN**, first of the day', 'Opens the day. Records the time it arrived, not the time it is read.'],
          ['**OUT**, last of the day', 'Closes it. Hours worked is the difference, against that person’s own shift.'],
          ['A second **IN** with a day already open', 'Ignored as a repeat, and recorded as ignored. Nobody is punished for sending it twice.'],
          ['**OUT** with no **IN**', 'Raised for a supervisor. It is not half a day and it is not a full one — it is unknown.'],
          ['**IN** with no **OUT** by the cut-off', 'Raised the same way. The day stays open and unpaid until a person decides.'],
        ],
      },
      note: `The cut-off is a setting, not a constant, because a business that runs a late shift needs
a different one and should not need a developer to say so.`,
      warn: `An unmatched IN or OUT is **never** completed by assuming the shift. Filling in the
missing half from the timetable produces a number that looks measured and was invented, and it is
invented in the direction of whoever wrote the code.`,
      change: 'The cut-off, the wording the phone accepts, and who reviews the exceptions are all ' +
        'settings, changed from a date.',
      done: 'Every worked day is a matched IN and OUT with real times, every unmatched one is on somebody’s list, and no missing half was ever filled in from the timetable.',
    },
    {
      id: '5.8', label: 'ON A PHONE',
      do: 'Close the day with what was actually finished, from the person who finished it',
      why: `Attendance says somebody was here. It does not say what came out. The end-of-day update is
the second half — what was completed, against which design, at which stage — sent by the person who
did it, on the day they did it.

**This is the only moment that number is cheap to collect.** On the 30th it is a memory, and a
memory of the 4th is not evidence. Everything downstream — cost per piece, utilisation, what a unit is
owed, where the work is stuck — is built on this one message, and none of it exists without it.`,
      example: {
        head: ['The update carries', 'Because'],
        rows: [
          ['Which design', 'The cost has to land on something'],
          ['Which stage or component', 'A top finished is not a set finished'],
          ['How many', 'The quantity is what is paid for'],
          ['Anything rejected, and why', 'A reject counted as output is a cost nobody sees'],
        ],
      },
      note: `A day with attendance and no update is not zero output — it is an **unreported** day, and
it says so. Those two are different facts and a system that shows them as the same number is lying
quietly.`,
      change: 'What an update must carry, and by when, are settings. A business that adds a stage ' +
        'adds it here, not in a release.',
      done: 'Output is recorded on the day it happened by the person who did it, rejects are separated from output, and a day with no update reports as unreported rather than as nothing made.',
    },
  ],
};

/* ── Part 6 · the rest of the business ────────────────────────────────────── */

const P6 = {
  n: 6,
  title: 'Buying, checking, storing, sending',
  lead: `The chain from raw material to a parcel at somebody’s door. Each step hands to the next, and
none of them requires anyone to re-type what the previous one already knows.

Some of the making is sent out rather than done in-house, and for each of those jobs you have
already decided who does it first.`,
  serviceProviders: true,
  steps: [
    {
      id: '6.1', label: 'IN THE APP',
      do: 'Buy against a requirement, never against a hunch',
      why: `What to buy comes from what is selling and what is already committed. A purchase order that
does not name what caused it is a quantity nobody can trace back, and it is how stock quietly builds
up.`,
      done: 'Every purchase order names the requirement that caused it.',
    },
    {
      id: '6.2', label: 'IN THE APP',
      do: 'Match three documents before paying a supplier',
      why: `What you ordered, what arrived, and what you were billed for. Paying on the bill alone
means paying for what did not arrive, and it is the most common way money leaks out of a business
this size.`,
      done: 'No supplier payment is possible without the three agreeing, or a recorded approval of the difference.',
    },
    {
      id: '6.3', label: 'IN THE APP',
      do: 'Record a quality check with the person who did it',
      why: 'An anonymous pass cannot be investigated when the complaints arrive.',
      done: 'Every check names its checker, and rejected pieces are tracked to rework or to write-off.',
    },
    {
      id: '6.4', label: 'IN THE APP',
      do: 'Treat goods sitting in somebody else’s warehouse as your stock, in a location',
      why: `Stock you still own but that sits in a marketplace’s warehouse is a location like any
other. Anything else and it disappears from your books until it sells, which understates what you own
and hides it from ageing.`,
      done: 'Every location holding your goods appears in the stock figure, wherever it physically is.',
    },
    {
      id: '6.5', label: 'IN THE APP',
      do: 'Finish a sale at delivery, not at dispatch',
      why: `A sale is not done when it leaves. It is done when it arrives and the money is in. Cash
collected on delivery is money owed to you by the courier until it is settled, and treating dispatch
as completion overstates both revenue and cash.`,
      done: 'Money collected on delivery is tracked as owed until the courier settles it.',
    },
    {
      id: '6.6', label: 'IN THE APP',
      do: 'Work out what raw material to buy, and show the working',
      why: `Step 6.1 says buy against a requirement rather than a hunch. This is the requirement.

Buying from a feeling produces stockouts and dead stock in the same season, usually of different
materials. The calculation is not complicated and its value is that it can be **disagreed with** — a
number with its working shown is one a person can argue about, and a number without one only gets
overridden.`,
      table: {
        head: ['Term', 'What it is', 'Where it comes from'],
        rows: [
          ['**Committed**', 'Material the confirmed orders will consume', 'Open orders × what each design uses'],
          ['**In hand**', 'What is physically here, everywhere it is', 'Stock across every location, including goods at a job worker'],
          ['**On order**', 'Already bought, not yet arrived', 'Purchase orders not yet received against'],
          ['**Safety**', 'The cushion for this material', 'A setting per material, not one number for everything'],
          ['**Requirement**', 'Committed + Safety − In hand − On order', 'If it is not positive, buy nothing'],
        ],
      },
      note: `**When to order is a separate question from how much.** Order by the day the material is
needed **minus** that vendor’s own lead time — which is why lead time sits on the vendor record and is
measured rather than agreed. A requirement raised on the day it is needed is a requirement raised too
late.`,
      warn: `A design with no material consumption recorded contributes **nothing** to the requirement
and is listed as such, rather than being treated as needing none. Those two look identical in a total
and mean opposite things.`,
      change: 'Safety stock, lead time and reorder level are settings per material and per vendor, ' +
        'effective-dated. Changing one today does not restate what was bought last month.',
      done: 'Every purchase suggestion shows the five figures it came from, a design with no recorded consumption is named rather than silently counted as zero, and the timing comes from that vendor’s measured lead time.',
    },
  ],
};

/* ── Part 7 · money in ────────────────────────────────────────────────────── */

const P7 = {
  n: 7,
  title: 'Getting paid, and getting the books right',
  lead: `Marketplaces do not pay you what the invoice said. They deduct commission, fees and taxes,
and they get it wrong often enough that checking has to be automatic. And every one of those
movements has to reach the books by itself.`,
  accounting: true,
  deliverable: true,
  steps: [
    {
      id: '7.1', label: 'IN THE APP',
      do: 'Expect a specific amount for every order, before any payout arrives',
      why: `Without an expectation there is nothing to compare a payout against, and a short payment
looks identical to a correct one. The expectation is calculated from your own records at the moment
of sale.`,
      done: 'Every order carries what you expect to receive and when.',
    },
    {
      id: '7.2', label: 'IN THE APP',
      do: 'Match every payout line to its order, and name every difference',
      why: `A difference is either a legitimate deduction, or money you are owed. Both need naming.
Netting the whole payout to one number makes the second kind invisible, and it is invisible money you
never get back.`,
      done: 'Every payout line is matched, every difference is named, and anything owed becomes a claim with evidence attached.',
    },
    {
      id: '7.3', label: 'IN THE APP',
      do: 'Post everything to the books automatically, from the transaction',
      why: `Re-keying into accounts is where the two versions of the truth appear. Every sale,
purchase, payout and wage posts from the record that caused it, so the books and the operations can
never disagree.`,
      done: 'Every figure in the books can be clicked back to the transaction that created it.',
    },
    {
      id: '7.4', label: 'IN THE APP',
      do: 'Lock a period once it is filed, and correct it only by a recorded entry',
      why: `A closed month that can still change is a month you cannot rely on having filed correctly.
Corrections are made as new entries that say what they correct, never by editing history.`,
      done: 'A filed period cannot be edited, and every correction to it is a visible, dated entry.',
    },
    {
      id: '7.5', label: 'IN THE APP',
      do: 'Register an invoice with the portal before it is a valid invoice, above the threshold',
      why: `Over a turnover threshold, an invoice is not a document you issue — it is a document the
government registers. It is sent to the portal, comes back with a reference number and a code printed
on the face of it, and **an invoice above the threshold without one is not valid**, however correct
its arithmetic.

That changes the order of operations, which is the part that catches people out: registration happens
before the customer gets the invoice, not after.`,
      table: {
        head: ['Step', 'What has to be true'],
        rows: [
          ['Invoice raised', 'Every field the portal requires is present — a missing one fails there, not here'],
          ['Sent to the portal', 'Automatically, on issue, not as a batch somebody remembers'],
          ['Reference and code returned', 'Both stored against the invoice and printed on it'],
          ['Cancelled', 'Only within the window the portal allows; after that it is a credit note'],
          ['Portal unreachable', 'Queued and retried, and the invoice is held rather than sent out unregistered'],
        ],
      },
      note: `The transport document is a separate registration with its own validity and its own
cancellation window, and it is generated from the same invoice rather than re-entered. Re-entry is
where the two stop agreeing about what is on the lorry.`,
      warn: `Whether you are above the threshold is a **date-effective fact about your turnover**, not
a permanent setting. A business that crosses it mid-year starts registering from that date, and the
invoices before it stay valid exactly as issued.`,
      change: 'The threshold, and whether it applies to a company, are settings with dates. Nothing ' +
        'already issued moves when they change.',
      done: 'Above the threshold, no invoice reaches a customer without its reference and code, an unreachable portal holds the invoice rather than releasing it unregistered, and the transport document is generated from the invoice rather than typed again.',
    },
  ],
};

/* ── Part 8 · what the system refuses ─────────────────────────────────────── */

const P8 = {
  n: 8,
  title: 'What the system refuses to do',
  lead: `The half of the design that protects you. A feature list tells you what software does; this
tells you what it will not do even when doing it would be convenient — and that is the half a business
actually relies on.

Every one of these blocks the work rather than warning about it. A warning is something somebody
clicks past at six in the evening.`,
  gates: true,
  cascades: true,
  flows: true,
  steps: [
    {
      id: '8.1', label: 'WITH YOUR TEAM',
      do: 'Accept that a blocked run is the system working',
      why: `When a run stops because a rate is missing or a total does not tie, the instinct is to
override it and move on. That instinct is what produces a payroll nobody can reconcile three months
later. A blocked run is cheap; a wrong payment is not.`,
      done: 'Everybody who runs payroll understands that a refusal names a real problem, and knows where to look.',
    },
    {
      id: '8.2', label: 'WITH YOUR TEAM',
      do: 'Keep the roster out of anything that gets shared',
      why: `Names, salaries and personal details belong in your system, behind permissions — not in a
document, an export or a message. This guide itself contains no person’s name for exactly that
reason.`,
      done: 'No exported document or shared report carries a name against a salary.',
    },
  ],
};

/* ── Part 9 · changing anything ───────────────────────────────────────────── */

const P9 = {
  n: 9,
  title: 'Changing anything, at any time',
  lead: `The promise this whole design is built to keep. **You can add, edit or remove anything, the
moment you need to, and it takes effect at once.** No release, no developer, no ticket.

And the past does not move. Every change carries the date it starts from, so a month you already
closed comes out the same tomorrow as it did yesterday.`,
  terms: ['effective date', 'audit trail'],
  logs: true,
  dynamic: true,
  steps: [
    {
      id: '9.1', label: 'IN THE APP',
      do: 'Work the case where somebody leaves without notice',
      why: `This is not hypothetical and it is the reason the whole effective-dated design exists. A
master leaves on the 14th with no notice. A replacement is found and starts on the 15th. Both are
recorded the same morning.`,
      walkthrough: [
        'Mark the person who left as having ended, with the 14th as the date. **Their record is kept, not deleted** — every hour they worked, every piece they made and every rupee they were paid stays exactly as it was.',
        'Add the new person with the 15th as their start date, and give them the position.',
        'Set their rate, from the 15th.',
        'Reassign work in progress to them from the 15th.',
        'That is the whole change, and it took a few minutes.',
      ],
      table: {
        head: ['The question somebody asks later', 'The answer'],
        rows: [
          ['Last month’s payroll — did it move?', 'No. It resolves the rates and people that applied then.'],
          ['Who made the pieces finished on the 12th?', 'The person who left. Credited to them, permanently.'],
          ['Who made the pieces finished on the 16th?', 'The new person.'],
          ['Two people held one position — is that a conflict?', 'No. They held it at different times, and every record knows which.'],
          ['Can we delete the person who left?', 'No, and you would not want to — it would blank their history and change months already paid.'],
        ],
      },
      done: 'The change is made the same day, and a report for the previous month produces an identical figure before and after.',
    },
    {
      id: '9.2', label: 'IN THE APP',
      do: 'Change a rate for a past period you are correcting',
      why: `Sometimes a rate was recorded wrongly and the correction genuinely belongs in the past.
That is allowed — you set the date it should have applied from. The difference is that the change is
**deliberate and dated**, and everything affected is recalculated visibly rather than silently.`,
      done: 'A backdated correction shows exactly which periods it changed and by how much, before you confirm it.',
    },
    {
      id: '9.3', label: 'IN THE APP',
      do: 'Turn off the parts of the system you do not use',
      why: `You do not need everything. Turning a module off removes it from the menu and keeps every
record it ever held — tidying a menu never destroys data, and turning it back on later brings
everything back exactly as it was.`,
      done: 'The menu shows only what this business uses, and nothing was lost in making that true.',
    },
  ],
};

/* ── Part 10 · the rulebook ───────────────────────────────────────────────── */

const P10 = {
  n: 10,
  title: 'The rulebook that applies to you',
  lead: `Every rule states what happens **and what the system will never do instead**. The second half
is the part worth reading — it is what you are relying on when you are not looking.`,
  terms: ['database', 'table', 'schema', 'migration', 'backup', 'API', 'storage',
    'queue', 'model', 'provider', 'spend ceiling'],
  rulebook: true,
  rulebookFull: true,
  steps: [
    {
      id: '10.1', label: 'WITH YOUR TEAM',
      do: 'Decide which discretionary rules you want on',
      why: `Some rules are yours to choose — whether a price below a floor needs approval, whether a
credit sale reserves the limit at once. Others can never be switched off by anybody, because somebody
else relies on them.`,
      change: 'Turn a discretionary rule on or off any time, from a date. Transactions already posted are not re-judged against a rule that did not apply to them.',
      done: 'Every discretionary rule has been considered and set deliberately, rather than left at whatever it defaulted to.',
    },
  ],
};

/* ── Part 11 · what you are not locked into ───────────────────────────────── */
/* WHY THIS PART EXISTS
   This document carried 0 of the 19 technical layers and therefore none of the 57 named
   replacements. The easy defence is that a tenant does not choose the database — true, and
   beside the point. Not choosing it is exactly why the reader needs to know they are not
   trapped by it. A promise that a supplier can be changed without touching their work is a
   promise made TO them, so it is theirs to read and to check. */

const P11 = {
  n: 11,
  title: 'What you are not locked into',
  lead: `You do not choose any of the parts below — that is the platform’s job. You are entitled to
know what they are anyway, because every one of them names what could take its place.

**This is the promise: changing a supplier underneath you does not change your work.** Not your
screens, not your records, not your reports, not a rupee of anything already posted. *Neeche ka
saamaan badla toh bhi aapka kaam waisa ka waisa.*`,
  terms: ['database', 'backend', 'frontend', 'storage', 'queue', 'provider', 'fallback',
    'interface', 'adapter', 'cache', 'environment', 'uptime'],
  stack: true,
  steps: [
    {
      id: '11.1', label: 'WITH YOUR TEAM',
      do: 'Read the alternatives column, once, before you commit',
      why: `The question worth asking of any system you are about to run your business on is not
"what is it built with" — it is "what happens to me if that thing goes away, doubles its price or
changes its terms". Every layer answers that in writing, and each names at least two replacements
rather than one.`,
      done: 'Nothing your business depends on rests on a single supplier with no named replacement.',
    },
    {
      id: '11.2', label: 'WITH YOUR TEAM',
      do: 'Ask what a swap would actually cost you',
      why: `The honest answer is not always "nothing", and every layer says so in its own words —
some moves are a copy across, one or two are genuinely expensive. What is constant is that the swap
is a decision made on the platform side, and your records, your screens and your closed months are
untouched by it either way.`,
      done: 'You know which layer moves are cheap and which are not, and that none of them reach your data.',
    },
    {
      id: '11.3', label: 'IN THE APP',
      do: 'Take your data out whenever you want, without asking anybody',
      why: `The strongest form of not being locked in is being able to leave. Every list, every
report and every ledger exports in an ordinary format that opens in a spreadsheet, and the export is
a button you press yourself rather than a request somebody has to approve.`,
      change: 'Export any list at any time. Nothing is held back, and no export needs permission from the platform.',
      done: 'Every screen carrying a list can put that list in a file you own, in a format that opens without this software.',
    },
  ],
};

/* ── Part 12 · everything you get ─────────────────────────────────────────── */

const P12 = {
  n: 12,
  title: 'Everything you get, named',
  lead: `The whole list, not a count. A count tells you how much you are not being shown.

A **module** is a part of the business; an **app** is one screen and the work behind it. Every one of
them can be switched off for a business that does not need it, and switched back on later with
nothing lost — see Part 9.`,
  terms: ['industry pack'],
  apps: true,
  steps: [
    {
      id: '12.1', label: 'WITH YOUR TEAM',
      do: 'Mark the ones you will actually use in your first month',
      why: `Nobody starts with all of it, and starting with all of it is the usual reason an ERP
rollout stalls. Pick the handful that carry your daily work — the making side, people and pay,
selling, and the books — and switch the rest off until you want them.`,
      change: 'Turn any module or app on or off from a date. Turning one off hides a menu; it never destroys a record.',
      done: 'The menu shows what this business uses this month, and the rest is waiting rather than gone.',
    },
  ],
};


/* ── Part 13 · the content engine ─────────────────────────────────────────── */
/* The owner asked for this by name — "ai content engine all steps?" — and the answer at the time
   was eleven rules and no steps. The steps exist: Vastrangam_AI_Content_Engine.md carries the
   whole pipeline, phase by phase, and mktenant.js reads the phase headings OUT of that file at
   generation time rather than my retyping them here. So this part cannot drift from the engine it
   describes, and if a phase is added or renamed there it appears here on the next build. */

const P13 = {
  n: 13,
  title: 'Listings and content — the engine that writes them',
  lead: `Every design has to reach a customer as words and pictures: a listing on each marketplace,
a post, a reel, an advertisement, a description that ranks. Doing that by hand is where a catalogue
of several hundred designs quietly stops being listed at all.

**The engine is analysis-first, and that is the whole design.** It looks at the actual product before
it writes a word — category, colour, fabric, craft, occasion — and everything after that is built on
what it found rather than on a template with the name swapped. A description generated without
looking is the same description every time, and a marketplace ranks it accordingly.`,
  contentPhases: true,
  contentPhasesLead: `The pipeline, phase by phase, read from the engine's own specification at the
moment this document was generated:`,
  steps: [
    {
      id: '13.1', label: 'IN THE APP',
      do: 'Let it read the product before it writes about the product',
      why: `The preflight is not a formality. It decides the category, checks the design has not
already been written about in the same words, and picks the vocabulary — colour, fabric, craft,
occasion — from what is actually there. Skipping it produces text that is fluent, generic and
worthless, and the only way to tell the difference is to read it against the garment.`,
      warn: `If it cannot tell what the product is, it says so and stops. It does not write a
plausible description of a garment it could not identify — that is the one output that costs you
more than no output, because nobody checks the confident ones.`,
      done: 'Nothing is written before the product has been read, and a product it cannot identify produces a question rather than a paragraph.',
    },
    {
      id: '13.2', label: 'IN THE APP',
      do: 'Ask for the channel you want, and get only that',
      why: `A marketplace listing, a social post, a reel script and an advertisement are different
things with different rules, different lengths and different fields. Asking for one and receiving all
of them is not generosity — it is output nobody reads, and it buries the thing that was asked for.`,
      example: {
        head: ['You ask for', 'You get'],
        rows: [
          ['A marketplace listing', 'That marketplace’s own schema, its own field limits, nothing else'],
          ['A social post', 'The post, in the formats that channel takes'],
          ['A reel', 'The script, timed, with the music brief beside it'],
          ['The full pack', 'Every channel, and only when you asked for every channel'],
        ],
      },
      done: 'A request for one channel produces one channel’s output, in that channel’s own shape.',
    },
    {
      id: '13.3', label: 'IN THE APP',
      do: 'Refuse to publish anything with a placeholder in it',
      why: `A listing that goes out with a bracketed placeholder where the fabric should be is worse
than one that never went out. It is public, it is wrong, and it stays indexed. The check runs before
delivery rather than after, which is the difference between a gate and a report.`,
      note: `The same check catches a measurement that was never given, a colour the engine could not
name, and a claim about the product that nothing in the input supports. Each is reported by name.`,
      done: 'Nothing reaches a channel carrying a placeholder, an unnamed colour, an absent measurement or a claim the product data does not support.',
    },
    {
      id: '13.4', label: 'WITH YOUR TEAM',
      do: 'Keep the brand words yours, and changeable',
      why: `The three labels do not speak the same way, and the difference is the point of having
three. What each one sounds like is a setting — the tone, the vocabulary, the things it never says —
and it belongs to you rather than to whoever configured the engine first.`,
      change: 'Tone, vocabulary and the never-say list are settings per label, effective-dated. ' +
        'Changing them today does not rewrite what was already published.',
      done: 'Each label reads as itself, the difference is written down as settings rather than held in somebody’s head, and changing one changes nothing already live.',
    },
  ],
};

module.exports = { parts: [P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13] };

/* ── the gate on this file ────────────────────────────────────────────────── */
/* Names are checked here rather than in the generator so a failure names the step. The list is
   deliberately of SHAPES — a first-name-shaped word next to a pay word — rather than a list of
   actual names, because a list of the real names would put them in this file, which is the
   exact thing being prevented. */
/* THE CHECKER TAKES A PARTS LIST, RATHER THAN READING THIS FILE’S OWN.
   The onboarding runbook in tenantbuild.js addresses the same reader — no terminal, no person
   named, no rupee figure attached to anybody — and a second copy of these rules is how the two
   documents would start disagreeing about what is allowed. One checker, two parts lists. */
function checkParts(parts) {
  const bad = [];
  const ids = new Set();
  for (const p of parts) {
    if (typeof p.n !== 'number' || !p.title || !p.lead) bad.push(`part ${p.n}: missing n, title or lead`);
    for (const s of p.steps) {
      if (!s.done) bad.push(`step ${s.id}: no "done when" — that makes it a suggestion`);
      if (!s.do) bad.push(`step ${s.id}: no action`);
      if (!s.label) bad.push(`step ${s.id}: no label — a reader cannot tell where they do this`);
      if (ids.has(s.id)) bad.push(`step ${s.id}: duplicate id`);
      ids.add(s.id);

      /* A tenant has no terminal. A step that hands one a shell command is written for the
         wrong reader, and that is the error the first version of this document made. */
      if (s.cmd) bad.push(`step ${s.id}: carries a shell command — this reader has no terminal`);

      const prose = [s.do, s.why, s.note, s.warn, s.done, s.change].filter(Boolean).join(' ');

      /* Build-state language does not belong in a document describing a design. */
      const claim = /\b(works today|not built|already built|still pending)\b/i.exec(prose);
      if (claim) bad.push(`step ${s.id}: says "${claim[0]}" — this describes a design, so nothing in it is built or pending`);

      /* A rupee figure attached to a person is a salary in a shareable document. */
      if (/₹\s?[\d,]+\s*(per|a)\s*(month|day|hour)/i.test(prose)) {
        bad.push(`step ${s.id}: carries what reads as somebody’s pay — describe the rule, never the amount`);
      }

      if (/'/.test(prose)) bad.push(`step ${s.id}: straight apostrophe in prose — use the typographic ’`);
    }
  }
  return bad;
}

module.exports.checkParts = checkParts;
module.exports.check = function check() { return checkParts(module.exports.parts); };
