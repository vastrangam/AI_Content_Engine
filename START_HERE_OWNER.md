# Start here

This is the first thing to open. It is written for the person who owns this project,
not for whoever builds it, and it explains every term it uses.

---

## What this project is

**Medhava** is the software: one system meant to run a business, described as
22 modules containing 113 apps, with 293 written
rules about how it must behave.

**Your own business is a customer of it, not part of it.** That separation is
deliberate and is checked by the build: the product has to build, test and run with no
customer installed at all. It ships as two archives, never one — and the second one is
loaded on top of the first to prove the arrangement works.

---

## Where it actually stands today

Read from the project’s own registers at the moment this page was generated, not from
anybody’s memory:

| | |
|---|---:|
| Apps designed | 113 |
| Apps with a real automated test that runs every time | **19** |
| Apps written down but not standing up | 94 |
| Rules written | 293 |
| Rules proven by a test | 89 |
| Overall score, out of 5 | **1.5** |
| Maturity | **Level 3 — Prototype** |

**Nothing is deployed. Nothing is live.** No part of this is running on a machine the
business can reach, and no mobile app exists. That is not a setback — it is simply
where the project is, and the rest of this pack is how it moves.

---

## What to do, in order

1. **`SETUP_CHECKLIST.md`** — what to buy and switch on. Start at step 1; it is free.
2. **`SEVEN_STAGE_ROADMAP.md`** — your seven stages, each saying who does it.
3. **`WORKING_WITH_AI_TOOLS.md`** — read this BEFORE your next AI session, not after
   you run out of one. It is short.
4. **`BUILD_QUEUE.md`** — when you want actual building done, this is the ordered list
   to hand to whoever is doing it.

---

## The one habit that makes the rest work

Ask for the evidence, every time.

This project has a rule that a claim is not accepted without a command that was really
run and the output it really produced. It is enforced by the build: a capability cannot
be marked as working unless the command that proves it is recorded, and the recording
is re-run to check it still holds.

So when any tool — including this one — tells you something is done, the question is
always the same: **which command, and what did it print?** If the answer is a summary
rather than output, it is not done yet. That single question is what separates a real
result from a confident-sounding one, and you do not need to understand the code to
ask it.

---

## Every technical word above, in plain language

**1 words.** Every technical term this document uses, in plain
language, with an everyday comparison. Nothing here assumes you already know any of them.


### module

One area of work in the system — sales, purchase, staff, accounts. Each is a set of screens that belong together.

*Dukaan ke alag-alag counters. Ek counter bikri ka, ek kharidi ka, ek hisaab-kitaab ka.*

