# Taking over this build — start here

**You are one of several models working on this repository.** Claude, Codex, Grok and
Cursor have all been used. You may be picking this up because another one ran out of
budget mid-task. Nothing is lost, and you do **not** need the previous conversation.

---

## Why you do not need the chat history

A conversation records what somebody **intended**. This repository records what is
**true**, in files you can read and commands you can run. Read those instead — they are
current as of this minute, and a summary never is.

Do not trust a sentence in any document, including this one, over a command you ran.

---

## First six minutes

```bash
npm ci
npm run check
```

`npm run check` runs **40 gates**. If it exits 0, the tree is healthy and you can
build. If it exits non-zero, **fix that before anything else** — do not build on a red
suite, and do not weaken a gate to make it green.

Then read these, in this order:

| File | What it tells you |
|---|---|
| `CLAUDE.md` | the working agreement — read before anything else |
| `HANDOFF.md` | this file |
| `brand/site/built.js` | which apps actually run, as against which are written down |
| `docs/verification/EVIDENCE.md` | every recorded run: command, exit code, commit |
| `brand/site/modules.js` | the canonical modules and apps |
| `brand/site/rules.js` | what each module enforces, and what it will never do instead |
| `brand/site/registry.js` | the requirement behind each app, and its rung |
| `brand/site/stack.js` | what each layer is built on and what it could be swapped for |
| `core/schema.postgres.sql` | the database — every table, its company_id, its policy |
| `MEDHAVA_HOW_TO_BUILD.md` | the ordered path from a checkout to a running site |

---

## The four questions, and where each is answered

| Question | Answer lives in | Not in |
|---|---|---|
| What actually works? | `brand/site/built.js` | any document's prose |
| What was proven, and by which run? | `docs/verification/EVIDENCE.md` | a claim that it passed |
| What must the software never do? | `brand/site/rules.js` | your judgement |
| Is the tree healthy right now? | `npm run check` | the last status message |

Today that is **31 modules**, **165 apps**, **302 rules**. Do not
retype those numbers anywhere — derive them, because they have already changed twice.

---

## How two models check each other

You are not asked to trust another model's work, or to review its opinion. **The gates are
the referee.** When you pick up after another model:

1. `npm run check` — if it is red, the previous hand-off was incomplete. Say so plainly.
2. `git log --oneline -5` and read the last commit message. It should name what was
   verified. If it claims something, **re-run that command yourself** rather than
   believing it.
3. `node tools/evidence.js --list` — every recorded run, with its real exit code.
4. Only then start new work.

If you find a defect in earlier work, the fix is not only to correct it. **Add a gate that
would have caught it**, and prove the gate fires by planting the defect again and watching
it fail. That is how this repository gets better, and it is the only kind of improvement
that survives a model switching.

---

## Rules that are not negotiable

These come from `CLAUDE.md`. Read it in full; these are the ones most often broken by
somebody arriving fresh:

- **Never say something passed unless you ran it and saw the output.** Not "should work".
- **Derive every count.** A number typed from memory is treated as fabricated here.
- **Medhava is the product. Vastrangam is one customer of it.** Never mix them. The
  product must build and test with zero tenants installed.
- **No real person's name, pay or private data in a tracked file.** `checkprivacy.js`
  enforces it; the real roster lives in `engine/private/`, which is gitignored.
- **Name no competitor, anywhere that ships.** Say "industry competitors" instead.
- **Never commit a key, a password, or a model identifier.**
- **A gate that cannot run must say "SKIPPED, not passed"** and exit 0 — never pass
  quietly having checked less than it did yesterday.

---

## When you finish a piece of work

```bash
npm run check           # every gate — 40 of them
npm test                # the gates plus the engines plus the browser apps
npm run test:product    # the product alone, with no tenant installed
npm run test:tenant     # the tenant engine — needs the tenant present
```

Then commit with a message saying what changed, why, and **what you actually ran to
verify it** — so the next model, which may not be you, can re-run the same thing.

If something is half-done, say so in the commit message. A half-finished thing that is
labelled half-finished costs the next model ten minutes. One labelled finished costs it a
day, and costs the owner his trust in every other label in the repository.

