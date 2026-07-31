'use strict';
/* The Medhava mark, in one place. Every surface — site header, footer, favicon, app icon,
   the app shell inside every module — draws from this file, so the logo cannot be updated
   in one place and left stale in another.

   The mark: a bold M drawn as one rounded stroke, a rising bar chart inside it, and a
   four-point gold star above the left peak. Gradient runs teal → blue → violet. */

const C = { teal: '#00b09b', blue: '#2563eb', violet: '#7c3aed', gold: '#f7b703', ink: '#0f172a' };

/* the geometry, once — a 128-unit square */
const M_STROKE = 'M24 106V38c0-3 4-4.4 6-2L64 74l34-38c2-2.4 6-1 6 2v70';
const BARS = [
  'M52 106V88c0-2.2 1.8-4 4-4s4 1.8 4 4v18z',
  'M67 106V78c0-2.2 1.8-4 4-4s4 1.8 4 4v28z',
  'M82 106V66c0-2.2 1.8-4 4-4s4 1.8 4 4v40z',
];
/* a four-point star with concave sides — the "insight" mark */
const STAR = 'M48 6c1.3 12.6 3.4 15.4 16 16.7-12.6 1.3-14.7 4.1-16 16.7-1.3-12.6-3.4-15.4-16-16.7 12.6-1.3 14.7-4.1 16-16.7z';

/* one gradient def per unique id, so several marks on one page never collide */
function grad(id) {
  return `<linearGradient id="${id}" x1=".04" y1="0" x2=".96" y2="1">` +
    `<stop offset="0" stop-color="${C.teal}"/><stop offset=".5" stop-color="${C.blue}"/>` +
    `<stop offset="1" stop-color="${C.violet}"/></linearGradient>`;
}

/* mark(id)            → gradient mark on transparent, gold star
   mark(id,'#fff')     → solid mark in one colour, star included
   mark(id,'#fff','#fff') → solid mark AND solid star (for use on a coloured tile) */
function mark(id, solid, starColour) {
  const fill = solid || `url(#${id})`;
  return `<svg viewBox="0 0 128 128" fill="none" aria-hidden="true">` +
    (solid ? '' : `<defs>${grad(id)}</defs>`) +
    `<path d="${M_STROKE}" stroke="${fill}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>` +
    BARS.map(d => `<path d="${d}" fill="${fill}"/>`).join('') +
    `<path d="${STAR}" fill="${starColour || (solid ? fill : C.gold)}"/>` +
    `</svg>`;
}

/* the app icon / favicon — the mark reversed out of a gradient tile */
function tile(id, radius) {
  return `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">` +
    `<defs>${grad(id)}</defs>` +
    `<rect width="128" height="128" rx="${radius == null ? 28 : radius}" fill="url(#${id})"/>` +
    `<g transform="translate(64 66) scale(.74) translate(-64 -64)">` +
    `<path d="${M_STROKE}" stroke="#fff" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>` +
    BARS.map(d => `<path d="${d}" fill="#fff"/>`).join('') +
    `<path d="${STAR}" fill="${C.gold}"/></g></svg>`;
}
const circle = id => tile(id, 64);

/* a data: URI, so the favicon needs no extra file and can never 404 */
const dataUri = svg => 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/\s+/g, ' ').trim());

module.exports = { C, mark, tile, circle, dataUri, grad, M_STROKE, BARS, STAR };
