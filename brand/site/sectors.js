'use strict';
/* WHICH TRADES THIS PLATFORM ACTUALLY SERVES — the join between what the website SHOWS and what
 * the engine can CONFIGURE.
 *
 * WHY THIS FILE EXISTS
 * checkneutral.js is a word blocklist: `vastrangam`, `adini`, `go4fashion`, `muskan`. It has
 * passed on every build ever run here. It checks VOCABULARY, and it is right to — a trade word in
 * the neutral edition is a real defect. But it cannot see SHAPE, and shape is where the bias
 * actually lives:
 *
 *   - 46 product screens named 12 trades while `core/packs/` held 6 packs. A restaurant group,
 *     a training institute, an interior contractor and an HVAC service firm were each shown a
 *     screen for software that could not be configured to be theirs.
 *   - Module 15 is 11 apps of marketplace e-commerce; a law practice opens none of them.
 *
 * Every one of those passed a neutrality check, because not one of them says a banned word.
 * The four packs were written; the check is what found they were owed.
 *
 * WHAT THIS FILE IS
 * The mapping is DECLARED, never inferred. A string-matcher guessing that "Dairy co-operative"
 * belongs to "Manufacturing" would be this file inventing an answer, and an invented answer is
 * exactly what the rest of this repository refuses. So each trade shown on a screen names the
 * pack that serves it and why — or names no pack, and then checkshape.js fails the build.
 *
 * A NULL PACK IS NOT A CONFIGURATION OPTION. It is a promise the code cannot keep, and the only
 * two honest ways to clear it are: write the pack, or withdraw the screen.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const PACKDIR = path.join(ROOT, 'core', 'packs');

/* ── derived, never typed ─────────────────────────────────────────────────── */

/** Every trade named on a product screen, with the modules that show it. */
function screenSectors() {
  const SHOTS = require('./shots.js');
  const found = new Map();
  Object.entries(SHOTS).forEach(([mod, v]) => {
    (Array.isArray(v) ? v : [v]).forEach((s) => {
      if (!s || typeof s !== 'object' || !s.sector) return;
      if (!found.has(s.sector)) found.set(s.sector, []);
      found.get(s.sector).push(mod);
    });
  });
  return found;
}

/** The packs that exist on disk, by id, with the broad sector each declares. */
function packs() {
  const out = new Map();
  if (!fs.existsSync(PACKDIR)) return out;
  fs.readdirSync(PACKDIR).filter((f) => f.endsWith('.json')).sort().forEach((f) => {
    const p = JSON.parse(fs.readFileSync(path.join(PACKDIR, f), 'utf8'));
    out.set(p.id, { id: p.id, name: p.name, sector: p.sector, file: 'core/packs/' + f });
  });
  return out;
}

/* ── the declared mapping ─────────────────────────────────────────────────────
   `pack` is the id of the pack that configures this trade. `why` says why that pack fits, in a
   sentence somebody can disagree with. `pack: null` means nothing serves it yet, and `why` then
   says what would. */
const SERVED = [
  {
    sector: 'Drone & precision manufacturer', pack: 'manufacturing',
    why: 'Discrete manufacturing — a bill of materials, work orders, routing and quality gates. The pack’s own vocabulary and stages fit without stretching.',
  },
  {
    sector: 'Precision components maker', pack: 'manufacturing',
    why: 'The same discrete-manufacturing shape at a different scale — parts rather than assemblies.',
  },
  {
    sector: 'Dairy co-operative', pack: 'manufacturing',
    why: 'Process manufacturing rather than discrete, and the difference is real — yields and batches rather than units — but the pack’s stages and BOM concepts carry it. If a yield-and-batch pack is written later this moves to it.',
  },
  {
    sector: 'Multi-doctor clinic', pack: 'healthcare-clinic',
    why: 'Written for exactly this: appointments, encounters, practitioners and a patient record.',
  },
  {
    sector: 'Freight forwarder', pack: 'logistics-3pl',
    why: 'Written for exactly this: consignments, legs, hand-offs and proof of delivery.',
  },
  {
    sector: 'Law practice', pack: 'professional-services',
    why: 'A matter is the pack’s central object, billed by time against a client — which is a law practice described precisely.',
  },
  {
    sector: 'Creative agency', pack: 'professional-services',
    why: 'The same shape as a law practice: an engagement, people’s time against it, and a bill. The words differ and the pack renames them; the structure does not.',
  },
  {
    sector: 'Homeware brand · D2C', pack: 'retail-ecommerce',
    why: 'Selling a catalogue to consumers across channels, with returns and settlement — the pack’s subject.',
  },

  {
    sector: 'Restaurant group', pack: 'hospitality-food',
    why: 'Written for this gate. A menu item is a sellable made from a recipe, and the engine already had the concept — R03.3, selling a kit decrements every component — pointed at a carton rather than a plate.',
  },
  {
    sector: 'Training institute', pack: 'education',
    why: 'Written for this gate. Attendance here decides certification rather than pay, and fees arrive before the teaching is delivered, so they sit as a liability until the term is taught.',
  },
  {
    sector: 'Interior contractor', pack: 'construction',
    why: 'Written for this gate. Work is certified against measurement rather than despatch, and part of every certified rupee is withheld as retention long after handover.',
  },
  {
    sector: 'HVAC service firm', pack: 'field-service',
    why: 'Written for this gate. The work happens at the customer’s address, stock lives in a van, and the clock that matters is a response time promised in a contract.',
  },
];

/* ── validity of this file itself ─────────────────────────────────────────── */
function check() {
  const bad = [];
  const seen = new Set();
  const have = packs();

  for (const s of SERVED) {
    if (!s.sector) { bad.push('an entry with no sector'); continue; }
    if (seen.has(s.sector)) bad.push(`${s.sector}: listed twice`);
    seen.add(s.sector);
    if (!s.why || s.why.trim().length < 40) {
      bad.push(`${s.sector}: no real reason — a mapping without one is a guess with a field name`);
    }
    if (s.pack && !have.has(s.pack)) {
      bad.push(`${s.sector}: names pack "${s.pack}", which is not in core/packs/`);
    }
  }
  return bad;
}

module.exports = { SERVED, screenSectors, packs, check, PACKDIR };
