# Medhava · Shipping

> AWBs, couriers & delivery status — track RTO and freight in one board.

**Real, running software** — open `app.html` by double-clicking (any modern browser, works offline). Your data is saved in the browser (localStorage) and survives refreshes.

## Screens
- **Dashboard**
- **Shipments**
- **Couriers**

## What works
A dispatch board. Shipments move booked → in-transit → delivered (or RTO). Delivery count, RTO rate and freight cost are computed live, with per-courier performance.

- Seeded with realistic demo data on first open.
- **4/4 self-tests pass** (see Backup & Health).
- Export/import a JSON backup; reload demo data; wipe — all under **Backup & Health**.
- Same teal SmartHub design system and engine kernel as every app in the suite.

## Honest limits (v1)
- Local-first, single browser. The hosted, multi-tenant version syncs the same engines to the Medhava backend (see the platform bundle).
- This is a consistent working demo, not the full depth of the flagship OMS/Accounting apps.
- Desktop-optimized; a mobile drawer nav is included.
