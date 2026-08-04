'use strict';
/* HD screenshots of every screen of Module 02, in populated states, for the PDF books.
   Four apps × two editions. Every shot is taken from the shipped file at double resolution,
   after the screen has been driven into the state the book talks about — a real refusal
   actually triggered, a real one-time code actually recorded, a real spreadsheet actually
   uploaded. Nothing here is staged in a mock-up. */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path'), os = require('os');
const OUT = path.join(__dirname, 'out'), SH = path.join(__dirname, 'shots');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SHEET = require(path.join(__dirname, '..', 'xlsx.js'));
if (!fs.existsSync(SH)) fs.mkdirSync(SH, { recursive: true });

const BUILDS = [
  { file: 'crm_ERP.html', tag: 'CRM_ERP', kind: 'crm' },
  { file: 'crm_Vastrangam.html', tag: 'CRM_VAS', kind: 'crm' },
  { file: 'docs_ERP.html', tag: 'DOC_ERP', kind: 'doc' },
  { file: 'docs_Vastrangam.html', tag: 'DOC_VAS', kind: 'doc' },
  { file: 'helpdesk_ERP.html', tag: 'HD_ERP', kind: 'hd' },
  { file: 'helpdesk_Vastrangam.html', tag: 'HD_VAS', kind: 'hd' },
  { file: 'm02_ERP.html', tag: 'U2_ERP', kind: 'uni' },
  { file: 'm02_Vastrangam.html', tag: 'U2_VAS', kind: 'uni' },
];

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'm02shots-'));
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  for (const bd of BUILDS) {
    const page = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, acceptDownloads: true });
    page.on('dialog', d => d.accept());
    await page.goto('file://' + path.join(OUT, bd.file), { waitUntil: 'load' });
    const shot = async (name) => {
      await page.waitForTimeout(160);
      await page.waitForFunction(() => {
        var t = document.getElementById('toast');
        return !t || !t.classList.contains('show');
      }, { timeout: 4000 }).catch(() => {});
      await page.screenshot({ path: path.join(SH, bd.tag + '_' + name + '.png'), fullPage: true });
      process.stdout.write('  ' + bd.tag + '_' + name + '\n');
    };
    const view = async (v) => { await page.click(`#nav a[data-v="${v}"]`); await page.waitForTimeout(180); };
    const p1 = await page.evaluate(() => Medhava.DB.parties[0].id);
    const both = bd.kind === 'uni';

    if (bd.kind === 'crm' || both) {
      await view('dash'); await shot('dash');
      await view('pipe'); await shot('pipe');
      await view('cust'); await shot('cust');
      await page.click('[data-act="setseg"][data-s="Champion"]').catch(() => {});
      await page.waitForTimeout(220); await shot('cust_champion');
      await page.click('[data-act="setseg"][data-s="all"]').catch(() => {});
      await page.waitForTimeout(150);
      await page.click(`[data-act="setparty"][data-p="${p1}"]`); await page.waitForTimeout(280);
      await shot('person');
      await view('segs'); await shot('segs');
    }

    if (bd.kind === 'crm') {
      /* The gate this app exists for, actually pressed: win the deal at a company that is
         already a customer, and show that the deal has left the pipeline while the customer
         list has not grown. Taken last, so every shot above is still the state it ships in. */
      await view('pipe');
      const known = await page.evaluate(() => {
        const DB = Medhava.DB, M = Medhava.M02;
        const l = M.openLeads(DB).filter(x => M.findParty(DB, x.co))[0]; return l ? l.id : null; });
      if (known) {
        await page.click(`[data-act="win"][data-id="${known}"]`);
        await page.waitForTimeout(420);
        await shot('pipe_won');
        await view('cust'); await shot('cust_after_win');
      }
    }

    if (bd.kind === 'doc' || both) {
      await view('docdash'); await shot('docdash');
      await view('docs'); await shot('docs');
      /* try to file against a record that does not exist — the refusal is the feature */
      await page.fill('#d_title', 'Test agreement').catch(() => {});
      await page.fill('#d_against', 'NO-SUCH-RECORD').catch(() => {});
      await page.fill('#d_signer', 'A Signer').catch(() => {});
      await page.click('[data-act="adddoc"]'); await page.waitForTimeout(400);
      await shot('docs_refused_filing');
      await page.click('[data-act="dismiss"]').catch(() => {}); await page.waitForTimeout(200);
      /* the signature gate, in three states */
      const sent = await page.evaluate(() => {
        const d = Medhava.M02.awaitingSignature(Medhava.DB)[0]; return d ? d.id : null; });
      if (sent) {
        await page.click(`[data-act="seldoc"][data-id="${sent}"]`); await page.waitForTimeout(260);
        await shot('docs_code_panel');
        await page.fill('#sg_code', '').catch(() => {});
        await page.click('[data-act="signdoc"]'); await page.waitForTimeout(400);
        await shot('docs_refused_signature');
        await page.click('[data-act="dismiss"]').catch(() => {}); await page.waitForTimeout(200);
        await page.click(`[data-act="seldoc"][data-id="${sent}"]`); await page.waitForTimeout(240);
        await page.fill('#sg_code', '246810').catch(() => {});
        await page.click('[data-act="signdoc"]'); await page.waitForTimeout(450);
        await shot('docs_signed');
      }
    }

    if (bd.kind === 'hd' || both) {
      await view('deskdash'); await shot('deskdash');
      await view('tickets'); await shot('tickets');
      await page.click('[data-act="settktf"][data-f="unanswered"]').catch(() => {});
      await page.waitForTimeout(240); await shot('tickets_unanswered');
      const quiet = await page.evaluate(() => {
        const t = Medhava.M02.unanswered(Medhava.DB)[0]; return t ? { id: t.id, party: t.party } : null; });
      if (quiet) {
        await page.click(`[data-act="seltkt"][data-id="${quiet.id}"]`); await page.waitForTimeout(320);
        await shot('ticket');
        await page.click('[data-act="closetkt"]'); await page.waitForTimeout(400);
        await shot('ticket_refused_close');
        await page.click('[data-act="dismiss"]').catch(() => {}); await page.waitForTimeout(200);
        const other = await page.evaluate(p => {
          const o = Medhava.DB.orders.filter(x => x.party !== p)[0]; return o ? o.id : null; }, quiet.party);
        if (other) {
          await page.fill('#tk_order', other).catch(() => {});
          await page.click('[data-act="attachorder"]'); await page.waitForTimeout(400);
          await shot('ticket_refused_order');
          await page.click('[data-act="dismiss"]').catch(() => {}); await page.waitForTimeout(200);
        }
        await page.fill('#tk_reply', 'Looking into this right now — I will come back within the hour.').catch(() => {});
        await page.click('[data-act="replytkt"]'); await page.waitForTimeout(450);
        await shot('ticket_answered');
      }
    }

    if (both) {
      await view('records'); await shot('records');
      await page.click('[data-act="settab"][data-t="docs"]'); await page.waitForTimeout(260);
      await shot('records_docs');
      await page.click('[data-act="settab"][data-t="parties"]'); await page.waitForTimeout(200);
      await view('files'); await shot('files');
      const goodOrder = await page.evaluate(p => Medhava.DB.orders.filter(o => o.party !== p)[0].id, p1);
      const f = path.join(tmp, 'upload.xlsx');
      fs.writeFileSync(f, Buffer.from(SHEET.writeXlsx({
        Tickets: [['Ticket', 'Party', 'About which order', 'Arrived by', 'Subject', 'Priority', 'Handled by', 'Opened at', 'Closed at'],
          ['T-900', p1, '', 'Email', 'A fine new ticket', 'Normal', 'R. Nair', '2026-07-30T09:00', ''],
          ['T-901', p1, goodOrder, 'Email', 'Somebody else’s order', 'Normal', 'R. Nair', '2026-07-30T09:00', ''],
          ['T-902', 'GHOST CO', '', 'Email', 'No such party', 'Normal', 'R. Nair', '2026-07-30T09:00', '']] })));
      await page.setInputFiles('#sheetIn', f); await page.waitForTimeout(750);
      await shot('files_staged');
      await page.click('[data-act="commit"][data-mode="add"]'); await page.waitForTimeout(550);
      await shot('files_done');
      await view('person');
      await page.click(`[data-act="setparty"][data-p="${p1}"]`); await page.waitForTimeout(320);
      await shot('person_after');
    }

    await view('wiring'); await shot('wiring');
    await view('connect'); await shot('connect');
    await view('backup'); await page.waitForTimeout(2200); await shot('backup');
    await page.close();
  }
  await b.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('\nshots done');
})();
