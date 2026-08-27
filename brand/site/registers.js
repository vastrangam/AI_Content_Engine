'use strict';
/* EVERY REGISTER, MEASURED THE SAME WAY — and rendered from one implementation.
 *
 * WHY THIS FILE EXISTS
 * The rulebook shipped in one document and was missing from four, because the gate that
 * checked it lived inside the generator for the one document somebody had complained about.
 * That was fixed. Then the same measurement, pointed at the other registers, found the same
 * shape of hole again:
 *
 *     MEDHAVA_PLAN_OF_ACTION.md    0 of 19 stack layers · 0 of 18 changeable things
 *                                  27 technical terms used and never explained
 *     Medhava_BOS_Final.md          2 terms used and never explained
 *                                  (that file is Medhava_BOS.md now — the name is left as it was
 *                                  found, because a record of a defect that renames itself to
 *                                  match today stops being a record)
 *     three of four documents       5 of 113 app names
 *
 * The rulebook gate could not see any of that, because a gate only checks what somebody
 * thought to ask it. So the registers are listed HERE, in one place, and `checkcoverage.js`
 * refuses a document that has no decision recorded for one of them. Adding a twentieth
 * register forces that decision on every document rather than passing silently.
 *
 * A register is not a count. It is the list itself, and a document either carries it or
 * carries a written reason it does not.
 */

const RULES = require('./rules.js');
const MODULES = require('./modules.js');
const { LAYERS } = require('./stack.js');
const DYN = require('./dynamic.js');
const WORDS = require('./plainwords.js');

const esc = (s) => String(s == null ? '' : s).replace(/\|/g, '\\|');
const flat = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ');

/* App names are nested inside modules. Read them, never retype them. */
const APPS = [];
MODULES.forEach((m) => (m.apps || []).forEach((a) => APPS.push(Array.isArray(a) ? a[0] : (a.name || String(a)))));

/* ── the registers ────────────────────────────────────────────────────────────
   Each names its list, and how to tell whether a document carries an item. The
   `missing` function returns items, not a number — a number tells you how much you
   are not being shown and nothing about what. */
const REGISTERS = {
  rules: {
    label: 'rules',
    total: RULES.length,
    source: 'brand/site/rules.js',
    missing: (doc) => RULES.filter((r) => !doc.includes(r.id)).map((r) => r.id),
    /* A rule without its `never` is half a rule, and the half that goes missing when
       somebody summarises is always the same half. */
    extra: (doc) => RULES.filter((r) => r.never && !doc.includes(r.never.slice(0, 40)))
      .map((r) => r.id + ' (no `never`)'),
  },
  modules: {
    label: 'modules',
    total: MODULES.length,
    source: 'brand/site/modules.js',
    missing: (doc) => MODULES.filter((m) => !doc.includes(m.name)).map((m) => m.name),
  },
  apps: {
    label: 'apps',
    total: APPS.length,
    source: 'brand/site/modules.js',
    missing: (doc) => APPS.filter((a) => !doc.includes(a)),
  },
  stack: {
    label: 'stack layers',
    total: LAYERS.length,
    source: 'brand/site/stack.js',
    missing: (doc) => LAYERS.filter((l) => !doc.includes(l.layer)).map((l) => l.layer),
    /* Rule 1 is not "name a tool", it is "name what replaces it". A layer printed without
       its alternatives has stated the dependency and omitted the escape from it. */
    extra: (doc) => LAYERS.filter((l) => (l.swaps || []).some((s) => !doc.includes(flat(s))))
      .map((l) => l.layer + ' (alternatives not listed)'),
  },
  dynamic: {
    label: 'changeable things',
    total: DYN.ENTRIES.length + DYN.IMMUTABLE.length,
    source: 'brand/site/dynamic.js',
    missing: (doc) => DYN.ENTRIES.filter((e) => !doc.includes(flat(e.what))).map((e) => e.what)
      .concat(DYN.IMMUTABLE.filter((m) => !doc.includes(flat(m.what))).map((m) => m.what)),
  },
  glossary: {
    label: 'technical terms',
    total: WORDS.WORDS.length,
    source: 'brand/site/plainwords.js',
    /* The only register measured in the other direction, and deliberately. A document
       does not owe the reader all 39 words — it owes an explanation of every word it
       actually uses. Requiring all of them would push unused jargon into a page. */
    direction: 'used-but-unexplained',
    missing: (doc, opts) => WORDS.checkwords(doc, { skip: (opts && opts.skip) || [] }),
  },
};

/** Measure one document against every register. Returns a decision-free report. */
function audit(doc, opts) {
  const o = opts || {};
  const out = {};
  for (const [key, reg] of Object.entries(REGISTERS)) {
    const missing = reg.missing(doc, o[key] || {});
    const extra = reg.extra ? reg.extra(doc) : [];
    out[key] = {
      label: reg.label,
      total: reg.total,
      direction: reg.direction || 'must-appear',
      missing,
      extra,
      ok: missing.length === 0 && extra.length === 0,
    };
  }
  return out;
}

/* ── renderers ───────────────────────────────────────────────────────────────
   One implementation each. mkguide.js and mktenant.js had grown a private copy of the
   changeable-things table between them; two copies is how two documents start disagreeing
   about the same fact. */

/** Rule 1 in full: every layer, what it is built on, what replaces it, what the code talks to. */
function stackSection(opts) {
  const o = opts || {};
  const h = o.heading || '###';
  const nswap = LAYERS.reduce((s, l) => s + (l.swaps || []).length, 0);
  const out = [];

  if (o.intro !== false) {
    out.push(`**${LAYERS.length} layers · ${nswap} named replacements.** No capability here depends
on one company staying in business, keeping its prices or keeping its terms. Each layer names what it
is built on today, what can take its place, and the one interface the rest of the code talks to —
that last part is what makes a swap a settings change instead of a rewrite.`, '');
    out.push(`A check refuses any layer with fewer than two alternatives, a vague alternative
("something else", "any other tool") or no interface, so this cannot rot into a paragraph nobody
kept.`, '');
    out.push('');
  }

  LAYERS.forEach((l) => {
    out.push(`${h} ${esc(l.layer)} — ${esc(l.def)}`, '');
    out.push(`**What it does.** ${flat(l.does)}`, '');
    out.push(`**Why this one.** ${flat(l.why)}`, '');
    out.push(`**What can replace it**`, '');
    (l.swaps || []).forEach((s) => out.push(`- ${flat(s)}`));
    out.push('');
    out.push(`**The rest of the code only ever talks to** \`${l.iface}\` — so changing the line above
changes one file, not the application.`, '');
    if (l.cost) out.push(`**What the move actually costs.** ${flat(l.cost)}`, '');
  });

  return out.join('\n');
}

/** Rule 2 in full: what can be changed, by whom, and what happens to records already made. */
function dynamicSection(opts) {
  const o = opts || {};
  const h = o.heading || '###';
  const fmt = o.fmt;              /* guidefmt-style table renderer, when the caller has one */
  const sub = o.sub || ((s) => s);
  const out = [];

  if (o.intro !== false) {
    out.push(`**${DYN.ENTRIES.length} things you can change, across ${DYN.areas().length} areas —
and ${DYN.IMMUTABLE.length} that can never be switched off.** Everything below is changed in the app,
by you, taking effect the same minute. None of it needs a developer, a release or a phone call.`, '');
    out.push(`The column that matters most is the last one: **what happens to records already made.**
A change carries the date it starts from and is added rather than written over, so a supervisor can
leave on Tuesday and a replacement start on Wednesday — and last month’s payroll, already paid, does
not move by a rupee. *Purana record mitta nahin; naye date se naya rule lagta hai.*`, '');
    out.push('');
  }

  const table = (head, rows) => (fmt
    ? fmt.table({ head, rows }, sub)
    : [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`,
      ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n'));

  DYN.areas().forEach((area) => {
    out.push(`${h} ${esc(area)}`, '');
    out.push(table(['What changes', 'Who can', 'Takes effect', 'Records already made'],
      DYN.ENTRIES.filter((e) => e.area === area).map((e) => [
        esc(flat(e.what)), esc(e.who), esc(flat(e.when)), esc(flat(e.past)),
      ])), '');
  });

  out.push(`${h} What can never be switched off`, '');
  out.push(`Short on purpose. Every line is something a bank, an auditor, a customer or an employee
relies on, and a setting that could remove it would remove their protection too.`, '');
  out.push(table(['Never changeable', 'Why'],
    DYN.IMMUTABLE.map((m) => [esc(flat(m.what)), esc(flat(m.why))])), '');

  return out.join('\n');
}

/* Which glossary terms a text actually uses — carried to a fixed point.
   One pass is not enough. A definition is itself prose: the entry for "job" explains it as work
   taken off a *queue*, so adding "job" to a page makes "queue" a word that page now uses and
   never explains. Two passes could introduce a third. So this repeats until nothing new
   appears, which for 39 terms settles in a handful of rounds. */
const uses = (text, term) => new RegExp(
  '\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 's?\\b', 'i').test(text);

function usedWords(text) {
  const chosen = new Map();
  let frontier = WORDS.WORDS.filter((w) => uses(text, w.term));
  while (frontier.length) {
    frontier.forEach((w) => chosen.set(w.term, w));
    const defs = frontier.map((w) => `${w.plain} ${w.hinglish || ''}`).join(' ');
    frontier = WORDS.WORDS.filter((w) => !chosen.has(w.term) && uses(defs, w.term));
  }
  /* Rendered in the source order, not discovery order — the glossary is a reference, and a
     reader looking a word up wants the same order every time. */
  return WORDS.WORDS.filter((w) => chosen.has(w.term));
}

/** Every technical word, in plain language, with an everyday comparison.
 *
 *  `only: <text>` renders just the words that text actually uses. A short document does not owe
 *  the reader all 39 — it owes an explanation of every word it used. Padding a landing page with
 *  definitions of terms it never mentions would make the coverage number look better and the page
 *  worse, which is the exact trade this whole set of gates exists to refuse. */
function glossarySection(opts) {
  const o = opts || {};
  const h = o.heading || '###';
  const out = [];
  const words = o.only ? usedWords(o.only) : WORDS.WORDS;
  if (!words.length) return '';
  if (o.intro !== false) {
    out.push(`**${words.length} words.** Every technical term this document uses, in plain
language, with an everyday comparison. Nothing here assumes you already know any of them.`, '');
    out.push('');
  }
  words.forEach((w) => {
    out.push(`${h} ${esc(w.term)}`, '');
    out.push(flat(w.plain), '');
    if (w.hinglish) out.push(`*${flat(w.hinglish)}*`, '');
  });
  return out.join('\n');
}

/** Every app, under its module — the thing being built, named. */
function appsSection(opts) {
  const o = opts || {};
  const h = o.heading || '###';
  const out = [];
  if (o.intro !== false) {
    out.push(`**${MODULES.length} modules · ${APPS.length} apps.** The whole of what is being built,
named. A module is a part of the business; an app is one screen-and-its-work inside it. Any of them
can be switched off for a business that does not need it — see the changeable things.`, '');
    out.push('');
  }
  MODULES.forEach((m) => {
    const apps = (m.apps || []).map((a) => (Array.isArray(a) ? a : [a.name || String(a), '', a.blurb || '']));
    out.push(`${h} Module ${m.n} · ${esc(m.name)} — ${apps.length} apps`, '');
    apps.forEach(([name, , blurb]) => {
      out.push(`- **${esc(name)}** — ${esc(flat(blurb)) || '—'}`);
    });
    out.push('');
  });
  return out.join('\n');
}

module.exports = {
  REGISTERS, audit,
  stackSection, dynamicSection, glossarySection, appsSection,
  APPS, LAYERS, MODULES, RULES,
};
