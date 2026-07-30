'use strict';
/* Module 02 — the single description of the module. The packager builds the ZIPs from it
   AND the module PDF draws its "what is in the ZIP" page from it. */

module.exports = {
  num: '02', slug: 'CRM', title: 'CRM',
  overviewPdf: 'out/Medhava_Module_02_CRM.pdf',
  apps: [{
    n: '01', slug: 'CRM_Customer_360', name: 'CRM & Customer 360', screens: 8, tests: 38,
    html: { MEDHAVA: 'out/crm_ERP.html', VASTRANGAM: 'out/crm_Vastrangam.html' },
    manual: { MEDHAVA: 'manuals/CRM_ERP_MANUAL.md', VASTRANGAM: 'manuals/CRM_VAS_MANUAL.md' },
    pdf: { MEDHAVA: 'out/Medhava_CRM_Customer_360_ERP.pdf', VASTRANGAM: 'out/Medhava_CRM_Customer_360_Vastrangam.pdf' },
    blurb: 'दो काम एक ही record में — जो आम software दो अलग products में करता है. खरीदने से पहले वो एक **lead** है, pipeline में, हर stage पर असली probability के साथ. खरीदने के बाद वही record पूरा **lifetime** बन जाता है — हर order, हर return, असली worth (returns हटाने के बाद), और आगे क्या offer करें.',
    bullets: [
      '**Pipeline with honest odds** — New 10% · Contacted 25% · Quoted 50% · Negotiation 75%. "Likely to close" हमेशा raw pipeline से कम होता है, और वही number cash plan करने लायक है.',
      '**Won दबाइए और customer तुरंत बन जाता है** — कोई export नहीं, कोई दोबारा typing नहीं, और कोई gap नहीं जहाँ कोई छूट जाए.',
      '**Lost भी record होता है, reason के साथ** — win rate इसी से बनता है, और "where deals are being lost" table तीन महीने बाद सबसे काम की चीज़ बन जाती है.',
      '**छह behaviour groups खुद बनते हैं** — Champion, Loyal, Needs attention, At risk, Sleeping, New. कोई किसी को hand से tag नहीं करता; 91वें दिन customer अपने आप At risk हो जाता है.',
      '**Customer 360** — worth, orders, returns, channel mix (किस channel से माल वापस आ रहा है), हर order, और conversation log.',
      '**Worth कभी store नहीं होता** — हर बार orders से गिना जाता है, इसलिए ये figure Sales से कभी अलग नहीं हो सकता.'
    ]
  }],
  selfCheck: `**Segments खुद बनते हैं?** Customers screen पर "At risk" button दबाइए — जो customers 90
दिन से चुप हैं वही दिखेंगे. किसी ने उन्हें tag नहीं किया; rule ने किया.

**Won दबाने से customer बनता है?** Pipeline पर कोई भी deal "Won" कर दीजिए, फिर Customers
screen खोलिए — वो वहाँ है, segment "New" के साथ.`,
  verify: [
    { name: 'CRM & Customer 360 · Medhava', screens: '7 / 7', clicks: 83, tests: '38 / 38', errs: 0 },
    { name: 'CRM & Customer 360 · Vastrangam', screens: '7 / 7', clicks: 83, tests: '38 / 38', errs: 0 },
  ],
  status: { '01': 'Delivered', '02': 'Delivered — this ZIP', '03': 'Next' },
};
