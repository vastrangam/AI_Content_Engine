/* Format A — Unified ERP (any industry). Neutral names; drop-in for any business selling on marketplaces. */
var CONFIG={
  id:'oms_erp', name:'Marketplace OMS', company:'Acme Corp', fy:'FY 2026-27',
  tagline:'Seven seller panels, one queue — with each marketplace’s own dispatch clock and its own cut worked out.',
  about:'Every marketplace order in one place. The queue is sorted by how little time is left before that particular marketplace’s dispatch window closes — not by when the order arrived — because each platform gives you a different number of hours and remembering seven different windows at 6pm is exactly what costs you the account. Commission and shipping fees are worked out on every order the moment it lands, so no screen ever shows you a gross figure as though it were yours: a 24% channel and a 10% channel are not comparable at gross. Stock is one number shared by every panel, so selling the last piece on one marketplace removes it from the other six in the same instant. And price parity is checked across every panel, because the same item quietly priced 17% apart is the fastest way to get a listing suppressed.',
  parityPct:5, retAlertPct:12,
  markets:[
    {code:'MPA',name:'Marketplace A — large horizontal',comm:18,ship:65,sla:12},
    {code:'MPB',name:'Marketplace B — category specialist',comm:24,ship:75,sla:24},
    {code:'MPC',name:'Marketplace C — general platform',comm:20,ship:70,sla:24},
    {code:'MPD',name:'Marketplace D — premium platform',comm:22,ship:85,sla:48},
    {code:'MPE',name:'Marketplace E — curated platform',comm:16,ship:60,sla:48},
    {code:'MPF',name:'Marketplace F — value platform',comm:10,ship:45,sla:36},
    {code:'MPG',name:'Marketplace G — reseller channel',comm:14,ship:55,sla:24}],
  items:[
    {sku:'FG-101',name:'Standard product',rate:1799,qty:24},
    {sku:'FG-102',name:'Premium product',rate:4999,qty:6},
    {sku:'FG-103',name:'Accessory',rate:899,qty:0},
    {sku:'FG-104',name:'Top-of-range product',rate:12999,qty:3}],
  /* A price left different on one panel is how parity gets broken. Only overrides are listed —
     anything not named here sits on the catalog list price. */
  prices:{
    'FG-102':{MPB:4499,MPD:5299},
    'FG-101':{MPF:1749}},
  /* age is the order’s age in HOURS. Time left = that marketplace’s window − age. */
  orders:[
    {id:'MP-4101',cust:'Ananya Rao',market:'MPB',sku:'FG-102',name:'Premium product',qty:1,rate:4999,age:22,status:'new'},
    {id:'MP-4102',cust:'Rohit Verma',market:'MPA',sku:'FG-101',name:'Standard product',qty:2,rate:1799,age:18,status:'accepted'},
    {id:'MP-4103',cust:'Sneha Iyer',market:'MPC',sku:'FG-103',name:'Accessory',qty:1,rate:899,age:20,status:'packed'},
    {id:'MP-4104',cust:'Karan Mehta',market:'MPD',sku:'FG-104',name:'Top-of-range product',qty:1,rate:12999,age:30,status:'new'},
    {id:'MP-4105',cust:'Divya Nair',market:'MPE',sku:'FG-101',name:'Standard product',qty:1,rate:1799,age:40,status:'accepted'},
    {id:'MP-4106',cust:'Meera Joshi',market:'MPF',sku:'FG-101',name:'Standard product',qty:3,rate:1799,age:30,status:'dispatched'},
    {id:'MP-4107',cust:'Tanvi Shah',market:'MPB',sku:'FG-102',name:'Premium product',qty:1,rate:4999,age:20,status:'delivered'},
    {id:'MP-4108',cust:'Vikram Sethi',market:'MPA',sku:'FG-101',name:'Standard product',qty:1,rate:1799,age:16,status:'delivered'},
    {id:'MP-4109',cust:'Neha Bhatt',market:'MPB',sku:'FG-102',name:'Premium product',qty:1,rate:4999,age:26,status:'returned'},
    {id:'MP-4110',cust:'Arjun Pillai',market:'MPD',sku:'FG-101',name:'Standard product',qty:1,rate:1799,age:30,status:'returned'},
    {id:'MP-4111',cust:'Ritu Saxena',market:'MPB',sku:'FG-103',name:'Accessory',qty:2,rate:899,age:18,status:'delivered'},
    {id:'MP-4112',cust:'Sameer Khan',market:'MPG',sku:'FG-102',name:'Premium product',qty:1,rate:4999,age:10,status:'cancelled'},
    {id:'MP-4113',cust:'Pooja Menon',market:'MPG',sku:'FG-101',name:'Standard product',qty:1,rate:1799,age:26,status:'packed'},
    {id:'MP-4114',cust:'Harsh Agarwal',market:'MPC',sku:'FG-104',name:'Top-of-range product',qty:1,rate:12999,age:22,status:'delivered'},
    {id:'MP-4115',cust:'Lata Kulkarni',market:'MPB',sku:'FG-101',name:'Standard product',qty:2,rate:1799,age:20,status:'delivered'},
    {id:'MP-4116',cust:'Faiz Ahmed',market:'MPD',sku:'FG-101',name:'Standard product',qty:1,rate:1799,age:44,status:'delivered'}],
  commNote:'Gross is the marketplace’s number. Payout is yours. The gap between them is not a rounding error — on a 24% channel with a shipping fee it is roughly a quarter of the invoice, and it is the single figure most sellers never put on one screen.',
  queueNote:'Seven panels means seven logins, seven dispatch clocks and seven stock figures that drift apart by the afternoon. One queue means one login, one clock per order, and one stock number that every channel reads. Nothing here is a new way of selling — it is the same orders, arranged so the urgent one is always at the top.',
  plNote:'A marketplace is not judged on how much it sells. It is judged on what reaches your bank after its commission, its shipping fee and its returns. Sorted by payout, the ranking on this screen is almost never the same as the ranking by gross.',
  parityNote:'Marketplaces read each other’s prices. The same item listed materially cheaper on one panel gets the dearer listings suppressed, and you lose the channel you were protecting. Level the price and both listings survive.',
  wiring:[
    {f:'Gross ordered',s:'This app (it owns the marketplace order)',h:'Every live order: quantity × rate'},
    {f:'Commission',s:'Marketplace rate card in this app',h:'That marketplace’s percentage of the order’s gross'},
    {f:'Shipping fee',s:'Marketplace rate card in this app',h:'A flat per-order fee, set per marketplace'},
    {f:'What reaches you',s:'This app',h:'Gross − commission − shipping fee, worked out per order and never stored'},
    {f:'Time left to dispatch',s:'This app',h:'That marketplace’s dispatch window minus the order’s age in hours'},
    {f:'Past the window',s:'This app',h:'An order still to dispatch whose time left has gone below zero'},
    {f:'Stock',s:'Inventory &amp; Catalog (one shared number)',h:'Falls on sale; comes back on a cancellation or a return'},
    {f:'Price on each panel',s:'Catalog + per-panel override',h:'List price unless a panel override exists; the spread is highest minus lowest'},
    {f:'Returns',s:'This app + Logistics',h:'Recorded against the marketplace the order came from, at that marketplace’s rate'},
    {f:'Settlement',s:'Settlement',h:'This app says what the payout should be; Settlement checks what actually arrived'},
    {f:'Books',s:'Accounting',h:'Sale at gross, commission and fee as expenses — so the ledger and the payout agree'}],
  wiringIn:[
    {from:'Catalog',what:'The item, its list price and which panels it is listed on'},
    {from:'Inventory',what:'The one stock number every panel reads'},
    {from:'Logistics',what:'The courier, the tracking number and whether it was delivered'},
    {from:'Settlement',what:'What the marketplace actually paid, to check against the expected payout'},
    {from:'Accounting',what:'Where the sale, the commission and the fee land in the books'}]
};
