'use strict';
/* THE MEDHAVA BOS — the four platform documents as one file.

     node brand/delivery/website/mkfinal.js   → Medhava_BOS.md

   FOUR PARTS, IN THE ORDER SOMEBODY READS THEM
     One   the landing page      what it is, for a reader arriving cold
     Two   the architect         WHAT the system is and WHY, with what would make each
                                 decision the wrong one
     Three the plan of action    what gets built, in what order, and the rules it must satisfy
     Four  the build guide       HOW each layer works, then the ordered path from an empty
                                 machine to a deployed product

   THERE IS NO TRADE EDITION OF THIS DOCUMENT ANY MORE.
   This generator used to also write Vastrangam_BOS_Final.md — the landing page and the builder's
   plan of action, sent to a business that does not build software and had already read the
   landing page before it signed up. That document left the delivery manifest, and a generator
   whose only output nobody receives is a generator that will drift without anybody noticing.
   The tenant has its own two documents and their merge; see mktenant.js. The reason the old one
   was retired is recorded in brand/delivery/manifest.js under NOT_DELIVERED.

   Composed from the two sources rather than written a third time. A hand-made merge is a third
   copy of the same facts, and the day one of them is corrected is the day the three stop agreeing
   — which is exactly the failure this whole system exists to avoid. So the landing page is read
   from the generator's own output and the plan is read from that edition's plan document, and
   this file only writes the front matter that stitches them together.

   The counts in that front matter are derived from modules.js the same way every other number
   here is. Nothing is typed from memory.

   Run:  node brand/delivery/website/mklanding.js       (produces Part One)
         node brand/delivery/website/mkarchitect.js     (Part Two)
         node brand/delivery/website/mkguide.js         (Part Four)
         node brand/delivery/website/mkfinal.js
         python3 tools/report_pdf.py Medhava_BOS.md
         node tools/report_pdf.js Medhava_BOS.html
*/

const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');

/* ── the counts, derived ─────────────────────────────────────────────────── */
const BASE = require(path.join(ROOT, 'brand/site/modules.js'));
/* built.js no longer feeds this document. It answered "which apps exist today", and this
   document now describes a system being built from scratch — where that question has one
   answer for every app and therefore tells a reader nothing. */
const STACK = require(path.join(ROOT, 'brand/site/stack.js'));
const DYN = require(path.join(ROOT, 'brand/site/dynamic.js'));
const NMOD = BASE.length;
const NAPP = BASE.reduce((s, m) => s + m.apps.length, 0);
const NLAYER = STACK.LAYERS.length;
const NSWAP = STACK.LAYERS.reduce((a, l) => a + (l.swaps || []).length, 0);
const NDYN = DYN.ENTRIES.length;
const DATE = new Date().toISOString().slice(0, 10);

/* ── what each edition is made of ────────────────────────────────────────── */
const EDITION = {
  name: 'Medhava',
  strap: '**One Business Operating System. Any trade. One shared data core.**',
  landing: path.join(HERE, 'MEDHAVA_BOS', 'Medhava_Website.md'),
  plan: path.join(ROOT, 'MEDHAVA_PLAN_OF_ACTION.md'),
  out: path.join(ROOT, 'Medhava_BOS.md'),
  planNote: 'what Medhava is, the tenancy model, the industry pack engine, the eight build phases, the free-first tool register, onboarding, security, risks and what a customer pays for',
  scope: `**Part One — The System** is the reader's tour: what Medhava is, how one order moves through it,
every module and every app, how a trade is added as a row of configuration, and the rules that hold
everywhere.`,
  extra: `## The claim, and where it is checked

**"Any industry" is a statement about the code, so it is checked in the code.**

A trade is a row, not a fork. What a business calls things, the stages its work moves through, the
extra fields its records need, the documents it issues and the reference data it starts with all
arrive as one configuration file — and a pack may never contain executable code, invent a concept
the engine does not have, extend a table that does not exist, declare money as anything but integer
paise, switch off an immutable rule, or be applied in part.

| | How many | The design |
|---|---|---|
| Industry packs shipped | ${packCount()} | a directory, no ceiling |
| Companies | as many as you have | a table; the shipped plan caps a subscription at 20, the software has none |
| Channels per company | as many as you sell on | a table, read from your data |
| Stock | one number per SKU | one number per SKU — never per channel |
| Group | sum minus inter-company trade | sum minus inter-company trade |

\`core/tests/packs.test.js\` invents a **commercial laundry** during the test run — a trade that
appears nowhere in this software — loads it from a JSON string, and requires every screen to answer
in that trade's words while still refusing it the audit trail. A final assertion fails the build if
the engine file ever contains a single trade word. \`core/tests/core.test.js\` does the matching
thing for scale: ten companies with ten channels each, then eleven by eleven with no code changed.

---

`,
};

function packCount() {
  try {
    const d = path.join(ROOT, 'core', 'packs');
    return fs.readdirSync(d).filter((f) => f.endsWith('.json')).length;
  } catch (_) { return 0; }
}

EDITION.architect = path.join(ROOT, 'MEDHAVA_ARCHITECT.md');
EDITION.guide = path.join(ROOT, 'MEDHAVA_BUILD_GUIDE.md');

/* THE FOUR PARTS, AND WHAT REGENERATES EACH.
   Named rather than checked as a bare list, because "missing MEDHAVA_ARCHITECT.md" tells somebody
   what is absent and not what to type. A merge that quietly produced three parts would look whole
   — that is precisely the failure a reader cannot see — so a missing source stops the build. */
const SOURCES = [
  ['landing',   EDITION.landing,   'node brand/delivery/website/mklanding.js'],
  ['architect', EDITION.architect, 'node brand/delivery/website/mkarchitect.js'],
  ['plan',      EDITION.plan,      'node brand/site/mkregisters.js && node brand/site/mkrulebook.js'],
  ['guide',     EDITION.guide,     'node brand/delivery/website/mkguide.js'],
];

const absent = SOURCES.filter(([, f]) => !fs.existsSync(f));
if (absent.length) {
  console.error(`mkfinal: ${absent.length} of the ${SOURCES.length} parts have not been ` +
    `generated. Refusing to write a document that would look complete.\n`);
  absent.forEach(([name, f, cmd]) =>
    console.error(`  ${name.padEnd(10)} ${path.relative(ROOT, f)}\n             ${cmd}`));
  process.exit(1);
}

/* ── the four parts, read not rewritten ──────────────────────────────────── */
const landing = fs.readFileSync(EDITION.landing, 'utf8');
const architect = fs.readFileSync(EDITION.architect, 'utf8');
const plan = fs.readFileSync(EDITION.plan, 'utf8');
const guide = fs.readFileSync(EDITION.guide, 'utf8');

/* Each source opens with its own H1. Inside one document those become the two
   part headings, so the first line of each is dropped and replaced. */
const stripFirstHeading = (md) => md.replace(/^#\s+[^\n]*\n+/, '');
/* Everything is pushed one level down so the merged document has a single H1. */
const demote = (md) => md.replace(/^(#{1,5})\s/gm, (_, h) => '#' + h + ' ');

/* The website markdown carries screenshots as paths relative to ITSELF —
   `shots/m05.png`, which is right where that file sits. This document is written to the repo
   root, so the same string would point at a directory that does not exist and every picture
   would be missing. Rewritten here rather than absolute-pathed in the generator, because a
   relative path is what makes the website .md readable in an ordinary markdown viewer. */
function rebase(md, fromDir) {
  const prefix = path.relative(path.dirname(EDITION.out), fromDir).split(path.sep).join('/');
  if (!prefix) return md;
  return md.replace(/(!\[[^\]]*\]\()(?!https?:|data:|\/)([^)]+)(\))/g,
    (_, a, src, b) => a + prefix + '/' + src + b);
}

const FRONT = `# ${EDITION.name}

${EDITION.strap}

${NMOD} modules · ${NAPP} apps · ${NLAYER} technical layers · compiled ${DATE}

---

## What this document is

Four documents in one, because they answer four different questions and different people ask
different ones. Each is also published on its own; this is for anybody who would rather hold one
thing.

${EDITION.scope}

**Part Two — The Design, And Why** is the argument: what the system is, why each decision is the way
it is, and — for every one of them — **what would make it the wrong decision**. A design that only
lists its choices cannot be disagreed with, and a choice nobody can disagree with was never really
made.

**Part Three — The Plan of Action** is what gets built and in what order: ${EDITION.planNote}.

**Part Four — How It Is Built** is the engineering: the architecture, the database, the backend, the
frontend, storage, memory, sign-in, integrations and how it is run — every layer with what it is
built on and what can replace it — and then the ordered path from an empty machine to a deployed
product, with the command and the check for every stage.

**Which one you need.** Part Two if you are deciding or reviewing; Part Four if you are building
today. Parts One and Three are what you hand somebody who has to understand the whole before they
touch any of it.

All four are generated from \`brand/site/modules.js\`, the one canonical list. No page here contains a
module count, an app name or an app order typed by hand — which is why they cannot disagree with each
other or with the software.

---

## What it claims, and what it does not

**This describes a design.** Everything in it is what the system is being built to be. Nothing in it
claims to already exist, and no part of it is presented as finished.

Two rules run through every page. **No capability depends on one tool** — ${NLAYER} technical layers,
${NSWAP} named alternatives between them, each behind an interface so a supplier can be changed
without a rebuild. **Nothing is static and the past stays correct** — ${NDYN} things a business
changes itself, instantly, each carrying the date it starts from so closed months never move.

---

${EDITION.extra}## The honesty rules this document is written under

1. Nothing is described as finished. This is a design, and it says so on its first page.
2. No count is typed from memory. Every figure is read from the canonical list when this is written.
3. No figure is invented. Where a rate or a price is missing, the tool posts zero and names the
   item rather than guessing — a guessed rate is a wrong payment to a real person.
4. Where something could not be verified, it says so instead of implying it was.

---

`;

const PART_ONE = `# PART ONE — THE SYSTEM

${rebase(demote(stripFirstHeading(landing)), path.dirname(EDITION.landing))}
`;

/* The architect and the build guide carry no images, so neither needs rebasing — only the
   website page does, and it is the only one that gets it. */
const PART_TWO = `

---

# PART TWO — THE DESIGN, AND WHY

${demote(stripFirstHeading(architect))}
`;

const PART_THREE = `

---

# PART THREE — THE PLAN OF ACTION

${demote(stripFirstHeading(plan))}
`;

const PART_FOUR = `

---

# PART FOUR — HOW IT IS BUILT

${demote(stripFirstHeading(guide))}
`;

const DOC = FRONT + PART_ONE + PART_TWO + PART_THREE + PART_FOUR;

/* THE MERGE IS CHECKED, NOT ASSUMED.
   Four sources went in; four part headings must come out. A source that silently rendered empty —
   a stripFirstHeading that ate more than one line, a read that returned nothing — would produce a
   document whose table of contents promises four parts and whose body has three, and every other
   check here would pass. */
const HEADINGS = ['PART ONE', 'PART TWO', 'PART THREE', 'PART FOUR'];
const missingParts = HEADINGS.filter((h) => !DOC.includes(`# ${h} — `));
if (missingParts.length) {
  console.error(`mkfinal: ${missingParts.join(', ')} never made it into the document.`);
  process.exit(1);
}
/* And each part must carry real content, not just its heading. The thinnest of the four sources
   is the website page; a part shorter than a page of text is a part that failed to render. */
const bodies = DOC.split(/^# PART /m).slice(1);
const thin = bodies.map((b, i) => [HEADINGS[i], b.length]).filter(([, n]) => n < 2000);
if (thin.length) {
  console.error('mkfinal: ' + thin.map(([h, n]) => `${h} is ${n} characters`).join(', ') +
    ' — a part that short did not render.');
  process.exit(1);
}

fs.writeFileSync(EDITION.out, DOC);

const kb = Math.round(Buffer.byteLength(DOC) / 1024);
const diagrams = (DOC.match(/```mermaid/g) || []).length;
const h1 = (DOC.match(/^# /gm) || []).length;
console.log(`${path.relative(ROOT, EDITION.out)} written: ${kb}KB · MEDHAVA · ` +
  `${SOURCES.length} parts · ${diagrams} mermaid diagrams · ${h1} top-level headings · ` +
  `${NMOD} modules · ${NAPP} apps · ${NLAYER} layers`);
console.log('  composed from: ' + SOURCES.map(([n]) => n).join(' · ') +
  ' — read from their own generated files, never restated here');
