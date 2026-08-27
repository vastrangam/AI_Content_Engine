---
name: vastrangam-tenant
description: Use when setting up or running Vastrangam as one business on the Medhava platform — its companies, its channels, its people and their five employment states, its products and set compositions, the making side and its rate cards, buying and the three-way match, selling and settlement, attendance, payroll, and the month end. Triggers on requests to onboard, configure, seed, or operate this tenant, or to implement or check any of its rules — attendance codes, pay computation, set completion, karigar costing, vendor matching, GST. Do not use for building the platform itself — that is MEDHAVA_BOS.SKILL.md.
---

# Vastrangam — set the business up on the platform and run it

You are setting up **one business** on a platform you are not building. Nothing is installed.
Every value below is a row with a date, entered in the app, and the owner owns all of them.

**The rule that runs through everything.** Anything can be added, edited or removed at any moment and
it takes effect at once — and the past does not move, because every change carries the date it starts
from. A supervisor leaves on Tuesday, a replacement starts Wednesday, both recorded the same morning,
and last month’s payroll still comes out to the same rupee. *Purana record mitta nahin; naye date se
naya rule lagta hai.*

**So do not ask which values to freeze.** How many marketplaces, who is on this month’s roster, what
a set contains, what hours somebody works — every one of those is data the owner edits. Your job is
the structure that lets him.

## The scale of it, read from the source

Every figure below is read from this repository when this file is generated. **Do not copy one into code or into a document** — read it the same way, at the moment you need it. Two counts here went stale exactly by being typed once.

| What | How many | Read it from |
|---|---|---|
| Modules | 22 | `brand/site/modules.js` |
| Apps across them | 113 | `brand/site/modules.js` |
| Rules the system must satisfy | 285 | `brand/site/rules.js` |
| Tables in the schema | 151 | `core/schema.postgres.sql` |
| Technical layers | 19 | `brand/site/stack.js` |
| Named alternatives between them | 57 | `brand/site/stack.js` |
| Things a business changes itself | 18 | `brand/site/dynamic.js` |
| Things nobody may switch off | 6 | `brand/site/dynamic.js` |
| Industry packs shipped | 10 | `core/packs/` |

## Read these, in this order

| Document | What it answers |
|---|---|
| `VASTRANGAM_BUILD_GUIDE.md` | The ordered path: the half-hour before anybody opens a screen, then companies, channels, people, products, the making side, buying, selling, the first month end, live. |
| `VASTRANGAM_RULES_AND_LOGIC.md` | The reference, by subject: every calculation, and all 285 rules each with what the system will never do instead. |
| `Vastrangam_Final_As_Tenant.md` | Both of the above in one file. |
| `SPEC_CONFLICTS.md` | The places the business’s own specification says two different things, quoted with line numbers and deliberately unresolved. Read it before you resolve one yourself. |

## Where the truth lives

Never restate one of these from memory. Read it.

| File | What it holds |
|---|---|
| `engine/fixtures/master.json` | the roster, the employment spells, the pay bases and the shift groups — the seed data, where values are supposed to live |
| `engine/fixtures/karigar_units.json` | the making units, their members, and the dates a unit split or closed |
| `engine/fixtures/set_types.json` | what each set type contains, and which slots are optional |
| `engine/fixtures/locked_lists.json` | the closed lists — the values a field may take |
| `engine/fixtures/garment_columns.json` | the column layout of the business’s own files, matched by name so an inserted column does not break the read |
| `engine/vastrangam/pay.py` | how a month’s pay is computed, per pay basis, across a financial-year boundary |
| `engine/vastrangam/attendance.py` | the attendance codes, and the difference between paid and productive |
| `engine/vastrangam/karigar.py` | the paying unit, the aliases, the weighting by quantity, and which period wins when two disagree |
| `engine/vastrangam/gates.py` | what the engine refuses to do, and why each refusal is there |
| `engine/vastrangam/performance.py` | the bands, and which months are allowed into the average |

## The order of work

Each phase has a **command that decides it**, not a judgement. A phase is finished when its command passes — never when the code is written.

### 1 · Read the conflicts before you resolve one

Read SPEC_CONFLICTS.md first. The business’s own specification contradicts itself in
places, each quoted with its line numbers and left unresolved on purpose. If your work touches one,
**ask the owner** — a resolution invented here becomes a wrong figure in a real month.

**Check it:**

```bash
node brand/site/checkconflicts.js --summary
```

**Done when:** You know which questions are open, and you have not answered one on the owner’s behalf.

### 2 · Companies, channels, and the words

Companies are the units that file, invoice and close their own books. Channels are every
route from a customer, each belonging to one company — two companies selling on the same marketplace
are two channels. **Assert no count of either anywhere.**

**Check it:**

```bash
node core/tests/core.test.js
```

**Done when:** Every company and every channel exists as a row, and nothing in any output states how many there are.

### 3 · People — five states, not two

Working · on leave · inactive and can return · left · **on trial**. Trial is the
structural one: no joining date, no leaving date, no salary, because none of those happened. The
system must accept attendance and a payment for somebody with no employment spell at all; the payment
**is** the record, nothing is derived from it, and nothing raises "salary missing". Hours belong to
the person, not to a category of person.

**Check it:**

```bash
python3 engine/tests/selftest.py
```

**Done when:** Somebody on a month’s leave is not recorded as having left, somebody inactive returns on a new spell with the gap intact, and a trial person can be paid without an employment record.

### 4 · Products, and what a set actually contains

A set is two or three pieces made separately that have to exist together before anything
can be sold. Record which slots are required and which are optional. Where the composition depends on
the combination rather than the type, record it that way and report both readings — do not pick one.

**Check it:**

```bash
node brand/site/checksets.js
```

**Done when:** Set completion is decided by the recorded composition, optional slots are expressible, and no set type is silently assumed to be three pieces.

### 5 · The making side

Work goes to units and comes back as pieces, paid at the rate that applied on the day it
came back. A unit that was one last year and two this year is a **date**, not a contradiction: close
the joint unit on its last day and start the successors the next, so the earlier period stays pooled
and the later one splits. One person written four ways is one balance.

**Check it:**

```bash
python3 engine/tests/selftest.py
```

**Done when:** No month is covered by both a joint unit and its successors, every figure is recomputed from transaction rows rather than read off a total, and a design with no stated rate raises instead of paying nothing.

### 6 · Attendance, pay, and the first month end

Run payroll first on a month already paid, so there is something to compare against. Where
the system disagrees with what was paid, **find the setting that produced it and correct that** — do
not adjust the figure. A payroll corrected by adjustment matches this month and is wrong again next
month, for a reason nobody remembers.

**Check it:**

```bash
python3 engine/tests/selftest.py
```

**Done when:** Every difference against a known month is explained by a setting, the setting was corrected rather than the number, and a month somebody was not employed is not averaged in as a bad month.

### 7 · Buying, selling, and closing

Ordered, received, billed: a bill agreeing with both is payable without a conversation, and
one that does not says which of the three disagrees and by how much. On the selling side, a
marketplace settlement must break back down to the orders and the named deductions inside it. Then
close the period, and understand that a closed period not reopening casually is the feature.

**Check it:**

```bash
node core/tests/partv.test.js
```

**Done when:** A matched bill passes without intervention, a settlement reconciles to its orders, and the return produced from the transactions agrees with the books line for line.

## When a value you need is missing

**Raise it. Never fill it in.**

This business’s own records have gaps — a piece rate nobody stated, a joining date known only to the
month. The correct handling of each is to say so and keep it correctable:

- **A rate nobody stated is not zero.** Work coming back against a design with no rate on record
  raises, naming the design. A piece rate nobody set is a question, not an amount.
- **A date known to the month stays month-precision** and is marked approximate. Inventing the 1st
  produces a number that looks exact and is not, and nobody afterwards can tell which you did.
- **A month with nothing recorded is reported as nothing recorded**, never as zero, and never
  averaged into somebody’s performance as a bad month.

## Never

1. Never name a person in logic. Branch on a flag the person carries — a pay basis, a shift group, a threshold — never on who they are.
2. Never put a rate, a threshold, a shift or a roster count into code. They are rows with dates, and `brand/site/checkstatic.js` refuses them.
3. Never overwrite a value. Close the row in force the day before and append the new one; the audit trail must not have a hole exactly where somebody would want one.
4. Never resolve a specification conflict on the owner’s behalf. SPEC_CONFLICTS.md lists them with line numbers precisely so that they stay his to decide.
5. Never read a figure off a total. Recompute from the transaction rows and use the source’s own totals only to check the answer — and where the two disagree, report the difference rather than reconciling it away.
6. Never treat a state as its neighbour. On leave is not left, inactive is not left, and a trial is neither — it has no employment record at all.
7. Never ask for or store a marketplace, bank or account password. The product’s promise is that it will never ask, and that holds in the conversation as well as in the code.

## Before you say it is finished

Run the whole suite, and report what it actually printed:

```bash
npm test
```

If something failed, say so and show the output. If a step was skipped, name it. **A passing run you did not perform is the one thing that makes everything else here worthless** — every gate in this repository exists because something got through on somebody’s word.

---

*Generated by `brand/delivery/website/mkskills.js` from `brand/site/skills.js`. Every path and every command above is checked to exist before this file is written, and every count is read from its canonical source at generation time.*
