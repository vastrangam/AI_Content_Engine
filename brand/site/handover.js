'use strict';
/* THE SEVEN STAGES, IN THE OWNER'S OWN ORDER AND HIS OWN NUMBERING.
 *
 *   node brand/site/checkhandover.js --summary
 *
 * He listed these and they are kept exactly as listed — same order, same numbers, same
 * names. Re-ordering a sequence somebody specified is a second opinion nobody asked for,
 * and §3 rule 5 of the working agreement forbids it by name.
 *
 * WHAT EACH ROW HAS TO CARRY, AND WHY
 *   before      what must already be true. A stage attempted out of order fails for a
 *               reason that looks like the stage being wrong.
 *   what        what it actually means, in words that do not assume the technical part.
 *   who         WHO does it — and this is the field that matters most in this file. Some
 *               of these I could do from here and some I could never do, and saying which
 *               is the difference between a plan and a wish. A registrar login, a rented
 *               machine and an app-store account are not things any AI can obtain.
 *   steps       what gets done.
 *   done_when   how you know it worked, stated so that the answer is yes or no rather than
 *               a matter of opinion.
 *   state       what exists TODAY, read from the requirements registry by the generator so
 *               this file cannot claim more than the gated register allows.
 *   see         the document that already carries the detail. checkhandover.js refuses a
 *               row pointing at a file nobody wrote.
 *
 * WHY `state` IS DERIVED AND NOT WRITTEN HERE. Every count and status in the generated
 * roadmap is read at generation time from registry.js and audit.js. If somebody later
 * builds the mobile app, this document reports it the next time it is generated — and if
 * nobody does, it cannot quietly start saying they did.
 */

/* `caps` name rows in the requirements registry, so the generator can print what each stage
   has actually reached rather than a sentence somebody typed about it. */
const STAGES = [
  {
    n: 1,
    title: 'Map the Umbrella Domain and DNS Hierarchy',
    caps: [],
    before: 'You own the domain. Nothing else is needed.',
    what:
      'Decide which name serves what before anything is built on them. One name for the ' +
      'public site, one for the application behind sign-in, one for internal tools, and ' +
      'mail pointed somewhere else entirely. "Umbrella" is the useful part: one domain at ' +
      'the top, everything else a name underneath it, so a second business or a second ' +
      'product later is another name rather than another domain and another certificate.',
    who:
      'YOU, and only you. This needs the login to wherever you bought the domain, which ' +
      'is a credential no AI should ever hold and this one never will.',
    steps: [
      'Write down the four names and what each serves — the table in DEPLOYMENT.md §4',
      'Leave them unpointed until the machine exists, then point them all at it',
      'Point mail records at your mailbox provider, never at the application machine',
    ],
    done_when:
      'Each name resolves to the machine, checked from a connection that is not your own.',
    see: 'DEPLOYMENT.md',
  },
  {
    n: 2,
    title: 'Design the BOM Data Engine and Schema',
    caps: ['CAP-SCHEMA', 'CAP-ISOLATION'],
    before: 'The database exists and the application connects to it as a restricted role.',
    what:
      'The tables every other stage reads and writes, and the rule that one company can ' +
      'never see another company’s rows. A bill of materials — what a finished thing is ' +
      'made of, and therefore what has to be bought and consumed to make one — is part of ' +
      'this and is specified rather than built: module 08 Manufacturing is on the queue, ' +
      'not in the product.',
    who:
      'MOSTLY DONE. The schema and the isolation exist and are proven against a real ' +
      'Postgres. The bill of materials itself is not built.',
    steps: [
      'Load core/schema.postgres.sql into your database',
      'Create the application role as DEPLOYMENT.md §6a sets out — not the superuser, not ' +
        'the table owner, or every isolation policy is inert',
      'Run `node core/tests/live.test.js` against your real database',
    ],
    done_when:
      'That test passes against your database. It is the single check that proves isolation ' +
      'holds, and it only proves it because the role is restricted.',
    see: 'MEDHAVA_ARCHITECT.md',
  },
  {
    n: 3,
    title: 'Construct the Shared API and Single Sign-On (SSO)',
    caps: ['CAP-SHELL', 'CAP-DEVPLATFORM'],
    before: 'Stage 2 is done. The database is real and the role is restricted.',
    what:
      'One way in for everything — the web app, the mobile app, an automation — so that ' +
      'signing in once is enough and every one of them is subject to the same permissions. ' +
      '"Shared" is the whole point: the mobile app in stage 5 must not get its own private ' +
      'door with its own rules, because two doors mean two sets of rules and one of them ' +
      'will be wrong.',
    who:
      'PARTLY EXISTS, and the gap is real. Sign-in, sessions and company switching work. ' +
      'A public API — versioned, with keys, rate limits and webhooks — does not exist and ' +
      'is registered as not started. Single sign-on against an outside identity provider ' +
      'does not exist either.',
    steps: [
      'Run what exists: `npm start`, then `npm run medhava` to see its tests pass',
      'Decide whether sign-on is your own accounts or an outside provider BEFORE the ' +
        'mobile app — changing it afterwards means reissuing every credential',
      'Build the public API surface as its own slice, with the same gates as everything else',
    ],
    done_when:
      'One account signs in to the web app and the mobile app, and revoking it stops both.',
    see: 'MEDHAVA_ARCHITECT.md',
  },
  {
    n: 4,
    title: 'Develop the Core Web Application',
    caps: ['CAP-SHELL'],
    before: 'Stage 3 — there is one way in, and it works.',
    what:
      'The application people actually use. The design names 22 modules and 113 apps; what ' +
      'runs on the real database today is a much smaller number, and the registry states ' +
      'exactly which. Everything else is written down, which is not the same as built.',
    who:
      'IN PROGRESS, and this is where most of the remaining work is. BUILD_QUEUE.md is the ' +
      'ordered list of what to do next and why each item is in that position.',
    steps: [
      'Open BUILD_QUEUE.md and take the first task that is not done',
      'Build one vertical slice at a time — screen, rules, database, test — never a layer ' +
        'at a time across many features',
      'Prove each rule fails before it passes; a check never seen to fail proves nothing',
      'Record the run through tools/evidence.js so the claim survives the conversation',
    ],
    done_when:
      'A person in the business does a real day of work in it and stops using the ' +
      'spreadsheet they used before.',
    see: 'BUILD_QUEUE.md',
  },
  {
    n: 5,
    title: 'Build Companion Mobile Apps',
    caps: ['CAP-MOBILE'],
    before: 'Stages 3 and 4. There is a shared way in, and there is something worth opening.',
    what:
      '"Companion" is the important word. Not the whole system on a phone — the two or ' +
      'three things that genuinely happen away from a desk: marking attendance, reporting ' +
      'what was produced, approving something. A phone app that tries to be the whole ' +
      'application is how mobile projects die.',
    who:
      'YOU, AND NOT STARTED. There is no mobile code in this project at all. It also needs ' +
      'accounts I cannot hold — Apple and Google developer accounts, both paid and both ' +
      'requiring identity verification that takes days.',
    steps: [
      'Decide the two or three things that must work on a phone, and refuse the rest',
      'Start the developer accounts early — the verification is slow and blocks release',
      'Build against the shared API from stage 3, never against the database directly',
    ],
    done_when:
      'Somebody on the floor marks attendance on a phone and it appears in the web ' +
      'application without anybody re-entering it.',
    see: 'MEDHAVA_PLAN_OF_ACTION.md',
  },
  {
    n: 6,
    title: 'Implement Offline-First Caching and Sync',
    caps: ['CAP-MOBILE'],
    before: 'Stage 5. There is an app to be offline in.',
    what:
      'The phone keeps working where there is no signal and catches up later. The hard ' +
      'part is not the caching — it is deciding what happens when two people changed the ' +
      'same thing while both were offline. That decision is a business rule, not a ' +
      'technical detail, and it has to be made by someone who knows the business.',
    who:
      'YOU, AND NOT STARTED. Nothing here is built. Do not let it be added quietly to ' +
      'stage 5 as though it were a setting.',
    steps: [
      'List every action that must work offline — it will be shorter than it first seems',
      'Decide, per action, who wins when two offline changes collide, and write it down',
      'Build it as its own slice with its own tests, including the collision cases',
    ],
    done_when:
      'A phone in aeroplane mode records a day’s work; when it reconnects, every record it ' +
      'made is in the system, and where somebody else changed the same record while it was ' +
      'offline the result is the one your written rule says it should be.',
    see: 'MEDHAVA_ARCHITECT.md',
  },
  {
    n: 7,
    title: 'Deploy Infrastructure and Monitoring Pipelines',
    caps: ['CAP-DEPLOY', 'CAP-MONITOR', 'CAP-PUBLISH'],
    before:
      'Something worth deploying. In practice this runs alongside stage 4 rather than ' +
      'after it — deploy early and often, with little in it, rather than once with everything.',
    what:
      'Getting it onto a machine the business can reach, keeping it there, and knowing ' +
      'before your customers do when it stops. Backups belong here, and a backup nobody ' +
      'has restored is not a backup.',
    who:
      'YOU, AND NOT STARTED — nothing has ever been deployed anywhere. It needs a machine, ' +
      'a domain and credentials, none of which exist yet and none of which I can obtain. ' +
      'DEPLOYMENT.md is the runbook and has never been followed by anybody, so expect it ' +
      'to be wrong in small ways the first time and fix it as you go.',
    steps: [
      'Follow DEPLOYMENT.md from §1 to §11, in order',
      'Deploy something small before deploying something important',
      'Restore a backup once, deliberately, before you need to',
      'Set the health check and point an uptime checker at it',
    ],
    done_when:
      'You deliberately stop the application and an alert reaches you before anyone in the ' +
      'business notices.',
    see: 'DEPLOYMENT.md',
  },
];

/* ── the register's own checks ─────────────────────────────────────────────── */
function check(REGISTRY_IDS) {
  const bad = [];
  const seen = new Set();

  STAGES.forEach((s, i) => {
    const at = `stage ${s.n || i + 1}`;
    /* THE OWNER'S NUMBERING, KEPT. If these ever stop being 1..7 in his order, somebody has
       re-ordered a list he wrote, which is the thing §3 rule 5 forbids. */
    if (s.n !== i + 1) {
      bad.push(`${at} sits at position ${i + 1}. These are the owner's own seven stages in ` +
        `his own order, and re-ordering them is a second opinion nobody asked for.`);
    }
    if (seen.has(s.n)) bad.push(`${at} is numbered twice`);
    seen.add(s.n);

    ['title', 'before', 'what', 'who', 'done_when', 'see'].forEach((k) => {
      if (!s[k]) bad.push(`${at} has no ${k}`);
    });
    ['what', 'who', 'done_when'].forEach((k) => {
      if (s[k] && s[k].length < 70) bad.push(`${at} has a ${k} too short to be one`);
    });
    if (!Array.isArray(s.steps) || s.steps.length < 2) {
      bad.push(`${at} lists fewer than two things to do, which is not a stage`);
    }

    /* THE FIELD THIS FILE EXISTS FOR. A stage that does not say who does it reads as though
       somebody else will, and the somebody is usually assumed to be me. Several of these I
       could never do — a registrar login, a rented machine, an app-store account — and a
       roadmap that hides that is a roadmap that stalls at the first one. */
    if (s.who && !/\b(YOU|DONE|EXISTS|PROGRESS)\b/.test(s.who)) {
      bad.push(`${at} does not say plainly who does it. Every stage owes the reader either ` +
        `"YOU", or what already exists — never silence, which reads as "somebody else".`);
    }

    (s.caps || []).forEach((c) => {
      if (!REGISTRY_IDS.has(c)) {
        bad.push(`${at} cites ${c}, which is not a row in the requirements registry — so ` +
          `the generator would print no state for it and the stage would look unmeasured`);
      }
    });
  });

  if (STAGES.length !== 7) {
    bad.push(`there are ${STAGES.length} stages. The owner listed seven; adding or ` +
      `removing one silently changes what he asked for.`);
  }
  return bad;
}

module.exports = { STAGES, check };
