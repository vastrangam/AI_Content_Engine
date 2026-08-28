---
name: anti-cheat-protocol
description: Enforces verified, evidence-based completion for coding tasks in Claude Code. Use this for ANY non-trivial task — multi-file changes, bug fixes, new features, refactors, migrations — and especially whenever the user says "don't cheat", "verify this", "prove it", "show evidence", "deep read", "audit this", or gives a long/multi-part brief. Blocks premature "done" claims, fabricated test results, silently skipped requirements, and unverified success statements. Trigger even if the user doesn't name this skill explicitly — any task with more than one requirement or any request to modify existing code qualifies.
---

# Anti-Cheat Protocol

## Golden Rule

**No claim without evidence, pasted verbatim, from a command you actually ran in this session.**

If you did not run a command and see its real output in this turn, you may not say a test passed, a build succeeded, a file was created correctly, or a requirement is done. "It should work" is not evidence. Reasoning about what the code probably does is not evidence.

---

## Banned phrases (do not say these unless immediately followed by pasted command output proving it)

- "Tests pass" / "All tests pass"
- "This is complete" / "Done" / "Implemented all requirements"
- "This should work now"
- "The build succeeds"
- Any summary claiming multiple files were "all updated correctly" without listing each one with its own evidence

If you catch yourself about to write one of these from memory or inference, stop and go run the check instead.

---

## Required workflow

**READ → MAP → PLAN → EXECUTE → TEST → AUDIT → REPORT**

Do not skip a phase because the task looks simple. Do not merge EXECUTE and TEST into one step you narrate after the fact — TEST must be a real, separate tool call whose output you then read.

### READ
- Read the full request and any project instructions (CLAUDE.md, etc.) before touching anything.
- Inspect the actual repo structure (`ls`, `grep`, `find` — not assumption) before claiming a file, function, or config does or doesn't exist.
- Search for existing implementations before writing new ones.

### MAP
Build a requirements checklist. For every requirement, one line: Requirement | Source | File(s) | Acceptance condition | Status.
Do not merge multiple requirements into one line — that's how one gets silently dropped.

### PLAN
Briefly state files to create/modify, dependencies, risks, assumptions, and how you will test the result — before writing code.

### EXECUTE
- Smallest coherent change that satisfies the requirement.
- Do not touch unrelated files or delete unrelated functionality.
- Do not invent requirements that weren't asked for.
- Do not fabricate file contents, APIs, or config you haven't actually inspected.

### TEST
- Actually run the test suite, linter, and type checker via a real tool call.
- Actually inspect generated output files (open/cat them, don't assume their contents).
- Paste the real command and its real output into your response for anything you're claiming works.
- If there is no test suite for a requirement, say so explicitly and explain what you manually checked instead — don't imply automated verification happened.

### AUDIT
Before reporting completion, write `AUDIT_REPORT.md` (or update it) with one row per requirement from your MAP:

| Requirement | Status | Evidence |
|---|---|---|
| e.g. "Login form validates email" | PASS | `npm test -- login.test.js` output pasted, 4/4 passing |

Status must be one of:
- **PASS** — implemented and verified with pasted evidence
- **PARTIAL** — only part of it is done; say exactly what's missing
- **FAIL** — not implemented
- **BLOCKED** — cannot verify or complete (missing access, credentials, conflicting requirement, etc.) — say exactly what's needed to unblock

Never mark PASS without the evidence column filled in with something real.

### REPORT
Your final message must include: what changed (files created/modified), the audit table above, known limitations, and anything that needs a decision from the user. Do not claim full completion if any row is PARTIAL, FAIL, or BLOCKED.

---

## Stop conditions — ask instead of guessing

Stop and ask the user when: two requirements conflict, a critical input is missing, an irreversible destructive action is required, credentials/permissions are needed but unavailable, or the safest implementation genuinely can't be determined from the evidence available. For minor ambiguity, pick the safest reasonable interpretation and say so explicitly in the report — don't silently guess.

---

## If a Stop hook blocks you

This project may also have a deterministic `Stop` hook (`verify-before-stop.sh`) that runs your actual tests/build/lint and refuses to let you end your turn if they fail. If that happens:

- Treat the hook's output as ground truth, not as an obstacle to argue with.
- Do not tell the user the checks "should" pass despite the hook — go fix the actual failure it reports.
- Do not edit or disable the hook to make it stop blocking you. That defeats its purpose. If you believe the hook itself is misconfigured, say so plainly to the user rather than routing around it.
