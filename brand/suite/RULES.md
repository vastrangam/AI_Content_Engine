# Medhava — the standing rules

Rules that hold across all fifteen modules and the Platform spine. They are not preferences. Where a rule can be
made structural it has been, so it survives without anybody remembering it.

Run `node deep/audit.js` — it exits non-zero if any of the enforceable ones is broken.

---

## 1 · No app depends on any single outside company

Every capability an app touches — books, marketplaces, AI writing, AI images, automation,
couriers, payments, messaging, email, storage, GST, printing, barcode — is a **capability**
with many interchangeable providers, never a hard-wired vendor.

**How it is enforced:**

- `suite/providers.js` holds the registry: 14 capabilities × 5–12 providers each.
- `suite/kernel.js` auto-wires it from `spec.uses:[...]` — an app cannot opt out.
- `deep/build_deep.js` **fails the build** of any app that does not declare `uses`.
- Four self-tests run inside every app at every launch:
  - no capability offers fewer than three choices
  - every capability has a built-in or by-hand option, so the app is complete with nothing connected
  - every capability has an option you can run yourself
  - switching a provider changes nothing else in your data
- `deep/audit.js` §3 re-checks the registry, §1 and §5 make sure a vendor name never appears
  as the **source of a figure** in an app, a book or a manual.

**The distinction that matters.** A vendor name on the **Connectors** screen is the promise
working — one choice among many, switchable in a click. The same name in a **Wiring** table
("Cash + bank ← BUSY ledger") is the opposite: it says your data lives somewhere else.
The first is allowed. The second is a bug, and the audit fails on it.

---

## 2 · The books are Medhava's own. Complete, not a bridge.

**Medhava must be sufficient for all accounting on its own.** No accounting package is
required, ever. Tally, BUSY, Marg, Zoho and QuickBooks stay in the Connectors list for
people who already run one and want to keep it — but nothing in Medhava assumes any of them,
and no figure is ever sourced from one.

`ledger` defaults to **Medhava Books (built-in)** — "the ledger inside Medhava. Nothing else
needed." That default is a promise the code has to keep. **Module 11 · Accounting & GST is
where it is kept**, and it must deliver:

**Entered by hand, because a person decides them:**

| Voucher | For |
|---|---|
| Sales | B2B / wholesale invoices |
| Sales return / Credit note | Goods back from a B2B buyer |
| Purchase | Mill and supplier bills |
| Purchase return / Debit note | Goods sent back to a supplier |
| Payment | Money out |
| Receipt | Money in |
| Journal | Anything else — depreciation, adjustments, opening balances |
| Contra | Cash ↔ bank |

**Captured by the software, because typing them is waste:**

- **D2C / website orders** — the sale, the tax and the receipt post themselves from the
  D2C Sales app. Nobody re-keys a website order.
- **Marketplace orders** — from Marketplace OMS: the sale at gross, the commission as an
  expense, the shipping fee as an expense, the return as a credit note, each against the
  **panel and the seller account it belongs to**. One hundred pieces sold across seven
  panels and three seller accounts is one hundred entries nobody typed, each tagged.
- **Counter sales** — from POS, with the split tender.
- **Settlement** — what the panel actually paid, matched against what it should have paid.

**Worked out by Medhava, from those entries alone:**

- Trial balance · Profit & loss · Balance sheet · Cash and bank position
- Party ledgers, ageing against each party's own terms
- GSTR-1, GSTR-3B, ITC, HSN summary
- Stock valuation tied to the same movements

**The test of this rule:** switch every Connector to its built-in default, disconnect the
internet, and the business must still be fully accountable — books, GST returns and all.
If anything is missing in that state, the rule is broken.

---

## 3 · Nothing asks for an account password

Medhava connects to an outside service with a **scoped, revocable key** — never a marketplace,
bank or portal password. This is stated in-product on every Connectors screen:

> Medhava will never ask you for a marketplace, bank or account password.
> If any screen ever does, it is not Medhava.

A key can be limited to what it needs and cancelled from the other side without touching
anything else. A password cannot.

---

## 4 · Every figure is derived, never stored

A number that is saved is a number that goes stale. Promise dates, ageing buckets, expiry
dates, payouts, on-time percentages and stock positions are all recomputed on read from the
records they come from. Where a module is tempted to cache one, it does not.

---

## 5 · Gates, not warnings

Each app refuses one thing outright rather than warning about it, because a warning gets
clicked through on a busy afternoon. Every gate is also a self-test, so it cannot be
quietly bypassed and forgotten.

---

## 6 · It is not trained. It is built.

Medhava has no model that learns from your data and no behaviour that improves by being
shown examples. Every rule is written down, visible on the Wiring screen, and checked by a
self-test. That means:

- Nothing needs a training period before it is useful. It is correct on day one or it is a bug.
- Nothing silently changes behaviour later.
- Anything it does not do yet has to be **built**, and this file is where the requirement lives
  until it is.

---

## 7 · You can reach it from anywhere, but it cannot be reached into

Ask & Print (Platform, app 2) lets a plain line from your phone fetch a document or print it at
the office. That convenience is only safe because of how it is shaped:

- **The office reaches out; the internet never reaches in.** A small program on the office
  computer holds an outward connection. No open port, no fixed IP, no router change.
- **An unregistered number gets nothing** — not a document and not a reply, because a reply is
  itself information. The attempt is written to the record with the number and the time.
- **Nothing that moves money or changes a record can be asked for by message.** Pay, refund,
  approve, delete, adjust — refused for everybody including the owner. Not a permission that
  could be switched on; a shape the app does not have.
- **Reading out and printing in are different permissions.** Printing keeps the paper inside the
  building and goes straight through. Sending a copy out waits for a one-time code, delivered on
  a different channel from the one it was asked on.
- **Every request is on an append-only record**, answered or refused, with who asked and from
  where. The app adds no way to remove a line.

---

## 8 · Nothing assumes an industry

Medhava is one ERP for **manufacturing, export, trade and services alike**. A law firm opening
a case file, a workshop opening a job and a clothing house opening a style are the same record
with different words on it. So the MEDHAVA edition must read the same to all of them.

**What this means concretely — none of these may be shipped fixed:**

| Set up by the company | Never decided by the software |
|---|---|
| Production stages, and how many | "Ten stages from cutting to finishing" |
| Roles, KRAs, job profiles, pay basis | A fixed list of designations |
| What a product is — a good, a part, a formulation, a service, a case | One product shape |
| Fields on any master, and which are required | A fixed schema |
| Numbering series, tax rules, approval rules | Hard-coded series or rates |
| Units, price lists, costing method | One unit or one method |
| Document types and what they attach to | A fixed folder tree |

Every one of those is add / edit / delete by the company, per company, at any time.

**How it is enforced:** `deep/audit.js` §8 reads `site/modules.js` and every
`config_generic.js` and fails the build on trade-specific vocabulary — *karigar, saree, garment,
stitch, weaver, fabric, textile, boutique, artisan, cut plan* and the rest. It caught nine on the
day it was written, including a neutral sample buyer called "Gulf Textiles LLC".

`config_vastrangam.js` is **deliberately exempt**. That is what the second edition is for: the
neutral engine plus one file of real trade vocabulary. The engine never knows the difference —
which is the proof that a services company can put its own words in the same slot.
