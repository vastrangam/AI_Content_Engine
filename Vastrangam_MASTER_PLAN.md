# 🪔 VASTRANGAM — MASTER PROJECT PLAN
### One document for the whole thing. Review this, mark corrections, then we build to it.
**Compiled by Claude (Opus 4.8) · draft for Praveen's review · nothing here is pretended-done — every item is labelled.**

**STATUS LEGEND:** ✅ Built & verified · 🟡 Built but stubbed (needs API/key to be "real") · 🟦 Mockup only (no data) · 📄 Spec/prompt only (not a tool yet) · 🔴 Not built / external dependency · ❓ Needs your input

---

## 0 · WHAT THIS PROJECT ACTUALLY IS

Two halves of one business system:

- **Creative front-of-house — "AI Studio":** turn a product photo into complete, *humanized*, on-brand content (listings, social, songs, ads) + edited images + branded designs.
- **Operations back-of-house — "ERP":** run the business — production costing (karigar piece-rate), materials, sales/returns/inventory, accounting, GST, marketplace reconciliation.

They share **one SKU + design library** and one company structure. The ERP spec (`Vastrangam_ERP.md` v5.0) is the umbrella; the studios are its **★ AI Studio** domain.

**Companies (N-company):** Vastrangam (flagship, VS) · Ethnic Fashion (Go4Fashion, EF/GF) · Adini (Adini Couture, AC) · Group (consolidated). Nothing hardcoded to 3.

---

## 1 · CURRENT STATUS — every file, honestly labelled

| File | What it is | Status |
|---|---|---|
| `Vastrangam_Content_Engine_Humanized.md` | The humanized brain — all 13–14 modules, AI-undetectable, self-improving loop, songwriting fix | ✅ (it's a prompt; runs in any chat) |
| `Vastrangam_AI_Content_Engine.md` | Original 13-phase engine (structure: 61-col CSV, marketplace schemas, QA gates) | ✅ (baseline structure) |
| `Vastrangam_Image_Studio_Pro.html` | Photoshop-style editor: crop-fill, adjust, AI bg-removal/erase, Myntra 1080×1440, New Canvas/Ctrl+N, watermark, Excel, export JPG/WebP/ZIP | ✅ editor · 🟡 AI buttons need Gemini key |
| `Vastrangam_Design_Studio.html` | Canva-style: templates + banner/thumbnail formats, undo/redo, any-colour picker, align, numeric size, bg-image upload, stock elements, PNG/JPG/PDF, AI Assist | ✅ editor · 🟡 AI Assist is an offline stub |
| `SAMPLE_RUN_Teal_Chinon_Anarkali.md` | Live proof: full humanized engine run on your real product + real market research | ✅ demo output |
| `Vastrangam_ERP_Home.html` | Odoo-style launcher: 10 domains + AI Studio tiles, company re-skin, data-flow wiring view, website-vs-app | 🟦 clickable mockup, no data |
| `Vastrangam_Finance_Tool.html` | **Finance Intelligence** — settlement/return import (SheetJS), portal auto-detection, 20-column order + SKU P&L, Reco A/B, 15-tab branded Excel export | ✅ working tool · this IS the ERP's locked Finance spec (Part D) |
| `Karigar_Master_Prompt.md` | Piece-rate production costing → 2 branded Excel workbooks | 📄 prompt (works in chat now) |
| `materialconsumptionanalysisprompt.md` | Material consumption & cost → 3-view workbook | 📄 prompt |
| `Sales_Data_Extraction_Prompt.md` | Offline + ecommerce sales/returns/inventory extraction | 📄 prompt |
| `Vastrangam_ERP.md` (v5.0) | Full ERP master: 10 domains, ~85-table schema, 33 n8n flows, GST, migration | 📄 spec for a dev-team build |
| `…SS_21.busy.mp3` | Uploaded audio | ❓ I cannot process audio — tell me what it is |

**Code health (checked 3×):** all HTML pass JS syntax; every button→function and element ID resolves; git clean & pushed. No silent breakage.

---

## 2 · THE HUMANIZED CONTENT ENGINE — how it works

**The one law:** structured data (CSV/titles/attributes) gets keywords; anything a human reads gets *feelings*. Product nouns are banned from creative surfaces; **banned outright from song lyrics**.

- **Covers all 13–14 modules** (module-by-module table in the file), not lyrics-only.
- **AI-undetectable layer:** burstiness + perplexity + real specifics + voice + imperfection + no AI-skeleton. Honest caveat: no permanent 100% guarantee vs evolving detectors — but genuinely human-shaped writing passes *and* reads better.
- **Self-improving loop:** every output = draft → self-critique (12-point gate) → rewrite; plus a session "voice memory" that learns from your edits.
- **Songwriting module:** Mukhda→Antara→Mukhda, Hinglish, emotion not product, music by 1–3 sec, original lines (zero copyright risk).

**Model strategy (quality + cost):**
| Job | Model | Why |
|---|---|---|
| Lyrics, captions, reels, ads, blog | **Fable 5** (`claude-fable-5`) | best natural prose |
| 61-col CSV, marketplace attrs, alt text | **Sonnet 5** (`claude-sonnet-5`) | pure structure, cheaper |
| Image research | **Gemini** (free tier) | reads the photo |
| Music audio | **Suno** (from Fable's lyrics) | Claude can't sing |
| Video | **Veo/Kling/Krea** | Claude can't film |

**Cost truth:** for your volume, **pay Claude nothing** — paste the prompt into free Claude.ai / ChatGPT / Gemini. The paid API only buys *unattended automation* (30 images → finished CSV, hands-off). A full 10-piece catalogue on the paid API ≈ ₹40–₹170; variant-optimised ≈ under ₹1. Gemini images ≈ free.

---

## 3 · THE OPERATIONS PROMPTS (back-office logic, ready to build as tools)

| Prompt | Input → Output | Maps to ERP app |
|---|---|---|
| **Karigar Costing** | Karigar Reports + Rates → pooled sets + piece-rate earnings, 2 Excel workbooks | Manufacturing + HR + Finance |
| **Material Consumption** | Consumption × production → cost in 3 views | Manufacturing BOM + Finance |
| **Sales Extraction** | Offline (3 sheets) + ecommerce (4 sheets) → net sale, wrong-return, inventory | eCommerce Reco + Finance Intelligence |

All three are precise and usable in a chat **today**; each should become a standalone HTML tool.

---

## 4 · THE FULL ERP (v5.0) — 10 domains + AI Studio

Odoo-style launcher; one shared data layer (`company_id` + row-level security); group roll-ups.

1. **Dashboard** — CEO view, group consolidation, 10-yr trends
2. **Website** — site (Shopify/Woo/custom adapter) · eCommerce (5 marketplaces) · Return/Payment Reco · Blog · Forum · Live Chat
3. **Sales** — CRM · Quotes/Orders (B2B, Export) · POS
4. **Finance** — Accounting (replaces BUSY) · Invoicing · Expenses · Documents · Spreadsheets/BI · eSign · **Finance Intelligence** (settlement reco, 20-col SKU P&L)
5. **Inventory & Manufacturing** — WMS+VMS · 10-stage MRP/MES · PLM · Purchase · Quality · Maintenance
6. **HR** — Staff & Karigar · Time Off · Appraisal · WhatsApp commands · payroll
7. **Marketing** — Automation · Email · SMS · Social
8. **Services** — Project · Timesheets · Helpdesk · Planning
9. **Productivity** — Discuss · Approvals
10. **Customization** — no-code Studio
★ **AI Studio** — Content Engine · Image Studio · Design Studio · Publisher · AI Command Centre

**Stack (Track B):** Next.js 15 + Supabase (Postgres+RLS) + n8n/Playwright + Interakt (WhatsApp) + Anthropic/Gemini + Vercel. ~85 tables. Migration: BUSY cutover 1 Apr, 60-day parallel run.

---

## 5 · WIRING — the 5 flows that make it one system

Over one shared data layer:
1. **🧵 Design → Dispatch:** PLM → Purchase → Manufacturing(10 stages) → Quality → Inventory → Dispatch
2. **🛒 Order → Cash:** Website/eCommerce → Sales Order → Inventory reserve → Invoicing → Shipping → Payment → Accounting
3. **📊 Settlement → Books:** settlement file → Finance Intelligence (reco) → SKU P&L → Claims → Accounting → Dashboard
4. **👤 Karigar → Payroll:** WhatsApp REPORT → Manufacturing pieces → HR earnings → Payroll → Finance
5. **✨ Content → Publish:** Image Studio + Content Engine → Publisher → Website + Marketplaces + Social

---

## 6 · THE TWO TRACKS (what I can build vs what needs a dev team)

- **Track A — I build in this chat (HTML tools + prompts, offline):** the studios (done), the 3 operational tools, Finance-Intelligence-lite, and live-AI wiring. Runs on files you upload. Proves the logic on your real numbers = the spec's own Week-1 Pilot.
- **Track B — real software project (dev team, ~8 phases/32 weeks):** the live unified ERP with databases, RLS, marketplace APIs, GST filing, WhatsApp automation. I provide architecture, schema, and reference tools; I cannot "run the business" from a chat.

**Smart order:** build each ERP app as a Track-A tool first → if numbers match your records, it becomes the de-risked spec for Track B.

---

## 7 · ROADMAP (phased, with gates)

**PHASE 1 — Prove the creative side** ✅ mostly done
- Humanized engine ✅ · Image Studio ✅ · Design Studio ✅ · sample run ✅
- Remaining: 🟡 wire live Fable 5 + Gemini so AI Assist/content actually generate · connect the 3 studios into one flow

**PHASE 2 — Prove the operations side (Track A tools, on your real Excel)**
- A1 Karigar Costing tool → A2 Sales/Return/Inventory → A3 Material.  **A4 Finance Intelligence already exists** as `Vastrangam_Finance_Tool.html` (settlement reco + 20-col + SKU P&L + 15-tab Excel) — it's a working tool, so Phase 2 is really "build A1–A3 to the same standard."
- Gate: each tool's totals must match your own records (≥98% settlement match; SKU profit within ₹10; missing-returns ≥ your manual sheet)

**PHASE 3 — Unify (still Track A)**
- One shared "Project/SKU" data layer across the studios + tools; the ERP Home tiles start opening the real tools

**PHASE 4 — Track B (dev team, when budget/engineers ready)**
- Their locked 8-phase/32-week build: Setup → Core → HR → Inventory/Mfg → Sales/Website → Finance → AI Studio → Cutover (1 Apr)
- I supply: locked schema + Finance Intelligence column spec + reco formulas + reference tools

---

## 8 · WHAT'S MISSING / GAPS (nothing hidden)

**Stubbed — needs an API key/model to be real:** Design Studio AI Assist (offline stub) · Image Studio AI buttons (Gemini key) · Content Engine (needs a model to run) · live AI *image/video/music* generation (Gemini/Imagen/Suno/video — external).
**Mockup only:** ERP Home (no backend/data).
**Not built yet:** the 3 operational tools (Karigar / Material / Sales are still prompts) · studio-to-studio connection · full ERP (Track B). *(Finance Intelligence is NOT in this list — it's already built as `Vastrangam_Finance_Tool.html`.)*
**External limits I won't fake:** Canva's stock *photo* library · reverse-image-search to name the exact boutique selling a product · Myntra/Ajio have no open API (RPA/partner only) · I cannot listen to the `.mp3`.

---

## 9 · DECISIONS I NEED FROM YOU (❓)

1. **Claude access:** free web-chats (₹0, manual) vs a tiny serverless proxy (paid API, automation)?  → decides hosting.
2. **Build order for Phase 2:** Karigar first, or Finance-Intelligence (settlement reco = biggest money-finder) first?
3. **Live AI now or later:** wire Fable 5 + Gemini into the studios now, or keep proving logic first?
4. **The `.mp3`:** what is it? (Suno song to judge / voice note / something else) — paste lyrics or a summary.
5. **Anything in this plan wrong or missing** — mark it and I correct.

---

## 10 · HONESTY CHARTER (how you keep me straight)

- Every deliverable labelled: *finished tool* vs *stub* vs *mockup* vs *spec*.
- Every operational tool must match **your own records** — numbers you verify, not promises.
- I will say "sorry, I can't" rather than fake a capability (audio, image-generation-in-HTML, exact-seller-from-photo, running a full ERP from a chat).
- Code is checked (syntax + wiring + IDs) before I say "done"; browser click-testing is yours.

*Vastrangam — Desire to Attire · Crafted in Surat · one system, two halves, built honestly, one piece at a time.*
