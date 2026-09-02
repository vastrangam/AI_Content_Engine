# READ ME FIRST — Medhava · Module 21 · Dashboard & BI

इस ZIP में **दो अलग-अलग versions** हैं. दोनों में **वही 4 apps** हैं, वही engine,
वही self-tests — फ़र्क़ सिर्फ़ data और नामों का है.

---

## दो अलग ZIP — दोनों अलग-अलग भेजी गई हैं

| ZIP का नाम | ये किसके लिए है |
|---|---|
| **`MEDHAVA_Module_21_Dashboard_BI.zip`** | **Unified ERP** — किसी भी industry के लिए. Company "Acme Corp", neutral names. यही version किसी भी नए customer को दिया जाएगा. |
| **`VASTRANGAM_Module_21_Dashboard_BI.zip`** | **Vastrangam का अपना ERP** — Myntra, Flipkart, Surat–Jaipur mills, boutiques, karigar, BUSY. इससे हम test करते हैं कि neutral engine असली business में चलता है या नहीं. |

**दोनों खोल सकते हैं, साथ-साथ.** दोनों अपना data अलग रखते हैं — एक दूसरे से टकराते नहीं.

कोई "बाहर वाली" ZIP नहीं है. ये दोनों सीधे आपको मिली हैं — जो चाहिए उसे extract कीजिए, बस.

---

## हर file का नाम खुद बता देगा कि वो क्या है

**हर एक file के नाम में version, module और app तीनों लिखे हैं:**

```
MEDHAVA_M21_App01_CEO_Dashboard.html
│       │   │     └── कौन सा app
│       │   └────────── App नंबर
│       └────────────── Module 21
└────────────────────── कौन सा version
```

तो extract करने के बाद भी कभी confusion नहीं होगा.

---

## पूरा structure

```
READ_ME_FIRST_Module_21_Dashboard_BI.md          ← आप यही पढ़ रहे हैं

MEDHAVA_Module_21_Dashboard_BI.zip
└── MEDHAVA_Module_21_Dashboard_BI/
    ├── MEDHAVA_M21_START_HERE.md
    ├── MEDHAVA_M21_Module_Overview.pdf
    │
    ├── App_01_CEO_Dashboard/
    │    ├── MEDHAVA_M21_App01_CEO_Dashboard.html          ← DOUBLE-CLICK
    │    ├── MEDHAVA_M21_App01_CEO_Dashboard_MANUAL.md
    │    └── MEDHAVA_M21_App01_CEO_Dashboard_WIRING.pdf
    │
    ├── App_02_Report_Builder/
    │    ├── MEDHAVA_M21_App02_Report_Builder.html          ← DOUBLE-CLICK
    │    ├── MEDHAVA_M21_App02_Report_Builder_MANUAL.md
    │    └── MEDHAVA_M21_App02_Report_Builder_WIRING.pdf
    │
    ├── App_03_Group_Consolidation/
    │    ├── MEDHAVA_M21_App03_Group_Consolidation.html          ← DOUBLE-CLICK
    │    ├── MEDHAVA_M21_App03_Group_Consolidation_MANUAL.md
    │    └── MEDHAVA_M21_App03_Group_Consolidation_WIRING.pdf
    │
    └── App_04_All_Three_In_One/
         ├── MEDHAVA_M21_App04_All_Three_In_One.html          ← DOUBLE-CLICK
         ├── MEDHAVA_M21_App04_All_Three_In_One_MANUAL.md
         └── MEDHAVA_M21_App04_All_Three_In_One_WIRING.pdf

VASTRANGAM_Module_21_Dashboard_BI.zip
└── VASTRANGAM_Module_21_Dashboard_BI/
    ├── VASTRANGAM_M21_START_HERE.md
    ├── VASTRANGAM_M21_Module_Overview.pdf
    │
    ├── App_01_CEO_Dashboard/
    │    ├── VASTRANGAM_M21_App01_CEO_Dashboard.html          ← DOUBLE-CLICK
    │    ├── VASTRANGAM_M21_App01_CEO_Dashboard_MANUAL.md
    │    └── VASTRANGAM_M21_App01_CEO_Dashboard_WIRING.pdf
    │
    ├── App_02_Report_Builder/
    │    ├── VASTRANGAM_M21_App02_Report_Builder.html          ← DOUBLE-CLICK
    │    ├── VASTRANGAM_M21_App02_Report_Builder_MANUAL.md
    │    └── VASTRANGAM_M21_App02_Report_Builder_WIRING.pdf
    │
    ├── App_03_Group_Consolidation/
    │    ├── VASTRANGAM_M21_App03_Group_Consolidation.html          ← DOUBLE-CLICK
    │    ├── VASTRANGAM_M21_App03_Group_Consolidation_MANUAL.md
    │    └── VASTRANGAM_M21_App03_Group_Consolidation_WIRING.pdf
    │
    └── App_04_All_Three_In_One/
         ├── VASTRANGAM_M21_App04_All_Three_In_One.html          ← DOUBLE-CLICK
         ├── VASTRANGAM_M21_App04_All_Three_In_One_MANUAL.md
         └── VASTRANGAM_M21_App04_All_Three_In_One_WIRING.pdf
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

**App 01 · CEO Dashboard** — 9 screens, 30 self-tests
सुबह देखने वाली एक screen. तीन ही सवालों का जवाब देती है: **पैसा बना या नहीं, cash safe है या नहीं, और आज मुझे क्या देखना है.** कोई figure हाथ से नहीं भरी जाती — सब बाकी modules के records से गिनी जाती है.

**App 02 · Report Builder** — 6 screens, 40 self-tests
अपने data से कोई भी सवाल, **तीन click में, बिना formula लिखे**. जो चीज़ इसे काम का बनाती है: save करने पर **सवाल save होता है, जवाब नहीं** — अगले महीने चलाइए तो अगले महीने का हिसाब बताएगा.

**App 03 · Group Consolidation** — 7 screens, 34 self-tests
कई companies, **एक set of figures** — और आपस में जो bill किया है वो पहले हटाकर, क्योंकि group अपने आप को कुछ बेच नहीं सकता. तीनों rules engine में लगे हैं, manual में लिखे हुए नहीं.

**App 04 · Module 21 · All three apps in one** — 17 screens, 37 self-tests
**ऊपर के तीनों apps, एक ही set of records पर.** एक sale डालिए और overview, हर report और group roll-up — तीनों उसी पल हिलते हैं. इसलिए नहीं कि उन्हें मिलाकर रखा गया है, बल्कि इसलिए कि नीचे **numbers का एक ही set** है. **यही वो app है जिससे testing कीजिए.**

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

**तीनों apps एक ही जवाब देते हैं?** सबसे आसान तरीक़ा — **App 04 (all three in one)** खोलिए →
**Records** → एक sale डालिए → अब **Overview**, **Build a report** और **Group figures** तीनों देखिए.
तीनों **उतनी ही रकम से** हिले होंगे. फिर उसी row को delete कर दीजिए — तीनों **बिल्कुल पहले जैसे** हो जाएँगे.

**Excel सच में offline चलता है?** WiFi बंद कीजिए → page reload कीजिए → **Upload & download** →
कोई भी .xlsx चुनिए. चलेगा, क्योंकि लाने को कुछ था ही नहीं.

**बिना registration वाली company का क्या होता है?** **Group figures** में वो पूरी गिनी जा रही है.
अब **Who may file** → उसी company पर "Build its return" दबाइए — **मना कर देगा, वजह लिखकर.**

**सच में offline चलता है?** WiFi बंद करके page reload कर दीजिए.

---

## Verification report

| Build | Screens | Controls clicked | Self-tests | Console errors |
|---|---|---|---|---|
| CEO Dashboard · Medhava | 8 / 8 | 89 | **30 / 30** | **0** |
| CEO Dashboard · Vastrangam | 8 / 8 | 89 | **30 / 30** | **0** |
| Report Builder · Medhava | 5 / 5 | 74 | **40 / 40** | **0** |
| Report Builder · Vastrangam | 5 / 5 | 74 | **40 / 40** | **0** |
| Group Consolidation · Medhava | 7 / 7 | 75 | **34 / 34** | **0** |
| Group Consolidation · Vastrangam | 7 / 7 | 75 | **34 / 34** | **0** |
| All three in one · Medhava | 17 / 17 | 173 | **37 / 37** | **0** |
| All three in one · Vastrangam | 17 / 17 | 173 | **37 / 37** | **0** |

हर screen असली browser में खोली गई और **उस पर का हर button दबाया गया**. कोई console
error, script error, या ऐसी screen जो दोबारा न बने — build fail हो जाती.

हर PDF का हर screenshot उसी shipped file से, double resolution पर लिया गया है.

---

**Medhava · One business. One brain.**
Module 21 of 21 · Dashboard & BI · FY 2026-27
