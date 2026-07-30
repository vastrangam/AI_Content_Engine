/* Format A — Unified ERP (any industry). Neutral supplier master; drop-in for textile, medical, manufacturing, services. */
var CONFIG={
  id:'vendors_erp', name:'Vendor Management', company:'Acme Corp', fy:'FY 2026-27',
  tagline:'Vendor 360, payables, aging, risk & performance-based sourcing — one supplier truth.',
  about:'A complete supplier master for ANY industry. Every vendor carries their real record: total spend and share, what you still owe, how they actually perform (on-time, accept rate, fill rate), and a risk score that blends weak performance, spend concentration and overdue bills. Sourcing then follows evidence — the engine names the best-performing supplier per category instead of relying on habit.',
  vendors:[
    {id:'V1',name:'Alpha Industrial Supplies',gstin:'27AAAAA0001A1Z1',cat:'Raw material',terms:'30 days',loc:'Pune, MH'},
    {id:'V2',name:'Beta Components Ltd',gstin:'29BBBBB0002B1Z2',cat:'Components',terms:'15 days',loc:'Bengaluru, KA'},
    {id:'V3',name:'Gamma Materials Co',gstin:'24GGGGG0003C1Z3',cat:'Raw material',terms:'45 days',loc:'Surat, GJ'},
    {id:'V4',name:'Delta Trading',gstin:'07DDDDD0004D1Z4',cat:'Consumables',terms:'30 days',loc:'New Delhi, DL'},
    {id:'V5',name:'Epsilon Enterprises',gstin:'19EEEEE0005E1Z5',cat:'Packaging',terms:'COD',loc:'Kolkata, WB'}],
  wiring:[
    {from:'Vendor created / updated',to:'Inventory &amp; Catalog (Party master)',what:'One supplier identity every module reads — Procurement, Finance, Quality'},
    {from:'Performance score',to:'Procurement',what:'RFQs and POs route to the best-performing supplier in that category'},
    {from:'Payable balance',to:'Accounting &amp; GST (ledger)',what:'Accounts-payable position and the payment run'},
    {from:'Aging buckets',to:'Accounting &amp; GST (cash-flow)',what:'What must be paid this week vs this month'},
    {from:'Risk band',to:'Purchase (Procurement)',what:'High-risk suppliers trigger dual-sourcing and a review'},
    {from:'Spend concentration',to:'Dashboard &amp; BI',what:'Single-supplier dependency flagged before it becomes a failure'}],
  wiringIn:[
    {from:'Procurement',what:'GRN results (received / accepted / rejected, on-time) build the performance history'},
    {from:'Accounting &amp; GST',what:'Payments post against bills and clear the outstanding balance'},
    {from:'Manufacturing (Quality Control)',what:'Rejections and debit notes lower the accept rate'},
    {from:'Inventory &amp; Catalog',what:'GSTIN, payment terms, tax and category definitions'}]
};
