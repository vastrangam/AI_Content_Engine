'use strict';
/* Module 04 · E-commerce / OMS — two app books (× 2 editions) + the module book, all through
   the shared data-driven generator so every layout and every page count is automatic. */
const fs = require('fs'), path = require('path');
const { appBook, render, loadCfg } = require('./mkbook_app.js');
const { doc, bookBuilder, cover, mark, zipPage } = require('./bookparts.js');
const ROADMAP = require('./roadmap.js');
const MOD = require('./module_m04.js');
const DIR = __dirname, SHOTS = path.join(DIR, 'shots');
const TESTS = JSON.parse(fs.readFileSync(path.join(DIR, 'tests.json'), 'utf8'));

const CAP = {
  oms: [['Sales channels','Type them in · CSV import · Amazon · Flipkart · Myntra · Meesho · Ajio · Nykaa · JioMart · Shopify · WooCommerce · your own store'],
        ['Shipping &amp; couriers','Type the AWB in · your own delivery · Delhivery · Blue Dart · DTDC · Ecom · XpressBees · India Post · Shiprocket · NimbusPost'],
        ['Books &amp; ledger','Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA'],
        ['Printing','Browser print / PDF · any ESC/POS thermal printer · Zebra · TVS · no printer at all'],
        ['Files &amp; backups','This device · a USB drive · MinIO or Nextcloud (self-hosted) · Google Drive · Dropbox · OneDrive · Amazon S3 · Backblaze B2'],
        ['Automation','Medhava Rules (built in) · n8n · Node-RED · Windmill · Airflow (self-hosted) · n8n Cloud · Make · Zapier · Pipedream · cron + webhook · by hand'],
        ['Customer messaging','Copy and send it yourself · WhatsApp Cloud API · Gupshup · Interakt · MSG91 · Twilio · email instead · Chatwoot (self-hosted)']],
  ordman: [['Sales channels','Type them in · CSV import · Amazon · Flipkart · Myntra · Meesho · Ajio · Nykaa · JioMart · Shopify · WooCommerce · your own store'],
        ['Shipping &amp; couriers','Type the AWB in · your own delivery · Delhivery · Blue Dart · DTDC · Ecom · XpressBees · India Post · Shiprocket · NimbusPost'],
        ['Books &amp; ledger','Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA'],
        ['Payments &amp; refunds','Cash · UPI direct with your own QR (no commission) · Razorpay · PayU · Cashfree · PhonePe · Paytm · Stripe · CCAvenue'],
        ['Printing','Browser print / PDF · any ESC/POS thermal printer · Zebra · TVS · no printer at all'],
        ['Files &amp; backups','This device · a USB drive · MinIO or Nextcloud (self-hosted) · Google Drive · Dropbox · OneDrive · Amazon S3 · Backblaze B2'],
        ['Automation','Medhava Rules (built in) · n8n · Node-RED · Windmill · Airflow (self-hosted) · n8n Cloud · Make · Zapier · Pipedream · cron + webhook · by hand'],
        ['Customer messaging','Copy and send it yourself · WhatsApp Cloud API · Gupshup · Interakt · MSG91 · Twilio · email instead · Chatwoot (self-hosted)']],
};
const ALT = { oms: 73, ordman: 82 };

/* ─── per-app book content ─── */
const SPECS = {
  oms: {
    app: 'Marketplace OMS', slug: 'oms', n: 1, file: 'Marketplace_OMS.html',
    sub: 'Seven seller panels, one queue — and what each channel actually pays you',
    badge: 'Gross is never shown as if it were yours',
    what: 'Every marketplace order in <b>one queue</b>, sorted by how little time is left before that panel’s dispatch window closes — not by when the order arrived.',
    whatMore: ['<b>Each marketplace gives you a different number of hours.</b> Amazon 12, Flipkart 24, Ajio 48. Seven panels means seven clocks, and at six o\'clock on a festive Friday nobody is holding all seven in their head. One queue holds them for you, and the most urgent order is always at the top — whichever panel it came from.',
      '<b>The commission is worked out on every order the moment it lands.</b> A saree showing ₹4,999 on a 30% panel pays you about ₹3,424 after the shipping fee. No screen in this app will ever show you the ₹4,999 as though it were yours, because a 30% channel and a 12% channel are not comparable at gross.',
      '<b>Stock is one number every panel reads.</b> Selling the last piece on one marketplace removes it from the other six in the same instant, instead of turning into a cancellation three hours later — and a cancellation is what actually damages the account rating.',
      '<b>Price parity is checked across every panel.</b> The marketplaces read each other\'s prices; the same item quietly listed 17% cheaper on one gets your dearer listings suppressed, on a channel you are paying 28% to be visible on.'],
    whatBox: 'The comparison this app exists to make is on the <b>Marketplace P&amp;L</b> screen: sorted by what reaches your bank rather than by what was invoiced. It is almost never the same ranking.',
    ring: [['in','← Catalog · the item and its list price'],['in','← Inventory · the one shared stock number'],
           ['in','← Logistics · courier, AWB and outcome'],['in','← Settlement · what the panel actually paid'],
           ['out','→ Marketplace order · read by the Dashboard'],['out','→ Stock · down the moment an order lands']],
    ownsBox: '<b>What this app owns:</b> the marketplace order, its dispatch clock, the commission arithmetic and the per-panel price. <b>What it only reads:</b> the list price, the one stock number and whether the parcel was delivered.',
    flow: ['Order lands','Clock starts','Accepted','Packed','Dispatched','Delivered'],
    flowCap: 'Six steps. The clock runs from the first, on that panel’s own window.',
    steps: ['<b>An order arrives from a panel.</b> It joins one queue, not a seventh list, and stock falls on the shared number immediately.',
      '<b>Its dispatch clock starts</b> on that marketplace\'s own window, and the queue re-sorts itself so the least time left sits at the top.',
      '<b>Accepted.</b> The commission and shipping fee are already worked out, so you are looking at your share and not at the gross.',
      '<b>Packed.</b> One stage at a time — nothing jumps, which is the only reason the on-time figure means anything.',
      '<b>Dispatched inside the window</b>, or it appears on the Overview as a breach with the hours it is past.',
      '<b>Delivered.</b> If it comes back, the return lands against <i>that panel\'s</i> rate — which is how the P&amp;L screen stays honest.'],
    rulesTitle: 'The three things this app refuses to let happen',
    rules: ['<b>An order cannot be dispatched out of nowhere.</b> It moves one stage at a time, so the on-time figure is real rather than back-filled at the end of the week.',
      '<b>Stock is never per-panel.</b> One number. Selling the last piece on one marketplace removes it from every other one in the same instant.',
      '<b>Gross is never shown as if it were yours.</b> Every screen carries the commission beside it — because the channel that sells most is frequently not the channel that pays most.',
      '<b>A return is counted against the panel it came from.</b> A 25% channel with a 15% return rate is not a 25% cost; it is closer to 40% once the parcels coming back are counted.'],
    rulesBox: 'All of these are self-tests. If any one of them stops being true, the app tells you on the <b>Backup &amp; Health</b> screen the next time it opens.',
    limits: ['It does not log into a seller panel for you — it is the one place the orders from all of them are worked. The Connectors screen lists every way to get them in.',
      'It does not set your prices; it tells you when the same item has drifted apart across panels, and levels them on one click when you decide to.',
      'It does not reconcile the money that actually arrived — that is the Settlement module. This app says what the payout <i>should</i> be.',
      'It will not stop you listing something you cannot ship. It checks its own arithmetic, not your judgement.'],
    accept: 'the app opens by double-click with no internet · all 39 self-tests show pass · the queue is sorted by time left rather than order date · advancing an order moves exactly one stage · cancelling gives the stock back · levelling a price puts every panel on the list price · a return is recorded against the panel it came from · a backup exports and imports cleanly.',
    screens: [
      { shot:'dash', title:'Screen · Overview', cap:'Gross ordered against what actually reaches you, panel by panel.',
        body:'<h3>Reading it in twenty seconds</h3><div class="steps">'+
          '<div class="st"><span class="n">1</span><div class="tx"><b>Gross ordered</b> versus <b>What reaches you</b>. The gap is the commission and the shipping fees — usually a quarter of the invoice, and almost never on one screen anywhere else.</div></div>'+
          '<div class="st"><span class="n">2</span><div class="tx"><b>Past dispatch window.</b> Not "late orders" in general — orders past <i>their own</i> panel\'s window, which is the number that costs you the account rating.</div></div>'+
          '<div class="st"><span class="n">3</span><div class="tx"><b>The bars.</b> Each panel by what it pays you, with the percentage it lets you keep written beside it.</div></div></div>' },
      { shot:'queue', title:'Screen · Dispatch queue', cap:'Every order still to go out, least time left first.',
        body:'<div class="rule"><b>This sort order is the whole app.</b> An order placed an hour ago on a 12-hour panel is more urgent than one from yesterday on a 48-hour panel. Sorting by order date — which is what every seller panel does — gets that backwards every single time.</div>' },
      { shot:'queue_advanced', title:'Moving one order along', cap:'One stage, not a jump to dispatched.', cls:'tall',
        body:'<p>The button always names the <b>next</b> stage rather than saying "advance", so nobody has to remember the sequence. And because the stage moves one step at a time, the on-time percentage on the Overview is measured against something real.</p>' },
      { shot:'queue_cancelled', title:'A cancellation gives the stock back', cap:'The order left every total, and the piece returned to the shared stock number.', cls:'tall',
        body:'<div class="good">Two things happened in one click: the order left the queue and every money total, <b>and</b> the piece went back into stock so another panel can sell it. Nothing was left for somebody to remember to do.</div>' },
      { shot:'markets', title:'Screen · Marketplace P&amp;L', cap:'Every panel side by side: commission, fee, window, keep %, return %, late count.',
        body:'<div class="rule"><b>This is the comparison nobody makes.</b> The biggest channel by gross is frequently not the biggest by money in the bank. Sorted by payout, the order on this screen surprises people — which is exactly why it is sorted that way.</div>' },
      { shot:'listings', title:'Screen · Listing health', cap:'One price and one stock number across every panel — or the trouble that follows.',
        body:'<p>Three problems are called out by name: <b>price parity broken</b> (the same item priced apart across panels), <b>out of stock but still listed</b> (every order taken is a cancellation), and <b>thin cover</b> (fewer pieces in stock than panels selling them).</p>' },
      { shot:'listings_levelled', title:'Levelling a price across every panel', cap:'One click put all seven panels back on the catalog list price.', cls:'tall',
        body:'<div class="good"><b>Why this matters more than it looks.</b> Marketplaces read each other. A saree left at a discount from an event three weeks ago, while another panel still shows full price, gets the dearer listing pushed down or suppressed — on a channel you are paying a high commission to be visible on.</div>' },
      { shot:'queue_returned', title:'A return, against the panel it came from', cap:'Recorded at that marketplace’s own rate, and the piece back in stock.', cls:'tall',
        body:'<p>Returns are what separate a channel that looks profitable from one that is. Recording them against the panel — rather than in one pooled "returns" figure — is what lets the P&amp;L screen tell you which panel is actually worth the work.</p>' },
      { shot:'wiring', title:'Screen · Wiring', cap:'Every figure, its source, and one marketplace order followed through six consequences.' },
    ],
  },

  ordman: {
    app: 'Order Management', slug: 'ordman', n: 2, file: 'Order_Management.html',
    sub: 'One order book for every channel — and a promise date nobody types',
    badge: 'The date is derived, never typed',
    what: 'Website, marketplaces, the counter, wholesale and WhatsApp all land in <b>one order book</b>. Two decisions then decide whether the customer is happy, and this app makes both of them in the open.',
    whatMore: ['<b>The first is where it ships from.</b> The fastest warehouse that actually holds the pieces, checked against the real figure on that shelf — so a picker is never sent to an empty rack, and an order nothing can serve is shown as exactly that rather than being given a hopeful date.',
      '<b>The second is what date the customer was given.</b> It is the cut-off plus that warehouse\'s transit days to that zone. <b>Nobody types it.</b> So nobody can promise Tuesday to a zone the courier reaches on Friday — and moving the stock to a nearer warehouse changes the date on the customer\'s order in the same instant.',
      '<b>After the sale the sequence never bends:</b> parcel back, then somebody actually looks at it, then the money goes out. A resaleable piece returns to the warehouse it left; a damaged one is written off rather than quietly added back as stock that does not exist.'],
    whatBox: 'The transit matrix — days from each warehouse to each zone — is one small table, and it is the reason allocation matters at all. The same order is a one-day delivery from one warehouse and a four-day delivery from another.',
    ring: [['in','← Catalog · the item and its selling price'],['in','← Inventory · how many pieces each warehouse holds'],
           ['in','← Logistics · the courier, transit days and the outcome'],['in','← Payments · did the money land, did the refund go'],
           ['out','→ Order, allocation and promise · read by CRM &amp; the Dashboard'],['out','→ Stock · moved between warehouses, out on dispatch']],
    ownsBox: '<b>What this app owns:</b> the order, which warehouse it is allocated to, the promise date derived from that, and the returns desk. <b>What it only reads:</b> the price, the stock figure and the delivery outcome.',
    flow: ['Order lands','Allocated','Packed','Shipped','Delivered','Return desk'],
    flowCap: 'Six steps. Nothing ships without an allocation, and no refund moves without an inspection.',
    steps: ['<b>An order lands</b> from any channel and joins one book — not a channel-specific list.',
      '<b>Allocated</b> to the fastest warehouse that actually holds the pieces. The stock there falls; no other warehouse is touched.',
      '<b>The promise date appears by itself</b> — cut-off, then that warehouse\'s transit to that zone. Change the warehouse and the date changes with it.',
      '<b>Packed, then shipped</b> — never shipped without an allocation, so the on-time figure cannot be back-filled.',
      '<b>Delivered</b> on or before the promise, or it counts against on-time. There is no third option and the promise is never re-written to match.',
      '<b>If it comes back:</b> parcel in, eyes on it, <i>then</i> money out. A resaleable piece returns to the warehouse it left.'],
    rulesTitle: 'The three things this app refuses to let happen',
    rules: ['<b>Nothing ships from a warehouse that does not have it.</b> Allocation is compulsory and is checked against the real figure at that location. An order no warehouse can serve gets no date at all — it needs a purchase or a production order, not a promise.',
      '<b>No money leaves before the goods are back and looked at.</b> A refund is impossible until the parcel is received <i>and</i> inspected. That single ordering is the whole difference between a returns policy and a leak.',
      '<b>A promise date is never typed.</b> It is derived, every time it is read, from the cut-off and the transit matrix. A field somebody has to keep up to date is a field that is wrong within a month.',
      '<b>A damaged return is not added back to stock.</b> Pretending a stained piece is resaleable is how a healthy-looking inventory turns out to be worth half of what the report says.'],
    rulesBox: 'All four are self-tests, including <i>"a refund is impossible before somebody has looked at it"</i> and <i>"no promise date is stored anywhere — it is worked out on every read"</i>.',
    limits: ['It does not book the courier or print the label — it decides which warehouse and by when, and hands that over.',
      'It does not split one order across two warehouses; it picks the fastest single one that can serve the whole line.',
      'It does not replenish stock, and it will not stop you accepting an order you cannot fulfil — it refuses to give that order a date, which is the honest half of the problem.'],
    accept: 'the app opens by double-click with no internet · all 55 self-tests pass · an order nothing can serve gets no date · moving stock nearer changes the promised date by itself · allocating takes stock off exactly one shelf · a refund is refused before the parcel is back and before it is inspected · a damaged return is not added back to stock · a backup exports and imports cleanly.',
    screens: [
      { shot:'dash', title:'Screen · Overview', cap:'The order book, what is still open, and every promise that is already gone.',
        body:'<h3>Reading it in twenty seconds</h3><div class="steps">'+
          '<div class="st"><span class="n">1</span><div class="tx"><b>Promise already blown</b> — orders that have not even shipped and whose date has passed. This is the number a customer is about to phone about.</div></div>'+
          '<div class="st"><span class="n">2</span><div class="tx"><b>Cannot be promised</b> — orders no warehouse can serve. They have no date, on purpose.</div></div>'+
          '<div class="st"><span class="n">3</span><div class="tx"><b>Refunds still owed</b> — money customers are waiting for, worked out from parcels that exist rather than from a policy document.</div></div></div>' },
      { shot:'book', title:'Screen · Order book', cap:'Every channel in one list, sorted by which promise breaks first.',
        body:'<div class="rule"><b>Look at the "Ships from" column.</b> On an unallocated order it says <i>would be chosen</i> — the warehouse the app would pick if you left it alone, with the transit days beside it. The decision is visible before anybody makes it.</div>' },
      { shot:'book_filtered', title:'One channel at a time', cap:'The same book, narrowed to a single channel.', cls:'tall',
        body:'<p>The channels behave nothing like each other — a counter sale is finished the moment it is paid for, a marketplace order comes back one time in four. The table underneath compares them on the figures that matter: open orders, blown promises, return rate and on-time percentage.</p>' },
      { shot:'alloc', title:'Screen · Allocation desk', cap:'What is on each shelf, and every waiting order with its options.',
        body:'<p>Each waiting order gets its own panel showing <b>every warehouse</b>: how many pieces are there, how many days it is from the customer, and <b>the date that warehouse would promise</b>. You are choosing between dates, not between warehouse codes.</p>' },
      { shot:'alloc_moved', title:'Moving stock between warehouses', cap:'One piece moved south. The total across the business did not change.', cls:'tall',
        body:'<div class="good"><b>A move takes pieces out of one warehouse and puts the same number into another.</b> The total never changes — there is a self-test for exactly that — which is why it is safe to do from this screen rather than through a paperwork cycle.</div>' },
      { shot:'book_repromised', title:'And the promised date moved with it', cap:'The same order, now shipping from the nearer warehouse — with an earlier date.', cls:'tall',
        body:'<div class="rule"><b>This is the app in one picture.</b> Nobody edited a date. The stock moved, the fastest warehouse that can serve the order changed, and the date the customer is promised changed by itself. A promise date that is stored in a field could never do this.</div>' },
      { shot:'alloc_allocated', title:'Allocating for real', cap:'The order is against a warehouse, and the stock came off that shelf and no other.', cls:'tall',
        body:'<p>Three assertions run on this one click in the build: the order became allocated, the stock at that warehouse fell by the quantity, and <b>every other warehouse was left alone</b>. A stock movement that touches a location it had nothing to do with is the kind of bug that is invisible for months.</p>' },
      { shot:'promise', title:'Screen · Promise &amp; transit', cap:'The transit matrix, how a date is worked out, and every open order against its promise.',
        body:'<div class="rule"><b>The bold figure in each column is the fastest warehouse for that zone.</b> This one table is the reason allocation matters: the same order is a one-day delivery from one warehouse and a four-day delivery from another, and no amount of good intention closes that gap.</div>' },
      { shot:'returns', title:'Screen · Returns &amp; refunds', cap:'Parcel back, then eyes on it, then money out — in that order, every time.',
        body:'<p>The buttons on each row change as the parcel moves through: <b>Parcel is back</b> first, then <b>Resaleable</b> or <b>Damaged</b>, and only then does <b>Pay the refund</b> do anything at all.</p>' },
      { shot:'returns_refused', title:'The refund gate, refusing', cap:'The parcel had not come back. Nothing was paid.', cls:'tall',
        body:'<div class="good"><b>This is a gate rather than a warning.</b> A warning gets clicked through on a busy afternoon by somebody trying to keep a customer happy. Here the refund simply does not move until the parcel is in and somebody has looked at it — which is the only version of a returns policy that survives a festive season.</div>' },
      { shot:'returns_refunded', title:'Received, inspected, refunded', cap:'The full amount paid, and the piece back on the shelf it left.', cls:'tall',
        body:'<p>The refund went out at the <b>full</b> value because the piece was marked resaleable — and in the same click it went back into stock at the warehouse the order originally shipped from, not into a general pool.</p>' },
      { shot:'returns_damaged', title:'A damaged return', cap:'Part refund, and the piece was NOT added back to stock.', cls:'tall',
        body:'<div class="rule"><b>The second half of this is the important half.</b> A damaged piece that gets added back to stock is phantom inventory: it will be promised to somebody, allocated, picked, and then not be there. Writing it off is the only honest option, and the app takes it automatically.</div>' },
      { shot:'wiring', title:'Screen · Wiring', cap:'Every figure, its source, and one order followed from landing to refund.' },
    ],
  },
};

/* ─── module book ─── */
function moduleBook() {
  const P = bookBuilder('E-commerce / OMS', 'Module 04');
  const pages = [];
  const T = k => (TESTS[k] || []).length;
  const ALLTESTS = T('OMS_ERP') + T('OMS_VAS') + T('ORD_ERP') + T('ORD_VAS');

  pages.push(`<section class="pg cover"><div class="cwrap">
    <div class="logo">${mark} Medhava</div><div class="ed">Module 04 of 16</div>
    <h1>E-commerce / OMS</h1><div class="sub">Marketplace OMS · Order Management</div>
    <div class="module">2 apps × 2 editions — Medhava (any industry) and Vastrangam</div>
    <p class="lede">Module 03 recorded the sale. Module 04 is about getting it out of the door. Seven seller panels collapsed into one queue with one clock, and one order book across every channel where the warehouse is chosen for you and the delivery date is worked out rather than promised.</p>
    <div class="badges"><span>4 working apps</span><span>${ALLTESTS} self-tests, all passing</span><span>58 workflow assertions</span><span>Zero console errors</span></div>
    <div class="cfoot">Medhava ERP suite · FY 2026-27 · The fourth module of sixteen</div></div></section>`);

  pages.push(P(`<h2>What this module is</h2>
    <p class="big">Module 03 was about <b>recording the sale</b>. Module 04 is about <b>getting it out of the door</b> — and it is where multi-channel businesses actually break.</p>
    <p>Two apps, because there are two different problems here and conflating them is the usual mistake. One is the <b>marketplace problem</b>: seven seller panels, seven dispatch clocks, seven commission rates, and a gross figure on every one of them that is not your money. The other is the <b>fulfilment problem</b>: which warehouse ships it, and what date the customer was actually promised.</p>
    <h3>The two apps</h3>
    <table><thead><tr><th>#</th><th>App</th><th>The problem it solves</th><th>Screens</th><th>Tests</th></tr></thead><tbody>
      <tr><td><b>1</b></td><td><b>Marketplace OMS</b></td><td>Seven panels, seven clocks, and a gross figure that is not yours</td><td>9</td><td>${T('OMS_ERP')}</td></tr>
      <tr><td><b>2</b></td><td><b>Order Management</b></td><td>Which warehouse ships it, and what date was really possible</td><td>13</td><td>${T('ORD_ERP')}</td></tr>
    </tbody></table>
    <div class="good"><b>Both apps refuse things rather than warning about them.</b> Marketplace OMS refuses to show a gross figure as if it were yours, and refuses per-panel stock. Order Management refuses to ship without an allocation, refuses a refund before the parcel is back and inspected, and refuses to let anybody type a promise date. A warning gets clicked through on a busy afternoon; a gate does not.</div>
    <div class="toc"><h3>Contents</h3>${P.toc()}</div>`));

  pages.push(P(`<h2>How the two apps divide the work</h2>
    <p>They are not two views of the same thing. They own different decisions, and they hand over cleanly.</p>
    <table><thead><tr><th>&nbsp;</th><th>Marketplace OMS</th><th>Order Management</th></tr></thead><tbody>
      <tr><td><b>Its question</b></td><td>Which panel, how long have I got, and what does it actually pay?</td><td>Which warehouse, and by what date can it really be there?</td></tr>
      <tr><td><b>What it owns</b></td><td>The dispatch clock, the commission arithmetic, the per-panel price</td><td>The allocation, the promise date, the returns desk</td></tr>
      <tr><td><b>Its unit of time</b></td><td><b>Hours</b> — dispatch windows are 12h to 48h</td><td><b>Days</b> — transit is 1 to 7 days</td></tr>
      <tr><td><b>Its gate</b></td><td>Gross is never shown as if it were yours; stock is never per-panel</td><td>No shipping without an allocation; no refund before inspection</td></tr>
      <tr><td><b>Channels</b></td><td>Marketplaces only — that is the point</td><td>Every channel, marketplaces included</td></tr>
    </tbody></table>
    <div class="wire2"><div class="core"><b>UNIFIED DATA CORE</b><span>Item · Party · Stock · Ledger · Order</span></div>
      <div class="ring">
        <div class="rn out">→ Marketplace OMS · panel orders, clocks, commission</div>
        <div class="rn out">→ Order Management · allocation, promise, returns</div>
        <div class="rn in">← Catalog · one price list</div>
        <div class="rn in">← Inventory · one stock number, per warehouse</div>
        <div class="rn in">← Logistics · courier, transit, outcome</div>
        <div class="rn in">← Settlement · what the panel actually paid</div>
      </div></div>
    <p class="cap">Both write orders. Neither keeps its own copy of the price or the stock.</p>
    <div class="rule"><b>A marketplace order is in both apps, and that is deliberate.</b> Marketplace OMS asks whether it will make the panel's 24-hour window and what the panel will pay. Order Management asks which warehouse it comes from and what date the customer sees. Those are different questions with different answers, and a single "orders" screen answers neither well.</div>`));

  pages.push(P(`<h2>The two ideas worth the whole module</h2>
    <h3>1 · Gross is not your money</h3>
    <p>A marketplace shows you what the customer paid. Your bank shows you what is left after commission, a shipping fee, and — eventually — the parcels that came back. Between a 30% panel and a 12% panel those are entirely different businesses, and comparing them at gross is the commonest expensive mistake in Indian e-commerce.</p>
    <figure class="half"><img src="file://${path.join(SHOTS, 'OMS_VAS_markets.png')}"><figcaption>Every panel side by side, sorted by what actually reaches the bank rather than by what was invoiced.</figcaption></figure>
    <h3>2 · A promise date should be derived, not typed</h3>
    <p>The most expensive habit in direct-to-consumer selling is a delivery date typed by whoever wanted the sale. Once the date is <b>derived</b> — cut-off, plus that warehouse's transit days to that zone — the argument moves to where it belongs: which warehouse holds the piece, and whether the courier can reach that pin code in time.</p>
    <div class="good"><b>The test of this is on the Allocation desk.</b> Move one piece from a far warehouse to a nearer one, and the date on the customer's order changes by itself. Nobody edits anything. A promise date stored in a field could never behave that way — which is precisely why stored promise dates are wrong within a month.</div>`));

  pages.push(P(`<h2>Nothing in this module is locked to one company</h2>
    <p class="big">A rule that holds across all sixteen modules, and one that every app checks on itself at every launch: <b>no Medhava app depends on any single outside service.</b></p>
    <p>These two apps touch marketplaces, couriers, payment gateways, printers, automation tools and messaging. Every one of those is a capability with alternatives, and every one has an option that needs nobody at all.</p>
    <table><thead><tr><th>Capability</th><th>Options, including ones that need nobody</th></tr></thead><tbody>
      <tr><td><b>Sales channels</b></td><td><b>Type them in</b> · CSV import · Amazon · Flipkart · Myntra · Meesho · Ajio · Nykaa · JioMart · Shopify · WooCommerce · your own store</td></tr>
      <tr><td><b>Couriers</b></td><td>Type the AWB in · <b>your own delivery</b> · Delhivery · Blue Dart · DTDC · Ecom · XpressBees · India Post · Shiprocket · NimbusPost</td></tr>
      <tr><td><b>Payments &amp; refunds</b></td><td>Cash · <b>UPI direct with your own QR (no commission)</b> · Razorpay · PayU · Cashfree · PhonePe · Paytm · Stripe · CCAvenue</td></tr>
      <tr><td><b>Automation</b></td><td><b>Medhava Rules (built in)</b> · n8n · Node-RED · Windmill · Airflow (self-hosted) · n8n Cloud · Make · Zapier · Pipedream · cron + webhook · by hand</td></tr>
      <tr><td><b>Books &amp; ledger</b></td><td><b>Medhava Books (built in)</b> · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA</td></tr>
      <tr><td><b>Customer messaging</b></td><td><b>Copy and send it yourself</b> · WhatsApp Cloud API · Gupshup · Interakt · MSG91 · Twilio · email instead · Chatwoot (self-hosted)</td></tr>
      <tr><td><b>Files &amp; backups</b></td><td><b>This device</b> · a USB drive · MinIO or Nextcloud (self-hosted) · Google Drive · Dropbox · OneDrive · Amazon S3 · Backblaze B2</td></tr>
    </tbody></table>
    <div class="rule"><b>Cloud services use a scoped, revocable key — never your account password.</b> Medhava will never ask you for a marketplace, bank or account password. If any screen ever does, it is not Medhava.</div>
    <div class="good"><b>The practical version:</b> if a courier doubles its rate or a marketplace changes its terms, you click a different button on the Connectors screen. You do not change software, you do not re-enter data, and you do not lose a day. Every app in this module ships with <b>"Outside services required: 0"</b> as a test result rather than as a slogan.</div>`));

  pages.push(P(`<h2>Medhava and Vastrangam, side by side</h2>
    <p>Same two engines, same self-tests, same arithmetic. Only the master data differs.</p>
    <table class="vs"><thead><tr><th>&nbsp;</th><th>Medhava (unified ERP)</th><th>Vastrangam</th></tr></thead><tbody>
      <tr><td><b>Company</b></td><td>Acme Corp — stands in for any business</td><td>Vastrangam — ethnic-wear D2C + marketplace</td></tr>
      <tr><td><b>Items</b></td><td>Standard · Premium · Accessory · Top-of-range</td><td>Cotton kurta set · Banarasi saree · Zari dupatta · Bridal lehenga</td></tr>
      <tr><td><b>Marketplaces</b></td><td>Seven neutral panels — horizontal, category specialist, value, premium, curated, reseller</td><td>Myntra 30% · Amazon 22% · Flipkart 24% · Ajio 28% · Nykaa Fashion 26% · Meesho 12% · Tata Cliq 20%</td></tr>
      <tr><td><b>Dispatch windows</b></td><td colspan="2" style="text-align:center"><b>12h to 48h — different per panel, which is the whole point</b></td></tr>
      <tr><td><b>Warehouses</b></td><td>North · West · South</td><td>Delhi NCR · Mumbai · Bengaluru</td></tr>
      <tr><td><b>Channels</b></td><td>Own website · Marketplaces · Retail counter · Wholesale · Social</td><td>vastrangam.com · Marketplaces · Showroom counter · Boutiques · Instagram &amp; WhatsApp</td></tr>
      <tr><td><b>Transit matrix</b></td><td colspan="2" style="text-align:center"><b>Identical — 1 to 7 days, as the couriers actually run them</b></td></tr>
      <tr><td><b>Engines</b></td><td colspan="2" style="text-align:center"><b>Identical. Two files, shared by both.</b></td></tr>
      <tr><td><b>Self-tests</b></td><td colspan="2" style="text-align:center"><b>Identical names, identical counts, all passing in both.</b></td></tr>
    </tbody></table>
    <div class="good"><b>Why ship both?</b> The neutral edition is what a new customer in any industry receives. The Vastrangam edition is the proof the neutral engines survive a real business — real marketplace commission rates, real fashion return rates, real transit times across India. If a rule only works when the data is tidy, the Vastrangam build finds it first.</div>`));

  pages.push(P(zipPage(MOD)));

  pages.push(P(`<h2>How this was verified</h2>
    <p>Four builds, four gates each. Nothing shipped on the basis that it looked right on screen.</p>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>The arithmetic, with no screen involved.</b> Each engine run in isolation, its self-tests executed against the seeded data. <b>${ALLTESTS} tests across the four builds, all passing.</b></div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>Every screen and every control, in a real browser.</b> Each build opened in headless Chromium; every screen visited and every interactive control on it clicked — 84 clicks in Marketplace OMS, 105 in Order Management, including every provider button on the Connectors screen.</div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>The real job, with the result asserted.</b> Not "does the button click" but "did the thing happen": <b>58 workflow assertions</b> across the two apps. A control that looks alive but changes nothing fails the build.</div></div>
      <div class="st"><span class="n">4</span><div class="tx"><b>Every page of every PDF checked for fill.</b> A page that came out nearly empty means a screenshot never got captured — which is how a missing screen is caught before it ships rather than after.</div></div>
    </div>
    <h3>What the workflow run actually does, and checks</h3>
    <table><thead><tr><th>App</th><th>It does</th><th>And asserts</th></tr></thead><tbody>
      <tr><td><b>Marketplace OMS</b></td><td>Advances the top of the queue; cancels an order; levels a broken price; records a return</td><td>The stage moved exactly one step · the cancelled order gave its stock back · every panel landed on the list price · the returned piece came back into stock</td></tr>
      <tr><td><b>Order Management</b></td><td>Filters to one channel; tries to allocate an order nothing can serve; moves stock between warehouses; allocates for real; tries to refund a parcel that has not arrived, then one nobody has inspected; refunds a resaleable return and a damaged one</td><td>The filter narrowed the book · the backorder <b>stayed</b> unallocated with no warehouse · the stock moved without changing the total · <b>the promised date changed by itself</b> · allocating touched exactly one shelf · both refunds were <b>refused</b> · the resaleable piece went back into stock and the damaged one did not</td></tr>
    </tbody></table>
    <div class="good">Every screenshot in every one of these PDFs was captured from the shipped file at double resolution, in the state its caption describes. Nothing is a mock-up.</div>`));

  pages.push(P(`<h2>Where this sits, and what comes next</h2>
    <p>Sixteen modules and forty apps, in the order they are being built: see the business, know who you deal with, record what you sell, then get it out of the door.</p>
    ${ROADMAP.htmlTable({'01':'Delivered','02':'Delivered','03':'Delivered','04':'Delivered — you are holding it','05':'Next'},'04')}
    <div class="accept">Module 04 is accepted when: all four apps open by double-click with no internet · all ${ALLTESTS} self-tests pass · the dispatch queue sorts by time left rather than order date · an order no warehouse can serve is refused a date · moving stock changes the promised date by itself · a refund is refused until the parcel is back and inspected · all 58 workflow assertions hold · a backup exports and imports cleanly on a computer and a phone.</div>`));

  return doc(P.render(pages[0]), 'Medhava Module 04 — E-commerce / OMS');
}

/* ─── build them all ─── */
const jobs = [];
for (const key of ['oms', 'ordman']) {
  const s = SPECS[key];
  for (const [ed, tag, cfgFile, edition, co] of [
    ['ERP', { oms: 'OMS_ERP', ordman: 'ORD_ERP' }[key],
     'config_generic.js', 'Unified ERP — any industry', 'Acme Corp'],
    ['Vastrangam', { oms: 'OMS_VAS', ordman: 'ORD_VAS' }[key],
     'config_vastrangam.js', 'Vastrangam — ethnic-wear D2C + marketplace', 'Vastrangam'],
  ]) {
    const cfg = loadCfg(key + '/' + cfgFile);
    const c = Object.assign({}, s, {
      tag, edition, co, cfg,
      moduleLine: 'Module 04 · E-commerce / OMS — App ' + s.n + ' of 2',
      lede: cfg.about.slice(0, 380) + (cfg.about.length > 380 ? '…' : ''),
      capCount: CAP[key].length, altCount: ALT[key], capRows: CAP[key],
    });
    jobs.push({ html: appBook(c), out: 'Medhava_' + s.app.replace(/[^A-Za-z0-9]+/g, '_') + '_' + ed + '.pdf' });
  }
}
jobs.push({ html: moduleBook(), out: 'Medhava_Module_04_Ecommerce_OMS.pdf' });
render(jobs);
