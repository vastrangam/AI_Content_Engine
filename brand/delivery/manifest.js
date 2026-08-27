'use strict';
/* WHAT WE DELIVER — one answer, read by everything that needs it.
 *
 * WHY THIS FILE EXISTS
 * checkcoverage.js was written to stop a gate covering only the document somebody had complained
 * about. It then hand-typed its own list of six documents, which gave it the exact defect it was
 * built to prevent, one level up. mkbundle.js hand-typed a list too, and that one reached what a
 * customer would actually be sent:
 *
 *   MEDHAVA.zip      had no build guide
 *   VASTRANGAM.zip   had no tenant guide
 *   Vastrangam_BOS_Final.md    outside the gate: 1 of 19 layers, 1 of 24 changeable things
 *   PLAN_OF_ACTION.md          outside the gate: 111 of 113 apps, 1 of 19 layers
 *   Vastrangam_BOS_Final.pdf   rendered from a markdown file 12 hours newer than it, and shipped
 *
 * Three lists, three omissions, one cause: a list somebody types is a list somebody forgets to add
 * to, and nothing notices.
 *
 * So there is one list, and it is answerable for both halves of the question:
 *
 *   being in this file is what makes a document DELIVERED  → mkbundle packs it
 *   being in this file is what makes a document GATED      → checkcoverage measures it
 *
 * A document cannot be one without the other. That is the whole design.
 *
 * AND THE LIST ITSELF IS CHECKED. Every markdown file sitting where documents sit must either be
 * in DOCS or in NOT_DELIVERED with a reason — because otherwise this file is just a fourth list.
 */

const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');

/* Where documents live. Anything markdown in these places is a candidate for delivery and owes
   a decision — see check() at the foot. */
const DOC_DIRS = [
  '.',
  'brand/delivery/website/MEDHAVA_BOS',
  'brand/delivery/website/VASTRANGAM_BOS',
];

/* ── the trade words, per document ────────────────────────────────────────────
   Words used in their EVERYDAY sense, not the technical one the glossary defines. Explaining the
   technical meaning beside one of these would teach a reader something false about their own
   vocabulary. Each is listed with its reason, per document, because a word that is a collision in
   one document is a real term in another. */
const EVERYDAY = {
  /* "Job work" is this trade's own term for making goods on contract — nothing to do with a
     background job. "Row" appears only as a spreadsheet row, quoted from the business's own
     recorded file layout: not a database row, and not mine to reword. */
  job: 'this trade’s term for making goods on contract, not a background job',
  row: 'a spreadsheet row quoted from the business’s own file layout, not a database row',
};

/* ── the documents ───────────────────────────────────────────────────────────
   `decide` records, per register, either 'full' or a written reason for not carrying it. A
   register with no decision fails checkcoverage — see registers.js for the list. */

const SKIP_RULES_SALES = 'A landing page that opened with 285 numbered rules would not be read, ' +
  'and the reader who wants them is one click from the plan of action, which carries every one. ' +
  'The page states the rules that decide a purchase — no lock-in, nothing static, no password ' +
  'ever asked for — and names where the rest live.';
const SKIP_STACK_SALES = 'The promise a buyer needs is "you are not locked in"; the 19-layer ' +
  'register that proves it belongs in the plan and the build guide, and the page says so.';
const SKIP_DYN_SALES = 'The page makes the claim — nothing is static, and you change it ' +
  'yourself — with the example that carries it: somebody leaves without notice and a ' +
  'replacement starts the next morning. The 24-line register that proves it belongs in the ' +
  'plan and the tenant guide, both of which carry it in full.';
const SKIP_GLOSS_SALES = 'A sales page is written in the reader’s words, not in terms needing a ' +
  'glossary. It is measured the same way as every other document — a technical word it does use ' +
  'still has to be explained where it is used.';

const FULL = { rules: 'full', modules: 'full', apps: 'full', stack: 'full', dynamic: 'full', glossary: 'full' };

const SALES_PAGE = {
  modules: 'full', apps: 'full',
  rules: SKIP_RULES_SALES, stack: SKIP_STACK_SALES,
  dynamic: SKIP_DYN_SALES, glossary: SKIP_GLOSS_SALES,
};

const DOCS = [
  /* ── the platform edition — for whoever builds and runs Medhava ─────────── */
  {
    md: 'Medhava_BOS.md', pdf: 'Medhava_BOS.pdf', edition: 'MEDHAVA', start: true,
    what: 'All four platform documents in one — the reader’s tour, the design and why, the build plan, and how it is engineered.',
    generator: 'node brand/delivery/website/mkfinal.js',
    decide: FULL,
  },
  {
    md: 'MEDHAVA_PLAN_OF_ACTION.md', pdf: 'MEDHAVA_PLAN_OF_ACTION.pdf', edition: 'MEDHAVA',
    what: 'The plan of action on its own: what is built, in what order, and the rules it must satisfy.',
    generator: 'node brand/site/mkregisters.js && node brand/site/mkrulebook.js',
    decide: FULL,
  },
  {
    md: 'MEDHAVA_ARCHITECT.md', pdf: 'MEDHAVA_ARCHITECT.pdf', edition: 'MEDHAVA',
    what: 'What the system is and why it is shaped this way — every decision, its reason, and what would make it the wrong one.',
    generator: 'node brand/delivery/website/mkarchitect.js',
    decide: {
      modules: 'full', stack: 'full', dynamic: 'full', glossary: 'full',
      rules: 'This document argues the SHAPE of the system; the rulebook states what it does in ' +
        'each of 22 areas. Printing 285 rules inside an argument about isolation and effective ' +
        'dating would bury the argument, and the plan of action carries every one of them with ' +
        'its "never" intact. What this document does carry is the count and how many are ' +
        'enforced, because that is a fact about the design.',
      apps: 'The apps are product scope. This is the design underneath them — a decision like ' +
        '"money is whole paise" is true of all 113 and specific to none. The module table gives ' +
        'the per-module app counts, and the plan of action owns the full list.',
    },
  },
  {
    /* Absent from MEDHAVA.zip until this file existed. */
    md: 'MEDHAVA_BUILD_GUIDE.md', pdf: 'MEDHAVA_BUILD_GUIDE.pdf', edition: 'MEDHAVA',
    what: 'How the platform is engineered — architecture, database, backend, frontend, storage, sign-in, integrations, running it.',
    generator: 'node brand/delivery/website/mkguide.js',
    decide: {
      rules: 'full', modules: 'full', stack: 'full', dynamic: 'full', glossary: 'full',
      apps: 'The 113 apps are product scope, and this document is the engineering design — ' +
        'layer by layer, not screen by screen. The full list is in the plan of action, which owns ' +
        'scope, and in the merged BOS which carries both.',
    },
  },
  {
    md: 'brand/delivery/website/MEDHAVA_BOS/Medhava_Website.md',
    pdf: 'brand/delivery/website/MEDHAVA_BOS/Medhava_Website.pdf', edition: 'MEDHAVA',
    what: 'The website as a document: the designed page, printed.',
    generator: 'node brand/delivery/website/mklanding.js  (PDF from brand/site/build.js)',
    decide: SALES_PAGE,
  },
  {
    md: 'DEPLOYMENT.md', pdf: 'DEPLOYMENT.pdf', edition: 'MEDHAVA',
    what: 'The server runbook: putting the platform on a machine and keeping it there.',
    generator: 'hand-maintained; glossary injected by mkregisters.js',
    decide: {
      rules: 'This is an operations runbook for one machine, not a specification of what the ' +
        'software does. The rules are enforced by the software wherever it is deployed, and they ' +
        'do not change with the server it runs on.',
      modules: 'Same reason — the deployment is identical whichever modules a business has on.',
      apps: 'The machine does not know how many apps the software has, and deploying it does not ' +
        'change with the answer. Naming 113 screens in a runbook would lengthen the one document ' +
        'somebody reads at three in the morning with a fault in front of them.',
      stack: 'This document deploys the choices; the register that names the alternatives, and ' +
        'what each swap costs, is the build guide’s.',
      dynamic: 'Nothing here is a customer-facing setting. What a business can change is the ' +
        'tenant guide’s subject and the plan’s register.',
      glossary: 'Written for somebody who administers a server, and measured the same way as ' +
        'every other document — a technical word it uses still has to be explained where it is used.',
    },
  },

  /* ── the trade edition — for one business onboarding onto the platform ────
     THREE DOCUMENTS WHERE THERE WERE FOUR, AND A DIFFERENT SPLIT.
     The four that were here served two readers badly: a builder's plan of action and a website
     printout went to a business that does not build software and does not need a brochure it has
     already read, while the one document it did need was both the setup runbook and the rules
     reference at once. Those are two readers — somebody in their first week with an empty
     account, and somebody nine months in looking up how a month is computed — and the ordering
     that makes a reference usable is the ordering that makes a first week impossible to follow.
     So: the ordered path, the reference, and the two of them bound together. */
  {
    md: 'VASTRANGAM_BUILD_GUIDE.md', pdf: 'VASTRANGAM_BUILD_GUIDE.pdf', edition: 'VASTRANGAM',
    what: 'Setting this business up, in order: signing up, companies, channels, people, products, the making side, buying, selling, the first month end, live.',
    generator: 'node brand/delivery/website/mktenant.js',
    decide: {
      dynamic: 'full', glossary: 'full',
      modules: 'The 22 modules are how the platform is organised, not how a business is set up. ' +
        'This runbook goes in the order the work can be done — companies, channels, people, ' +
        'products, making, buying, selling, the month end — which crosses several modules per ' +
        'part and follows none of them end to end. Listing all 22 against a step would name ' +
        'twenty the reader is not in yet. The reference carries every one.',
      rules: 'This is the ordered path, and its companion carries all 285 rules with what the ' +
        'system will never do instead. A runbook that printed the rulebook between step 3 and ' +
        'step 4 would not be followable, and paraphrasing a formula in a second place is how two ' +
        'documents start disagreeing about somebody’s wages. Every step that depends on a ' +
        'calculation says so and names where it lives. Its own gate checks what it IS: the parts ' +
        'run 0 to 9 with no gap, every step renders, the path reaches an invoice, a settlement, ' +
        'payroll and a closed period, and it tells the reader which document holds the rules.',
      apps: 'A person setting the business up meets the screens they need in the order they need ' +
        'them. A list of 113 in the first week is a list nobody reads; the reference carries it.',
      stack: 'This reader installs nothing and chooses nothing. What the platform is built on, ' +
        'and the 57 replacements, are the reference’s and the build guide’s for the platform.',
    },
    everyday: ['job', 'row'],
  },
  {
    md: 'VASTRANGAM_RULES_AND_LOGIC.md', pdf: 'VASTRANGAM_RULES_AND_LOGIC.pdf', edition: 'VASTRANGAM',
    what: 'Everything this business runs on: every rule with what the system will never do instead, every calculation, and what the system refuses.',
    generator: 'node brand/delivery/website/mktenant.js',
    decide: FULL, everyday: ['job', 'row'],
  },
  {
    md: 'Vastrangam_Final_As_Tenant.md', pdf: 'Vastrangam_Final_As_Tenant.pdf',
    edition: 'VASTRANGAM', start: true,
    what: 'Both tenant documents in one file — the build guide first, the rules and the logic second.',
    generator: 'node brand/delivery/website/mktenant.js',
    decide: FULL, everyday: ['job', 'row'],
  },
  {
    md: 'SPEC_CONFLICTS.md', pdf: 'SPEC_CONFLICTS.pdf', edition: 'VASTRANGAM',
    what: 'The eight places the trade’s own specification says two different things, with the line numbers, and no resolution.',
    generator: 'node brand/delivery/website/mkconflicts.js',
    decide: {
      glossary: 'full',
      rules: 'This document is about the specification, not about the software. The 285 rules ' +
        'describe what the system does; these eight describe what the source document could not ' +
        'decide. Carrying the rulebook here would bury eight open questions under 285 settled ' +
        'answers, and the plan of action carries every one of them already.',
      modules: 'A conflict belongs to a sentence in a document, not to a module. Two of the eight ' +
        'touch production and two touch payroll, and each says so in its own words; a module list ' +
        'across the top would suggest a coverage this page does not claim.',
      apps: 'Same reason, one level down. None of these eight is a screen — they are questions ' +
        'about what any screen showing that figure should show.',
      stack: 'What the software is built on has no bearing on what its specification failed to ' +
        'settle. The 19-layer register is the build guide’s and the plan’s.',
      dynamic: 'Nothing here is a setting a business changes. These are decisions the owner has ' +
        'not taken yet, and taking one changes a fixture and this page, not a preference screen.',
    },
    everyday: ['job', 'row'],
  },
];

/* ── markdown that sits with the documents and is deliberately NOT delivered ──
   Every one needs a reason. "It is old" is a reason; silence is not. */
const NOT_DELIVERED = {
  'CLAUDE.md': 'The working agreement for whoever edits this repository. Not a product document.',

  /* ── RETIRED FROM THE TRADE EDITION, RECORDED RATHER THAN DELETED ──────────
     Each of these was delivered and is not any more. The files stay — three of them are still
     read by something — and what changed is who they are for. Deleting the entry instead of
     writing the reason would leave the next person to work out from a diff why a customer
     stopped receiving a document. */
  'Vastrangam_BOS_Final.md':
    'Superseded by Vastrangam_Final_As_Tenant.md. It merged the sales page with the builder’s ' +
    'plan of action, which is the platform’s story told to a business that has already bought it. ' +
    'Its generator is gone too — mkfinal.js now writes one document, because a generator whose ' +
    'only output nobody receives drifts without anybody noticing.',
  'Medhava_BOS_Final.md':
    'Renamed to Medhava_BOS.md when the architect became its second part. The word "Final" ' +
    'described a document that is regenerated on every change, which is the opposite of what it ' +
    'promised a reader.',
  'PLAN_OF_ACTION.md':
    'The builder’s plan, in this trade’s words. It is still generated and still read — mktenant.js ' +
    'parses its cascades and flows out of it — but a business onboarding onto the platform is not ' +
    'building the platform, and the build order of 22 modules is not its concern.',
  'Vastrangam_BOS_Website.md':
    'The landing page as a printed document. A business reads the landing page before it signs ' +
    'up, not after; shipping it inside the customer’s own bundle is sending somebody the ' +
    'brochure for the thing they have already bought.',
  'VASTRANGAM_TENANT_GUIDE.md':
    'Split into VASTRANGAM_BUILD_GUIDE.md and VASTRANGAM_RULES_AND_LOGIC.md, which are the two ' +
    'readers it was serving at once — the first week, and the ninth month.',

  'PROJECT_REPORT.md': 'An earlier report superseded by the BOS Final. Kept for history, not sent.',
  'SOURCE_REGISTER.md': 'Where each figure in the older documents came from. A working record.',
  'VASTRANGAM_MODULES_COMPLETE.md': 'Superseded by the tenant guide, which covers the same ground for a reader rather than a builder.',
  'SAMPLE_RUN_Teal_Chinon_Anarkali.md': 'One worked example from the content engine — a test artefact, not a document.',
  'Vastrangam_AI_Content_Engine.md': 'Documentation for one app inside Module 18, not a platform document.',
  'Vastrangam_AI_Content_Engine.SKILL.md': 'A skill definition read by tooling, not by a person.',
  'Vastrangam_AI_Engine_MANUAL.md': 'The manual for one app, shipped with that app rather than with the platform documents.',
  'Vastrangam_Content_Engine_Humanized.md': 'Sample output from the content engine — a test artefact.',
};

/* ── helpers ─────────────────────────────────────────────────────────────── */
const forEdition = (name) => DOCS.filter((d) => d.edition === name);
const editions = () => [...new Set(DOCS.map((d) => d.edition))];
const everydayWords = (doc) => (doc.everyday || []).slice();

/** Is this file itself complete and well formed? */
function check(fs) {
  const bad = [];
  const seen = new Set();

  for (const d of DOCS) {
    if (!d.md || !d.pdf) { bad.push(`${d.md || '(no md)'}: needs both an md and a pdf`); continue; }
    if (seen.has(d.md)) bad.push(`${d.md}: listed twice`);
    seen.add(d.md);
    if (!d.what || d.what.length < 20) bad.push(`${d.md}: no description of what it is`);
    if (!d.generator) bad.push(`${d.md}: does not say what regenerates it`);
    if (!d.edition) bad.push(`${d.md}: belongs to no edition`);
    (d.everyday || []).forEach((w) => {
      if (!(w in EVERYDAY)) bad.push(`${d.md}: skips "${w}" with no recorded reason`);
    });
  }

  for (const e of editions()) {
    const starts = forEdition(e).filter((d) => d.start);
    if (starts.length !== 1) {
      bad.push(`${e}: ${starts.length} documents marked "start here" — there must be exactly one`);
    }
  }

  /* THE CHECK THAT MAKES THIS A MANIFEST RATHER THAN A FOURTH LIST.
     Any markdown sitting where documents sit is either delivered or explicitly not. */
  if (fs) {
    for (const dir of DOC_DIRS) {
      const abs = path.join(ROOT, dir);
      if (!fs.existsSync(abs)) continue;
      for (const f of fs.readdirSync(abs)) {
        if (!f.endsWith('.md')) continue;
        const rel = dir === '.' ? f : `${dir}/${f}`;
        if (seen.has(rel) || (f in NOT_DELIVERED)) continue;
        bad.push(`${rel}: sits with the documents and is neither delivered nor explained. ` +
          'Add it to DOCS, or to NOT_DELIVERED with a reason.');
      }
    }
  }
  return bad;
}

module.exports = { DOCS, NOT_DELIVERED, EVERYDAY, DOC_DIRS, ROOT, forEdition, editions, everydayWords, check };
