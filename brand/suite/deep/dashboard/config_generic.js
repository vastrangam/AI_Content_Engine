/* Format A — Unified ERP (any industry). Neutral names; the same engine runs a machine shop,
   a distributor, an exporter or a professional practice. Only this file changes. */
var CONFIG={
  id:'dashboard_erp', name:'CEO Dashboard', company:'Acme Corp', fy:'FY 2026-27',
  tagline:'One screen that answers: did we make money, is cash safe, and what needs me today.',
  about:'The whole business on one screen — every company in it, or one at a time. Sales after returns, real profit, live cash position, who owes you and who you owe, stock that is running out, and a short list of things that actually need a decision. Nothing here is typed in by hand: every figure is worked out from the records the other modules already write. Change the period or the company and every number on every screen moves with it.',
  profitNote:'Profit here is after purchases, making cost and every running cost — rent, salaries, marketing, logistics. It is the figure that actually reaches the bank.',
  companies:[
    {id:'AMF',name:'Acme Manufacturing Pvt Ltd',gstin:'27AACCA1234F1Z5',note:'Makes and sells the main product line'},
    {id:'AEX',name:'Acme Exports LLP',gstin:'24AAFCA9876B1Z2',note:'Overseas orders and distribution'},
    {id:'AWK',name:'Acme Workshop',gstin:'',note:'Does job work for the other two — it has no tax registration of its own'}],
  brands:[
    {name:'Acme Direct',co:'AMF',where:'Own storefront'},
    {name:'AcmePro',co:'AMF',where:'Marketplace seller name — every order is invoiced as Acme Manufacturing'},
    {name:'Acme Global',co:'AEX',where:'Export documents'}],
  plan:{name:'Enterprise',companyCap:20},
  costHeads:['Marketing','Logistics'],
  icNote:'Assembly work done for the selling companies',
  icChannel:'Between our own companies',
  channels:['Retail Stores','Online Marketplace','Own Website','Wholesale / B2B','Export'],
  items:[
    {sku:'ITM-01',co:'AMF',name:'Primary raw material',qty:820,rop:400,cost:280},
    {sku:'ITM-02',co:'AMF',name:'Secondary raw material',qty:310,rop:350,cost:90},
    {sku:'ITM-03',co:'AMF',name:'Precision component',qty:1450,rop:600,cost:150},
    {sku:'ITM-04',co:'AWK',name:'Lining / substrate',qty:180,rop:250,cost:35},
    {sku:'ITM-05',co:'AWK',name:'Finishing consumable',qty:640,rop:200,cost:210},
    {sku:'FG-101',co:'AMF',name:'Finished product — standard',qty:96,rop:120,cost:1180},
    {sku:'FG-102',co:'AEX',name:'Finished product — premium',qty:240,rop:100,cost:2260},
    {sku:'PKG-01',co:'AEX',name:'Packaging set',qty:2100,rop:800,cost:22}],
  parties:{
    r:['Northline Retail Pvt Ltd','Metro Distributors','Harbour Trading Co','Sunrise Enterprises'],
    p:['Alpha Industrial Supplies','Beta Components Ltd','Gamma Materials Co','Delta Trading']},
  wiring:[
    {f:'Net sales',s:'Sales',h:'Every invoice added up, minus every credit note (return), for the period and company you picked'},
    {f:'Return %',s:'Sales returns',h:'Returns ÷ gross sales, worked out separately for each channel'},
    {f:'Net profit',s:'Sales + Purchase + HR & Payroll + Accounting &amp; GST',h:'Net sales − purchases − making cost / wages − running expenses'},
    {f:'Cash + bank',s:'Accounting &amp; GST (ledger)',h:'Opening balance + everything earned or spent since — a true balance, not a period figure'},
    {f:'To collect',s:'Accounts Receivable',h:'Sum of unpaid customer invoices, aged by how many days old each one is'},
    {f:'To pay',s:'Accounts Payable',h:'Sum of unpaid supplier bills, showing days late or days remaining'},
    {f:'Stock value',s:'Inventory &amp; Catalog',h:'Quantity on hand × cost price, item by item'},
    {f:'Running out',s:'Inventory &amp; Catalog',h:'Any item where quantity has fallen to or below its reorder point'},
    {f:'Pieces made / making cost',s:'Manufacturing',h:'Output and wages booked by the production floor for the period'},
    {f:'Company switcher',s:'Platform (companies)',h:'The list of companies you run — every figure above is re-worked for the one you pick'},
    {f:'Alerts',s:'All of the above',h:'Rules applied on live figures — low stock, receivable over 30 days, bill past due, channel return rate 12% or more'}],
  wiringIn:[
    {from:'Sales',what:'Invoices, credit notes, channel tags'},
    {from:'Purchase',what:'Supplier bills and payment terms'},
    {from:'Inventory',what:'Quantity on hand, cost, reorder point'},
    {from:'Manufacturing',what:'Pieces produced and wages booked'},
    {from:'Accounting &amp; GST',what:'Opening balances, expenses, receipts and payments'},
    {from:'Platform',what:'Which companies exist, and which one you are looking at'}]
};
