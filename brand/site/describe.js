'use strict';
/* WHAT EACH FILE SAYS IT IS — read from the file, never typed about it.
 *
 * mkcontents.js needs one line per file for 598 files across two archives. There are two
 * ways to get that line and only one of them is honest here.
 *
 * THE DISHONEST WAY is to write 598 descriptions by hand. They would be right on the day
 * and wrong within a month, nobody would ever re-read them against the files, and §3 rule
 * 7 of the working agreement calls a typed-from-memory fact fabrication for exactly this
 * reason. It also could not be checked: a gate can prove a description EXISTS, but it
 * cannot prove a sentence somebody invented is true of the code beneath it.
 *
 * THE HONEST WAY is the one this file implements. Nearly every source file in this
 * repository opens with a block comment saying what it is and how to run it — the
 * convention is already there. So the description is READ OUT of the file's own header,
 * and checkcontents.js re-reads the file and fails if the line in the document is not
 * actually in it. That makes the contents document verifiable rather than merely present.
 *
 * WHEN A FILE HAS NO HEADER, THIS SAYS SO. It returns `null` and the generator prints the
 * file's kind and size with the words "no description in the file itself" rather than
 * inventing one. A gap that announces itself can be closed by adding a header to the file,
 * which improves the file. A gap papered over with a guess cannot be found at all.
 *
 * WHAT IS NOT PARSED, AND WHY: images, fonts, PDFs and archives carry no readable header.
 * They get their kind and their size, which is everything a table of contents can honestly
 * say about a PNG.
 */

const fs = require('node:fs');
const path = require('node:path');

/* One comment syntax per language. Anything not here is binary or has no convention. */
const BLOCK = { '.js': true, '.cjs': true, '.css': true, '.sql': true };
const HASH = { '.py': true, '.sh': true, '.yml': true, '.yaml': true, '.conf': true,
  '.service': true, '.example': true, '.txt': true };

/* Files whose first line is their own title — markdown and html.
   .svg IS NOT ONE OF THEM. It was, and the result was rows reading
   `svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"…` — the file's opening
   markup presented as a description of the file. An SVG is a picture; what a contents page
   can honestly say about it is that it is a picture and how big it is. */
const TITLED = { '.md': true, '.html': true };

const KIND = {
  '.js': 'JavaScript', '.cjs': 'JavaScript', '.py': 'Python', '.sql': 'SQL schema',
  '.md': 'document', '.pdf': 'rendered PDF', '.html': 'web page', '.css': 'stylesheet',
  '.json': 'data', '.png': 'image', '.svg': 'vector image', '.woff2': 'font',
  '.yml': 'workflow', '.sh': 'shell script', '.bat': 'Windows script',
  '.conf': 'server configuration', '.service': 'service unit', '.txt': 'text',
  '.example': 'example configuration',
};

/* A description is one sentence. These are the sentences a header opens with that say
   nothing — a banner, a path, a rule of the house — and they are skipped rather than
   printed as though they described the file. */
const USELESS = [
  /^use strict$/i, /^-+$/, /^=+$/, /^\*+$/, /^#+$/,
  /^(eslint|prettier|jshint|global|exported)\b/i,
  /^copyright\b/i,
  /* BOX-DRAWING RULES ARE NOT SENTENCES. Several headers here open with a line of ═ or ─
     before the title. Written as /^=+$/ this missed them, because U+2550 is not "=" — and
     the SQL schema's description came out as a row of box characters followed by its real
     title. Caught by reading the output, not by the regexp looking wrong. */
  /^[\s*/#=─-╿.·-]*$/,
];

const clean = (s) => s
  .replace(/^[\s*/#!<>=─-╿-]+/, '')
  .replace(/[\s*/=─-╿-]+$/, '')
  /* A markdown header's emphasis markers are formatting, not words. Stripping the leading
     "**" alone left "This describes a design.**" with a dangling pair. */
  .replace(/\*\*/g, '')
  .trim();

/* THE FIRST SENTENCE, NOT THE FIRST LINE. Headers here wrap at 95 columns, so the opening
   sentence is usually two or three lines and cutting at the newline would hand the reader
   half a thought. Lines are joined until a full stop, a double-newline, or a reasonable
   ceiling — whichever comes first. */
function firstSentence(lines, limit) {
  const out = [];
  for (const raw of lines) {
    const c = clean(raw);
    if (!c) { if (out.length) break; continue; }
    if (!out.length && USELESS.some((re) => re.test(c))) continue;
    out.push(c);
    const joined = out.join(' ');
    if (/[.!?](\s|$)/.test(c) || joined.length > (limit || 240)) break;
  }
  if (!out.length) return null;
  let s = out.join(' ').replace(/\s+/g, ' ').trim();
  /* Cut at the first sentence end if several arrived on one line. */
  const m = s.match(/^(.{25,}?[.!?])(\s|$)/);
  if (m) s = m[1];
  if (s.length > (limit || 240)) s = s.slice(0, (limit || 240)).replace(/\s+\S*$/, '') + '…';
  return s.length < 12 ? null : s;
}

/* ── the one exported question: what does this file say it is? ─────────────── */
/**
 * @param {string} root  repository root
 * @param {string} rel   repo-relative path
 * @returns {{kind:string, bytes:number, said:(string|null), why:(string|null)}}
 *   `said` is text that REALLY OCCURS in the file, so a checker can re-read the file and
 *   confirm it. `why` explains a null rather than leaving the reader guessing.
 */
function describe(root, rel) {
  const abs = path.join(root, rel);
  const ext = path.extname(rel).toLowerCase();
  const kind = KIND[ext] || (ext ? ext.slice(1) : 'file');
  let bytes = 0;
  try { bytes = fs.statSync(abs).size; } catch { return { kind, bytes: 0, said: null, why: 'not on disk' }; }

  if (/\.(png|jpg|jpeg|gif|webp|woff2?|ttf|otf|ico|pdf|zip|mp4|docx|xlsx)$/i.test(rel)) {
    return { kind, bytes, said: null, why: 'binary — carries no readable header' };
  }
  if (/\.svg$/i.test(rel)) {
    const t = (fs.readFileSync(abs, 'utf8').match(/<title>([^<]+)<\/title>/i) || [])[1];
    return t
      ? { kind, bytes, said: clean(t), why: null }
      : { kind, bytes, said: null, why: 'a drawing — no title element to read' };
  }

  let text;
  try { text = fs.readFileSync(abs, 'utf8'); } catch {
    return { kind, bytes, said: null, why: 'not readable as text' };
  }
  const lines = text.split('\n').slice(0, 40);

  if (TITLED[ext]) {
    /* A markdown file's first heading is its own title; an HTML file's <title> is too. */
    const h = text.match(/^#{1,3}\s+(.+)$/m);
    if (h && ext === '.md') {
      const rest = text.split('\n').slice(text.split('\n').indexOf(h[0]) + 1);
      const body = firstSentence(rest, 200);
      return { kind, bytes, said: body || clean(h[1]), why: null };
    }
    const t = text.match(/<title>([^<]+)<\/title>/i);
    if (t) return { kind, bytes, said: clean(t[1]), why: null };
    /* AN HTML FRAGMENT IS NOT A DOCUMENT AND HAS NOTHING TO QUOTE. brand/site/top.html and
       bottom.html are the page's header and footer, pasted into the built site — no
       <title>, no heading, just markup. The first draft printed their opening tags as a
       description, which is the file's contents rather than a statement about it. */
    const h1 = text.match(/<h1[^>]*>([^<]{4,})<\/h1>/i);
    if (h1) return { kind, bytes, said: clean(h1[1]), why: null };
    const cm = text.match(/<!--([\s\S]{10,400}?)-->/);
    const s = cm && text.indexOf(cm[0]) < 400 ? firstSentence(cm[1].split('\n'), 200) : null;
    return { kind, bytes, said: s, why: s ? null : 'an HTML fragment with no title of its own' };
  }

  if (ext === '.json') {
    /* JSON cannot carry a comment. Say what its top-level shape is — true, checkable, and
       the only thing a table of contents can honestly claim about a data file. */
    try {
      const d = JSON.parse(text);
      const keys = Array.isArray(d) ? null : Object.keys(d);
      const said = Array.isArray(d)
        ? `a list of ${d.length} entries`
        : `keys: ${keys.slice(0, 8).join(', ')}${keys.length > 8 ? ` (+${keys.length - 8} more)` : ''}`;
      return { kind, bytes, said, why: null, computed: true };
    } catch {
      return { kind, bytes, said: null, why: 'not valid JSON' };
    }
  }

  if (BLOCK[ext]) {
    const m = text.match(/\/\*([\s\S]*?)\*\//);
    const head = m && text.indexOf(m[0]) < 200 ? m[1].split('\n') : null;
    /* CODE IS NOT A DESCRIPTION OF CODE. Falling back to the file's first lines when there
       is no header printed rows like
         `(function(){ var K=typeof Medhava!=='undefined'?Medhava:{}; var H=K.H,money=…`
       which is the file's contents, not a statement about it — and it is worse than
       nothing, because it fills the column and hides that the file says nothing. Only a
       real comment counts; otherwise this reports the absence. */
    const slashes = [];
    for (const l of text.split('\n').slice(0, 12)) {
      if (/^\s*\/\//.test(l)) slashes.push(l);
      else if (slashes.length) break;
      else if (l.trim() && !/^['"]use strict/.test(l.trim())) break;
    }
    const s = firstSentence(head || slashes);
    return { kind, bytes, said: s, why: s ? null : 'no description in the file itself' };
  }

  /* PYTHON SAYS WHAT IT IS IN A DOCSTRING, NOT IN A COMMENT. The first pass read only
     `#` lines and reported "no description in the file itself" for all fifteen files of
     the payroll engine — every one of which opens with a triple-quoted module docstring.
     The files were fine; the reader was looking in the wrong place. */
  if (ext === '.py') {
    const m = text.match(/^\s*(?:#![^\n]*\n)?(?:#[^\n]*\n|\s)*("""|''')([\s\S]*?)\1/);
    if (m) {
      const s = firstSentence(m[2].split('\n'));
      if (s) return { kind, bytes, said: s, why: null };
    }
    const hash = lines.filter((l) => /^\s*#/.test(l) && !/^\s*#!/.test(l));
    const s = firstSentence(hash);
    return { kind, bytes, said: s, why: s ? null : 'no description in the file itself' };
  }

  if (HASH[ext] || !ext) {
    const head = [];
    for (const l of lines) {
      if (/^\s*#!/.test(l)) continue;
      if (/^\s*#/.test(l)) head.push(l);
      else if (head.length) break;
    }
    const s = firstSentence(head.length ? head : []);
    return { kind, bytes, said: s, why: s ? null : 'no description in the file itself' };
  }

  const s = firstSentence(lines);
  return { kind, bytes, said: s, why: s ? null : 'no description in the file itself' };
}

module.exports = { describe, KIND };
