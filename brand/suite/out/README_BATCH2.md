# Medhava Suite — Batch 2 (Operations, Making & People)

Eight more real, single-file apps on the **same engine kernel** and **SmartHub-teal design
system** as Batch 1 and the flagship OMS. These cover everything that happens *around* an order —
fulfilling it, shipping it, taking it back, getting paid, picking it, making it, and paying the
people who do.

## What's in this zip

| # | App | What it does | Self-tests |
|---|-----|--------------|-----------|
| 09 | **Sales Orders** | One order book across Website/Flipkart/Myntra/Amazon/Retail; new→packed→shipped→delivered; revenue splits by channel | 4/4 |
| 10 | **Shipping** | AWBs, couriers, booked→in-transit→delivered/RTO, RTO-rate + freight, per-courier performance | 4/4 |
| 11 | **Returns / RMA** | requested→approved→received→refunded, refund value, reason mix, return rate | 4/4 |
| 12 | **Reconciliation** | Marketplace payout vs order — net due (expected−fee), variance, shorts to chase | 4/4 |
| 13 | **Warehouse** | Bin-level pick lists, pick progress, auto-complete, bin map | 4/4 |
| 14 | **Production** | Karigar work orders, cutting→stitching→finishing→done, piece-rate wages payable | 4/4 |
| 15 | **Materials / BOM** | Raw-material store + costed bills of materials (a rate change reprices every product) | 4/4 |
| 16 | **HR / Payroll** | Headcount, attendance, pro-rated payroll (base × present ÷ working days) | 4/4 |

**32/32 self-tests pass. Every app verified twice: engine tests in Node, then rendered in a
real headless browser (all views, all actions, zero console errors).**

## How to use

Identical to Batch 1: double-click any `<app>/app.html` — any modern browser, **works offline**,
seeded demo data, saved in the browser, with a **Backup & Health** screen (export/import JSON,
reload demo data, wipe, live self-tests). Each folder has a plain-English `guide.md`.

## Progress

- **Batch 1 (Books & Selling):** Accounting, Inventory, Purchase, Vendors, Invoicing, Expenses, CRM, Catalog/PIM ✓
- **Batch 2 (Operations, Making & People):** the eight above ✓
- **16 / 40 apps done.** Batches 3–5 (the remaining 24) follow the same pattern.

Same honest scope as Batch 1: consistent, genuinely-interactive working demos that share the OMS
design + engine — local-first, not each at full flagship depth. Real marketplace sync happens in
the hosted platform using revocable, scoped API keys in an encrypted vault — never account passwords.
