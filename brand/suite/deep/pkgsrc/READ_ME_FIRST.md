# READ ME FIRST — Medhava · Module 01 · Dashboard & BI

इस ZIP में **दो अलग-अलग versions** हैं. दोनों में **वही 2 apps** हैं, वही engine, वही
self-tests — फ़र्क़ सिर्फ़ data और नामों का है.

---

## दो ZIP — कौन सा खोलें?

| ZIP का नाम | ये किसके लिए है |
|---|---|
| **`MEDHAVA_Module_01_Dashboard_BI.zip`** | **Unified ERP** — किसी भी industry के लिए. Company "Acme Corp", neutral channels और items. यही वो version है जो किसी भी नए customer को दिया जाएगा. |
| **`VASTRANGAM_Module_01_Dashboard_BI.zip`** | **Vastrangam का अपना ERP** — Myntra, Flipkart, Surat–Jaipur mills, silk, zari, karigar wages, BUSY. यही वो version है जिससे हम test करते हैं कि neutral engine असली business में चलता है या नहीं. |

**दोनों खोल सकते हैं, साथ-साथ.** दोनों अपना data अलग रखते हैं — एक दूसरे से टकराते नहीं.

---

## हर file का नाम खुद बता देगा कि वो क्या है

पुरानी दिक्कत ये थी कि दोनों versions की file का नाम एक ही था. अब ऐसा नहीं है —
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
├── READ_ME_FIRST.md                          ← आप यही पढ़ रहे हैं
│
├── MEDHAVA_Module_01_Dashboard_BI.zip
│   └── MEDHAVA_Module_01_Dashboard_BI/
│       ├── MEDHAVA_M01_START_HERE.md
│       ├── MEDHAVA_M01_Module_Overview.pdf         (10 pages)
│       │
│       ├── App_01_CEO_Dashboard/
│       │   ├── MEDHAVA_M01_App01_CEO_Dashboard.html          ← DOUBLE-CLICK
│       │   ├── MEDHAVA_M01_App01_CEO_Dashboard_MANUAL.md
│       │   └── MEDHAVA_M01_App01_CEO_Dashboard_WIRING.pdf    (16 pages)
│       │
│       └── App_02_Report_Builder/
│           ├── MEDHAVA_M01_App02_Report_Builder.html         ← DOUBLE-CLICK
│           ├── MEDHAVA_M01_App02_Report_Builder_MANUAL.md
│           └── MEDHAVA_M01_App02_Report_Builder_WIRING.pdf   (16 pages)
│
└── VASTRANGAM_Module_01_Dashboard_BI.zip
    └── VASTRANGAM_Module_01_Dashboard_BI/
        ├── VASTRANGAM_M01_START_HERE.md
        ├── VASTRANGAM_M01_Module_Overview.pdf
        │
        ├── App_01_CEO_Dashboard/
        │   ├── VASTRANGAM_M01_App01_CEO_Dashboard.html       ← DOUBLE-CLICK
        │   ├── VASTRANGAM_M01_App01_CEO_Dashboard_MANUAL.md
        │   └── VASTRANGAM_M01_App01_CEO_Dashboard_WIRING.pdf
        │
        └── App_02_Report_Builder/
            ├── VASTRANGAM_M01_App02_Report_Builder.html      ← DOUBLE-CLICK
            ├── VASTRANGAM_M01_App02_Report_Builder_MANUAL.md
            └── VASTRANGAM_M01_App02_Report_Builder_WIRING.pdf
```

---

## खोलने का तरीका (60 seconds)

1. **इस बाहर वाली ZIP को extract करें.**
   Windows: right-click → *Extract All* · Mac: double-click.
2. **जो version चाहिए उसकी ZIP को भी extract करें** — `MEDHAVA_…` या `VASTRANGAM_…`.
3. **App folder खोलें** — `App_01_CEO_Dashboard` या `App_02_Report_Builder`.
   उस app की सारी चीज़ें उसी folder में हैं.
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

## दो apps क्या करते हैं

**App 01 · CEO Dashboard** — 7 screens, 14 self-tests
सुबह देखने वाली एक screen. तीन ही सवालों का जवाब देती है: *पैसा बना या नहीं, cash
safe है या नहीं, और आज मुझे क्या देखना है.* Period बदलिए (April/May/June/July/Full
year) और हर आँकड़ा दोबारा गिना जाता है.

**App 02 · Report Builder** — 5 screens, 25 self-tests
अपने data से कोई भी सवाल, तीन click में, बिना formula लिखे. 5 sources, 9 पहले से
बने reports, अपने reports save कीजिए, CSV download कीजिए.

---

## खुद check कीजिए (भरोसे पर मत जाइए)

**हिसाब सही है?** कोई भी app खोलिए → बाएँ menu में **Backup & Health** →
**Self-tests** panel देखिए. Tests app खुलते ही आपकी device पर चले थे.

**दोनों apps एक ही जवाब देते हैं?** CEO Dashboard खोलिए → period **Full year** →
**Net sales** नोट कीजिए. अब Report Builder → **Sales** → group by **Channel** →
कोई filter नहीं → **Total** line पढ़िए. दोनों आँकड़े पैसे-पैसे तक बराबर होंगे.

**सच में offline चलता है?** WiFi बंद करके page reload कर दीजिए.

---

**Medhava · One business. One brain.**
Module 01 of 16 · Dashboard & BI · FY 2026-27
