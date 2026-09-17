'use strict';
/* THE COVERAGE SHEET — every line of the owner's master prompt, and where this stands on it.
 *
 *   node brand/delivery/website/mkmasterspec.js          → .md and the .json the sheet is built from
 *   node brand/delivery/website/mkmasterspec.js --check  → prove both are current
 *
 * Then:  python3 tools/masterspec_xlsx.py                → MASTER_SPEC_COVERAGE.xlsx
 *
 * WHY IT IS SPLIT IN TWO
 * The register is JavaScript, like every other register here, and the spreadsheet library is
 * Python. So this writes the data and tools/masterspec_xlsx.py writes the workbook — the same
 * pairing as tools/report_pdf.py and tools/report_pdf.js, for the same reason. The .json
 * between them is generated, never edited, and carries no verdict of its own: every one is
 * resolved here from the requirements registry.
 *
 * WHAT A READER SHOULD NOT MISTAKE
 * "Covered" means an app exists AND stands above SPECIFIED. It does NOT mean the line is
 * finished, and it does not mean the app runs on the real database — only three of them do.
 * The Medhava-state column carries that distinction, and the summary states it in words,
 * because the single most likely way to misread this sheet is to add up the ticks.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');
const SPEC = require(path.join(SITE, 'masterspec.js'));
const CHECK = require(path.join(SITE, 'checkmasterspec.js'));
const REGISTRY = require(path.join(SITE, 'registry.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const AUDIT = require(path.join(SITE, 'audit.js'));
const RENDER = require(path.join(SITE, 'registers.js'));

const check = process.argv.includes('--check');
const ROWS = REGISTRY.rows(MODULES);
const SCORE = AUDIT.score(ROWS);
/* modules.js exports the list itself in one edition and wraps it in an object in another;
   both shapes are read the same way everywhere else here. */
const MOD_ROWS = Array.isArray(MODULES) ? MODULES : Object.values(MODULES).find(Array.isArray);

/* A pipe inside a cell would end the column early, and several of the impossible reasons
   contain one. Shared by both documents so they cannot escape differently. */
const esc = (x) => String(x).replace(/\|/g, '\\|').replace(/\n/g, ' ');

/* ── the rows, resolved ────────────────────────────────────────────────────── */
function build() {
  const out = [];
  SPEC.SECTIONS.forEach((s) => {
    s.blocks.forEach((b) => {
      b.items.forEach((item) => {
        const [text, , impossible] = item;
        const m = CHECK.medhavaOf(item);
        const v = CHECK.verdictOf(item);
        out.push({
          section_n: s.n,
          section: s.title,
          block: b.title,
          component: text,
          medhava: m.text,
          medhava_state: m.state,
          medhava_rung: m.rung || '',
          covered: v === 'COVERED' ? 'YES' : '',
          uncovered: v === 'UNCOVERED' ? 'YES' : '',
          not_possible: v === 'NOT POSSIBLE' ? 'YES' : '',
          why_not_possible: impossible || '',
        });
      });
    });
  });
  return out;
}

const rows = build();
const t = { COVERED: 0, UNCOVERED: 0, 'NOT POSSIBLE': 0 };
rows.forEach((r) => {
  t.COVERED += r.covered ? 1 : 0;
  t.UNCOVERED += r.uncovered ? 1 : 0;
  t['NOT POSSIBLE'] += r.not_possible ? 1 : 0;
});
const st = { BUILT: 0, 'DESIGNED ONLY': 0, ABSENT: 0 };
rows.forEach((r) => { st[r.medhava_state]++; });

const perSection = SPEC.SECTIONS.map((s) => {
  const mine = rows.filter((r) => r.section_n === s.n);
  return {
    n: s.n,
    title: s.title,
    items: mine.length,
    covered: mine.filter((r) => r.covered).length,
    uncovered: mine.filter((r) => r.uncovered).length,
    not_possible: mine.filter((r) => r.not_possible).length,
  };
});

/* ── the markdown twin ─────────────────────────────────────────────────────── */
function markdown() {
  const L = [];
  const w = (x) => L.push(x);
  const pc = (n) => `${Math.round((n / rows.length) * 100)}%`;

  w('# The master specification, measured');
  w('');
  w(`**${rows.length} line items across ${SPEC.SECTIONS.length} sections.** Every one of them ` +
    'is from the specification as it was written, in its order and its words. Nothing was');
  w('added to lengthen the list and nothing dropped to shorten it — the gate counts the items');
  w('and refuses a stated total that disagrees with the list.');
  w('');
  w('---');
  w('');
  w('## The three numbers');
  w('');
  w('| | | |');
  w('|---|---:|---:|');
  w(`| **Covered** | ${t.COVERED} | ${pc(t.COVERED)} |`);
  w(`| **Uncovered** | ${t.UNCOVERED} | ${pc(t.UNCOVERED)} |`);
  w(`| **Not possible from here** | ${t['NOT POSSIBLE']} | ${pc(t['NOT POSSIBLE'])} |`);
  w('');
  w('**What "covered" means, and what it does not.** It means an app exists for that line');
  w('*and* has reached a rung above SPECIFIED. It does **not** mean the line is finished, and');
  w('it does not mean the app runs on a real database — three of them do. The single most');
  w('likely way to misread this sheet is to add up the covered column and treat it as');
  w('progress. The state column below is the honest breakdown:');
  w('');
  w('| Where this product stands on a line | Count |');
  w('|---|---:|');
  w(`| An app that stands above SPECIFIED | ${st.BUILT} |`);
  w(`| An app that is SPECIFIED — written down, not built | ${st['DESIGNED ONLY']} |`);
  w(`| Nothing in the register maps to it at all | ${st.ABSENT} |`);
  w('');
  w(`Overall score **${SCORE.mean}/5**, maturity **Level ${AUDIT.MATURITY.level} — ` +
    `${AUDIT.MATURITY.name}**.`);
  w('');
  w('---');
  w('');
  w('## What "not possible from here" means');
  w('');
  w(`${t['NOT POSSIBLE']} lines cannot be closed by writing code, and that is not a way of`);
  w('saying they are hard. Each needs something a repository cannot hold: a telephony');
  w('carrier, a payment licence, a bank’s credentials, a government portal’s registration, an');
  w('app-store account, live media infrastructure, a deployed host, or an audited');
  w('certification. Every one of those lines names its own reason in the sheet.');
  w('');
  w('They are counted separately precisely so they do not sit in the uncovered column looking');
  w('like work somebody forgot to schedule.');
  w('');
  w('---');
  w('');
  /* ── THE UNCOVERED COLUMN, SPLIT ─────────────────────────────────────────
     660 uncovered reads like 660 things nobody has thought about, and that is wrong by a
     factor of six: most of them already have an app in the register, written down and not
     yet built. Only the remainder is genuinely absent from the design, and only that
     remainder is in brand/site/backlog.js. Printing the split here is what stops the
     headline number being read as a to-do list.

     Every figure below is counted from the register at generation time — the same rebuild
     brand/site/checkbacklog.js performs — so this section cannot drift from it. */
  const BACKLOG = require(path.join(SITE, 'backlog.js'));
  const byTheme = {};
  BACKLOG.ITEMS.forEach(([, , , t]) => { byTheme[t] = (byTheme[t] || 0) + 1; });
  const absentUncovered = BACKLOG.ITEMS.length;
  const designed = t.UNCOVERED - absentUncovered;
  const modName = (n) => {
    const m = MOD_ROWS.find((r) => String(r.n) === String(n));
    return m ? m.name : '';
  };

  w(`## The ${t.UNCOVERED} uncovered lines are two different things`);
  w('');
  w(`**${designed} of them already have an app in this product’s own register** — the design`);
  w('names the capability, and the app sits at SPECIFIED or has not yet been taken above it.');
  w('Those cannot be "added"; they are added already and unbuilt, which is a schedule problem');
  w('rather than a design gap.');
  w('');
  w(`**${absentUncovered} are genuinely absent** — no app in the register maps to them at all.`);
  w(`Those are in \`brand/site/backlog.js\`, and they are not ${absentUncovered} separate`);
  w(`pieces of work. They are ${BACKLOG.THEMES.length} capabilities:`);
  w('');
  w('| Lines | Capability | Would live in |');
  w('|---:|---|---|');
  BACKLOG.THEMES.slice()
    .sort((a, b) => (byTheme[b.id] || 0) - (byTheme[a.id] || 0))
    .forEach((t) => {
      w(`| ${byTheme[t.id] || 0} | ${t.title} | module ${t.module} ${modName(t.module)} |`);
    });
  w('');
  w('**They are a backlog and not registry rows, deliberately.** Entering them as apps would');
  w(`take the app count from ${ROWS.filter((r) => r.kind === 'app').length} to ` +
    `${ROWS.filter((r) => r.kind === 'app').length + absentUncovered}, every new row at the ` +
    'lowest rung — so the');
  w('tested ratio and the score above would both fall without one line being built. A number');
  w('that gets worse because the denominator grew is not a measurement of anything.');
  w('');
  w('```');
  w('node brand/site/checkbacklog.js --summary');
  w('```');
  w('');
  w('---');
  w('');
  w('## What this sheet does not measure, said before anybody looks for it');
  w('');
  w('There is no column here for what any other company does against these lines, and that');
  w('is deliberate rather than an omission. Two reasons, and the first is the honest one:');
  w('');
  w('**It was never measurable at this resolution.** A sourced claim needs an address and the');
  w('day somebody read it. Nobody holds ~900 of those about another company\'s software, and');
  w('filling the column from recollection would make the sheet look complete while making it');
  w('worthless — which is the exact failure every gate in this repository exists to stop.');
  w('');
  w('**And it answers a question this document was not asked.** The question was: of');
  w('everything in the specification, how much does this product cover. That is measured');
  w(`below, ${rows.length} times, and every verdict is resolved from the requirements registry`);
  w('at generation time rather than stored in a row that could flatter itself.');
  w('');
  w('---');
  w('');
  w('## Section by section');
  w('');
  w('| # | Section | Items | Covered | Uncovered | Not possible |');
  w('|---:|---|---:|---:|---:|---:|');
  perSection.forEach((s) => {
    w(`| ${s.n} | ${s.title} | ${s.items} | ${s.covered} | ${s.uncovered} | ` +
      `${s.not_possible} |`);
  });
  w('');
  w('---');
  w('');
  w('## The full sheet');
  w('');
  w('Every line, with what it maps to and why, is in **`MASTER_SPEC_COVERAGE.xlsx`** beside');
  w('this document — one row per item, filterable by the covered / uncovered / not-possible');
  w('columns. It is generated from the same register as the figures above, so the two cannot');
  w('disagree.');
  w('');
  w('**The mapping is a judgement and no gate can check a judgement.** That "Lead scoring"');
  w('was set against CRM & Customer 360 is a call somebody made. What is checked is that');
  w('every app named is real and that its rung is resolved from the gated registry rather');
  w('than typed. Each row prints the app it was mapped to for exactly that reason — so any');
  w('single one of the 945 calls can be disagreed with.');
  w('');
  w('To check the whole thing yourself, from the repository:');
  w('');
  w('```');
  w('node brand/site/checkmasterspec.js --summary');
  w('```');
  w('');
  return L.join('\n');
}

/* ── write, or prove current ───────────────────────────────────────────────── */
function finish(text) {
  const gloss = RENDER.glossarySection({ only: text, heading: '###' });
  return text + (gloss
    ? '\n---\n\n## Every technical word above, in plain language\n\n' + gloss
    : '') + '\n';
}

/* ── the constraints document ──────────────────────────────────────────────
   The 85 lines no code closes, grouped by what each actually needs rather than by which
   section it came from. That regrouping is the whole point: as a section list it is 85
   scattered disappointments, and as a needs list it is a dozen accounts to open — which is
   a thing somebody can act on before a demo. */
function constraints() {
  const L = [];
  const w = (x) => L.push(x);

  const byNeed = SPEC.NEEDS.map((n) => ({ ...n, lines: [] }));
  SPEC.SECTIONS.forEach((s) => s.blocks.forEach((b) => b.items.forEach((item) => {
    if (CHECK.verdictOf(item) !== 'NOT POSSIBLE') return;
    const n = byNeed.find((x) => x.match.test(item[2]));
    n.lines.push({ section: s.n, title: s.title, text: item[0], why: item[2] });
  })));
  const total = byNeed.reduce((a, n) => a + n.lines.length, 0);

  w('# What no amount of code closes');
  w('');
  w(`**${total} lines of the specification need something a repository cannot hold.** Not ` +
    'because they are hard — because each one needs an account, a licence, a provider or a');
  w('piece of rented infrastructure that somebody has to arrange.');
  w('');
  w('This is the list to work through **before a live demonstration**, not after. Several of');
  w('these take weeks of somebody else’s verification and no amount of preparation here');
  w('shortens them.');
  w('');
  w('---');
  w('');
  w('## What to arrange, in rough order of how long it takes');
  w('');
  w('| What is needed | Lines it unblocks |');
  w('|---|---:|');
  byNeed.forEach((n) => w(`| ${n.title} | ${n.lines.length} |`));
  w('');
  w('**Start with a domain and a host.** Several of the others cannot even begin until');
  w('something is running somewhere a person can reach, and a mail domain needs weeks of');
  w('sending before it is trusted.');
  w('');

  byNeed.forEach((n) => {
    w('---');
    w('');
    w(`## ${n.title}`);
    w('');
    w(`**${n.lines.length} line${n.lines.length === 1 ? '' : 's'} depend on this.** ${n.lead}`);
    w('');
    w('| # | Section | Line | Why it cannot be coded around |');
    w('|---:|---|---|---|');
    n.lines.forEach((l) => {
      w(`| ${l.section} | ${esc(l.title)} | ${esc(l.text)} | ${esc(l.why)} |`);
    });
    w('');
  });

  w('---');
  w('');
  w('## What this list is not');
  w('');
  w('**It is not a list of excuses.** Every line here is a real capability somebody would');
  w('reasonably expect, and each is genuinely blocked on something outside this repository —');
  w('the reason is printed beside it so the judgement can be disagreed with line by line.');
  w('');
  w('**It is not fixed.** The moment a payment gateway is signed or a domain is pointed, the');
  w('lines it unblocks stop being constraints and become ordinary work. That is why they are');
  w('grouped by what they need: each group is one decision, not a list of separate defeats.');
  w('');
  w('**And it is not the gap.** The gap is in `MASTER_SPEC_COVERAGE.xlsx` — these 85 are');
  w('counted separately there precisely so they do not sit among the uncovered looking like');
  w('work somebody forgot to schedule.');
  w('');
  return L.join('\n');
}

const MD = path.join(ROOT, 'MASTER_SPEC_COVERAGE.md');
const CONSTRAINTS = path.join(ROOT, 'CONSTRAINTS.md');
const JSON_OUT = path.join(ROOT, 'brand', 'delivery', 'website', 'masterspec.data.json');

const mdText = finish(markdown());
const jsonText = JSON.stringify({
  generated_from: 'brand/site/masterspec.js',
  totals: t,
  states: st,
  score: SCORE.mean,
  maturity: `Level ${AUDIT.MATURITY.level} — ${AUDIT.MATURITY.name}`,
  sections: perSection,
  rows,
}, null, 1) + '\n';

let bad = 0;
/* THE TWO OUTPUTS ARE NOT CHECKED THE SAME WAY, BECAUSE ONLY ONE OF THEM SHIPS.
   MASTER_SPEC_COVERAGE.md is a delivered document and is inside the product archive, so a
   stale one is a real failure wherever it is found. masterspec.data.json is the intermediate
   the spreadsheet is built from — gitignored, 396KB of JSON restating masterspec.js — so it
   is NOT in the archive, and demanding it there failed `npm run test:product` from inside
   the extracted product on a checkout that was entirely correct.

   That is the same mistake as §0 rule 2, in a new place: a gate requiring a file that was
   deliberately not shipped. It says SKIPPED out loud rather than passing quietly. */
[[MD, mdText, true], [CONSTRAINTS, finish(constraints()), true],
 [JSON_OUT, jsonText, false]].forEach(([file, text, shipped]) => {
  const name = path.basename(file);
  if (check) {
    const now = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (now === null && !shipped) {
      console.log(`mkmasterspec: ${name} is not present, so it could NOT be checked.`);
      console.log('  SKIPPED, not passed. It is a build intermediate and is gitignored, so an');
      console.log('  extracted archive has none. In the repository it is generated and checked.');
      return;
    }
    if (now !== text) {
      console.error(`mkmasterspec: ${name} is out of date — run without --check.`);
      bad++;
    } else {
      console.log(`mkmasterspec: ${name} is current`);
    }
    return;
  }
  fs.writeFileSync(file, text);
  console.log(`${name}  ${Math.round(text.length / 1024)}KB`);
});

if (!check) {
  console.log(`  ${rows.length} line items · ${t.COVERED} covered · ${t.UNCOVERED} uncovered · ` +
    `${t['NOT POSSIBLE']} not possible · across ${perSection.length} sections`);
  console.log('  next: python3 tools/masterspec_xlsx.py');
}
process.exit(bad ? 1 : 0);
