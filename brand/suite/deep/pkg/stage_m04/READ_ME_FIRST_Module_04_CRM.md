# READ ME FIRST — Medhava · Module 04 · CRM

इस ZIP में **दो अलग-अलग versions** हैं. दोनों में **वही 4 apps** हैं, वही engine,
वही self-tests — फ़र्क़ सिर्फ़ data और नामों का है.

---

## दो अलग ZIP — दोनों अलग-अलग भेजी गई हैं

| ZIP का नाम | ये किसके लिए है |
|---|---|
| **`MEDHAVA_Module_04_CRM.zip`** | **Unified ERP** — किसी भी industry के लिए. Company "Acme Corp", neutral names. यही version किसी भी नए customer को दिया जाएगा. |
| **`VASTRANGAM_Module_04_CRM.zip`** | **Vastrangam का अपना ERP** — Myntra, Flipkart, Surat–Jaipur mills, boutiques, karigar, BUSY. इससे हम test करते हैं कि neutral engine असली business में चलता है या नहीं. |

**दोनों खोल सकते हैं, साथ-साथ.** दोनों अपना data अलग रखते हैं — एक दूसरे से टकराते नहीं.

कोई "बाहर वाली" ZIP नहीं है. ये दोनों सीधे आपको मिली हैं — जो चाहिए उसे extract कीजिए, बस.

---

## हर file का नाम खुद बता देगा कि वो क्या है

**हर एक file के नाम में version, module और app तीनों लिखे हैं:**

```
MEDHAVA_M04_App01_CRM_Customer_360.html
│       │   │     └── कौन सा app
│       │   └────────── App नंबर
│       └────────────── Module 04
└────────────────────── कौन सा version
```

तो extract करने के बाद भी कभी confusion नहीं होगा.

---

## पूरा structure

```
READ_ME_FIRST_Module_04_CRM.md          ← आप यही पढ़ रहे हैं

MEDHAVA_Module_04_CRM.zip
└── MEDHAVA_Module_04_CRM/
    ├── MEDHAVA_M04_START_HERE.md
    ├── MEDHAVA_M04_Module_Overview.pdf
    │
    ├── App_01_CRM_Customer_360/
    │    ├── MEDHAVA_M04_App01_CRM_Customer_360.html          ← DOUBLE-CLICK
    │    ├── MEDHAVA_M04_App01_CRM_Customer_360_MANUAL.md
    │    └── MEDHAVA_M04_App01_CRM_Customer_360_WIRING.pdf
    │
    ├── App_02_Documents_eSign/
    │    ├── MEDHAVA_M04_App02_Documents_eSign.html          ← DOUBLE-CLICK
    │    ├── MEDHAVA_M04_App02_Documents_eSign_MANUAL.md
    │    └── MEDHAVA_M04_App02_Documents_eSign_WIRING.pdf
    │
    ├── App_03_Helpdesk_Live_Chat/
    │    ├── MEDHAVA_M04_App03_Helpdesk_Live_Chat.html          ← DOUBLE-CLICK
    │    ├── MEDHAVA_M04_App03_Helpdesk_Live_Chat_MANUAL.md
    │    └── MEDHAVA_M04_App03_Helpdesk_Live_Chat_WIRING.pdf
    │
    └── App_04_All_Three_In_One/
         ├── MEDHAVA_M04_App04_All_Three_In_One.html          ← DOUBLE-CLICK
         ├── MEDHAVA_M04_App04_All_Three_In_One_MANUAL.md
         └── MEDHAVA_M04_App04_All_Three_In_One_WIRING.pdf

VASTRANGAM_Module_04_CRM.zip
└── VASTRANGAM_Module_04_CRM/
    ├── VASTRANGAM_M04_START_HERE.md
    ├── VASTRANGAM_M04_Module_Overview.pdf
    │
    ├── App_01_CRM_Customer_360/
    │    ├── VASTRANGAM_M04_App01_CRM_Customer_360.html          ← DOUBLE-CLICK
    │    ├── VASTRANGAM_M04_App01_CRM_Customer_360_MANUAL.md
    │    └── VASTRANGAM_M04_App01_CRM_Customer_360_WIRING.pdf
    │
    ├── App_02_Documents_eSign/
    │    ├── VASTRANGAM_M04_App02_Documents_eSign.html          ← DOUBLE-CLICK
    │    ├── VASTRANGAM_M04_App02_Documents_eSign_MANUAL.md
    │    └── VASTRANGAM_M04_App02_Documents_eSign_WIRING.pdf
    │
    ├── App_03_Helpdesk_Live_Chat/
    │    ├── VASTRANGAM_M04_App03_Helpdesk_Live_Chat.html          ← DOUBLE-CLICK
    │    ├── VASTRANGAM_M04_App03_Helpdesk_Live_Chat_MANUAL.md
    │    └── VASTRANGAM_M04_App03_Helpdesk_Live_Chat_WIRING.pdf
    │
    └── App_04_All_Three_In_One/
         ├── VASTRANGAM_M04_App04_All_Three_In_One.html          ← DOUBLE-CLICK
         ├── VASTRANGAM_M04_App04_All_Three_In_One_MANUAL.md
         └── VASTRANGAM_M04_App04_All_Three_In_One_WIRING.pdf
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

**App 01 · CRM & Customer 360** — 7 screens, 42 self-tests
दो काम एक ही record में. खरीदने से पहले वो एक **lead** है — pipeline में, हर stage पर असली probability के साथ. जीतने के बाद **वही record** customer बन जाता है, दूसरा नहीं. फिर उसी पर हर order, हर return, असली worth, और — क्योंकि इस module की रीढ़ एक ही है — उस पर file किया हर document और उसका पूछा हर सवाल.

**App 02 · Documents & eSign** — 5 screens, 41 self-tests
हर agreement, certificate, challan और scan — **उस record पर file होता है जिसका वो है**, folder में नहीं. Order पर, party पर, project या case पर, आदमी पर. फिर वो उसी record को खोलकर मिल जाता है — असल में कोई ऐसे ही ढूँढता है.

**App 03 · Helpdesk & Live Chat** — 6 screens, 38 self-tests
Chat, email या phone से आया सवाल **उसी party के record पर ticket बन जाता है**, और अक्सर उसी order पर जिसके बारे में है. जो उठाता है उसके सामने पूरी history पहले से होती है — क्या ख़रीदा, क्या वापस आया, क्या file है, पिछली बार क्या पूछा था.

**App 04 · Module 04 · All three apps in one** — 14 screens, 49 self-tests
**ऊपर के तीनों apps, एक ही set of records पर** — और तीनों के buttons एक ही screen पर. एक deal जीतिए और customer list, उसके documents और उसके tickets सब उसी पल तैयार. **यही वो app है जिससे testing कीजिए.**

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

**तीनों apps एक ही record पर हैं?** **App 04** खोलिए → **Pipeline** → कोई भी open deal
"Mark won" कीजिए → अब **Customers** देखिए. अगर वो company पहले से थी तो **गिनती नहीं बढ़ेगी** —
deal पुराने record से जुड़ गई. फिर **Customer 360** खोलिए: उसी screen पर उसके orders, उस पर file
हुए documents, और उसके पूछे सवाल — तीनों apps एक list में.

**Signature वाक़ई रोका जाता है?** **All documents** → किसी "sent" document पर *Record the code* →
box खाली छोड़कर दबाइए. **मना कर देगा, वजह लिखकर.** अब छह अंक डालिए — तभी signed होगा, और code
document पर दर्ज रहेगा.

**Reply का समय सच में गिना जाता है?** **Tickets** → *Not answered yet* → कोई ticket खोलिए →
पहले *Close this ticket* दबाइए (मना करेगा) → फिर reply लिखकर भेजिए. **First reply** का आँकड़ा
उसी पल आ जाएगा, क्योंकि वो message से निकाला गया है, कहीं लिखा नहीं गया.

**सच में offline चलता है?** WiFi बंद करके page reload कर दीजिए.

---

## Verification report

| Build | Screens | Controls clicked | Self-tests | Console errors |
|---|---|---|---|---|
| CRM & Customer 360 · Medhava | 7 / 7 | 86 | **42 / 42** | **0** |
| CRM & Customer 360 · Vastrangam | 7 / 7 | 86 | **42 / 42** | **0** |
| Documents & eSign · Medhava | 4 / 4 | 49 | **41 / 41** | **0** |
| Documents & eSign · Vastrangam | 4 / 4 | 49 | **41 / 41** | **0** |
| Helpdesk & Live Chat · Medhava | 5 / 5 | 67 | **38 / 38** | **0** |
| Helpdesk & Live Chat · Vastrangam | 5 / 5 | 67 | **38 / 38** | **0** |
| All three in one · Medhava | 14 / 14 | 132 | **49 / 49** | **0** |
| All three in one · Vastrangam | 14 / 14 | 132 | **49 / 49** | **0** |

हर screen असली browser में खोली गई और **उस पर का हर button दबाया गया**. कोई console
error, script error, या ऐसी screen जो दोबारा न बने — build fail हो जाती.

हर PDF का हर screenshot उसी shipped file से, double resolution पर लिया गया है.

---

**Medhava · One business. One brain.**
Module 04 of 21 · CRM · FY 2026-27
