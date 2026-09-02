'use strict';
/* THE MEDHAVA MARK — drawn to the brand sheet, in one place.

   Every surface draws from this file: the site header, the footer, the favicon, the app icon,
   the product-screen chrome and the shell inside every module app. The logo cannot be updated
   in one place and left stale in another.

   The mark, as the brand sheet defines it:
     · a capital M in one thick stroke, gradient teal → blue → violet, top-left to bottom-right,
       with rounded caps and joins, so it reads as a single gesture
     · three rising bars in the cradle of the M — integration, growth
     · a four-point gold star centred above the valley — insight, clarity

   Two builds, because the sheet has two: the normal one, and the night one where the gold warms
   slightly and the wordmark's "Medh" is white instead of ink. Nothing here uses a raster effect,
   so the mark stays vector — sharp at any zoom, in the browser and in the PDF alike. */

const C = {
  teal:  '#00B09B',
  blue:  '#2563EB',
  violet:'#7C3AED',
  gold:  '#F7B703',
  goldN: '#FFB703',   /* the night gold from the sheet */
  ink:   '#0F172A',
};

/* ── geometry, once, on a 128-unit square ───────────────────────────────────────────────
   The M: left leg up, over the left peak, down to the valley, up over the right peak, down
   the right leg — one continuous stroke. */
const M_STROKE =
  'M18 110V45c0-14 12.5-18.5 20.5-9.5L64 71l25.5-35.5c8-9 20.5-4.5 20.5 9.5v65';

/* three bars rising in the cradle, centred on 64 */
const BARS = [
  'M45 110V95a5 5 0 0 1 10 0v15z',
  'M59 110V86a5 5 0 0 1 10 0v24z',
  'M73 110V77a5 5 0 0 1 10 0v33z',
];

/* a four-point star with concave sides, centred above the valley */
const STAR =
  'M64 2c1.4 10.4 3.1 13.6 13.5 15-10.4 1.4-12.1 4.6-13.5 15-1.4-10.4-3.1-13.6-13.5-15 10.4-1.4 12.1-4.6 13.5-15z';

/* one gradient def per unique id, so several marks on one page never collide */
function grad(id) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${C.teal}"/><stop offset=".5" stop-color="${C.blue}"/>` +
    `<stop offset="1" stop-color="${C.violet}"/></linearGradient>`;
}

/* the bare mark.
     mark(id)                  gradient M and bars, gold star   — the full-colour variation
     mark(id, '#fff')          solid one-colour M, gold star    — for a coloured background
     mark(id, '#fff', '#fff')  solid M and solid star           — the single-colour variation */
function mark(id, solid, starColour, night) {
  const paint = solid || `url(#${id})`;
  return `<svg viewBox="0 0 128 120" fill="none" aria-hidden="true">` +
    (solid ? '' : `<defs>${grad(id)}</defs>`) +
    `<path d="${M_STROKE}" stroke="${paint}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>` +
    BARS.map(d => `<path d="${d}" fill="${paint}"/>`).join('') +
    `<path d="${STAR}" fill="${starColour || (solid ? paint : (night ? C.goldN : C.gold))}"/>` +
    `</svg>`;
}

/* the app icon and the favicon — the mark reversed out of a gradient tile.
   radius 28 gives the rounded square; radius 64 gives the circle. */
function tile(id, radius, night) {
  const r = radius == null ? 28 : radius;
  return `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">` +
    `<defs>${grad(id)}</defs>` +
    `<rect width="128" height="128" rx="${r}" fill="url(#${id})"/>` +
    `<g transform="translate(64 68) scale(.70) translate(-64 -60)">` +
    `<path d="${M_STROKE}" stroke="#fff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>` +
    BARS.map(d => `<path d="${d}" fill="#fff"/>`).join('') +
    `<path d="${STAR}" fill="${night ? C.goldN : C.gold}"/></g></svg>`;
}
const circle = (id, night) => tile(id, 64, night);

/* a data: URI, so the favicon and the app icon need no extra file and can never 404 */
const dataUri = svg => 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/\s+/g, ' ').trim());

module.exports = { C, mark, tile, circle, dataUri, grad, M_STROKE, BARS, STAR };
