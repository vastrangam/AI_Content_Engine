'use strict';
/* ONE LIVE-LOOKING SCREEN PER MODULE — the neutral edition.

   A module section that is only prose asks the reader to imagine the software. A screen with
   real figures on it does the explaining instead. Each entry below is rendered by build.js into
   the same chrome: a window bar, KPI tiles, a table with real numbers, and a small bar block.

   Rule 8 applies here as hard as anywhere: the examples are a drone manufacturer, a chartered
   accountancy practice, a law firm, an electrical wholesaler. Nothing here may assume a trade.
   The VASTRANGAM edition supplies its own set in edition_vastrangam.js.

   shot = { t: window title,
            k: [[label, value, tone]]        tone: '' | g good | r bad | a watch
            c: [column headings],
            r: [[cells…]]                    a cell may be ['text','tone'] for a chip
            b: [[label, percent]] }          the small bar block, optional  */

module.exports = {
'01': { t:'Group dashboard · All companies · FY 2026-27',
  k:[['Revenue, this month','₹1.42 Cr','g'],['Cash + bank','₹38.4 L',''],['Stock at cost','₹2.09 Cr',''],['Overdue in','₹6.2 L','r']],
  c:['Channel','Orders','Net revenue','vs last month'],
  r:[['Own website','1,284','₹41.8 L',['+12%','g']],
     ['Marketplaces','3,092','₹68.3 L',['+7%','g']],
     ['Wholesale / B2B','214','₹27.1 L',['−4%','r']],
     ['Counter','486','₹4.9 L',['+2%','g']]],
  b:[['Aerospace & drones',68],['Industrial parts',44],['Spares & service',27]] },

'02': { t:'Customer 360 · Skyward Robotics Pvt Ltd',
  k:[['Lifetime value','₹94.2 L',''],['Open tickets','3','a'],['Outstanding','₹4.1 L','r'],['On-time paid','88%','g']],
  c:['Record','What it is','When','State'],
  r:[['SO-4471','Order · 40 airframe kits','12 Jul',['Delivered','g']],
     ['TKT-2210','Ticket · calibration query','19 Jul',['Open','a']],
     ['DOC-118','Supply agreement · signed','02 Apr',['e-signed','g']],
     ['INV-9902','Invoice · ₹4,10,000','24 Jul',['Overdue 9d','r']]],
  b:[['First reply under 2 h',91],['Resolved same day',74]] },

'03': { t:'Order book · every channel, one list',
  k:[['Orders today','312',''],['To dispatch','118','a'],['Credit held','7','r'],['Avg order','₹8,940','']],
  c:['Order','Customer','Channel','Value','State'],
  r:[['SO-4489','Nagarjuna Traders','B2B · 45 days','₹2,84,000',['Credit hold','r']],
     ['SO-4490','R. Iyer','Website','₹12,400',['Packed','g']],
     ['SO-4491','Gulf Aero FZE','Export · LUT','₹9,60,000',['CI issued','']],
     ['SO-4492','Walk-in','Counter · POS','₹4,200',['Billed','g']]],
  b:[['Dispatched within cut-off',86],['COD collected',92]] },

'04': { t:'Marketplace & storefront queue · 9 channels',
  k:[['New to pick','214',''],['SLA breach risk','9','r'],['Returns in','38','a'],['Stock pushed','9 ch','g']],
  c:['Channel','New','Packed','Dispatched','Breach'],
  r:[['Amazon','62','48','51',['0','g']],
     ['Flipkart','44','39','40',['2','a']],
     ['Shopify (own site)','35','35','33',['0','g']],
     ['WooCommerce','21','18','18',['1','a']],
     ['Meesho · Ajio · Nykaa','52','40','44',['6','r']]],
  b:[['Orders auto-imported',97],['Stock in step across channels',99]] },

'05': { t:'Pick wave 22 · Zone A → C',
  k:[['Lines to pick','486',''],['Pickers on floor','6',''],['Short-picked','4','r'],['Packed & filmed','241','g']],
  c:['Bin','Item','Qty','Picker','State'],
  r:[['A-04-2','Carbon arm 220 mm','24','Ravi',['Picked','g']],
     ['A-07-1','Motor 2207 · 1750KV','60','Ravi',['Picked','g']],
     ['B-02-3','LiPo 6S 5200 mAh','18','Sana',['Short 2','r']],
     ['C-01-1','Airframe kit · X8','12','Imran',['Packing','a']]],
  b:[['Picked first time right',94],['Parcels with footage',100]] },

'06': { t:'Courier network · rates, failures, COD',
  k:[['Shipped today','1,046',''],['NDR open','23','a'],['RTO this week','61','r'],['COD not remitted','₹3.8 L','r']],
  c:['Courier','Zone','Rate 500 g','On-time','NDR'],
  r:[['Courier A','Metro','₹42',['96%','g'],'4'],
     ['Courier B','Rest of India','₹58',['91%','a'],'11'],
     ['Courier C','North-east','₹104',['84%','r'],'8'],
     ['Own delivery','Local','₹18',['99%','g'],'0']],
  b:[['NDR rescued before RTO',71],['COD reaching bank in 5 days',88]] },

'07': { t:'Stock · one number, every location',
  k:[['SKUs live','2,418',''],['Below reorder','37','r'],['Dead over 120 d','₹4.6 L','a'],['Value at cost','₹2.09 Cr','']],
  c:['SKU','Item','Main','Store 2','Free'],
  r:[['DRN-A22','Airframe kit · X8','214','60',['274','g']],
     ['MTR-1750','Motor 2207 · 1750KV','1,880','240',['2,120','g']],
     ['BAT-6S52','LiPo 6S 5200 mAh','96','0',['74','a']],
     ['CAM-4K','Gimbal camera 4K','18','4',['9','r']]],
  b:[['Counted in last 30 days',82],['Channel-ready in catalogue',77]] },

'08': { t:'Work in progress · your own stages',
  k:[['Open work orders','48',''],['Units in WIP','1,260',''],['Rework','3.1%','a'],['Cost per unit','₹18,420','']],
  c:['Stage','Units in','Units out','Rejected','Ageing'],
  r:[['Machining','420','406','14',['1.2 d','g']],
     ['Sub-assembly','406','388','18',['2.0 d','a']],
     ['Wiring & calibration','388','380','8',['1.4 d','g']],
     ['Final test & pack','380','372','8',['0.8 d','g']]],
  b:[['Accepted at first test',96],['Orders finished on plan',89]] },

'09': { t:'Three-way match · nothing over-billed is paid',
  k:[['Open POs','62',''],['Bills held','5','r'],['Payables','₹41.2 L',''],['Avg accept rate','94%','g']],
  c:['Bill','Supplier','Ordered','Accepted','Billed for'],
  r:[['B-8841','Northgate Components','100','96',['96 ✓','g']],
     ['B-8842','Harbour Metals','500','500',['500 ✓','g']],
     ['B-8843','PioneerSupply Co.','240','218',['240 ✗','r']],
     ['B-8844','Delta Packaging','1,000','1,000',['1,000 ✓','g']]],
  b:[['Bills matched without a query',92],['Spend with top supplier',44]] },

'10': { t:'This month’s register · staff and contractors',
  k:[['On roll','86',''],['Present today','79','g'],['Advances out','₹2.4 L','a'],['Payout due','₹28.6 L','']],
  c:['Person','Basis','Days / units','Earned','State'],
  r:[['A. Deshpande','Monthly','26','₹64,000',['Approved','g']],
     ['S. Kulkarni','Monthly','24','₹41,500',['Approved','g']],
     ['Unit 3 contractors','Per unit','1,240','₹1,86,000',['To check','a']],
     ['R. Nair','Hourly','168 h','₹52,300',['Approved','g']]],
  b:[['Attendance marked on time',97],['Payouts released on the 7th',100]] },

'11': { t:'Trial balance · it always ties',
  k:[['Revenue YTD','₹11.8 Cr',''],['Gross margin','38.2%','g'],['GST payable','₹4.1 L',''],['ITC available','₹3.6 L','g']],
  c:['Head','Debit','Credit','This month'],
  r:[['Sales','—','₹1,42,08,400',['+12%','g']],
     ['Purchases','₹86,20,110','—',['+9%','']],
     ['Direct expenses','₹12,44,900','—',['−3%','g']],
     ['Difference','₹0','₹0',['Balanced','g']]],
  b:[['GSTR-1 lines matched',100],['Vouchers posted automatically',81]] },

'12': { t:'Settlement cycles · what each channel really paid',
  k:[['Due this cycle','₹52.4 L',''],['Actually paid','₹49.1 L','a'],['Gap','₹3.3 L','r'],['Claims filed','18','']],
  c:['Channel','Cycle','Should pay','Paid','Gap'],
  r:[['Amazon','12–18 Jul','₹18,40,000','₹18,40,000',['₹0','g']],
     ['Flipkart','12–18 Jul','₹14,20,000','₹12,90,000',['₹1,30,000','r']],
     ['Meesho','12–18 Jul','₹9,80,000','₹9,74,000',['₹6,000','a']],
     ['Shopify (own)','Daily','₹10,00,000','₹10,00,000',['₹0','g']]],
  b:[['Commission charged as published',86],['Claims recovered',63]] },

'13': { t:'Campaigns measured on revenue, not opens',
  k:[['Spend, month','₹4.8 L',''],['Revenue from it','₹31.2 L','g'],['ROAS','6.5×','g'],['Repricing rules','24','']],
  c:['Campaign','Channel','Spend','Revenue','ROAS'],
  r:[['Winter launch','Email','₹42,000','₹6,10,000',['14.5×','g']],
     ['Retarget · cart','Ads','₹2,10,000','₹14,80,000',['7.0×','g']],
     ['Dealer WhatsApp','WhatsApp','₹18,000','₹4,20,000',['23.3×','g']],
     ['Brand awareness','Social','₹2,10,000','₹6,10,000',['2.9×','a']]],
  b:[['Priced above floor everywhere',98],['Posts published on schedule',93]] },

'14': { t:'Content pipeline · written from your own catalogue',
  k:[['Listings this week','184',''],['Images produced','612',''],['Reels cut','38',''],['Rejected by channel','2','a']],
  c:['Item','What was made','Channel','State'],
  r:[['DRN-A22','Listing · title, bullets, A+','Amazon',['Live','g']],
     ['DRN-A22','8 images · 1:1 and 4:5','Own site',['Live','g']],
     ['MTR-1750','Reel · 22 s with voice','Social',['Scheduled','']],
     ['CAM-4K','Listing · attributes missing','Flipkart',['Held','a']]],
  b:[['Written from real catalogue data',100],['Published in one push',96]] },

'15': { t:'Live matters · a practice, not a production line',
  k:[['Open matters','34',''],['Billable this month','1,248 h',''],['Unbilled WIP','₹18.4 L','a'],['Due this week','6','r']],
  c:['Matter','Client','Stage','Hours','Due'],
  r:[['GST-2026-11','Skyward Robotics','Assessment reply','62',['4 Aug','a']],
     ['ARB-118','Harbour Metals','Evidence filed','148',['21 Aug','']],
     ['AUD-FY26','Delta Packaging','Fieldwork','204',['12 Aug','']],
     ['INC-909','R. Nair','Awaiting client','18',['—','']]],
  b:[['Hours captured same day',88],['Matters billed within 7 days',79]] },

'16': { t:'The record · append-only, nothing removable',
  k:[['Users','46',''],['Companies','3',''],['Entries today','2,184',''],['Refused requests','4','a']],
  c:['When','Who','What happened','From'],
  r:[['14:22','a.deshpande','Credit limit raised · Nagarjuna','Office'],
     ['14:19','system','GST invoice INV-9902 issued','Website'],
     ['14:04','+91 99··· 912','Ledger requested · sent','Ask & Print'],
     ['13:58','+91 87··· 161','Refused · number not registered',['Logged','a']]],
  b:[['Actions with a named user',100],['Requests refused and recorded',100]] },
};
