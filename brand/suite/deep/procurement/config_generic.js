/* Format A — Unified ERP (any industry). Neutral names; drop-in for textile, medical, manufacturing, services. */
var CONFIG={
  id:'procurement_erp', name:'Procurement', company:'Acme Corp', fy:'FY 2026-27',
  itemWord:'material',
  tagline:'RFQ → PO → GRN → 3-way match → vendor scorecard — the buy side, wired to stock & books.',
  about:'A complete procure-to-pay engine for ANY industry. Compare quotes and award the best; raise and approve purchase orders; receive goods with accept/reject; and let a strict three-way match (PO ↔ GRN ↔ Invoice) protect every payment. Vendor scorecards are computed from real receipt history. Accepted quantity — never ordered quantity — is what posts to Stock and earns Input Tax Credit.',
  vendors:[
    {id:'V1',name:'Alpha Industrial Supplies',gstin:'27AAAAA0001A1Z1',cat:'Raw material',terms:'30 days'},
    {id:'V2',name:'Beta Components Ltd',gstin:'29BBBBB0002B1Z2',cat:'Components',terms:'15 days'},
    {id:'V3',name:'Gamma Materials Co',gstin:'24GGGGG0003C1Z3',cat:'Raw material',terms:'45 days'},
    {id:'V4',name:'Delta Trading',gstin:'07DDDDD0004D1Z4',cat:'Consumables',terms:'30 days'},
    {id:'V5',name:'Epsilon Enterprises',gstin:'19EEEEE0005E1Z5',cat:'Packaging',terms:'COD'}],
  items:[
    {code:'ITM-01',name:'Primary raw material',uom:'kg',stdRate:280},
    {code:'ITM-02',name:'Secondary raw material',uom:'kg',stdRate:90},
    {code:'ITM-03',name:'Precision component',uom:'pc',stdRate:150},
    {code:'ITM-04',name:'Lining / substrate',uom:'m',stdRate:35},
    {code:'ITM-05',name:'Finishing consumable',uom:'kg',stdRate:210}],
  wiring:[
    {from:'GRN accepted qty',to:'Inventory &amp; Catalog (Stock)',what:'Stock IN at receiving location (single source of truth)'},
    {from:'Supplier invoice (matched)',to:'Accounting &amp; GST (ledger)',what:'Vendor payable + Input Tax Credit on accepted value'},
    {from:'GRN rejected qty',to:'Manufacturing (Quality Control) + Accounting &amp; GST',what:'Debit note to vendor + quality flag on scorecard'},
    {from:'PO approved',to:'Accounting &amp; GST (budget commitments)',what:'Committed spend against cost centre / budget'},
    {from:'RFQ awarded',to:'Inventory &amp; Catalog (Party master)',what:'Preferred-vendor + agreed price for the item'},
    {from:'Vendor scorecard',to:'Inventory &amp; Catalog',what:'On-time / quality rating drives future sourcing'}],
  wiringIn:[
    {from:'Manufacturing / Planning',what:'Reorder & material requirements raise purchase requisitions'},
    {from:'Inventory',what:'Below-reorder alerts trigger a PO suggestion'},
    {from:'Inventory &amp; Catalog',what:'Item master, vendor master, tax/HSN rates'},
    {from:'Platform (rules & automation)',what:'“If stock < reorder then draft PO to preferred vendor”'}]
};
