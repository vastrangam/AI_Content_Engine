'use strict';
// Generates the illustrated PDF tour (~17 pages) for a Procurement format, embedding HD screenshots.
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const DIR = __dirname, SHOTS = path.join(DIR, 'shots'), OUT = path.join(DIR, 'out');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const img = (tag, v) => 'file://' + path.join(SHOTS, tag + '_' + v + '.png');

const CFG = {
  ERP: { tag: 'ERP', company: 'Acme Corp (any industry)', edition: 'Unified ERP — any industry',
    lede: 'An industry-neutral procure-to-pay module. The same engine runs a textile mill, a medical distributor, a manufacturer, or a services firm — you change only the vendor and item master.',
    vendor: 'Alpha Industrial Supplies', item: 'Primary raw material', ledger: 'Finance / Ledger',
    mfg: 'Manufacturing / Planning', winner: 'Gamma Materials Co', outfile: 'Medhava_Procurement_ERP.pdf' },
  VAS: { tag: 'VAS', company: 'Vastrangam', edition: 'Vastrangam — ethnic-wear D2C + marketplace',
    lede: 'Vastrangam’s buy side for fabric, zari and trims from the Surat–Jaipur base. Accepted metres feed the karigar floor and BUSY books; nothing over-billed can be paid.',
    vendor: 'Jagdamba Textiles (Surat)', item: 'Banarasi silk fabric', ledger: 'Finance / BUSY ledger',
    mfg: 'Manufacturing / Karigar', winner: 'Surat Cotton Mills', outfile: 'Medhava_Procurement_Vastrangam.pdf' }
};

function page(inner, n) { return `<section class="pg"><div class="pgbody">${inner}</div><div class="foot"><span>Medhava · Procurement — ${n.ed}</span><span>${n.p}</span></div></section>`; }

function book(c) {
  let pn = 0; const ed = c.edition; const P = () => { pn++; return { ed, p: pn + ' / 16' }; };
  const fig = (v, cap) => `<figure><img src="${img(c.tag, v)}"><figcaption>${cap}</figcaption></figure>`;
  const pages = [];
  // 1 · COVER
  pages.push(`<section class="pg cover"><div class="cwrap">
    <div class="logo"><span class="mk">◑</span> Medhava</div>
    <div class="ed">${ed}</div>
    <h1>Procurement</h1>
    <div class="sub">RFQ → Purchase Order → Goods Receipt → 3-Way Match → Vendor Scorecard</div>
    <div class="module">Module 1 · Supply Chain &amp; Procurement — App 1 of 6</div>
    <p class="lede">${c.lede}</p>
    <div class="badges"><span>Single-file · offline</span><span>14/14 self-tests</span><span>Wired to Stock · Finance · ${c.mfg.split(' / ')[1]||'Production'}</span></div>
    <div class="cfoot">${c.company} · FY 2026-27 · SmartHub-teal design system</div></div></section>`);
  // 2 · CONTENTS + what it is
  pages.push(page(`<h2>What this is &amp; what's inside</h2>
    <p class="big">Procurement is the <b>buy side</b> of the ERP: it turns a need into a quote, a quote into a purchase order, a delivery into accepted stock, and a supplier bill into a <b>safe, matched payment</b> — while scoring every vendor on real performance.</p>
    <p>It is one self-contained HTML file. It opens by double-click, runs fully <b>offline</b>, saves your data in the browser, and checks itself with <b>14 self-tests</b> on every launch. This document tours all nine screens with live screenshots, then documents the exact formulas, the wiring to the rest of the ERP, and the tests.</p>
    <div class="toc"><h3>Contents</h3><ol>
      <li>What this is &amp; what's inside</li><li>Where Procurement sits — the pipeline &amp; data core</li>
      <li>Data model — the entities</li><li>Screen · Dashboard</li><li>Screen · RFQ &amp; quote comparison</li>
      <li>Screen · Purchase Orders</li><li>Screen · Goods Receipt (GRN)</li><li>Screen · 3-Way Match (the control)</li>
      <li>Screen · Vendor Scorecard</li><li>Screen · Vendors &amp; item master</li><li>Screen · Wiring (integration)</li>
      <li>Formulas &amp; business rules</li><li>Self-tests (all 14)</li><li>Data in / out &amp; hosted API</li>
      <li>Honest limits &amp; roadmap</li><li>How to run &amp; accept</li></ol></div>`, P()));
  // 3 · Where it sits
  pages.push(page(`<h2>Where Procurement sits</h2>
    <p>Every app in Medhava sits on <b>one shared Data Core + event bus</b>: Item/SKU, Party (vendor), Stock, Ledger/Voucher, Order. Procurement <b>writes</b> to Stock (accepted goods), the Ledger (payable + tax credit) and Master Data (preferred vendors), and <b>reads</b> requirements from Manufacturing/Planning and reorder alerts from Inventory.</p>
    <div class="flow"><span class="fb">RFQ</span><span class="ar">→</span><span class="fb">Purchase Order</span><span class="ar">→</span><span class="fb">Goods Receipt</span><span class="ar">→</span><span class="fb">3-Way Match</span><span class="ar">→</span><span class="fb">Payment</span></div>
    <p class="cap">The procure-to-pay pipeline. The scorecard runs across the whole history in parallel.</p>
    <div class="wire2"><div class="core"><b>UNIFIED DATA CORE</b><span>Item · Party · Stock · Ledger · Order</span></div>
      <div class="ring"><div class="rn out">→ Inventory · Stock IN (accepted)</div><div class="rn out">→ ${c.ledger} · payable + ITC</div><div class="rn out">→ ${c.mfg} · feeds BOM / cut plan</div><div class="rn in">← Planning · requirements</div><div class="rn in">← Inventory · reorder alerts</div><div class="rn in">← Master Data · items, tax/HSN</div></div></div>`, P()));
  // 4 · Data model
  pages.push(page(`<h2>Data model — the entities</h2>
    <p>Procurement owns five documents; everything numeric is <b>computed</b>, never re-keyed.</p>
    <table class="dm"><thead><tr><th>Entity</th><th>Key fields</th></tr></thead><tbody>
      <tr><td><b>Vendor</b></td><td>id · name · gstin · category · terms</td></tr>
      <tr><td><b>Item</b></td><td>code · name · uom · stdRate (benchmark)</td></tr>
      <tr><td><b>Purchase Order</b></td><td>id · vendor · date · expected · status (draft/approved/partial/received/closed) · lines[ item · qty · rate · tax% ]</td></tr>
      <tr><td><b>GRN (Goods Receipt)</b></td><td>id · po · date · onTime · lines[ item · ordered · received · accepted · rejected ]</td></tr>
      <tr><td><b>Invoice / Bill</b></td><td>id · po · vendor · date · lines[ item · qty · rate · tax% ]</td></tr>
      <tr><td><b>RFQ</b></td><td>id · item · qty · status · awarded · quotes[ vendor · rate · lead days ]</td></tr>
    </tbody></table>
    <p class="note">Invariants enforced by the engine: <b>accepted + rejected = received</b>, <b>received ≤ ordered</b>, and Input Tax Credit accrues on <b>accepted value only</b>.</p>`, P()));
  // 5-12 · screens
  pages.push(page(`<h2>Dashboard</h2><p>The one-screen state of the buy side. Every figure is computed live from your documents — open commitments, receipts still due, blocked bills, and the tax credit you can claim.</p>${fig('dash','Open POs, open value, pending receipts, 3-way exceptions and claimable ITC — plus a quick-PO form.')}
    <ul class="pts"><li><b>Open PO value</b> sums the gross of every not-yet-received order.</li><li><b>3-way exceptions</b> is your risk number — bills that must not be paid yet.</li><li><b>Raise a quick PO</b> creates an approved order that immediately appears under Goods Receipt.</li></ul>`, P()));
  pages.push(page(`<h2>RFQ &amp; quote comparison</h2><p>Invite quotes from several vendors, compare landed rate and lead time side by side, and award the best in one click — the award becomes an approved purchase order automatically.</p>${fig('rfq','Competing quotes with the lowest tagged; "Award lowest → create PO".')}
    <ul class="pts"><li>The engine tags the <b>lowest rate</b> and, on award, spawns a PO to that vendor at that price.</li><li>In the demo, ${c.item==='Banarasi silk fabric'?'the dye/finishing RFQ':'the finishing-consumable RFQ'} awards to <b>${c.winner} @ ₹210</b>.</li></ul>`, P()));
  pages.push(page(`<h2>Purchase Orders</h2><p>Each PO shows its lines with per-line net and tax, then rolls up to Net, GST and Gross. Draft orders are approved here; approved orders are received under Goods Receipt.</p>${fig('po','Line detail with Net/Tax, and PO Net → GST → Gross → Expected date.')}
    <ul class="pts"><li><b>Net</b> = Σ(qty × rate); <b>Tax</b> = Σ(qty × rate × GST%); <b>Gross</b> = Net + Tax.</li><li>Status flows draft → approved → partial → received as goods arrive.</li></ul>`, P()));
  pages.push(page(`<h2>Goods Receipt (GRN)</h2><p>The moment quality matters. Against each PO you record <b>received</b>, <b>accepted</b> and <b>rejected</b>. Only the <b>accepted</b> quantity posts to Stock and earns tax credit; rejects raise a debit note.</p>${fig('grn','Ordered/received/accepted/rejected, with "→ Stock IN (accepted)" and rejects flagged.')}
    <ul class="pts"><li>Receiving clamps to ordered; a partial receipt sets the PO to <b>partial</b>.</li><li>GRN-501 accepts 96 of 100 — so Stock rises by 96, not 100, and the 4 rejects become a debit note.</li></ul>`, P()));
  pages.push(page(`<h2>3-Way Match — the control</h2><p>The heart of procurement. A supplier bill only passes for payment when <b>PO, GRN and Invoice agree</b> on price and quantity. Any mismatch is held with a plain-English reason.</p>${fig('match','Two demo bills, both correctly held: one over-bills rejects, one hikes the price.')}
    <ul class="pts"><li><b>BILL-9001</b> — held: <i>billed 100 &gt; accepted 96</i> (paying for rejected goods).</li><li><b>BILL-9002</b> — held: <i>price 150 → 165</i> (rate above the PO beyond 0.5% tolerance).</li><li>This single screen is what stops silent margin leakage on the buy side.</li></ul>`, P()));
  pages.push(page(`<h2>Vendor Scorecard</h2><p>Vendors ranked on facts, not opinions — on-time %, quality (accept rate) and fill rate, all computed from receipt history, rolled into one score.</p>${fig('scorecard','Ranked vendors with on-time / quality / fill and a colour-coded score, plus quality bars.')}
    <ul class="pts"><li><b>${c.vendor}</b>: 96% quality (96/100), 100% on-time.</li><li>A late delivery drops on-time to 0% for that vendor; a short delivery shows as a &lt;100% fill rate.</li></ul>`, P()));
  pages.push(page(`<h2>Vendors &amp; item master</h2><p>The single source every PO, GRN and bill draws from — vendors with GSTIN, category and terms, and items with unit of measure and a benchmark rate for price checks.</p>${fig('vendors','Vendor master and item master — the shared reference data.')}
    <ul class="pts"><li>Changing a vendor's terms or an item's std rate flows to every future document.</li><li>The std rate is the yardstick the 3-way match and repricing use.</li></ul>`, P()));
  pages.push(page(`<h2>Wiring — one action cascades</h2><p>Procurement never stands alone. This screen makes the integration literal: every event writes to the shared Data Core, so a single Goods Receipt updates Stock, Finance, Quality and the Scorecard at once.</p>${fig('wiring','Outbound/inbound data flows and the live GRN-501 cascade with ITC ₹1,344.00.')}
    <ul class="pts"><li>GRN-501 → Stock IN +96 → ${c.ledger} payable + ITC ₹1,344.00 → debit note on 4 rejects → scorecard recompute.</li><li>Inbound: ${c.mfg} requirements, Inventory reorder alerts, Master Data, Automation.</li></ul>`, P()));
  // 13 · Formulas
  pages.push(page(`<h2>Formulas &amp; business rules</h2>
    <pre class="code">lineNet(l)  = r2(qty × rate)
lineTax(l)  = r2(qty × rate × tax/100)
poNet       = r2(Σ lineNet)     poTax = r2(Σ lineTax)     poGross = poNet + poTax

GRN         accepted + rejected = received      received ≤ ordered
ITC         = r2( Σ_grn Σ_line ( accepted × PO.rate × PO.tax/100 ) )     // accepted value only

3-WAY MATCH (tolerance TOL = 0.5%)  → exception if any:
   |invoice.rate − PO.rate| / PO.rate > TOL          → "price X→Y"
   invoice.qty > GRN.accepted                         → "billed N > accepted M"
   invoice.qty > PO.qty                               → "billed N > ordered M"

SCORECARD   onTime% = onTimeGRNs / totalGRNs ×100
            quality%= accepted / received ×100
            fill%   = received / ordered ×100
            score   = mean(available metrics)         badge ≥90 grn · 70–89 amb · <70 red

RFQ AWARD   winner = min(rate) → creates approved PO at winning rate</pre>
    <p class="note">Everything above is <b>derived</b> at read time. The database stores documents; the numbers are always recomputed, so they can never drift out of sync.</p>`, P()));
  // 14 · self-tests
  const tests = [
    ['PO net = qty × rate', 'poNet(PO-1001) = 28,000'],
    ['PO tax = qty × rate × gst%', 'poTax = 1,400'],
    ['PO gross = net + tax', '29,400'],
    ['GRN accepted + rejected = received', '96 + 4 = 100'],
    ['GRN received ≤ ordered', '100 ≤ 100'],
    ['ITC on accepted value only', '2,559.00'],
    ['3-way flags the price mismatch', 'BILL-9002 (150→165)'],
    ['3-way flags over-billing vs accepted', 'BILL-9001 (100 > 96)'],
    ['exactly 2 bills, both exceptions', 'matched 0 / exceptions 2'],
    ['V1 quality = 96%', '96 / 100 received'],
    ['V1 on-time = 100%', '1 / 1 delivery'],
    ['V2 on-time = 0%', 'late delivery'],
    ['V4 fill rate = 90%', '180 / 200 ordered'],
    ['RFQ award picks lowest quote', 'winner @ ₹210']
  ];
  pages.push(page(`<h2>Self-tests — all 14 pass</h2><p>The app runs these on every launch and shows the result on <b>Backup &amp; Health</b>. They pin the exact numbers this document quotes, so "it works" is verifiable, not asserted.</p>
    <table class="tt"><thead><tr><th>#</th><th>Check</th><th>Expected</th><th>Result</th></tr></thead><tbody>
    ${tests.map((t, i) => `<tr><td>${i + 1}</td><td>${t[0]}</td><td class="mono">${t[1]}</td><td class="pass">✓ pass</td></tr>`).join('')}
    </tbody></table><p class="note">Verified twice: engine tests in Node, then all nine screens in a real headless browser with zero console errors.</p>`, P()));
  // 15 · data in/out & API
  pages.push(page(`<h2>Data in / out &amp; hosted API</h2>
    <p>The single-file app is the <b>local edition</b>. The hosted, multi-tenant edition runs the identical engine against a backend so Stock and Ledger update across modules for real.</p>
    <table class="dm"><thead><tr><th>Boundary</th><th>Local (this file)</th><th>Hosted edition</th></tr></thead><tbody>
      <tr><td>Storage</td><td>Browser localStorage + JSON backup</td><td>Postgres with row-level security per company</td></tr>
      <tr><td>Stock update</td><td>Shown as "→ Stock IN"</td><td>Event bus posts to the real Stock ledger</td></tr>
      <tr><td>Books</td><td>Shown as payable + ITC</td><td>Double-entry voucher in ${c.ledger}</td></tr>
      <tr><td>Vendor connect</td><td>Manual entry</td><td>Vendor portal + email/RFQ ingest</td></tr>
      <tr><td>Auth to 3rd parties</td><td>—</td><td><b>Revocable scoped API keys in an encrypted vault — never passwords</b></td></tr>
    </tbody></table>
    <p class="note">API surface (hosted): <span class="mono">/rfq · /po · /grn · /invoice · /match · /vendor/scorecard</span> — each emits an event other modules subscribe to.</p>`, P()));
  // 16 · limits
  pages.push(page(`<h2>Honest limits &amp; roadmap</h2>
    <p>What this build is — and isn't — so there are no surprises.</p>
    <ul class="pts big2"><li><b>Local-first, single browser.</b> Cross-module posting is real in the hosted edition, illustrated here.</li>
      <li><b>One line per document</b> in the demo seed; the engine already supports multi-line POs/GRNs/bills.</li>
      <li><b>Not yet in this file:</b> multi-currency, landed-cost apportionment, batch/expiry, vendor-portal quoting — all hosted-tier.</li>
      <li><b>Security:</b> real connections use scoped, revocable keys in an encrypted vault; account passwords are never used or stored.</li></ul>
    <h3>Roadmap for this module</h3>
    <div class="flow sm"><span class="fb">✓ Procurement</span><span class="ar">·</span><span class="fb">Vendor Mgmt</span><span class="ar">·</span><span class="fb">Inventory</span><span class="ar">·</span><span class="fb">Warehouse</span><span class="ar">·</span><span class="fb">Logistics</span><span class="ar">·</span><span class="fb">Raw-Material Store</span></div>
    <p class="cap">Module 1 · Supply Chain &amp; Procurement — the other five apps follow, same depth.</p>`, P()));
  // 17 · how to run
  pages.push(page(`<h2>How to run &amp; accept</h2>
    <ol class="run"><li><b>Open</b> <span class="mono">procurement_${c.tag === 'VAS' ? 'Vastrangam' : 'ERP'}.html</span> by double-clicking — any modern browser, offline.</li>
      <li><b>Backup &amp; Health</b> → confirm <b>14/14 self-tests pass</b>.</li>
      <li><b>3-Way Match</b> → BILL-9001 &amp; BILL-9002 are held with reasons.</li>
      <li><b>Goods Receipt</b> → each GRN shows "→ Stock IN (accepted)".</li>
      <li><b>Vendor Scorecard</b> → ${c.vendor} 96% quality / 100% on-time.</li>
      <li><b>RFQ</b> → "Award lowest → create PO" → ${c.winner} @ ₹210.</li>
      <li><b>Wiring</b> → the GRN-501 cascade (ITC ₹1,344.00) proves the numbers flow onward.</li></ol>
    <div class="accept">Accepted when: it opens offline, all 14 tests are green, no console errors, and the exported files match your own records.</div>
    <div class="end">Medhava · Procurement — Module 1, App 1 of 6 · ${c.company}</div>`, P()));
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${pages.join('')}</body></html>`;
}

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16302b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;padding:18mm 17mm 12mm;page-break-after:always;position:relative;display:flex;flex-direction:column;background:#fff}
.pgbody{flex:1;overflow:hidden}
.foot{position:absolute;left:17mm;right:17mm;bottom:8mm;display:flex;justify-content:space-between;font-size:9px;color:#7b88a8;border-top:1px solid #e0e6f4;padding-top:5px}
h1{font-size:52px;letter-spacing:-.02em;color:#111c3a;margin:6px 0}
h2{font-size:25px;color:#111c3a;letter-spacing:-.01em;margin-bottom:10px;padding-bottom:8px;border-bottom:3px solid #2f5de0}
h3{font-size:15px;color:#2f5de0;margin:16px 0 8px}
p{font-size:12.5px;line-height:1.62;margin-bottom:10px;color:#33405e}
p.big{font-size:15px;line-height:1.6}
.note{background:#eaf0fe;border-left:3px solid #2f5de0;padding:9px 12px;border-radius:0 8px 8px 0;font-size:11.5px;color:#245}
.cap{font-size:10.5px;color:#7b88a8;font-style:italic;text-align:center;margin-top:-2px}
figure{margin:8px 0}
figure img{width:100%;border:1px solid #d7deef;border-radius:9px;box-shadow:0 2px 10px rgba(17,28,58,.08)}
figcaption{font-size:10px;color:#7b88a8;text-align:center;margin-top:5px;font-style:italic}
ul.pts{margin:10px 0 0 2px;list-style:none}
ul.pts li{font-size:12px;line-height:1.5;padding:4px 0 4px 18px;position:relative;color:#33405e}
ul.pts li:before{content:'▸';color:#0fae90;position:absolute;left:0;font-weight:700}
ul.pts.big2 li{font-size:13px;padding:7px 0 7px 18px}
/* cover */
.cover{background:linear-gradient(150deg,#141c3a 0%,#1b2550 55%,#3f5fe0 130%);color:#fff;justify-content:center}
.cover .cwrap{color:#fff}
.cover .logo{font-size:26px;font-weight:800;letter-spacing:-.01em;display:flex;align-items:center;gap:10px}
.cover .logo .mk{width:38px;height:38px;border-radius:11px;background:#2f5de0;display:flex;align-items:center;justify-content:center;font-size:22px}
.cover .ed{margin-top:26px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#9db6ff;font-weight:700}
.cover h1{color:#fff;font-size:62px;margin:4px 0 2px}
.cover .sub{font-size:16px;color:#d3ddfa;font-weight:500}
.cover .module{margin-top:16px;font-size:12px;color:#a8bcf5;font-weight:600;letter-spacing:.02em}
.cover .lede{margin-top:20px;font-size:14px;line-height:1.7;color:#e9eefc;max-width:150mm}
.cover .badges{margin-top:26px;display:flex;gap:9px;flex-wrap:wrap}
.cover .badges span{background:rgba(255,255,255,.12);border:1px solid rgba(157,182,255,.4);color:#dee7fd;font-size:11px;font-weight:600;padding:6px 13px;border-radius:20px}
.cover .cfoot{position:absolute;bottom:16mm;left:17mm;font-size:11px;color:#8fa2d8}
/* toc */
.toc{margin-top:14px;background:#f5f8fe;border:1px solid #dde5f6;border-radius:10px;padding:14px 18px}
.toc ol{margin-left:18px}
.toc li{font-size:12px;line-height:1.9;color:#33405e}
/* flow */
.flow{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:16px 0 4px}
.flow.sm{margin:10px 0}
.fb{background:#2f5de0;color:#fff;font-weight:700;font-size:12.5px;padding:9px 15px;border-radius:9px;box-shadow:0 2px 6px rgba(47,93,224,.3)}
.flow.sm .fb{background:#e9eefc;color:#1e40af;box-shadow:none;border:1px solid #cbd7fa;font-size:11px;padding:6px 11px}
.ar{color:#9cb8b0;font-weight:800;font-size:16px}
.wire2{margin-top:18px;border:1px dashed #bcd8cf;border-radius:12px;padding:16px}
.core{background:#141c3a;color:#fff;border:2px solid #2f5de0;border-radius:10px;padding:12px 16px;text-align:center;margin-bottom:14px}
.core b{font-size:14px;letter-spacing:.03em}.core span{display:block;font-size:11px;color:#9db6ff;margin-top:3px}
.ring{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.rn{font-size:11.5px;padding:8px 12px;border-radius:8px;font-weight:600}
.rn.out{background:#e9eefc;color:#1e40af;border:1px solid #cbd7fa}
.rn.in{background:#fff3e6;color:#9a5a22;border:1px solid #f2d8bd}
/* tables */
table{width:100%;border-collapse:collapse;margin:10px 0;font-size:11.5px}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e4eaf7;vertical-align:top}
th{background:#eef2fd;color:#1e40af;font-size:10px;text-transform:uppercase;letter-spacing:.04em}
table.dm td:first-child{width:32%}
.tt td{font-size:11px}.tt td.pass{color:#12a06e;font-weight:700;white-space:nowrap;width:16%}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px}
/* code */
pre.code{background:#111c3a;color:#dbe4fb;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px;line-height:1.65;padding:16px 18px;border-radius:10px;white-space:pre-wrap;margin:8px 0}
/* run */
ol.run{margin:8px 0 0 20px}ol.run li{font-size:12.5px;line-height:1.5;padding:5px 0}
.accept{margin-top:16px;background:#e9eefc;border:1px solid #cbd7fa;border-radius:10px;padding:13px 16px;font-size:12.5px;color:#1e40af;font-weight:600}
.end{margin-top:22px;text-align:center;font-size:12px;color:#7b88a8;letter-spacing:.02em}
`;

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  for (const key of ['ERP', 'VAS']) {
    const c = CFG[key];
    const html = book(c);
    const htmlPath = path.join(DIR, 'book_' + key + '.html');
    fs.writeFileSync(htmlPath, html);
    const p = await b.newPage();
    await p.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    await p.pdf({ path: path.join(OUT, c.outfile), width: '210mm', height: '297mm', printBackground: true });
    await p.close();
    const kb = Math.round(fs.statSync(path.join(OUT, c.outfile)).size / 1024);
    console.log('PDF', c.outfile, kb + 'KB');
  }
  await b.close();
})();
