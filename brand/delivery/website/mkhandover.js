'use strict';
/* THE HANDOVER PACK — what to buy, what to do, and how to carry this to another tool.
 *
 *   node brand/delivery/website/mkhandover.js
 *   node brand/delivery/website/mkhandover.js --check
 *
 * WRITES FOUR DOCUMENTS
 *   START_HERE_OWNER.md       open this first
 *   SETUP_CHECKLIST.md        what to buy and switch on, in order
 *   SEVEN_STAGE_ROADMAP.md    the owner's seven stages, his order, his numbering
 *   WORKING_WITH_AI_TOOLS.md  Claude, Codex, Grok — carrying the project between them
 *
 * WHO THESE ARE FOR, AND WHY THEY READ DIFFERENTLY FROM EVERYTHING ELSE HERE
 * Every other delivered document is written for whoever builds the platform. These four are
 * written for the person who OWNS it, who said plainly: "I can't understand technical
 * aspects." So they use no term they do not explain, they say who does each thing rather
 * than leaving it to be assumed, and where something cannot be done by an AI at all they
 * say so in the same sentence rather than in a footnote.
 *
 * NOTHING IS RETYPED THAT ALREADY EXISTS. DEPLOYMENT.md already covers DNS, the machine,
 * certificates, the database role, backups, monitoring and the health check.
 * BUILD_QUEUE.md already orders the work. tools.js already holds every free option, paid
 * option and the trigger between them, gated by checktools.js. These documents point at
 * those and add the one thing none of them has: an order for THIS owner's stack, and what
 * to do when a subscription runs out mid-project.
 *
 * EVERY NUMBER IS READ, NEVER TYPED. Counts, statuses, the score and the maturity level all
 * come from registry.js and audit.js at generation time, so the handover cannot claim more
 * than the gated registers allow. A document that told the owner more had been built than
 * the registry admits would be the exact failure this project spent a session removing.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

const SETUP = require(path.join(SITE, 'setup.js'));
const HANDOVER = require(path.join(SITE, 'handover.js'));
const TOOLS = require(path.join(SITE, 'tools.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const REGISTRY = require(path.join(SITE, 'registry.js'));
const AUDIT = require(path.join(SITE, 'audit.js'));
const RULES = require(path.join(SITE, 'rules.js'));
const RENDER = require(path.join(SITE, 'registers.js'));

const checkOnly = process.argv.includes('--check');

const toolRows = Array.isArray(TOOLS) ? TOOLS : Object.values(TOOLS).find(Array.isArray);
const TOOL = new Map(toolRows.map((t) => [t.id, t]));

const ROWS = REGISTRY.rows(MODULES);
const APPS = ROWS.filter((r) => r.kind === 'app');
const byId = new Map(ROWS.map((r) => [r.id, r]));
const SCORE = AUDIT.score(ROWS);
const tested = APPS.filter((r) => r.status === 'TESTED').length;
const specified = APPS.filter((r) => r.status === 'SPECIFIED').length;
const enforced = RULES.filter((r) => r.state === 'ENFORCED').length;

const L = [];
const w = (s) => L.push(s);
const reset = () => { L.length = 0; };
const esc = (s) => String(s).replace(/\|/g, '\\|');

/* The glossary section, only for the words a document actually uses — the same renderer
   every other document here uses, so a term is never explained two different ways. */
function finish(lines) {
  const body = lines.join('\n');
  const gloss = RENDER.glossarySection({ only: body, heading: '###' });
  return body + (gloss
    ? '\n\n---\n\n## Every technical word above, in plain language\n\n' + gloss
    : '') + '\n';
}

/* ══ 1 · START HERE ═══════════════════════════════════════════════════════ */
function startHere() {
  reset();
  w('# Start here');
  w('');
  w('This is the first thing to open. It is written for the person who owns this project,');
  w('not for whoever builds it, and it explains every term it uses.');
  w('');
  w('---');
  w('');
  w('## What this project is');
  w('');
  w(`**Medhava** is the software: one system meant to run a business, described as`);
  w(`${MODULES.length} modules containing ${APPS.length} apps, with ${RULES.length} written`);
  w('rules about how it must behave.');
  w('');
  /* THE PRODUCT'S HANDOVER NAMES NO CUSTOMER — including his own. The first draft wrote
     "Vastrangam is a customer of it", which reads naturally and is exactly the mixing the
     owner himself objected to: "Medhava is universal Unified BOS for multiple industries,
     do not get stuck with Vastrangam logic." His own instruction, and the gate caught the
     draft that ignored it. The tenant archive's own documents name the trade; this one
     describes the arrangement instead, which is truer for a product meant to carry many. */
  w('**Your own business is a customer of it, not part of it.** That separation is');
  w('deliberate and is checked by the build: the product has to build, test and run with no');
  w('customer installed at all. It ships as two archives, never one — and the second one is');
  w('loaded on top of the first to prove the arrangement works.');
  w('');
  w('---');
  w('');
  w('## Where it actually stands today');
  w('');
  w('Read from the project’s own registers at the moment this page was generated, not from');
  w('anybody’s memory:');
  w('');
  w('| | |');
  w('|---|---:|');
  w(`| Apps designed | ${APPS.length} |`);
  w(`| Apps with a real automated test that runs every time | **${tested}** |`);
  w(`| Apps written down but not standing up | ${specified} |`);
  w(`| Rules written | ${RULES.length} |`);
  w(`| Rules proven by a test | ${enforced} |`);
  w(`| Overall score, out of 5 | **${SCORE.mean}** |`);
  w(`| Maturity | **Level ${AUDIT.MATURITY.level} — ${AUDIT.MATURITY.name}** |`);
  w('');
  w('**Nothing is deployed. Nothing is live.** No part of this is running on a machine the');
  w('business can reach, and no mobile app exists. That is not a setback — it is simply');
  w('where the project is, and the rest of this pack is how it moves.');
  w('');
  w('---');
  w('');
  w('## What to do, in order');
  w('');
  w('1. **`SETUP_CHECKLIST.md`** — what to buy and switch on. Start at step 1; it is free.');
  w('2. **`SEVEN_STAGE_ROADMAP.md`** — your seven stages, each saying who does it.');
  w('3. **`WORKING_WITH_AI_TOOLS.md`** — read this BEFORE your next AI session, not after');
  w('   you run out of one. It is short.');
  w('4. **`BUILD_QUEUE.md`** — when you want actual building done, this is the ordered list');
  w('   to hand to whoever is doing it.');
  w('');
  w('---');
  w('');
  w('## The one habit that makes the rest work');
  w('');
  w('Ask for the evidence, every time.');
  w('');
  w('This project has a rule that a claim is not accepted without a command that was really');
  w('run and the output it really produced. It is enforced by the build: a capability cannot');
  w('be marked as working unless the command that proves it is recorded, and the recording');
  w('is re-run to check it still holds.');
  w('');
  w('So when any tool — including this one — tells you something is done, the question is');
  w('always the same: **which command, and what did it print?** If the answer is a summary');
  w('rather than output, it is not done yet. That single question is what separates a real');
  w('result from a confident-sounding one, and you do not need to understand the code to');
  w('ask it.');
  return finish(L);
}

/* ══ 2 · SETUP CHECKLIST ══════════════════════════════════════════════════ */
function checklist() {
  reset();
  w('# What to buy and switch on');
  w('');
  w(`${SETUP.STEPS.length} steps, in the order they should happen. Each says what it is for,`);
  w('why it sits where it does, and how you know it worked.');
  w('');
  w('**Nothing here quotes a price as a fact.** What each option costs changes, and a stale');
  w('price in a document is worse than no price because somebody plans around it. Where a');
  w('figure appears it is a range from the project’s own tools register and should be');
  w('checked on the day. **I cannot reach any of these providers’ websites from where this');
  w('was written**, so nothing below claims to describe their current offering.');
  w('');
  w('**Most of this list is free.** The first step costs nothing, and the one item with no');
  w('free path at all is last on purpose.');
  w('');
  w('---');
  w('');

  SETUP.STEPS.forEach((s) => {
    const t = s.tool ? TOOL.get(s.tool) : null;
    w(`## ${s.n} · ${s.title}`);
    w('');
    w(s.what);
    w('');
    w(`**Why it is at number ${s.n}.** ${s.why_here}`);
    w('');
    if (t) {
      w('| | |');
      w('|---|---|');
      w(`| What this is for | ${esc(t.cap)} |`);
      w(`| The free option | ${esc(t.free)} |`);
      w(`| The paid option | ${esc(t.paid)} |`);
      w(`| When paying becomes worth it | ${esc(t.trigger)} |`);
      w('');
    }
    w('**What to do**');
    w('');
    s.do.forEach((d) => w(`- ${d}`));
    w('');
    w(`**You know it worked when:** ${s.done_when}`);
    w('');
    w(`*Detail: \`${s.see}\`*`);
    w('');
    w('---');
    w('');
  });

  w('## What is deliberately not on this list');
  w('');
  w('Anything that bills you before the thing it pays for can be used. The whole register of');
  w(`${toolRows.length} capabilities is in \`brand/site/tools.js\`, and the build refuses any`);
  w('paid choice there that does not also name a free option and the point at which paying');
  w('becomes worth it. That refusal is what keeps this list short.');
  return finish(L);
}

/* ══ 3 · SEVEN STAGE ROADMAP ══════════════════════════════════════════════ */
function roadmap() {
  reset();
  w('# The seven stages');
  w('');
  w('Your seven, in your order, with your numbering. Each one says **who does it** — because');
  w('several of these cannot be done by any AI, and a plan that leaves that unsaid is a plan');
  w('that stops at the first one.');
  w('');
  w('---');
  w('');
  w('## At a glance');
  w('');
  w('| # | Stage | Who | Where it stands |');
  w('|---|---|---|---|');
  HANDOVER.STAGES.forEach((s) => {
    const states = (s.caps || []).map((c) => (byId.get(c) || {}).status).filter(Boolean);
    const best = ['TESTED', 'IMPLEMENTED', 'SPECIFIED', 'BLOCKED', 'NOT STARTED']
      .find((x) => states.includes(x));
    w(`| ${s.n} | ${esc(s.title)} | ${s.who.split('.')[0]} | ${best || 'nothing registered yet'} |`);
  });
  w('');
  w('---');
  w('');

  HANDOVER.STAGES.forEach((s) => {
    w(`## ${s.n} · ${esc(s.title)}`);
    w('');
    w(s.what);
    w('');
    w(`**Who does this.** ${s.who}`);
    w('');
    w(`**Before you start.** ${s.before}`);
    w('');
    if ((s.caps || []).length) {
      w('**What exists today**, read from the requirements registry:');
      w('');
      w('| Capability | Status | What that means |');
      w('|---|---|---|');
      s.caps.forEach((c) => {
        const r = byId.get(c);
        if (!r) return;
        const meaning = r.status === 'TESTED'
          ? 'a test drives it, it passes, and the run is on record'
          : r.status === 'NOT STARTED' ? 'nothing exists'
            : r.status === 'BLOCKED' ? 'cannot proceed — the row says what is blocking it'
              : 'written down, not standing up';
        w(`| \`${c}\` ${esc(r.name)} | **${r.status}** | ${meaning} |`);
      });
      w('');
    }
    w('**What gets done**');
    w('');
    s.steps.forEach((x) => w(`- ${x}`));
    w('');
    w(`**You know it worked when:** ${s.done_when}`);
    w('');
    w(`*Detail: \`${s.see}\`*`);
    w('');
    w('---');
    w('');
  });

  w('## Stages 1, 5, 6 and 7 need you, not a tool');
  w('');
  w('Worth saying once more in one place, because it is the thing most likely to stall:');
  w('');
  w('- **The domain** needs your registrar login.');
  w('- **The mobile apps** need Apple and Google developer accounts, both paid, both');
  w('  requiring identity verification that takes days. Start them before you need them.');
  w('- **Offline sync** needs a business decision — who wins when two people changed the');
  w('  same thing while both were offline — that only somebody who knows the business can make.');
  w('- **Deployment** needs a machine and credentials.');
  w('');
  w('None of these is difficult. All of them are slow if started late.');
  return finish(L);
}

/* ══ 4 · WORKING WITH AI TOOLS ════════════════════════════════════════════ */
function tools() {
  reset();
  w('# Working with Claude, Codex and Grok');
  w('');
  w('Read this before your next session rather than when a limit runs out.');
  w('');
  w('---');
  w('');
  w('## The one thing that makes switching possible');
  w('');
  w('**The project lives in the repository, not in the conversation.**');
  w('');
  w('Everything — the code, the registers of what exists, the tests, the gates that refuse a');
  w('false claim, the record of every verified run — is in files. Nothing important lives');
  w('only in a chat window. That is why closing this session costs nothing, and it is worth');
  w('protecting: the moment something important exists only in a conversation, switching');
  w('tools becomes expensive.');
  w('');
  w('So: **commit often**, and never let a decision live only in a chat.');
  w('');
  w('---');
  w('');
  w('## Starting a new session, with any tool');
  w('');
  w('Two things, in this order:');
  w('');
  w('1. Give it the project — the repository, or the archive.');
  w('2. Paste **`MEDHAVA_BOS_PROMPT.md`** as the first message.');
  w('');
  w('That file already exists, is already part of the build, and already states what the');
  w('project is, what exists, what does not, and the rules the work must follow. It is the');
  w('answer to "how do I start a new window". For customer-specific work, paste');
  w('the prompt file that ships inside the tenant archive instead — that archive’s own');
  w('START_HERE names it. Keeping the customer’s name out of the product’s own handover is');
  w('the same rule that lets this system carry a second business later without rewriting.');
  w('');
  w('Then say what you want done. You do not need to re-explain the project.');
  w('');
  w('---');
  w('');
  w('## When one runs out mid-project');
  w('');
  w('Nothing is lost, and there is nothing to migrate.');
  w('');
  w('| Step | What you do |');
  w('|---|---|');
  w('| 1 | Make sure the last work is committed |');
  w('| 2 | Open the same project folder in the other tool |');
  w('| 3 | Paste `MEDHAVA_BOS_PROMPT.md` |');
  w('| 4 | Ask it to run `npm test` before changing anything |');
  w('');
  w('**Step 4 is the important one.** It tells you whether the project is in a good state');
  w('before the new tool touches it — and it tells the new tool the same thing. If the suite');
  w('fails, that is where the next session starts, whatever anybody intended to work on.');
  w('');
  w('---');
  w('');
  w('## Which tool for which work');
  w('');
  w('Only two of these rows are mine to claim; the third is your own measurement and is');
  w('recorded as yours.');
  w('');
  w('| Work | Tool | Why |');
  w('|---|---|---|');
  w('| Editing across a large codebase | Codex, Cursor | They work inside the whole project, which is what most building is |');
  w('| Reasoning, design, documents, tracing a subtle defect | Claude | Longer chains of reasoning about consequences |');
  w('| Excel and reporting | Grok | **Your measurement** — you found it faster and more accurate than the alternatives for this work |');
  w('');
  w('Use whichever suits the task. The rule below is what keeps that safe.');
  w('');
  w('---');
  w('');
  w('## The rule that keeps every tool honest');
  w('');
  w('**Whatever made the change, `npm test` must pass, and the claim must be recorded.**');
  w('');
  w('The gates do not know which tool edited a file and do not care. That is the entire');
  w(`point of them. Today ${enforced} of ${RULES.length} rules are proven by a test that runs,`);
  w('and a capability cannot be marked as working unless the command proving it is on record');
  w('in `docs/verification/EVIDENCE.md` — which is then re-run to check it still holds.');
  w('');
  w('So the question to ask any tool, always:');
  w('');
  w('> **Which command did you run, and what did it print?**');
  w('');
  w('A summary is not an answer. Output is. A tool that cannot make the suite pass has not');
  w('finished, whatever it says in the chat — and you do not need to read the code to hold');
  w('it to that.');
  w('');
  w('---');
  w('');
  w('## Checking this project with another tool');
  w('');
  w('You said you would cross-check with Codex and Cursor. Good — here is how, in a way that');
  w('does not depend on trusting anybody’s summary. Open the project in the other tool and');
  w('ask it to run these, then compare what it reports against what you were told:');
  w('');
  w('| Command | What it answers |');
  w('|---|---|');
  w('| `npm test` | does everything still pass |');
  w('| `npm run test:product` | does the product work with no customer installed |');
  w('| `node brand/site/checkregistry.js --summary` | what actually runs, and what only exists on paper |');
  w('| `node brand/site/checkaudit.js --summary` | the score and the maturity level, recomputed |');
  w('| `node tools/evidence.js --check` | re-runs every recorded claim and reports any that no longer hold |');
  w('');
  w('The last one is the one to use if you ever suspect you are being told something');
  w('flattering. It does not read anybody’s summary — it runs the commands again.');
  return finish(L);
}

/* ── write, or prove current ──────────────────────────────────────────────── */
const OUTPUTS = [
  ['START_HERE_OWNER.md', startHere],
  ['SETUP_CHECKLIST.md', checklist],
  ['SEVEN_STAGE_ROADMAP.md', roadmap],
  ['WORKING_WITH_AI_TOOLS.md', tools],
];

let stale = 0;
OUTPUTS.forEach(([name, make]) => {
  const doc = make();
  const file = path.join(ROOT, name);
  if (checkOnly) {
    const now = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (now !== doc) {
      console.error(`mkhandover: ${name} is out of date — run without --check.`);
      stale++;
    }
  } else {
    fs.writeFileSync(file, doc);
    console.log(`${name.padEnd(26)} ${String(Math.round(Buffer.byteLength(doc) / 1024)).padStart(3)}KB`);
  }
});

if (checkOnly) {
  if (stale) process.exit(1);
  console.log(`mkhandover: all ${OUTPUTS.length} documents current — ` +
    `${SETUP.STEPS.length} setup steps, ${HANDOVER.STAGES.length} stages, ` +
    `score ${SCORE.mean}/5 read from the registers`);
} else {
  console.log(`\n  ${SETUP.STEPS.length} setup steps · ${HANDOVER.STAGES.length} stages · ` +
    `${tested} of ${APPS.length} apps tested · score ${SCORE.mean}/5 · ` +
    `maturity ${AUDIT.MATURITY.level} (${AUDIT.MATURITY.name})`);
  console.log('  Every figure above was read from registry.js and audit.js, not typed.');
}
