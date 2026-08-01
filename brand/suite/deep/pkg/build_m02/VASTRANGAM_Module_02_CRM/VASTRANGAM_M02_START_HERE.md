# START HERE — VASTRANGAM edition
## Medhava · Module 02 · CRM

**1 app in this edition.** (The other edition ships in its own ZIP.)

Nothing here is a mock-up. Every screen works, every button does something, and every
number is calculated live.

---

## 1 · What is in this folder

You are in the **VASTRANGAM** edition — the same app(s) carrying Vastrangam's own data, rules and examples.

```
VASTRANGAM_Module_02_CRM/
│
├── VASTRANGAM_M02_START_HERE.md              ← you are reading this
├── VASTRANGAM_M02_Module_Overview.pdf        ← the whole module, how it wires together
│
└── App_01_CRM_Customer_360/
     ├── VASTRANGAM_M02_App01_CRM_Customer_360.html          ← DOUBLE-CLICK THIS
     ├── VASTRANGAM_M02_App01_CRM_Customer_360_MANUAL.md
     └── VASTRANGAM_M02_App01_CRM_Customer_360_WIRING.pdf
```

Every filename starts with **VASTRANGAM_** so you always know which edition you have open.
The Medhava edition ships in its own ZIP alongside this one, with **MEDHAVA_** on every file.

**Inside each app folder, three files:**

| File | What it is |
|---|---|
| `….html` | The app. **Double-click this.** One file, works offline. |
| `…_MANUAL.md` | The complete manual, for someone who has never installed software. |
| `…_WIRING.pdf` | Every screen, every process, every diagram — with real screenshots. |

---

## 2 · How to open it (60 seconds)

1. **Extract this ZIP** if you have not already. It was sent to you on its own —
   there is no outer ZIP to open first.
   Windows: right-click → *Extract All*. Mac: double-click it.
2. **Open the app folder** you want. Everything for that app is inside it.
3. **Double-click the `.html` file.** It opens in your browser. That is the entire installation.

> ⚠️ **The one mistake to avoid:** opening the `.html` file directly from *inside* a ZIP.
> Windows unpacks it into a temporary folder that gets wiped, so your data appears to
> vanish later. **Always extract first.**

**On a phone:** put the `.html` file on your phone, open it with Chrome (Android) or
Safari (iPhone), then use **Add to Home screen**. It gets its own icon and behaves
exactly like any other app — including with the internet switched off.

Full step-by-step instructions for Windows, Mac, Android and iPhone are in each app's
`_MANUAL.md`.

---

## 3 · The app

### App 01 · CRM & Customer 360 — *8 screens, 38 self-tests*
दो काम एक ही record में — जो आम software दो अलग products में करता है. खरीदने से पहले वो एक **lead** है, pipeline में, हर stage पर असली probability के साथ. खरीदने के बाद वही record पूरा **lifetime** बन जाता है — हर order, हर return, असली worth (returns हटाने के बाद), और आगे क्या offer करें.

- **Pipeline with honest odds** — New 10% · Contacted 25% · Quoted 50% · Negotiation 75%. "Likely to close" हमेशा raw pipeline से कम होता है, और वही number cash plan करने लायक है.
- **Won दबाइए और customer तुरंत बन जाता है** — कोई export नहीं, कोई दोबारा typing नहीं, और कोई gap नहीं जहाँ कोई छूट जाए.
- **Lost भी record होता है, reason के साथ** — win rate इसी से बनता है, और "where deals are being lost" table तीन महीने बाद सबसे काम की चीज़ बन जाती है.
- **छह behaviour groups खुद बनते हैं** — Champion, Loyal, Needs attention, At risk, Sleeping, New. कोई किसी को hand से tag नहीं करता; 91वें दिन customer अपने आप At risk हो जाता है.
- **Customer 360** — worth, orders, returns, channel mix (किस channel से माल वापस आ रहा है), हर order, और conversation log.
- **Worth कभी store नहीं होता** — हर बार orders से गिना जाता है, इसलिए ये figure Sales से कभी अलग नहीं हो सकता.

---

## 4 · Nothing is locked to one company

Every app in this module checks this on itself at every launch, and you can see it:
open the app → **Connectors** in the left menu.

- **No capability has only one choice.** Every one has at least three; most eight to twelve.
- **Every capability has a built-in or by-hand option**, so the app is fully usable with
  *nothing connected at all* — no account, no internet, no subscription. That is the default.
- **Every capability has an option you can host yourself**, so sending your data to
  somebody else's cloud is never forced.
- **Switching a provider never changes a figure.** The arithmetic lives in Medhava.

Books can be Medhava's own ledger, Tally, BUSY, Marg, Zoho, QuickBooks, self-hosted
ERPNext, or plain CSV to your CA. AI writing can be Medhava templates with no AI at all,
a model on your own machine, or Claude / GPT / Gemini / DeepSeek. Automation can be
Medhava Rules, your own n8n, Node-RED, Make, Zapier, or nothing. And so on, for every
capability an app touches.

> Cloud services connect with a scoped, revocable key — **never your account password.**
> Medhava will never ask for one.

---

## 5 · How to check it yourself

You do not have to take any of this on trust.

**Check the arithmetic:** open the app → **Backup & Health** in the left menu →
read the **Self-tests** panel. The tests ran the moment the app started, on your device,
against your data. They are written in plain English on purpose.

**Segments खुद बनते हैं?** Customers screen पर "At risk" button दबाइए — जो customers 90
दिन से चुप हैं वही दिखेंगे. किसी ने उन्हें tag नहीं किया; rule ने किया.

**Won दबाने से customer बनता है?** Pipeline पर कोई भी deal "Won" कर दीजिए, फिर Customers
screen खोलिए — वो वहाँ है, segment "New" के साथ.

**Check it really works offline:** turn off your WiFi and reload the page.

---

## 6 · Your data

It lives in your own browser, on your own device. Nowhere else. Never on a server.

- Nobody else can see it.
- It survives closing the app and restarting the computer.
- It does **not** travel between your laptop and your phone by itself.
- Clearing your browser's "site data" **will** erase it.

**So take a backup weekly:** *Backup & Health → Export JSON.*
To move to another device: carry the app file and the backup, then *Import JSON*.

---

## 7 · Where this sits in the suite

| # | Module & apps | Status |
|---|---|---|
| 01 | Dashboard & BI — CEO Dashboard · Report Builder · Group Consolidation | Delivered |
| **02** | **CRM — CRM & Customer 360 · Documents & eSign · Helpdesk & Live Chat** | **Delivered — this ZIP** |
| 03 | Sales — D2C Sales · B2B & Credit · Export · POS · Quotes & Proforma · Couriers & AWB | Next |
| 04 | E-commerce / OMS — Marketplace OMS · Order Management · Manual Data Check · Reconciliation · Claims & Disputes · Returns / RMA · Channels & Storefronts · Labels & Documents |  |
| 05 | Warehouse — Picking & Bins · Barcode Operations · Packing Video |  |
| 06 | Logistics — Rates & Zones · NDR & RTO Rescue · COD Remittance · Handover & Manifest |  |
| 07 | Inventory & Catalog — Stock · Catalog / PIM |  |
| 08 | Manufacturing — PLM & Development · Production Orders · Piece-rate & Contractors · BOM & Consumption · Quality Control · Maintenance |  |
| 09 | Purchase — Procurement · Vendor Management |  |
| 10 | HR & Payroll — Staff & Contractors · Time-off & Advances · Appraisal & Hiring |  |
| 11 | Accounting & GST — Accounting · Invoicing · Expenses · GST & Tax · Finance Reports |  |
| 12 | Settlement — Payout Cycles · Fee & Commission Audit · TCS & TDS Register |  |
| 13 | Marketing — Social Calendar · Campaigns · Repricing Engine · Automation · Blog & Pages |  |
| 14 | AI Content Engine — Content Engine · Image Studio · Video Studio · Design Studio · Publisher |  |
| 15 | Projects & Collaboration — Projects & Cases · Timesheets & Planning · Approvals · Forum · Discuss |  |

Every module follows exactly this shape: one ZIP, one ZIP per edition inside it, a folder
per app, a working HTML file, a complete manual, and an illustrated PDF built from real
screenshots of the shipped file.

---

**Medhava · One business. One brain.**
Module 02 · CRM · Vastrangam · FY 2026-27
