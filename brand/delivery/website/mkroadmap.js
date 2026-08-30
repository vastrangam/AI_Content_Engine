'use strict';
/* THE BUILD ROADMAP — one document per edition, carrying the whole life of the product.
 *
 *   node brand/delivery/website/mkroadmap.js              → Medhava_Build_Roadmap.md
 *   node brand/delivery/website/mkroadmap.js vastrangam   → Vastrangam_Build_Roadmap.md
 *
 * WHAT THE OWNER ASKED FOR, IN HIS WORDS
 * "one md file for each Vastrangam and Medhava which carry everything — Idea, Product
 * architecture, Design, Development, Infrastructure, Security, Testing, Deployment,
 * Monitoring, Launch — then all 22 modules, 113 apps and all rules and logic in complete
 * details not like 1-2 line theorem."
 *
 * SO NOTHING HERE IS SUMMARISED.
 * Every rule is printed with its when, its then, its never and the test that proves it.
 * Every app is printed with its purpose and its real build state. Every module carries
 * what it reads and what it writes. The registers are large and the document is large,
 * and that is the point: a count tells a reader how much they are not being shown.
 *
 * IT SHOWS BUILD STATE, WHICH THE OTHER DOCUMENTS DELIBERATELY DO NOT.
 * mkguide.js and mktenant.js refuse a document containing "works today", "not built" and
 * their kin, and that rule is right for them: in a document where every line would carry
 * the same label, the label is noise a reader mistakes for information. This document is
 * the exception, and it is exempt on purpose — 2 apps run on the real database, 16 are
 * browser apps, 2 are command-line engines and 89 of 293 rules are proven by a test that
 * runs. Here the label varies, and the variation is what the reader came for.
 *
 * WHERE EVERY WORD COMES FROM
 *   roadmap.js   the ten stages — the only prose that lives in one file and nowhere else
 *   modules.js   22 modules, 113 apps, what each reads and writes
 *   rules.js     293 rules, in full
 *   built.js     which apps run on the real database, in a browser, or on a command line
 *   shots.js     the specified screens, column by column
 *   stack.js     19 layers with their alternatives
 *   plainwords.js  every technical word, explained on first use
 *
 * No count is typed. Every one is read from its register at generation time.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

const ROADMAP = require(path.join(SITE, 'roadmap.js'));
const BASE = require(path.join(SITE, 'modules.js'));
const RULES = require(path.join(SITE, 'rules.js'));
const BUILTREG = require(path.join(SITE, 'built.js'));
const BASE_SHOTS = require(path.join(SITE, 'shots.js'));
const { LAYERS } = require(path.join(SITE, 'stack.js'));
const WORDS = require(path.join(SITE, 'plainwords.js'));
const { TRADE_WORDS } = require(path.join(SITE, 'checkneutral.js'));
/* One renderer per register, shared with the plan, the guide and the tenant document.
   A private copy here is how two documents start disagreeing about the same fact. */
const REG = require(path.join(SITE, 'registers.js'));

const VAS = process.argv[2] === 'vastrangam';
const EDNAME = VAS ? 'VASTRANGAM' : 'MEDHAVA';
const NAME = VAS ? 'Vastrangam' : 'Medhava';
const OUT = path.join(ROOT, VAS ? 'Vastrangam_Build_Roadmap.md' : 'Medhava_Build_Roadmap.md');

/* ── the edition overlay: words only, proven ──────────────────────────────────
   Exactly what build.js does, and for the same reason. A trade may rename what it sees; it
   may not change a module number, an app name or an app count. The shape is compared
   before and after rather than trusted. */
const ED = VAS ? require(path.join(SITE, 'edition_vastrangam.js')) : null;
const MODULES = !ED ? BASE : BASE.map((m) => {
  const o = (ED.modules || {})[m.n] || {};
  const apps = m.apps.map((a) => ((o.apps && o.apps[a[0]]) ? [a[0], a[1], o.apps[a[0]], a[3]] : a));
  return Object.assign({}, m, { tag: o.tag || m.tag, intro: o.intro || m.intro, apps });
});
if (ED) {
  const shape = (l) => l.map((m) => m.n + ':' + m.apps.map((a) => a[0]).join('|')).join(' ');
  if (shape(BASE) !== shape(MODULES)) {
    console.error('mkroadmap: the overlay changed the structure, not just the wording.');
    process.exit(1);
  }
}
const SHOTS = ED ? Object.assign({}, BASE_SHOTS, ED.shots || {}) : BASE_SHOTS;

/* ── counts, every one derived ───────────────────────────────────────────────── */
const NMOD = MODULES.length;
const NAPP = MODULES.reduce((s, m) => s + m.apps.length, 0);
const NRULE = RULES.length;
const NENF = RULES.filter((r) => r.state === 'ENFORCED').length;
const NLAYER = LAYERS.length;
const NSWAP = LAYERS.reduce((s, l) => s + (l.swaps || []).length, 0);
/* A MODULE'S SCREENS MAY BE ONE OBJECT OR AN ARRAY OF THEM, and both shapes are in use:
   four modules in the neutral set carry a single screen written directly, and the trade
   overlay replaces a module's whole set with one screen of its own. Counting only arrays
   reported 42 of the 46 neutral screens and ZERO of the trade ones — a count that was
   wrong in one edition and catastrophically wrong in the other, from one isArray. */
const screensOf = (n) => {
  const v = SHOTS[n];
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
};
const NSCREEN = MODULES.reduce((s, m) => s + screensOf(m.n).length, 0);
const NTABLE = (fs.readFileSync(path.join(ROOT, 'core', 'schema.postgres.sql'), 'utf8')
  .match(/^CREATE TABLE /gm) || []).length;

const NPLATFORM = MODULES.reduce((s, m) => s + BUILTREG.platformIn(m), 0);
const NBROWSER = MODULES.reduce((s, m) => s + BUILTREG.builtIn(m), 0);
const NENGINE = MODULES.reduce((s, m) => s + BUILTREG.engineIn(m), 0);
const NSPEC = MODULES.reduce((s, m) =>
  s + m.apps.filter((a) => BUILTREG.stateOf(a[0]) === 'SPECIFIED').length, 0);

const TOKENS = { __NMOD__: String(NMOD), __NAPP__: String(NAPP), __NRULES__: String(NRULE) };
const sub = (t) => {
  let s = String(t == null ? '' : t);
  for (const [k, v] of Object.entries(TOKENS)) s = s.split(k).join(v);
  return s;
};
const esc = (s) => sub(s).replace(/\|/g, '\\|');

/* ── the glossary, on first use only ─────────────────────────────────────────── */
const explained = new Set();
function termsBlock(terms) {
  const fresh = (terms || []).filter((t) => !explained.has(t.toLowerCase()));
  if (!fresh.length) return '';
  fresh.forEach((t) => explained.add(t.toLowerCase()));
  return fresh.map((t) => {
    const line = WORDS.firstUse(t);
    if (!line) throw new Error(`mkroadmap: "${t}" is not in plainwords.js`);
    return '> ' + line.replace(/\n/g, '\n> ');
  }).join('\n>\n');
}

/* ── how an app's state is written ───────────────────────────────────────────── */
const STATE_LABEL = {
  PLATFORM: '**RUNNING** — on the real database, with a test that drives it',
  BROWSER: '**BROWSER APP** — opens and self-tests, no shared database behind it',
  ENGINE: '**ENGINE** — the arithmetic runs on the command line, no screen yet',
  SPECIFIED: 'SPECIFIED — designed, not built',
};
const STATE_SHORT = {
  PLATFORM: 'RUNNING', BROWSER: 'BROWSER APP', ENGINE: 'ENGINE', SPECIFIED: 'SPECIFIED',
};

const out = [];
const p = (...lines) => out.push(...lines);

/* ══ front matter ══════════════════════════════════════════════════════════ */
p(`# ${NAME} — Build Roadmap`, '');
p(`Everything, in one file: the ten stages from idea to launch, then all ${NMOD} modules, ` +
  `all ${NAPP} apps and all ${NRULE} rules in full — each rule with what the system does, ` +
  `what it refuses to do instead, and the test that proves it where one exists.`, '');

p('## What this document says about what exists', '');
p('Every other document here describes a design and carries no build-state labels, ' +
  'deliberately: where every line would say the same thing, a label is noise a reader ' +
  'mistakes for information. **This document is the exception.** It is a roadmap, so what ' +
  'is standing up and what is written down is the thing you came to find out — and the ' +
  'label genuinely varies now.', '');
p('There are three different ways an app can be real here, and they are not ' +
  'interchangeable:', '');
p('| State | Meaning | Count |', '|---|---|---:|');
p(`| **RUNNING** | On the real database, inside row-level security, with a test that starts it and drives it | ${NPLATFORM} |`);
p(`| **BROWSER APP** | Opens in a browser and carries its own self-tests. No shared database behind it | ${NBROWSER} |`);
p(`| **ENGINE** | The arithmetic is written and passes on the command line. No screen | ${NENGINE} |`);
p(`| SPECIFIED | Designed and ruled, not built | ${NSPEC} |`);
p('');
p(`One app is counted twice above — a browser screen came first and the platform ` +
  `implementation second, and both are true. ${NAPP} apps in total.`, '');

p('| | Count | |', '|---|---:|---|');
p(`| Modules | ${NMOD} | one of them is the spine, not a screen you open |`);
p(`| Apps | ${NAPP} | ${NPLATFORM} running, ${NBROWSER} browser apps, ${NENGINE} engines |`);
p(`| Rules | ${NRULE} | **${NENF} proven by a test that runs**, ${NRULE - NENF} specified |`);
p(`| Database tables | ${NTABLE} | executing into PostgreSQL, isolation enforced by the database |`);
p(`| Stack layers | ${NLAYER} | ${NSWAP} named alternatives between them |`);
p(`| Specified screens | ${NSCREEN} | column by column |`);
p('');
p(`**The gap between ${NENF} and ${NRULE} is the build queue.** It is not a rounding error ` +
  'and it is not hidden: every rule below says which side of it it is on.', '');
p('---', '');

/* ══ the ten stages ════════════════════════════════════════════════════════ */
p('# Part one — from idea to launch', '');
p(`${ROADMAP.STAGES.length} stages. Each says what it is, what it owes before it can be ` +
  'called finished, how you know it is, and — where something is genuinely missing — what ' +
  'is not covered yet.', '');

p('| Stage | Owes | Anything missing |', '|---|---:|---|');
ROADMAP.STAGES.forEach((s) => {
  p(`| **${esc(s.title)}** | ${s.owes.length} | ${s.gap ? 'yes — stated in full below' : 'no'} |`);
});
p('');

ROADMAP.STAGES.forEach((s, i) => {
  p(`## ${i + 1} · ${esc(s.title)}`, '');
  p(sub(s.what), '');
  p('**What this stage owes**', '');
  s.owes.forEach((o) => p(`- ${esc(o)}`));
  p('');
  p(`**How you know it is done.** ${sub(s.done)}`, '');
  if (s.from && s.from.length) {
    p(`**Where this is written down:** ${s.from.map((f) => '`' + f + '`').join(' · ')}`, '');
  }
  if (s.gap) {
    p(`> **What is not covered yet.** ${sub(s.gap)}`, '');
  }
  p('---', '');
});

/* ══ the modules ═══════════════════════════════════════════════════════════ */
p(`# Part two — the ${NMOD} modules, in full`, '');
p('In the order they are numbered, which is the order they are built. Not reordered by ' +
  'dependency or by size — the numbering is the build order already, and re-sorting a ' +
  'list somebody numbered is a second opinion nobody asked for.', '');
p('Each module carries what it reads and what it writes, every app it contains with its ' +
  'purpose and its state, every rule it must satisfy in full, and its specified screens ' +
  'where they exist.', '');
p(termsBlock(['module', 'row', 'table', 'audit trail']), '');

p('| # | Module | Apps | Rules | Proven |', '|---|---|---:|---:|---:|');
MODULES.forEach((m) => {
  const mine = RULES.filter((r) => r.mod === m.n);
  p(`| ${m.n} | ${esc(m.name)}${m.spine ? ' *(spine)*' : ''} | ${m.apps.length} | ` +
    `${mine.length} | ${mine.filter((r) => r.state === 'ENFORCED').length} |`);
});
p('');
p('---', '');

MODULES.forEach((m) => {
  const mine = RULES.filter((r) => r.mod === m.n);
  const enf = mine.filter((r) => r.state === 'ENFORCED').length;
  p(`## Module ${m.n} · ${esc(m.name)}`, '');
  p(`*${esc(m.tag)}*`, '');
  p(sub(m.intro), '');

  p('| | |', '|---|---|');
  p(`| **Reads from** | ${(m.reads || []).map(esc).join(', ') || '—'} |`);
  p(`| **Writes to** | ${(m.writes || []).map(esc).join(', ') || '—'} |`);
  p(`| **Apps** | ${m.apps.length} |`);
  p(`| **Rules** | ${mine.length}, of which ${enf} are proven by a test that runs |`);
  p('');

  /* ── the apps ── */
  p(`### The ${m.apps.length} app${m.apps.length === 1 ? '' : 's'} in this module`, '');
  m.apps.forEach((a) => {
    const st = BUILTREG.stateOf(a[0]);
    p(`**${esc(a[0])}** — ${STATE_LABEL[st]}`, '');
    p(sub(a[2]), '');
    if (st === 'PLATFORM') {
      p(`> Proven by \`${BUILTREG.PLATFORM[a[0]]}\`.`, '');
    }
  });

  /* ── the screens ── */
  const screens = screensOf(m.n);
  if (screens.length) {
    p(`### The ${screens.length} specified screen${screens.length === 1 ? '' : 's'}`, '');
    p('Not a picture — the columns, the rows and the controls, written down so a built ' +
      'screen can be compared against something.', '');
    screens.forEach((s) => {
      /* `k` is the row of figures across the top of the screen — [label, value, colour] —
         not a "kind" string, which is what a first reading of the field name suggested and
         what this printed until the output was looked at. */
      p(`**${esc(s.t)}**${s.sector ? ` · shown for a ${esc(s.sector)}` : ''}`, '');
      if (s.k && s.k.length) {
        p(`- **Figures across the top** — ${s.k.map((t) => `${esc(t[0])} ${esc(t[1])}`).join(' · ')}`);
      }
      if (s.c && s.c.length) p(`- **Columns** — ${s.c.map(esc).join(' · ')}`);
      if (s.r && s.r.length) {
        p(`- **Rows** — ${s.r.length} worked example${s.r.length === 1 ? '' : 's'}, ` +
          `the first reading: ${s.r[0].map((c) => esc(Array.isArray(c) ? c[0] : c)).join(' · ')}`);
      }
      if (s.b && s.b.length) {
        p(`- **Controls** — ${s.b.map((b) => esc(Array.isArray(b) ? b[0] : b)).join(' · ')}`);
      }
      p('');
    });
  }

  /* ── the rules, in full ── */
  p(`### The ${mine.length} rule${mine.length === 1 ? '' : 's'} this module must satisfy`, '');
  if (!mine.length) {
    p('None stated. A module with no rules is a module nobody has decided the shape of yet.', '');
  }
  mine.forEach((r) => {
    p(`**\`${r.id}\` ${esc(r.title)}**`, '');
    p(`- **When** ${esc(r.when)}`);
    p(`- **Then** ${esc(r.then)}`);
    p(`- **Never** ${esc(r.never)}`);
    p(r.state === 'ENFORCED'
      ? `- **Proven** by \`${esc(r.by)}\``
      : '- **Not proven yet** — specified, no test behind it');
    p('');
  });
  p('---', '');
});

/* ══ the tenant's own engine ═══════════════════════════════════════════════
   ONLY IN THE TRADE EDITION, and read out of the engine rather than described. The
   product's rulebook says what any business must refuse; this says what THIS business
   actually pays, and every figure in it is resolved from the fixture at generation time.
   A number typed here would be a number that stops matching the engine the day somebody
   corrects the engine. */
if (VAS) {
  const enginePath = path.join(ROOT, 'engine');
  if (fs.existsSync(enginePath)) {
    const master = JSON.parse(fs.readFileSync(
      path.join(enginePath, 'fixtures', 'master.json'), 'utf8'));
    const people = master.people || [];
    const rules = require(path.join(SITE, 'rules.js'));

    p('# Part three — this business’s own engine', '');
    p('Everything above is the product: what any business running on it must do. This part ' +
      'is what THIS business does, and it is the half nobody else inherits. Every figure ' +
      'below is read out of the engine when this document is generated — none of it is ' +
      'typed here, so it cannot drift from the software that pays people.', '');

    p('## The roster', '');
    p(`${people.length} people on file. The list below is who was on the floor on ` +
      `${esc(master._roster_snapshot || 'the recorded snapshot date')} — recorded with the ` +
      'date it was true on, because a roster that means “now” quietly changes as time ' +
      'passes and somebody’s employment moves with it.', '');
    const emp = master.employment || [];
    const undated = emp.filter((e) => e.left_date_not_stated).map((e) => e.key);
    p('| Person | Role | Employed | Pay basis |', '|---|---|---|---|');
    people.slice().sort((a, b) => (a.id < b.id ? -1 : 1)).forEach((pp) => {
      const spell = emp.find((e) => e.key === pp.id);
      const basis = (master.pay_basis || []).filter((r) => r.key === pp.id).pop();
      const span = !spell ? 'no spell — a trial'
        : `${spell.joined} → ${spell.left || (spell.left_date_not_stated ? 'gone, no date stated' : 'present')}`;
      p(`| ${esc(pp.id)} | ${esc((pp.roles || []).join(', ') || '—')} | ${esc(span)} | ` +
        `${esc(basis ? basis.value : '—')} |`);
    });
    p('');
    if (undated.length) {
      p(`> **${undated.length} people are gone and no leaving date was ever stated.** Their ` +
        'months from the snapshot on resolve as unresolved rather than as “not employed” — ' +
        'the two are different claims and only one of them is true. They pay nothing and ' +
        'stay on the report until a date is given.', '');
    }

    p('## What a month pays', '');
    p('The owner, twice, in his own words: *"Salary calculation should be like Monthly ' +
      'Salary/monthly threshold hour"*. Both halves are read at the month being paid, ' +
      'because one person’s salary and their threshold change on different dates and ' +
      'fixing either half to a year would be wrong for the months between them.', '');
    p('```', 'rate per hour = that month’s salary ÷ that month’s threshold hours',
      'earned        = paid hours × rate per hour', '```', '');
    p('Paid hours and productive hours are two different figures, and they part company on ' +
      'exactly two attendance codes. A holiday and a paid leave day carry a full day of pay ' +
      'and no productive time at all: the salaried are paid for them, the hourly and ' +
      'piece-rate never reach the attendance sheet, and the productive figure — the one ' +
      'that costs a design — still shows nothing was made.', '');
    p('Flat pay does not move with the month’s length, so it carries a second number: what ' +
      'the hours would have earned, and the variance between that and the cash. Without it ' +
      'nothing makes short hours visible on a fixed salary.', '');

    p('## What a piece of work pays', '');
    p('A piece rate belongs to an **operation on a garment**, not to a person. The owner ' +
      'states each one once and everybody doing that work is paid at it, which is why ' +
      'adding the fourth person to an operation is a row in the roster and not a rate ' +
      'somebody has to remember to copy.', '');
    const pr = master.piece_rate || [];
    const ops = [...new Set(pr.map((r) => r.operation))];
    ops.forEach((op) => {
      p(`**${esc(op)}**`, '');
      p('| Garment | Rate | In force from |', '|---|---:|---|');
      pr.filter((r) => r.operation === op).forEach((r) => {
        p(`| ${esc(r.garment)} | ${r.value} | ${esc(r.from)} |`);
      });
      p('');
    });
    p('A garment the card does not price is refused, not paid as zero. A garment two card ' +
      'entries both claim — the same word appearing in two slash-lists at different rates — ' +
      'is refused too: picking either would be a coin toss with somebody’s wages on it.', '');

    const adv = master.advance || [];
    if (adv.length) {
      p('## Advances', '');
      p('The owner: *"Is advance amount, should not include in salary, keep it seperate, ' +
        'they will deduct later in few months, just keep a column and mention as advance."* ' +
        'So an advance is a balance reported beside the pay and never a term inside it. ' +
        'Netting the two would answer neither question — what the month earned, and what is ' +
        'still owed back — and a reader handed one merged figure can recover neither.', '');
      p('| Person | Outstanding | Recovered so far |', '|---|---:|---:|');
      adv.forEach((a) => p(`| ${esc(a.key)} | ${a.value} | ${a.recovered || 0} |`));
      p('');
    }

    p('## What holds all of this up', '');
    const st = fs.existsSync(path.join(enginePath, 'tests', 'selftest.py'))
      ? fs.readFileSync(path.join(enginePath, 'tests', 'selftest.py'), 'utf8') : '';
    const nchecks = (st.match(/\bcheck\(/g) || []).length;
    p(`\`python3 engine/tests/selftest.py\` — ${nchecks} named checks over this engine, ` +
      'each one proven to fail before it was trusted to pass. The roster is compared name ' +
      'for name against the owner’s own list; every stated leaving date is held to the day ' +
      'and to the month either side of it; the pay formula is checked against his own ' +
      'worked examples; and an advance is proven not to move the pay.', '');
    p(`The product’s ${NRULE} rules above and this engine are different things. A rule says ` +
      'what any business must refuse. This says what this one pays, and the numbers in it ' +
      'belong to the business rather than to the software.', '');
    p('---', '');
  }
}

/* ══ the stack ═════════════════════════════════════════════════════════════ */
p(`# Part ${VAS ? 'four' : 'three'} — what it runs on, and what would replace it`, '');
p(`${NLAYER} layers, ${NSWAP} named alternatives between them. A layer with one option is ` +
  'a dependency; a layer with three is a choice. Every one names the interface everything ' +
  'above it talks to, which is what makes the swap possible rather than aspirational.', '');
p(termsBlock(['interface', 'adapter']), '');
p('| Layer | What it does | Built on | Alternatives | Everything talks to |',
  '|---|---|---|---:|---|');
LAYERS.forEach((l) => {
  p(`| **${esc(l.layer)}** | ${esc(l.does)} | ${esc(l.def)} | ${(l.swaps || []).length} | ` +
    `\`${esc(l.iface)}\` |`);
});
p('');
LAYERS.forEach((l) => {
  p(`### ${esc(l.layer)}`, '');
  p(sub(l.why), '');
  p(`- **Built on** — ${esc(l.def)}`);
  (l.swaps || []).forEach((s, i) => p(`- **${i === 0 ? 'Could be replaced with' : ''}** ${esc(s)}`
    .replace('- **** ', '  - ')));
  p(`- **Everything talks to** — \`${esc(l.iface)}\``);
  p(`- **Cost of switching** — ${esc(l.cost)}`, '');
});
p('---', '');

/* ══ what a business changes without a developer ═══════════════════════════
   THE PART THAT DECIDES WHETHER ANY OF THE ABOVE SURVIVES CONTACT WITH A REAL BUSINESS.
   A system where adding a person, opening a company or changing a rate needs a developer
   is a system that stops matching the business within a month. Rendered from the shared
   register rather than restated, so this document and the build guide cannot come to
   describe the same list differently. */
p(`# Part ${VAS ? 'five' : 'four'} — what changes without a developer, and what never changes`, '');
p(termsBlock(['effective date']), '');
p(REG.dynamicSection({ heading: '##', sub }), '');
p('---', '');

/* ══ the glossary ══════════════════════════════════════════════════════════ */
p('# Every technical word in this document, in plain language', '');
p('');
const GLOSSARY_AT = out.length;
p('');

/* ── render, then fill the glossary from what the finished text actually uses ── */
let text = out.join('\n') + '\n';

/* Carried to a fixed point: explaining a word introduces the words its own explanation
   uses, so one pass leaves the reader stranded one word further along than before. */
const extra = [];
for (let pass = 0; pass < 12; pass += 1) {
  const filled = out.slice();
  filled[GLOSSARY_AT] = extra.map((t) => '- ' + WORDS.firstUse(t)).join('\n');
  const body = filled.join('\n') + '\n';
  const missing = WORDS.checkwords(body);
  if (!missing.length) { text = body; break; }
  missing.forEach((t) => { if (!extra.includes(t)) extra.push(t); });
  text = body;
}

/* ── the gates, before anything is written ─────────────────────────────────── */
const problems = [];

const shapeBad = ROADMAP.check();
shapeBad.forEach((b) => problems.push(b));

const unexplained = WORDS.checkwords(text);
if (unexplained.length) {
  problems.push(`uses ${unexplained.length} technical term(s) it never explains: ` +
    unexplained.join(', '));
}

/* Every source a stage claims must be a real file. A stage citing a register nobody
   wrote is the most convincing kind of wrong. */
ROADMAP.STAGES.forEach((s) => {
  (s.from || []).forEach((f) => {
    if (!fs.existsSync(path.join(ROOT, f))) {
      problems.push(`stage "${s.id}" cites ${f}, which does not exist`);
    }
  });
});

/* THE PRODUCT EDITION MAY NOT NAME A TRADE. Same denylist checkneutral.js uses. */
if (!VAS) {
  const found = TRADE_WORDS.filter((w) =>
    new RegExp('\\b' + w.replace(/ /g, '\\s+'), 'i').test(text));
  if (found.length) {
    problems.push(`the Medhava roadmap names a trade: ${found.join(', ')}`);
  }
}

if (problems.length) {
  console.error(`mkroadmap: ${problems.length} problem(s). Refusing to write.\n`);
  problems.forEach((b) => console.error('  · ' + b));
  process.exit(1);
}

fs.writeFileSync(OUT, text);
console.log(`${path.basename(OUT)} written: ${Math.round(text.length / 1024)}KB · ${EDNAME}`);
console.log(`  ${ROADMAP.STAGES.length} stages · ${NMOD} modules · ${NAPP} apps · ` +
  `${NRULE} rules (${NENF} proven) · ${NLAYER} layers · ${NSCREEN} screens`);
console.log(`  build state: ${NPLATFORM} running · ${NBROWSER} browser apps · ` +
  `${NENGINE} engines · ${NSPEC} specified`);
console.log(`  ${explained.size + extra.length} technical terms explained` +
  (VAS ? '' : ' · no trade word'));
