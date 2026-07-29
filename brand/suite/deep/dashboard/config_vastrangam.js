/* Format B — Vastrangam (ethnic-wear D2C + marketplace, textile). Real channels, fabrics, karigars, Surat–Jaipur supply base. */
var CONFIG={
  id:'dashboard_vastrangam', name:'CEO Dashboard', company:'Vastrangam', fy:'FY 2026-27',
  tagline:'Did Vastrangam make money this month, is cash safe, and what needs the owner today.',
  about:'Vastrangam on one screen. Marketplace sales after returns (Myntra and Flipkart returns are counted before profit, not after), the real profit once fabric, karigar wages and running costs are taken out, the live cash position, buyers who have not paid, mills waiting to be paid, fabric that is about to run out, and the karigar floor’s output. Every figure is worked out from what the other Vastrangam modules already record — nothing is typed in twice. Change the period and every number moves.',
  profitNote:'Profit here is after fabric, karigar wages and every running cost — rent, salaries, ad spend, courier. It is the figure that actually reaches the bank.',
  channels:['Myntra','Flipkart','Own Website','Wholesale (Surat)','Exhibition / Exports'],
  items:[
    {sku:'FAB-SILK',name:'Banarasi silk fabric (m)',qty:820,rop:400,cost:280},
    {sku:'FAB-COT',name:'Cotton fabric 44" (m)',qty:310,rop:350,cost:90},
    {sku:'ZARI-01',name:'Zari thread (reel)',qty:1450,rop:600,cost:150},
    {sku:'LIN-01',name:'Cotton lining (m)',qty:180,rop:250,cost:35},
    {sku:'GOTA-01',name:'Gota / dye finishing (kg)',qty:640,rop:200,cost:210},
    {sku:'VS-KUR-01',name:'Cotton kurta set — ready',qty:96,rop:120,cost:1180},
    {sku:'VS-SAR-02',name:'Banarasi saree — ready',qty:240,rop:100,cost:2260},
    {sku:'PKG-01',name:'Poly bag + tag + box',qty:2100,rop:800,cost:22}],
  parties:{
    r:['Myntra (Myntra Designs Pvt Ltd)','Flipkart (Flipkart India)','Surat Wholesale — Rajmandir','Exhibition buyer — Dubai'],
    p:['Jagdamba Textiles (Surat)','Kanchi Silks','Surat Cotton Mills','Zari Works Jaipur']},
  wiring:[
    {f:'Net sales',s:'Channel Manager + Sales',h:'Myntra / Flipkart / website orders added up, minus every return and cancellation, for the period you picked'},
    {f:'Return %',s:'Marketplace returns feed',h:'Returns ÷ gross sales, per channel — Myntra and Flipkart are tracked separately because their return behaviour is different'},
    {f:'Net profit',s:'Sales + Purchase + Karigar payroll + BUSY',h:'Net sales − fabric purchases − karigar wages − running expenses (rent, salaries, ads, courier)'},
    {f:'Cash + bank',s:'Accounts / BUSY ledger',h:'Opening balance + everything earned or spent since — a true balance, not a period figure'},
    {f:'To collect',s:'Marketplace settlements + B2B invoices',h:'Money the marketplaces and wholesale buyers still owe, aged in days'},
    {f:'To pay',s:'Mill bills (Accounts Payable)',h:'Unpaid mill and zari bills, showing days late or days remaining against agreed terms'},
    {f:'Stock value',s:'Inventory (fabric + finished)',h:'Metres / pieces on hand × cost, item by item — one stock number, not one per channel'},
    {f:'Running out',s:'Inventory + reorder points',h:'Any fabric or SKU that has fallen to or below its reorder point — this is what stops a cut plan'},
    {f:'Pieces made / making cost',s:'Karigar production floor',h:'Pieces finished and wages booked by the tailoring unit for the period'},
    {f:'Alerts',s:'All of the above',h:'Rules on live figures — fabric below reorder, settlement over 30 days, mill bill past due, channel return rate 12% or more'}],
  wiringIn:[
    {from:'Channel Manager',what:'Myntra / Flipkart / website orders, returns and settlements'},
    {from:'Procurement',what:'Mill bills, fabric rates, payment terms'},
    {from:'Inventory',what:'Fabric metres, finished pieces, cost, reorder point'},
    {from:'Manufacturing (karigar)',what:'Pieces cut, stitched and finished; wages booked'},
    {from:'Accounts / BUSY',what:'Opening balances, rent, salaries, ad spend, courier, receipts and payments'}]
};
