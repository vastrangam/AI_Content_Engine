/* Format B — Vastrangam. Its own companies, seller names, mills and marketplaces — the same
   engine as the neutral edition, carrying a real business so the neutrality can be tested. */
var CONFIG={
  id:'dashboard_vastrangam', name:'CEO Dashboard', company:'Vastrangam', fy:'FY 2026-27',
  tagline:'Did the group make money this month, is cash safe, and what needs the owner today.',
  about:'All three companies on one screen, together or one at a time. Marketplace sales after returns (returns are counted before profit, not after), the real profit once fabric, karigar wages and running costs are taken out, the live cash position, buyers who have not paid, mills waiting to be paid, fabric about to run out, and the karigar floor’s output. Every figure is worked out from what the other modules already record — nothing is typed in twice.',
  profitNote:'Profit here is after fabric, karigar wages and every running cost — rent, salaries, ad spend, courier. It is the figure that actually reaches the bank.',
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
    {f:'Net sales',s:'E-commerce / OMS + Sales',h:'Marketplace and website orders added up, minus every return and cancellation, for the period and company you picked'},
    {f:'Return %',s:'E-commerce / OMS (returns)',h:'Returns ÷ gross sales, per channel — each marketplace is tracked separately because their return behaviour differs'},
    {f:'Net profit',s:'Sales + Purchase + HR & Payroll + Accounting &amp; GST',h:'Net sales − fabric purchases − karigar wages − running expenses (rent, salaries, ads, courier)'},
    {f:'Cash + bank',s:'Accounting &amp; GST (ledger)',h:'Opening balance + everything earned or spent since — a true balance, not a period figure'},
    {f:'To collect',s:'Settlement + Sales (B2B invoices)',h:'Money the marketplaces and wholesale buyers still owe, aged in days'},
    {f:'To pay',s:'Purchase (Accounts Payable)',h:'Unpaid mill and zari bills, showing days late or days remaining against agreed terms'},
    {f:'Stock value',s:'Inventory &amp; Catalog (fabric and finished)',h:'Metres / pieces on hand × cost, item by item — one stock number, not one per channel'},
    {f:'Running out',s:'Inventory &amp; Catalog (reorder points)',h:'Any fabric or SKU that has fallen to or below its reorder point — this is what stops a cut plan'},
    {f:'Pieces made / making cost',s:'Manufacturing (karigar floor)',h:'Pieces finished and wages booked by the tailoring unit for the period'},
    {f:'Company switcher',s:'Platform (companies)',h:'Ethnic Fashion, Vastrangam and Adini Couture — every figure above is re-worked for the one you pick'},
    {f:'Alerts',s:'All of the above',h:'Rules on live figures — fabric below reorder, settlement over 30 days, mill bill past due, channel return rate 12% or more'}],
  wiringIn:[
    {from:'E-commerce / OMS',what:'Marketplace and website orders, returns and settlements'},
    {from:'Procurement',what:'Mill bills, fabric rates, payment terms'},
    {from:'Inventory',what:'Fabric metres, finished pieces, cost, reorder point'},
    {from:'Manufacturing (karigar)',what:'Pieces cut, stitched and finished; wages booked'},
    {from:'Accounting &amp; GST',what:'Opening balances, rent, salaries, ad spend, courier, receipts and payments'},
    {from:'Platform',what:'Which companies exist, and which one you are looking at'}]
};
