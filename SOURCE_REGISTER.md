# SOURCE REGISTER — Stage 0

Every document and image supplied for this project, read in full, recorded here so that
nothing is ever cited again from a filename.

**The rule this register exists to enforce:** *I may not cite a document I cannot quote.*
If a plan of mine names a source, its entry is below with line references you can check
against your own copy. If it is not below, the citation comes out.

**Status:** in progress. Documents are added as they are read. The tally at the bottom is
the honest count.

---

# 1 · `Vastrangam_ERP_Master_Prompt_v2.md`

**1,692 lines · compiled 30 May 2026 · Praveen Pandey & Vishal Shah · replaces the May 2026 v1**

Read in full, 12 Aug. Previously I had read roughly 90 lines of it.

## What it is

The build-ready specification for the whole ERP. Three parts: **A** the paste-ready master
prompt (L20–330), **B** the full architecture — schema, 20 module specs, API, integrations,
security, performance (L334–1389), **C** migration and go-live (L1391–1598), plus an
appendix with the canonical roster (L1600–1692).

## What it specifies

**The business (L28–72).** Multi-company, AI-first, manufacturing-aware operating system for
a Surat ethnic and western fashion manufacturer running three sister companies. Replaces
BUSY entirely. Unifies D2C + 6 marketplaces + B2B + export. Runs as a PWA with a WhatsApp
interface for shop-floor staff and karigars.

**Three companies, and the trap in their naming (L36–45).** Company ≠ brand ≠ prefix:

| Company (legal, reports group by this) | Brand (customer-facing, SKU code) | Invoice prefix | SKU code |
|---|---|---|---|
| Vastrangam | Vastrangam | VS | VS |
| **Ethnic Fashion** | **Go4Fashion** | **EF** | **GF** |
| Adini | Adini Couture | AC | AC |

The second entity deliberately has three different values. Any model with one "company code"
field is wrong.

Shared across all three (L60–65): production floor, staff + karigar roster, vendor master,
design library, AI services, storage, customer master. Inter-company stock transfers go as
branch transfer invoices with GST (separate GSTINs). Group P&L = Σ(3) − inter-co sales −
inter-co purchases. Group view is read-only.

**Seven non-negotiable architecture principles (L76–116).** Vendor-agnostic service
interfaces (`DatabaseService`, `WhatsAppService`, `AIService`, `PaymentService`,
`ShippingService`, `AutomationService`, `StorageService`) — no provider SDK in business
logic · every business table has `company_id` with Postgres RLS · audit everything, delete
nothing (soft delete + `audit_log` with before/after JSON; staff get "deactivate"/"void",
never "delete") · AI-agnostic · mobile-first PWA + Capacitor · idempotent by external ID with
3 retries at 1m/5m/30m · India-specific (**`numeric(14,2)`, never float**; Indian FY;
sequential GST invoice numbering; HSN on every item; place-of-supply logic).

**Tech stack (L119–159).** Next.js 15 / Supabase / n8n on Hostinger / Interakt WhatsApp /
Claude / Razorpay + PayPal / Shiprocket / Google Drive / Shopify / Vercel / Sentry +
BetterStack. Partial COD rule: ₹99 default advance via Razorpay, balance collected by
courier, both legs auto-reconciled to one invoice (L159).

**The SKU model — the document says READ TWICE (L163–208).** Four levels: Brand → Design →
Style-Variant → SKU. `{BRAND}-{DESIGN}-{COLOR}-{SIZE}`, e.g. `VS-MUSPUR-LAV-M`. The SKU
string is **derived** from structured fields; all searching and analytics use the fields,
never substring-matching the SKU (L201). 330 BUSY designs import as designs; admin enters
colour × size and SKUs generate; opening stock is entered at SKU level; `legacy_busy_code`
preserved.

**Roles (L212–240).** Admin (Praveen, Vishal — all 3 companies) · Manager (Karim — operations
only, no P&L, no salary edit) · Staff (own data only, Bengali/Hindi/English) · Karigar (own
earnings only) · Customer. Lifecycle is Active / On Leave / Inactive — **no data is ever
deleted**.

**20 modules (L248–269).** Identity & Access · Master Data · Procurement · Inventory ·
Manufacturing · HR & Payroll · Sales-D2C · Sales-Marketplace · Sales-B2B · Sales-Export ·
Returns · Finance-Books · Finance-Reports · Marketing · CRM · AI Command Centre ·
Communications · Documents · Dashboards · Settings.

**Database schema — 13 groups, ~90 tables, every column named (L340–775).** Foundation
(companies, users, user_companies, audit_log, integration_errors, settings_environment) ·
master data · inventory (`stock` keyed by item × location × **stage**) · procurement (incl.
`three_way_match`) · manufacturing · sales common · sales channel-specific (incl.
`marketplace_settlements` with commission, fixed fee, closing fee, pick-pack fee, shipping
fee, refunds, TCS, TDS, GST-on-commission, net settled) · returns · finance ·
HR & payroll · marketing + CRM · communications · AI & documents.

**Per-module specs (L781–1225)** — flows, screens, and the business rules, including:
10-stage production pipeline and four production modes (L855–861) · BOM versioning · sample
workflow · seven named third-party service vendors (L871–879) · settlement reconciliation as
a 7-step algorithm with variance flagging > ₹1 or > 0.5% (L943–951) and the warning that
**commission % is not fixed — enter actual from the settlement file, never an assumed rate**
(L953) · B2B credit blocks and tiers · export FIRA and IGST refund tracking with FX variance
posting · double-entry with a worked example (L1008–1013) · the locked P&L structure
(L1049–1077) · 14 named reports (L1031–1046) · 8 AI modules (L1107–1116) with the privacy
rule that customer PII never leaves Indian data residency (L1120) · WhatsApp command table
and 5 scheduled jobs (L1126–1141) · the Google Drive folder tree (L1161–1173) · 5 role
dashboards (L1175–1211).

**API surface (L1229–1299).** Core REST patterns, ~25 domain routes, 5 inbound webhooks
(Shopify, Razorpay, Shiprocket, Interakt, PayPal), all signature-verified and idempotent.

**Migration and go-live (L1391–1598).** D-60 → D+60 cutover with a target cutoff of
**1 April 2026**, parallel run with BUSY for 60 days · a ~25-item opening-balance checklist
(L1411–1437) · a daily 5-minute reconciliation (L1443–1450) · **8 build phases over 32
weeks** with a definition of done each (L1458–1467) and the golden rule that phase N+1 does
not start until phase N passes · 7 smoke-test groups (L1475–1507) · 4 runbook cadences ·
an 8-risk register · 10 success metrics · a year-2 roadmap.

## Findings that change what has been built

### 1.1 There is a canonical karigar tool, and it has never been supplied

Line 1682, in the roster appendix:

> *"The exact garment-type columns, set-completion math and rate lookup are already
> implemented and tested in **`Vastrangam_Karigar_Tool.html`** (in this bundle) … Build
> Module 5/6 to match that tool exactly — **it is the source of truth for production math**."*

**That file does not exist** — not in the repository, not in the uploads, nowhere on this
machine. I have never had it and never asked for it. I built the karigar mathematics from
other documents instead, which is a large part of why the set-completion rule was wrong.

It also states the rule the tool implements: *"a set's count = the minimum across its
**member columns**; leftover pieces tracked as **named extras**"* — and 23 garment columns
grouped into 13 set types.

### 1.2 That rule contradicts what I have just implemented as the default

| Source | Rule | FY2025-27 result |
|---|---|---|
| This document, L1682 | minimum across **member columns** | 30,811 sets |
| Karigar & Staff Combined Master Prompt §2.2 | minimum across **populated** slots | 31,024 sets |

I flipped the engine's default to POPULATED on the strength of the Combined prompt. This
document — which post-dates nothing and pre-dates nothing I can establish — says the
opposite and names a tool as the arbiter. **Unresolved. The 213-set difference stands.**

### 1.3 The pay divisor is stated here as a flat 27

L675 (`daily_rate = salary_monthly / 27 (auto)`), L889 (*"Salary base = monthly / 27 days"*)
and L891 (*"`DR = (salary effective that month) / 27`"*) all say the same thing. The Combined
Master Prompt §3.5 says salary ÷ the **threshold-days log** (28, then 27 for two men from
Nov 2025). Measured difference on FY2025-26 payroll: **₹20,055**. **Unresolved.**

### 1.4 Working hours are stated a third way here

| | Male weekday | Male Sunday | Female weekday | Female Sunday |
|---|---|---|---|---|
| This doc, L884–887 | 9:00–19:30 = **10h** | 9:00–14:00 = **4.5h** | 9:00–18:00 = **8.5h** | 9:00–16:00 = **6h** |
| Combined prompt §3.5 | 10h | **5h** | **8h** | **5.5h** |

Only the Combined prompt's figures reproduce the verified 280 and 222 monthly hours.
**Unresolved but effectively settled by the reconciliation.**

### 1.5 Karim's raise date differs again

L891 and L1664: ₹15,000 Apr–Jun 2025 → ₹18,000 **July** 2025. Combined prompt §3.3.2:
₹18,000 from **June** 2025. Worth ₹3,000 on the FY. **Unresolved.**

### 1.6 Three attendance codes exist that nothing has ever implemented

L893: **P · H · A · HL · OD · PL · UL** with weights 1.0 / 0.5 / 0.0 / 1.0 / 1.0 / 1.0 / 0.0.
The Combined prompt has only P/H/A/HL. **OD (on duty), PL (paid leave) and UL (unpaid leave)
appear in no engine, no fixture and no report I have produced.**

### 1.7 Rules specified here that I removed and did not flag

- **Karigar alter earnings** (L905): `Total = Σ(pieces × rate) + (admin-assigned alter hours
  × ₹100) − advances`, and **own-mistake alterations = ₹0**.
- **Performance flags** (L867): same person + same design + same task + similar qty →
  current hours > previous × 1.2 → flag → WhatsApp asks why → 5 preset reasons auto-approve,
  custom needs admin. Rejected flags are a permanent negative mark.
- **Geofence** (L895): 50 m radius, 15-minute buffer, late flags, admin override.
- **Festival rule** (L909): religion-based festival calendar suggests paid leave; universal
  Diwali shutdown of 4–5 days.
- **`task_threshold_rates`** (L722–725): per task (cutting / thread-cut / iron), optionally
  per user and per design, with **lot-size bands** and a **minimum per hour**. This has never
  been mentioned in any work I have delivered.

### 1.8 Return costs contradict themselves inside this one document

L956–960 (Module 8): customer return **₹20**, courier return **₹5**, wrong return full SP.
L993–1002 (Module 11): courier return **₹4–5**, customer return **design-specific** —
*"Alteration avg + Iron cost (design-specific) + Packing; MuskanPurple 10 + 11 + 4.5 =
₹25.5/pc"*, wrong return full SP written off and flagged as marketplace abuse on a pattern.
**Unresolved, and it is a contradiction within a single source.**

### 1.9 The roster here disagrees with the Combined prompt

L1660–1675. This document lists FY2026-27 active staff as Ibrahim, Karim, Upender, Muskan,
Priyanka, **Staff-1 (name TBD)**, **Staff-2 (name TBD)**, Joginder — and states the rule
*"all female staff = ₹9,000 except Muskan (₹10,000)"*. The Combined prompt names those two
as **Rupsa** and **Selima** and adds **Ikram**. The seven FY2025-26 staff are marked
"status ❓ to confirm" in both.

Thresholds here are stated as **hours** (M 270 / F 230, L1663–1669) and described as
*"identical across all 3 companies"* (L1658). The Combined prompt makes threshold **days**
the pay driver and demotes hours to a legacy reference.

### 1.10 Things in this document that exist in no module list I have used

`Vastrangam_Karigar_Tool.html` as an artefact · the 8 AI modules as a single "AI Command
Centre" · Communications as a module (WhatsApp commands, broadcasts, 5 scheduled jobs) ·
Documents as a module (11 auto-generated PDFs + the Drive tree) · customisation orders with
negotiation history and 50% advance · the Swipe/Lookbook shopping mode (L919–922) · POS for
walk-ins · IndiaMART lead webhook · e-invoicing/IRP at the ₹5 cr threshold (L1370).

## Open questions this document raises

1. **Supply `Vastrangam_Karigar_Tool.html`.** It is named as the source of truth for the
   production maths and it settles 1.1, 1.2 and the "named extras" rule at once.
2. **20 modules here vs 16 in `brand/site/modules.js`.** Same ground, different cuts.
3. Which of 1.2 – 1.8 hold, where this document and the Combined prompt disagree.
4. Names for Staff-1 and Staff-2, and whether they are Rupsa and Selima.

---

# 2 · `Busy_Accounting_GST_Master_Prompt.md`

**250 lines · companion to the ERP master prompt, zoomed into Accounting & GST**

Read in full, 12 Aug. **This is the file I cited in a plan without ever opening it.**

## What it is

The Accounting & GST module in full depth, written after inspecting the schema of your real
BUSY company database (Vastrangam, COMP004). It is grounded in what a working Indian
accounting system actually needs rather than a textbook list.

## What it specifies

**What BUSY does, and what not to copy (L7–23).** BUSY flattens everything into two
polymorphic tables — `Master1` (every account, item, customer, vendor, distinguished by
`MasterType`, with generic `CM1`–`CM11` and `D1`–`D13` columns) and `Tran1` (every voucher by
`VchType`). The instruction is explicit: **do not copy this.** Build separate, clearly-named
tables. What to carry forward is the *concepts*: TDS/TCS as first-class entities, GST tracked
**per voucher line** not per voucher, item serial numbers, AMC/warranty per item sold, POS as
a distinct voucher path that still feeds the same ledger, a deleted-voucher audit trail
instead of hard deletes, and multiple numbering series per voucher type for multi-GSTIN.

**Chart of accounts (L26–53).** The standard Indian hierarchy, pre-seeded and configurable —
Assets (Fixed, Current → Cash-in-hand, Bank, Sundry Debtors, Stock-in-hand, ITC receivable) ·
Liabilities (Sundry Creditors, Duties & Taxes, Loans, Capital) · Income · Expenses. Each
ledger carries GSTIN, PAN, default tax rate, credit period, credit limit.

**Nine voucher types as separate entities (L57–71).** Sales Invoice · Purchase Invoice ·
Sales Return/Credit Note (original invoice reference **mandatory**) · Purchase Return/Debit
Note · Payment · Receipt · Journal · Contra · POS Invoice. And the rule that matters:

> *"Every voucher writes to the general ledger through **one shared posting engine** — no
> voucher type should have its own separate ledger-update logic. This is where most
> home-built accounting tools break (numbers stop matching between modules)."* (L71)

**GST (L75–89).** CGST+SGST vs IGST **auto-determined by comparing state codes from the
GSTINs, never manually selected** · rates default from HSN, overridable per line · RCM flag ·
**ITC-eligibility flag per purchase line** (some GST paid is not claimable) · e-invoice IRN ·
e-way bill with vehicle, transporter, distance · GSTR-1 / 3B / 9 exported as **GST-portal
JSON** · HSN summary · and **tax rates versioned by effective date, not a static field, so
historical invoices stay correct** (L89).

**TDS/TCS (L93–98).** Section codes (194C, 194J…), quarterly Form 26Q export, Form 16A
certificates per deductee.

**Multi-GSTIN (L102–107).** Branch-wise P&L and balance sheet plus consolidated; inter-branch
transfers between own GSTINs still attract GST in most cases.

**Eleven non-negotiable reports (L111–124)** — Day Book · Ledger with running balance · Trial
Balance · P&L · Balance Sheet · Ageing (customer and vendor, bucketed) · Cash Flow · GST ·
TDS/TCS · **Stock valuation (must tie to the balance sheet)** · Bank Reconciliation Statement.
All exportable to Excel in *"dark slate/purple/pastel, gridlines off, grouped subtotals —
identical to the Production/Karigar reports already built"* (L125).

## Findings

### 2.1 A legal requirement nothing I have built accounts for

L136 — the **MCA mandatory audit trail**, effective FY 2023-24:

> *"Indian company law requires accounting software to maintain an audit trail of every edit
> to every transaction, that this audit trail feature **cannot be disabled**, and that it's
> preserved for at least 8 years… this logging must be **architecturally impossible to turn
> off**, not just a settings toggle defaulting to 'on'."*

This is a compliance obligation, not a design preference. It has never appeared in anything
I have specified or built.

### 2.2 Another named source of truth I have never had

L250: *"Refer to … **`Karigar_Master_Prompt.md`** for the Production module's exact costing
logic."* That file has never been supplied — the second missing arbiter, after
`Vastrangam_Karigar_Tool.html` from source 1.

### 2.3 Nine substantial features specified here and never mentioned by me

- **Period locking** (L135) — lock a period after GST filing or audit sign-off; no backdated
  edits without an Admin unlock, and **the unlock itself is logged**.
- **Financial-year closing and carry-forward** (L133–134) — P&L accounts reset, balance-sheet
  accounts carry forward; year-wise data kept separable (your BUSY had one file per year,
  `db12015.bds`–`db12022.bds`) while still allowing multi-year reporting.
- **GSTR-2A/2B ITC reconciliation** (L140–147) — import from the portal, auto-match by
  GSTIN + invoice number + amount, flag three mismatch kinds. *"Without it, GSTR-3B filing is
  essentially a guess."*
- **Bill-wise allocation and PDC** (L151–155) — allocate a payment against specific open
  invoices (FIFO or manual), partial settlement across multiple payments with a true
  per-invoice balance, and a **post-dated cheque register** posting to the ledger only on the
  realisation date. Described as *"extremely common in Indian SME trade."*
- **Fixed assets and depreciation** (L159–164) — **both SLM and WDV**, because book
  depreciation and tax depreciation differ; automatic period-end journals; disposal P&L.
- **Stock valuation method** (L170) — FIFO / Weighted Average / Specific-cost, *"this
  determines the rupee value on the Balance Sheet, not just a display preference."*
- **Multi-UOM conversion** (L171) — fabric bought in kg, sold as pieces; the conversion factor
  is what makes COGS correct through the BOM.
- **Round-off** (L187) — must post to a dedicated Round Off ledger, *"never silently absorbed
  into the sale amount (which would corrupt GST calculation)."*
- **MIS and ratios** (L175–180) — current/quick ratio, debtor and creditor turnover days,
  margins; **Budget vs Actual, which needs a Budget entity**; cost-centre P&L.

### 2.4 The integrity rule, which is the accounting equivalent of the cascade problem

L222:

> *"Every financial figure must trace back to a ledger entry, and every ledger entry must
> trace back to a voucher. No report should ever compute a number independently of the
> ledger… **numbers must always reconcile**, or the business owner stops trusting the
> software entirely (which is exactly the failure mode that pushes people back to Excel)."*

Every shallow demo in `brand/suite/out/` violates this — each computes its own figures from
its own private store.

### 2.5 It prescribes its own build order (L228–246)

Posting engine **first** · audit-trail logging built **at the same time**, wrapping every
write from day one, *"not later"* · then Sales and Purchase Invoice, verified against Trial
Balance and Ledger with test data · then the remaining voucher types · then FY closing and
period locking, *"since they are structural, not cosmetic"* · GST returns and 2A/2B
reconciliation **last**, after all voucher types work.

### 2.6 One thing that does align

L125's report style — dark slate, purple/pastel accents, gridlines off, grouped subtotals —
is exactly what `engine/vastrangam/sheetstyle.py` already implements for the karigar and
staff workbooks. The accounting reports are meant to look identical.

## Open questions

1. **Supply `Karigar_Master_Prompt.md`** — the second named arbiter for production costing.
2. Which stock valuation method: FIFO, weighted average, or specific cost.
3. Do you need cost-centre P&L and Budget vs Actual, or is company-wide enough for now.
4. Is the ₹5 cr e-invoicing threshold already crossed across the three companies combined.

---

# 3 · `Vastrangam_ERP_Feature_Gap_Odoo_Zoho_Elitesecom.md`

**70 lines · competitive feature-gap analysis**

Read in full, 12 Aug. **This document has never been referenced in any work I have delivered.**

## What it is

An honest cross-check of three reference systems — **Elitesecom** (Indian omni-channel OMS),
**Zoho One**, **Odoo Community** — against the ERP's module set, marking each capability
✅ covered · 🟡 partially covered · ➕ genuinely missing. The missing ones are then
**"opted into the ERP"** (L7) — i.e. they are scope, not suggestions.

## What it adds

**From Elitesecom (L12–29):** add **Nykaa and JioMart** to the connector list. Add
**weight-discrepancy** and **lost-in-transit** claim types. Promote demand forecasting /
auto-reorder to an explicit module.

**From Zoho (L31–39):** add **SalesIQ-style visitor/behaviour tracking** on the storefront to
Marketing. Strengthen the BI report builder to genuine drag-and-drop.

**From Odoo (L41–51):** everything else maps; Fleet noted as optional if you run your own
delivery vans.

**Twelve features formally added to the ERP (L53–66):**

| # | Addition | Note |
|---|---|---|
| 1 | **Kit / Combo / Bundle SKU** | `kit_items(kit_sku_id, component_item_id, qty)`; selling a kit expands and decrements each component at order time; cost rolls up from components |
| 2 | **Listing & Catalog Manager** | one screen to push listings to every channel from the Item master; bulk edit; detects "listed but out-of-stock / unlisted but in-stock" |
| 3 | **Repricing Engine** | per channel/SKU rules — floor, ceiling, match-lowest, margin-target, festival overrides — writing to `channel_pricing`, every change audited |
| 4 | **NDR / RTO Workflow** | on failed delivery, auto WhatsApp/call to reconfirm address before it becomes an RTO; analytics by pincode and courier |
| 5 | **Subscriptions / Recurring** | loyalty and festive boxes: schedule, auto-invoice, auto-charge, dunning |
| 6 | **Forms & Feedback (NPS)** | post-delivery, tied to customer 360 **and design analytics — which designs draw complaints** |
| 7 | **Recruitment (ATS)** | pipeline → converts a hire into an Employee/Karigar record, feeding HR |
| 8 | **Knowledge Base / SOP wiki** | cutting SOP, QC checklist, packing standard, marketplace playbooks; role-scoped |
| 9 | **Events** | Surat textile expos — booth, budget, leads → CRM |
| 10 | **Barcode Operations** | scan-driven pick/pack/dispatch and stock count on the Capacitor shell, posting movements live |
| 11 | **Master-Data Hygiene** | fuzzy duplicate detect/merge for customers, vendors, designs — *"protects every downstream report"* |
| 12 | **Fleet** *(optional)* | vehicle register, fuel/maintenance, trip costing into freight |

**Roadmap placement is specified (L68):** items 1–4 are Phase 3–4, *"the Elitesecom-parity
core and the highest ROI."* Items 5–11 are Phase 6. Item 12 optional. And the closing
assurance: *"None change the non-negotiable architecture (single stock per SKU, one posting
engine, RLS, audit trail) — they extend it."*

## Findings

**3.1** Of the twelve, **`brand/site/modules.js` covers four** — Repricing Engine (13.3),
Barcode Operations (05.2), and arguably Listing/Catalog via Catalog-PIM (07.2) and
Channels & Storefronts (04.7). **Eight have no home in any module list I have worked from:**
Kit/Combo SKU, NDR/RTO as a workflow, Subscriptions, Forms & NPS, Recruitment, Knowledge
Base, Events, Master-Data Hygiene, Fleet.

**3.2** Kit/Combo SKU is structural, not cosmetic — a three-piece set sold as one listing is
exactly this business, and it changes the stock model. Adding it late means reworking every
order path that touches stock.

**3.3** Nykaa and JioMart are named as connectors to add. `modules.js` already lists both in
module 04, so this one is already reflected.

---

# 4 · `CanvaPhotoshop_Hybrid_Model.md`

**230 lines · a build blueprint for a design platform**

Read in full, 12 Aug. Never previously addressed.

## What it is

Not an ERP document. It is a standalone blueprint for building a **Canva + Photoshop hybrid**
— five phases plus foundational architecture, with tool choices, hard problems and realistic
timelines. Its closest existing comparison is named as **Photopea** (L23).

## What it specifies

**Phase 0 — the decision that governs everything (L10–46).** The rendering engine. Canvas 2D
via Fabric.js/Konva.js is best for the design/layout layer; WebGL via PixiJS is essential for
pixel editing. **Recommendation: hybrid — Fabric/Konva for layout, WebGL for raster** — which
is how Photopea is built. Client-side for anything under ~1–2 s; server-side queue for video
encoding, AI background removal, upscaling, batch export. Full stack table at L32–46
(Next.js · Zustand/Redux · NestJS or FastAPI · Postgres · R2/S3 · Redis · FFmpeg + Sharp ·
BullMQ · Yjs for later collaboration).

**Phase 1 — MVP editor (L59–97).** Layer stack with a **scene graph, not a flat array**
(L66) · crop/transform/rotate/text/shape · adjustments as **WebGL shaders, because CSS
filters are not production quality** (L76) · marquee selection and layer masks as the
foundation for Phase 3 · undo/redo via the **command pattern storing deltas, never whole-canvas
snapshots** (L85) · export · and autosave, which it calls **non-negotiable**: *"Users will
panic and abandon the product if they lose work once"* (L95).

**Phase 2 — templates and brand kit (L101–130).** A template is a project JSON with
placeholder layers marked editable. Flags the **content pipeline problem** (L108) — templates
need actual designers or a licensed pack; an ops cost, not an engineering one. Magic-Resize
is *"genuinely tricky (naive scaling breaks text-heavy layouts)"* (L123).

**Phase 3 — advanced editing (L134–160).** Blend modes and layer effects as non-destructive
shader passes · magic wand, lasso, feathering · and an unusually honest note on **clone stamp
and healing brush** (L148–151): *"genuinely hard to build well… this is often where teams
should scope down rather than chase full Photoshop parity."*

**Phase 4 — video (L164–185).** *"Cannot reliably render final video in-browser"* — the
correct architecture is a backend render queue with FFmpeg or headless Chromium.
**Remotion is recommended for direct evaluation** as potentially saving months. Video render
is named as the biggest infrastructure cost driver at scale.

**Phase 5 — business layer (L189–210).** Accounts, sharing, Stripe tiers, asset licensing
review, admin and analytics. Real-time collaboration is explicitly **deferred** (L199) as one
of the hardest problems and not needed for MVP.

**Timeline (L214–223).** 12–20 months with a small dedicated team; longer solo. Advice: launch
after Phases 1+2 as a focused design tool.

## Findings

**4.1 This is a different product from the ERP.** Nothing in it references Vastrangam,
companies, GST, SKUs or karigars. It is a blueprint for a tool to sell, or to build, in its
own right.

**4.2 It overlaps module 14 heavily.** `modules.js` module 14 is Content Engine · **Image
Studio** · **Video Studio** · **Design Studio** · Publisher. Phases 1–4 of this blueprint are
essentially those three studios. `Vastrangam_Image_Studio_Pro.html` (uploaded twice, 212 KB
and 231 KB) is an existing implementation of part of Phase 1.

**4.3 Its own reality check contradicts treating it as an ERP sub-module.** L55:
*"Full parity with Canva+Photoshop features realistically takes a funded team 12-24 months."*
Module 14 has five apps out of sixty-five. Either this blueprint is a separate programme, or
module 14 is being asked to carry a product larger than the ERP around it.

**This needs a ruling** — it is Part 5 question 3 of the plan of action.

---

# 5 · `Vastrangam_Power_BI_Dashboard.md`

**956 lines · the master Excel dashboard specification**

Read in full, 12 Aug. Previously I had read only its headings.

## What it is

The specification for **`Vastrangam_Dashboard_[FY].xlsx`** — a nine-sheet analytical workbook
built from **`Vastrangam_Master_Excel_Sheet_[FY].xlsx`**, a single source file with **14
sheets**. Multi-entity, financial-year-agnostic, and formula-driven end to end.

## What it specifies

**Ten golden rules (L20–33).** No row limits anywhere — *"Every row from every sheet. No
.head(), .sample()"* · **no hardcoded values — every dashboard number is an Excel formula**
referencing a staging table · INR only · FY auto-detected from the data, never hardcoded · no
overlapping elements · no excess blank rows · every sheet needs at least one chart and one
formatted table · all 9 sheets present and validated before save · every dataframe written to
a hidden `Data_` sheet **formatted as a named Excel Table** so ranges auto-expand · KPIs use
`=SUMIFS(Data_Purchase[Cost], Data_Purchase[Company], A2)` style references.

**The reporting structure rule, applied to all nine sheets with no exceptions (L37–54).**
Every summary table, KPI section and grouped breakdown shows **Vastrangam / Ethnic Fashion /
Adini as separate rows, then one CONSOLIDATED row** — and the consolidated row is
`=SUM()` of the three above it, **never a separate SUMIFS**.

**The 14 source sheets → 14 `Data_` tables (L199–299).** Opening Stock · Staff Attendance ·
Staff Report · **Stitching Rate** · Karigar Report · Production (Material Avg.) · Purchase ·
Purchase Return · Selling B2B · Return B2B · Freight · Selling B2C · Return B2C · Expenses.

**The master financial chain (L303–335)**, each as a SUMIFS: Net Purchase = Purchase −
Purchase Return · Gross B2B Net = B2B Sales − B2B Return − Freight · **B2C Selling Price =
Price − Shipping − Commission − Fixed Fee − GST 18% − TCS − TDS** · Gross B2C = Selling Price
− Total Return · Net B2C = Gross B2C + Gross B2B Net · COGS = Net Purchase · Total Expenses =
Freight + Expenses + Staff Prod Cost + Karigar Wages + Joginder Wages · Net Profit = Gross
Profit − Total Expenses.

**Nine dashboard sheets (L339–889).** DB_Index (navigation + 6 KPIs + entity summary) ·
DB_Financial_Summary (8 KPIs, channel table, B2C two-row block, cost breakdown, entity P&L) ·
**DB_HR** (Section A: six staff tables including a daily attendance register with coloured
status cells and a monthly present-days matrix; Section B: three karigar tables; **Section C:
the stitching-rate master and a full costing checklist from Checking → Stitching → Thread
Cutting → Iron → Packing → Dispatching, giving Total Cost per Set**) · DB_Purchase_Analysis
(net purchase by design/set/material/state/party) · DB_Sales_Report (freight, B2B by
design/material/state/city, B2C by platform, returns, net) · DB_Inventory_Production
(**Closing Stock = Opening + Net Purchase + Production (Set + Unset + Job Work) − Net Sales**,
with a dead-stock register and 🟢/🟡/🔴/⚫ status flags) · DB_GST_Report (**Net GST = Input −
Output**, Credit/Payable per company) · DB_Expenses.

**Formatting (L893–909)** — NAV `#1B2A4A` banners and consolidated rows · TEA `#0D7377`
section headers · GLD `#C4975A` KPI values · gridlines off · freeze row 1 + column A ·
integer rupees · status colours P green / HL gold / H orange / A red · **dead-stock rows in
black fill with white text**.

**Validation before save (L913–932)** — assert exactly 9 `DB_` sheets and at least 14 tables,
then print the eight headline figures.

## Findings

### 5.1 The stitching rate master is a sheet, not a file

I have asked repeatedly for `Stitching_Rates_Master.xlsx` and called it a blocker. **It is
sheet 4 of the master workbook** — `Data_StitchingRate`, columns `Company | Design | Set |
Attribute | Rate` (L226–229). I was asking for the wrong artefact. What is needed is
`Vastrangam_Master_Excel_Sheet_[FY].xlsx`, which carries it along with thirteen other sheets.

### 5.2 A fourth version of the hours and pay rules — and this one prices on hours

L108–119 and L168–174:

| | Male weekday | Male Sunday | Female weekday | Female Sunday |
|---|---|---|---|---|
| **This document** | 09:30–20:00 = **10.0** | 09:30–14:00 = **4.5** | 09:30–18:30 = **8.5** | 09:30–16:00 = **6.0** |
| ERP prompt §B.2.6 | 9:00–19:30 = 10 | 9:00–14:00 = 4.5 | 9:00–18:00 = 8.5 | 9:00–16:00 = 6 |
| Combined prompt §3.5 | 10 | **5** | **8** | **5.5** |

And the cost formula (L951): **`Staff Productivity Cost = (Monthly Salary / 270 Male | 230
Female) × Active Hours`** — pricing on **threshold hours**, where the Combined prompt prices
on threshold **days** and demotes hours to a legacy reference. That is a third distinct
pricing model, after ÷27 flat and ÷threshold-days.

### 5.3 Holiday pay is the reverse of what I implemented

L116: **`HL — Holiday … Full hours / 0 productive … Productivity Cost 0`**.
L169: `if status in ['A', '', 'HL']: return 0`.

The Combined Master Prompt §3.5 says *"Holiday pays as a full present day"* and includes HL in
Actual Days-Equivalent. **This document pays nothing for a holiday.** The engine and the
workbook I delivered follow the Combined prompt. On real data this is a material difference
in every month containing a holiday, and it is not a rounding argument — it is opposite.

### 5.4 Everything here is company-split, and nothing I built has a company dimension

The rule at L13 is stated as absolute — *"Company-wise split … + ONE Consolidated Collective
row/section. No exceptions."* Every one of the 14 source tables carries a `Company` column as
its first field.

**The engine, the fixtures and the 20-sheet workbook I delivered have no company field at
all.** They compute one undifferentiated set of figures. Splitting them by company is not a
formatting change — it is a change to the data model, the fixtures and every gate.

### 5.5 It settles the return-cost conflict on one side

L285–288 and L944: Customer = qty × ₹20 · Courier = qty × ₹5 · **Wrong = full Selling Price,
LOST, dead stock, explicitly not returned to inventory.** This agrees with ERP §B.2.8 and
disagrees with ERP §B.2.11's design-specific figure (₹25.5 for MuskanPurple). Two documents to
one — but §B.2.11 is the more detailed treatment, so this is still a ruling for you, not a
count.

### 5.6 A closing-stock formula that exists nowhere in my work

L766–773. Closing Stock = Opening + Net Purchase + Production (Set-wise finished + Unset
attribute-wise + Job Work) − Net Sales, valued at **weighted average cost via SUMPRODUCT**,
with wrong-returns held out as dead stock. Also introduces **"Unset" designs** (L749–753) —
units in production not yet completed into sets — which is a production state my karigar model
does not represent.

### 5.7 The document contradicts itself on its own sheet count

L31 and L919 assert **9** dashboard sheets. `TAB_COLORS` (L74–83) names **8**. The navigation
table (L373–381) lists **7**. Minor, but it means the assertion as written cannot pass against
the sheets the document itself defines.

### 5.8 Its staff master is a fifth roster variant

L88–104. Eleven people, Karim at **₹18,000** flat, thresholds as hours only, no effective
dating, no Upender / Priyanka / Rupsa / Selima / Ikram. It is an FY2025-26 snapshot.

### 5.9 Where it agrees with what I built

The core principle is the same one I applied to the karigar/staff workbook: **every dashboard
number is a live formula over named tables, never a typed-in figure**, with validation
assertions before save. Gridlines off, frozen panes, no row limits. The palette differs
(navy/teal/gold here, slate/violet in `sheetstyle.py`) but the discipline is identical.

## Open questions

1. **Supply `Vastrangam_Master_Excel_Sheet_[FY].xlsx`** — 14 sheets, and it contains the
   stitching rate master I have been asking for under the wrong name.
2. **Does a holiday pay or not?** §5.3. Opposite answers in two documents.
3. **Which pay model** — ÷27 flat, ÷threshold-days, or ÷threshold-hours. Three documents,
   three answers.
4. **Is the company dimension required in the karigar/staff outputs?** If yes, the engine and
   the delivered workbook both need a company field before anything else is built on them.

---

# 6 · `Prompt_Combined_Production_and_Payment_Report.md`

**108 lines · the karigar report brief**

Read in full, 12 Aug. The instruction that produced `Karigar_Production_and_Payment_Report_FY202527.xlsx`.

Specifies **Format A (wide)** and **Format B (SKU-text)** with auto-detection (L3–20), the
**9-sheet output structure** (L22–45), the parsing rules including the full SKU-suffix table
and the Job Work vendor-label handling (L48–68), set-matching (L70–83), payment logic
(L86–95) and four validation rules (L97–107).

**6.1 — It says POPULATED.** L75: *"Total Complete Sets = the smallest **populated** slot."*
That is the third document to say so, against the ERP prompt's one statement of "member
columns" (source 1, §1.2). The count is now **2 explicit for populated, 1 for all-members** —
which supports the default I flipped the engine to, though the ERP prompt still names
`Vastrangam_Karigar_Tool.html` as the arbiter.

**6.2 — Everything else here is already implemented.** Format detection, the suffix patterns,
never merging near-matched team names, weighted-average rates, the rate-variance adjustment
line, and the four validation gates are all in `engine/vastrangam/` and pass.

---

# 7 · `Read_Me_Methodology_FY202527.md`

**111 lines · the methodology write-up shipped inside the delivered karigar report**

Read in full, 12 Aug.

Documents how the two source formats were combined, the rate master reconciliation, the
set-matching with a worked example, weighted-average piece rates, team naming, payment
summary and what went to Needs Review.

**7.1 — A design-level conflict I have never handled.** L23–29: the two years' rate masters
hold 394 vs 393 design/attribute rates and **V508 is a Lehenga Choli Set in FY2026-27 but a
Co-Ords Set in FY2025-26.** The FY2026-27 definition was taken as primary and **24 FY2025-26
pieces recorded under Plazzo/Jacket did not match** and were flagged. My engine has
`master_rate_conflict()` for rates but nothing that detects a design changing **set type**
between periods.

**7.2 — The delivered report flagged more than my engine does.** L105–110: *"39 pieces
total"* across several miscoded entries — "Short Top Sample" logged under Alter, V508 under
Kurti/Palazzo. My run reports **4 rows** in Needs Review against the same file. Either my
reader is silently resolving things the original flagged, or it is counting differently.
**Unverified — this needs checking against the source before any figure from it is trusted.**

**7.3 — The worked example is a useful known-answer test I do not have.** L46–49:
Rakesh / Dhanvi FY2025-26 — 60 Anarkali, 43 Plazo, 23 Dupatta → **23 complete sets**, 37 extra
Anarkali, 20 extra Plazo. All three slots populated, so it does not discriminate between the
two set rules, but it is a real fixture worth adding.

---

# 8 · `Staff_HR_Reporting_Master_Prompt.md`

**231 lines · the staff pipeline brief, superseded**

Read, 12 Aug. §§1–4 read line by line; §§5–8 are reproduced verbatim as §3.5–§3.7 of the
Combined Master Prompt (source 9) and were read there.

This is the direct predecessor of the Combined prompt. Roster, salary log, threshold-days log
and rule-change log are identical, **including Karim's ₹18,000 from 1 June 2025** — so on that
point two karigar/staff documents agree against the ERP prompt's 1 July.

**8.1 — The third mention of a file that has never been supplied.** L15: *"This is SEPARATE
from the karigar stitching pipeline (**`Karigar_Master_Prompt.md`**)."* Named in source 2 as
holding *"the Production module's exact costing logic"*, and here as the other half of this
pipeline. Still missing.

**8.2 — Superseded, and safe to treat as such.** Where it differs from the Combined prompt the
Combined prompt is later and more complete. It is registered so that no rule in it goes
unaccounted for, not because it governs.

---

# 9 · `Karigar_and_Staff_Combined_Master_Prompt.md`

**405 lines · the final karigar & staff specification**

Read in full, 12 Aug, and implemented in this session. Registered here for completeness; its
rules and the five conflicts it settled are already recorded in the commit
*"Apply the Combined Master Prompt's rules, and drop the rest"* and in the changes to
`engine/vastrangam/`.

Its §2.4 nine karigar sheets, §3.6 nine staff sheets, §4 Combined Productivity Overview and
§6 style are built and verified — `engine/vastrangam/workbook.py`, recalculated by
`engine/recalc.py` with zero formula errors on both financial years.

**Not built from it:** §5, the multi-FY combined workbook.

---

# STILL TO READ

| Source | Size | Status |
|---|---|---|
| `Vastrangam_ERP_ALL40Apps_and_Modules1.pdf` | 63 pages | **not yet re-read** — read once in an earlier session via an extraction that no longer exists |
| `Karigar_and_Staff_Universal_Master_Prompt.md` | ~400 lines | not yet read this session |
| `Vastrangam_Product_Content_Report.docx` | 13 KB | **never opened** |
| `Vastrangam_Image_Studio_Pro.html` ×2 | 212 KB · 231 KB | code, not prose — one version is already embedded in the app |
| 6 × `.xlsx` data files | — | used as data by the engine; not read as specifications |
| **68 images** | Jul 28 – Aug 8 | **none reviewed** |

---

# RUNNING TALLY OF WHAT THE READING HAS CHANGED

**Four named sources of truth are missing.** None was ever requested by me:

| Named in | File | What it settles |
|---|---|---|
| ERP prompt §D.4 L1682 | `Vastrangam_Karigar_Tool.html` | *"the source of truth for production math"* — 23 columns, 13 set types, the set rule, named extras |
| Accounting prompt L250 · Staff HR prompt L15 | `Karigar_Master_Prompt.md` | *"the Production module's exact costing logic"* |
| Power BI prompt L10 | `Vastrangam_Master_Excel_Sheet_[FY].xlsx` | the 14 source sheets — **and it contains the stitching rate master I kept asking for as a separate file** |
| ERP prompt §D.1 | the 5 BUSY `.bds` files | opening balances, and verification that no tax concept was missed |

**Live contradictions across sources, none of which I may decide alone:**

| # | Question | The readings |
|---|---|---|
| 1 | Set completion | **populated** (sources 6, 9) vs **all member columns** (source 1 §D.4) — 213 sets |
| 2 | Pay divisor | ÷27 flat (source 1) · ÷threshold **days** (source 9) · ÷threshold **hours** (source 5) |
| 3 | Working hours | three different tables (sources 1, 5, 9) |
| 4 | **Does a holiday pay?** | full day (source 9) vs **zero** (source 5) |
| 5 | Karim's raise | 1 June (sources 8, 9) vs 1 July (source 1) |
| 6 | Return cost | flat ₹20/₹5 (sources 1 §B.2.8, 5) vs design-specific ₹25.5 (source 1 §B.2.11) |
| 7 | Module taxonomy | 20 (source 1) vs 16 (`modules.js`) vs "40 apps" (the PDF title) vs 65 apps (counted) |
| 8 | Company dimension | mandatory on every table (source 5) — **absent from everything I have built** |

---

*Documents read: 9 of 21. Images read: 0 of 68.*
