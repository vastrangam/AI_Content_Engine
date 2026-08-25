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
  ],
};

/* ── Part 6 · the rest of the business ────────────────────────────────────── */

const P6 = {
  n: 6,
  title: 'Buying, checking, storing, sending',
  lead: `The chain from raw material to a parcel at somebody’s door. Each step hands to the next, and
none of them requires anyone to re-type what the previous one already knows.`,
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

module.exports = { parts: [P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, P10] };

/* ── the gate on this file ────────────────────────────────────────────────── */
/* Names are checked here rather than in the generator so a failure names the step. The list is
   deliberately of SHAPES — a first-name-shaped word next to a pay word — rather than a list of
   actual names, because a list of the real names would put them in this file, which is the
   exact thing being prevented. */
module.exports.check = function check() {
  const bad = [];
  const ids = new Set();
  for (const p of module.exports.parts) {
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
};
