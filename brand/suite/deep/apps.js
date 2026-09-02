'use strict';
/* THE BROWSER APP LIST — one canonical answer, because a second one would drift.
 *
 * This lived inside build_deep.js, which does its whole build at load time. That made the
 * list unreadable by anything else: requiring the file to ask "which apps are there" would
 * rebuild all thirty-six pages as a side effect. So the only way to use it elsewhere was to
 * type it again, and a typed copy of a list is how the count in one place stops matching
 * the count in another — the exact failure modules.js and built.js both exist to prevent.
 *
 * Each entry is:
 *   dir    the source folder under brand/suite/deep/
 *   out    the basename written to brand/suite/deep/out/, once per edition:
 *            <out>_ERP.html         the neutral product edition
 *            <out>_Vastrangam.html  the trade edition
 *   title  what the app is called, spelled as modules.js spells it wherever the two meet
 *   libs   shared modules this app's page needs, if any
 */

const APPS = [
  { dir: 'd2c',         out: 'd2c',         title: 'D2C Sales' },
  { dir: 'b2b',         out: 'b2b',         title: 'B2B & Credit' },
  { dir: 'export',      out: 'export',      title: 'Export' },
  { dir: 'pos',         out: 'pos',         title: 'POS' },
  { dir: 'quotes',      out: 'quotes',      title: 'Quotes & Proforma' },
  { dir: 'crm',         out: 'crm',         title: 'CRM & Customer 360', libs: ['m04lib.js', 'm04views.js'] },
  { dir: 'docs',        out: 'docs',        title: 'Documents & eSign', libs: ['m04lib.js', 'm04views.js'] },
  { dir: 'helpdesk',    out: 'helpdesk',    title: 'Helpdesk & Live Chat', libs: ['m04lib.js', 'm04views.js'] },
  { dir: 'm04unified',  out: 'm04',         title: 'Module 04 \u00b7 CRM', libs: ['m04lib.js', 'm04views.js', '../xlsx.js'] },
  { dir: 'dashboard',   out: 'dashboard',   title: 'CEO Dashboard', libs: ['m21lib.js', 'm21views.js'] },
  { dir: 'reports',     out: 'reports',     title: 'Report Builder', libs: ['m21lib.js', 'm21views.js'] },
  { dir: 'groupcons',   out: 'groupcons',   title: 'Group Consolidation', libs: ['m21lib.js', 'm21views.js'] },
  { dir: 'm21unified',  out: 'm21',         title: 'Module 21 · Dashboard & BI', libs: ['m21lib.js', 'm21views.js', '../xlsx.js'] },
  { dir: 'procurement', out: 'procurement', title: 'Procurement' },
  { dir: 'vendors',     out: 'vendors',     title: 'Vendor Management' },
  { dir: 'oms',         out: 'oms',         title: 'Marketplace OMS' },
  { dir: 'ordman',      out: 'ordman',      title: 'Order Management' },
  { dir: 'askprint',    out: 'askprint',    title: 'Ask & Print' },
];

module.exports = APPS;
