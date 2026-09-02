/* Format B — Vastrangam. Its own companies, seller names, mills and marketplaces — the same
   engine as the neutral edition, carrying a real business so the neutrality can be tested. */
var CONFIG={
  id:'groupcons_vastrangam', name:'Group Consolidation', company:'Vastrangam', fy:'FY 2026-27',
  tagline:'Ethnic Fashion, Vastrangam and Adini Couture — one set of figures, honestly added up.',
  about:'All three companies rolled into one set of books. Sales, cash, stock and profit added up across the group, with the stitching bills the companies raise on each other removed first — Adini Couture invoicing Vastrangam is real for both of them and is not a sale for the group. Adini Couture has no tax registration of its own, so it counts in every group figure and is refused entry to a GST return. And Adini is a seller name on the marketplace, not a fourth company: its orders are Vastrangam’s sales, and this app will not let anyone turn it into a company.',
  companies:[
    {id:'EF',name:'Ethnic Fashion',gstin:'24AABFE1234K1Z9',note:'The Go4Fashion brand'},
    {id:'VG',name:'Vastrangam',gstin:'24AAAFV5678M1Z3',note:'Sells under both the Vastrangam and the Adini seller names'},
    {id:'AC',name:'Adini Couture',gstin:'',note:'Job work for the other two — it has no tax registration of its own'}],
  brands:[
    {name:'Go4Fashion',co:'EF',where:'Own website and marketplace listings'},
    {name:'Vastrangam',co:'VG',where:'Marketplace seller name'},
    {name:'Adini',co:'VG',where:'Marketplace seller name — every order is invoiced as Vastrangam'}],
  plan:{name:'Enterprise',companyCap:20},
  costHeads:['Ad spend','Courier'],
  icNote:'Stitching done for the selling companies',
  icChannel:'Between our own companies',
  channels:['Myntra','Flipkart','Own Website','Wholesale (Surat)','Exhibition / Exports'],
  items:[
    {sku:'FAB-SILK',co:'EF',name:'Banarasi silk fabric (m)',qty:820,rop:400,cost:280},
    {sku:'FAB-COT',co:'EF',name:'Cotton fabric 44" (m)',qty:310,rop:350,cost:90},
    {sku:'ZARI-01',co:'AC',name:'Zari thread (reel)',qty:1450,rop:600,cost:150},
    {sku:'LIN-01',co:'AC',name:'Cotton lining (m)',qty:180,rop:250,cost:35},
    {sku:'GOTA-01',co:'AC',name:'Gota / dye finishing (kg)',qty:640,rop:200,cost:210},
    {sku:'VS-KUR-01',co:'VG',name:'Cotton kurta set — ready',qty:96,rop:120,cost:1180},
    {sku:'VS-SAR-02',co:'VG',name:'Banarasi saree — ready',qty:240,rop:100,cost:2260},
    {sku:'PKG-01',co:'VG',name:'Poly bag + tag + box',qty:2100,rop:800,cost:22}],
  parties:{
    r:['Myntra (Myntra Designs Pvt Ltd)','Flipkart (Flipkart India)','Surat Wholesale — Rajmandir','Exhibition buyer — Dubai'],
    p:['Jagdamba Textiles (Surat)','Kanchi Silks','Surat Cotton Mills','Zari Works Jaipur']},
  wiring:[
    {f:'Companies',s:'Platform (companies)',h:'Ethnic Fashion, Vastrangam and Adini Couture, with their GSTINs where they have one'},
    {f:'Trading names',s:'Platform (companies) + Sales',h:'Go4Fashion, Vastrangam and Adini — each pointing at the company whose sales they are'},
    {f:'Per-company sales',s:'E-commerce / OMS + Sales',h:'Net sales worked out separately for each company, for the period on screen'},
    {f:'Between your own companies',s:'Sales + Purchase',h:'Adini Couture’s stitching bills on the other two — real for both of them, not a sale for the group'},
    {f:'Group net sales',s:'E-commerce / OMS + Sales',h:'All three companies added together, minus everything they billed each other'},
    {f:'Group profit',s:'Sales + Purchase + HR & Payroll + Accounting &amp; GST',h:'Every company’s profit added up. Internal billing cancels itself, so it never moves this line'},
    {f:'Group cash',s:'Accounting &amp; GST (ledger)',h:'Every company’s opening balance plus everything it has earned or spent since'},
    {f:'Group stock',s:'Inventory &amp; Catalog (fabric and finished)',h:'What every company is holding, valued at cost'},
    {f:'GST return eligibility',s:'GST & Tax',h:'Adini Couture has no registration, so it cannot file. This is refused, not warned about'},
    {f:'Plan limit',s:'Platform (subscription)',h:'How many companies your plan covers. The software itself sets no limit'}],
  wiringIn:[
    {from:'Platform',what:'The list of companies, their GSTINs, and the plan you are on'},
    {from:'E-commerce / OMS',what:'Marketplace orders tagged with the seller name and the company behind it'},
    {from:'Sales',what:'Invoices and credit notes, tagged with the company that raised them'},
    {from:'Purchase',what:'Mill bills per company, including stitching bills from Adini Couture'},
    {from:'Inventory',what:'What each company is holding and what it cost'},
    {from:'Accounting &amp; GST',what:'Opening balances, expenses and the figures a GST return is built from'},
    {from:'CEO Dashboard',what:'Uses the same engine, so one company here equals that company there'}]
};
