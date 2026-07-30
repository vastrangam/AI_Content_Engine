# READ ME FIRST — Medhava · Module 02 · CRM

इस ZIP में **दो अलग-अलग versions** हैं. दोनों में **वही app** हैं, वही engine,
वही self-tests — फ़र्क़ सिर्फ़ data और नामों का है.

---

## दो ZIP — कौन सा खोलें?

| ZIP का नाम | ये किसके लिए है |
|---|---|
| **`MEDHAVA_Module_02_CRM.zip`** | **Unified ERP** — किसी भी industry के लिए. Company "Acme Corp", neutral names. यही version किसी भी नए customer को दिया जाएगा. |
| **`VASTRANGAM_Module_02_CRM.zip`** | **Vastrangam का अपना ERP** — Myntra, Flipkart, Surat–Jaipur mills, boutiques, karigar, BUSY. इससे हम test करते हैं कि neutral engine असली business में चलता है या नहीं. |

**दोनों खोल सकते हैं, साथ-साथ.** दोनों अपना data अलग रखते हैं — एक दूसरे से टकराते नहीं.

---

## हर file का नाम खुद बता देगा कि वो क्या है

**हर एक file के नाम में version, module और app तीनों लिखे हैं:**

```
MEDHAVA_M02_App01_CRM_Customer_360.html
│       │   │     └── कौन सा app
│       │   └────────── App नंबर
│       └────────────── Module 02
└────────────────────── कौन सा version
```

तो extract करने के बाद भी कभी confusion नहीं होगा.

---

## पूरा structure

```
Module_02_CRM__Medhava_and_Vastrangam.zip
│
├── READ_ME_FIRST.md          ← आप यही पढ़ रहे हैं
│
├── MEDHAVA_Module_02_CRM.zip
│   └── MEDHAVA_Module_02_CRM/
│       ├── MEDHAVA_M02_START_HERE.md
│       ├── MEDHAVA_M02_Module_Overview.pdf
│       │
│       └── App_01_CRM_Customer_360/
│            ├── MEDHAVA_M02_App01_CRM_Customer_360.html          ← DOUBLE-CLICK
│            ├── MEDHAVA_M02_App01_CRM_Customer_360_MANUAL.md
│            └── MEDHAVA_M02_App01_CRM_Customer_360_WIRING.pdf
│
└── VASTRANGAM_Module_02_CRM.zip
    └── VASTRANGAM_Module_02_CRM/
        ├── VASTRANGAM_M02_START_HERE.md
        ├── VASTRANGAM_M02_Module_Overview.pdf
        │
        └── App_01_CRM_Customer_360/
             ├── VASTRANGAM_M02_App01_CRM_Customer_360.html          ← DOUBLE-CLICK
             ├── VASTRANGAM_M02_App01_CRM_Customer_360_MANUAL.md
             └── VASTRANGAM_M02_App01_CRM_Customer_360_WIRING.pdf
```

---

## खोलने का तरीका (60 seconds)

1. **इस बाहर वाली ZIP को extract करें.**
   Windows: right-click → *Extract All* · Mac: double-click.
2. **जो version चाहिए उसकी ZIP को भी extract करें** — `MEDHAVA_…` या `VASTRANGAM_…`.
3. **App folder खोलें** — उस app की सारी चीज़ें उसी folder में हैं.
4. **`.html` file पर double-click करें.** बस, install हो गया.

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

**App 01 · CRM & Customer 360** — 8 screens, 38 self-tests
दो काम एक ही record में — जो आम software दो अलग products में करता है. खरीदने से पहले वो एक **lead** है, pipeline में, हर stage पर असली probability के साथ. खरीदने के बाद वही record पूरा **lifetime** बन जाता है — हर order, हर return, असली worth (returns हटाने के बाद), और आगे क्या offer करें.

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

**Segments खुद बनते हैं?** Customers screen पर "At risk" button दबाइए — जो customers 90
दिन से चुप हैं वही दिखेंगे. किसी ने उन्हें tag नहीं किया; rule ने किया.

**Won दबाने से customer बनता है?** Pipeline पर कोई भी deal "Won" कर दीजिए, फिर Customers
screen खोलिए — वो वहाँ है, segment "New" के साथ.

**सच में offline चलता है?** WiFi बंद करके page reload कर दीजिए.

---

## Verification report

| Build | Screens | Controls clicked | Self-tests | Console errors |
|---|---|---|---|---|
| CRM & Customer 360 · Medhava | 7 / 7 | 83 | **38 / 38** | **0** |
| CRM & Customer 360 · Vastrangam | 7 / 7 | 83 | **38 / 38** | **0** |

हर screen असली browser में खोली गई और **उस पर का हर button दबाया गया**. कोई console
error, script error, या ऐसी screen जो दोबारा न बने — build fail हो जाती.

हर PDF का हर screenshot उसी shipped file से, double resolution पर लिया गया है.

---

**Medhava · One business. One brain.**
Module 02 of 16 · CRM · FY 2026-27
