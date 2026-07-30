/* Format B — Vastrangam (the Surat showroom counter). */
var CONFIG={
  id:'pos_vastrangam', name:'POS', company:'Vastrangam', fy:'FY 2026-27', prefix:'VP-',
  opening:5000,
  tagline:'Counter billing on the same stock number your website reads.',
  about:'The Surat showroom counter, and a till that cannot lie to the rest of Vastrangam. The price comes from the Catalog rather than from whoever is standing at the counter, so the showroom cannot quietly undercut vastrangam.com. The discount is capped at 50% and printed on the bill. GST is worked out on the discounted value, never on the gross. Payment can be split any way the customer wants — part cash, part UPI, part on account — and the bill will not print until the full amount is covered. Stock comes off the one shared number every channel reads, so selling the last piece at the counter stops the website selling it thirty seconds later. And at close, only the cash is expected in the drawer, so a gap is found the same day rather than in a monthly audit.',
  items:[
    {sku:'VS-KUR-01',name:'Cotton kurta set',rate:1799,qty:24,rop:8},
    {sku:'VS-SAR-02',name:'Banarasi saree',rate:4999,qty:11,rop:4},
    {sku:'VS-DUP-03',name:'Zari dupatta',rate:899,qty:6,rop:10},
    {sku:'VS-LEH-04',name:'Bridal lehenga',rate:12999,qty:3,rop:2}],
  bills:[
    {id:'VP-101',time:'2026-07-31 10:42',cust:'Walk-in',disc:0,
     lines:[{sku:'VS-KUR-01',name:'Cotton kurta set',rate:1799,qty:1}],tender:{cash:1890}},
    {id:'VP-102',time:'2026-07-31 11:58',cust:'Walk-in',disc:10,
     lines:[{sku:'VS-SAR-02',name:'Banarasi saree',rate:4999,qty:1},{sku:'VS-DUP-03',name:'Zari dupatta',rate:899,qty:1}],
     tender:{upi:5575}},
    {id:'VP-103',time:'2026-07-31 13:15',cust:'Walk-in',disc:0,
     lines:[{sku:'VS-DUP-03',name:'Zari dupatta',rate:899,qty:2}],tender:{cash:1000,upi:888}},
    {id:'VP-104',time:'2026-07-31 16:04',cust:'Anokhi Boutique',disc:5,
     lines:[{sku:'VS-LEH-04',name:'Bridal lehenga',rate:12999,qty:1}],tender:{card:6000,credit:6968}},
    {id:'VP-105',time:'2026-07-31 18:22',cust:'Walk-in',disc:0,
     lines:[{sku:'VS-KUR-01',name:'Cotton kurta set',rate:1799,qty:2}],tender:{cash:4000}}],
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
