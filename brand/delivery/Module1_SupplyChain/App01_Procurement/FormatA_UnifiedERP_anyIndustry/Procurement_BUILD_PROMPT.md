# Vanijo · Procurement — **Unified ERP** build (Format A, any industry)

> Module 1 · Supply Chain & Procurement — App 1 of 6
> RFQ → PO → GRN → 3-way match → vendor scorecard, wired to Stock, Finance, Manufacturing/Planning.

**What this file is.** The *complete, copy-pasteable build prompt* for the industry-neutral Procurement app — every entity, field, seed row, screen, formula, rule, wiring link, and self-test. Paste the fenced block below into a capable code model (or hand to a developer) and you get back `procurement_ERP.html`. It drops into **any** industry — textile, medical, manufacturing, or services — by swapping only the vendor/item names (the engine and tests are identical to the Vastrangam twin).

- **Deliverable app:** `procurement_ERP.html` — one file, opens by double-click, works **offline**, saves to `localStorage`, ships a **14-test** self-check.
- **Verified:** 14/14 engine self-tests pass in Node; all 9 screens render in a real browser with **zero console errors**.

---

## The complete build prompt

```prompt
ROLE
You are building ONE self-contained business app: "Vanijo Procurement", an INDUSTRY-NEUTRAL
procure-to-pay module (App 1 of Module 1, Supply Chain & Procurement) in the Vanijo ERP suite.
It must work unchanged for any company in any sector (textile, medical, manufacturing, services)
by editing only the vendor/item master — the logic is universal.

OBJECTIVE
Deliver the buy-side flow — RFQ → Purchase Order → Goods Receipt (GRN) → 3-way match →
vendor scorecard — such that ACCEPTED quantity (never ordered quantity) drives Stock and Input
Tax Credit, and no over-billed or mispriced supplier invoice can be paid.

NON-NEGOTIABLE TECH CONSTRAINTS
- Output is a SINGLE HTML file. No build step, no external network calls, no CDN.
- Works fully OFFLINE by double-clicking the file in any modern browser.
- State persists in localStorage under key "vanijo_procurement_erp_v1"; survives refresh.
- Ships a JSON backup: export / import / reload-demo / wipe, on a "Backup & Health" screen.
- Ships a self-test harness that runs on boot and shows pass/fail on the Backup & Health screen.
- Design system: "SmartHub teal" — dark-teal sidebar (#12312d), teal primary (#0fae90),
  mint canvas (#edf5f2), white cards, system fonts. Grouped left nav; top bar with company + FY
  pills + status; mobile hamburger drawer; print-friendly.
- Money in ₹ en-IN, 2 decimals. Rounding via r2(n)=round(n*100)/100. (Currency symbol is a config.)

SHARED DATA CORE (wiring backbone — conceptual; this app owns Vendor/PO/GRN/Invoice/RFQ)
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
seq          { po, grn, rfq }

SEED DATA (exact — load on first open; NEUTRAL placeholders, swap per industry)
Vendors:
  V1 Alpha Industrial Supplies GSTIN 27AAAAA0001A1Z1 cat "Raw material" terms "30 days"
  V2 Beta Components Ltd       GSTIN 29BBBBB0002B1Z2 cat "Components"   terms "15 days"
  V3 Gamma Materials Co        GSTIN 24GGGGG0003C1Z3 cat "Raw material" terms "45 days"
  V4 Delta Trading             GSTIN 07DDDDD0004D1Z4 cat "Consumables"  terms "30 days"
  V5 Epsilon Enterprises       GSTIN 19EEEEE0005E1Z5 cat "Packaging"    terms "COD"
Items:
  ITM-01 Primary raw material   uom kg  stdRate 280
  ITM-02 Secondary raw material uom kg  stdRate 90
  ITM-03 Precision component    uom pc  stdRate 150
  ITM-04 Lining / substrate     uom m   stdRate 35
  ITM-05 Finishing consumable   uom kg  stdRate 210
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
    score    = round( mean of available metrics among {onTime, quality, fill} )
  Rank vendors by score desc; badge grn>=90, amb 70–89, red<70.
- RFQ AWARD: pick the lowest-rate quote; awarding creates an approved PO (vendor=winner,
  qty=rfq.qty, rate=winning rate, tax=5) and sets rfq.awarded.
- NEW PO via quick form: status "approved", expected = date+7d; appears under Goods Receipt.
- POST GRN vs approved PO: received clamped to ordered, rejected clamped to received,
  accepted = received − rejected; PO.status = received if received>=ordered else partial.

SCREENS (left-nav order; each has crumb, H1, subtitle)
Group "Buying":  1) Dashboard  2) RFQ & Quotes  3) Purchase Orders  4) Goods Receipt
Group "Control": 5) 3-Way Match  6) Vendor Scorecard
Group "Master & Wiring": 7) Vendors (+ item master)  8) Wiring
System: 9) Backup & Health (auto).
 1) Dashboard — KPIs: Open POs · Open PO value (Σ gross not-received) · Pending GRN
    (approved|partial) · 3-way exceptions · ITC claimable. Panels: Recent POs; "Raise a quick PO"
    form (vendor, item, qty, rate, GST%) → creates PO with a cascade note.
 2) RFQ & Quotes — per RFQ: quote table (vendor, quoted rate, lead days, line value); "lowest"
    tag on cheapest; "Award lowest → create PO" (hidden once awarded).
 3) Purchase Orders — per PO: line table (item, qty, rate, GST%, Net, Tax) + Net/GST/Gross/Expected.
 4) Goods Receipt — per GRN: ordered/received/accepted/rejected + "→ Stock IN (accepted)" and
    "→ Rejected (debit note)"; plus "Receive an approved PO" form (PO, received, rejected).
 5) 3-Way Match — KPI row (bills checked, matched, exceptions); per bill a PO/GRN/Invoice compare
    table + green "safe to pass" or red "Held: …reasons".
 6) Vendor Scorecard — ranked table (deliveries, on-time, quality, fill, score badge) + quality bars.
 7) Vendors — vendor master + item master tables.
 8) Wiring — shared Data Core note; "Outbound data flows" table; live "GRN-501 cascade" 5-step
    example (Stock IN +96, payable+ITC on accepted value, debit note on 4 rejects, scorecard
    recompute); "Inbound (others → Procurement)" table.
 9) Backup & Health — export/import/reload/wipe + 14 self-test results.

WIRING (shown in-app; literally true of the engine)
OUTBOUND:
  GRN accepted qty        → Inventory/Stock : Stock IN at receiving location (single source of truth)
  Supplier invoice(match) → Finance/Ledger  : vendor payable + ITC on accepted value
  GRN rejected qty        → Quality+Finance : debit note to vendor + quality flag on scorecard
  PO approved             → Budget/Commit    : committed spend vs cost centre / budget
  RFQ awarded             → Master Data      : preferred-vendor + agreed price for the item
  Vendor scorecard        → Master Data      : on-time/quality rating drives future sourcing
INBOUND:
  Manufacturing/Planning : reorder & material requirements raise purchase requisitions
  Inventory              : below-reorder alerts trigger a PO suggestion
  Master Data            : item master, vendor master, tax/HSN rates
  Automation             : "If stock < reorder then draft PO to preferred vendor"

SELF-TESTS (run on boot; all PASS; show on Backup & Health)
 1  PO net = qty × rate ............ poNet(PO-1001) == 100*280 (28000)
 2  PO tax = qty × rate × gst% ..... poTax(PO-1001) == r2(100*280*0.05) (1400)
 3  PO gross = net + tax ........... 29400
 4  GRN accepted + rejected = received .. 96 + 4 == 100
 5  GRN received ≤ ordered ......... 100 <= 100
 6  ITC on accepted value only ..... r2(96*280*.05 + 50*150*.12 + 180*35*.05) == 2559.00
 7  3-way flags price mismatch ..... BILL-9002 (150→165)
 8  3-way flags over-billing ....... BILL-9001 (100 > 96 accepted)
 9  exactly 2 bills, both exceptions .. matchRows==2, exceptions==2
10  V1 quality = 96% ............... 96/100
11  V1 on-time = 100% .............. 1/1
12  V2 on-time = 0% ................ late
13  V4 fill rate = 90% ............. 180/200
14  RFQ award picks lowest ......... award(RFQ-01).vendor == V3 (@210)

ACCEPTANCE
- Opens offline; seeded; 9 screens navigable; forms mutate and persist.
- 14/14 self-tests green. No console errors. Money formatted ₹ en-IN.
- 3-way match blocks BILL-9001 and BILL-9002 with the stated reasons.
- Wiring screen shows the GRN-501 cascade with ITC ₹1,344.00 on the accepted 96 units.

INDUSTRY-SWAP GUIDE (how "any company" adopts it)
- Textile:  vendors=mills, items=fabric/zari/trims, uom=m/reel, HSN 5007/5208.
- Medical:  vendors=distributors, items=consumables/devices, uom=box/pc, add batch+expiry.
- Manufacturing: vendors=suppliers, items=raw/components, uom=kg/pc, tie to BOM.
- Services:  vendors=subcontractors, items=SKU-less service lines, GRN=service acceptance.
Only the master data changes; formulas, 3-way match, scorecard, and tests stay identical.

HONEST LIMITS (state plainly)
- Local-first, single browser. The hosted multi-tenant version syncs the same engine to a
  backend (Postgres + RLS + event bus) where Stock/Ledger update across modules for real.
- Real ERP/bank/marketplace connections use revocable, SCOPED API keys in an encrypted vault —
  NEVER account passwords.
- Demo seed is one line per document (engine supports multi-line); multi-currency, landed-cost
  apportionment, and vendor-portal quoting are hosted-tier features.
```

---

## How to check it works
1. **Double-click `procurement_ERP.html`** — opens offline, seeded.
2. **Backup & Health** → **14/14 self-tests pass**.
3. **3-Way Match** → BILL-9001 held (*billed 100 > accepted 96*), BILL-9002 held (*price 150→165*).
4. **Vendor Scorecard** → Alpha 96% quality / 100% on-time; Beta 0% on-time; Delta 90% fill.
5. **RFQ & Quotes** → *Award lowest → create PO* → **V3 (Gamma) @ ₹210**, spawns a PO.
6. **Wiring** → GRN-501 cascade to Stock, Finance (ITC ₹1,344 on 96 accepted), Quality, Scorecard.

## Files in this app's set
- `procurement_ERP.html` — the working tool (this build)
- `procurement_Vastrangam.html` — the Vastrangam twin (identical engine)
- `Vanijo_Procurement_ERP.pdf` — the full illustrated tour
- `GUIDE_ERP.md` — this file (the complete build prompt)
