# Module 1 · Supply Chain & Procurement — **App 1 of 6: Procurement**

RFQ → Purchase Order → Goods Receipt → **3-Way Match** → Vendor Scorecard, wired to Stock, Finance and Manufacturing over the shared Data Core.

## Two formats (6 files)

### 📁 FormatA_UnifiedERP_anyIndustry/  — works for any company / any sector
- **Procurement.html** — the working tool. Double-click to open (offline, saves in browser).
- **Procurement_BUILD_PROMPT.md** — the complete build prompt (every field, rule, formula, test) in a code block.
- **Procurement_TOUR.pdf** — 17-page illustrated tour (architecture, every screen, formulas, tests, wiring).

### 📁 FormatB_Vastrangam/  — Vastrangam fabric/zari supply base, GST, BUSY, karigar
- Same three files, specialised to your data (Surat–Jaipur mills, Banarasi silk, HSN 5007/5208).

## Verify it works (2 minutes)
1. Open either **Procurement.html** → it seeds itself.
2. **Backup & Health** → **14/14 self-tests pass**.
3. **3-Way Match** → two supplier bills are *held*: one over-bills rejected goods (billed 100 > accepted 96), one hiked the price (150→165).
4. **Wiring** → the GRN-501 cascade shows the numbers flowing to Stock (+96), Finance (payable + ITC ₹1,344.00), Quality (debit note) and the Scorecard.

Both formats run the **identical engine** and pass the **identical 14 tests** — only the master data differs. Next in this module: Vendor Management (App 2 of 6).
