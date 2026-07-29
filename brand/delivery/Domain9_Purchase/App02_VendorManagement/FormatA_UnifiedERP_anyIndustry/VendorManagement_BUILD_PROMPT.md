# Medhava · Vendor Management — **Unified ERP** build (Format A, any industry)

> Domain 9 · Purchase — App 2 of 2
> Vendor 360 → bills & payments → aging → risk → performance-based sourcing, wired to Procurement, Finance and Quality.

**What this file is.** The *complete, copy-pasteable build prompt* for the industry-neutral Vendor Management app — every entity, field, seed row, screen, formula, rule, wiring link, and self-test. Nothing summarised away. Paste the fenced block into a capable code model (or hand it to a developer) and you get back exactly `vendors_ERP.html`.

- **Deliverable app:** one file, opens by double-click, works **offline**, saves to `localStorage`, ships a **14-test** self-check.
- **Verified:** 14/14 engine self-tests pass in Node; all 9 screens render in a real browser with **zero console errors**.

---

## The complete build prompt

```prompt
ROLE
You are building ONE self-contained business app: "Medhava Vendor Management", an INDUSTRY-NEUTRAL supplier master.
It must work unchanged for any company in any sector (textile, medical, manufacturing, services)
by editing only the vendor master — the logic is universal.
It is App 2 of Domain 9 (Purchase) in the Medhava ERP suite, and the partner app to Procurement.

OBJECTIVE
Give one supplier truth: who each supplier is, what you have spent with them, what you still owe,
how they actually perform, and how risky they are — then let SOURCING FOLLOW EVIDENCE by naming
the best-performing supplier per category instead of relying on habit or relationship.

NON-NEGOTIABLE TECH CONSTRAINTS
- Output is a SINGLE HTML file. No build step, no external network calls, no CDN.
- Works fully OFFLINE by double-clicking the file in any modern browser.
- State persists in localStorage under key "medhava_vendors_erp_v1"; survives refresh.
- JSON backup: export / import / reload-demo / wipe on a "Backup & Health" screen.
- A self-test harness runs on boot and shows pass/fail on Backup & Health.
  CRITICAL: tests must run against a DEEP COPY of the database. A self-test must never mutate
  live data (a test that pays a bill would silently corrupt the user's books on every launch).
- Design system "Medhava": deep-navy sidebar (#141c3a), brand blue (#2f5de0), violet accent
  (#5b3fd6), pale-blue canvas (#f2f5fc), white cards, system fonts. Logo = white "M" monogram
  with a dot, on brand blue. Grouped left nav; top bar with company + FY pills; mobile drawer;
  print-friendly.
- Money in ₹ en-IN with 2 decimals. Rounding r2(n)=round(n*100)/100.
- Fix "today" as TODAY = '2026-07-25' so aging is deterministic and testable.

SHARED DATA CORE (this app OWNS the Party/vendor entity)
Item/SKU · Party (vendor) · Stock · Ledger/Voucher · Order.

DATA MODEL
Vendor    { id, name, gstin, cat (category), terms, loc }
Bill      { id, vendor(id), date, due, amount, paid }
Delivery  { vendor(id), ordered, received, accepted, onTime(bool) }   // performance history
seq       { b }                                                       // bill counter
sel       // currently selected vendor for the 360 screen

SEED DATA (exact — load on first open)
Vendors (NEUTRAL placeholders — swap per industry):
  V1 Alpha Industrial Supplies  27AAAAA0001A1Z1  cat "Raw material"  terms "30 days"  Pune, MH
  V2 Beta Components Ltd        29BBBBB0002B1Z2  cat "Components"    terms "15 days"  Bengaluru, KA
  V3 Gamma Materials Co         24GGGGG0003C1Z3  cat "Raw material"  terms "45 days"  Surat, GJ
  V4 Delta Trading              07DDDDD0004D1Z4  cat "Consumables"   terms "30 days"  New Delhi, DL
  V5 Epsilon Enterprises        19EEEEE0005E1Z5  cat "Packaging"     terms "COD"      Kolkata, WB
Bills:
  BILL-9001 V1 date 2026-06-05 due 2026-07-05 amount 203700 paid 203700   // settled
  BILL-9002 V1 date 2026-06-28 due 2026-07-28 amount 148900 paid  50000   // part-paid, not yet due
  BILL-9003 V2 date 2026-06-10 due 2026-06-25 amount  92400 paid      0   // 30 days late
  BILL-9004 V3 date 2026-07-02 due 2026-08-16 amount 189500 paid      0   // not yet due
  BILL-9005 V4 date 2026-04-20 due 2026-05-10 amount  64000 paid      0   // 76 days late
  BILL-9006 V5 date 2026-07-10 due 2026-07-10 amount  44000 paid  44000   // settled
  BILL-9007 V2 date 2026-07-15 due 2026-07-30 amount  57800 paid      0   // not yet due
Deliveries (drives performance):
  V1 ordered 100 received 100 accepted  96 onTime true
  V1 ordered  60 received  60 accepted  60 onTime true
  V2 ordered  50 received  50 accepted  50 onTime FALSE
  V2 ordered  80 received  72 accepted  70 onTime FALSE
  V3 ordered 300 received 300 accepted 297 onTime true
  V4 ordered 200 received 180 accepted 180 onTime true
  V5 ordered  20 received  20 accepted  19 onTime true

FORMULAS & BUSINESS RULES (compute; never store what can be derived)
- outstanding(bill) = r2(max(0, amount − paid))              // never negative on overpay
- daysLate(bill)    = days(due → TODAY)
- bucket(bill)      = 'paid' if outstanding <= 0
                      else 'current' if daysLate <= 0
                      else '1-30'   if daysLate <= 30
                      else '31-60'  if daysLate <= 60
                      else '60+'
- payable(vendor?)  = r2(Σ outstanding of matching bills)
- overdue(vendor?)  = bills with outstanding > 0 AND daysLate > 0
- spend(vendor)     = r2(Σ amount of that vendor's bills)     // gross billed, not net of payment
- sharePct(vendor)  = round(spend(vendor) / totalSpend × 100)
- PERFORMANCE per vendor (null when no delivery history):
    onTime%  = round(onTimeDeliveries / totalDeliveries × 100)
    quality% = round(Σaccepted / Σreceived × 100)             // accept rate at inspection
    fill%    = round(Σreceived / Σordered × 100)
    score    = round(mean of the available metrics)
- RISK per vendor, 0 best … 100 worst, three independent signals:
    performance risk  = 25 if no history, else round((100 − score) × 0.5)   // max 50
    concentration risk= min(30, round(sharePct × 0.6))                       // max 30
    discipline risk   = min(20, overdueBillCount × 10)                       // max 20
    risk = min(100, sum)      band: <=25 low · <=50 medium · >50 high
  RATIONALE: a supplier can be excellent AND risky — if too much of your spend sits with them,
  their failure becomes your failure. Concentration must count even at 99% performance.
- PREFERRED VENDOR (per category, and overall) = highest performance score among rated vendors.
- Paying a bill: paid += min(amount entered, outstanding)     // cannot overpay
- Adding a bill: id = 'BILL-' + (++seq.b), date = TODAY, paid = 0

DERIVED VALUES THE DEMO MUST PRODUCE (use to verify your build)
  total spend 800300 · total payable 502600 · overdue 2 bills worth 156400
  buckets: current 346200 · 1-30 92400 · 31-60 0 · 60+ 64000
  shares:  V1 44% · V3 24% · V2 19% · V4 8% · V5 5%   (sums to 100%)
  scores:  V3 100 · V1 99 · V5 98 · V4 97 · V2 64
  risk:    V2 39 (medium) · V1 27 (medium) · V4 17 (low) · V3 14 (low) · V5 4 (low)
  NOTE V1 is medium-risk despite 99% performance — purely from 44% spend concentration.

SCREENS (left-nav order; each has crumb, H1, subtitle)
Group "Vendors":
 1) Dashboard — KPIs: Vendors · Total payable · Overdue bills · Overdue value · High-risk vendors.
    Panels: aging summary table; "Record a payment" form (bill picker showing owed amount, amount).
 2) Vendor Directory — one row per vendor: ID, name, category, GSTIN, terms, spend, share %,
    payable, performance badge (grn>=90 / amb 70-89 / red<70), and a "360 →" button.
 3) Vendor 360 — pick a vendor; KPI row (total spend + share, payable now, performance + delivery
    count, risk + band); a Profile panel (category, GSTIN, terms, location, on-time, quality, fill)
    and that vendor's Bills table.
Group "Money":
 4) Bills & Payments — every bill with amount / paid / owing / bucket status; plus "Add a bill".
 5) Aging — KPI per bucket, a bar distribution, and open bills sorted oldest-first with days late.
Group "Control & Wiring":
 6) Risk — the formula stated plainly in a note; vendors ranked by risk with performance, share,
    overdue count, risk number and band; plus a spend-concentration bar chart.
 7) Sourcing — preferred vendor per category with score and risk band; a "Best overall" callout;
    and a Watchlist naming exactly why each non-low-risk vendor is flagged.
 8) Wiring — Data Core note; outbound flow table; a live cascade example; inbound flow table.
System: 9) Backup & Health — export/import/reload/wipe + the 14 self-test results.

WIRING (must be shown in-app and be literally true of the engine)
OUTBOUND:
  Vendor created/updated → Master Data (Party) : one supplier identity read by Procurement,
                                                 Finance and Quality
  Performance score      → Procurement          : RFQs and POs route to the best supplier
  Payable balance        → Finance / Ledger     : accounts-payable position and payment run
  Aging buckets          → Treasury / Cash-flow : what must be paid this week vs this month
  Risk band              → Sourcing & Mgmt      : high-risk suppliers trigger dual-sourcing
  Spend concentration    → Board / BI           : single-supplier dependency flagged early
INBOUND:
  Procurement : GRN results (received/accepted/rejected, on-time) build the performance history
  Finance     : payments post against bills and clear the outstanding balance
  Quality     : rejections and debit notes lower the accept rate
  Master Data : GSTIN, payment terms, tax and category definitions
LIVE CASCADE to display (Beta Components Ltd):
  1 Two late deliveries drop on-time to 0%
  2 Risk rises to 39 (medium) — the overdue bill adds to it
  3 Sourcing: loses preferred status in "Components"
  4 Procurement: the next RFQ routes to the higher-scoring supplier
  5 Finance: ₹1,50,200 payable, 1 bill overdue, flagged for the payment run

SELF-TESTS (run on boot against a COPY; all must PASS)
 1  outstanding = amount − paid ................ BILL-9002 → 98,900
 2  fully paid bill is bucket "paid" ........... BILL-9001
 3  total payable = Σ outstanding ............... 502600
 4  bucket totals sum to total payable .......... 346200+92400+0+64000 = 502600
 5  BILL-9005 is 60+ days overdue ............... daysLate 76
 6  V1 on-time = 100% ......................... 2 of 2
 7  V1 quality = 98% .......................... 156 accepted / 160 received
 8  V2 on-time = 0% ........................... 0 of 2 on time
 9  V4 fill rate = 90% ........................ 180 of 200
10  spend shares sum to ~100% ................. within 2 points (rounding)
11  risk is bounded 0..100 .................... every vendor
12  late + overdue vendor is riskier than clean  risk(V2) > risk(V3)
13  preferred vendor is the highest-scoring one  = V3 at 100
14  paying a bill reduces payable by exactly that amount

ACCEPTANCE
- Opens offline; seeded; all 9 screens navigable; forms mutate and persist.
- 14/14 self-tests green. No console errors. Money formatted ₹ en-IN.
- Reloading the page does NOT change any figure (proves tests don't mutate live data).
- V1 shows medium risk at 99% performance, purely from concentration.

INDUSTRY-SWAP GUIDE (how "any company" adopts it)
- Textile:        vendors = mills; category = fabric type; deliveries measured in metres.
- Medical:        vendors = distributors; add batch/expiry; accept rate = QC pass rate.
- Manufacturing:  vendors = component suppliers; fill rate drives line stoppages.
- Services:       vendors = subcontractors; "delivery" = milestone acceptance.
Only the vendor master changes; formulas, risk, sourcing and all 14 tests stay identical.

HONEST LIMITS (state plainly; do not overclaim)
- Local-first, single browser. The hosted multi-tenant version syncs the same engine to the
  Medhava backend (Postgres + RLS + event bus) where Procurement/Finance update for real.
- Performance history here is seeded; in the hosted tier it is written automatically by GRNs.
- Real bank/ERP/marketplace connections use revocable, SCOPED API keys in an encrypted vault —
  NEVER account passwords.
- Not in this build: multi-currency, vendor portal / self-service, contract & rate-card expiry,
  TDS on vendor payments, credit-limit blocking — all hosted-tier features.
```

---

## How to check it works
1. **Double-click `Vendor Management.html`** — opens offline, seeded.
2. **Backup & Health** → **14/14 pass**. Refresh — every number stays identical.
3. **Aging** → ₹64,000 sits in **60+** (Delta, 76 days late); ₹92,400 in **1-30** (Beta).
4. **Risk** → Beta 39 (medium): 64% performance + 1 overdue. **Alpha 27 (medium) at 99% performance — from 44% concentration alone.**
5. **Sourcing** → best overall **Gamma Materials Co at 100%**; watchlist explains every flag.
6. **Vendor 360** → Alpha: ₹3,52,600 spend (44% of all), on-time 100%, quality 98%, fill 100%.
7. **Wiring** → the Beta cascade from late delivery → risk → sourcing → Procurement → Finance.
