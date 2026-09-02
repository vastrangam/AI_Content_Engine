/* Format A — Unified ERP (any industry). Neutral names; drop-in for any business selling through more than one channel. */
var CONFIG={
  id:'ordman_erp', name:'Order Management', company:'Acme Corp', fy:'FY 2026-27',
  tagline:'One order book for every channel — with the warehouse chosen for you and the promise date worked out, never typed.',
  about:'Website, marketplaces, the counter, wholesale and WhatsApp all land in one order book. Two decisions then determine whether the customer is happy, and this app makes both of them out in the open. The first is WHERE the order ships from: the fastest warehouse that actually holds the pieces, checked against the real figure at that location, so a picker is never sent to an empty shelf. The second is WHAT DATE the customer was given: the cut-off plus that warehouse’s transit days to that zone. Nobody types a promise date here — so nobody can promise Tuesday to a zone that is four days away, and changing the warehouse changes the date in the same instant. An order that no warehouse can serve is shown as exactly that, with no date at all, instead of being given a hopeful one. And after the sale the sequence never bends: parcel back, then somebody looks at it, then the money goes out — a resaleable piece returns to the warehouse it left, a damaged one is written off rather than quietly added back as phantom stock.',
  today:'2026-07-31', cutoffHr:14, damagedPct:50, retAlertPct:25,
  locs:[
    {code:'W1',name:'North warehouse',city:'Delhi NCR'},
    {code:'W2',name:'West warehouse',city:'Mumbai'},
    {code:'W3',name:'South warehouse',city:'Bengaluru'}],
  zones:[
    {code:'Z-N',name:'North'},
    {code:'Z-W',name:'West'},
    {code:'Z-S',name:'South'},
    {code:'Z-E',name:'East'},
    {code:'Z-NE',name:'North-east & hills'}],
  /* Days from each warehouse to each zone. This one table is why allocation matters. */
  transit:{
    W1:{'Z-N':1,'Z-W':3,'Z-S':4,'Z-E':3,'Z-NE':6},
    W2:{'Z-N':3,'Z-W':1,'Z-S':3,'Z-E':4,'Z-NE':7},
    W3:{'Z-N':4,'Z-W':3,'Z-S':1,'Z-E':4,'Z-NE':7}},
  channels:[
    {code:'CH-WEB',name:'Own website',kind:'direct, no commission'},
    {code:'CH-MKT',name:'Marketplaces',kind:'commission and high returns'},
    {code:'CH-RET',name:'Retail counter',kind:'paid and taken away'},
    {code:'CH-B2B',name:'Wholesale / B2B',kind:'bulk, on credit terms'},
    {code:'CH-SOC',name:'Social & WhatsApp',kind:'direct, manual orders'}],
  items:[
    {sku:'FG-101',name:'Standard product',rate:1799},
    {sku:'FG-102',name:'Premium product',rate:4999},
    {sku:'FG-103',name:'Accessory',rate:899},
    {sku:'FG-104',name:'Top-of-range product',rate:12999}],
  /* Free pieces at each warehouse right now. FG-103 is nothing anywhere — that is a real backorder. */
  stockAt:{
    'FG-101':{W1:14,W2:9,W3:6},
    'FG-102':{W1:3,W2:2,W3:0},
    'FG-103':{W1:0,W2:0,W3:0},
    'FG-104':{W1:1,W2:0,W3:2}},
  /* hr is the hour of day the order arrived. Before the cut-off it goes out the same day. */
  orders:[
    {id:'OM-7101',cust:'Ananya Rao',channel:'CH-WEB',sku:'FG-102',name:'Premium product',qty:1,rate:4999,city:'Guwahati',zone:'Z-NE',date:'2026-07-30',hr:11,status:'new',loc:'',doneOn:'',recv:false,insp:'',refund:0},
    {id:'OM-7102',cust:'Rohit Verma',channel:'CH-MKT',sku:'FG-101',name:'Standard product',qty:2,rate:1799,city:'Chennai',zone:'Z-S',date:'2026-07-29',hr:16,status:'new',loc:'',doneOn:'',recv:false,insp:'',refund:0},
    {id:'OM-7103',cust:'Sunrise Traders',channel:'CH-B2B',sku:'FG-101',name:'Standard product',qty:12,rate:1799,city:'Pune',zone:'Z-W',date:'2026-07-26',hr:9,status:'new',loc:'',doneOn:'',recv:false,insp:'',refund:0},
    {id:'OM-7104',cust:'Sneha Iyer',channel:'CH-RET',sku:'FG-103',name:'Accessory',qty:1,rate:899,city:'Jaipur',zone:'Z-N',date:'2026-07-31',hr:10,status:'new',loc:'',doneOn:'',recv:false,insp:'',refund:0},
    {id:'OM-7105',cust:'Karan Mehta',channel:'CH-SOC',sku:'FG-104',name:'Top-of-range product',qty:1,rate:12999,city:'Mysuru',zone:'Z-S',date:'2026-07-30',hr:13,status:'new',loc:'',doneOn:'',recv:false,insp:'',refund:0},
    {id:'OM-7106',cust:'Divya Nair',channel:'CH-WEB',sku:'FG-102',name:'Premium product',qty:1,rate:4999,city:'Surat',zone:'Z-W',date:'2026-07-29',hr:10,status:'allocated',loc:'W2',doneOn:'',recv:false,insp:'',refund:0},
    {id:'OM-7107',cust:'Meera Joshi',channel:'CH-MKT',sku:'FG-101',name:'Standard product',qty:1,rate:1799,city:'Lucknow',zone:'Z-N',date:'2026-07-31',hr:9,status:'allocated',loc:'W1',doneOn:'',recv:false,insp:'',refund:0},
    {id:'OM-7108',cust:'Eastern Retail Co',channel:'CH-B2B',sku:'FG-101',name:'Standard product',qty:6,rate:1799,city:'Kolkata',zone:'Z-E',date:'2026-07-30',hr:12,status:'packed',loc:'W1',doneOn:'',recv:false,insp:'',refund:0},
    {id:'OM-7109',cust:'Tanvi Shah',channel:'CH-WEB',sku:'FG-104',name:'Top-of-range product',qty:1,rate:12999,city:'Chandigarh',zone:'Z-N',date:'2026-07-30',hr:15,status:'packed',loc:'W1',doneOn:'',recv:false,insp:'',refund:0},
    {id:'OM-7110',cust:'Vikram Sethi',channel:'CH-WEB',sku:'FG-102',name:'Premium product',qty:1,rate:4999,city:'Kochi',zone:'Z-S',date:'2026-07-28',hr:10,status:'shipped',loc:'W3',doneOn:'',recv:false,insp:'',refund:0},
    {id:'OM-7111',cust:'Neha Bhatt',channel:'CH-SOC',sku:'FG-101',name:'Standard product',qty:1,rate:1799,city:'Nashik',zone:'Z-W',date:'2026-07-30',hr:11,status:'shipped',loc:'W2',doneOn:'',recv:false,insp:'',refund:0},
    {id:'OM-7112',cust:'Arjun Pillai',channel:'CH-WEB',sku:'FG-102',name:'Premium product',qty:1,rate:4999,city:'Noida',zone:'Z-N',date:'2026-07-20',hr:10,status:'delivered',loc:'W1',doneOn:'2026-07-21',recv:false,insp:'',refund:0},
    {id:'OM-7113',cust:'Ritu Saxena',channel:'CH-MKT',sku:'FG-101',name:'Standard product',qty:2,rate:1799,city:'Coimbatore',zone:'Z-S',date:'2026-07-18',hr:16,status:'delivered',loc:'W1',doneOn:'2026-07-24',recv:false,insp:'',refund:0},
    {id:'OM-7114',cust:'Sameer Khan',channel:'CH-RET',sku:'FG-101',name:'Standard product',qty:1,rate:1799,city:'Gurugram',zone:'Z-N',date:'2026-07-22',hr:11,status:'delivered',loc:'W1',doneOn:'2026-07-23',recv:false,insp:'',refund:0},
    {id:'OM-7115',cust:'Konkan Distributors',channel:'CH-B2B',sku:'FG-104',name:'Top-of-range product',qty:1,rate:12999,city:'Thane',zone:'Z-W',date:'2026-07-15',hr:9,status:'delivered',loc:'W2',doneOn:'2026-07-16',recv:false,insp:'',refund:0},
    {id:'OM-7116',cust:'Pooja Menon',channel:'CH-MKT',sku:'FG-102',name:'Premium product',qty:1,rate:4999,city:'Faridabad',zone:'Z-N',date:'2026-07-12',hr:10,status:'returned',loc:'W1',doneOn:'2026-07-13',recv:true,insp:'',refund:0},
    {id:'OM-7117',cust:'Harsh Agarwal',channel:'CH-WEB',sku:'FG-101',name:'Standard product',qty:1,rate:1799,city:'Vadodara',zone:'Z-W',date:'2026-07-14',hr:12,status:'returned',loc:'W2',doneOn:'2026-07-15',recv:false,insp:'',refund:0},
    {id:'OM-7118',cust:'Lata Kulkarni',channel:'CH-MKT',sku:'FG-103',name:'Accessory',qty:1,rate:899,city:'Madurai',zone:'Z-S',date:'2026-07-10',hr:10,status:'rto',loc:'W3',doneOn:'',recv:true,insp:'damaged',refund:0},
    {id:'OM-7119',cust:'Faiz Ahmed',channel:'CH-SOC',sku:'FG-102',name:'Premium product',qty:1,rate:4999,city:'Patna',zone:'Z-E',date:'2026-07-27',hr:11,status:'cancelled',loc:'',doneOn:'',recv:false,insp:'',refund:0},
    /* The teaching order. The South warehouse is one day from this address but holds none of this
       item, so it would ship four days from Delhi. Move one piece south and the date changes. */
    {id:'OM-7120',cust:'Shalini Reddy',channel:'CH-WEB',sku:'FG-102',name:'Premium product',qty:1,rate:4999,city:'Hyderabad',zone:'Z-S',date:'2026-07-31',hr:10,status:'new',loc:'',doneOn:'',recv:false,insp:'',refund:0}],
  chanNote:'Five channels, one book. They behave nothing like each other — a counter sale is finished the moment it is paid for, a marketplace order comes back one time in four, and a wholesale order is a credit decision before it is a fulfilment one. Keeping them in one book is what makes the comparison possible; keeping them in one PROCESS is what makes it survivable.',
  refundNote:'Every rupee in “refunds still owed” is money a customer is expecting and has not received. It is a real liability, worked out from parcels that exist rather than from a policy document — and it cannot be paid down by accident, because the app will not release a refund on a parcel nobody has looked at.',
  promiseNote:'The single most expensive habit in order management is a promise date typed by a person who wanted the sale. Once the date is derived, the argument moves to where it belongs: which warehouse holds the stock, and whether the network can reach that zone in time.',
  backNote:'There are no pieces at any warehouse, so no date is possible. This needs a purchase or a production order, not a promise — and nothing is gained by giving the customer a date in the meantime.',
  wiring:[
    {f:'Order book value',s:'This app (it owns the order)',h:'Every live order: quantity × rate — cancellations and returns are out'},
    {f:'Which warehouse it ships from',s:'This app + Inventory',h:'The fastest warehouse whose real figure covers the quantity ordered'},
    {f:'Dispatch date',s:'This app',h:'Same day before the cut-off hour, the next day after it'},
    {f:'Promise date',s:'This app + the transit matrix',h:'Dispatch date + that warehouse’s transit days to that zone — recomputed on every read'},
    {f:'Cannot be promised',s:'Inventory',h:'No warehouse holds enough; the order is shown with no date rather than a hopeful one'},
    {f:'Stock at each warehouse',s:'Inventory &amp; Catalog / Warehouse',h:'Falls where the order is allocated; comes back on a cancellation or a resaleable return'},
    {f:'Arrived on time',s:'This app + Logistics',h:'Delivery date against the promise date — the promise is never re-written to match'},
    {f:'Returns and refused deliveries',s:'Logistics',h:'Both become returns; a refused delivery is never counted as a delivery'},
    {f:'Refund owed',s:'This app',h:'Full value if resaleable, the damaged-goods share if not — and only after the parcel is in and inspected'},
    {f:'Refund paid',s:'Payments',h:'Money out, recorded against the order it belongs to'},
    {f:'Books',s:'Accounting',h:'Sale on delivery, refund as a credit note, damaged stock as a write-off'}],
  wiringIn:[
    {from:'Catalog',what:'The item, its name and its selling price'},
    {from:'Inventory &amp; Catalog',what:'How many pieces each warehouse actually holds'},
    {from:'Logistics',what:'The courier, the transit days per zone and the delivery outcome'},
    {from:'Payments',what:'Whether the money came in, and whether the refund went out'},
    {from:'CRM',what:'Who the customer is, and what they have returned before'}]
};
