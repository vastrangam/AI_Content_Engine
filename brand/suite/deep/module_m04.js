'use strict';
/* Module 04 — the single description of the module. The packager builds the ZIPs from it AND
   the module PDF draws its "what is in the ZIP" page from it, so the two can never disagree.

   `apps` are the three apps the website publishes for this module.
   `unified` is the fourth build: all three over one set of records. */

module.exports = {
  num: '04', slug: 'CRM', title: 'CRM',
  overviewPdf: 'out/Medhava_Module_04_CRM.pdf',
  status: { '01': 'Delivered', '02': 'Delivered — this ZIP', '03': 'Next' },
  apps: [
    {
      n: '01', slug: 'CRM_Customer_360', name: 'CRM & Customer 360', screens: 7, tests: 42,
      html: { MEDHAVA: 'out/crm_ERP.html', VASTRANGAM: 'out/crm_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/CRM_ERP_MANUAL.md', VASTRANGAM: 'manuals/CRM_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_M04_App1_CRM_ERP.pdf', VASTRANGAM: 'out/Medhava_M04_App1_CRM_VAS.pdf' },
      blurb: 'दो काम एक ही record में. खरीदने से पहले वो एक **lead** है — pipeline में, हर stage पर असली probability के साथ. जीतने के बाद **वही record** customer बन जाता है, दूसरा नहीं. फिर उसी पर हर order, हर return, असली worth, और — क्योंकि इस module की रीढ़ एक ही है — उस पर file किया हर document और उसका पूछा हर सवाल.',
      bullets: [
        '**जीतने पर दूसरा record नहीं बनता** — अगर वो company पहले से books पर है तो deal उसी record से जुड़ जाती है. एक customer के दो record ही वो चीज़ है जिससे "ये कितने के हैं?" के दो अलग जवाब निकलते हैं और कोई नहीं बता सकता कौन सा सही है.',
        '**Forecast ईमानदार है** — हर stage की अपनी probability (New 10%, Contacted 25%, Quoted 50%, Negotiation 75%). Plan करने लायक number weighted वाला है, वो नहीं जो सब बोलते हैं.',
        '**छह behaviour groups, rule से** — कितनी बार खरीदा और कितने दिन पहले. कोई हाथ से tag नहीं करता, इसलिए किसी के खरीदते ही या चुप होते ही group खुद बदल जाता है.',
        '**Customer 360 की timeline** — orders, documents, tickets, notes और वो पहली lead, सब एक list में, नया सबसे ऊपर. फ़ोन पर बैठे आदमी को तीन program खोलने की ज़रूरत नहीं.',
        '**यह app document sign नहीं कर सकता, ticket बंद नहीं कर सकता** — वो दूसरे apps के काम हैं. दो self-test इसका अपना code पढ़कर यही साबित करते हैं.'
      ]
    },
    {
      n: '02', slug: 'Documents_eSign', name: 'Documents & eSign', screens: 5, tests: 41,
      html: { MEDHAVA: 'out/docs_ERP.html', VASTRANGAM: 'out/docs_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/DOC_ERP_MANUAL.md', VASTRANGAM: 'manuals/DOC_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_M04_App2_DOC_ERP.pdf', VASTRANGAM: 'out/Medhava_M04_App2_DOC_VAS.pdf' },
      blurb: 'हर agreement, certificate, challan और scan — **उस record पर file होता है जिसका वो है**, folder में नहीं. Order पर, party पर, project या case पर, आदमी पर. फिर वो उसी record को खोलकर मिल जाता है — असल में कोई ऐसे ही ढूँढता है.',
      bullets: [
        '**Signature का मतलब यहाँ एक ही है** — छह अंकों का one-time code उस आदमी को गया जिसका नाम लिखा है, वापस आया, और document पर दर्ज हुआ. **Code नहीं तो signature नहीं.** कोई tick box नहीं, कोई menu नहीं, import से भी नहीं.',
        '**जो record मौजूद ही नहीं, उस पर file करना मना है** — यही वो एक गलती है जो पूरे filing system को बेकार कर देती है: document system में है और जहाँ से कोई ढूँढेगा वहाँ से मिलता नहीं.',
        '**Document किस चीज़ पर file हो सकता है यह setting है, मान्यता नहीं** — वकील case पर करता है, workshop job पर, कपड़े वाला style पर. तीनों वही एक field है, बस शब्द अलग.',
        '**60 दिन में expire होने वाले सामने रहते हैं** — चुपचाप lapse हुआ agreement मतलब चुपचाप reset हुआ rate.',
        '**Password कभी नहीं** — one-time code password नहीं है. **Medhava कभी आपसे marketplace, bank या account का password नहीं माँगेगा.**'
      ]
    },
    {
      n: '03', slug: 'Helpdesk_Live_Chat', name: 'Helpdesk & Live Chat', screens: 6, tests: 38,
      html: { MEDHAVA: 'out/helpdesk_ERP.html', VASTRANGAM: 'out/helpdesk_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/HD_ERP_MANUAL.md', VASTRANGAM: 'manuals/HD_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_M04_App3_HD_ERP.pdf', VASTRANGAM: 'out/Medhava_M04_App3_HD_VAS.pdf' },
      blurb: 'Chat, email या phone से आया सवाल **उसी party के record पर ticket बन जाता है**, और अक्सर उसी order पर जिसके बारे में है. जो उठाता है उसके सामने पूरी history पहले से होती है — क्या ख़रीदा, क्या वापस आया, क्या file है, पिछली बार क्या पूछा था.',
      bullets: [
        '**पहली reply का समय messages से निकाला जाता है, टाइप नहीं होता** — कोई field ही नहीं है जिसमें उसे डाला जा सके. जो नंबर कोई टाइप कर सकता है वो टाइप कर ही दिया जाएगा, और फिर दीवार पर लगा नंबर कुछ नहीं बताता.',
        '**बिना एक भी जवाब दिए ticket बंद नहीं हो सकता** — ignore करके "resolved" लिख देना यहाँ मना है.',
        '**किसी और के order से ticket नहीं जुड़ सकता** — इसी तरह एक customer को दूसरे की delivery के बारे में बता दिया जाता है.',
        '**हर channel और हर आदमी का असली आँकड़ा** — कहाँ से सवाल आते हैं, कौन कितनी जल्दी जवाब देता है. सब messages से गिना हुआ.',
        '**यही ticket उस customer की 360 timeline पर भी दिखता है** — copy होकर नहीं, वहीं से पढ़कर.'
      ]
    }
  ],
  unified: {
    n: '04', slug: 'All_Three_In_One', name: 'Module 04 · All three apps in one', screens: 14, tests: 49,
    html: { MEDHAVA: 'out/m04_ERP.html', VASTRANGAM: 'out/m04_Vastrangam.html' },
    manual: { MEDHAVA: 'manuals/U2_ERP_MANUAL.md', VASTRANGAM: 'manuals/U2_VAS_MANUAL.md' },
    pdf: { MEDHAVA: 'out/Medhava_M04_App4_U2_ERP.pdf', VASTRANGAM: 'out/Medhava_M04_App4_U2_VAS.pdf' },
    blurb: '**ऊपर के तीनों apps, एक ही set of records पर** — और तीनों के buttons एक ही screen पर. एक deal जीतिए और customer list, उसके documents और उसके tickets सब उसी पल तैयार. **यही वो app है जिससे testing कीजिए.**',
    bullets: [
      '**तीनों apps के buttons एक साथ** — deal जीतिए, document sign कीजिए, ticket का जवाब दीजिए — app बदले बिना. अकेला CRM app जानबूझकर sign और reply नहीं कर सकता; यहाँ कर सकते हैं.',
      '**Add · edit · delete — हर table** — parties, leads, orders, documents, tickets, ticket messages, conversation log.',
      '**अपनी Excel या CSV upload कीजिए** — पूरा spreadsheet engine इसी file के अंदर लिखा है, इसलिए **internet बंद करके भी upload चलता है.**',
      '**Importer वही rules मानता है जो screen मानती है** — बिना code वाला "signed" document और किसी और के order वाला ticket import में भी मना है. जो form मना करे और import कर दे — वही तो पिछला दरवाज़ा है, और सब उसी से घुसना सीख जाते हैं.',
      '**कोई row चुपचाप नहीं गिरती** — पहले सिर्फ़ दिखाया जाता है: कितनी accept, कितनी reject, और हर reject की line number और वजह. आपके "हाँ" के बाद ही कुछ लिखा जाता है.'
    ]
  },
  selfCheck: `**तीनों apps एक ही record पर हैं?** **App 04** खोलिए → **Pipeline** → कोई भी open deal
"Mark won" कीजिए → अब **Customers** देखिए. अगर वो company पहले से थी तो **गिनती नहीं बढ़ेगी** —
deal पुराने record से जुड़ गई. फिर **Customer 360** खोलिए: उसी screen पर उसके orders, उस पर file
हुए documents, और उसके पूछे सवाल — तीनों apps एक list में.

**Signature वाक़ई रोका जाता है?** **All documents** → किसी "sent" document पर *Record the code* →
box खाली छोड़कर दबाइए. **मना कर देगा, वजह लिखकर.** अब छह अंक डालिए — तभी signed होगा, और code
document पर दर्ज रहेगा.

**Reply का समय सच में गिना जाता है?** **Tickets** → *Not answered yet* → कोई ticket खोलिए →
पहले *Close this ticket* दबाइए (मना करेगा) → फिर reply लिखकर भेजिए. **First reply** का आँकड़ा
उसी पल आ जाएगा, क्योंकि वो message से निकाला गया है, कहीं लिखा नहीं गया.`,
  verify: [
    { name: 'CRM & Customer 360 · Medhava', screens: '7 / 7', clicks: 86, tests: '42 / 42', errs: 0 },
    { name: 'CRM & Customer 360 · Vastrangam', screens: '7 / 7', clicks: 86, tests: '42 / 42', errs: 0 },
    { name: 'Documents & eSign · Medhava', screens: '4 / 4', clicks: 49, tests: '41 / 41', errs: 0 },
    { name: 'Documents & eSign · Vastrangam', screens: '4 / 4', clicks: 49, tests: '41 / 41', errs: 0 },
    { name: 'Helpdesk & Live Chat · Medhava', screens: '5 / 5', clicks: 67, tests: '38 / 38', errs: 0 },
    { name: 'Helpdesk & Live Chat · Vastrangam', screens: '5 / 5', clicks: 67, tests: '38 / 38', errs: 0 },
    { name: 'All three in one · Medhava', screens: '14 / 14', clicks: 132, tests: '49 / 49', errs: 0 },
    { name: 'All three in one · Vastrangam', screens: '14 / 14', clicks: 132, tests: '49 / 49', errs: 0 },
  ],
};
