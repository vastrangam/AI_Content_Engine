/* Format A — Unified ERP (any industry). Neutral names; drop-in for any business selling wholesale. */
var CONFIG={
  id:'b2b_erp', name:'B2B & Credit', company:'Acme Corp', fy:'FY 2026-27', prefix:'WO-',
  tagline:'Wholesale orders with a real credit limit — over it, nothing ships.',
  about:'The buy-in-bulk side of selling. Every buyer sits on a tier, and the tier decides the rate — nobody types a price, so the price list cannot quietly fall apart. Every buyer has a credit limit, and the check on it is a gate rather than a warning: an order that would take a buyer over their limit goes on hold instead of being approved. It is not lost, and it is not silently allowed either. Ageing is measured against each buyer’s own agreed terms, so a 45-day buyer is never called late on day 31, and a 15-day buyer is not given 30 days by accident.',
  tiers:[
    {code:'A',name:'Key account',off:12,note:'Volume every month, pays on time'},
    {code:'B',name:'Regular trade',off:8,note:'Steady, occasional slippage'},
    {code:'C',name:'New / small',off:4,note:'Earning their way up'}],
  items:[
    {sku:'FG-101',name:'Standard product',rate:1200},
    {sku:'FG-102',name:'Premium product',rate:3400},
    {sku:'FG-103',name:'Accessory',rate:600},
    {sku:'FG-104',name:'Top-of-range product',rate:8900}],
  buyers:[
    {id:'B1',name:'Northline Retail Pvt Ltd',tier:'A',limit:900000,terms:45},
    {id:'B2',name:'Metro Distributors',tier:'A',limit:700000,terms:30},
    {id:'B3',name:'Harbour Trading Co',tier:'B',limit:400000,terms:30},
    {id:'B4',name:'Sunrise Enterprises',tier:'B',limit:300000,terms:15},
    {id:'B5',name:'Crestline Traders',tier:'C',limit:150000,terms:15}],
  orders:[
    {id:'WO-701',buyer:'B1',date:'2026-05-02',sku:'FG-102',qty:60,status:'invoiced'},
    {id:'WO-702',buyer:'B1',date:'2026-07-14',sku:'FG-101',qty:120,status:'invoiced'},
    {id:'WO-703',buyer:'B2',date:'2026-04-18',sku:'FG-104',qty:24,status:'invoiced'},
    {id:'WO-704',buyer:'B2',date:'2026-07-22',sku:'FG-103',qty:200,status:'dispatched'},
    {id:'WO-705',buyer:'B3',date:'2026-06-11',sku:'FG-102',qty:40,status:'invoiced'},
    {id:'WO-706',buyer:'B3',date:'2026-07-28',sku:'FG-101',qty:80,status:'approved'},
    {id:'WO-707',buyer:'B4',date:'2026-07-01',sku:'FG-103',qty:150,status:'invoiced'},
    {id:'WO-708',buyer:'B4',date:'2026-07-30',sku:'FG-101',qty:50,status:'draft'},
    {id:'WO-709',buyer:'B5',date:'2026-03-20',sku:'FG-101',qty:60,status:'invoiced'},
    {id:'WO-710',buyer:'B5',date:'2026-07-29',sku:'FG-103',qty:40,status:'draft'},
    {id:'WO-711',buyer:'B1',date:'2026-06-28',sku:'FG-104',qty:30,status:'paid'},
    {id:'WO-712',buyer:'B2',date:'2026-05-30',sku:'FG-102',qty:35,status:'paid'}],
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
    {f:'Ledger entry',s:'Accounting',h:'Posted when the invoice is raised, cleared when it is paid'}],
  wiringIn:[
    {from:'Catalog',what:'The list price every tier rate is worked out from'},
    {from:'CRM',what:'Who the buyer is and their trading history'},
    {from:'Inventory',what:'Whether there is stock to dispatch'},
    {from:'Accounting',what:'Whether the invoice was actually settled'},
    {from:'Logistics',what:'The dispatch and the delivery proof'}]
};
