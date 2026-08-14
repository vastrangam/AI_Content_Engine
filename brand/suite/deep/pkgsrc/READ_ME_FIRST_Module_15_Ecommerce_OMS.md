# READ ME FIRST — Medhava · Module 15 · E-commerce / OMS

इस ZIP में **दो अलग-अलग versions** हैं. दोनों में **वही 2 apps** हैं, वही engine,
वही self-tests — फ़र्क़ सिर्फ़ data और नामों का है.

---

## दो अलग ZIP — दोनों अलग-अलग भेजी गई हैं

| ZIP का नाम | ये किसके लिए है |
|---|---|
| **`MEDHAVA_Module_15_Ecommerce_OMS.zip`** | **Unified ERP** — किसी भी industry के लिए. Company "Acme Corp", neutral names. यही version किसी भी नए customer को दिया जाएगा. |
| **`VASTRANGAM_Module_15_Ecommerce_OMS.zip`** | **Vastrangam का अपना ERP** — Myntra, Flipkart, Surat–Jaipur mills, boutiques, karigar, BUSY. इससे हम test करते हैं कि neutral engine असली business में चलता है या नहीं. |

**दोनों खोल सकते हैं, साथ-साथ.** दोनों अपना data अलग रखते हैं — एक दूसरे से टकराते नहीं.

कोई "बाहर वाली" ZIP नहीं है. ये दोनों सीधे आपको मिली हैं — जो चाहिए उसे extract कीजिए, बस.

---

## हर file का नाम खुद बता देगा कि वो क्या है

**हर एक file के नाम में version, module और app तीनों लिखे हैं:**

```
MEDHAVA_M15_App01_Marketplace_OMS.html
│       │   │     └── कौन सा app
│       │   └────────── App नंबर
│       └────────────── Module 15
└────────────────────── कौन सा version
```

तो extract करने के बाद भी कभी confusion नहीं होगा.

---

## पूरा structure

```
READ_ME_FIRST_Module_15_Ecommerce_OMS.md          ← आप यही पढ़ रहे हैं

MEDHAVA_Module_15_Ecommerce_OMS.zip
└── MEDHAVA_Module_15_Ecommerce_OMS/
    ├── MEDHAVA_M15_START_HERE.md
    ├── MEDHAVA_M15_Module_Overview.pdf
    │
    ├── App_01_Marketplace_OMS/
    │    ├── MEDHAVA_M15_App01_Marketplace_OMS.html          ← DOUBLE-CLICK
    │    ├── MEDHAVA_M15_App01_Marketplace_OMS_MANUAL.md
    │    └── MEDHAVA_M15_App01_Marketplace_OMS_WIRING.pdf
    │
    └── App_02_Order_Management/
         ├── MEDHAVA_M15_App02_Order_Management.html          ← DOUBLE-CLICK
         ├── MEDHAVA_M15_App02_Order_Management_MANUAL.md
         └── MEDHAVA_M15_App02_Order_Management_WIRING.pdf

VASTRANGAM_Module_15_Ecommerce_OMS.zip
└── VASTRANGAM_Module_15_Ecommerce_OMS/
    ├── VASTRANGAM_M15_START_HERE.md
    ├── VASTRANGAM_M15_Module_Overview.pdf
    │
    ├── App_01_Marketplace_OMS/
    │    ├── VASTRANGAM_M15_App01_Marketplace_OMS.html          ← DOUBLE-CLICK
    │    ├── VASTRANGAM_M15_App01_Marketplace_OMS_MANUAL.md
    │    └── VASTRANGAM_M15_App01_Marketplace_OMS_WIRING.pdf
    │
    └── App_02_Order_Management/
         ├── VASTRANGAM_M15_App02_Order_Management.html          ← DOUBLE-CLICK
         ├── VASTRANGAM_M15_App02_Order_Management_MANUAL.md
         └── VASTRANGAM_M15_App02_Order_Management_WIRING.pdf
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

**App 01 · Marketplace OMS** — 11 screens, 51 self-tests
सात seller panel, **एक queue**. हर marketplace का order एक जगह — अपनी-अपनी dispatch घड़ी के साथ, और commission पहले ही काटकर, ताकि दिखे कि कौन सा channel **असल में क्या देता है**.

**App 02 · Order Management** — 13 screens, 55 self-tests
हर channel के order एक ही book में — website, marketplaces, counter, wholesale, WhatsApp. और **delivery date कोई type नहीं करता**: वो cut-off + उस warehouse से उस zone का transit है.

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

**दोनों app में gates सच में रोकते हैं?**

- **Marketplace OMS** — Dispatch queue खोलिए. सबसे ऊपर वाला order **सबसे कम वक़्त बचा** वाला होगा, सबसे पुराना नहीं. किसी order को cancel कीजिए — Listing health में उसका stock वापस बढ़ा हुआ मिलेगा.
- **Marketplace OMS** — Listing health में "Level the price" दबाइए. सातों panel catalog के list price पर आ जाएँगे और spread 0% हो जाएगा.
- **Order Management** — जिस item का stock कहीं नहीं है, उस order पर **Allocate** दबाइए. कुछ नहीं होगा, और उसकी date की जगह "no date possible" लिखा रहेगा.
- **Order Management** — Allocation desk में एक piece W2 से W3 भेजिए, फिर Order book देखिए. **उस order की promised date अपने आप बदल चुकी होगी.**
- **Order Management** — जो parcel अभी वापस नहीं आया, उस पर **Pay the refund** दबाइए. कुछ नहीं जाएगा. "Parcel is back" कीजिए, फिर भी नहीं जाएगा — जब तक कोई उसे देख न ले.

**सच में offline चलता है?** WiFi बंद करके page reload कर दीजिए.

---

## Verification report

| Build | Screens | Controls clicked | Self-tests | Console errors |
|---|---|---|---|---|
| Marketplace OMS · Medhava | 7 / 7 | 85 | **51 / 51** | **0** |
| Marketplace OMS · Vastrangam | 7 / 7 | 85 | **51 / 51** | **0** |
| Order Management · Medhava | 7 / 7 | 105 | **55 / 55** | **0** |
| Order Management · Vastrangam | 7 / 7 | 105 | **55 / 55** | **0** |

हर screen असली browser में खोली गई और **उस पर का हर button दबाया गया**. कोई console
error, script error, या ऐसी screen जो दोबारा न बने — build fail हो जाती.

हर PDF का हर screenshot उसी shipped file से, double resolution पर लिया गया है.

---

**Medhava · One business. One brain.**
Module 15 of 21 · E-commerce / OMS · FY 2026-27
