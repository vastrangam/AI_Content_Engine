'use strict';
/* Module 02 · CRM — the illustrated process PDFs.
   Eight app books (4 apps × 2 editions) plus one module book, all from ONE generator.
   Wiring tables come from each config, connector tables from providers.js and the app's own
   uses[], self-test lists from tests.json, screenshots from shots_m02.js. Nothing typed twice. */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const { doc, bookBuilder, cover, testPages, connectorsPage, connectorsRules, connectorsPage2, zipPage, mark } = require('./bookparts.js');
const PROVIDERS = require('./../providers.js');
const MOD = require('./module_m02.js');
const ROADMAP = require('./roadmap.js');
const DIR = __dirname, SHOTS = path.join(DIR, 'shots'), OUT = path.join(DIR, 'out');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TESTS = JSON.parse(fs.readFileSync(path.join(DIR, 'tests.json'), 'utf8'));

function loadCfg(dir, ed) {
  return new Function(fs.readFileSync(path.join(DIR, dir, 'config_' + ed + '.js'), 'utf8') + '\nreturn CONFIG;')();
}
function connectors(dir) {
  const m = /uses\s*:\s*\[([^\]]*)\]/.exec(fs.readFileSync(path.join(DIR, dir, 'core.js'), 'utf8'));
  const uses = m ? m[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean) : [];
  const caps = PROVIDERS.CAPS.filter(c => uses.indexOf(c.id) >= 0);
  return { capCount: caps.length, altCount: caps.reduce((s, c) => s + c.providers.length, 0),
    capRows: caps.map(c => [c.name, c.providers.map(p => p.name).join(' · ')]) };
}

function appBook(c) {
  const P = bookBuilder(c.edition, c.app);
  const fig = (v, cap, cls) => fs.existsSync(path.join(SHOTS, c.tag + '_' + v + '.png'))
    ? `<figure class="${cls || ''}"><img src="file://${path.join(SHOTS, c.tag + '_' + v + '.png')}"><figcaption>${cap}</figcaption></figure>` : '';
  const pages = [];

  pages.push(cover(c, c.app, c.sub, `Module 02 · CRM — App ${c.n} of 4`, c.lede, c.badges));

  pages.push(P(`<h2>What this is, and what is inside</h2>
    <p class="big">${c.what}</p>
    <p>${c.cfg.about}</p>
    <p>It is a single HTML file. It opens by double-click, runs with the internet switched off, saves your work in the browser, and checks its own arithmetic and its own rules <b>${c.tests} different ways</b> every time it starts.</p>
    <div class="toc"><h3>What this document covers</h3>${P.toc()}</div>`));

  pages.push(P(`<h2>The spine of this module: one record</h2>
    <p class="big">The three apps in Module 02 are not three programs that talk to each other. They are <b>three views of one record</b> — the party.</p>
    <div class="wire2"><div class="core"><b>THE PARTY RECORD</b><span>Who they are · what they bought · what is filed · what they asked</span></div>
      <div class="ring">
        <div class="rn in">← a lead, once won, becomes this record</div>
        <div class="rn in">← Sales · orders and returns against it</div>
        <div class="rn in">← Documents · filed against it, or against one of its orders</div>
        <div class="rn in">← Helpdesk · every question about it</div>
        <div class="rn out">→ Customer 360 · all of the above, one timeline</div>
        <div class="rn out">→ A behaviour group, worked out and never tagged</div>
      </div></div>
    <p class="cap">This is why they are one module. A person on the phone should not have to open three programs to find out what has been going on.</p>
    <h3>What this app reads, and from where</h3>
    <table><thead><tr><th>Comes from</th><th>What it supplies</th></tr></thead><tbody>
      ${c.cfg.wiringIn.map(w => `<tr><td><b>${w.from}</b></td><td>${w.what}</td></tr>`).join('')}
    </tbody></table>
    <div class="good"><b>All four apps of this module are built from one engine file and one screen file.</b>
    Not four codebases that agree — one implementation, compiled four times.</div>`));

  c.pages.forEach(pg => pages.push(P(pg())));

  pages.push(P(`<h2>Every figure, and where it comes from</h2>
    <p>This is the same table as the app's Wiring screen, so you have it on paper.</p>
    <table><thead><tr><th>Figure</th><th>Comes from</th><th>How it is worked out</th></tr></thead><tbody>
      ${c.cfg.wiring.map(w => `<tr><td><b>${w.f}</b></td><td>${w.s}</td><td>${w.h}</td></tr>`).join('')}
    </tbody></table>
    <h3>The rules of the whole module, in one place</h3>
    <table><thead><tr><th>Rule</th><th>What it means in practice</th></tr></thead><tbody>
      <tr><td><b>One party, never two</b></td><td>Winning a deal for an organisation already on the books attaches to that record. Two records for one customer means two answers to "what are they worth".</td></tr>
      <tr><td><b>A document belongs to a record</b></td><td>Not to a folder. Filing against a record that does not exist is refused, because the document could never be found from the only place anybody looks.</td></tr>
      <tr><td><b>A signature is a one-time code</b></td><td>Six digits, to the named signer, back from them, recorded against the document. No code, no signature — including on import.</td></tr>
      <tr><td><b>The first-reply clock is derived</b></td><td>The gap between the ticket opening and our first message. There is no field to type it into.</td></tr>
      <tr><td><b>A ticket cannot be closed unanswered</b></td><td>Ignoring somebody and marking it "resolved" is refused.</td></tr>
      <tr><td><b>A ticket names its own party's order</b></td><td>Attaching anybody else's is refused, on screen and on import.</td></tr>
      <tr><td><b>Behaviour groups are rules</b></td><td>Order count and days since the last order. Nobody tags anybody by hand, so nothing goes stale.</td></tr>
    </tbody></table>`));

  pages.push(P(connectorsPage(c, fig)));
  pages.push(P(connectorsRules(c)));
  pages.push(P(connectorsPage2(c)));
  testPages(TESTS[c.tag]).forEach(h => pages.push(P(h)));

  pages.push(P(`<h2>How to run it, and what it will not do</h2>
    <h3>Running it</h3>
    <ol class="run">
      <li><b>Windows:</b> extract the ZIP, then double-click the <span class="kbd">.html</span> file. That is the whole installation.</li>
      <li><b>Mac:</b> unpack the ZIP, double-click the file. Safari opens it.</li>
      <li><b>Android:</b> Files app → Downloads → tap the file → open with Chrome. Then ⋮ → <b>Add to Home screen</b>.</li>
      <li><b>iPhone / iPad:</b> Files app → tap the file → Safari. Then Share → <b>Add to Home Screen</b>.</li>
      <li>No internet needed, ever. No account, no licence key, no setup wizard.</li>
    </ol>
    <h3>Keeping your data safe</h3>
    <p>Your records live in your own browser on your own device — nowhere else, and never on anybody's server. Take a backup weekly: <b>Backup &amp; Health → Export JSON</b>. To move to another device, carry the file and the backup, then <b>Import JSON</b>.</p>
    ${fig('backup', 'Backup & Health — your data controls, and the live test results below them.', 'third')}
    <h3>What it will not do</h3>
    <ul class="pts">
      ${c.wont.map(x => `<li>${x}</li>`).join('')}
      <li>It does not sync between your devices on its own — use the backup file.</li>
      <li>It has no user accounts or passwords. Whoever can open your device can open the app.</li>
      <li><b>It will never ask you for a marketplace, bank or account password.</b> If any screen ever does, it is not Medhava.</li>
    </ul>
    <div class="accept">Accepted when: the app opens by double-click with no internet · all ${c.tests} self-tests show pass · ${c.accept} · a backup exports and imports cleanly.</div>`));

  return doc(P.render(pages[0]), 'Medhava ' + c.app + ' — ' + c.edition);
}

/* ══════════════════ page bodies ══════════════════ */
function crmPages(c, fig, w) {
  return [
    () => `<h2>Screen · Overview</h2>
      ${fig('dash', 'The pipeline on the left, and what needs a decision on the right — from all three apps at once.', 'tall')}
      <div class="good"><b>Look at the right-hand panel.</b> Quiet customers come from the orders, unanswered tickets come from the helpdesk, and unsigned documents come from the filing. Nobody typed any of them, and they are on one list because they are about one record.</div>
      <h3>The five cards</h3>
      <div class="pg2">
        <div class="cardbox"><b>Open pipeline</b><span>Every deal still being chased, added up. The number everybody quotes.</span></div>
        <div class="cardbox"><b>Likely to close</b><span>Each deal multiplied by the odds of its stage. <b>This is the one to plan on.</b></span></div>
        <div class="cardbox"><b>Win rate</b><span>Won ÷ (won + lost). Open deals are not counted — they have not happened yet.</span></div>
        <div class="cardbox"><b>${w.worth}</b><span>Everybody you have won, added up, after returns.</span></div>
        <div class="cardbox"><b>Needs a hand</b><span>Quiet customers + open tickets + documents waiting on a signature.</span></div>
      </div>`,
    () => `<h2>Screen · Pipeline</h2>
      ${fig('pipe', 'Every open deal, its stage, its odds and its age — and where the lost ones went.', 'tall')}
      <div class="rule"><b>Every stage carries a real probability.</b> New 10%, Contacted 25%, Quoted 50%, Negotiation 75%. Multiply and add, and you get a forecast you can plan against instead of a wish list. The gap between the two columns is the honest part.</div>
      <p>The <b>Age</b> column turns red past 45 days. A deal sitting in "Quoted" for two months is not a deal, it is a habit.</p>
      <div class="good"><b>The "why deals were lost" table is worth reading before the next price decision.</b> "${w.lostTop}" at the top usually means the quote arrived late, not that the number was wrong.</div>`,
    () => `<h2>Winning a deal — and the rule that stops a second record</h2>
      <p class="big">Press <b>Mark won</b> and one of two things happens. Which one, and why, is the most important rule in this app.</p>
      <div class="steps">
        <div class="st"><span class="n">1</span><div class="tx"><b>That organisation is already on the books.</b> The deal attaches to the record you have. Nothing new appears. Their history now includes this win.</div></div>
        <div class="st"><span class="n">2</span><div class="tx"><b>They are genuinely new.</b> One party record is opened, and the won deal points at it.</div></div>
        <div class="st"><span class="n">3</span><div class="tx"><b>It cannot be pressed twice.</b> A won deal leaves the open list, so the button is gone; and the engine refuses the second win anyway, by name. Winning the same work twice would put it in the forecast twice and the same customer on the books twice.</div></div>
      </div>
      ${fig('pipe_won', 'The deal at a company already on the books, just won — it has left the open pipeline.', 'tall')}
      ${fig('cust_after_win', 'And the customer list has not grown. The win went onto the record that was already there.', 'tall')}
      <div class="rule"><b>Why this is worth a rule rather than a warning.</b> Two records for one customer is the single most common mess in a CRM, and it is invisible: both look right. Then one says they are worth ${w.dupA} and the other says ${w.dupB}, the second one has none of the documents, and nobody can say which to believe. So it is refused at the point where it would happen.</div>`,
    () => `<h2>Screen · Customers</h2>
      ${fig('cust', 'One row per party — worth, returns, how long since they bought, documents, open tickets, group.', 'tall')}
      <p>Two of these columns exist only because this module has one spine: <b>Docs</b> and <b>Open tickets</b>. They come from the other two apps, and they are usually the two things you actually want to know before you ring somebody.</p>
      ${fig('cust_champion', 'Filtered to one behaviour group.', 'tall')}`,
    () => `<h2>Screen · Customer 360 — the whole point of the module</h2>
      ${fig('person', 'One party. Orders, documents, tickets, notes and the original lead, in one list, newest first.', 'tall')}
      <div class="good"><b>The timeline is the argument for these three apps being one module.</b> Orders come from Sales, documents from Documents &amp; eSign, tickets from Helpdesk, notes and the lead from here. Not copied — read. Whoever picks up the phone has all of it before they say a word.</div>
      <h3>The cards above it</h3>
      <table><thead><tr><th>Card</th><th>What it means</th></tr></thead><tbody>
        <tr><td><b>Worth</b></td><td>Everything they ordered, minus everything they sent back. Not the gross figure.</td></tr>
        <tr><td><b>Orders</b></td><td>How many, and the average size.</td></tr>
        <tr><td><b>Returns</b></td><td>What share came back. Red at 12% — that is usually a specification problem, not bad luck.</td></tr>
        <tr><td><b>Last order</b></td><td>Days ago. This one number drives the behaviour group.</td></tr>
        <tr><td><b>Group</b></td><td>Worked out from the two above it. Never tagged by anybody.</td></tr>
      </tbody></table>`,
    () => `<h2>Screen · Segments and offers</h2>
      ${fig('segs', 'Six groups, the rule that puts somebody in each, and the agreed action.', 'tall')}
      <div class="rule"><b>Nobody is tagged by hand.</b> There is no "segment" field on a party record — a self-test checks that there is not. The group is worked out from how often they buy and how long ago, every time the screen opens, so it changes itself the moment somebody buys or goes quiet.</div>
      <p>The second table is the part that saves arguments: <b>one agreed action per group</b>, so the same customer gets the same answer whoever opens the record.</p>`,
  ];
}

function docPages(c, fig, w) {
  return [
    () => `<h2>Screen · Overview</h2>
      ${fig('docdash', 'What is on file, what is waiting on a signature, what expires soon, and what is filed against nothing.', 'tall')}
      <div class="rule"><b>The fourth card is the one to watch: "filed against nothing".</b> A document whose record does not exist is in the system and unfindable from the only place anybody would look for it. That is the single fault that makes a filing system useless, so it has its own card, and filing one is refused in the first place.</div>
      <p><b>Expiring within 60 days</b> is the list to work down each month. An agreement that lapses quietly is a rate that resets quietly.</p>`,
    () => `<h2>Screen · All documents</h2>
      ${fig('docs', 'Every document, what it is filed against, who signs it, when it expires, and what state it is in.', 'tall')}
      <h3>The five states</h3>
      <table><thead><tr><th>State</th><th>What it means</th></tr></thead><tbody>
        <tr><td><b>draft</b></td><td>Written. Sent to nobody.</td></tr>
        <tr><td><b>sent</b></td><td>Out for signature. A one-time code has gone to the named signer.</td></tr>
        <tr><td><b>signed</b></td><td>The code came back and is recorded against the document.</td></tr>
        <tr><td><b>declined</b></td><td>The signer said no.</td></tr>
        <tr><td><b>filed</b></td><td>Nothing to sign — a certificate, a note, a copy. It is here to be found.</td></tr>
      </tbody></table>
      <div class="good">"Filed against" accepts ${w.kinds}. What is on that list is a <b>setting</b>, not something the software believes — which is how the same app serves ${w.kindEg}.</div>`,
    () => `<h2>Filing against nothing — refused</h2>
      <p>Below, a document was filed against <span class="kbd">NO-SUCH-RECORD</span>. Nothing was created.</p>
      ${fig('docs_refused_filing', 'Refused, with the reason: it could never be found from that record.', 'tall')}
      <div class="rule"><b>This is not fussiness.</b> The whole promise of this app is that a document is found by opening the record it belongs to. A document filed against a record that does not exist breaks that promise silently — it looks filed, and it is lost.</div>`,
    () => `<h2>What a signature actually is here</h2>
      ${fig('docs_code_panel', 'A document out for signature. The only way to mark it signed is the code that went to the signer.', 'tall')}
      <div class="steps">
        <div class="st"><span class="n">1</span><div class="tx">Written. It is a <b>draft</b> — sent to nobody. A draft cannot come back signed before it goes out; that is refused.</div></div>
        <div class="st"><span class="n">2</span><div class="tx">You send it. A six-digit <b>one-time code</b> goes to the named signer. If nobody is named, sending is refused — there would be nowhere to send it.</div></div>
        <div class="st"><span class="n">3</span><div class="tx">They read the code back. You record it. <b>Only now</b> is it signed, and the code is kept against the document.</div></div>
      </div>
      <div class="rule"><b>A one-time code is not a password.</b> This app never asks a signer for a login, and <b>Medhava will never ask you for a marketplace, bank or account password.</b> If any screen ever does, it is not Medhava.</div>`,
    () => `<h2>The refusal, and then the real thing</h2>
      ${fig('docs_refused_signature', 'The code box left empty. Refused, in words.', 'tall')}
      <div class="good"><b>There is no other route to "signed".</b> Not a tick box, not a menu, and not an import — a spreadsheet claiming a signature with no code against it is refused on the way in too. An import that can do what a form refuses is a back door, and everybody learns to use it.</div>
      ${fig('docs_signed', 'Six digits recorded. Now it is signed — and the code is on the record.', 'tall')}`,
  ];
}

function hdPages(c, fig, w) {
  return [
    () => `<h2>Screen · The desk right now</h2>
      ${fig('deskdash', 'Open, unanswered, the median first reply, and how much of it landed inside the target.', 'tall')}
      <div class="rule"><b>Every figure on this screen is worked out from the messages.</b> There is no field anywhere holding a response time — a self-test checks that there is not. A support metric anybody can type is a support metric that will be typed, and then the number on the wall stops meaning anything.</div>
      <p>"Where the questions arrive" is usually more useful than it looks: a channel that is slow is normally a channel nobody has been given responsibility for, not a channel that is harder.</p>`,
    () => `<h2>Screen · Tickets</h2>
      ${fig('tickets', 'Every question, who asked it, what it is about, and how fast it was answered.', 'tall')}
      ${fig('tickets_unanswered', 'Filtered to the ones nobody has replied to — the list that actually matters this morning.', 'tall')}`,
    () => `<h2>Screen · One ticket</h2>
      ${fig('ticket', 'The conversation on the left. Everything already known about the person asking, on the right.', 'tall')}
      <div class="good"><b>The right-hand panel is why this app is in the same module as the customer record.</b> What they are worth, what they have sent back, how long since they ordered, their behaviour group, and every document already on file — before anybody says a word. A helpdesk bolted on beside a CRM makes somebody join that up in their head, on the phone, while a customer waits.</div>`,
    () => `<h2>Two things this app refuses</h2>
      ${fig('ticket_refused_close', 'Closing a ticket nobody has answered. Refused.', 'tall')}
      <div class="rule"><b>A ticket closed without a single reply is a customer who was ignored and then marked "resolved".</b> It is the easiest way to make a support report look excellent, so it is refused rather than discouraged.</div>
      ${fig('ticket_refused_order', 'Attaching another customer’s order. Refused, naming both of them.', 'tall')}
      <div class="rule"><b>And this is how one customer ends up being told about another customer’s delivery.</b> A ticket may name one of its own party’s orders and nobody else’s — on screen and on import.</div>`,
    () => `<h2>The clock, after one reply</h2>
      ${fig('ticket_answered', 'One message sent. The first-reply figure appeared immediately, because it is the gap to that message.', 'tall')}
      <div class="steps">
        <div class="st"><span class="n">1</span><div class="tx">A ticket has an <b>opened</b> time — when the question arrived.</div></div>
        <div class="st"><span class="n">2</span><div class="tx">Every message carries a time and a side: <b>the customer</b>, or <b>us</b>.</div></div>
        <div class="st"><span class="n">3</span><div class="tx">First reply = opening → <b>our first message</b>. That is the whole calculation.</div></div>
        <div class="st"><span class="n">4</span><div class="tx">There is nowhere to store it, so there is nothing to disagree with.</div></div>
      </div>
      <div class="good">And the same ticket now shows on that customer’s <b>Customer 360</b> timeline, with the reply time on it. Not copied there — read from here.</div>`,
  ];
}

function uniPages(c, fig, w) {
  return [
    () => `<h2>Why this app exists</h2>
      <p class="big">The first three apps of this module are CRM &amp; Customer 360, Documents &amp; eSign and Helpdesk &amp; Live Chat. This is all three of them over <b>one set of records</b>, with <b>all three sets of buttons on one screen</b> — plus the two things none of them has: you can change the records, and you can upload a spreadsheet of them.</p>
      <div class="wire2"><div class="core"><b>ONE SET OF RECORDS</b><span>Parties · Leads · Orders · Documents · Tickets · Messages · Notes</span></div>
        <div class="ring">
          <div class="rn in">← You: typed, edited or uploaded</div>
          <div class="rn out">→ CRM screens</div>
          <div class="rn out">→ Documents screens</div>
          <div class="rn out">→ Helpdesk screens</div>
        </div></div>
      <div class="rule"><b>The separate CRM app deliberately cannot sign a document or answer a ticket</b> — those are other apps' rules and other apps' responsibilities. Here they are all on one screen, and every refusal still applies exactly as it does in the app that owns it.</div>`,
    () => `<h2>Screen · Records</h2>
      ${fig('records', 'Every table in the module, with add, edit and delete on each one.', 'tall')}
      ${fig('records_docs', 'The documents table, editable — with the same rules the Documents app enforces.', 'tall')}`,
    () => `<h2>Screen · Upload and download</h2>
      ${fig('files', 'Bring an Excel or CSV in, take everything back out. No account, no internet, no library.', 'tall')}
      <div class="good"><b>Start with "Download a blank template".</b> One sheet per table, with exactly the headings the importer expects — so the fastest way to get your own data in is to paste it into a shape that is already right.</div>
      <p>Headings are matched by name, in any order, ignoring case and spacing. Columns we do not recognise are left alone rather than treated as an error, because a real export always carries columns you do not want. A party column accepts either the code or the full name.</p>`,
    () => `<h2>An upload, staged before anything is written</h2>
      ${fig('files_staged', 'Three rows: one accepted, two refused — each named, with its line number.', 'tall')}
      <div class="rule"><b>The importer holds exactly the rules the screens hold.</b> A ticket against somebody else's order is refused here as well as on screen, and a document claiming to be "signed" with no one-time code is refused too. An import that could do what a form refuses would be a back door, and everybody would learn to use it.</div>
      <p>Nothing is written until you choose: <b>add</b>, <b>replace those tables</b>, or <b>cancel</b>. Accepted plus rejected always equals what was in your file, and there is a self-test that says so.</p>`,
    () => `<h2>After it — one record, already carrying everything</h2>
      ${fig('person_after', 'A customer record after a deal was won, a document filed and signed, and a ticket answered.', 'tall')}
      <div class="good"><b>Nothing was refreshed, synced or recalculated.</b> There was only ever one set of records. The pipeline, the filing and the desk are three ways of looking at it.</div>
      <p class="big">Which is why this is the app to test with: <b>test here, and you have tested all three.</b></p>`,
  ];
}

/* ══════════════════ the eight books ══════════════════ */
const WORDS = {
  ERP: { worth: 'Customers worth', lostTop: 'Price too high', dupA: '₹18 lakh', dupB: '₹4 lakh',
    kinds: 'a party, an order, a project or case, or a person',
    kindEg: 'a practice filing against a case and a workshop filing against a job' },
  VAS: { worth: 'Buyers worth', lostTop: 'Rate too high', dupA: '₹18 lakh', dupB: '₹4 lakh',
    kinds: 'a buyer, an order, a style or job, or a person',
    kindEg: 'a mill filing against an order and a tailoring unit filing against a style' },
};

const APPS = [
  { dir: 'crm', tag: 'CRM', n: 1, app: 'CRM & Customer 360', pages: crmPages,
    sub: 'Lead to won, then the whole lifetime — on one record',
    what: 'One record per customer, carrying everything: the deal on the way in, and every order, return, document and question after it.',
    accept: 'winning a deal for an organisation already on the books does not create a second record · the Customer 360 timeline carries orders, documents, tickets and notes together',
    badges: ['One file · opens by double-click', 'Works offline', 'One customer, never two records'],
    wont: ['It cannot sign a document or answer a ticket — those belong to the apps whose rules they are. Two self-tests read this app’s own code to prove it.'] },
  { dir: 'docs', tag: 'DOC', n: 2, app: 'Documents & eSign', pages: docPages,
    sub: 'Filed against the record it belongs to · signed with a one-time code',
    what: 'Every agreement, certificate, receipt and scan, filed against the order, party, project or person it actually belongs to — and found by opening that record.',
    accept: 'a document cannot be marked signed without a six-digit one-time code · a document cannot be filed against a record that does not exist',
    badges: ['One file · opens by double-click', 'Works offline', 'No code, no signature'],
    wont: ['It does not sign anything on your behalf. It records that a code went out and came back, which is the only thing a signature can honestly be.',
           'It does not store the document files themselves in this single-file form — it stores the record, the state and the evidence.'] },
  { dir: 'helpdesk', tag: 'HD', n: 3, app: 'Helpdesk & Live Chat', pages: hdPages,
    sub: 'Every question tied to the customer and the order it is about',
    what: 'A question arriving by chat, email or phone becomes a ticket against the party who asked it — with everything already known about them on the same screen.',
    accept: 'the first-reply time is worked out from the messages and cannot be typed · a ticket cannot be closed unanswered · a ticket cannot be attached to another customer’s order',
    badges: ['One file · opens by double-click', 'Works offline', 'The reply clock is derived, never typed'],
    wont: ['It does not connect to a live chat widget in this single-file form; the hosted version of Medhava is what connects those pipes.',
           'It will not let anybody set a response time. That is the point of it.'] },
  { dir: 'm02unified', tag: 'U2', n: 4, app: 'Module 02 · All three apps in one', pages: uniPages,
    sub: 'The whole module over one set of records — add, edit, delete, upload, download',
    what: 'CRM, Documents and Helpdesk over one set of records, with all three sets of buttons on one screen, plus record editing and spreadsheet upload.',
    accept: 'winning a deal moves the pipeline and the customer list at once · every refusal from all three apps still applies · an uploaded workbook lands with its bad rows refused by name',
    badges: ['One file · opens by double-click', 'Works offline — including the Excel upload', 'Add · edit · delete · upload · download'],
    wont: ['It is not a different product from the other three — it is the same engine and the same screens, plus records and files.',
           'It does not upload anything anywhere. Your spreadsheet is read on your own machine and never leaves it.'] },
];

/* ══════════════════ the module book ══════════════════ */
function moduleBook() {
  const P = bookBuilder('CRM', 'Module 02');
  const img = (tag, v) => 'file://' + path.join(SHOTS, tag + '_' + v + '.png');
  const pages = [];
  const per = ['CRM_ERP', 'DOC_ERP', 'HD_ERP', 'U2_ERP'].reduce((s, k) => s + TESTS[k].length, 0);

  pages.push(`<section class="pg cover"><div class="cwrap">
    <div class="logo">${mark} Medhava</div>
    <div class="ed">Module 02 of 16</div>
    <h1>CRM</h1>
    <div class="sub">CRM &amp; Customer 360 · Documents &amp; eSign · Helpdesk &amp; Live Chat · and all three in one</div>
    <div class="module">4 apps × 2 editions — Medhava (any industry) and Vastrangam</div>
    <p class="lede">Three apps that are really three views of one record. A lead becomes a customer; a document is filed against that customer or one of their orders; a question about that order becomes a ticket on the same record. The fourth app is all three at once, over records you can type, edit and upload.</p>
    <div class="badges"><span>8 working apps</span><span>${per * 2} self-tests, all passing</span><span>Zero console errors</span><span>Every screen and button verified</span></div>
    <div class="cfoot">Medhava ERP suite · FY 2026-27 · The second module of sixteen</div></div></section>`);

  pages.push(P(`<h2>What this module is</h2>
    <p class="big">Module 02 is the <b>relationship</b> layer. Everything in it hangs off one record — the party — and that is the whole reason these three apps are one module rather than three products.</p>
    <h3>The four apps</h3>
    <table><thead><tr><th>App</th><th>What it is responsible for</th><th>Self-tests</th></tr></thead><tbody>
      <tr><td><b>1 · CRM &amp; Customer 360</b></td><td>The deal on the way in, and the whole lifetime after it</td><td>${TESTS.CRM_ERP.length}</td></tr>
      <tr><td><b>2 · Documents &amp; eSign</b></td><td>Everything filed against a record, and what a signature actually is</td><td>${TESTS.DOC_ERP.length}</td></tr>
      <tr><td><b>3 · Helpdesk &amp; Live Chat</b></td><td>Every question, tied to the customer and the order it is about</td><td>${TESTS.HD_ERP.length}</td></tr>
      <tr><td><b>4 · All three in one</b></td><td>The same three over one set of records you can type into and upload to</td><td>${TESTS.U2_ERP.length}</td></tr>
    </tbody></table>
    <h3>Two editions of each</h3>
    <table class="vs"><thead><tr><th>Edition</th><th>What it is</th></tr></thead><tbody>
      <tr><td><b>Medhava</b></td><td>The unified ERP, industry-neutral. What a document may be filed against is a setting, so the same app serves a practice filing against a case and a workshop filing against a job.</td></tr>
      <tr><td><b>Vastrangam</b></td><td>The same engine with real buyers, mills, marketplaces and test reports in it — so the neutrality can be tested rather than claimed.</td></tr>
    </tbody></table>
    <div class="toc"><h3>Contents</h3>${P.toc()}</div>`));

  pages.push(P(`<h2>The spine: one record, three apps</h2>
    <div class="wire2"><div class="core"><b>THE PARTY RECORD</b><span>Who they are · what they bought · what is filed · what they asked</span></div>
      <div class="ring">
        <div class="rn in">← A lead, once won, becomes this record</div>
        <div class="rn in">← Sales · orders and returns</div>
        <div class="rn in">← Documents · filed against it or its orders</div>
        <div class="rn in">← Helpdesk · every question about it</div>
        <div class="rn out">→ Customer 360 · one timeline</div>
        <div class="rn out">→ A behaviour group, worked out and never tagged</div>
      </div></div>
    <p class="cap">Three apps, one record. Not three systems kept in step.</p>
    <h3>The seven rules this module enforces on itself</h3>
    <table><thead><tr><th>Rule</th><th>Why it is a refusal and not a warning</th></tr></thead><tbody>
      <tr><td><b>One party, never two</b></td><td>Two records for one customer means two answers to "what are they worth", both looking right.</td></tr>
      <tr><td><b>A document belongs to a record</b></td><td>Filed against nothing, it is in the system and unfindable from the only place anybody looks.</td></tr>
      <tr><td><b>A signature is a one-time code</b></td><td>A signature nobody can evidence is worse than none, because everybody believes it.</td></tr>
      <tr><td><b>No signing what was never sent</b></td><td>A document cannot come back before it goes out.</td></tr>
      <tr><td><b>The reply clock is derived</b></td><td>A metric anybody can type is a metric that will be typed.</td></tr>
      <tr><td><b>No closing a ticket unanswered</b></td><td>That is a customer ignored, then marked "resolved".</td></tr>
      <tr><td><b>A ticket names its own party's order</b></td><td>Otherwise one customer is told about another customer's delivery.</td></tr>
    </tbody></table>
    <div class="good"><b>Each of these is also a self-test, and the importer holds every one of them too.</b> An import that could do what a form refuses would be a back door around the rule.</div>`));

  ['CRM', 'DOC', 'HD'].forEach((tag, i) => {
    const a = APPS[i];
    const shots = { CRM: 'person', DOC: 'docs_refused_signature', HD: 'ticket' }[tag];
    const caps = { CRM: 'Customer 360 — one record carrying all three apps.',
      DOC: 'A signature refused for want of a one-time code.',
      HD: 'One ticket, with everything already known about the person asking.' }[tag];
    pages.push(P(`<h2>App ${a.n} · ${a.app}</h2>
      <figure><img src="${img(tag + '_VAS', shots)}"><figcaption>${caps} Vastrangam edition.</figcaption></figure>
      <ul class="pts">${MOD.apps[i].bullets.map(b => '<li>' + b
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') + '</li>').join('')}</ul>`));
  });

  pages.push(P(`<h2>App 4 · All three in one</h2>
    <figure><img src="${img('U2_VAS', 'files_staged')}"><figcaption>An upload staged: one row accepted, two refused by name — Vastrangam edition.</figcaption></figure>
    <ul class="pts">${MOD.unified.bullets.map(b => '<li>' + b.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') + '</li>').join('')}</ul>
    <div class="good"><b>Test here, and you have tested all three.</b></div>`));

  pages.push(P(zipPage(MOD)));

  pages.push(P(`<h2>How this module was verified</h2>
    <table><thead><tr><th>Build</th><th>Screens</th><th>Controls clicked</th><th>Self-tests</th><th>Console errors</th></tr></thead><tbody>
      ${MOD.verify.map(v => `<tr><td>${v.name}</td><td>${v.screens}</td><td>${v.clicks}</td><td><b>${v.tests}</b></td><td><b>${v.errs}</b></td></tr>`).join('')}
    </tbody></table>
    <h3>And the check that matters</h3>
    <p>The combined app is driven end to end the way a person would drive it: a deal is won for a customer already on the books and the party count is checked <b>not</b> to have moved; a document is filed against nothing and the refusal is read; it is filed properly, sent, signed with the wrong code, refused, then signed with a real one; a ticket is closed unanswered and refused, attached to somebody else's order and refused, answered and then closed; an order is typed in, checked onto the customer's worth and timeline, and deleted again; and a workbook with two bad rows is uploaded, staged, and each refusal read by name.</p>
    <div class="good"><b>39 checks, both editions, all passing.</b> A test that only proves a button can be pressed is not worth much. These prove the buttons do the right thing — and refuse the wrong thing.</div>
    <h3>Where this module sits</h3>
    ${ROADMAP.htmlTable(MOD.status, MOD.num)}`));

  return doc(P.render(pages[0]), 'Medhava · Module 02 · CRM');
}

/* ══════════════════ render ══════════════════ */
(async () => {
  const jobs = [];
  for (const a of APPS) {
    for (const [ed, edKey, edName, co] of [['generic', 'ERP', 'Unified ERP — any industry', 'Acme Corp'],
                                           ['vastrangam', 'VAS', 'Vastrangam edition', 'Vastrangam']]) {
      const cfg = loadCfg(a.dir, ed), tag = a.tag + '_' + edKey, n = TESTS[tag].length;
      const c = Object.assign({}, connectors(a.dir), {
        tag, edition: edName, co, app: a.app, n: a.n, sub: a.sub, cfg, tests: n,
        what: a.what, accept: a.accept, badges: a.badges.concat([n + ' / ' + n + ' self-tests pass']),
        wont: a.wont.concat(['In this single-file form it does not pull live from ' +
          (edKey === 'VAS' ? 'your marketplace panels' : 'your other systems') +
          '; the hosted version of Medhava is what connects those pipes.']),
        lede: cfg.tagline,
      });
      c.pages = a.pages(c, (v, cap, cls) => fs.existsSync(path.join(SHOTS, tag + '_' + v + '.png'))
        ? `<figure class="${cls || ''}"><img src="file://${path.join(SHOTS, tag + '_' + v + '.png')}"><figcaption>${cap}</figcaption></figure>` : '',
        WORDS[edKey]);
      jobs.push({ html: appBook(c), out: `Medhava_M02_App${a.n}_${a.tag}_${edKey}` });
    }
  }
  jobs.push({ html: moduleBook(), out: 'Medhava_Module_02_CRM' });

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
    console.log(`  ${j.out.padEnd(44)} ${String(n).padStart(3)} pages  ${Math.round(fs.statSync(pdf).size / 1024)}KB`);
  }
  await browser.close();
  console.log('\nbooks done');
})();
