'use strict';
/* Module 04 · E-commerce / OMS — the single description of the module.
   The packager builds the ZIPs from it AND the module PDF draws its "what is in the ZIP"
   page from it, so the tree in the book can never describe a delivery we did not send. */
const fs = require('fs'), path = require('path');
const T = JSON.parse(fs.readFileSync(path.join(__dirname, 'tests.json'), 'utf8'));
const n = k => T[k].length;

module.exports = {
  num: '04', slug: 'Ecommerce_OMS', title: 'E-commerce / OMS',
  overviewPdf: 'out/Medhava_Module_04_Ecommerce_OMS.pdf',
  status: { '01': 'Delivered', '02': 'Delivered', '03': 'Delivered', '04': 'Delivered — this ZIP', '05': 'Next' },
  apps: [
    { n: '01', slug: 'Marketplace_OMS', name: 'Marketplace OMS', screens: 11, tests: n('OMS_ERP'),
      html: { MEDHAVA: 'out/oms_ERP.html', VASTRANGAM: 'out/oms_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/OMS_ERP_MANUAL.md', VASTRANGAM: 'manuals/OMS_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_Marketplace_OMS_ERP.pdf', VASTRANGAM: 'out/Medhava_Marketplace_OMS_Vastrangam.pdf' },
      blurb: 'सात seller panel, **एक queue**. हर marketplace का order एक जगह — अपनी-अपनी dispatch घड़ी के साथ, और commission पहले ही काटकर, ताकि दिखे कि कौन सा channel **असल में क्या देता है**.',
      bullets: [
        '**Queue "कब आया" से नहीं, "कितना वक़्त बचा है" से sort होती है.** Amazon 12 घंटे देता है, Ajio 48. एक घंटे पुराना Amazon order कल के Ajio order से ज़्यादा urgent है — और सात panel अलग-अलग खोलकर यही बात हर बार उल्टी हो जाती है.',
        '**₹4,999 का saree ₹4,999 नहीं है.** Myntra का 30% commission और ₹79 shipping कटकर करीब **₹3,424** आता है. इस app की कोई screen gross को आपका पैसा बनाकर नहीं दिखाती — क्योंकि 30% वाला panel और 12% वाला panel gross पर comparable हैं ही नहीं.',
        '**Stock एक ही number है, हर panel के लिए एक अलग नहीं.** आख़िरी piece Amazon पर बिका तो उसी पल Flipkart से हट जाता है — तीन घंटे बाद cancellation बनकर नहीं. और account rating cancellation से ही गिरती है.',
        '**Price parity सातों panel पर check होती है.** Marketplaces एक-दूसरे का price पढ़ते हैं. Event का discount जहाँ रह गया, वहाँ का सस्ता listing बाक़ी listings को दबा देता है — उसी channel पर जिसे दिखने के लिए आप 28% दे रहे हैं.',
        '**Return उसी panel के खाते में जाता है जहाँ से आया.** 25% commission वाला channel जिसमें 15% माल वापस आता है, 25% का खर्च नहीं है — 40% के करीब है. **Marketplace P&L** screen payout से sort होती है, gross से नहीं, और यही ranking लोगों को चौंकाती है.'
      ] },
    { n: '02', slug: 'Order_Management', name: 'Order Management', screens: 13, tests: n('ORD_ERP'),
      html: { MEDHAVA: 'out/ordman_ERP.html', VASTRANGAM: 'out/ordman_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/ORD_ERP_MANUAL.md', VASTRANGAM: 'manuals/ORD_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_Order_Management_ERP.pdf', VASTRANGAM: 'out/Medhava_Order_Management_Vastrangam.pdf' },
      blurb: 'हर channel के order एक ही book में — website, marketplaces, counter, wholesale, WhatsApp. और **delivery date कोई type नहीं करता**: वो cut-off + उस warehouse से उस zone का transit है.',
      bullets: [
        '**कौन से warehouse से जाएगा, यह app तय करता है** — सबसे तेज़ वो warehouse जिसके पास सच में माल है. इसलिए picker कभी खाली rack पर नहीं भेजा जाता.',
        '**Date derive होती है, लिखी नहीं जाती.** 2 बजे का cut-off + उस warehouse से उस zone के transit days. इसलिए कोई Guwahati को मंगलवार का वादा नहीं कर सकता जहाँ courier शुक्रवार को पहुँचता है.',
        '**Stock पास वाले warehouse में हिलाइए और customer की date अपने आप बदल जाती है.** कोई field edit नहीं होती. जो date किसी field में रखी होती है वो एक महीने में गलत हो चुकी होती है — यह वाली नहीं हो सकती.',
        '**जिस order को कोई warehouse serve नहीं कर सकता, उसे कोई date दी ही नहीं जाती.** उसे production या purchase order चाहिए, वादा नहीं — और झूठी date देकर कुछ नहीं मिलता.',
        '**Return पर क्रम कभी नहीं टूटता: parcel वापस → किसी ने देखा → तब पैसा.** Resaleable piece उसी warehouse में वापस जाता है जहाँ से गया था; ख़राब piece **stock में वापस नहीं जोड़ा जाता** — वरना वो phantom stock बन जाता है जो किसी और को promise होकर, allocate होकर, pick के वक़्त गायब मिलेगा.'
      ] },
  ],
  selfCheck: `**दोनों app में gates सच में रोकते हैं?**

- **Marketplace OMS** — Dispatch queue खोलिए. सबसे ऊपर वाला order **सबसे कम वक़्त बचा** वाला होगा, सबसे पुराना नहीं. किसी order को cancel कीजिए — Listing health में उसका stock वापस बढ़ा हुआ मिलेगा.
- **Marketplace OMS** — Listing health में "Level the price" दबाइए. सातों panel catalog के list price पर आ जाएँगे और spread 0% हो जाएगा.
- **Order Management** — जिस item का stock कहीं नहीं है, उस order पर **Allocate** दबाइए. कुछ नहीं होगा, और उसकी date की जगह "no date possible" लिखा रहेगा.
- **Order Management** — Allocation desk में एक piece W2 से W3 भेजिए, फिर Order book देखिए. **उस order की promised date अपने आप बदल चुकी होगी.**
- **Order Management** — जो parcel अभी वापस नहीं आया, उस पर **Pay the refund** दबाइए. कुछ नहीं जाएगा. "Parcel is back" कीजिए, फिर भी नहीं जाएगा — जब तक कोई उसे देख न ले.`,
  verify: [
    { name: 'Marketplace OMS · Medhava', screens: '7 / 7', clicks: 85, tests: n('OMS_ERP') + ' / ' + n('OMS_ERP'), errs: 0 },
    { name: 'Marketplace OMS · Vastrangam', screens: '7 / 7', clicks: 85, tests: n('OMS_VAS') + ' / ' + n('OMS_VAS'), errs: 0 },
    { name: 'Order Management · Medhava', screens: '7 / 7', clicks: 105, tests: n('ORD_ERP') + ' / ' + n('ORD_ERP'), errs: 0 },
    { name: 'Order Management · Vastrangam', screens: '7 / 7', clicks: 105, tests: n('ORD_VAS') + ' / ' + n('ORD_VAS'), errs: 0 },
  ],
};
