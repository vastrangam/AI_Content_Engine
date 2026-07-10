# 🗺️ VASTRANGAM — COMPLETE MODULE ROADMAP (every app, nothing skipped)
### All ~35 apps across 10 domains + AI Studio · status · build vehicle · order
**Answers: "where are the rest of the modules?" — here, one by one, honestly labelled.**

**BUILD VEHICLES (how each module actually becomes real):**
- 🟢 **TOOL** — I build it as a working browser tool in this chat (like the Content Engine / Finance Tool). Runs on your files/localStorage, free, now.
- 🟠 **DEV** — needs the real Track-B build (database, APIs, WhatsApp, live sync). Dev team, per the ERP's 8-phase/32-week plan. I supply specs + reference tools.
- 🔵 **BUY** — smarter to use an existing service than build (free/cheap plan first). Building these from scratch would waste your money.
- ✅ **DONE** — already built and working.

---

## ★ AI STUDIO (Domain 11) — 5 apps

| App | Status | Vehicle | When |
|---|---|---|---|
| Content Engine | ✅ live tool (Gemini free) | ✅ | done |
| Image Studio | ✅ live tool | ✅ | done |
| Design Studio | ✅ live tool (AI Assist live) | ✅ | done |
| Publisher (one-click push to Shopify/marketplaces/social) | copy-paste today | 🟠 DEV (needs Shopify/marketplace APIs) | Track B Ph 6 |
| AI Command Centre (model routing A–H) | model picker exists in tools | 🟠 DEV | Track B Ph 6 |

## 💰 FINANCE (Domain 4) — 7 apps

| App | Status | Vehicle | When |
|---|---|---|---|
| **Finance Intelligence** (settlement reco, 20-col + SKU P&L, 15-tab Excel) | ✅ working tool | ✅ | done |
| Accounting (replaces BUSY: journals, GST, ledgers) | spec | 🔵 keep **BUSY** now / eval **Zoho Books free** → 🟠 DEV Ph 5 | now → Ph 5 |
| Invoicing (series, e-invoice IRN/QR) | spec | 🔵 BUSY/Zoho now → 🟠 DEV Ph 5 | now → Ph 5 |
| Expenses (bill photo → OCR → approve) | ✅ **BUILT** — `Vastrangam_Expenses_Tool.html` (bill photo → Gemini OCR pre-fill → approve → register + GST/ITC capture, by-category workbook; engine self-tested) → 🟠 DEV Ph 5 adds Drive sync/BUSY posting | ✅ → Ph 5 |
| Documents (auto-PDFs, Drive sync) | spec | 🔵 Google Drive now → 🟠 DEV | now |
| Spreadsheets/BI (branded report builder) | 15-tab engine lives inside Finance Tool | 🟠 DEV Ph 5 | Ph 5 |
| eSign | spec | 🔵 free e-sign services exist → 🟠 DEV | later |

## 🏭 INVENTORY & MANUFACTURING (Domain 5) — 6 apps

| App | Status | Vehicle | When |
|---|---|---|---|
| **Karigar production & costing** (piece-rate, pooled sets, earnings) | ✅ **BUILT** — `Vastrangam_Karigar_Tool.html` (upload Reports + Rates → on-screen analysis + 2 branded workbooks; engine self-tested against the worked example) | ✅ | done |
| **Material consumption & cost** (BOM × production) | ✅ **BUILT** — `Vastrangam_Material_Tool.html` (BOM × produced pieces → detailed/design/material views, live-formula workbook, missing-rate & name-mismatch flags; engine self-tested) | ✅ | done |
| Inventory (WMS: stock stages, alerts; VMS: packing video) | ✅ **BUILT (lite)** — `Vastrangam_Stock_Tool.html` (opening + IN − OUT = closing, reorder/low/negative alerts, movements log + workbook; engine self-tested) → 🟠 DEV Ph 3 adds live sync/stages/VMS | ✅ → Ph 3 |
| Manufacturing (MRP/MES 10-stage live pipeline) | spec | 🟠 DEV Ph 3 (needs WhatsApp + live DB) | Ph 3 |
| Purchase (vendor priority, PO→GRN→3-way match) | ✅ **BUILT** — `Vastrangam_Purchase_Tool.html` (locked 7 service providers seeded, P1→P2→P3 escalation, last-rate auto-suggest, PO register, 3-way match flags; engine self-tested) → 🟠 DEV Ph 3 adds WhatsApp/PDF/scorecards | ✅ → Ph 3 |
| Quality · Maintenance | spec | 🟠 DEV Ph 3 (shop-floor taps) | Ph 3 |

## 🌐 WEBSITE (Domain 2) — 5 apps

| App | Status | Vehicle | When |
|---|---|---|---|
| Website / D2C | live on **Shopify** | 🔵 Shopify IS this module today → 🟠 DEV adapter Ph 4 | covered |
| eCommerce control centre (5 marketplaces: orders, listings, labels) | seller panels today | 🟠 DEV Ph 4 (Amazon SP-API/Flipkart API, Myntra/Ajio RPA) | Ph 4 |
| **Return & Payment Reco** | ✅ **BUILT** — `Vastrangam_Sales_Tool.html` (offline 3-store + ecommerce 4-sheet extraction, net sale, wrong returns, true inventory, 3 branded workbooks; engine self-tested) | ✅ | done |
| Claims (SPF, DNE, >60-day) | logic specced in Finance spec | 🟠 DEV Ph 4 (needs portal RPA) | Ph 4 |
| Blog · Forum · Live Chat | spec | 🔵 Shopify blog now; forum/chat later → 🟠 DEV | later |

## 🧾 SALES (Domain 3) — 3 apps

| App | Status | Vehicle | When |
|---|---|---|---|
| CRM (pipeline, customer 360, IndiaMART leads) | ✅ **BUILT** — `Vastrangam_CRM_Tool.html` (locked Lead→Won/Lost pipeline board, sources incl. IndiaMART, follow-up rule, lifecycle New→VIP→Lapsed→Win-back with locked triggers; engine self-tested) → 🟠 DEV Ph 4 adds IndiaMART webhook/AI scoring | ✅ → Ph 4 |
| Sales / Quotes & Orders (B2B credit, export CI+PL) | ✅ **BUILT (lite)** — `Vastrangam_Quote_Tool.html` (Q-{FY}-#### numbering, GST totals, branded print/PDF, register + line-detail workbook; engine self-tested) → 🟠 DEV Ph 4 adds credit limits/CI+PL/e-invoice | ✅ → Ph 4 |
| POS (Udhna counter: scan, GST print, sessions) | spec | 🟠 DEV Ph 4 (hardware + offline queue) | Ph 4 |

## 👥 HR (Domain 6) — 3 apps

| App | Status | Vehicle | When |
|---|---|---|---|
| Staff & Karigar (roster, attendance, payroll) | ✅ **BUILT** — `Vastrangam_HR_Tool.html` (locked seed roster, tap-to-mark attendance grid, P/H/A/HL/OD/PL/UL codes, ÷27 base, payroll workbook + slips + karigar net; engine self-tested) → 🟠 DEV Ph 2 adds WhatsApp IN/OUT/geofence (Interakt) | ✅ → Ph 2 |
| Time Off (leave wizard, advances, festival calendar) | spec | 🟠 DEV Ph 2 (WhatsApp) | Ph 2 |
| Appraisal (performance matrix, flags) | spec | 🟠 DEV Ph 2 | Ph 2 |

## 📣 MARKETING (Domain 7) — 4 apps

| App | Status | Vehicle | When |
|---|---|---|---|
| Social calendar & publishing | content comes from ✅ AI Studio | 🔵 free Meta Business Suite scheduler now → 🟠 DEV Ph 6 | covered → Ph 6 |
| Email | spec | 🔵 Brevo/Mailchimp free tier | now (buy) |
| SMS | spec | 🔵 MSG91 (DLT) pay-per-SMS | when needed |
| Automation (n8n recipes: cart, win-back, festival) | spec | 🟠 DEV Ph 6 (n8n on VPS) | Ph 6 |

## 🛠️ SERVICES (D8) · 💬 PRODUCTIVITY (D9) · 🧩 CUSTOMIZATION (D10) — 7 apps

| App | Status | Vehicle | When |
|---|---|---|---|
| Helpdesk · Project · Timesheets · Planning | spec | 🔵 WhatsApp/Sheets now → 🟠 DEV Ph 6 | later |
| Discuss · Approvals | spec | 🔵 WhatsApp groups now → 🟠 DEV | later |
| Studio (no-code fields/workflows) | spec | 🟠 DEV (last — needs the platform to exist) | Ph 6+ |

## 📊 DASHBOARD (Domain 1) — 2 apps

| App | Status | Vehicle | When |
|---|---|---|---|
| CEO Dashboard | ✅ OS home shows live workspace KPIs | tool KPIs now → 🟠 DEV Ph 1 (business KPIs need the DB) | partial → Ph 1 |
| Group consolidated views | company switcher ✅ (skin only) | 🟠 DEV Ph 1 | Ph 1 |

---

## THE HONEST SUMMARY

**Why AI Studio went first:** it's what you asked to prove first, and it's the only domain a
browser tool can make *fully* live without a server. That's done. Now the pattern repeats.

**Score today:** ✅ 14 modules live (13 tools + OS shell) · 🟢 0 left buildable as tools in this
chat · 🔵 ~8 covered by free/cheap services you should NOT custom-build yet · 🟠 the rest
need the real Track-B dev build (their locked 8-phase plan) because they need live databases,
WhatsApp, marketplace APIs, or hardware — no honest way around that in a browser tool.

**Next build queue (Track A, in order):**
1. ✅ **A1 — Karigar Production & Cost tool** — done (`Vastrangam_Karigar_Tool.html`)
2. ✅ **A2 — Sales / Return / Inventory tool** — done (`Vastrangam_Sales_Tool.html`)
3. ✅ **A3 — Material Consumption tool** — done (`Vastrangam_Material_Tool.html`)
4. ✅ **A4 — HR-lite** — done (`Vastrangam_HR_Tool.html`)
5. ✅ **A5 — Purchase-lite** — done (`Vastrangam_Purchase_Tool.html`) · ✅ **A6 — CRM-lite** — done (`Vastrangam_CRM_Tool.html`)
6. ✅ **A7 — Expenses (bill OCR)** · ✅ **A8 — Stock Register** · ✅ **A9 — Quotes & Proforma** — done
**Track A is fully exhausted** — 13 tools live as tiles in Vastrangam OS. Everything still
open is either 🔵 a free service to adopt (BUSY/Zoho, Brevo email, Meta scheduler, Drive)
or 🟠 genuine Track-B dev work (live DB, WhatsApp/Interakt, marketplace APIs, POS hardware,
RPA claims) per the ERP's 8-phase plan. No honest way to fake those in a browser tool.

*Rule that keeps this honest: a module is only marked done when it runs on your real data and
matches your own records.*
