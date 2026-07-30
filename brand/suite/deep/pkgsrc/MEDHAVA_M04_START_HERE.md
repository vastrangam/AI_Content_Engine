# START HERE — MEDHAVA edition
## Medhava · Module 04 · E-commerce / OMS

**2 apps in this edition.** (The other edition ships in its own ZIP.)

Nothing here is a mock-up. Every screen works, every button does something, and every
number is calculated live.

---

## 1 · What is in this folder

You are in the **MEDHAVA** edition — the unified ERP, industry-neutral, for any business.

```
MEDHAVA_Module_04_Ecommerce_OMS/
│
├── MEDHAVA_M04_START_HERE.md              ← you are reading this
├── MEDHAVA_M04_Module_Overview.pdf        ← the whole module, how it wires together
│
├── App_01_Marketplace_OMS/
│    ├── MEDHAVA_M04_App01_Marketplace_OMS.html          ← DOUBLE-CLICK THIS
│    ├── MEDHAVA_M04_App01_Marketplace_OMS_MANUAL.md
│    └── MEDHAVA_M04_App01_Marketplace_OMS_WIRING.pdf
│
└── App_02_Order_Management/
     ├── MEDHAVA_M04_App02_Order_Management.html          ← DOUBLE-CLICK THIS
     ├── MEDHAVA_M04_App02_Order_Management_MANUAL.md
     └── MEDHAVA_M04_App02_Order_Management_WIRING.pdf
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

### App 01 · Marketplace OMS — *11 screens, 51 self-tests*
सात seller panel, **एक queue**. हर marketplace का order एक जगह — अपनी-अपनी dispatch घड़ी के साथ, और commission पहले ही काटकर, ताकि दिखे कि कौन सा channel **असल में क्या देता है**.

- **Queue "कब आया" से नहीं, "कितना वक़्त बचा है" से sort होती है.** Amazon 12 घंटे देता है, Ajio 48. एक घंटे पुराना Amazon order कल के Ajio order से ज़्यादा urgent है — और सात panel अलग-अलग खोलकर यही बात हर बार उल्टी हो जाती है.
- **₹4,999 का saree ₹4,999 नहीं है.** Myntra का 30% commission और ₹79 shipping कटकर करीब **₹3,424** आता है. इस app की कोई screen gross को आपका पैसा बनाकर नहीं दिखाती — क्योंकि 30% वाला panel और 12% वाला panel gross पर comparable हैं ही नहीं.
- **Stock एक ही number है, हर panel के लिए एक अलग नहीं.** आख़िरी piece Amazon पर बिका तो उसी पल Flipkart से हट जाता है — तीन घंटे बाद cancellation बनकर नहीं. और account rating cancellation से ही गिरती है.
- **Price parity सातों panel पर check होती है.** Marketplaces एक-दूसरे का price पढ़ते हैं. Event का discount जहाँ रह गया, वहाँ का सस्ता listing बाक़ी listings को दबा देता है — उसी channel पर जिसे दिखने के लिए आप 28% दे रहे हैं.
- **Return उसी panel के खाते में जाता है जहाँ से आया.** 25% commission वाला channel जिसमें 15% माल वापस आता है, 25% का खर्च नहीं है — 40% के करीब है. **Marketplace P&L** screen payout से sort होती है, gross से नहीं, और यही ranking लोगों को चौंकाती है.

### App 02 · Order Management — *13 screens, 55 self-tests*
हर channel के order एक ही book में — website, marketplaces, counter, wholesale, WhatsApp. और **delivery date कोई type नहीं करता**: वो cut-off + उस warehouse से उस zone का transit है.

- **कौन से warehouse से जाएगा, यह app तय करता है** — सबसे तेज़ वो warehouse जिसके पास सच में माल है. इसलिए picker कभी खाली rack पर नहीं भेजा जाता.
- **Date derive होती है, लिखी नहीं जाती.** 2 बजे का cut-off + उस warehouse से उस zone के transit days. इसलिए कोई Guwahati को मंगलवार का वादा नहीं कर सकता जहाँ courier शुक्रवार को पहुँचता है.
- **Stock पास वाले warehouse में हिलाइए और customer की date अपने आप बदल जाती है.** कोई field edit नहीं होती. जो date किसी field में रखी होती है वो एक महीने में गलत हो चुकी होती है — यह वाली नहीं हो सकती.
- **जिस order को कोई warehouse serve नहीं कर सकता, उसे कोई date दी ही नहीं जाती.** उसे production या purchase order चाहिए, वादा नहीं — और झूठी date देकर कुछ नहीं मिलता.
- **Return पर क्रम कभी नहीं टूटता: parcel वापस → किसी ने देखा → तब पैसा.** Resaleable piece उसी warehouse में वापस जाता है जहाँ से गया था; ख़राब piece **stock में वापस नहीं जोड़ा जाता** — वरना वो phantom stock बन जाता है जो किसी और को promise होकर, allocate होकर, pick के वक़्त गायब मिलेगा.

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

**दोनों app में gates सच में रोकते हैं?**

- **Marketplace OMS** — Dispatch queue खोलिए. सबसे ऊपर वाला order **सबसे कम वक़्त बचा** वाला होगा, सबसे पुराना नहीं. किसी order को cancel कीजिए — Listing health में उसका stock वापस बढ़ा हुआ मिलेगा.
- **Marketplace OMS** — Listing health में "Level the price" दबाइए. सातों panel catalog के list price पर आ जाएँगे और spread 0% हो जाएगा.
- **Order Management** — जिस item का stock कहीं नहीं है, उस order पर **Allocate** दबाइए. कुछ नहीं होगा, और उसकी date की जगह "no date possible" लिखा रहेगा.
- **Order Management** — Allocation desk में एक piece W2 से W3 भेजिए, फिर Order book देखिए. **उस order की promised date अपने आप बदल चुकी होगी.**
- **Order Management** — जो parcel अभी वापस नहीं आया, उस पर **Pay the refund** दबाइए. कुछ नहीं जाएगा. "Parcel is back" कीजिए, फिर भी नहीं जाएगा — जब तक कोई उसे देख न ले.

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
| 01 | Dashboard & BI — CEO Dashboard · Report Builder | Delivered |
| 02 | CRM — CRM & Customer 360 | Delivered |
| 03 | Sales — D2C Sales · B2B & Credit · Export · POS · Quotes & Proforma | Delivered |
| **04** | **E-commerce / OMS — Marketplace OMS · Order Management** | **Delivered — this ZIP** |
| 05 | Warehouse — Picking & Bins · Barcode Operations | Next |
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
Module 04 · E-commerce / OMS · Acme Corp · FY 2026-27
