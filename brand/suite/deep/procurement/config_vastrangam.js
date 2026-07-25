/* Format B — Vastrangam (ethnic-wear D2C + marketplace, textile). Real vendors, fabrics, GST, Surat/Jaipur supply base. */
var CONFIG={
  id:'procurement_vastrangam', name:'Procurement', company:'Vastrangam', fy:'FY 2026-27',
  itemWord:'material',
  tagline:'RFQ → PO → GRN → 3-way match → karigar-ready fabric — the buy side of Vastrangam, wired to stock & books.',
  about:'Vastrangam’s procure-to-pay for fabric, zari and trims from the Surat–Jaipur supply base. Compare mill quotes and award the best; raise GST purchase orders; receive with accept/reject on quality; and let a strict three-way match (PO ↔ GRN ↔ Invoice) stop over-billing before it hits BUSY. Accepted metres — never ordered — post to Stock and feed the karigar production floor, and only accepted value earns Input Tax Credit. Vendor scorecards are computed from real receipt history, so sourcing follows performance.',
  vendors:[
    {id:'V1',name:'Jagdamba Textiles (Surat)',gstin:'24ABCDE1234F1Z5',cat:'Silk fabric',terms:'30 days'},
    {id:'V2',name:'Kanchi Silks',gstin:'33KANCH5678K1Z2',cat:'Zari & silk',terms:'15 days'},
    {id:'V3',name:'Surat Cotton Mills',gstin:'24SURAT9012M1Z8',cat:'Cotton fabric',terms:'45 days'},
    {id:'V4',name:'Rungta Lining House',gstin:'24RUNGT3456L1Z1',cat:'Lining & trims',terms:'30 days'},
    {id:'V5',name:'Zari Works Jaipur',gstin:'08ZARI3456J1Z1',cat:'Zari thread',terms:'COD'}],
  items:[
    {code:'ITM-01',name:'Banarasi silk fabric',uom:'m',stdRate:280},
    {code:'ITM-02',name:'Cotton fabric (44")',uom:'m',stdRate:90},
    {code:'ITM-03',name:'Zari thread',uom:'reel',stdRate:150},
    {code:'ITM-04',name:'Cotton lining',uom:'m',stdRate:35},
    {code:'ITM-05',name:'Gota / dye finishing',uom:'kg',stdRate:210}],
  wiring:[
    {from:'GRN accepted metres',to:'Inventory / Stock',what:'Fabric IN — single stock per SKU, ready for cutting'},
    {from:'Supplier invoice (matched)',to:'Finance / BUSY ledger',what:'Vendor payable + ITC on accepted fabric value'},
    {from:'GRN rejected metres',to:'Quality + Finance',what:'Debit note to mill + quality flag on scorecard'},
    {from:'Accepted fabric',to:'Manufacturing / Karigar',what:'Feeds BOM & cut plan; cost-per-piece rolls up from this rate'},
    {from:'RFQ awarded',to:'Master Data (Party)',what:'Preferred mill + agreed rate for that fabric'},
    {from:'Vendor scorecard',to:'Sourcing',what:'On-time / quality rating steers next season’s buying'}],
  wiringIn:[
    {from:'Manufacturing / Karigar',what:'Production plan + BOM raise fabric requirements → requisitions'},
    {from:'Inventory',what:'Below-reorder fabric alerts trigger a PO suggestion'},
    {from:'Master Data',what:'Design/SKU master, mill master, HSN 5007/5208 & GST rates'},
    {from:'Automation',what:'“If silk stock < reorder then draft PO to Jagdamba Textiles”'}]
};
