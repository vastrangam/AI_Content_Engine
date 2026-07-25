# Vanijo · Purchase

> Purchase orders, goods receipt & bill matching — from indent to inwards.

**Real, running software** — open `app.html` by double-clicking (any modern browser, works offline). Your data is saved in the browser (localStorage) and survives refreshes.

## Screens
- **Dashboard**
- **Purchase Orders**
- **Goods Receipt**

## What works
Raise a purchase order, receive it, and the value flows to a supplier bill. Totals and GST are computed from the order lines, and receiving an order marks stock inwards.

- Seeded with realistic demo data on first open.
- **4/4 self-tests pass** (see Backup & Health).
- Export/import a JSON backup; reload demo data; wipe — all under **Backup & Health**.
- Same teal SmartHub design system and engine kernel as every app in the suite.

## Honest limits (v1)
- Local-first, single browser. The hosted, multi-tenant version syncs the same engines to the Vanijo backend (see the platform bundle).
- This is a consistent working demo, not the full depth of the flagship OMS/Accounting apps.
- Desktop-optimized; a mobile drawer nav is included.
