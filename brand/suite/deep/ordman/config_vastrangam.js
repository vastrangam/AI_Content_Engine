/* Format B — Vastrangam (ethnic wear). Real designs, real warehouses, real transit days across India. */
var CONFIG={
  id:'ordman_vastrangam', name:'Order Management', company:'Vastrangam', fy:'FY 2026-27',
  tagline:'One order book for vastrangam.com, the marketplaces, the counter, wholesale and WhatsApp — with the promise date worked out, never typed.',
  about:'Every Vastrangam order in one book, whichever way it came in. Two decisions decide whether the customer is happy, and both of them happen in the open here. The first is WHICH warehouse it ships from — Delhi, Mumbai or Bengaluru — chosen as the fastest one that actually holds the piece, checked against the real figure on that shelf, so nobody is sent to pick a Banarasi saree that is not there. The second is WHAT DATE she was given: the 2pm cut-off plus that warehouse’s transit days to her zone. A lehenga going to Guwahati is six days from Delhi and seven from Mumbai, and nobody types that date, so nobody can promise Tuesday to a zone the courier reaches on Friday. An order no warehouse can serve is shown with no date at all instead of a hopeful one. And after the sale the sequence never bends: parcel back, then somebody actually opens it, then the money goes out — a resaleable piece returns to the warehouse it left, a creased or stained one is written off rather than quietly added back as stock that does not exist.',
  today:'2026-07-31', cutoffHr:14, damagedPct:50, retAlertPct:25,
  locs:[
    {code:'W1',name:'Delhi warehouse',city:'Delhi NCR'},
    {code:'W2',name:'Mumbai warehouse',city:'Mumbai'},
    {code:'W3',name:'Bengaluru warehouse',city:'Bengaluru'}],
  zones:[
    {code:'Z-N',name:'North'},
    {code:'Z-W',name:'West'},
    {code:'Z-S',name:'South'},
    {code:'Z-E',name:'East'},
    {code:'Z-NE',name:'North-east & hills'}],
  /* Days from each warehouse to each zone, as the couriers actually run them. */
  transit:{
    W1:{'Z-N':1,'Z-W':3,'Z-S':4,'Z-E':3,'Z-NE':6},
    W2:{'Z-N':3,'Z-W':1,'Z-S':3,'Z-E':4,'Z-NE':7},
    W3:{'Z-N':4,'Z-W':3,'Z-S':1,'Z-E':4,'Z-NE':7}},
  channels:[
    {code:'CH-WEB',name:'vastrangam.com',kind:'direct, no commission'},
    {code:'CH-MKT',name:'Marketplaces',kind:'Myntra, Amazon, Ajio — commission and returns'},
    {code:'CH-RET',name:'Showroom counter',kind:'paid and carried away'},
    {code:'CH-B2B',name:'Wholesale / boutiques',kind:'bulk, on credit terms'},
    {code:'CH-SOC',name:'Instagram & WhatsApp',kind:'direct, orders taken by hand'}],
  items:[
    {sku:'VS-KUR-01',name:'Cotton kurta set',rate:1799},
    {sku:'VS-SAR-02',name:'Banarasi saree',rate:4999},
    {sku:'VS-DUP-03',name:'Zari dupatta',rate:899},
    {sku:'VS-LEH-04',name:'Bridal lehenga',rate:12999}],
  /* Free pieces on each shelf right now. The zari dupatta is out everywhere — a real backorder. */
  stockAt:{
    'VS-KUR-01':{W1:14,W2:9,W3:6},
    'VS-SAR-02':{W1:3,W2:2,W3:0},
    'VS-DUP-03':{W1:0,W2:0,W3:0},
    'VS-LEH-04':{W1:1,W2:0,W3:2}},
  /* hr is the hour of day the order came in. Before 2pm it goes out the same day. */
  orders:[
    {id:'VS-O-7101',cust:'Ananya Rao',channel:'CH-WEB',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,city:'Guwahati',zone:'Z-NE',date:'2026-07-30',hr:11,status:'new',loc:'',doneOn:'',recv:false,insp:'',refund:0},
    {id:'VS-O-7102',cust:'Rohit Verma',channel:'CH-MKT',sku:'VS-KUR-01',name:'Cotton kurta set',qty:2,rate:1799,city:'Chennai',zone:'Z-S',date:'2026-07-29',hr:16,status:'new',loc:'',doneOn:'',recv:false,insp:'',refund:0},
    {id:'VS-O-7103',cust:'Bandhej House (Jodhpur)',channel:'CH-B2B',sku:'VS-KUR-01',name:'Cotton kurta set',qty:12,rate:1799,city:'Pune',zone:'Z-W',date:'2026-07-26',hr:9,status:'new',loc:'',doneOn:'',recv:false,insp:'',refund:0},
    {id:'VS-O-7104',cust:'Sneha Iyer',channel:'CH-RET',sku:'VS-DUP-03',name:'Zari dupatta',qty:1,rate:899,city:'Jaipur',zone:'Z-N',date:'2026-07-31',hr:10,status:'new',loc:'',doneOn:'',recv:false,insp:'',refund:0},
    {id:'VS-O-7105',cust:'Karan Mehta',channel:'CH-SOC',sku:'VS-LEH-04',name:'Bridal lehenga',qty:1,rate:12999,city:'Mysuru',zone:'Z-S',date:'2026-07-30',hr:13,status:'new',loc:'',doneOn:'',recv:false,insp:'',refund:0},
    {id:'VS-O-7106',cust:'Divya Nair',channel:'CH-WEB',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,city:'Surat',zone:'Z-W',date:'2026-07-29',hr:10,status:'allocated',loc:'W2',doneOn:'',recv:false,insp:'',refund:0},
    {id:'VS-O-7107',cust:'Meera Joshi',channel:'CH-MKT',sku:'VS-KUR-01',name:'Cotton kurta set',qty:1,rate:1799,city:'Lucknow',zone:'Z-N',date:'2026-07-31',hr:9,status:'allocated',loc:'W1',doneOn:'',recv:false,insp:'',refund:0},
    {id:'VS-O-7108',cust:'Kolkata Silks (boutique)',channel:'CH-B2B',sku:'VS-KUR-01',name:'Cotton kurta set',qty:6,rate:1799,city:'Kolkata',zone:'Z-E',date:'2026-07-30',hr:12,status:'packed',loc:'W1',doneOn:'',recv:false,insp:'',refund:0},
    {id:'VS-O-7109',cust:'Tanvi Shah',channel:'CH-WEB',sku:'VS-LEH-04',name:'Bridal lehenga',qty:1,rate:12999,city:'Chandigarh',zone:'Z-N',date:'2026-07-30',hr:15,status:'packed',loc:'W1',doneOn:'',recv:false,insp:'',refund:0},
    {id:'VS-O-7110',cust:'Vikram Sethi',channel:'CH-WEB',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,city:'Kochi',zone:'Z-S',date:'2026-07-28',hr:10,status:'shipped',loc:'W3',doneOn:'',recv:false,insp:'',refund:0},
    {id:'VS-O-7111',cust:'Neha Bhatt',channel:'CH-SOC',sku:'VS-KUR-01',name:'Cotton kurta set',qty:1,rate:1799,city:'Nashik',zone:'Z-W',date:'2026-07-30',hr:11,status:'shipped',loc:'W2',doneOn:'',recv:false,insp:'',refund:0},
    {id:'VS-O-7112',cust:'Arjun Pillai',channel:'CH-WEB',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,city:'Noida',zone:'Z-N',date:'2026-07-20',hr:10,status:'delivered',loc:'W1',doneOn:'2026-07-21',recv:false,insp:'',refund:0},
    {id:'VS-O-7113',cust:'Ritu Saxena',channel:'CH-MKT',sku:'VS-KUR-01',name:'Cotton kurta set',qty:2,rate:1799,city:'Coimbatore',zone:'Z-S',date:'2026-07-18',hr:16,status:'delivered',loc:'W1',doneOn:'2026-07-24',recv:false,insp:'',refund:0},
    {id:'VS-O-7114',cust:'Sameer Khan',channel:'CH-RET',sku:'VS-KUR-01',name:'Cotton kurta set',qty:1,rate:1799,city:'Gurugram',zone:'Z-N',date:'2026-07-22',hr:11,status:'delivered',loc:'W1',doneOn:'2026-07-23',recv:false,insp:'',refund:0},
    {id:'VS-O-7115',cust:'Konkan Sarees (Thane)',channel:'CH-B2B',sku:'VS-LEH-04',name:'Bridal lehenga',qty:1,rate:12999,city:'Thane',zone:'Z-W',date:'2026-07-15',hr:9,status:'delivered',loc:'W2',doneOn:'2026-07-16',recv:false,insp:'',refund:0},
    {id:'VS-O-7116',cust:'Pooja Menon',channel:'CH-MKT',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,city:'Faridabad',zone:'Z-N',date:'2026-07-12',hr:10,status:'returned',loc:'W1',doneOn:'2026-07-13',recv:true,insp:'',refund:0},
    {id:'VS-O-7117',cust:'Harsh Agarwal',channel:'CH-WEB',sku:'VS-KUR-01',name:'Cotton kurta set',qty:1,rate:1799,city:'Vadodara',zone:'Z-W',date:'2026-07-14',hr:12,status:'returned',loc:'W2',doneOn:'2026-07-15',recv:false,insp:'',refund:0},
    {id:'VS-O-7118',cust:'Lata Kulkarni',channel:'CH-MKT',sku:'VS-DUP-03',name:'Zari dupatta',qty:1,rate:899,city:'Madurai',zone:'Z-S',date:'2026-07-10',hr:10,status:'rto',loc:'W3',doneOn:'',recv:true,insp:'damaged',refund:0},
    {id:'VS-O-7119',cust:'Faiz Ahmed',channel:'CH-SOC',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,city:'Patna',zone:'Z-E',date:'2026-07-27',hr:11,status:'cancelled',loc:'',doneOn:'',recv:false,insp:'',refund:0},
    /* The teaching order. Bengaluru is one day from Hyderabad but holds no sarees, so this one
       would go three days from Mumbai. Move one saree south and her date moves with it. */
    {id:'VS-O-7120',cust:'Shalini Reddy',channel:'CH-WEB',sku:'VS-SAR-02',name:'Banarasi saree',qty:1,rate:4999,city:'Hyderabad',zone:'Z-S',date:'2026-07-31',hr:10,status:'new',loc:'',doneOn:'',recv:false,insp:'',refund:0}],
  chanNote:'Five channels, one book. They behave nothing like each other — a showroom sale is finished the moment it is paid for, a Myntra order comes back one time in four, and a boutique order is a credit decision before it is a fulfilment one. Keeping them in one book is what lets you compare them; keeping them in one PROCESS is what stops the festive season from breaking you.',
  refundNote:'Every rupee in “refunds still owed” is money a customer is waiting for. In ethnic wear the inspection step is not a formality — a saree that comes back with a pulled zari or a make-up mark on the pallu is not resaleable at ₹4,999, and adding it back to stock at full value is how a healthy-looking inventory turns out to be worth half of what the report says.',
  promiseNote:'The most expensive habit in Indian D2C is a delivery date typed by whoever wanted the sale. Once the date is derived, the argument moves to where it belongs: which warehouse holds the piece, and whether the courier can actually reach that pin code in time.',
  backNote:'There is not one piece at any of the three warehouses, so no date is possible. This needs a production order, not a promise — and nothing is gained by giving her a date in the meantime.',
  wiring:[
    {f:'Order book value',s:'This app (it owns the order)',h:'Every live order: quantity × rate — cancellations and returns are out'},
    {f:'Which warehouse it ships from',s:'This app + Inventory',h:'The fastest warehouse whose real figure covers the quantity ordered'},
    {f:'Dispatch date',s:'This app',h:'Same day before the 2pm cut-off, the next day after it'},
    {f:'Promise date',s:'This app + the transit matrix',h:'Dispatch date + that warehouse’s transit days to that zone — recomputed on every read'},
    {f:'Cannot be promised',s:'Inventory &amp; Catalog (finished pieces)',h:'No warehouse holds enough; the order is shown with no date rather than a hopeful one'},
    {f:'Stock at each warehouse',s:'Inventory &amp; Catalog / Warehouse',h:'Falls where the order is allocated; comes back on a cancellation or a resaleable return'},
    {f:'Arrived on time',s:'This app + Logistics',h:'Delivery date against the promise date — the promise is never re-written to match'},
    {f:'Returns and refused deliveries',s:'Logistics',h:'Both become returns; a refused COD parcel is never counted as a delivery'},
    {f:'Refund owed',s:'This app',h:'Full value if resaleable, '+'50% if it came back damaged — and only after the parcel is in and opened'},
    {f:'Refund paid',s:'Payments (UPI or gateway)',h:'Money out, recorded against the order it belongs to'},
    {f:'Books',s:'Accounting &amp; GST',h:'Sale on delivery, refund as a credit note, damaged pieces as a write-off'}],
  wiringIn:[
    {from:'Catalog',what:'The design, its name and its selling price'},
    {from:'Inventory &amp; Catalog',what:'How many finished pieces each warehouse actually holds'},
    {from:'Logistics',what:'The courier, the transit days per zone and whether the parcel was accepted'},
    {from:'Payments',what:'Whether the UPI or gateway payment landed, and whether the refund went out'},
    {from:'CRM',what:'Who the buyer is, and what she has returned before'}]
};
