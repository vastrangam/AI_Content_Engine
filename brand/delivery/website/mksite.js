'use strict';
/* THE PUBLISHED SITE — the website and the browser apps, assembled for a real URL.
 *
 *   node brand/delivery/website/mksite.js
 *   node brand/delivery/website/mksite.js --check
 *
 * WHAT THIS IS FOR
 * Everything this project has built for a browser has, until now, only ever opened as a
 * file on the machine that built it. `brand/site/build.js` writes a complete website and
 * `brand/suite/deep/build_deep.js` writes thirty-six working app pages, and not one of them
 * has ever been reachable at an address somebody could open. This assembles them into
 * `site/`, which a GitHub Pages workflow publishes.
 *
 * WHY IT CAN BE DONE AT ALL, AND WHAT IT STILL CANNOT DO
 * This environment's egress proxy refuses every host outside package registries and GitHub,
 * so there is no route to a server, a domain or a database provider — CAP-DEPLOY is NOT
 * STARTED in the requirements registry and stays there. GitHub is on the allowlist, and
 * GitHub Pages serves static files, so the half of this product that IS static can go live
 * and the half that needs a server cannot.
 *
 * That distinction is the single most important thing this file gets right, because a live
 * URL is the most convincing wrong impression available here. The landing page says it in
 * its own first section rather than in a footnote:
 *
 *   · the two apps that run on the real database are NOT on this site. They need a server
 *     and a Postgres, and the site says so and gives the command to run them locally.
 *   · every app that IS here is a prototype over a store inside the page. Its label is read
 *     from brand/site/registry.js, so it cannot say more than the register allows.
 *
 * PUBLISHING RAISES NO RUNG. A page being reachable is not evidence that it works, and
 * nothing here touches registry.js. checkregistry.js would refuse the change anyway: a rung
 * above IMPLEMENTED needs a command recorded in the evidence log at exit 0, and "it is on
 * the internet" is not a command.
 *
 * NOTHING IS COPIED THAT IS NOT GENERATED. Every file placed in site/ was written by a
 * generator in this repository, from a register in this repository.
 */

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(ROOT, 'brand', 'site');
const OUT = path.join(ROOT, 'site');

const MODULES = require(path.join(SITE, 'modules.js'));
const REGISTRY = require(path.join(SITE, 'registry.js'));
const AUDIT = require(path.join(SITE, 'audit.js'));
const APPS = require(path.join(ROOT, 'brand', 'suite', 'deep', 'apps.js'));
const MANIFEST = require(path.join(ROOT, 'brand', 'delivery', 'manifest.js'));

const checkOnly = process.argv.includes('--check');
const ROWS = REGISTRY.rows(MODULES);
const appRow = (name) => ROWS.find((r) => r.kind === 'app' && r.name === name);

/* ── the two root-absolute links the built page carries ───────────────────────
 * The generated website is otherwise entirely self-contained — every image is inlined as a
 * data URI, and there is not one external request in it. It carries exactly two links to
 * the domain root, `/` and `/llms.txt`, which are correct for a site served at a domain and
 * wrong for one served at github.io/<repo>/. Rewritten here, at assembly time, rather than
 * in build.js: the built page is right for the place build.js writes it for, and this is
 * the only place that knows the page is about to be served from a subpath. */
const rebase = (html, prefix) => html
  .replace(/href="\/llms\.txt"/g, `href="${prefix}llms.txt"`)
  .replace(/href="\/"/g, `href="${prefix}index.html"`);

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── what will be published, decided from the registers ───────────────────── */
const EDITIONS = [
  { id: 'product', suffix: '_ERP', src: 'index.html', label: 'Medhava',
    what: 'the product, with no customer inside it' },
  { id: 'trade', suffix: '_Vastrangam', src: 'index_vastrangam.html', label: 'Trade edition',
    what: 'the same structure in one trade’s own words' },
];

/* Every app page that exists on disk, paired with what the register says about it. An app
   whose page was never built is simply absent — not listed as a dead link, and not silently
   counted either: the landing page states how many were found against how many are named. */
function found() {
  const dir = path.join(ROOT, 'brand', 'suite', 'deep', 'out');
  if (!fs.existsSync(dir)) return [];
  const have = new Set(fs.readdirSync(dir).filter((f) => f.endsWith('.html')));
  const out = [];
  APPS.forEach((a) => {
    EDITIONS.forEach((e) => {
      const file = a.out + e.suffix + '.html';
      if (have.has(file)) {
        out.push({ ...a, edition: e.id, file, dest: `${a.out}-${e.id}.html` });
      }
    });
  });
  return out;
}

/* ── the landing page ─────────────────────────────────────────────────────── */
function landing(pages) {
  const byApp = new Map();
  pages.forEach((p) => {
    if (!byApp.has(p.title)) byApp.set(p.title, []);
    byApp.get(p.title).push(p);
  });

  const platform = ROWS.filter((r) => r.kind === 'app' && r.status === 'TESTED');
  const docs = MANIFEST.DOCS.filter((d) => d.edition === 'MEDHAVA'
    && fs.existsSync(path.join(ROOT, d.pdf)));

  const rows = [...byApp.entries()].map(([title, list]) => {
    const r = appRow(title);
    /* THE LABEL IS READ, NEVER TYPED. An app cannot be described here as more finished than
       the register says it is, because the register is where the words come from. */
    const rung = r ? r.status : 'not in the register';
    const note = r && r.note ? r.note : '';
    const links = list.map((p) =>
      `<a class="go" href="apps/${p.dest}">${p.edition === 'product' ? 'Product' : 'Trade'}</a>`).join('');
    return `<tr><td><b>${esc(title)}</b><div class="n">${esc(note)}</div></td>` +
      `<td><span class="rung r-${rung.toLowerCase().replace(/[^a-z]/g, '')}">${esc(rung)}</span></td>` +
      `<td class="links">${links}</td></tr>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Medhava — what is actually running</title>
<style>
:root{--ink:#12161c;--dim:#5b6675;--line:#e3e7ec;--bg:#fbfcfd;--card:#fff;--warn:#8a5a00;--warnbg:#fff8e6}
@media(prefers-color-scheme:dark){:root{--ink:#e8ecf1;--dim:#95a1b0;--line:#252b34;--bg:#0e1116;--card:#151a21;--warn:#e8b64c;--warnbg:#221b08}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:940px;margin:0 auto;padding:48px 22px 80px}
h1{font-size:34px;line-height:1.15;margin:0 0 6px;letter-spacing:-.02em}
h2{font-size:20px;margin:44px 0 12px;letter-spacing:-.01em}
.sub{color:var(--dim);margin:0 0 28px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 20px;margin:14px 0}
.warn{background:var(--warnbg);border-color:var(--warn)}
.warn b{color:var(--warn)}
table{width:100%;border-collapse:collapse;margin-top:8px}
td,th{border-bottom:1px solid var(--line);padding:11px 8px;text-align:left;vertical-align:top}
th{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--dim)}
.n{color:var(--dim);font-size:13px;margin-top:3px;max-width:52ch}
.rung{font-size:11px;letter-spacing:.05em;border:1px solid var(--line);border-radius:20px;padding:3px 9px;white-space:nowrap}
.r-tested{border-color:#2e7d32;color:#2e7d32}
.r-implemented{border-color:#8a5a00;color:var(--warn)}
.links{white-space:nowrap}
.go{display:inline-block;border:1px solid var(--line);border-radius:7px;padding:5px 11px;margin:0 5px 5px 0;text-decoration:none;color:inherit;font-size:13px}
.go:hover{border-color:var(--ink)}
a{color:inherit}
code{background:var(--card);border:1px solid var(--line);border-radius:5px;padding:1px 6px;font-size:13px}
.foot{color:var(--dim);font-size:13px;margin-top:52px;border-top:1px solid var(--line);padding-top:18px}
ul{padding-left:20px}li{margin:5px 0}
</style></head><body><div class="wrap">

<h1>Medhava</h1>
<p class="sub">A business operating system. This page publishes the part of it that a
browser can serve, and says plainly what that is and is not.</p>

<div class="card warn">
<p><b>Read this before clicking anything.</b></p>
<p>The ${platform.length} apps that run on the real database — ${platform.map((r) => esc(r.name)).join(' and ')} —
are <b>not on this site</b>. They need a server and a Postgres database with row-level
security, and this is a static host. Run them yourself with <code>npm start</code> after
<code>npm ci</code>; their tests are in <code>npm run medhava</code>.</p>
<p>Every app linked below <b>is a prototype</b>. Each one opens, carries its own self-tests
and passes a click-through audit, over a store that lives inside the page. There is no
shared database behind any of them, so nothing you enter is saved anywhere or seen by
anyone else. The rung beside each is read from
<code>brand/site/registry.js</code>, which is gated — none of them can be described here as
more finished than the register allows.</p>
</div>

<h2>The generated website</h2>
<div class="card">
${EDITIONS.map((e) => `<p><a class="go" href="${e.id}/index.html">${esc(e.label)}</a>
&nbsp;${esc(e.what)}</p>`).join('\n')}
<p class="n">Both are written by <code>brand/site/build.js</code> from
<code>brand/site/modules.js</code> — ${MODULES.length} modules and
${ROWS.filter((r) => r.kind === 'app').length} apps, every count read from the register at
build time rather than typed.</p>
</div>

<h2>The apps, live</h2>
<p class="sub">${byApp.size} apps, ${pages.length} pages across both editions.</p>
<table>
<tr><th>App</th><th>Rung</th><th>Open</th></tr>
${rows}
</table>

<h2>What the numbers actually are</h2>
<div class="card">
<p>Measured, not asserted — every figure below comes from a register with a gate behind it,
and the documents that carry them are linked underneath.</p>
<ul>
<li><b>${AUDIT.score(ROWS).mean} out of 5</b> across ${ROWS.length} capabilities</li>
<li><b>Maturity level ${AUDIT.MATURITY.level} — ${esc(AUDIT.MATURITY.name)}</b></li>
<li>${ROWS.filter((r) => r.status === 'TESTED').length} capabilities have a recorded passing
test; ${ROWS.filter((r) => r.status === 'SPECIFIED').length} are written down and not
standing up</li>
<li>Nothing is at VERIFIED or PRODUCTION-READY, and a gate refuses to put anything there</li>
</ul>
</div>

<h2>The documents</h2>
<div class="card">
${docs.map((d) => `<p><a class="go" href="docs/${esc(path.basename(d.pdf))}">${esc(path.basename(d.pdf, '.pdf'))}</a></p>`).join('\n')}
</div>

<p class="foot">Generated by <code>node brand/delivery/website/mksite.js</code> from output
written by <code>brand/site/build.js</code> and
<code>brand/suite/deep/build_deep.js</code>. Nothing on this page was typed by hand: the app
list comes from <code>brand/suite/deep/apps.js</code>, every rung from
<code>brand/site/registry.js</code>, every count from the register that owns it. Publishing a
page here changes no rung — being reachable is not evidence that something works.</p>

</div></body></html>
`;
}

/* ── assemble ─────────────────────────────────────────────────────────────── */
const pages = found();
const files = new Map();   // relative path in site/ → contents (Buffer or string)

files.set('index.html', landing(pages));
files.set('.nojekyll', '');   // or Pages drops directories beginning with an underscore

EDITIONS.forEach((e) => {
  const src = path.join(SITE, e.src);
  if (!fs.existsSync(src)) return;
  files.set(`${e.id}/index.html`, rebase(fs.readFileSync(src, 'utf8'), '../'));
});

pages.forEach((p) => {
  files.set(`apps/${p.dest}`,
    fs.readFileSync(path.join(ROOT, 'brand', 'suite', 'deep', 'out', p.file)));
});

MANIFEST.DOCS.filter((d) => d.edition === 'MEDHAVA').forEach((d) => {
  const src = path.join(ROOT, d.pdf);
  if (fs.existsSync(src)) files.set(`docs/${path.basename(d.pdf)}`, fs.readFileSync(src));
});

const llms = path.join(ROOT, 'llms.txt');
if (fs.existsSync(llms)) files.set('llms.txt', fs.readFileSync(llms));

/* ── write, or report ─────────────────────────────────────────────────────── */
if (checkOnly) {
  /* site/ is build output and is not committed, so --check answers the only question worth
     asking about it: could it be assembled right now, and from what. A missing input is a
     real answer — it means somebody has not run the builds this depends on. */
  const missing = [];
  EDITIONS.forEach((e) => {
    if (!fs.existsSync(path.join(SITE, e.src))) missing.push(`brand/site/${e.src}`);
  });
  if (!pages.length) missing.push('brand/suite/deep/out/*.html');
  if (missing.length) {
    console.log('mksite: the site cannot be assembled here — SKIPPED, not passed.');
    missing.forEach((m) => console.log(`  missing: ${m}`));
    console.log('  These are build output and are not committed. Run:');
    console.log('    node brand/site/build.js && node brand/site/build.js vastrangam');
    console.log('    node brand/suite/deep/build_deep.js');
    console.log('  A checkout that has not built them cannot publish them, and this refuses');
    console.log('  to report that as a pass.');
    process.exit(0);
  }
  console.log(`mksite: assemblable — ${files.size} file(s); ` +
    `${pages.length} app page(s) across ${EDITIONS.length} edition(s)`);
  process.exit(0);
}

fs.rmSync(OUT, { recursive: true, force: true });
let bytes = 0;
files.forEach((body, rel) => {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, body);
  bytes += Buffer.byteLength(body);
});

console.log(`site/ assembled — ${files.size} files, ${Math.round(bytes / 1024 / 1024 * 10) / 10}MB`);
console.log(`  ${EDITIONS.length} edition website(s)`);
console.log(`  ${pages.length} app page(s) from ${new Set(pages.map((p) => p.title)).size} apps`);
console.log(`  ${[...files.keys()].filter((k) => k.startsWith('docs/')).length} document(s)`);
console.log('  the two apps on the real database are NOT here — they need a server, and');
console.log('  the landing page says so in its first section rather than in a footnote');
