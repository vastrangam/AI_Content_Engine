'use strict';
/* HOW TO BUILD MEDHAVA — the path from a downloaded archive to a working app.
 *
 * WHY THIS EXISTS SEPARATELY FROM guide.js PART 13
 * Part 13 is "from an empty machine to a live product": `git init`, `npm init -y`, `createdb`.
 * It is the path somebody takes to build this platform from NOTHING, and it is still correct for
 * that. It is the wrong first page for somebody holding MEDHAVA_BOS.zip, where the schema, the
 * server, the gates and one working write path already exist and the database needs no install at
 * all. Following Part 13 with the archive in hand means re-creating what you already have.
 *
 * So this is the entry document, and it starts where a reader actually starts: a zip file.
 *
 * THE SHAPE OF EVERY STEP
 *   do        the instruction, in the imperative
 *   why       what goes wrong if you skip it — omitted only where it is obvious
 *   cmd       a real command; mkhowto.js refuses to write if it names a file or script that is
 *             not in the repository
 *   expect    what you should see, quoted from a real run rather than described
 *   check     how to know it worked before moving on
 *   warn      the trap at this step, where there is one
 *
 * Every count in the rendered document is read from source at generation time. Nothing is typed.
 */

/* ── Part 1 · get it running ─────────────────────────────────────────────── */

const RUNNING = {
  title: 'Get it running',
  lede: 'About thirty minutes, most of it waiting for `npm ci`. Do not skip the verify step — ' +
    'building on a suite you have not seen pass is how a whole day goes into a fault that was ' +
    'there before you started.',
  steps: [
    {
      id: '1.1',
      do: 'Check the machine has Node 22.5 or newer',
      why: 'The core tests use `node:sqlite`, a built-in that landed in 22.5. On Node 20 they ' +
        'fail with "No such built-in module: node:sqlite" — 32 of them, all pointing at the ' +
        'wrong thing.',
      cmd: 'node --version',
      expect: 'v22.5.0 or higher. If it is lower, install a newer Node before going on.',
      check: 'The number after v is 22.5 or more.',
    },
    {
      id: '1.2',
      do: 'Unpack the archive and go into it',
      cmd: 'unzip MEDHAVA_BOS.zip\ncd medhava-bos',
      expect: 'A folder holding CLAUDE.md, START_HERE.md, medhava/, core/, brand/ and package.json.',
      check: 'START_HERE.md is there. Read it — it is one page and it says what is built and ' +
        'what is not.',
    },
    {
      id: '1.3',
      do: 'Install the toolchain from the committed lockfile',
      why: 'From the lockfile, not from the registry\u2019s latest: the versions are pinned so your ' +
        'machine gets the same ones this was verified against.',
      cmd: 'npm ci',
      expect: 'A few hundred packages, no errors. It takes a couple of minutes.',
      check: 'node_modules/ exists and the command exited without an error.',
    },
    {
      id: '1.4',
      do: 'Prove the copy you have actually works, before touching anything',
      why: 'This is the whole point of the step. Everything after it assumes a green starting ' +
        'point, and a fault you inherit is indistinguishable from one you cause.',
      cmd: 'npm run test:product',
      expect: 'Each gate reports in turn, then the suites: the schema in real PostgreSQL, the ' +
        'sales module, and the browser checks. The command exits 0.',
      check: 'Exit code 0. Check it explicitly if your shell does not show it: `echo $?`.',
      warn: 'If it says "7 browser checks SKIPPED, not passed", your machine has no Chromium. ' +
        'That is step 1.5 and the run still exits 0 — but those checks did not run, so the ' +
        'screens are unverified until they do.',
    },
    {
      id: '1.5',
      do: 'Install Chromium, if the browser checks were skipped',
      why: 'playwright-core is in the lockfile; the browser it drives is not, because that is a ' +
        'few hundred megabytes of platform binary no lockfile should carry.',
      cmd: 'npx playwright install chromium',
      expect: 'A download, then `npm run test:product` reports 9 browser checks passing instead ' +
        'of skipping.',
      check: 'Run `npm run test:product` again. The SKIPPED banner is gone.',
    },
    {
      id: '1.6',
      do: 'Start it',
      cmd: 'npm start',
      expect: 'The schema loads into PostgreSQL in a few seconds, then:\n\n' +
        '    PostgreSQL 18.3 (PGlite) on wasm32-unknown-linux-gnu\n' +
        '    151 tables · 135 row-level policies active\n' +
        '    2 businesses · 3 companies (seeded)\n' +
        '    open        http://localhost:4000',
      check: 'The URL answers. Leave it running and open it in a browser.',
      warn: 'No database to install. PGlite is real PostgreSQL compiled to WebAssembly and it ' +
        'is a dependency, not a service. In production you swap this one file for a connection ' +
        'pool — see DEPLOYMENT.md — and nothing above it changes.',
    },
    {
      id: '1.7',
      do: 'Sign in and open the Isolation page',
      why: 'It is the platform\u2019s central claim made visible: two unrelated businesses on one ' +
        'database, neither able to reach the other.',
      expect: 'Sign in as owner@anjali.demo. The page shows, for orders, products and channels, ' +
        'what this company can see against what the database actually holds — 3 against 7. The ' +
        'gap is enforced by PostgreSQL row-level security, not by a filter the code remembered.',
      check: 'Change the company in the top-right selector. The figures change and never overlap.',
    },
    {
      id: '1.8',
      do: 'Record a sale, so you have seen the one built write path work',
      why: 'Reading is not the same as watching it post. This is the pattern every other app ' +
        'will follow.',
      expect: 'Choose a channel, add a line, press "Post the sale". A receipt names the order ' +
        'and the invoice, and shows the tax split to the paisa. One transaction moved the ' +
        'stock, raised the invoice and posted the ledger — or none of it would have happened.',
      check: 'Open Orders. The sale is there. Open Isolation. The other company still cannot ' +
        'see it.',
    },
  ],
};

/* ── Part 2 · read before you type ───────────────────────────────────────── */

const READ = {
  title: 'Read these five things before writing any code',
  lede: 'In this order. Together they are about an hour, and they replace a week of finding out ' +
    'the same things by breaking them.',
  steps: [
    {
      id: '2.1',
      do: 'CLAUDE.md — the working agreement',
      why: 'It is loaded automatically at the start of every Claude Code session, so it governs ' +
        'the agent whether or not you have read it. Section 0 is the one that matters most: ' +
        'Medhava is the product, a tenant is a customer, and the two are never mixed.',
      check: 'You can say what "derive, never retype" means and why it is treated as ' +
        'fabrication to break it.',
    },
    {
      id: '2.2',
      do: 'brand/site/modules.js — the one canonical list',
      why: 'Every module and app name, in order. Nothing types a count from it; everything ' +
        'reads it. It has already changed twice, which is why.',
      cmd: 'node -e "const M=require(\'./brand/site/modules.js\');' +
        'console.log(M.length+\' modules, \'+M.reduce((n,m)=>n+m.apps.length,0)+\' apps\');' +
        'M.forEach(m=>console.log(m.n, m.name, \'·\', m.apps.length))"',
      expect: 'The module list with its app counts, derived from the file rather than typed here.',
    },
    {
      id: '2.3',
      do: 'brand/site/rules.js — what each module must do, and must never do',
      why: 'Every rule carries a `never`: the wrong behaviour it exists to prevent. A rule ' +
        'marked ENFORCED must name a file and a test that really exist, and checkrules.js ' +
        'fails the build otherwise — so a rule cannot claim a proof it does not have.',
      cmd: 'node brand/site/checkrules.js --summary',
      expect: 'A table of rules per module, how many are enforced, and the honest total: the ' +
        'enforced ones are backed by a test that runs today; the rest are the build queue.',
    },
    {
      id: '2.4',
      do: 'medhava/ — the running platform, five files',
      why: 'This is the whole product as it stands. It is small on purpose.',
      expect: 'server/db.js — the isolation everything rests on, and the only way to the data.\n' +
        'server/api.js — every business route wrapped in guard().\n' +
        'server/sales.js — the one built write path, module 05.\n' +
        'seed/demo.js — two unlike businesses.\n' +
        'web/app.js — the screens.',
      check: 'You can explain why withContext() drops to the `authenticated` role, and what ' +
        'would happen if it did not.',
      warn: 'Read the comment at the top of db.js in full. It records a measurement: a superuser ' +
        'bypasses every row-level policy even with FORCE ROW LEVEL SECURITY, so an app that ' +
        'connects as itself has no isolation and nothing about the running system looks wrong.',
    },
    {
      id: '2.5',
      do: 'medhava/test/sales.test.js — the worked example of the test discipline',
      why: 'This is the file to imitate. Every check records what was planted to make it fail ' +
        'and what it said when it caught it. Three of its checks were found to be decoration ' +
        'that way, including one that restated its own arithmetic and could never fail.',
      cmd: 'node medhava/test/sales.test.js',
      expect: '10 checks, each naming the rule it enforces. The one to read first is S7 — if ' +
        'the ledger refuses, the stock never moved.',
    },
  ],
};

/* ── Part 3 · the loop ───────────────────────────────────────────────────── */

const LOOP = {
  title: 'Build the next app — the loop, repeated once per app',
  lede: 'One app at a time, always in this order. The order is not a preference: writing the ' +
    'test after the code produces a test shaped like the code rather than like the rule, and it ' +
    'will pass on the bug.',
  steps: [
    {
      id: '3.1',
      do: 'Pick one app, and read the rules it must satisfy',
      why: 'The rules are the specification. Building from the app name alone invents ' +
        'requirements and misses the ones that matter.',
      cmd: 'node -e "const R=require(\'./brand/site/rules.js\');' +
        'R.filter(r=>r.mod===\'03\').forEach(r=>console.log(r.id,\'[\'+r.state+\']\',r.title,' +
        '\'\\n  WHEN \'+r.when+\'\\n  THEN \'+r.then+\'\\n  NEVER \'+r.never+\'\\n\'))"',
      expect: 'Every rule for module 03, with what it must never do instead. Change the two ' +
        'digits for a different module.',
      check: 'You have a list of the rules you intend to enforce, and know which ones you are ' +
        'deliberately leaving SPECIFIED.',
    },
    {
      id: '3.2',
      do: 'Write the server module, next to sales.js',
      why: 'Follow the existing pattern rather than inventing one. It takes a scope from the ' +
        'session and reaches the database only through db.withContext or db.withTransaction.',
      warn: 'If the operation writes more than one table, it MUST be withTransaction. A sale ' +
        'that deducts stock and then fails to post the ledger leaves the goods gone and the ' +
        'books untouched, and nothing about the running system looks wrong — the stock figure ' +
        'is simply short forever, with no record to reconcile it against.',
      check: 'Nothing in the file takes a company id from the request body. The company comes ' +
        'from the session, always.',
    },
    {
      id: '3.3',
      do: 'Add the route, wrapped in guard()',
      why: 'guard() gives 401 with no session, 409 with no company chosen, 403 for a company ' +
        'you do not belong to. There is deliberately no route that opts out.',
      warn: 'A business route that returns `200 []` to an unauthenticated caller reads as ' +
        'success in every log anybody will look at, and is exactly what a system with broken ' +
        'isolation returns.',
      check: 'curl the route with no cookie. It answers 401, not an empty list.',
    },
    {
      id: '3.4',
      do: 'Add the screen',
      why: 'A route with no screen is not an app. Follow the shape of the "Record a sale" ' +
        'screen: a refusal must name the rule that refused it, because "invalid input" teaches ' +
        'nobody what to change.',
      check: 'Drive it in a browser, not with curl. A form that posts correctly to curl and does ' +
        'nothing to a click is a form nobody can use — that exact defect shipped here once, and ' +
        'every API test was green while it did.',
    },
    {
      id: '3.5',
      do: 'Write the test, one check per rule you enforced',
      why: 'Name the rule in the check\u2019s title. Six months from now the connection between a ' +
        'rule and the thing that proves it is the only thing that keeps either honest.',
      check: 'Every check\u2019s failure message says what went wrong in business terms, not ' +
        '"expected 3 to equal 4".',
    },
    {
      id: '3.6',
      do: 'Prove every check fails before you trust that it passes',
      why: 'THE STEP PEOPLE SKIP, AND THE ONLY ONE THAT MAKES THE REST MEAN ANYTHING. Break the ' +
        'thing the check is supposed to catch, run the suite, and confirm that check — not some ' +
        'other one — goes red. Then put it back.',
      expect: 'A check that catches nothing is decoration. A check that catches the wrong thing ' +
        'is measuring something else. Both look identical to a green run.',
      check: 'For each check: it went red, it was the right one, and its message named the real ' +
        'problem.',
      warn: 'When a plant does not fire, suspect the plant before the check. Two of the plants ' +
        'written here were aimed at code that did not hold the value being tested, and the ' +
        'checks were right to stay green.',
    },
    {
      id: '3.7',
      do: 'Promote the rules you enforced, in brand/site/rules.js',
      why: 'Change `...S` to `state:\'ENFORCED\'` and add `by:` naming the file and the exact ' +
        'test title. This is what makes the rulebook a record rather than a wish.',
      cmd: 'node brand/site/checkrules.js --summary',
      expect: 'The enforced count goes up. If you named a test that does not exist, this ' +
        'refuses — it reads the file and looks for the title.',
    },
    {
      id: '3.8',
      do: 'Run everything, and read the exit code',
      cmd: 'npm run test:product',
      expect: 'Exit 0, with your new checks in the list.',
      check: 'Exit code 0. Not "it looked fine".',
      warn: 'Run this AFTER your last edit, not before. A file created after the suite ran is ' +
        'untested — that happened here, and CI caught what the local run could not have.',
    },
    {
      id: '3.9',
      do: 'Commit, saying what you verified',
      why: 'The message is where the next person learns what was proven and what was assumed.',
      cmd: 'git add -A\ngit commit',
      check: 'The message names the rules enforced, what was planted to prove each check, and ' +
        'the command whose output you are relying on.',
    },
  ],
};

/* ── Part 4 · using Claude Code for this ─────────────────────────────────── */

const AGENT = {
  title: 'Doing it with Claude Code',
  lede: 'The archive is set up so an agent starts with the right context instead of guessing.',
  steps: [
    {
      id: '4.1',
      do: 'Open the unpacked folder as the project',
      why: 'CLAUDE.md is loaded automatically from the project root. Opening a parent folder or ' +
        'a subfolder means it is not, and the agent works without the rules.',
      check: 'Ask it what CLAUDE.md section 0 says. If it cannot answer, the folder is wrong.',
    },
    {
      id: '4.2',
      do: 'Paste MEDHAVA_BOS_PROMPT.md as the first message',
      why: 'It says what already exists, so the agent does not rebuild a 151-table schema that ' +
        'runs. Its first section verifies you have the right thing and stops if you do not — ' +
        'that check exists because an archive of documents was once handed to an agent, which ' +
        'then invented the files it could not find.',
      check: 'Its opening check passes. If it reports missing paths, you are in the wrong ' +
        'folder or have an incomplete copy.',
    },
    {
      id: '4.3',
      do: 'Ask for one app at a time, and name the module number',
      why: '"Build the CRM module" is a week of work with no checkpoint. "Build module 03 ' +
        'Inventory, the on-hand figure only, with a test per rule proven red first" is a day ' +
        'with something to verify at the end of it.',
      check: 'The ask names a module number, one deliverable, and the command that will decide ' +
        'whether it worked. If you cannot say what you would run to check it, the ask is too big.',
      warn: 'Do not accept "tests pass" without the output. The anti-cheat skill in ' +
        '.claude/skills/ is installed for this and applies automatically — but you are the one ' +
        'who has to notice when a claim arrives without evidence attached.',
    },
    {
      id: '4.4',
      do: 'Check the work yourself in the browser before moving on',
      why: 'Every screen defect found in this project was found by driving it in a browser, ' +
        'and every one of them was invisible to the API tests that were green at the time.',
      cmd: 'npm start',
      check: 'You clicked the thing. It did what it said.',
    },
  ],
};

/* ── Part 5 · when it breaks ─────────────────────────────────────────────── */

const TROUBLE = {
  title: 'When something breaks',
  lede: 'Every one of these happened during the build. The message is quoted as it actually ' +
    'appears.',
  steps: [
    {
      id: '5.1',
      do: '"No such built-in module: node:sqlite"',
      expect: 'Node is older than 22.5. 32 of the core tests fail together and none of them ' +
        'says the word "node". Install a newer Node.',
    },
    {
      id: '5.2',
      do: '"7 browser checks SKIPPED, not passed"',
      expect: 'No Chromium on the machine. `npx playwright install chromium`. The run still ' +
        'exits 0 and that is deliberate — a missing browser is your environment, not a defect ' +
        'in the code — but the screens are unverified until those checks run.',
    },
    {
      id: '5.3',
      do: '"Port 4000 is already in use"',
      expect: 'Something is already listening, often an earlier `npm start` you forgot. Start ' +
        'on another port: `PORT=4100 npm start`.',
    },
    {
      id: '5.4',
      do: '"refusing to query without both a tenant and a company"',
      expect: 'Your code reached the database without a scope. This is db.js refusing on ' +
        'purpose rather than returning rows. Pass the scope from the session — never from the ' +
        'request body.',
    },
    {
      id: '5.5',
      do: '"…is not in the archive" from mkprompts or mkskills',
      expect: 'A document names a path that does not exist. Either the path is wrong or the ' +
        'file is genuinely missing. These gates exist so a reader is never sent to a file ' +
        'nobody wrote.',
    },
    {
      id: '5.6',
      do: 'checkcoverage: "sits with the documents and is neither delivered nor explained"',
      expect: 'You added a markdown file at the root. Every document there owes a decision — ' +
        'add it to DOCS in brand/delivery/manifest.js, or to NOT_DELIVERED with a reason.',
    },
    {
      id: '5.7',
      do: 'A check that will not go red when you break the thing it tests',
      expect: 'Suspect the plant first: it may be aimed at code that does not hold the value. ' +
        'If the plant is right and the check still passes, the check is decoration — rewrite ' +
        'it against an independent recomputation rather than against its own parts.',
    },
  ],
};

/* ── Part 6 · going live ─────────────────────────────────────────────────── */

const LIVE = {
  title: 'Going live',
  lede: 'Not yet — but here is what changes when you do, so nothing in the build surprises you ' +
    'later.',
  steps: [
    {
      id: '6.1',
      do: 'Swap PGlite for a PostgreSQL server',
      why: 'One file changes: medhava/server/db.js opens a connection pool instead of an ' +
        'in-process database. Everything above it is unchanged, because everything above it ' +
        'only ever calls withContext().',
      check: 'DEPLOYMENT.md section 6a. Read it before you provision anything.',
    },
    {
      id: '6.2',
      do: 'Connect as a role that is neither a superuser nor the owner of the tables',
      why: 'THE SINGLE LINE THAT DECIDES WHETHER ISOLATION EXISTS AT ALL. A superuser bypasses ' +
        'every policy even on a table with FORCE ROW LEVEL SECURITY. That was measured against ' +
        'a running database, not assumed.',
      cmd: 'node core/tests/live.test.js',
      expect: 'It runs the schema into a real PostgreSQL and asks it, as three different roles, ' +
        'what each can see. Read what it prints about the superuser.',
      warn: 'Get this wrong and every screen still works, every report still returns numbers, ' +
        'and one business is reading another\u2019s books.',
    },
    {
      id: '6.3',
      do: 'Follow DEPLOYMENT.md for the rest',
      why: 'nginx, the systemd unit, backups, secrets. It is a runbook rather than a ' +
        'discussion, and it assumes the checks above already pass.',
      check: 'Every command in it ran and you read its output.',
    },
  ],
};

const PARTS = [RUNNING, READ, LOOP, AGENT, TROUBLE, LIVE];

/* ── the shape checker, run by mkhowto before it writes ──────────────────── */
function check() {
  const bad = [];
  const seen = new Set();
  PARTS.forEach((p, i) => {
    if (!p.title) bad.push(`part ${i} has no title`);
    if (!p.steps || !p.steps.length) bad.push(`part ${i} has no steps`);
    (p.steps || []).forEach((s) => {
      if (!s.id) bad.push(`a step in "${p.title}" has no id`);
      if (seen.has(s.id)) bad.push(`step id ${s.id} is used twice`);
      seen.add(s.id);
      if (!s.do) bad.push(`step ${s.id} has no instruction`);
      /* A step must tell the reader how to know it worked. Otherwise it is a suggestion. */
      if (!s.check && !s.expect) {
        bad.push(`step ${s.id} says what to do and not how to know it worked — every step owes ` +
          `a "check" or an "expect", or the reader cannot tell a success from a silent failure`);
      }
    });
  });
  return bad;
}

module.exports = { PARTS, check };
