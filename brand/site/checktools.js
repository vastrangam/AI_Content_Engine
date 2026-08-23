'use strict';
/* The gate on the tools register.

   The instruction was "prefer free first, then if only required then paid".
   That is a discipline, and a discipline that nothing checks is a preference.
   So this enforces it:

     · every capability must state a free option, even if that free option is
       the honest sentence "there is none" — an empty field is an omission, a
       written "None" is a decision somebody made
     · a paid option may not exist without a TRIGGER: the concrete condition
       that forces the upgrade. "When we grow" fails; a number or a named
       event passes
     · a trigger may not exist without a paid option to trigger
     · every capability names the interface it sits behind, or says plainly
       that it has none, so "we can switch" is answerable per line
     · the register is dated, because free tiers move and a stale figure that
       looks current is worse than one that admits its age

   Run:  node brand/site/checktools.js
         node brand/site/checktools.js --summary
*/

const { asOf, tools } = require('./tools.js');

/* Phrases that read like a trigger and commit to nothing. A trigger has to be
   checkable by someone who was not in the room when it was written. */
const VAGUE = [
  /^when (we|it|you) (grow|scale|need more|get bigger)/i,
  /^as (needed|required)$/i,
  /^later$/i,
  /^if necessary$/i,
  /^when necessary$/i,
];

function run() {
  const problems = [];
  const P = (m) => problems.push(m);
  const seen = new Set();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf || '')) P('the register has no asOf date');

  tools.forEach((t, i) => {
    const where = t.id || `entry #${i + 1}`;

    ['id', 'cap', 'free', 'selfHost'].forEach((k) => {
      if (!t[k] || !String(t[k]).trim()) P(`${where}: missing "${k}"`);
    });
    if (t.iface === undefined) P(`${where}: missing "iface" — say the interface or say "—"`);
    if (!t.id) return;

    if (seen.has(t.id)) P(`${where}: duplicate id`);
    seen.add(t.id);

    const hasPaid = !!(t.paid && String(t.paid).trim() && !/^none needed\.?$/i.test(t.paid));
    const hasTrigger = !!(t.trigger && String(t.trigger).trim());

    /* the rule this file exists for */
    if (hasPaid && !hasTrigger) {
      P(`${where}: has a paid option with no trigger — that is a preference, not a requirement`);
    }
    if (hasTrigger && !hasPaid) {
      P(`${where}: has a trigger but nothing to trigger`);
    }
    if (hasTrigger && VAGUE.some((re) => re.test(t.trigger.trim()))) {
      P(`${where}: the trigger "${t.trigger}" commits to nothing — give a number or a named event`);
    }

    /* A free field saying nothing is different from one saying "None". The
       second is an answer; the first is a gap nobody noticed. */
    if (/^(n\/?a|-|—|tbd)$/i.test(String(t.free).trim())) {
      P(`${where}: "free" is a placeholder — write what covers it at no cost, or write why nothing does`);
    }

    ['cap', 'free', 'paid', 'trigger', 'selfHost', 'note'].forEach((k) => {
      if (t[k] && /[a-z]'[a-z]/i.test(t[k])) P(`${where}: straight apostrophe in "${k}" — use ’`);
    });
  });

  return problems;
}

function summary() {
  const free = tools.filter((t) => !t.paid || /^none needed\.?$/i.test(t.paid));
  const noFreePath = tools.filter((t) => /^none[.\s]/i.test(String(t.free).trim()));
  const w = Math.max(...tools.map((t) => t.cap.length));

  console.log('  Capability'.padEnd(w + 4) + 'Free covers it?   Paid when');
  console.log('  ' + '─'.repeat(w + 2) + '  ' + '─'.repeat(15) + '  ' + '─'.repeat(30));
  tools.forEach((t) => {
    const isFree = !t.paid || /^none needed\.?$/i.test(t.paid);
    const none = /^none[.\s]/i.test(String(t.free).trim());
    const state = isFree ? 'fully' : none ? 'NO FREE PATH' : 'to a point';
    const when = isFree ? '—' : (t.trigger || '').slice(0, 46);
    console.log('  ' + t.cap.padEnd(w + 2) + state.padEnd(17) + when);
  });

  console.log(`\n  ${tools.length} capabilities. ${free.length} need no paid service at all.`);
  console.log(`  ${noFreePath.length} have no free path in existence: ` +
    noFreePath.map((t) => t.id).join(', ') + '.');
  console.log('  Everything else runs free until its stated trigger fires.');
  console.log(`\n  Free tiers as read on ${asOf}. They move — re-check before quoting them.`);
  return { total: tools.length, free: free.length, noFreePath: noFreePath.length };
}

if (require.main === module) {
  const problems = run();
  if (problems.length) {
    console.error(`checktools: ${problems.length} problem(s)\n`);
    problems.forEach((p) => console.error('  ' + p));
    process.exit(1);
  }
  console.log(`checktools: ${tools.length} capabilities — all valid`);
  if (process.argv.includes('--summary')) { console.log(''); summary(); }
}

module.exports = { run, summary };
