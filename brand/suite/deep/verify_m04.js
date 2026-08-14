'use strict';
/* Module 04 · the combined app, driven the way a person would drive it.

   check_deep.js proves every button can be pressed without an error. This proves the buttons
   do the right thing and REFUSE the wrong thing: winning a deal for a customer you already
   have does not create a second one; a document cannot be signed without a one-time code and
   cannot be filed against a record that does not exist; a ticket cannot be closed unanswered
   or attached to somebody else's order; and an upload with a bad row stages it, names it, and
   writes nothing until you say so.

   Run: node verify_m02.js */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path'), os = require('os');
const OUT = path.join(__dirname, 'out');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SHEET = require(path.join(__dirname, '..', 'xlsx.js'));

let failures = 0;
const check = (name, ok, detail) => {
  if (!ok) failures++;
  console.log(`  ${ok ? '✓' : '✗ FAIL'}  ${name}${detail ? '   ' + detail : ''}`);
};

async function run(file) {
  /* An absolute path runs the app as it comes OUT OF THE ZIP, which is the only copy the
     customer will ever open. A bare name runs the one in out/. */
  const target = path.isAbsolute(file) ? file : path.join(OUT, file);
  console.log('\n── ' + path.basename(file));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'm02-'));
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('dialog', d => d.accept());
  await page.goto('file://' + target, { waitUntil: 'load' });

  const state = () => page.evaluate(() => {
    const DB = Medhava.DB, M = Medhava.M02;
    return { parties: DB.parties.length, pipeline: M.pipelineValue(DB), open: M.openLeads(DB).length,
             docs: DB.docs.length, tickets: DB.tickets.length,
             unanswered: M.unanswered(DB).length, orphans: M.orphanDocs(DB).length,
             refusal: DB.lastRefusal ? DB.lastRefusal.reason : null };
  });

  const before = await state();
  check('it opens with a pipeline and a customer list', before.parties > 0 && before.pipeline > 0);

  /* ── 1 · winning a deal, and the duplicate-party gate ── */
  await page.click('#nav a[data-v="pipe"]');
  const known = await page.evaluate(() => {
    const DB = Medhava.DB, M = Medhava.M02;
    const l = M.openLeads(DB).filter(x => M.findParty(DB, x.co))[0];
    return l ? { id: l.id, co: l.co, value: l.value } : null;
  });
  check('there is an open deal for an organisation already on the books', !!known, known && known.co);
  await page.click(`[data-act="win"][data-id="${known.id}"]`);
  await page.waitForTimeout(200);
  const afterKnown = await state();
  check('winning it does NOT create a second customer record', afterKnown.parties === before.parties,
    `${before.parties} → ${afterKnown.parties}`);
  check('and it comes out of the open pipeline', afterKnown.pipeline === before.pipeline - known.value);

  await page.click('#nav a[data-v="pipe"]');
  const stranger = await page.evaluate(() => {
    const DB = Medhava.DB, M = Medhava.M02;
    const l = M.openLeads(DB).filter(x => !M.findParty(DB, x.co))[0];
    return l ? { id: l.id, co: l.co } : null;
  });
  await page.click(`[data-act="win"][data-id="${stranger.id}"]`);
  await page.waitForTimeout(200);
  const afterNew = await state();
  check('winning a genuinely new organisation does open one record', afterNew.parties === before.parties + 1);
  check('winning the same deal twice is refused',
    await page.evaluate(id => Medhava.M02.winLead(Medhava.DB, id, {}).refused === true, stranger.id));

  /* ── 2 · documents: the two refusals, then the real thing ── */
  await page.click('#nav a[data-v="docs"]');
  await page.fill('#d_title', 'Test agreement');
  await page.fill('#d_against', 'NO-SUCH-RECORD');
  await page.fill('#d_signer', 'A Signer');
  await page.click('[data-act="adddoc"]');
  await page.waitForTimeout(250);
  const orphanTry = await state();
  check('filing a document against a record that does not exist is refused',
    orphanTry.docs === before.docs && !!orphanTry.refusal,
    (orphanTry.refusal || '').slice(0, 60));
  await page.click('[data-act="dismiss"]');
  await page.waitForTimeout(150);

  const firstParty = await page.evaluate(() => Medhava.DB.parties[0].id);
  await page.fill('#d_title', 'Test agreement');
  await page.fill('#d_against', firstParty);
  await page.fill('#d_signer', 'A Signer');
  await page.click('[data-act="adddoc"]');
  await page.waitForTimeout(250);
  check('filing it against a real party works', (await state()).docs === before.docs + 1);
  const newDoc = await page.evaluate(() => Medhava.DB.docs[Medhava.DB.docs.length - 1].id);

  check('it cannot be signed before it has been sent',
    await page.evaluate(id => Medhava.M02.signDoc(Medhava.DB, id, '123456').refused === true, newDoc));
  await page.click(`[data-act="senddoc"][data-id="${newDoc}"]`);
  await page.waitForTimeout(250);
  await page.click(`[data-act="seldoc"][data-id="${newDoc}"]`);
  await page.waitForTimeout(200);
  await page.fill('#sg_code', '');
  await page.click('[data-act="signdoc"]');
  await page.waitForTimeout(250);
  const noCode = await state();
  check('marking it signed with no one-time code is refused', !!noCode.refusal,
    (noCode.refusal || '').slice(0, 60));
  check('and it is still not signed',
    await page.evaluate(id => Medhava.DB.docs.filter(d => d.id === id)[0].status === 'sent', newDoc));
  await page.click('[data-act="dismiss"]');
  await page.waitForTimeout(150);
  await page.click(`[data-act="seldoc"][data-id="${newDoc}"]`);
  await page.waitForTimeout(200);
  await page.fill('#sg_code', '12ab');
  await page.click('[data-act="signdoc"]');
  await page.waitForTimeout(250);
  check('a code that is not six digits is refused', !!(await state()).refusal);
  await page.click('[data-act="dismiss"]');
  await page.waitForTimeout(150);
  await page.click(`[data-act="seldoc"][data-id="${newDoc}"]`);
  await page.waitForTimeout(200);
  await page.fill('#sg_code', '246810');
  await page.click('[data-act="signdoc"]');
  await page.waitForTimeout(250);
  const signed = await page.evaluate(id => Medhava.DB.docs.filter(d => d.id === id)[0], newDoc);
  check('a six-digit code signs it', signed.status === 'signed');
  check('and the code is kept against the document, not thrown away', signed.code === '246810');
  check('the document shows on that party’s Customer 360 timeline',
    await page.evaluate(p => Medhava.M02.timeline(Medhava.DB, p).some(e => e.what === 'Test agreement'), firstParty));

  /* ── 3 · the desk ── */
  await page.click('#nav a[data-v="tickets"]');
  const quiet = await page.evaluate(() => {
    const t = Medhava.M02.unanswered(Medhava.DB)[0];
    return t ? { id: t.id, party: t.party } : null;
  });
  check('there is a ticket nobody has answered', !!quiet);
  await page.click(`[data-act="seltkt"][data-id="${quiet.id}"]`);
  await page.waitForTimeout(250);
  await page.click('[data-act="closetkt"]');
  await page.waitForTimeout(250);
  const closeTry = await state();
  check('closing a ticket nobody has answered is refused', !!closeTry.refusal,
    (closeTry.refusal || '').slice(0, 60));
  check('and it is still open',
    await page.evaluate(id => !Medhava.DB.tickets.filter(t => t.id === id)[0].closed, quiet.id));
  await page.click('[data-act="dismiss"]');
  await page.waitForTimeout(150);

  const otherOrder = await page.evaluate(p => {
    const o = Medhava.DB.orders.filter(x => x.party !== p)[0]; return o ? o.id : null;
  }, quiet.party);
  await page.fill('#tk_order', otherOrder);
  await page.click('[data-act="attachorder"]');
  await page.waitForTimeout(250);
  const wrongOrder = await state();
  check('attaching another customer’s order to the ticket is refused', !!wrongOrder.refusal,
    (wrongOrder.refusal || '').slice(0, 70));
  await page.click('[data-act="dismiss"]');
  await page.waitForTimeout(150);

  const unans0 = (await state()).unanswered;
  await page.fill('#tk_reply', 'Looking into this right now — I will come back within the hour.');
  await page.click('[data-act="replytkt"]');
  await page.waitForTimeout(250);
  check('answering it drops the unanswered count', (await state()).unanswered === unans0 - 1);
  const fr = await page.evaluate(id =>
    Medhava.M02.ticketRow(Medhava.DB, Medhava.DB.tickets.filter(t => t.id === id)[0]).firstReply, quiet.id);
  check('and it now has a first-reply time, worked out from the message', fr !== null, fr + ' min');
  await page.click('[data-act="closetkt"]');
  await page.waitForTimeout(250);
  check('now it can be closed',
    await page.evaluate(id => !!Medhava.DB.tickets.filter(t => t.id === id)[0].closed, quiet.id));

  /* ── 4 · records: add, edit, delete ── */
  await page.click('#nav a[data-v="records"]');
  await page.click('[data-act="settab"][data-t="orders"]');
  await page.waitForTimeout(200);
  const orders0 = await page.evaluate(() => Medhava.DB.orders.length);
  await page.fill('#r_id', 'SO-TEST');
  await page.selectOption('#r_party', firstParty);
  await page.fill('#r_date', '2026-07-25');
  await page.fill('#r_amount', '50000');
  await page.fill('#r_returned', '0');
  await page.fill('#r_channel', 'Direct');
  await page.click('[data-act="saverec"]');
  await page.waitForTimeout(250);
  check('typing an order adds exactly one row',
    (await page.evaluate(() => Medhava.DB.orders.length)) === orders0 + 1);
  const worth = await page.evaluate(p =>
    Medhava.M02.profile(Medhava.DB, Medhava.DB.parties.filter(x => x.id === p)[0]).value, firstParty);
  check('and that customer is immediately worth more', worth > 0);
  check('and the order is on their timeline',
    await page.evaluate(p => Medhava.M02.timeline(Medhava.DB, p).some(e => e.what.indexOf('SO-TEST') === 0), firstParty));
  await page.click('[data-act="delrec"][data-id="SO-TEST"]');
  await page.waitForTimeout(250);
  check('deleting it puts the row count back',
    (await page.evaluate(() => Medhava.DB.orders.length)) === orders0);

  /* ── 5 · an upload with one row that must be refused ── */
  const f = path.join(tmp, 'upload.xlsx');
  const goodOrder = await page.evaluate(p => Medhava.DB.orders.filter(o => o.party !== p)[0].id, firstParty);
  fs.writeFileSync(f, Buffer.from(SHEET.writeXlsx({
    Tickets: [['Ticket', 'Party', 'About which order', 'Arrived by', 'Subject', 'Priority', 'Handled by', 'Opened at', 'Closed at'],
      ['T-900', firstParty, '', 'Email', 'A fine new ticket', 'Normal', 'R. Nair', '2026-07-30T09:00', ''],
      ['T-901', firstParty, goodOrder, 'Email', 'Somebody else’s order', 'Normal', 'R. Nair', '2026-07-30T09:00', ''],
      ['T-902', 'GHOST CO', '', 'Email', 'No such party', 'Normal', 'R. Nair', '2026-07-30T09:00', '']] })));
  await page.click('#nav a[data-v="files"]');
  await page.setInputFiles('#sheetIn', f);
  await page.waitForTimeout(600);
  const staged = await page.evaluate(() => Medhava.DB.pending);
  check('the upload was staged, not written straight in', !!staged && staged.sheets[0].table === 'tickets');
  check('one good row accepted, two refused',
    staged && staged.sheets[0].ok === 1 && staged.sheets[0].bad === 2,
    staged ? `ok ${staged.sheets[0].ok} · bad ${staged.sheets[0].bad}` : '');
  const why = staged ? staged.rejected.map(r => r.why).join(' | ') : '';
  check('one refusal names the party that does not exist', /no party "GHOST CO"/.test(why));
  check('the other refusal says the order belongs to somebody else', /belongs to/.test(why), why.slice(0, 80));
  const tk0 = (await state()).tickets;
  await page.click('[data-act="commit"][data-mode="add"]');
  await page.waitForTimeout(300);
  check('committing brings in only the accepted row', (await state()).tickets === tk0 + 1);

  /* ── 6 · what comes out can go back in ── */
  const dl = await Promise.all([page.waitForEvent('download'), page.click('[data-act="xlsxdl"]')]);
  const saved = path.join(tmp, 'export.xlsx');
  await dl[0].saveAs(saved);
  const wb = SHEET.readXlsx(new Uint8Array(fs.readFileSync(saved)));
  check('the export is a real workbook, one sheet per table', wb.names.length === 7, wb.names.join(', '));
  const partiesOut = wb.sheets.Parties;
  check('the parties sheet has every party plus a heading row',
    partiesOut.length === (await state()).parties + 1);
  const docsOut = wb.sheets.Documents;
  check('the documents sheet carries the one-time code we recorded',
    docsOut.some(r => String(r.join('|')).indexOf('246810') >= 0));

  /* ── 7 · the rules still hold after all that ── */
  check('no document ended up filed against nothing', (await state()).orphans === 0);
  check('everything survived a reload', await (async () => {
    const s1 = await state();
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(250);
    const s2 = await state();
    return s1.parties === s2.parties && s1.docs === s2.docs && s1.tickets === s2.tickets;
  })());

  check('no console or script errors through all of that', errors.length === 0, errors[0] || '');
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}

(async () => {
  const files = process.argv.slice(2);
  for (const f of (files.length ? files : ['m04_ERP.html', 'm04_Vastrangam.html'])) await run(f);
  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}\n`);
  process.exit(failures ? 1 : 0);
})();
