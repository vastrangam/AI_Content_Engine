'use strict';
/* RULE 2 — NOTHING IS STATIC, AND THE PAST STAYS CORRECT.
 *
 * THE PROBLEM THIS SOLVES, IN ONE SENTENCE
 * A master leaves without notice on the 14th and a replacement starts on the 15th. You must be
 * able to make that change the same morning, in the app, with nobody writing code — and last
 * month’s payroll, already calculated and already paid, must not move by a single rupee.
 *
 * Those two requirements pull in opposite directions, and most systems pick one. A system that
 * locks the past makes you wait for a developer. A system that lets you overwrite freely
 * silently rewrites months you have already closed and filed.
 *
 * THE ANSWER IS THE EFFECTIVE DATE.
 * Every change carries the date it starts from and the person who made it, and is APPENDED
 * rather than written over. So:
 *
 *   change it today          → it applies from today, or from any date you choose
 *   yesterday’s records      → still resolve the value that applied yesterday
 *   last month’s payroll     → reruns to the same figure it produced then
 *   who changed it, and when → always answerable
 *
 * Purana record mitta nahin. Naye date se naya rule lagta hai. Isi wajah se aap kabhi bhi,
 * kuch bhi badal sakte ho — bina is dar ke ki pichhle mahine ka hisaab hil jayega.
 *
 * WHAT THIS FILE IS
 * The register of everything a tenant can change without a developer. For each entry:
 *
 *   what       the thing being changed
 *   who        which role may change it
 *   when       what happens the moment it is saved
 *   past       what happens to records already made — the question most systems never answer
 *   dated      true when the change carries an effective date and the past resolves the old value
 *
 * WHAT IS DELIBERATELY NOT CHANGEABLE
 * A short list, and every item on it is a guarantee somebody else relies on: the audit trail
 * cannot be switched off, money cannot stop being exact, and a record cannot stop naming the
 * company it belongs to. A trade may change its vocabulary; it may not opt out of the things
 * the books are trusted for. Those live in IMMUTABLE at the bottom.
 *
 * Straight apostrophes read wrong in the PDF; use the typographic ’ in prose.
 */

const ENTRIES = [
  /* ── people ───────────────────────────────────────────────────────────── */
  {
    id: 'person-joins',
    area: 'People',
    what: 'Somebody joins — a worker, a supervisor, an office staff member, a contractor',
    who: 'Admin, or an HR role',
    when: 'They exist from their start date and can be assigned work the same minute.',
    past: 'Nothing before their start date mentions them, because they were not there.',
    dated: true,
  },
  {
    id: 'person-leaves',
    area: 'People',
    what: 'Somebody leaves, with or without notice',
    who: 'Admin, or an HR role',
    when: `Marked as left from a date. Their sign-in stops, and no new work is assigned to them.
Their record is kept, not deleted.`,
    past: `Every hour they worked, every piece they made and every rupee they were paid stays exactly
as it was. Deleting the person would blank all of it and change months already closed — so the record
remains and simply has an end date.`,
    dated: true,
    example: true,
  },
  {
    id: 'person-replaced',
    area: 'People',
    what: 'A replacement starts immediately, in the same position',
    who: 'Admin, or an HR role',
    when: `Added with their own start date and given the position. Work in progress is reassigned to
them from that date. No waiting, no release, no developer.`,
    past: `Work completed under the previous person stays credited to the previous person. Two people
held the same position at different times, and every record knows which one applied when.`,
    dated: true,
    example: true,
  },
  {
    id: 'rate',
    area: 'People',
    what: 'A pay rate, a piece rate or a salary changes',
    who: 'Admin, or an HR role',
    when: 'Applies from the date you set — which may be today, a future date, or a past one you are correcting.',
    past: `Every completed period recalculates to the rate that applied then, not the new one. This is
the single most important line in this register: a rate that silently applied backwards would change
payments already made to real people.`,
    dated: true,
  },
  {
    id: 'role',
    area: 'People',
    what: 'What somebody is allowed to see and do',
    who: 'Admin',
    when: 'Takes effect on their next action. Screens they may no longer open stop opening.',
    past: 'Everything they did while they held the old permissions stays recorded, with the permissions they had at the time.',
    dated: true,
  },

  /* ── the shape of the business ────────────────────────────────────────── */
  {
    id: 'company',
    area: 'Structure',
    what: 'A new company is opened, or an existing one is closed',
    who: 'Admin',
    when: `It exists immediately with its own name, trading name, code and document numbering. The
group view includes it from that date.`,
    past: 'Group figures for earlier periods are unchanged, because the company did not exist in them.',
    dated: true,
  },
  {
    id: 'channel',
    area: 'Structure',
    what: 'A new way of selling is added — a marketplace, a shop, a counter, an export desk',
    who: 'Admin',
    when: 'Orders can arrive through it the same day. It appears in every report that breaks figures down by channel.',
    past: 'Earlier reports keep their own columns. A channel that did not exist then does not appear then.',
    dated: true,
  },
  {
    id: 'location',
    area: 'Structure',
    what: 'A godown, a shop, a unit or a stock point is added, renamed or closed',
    who: 'Admin',
    when: 'Stock can move to and from it immediately.',
    past: 'Stock movements already recorded keep pointing at it, under the name it had at the time.',
    dated: true,
  },
  {
    id: 'modules-on',
    area: 'Structure',
    what: 'Which parts of the system this business uses at all',
    who: 'Admin',
    when: `Turned on, a module appears in the menu with its screens ready. Turned off, it disappears
from the menu. A steel plant, a clothing brand and a single creator each end up with a different
system built from identical code.`,
    past: 'Turning a module off hides its screens and keeps its records. Nothing is destroyed by tidying a menu.',
    dated: false,
  },

  /* ── your words, your fields, your paperwork ──────────────────────────── */
  {
    id: 'vocabulary',
    area: 'Your words',
    what: 'What the system calls things',
    who: 'Admin',
    when: `Every screen, every report and every document changes wording at once. One business says
order, another says job, another says matter, consignment, batch or booking — the record underneath is
identical.`,
    past: 'Documents already issued keep the wording they were issued with, because that is what the customer received.',
    dated: true,
  },
  {
    id: 'fields',
    area: 'Your words',
    what: 'Extra information you want to record that nobody else needs',
    who: 'Admin',
    when: `Added to the screen immediately, with the type you choose — text, number, date, a list to
pick from, a yes or no. Reportable from the moment it exists.`,
    past: 'Older records simply have no value for it, which is the truth. They are never back-filled with a guess.',
    dated: false,
  },
  {
    id: 'stages',
    area: 'Your words',
    what: 'The steps your work moves through',
    who: 'Admin',
    when: `Add a stage, rename one, reorder them or remove one. New work follows the new list from
that moment.`,
    past: `Work already part-way through keeps the stage it is in, even if that stage has since been
removed — a job does not teleport because somebody edited a list.`,
    dated: true,
  },
  {
    id: 'documents',
    area: 'Your words',
    what: 'The layout and numbering of invoices, statements, labels and reports',
    who: 'Admin',
    when: 'The next document uses the new layout or the new numbering.',
    past: 'Documents already issued are never re-rendered. What the customer holds and what you hold stay identical.',
    dated: true,
  },

  /* ── how the work is done ─────────────────────────────────────────────── */
  {
    id: 'rules-on',
    area: 'Rules',
    what: 'Turning a discretionary rule on or off',
    who: 'Admin',
    when: `Applies to the next transaction. One business requires an approval below a price floor;
another does not — same software, different setting.`,
    past: 'Transactions already posted are not re-judged against a rule that did not apply to them.',
    dated: true,
  },
  {
    id: 'approvals',
    area: 'Rules',
    what: 'Who has to approve what, and above which amount',
    who: 'Admin',
    when: 'The next request follows the new path.',
    past: 'Requests already approved keep the path they went through, and the names of who approved them.',
    dated: true,
  },
  {
    id: 'tax',
    area: 'Rules',
    what: 'Tax rates and the categories they attach to',
    who: 'Admin, or an accounts role',
    when: 'Applies from its effective date, which for tax is set by law rather than by you.',
    past: `Every invoice keeps the rate that applied on its own date. A return filed for an earlier
period recalculates to that period’s rate — this is not a convenience, it is the only correct
behaviour.`,
    dated: true,
  },
  {
    id: 'providers',
    area: 'Rules',
    what: 'Which outside service is used for messages, payments, delivery or artificial intelligence',
    who: 'Admin',
    when: 'The next message, payment or shipment goes through the new one.',
    past: 'Everything already sent keeps the record of which service carried it, which is what you need when you query one.',
    dated: true,
  },
  {
    id: 'ceiling',
    area: 'Rules',
    what: 'The most the system may spend on paid outside services',
    who: 'Admin',
    when: 'Enforced immediately. Over the ceiling, the paid option is refused and the work completes on one that costs nothing.',
    past: 'Spending already recorded is unchanged.',
    dated: true,
  },
];

/* ── what a tenant may never switch off ───────────────────────────────────
   Short on purpose. Every line is something a bank, an auditor, a customer or an employee
   is relying on, and a setting that can remove it is a setting that can remove their
   protection. A business may change what it calls things; it may not opt out of being
   accountable for its own figures. */
const IMMUTABLE = [
  {
    what: 'The audit trail',
    why: 'Who changed what, and when. A system where this can be switched off cannot be used to answer a dispute, so it cannot be switched off.',
  },
  {
    what: 'Every record naming the company it belongs to',
    why: 'Without it, figures from two companies merge and no report can be trusted again.',
  },
  {
    what: 'One business being unable to read another’s records',
    why: 'This is not a preference. It is the promise that makes a shared platform usable at all.',
  },
  {
    what: 'Money kept as exact whole units',
    why: 'The alternative loses fractions of a rupee in ways nobody can trace afterwards.',
  },
  {
    what: 'Deleting nothing — records are ended, never erased',
    why: 'An erased record changes a period that was already closed, filed and possibly audited.',
  },
  {
    what: 'Never asking for a marketplace, bank or account password',
    why: 'The system connects through proper keys that you can withdraw. A password would hand over an account you cannot take back.',
  },
];

/* THE GATE. An entry that does not answer "what happens to records already made" is the
   entry somebody trusts on the day it matters and discovers was never thought through. */
function check() {
  const bad = [];
  const seen = new Set();
  ENTRIES.forEach((e, i) => {
    const where = `entry ${i + 1} (${e.id || 'no id'})`;
    for (const k of ['id', 'area', 'what', 'who', 'when', 'past']) {
      if (!e[k] || !String(e[k]).trim()) bad.push(`${where}: missing "${k}"`);
    }
    if (typeof e.dated !== 'boolean') bad.push(`${where}: "dated" must say true or false`);
    if (seen.has(e.id)) bad.push(`${where}: duplicate id`);
    seen.add(e.id);
    if (/[a-z]'[a-z]/i.test([e.what, e.when, e.past].join(' '))) {
      bad.push(`${where}: straight apostrophe in prose — use the typographic ’`);
    }
  });
  if (!IMMUTABLE.length) bad.push('nothing is marked immutable — then nothing is guaranteed');
  IMMUTABLE.forEach((m, i) => {
    if (!m.what || !m.why) bad.push(`immutable ${i + 1}: needs both what and why`);
  });
  return bad;
}

const areas = () => [...new Set(ENTRIES.map((e) => e.area))];

module.exports = { ENTRIES, IMMUTABLE, check, areas };
