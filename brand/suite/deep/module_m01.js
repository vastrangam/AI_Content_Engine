'use strict';
/* Module 01 — the single description of the module. The packager builds the ZIPs from it AND
   the module PDF draws its "what is in the ZIP" page from it, so the two can never disagree.

   `apps` are the three apps the website publishes for this module.
   `unified` is the fourth build: all three of them over one set of records. It is a delivery
   artefact rather than a catalogue entry — the module still has three apps — so it is kept
   apart here and audit section 9 checks that it really covers all three. */

module.exports = {
  num: '01', slug: 'Dashboard_BI', title: 'Dashboard & BI',
  overviewPdf: 'out/Medhava_Module_01_Dashboard_BI.pdf',
  status: { '01': 'Delivered — this ZIP', '02': 'Delivered', '03': 'Next' },
  apps: [
    {
      n: '01', slug: 'CEO_Dashboard', name: 'CEO Dashboard', screens: 9, tests: 30,
      html: { MEDHAVA: 'out/dashboard_ERP.html', VASTRANGAM: 'out/dashboard_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/DASH_ERP_MANUAL.md', VASTRANGAM: 'manuals/DASH_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_M01_App1_DASH_ERP.pdf', VASTRANGAM: 'out/Medhava_M01_App1_DASH_VAS.pdf' },
      blurb: 'सुबह देखने वाली एक screen. तीन ही सवालों का जवाब देती है: **पैसा बना या नहीं, cash safe है या नहीं, और आज मुझे क्या देखना है.** कोई figure हाथ से नहीं भरी जाती — सब बाकी modules के records से गिनी जाती है.',
      bullets: [
        '**दो live dials** — period (April / May / June / July / पूरा साल) और **company** (एक, या सब मिलाकर). दोनों में से कुछ भी बदलिए, हर screen की हर figure दोबारा गिनी जाती है.',
        '**Balance period नहीं मानता, company मानता है** — "April का cash" कोई चीज़ नहीं होती, लेकिन "Ethnic Fashion का cash" bank में पड़ी असली रकम है. यही फ़र्क़ ज़्यादातर dashboard गड़बड़ करते हैं.',
        '**Returns पहले हटते हैं, फिर कुछ "net" कहलाता है** — इसलिए ज़्यादा returns वाला busy channel कभी अच्छा नहीं दिख सकता.',
        '**Alerts जो कोई type नहीं करता** — पाँच rules live figures पर चलते हैं: stock reorder point पर, 30 दिन से पैसा नहीं आया, bill due date पार, channel का return rate 12%+, और कोई company जिसका अपना tax registration नहीं है. Clear कर सकते हैं — हालत बिगड़ी तो खुद वापस आ जाता है.',
        '**यह app कुछ नहीं लिखता.** दो self-test इसका अपना code पढ़कर यही साबित करते हैं — भरोसे पर नहीं छोड़ा गया.'
      ]
    },
    {
      n: '02', slug: 'Report_Builder', name: 'Report Builder', screens: 6, tests: 40,
      html: { MEDHAVA: 'out/reports_ERP.html', VASTRANGAM: 'out/reports_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/REP_ERP_MANUAL.md', VASTRANGAM: 'manuals/REP_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_M01_App2_REP_ERP.pdf', VASTRANGAM: 'out/Medhava_M01_App2_REP_VAS.pdf' },
      blurb: 'अपने data से कोई भी सवाल, **तीन click में, बिना formula लिखे**. जो चीज़ इसे काम का बनाती है: save करने पर **सवाल save होता है, जवाब नहीं** — अगले महीने चलाइए तो अगले महीने का हिसाब बताएगा.',
      bullets: [
        '**छह sources** — Sales · Money owed · Stock · Running costs · Production · Purchases. किसी से भी group कीजिए — channel से, महीने से, या **company से**.',
        '**ग्यारह पहले से बने reports** — हर एक असली सवाल का जवाब. एक click में builder में आ जाता है, already run — फिर जो बदलना है बदलिए.',
        '**Top-N ईमानदार है** — Top 5 माँगिए तो पाँच rows दिखेंगी, लेकिन Total **हर matching row** गिनता है, और यह लिखकर बताता है.',
        '**हर report पर CSV download** — Excel में खुलता है, total row के साथ.',
        '**Dashboard से कभी अलग जवाब नहीं दे सकता** — दोनों **एक ही engine file** से बने हैं. यह सावधानी नहीं, build की सच्चाई है.'
      ]
    },
    {
      n: '03', slug: 'Group_Consolidation', name: 'Group Consolidation', screens: 7, tests: 34,
      html: { MEDHAVA: 'out/groupcons_ERP.html', VASTRANGAM: 'out/groupcons_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/GRP_ERP_MANUAL.md', VASTRANGAM: 'manuals/GRP_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_M01_App3_GRP_ERP.pdf', VASTRANGAM: 'out/Medhava_M01_App3_GRP_VAS.pdf' },
      blurb: 'कई companies, **एक set of figures** — और आपस में जो bill किया है वो पहले हटाकर, क्योंकि group अपने आप को कुछ बेच नहीं सकता. तीनों rules engine में लगे हैं, manual में लिखे हुए नहीं.',
      bullets: [
        '**आपस की billing वापस निकलती है** — group sales और group purchases दोनों से. **Profit कभी नहीं हिलता**, क्योंकि internal bill एक company की income और दूसरी की cost है — वो खुद ही cancel हो जाती है.',
        '**जिस company का अपना tax registration नहीं है वो भी पूरी company है** — हर group figure में गिनी जाती है, और return में जाने से **साफ़ मना** कर दिया जाता है. दो अलग सवाल, दोनों का सही जवाब.',
        '**जिस नाम से बेचते हैं वो company नहीं है** — Adini Flipkart का seller name है, order Vastrangam के नाम पर ही बनता है. उसे company बनाने की कोशिश कीजिए — app मना करेगा, और वजह बताएगा: वही sales दो बार गिनी जातीं.',
        '**Companies की कोई limit software में नहीं है** — limit सिर्फ़ plan की है, और limit पर मिलने वाला message यही लिखकर बताता है.',
        '**Group total बनता हुआ दिखता है** — line by line, elimination दोनों तरफ़ दिखाकर. जो figure आप दोबारा बना न सकें, वो figure bank या buyer के सामने रख भी नहीं सकते.'
      ]
    }
  ],
  unified: {
    n: '04', slug: 'All_Three_In_One', name: 'Module 01 · All three apps in one', screens: 17, tests: 37,
    html: { MEDHAVA: 'out/m01_ERP.html', VASTRANGAM: 'out/m01_Vastrangam.html' },
    manual: { MEDHAVA: 'manuals/UNI_ERP_MANUAL.md', VASTRANGAM: 'manuals/UNI_VAS_MANUAL.md' },
    pdf: { MEDHAVA: 'out/Medhava_M01_App4_UNI_ERP.pdf', VASTRANGAM: 'out/Medhava_M01_App4_UNI_VAS.pdf' },
    blurb: '**ऊपर के तीनों apps, एक ही set of records पर.** एक sale डालिए और overview, हर report और group roll-up — तीनों उसी पल हिलते हैं. इसलिए नहीं कि उन्हें मिलाकर रखा गया है, बल्कि इसलिए कि नीचे **numbers का एक ही set** है. **यही वो app है जिससे testing कीजिए.**',
    bullets: [
      '**Add · edit · delete — हर table** — companies, trading names, sales, purchases, running costs, production, stock, लेना-देना, opening balance, आपस की billing.',
      '**अपनी Excel या CSV upload कीजिए** — पूरा spreadsheet engine इसी file के अंदर लिखा है, इसलिए **internet बंद करके भी upload चलता है.** कोई library नहीं, कोई CDN नहीं, कोई account नहीं.',
      '**कोई row चुपचाप नहीं गिरती** — पहले सिर्फ़ दिखाया जाता है: कितनी accept, कितनी reject, और हर reject की **line number और वजह**. आपके "हाँ" कहने के बाद ही कुछ लिखा जाता है.',
      '**सब कुछ वापस बाहर** — Excel (हर table एक sheet), CSV, या JSON backup. जो headings importer माँगता है वही export में हैं — यानी जो निकला वो सीधा वापस डाला जा सकता है.',
      '**बाकी सब बिल्कुल वही है** — वही engine file, वही screens, वही self-tests. **यहाँ test कर लिया, मतलब तीनों test हो गए.**'
    ]
  },
  selfCheck: `**तीनों apps एक ही जवाब देते हैं?** सबसे आसान तरीक़ा — **App 04 (all three in one)** खोलिए →
**Records** → एक sale डालिए → अब **Overview**, **Build a report** और **Group figures** तीनों देखिए.
तीनों **उतनी ही रकम से** हिले होंगे. फिर उसी row को delete कर दीजिए — तीनों **बिल्कुल पहले जैसे** हो जाएँगे.

**Excel सच में offline चलता है?** WiFi बंद कीजिए → page reload कीजिए → **Upload & download** →
कोई भी .xlsx चुनिए. चलेगा, क्योंकि लाने को कुछ था ही नहीं.

**बिना registration वाली company का क्या होता है?** **Group figures** में वो पूरी गिनी जा रही है.
अब **Who may file** → उसी company पर "Build its return" दबाइए — **मना कर देगा, वजह लिखकर.**`,
  verify: [
    { name: 'CEO Dashboard · Medhava', screens: '8 / 8', clicks: 89, tests: '30 / 30', errs: 0 },
    { name: 'CEO Dashboard · Vastrangam', screens: '8 / 8', clicks: 89, tests: '30 / 30', errs: 0 },
    { name: 'Report Builder · Medhava', screens: '5 / 5', clicks: 74, tests: '40 / 40', errs: 0 },
    { name: 'Report Builder · Vastrangam', screens: '5 / 5', clicks: 74, tests: '40 / 40', errs: 0 },
    { name: 'Group Consolidation · Medhava', screens: '7 / 7', clicks: 75, tests: '34 / 34', errs: 0 },
    { name: 'Group Consolidation · Vastrangam', screens: '7 / 7', clicks: 75, tests: '34 / 34', errs: 0 },
    { name: 'All three in one · Medhava', screens: '17 / 17', clicks: 173, tests: '37 / 37', errs: 0 },
    { name: 'All three in one · Vastrangam', screens: '17 / 17', clicks: 173, tests: '37 / 37', errs: 0 },
  ],
};
