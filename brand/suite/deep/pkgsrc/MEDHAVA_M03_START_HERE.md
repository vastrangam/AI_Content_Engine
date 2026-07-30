# START HERE — MEDHAVA edition
## Medhava · Module 03 · Sales

**5 apps in this edition.** (The other edition ships in its own ZIP.)

Nothing here is a mock-up. Every screen works, every button does something, and every
number is calculated live.

---

## 1 · What is in this folder

You are in the **MEDHAVA** edition — the unified ERP, industry-neutral, for any business.

```
MEDHAVA_Module_03_Sales/
│
├── MEDHAVA_M03_START_HERE.md              ← you are reading this
├── MEDHAVA_M03_Module_Overview.pdf        ← the whole module, how it wires together
│
├── App_01_D2C_Sales/
│    ├── MEDHAVA_M03_App01_D2C_Sales.html          ← DOUBLE-CLICK THIS
│    ├── MEDHAVA_M03_App01_D2C_Sales_MANUAL.md
│    └── MEDHAVA_M03_App01_D2C_Sales_WIRING.pdf
│
├── App_02_B2B_Credit/
│    ├── MEDHAVA_M03_App02_B2B_Credit.html          ← DOUBLE-CLICK THIS
│    ├── MEDHAVA_M03_App02_B2B_Credit_MANUAL.md
│    └── MEDHAVA_M03_App02_B2B_Credit_WIRING.pdf
│
├── App_03_Export/
│    ├── MEDHAVA_M03_App03_Export.html          ← DOUBLE-CLICK THIS
│    ├── MEDHAVA_M03_App03_Export_MANUAL.md
│    └── MEDHAVA_M03_App03_Export_WIRING.pdf
│
├── App_04_POS/
│    ├── MEDHAVA_M03_App04_POS.html          ← DOUBLE-CLICK THIS
│    ├── MEDHAVA_M03_App04_POS_MANUAL.md
│    └── MEDHAVA_M03_App04_POS_WIRING.pdf
│
└── App_05_Quotes_Proforma/
     ├── MEDHAVA_M03_App05_Quotes_Proforma.html          ← DOUBLE-CLICK THIS
     ├── MEDHAVA_M03_App05_Quotes_Proforma_MANUAL.md
     └── MEDHAVA_M03_App05_Quotes_Proforma_WIRING.pdf
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

1. **Extract this ZIP** if you have not already.
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

### App 01 · D2C Sales — *8 screens, 35 self-tests*
अपनी website के orders एक pipeline में — **New → Confirmed → Packed → Shipped → Delivered**. चार नियम, और हर एक असली पैसा बचाता है.

- **Coupon अपनी minimum value से नीचे लागू ही नहीं होता** — table में grey दिखता है और "below minimum" लिखा आता है. चुपचाप bill नहीं घटता.
- **COD order 20% advance के बिना pack नहीं हो सकता.** Refused parcel में courier का पैसा दोनों तरफ़ जाता है और माल भी हाथ लगकर वापस आता है. जो customer कुछ दे चुका है, वो parcel लेता ही है.
- **Loyalty points delivery पर मिलते हैं, order पर नहीं** — इसलिए "points owed" असली liability है, अंदाज़ा नहीं.
- **हर abandoned cart उम्र के साथ list में है.** तीन दिन पहले छूटा cart business की सबसे सस्ती sale है, और कोई उसे chase नहीं करता.
- **Stock वही एक number है** जो marketplaces, counter और wholesale order book पढ़ते हैं. Per-channel copy नहीं, इसलिए मिलाने की ज़रूरत नहीं.

### App 02 · B2B & Credit — *8 screens, 35 self-tests*
Wholesale की दो बातें जो तय करती हैं कि पैसा बनेगा या चुपचाप जाएगा: **rate tier तय करता है, मोल-भाव नहीं** — और **credit check एक gate है, warning नहीं.**

- **Rate कभी type नहीं होता.** हर buyer एक tier पर है, tier discount तय करता है. इसलिए price list एक-एक "इस बार के लिए" में बिखर नहीं सकती.
- **Limit से बाहर का order "on hold" जाता है** — खोता नहीं, और चुपचाप approve भी नहीं होता. किसी को असली फ़ैसला लेना पड़ता है: पैसा वसूलो, या जान-बूझकर limit बढ़ाओ.
- **Ageing हर buyer की अपनी terms पर गिनी जाती है.** 45-दिन वाले को 31वें दिन late नहीं कहा जाता, और 15-दिन वाले को गलती से 30 दिन नहीं मिलते.
- **Headroom बचा हो लेकिन 90 दिन पुराना invoice हो — तो भी रोक दिया जाता है.** अकेला headroom आधा जवाब है.
- **List price, tier price और "आपने कितना छोड़ा"** हर row में साथ दिखते हैं. Discount की कीमत कभी छिपती नहीं.

### App 03 · Export — *8 screens, 34 self-tests*
Export बेचने की समस्या नहीं, **कागज़ की समस्या** है. पाँच कागज़ हर shipment के साथ जाते हैं — और एक भी छूटा तो container port पर demurrage खाता है.

- **पाँचों कागज़ पूरे न हों तो shipment "shipped" mark ही नहीं हो सकता** — app नाम लेकर बताता है कौन-सा बाकी है. यही नियम पहली shipment पर ही app की कीमत निकाल देता है.
- **GST के दो जायज़ रास्ते:** LUT bond भरिए और IGST दीजिए ही नहीं — या दीजिए और refund claim कीजिए.
- **Pay-and-claim पर वो tax आपका working capital है**, सरकार के पास पड़ा. छोटे exporters का सबसे भूला हुआ receivable यही है, क्योंकि list किसी की ज़िम्मेदारी नहीं होती. यहाँ हर unclaimed refund उम्र के साथ दिखता है.
- **एक exchange rate, एक जगह.** बदलिए और हर screen का हर रुपया साथ बदलता है — कोई screen पिछले हफ़्ते का rate नहीं बोल सकती.
- **60 दिन कानूनी deadline नहीं है** — वो वो line है जिसके अंदर सही claim आ ही जाता है. उससे पुराना कुछ भी एक phone call का हक़दार है.

### App 04 · POS — *8 screens, 33 self-tests*
एक till जो **बाक़ी business से झूठ नहीं बोल सकती.** Price catalogue से आता है, counter से नहीं — इसलिए दुकान website को चुपचाप undercut नहीं कर सकती.

- **Discount 50% पर capped है** और bill पर छपता है. जो counter बेहिसाब discount दे सकता है, वो counter leak करता है.
- **GST discount के बाद की value पर लगता है, gross पर नहीं.** जो price customer दे ही नहीं रहा उस पर tax लेना गलत भी है और महँगा भी.
- **Payment जैसे चाहे बाँटिए** — cash, UPI, card, on account. लेकिन **पूरा पैसा न हो तो bill छपेगा ही नहीं.** कम पर दबाइए, app बताता है कितना बाकी है.
- **Stock वही एक साझा number है.** Counter पर आख़िरी piece बिका तो website तीस सेकंड बाद उसे नहीं बेच सकती.
- **Close पर सिर्फ़ cash drawer में expected है.** UPI और card bank गए; on-account पैसा ही नहीं है. इसलिए फ़र्क़ उसी दिन पकड़ में आता है, महीने के audit में नहीं.

### App 05 · Quotes & Proforma — *7 screens, 34 self-tests*
Quote भेजिए, मोल-भाव के साथ revise कीजिए, और accepted को **एक-एक click में proforma और confirmed order** बना दीजिए — कुछ भी दोबारा type किए बिना.

- **Quote अपने आप expire होता है.** Expiry date + validity से गिनी जाती है — कोई field नहीं जिसे किसी को update करना पड़े. इसलिए तीन महीने पुराना rate गलती से "हमने quote तो किया था" कहकर नहीं दिया जा सकता.
- **हर revision रखा जाता है.** Customer को सिर्फ़ आख़िरी दिखता है; आपको पहला भी दिखता है. "इस quarter में discount ने कितना खाया" का जवाब इसी से मिलता है.
- **Expired quote आगे नहीं बढ़ सकता** — app कहता है re-quote कीजिए. Re-quote पुरानी lines आज की तारीख़ पर उठा लेता है और पुराने को lost mark कर देता है, ताकि record ईमानदार रहे.
- **Proforma वही lines, वही discount, वही total** लेकर आता है जो customer ने हाँ कहा था. कोई ऐसा पल नहीं जहाँ कोई दोबारा type करे और figure बदल जाए.
- **Slippage table असली फ़ायदा है.** एक quote में 10% जाना मोल-भाव है; हर quote में 10% जाना यह है कि price list 10% ज़्यादा है — और पहला offer रखे बिना यह किसी को दिखता नहीं.

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

**पाँच gates सच में रोकते हैं?** हर app में एक चीज़ है जो app करने से **मना** करता है:

- **D2C** — कम advance वाले COD order पर "Mark packed" दबाइए. Stage नहीं बदलेगा.
- **B2B** — किसी buyer की limit से बड़ा order उठाइए. सीधा "on hold" जाएगा.
- **Export** — जिस shipment का एक कागज़ बाकी है उसे "Mark shipped" कीजिए. मना कर देगा और नाम बताएगा.
- **POS** — पूरा पैसा डाले बिना "Print the bill" दबाइए. कुछ नहीं छपेगा.
- **Quotes** — expired quote को आगे बढ़ाइए. नहीं बढ़ेगा; re-quote कहेगा.

**एक stock number है या हर channel का अलग?** POS में आख़िरी piece बेच दीजिए — उसका button grey हो जाएगा. वही record website भी पढ़ती है.

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
| **03** | **Sales — D2C Sales · B2B & Credit · Export · POS · Quotes & Proforma** | **Delivered — this ZIP** |
| 04 | E-commerce / OMS — Marketplace OMS · Order Management | Next |
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
Module 03 · Sales · Acme Corp · FY 2026-27
