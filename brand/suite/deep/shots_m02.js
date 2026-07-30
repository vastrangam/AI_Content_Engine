'use strict';
/* Module 02 · CRM — walks a real workflow end to end (add a lead, move it on, win one, lose one,
   filter a segment, open a customer, log a note) and captures HD screenshots for the PDF books.
   Any console error, script error, or blank screen fails the run. */
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out'), SH = path.join(__dirname, 'shots');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
if (!fs.existsSync(SH)) fs.mkdirSync(SH, { recursive: true });

const BUILDS = [
  { file: 'crm_ERP.html', tag: 'CRM_ERP', lead: { name: 'Sanjana Rao', co: 'Westport Retail Pvt Ltd', val: '365000' } },
  { file: 'crm_Vastrangam.html', tag: 'CRM_VAS', lead: { name: 'Sanjana Rao', co: 'Bandhej House (Jodhpur)', val: '365000' } },
];

(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  let bad = 0;
  for (const bd of BUILDS) {
    const page = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    page.on('dialog', d => d.accept());
    await page.goto('file://' + path.join(OUT, bd.file), { waitUntil: 'load' });

    const shot = async (name) => {
      await page.waitForTimeout(160);
      if (!(await page.$('#main h1'))) { errors.push('blank screen at ' + name); return; }
      await page.screenshot({ path: path.join(SH, bd.tag + '_' + name + '.png'), fullPage: true });
      process.stdout.write('  ' + bd.tag + '_' + name + '\n');
    };
    const view = async (v) => { await page.click(`#nav a[data-v="${v}"]`); await page.waitForTimeout(140); };
    const num = async (fn) => await page.evaluate(fn);

    await view('dash');   await shot('dash');

    /* ── pipeline: add a lead, then move it on ── */
    await view('pipe');   await shot('pipe');
    const openBefore = await num(() => Medhava.DB.leads.filter(l => l.status === 'open').length);
    await page.fill('#l_name', bd.lead.name);
    await page.fill('#l_co', bd.lead.co);
    await page.fill('#l_val', bd.lead.val);
    await page.click('[data-act="addlead"]'); await page.waitForTimeout(350);
    const openAfter = await num(() => Medhava.DB.leads.filter(l => l.status === 'open').length);
    if (openAfter !== openBefore + 1) errors.push('addlead did not add a lead');
    await shot('pipe_added');

    // move the new lead on one stage (it is the last in the array, and starts at "new")
    const idxNew = await num(() => Medhava.DB.leads.length - 1);
    const stage0 = await num(() => Medhava.DB.leads[Medhava.DB.leads.length - 1].stage);
    await page.click(`#main [data-act="advance"][data-i="${idxNew}"]`); await page.waitForTimeout(350);
    const stage1 = await num(() => Medhava.DB.leads[Medhava.DB.leads.length - 1].stage);
    if (stage0 !== 'new' || stage1 !== 'contacted') errors.push(`advance went ${stage0} -> ${stage1}`);
    await shot('pipe_advanced');

    // win it — a customer must appear
    const custBefore = await num(() => Medhava.DB.customers.length);
    await page.click(`#main [data-act="win"][data-i="${idxNew}"]`); await page.waitForTimeout(400);
    const custAfter = await num(() => Medhava.DB.customers.length);
    const stillOpen = await num(() => Medhava.DB.leads[Medhava.DB.leads.length - 1].status);
    if (custAfter !== custBefore + 1) errors.push('winning a lead did not create a customer');
    if (stillOpen !== 'won') errors.push('winning a lead left status ' + stillOpen);
    await shot('pipe_won');

    // lose one of the seeded open deals
    const loseIdx = await num(() => Medhava.DB.leads.findIndex(l => l.status === 'open'));
    await page.click(`#main [data-act="lose"][data-i="${loseIdx}"]`); await page.waitForTimeout(400);
    const lostOk = await num(i => Medhava.DB.leads.filter(l => l.status === 'lost').length, loseIdx);
    if (lostOk < 4) errors.push('lose did not register');

    /* ── customers ── */
    await view('cust');   await shot('cust');
    await page.click('#main [data-act="seg"][data-s="At risk"]'); await page.waitForTimeout(300);
    await shot('cust_atrisk');
    await page.click('#main [data-act="seg"][data-s="all"]'); await page.waitForTimeout(300);

    /* ── customer 360: open the top customer, log a note ── */
    await page.click('#main [data-act="open"]'); await page.waitForTimeout(350);
    await shot('person');
    const notesBefore = await num(() => Medhava.DB.notes.length);
    await page.fill('#n_text', 'Agreed the festive indent on the call. Sending the rate sheet today.');
    await page.click('[data-act="addnote"]'); await page.waitForTimeout(400);
    const notesAfter = await num(() => Medhava.DB.notes.length);
    if (notesAfter !== notesBefore + 1) errors.push('addnote did not log a note');
    await shot('person_note');

    await view('segs');   await shot('segs');
    await view('wiring'); await shot('wiring');
    await view('backup'); await page.waitForTimeout(2200); await shot('backup');

    const st = await page.evaluate(() => window.__selftest);
    const ok = st && st.fail === 0 && errors.length === 0;
    if (!ok) bad++;
    console.log(`${ok ? 'OK ' : 'XX '} ${bd.file.padEnd(22)} tests ${st.pass}/${st.pass + st.fail}  workflow errs ${errors.length}${errors.length ? ' :: ' + errors.join(' | ').slice(0, 200) : ''}\n`);
    await page.close();
  }
  await b.close();
  console.log(`${BUILDS.length} builds · ${bad} with problems`);
  process.exit(bad ? 1 : 0);
})();
