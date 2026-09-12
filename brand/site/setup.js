'use strict';
/* WHAT TO BUY AND SWITCH ON, IN ORDER — the owner's own stack, sequenced.
 *
 *   node brand/site/checkhandover.js --summary
 *
 * WHY THIS IS AN ORDERING AND NOT A NEW LIST
 * tools.js already answers "what do we use for X, what is the free option, and when does it
 * become worth paying" for all nineteen capabilities, and checktools.js refuses a paid
 * choice that names no free option and no trigger. The owner's whole stack is already in
 * there — n8n self-hosted under `automation`, Interakt under `whatsapp`, Ollama under `ai`.
 *
 * So writing a second list of the same things with prices beside them would be the exact
 * duplication this repository keeps being bitten by: two answers to one question, and the
 * newer one drifts. Every row below names a tools.js id instead, and the generator reads
 * the free option, the paid option and the trigger FROM there. What this file adds is the
 * one thing tools.js does not have — an order, and a reason for each position.
 *
 * THE ORDER IS NOT ARBITRARY. Each step is placed where it is because of what it unblocks,
 * and `why_here` says so. Several steps are deliberately free at the start: nothing here
 * asks for money before the thing it pays for can actually be used.
 *
 * NO PRICES ARE WRITTEN IN THIS FILE. The ones that exist live in tools.js, are ranges
 * rather than quotes, and DEPLOYMENT.md states plainly why: "a stale price in a document is
 * worse than no price, because somebody plans around it." That discipline is kept here.
 * Anything about a provider's current offering has to be checked on the day.
 *
 * `see` NAMES A DOCUMENT THAT ALREADY EXISTS AND CARRIES THE DETAIL. checkhandover.js
 * refuses a row pointing at a file that is not there, so this cannot become a map to
 * documents nobody wrote.
 */

/* A step is either backed by a capability in tools.js (`tool`), or it is an action with no
   product behind it — pointing a domain, making a decision — in which case `tool` is null
   and `what` has to carry it alone. */
const STEPS = [
  {
    n: 1,
    tool: 'repo',
    title: 'Put the code somewhere both you and every AI tool can reach',
    what:
      'A private repository holds the whole project — the code, the registers, the tests ' +
      'and the gates. This is the single most important step and it is free. Everything ' +
      'after it assumes the code is somewhere other than one laptop.',
    why_here:
      'First, because it is what makes the rest survivable. A chat window closes and a ' +
      'subscription runs out; a repository does neither. It is also the answer to "how do ' +
      'I carry this to Codex" — Codex opens the same folder and runs the same checks.',
    do: [
      'Create a private repository and push this project into it',
      'Confirm the checks run there — the workflow in .github/workflows/ci.yml runs on push',
    ],
    done_when:
      'You can clone the project onto a machine that has never seen it, run `npm ci` and ' +
      'then `npm test`, and it passes.',
    see: 'MEDHAVA_HOW_TO_BUILD.md',
  },
  {
    n: 2,
    tool: null,
    title: 'Decide the names before you buy the machine',
    what:
      'Four names, all pointing at one machine, each serving something different: the ' +
      'public site, the application behind sign-in, and whatever you use for internal ' +
      'tools. Mail stays separate and points at whoever provides your mailboxes.',
    why_here:
      'Before the machine, because the names decide how it is configured and because DNS ' +
      'changes take time to spread. Deciding them afterwards means redoing the web server ' +
      'and the certificates.',
    do: [
      'Write down which name serves what, using the table in DEPLOYMENT.md section 4',
      'Leave the records unpointed until the machine exists — you already own the domain',
    ],
    done_when:
      'You have four names written down and know which one serves the public site and ' +
      'which one serves the application.',
    see: 'DEPLOYMENT.md',
  },
  {
    n: 3,
    tool: 'host',
    title: 'The machine everything else runs on',
    what:
      'One server that runs the application. A VPS is a computer you rent and administer ' +
      'yourself — more work than a managed host and much cheaper, and it is the only ' +
      'option of the two that can also run the automation and the local AI model later.',
    why_here:
      'Third, because steps 4 to 7 all run ON it. Buying it earlier means paying for an ' +
      'idle machine; buying it later blocks everything else.',
    do: [
      'Rent the machine',
      'Follow DEPLOYMENT.md sections 2 and 3 before anything listens on the internet — ' +
        'secure it first, then give it room',
      'Point the names from step 2 at it, then get certificates (sections 4 and 5)',
    ],
    done_when:
      'Each name resolves to the machine, checked from a connection that is not yours, and ' +
      'the site answers over https.',
    see: 'DEPLOYMENT.md',
  },
  {
    n: 4,
    tool: 'db',
    title: 'The database, and the role the application connects as',
    what:
      'Where every business record lives. The part that matters more than the choice of ' +
      'provider is the ROLE: the application must connect as a user that is neither the ' +
      'superuser nor the owner of the tables.',
    why_here:
      'Immediately after the machine, because nothing can be stored before it exists — and ' +
      'because getting the role wrong at the start is expensive to undo once there is data.',
    do: [
      'Create the database and load core/schema.postgres.sql',
      'Create the application role exactly as DEPLOYMENT.md section 6a sets out',
      'Run `node core/tests/live.test.js` against it',
    ],
    done_when:
      'That test passes against your real database. It is the one check that proves one ' +
      'company cannot read another company’s rows — and it only proves it because the role ' +
      'is restricted. As a superuser it would pass while proving nothing.',
    see: 'DEPLOYMENT.md',
  },
  {
    n: 5,
    tool: 'monitor',
    title: 'Know when it breaks before a customer tells you',
    what:
      'Two separate things: something that tells you the site stopped answering, and ' +
      'something that records errors with enough detail to fix them.',
    why_here:
      'Before real users, not after. An outage you hear about from a customer has already ' +
      'cost you the thing monitoring was meant to protect.',
    do: [
      'Set up the health check described in DEPLOYMENT.md section 11',
      'Point an uptime checker at it',
      'Confirm backups run, and restore one — a backup nobody has restored is a hope',
    ],
    done_when:
      'You deliberately stop the application and receive an alert without anyone telling you.',
    see: 'DEPLOYMENT.md',
  },
  {
    n: 6,
    tool: 'automation',
    title: 'Automation, on the machine you already rent',
    what:
      'Scheduled jobs and small workflows — a nightly report, a reminder, a file picked up ' +
      'and processed. Self-hosted on the same VPS rather than a monthly subscription.',
    why_here:
      'After the machine and the database, because most useful automations read or write ' +
      'business data. Before the AI work, because several AI jobs are triggered by it.',
    do: [
      'Install it on the VPS from step 3',
      'Put it behind sign-in and never expose it publicly',
      'Start with one real job you currently do by hand, not with a demo',
    ],
    done_when:
      'One job you used to do by hand now runs on its own, on schedule, and you have ' +
      'stopped doing it — not once as a demonstration, but for a week without you touching it.',
    see: 'MEDHAVA_BUILD_GUIDE.md',
  },
  {
    n: 7,
    tool: 'ai',
    title: 'A model on your own machine, before a model you pay per call for',
    what:
      'A small model running on the same VPS. Free, private — no business data leaves the ' +
      'machine — and good enough for summarising, classifying and drafting.',
    why_here:
      'After automation, because that is what will call it. Before any paid AI account, ' +
      'because you cannot tell whether you need one until you have seen what the free ' +
      'option does on your own questions.',
    do: [
      'Install it on the VPS and run one real task through it',
      'Judge it on your own data, not on a demo',
      'Move to a paid model only when the trigger in tools.js is actually met',
    ],
    done_when:
      'It answers a real question about your own business well enough to use, or you have ' +
      'established that it does not — either is a result.',
    see: 'MEDHAVA_ARCHITECT.md',
  },
  {
    n: 8,
    tool: 'whatsapp',
    title: 'WhatsApp — the one thing on this list with no free path',
    what:
      'Business messaging goes through an approved provider. There is no free tier: the ' +
      'provider charges a monthly fee and the conversations are charged separately at ' +
      'rates the platform owner sets, not the provider.',
    why_here:
      'Last of the running costs, and only when somebody is actually waiting to use it. ' +
      'It is the first item here that bills you every month whether or not it is used, so ' +
      'it should start the day a worker or a customer is expected on it and not before.',
    do: [
      'Choose a provider and complete their business verification — this takes days, not ' +
        'minutes, so start it before the day you need it',
      'Connect it to the automation from step 6',
    ],
    done_when:
      'A message sent from the shop floor becomes a real record in the system, and the ' +
      'person who sent it can see it worked.',
    see: 'MEDHAVA_PLAN_OF_ACTION.md',
  },
];

/* ── the register's own checks ─────────────────────────────────────────────── */
function check(TOOLS) {
  const bad = [];
  const ids = new Set(TOOLS.map((t) => t.id));
  const seen = new Set();

  STEPS.forEach((s, i) => {
    const at = `step ${s.n || i + 1}`;
    if (s.n !== i + 1) bad.push(`${at} is out of order — steps are numbered by position`);
    if (seen.has(s.n)) bad.push(`${at} is numbered twice`);
    seen.add(s.n);

    if (!s.title || s.title.length < 12) bad.push(`${at} has no title worth scanning`);
    ['what', 'why_here', 'done_when'].forEach((k) => {
      if (!s[k] || s[k].length < 80) {
        bad.push(`${at} has no ${k}, or one too short to be one`);
      }
    });
    if (!Array.isArray(s.do) || !s.do.length) bad.push(`${at} says nothing to actually do`);

    /* A STEP DRAWN FROM tools.js MUST NAME A REAL CAPABILITY. Otherwise the generator
       silently prints no free option, no paid option and no trigger, and the row reads as
       though the decision were already made. */
    if (s.tool !== null && !ids.has(s.tool)) {
      bad.push(`${at} cites tools.js capability "${s.tool}", which does not exist there`);
    }
    /* And a step with no capability behind it has to carry itself — there is nothing to
       fall back on. */
    if (s.tool === null && s.what.length < 120) {
      bad.push(`${at} has no capability behind it and too little of its own to stand on`);
    }
  });
  return bad;
}

module.exports = { STEPS, check };
