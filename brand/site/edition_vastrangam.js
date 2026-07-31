'use strict';
/* THE VASTRANGAM EDITION — the same software, described in one trade's own words.

   This file overrides WORDING ONLY. It cannot add a module, remove one, add an app or change
   an app's name — build.js applies it key by key onto the structure in modules.js, so the two
   editions always publish the same module numbers and the same app count. That is the whole
   claim being made: the engine does not know which trade it is in, and the only thing that
   changes between a clothing house and a law firm is this file.

   modules.js is the neutral edition and audit §8 forbids trade vocabulary there.
   This file is where that vocabulary is allowed, and it is deliberately full of it. */

module.exports = {
  id: 'VASTRANGAM',
  company: 'Vastrangam',
  /* the page furniture that has to change with the edition */
  badge: 'Vastrangam edition',
  shotCo: 'Vastrangam',
  shotRows: [['Jagdamba Textiles','99%','medium','a'],['Surat Cotton Mills','100%','low','g'],
             ['Kanchi Silks','64%','watch','r'],['Zari Works Jaipur','98%','low','g']],
  featPrH: 'Karigar piece-rate',
  featPrP: 'Pooled set completion, per-garment rates, alteration hours and advances roll into each karigar\u2019s payout \u2014 and into a true cost per piece for every design.',
  seoTrade: 'textile',
  prShort: 'piece-rate karigar wages',
  prNotebook: 'karigar wages',
  prPayroll: 'karigar payroll',
  heroH1: 'Run the whole<br>ethnic wear house<br>on <span class="gt">one system</span>',
  heroLead: 'Mill to marketplace in one application. The metre you bought, the karigar who stitched it, the design that sold on Myntra, the return that came back damaged and the GST on all of it — one record, one stock number, one set of books. Nothing re-keyed between them.',
  indHead: 'Built on the neutral engine, dressed for this trade',
  indLead: 'Every screen you are about to read is the same code as the Medhava edition. Only the master data and the words change — which is exactly why a machine shop or a law firm can run it too.',
  indCards: [
    ['🧵', 'What is different here', 'Fabric in metres and pieces in numbers on the same item master. Karigar piece-rate with pooled set completion. Design-wise costing to the paise. HSN 5007 / 5208. Wrong-return dead stock treated as the loss it is.'],
    ['🏬', 'The channels you actually sell on', 'Myntra, Flipkart, Ajio, Amazon, Meesho, Nykaa and JioMart in one queue, plus the Surat counter, the boutique wholesale book and export to the Gulf — all writing to the same order table.'],
    ['🪡', 'The people who make it', 'Cutting, stitching, embroidery, finishing and checking as stages you set. Karigars paid by the piece, staff paid by the month, both in one register and one payout.'],
    ['📜', 'The compliance you file', 'GST on ethnic wear slabs, TCS the marketplaces deduct, TDS on job work, LUT bond and IGST refund on export — all worked out from the same vouchers.'],
  ],

  /* module tag + intro, and any app whose description reads better in trade words.
     An app not named here simply keeps its neutral description. */
  modules: {
    '01': { tag: 'See the whole house without asking anyone',
      intro: 'Every number rolls up here as work happens — the day’s marketplace orders, what the karigars finished, what is still lying at the dyer, what the mills are owed. No exports, no waiting for month-end.',
      apps: {
        'CEO Dashboard': 'Cash, sales by channel, stock by design, profit per piece and the alerts that matter — one screen, refreshed as the day runs.',
        'Group Consolidation': 'Vastrangam and the ethnic-wear arm as one set of figures, inter-company transfers removed, so the group position is real rather than two spreadsheets added together.',
      } },
    '02': { tag: 'Know every boutique, chain and customer completely',
      intro: 'One record per party — a Kalamandir or a Rajmandir, a Surat walk-in or a Myntra buyer — carrying every enquiry, order, return, agreement and conversation, whichever channel it arrived on.',
      apps: {
        'CRM & Customer 360': 'Enquiry to confirmed order, then the full lifetime: what they bought, what came back, what they are worth and which new range to show them first.',
        'Documents & eSign': 'Mill agreements, job-work contracts, signed delivery challans, export documents and boutique credit terms filed against the party or order they belong to — found by that record, not by hunting through a folder.',
        'Helpdesk & Live Chat': 'A boutique asking where its parcel is, or a customer asking about a size — the question becomes a ticket tied to the order, with the whole history already open.',
      } },
    '03': { tag: 'Counter, wholesale, website and export — one order book',
      intro: 'The Surat counter, the boutique wholesale book, the website and the export shipment all write to the same order and draw on the same stock number. And the parcel is followed to the door, because a sale is not done until the COD money is in.',
      apps: {
        'D2C Sales': 'Orders from your own storefront, cart to dispatch, with loyalty and partial COD on a ₹4,400 anarkali.',
        'B2B & Credit': 'Boutique and chain orders on credit limits and tier pricing, with outstanding aged against each party’s own agreed terms.',
        'Export': 'Commercial invoice, packing list, LUT bond and IGST-refund tracking for the Gulf and UK buyers.',
        'POS': 'Counter billing at Udhna that draws on the same stock as the website — no second stock register.',
        'Couriers & AWB': 'Book the parcel on the order, compare couriers for that pin code, print the label with the design code on it, and follow the AWB to the door.',
      } },
    '04': { tag: 'Seven panels, one queue — and every rupee accounted for',
      intro: 'Stop logging into Myntra, then Flipkart, then Ajio. Every marketplace order lands in one pipeline and your stock goes out to all of them — then the money side closes out in the same module: what the panel paid, what it kept as commission, what came back, and what it still owes you.',
      apps: {
        'Marketplace OMS': 'Myntra, Flipkart, Ajio, Amazon, Meesho, Nykaa and JioMart in a single queue — processed all together, or channel-wise, or design-wise, whichever way you want to pick and pack today.',
        'Manual Data Check': 'The order and return sheets you already download from the panels, and the offline registers from the three shops — one file or a whole ZIP — read back as ten cross-checks: net sale after commission and fees, month, design, state, wrong returns, SPF claims, ads, payouts and GST. Every figure clicks through to the transactions behind it.',
        'Claims & Disputes': 'Weight disputes, SPF shortfalls, parcels lost in transit and returns that came back with a different piece inside — filed as claims with the packing footage attached.',
        'Returns / RMA': 'Customer returns, courier returns and wrong returns kept apart — because only one of the three is really your fault, and only one of them turns into dead stock.',
      } },
    '05': { tag: 'Pick the right design first time — and prove what you sent',
      intro: 'Bin-level instructions and barcode scanning so the right piece leaves the godown and stock stays honest — and a recording of each parcel being packed, because a wrong-return claim is settled by footage, not by argument.',
      apps: {
        'Picking & Bins': 'Pick lists in walking order through the godown, by design and size, so nobody crosses the floor twice.',
        'Packing Video': 'Every parcel filmed as it is packed and indexed by its order number, so when a panel says the wrong piece was sent, the clip goes into the claim.',
      } },
    '06': { tag: 'The courier network — rates, failed deliveries and the COD money',
      intro: 'Booking one parcel happens on the order. This module is the network behind it: what Delhivery, Blue Dart and the rest charge to that pin code before you pick one, what happens to a delivery that fails in a small town, and whether the cash collected at the door reached your bank.',
      apps: {
        'COD Remittance': 'What the courier collected at the door against what reached the Surat account, parcel by parcel, with every shortfall named and aged.',
      } },
    '07': { tag: 'One stock number everyone trusts',
      intro: 'The most important number in the house: one quantity per design and size, per godown, per stage — greige, dyed, in stitching, finished, listed. Read and written by every other module. And one product record every marketplace lists from.',
      apps: {
        'Stock': 'Live quantity by design, size and location, fabric in metres and pieces in numbers, with reorder alerts, lot tracking, set kits and dead-stock ageing.',
        'Catalog / PIM': 'One record per design — fabric, work, length, colour, size chart, images, HSN and price — scored for Myntra and Amazon readiness before it is listed anywhere.',
      } },
    '08': { tag: 'Know what a piece really costs to make',
      intro: 'From the cut plan to the finished piece — what each karigar earned, what the dyer charged, what the zari cost, and what that design actually cost before you priced it.',
      apps: {
        'PLM & Development': 'Concept to a design that can actually be made: fabric and trim specification, sample rounds with the mill, costed trials against a target price, and sign-off — every version kept, so last season’s costing is still there.',
        'Production Orders': 'Cutting, stitching, embroidery, washing, finishing and checking — your own stages, with work-in-progress visible at each and nothing lost at the dyer.',
        'Piece-rate & Contractors': 'Karigars paid by the piece: pooled set completion, per-garment rates, alterations, rework and advances resolved into one payout.',
        'BOM & Consumption': 'What each design consumes — metres of fabric, zari, lining, buttons, packing — costed at today’s mill rates.',
        'Quality Control': 'Accept, reject or send for rework, with reasons that feed the mill’s accept rate and the karigar’s record.',
        'Maintenance': 'Machines and the building: what is due for service, when it was last done, what it cost, and what stopped while it was down.',
      } },
    '09': { tag: 'Nothing over-billed by a mill gets paid',
      intro: 'The buy side end to end — mills, dyers, job workers and packing suppliers — with the control that stops you paying for metres you rejected.',
      apps: {
        'Procurement': 'Enquiry to purchase order to goods receipt, with a strict three-way match: you ordered 100 metres, 100 arrived, quality accepted 96, and the bill is only cleared for 96.',
        'Vendor Management': 'Mill 360 — payables, ageing, a real risk score from accept rate and spend concentration, and sourcing that follows performance rather than habit.',
      } },
    '10': { tag: 'Pay everyone right, on time',
      intro: 'Office staff on a monthly salary and karigars paid by the piece, in one register, with attendance driving both and the festival advance already deducted.',
      apps: {
        'Staff & Contractors': 'Attendance marked by tap, effective-dated salary, and karigar piece-rate earnings in a single register.',
        'Time-off & Advances': 'Leave, Diwali advances, and exactly how they change this month’s payout before you approve it.',
      } },
    '11': { tag: 'Books that always balance — and no BUSY needed',
      intro: 'A full double-entry ledger built for Indian compliance, keeping the books itself. B2B sales, returns, mill purchases, payments and receipts are entered by hand because a person decides them; every website, marketplace and counter sale posts itself.',
      apps: {
        'Finance Reports': 'P&L, balance sheet, and profit by channel, design and SKU — so you know which anarkali actually earned money after commission, shipping and returns.',
      } },
    '12': { tag: 'Get paid what the panels owe you — cycle by cycle',
      intro: 'Matching one payout to one order line happens in OMS. This is the level above: the settlement cycle each panel runs, the commission it actually charged against the rate card it published, and the TCS it deducted in your name.',
      apps: {
        'Fee & Commission Audit': 'The commission Myntra publishes for a category against the commission it actually took, style by style. A quiet rate change is caught the first time it is applied, not at year end.',
        'TCS & TDS Register': 'Every rupee the panels deducted as TCS, and TDS on job work, matched against the portal’s own figures — so the credit you claim is the credit you are owed.',
      } },
    '13': { tag: 'Sell more without cutting the price',
      intro: 'Plan the festive calendar, run the campaigns, and let rules keep you competitive on the panels without giving the margin away.',
      apps: {
        'Repricing Engine': 'Rules per panel and per design — floor, ceiling, match-lowest and a festive override — so a Diwali sale does not quietly go below cost.',
        'Blog & Pages': 'How to drape it, what to wear it to, which fabric for which season — written, scheduled and published to your own site with the meta and internal links already set.',
      } },
    '14': { tag: 'Write it, shoot it, cut it — from your own catalogue',
      intro: 'Listings, ads, reels and product photography generated from your own designs, in a voice that sounds like one person from Surat rather than a template — so the words match the piece and the picture is the size Myntra actually wants.',
      apps: {
        'Content Engine': 'Fourteen stages in your own voice — buyer psychology, competitor reading, hooks, the product description, marketplace copy for Amazon and Myntra, ad variations, reel scripts, song lyrics for the reel, the calendar, size chart and alt text.',
        'Image Studio': 'A phone photo becomes a listing image: layers, free transform, background removal, Myntra 1080×1440 and every other channel preset, watermark and SEO alt text.',
        'Design Studio': 'Banners, festive creatives and thumbnails — templates, layers, undo and redo, any colour, exact sizing and stock elements, exporting PNG, JPG or PDF at whatever size the panel or the printer asks for.',
        'Publisher': 'One push sends the listing, images and copy to the website and every panel, and reports back what went live and what a panel rejected, with the reason.',
      } },
    '15': { tag: 'The work that is not an order — and the talking around it',
      intro: 'An exhibition in Hyderabad, a boutique’s custom order, a new godown fit-out, a legal matter with a supplier. Work that is not a sales order still has a deadline, a cost and documents — and it belongs on the same records as everything else.',
      apps: {
        'Projects & Cases': 'An exhibition, a custom order for a chain, a fit-out or a dispute — stages you define, owners, deadlines, documents, hours and real cost, all on one record the ledger can see.',
        'Timesheets & Planning': 'Who is on what this week and the hours that actually went in — against a project, an exhibition or a machine — with billable and non-billable kept apart.',
        'Approvals': 'One queue for everything waiting on a yes: a mill purchase order, a boutique discount, a leave day, a credit note, a payment. The rule that sent it there is next to it, and the decision goes on the record.',
        'Discuss': 'The conversation attached to the record it is about — this order, this mill bill, this dispute — so a year later the reason for the decision is still sitting beside it.',
      } },
    '16': { tag: 'The spine the whole house runs on',
      intro: 'Not a module you open — the layer underneath all __NMOD__. Who can see what, how Vastrangam is configured, and a record of everything that ever happened.',
      apps: {
        'Ask & Print': 'At an exhibition in Hyderabad, send one line from your phone: “ledger Kalamandir”, “print slips”. It comes back as a PDF, or it prints at the Surat office — with nothing plugged into your phone and nothing at the office open to the internet.',
      } },
  },
};
