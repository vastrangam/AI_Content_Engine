# READ ME FIRST — Medhava · Module 05 · Sales

इस ZIP में **दो अलग-अलग versions** हैं. दोनों में **वही 5 apps** हैं, वही engine,
वही self-tests — फ़र्क़ सिर्फ़ data और नामों का है.

---

## दो अलग ZIP — दोनों अलग-अलग भेजी गई हैं

| ZIP का नाम | ये किसके लिए है |
|---|---|
| **`MEDHAVA_Module_05_Sales.zip`** | **Unified ERP** — किसी भी industry के लिए. Company "Acme Corp", neutral names. यही version किसी भी नए customer को दिया जाएगा. |
| **`VASTRANGAM_Module_05_Sales.zip`** | **Vastrangam का अपना ERP** — Myntra, Flipkart, Surat–Jaipur mills, boutiques, karigar, BUSY. इससे हम test करते हैं कि neutral engine असली business में चलता है या नहीं. |

**दोनों खोल सकते हैं, साथ-साथ.** दोनों अपना data अलग रखते हैं — एक दूसरे से टकराते नहीं.

कोई "बाहर वाली" ZIP नहीं है. ये दोनों सीधे आपको मिली हैं — जो चाहिए उसे extract कीजिए, बस.

---

## हर file का नाम खुद बता देगा कि वो क्या है

**हर एक file के नाम में version, module और app तीनों लिखे हैं:**

```
MEDHAVA_M05_App01_D2C_Sales.html
│       │   │     └── कौन सा app
│       │   └────────── App नंबर
│       └────────────── Module 05
└────────────────────── कौन सा version
```

तो extract करने के बाद भी कभी confusion नहीं होगा.

---

## पूरा structure

```
READ_ME_FIRST_Module_05_Sales.md          ← आप यही पढ़ रहे हैं

MEDHAVA_Module_05_Sales.zip
└── MEDHAVA_Module_05_Sales/
    ├── MEDHAVA_M05_START_HERE.md
    ├── MEDHAVA_M05_Module_Overview.pdf
    │
    ├── App_01_D2C_Sales/
    │    ├── MEDHAVA_M05_App01_D2C_Sales.html          ← DOUBLE-CLICK
    │    ├── MEDHAVA_M05_App01_D2C_Sales_MANUAL.md
    │    └── MEDHAVA_M05_App01_D2C_Sales_WIRING.pdf
    │
    ├── App_02_B2B_Credit/
    │    ├── MEDHAVA_M05_App02_B2B_Credit.html          ← DOUBLE-CLICK
    │    ├── MEDHAVA_M05_App02_B2B_Credit_MANUAL.md
    │    └── MEDHAVA_M05_App02_B2B_Credit_WIRING.pdf
    │
    ├── App_03_Export/
    │    ├── MEDHAVA_M05_App03_Export.html          ← DOUBLE-CLICK
    │    ├── MEDHAVA_M05_App03_Export_MANUAL.md
    │    └── MEDHAVA_M05_App03_Export_WIRING.pdf
    │
    ├── App_04_POS/
    │    ├── MEDHAVA_M05_App04_POS.html          ← DOUBLE-CLICK
    │    ├── MEDHAVA_M05_App04_POS_MANUAL.md
    │    └── MEDHAVA_M05_App04_POS_WIRING.pdf
    │
    └── App_05_Quotes_Proforma/
         ├── MEDHAVA_M05_App05_Quotes_Proforma.html          ← DOUBLE-CLICK
         ├── MEDHAVA_M05_App05_Quotes_Proforma_MANUAL.md
         └── MEDHAVA_M05_App05_Quotes_Proforma_WIRING.pdf

VASTRANGAM_Module_05_Sales.zip
└── VASTRANGAM_Module_05_Sales/
    ├── VASTRANGAM_M05_START_HERE.md
    ├── VASTRANGAM_M05_Module_Overview.pdf
    │
    ├── App_01_D2C_Sales/
    │    ├── VASTRANGAM_M05_App01_D2C_Sales.html          ← DOUBLE-CLICK
    │    ├── VASTRANGAM_M05_App01_D2C_Sales_MANUAL.md
    │    └── VASTRANGAM_M05_App01_D2C_Sales_WIRING.pdf
    │
    ├── App_02_B2B_Credit/
    │    ├── VASTRANGAM_M05_App02_B2B_Credit.html          ← DOUBLE-CLICK
    │    ├── VASTRANGAM_M05_App02_B2B_Credit_MANUAL.md
    │    └── VASTRANGAM_M05_App02_B2B_Credit_WIRING.pdf
    │
    ├── App_03_Export/
    │    ├── VASTRANGAM_M05_App03_Export.html          ← DOUBLE-CLICK
    │    ├── VASTRANGAM_M05_App03_Export_MANUAL.md
    │    └── VASTRANGAM_M05_App03_Export_WIRING.pdf
    │
    ├── App_04_POS/
    │    ├── VASTRANGAM_M05_App04_POS.html          ← DOUBLE-CLICK
    │    ├── VASTRANGAM_M05_App04_POS_MANUAL.md
    │    └── VASTRANGAM_M05_App04_POS_WIRING.pdf
    │
    └── App_05_Quotes_Proforma/
         ├── VASTRANGAM_M05_App05_Quotes_Proforma.html          ← DOUBLE-CLICK
         ├── VASTRANGAM_M05_App05_Quotes_Proforma_MANUAL.md
         └── VASTRANGAM_M05_App05_Quotes_Proforma_WIRING.pdf
```

---

## खोलने का तरीका (60 seconds)

1. **जो version चाहिए उस ZIP को extract करें** — `MEDHAVA_…` या `VASTRANGAM_…`.
   Windows: right-click → *Extract All* · Mac: double-click.
2. **App folder खोलें** — उस app की सारी चीज़ें उसी folder में हैं.
3. **`.html` file पर double-click करें.** बस, install हो गया.

> ⚠️ **एक ही गलती से बचना है:** ZIP के *अंदर* से सीधे `.html` मत खोलिए.
> Windows उसे एक temporary folder में खोलता है जो बाद में मिट जाता है — और आपका
> data गायब लगने लगता है. **पहले extract कीजिए, फिर खोलिए.**

**Phone पर:** `.html` file phone में डालिए → Chrome (Android) या Safari (iPhone) से
खोलिए → फिर **Add to Home screen**. उसका अपना icon बन जाएगा और बिल्कुल किसी भी
दूसरे app की तरह चलेगा — internet बंद हो तब भी.

Windows, Mac, Android और iPhone — चारों के पूरे step-by-step steps हर app की
`_MANUAL.md` file में हैं.

---

## इस module में क्या है

**App 01 · D2C Sales** — 8 screens, 35 self-tests
अपनी website के orders एक pipeline में — **New → Confirmed → Packed → Shipped → Delivered**. चार नियम, और हर एक असली पैसा बचाता है.

**App 02 · B2B & Credit** — 8 screens, 35 self-tests
Wholesale की दो बातें जो तय करती हैं कि पैसा बनेगा या चुपचाप जाएगा: **rate tier तय करता है, मोल-भाव नहीं** — और **credit check एक gate है, warning नहीं.**

**App 03 · Export** — 8 screens, 34 self-tests
Export बेचने की समस्या नहीं, **कागज़ की समस्या** है. पाँच कागज़ हर shipment के साथ जाते हैं — और एक भी छूटा तो container port पर demurrage खाता है.

**App 04 · POS** — 8 screens, 33 self-tests
एक till जो **बाक़ी business से झूठ नहीं बोल सकती.** Price catalogue से आता है, counter से नहीं — इसलिए दुकान website को चुपचाप undercut नहीं कर सकती.

**App 05 · Quotes & Proforma** — 7 screens, 34 self-tests
Quote भेजिए, मोल-भाव के साथ revise कीजिए, और accepted को **एक-एक click में proforma और confirmed order** बना दीजिए — कुछ भी दोबारा type किए बिना.

---

## कोई भी app किसी एक company पर निर्भर नहीं है

यह rule सिर्फ़ लिखा हुआ वादा नहीं है — **हर app इसे खुद check करता है, हर बार खुलने पर.**

किसी एक accounting software पर नहीं. किसी एक marketplace पर नहीं. किसी एक AI company पर
नहीं. किसी एक automation tool पर नहीं. किसी एक courier पर नहीं.

**App में देखिए:** बाएँ menu में **Connectors** screen खोलिए. वहाँ लिखा मिलेगा
"Outside services required: **0**" — और यह एक self-test है, tagline नहीं.

| Capability | कुछ options (जिनमें वो भी हैं जिनके लिए किसी की ज़रूरत नहीं) |
|---|---|
| **Books & ledger** | Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (अपने server पर) · CSV आपके CA को |
| **Sales channels** | हाथ से डालिए · CSV import · Amazon · Flipkart · Myntra · Meesho · Ajio · Nykaa · JioMart · Shopify · WooCommerce · अपनी website |
| **AI writing** | Medhava templates (AI ही नहीं) · Ollama अपने computer पर · self-hosted Llama/Mistral · Claude · GPT · Gemini · DeepSeek · Groq · या खुद लिखिए |
| **AI images** | अपनी photo · Stable Diffusion/Flux अपने computer पर · Midjourney · OpenAI · Imagen · Firefly · Canva · Medhava Image Studio |
| **Automation** | Medhava Rules (built in) · n8n · Node-RED · Windmill · Airflow (अपने server पर) · n8n Cloud · Make · Zapier · Pipedream · cron · या हाथ से |
| **Couriers** | AWB हाथ से · अपनी delivery · Delhivery · Blue Dart · DTDC · Ecom · XpressBees · India Post · Shiprocket · NimbusPost |
| **Payments** | Cash · UPI direct अपने QR से (कोई commission नहीं) · Razorpay · PayU · Cashfree · PhonePe · Paytm · Stripe |

**तीन rules जो हर app अपने ऊपर लागू करता है:**

1. किसी भी capability में **एक ही option नहीं** — कम से कम तीन, अक्सर आठ से बारह.
2. हर capability में एक **built-in या हाथ से** करने वाला option है — यानी app **कुछ भी
   connect किए बिना पूरा चलता है.** कोई account नहीं, कोई internet नहीं, कोई subscription
   नहीं. Default भी वही है.
3. हर capability में एक option ऐसा है जो **आप अपने computer/server पर चला सकते हैं** — यानी
   आपका data किसी और के cloud में भेजना कभी मजबूरी नहीं है.

> **Provider बदलने से कोई figure नहीं बदलता.** हिसाब Medhava में रहता है, service में नहीं.
> इसका भी एक self-test है: *"switching a provider changes nothing else in your data"*.

> **Cloud service के लिए scoped, revocable key लगती है — कभी आपका password नहीं.**
> **Medhava कभी आपसे marketplace, bank या account का password नहीं माँगेगा.** अगर कोई screen
> माँगे, तो वो Medhava नहीं है.

---

## खुद check कीजिए (भरोसे पर मत जाइए)

**हिसाब सही है?** कोई भी app खोलिए → बाएँ menu में **Backup & Health** →
**Self-tests** panel देखिए. Tests app खुलते ही आपकी device पर चले थे, आपके data पर.

**पाँच gates सच में रोकते हैं?** हर app में एक चीज़ है जो app करने से **मना** करता है:

- **D2C** — कम advance वाले COD order पर "Mark packed" दबाइए. Stage नहीं बदलेगा.
- **B2B** — किसी buyer की limit से बड़ा order उठाइए. सीधा "on hold" जाएगा.
- **Export** — जिस shipment का एक कागज़ बाकी है उसे "Mark shipped" कीजिए. मना कर देगा और नाम बताएगा.
- **POS** — पूरा पैसा डाले बिना "Print the bill" दबाइए. कुछ नहीं छपेगा.
- **Quotes** — expired quote को आगे बढ़ाइए. नहीं बढ़ेगा; re-quote कहेगा.

**एक stock number है या हर channel का अलग?** POS में आख़िरी piece बेच दीजिए — उसका button grey हो जाएगा. वही record website भी पढ़ती है.

**सच में offline चलता है?** WiFi बंद करके page reload कर दीजिए.

---

## Verification report

| Build | Screens | Controls clicked | Self-tests | Console errors |
|---|---|---|---|---|
| D2C Sales · Medhava | 6 / 6 | 77 | **35 / 35** | **0** |
| D2C Sales · Vastrangam | 6 / 6 | 77 | **35 / 35** | **0** |
| B2B & Credit · Medhava | 6 / 6 | 75 | **35 / 35** | **0** |
| B2B & Credit · Vastrangam | 6 / 6 | 75 | **35 / 35** | **0** |
| Export · Medhava | 6 / 6 | 97 | **34 / 34** | **0** |
| Export · Vastrangam | 6 / 6 | 97 | **34 / 34** | **0** |
| POS · Medhava | 6 / 6 | 50 | **33 / 33** | **0** |
| POS · Vastrangam | 6 / 6 | 50 | **33 / 33** | **0** |
| Quotes & Proforma · Medhava | 5 / 5 | 63 | **34 / 34** | **0** |
| Quotes & Proforma · Vastrangam | 5 / 5 | 63 | **34 / 34** | **0** |

हर screen असली browser में खोली गई और **उस पर का हर button दबाया गया**. कोई console
error, script error, या ऐसी screen जो दोबारा न बने — build fail हो जाती.

हर PDF का हर screenshot उसी shipped file से, double resolution पर लिया गया है.

---

**Medhava · One business. One brain.**
Module 05 of 21 · Sales · FY 2026-27
