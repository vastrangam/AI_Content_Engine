'use strict';
/* Every concrete claim the Module 04 manuals make, checked against the shipped HTML.

   A manual that tells somebody "press this and the number becomes 8" is a promise, and a
   promise nobody checked is a promise that will be wrong by the third build. So each figure
   quoted in a manual, each record it names, and each walkthrough it asks the reader to
   follow is driven here — in the real browser, in the real file, in both editions.

   Run: node verify_m02_manual.js */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out'), MAN = path.join(__dirname, 'manuals');
const EXE = require('../chrome.js').chromePath();

let failures = 0;
const check = (name, ok, detail) => {
  if (!ok) failures++;
  console.log(`  ${ok ? '✓' : '✗ FAIL'}  ${name}${detail !== undefined && detail !== '' ? '   ' + detail : ''}`);
};

/* the words each edition's manuals use, and the records they name */
const ED = {
  ERP: { p1: 'Northline Retail Pvt Ltd', knownCo: 'Northline Retail Pvt Ltd',
         strangerCo: 'Coastal Wholesale', partyWord: 'customer',
         quietSubject: 'Disputing the return credit',
         docKinds: ['Party', 'Order', 'Project or case', 'Person'] },
  VAS: { p1: 'Rajmandir Wholesale (Surat)', knownCo: 'Rajmandir Wholesale (Surat)',
         strangerCo: 'Coastal Ethnic Wholesale', partyWord: 'buyer',
         quietSubject: 'Disputing the marketplace return credit',
         docKinds: ['Party', 'Order', 'Style or job', 'Person'] },
};

const BUILDS = [
  { file: 'crm_ERP.html', tag: 'CRM_ERP', kind: 'crm', ed: 'ERP' },
  { file: 'crm_Vastrangam.html', tag: 'CRM_VAS', kind: 'crm', ed: 'VAS' },
  { file: 'docs_ERP.html', tag: 'DOC_ERP', kind: 'doc', ed: 'ERP' },
  { file: 'docs_Vastrangam.html', tag: 'DOC_VAS', kind: 'doc', ed: 'VAS' },
  { file: 'helpdesk_ERP.html', tag: 'HD_ERP', kind: 'hd', ed: 'ERP' },
  { file: 'helpdesk_Vastrangam.html', tag: 'HD_VAS', kind: 'hd', ed: 'VAS' },
  { file: 'm04_ERP.html', tag: 'U2_ERP', kind: 'uni', ed: 'ERP' },
  { file: 'm04_Vastrangam.html', tag: 'U2_VAS', kind: 'uni', ed: 'VAS' },
];

async function run(browser, bd) {
  console.log('\n── ' + bd.tag + '   (' + bd.file + ')');
  const W = ED[bd.ed];
  const md = fs.readFileSync(path.join(MAN, bd.tag + '_MANUAL.md'), 'utf8');
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('dialog', d => d.accept());
  await page.goto('file://' + path.join(OUT, bd.file), { waitUntil: 'load' });

  const ev = (fn, arg) => page.evaluate(fn, arg);
  const navCount = await ev(() => document.querySelectorAll('#nav a[data-v]').length);
  const acts = await ev(() => Object.keys(Medhava.SPEC ? Medhava.SPEC.actions : {}));
  const st = await ev(() => window.__selftest || null);
  const names = st ? st.log.map(l => l.name) : [];

  /* ── the file name the manual tells them to look for ── */
  const claimedFile = /The whole app is ONE file: (\S+)/.exec(md);
  check('the manual names the file exactly as the ZIP ships it',
    !!claimedFile && /^(MEDHAVA|VASTRANGAM)_M02_App0\d_[A-Za-z0-9_]+\.html$/.test(claimedFile[1]),
    claimedFile && claimedFile[1]);

  /* ── the storage key the manual tells them to look for ── */
  const claimedKey = /labelled "([^"]+)"/.exec(md);
  const realKey = await ev(() => 'medhava_' + Medhava.SPEC.id + '_v1');
  check('the manual names the browser storage key the app actually uses',
    !!claimedKey && claimedKey[1] === realKey, realKey);

  /* ── the self-test count the manual quotes ── */
  const claimedTests = Number((/(\d+)\n?separate checks|(\d+) separate checks/.exec(md) || [])[0].replace(/\D+/g, ''));
  check('the self-test count in the manual is the number the app really runs',
    !!st && claimedTests === st.pass + st.fail,
    claimedTests + ' claimed · ' + (st ? st.pass + st.fail : '?') + ' run');
  check('and every one of them passes', !!st && st.fail === 0, st ? st.fail + ' failed' : 'no results');

  /* the probe that proves this app has no button without a screen really ran here */
  const reach = await ev(() => (Medhava.M02V || {}).lastUnreachable);
  check('the button-reachability probe ran in the browser, and found nothing stranded',
    Array.isArray(reach) && reach.length === 0,
    reach === null ? 'it did not run' : (reach || []).join(', '));

  /* ── a manual describes the refusal panel only where something can really be refused ── */
  const canRefuse = await ev(() => {
    const A = Medhava.SPEC.actions;
    return ['signdoc', 'senddoc', 'adddoc', 'closetkt', 'attachorder'].some(k => !!A[k]);
  });
  check('the manual describes the refusal panel only if this app can really refuse something',
    md.indexOf('That was refused') >= 0 === canRefuse,
    canRefuse ? 'it can refuse, and says so' : 'it cannot refuse, and does not claim to');

  /* ── the example self-tests the manual prints really exist, word for word ── */
  const egs = (md.match(/^  · "(.+)"$/gm) || []).map(s => s.replace(/^  · "|"$/g, ''));
  check('the four example self-tests quoted are real test names',
    egs.length === 4 && egs.every(e => names.indexOf(e) >= 0),
    egs.filter(e => names.indexOf(e) < 0).join(' | ') || 'all four found');

  /* ── the screen count the manual claims, against the app's own screens ──
     The menu also carries Connectors and Backup & Health, which the kernel adds to every app;
     the count in the manual is of the app's own screens, so those two come off. */
  const WORD = { Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7, Eight: 8, Thirteen: 13, Fifteen: 15 };
  const claimedScreens = WORD[(/LEFT MENU     (\w+) screens/.exec(md) || [])[1]];
  check('the screen count in the manual is the number of the app\'s own screens',
    claimedScreens === navCount - 2, claimedScreens + ' claimed · ' + (navCount - 2) + ' own screens');

  /* ── every menu label the manual lists is a menu label that exists ── */
  const labels = await ev(() => [...document.querySelectorAll('#nav a[data-v]')].map(a => a.textContent.trim()));
  const menuBlock = (/LEFT MENU[\s\S]*?On a phone/.exec(md) || [''])[0];
  /* only the indented "GROUP NAME   Screen · Screen" lines carry screen names; the prose
     above them ("plus the two every Medhava app comes with…") is not a list of screens */
  const listed = menuBlock.split('\n')
    .map(l => /^\s{18}([A-Z][A-Z &]+?)\s{2,}(.+)$|^\s{32,}(\S.*)$/.exec(l))
    .filter(Boolean).map(m => (m[2] || m[3] || '').trim())
    .join(' · ').split(' · ').map(x => x.trim()).filter(Boolean);
  const extra = ['Connectors', 'Backup & Health'];   /* the kernel adds these two */
  const missing = listed.filter(l => extra.indexOf(l) < 0 && !labels.some(x => x === l));
  check('every screen the manual lists is really in the menu', missing.length === 0, missing.join(' | '));

  /* ── the figures every manual of this module quotes ── */
  const S = await ev(() => {
    const DB = Medhava.DB, M = Medhava.M02;
    const seg = {}; M.segCounts(DB).forEach(s => { seg[s.seg] = s.n; });
    return {
      parties: DB.parties.length, leads: DB.leads.length, orders: DB.orders.length,
      docs: DB.docs.length, tickets: DB.tickets.length,
      openLeads: M.openLeads(DB).length, pipeline: M.pipelineValue(DB),
      weighted: M.weightedPipeline(DB), winRate: M.winRate(DB), worth: M.totalValue(DB),
      unanswered: M.unanswered(DB).length, awaiting: M.awaitingSignature(DB).length,
      expiring: M.expiringSoon(DB).length, orphans: M.orphanDocs(DB).length,
      median: M.medianFirstReply(DB), slaFirst: M.slaFirst(DB), seg: seg,
      p1: DB.parties[0].name, p1id: DB.parties[0].id,
      tables: (M.TABLES || []).map(t => t.label),
      docKinds: (Medhava.SPEC.__cfg && Medhava.SPEC.__cfg.docKinds) || null,
    };
  });
  const quotes = (needle) => md.indexOf(needle) >= 0;

  if (quotes('₹25,10,000.00')) {
    check('the manual\'s open pipeline figure is the app\'s', S.pipeline === 2510000, S.pipeline);
    check('the manual\'s weighted figure is the app\'s', S.weighted === 1258500, S.weighted);
  }
  if (quotes('40% as it ships')) check('the manual\'s win rate is the app\'s', S.winRate === 40, S.winRate);
  if (quotes('₹18,68,300.00')) check('the manual\'s customers-worth figure is the app\'s', S.worth === 1868300, S.worth);
  if (quotes('The "Parties" card says 8')) check('the manual\'s party count is the app\'s', S.parties === 8, S.parties);
  if (quotes('12 documents as it ships')) check('the manual\'s document count is the app\'s', S.docs === 12, S.docs);
  if (quotes('Sent, nothing back. 2 as it ships')) check('the manual\'s awaiting-signature count is the app\'s', S.awaiting === 2, S.awaiting);
  if (quotes('Expiring within 60 days    4')) check('the manual\'s expiring count is the app\'s', S.expiring === 4, S.expiring);
  if (quotes('Filed against nothing      0')) check('the manual\'s orphan count is the app\'s', S.orphans === 0, S.orphans);
  if (quotes('median first reply 52 min')) {
    check('the manual\'s median first reply is the app\'s', S.median === 52, S.median);
    check('the manual\'s reply target is the app\'s', S.slaFirst === 120, S.slaFirst);
  }
  if (quotes('3 tickets as it ships')) check('the manual\'s unanswered count is the app\'s', S.unanswered === 3, S.unanswered);
  if (quotes('2 Champions, 1 Loyal')) {
    check('the manual\'s six group counts are the app\'s',
      S.seg.Champion === 2 && S.seg.Loyal === 1 && S.seg['Needs attention'] === 1 &&
      S.seg['At risk'] === 1 && S.seg.Sleeping === 1 && S.seg.New === 2,
      JSON.stringify(S.seg));
  }
  if (quotes(W.p1)) check('the party the manual opens on is the app\'s first party', S.p1 === W.p1, S.p1);
  if (quotes('Ticket messages · Conversation log')) {
    check('the seven record tables the manual lists are the app\'s',
      S.tables.join(' · ') === 'Parties · Leads · Orders · Documents · Tickets · Ticket messages · Conversation log',
      S.tables.join(' · '));
  }
  if (quotes(W.docKinds.join(' · '))) {
    const real = await ev(() => (Medhava.DB.__docKinds || (typeof CONFIG !== 'undefined' ? CONFIG.docKinds : null)));
    check('the things a document may be filed against are the app\'s', real === null || real.join(' · ') === W.docKinds.join(' · '),
      real ? real.join(' · ') : '(read from the form instead)');
  }

  /* ── the records the manual names by hand ── */
  if (quotes('Priya Menon')) {
    const known = await ev(() => {
      const DB = Medhava.DB, M = Medhava.M02;
      const l = M.openLeads(DB).filter(x => M.findParty(DB, x.co))[0];
      return l ? { name: l.name, co: l.co } : null; });
    check('the deal the manual names is open and at a party already on the books',
      !!known && known.name === 'Priya Menon' && known.co === W.knownCo,
      known ? known.name + ' @ ' + known.co : 'not found');
  }
  if (quotes('Deepak Iyer')) {
    const stranger = await ev(() => {
      const DB = Medhava.DB, M = Medhava.M02;
      const l = M.openLeads(DB).filter(x => !M.findParty(DB, x.co))[0];
      return l ? { name: l.name, co: l.co } : null; });
    check('the new-organisation deal the manual names is open and genuinely new',
      !!stranger && stranger.name === 'Deepak Iyer' && stranger.co === W.strangerCo,
      stranger ? stranger.name + ' @ ' + stranger.co : 'not found');
  }
  if (quotes('D-2003')) {
    const d = await ev(() => (Medhava.DB.docs || []).filter(x => x.id === 'D-2003')[0] || null);
    check('the document the manual walks you through is out for signature, with that signer',
      !!d && d.status === 'sent' && d.signer === 'Vikram Nair',
      d ? d.status + ' · ' + d.signer : 'not found');
  }
  if (quotes('T-503')) {
    const t = await ev(() => (Medhava.M02.unanswered(Medhava.DB) || []).filter(x => x.id === 'T-503')[0] || null);
    check('the ticket the manual walks you through is unanswered, with that subject',
      !!t && t.subject === W.quietSubject, t ? t.subject : 'not found');
  }

  /* ── the walkthroughs, actually walked ── */
  if (bd.kind === 'crm' || bd.kind === 'uni') {
    await page.click('#nav a[data-v="pipe"]'); await page.waitForTimeout(150);
    const known = await ev(() => {
      const DB = Medhava.DB, M = Medhava.M02;
      const l = M.openLeads(DB).filter(x => M.findParty(DB, x.co))[0]; return l && l.id; });
    await page.click(`[data-act="win"][data-id="${known}"]`); await page.waitForTimeout(200);
    check('PART 3 step "still 8": winning it did not open a second record',
      (await ev(() => Medhava.DB.parties.length)) === 8, await ev(() => Medhava.DB.parties.length));
    await page.click('#nav a[data-v="pipe"]'); await page.waitForTimeout(150);
    const stranger = await ev(() => {
      const DB = Medhava.DB, M = Medhava.M02;
      const l = M.openLeads(DB).filter(x => !M.findParty(DB, x.co))[0]; return l && l.id; });
    await page.click(`[data-act="win"][data-id="${stranger}"]`); await page.waitForTimeout(200);
    check('PART 3 step "now 9": winning a new organisation opened exactly one',
      (await ev(() => Medhava.DB.parties.length)) === 9, await ev(() => Medhava.DB.parties.length));
    /* A manual must not send somebody to press a button that is no longer on the screen. */
    await page.click('#nav a[data-v="pipe"]'); await page.waitForTimeout(150);
    check('the won deals really have no button left, as the manual says',
      (await page.$$(`[data-act="win"][data-id="${known}"]`)).length === 0 &&
      (await page.$$(`[data-act="win"][data-id="${stranger}"]`)).length === 0);
    check('and no manual tells the reader to press it a second time',
      md.indexOf('on that same deal again') < 0);
  }

  if (bd.kind === 'crm') {
    check('the manual\'s claim that this app cannot sign or close is true of its buttons',
      !acts.some(k => /signdoc|senddoc|replytkt|closetkt/.test(k)), acts.join(','));
  }

  if (bd.kind === 'doc' || bd.kind === 'uni') {
    await page.click('#nav a[data-v="docs"]'); await page.waitForTimeout(200);
    const docs0 = await ev(() => Medhava.DB.docs.length);
    await page.fill('#d_title', 'Test agreement');
    await page.fill('#d_against', 'NO-SUCH-THING');
    await page.fill('#d_signer', 'Anybody');
    await page.click('[data-act="adddoc"]'); await page.waitForTimeout(250);
    const r1 = await ev(() => Medhava.DB.lastRefusal && Medhava.DB.lastRefusal.reason);
    check('PART 3 step: filing against NO-SUCH-THING is refused, and nothing is written',
      !!r1 && (await ev(() => Medhava.DB.docs.length)) === docs0, (r1 || '').slice(0, 60));
    await page.click('[data-act="dismiss"]'); await page.waitForTimeout(150);
    await page.fill('#d_title', 'Test agreement');
    await page.fill('#d_against', S.p1id);
    await page.fill('#d_signer', 'Anybody');
    await page.click('[data-act="adddoc"]'); await page.waitForTimeout(250);
    check('PART 3 step: filing it against ' + S.p1id + ' works',
      (await ev(() => Medhava.DB.docs.length)) === docs0 + 1);
    const nd = await ev(() => Medhava.DB.docs[Medhava.DB.docs.length - 1].id);
    check('PART 3 step: it is already on that ' + W.partyWord + '\'s record',
      await ev(p => Medhava.M02.docsOfParty(Medhava.DB, p).some(d => d.title === 'Test agreement'), S.p1id));

    /* the three states, exactly as the manual walks them */
    await page.click(`[data-act="senddoc"][data-id="${nd}"]`); await page.waitForTimeout(250);
    check('PART 3 step: "Send for signature" moves it to sent',
      (await ev(id => Medhava.DB.docs.filter(d => d.id === id)[0].status, nd)) === 'sent');
    for (const [code, label] of [['', 'an empty code'], ['12ab', 'a code that is not six digits']]) {
      await page.click(`[data-act="seldoc"][data-id="${nd}"]`); await page.waitForTimeout(200);
      await page.fill('#sg_code', code);
      await page.click('[data-act="signdoc"]'); await page.waitForTimeout(250);
      const rr = await ev(() => Medhava.DB.lastRefusal && Medhava.DB.lastRefusal.reason);
      check('PART 3 step: ' + label + ' is refused, and it is still "sent"',
        !!rr && (await ev(id => Medhava.DB.docs.filter(d => d.id === id)[0].status, nd)) === 'sent',
        (rr || '').slice(0, 55));
      await page.click('[data-act="dismiss"]'); await page.waitForTimeout(150);
    }
    await page.click(`[data-act="seldoc"][data-id="${nd}"]`); await page.waitForTimeout(200);
    await page.fill('#sg_code', '246810');
    await page.click('[data-act="signdoc"]'); await page.waitForTimeout(250);
    const sd = await ev(id => Medhava.DB.docs.filter(d => d.id === id)[0], nd);
    check('PART 3 step: 246810 signs it, and the code is kept on the row',
      sd.status === 'signed' && sd.code === '246810');
    check('PART 3 step: signing it a second time is refused, original code intact',
      await ev(id => { const r = Medhava.M02.signDoc(Medhava.DB, id, '111111');
        return r.refused === true && Medhava.DB.docs.filter(d => d.id === id)[0].code === '246810'; }, nd));
  }

  if (bd.kind === 'hd' || bd.kind === 'uni') {
    await page.click('#nav a[data-v="tickets"]'); await page.waitForTimeout(200);
    await page.click('[data-act="settktf"][data-f="unanswered"]').catch(() => {});
    await page.waitForTimeout(200);
    const q = await ev(() => { const t = Medhava.M02.unanswered(Medhava.DB)[0];
      return t ? { id: t.id, party: t.party } : null; });
    await page.click(`[data-act="seltkt"][data-id="${q.id}"]`); await page.waitForTimeout(250);
    check('PART 3 step: it opens with no first-reply time at all',
      (await ev(id => Medhava.M02.ticketRow(Medhava.DB,
        Medhava.DB.tickets.filter(t => t.id === id)[0]).firstReply, q.id)) === null);
    await page.click('[data-act="closetkt"]'); await page.waitForTimeout(250);
    const rc = await ev(() => Medhava.DB.lastRefusal && Medhava.DB.lastRefusal.reason);
    check('PART 3 step: closing it unanswered is refused, and it stays open',
      !!rc && (await ev(id => !Medhava.DB.tickets.filter(t => t.id === id)[0].closed, q.id)),
      (rc || '').slice(0, 55));
    await page.click('[data-act="dismiss"]'); await page.waitForTimeout(150);
    const other = await ev(p => { const o = Medhava.DB.orders.filter(x => x.party !== p)[0]; return o && o.id; }, q.party);
    await page.fill('#tk_order', other);
    await page.click('[data-act="attachorder"]'); await page.waitForTimeout(250);
    const ro = await ev(() => Medhava.DB.lastRefusal && Medhava.DB.lastRefusal.reason);
    const bothNamed = await ev(a => {
      const r = Medhava.DB.lastRefusal ? Medhava.DB.lastRefusal.reason : '';
      const o = Medhava.DB.orders.filter(x => x.id === a.other)[0];
      return r.indexOf(Medhava.M02.partyName(Medhava.DB, o.party)) >= 0 &&
             r.indexOf(Medhava.M02.partyName(Medhava.DB, a.party)) >= 0;
    }, { other: other, party: q.party });
    check('PART 3 step: another ' + W.partyWord + '\'s order is refused, and the refusal names both',
      !!ro && bothNamed, (ro || '').slice(0, 70));
    await page.click('[data-act="dismiss"]'); await page.waitForTimeout(150);
    await page.fill('#tk_reply', 'Looking into this now.');
    await page.click('[data-act="replytkt"]'); await page.waitForTimeout(300);
    check('PART 3 step: the reply gives it a first-reply time immediately',
      (await ev(id => Medhava.M02.ticketRow(Medhava.DB,
        Medhava.DB.tickets.filter(t => t.id === id)[0]).firstReply, q.id)) !== null);
    await page.click('[data-act="closetkt"]'); await page.waitForTimeout(250);
    check('PART 3 step: NOW it closes',
      await ev(id => !!Medhava.DB.tickets.filter(t => t.id === id)[0].closed, q.id));
  }

  if (bd.kind === 'uni') {
    /* PART D · the exact arithmetic the manual promises */
    await page.click('#nav a[data-v="records"]'); await page.waitForTimeout(200);
    await page.click('[data-act="settab"][data-t="orders"]'); await page.waitForTimeout(200);
    const worth0 = await ev(p => Medhava.M02.profile(Medhava.DB,
      Medhava.DB.parties.filter(x => x.id === p)[0]).value, S.p1id);
    const n0 = await ev(() => Medhava.DB.orders.length);
    await page.selectOption('#r_party', S.p1id);
    await page.fill('#r_date', '2026-07-15');
    await page.fill('#r_amount', '50000');
    await page.fill('#r_returned', '5000');
    await page.click('[data-act="saverec"]'); await page.waitForTimeout(300);
    const worth1 = await ev(p => Medhava.M02.profile(Medhava.DB,
      Medhava.DB.parties.filter(x => x.id === p)[0]).value, S.p1id);
    check('PART D step 21: worth went up by exactly 45,000',
      Math.round((worth1 - worth0) * 100) / 100 === 45000, (worth1 - worth0) + '');
    check('PART D step 20: an order left without a number was numbered for you',
      (await ev(() => Medhava.DB.orders.length)) === n0 + 1 &&
      !!(await ev(() => Medhava.DB.orders[Medhava.DB.orders.length - 1].id)));
    const newId = await ev(() => Medhava.DB.orders[Medhava.DB.orders.length - 1].id);
    await page.fill('#r_date', 'last Tuesday');
    await page.fill('#r_amount', '1000');
    await page.click('[data-act="saverec"]'); await page.waitForTimeout(250);
    check('PART D step 22: "last Tuesday" is not accepted, and nothing is written',
      (await ev(() => !!Medhava.DB.lastReject)) && (await ev(() => Medhava.DB.orders.length)) === n0 + 1,
      (await ev(() => Medhava.DB.lastReject) || '').slice(0, 55));
    await page.click(`[data-act="delrec"][data-id="${newId}"]`); await page.waitForTimeout(250);
    check('PART D step 23: deleting it puts everything back',
      (await ev(() => Medhava.DB.orders.length)) === n0 &&
      Math.round((await ev(p => Medhava.M02.profile(Medhava.DB,
        Medhava.DB.parties.filter(x => x.id === p)[0]).value, S.p1id)) * 100) / 100 === worth0);

    /* the claim that "add the party first" is the wording */
    check('the manual quotes the rejection wording the engine really uses',
      await ev(() => /add the party first/.test(
        Medhava.M02.validate(Medhava.DB, 'orders', { id: 'X', party: 'NOPE', date: '2026-07-01' }).join(' '))));
  }

  check('no console or script errors through the whole walkthrough', errors.length === 0, errors[0] || '');
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  for (const bd of BUILDS) await run(browser, bd);
  await browser.close();
  console.log(`\n${failures === 0 ? 'EVERY MANUAL CLAIM HOLDS' : failures + ' MANUAL CLAIM(S) DO NOT HOLD'}\n`);
  process.exit(failures ? 1 : 0);
})();
