'use strict';
// Medhava — complete website as a PDF. Customer-facing. Zoho-style module/app introduction.
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const D = __dirname;

const G = `<defs><linearGradient id="g" x1=".05" y1="0" x2=".95" y2="1"><stop offset="0" stop-color="#19cba9"/><stop offset=".45" stop-color="#0fae90"/><stop offset="1" stop-color="#0a7660"/></linearGradient></defs>`;
const MARK = (s, c) => `<svg viewBox="0 0 128 124" width="${s}" height="${s}">${c ? '' : G}<path d="M22 108V36L64 80L106 36v72" fill="none" stroke="${c || 'url(#g)'}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><g fill="${c || 'url(#g)'}"><rect x="48" y="94" width="6.5" height="14" rx="3.2"/><rect x="61" y="86" width="6.5" height="22" rx="3.2"/><rect x="74" y="77" width="6.5" height="31" rx="3.2"/><rect x="87" y="68" width="6.5" height="40" rx="3.2"/></g><path d="M42 100C58 97 82 87 99 55" fill="none" stroke="${c || 'url(#g)'}" stroke-width="5" stroke-linecap="round"/><path d="M64 6c.8 9.6 2.5 11.8 12.1 12.6C66.5 19.4 64.8 21.6 64 31.2c-.8-9.6-2.5-11.8-12.1-12.6C61.5 17.8 63.2 15.6 64 6z" fill="${c || 'url(#g)'}"/></svg>`;

// line icons for app tiles
const I = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  chart: 'M4 20V4M4 20h16M8 20v-6M13 20V9M18 20v-9',
  users: 'M9 8a3.2 3.2 0 1 0 0 6.4A3.2 3.2 0 0 0 9 8zM3.5 21a5.5 5.5 0 0 1 11 0M16 7a3 3 0 0 1 0 6M18.5 21a5 5 0 0 0-3-4.6',
  cart: 'M3 4h2l2.2 11.2A2 2 0 0 0 9.2 17h8.1a2 2 0 0 0 2-1.6L21 8H6M9.5 20.5h.01M17.5 20.5h.01',
  store: 'M4 9V5h16v4a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-4 0zM5 11v8h14v-8',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18',
  tag: 'M3 12V4h8l9 9-8 8-9-9zM7.5 7.5h.01',
  doc: 'M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6',
  box: 'M12 3 4 7v10l8 4 8-4V7zM4 7l8 4 8-4M12 21V11',
  scan: 'M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M7 12h10',
  truck: 'M2 6h12v9H2zM14 9h4l3 3v3h-7M7 18.5h.01M17.5 18.5h.01',
  gear: 'M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
  thread: 'M6 3v6a6 6 0 0 0 12 0V3M6 21v-6a6 6 0 0 1 12 0v6',
  layers: 'M12 3 3 8l9 5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  check: 'M5 12l5 5 9-10',
  coin: 'M12 3c3.9 0 7 1.3 7 3s-3.1 3-7 3-7-1.3-7-3 3.1-3 7-3zM5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6',
  scale: 'M12 3v18M5 7h14M5 7 2.5 13h5zM19 7l-2.5 6h5zM8 21h8',
  pct: 'M5 19 19 5M7.5 5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM16.5 14a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  sync: 'M4 12a8 8 0 0 1 13-6l3 2M20 12a8 8 0 0 1-13 6l-3-2M20 4v4h-4M4 20v-4h4',
  return: 'M9 4 4 9l5 5M4 9h10a6 6 0 0 1 0 12H8',
  cal: 'M3 4h18v17H3zM3 9h18M8 2v4M16 2v4',
  mail: 'M3 5h18v14H3zM4 7l8 6 8-6',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
  spark: 'M12 3l1.8 4.8L18.5 9l-4.7 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.2zM18 14l.9 2.3L21 17l-2.1.8L18 20l-.9-2.2L15 17l2.1-.7z',
  image: 'M3 4h18v16H3zM8.5 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM4 17l5-5 4 4 3-3 4 4',
  play: 'M4 4h16v16H4zM10 9l5 3-5 3z',
  wrench: 'M21 4a5 5 0 0 1-6.5 6.5L6 19l-2-2 8.5-8.5A5 5 0 0 1 19 2z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  bell: 'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0',
  flow: 'M3 3h6v5H3zM15 16h6v5h-6zM6 8v6a2 2 0 0 0 2 2h7'
};
const ico = k => `<svg viewBox="0 0 24 24" class="ai"><path d="${I[k] || I.grid}"/></svg>`;

/* ═══ THE 16 MODULES ═══ */
const MODULES = [
  { n: '01', name: 'Dashboard & BI', icon: 'chart', tag: 'See the whole business without asking anyone',
    intro: 'Every number in Medhava rolls up here as work happens — no exports, no waiting for month-end.',
    reads: ['Every module'], writes: ['—'],
    apps: [['CEO Dashboard', 'grid', 'Cash, sales, stock, profit and alerts on one screen, refreshed as work happens.'],
           ['Report Builder', 'chart', 'Drag the fields you want into a report and save it for the whole team.']] },

  { n: '02', name: 'CRM', icon: 'users', tag: 'Know every customer completely',
    intro: 'One record per customer that carries every lead, order, return and conversation — whichever channel it came from.',
    reads: ['Sales', 'OMS', 'Marketing'], writes: ['Sales', 'Marketing'],
    apps: [['CRM & Customer 360', 'users', 'Lead to won, then the full lifetime: orders, returns, value and what to offer next.']] },

  { n: '03', name: 'Sales', icon: 'cart', tag: 'Every way you sell, one order book',
    intro: 'Retail counter, wholesale, export and your own website all write to the same order and the same stock number.',
    reads: ['Inventory', 'CRM', 'Catalog'], writes: ['Inventory', 'Accounting', 'Logistics'],
    apps: [['D2C Sales', 'store', 'Orders from your own storefront, cart to dispatch, with loyalty and partial COD.'],
           ['B2B & Credit', 'doc', 'Wholesale orders with credit limits, tier pricing and outstanding ageing.'],
           ['Export', 'globe', 'Commercial invoice, packing list, LUT bond and IGST-refund tracking.'],
           ['POS', 'tag', 'Counter billing that draws on the same stock as your website.'],
           ['Quotes & Proforma', 'doc', 'Send a quote, convert it to a confirmed order in one click.']] },

  { n: '04', name: 'E-commerce / OMS', icon: 'globe', tag: 'Seven marketplaces, one queue',
    intro: 'Stop logging into seven seller panels. Every marketplace order lands in one pipeline, and your stock goes out to all of them.',
    reads: ['Inventory', 'Catalog'], writes: ['Inventory', 'Accounting', 'Settlement', 'Logistics'],
    apps: [['Marketplace OMS', 'globe', 'Amazon, Flipkart, Myntra, Meesho, Ajio, Nykaa and JioMart in a single order queue.'],
           ['Order Management', 'sync', 'One pipeline from new to delivered, whatever the channel it arrived on.']] },

  { n: '05', name: 'Warehouse', icon: 'box', tag: 'Pick right the first time',
    intro: 'Bin-level instructions and barcode scanning so the right piece leaves the building, and stock stays honest.',
    reads: ['Orders', 'Inventory'], writes: ['Inventory', 'Logistics'],
    apps: [['Picking & Bins', 'box', 'Pick lists that tell staff exactly which bin to walk to, in walking order.'],
           ['Barcode Operations', 'scan', 'Scan to pick, pack, dispatch and run a physical stock count on a phone.']] },

  { n: '06', name: 'Logistics', icon: 'truck', tag: 'Ship, track, and stop RTO losses',
    intro: 'One-click labels across couriers, live tracking, COD remittance and a workflow that saves failed deliveries.',
    reads: ['Orders'], writes: ['Accounting', 'Settlement'],
    apps: [['Couriers & AWB', 'truck', 'Compare couriers, print labels, track shipments and reconcile COD remittance.']] },

  { n: '07', name: 'Inventory', icon: 'layers', tag: 'One number everyone trusts',
    intro: 'The single most important number in the system: one quantity per SKU, per location, per stage — read and written by every other module.',
    reads: ['Every module'], writes: ['Every module'],
    apps: [['Stock', 'layers', 'Live quantity by SKU, location and stage, with reorder alerts, batches, kits and dead-stock.']] },

  { n: '08', name: 'Manufacturing', icon: 'thread', tag: 'Know what a piece really costs',
    intro: 'From cut plan to finished piece, including what every artisan earned and what every design actually cost to make.',
    reads: ['Sales', 'Materials'], writes: ['Inventory', 'HR', 'Accounting'],
    apps: [['Production Orders', 'wrench', 'Ten stages from cutting to finishing, with work-in-progress visible at each.'],
           ['Karigar & Piece-rate', 'users', 'Pooled set completion, per-garment rates, alterations and advances, into one payout.'],
           ['BOM & Consumption', 'thread', 'What each design consumes, costed at today’s material rates.'],
           ['Quality Control', 'check', 'Accept, reject or rework — with reasons that feed the supplier scorecard.']] },

  { n: '09', name: 'Purchase', icon: 'cart', tag: 'Nothing over-billed gets paid', live: true,
    intro: 'The buy side, end to end — and the control that stops you paying for goods you rejected.',
    reads: ['Inventory', 'Manufacturing'], writes: ['Inventory', 'Accounting', 'Quality'],
    apps: [['Procurement', 'cart', 'RFQ to purchase order to goods receipt, with a strict three-way match before any bill is paid.', 1],
           ['Vendor Management', 'store', 'Vendor 360, payables, ageing, a real risk score, and sourcing that follows performance.', 1]] },

  { n: '10', name: 'HR & Payroll', icon: 'users', tag: 'Pay people right, on time',
    intro: 'Staff salaries and artisan piece-rate earnings in one register, with attendance driving both.',
    reads: ['Manufacturing'], writes: ['Accounting'],
    apps: [['Staff & Karigar', 'users', 'Attendance, effective-dated salary and artisan earnings in a single register.'],
           ['Time-off & Advances', 'cal', 'Leave, festival advances and exactly how they change this month’s payout.'],
           ['Appraisal & Hiring', 'check', 'Performance reviews and a hiring pipeline that ends in an employee record.']] },

  { n: '11', name: 'Accounting & GST', icon: 'coin', tag: 'Books that always balance',
    intro: 'A full double-entry ledger built for Indian compliance — not a bolt-on tax report.',
    reads: ['Every module'], writes: ['Finance Reports'],
    apps: [['Accounting', 'scale', 'Double-entry books where every voucher balances and the trial balance always ties.'],
           ['Invoicing', 'doc', 'GST tax invoices and receipts, totals computed from the lines to the paise.'],
           ['Expenses', 'coin', 'Spend captured by category with approvals, and bill OCR to save typing.'],
           ['GST & Tax', 'pct', 'CGST, SGST, IGST, TDS, TCS, input credit, GSTR-1 and GSTR-3B.'],
           ['Finance Reports', 'chart', 'P&L, balance sheet, and profit by channel, design and SKU.']] },

  { n: '12', name: 'Settlement', icon: 'scale', tag: 'Get paid what you are owed',
    intro: 'Marketplaces deduct commission, TCS, weight charges and penalties. This module finds every rupee they kept by mistake.',
    reads: ['OMS', 'Accounting'], writes: ['Accounting'],
    apps: [['Reconciliation', 'scale', 'Match every marketplace payout to the order that earned it, and expose the gap.'],
           ['Claims & Disputes', 'bell', 'Turn shortfalls, weight disputes and lost parcels into filed claims with evidence.'],
           ['Returns / RMA', 'return', 'Customer, courier and wrong returns — and the dead stock they actually cost you.']] },

  { n: '13', name: 'Marketing', icon: 'spark', tag: 'Sell more without discounting',
    intro: 'Plan content, run campaigns, and let rules keep your prices competitive while protecting margin.',
    reads: ['Catalog', 'CRM'], writes: ['Sales', 'OMS'],
    apps: [['Social Calendar', 'cal', 'Plan and publish across every channel from one calendar.'],
           ['Campaigns', 'mail', 'Email, SMS and WhatsApp campaigns measured on real revenue, not opens.'],
           ['Repricing Engine', 'pct', 'Rules per channel and SKU — floor, ceiling, match-lowest, festival overrides.'],
           ['Automation', 'bolt', 'If this happens, do that — across any module, without writing code.']] },

  { n: '14', name: 'AI Content Engine', icon: 'spark', tag: 'Write once, sell everywhere',
    intro: 'Listings, ads and email written from your own catalogue — so the words match the actual product.',
    reads: ['Catalog'], writes: ['Marketing', 'OMS'],
    apps: [['Content Engine', 'spark', 'Channel-ready listings, social posts, ads, blogs and email in your own voice.']] },

  { n: '15', name: 'Image Studio', icon: 'image', tag: 'Studio photos without a studio',
    intro: 'Turn a phone photo into a channel-compliant product image, at the exact size each marketplace demands.',
    reads: ['Catalog'], writes: ['Catalog', 'Marketing'],
    apps: [['Image Studio', 'image', 'Layers, free transform, background removal, channel presets and SEO alt text.']] },

  { n: '16', name: 'Video Studio', icon: 'play', tag: 'Reels from the photos you already have',
    intro: 'Product video and reels generated from your existing catalogue images.',
    reads: ['Catalog', 'Image Studio'], writes: ['Marketing'],
    apps: [['Video Studio', 'play', 'Text and image to video, reels and ad cuts sized for every channel.']] }
];

let pn = 0;
const foot = () => `<div class="ft"><span>${MARK(10, '#0fae90')} Medhava — One business. One brain.</span><span>${++pn}</span></div>`;
const pg = (inner, cls) => `<section class="pg ${cls || ''}"><div class="bd">${inner}</div>${foot()}</section>`;
const pages = [];

/* COVER */
pages.push(`<section class="pg cover"><div class="cw">
 <div class="lg">${MARK(40, '#fff')}<span>Medhava</span></div>
 <h1>One business.<br>One brain.</h1>
 <div class="sub">The unified ERP — 16 modules, 40 apps, one shared data core</div>
 <p class="ld">Record something once and it moves everywhere it should. Stock, books, quality and your supplier ratings all update from the same action, because they all read the same data. No sync jobs. No duplicate masters. No spreadsheet holding it together.</p>
 <div class="bg"><span>16 modules</span><span>40 apps</span><span>7 marketplaces</span><span>GST ready</span></div>
 <div class="cf">medhava.com · hello@medhava.com</div></div></section>`);

/* CONTENTS */
pages.push(pg(`<h2>What's inside</h2>
<div class="toc2">
 <div class="tc"><b>Start here</b>
  <div>3 · What Medhava is</div><div>4 · The problem it solves</div><div>5 · How it works</div><div>6 · All 16 modules at a glance</div></div>
 <div class="tc"><b>The modules</b>
  ${MODULES.map((m, i) => `<div>${7 + i} · ${m.n} ${m.name}</div>`).join('')}</div>
 <div class="tc"><b>Before you decide</b>
  <div>23 · Built for your industry</div><div>24 · Why Medhava, not a suite</div><div>25 · Security &amp; trust</div>
  <div>26 · Pricing</div><div>27 · Questions</div><div>28 · Getting started</div></div>
</div>`));

/* 3 WHAT IT IS */
pages.push(pg(`<h2>What Medhava is</h2>
<p class="big">Medhava is <b>one application</b> that runs your whole business — buying, making, selling, shipping, accounting and the people doing the work. Not eleven tools stitched together. One.</p>
<div class="wide">
 <div class="w"><span class="wn">16</span><b>Modules</b><span>Each one a complete area of your business — purchase, inventory, accounting, HR, marketing.</span></div>
 <div class="w"><span class="wn">40</span><b>Apps</b><span>Inside those modules, forty focused tools. Switch on what you need; the rest are already wired.</span></div>
 <div class="w"><span class="wn">1</span><b>Data core</b><span>All forty read and write the same records — so nothing ever needs reconciling between them.</span></div>
</div>
<h3>What that means on a Tuesday morning</h3>
<p>Your warehouse receives 100 metres of silk. Quality accepts 96 and rejects 4. In most businesses that becomes three separate jobs — update the stock sheet, tell accounts, remember to claim from the mill. In Medhava it is <b>one entry</b>, and:</p>
<div class="cascade">
 ${[['Stock rises by 96', 'not 100 — you only own what you accepted'],
   ['The mill’s bill is recorded', 'with input tax credit on 96 metres only'],
   ['A debit note is raised', 'for the 4 metres you are sending back'],
   ['The mill’s quality score drops', 'and sourcing notices before you do'],
   ['Production sees the fabric', 'and the cut plan updates']].map((c, i) =>
  `<div class="cs"><span class="n">${i + 1}</span><div><b>${c[0]}</b> — ${c[1]}</div></div>`).join('')}
</div>
<p class="note">Nobody typed anything a second time. Nobody has to remember. That is the whole idea.</p>`));

/* 4 PROBLEM */
pages.push(pg(`<h2>The problem it solves</h2>
<p class="big">Most growing businesses do not have a software problem. They have <b>eleven software problems that don't talk to each other.</b></p>
<div class="pr">
 ${[['Numbers that disagree', 'Your stock sheet says 40. Flipkart says 12. The books say something else. Nobody knows which is right, so everyone guesses — and you oversell.'],
   ['The same work, three times', 'One invoice keyed into the seller panel, then the spreadsheet, then the accounting package. Three chances to be wrong, and one person’s whole day.'],
   ['Money leaking quietly', 'Over-billed purchases. Marketplace shortfalls nobody claimed. RTO parcels written off. Individually small, invisible until the year closes.'],
   ['Decisions on a feeling', 'Which design actually made money? Which supplier is costing you? Which channel is worth the effort? The data exists — in four places that cannot be joined.']].map(p =>
  `<div class="p"><b>${p[0]}</b><span>${p[1]}</span></div>`).join('')}
</div>
<p class="note"><b>None of this is a discipline problem.</b> It is what happens when the tools cannot see each other. Medhava fixes it at the root: there is only one set of records.</p>`));

/* 5 HOW IT WORKS */
pages.push(pg(`<h2>How it works</h2>
<p>Every one of the forty apps reads and writes the same five records. That is the entire architecture, and it is why one action can update five modules at once.</p>
<div class="corebox">
 <div class="ct">The shared data core</div>
 <div class="ce">${['Item / SKU', 'Party', 'Stock', 'Ledger', 'Order'].map(e => `<span>${e}</span>`).join('')}</div>
 <div class="cd">Every module reads and writes these. There is no second copy anywhere in the system.</div>
</div>
<div class="two">
 <div class="k"><b>Item / SKU</b><span>One product record used by purchase, production, inventory, every sales channel, marketing and accounting.</span></div>
 <div class="k"><b>Party</b><span>One identity whether they are a customer, a supplier, an artisan or a staff member.</span></div>
 <div class="k"><b>Stock</b><span>One quantity per SKU, per location, per stage. The number every channel is told.</span></div>
 <div class="k"><b>Ledger</b><span>The single financial truth. Every rupee anywhere in the system traces to a voucher here.</span></div>
</div>
<h3>Compared with a suite of apps</h3>
<table class="cmp"><thead><tr><th></th><th>Medhava</th><th>A suite of apps</th></tr></thead><tbody>
<tr><td>Master data</td><td class="y">One record</td><td class="n">Copied into each app, synced</td></tr>
<tr><td>Stock truth</td><td class="y">One number</td><td class="n">Per app, reconciled nightly</td></tr>
<tr><td>Cross-module update</td><td class="y">Instant</td><td class="n">Scheduled sync job</td></tr>
<tr><td>When sync fails</td><td class="y">Cannot happen</td><td class="n">Silent mismatch</td></tr>
</tbody></table>`));

/* 6 MODULE OVERVIEW */
pages.push(pg(`<h2>All 16 modules at a glance</h2>
<p>Turn on what you need today. Everything else is already wired for the day you need it.</p>
<div class="mgrid">
 ${MODULES.map(m => `<div class="mg">
   <div class="mh">${ico(m.icon)}<span class="mn">${m.n}</span></div>
   <b>${m.name}</b><span class="mc">${m.apps.length} app${m.apps.length > 1 ? 's' : ''}${m.live ? ' · live' : ''}</span>
   <span class="mt">${m.tag}</span></div>`).join('')}
</div>`));

/* 7-22 MODULE PAGES */
MODULES.forEach(m => {
  pages.push(pg(`<div class="mtop">
   <div class="mi">${ico(m.icon)}</div>
   <div><span class="meye">Module ${m.n}${m.live ? ' · available now' : ''}</span><h2 class="mth">${m.name}</h2></div>
  </div>
  <p class="big">${m.tag}.</p>
  <p>${m.intro}</p>

  <div class="wire">
   <div class="wl"><span class="wt in">Reads from</span>${m.reads.map(r => `<span class="wc">${r}</span>`).join('')}</div>
   <div class="wl"><span class="wt out">Writes to</span>${m.writes.map(r => `<span class="wc">${r}</span>`).join('')}</div>
  </div>

  <h3>Apps in this module</h3>
  <div class="apps">
   ${m.apps.map(a => `<div class="app${a[3] ? ' on' : ''}">
     <div class="aic">${ico(a[1])}</div>
     <div><b>${a[0]}${a[3] ? '<span class="lv">available now</span>' : ''}</b><span>${a[2]}</span></div>
   </div>`).join('')}
  </div>`));
});

/* 23 INDUSTRIES */
pages.push(pg(`<h2>Built for your industry</h2>
<p class="big">The same engine, four sets of master data. You are not buying a textile product or a pharma product — you are buying the engine, configured for you.</p>
<div class="ind">
 ${[['Textile & apparel', 'thread', 'Mills and zari suppliers, fabric in metres, karigar piece-rate wages, design-wise costing, HSN 5007/5208, and the wrong-return dead stock marketplaces create.'],
   ['Medical & pharma', 'check', 'Distributors, batch and expiry tracking, QC pass rate as your accept rate, cold-chain locations and regulated document trails.'],
   ['Manufacturing', 'wrench', 'Component suppliers, multi-level bills of material, fill rate that predicts line stoppages, work orders, scrap and rework.'],
   ['Services', 'doc', 'Subcontractors, milestone acceptance instead of goods receipt, timesheets, retainer billing and project profitability.']].map(i =>
  `<div class="in"><div class="aic">${ico(i[1])}</div><div><b>${i[0]}</b><span>${i[2]}</span></div></div>`).join('')}
</div>
<p class="note"><b>This is literally true of the code.</b> Every app ships in two builds — a neutral configuration and an industry configuration — sharing one engine and one identical test suite. Only the master data differs.</p>`));

/* 24 WHY */
pages.push(pg(`<h2>Why Medhava, not a suite</h2>
<p>Zoho and Odoo are excellent. They are also <b>collections of separate applications</b> that talk to each other. Medhava is one application. Here is what that changes in practice.</p>
<table class="cmp big-t"><thead><tr><th>In practice</th><th>Medhava</th><th>A suite</th></tr></thead><tbody>
${[['Adding a new sales channel', 'Stock already flows to it', 'New connector, new sync to monitor'],
  ['Month-end close', 'Books are already current', 'Reconcile app-to-app first'],
  ['A supplier under-delivers', 'Score drops, sourcing reroutes', 'Someone must notice and tell someone'],
  ['Cost per piece', 'Rolls up automatically', 'Export three reports, join in Excel'],
  ['Marketplace short-pays you', 'Flagged with a claim pack ready', 'Usually a separate tool, often nobody'],
  ['Piece-rate artisan wages', 'Built in', 'Custom development'],
  ['Product photos & listings', 'Native, on your own catalogue', 'Third-party subscription'],
  ['Working without internet', 'Single-file apps run offline', 'Cloud only']].map(r =>
  `<tr><td>${r[0]}</td><td class="y">${r[1]}</td><td class="n">${r[2]}</td></tr>`).join('')}
</tbody></table>
<p class="note">We are not claiming they are bad software. We are claiming that <b>one data core removes a category of work</b> — reconciliation — that a suite can only ever manage.</p>`));

/* 25 SECURITY */
pages.push(pg(`<h2>Security &amp; trust</h2>
<p class="big">Your credentials are never the key.</p>
<div class="two">
 <div class="k"><b>Scoped keys only</b><span>Marketplace, bank and courier connections use revocable, scoped API keys held in an encrypted vault. Medhava never asks for, uses or stores an account password. If you revoke a key, access stops immediately.</span></div>
 <div class="k"><b>Your data is yours</b><span>Every record carries a company id enforced at the database level. Group companies stay separate and consolidate only when you ask.</span></div>
 <div class="k"><b>Nothing happens invisibly</b><span>Every posting, price change and permission grant is written to an append-only trail with who, when, and what changed.</span></div>
 <div class="k"><b>You can always leave</b><span>Full export of your data in open formats, any time. Offline single-file apps keep working with no server at all.</span></div>
</div>
<p class="note"><b>Why this matters more than it sounds.</b> Most Indian sellers hand their marketplace passwords to whoever is helping them. That is a business-ending risk. Medhava is built so you never have to.</p>`));

/* 26 PRICING */
pages.push(pg(`<h2>Pricing</h2>
<p>Per company, billed annually. <b>Every plan includes all sixteen modules</b> — you are never sold a module you already needed.</p>
<div class="pgrid">
 ${[['Starter', '₹0', 'free forever', 'Single shop or seller', ['All 16 modules', '1 user, 1 company', '1 sales channel', 'Offline apps', 'Community support'], 0],
   ['Growth', '₹7,499', 'per month, billed annually', 'Scaling D2C & marketplace', ['Everything in Starter', '15 users, 3 companies', 'All 7 marketplaces', 'Settlement & claims', 'AI content & images', 'Priority support'], 1],
   ['Enterprise', '₹24,999', 'per month, billed annually', 'Multi-unit manufacturers', ['Everything in Growth', 'Unlimited users', 'Manufacturing & karigar payroll', 'Group consolidation', 'SSO & audit export', 'Success manager'], 0]].map(p =>
  `<div class="pc${p[5] ? ' best' : ''}">${p[5] ? '<span class="bd2">Most popular</span>' : ''}
   <b class="pn">${p[0]}</b><span class="pw">${p[3]}</span>
   <div class="pa">${p[1]}</div><div class="pp">${p[2]}</div>
   <ul>${p[4].map(f => `<li>${f}</li>`).join('')}</ul></div>`).join('')}
</div>
<p class="note">Limits are on users, companies and channels — never on capability. Nobody should discover a missing module halfway through an implementation.</p>`));

/* 27 FAQ */
pages.push(pg(`<h2>Questions</h2>
${[['Do I have to move everything at once?', 'No. Most businesses start with one module — usually Purchase or Inventory — run it alongside what they have for a month, then add the next. Because everything shares one data core, each module you add makes the previous ones more useful.'],
  ['Will it work with my existing accounting software?', 'Yes. BUSY and Tally data can be migrated in, and exported back out, so your CA keeps working the way they always have while you transition.'],
  ['We are not a textile company. Is this for us?', 'Yes. Every app ships in a neutral configuration alongside the industry one. The engine, the formulas and the tests are identical — only the master data changes.'],
  ['What happens if the internet goes down?', 'Each app is also a single file that runs offline in a browser, stores data locally and exports a backup. When you reconnect, the hosted edition runs the identical engine.'],
  ['How long does it take to get running?', 'Starter runs the same day. A typical Growth rollout — catalogue, opening stock, opening balances and two marketplace channels — takes two to three weeks. Manufacturing usually adds two more weeks of parallel running.'],
  ['Do you need my marketplace passwords?', 'Never. Connections use revocable scoped API keys that you generate and can revoke at any time. We do not ask for, use or store account passwords.']].map(q =>
  `<div class="q"><b>${q[0]}</b><span>${q[1]}</span></div>`).join('')}`));

/* 28 START */
pages.push(pg(`<h2>Getting started</h2>
<div class="steps">
 ${[['Book a 30-minute demo', 'Bring one month of sales, purchases and stock. We will show you, on your own numbers, what your current tools are hiding.'],
   ['Pick one module', 'Usually Purchase or Inventory. Run it beside what you have today — nothing is switched off.'],
   ['See it agree with reality', 'Your closing stock and your books should match your own records. When they do, add the next module.'],
   ['Roll out at your pace', 'Each module you add makes the ones already running more useful, because they all share the same records.']].map((s, i) =>
  `<div class="st"><span class="sn">${i + 1}</span><div><b>${s[0]}</b><span>${s[1]}</span></div></div>`).join('')}
</div>
<h3>Available today</h3>
<p><b>Module 09 · Purchase</b> is complete and running — Procurement with three-way matching, and Vendor Management with risk scoring and performance-based sourcing. Both ship as working apps you can open and use offline today, in a configuration for your industry and a neutral one for any industry.</p>
<div class="end">${MARK(44)}
 <div class="et">One business. One brain.</div>
 <div class="ec">medhava.com · hello@medhava.com</div></div>`));

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:0}
body{font-family:'Segoe UI',system-ui,-apple-system,Roboto,Helvetica,Arial,sans-serif;color:#0d2233;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;min-height:297mm;padding:16mm 15mm 12mm;page-break-after:always;position:relative;display:flex;flex-direction:column;background:#fff}
.bd{flex:1}
.ft{position:absolute;left:15mm;right:15mm;bottom:8mm;display:flex;justify-content:space-between;align-items:center;font-size:8.5px;color:#93a7b0;border-top:1px solid #e6eeec;padding-top:5px}
.ft svg{vertical-align:-2px;margin-right:3px}
h1{font-size:52px;letter-spacing:-.035em;line-height:1.03}
h2{font-size:25px;letter-spacing:-.022em;margin-bottom:10px;padding-bottom:7px;border-bottom:3px solid #0fae90}
h2.mth{border:none;padding:0;margin:0;font-size:27px}
h3{font-size:13px;color:#0a7660;margin:15px 0 8px;letter-spacing:.02em;text-transform:uppercase;font-weight:700}
p{font-size:11.5px;line-height:1.65;margin-bottom:8px;color:#33475a}
p.big{font-size:14px;line-height:1.6;color:#1b3348}
.note{background:#eef8f5;border-left:3px solid #0fae90;padding:10px 13px;border-radius:0 8px 8px 0;font-size:10.5px;color:#22485c;margin-top:11px;line-height:1.6}
.ai{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
/* cover */
.cover{background:linear-gradient(155deg,#0b2a24 0%,#12312d 48%,#0a6e5b 128%);color:#fff;justify-content:center}
.cover .lg{display:flex;align-items:center;gap:13px;font-size:31px;font-weight:700;letter-spacing:-.035em}
.cover h1{color:#fff;margin:34px 0 12px}
.cover .sub{font-size:15px;color:#cdeee4;font-weight:500}
.cover .ld{font-size:12.5px;line-height:1.75;color:#d4efe7;max-width:142mm;margin-top:22px}
.cover .bg{margin-top:28px;display:flex;gap:8px;flex-wrap:wrap}
.cover .bg span{background:rgba(255,255,255,.12);border:1px solid rgba(127,230,207,.42);color:#dff2ec;font-size:10.5px;font-weight:600;padding:6px 14px;border-radius:20px}
.cover .cf{position:absolute;bottom:15mm;left:15mm;font-size:11px;color:#8fcabb}
/* contents */
.toc2{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:14px}
.tc b{font-size:10.5px;color:#0a7660;display:block;margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em}
.tc div{font-size:10.5px;line-height:1.95;color:#41576b}
/* what it is */
.wide{display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px;margin:14px 0}
.w{background:#f6fbf9;border:1px solid #e2ede9;border-radius:11px;padding:14px}
.wn{display:block;font-size:32px;font-weight:700;letter-spacing:-.04em;color:#0fae90;line-height:1}
.w b{display:block;font-size:12px;margin:5px 0 4px}
.w span{font-size:10px;color:#5c6f7e;line-height:1.55}
.cascade{background:#f6fbf9;border:1px solid #d9ebe5;border-radius:11px;padding:13px 15px;margin:10px 0}
.cs{display:flex;gap:10px;align-items:flex-start;padding:5px 0;font-size:11px;color:#33475a}
.cs .n{flex:0 0 18px;height:18px;border-radius:5px;background:#0fae90;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center}
.cs b{color:#0d2233}
/* problem */
.pr{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:12px}
.p{background:#fff;border:1px solid #e2ede9;border-left:3px solid #d98a5a;border-radius:0 10px 10px 0;padding:12px 14px}
.p b{display:block;font-size:12px;margin-bottom:4px}
.p span{font-size:10.3px;color:#5c6f7e;line-height:1.6}
/* core */
.corebox{background:#12312d;border-radius:13px;padding:18px;text-align:center;margin:12px 0;color:#fff}
.ct{font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:#7fe6cf;font-weight:700}
.ce{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:11px 0 9px}
.ce span{background:#0fae90;color:#fff;font-size:11.5px;font-weight:600;padding:6px 15px;border-radius:20px}
.cd{font-size:10px;color:#a9d3c8}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
.k{background:#f7fbfa;border:1px solid #e4ecea;border-radius:10px;padding:11px 13px}
.k b{display:block;font-size:11.5px;margin-bottom:3px}
.k span{font-size:10.2px;color:#5c6f7e;line-height:1.55}
table{width:100%;border-collapse:collapse;font-size:10.5px;margin:9px 0}
th,td{text-align:left;padding:7px 10px;border-bottom:1px solid #e9efed}
th{background:#eef8f5;color:#0a7660;font-size:9px;text-transform:uppercase;letter-spacing:.05em}
td.y{color:#0a8f74;font-weight:600}td.n{color:#93a7b0}
.cmp td:first-child{width:32%;font-weight:500}
.big-t td{padding:8px 10px}
/* module grid */
.mgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:12px}
.mg{border:1px solid #e2ede9;border-radius:10px;padding:11px}
.mh{display:flex;align-items:center;justify-content:space-between;color:#0fae90;margin-bottom:7px}
.mn{font-size:9px;font-family:ui-monospace,Menlo,monospace;color:#a9bcc4}
.mg b{display:block;font-size:11.5px;letter-spacing:-.01em}
.mc{display:block;font-size:8.5px;color:#0a7660;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin:2px 0 5px}
.mt{font-size:9.5px;color:#697f8d;line-height:1.45}
/* module page */
.mtop{display:flex;align-items:center;gap:13px;border-bottom:3px solid #0fae90;padding-bottom:9px;margin-bottom:11px}
.mi{width:42px;height:42px;flex:0 0 42px;border-radius:11px;background:#e2f4ee;color:#0a7660;display:flex;align-items:center;justify-content:center}
.mi .ai{width:22px;height:22px}
.meye{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#0a7660;font-weight:700}
.wire{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}
.wl{background:#f7fbfa;border:1px solid #e4ecea;border-radius:9px;padding:9px 11px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.wt{font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:3px 8px;border-radius:5px}
.wt.in{background:#fff2e0;color:#a8641c}.wt.out{background:#d9f2ea;color:#0a7660}
.wc{font-size:10px;color:#41576b;background:#fff;border:1px solid #e2ede9;border-radius:5px;padding:3px 8px}
.apps{display:grid;gap:8px;margin-top:4px}
.app{display:flex;gap:11px;align-items:flex-start;border:1px solid #e2ede9;border-radius:10px;padding:11px 13px;background:#fff}
.app.on{border-color:#9fdcc9;background:#f6fdfb}
.aic{width:34px;height:34px;flex:0 0 34px;border-radius:9px;background:#e2f4ee;color:#0a7660;display:flex;align-items:center;justify-content:center}
.app b{display:block;font-size:12.5px;margin-bottom:2px;letter-spacing:-.01em}
.app span{font-size:10.5px;color:#5c6f7e;line-height:1.55}
.lv{font-size:8px;background:#0fae90;color:#fff;font-weight:700;padding:2px 7px;border-radius:20px;margin-left:7px;letter-spacing:.04em;vertical-align:2px}
/* industries */
.ind{display:grid;gap:9px;margin-top:12px}
.in{display:flex;gap:11px;align-items:flex-start;border:1px solid #e2ede9;border-radius:10px;padding:12px 14px}
.in b{display:block;font-size:12.5px;margin-bottom:3px}
.in span{font-size:10.5px;color:#5c6f7e;line-height:1.6}
/* pricing */
.pgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px;margin-top:14px}
.pc{border:1.5px solid #e2ede9;border-radius:13px;padding:16px 15px;position:relative}
.pc.best{border-color:#0fae90;box-shadow:0 4px 18px rgba(15,174,144,.14)}
.bd2{position:absolute;top:-9px;left:50%;transform:translateX(-50%);background:#0fae90;color:#fff;font-size:8px;font-weight:700;padding:3px 11px;border-radius:20px;letter-spacing:.04em}
.pn{font-size:15px;display:block}
.pw{font-size:9.5px;color:#93a7b0;display:block;margin-bottom:11px}
.pa{font-size:27px;font-weight:700;letter-spacing:-.035em;line-height:1}
.pp{font-size:9.5px;color:#93a7b0;margin-bottom:11px}
.pc ul{list-style:none}
.pc li{font-size:10px;color:#41576b;padding:4px 0 4px 14px;position:relative;line-height:1.4}
.pc li:before{content:'✓';position:absolute;left:0;color:#0fae90;font-weight:700}
/* faq */
.q{border-bottom:1px solid #e9efed;padding:11px 0}
.q b{display:block;font-size:12.5px;margin-bottom:4px}
.q span{font-size:11px;color:#5c6f7e;line-height:1.65}
/* steps */
.steps{display:grid;gap:9px;margin-top:12px}
.st{display:flex;gap:12px;align-items:flex-start;background:#f7fbfa;border:1px solid #e4ecea;border-radius:10px;padding:12px 14px}
.sn{flex:0 0 24px;height:24px;border-radius:7px;background:#0fae90;color:#fff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center}
.st b{display:block;font-size:12.5px;margin-bottom:2px}
.st span{font-size:10.5px;color:#5c6f7e;line-height:1.55}
.end{margin-top:24px;text-align:center}
.end svg{margin:0 auto}
.et{font-size:15px;font-weight:700;letter-spacing:-.02em;margin-top:9px}
.ec{font-size:10.5px;color:#93a7b0;margin-top:4px}
`;

(async () => {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${pages.join('')}</body></html>`;
  fs.writeFileSync(path.join(D, 'sitebook.html'), html);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.goto('file://' + path.join(D, 'sitebook.html'), { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  const out = path.join(D, 'Medhava_Website.pdf');
  await p.pdf({ path: out, width: '210mm', height: '297mm', printBackground: true });
  await b.close();
  console.log('PDF:', Math.round(fs.statSync(out).size / 1024) + 'KB · pages:', pages.length);
})();
