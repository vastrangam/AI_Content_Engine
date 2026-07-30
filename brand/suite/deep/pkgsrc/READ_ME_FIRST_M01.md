# READ ME FIRST — Medhava · Module 01 · Dashboard & BI

इस ZIP में **दो अलग-अलग versions** हैं. दोनों में **वही 2 apps** हैं, वही engine,
वही self-tests — फ़र्क़ सिर्फ़ data और नामों का है.

---

## दो ZIP — कौन सा खोलें?

| ZIP का नाम | ये किसके लिए है |
|---|---|
| **`MEDHAVA_Module_01_Dashboard_BI.zip`** | **Unified ERP** — किसी भी industry के लिए. Company "Acme Corp", neutral names. यही version किसी भी नए customer को दिया जाएगा. |
| **`VASTRANGAM_Module_01_Dashboard_BI.zip`** | **Vastrangam का अपना ERP** — Myntra, Flipkart, Surat–Jaipur mills, boutiques, karigar, BUSY. इससे हम test करते हैं कि neutral engine असली business में चलता है या नहीं. |

**दोनों खोल सकते हैं, साथ-साथ.** दोनों अपना data अलग रखते हैं — एक दूसरे से टकराते नहीं.

---

## हर file का नाम खुद बता देगा कि वो क्या है

**हर एक file के नाम में version, module और app तीनों लिखे हैं:**

```
MEDHAVA_M01_App01_CEO_Dashboard.html
│       │   │     └── कौन सा app
│       │   └────────── App नंबर
│       └────────────── Module 01
└────────────────────── कौन सा version
```

तो extract करने के बाद भी कभी confusion नहीं होगा.

---

## पूरा structure

```
Module_01_Dashboard_BI__Medhava_and_Vastrangam.zip
│
├── READ_ME_FIRST.md          ← आप यही पढ़ रहे हैं
│
├── MEDHAVA_Module_01_Dashboard_BI.zip
│   └── MEDHAVA_Module_01_Dashboard_BI/
│       ├── MEDHAVA_M01_START_HERE.md
│       ├── MEDHAVA_M01_Module_Overview.pdf
│       │
│       ├── App_01_CEO_Dashboard/
│       │    ├── MEDHAVA_M01_App01_CEO_Dashboard.html          ← DOUBLE-CLICK
│       │    ├── MEDHAVA_M01_App01_CEO_Dashboard_MANUAL.md
│       │    └── MEDHAVA_M01_App01_CEO_Dashboard_WIRING.pdf
│       │
│       └── App_02_Report_Builder/
│            ├── MEDHAVA_M01_App02_Report_Builder.html          ← DOUBLE-CLICK
│            ├── MEDHAVA_M01_App02_Report_Builder_MANUAL.md
│            └── MEDHAVA_M01_App02_Report_Builder_WIRING.pdf
│
└── VASTRANGAM_Module_01_Dashboard_BI.zip
    └── VASTRANGAM_Module_01_Dashboard_BI/
        ├── VASTRANGAM_M01_START_HERE.md
        ├── VASTRANGAM_M01_Module_Overview.pdf
        │
        ├── App_01_CEO_Dashboard/
        │    ├── VASTRANGAM_M01_App01_CEO_Dashboard.html          ← DOUBLE-CLICK
        │    ├── VASTRANGAM_M01_App01_CEO_Dashboard_MANUAL.md
        │    └── VASTRANGAM_M01_App01_CEO_Dashboard_WIRING.pdf
        │
        └── App_02_Report_Builder/
             ├── VASTRANGAM_M01_App02_Report_Builder.html          ← DOUBLE-CLICK
             ├── VASTRANGAM_M01_App02_Report_Builder_MANUAL.md
             └── VASTRANGAM_M01_App02_Report_Builder_WIRING.pdf
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

**App 01 · CEO Dashboard** — 8 screens, 23 self-tests
सुबह देखने वाली एक screen. तीन ही सवालों का जवाब देती है: **पैसा बना या नहीं, cash safe है या नहीं, और आज मुझे क्या देखना है.** कोई figure हाथ से नहीं भरी जाती — सब बाकी modules के records से गिनी जाती है.

**App 02 · Report Builder** — 6 screens, 34 self-tests
अपने data से कोई भी सवाल, **तीन click में, बिना formula लिखे**. जो चीज़ इसे काम का बनाती है: save करने पर **सवाल save होता है, जवाब नहीं** — अगले महीने चलाइए तो अगले महीने का हिसाब बताएगा.

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

**दोनों apps एक ही जवाब देते हैं?** CEO Dashboard खोलिए → period **Full year** →
**Net sales** नोट कीजिए. अब Report Builder → **Sales** → group by **Channel** →
कोई filter नहीं → **Total** line पढ़िए. दोनों आँकड़े **पैसे-पैसे तक बराबर** होंगे.

**Period switcher सच में live है?** Dashboard पर April दबाइए — हर card, दोनों panels और
alert list दोबारा गिने जाते हैं. लेकिन "Cash + bank" नहीं बदलेगा, और यह जानबूझकर है.

**सच में offline चलता है?** WiFi बंद करके page reload कर दीजिए.

---

## Verification report

| Build | Screens | Controls clicked | Self-tests | Console errors |
|---|---|---|---|---|
| CEO Dashboard · Medhava | 7 / 7 | 76 | **23 / 23** | **0** |
| CEO Dashboard · Vastrangam | 7 / 7 | 76 | **23 / 23** | **0** |
| Report Builder · Medhava | 5 / 5 | 62 | **34 / 34** | **0** |
| Report Builder · Vastrangam | 5 / 5 | 62 | **34 / 34** | **0** |

हर screen असली browser में खोली गई और **उस पर का हर button दबाया गया**. कोई console
error, script error, या ऐसी screen जो दोबारा न बने — build fail हो जाती.

हर PDF का हर screenshot उसी shipped file से, double resolution पर लिया गया है.

---

**Medhava · One business. One brain.**
Module 01 of 16 · Dashboard & BI · FY 2026-27
