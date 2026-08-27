# Vastrangam — the build guide

**Setting this business up on Medhava, in order: from signing up to running live.**

10 parts · 40 steps · compiled 2026-08-27

---

## What this document is

**This describes a design. Nothing in it exists yet, and nothing in it claims to.**

It is the ordered path. Part 0 is the half-hour before anybody opens a screen; Part 9 is the daily
rhythm once setup is finished. In between: your companies, your channels, your people, your products
and what a set contains, the making side, buying, selling, and the first month end run deliberately
on a month you already know the answer to.

**You install nothing** — no server, no software, no technical person. Everything here happens in a
browser or on a phone.

**It does not repeat the rules.** Where a step depends on a calculation — how a month’s pay is
computed, when a set counts as complete, how a unit’s outstanding balance is arrived at — this
document says what the step decides and leaves the arithmetic to *Vastrangam — the rules
and logic*, which carries all 285 rules and every formula in full. Two copies of a formula is
how two documents start disagreeing about somebody’s wages.

**Every technical word is explained the first time it appears**, in plain language, with an everyday
comparison. No prior knowledge is needed anywhere.

### The promise this whole design keeps

**You can change anything, at any time, and it takes effect at once. And the past does not move.**

Every change carries the date it starts from. So a supervisor can leave on Tuesday without notice, a
replacement start Wednesday morning, both recorded the same day — and last month’s payroll, already
paid, still comes out to the same rupee. *Purana record mitta nahin; naye date se naya rule lagta
hai.*

### Where you do each thing

| | |
|---|---|
| `IN THE APP` | On a screen, by an administrator |
| `ON A PHONE` | By anybody, from a basic phone, in their own language |
| `WITH YOUR TEAM` | A decision or an agreement, not a screen |
| `OUTSIDE` | On somebody else’s website — a marketplace, a shop platform |

### About people

**No person is named anywhere in these documents.** Names, salaries and employment details live in
your system, behind permissions — not in a file that gets printed, emailed and forwarded. Every rule
here is described by its shape, which is what makes it a rule rather than a list.

### One thing that is never asked of you

**This system will never ask you for a marketplace, bank or account password.** Every outside
connection uses a key you create on the other service and can withdraw from the other service. If
anything ever asks you for one of those passwords, it is not this platform.

---

## Part 0 · Before you open anything — the four decisions

Half an hour with the people who actually know, before a single screen is opened. Not
because the system needs it — every one of these can be changed later, from the app, with the past
left intact — but because deciding them in front of a form is how they get decided badly.

**Nothing here is permanent.** That is the point of writing them down now: you will change some of
them, and when you do you will want to know what you originally meant.

> **platform** — One piece of software that many separate businesses use at the same time, each seeing only its own information. *Ek badi building jisme bahut saare offices hain. Building ek hai, par har office ki chaabi alag — koi kisi aur ke office mein nahin ghus sakta.*
>
> **tenant** — One business using the platform. Its people, its data and its settings are its own. *Us building mein ek office. Aapka office, aapka saamaan, aapka taala.*
>
> **module** — One area of work in the system — sales, purchase, staff, accounts. Each is a set of screens that belong together. *Dukaan ke alag-alag counters. Ek counter bikri ka, ek kharidi ka, ek hisaab-kitaab ka.*
>
> **role** — What a person is allowed to see and do — a manager sees more than a counter staff member. *Chaabi ka guccha. Manager ke paas zyada chaabiyaan, staff ke paas kam.*
>
> **permission** — One specific thing a role is allowed to do, like approving a discount or viewing salaries. *Guchhe ki ek chaabi. Ek chaabi ek darwaza.*

#### 0.1 · Decide which businesses are separate companies and which are one  `WITH YOUR TEAM`

A company is the unit that owns records, issues its own documents and closes its own
books. Two brands that share a bank account, a GST registration and a set of books are one company
with two brands. Two that file separately are two companies, even if the same people run both.
Getting this wrong is the one setup mistake that is genuinely awkward to unwind, because it is the
line every later report is drawn along.

| Ask | If the answer is yes |
|---|---|
| Does it file its own returns? | A separate company |
| Does it issue invoices under its own name and number series? | A separate company |
| Does it close its own books? | A separate company |
| Is it just a different name on the same books? | A brand, not a company |

**Changing it:** A company can be added at any time and starts empty. Companies are never merged after the fact — the correct move is to stop using one from a date, which keeps its history readable.

**Done when:** Every business you run is on one of the two lists, and somebody can say why for each.

#### 0.2 · List every way you sell, without worrying how many there are  `WITH YOUR TEAM`

A marketplace, a shop platform, a website, a shop counter, a dealer, an export buyer —
each is a channel, and a channel is a row you add. There is no number to get right and no ceiling to
plan around. Six today and ten next season needs no change to anything, and neither does dropping
one in between.

**Changing it:** Add, rename or stop a channel from a date, in the app. Orders already taken on it keep pointing at it, so last season still reports correctly.

> The reason this is worth writing down at all is not the count — it is that two companies
> may both sell on the same marketplace, and those are two different channels with two different
> settlement accounts. A channel belongs to a company.

**Done when:** Every route to a customer is on the list, each one attached to the company that sells through it.

#### 0.3 · Agree what your words are, before the system offers you its own  `WITH YOUR TEAM`

The system will happily call things whatever it calls them by default, and in six months
half your staff will be using its words and half yours, in the same conversation. Deciding early
costs nothing; deciding late means retraining people.

| The system’s default | What you may call it |
|---|---|
| Work order | Whatever your floor already says |
| Component | The piece of a set — top, bottom, dupatta |
| Contractor unit | The team, by the name it is known by |
| Stage | The step in your own making sequence |

**Changing it:** Any label, any time, from the settings screen. It changes on every screen at once, for your business only, and nothing already recorded moves.

**Done when:** The words your staff already use are written down, and nobody has to translate.

#### 0.4 · Name who is allowed to do what — especially who may close a month  `WITH YOUR TEAM`

Most permissions are obvious and can be adjusted casually. One is not: closing an
accounting period is the action that stops anybody editing what is inside it. That is exactly what
makes it valuable and exactly what makes it worth restricting to people who understand what they are
freezing.

> **Careful.** Nobody, at any permission level, can switch off the record of who changed what. That is
> one of the things this platform does not make optional, because a business that can edit away the
> evidence of an edit has no evidence at all.

**Done when:** Every role has a person, every person has a role, and closing a period is restricted to the people who should be doing it.

---

## Part 1 · Day one — signing up, and your companies

You sign up the way you would for any other business software: an email, a plan, a
password of your own choosing. Nothing is installed and nothing is downloaded.

**You will never be asked for a marketplace, bank or account password. Not here, not later, not by
support.** Every outside connection this system makes uses a key you create on the other service and
can withdraw from the other service. If anything ever asks you for a marketplace password, it is not
this platform.

The companies below are the ones this business runs today. They are rows, added in
the app, and the list is neither fixed nor a limit.

| Legal name | Trades as | Brand code | Invoice prefix |
|---|---|---|---|
| Vastrangam | Vastrangam | `VS` | `VS` |
| Ethnic Fashion | Go4Fashion | `EF` | `EF` |
| Adini | Adini Couture | `AC` | `AC` |

#### 1.1 · Create the account and choose the plan  `IN THE APP`

The plan decides how many companies and how many people you can have on the system, and
nothing else — every module and every rule is the same on every plan. There is no version of this
where a feature is withheld until you upgrade.

**Changing it:** Move up or down a plan at any time. Moving down when you are over the limit tells you what is over, rather than choosing something to remove for you.

**You should see:** an empty account, with one administrator — you — and nothing else in it.

**Done when:** You can sign in, and you are the administrator.

#### 1.2 · Add your first company, with the details that appear on a document  `IN THE APP`

A company carries the legal name, the trading name, the registered address, the tax
registration and the document number series. These are what get printed on an invoice, so they are
worth entering carefully once rather than correcting on a customer’s copy later.

**Have ready:**

- The legal name, exactly as registered
- The trading name, if it differs — this is what customers know you as
- The registered address and the place of supply
- The tax registration number for that state
- How your invoice numbers should look, and what they should start at

**Changing it:** Every field is editable from a date. A changed address applies to documents issued from that date on; the ones already issued keep the address they were issued with, which is what makes them still valid.

**You should see:** the company on your list, with a short code beside it. That code is what prefixes its documents and its product numbers, so a person holding a printed invoice can tell which company issued it without reading the letterhead.

**Done when:** One company exists, its details are what you would want printed on a customer’s invoice, and its number series starts where you want it to.

#### 1.3 · Add the rest of your companies, and say which ones trade with each other  `IN THE APP`

Where one of your companies sells to another, that sale is real for each of them and is
not a sale for the group. The system needs to know the pair to remove it from the group figure. Say
so now and every group report is right from the first month; say so later and you will be correcting
a number somebody has already seen.

**Changing it:** Mark a pair as trading with each other, or stop marking them, from a date.

**You should see:** a group total that is the sum of the companies minus what they sold each other — and both companies still showing their own full figures, because each of them really did make that sale.

**Done when:** Every company exists, and any pair that invoices each other is marked as such.

---

## Part 2 · Your channels — every way an order can reach you

A channel is one route from a customer to you. Add one for each, attached to the company
that sells through it. There is no correct number of these and no ceiling — the group figure is the
sum across whatever exists.

The kinds a channel can be are the ones the system itself recognises, read from
its own settings:

| Kind | What it is |
|---|---|
| `d2c` | Your own shop — `vastrangam.com` is this one |
| `marketplace` | A marketplace account. One for each marketplace, for each company |
| `b2b` | Wholesale, usually on credit terms |
| `export` | Overseas, with its own documents |
| `pos` | A counter, drawing on the same stock as the shop |
| `reseller` | Somebody selling on your behalf |

#### 2.1 · Add each channel, under the company that sells through it  `IN THE APP`

Two of your companies may both sell on the same marketplace under different seller
accounts. Those are two channels, not one, and keeping them separate is what makes each company’s
settlement reconcile to its own bank account.

**Changing it:** Add one the day you open a new storefront. Nothing needs configuring anywhere else — the reports pick it up because they count rows.

**You should see:** each channel listed under its company, with its own settlement account and its own commission and fee settings.

**Done when:** Every route to a customer exists as a channel, and every channel belongs to exactly one company.

#### 2.2 · Create a key on each marketplace or shop platform, and paste it in  `OUTSIDE`

> **API** — The agreed way two pieces of software talk to each other, so one can ask the other for something and get a predictable answer. *Waiter. Aap kitchen mein nahin jaate — waiter ko order dete ho, wahi khaana le aata hai. Waiter badal jaaye toh bhi order dene ka tarika wahi rehta hai.*
>
> **provider** — A company whose service the system uses — for messages, for payments, for artificial intelligence, for delivery. *Supplier. Ek supplier maal na de toh doosre se le lo — kaam nahin rukna chahiye.*

The connection is made with a key you generate on the other service. You stay in control
of it: you can see what it is allowed to do, and you can withdraw it from that service without
anybody here being involved.

**Where:** On the marketplace or shop platform’s own seller dashboard, in its developer or API section.

**Changing it:** Withdraw the key on the other service and the connection stops. Orders already pulled in stay where they are — they are your records now.

**You should see:** the channel showing as connected, and the first orders appearing without anybody typing them.

> **Careful.** If any screen, message or person asks you for the marketplace **password** rather than a
> key, stop. This platform never asks for one, and no legitimate integration needs one.

**Done when:** Each connected channel is bringing its own orders in, and every key was created by you and can be withdrawn by you.

#### 2.3 · Set what each channel costs you, so a sale is worth what it is really worth  `IN THE APP`

A marketplace order and a shop-counter order at the same price are not the same money.
Commission, payment fees, shipping and returns come out of one and not the other. Recording them per
channel is what makes it possible to answer which channel is actually worth having.

**Changing it:** Rates change from a date. The month a marketplace changes its commission is split at that date, not applied backwards.

**You should see:** each channel showing gross, its own deductions, and what is left — rather than one revenue figure that flatters whichever channel takes the biggest cut.

**Done when:** Every channel carries its own costs, and the net figure per channel is one you would act on.

---

## Part 3 · Your people — and the five states somebody can be in

This is the part most systems get wrong, because most systems have two states — here or
gone — and a real workforce has five. Somebody on a month’s leave has not left. Somebody who worked
three days on trial never joined. Somebody who stopped last year may come back next month, on the
same record, without being re-onboarded.

**Get the states right and the rest of the people side follows.** Get them wrong and you will be
deleting and re-creating the same person, which loses their history exactly when you need it.

How somebody is paid is a setting on the person, effective-dated like everything
else. The bases the system carries — the values, never a person — are:

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

#### 3.1 · Sort everybody into the five states before entering anybody  `WITH YOUR TEAM`

Each state behaves differently, and choosing between them at the moment of entering
somebody is how a person on leave gets recorded as having left. The distinction that matters most is
the last one: a trial has no joining date and no leaving date, because neither ever happened.

| State | What it means | What the system does |
|---|---|---|
| **Working** | Employed, and working now | Attendance expected; pay computed |
| **On leave** | Employed, not working this month | Still employed; the month is recorded as leave, not as absence |
| **Inactive** | Stopped, and may come back | Sign-in stops; the record and the history stay, ready to reopen |
| **Left** | Stopped, and that is that | Sign-in stops; the record stays; no new work assigned |
| **Trial** | Came for a few days, was paid, and went | **No employment record at all** — attendance and a payment, nothing derived |

**Changing it:** A person moves between states from a date, and moving between them never rewrites what came before. Somebody inactive who returns starts a new spell — the gap stays visible, because it happened.

> Trial is the one worth reading twice. Somebody on trial is paid for the days they came
> and nothing about them is calculated from a salary, because there is no salary — the payment **is**
> the record. The cost still lands in the right company and the right month, and if you take them on
> afterwards, the trial days are already there.

**Done when:** Everybody who has worked for you this year is in exactly one of the five states, and nobody is in the wrong one for convenience.

#### 3.2 · Enter each person, with the date they started rather than today’s date  `IN THE APP`

Entering somebody with today’s date because that is the day you did the data entry means
their first months do not exist. Their real start date is what makes their attendance, their pay and
their length of service correct, and it is not extra work to type it.

**Have ready:**

- Their name and how you contact them
- The company they work for
- The date they actually started — the real one
- What they do, and what they are paid on: a monthly amount, an hourly rate, or per piece
- Their working hours, if they differ from your standard ones

**Changing it:** Every one of these is effective-dated. A raise in April is a new row from April; March still pays March’s rate, permanently.

> **Careful.** Where you only know the month somebody started and not the day, record the month and
> mark it as approximate. That is honest and stays correctable. Inventing the 1st is a number that
> looks exact and is not, and nobody afterwards can tell which of the two you did.

**Done when:** Everybody is entered with their real start date, their real pay basis, and their own hours where those differ.

#### 3.3 · Set working hours per person, not per category of person  `IN THE APP`

Your packing staff may work a different clock from your tailoring floor, and a shift that
is stored as a property of a category cannot express that without inventing a new category. So the
clock belongs to the person: their own start, their own finish, their own monthly threshold, changed
from a date.

**Changing it:** Change one person’s hours from a date and nobody else moves. Change a whole group by changing each person in it, which is slower and is also the only version that is true.

> A monthly hours threshold is a number you state, never one the system works out by
> multiplying a day by a count of days. Those two disagree — deliberately, because a month is not a
> tidy multiple of anything — and the stated one is the one that is right.

**Done when:** Every person carries their own hours and their own monthly threshold, and no two people share a setting merely because they are the same kind of person.

#### 3.4 · Connect attendance to the phone your staff already have  `ON A PHONE`

Attendance that requires a person to walk to a machine, or a supervisor to fill a
register, is attendance that gets reconstructed at month end from memory. A message from the phone
they already carry, in the language they already speak, is the version that actually gets recorded on
the day it happened.

**Where:** On each person’s own phone. No app to install, and no smartphone required.

**Changing it:** Switch the messaging provider without staff noticing — the phone number and the conversation stay the same.

**You should see:** the day’s attendance visible on the screen the same morning, with anything unusual flagged rather than silently accepted.

**Done when:** Attendance for a normal day is recorded without anybody typing it into a screen, and the exceptions are the only thing a supervisor has to look at.

#### 3.5 · Write down your leave, holiday and festival rules as they actually are  `WITH YOUR TEAM`

Every business has these and almost none of them are written down, which means they are
whatever the person doing payroll remembers. They are settings here — how many Sundays are off, which
festivals are paid, who they apply to — and writing them down is what makes payroll reproducible
rather than remembered.

**Changing it:** Any of them, from a date. Changing the festival list in October does not re-run September.

> Where a rule genuinely does apply differently to different groups of staff, say so
> explicitly as a rule about the group rather than leaving it to whoever runs payroll to remember. The
> rules document sets out how each of these is applied.

**Done when:** Your leave, weekly-off, holiday and festival rules exist as settings, and payroll would come out the same run by somebody who has never done it before.

---

## Part 4 · Your products, and what a set actually contains

A garment is straightforward. A **set** is where the real work is, because a set is not one
thing — it is two or three pieces that have to exist together before anything can be sold, and the
pieces are made separately, by different people, at different times.

The set types this business works with, and what each one is made of, read from the
business’s own recorded composition:

| Set type | What it contains | Designs checked | If a piece is missing |
|---|---|---|---|
| Anarkali Plazo Set | Top + Bottom + Dupatta | 41 | **your decision** — both counts shown |
| Kurti Plazo Set | Top + Bottom | 16 | **your decision** — both counts shown |
| Kurti Palazzo Set | Top + Bottom | 25 | **your decision** — both counts shown |
| Lehenga Choli Set | Top + Bottom + Dupatta | 34 | Top: your decision · Bottom: your decision · Dupatta: optional |
| Co-Ords Set | Top + Bottom | 2 | **your decision** — both counts shown |
| Top Set | Top | 24 | **your decision** — both counts shown |
| Bottom Wear Set | Bottom | 8 | **your decision** — both counts shown |
| Dupatta Set | Dupatta | 2 | **your decision** — both counts shown |
| Kurta Set | Top | 1 | **your decision** — both counts shown |
| Readymade Blouse Set | Top | 1 | **your decision** — both counts shown |

**These were not read off the names.** Each one was checked against real production records
until only one composition reproduced every design. Two of them prove why that mattered:

- **Anarkali Plazo Set** — only Top+Bottom+Dupatta reproduces all 41. Taking Top+Bottom instead reports 1,400 sets for BinaRust where the file records 1,225.
- **Kurti Plazo Set** — only Top+Bottom reproduces all 16. Including the dupatta reports 194 sets for GreenKurtiPlazzo where the file records 854.


#### 4.1 · Load your designs, and let the system read your own file rather than retyping it  `IN THE APP`

Your designs already exist in a file somewhere. Retyping several hundred of them into a
new system is both the slowest possible start and the one most likely to introduce errors that only
surface at a month end.

**Changing it:** Load a corrected file at any time. Loading again updates rather than duplicating, matched on the design number.

**You should see:** your own columns recognised by name rather than by position, so a file where somebody inserted a column last year still loads correctly.

> **Careful.** Where a column cannot be matched, you are told which one and asked — not guessed at.
> A guess here becomes a wrong cost on every piece of that design.

**Done when:** Every design you sell exists, with its number, its description and whether it is a single garment or a set.

#### 4.2 · Say what each set type contains — including which pieces are optional  `IN THE APP`

Whether a set needs three pieces or two decides when it is countable as finished, and
therefore when it can be sold and what it costs. A set type where the third piece is sometimes
included and sometimes not is a real thing and has to be expressible, rather than forced into one of
the two answers.

**Changing it:** Add a set type, change what one contains, or mark a slot optional — from a date. Stock already counted keeps the composition it was counted under.

> Where the composition of a set genuinely depends on the combination rather than on the
> type — the same name covering more than one arrangement — record it that way. The system carries
> both readings and reports where they differ, rather than picking one and being quietly wrong about
> the other half of your stock.

**Done when:** Every set type says what it contains, every slot says whether it is required, and no set type is silently assumed to be three pieces.

#### 4.3 · Number your products so a person holding one can tell which company it belongs to  `IN THE APP`

A product number that carries the company code answers, from a label on a bag in a
warehouse, which of your businesses owns it. That question comes up constantly and the alternative is
looking it up.

**Changing it:** The code prefix belongs to the company and is set once. Products already numbered keep their numbers — renumbering existing stock is how two things end up with the same label.

**Done when:** Every product number identifies its company on sight, and the series is set to continue rather than restart.

---

## Part 5 · The making side — units, rate cards, and what gets counted

Work goes out to units — a lead person and the people who work with them — and comes back
as finished pieces. What you owe a unit is worked out from what came back, at the rate that applied
on the day it came back.

**A unit is not a person.** Units split, merge and change who is in them, and a unit that was one
last year and two this year is a date, not a contradiction. Everything is set up so that the earlier
period still resolves to what it actually was.

One person written four ways in four files is still one person, and one balance:

A name written in capitals, in mixed case, with a trailing space, or with one letter
transposed is still the same person. So **the system never compares written names.** It compares
ids: names in, **one identity** out. There is exactly one place where a written name becomes an id.

|  |  |
|---|---|
| **What is compared** | The id. Never the spelling |
| **Where a name becomes an id** | One place, and only one |
| **Where the spellings live** | An alias table — which is data you edit, not code |
| **An exact alias** | Resolves silently. It is already your answer, given earlier |
| **A near match** | **Proposed, never applied.** A merge is a decision |
| **Once you decide** | Stored. You are asked once, not every month |

Merging two people who are actually different silently combines two balances, and separating
them afterwards means unpicking every payment either of them ever received. That is why the system
will not do it on your behalf, however confident the match looks.

#### 5.1 · Create each making unit, by the name the floor already uses  `IN THE APP`

> **database** — Where all the information is kept, arranged so any of it can be found instantly and nothing gets lost. *Ek badi almari jisme har cheez apne fix khaane mein rakhi hai — dhoondhne ke liye poori almari palatni nahin padti.*
>
> **table** — One kind of information inside the database — all your customers in one, all your orders in another. *Almari ka ek khaana. Ek khaane mein sirf customers, doosre mein sirf orders.*

The unit is what earns, what gets paid and what carries an outstanding balance. Naming it
what your own people call it is what makes a payment screen legible to the person making the payment.

**Changing it:** Add or close a unit from a date. A unit that splits into two is closed on the last day it was one and the successors start on the next — which keeps the earlier period pooled, correctly, and the later one split.

**You should see:** each unit with its lead, its members, and its own running balance of earned against paid.

**Done when:** Every unit that does work for you exists, with the people currently in it, and any unit that has changed shape has done so with dates rather than by being edited.

#### 5.2 · Enter the rate card per design, per component, from the date it applies  `IN THE APP`

What you pay for a top is not what you pay for a dupatta, and neither is what you paid
last season. The rate is per design, per component, from a date — which is what lets a report for
last season resolve last season’s rate while this season pays this season’s.

**Changing it:** A new rate from a date closes the previous one the day before. Both stay on record, so a report for either period is answerable.

> **Careful.** A rate that has never been stated is not zero and must not be treated as zero. If work
> comes back against a design with no rate on record, the system asks rather than paying nothing. A
> piece rate nobody set is a question, not an amount.

**Done when:** Every design a unit works on has a rate for every component, each with the date it starts from, and nothing anywhere is paying an amount nobody stated.

#### 5.3 · Record what goes out and what comes back, by component  `IN THE APP`

A set is finished when all its required pieces are back, and its pieces come back at
different times from different units. Counting at the component level is what makes "how many
complete sets do I have" answerable without somebody walking the floor.

**Changing it:** Record a correction as a correction rather than by editing the original. What was counted and what it was corrected to are both worth knowing.

**You should see:** complete sets, and separately the pieces waiting on one missing component — which is the number that tells you what to chase.

**Done when:** Completed sets and incomplete ones are separate numbers, and the incomplete ones say which piece they are waiting for.

#### 5.4 · Pay against the balance, not against a figure somebody typed  `IN THE APP`

What a unit is owed is computed from the work that came back and the rates that applied,
recomputed each time rather than carried forward as a running total somebody once agreed. Payments
reduce it. The difference is the outstanding balance, and it is arrived at rather than remembered.

> Where the computed figure and your own records disagree, the difference is reported as a
> named difference rather than absorbed. A balance that ties out because somebody quietly adjusted it
> is a balance nobody can check.

**Done when:** Every unit has an outstanding balance you can explain line by line, and no figure in it came from a total rather than from the transactions underneath it.

---

## Part 6 · Buying — vendors, the first purchase, and what arrives

The buying side is three documents that have to agree: what you ordered, what arrived, and
what you were billed. When all three match, the bill is payable without anybody thinking about it.
When they do not, the difference is the whole point and is what should reach a person.

Beyond material suppliers, the outside services this business uses are a
recorded list rather than a matter of memory:

| Service sent out | Who does it first |
|---|---|
| Embroidery | Queen Worth |
| Digital Print | VD Enterprises |
| Foil Print | Lambodhar Print |
| Hand Dyeing | Hasan Bhai |
| Handwork | Rajesh Khan |
| Full Stitching | Cotton Sudaah |
| Partial Stitching | Aarya Trendz |

**Closed today, not closed forever.** The list is closed today, not closed forever. A tenant adds an entry through core/tenant.js like any other change: effective-dated, append-only, and the closed months keep the list that applied then. What 'locked' rules out is a value appearing in a record that is not on the list — a lead whose source is a free-text guess, or a service sent to a vendor nobody appointed.


#### 6.1 · Add your vendors with what you actually judge them on  `IN THE APP`

Price is the easiest thing to record and rarely the thing that decides who you buy from.
Lead time, how often they are short, and how often the quality comes back are what you actually use,
so they are what the vendor record carries.

**Changing it:** Terms are effective-dated. A vendor who changes credit terms in June does not change what May was bought on.

**You should see:** each vendor with their terms, their lead time, and their history — rather than a name and a phone number.

**Done when:** Every vendor you buy from exists, with the terms you actually agreed and the measures you would actually choose them on.

#### 6.2 · Let what you need be worked out from what you have sold and what you hold  `IN THE APP`

Buying from a feeling produces both stockouts and dead stock, usually in the same season.
What you need is a calculation from what is committed, what is in hand and what is already on order —
and the useful part is that it can tell you the day you should have ordered rather than the day you
noticed.

**Changing it:** Reorder levels, lead times and safety margins are all settings, per material, effective-dated.

**You should see:** a suggested requirement per material, with what it was calculated from shown next to it, so you can disagree with a number rather than just override it.

**Done when:** A purchase suggestion exists that somebody can check, and every figure in it says what it was derived from.

#### 6.3 · Raise the order, receive against it, and let the three documents match themselves  `IN THE APP`

Ordered, received, billed. A bill that matches both is passed without a conversation.
A bill that does not is stopped and shows which of the three disagrees and by how much — which is
the moment where money is actually saved, and the moment most systems handle by having somebody
notice.

| The three | Where it comes from |
|---|---|
| **Ordered** | The purchase order you raised |
| **Received** | What was counted in at the door, by whoever counted it |
| **Billed** | The vendor’s invoice |

**Changing it:** The tolerance below which a difference is not worth stopping a bill for is a setting, per vendor or overall.

**You should see:** bills in three groups — matched and payable, short or over and held, and awaiting receipt — rather than one list somebody works through.

**Done when:** A bill that agrees with the order and the receipt is payable without intervention, and one that does not says exactly where the disagreement is.

#### 6.4 · Count what arrived at the door, in the unit it arrived in  `IN THE APP`

Stock accuracy is decided at the moment of receipt and almost nowhere else. Counting in
the unit it physically arrived in — and converting afterwards — is what stops a metre becoming a
piece somewhere between the door and the ledger.

**Changing it:** Conversions between units are settings per material, and changing one does not restate stock already received.

**Done when:** What was received is recorded in the unit it came in, by the person who counted it, on the day it arrived.

#### 6.5 · Count your stock without stopping the floor  `IN THE APP`

A full annual count is a day nobody works and a number nobody trusts by March. Counting a
slice at a time, continuously, keeps the figure accurate all year and never closes the floor.

**You should see:** a variance per count, with a reason recorded against it — because variance with no reason is a number that gets adjusted away and learned nothing from.

**Done when:** Stock is counted on a rolling basis, every variance carries a reason, and the book figure is one you would act on without recounting first.

---

## Part 7 · Selling — the first order, the first invoice, the first payment

Now the part everything else was for. One order, taken properly, through to money in the
bank and an entry in the books — and once that works, the rest is volume.

Where an enquiry came from is a recorded list, because "how did they find us" is
only answerable if it was a choice rather than a text box:

| Where a lead came from |
|---|
| IndiaMART |
| Website |
| WhatsApp |
| Walk-in |
| Forum |

**Closed today, not closed forever.** The list is closed today, not closed forever. A tenant adds an entry through core/tenant.js like any other change: effective-dated, append-only, and the closed months keep the list that applied then. What 'locked' rules out is a value appearing in a record that is not on the list — a lead whose source is a free-text guess, or a service sent to a vendor nobody appointed.


#### 7.1 · Take one order, on one channel, for one customer  `IN THE APP`

Do this once by hand even if the channel will bring orders in by itself. It is the
fastest way to find out whether your set types, your product numbers and your tax settings are right,
and it is far cheaper to find out on an order you control.

**You should see:** the order priced correctly, the tax worked out from the place of supply, and the stock committed but not yet moved.

**Done when:** One order exists, on the right company, on the right channel, at the price and tax you expected.

#### 7.2 · Raise the invoice, and read it as your customer would  `IN THE APP`

The invoice is the one document from this system a customer actually sees. Its number
series, its address, its tax breakdown and its terms are all things you set up earlier, and this is
where you find out whether you set them up correctly.

**Have ready:**

- The order it comes from
- The company issuing it, and therefore its number series
- The place of supply, which decides which taxes apply

**You should see:** a document you would be content to send, numbered in the series you chose, with the tax split shown the way your customers expect to see it.

> **Careful.** An invoice number is never reused and never edited. A mistake is corrected with a
> credit note, which is slower and is also the only version that leaves both documents intact.

**Done when:** One invoice exists, it is numbered in your own series, and you would send it to a customer as it stands.

#### 7.3 · Record the payment, and let the settlement reconcile itself  `IN THE APP`

A marketplace does not pay you the invoice amount — it pays a settlement, days later,
covering many orders, net of commissions, fees, returns and adjustments. Matching that back to
individual orders by hand is where most of a finance person’s week goes, and it is arithmetic.

**Changing it:** When a marketplace changes its fee structure, the change is dated. Old settlements still reconcile under the old structure.

**You should see:** the settlement broken down to the orders inside it, with every deduction named, and anything it cannot match listed rather than absorbed.

**Done when:** A payment is recorded against the invoice, and a marketplace settlement can be broken back down to the orders and the deductions inside it.

#### 7.4 · Check that the sale reached the books by itself  `IN THE APP`

The point of the whole exercise. A sale, an invoice and a payment should each have
produced their own entries without anybody making a journal — and if they did not, now is when you
want to know, on one transaction, rather than at a month end on several hundred.

**You should see:** the entries on both sides, balancing, in the right company, in the right period, each one traceable back to the document that caused it.

**Done when:** One sale has gone from an order to a balanced entry in the books without anybody writing a journal, and every entry can be traced back to what caused it.

---

## Part 8 · The first month — attendance, payroll, and closing the books

The first month end is the real test, and the only one that finds the settings you got
wrong. Run it deliberately, with time, on a month you have already lived through — so you know what
the answer should be before the system tells you.

#### 8.1 · Look at the attendance exceptions, not at the attendance  `IN THE APP`

Most days are ordinary and reviewing them is wasted effort. What matters is the short
list: somebody who did not appear, somebody whose hours are impossible, somebody marked present on a
day their employment had ended. Reviewing that list is a few minutes; reviewing a full register is a
morning nobody has.

**You should see:** a short list of days that need a human, and everything else already settled.

**Done when:** Every exception for the month has been looked at by a person and either corrected or accepted, and the rest was never touched.

#### 8.2 · Run payroll for a month you already know the answer to  `IN THE APP`

Running it first on a month you have already paid means you have something to compare
against. Where the system disagrees with what you paid, one of the two is wrong, and finding out
which — now, on a month already settled — is the entire value of doing it this way round.

> Expect small differences and investigate each one rather than accepting the total. A
> difference usually means a threshold, a rate start date or a person’s hours were entered slightly
> differently from the way you actually apply them. The rules document sets out exactly how each pay
> basis is computed, so a difference is traceable rather than mysterious.

> **Careful.** Do not adjust a figure to make it match. Find the setting that produced it and correct
> that, then re-run. A payroll corrected by adjustment matches this month and will be wrong again next
> month, in a way nobody remembers the reason for.

**Done when:** Payroll for a known month has been run, every difference against what was actually paid is explained by a setting, and the setting has been corrected rather than the figure.

#### 8.3 · Look at what each person and each unit actually produced  `IN THE APP`

Cost per piece, utilisation and where the work is stuck are the numbers that change what
you do next month, and none of them exists unless attendance and output are both recorded. Having
just done both, you have them for the first time.

> A month somebody was not employed is not a month they performed badly, and is not
> averaged in as one. A month with nothing recorded is reported as nothing recorded rather than as
> zero. Both of those are accuracy rather than kindness — a wrong number about a real person follows
> them.

**Done when:** Cost per piece and utilisation exist for the month, and no figure in them is an average that quietly included a month somebody was not there.

#### 8.4 · File your returns from the system rather than from a spreadsheet  `IN THE APP`

The tax figures are already in the transactions. Producing the return from them, rather
than rebuilding it alongside them, is what makes what you filed and what your books say the same
number — which is the thing that is checked if anybody ever checks.

**You should see:** the return in the format required, and a reconciliation showing it agrees with the books line for line, with any difference named.

**Done when:** The return has been produced from the transactions, it agrees with the books, and any difference is named rather than adjusted away.

#### 8.5 · Close the period, and understand what closing means  `IN THE APP`

Closing freezes the period so that a report run today and the same report run next year
give the same answer. That is worth a great deal and it is why closing is restricted. Anything found
afterwards is corrected in the open period with an entry that says what it is correcting.

> **Careful.** A closed period does not reopen casually, and that is the feature. If everything can be
> reopened, no report has ever meant anything.

**Done when:** The month is closed, the figures are the ones you would report, and everybody who might want to change them knows how a correction is made instead.

---

## Part 9 · Live — the daily rhythm, and what to check

Setup is finished. What remains is a short daily habit and a shorter monthly one, and the
useful measure of whether the setup worked is how little of either there is.

> **effective date** — The date a change starts applying from. Records made before it keep the old value; records after it use the new one. *Naya rate 1 tarikh se lagu. Purane mahine ka bill purane rate se hi banega — woh apne aap nahin badlega.*
>
> **audit trail** — An automatic record of every change — what changed, who changed it, and when. *Har entry ke saath naam aur time apne aap likha jaata hai. Baad mein koi bole "maine nahin kiya", toh register bata deta hai.*

And this is the list in full — everything you can change without anybody’s
permission, who changes it, and what happens to records already made. It is here rather than in the
reference alone because a runbook that ends without it has taught somebody to set the business up
and not that they own it.

### People

| What changes | Who can | Takes effect | Records already made |
|---|---|---|---|
| Somebody joins — a worker, a supervisor, an office staff member, a contractor | Admin, or an HR role | They exist from their start date and can be assigned work the same minute. | Nothing before their start date mentions them, because they were not there. |
| Somebody leaves, with or without notice | Admin, or an HR role | Marked as left from a date. Their sign-in stops, and no new work is assigned to them. Their record is kept, not deleted. | Every hour they worked, every piece they made and every rupee they were paid stays exactly as it was. Deleting the person would blank all of it and change months already closed — so the record remains and simply has an end date. |
| A replacement starts immediately, in the same position | Admin, or an HR role | Added with their own start date and given the position. Work in progress is reassigned to them from that date. No waiting, no release, no developer. | Work completed under the previous person stays credited to the previous person. Two people held the same position at different times, and every record knows which one applied when. |
| A pay rate, a piece rate or a salary changes | Admin, or an HR role | Applies from the date you set — which may be today, a future date, or a past one you are correcting. | Every completed period recalculates to the rate that applied then, not the new one. This is the single most important line in this register: a rate that silently applied backwards would change payments already made to real people. |
| What somebody is allowed to see and do | Admin | Takes effect on their next action. Screens they may no longer open stop opening. | Everything they did while they held the old permissions stays recorded, with the permissions they had at the time. |

### Structure

| What changes | Who can | Takes effect | Records already made |
|---|---|---|---|
| A new company is opened, or an existing one is closed | Admin | It exists immediately with its own name, trading name, code and document numbering. The group view includes it from that date. | Group figures for earlier periods are unchanged, because the company did not exist in them. |
| A new way of selling is added — a marketplace, a shop, a counter, an export desk | Admin | Orders can arrive through it the same day. It appears in every report that breaks figures down by channel. | Earlier reports keep their own columns. A channel that did not exist then does not appear then. |
| A godown, a shop, a unit or a stock point is added, renamed or closed | Admin | Stock can move to and from it immediately. | Stock movements already recorded keep pointing at it, under the name it had at the time. |
| Which parts of the system this business uses at all | Admin | Turned on, a module appears in the menu with its screens ready. Turned off, it disappears from the menu. A steel plant, a clothing brand and a single creator each end up with a different system built from identical code. | Turning a module off hides its screens and keeps its records. Nothing is destroyed by tidying a menu. |

### Your words

| What changes | Who can | Takes effect | Records already made |
|---|---|---|---|
| What the system calls things | Admin | Every screen, every report and every document changes wording at once. One business says order, another says job, another says matter, consignment, batch or booking — the record underneath is identical. | Documents already issued keep the wording they were issued with, because that is what the customer received. |
| Extra information you want to record that nobody else needs | Admin | Added to the screen immediately, with the type you choose — text, number, date, a list to pick from, a yes or no. Reportable from the moment it exists. | Older records simply have no value for it, which is the truth. They are never back-filled with a guess. |
| The steps your work moves through | Admin | Add a stage, rename one, reorder them or remove one. New work follows the new list from that moment. | Work already part-way through keeps the stage it is in, even if that stage has since been removed — a job does not teleport because somebody edited a list. |
| The layout and numbering of invoices, statements, labels and reports | Admin | The next document uses the new layout or the new numbering. | Documents already issued are never re-rendered. What the customer holds and what you hold stay identical. |

### Rules

| What changes | Who can | Takes effect | Records already made |
|---|---|---|---|
| Turning a discretionary rule on or off | Admin | Applies to the next transaction. One business requires an approval below a price floor; another does not — same software, different setting. | Transactions already posted are not re-judged against a rule that did not apply to them. |
| Who has to approve what, and above which amount | Admin | The next request follows the new path. | Requests already approved keep the path they went through, and the names of who approved them. |
| Tax rates and the categories they attach to | Admin, or an accounts role | Applies from its effective date, which for tax is set by law rather than by you. | Every invoice keeps the rate that applied on its own date. A return filed for an earlier period recalculates to that period’s rate — this is not a convenience, it is the only correct behaviour. |
| Which outside service is used for messages, payments, delivery or artificial intelligence | Admin | The next message, payment or shipment goes through the new one. | Everything already sent keeps the record of which service carried it, which is what you need when you query one. |
| The most the system may spend on paid outside services | Admin | Enforced immediately. Over the ceiling, the paid option is refused and the work completes on one that costs nothing. | Spending already recorded is unchanged. |

### What can never be switched off

Short on purpose. Every line is something a bank, an auditor, a customer or an employee
relies on, and a setting that could remove it would remove their protection too.

| Never changeable | Why |
|---|---|
| The audit trail | Who changed what, and when. A system where this can be switched off cannot be used to answer a dispute, so it cannot be switched off. |
| Every record naming the company it belongs to | Without it, figures from two companies merge and no report can be trusted again. |
| One business being unable to read another’s records | This is not a preference. It is the promise that makes a shared platform usable at all. |
| Money kept as exact whole units | The alternative loses fractions of a rupee in ways nobody can trace afterwards. |
| Deleting nothing — records are ended, never erased | An erased record changes a period that was already closed, filed and possibly audited. |
| Never asking for a marketplace, bank or account password | The system connects through proper keys that you can withdraw. A password would hand over an account you cannot take back. |


Everything you change from here on is added rather than written over, which is what
makes a change today safe for a month already paid:

Every value that can change over time is kept as a log rather than as a single figure — a
salary, a rate, a threshold, a role, a person’s basis.

|  |  |
|---|---|
| **A value is never overwritten** | The open entry is closed off and a new one is **appended** |
| **History stays intact** | Every earlier value is still there, with the dates it applied between |
| **A future date is allowed** | An entry dated ahead **activates by itself** when that month arrives |
| **Superseded is not deleted** | An entry that has been replaced stays readable, because a report for an earlier period still needs it |
| **No match is an error** | Never zero |

That last line is worth reading twice. **Silently returning zero is how a person earns nothing
without anyone noticing** — the run completes, the report looks normal, and somebody is not paid.
So the system stops and names what it could not resolve, for whom, and for which month.

This is also how you set a change in advance. A rate agreed today and starting next month is
entered today with next month’s date, and it applies itself on the first — nobody has to remember.

#### 9.1 · Check the exceptions each morning, and nothing else  `IN THE APP`

A dashboard that shows you everything shows you nothing. What deserves a morning is the
short list of things that are not as expected: attendance that needs a decision, bills held on a
mismatch, stock that has gone below where it should be, orders that have not moved.

**You should see:** a list short enough to work through with a cup of tea, and empty on a good day.

**Done when:** The morning check is a list of exceptions, it is usually short, and an empty one genuinely means nothing needs you.

#### 9.2 · Let the day close itself from the floor  `ON A PHONE`

What was finished today, by whom, is worth more recorded today from the floor than
reconstructed on the 30th from a supervisor’s memory. The phone the person already carries is what
makes that happen without a screen and without anybody waiting in line.

**Done when:** The day’s work is recorded on the day it happened, by the people who did it, without anybody being sat in front of a computer.

#### 9.3 · Change things — and notice that nothing broke  `WITH YOUR TEAM`

The setup is only proven when you change something. Add a channel mid-season. Move
somebody to a different pay basis. Change what a set contains. Then re-run last month and confirm it
is unchanged to the rupee. That is the promise this whole design is built on, and it is worth
testing deliberately rather than discovering by accident.

**You should see:** the new arrangement in force from its date, the closed month identical to what it was, and no developer involved in either.

**Done when:** You have changed something significant, seen it take effect immediately, and confirmed that a closed period did not move.

#### 9.4 · Decide what you would do if this were unavailable for a day  `WITH YOUR TEAM`

Not a technical question. Orders still arrive and staff still work, and the difference
between an inconvenient day and a lost one is whether anybody decided beforehand what gets written
down by hand and entered afterwards.

**Done when:** Somebody can say what happens to orders, attendance and dispatch during an unavailable day, and what gets entered afterwards.

---

*Generated by `brand/delivery/website/mktenant.js` from `brand/site/tenant.js`,
`brand/site/tenantbuild.js` and this business’s own recorded logic — the companies, the channel
kinds, the set compositions, the column layout, the pay bases, the closed lists and the refusal
checks are all read from source at generation time, never retyped. Nothing here is maintained by
editing this file: edit the source and regenerate.*
