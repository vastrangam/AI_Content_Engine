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

const BASE = {
'21': { t:'Group dashboard · All companies · FY 2026-27',
  k:[['Revenue, this month','₹1.42 Cr','g'],['Cash + bank','₹38.4 L',''],['Stock at cost','₹2.09 Cr',''],['Overdue in','₹6.2 L','r']],
  c:['Channel','Orders','Net revenue','vs last month'],
  r:[['Own website','1,284','₹41.8 L',['+12%','g']],
     ['Marketplaces','3,092','₹68.3 L',['+7%','g']],
     ['Wholesale / B2B','214','₹27.1 L',['−4%','r']],
     ['Counter','486','₹4.9 L',['+2%','g']]],
  b:[['Aerospace & drones',68],['Industrial parts',44],['Spares & service',27]] },

'04': { t:'Customer 360 · Skyward Robotics Pvt Ltd',
  k:[['Lifetime value','₹94.2 L',''],['Open tickets','3','a'],['Outstanding','₹4.1 L','r'],['On-time paid','88%','g']],
  c:['Record','What it is','When','State'],
  r:[['SO-4471','Order · 40 airframe kits','12 Jul',['Delivered','g']],
     ['TKT-2210','Ticket · calibration query','19 Jul',['Open','a']],
     ['DOC-118','Supply agreement · signed','02 Apr',['e-signed','g']],
     ['INV-9902','Invoice · ₹4,10,000','24 Jul',['Overdue 9d','r']]],
  b:[['First reply under 2 h',91],['Resolved same day',74]] },

'05': { t:'Order book · every channel, one list',
  k:[['Orders today','312',''],['To dispatch','118','a'],['Credit held','7','r'],['Avg order','₹8,940','']],
  c:['Order','Customer','Channel','Value','State'],
  r:[['SO-4489','Nagarjuna Traders','B2B · 45 days','₹2,84,000',['Credit hold','r']],
     ['SO-4490','R. Iyer','Website','₹12,400',['Packed','g']],
     ['SO-4491','Gulf Aero FZE','Export · LUT','₹9,60,000',['CI issued','']],
     ['SO-4492','Walk-in','Counter · POS','₹4,200',['Billed','g']]],
  b:[['Dispatched within cut-off',86],['COD collected',92]] },

'15': { t:'Order queue · 9 channels · dispatch cut-off running',
  k:[['To accept','62','a'],['To pack','214',''],['Cut-off in 2 h','9','r'],['Handed over today','188','g']],
  c:['Channel','To accept','To pack','RTD','Cut-off'],
  r:[['Amazon','18','62','48',['1 PM','a']],
     ['Flipkart','22','44','39',['1 PM','r']],
     ['Shopify (own site)','—','35','35',['none','g']],
     ['WooCommerce','—','21','18',['none','g']],
     ['Meesho · Ajio · Nykaa','22','52','40',['4 PM','']]],
  b:[['Dispatched inside the cut-off',94],['Labels printed straight from here',100]] },

'10': { t:'Pick wave 22 · Zone A → C',
  k:[['Lines to pick','486',''],['Pickers on floor','6',''],['Short-picked','4','r'],['Packed & filmed','241','g']],
  c:['Bin','Item','Qty','Picker','State'],
  r:[['A-04-2','Carbon arm 220 mm','24','Ravi',['Picked','g']],
     ['A-07-1','Motor 2207 · 1750KV','60','Ravi',['Picked','g']],
     ['B-02-3','LiPo 6S 5200 mAh','18','Sana',['Short 2','r']],
     ['C-01-1','Airframe kit · X8','12','Imran',['Packing','a']]],
  b:[['Picked first time right',94],['Parcels with footage',100]] },

'11': { t:'Handover · what went out against what they took',
  k:[['Expected out','1,046',''],['Handed over','1,012','g'],['Left behind','34','r'],['COD not remitted','₹3.8 L','r']],
  c:['Courier · service','Expected','Handed over','Left','Code'],
  r:[['Courier A · large','126','126','0',['confirmed','g']],
     ['Courier A · standard','604','598','6',['confirmed','g']],
     ['Courier B · standard','246','240','6',['confirmed','g']],
     ['Courier C · remote','70','48','22',['awaiting','a']]],
  b:[['Manifests signed the same day',96],['Parcels traced after handover',100]] },

'03': { t:'Product record · one product, every channel’s name for it',
  k:[['SKUs live','2,418',''],['Mapped on all channels','2,301','g'],['Missing size or weight','37','r'],['Below reorder','44','a']],
  c:['Your code','Channel','Their code','Packed size · weight','Sells at'],
  r:[['DRN-A22','Marketplace A','B0DXXXXABC','30×25×3 cm · 0.45 kg','₹1,947'],
     ['DRN-A22','Marketplace B','SWDHGA…RXY6','30×25×3 cm · 0.45 kg','₹1,998'],
     ['DRN-A22','Own storefront','drn-a22','30×25×3 cm · 0.45 kg','₹2,199'],
     ['MTR-1750','Marketplace B','—','—',['unmapped','r']]],
  b:[['Codes mapped on every live channel',95],['Size and weight on file',98]] },

'08': { t:'Work in progress · your own stages',
  k:[['Open work orders','48',''],['Units in WIP','1,260',''],['Rework','3.1%','a'],['Cost per unit','₹18,420','']],
  c:['Stage','Units in','Units out','Rejected','Ageing'],
  r:[['Machining','420','406','14',['1.2 d','g']],
     ['Sub-assembly','406','388','18',['2.0 d','a']],
     ['Wiring & calibration','388','380','8',['1.4 d','g']],
     ['Final test & pack','380','372','8',['0.8 d','g']]],
  b:[['Accepted at first test',96],['Orders finished on plan',89]] },

'07': { t:'Three-way match · nothing over-billed is paid',
  k:[['Open POs','62',''],['Bills held','5','r'],['Payables','₹41.2 L',''],['Avg accept rate','94%','g']],
  c:['Bill','Supplier','Ordered','Accepted','Billed for'],
  r:[['B-8841','Northgate Components','100','96',['96 ✓','g']],
     ['B-8842','Harbour Metals','500','500',['500 ✓','g']],
     ['B-8843','PioneerSupply Co.','240','218',['240 ✗','r']],
     ['B-8844','Delta Packaging','1,000','1,000',['1,000 ✓','g']]],
  b:[['Bills matched without a query',92],['Spend with top supplier',44]] },

'16': { t:'This month’s register · staff and contractors',
  k:[['On roll','86',''],['Present today','79','g'],['Advances out','₹2.4 L','a'],['Payout due','₹28.6 L','']],
  c:['Person','Basis','Days / units','Earned','State'],
  r:[['A. Deshpande','Monthly','26','₹64,000',['Approved','g']],
     ['S. Kulkarni','Monthly','24','₹41,500',['Approved','g']],
     ['Unit 3 contractors','Per unit','1,240','₹1,86,000',['To check','a']],
     ['R. Nair','Hourly','168 h','₹52,300',['Approved','g']]],
  b:[['Attendance marked on time',97],['Payouts released on the 7th',100]] },

'12': { t:'Trial balance · it always ties',
  k:[['Revenue YTD','₹11.8 Cr',''],['Gross margin','38.2%','g'],['GST payable','₹4.1 L',''],['ITC available','₹3.6 L','g']],
  c:['Head','Debit','Credit','This month'],
  r:[['Sales','—','₹1,42,08,400',['+12%','g']],
     ['Purchases','₹86,20,110','—',['+9%','']],
     ['Direct expenses','₹12,44,900','—',['−3%','g']],
     ['Difference','₹0','₹0',['Balanced','g']]],
  b:[['GSTR-1 lines matched',100],['Vouchers posted automatically',81]] },

'14': { t:'Settlement cycles · what each channel really paid',
  k:[['Due this cycle','₹52.4 L',''],['Actually paid','₹49.1 L','a'],['Gap','₹3.3 L','r'],['Claims filed','18','']],
  c:['Channel','Cycle','Should pay','Paid','Gap'],
  r:[['Amazon','12–18 Jul','₹18,40,000','₹18,40,000',['₹0','g']],
     ['Flipkart','12–18 Jul','₹14,20,000','₹12,90,000',['₹1,30,000','r']],
     ['Meesho','12–18 Jul','₹9,80,000','₹9,74,000',['₹6,000','a']],
     ['Shopify (own)','Daily','₹10,00,000','₹10,00,000',['₹0','g']]],
  b:[['Commission charged as published',86],['Claims recovered',63]] },

'17': { t:'Campaigns measured on revenue, not opens',
  k:[['Spend, month','₹4.8 L',''],['Revenue from it','₹31.2 L','g'],['ROAS','6.5×','g'],['Repricing rules','24','']],
  c:['Campaign','Channel','Spend','Revenue','ROAS'],
  r:[['Winter launch','Email','₹42,000','₹6,10,000',['14.5×','g']],
     ['Retarget · cart','Ads','₹2,10,000','₹14,80,000',['7.0×','g']],
     ['Dealer WhatsApp','WhatsApp','₹18,000','₹4,20,000',['23.3×','g']],
     ['Brand awareness','Social','₹2,10,000','₹6,10,000',['2.9×','a']]],
  b:[['Priced above floor everywhere',98],['Posts published on schedule',93]] },

'18': { t:'Content pipeline · written from your own catalogue',
  k:[['Listings this week','184',''],['Images produced','612',''],['Reels cut','38',''],['Rejected by channel','2','a']],
  c:['Item','What was made','Channel','State'],
  r:[['DRN-A22','Listing · title, bullets, A+','Amazon',['Live','g']],
     ['DRN-A22','8 images · 1:1 and 4:5','Own site',['Live','g']],
     ['MTR-1750','Reel · 22 s with voice','Social',['Scheduled','']],
     ['CAM-4K','Listing · attributes missing','Flipkart',['Held','a']]],
  b:[['Written from real catalogue data',100],['Published in one push',96]] },

'20': { t:'Live matters · a practice, not a production line',
  k:[['Open matters','34',''],['Billable this month','1,248 h',''],['Unbilled WIP','₹18.4 L','a'],['Due this week','6','r']],
  c:['Matter','Client','Stage','Hours','Due'],
  r:[['GST-2026-11','Skyward Robotics','Assessment reply','62',['4 Aug','a']],
     ['ARB-118','Harbour Metals','Evidence filed','148',['21 Aug','']],
     ['AUD-FY26','Delta Packaging','Fieldwork','204',['12 Aug','']],
     ['INC-909','R. Nair','Awaiting client','18',['—','']]],
  b:[['Hours captured same day',88],['Matters billed within 7 days',79]] },

'01': { t:'Roles and permissions · who may do what',
  k:[['Users','46',''],['Roles defined','7',''],['Companies','3',''],['Money by message','Never','g']],
  c:['Role','Can see','Can change','Can approve'],
  r:[['Owner','Everything','Everything',['No limit','g']],
     ['Accounts','Books · GST · parties','Vouchers · invoices',['Up to ₹50,000','a']],
     ['Warehouse','Orders · stock','Pick · pack · dispatch',['—','']],
     ['Outside auditor','Books, read-only','—',['—','']],
     ['Ask & Print (phone)','Ledger · bill · slips','Nothing at all',['Never','r']]],
  b:[['Actions carrying a named user',100],['Documents sent out need a one-time code',100]] },

/* The screen deliberately shows an agent STOPPED at an approval rather than one that
   finished on its own. What this module has to prove is not that it can act — anything
   can act — but that it knows where it is not allowed to. */
'22': { t:'Agent runs · this week · every step recorded',
  k:[['Questions answered','412',''],['Answered from records','412','g'],['Figures estimated','0','g'],['Waiting on a person','7','a']],
  c:['Run','What it was asked to do','Where it got to','State'],
  r:[['AG-1187','Chase 14 unmatched payout lines, draft a claim for each','14 drafted, none filed',['Needs a yes','a']],
     ['AG-1186','Flag every order held more than 48 hours','31 found, owners notified',['Done','g']],
     ['AG-1184','Re-price 60 slow lines inside the floor set for them','60 proposed',['Needs a yes','a']],
     ['AG-1181','Answer: what did we actually get paid last week','₹41.2 L, with 9 rows attached',['Done','g']],
     ['AG-1179','Refund a customer directly','Refused — moves money',['Blocked','r']]],
  b:[['Answers carrying the records they came from',100],['Runs a person can replay step by step',100],['Money moved without a human yes',0]] },

/* ═══════════════════════════════════════════════════════════════════════════
   THE SAME MODULE, SEVERAL TRADES
   Below this line a module may carry an ARRAY of screens instead of one, each
   labelled with the trade it is drawn from. That is the neutral edition making
   its argument the only way it can be made convincingly: a clinic's appointment
   book, a machine shop's order book and a forwarder's consignment list, side by
   side, with the same columns doing the same job under different words.
   Figures are illustrative.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── 02 · Design & Sampling — a thing is specified before it is sold ────── */
'02': [
{ sector:'Precision components maker', t:'Part development · revision 4 · awaiting sign-off',
  k:[['Open developments','14',''],['At customer approval','5','a'],['Rounds this part','4',''],['Cost vs target','+6%','r']],
  c:['Part','Revision','What changed','Stage'],
  r:[['BR-2214 bracket','r4','Wall 2.5 → 3.0 mm after fatigue test',['At customer','a']],
     ['HS-0907 housing','r2','Thread spec corrected to M6×1.0',['Approved','g']],
     ['SP-1180 spacer','r1','First article',['Sampling','']],
     ['GK-3302 gasket','r6','Material change, nitrile → viton',['Costing','a']]],
  b:[['Revisions kept in full',100],['Parts released without sign-off',0]] },
{ sector:'Dairy co-operative', t:'Recipe development · set yoghurt · trial 3',
  k:[['Recipes in trial','7',''],['Awaiting panel','2','a'],['Shelf-life days','21','g'],['Yield vs target','98.2%','']],
  c:['Recipe','Trial','What changed','Stage'],
  r:[['Set yoghurt 3.5%','t3','Culture blend B, 6 h at 42 °C',['Tasting panel','a']],
     ['Paneer block','t1','Coagulant dose −8%',['Trial run','']],
     ['Lassi sweetened','t5','Sugar 9% → 7.5%',['Approved','g']],
     ['Butter salted','t2','Salt 1.8%, churn 12 min',['Costing','a']]],
  b:[['Trials with a recorded reason',100],['Recipes released untasted',0]] },
{ sector:'Creative agency', t:'Concept development · brand refresh · round 2',
  k:[['Live concepts','9',''],['With client','3','a'],['Rounds included','3',''],['Rounds used','2','']],
  c:['Concept','Round','What changed','Stage'],
  r:[['Identity · route A','r2','Wordmark weight, palette narrowed to 3',['With client','a']],
     ['Identity · route B','r1','Initial presentation',['Parked','']],
     ['Packaging system','r2','Grid rebuilt for 4 pack sizes',['Approved','g']],
     ['Motion toolkit','r1','First cut',['In studio','']]],
  b:[['Rounds inside the retainer',67],['Concepts billed without a signed round',0]] }],

/* ── 06 · Planning & Requirements — what to buy, worked out ─────────────── */
'06': [
{ sector:'Precision components maker', t:'Requirement run · week 34 · what to order',
  k:[['Shortfalls','23',''],['Already on order','9','g'],['Order this week','₹18.4 L','a'],['Budget left','₹6.2 L','r']],
  c:['Material','Needed','On order','Order now'],
  r:[['EN8 bar 40 mm','1,240 kg','400 kg',['840 kg','a']],
     ['Nitrile sheet 3 mm','86 m²','86 m²',['—','g']],
     ['M6 socket screw','12,000','0',['12,000','a']],
     ['Zinc plating service','2,400 pcs','0',['Book slot','r']]],
  b:[['Shortfalls tracing to a real demand',100],['Ordered twice',0]] },
{ sector:'Restaurant group', t:'Purchase plan · four kitchens · next 3 days',
  k:[['Lines to buy','41',''],['Short today','6','r'],['Spend planned','₹2.14 L',''],['Waste last week','3.1%','a']],
  c:['Item','Covers forecast','Stock','Order'],
  r:[['Chicken, boneless','480 covers','32 kg',['58 kg','a']],
     ['Paneer','210 covers','18 kg',['—','g']],
     ['Tomato','all kitchens','44 kg',['90 kg','a']],
     ['Cooking oil 15 L','—','2 tins',['6 tins','r']]],
  b:[['Ordered against a forecast, not a guess',100],['Lines ordered below par',0]] }],

/* ── 09 · Quality & Compliance — a failure stops the next step ──────────── */
'09': [
{ sector:'Precision components maker', t:'Inspection · lot 8841 · first article',
  k:[['Lots checked today','18',''],['Failed','2','r'],['Accept rate','96.4%','g'],['Certificates expiring','1','a']],
  c:['Lot','Characteristic','Result','State'],
  r:[['8841','Bore Ø12.00 +0.02','12.014 mm',['Pass','g']],
     ['8841','Surface finish Ra 1.6','Ra 1.4',['Pass','g']],
     ['8839','Hardness 45 HRC ±2','41 HRC',['Fail · rework','r']],
     ['8837','Thread M6×1.0 gauge','Go / No-go',['Pass','g']]],
  b:[['Failures blocking the next stage',100],['Batches released with an open failure',0]] },
{ sector:'Dairy co-operative', t:'Traceability · batch DY-2209 · from milk to pack',
  k:[['Batches today','24',''],['On hold','1','a'],['Recall reach','< 4 min','g'],['Chain breaks','0','g']],
  c:['Step','Record','When','State'],
  r:[['Intake','14 farms · 4,180 L · 3.9% fat','05:40',['Logged','g']],
     ['Pasteurise','72 °C / 15 s · chart attached','06:20',['Pass','g']],
     ['Fill','2,090 packs · 2 L','08:05',['Logged','g']],
     ['Release','Coliform test pending','—',['Hold','a']]],
  b:[['Packs traceable to the farms that supplied them',100],['Released before the test came back',0]] },
{ sector:'Multi-doctor clinic', t:'Compliance register · licences and calibration',
  k:[['Items tracked','62',''],['Due in 30 days','4','a'],['Expired','0','g'],['Evidence on file','100%','g']],
  c:['Requirement','Reference','Expires','State'],
  r:[['Clinical establishment licence','CE-2211','14 Mar 2027',['Valid','g']],
     ['Autoclave validation','AV-88','02 Sep 2026',['Due soon','a']],
     ['Biomedical waste contract','BMW-14','31 Dec 2026',['Valid','g']],
     ['Radiographer certification','RC-07','19 Aug 2026',['Due soon','a']]],
  b:[['Requirements with a document behind them',100],['Ticked with nothing attached',0]] }],

/* ── 13 · Treasury — money that has not arrived is not cash ─────────────── */
'13': [
{ sector:'Restaurant group', t:'Cash position · four sites · next 14 days',
  k:[['Cash + bank','₹18.6 L',''],['Due out','₹22.4 L','r'],['Expected in','₹26.1 L','a'],['Tightest day','Day 9','a']],
  c:['When','Out','In','Running'],
  r:[['This week','₹9.8 L','₹11.2 L',['₹20.0 L','g']],
     ['Rent + salaries, day 9','₹8.4 L','₹2.1 L',['₹13.7 L','a']],
     ['Supplier terms, day 11','₹4.2 L','₹6.0 L',['₹15.5 L','']],
     ['Aggregator payout, day 13','—','₹6.8 L',['₹22.3 L','g']]],
  b:[['Forecast lines with a named assumption',100],['Projections posted to the ledger',0]] },
{ sector:'Interior contractor', t:'Retention and stage payments · 6 live sites',
  k:[['Certified, unpaid','₹41.2 L','a'],['Retention held','₹12.8 L',''],['Overdue > 60 d','₹7.4 L','r'],['Next release','Day 6','']],
  c:['Site','Stage certified','Retention','State'],
  r:[['Hotel lobby, Pune','Stage 3 of 5','₹4.2 L',['Invoiced','']],
     ['Office fit-out, BKC','Stage 2 of 4','₹3.1 L',['Overdue 71 d','r']],
     ['Retail rollout, Jaipur','Stage 5 of 5','₹2.9 L',['Retention due','a']],
     ['Clinic, Nashik','Stage 1 of 3','₹2.6 L',['Certified','g']]],
  b:[['Retention tracked to its release date',100],['Certified work invisible until invoiced',0]] }],

/* ── 19 · SEO, AEO & AIO — found by a search box and by an assistant ────── */
'19': [
{ sector:'Multi-doctor clinic', t:'Local search · what patients actually search',
  k:[['Tracked queries','128',''],['In the map pack','41','g'],['Cited by an assistant','12','a'],['Pages with schema','96%','g']],
  c:['Query','Position','Assistant cites us','Page'],
  r:[['dentist near Koregaon Park','2',['Yes','g'],'/dental'],
     ['root canal cost pune','7',['No','r'],'/treatments/rct'],
     ['paediatrician sunday open','4',['Yes','g'],'/paediatrics'],
     ['orthodontist consultation','11',['No','a'],'/ortho']],
  b:[['Pages whose markup matches what is on them',100],['Claims marked up that the page does not make',0]] },
{ sector:'Homeware brand · D2C', t:'Answer-engine visibility · category questions',
  k:[['Questions tracked','86',''],['Cited','29','g'],['Cited last month','17','a'],['Feed errors','0','g']],
  c:['Question an assistant is asked','Cited','Source page','Trend'],
  r:[['best cookware for induction','Yes','/guides/induction',['+6','g']],
     ['cast iron vs stainless','Yes','/guides/materials',['+2','g']],
     ['how to season a pan','No','/care',['−1','r']],
     ['dinner set for 6 under 5000','Yes','/sets',['new','']]],
  b:[['Answers traceable to a page we publish',100],['Positions quoted from a single sample',0]] }],
};

/* ═══════════════════════════════════════════════════════════════════════════
   SECOND AND THIRD READINGS OF A MODULE, FROM OTHER TRADES

   Kept apart from BASE and merged below rather than edited into it, so the
   screen that was already there stays exactly as it was and gains a sector
   label — the comparison is added, nothing is rewritten.
   ═══════════════════════════════════════════════════════════════════════════ */

const SECTOR_OF_BASE = {
  '03':'Drone & precision manufacturer', '04':'Drone & precision manufacturer',
  '05':'Drone & precision manufacturer', '07':'Precision components maker',
  '08':'Precision components maker',     '10':'Drone & precision manufacturer',
  '11':'Drone & precision manufacturer', '12':'Drone & precision manufacturer',
  '16':'Precision components maker',     '20':'Law practice',
};

const EXTRA = {

'03': [
{ sector:'Restaurant group', t:'Stock · four kitchens · one number per item',
  k:[['Items tracked','412',''],['Below par','23','r'],['Expiring in 3 days','9','a'],['Value on hand','₹6.8 L','']],
  c:['Item','Kitchen','On hand','Par','State'],
  r:[['Paneer','Andheri','18 kg','25 kg',['Below par','r']],
     ['Chicken, boneless','Andheri','32 kg','30 kg',['OK','g']],
     ['Cream 1 L','Powai','14','20',['Below par','r']],
     ['Basmati 25 kg','Central store','11','8',['OK','g']]],
  b:[['Counted against the recipe that consumed it',100],['Kitchens with a separate stock figure',0]] },
{ sector:'HVAC service firm', t:'Van stock · six vans and the main store',
  k:[['Parts tracked','268',''],['Vans below kit','2','a'],['Used, unbilled','₹41,200','r'],['Store value','₹9.2 L','']],
  c:['Part','Location','On hand','Kit level','State'],
  r:[['Capacitor 45+5 µF','Van 3','1','4',['Restock','r']],
     ['Contactor 32 A','Van 3','3','3',['OK','g']],
     ['R32 refrigerant 1 kg','Van 1','2','2',['OK','g']],
     ['Filter drier','Main store','48','20',['OK','g']]],
  b:[['Parts consumed on a job, billed to it',94],['Vans holding untracked stock',0]] }],

'04': [
{ sector:'Training institute', t:'Learner 360 · one record, enquiry to alumnus',
  k:[['Lifetime fees','₹1,84,000',''],['Open queries','1','a'],['Outstanding','₹22,000','r'],['Attendance','86%','g']],
  c:['Record','What it is','When','State'],
  r:[['ENQ-3312','Enquiry · data analytics','04 Feb',['Converted','g']],
     ['ENR-1180','Enrolment · batch DA-14','19 Feb',['Active','g']],
     ['INV-2204','Instalment 3 of 4','01 Aug',['Overdue 11 d','r']],
     ['TKT-0912','Query · certificate copy','22 Aug',['Open','a']]],
  b:[['Learners with one unified record',100],['Duplicate records after re-enrolment',0]] }],

'05': [
{ sector:'Multi-doctor clinic', t:'Appointment book · four chairs · today',
  k:[['Booked today','78',''],['Waiting','6','a'],['No-shows','4','r'],['Avg wait','9 min','g']],
  c:['Time','Patient','Doctor','Procedure','State'],
  r:[['09:30','P-4471','Dr Rao','Root canal · sitting 2',['In chair','g']],
     ['09:45','P-4488','Dr Menon','Scaling',['Waiting','a']],
     ['10:00','P-4491','Dr Rao','Consultation',['Confirmed','']],
     ['10:15','P-4402','Dr Iyer','Crown fitting',['No-show','r']]],
  b:[['Seen within 15 minutes of the slot',88],['Slots double-booked',0]] },
{ sector:'Freight forwarder', t:'Consignment book · every mode, one list',
  k:[['Live consignments','142',''],['Awaiting docs','11','a'],['Held at customs','3','r'],['Avg transit','6.2 d','']],
  c:['Job','Shipper','Mode','Value','State'],
  r:[['JOB-8841','Northgate Components','Sea · FCL','$84,000',['At origin port','']],
     ['JOB-8842','Harbour Metals','Air','$12,400',['In transit','g']],
     ['JOB-8843','Delta Packaging','Road · FTL','₹2,84,000',['Docs pending','a']],
     ['JOB-8844','PioneerSupply Co.','Sea · LCL','$9,600',['Customs hold','r']]],
  b:[['Jobs with complete documents before departure',91],['Consignments without a named owner',0]] }],

'07': [
{ sector:'Interior contractor', t:'Site procurement · six live sites',
  k:[['Open orders','38',''],['Awaiting approval','4','a'],['Committed','₹62.4 L',''],['Over budget','1','r']],
  c:['Order','Site','Material','Value','State'],
  r:[['PO-2214','Hotel lobby, Pune','Veneer ply 18 mm','₹4,86,000',['Delivered','g']],
     ['PO-2215','Office fit-out, BKC','Glass partition system','₹11,20,000',['Approval','a']],
     ['PO-2216','Retail, Jaipur','Vinyl flooring 640 m²','₹3,84,000',['In transit','']],
     ['PO-2217','Clinic, Nashik','Modular ceiling','₹2,10,000',['Over budget','r']]],
  b:[['Orders inside the site budget',94],['Material ordered without a requirement',0]] }],

'08': [
{ sector:'Dairy co-operative', t:'Batch production · today’s run',
  k:[['Batches today','24',''],['Yield','98.2%','g'],['Held for test','1','a'],['Cost per litre','₹41.20','']],
  c:['Batch','Product','In','Out','Yield'],
  r:[['DY-2209','Set yoghurt 2 L','4,180 L','4,110 L',['98.3%','g']],
     ['DY-2210','Paneer block','1,200 L','206 kg',['17.2%','g']],
     ['DY-2211','Butter salted','900 L','41 kg',['4.6%','a']],
     ['DY-2212','Lassi 200 ml','2,400 L','11,760',['98.0%','g']]],
  b:[['Batches traceable to their intake farms',100],['Yield losses with no recorded cause',0]] }],

'10': [
{ sector:'Freight forwarder', t:'Bonded warehouse · cargo in and out',
  k:[['Consignments held','86',''],['Cleared today','22','g'],['Over 30 days','7','a'],['Space used','74%','']],
  c:['Location','Consignment','Pieces','Held since','State'],
  r:[['BAY-A1','JOB-8811 · machinery','4','12 d',['Cleared','g']],
     ['BAY-A4','JOB-8790 · textiles','120','34 d',['Demurrage','r']],
     ['BAY-C2','JOB-8841 · components','18','2 d',['In bond','']],
     ['BAY-C7','JOB-8836 · spares','32','9 d',['Awaiting duty','a']]],
  b:[['Cargo located on first search',99],['Pieces released without a customs record',0]] }],

'11': [
{ sector:'HVAC service firm', t:'Today’s route · six engineers',
  k:[['Jobs scheduled','41',''],['Completed','28','g'],['Running late','3','a'],['First-time fix','86%','g']],
  c:['Engineer','Job','Window','Travel','State'],
  r:[['A. Deshpande','JOB-2214 · AMC service','09–11','12 km',['Done','g']],
     ['A. Deshpande','JOB-2219 · no cooling','11–13','8 km',['On site','']],
     ['S. Kulkarni','JOB-2221 · install','09–13','24 km',['Late 40 m','a']],
     ['R. Nair','JOB-2230 · gas leak','14–16','16 km',['Assigned','']]],
  b:[['Jobs closed on the first visit',86],['Parts fitted without being booked out',0]] }],

'12': [
{ sector:'Law practice', t:'Practice accounts · office and client money kept apart',
  k:[['Billed YTD','₹4.62 Cr',''],['WIP unbilled','₹68.2 L','a'],['Client account','₹1.14 Cr','g'],['Realisation','82%','']],
  c:['Head','Office','Client','This month'],
  r:[['Fees billed','₹42,08,400','—',['+9%','g']],
     ['Disbursements recoverable','₹6,44,900','—',['+3%','']],
     ['Client money held','—','₹1,14,20,000',['unchanged','g']],
     ['Difference','₹0','₹0',['Balanced','g']]],
  b:[['Client money never mixed with office money',100],['Time recorded on the day it happened',88]] }],

'15': [
{ sector:'Homeware brand · D2C', t:'Order queue · storefront and marketplaces',
  k:[['To accept','48','a'],['To pack','186',''],['Cut-off in 2 h','14','r'],['Return rate','6.4%','g']],
  c:['Channel','To accept','To pack','RTD','Cut-off'],
  r:[['Own storefront','—','62','62',['none','g']],
     ['Marketplace A','21','54','41',['1 PM','a']],
     ['Marketplace B','18','38','30',['1 PM','r']],
     ['Quick-commerce','9','32','28',['hourly','a']]],
  b:[['Dispatched inside the cut-off',93],['Stock oversold across channels',0]] }],

'16': [
{ sector:'Restaurant group', t:'Rota and pay · four sites · this week',
  k:[['On roll','124',''],['Shifts unfilled','5','r'],['Overtime hours','86','a'],['Wage % of sales','24.1%','g']],
  c:['Person','Site','Shifts','Hours','State'],
  r:[['Kitchen · commis','Andheri','6','48 h',['Approved','g']],
     ['Service · steward','Powai','5','40 h',['Approved','g']],
     ['Kitchen · CDP','Bandra','—','—',['Unfilled','r']],
     ['Casual pool','All sites','9','62 h',['To check','a']]],
  b:[['Shifts filled before the day starts',96],['Hours paid without a rota line',0]] },
{ sector:'Multi-doctor clinic', t:'Roster and payout · clinical and support',
  k:[['On roll','34',''],['On duty now','19','g'],['Locum shifts','4','a'],['Payout due','₹18.2 L','']],
  c:['Person','Basis','Sessions / hours','Earned','State'],
  r:[['Dr Rao','Per session','22 sessions','₹4,40,000',['Approved','g']],
     ['Dr Menon','Retainer','—','₹2,80,000',['Approved','g']],
     ['Locum · Dr Shah','Per session','4 sessions','₹72,000',['To check','a']],
     ['Front desk','Monthly','26 d','₹34,000',['Approved','g']]],
  b:[['Sessions matched to the appointments they served',100],['Locum paid without a signed session',0]] }],

'17': [
{ sector:'Training institute', t:'Admissions funnel · measured on enrolments',
  k:[['Enquiries','1,284',''],['Enrolled','186','g'],['Cost per enrolment','₹2,140','a'],['Fill rate','78%','']],
  c:['Source','Enquiries','Enrolled','Spend','Cost each'],
  r:[['Search','486','82','₹1,84,000',['₹2,244','a']],
     ['Referral','214','61','₹0',['₹0','g']],
     ['Social','392','28','₹1,42,000',['₹5,071','r']],
     ['Walk-in','192','15','₹0',['₹0','g']]],
  b:[['Enrolments traced to a source',100],['Spend judged on clicks',0]] }],

'18': [
{ sector:'Creative agency', t:'Content pipeline · client work, tracked to the retainer',
  k:[['Pieces this week','142',''],['Awaiting approval','18','a'],['Rejected by client','3','r'],['Hours booked','218','']],
  c:['Client','Deliverable','Channel','State'],
  r:[['Homeware brand','12 product listings','Marketplace',['Live','g']],
     ['Homeware brand','Launch film · 30 s','Social',['With client','a']],
     ['Dairy co-op','Pack copy · 6 SKUs','Print',['Approved','g']],
     ['HVAC firm','Service landing page','Web',['Rejected · redo','r']]],
  b:[['Pieces booked to a retainer line',100],['Work delivered outside a signed scope',0]] }],

'20': [
{ sector:'Interior contractor', t:'Live sites · stages, cost and certification',
  k:[['Live sites','6',''],['Behind plan','2','r'],['Certified, unpaid','₹41.2 L','a'],['Margin to date','19.4%','g']],
  c:['Site','Stage','Value','Cost to date','State'],
  r:[['Hotel lobby, Pune','3 of 5','₹1.84 Cr','₹1.12 Cr',['On plan','g']],
     ['Office fit-out, BKC','2 of 4','₹96 L','₹71 L',['Behind 9 d','r']],
     ['Retail, Jaipur','5 of 5','₹64 L','₹48 L',['Snagging','a']],
     ['Clinic, Nashik','1 of 3','₹38 L','₹6 L',['On plan','g']]],
  b:[['Stages certified before invoicing',100],['Cost booked to the site that incurred it',97]] },
{ sector:'HVAC service firm', t:'Job book · contract and callout work',
  k:[['Open jobs','62',''],['Under AMC','41','g'],['Out of contract','21','a'],['Avg job margin','31%','']],
  c:['Job','Customer','Type','Value','State'],
  r:[['JOB-2214','Skyward Robotics','AMC · quarterly','₹0',['Done','g']],
     ['JOB-2219','Nagarjuna Traders','Callout · no cooling','₹8,400',['On site','']],
     ['JOB-2221','Harbour Metals','Install · 4 units','₹2,86,000',['Scheduled','']],
     ['JOB-2230','R. Iyer','Callout · gas leak','₹6,200',['Quoted','a']]],
  b:[['Jobs closed with parts and time booked',96],['Callouts invoiced without a signed sheet',0]] }],
};

/* Merge. A module with extras becomes an array whose first entry is the screen
   that was always there, now carrying its sector label. Order matters: the
   original leads, because it is the one the rest are being compared against. */
const OUT = {};
Object.keys(BASE).forEach((k) => {
  const base = Array.isArray(BASE[k]) ? BASE[k] : [BASE[k]];
  if (SECTOR_OF_BASE[k] && !base[0].sector) base[0] = Object.assign({ sector: SECTOR_OF_BASE[k] }, base[0]);
  OUT[k] = EXTRA[k] ? base.concat(EXTRA[k]) : (Array.isArray(BASE[k]) ? base : BASE[k]);
});
Object.keys(EXTRA).forEach((k) => { if (!OUT[k]) OUT[k] = EXTRA[k]; });

module.exports = OUT;
