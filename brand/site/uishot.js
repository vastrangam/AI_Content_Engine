'use strict';
/* THE LIVE-LOOKING PRODUCT SCREEN — one renderer, used everywhere.

   A module described only in prose asks the reader to picture the software. A screen with
   real figures on it does the explaining instead — which is the single biggest thing the
   professional suites do that a plain feature list does not.

   WHY THIS IS ITS OWN FILE
   These two functions lived inside build.js, which exports nothing, so the website was the
   only thing on earth that could draw a shots.js screen. The moment a second place needed one
   — the markdown documents, which had no pictures at all — the choice was to require this or
   to write a second renderer beside it. A second renderer is two things that must be kept
   looking identical by hand, and they never stay identical: the day someone adds a column to
   the window chrome, one of them gets it.

   So there is one. build.js requires it, brand/delivery/website/mkshots.js requires it, and a
   screenshot in a PDF is therefore the same markup the website ships rather than a lookalike.
   The styling is brand/site/site.css in both cases, for the same reason.

   The shape of `s` is documented at the head of brand/site/shots.js:
     s = { t: window title,
           k: [[label, value, tone]]   tone: '' | g good | r bad | a watch
           c: [column headings],
           r: [[cells…]]               a cell may be ['text','tone'] for a chip
           b: [[label, percent]] }     the small bar block, optional
*/

/** One table cell. An array cell becomes a status chip rather than plain text. */
const cell = c => Array.isArray(c)
  ? `<td><span class="ug ${c[1]||''}">${c[0]}</span></td>` : `<td>${c}</td>`;

/** One product screen: window bar, KPI tiles, the table, and the bar block if it has one. */
const oneShot = s => `<div class="ui">
  <div class="uibar"><i class="d1"></i><i class="d2"></i><i class="d3"></i><span>${s.t}</span></div>
  <div class="uibody">
   <div class="uik">${s.k.map(k=>`<div class="uikc ${k[2]||''}"><span class="l">${k[0]}</span><span class="v">${k[1]}</span></div>`).join('')}</div>
   <div class="uitw"><table class="uit"><thead><tr>${s.c.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${s.r.map(r=>`<tr>${r.map(cell).join('')}</tr>`).join('')}</tbody></table></div>
   ${s.b ? `<div class="uib">${s.b.map(b=>`<div class="uibr"><span>${b[0]}</span><i><b style="width:${b[1]}%"></b></i><em>${b[1]}%</em></div>`).join('')}</div>` : ''}
  </div>
 </div>`;

module.exports = { cell, oneShot };
