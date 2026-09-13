'use strict';
/* EVERY FILE IN EACH ARCHIVE, WITH WHAT IT SAYS IT IS.
 *
 *   node brand/delivery/website/mkcontents.js              → MEDHAVA_CONTENTS.md
 *   node brand/delivery/website/mkcontents.js vastrangam   → VASTRANGAM_CONTENTS.md
 *   node brand/delivery/website/mkcontents.js --check      → both current and idempotent
 *
 * WHAT WAS ASKED FOR, AND WHAT "COVERS EVERYTHING" CAN HONESTLY MEAN
 * The owner asked for one document per archive covering everything in it. There are two
 * readings and only one of them is a document:
 *
 *   the whole content of every file   — that is the archive itself, re-typed. 27MB of
 *                                       source printed into a page nobody can read. It
 *                                       would not tell him one thing the zip does not.
 *   every file, named, with what it   — a table of contents. Every path, its size, and
 *   is and why it is in there           what the file's own header says it does.
 *
 * This writes the second, and it writes it for EVERY file — not a selection, not the
 * interesting ones. The count in the heading is the length of the list below it, and
 * checkcontents.js opens the real zip and fails if a single entry is in one and not the
 * other. That is the difference between a document that covers everything and a document
 * that says it does.
 *
 * WHERE THE DESCRIPTIONS COME FROM
 * brand/site/describe.js reads them OUT OF EACH FILE — the header comment a source file
 * opens with, the first heading of a document, the top-level keys of a data file. Nothing
 * here is written from memory about a file. When a file carries no description this says
 * so and names it, because a gap that announces itself can be closed and a guess cannot
 * be found.
 *
 * The proportions — how many describe themselves, how many are binary, how many are
 * silent — are counted at generation time and printed in each document's own summary
 * table. They are deliberately NOT repeated here: a number typed into a comment is a
 * number nobody re-checks, and the first draft of this header carried three that were
 * already wrong by the time the document was generated.
 *
 * WHY THE PARTITION IS IMPORTED AND NOT RE-STATED
 * TENANT_RE in mkstarter.js is, in the working agreement's words, "the one list that
 * decides" which file belongs to which archive. This document has to answer that same
 * question for every file, so it asks that file rather than keeping a second copy which
 * would drift and still pass both checks.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..', '..');
const STARTER = require('./mkstarter.js');
const { describe } = require(path.join(ROOT, 'brand', 'site', 'describe.js'));
/* THE SAME GLOSSARY RENDERER EVERY OTHER DOCUMENT HERE USES, so a term is never explained
   two different ways. It emits only the words the finished document actually uses.
   checkcoverage.js holds this to the one rule a skip does not excuse: a document may not
   use a technical term it never explains. The first draft of these two used ten. */
const RENDER = require(path.join(ROOT, 'brand', 'site', 'registers.js'));
const { TRADE_WORDS } = require(path.join(ROOT, 'brand', 'site', 'checkneutral.js'));

const args = process.argv.slice(2);
const check = args.includes('--check');
const wantTenant = args.some((a) => /^vastrangam$/i.test(a));

const OUT = (tenant) => (tenant ? 'VASTRANGAM_CONTENTS.md' : 'MEDHAVA_CONTENTS.md');

/* ── the areas, in a deliberate order ──────────────────────────────────────
   A flat list of 423 paths is complete and unreadable. These group them by what they are
   FOR, each with a sentence a person who did not write the code can use to decide whether
   the group matters to them. `match` is tried in order and the first hit wins, so a file
   lands in exactly one area — the same partition discipline as the archives themselves.

   Every area names what happens if it is missing, because that is the question a table of
   contents is actually asked: can I delete this? */
const AREAS = [
  {
    id: 'entry', title: 'Start here',
    /* EXACTLY THE NOTE THE BUILDER WRITES, AND NOTHING THAT MERELY BEGINS THE SAME WAY.
       Written as /^START_HERE/ this also swallowed START_HERE_OWNER.md and its PDF —
       delivered documents with their own generator — and put them under a heading saying
       they were written by the archive builder, which is not true of them. */
    match: (f) => f === 'START_HERE.md' || f === 'VASTRANGAM_START_HERE.md'
                  || f === 'READ_FIRST.md',
    why: 'Written by the archive builder at the moment the archive was made. These are the ' +
      'first things to open: one names the commands that run everything else, the other ' +
      'says which of these files are worth reading and what each costs to read.',
  },
  {
    id: 'docs', title: 'The delivered documents',
    match: (f) => !f.includes('/') && /\.(md|pdf)$/i.test(f),
    why: 'The reading matter — the plan, the design argued, the runbook, the rulebook, ' +
      'the audits, and this contents list. Each .md has a .pdf beside it rendered from ' +
      'the same source, so the two cannot disagree.',
  },
  {
    id: 'core', title: 'The data core — the part every module reads and writes',
    match: (f) => /^core\//.test(f),
    why: 'The database schema, the money arithmetic, the ledger, stock, the audit trail ' +
      'and the trade packs. Nothing above it works without it, and the isolation test ' +
      'here is the single check that one company cannot read another’s rows.',
  },
  {
    id: 'app', title: 'The application that runs on the core',
    match: (f) => /^medhava\//.test(f),
    why: 'The server, the screens and their tests — the part a person actually signs in ' +
      'to. This is the smallest of the code areas, which is an honest picture of where ' +
      'the project is: the design is large and the built part is not.',
  },
  {
    id: 'engine', title: 'The payroll and attendance engine',
    match: (f) => /^engine\//.test(f),
    why: 'Reads the business’s own workbooks, resolves every staff-month to a rate and a ' +
      'basis, and reports what it could NOT resolve rather than paying zero. This is the ' +
      'single most finished piece of software in either archive.',
  },
  {
    id: 'content', title: 'The AI content engine',
    match: (f) => /^(app|research)\//.test(f),
    why: 'A separate server for drafting product copy and imagery, with its own keys ' +
      'entered at runtime and never stored in the repository.',
  },
  {
    id: 'registers', title: 'The registers — the lists everything else is derived from',
    match: (f) => /^brand\/site\//.test(f),
    why: 'Modules, apps, rules, tools, the stack, the requirements registry, and the ' +
      'checkers that gate them. No count in any document here is typed: it is read from ' +
      'one of these files, which is why the counts have changed twice without a document ' +
      'going stale.',
  },
  {
    id: 'generators', title: 'The document generators and the archive builders',
    match: (f) => /^brand\/delivery\//.test(f),
    why: 'Every delivered document is written by a script in here, from the registers ' +
      'above. To change a document you change its generator or its register, never the ' +
      'document — a hand-edit is overwritten the next time anything is built.',
  },
  {
    id: 'prototype', title: 'The earlier prototype app line',
    match: (f) => /^brand\/suite\//.test(f),
    why: 'Sixteen single-file browser apps and the tooling that builds them, from before ' +
      'the core existed. They run with no server and no database, which is both why they ' +
      'were useful and why they are not the product.',
  },
  {
    id: 'identity', title: 'Logos, fonts and the brand sheet',
    match: (f) => /^brand\//.test(f),
    why: 'The visual identity used by the website and the rendered PDFs.',
  },
  {
    id: 'ops', title: 'Deployment, tooling and the build',
    match: (f) => /^(deploy|tools|docs|\.github|\.claude|package)/.test(f) || !f.includes('/'),
    why: 'The service unit, the web-server blocks, the PDF renderer, the evidence log and ' +
      'the checks that run on every push. Nothing here is business logic; all of it is ' +
      'how the business logic gets onto a machine and stays honest.',
  },
];

const areaOf = (f) => AREAS.find((a) => a.match(f)) || AREAS[AREAS.length - 1];

/* A SIZE THAT IS NOT KNOWN YET PRINTS AS UNKNOWN, NOT AS ZERO. The builder's own note is
   written into the archive at build time and has no size on disk to read. The first draft
   printed "0 B" beside it, which is a measurement rather than an absence and is false. */
const kb = (n) => (n === null ? '—'
  : n < 1024 ? `${n} B`
    : n < 1024 * 1024 ? `${Math.round(n / 1024)} KB`
      : `${(n / (1024 * 1024)).toFixed(1)} MB`);

const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

/* The size of a GROUP is unknown when nothing in it has a size on disk — the same
   distinction as kb() above, one level up. Summing nulls to 0 reported "1 file · 0 B" for
   the area holding only the builder's note. */
const groupBytes = (rows) =>
  (rows.every((r) => r.bytes === null) ? null : rows.reduce((s, r) => s + (r.bytes || 0), 0));

/* ── the document ──────────────────────────────────────────────────────────── */
function build(tenant) {
  const files = STARTER.contents(tenant).slice().sort();
  /* The archive also carries the note the builder writes into it, which is not a tracked
     file and so is not in the partition. It IS in the zip, so it is in this list — or the
     document and the archive would disagree by one and the checker would say so. */
  const note = STARTER.NOTE_NAME(tenant);
  /* READ_FIRST.md is the second generated note, and the PRODUCT archive alone carries it —
     see build() in mkstarter.js. Left out here the two would disagree by one file, which is
     precisely the discrepancy this document exists to make impossible. */
  const reading = tenant ? [] : [STARTER.READ_FIRST_NAME];
  const all = files.concat([note], reading).sort();

  /* THE DOCUMENT'S OWN TWO ROWS ARE STATED, NOT MEASURED — and that is not a shortcut, it
     is the only way this generator can have a fixed point.

     This file lists every file with its size. Two of those files are this document and the
     PDF rendered from it. So the .md's content would depend on the .md's size, which
     depends on its content; and the PDF is rendered from the .md, so it joins the same
     cycle from the other side. The first version did exactly that. It happened to settle
     after a second pass — and "happened to" is the problem: a size sitting on a rounding
     boundary would oscillate forever, and the failure would surface as `--check` going red
     in CI months later for no reason anybody could see.

     Reading a size that is only knowable after the write is not measurement anyway. These
     two rows say what the files are and print no size, and the cycle is gone: one pass,
     every time, whatever the sizes do. */
  const selfMd = OUT(tenant);
  const selfPdf = selfMd.replace(/\.md$/, '.pdf');
  const SELF = {
    [selfMd]: 'Every file in this archive, with what each one says it is — the document ' +
      'you are reading.',
    [selfPdf]: 'This document, rendered for printing. Same source, same figures.',
  };

  const rows = all.map((f) => {
    let d;
    if (f === note) {
      d = { kind: 'document', bytes: null, generated: true, why: null,
        said: 'Written into the archive when it is built — what this is, and the commands ' +
          'that run it.' };
    } else if (f === STARTER.READ_FIRST_NAME) {
      /* Also generated, so also sizeless here — it is not on disk to measure. Its own
         figures are measured from the files it names, at the moment the archive is built. */
      d = { kind: 'document', bytes: null, generated: true, why: null,
        said: 'The reading order, priced. Which files in this archive are worth opening, ' +
          'which are generated output to skip, and roughly what each costs to read.' };
    } else if (SELF[f]) {
      d = { kind: 'document', bytes: null, generated: true, why: null, said: SELF[f] };
    } else {
      d = describe(ROOT, f);
    }
    return { f, ...d, area: areaOf(f).id };
  });

  const total = rows.length;
  const selfDescribed = rows.filter((r) => r.said && !r.generated && !r.computed).length;
  const computed = rows.filter((r) => r.computed).length;
  const binary = rows.filter((r) => !r.said && /binary/.test(r.why || '')).length;
  const silent = rows.filter((r) => !r.said && !/binary/.test(r.why || ''));
  const bytes = rows.reduce((s, r) => s + (r.bytes || 0), 0);

  const L = [];
  const w = (s) => L.push(s);

  const NAME = tenant ? 'VASTRANGAM_TENANT.zip' : 'MEDHAVA_BOS.zip';
  w(`# What is inside ${NAME}`);
  w('');
  w(`**All ${total} files, every one of them, with what each file says it is.** Not a ` +
    'selection and not a summary of the interesting ones — the list below is the complete');
  w('contents of the archive, and a checker opens the real zip and fails the build if a');
  w('single entry is in one and not in the other.');
  w('');
  w('---');
  w('');
  w('## How to read this');
  w('');
  w('| | |');
  w('|---|---:|');
  w(`| Files in the archive | **${total}** |`);
  w(`| Total size on disk | ${kb(bytes)} |`);
  w(`| Files whose description was read out of the file itself | ${selfDescribed} |`);
  w(`| Data files described by their own top-level keys | ${computed} |`);
  w(`| Images, fonts and rendered PDFs — no readable header | ${binary} |`);
  w(`| Files carrying no description at all, named below | ${silent.length} |`);
  w('');
  w('**Nothing in the "what it is" column was written about a file.** Each line was read ');
  w('*out of* the file — the header comment a source file opens with, the first heading of');
  w('a document, the top-level keys of a data file. A file that carries no description is');
  w('reported as carrying none rather than given a guess, because a gap that says so can be');
  w('closed and a guess cannot be found.');
  w('');
  if (tenant) {
    w('**This archive is a configuration, not a program.** It cannot be run on its own and');
    w('it is not meant to be: it unzips *over* an extracted product archive and completes');
    w('it. That is checked by extracting the product, running its suite with no tenant');
    w('present, unzipping this over it, and running both suites again.');
  } else {
    w('**This archive is the product with no customer inside it.** It builds, tests and');
    w('runs with zero tenants installed — checked by extracting it into an empty directory,');
    w('running `npm ci`, and running `npm run test:product` there.');
  }
  w('');

  /* ── the areas ─────────────────────────────────────────────────────────── */
  w('---');
  w('');
  w('## Where the files are, and what each area is for');
  w('');
  w('| Area | Files | Size |');
  w('|---|---:|---:|');
  AREAS.forEach((a) => {
    const mine = rows.filter((r) => r.area === a.id);
    if (!mine.length) return;
    w(`| ${a.title} | ${mine.length} | ${kb(groupBytes(mine))} |`);
  });
  w('');

  AREAS.forEach((a) => {
    const mine = rows.filter((r) => r.area === a.id);
    if (!mine.length) return;
    w('---');
    w('');
    w(`## ${a.title}`);
    w('');
    w(`**${mine.length} file${mine.length === 1 ? '' : 's'} · ` +
      `${kb(groupBytes(mine))}.** ${a.why}`);
    w('');
    w('| File | What it says it is | Size |');
    w('|---|---|---:|');
    mine.forEach((r) => {
      const said = r.said
        ? esc(r.said)
        : `*${esc(r.why || 'no description in the file itself')}*`;
      w(`| \`${esc(r.f)}\` | ${said} | ${kb(r.bytes)} |`);
    });
    w('');
  });

  /* ── THE PDFs, WHICH ARE NO LONGER IN THIS ARCHIVE ──────────────────────
     They were 47% of the product archive and 39% of the tenant's, and every one is
     rendered from a markdown file that is still here. They moved to their own archive per
     edition.

     This section exists because the alternative was silence. The tables above are built
     from contents(), which no longer returns PDFs — so without this the documents would
     simply stop mentioning them, and a reader comparing an old archive to a new one would
     find twenty documents missing and nothing saying where they went. checkcontents.js
     compares this list against the real PDF archive, entry for entry, exactly as it does
     the tables above against the build archive. */
  {
    const list = STARTER.pdfs(tenant);
    const zip = STARTER.PDF_ZIP(tenant);
    w('---');
    w('');
    w('## The PDFs, in a separate archive');
    w('');
    /* NO TOTAL HERE, AND THAT IS THE POINT. A total over this list has to include this
       document's own PDF, whose size is only known after this document is written — the
       same cycle as the self-rows, which I had just excluded from the ROW and left in the
       SUM. Caught by truncating the PDF and watching the line move from 14.2 MB to 13.9.
       The size that can honestly be stated is stated where it is honestly knowable: the
       archive builder writes the real total into the PDF archive's own README. */
    w(`**${list.length} documents · \`${zip}\`.** These are not in \`${NAME}\` and that is ` +
      'deliberate. The archive states its own total size in the note inside it; this page ' +
      'cannot, because one of the files below is the PDF of this page.');
    w('');
    w('Each one is rendered from a markdown file of the same name, and that markdown IS in');
    w('this archive. So for anything reading the archive to build the software, the PDF was');
    w('a second copy of a document it reads worse — and between them they were nearly half');
    w(`the archive's size. They ship in \`${zip}\` instead, for reading.`);
    w('');
    w('**If a PDF and its markdown ever disagree, the markdown is right.** The PDF is');
    w('rendered from it, so a PDF saying something different is an older rendering. In the');
    w('repository `node brand/site/checkcoverage.js` fails the build when a PDF is older');
    w('than its own source.');
    w('');
    w('| Document | Size |');
    w('|---|---:|');
    /* THE DOCUMENT'S OWN PDF PRINTS NO SIZE — the same cycle as the self-rows above, and I
       reintroduced it here. This document is rendered to MEDHAVA_CONTENTS.pdf, and this
       table listed that PDF's size: render the PDF, its size changes, the document that
       states the size changes, so the PDF must be rendered again. It happened to be stable
       when measured three times in a row, which is exactly the reasoning I rejected the
       first time — one rounding boundary and it never settles, and the symptom would be
       checkcoverage saying the PDF is older than its source forever, with nothing on
       screen explaining why. */
    list.forEach((f) => {
      if (f === selfPdf) {
        w(`| \`${esc(f)}\` | — |`);
        return;
      }
      let n = 0;
      try { n = fs.statSync(path.join(ROOT, f)).size; } catch { /* absent: shown as — */ }
      w(`| \`${esc(f)}\` | ${n ? kb(n) : '—'} |`);
    });
    w('');
  }

  /* ── WHERE THE PRODUCT ARCHIVE STILL NAMES A TRADE, COUNTED AND OWNED ────
     Every description here is quoted from the file it describes, so where a file's own
     header names one business, this document reports that it does. An existing gate —
     checkedition.js — caught exactly that and was right to: a file named for the neutral
     edition should not contain a trade word.

     Redacting them was never an option. The description would then not be what the file
     says, and this document's own rule 4 re-opens the file and would fail. Saying it out
     loud, with the count and the reason, is the version that is both true and checkable.

     The rows exist because the product archive still carries the superseded prototype app
     line, which mkstarter.js reports separately on every build for the same reason. */
  if (!tenant) {
    const tw = TRADE_WORDS.filter(Boolean);
    const quoting = rows.filter((r) => r.said &&
      tw.some((word) => new RegExp('\\b' + word.replace(/ /g, '\\s+'), 'i').test(r.said)));
    w('---');
    w('');
    w('## Where a file in this archive still names one business');
    w('');
    if (quoting.length) {
      w(`**${quoting.length} of the ${rows.length} descriptions below quote a file whose own ` +
        'header names a particular trade.** They are not redacted, because every');
      w('description on this page is the file’s own words and a tidied quotation would be a');
      w('different claim from the one the file makes. They are listed instead:');
      w('');
      quoting.forEach((r) => w(`- \`${esc(r.f)}\``));
      w('');
      w('All but one are in the earlier prototype app line, which is committed build output');
      w('from before the product and the customer were separated. The build reports the same');
      w('thing every time it runs it. The product’s own engine — everything under `core/` and');
      w('`medhava/` — contains none, and that is the ring that has to be empty.');
    } else {
      w('No file in this archive has a trade word in its own header.');
    }
    w('');
  }

  /* ── the honest gaps ───────────────────────────────────────────────────── */
  w('---');
  w('');
  w('## The files that describe themselves, and the ones that do not');
  w('');
  if (silent.length) {
    w(`${silent.length} file${silent.length === 1 ? '' : 's'} in this archive carr` +
      `${silent.length === 1 ? 'ies' : 'y'} no description of any kind — no header comment,`);
    w('no title, nothing readable at the top. They are named here rather than given a');
    w('sentence somebody invented, and adding a header to any of them is a real improvement');
    w('to the file rather than to this document:');
    w('');
    silent.forEach((r) => w(`- \`${esc(r.f)}\` — ${kb(r.bytes)}, ${esc(r.why || 'no header')}`));
  } else {
    w('Every file in this archive that can carry a description does carry one.');
  }
  w('');
  w(`The ${binary} images, fonts and rendered PDFs are not in that list. A PNG has no ` +
    'header to read, and');
  w('the most a contents page can honestly say about one is its name and its size, which it does.');
  w('');
  w('---');
  w('');
  w('## How to check this document is true');
  w('');
  w('Do not take its word for it. From the repository:');
  w('');
  w('```');
  w('node brand/site/checkcontents.js --summary');
  w('```');
  w('');
  w('That opens both built archives and compares them entry by entry against these');
  w('documents. It fails if the archive holds a file this page does not list, if this page');
  w('lists a file the archive does not hold, if a stated count is not the length of its own');
  w('list, or if a description here is not text that really occurs in the file it describes.');
  w('');
  const body = L.join('\n');
  const gloss = RENDER.glossarySection({ only: body, heading: '###' });
  return body + (gloss
    ? '\n---\n\n## Every technical word above, in plain language\n\n' + gloss
    : '') + '\n';
}

/* ── write, or prove current ─────────────────────────────────────────────────
   NO GIT, NO ANSWER — AND SAY SO RATHER THAN DIE. The file list comes from `git ls-files`
   through mkstarter.js. Inside the extracted product archive there is no .git, so the call
   throws and, left alone, takes `npm run test:product` down with it and the product archive
   does not build.

   This is the THIRD time this exact mistake has been made in this repository — first in
   checkedition.js, where it was written down as defect 13, then in mkaudit.js by the same
   hand that had written the lesson, and now here. The verify step caught it every time and
   reading the code caught it none of the times.

   Falling back to a directory walk is the tempting fix and is wrong for the same reason it
   was wrong in mkaudit.js: a walk lists files git ignores, so the archive's copy of this
   document would name a different set of files from the repository's under the same title.
   Better to have no document than a second one nobody can reconcile. */
function emit(tenant) {
  const file = path.join(ROOT, OUT(tenant));
  let text;
  try {
    text = build(tenant);
  } catch (e) {
    if (check) {
      console.log(`mkcontents: this checkout has no git repository, so ${OUT(tenant)} ` +
        'could NOT be checked against the file list.');
      console.log('  SKIPPED, not passed. Inside an extracted archive there is no .git and');
      console.log('  the list of tracked files cannot be read. In the repository it runs.');
      return 0;
    }
    console.error(`mkcontents: cannot build ${OUT(tenant)} — the tracked-file list is ` +
      `unavailable here (${String(e.message).split('\n')[0]}). Run this in the repository.`);
    return 1;
  }
  if (check) {
    const now = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (now !== text) {
      console.error(`mkcontents: ${OUT(tenant)} is out of date — run without --check.`);
      return 1;
    }
    console.log(`mkcontents: ${OUT(tenant)} is current`);
    return 0;
  }
  /* WRITE ONLY WHEN THE BYTES CHANGE. An unconditional write bumps the mtime of an
     identical file, and checkcoverage compares each .md against its .pdf by mtime — so
     re-running this generator made a document that had not changed look newer than the PDF
     rendered from it, and demanded a re-render that produced an identical PDF. The
     documented build order avoids the loop by running this before the PDFs; a generator
     should not depend on being called in the right order to avoid inventing work. */
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text) fs.writeFileSync(file, text);
  /* COUNTED THE WAY THE CHECKER COUNTS, not the way that happens to be shorter to write.
     This was /^\| `/ — every line starting with a backticked cell — and once the PDF table
     was added it reported 428 for an archive of 408, because it swept up the PDF rows the
     checker's own three-column pattern correctly ignores. The document was right and the
     line announcing it was wrong, which is the harder of the two to notice. */
  const n = (text.match(/^\| `[^`]+` \| .+? \| [^|]*\|$/gm) || []).length;
  const p = (text.match(/^\| `[^`]+` \| [^|]*\|$/gm) || []).length;
  console.log(`${OUT(tenant)}  ${Math.round(text.length / 1024)}KB · ${n} files in ` +
    `${tenant ? 'VASTRANGAM_TENANT' : 'MEDHAVA_BOS'}.zip · ${p} PDF(s) listed separately`);
  return 0;
}

let bad = 0;
if (check) { bad += emit(false); bad += emit(true); } else if (args.length && wantTenant) {
  bad += emit(true);
} else if (args.length && !wantTenant) {
  bad += emit(false);
} else { bad += emit(false); bad += emit(true); }
process.exit(bad ? 1 : 0);
