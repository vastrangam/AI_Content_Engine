/* Format B — Vastrangam (ethnic wear). Real panels, real commission rates, real fashion return rates. */
var CONFIG={
  id:'oms_vastrangam', name:'Marketplace OMS', company:'Vastrangam', fy:'FY 2026-27',
  tagline:'Seven seller panels, one queue — Myntra, Amazon, Flipkart, Ajio, Nykaa, Meesho and Tata Cliq in one place.',
  about:'Every marketplace order for Vastrangam in one queue. The queue is sorted by how little time is left before that panel’s dispatch window closes — not by when the order came in — because Amazon gives you 12 hours and Ajio gives you 48, and remembering which is which at 6pm on a festive Friday is exactly what gets an account rated down. Commission is worked out on every order the moment it lands: a saree that shows ₹4,999 on Myntra pays you about ₹3,424 after a 30% cut and the shipping fee, and no screen here will ever show you the ₹4,999 as though it were yours. Stock is one number every panel reads, so the last Banarasi saree sold on Amazon disappears from Flipkart in the same instant instead of turning into a cancellation three hours later. Price parity is checked across all seven panels, because the same lehenga priced 17% apart is the fastest way to have your dearer listing suppressed. And returns are counted against the panel they came from — in ethnic wear that is the whole difference between a channel that looks profitable and one that is.',
  parityPct:5, retAlertPct:12,
  markets:[
    {code:'MYN',name:'Myntra',comm:30,ship:79,sla:24},
    {code:'AMZ',name:'Amazon',comm:22,ship:65,sla:12},
    {code:'FKT',name:'Flipkart',comm:24,ship:70,sla:24},
    {code:'AJIO',name:'Ajio',comm:28,ship:85,sla:48},
    {code:'NYK',name:'Nykaa Fashion',comm:26,ship:60,sla:48},
    {code:'MEE',name:'Meesho',comm:12,ship:45,sla:36},
    {code:'TCL',name:'Tata Cliq',comm:20,ship:55,sla:24}],
  items:[
    {sku:'VS-KUR-01',name:'Cotton kurta set',rate:1799,qty:24},
    {sku:'VS-SAR-02',name:'Banarasi saree',rate:4999,qty:6},
    {sku:'VS-DUP-03',name:'Zari dupatta',rate:899,qty:0},
    {sku:'VS-LEH-04',name:'Bridal lehenga',rate:12999,qty:3}],
  /* Only the panels priced away from the catalog list price are named here.
     The saree was discounted for a Myntra event and never put back — that is how parity breaks. */
  prices:{
    'VS-SAR-02':{MYN:4499,AJIO:5299},
    'VS-KUR-01':{MEE:1749}},
  /* age is the order’s age in HOURS. Time left = that panel’s dispatch window − age. */
  orders:[
    {id:'VS-M-4101',cust:'Ananya Rao',market:'MYN',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,age:22,status:'new'},
    {id:'VS-M-4102',cust:'Rohit Verma',market:'AMZ',sku:'VS-KUR-01',name:'Cotton kurta set',qty:2,rate:1799,age:18,status:'accepted'},
    {id:'VS-M-4103',cust:'Sneha Iyer',market:'FKT',sku:'VS-DUP-03',name:'Zari dupatta',qty:1,rate:899,age:20,status:'packed'},
    {id:'VS-M-4104',cust:'Karan Mehta',market:'AJIO',sku:'VS-LEH-04',name:'Bridal lehenga',qty:1,rate:12999,age:30,status:'new'},
    {id:'VS-M-4105',cust:'Divya Nair',market:'NYK',sku:'VS-KUR-01',name:'Cotton kurta set',qty:1,rate:1799,age:40,status:'accepted'},
    {id:'VS-M-4106',cust:'Meera Joshi',market:'MEE',sku:'VS-KUR-01',name:'Cotton kurta set',qty:3,rate:1799,age:30,status:'dispatched'},
    {id:'VS-M-4107',cust:'Tanvi Shah',market:'MYN',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,age:20,status:'delivered'},
    {id:'VS-M-4108',cust:'Vikram Sethi',market:'AMZ',sku:'VS-KUR-01',name:'Cotton kurta set',qty:1,rate:1799,age:16,status:'delivered'},
    {id:'VS-M-4109',cust:'Neha Bhatt',market:'MYN',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,age:26,status:'returned'},
    {id:'VS-M-4110',cust:'Arjun Pillai',market:'AJIO',sku:'VS-KUR-01',name:'Cotton kurta set',qty:1,rate:1799,age:30,status:'returned'},
    {id:'VS-M-4111',cust:'Ritu Saxena',market:'MYN',sku:'VS-DUP-03',name:'Zari dupatta',qty:2,rate:899,age:18,status:'delivered'},
    {id:'VS-M-4112',cust:'Sameer Khan',market:'TCL',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,age:10,status:'cancelled'},
    {id:'VS-M-4113',cust:'Pooja Menon',market:'TCL',sku:'VS-KUR-01',name:'Cotton kurta set',qty:1,rate:1799,age:26,status:'packed'},
    {id:'VS-M-4114',cust:'Harsh Agarwal',market:'FKT',sku:'VS-LEH-04',name:'Bridal lehenga',qty:1,rate:12999,age:22,status:'delivered'},
    {id:'VS-M-4115',cust:'Lata Kulkarni',market:'MYN',sku:'VS-KUR-01',name:'Cotton kurta set',qty:2,rate:1799,age:20,status:'delivered'},
    {id:'VS-M-4116',cust:'Faiz Ahmed',market:'AJIO',sku:'VS-KUR-01',name:'Cotton kurta set',qty:1,rate:1799,age:44,status:'delivered'}],
  commNote:'₹4,999 on Myntra is not ₹4,999. It is ₹4,999 less 30% commission less ₹79 shipping — about ₹3,424 — and that is before a single parcel comes back. Meesho takes 12% and Myntra takes 30%, so the same saree earns you very different money depending on which panel sold it. That is the figure this screen exists to put in front of you.',
  queueNote:'Seven panels means seven logins, seven dispatch clocks and seven stock figures that have drifted apart by lunchtime. One queue means one login, one clock per order, and one stock number that all seven panels read. It is the same orders you already have — only arranged so that the one that will cost you an account rating is always at the top.',
  plNote:'Myntra will almost always be your biggest channel by gross. Once 30% commission and a 20% return rate come off, it is frequently not your biggest channel by money in the bank. Meesho at 12% on smaller tickets often beats it. This screen sorts by payout, which is why the order here surprises people.',
  parityNote:'Myntra, Amazon and Flipkart all read each other’s prices. A saree left at ₹4,499 from a Myntra event while Ajio still shows ₹5,299 gets the Ajio listing pushed down or suppressed — and Ajio is a 28% channel you are paying to be visible on. Level the price and both listings survive.',
  wiring:[
    {f:'Gross ordered',s:'This app (it owns the marketplace order)',h:'Every live order: quantity × rate'},
    {f:'Commission',s:'Panel rate card in this app',h:'That panel’s percentage of the order’s gross — Myntra 30%, Meesho 12%, and so on'},
    {f:'Shipping fee',s:'Panel rate card in this app',h:'A flat per-order fee, set per panel'},
    {f:'What reaches you',s:'This app',h:'Gross − commission − shipping fee, worked out per order and never stored'},
    {f:'Time left to dispatch',s:'This app',h:'That panel’s dispatch window minus the order’s age in hours — Amazon 12h, Ajio 48h'},
    {f:'Past the window',s:'This app',h:'An order still to dispatch whose time left has gone below zero'},
    {f:'Stock',s:'Inventory (one shared number)',h:'Falls on sale; comes back on a cancellation or a return'},
    {f:'Price on each panel',s:'Catalog + per-panel override',h:'List price unless a panel override exists; the spread is highest minus lowest'},
    {f:'Returns',s:'This app + Logistics',h:'Recorded against the panel it came from, at that panel’s commission rate'},
    {f:'Settlement',s:'Settlement module',h:'This app says what the payout should be; Settlement checks what Myntra actually paid'},
    {f:'Books',s:'Accounting &amp; GST',h:'Sale at gross, commission and fee as expenses — so the ledger and the settlement agree'}],
  wiringIn:[
    {from:'Catalog',what:'The design, its website list price and which panels it is listed on'},
    {from:'Inventory',what:'The one stock number all seven panels read'},
    {from:'Logistics',what:'The courier, the AWB and whether the parcel was accepted'},
    {from:'Settlement',what:'What each panel actually paid, to check against the expected payout'},
    {from:'Accounting &amp; GST',what:'Where the sale, the commission and the fee land in the books'}]
};
