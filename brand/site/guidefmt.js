'use strict';
/* ONE FORMATTER, TWO RUNBOOKS.
 *
 * mkguide.js writes the build guide and mktenant.js writes the tenant guide. Both render the
 * same step shape — an action, why, where, a command or a place to click, what you should see,
 * and the condition that makes it done. The second generator could have carried its own copy of
 * this code; then a fix to how a warning renders would land in one document and not the other,
 * and the two would slowly stop looking like the same product.
 *
 * So the shape is formatted here once. Each generator passes its own `sub` — the token
 * substitution is the part that legitimately differs, because the two documents address
 * different readers and name different things.
 *
 * WHY EVERY STEP READS THE SAME WAY
 * A reader learns the shape once, then only has to read the parts that change. That is worth
 * more in a runbook than variety is.
 */

const fence = (code, lang) => '```' + (lang || 'bash') + '\n' + code + '\n```';

function table(t, sub) {
  return [
    '| ' + t.head.map(sub).join(' | ') + ' |',
    '|' + t.head.map(() => '---').join('|') + '|',
    ...t.rows.map((r) => '| ' + r.map(sub).join(' | ') + ' |'),
  ].join('\n');
}

/* `extra` lets a generator inject rendered blocks a plain data file cannot express — the
   company table read out of the fixtures, the channel kinds read out of the schema. Keyed by
   the flag the step sets, so the step still only declares WHAT it wants, never how to draw it. */
function step(s, sub, extra) {
  const out = [`#### ${s.id} · ${sub(s.do)}  \`${s.label}\``, ''];
  if (s.why) out.push(sub(s.why), '');
  if (s.manual) out.push(`**Where:** ${sub(s.manual)}`, '');
  if (s.needs) {
    out.push('**Have ready:**', '');
    s.needs.forEach((n) => out.push(`- ${sub(n)}`));
    out.push('');
  }
  for (const key of Object.keys(extra || {})) {
    if (s[key]) out.push(extra[key], '');
  }
  if (s.table) out.push(table(s.table, sub), '');
  if (s.cmd) out.push(fence(sub(s.cmd)), '');
  if (s.expect) out.push(`**You should see:** ${sub(s.expect)}`, '');
  if (s.check) {
    out.push('**Check it:**', '', fence(sub(s.check)), '');
    if (s.checkExpect) out.push(`**Which should give:** ${sub(s.checkExpect)}`, '');
  }
  if (s.note) out.push(`> ${sub(s.note).replace(/\n/g, '\n> ')}`, '');
  if (s.warn) out.push(`> **Careful.** ${sub(s.warn).replace(/\n/g, '\n> ')}`, '');
  out.push(`**Done when:** ${sub(s.done)}`, '');
  return out.join('\n');
}

function part(p, sub, extra) {
  const out = [`## Part ${p.n} · ${sub(p.title)}`, '', sub(p.lead), ''];
  if (p.table) out.push(table(p.table, sub), '');
  for (const key of Object.keys(extra || {})) {
    if (p[key]) out.push(extra[key], '');
  }
  p.steps.forEach((s) => out.push(step(s, sub, extra)));
  if (p.cost) {
    out.push('### What it costs each month', '', table(p.cost, sub), '', sub(p.cost.note), '');
  }
  return out.join('\n');
}

/* The label legend, for a runbook that has not walked its own steps.
 *
 * WORKS TODAY says the software EXISTS, not that anybody performed the step. The first
 * version said "and was done while writing this", which was true of the build guide — those
 * commands were genuinely run — and false of the tenant guide, whose onboarding steps nobody
 * has walked. A legend shared by two documents can only make the claim that holds for both;
 * the stronger claim belongs in the document that earned it, and the build guide makes it. */
const LABELS = `| Label | Means |
|---|---|
| \`WORKS TODAY\` | The software for this step exists and runs. |
| \`MANUAL\` | No command — a browser, a phone, a form, or somebody else’s website. |
| \`DEMO\` | It runs, but on its own storage rather than the shared data core. |
| \`SPEC\` | Designed and documented. The code does not exist yet. |
| \`NOT BUILT\` | Nothing exists. This step *is* the work. |`;

module.exports = { fence, table, step, part, LABELS };
