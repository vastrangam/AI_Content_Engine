'use strict';
/* Module 03 · Sales — the single description of the module. The packager builds the ZIPs
   from it AND the module PDF draws its "what is in the ZIP" page from it. */
const fs = require('fs'), path = require('path');
const T = JSON.parse(fs.readFileSync(path.join(__dirname, 'tests.json'), 'utf8'));
const n = k => T[k].length;

module.exports = {
  num: '03', slug: 'Sales', title: 'Sales',
  overviewPdf: 'out/Medhava_Module_03_Sales.pdf',
  status: { '01': 'Delivered', '02': 'Delivered', '03': 'Delivered — this ZIP', '04': 'Next' },
  apps: [
    { n: '01', slug: 'D2C_Sales', name: 'D2C Sales', screens: 8, tests: n('D2C_ERP'),
      html: { MEDHAVA: 'out/d2c_ERP.html', VASTRANGAM: 'out/d2c_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/D2C_ERP_MANUAL.md', VASTRANGAM: 'manuals/D2C_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_D2C_Sales_ERP.pdf', VASTRANGAM: 'out/Medhava_D2C_Sales_Vastrangam.pdf' },
      blurb: 'अपनी website के orders एक pipeline में — **New → Confirmed → Packed → Shipped → Delivered**. चार नियम, और हर एक असली पैसा बचाता है.',
      bullets: [
        '**Coupon अपनी minimum value से नीचे लागू ही नहीं होता** — table में grey दिखता है और "below minimum" लिखा आता है. चुपचाप bill नहीं घटता.',
        '**COD order 20% advance के बिना pack नहीं हो सकता.** Refused parcel में courier का पैसा दोनों तरफ़ जाता है और माल भी हाथ लगकर वापस आता है. जो customer कुछ दे चुका है, वो parcel लेता ही है.',
        '**Loyalty points delivery पर मिलते हैं, order पर नहीं** — इसलिए "points owed" असली liability है, अंदाज़ा नहीं.',
        '**हर abandoned cart उम्र के साथ list में है.** तीन दिन पहले छूटा cart business की सबसे सस्ती sale है, और कोई उसे chase नहीं करता.',
        '**Stock वही एक number है** जो marketplaces, counter और wholesale order book पढ़ते हैं. Per-channel copy नहीं, इसलिए मिलाने की ज़रूरत नहीं.'
      ] },
    { n: '02', slug: 'B2B_Credit', name: 'B2B & Credit', screens: 8, tests: n('B2B_ERP'),
      html: { MEDHAVA: 'out/b2b_ERP.html', VASTRANGAM: 'out/b2b_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/B2B_ERP_MANUAL.md', VASTRANGAM: 'manuals/B2B_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_B2B_Credit_ERP.pdf', VASTRANGAM: 'out/Medhava_B2B_Credit_Vastrangam.pdf' },
      blurb: 'Wholesale की दो बातें जो तय करती हैं कि पैसा बनेगा या चुपचाप जाएगा: **rate tier तय करता है, मोल-भाव नहीं** — और **credit check एक gate है, warning नहीं.**',
      bullets: [
        '**Rate कभी type नहीं होता.** हर buyer एक tier पर है, tier discount तय करता है. इसलिए price list एक-एक "इस बार के लिए" में बिखर नहीं सकती.',
        '**Limit से बाहर का order "on hold" जाता है** — खोता नहीं, और चुपचाप approve भी नहीं होता. किसी को असली फ़ैसला लेना पड़ता है: पैसा वसूलो, या जान-बूझकर limit बढ़ाओ.',
        '**Ageing हर buyer की अपनी terms पर गिनी जाती है.** 45-दिन वाले को 31वें दिन late नहीं कहा जाता, और 15-दिन वाले को गलती से 30 दिन नहीं मिलते.',
        '**Headroom बचा हो लेकिन 90 दिन पुराना invoice हो — तो भी रोक दिया जाता है.** अकेला headroom आधा जवाब है.',
        '**List price, tier price और "आपने कितना छोड़ा"** हर row में साथ दिखते हैं. Discount की कीमत कभी छिपती नहीं.'
      ] },
    { n: '03', slug: 'Export', name: 'Export', screens: 8, tests: n('EXP_ERP'),
      html: { MEDHAVA: 'out/export_ERP.html', VASTRANGAM: 'out/export_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/EXP_ERP_MANUAL.md', VASTRANGAM: 'manuals/EXP_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_Export_ERP.pdf', VASTRANGAM: 'out/Medhava_Export_Vastrangam.pdf' },
      blurb: 'Export बेचने की समस्या नहीं, **कागज़ की समस्या** है. पाँच कागज़ हर shipment के साथ जाते हैं — और एक भी छूटा तो container port पर demurrage खाता है.',
      bullets: [
        '**पाँचों कागज़ पूरे न हों तो shipment "shipped" mark ही नहीं हो सकता** — app नाम लेकर बताता है कौन-सा बाकी है. यही नियम पहली shipment पर ही app की कीमत निकाल देता है.',
        '**GST के दो जायज़ रास्ते:** LUT bond भरिए और IGST दीजिए ही नहीं — या दीजिए और refund claim कीजिए.',
        '**Pay-and-claim पर वो tax आपका working capital है**, सरकार के पास पड़ा. छोटे exporters का सबसे भूला हुआ receivable यही है, क्योंकि list किसी की ज़िम्मेदारी नहीं होती. यहाँ हर unclaimed refund उम्र के साथ दिखता है.',
        '**एक exchange rate, एक जगह.** बदलिए और हर screen का हर रुपया साथ बदलता है — कोई screen पिछले हफ़्ते का rate नहीं बोल सकती.',
        '**60 दिन कानूनी deadline नहीं है** — वो वो line है जिसके अंदर सही claim आ ही जाता है. उससे पुराना कुछ भी एक phone call का हक़दार है.'
      ] },
    { n: '04', slug: 'POS', name: 'POS', screens: 8, tests: n('POS_ERP'),
      html: { MEDHAVA: 'out/pos_ERP.html', VASTRANGAM: 'out/pos_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/POS_ERP_MANUAL.md', VASTRANGAM: 'manuals/POS_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_POS_ERP.pdf', VASTRANGAM: 'out/Medhava_POS_Vastrangam.pdf' },
      blurb: 'एक till जो **बाक़ी business से झूठ नहीं बोल सकती.** Price catalogue से आता है, counter से नहीं — इसलिए दुकान website को चुपचाप undercut नहीं कर सकती.',
      bullets: [
        '**Discount 50% पर capped है** और bill पर छपता है. जो counter बेहिसाब discount दे सकता है, वो counter leak करता है.',
        '**GST discount के बाद की value पर लगता है, gross पर नहीं.** जो price customer दे ही नहीं रहा उस पर tax लेना गलत भी है और महँगा भी.',
        '**Payment जैसे चाहे बाँटिए** — cash, UPI, card, on account. लेकिन **पूरा पैसा न हो तो bill छपेगा ही नहीं.** कम पर दबाइए, app बताता है कितना बाकी है.',
        '**Stock वही एक साझा number है.** Counter पर आख़िरी piece बिका तो website तीस सेकंड बाद उसे नहीं बेच सकती.',
        '**Close पर सिर्फ़ cash drawer में expected है.** UPI और card bank गए; on-account पैसा ही नहीं है. इसलिए फ़र्क़ उसी दिन पकड़ में आता है, महीने के audit में नहीं.'
      ] },
    { n: '05', slug: 'Quotes_Proforma', name: 'Quotes & Proforma', screens: 7, tests: n('QT_ERP'),
      html: { MEDHAVA: 'out/quotes_ERP.html', VASTRANGAM: 'out/quotes_Vastrangam.html' },
      manual: { MEDHAVA: 'manuals/QT_ERP_MANUAL.md', VASTRANGAM: 'manuals/QT_VAS_MANUAL.md' },
      pdf: { MEDHAVA: 'out/Medhava_Quotes_Proforma_ERP.pdf', VASTRANGAM: 'out/Medhava_Quotes_Proforma_Vastrangam.pdf' },
      blurb: 'Quote भेजिए, मोल-भाव के साथ revise कीजिए, और accepted को **एक-एक click में proforma और confirmed order** बना दीजिए — कुछ भी दोबारा type किए बिना.',
      bullets: [
        '**Quote अपने आप expire होता है.** Expiry date + validity से गिनी जाती है — कोई field नहीं जिसे किसी को update करना पड़े. इसलिए तीन महीने पुराना rate गलती से "हमने quote तो किया था" कहकर नहीं दिया जा सकता.',
        '**हर revision रखा जाता है.** Customer को सिर्फ़ आख़िरी दिखता है; आपको पहला भी दिखता है. "इस quarter में discount ने कितना खाया" का जवाब इसी से मिलता है.',
        '**Expired quote आगे नहीं बढ़ सकता** — app कहता है re-quote कीजिए. Re-quote पुरानी lines आज की तारीख़ पर उठा लेता है और पुराने को lost mark कर देता है, ताकि record ईमानदार रहे.',
        '**Proforma वही lines, वही discount, वही total** लेकर आता है जो customer ने हाँ कहा था. कोई ऐसा पल नहीं जहाँ कोई दोबारा type करे और figure बदल जाए.',
        '**Slippage table असली फ़ायदा है.** एक quote में 10% जाना मोल-भाव है; हर quote में 10% जाना यह है कि price list 10% ज़्यादा है — और पहला offer रखे बिना यह किसी को दिखता नहीं.'
      ] },
  ],
  selfCheck: `**पाँच gates सच में रोकते हैं?** हर app में एक चीज़ है जो app करने से **मना** करता है:

- **D2C** — कम advance वाले COD order पर "Mark packed" दबाइए. Stage नहीं बदलेगा.
- **B2B** — किसी buyer की limit से बड़ा order उठाइए. सीधा "on hold" जाएगा.
- **Export** — जिस shipment का एक कागज़ बाकी है उसे "Mark shipped" कीजिए. मना कर देगा और नाम बताएगा.
- **POS** — पूरा पैसा डाले बिना "Print the bill" दबाइए. कुछ नहीं छपेगा.
- **Quotes** — expired quote को आगे बढ़ाइए. नहीं बढ़ेगा; re-quote कहेगा.

**एक stock number है या हर channel का अलग?** POS में आख़िरी piece बेच दीजिए — उसका button grey हो जाएगा. वही record website भी पढ़ती है.`,
  verify: [
    { name: 'D2C Sales · Medhava', screens: '6 / 6', clicks: 77, tests: n('D2C_ERP') + ' / ' + n('D2C_ERP'), errs: 0 },
    { name: 'D2C Sales · Vastrangam', screens: '6 / 6', clicks: 77, tests: n('D2C_VAS') + ' / ' + n('D2C_VAS'), errs: 0 },
    { name: 'B2B & Credit · Medhava', screens: '6 / 6', clicks: 75, tests: n('B2B_ERP') + ' / ' + n('B2B_ERP'), errs: 0 },
    { name: 'B2B & Credit · Vastrangam', screens: '6 / 6', clicks: 75, tests: n('B2B_VAS') + ' / ' + n('B2B_VAS'), errs: 0 },
    { name: 'Export · Medhava', screens: '6 / 6', clicks: 97, tests: n('EXP_ERP') + ' / ' + n('EXP_ERP'), errs: 0 },
    { name: 'Export · Vastrangam', screens: '6 / 6', clicks: 97, tests: n('EXP_VAS') + ' / ' + n('EXP_VAS'), errs: 0 },
    { name: 'POS · Medhava', screens: '6 / 6', clicks: 50, tests: n('POS_ERP') + ' / ' + n('POS_ERP'), errs: 0 },
    { name: 'POS · Vastrangam', screens: '6 / 6', clicks: 50, tests: n('POS_VAS') + ' / ' + n('POS_VAS'), errs: 0 },
    { name: 'Quotes & Proforma · Medhava', screens: '5 / 5', clicks: 63, tests: n('QT_ERP') + ' / ' + n('QT_ERP'), errs: 0 },
    { name: 'Quotes & Proforma · Vastrangam', screens: '5 / 5', clicks: 63, tests: n('QT_VAS') + ' / ' + n('QT_VAS'), errs: 0 },
  ],
};
