# Medhava Suite — Batch 1 (Books & Selling core)

Eight real, single-file business apps that share **one engine kernel** and **one SmartHub-teal
design system** — the same visual language and architecture as the flagship Medhava OMS.

## What's in this zip

| # | App | What it does | Self-tests |
|---|-----|--------------|-----------|
| 01 | **Accounting** | Double-entry ledger — post a voucher, Trial Balance always balances; P&L + GST computed from postings | 4/4 |
| 02 | **Inventory** | Multi-location stock, valuation at cost, transfers that conserve units, reorder suggestions | 4/4 |
| 03 | **Purchase** | Purchase orders → goods receipt, GST-inclusive value from lines | 4/4 |
| 04 | **Vendors** | Supplier master, payables, aging buckets against today, live payments | 4/4 |
| 05 | **Invoicing** | GST tax invoices, receipts, outstanding — totals to the paise | 4/4 |
| 06 | **Expenses** | Spend capture by category, approvals, committed-vs-pending | 4/4 |
| 07 | **CRM** | Leads, pipeline stages, win-rate, advance-to-Won | 4/4 |
| 08 | **Catalog / PIM** | Product records scored on 9 attributes; only 100% = channel-ready | 4/4 |

**32/32 self-tests pass. Every app verified twice: engine tests in Node, then rendered in a
real headless browser (all views, all actions, zero console errors).**

## How to use (like the OMS app)

1. Open any `<app>/app.html` by **double-clicking** it — any modern browser, **works offline**,
   no install, no server.
2. It opens seeded with realistic Vastrangam demo data.
3. Your changes are saved in the browser (localStorage) and survive refreshes.
4. Each app has a **Backup & Health** screen: export/import a JSON backup, reload demo data,
   wipe, and view the live self-test results.
5. Each folder also has a `guide.md` — a plain-English page on what that app does and its limits.

## Architecture (shared across all 40)

- **One kernel** (`Medhava.app(spec)`) renders the shell, nav, tables, KPIs, forms, toasts,
  persistence and self-tests. Each app is just a small *spec*: seed data + screens + actions
  + tests. That's how the suite stays consistent and how new apps stay small.
- **One design system** — the SmartHub teal theme (system fonts, so each file is ~30 KB, not 600 KB).
- **DOM-free engines** — every app's math (seed + tests) runs headless in Node, which is how the
  whole suite is verified without a browser.

## Honest scope

These are **consistent working demos** — genuinely interactive, real calculations, self-tested —
sharing the OMS design and engine, but not each carrying the full depth of the flagship
OMS/Accounting apps. They are local-first (single browser). The hosted, multi-tenant version
syncs the same engines to the Medhava backend (see the platform bundle), where real marketplace
integrations use **revocable, scoped API keys** stored in an encrypted vault — never account
passwords.

Batches 2–5 (the remaining 32 apps) follow, delivered the same way.
