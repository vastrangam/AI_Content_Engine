'use strict';
/* THE CONTENTS DOCUMENTS, CHECKED AGAINST THE ACTUAL ZIP FILES.
 *
 *   node brand/site/checkcontents.js
 *   node brand/site/checkcontents.js --summary
 *
 * WHY THIS GATE OPENS THE ARCHIVE INSTEAD OF TRUSTING THE GENERATOR
 * MEDHAVA_CONTENTS.md claims to list every file in MEDHAVA_BOS.zip. Checking that claim
 * against the same function that produced it would prove only that the generator agrees
 * with itself — the circular proof §12.H of the anti-cheat protocol names by that word,
 * and this repository has shipped one before.
 *
 * So this reads the BUILT ZIP. It unzips nothing; it reads the archive's central
 * directory, which is the list a person gets when they open the file. Then:
 *
 *   1 · every entry in the zip appears in the document      — nothing is hidden
 *   2 · every path in the document is in the zip            — nothing is invented
 *  1b · the same two, for the PDF archive                   — see below
 *   3 · the count in the heading is the length of its list  — the summary cannot drift
 *   4 · every description really occurs in its file         — the claim is re-read
 *   5 · the two documents partition, exactly as the zips do — no file in both, none lost
 *   6 · the tenant's document names the tenant, the         — each is addressed to its
 *       product's names no customer                           own reader
 *
 * FOUR ARCHIVES, NOT TWO. The PDFs were 47% of the product archive and 39% of the tenant's,
 * every one of them rendered from a markdown file that is still in the build archive, so
 * they now ship in MEDHAVA_PDF.zip and VASTRANGAM_PDF.zip. The build archive's tables stop
 * listing them automatically — they come from contents(), which no longer returns PDFs —
 * and that silence was the danger: twenty documents would have vanished from the archive
 * with nothing anywhere saying where they went. Each document carries a section naming its
 * edition's PDFs, and rule 1b holds that section to exactly the standard the main tables
 * are held to, against the real PDF zip.
 *
 * RULE 4 IS THE ONE THAT MATTERS. Rules 1 to 3 prove the document is COMPLETE, which is
 * what was asked for. Only rule 4 proves it is TRUE: for every row whose description was
 * read out of a file, the file is opened again here and the text must still be in it. A
 * description that was correct when generated and is not correct now fails the build.
 *
 * WHEN THE ARCHIVES HAVE NOT BEEN BUILT
 * They are gitignored — an archive of this repository inside this repository is 27MB per
 * regeneration. So a checkout that has never run mkstarter.js has no zip to read, and this
 * says SKIPPED, not passed, and exits 0. Silence in that case would be a gate that quietly
 * checks less than it did yesterday, which §0 rule 2 of the working agreement forbids by
 * name.
 */

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const ROOT = path.join(__dirname, '..', '..');
const { describe } = require('./describe.js');
const { PDF_ZIP, NOTE_NAME, READ_FIRST_NAME } =
  require(path.join(ROOT, 'brand', 'delivery', 'website', 'mkstarter.js'));

/* The notes the archive builder writes in. They are described in the contents document but
   are not quoted from, because they do not exist in the repository to quote — see the
   exemption below. Asked of mkstarter rather than typed here, so a fourth generated note is
   one change in the builder and not a silent hole in this gate. */
const BUILDER_NOTES = new Set([NOTE_NAME(false), NOTE_NAME(true), READ_FIRST_NAME]);

const summary = process.argv.includes('--summary');
let failures = 0;
let skipped = 0;
const fail = (m) => { failures++; console.error('checkcontents: ' + m); };

const EDITIONS = [
  { tenant: false, zip: 'MEDHAVA_BOS.zip', doc: 'MEDHAVA_CONTENTS.md', label: 'product' },
  { tenant: true, zip: 'VASTRANGAM_TENANT.zip', doc: 'VASTRANGAM_CONTENTS.md', label: 'tenant' },
];

/* ── reading a zip's file list without unzipping it ─────────────────────────
   The central directory sits at the end of the file and names every entry. Parsing it
   directly avoids shelling out to `unzip`, which is not installed everywhere, and avoids
   extracting 27MB to answer a question about names. */
function zipEntries(file) {
  const buf = fs.readFileSync(file);
  /* End of central directory: signature 0x06054b50, within the last 64KB. */
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66000); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error(`${path.basename(file)}: no end-of-central-directory record`);
  let count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);

  /* Zip64, which this archive reaches on file count or size. The locator sits just before
     the EOCD and points at the real record. */
  if (count === 0xffff || off === 0xffffffff) {
    const loc = eocd - 20;
    if (loc >= 0 && buf.readUInt32LE(loc) === 0x07064b50) {
      const z64 = Number(buf.readBigUInt64LE(loc + 8));
      if (buf.readUInt32LE(z64) === 0x06064b50) {
        count = Number(buf.readBigUInt64LE(z64 + 32));
        off = Number(buf.readBigUInt64LE(z64 + 48));
      }
    }
  }

  const names = [];
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) {
      throw new Error(`${path.basename(file)}: central directory entry ${i} is malformed`);
    }
    const nlen = buf.readUInt16LE(off + 28);
    const elen = buf.readUInt16LE(off + 30);
    const clen = buf.readUInt16LE(off + 32);
    names.push(buf.toString('utf8', off + 46, off + 46 + nlen));
    off += 46 + nlen + elen + clen;
  }
  return names.filter((n) => !n.endsWith('/'));
}

/* The product archive nests under one folder; the tenant archive is flat, because it
   unzips OVER an extracted product rather than beside it. Both are stripped to the paths
   the documents use. */
function innerPaths(names) {
  const roots = new Set(names.map((n) => (n.includes('/') ? n.split('/')[0] : null)));
  const nested = roots.size === 1 && !roots.has(null);
  return names.map((n) => (nested ? n.split('/').slice(1).join('/') : n)).filter(Boolean);
}

/* ONE NORMALISER, USED ON BOTH SIDES. Letters, digits and single spaces — everything a
   comment marker, a box rule or a line wrap can vary is removed from both the document's
   sentence and the file's text before they are compared, so the only thing the comparison
   can detect is a difference in the WORDS. */
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/* ── the document's own lists ──────────────────────────────────────────────
   Two of them now, and they are told apart by the SHAPE of the row rather than by where
   they sit in the file. The archive tables are three columns — file, what it is, size. The
   PDF table is two — file, size — because a PDF's description would be the same sentence
   as its markdown's and printing it twice says nothing.

   Position would have been the easy way to split them and would have broken the first time
   a section moved. */
const rowRe = /^\| `([^`]+)` \| (.+?) \| [^|]*\|$/gm;
const pdfRowRe = /^\| `([^`]+)` \| [^|]*\|$/gm;

function docRows(text) {
  const out = [];
  let m;
  rowRe.lastIndex = 0;
  while ((m = rowRe.exec(text))) out.push({ file: m[1], said: m[2].trim() });
  return out;
}

function pdfRows(text) {
  const sec = (text.match(/## The PDFs, in a separate archive[\s\S]*?(?=\n## )/) || [''])[0];
  return [...sec.matchAll(pdfRowRe)].map((m) => m[1]);
}

/* ── the checks ────────────────────────────────────────────────────────────── */
const seenEverywhere = new Map();
const stats = [];

EDITIONS.forEach((ed) => {
  const zipFile = path.join(ROOT, ed.zip);
  const docFile = path.join(ROOT, ed.doc);

  if (!fs.existsSync(docFile)) {
    /* A PRODUCT GATE MAY NOT REQUIRE A TENANT'S FILE. §0 rule 2 of the working agreement
       says so, and this broke it: run from inside the extracted PRODUCT archive — which by
       construction contains no tenant — VASTRANGAM_CONTENTS.md is absent, and demanding it
       failed `npm run test:product` on a checkout that was entirely correct.

       Keyed on the tenant's edition file, the same way checkroadmap.js does it, so the two
       cannot disagree about what "a tenant is installed" means. And it says SKIPPED out
       loud: a gate that silently checks less than it did yesterday is worse than one that
       fails. */
    const installed = fs.existsSync(path.join(ROOT, 'brand', 'site', 'edition_vastrangam.js'));
    if (ed.tenant && !installed) {
      skipped++;
      console.log(`checkcontents: no tenant is installed, so ${ed.doc} does not exist here ` +
        'and could NOT be checked.');
      console.log('  SKIPPED, not passed. This is the product on its own, which is the ' +
        'state it must build in.');
      return;
    }
    fail(`${ed.doc} has not been generated — run node brand/delivery/website/mkcontents.js`);
    return;
  }
  const text = fs.readFileSync(docFile, 'utf8');
  const rows = docRows(text);

  /* ── 3 · the stated count is the length of the list ───────────────────── */
  const stated = text.match(/\| Files in the archive \| \*\*(\d+)\*\* \|/);
  if (!stated) {
    fail(`${ed.doc} does not state how many files it lists, so nothing can be compared to it`);
  } else if (Number(stated[1]) !== rows.length) {
    fail(`${ed.doc} says it lists ${stated[1]} files and lists ${rows.length}. The heading ` +
      `and the table disagree, and a reader trusts the heading.`);
  }
  const headline = text.match(/\*\*All (\d+) files/);
  if (headline && Number(headline[1]) !== rows.length) {
    fail(`${ed.doc} opens by claiming all ${headline[1]} files and lists ${rows.length}`);
  }

  /* ── 1 and 2 · against the real archive ───────────────────────────────── */
  if (!fs.existsSync(zipFile)) {
    skipped++;
    console.log(`checkcontents: ${ed.zip} has not been built in this checkout, so ` +
      `${ed.doc} could NOT be compared against it.`);
    console.log('  SKIPPED, not passed. The archives are gitignored — 27MB per rebuild — so');
    console.log('  a fresh checkout has none. To check it for real:');
    console.log(`    node brand/delivery/website/mkstarter.js${ed.tenant ? ' vastrangam' : ''}`);
    console.log('    node brand/site/checkcontents.js');
  } else {
    let inner;
    try {
      inner = innerPaths(zipEntries(zipFile));
    } catch (e) {
      fail(`${ed.zip} could not be read: ${e.message}`);
      inner = null;
    }
    if (inner) {
      const inZip = new Set(inner);
      const inDoc = new Set(rows.map((r) => r.file));

      const missing = [...inZip].filter((f) => !inDoc.has(f)).sort();
      const invented = [...inDoc].filter((f) => !inZip.has(f)).sort();

      if (missing.length) {
        fail(`${ed.zip} contains ${missing.length} file(s) that ${ed.doc} does not list. ` +
          `The document claims to cover everything in the archive:\n    ` +
          missing.slice(0, 12).join('\n    ') + (missing.length > 12 ? '\n    …' : ''));
      }
      if (invented.length) {
        fail(`${ed.doc} lists ${invented.length} file(s) that are NOT in ${ed.zip}:\n    ` +
          invented.slice(0, 12).join('\n    ') + (invented.length > 12 ? '\n    …' : ''));
      }
      stats.push({ ...ed, zipCount: inner.length, docCount: rows.length });
    }
  }

  /* ── 1b and 2b · the PDF archive, the same two rules ───────────────────────
     The PDFs left the build archive and the document's tables stopped listing them, so
     without this they would be documented nowhere and no check would notice. This section
     is held to exactly the standard the tables above are held to: everything in the PDF
     zip is named here, and nothing named here is absent from it. */
  const pdfZipFile = path.join(ROOT, PDF_ZIP(ed.tenant));
  const listed = pdfRows(text);

  if (!listed.length) {
    fail(`${ed.doc} has no "The PDFs, in a separate archive" section, or none with rows in ` +
      `it. ${PDF_ZIP(ed.tenant)} exists and its contents would then be described nowhere — ` +
      `a reader comparing this archive with an older one would find documents missing and ` +
      `nothing saying where they went.`);
  } else if (!fs.existsSync(pdfZipFile)) {
    skipped++;
    console.log(`checkcontents: ${PDF_ZIP(ed.tenant)} has not been built in this checkout, ` +
      `so the ${listed.length} PDF(s) ${ed.doc} lists could NOT be compared against it.`);
    console.log('  SKIPPED, not passed.');
  } else {
    let inPdfZip;
    try {
      inPdfZip = new Set(innerPaths(zipEntries(pdfZipFile))
        .filter((f) => !/_PDF_README\.md$/.test(f)));   // the note the builder writes in
    } catch (e) {
      fail(`${PDF_ZIP(ed.tenant)} could not be read: ${e.message}`);
      inPdfZip = null;
    }
    if (inPdfZip) {
      const named = new Set(listed);
      const gone = [...inPdfZip].filter((f) => !named.has(f)).sort();
      const ghost = listed.filter((f) => !inPdfZip.has(f)).sort();
      if (gone.length) {
        fail(`${PDF_ZIP(ed.tenant)} contains ${gone.length} PDF(s) that ${ed.doc} does not ` +
          `name:\n    ${gone.slice(0, 10).join('\n    ')}`);
      }
      if (ghost.length) {
        fail(`${ed.doc} names ${ghost.length} PDF(s) that are NOT in ` +
          `${PDF_ZIP(ed.tenant)}:\n    ${ghost.slice(0, 10).join('\n    ')}`);
      }
      /* AND NO PDF MAY BE IN THE BUILD ARCHIVE TOO. mkstarter's own gate refuses this over
         the list it is about to zip; this refuses it over the two archives as built. */
      const both = listed.filter((f) => rows.some((r) => r.file === f));
      if (both.length) {
        fail(`${both.length} PDF(s) are listed as being in BOTH ${ed.zip} and ` +
          `${PDF_ZIP(ed.tenant)}: ${both.slice(0, 4).join(', ')}`);
      }
      stats.push({ zip: PDF_ZIP(ed.tenant), doc: ed.doc, zipCount: inPdfZip.size,
        docCount: listed.length });
    }
  }
  ed._pdfListed = listed.length;

  /* ── 4 · every description really occurs in its file ──────────────────── */
  let reread = 0;
  let drifted = 0;
  let unreadable = 0;
  rows.forEach((r) => {
    if (/^\*.*\*$/.test(r.said)) return;            // an italicised absence, not a claim
    if (/^keys: |^a list of \d+ entries$/.test(r.said)) return;  // computed from the data
    /* A BINARY FILE'S DESCRIPTION CANNOT BE LOOKED FOR INSIDE IT. The two rendered PDFs of
       these documents carry a stated line — "This document, rendered for printing" — and
       searching a PDF's compressed bytes for that sentence fails for a reason that has
       nothing to do with whether it is true. Counted and reported below rather than
       skipped in silence, because a row this gate cannot verify is a row the reader should
       know it could not verify. */
    if (/\.(png|jpg|jpeg|gif|webp|woff2?|ttf|otf|ico|pdf|zip|mp4|docx|xlsx)$/i.test(r.file)) {
      unreadable++;
      return;
    }
    const abs = path.join(ROOT, r.file);
    /* THE BUILDER'S NOTES ARE STATED, NOT QUOTED — and inside an EXTRACTED archive they
       really are on disk, so "skip it when the file is absent" was not the rule it looked
       like. It passed in the repository, where the notes do not exist, and failed the moment
       the product was extracted and checked from its own copy. The verify step caught this;
       reading the code did not.

       It then happened a SECOND time, the same way, when READ_FIRST.md was added: the
       exemption named the two START_HERE files literally, so the new note was exempt in the
       repository by accident — it is not on disk — and failed on extraction. That is why the
       set is now asked of mkstarter instead of typed. */
    if (BUILDER_NOTES.has(r.file)) return;
    if (!fs.existsSync(abs)) return;                // rule 2 covers a path that is not there
    let body;
    try { body = fs.readFileSync(abs, 'utf8'); } catch { return; }
    reread++;
    /* BOTH SIDES THROUGH THE SAME NORMALISER, OR THE COMPARISON TESTS THE NORMALISER.
       The first version stripped a different punctuation set from each side and then asked
       whether one contained the other. Eight rows failed that were perfectly correct — the
       document said what the file said, and the two had merely been flattened differently.
       A gate that fires on its own asymmetry teaches people to ignore it. */
    const flat = norm(body);
    let want = norm(r.said.replace(/\\\|/g, ''));
    /* A description cut at a length ends mid-word, and half a word is not in the file. */
    if (/…/.test(r.said)) want = want.replace(/\s*\S*$/, '');
    if (want.length > 12 && !flat.includes(want)) {
      drifted++;
      if (drifted <= 6) {
        fail(`${ed.doc} says ${r.file} is "${r.said.slice(0, 70)}…", and that text is no ` +
          `longer in the file. Regenerate — a description that was true when written and ` +
          `is not true now is the exact drift this document exists to make impossible.`);
      }
    }
  });
  if (drifted > 6) fail(`…and ${drifted - 6} more description(s) in ${ed.doc} have drifted`);

  rows.forEach((r) => {
    const at = seenEverywhere.get(r.file) || [];
    at.push(ed.label);
    seenEverywhere.set(r.file, at);
  });

  if (summary) {
    stats.push({});  // spacing marker, ignored below
  }
  ed._rows = rows;
  ed._reread = reread;
  ed._unreadable = unreadable;
});

/* ── 5 · the two documents partition, as the archives do ───────────────────── */
const both = [...seenEverywhere.entries()].filter(([f, at]) => at.length > 1 && f !== 'START_HERE.md');
if (both.length) {
  fail(`${both.length} file(s) are listed in BOTH contents documents. The archives are a ` +
    `partition — every file in exactly one — so the documents cannot both claim one:\n    ` +
    both.slice(0, 8).map(([f]) => f).join('\n    '));
}

/* ── 6 · each document is addressed to its own reader ──────────────────────── */
const { TRADE_WORDS } = require('./checkneutral.js');
const prod = path.join(ROOT, 'MEDHAVA_CONTENTS.md');
if (fs.existsSync(prod)) {
  const text = fs.readFileSync(prod, 'utf8');
  /* Paths are evidence, not prose: the product archive contains no tenant path at all, and
     mkstarter's own gate proves that. What is checked here is the document's WRITING. */
  const prose = text.split('\n').filter((l) => !/^\| `/.test(l)).join('\n');
  const disclosure = (text.match(
    /## Where a file in this archive still names one business[\s\S]*?(?=\n## )/) || [''])[0];
  const found = TRADE_WORDS.filter((wrd) => {
    const re = new RegExp('\\b' + wrd.replace(/ /g, '\\s+'), 'i');
    /* The disclosure section is ALLOWED to name them — that is what it is for. */
    return re.test(prose.replace(disclosure, ''));
  });
  if (found.length) {
    fail(`MEDHAVA_CONTENTS.md names ${found.join(', ')} in its own prose. This document ` +
      `describes the PRODUCT, which ships with no customer inside it.`);
  }

  /* THE EXEMPTION IN checkedition.js RESTS ON THIS CHECK, so this check has to be real.
     That gate lets MEDHAVA_CONTENTS.md carry trade words because the document DISCLOSES
     which rows quote them. If the disclosure stopped matching the rows — a file added, a
     header changed, the section quietly dropped by a future edit — the exemption would
     still stand and would then be covering something nobody had looked at. */
  const rows = docRows(text);
  const quoting = rows.filter((r) => !/^\*.*\*$/.test(r.said) && TRADE_WORDS.some((wrd) =>
    new RegExp('\\b' + wrd.replace(/ /g, '\\s+'), 'i').test(r.said)));
  if (!disclosure) {
    if (quoting.length) {
      fail(`MEDHAVA_CONTENTS.md quotes ${quoting.length} file header(s) that name a trade ` +
        `and no longer carries the section disclosing which. checkedition.js exempts this ` +
        `document ONLY because that section exists — without it the exemption covers ` +
        `something nobody has looked at.`);
    }
  } else {
    const claimed = disclosure.match(/\*\*(\d+) of the \d+ descriptions/);
    if (!claimed) {
      fail('MEDHAVA_CONTENTS.md has the disclosure section but states no count in it, so ' +
        'there is nothing to compare the rows against');
    } else if (Number(claimed[1]) !== quoting.length) {
      fail(`MEDHAVA_CONTENTS.md discloses ${claimed[1]} description(s) quoting a trade and ` +
        `${quoting.length} actually do. Regenerate — the exemption in checkedition.js is ` +
        `written against this number.`);
    }
    const listed = new Set([...disclosure.matchAll(/^- `([^`]+)`$/gm)].map((m) => m[1]));
    const unlisted = quoting.filter((r) => !listed.has(r.file));
    if (unlisted.length) {
      fail(`MEDHAVA_CONTENTS.md quotes a trade word describing ${unlisted[0].file} and does ` +
        `not name it in the disclosure section (${unlisted.length} such file(s))`);
    }
  }
}

/* ── result ────────────────────────────────────────────────────────────────── */
if (failures) {
  console.error(`\ncheckcontents: ${failures} problem(s).`);
  process.exit(1);
}

const rr = EDITIONS.reduce((s, e) => s + (e._reread || 0), 0);
const ur = EDITIONS.reduce((s, e) => s + (e._unreadable || 0), 0);
const listed = EDITIONS.reduce((s, e) => s + ((e._rows || []).length), 0);
const pdfListed = EDITIONS.reduce((s, e) => s + (e._pdfListed || 0), 0);
console.log(`checkcontents: both contents documents are complete and true — ${listed} files ` +
  `across the two build archives and ${pdfListed} across the two PDF archives, ` +
  `${rr} description(s) re-read from the files they describe` +
  (ur ? `, ${ur} on binary files that cannot be searched for text` : '') +
  (skipped ? `, ${skipped} archive(s) NOT built in this checkout and therefore SKIPPED`
    : ', every entry in all four matched against the built archive'));

if (summary) {
  console.log('');
  stats.filter((s) => s.zip).forEach((s) => {
    console.log(`  ${s.zip.padEnd(24)} ${String(s.zipCount).padStart(4)} entries in the zip ` +
      `· ${String(s.docCount).padStart(4)} rows in ${s.doc}`);
  });
  if (skipped) {
    console.log(`  ${skipped} archive(s) were not built here — those comparisons were SKIPPED.`);
  }
  console.log('');
  /* THE REAL BREAKDOWN, NOT A SUBTRACTION. This printed three lines derived by taking one
     count away from another, and the last of them lumped two unlike things together: a PNG
     with no header and a source file that genuinely says nothing about itself are not the
     same finding, and only the second is worth acting on. Grouping by the reason the
     generator actually gave means the numbers add up to the row count in front of you. */
  EDITIONS.forEach((ed) => {
    const rows = ed._rows || [];
    const by = new Map();
    rows.forEach((r) => {
      const k = /^\*(.*)\*$/.test(r.said)
        ? r.said.replace(/^\*|\*$/g, '')
        : 'described from the file itself';
      by.set(k, (by.get(k) || 0) + 1);
    });
    console.log(`  ${ed.doc}  (${rows.length} rows)`);
    [...by.entries()].sort((a, b) => b[1] - a[1])
      .forEach(([k, n]) => console.log(`    ${String(n).padStart(4)}  ${k}`));
    console.log(`    ${String(ed._pdfListed || 0).padStart(4)}  PDF(s) named, shipping in ` +
      PDF_ZIP(ed.tenant));
  });
  console.log('');
}
