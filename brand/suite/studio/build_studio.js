'use strict';
/* Assemble Vastrangam_BOS_Data_Studio.html — one file, opened by double-clicking.

   Nothing is fetched at run time: the workbook reader, the two pipelines, the
   styled writer, the screen, the logo and the favicon are all inlined. That is
   the same rule the sixteen built apps follow, and for the same reason — a tool
   whose "upload your Excel" button needs somebody else's server is a tool that
   stops working the day that server does.

   Run:  node brand/suite/studio/build_studio.js
*/

const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const IDENT = path.join(HERE, '..', '..', 'identity');
const OUTDIR = path.join(HERE, '..', '..', 'delivery', 'website', 'VASTRANGAM_BOS');
const OUT = path.join(OUTDIR, 'Vastrangam_BOS_Data_Studio.html');

const read = (p) => fs.readFileSync(p, 'utf8');
const dataUri = (file) => {
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,` + fs.readFileSync(file).toString('base64');
};
const findAsset = (stem) => {
  for (const ext of ['.png', '.svg', '.jpg', '.jpeg']) {
    const f = path.join(IDENT, stem + ext);
    if (fs.existsSync(f)) return f;
  }
  return null;
};

const logoFile = findAsset('vastrangam-logo');
const iconFile = findAsset('vastrangam-icon');
const LOGO = logoFile ? dataUri(logoFile) : null;
const ICON = iconFile ? dataUri(iconFile) : null;

/* A script that is inlined must not contain a literal </script>. None of these
   do, but checking is cheaper than the bug. */
function inline(file) {
  const src = read(path.join(HERE, file));
  if (/<\/script/i.test(src)) throw new Error(`${file} contains a closing script tag and cannot be inlined`);
  return src;
}

const CSS = `
:root{
  --ink:#1d1b2e; --ink-soft:#57536e; --ink-faint:#7d7996;
  --paper:#faf8fc; --card:#ffffff; --line:#e6e1ee;
  --violet:#6b4fa8; --violet-deep:#4a235a; --violet-wash:#f4ecf7;
  --teal:#128f77; --teal-wash:#e6f6f2;
  --amber:#8a6100; --amber-wash:#fdf3dc;
  --red:#a8321f; --red-wash:#fadbd8;
  --shadow:0 1px 2px rgba(29,27,46,.05), 0 8px 24px -12px rgba(74,35,90,.18);
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);
  font:16px/1.55 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
  -webkit-font-smoothing:antialiased}
.wrap{max-width:1120px;margin:0 auto;padding:0 24px 72px}

/* ── masthead ── */
header.top{border-bottom:1px solid var(--line);background:#fff;margin-bottom:34px}
.topin{max-width:1120px;margin:0 auto;padding:18px 24px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.logo{height:46px;width:auto;display:block}
.wordmark{font-weight:700;font-size:23px;letter-spacing:-.02em;color:var(--violet-deep)}
.topin .name{font-size:14px;color:var(--ink-soft);border-left:1px solid var(--line);padding-left:16px;
  letter-spacing:.16em;text-transform:uppercase;font-family:ui-sans-serif,system-ui,sans-serif}
.offline{margin-left:auto;font-size:12.5px;color:var(--teal);background:var(--teal-wash);
  border:1px solid #bfe4da;border-radius:999px;padding:5px 13px;
  font-family:ui-sans-serif,system-ui,sans-serif}

h1{font-size:38px;line-height:1.12;letter-spacing:-.025em;margin:0 0 10px}
.lede{font-size:18px;color:var(--ink-soft);margin:0 0 30px;max-width:62ch}
h2{font-size:22px;letter-spacing:-.02em;margin:0}
h3.sub2{font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);
  margin:30px 0 10px;font-family:ui-sans-serif,system-ui,sans-serif}
.sub{margin:5px 0 0;color:var(--ink-soft);font-size:14.5px}

/* ── drop zone ── */
.drop{border:2px dashed #cfc4e0;border-radius:14px;background:#fff;padding:38px 26px;text-align:center;
  cursor:pointer;transition:border-color .15s,background .15s}
.drop:hover,.drop.over{border-color:var(--violet);background:var(--violet-wash)}
.drop:focus-visible{outline:3px solid var(--violet);outline-offset:3px}
.drop b{display:block;font-size:19px;margin-bottom:5px}
.drop span{color:var(--ink-soft);font-size:14.5px}
.hint{margin:14px 0 0;font-size:13.5px;color:var(--ink-faint);font-family:ui-sans-serif,system-ui,sans-serif}

ul.files{list-style:none;margin:20px 0 0;padding:0;display:grid;gap:8px}
.file{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);
  border-radius:10px;padding:10px 13px;font-size:14.5px}
.fname{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fmeta{color:var(--ink-faint);font-size:13px;margin-left:auto;white-space:nowrap}
.tag{font-size:11px;letter-spacing:.1em;text-transform:uppercase;border-radius:5px;padding:4px 8px;
  font-family:ui-sans-serif,system-ui,sans-serif;font-weight:600;white-space:nowrap}
.tag-ecommerce{background:var(--violet-wash);color:var(--violet-deep)}
.tag-karigar{background:var(--teal-wash);color:#0b6b59}
.tag-rates{background:var(--amber-wash);color:var(--amber)}
.tag-unknown{background:var(--red-wash);color:var(--red)}
button.drop{all:unset;cursor:pointer;color:var(--ink-faint);font-size:20px;line-height:1;padding:0 4px}
button.drop:hover{color:var(--red)}

.actions{display:flex;gap:12px;margin-top:22px;flex-wrap:wrap}
.btn{font:600 15px/1 ui-sans-serif,system-ui,sans-serif;border-radius:9px;padding:13px 24px;
  border:1px solid transparent;cursor:pointer}
.btn-go{background:var(--violet);color:#fff}
.btn-go:hover:not(:disabled){background:var(--violet-deep)}
.btn-go:disabled{background:#d6cde4;color:#fff;cursor:not-allowed}
.btn-quiet{background:#fff;border-color:var(--line);color:var(--ink-soft)}
.btn-quiet:hover{border-color:var(--violet);color:var(--violet)}

.status{margin-top:20px;border-radius:10px;padding:12px 16px;font-size:14.5px;
  font-family:ui-sans-serif,system-ui,sans-serif}
.status.ok{background:var(--teal-wash);color:#0b6b59;border:1px solid #bfe4da}
.status.busy{background:var(--violet-wash);color:var(--violet-deep);border:1px solid #ddd0ea}
.status.warn{background:var(--amber-wash);color:var(--amber);border:1px solid #ecd9a3}
.status.bad{background:var(--red-wash);color:var(--red);border:1px solid #f0b8b0}

/* ── results ── */
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:26px;
  margin-top:30px;box-shadow:var(--shadow)}
.cardhead{margin-bottom:20px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:12px;margin-bottom:20px}
.stat{background:var(--violet-wash);border-radius:10px;padding:14px 15px}
.stat b{display:block;font-size:25px;letter-spacing:-.02em;line-height:1.15}
.stat span{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft);
  font-family:ui-sans-serif,system-ui,sans-serif}
.stat-good{background:var(--teal-wash)} .stat-good b{color:#0b6b59}
.stat-bad{background:var(--red-wash)} .stat-bad b{color:var(--red)}
.stat-money{background:var(--teal-wash)} .stat-money b{color:#0b6b59;font-size:22px}

.chips{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}
.chip{border:1px solid var(--line);border-radius:9px;padding:9px 13px;font-size:13.5px;
  font-family:ui-sans-serif,system-ui,sans-serif}
.chip b{display:block;font-size:14.5px}
.chip span{color:var(--ink-soft)}
.chip em{display:block;font-style:normal;color:var(--amber);font-size:12px;margin-top:3px}

.tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:10px}
table{border-collapse:collapse;width:100%;font-size:13.5px;
  font-family:ui-sans-serif,system-ui,sans-serif}
th{background:var(--violet);color:#fff;text-align:left;padding:10px 12px;font-weight:600;
  white-space:nowrap;font-size:12px;letter-spacing:.04em}
td{padding:8px 12px;border-top:1px solid var(--line);white-space:nowrap}
td.n{text-align:right;font-variant-numeric:tabular-nums}
tbody tr:nth-child(even){background:#fbf9fd}
tr.flag td{background:var(--red-wash)}
tr.grand td{background:var(--teal);color:#fff;font-weight:700}
.more{margin:0;padding:10px 12px;font-size:13px;color:var(--ink-faint);border-top:1px solid var(--line)}

.warnbox{margin-top:18px;background:var(--red-wash);border:1px solid #f0b8b0;border-radius:10px;padding:14px 16px}
.warnbox.soft{background:var(--amber-wash);border-color:#ecd9a3}
.warnbox b{display:block;margin-bottom:5px}
.warnbox p{margin:0;font-size:14px;color:var(--ink-soft)}

.downloads{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.dl{text-align:left;background:var(--violet-deep);color:#fff;border:0;border-radius:10px;
  padding:14px 20px;cursor:pointer;font-family:ui-sans-serif,system-ui,sans-serif}
.dl:hover{background:#3a1b47}
.dl b{display:block;font-size:14.5px}
.dl span{font-size:12.5px;opacity:.82}

footer{margin-top:56px;padding-top:22px;border-top:1px solid var(--line);
  font-size:13.5px;color:var(--ink-faint);font-family:ui-sans-serif,system-ui,sans-serif}
footer p{margin:0 0 7px}

@media(max-width:640px){
  h1{font-size:30px} .wrap{padding:0 16px 52px} .topin{padding:14px 16px}
  .stat b{font-size:21px}
}
@media print{ .drop,.actions,.downloads{display:none} }
`;

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vastrangam BOS · Data Studio</title>
<meta name="description" content="Turn the Vastrangam sale, return and karigar workbooks into the reports the business already uses. Runs entirely in the browser — nothing is uploaded anywhere.">
${ICON ? `<link rel="icon" type="image/png" href="${ICON}">\n<link rel="apple-touch-icon" href="${ICON}">` : ''}
<style>${CSS}</style>
</head>
<body>
<header class="top">
  <div class="topin">
    ${LOGO ? `<img class="logo" src="${LOGO}" alt="Vastrangam" width="192" height="60">`
           : '<span class="wordmark">Vastrangam</span>'}
    <span class="name">Data Studio</span>
    <span class="offline">Runs offline · nothing is uploaded</span>
  </div>
</header>

<div class="wrap">
  <h1>Your workbooks in, the reports you already use out.</h1>
  <p class="lede">Drop the sale &amp; return workbook, the karigar grid and the stitching rates master
  on the box below. This page reads them in your browser, applies the rules the business already
  settled on, and hands back the formatted Excel files. Nothing is sent anywhere — take the machine
  off the internet and it still works.</p>

  <div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose or drop workbooks">
    <b>Drop .xlsx workbooks here</b>
    <span>or click to choose them — several at once is fine</span>
  </div>
  <input type="file" id="file" accept=".xlsx" multiple hidden>
  <p class="hint">Each file is filed by what is inside it, not by what it is called. A workbook with
  “&lt;Company&gt; Sale” and “&lt;Company&gt; Return” sheets becomes the e-commerce report — two companies
  or ten, the columns follow the sheets.</p>

  <div id="filesWrap" hidden><ul class="files" id="files"></ul></div>

  <div class="actions">
    <button class="btn btn-go" id="run" disabled>Build the reports</button>
    <button class="btn btn-quiet" id="clear">Clear</button>
  </div>

  <div class="status" id="status" hidden></div>
  <div id="out"></div>

  <footer>
    <p><b>What this will not do.</b> It will not guess a price that is not on the price list, or a
    stitching rate that is not in the rate master. A missing rate is posted as ₹0 and the design is
    named, because a guessed rate is a wrong payment to a real person.</p>
    <p><b>Where the numbers come from.</b> Sets are counted by pooling every karigar's pieces for a
    design first and then taking the smallest member pool; surplus pieces are reported one by one
    under their own names; cost is per raw piece, so a piece that never became part of a set is
    still paid for.</p>
    <p>Vastrangam BOS · Data Studio. This page will never ask you for a marketplace, bank or account password.</p>
  </footer>
</div>

<script>
${inline('../xlsx.js')}
</script>
<script>
${inline('studio_core.js')}
</script>
<script>
${inline('studio_xlsx.js')}
</script>
<script>
${inline('studio_reports.js')}
</script>
<script>
${inline('studio_ui.js')}
</script>
</body>
</html>
`;

fs.mkdirSync(OUTDIR, { recursive: true });
fs.writeFileSync(OUT, HTML);

const kb = (n) => Math.round(n / 1024) + 'KB';
console.log(`Data Studio written: ${path.relative(path.join(HERE, '..', '..', '..'), OUT)}  ${kb(Buffer.byteLength(HTML))}`);
console.log(`  logo:    ${logoFile ? path.basename(logoFile) : 'none — typeset fallback'}`);
console.log(`  favicon: ${iconFile ? path.basename(iconFile) : 'none'}`);
if (/https?:\/\/(?!www\.w3\.org|schemas\.openxmlformats\.org|purl\.org|ns\.adobe\.com)/.test(HTML.replace(/data:[^"')\s]+/g, ''))) {
  console.error('  WARNING: the page references an external URL — it would not work offline.');
  process.exit(1);
}
console.log('  no external references — opens with the network off.');
