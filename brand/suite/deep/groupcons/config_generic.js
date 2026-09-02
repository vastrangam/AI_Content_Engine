/* Format A — Unified ERP (any industry). Neutral names; the same engine runs a machine shop,
   a distributor, an exporter or a professional practice. Only this file changes. */
var CONFIG={
  id:'groupcons_erp', name:'Group Consolidation', company:'Acme Corp', fy:'FY 2026-27',
  tagline:'Several companies, one set of figures — with what they billed each other taken back out.',
  about:'Every company you run, rolled into one set of books. Sales, cash, stock and profit added up across the group, with anything the companies billed each other removed first, because a group cannot sell to itself. A company with no tax registration of its own — a job-work arm, a venture not registered yet — counts in every group figure and is refused entry to a tax return, which is the correct answer to two different questions. Add a company whenever the business grows one: nothing in the software caps the number, only the plan does.',
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
    {f:'Companies',s:'Platform (companies)',h:'Every legal entity you run, with its tax registration if it has one'},
    {f:'Trading names',s:'Platform (companies) + Sales',h:'Names you sell under, each pointing at the company whose sales they are'},
    {f:'Per-company sales',s:'Sales',h:'Net sales worked out separately for each company, for the period on screen'},
    {f:'Between your own companies',s:'Sales + Purchase',h:'What each company billed another — real for both of them, not a sale for the group'},
    {f:'Group net sales',s:'Sales',h:'Every company added together, minus everything they billed each other'},
    {f:'Group profit',s:'Sales + Purchase + HR & Payroll + Accounting &amp; GST',h:'Every company’s profit added up. Internal billing cancels itself, so it never moves this line'},
    {f:'Group cash',s:'Accounting &amp; GST (ledger)',h:'Every company’s opening balance plus everything it has earned or spent since'},
    {f:'Group stock',s:'Inventory &amp; Catalog',h:'What every company is holding, valued at cost'},
    {f:'Tax return eligibility',s:'GST & Tax',h:'Only a company with its own registration may file. This is refused, not warned about'},
    {f:'Plan limit',s:'Platform (subscription)',h:'How many companies your plan covers. The software itself sets no limit'}],
  wiringIn:[
    {from:'Platform',what:'The list of companies, their tax registrations, and the plan you are on'},
    {from:'Sales',what:'Invoices and credit notes, tagged with the company that raised them'},
    {from:'Purchase',what:'Supplier bills per company, including bills from your own other companies'},
    {from:'Inventory',what:'What each company is holding and what it cost'},
    {from:'Accounting &amp; GST',what:'Opening balances, expenses and the figures a return is built from'},
    {from:'CEO Dashboard',what:'Uses the same engine, so one company here equals that company there'}]
};
