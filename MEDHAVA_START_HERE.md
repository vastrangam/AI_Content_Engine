# Medhava — read this first

**Paste this whole file into a new conversation before anything else.** It assumes you
have nothing: no repository, no attachments, no earlier chat. It exists so a machine can
be useful in its first reply rather than its tenth.

---

## What this is

**Medhava is a business operating system** — one piece of software a company runs its
whole operation on: what it designs, buys, makes, stocks, sells, ships, bills and pays
for. It is organised as **31 modules** holding **165 apps**.

**Vastrangam is one company that will run on it.** A clothing manufacturer and exporter.
It is a *customer* of Medhava, not a part of it — its rates, staff, holidays and payroll
rules are configuration loaded over the product, never built into it.

**Keeping those two apart is the single most important rule here.** It was got wrong once
and had to be undone: the product must build, test and run with zero customers installed,
and `npm run test:product` is the command that proves it.

---

## What is actually built — the honest table

Read this before planning anything. The gap between designed and working is the whole
situation:

| | |
|---|---:|
| Apps designed and specified | **165** |
| Apps that actually stand up | **19** |
| — of those, on the real database | 3 |
| — browser prototypes | 16 |
| — command-line engines | 2 |
| Rules written down | 302 |
| — proven by a test that runs | **89** |
| Database tables | 151 |
| Maturity, out of 5 | **1.4** — level 3, Prototype |

The three rows above sum to 21, not 19, because
2 apps are counted in two of them —
**D2C Sales** and **Procurement** run on the real database *and* have a
browser prototype. The distinct total is the one to quote.

So: **19 of 165**. Most of this product is designed and not built, and any
plan that assumes otherwise will be wrong. That ratio recently got *worse* on purpose —
every line of the specification now has a named home, which raised the
denominator without building anything, and saying so is preferred to a flattering number.

---

## Where everything lives

| What | Where |
|---|---|
| The code and every register | a private GitHub repository, branch `claude/ai-content-platform-design-44swji` |
| The product, as a runnable archive | `MEDHAVA_BOS.zip` |
| The customer configuration | `VASTRANGAM_TENANT.zip`, unzipped *over* the product |
| The documents to read | `MEDHAVA_PDF.zip` and `VASTRANGAM_PDF.zip` |

The archives are not in the repository — they are rebuilt from it on demand, because an
archive of a repository committed inside that repository grows forever.

---

## The rules that are not negotiable

These are not preferences. Work that breaks one of them gets thrown away:

- **Never say something passed unless you ran it and saw the output.** Not "should work",
  not "this will pass". If it was not run, say it was not run.
- **Never type a count.** Every number is derived from a register by a command. A figure
  typed from memory is treated here as fabricated.
- **Medhava is the product; Vastrangam is one customer.** Never mix them.
- **Nothing is finished until a test failed first.** A test that has never been seen to
  fail proves nothing.
- **No real person’s name, pay or bank detail in any file that ships.**
- **Name no competitor anywhere that ships.** Say "industry competitors".
- **Never commit a key, a password, or which model you are.**
- **If you find a defect, add the check that would have caught it** and prove that check
  fires by planting the defect again. A fix without a gate comes back.

---

## What to do next

**If you have been given the repository or an archive**, this is the whole start-up:

```bash
npm ci                  # install exactly what the lockfile says
npm run check           # every gate — 41 of them
npm test                # the gates plus the engines plus the browser apps
npm run test:product    # the product alone, with no tenant installed
```

`npm run check` runs **41 gates**. If it exits 0 the tree is healthy. If it exits
non-zero, fix that before building anything — and never weaken a gate to make it green.

Then read, in this order:

| File | What it tells you |
|---|---|
| `HANDOFF.md` | read second, once the repository is open |
| `CLAUDE.md` | the working agreement every model must follow here |
| `MEDHAVA_HOW_TO_BUILD.md` | the ordered path from an archive to a running site |
| `brand/site/built.js` | which apps actually run |
| `brand/site/modules.js` | the canonical modules and apps |
| `brand/site/rules.js` | every rule, with what the system will never do instead |
| `docs/verification/EVIDENCE.md` | every recorded run: command, exit code, commit |
| `CONSTRAINTS.md` | what must be arranged before a demonstration is possible |
| `SPEC_CONFLICTS.md` | the places the specification contradicts itself, still undecided |

**If you have not been given anything yet**, ask for `MEDHAVA_BOS.zip` — it carries the
repository, builds on its own, and passes its own tests with no customer installed.

---

## How to talk to the owner

He is not a programmer and does not want to become one. He is handing over the technical
path and checking the result at the end of each module on a site he can open.

- **Answer in plain language.** Explain a technical word the first time you use it.
- **Tell him what is not done.** A half-finished thing labelled half-finished costs ten
  minutes. One labelled finished costs a day, and costs him his trust in every other
  label you have given him.
- **Give him the measurement, not the adjective.** "19 of 165 apps stand up" beats "good
  progress".
- **When two requirements genuinely conflict, stop and ask.** Do not pick one quietly.

