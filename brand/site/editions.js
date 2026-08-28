'use strict';
/* WHICH EDITIONS ARE INSTALLED — asked once, in one place.
 *
 * THE DISTINCTION THIS FILE EXISTS TO HOLD
 * MEDHAVA is the PRODUCT. A trade edition — VASTRANGAM today, others later — is a TENANT: one
 * business's vocabulary, its data, its documents and its own engine. The product must build,
 * test and ship with no tenant installed at all, exactly as accounting software ships without any
 * particular customer compiled into it.
 *
 * That was not true, and it was not true in a way nothing could see. A product-only checkout died
 * on `Cannot find module './edition_vastrangam.js'` inside checkneutral.js — the gate that proves
 * the NEUTRAL edition carries no trade vocabulary could not run without a trade's file present.
 * Four generators and gates had the same shape. Measured on a product-only tree built from
 * `git ls-files`, before any of this: 5 of them failed.
 *
 * HOW "INSTALLED" IS DECIDED
 * By the presence of the edition's own overlay file, because that is the thing a trade edition
 * cannot exist without — build.js reads it to produce the edition at all. No registry, no list to
 * keep in step: a trade is installed when its overlay is on disk, and uninstalled when it is not.
 *
 * WHAT CALLERS MUST DO WITH THE ANSWER
 * Skip the tenant's work and SAY SO. Never pass quietly. A gate that silently checks less than it
 * did yesterday is worse than one that fails, because the green tells you the opposite of what
 * happened. Every caller of this file prints "SKIPPED, not passed".
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;

/* The product is always present: it is the thing the repository IS. */
const PRODUCT = 'MEDHAVA';

/* A trade edition is `edition_<name>.js` beside this file. Discovered rather than listed, so
   adding the second tenant is a file, not an edit here — which is the whole claim being made
   about how tenants work. */
function installedTrades() {
  return fs.readdirSync(HERE)
    .filter((f) => /^edition_[a-z0-9_]+\.js$/i.test(f))
    .map((f) => f.replace(/^edition_/, '').replace(/\.js$/, '').toUpperCase())
    .sort();
}

/** Every edition this checkout can actually build, product first. */
function installed() {
  return [PRODUCT, ...installedTrades()];
}

/** Is this edition installed? Unknown names answer false rather than throwing. */
function has(edition) {
  return installed().includes(String(edition || '').toUpperCase());
}

/**
 * Split a list of edition-tagged things into what can be checked and what cannot.
 * Anything with no `edition` is treated as the product's, because an artefact that does not say
 * whose it is belongs to whoever owns the repository.
 */
function partition(items, key = 'edition') {
  const live = [], skipped = [];
  for (const it of items) {
    (has(it[key] || PRODUCT) ? live : skipped).push(it);
  }
  return { live, skipped };
}

/** One line, printed by every caller that skipped something. Never silent. */
function announceSkips(tool, skipped, describe = (i) => i.file || i.id || i.name) {
  if (!skipped.length) return;
  const names = skipped.map(describe).join(', ');
  console.log(`${tool}: ${skipped.length} tenant artefact(s) SKIPPED, not passed — ${names}`);
  console.log(`${tool}: their edition is not installed in this checkout, so there is nothing ` +
              `to check and nothing to write.`);
}

module.exports = { PRODUCT, installed, installedTrades, has, partition, announceSkips };
