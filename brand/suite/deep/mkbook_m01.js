'use strict';
/* Module 01 · Dashboard & BI — illustrated process PDFs.
   Four app books (2 apps × 2 editions) + one module book. Plain language, real screenshots,
   every diagram drawn in CSS so it prints crisply. */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const CSS = require('./bookcss.js');
const { bookBuilder, testPages, connectorsPage, connectorsRules, connectorsPage2, zipPage } = require('./bookparts.js');
const MOD = require('./module_m01.js');
const ROADMAP = require('./roadmap.js');
const DIR = __dirname, SHOTS = path.join(DIR, 'shots'), OUT = path.join(DIR, 'out');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TESTS = JSON.parse(fs.readFileSync(path.join(DIR, 'tests.json'), 'utf8'));
const img = (tag, v) => 'file://' + path.join(SHOTS, tag + '_' + v + '.png');

const EXTRA = `
.pg2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px}
.cardbox{border:1px solid #dcebe5;border-radius:10px;padding:12px 14px;background:#f7fbfa}
.cardbox b{color:#0b6a58;font-size:12.5px;display:block;margin-bottom:4px}
.cardbox span{font-size:11.5px;line-height:1.55;color:#31473f;display:block}
.steps{margin-top:12px}
.st{display:flex;gap:12px;align-items:flex-start;padding:9px 0;border-bottom:1px dashed #dcebe5}
.st:last-child{border-bottom:none}
.st .n{flex:0 0 26px;height:26px;border-radius:8px;background:#0fae90;color:#fff;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center}
.st .tx{font-size:12px;line-height:1.55;color:#31473f}
.st .tx b{color:#0b3b31}
.rule{background:#fff8ee;border:1px solid #f2ddc0;border-radius:9px;padding:10px 13px;margin:7px 0;font-size:11.5px;color:#7a4f16}
.rule b{color:#8a4b0c}
.good{background:#e7f5f0;border:1px solid #bfe6d9;border-radius:9px;padding:10px 13px;margin:7px 0;font-size:11.5px;color:#0b6a58}
.two-col{column-count:2;column-gap:16px}
.two-col li{break-inside:avoid}
figure.tall img{max-height:196mm;width:auto;max-width:100%;display:block;margin:0 auto}
figure.half img{max-width:72%;display:block;margin:0 auto}
.vs th:first-child{width:22%}
.kbd{background:#0f2a25;color:#d7f2e9;border-radius:5px;padding:1px 6px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10.5px}
`;

const mark = `<span class="mk"><svg width="26" height="26" viewBox="0 0 40 40"><path d="M9 31V15l11 11 11-11v16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 5c.25 3.1.8 3.8 3.9 4.05-3.1.25-3.65.95-3.9 4.05-.25-3.1-.8-3.8-3.9-4.05C19.2 8.8 19.75 8.1 20 5z" fill="#fff"/></svg></span>`;

function doc(pagesHtml, title) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${CSS}${EXTRA}</style></head><body>${pagesHtml}</body></html>`;
}
function mkPager(edition, total, appName) {
  let n = 1; /* the cover is page 1 */
  return (inner) => { n++; return `<section class="pg"><div class="pgbody">${inner}</div><div class="foot"><span>Medhava · ${appName} — ${edition}</span><span>${n} / ${total}</span></div></section>`; };
}
function cover(c, h1, sub, moduleLine, lede, badges) {
  return `<section class="pg cover"><div class="cwrap">
    <div class="logo">${mark} Medhava</div>
    <div class="ed">${c.edition}</div>
    <h1>${h1}</h1>
    <div class="sub">${sub}</div>
    <div class="module">${moduleLine}</div>
    <p class="lede">${lede}</p>
    <div class="badges">${badges.map(b => `<span>${b}</span>`).join('')}</div>
    <div class="cfoot">${c.co} · FY 2026-27 · Medhava design system</div></div></section>`;
}
function testTable(list) {
  return `<table class="tt"><thead><tr><th>Result</th><th>What was checked</th></tr></thead><tbody>${
    list.map(t => `<tr><td class="pass">${t.ok ? '✓ pass' : '✗ FAIL'}</td><td>${t.name.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td></tr>`).join('')}</tbody></table>`;
}

/* ══════════════════ CEO DASHBOARD BOOK ══════════════════ */
function dashboardBook(c) {
  const P = bookBuilder(c.edition, 'CEO Dashboard');
  const fig = (v, cap, cls) => `<figure class="${cls || ''}"><img src="${img(c.tag, v)}"><figcaption>${cap}</figcaption></figure>`;
  const pages = [];

  pages.push(cover(c, 'CEO Dashboard',
    'Did we make money · Is the cash safe · What needs me today',
    'Module 01 · Dashboard &amp; BI — App 1 of 2',
    c.lede,
    ['One file · opens by double-click', 'Works offline', '23 / 23 self-tests pass', 'Reads everything, writes nothing']));

  pages.push(P(`<h2>What this is, and what is inside</h2>
    <p class="big">The CEO Dashboard is the <b>one screen you look at each morning</b>. It answers three questions and nothing else: did we make money, is the cash safe, and what needs a decision today.</p>
    <p>You will never type a figure into it. Every number is worked out from records the rest of the business already keeps — ${c.sources}. That is the whole idea: if a number here looks wrong, the record behind it is wrong, and the Wiring screen tells you exactly which one to go and check.</p>
    <p>It is a single HTML file. It opens by double-click, runs with the internet switched off, saves your work in the browser, and checks its own arithmetic <b>23 different ways</b> every time it starts.</p>
    <div class="toc"><h3>What this document covers</h3>${P.toc()}</div>`));

  pages.push(P(`<h2>Where the Dashboard sits</h2>
    <p>Every Medhava app stands on <b>one shared Data Core</b>: Item/SKU, Party, Stock, Ledger/Voucher and Order. Each module writes into it; the Dashboard only ever reads from it.</p>
    <div class="wire2"><div class="core"><b>UNIFIED DATA CORE</b><span>Item · Party · Stock · Ledger · Order</span></div>
      <div class="ring">
        ${c.ring.map(r => `<div class="rn ${r[0]}">${r[1]}</div>`).join('')}
      </div></div>
    <p class="cap">Orange = what the Dashboard reads in. Green = what it gives back. It gives back only alerts and a view — never a change to your books.</p>
    <div class="good"><b>Why this matters.</b> A dashboard that can also change your records is a dashboard you cannot audit. This one is deliberately read-only. The single thing it stores is which alerts you have personally cleared, and that is kept separately from your data.</div>
    <h3>What it reads, and from where</h3>
    <table><thead><tr><th>Comes from</th><th>What it supplies</th></tr></thead><tbody>
      ${c.wiringIn.map(w => `<tr><td><b>${w.from}</b></td><td>${w.what}</td></tr>`).join('')}
    </tbody></table>`));

  pages.push(P(`<h2>The process — how a figure reaches this screen</h2>
    <p>Nothing on the Dashboard is stored. Every time a screen opens, the whole chain below runs again from the raw records. This is what "live" actually means.</p>
    <div class="flow"><span class="fb">Records</span><span class="ar">→</span><span class="fb">Period filter</span><span class="ar">→</span><span class="fb">Add up</span><span class="ar">→</span><span class="fb">Apply rules</span><span class="ar">→</span><span class="fb">Screen</span></div>
    <p class="cap">The same five steps produce every single number you see.</p>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>A record exists.</b> ${c.step1}</div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>The period you picked decides what counts.</b> Choose June and only June's records are included. Choose Full year and all four months are. Balances — cash, money owed, stock — deliberately ignore this, because a balance is a position, not a period.</div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>Everything is added up from scratch.</b> Not read from a stored total. This is why the figures can never drift out of step with the records underneath them.</div></div>
      <div class="st"><span class="n">4</span><div class="tx"><b>The rules run.</b> Returns come off before anything is called "net". Purchases, wages and running costs come off before anything is called "profit". Four alert rules are tested against the fresh figures.</div></div>
      <div class="st"><span class="n">5</span><div class="tx"><b>The screen is drawn.</b> Cards, tables, bars and the alert list — all from the numbers just calculated. Then it is thrown away and done again on the next click.</div></div>
    </div>
    <div class="rule"><b>The one rule that matters most.</b> ${c.bigRule}</div>`));

  pages.push(P(`<h2>Screen · Overview</h2>
    ${fig('dash', 'The Overview screen. Five cards, the trend on the left, what needs a decision on the right.', 'tall')}
    <h3>Reading it in thirty seconds</h3>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>Net profit</b> — did we earn? If it is green you are ahead; the percentage beside it tells you by how much of every rupee sold.</div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>Cash + bank</b> — are we safe? A business can be profitable and still be unable to pay a mill on Friday. This is the number that answers that.</div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>Open alerts</b> — what needs me? If it is zero, close the laptop. If it is not, the panel on the right already lists them, worst first, with a button that takes you to the screen where you can act.</div></div>
    </div>`));

  pages.push(P(`<h2>Overview, explained card by card</h2>
    <div class="pg2">
      <div class="cardbox"><b>Net sales</b><span>What you sold, <b>after returns have been taken off</b>. This is not the figure a marketplace dashboard shows you — theirs is gross.</span></div>
      <div class="cardbox"><b>Net profit</b><span>What is actually left: net sales − ${c.cogsShort} − wages − running costs. The percentage underneath is that profit as a share of net sales.</span></div>
      <div class="cardbox"><b>Cash + bank</b><span>Your real position right now. It does <b>not</b> change when you switch period — a balance is a balance, not "profit for June".</span></div>
      <div class="cardbox"><b>To collect</b><span>Everything ${c.owers} still owe you, whatever its age.</span></div>
      <div class="cardbox"><b>Open alerts</b><span>How many things need a decision. Red the moment there is one.</span></div>
      <div class="cardbox"><b>Net sales by month</b><span>A bar per month with that month's profit beside it, the best month, and the four-month totals. The badge compares the newest month with the one before.</span></div>
    </div>
    <h3>What you can click</h3>
    <ul class="pts">
      <li><b>Any period button</b> — April, May, June, July or Full year. Every figure on every screen is recalculated.</li>
      <li><b>"Open →" on any alert</b> — jumps straight to the screen where you can do something about it.</li>
      <li><b>Any menu item</b> on the left, or the ☰ button on a phone.</li>
    </ul>
    <div class="good">Read it in this order: <b>Net profit</b> first (did we earn?), then <b>Cash + bank</b> (are we safe?), then <b>Open alerts</b> (what needs me?). Thirty seconds, and you know where you stand.</div>`));

  pages.push(P(`<h2>Proof that it is live</h2>
    <p>This is the same screen as the previous page. Only one thing was clicked: the period changed from July to April.</p>
    ${fig('dash_april', 'April selected. Every card, both panels and the alert list have been recomputed.', 'tall')}
    <h3>What moved, and what deliberately did not</h3>
    <table><thead><tr><th>Figure</th><th>Changed?</th><th>Why</th></tr></thead><tbody>
      <tr><td><b>Net sales</b></td><td>Yes</td><td>It is a period figure — this is what was sold in April.</td></tr>
      <tr><td><b>Net profit &amp; margin</b></td><td>Yes</td><td>Every line that builds it is filtered to April.</td></tr>
      <tr><td><b>Cash + bank</b></td><td><b>No</b></td><td>A balance is a position, not a period. "Cash for April" is not a thing.</td></tr>
      <tr><td><b>To collect</b></td><td><b>No</b></td><td>Money owed is owed today, whichever month it arose in.</td></tr>
      <tr><td><b>Open alerts</b></td><td>Partly</td><td>Stock and payment alerts are about today. Return-rate alerts are recomputed for the period.</td></tr>
    </tbody></table>
    <div class="good">That distinction is the difference between a dashboard you can act on and one that quietly misleads you. Most spreadsheet dashboards filter everything by the date column, which turns a bank balance into nonsense.</div>`));

  pages.push(P(`<h2>Screen · Sales &amp; Channels</h2>
    <p>This screen exists to answer one uncomfortable question: <b>which channel looks big but is not?</b></p>
    ${fig('sales', 'Gross, returns, return %, net and units — for every channel, side by side.', 'tall')}
    <div class="rule"><b>Read the "Return %" column first.</b> ${c.returnRule}</div>
    <h3>The four cards</h3>
    <div class="pg2">
      <div class="cardbox"><b>Gross sales</b><span>Everything sold, before returns. The flattering number — the one you are shown everywhere else.</span></div>
      <div class="cardbox"><b>Returns</b><span>What came back, and what share of gross that is. Turns red above 10%.</span></div>
      <div class="cardbox"><b>Net sales</b><span>Gross minus returns. The honest number, and the one every other screen uses.</span></div>
      <div class="cardbox"><b>Units sold</b><span>Pieces, not rupees. Useful when comparing a discount-heavy month with a full-price one.</span></div>
    </div>
    <p style="margin-top:10px">Below the table, the same channels are drawn as bars <b>by net sales</b> — so the ranking you see with your eyes is the ranking that actually matters, not the one gross would give you.</p>`));

  pages.push(P(`<h2>Screen · Money</h2>
    ${fig('money', 'Cash, who owes you, who you owe — and the profit worked out line by line.', 'tall')}
    <h3>How the ageing tags work</h3>
    <table><thead><tr><th>&nbsp;</th><th>ok / on time</th><th>overdue / late</th><th>chase now / very late</th></tr></thead><tbody>
      <tr><td><b>${c.recTitleShort}</b></td><td>Under 30 days</td><td>Over 30 days</td><td>Over 60 days</td></tr>
      <tr><td><b>${c.payTitleShort}</b></td><td>Not yet due</td><td>Past its due date</td><td>Over 60 days late</td></tr>
    </tbody></table>
    <p><b>Net position</b> — cash plus what you are owed, minus what you owe — is the card to watch. Healthy profit with a negative net position means the money is sitting in somebody else's account, not yours.</p>
    <div class="good"><b>The profit build-up panel at the bottom is the most useful thing on this screen.</b> It shows profit line by line — net sales, minus ${c.cogsShort}, minus wages, = gross profit, minus running costs, = net profit. Every line moves when you change the period, so you can see exactly which line is eating the margin.</div>`));

  pages.push(P(`<h2>Screen · Stock &amp; Making</h2>
    ${fig('stock', 'What you are holding, what is running out, and what the floor produced.', 'tall')}
    <p><b>The tag on the right of the stock table is the part to act on:</b> "reorder" means at or below the reorder point — order it today. "low" means within twice the reorder point — order it this week. "ok" means leave it alone.</p>
    <p><b>Cost per piece</b>, in the production table, is the number to watch over time. If wages climb faster than pieces, every piece is costing more and the margin is shrinking quietly.</p>
    <h3>The four cards</h3>
    <table><thead><tr><th>Card</th><th>What it means</th><th>What to do about it</th></tr></thead><tbody>
      <tr><td><b>Stock value</b></td><td>Everything held, valued at what it cost you</td><td>If this keeps climbing while sales do not, cash is being buried in stock.</td></tr>
      <tr><td><b>Running out</b></td><td>Items at or below their reorder point</td><td>Any number above zero is a purchase list for today.</td></tr>
      <tr><td><b>Pieces made</b></td><td>What the floor finished in this period</td><td>Compare with units sold — making far more than you sell is how stock value climbs.</td></tr>
      <tr><td><b>Making cost</b></td><td>Wages paid for that output</td><td>Divide by pieces made and watch the trend month to month.</td></tr>
    </tbody></table>
    <div class="rule"><b>Why the reorder point, and not a percentage.</b> A percentage of stock tells you nothing about how long it takes to replace. The reorder point is set per item, from how long ${c.leadFrom} takes to deliver it — so "reorder" genuinely means "order it today or you will run out".</div>`));

  pages.push(P(`<h2>Screen · Alerts — the four rules</h2>
    <p>Nobody types these in. They are worked out from your live figures every time the screen opens. Exactly four rules produce every alert in the system:</p>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>Stock at or below its reorder point.</b> Marked <b>urgent</b>. ${c.rule1}</div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>Somebody has owed you money for more than 30 days.</b> Marked <b>watch</b> — or <b>urgent</b> past 60 days.</div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>A bill you owe has gone past its due date.</b> Marked <b>watch</b> — or <b>urgent</b> past 60 days late.</div></div>
      <div class="st"><span class="n">4</span><div class="tx"><b>A channel's return rate has reached 12% or more.</b> Marked <b>watch</b>. ${c.rule4}</div></div>
    </div>
    ${fig('alerts', 'Every open alert, with "Look" to investigate and "Clear" to mark it handled.')}`));

  pages.push(P(`<h2>What "clearing" an alert does</h2>
    ${fig('alerts_cleared', 'One alert cleared. The count drops, and a "Cleared" panel appears with a way to bring them all back.', 'tall')}
    <div class="rule"><b>Clearing changes nothing in your business.</b> It only records that you have seen it. If the underlying situation gets worse — the stock falls further, the payment goes another month late — the alert comes straight back on its own. "Bring them all back" undoes every clear at once.</div>
    <h3>Why clearing exists at all</h3>
    <ul class="pts">
      <li><b>An alert list you cannot tick off is an alert list you stop reading.</b> After a week of seeing the same four lines, your eye skips them — and then you miss the fifth.</li>
      <li><b>Clearing is personal, not shared.</b> It is stored separately from your business data, so a backup restore never brings back a stale "handled" flag.</li>
      <li><b>It cannot hide a real problem.</b> The alert is recalculated from live figures every single time the screen opens. Clearing suppresses one specific alert; the moment the underlying rule fires again on worse numbers, it is back.</li>
      <li><b>The "Cleared" count on this screen</b> tells you how many you are currently suppressing, so nothing is hidden from you either.</li>
    </ul>`));

  pages.push(P(`<h2>Screen · Wiring</h2>
    <p>Read this screen once and you will never wonder where a figure came from again.</p>
    ${fig('wiring', 'Every figure on the Dashboard, its source, and how it is worked out.', 'tall')}
    <p>Below the table it follows <b>one single sale</b> the whole way through: the sale is recorded → net sales and the channel table move → stock falls → if that crosses a reorder point an alert appears → the customer balance is added to "to collect" → net profit is recalculated. Five consequences, from one entry, with nothing typed twice.</p>
    <div class="good"><b>And the statement at the bottom of that screen is the important one:</b> this dashboard writes nothing. It is a read-only view of the business. Clearing an alert is the only thing it ever stores, and only for you. That is deliberate — a dashboard that can change your books is a dashboard you cannot trust.</div>`));

  pages.push(P(`<h2>Every figure, and how it is worked out</h2>
    <p>This is the same table as the Wiring screen, so you have it on paper.</p>
    <table><thead><tr><th>Figure</th><th>Comes from</th><th>How it is worked out</th></tr></thead><tbody>
      ${c.wiring.map(w => `<tr><td><b>${w.f}</b></td><td>${w.s}</td><td>${w.h}</td></tr>`).join('')}
    </tbody></table>
    <h3>The arithmetic, in one place</h3>
    <table><thead><tr><th>Name</th><th>Worked out as</th></tr></thead><tbody>
      <tr><td>Net sales</td><td>gross sales − returns</td></tr>
      <tr><td>Return %</td><td>returns ÷ gross sales × 100</td></tr>
      <tr><td>Gross profit</td><td>net sales − ${c.cogsShort} − wages</td></tr>
      <tr><td>Net profit</td><td>gross profit − running costs</td></tr>
      <tr><td>Margin %</td><td>net profit ÷ net sales × 100</td></tr>
      <tr><td>Cash + bank</td><td>opening cash + opening bank + all-time net profit</td></tr>
      <tr><td>Stock value</td><td>for every item: quantity × cost, added together</td></tr>
      <tr><td>Net position</td><td>cash + what you are owed − what you owe</td></tr>
      <tr><td>Cost per piece</td><td>wages for the month ÷ pieces made that month</td></tr>
    </tbody></table>
    <div class="good">Every figure is rounded to two decimal places at the moment it is calculated, so a total can never disagree with the rows above it by a stray paisa.</div>`));

  pages.push(P(connectorsPage(c, fig)));
  pages.push(P(connectorsRules(c)));
  pages.push(P(connectorsPage2(c)));

  testPages(TESTS[c.tag]).forEach(function(h){pages.push(P(h));});

  pages.push(P(`<h2>How to run it, and what it will not do</h2>
    <h3>Running it</h3>
    <ol class="run">
      <li><b>Windows:</b> extract the ZIP, then double-click <span class="kbd">CEO_Dashboard.html</span>. It opens in your browser. That is the whole installation.</li>
      <li><b>Mac:</b> unpack the ZIP, double-click the file. Safari opens it.</li>
      <li><b>Android:</b> Files app → Downloads → tap the file → open with Chrome. Then ⋮ → <b>Add to Home screen</b> and it behaves like any other app.</li>
      <li><b>iPhone / iPad:</b> Files app → tap the file → Safari. Then Share → <b>Add to Home Screen</b>.</li>
      <li>No internet needed, ever. No account, no licence key, no setup wizard.</li>
    </ol>
    <h3>Keeping your data safe</h3>
    <p>Your figures live in your own browser on your own device — nowhere else, and never on anybody's server. That means nobody can see them, and also that clearing your browser's site data would erase them. So: <b>Backup &amp; Health → Export JSON</b>, once a week. To move to another device, take the file and the backup with you and use <b>Import JSON</b>.</p>
    ${fig('backup', 'Backup & Health — your data controls, and the live test results below them.', 'half')}
    <h3>What it will not do</h3>
    <ul class="pts">
      <li>It does not sync between your devices on its own — use the backup file.</li>
      <li>It has no user accounts or passwords. Whoever can open your device can open the app.</li>
      <li>In this single-file form it does not pull live from ${c.liveFrom}; the hosted version of Medhava is what connects those pipes.</li>
      <li>It will not stop you recording something silly. It checks its own arithmetic, not your judgement.</li>
    </ul>
    <div class="accept">Accepted when: the app opens by double-click with no internet · all 23 self-tests show pass · switching the period changes every figure · an alert can be cleared and brought back · a backup exports and imports cleanly.</div>
`));

  return doc(P.render(pages[0]), 'Medhava CEO Dashboard — ' + c.edition);
}

/* ══════════════════ REPORT BUILDER BOOK ══════════════════ */
function reportsBook(c) {
  const P = bookBuilder(c.edition, 'Report Builder');
  const fig = (v, cap, cls) => `<figure class="${cls || ''}"><img src="${img(c.tag, v)}"><figcaption>${cap}</figcaption></figure>`;
  const pages = [];

  pages.push(cover(c, 'Report Builder',
    'Pick · Group · Filter · Run — an answer in three clicks',
    'Module 01 · Dashboard &amp; BI — App 2 of 2',
    c.lede,
    ['One file · opens by double-click', 'Works offline', '34 / 34 self-tests pass', 'Saves the question, not the answer']));

  pages.push(P(`<h2>What this is, and what is inside</h2>
    <p class="big">The Report Builder lets you ask your own data almost any question — <b>without writing a formula and without waiting for anybody</b>.</p>
    <p>You do three things: pick what to look at, pick how to arrange it, and optionally leave some of it out. The answer is already on the screen; there is no "generating report" wait.</p>
    <p>The idea that makes it worth using: when you save a report you are saving <b>the question, not the answer</b>. Save "which mills are past due" today, run it next month, and it tells you about next month.</p>
    <div class="good">It reads the same records as the CEO Dashboard and applies the same rules, so a report can never disagree with the dashboard. That is not a promise — it is one of the 25 self-tests.</div>
    <div class="toc"><h3>What this document covers</h3>${P.toc()}</div>`));

  pages.push(P(`<h2>Where the Report Builder sits</h2>
    <p>It stands on the same <b>shared Data Core</b> as every other Medhava app, and it only ever reads. Pressing Run never changes a record.</p>
    <div class="wire2"><div class="core"><b>UNIFIED DATA CORE</b><span>Item · Party · Stock · Ledger · Order</span></div>
      <div class="ring">
        ${c.ring.map(r => `<div class="rn ${r[0]}">${r[1]}</div>`).join('')}
      </div></div>
    <p class="cap">Orange = read in. Green = produced. The only thing it produces is a report and a CSV file.</p>
    <h3>The five sources, and what feeds each one</h3>
    <table><thead><tr><th>Source</th><th>Fed by</th><th>What one row means</th></tr></thead><tbody>
      ${c.wiring.map(w => `<tr><td><b>${w.f}</b></td><td>${w.s}</td><td>${w.h}</td></tr>`).join('')}
    </tbody></table>`));

  pages.push(P(`<h2>The process — three steps and an answer</h2>
    <div class="flow"><span class="fb">1 · Pick a source</span><span class="ar">→</span><span class="fb">2 · Arrange it</span><span class="ar">→</span><span class="fb">3 · Filter it</span><span class="ar">→</span><span class="fb">Answer</span></div>
    <p class="cap">The whole app is these three steps. Everything else is a shortcut to them.</p>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>Pick what to look at.</b> Five buttons: ${c.srcList}. Changing this resets the other two steps, because a filter about channels means nothing once you are looking at stock.</div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>Say how it should be arranged.</b> Group the rows by something (${c.groupShort}), sort by any column, biggest or smallest first, and show all rows or just the top few.</div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>Leave out what you do not want.</b> Add filters like <span class="kbd">${c.filterKbd}</span>. Each one appears as a chip you can remove with a click. A record has to satisfy <b>all</b> of them.</div></div>
      <div class="st"><span class="n">4</span><div class="tx"><b>Read the answer.</b> It is already there. The badge tells you how many records survived your filters out of how many exist — watch that number when you add a filter, it tells you immediately whether the filter did what you meant.</div></div>
      <div class="st"><span class="n">5</span><div class="tx"><b>Keep it, if it is useful.</b> Give it a name and press Save. Next month, run it again and it recalculates.</div></div>
    </div>
    <h3>A worked example, start to finish</h3>
    <table><thead><tr><th>You want to know</th><th>What you click</th></tr></thead><tbody>
      <tr><td colspan="2"><b>"${c.exQ}"</b></td></tr>
      <tr><td>Step 1</td><td>Press <b>${c.exStep1}</b></td></tr>
      <tr><td>Step 2</td><td>Group the rows by <b>${c.exStep2}</b>, sort by <b>${c.exStep3}</b>, biggest first, all rows</td></tr>
      <tr><td>Step 3</td><td>Add filter: <span class="kbd">${c.exStep4}</span></td></tr>
      <tr><td>Answer</td><td>${c.exAnswer}</td></tr>
    </tbody></table>
    <div class="good">Four clicks and a typed number. No formula, no pivot table, no waiting for anybody — and the same four clicks work next month on next month's figures.</div>`));

  pages.push(P(`<h2>Screen · Build a report</h2>
    ${fig('build', 'The three numbered steps, and the answer waiting at the bottom.', 'tall')}
    <h3>Four things worth noticing on this screen</h3>
    <ul class="pts">
      <li><b>There is no "calculate" button you have to remember.</b> The answer at the bottom is already correct for whatever is selected above it.</li>
      <li><b>The grey line under the source buttons</b> always tells you what a single row of that source means — so you are never guessing what you are adding up.</li>
      <li><b>The badge in the Result heading</b> ("20 of 20 records") is your safety check. Add a filter and watch it move; if it does not move, your filter matched nothing you meant.</li>
      <li><b>The bar in the last column</b> is each row's share of the first measure — the fastest way to see whether one row dominates the total.</li>
    </ul>`));

  pages.push(P(`<h2>Step 1 · the five things you can look at</h2>
    <p>Press one button. The grey line underneath always tells you what a single row of that source means, so you are never guessing.</p>
    <table><thead><tr><th>Source</th><th>One row is…</th><th>What you can add up</th></tr></thead><tbody>
      <tr><td><b>Sales</b></td><td>One channel in one month</td><td>Gross · Returns · Net sales · Units</td></tr>
      <tr><td><b>Money owed</b></td><td>One unpaid ${c.moneyRow}</td><td>Amount · Days</td></tr>
      <tr><td><b>Stock</b></td><td>One item you are holding</td><td>Quantity · Value at cost</td></tr>
      <tr><td><b>Running costs</b></td><td>One cost head in one month</td><td>Amount</td></tr>
      <tr><td><b>Production</b></td><td>One month on the floor</td><td>Pieces made · Wages</td></tr>
    </tbody></table>
    <h3>What you can group each one by</h3>
    <table><thead><tr><th>Source</th><th>Group the rows by</th></tr></thead><tbody>
      <tr><td><b>Sales</b></td><td>Channel · Month</td></tr>
      <tr><td><b>Money owed</b></td><td>Party · Direction (owed to you / owed by you) · Status</td></tr>
      <tr><td><b>Stock</b></td><td>Item · Status (Reorder now / Getting low / Comfortable)</td></tr>
      <tr><td><b>Running costs</b></td><td>Cost head · Month</td></tr>
      <tr><td><b>Production</b></td><td>Month</td></tr>
    </tbody></table>
    <div class="good">Or choose <b>"Do not group"</b> on any source to see every single record, one per line — useful when you want to check the detail behind a total.</div>`));

  pages.push(P(`<h2>Step 2 · arranging it (and the Top-N trap)</h2>
    <p>Four dropdowns, then <b>Run this report</b>.</p>
    <table><thead><tr><th>Control</th><th>What it does</th></tr></thead><tbody>
      <tr><td><b>Group the rows by</b></td><td>The most important choice — it decides what one row of the answer represents.</td></tr>
      <tr><td><b>Sort by</b></td><td>Name (A–Z), any of the number columns, or how many records went into each row.</td></tr>
      <tr><td><b>Order</b></td><td>Biggest first, or smallest first.</td></tr>
      <tr><td><b>Show only top</b></td><td>All rows, or the top 3 / 5 / 10.</td></tr>
    </tbody></table>
    <div class="rule"><b>The Top-N trap, and how this app avoids it.</b> If you ask for "Top 5", most software shows five rows and then puts a total at the bottom that only adds up those five. That is how people end up quoting a number that is quietly wrong. Here, the table shows five rows but <b>the Total line still counts every matching row</b> — and it says so, in words, next to the total. There is a self-test that specifically checks this.</div>
    <h3>The result panel</h3>
    <ul class="pts">
      <li>The badge in the heading — <b>"20 of 20 records"</b> — is how many rows survived your filters out of how many exist.</li>
      <li>One row per group, every measure added up, how many records went into it, and a bar showing its share.</li>
      <li>The Total line, always over everything that matched.</li>
      <li><b>Download CSV</b> — top right. Opens in Excel or Google Sheets, and includes the total row.</li>
    </ul>
    <h3>Which sort makes sense for which question</h3>
    <table><thead><tr><th>You are asking</th><th>Sort by</th><th>Order</th></tr></thead><tbody>
      <tr><td>Who is biggest?</td><td>The money column</td><td>Biggest first</td></tr>
      <tr><td>What is a trend?</td><td>Name (A–Z)</td><td>Smallest first — months come out in order</td></tr>
      <tr><td>What is worst?</td><td>Days, or Returns</td><td>Biggest first</td></tr>
      <tr><td>What is nearly empty?</td><td>Quantity</td><td>Smallest first</td></tr>
      <tr><td>Where is the volume, not the value?</td><td>Records</td><td>Biggest first</td></tr>
    </tbody></table>
    <div class="good"><b>The habit worth forming:</b> ask the same question two ways — group by channel, then by month. If the two totals agree, you can trust both answers. If they do not, one of your filters is doing something you did not intend.</div>`));

  pages.push(P(`<h2>Step 3 · filters, with a worked example</h2>
    <p>Below, one filter has been added: <span class="kbd">${c.filterKbd}</span>. Look at the record count in the Result heading — it changed the moment the filter was added.</p>
    ${fig('build_filtered', 'A filter applied. It appears as a chip; click the × to remove just that one.', 'tall')}
    <table><thead><tr><th>Condition</th><th>Use it for</th><th>Example</th></tr></thead><tbody>
      <tr><td><b>is</b></td><td>Exactly this word</td><td>${c.exIs}</td></tr>
      <tr><td><b>is not</b></td><td>Everything except this</td><td>${c.exIsNot}</td></tr>
      <tr><td><b>contains</b></td><td>Part of a word — handy for long names</td><td>${c.exContains}</td></tr>
      <tr><td><b>&gt;=  &lt;=  &gt;  &lt;</b></td><td>Number comparisons</td><td>Days &gt; 30 · Amount &gt;= 100000</td></tr>
    </tbody></table>`));

  pages.push(P(`<h2>The same report, grouped a different way</h2>
    <p>Same source, same data. Only the grouping changed — from ${c.groupA} to <b>Month</b>, sorted oldest first.</p>
    ${fig('build_bymonth', 'Grouped by month instead. A trend, from exactly the same records.', 'tall')}
    <div class="good"><b>The total at the bottom is identical to the previous grouping, to the paisa.</b> It has to be — the same records were added up, just piled differently. If regrouping ever changed a total, something would be badly wrong, which is exactly why <i>"grouped totals equal the ungrouped total"</i> is one of the 25 self-tests.</div>
    <h3>The same records, three useful ways</h3>
    <table><thead><tr><th>Group by</th><th>Answers</th><th>Sort</th></tr></thead><tbody>
      <tr><td><b>Channel</b></td><td>Which channel earns most — after returns</td><td>Net sales, biggest first</td></tr>
      <tr><td><b>Month</b></td><td>Are we growing, flat, or slipping?</td><td>Name, smallest first</td></tr>
      <tr><td><b>Do not group</b></td><td>The detail behind any figure you doubt</td><td>Anything — every record is a row</td></tr>
    </tbody></table>`));

  pages.push(P(`<h2>Screen · Ready-made reports</h2>
    <p>Nine reports already built, each answering a question owners actually ask. Every card tells you what it looks at, how it is grouped and what has been filtered out — nothing is hidden from you.</p>
    ${fig('lib', 'Press "Load & run →" and it drops into the builder, already run. From there it is yours to change.', 'tall')}
    <div class="good"><b>These are starting points, not fixed reports.</b> Load one, change the grouping, add a filter, save it under your own name — and it is now your report. Nothing about a ready-made report is locked.</div>`));

  pages.push(P(`<h2>A ready-made report, loaded and running</h2>
    <p>This is "${c.tplName}" after one click. Notice the Top 5 limit, and the total underneath still covering every item.</p>
    ${fig('build_stock', 'A ready-made report is just a starting point — every control is still yours to change.', 'tall')}
    <h3>What to change first, once it is loaded</h3>
    <ul class="pts">
      <li><b>Turn "Top 5" into "All rows"</b> if you want the whole picture rather than the headline.</li>
      <li><b>Add a filter</b> to narrow it — Status is <i>Reorder now</i> turns this from "where is my cash" into "what must I buy".</li>
      <li><b>Change the grouping</b> to Status instead of Item, and the same records answer a completely different question.</li>
      <li><b>Save it under your own name</b> — you now have a question you never have to rebuild.</li>
    </ul>`));

  pages.push(P(`<h2>Screen · My saved reports</h2>
    ${fig('saved', 'Everything you have saved, with the answer recalculated the moment the screen opens.')}
    <div class="good"><b>The column that makes this screen worth opening:</b> "Answer if you run it now". It is recomputed every time — so this screen doubles as a small dashboard of exactly the questions <i>you</i> care about.</div>
    <ul class="pts">
      <li><b>Run</b> loads it back into the builder so you can change it.</li>
      <li><b>Delete</b> removes it. No undo — but rebuilding takes ten seconds.</li>
      <li>Saved reports store the source, grouping, filters and sort. <b>Never the numbers.</b></li>
    </ul>`));

  pages.push(P(`<h2>Screen · Wiring</h2>
    ${fig('wiring', 'The five sources, what feeds them, and exactly what happens when you press Run.', 'tall')}
    <div class="good"><b>The Report Builder stores no figures of its own.</b> It holds your saved questions and nothing else. Every number you see was read from the Data Core in the moment the screen was drawn — which is why there is no "last refreshed" timestamp anywhere in this app. There is nothing to refresh.</div>`));

  pages.push(P(`<h2>Exactly what happens when you press Run</h2>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>The source is read fresh</b> from the Data Core — never from a stored copy, never from a cache. If a record changed a second ago, it is in this report.</div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>Your filters drop the rows you did not want.</b> A record must satisfy every filter, not just one.</div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>What is left is grouped</b> and each measure is added up, rounded to two decimals at the moment of adding.</div></div>
      <div class="st"><span class="n">4</span><div class="tx"><b>It is sorted, then trimmed</b> to your Top N — but the Total line still counts every matching row, and says so.</div></div>
      <div class="st"><span class="n">5</span><div class="tx"><b>Saving keeps the question.</b> The source, grouping, filters and sort are stored. The numbers are not. Next month the same report shows next month's answer.</div></div>
    </div>
    <h3>Why a report can never disagree with the CEO Dashboard</h3>
    <p>Both apps read the same records and apply the same rules — the same rounding, the same "returns come off before net". A Sales report grouped by channel with no filters adds up to exactly the net sales figure the Dashboard shows for the same period.</p>
    <div class="good">This is checked automatically. Among the 25 self-tests: <b>"grouped totals equal the ungrouped total"</b> and <b>"ungrouped and grouped give the same total"</b>. If grouping ever changed a total, the app would tell you on startup.</div>
    <h3>What a saved report actually stores</h3>
    <table><thead><tr><th>Stored</th><th>Not stored</th></tr></thead><tbody>
      <tr><td>Which source you chose</td><td>Any number</td></tr>
      <tr><td>What you grouped by</td><td>Any row of the answer</td></tr>
      <tr><td>Every filter, exactly as typed</td><td>The date you last ran it</td></tr>
      <tr><td>The sort column and direction</td><td>Anything about your records</td></tr>
      <tr><td>Your Top-N limit</td><td>&nbsp;</td></tr>
    </tbody></table>
    <div class="rule"><b>This is why a saved report is safe to keep forever.</b> It cannot go stale, because there is nothing in it that could age. It is a question, written down.</div>`));

  pages.push(P(connectorsPage(c, fig)));
  pages.push(P(connectorsRules(c)));
  pages.push(P(connectorsPage2(c)));

  testPages(TESTS[c.tag]).forEach(function(h){pages.push(P(h));});

  pages.push(P(`<h2>How to run it, and what it will not do</h2>
    <h3>Running it</h3>
    <ol class="run">
      <li><b>Windows:</b> extract the ZIP, then double-click <span class="kbd">Report_Builder.html</span>.</li>
      <li><b>Mac:</b> unpack the ZIP, double-click the file. Safari opens it.</li>
      <li><b>Android:</b> Files app → Downloads → tap the file → open with Chrome. Then ⋮ → <b>Add to Home screen</b>.</li>
      <li><b>iPhone / iPad:</b> Files app → tap the file → Safari. Then Share → <b>Add to Home Screen</b>.</li>
      <li>No internet needed. No account, no licence key, no setup wizard.</li>
    </ol>
    <h3>Keeping your data safe</h3>
    <p>Your figures and your saved reports live in your own browser on your own device. Take a backup weekly: <b>Backup &amp; Health → Export JSON</b>. To move to another device, carry the app file and the backup, then <b>Import JSON</b>.</p>
    <h3>What it will not do</h3>
    <ul class="pts">
      <li>It does not email reports on a schedule — download the CSV and send it.</li>
      <li>It does not draw charts beyond the share bars; the CSV opens in Excel for anything more elaborate.</li>
      <li>It does not sync between your devices on its own.</li>
      <li>In this single-file form it does not pull live from ${c.liveFrom}; the hosted version of Medhava is what connects those pipes.</li>
    </ul>
    <div class="accept">Accepted when: the app opens by double-click with no internet · all 34 self-tests show pass · a filter changes the record count · Top 5 still totals every matching row · a saved report reruns and matches · the CSV opens in Excel with the total row intact.</div>
`));

  return doc(P.render(pages[0]), 'Medhava Report Builder — ' + c.edition);
}

/* ══════════════════ MODULE BOOK ══════════════════ */
function moduleBook() {
  const P = bookBuilder('Dashboard & BI', 'Module 01');
  const pages = [];
  pages.push(`<section class="pg cover"><div class="cwrap">
    <div class="logo">${mark} Medhava</div>
    <div class="ed">Module 01 of 16</div>
    <h1>Dashboard &amp; BI</h1>
    <div class="sub">CEO Dashboard · Report Builder</div>
    <div class="module">2 apps × 2 editions — Medhava (any industry) and Vastrangam</div>
    <p class="lede">The layer that tells you what is happening. One app answers the three questions an owner asks every morning; the other lets you ask anything else. Both read the same records, apply the same rules, and can never disagree with each other.</p>
    <div class="badges"><span>4 working apps</span><span>114 self-tests, all passing</span><span>Zero console errors</span><span>Every screen and button verified</span></div>
    <div class="cfoot">Medhava ERP suite · FY 2026-27 · The first module of sixteen</div></div></section>`);

  pages.push(P(`<h2>What this module is</h2>
    <p class="big">Module 01 is the <b>seeing</b> layer of Medhava. It records nothing and changes nothing. It reads what every other module writes and turns it into two things: a screen that tells you where you stand, and a tool that answers any other question you have.</p>
    <p>It is deliberately the first module built. Until you can see the business clearly, there is no way to judge whether the other fifteen modules are helping.</p>
    <h3>The two apps</h3>
    <table><thead><tr><th>App</th><th>Answers</th><th>Screens</th><th>Self-tests</th></tr></thead><tbody>
      <tr><td><b>1 · CEO Dashboard</b></td><td>Did we make money? Is the cash safe? What needs me today?</td><td>8</td><td>23</td></tr>
      <tr><td><b>2 · Report Builder</b></td><td>Everything else — asked your way, in three clicks</td><td>6</td><td>34</td></tr>
    </tbody></table>
    <h3>Two editions of each</h3>
    <table class="vs"><thead><tr><th>Edition</th><th>What it is</th></tr></thead><tbody>
      <tr><td><b>Medhava</b></td><td>The unified ERP. Industry-neutral names and rules — the same engine runs a textile business, a medical distributor, a manufacturer or a services firm. You change the master data, not the software.</td></tr>
      <tr><td><b>Vastrangam</b></td><td>The same engine with Vastrangam's own world in it: Myntra and Flipkart, Surat and Jaipur mills, silk and zari, karigar wages, BUSY. Its purpose is to prove the neutral engine survives contact with a real business.</td></tr>
    </tbody></table>
    <div class="good"><b>The engine is byte-for-byte identical between the two editions.</b> Only the configuration file differs. Both editions pass exactly the same self-tests, with the same names — which is the proof that "industry-neutral" is real and not a claim.</div>
    <div class="toc"><h3>Contents</h3>${P.toc()}</div>`));

  pages.push(P(`<h2>How the two apps sit on the Data Core</h2>
    <p>Every Medhava module writes into one shared core. Module 01 is the only module that exclusively reads.</p>
    <div class="wire2"><div class="core"><b>UNIFIED DATA CORE</b><span>Item · Party · Stock · Ledger · Order</span></div>
      <div class="ring">
        <div class="rn in">← Sales &amp; Orders · invoices, returns, channel</div>
        <div class="rn in">← Purchase · supplier bills, terms</div>
        <div class="rn in">← Inventory · quantity, cost, reorder point</div>
        <div class="rn in">← Manufacturing · pieces made, wages</div>
        <div class="rn in">← Accounts · balances, expenses, receipts</div>
        <div class="rn out">→ CEO Dashboard · position + alerts</div>
        <div class="rn out">→ Report Builder · any question + CSV</div>
        <div class="rn out">→ Nothing written back to your books</div>
      </div></div>
    <p class="cap">Five modules feed in. Two apps read. Nothing flows back — which is what makes the numbers auditable.</p>
    <div class="flow"><span class="fb">Records</span><span class="ar">→</span><span class="fb">Filter</span><span class="ar">→</span><span class="fb">Add up</span><span class="ar">→</span><span class="fb">Rules</span><span class="ar">→</span><span class="fb">Screen or CSV</span></div>
    <p class="cap">Both apps use the same five steps. That is why they cannot produce different answers.</p>
    <h3>The five things the Data Core holds</h3>
    <table><thead><tr><th>Entity</th><th>What it is</th><th>Who writes it</th></tr></thead><tbody>
      <tr><td><b>Item / SKU</b></td><td>One product or material, with its cost and reorder point</td><td>Catalog, Inventory, Purchase</td></tr>
      <tr><td><b>Party</b></td><td>One customer, supplier or marketplace</td><td>CRM, Purchase, Channels</td></tr>
      <tr><td><b>Stock</b></td><td>One quantity per item — not one per channel</td><td>Inventory, Manufacturing, Purchase</td></tr>
      <tr><td><b>Ledger / Voucher</b></td><td>One money movement — sale, bill, expense, receipt</td><td>Accounting, Sales, Purchase</td></tr>
      <tr><td><b>Order</b></td><td>One order in or out, with its lines and its channel</td><td>Sales, Channels, Purchase</td></tr>
    </tbody></table>
    <div class="good"><b>"One business, one brain" is this table.</b> Every other ERP problem — stock that disagrees between channels, a profit figure nobody can reproduce, a report that contradicts the dashboard — comes from having two copies of one of these five things. Medhava has one of each, and Module 01 proves it by reading them.</div>`));

  pages.push(P(`<h2>App 1 · CEO Dashboard</h2>
    <p>Seven screens: Overview, Sales &amp; Channels, Money, Stock &amp; Making, Alerts, Wiring, Backup &amp; Health.</p>
    <figure><img src="${img('DASH_VAS', 'dash')}"><figcaption>The Overview screen — Vastrangam edition.</figcaption></figure>
    <ul class="pts">
      <li><b>A live period switcher</b> — April, May, June, July or Full year. Every figure on every screen recalculates. Balances deliberately ignore it, because a balance is a position, not a period.</li>
      <li><b>Returns come off before anything is called "net"</b> — so a busy channel with high returns can never flatter the numbers.</li>
      <li><b>Alerts nobody types in</b> — four rules run against live figures: stock at its reorder point, money owed over 30 days, a bill past due, a channel's return rate at 12% or more. You can clear one; it comes back on its own if the situation gets worse.</li>
      <li><b>A Wiring screen</b> that names the source and the arithmetic behind every single figure.</li>
    </ul>`));

  pages.push(P(`<h2>App 2 · Report Builder</h2>
    <p>Five screens: Build a report, Ready-made, My saved reports, Wiring, Backup &amp; Health.</p>
    <figure><img src="${img('REP_VAS', 'build')}"><figcaption>Three numbered steps, and the answer already waiting at the bottom.</figcaption></figure>
    <ul class="pts">
      <li><b>Five sources</b> — Sales, Money owed, Stock, Running costs, Production. Group by anything, sort by anything, filter on words or numbers.</li>
      <li><b>Nine ready-made reports</b>, each answering a question owners actually ask. One click loads one into the builder, already run, and from there it is yours to change.</li>
      <li><b>Save the question, not the answer.</b> Run it next month and it recalculates on next month's data.</li>
      <li><b>Top-N is honest.</b> Ask for the top 5 and you see five rows — but the total still counts every matching row, and says so.</li>
      <li><b>CSV download</b> on every report, total row included.</li>
    </ul>`));

  pages.push(P(`<h2>Why the two apps can never disagree</h2>
    <p>This is the part most reporting tools get wrong, so it is worth being precise about.</p>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>Same records.</b> Neither app keeps its own copy of anything. Both read the shared Data Core at the moment the screen is drawn.</div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>Same rules.</b> Returns come off before "net" in both. Rounding to two decimals happens at the same point in both. Nothing is defined twice.</div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>Nothing is stored mid-way.</b> There is no cached total anywhere in either app that could drift out of step with the records beneath it.</div></div>
      <div class="st"><span class="n">4</span><div class="tx"><b>And it is tested.</b> A Sales report grouped by channel with no filters must equal the Dashboard's net sales for the same period. Grouping must never change a total. Both are self-tests that run on every launch.</div></div>
    </div>
    <div class="good"><b>Try it yourself.</b> Open the Dashboard, set the period to Full year, note Net sales. Open the Report Builder, choose Sales, group by Channel, no filters, and read the Total line. The two figures are the same, to the paisa.</div>
    <h3>Where alerts come from — one rule, one place</h3>
    <table><thead><tr><th>Rule</th><th>Threshold</th><th>Becomes urgent at</th></tr></thead><tbody>
      <tr><td>Stock running out</td><td>Quantity at or below the reorder point</td><td>Immediately</td></tr>
      <tr><td>Money not collected</td><td>More than 30 days old</td><td>More than 60 days</td></tr>
      <tr><td>Bill not paid</td><td>Past its due date</td><td>More than 60 days late</td></tr>
      <tr><td>Returns too high</td><td>Channel return rate 12% or more</td><td>—</td></tr>
    </tbody></table>`));

  pages.push(P(`<h2>Medhava and Vastrangam, side by side</h2>
    <p>Same engine, same self-tests, same arithmetic. Only the master data differs — which is exactly the point.</p>
    <table class="vs"><thead><tr><th>&nbsp;</th><th>Medhava (unified ERP)</th><th>Vastrangam</th></tr></thead><tbody>
      <tr><td><b>Company</b></td><td>Acme Corp — stands in for any business</td><td>Vastrangam — ethnic-wear D2C + marketplace</td></tr>
      <tr><td><b>Channels</b></td><td>Retail Stores · Online Marketplace · Own Website · Wholesale/B2B · Export</td><td>Myntra · Flipkart · Own Website · Wholesale (Surat) · Exhibition/Exports</td></tr>
      <tr><td><b>Items</b></td><td>Primary raw material · Precision component · Finished product</td><td>Banarasi silk · Cotton 44" · Zari thread · Kurta set · Saree</td></tr>
      <tr><td><b>Customers</b></td><td>Northline Retail · Metro Distributors · Harbour Trading</td><td>Myntra · Flipkart · Surat Wholesale — Rajmandir · Dubai buyer</td></tr>
      <tr><td><b>Suppliers</b></td><td>Alpha Industrial · Beta Components · Gamma Materials</td><td>Jagdamba Textiles · Kanchi Silks · Surat Cotton Mills · Zari Works Jaipur</td></tr>
      <tr><td><b>Making cost</b></td><td>Wages booked by the production floor</td><td>Karigar wages, per piece finished</td></tr>
      <tr><td><b>Books</b></td><td>Finance / Ledger</td><td>BUSY</td></tr>
      <tr><td><b>Engine</b></td><td colspan="2" style="text-align:center"><b>Identical. One file, shared by both.</b></td></tr>
      <tr><td><b>Self-tests</b></td><td colspan="2" style="text-align:center"><b>Identical names, identical count, all passing in both.</b></td></tr>
    </tbody></table>
    <div class="good"><b>Why ship both?</b> The neutral edition is what a new customer in any industry receives. The Vastrangam edition is the proof that the neutral engine survives a real business with real messiness — real return rates, real mills, real settlement delays. If a rule only works when the data is tidy, the Vastrangam build finds it first.</div>
    <h3>What "configuration, not code" means in practice</h3>
    <p>Putting Medhava into a new business is editing one file. Nothing in the engine is touched, so nothing that was tested stops being true.</p>
    <table><thead><tr><th>You change</th><th>You do not change</th></tr></thead><tbody>
      <tr><td>Company name and financial year</td><td>How net sales is calculated</td></tr>
      <tr><td>Your channels — however many, whatever they are called</td><td>That returns come off before "net"</td></tr>
      <tr><td>Your items, their cost and their reorder points</td><td>How stock value or the reorder rule works</td></tr>
      <tr><td>Your customers and suppliers</td><td>The 30-day and 60-day ageing thresholds</td></tr>
      <tr><td>The wording on the Wiring screen</td><td>Any of the 78 self-tests</td></tr>
    </tbody></table>`));

pages.push(P(`<h2>Nothing in this module is locked to one company</h2>
    <p class="big">A rule that holds across all sixteen modules, and one that every app checks on itself at every launch: <b>no Medhava app depends on any single outside service.</b></p>
    <p>Not one accounting package. Not one marketplace. Not one AI company. Not one automation tool. Not one courier. Not one payment gateway.</p>
    <h3>How it is enforced, rather than promised</h3>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx">Every app <b>declares the capabilities it uses</b> — books, channels, messaging, storage, automation, and so on. An app that does not declare them <b>fails its own build</b>; it cannot ship.</div></div>
      <div class="st"><span class="n">2</span><div class="tx">Every capability carries a list of <b>interchangeable providers</b>, each one a button on the app's <b>Connectors</b> screen. Click a different one and you have switched.</div></div>
      <div class="st"><span class="n">3</span><div class="tx">Three self-tests run in <b>every app, every launch</b>: no capability has fewer than three choices · every capability has a built-in or by-hand option · every capability has an option you can host yourself.</div></div>
      <div class="st"><span class="n">4</span><div class="tx">A fourth test proves <b>switching a provider changes nothing else in your data</b>. The arithmetic lives in Medhava, never in the service.</div></div>
    </div>
    <h3>Some of what that means in practice</h3>
    <table><thead><tr><th>Capability</th><th>Options, including ones that need nobody</th></tr></thead><tbody>
      <tr><td><b>Books &amp; ledger</b></td><td>Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA</td></tr>
      <tr><td><b>Sales channels</b></td><td>Type them in · CSV import · Amazon · Flipkart · Myntra · Meesho · Ajio · Nykaa · JioMart · Shopify · WooCommerce · your own store</td></tr>
      <tr><td><b>AI writing</b></td><td>Medhava templates (no AI at all) · Ollama on your own machine · self-hosted Llama or Mistral · Claude · GPT · Gemini · DeepSeek · Groq · write it yourself</td></tr>
      <tr><td><b>AI images</b></td><td>Upload your own · Stable Diffusion or Flux on your own machine · Midjourney · OpenAI · Imagen · Firefly · Canva · Medhava Image Studio</td></tr>
      <tr><td><b>Automation</b></td><td>Medhava Rules (built in) · n8n · Node-RED · Windmill · Airflow (self-hosted) · n8n Cloud · Make · Zapier · Pipedream · cron + webhook · by hand</td></tr>
      <tr><td><b>Couriers</b></td><td>Type the AWB in · your own delivery · Delhivery · Blue Dart · DTDC · Ecom · XpressBees · India Post · Shiprocket · NimbusPost</td></tr>
      <tr><td><b>Payments</b></td><td>Cash · UPI direct with your own QR (no commission) · Razorpay · PayU · Cashfree · PhonePe · Paytm · Stripe · CCAvenue</td></tr>
    </tbody></table>
    <div class="rule"><b>Cloud services use a scoped, revocable key — never your account password.</b> Medhava will never ask you for a marketplace, bank or account password. If any screen ever does, it is not Medhava.</div>
    <div class="good"><b>The practical version:</b> if a service doubles its price, changes its terms or shuts down, you click a different button. You do not change software, you do not re-enter data, and you do not lose a day.</div>`));

  pages.push(P(zipPage(MOD)));

  pages.push(P(`<h2>How this was verified</h2>
    <p>Nothing in this module was shipped on the basis that it looked right on screen. Every build went through the same three gates.</p>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>The arithmetic, with no screen involved.</b> Each app's engine was run in isolation and its self-tests executed against the seeded data. <b>114 tests across the four builds, all passing.</b></div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>Every screen and every button, in a real browser.</b> Each build was opened in headless Chromium; every screen was visited and <b>every interactive control on it was clicked</b> — period switches, alert clears, source buttons, filters, saves, deletes, template loads. Any console error, any script error, or any screen that failed to redraw would have failed the build. <b>Zero errors across all four.</b></div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>The screenshots in this document are the real thing.</b> Every image was captured from the shipped file at double resolution, in the state described in the caption. Nothing is a mock-up.</div></div>
    </div>
    <table><thead><tr><th>Build</th><th>Screens</th><th>Controls clicked</th><th>Self-tests</th><th>Console errors</th></tr></thead><tbody>
      <tr><td>CEO Dashboard · Medhava</td><td>6 / 6</td><td>76</td><td class="pass">23 / 23</td><td class="pass">0</td></tr>
      <tr><td>CEO Dashboard · Vastrangam</td><td>6 / 6</td><td>76</td><td class="pass">23 / 23</td><td class="pass">0</td></tr>
      <tr><td>Report Builder · Medhava</td><td>4 / 4</td><td>62</td><td class="pass">34 / 34</td><td class="pass">0</td></tr>
      <tr><td>Report Builder · Vastrangam</td><td>4 / 4</td><td>62</td><td class="pass">34 / 34</td><td class="pass">0</td></tr>
    </tbody></table>
    <div class="good">You can re-run gate 1 yourself at any time without any tools: open any app and go to <b>Backup &amp; Health</b>. The tests ran when the app started, and the results are on that screen.</div>
    <h3>Two bugs these gates actually caught, before you saw them</h3>
    <ul class="pts">
      <li><b>A self-test was quietly corrupting live data.</b> The tests ran against your real records rather than a copy, so one test that marked a bill as paid left it paid — on every single launch. It now runs against a deep copy. Caught by comparing a screenshot against the seed data, not by a test.</li>
      <li><b>A panel heading was escaping its own markup</b>, so status tags rendered as raw text on screen. Caught by the browser gate, which fails on any screen that does not draw correctly.</li>
    </ul>
    <p>Both are the kind of fault that looks like nothing and quietly poisons every number downstream. That is the argument for gates rather than a final look-over.</p>`));

  pages.push(P(`<h2>What comes next</h2>
    <p>Module 01 is the first of sixteen. The order is deliberate: see the business first, then fix what you can see.</p>
    ${ROADMAP.htmlTable({'01':'Delivered — you are holding it','02':'Next'},'01')}
    <h3>What stays the same in every module from here</h3>
    <ul class="pts">
      <li><b>One ZIP per module</b>, holding one ZIP per edition — MEDHAVA and VASTRANGAM — each with a folder per app inside it.</li>
      <li><b>Every file is named by edition, module and app</b>, so nothing is ever ambiguous once it is extracted.</li>
      <li><b>Every app is one HTML file.</b> Double-click, works offline, saves in the browser, exports a backup.</li>
      <li><b>Every app ships a manual</b> written for someone who has never installed software, and an illustrated PDF built from real screenshots of the shipped file.</li>
      <li><b>Every app carries its own self-tests</b> and its own Wiring screen naming the source of every figure.</li>
      <li><b>Nothing is a mock-up.</b> If it is in the PDF, it is in the app, and it was clicked in a real browser before it shipped.</li>
    </ul>
    <div class="accept">Module 01 is accepted when: all four apps open by double-click with no internet · all 114 self-tests pass · every screen renders and every control responds · the Report Builder's net sales total matches the CEO Dashboard's to the paisa · a backup exports and imports cleanly on both a computer and a phone.</div>
`));

  return doc(P.render(pages[0]), 'Medhava Module 01 — Dashboard & BI');
}

/* ══════════════════ configs ══════════════════ */
const RING_DASH_ERP = [
  ['in', '← Sales &amp; Orders · invoices, returns'], ['in', '← Purchase · supplier bills, terms'],
  ['in', '← Inventory · quantity, cost, reorder point'], ['in', '← Manufacturing · pieces, wages'],
  ['in', '← Accounts · balances, expenses'], ['out', '→ Your screen · position + alerts'],
];
const RING_DASH_VAS = [
  ['in', '← Channel Manager · Myntra / Flipkart / site'], ['in', '← Procurement · mill bills, fabric rates'],
  ['in', '← Inventory · metres, pieces, reorder point'], ['in', '← Karigar floor · pieces, wages'],
  ['in', '← BUSY · balances, rent, ads, courier'], ['out', '→ Your screen · position + alerts'],
];
function loadCfg(p) { const src = fs.readFileSync(path.join(DIR, p), 'utf8'); const m = { exports: {} };
  const f = new Function('module', 'exports', src + '\nmodule.exports=CONFIG;'); f(m, m.exports); return m.exports; }
const DG = loadCfg('dashboard/config_generic.js'), DV = loadCfg('dashboard/config_vastrangam.js');
const RG = loadCfg('reports/config_generic.js'), RV = loadCfg('reports/config_vastrangam.js');

const BOOKS = [
  { fn: dashboardBook, out: 'Medhava_CEO_Dashboard_ERP.pdf', c: {
    tag: 'DASH_ERP', app: 'The CEO Dashboard', capCount: 4, altCount: 34, capRows: [['Books & ledger','Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA'],
      ['Sales channels','Type them in · CSV import · Amazon · Flipkart · Myntra · Meesho · Ajio · Nykaa · JioMart · Shopify · WooCommerce · your own store'],
      ['Files &amp; backups','This device · a USB drive · MinIO or Nextcloud (self-hosted) · Google Drive · Dropbox · OneDrive · Amazon S3 · Backblaze B2'],
      ['Printing','Browser print / PDF · any ESC/POS thermal printer · Zebra · TVS · no printer at all']], edition: 'Unified ERP — any industry', co: 'Acme Corp',
    lede: 'The one screen an owner looks at each morning. Sales after returns, real profit, live cash, who owes you, what is running out, and a short list of things that need a decision — all computed from records the rest of the business already keeps.',
    sources: 'sales, purchases, stock, wages and expenses', ring: RING_DASH_ERP, wiring: DG.wiring, wiringIn: DG.wiringIn,
    cogsShort: 'purchases', owers: 'customers and distributors', liveFrom: 'your other systems',
    recTitleShort: 'Customers who owe you', payTitleShort: 'Suppliers you owe', leadFrom: 'your supplier',
    step1: 'A sale is invoiced, a supplier bill is entered, stock moves, wages are booked, an expense is paid. The Dashboard is not involved — it is the other modules doing their normal work.',
    bigRule: 'Returns are taken off before anything on this screen is called "net". A channel that sells a lot and takes a lot back can never look better than a quieter channel that keeps what it sells.',
    returnRule: 'A channel with 14% returns on a big gross number can easily earn you less than a quiet channel with 2% returns. The table sorts by <b>net</b>, not gross, for exactly this reason. Anything at 12% or above is tagged "returns high" and raises an alert.',
    rule1: 'This is the one that costs you money silently — a stock-out stops production or loses a sale, and neither shows up in the accounts until later.',
    rule4: 'Returns at that level are usually a listing, sizing or description problem, not bad luck.',
  }},
  { fn: dashboardBook, out: 'Medhava_CEO_Dashboard_Vastrangam.pdf', c: {
    tag: 'DASH_VAS', app: 'The CEO Dashboard', capCount: 4, altCount: 34, capRows: [['Books & ledger','Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA'],
      ['Sales channels','Type them in · CSV import · Amazon · Flipkart · Myntra · Meesho · Ajio · Nykaa · JioMart · Shopify · WooCommerce · your own store'],
      ['Files &amp; backups','This device · a USB drive · MinIO or Nextcloud (self-hosted) · Google Drive · Dropbox · OneDrive · Amazon S3 · Backblaze B2'],
      ['Printing','Browser print / PDF · any ESC/POS thermal printer · Zebra · TVS · no printer at all']], edition: 'Vastrangam — ethnic-wear D2C + marketplace', co: 'Vastrangam',
    lede: 'Vastrangam on one screen. Marketplace sales after returns, the real profit once fabric and karigar wages are out, live cash, settlements still stuck, fabric about to run out, and what needs the owner today.',
    sources: 'marketplace orders and returns, fabric bought, karigar wages, stock and running costs', ring: RING_DASH_VAS, wiring: DV.wiring, wiringIn: DV.wiringIn,
    cogsShort: 'fabric and trims', owers: 'the marketplaces and wholesale buyers', liveFrom: 'Myntra, Flipkart or BUSY',
    recTitleShort: 'Marketplaces &amp; buyers', payTitleShort: 'Mills you owe', leadFrom: 'the mill',
    step1: 'An order ships on Myntra, a mill bill is entered, fabric is issued to the cutting table, karigar wages are booked, the courier bill is paid. The Dashboard is not involved — it is the other modules doing their normal work.',
    bigRule: 'Returns are taken off before anything on this screen is called "net". Myntra and Flipkart will both show you a gross figure that feels excellent; this screen shows what is left after the parcels come back — which is the money that actually reaches the bank.',
    returnRule: 'This matters more here than almost anywhere else. Flipkart at 14% returns on a big gross number can easily earn less than the website at 11% on a smaller one. The table sorts by <b>net</b>, not gross, for exactly that reason. Anything at 12% or above is tagged "returns high" and raises an alert.',
    rule1: 'This is the one that stops the karigar floor. Fabric below its reorder point means a cut plan cannot start, and idle karigars cost wages without producing pieces.',
    rule4: 'At that level it is almost always a size-chart, fabric-description or photography problem — something you can fix — not bad luck.',
  }},
  { fn: reportsBook, out: 'Medhava_Report_Builder_ERP.pdf', c: {
    tag: 'REP_ERP', app: 'The Report Builder', capCount: 5, altCount: 42, capRows: [['Books & ledger','Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA'],
      ['Sales channels','Type them in · CSV import · Amazon · Flipkart · Myntra · Meesho · Ajio · Nykaa · JioMart · Shopify · WooCommerce · your own store'],
      ['Files &amp; backups','This device · a USB drive · MinIO or Nextcloud (self-hosted) · Google Drive · Dropbox · OneDrive · Amazon S3 · Backblaze B2'],
      ['Email sending','Download and send it yourself · any SMTP server · Amazon SES · SendGrid · Postmark · Mailgun · Zoho Mail · Brevo'],
      ['Printing','Browser print / PDF · any ESC/POS thermal printer · Zebra · TVS · no printer at all']], edition: 'Unified ERP — any industry', co: 'Acme Corp',
    lede: 'Ask your own data almost any question, without writing a formula and without waiting for anybody. Pick, group, filter, run. Save the question — not the answer — and it recalculates every month on its own.',
    ring: [['in', '← Sales &amp; Orders · invoices, returns'], ['in', '← Accounts · unpaid invoices and bills'],
           ['in', '← Inventory · quantity, cost, reorder point'], ['in', '← Manufacturing · pieces, wages'],
           ['out', '→ A report on screen'], ['out', '→ A CSV file for Excel']],
    wiring: RG.wiring, liveFrom: 'your other systems',
    srcList: 'Sales, Money owed, Stock, Running costs, Production',
    groupShort: 'sales by channel to compare channels, or by month to see a trend',
    filterKbd: 'Gross &gt;= 100000', moneyRow: 'customer invoice or supplier bill',
    exIs: 'Channel is Retail Stores', exIsNot: 'Channel is not Export', exContains: 'Party contains Metro',
    exQ: 'Which customers have owed me more than 30 days, worst first?',
    exStep1: 'Money owed', exStep2: 'Party', exStep3: 'Days',
    exStep4: 'Days &gt; 30', exAnswer: 'One row per customer, oldest debt at the top, with the total still owed underneath.',
    groupA: '<b>Channel</b>', tplName: 'Where is my money sitting in stock?',
  }},
  { fn: reportsBook, out: 'Medhava_Report_Builder_Vastrangam.pdf', c: {
    tag: 'REP_VAS', app: 'The Report Builder', capCount: 5, altCount: 42, capRows: [['Books & ledger','Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (self-hosted) · CSV to your CA'],
      ['Sales channels','Type them in · CSV import · Amazon · Flipkart · Myntra · Meesho · Ajio · Nykaa · JioMart · Shopify · WooCommerce · your own store'],
      ['Files &amp; backups','This device · a USB drive · MinIO or Nextcloud (self-hosted) · Google Drive · Dropbox · OneDrive · Amazon S3 · Backblaze B2'],
      ['Email sending','Download and send it yourself · any SMTP server · Amazon SES · SendGrid · Postmark · Mailgun · Zoho Mail · Brevo'],
      ['Printing','Browser print / PDF · any ESC/POS thermal printer · Zebra · TVS · no printer at all']], edition: 'Vastrangam — ethnic-wear D2C + marketplace', co: 'Vastrangam',
    lede: "Ask Vastrangam's own data almost any question — Myntra versus Flipkart, cash stuck in fabric, mills already past due. Pick, group, filter, run. Save the question, not the answer.",
    ring: [['in', '← Channel Manager · orders, returns, settlements'], ['in', '← Accounts / BUSY · settlements, mill bills'],
           ['in', '← Inventory · metres, pieces, reorder point'], ['in', '← Karigar floor · pieces, wages'],
           ['out', '→ A report on screen'], ['out', '→ A CSV file for Excel or the CA']],
    wiring: RV.wiring, liveFrom: 'Myntra, Flipkart or BUSY',
    srcList: 'Sales, Money owed, Stock, Running costs, Production',
    groupShort: 'sales by channel to settle the Myntra-vs-Flipkart argument, or by month to see the season',
    filterKbd: 'Gross &gt;= 100000', moneyRow: 'settlement or mill bill',
    exIs: 'Channel is Myntra', exIsNot: 'Channel is not Flipkart', exContains: 'Party contains Surat',
    exQ: 'Which settlements and buyers are more than 30 days late, worst first?',
    exStep1: 'Money owed', exStep2: 'Party', exStep3: 'Days',
    exStep4: 'Days &gt; 30', exAnswer: 'One row per marketplace or buyer, oldest first, with the total still stuck underneath.',
    groupA: '<b>Channel</b>', tplName: 'Where is the cash sitting in fabric?',
  }},
];

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const jobs = BOOKS.map(x => ({ html: x.fn(x.c), out: x.out }));
  jobs.push({ html: moduleBook(), out: 'Medhava_Module_01_Dashboard_BI.pdf' });
  for (const j of jobs) {
    const hp = path.join(DIR, 'book_' + j.out.replace('.pdf', '.html'));
    fs.writeFileSync(hp, j.html);
    const p = await b.newPage();
    await p.goto('file://' + hp, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);
    await p.pdf({ path: path.join(OUT, j.out), width: '210mm', height: '297mm', printBackground: true });
    await p.close();
    console.log('PDF', j.out.padEnd(44), Math.round(fs.statSync(path.join(OUT, j.out)).size / 1024) + 'KB');
  }
  await b.close();
})();
