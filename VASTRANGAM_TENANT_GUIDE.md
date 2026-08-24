# Vastrangam — the tenant guide

**One business on Medhava: everything it runs on, and how it changes any of it.**

11 parts · 37 steps · compiled 2026-08-24

---

## What this document is

**This describes a design. Nothing in it exists yet, and nothing in it claims to.**

It is written for the business, not for the people building the software. **You install nothing** —
no server, no software, no technical person. Everything here happens in a browser or on a phone.

It carries everything this business actually runs on: the companies, the channels, the products and
what each set contains, how work is counted and paid, how people and attendance are handled, what the
system refuses to do, and the rules that apply. Nothing is left out on the grounds that it is
detail — the detail is where the money is.

**Every technical word is explained the first time it appears**, in plain language, with an everyday
comparison. No prior knowledge is needed anywhere.

### Where you do each thing

| | |
|---|---|
| `IN THE APP` | On a screen, by an administrator |
| `ON A PHONE` | By anybody, from a basic phone, in their own language |
| `WITH YOUR TEAM` | A decision or an agreement, not a screen |
| `OUTSIDE` | On somebody else’s website — a marketplace, a shop platform |

### The promise this whole design keeps

**You can change anything, at any time, and it takes effect at once. And the past does not move.**

Every change carries the date it starts from. So a supervisor can leave on Tuesday without notice, a
replacement start Wednesday morning, both recorded the same day — and last month’s payroll, already
paid, still comes out to the same rupee. *Purana record mitta nahin; naye date se naya rule lagta
hai.*

Part 9 works that exact case through, and lists all 18 things you can change and the 6
nobody can switch off.

### About people

**No person is named anywhere in this document.** Names, salaries and employment details live in your
system, behind permissions — not in a file that gets printed, emailed and forwarded. Every rule here
is described by its shape, which is what makes it a rule rather than a list.

---

## Part 0 · What you are on this platform

Medhava is the software. **You are one business using it** — the same way a business
uses Zoho or Odoo. You sign up, you take a plan, and you run your companies inside it.

That decides everything in this document. **You install nothing.** No server, no software on a
laptop, no technical person needed. Everything here happens in a browser or on a phone.

The businesses on either side of you look nothing like yours — a steel plant, a school, somebody
selling courses. Same software underneath. What makes it yours is the settings: your words, your
steps, your companies, your channels, and which parts of it you use at all.

> **platform** — One piece of software that many separate businesses use at the same time, each seeing only its own information. *Ek badi building jisme bahut saare offices hain. Building ek hai, par har office ki chaabi alag — koi kisi aur ke office mein nahin ghus sakta.*
>
> **tenant** — One business using the platform. Its people, its data and its settings are its own. *Us building mein ek office. Aapka office, aapka saamaan, aapka taala.*
>
> **module** — One area of work in the system — sales, purchase, staff, accounts. Each is a set of screens that belong together. *Dukaan ke alag-alag counters. Ek counter bikri ka, ek kharidi ka, ek hisaab-kitaab ka.*
>
> **role** — What a person is allowed to see and do — a manager sees more than a counter staff member. *Chaabi ka guccha. Manager ke paas zyada chaabiyaan, staff ke paas kam.*
>
> **permission** — One specific thing a role is allowed to do, like approving a discount or viewing salaries. *Guchhe ki ek chaabi. Ek chaabi ek darwaza.*

#### 0.1 · Understand the one thing that makes this different  `WITH YOUR TEAM`

Most business software gives you a fixed system and a support ticket. Here, the things
that make your business yours are **settings you control**, not code somebody has to change. That
means you are never waiting on a developer to run your business — and it also means the settings are
your responsibility to get right.

| You change this yourself, any time | This is the same for every business |
|---|---|
| What you call everything | That every record names its company |
| The steps your work moves through | That money is exact to the paisa |
| Extra fields on any record | That every change is recorded, permanently |
| Which parts of the system you use | That nobody else can read your data |
| Your companies, channels, godowns | The rules your books rely on |
| Your rates, your people, your roles | That nothing is ever truly deleted |

**Done when:** Whoever will administer this can say which column any given thing falls into.

#### 0.2 · Know which two addresses do what  `WITH YOUR TEAM`

Easy to confuse, and confusing them wastes a day. **`vastrangam.com` is your shop** — where
customers browse and buy. It is one of the ways you sell, and orders from it arrive here. **The
platform is where you run the business** — every order from every channel, the making, the stock, the
people, the books.

**Done when:** Everyone understands the shop is one channel feeding the system, not the system itself.

---

## Part 1 · Your companies

A company is a record you create. You have three today; the plan allows twenty, and the
software itself has no limit. A fourth opens the day you open it — no waiting, no upgrade, no call.

**Four things about a company are separate fields on purpose**, and collapsing any two of them is the
single most common modelling mistake in this whole system.

| Legal name | Trades as | Brand code | Invoice prefix |
|---|---|---|---|
| Vastrangam | Vastrangam | `VS` | `VS` |
| Ethnic Fashion | Go4Fashion | `GF` | `EF` |
| Adini | Adini Couture | `AC` | `AC` |

#### 1.1 · Create each company with its four identities kept apart  `IN THE APP`

Look at the middle line of the list above. The company has one legal name, trades under a
different name, marks its stock with a third code, and numbers its invoices with a fourth. If any two
of those were one field, its invoices would carry a name that is not its registered name — which is a
compliance problem, not a cosmetic one.

| Field | What it is | Where it shows |
|---|---|---|
| Legal name | The registered entity | Invoices, returns, contracts |
| Trading name | The name customers know | The shop, the packaging, marketing |
| Brand code | The short code on stock | SKUs, labels, stock reports |
| Invoice prefix | The letters before every document number | Invoice and voucher numbers |

**Changing it:** Add a company any time. Rename one any time — documents already issued keep the name they were issued under.

**Done when:** Every company exists with all four set separately, and a test invoice from each carries the right name and the right number.

#### 1.2 · Handle the company that has no registration of its own  `IN THE APP`

One of your companies does job work and has no registration. It still belongs in the group
figures — the work is real and the cost is real — but it must never be pulled into a return it does
not belong in. Those are two different questions and the system must answer them separately.

**Changing it:** Whether a company files its own returns is a setting on the company, changeable from a date — so the day it does get registered, you set it and nothing before that date moves.

**Done when:** The group total includes it, and no return anywhere includes it.

#### 1.3 · Check that trade between your own companies is removed from the group figure  `IN THE APP`

Selling stock from one of your companies to another is not group revenue. Counting it
means the group looks bigger than it is, and you are the person that number misleads.

**Done when:** The group total equals the sum of the companies minus trade between them, checked against one such transfer you can point at.

---

## Part 2 · Your channels — every way you sell

A channel is where a sale came from. You record one per company, so two of your companies can
each sell on the same marketplace and they stay separate, with figures that never merge.

**Stock stays one number per item.** Never split per channel. That single decision is what stops the
same piece being sold twice on two different marketplaces.

| Kind | What it is |
|---|---|
| `d2c` | Your own shop — `vastrangam.com` is this one |
| `marketplace` | A marketplace account. One for each marketplace, for each company |
| `b2b` | Wholesale, usually on credit terms |
| `export` | Overseas, with its own documents |
| `pos` | A counter, drawing on the same stock as the shop |
| `reseller` | Somebody selling on your behalf |

#### 2.1 · Add every route to market you actually use  `IN THE APP`

**Changing it:** A new marketplace is added in the app and selling the same day. Never a release, never a wait.

**Done when:** Every way you currently sell is recorded against the company that owns it.

#### 2.2 · Connect each selling account with a key, never a password  `OUTSIDE`

Every connection uses a key you create in that marketplace or shop, and can withdraw at
any time without changing anything else. **Nothing in this system will ever ask you for a marketplace,
bank or account password** — a password hands over an account you cannot take back or limit. If
anything ever asks, it is not us.

**Done when:** Every channel is connected with its own key, and you know where to withdraw each one.

#### 2.3 · Decide what happens when a channel goes quiet  `IN THE APP`

Marketplaces change their systems without telling anyone. When orders stop arriving from
one, that must be visible rather than silent — a channel that quietly stops feeding is a week of
missing sales nobody noticed.

**Done when:** A channel that has sent nothing for longer than it usually does raises a flag somebody sees.

---

## Part 3 · Your products, and what each set actually contains

This is the part most systems get wrong, and getting it wrong changes what you pay people.

You sell **sets**. A set is several pieces that go together, and different sets contain different
things. The critical fact: **you cannot tell what a set contains from its name.** An Anarkali Plazo
Set contains a dupatta. A Kurti Plazo Set does not. Neither name says so. Read the composition from
the name and you get one of them wrong whichever way you read it.

| Set type | What it contains | Designs checked |
|---|---|---|
| Anarkali Plazo Set | Top + Bottom + Dupatta | 41 |
| Kurti Plazo Set | Top + Bottom | 16 |
| Kurti Palazzo Set | Top + Bottom | 25 |
| Lehenga Choli Set | Top + Bottom | 34 |
| Co-Ords Set | Top + Bottom | 2 |
| Top Set | Top | 24 |
| Bottom Wear Set | Bottom | 8 |
| Dupatta Set | Dupatta | 2 |
| Kurta Set | Top | 1 |
| Readymade Blouse Set | Top | 1 |

**These were not read off the names.** Each one was checked against real production records
until only one composition reproduced every design. Two of them prove why that mattered:

- **Anarkali Plazo Set** — only Top+Bottom+Dupatta reproduces all 41. Taking Top+Bottom instead reports 1,400 sets for BinaRust where the file records 1,225.
- **Kurti Plazo Set** — only Top+Bottom reproduces all 16. Including the dupatta reports 194 sets for GreenKurtiPlazzo where the file records 854.


#### 3.1 · Record what each set type contains, as a list of slots  `IN THE APP`

Because the composition decides how many complete sets exist, and how many complete sets
decides what gets paid. This is not a description — it is an input to a payment.

**Changing it:** Add a set type, change what one contains, or retire one — any time, from a date. Sets already counted keep the composition that applied when they were counted.

**Done when:** Every set type you make has its slots recorded, and none of them was guessed from its name.

#### 3.2 · Understand the three separate dupatta columns  `WITH YOUR TEAM`

Your production report has **three different dupatta columns** — one for Anarkali Plazo,
one for Kurti Palazzo, one for Lehenga Choli — plus a standalone Dupatta Set column. A system with a
single dupatta slot cannot tell them apart, and would credit a Kurti Plazo design with a dupatta it
never had. The columns are separate because the garments are separate.

**Done when:** Whoever fills the production report knows which dupatta column belongs to which set type.

#### 3.3 · Know where the set type for a design comes from, and what happens when it is missing  `WITH YOUR TEAM`

The set type for a design comes from your rates master. When a design has no entry there,
the system works it out from which columns have numbers in them — checking in a fixed order, most
specific first — and **flags the result as worked out rather than known**. A flag is not a failure; it
is the system refusing to pretend it was told something it inferred.

| The set type for a design | How it is decided |
|---|---|
| **Where it normally comes from** | Your rates master — the design, its set, its attribute and its rate |
| **When that has no entry** | Worked out from which columns have numbers, checked most specific first |
| **The order checked** | Lehenga · Anarkali · Kurti Palazzo · Kurti Plazo · Co-Ords · single column |
| **What then happens** | The result is **flagged as worked out**, never presented as known |
| **Columns in the report** | 22, arranged in groups by set category |

The layout matters when somebody fills it in: Row 1 title (skip) · Row 2 set-category group labels (skip) · Row 3 garment-type labels · data from Row 4. Col A = Karigar, Col B = Design, Col C onward = the 23 columns.

**Changing it:** Add the design to the rates master and the flag disappears from that point on. Nothing already counted changes.

**Done when:** Every design either has a set type on record or is flagged as inferred, and somebody reviews the flagged list.

#### 3.4 · Carry the column-count discrepancy openly rather than resolving it by guess  `WITH YOUR TEAM`

Your own written specification says 23 garment columns in two places, and then lists 22 —
indices 2 to 23, columns C to X — with none unused. The system holds the 22 that are actually named.
If a 23rd exists in the real file it has never been named anywhere, and quietly inventing one would
silently mis-file whatever it holds.

**Done when:** Somebody who knows the original file confirms whether 22 is right. Until then it stays flagged, not smoothed over.

---

## Part 4 · The making side — counting and paying for work

The heart of the business, and the part with the most rules. Read this part slowly; every
line of it turns into somebody’s payment.

#### 4.1 · Understand that the paying unit is not the same as the person  `WITH YOUR TEAM`

Some units on your payroll are one person. Some are a team working under one name. The
unit is what earns, gets paid and carries an outstanding balance — and a unit that worked alone one
year and as a team the next is **the same unit with two labels**, each with the date it applied from.
Treating them as two units would split one balance in half.

**Changing it:** A unit can change its label and its members from a date. Both the old and the new are kept, so a report for either period shows what it was called then.

**Done when:** Every paying unit exists once, with its label history, and its outstanding balance is continuous across a change of composition.

#### 4.2 · Count a complete set as the smallest of its slots — never the smallest of whatever was made  `WITH YOUR TEAM`

**The most important calculation in the business.** If a set needs a top, a bottom and a
dupatta, then 100 tops, 90 bottoms and 40 dupattas is **40 complete sets** — the dupatta is the
bottleneck. Counting the smallest of whatever happened to be produced, instead of the smallest of what
the set actually requires, gets a different answer for any design where a slot was never populated at
all.

| Made | Top | Bottom | Dupatta | Complete sets |
|---|---|---|---|---|
| Anarkali Plazo Set — needs all three | 100 | 90 | 40 | **40** |
| Kurti Plazo Set — needs two | 100 | 90 | — *(not part of this set)* | **90** |

**Done when:** The set count for every design uses that design’s recorded composition, and a check proves it rather than assuming it.

#### 4.3 · Price every row from its own rate, and refuse the row that has none  `IN THE APP`

Every line of work carries its own rate, resolved for the date it was done. When a rate is
missing, the system **stops and names the row** — it does not fall back to a similar rate, an average,
or zero. A guessed rate is a wrong payment to a real person, and it is discovered weeks later by that
person.

**Changing it:** Rates are changed from a date. Work already priced keeps the rate that applied when it was done.

**Done when:** A row with no rate blocks the run and names itself. Nothing is ever priced at zero for want of a rate.

#### 4.4 · Never merge two similar names automatically  `WITH YOUR TEAM`

Two spellings of a name might be one unit or might be two. The system proposes a match and
**never applies one by itself**, because merging two people who are different silently combines two
balances and is very hard to untangle afterwards. Once you answer, the answer is stored — so you are
asked once, not every month.

**Done when:** Every proposed merge was decided by a person, and the decision is recorded so it is never asked twice.

---

## Part 5 · People, attendance and pay

Three ways of being paid, and the rules that keep them apart. **Nobody is named in this
document** — the roster is yours and stays in your system, not in a file that gets emailed around.

**3 ways of being paid**, and a person can move between them — from a date, never
backwards by accident.

| Basis | How the figure is reached |
|---|---|
| **Attendance** | Resolved from the days and the attendance recorded for the period, against the rate in force on those dates. |
| **Flat** | A fixed amount for the period, whatever the hours. Hours are recorded and reported, and never scale the pay. |
| **Piece-rate** | Defined by your own rules for this basis. |

Each person’s basis is held as a small history — what it became, and the date it started
applying — so asking "what was this person on in March" has an exact answer rather than requiring
somebody to remember.

#### 5.1 · Set each person’s pay basis, from a date  `IN THE APP`

A person can move from one basis to another — and when they do, the change applies from
its date and not before. A basis that applied backwards would rewrite months already paid.

**Changing it:** Change a basis any time, choosing the date it starts. Every earlier month recalculates to the basis that applied then.

**Done when:** Running last month twice, before and after a basis change, gives the same figure both times.

#### 5.2 · Keep hours informational — never let them scale a month’s pay  `WITH YOUR TEAM`

Hours are recorded and reported because they are useful to know. They do not multiply
anybody’s pay. There is exactly one figure that pays, per basis, and everything downstream —
allocation, reconciliation, outstanding — reads that one figure and nothing else. Two ways of pricing
the same month is how two departments end up with two different totals.

**Done when:** One paying figure per person per month, and every downstream report traces to it.

#### 5.3 · Treat "no match" as an error, never as zero  `WITH YOUR TEAM`

**The single most dangerous default in payroll software.** When the system cannot find
what applied — no salary on record, no rate for a category, no hours reference — it must stop and say
so. Treating a missing value as zero pays somebody nothing and looks exactly like a correct run.

**Done when:** Every missing value stops the run and names what is missing and for whom. No run completes with a silent zero in it.

#### 5.4 · Separate the three states a blank month can mean  `WITH YOUR TEAM`

A month with nothing recorded can mean three completely different things, and merging them
misreports people badly: the person was not employed then, or they were employed and the record is
missing, or they were employed and genuinely did no work. Only the middle one is a problem to chase.

| A blank month means | What it is | What to do |
|---|---|---|
| Outside their employment dates | Not a gap at all | Nothing — they were not there |
| Inside employment, nothing recorded | A tracking gap | Find out what happened |
| Inside employment, recorded as none | A real zero | Nothing — it is the truth |

**Done when:** The three are reported separately, and nobody appears in a failure list for a month they were not employed.

#### 5.5 · Record advances against the unit, and settle them at payout  `IN THE APP`

An advance is money already given. It has to reduce what is due without disappearing from
the record, so both the person and you can see what was taken and what remains.

**Changing it:** Record an advance at any moment, from a phone. It affects the next payout immediately.

**Done when:** Every payout shows what was earned, what was advanced, and what was paid — and the three reconcile.

#### 5.6 · Let the shop floor report without opening a computer  `ON A PHONE`

The people making the product do not sit at a desk. A short message becomes a real record:
attendance with the time and place it was marked, production against the design, a request in the
approvals list. Anything that requires a laptop simply does not get recorded, and ends up on paper.

> **Careful.** Attendance marked outside the unit’s area is **flagged for a manager, never refused**. A
> system that locks somebody out of being paid because they stood at the wrong gate has failed at its
> job. Every override is recorded with who made it.

**Done when:** A worker can mark attendance and report production from a basic phone, in their own language.

---

## Part 6 · Buying, checking, storing, sending

The chain from raw material to a parcel at somebody’s door. Each step hands to the next, and
none of them requires anyone to re-type what the previous one already knows.

#### 6.1 · Buy against a requirement, never against a hunch  `IN THE APP`

What to buy comes from what is selling and what is already committed. A purchase order that
does not name what caused it is a quantity nobody can trace back, and it is how stock quietly builds
up.

**Done when:** Every purchase order names the requirement that caused it.

#### 6.2 · Match three documents before paying a supplier  `IN THE APP`

What you ordered, what arrived, and what you were billed for. Paying on the bill alone
means paying for what did not arrive, and it is the most common way money leaks out of a business
this size.

**Done when:** No supplier payment is possible without the three agreeing, or a recorded approval of the difference.

#### 6.3 · Record a quality check with the person who did it  `IN THE APP`

An anonymous pass cannot be investigated when the complaints arrive.

**Done when:** Every check names its checker, and rejected pieces are tracked to rework or to write-off.

#### 6.4 · Treat goods sitting in somebody else’s warehouse as your stock, in a location  `IN THE APP`

Stock you still own but that sits in a marketplace’s warehouse is a location like any
other. Anything else and it disappears from your books until it sells, which understates what you own
and hides it from ageing.

**Done when:** Every location holding your goods appears in the stock figure, wherever it physically is.

#### 6.5 · Finish a sale at delivery, not at dispatch  `IN THE APP`

A sale is not done when it leaves. It is done when it arrives and the money is in. Cash
collected on delivery is money owed to you by the courier until it is settled, and treating dispatch
as completion overstates both revenue and cash.

**Done when:** Money collected on delivery is tracked as owed until the courier settles it.

---

## Part 7 · Getting paid, and getting the books right

Marketplaces do not pay you what the invoice said. They deduct commission, fees and taxes,
and they get it wrong often enough that checking has to be automatic.

#### 7.1 · Expect a specific amount for every order, before any payout arrives  `IN THE APP`

Without an expectation there is nothing to compare a payout against, and a short payment
looks identical to a correct one. The expectation is calculated from your own records at the moment
of sale.

**Done when:** Every order carries what you expect to receive and when.

#### 7.2 · Match every payout line to its order, and name every difference  `IN THE APP`

A difference is either a legitimate deduction, or money you are owed. Both need naming.
Netting the whole payout to one number makes the second kind invisible, and it is invisible money you
never get back.

**Done when:** Every payout line is matched, every difference is named, and anything owed becomes a claim with evidence attached.

#### 7.3 · Post everything to the books automatically, from the transaction  `IN THE APP`

Re-keying into accounts is where the two versions of the truth appear. Every sale,
purchase, payout and wage posts from the record that caused it, so the books and the operations can
never disagree.

**Done when:** Every figure in the books can be clicked back to the transaction that created it.

#### 7.4 · Lock a period once it is filed, and correct it only by a recorded entry  `IN THE APP`

A closed month that can still change is a month you cannot rely on having filed correctly.
Corrections are made as new entries that say what they correct, never by editing history.

**Done when:** A filed period cannot be edited, and every correction to it is a visible, dated entry.

---

## Part 8 · What the system refuses to do

The half of the design that protects you. A feature list tells you what software does; this
tells you what it will not do even when doing it would be convenient — and that is the half a business
actually relies on.

Every one of these blocks the work rather than warning about it. A warning is something somebody
clicks past at six in the evening.

**15 checks, and every one of them blocks the work rather than warning about it.**

| The check | What it will not let through |
|---|---|
| `logs resolve once` | Every mandatory log gives exactly one row for every employed staff-month |
| `components tie to design` | Sum of a design's component values equals its raw recorded total |
| `earnings tie to source` | Karigar earnings equal the sum of the rows actually parsed |
| `combined equals periods` | The combined column is the sum of each period's columns, per unit |
| `allocation ties to payroll` | Allocated cost plus unallocated labour is the payroll, exactly |
| `nothing dropped` | Every source row is either matched or in Needs Review. None vanish |
| `no formula errors` | No error token and no broken reference anywhere in the output workbook |
| `no person names in logic` | The gate that keeps the engine data-independent |
| `hours reference covers everyone` | Every person's category resolves to an Hours Reference row |
| `flat staff are flat` | A Flat month earns exactly the salary in force — never more, never less |
| `piece rate never uses salary` | Piece-rate staff draw their rate from the work report, never Staff Master |
| `reconciliation matches summary` | FY earning in the reconciliation equals the sum of that person's months |
| `roster is explained` | Anyone Inactive but working, or working but not in Master, is listed |
| `rows price themselves` | Quantity times rate equals the value recorded on the row |
| `bottleneck uses the set composition` | No design's set count exceeds any slot the set actually requires |

#### 8.1 · Accept that a blocked run is the system working  `WITH YOUR TEAM`

When a run stops because a rate is missing or a total does not tie, the instinct is to
override it and move on. That instinct is what produces a payroll nobody can reconcile three months
later. A blocked run is cheap; a wrong payment is not.

**Done when:** Everybody who runs payroll understands that a refusal names a real problem, and knows where to look.

#### 8.2 · Keep the roster out of anything that gets shared  `WITH YOUR TEAM`

Names, salaries and personal details belong in your system, behind permissions — not in a
document, an export or a message. This guide itself contains no person’s name for exactly that
reason.

**Done when:** No exported document or shared report carries a name against a salary.

---

## Part 9 · Changing anything, at any time

The promise this whole design is built to keep. **You can add, edit or remove anything, the
moment you need to, and it takes effect at once.** No release, no developer, no ticket.

And the past does not move. Every change carries the date it starts from, so a month you already
closed comes out the same tomorrow as it did yesterday.

> **effective date** — The date a change starts applying from. Records made before it keep the old value; records after it use the new one. *Naya rate 1 tarikh se lagu. Purane mahine ka bill purane rate se hi banega — woh apne aap nahin badlega.*
>
> **audit trail** — An automatic record of every change — what changed, who changed it, and when. *Har entry ke saath naam aur time apne aap likha jaata hai. Baad mein koi bole "maine nahin kiya", toh register bata deta hai.*

### People

| What you change | Who can | What happens at once | What happens to old records |
|---|---|---|---|
| Somebody joins — a worker, a supervisor, an office staff member, a contractor | Admin, or an HR role | They exist from their start date and can be assigned work the same minute. | Nothing before their start date mentions them, because they were not there. |
| Somebody leaves, with or without notice | Admin, or an HR role | Marked as left from a date. Their sign-in stops, and no new work is assigned to them. Their record is kept, not deleted. | Every hour they worked, every piece they made and every rupee they were paid stays exactly as it was. Deleting the person would blank all of it and change months already closed — so the record remains and simply has an end date. |
| A replacement starts immediately, in the same position | Admin, or an HR role | Added with their own start date and given the position. Work in progress is reassigned to them from that date. No waiting, no release, no developer. | Work completed under the previous person stays credited to the previous person. Two people held the same position at different times, and every record knows which one applied when. |
| A pay rate, a piece rate or a salary changes | Admin, or an HR role | Applies from the date you set — which may be today, a future date, or a past one you are correcting. | Every completed period recalculates to the rate that applied then, not the new one. This is the single most important line in this register: a rate that silently applied backwards would change payments already made to real people. |
| What somebody is allowed to see and do | Admin | Takes effect on their next action. Screens they may no longer open stop opening. | Everything they did while they held the old permissions stays recorded, with the permissions they had at the time. |

### Structure

| What you change | Who can | What happens at once | What happens to old records |
|---|---|---|---|
| A new company is opened, or an existing one is closed | Admin | It exists immediately with its own name, trading name, code and document numbering. The group view includes it from that date. | Group figures for earlier periods are unchanged, because the company did not exist in them. |
| A new way of selling is added — a marketplace, a shop, a counter, an export desk | Admin | Orders can arrive through it the same day. It appears in every report that breaks figures down by channel. | Earlier reports keep their own columns. A channel that did not exist then does not appear then. |
| A godown, a shop, a unit or a stock point is added, renamed or closed | Admin | Stock can move to and from it immediately. | Stock movements already recorded keep pointing at it, under the name it had at the time. |
| Which parts of the system this business uses at all | Admin | Turned on, a module appears in the menu with its screens ready. Turned off, it disappears from the menu. A steel plant, a clothing brand and a single creator each end up with a different system built from identical code. | Turning a module off hides its screens and keeps its records. Nothing is destroyed by tidying a menu. |

### Your words

| What you change | Who can | What happens at once | What happens to old records |
|---|---|---|---|
| What the system calls things | Admin | Every screen, every report and every document changes wording at once. One business says order, another says job, another says matter, consignment, batch or booking — the record underneath is identical. | Documents already issued keep the wording they were issued with, because that is what the customer received. |
| Extra information you want to record that nobody else needs | Admin | Added to the screen immediately, with the type you choose — text, number, date, a list to pick from, a yes or no. Reportable from the moment it exists. | Older records simply have no value for it, which is the truth. They are never back-filled with a guess. |
| The steps your work moves through | Admin | Add a stage, rename one, reorder them or remove one. New work follows the new list from that moment. | Work already part-way through keeps the stage it is in, even if that stage has since been removed — a job does not teleport because somebody edited a list. |
| The layout and numbering of invoices, statements, labels and reports | Admin | The next document uses the new layout or the new numbering. | Documents already issued are never re-rendered. What the customer holds and what you hold stay identical. |

### Rules

| What you change | Who can | What happens at once | What happens to old records |
|---|---|---|---|
| Turning a discretionary rule on or off | Admin | Applies to the next transaction. One business requires an approval below a price floor; another does not — same software, different setting. | Transactions already posted are not re-judged against a rule that did not apply to them. |
| Who has to approve what, and above which amount | Admin | The next request follows the new path. | Requests already approved keep the path they went through, and the names of who approved them. |
| Tax rates and the categories they attach to | Admin, or an accounts role | Applies from its effective date, which for tax is set by law rather than by you. | Every invoice keeps the rate that applied on its own date. A return filed for an earlier period recalculates to that period’s rate — this is not a convenience, it is the only correct behaviour. |
| Which outside service is used for messages, payments, delivery or artificial intelligence | Admin | The next message, payment or shipment goes through the new one. | Everything already sent keeps the record of which service carried it, which is what you need when you query one. |
| The most the system may spend on paid outside services | Admin | Enforced immediately. Over the ceiling, the paid option is refused and the work completes on one that costs nothing. | Spending already recorded is unchanged. |

### What nobody can switch off

Short on purpose. Every line is something your bank, your auditor, your customer or your
own staff is relying on — a setting that could remove it would remove their protection with it.

| Never changeable | Why |
|---|---|
| The audit trail | Who changed what, and when. A system where this can be switched off cannot be used to answer a dispute, so it cannot be switched off. |
| Every record naming the company it belongs to | Without it, figures from two companies merge and no report can be trusted again. |
| One business being unable to read another’s records | This is not a preference. It is the promise that makes a shared platform usable at all. |
| Money kept as exact whole units | The alternative loses fractions of a rupee in ways nobody can trace afterwards. |
| Deleting nothing — records are ended, never erased | An erased record changes a period that was already closed, filed and possibly audited. |
| Never asking for a marketplace, bank or account password | The system connects through proper keys that you can withdraw. A password would hand over an account you cannot take back. |


#### 9.1 · Work the case where somebody leaves without notice  `IN THE APP`

This is not hypothetical and it is the reason the whole effective-dated design exists. A
master leaves on the 14th with no notice. A replacement is found and starts on the 15th. Both are
recorded the same morning.

**Step by step:**

1. Mark the person who left as having ended, with the 14th as the date. **Their record is kept, not deleted** — every hour they worked, every piece they made and every rupee they were paid stays exactly as it was.
2. Add the new person with the 15th as their start date, and give them the position.
3. Set their rate, from the 15th.
4. Reassign work in progress to them from the 15th.
5. That is the whole change, and it took a few minutes.

| The question somebody asks later | The answer |
|---|---|
| Last month’s payroll — did it move? | No. It resolves the rates and people that applied then. |
| Who made the pieces finished on the 12th? | The person who left. Credited to them, permanently. |
| Who made the pieces finished on the 16th? | The new person. |
| Two people held one position — is that a conflict? | No. They held it at different times, and every record knows which. |
| Can we delete the person who left? | No, and you would not want to — it would blank their history and change months already paid. |

**Done when:** The change is made the same day, and a report for the previous month produces an identical figure before and after.

#### 9.2 · Change a rate for a past period you are correcting  `IN THE APP`

Sometimes a rate was recorded wrongly and the correction genuinely belongs in the past.
That is allowed — you set the date it should have applied from. The difference is that the change is
**deliberate and dated**, and everything affected is recalculated visibly rather than silently.

**Done when:** A backdated correction shows exactly which periods it changed and by how much, before you confirm it.

#### 9.3 · Turn off the parts of the system you do not use  `IN THE APP`

You do not need everything. Turning a module off removes it from the menu and keeps every
record it ever held — tidying a menu never destroys data, and turning it back on later brings
everything back exactly as it was.

**Done when:** The menu shows only what this business uses, and nothing was lost in making that true.

---

## Part 10 · The rulebook that applies to you

Every rule states what happens **and what the system will never do instead**. The second half
is the part worth reading — it is what you are relying on when you are not looking.

**285 rules across 22 modules.** Every one says what happens *and* what the
system will never do instead.

| # | Module | Rules |
|---|---|---|
| 01 | Platform | 25 |
| 02 | Design & Sampling | 7 |
| 03 | Inventory & Catalog | 14 |
| 04 | CRM | 9 |
| 05 | Sales | 18 |
| 06 | Planning & Requirements (MRP) | 8 |
| 07 | Purchase | 12 |
| 08 | Manufacturing | 20 |
| 09 | Quality & Compliance | 7 |
| 10 | Warehouse | 8 |
| 11 | Logistics | 11 |
| 12 | Accounting & GST | 24 |
| 13 | Treasury & Financial Planning | 8 |
| 14 | Settlement | 13 |
| 15 | E-commerce / OMS | 19 |
| 16 | HR & Payroll | 22 |
| 17 | Marketing | 10 |
| 18 | AI Content Engine | 11 |
| 19 | SEO, AEO & AIO | 6 |
| 20 | Projects & Collaboration | 9 |
| 21 | Dashboard & BI | 9 |
| 22 | AI Assistant, Agents & Automation | 15 |

#### 10.1 · Decide which discretionary rules you want on  `WITH YOUR TEAM`

Some rules are yours to choose — whether a price below a floor needs approval, whether a
credit sale reserves the limit at once. Others can never be switched off by anybody, because somebody
else relies on them.

**Changing it:** Turn a discretionary rule on or off any time, from a date. Transactions already posted are not re-judged against a rule that did not apply to them.

**Done when:** Every discretionary rule has been considered and set deliberately, rather than left at whatever it defaulted to.

---

*Generated by `brand/delivery/website/mktenant.js` from `brand/site/tenant.js` and this
business’s own recorded logic — the companies, the channel kinds, the set compositions, the column
layout, the pay bases and the refusal checks are all read from source at generation time, never
retyped. Nothing here is maintained by editing this file: edit the source and regenerate.*
