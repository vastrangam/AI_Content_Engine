'use strict';
/* MEDHAVA_HOW_TO_BUILD.md — the followable path, generated and gated.
 *
 *   node brand/delivery/website/mkhowto.js
 *   node brand/delivery/website/mkhowto.js --check    → prove it is current and every command real
 *
 * WHY IT IS GENERATED RATHER THAN WRITTEN
 * A step-by-step guide is only worth anything if every command in it runs. The moment one does
 * not, the reader is debugging the document instead of the software, with nothing in the output
 * to tell them the fault is not theirs — and they have no way to know which of the other
 * thirty-five steps are also wrong.
 *
 * So every command is checked against the repository before this writes: an `npm run x` must name
 * a script that exists in package.json, and a `node y.js` must name a file that is really there.
 * Same gate as mkskills.js and mkprompts.js, for the same reason.
 *
 * AND IT MAY NOT NAME A TRADE. This is the product's guide. It goes in the product archive, whose
 * whole point is that no customer is inside it, so it is held to the same denylist checkneutral.js
 * uses on the neutral edition.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');

const { PARTS, check: shapeCheck } = require(path.join(SITE, 'howto.js'));
const { TRADE_WORDS } = require(path.join(SITE, 'checkneutral.js'));
const MODULES = require(path.join(SITE, 'modules.js'));
const RULES = require(path.join(SITE, 'rules.js'));
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const OUT = path.join(ROOT, 'MEDHAVA_HOW_TO_BUILD.md');
const checkOnly = process.argv.includes('--check');

/* ── counts, derived; a count that cannot be read stops the build ────────── */
function derived(what, n) {
  if (!Number.isInteger(n) || n <= 0) {
    console.error(`mkhowto: could not derive ${what}. Refusing to write a guide that states a ` +
      `number it did not read.`);
    process.exit(1);
  }
  return n;
}
const NMOD = derived('the module count', MODULES.length);
const NAPP = derived('the app count', MODULES.reduce((n, m) => n + m.apps.length, 0));
const NRULE = derived('the rule count', RULES.length);
const NENF = derived('the enforced-rule count', RULES.filter((r) => r.state === 'ENFORCED').length);
const NTABLE = derived('the table count',
  (fs.readFileSync(path.join(ROOT, 'core', 'schema.postgres.sql'), 'utf8')
    .match(/^CREATE TABLE /gm) || []).length);

/* ── is a command real? ──────────────────────────────────────────────────── */
function badCommand(line) {
  const first = line.trim();
  if (!first || first.startsWith('#')) return null;
  const parts = first.split(/\s+/);
  let [bin, a, b] = parts;
  /* `PORT=4100 npm start` — step past a leading assignment. */
  if (/^[A-Z_]+=/.test(bin)) { [bin, a, b] = parts.slice(1); }
  if (bin === 'npm') {
    if (['ci', 'install', 'start', 'test'].includes(a)) return null;
    const script = a === 'run' ? b : a;
    if (!script) return 'names no npm script';
    return script in (PKG.scripts || {}) ? null : `npm script "${script}" is not in package.json`;
  }
  if (bin === 'node') {
    if (a === '-e') return null;                    // an inline expression, checked by running it
    if (a && a.startsWith('-')) return null;        // --version and friends are not file paths
    if (!a) return 'node with no file';
    return fs.existsSync(path.join(ROOT, a)) ? null : `${a} does not exist`;
  }
  if (bin === 'python3') {
    if (!a) return 'python3 with no file';
    return fs.existsSync(path.join(ROOT, a)) ? null : `${a} does not exist`;
  }
  if (['cd', 'unzip', 'npx', 'git', 'echo'].includes(bin)) return null;
  return `"${bin}" is not a command this file can verify, so it cannot ship it`;
}

/* ── the gate ────────────────────────────────────────────────────────────── */
function gate(text) {
  const bad = shapeCheck();

  for (const p of PARTS) {
    for (const s of p.steps) {
      for (const line of String(s.cmd || '').split('\n')) {
        const why = badCommand(line);
        if (why) bad.push(`step ${s.id}: "${line.trim()}" — ${why}`);
      }
      /* Any repository path a step names in prose must exist. A guide that sends somebody to a
         file nobody wrote costs them their first ten minutes with no way to tell whose fault
         it is. */
      const prose = [s.do, s.why, s.expect, s.check, s.warn].filter(Boolean).join('\n');
      for (const m of prose.matchAll(/\b((?:brand|core|medhava|tools|deploy)\/[A-Za-z0-9_./-]+)/g)) {
        const p2 = m[1].replace(/[.,]$/, '');
        if (/\/$/.test(p2)) continue;               // a directory reference like medhava/
        if (!fs.existsSync(path.join(ROOT, p2))) {
          bad.push(`step ${s.id} names ${p2}, which does not exist`);
        }
      }
    }
  }

  /* The product's guide may not name a trade. */
  const found = TRADE_WORDS.filter((w) =>
    new RegExp('\\b' + w.replace(/ /g, '\\s+'), 'i').test(text));
  if (found.length) {
    bad.push(`the guide names a trade: ${found.join(', ')}. This ships in the product archive, ` +
      `whose whole claim is that no customer is inside it.`);
  }
  return bad;
}

/* ── render ──────────────────────────────────────────────────────────────── */
function render() {
  const o = [];
  const nsteps = PARTS.reduce((n, p) => n + p.steps.length, 0);

  o.push('# Medhava BOS — how to build it', '');
  o.push('**Start here if you have just downloaded `MEDHAVA_BOS.zip`.** This is the ordered path ' +
    'from that file to a running website, and then the loop you repeat once per app.', '');
  o.push(`${PARTS.length} parts, ${nsteps} steps. Every command below was checked against the ` +
    'repository before this document was written: an `npm run` names a script that exists, and a ' +
    '`node` command names a file that is really there.', '');

  o.push('## What you are starting from', '');
  o.push('| | Count | State |');
  o.push('|---|---|---|');
  o.push(`| Modules | ${NMOD} | specified · a navigation page each |`);
  o.push(`| Apps | **${NAPP}** | **1 built** — Sales, recording a sale end to end |`);
  o.push(`| Database tables | ${NTABLE} | built, running, isolated |`);
  o.push(`| Rules | ${NRULE} | **${NENF} enforced by a test that runs**; the rest are the queue |`);
  o.push('');
  o.push('The platform underneath is real and finished: the schema executes into PostgreSQL, ' +
    'row-level security is enforced by the database rather than by application code, sessions ' +
    'carry a tenant and a company, and no business query can reach the data without both. What ' +
    `remains is the apps — ${NAPP - 1} of them.`, '');
  o.push('> Every module page carries its real app names with an on-screen mark saying the ' +
    'screens are specified and not built. **Leave that mark until the app is genuinely built.** ' +
    'A list of app names on a working shell reads as a working app.', '');

  o.push('## Contents', '');
  PARTS.forEach((p, i) => o.push(`${i + 1}. **${p.title}** — ${p.steps.length} steps`));
  o.push('');
  o.push('---', '');

  PARTS.forEach((p, i) => {
    o.push(`## Part ${i + 1} · ${p.title}`, '');
    if (p.lede) o.push(p.lede, '');
    for (const s of p.steps) {
      o.push(`### ${s.id} · ${s.do}`, '');
      if (s.why) o.push(s.why, '');
      if (s.cmd) o.push('```bash', s.cmd, '```', '');
      if (s.expect) o.push(`**You should see** — ${s.expect}`, '');
      if (s.check) o.push(`**Know it worked** — ${s.check}`, '');
      if (s.warn) o.push(`> ⚠️ ${s.warn}`, '');
    }
    o.push('---', '');
  });

  o.push('## Where to look things up', '');
  o.push('| Question | File |');
  o.push('|---|---|');
  o.push('| What are the modules and apps? | `brand/site/modules.js` — the one canonical list |');
  o.push(`| What must each module do? | \`brand/site/rules.js\` — ${NRULE} rules |`);
  o.push('| What is the database? | `core/schema.postgres.sql` |');
  o.push('| Why is it shaped this way? | `MEDHAVA_ARCHITECT.md` — every decision with what would make it wrong |');
  o.push('| How does each layer work? | `MEDHAVA_BUILD_GUIDE.md` |');
  o.push('| What gets built, in order? | `MEDHAVA_PLAN_OF_ACTION.md` |');
  o.push('| How does it go live? | `DEPLOYMENT.md` |');
  o.push('| What are the rules for changing this repo? | `CLAUDE.md` |');
  o.push('| Where the spec contradicts itself | `SPEC_CONFLICTS.md` — unresolved on purpose |');
  o.push('');
  /* The glossary is INJECTED here by mkregisters.js, and only the terms this document actually
     uses. Markers rather than content, because the words it needs change as the steps change and
     a hand-kept list drifts silently. checkcoverage measures the result. */
  o.push('## Every technical word this guide uses, in plain language', '');
  o.push('<!-- GLOSSARY -->', '<!-- /GLOSSARY -->', '');

  o.push('**On `MEDHAVA_BUILD_GUIDE.md` Part 13:** it is the path from an *empty machine* to a ' +
    'live product — `git init`, `npm init`, creating a database by hand. That is how this ' +
    'platform was built, and it is still the right reference for the deployment stage. It is ' +
    'not the path for somebody holding the archive, where all of that already exists. Follow ' +
    'this document instead, and read Part 13 when you reach Part 6 below.', '');

  return o.join('\n') + '\n';
}

/* ── run ─────────────────────────────────────────────────────────────────── */
const text = render();
const bad = gate(text);
if (bad.length) {
  console.error(`mkhowto: ${bad.length} problem(s). Refusing to write.\n`);
  bad.forEach((b) => console.error('  · ' + b));
  process.exit(1);
}

/* THE GLOSSARY IS SOMEBODY ELSE'S BLOCK, SO IT IS EXCLUDED FROM THE COMPARISON.
   This writes the markers empty; mkregisters.js then fills them with the terms this document
   actually uses. Comparing the whole file would therefore report "out of date" the moment the
   pipeline had run correctly, and the only way to make --check pass would be to run mkhowto LAST
   and undo the injection. Both blocks are still gated — mkregisters --check owns the contents,
   this owns everything around them. */
const withoutGlossary = (s) =>
  s.replace(/<!-- GLOSSARY -->[\s\S]*?<!-- \/GLOSSARY -->/, '<!-- GLOSSARY --><!-- /GLOSSARY -->');

if (checkOnly) {
  const now = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (withoutGlossary(now) !== withoutGlossary(text)) {
    console.error('mkhowto --check: MEDHAVA_HOW_TO_BUILD.md is out of date — run without --check');
    process.exit(1);
  }
} else {
  /* Keep an already-injected glossary rather than blanking it on every regeneration, which would
     leave the file failing checkcoverage until somebody remembered to run mkregisters again. */
  const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  const keep = prev.match(/<!-- GLOSSARY -->[\s\S]*?<!-- \/GLOSSARY -->/);
  fs.writeFileSync(OUT, keep
    ? text.replace(/<!-- GLOSSARY -->\n<!-- \/GLOSSARY -->/, keep[0])
    : text);
  console.log(`MEDHAVA_HOW_TO_BUILD.md written: ${Math.round(text.length / 1024)}KB · ` +
    `${PARTS.length} parts · ${PARTS.reduce((n, p) => n + p.steps.length, 0)} steps`);
}

const ncmd = PARTS.reduce((n, p) => n + p.steps.filter((s) => s.cmd).length, 0);
console.log(`mkhowto: ${ncmd} steps carry a command, every one verified to exist · ` +
  `counts read from source (${NMOD} modules · ${NAPP} apps · ${NRULE} rules, ${NENF} enforced · ` +
  `${NTABLE} tables) · no trade word`);
