# Vanijo · Procurement — **Vastrangam** build (Format B)

> Module 1 · Supply Chain & Procurement — App 1 of 6
> RFQ → PO → GRN → 3-way match → vendor scorecard, wired to Stock, Finance (BUSY), Manufacturing/Karigar.

**What this file is.** The *complete, copy-pasteable build prompt* for the Vastrangam Procurement app — every entity, field, seed row, screen, formula, rule, wiring link, and self-test. Nothing is summarised away. Paste the fenced block below into a capable code model (or hand it to a developer) and you get back the exact single-file app shipped as `procurement_Vastrangam.html`.

- **Deliverable app:** `procurement_Vastrangam.html` — one file, opens by double-click, works **offline**, saves to `localStorage`, ships a **14-test** self-check.
- **Verified:** 14/14 engine self-tests pass in Node; all 9 screens render in a real browser with **zero console errors**.
- **Companion generic build:** `procurement_ERP.html` (any industry) — identical engine, neutral data.

---

## The complete build prompt

```prompt
ROLE
You are building ONE self-contained business app: "Vanijo Procurement" for Vastrangam
(ethnic-wear D2C + marketplace seller; fabric/zari/trims sourced from the Surat–Jaipur base).
It is App 1 of Module 1 (Supply Chain & Procurement) in the Vanijo ERP suite.

OBJECTIVE
Deliver the buy-side procure-to-pay flow — RFQ → Purchase Order → Goods Receipt (GRN) →
3-way match → vendor scorecard — such that ACCEPTED quantity (never ordered quantity) drives
Stock and Input Tax Credit, and no over-billed or mispriced supplier invoice can be paid.

NON-NEGOTIABLE TECH CONSTRAINTS
- Output is a SINGLE HTML file. No build step, no external network calls, no CDN.
- Works fully OFFLINE by double-clicking the file in any modern browser.
- State persists in localStorage under key "vanijo_procurement_vastrangam_v1"; survives refresh.
- Ships a JSON backup: export / import / reload-demo / wipe, on a "Backup & Health" screen.
- Ships a self-test harness that runs on boot and shows pass/fail on the Backup & Health screen.
- Design system: "SmartHub teal" — dark-teal sidebar (#12312d), teal primary (#0fae90),
  mint canvas (#edf5f2), white cards, system fonts. Left sidebar nav grouped; top bar with
  company + FY pills + status; mobile hamburger drawer; print-friendly.
- All money in ₹ en-IN with 2 decimals. All rounding to 2 dp via r2(n)=round(n*100)/100.

SHARED DATA CORE (the wiring backbone — conceptual; this app owns Vendor/PO/GRN/Invoice/RFQ)
Item/SKU · Party (vendor) · Stock · Ledger/Voucher · Order. Every module reads/writes these.

DATA MODEL (entities + fields)
Vendor       { id, name, gstin, cat (category), terms }
Item         { code, name, uom, stdRate }            // std rate = benchmark purchase rate
PurchaseOrder{ id, vendor(id), date, expected, status: draft|approved|partial|received|closed,
               lines:[ { item(code), qty, rate, tax(gst %) } ] }
GRN          { id, po(id), date, onTime(bool),
               lines:[ { item(code), ordered, received, accepted, rejected } ] }
Invoice/Bill { id, po(id), vendor(id), date, lines:[ { item(code), qty, rate, tax } ] }
RFQ          { id, item(code), qty, status:open|awarded, date, awarded(vendorId|null),
               quotes:[ { vendor(id), rate, lead(days) } ] }
seq          { po, grn, rfq }                          // running counters for new ids

SEED DATA (exact — load on first open)
Vendors (Vastrangam supply base):
  V1 Jagdamba Textiles (Surat)  GSTIN 24ABCDE1234F1Z5  cat "Silk fabric"    terms "30 days"
  V2 Kanchi Silks               GSTIN 33KANCH5678K1Z2  cat "Zari & silk"    terms "15 days"
  V3 Surat Cotton Mills         GSTIN 24SURAT9012M1Z8  cat "Cotton fabric"  terms "45 days"
  V4 Rungta Lining House        GSTIN 24RUNGT3456L1Z1  cat "Lining & trims" terms "30 days"
  V5 Zari Works Jaipur          GSTIN 08ZARI3456J1Z1   cat "Zari thread"    terms "COD"
Items:
  ITM-01 Banarasi silk fabric  uom m     stdRate 280
  ITM-02 Cotton fabric (44")   uom m     stdRate 90
  ITM-03 Zari thread           uom reel  stdRate 150
  ITM-04 Cotton lining         uom m     stdRate 35
  ITM-05 Gota / dye finishing  uom kg    stdRate 210
Purchase Orders:
  PO-1001 V1 date 2026-06-28 expected 2026-07-03 status received  line: ITM-01 qty 100 rate 280 tax 5
  PO-1002 V2 date 2026-06-30 expected 2026-07-04 status received  line: ITM-03 qty 50  rate 150 tax 12
  PO-1003 V3 date 2026-07-05 expected 2026-07-12 status approved  line: ITM-02 qty 300 rate 90  tax 5
  PO-1004 V4 date 2026-07-02 expected 2026-07-08 status partial   line: ITM-04 qty 200 rate 35  tax 5
GRNs:
  GRN-501 po PO-1001 date 2026-07-02 onTime true   line: ITM-01 ordered 100 received 100 accepted 96 rejected 4
  GRN-502 po PO-1002 date 2026-07-06 onTime false  line: ITM-03 ordered 50  received 50  accepted 50 rejected 0
  GRN-503 po PO-1004 date 2026-07-07 onTime true   line: ITM-04 ordered 200 received 180 accepted 180 rejected 0
Invoices/Bills:
  BILL-9001 po PO-1001 vendor V1 date 2026-07-03  line: ITM-01 qty 100 rate 280 tax 5   // bills 100 vs 96 accepted → exception
  BILL-9002 po PO-1002 vendor V2 date 2026-07-07  line: ITM-03 qty 50  rate 165 tax 12  // 150→165 → price exception
RFQ:
  RFQ-01 item ITM-05 qty 20 status open date 2026-07-09 awarded null
    quotes: V5 rate 220 lead 7 · V1 rate 240 lead 5 · V3 rate 210 lead 9   // lowest = V3 @ 210

FORMULAS & BUSINESS RULES (compute; never store what can be derived)
- lineNet(l)   = r2(qty * rate)
- lineTax(l)   = r2(qty * rate * tax/100)
- poNet(po)    = r2(Σ lineNet)      poTax(po) = r2(Σ lineTax)      poGross = r2(poNet + poTax)
- GRN: received = Σ received ; accepted = Σ accepted ; rejected = Σ rejected.
  Invariant: accepted + rejected == received, and received <= ordered.
- ITC (Input Tax Credit) is claimable ONLY on ACCEPTED value:
  itc = r2( Σ over GRNs Σ over lines ( accepted * PO.rate * PO.tax/100 ) ).
- 3-WAY MATCH (PO ↔ GRN ↔ Invoice), price tolerance TOL = 0.5% (0.005):
  For each invoice line, raise an exception if ANY of:
    • |invoice.rate − PO.rate| / PO.rate > TOL           → "price X→Y"
    • invoice.qty > GRN.accepted                          → "billed N > accepted M"
    • invoice.qty > PO.qty                                → "billed N > ordered M"
  A bill passes (ready to pay) only when it has zero exceptions.
- VENDOR SCORECARD (from GRN/PO history; null when no deliveries):
    onTime%  = round( onTimeGRNs / totalGRNs * 100 )
    quality% = round( accepted / received * 100 )        // accept rate
    fill%    = round( received / ordered * 100 )
    score    = round( mean of the available metrics among {onTime, quality, fill} )
  Rank vendors by score desc; badge grn>=90, amb 70–89, red<70.
- RFQ AWARD: pick the quote with the lowest rate; awarding creates an approved PO
  (vendor=winner, qty=rfq.qty, rate=winning rate, tax=5) and sets rfq.awarded.
- NEW PO via quick form: status "approved", expected = date+7d; appears under Goods Receipt.
- POST GRN against an approved PO: received clamped to ordered, rejected clamped to received,
  accepted = received − rejected; PO.status = received if received>=ordered else partial.

SCREENS (left-nav order; each has a crumb, H1, subtitle)
Group "Buying":
 1) Dashboard  — KPIs: Open POs · Open PO value (Σ gross of not-received) · Pending GRN
    (approved|partial) · 3-way exceptions · ITC claimable. Panels: Recent POs table;
    "Raise a quick PO" form (vendor, item, qty, rate, GST%) → creates PO, shows cascade note.
 2) RFQ & Quotes — per RFQ: quote table (vendor, quoted rate, lead days, line value), "lowest"
    tag on cheapest; "Award lowest → create PO" button (hidden once awarded).
 3) Purchase Orders — per PO: line table (item, qty, rate, GST%, Net, Tax) + Net/GST/Gross/Expected.
 4) Goods Receipt — per GRN: line table (ordered, received, accepted, rejected) + "→ Stock IN
    (accepted)" and "→ Rejected (debit note)"; plus a "Receive an approved PO" form
    (PO, received qty, rejected qty) → posts GRN.
Group "Control":
 5) 3-Way Match — KPI row (bills checked, matched, exceptions); per bill a PO/GRN/Invoice
    comparison table and a green "safe to pass" or red "Held: …reasons" box.
 6) Vendor Scorecard — ranked table (deliveries, on-time, quality, fill, score badge) +
    a "quality by vendor" bar list.
Group "Master & Wiring":
 7) Vendors — vendor master table + item master table.
 8) Wiring — a note naming the shared Data Core; an "Outbound data flows (this app → others)"
    table; a live "GRN-501 cascade" 5-step example (Stock IN +96, payable+ITC ₹1,344.00 to
    Jagdamba, debit note on 4 rejects, scorecard recompute); an "Inbound (others → Procurement)"
    table (Manufacturing/Karigar requirements, Inventory reorder alerts, Master Data, Automation).
System (auto-added by kernel):
 9) Backup & Health — export/import/reload/wipe + the 14 self-test results.

WIRING (must be shown in-app and be literally true of the engine)
OUTBOUND:
  GRN accepted metres        → Inventory/Stock : Fabric IN, single stock per SKU, ready for cutting
  Supplier invoice (matched) → Finance/BUSY    : vendor payable + ITC on accepted fabric value
  GRN rejected metres        → Quality+Finance : debit note to mill + quality flag on scorecard
  Accepted fabric            → Manufacturing   : feeds BOM & cut plan; cost-per-piece uses this rate
  RFQ awarded                → Master Data      : preferred mill + agreed rate for that fabric
  Vendor scorecard           → Sourcing         : on-time/quality steers next season's buying
INBOUND:
  Manufacturing/Karigar : production plan + BOM raise fabric requirements → requisitions
  Inventory             : below-reorder fabric alerts trigger a PO suggestion
  Master Data           : design/SKU master, mill master, HSN 5007/5208 & GST rates
  Automation            : "If silk stock < reorder then draft PO to Jagdamba Textiles"

SELF-TESTS (run on boot; all must PASS; show on Backup & Health)
 1  PO net = qty × rate ............................... poNet(PO-1001) == 100*280 (28000)
 2  PO tax = qty × rate × gst% ....................... poTax(PO-1001) == r2(100*280*0.05) (1400)
 3  PO gross = net + tax ............................. poGross == r2(net+tax) (29400)
 4  GRN accepted + rejected = received ............... 96 + 4 == 100
 5  GRN received ≤ ordered ........................... 100 <= 100
 6  ITC on accepted value only ....................... itc == r2(96*280*.05 + 50*150*.12 + 180*35*.05) (2559.00)
 7  3-way flags price mismatch ....................... BILL-9002 is an exception (150→165)
 8  3-way flags over-billing vs accepted ............. BILL-9001 is an exception (100 > 96)
 9  exactly 2 bills, both exceptions ................. matchRows==2 and exceptions==2
10  V1 quality = 96% ................................. 96 accepted / 100 received
11  V1 on-time = 100% ................................ 1 on-time / 1 delivery
12  V2 on-time = 0% .................................. late delivery
13  V4 fill rate = 90% ............................... 180 received / 200 ordered
14  RFQ award picks lowest quote ..................... award(RFQ-01).vendor == V3 (@210)

ACCEPTANCE
- Opens offline; seeded; all 9 screens navigable; forms mutate and persist.
- 14/14 self-tests green. No console errors. Money formatted ₹ en-IN.
- 3-way match blocks BILL-9001 and BILL-9002 with the stated reasons.
- Wiring screen shows the GRN-501 cascade with ITC ₹1,344.00 to Jagdamba Textiles.

HONEST LIMITS (state plainly; do not overclaim)
- Local-first, single browser. The hosted multi-tenant version syncs the same engine to the
  Vanijo backend (Postgres + RLS + event bus), where Stock/Ledger truly update across modules.
- Real marketplace/BUSY/bank connections use revocable, SCOPED API keys held in an encrypted
  vault — NEVER account passwords.
- One line per PO/GRN/invoice in the demo seed (engine supports multi-line); multi-currency,
  landed-cost apportionment, and vendor-portal quoting are hosted-tier features.
```

---

## How to check it works (acceptance you can run)
1. **Double-click `procurement_Vastrangam.html`** — it opens offline, seeded with the data above.
2. **Backup & Health** → confirm **14/14 self-tests pass**.
3. **3-Way Match** → BILL-9001 held (*billed 100 > accepted 96*), BILL-9002 held (*price 150→165*).
4. **Goods Receipt** → each GRN shows *→ Stock IN (accepted)*; GRN-501 shows 4 rejected → debit note.
5. **Vendor Scorecard** → Jagdamba 96% quality / 100% on-time; Kanchi 0% on-time (late); Rungta 90% fill.
6. **RFQ & Quotes** → *Award lowest → create PO* awards Surat Cotton Mills' item to **V3 @ ₹210** and spawns a PO.
7. **Wiring** → the GRN-501 cascade proves the numbers flow to Stock, Finance (ITC ₹1,344), Quality, Scorecard.

## Files in this app's set
- `procurement_Vastrangam.html` — the working tool (this build)
- `procurement_ERP.html` — the any-industry twin (identical engine)
- `Vanijo_Procurement_Vastrangam.pdf` — the full illustrated tour (this doc's companion)
- `GUIDE_Vastrangam.md` — this file (the complete build prompt)
