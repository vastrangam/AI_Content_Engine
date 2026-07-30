'use strict';
const { pack } = require('./packparts.js');

pack({
  num: '01', slug: 'Dashboard_BI', title: 'Dashboard & BI',
  overviewPdf: 'out/Medhava_Module_01_Dashboard_BI.pdf',
  status: { '01': 'Delivered — this ZIP', '02': 'Delivered', '03': 'Next' },
  apps: [
    {
      n: '01', slug: 'CEO_Dashboard', name: 'CEO Dashboard', screens: 8, tests: 23,
      html: { MEDHAVA: 'out/dashboard_ERP.html', VASTRANGAM: 'out/dashboard_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/DASH_ERP_MANUAL.md', VASTRANGAM: 'manuals/DASH_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_CEO_Dashboard_ERP.pdf', VASTRANGAM: 'out/Medhava_CEO_Dashboard_Vastrangam.pdf' },
      blurb: 'सुबह देखने वाली एक screen. तीन ही सवालों का जवाब देती है: **पैसा बना या नहीं, cash safe है या नहीं, और आज मुझे क्या देखना है.** कोई figure हाथ से नहीं भरी जाती — सब बाकी modules के records से गिनी जाती है.',
      bullets: [
        '**Live period switcher** — April / May / June / July / Full year. हर screen का हर figure दोबारा गिना जाता है. Balances (cash, to collect) जानबूझकर नहीं बदलते — balance एक position है, period नहीं.',
        '**Returns पहले हटते हैं, फिर कुछ "net" कहलाता है** — इसलिए ज़्यादा returns वाला busy channel कभी अच्छा नहीं दिख सकता.',
        '**Alerts जो कोई type नहीं करता** — चार rules live figures पर चलते हैं: stock reorder point पर, 30 दिन से पैसा नहीं आया, bill due date पार, channel का return rate 12%+. Clear कर सकते हैं — हालत बिगड़ी तो खुद वापस आ जाता है.',
        '**Profit line by line** — net sales − purchases − wages − running costs. दिखता है margin कहाँ खा रहा है.',
        '**Wiring screen** — हर एक figure का source और हिसाब नाम से लिखा है.',
        '**यह app कुछ नहीं लिखता.** सिर्फ़ पढ़ता है. जो dashboard आपकी books बदल सकता है, उस पर भरोसा नहीं किया जा सकता.'
      ]
    },
    {
      n: '02', slug: 'Report_Builder', name: 'Report Builder', screens: 6, tests: 34,
      html: { MEDHAVA: 'out/reports_ERP.html', VASTRANGAM: 'out/reports_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/REP_ERP_MANUAL.md', VASTRANGAM: 'manuals/REP_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_Report_Builder_ERP.pdf', VASTRANGAM: 'out/Medhava_Report_Builder_Vastrangam.pdf' },
      blurb: 'अपने data से कोई भी सवाल, **तीन click में, बिना formula लिखे**. जो चीज़ इसे काम का बनाती है: save करने पर **सवाल save होता है, जवाब नहीं** — अगले महीने चलाइए तो अगले महीने का हिसाब बताएगा.',
      bullets: [
        '**पाँच sources** — Sales · Money owed · Stock · Running costs · Production. किसी से भी group कीजिए, किसी column से sort, words या numbers पर filter.',
        '**नौ पहले से बने reports** — हर एक असली सवाल का जवाब. एक click में builder में आ जाता है, already run — फिर जो बदलना है बदलिए.',
        '**Top-N ईमानदार है** — Top 5 माँगिए तो पाँच rows दिखेंगी, लेकिन Total **हर matching row** गिनता है, और यह लिखकर बताता है. एक self-test इसी बात की जाँच करता है.',
        '**हर report पर CSV download** — Excel में खुलता है, total row के साथ.',
        '**Record count badge** — "20 of 20 records". Filter लगाइए और यह number देखिए; तुरंत पता चल जाता है filter ने वही किया जो आप चाहते थे या नहीं.'
      ]
    }
  ],
  selfCheck: `**दोनों apps एक ही जवाब देते हैं?** CEO Dashboard खोलिए → period **Full year** →
**Net sales** नोट कीजिए. अब Report Builder → **Sales** → group by **Channel** →
कोई filter नहीं → **Total** line पढ़िए. दोनों आँकड़े **पैसे-पैसे तक बराबर** होंगे.

**Period switcher सच में live है?** Dashboard पर April दबाइए — हर card, दोनों panels और
alert list दोबारा गिने जाते हैं. लेकिन "Cash + bank" नहीं बदलेगा, और यह जानबूझकर है.`,
  verify: [
    { name: 'CEO Dashboard · Medhava', screens: '7 / 7', clicks: 76, tests: '23 / 23', errs: 0 },
    { name: 'CEO Dashboard · Vastrangam', screens: '7 / 7', clicks: 76, tests: '23 / 23', errs: 0 },
    { name: 'Report Builder · Medhava', screens: '5 / 5', clicks: 62, tests: '34 / 34', errs: 0 },
    { name: 'Report Builder · Vastrangam', screens: '5 / 5', clicks: 62, tests: '34 / 34', errs: 0 },
  ],
});
