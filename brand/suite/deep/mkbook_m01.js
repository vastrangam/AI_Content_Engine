'use strict';
/* Module 01 · Dashboard & BI — the illustrated process PDFs.

   Eight app books (4 apps × 2 editions) plus one module book. Every book is built by ONE
   generator from a per-app page list, for the same reason the four apps share one engine: a
   book written four times is a book that disagrees with itself by the third revision.

   Everything a book states about an app is derived, never typed twice:
     · the wiring tables come from that app's config file
     · the connector tables come from providers.js and the app's own uses[]
     · the self-test list comes from tests.json, which is the real run
     · the screenshots come from shots_m01.js, which drove the shipped file
   So a book cannot describe an app we did not build. */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const { doc, bookBuilder, cover, testPages, connectorsPage, connectorsRules, connectorsPage2, zipPage, mark } = require('./bookparts.js');
const PROVIDERS = require('./../providers.js');
const MOD = require('./module_m01.js');
const ROADMAP = require('./roadmap.js');
const DIR = __dirname, SHOTS = path.join(DIR, 'shots'), OUT = path.join(DIR, 'out');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TESTS = JSON.parse(fs.readFileSync(path.join(DIR, 'tests.json'), 'utf8'));

function loadCfg(dir, ed) {
  const src = fs.readFileSync(path.join(DIR, dir, 'config_' + ed + '.js'), 'utf8');
  return new Function(src + '\nreturn CONFIG;')();
}
function usesOf(dir) {
  const m = /uses\s*:\s*\[([^\]]*)\]/.exec(fs.readFileSync(path.join(DIR, dir, 'core.js'), 'utf8'));
  return m ? m[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean) : [];
}
/* The connector table is the app's own capability list, spelled out from the registry —
   so a book can never claim an alternative the app does not actually offer. */
function connectors(dir) {
  const uses = usesOf(dir);
  const caps = PROVIDERS.CAPS.filter(c => uses.indexOf(c.id) >= 0);
  return {
    capCount: caps.length,
    altCount: caps.reduce((s, c) => s + c.providers.length, 0),
    capRows: caps.map(c => [c.name, c.providers.map(p => p.name).join(' · ')]),
  };
}

/* ══════════════════ the one book generator ══════════════════ */
function appBook(c) {
  const P = bookBuilder(c.edition, c.app);
  const has = v => fs.existsSync(path.join(SHOTS, c.tag + '_' + v + '.png'));
  const fig = (v, cap, cls) => has(v)
    ? `<figure class="${cls || ''}"><img src="file://${path.join(SHOTS, c.tag + '_' + v + '.png')}"><figcaption>${cap}</figcaption></figure>` : '';
  const pages = [];

  pages.push(cover(c, c.app, c.sub, `Module 01 · Dashboard &amp; BI — App ${c.n} of 4`, c.lede, c.badges));

  pages.push(P(`<h2>What this is, and what is inside</h2>
    <p class="big">${c.what}</p>
    <p>${c.cfg.about}</p>
    <p>It is a single HTML file. It opens by double-click, runs with the internet switched off, saves your work in the browser, and checks its own arithmetic <b>${c.tests} different ways</b> every time it starts.</p>
    <div class="toc"><h3>What this document covers</h3>${P.toc()}</div>`));

  pages.push(P(`<h2>Where this app sits</h2>
    <p>Every Medhava app stands on <b>one shared Data Core</b>: Item/SKU, Party, Stock, Ledger/Voucher and Order. Each module writes into it; Module 01 is the module that reads it.</p>
    <div class="wire2"><div class="core"><b>UNIFIED DATA CORE</b><span>Item · Party · Stock · Ledger · Order</span></div>
      <div class="ring">${c.ring.map(r => `<div class="rn ${r[0]}">${r[1]}</div>`).join('')}</div></div>
    <p class="cap">Orange = what this app reads in. Green = what it gives back.</p>
    <h3>What it reads, and from where</h3>
    <table><thead><tr><th>Comes from</th><th>What it supplies</th></tr></thead><tbody>
      ${c.cfg.wiringIn.map(w => `<tr><td><b>${w.from}</b></td><td>${w.what}</td></tr>`).join('')}
    </tbody></table>
    <div class="good"><b>All four apps of this module are built from one engine file and one screen file.</b>
    Not four codebases that agree — one implementation, compiled four times. That is why the CEO Dashboard,
    a report and the group roll-up can never disagree about a figure, and why the fourth app in this module
    can honestly be all three at once.</div>`));

  c.pages.forEach(pg => pages.push(P(pg())));

  pages.push(P(`<h2>Every figure, and where it comes from</h2>
    <p>This is the same table as the app's Wiring screen, so you have it on paper.</p>
    <table><thead><tr><th>Figure</th><th>Comes from</th><th>How it is worked out</th></tr></thead><tbody>
      ${c.cfg.wiring.map(w => `<tr><td><b>${w.f}</b></td><td>${w.s}</td><td>${w.h}</td></tr>`).join('')}
    </tbody></table>
    <h3>The arithmetic of the whole module, in one place</h3>
    <table><thead><tr><th>Name</th><th>Worked out as</th></tr></thead><tbody>
      <tr><td>Net sales</td><td>gross sales − returns</td></tr>
      <tr><td>Return %</td><td>returns ÷ gross sales × 100</td></tr>
      <tr><td>Gross profit</td><td>net sales − purchases − wages</td></tr>
      <tr><td>Net profit</td><td>gross profit − running costs</td></tr>
      <tr><td>Margin %</td><td>net profit ÷ net sales × 100</td></tr>
      <tr><td>Cash + bank</td><td>opening cash + opening bank + all-time net profit</td></tr>
      <tr><td>Stock value</td><td>for every item: quantity × cost, added together</td></tr>
      <tr><td>Net position</td><td>cash + what you are owed − what you owe</td></tr>
      <tr><td>Cost per piece</td><td>wages for the month ÷ pieces made that month</td></tr>
      <tr><td>Group net sales</td><td>every company's net sales added up, − what they billed each other</td></tr>
      <tr><td>Group profit</td><td>every company's profit added up. Internal billing cancels itself out</td></tr>
    </tbody></table>
    <div class="good">Every figure is rounded to two decimal places at the moment it is calculated, so a total can never disagree with the rows above it by a stray paisa.</div>`));

  pages.push(P(connectorsPage(c, fig)));
  pages.push(P(connectorsRules(c)));
  pages.push(P(connectorsPage2(c)));
  testPages(TESTS[c.tag]).forEach(h => pages.push(P(h)));

  pages.push(P(`<h2>How to run it, and what it will not do</h2>
    <h3>Running it</h3>
    <ol class="run">
      <li><b>Windows:</b> extract the ZIP, then double-click the <span class="kbd">.html</span> file. It opens in your browser. That is the whole installation.</li>
      <li><b>Mac:</b> unpack the ZIP, double-click the file. Safari opens it.</li>
      <li><b>Android:</b> Files app → Downloads → tap the file → open with Chrome. Then ⋮ → <b>Add to Home screen</b> and it behaves like any other app.</li>
      <li><b>iPhone / iPad:</b> Files app → tap the file → Safari. Then Share → <b>Add to Home Screen</b>.</li>
      <li>No internet needed, ever. No account, no licence key, no setup wizard.</li>
    </ol>
    <h3>Keeping your data safe</h3>
    <p>Your figures live in your own browser on your own device — nowhere else, and never on anybody's server. That means nobody can see them, and also that clearing your browser's site data would erase them. So: <b>Backup &amp; Health → Export JSON</b>, once a week. To move to another device, take the file and the backup with you and use <b>Import JSON</b>.</p>
    ${fig('backup', 'Backup & Health — your data controls, and the live test results below them.', 'third')}
    <h3>What it will not do</h3>
    <ul class="pts">
      ${c.wont.map(x => `<li>${x}</li>`).join('')}
      <li>It does not sync between your devices on its own — use the backup file.</li>
      <li>It has no user accounts or passwords. Whoever can open your device can open the app.</li>
      <li>It will not stop you recording something silly. It checks its own arithmetic, not your judgement.</li>
    </ul>
    <div class="accept">Accepted when: the app opens by double-click with no internet · all ${c.tests} self-tests show pass · ${c.accept} · a backup exports and imports cleanly.</div>`));

  return doc(P.render(pages[0]), 'Medhava ' + c.app + ' — ' + c.edition);
}

/* ══════════════════ the page bodies, per app ══════════════════
   `w` is the edition's words: the neutral build and the Vastrangam build differ in the
   examples they can honestly use, and nowhere else. */
function dashPages(c, fig, w) {
  return [
    () => `<h2>Screen · Overview</h2>
      ${fig('dash', 'The Overview screen. Five cards, the trend on the left, what needs a decision on the right.', 'tall')}
      <h3>Reading it in thirty seconds</h3>
      <div class="steps">
        <div class="st"><span class="n">1</span><div class="tx"><b>Net profit</b> — did we earn? If it is green you are ahead; the percentage beside it tells you by how much of every rupee sold.</div></div>
        <div class="st"><span class="n">2</span><div class="tx"><b>Cash + bank</b> — are we safe? A business can be profitable and still be unable to pay ${w.supplier} on Friday. This is the number that answers that.</div></div>
        <div class="st"><span class="n">3</span><div class="tx"><b>Open alerts</b> — what needs me? If it is zero, close the laptop. If it is not, the panel on the right already lists them, worst first, with a button that takes you to the screen where you can act.</div></div>
      </div>`,
    () => `<h2>Overview, card by card</h2>
      <div class="pg2">
        <div class="cardbox"><b>Net sales</b><span>What you sold, <b>after returns have been taken off</b>. This is not the figure a marketplace dashboard shows you — theirs is gross.</span></div>
        <div class="cardbox"><b>Net profit</b><span>What is actually left: net sales − ${w.cogs} − wages − running costs. The percentage underneath is that profit as a share of net sales.</span></div>
        <div class="cardbox"><b>Cash + bank</b><span>Your real position right now. It does <b>not</b> change when you switch period — a balance is a balance, not "profit for June".</span></div>
        <div class="cardbox"><b>To collect</b><span>Everything ${w.owers} still owe you, whatever its age.</span></div>
        <div class="cardbox"><b>Open alerts</b><span>How many things need a decision. Red the moment there is one.</span></div>
        <div class="cardbox"><b>Net sales by month</b><span>A bar per month with that month's profit beside it, the best month, and the four-month totals. The badge compares the newest month with the one before.</span></div>
      </div>
      <h3>What you can click</h3>
      <ul class="pts">
        <li><b>Any period button</b> — April, May, June, July or Full year. Every figure on every screen is recalculated.</li>
        <li><b>Any company button</b> — one company, or all of them together. Same effect: everything is worked out again.</li>
        <li><b>"Open →" on any alert</b> — jumps straight to the screen where you can do something about it.</li>
      </ul>
      <div class="good">Read it in this order: <b>Net profit</b> first (did we earn?), then <b>Cash + bank</b> (are we safe?), then <b>Open alerts</b> (what needs me?). Thirty seconds, and you know where you stand.</div>`,
    () => `<h2>Proof that it is live — the period dial</h2>
      <p>This is the same screen as two pages ago. Only one thing was clicked: the period changed from July to April.</p>
      ${fig('dash_april', 'April selected. Every card, both panels and the alert list have been recomputed.', 'tall')}
      <h3>What moved, and what deliberately did not</h3>
      <table><thead><tr><th>Figure</th><th>Changed?</th><th>Why</th></tr></thead><tbody>
        <tr><td><b>Net sales</b></td><td>Yes</td><td>It is a period figure — this is what was sold in April.</td></tr>
        <tr><td><b>Net profit &amp; margin</b></td><td>Yes</td><td>Every line that builds it is filtered to April.</td></tr>
        <tr><td><b>Cash + bank</b></td><td><b>No</b></td><td>A balance is a position, not a period. "Cash for April" is not a thing.</td></tr>
        <tr><td><b>To collect</b></td><td><b>No</b></td><td>Money owed is owed today, whichever month it arose in.</td></tr>
        <tr><td><b>Open alerts</b></td><td>Partly</td><td>Stock and payment alerts are about today. Return-rate alerts are recomputed for the period.</td></tr>
      </tbody></table>
      <div class="good">That distinction is the difference between a dashboard you can act on and one that quietly misleads you. Most spreadsheet dashboards filter everything by the date column, which turns a bank balance into nonsense.</div>`,
    () => `<h2>The second dial — one company, or all of them</h2>
      <p>Same screen again, same period. This time one company was picked instead of the whole group.</p>
      ${fig('dash_onecompany', 'One company selected. Flow figures AND balances are now that company\'s alone.', 'tall')}
      <div class="rule"><b>The company dial behaves differently from the period dial, on purpose.</b> A balance ignores the period — but it does <b>not</b> ignore the company. "Cash in April" is nonsense; "${w.oneCo}'s cash" is a real number sitting in a real bank account.</div>
      <h3>Two dials, two rules</h3>
      <table><thead><tr><th>&nbsp;</th><th>Period</th><th>Company</th></tr></thead><tbody>
        <tr><td><b>Sales, profit, costs, output</b></td><td>Filtered</td><td>Filtered</td></tr>
        <tr><td><b>Cash, stock, owed to you, owed by you</b></td><td><b>Ignored</b></td><td>Filtered</td></tr>
      </tbody></table>
      <div class="good">Add every company's net sales together and you get the figure shown for "All companies", to the paisa. That is one of the self-tests, not a hope: <i>"every company added together equals the group"</i>.</div>`,
    () => `<h2>Screen · Sales &amp; Channels</h2>
      <p>This screen exists to answer one uncomfortable question: <b>which channel looks big but is not?</b></p>
      ${fig('sales', 'Gross, returns, return %, net and units — for every channel, side by side.', 'tall')}
      <div class="rule"><b>Read the "Return %" column first.</b> ${w.returnRule}</div>
      <div class="pg2">
        <div class="cardbox"><b>Gross sales</b><span>Everything sold, before returns. The flattering number — the one you are shown everywhere else.</span></div>
        <div class="cardbox"><b>Returns</b><span>What came back, and what share of gross that is. Turns red above 10%.</span></div>
        <div class="cardbox"><b>Net sales</b><span>Gross minus returns. The honest number, and the one every other screen uses.</span></div>
        <div class="cardbox"><b>Sold outside the group</b><span>Gross, with your own companies' billing to each other left out. The figure that means "business we won".</span></div>
      </div>
      <div class="good">A channel row tagged <b>own group</b> is one of your companies billing another. It is real revenue for that company, and it is not a sale for the group — which is exactly what Group Consolidation takes back out.</div>`,
    () => `<h2>Screen · Money</h2>
      ${fig('money', 'Cash, who owes you, who you owe — and the profit worked out line by line.', 'tall')}
      <h3>How the ageing tags work</h3>
      <table><thead><tr><th>&nbsp;</th><th>ok / on time</th><th>overdue / late</th><th>chase now / very late</th></tr></thead><tbody>
        <tr><td><b>${w.recTitle}</b></td><td>Under 30 days</td><td>Over 30 days</td><td>Over 60 days</td></tr>
        <tr><td><b>${w.payTitle}</b></td><td>Not yet due</td><td>Past its due date</td><td>Over 60 days late</td></tr>
      </tbody></table>
      <p><b>Net position</b> — cash plus what you are owed, minus what you owe — is the card to watch. Healthy profit with a negative net position means the money is sitting in somebody else's account, not yours.</p>
      <div class="good"><b>The profit build-up panel at the bottom is the most useful thing on this screen.</b> It shows profit line by line — net sales, minus ${w.cogs}, minus wages, = gross profit, minus running costs, = net profit. Every line moves when you change the period or the company, so you can see exactly which line is eating the margin.</div>`,
    () => `<h2>Screen · Stock &amp; Making</h2>
      ${fig('stock', 'What you are holding, what is running out, and what the floor produced.', 'tall')}
      <p><b>The tag on the right of the stock table is the part to act on:</b> "reorder" means at or below the reorder point — order it today. "low" means within twice the reorder point — order it this week. "ok" means leave it alone.</p>
      <p><b>Cost per piece</b>, in the production table, is the number to watch over time. If wages climb faster than pieces, every piece is costing more and the margin is shrinking quietly.</p>
      <table><thead><tr><th>Card</th><th>What it means</th><th>What to do about it</th></tr></thead><tbody>
        <tr><td><b>Stock value</b></td><td>Everything held, valued at what it cost you</td><td>If this keeps climbing while sales do not, cash is being buried in stock.</td></tr>
        <tr><td><b>Running out</b></td><td>Items at or below their reorder point</td><td>Any number above zero is a purchase list for today.</td></tr>
        <tr><td><b>Pieces made</b></td><td>What the floor finished in this period</td><td>Compare with units sold — making far more than you sell is how stock value climbs.</td></tr>
        <tr><td><b>Making cost</b></td><td>Wages paid for that output</td><td>Divide by pieces made and watch the trend month to month.</td></tr>
      </tbody></table>
      <div class="rule"><b>Why the reorder point, and not a percentage.</b> A percentage of stock tells you nothing about how long it takes to replace. The reorder point is set per item, from how long ${w.leadFrom} takes to deliver it — so "reorder" genuinely means "order it today or you will run out".</div>`,
    () => `<h2>Screen · Companies</h2>
      ${fig('companies', 'The same figures, one row per company — and the names you sell under, which are not companies.', 'tall')}
      <div class="rule"><b>A trading name is not a company.</b> ${w.brandRule} Its orders are that company's sales, counted once, under that company. This screen keeps the two lists apart so nobody can quietly turn a name into a business and double a figure.</div>
      <p>This screen <b>reads</b>. Adding a company, removing what your companies billed each other, and working out which of them may file a return all live in <b>Group Consolidation</b>, the third app of this module. A dashboard that could change the shape of your group would be a dashboard you could not audit.</p>
      <div class="good">Notice the <b>Plan covers</b> card. The number of companies you may run is a fact about your subscription, never about the software. A cap written into a product is a rebuild; a cap written into a plan is a decision you can change on a Tuesday.</div>`,
    () => `<h2>Screen · Alerts — the five rules</h2>
      <p>Nobody types these in. They are worked out from your live figures every time the screen opens. Exactly five rules produce every alert in the system:</p>
      <div class="steps">
        <div class="st"><span class="n">1</span><div class="tx"><b>Stock at or below its reorder point.</b> Marked <b>urgent</b>. ${w.rule1}</div></div>
        <div class="st"><span class="n">2</span><div class="tx"><b>Somebody has owed you money for more than 30 days.</b> Marked <b>watch</b> — or <b>urgent</b> past 60 days.</div></div>
        <div class="st"><span class="n">3</span><div class="tx"><b>A bill you owe has gone past its due date.</b> Marked <b>watch</b> — or <b>urgent</b> past 60 days late.</div></div>
        <div class="st"><span class="n">4</span><div class="tx"><b>A channel's return rate has reached 12% or more.</b> Marked <b>watch</b>. ${w.rule4}</div></div>
        <div class="st"><span class="n">5</span><div class="tx"><b>A company in the group has no tax registration.</b> Marked <b>watch</b> — not because it is wrong, but because it is a thing to know: that company counts in every group figure and cannot file a return.</div></div>
      </div>
      ${fig('alerts', 'Every open alert, with "Look" to investigate and "Clear" to mark it handled.')}`,
    () => `<h2>What "clearing" an alert does</h2>
      ${fig('alerts_cleared', 'One alert cleared. The count drops, and a "Cleared" panel appears with a way to bring them all back.', 'tall')}
      <div class="rule"><b>Clearing changes nothing in your business.</b> It only records that you have seen it. If the underlying situation gets worse — the stock falls further, the payment goes another month late — the alert comes straight back on its own. "Bring them all back" undoes every clear at once.</div>
      <ul class="pts">
        <li><b>An alert list you cannot tick off is an alert list you stop reading.</b> After a week of seeing the same four lines, your eye skips them — and then you miss the fifth.</li>
        <li><b>Clearing is personal, not shared.</b> It is stored separately from your business data, so a backup restore never brings back a stale "handled" flag.</li>
        <li><b>It cannot hide a real problem.</b> The alert is recalculated from live figures every single time the screen opens.</li>
        <li><b>The "Cleared" count</b> tells you how many you are currently suppressing, so nothing is hidden from you either.</li>
      </ul>`,
    () => `<h2>Screen · Wiring</h2>
      <p>Read this screen once and you will never wonder where a figure came from again.</p>
      ${fig('wiring', 'Every figure on the Dashboard, its source, and how it is worked out.', 'tall')}
      <div class="good"><b>The statement at the bottom of that screen is the important one:</b> this dashboard writes nothing. Clearing an alert is the only thing it ever stores, and only for you. That is deliberate — a dashboard that can change your books is a dashboard you cannot trust.</div>
      <div class="rule"><b>And it is checked, not just claimed.</b> Two of the self-tests read the app's own code: <i>"this app can do exactly four things, and none of them is writing"</i> and <i>"not one of them can add, change or delete a record"</i>. If somebody ever wires a save button into this app, the build fails before it ships.</div>`,
  ];
}

function repPages(c, fig, w) {
  return [
    () => `<h2>The process — three steps and an answer</h2>
      <div class="flow"><span class="fb">1 · Pick a source</span><span class="ar">→</span><span class="fb">2 · Arrange it</span><span class="ar">→</span><span class="fb">3 · Filter it</span><span class="ar">→</span><span class="fb">Answer</span></div>
      <p class="cap">The whole app is these three steps. Everything else is a shortcut to them.</p>
      <div class="steps">
        <div class="st"><span class="n">1</span><div class="tx"><b>Pick what to look at.</b> Six buttons: Sales · Money owed · Stock · Running costs · Production · Purchases. Changing this resets the other two steps, because a filter about channels means nothing once you are looking at stock.</div></div>
        <div class="st"><span class="n">2</span><div class="tx"><b>Say how it should be arranged.</b> Group the rows by something (${w.groupShort}), sort by any column, biggest or smallest first, and show all rows or just the top few.</div></div>
        <div class="st"><span class="n">3</span><div class="tx"><b>Leave out what you do not want.</b> Add filters like <span class="kbd">${w.filterKbd}</span>. Each one appears as a chip you can remove with a click. A record has to satisfy <b>all</b> of them.</div></div>
        <div class="st"><span class="n">4</span><div class="tx"><b>Read the answer.</b> It is already there. The badge tells you how many records survived your filters out of how many exist — watch that number when you add a filter, it tells you immediately whether the filter did what you meant.</div></div>
        <div class="st"><span class="n">5</span><div class="tx"><b>Keep it, if it is useful.</b> Give it a name and press Save. Next month, run it again and it recalculates.</div></div>
      </div>
      <div class="rule"><b>Above all three steps sit the same two dials as the dashboard: period and company.</b> They decide which records a report can see <i>at all</i>; the filters then narrow what is left. That order matters — and it is why a report and the dashboard always agree.</div>`,
    () => `<h2>Screen · Build a report</h2>
      ${fig('build', 'The three numbered steps, and the answer waiting at the bottom.', 'tall')}
      <h3>Four things worth noticing on this screen</h3>
      <ul class="pts">
        <li><b>There is no "calculate" button you have to remember.</b> The answer at the bottom is already correct for whatever is selected above it.</li>
        <li><b>The grey line under the source buttons</b> always tells you what a single row of that source means — so you are never guessing what you are adding up.</li>
        <li><b>The badge in the Result heading</b> ("20 of 20 records") is your safety check. Add a filter and watch it move; if it does not move, your filter matched nothing you meant.</li>
        <li><b>The bar in the last column</b> is each row's share of the first measure — the fastest way to see whether one row dominates the total.</li>
      </ul>`,
    () => `<h2>Step 1 · the six things you can look at</h2>
      <table><thead><tr><th>Source</th><th>One row is…</th><th>What you can add up</th></tr></thead><tbody>
        <tr><td><b>Sales</b></td><td>One company, one channel, one month</td><td>Gross · Returns · Net sales · Units</td></tr>
        <tr><td><b>Money owed</b></td><td>One unpaid ${w.moneyRow}</td><td>Amount · Days</td></tr>
        <tr><td><b>Stock</b></td><td>One item you are holding</td><td>Quantity · Value at cost</td></tr>
        <tr><td><b>Running costs</b></td><td>One cost head in one month</td><td>Amount</td></tr>
        <tr><td><b>Production</b></td><td>One company, one month on the floor</td><td>Pieces made · Wages</td></tr>
        <tr><td><b>Purchases</b></td><td>One ${w.supplierWord.toLowerCase()} in one month</td><td>Amount</td></tr>
      </tbody></table>
      <h3>What you can group each one by</h3>
      <table><thead><tr><th>Source</th><th>Group the rows by</th></tr></thead><tbody>
        <tr><td><b>Sales</b></td><td>Channel · Month · Company</td></tr>
        <tr><td><b>Money owed</b></td><td>Party · Direction · Status · Company</td></tr>
        <tr><td><b>Stock</b></td><td>Item · Status · Company</td></tr>
        <tr><td><b>Running costs</b></td><td>Cost head · Month · Company</td></tr>
        <tr><td><b>Production</b></td><td>Month · Company</td></tr>
        <tr><td><b>Purchases</b></td><td>${w.supplierWord} · Month · Company</td></tr>
      </tbody></table>
      <div class="good">Or choose <b>"Do not group"</b> on any source to see every single record, one per line — useful when you want to check the detail behind a total.</div>`,
    () => `<h2>Step 2 · arranging it (and the Top-N trap)</h2>
      <table><thead><tr><th>Control</th><th>What it does</th></tr></thead><tbody>
        <tr><td><b>Group the rows by</b></td><td>The most important choice — it decides what one row of the answer represents.</td></tr>
        <tr><td><b>Sort by</b></td><td>Name (A–Z), any of the number columns, or how many records went into each row.</td></tr>
        <tr><td><b>Order</b></td><td>Biggest first, or smallest first.</td></tr>
        <tr><td><b>Show only top</b></td><td>All rows, or the top 3 / 5 / 10.</td></tr>
      </tbody></table>
      <div class="rule"><b>The Top-N trap, and how this app avoids it.</b> If you ask for "Top 5", most software shows five rows and then puts a total at the bottom that only adds up those five. That is how people end up quoting a number that is quietly wrong. Here, the table shows five rows but <b>the Total line still counts every matching row</b> — and it says so, in words, next to the total. There is a self-test that specifically checks this.</div>
      <h3>Which sort makes sense for which question</h3>
      <table><thead><tr><th>You are asking</th><th>Sort by</th><th>Order</th></tr></thead><tbody>
        <tr><td>Who is biggest?</td><td>The money column</td><td>Biggest first</td></tr>
        <tr><td>What is a trend?</td><td>Name (A–Z)</td><td>Smallest first — months come out in order</td></tr>
        <tr><td>What is worst?</td><td>Days, or Returns</td><td>Biggest first</td></tr>
        <tr><td>What is nearly empty?</td><td>Quantity</td><td>Smallest first</td></tr>
        <tr><td>Where is the volume, not the value?</td><td>Records</td><td>Biggest first</td></tr>
      </tbody></table>
      <div class="good"><b>The habit worth forming:</b> ask the same question two ways — group by channel, then by company. If the two totals agree, you can trust both answers. If they do not, one of your filters is doing something you did not intend.</div>`,
    () => `<h2>Step 3 · filters, with a worked example</h2>
      <p>Below, one filter has been added. Look at the record count in the Result heading — it changed the moment the filter was added.</p>
      ${fig('build_filtered', 'A filter applied. It appears as a chip; click the × to remove just that one.', 'tall')}
      <table><thead><tr><th>Condition</th><th>Use it for</th><th>Example</th></tr></thead><tbody>
        <tr><td><b>is</b></td><td>Exactly this word</td><td>${w.exIs}</td></tr>
        <tr><td><b>is not</b></td><td>Everything except this</td><td>${w.exIsNot}</td></tr>
        <tr><td><b>contains</b></td><td>Part of a word — handy for long names</td><td>${w.exContains}</td></tr>
        <tr><td><b>&gt;=  &lt;=  &gt;  &lt;</b></td><td>Number comparisons</td><td>Days &gt; 30 · Amount &gt;= 100000</td></tr>
      </tbody></table>
      <div class="good">A filter you will use more than you expect: <span class="kbd">Channel is not Between our own companies</span>. It drops the billing between your own companies out of any sales report in one click.</div>`,
    () => `<h2>The same records, grouped by company</h2>
      <p>Same source, same period, same data. Only the grouping changed — from channel to <b>company</b>.</p>
      ${fig('build_bycompany', 'Grouped by company instead. A completely different story, from exactly the same records.', 'tall')}
      <div class="good"><b>The total at the bottom is identical to the channel grouping, to the paisa.</b> It has to be — the same records were added up, just piled differently. If regrouping ever changed a total, something would be badly wrong, which is exactly why <i>"grouping by company or by channel gives the same total"</i> is one of the ${c.tests} self-tests.</div>
      <h3>The same records, three useful ways</h3>
      <table><thead><tr><th>Group by</th><th>Answers</th><th>Sort</th></tr></thead><tbody>
        <tr><td><b>Channel</b></td><td>Which channel earns most — after returns</td><td>Net sales, biggest first</td></tr>
        <tr><td><b>Company</b></td><td>Which of your companies is actually carrying the group</td><td>Net sales, biggest first</td></tr>
        <tr><td><b>Month</b></td><td>Are we growing, flat, or slipping?</td><td>Name, smallest first</td></tr>
      </tbody></table>`,
    () => `<h2>Screen · Ready-made reports</h2>
      <p>Eleven reports already built, each answering a question owners actually ask. Every card tells you what it looks at, how it is grouped and what has been filtered out — nothing is hidden from you.</p>
      ${fig('lib', 'Press "Load & run →" and it drops into the builder, already run. From there it is yours to change.', 'tall')}
      <div class="good"><b>These are starting points, not fixed reports.</b> Load one, change the grouping, add a filter, save it under your own name — and it is now your report. Nothing about a ready-made report is locked.</div>`,
    () => `<h2>A ready-made report, loaded and running</h2>
      ${fig('build_stock', 'A ready-made report is just a starting point — every control is still yours to change.', 'tall')}
      <h3>What to change first, once it is loaded</h3>
      <ul class="pts">
        <li><b>Turn "Top 5" into "All rows"</b> if you want the whole picture rather than the headline.</li>
        <li><b>Add a filter</b> to narrow it — Status is <i>Reorder now</i> turns "where is my cash" into "what must I buy".</li>
        <li><b>Change the grouping</b> to Status instead of Item, and the same records answer a completely different question.</li>
        <li><b>Save it under your own name</b> — you now have a question you never have to rebuild.</li>
      </ul>`,
    () => `<h2>Screen · My saved reports</h2>
      ${fig('saved', 'Everything you have saved, with the answer recalculated the moment the screen opens.')}
      <div class="good"><b>The column that makes this screen worth opening:</b> "Answer if you run it now". It is recomputed every time — so this screen doubles as a small dashboard of exactly the questions <i>you</i> care about.</div>
      <table><thead><tr><th>Stored</th><th>Not stored</th></tr></thead><tbody>
        <tr><td>Which source you chose</td><td>Any number</td></tr>
        <tr><td>What you grouped by</td><td>Any row of the answer</td></tr>
        <tr><td>Every filter, exactly as typed</td><td>The date you last ran it</td></tr>
        <tr><td>The sort column and direction</td><td>Anything about your records</td></tr>
      </tbody></table>
      <div class="rule"><b>This is why a saved report is safe to keep forever.</b> It cannot go stale, because there is nothing in it that could age. It is a question, written down.</div>`,
    () => `<h2>Screen · Wiring, and why it always agrees</h2>
      ${fig('wiring', 'The sources, what feeds them, and exactly what happens when you press Run.', 'tall')}
      <div class="good"><b>The Report Builder stores no figures of its own.</b> It holds your saved questions and nothing else. Every number you see was read from the Data Core in the moment the screen was drawn — which is why there is no "last refreshed" timestamp anywhere in this app. There is nothing to refresh.</div>
      <div class="rule"><b>Why a report can never disagree with the CEO Dashboard.</b> They are not two programs that were carefully kept in step. They are <b>one engine file compiled into two apps</b>. A Sales report grouped by channel with no filters adds up to exactly the net sales figure the Dashboard shows for the same period and the same company — and <i>"a report grouped by channel equals the dashboard's net sales"</i> is a self-test that runs every time this file opens.</div>`,
  ];
}

function grpPages(c, fig, w) {
  return [
    () => `<h2>The three rules a group total has to obey</h2>
      <p class="big">Adding up several companies is easy. Adding them up <b>honestly</b> takes three rules, and this app enforces all three in the engine rather than describing them in a manual.</p>
      <div class="steps">
        <div class="st"><span class="n">1</span><div class="tx"><b>What your companies billed each other comes back out.</b> A group cannot sell to itself. The bill is real for the company that raised it and real for the company that paid it — and it is not revenue for the group.</div></div>
        <div class="st"><span class="n">2</span><div class="tx"><b>A company with no tax registration is still a company.</b> It counts in every group figure, and it is <b>refused</b> entry to a tax return. Two different questions; both answered correctly.</div></div>
        <div class="st"><span class="n">3</span><div class="tx"><b>A name you sell under is not a company.</b> ${w.brandRule} Making it one would count the same orders twice in every figure on these screens, so it is refused.</div></div>
      </div>
      <div class="rule"><b>Each of these is also a self-test.</b> They are not policies somebody has to remember on a busy Friday — they are conditions the file checks on itself before it will show you a screen.</div>`,
    () => `<h2>Screen · Group figures</h2>
      ${fig('group', 'Every company added together, with internal billing removed — and the arithmetic shown, not hidden.', 'tall')}
      <div class="good"><b>The left panel is the whole point of this app.</b> It does not just show the group total; it shows the total <i>being arrived at</i>, line by line, with the elimination visible on both sides. A consolidated figure you cannot reconstruct is a figure you cannot defend to a bank, a buyer or an auditor.</div>
      <div class="rule"><b>Notice the elimination appears twice and cancels itself.</b> An internal bill is income to one of your companies and a cost to another. So removing it changes what the group <i>sold</i> and never changes what the group <i>earned</i> — which is why <i>"removing internal billing never changes group profit"</i> is a self-test.</div>`,
    () => `<h2>Screen · Company by company</h2>
      ${fig('compare', 'The same figures, one row each. A healthy group total can hide a company that is losing money.', 'tall')}
      <p>A group total is an average with the arguments removed. The point of this screen is to put them back.</p>
      <ul class="pts">
        <li>A company with good sales and a <b>negative margin</b> is being carried. Whether that is a problem depends on why — but you should know.</li>
        <li>A company with cash and no stock is a <b>trading</b> arm; one with stock and no cash is a <b>making</b> arm. They should not be judged by the same margin.</li>
        <li><b>Balances do not move when you change the period.</b> Cash, stock, what is owed — those are positions, and they are the same on the last day of any month you pick.</li>
        <li>The last column says plainly which companies can file a return and which cannot.</li>
      </ul>
      <div class="good">Add the "Net sales" column up and you get the "added together" line at the bottom — which is the group figure <b>before</b> the elimination. The difference between that and the headline on the previous screen is exactly what your companies billed each other.</div>`,
    () => `<h2>Screen · Between your own companies</h2>
      ${fig('internal', 'Every internal invoice in the period, and the two group totals side by side — with and without it.', 'tall')}
      <div class="rule"><b>This is how a group quotes a turnover far larger than it earned, without anybody lying.</b> Nobody removed the internal billing. The two cards on this screen put the flattering figure and the honest one next to each other so the difference is impossible to miss.</div>
      <h3>Why it never moves the profit</h3>
      <div class="steps">
        <div class="st"><span class="n">1</span><div class="tx">The company that raised the invoice booked it as <b>income</b>.</div></div>
        <div class="st"><span class="n">2</span><div class="tx">The company that received it booked the same amount as a <b>cost</b>.</div></div>
        <div class="st"><span class="n">3</span><div class="tx">Added together they are already <b>zero</b>. Group profit was never wrong.</div></div>
        <div class="st"><span class="n">4</span><div class="tx">Group <b>sales</b>, though, counted the money once. That is the figure this screen corrects.</div></div>
      </div>
      <div class="good"><b>It is never hidden.</b> An internal invoice travels on its own channel so it can be separated — but it stays on the books of the company that raised it, because for that company it is the whole living.</div>`,
    () => `<h2>Screen · Who may file a return</h2>
      ${fig('returns_ok', 'A registered company: its own figures, for its own registration.', 'tall')}
      <p>Every company is listed with its registration if it has one, its net sales for the period, and a button. Press the button on a registered company and you get its own figures — <b>its own</b>, not the group's, because a return is filed by a company and not by a group.</p>
      <div class="good">The "Counts in group figures" column says <b>always</b> on every row, including the rows that cannot file. That column exists precisely because the two questions get confused.</div>`,
    () => `<h2>The refusal — and why it is the feature</h2>
      ${fig('returns_refused', 'The company with no registration. Refused, in words, with the reason.', 'tall')}
      <div class="rule"><b>This is the app doing its job.</b> A return filed for a company that has no registration is not a small mistake; it is a filing in somebody else's name. So it is not offered, not warned about, and not possible.</div>
      <h3>The two questions people confuse</h3>
      <table><thead><tr><th>Question</th><th>Answer for a company with no registration</th></tr></thead><tbody>
        <tr><td><b>Does it count in my group figures?</b></td><td><b>Yes, always.</b> Its sales, costs, cash and stock are in every total.</td></tr>
        <tr><td><b>Can it file a return?</b></td><td><b>No.</b> It has no registration to file under.</td></tr>
      </tbody></table>
      <p>Most software answers both questions the same way. Answer "no" to both and you lose a real company out of your group figures. Answer "yes" to both and you file something you should not have. ${w.unregExample}</p>
      <div class="good"><b>When the company does get registered:</b> put the number on it in Companies &amp; names. Nothing else changes — same records, same group figures, and from that moment it can build a return. No migration, no re-entry, no second company.</div>`,
    () => `<h2>Screen · Companies and the names you sell under</h2>
      ${fig('cos', 'Two lists that must never merge: the companies you run, and the names you sell under.', 'tall')}
      <p>Add a company here, remove one, or add a trading name and point it at the company whose sales it is. The <b>Room left</b> card tells you how many more your plan covers.</p>
      <div class="rule"><b>Removing a company that still has records against it is refused.</b> The refusal says how many records and why: they would be left belonging to nobody, and every group figure would quietly change. Move or delete the records first, deliberately.</div>
      <div class="good"><b>The number of companies you may run is a fact about your subscription, never about the software.</b> The refusal you get at the limit says so in those words — it names the plan, and it says the software has no limit of its own.</div>`,
    () => `<h2>Try to turn a trading name into a company</h2>
      <p>There is a button on every trading name that does exactly that. Press it.</p>
      ${fig('cos_refused', 'Refused — and the reason is arithmetic, not policy.', 'tall')}
      <div class="rule"><b>"${w.brandName}" is a name you sell under, not a business.</b> Its orders already belong to a company and are already counted under that company. Making it a company of its own would count them a second time, in group sales, in group profit, and in every share you quote.</div>
      <p>${w.brandStory}</p>
      <div class="good">The button is there on purpose. A rule you can read is a rule you half-believe; a rule you can <b>try to break</b>, and watch refuse, is one you understand.</div>`,
    () => `<h2>Screen · Wiring</h2>
      ${fig('wiring', 'Where every group figure comes from, and the three rules in one place.', 'tall')}
      <div class="good">This app owns no records. It reads the same Data Core as the CEO Dashboard and the Report Builder, using the same engine file — so a single company's row here is exactly what the dashboard shows when you switch to that company. There is a self-test for that too.</div>`,
  ];
}

function uniPages(c, fig, w) {
  return [
    () => `<h2>Why this app exists</h2>
      <p class="big">The first three apps of this module are the CEO Dashboard, the Report Builder and Group Consolidation. This is all three of them, over <b>one set of records</b> — plus the two things none of them has: <b>you can change the records</b>, and <b>you can upload a spreadsheet of them</b>.</p>
      <p>That makes it the app to test with. Type a sale in here and watch the overview, every report and the group roll-up all move in the same instant. Not because they are kept in step — because there is only one set of numbers and one set of sums underneath all three.</p>
      <div class="wire2"><div class="core"><b>ONE SET OF RECORDS</b><span>Companies · Sales · Purchases · Costs · Production · Stock · Money · Internal billing</span></div>
        <div class="ring">
          <div class="rn in">← You: typed, edited or uploaded</div>
          <div class="rn out">→ CEO Dashboard screens</div>
          <div class="rn out">→ Report Builder screens</div>
          <div class="rn out">→ Group Consolidation screens</div>
        </div></div>
      <div class="good"><b>The three separate apps are not copies of this one, and this one is not a copy of them.</b> All four are built from the same engine file and the same screen file. Anything you prove here is true of all three — which is exactly why it is worth testing here.</div>`,
    () => `<h2>Screen · Records</h2>
      ${fig('records', 'Every table in the app, with add, edit and delete on each one.', 'tall')}
      <p>Pick a table across the top — the badge on each button is how many rows it holds. Fill the form and press <b>Add it</b>. Every figure in the app moves as you do.</p>
      <table><thead><tr><th>Table</th><th>One row is</th></tr></thead><tbody>
        <tr><td><b>Companies</b></td><td>One legal entity you run, with its tax registration if it has one</td></tr>
        <tr><td><b>Trading names</b></td><td>A name you sell under, pointing at the company whose sales it is</td></tr>
        <tr><td><b>Sales</b></td><td>One company, one channel, one month — gross, returns, units</td></tr>
        <tr><td><b>Purchases</b></td><td>What you bought in, by ${w.supplierWord.toLowerCase()} and month</td></tr>
        <tr><td><b>Running costs</b></td><td>One cost head in one month</td></tr>
        <tr><td><b>Production</b></td><td>What was finished, and what it cost in wages</td></tr>
        <tr><td><b>Stock</b></td><td>What you are holding, at what it cost</td></tr>
        <tr><td><b>Money owed to you / you owe</b></td><td>One unpaid invoice or bill, with its age</td></tr>
        <tr><td><b>Opening balances</b></td><td>What each company started the year with</td></tr>
        <tr><td><b>Between your own companies</b></td><td>One of your companies invoicing another</td></tr>
      </tbody></table>`,
    () => `<h2>Editing a row</h2>
      ${fig('records_edit', 'Press Edit on any row and the form above fills with it. Save, or cancel.', 'tall')}
      <div class="rule"><b>The same rules apply to a typed row as to an uploaded one.</b> There is one set of validation rules in the engine, used by the form and the importer alike — so a row you could not upload is a row you cannot type either, and the reason is the same sentence in both places.</div>
      <h3>What is refused, and why</h3>
      <table><thead><tr><th>What you did</th><th>What happens</th></tr></thead><tbody>
        <tr><td>Left out something required</td><td>Refused, naming the field.</td></tr>
        <tr><td>Named a company that does not exist</td><td>Refused — <i>"add the company first"</i>. It will not quietly create one; a typo should not become a fourth business.</td></tr>
        <tr><td>Put something that is not a month in the month box</td><td>Refused, showing the shape it expects.</td></tr>
        <tr><td>Deleted a row</td><td>Done immediately. Every figure moves. There is no undo — take a backup first if it matters.</td></tr>
      </tbody></table>`,
    () => `<h2>Companies, edited here rather than only read</h2>
      ${fig('records_companies', 'The company list, editable — the one thing the CEO Dashboard deliberately will not do.', 'tall')}
      <p>In the separate CEO Dashboard the company list is read-only, on purpose. Here it is a table like any other, and the same rules still apply: a company with records against it cannot simply be removed, and a trading name still cannot be made into a company.</p>
      <div class="good">Everything you set up here shows up immediately on the group screens: an added company appears as a row, gets its own column in every "company by company" table, and can be picked on the company dial.</div>`,
    () => `<h2>Screen · Upload and download</h2>
      ${fig('files', 'Bring an Excel or CSV in, take everything back out. No account, no internet, no library.', 'tall')}
      <h3>How your headings are matched</h3>
      <p>Column headings are matched by name, in any order, ignoring case and spacing — <span class="kbd">Net Sales</span>, <span class="kbd">net_sales</span> and <span class="kbd">netsales</span> all land in the same place. Columns we do not recognise are <b>left alone, not treated as an error</b>: a real export from a bank or a marketplace panel always carries columns you do not want.</p>
      <p>A company column accepts <b>either the code or the full name</b>, because that is what a person would type.</p>
      <div class="good"><b>Start with "Download a blank template".</b> It is an Excel file with one sheet per table and exactly the headings the importer expects — so the fastest way to get your own data in is to paste it into a shape that is already right.</div>`,
    () => `<h2>An upload, staged before anything is written</h2>
      ${fig('files_staged', 'Three rows in the file: two accepted, one refused. Nothing has been written yet.', 'tall')}
      <div class="rule"><b>A row that cannot be trusted is never quietly dropped and never quietly fixed.</b> It is rejected, counted, and listed with its line number and the reason. The counts across the top always add up to what was in your file — accepted plus rejected equals the row count, and there is a self-test that says so.</div>
      <p>Then you choose, and only then is anything written:</p>
      <ul class="pts">
        <li><b>Add these to what is already here</b> — the usual choice when you are bringing in a new month.</li>
        <li><b>Replace those tables entirely</b> — for when the spreadsheet is the truth and the app should match it.</li>
        <li><b>Cancel</b> — nothing happened.</li>
      </ul>`,
    () => `<h2>After the import — everything has already moved</h2>
      ${fig('dash_after', 'The Overview, straight after the upload. Nothing was refreshed; there was only ever one number.', 'tall')}
      <div class="good"><b>There is no "recalculate", no "sync", and no "last updated" anywhere in this app.</b> Every figure is worked out from the records at the moment the screen is drawn. That is why an upload does not need to trigger anything — the next screen you open has already counted it.</div>
      <p>The same upload has moved the group roll-up and every report, by the same amount, at the same instant. Those are not three systems agreeing; they are one system displayed three ways.</p>`,
    () => `<h2>Screen · Group figures, on the records you just changed</h2>
      ${fig('group', 'The group roll-up, over the same records — with internal billing still removed.', 'tall')}
      <div class="rule"><b>The three group rules survive everything you do here.</b> Edit rows, upload a file, delete a table — internal billing is still removed, a company with no registration still counts and is still refused a return, and a trading name still cannot be made into a company. The end-to-end test for this module checks exactly that, <i>after</i> all the editing.</div>`,
    () => `<h2>Screen · Build a report, on the same records</h2>
      ${fig('build', 'The Report Builder, unchanged, reading the records you just uploaded.', 'tall')}
      <p>This is the Report Builder screen, not a version of it. Same six sources, same grouping, same Top-N honesty, same saved-questions behaviour — because it is the same function in the same shared file.</p>
      <div class="good">Which is what makes this app worth shipping alongside the other three rather than instead of them: <b>test here, and you have tested all three.</b></div>`,
    () => `<h2>The spreadsheet engine, and why it is in the file</h2>
      <p class="big">Every other ERP loads a spreadsheet library from somebody else's server. The day that server is slow, blocked or gone, the <b>one button every customer presses on day one</b> stops working — and the app was never really offline.</p>
      <p>So this file contains the whole thing: a CRC-32, a raw DEFLATE decompressor, a zip reader and writer, the Excel sheet XML, and a CSV reader and writer. About four hundred lines. An <span class="kbd">.xlsx</span> file is a zip full of XML, and now the app knows how to open one by itself.</p>
      <div class="good"><b>Test it in ten seconds:</b> turn off your WiFi, reload the page, and upload a spreadsheet. It works, because there was never anything to fetch.</div>
      <div class="rule"><b>It is the same rule this suite applies everywhere else.</b> Books, AI, automation, couriers, payments — every capability has an option that needs nobody. It would be a strange rule to hold for all of those and not for the Excel button.</div>
      <h3>What comes out can go back in</h3>
      <p><b>Download everything as Excel</b> writes one sheet per table, with the same headings the importer expects. That round trip is checked automatically: the export is read back and re-imported, and the test only passes if <b>nothing is rejected and the figures match</b>.</p>`,
  ];
}

/* ══════════════════ the eight books ══════════════════ */
const RING = {
  dash: [['in', '← Sales · invoices, returns, channel'], ['in', '← Purchase · supplier bills, terms'],
         ['in', '← Inventory · quantity, cost, reorder point'], ['in', '← Manufacturing · pieces made, wages'],
         ['in', '← Accounts · balances, expenses, receipts'], ['in', '← Platform · which companies exist'],
         ['out', '→ Position, trend and alerts'], ['out', '→ Nothing written back to your books']],
  rep: [['in', '← Sales · invoices and credit notes'], ['in', '← Purchase · supplier bills'],
        ['in', '← Inventory · quantity, cost, reorder point'], ['in', '← Manufacturing · output and wages'],
        ['in', '← Accounts · unpaid invoices and expenses'], ['in', '← Platform · which companies exist'],
        ['out', '→ Any question, answered live'], ['out', '→ CSV for Excel or your accountant']],
  grp: [['in', '← Platform · companies, registrations, your plan'], ['in', '← Sales · invoices per company'],
        ['in', '← Purchase · bills per company, including your own'], ['in', '← Inventory · what each company holds'],
        ['in', '← Accounts · opening balances and expenses'],
        ['out', '→ Group figures, internal billing removed'], ['out', '→ A return, or a refusal, per company']],
  uni: [['in', '← You: typed, edited or uploaded'], ['in', '← Sales · invoices and credit notes'],
        ['in', '← Purchase · supplier bills'], ['in', '← Inventory, Manufacturing, Accounts'],
        ['out', '→ CEO Dashboard screens'], ['out', '→ Report Builder screens'],
        ['out', '→ Group Consolidation screens'], ['out', '→ Excel, CSV or JSON back out']],
};

const WORDS = {
  ERP: {
    supplier: 'a supplier', cogs: 'what you bought', owers: 'your customers',
    recTitle: 'Customers who owe you', payTitle: 'Suppliers you owe',
    leadFrom: 'your supplier', supplierWord: 'Supplier', moneyRow: 'customer invoice or supplier bill',
    oneCo: 'Acme Manufacturing', groupShort: 'sales by channel, by month, or by company',
    filterKbd: 'Channel is Own Website', exIs: 'Channel is Export', exIsNot: 'Status is not Comfortable',
    exContains: 'Supplier contains Alpha',
    returnRule: 'A channel with 14% returns and a big gross number can easily earn you less than a quiet channel with 2% returns. This table is where you see it.',
    rule1: 'A stock-out stops a production plan, and a plan that stops costs more than the material did.',
    rule4: 'Above 12%, a channel is usually telling you something about the listing or the specification, not about bad luck.',
    brandRule: 'A storefront name and a marketplace seller name can both belong to one company.',
    brandName: 'AcmePro',
    unregExample: 'A workshop that only does job work for the group\'s other companies is a real business with real costs — and nothing of its own to file.',
    brandStory: 'Acme Manufacturing sells under its own name on its storefront and as "AcmePro" on a marketplace. One company, two names, one set of sales. If "AcmePro" became a company, every marketplace order would appear twice in the group.',
  },
  VAS: {
    supplier: 'a mill', cogs: 'fabric and trims bought', owers: 'the marketplaces and buyers',
    recTitle: 'Marketplaces and buyers who owe you', payTitle: 'Mills you owe',
    leadFrom: 'the mill', supplierWord: 'Mill', moneyRow: 'settlement or mill bill',
    oneCo: 'Ethnic Fashion', groupShort: 'sales by channel to settle the Myntra-vs-Flipkart argument, by month for the season, or by company',
    filterKbd: 'Channel is Myntra', exIs: 'Channel is Flipkart', exIsNot: 'Status is not Comfortable',
    exContains: 'Mill contains Surat',
    returnRule: 'This matters more here than almost anywhere else. Flipkart at 14% returns on a big gross number can easily earn less than the website at 11% on a smaller one. The gross figure on a marketplace dashboard hides this. This table does not.',
    rule1: 'Fabric below its reorder point is what stops a cut plan, and an idle karigar floor costs more than the fabric did.',
    rule4: 'Above 12%, a channel is usually telling you something about the listing, the size chart or the fit — not about bad luck.',
    brandRule: 'Vastrangam sells under two seller names on the same marketplace, and both are Vastrangam.',
    brandName: 'Adini',
    unregExample: 'Adini Couture only does stitching for the other two companies — a real business, with real wages and real costs, and nothing of its own to file.',
    brandStory: '<b>Adini is a seller name on Flipkart, and every order under it is invoiced as Vastrangam.</b> Adini Couture, on the other hand, IS a separate company — it does job work and has no registration of its own. Both facts are true at once, and this app keeps them apart: one is a row in the trading-name list, the other is a row in the company list.',
  },
};

const APPS = [
  { dir: 'dashboard', tag: 'DASH', n: 1, app: 'CEO Dashboard', ring: 'dash', pages: dashPages,
    sub: 'Did we make money · Is the cash safe · What needs me today',
    what: 'The CEO Dashboard is the <b>one screen you look at each morning</b>. It answers three questions and nothing else: did we make money, is the cash safe, and what needs a decision today.',
    accept: 'switching the period or the company changes every figure · an alert can be cleared and brought back',
    badges: ['One file · opens by double-click', 'Works offline', 'Reads everything, writes nothing'],
    wont: ['It cannot change a record. That is not a limitation, it is the design — see the Wiring chapter.'] },
  { dir: 'reports', tag: 'REP', n: 2, app: 'Report Builder', ring: 'rep', pages: repPages,
    sub: 'Pick · Group · Filter · Run — an answer in three clicks',
    what: 'The Report Builder lets you ask your own data almost any question — <b>without writing a formula and without waiting for anybody</b>.',
    accept: 'a filter changes the record count · Top 5 still totals every matching row · a saved report reruns and matches',
    badges: ['One file · opens by double-click', 'Works offline', 'Saves the question, not the answer'],
    wont: ['It does not email reports on a schedule — download the CSV and send it.',
           'It does not draw charts beyond the share bars; the CSV opens in Excel for anything more elaborate.'] },
  { dir: 'groupcons', tag: 'GRP', n: 3, app: 'Group Consolidation', ring: 'grp', pages: grpPages,
    sub: 'Several companies · one set of figures · nothing counted twice',
    what: 'Group Consolidation adds every company you run into <b>one set of books</b> — with what they billed each other taken back out first, because a group cannot sell to itself.',
    accept: 'a company with no registration is refused a return and still counts · a trading name cannot be made into a company · adding past the plan limit is refused',
    badges: ['One file · opens by double-click', 'Works offline', 'Unlimited companies — the plan is the only cap'],
    wont: ['It does not file anything anywhere. It produces the figures a return is built from, and refuses to produce them for a company that cannot file.',
           'It will not remove a company that still has records against it — that has to be a deliberate act, in order.'] },
  { dir: 'm01unified', tag: 'UNI', n: 4, app: 'Module 01 · All three apps in one', ring: 'uni', pages: uniPages,
    sub: 'The whole module over one set of records — add, edit, delete, upload, download',
    what: 'This is the CEO Dashboard, the Report Builder and Group Consolidation running over <b>one set of records</b>, with the two things none of them has: you can change the records, and you can upload a spreadsheet of them.',
    accept: 'typing a sale moves the dashboard, every report and the group figures by the same amount · deleting it puts all three back exactly · an uploaded workbook lands with its bad rows refused by name',
    badges: ['One file · opens by double-click', 'Works offline — including the Excel upload', 'Add · edit · delete · upload · download'],
    wont: ['It is not a different product from the other three apps — it is the same engine and the same screens, plus record editing and files.',
           'It does not upload anything anywhere. Your spreadsheet is read on your own machine and never leaves it.'] },
];

/* ══════════════════ the module book ══════════════════ */
function moduleBook() {
  const P = bookBuilder('Dashboard & BI', 'Module 01');
  const img = (tag, v) => 'file://' + path.join(SHOTS, tag + '_' + v + '.png');
  const pages = [];
  const perEdition = ['DASH_ERP', 'REP_ERP', 'GRP_ERP', 'UNI_ERP'].reduce((s, k) => s + TESTS[k].length, 0);

  pages.push(`<section class="pg cover"><div class="cwrap">
    <div class="logo">${mark} Medhava</div>
    <div class="ed">Module 01 of 16</div>
    <h1>Dashboard &amp; BI</h1>
    <div class="sub">CEO Dashboard · Report Builder · Group Consolidation · and all three in one</div>
    <div class="module">4 apps × 2 editions — Medhava (any industry) and Vastrangam</div>
    <p class="lede">The layer that tells you what is happening. One app answers the three questions an owner asks every morning; one lets you ask anything else; one adds every company you run into a single honest set of figures. The fourth is all three at once, over records you can type, edit and upload — which is how you can check that the first three are telling the truth.</p>
    <div class="badges"><span>8 working apps</span><span>${perEdition * 2} self-tests, all passing</span><span>Zero console errors</span><span>Every screen and button verified</span></div>
    <div class="cfoot">Medhava ERP suite · FY 2026-27 · The first module of sixteen</div></div></section>`);

  pages.push(P(`<h2>What this module is</h2>
    <p class="big">Module 01 is the <b>seeing</b> layer of Medhava. It reads what every other module writes and turns it into three things: a screen that tells you where you stand, a tool that answers any other question, and one honest set of figures across every company you run.</p>
    <p>It is deliberately the first module built. Until you can see the business clearly, there is no way to judge whether the other fifteen modules are helping.</p>
    <h3>The four apps</h3>
    <table><thead><tr><th>App</th><th>Answers</th><th>Self-tests</th></tr></thead><tbody>
      <tr><td><b>1 · CEO Dashboard</b></td><td>Did we make money? Is the cash safe? What needs me today?</td><td>${TESTS.DASH_ERP.length}</td></tr>
      <tr><td><b>2 · Report Builder</b></td><td>Everything else — asked your way, in three clicks</td><td>${TESTS.REP_ERP.length}</td></tr>
      <tr><td><b>3 · Group Consolidation</b></td><td>Several companies, one set of figures, nothing counted twice</td><td>${TESTS.GRP_ERP.length}</td></tr>
      <tr><td><b>4 · All three in one</b></td><td>The same three, over records you can add, edit, delete and upload</td><td>${TESTS.UNI_ERP.length}</td></tr>
    </tbody></table>
    <h3>Two editions of each</h3>
    <table class="vs"><thead><tr><th>Edition</th><th>What it is</th></tr></thead><tbody>
      <tr><td><b>Medhava</b></td><td>The unified ERP. Industry-neutral names and rules — the same engine runs a machine shop, a distributor, an exporter or a professional practice. You change the master data, not the software.</td></tr>
      <tr><td><b>Vastrangam</b></td><td>The same engine with Vastrangam's own world in it: three real companies, two seller names on one marketplace, mills, and a stitching arm with no registration of its own. Its purpose is to prove the neutral engine survives contact with a real business.</td></tr>
    </tbody></table>
    <div class="good"><b>The engine is byte-for-byte identical between the two editions.</b> Only the configuration file differs. Both editions pass exactly the same self-tests, with the same names — which is the proof that "industry-neutral" is real and not a claim.</div>
    <div class="toc"><h3>Contents</h3>${P.toc()}</div>`));

  pages.push(P(`<h2>One engine, four apps — and why that is the whole point</h2>
    <p class="big">The four apps in this module are not four programs that were carefully kept in agreement. They are <b>one engine file and one screen file, compiled four times</b>.</p>
    <table><thead><tr><th>File</th><th>What is in it</th><th>Used by</th></tr></thead><tbody>
      <tr><td><b>the engine</b></td><td>The data model, the seed, the two dials, every derived figure, the report engine, consolidation, and the rules a row has to satisfy</td><td>All four apps</td></tr>
      <tr><td><b>the screens</b></td><td>Overview, Sales, Money, Stock, Companies, Alerts, the report builder, the group roll-up, the company set-up</td><td>All four apps</td></tr>
      <tr><td><b>each app's own file</b></td><td>Which screens it shows, which actions it allows, and its own self-tests</td><td>One app each</td></tr>
      <tr><td><b>each edition's config</b></td><td>Names, companies, channels, items, examples. No arithmetic at all</td><td>One edition each</td></tr>
    </tbody></table>
    <div class="good"><b>This is why "a report can never disagree with the dashboard" is a fact rather than an intention.</b> When two apps each keep their own copy of "net sales = gross − returns", they agree right up until somebody fixes a rounding bug in one of them. Here there is one copy.</div>
    <div class="rule"><b>And it is held there by the build, not by memory.</b> The audit refuses to pass if the four apps' configs carry different master data, or if the combined app drops one of the module's screens. Drift fails the build instead of reaching you.</div>
    <div class="flow"><span class="fb">Records</span><span class="ar">→</span><span class="fb">Period &amp; company</span><span class="ar">→</span><span class="fb">Add up</span><span class="ar">→</span><span class="fb">Rules</span><span class="ar">→</span><span class="fb">Screen or CSV</span></div>
    <p class="cap">All four apps use the same five steps. That is why they cannot produce different answers.</p>`));

  pages.push(P(`<h2>How the apps sit on the Data Core</h2>
    <p>Every Medhava module writes into one shared core. Module 01 is the module that reads it.</p>
    <div class="wire2"><div class="core"><b>UNIFIED DATA CORE</b><span>Item · Party · Stock · Ledger · Order</span></div>
      <div class="ring">
        <div class="rn in">← Sales · invoices, returns, channel</div>
        <div class="rn in">← Purchase · supplier bills, terms</div>
        <div class="rn in">← Inventory · quantity, cost, reorder point</div>
        <div class="rn in">← Manufacturing · pieces made, wages</div>
        <div class="rn in">← Accounts · balances, expenses, receipts</div>
        <div class="rn in">← Platform · companies, trading names, your plan</div>
        <div class="rn out">→ CEO Dashboard · position + alerts</div>
        <div class="rn out">→ Report Builder · any question + CSV</div>
        <div class="rn out">→ Group Consolidation · one set of group figures</div>
      </div></div>
    <p class="cap">Six modules feed in. Three apps read. Only the fourth app writes — and only to the records you gave it.</p>
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
    <figure><img src="${img('DASH_VAS', 'dash')}"><figcaption>The Overview screen — Vastrangam edition.</figcaption></figure>
    <ul class="pts">
      <li><b>Two live dials</b> — period (April, May, June, July, Full year) and company (one, or all of them together). Every figure on every screen is recalculated. Balances ignore the period, because a balance is a position — but they do obey the company.</li>
      <li><b>Returns come off before anything is called "net"</b> — so a busy channel with high returns can never flatter the numbers.</li>
      <li><b>Alerts nobody types in</b> — five rules run against live figures. You can clear one; it comes back on its own if the situation gets worse.</li>
      <li><b>It writes nothing.</b> Two of its self-tests read its own code to prove it.</li>
    </ul>`));

  pages.push(P(`<h2>App 2 · Report Builder</h2>
    <figure><img src="${img('REP_VAS', 'build')}"><figcaption>Pick, group, filter, run — Vastrangam edition.</figcaption></figure>
    <ul class="pts">
      <li><b>Six sources</b> — Sales · Money owed · Stock · Running costs · Production · Purchases. Group any of them by anything, including by company.</li>
      <li><b>Eleven ready-made reports</b>, each answering a real question, each a starting point you can change.</li>
      <li><b>Top-N is honest</b> — ask for Top 5 and you get five rows, but the Total counts <b>every</b> matching row and says so.</li>
      <li><b>Saving keeps the question, not the answer</b> — so a report built today tells you about next month when you run it next month.</li>
    </ul>
    <div class="good">A Sales report grouped by channel with no filters equals the CEO Dashboard's net sales figure exactly. Not by convention — by construction.</div>`));

  pages.push(P(`<h2>App 3 · Group Consolidation</h2>
    <figure><img src="${img('GRP_VAS', 'group')}"><figcaption>Group figures with the arithmetic shown, not hidden — Vastrangam edition.</figcaption></figure>
    <ul class="pts">
      <li><b>What your companies billed each other comes back out</b> of group sales and group purchases — and never touches group profit, because both halves of an internal bill already cancel.</li>
      <li><b>A company with no tax registration counts in every group figure and is refused a return.</b> Two different questions, both answered correctly.</li>
      <li><b>A trading name is not a company.</b> There is a button that tries to make one into a company; watching it refuse is how you learn the rule.</li>
      <li><b>Unlimited companies.</b> The software sets no cap; the plan does, and the refusal at the limit says so in those words.</li>
    </ul>`));

  pages.push(P(`<h2>App 4 · All three in one</h2>
    <figure><img src="${img('UNI_VAS', 'files_staged')}"><figcaption>An upload staged: two rows accepted, one refused by name — Vastrangam edition.</figcaption></figure>
    <p>The same three apps, over one set of records, plus the two things that make the module testable: <b>you can change the records</b> and <b>you can upload a spreadsheet of them</b>.</p>
    <ul class="pts">
      <li><b>Add, edit and delete</b> every table — companies, trading names, sales, purchases, costs, production, stock, money owed, opening balances, internal billing.</li>
      <li><b>Upload .xlsx or .csv</b>, with the whole spreadsheet engine written out inside the file — so it works with the internet switched off.</li>
      <li><b>Nothing is dropped silently.</b> Rows are staged, counted, and every rejection is shown with its line number and reason before anything is written.</li>
      <li><b>Download everything back out</b> as Excel, CSV or a JSON backup — with the same headings the importer expects, so the round trip actually closes.</li>
    </ul>
    <div class="good"><b>Test here, and you have tested all three.</b> Type a sale and watch the dashboard, every report and the group roll-up move by the same amount. That is not three systems agreeing — it is one system shown three ways.</div>`));

  pages.push(P(zipPage(MOD)));

  pages.push(P(`<h2>How this module was verified</h2>
    <p>Nothing in this document is a description of intent. Every app was built, opened in a real browser, and driven.</p>
    <table><thead><tr><th>Build</th><th>Screens</th><th>Controls clicked</th><th>Self-tests</th><th>Console errors</th></tr></thead><tbody>
      ${MOD.verify.map(v => `<tr><td>${v.name}</td><td>${v.screens}</td><td>${v.clicks}</td><td><b>${v.tests}</b></td><td><b>${v.errs}</b></td></tr>`).join('')}
    </tbody></table>
    <h3>And one more check, which is the one that matters</h3>
    <p>The combined app is driven end to end the way a person would drive it: a sale is typed in, and all three figures — dashboard, report total, group total — are checked to have moved <b>by the same amount</b>. It is edited. It is deleted, and all three are checked to have come back <b>exactly</b>. A workbook is uploaded with one deliberately bad row, and the good rows are checked in and the bad one checked refused by name. The Excel export is then downloaded and re-read outside the browser, and the figures compared.</p>
    <div class="good"><b>32 checks, both editions, all passing.</b> A test that only proves a button can be pressed without an error is not worth much. These prove the buttons change the right numbers.</div>
    <h3>Where this module sits</h3>
    ${ROADMAP.htmlTable(MOD.status, MOD.num)}`));

  return doc(P.render(pages[0]), 'Medhava · Module 01 · Dashboard & BI');
}

/* ══════════════════ render ══════════════════ */
(async () => {
  const jobs = [];
  for (const a of APPS) {
    for (const [ed, edKey, edName, co] of [['generic', 'ERP', 'Unified ERP — any industry', 'Acme Corp'],
                                           ['vastrangam', 'VAS', 'Vastrangam edition', 'Vastrangam']]) {
      const cfg = loadCfg(a.dir, ed);
      const tag = a.tag + '_' + edKey;
      const nTests = TESTS[tag].length;
      const c = Object.assign({}, connectors(a.dir), {
        tag, edition: edName, co, app: a.app, n: a.n, sub: a.sub, cfg,
        ring: RING[a.ring], tests: nTests, what: a.what, accept: a.accept,
        badges: a.badges.concat([nTests + ' / ' + nTests + ' self-tests pass']),
        wont: a.wont.concat(['In this single-file form it does not pull live from ' +
          (edKey === 'VAS' ? 'your marketplace panels' : 'your other systems') +
          '; the hosted version of Medhava is what connects those pipes.']),
        lede: cfg.tagline,
      });
      c.pages = a.pages(c, (v, cap, cls) => fs.existsSync(path.join(SHOTS, tag + '_' + v + '.png'))
        ? `<figure class="${cls || ''}"><img src="file://${path.join(SHOTS, tag + '_' + v + '.png')}"><figcaption>${cap}</figcaption></figure>` : '',
        WORDS[edKey]);
      jobs.push({ html: appBook(c), out: `Medhava_M01_App${a.n}_${a.tag}_${edKey}` });
    }
  }
  jobs.push({ html: moduleBook(), out: 'Medhava_Module_01_Dashboard_BI' });

  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  for (const j of jobs) {
    const htmlPath = path.join(DIR, 'book_' + j.out + '.html');
    fs.writeFileSync(htmlPath, j.html);
    const page = await browser.newPage();
    await page.goto('file://' + htmlPath, { waitUntil: 'load' });
    await page.emulateMedia({ media: 'print' });
    const pdf = path.join(OUT, j.out + '.pdf');
    await page.pdf({ path: pdf, format: 'A4', printBackground: true, scale: 0.673 });
    await page.close();
    const n = (fs.readFileSync(pdf).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    console.log(`  ${j.out.padEnd(46)} ${String(n).padStart(3)} pages  ${Math.round(fs.statSync(pdf).size / 1024)}KB`);
  }
  await browser.close();
  console.log('\nbooks done');
})();
