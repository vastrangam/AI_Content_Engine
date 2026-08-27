---
name: medhava-bos
description: Use when building the Medhava Business Operating System from nothing — a multi-tenant platform where many unrelated businesses run on one codebase, each seeing only its own records and each seeing them in its own words. Triggers on requests to build, scaffold, implement or continue the platform, its database, its tenancy and company isolation, its industry packs, or any of its numbered modules. Read MEDHAVA_ARCHITECT.md before making any design decision and MEDHAVA_BUILD_GUIDE.md before typing any command. Do not use for setting up one business ON the platform — that is VASTRANGAM_TENANT.SKILL.md.
---

# Medhava BOS — build the platform from zero

You are building a **platform**: one piece of software that many separate businesses use at
the same time, each seeing only its own information, each seeing it in its own words. A steel plant,
a clothing manufacturer, a school and one person selling courses, on the same code. That is the whole
design problem, and every decision below exists to serve it.

**The trap.** The moment a customer needs something different and the answer is "we will add a
setting for you", the software has started to fork, and in two years there are as many versions as
customers. The way out is decided before any code: **what differs between businesses is data, not
code** — their words, their steps, their extra fields, their documents, which parts they use at all.

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
| `MEDHAVA_ARCHITECT.md` | WHAT the system is and WHY each decision is the way it is — and, for every one, what would make it the wrong decision. Read this before you decide anything. |
| `MEDHAVA_BUILD_GUIDE.md` | HOW each layer works, and then the ordered path from an empty machine to a deployed product with the command and the check for every stage. Read the last part before you type anything. |
| `MEDHAVA_PLAN_OF_ACTION.md` | WHAT gets built, in what order, and all 285 rules the finished system must satisfy — each with what it will never do instead. |
| `Medhava_BOS.md` | All four documents in one file, if you would rather hold one thing. |
| `DEPLOYMENT.md` | The server runbook: putting it on a machine and keeping it there. Read it at the deployment stage, not before. |

## Where the truth lives

Never restate one of these from memory. Read it.

| File | What it holds |
|---|---|
| `brand/site/modules.js` | the modules and their apps — the one canonical list. Never type a count from it; read it. |
| `brand/site/rules.js` | every rule the system must satisfy, each with what it will never do instead |
| `brand/site/stack.js` | what each layer is built on, and the named alternatives behind one interface |
| `brand/site/dynamic.js` | what a business changes without a developer, and the few things nobody may switch off |
| `brand/site/plainwords.js` | every technical word, in plain language, with an everyday comparison |
| `brand/site/tools.js` | the free-first register — a paid tool must name its free option and the trigger for paying |
| `core/schema.postgres.sql` | the production schema. Read it before designing a table; most of them already exist here. |
| `core/packs.js` | the industry pack engine — how a trade is configured as data |
| `core/tenant.js` | what a business changed AFTER its pack, effective-dated and append-only |
| `core/partv.js` | the tables Part V of the specification adds, and where each one landed |

## The order of work

Each phase has a **command that decides it**, not a judgement. A phase is finished when its command passes — never when the code is written.

### 1 · Read before you build

Read MEDHAVA_ARCHITECT.md end to end, then the ordered path at the end of
MEDHAVA_BUILD_GUIDE.md. Then read `core/schema.postgres.sql`. Most of what you are about to design
has been designed; the fastest way to build the wrong thing is to start from the module list without
the argument underneath it.

**Check it:**

```bash
node brand/site/checkcoverage.js
```

**Done when:** You can say, without looking, why money is stored as whole paise and why the application connects as a role that is neither superuser nor table owner.

### 2 · The database, and the isolation that has to be proven

Create the database and three roles — an owner, the role every policy names, and a login
role that inherits it and owns nothing. Apply the schema as numbered forward-only files. **Then make
the isolation test fail on purpose**: as the superuser it must return both companies, because a
superuser is never subject to a policy even when the table forces it. Only after seeing it red does a
green run mean anything.

**Check it:**

```bash
node core/tests/live.test.js
```

**Done when:** The schema runs in a real Postgres, one company cannot read another, and the test has been seen to fail as the wrong role.

### 3 · Money, and dates

Every money column is a whole-number type in paise. Every value a business can change is a
dated row — the row in force is closed the day before and a new one appended, never overwritten. A
value asked for on a date no row covers is an **error**, never zero and never the nearest one.

**Check it:**

```bash
node core/tests/schema.test.js
```

**Done when:** No money column is a fraction, a future-dated row activates on its own day, a closed period returns what it returned at the time, and a date with no row raises.

### 4 · A trade is a row, not a fork

Build the pack engine before the second customer, not after. A pack carries a trade’s
words, its stages, its extra fields, its documents and its starting reference data — and may never
contain executable code, invent a concept the engine does not have, extend a table that does not
exist, declare money as anything but integer paise, switch off an immutable rule, or be applied in
part.

**Check it:**

```bash
node core/tests/packs.test.js
```

**Done when:** Two unlike trades run on the same code, each in its own words, and configuring the second changed no source file.

### 5 · Companies and channels are rows, and so is their count

A company is a row. A channel is a row. Every business record carries its company; every
sale also carries its channel. The group figure is the sum across companies **minus** what they sold
each other. Write no count of either into code — not in a constant, not in a type, not in a report.

**Check it:**

```bash
node core/tests/core.test.js
```

**Done when:** The books balance across a grid of companies and channels, no journal line points at another company’s account, and adding one more of either needs no code change.

### 6 · Nothing a business owns is compiled in

Add the gate that refuses a count, a rate, a threshold, a shift or a person’s name written
into code, and **watch it go red** on a planted literal before trusting it. Structure may be
constant. A value somebody would ever want to change may not.

**Check it:**

```bash
node brand/site/checkstatic.js
```

**Done when:** The gate runs inside the one check command, it has been seen to fail on a planted literal, and every entry on its exempt list carries a written reason.

### 7 · The modules, in the order they are numbered

Build them in the order `brand/site/modules.js` gives, which is dependency order: a
product exists before it is stock, a customer before a sale, stock before it moves, the books before
they close. **Do not reorder the list.** A module is finished when every rule the rulebook lists for
it passes by name — not when its screens exist.

**Check it:**

```bash
node brand/site/checkrules.js --summary
```

**Done when:** No module was started before the ones it reads from could supply real records, and none is called finished on the strength of its screens.

### 8 · Deploy, and then do one real transaction

Follow DEPLOYMENT.md for the machine, the names, the certificates and the backups. Then
put one real order through to a posted, paid entry in the right company’s books — and sign in as a
different business and fail to find it. Not a refusal: **nothing found.**

**Check it:**

```bash
npm test
```

**Done when:** One genuine transaction has gone end to end, a second business on the same platform cannot see any trace of it, and going back to the previous release has been practised at least once.

## When a value you need is missing

**Raise it. Never fill it in.**

If a rate, a threshold, a date or a name is not stated anywhere you can point at, the correct output
is a question naming exactly what is missing and what depends on it. Not zero, not the nearest value,
not a sensible default.

Zero is the dangerous answer because it looks like an answer: it posts cleanly, reconciles, and is
discovered by the person who was not paid. Every gate in this repository that could have caught a
guessed figure was written after one got through.

## Never

1. Never type a count. Read `brand/site/modules.js`, `rules.js`, `stack.js` and the schema at the moment you need a number. Two counts in this repository went stale exactly this way.
2. Never reorder something that is numbered. The module order is dependency order; a second opinion nobody asked for is not an improvement.
3. Never hardcode a company count, a channel count, a rate, a threshold, a shift or a person’s name. Branch on a flag the record carries, never on who it is.
4. Never let a check pass that has not first been made to fail. Isolation, money and the anti-hard-coding gate all fail silently, and a green that has never been red proves nothing.
5. Never claim something is finished without naming the test that proves it, and never report a passing run you did not perform.
6. Never commit a key, a token or a password — not once, not temporarily. A key committed once is in every copy of that history forever.
7. Never ask anybody for a marketplace, bank or account password. Every outside connection uses a key the customer creates and can withdraw. That is a promise the product makes and it holds in the code.

## Before you say it is finished

Run the whole suite, and report what it actually printed:

```bash
npm test
```

If something failed, say so and show the output. If a step was skipped, name it. **A passing run you did not perform is the one thing that makes everything else here worthless** — every gate in this repository exists because something got through on somebody’s word.

---

*Generated by `brand/delivery/website/mkskills.js` from `brand/site/skills.js`. Every path and every command above is checked to exist before this file is written, and every count is read from its canonical source at generation time.*
