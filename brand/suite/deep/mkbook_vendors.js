'use strict';
// Generates the illustrated PDF tour (17 pages) for Vendor Management, embedding HD screenshots.
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const DIR = __dirname, SHOTS = path.join(DIR, 'shots'), OUT = path.join(DIR, 'out');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const img = (tag, v) => 'file://' + path.join(SHOTS, tag + '_' + v + '.png');
const CSS = require('./bookcss.js');

const CFG = {
  ERP: { tag: 'VERP', company: 'Acme Corp (any industry)', edition: 'Unified ERP — any industry',
    lede: 'An industry-neutral supplier master. The same engine runs a textile mill, a medical distributor, a manufacturer or a services firm — you change only the vendor master.',
    v1: 'Alpha Industrial Supplies', v2: 'Beta Components Ltd', v3: 'Gamma Materials Co', v4: 'Delta Trading',
    word: 'supplier', ledger: 'Finance / Ledger', cat2: 'Components',
    outfile: 'Medhava_VendorManagement_ERP.pdf' },
  VAS: { tag: 'VVAS', company: 'Vastrangam', edition: 'Vastrangam — ethnic-wear D2C + marketplace',
    lede: 'Vastrangam’s supplier master for the Surat–Jaipur fabric and zari base. Every mill carries its real record — spend, payables, delivery performance and risk — so next season’s buying follows evidence, not habit.',
    v1: 'Jagdamba Textiles', v2: 'Kanchi Silks', v3: 'Surat Cotton Mills', v4: 'Rungta Lining House',
    word: 'mill', ledger: 'Finance / BUSY ledger', cat2: 'Zari & silk',
    outfile: 'Medhava_VendorManagement_Vastrangam.pdf' }
};

function page(inner, n) { return `<section class="pg"><div class="pgbody">${inner}</div><div class="foot"><span>Medhava · Vendor Management — ${n.ed}</span><span>${n.p}</span></div></section>`; }

function book(c) {
  let pn = 0; const ed = c.edition; const P = () => { pn++; return { ed, p: pn + ' / 17' }; };
  const fig = (v, cap) => `<figure><img src="${img(c.tag, v)}"><figcaption>${cap}</figcaption></figure>`;
  const pages = [];
  pages.push(`<section class="pg cover"><div class="cwrap">
    <div class="logo"><span class="mk"><svg width="26" height="26" viewBox="0 0 40 40"><path d="M9 31V15l11 11 11-11v16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 5c.25 3.1.8 3.8 3.9 4.05-3.1.25-3.65.95-3.9 4.05-.25-3.1-.8-3.8-3.9-4.05C19.2 8.8 19.75 8.1 20 5z" fill="#fff"/></svg></span> Medhava</div>
    <div class="ed">${ed}</div>
    <h1>Vendor<br>Management</h1>
    <div class="sub">Vendor 360 · Payables · Aging · Risk · Performance-Based Sourcing</div>
    <div class="module">Domain 9 · Purchase — App 2 of 2</div>
    <p class="lede">${c.lede}</p>
    <div class="badges"><span>Single-file · offline</span><span>14/14 self-tests</span><span>Wired to Procurement · Finance · Quality</span></div>
    <div class="cfoot">${c.company} · FY 2026-27 · One business. One brain.</div></div></section>`);

  pages.push(page(`<h2>What this is &amp; what's inside</h2>
    <p class="big">Vendor Management is the <b>one supplier truth</b> in the ERP. It answers four questions no spreadsheet answers together: <b>who is this ${c.word}, what have we spent, what do we still owe, and can we rely on them?</b></p>
    <p>Procurement (App 1) creates the transactions. This app turns that history into <b>judgement</b> — a performance score from real receipts, a risk score that catches danger even when performance looks perfect, and a sourcing recommendation you can defend with numbers.</p>
    <p>It is one self-contained HTML file. Double-click to open, runs <b>offline</b>, saves in the browser, and checks itself with <b>14 self-tests</b> on every launch.</p>
    <div class="toc"><h3>Contents</h3><ol>
      <li>What this is &amp; what's inside</li><li>Where it sits — the Party entity</li><li>Data model</li>
      <li>Screen · Dashboard</li><li>Screen · Vendor Directory</li><li>Screen · Vendor 360</li>
      <li>Screen · Bills &amp; Payments</li><li>Screen · Aging</li><li>Screen · Risk (the control)</li>
      <li>Screen · Sourcing</li><li>Screen · Wiring</li><li>Formulas &amp; rules</li>
      <li>The risk model explained</li><li>Self-tests (all 14)</li><li>Data in / out &amp; hosted API</li>
      <li>Honest limits &amp; roadmap</li><li>How to run &amp; accept</li></ol></div>`, P()));

  pages.push(page(`<h2>Where Vendor Management sits</h2>
    <p>Every app in Medhava sits on <b>one shared Data Core</b>: Item/SKU, <b>Party</b>, Stock, Ledger/Voucher, Order. This app <b>owns the Party entity</b> for suppliers — so a vendor edited here is the same vendor Procurement raises a PO against and Finance pays.</p>
    <div class="flow"><span class="fb">Vendor</span><span class="ar">→</span><span class="fb">Bills</span><span class="ar">→</span><span class="fb">Aging</span><span class="ar">→</span><span class="fb">Risk</span><span class="ar">→</span><span class="fb">Sourcing</span></div>
    <p class="cap">Facts become money, money becomes exposure, exposure becomes a sourcing decision.</p>
    <div class="wire2"><div class="core"><b>UNIFIED DATA CORE</b><span>Item · <b>Party</b> · Stock · Ledger · Order</span></div>
      <div class="ring">
        <div class="rn out">→ Procurement · route to the best ${c.word}</div>
        <div class="rn out">→ ${c.ledger} · payables &amp; payment run</div>
        <div class="rn out">→ Sourcing · dual-source high risk</div>
        <div class="rn in">← Procurement · GRN results build history</div>
        <div class="rn in">← Finance · payments clear balances</div>
        <div class="rn in">← Quality · rejections lower accept rate</div></div></div>`, P()));

  pages.push(page(`<h2>Data model</h2>
    <p>Three entities, and everything numeric is <b>computed</b> — never re-keyed.</p>
    <table class="dm"><thead><tr><th>Entity</th><th>Key fields</th></tr></thead><tbody>
      <tr><td><b>Vendor</b></td><td>id · name · gstin · category · payment terms · location</td></tr>
      <tr><td><b>Bill</b></td><td>id · vendor · date · due · amount · paid</td></tr>
      <tr><td><b>Delivery</b></td><td>vendor · ordered · received · accepted · onTime — the performance history</td></tr>
    </tbody></table>
    <p class="note">Nothing stores "outstanding", "risk" or "score". All three are derived on read, so they can never drift out of step with the underlying bills and receipts.</p>
    <h3>The demo dataset</h3>
    <table class="dm"><thead><tr><th>Figure</th><th>Value</th></tr></thead><tbody>
      <tr><td>Total spend</td><td class="mono">₹8,00,300</td></tr>
      <tr><td>Total payable</td><td class="mono">₹5,02,600</td></tr>
      <tr><td>Overdue</td><td class="mono">2 bills · ₹1,56,400</td></tr>
      <tr><td>Aging</td><td class="mono">current 3,46,200 · 1-30 92,400 · 31-60 0 · 60+ 64,000</td></tr>
    </tbody></table>`, P()));

  pages.push(page(`<h2>Dashboard</h2><p>The supplier position in one screen — what you owe, what is late, and how many ${c.word}s are carrying real risk.</p>${fig('dash', 'Payables, overdue exposure, high-risk count, aging summary and a payment form.')}
    <ul class="pts"><li><b>Overdue value</b> is the number that costs you relationships — it is computed, not tracked by hand.</li><li><b>High-risk ${c.word}s</b> counts anything scoring above 50 on the risk model (page 13).</li><li>Recording a payment updates the balance, the bucket and the risk score in one action.</li></ul>`, P()));

  pages.push(page(`<h2>Vendor Directory</h2><p>Every ${c.word} on one line: who they are, what share of your spend they hold, what you owe, and how they actually perform.</p>${fig('directory', 'Spend, share %, payable and a colour-coded performance score per vendor.')}
    <ul class="pts"><li>Performance badge: <b>green ≥ 90%</b>, <b>amber 70–89%</b>, <b>red &lt; 70%</b>.</li><li><b>Share %</b> is the early-warning column — it is what turns a good ${c.word} into a risky one.</li><li>"360 →" opens the full record for that ${c.word}.</li></ul>`, P()));

  pages.push(page(`<h2>Vendor 360</h2><p>One ${c.word}, completely. Spend and share, live payable, delivery performance broken into its three parts, risk band, full profile and every bill.</p>${fig('v360', 'Spend, payable, performance and risk, with profile and bill history.')}
    <ul class="pts"><li><b>${c.v1}</b>: ₹3,52,600 spend — <b>44% of everything you buy</b>.</li><li>On-time 100%, quality 98%, fill 100% → performance <b>99%</b>.</li><li>Yet risk is <b>27 (medium)</b> — because of that 44%. Excellence and exposure are different things.</li></ul>`, P()));

  pages.push(page(`<h2>Bills &amp; Payments</h2><p>The payables ledger. Every bill with amount, paid, still owing, and which aging bucket it has fallen into.</p>${fig('ledger', 'Amount / paid / owing / bucket for each bill, plus an add-bill form.')}
    <ul class="pts"><li><b>Owing = amount − paid</b>, floored at zero — you cannot overpay a bill into a negative balance.</li><li>Paying more than is owed is clamped to the outstanding amount.</li><li>Status is derived from the due date against today, never typed in.</li></ul>`, P()));

  pages.push(page(`<h2>Aging</h2><p>How late is the money? Every open bill is bucketed against today, so you can see at a glance what must clear this week versus what has become a problem.</p>${fig('aging', 'Bucket KPIs, a distribution chart, and open bills sorted oldest-first.')}
    <ul class="pts"><li><b>60+ · ₹64,000</b> — ${c.v4}, <b>76 days late</b>. That is the one to call today.</li><li><b>1-30 · ₹92,400</b> — ${c.v2}, 30 days late.</li><li>Buckets always sum exactly to total payable — self-test #4 enforces it.</li></ul>`, P()));

  pages.push(page(`<h2>Risk — the control</h2><p>The screen that earns the app its place. Risk is not a feeling; it is three measurable signals combined, and it deliberately catches danger that a performance score alone would hide.</p>${fig('risk', 'Vendors ranked by risk, with the formula stated openly and a concentration chart.')}
    <ul class="pts"><li><b>${c.v2} — 39 (medium)</b>: 64% performance and one overdue bill.</li><li><b>${c.v1} — 27 (medium) at 99% performance.</b> Nothing is wrong with them; you simply depend on them too much.</li><li>The formula is printed on the screen, so no one has to trust a black box.</li></ul>`, P()));

  pages.push(page(`<h2>Sourcing</h2><p>The output of everything else: for each category, the ${c.word} the evidence says you should buy from — with a watchlist that states plainly why anyone is flagged.</p>${fig('sourcing', 'Preferred vendor per category, best overall, and a reasoned watchlist.')}
    <ul class="pts"><li><b>${c.v3} at 100%</b> is the strongest ${c.word} overall — new orders route there first.</li><li>Every watchlist entry names its cause: <i>performance 64% · concentration 44% · 1 overdue</i>.</li><li>This turns "we've always bought from them" into a decision you can defend.</li></ul>`, P()));

  pages.push(page(`<h2>Wiring — one record, every module</h2><p>The vendor master is a Data Core entity, so it is never a private list. Every module that touches a supplier reads and writes the same record.</p>${fig('wiring', 'Outbound and inbound flows, plus the live cascade from a late delivery.')}
    <ul class="pts"><li>A late delivery → on-time drops → risk rises → preferred status lost → the next RFQ routes elsewhere → Finance flags the overdue bill.</li><li>That is five modules reacting to one fact, with no one re-typing anything.</li></ul>`, P()));

  pages.push(page(`<h2>Formulas &amp; rules</h2>
    <pre class="code">outstanding(bill) = r2(max(0, amount − paid))
daysLate(bill)    = days(due → TODAY)          TODAY = 2026-07-25 (fixed, so aging is testable)
bucket(bill)      = paid | current | 1-30 | 31-60 | 60+

payable(vendor?)  = r2(Σ outstanding)
spend(vendor)     = r2(Σ amount)               sharePct = round(spend / totalSpend × 100)

PERFORMANCE  (null when no delivery history)
   onTime%  = round(onTimeDeliveries / totalDeliveries × 100)
   quality% = round(Σaccepted / Σreceived × 100)      // accept rate at inspection
   fill%    = round(Σreceived / Σordered × 100)
   score    = round(mean of available metrics)

RISK  0 best … 100 worst
   performance   = 25 if no history, else round((100 − score) × 0.5)   max 50
   concentration = min(30, round(sharePct × 0.6))                       max 30
   discipline    = min(20, overdueBillCount × 10)                       max 20
   band: ≤25 low · ≤50 medium · &gt;50 high

PREFERRED VENDOR = highest score among rated vendors (per category, and overall)</pre>
    <p class="note">Everything above is derived at read time. The database stores vendors, bills and receipts; the judgements are recomputed on every render.</p>`, P()));

  pages.push(page(`<h2>The risk model explained</h2>
    <p class="big">Most vendor scorecards measure only <b>performance</b>. That misses the two ways suppliers actually hurt you.</p>
    <table class="dm"><thead><tr><th>Signal</th><th>Max</th><th>Why it belongs</th></tr></thead><tbody>
      <tr><td><b>Weak performance</b></td><td class="mono">50</td><td>Late, short or rejected deliveries stop your production line. The largest single weight.</td></tr>
      <tr><td><b>Spend concentration</b></td><td class="mono">30</td><td>If one ${c.word} holds 44% of your buying, <b>their</b> bad quarter becomes <b>your</b> bad quarter — however well they perform today.</td></tr>
      <tr><td><b>Payment indiscipline</b></td><td class="mono">20</td><td>Bills you have let run overdue damage the relationship and your priority in their queue. Risk you created.</td></tr>
    </tbody></table>
    <div class="note"><b>The case that proves the model:</b> ${c.v1} scores <b>99% on performance</b> — near-perfect. A conventional scorecard would rate them your safest ${c.word}. Medhava rates them <b>medium risk (27)</b>, because 44% of everything you buy comes from them. That is not a criticism of the ${c.word}; it is a fact about <i>your</i> exposure, and it is exactly the fact worth knowing before a disruption, not after.</div>`, P()));

  const tests = [
    ['outstanding = amount − paid', '₹98,900'], ['fully paid bill is bucket "paid"', 'BILL-9001'],
    ['total payable = Σ outstanding', '₹5,02,600'], ['bucket totals sum to total payable', '= 5,02,600'],
    ['BILL-9005 is 60+ days overdue', '76 days late'], [`${c.v1} on-time = 100%`, '2 of 2'],
    [`${c.v1} quality = 98%`, '156 / 160 received'], [`${c.v2} on-time = 0%`, '0 of 2'],
    [`${c.v4} fill rate = 90%`, '180 of 200'], ['spend shares sum to ~100%', 'within rounding'],
    ['risk bounded 0..100', 'every vendor'], ['late + overdue is riskier than clean', '39 &gt; 14'],
    ['preferred vendor is highest-scoring', `${c.v3} @ 100%`], ['paying reduces payable exactly', 'by the amount paid']
  ];
  pages.push(page(`<h2>Self-tests — all 14 pass</h2><p>These run on every launch and appear on <b>Backup &amp; Health</b>. They pin the exact figures this document quotes.</p>
    <table class="tt"><thead><tr><th>#</th><th>Check</th><th>Expected</th><th>Result</th></tr></thead><tbody>
    ${tests.map((t, i) => `<tr><td>${i + 1}</td><td>${t[0]}</td><td class="mono">${t[1]}</td><td class="pass">✓ pass</td></tr>`).join('')}
    </tbody></table>
    <p class="note"><b>Tests run against a deep copy of the database, never the live one.</b> A self-test that paid a bill would silently alter your books on every launch — so the harness clones first. Reload the app and every figure is identical.</p>`, P()));

  pages.push(page(`<h2>Data in / out &amp; hosted API</h2>
    <p>The single file is the <b>local edition</b>. The hosted edition runs the identical engine against a backend, so performance history is written automatically instead of seeded.</p>
    <table class="dm"><thead><tr><th>Boundary</th><th>Local (this file)</th><th>Hosted edition</th></tr></thead><tbody>
      <tr><td>Storage</td><td>Browser localStorage + JSON backup</td><td>Postgres with row-level security per company</td></tr>
      <tr><td>Performance history</td><td>Seeded deliveries</td><td>Written automatically by every GRN in Procurement</td></tr>
      <tr><td>Payments</td><td>Recorded in-app</td><td>Posted from ${c.ledger} and bank reconciliation</td></tr>
      <tr><td>Sourcing</td><td>Recommendation shown</td><td>Preferred vendor auto-applied to new RFQs</td></tr>
      <tr><td>3rd-party auth</td><td>—</td><td><b>Revocable scoped API keys in an encrypted vault — never passwords</b></td></tr>
    </tbody></table>
    <p class="note">API surface (hosted): <span class="mono">/vendor · /vendor/{id}/360 · /bill · /payment · /aging · /vendor/risk · /sourcing/preferred</span> — each emits an event other modules subscribe to.</p>`, P()));

  pages.push(page(`<h2>Honest limits &amp; roadmap</h2>
    <ul class="pts big2"><li><b>Local-first, single browser.</b> Cross-module posting is real in the hosted edition, illustrated here.</li>
      <li><b>Performance history is seeded</b> in this build; hosted, it is a by-product of goods receipt.</li>
      <li><b>Not in this file:</b> multi-currency, vendor self-service portal, contract &amp; rate-card expiry, TDS on vendor payments, credit-limit blocking — all hosted-tier.</li>
      <li><b>Risk weights are a starting point.</b> They are printed on screen precisely so you can argue with them and tune them to your business.</li>
      <li><b>Security:</b> real connections use scoped, revocable keys in an encrypted vault. Account passwords are never used or stored.</li></ul>
    <h3>Domain 9 · Purchase</h3>
    <div class="flow sm"><span class="fb">✓ Procurement</span><span class="ar">·</span><span class="fb">✓ Vendor Management</span></div>
    <p class="cap">Domain 9 complete. Next: Domain 7 · Inventory, then Domain 5 · Warehouse.</p>`, P()));

  pages.push(page(`<h2>How to run &amp; accept</h2>
    <ol class="run"><li><b>Open</b> <span class="mono">Vendor Management.html</span> by double-clicking — any modern browser, offline.</li>
      <li><b>Backup &amp; Health</b> → confirm <b>14/14 pass</b>. Refresh; every figure is unchanged.</li>
      <li><b>Aging</b> → ₹64,000 in <b>60+</b> (${c.v4}, 76 days late).</li>
      <li><b>Risk</b> → ${c.v2} 39 (medium); <b>${c.v1} 27 (medium) at 99% performance</b>.</li>
      <li><b>Sourcing</b> → best overall <b>${c.v3} at 100%</b>, with a reasoned watchlist.</li>
      <li><b>Vendor 360</b> → ${c.v1}: ₹3,52,600 spend, 44% share, on-time 100%, quality 98%.</li>
      <li><b>Wiring</b> → the ${c.v2} cascade across five modules.</li></ol>
    <div class="accept">Accepted when: it opens offline, all 14 tests are green, no console errors, figures survive a refresh, and the numbers match your own records.</div>
    <div class="end">Medhava · Vendor Management — Domain 9, App 2 of 2 · ${c.company}</div>`, P()));

  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${pages.join('')}</body></html>`;
}

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  for (const key of ['ERP', 'VAS']) {
    const c = CFG[key];
    const htmlPath = path.join(DIR, 'bookv_' + key + '.html');
    fs.writeFileSync(htmlPath, book(c));
    const p = await b.newPage();
    await p.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    await p.pdf({ path: path.join(OUT, c.outfile), width: '210mm', height: '297mm', printBackground: true });
    await p.close();
    console.log('PDF', c.outfile, Math.round(fs.statSync(path.join(OUT, c.outfile)).size / 1024) + 'KB');
  }
  await b.close();
})();
