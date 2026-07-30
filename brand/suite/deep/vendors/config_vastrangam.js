/* Format B — Vastrangam (ethnic-wear D2C + marketplace). Surat–Jaipur mill base, GST, karigar floor. */
var CONFIG={
  id:'vendors_vastrangam', name:'Vendor Management', company:'Vastrangam', fy:'FY 2026-27',
  tagline:'Mill 360, payables, aging, risk & performance-based sourcing — one supplier truth.',
  about:'Vastrangam’s supplier master for the Surat–Jaipur fabric and zari base. Every mill carries its real record: total spend and share of your buying, what you still owe against GST bills, how it actually performs (on-time, accept rate on quality inspection, fill rate), and a risk score that blends weak performance, spend concentration and overdue bills. Sourcing then follows evidence — the engine names the best mill per fabric category, so next season’s buying is decided by delivery history rather than habit or relationship.',
  vendors:[
    {id:'V1',name:'Jagdamba Textiles (Surat)',gstin:'24ABCDE1234F1Z5',cat:'Silk fabric',terms:'30 days',loc:'Surat, GJ'},
    {id:'V2',name:'Kanchi Silks',gstin:'33KANCH5678K1Z2',cat:'Zari & silk',terms:'15 days',loc:'Kanchipuram, TN'},
    {id:'V3',name:'Surat Cotton Mills',gstin:'24SURAT9012M1Z8',cat:'Cotton fabric',terms:'45 days',loc:'Surat, GJ'},
    {id:'V4',name:'Rungta Lining House',gstin:'24RUNGT3456L1Z1',cat:'Lining & trims',terms:'30 days',loc:'Surat, GJ'},
    {id:'V5',name:'Zari Works Jaipur',gstin:'08ZARI3456J1Z1',cat:'Zari thread',terms:'COD',loc:'Jaipur, RJ'}],
  wiring:[
    {from:'Mill created / updated',to:'Inventory &amp; Catalog (Party master)',what:'One supplier identity read by Procurement, the books and Quality Control'},
    {from:'Performance score',to:'Procurement',what:'Fabric RFQs and POs route to the best-performing mill in that category'},
    {from:'Payable balance',to:'Accounting &amp; GST (ledger)',what:'Accounts-payable position and the weekly payment run'},
    {from:'Aging buckets',to:'Accounting &amp; GST (cash-flow)',what:'What must be paid before the festive buying season'},
    {from:'Risk band',to:'Purchase (Procurement)',what:'High-risk mills trigger a second source before the wedding-season order'},
    {from:'Spend concentration',to:'Dashboard &amp; BI',what:'Dependency on a single Surat mill flagged before it stalls production'}],
  wiringIn:[
    {from:'Procurement',what:'GRN results on fabric (metres received / accepted / rejected, on-time) build the performance history'},
    {from:'Accounting &amp; GST',what:'Payments post against mill bills and clear the outstanding balance'},
    {from:'Manufacturing (Quality Control)',what:'Rejected metres and debit notes to the mill lower its accept rate'},
    {from:'Manufacturing / Karigar',what:'Fabric shortfalls on the cut plan trace back to the mill that under-delivered'}]
};
