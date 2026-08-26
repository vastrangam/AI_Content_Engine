'use strict';
/* WHERE THE SPECIFICATION CONTRADICTS ITSELF.
 *
 *   node brand/delivery/website/mkconflicts.js   → SPEC_CONFLICTS.md
 *
 * WHO READS THIS
 * Whoever owns the specification. Every entry is a fork in what the software should do, and every
 * one is still open — the decision taken was to record them, not to resolve them, so this document
 * asks eight questions and answers none of them.
 *
 * WHERE THE CONTENT COMES FROM
 * brand/site/conflicts.js, entirely. Nothing is retyped here, and brand/site/checkconflicts.js
 * refuses an entry that has lost its line references, its quoted text or its "what the repository
 * does" column — so this document cannot decay into a page of unease.
 *
 * NO PERSON IS NAMED, and the check at the foot reads the finished file to be sure.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

const { SOURCE, CONFLICTS } = require(path.join(SITE, 'conflicts.js'));
const WORDS = require(path.join(SITE, 'plainwords.js'));

const OUT = path.join(ROOT, 'SPEC_CONFLICTS.md');

/* Same two collisions the other Vastrangam documents declare: "job work" is this trade's term for
   contract manufacture, and "row" appears only as a spreadsheet row quoted from the business's own
   file layout. */
const SKIP_TERMS = ['job', 'row'];

const esc = (s) => String(s);
const open = CONFLICTS.filter((c) => c.resolution === null).length;
const refs = CONFLICTS.reduce((n, c) => n + c.says.length, 0);

const out = [];
const p = (...lines) => out.push(...lines);

p(`# Where the specification contradicts itself`, '');
p(`${CONFLICTS.length} places where **${esc(SOURCE.file)}** — ${SOURCE.lines.toLocaleString()} lines ` +
  `assembled from several earlier documents — says two different things. ${refs} line references, ` +
  `each quoted so you can check it against your own copy.`, '');
p(`**None of these is resolved here, and that is the decision rather than an omission.** Each entry ` +
  `says what the specification says, and separately what this repository does today. Those are two ` +
  `different claims: "what we do" is not "what is correct", and writing them in one column is how a ` +
  `guess becomes a decision nobody remembers taking.`, '');
p(`**No person is named.** Two entries are about one worker's pay and one worker's roster ` +
  `membership. A person's name does not go into a document that gets sent, and a conflict being ` +
  `about them does not change that — each is described by role, and the line numbers point at the ` +
  `exact rows, which is what resolving it needs anyway.`, '');
p(esc(SOURCE.note), '');
p('');

/* The technical words this page cannot avoid — most of them inside quoted lines from the
   specification itself. Explained here rather than left for the reader to infer, which is the one
   check no document in this repository is allowed to skip. Which words those are is MEASURED, not
   listed: the list is filled in at the end, once the page exists to be measured. */
const GLOSSARY_HERE = '<!-- GLOSSARY_HERE -->';
p(GLOSSARY_HERE, '');
p('---', '');

/* The index, so a reader can see the shape before reading eight of them. */
p('## The eight, at a glance', '');
p('| | Conflict | Where it says both things | Open |');
p('|---|---|---|---|');
CONFLICTS.forEach((c) => {
  p(`| **${c.id}** | ${esc(c.title)} | ${c.says.map((s) => `L${s.at}`).join(' · ')} | ` +
    `${c.resolution === null ? 'yes' : 'resolved'} |`);
});
p('');
p('---', '');

CONFLICTS.forEach((c) => {
  p(`## ${c.id} · ${esc(c.title)}`, '');
  p('**What the specification says**', '');
  p('| Line | What is written there |');
  p('|---|---|');
  c.says.forEach((s) => p(`| **L${s.at}** | ${esc(s.text).replace(/\|/g, '\\|')} |`));
  p('');
  p(`**Why that is a conflict.** ${esc(c.what)}`, '');
  p(`**What this repository does today.** ${esc(c.repo)}`, '');
  p(c.resolution === null
    ? '**Resolution: open.** Nobody has decided, and nothing here has decided on their behalf.'
    : `**Resolution.** ${esc(c.resolution)}`, '');
  p('---', '');
});

p('## What happens to this file', '');
p(`It is generated from \`brand/site/conflicts.js\` and checked by ` +
  `\`brand/site/checkconflicts.js\`, which runs with every other gate. An entry that loses a line ` +
  `reference, loses the quoted text at one, or loses its "what this repository does" column fails ` +
  `the build. So the register can be argued with, added to, or closed — it cannot quietly become ` +
  `vague.`, '');
p(`When one of the ${open} is decided, the decision goes in \`conflicts.js\` as the entry's ` +
  `resolution and this page regenerates. Until then every one of them stays open in writing.`, '');

let text = out.join('\n') + '\n';

/* ── the glossary block, measured rather than guessed ─────────────────────────
   Carried to a FIXED POINT, because explaining a word introduces the words its own explanation
   uses: "table" is explained in terms of a database, so the database owes an explanation too. One
   pass would leave the reader stranded one word further along than before. */
const explained = [];
for (let pass = 0; pass < 12; pass++) {
  const body = text.replace(GLOSSARY_HERE, explained.map((t) => WORDS.firstUse(t) || '').join('\n'));
  const missing = WORDS.checkwords(body, { skip: SKIP_TERMS });
  if (!missing.length) break;
  missing.forEach((t) => { if (!explained.includes(t)) explained.push(t); });
}
const block = explained.length
  ? ['**The technical words on this page, before they appear.** Most of them arrive inside lines ' +
     'quoted from the specification, so they cannot be reworded away.', '',
     ...explained.map((t) => `- ${WORDS.firstUse(t)}`)].join('\n')
  : '';
text = text.replace(GLOSSARY_HERE, block);

/* ── the two checks before it is written ─────────────────────────────────── */
const problems = [];

/* Every technical word explained where it is used — the check no document skips. */
const unexplained = WORDS.checkwords(text, { skip: SKIP_TERMS });
if (unexplained.length) {
  problems.push(`uses ${unexplained.length} technical term(s) it never explains: ${unexplained.join(', ')}`);
}

/* And the roster, read only to confirm absence. */
try {
  const master = require(path.join(ROOT, 'engine', 'fixtures', 'master.json'));
  const names = (master.people || []).map((x) => x.name).filter(Boolean);
  const found = names.filter((n) => new RegExp(`\\b${n}\\b`, 'i').test(text));
  if (found.length) problems.push(`${found.length} roster name(s) reached the page`);
  console.log(`  ${names.length} roster names checked for, ${found.length} present`);
} catch (e) {
  problems.push(`could not read the roster to check it is absent: ${e.message}`);
}

if (problems.length) {
  console.error('mkconflicts: refusing to write —\n  ' + problems.join('\n  '));
  process.exit(1);
}

fs.writeFileSync(OUT, text);
console.log(`SPEC_CONFLICTS.md written: ${Math.round(Buffer.byteLength(text) / 1024)}KB · ` +
  `${CONFLICTS.length} conflicts · ${refs} line references · ${open} open · ` +
  `${explained.length} terms explained on first use`);
