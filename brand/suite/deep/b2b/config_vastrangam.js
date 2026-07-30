/* Format B — Vastrangam (wholesale to boutiques, chains and Surat trade). */
var CONFIG={
  id:'b2b_vastrangam', name:'B2B & Credit', company:'Vastrangam', fy:'FY 2026-27', prefix:'VB-',
  tagline:'Boutique and chain indents with a real credit limit — over it, nothing ships.',
  about:'Vastrangam’s wholesale side — boutiques, chains and the Surat trade. Every buyer sits on a tier, and the tier decides the rate — nobody types a price, so the price list cannot quietly fall apart. Every buyer has a credit limit, and the check on it is a gate rather than a warning: an order that would take a buyer over their limit goes on hold instead of being approved. It is not lost, and it is not silently allowed either. Ageing is measured against each buyer’s own agreed terms, so a 45-day buyer is never called late on day 31, and a 15-day buyer is not given 30 days by accident.',
  tiers:[
    {code:'A',name:'Chain / key account',off:12,note:'Indents every month, pays on time'},
    {code:'B',name:'Established boutique',off:8,note:'Steady, occasional slippage'},
    {code:'C',name:'New boutique',off:4,note:'Earning their way up'}],
  items:[
    {sku:'VS-KUR-01',name:'Cotton kurta set',rate:1200},
    {sku:'VS-SAR-02',name:'Banarasi saree',rate:3400},
    {sku:'VS-DUP-03',name:'Zari dupatta',rate:600},
    {sku:'VS-LEH-04',name:'Bridal lehenga',rate:8900}],
  buyers:[
    {id:'B1',name:'Kalamandir Chain (Hyderabad)',tier:'A',limit:900000,terms:45},
    {id:'B2',name:'Rajmandir Wholesale (Surat)',tier:'A',limit:700000,terms:30},
    {id:'B3',name:'Anokhi Boutique (Jaipur)',tier:'B',limit:400000,terms:30},
    {id:'B4',name:'Kanchan Sarees (Kolkata)',tier:'B',limit:300000,terms:15},
    {id:'B5',name:'Rangoli Boutique (Jaipur)',tier:'C',limit:150000,terms:15}],
  orders:[
    {id:'VB-701',buyer:'B1',date:'2026-05-02',sku:'VS-SAR-02',qty:60,status:'invoiced'},
    {id:'VB-702',buyer:'B1',date:'2026-07-14',sku:'VS-KUR-01',qty:120,status:'invoiced'},
    {id:'VB-703',buyer:'B2',date:'2026-04-18',sku:'VS-LEH-04',qty:24,status:'invoiced'},
    {id:'VB-704',buyer:'B2',date:'2026-07-22',sku:'VS-DUP-03',qty:200,status:'dispatched'},
    {id:'VB-705',buyer:'B3',date:'2026-06-11',sku:'VS-SAR-02',qty:40,status:'invoiced'},
    {id:'VB-706',buyer:'B3',date:'2026-07-28',sku:'VS-KUR-01',qty:80,status:'approved'},
    {id:'VB-707',buyer:'B4',date:'2026-07-01',sku:'VS-DUP-03',qty:150,status:'invoiced'},
    {id:'VB-708',buyer:'B4',date:'2026-07-30',sku:'VS-KUR-01',qty:50,status:'draft'},
    {id:'VB-709',buyer:'B5',date:'2026-03-20',sku:'VS-KUR-01',qty:60,status:'invoiced'},
    {id:'VB-710',buyer:'B5',date:'2026-07-29',sku:'VS-DUP-03',qty:40,status:'draft'},
    {id:'VB-711',buyer:'B1',date:'2026-06-28',sku:'VS-LEH-04',qty:30,status:'paid'},
    {id:'VB-712',buyer:'B2',date:'2026-05-30',sku:'VS-SAR-02',qty:35,status:'paid'}],
  wiring:[
    {f:'Order value',s:'This app + the price list',h:'Quantity × the buyer’s tier rate. The rate is never typed in.'},
    {f:'What you gave up',s:'Tier rules',h:'List price minus tier price, so the cost of the discount is visible'},
    {f:'Exposure (owes you now)',s:'This app',h:'Every order approved or later, and not yet paid, added up per buyer'},
    {f:'Headroom left',s:'This app',h:'The buyer’s credit limit minus their exposure'},
    {f:'Credit decision',s:'This app',h:'Order value must fit inside the headroom, or the order goes on hold'},
    {f:'Invoiced, unpaid',s:'Accounts Receivable',h:'Every invoice raised and not yet settled'},
    {f:'Past terms by',s:'This app + buyer master',h:'Days since the invoice, minus that buyer’s own agreed terms'},
    {f:'Ageing buckets',s:'All of the above',h:'Not yet due · 1–30 · 31–60 · 61–90 · over 90, by days past terms'},
    {f:'Stock movement',s:'Inventory',h:'Leaves on dispatch, not on approval'},
    {f:'Ledger entry',s:'Accounting &amp; GST',h:'Posted when the invoice is raised, cleared when it is paid'}],
  wiringIn:[
    {from:'Catalog',what:'The design’s list price every tier rate is worked out from'},
    {from:'CRM',what:'Who the boutique is and their indent history'},
    {from:'Inventory',what:'Whether finished pieces exist to dispatch'},
    {from:'Accounting &amp; GST',what:'Whether the invoice was actually settled'},
    {from:'Logistics',what:'The dispatch and the delivery proof'}]
};
