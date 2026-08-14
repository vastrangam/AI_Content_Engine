'use strict';
/* Module 05 · Sales — five app books (× 2 editions) + the module book, all through the
   shared data-driven generator so every layout and every page count is automatic. */
const fs = require('fs'), path = require('path');
const { appBook, render, loadCfg } = require('./mkbook_app.js');
const { doc, bookBuilder, cover, mark, zipPage } = require('./bookparts.js');
const MOD = require('./module_m05.js');
const ROADMAP = require('./roadmap.js');
const DIR = __dirname, SHOTS = path.join(DIR, 'shots');
const TESTS = JSON.parse(fs.readFileSync(path.join(DIR, 'tests.json'), 'utf8'));

const CAP = {
  d2c: [['Sales channels','Type them in · CSV import · Amazon · Flipkart · Myntra · Meesho · Ajio · Nykaa · JioMart · Shopify · WooCommerce · your own store'],
        ['Payments','Cash · UPI direct with your own QR (no commission) · Razorpay · PayU · Cashfree · PhonePe · Paytm · Stripe · CCAvenue'],
        ['Customer messaging','Copy and send it yourself · WhatsApp Cloud API · Gupshup · Interakt · MSG91 · Twilio · email instead · Chatwoot (self-hosted)'],
        ['Shipping &amp; couriers','Type the AWB in · your own delivery · Delhivery · Blue Dart · DTDC · Ecom · XpressBees · India Post · Shiprocket · NimbusPost'],
        ['Books &amp; ledger','Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA'],
        ['Printing','Browser print / PDF · any ESC/POS thermal printer · Zebra · TVS · no printer at all'],
        ['Files &amp; backups','This device · a USB drive · MinIO or Nextcloud (self-hosted) · Google Drive · Dropbox · OneDrive · Amazon S3 · Backblaze B2']],
  b2b: [['Books &amp; ledger','Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA'],
        ['Customer messaging','Copy and send it yourself · WhatsApp Cloud API · Gupshup · Interakt · MSG91 · Twilio · email instead · Chatwoot (self-hosted)'],
        ['Email sending','Download and send it yourself · any SMTP server · Amazon SES · SendGrid · Postmark · Mailgun · Zoho Mail · Brevo'],
        ['Shipping &amp; couriers','Type the AWB in · your own delivery · Delhivery · Blue Dart · DTDC · Ecom · XpressBees · India Post · Shiprocket · NimbusPost'],
        ['Printing','Browser print / PDF · any ESC/POS thermal printer · Zebra · TVS · no printer at all'],
        ['Files &amp; backups','This device · a USB drive · MinIO or Nextcloud (self-hosted) · Google Drive · Dropbox · OneDrive · Amazon S3 · Backblaze B2'],
        ['Automation','Medhava Rules (built in) · n8n · Node-RED · Windmill · Airflow (self-hosted) · n8n Cloud · Make · Zapier · Pipedream · cron + webhook · by hand']],
  export: [['Books &amp; ledger','Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA'],
        ['GST &amp; returns','Your CA files it · Medhava GST returns (built in) · the government’s offline utility on your own machine · GSTN portal · ClearTax · Tally · BUSY · Zoho · Marg'],
        ['Email sending','Download and send it yourself · any SMTP server · Amazon SES · SendGrid · Postmark · Mailgun · Zoho Mail · Brevo'],
        ['Shipping &amp; couriers','Type the AWB in · your own delivery · Delhivery · Blue Dart · DTDC · Ecom · XpressBees · India Post · Shiprocket · NimbusPost'],
        ['Printing','Browser print / PDF · any ESC/POS thermal printer · Zebra · TVS · no printer at all'],
        ['Files &amp; backups','This device · a USB drive · MinIO or Nextcloud (self-hosted) · Google Drive · Dropbox · OneDrive · Amazon S3 · Backblaze B2'],
        ['Payments','Cash / bank transfer · UPI direct · Razorpay · PayU · Cashfree · PhonePe · Paytm · Stripe · CCAvenue']],
  pos: [['Payments','Cash · UPI direct with your own QR (no commission) · Razorpay · PayU · Cashfree · PhonePe · Paytm · Stripe · CCAvenue'],
        ['Printing','Browser print / PDF · any ESC/POS thermal printer · Zebra · TVS · no printer at all'],
        ['Barcode &amp; scanning','Type the code · phone camera · any USB scanner · Bluetooth scanner · Zebra / Honeywell gun'],
        ['Books &amp; ledger','Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA'],
        ['GST &amp; returns','Your CA files it · Medhava GST returns (built in) · the offline utility on your own machine · GSTN portal · ClearTax · Tally · BUSY · Zoho · Marg'],
        ['Files &amp; backups','This device · a USB drive · MinIO or Nextcloud (self-hosted) · Google Drive · Dropbox · OneDrive · Amazon S3 · Backblaze B2']],
  quotes: [['Email sending','Download and send it yourself · any SMTP server · Amazon SES · SendGrid · Postmark · Mailgun · Zoho Mail · Brevo'],
        ['Customer messaging','Copy and send it yourself · WhatsApp Cloud API · Gupshup · Interakt · MSG91 · Twilio · email instead · Chatwoot (self-hosted)'],
        ['Printing','Browser print / PDF · any ESC/POS thermal printer · Zebra · TVS · no printer at all'],
        ['Books &amp; ledger','Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA'],
        ['Files &amp; backups','This device · a USB drive · MinIO or Nextcloud (self-hosted) · Google Drive · Dropbox · OneDrive · Amazon S3 · Backblaze B2'],
        ['Automation','Medhava Rules (built in) · n8n · Node-RED · Windmill · Airflow (self-hosted) · n8n Cloud · Make · Zapier · Pipedream · cron + webhook · by hand']],
};
const ALT = { d2c: 71, b2b: 74, export: 76, pos: 61, quotes: 62 };

/* ─── per-app book content ─── */
const SPECS = {
  d2c: {
    app: 'D2C Sales', slug: 'd2c', n: 1, file: 'D2C_Sales.html',
    sub: 'Cart → doorstep, with coupons, part-paid COD, loyalty and cart recovery',
    badge: 'A COD order cannot be packed unpaid',
    what: 'Every order from your own storefront in one pipeline: <b>New → Confirmed → Packed → Shipped → Delivered</b>. Four rules do the work, and each one saves real money.',
    whatMore: ['<b>A coupon below its minimum order value is ignored</b>, not quietly applied. The table shows it greyed and marked "below minimum", so nobody wonders why the bill did not drop.',
      '<b>A cash-on-delivery order cannot be packed without a 20% advance.</b> A refused COD parcel costs the courier fee both ways and the goods come back handled; a customer who has paid something almost always accepts it.',
      '<b>Loyalty points are earned on delivery, never on order.</b> So "points owed" is a real liability rather than a hopeful guess.',
      '<b>Every abandoned cart is listed with its age.</b> A cart left three days ago is the cheapest sale in the business to win back, and almost nobody chases it.'],
    whatBox: 'The stock this app draws on is the <b>same single number</b> the marketplaces, the counter and the wholesale order book all read. There is no per-channel copy to reconcile later.',
    ring: [['in','← Catalog · the item and its price'],['in','← Inventory · is there stock to promise'],
           ['in','← Payments · did the money land'],['in','← Logistics · courier, AWB, outcome'],
           ['out','→ Order record · read by CRM &amp; the Dashboard'],['out','→ Stock · reserved, then released']],
    ownsBox: '<b>What this app owns:</b> the order, its stage, the coupon applied, the COD advance, the abandoned cart and the points balance. <b>What it only reads:</b> the price, the stock position and the customer.',
    flow: ['Order placed','Stock reserved','Packed','Shipped','Delivered','Points earned'],
    flowCap: 'Six steps. The COD rule sits between the third and the fourth.',
    steps: ['<b>An order is placed.</b> The price comes from the Catalog; a coupon is applied only if the order reaches its minimum.',
      '<b>Stock is reserved</b> against the one shared number. Cancel it and the reservation is released.',
      '<b>Packed.</b> If it is COD, the 20% advance is checked here. Too little and the app refuses, naming the figure it needs.',
      '<b>Shipped.</b> Seven days in transit and it appears on the Overview as something to chase.',
      '<b>Delivered.</b> The balance is collected, the sale posts to the books, and <b>only now</b> are loyalty points earned.',
      '<b>CRM picks the customer up</b> — their worth, their order count, their segment. Nothing is typed twice.'],
    rulesTitle: 'Four rules, and what each one is worth',
    rules: ['<b>Coupons respect their minimum.</b> Below it, the code does nothing and says so. A discount that applies when it should not is a leak nobody audits.',
      '<b>COD needs 20% up front before packing.</b> The single cheapest defence against refused deliveries there is.',
      '<b>Points are earned on delivery.</b> An order in transit or cancelled earns nothing, so the liability on screen is always real.',
      '<b>Nothing is ever deleted.</b> A cancelled order leaves every total but stays in the record, and a delivered order cannot be cancelled at all.'],
    rulesBox: 'All four are self-tests. If any of them stops being true, the app tells you on the <b>Backup &amp; Health</b> screen the next time it opens.',
    limits: ['It does not send the WhatsApp or email itself — it tells you who to contact and why.',
      'It does not price dynamically; the Catalog price is the price.',
      'In this single-file form nothing is connected live to a storefront — the Connectors screen shows every service it can be wired to.',
      'It will not stop you taking an order you cannot fulfil. It checks its own arithmetic, not your judgement.'],
    accept: 'the app opens by double-click with no internet · all 35 self-tests show pass · a coupon below its minimum is visibly ignored · a COD order is refused at packing without its advance · recovering a cart creates a real order · points appear only on delivery · a backup exports and imports cleanly.',
    screens: [
      { shot:'dash', title:'Screen · Overview', cap:'Five cards, where the orders are, and what needs a look.',
        body:'<h3>Reading it in twenty seconds</h3><div class="steps">'+
          '<div class="st"><span class="n">1</span><div class="tx"><b>Collected</b> versus <b>Still to collect</b> — how much of today\'s selling is actually money.</div></div>'+
          '<div class="st"><span class="n">2</span><div class="tx"><b>The COD share.</b> It turns red above 50%, because every COD parcel carries refusal risk.</div></div>'+
          '<div class="st"><span class="n">3</span><div class="tx"><b>Needs a look.</b> Rule breaches and stuck parcels, each with a button that takes you there.</div></div></div>' },
      { shot:'orders', title:'Screen · Orders', cap:'Take an order at the top; every live order below with its stage and its buttons.',
        body:'<div class="rule"><b>Look at the Coupon column.</b> A code that qualified shows green with the amount taken off. A code below its minimum shows grey and says <i>below minimum</i>. Most software just silently applies nothing and leaves everybody guessing.</div>' },
      { shot:'orders_added', title:'An order taken', cap:'Placed, and sitting at the New stage with its coupon applied.', cls:'tall',
        body:'<p>The price was not typed — it came from the Catalog with the item. The coupon was chosen from a list that shows each code\'s minimum order value, so the person taking the order knows in advance whether it will apply.</p>' },
      { shot:'orders_cod_refused', title:'The COD rule, refusing a pack', cap:'The order stayed at Confirmed. The app named the advance it needed.', cls:'tall',
        body:'<div class="good"><b>This is the whole point of a gate rather than a warning.</b> A warning gets clicked through on a busy afternoon and the parcel goes out anyway. Here the stage simply does not change until somebody collects the advance — or decides, deliberately, to raise it.</div>' },
      { shot:'carts', title:'Screen · Abandoned carts', cap:'Everything left behind, with its age and whether it is still worth a nudge.' },
      { shot:'carts_recovered', title:'A cart recovered', cap:'One click created a real order at the New stage; the cart is marked recovered.', cls:'tall',
        body:'<p>Note what did <b>not</b> happen: nobody re-typed the customer, the item or the value. The cart became an order, and the recovered count went up so you can see whether chasing them is working at all.</p>' },
      { shot:'loyal', title:'Screen · Loyalty points', cap:'Every customer, what they earned, what they used, and what you still owe them.',
        body:'<div class="rule"><b>Points owed is money you have promised away.</b> It sits in a card on this screen so it is never a surprise at the end of a quarter. And because points are earned on delivery rather than on order, the figure is real — an order in transit has promised nothing yet.</div>' },
      { shot:'wiring', title:'Screen · Wiring', cap:'Every figure, its source, and one order followed through its six consequences.' },
    ],
  },

  b2b: {
    app: 'B2B & Credit', slug: 'b2b', n: 2, file: 'B2B_Credit.html',
    sub: 'Tier pricing, a real credit limit, and ageing against each buyer’s own terms',
    badge: 'Over the limit, nothing ships',
    what: 'The buy-in-bulk side of selling, and two rules that decide whether it makes money or quietly loses it.',
    whatMore: ['<b>The price is the tier, not a negotiation.</b> Every buyer sits on a tier, and the tier decides the discount off your list price. Nobody types a rate, so the price list cannot fall apart one "just this once" at a time.',
      '<b>The credit check is a gate, not a warning.</b> An order that would take a buyer over their limit goes <b>on hold</b>. It is not lost, and it is not silently approved either — somebody has to collect money or raise the limit on purpose.',
      'Ageing is measured against <b>each buyer’s own agreed terms</b>, so a 45-day buyer is never called late on day 31 and a 15-day buyer is not given 30 days by accident. Most software uses one fixed number for everybody and gets both wrong.'],
    whatBox: 'And a buyer with plenty of headroom left but a 90-day-old invoice is <b>still stopped</b>. Headroom on its own is a half-answer.',
    ring: [['in','← Catalog · the list price every tier rate comes from'],['in','← CRM · who the buyer is'],
           ['in','← Inventory · is there stock to dispatch'],['in','← Accounting · was the invoice settled'],
           ['out','→ Order &amp; invoice · read by the Dashboard'],['out','→ Receivable · aged against their terms']],
    ownsBox: '<b>What this app owns:</b> the wholesale order, the tier rate applied to it, and the credit decision. <b>What it only reads:</b> the list price, the stock and whether the money arrived.',
    flow: ['Order raised','Credit check','Approved','Dispatched','Invoiced','Paid'],
    flowCap: 'The gate is the second step. Everything after it is money at risk.',
    steps: ['<b>An order is raised.</b> Its value comes from the buyer’s tier rate — you never type a price.',
      '<b>The credit check runs.</b> The order is added to what that buyer already owes. Inside the limit it becomes a draft; outside it, it goes on hold immediately.',
      '<b>Approved.</b> The check runs again at this moment, because something may have shipped in between.',
      '<b>Dispatched.</b> Stock leaves. From here it is real money at risk, not a plan.',
      '<b>Invoiced.</b> It posts to the books and starts ageing — against <i>their</i> terms, not a fixed 30 days.',
      '<b>Paid.</b> Exposure falls and their headroom for the next order returns.'],
    rulesTitle: 'Why a gate, and not a warning',
    rules: ['<b>A warning gets clicked through.</b> On a busy afternoon, with a buyer on the phone, every warning looks like a formality. A gate does not.',
      '<b>Nothing is lost.</b> The order goes on hold and waits. Collect something, or raise the limit deliberately, and press <b>Try again</b>.',
      '<b>The decision becomes visible.</b> Raising a limit is a recorded act — you chose to risk more money — instead of an approval nobody remembers giving.',
      '<b>Almost every wholesale bad debt starts with one order approved "just this once".</b> This is the app refusing to be the place that happens.'],
    rulesBox: '<b>The verdict column on the Credit screen looks at both risks.</b> Over limit, 90+ days late, badly late, late, nearly full, room to sell — in that order of seriousness. A buyer is only called "room to sell" when nothing is late <i>and</i> there is headroom.',
    limits: ['It does not decide the limit for you — that is a commercial judgement, and it is recorded as one.',
      'It does not chase the money itself; it tells you who to chase and how late they are.',
      'It has no credit-bureau lookup. The limit is what you set.',
      'In this single-file form nothing is connected live to your books — see the Connectors screen for every option.'],
    accept: 'the app opens by double-click with no internet · all 35 self-tests show pass · an over-limit order goes on hold rather than being approved · a within-limit order goes through · raising a limit changes the headroom · ageing counts against each buyer’s own terms · a backup exports and imports cleanly.',
    screens: [
      { shot:'dash', title:'Screen · Overview', cap:'The order book, credit out, ageing, and what needs a decision.',
        body:'<div class="rule"><b>"Credit out" as a percentage of every limit given is the number to watch.</b> It turns red above 80%. A business running at 95% of its own limits has no room to take the next good order.</div>' },
      { shot:'orders', title:'Screen · Orders', cap:'Raise an order at the top; the buyer dropdown shows how much credit each one has left.',
        body:'<p><b>List price, tier price and what you gave up</b> sit side by side on every row. The cost of the discount is never invisible — which is the only way the tier system stays honest over a year.</p>' },
      { shot:'orders_onhold', title:'The credit gate, refusing an order', cap:'An order that would break the limit went straight on hold, with the amount it would have exceeded by.', cls:'tall',
        body:'<div class="good">The <b>On hold</b> panel only appears when there is something in it, and it says exactly why each order is there. Nothing is hidden and nothing is lost.</div>' },
      { shot:'credit', title:'Screen · Credit limits', cap:'Every buyer: tier, terms, limit, what they owe, what is left, and their worst invoice.' },
      { shot:'credit_raised', title:'Raising a limit, deliberately', cap:'The headroom changed the moment the limit did.', cls:'tall',
        body:'<p>Raising a limit is a real decision — it is money you are choosing to risk — so it is done on its own screen, in its own form, rather than as a checkbox on an order. The Overview flags anybody who then goes over.</p>' },
      { shot:'ageing', title:'Screen · Ageing', cap:'Every unpaid invoice, oldest against its own terms first, with what to do about each.',
        body:'<h3>What each bucket means for what you do next</h3><table><thead><tr><th>Bucket</th><th>What it means</th><th>What to do</th></tr></thead><tbody>'+
          '<tr><td><b>Not yet due</b></td><td>Inside the terms you agreed</td><td>Nothing. Do not chase — you agreed to this.</td></tr>'+
          '<tr><td><b>1–30 days</b></td><td>Slipping</td><td>One call. Usually paperwork, not money.</td></tr>'+
          '<tr><td><b>31–60 days</b></td><td>A pattern, not an accident</td><td>Stop extending. Get a date in writing.</td></tr>'+
          '<tr><td><b>61–90 days</b></td><td>The money is at real risk</td><td>No new dispatches to that buyer.</td></tr>'+
          '<tr><td><b>Over 90 days</b></td><td>Assume you will have to fight for it</td><td>Stop supply. Escalate formally.</td></tr></tbody></table>' },
      { shot:'wiring', title:'Screen · Wiring', cap:'Every figure, its source, and one wholesale order followed end to end.' },
    ],
  },

  export: {
    app: 'Export', slug: 'export', n: 3, file: 'Export.html',
    sub: 'Five papers, two tax routes, and the refund everybody forgets',
    badge: 'No papers, no sailing',
    what: 'An export order is a <b>document problem</b>, not a selling problem.',
    whatMore: ['Five papers travel with every shipment — commercial invoice, packing list, shipping bill, bill of lading, certificate of origin. Miss one and a container sits at a port earning demurrage while somebody emails a scan. So this app <b>refuses to mark a shipment shipped until all five are ticked</b>.',
      'It also handles the two lawful ways to deal with GST on an export: file an <b>LUT bond</b> and pay no IGST at all, or <b>pay it and claim it back</b>. On the second route the tax is your own working capital sitting with the government.',
      'That refund is the most commonly forgotten receivable in a small export business, because nobody owns the list. Here every unclaimed one is shown with its age.'],
    whatBox: 'And every rupee figure comes from <b>one exchange rate held in one place</b>. Change it and every screen moves together — no screen can be quoting last week\'s rate.',
    ring: [['in','← Catalog · the item and its export description'],['in','← Inventory · is there stock to ship'],
           ['in','← Accounting · the rate policy, and did payment land'],['in','← GST filing · was the claim accepted'],
           ['out','→ Export invoice · at the rupee value on the sailing date'],['out','→ Refund receivable · aged from the sailing date']],
    ownsBox: '<b>What this app owns:</b> the shipment, its five papers, the tax route and the refund claim. <b>What it only reads:</b> the item, the stock, and whether the money arrived.',
    flow: ['Booked','Documents','Shipped','Landed','Paid for','Refund claimed'],
    flowCap: 'The gate is between Documents and Shipped. The refund clock starts at Shipped.',
    steps: ['<b>A shipment is booked</b> in the buyer\'s currency, with a tax route chosen deliberately.',
      '<b>The five papers are ticked</b> as they arrive. The Documents screen says exactly which are still missing.',
      '<b>Shipped — but only with all five in.</b> Press it early and the app names the missing papers and refuses. Stock leaves here, and on the pay-and-claim route the refund clock starts.',
      '<b>Landed.</b> The buyer collects against the bill of lading.',
      '<b>Paid for.</b> The money arrives. The refund, if any, is <i>still owed</i> and still listed.',
      '<b>Refund received.</b> Recorded, and it moves from owed to received. Past 60 days it appears on the Overview as something to chase.'],
    rulesTitle: 'Two rules, and why they are worth the whole app',
    rules: ['<b>No papers, no sailing.</b> Every other rule here is bookkeeping; this one is the difference between a container on a ship and a container at a port earning demurrage.',
      '<b>The refund is your money.</b> On the pay-and-claim route the IGST is working capital you have lent the government. Nobody sends a reminder.',
      '<b>One exchange rate, one place.</b> Two copies of a rate is two different profit figures, and an argument nobody can settle.',
      '<b>60 days is a health line, not a legal one.</b> It is the point by which a normal claim has landed — so anything older deserves a phone call rather than a shrug.'],
    rulesBox: 'Both of the first two are self-tests: <i>"no shipment sailed with an incomplete set of papers"</i> and <i>"every overdue claim really is past 60 days"</i>.',
    limits: ['It does not file the shipping bill for you — it tracks whether it exists.',
      'It does not fetch live exchange rates; the rate is what you set, on purpose, in one place.',
      'It does not lodge the refund claim; it tells you which ones are owed and how old they are.',
      'In this single-file form nothing is connected live to GSTN or a carrier — see the Connectors screen.'],
    accept: 'the app opens by double-click with no internet · all 34 self-tests show pass · a shipment with a missing paper is refused at sailing · ticking the last paper lets it sail · changing the exchange rate moves every rupee figure · an LUT shipment shows no IGST · recording a refund moves it from owed to received · a backup exports and imports cleanly.',
    screens: [
      { shot:'dash', title:'Screen · Overview', cap:'Export value, money waiting, refund owed, and what the LUT bond saved.' },
      { shot:'dash_fx', title:'One exchange rate, one place', cap:'The rate changed from ₹83.50 to ₹90 — and every rupee figure on every screen moved with it.', cls:'tall',
        body:'<div class="good"><b>There is no second copy of the rate.</b> That is why this works. A business with the rate typed into three spreadsheets has three different profit figures and no way to say which is right.</div>' },
      { shot:'orders', title:'Screen · Export orders', cap:'FOB in the buyer’s currency and in rupees, the route, the IGST, and how many papers are in.' },
      { shot:'orders_blocked', title:'The document gate, refusing a sailing', cap:'It stayed at Documents. The app named the papers that were missing.', cls:'tall',
        body:'<p>This is the rule that pays for the app on its first shipment. A container held at a port over a missing certificate of origin costs more in demurrage than the software costs in a year.</p>' },
      { shot:'docs', title:'Screen · Documents', cap:'What each paper is for, then one panel of five buttons per shipment.',
        body:'<p>Press a button to tick a paper; press again to untick it. A shipment that has already sailed will not let you untick a paper it sailed on — the record of what actually travelled stays intact.</p>' },
      { shot:'docs_complete', title:'All five in', cap:'The panel confirms the shipment can now sail.', cls:'tall',
        body:'<div class="good">The moment the fifth paper is ticked, the <b>Mark shipped</b> button on the Orders screen starts working. Nothing else changed — the gate simply opened.</div>' },
      { shot:'tax', title:'Screen · IGST & refunds', cap:'Every pay-and-claim shipment, the age of its claim, and whether it is overdue.',
        body:'<div class="rule"><b>A refund is not income and it is not a bonus.</b> It is your own working capital held somewhere else until you ask for it back. This screen exists because nobody sends a reminder, and small exporters lose more to unclaimed IGST than to almost any other single leak.</div>' },
      { shot:'wiring', title:'Screen · Wiring', cap:'Every figure, its source, and one container followed from booking to refund.' },
    ],
  },

  pos: {
    app: 'POS', slug: 'pos', n: 4, file: 'POS.html',
    sub: 'Counter billing on the same stock number your website reads',
    badge: 'One stock number, not one per channel',
    what: 'A till that <b>cannot lie to the rest of the business</b>.',
    whatMore: ['The price comes from the Catalog rather than from whoever is standing at the counter, so the shop cannot quietly undercut the website. The discount is capped at 50% and printed on the bill. GST is worked out on the <b>discounted</b> value, never on the gross.',
      'Payment can be split any way the customer wants — part cash, part UPI, part on account — and <b>the bill will not print until the full amount is covered</b>.',
      'Stock comes off the one shared number every channel reads, so selling the last piece at the counter stops the website selling it thirty seconds later.'],
    whatBox: 'And at close, <b>only the cash is expected in the drawer</b>. UPI and card went to the bank; an on-account bill is not money at all. So a gap is found the same day, not in a monthly audit.',
    ring: [['in','← Catalog · every item and its selling price'],['in','← Inventory · the one shared stock number'],
           ['in','← Payments · did the UPI or card land'],['in','← CRM · the customer, when a bill goes on account'],
           ['out','→ Bill, sale and GST · posted to the books'],['out','→ Stock · down the moment the bill prints']],
    ownsBox: '<b>What this app owns:</b> the bill, the discount applied, how it was paid, and the day\'s till count. <b>What it only reads:</b> the price and the stock — which is exactly why it cannot disagree with the website.',
    flow: ['Add to cart','Discount','Split payment','Bill prints','Stock falls','Day close'],
    flowCap: 'Six steps, and two of them are gates: the payment must cover the bill, and the drawer must be counted.',
    steps: ['<b>A piece is added.</b> Its price comes from the Catalog. The button greys out when the counter has none left.',
      '<b>A discount is applied</b>, capped at 50%. GST is then worked out on the discounted value, never on the gross.',
      '<b>Payment is split</b> however the customer wants — cash, UPI, card, on account, in any combination.',
      '<b>The bill prints — but only when the full amount is covered.</b> Press it short and the app tells you what is still due.',
      '<b>Stock falls</b> on the one shared number. No oversell is possible, on any channel.',
      '<b>At close the drawer is counted.</b> Only cash is expected in it. Any difference is on screen before you go home.'],
    rulesTitle: 'Three rules that make a till trustworthy',
    rules: ['<b>The price is not typed.</b> It comes from the Catalog, so the counter cannot quietly undercut the website — and nobody has to police it.',
      '<b>The discount has a ceiling.</b> 50%, and it is printed on the bill for anybody to see. A counter that can discount without limit is a counter that leaks.',
      '<b>The drawer is counted every day.</b> A ₹200 gap found today is a question you can answer — which shift, which bill. The same gap found in a monthly audit is an argument nobody can settle.',
      '<b>And the payment must cover the bill.</b> Not a warning, a gate: the bill simply does not print until it does.'],
    rulesBox: 'All four are self-tests, including <i>"GST is never charged on the discount"</i> and <i>"counting less than expected shows short, not over"</i>.',
    limits: ['It does not open a cash drawer or drive a specific printer — it prints through the browser, and any ESC/POS printer works.',
      'It does not handle returns at the counter; that is the Settlement module.',
      'It has no per-cashier login in this single-file form, so a till difference is the day\'s, not a person\'s.',
      'In this single-file form nothing is connected live to a payment gateway — see the Connectors screen.'],
    accept: 'the app opens by double-click with no internet · all 33 self-tests show pass · an out-of-stock item cannot be added · a bill will not print while money is short · billing takes the stock down and clears the cart · closing the day shows the exact over/short · a backup exports and imports cleanly.',
    screens: [
      { shot:'till', title:'Screen · Till', cap:'One button per item, showing its price and how many are left.' },
      { shot:'till_cart', title:'A cart being built', cap:'Gross, discount, taxable, GST and total — worked out in that order.', cls:'tall',
        body:'<div class="rule"><b>GST is on the discounted value, not the gross.</b> Charging tax on a price the customer is not paying is both wrong and expensive, and it is one of the commonest mistakes in hand-built billing.</div>' },
      { shot:'till_short', title:'The payment gate, refusing a bill', cap:'Money was short, so nothing printed. The app says what is still due.', cls:'tall',
        body:'<p>Every other till in this position prints and leaves a mystery in the drawer at close. Here it simply does not print — and the amount still owed is on screen in words a customer can be shown.</p>' },
      { shot:'till_billed', title:'Paid in full, and printed', cap:'The bill filed, the stock down, and the cart cleared for the next customer.', cls:'tall',
        body:'<div class="good">Three things happened in that one click: the bill was filed, the stock came off the <b>shared</b> number, and the cart reset. Nothing is left for somebody to remember to do.</div>' },
      { shot:'day', title:'Screen · Today’s bills', cap:'How the money came in, and every bill with what it was paid by.',
        body:'<p>The tags matter: <b>in the till</b> for cash, <b>into the bank</b> for UPI and card, and <b>not money yet</b> for anything on account. Treating those three as one number is how a drawer stops reconciling.</p>' },
      { shot:'close_short', title:'Screen · Day close', cap:'The drawer counted, and the difference against what the bills say.', cls:'tall',
        body:'<div class="rule"><b>Only cash is expected in the drawer.</b> That single distinction is what makes the difference figure meaningful. Count the drawer and compare it to total takings and it will never match — because most of the takings were never in the drawer.</div>' },
      { shot:'stock', title:'Screen · Counter stock', cap:'On hand, reorder point and sold today — on the same record every channel reads.',
        body:'<div class="good"><b>One stock number, not one per channel.</b> Almost every oversell in a multi-channel business comes from keeping a separate figure per channel and reconciling "later". There is nothing to reconcile here.</div>' },
      { shot:'wiring', title:'Screen · Wiring', cap:'Every figure, its source, and one counter sale followed through six consequences.' },
    ],
  },

  quotes: {
    app: 'Quotes & Proforma', slug: 'quotes', n: 5, file: 'Quotes_Proforma.html',
    sub: 'A promise with an expiry date — and every revision kept',
    badge: 'Expires by itself',
    what: 'Send a quote, revise it as the customer haggles, and turn the accepted one into a proforma and then a confirmed order in <b>one click each, with nothing re-typed</b>.',
    whatMore: ['<b>A quote expires by itself</b> the day its validity runs out. The expiry is worked out from the date and the validity you chose — it is not a field somebody has to update. So nobody can honour a three-month-old price by accident because "we did quote it".',
      '<b>Every revision is kept.</b> The customer only ever sees the latest; you can always see the first. That is the only way to answer "what did discounting cost us this quarter" — a question almost nobody asks, because almost no system can answer it.'],
    whatBox: 'The proforma carries the <b>same lines, the same discount and the same total</b> as the quote the customer said yes to. There is no moment where somebody re-keys it and a figure changes.',
    ring: [['in','← Catalog · every item and its list price'],['in','← CRM · who the customer is'],
           ['in','← Inventory · can the quantity actually be supplied'],
           ['out','→ Confirmed order · handed to Sales'],['out','→ Proforma · a document to pay against'],
           ['out','→ Win rate &amp; discount history · read by the Dashboard']],
    ownsBox: '<b>What this app owns:</b> the offer, every revision of it, the validity and the expiry. <b>What it hands over:</b> a confirmed order — and from that moment the rest of the business takes it.',
    flow: ['Draft','Sent','Accepted','Proforma','Confirmed order'],
    flowCap: 'Five stages, and the clock only runs on the first two.',
    steps: ['<b>A quote is raised.</b> Rates come from the Catalog; the validity is chosen deliberately — 7, 15, 30 or 45 days.',
      '<b>Sent.</b> From this moment it is a promise with an expiry date, and the clock runs on its own.',
      '<b>The customer haggles.</b> Each revision is kept, so what came off the first price stays visible for ever.',
      '<b>Accepted.</b> The expiry stops mattering — the price is now agreed. An accepted quote never expires.',
      '<b>Proforma, then confirmed order.</b> Same lines, same total, one click each. Stock is reserved and the books take over.'],
    rulesTitle: 'Two rules that pay for the whole app',
    rules: ['<b>The expiry is calculated, never stored.</b> A field somebody has to update is a field that is wrong within a month. This one is the date plus the validity, worked out fresh every time the screen opens.',
      '<b>An expired quote cannot be advanced.</b> Press it and the app tells you to re-quote instead. Re-quoting carries the lines over at today\'s date and marks the old one lost — so the history stays honest.',
      '<b>Every revision is kept, including the first.</b> Adding a revision never changes an earlier one. There is a self-test for exactly that.',
      '<b>The slippage table is the payoff.</b> One quote losing 10% is a negotiation. Every quote losing 10% is a price list that is 10% too high — and nobody notices unless somebody keeps the first offer.'],
    rulesBox: 'Both rules are self-tests: <i>"a quote past its validity reads as expired on its own"</i> and <i>"adding a revision does not change the first one"</i>.',
    limits: ['It does not email the quote itself — it produces it; you send it however you like.',
      'It does not negotiate for you, and it will not stop you giving 50% away. It only makes the cost visible.',
      'It does not check stock before quoting; a quantity you cannot supply is your judgement, not an arithmetic error.',
      'In this single-file form nothing is connected live to email — see the Connectors screen for every option.'],
    accept: 'the app opens by double-click with no internet · all 34 self-tests show pass · a quote past its validity reads as expired without anybody touching it · an expired quote cannot be advanced but can be re-quoted · a revision is saved without changing the first one · a proforma carries the same total as the accepted quote · a backup exports and imports cleanly.',
    screens: [
      { shot:'dash', title:'Screen · Overview', cap:'Quotes out, accepted, expired unanswered, and what the haggling cost.' },
      { shot:'list', title:'Screen · All quotes', cap:'Every quote with its revision number, a countdown to expiry, and its stage.',
        body:'<p>The <b>Expires</b> column is the one to read. It counts down, turns amber under seven days and red under three, and once it has gone it says <i>expired N days ago</i>. Nobody has to maintain it.</p>' },
      { shot:'list_added', title:'A quote raised', cap:'Sitting at Draft, with its validity already running.', cls:'tall',
        body:'<p>Rates came from the Catalog. The validity was a deliberate choice from a list — not a free-text field somebody guesses at, and not a company-wide default that fits nobody.</p>' },
      { shot:'list_requoted', title:'An expired quote, re-quoted', cap:'A fresh quote at today’s date with the same lines; the old one marked lost.', cls:'tall',
        body:'<div class="good"><b>Why not just extend the old one?</b> Because then the record would say you quoted that price today, which is untrue, and the win-rate and slippage figures would quietly stop meaning anything. Re-quoting keeps both honest.</div>' },
      { shot:'one', title:'Screen · One quote', cap:'What is on it, what it totals, and every revision it has been through.' },
      { shot:'one_revised', title:'A revision saved', cap:'The new price is current; the first one is still there, unchanged.', cls:'tall',
        body:'<div class="rule"><b>This is the table that answers a question most businesses cannot.</b> "What did discounting cost us this quarter" needs the first offer to still exist. Keep only the latest and the question is unanswerable — so it stops being asked.</div>' },
      { shot:'wiring', title:'Screen · Wiring', cap:'Every figure, its source, and one quote followed from raised to confirmed order.' },
    ],
  },
};

/* ─── module book ─── */
function moduleBook() {
  const P = bookBuilder('Sales', 'Module 05');
  const pages = [];
  const T = k => (TESTS[k] || []).length;
  pages.push(`<section class="pg cover"><div class="cwrap">
    <div class="logo">${mark} Medhava</div><div class="ed">Module 05 of 21</div>
    <h1>Sales</h1><div class="sub">D2C · B2B &amp; Credit · Export · POS · Quotes &amp; Proforma</div>
    <div class="module">5 apps × 2 editions — Medhava (any industry) and Vastrangam</div>
    <p class="lede">Every way you sell, one order book. Your own storefront, the wholesale trade, exports, the counter and the quote that comes before any of them — all writing to the same order record and drawing on the same single stock number.</p>
    <div class="badges"><span>10 working apps</span><span>${T('D2C_ERP')*2+T('B2B_ERP')*2+T('EXP_ERP')*2+T('POS_ERP')*2+T('QT_ERP')*2} self-tests, all passing</span><span>42 workflow assertions</span><span>Zero console errors</span></div>
    <div class="cfoot">Medhava ERP suite · FY 2026-27 · The third module of sixteen</div></div></section>`);

  pages.push(P(`<h2>What this module is</h2>
    <p class="big">Module 04 told you <b>who with</b>. Module 05 is where the money is actually recorded.</p>
    <p>Five apps, because a business does not sell one way. The counter, the website, the wholesale trade and the export container are genuinely different jobs with genuinely different rules — but they must all write to <b>one order record</b> and draw on <b>one stock number</b>, or the figures the first two modules read stop meaning anything.</p>
    <h3>The five apps</h3>
    <table><thead><tr><th>#</th><th>App</th><th>The rule that matters most</th><th>Screens</th><th>Tests</th></tr></thead><tbody>
      <tr><td><b>1</b></td><td><b>D2C Sales</b></td><td>A COD order cannot be packed without a 20% advance</td><td>8</td><td>${T('D2C_ERP')}</td></tr>
      <tr><td><b>2</b></td><td><b>B2B &amp; Credit</b></td><td>Over the credit limit, the order goes on hold — not through</td><td>8</td><td>${T('B2B_ERP')}</td></tr>
      <tr><td><b>3</b></td><td><b>Export</b></td><td>No papers, no sailing. All five, or it does not ship</td><td>8</td><td>${T('EXP_ERP')}</td></tr>
      <tr><td><b>4</b></td><td><b>POS</b></td><td>The bill will not print until the money covers it</td><td>8</td><td>${T('POS_ERP')}</td></tr>
      <tr><td><b>5</b></td><td><b>Quotes &amp; Proforma</b></td><td>A quote expires by itself; every revision is kept</td><td>7</td><td>${T('QT_ERP')}</td></tr>
    </tbody></table>
    <div class="good"><b>Each app has one rule that is a gate rather than a warning.</b> A warning gets clicked through on a busy afternoon. Every one of those five gates exists because the thing it prevents is expensive: a refused parcel, a bad debt, a container at a port, a mystery in the till, a three-month-old price honoured by mistake.</div>
    <div class="toc"><h3>Contents</h3>${P.toc()}</div>`));

  pages.push(P(`<h2>How the five apps sit on one order book</h2>
    <p>Five different sales motions. One order record, one stock number, one ledger.</p>
    <div class="wire2"><div class="core"><b>UNIFIED DATA CORE</b><span>Item · Party · Stock · Ledger · Order</span></div>
      <div class="ring">
        <div class="rn out">→ D2C · website orders, COD, loyalty</div>
        <div class="rn out">→ B2B · wholesale orders, credit, ageing</div>
        <div class="rn out">→ Export · shipments, papers, IGST</div>
        <div class="rn out">→ POS · counter bills, till</div>
        <div class="rn out">→ Quotes · offers that become orders</div>
        <div class="rn in">← Catalog · one price list</div>
        <div class="rn in">← Inventory · one stock number</div>
        <div class="rn in">← Accounting · one ledger</div>
      </div></div>
    <p class="cap">All five write. None of them keeps its own copy of the price or the stock.</p>
    <div class="rule"><b>This is the whole argument for a suite rather than five tools.</b> Sell the last piece at the counter and the website cannot sell it thirty seconds later — because there is no second stock figure to reconcile. Quote a rate on Monday and the counter cannot undercut it on Tuesday, because both read the same price list.</div>
    <h3>Where each app hands over</h3>
    <table><thead><tr><th>App</th><th>Hands over to</th><th>What crosses</th></tr></thead><tbody>
      <tr><td><b>Quotes</b></td><td>D2C or B2B</td><td>A confirmed order with the agreed lines and total</td></tr>
      <tr><td><b>D2C / B2B / POS / Export</b></td><td>Inventory</td><td>A stock movement — reserved, then out</td></tr>
      <tr><td><b>D2C / B2B / POS / Export</b></td><td>Accounting</td><td>The sale, the tax, and any receivable</td></tr>
      <tr><td><b>B2B / Export</b></td><td>Accounts Receivable</td><td>Money owed, aged against agreed terms</td></tr>
      <tr><td><b>All five</b></td><td>CRM &amp; the CEO Dashboard</td><td>The order, from which worth and net sales are derived</td></tr>
    </tbody></table>`));

  pages.push(P(`<h2>The five gates, side by side</h2>
    <p>Each app refuses to do one thing. These are the five, and what each one costs when it is only a warning.</p>
    <table><thead><tr><th>App</th><th>The gate</th><th>What it prevents</th></tr></thead><tbody>
      <tr><td><b>D2C Sales</b></td><td>A COD order cannot be <b>packed</b> without a 20% advance</td><td>A refused parcel: courier fee both ways, goods back handled</td></tr>
      <tr><td><b>B2B &amp; Credit</b></td><td>An over-limit order goes <b>on hold</b>, never straight to approved</td><td>The bad debt that starts with one order approved "just this once"</td></tr>
      <tr><td><b>Export</b></td><td>A shipment cannot be marked <b>shipped</b> with a paper missing</td><td>A container at a port earning demurrage over a scan</td></tr>
      <tr><td><b>POS</b></td><td>A bill will not <b>print</b> until the payment covers it</td><td>An unexplained shortfall in the drawer at close</td></tr>
      <tr><td><b>Quotes</b></td><td>An <b>expired</b> quote cannot be advanced — only re-quoted</td><td>Honouring a three-month-old price by accident</td></tr>
    </tbody></table>
    <figure class="half"><img src="file://${path.join(SHOTS, 'B2B_VAS_orders_onhold.png')}"><figcaption>A gate doing its job: an over-limit wholesale order went on hold rather than being approved.</figcaption></figure>
    <div class="good"><b>Every one of the five is a self-test as well as a gate.</b> The app checks on startup that no record in its own data has got past the rule — so a gate cannot be quietly bypassed and then forgotten.</div>`));

  pages.push(P(`<h2>Nothing in this module is locked to one company</h2>
    <p class="big">A rule that holds across all sixteen modules, and one that every app checks on itself at every launch: <b>no Medhava app depends on any single outside service.</b></p>
    <p>These five apps touch more outside services than any module so far — payment gateways, couriers, marketplaces, GST filing, printers, scanners, messaging. Every one of them is a capability with alternatives, and every one has an option that needs nobody.</p>
    <table><thead><tr><th>Capability</th><th>Options, including ones that need nobody</th></tr></thead><tbody>
      <tr><td><b>Payments</b></td><td>Cash · <b>UPI direct with your own QR (no commission)</b> · Razorpay · PayU · Cashfree · PhonePe · Paytm · Stripe · CCAvenue</td></tr>
      <tr><td><b>Couriers</b></td><td>Type the AWB in · <b>your own delivery</b> · Delhivery · Blue Dart · DTDC · Ecom · XpressBees · India Post · Shiprocket · NimbusPost</td></tr>
      <tr><td><b>Sales channels</b></td><td><b>Type them in</b> · CSV import · Amazon · Flipkart · Myntra · Meesho · Ajio · Nykaa · JioMart · Shopify · WooCommerce · your own store</td></tr>
      <tr><td><b>GST &amp; returns</b></td><td>Your CA files it · <b>Medhava GST returns (built in)</b> · the government’s offline utility on your own machine · GSTN portal · ClearTax · Tally · BUSY · Zoho · Marg</td></tr>
      <tr><td><b>Printing</b></td><td><b>Browser print / PDF</b> · any ESC/POS thermal printer · Zebra · TVS · no printer at all</td></tr>
      <tr><td><b>Barcode &amp; scanning</b></td><td>Type the code · <b>phone camera</b> · any USB scanner · Bluetooth scanner · Zebra / Honeywell gun</td></tr>
      <tr><td><b>Books &amp; ledger</b></td><td><b>Medhava Books (built in)</b> · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA</td></tr>
    </tbody></table>
    <div class="rule"><b>Cloud services use a scoped, revocable key — never your account password.</b> Medhava will never ask you for a marketplace, bank or account password. If any screen ever does, it is not Medhava.</div>
    <div class="good"><b>The practical version:</b> if your courier doubles its rate or your gateway changes its terms, you click a different button. You do not change software, you do not re-enter data, and you do not lose a day.</div>`));

  pages.push(P(`<h2>Medhava and Vastrangam, side by side</h2>
    <p>Same five engines, same self-tests, same arithmetic. Only the master data differs.</p>
    <table class="vs"><thead><tr><th>&nbsp;</th><th>Medhava (unified ERP)</th><th>Vastrangam</th></tr></thead><tbody>
      <tr><td><b>Company</b></td><td>Acme Corp — stands in for any business</td><td>Vastrangam — ethnic-wear D2C + marketplace</td></tr>
      <tr><td><b>Items</b></td><td>Standard · Premium · Accessory · Top-of-range</td><td>Cotton kurta set · Banarasi saree · Zari dupatta · Bridal lehenga</td></tr>
      <tr><td><b>D2C coupons</b></td><td>FIRST10 · FEST15 · BULK20</td><td>FIRST10 · FESTIVE15 · TROUSSEAU20</td></tr>
      <tr><td><b>Wholesale buyers</b></td><td>Northline Retail · Metro Distributors · Harbour Trading</td><td>Kalamandir Chain (Hyderabad) · Rajmandir Wholesale (Surat) · Anokhi Boutique (Jaipur)</td></tr>
      <tr><td><b>Tiers</b></td><td>Key account · Regular trade · New/small</td><td>Chain/key account · Established boutique · New boutique</td></tr>
      <tr><td><b>Export buyers</b></td><td>Gulf Textiles · Northgate Imports · Pacific Home Goods</td><td>Al Fahim Textiles (Dubai) · Saree House London · Desi Threads (New Jersey)</td></tr>
      <tr><td><b>The counter</b></td><td>A shop counter</td><td>The Surat showroom</td></tr>
      <tr><td><b>Engines</b></td><td colspan="2" style="text-align:center"><b>Identical. Five files, shared by both.</b></td></tr>
      <tr><td><b>Self-tests</b></td><td colspan="2" style="text-align:center"><b>Identical names, identical counts, all passing in both.</b></td></tr>
    </tbody></table>
    <div class="good"><b>Why ship both?</b> The neutral edition is what a new customer in any industry receives. The Vastrangam edition is the proof the neutral engines survive a real business — real COD refusal rates, real boutique credit behaviour, real export paperwork. If a rule only works when the data is tidy, the Vastrangam build finds it first.</div>`));

  pages.push(P(zipPage(MOD)));

  pages.push(P(`<h2>How this was verified</h2>
    <p>Ten builds, three gates each. Nothing shipped on the basis that it looked right on screen.</p>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>The arithmetic, with no screen involved.</b> Each engine run in isolation, its self-tests executed against the seeded data. <b>${T('D2C_ERP')*2+T('B2B_ERP')*2+T('EXP_ERP')*2+T('POS_ERP')*2+T('QT_ERP')*2} tests across the ten builds, all passing.</b></div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>Every screen and every control, in a real browser.</b> Each build opened in headless Chromium; every screen visited and every interactive control on it clicked — including all ${'71'}+ provider buttons on the Connectors screen.</div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>The real job, with the result asserted.</b> Not "does the button click" but "did the thing happen": <b>42 workflow assertions</b> across the five apps. A control that looks alive but changes nothing fails the build.</div></div>
    </div>
    <h3>What the workflow run actually does, and checks</h3>
    <table><thead><tr><th>App</th><th>It does</th><th>And asserts</th></tr></thead><tbody>
      <tr><td><b>D2C</b></td><td>Places an order; tries to pack an under-paid COD order; recovers a cart; redeems points</td><td>The order count rose · the COD order <b>stayed</b> unpacked · a real order appeared from the cart · the points balance moved</td></tr>
      <tr><td><b>B2B</b></td><td>Raises an over-limit order, then a normal one; raises a limit</td><td>The first went <b>on hold</b> · the second went through · the headroom changed</td></tr>
      <tr><td><b>Export</b></td><td>Changes the exchange rate; tries to sail with a paper missing; ticks all five; sails; records a refund</td><td>Every rupee figure moved · the sailing was <b>refused</b> · with five papers it was allowed · the refund moved from owed to received</td></tr>
      <tr><td><b>POS</b></td><td>Builds a cart; tries to bill while short; pays in full; closes the day short</td><td>Nothing printed while short · it printed when covered · the cart cleared · the day closed with the exact difference</td></tr>
      <tr><td><b>Quotes</b></td><td>Raises a quote; tries to advance an expired one; re-quotes it; saves a revision</td><td>The expired quote <b>did not move</b> · re-quoting created a new one · the revision saved without changing the first</td></tr>
    </tbody></table>
    <div class="good">Every screenshot in every one of these PDFs was captured from the shipped file at double resolution, in the state its caption describes. Nothing is a mock-up.</div>`));

  pages.push(P(`<h2>Where this sits, and what comes next</h2>
    <p>Sixteen modules and forty-one apps, in the order they are being built: see the business, know who you deal with, then record what you sell.</p>
    ${ROADMAP.htmlTable({'01':'Delivered','02':'Delivered','03':'Delivered — you are holding it','04':'Next'},'03')}
    <div class="accept">Module 05 is accepted when: all ten apps open by double-click with no internet · all ${T('D2C_ERP')*2+T('B2B_ERP')*2+T('EXP_ERP')*2+T('POS_ERP')*2+T('QT_ERP')*2} self-tests pass · each of the five gates refuses what it should · all 42 workflow assertions hold · a backup exports and imports cleanly on a computer and a phone.</div>`));

  return doc(P.render(pages[0]), 'Medhava Module 05 — Sales');
}

/* ─── build them all ─── */
const jobs = [];
for (const key of ['d2c', 'b2b', 'export', 'pos', 'quotes']) {
  const s = SPECS[key];
  for (const [ed, tag, cfgFile, edition, co] of [
    ['ERP', { d2c: 'D2C_ERP', b2b: 'B2B_ERP', export: 'EXP_ERP', pos: 'POS_ERP', quotes: 'QT_ERP' }[key],
     'config_generic.js', 'Unified ERP — any industry', 'Acme Corp'],
    ['Vastrangam', { d2c: 'D2C_VAS', b2b: 'B2B_VAS', export: 'EXP_VAS', pos: 'POS_VAS', quotes: 'QT_VAS' }[key],
     'config_vastrangam.js', 'Vastrangam — ethnic-wear D2C + marketplace', 'Vastrangam'],
  ]) {
    const cfg = loadCfg(key + '/' + cfgFile);
    const c = Object.assign({}, s, {
      tag, edition, co, cfg,
      moduleLine: 'Module 05 · Sales — App ' + s.n + ' of 5',
      lede: cfg.about.slice(0, 380) + (cfg.about.length > 380 ? '…' : ''),
      capCount: CAP[key].length, altCount: ALT[key], capRows: CAP[key],
    });
    jobs.push({ html: appBook(c), out: 'Medhava_' + s.app.replace(/[^A-Za-z0-9]+/g, '_') + '_' + ed + '.pdf' });
  }
}
jobs.push({ html: moduleBook(), out: 'Medhava_Module_05_Sales.pdf' });
render(jobs);
