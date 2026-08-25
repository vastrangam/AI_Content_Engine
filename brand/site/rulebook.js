'use strict';
/* THE RULEBOOK, RENDERED — one implementation, every document.
 *
 * WHY THIS FILE EXISTS
 * The tenant guide printed "Module 05 · 18 rules" and none of them. That was fixed by writing
 * a renderer inside mktenant.js — and the build guide, the plan, the website and the merged
 * BOS were left carrying 0, 4, 0 and 4 of 285. The fix had been applied to the one document
 * somebody had just complained about.
 *
 * So the renderer lives here, and every generator calls it. A document that wants the rulebook
 * cannot get a different version of it, and there is one place to correct.
 *
 * WHAT A RULE IS
 * Four things. The one that matters is `never` — what the system refuses to do instead —
 * because that is the half a business relies on when nobody is watching, and it is the half
 * that goes missing when somebody summarises.
 */

const RULES = require('./rules.js');
const MODULES = require('./modules.js');

const esc = (s) => String(s == null ? '' : s).replace(/\|/g, '\\|');

/** Every rule, grouped by module, in module order. */
function render(opts) {
  const o = opts || {};
  const out = [];

  if (o.intro !== false) {
    out.push(`**${RULES.length} rules.** Every one states what happens **and what the system will
never do instead**. The second half is the part worth reading — it is what you are relying on when
nobody is looking.`, '');
  }

  MODULES.forEach((m) => {
    const mine = RULES.filter((r) => r.mod === m.n);
    if (!mine.length) return;
    out.push(`${o.heading || '###'} Module ${m.n} · ${esc(m.name)} — ${mine.length} rules`, '');
    mine.forEach((r) => {
      /* A three-row table repeated 285 times is 285 header bars and a lot of rule. A labelled
         list carries the same three facts, reads faster, and lets the eye find `never`. */
      out.push(`**\`${r.id}\` ${esc(r.title)}**`, '');
      out.push(`- **When** ${esc(r.when)}`);
      out.push(`- **Then** ${esc(r.then)}`);
      out.push(`- **Never** ${esc(r.never || '—')}`, '');
    });
  });

  return out.join('\n');
}

/* THE COVERAGE CHECK, SHARED TOO.
   Written once for the same reason as the renderer: it was in mktenant.js only, which is
   exactly why four documents shipped without the rulebook and passed every check they had. */
function missingFrom(doc) {
  const ids = RULES.filter((r) => !doc.includes(r.id));
  const nevers = RULES.filter((r) => r.never && !doc.includes(r.never.slice(0, 40)));
  return { ids, nevers, total: RULES.length };
}

module.exports = { render, missingFrom, RULES };
