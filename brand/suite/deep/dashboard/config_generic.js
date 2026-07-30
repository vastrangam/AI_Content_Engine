/* Format A — Unified ERP (any industry). Neutral names; drop-in for textile, medical, manufacturing, services. */
var CONFIG={
  id:'dashboard_erp', name:'CEO Dashboard', company:'Acme Corp', fy:'FY 2026-27',
  tagline:'One screen that answers: did we make money, is cash safe, and what needs me today.',
  about:'The whole business on one screen. Sales after returns, real profit, live cash position, who owes you and who you owe, stock that is running out, and a short list of things that actually need a decision. Nothing here is typed in by hand — every figure is worked out from the records the other modules already write. Change the period and every number on every screen moves with it.',
  profitNote:'Profit here is after purchases, making cost and every running cost — rent, salaries, marketing, logistics. It is the figure that actually reaches the bank.',
  channels:['Retail Stores','Online Marketplace','Own Website','Wholesale / B2B','Export'],
  items:[
    {sku:'ITM-01',name:'Primary raw material',qty:820,rop:400,cost:280},
    {sku:'ITM-02',name:'Secondary raw material',qty:310,rop:350,cost:90},
    {sku:'ITM-03',name:'Precision component',qty:1450,rop:600,cost:150},
    {sku:'ITM-04',name:'Lining / substrate',qty:180,rop:250,cost:35},
    {sku:'ITM-05',name:'Finishing consumable',qty:640,rop:200,cost:210},
    {sku:'FG-101',name:'Finished product — standard',qty:96,rop:120,cost:1180},
    {sku:'FG-102',name:'Finished product — premium',qty:240,rop:100,cost:2260},
    {sku:'PKG-01',name:'Packaging set',qty:2100,rop:800,cost:22}],
  parties:{
    r:['Northline Retail Pvt Ltd','Metro Distributors','Harbour Trading Co','Sunrise Enterprises'],
    p:['Alpha Industrial Supplies','Beta Components Ltd','Gamma Materials Co','Delta Trading']},
  wiring:[
    {f:'Net sales',s:'Sales',h:'Every invoice added up, minus every credit note (return), for the period you picked'},
    {f:'Return %',s:'Sales returns',h:'Returns ÷ gross sales, worked out separately for each channel'},
    {f:'Net profit',s:'Sales + Purchase + HR & Payroll + Accounting &amp; GST',h:'Net sales − purchases − making cost / wages − running expenses'},
    {f:'Cash + bank',s:'Accounting &amp; GST (ledger)',h:'Opening balance + everything earned or spent since — a true balance, not a period figure'},
    {f:'To collect',s:'Accounts Receivable',h:'Sum of unpaid customer invoices, aged by how many days old each one is'},
    {f:'To pay',s:'Accounts Payable',h:'Sum of unpaid supplier bills, showing days late or days remaining'},
    {f:'Stock value',s:'Inventory &amp; Catalog',h:'Quantity on hand × cost price, item by item'},
    {f:'Running out',s:'Inventory &amp; Catalog',h:'Any item where quantity has fallen to or below its reorder point'},
    {f:'Pieces made / making cost',s:'Manufacturing',h:'Output and wages booked by the production floor for the period'},
    {f:'Alerts',s:'All of the above',h:'Rules applied on live figures — low stock, receivable over 30 days, bill past due, channel return rate 12% or more'}],
  wiringIn:[
    {from:'Sales',what:'Invoices, credit notes, channel tags'},
    {from:'Purchase',what:'Supplier bills and payment terms'},
    {from:'Inventory',what:'Quantity on hand, cost, reorder point'},
    {from:'Manufacturing',what:'Pieces produced and wages booked'},
    {from:'Accounting &amp; GST',what:'Opening balances, expenses, receipts and payments'}]
};
