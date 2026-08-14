# START HERE — VASTRANGAM edition
## Medhava · Module 21 · Dashboard & BI

**4 apps in this edition — the module’s three, and one more that is all three at once.** (The other edition ships in its own ZIP.)

Nothing here is a mock-up. Every screen works, every button does something, and every
number is calculated live.

---

## 1 · What is in this folder

You are in the **VASTRANGAM** edition — the same app(s) carrying Vastrangam's own data, rules and examples.

```
VASTRANGAM_Module_21_Dashboard_BI/
│
├── VASTRANGAM_M21_START_HERE.md              ← you are reading this
├── VASTRANGAM_M21_Module_Overview.pdf        ← the whole module, how it wires together
│
├── App_01_CEO_Dashboard/
│    ├── VASTRANGAM_M21_App01_CEO_Dashboard.html          ← DOUBLE-CLICK THIS
│    ├── VASTRANGAM_M21_App01_CEO_Dashboard_MANUAL.md
│    └── VASTRANGAM_M21_App01_CEO_Dashboard_WIRING.pdf
│
├── App_02_Report_Builder/
│    ├── VASTRANGAM_M21_App02_Report_Builder.html          ← DOUBLE-CLICK THIS
│    ├── VASTRANGAM_M21_App02_Report_Builder_MANUAL.md
│    └── VASTRANGAM_M21_App02_Report_Builder_WIRING.pdf
│
├── App_03_Group_Consolidation/
│    ├── VASTRANGAM_M21_App03_Group_Consolidation.html          ← DOUBLE-CLICK THIS
│    ├── VASTRANGAM_M21_App03_Group_Consolidation_MANUAL.md
│    └── VASTRANGAM_M21_App03_Group_Consolidation_WIRING.pdf
│
└── App_04_All_Three_In_One/
     ├── VASTRANGAM_M21_App04_All_Three_In_One.html          ← DOUBLE-CLICK THIS
     ├── VASTRANGAM_M21_App04_All_Three_In_One_MANUAL.md
     └── VASTRANGAM_M21_App04_All_Three_In_One_WIRING.pdf
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

> **Not sure where to start?** Open **App 04 · Module 21 · All three apps in one** first.
> It is every app in this module over one set of records, and it is the only one you can type
> into — so it is the fastest way to see the whole module actually working.

> ⚠️ **The one mistake to avoid:** opening the `.html` file directly from *inside* a ZIP.
> Windows unpacks it into a temporary folder that gets wiped, so your data appears to
> vanish later. **Always extract first.**

**On a phone:** put the `.html` file on your phone, open it with Chrome (Android) or
Safari (iPhone), then use **Add to Home screen**. It gets its own icon and behaves
exactly like any other app — including with the internet switched off.

Full step-by-step instructions for Windows, Mac, Android and iPhone are in each app's
`_MANUAL.md`.

---

## 3 · The apps

### App 01 · CEO Dashboard — *9 screens, 30 self-tests*
सुबह देखने वाली एक screen. तीन ही सवालों का जवाब देती है: **पैसा बना या नहीं, cash safe है या नहीं, और आज मुझे क्या देखना है.** कोई figure हाथ से नहीं भरी जाती — सब बाकी modules के records से गिनी जाती है.

- **दो live dials** — period (April / May / June / July / पूरा साल) और **company** (एक, या सब मिलाकर). दोनों में से कुछ भी बदलिए, हर screen की हर figure दोबारा गिनी जाती है.
- **Balance period नहीं मानता, company मानता है** — "April का cash" कोई चीज़ नहीं होती, लेकिन "Ethnic Fashion का cash" bank में पड़ी असली रकम है. यही फ़र्क़ ज़्यादातर dashboard गड़बड़ करते हैं.
- **Returns पहले हटते हैं, फिर कुछ "net" कहलाता है** — इसलिए ज़्यादा returns वाला busy channel कभी अच्छा नहीं दिख सकता.
- **Alerts जो कोई type नहीं करता** — पाँच rules live figures पर चलते हैं: stock reorder point पर, 30 दिन से पैसा नहीं आया, bill due date पार, channel का return rate 12%+, और कोई company जिसका अपना tax registration नहीं है. Clear कर सकते हैं — हालत बिगड़ी तो खुद वापस आ जाता है.
- **यह app कुछ नहीं लिखता.** दो self-test इसका अपना code पढ़कर यही साबित करते हैं — भरोसे पर नहीं छोड़ा गया.

### App 02 · Report Builder — *6 screens, 40 self-tests*
अपने data से कोई भी सवाल, **तीन click में, बिना formula लिखे**. जो चीज़ इसे काम का बनाती है: save करने पर **सवाल save होता है, जवाब नहीं** — अगले महीने चलाइए तो अगले महीने का हिसाब बताएगा.

- **छह sources** — Sales · Money owed · Stock · Running costs · Production · Purchases. किसी से भी group कीजिए — channel से, महीने से, या **company से**.
- **ग्यारह पहले से बने reports** — हर एक असली सवाल का जवाब. एक click में builder में आ जाता है, already run — फिर जो बदलना है बदलिए.
- **Top-N ईमानदार है** — Top 5 माँगिए तो पाँच rows दिखेंगी, लेकिन Total **हर matching row** गिनता है, और यह लिखकर बताता है.
- **हर report पर CSV download** — Excel में खुलता है, total row के साथ.
- **Dashboard से कभी अलग जवाब नहीं दे सकता** — दोनों **एक ही engine file** से बने हैं. यह सावधानी नहीं, build की सच्चाई है.

### App 03 · Group Consolidation — *7 screens, 34 self-tests*
कई companies, **एक set of figures** — और आपस में जो bill किया है वो पहले हटाकर, क्योंकि group अपने आप को कुछ बेच नहीं सकता. तीनों rules engine में लगे हैं, manual में लिखे हुए नहीं.

- **आपस की billing वापस निकलती है** — group sales और group purchases दोनों से. **Profit कभी नहीं हिलता**, क्योंकि internal bill एक company की income और दूसरी की cost है — वो खुद ही cancel हो जाती है.
- **जिस company का अपना tax registration नहीं है वो भी पूरी company है** — हर group figure में गिनी जाती है, और return में जाने से **साफ़ मना** कर दिया जाता है. दो अलग सवाल, दोनों का सही जवाब.
- **जिस नाम से बेचते हैं वो company नहीं है** — Adini Flipkart का seller name है, order Vastrangam के नाम पर ही बनता है. उसे company बनाने की कोशिश कीजिए — app मना करेगा, और वजह बताएगा: वही sales दो बार गिनी जातीं.
- **Companies की कोई limit software में नहीं है** — limit सिर्फ़ plan की है, और limit पर मिलने वाला message यही लिखकर बताता है.
- **Group total बनता हुआ दिखता है** — line by line, elimination दोनों तरफ़ दिखाकर. जो figure आप दोबारा बना न सकें, वो figure bank या buyer के सामने रख भी नहीं सकते.

### App 04 · Module 21 · All three apps in one — *17 screens, 37 self-tests*
**ऊपर के तीनों apps, एक ही set of records पर.** एक sale डालिए और overview, हर report और group roll-up — तीनों उसी पल हिलते हैं. इसलिए नहीं कि उन्हें मिलाकर रखा गया है, बल्कि इसलिए कि नीचे **numbers का एक ही set** है. **यही वो app है जिससे testing कीजिए.**

- **Add · edit · delete — हर table** — companies, trading names, sales, purchases, running costs, production, stock, लेना-देना, opening balance, आपस की billing.
- **अपनी Excel या CSV upload कीजिए** — पूरा spreadsheet engine इसी file के अंदर लिखा है, इसलिए **internet बंद करके भी upload चलता है.** कोई library नहीं, कोई CDN नहीं, कोई account नहीं.
- **कोई row चुपचाप नहीं गिरती** — पहले सिर्फ़ दिखाया जाता है: कितनी accept, कितनी reject, और हर reject की **line number और वजह**. आपके "हाँ" कहने के बाद ही कुछ लिखा जाता है.
- **सब कुछ वापस बाहर** — Excel (हर table एक sheet), CSV, या JSON backup. जो headings importer माँगता है वही export में हैं — यानी जो निकला वो सीधा वापस डाला जा सकता है.
- **बाकी सब बिल्कुल वही है** — वही engine file, वही screens, वही self-tests. **यहाँ test कर लिया, मतलब तीनों test हो गए.**

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

**तीनों apps एक ही जवाब देते हैं?** सबसे आसान तरीक़ा — **App 04 (all three in one)** खोलिए →
**Records** → एक sale डालिए → अब **Overview**, **Build a report** और **Group figures** तीनों देखिए.
तीनों **उतनी ही रकम से** हिले होंगे. फिर उसी row को delete कर दीजिए — तीनों **बिल्कुल पहले जैसे** हो जाएँगे.

**Excel सच में offline चलता है?** WiFi बंद कीजिए → page reload कीजिए → **Upload & download** →
कोई भी .xlsx चुनिए. चलेगा, क्योंकि लाने को कुछ था ही नहीं.

**बिना registration वाली company का क्या होता है?** **Group figures** में वो पूरी गिनी जा रही है.
अब **Who may file** → उसी company पर "Build its return" दबाइए — **मना कर देगा, वजह लिखकर.**

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
| 02 | Design & Sampling — PLM & Development · Design / IP Register | Delivered |
| 03 | Inventory & Catalog — Stock · Catalog / PIM · Kit & Combo SKU · Master-Data Hygiene | Next |
| 04 | CRM — CRM & Customer 360 · Documents & eSign · Helpdesk & Live Chat · Forms & Feedback (NPS) |  |
| 05 | Sales — D2C Sales · B2B & Credit · Export · POS · Quotes & Proforma · Couriers & AWB · Subscriptions |  |
| 06 | Planning & Requirements (MRP) — Demand Forecast & Signal · Requirement Explosion (MRP run) · Open-to-Buy / Budget Ceiling |  |
| 07 | Purchase — Procurement · Vendor Management · Insurance Register |  |
| 08 | Manufacturing — Production Orders · Piece-rate & Contractors · BOM & Consumption · Maintenance |  |
| 09 | Quality & Compliance — Quality Control · Certificate & Compliance Register |  |
| 10 | Warehouse — Picking & Bins · Barcode Operations · Packing Video |  |
| 11 | Logistics — Rates & Zones · NDR & RTO Rescue · COD Remittance · Handover & Manifest · Fleet |  |
| 12 | Accounting & GST — Accounting · Invoicing · Expenses · GST & Tax · ITC Reconciliation · Receivables, Payables & PDC · Fixed Assets & Depreciation · Year-End Close & Period Lock · Finance Reports |  |
| 13 | Treasury & Financial Planning — Cash Flow Forecast · Banking & Reconciliation · Budget vs Actual |  |
| 14 | Settlement — Payout Cycles · Fee & Commission Audit · TCS & TDS Register |  |
| 15 | E-commerce / OMS — Marketplace OMS · Order Management · Manual Data Check · Reconciliation · Claims & Disputes · Returns / RMA · Channels & Storefronts · Labels & Documents · Listing & Catalog Manager · Size / Fit Recommendation AI · AR / Virtual Try-On |  |
| 16 | HR & Payroll — Staff & Contractors · Time-off & Advances · Appraisal & Hiring · Payout Execution |  |
| 17 | Marketing — Social Calendar · Campaigns · Repricing Engine · Automation · Blog & Pages · Events · Markdown / Clearance Optimization |  |
| 18 | AI Content Engine — Content Engine · Image Studio · Video Studio · Design Studio · Publisher |  |
| 19 | SEO, AEO & AIO — Technical SEO & Schema · Answer-Engine Optimization · AI-Engine Visibility Tracking |  |
| 20 | Projects & Collaboration — Projects & Cases · Timesheets & Planning · Approvals · Forum · Discuss · Knowledge Base |  |
| **21** | **Dashboard & BI — CEO Dashboard · Report Builder · Group Consolidation · Excel Dashboard Builder · ESG / Sustainability Reporting** |  |

Every module follows exactly this shape: one ZIP, one ZIP per edition inside it, a folder
per app, a working HTML file, a complete manual, and an illustrated PDF built from real
screenshots of the shipped file.

---

**Medhava · One business. One brain.**
Module 21 · Dashboard & BI · Vastrangam · FY 2026-27
