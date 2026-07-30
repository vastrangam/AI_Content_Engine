/* Format A — Unified ERP (any industry). Neutral names; drop-in for any counter. */
var CONFIG={
  id:'pos_erp', name:'POS', company:'Acme Corp', fy:'FY 2026-27', prefix:'BILL-',
  opening:5000,
  tagline:'Counter billing on the same stock number your website reads.',
  about:'A till that cannot lie to the rest of the business. The price comes from the Catalog rather than from whoever is standing at the counter, so the shop cannot quietly undercut the website. The discount is capped at 50% and printed on the bill. GST is worked out on the discounted value, never on the gross. Payment can be split any way the customer wants — part cash, part UPI, part on account — and the bill will not print until the full amount is covered. Stock comes off the one shared number every channel reads, so selling the last piece at the counter stops the website selling it thirty seconds later. And at close, only the cash is expected in the drawer, so a gap is found the same day rather than in a monthly audit.',
  items:[
    {sku:'FG-101',name:'Standard product',rate:1799,qty:24,rop:8},
    {sku:'FG-102',name:'Premium product',rate:4999,qty:11,rop:4},
    {sku:'FG-103',name:'Accessory',rate:899,qty:6,rop:10},
    {sku:'FG-104',name:'Top-of-range product',rate:12999,qty:3,rop:2}],
  bills:[
    {id:'BILL-101',time:'2026-07-31 10:42',cust:'Walk-in',disc:0,
     lines:[{sku:'FG-101',name:'Standard product',rate:1799,qty:1}],tender:{cash:1890}},
    {id:'BILL-102',time:'2026-07-31 11:58',cust:'Walk-in',disc:10,
     lines:[{sku:'FG-102',name:'Premium product',rate:4999,qty:1},{sku:'FG-103',name:'Accessory',rate:899,qty:1}],
     tender:{upi:5575}},
    {id:'BILL-103',time:'2026-07-31 13:15',cust:'Walk-in',disc:0,
     lines:[{sku:'FG-103',name:'Accessory',rate:899,qty:2}],tender:{cash:1000,upi:888}},
    {id:'BILL-104',time:'2026-07-31 16:04',cust:'Northline Retail',disc:5,
     lines:[{sku:'FG-104',name:'Top-of-range product',rate:12999,qty:1}],tender:{card:6000,credit:6968}},
    {id:'BILL-105',time:'2026-07-31 18:22',cust:'Walk-in',disc:0,
     lines:[{sku:'FG-101',name:'Standard product',rate:1799,qty:2}],tender:{cash:4000}}],
  closeNote:'Counting the drawer takes two minutes and it is the only moment in the day when the money and the paperwork are forced to agree. Skip it for a week and any gap becomes untraceable — you no longer know which day, which shift or which bill it came from.',
  wiring:[
    {f:'Item price',s:'Catalog',h:'Read from the price list. Nobody types a price at the till.'},
    {f:'Line total',s:'This app',h:'Quantity × the catalog rate'},
    {f:'Discount',s:'This app',h:'A percentage of gross, capped at 50%, and printed on the bill'},
    {f:'GST',s:'This app + tax rules',h:'5% of the value AFTER discount — never on the gross'},
    {f:'Bill total',s:'This app',h:'Taxable value + GST'},
    {f:'Stock on the counter',s:'Inventory',h:'The one shared number. Falls when a bill prints, and the website reads the same figure'},
    {f:'Cash expected in the drawer',s:'This app',h:'Opening float + the cash part of every bill. UPI, card and on-account are excluded'},
    {f:'Over / short',s:'This app',h:'What you counted minus what should be there'},
    {f:'On account',s:'Accounts Receivable',h:'Becomes a receivable against that customer — it is not money yet'},
    {f:'Sale and GST in the books',s:'Accounting',h:'Posted when the bill prints'}],
  wiringIn:[
    {from:'Catalog',what:'Every item and its selling price'},
    {from:'Inventory',what:'The one stock number every channel shares'},
    {from:'Payments',what:'Whether the UPI or card payment actually landed'},
    {from:'CRM',what:'The customer, when a bill goes on account'},
    {from:'Accounting',what:'Where the sale, the GST and the till difference are posted'}]
};
