# Medhava · Expenses

> Spend capture, categories & approvals — every rupee accounted, by head.

**Real, running software** — open `app.html` by double-clicking (any modern browser, works offline). Your data is saved in the browser (localStorage) and survives refreshes.

## Screens
- **Dashboard**
- **Expenses**
- **Add Expense**

## What works
Log an expense against a category; approvals gate what counts as committed spend. Totals by category and approved-vs-pending are computed live from the entries.

- Seeded with realistic demo data on first open.
- **4/4 self-tests pass** (see Backup & Health).
- Export/import a JSON backup; reload demo data; wipe — all under **Backup & Health**.
- Same teal SmartHub design system and engine kernel as every app in the suite.

## Honest limits (v1)
- Local-first, single browser. The hosted, multi-tenant version syncs the same engines to the Medhava backend (see the platform bundle).
- This is a consistent working demo, not the full depth of the flagship OMS/Accounting apps.
- Desktop-optimized; a mobile drawer nav is included.
