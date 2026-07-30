# START HERE — MEDHAVA edition
## Medhava · Module 01 · Dashboard & BI

**2 apps in this edition.** (The other edition ships in its own ZIP.)

Nothing here is a mock-up. Every screen works, every button does something, and every
number is calculated live.

---

## 1 · What is in this folder

You are in the **MEDHAVA** edition — the unified ERP, industry-neutral, for any business.

```
MEDHAVA_Module_01_Dashboard_BI/
│
├── MEDHAVA_M01_START_HERE.md              ← you are reading this
├── MEDHAVA_M01_Module_Overview.pdf        ← the whole module, how it wires together
│
├── App_01_CEO_Dashboard/
│    ├── MEDHAVA_M01_App01_CEO_Dashboard.html          ← DOUBLE-CLICK THIS
│    ├── MEDHAVA_M01_App01_CEO_Dashboard_MANUAL.md
│    └── MEDHAVA_M01_App01_CEO_Dashboard_WIRING.pdf
│
└── App_02_Report_Builder/
     ├── MEDHAVA_M01_App02_Report_Builder.html          ← DOUBLE-CLICK THIS
     ├── MEDHAVA_M01_App02_Report_Builder_MANUAL.md
     └── MEDHAVA_M01_App02_Report_Builder_WIRING.pdf
```

Every filename starts with **MEDHAVA_** so you always know which edition you have open.
The Vastrangam edition ships in its own ZIP alongside this one, with **VASTRANGAM_** on every file.

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

## 3 · The apps

### App 01 · CEO Dashboard — *8 screens, 23 self-tests*
सुबह देखने वाली एक screen. तीन ही सवालों का जवाब देती है: **पैसा बना या नहीं, cash safe है या नहीं, और आज मुझे क्या देखना है.** कोई figure हाथ से नहीं भरी जाती — सब बाकी modules के records से गिनी जाती है.

- **Live period switcher** — April / May / June / July / Full year. हर screen का हर figure दोबारा गिना जाता है. Balances (cash, to collect) जानबूझकर नहीं बदलते — balance एक position है, period नहीं.
- **Returns पहले हटते हैं, फिर कुछ "net" कहलाता है** — इसलिए ज़्यादा returns वाला busy channel कभी अच्छा नहीं दिख सकता.
- **Alerts जो कोई type नहीं करता** — चार rules live figures पर चलते हैं: stock reorder point पर, 30 दिन से पैसा नहीं आया, bill due date पार, channel का return rate 12%+. Clear कर सकते हैं — हालत बिगड़ी तो खुद वापस आ जाता है.
- **Profit line by line** — net sales − purchases − wages − running costs. दिखता है margin कहाँ खा रहा है.
- **Wiring screen** — हर एक figure का source और हिसाब नाम से लिखा है.
- **यह app कुछ नहीं लिखता.** सिर्फ़ पढ़ता है. जो dashboard आपकी books बदल सकता है, उस पर भरोसा नहीं किया जा सकता.

### App 02 · Report Builder — *6 screens, 34 self-tests*
अपने data से कोई भी सवाल, **तीन click में, बिना formula लिखे**. जो चीज़ इसे काम का बनाती है: save करने पर **सवाल save होता है, जवाब नहीं** — अगले महीने चलाइए तो अगले महीने का हिसाब बताएगा.

- **पाँच sources** — Sales · Money owed · Stock · Running costs · Production. किसी से भी group कीजिए, किसी column से sort, words या numbers पर filter.
- **नौ पहले से बने reports** — हर एक असली सवाल का जवाब. एक click में builder में आ जाता है, already run — फिर जो बदलना है बदलिए.
- **Top-N ईमानदार है** — Top 5 माँगिए तो पाँच rows दिखेंगी, लेकिन Total **हर matching row** गिनता है, और यह लिखकर बताता है. एक self-test इसी बात की जाँच करता है.
- **हर report पर CSV download** — Excel में खुलता है, total row के साथ.
- **Record count badge** — "20 of 20 records". Filter लगाइए और यह number देखिए; तुरंत पता चल जाता है filter ने वही किया जो आप चाहते थे या नहीं.

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

**दोनों apps एक ही जवाब देते हैं?** CEO Dashboard खोलिए → period **Full year** →
**Net sales** नोट कीजिए. अब Report Builder → **Sales** → group by **Channel** →
कोई filter नहीं → **Total** line पढ़िए. दोनों आँकड़े **पैसे-पैसे तक बराबर** होंगे.

**Period switcher सच में live है?** Dashboard पर April दबाइए — हर card, दोनों panels और
alert list दोबारा गिने जाते हैं. लेकिन "Cash + bank" नहीं बदलेगा, और यह जानबूझकर है.

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
| **01** | **Dashboard & BI — CEO Dashboard · Report Builder** | **Delivered — this ZIP** |
| 02 | CRM — CRM & Customer 360 | Delivered |
| 03 | Sales — D2C Sales · B2B & Credit · Export · POS · Quotes & Proforma | Next |
| 04 | E-commerce / OMS — Marketplace OMS · Order Management |  |
| 05 | Warehouse — Picking & Bins · Barcode Operations |  |
| 06 | Logistics — Couriers & AWB |  |
| 07 | Inventory & Catalog — Stock · Catalog / PIM |  |
| 08 | Manufacturing — Production Orders · Karigar & Piece-rate · BOM & Consumption · Quality Control |  |
| 09 | Purchase — Procurement · Vendor Management |  |
| 10 | HR & Payroll — Staff & Karigar · Time-off & Advances · Appraisal & Hiring |  |
| 11 | Accounting & GST — Accounting · Invoicing · Expenses · GST & Tax · Finance Reports |  |
| 12 | Settlement — Reconciliation · Claims & Disputes · Returns / RMA |  |
| 13 | Marketing — Social Calendar · Campaigns · Repricing Engine · Automation |  |
| 14 | AI Content Engine — Content Engine |  |
| 15 | Image Studio — Image Studio |  |
| 16 | Video Studio — Video Studio |  |
| — | Platform — Identity, Settings & Audit | The spine every module runs on |

Every module follows exactly this shape: one ZIP, one ZIP per edition inside it, a folder
per app, a working HTML file, a complete manual, and an illustrated PDF built from real
screenshots of the shipped file.

---

**Medhava · One business. One brain.**
Module 01 · Dashboard & BI · Acme Corp · FY 2026-27
