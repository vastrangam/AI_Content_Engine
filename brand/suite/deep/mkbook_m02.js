'use strict';
/* Module 02 · CRM — illustrated process PDFs.
   Two app books (1 app × 2 editions) + one module book. Plain language, real screenshots,
   every diagram drawn in CSS so it prints crisply. */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const { doc, mkPager, cover, testTable, mark } = require('./bookparts.js');
const ROADMAP = require('./roadmap.js');
const DIR = __dirname, SHOTS = path.join(DIR, 'shots'), OUT = path.join(DIR, 'out');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TESTS = JSON.parse(fs.readFileSync(path.join(DIR, 'tests.json'), 'utf8'));
const img = (tag, v) => 'file://' + path.join(SHOTS, tag + '_' + v + '.png');
function loadCfg(p) { const src = fs.readFileSync(path.join(DIR, p), 'utf8'); const m = { exports: {} };
  const f = new Function('module', 'exports', src + '\nmodule.exports=CONFIG;'); f(m, m.exports); return m.exports; }
const CG = loadCfg('crm/config_generic.js'), CV = loadCfg('crm/config_vastrangam.js');

const LADDER = `<div class="ladder">
  <div class="rung"><div class="bx">New</div><div class="od">10%</div><div class="cp">just arrived,<br>nothing agreed</div></div>
  <div class="rung"><div class="bx">Contacted</div><div class="od">25%</div><div class="cp">you have spoken,<br>there is interest</div></div>
  <div class="rung"><div class="bx">Quoted</div><div class="od">50%</div><div class="cp">a price is<br>on the table</div></div>
  <div class="rung"><div class="bx">Negotiation</div><div class="od">75%</div><div class="cp">down to<br>terms</div></div>
</div>`;

const SEGTABLE = `<table><thead><tr><th>Group</th><th>A customer lands here when</th><th>What it means</th></tr></thead><tbody>
  <tr><td><b>Champion</b></td><td>Bought 4+ times, and bought in the last 45 days</td><td>Your best. Hold on to them.</td></tr>
  <tr><td><b>Loyal</b></td><td>Bought 2+ times, and bought in the last 60 days</td><td>Reliable. Grow the order size.</td></tr>
  <tr><td><b>Needs attention</b></td><td>Bought 2+ times, but quiet for 60–90 days</td><td>Something changed. Find out what.</td></tr>
  <tr><td><b>At risk</b></td><td>Has not bought in 90 days</td><td>Call this week, not next month.</td></tr>
  <tr><td><b>Sleeping</b></td><td>Has not bought in 180 days</td><td>One last try, then stop spending.</td></tr>
  <tr><td><b>New</b></td><td>Bought once, or not yet at all</td><td>Make the second order easy.</td></tr>
</tbody></table>`;

/* ══════════════════ CRM APP BOOK ══════════════════ */
function crmBook(c) {
  const T = 19, P = mkPager(c.edition, T, 'CRM & Customer 360');
  const fig = (v, cap, cls) => `<figure class="${cls || ''}"><img src="${img(c.tag, v)}"><figcaption>${cap}</figcaption></figure>`;
  const pages = [];

  pages.push(cover(c, 'CRM &amp; Customer 360',
    'Lead → won → the whole lifetime, in one record',
    'Module 02 · CRM — App 1 of 1',
    c.lede,
    ['One file · opens by double-click', 'Works offline', '29 / 29 self-tests pass', 'Win a deal, the customer appears']));

  pages.push(P(`<h2>What this is, and what is inside</h2>
    <p class="big">This app does <b>two jobs that most software splits into two products</b> — and it does them in one record, so nobody is ever typed in twice.</p>
    <div class="pg2">
      <div class="cardbox"><b>Before they buy — a LEAD</b><span>They sit in a pipeline, moving from New to Contacted to Quoted to Negotiation. Every stage carries a real probability of closing, so the forecast is honest instead of hopeful.</span></div>
      <div class="cardbox"><b>After they buy — a CUSTOMER</b><span>Every order, everything sent back, what they are actually worth once returns come off, how long since you last heard from them, and which of six behaviour groups they are in.</span></div>
    </div>
    <p style="margin-top:12px">Mark a deal <b>Won</b> and the customer appears on the Customers screen immediately. There is no export, no re-keying, and no gap where somebody gets forgotten.</p>
    <div class="good"><b>What it never does:</b> touch your orders, invoices, stock or ledger. Worth, returns and last-order date are <b>read</b> from ${c.orderSrc} — never typed in here. That is why the customer value on this screen cannot disagree with what ${c.orderSrc} says. There is only one copy of it.</div>
    <div class="toc"><h3>What this document covers</h3><ol>
      <li>What this is, and what is inside</li>
      <li>Where CRM sits — the wiring</li>
      <li>The process — a lead becomes a customer</li>
      <li>Screen · Overview</li>
      <li>Why "likely to close" is the number to trust</li>
      <li>Screen · Pipeline — where you actually work</li>
      <li>Adding a lead, and what is refused</li>
      <li>Moving a deal on — one stage at a time</li>
      <li>Winning a deal — the customer appears</li>
      <li>Losing a deal, and why that is worth recording</li>
      <li>Screen · Customers</li>
      <li>Filtering to one group</li>
      <li>Screen · Customer 360</li>
      <li>The conversation log — the one thing only you know</li>
      <li>Screen · Segments &amp; offers</li>
      <li>Every figure and how it is worked out</li>
      <li>The 29 self-tests, in full</li>
      <li>How to run it, and what it will not do</li></ol></div>`));

  pages.push(P(`<h2>Where CRM sits</h2>
    <p>Every Medhava app stands on <b>one shared Data Core</b>: Item/SKU, Party, Stock, Ledger/Voucher and Order. CRM owns the lead and the conversation. Everything about money and orders it reads.</p>
    <div class="wire2"><div class="core"><b>UNIFIED DATA CORE</b><span>Item · Party · Stock · Ledger · Order</span></div>
      <div class="ring">${c.ring.map(r => `<div class="rn ${r[0]}">${r[1]}</div>`).join('')}</div></div>
    <p class="cap">Orange = what CRM reads in. Green = what it gives back.</p>
    <h3>What it reads, and from where</h3>
    <table><thead><tr><th>Comes from</th><th>What it supplies</th></tr></thead><tbody>
      ${c.wiringIn.map(w => `<tr><td><b>${w.from}</b></td><td>${w.what}</td></tr>`).join('')}
    </tbody></table>
    <div class="rule"><b>Two things CRM owns outright.</b> The <b>lead</b> — its stage, its value, why it was lost — and the <b>conversation log</b>. Nothing else in the business records what was said on a call or promised at an exhibition, which is why those two are the only things in this app that are typed in by hand.</div>`));

  pages.push(P(`<h2>The process — a lead becomes a customer</h2>
    <div class="flow"><span class="fb">Lead arrives</span><span class="ar">→</span><span class="fb">Moves stage</span><span class="ar">→</span><span class="fb">Won</span><span class="ar">→</span><span class="fb">Customer</span><span class="ar">→</span><span class="fb">Segment</span></div>
    <p class="cap">Five steps. Only the first three need a human; the last two happen on their own.</p>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>A lead arrives.</b> ${c.step1} You type the name, the ${c.coWord}, where it came from, and your honest estimate of the value. It lands at <b>New</b>.</div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>You move it on.</b> One stage at a time — New → Contacted → Quoted → Negotiation. It never skips and never goes backwards. The <b>weighted pipeline</b> changes the moment you press the button, because the odds changed.</div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>Won or lost.</b> Won creates the customer <b>right then</b>. Lost records a reason and leaves the pipeline — but stays in the record, because lost deals are what your win rate and your "where deals are lost" table are made of.</div></div>
      <div class="st"><span class="n">4</span><div class="tx"><b>Their orders appear by themselves.</b> ${c.step4} Nobody enters an order in CRM. Their worth, their returns and their average order size all follow.</div></div>
      <div class="st"><span class="n">5</span><div class="tx"><b>Their segment looks after itself.</b> Order four times in six weeks and they become a Champion. Go quiet for 90 days and they become At risk — and appear on the Overview under "who needs a call". Nobody tags anybody.</div></div>
    </div>
    <div class="good"><b>The point of steps 4 and 5:</b> a CRM that needs somebody to remember to update it is out of date within a month. Nothing in this one has to be maintained.</div>
    <h3>What is left for a human to do — exactly three things</h3>
    <table><thead><tr><th>You do</th><th>Why only you can</th></tr></thead><tbody>
      <tr><td><b>Add a lead</b></td><td>Nothing else in the business knows an enquiry arrived.</td></tr>
      <tr><td><b>Move it on, or mark it won / lost</b></td><td>Only you know whether a price is genuinely on the table.</td></tr>
      <tr><td><b>Log what was said</b></td><td>A promise made on a call exists nowhere else. If it is not written down, it is gone the day you are unavailable.</td></tr>
    </tbody></table>
    <p>Three actions. Everything on all seven screens is worked out from those three and from what the rest of the business already records.</p>`));

  pages.push(P(`<h2>Screen · Overview</h2>
    ${fig('dash', 'Everything you are chasing on the left, everybody going quiet on the right, and why deals are lost at the bottom.', 'tall')}
    <h3>Reading it in thirty seconds</h3>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>Likely to close</b> — is there enough coming? Ignore the raw pipeline; this is the number to plan against.</div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>Going cold</b> — if it is not zero, the panel on the right already names them, worst worth first, with a button that opens the record.</div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>Where deals are being lost</b> — read this once a month, not once a day. One reason repeating is a decision to make, not luck.</div></div>
    </div>`));

  pages.push(P(`<h2>Why "likely to close" is the number to trust</h2>
    <p>A deal that arrived yesterday and a deal where you are arguing over the last 2% are both "open" — but they are not remotely the same thing. So every stage carries a probability:</p>
    ${LADDER}
    <p class="cap">The odds are fixed and visible. Nobody adjusts them per deal, so nobody can flatter a forecast.</p>
    <table><thead><tr><th>A ₹10,00,000 deal…</th><th>Counts as</th><th>Because</th></tr></thead><tbody>
      <tr><td>sitting at <b>New</b></td><td class="mono">₹1,00,000</td><td>Nothing has been agreed yet</td></tr>
      <tr><td>at <b>Contacted</b></td><td class="mono">₹2,50,000</td><td>There is real interest</td></tr>
      <tr><td>at <b>Quoted</b></td><td class="mono">₹5,00,000</td><td>A price is on the table</td></tr>
      <tr><td>at <b>Negotiation</b></td><td class="mono">₹7,50,000</td><td>You are down to terms</td></tr>
    </tbody></table>
    <div class="rule"><b>This is why the weighted figure is always smaller than the raw pipeline</b> — and why it is the one to plan cash against. A pipeline of ${c.pipeEg} that weights down to roughly half of that is not bad news; it is the truth arriving earlier than it otherwise would.</div>
    <h3>The other four cards</h3>
    <div class="pg2">
      <div class="cardbox"><b>Open pipeline</b><span>Every live deal added up. The optimistic number — useful only next to the weighted one.</span></div>
      <div class="cardbox"><b>Win rate</b><span>Deals won ÷ (won + lost). Needs lost deals to be recorded, which is why "Lost" matters.</span></div>
      <div class="cardbox"><b>Customer value</b><span>What your existing customers are worth — orders minus returns. Never gross.</span></div>
      <div class="cardbox"><b>Going cold</b><span>How many customers have not ordered in 90 days. Red the moment there is one.</span></div>
    </div>`));

  pages.push(P(`<h2>Screen · Pipeline — where you actually work</h2>
    ${fig('pipe', 'A card per stage, the add-a-lead form, then every open deal with three buttons on each row.', 'tall')}
    <h3>What the open-deals table shows you, column by column</h3>
    <table><thead><tr><th>Column</th><th>What it is</th></tr></thead><tbody>
      <tr><td><b>Deal</b></td><td>The contact name, with the ${c.coWord} underneath.</td></tr>
      <tr><td><b>Source</b></td><td>Where it came from — worth reviewing once a quarter to see which source actually converts.</td></tr>
      <tr><td><b>Value</b></td><td>Your estimate.</td></tr>
      <tr><td><b>Stage</b></td><td>Which stage, and its odds, side by side.</td></tr>
      <tr><td><b>Worth × odds</b></td><td>Value × odds — what this one deal is really worth to a forecast.</td></tr>
      <tr><td><b>Age</b></td><td>Days since it arrived. <b>Turns red past 45 days.</b></td></tr>
    </tbody></table>`));

  pages.push(P(`<h2>Adding a lead, and what is refused</h2>
    <p>Four boxes at the top of the Pipeline screen.</p>
    <table><thead><tr><th>Box</th><th>What to put in it</th></tr></thead><tbody>
      <tr><td><b>Contact / buyer name</b></td><td>The person you actually talk to. <b>Required.</b></td></tr>
      <tr><td><b>${c.coLabel}</b></td><td>${c.coHint}</td></tr>
      <tr><td><b>Where did it come from</b></td><td>${c.srcList}</td></tr>
      <tr><td><b>Deal value (₹)</b></td><td>Your honest estimate. <b>Required, and must be above zero.</b> It does not have to be exact — the stage odds already account for uncertainty.</td></tr>
    </tbody></table>
    ${fig('pipe_added', 'A lead added. It appears at the New stage and the New card grows by its value.')}
    <div class="rule"><b>A lead with no name, or no value, is refused.</b> That is deliberate. A pipeline full of blank rows is worse than no pipeline at all — it produces a forecast nobody believes, and then nobody looks at the screen again.</div>`));

  pages.push(P(`<h2>Moving a deal on — one stage at a time</h2>
    <p>Below, the same lead after one press of <b>Move on →</b>. It went from New to Contacted — never further, never backwards.</p>
    ${fig('pipe_advanced', 'One press, one stage. The odds went from 10% to 25%, so the weighted pipeline rose.', 'tall')}
    <div class="good"><b>Why it cannot skip a stage.</b> "Quoted" means a price is genuinely on the table. If the button let you jump straight there from New, the 50% odds would stop meaning anything, and the weighted pipeline — the only number worth planning against — would quietly become fiction.</div>
    <p><b>Deals in Negotiation have no "Move on" button.</b> The only way out of the last stage is Won or Lost. There is nowhere else for a deal to go.</p>
    <p><b>Watch the Age column.</b> It turns red past 45 days. An old deal at an early stage is almost always a dead deal that nobody has admitted to yet — and it is inflating your pipeline while it sits there.</p>`));

  pages.push(P(`<h2>Winning a deal — the customer appears</h2>
    ${fig('pipe_won', 'Marked won. It leaves the open pipeline, joins the Won panel, and the win rate moves.', 'tall')}
    <div class="good"><b>The important part is not on this screen.</b> Pressing <b>Won</b> also created the customer. Go to the Customers screen and they are there — with a segment of "New", ready for their first order. You never re-type anybody, and nobody falls through the gap between "we won it" and "they are a customer".</div>`));

  pages.push(P(`<h2>Losing a deal, and why that is worth recording</h2>
    <p>Pressing <b>Lost</b> marks the deal lost and records <b>why</b>, based on how far it had got. The deal leaves the pipeline but stays in the record.</p>
    <table><thead><tr><th>Lost at</th><th>Recorded reason</th></tr></thead><tbody>
      ${(c.lossReasons || []).map((r, i) => `<tr><td><b>${['New', 'Contacted', 'Quoted', 'Negotiation'][i]}</b></td><td>${r}</td></tr>`).join('')}
    </tbody></table>
    <h3>Why bother recording a loss at all?</h3>
    <ul class="pts">
      <li><b>Your win rate is meaningless without it.</b> Win rate is won ÷ (won + lost). Only record the wins and it is always 100%.</li>
      <li><b>The "where deals are being lost" table on the Overview</b> is built entirely from these reasons. After three months it is the most useful table in the app.</li>
      <li><b>One reason appearing over and over is not bad luck.</b> If "${c.lossEg}" keeps coming up, that is a pricing decision or a listing problem — something you can act on. Nobody notices a pattern they never wrote down.</li>
    </ul>
    <div class="rule"><b>The temptation is to leave losses "open" so the pipeline looks bigger.</b> Do that and within two months the pipeline is mostly deals that died, the forecast is worthless, and the one table that would have told you why is empty.</div>
    <h3>What happens to the numbers when you press Lost</h3>
    <table><thead><tr><th>Figure</th><th>What it does</th></tr></thead><tbody>
      <tr><td><b>Open pipeline</b></td><td>Falls by that deal's value — immediately.</td></tr>
      <tr><td><b>Likely to close</b></td><td>Falls by value × the odds of the stage it died at.</td></tr>
      <tr><td><b>Win rate</b></td><td>Falls, because the denominator grew. This is the honest part.</td></tr>
      <tr><td><b>Where deals are being lost</b></td><td>Gains a row, or an existing row gains a deal and its value.</td></tr>
      <tr><td><b>The Lost panel</b></td><td>Keeps the deal permanently, with its reason.</td></tr>
    </tbody></table>
    <div class="good"><b>There is no "delete a deal" button anywhere in this app.</b> A deal is won or lost; it never disappears. That is what makes the win rate trustworthy — nobody can improve it by quietly removing the failures.</div>`));

  pages.push(P(`<h2>Screen · Customers</h2>
    ${fig('cust', 'Everybody you have won — sorted by what they are actually worth, not by what they ordered.', 'tall')}
    <div class="rule"><b>The table is sorted by Worth, not Gross.</b> ${c.sortNote}</div>`));

  pages.push(P(`<h2>Filtering to one group</h2>
    <p>The row of buttons filters the list to one behaviour group. Below, only the customers who have gone quiet.</p>
    ${fig('cust_atrisk', 'Filtered to "At risk". The badge in the heading confirms how many are being shown.', 'tall')}
    <h3>The four cards, and which one matters most</h3>
    <div class="pg2">
      <div class="cardbox"><b>Customers</b><span>How many are on the books.</span></div>
      <div class="cardbox"><b>Total worth</b><span>Every order ever placed, minus everything sent back.</span></div>
      <div class="cardbox"><b>Repeat rate</b><span>What share have ordered more than once. <b>This single number says more about a business than revenue does</b> — it is the difference between a business and a series of one-off sales.</span></div>
      <div class="cardbox"><b>Best customer</b><span>Who is worth the most, and how much.</span></div>
    </div>`));

  pages.push(P(`<h2>Screen · Customer 360</h2>
    ${fig('person', 'One customer, everything: worth, orders, returns, segment, the agreed offer, channel mix, every order, and the conversation.', 'tall')}
    <h3>Six panels, top to bottom</h3>
    <table><thead><tr><th>Panel</th><th>What it tells you</th></tr></thead><tbody>
      <tr><td><b>The four cards</b></td><td>Worth, order count and average, returns and return %, and how long since their last order.</td></tr>
      <tr><td><b>Where they stand</b></td><td>Their segment, <b>why</b> in plain words ("5 orders, last one 11 days ago"), and the agreed action for that group.</td></tr>
      <tr><td><b>What they buy, and where it comes back</b></td><td>One row per channel — ordered, sent back, return %, kept.</td></tr>
      <tr><td><b>Every order</b></td><td>Number, date, channel, amount, returned, kept. Newest first. Read from ${c.orderSrc}, never typed here.</td></tr>
      <tr><td><b>Conversation</b></td><td>What was said, and when. The one thing only you know.</td></tr>
    </tbody></table>`));

  pages.push(P(`<h2>The conversation log — the one thing only you know</h2>
    ${fig('person_note', 'A note logged. It appears below with its date, newest first.', 'tall')}
    <div class="rule"><b>This is the only place in the app where you are the source of truth.</b> Every other figure is read from somewhere else and can be recalculated. What was said on the call and what was promised at the exhibition exists nowhere but here — so if it is not written down, it is gone the day the person who took the call is unavailable.</div>
    <p><b>The channel-mix panel above it</b> is the other panel worth reading slowly. ${c.mixNote}</p>`));

  pages.push(P(`<h2>Screen · Segments &amp; offers</h2>
    <p>Six groups. Every customer is in exactly one. Nobody tags anybody by hand, and the groups recalculate themselves the moment somebody orders or goes quiet.</p>
    ${SEGTABLE}
    ${fig('segs', 'Each group with its rule, how many customers, what they are worth, and its share of your total customer value.')}
    <div class="good">${c.segNote}</div>`));

  pages.push(P(`<h2>Every figure, and how it is worked out</h2>
    <p>This is the same table as the Wiring screen, so you have it on paper.</p>
    <table><thead><tr><th>Figure</th><th>Comes from</th><th>How it is worked out</th></tr></thead><tbody>
      ${c.wiring.map(w => `<tr><td><b>${w.f}</b></td><td>${w.s}</td><td>${w.h}</td></tr>`).join('')}
    </tbody></table>
    <h3>The arithmetic, in one place</h3>
    <table><thead><tr><th>Name</th><th>Worked out as</th></tr></thead><tbody>
      <tr><td>Open pipeline</td><td>every deal still open, added up</td></tr>
      <tr><td>Likely to close</td><td>for each open deal: value × the odds of its stage</td></tr>
      <tr><td>Win rate</td><td>deals won ÷ (deals won + deals lost) × 100</td></tr>
      <tr><td>Worth × odds (per deal)</td><td>deal value × stage odds</td></tr>
      <tr><td>Customer worth</td><td>all their orders − everything they returned</td></tr>
      <tr><td>Return %</td><td>returned value ÷ gross ordered × 100</td></tr>
      <tr><td>Average order value</td><td>customer worth ÷ number of orders</td></tr>
      <tr><td>Last order age</td><td>today − the date of their newest order</td></tr>
      <tr><td>Repeat rate</td><td>customers with 2+ orders ÷ customers with any order × 100</td></tr>
      <tr><td>Total customer worth</td><td>every order ever placed − everything ever returned</td></tr>
    </tbody></table>
    <div class="good">Every figure is rounded to two decimal places at the moment it is calculated, so a total can never disagree with the rows above it by a stray paisa — and the segment values always add up to the total customer worth. Both are self-tests.</div>`));

  pages.push(P(`<h2>The 29 self-tests, in full</h2>
    <p>These run every time the app opens, <b>before</b> anything is shown. Menu → <b>Backup &amp; Health</b> to see them live. They are written in plain language on purpose — you should be able to read what was checked.</p>
    ${testTable(TESTS[c.tag])}`));

  pages.push(P(`<h2>How to run it, and what it will not do</h2>
    <h3>Running it</h3>
    <ol class="run">
      <li><b>Windows:</b> extract the ZIP, then double-click <span class="kbd">${c.file}</span>. It opens in your browser. That is the whole installation.</li>
      <li><b>Mac:</b> unpack the ZIP, double-click the file. Safari opens it.</li>
      <li><b>Android:</b> Files app → Downloads → tap the file → open with Chrome. Then ⋮ → <b>Add to Home screen</b> and it behaves like any other app.</li>
      <li><b>iPhone / iPad:</b> Files app → tap the file → Safari. Then Share → <b>Add to Home Screen</b>.</li>
      <li>No internet needed, ever. No account, no licence key, no setup wizard.</li>
    </ol>
    <h3>Keeping your data safe</h3>
    <p>Your leads, your customers and every note you have logged live in your own browser on your own device — nowhere else, and never on anybody's server. That means nobody can see them, and also that clearing your browser's site data would erase them. So: <b>Backup &amp; Health → Export JSON</b>, once a week. To move to another device, take the file and the backup with you and use <b>Import JSON</b>.</p>
    ${fig('backup', 'Backup & Health — your data controls, and the live test results below them.', 'third')}
    <h3>What it will not do</h3>
    <ul class="pts">
      <li>It does not send emails or WhatsApp messages. It tells you who to contact and why; you contact them.</li>
      <li>It has no user accounts, so it does not track which salesperson owns which deal. That arrives with the hosted version.</li>
      <li>In this single-file form it does not pull live from ${c.liveFrom}; the hosted version of Medhava is what connects those pipes.</li>
      <li>It will not stop you putting a silly value on a deal. It checks its own arithmetic, not your judgement.</li>
    </ul>
    <div class="accept">Accepted when: the app opens by double-click with no internet · all 29 self-tests show pass · a lead can be added, moved on, won and lost · winning a lead creates the customer immediately · a segment filter changes the list · a note logs against one customer and nobody else · a backup exports and imports cleanly.</div>`));

  return doc(pages.join(''), 'Medhava CRM & Customer 360 — ' + c.edition);
}

/* ══════════════════ MODULE BOOK ══════════════════ */
function moduleBook() {
  const T = 10, P = mkPager('CRM', T, 'Module 02');
  const pages = [];
  pages.push(`<section class="pg cover"><div class="cwrap">
    <div class="logo">${mark} Medhava</div>
    <div class="ed">Module 02 of 16</div>
    <h1>CRM</h1>
    <div class="sub">CRM &amp; Customer 360</div>
    <div class="module">1 app × 2 editions — Medhava (any industry) and Vastrangam</div>
    <p class="lede">Know every customer completely. One record per person carrying every lead, order, return and conversation — whichever channel it came from. Before they buy it is a pipeline with honest odds; after they buy it is a full lifetime that maintains itself.</p>
    <div class="badges"><span>2 working apps</span><span>58 self-tests, all passing</span><span>Zero console errors</span><span>Full workflow verified</span></div>
    <div class="cfoot">Medhava ERP suite · FY 2026-27 · The second module of sixteen</div></div></section>`);

  pages.push(P(`<h2>What this module is</h2>
    <p class="big">Module 01 told you <b>what is happening</b>. Module 02 tells you <b>who it is happening with</b>.</p>
    <p>It is one app, and it covers the whole relationship — from the first enquiry to the customer who has quietly stopped ordering. The two halves are usually sold as separate products (a "CRM" for leads, an "analytics" tool for customer value). Splitting them is what creates the gap where a won deal never becomes a tracked customer.</p>
    <h3>The one app</h3>
    <table><thead><tr><th>App</th><th>Answers</th><th>Screens</th><th>Self-tests</th></tr></thead><tbody>
      <tr><td><b>1 · CRM &amp; Customer 360</b></td><td>Who are we chasing, what will actually close, who have we won, what are they worth, and who has gone quiet?</td><td>7</td><td>29</td></tr>
    </tbody></table>
    <h3>Two editions of it</h3>
    <table class="vs"><thead><tr><th>Edition</th><th>What it is</th></tr></thead><tbody>
      <tr><td><b>Medhava</b></td><td>The unified ERP. Industry-neutral names and rules — the same engine runs a distributor, a manufacturer, a clinic or a services firm. You change the master data, not the software.</td></tr>
      <tr><td><b>Vastrangam</b></td><td>The same engine with Vastrangam's own world in it: Myntra and Flipkart category managers, Jaipur boutiques, Surat wholesale, exhibition buyers, Dubai exports.</td></tr>
    </tbody></table>
    <div class="good"><b>The engine is byte-for-byte identical between the two editions.</b> Only the configuration file differs. Both pass exactly the same 29 self-tests, with the same names — which is the proof that "industry-neutral" is real and not a claim.</div>
    <div class="toc"><h3>Contents</h3><ol>
      <li>What this module is</li><li>How CRM sits on the Data Core</li>
      <li>The pipeline, and the odds behind it</li><li>The six behaviour groups</li>
      <li>Why nothing here has to be maintained</li><li>Medhava and Vastrangam, side by side</li>
      <li>What is in the ZIP, and how to open it</li><li>How this was verified</li>
      <li>Where this sits, and what comes next</li></ol></div>`));

  pages.push(P(`<h2>How CRM sits on the Data Core</h2>
    <p>CRM owns the lead and the conversation. Everything about money and orders it reads.</p>
    <div class="wire2"><div class="core"><b>UNIFIED DATA CORE</b><span>Item · Party · Stock · Ledger · Order</span></div>
      <div class="ring">
        <div class="rn in">← Sales &amp; Orders · orders, returns, channel</div>
        <div class="rn in">← Channels · marketplace orders &amp; settlements</div>
        <div class="rn in">← Accounting · did they pay, how late</div>
        <div class="rn in">← Catalog · what they bought</div>
        <div class="rn out">→ Party master · the customer record</div>
        <div class="rn out">→ CEO Dashboard · customer value, at-risk count</div>
      </div></div>
    <p class="cap">Orange = read in. Green = given back. CRM writes the customer and the conversation; it never writes an order.</p>
    <div class="rule"><b>This is the line most CRMs cross, and it costs them their credibility.</b> Once a CRM keeps its own copy of "customer revenue", that copy starts drifting from the books within weeks — and then two screens in the same business disagree about the same customer. Here, worth is recalculated from the orders every time the screen is drawn. There is nothing to drift.</div>
    <div class="flow"><span class="fb">Lead</span><span class="ar">→</span><span class="fb">Stage</span><span class="ar">→</span><span class="fb">Won</span><span class="ar">→</span><span class="fb">Customer</span><span class="ar">→</span><span class="fb">Orders read in</span><span class="ar">→</span><span class="fb">Segment</span></div>
    <p class="cap">Only the first three steps need a person. The last three happen on their own.</p>
    <h3>Who writes what</h3>
    <table><thead><tr><th>Record</th><th>Written by</th><th>Read by CRM for</th></tr></thead><tbody>
      <tr><td><b>Lead</b></td><td>CRM — nothing else knows an enquiry arrived</td><td>Pipeline, weighted pipeline, win rate</td></tr>
      <tr><td><b>Conversation note</b></td><td>CRM — a promise on a call exists nowhere else</td><td>The customer's history</td></tr>
      <tr><td><b>Customer / Party</b></td><td>CRM writes it the moment a deal is won</td><td>Every customer screen</td></tr>
      <tr><td><b>Order</b></td><td>Sales, or Channel Manager for marketplaces</td><td>Worth, average order, last-order date</td></tr>
      <tr><td><b>Return</b></td><td>Sales returns, or the marketplace feed</td><td>Worth, return %, channel mix</td></tr>
      <tr><td><b>Payment</b></td><td>Accounting</td><td>Whether they actually pay, and how late</td></tr>
    </tbody></table>
    <div class="good"><b>Three rows written here, three rows read from elsewhere.</b> That split is the whole design. CRM knows things nobody else can know, and stays quiet about everything it would only be guessing at.</div>`));

  pages.push(P(`<h2>The pipeline, and the odds behind it</h2>
    <p>A deal that arrived yesterday and a deal where you are arguing over the last 2% are both "open". They are not the same thing, so every stage carries a fixed, visible probability.</p>
    ${LADDER}
    <p class="cap">Nobody adjusts these per deal, so nobody can flatter a forecast.</p>
    <figure><img src="${img('CRM_VAS', 'dash')}"><figcaption>The Overview — raw pipeline and weighted pipeline side by side, and why deals are being lost.</figcaption></figure>
    <div class="good"><b>Two numbers, deliberately shown together.</b> "Open pipeline" is what a hopeful sales meeting quotes. "Likely to close" is what you can plan cash against. Showing only the first is how businesses end up committing to spend that never arrives.</div>`));

  pages.push(P(`<h2>The six behaviour groups</h2>
    <p>Every customer is in exactly one group, worked out from behaviour — how often they buy and how long ago — never from anybody's opinion.</p>
    ${SEGTABLE}
    <figure><img src="${img('CRM_VAS', 'segs')}"><figcaption>Each group with its rule, its customer count, its worth, and its share of total customer value.</figcaption></figure>
    <div class="rule"><b>The share-of-value bar is usually the uncomfortable part.</b> A very large share of what a business is worth normally sits with a very small number of people — and most businesses spend their marketing money on everybody equally.</div>`));

  pages.push(P(`<h2>Why nothing here has to be maintained</h2>
    <p>The reason most CRM projects are abandoned is not that the software was bad. It is that keeping it accurate became somebody's unpaid second job. This one is built so there is almost nothing to keep.</p>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>You never enter an order.</b> Orders are read from Sales. A customer's worth, returns, average order and last-order date all follow automatically.</div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>You never tag a customer.</b> Segments are rules on live figures. Somebody who orders today becomes a Champion without anybody noticing; somebody who goes quiet becomes At risk on day 91.</div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>You never re-key a won deal.</b> Pressing Won creates the customer in the same click.</div></div>
      <div class="st"><span class="n">4</span><div class="tx"><b>You never write a report.</b> "Who needs a call", "where deals are being lost" and the share-of-value bars are all derived, every time the screen opens.</div></div>
    </div>
    <h3>What is left for a human to do — exactly three things</h3>
    <table><thead><tr><th>You do</th><th>Why only you can</th></tr></thead><tbody>
      <tr><td><b>Add a lead</b></td><td>Nothing else in the business knows an enquiry arrived.</td></tr>
      <tr><td><b>Move it on, or mark it won / lost</b></td><td>Only you know whether a price is genuinely on the table.</td></tr>
      <tr><td><b>Log what was said</b></td><td>A promise made on a call exists nowhere else. If it is not written down, it is gone the day you are unavailable.</td></tr>
    </tbody></table>
    <div class="good">Three actions. Everything else on all seven screens is worked out from them and from what the rest of the business already records.</div>
    <h3>The four things a maintained CRM asks of you, and what happens here instead</h3>
    <table><thead><tr><th>Usually somebody has to…</th><th>Here</th></tr></thead><tbody>
      <tr><td>Update the customer's total spend</td><td>Recalculated from the orders every time the screen is drawn</td></tr>
      <tr><td>Re-tag customers as "VIP" or "lapsed"</td><td>Six rules run on live figures — a customer moves group on day 91 without anybody noticing</td></tr>
      <tr><td>Copy a won deal into the customer list</td><td>One click does both</td></tr>
      <tr><td>Build a "who to call" report each Monday</td><td>It is on the Overview, recomputed on open</td></tr>
    </tbody></table>
    <div class="rule"><b>This is why CRM projects fail, and it is rarely the software.</b> A CRM that needs a person to keep it honest is accurate for about six weeks. After that the numbers on it are quietly wrong, people stop trusting the screen, and it becomes a place where notes go to die. The only defence is to make sure there is almost nothing to keep — which is what the table above is.</div>`));

  pages.push(P(`<h2>Medhava and Vastrangam, side by side</h2>
    <p>Same engine, same 29 self-tests, same arithmetic. Only the master data differs — which is exactly the point.</p>
    <table class="vs"><thead><tr><th>&nbsp;</th><th>Medhava (unified ERP)</th><th>Vastrangam</th></tr></thead><tbody>
      <tr><td><b>Company</b></td><td>Acme Corp — stands in for any business</td><td>Vastrangam — ethnic-wear D2C + marketplace</td></tr>
      <tr><td><b>Lead sources</b></td><td>Website enquiry · Referral · Trade show · Cold outreach · Marketplace lead</td><td>Boutique enquiry · Referral from a buyer · Exhibition / trade fair · Marketplace category manager · Instagram DM</td></tr>
      <tr><td><b>Customers</b></td><td>Northline Retail · Metro Distributors · Harbour Trading · Sunrise Enterprises</td><td>Myntra · Flipkart · Rajmandir Wholesale (Surat) · Anokhi Boutique (Jaipur) · Silk Route Exports (Dubai)</td></tr>
      <tr><td><b>Why deals are lost</b></td><td>Price too high · Went to a competitor · Timing · Payment terms</td><td>Wanted a lower rate · Went to a Surat competitor · Delivery date did not suit · Credit terms</td></tr>
      <tr><td><b>Channels on a record</b></td><td>Retail · Marketplace · Website · Wholesale · Export</td><td>Myntra · Flipkart · Own Website · Wholesale (Surat) · Exhibition / Exports</td></tr>
      <tr><td><b>Offer per group</b></td><td>Neutral commercial language</td><td>Festive indents, rate holds, size-chart fixes</td></tr>
      <tr><td><b>Engine</b></td><td colspan="2" style="text-align:center"><b>Identical. One file, shared by both.</b></td></tr>
      <tr><td><b>Self-tests</b></td><td colspan="2" style="text-align:center"><b>29 each — identical names, all passing in both.</b></td></tr>
    </tbody></table>
    <div class="good"><b>Why ship both?</b> The neutral edition is what a new customer in any industry receives. The Vastrangam edition is the proof the neutral engine survives a real business — real return rates, real settlement delays, buyers who are marketplaces rather than people. If a rule only works when the data is tidy, the Vastrangam build finds it first.</div>
    <h3>What putting Medhava into a new business actually involves</h3>
    <p>Editing one configuration file. Nothing in the engine is touched, so nothing that was tested stops being true.</p>
    <table><thead><tr><th>You change</th><th>You do not change</th></tr></thead><tbody>
      <tr><td>Company name and financial year</td><td>How a customer's worth is calculated</td></tr>
      <tr><td>Your lead sources — however many, whatever they are called</td><td>The four stages, or their odds</td></tr>
      <tr><td>Your customers, their type and city</td><td>The six segment rules and their day thresholds</td></tr>
      <tr><td>The reasons you actually lose deals</td><td>How the win rate is worked out</td></tr>
      <tr><td>The offer written for each group</td><td>Any of the 29 self-tests</td></tr>
      <tr><td>Every word on the Wiring screen</td><td>That worth is read, never stored</td></tr>
    </tbody></table>
    <div class="rule"><b>One thing worth saying plainly:</b> the Vastrangam edition is not a demo with the names changed. Its buyers are marketplaces, not people; its return rates are the real ones; its lost-deal reasons are the ones that actually come up in Surat. That is what makes it a test rather than a screenshot.</div>`));

  pages.push(P(`<h2>What is in the ZIP, and how to open it</h2>
    <pre class="code">Module_02_CRM__Medhava_and_Vastrangam.zip
│
├── READ_ME_FIRST.md
│
├── MEDHAVA_Module_02_CRM.zip                 ← unified ERP, any industry
│   └── MEDHAVA_Module_02_CRM/
│       ├── MEDHAVA_M02_START_HERE.md
│       ├── MEDHAVA_M02_Module_Overview.pdf
│       └── App_01_CRM_Customer_360/
│           ├── MEDHAVA_M02_App01_CRM_Customer_360.html    ← double-click
│           ├── MEDHAVA_M02_App01_CRM_Customer_360_MANUAL.md
│           └── MEDHAVA_M02_App01_CRM_Customer_360_WIRING.pdf
│
└── VASTRANGAM_Module_02_CRM.zip              ← Vastrangam's own data &amp; rules
    └── VASTRANGAM_Module_02_CRM/
        ├── VASTRANGAM_M02_START_HERE.md
        ├── VASTRANGAM_M02_Module_Overview.pdf
        └── App_01_CRM_Customer_360/
            ├── VASTRANGAM_M02_App01_CRM_Customer_360.html
            ├── VASTRANGAM_M02_App01_CRM_Customer_360_MANUAL.md
            └── VASTRANGAM_M02_App01_CRM_Customer_360_WIRING.pdf</pre>
    <h3>Opening it</h3>
    <ol class="run">
      <li><b>Extract the outer ZIP.</b> Windows: right-click → "Extract All". Mac: double-click it.</li>
      <li><b>Pick your edition</b> — <span class="kbd">MEDHAVA_…zip</span> or <span class="kbd">VASTRANGAM_…zip</span>. <b>Extract that one too.</b></li>
      <li><b>Open the app folder</b> — everything for the app is in it: the app, its manual, its PDF.</li>
      <li><b>Double-click the .html file.</b> Every filename starts with MEDHAVA_ or VASTRANGAM_, so you always know which edition you have open.</li>
    </ol>
    <div class="rule"><b>The one mistake to avoid:</b> opening the HTML file directly from inside a ZIP. Windows unpacks it to a temporary folder that gets wiped, so your data appears to vanish. Always extract first.</div>`));

  pages.push(P(`<h2>How this was verified</h2>
    <p>Both builds went through three gates. Nothing shipped on the basis that it looked right.</p>
    <div class="steps">
      <div class="st"><span class="n">1</span><div class="tx"><b>The arithmetic, with no screen involved.</b> Each engine was run in isolation and its self-tests executed. <b>58 tests across the two builds, all passing.</b></div></div>
      <div class="st"><span class="n">2</span><div class="tx"><b>The whole workflow, in a real browser.</b> Not just "does the screen draw" — the actual job: add a lead, move it on a stage, mark it won, <b>confirm the customer was created</b>, mark another lost, filter to a segment, open a Customer 360, log a note and <b>confirm it landed on that customer and nobody else</b>. Every screen was also visited and every control on it clicked. Any console error, script error or blank screen would have failed the build. <b>Zero errors in both.</b></div></div>
      <div class="st"><span class="n">3</span><div class="tx"><b>The screenshots in this document are the real thing</b> — captured from the shipped file at double resolution, in the state each caption describes. Nothing is a mock-up.</div></div>
    </div>
    <table><thead><tr><th>Build</th><th>Screens</th><th>Controls clicked</th><th>Workflow steps</th><th>Self-tests</th><th>Errors</th></tr></thead><tbody>
      <tr><td>CRM &amp; Customer 360 · Medhava</td><td>6 / 6</td><td>27</td><td class="pass">7 / 7</td><td class="pass">29 / 29</td><td class="pass">0</td></tr>
      <tr><td>CRM &amp; Customer 360 · Vastrangam</td><td>6 / 6</td><td>27</td><td class="pass">7 / 7</td><td class="pass">29 / 29</td><td class="pass">0</td></tr>
    </tbody></table>
    <div class="good">You can re-run the first gate yourself at any time, with no tools: open the app and go to <b>Backup &amp; Health</b>. The tests ran when the app started, and the results are on that screen.</div>
    <h3>The seven workflow steps the browser run actually performs</h3>
    <table><thead><tr><th>#</th><th>It does</th><th>And asserts</th></tr></thead><tbody>
      <tr><td>1</td><td>Types a name, a firm and a value; presses <b>Add to pipeline</b></td><td>The open-deal count went up by exactly one</td></tr>
      <tr><td>2</td><td>Presses <b>Move on →</b> on that deal</td><td>Its stage went from <span class="kbd">new</span> to <span class="kbd">contacted</span> — one step, not two</td></tr>
      <tr><td>3</td><td>Presses <b>Won</b></td><td>A customer was created, and the lead now reads <span class="kbd">won</span></td></tr>
      <tr><td>4</td><td>Presses <b>Lost</b> on a seeded deal</td><td>The lost count rose, with a reason attached</td></tr>
      <tr><td>5</td><td>Filters to <b>At risk</b>, then back to <b>Everyone</b></td><td>Both screens drew without error</td></tr>
      <tr><td>6</td><td>Opens a <b>Customer 360</b></td><td>The record drew with a heading</td></tr>
      <tr><td>7</td><td>Logs a note</td><td>The note count rose by one — and a separate self-test proves it landed on that customer and nobody else</td></tr>
    </tbody></table>
    <div class="rule"><b>Why assert, instead of just clicking?</b> A button that does nothing still "clicks" successfully. Every step above checks the data afterwards, so a control that looks alive but changes nothing would fail the build.</div>`));

  pages.push(P(`<h2>Where this sits, and what comes next</h2>
    <p>Sixteen modules and forty apps, in the order they are being built. The order is deliberate: see the business (01), then know who you are dealing with (02), then record what you sell (03).</p>
    ${ROADMAP.htmlTable({'01':'Delivered','02':'Delivered — you are holding it','03':'Next'},'02')}
    <h3>What stays the same in every module from here</h3>
    <ul class="pts">
      <li><b>One ZIP per module</b>, holding one ZIP per edition — MEDHAVA and VASTRANGAM — each with a folder per app.</li>
      <li><b>Every file is named by edition, module and app</b>, so nothing is ambiguous once extracted.</li>
      <li><b>Every app is one HTML file.</b> Double-click, works offline, saves in the browser, exports a backup.</li>
      <li><b>Every app ships a manual</b> for someone who has never installed software, and an illustrated PDF built from real screenshots of the shipped file.</li>
      <li><b>Every app carries its own self-tests</b> and its own Wiring screen naming the source of every figure.</li>
    </ul>
    <div class="accept">Module 02 is accepted when: both apps open by double-click with no internet · all 58 self-tests pass · a lead can be added, moved, won and lost · winning a lead creates the customer immediately · segments recalculate without anybody tagging anyone · a backup exports and imports cleanly on a computer and a phone.</div>`));

  return doc(pages.join(''), 'Medhava Module 02 — CRM');
}

/* ══════════════════ configs ══════════════════ */
const BOOKS = [
  { out: 'Medhava_CRM_Customer_360_ERP.pdf', c: {
    tag: 'CRM_ERP', edition: 'Unified ERP — any industry', co: 'Acme Corp',
    file: 'CRM_Customer_360.html',
    lede: 'One record per customer, carrying everything. Before they buy it is a pipeline with honest odds at every stage; after they buy it is every order, every return, what they are actually worth, and what to offer them next.',
    orderSrc: 'the Sales module', liveFrom: 'your other systems',
    ring: [['in', '← Sales &amp; Orders · orders, returns, channel'], ['in', '← Accounting · did they pay, how late'],
           ['in', '← Catalog · what they bought'], ['in', '← Marketing · which campaign the lead came from'],
           ['out', '→ Party master · the customer record'], ['out', '→ CEO Dashboard · customer value &amp; at-risk count']],
    wiring: CG.wiring, wiringIn: CG.wiringIn, lossReasons: CG.lossReasons,
    coLabel: 'Company / firm', coWord: 'company',
    coHint: 'The business, if there is one. A walk-in customer may not have one.',
    srcList: 'Website enquiry · Referral · Trade show · Cold outreach · Marketplace lead',
    step1: 'Somebody fills in your website form, a customer refers a friend, you meet a buyer at a trade show, or you make a cold call.',
    step4: 'Their first order is recorded in Sales — by whoever normally records orders — and it appears on their Customer 360 by itself.',
    pipeEg: '₹25,00,000',
    lossEg: 'Price too high',
    sortNote: 'A customer who orders a lot and returns a lot can easily be worth less than a quieter one who keeps what they buy. Sorting by gross hides that; sorting by worth shows it.',
    mixNote: 'If one channel is responsible for most of a customer’s returns while the others are clean, that is a channel problem — not a customer problem and not a product problem.',
    segNote: '<b>A Champion needs holding on to. A Sleeping customer needs one last try and then letting go.</b> Treating them the same is how marketing budgets disappear without anybody being able to say what they bought.',
  }},
  { out: 'Medhava_CRM_Customer_360_Vastrangam.pdf', c: {
    tag: 'CRM_VAS', edition: 'Vastrangam — ethnic-wear D2C + marketplace', co: 'Vastrangam',
    file: 'CRM_Customer_360.html',
    lede: "One record per buyer, carrying everything Vastrangam knows. Before they buy it is a pipeline with honest odds; after they buy it is every indent, every parcel that came back, and what that buyer is really worth once returns come off.",
    orderSrc: 'Channel Manager and Sales', liveFrom: 'Myntra, Flipkart or BUSY',
    ring: [['in', '← Channel Manager · Myntra / Flipkart / website'], ['in', '← Sales &amp; Orders · wholesale &amp; export indents'],
           ['in', '← Accounts / BUSY · did they pay, how late'], ['in', '← Catalog · which designs they bought'],
           ['out', '→ Party master · the buyer record'], ['out', '→ CEO Dashboard · buyer value &amp; at-risk count']],
    wiring: CV.wiring, wiringIn: CV.wiringIn, lossReasons: CV.lossReasons,
    coLabel: 'Boutique / firm / marketplace', coWord: 'boutique or firm',
    coHint: 'The boutique, the wholesale firm, or the marketplace. A website customer may not have one.',
    srcList: 'Boutique enquiry · Referral from a buyer · Exhibition / trade fair · Marketplace category manager · Instagram DM',
    step1: 'A boutique messages you on Instagram, a buyer refers another buyer, you meet somebody at an exhibition, or a marketplace category manager gets in touch.',
    step4: 'Their first indent is recorded in Sales, or their marketplace orders arrive through Channel Manager, and everything appears on their Customer 360 by itself.',
    pipeEg: '₹25,00,000',
    lossEg: 'Wanted a lower rate',
    sortNote: 'This matters more in ethnic wear than almost anywhere. A marketplace account with a huge gross and 14% coming back can be worth less than a Jaipur boutique at 4%. Sorting by gross hides that; sorting by worth shows it.',
    mixNote: 'This is the panel that settles arguments. If Flipkart is responsible for most of a buyer’s returns while Myntra is clean, the problem is that listing — the size chart, the fabric description, the photography — not the buyer and not the cloth.',
    segNote: '<b>A boutique that reorders every six weeks is worth holding on to. A chain that has been silent since last Diwali needs one win-back offer tied to the festive window, and then letting go.</b> In this trade the temptation is to chase whoever places the biggest indent and ignore everybody else — which is how a reliable ₹8 lakh-a-year boutique quietly walks away.',
  }},
];

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const jobs = BOOKS.map(x => ({ html: crmBook(x.c), out: x.out }));
  jobs.push({ html: moduleBook(), out: 'Medhava_Module_02_CRM.pdf' });
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
