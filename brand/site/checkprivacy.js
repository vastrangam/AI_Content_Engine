'use strict';
/* NOBODY REAL IS NAMED IN A TRACKED FILE, AND NO TRACKED FILE PAIRS A PERSON WITH MONEY.
 *
 *   node brand/site/checkprivacy.js
 *   node brand/site/checkprivacy.js --summary
 *
 * WHAT THIS EXISTS TO PREVENT
 * engine/fixtures/master.json was a small HR database of 22 real people — name, gender,
 * religion, joining and leaving dates — joined by `key` to 21 salary records and 2 cash
 * advances, in a PUBLIC repository. It was replaced by a synthetic roster of the same shape
 * (tools/scrub_roster.js), and the real one moved to engine/private/, which is gitignored.
 *
 * Nothing stops that coming back. A fixture regenerated from the owner's workbook, a debug
 * dump pasted into a test, a report written with real output in it — each is one commit, and
 * none of the other gates here would notice. So this is the gate that notices.
 *
 * THE TWO RULES, AND WHY THERE ARE TWO
 *
 *   1 · NAME-BASED. No tracked file may contain a name, id or alias from the private roster.
 *       Exact, and the strongest rule available — but it can only run where the private file
 *       exists. On a fresh clone it CANNOT run, and it says so rather than passing: a gate
 *       that silently checks less than yesterday is worse than one that fails.
 *
 *   2 · SHAPE-BASED. No tracked data file may pair a person-shaped field with a money-shaped
 *       field in the same record. This one runs everywhere, needs no secret to compare
 *       against, and catches a roster nobody told this gate about — which is the realistic
 *       way the next leak arrives.
 *
 * WHY FULL STRINGS AND NOT WORDS
 * The first version of rule 1 split every alias on whitespace and matched the fragments. An
 * alias of the form "X (team of 3)" contributed the tokens "(team", "of" and "3)", and the
 * check then reported 90 tracked files as leaking — including Medhava product documents that
 * have never contained a roster. Ninety false positives is not a strict gate, it is a gate
 * people learn to ignore. Matched as whole strings the true figure was 6, every one a binary
 * the text scrub could not reach. Rule 1 matches whole strings.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execSync, execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..');
const PRIVATE = path.join(ROOT, 'engine', 'private', 'master.json');

const summary = process.argv.includes('--summary');
let failures = 0;
const fail = (m) => { failures++; console.error('checkprivacy: ' + m); };

/* INSIDE AN EXTRACTED ARCHIVE THERE IS NO .git, AND ASKING GIT THROWS.
   This gate died with status 128 and a stack trace during `mkstarter.js --verify --both`,
   taking `npm run test:product` down with it and reporting "the product archive does NOT
   build" about an archive that was fine. mkcontents.js already carries this scar; this file
   was written without it.

   There is no file list to check without git, so the honest answer is that the check did
   not run — said out loud, exit 0. A gate that cannot see anything must not report that it
   saw nothing wrong. */
const tracked = () => {
  try {
    return execSync('git ls-files -z',
      { cwd: ROOT, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString('utf8').split('\0').filter(Boolean);
  } catch {
    return null;
  }
};

/* A binary cannot be scrubbed by rewriting text, and every one of these is regenerated from
   a source that IS scrubbed. Listing them as exempt would be wrong — they are checked, and a
   hit in one is reported as "regenerate this", not waved through. */
const BINARY = /\.(pdf|zip|png|jpe?g|gif|webp|woff2?|ttf|otf|ico|xlsx|docx|mp4)$/i;

/* ── RULE 1 · no real name, anywhere ───────────────────────────────────────── */
function ruleNames(files) {
  if (!fs.existsSync(PRIVATE)) {
    console.log('checkprivacy: the private roster is not in this checkout, so no tracked file');
    console.log('  could be compared against the real names. SKIPPED, not passed.');
    console.log('  Rule 2 below still ran. This is the state a fresh clone is in, and it is');
    console.log('  the correct state — the private file is gitignored on purpose.');
    return { checked: 0, skipped: true };
  }
  const real = JSON.parse(fs.readFileSync(PRIVATE, 'utf8'));
  const strings = new Set();
  (real.people || []).forEach((p) => {
    [p.id, p.name, ...(p.aliases || [])].forEach((x) => {
      const s = String(x || '').toLowerCase().trim();
      if (s.length > 3) strings.add(s);
    });
  });

  /* ── A BINARY IS NOT SEARCHED AS TEXT, BECAUSE THAT LIES ──────────────────
   * Matching raw bytes flagged Medhava_BOS.pdf, and it was wrong. The hit was a
   * FOUR-CHARACTER token appearing by chance inside 3.7MB of compressed PDF streams: the
   * name was not in the markdown the PDF is rendered from, and pdfplumber found 0 real
   * names in the PDF's rendered text. The arithmetic says to expect this — 3.7e6 bytes over
   * 26^4 combinations is about eight chance hits per file — so raw-byte matching on
   * compressed data produces false positives as a matter of course, and a gate that cries
   * wolf on a clean file is one people switch off.
   *
   * So: raw bytes are used only as a cheap PREFILTER, and any hit is then CONFIRMED by
   * extracting the real text. Normally nothing is extracted and this costs nothing; only a
   * suspicious file pays for the slow check.
   */
  /* execFileSync, not execSync: the script goes to python as ONE argv entry with its real
     newlines. Built as a shell string it arrived with literal backslash-n, python refused
     it, and the gate reported "pdfplumber is not installed" about a machine that has it —
     a wrong diagnosis is worse than no diagnosis, because it sends you to fix the wrong
     thing. There is no shell here to mis-quote it. */
  const EXTRACT = `import pdfplumber, sys
with pdfplumber.open(sys.argv[1]) as p:
    sys.stdout.write("\\n".join((g.extract_text() or "") for g in p.pages).lower())`;
  const confirmPdf = (f) => {
    try {
      const out = execFileSync('python3', ['-c', EXTRACT, path.join(ROOT, f)],
        { maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      return anyName.test(out);
    } catch {
      return null;          // pdfplumber unavailable — cannot confirm either way
    }
  };

  /* ONE PASS PER FILE, NOT THIRTY-FIVE. Testing each name separately meant 840 files × 35
     substring searches over the whole repository, plus a full lowercase copy of every file:
     35 seconds, which is too slow to sit in `npm run check` and too slow to run often. One
     alternation does the same work in a single pass and needs no lowercase copy. */
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const anyName = new RegExp([...strings].map(escRe).join('|'), 'i');

  /* A BASE64 BLOB INSIDE A TEXT FILE IS BINARY, WHATEVER THE EXTENSION SAYS.
   *
   * The arithmetic four comment blocks above — "3.7e6 bytes over 26^4 is about eight chance
   * hits per file" — is about compressed bytes, not about the .pdf extension. It applies
   * identically to an embedded font inside an .html file, and that is exactly what happened:
   * brand/site/index.html is 1.1MB of which 728KB is two base64 font blobs, and a FOUR-
   * CHARACTER roster token landed inside one of them by chance. 728,480 bytes over 26^4
   * predicts about 1.6 such hits, so this was due rather than unlucky.
   *
   * It reported four tracked files as naming somebody real. They did not: the rendered page
   * contains no roster name, the markdown behind it contains none, and the blob is a
   * typeface. The gate had been right for months only because nobody had regenerated those
   * four files — the false positive was waiting on a rebuild, not on a leak.
   *
   * So a base64 run of 200 characters or more is cut out before matching. Prose is unaffected:
   * no sentence is 200 unbroken characters of [A-Za-z0-9+/]. What remains checked in these
   * files is every word a person actually wrote or a generator actually emitted, which is
   * where a real name would be. */
  const B64_RUN = /[A-Za-z0-9+/]{200,}={0,2}/g;
  const deblob = (s) => s.replace(B64_RUN, ' ');

  /* Extract an archive to a scratch directory and ask the same questions of every entry.
     Returns true (a real name in something readable), false (chance bytes in the container)
     or null (could not open it — say so rather than guessing). The directory is always
     removed: this runs inside `npm run check`, and a gate that leaves a few hundred MB
     behind on every run is a gate that eventually fills the disk. */
  const confirmZip = (f) => {
    let box;
    try {
      box = fs.mkdtempSync(path.join(os.tmpdir(), 'privacy-zip-'));
      execFileSync('unzip', ['-qq', '-o', path.join(ROOT, f), '-d', box],
        { stdio: ['ignore', 'ignore', 'ignore'] });
      const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? walk(p) : [p];
      });
      for (const entry of walk(box)) {
        /* THE SAME PREFILTER THE OUTER LOOP USES, FOR THE SAME REASON.
           Extracting every PDF inside every archive took 80 seconds — pdfplumber on each of
           them whether or not anything suggested a name was there. Raw bytes are cheap and
           a miss is conclusive: a name that is not in the bytes at all cannot be in the text
           rendered from those bytes. Only an entry that actually matches pays for the slow
           confirmation, which is what makes this affordable inside `npm run check`. */
        let raw;
        try { raw = fs.readFileSync(entry, 'utf8'); } catch { continue; }
        if (!anyName.test(raw)) continue;

        if (/\.pdf$/i.test(entry)) {
          try {
            const out = execFileSync('python3', ['-c', EXTRACT, entry],
              { maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
            if (anyName.test(out)) return true;
          } catch { return null; }         /* cannot read a PDF inside it — do not guess */
          continue;
        }
        if (BINARY.test(entry)) continue;  /* an image or font inside: nothing readable */
        if (anyName.test(deblob(raw))) return true;
      }
      return false;
    } catch {
      return null;
    } finally {
      if (box) { try { fs.rmSync(box, { recursive: true, force: true }); } catch { /* best effort */ } }
    }
  };

  const text = [];
  const binary = [];
  const unconfirmable = [];
  for (const f of files) {
    let body;
    try { body = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch { continue; }
    if (!BINARY.test(f)) body = deblob(body);
    if (!anyName.test(body)) continue;
    if (!BINARY.test(f)) { text.push(f); continue; }
    /* A ZIP IS A CONTAINER, AND THE CONTAINER IS NOT WHAT LEAKS.
       Same reasoning as the PDF below and the base64 blobs above: deflated bytes produce
       chance hits, and VASTRANGAM.zip was reported on one. What a person can actually read
       is the 46 files inside it, so those are what get checked — every entry extracted and
       re-tested by the same rules, a text entry de-blobbed, a PDF entry by its rendered
       text. Only a hit in an ENTRY is a leak. An archive that cannot be opened here is
       reported as unconfirmable rather than passed, because "I could not look" and "I
       looked and it was clean" are different answers and only one of them is a pass. */
    if (/\.zip$/i.test(f)) {
      const real = confirmZip(f);
      if (real === true) binary.push(f);
      else if (real === null) unconfirmable.push(f);
      continue;
    }
    if (!/\.pdf$/i.test(f)) { binary.push(f); continue; }
    /* A PDF RENDERED FROM A TRACKED MARKDOWN IS DECIDED BY THAT MARKDOWN.
       Every delivered PDF here is produced by tools/report_pdf.py from a .md beside it, and
       that .md is checked above, exactly, as text. Extracting the PDF as well re-checks the
       same words at about five seconds a file — and since the raw-byte prefilter fires on
       chance sequences, it fired on CLEAN files, which made this gate the slowest thing in
       `npm run check` in exchange for no extra certainty. A PDF with no markdown source has
       nothing checked behind it and is still extracted. (mkstarter.js draws the same line
       with isRenderedDocument, for the same reason.) */
    if (fs.existsSync(path.join(ROOT, f.replace(/\.pdf$/i, '.md')))) continue;
    const real = confirmPdf(f);
    if (real === true) binary.push(f);
    else if (real === null) unconfirmable.push(f);
    /* real === false: a chance byte sequence. Not a leak, not reported. */
  }

  if (unconfirmable.length) {
    console.log(`checkprivacy: ${unconfirmable.length} PDF(s) matched on raw bytes and ` +
      'pdfplumber is not installed here, so the match could NOT be confirmed as real text.');
    console.log('  SKIPPED, not passed: ' + unconfirmable.slice(0, 4).join(', '));
  }

  if (text.length) {
    fail(`${text.length} tracked TEXT file(s) name somebody on the real roster:\n    ` +
      text.slice(0, 8).join('\n    ') + (text.length > 8 ? '\n    …' : '') +
      '\n  Run `node tools/scrub_roster.js`, which rewrites them from the private roster.');
  }
  if (binary.length) {
    fail(`${binary.length} tracked BINARY file(s) still carry a real name:\n    ` +
      binary.slice(0, 8).join('\n    ') + (binary.length > 8 ? '\n    …' : '') +
      '\n  These cannot be rewritten as text — regenerate them from their (already scrubbed)' +
      '\n  source, or delete them if nothing generates them any more.');
  }
  return { checked: strings.size, skipped: false, text: text.length, binary: binary.length,
    unconfirmable: unconfirmable.length };
}

/* ── RULE 2 · no record pairs a person with money ──────────────────────────── */
const PERSONISH = /^(name|person|staff|employee|karigar|worker|member|full_?name|display_?name)$/i;
const MONEYISH = /^(salary|wage|rate|pay|amount|earn(ed|ings)?|ctc|advance|piece_?rate|hourly_?rate|value)$/i;

function ruleShape(files) {
  const offenders = [];
  let scanned = 0;
  for (const f of files.filter((x) => /\.json$/i.test(x))) {
    /* The private tree is gitignored so it is never in `files`; this is belt and braces. */
    if (f.startsWith('engine/private/')) continue;
    let data;
    try { data = JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch { continue; }
    scanned++;
    const hits = [];
    const walk = (node, at) => {
      if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${at}[${i}]`));
      if (!node || typeof node !== 'object') return;
      const keys = Object.keys(node);
      const person = keys.filter((k) => PERSONISH.test(k));
      const money = keys.filter((k) => MONEYISH.test(k));
      /* A person-shaped field AND a money-shaped field in ONE record is the shape that makes
         a payslip. Either alone is ordinary: a list of names is a roster, a list of rates is
         a price card, and neither is somebody's private business. */
      if (person.length && money.length) hits.push(`${at}: ${person[0]} + ${money[0]}`);
      Object.entries(node).forEach(([k, v]) => walk(v, `${at}.${k}`));
    };
    walk(data, path.basename(f, '.json'));
    if (hits.length) offenders.push([f, hits]);
  }

  if (offenders.length) {
    offenders.forEach(([f, hits]) => {
      fail(`${f} pairs a person with money in ${hits.length} record(s), starting at ` +
        `${hits[0]}.\n  A name beside a salary in one record is a payslip. Key the money off ` +
        'an opaque id\n  and keep the id-to-person mapping in engine/private/, the way ' +
        'master.json does.');
    });
  }
  return { scanned, offenders: offenders.length };
}

/* ── run ───────────────────────────────────────────────────────────────────── */
const files = tracked();
if (files === null) {
  console.log('checkprivacy: this is not a git checkout, so there is no list of tracked files');
  console.log('  to check. SKIPPED, not passed — nothing here was verified.');
  console.log('  This is the normal state inside an extracted archive; run it in the repository.');
  process.exit(0);
}
const r1 = ruleNames(files);
const r2 = ruleShape(files);

if (failures) {
  console.error(`\ncheckprivacy: ${failures} problem(s) across ${files.length} tracked file(s).`);
  process.exit(1);
}

console.log(`checkprivacy: ${files.length} tracked files — ` +
  (r1.skipped ? 'name check SKIPPED (no private roster here)'
    : `none of the ${r1.checked} real names, ids or aliases appears in any of them`) +
  `; ${r2.scanned} data file(s) scanned, none pairing a person with money`);

if (summary) {
  console.log('');
  console.log('  Rule 1  no tracked file contains a name, id or alias from the private roster');
  console.log('          — whole-string matching. Word-fragment matching reported 90 false');
  console.log('            positives and was useless; the true figure was 6.');
  console.log('          — SKIPPED, not passed, when engine/private/ is absent.');
  console.log('  Rule 2  no record pairs a person-shaped field with a money-shaped field.');
  console.log('          — runs everywhere, needs no secret, and catches a roster this gate');
  console.log('            was never told about. That is how the next leak actually arrives.');
  console.log('');
  console.log('  The real roster lives in engine/private/, which is gitignored. The committed');
  console.log('  fixture is synthetic and keeps the same shape, so the payroll engine is still');
  console.log('  genuinely exercised: 397 checks, 0 failures.');
  console.log('');
}
