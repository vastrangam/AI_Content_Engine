'use strict';
/* THE SHELL, DRIVEN IN A REAL BROWSER.
 *
 *   node medhava/test/shell.test.js
 *
 * WHY THIS EXISTS SEPARATELY FROM isolation.test.js
 * Every check in isolation.test.js was green while the sign-in card sat on top of a fully working
 * application and the first screen a two-company owner reached was a heading over nothing. Neither
 * defect can be seen from the API:
 *
 *   · `.gate{display:grid}` is an AUTHOR rule, and author rules beat the browser's own
 *     [hidden]{display:none} no matter the specificity — so `signin.hidden = true` did nothing.
 *     Only a rendering engine has an opinion about that.
 *   · an account with two companies begins with neither chosen, which is the server being
 *     careful. The shell had no screen for it, so `body.counts.forEach` threw into a blank page.
 *     The API answered 409 correctly the whole time.
 *
 * So the questions here are the ones only a browser can answer: is it visible, did it change when
 * I clicked, and did anything throw. Chromium is located through brand/suite/chrome.js — asked
 * once, for the reason written in that file.
 *
 * RED BEFORE GREEN
 * Each check below was proven by putting its defect back. What was planted, and what this file
 * said, is recorded on each one.
 */

const assert = require('node:assert');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const { chromePath, playwright } = require(path.join(ROOT, 'brand', 'suite', 'chrome.js'));
const db = require('../server/db.js');
const { seed } = require('../seed/demo.js');
const { server } = require('../server/index.js');

let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  try { await fn(); pass++; results.push(['ok  ', name]); }
  catch (e) {
    fail++; results.push(['FAIL', name]);
    console.error(`\n  FAIL  ${name}\n        ${String(e.message).split('\n').join('\n        ')}\n`);
  }
}

async function main() {
  await db.open();
  await seed();
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;

  const { chromium } = playwright();
  const browser = await chromium.launch({ executablePath: chromePath(), args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  /* Anything the page throws is a failure of the run, not a detail to look for later. */
  const thrown = [];
  page.on('pageerror', (e) => thrown.push(String(e.message)));
  page.on('requestfailed', (r) => thrown.push('request failed: ' + r.url()));

  await page.goto(base + '/', { waitUntil: 'networkidle' });

  /* ── B1 · the sign-in card must be gone once you are signed in ──
     RED: removed `[hidden]{display:none !important}` from style.css → "the sign-in card is still
     on the page after signing in, 561px tall", which is exactly what it looked like. */
  await test('B1  the sign-in card actually disappears after signing in', async () => {
    const accounts = await page.$$('#accounts button');
    assert.ok(accounts.length >= 2, 'the demo needs more than one account to sign in as');
    await accounts[0].click();                       // the two-company owner
    await page.waitForSelector('#app:not([hidden])', { timeout: 10000 });
    const h = await page.$eval('#signin', (e) => e.getBoundingClientRect().height);
    assert.strictEqual(h, 0,
      `the sign-in card is still on the page after signing in, ${Math.round(h)}px tall. ` +
      `The shell rendered underneath it, so the click looked like it had done nothing.`);
  });

  /* ── B2 · an account with two companies is ASKED, not guessed for ──
     RED: deleted the `if (!ME.companyId)` branch from draw() → "the first screen after signing in
     is a heading with nothing under it", the original defect, restored exactly. */
  await test('B2  a two-company account is asked which company, not shown a blank page', async () => {
    const text = await page.$eval('#main', (e) => e.innerText.trim());
    assert.ok(text.length > 60,
      `the first screen after signing in is a heading with nothing under it: ${JSON.stringify(text)}`);
    const choices = await page.$$('.choose button');
    assert.strictEqual(choices.length, 2,
      `expected the two companies to be offered, found ${choices.length} choices`);
  });

  /* ── B3 · the proof screen renders its figures, not just its argument ──
     RED: had /api/isolation return `{}` → "the isolation screen drew 0 figures", and the visible
     red panel from the render() guard appeared on the page instead of a silent blank. */
  await test('B3  the isolation screen shows a visible-versus-actual figure for each thing',
    async () => {
      await (await page.$('.choose button')).click();
      await page.waitForSelector('.proof .row', { timeout: 10000 });
      const rows = await page.$$eval('.proof .row', (rs) => rs.map((r) => r.innerText));
      assert.ok(rows.length >= 3, `the isolation screen drew ${rows.length} figures`);
      const nums = await page.$$eval('.proof .row', (rs) => rs.map((r) => ({
        you: Number(r.querySelector('.big.you').textContent),
        all: Number(r.querySelector('.big.all').textContent),
      })));
      for (const n of nums) {
        assert.ok(n.all > n.you,
          `a row shows ${n.you} visible against ${n.all} in the database. Equal figures mean the ` +
          `screen is drawing the same number twice and proving nothing.`);
      }
    });

  /* ── B4 · switching company changes the figures on the screen ──
     RED: had guard() serve `companies[0].id` instead of the session's chosen company → "both
     companies showed AE/26-27/0001, AE/26-27/0002, AE/26-27/0003 on screen."

     The FIRST attempt at this plant made the client reuse a stale session object, and B4 stayed
     green — correctly. The company lives in the server session, the POST had already switched it,
     and the orders changed regardless of what the client remembered. Recorded because the
     instinct was to distrust the check; the check was right and the plant was aimed at something
     that does not hold the value. */
  await test('B4  changing the company changes what the screen shows', async () => {
    const orders = async () => {
      await page.click('text=Orders');
      await page.waitForSelector('#main table tbody tr', { timeout: 10000 });
      return page.$$eval('#main table tbody tr', (rs) => rs.map((r) => r.cells[0].textContent));
    };
    const first = await orders();
    const opts = await page.$$eval('#company option', (o) => o.map((x) => x.value).filter(Boolean));
    assert.strictEqual(opts.length, 2, 'this check needs the two-company account');
    const current = await page.$eval('#company', (s) => s.value);
    await page.selectOption('#company', opts.find((v) => v !== current));
    await page.waitForTimeout(600);
    const second = await orders();
    assert.ok(first.length && second.length, `one company listed nothing: ${JSON.stringify([first, second])}`);
    const overlap = first.filter((n) => second.includes(n));
    assert.strictEqual(overlap.length, 0,
      `both companies showed ${overlap.join(', ')} on screen. The selector changed and the page ` +
      `did not, which is the worst of the three ways this can break: it looks like it worked.`);
  });

  /* ── B5 · every module page opens, and says what it is ──
     A module page that renders nothing is the same blank-page defect one level down, and there
     are as many chances to hit it as there are modules.
     RED: made the module view return early before appending .spec → named the first module whose
     page came up empty. */
  await test('B5  every module page opens and is labelled as specified, not built', async () => {
    const MODULES = require(path.join(ROOT, 'brand', 'site', 'modules.js'));
    const count = await page.$$eval('nav button', (b) => b.length);
    assert.strictEqual(count - MODULES.length, 4,
      `the navigation offers ${count} buttons — 4 platform pages plus one per module was ` +
      `expected against ${MODULES.length} modules`);
    /* Re-queried every iteration, because buildNav() rebuilds the whole navigation on each click
       to move the highlight. A handle taken before the click is detached by the time it is used,
       and the first version of this failed on exactly that. */
    for (let i = 0; i < MODULES.length; i++) {
      const buttons = await page.$$('nav button');
      await buttons[buttons.length - MODULES.length + i].click();
      await page.waitForTimeout(60);
      const text = await page.$eval('#main', (e) => e.innerText);
      assert.ok(text.includes(MODULES[i].name),
        `module ${MODULES[i].n} opened a page that does not name it`);
      assert.match(text, /specified and not built/,
        `module ${MODULES[i].n} shows app names with no mark saying the screens are not built. ` +
        `A list of app names on a working shell reads as a working app.`);
    }
  });

  /* ── B6 · nothing threw, anywhere in all of that ──
     Collected across every click above rather than checked at one moment. A page that throws
     halfway through a render leaves a partial screen, which is a screen somebody will believe. */
  await test('B6  the page threw nothing and no request failed', async () => {
    assert.deepStrictEqual(thrown, [], `the browser reported: ${thrown.join(' | ')}`);
  });

  console.log('');
  results.forEach(([mark, name]) => console.log(`  ${mark}  ${name}`));
  console.log('');
  console.log('  ' + '='.repeat(68));
  console.log(`  ${pass} passed, ${fail} failed`);
  if (!fail) console.log('  Driven in Chromium: clicked, switched company, and opened every module.');
  console.log('');

  await browser.close();
  await new Promise((r) => server.close(r));
  await db.close();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('\nthe suite itself failed:', e); process.exit(1); });
