'use strict';
/* PLAIN WORDS — every technical term explained once, the same way, everywhere.
 *
 * WHY THIS FILE EXISTS
 * These documents are read by people who run businesses, not by engineers. A word like
 * "cache" or "row-level security" means nothing to somebody buying software, and a document
 * that uses it without explaining it has stopped communicating and started performing.
 *
 * Explaining it in each document separately produces three slightly different explanations of
 * the same thing, and the day one is improved the others quietly become the worse ones. So
 * every term is explained HERE, once, and every generator pulls from here.
 *
 * THE SHAPE
 *   term      the word as it appears in the documents
 *   plain     one sentence, no jargon, understandable with zero technical background
 *   hinglish  the same idea as an everyday analogy, where an analogy genuinely helps.
 *             Not decoration — it is there because a picture from ordinary life lands
 *             faster than a definition. Left empty when a plain sentence is already clear
 *             and an analogy would only add noise.
 *
 * THE RULE THE GENERATORS ENFORCE
 * A document may not use a term from this list without explaining it on FIRST use. Not every
 * use — that would make a document unreadable — but the first, so nobody meets a word cold.
 * checkwords() finds a term used in a document that was never explained there.
 *
 * Straight apostrophes read wrong in the PDF; use the typographic ’ in prose.
 */

const WORDS = [
  /* ── the thing itself ─────────────────────────────────────────────────── */
  {
    term: 'platform',
    plain: 'One piece of software that many separate businesses use at the same time, each seeing only its own information.',
    hinglish: 'Ek badi building jisme bahut saare offices hain. Building ek hai, par har office ki chaabi alag — koi kisi aur ke office mein nahin ghus sakta.',
  },
  {
    term: 'tenant',
    plain: 'One business using the platform. Its people, its data and its settings are its own.',
    hinglish: 'Us building mein ek office. Aapka office, aapka saamaan, aapka taala.',
  },
  {
    term: 'module',
    plain: 'One area of work in the system — sales, purchase, staff, accounts. Each is a set of screens that belong together.',
    hinglish: 'Dukaan ke alag-alag counters. Ek counter bikri ka, ek kharidi ka, ek hisaab-kitaab ka.',
  },
  {
    term: 'industry pack',
    plain: 'A settings file that teaches the system your trade — what you call things, the stages your work moves through, the documents you issue.',
    hinglish: 'Ek hi machine, alag-alag saancha. Saancha badal do, wahi machine doosri cheez banane lagti hai.',
  },

  /* ── the data layer ───────────────────────────────────────────────────── */
  {
    term: 'database',
    plain: 'Where all the information is kept, arranged so any of it can be found instantly and nothing gets lost.',
    hinglish: 'Ek badi almari jisme har cheez apne fix khaane mein rakhi hai — dhoondhne ke liye poori almari palatni nahin padti.',
  },
  {
    term: 'table',
    plain: 'One kind of information inside the database — all your customers in one, all your orders in another.',
    hinglish: 'Almari ka ek khaana. Ek khaane mein sirf customers, doosre mein sirf orders.',
  },
  {
    term: 'row',
    plain: 'One single record — one customer, one order, one payment.',
    hinglish: 'Register mein ek line. Ek line matlab ek entry.',
  },
  {
    term: 'schema',
    plain: 'The written plan of what information the system keeps and how the pieces connect.',
    hinglish: 'Makaan ka naksha. Deewar uthane se pehle kaagaz pe tay hota hai kaunsa kamra kahaan hai.',
  },
  {
    term: 'row-level security',
    plain: 'A lock inside the database itself, so one business physically cannot read another business’s records — even if the software above it has a bug.',
    hinglish: 'Taala darwaze pe nahin, tijori pe. Guard so bhi jaaye toh bhi tijori band rehti hai.',
  },
  {
    term: 'migration',
    plain: 'A recorded change to the shape of the database, so every copy of the system can be updated the same way, in the same order.',
    hinglish: 'Naksha badla toh likh ke rakha — taaki har site pe wahi badlav, usi tarike se ho.',
  },
  {
    term: 'backup',
    plain: 'A copy of everything, kept somewhere else, so a mistake or a failure does not lose your work.',
    hinglish: 'Zaroori kaagzaat ki photocopy, doosri jagah rakhi hui. Asli jal jaaye toh bhi kaam nahin rukta.',
  },
  {
    term: 'cutover',
    plain: 'The moment the business stops using the old way of working and starts using the new one for real.',
    hinglish: 'Woh din jab purana tarika band aur naya shuru — ab asli kaam nayi jagah pe hoga.',
  },
  {
    term: 'integer paise',
    plain: 'Money stored as a whole number of paise instead of a decimal, so amounts are exact and rounding can never quietly lose a rupee.',
    hinglish: 'Paisa hamesha poore paise mein ginte hain, aadha-adhoora kabhi nahin — isliye hisaab kabhi ek rupya idhar-udhar nahin hota.',
  },
  {
    term: 'effective date',
    plain: 'The date a change starts applying from. Records made before it keep the old value; records after it use the new one.',
    hinglish: 'Naya rate 1 tarikh se lagu. Purane mahine ka bill purane rate se hi banega — woh apne aap nahin badlega.',
  },
  {
    term: 'audit trail',
    plain: 'An automatic record of every change — what changed, who changed it, and when.',
    hinglish: 'Har entry ke saath naam aur time apne aap likha jaata hai. Baad mein koi bole "maine nahin kiya", toh register bata deta hai.',
  },

  /* ── the moving parts ─────────────────────────────────────────────────── */
  {
    term: 'backend',
    plain: 'The part of the software you never see, which does the actual work — checks the rules, saves the records, calculates the totals.',
    hinglish: 'Hotel ka kitchen. Customer nahin dekhta, par khaana wahin banta hai.',
  },
  {
    term: 'frontend',
    plain: 'The part you see and click — the screens, the buttons, the forms.',
    hinglish: 'Hotel ka dining hall aur menu card. Jo aapke saamne hai.',
  },
  {
    term: 'API',
    plain: 'The agreed way two pieces of software talk to each other, so one can ask the other for something and get a predictable answer.',
    hinglish: 'Waiter. Aap kitchen mein nahin jaate — waiter ko order dete ho, wahi khaana le aata hai. Waiter badal jaaye toh bhi order dene ka tarika wahi rehta hai.',
  },
  {
    term: 'interface',
    plain: 'A written promise about what a part of the system does, without saying which product does it — so the product underneath can be swapped without anything above noticing.',
    hinglish: 'Bijli ka socket. Socket ka size fix hai; usme koi bhi company ka plug lag jaata hai.',
  },
  {
    term: 'adapter',
    plain: 'A small piece of code that translates between the system and one outside service, so the rest of the system never has to know which service is in use.',
    hinglish: 'Travel adapter. Andar ka appliance wahi, bas plug ko us desk ke socket ke hisaab se badal diya.',
  },
  {
    term: 'storage',
    plain: 'Where files are kept — photographs, invoices, scanned documents. Different from the database, which keeps information rather than files.',
    hinglish: 'Almari ke bagal wala godown. Register almari mein, par bade dabbe aur photo godown mein.',
  },
  {
    term: 'cache',
    plain: 'A small, fast copy of information that was just looked up, kept ready in case it is asked for again.',
    hinglish: 'Counter pe rakha hua sabse zyada bikne wala saamaan. Har baar godown tak jaana nahin padta.',
  },
  {
    term: 'queue',
    plain: 'A waiting line for work that does not have to finish this second — sending a hundred messages, building a big report.',
    hinglish: 'Darzi ki dukaan ka parchi system. Kaam parchi pe likh ke lag gaya line mein; customer khada intezaar nahin karta.',
  },
  {
    term: 'job',
    plain: 'One piece of work taken off the queue and done in the background.',
    hinglish: 'Line mein se uthayi gayi ek parchi, ab uska kaam ho raha hai.',
  },
  {
    term: 'search index',
    plain: 'A prepared list that makes finding things fast, the way the index at the back of a book beats reading every page.',
    hinglish: 'Kitaab ke peeche wali index. Poori kitaab padhne ki zaroorat nahin, seedha page number mil jaata hai.',
  },

  /* ── running it ───────────────────────────────────────────────────────── */
  {
    term: 'environment',
    plain: 'A separate running copy of the system — one for trying things, one that customers actually use.',
    hinglish: 'Rehearsal aur asli show. Practice alag jagah, taaki galti sabke saamne na ho.',
  },
  {
    term: 'deployment',
    plain: 'Putting a new version of the software in place so people start using it.',
    hinglish: 'Nayi dukaan kholna ya purani ko naya roop dena — jab tak shutter nahin uthta, customer ko farq nahin padta.',
  },
  {
    term: 'continuous integration',
    plain: 'A robot that checks every change automatically, before anyone can put it live.',
    hinglish: 'Quality-check wala banda gate pe khada. Har maal nikalne se pehle usse guzarta hai.',
  },
  {
    term: 'rollback',
    plain: 'Putting the previous working version back, quickly, when a new one turns out to be wrong.',
    hinglish: 'Naya taala kharab nikla toh purana taala wapas laga do — do minute ka kaam.',
  },
  {
    term: 'observability',
    plain: 'Being able to see what the system is doing and what went wrong, without guessing.',
    hinglish: 'Dukaan mein CCTV aur register. Kuch gadbad ho toh dekh sakte ho ki hua kya, andaaza nahin lagana padta.',
  },
  {
    term: 'uptime',
    plain: 'How much of the time the system is actually working and reachable.',
    hinglish: 'Dukaan mahine mein kitne din khuli rahi. Band rahi toh customer wapas chala gaya.',
  },

  /* ── the AI side ──────────────────────────────────────────────────────── */
  {
    term: 'model',
    plain: 'The piece of artificial intelligence that reads or writes text, tags a photograph, or answers a question.',
    hinglish: 'Ek bahut padha-likha assistant. Kaam accha karta hai, par har baat pe usse poochho toh kharcha aur waqt dono lagta hai.',
  },
  {
    term: 'provider',
    plain: 'A company whose service the system uses — for messages, for payments, for artificial intelligence, for delivery.',
    hinglish: 'Supplier. Ek supplier maal na de toh doosre se le lo — kaam nahin rukna chahiye.',
  },
  {
    term: 'fallback',
    plain: 'The next option the system automatically moves to when the first one fails or is unavailable.',
    hinglish: 'Bijli gayi toh inverter. Inverter gaya toh mombatti. Andhera kabhi nahin hota.',
  },
  {
    term: 'spend ceiling',
    plain: 'A maximum amount the system is allowed to spend on paid services, after which it refuses to spend more instead of warning you.',
    hinglish: 'Jeb mein utne hi paise leke nikle jitna kharch karna hai. Khatam matlab khatam — udhaar nahin.',
  },
  {
    term: 'circuit breaker',
    plain: 'A switch that takes a repeatedly failing service out of use for a while, instead of retrying it endlessly and slowing everything down.',
    hinglish: 'Ghar ka MCB. Baar-baar fault aa raha hai toh woh line hi kaat deta hai, poora ghar band nahin hota.',
  },

  /* ── people and access ────────────────────────────────────────────────── */
  {
    term: 'role',
    plain: 'What a person is allowed to see and do — a manager sees more than a counter staff member.',
    hinglish: 'Chaabi ka guccha. Manager ke paas zyada chaabiyaan, staff ke paas kam.',
  },
  {
    term: 'permission',
    plain: 'One specific thing a role is allowed to do, like approving a discount or viewing salaries.',
    hinglish: 'Guchhe ki ek chaabi. Ek chaabi ek darwaza.',
  },
  {
    term: 'authentication',
    plain: 'Proving you are who you say you are, usually by signing in.',
    hinglish: 'Gate pe pehchaan dikhana. "Main kaun hoon" wala sawaal.',
  },
  {
    term: 'encryption',
    plain: 'Scrambling information so that even somebody who steals the file cannot read it.',
    hinglish: 'Apni hi code-bhasha mein likhna. Chori bhi ho jaaye toh padha nahin jaata.',
  },
];

/* fast lookup */
const BY_TERM = new Map(WORDS.map((w) => [w.term.toLowerCase(), w]));

/** The explanation for a term, or null if it is not in the glossary. */
function explain(term) {
  return BY_TERM.get(String(term).toLowerCase()) || null;
}

/** Render one term as a document would show it on first use. */
function firstUse(term, opts) {
  const w = explain(term);
  if (!w) return null;
  const hin = (opts && opts.hinglish === false) ? '' : (w.hinglish ? ` *${w.hinglish}*` : '');
  return `**${w.term}** — ${w.plain}${hin}`;
}

/* THE GATE. A document that uses a glossary term it never explains has left a reader behind
   at exactly the word they needed. Returns the terms used but never explained.

   Deliberately conservative about what counts as "used": whole words only, case-insensitive,
   so "modules" counts for "module" but "moderate" does not. And a term is treated as explained
   if its plain sentence appears anywhere in the document, which is what firstUse() emits. */
function checkwords(markdown, opts) {
  const skip = new Set(((opts && opts.skip) || []).map((s) => s.toLowerCase()));
  const missing = [];
  for (const w of WORDS) {
    if (skip.has(w.term.toLowerCase())) continue;
    const used = new RegExp('\\b' + w.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 's?\\b', 'i')
      .test(markdown);
    if (!used) continue;
    /* The first clause of the plain sentence is enough to match on — a generator may wrap
       or re-punctuate the tail, and demanding the whole sentence would make this brittle. */
    const head = w.plain.split(/[,—.]/)[0].trim();
    if (!markdown.includes(head)) missing.push(w.term);
  }
  return missing;
}

module.exports = { WORDS, explain, firstUse, checkwords };
