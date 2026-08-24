'use strict';
/* THE BUILD GUIDE — content as data, one source, two editions.
 *
 * WHY THIS IS DATA AND NOT A MARKDOWN FILE
 * Two guides get written. Written twice by hand they drift in the first week, and the
 * day one is corrected is the day they stop agreeing — the same failure modules.js and
 * rules.js exist to prevent. So the content lives here once, brand/delivery/website/
 * mkguide.js formats it, and the edition supplies only WORDS.
 *
 * WHAT A STEP IS
 * A step is one thing a person does in one sitting, and it carries three things a
 * paragraph does not:
 *
 *   cmd     what to actually type, or the exact place to click
 *   expect  what should come back — so "did that work?" has an answer
 *   done    the condition that makes the step finished rather than attempted
 *
 * A step with no `done` is a suggestion, and mkguide.js refuses it. That is the whole
 * discipline here: "set up your environment" is a paragraph; "run node --version and
 * see v22.5 or higher" is a step.
 *
 * LABELS ARE NOT DECORATION
 * Every step says what it really is. A reader must never reach a step that quietly
 * assumes software nobody has written:
 *
 *   WORKS TODAY   the command runs now, in this repository, and was run while writing this
 *   MANUAL        no command — a browser, a phone, a form, another company’s website
 *   DEMO          it runs, but on its own storage rather than the shared core
 *   SPEC          designed and documented; the code does not exist yet
 *   NOT BUILT     nothing exists; this is the work itself
 *
 * TOKENS
 * Prose carries __NAME__, __DOMAIN__, __REPO__, __PACK__ and __TRADE__. The generator
 * substitutes them per edition. Nothing here names a trade — checkneutral.js scans this
 * file, and a trade word typed into a neutral source is the exact leak that gate exists
 * to catch.
 *
 * Straight apostrophes read wrong in the PDF; use the typographic ’ in prose.
 */

/* ── Part 0 · close this project ──────────────────────────────────────────── */

const P0 = {
  n: 0,
  title: 'Close this project properly',
  lead: `You are archiving the project that produced all of this, and starting fresh. An archive is
only worth having if you can tell, a year from now, which files mattered. Most of what is in there is
generated and will regenerate; a small number of files are the actual source of truth, and losing one
of those means rebuilding a decision rather than copying it.

**One codebase comes out of this, not two.** __NAME__ is the software — a platform other businesses
sign up to and run their companies inside, the way a business signs up to Zoho or Odoo. A specific
trade is a **tenant**: a row, an industry pack and its own data, created in a browser. A tenant is
never a second repository, a second server or a second version of the software, and the day it
becomes one is the day the product stops being a platform. Onboarding a tenant has its own guide,
written for somebody with no terminal.`,
  steps: [
    {
      id: '0.1', label: 'WORKS TODAY',
      do: 'Check that no key and no customer data ever went into the repository',
      why: `Do this before archiving, not after. An archived repository is still readable, and a key
committed once stays in the history even if the file is deleted later.`,
      cmd: `git log --all --diff-filter=A --name-only --format= | sort -u | grep -E "\\.env$|^app/data/"`,
      expect: 'Nothing at all. Any line here is a file that was committed and needs the key rotated.',
      done: 'The command prints nothing.',
    },
    {
      id: '0.2', label: 'WORKS TODAY',
      do: 'Tag the final commit so the archive has a named end',
      cmd: `git tag -a archive-final -m "final state before the Medhava and __NAME__ projects"\ngit push origin archive-final`,
      expect: 'The tag appears on the repository’s tags page.',
      done: 'You can reach the exact final state by name rather than by scrolling.',
    },
    {
      id: '0.3', label: 'WORKS TODAY',
      do: 'Build the two sendable archives and download them',
      why: 'These hold the finished documents with their screenshots, and resolve outside the repo.',
      cmd: `node brand/delivery/website/mkbundle.js            # the neutral edition\nnode brand/delivery/website/mkbundle.js <edition>  # the trade edition`,
      expect: 'One .zip per edition at the repository root, each a few MB.',
      done: 'Both ZIPs are downloaded and open on your own machine, pictures and all.',
    },
    {
      id: '0.4', label: 'MANUAL',
      do: 'Keep this list of what actually matters',
      why: `Everything else in the archive is generated from these. If you had to rebuild the project
from nothing, this is the list you would want.`,
      table: {
        head: ['File', 'Why it is irreplaceable'],
        rows: [
          ['`brand/site/modules.js`', 'The one canonical list. Every module, every app, in order. The website, every document and every count read it.'],
          ['`brand/site/rules.js`', 'The rulebook — what the system refuses to do. Each rule names the test that proves it.'],
          ['`brand/site/tools.js`', 'The free-first register: for every capability, the free option and the exact trigger that makes it worth paying.'],
          ['`brand/site/shots.js`', 'The product screens, as data. What each screen shows, per sector.'],
          ['`brand/site/walkthrough.js`', 'The reader’s tour, structured so the website and the documents cannot tell it differently.'],
          ['`core/schema.postgres.sql`', 'The production database. The design decisions in its comments are worth more than the DDL.'],
          ['`core/packs/*.json`', 'The industry packs. A trade as a row of configuration.'],
          ['`core/*.js`', 'The engines: money as integer paise, the ledger, stock, audit, events.'],
          ['`brand/identity/`', 'The logo and brand assets.'],
          ['`CLAUDE.md`', 'The working agreement, and the lessons already paid for. Carry this into both new projects.'],
        ],
      },
      done: 'You have this list somewhere outside the repository.',
    },
    {
      id: '0.5', label: 'MANUAL',
      do: 'Archive the repository on GitHub',
      why: 'Archiving makes it read-only rather than deleting it. Nothing is lost and nothing changes under you.',
      cmd: null,
      manual: 'GitHub → the repository → Settings → scroll to the bottom → Archive this repository.',
      expect: 'The repository page shows a "This repository has been archived" banner.',
      done: 'The old project is read-only and the two new ones can start without confusion about which is live.',
    },
  ],
};

/* ── Part 1 · the slow clocks ─────────────────────────────────────────────── */

const P1 = {
  n: 1,
  title: 'Start the slow clocks — day one, before any technical work',
  lead: `Three of these wait on other people, and nothing you build makes them faster. Meta’s business
verification in particular can take days or weeks. Start them on the first day, then go and do Part 2
while they run — the alternative is finishing the software and then waiting three weeks to send a
message.`,
  steps: [
    {
      id: '1.1', label: 'MANUAL',
      do: 'Start Meta Business verification',
      why: `WhatsApp broadcasting needs a verified business behind it. This is the longest clock and it
cannot be shortened, only started earlier.`,
      manual: `business.facebook.com → create or open your Business Manager → Business Settings →
Security Centre → Start Verification.`,
      needs: [
        'Your business’s legal name, exactly as it appears on the registration',
        'GST certificate, or a utility bill in the business name',
        'A business phone number and a business email on your own domain',
        '**A phone number not currently active on WhatsApp** — this is the one people get wrong. A number already on WhatsApp Business has to be migrated or a different number used.',
      ],
      expect: 'Status moves to "Pending". Meta comes back by email.',
      done: 'Verification is submitted. Not approved — submitted. Approval is theirs to give.',
    },
    {
      id: '1.2', label: 'MANUAL',
      do: 'Open the Interakt account and connect it to the verified business',
      why: `Interakt is the WhatsApp provider. It cannot finish onboarding until 1.1 clears, so start
the account now and let it wait at that step rather than starting from zero afterwards.`,
      manual: 'interakt.shop → sign up → connect the WhatsApp Business Account created in 1.1.',
      expect: 'The account exists and is waiting on Meta’s verification.',
      done: 'Everything on your side is submitted; the only thing outstanding is Meta.',
      warn: `This is the first line you will genuinely pay for. The free-first register marks WhatsApp
as one of the few capabilities with **no free path at all** — a monthly platform fee plus Meta’s own
per-conversation charge. Check both current prices yourself before committing; any figure quoted from
memory would be out of date.`,
    },
    {
      id: '1.3', label: 'MANUAL',
      do: 'Point the domain’s nameservers from BigRock to Hostinger',
      why: `One panel then manages both the VPS A-record and the mail MX records. Two panels managing
one domain is how a record ends up edited in the place that is no longer authoritative.`,
      manual: `BigRock → Manage Domain → Name Servers → replace with the nameservers Hostinger shows in
hPanel → Domains.`,
      expect: 'Usually live within a few hours; occasionally 24–48.',
      check: `dig +short NS __DOMAIN__`,
      checkExpect: 'Hostinger’s nameservers, not BigRock’s.',
      done: 'The `dig` command returns Hostinger’s nameservers.',
    },
    {
      id: '1.4', label: 'MANUAL',
      do: 'Buy the two hosting products',
      why: `They do different jobs and neither replaces the other: shared hosting exists for
\`@__DOMAIN__\` email, the VPS exists to run things.`,
      table: {
        head: ['Product', 'What it is for', 'Sizing'],
        rows: [
          ['Shared hosting', 'Business email on your own domain', 'The smallest plan that includes mailboxes'],
          ['VPS', 'The website, the apps, n8n, Ollama', '4 GB RAM / 2 vCPU'],
        ],
      },
      expect: 'Ubuntu LTS on the VPS, and an IP address you can SSH to.',
      done: 'You have the VPS IP address and root access to it.',
      warn: `Prices change and I cannot check them from here — read Hostinger’s current pricing rather
than any figure from me. What is worth knowing is what the 4 GB buys you, and Part 5 does that
arithmetic honestly.`,
    },
  ],
};

/* ── Part 2 · your machine ────────────────────────────────────────────────── */

const P2 = {
  n: 2,
  title: 'Set up your machine',
  lead: `Five tools. Each step has a version check, because "I installed it" and "the right version is
on the PATH" are different facts and only the second one matters. Do these in order — the Node version
in particular is not a preference.`,
  steps: [
    {
      id: '2.1', label: 'WORKS TODAY',
      do: 'Install Node.js 22.5 or newer',
      why: `Not a round number picked for comfort. \`core/db.js\` uses \`node:sqlite\`, a built-in that
landed in **Node 22.5**. On Node 20 the database layer does not load at all and 32 tests fail with
"No such built-in module". This is not hypothetical — it is exactly what happened when CI was first
set up with Node 20, and it is why \`package.json\` declares \`engines.node >=22.5.0\`.`,
      manual: 'nodejs.org → the LTS download for your operating system.',
      cmd: `node --version`,
      expect: '`v22.5.0` or higher. If it prints v20 or v18, the install did not take or an older Node is earlier on your PATH.',
      done: '`node --version` prints 22.5 or higher.',
    },
    {
      id: '2.2', label: 'WORKS TODAY',
      do: 'Install git and sign in to GitHub',
      cmd: `git --version\ngit config --global user.name  "Your Name"\ngit config --global user.email "you@__DOMAIN__"`,
      expect: 'A version, then no output from the two config lines — that is success.',
      done: 'You can clone a private repository of your own without being asked for a password.',
    },
    {
      id: '2.3', label: 'WORKS TODAY',
      do: 'Install Python 3',
      why: 'The markdown-to-PDF half of the document pipeline is Python; the browser half is Node.',
      cmd: `python3 --version\npython3 -m pip install pdfplumber`,
      expect: '`Python 3.10` or higher, then pdfplumber installs.',
      done: 'Both commands succeed.',
      note: `\`pdfplumber\` is not needed to make a PDF — it is needed to **read one back and check it**.
That check is the reason a whole diagram that silently vanished into a blank page was caught at all.`,
    },
    {
      id: '2.4', label: 'WORKS TODAY',
      do: 'Install a code editor',
      manual: 'VS Code from code.visualstudio.com. Any editor works; this one is what the team notes assume.',
      done: 'You can open a folder and edit a file in it.',
    },
    {
      id: '2.5', label: 'WORKS TODAY',
      do: 'Make sure a Chromium is available for the document and screenshot steps',
      why: `Diagrams are drawn by a real browser, and screenshots are photographs of real screens. Step
3.4 installs one into the project, which is the simplest route — this step is only for confirming
afterwards, or for pointing at a browser you already have.`,
      cmd: `# after step 3.4, confirm the project can find one:\nnode -e "console.log(require('./brand/suite/chrome.js').chromePath())"`,
      expect: 'A path to a chrome binary.',
      done: 'That command prints a path instead of raising an error.',
      note: `If it cannot find one, set \`CHROME_PATH\` to a browser you already have and it will be
used ahead of everything else. One file answers "where is Chromium" for the whole project —
\`brand/suite/chrome.js\`. Seventeen files used to each carry their own answer, all of them correct on
exactly one machine.`,
    },
  ],
};

/* ── Part 3 · the new repository ──────────────────────────────────────────── */

const P3 = {
  n: 3,
  title: 'Build the new repository from empty',
  lead: `This part ends with \`npm test\` green on a machine that has never seen the project. That is
the real gate: not "the files are copied" but "a second person could do this". Everything in Part 3 was
run exactly as written while this guide was being made.`,
  steps: [
    {
      id: '3.1', label: 'MANUAL',
      do: 'Create the empty repository',
      manual: 'GitHub → New repository → name it `__REPO__` → **Private** → no README, no .gitignore, no licence.',
      why: 'Empty, because the first commit comes from your machine and an auto-generated README just has to be merged around.',
      done: 'The repository exists and is empty.',
    },
    {
      id: '3.2', label: 'WORKS TODAY',
      do: 'Start it locally and write .gitignore FIRST',
      why: `Before any other file. A \`.gitignore\` added after the first commit does not un-commit
anything, and the two entries that matter here are a key file and a folder of customer photographs.`,
      cmd: `mkdir __REPO__ && cd __REPO__\ngit init\n\ncat > .gitignore <<'EOF'\n# YOUR WORK AND YOUR KEYS — never commit either.\napp/.env\napp/data/\n\n# Installed packages — npm ci puts them back from the lockfile.\nnode_modules/\napp/node_modules/\n\n# Generated: rebuild with the script that made them.\nbrand/suite/deep/out/*.html\nbrand/site/shots/\nbrand/site/sec/\nengine/out/\n*.html.tmp\nEOF\n\ngit add .gitignore && git commit -m "gitignore first: keys and customer data never enter history"`,
      expect: 'One commit, one file.',
      done: 'The very first commit in the repository is the .gitignore.',
    },
    {
      id: '3.3', label: 'MANUAL',
      do: 'Copy the source files from the archive',
      why: `Copy the sources, not the generated output. Anything generated will regenerate in 3.6, and
copying a stale generated file is how a document ends up disagreeing with the code that produced it.`,
      table: {
        head: ['Copy', 'Leave behind'],
        rows: [
          ['`brand/site/*.js` and `*.css`, `*.html`', '`brand/site/index.html` — generated'],
          ['`brand/delivery/website/mk*.js`', 'the per-edition output folders beside them — generated'],
          ['`brand/suite/` and `brand/identity/`', '`brand/suite/deep/out/` — generated'],
          ['`core/` in full, including `tests/` and `packs/`', '—'],
          ['`tools/report_pdf.py`, `tools/report_pdf.js`', '—'],
          ['`deploy/`, `DEPLOYMENT.md`, `CLAUDE.md`', '—'],
          ['`package.json`, `package-lock.json`', '`node_modules/` — reinstalled'],
          ['`.github/workflows/ci.yml`', '—'],
          ['`app/` **except** `data/`, `.env`, `node_modules/`, `web/`', 'those four'],
        ],
      },
      cmd: `# ARCHIVE is wherever you extracted the old project. Run from inside __REPO__.\nARCHIVE=../old-project\n\nmkdir -p brand/site brand/delivery/website core tools deploy .github/workflows app\n\ncp $ARCHIVE/brand/site/*.js $ARCHIVE/brand/site/*.css $ARCHIVE/brand/site/*.html brand/site/\nrm -f brand/site/index.html brand/site/index_vastrangam.html   # generated, not source\n\ncp $ARCHIVE/brand/delivery/website/mk*.js brand/delivery/website/\ncp -r $ARCHIVE/brand/suite $ARCHIVE/brand/identity brand/\nrm -rf brand/suite/deep/out                                    # generated, not source\n\ncp -r $ARCHIVE/core/* core/\ncp $ARCHIVE/tools/report_pdf.py $ARCHIVE/tools/report_pdf.js tools/\ncp -r $ARCHIVE/deploy/* deploy/\ncp $ARCHIVE/.github/workflows/ci.yml .github/workflows/\ncp $ARCHIVE/package.json $ARCHIVE/package-lock.json .\ncp $ARCHIVE/DEPLOYMENT.md $ARCHIVE/CLAUDE.md $ARCHIVE/*PLAN_OF_ACTION.md .\n\n# app/, minus the four that never travel\nfor f in $ARCHIVE/app/*; do\n  case "$(basename "$f")" in data|.env|node_modules|web) ;; *) cp -r "$f" app/ ;; esac\ndone`,
      expect: 'No errors. The folder is a few hundred MB, most of it the brand assets.',
      check: `test -e app/data && echo "PROBLEM: customer data copied" || echo "app/data: correctly absent"\ntest -e app/.env && echo "PROBLEM: key file copied"      || echo "app/.env:  correctly absent"`,
      checkExpect: 'Both lines say correctly absent. If either says PROBLEM, delete it before the next commit.',
      done: 'The folder holds the sources and none of the generated output, and neither the key file nor the data folder came across.',
    },
    {
      id: '3.4', label: 'WORKS TODAY',
      do: 'Install the toolchain from the lockfile',
      why: `\`npm ci\` installs exactly what the lockfile pins. \`npm install\` may resolve something
newer, which is how two machines end up on different versions of a diagram renderer and produce
different documents from the same source.`,
      cmd: `npm ci\n\n# A browser is needed for the diagrams and screenshots. Check before downloading one —\n# many machines already have a usable Chromium, and this saves a ~150 MB download.\nnode -e "console.log(require('./brand/suite/chrome.js').chromePath())" \\\n  || npx playwright install chromium`,
      expect: 'Packages installed from the lockfile, then either a browser path printed or one downloaded.',
      done: 'Both finish without an error, and the second line ends with a path to a chrome binary.',
      note: `If you already have Chrome or Chromium somewhere unusual, set \`CHROME_PATH\` to it and
skip the download entirely — an explicit answer wins over every other candidate.`,
    },
    {
      id: '3.5', label: 'WORKS TODAY',
      do: 'Run every check before writing a single line of new code',
      why: `This is the gate. If it is green, the project is reproducible and a second developer can
join. If it is not, fix that before anything else — a broken baseline makes every later failure
ambiguous.`,
      cmd: `npm test`,
      expect: `Each suite reports in turn: the industry packs including the added-at-run-time trade,
the two schema files agreeing, the companies-and-channels grid, the rulebook, the free-first register,
the neutrality gate, and the three generated-region idempotency checks.`,
      done: 'Every suite passes. No failures, no skips you did not read.',
    },
    {
      id: '3.6', label: 'WORKS TODAY',
      do: 'Build the website and the documents',
      cmd: `npm run build\nnpm run docs`,
      expect: '`overflow 0 | errors 0` from each build, then the screenshots and documents regenerate.',
      done: 'Both editions build clean and the documents exist again, generated rather than copied.',
    },
    {
      id: '3.7', label: 'WORKS TODAY',
      do: 'Commit and push, then confirm CI goes green',
      why: `CI is the thing that tells you the project works somewhere that is not your laptop. It has
already earned its place: it caught three real portability bugs — the wrong Node version, a browser path
that existed on one machine, and a dependency installed at the wrong level. Every one of them would
otherwise have surfaced on the server.`,
      cmd: `git add -A\ngit commit -m "the project, from its sources"\ngit remote add origin git@github.com:<you>/__REPO__.git\ngit push -u origin main`,
      expect: 'GitHub → Actions → the run goes green.',
      done: 'A commit pushed from your machine passes every check on a machine that is not yours.',
    },
  ],
};

/* ── Part 4 · the website live ────────────────────────────────────────────── */

const P4 = {
  n: 4,
  title: 'Put __DOMAIN__ live',
  lead: `The website is a built, self-contained file. Publishing it is DNS, nginx and a certificate —
not development. **The server commands live in \`DEPLOYMENT.md\` and are not repeated here.** That file
is written to be followed line by line and it is current; restating it in this guide would produce a
second copy that goes stale the first time one of them is corrected.`,
  steps: [
    {
      id: '4.1', label: 'WORKS TODAY',
      do: 'Build the site and look at it locally before anyone else can',
      cmd: `npm run build\n# then open brand/site/index.html in a browser`,
      expect: '`overflow 0 | errors 0`, and a page that scrolls cleanly with no overlapping text.',
      done: 'You have opened it and looked at it. Not just seen the exit code.',
      note: `Worth saying plainly, because it cost a whole diagram once: **a green exit code is not a
legible page.** The build checks what it can measure. It cannot tell you the page reads well.`,
    },
    {
      id: '4.2', label: 'MANUAL',
      do: 'Secure the VPS before anything listens on it',
      manual: '`DEPLOYMENT.md` §1.1 — a non-root sudo user, SSH keys only, `ufw` allowing 22/80/443, fail2ban, unattended upgrades.',
      done: 'Password login is off and you have confirmed key login works **in a second terminal you left open**.',
      warn: `Confirm key login in a second terminal before disabling password login. If the key is
wrong and you have already closed the only working session, you are locked out of your own server.`,
    },
    {
      id: '4.3', label: 'MANUAL',
      do: 'Add swap',
      manual: '`DEPLOYMENT.md` §1.2 — 4 GB of swap.',
      why: 'Not for speed. So a model loading into memory cannot OOM-kill n8n beside it.',
      done: '`free -m` shows a swap line.',
    },
    {
      id: '4.4', label: 'MANUAL',
      do: 'Point the DNS records at the VPS',
      manual: '`DEPLOYMENT.md` §1.3 — A records for the bare domain, `www`, `app` and `n8n`; MX records to Hostinger for mail.',
      check: `dig +short __DOMAIN__`,
      checkExpect: 'Your VPS IP address.',
      done: '`dig` returns the VPS IP.',
    },
    {
      id: '4.5', label: 'MANUAL',
      do: 'Install nginx and the TLS certificates',
      manual: '`DEPLOYMENT.md` §1.4 — the three server blocks from `deploy/nginx/`, then certbot.',
      done: 'Certificates issued for all four hostnames, and auto-renewal is armed.',
    },
    {
      id: '4.6', label: 'WORKS TODAY',
      do: 'Publish',
      why: `\`deploy/publish-site.sh\` rebuilds before it uploads, and uploads to a temporary name and
moves the file into place. A visitor mid-request never sees a half-written page.`,
      cmd: `./deploy/publish-site.sh`,
      expect: 'The site rebuilds, uploads and is moved into place.',
      done: 'The three checks below all pass.',
      check: `curl -sSI https://__DOMAIN__ | head -1\ncurl -sS  https://__DOMAIN__ | grep -c "Industry packs"\ncurl -sSI https://www.__DOMAIN__ | head -1`,
      checkExpect: '`200 OK`, a non-zero count proving it is the real page and not a placeholder, and `www` resolving too.',
    },
  ],
};

/* ── Part 5 · the services ────────────────────────────────────────────────── */

const P5 = {
  n: 5,
  title: 'The VPS services — and honest arithmetic about 4 GB',
  lead: `4 GB is a real constraint. Planning around it beats discovering it, so here is the arithmetic
before the steps.`,
  table: {
    head: ['What', 'Roughly'],
    rows: [
      ['OS + nginx', '400 MB'],
      ['The Node app', '200 MB'],
      ['n8n', '400 MB'],
      ['**Left for a model**', '**~3.0 GB**'],
      ['Ollama with a 3B model, Q4', '2.0 GB — fits, with room'],
      ['Ollama with a 7B model, Q4', '4.4 GB — **does not fit**'],
    ],
  },
  steps: [
    {
      id: '5.1', label: 'MANUAL',
      do: 'Put Postgres on the Supabase free tier, not on the VPS',
      why: `It keeps roughly 400 MB of RAM free for the model, and it brings daily backups you would
otherwise have to build. The free-first register already names this as the free option, with the exact
trigger for paying: past 500 MB of data or 50,000 monthly active users, or when point-in-time recovery
is needed.`,
      manual: 'supabase.com → new project → SQL editor → paste `core/schema.postgres.sql` → run.',
      expect: 'Every table created.',
      done: 'The tables exist and you have the connection string, stored somewhere private.',
      note: `Nothing in the schema is Supabase-specific except the row-level security policies reading
auth context — about a dozen lines. Moving to Postgres on your own VPS later is a restore, not a
rewrite.`,
    },
    {
      id: '5.2', label: 'MANUAL',
      do: 'Install n8n behind nginx with authentication',
      manual: '`DEPLOYMENT.md` §2.2.',
      check: `curl -sSI https://n8n.__DOMAIN__ | head -1`,
      checkExpect: '`401` or a redirect to a login — reachable **and** protected. A `200` here means it is open to the internet.',
      done: 'It answers, and it does not let you in without credentials.',
    },
    {
      id: '5.3', label: 'MANUAL',
      do: 'Install Ollama and pull a 3B model',
      manual: '`DEPLOYMENT.md` §2.3.',
      check: `ollama run llama3.2:3b "reply OK" --verbose`,
      checkExpect: 'A reply, and a tokens-per-second figure. On 2 vCPU expect roughly 4–10 tokens/second.',
      done: 'You have measured the tokens/sec on your own box rather than taken a number from a document.',
      note: `That speed is genuinely useful for classifying, tagging and short summaries, and genuinely
slow for long drafting. When drafting quality matters, the Provider Router falls through to a paid model
**with a spend ceiling in front of it** — over the ceiling the paid provider is refused, not warned
about, and the work finishes on a free one.`,
    },
    {
      id: '5.4', label: 'MANUAL',
      do: 'Set up backups on the first day, not the first incident',
      manual: '`DEPLOYMENT.md` §2.5 — a nightly dump of the database plus the VPS configuration, copied off the box.',
      why: 'A backup that lives only on the machine it protects is not a backup.',
      done: 'A backup has been restored once, into a scratch database, to prove it restores.',
    },
  ],
};

/* ── Part 6 · the apps as a demo ──────────────────────────────────────────── */

const P6 = {
  n: 6,
  title: 'The working apps, published as a labelled demo',
  lead: `__NBUILT__ of the __NAPP__ apps run today. Each is a real single-file application carrying its
own self-tests and passing a click-through audit in both editions. They also run on **their own
storage**, not the shared data core — which is why this part says demo and keeps saying it. Rewiring
them onto the core is the first job of Part 7, not a footnote here.`,
  steps: [
    {
      id: '6.1', label: 'WORKS TODAY',
      do: 'Build the apps and run the click-through audit',
      cmd: `node brand/suite/deep/build_deep.js\nnode brand/suite/deep/check_deep.js`,
      expect: '0 test failures, and 0 apps with problems.',
      done: 'Both report zero.',
    },
    {
      id: '6.2', label: 'DEMO',
      do: 'Put the app server behind nginx, password-gated',
      manual: '`DEPLOYMENT.md` §2.4 — the systemd unit from `deploy/medhava-app.service`, nginx at `app.__DOMAIN__`.',
      check: `curl -sSI https://app.__DOMAIN__ | head -1`,
      checkExpect: '`401`. Anything else means the demo is open to the internet.',
      done: 'It is reachable and it asks for a password.',
    },
    {
      id: '6.3', label: 'MANUAL',
      do: 'Put the keys on the server only',
      cmd: `# on the server, never in the repository\nnano /opt/app/.env\nchmod 600 /opt/app/.env`,
      done: '`.env` exists on the server, is mode 600, and `git status` in your repository shows nothing.',
      warn: `Model keys are entered in-app at runtime and live in a file that is never committed.
**Nothing in this system ever asks you for a marketplace, bank or account password** — not this guide,
not the software, not a support conversation. If anything ever does, it is not us.`,
    },
    {
      id: '6.4', label: 'MANUAL',
      do: 'Label the demo on the page itself',
      why: `Someone will open it who was not in the conversation where you called it a demo. The label
belongs on the screen, not in the sentence that introduced it.`,
      manual: `Add a banner to the app’s landing screen reading: "Demo — __NBUILT__ of __NAPP__ apps,
running on their own storage. Figures shown are illustrative."`,
      done: 'Anyone opening it can tell in five seconds that this is a demo on its own storage.',
    },
  ],
};

/* ── Part 8 · the next real step ──────────────────────────────────────────── */

const P8 = {
  n: 8,
  title: 'Start here — Phase 1, and the gate that is not yet proven',
  lead: `Part 7 lists all the work. This part names the single next thing, because it is both the
highest-risk item in the whole plan and one where the design is ahead of the proof.`,
  steps: [
    {
      id: '8.1', label: 'NOT BUILT',
      do: 'Add the tenants table',
      why: `The plan says a tenant is a row, above company — that is what makes onboarding a business
data entry rather than a deployment. **There is no \`tenants\` table in either schema file.** Companies
exist; the level above them does not.`,
      done: '`tenants` exists in both schema files, `companies` carries `tenant_id`, and the schema test that compares the two files passes.',
    },
    {
      id: '8.2', label: 'NOT BUILT',
      do: 'Prove the isolation against a real Postgres',
      why: `Row-level security **is** written: every company-scoped table gets a policy carrying both
\`USING\` and \`WITH CHECK\`, so a read and a write are separately prevented from crossing. And the test
that guards it checks the **text** of those policies — that every table is covered, that no table is
listed that does not exist, that both clauses are present. It has never started a database.

The gate for this phase is *"two tenants exist and neither can read a single row of the other, **proved
by a test that tries**"*. Nothing tries yet. A policy that is written and never executed is a policy
whose behaviour is assumed.`,
      done: `A test starts a real Postgres, loads the real schema, creates two tenants with data, and
tenant A asking for tenant B’s record by its primary key gets **zero rows**. And the same test, run with
the policy removed, **fails** — because a test that has never failed has not been shown to test
anything.`,
      warn: `The case worth writing carefully is the one where no tenant is set at all. Depending on how
the setting is read, that either raises or quietly returns **everything**. Assert the behaviour rather
than reasoning about it.`,
    },
    {
      id: '8.3', label: 'NOT BUILT',
      do: 'Only then mark the rule enforced',
      why: `The rulebook has __NRULES__ rules, __NENF__ of them marked ENFORCED, and an ENFORCED rule
must name a test that really exists — the checker fails the build otherwise. There is currently **no
tenancy rule at all**. Add it after 8.2 passes, never before.`,
      done: 'A tenancy rule exists, is marked ENFORCED, names the test from 8.2, and the rulebook checker passes.',
    },
  ],
};

/* ── Part 9 · running it ──────────────────────────────────────────────────── */

const P9 = {
  n: 9,
  title: 'Running it',
  lead: 'What to watch, what it costs, and what to do when something breaks.',
  steps: [
    {
      id: '9.1', label: 'WORKS TODAY',
      do: 'The health check, whenever something feels wrong',
      cmd: `curl -sSI https://__DOMAIN__ | head -1\ncurl -sSI https://app.__DOMAIN__ | head -1\ncurl -sSI https://n8n.__DOMAIN__ | head -1\nssh vps 'free -m; systemctl is-active nginx n8n ollama'`,
      expect: '200 for the site, 401 for the two protected hosts, every service active.',
      done: 'You know which of the four is unhappy before you start guessing.',
    },
    {
      id: '9.2', label: 'MANUAL',
      do: 'Watch swap, not RAM',
      why: `On a 4 GB box \`free -m\` is the number that tells the truth. Swap touched occasionally is
fine. Swap in constant use means the model is too big for the box — and the fix is a bigger VPS or a
smaller model, not patience.`,
      cmd: `ssh vps 'free -m'                      # while the model is actually answering\nssh vps 'vmstat 5 5'                   # si/so columns: sustained non-zero is the bad sign`,
      expect: 'Some swap used is normal. The `si`/`so` columns steadily non-zero is not.',
      done: 'You have looked at `free -m` under real load at least once, so you know what normal is.',
    },
  ],
  cost: {
    head: ['', 'Monthly'],
    rows: [
      ['VPS 4 GB', 'Check Hostinger’s current price'],
      ['Shared hosting, for mail', 'Check Hostinger’s current price'],
      ['Domain', 'Already yours'],
      ['Supabase, GitHub, n8n, Ollama, nginx, certbot', '**Free**'],
      ['Interakt + Meta per-conversation', 'Check both current rates'],
    ],
    note: `Everything except the servers and WhatsApp is free, and stays free until a trigger that is
written down rather than guessed at. The free-first register carries __NTOOLS__ capabilities, and every
paid one names both its free option and the exact condition that makes paying worth it. I have not
checked any live price and will not quote one from memory.`,
  },
};

module.exports = { parts: [P0, P1, P2, P3, P4, P5, P6, P8, P9] };

/* ── the gate on this file ────────────────────────────────────────────────── */
/* A step with no `done` is a suggestion, and a suggestion in a runbook is where a reader
   stops being able to tell whether they finished. Checked here rather than in the
   generator so the failure names the step. */
module.exports.check = function check() {
  const bad = [];
  for (const p of module.exports.parts) {
    if (typeof p.n !== 'number' || !p.title || !p.lead) bad.push(`part ${p.n}: missing n, title or lead`);
    for (const s of p.steps) {
      if (!s.done) bad.push(`step ${s.id}: no "done when" — that makes it a suggestion`);
      if (!s.do) bad.push(`step ${s.id}: no action`);
      if (!s.label) bad.push(`step ${s.id}: no label — a reader cannot tell if this works today`);
      /* A NOT BUILT step has no command because the command does not exist yet — writing
         one would be inventing an interface. It owes the reader an explanation instead,
         so `why` is required exactly where `cmd` is excused. Every other label describes
         something that exists, and something that exists can be typed or clicked. */
      if (s.label === 'NOT BUILT') {
        if (!s.why) bad.push(`step ${s.id}: NOT BUILT with no "why" — say what is missing`);
      } else if (!s.cmd && !s.manual && !s.table && !s.check) {
        bad.push(`step ${s.id}: neither a command nor a place to click`);
      }
      if (/'/.test([s.do, s.why, s.note, s.warn].filter(Boolean).join(' '))) {
        bad.push(`step ${s.id}: straight apostrophe in prose — use the typographic ’`);
      }
    }
  }
  return bad;
};
