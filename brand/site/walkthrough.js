'use strict';
/* THE WALKTHROUGH — the content, once, for two very different renderers.

   WHY THIS IS ITS OWN FILE
   The walkthrough was written inline in mklanding.js as markdown. Then the styled website needed
   it too, and there were exactly two options: write the same prose a second time as HTML in
   build.js, or move it somewhere both can read. The first is a second copy of the same facts, and
   the day one of them is corrected is the day the page and the document start telling a reader
   different things — which is the failure this whole repository is arranged to prevent.

   So the content lives here as structure, and the two renderers turn it into their own medium:

     mklanding.js  → markdown: mermaid fences, ![](shots/mNN.png), ### headings
     build.js      → styled HTML: the .fb/.ar chip strip, and the real screen drawn by uishot.js

   TWO REPRESENTATIONS OF EACH FLOW, ON PURPOSE
   A `flow` section carries BOTH a `mermaid` string and a `steps` list. That looks like duplication
   and is not quite: the markdown medium can draw a decision diamond and a loop-back arrow, and the
   chip strip on the website cannot. Generating one from the other would mean throwing away the
   branch. They sit in the same object so they cannot drift apart unseen, and check() below asserts
   that every chip label still appears in the mermaid it belongs to.

   SECTION KINDS
     head   a sub-heading
     prose  a paragraph
     flow   heading + mermaid (markdown) + steps (website)
     step   one module of the walkthrough: its number, a title, a paragraph, and its screen
*/

/** Both editions. `ctx` supplies what the text needs to stay derived rather than typed:
 *    ctx.nmod   the module count
 *    ctx.word   (packId, concept) → that trade's word, read from core/packs/ */
function sections(edition, ctx) {
  const w = (ctx && ctx.word) || ((_id, c) => c);
  const nmod = (ctx && ctx.nmod) || 22;
  return edition === 'vastrangam' ? vastrangam(w, nmod) : medhava(w, nmod);
}

const TITLE = 'How you actually use it — a walkthrough';

/* ── the neutral edition ─────────────────────────────────────────────────────
   This reader is choosing a trade and has not started. */
function medhava(word, nmod) {
  return {
    title: TITLE,
    intro: [
      `The sections above say what Medhava is. This one follows a person through it, because "${nmod}\nmodules over one shared data core" is a true sentence that tells you nothing about your Tuesday.`,
      `Every screen below is a real render of the software, not an artist's impression — the same markup\nand the same stylesheet the product uses. The figures on them are illustrative.`,
    ],
    sections: [
      { kind: 'flow',
        heading: 'Day one — from signing up to working, without a consultant',
        steps: ['Sign up, say your trade', 'The pack loads your words',
          'Import a spreadsheet', 'Validation before anything commits',
          'Opening balances, people, roles', 'Live'],
        mermaid: `flowchart LR
  classDef s fill:#EAF6F3,stroke:#2E8B76,color:#123C34;
  classDef g fill:#FFF7E8,stroke:#B08343,color:#4A3210;
  A["sign up<br/>say your trade"]:::s --> B["the pack loads<br/>your words · your stages<br/>your documents"]:::s
  B --> C["import a spreadsheet<br/>customers · suppliers · items"]:::s
  C --> D{"validation report<br/>BEFORE anything commits"}:::g
  D -->|"errors to fix"| C
  D -->|"clean"| E["opening balances,<br/>invite people, set roles"]:::s
  E --> F["live"]:::s` },
      { kind: 'prose',
        text: `Nothing is blank when you arrive. Pick manufacturing and the system says ${word('manufacturing', 'order')};\npick professional services and the same screen says ${word('professional-services', 'order')}; pick\nthe clinic pack and it says ${word('healthcare-clinic', 'order')}. Same columns underneath, every time.` },

      { kind: 'head', text: 'A day in the life — one order, followed all the way' },
      { kind: 'step', mod: '15', title: 'An order arrives',
        body: `It lands in one queue with every other channel's orders, sorted by the time **left** on its cut-off rather than the time it arrived. The order that must leave in forty minutes is above the one that came in first and has all day.` },
      { kind: 'step', mod: '03', title: 'Stock moves — everywhere at once',
        body: `One number per SKU. The unit that just sold disappears from every other channel in the same instant, which is the only way to stop the cancellation that costs you a seller rating.` },
      { kind: 'step', mod: '10', title: 'It gets picked and packed',
        body: `A pick list in walking order, confirmed against the bin it came from. A short pick stops the pack rather than quietly reducing the order — because an order silently shipped short is a claim you will pay for later.` },
      { kind: 'step', mod: '11', title: 'It ships, and the money is chased',
        body: `The courier rate is checked against the packed weight before booking, and cash collected at the door stays a receivable until it is actually remitted to your bank.` },
      { kind: 'step', mod: '12', title: 'The books post themselves',
        body: `Revenue and tax go through one posting engine. Entries balance or they do not post — there is no third option, and no month-end scramble to find out which.` },
      { kind: 'step', mod: '14', title: 'Weeks later, the payout is checked',
        body: `What the channel said it would pay, against what arrived, line by line. A shortfall is named and claimed before the window to claim it closes.` },

      { kind: 'head', text: 'The same day, in three trades that have nothing in common' },
      { kind: 'prose', text: 'This is the whole argument, and it is easier to see than to read:' },
      { kind: 'step', mod: '20', title: 'A law practice runs matters',
        body: `Same record, same columns, same ledger underneath. A ${word('professional-services', 'order')} instead of an order, a ${word('professional-services', 'person')} instead of an operator, hours instead of units.` },
      { kind: 'step', mod: '19', title: 'A clinic runs appointments',
        body: `A ${word('healthcare-clinic', 'customer')} instead of a customer, an ${word('healthcare-clinic', 'order')} instead of an order, a ${word('healthcare-clinic', 'person')} instead of a salesman.` },
      { kind: 'step', mod: '13', title: 'A restaurant group watches its cash',
        body: `Four sites, one cash position, fourteen days ahead. No stock module was removed and no code was forked to make any of these three work.` },

      { kind: 'flow',
        heading: 'Month end',
        steps: ['Returns inspected', 'Payouts matched to the paise', 'Trial balance',
          'Period locked', 'Group = sum − inter-company'],
        mermaid: `flowchart TB
  classDef s fill:#EAF6F3,stroke:#2E8B76,color:#123C34;
  classDef g fill:#FFF7E8,stroke:#B08343,color:#4A3210;
  R["returns inspected<br/>and settled"]:::s --> S["channel payouts<br/>matched to the paise"]:::s
  S --> T["trial balance"]:::s
  T --> U{"does it tie?"}:::g
  U -->|"no"| V["the entry that broke it<br/>is named, not hunted"]:::g
  U -->|"yes"| W["period locked<br/>returns generated from vouchers"]:::s
  W --> X["the group figure:<br/>sum − inter-company trade"]:::s` },
      { kind: 'prose',
        text: 'Then the next month opens, and nothing about the close depended on anybody remembering to run it.' },
    ],
  };
}

/* ── the trade edition ───────────────────────────────────────────────────────
   Deliberately NOT the neutral one with the nouns changed. This reader is not choosing an
   industry from a menu, they are moving a working house onto the system with three companies,
   nine panels and a payroll that pays by the piece. The starting point, the hard step and the
   thing that matters at month end are all different, so the narrative is different. */
function vastrangam(_word, nmod) {
  return {
    title: TITLE,
    intro: [
      `Everything above says what the system is. This follows a design through it, because "${nmod} modules\nover one shared data core" is a true sentence that tells you nothing about your Tuesday.`,
      `Every screen below is a real render of the software, not an artist's impression — the same markup\nand the same stylesheet the product uses. The figures on them are illustrative.`,
    ],
    sections: [
      { kind: 'head', text: 'Where you are starting from' },
      { kind: 'prose',
        text: `You are not starting empty, and that is the whole difference. There is a working house here: three\ncompanies, nine panels, a counter, an export book and people who are paid by the piece. So the first\nmonth is a **parallel run**, not a switch that gets thrown.` },
      { kind: 'flow',
        heading: '',
        steps: ['Masters first', 'Opening balances at the cutover',
          'One month in BOTH sets of books', 'They agree to the paise',
          'The old system goes read-only'],
        mermaid: `flowchart LR
  classDef s fill:#EAF6F3,stroke:#2E8B76,color:#123C34;
  classDef g fill:#FFF7E8,stroke:#B08343,color:#4A3210;
  A["masters first<br/>designs · parties · mills"]:::s --> B["opening balances<br/>as at the cutover date"]:::s
  B --> C["one month run in BOTH<br/>the old books and these"]:::s
  C --> D{"do they agree,<br/>to the paise?"}:::g
  D -->|"no — the difference<br/>is named, not argued"| C
  D -->|"yes"| E["the old system<br/>becomes read-only"]:::s` },
      { kind: 'prose',
        text: `The gate is that the two agree **to the paise**, and where they do not, the reason is named rather\nthan the number quietly adjusted. A cutover that cannot reproduce last month is not a cutover.` },

      { kind: 'head', text: 'A day in the life — one design, followed to the money' },
      { kind: 'step', mod: '15', title: 'It sells on a panel',
        body: `Nine panels land in one queue. It is sorted by the time **left** on the cut-off, not by when it arrived — so the Myntra order that has to leave in forty minutes sits above the one that came in this morning and has all day.` },
      { kind: 'step', mod: '03', title: 'The design record moves',
        body: `One design, one stock number, and each panel's own code for it mapped to yours. The piece that just sold is gone from every other panel in the same instant, which is the only thing that stops the cancellation a seller rating is lost to.` },
      { kind: 'step', mod: '10', title: 'It is picked in the godown',
        body: `A wave in walking order, zone A to C, confirmed against the bin it came from. A short pick stops the pack rather than quietly shipping the order light.` },
      { kind: 'step', mod: '11', title: 'It goes to the courier',
        body: `The rate is checked against the packed weight before booking — which is where weight disputes are won — and COD collected at the door stays a receivable until it is actually in the bank.` },
      { kind: 'step', mod: '12', title: 'The books post themselves',
        body: `Revenue and GST through one posting engine. Entries balance or they do not post. There is no third option and no month-end hunt for the one that did not.` },
      { kind: 'step', mod: '14', title: 'Weeks later, the panel pays',
        body: `What the panel said it would pay against what actually arrived, cycle by cycle. A shortfall is named and claimed inside the window, instead of being noticed a quarter later when it can no longer be claimed.` },

      { kind: 'head', text: 'The month that pays people' },
      { kind: 'prose', text: 'This is the part most systems get wrong, and it is worth its own step.' },
      { kind: 'step', mod: '16', title: 'Staff and karigars in one register',
        body: `Monthly salary and per-piece earnings sit in the same register, with attendance driving both. **Sets are pooled across every karigar before the minimum is taken** — count the sets per karigar row and add them up, and every set completed by two people between them disappears. A missing rate posts zero and is flagged by name; it is never guessed, because a guessed rate is a wrong payment to a real person.` },
      { kind: 'prose',
        text: `The document a payout is discussed from carries the **rules**, never the roster: the formula, the\nthresholds and the reason, with no individual's pay attached to a shared file.` },

      { kind: 'flow',
        heading: 'Month end',
        steps: ['Returns inspected', 'Panel settlements matched', 'Trial balance per company',
          'Period locked', 'Group = the three, minus inter-company'],
        mermaid: `flowchart LR
  classDef s fill:#EAF6F3,stroke:#2E8B76,color:#123C34;
  classDef g fill:#FFF7E8,stroke:#B08343,color:#4A3210;
  A["returns inspected —<br/>courier, customer, wrong"]:::s --> B["panel settlements<br/>matched to the paise"]:::s
  B --> C["trial balance,<br/>per company"]:::s
  C --> D{"does it tie?"}:::g
  D -->|"no"| E["the entry that broke it<br/>is named, not hunted"]:::g
  D -->|"yes"| F["period locked"]:::s
  F --> G["group = the three added up,<br/>MINUS what you sold yourselves"]:::s` },
      { kind: 'step', mod: '13', title: 'What the money is doing next',
        body: `Receipts due, payments committed, and the fortnight ahead — so a festive buy is decided against the cash that will actually exist, not the cash in the account this morning.` },
      { kind: 'step', mod: '21', title: 'And the group figure, honestly',
        body: `Each company's books are its own and balance on their own. Selling from one company to another is revenue in one set and cost in the other, so adding the three up would report a turnover the group never earned outside. Every inter-company entry is eliminated, and you are shown all three numbers — gross, eliminated, group — rather than asked to trust the last one.` },
      { kind: 'prose',
        text: 'Then the next month opens, and nothing about the close depended on anybody remembering to run it.' },
    ],
  };
}

/** Structural check. The two representations of a flow are written by hand and could drift; this
 *  asserts every chip label still corresponds to something in the mermaid it sits beside, by
 *  matching on the label's first significant word. Returns a list of problems, empty when clean. */
function check() {
  const problems = [];
  ['medhava', 'vastrangam'].forEach((ed) => {
    const w = sections(ed, { nmod: 22, word: (_i, c) => c });
    if (!w.title || !w.intro.length) problems.push(`${ed}: no title or intro`);
    w.sections.forEach((s, i) => {
      const at = `${ed} section ${i + 1} (${s.kind})`;
      if (s.kind === 'flow') {
        if (!s.mermaid || !s.steps || !s.steps.length) { problems.push(`${at}: flow needs both mermaid and steps`); return; }
        const flat = s.mermaid.toLowerCase();
        s.steps.forEach((label) => {
          const key = String(label).toLowerCase().replace(/[^a-z ]/g, ' ').trim().split(/\s+/)
            .find((t) => t.length > 3);
          if (key && !flat.includes(key)) {
            problems.push(`${at}: chip "${label}" has drifted from the mermaid beside it`);
          }
        });
      }
      if (s.kind === 'step' && (!s.mod || !s.title || !s.body)) problems.push(`${at}: incomplete`);
      if (s.kind === 'prose' && !s.text) problems.push(`${at}: empty`);
      if (s.kind === 'head' && !s.text) problems.push(`${at}: empty heading`);
    });
  });
  return problems;
}

module.exports = { sections, check, TITLE };
