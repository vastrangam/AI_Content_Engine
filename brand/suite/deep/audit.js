'use strict';
/* Structural audit of the whole suite. Answers, mechanically, three questions the eye cannot:

     1. IS EVERY APP WIRED TO SOMETHING REAL?  Every "comes from" on every Wiring screen must
        name a module or app that actually exists in the canonical list the website publishes —
        not an invented module, not a renamed one.
     2. DOES THE WIRING AGREE WITH THE PUBLISHED MAP?  The site says which modules each module
        reads from. An app that reads from a module its own module does not declare is drift.
     3. IS THE NO-LOCK-IN RULE HELD IN THE WIRING TOO?  A vendor name may appear on the
        Connectors screen, where it is one choice among many. It may NEVER appear as the source
        of a figure — that is exactly the dependency the rule forbids.

   Plus the ordinary hygiene: every app declares uses[], every capability it declares exists,
   every app id and storage key is unique, and every packaged file is really on disk.

   Run: node audit.js        Exits non-zero on any finding. */
const fs = require('fs'), path = require('path');
const DIR = __dirname, SUITE = path.join(DIR, '..');
const MODULES = require(path.join(SUITE, '..', 'site', 'modules.js'));
const PROVIDERS = require(path.join(SUITE, 'providers.js'));

/* ─── the apps that exist, and which module each belongs to ─── */
const APPS = [
  { dir: 'dashboard', mod: '01', app: 'CEO Dashboard' },
  { dir: 'reports', mod: '01', app: 'Report Builder' },
  { dir: 'crm', mod: '02', app: 'CRM & Customer 360' },
  { dir: 'd2c', mod: '03', app: 'D2C Sales' },
  { dir: 'b2b', mod: '03', app: 'B2B & Credit' },
  { dir: 'export', mod: '03', app: 'Export' },
  { dir: 'pos', mod: '03', app: 'POS' },
  { dir: 'quotes', mod: '03', app: 'Quotes & Proforma' },
  { dir: 'oms', mod: '04', app: 'Marketplace OMS' },
  { dir: 'ordman', mod: '04', app: 'Order Management' },
  { dir: 'askprint', mod: '16', app: 'Ask & Print' },
  /* built ahead of their module, kept building so the engines stay warm */
  { dir: 'procurement', mod: '09', app: 'Procurement', early: true },
  { dir: 'vendors', mod: '09', app: 'Vendor Management', early: true },
];

/* ─── the vocabulary a wiring row is allowed to use ─── */
/* Anything not in here, and not a module or app name, is a source nobody can follow. */
/* Some entries are aliases: a shared entity ('Ledger'), a sub-part a wiring row may name
   directly ('Karigar'), or an area whose app has since moved. Each resolves to the module that
   actually holds the thing, so a wiring row keeps pointing at something real. */
const CORE = {
  /* shared Data Core entities — every module reads and writes these */
  'Catalog': '07', 'Inventory': '07', 'Item master': '07', 'Stock': '07',
  'Ledger': '11', 'Accounting': '11', 'Accounts Receivable': '11', 'Accounts Payable': '11',
  'Invoicing': '11', 'Expenses': '11', 'GST & Tax': '11', 'Finance Reports': '11',
  'Party': '02', 'CRM': '02',
  'Sales': '03', 'Orders': '03', 'Order': '03',
  'OMS': '04', 'E-commerce': '04',
  'Warehouse': '05', 'Logistics': '06', 'Manufacturing': '08',
  'Purchase': '09', 'Procurement': '09',
  'HR': '10', 'Payroll': '10',
  'Settlement': '12', 'Marketing': '13', 'Automation': '13',
  'Payments': '11', 'Platform': '16', 'Documents': '02', 'Helpdesk': '02',
  /* the sub-parts of a module that a wiring row is allowed to name directly */
  'Marketplace': '04', 'Marketplaces': '04', 'Panel': '04',
  'Karigar': '08', 'Quality Control': '08', 'Production': '08',
  'Mill': '09', 'Mill bills': '09', 'Budget': '11', 'Ledger entry': '11',
  'Item': '07', 'Party master': '07', 'Storefront': '03', 'Coupon': '03',
  /* legitimate non-module sources */
  'This app': null, 'All of the above': null, 'Segment': null, 'Tier rules': null,
};
/* Vendor names. Allowed on the Connectors screen; never as the source of a figure. */
const VENDORS = ['BUSY', 'Tally', 'Marg', 'Zoho', 'QuickBooks', 'ERPNext', 'ClearTax',
  'Myntra', 'Flipkart', 'Amazon', 'Ajio', 'Nykaa', 'Meesho', 'JioMart', 'Tata Cliq',
  'Shopify', 'WooCommerce', 'Razorpay', 'PayU', 'Cashfree', 'PhonePe', 'Paytm', 'Stripe',
  'CCAvenue', 'Delhivery', 'Blue Dart', 'DTDC', 'XpressBees', 'Shiprocket', 'NimbusPost',
  'n8n', 'Zapier', 'Make', 'Node-RED', 'Claude', 'OpenAI', 'GPT', 'Gemini', 'Ollama',
  'WhatsApp Cloud', 'Gupshup', 'Interakt', 'MSG91', 'Twilio', 'SendGrid', 'Mailgun',
  'Google Drive', 'Dropbox', 'OneDrive', 'Backblaze', 'MinIO', 'Nextcloud'];

const MOD = {}; MODULES.forEach(m => { MOD[m.n] = m; });
const MODNAMES = {}; MODULES.forEach(m => { MODNAMES[m.name] = m.n; });
const APPNAMES = {}; MODULES.forEach(m => (m.apps || []).forEach(a => { APPNAMES[a[0]] = m.n; }));

const findings = [];
const fail = (where, what) => findings.push({ where, what });

function loadCfg(p) {
  const src = fs.readFileSync(p, 'utf8'); const m = { exports: {} };
  const f = new Function('module', 'exports', src + '\nmodule.exports=CONFIG;'); f(m, m.exports);
  return m.exports;
}
const clean = s => String(s).replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/* Resolve one "comes from" phrase to the module it names, or null if nothing in it is known. */
function resolve(raw) {
  /* Parentheses are always a gloss on the thing before them ("Inventory (one shared number)"),
     so they come off first — otherwise a comma inside one splits the phrase in the wrong place. */
  const s = clean(raw).replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim();
  if (/\bthis app\b/i.test(s)) return { mods: [], ok: true };
  /* a phrase may name several sources: "This app + Inventory", "Sales + Purchase + Payroll" */
  const parts = s.split(/\s*(?:\+|·|,|\/|—| and )\s*/).map(p => p.trim()).filter(Boolean);
  const mods = new Set(); let known = false;
  for (const p of parts) {
    const bare = p.replace(/\b(module|itself|feed|rules|master|rate card|vouchers|bills|returns|settlements|commitments|points|odds|filing|floor|list|matrix|route|payroll|invoices)\b/gi, '')
      .replace(/\s+/g, ' ').trim();
    for (const key of [p, bare]) {
      if (!key) continue;
      if (MODNAMES[key]) { mods.add(MODNAMES[key]); known = true; break; }
      if (APPNAMES[key]) { mods.add(APPNAMES[key]); known = true; break; }
      if (CORE[key] !== undefined) { if (CORE[key]) mods.add(CORE[key]); known = true; break; }
    }
  }
  return { mods: [...mods], ok: known };
}

console.log('\n═══ 1 · WIRING VOCABULARY — does every source name something real? ═══');
let rows = 0;
for (const a of APPS) {
  for (const ed of ['config_generic.js', 'config_vastrangam.js']) {
    const p = path.join(DIR, a.dir, ed);
    if (!fs.existsSync(p)) { fail(a.dir + '/' + ed, 'config file missing'); continue; }
    const cfg = loadCfg(p);
    const where = `${a.dir} · ${ed.includes('vas') ? 'Vastrangam' : 'Medhava'}`;
    if (!(cfg.wiring || []).length) fail(where, 'no wiring table at all');
    if (!(cfg.wiringIn || []).length) fail(where, 'no wiringIn table at all');
    for (const w of cfg.wiring || []) {
      rows++;
      /* Two table shapes are in use: {f,s,h} — "this figure comes from there" — and
         {from,to,what} — "this event here flows out to there". Validate whichever it is. */
      const label = w.f !== undefined ? clean(w.f) : clean(w.from);
      const other = w.f !== undefined ? w.s : w.to;
      if (other === undefined) { fail(where, `a wiring row has neither an "s" nor a "to" — it would render an empty cell`); continue; }
      const r = resolve(other);
      if (!r.ok) fail(where, `wiring "${label}" ${w.f !== undefined ? 'comes from' : 'flows to'} "${clean(other)}" — nothing in that phrase names a module or app that exists`);
      const v = VENDORS.filter(x => clean(other).toLowerCase().includes(x.toLowerCase()));
      if (v.length) fail(where, `wiring "${label}" names the vendor ${v.join('/')} in the data map — breaks the no-lock-in rule (vendors belong on Connectors, not here)`);
    }
    for (const w of cfg.wiringIn || []) {
      rows++;
      const r = resolve(w.from);
      if (!r.ok) fail(where, `reads from "${clean(w.from)}" — no such module or app`);
      const v = VENDORS.filter(x => clean(w.from).toLowerCase().includes(x.toLowerCase()));
      if (v.length) fail(where, `reads from the vendor ${v.join('/')} — breaks the no-lock-in rule`);
    }
  }
}
console.log(`  ${rows} wiring rows checked across ${APPS.length} apps × 2 editions`);

console.log('\n═══ 2 · WIRING MAP — does each app read only what its module declares? ═══');
for (const a of APPS) {
  const m = MOD[a.mod];
  if (!m) { fail(a.dir, `belongs to module ${a.mod}, which is not in the canonical list`); continue; }
  if (!(m.apps || []).some(x => x[0] === a.app))
    fail(a.dir, `calls itself "${a.app}" but module ${a.mod} (${m.name}) publishes: ${(m.apps || []).map(x => x[0]).join(' · ')}`);
  /* You may read from anything you also write to — a module that hands work to Logistics
     legitimately reads the delivery outcome back. So the allowed set is reads ∪ writes. */
  const declared = new Set();
  [...(m.reads || []), ...(m.writes || [])].forEach(r => {
    if (r === 'Every module') MODULES.forEach(x => declared.add(x.n));
    else { const rr = resolve(r); (rr.mods || []).forEach(x => declared.add(x)); }
  });
  declared.add(a.mod);                       /* its own module is always fair game */
  declared.add('07'); declared.add('11');    /* Catalog/Inventory and the ledger are the shared core */
  declared.add('16');                        /* the Platform spine — identity, settings, audit */
  const cfg = loadCfg(path.join(DIR, a.dir, 'config_generic.js'));
  for (const w of cfg.wiringIn || []) {
    const r = resolve(w.from);
    for (const md of r.mods || []) {
      if (!declared.has(md))
        fail(`${a.dir} (module ${a.mod})`, `reads from ${MOD[md].name} (${md}), but module ${a.mod} declares reads: ${(m.reads || []).join(', ')}`);
    }
  }
}
console.log(`  every app checked against the reads[] its own module publishes on the website`);

console.log('\n═══ 3 · NO LOCK-IN — capabilities declared, and every one of them real ═══');
const caps = new Set(PROVIDERS.CAPS.map(c => c.id));
const ids = {}, keys = {};
for (const a of APPS) {
  const core = fs.readFileSync(path.join(DIR, a.dir, 'core.js'), 'utf8');
  const m = /uses\s*:\s*\[([^\]]*)\]/.exec(core);
  if (!m) { fail(a.dir, 'core.js declares no uses:[] — the build gate should have caught this'); continue; }
  const declared = m[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
  if (declared.length < 2) fail(a.dir, `declares only ${declared.length} capability`);
  declared.forEach(c => { if (!caps.has(c)) fail(a.dir, `declares capability "${c}", which does not exist in providers.js`); });
  for (const ed of ['config_generic.js', 'config_vastrangam.js']) {
    const cfg = loadCfg(path.join(DIR, a.dir, ed));
    if (!cfg.id) { fail(a.dir + '/' + ed, 'no id'); continue; }
    if (ids[cfg.id]) fail(a.dir + '/' + ed, `id "${cfg.id}" is already used by ${ids[cfg.id]} — the two would share a storage key and overwrite each other`);
    ids[cfg.id] = a.dir + '/' + ed;
    const key = 'medhava_' + cfg.id + '_v1';
    if (keys[key]) fail(a.dir + '/' + ed, `storage key "${key}" collides with ${keys[key]}`);
    keys[key] = a.dir + '/' + ed;
  }
}
/* the four promises the registry must keep */
PROVIDERS.CAPS.forEach(c => {
  if (c.providers.length < 3) fail('providers.js', `capability "${c.id}" offers only ${c.providers.length} choices`);
  if (!c.providers.some(p => p.kind === 'built-in' || p.kind === 'manual'))
    fail('providers.js', `capability "${c.id}" has no built-in or by-hand option — the app would not work unconnected`);
  /* "run it yourself" is satisfied by self-host OR built-in — "your own delivery" and
     "your own UPI QR" need no third party at all, which is the stronger form of the promise.
     This is the same rule the app runs on itself at every launch. */
  if (!c.providers.some(p => p.kind === 'self-host' || p.kind === 'built-in'))
    fail('providers.js', `capability "${c.id}" has nothing you can run yourself`);
});
console.log(`  ${APPS.length} apps · ${caps.size} capabilities · ${Object.keys(ids).length} unique ids and storage keys`);

console.log('\n═══ 4 · PACKAGING — is every file a ZIP claims really on disk? ═══');
for (const n of ['01', '02', '03', '04']) {
  const p = path.join(DIR, `module_m${n}.js`);
  if (!fs.existsSync(p)) { fail('module_m' + n + '.js', 'missing'); continue; }
  const M = require(p);
  const m = MOD[M.num];
  if (!m) { fail('module_m' + n + '.js', `num "${M.num}" is not a canonical module`); continue; }
  if (clean(M.title) !== clean(m.name))
    fail('module_m' + n + '.js', `title "${M.title}" but the website publishes "${m.name}"`);
  /* A module ships app by app: the ZIP holds what is built, the website lists what the module
     will hold. So the rule is not "same length" — it is "everything packed is really published
     by this module, in the same order, and nothing is packed twice". */
  const published = (m.apps || []).map(x => x[0]);
  let cursor = -1;
  M.apps.forEach((a, i) => {
    const at = published.indexOf(a.name);
    if (at < 0) fail('module_m' + n + '.js', `packs "${a.name}", which module ${M.num} does not publish: ${published.join(' · ')}`);
    else if (at <= cursor) fail('module_m' + n + '.js', `packs "${a.name}" out of the order the website lists: ${published.join(' · ')}`);
    else cursor = at;
    for (const ed of ['MEDHAVA', 'VASTRANGAM']) {
      for (const k of ['html', 'manual', 'pdf']) {
        const f = path.join(DIR, a[k][ed]);
        if (!fs.existsSync(f)) fail('module_m' + n + '.js', `${ed} ${a.name}: ${k} file missing — ${a[k][ed]}`);
      }
    }
  });
  if (!fs.existsSync(path.join(DIR, M.overviewPdf))) fail('module_m' + n + '.js', `overview PDF missing — ${M.overviewPdf}`);
  if (!M.verify || !M.verify.length) fail('module_m' + n + '.js', 'no verification table');
}
console.log('  modules 01–04 checked against the published app list and the files on disk');

console.log('\n═══ 5 · ESCAPING — nothing prints &amp; at the user ═══');
/* The kernel escapes nav labels, every H.head argument, table column labels and KPI labels.
   Writing &amp; in one of those escapes it twice, and the user reads "Promise &amp; transit"
   on screen. H.panel titles are the opposite — trusted markup, where &amp; is correct. */
const ESCAPED = [
  [/label:'[^']*&amp;[^']*'/g, 'a nav or column label'],
  [/H\.head\(\s*(?:'[^']*'\s*,\s*){0,2}'[^']*&amp;[^']*'/g, 'an H.head argument'],
  [/\{l:'[^']*&amp;[^']*'/g, 'a KPI label'],
  [/H\.tag\('[^']*&amp;[^']*'/g, 'a tag'],
];
let escChecked = 0;
for (const a of APPS) {
  const src = fs.readFileSync(path.join(DIR, a.dir, 'core.js'), 'utf8');
  escChecked++;
  for (const [re, what] of ESCAPED) {
    const hits = src.match(re);
    if (hits) hits.forEach(h => fail(a.dir + '/core.js',
      `${what} contains &amp; — the kernel escapes it again, so the screen shows "&amp;" as text: ${h.slice(0, 60)}`));
  }
}
console.log(`  ${escChecked} app engines checked for double-escaped text`);

console.log('\n═══ 6 · THE BOOKS AND MANUALS — same rules, same vocabulary ═══');
/* The configs are only half the surface. The PDF and manual generators carry their own prose,
   ring diagrams and comparison tables, and drift hid there for three modules. Same rules apply. */
const GHOSTS = ['Channel Manager', 'Sales & Orders', 'Master Data', 'Accounts / BUSY',
  'Finance / Ledger', 'Finance / BUSY', 'Sales / Orders'];
const docFiles = fs.readdirSync(DIR).filter(f => /^(mkbook|mkmanual)_.*\.js$/.test(f));
for (const f of docFiles) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const lines = src.split('\n');
  lines.forEach((ln, i) => {
    /* A Connectors row is the one place a vendor list belongs — it is the promise, not a dependency. */
    const isConnectorList = /Medhava Books \(built in\)|Medhava GST returns|Medhava Rules|Medhava templates|Medhava Image Studio/.test(ln);
    for (const g of GHOSTS)
      if (ln.includes(g)) fail(f + ':' + (i + 1), `names "${g}", which is not one of the ${MODULES.length} canonical modules`);
    if (isConnectorList) return;
    for (const v of ['BUSY', 'Tally', 'Marg'])
      if (new RegExp('(?:←|from|source|ledger|books)[^\\n]{0,40}\\b' + v + '\\b', 'i').test(ln))
        fail(f + ':' + (i + 1), `presents ${v} as where the books live — it is one option on Connectors, never the source`);
  });
}
console.log(`  ${docFiles.length} book and manual generators scanned for module names that do not exist`);

console.log('\n═══ 7 · THE APP COUNT — does the prose match the list? ═══');
/* The app count is written in a dozen files by hand. Derive the real number from
   modules.js and fail if any of them still says something else. */
const REALCOUNT = MODULES.reduce((s, m) => s + (m.apps || []).length, 0);
const SITE = path.join(SUITE, '..', 'site'), IDENT = path.join(SUITE, '..', 'identity');
const countFiles = [];
for (const d of [SITE, IDENT, DIR])
  if (fs.existsSync(d)) fs.readdirSync(d).filter(f => /\.(js|html|txt|md)$/.test(f))
    .filter(f => !/^(index|sitebook|book_|audit)/.test(f))
    .forEach(f => countFiles.push(path.join(d, f)));
let countChecked = 0;
for (const f of countFiles) {
  const src = fs.readFileSync(f, 'utf8'); countChecked++;
  const m = src.match(/\b(\d\d) apps\b/g) || [];
  new Set(m).forEach(hit => {
    const n = Number(hit.match(/\d\d/)[0]);
    if (n !== REALCOUNT && n > 20)
      fail(path.relative(SUITE, f), `says "${hit}" but modules.js publishes ${REALCOUNT}`);
  });
}
console.log(`  ${countChecked} files checked against the ${REALCOUNT} apps modules.js publishes`);

console.log('\n═══ 8 · INDUSTRY NEUTRALITY — does the neutral edition assume a trade? ═══');
/* Medhava is one ERP for manufacturing, export, trade AND services. The MEDHAVA edition must
   therefore read the same to a law firm, a machine shop and a clothing house: stages, roles,
   fields and rules are things a company sets up, never things the software already believes.
   Trade-specific vocabulary is exactly what the VASTRANGAM edition is for, so config_vastrangam
   is deliberately exempt — that split is the whole point of the two-edition build. */
const TRADE = ['karigar', 'saree', 'sari', 'anarkali', 'lehenga', 'kurta', 'dupatta', 'chinon',
  'chiffon', 'georgette', 'silk', 'embroider', 'garment', 'stitch', 'tailor', 'weaver', 'fabric',
  'textile', 'boutique', 'ethnic wear', 'cut plan', 'artisan', 'apparel'];
/* The partials count too: a mock screenshot full of mills and silk names is the same leak as
   a wiring row, and it is the first thing a reader sees. edition_vastrangam.js is the one file
   in site/ that is exempt — it is the trade edition. */
const neutralFiles = ['modules.js', 'shots.js', 'mkindex.js', 'top.html', 'bottom.html', 'head.html']
  .map(f => path.join(SUITE, '..', 'site', f));
for (const a of APPS) neutralFiles.push(path.join(DIR, a.dir, 'config_generic.js'));
let neutralChecked = 0;
for (const f of neutralFiles) {
  if (!fs.existsSync(f)) continue;
  const src = fs.readFileSync(f, 'utf8'); neutralChecked++;
  src.split('\n').forEach((ln, i) => {
    /* the rule may name what it forbids without breaking itself */
    /* a line that lists several trades ("drop-in for textile, medical, services") is the
       promise being stated, not an assumption being made */
    if (/audit section 8|TRADE|NOTHING HERE MAY ASSUME|any industry|all kind|whatever your/i.test(ln)) return;
    for (const w of TRADE)
      if (new RegExp('\\b' + w, 'i').test(ln))
        fail(path.relative(SUITE, f) + ':' + (i + 1),
          `says "${w}" in the neutral edition — a services or engineering company reading this ` +
          `would find the software already believes it sells clothes. Trade wording belongs in ` +
          `config_vastrangam.js only.`);
  });
}
console.log(`  ${neutralChecked} neutral-edition files checked against ${TRADE.length} trade-specific words`);

console.log('\n' + '─'.repeat(72));
if (!findings.length) { console.log('CLEAN — no findings.\n'); process.exit(0); }
console.log(`${findings.length} FINDING${findings.length === 1 ? '' : 'S'}\n`);
const by = {}; findings.forEach(f => { (by[f.where] = by[f.where] || []).push(f.what); });
Object.keys(by).sort().forEach(k => { console.log(k); by[k].forEach(w => console.log('   · ' + w)); });
console.log('');
process.exit(1);
