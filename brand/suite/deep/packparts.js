'use strict';
/* Shared packager for every module ZIP.
   Structure it produces (the standard, fixed from Module 01 onward):

     Module_NN_Slug__Medhava_and_Vastrangam.zip
     ├── READ_ME_FIRST_Module_NN_Slug.md
     ├── MEDHAVA_Module_NN_Slug.zip
     │   └── MEDHAVA_Module_NN_Slug/
     │       ├── MEDHAVA_MNN_START_HERE.md
     │       ├── MEDHAVA_MNN_Module_Overview.pdf
     │       └── App_01_<Slug>/  ( .html · _MANUAL.md · _WIRING.pdf )
     └── VASTRANGAM_Module_NN_Slug.zip   (same shape)

   Every filename carries edition + module + app, so nothing is ambiguous after extraction. */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROADMAP = require('./roadmap.js');
/* Small numbers read better as words in a sentence a person is meant to follow. */
const WORD = n => ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] || String(n);
const DIR = __dirname;

const ED = {
  MEDHAVA: { label: 'Medhava', long: 'Unified ERP — any industry', co: 'Acme Corp',
    forWho: '**Unified ERP** — किसी भी industry के लिए. Company "Acme Corp", neutral names. यही version किसी भी नए customer को दिया जाएगा.' },
  VASTRANGAM: { label: 'Vastrangam', long: 'Vastrangam — its own rules, logic and examples', co: 'Vastrangam',
    forWho: "**Vastrangam का अपना ERP** — Myntra, Flipkart, Surat–Jaipur mills, boutiques, karigar, BUSY. इससे हम test करते हैं कि neutral engine असली business में चलता है या नहीं." }
};

/* The module's published apps, plus the unified build if it has one. The unified app is a
   delivery artefact rather than a catalogue entry — the website still publishes three apps for
   Module 01 — but in the ZIP it is simply the fourth folder, because that is what it is. */
function allApps(M) { return M.unified ? M.apps.concat([M.unified]) : M.apps; }

function readmeFirst(M) {
  const APPS = allApps(M);
  const appLines = APPS.map(a =>
    `**App ${a.n} · ${a.name}** — ${a.screens} screens, ${a.tests} self-tests\n${a.blurb}`).join('\n\n');
  const full = ['MEDHAVA', 'VASTRANGAM'].map(ed => {
    const base = `${ed}_Module_${M.num}_${M.slug}`;
    const apps = APPS.map((a, i) => {
      const stem = `${ed}_M${M.num}_App${a.n}_${a.slug}`;
      const last = i === APPS.length - 1, br = last ? '└──' : '├──', pipe = last ? '    ' : '│   ';
      return `│       ${br} App_${a.n}_${a.slug}/\n` +
             `│       ${pipe} ├── ${stem}.html          ← DOUBLE-CLICK\n` +
             `│       ${pipe} ├── ${stem}_MANUAL.md\n` +
             `│       ${pipe} └── ${stem}_WIRING.pdf`;
    }).join('\n│       │\n');
    return `├── ${base}.zip\n│   └── ${base}/\n` +
           `│       ├── ${ed}_M${M.num}_START_HERE.md\n` +
           `│       ├── ${ed}_M${M.num}_Module_Overview.pdf\n│       │\n${apps}`;
  });
  /* Two separate edition ZIPs are the delivery — there is no combined outer ZIP. */
  const strip = (t) => t.replace(/^├── /, '').replace(/^│   /gm, '').replace(/^│       /gm, '    ').replace(/^│ ?$/gm, '');
  const treeTxt = `READ_ME_FIRST_Module_${M.num}_${M.slug}.md          ← आप यही पढ़ रहे हैं\n\n` +
    strip(full[0]) + '\n\n' + strip(full[1]);

  return `# READ ME FIRST — Medhava · Module ${M.num} · ${M.title}

इस ZIP में **दो अलग-अलग versions** हैं. दोनों में **वही ${APPS.length} apps** हैं, वही engine,
वही self-tests — फ़र्क़ सिर्फ़ data और नामों का है.

---

## दो अलग ZIP — दोनों अलग-अलग भेजी गई हैं

| ZIP का नाम | ये किसके लिए है |
|---|---|
| **\`MEDHAVA_Module_${M.num}_${M.slug}.zip\`** | ${ED.MEDHAVA.forWho} |
| **\`VASTRANGAM_Module_${M.num}_${M.slug}.zip\`** | ${ED.VASTRANGAM.forWho} |

**दोनों खोल सकते हैं, साथ-साथ.** दोनों अपना data अलग रखते हैं — एक दूसरे से टकराते नहीं.

कोई "बाहर वाली" ZIP नहीं है. ये दोनों सीधे आपको मिली हैं — जो चाहिए उसे extract कीजिए, बस.

---

## हर file का नाम खुद बता देगा कि वो क्या है

**हर एक file के नाम में version, module और app तीनों लिखे हैं:**

\`\`\`
MEDHAVA_M${M.num}_App01_${APPS[0].slug}.html
│       │   │     └── कौन सा app
│       │   └────────── App नंबर
│       └────────────── Module ${M.num}
└────────────────────── कौन सा version
\`\`\`

तो extract करने के बाद भी कभी confusion नहीं होगा.

---

## पूरा structure

\`\`\`
${treeTxt}
\`\`\`

---

## खोलने का तरीका (60 seconds)

1. **जो version चाहिए उस ZIP को extract करें** — \`MEDHAVA_…\` या \`VASTRANGAM_…\`.
   Windows: right-click → *Extract All* · Mac: double-click.
2. **App folder खोलें** — उस app की सारी चीज़ें उसी folder में हैं.
3. **\`.html\` file पर double-click करें.** बस, install हो गया.

> ⚠️ **एक ही गलती से बचना है:** ZIP के *अंदर* से सीधे \`.html\` मत खोलिए.
> Windows उसे एक temporary folder में खोलता है जो बाद में मिट जाता है — और आपका
> data गायब लगने लगता है. **पहले extract कीजिए, फिर खोलिए.**

**Phone पर:** \`.html\` file phone में डालिए → Chrome (Android) या Safari (iPhone) से
खोलिए → फिर **Add to Home screen**. उसका अपना icon बन जाएगा और बिल्कुल किसी भी
दूसरे app की तरह चलेगा — internet बंद हो तब भी.

Windows, Mac, Android और iPhone — चारों के पूरे step-by-step steps हर app की
\`_MANUAL.md\` file में हैं.

---

## इस module में क्या है

${appLines}

---

## कोई भी app किसी एक company पर निर्भर नहीं है

यह rule सिर्फ़ लिखा हुआ वादा नहीं है — **हर app इसे खुद check करता है, हर बार खुलने पर.**

किसी एक accounting software पर नहीं. किसी एक marketplace पर नहीं. किसी एक AI company पर
नहीं. किसी एक automation tool पर नहीं. किसी एक courier पर नहीं.

**App में देखिए:** बाएँ menu में **Connectors** screen खोलिए. वहाँ लिखा मिलेगा
"Outside services required: **0**" — और यह एक self-test है, tagline नहीं.

| Capability | कुछ options (जिनमें वो भी हैं जिनके लिए किसी की ज़रूरत नहीं) |
|---|---|
| **Books & ledger** | Medhava Books (built in) · Tally · BUSY · Marg · Zoho Books · QuickBooks · ERPNext (अपने server पर) · CSV आपके CA को |
| **Sales channels** | हाथ से डालिए · CSV import · Amazon · Flipkart · Myntra · Meesho · Ajio · Nykaa · JioMart · Shopify · WooCommerce · अपनी website |
| **AI writing** | Medhava templates (AI ही नहीं) · Ollama अपने computer पर · self-hosted Llama/Mistral · Claude · GPT · Gemini · DeepSeek · Groq · या खुद लिखिए |
| **AI images** | अपनी photo · Stable Diffusion/Flux अपने computer पर · Midjourney · OpenAI · Imagen · Firefly · Canva · Medhava Image Studio |
| **Automation** | Medhava Rules (built in) · n8n · Node-RED · Windmill · Airflow (अपने server पर) · n8n Cloud · Make · Zapier · Pipedream · cron · या हाथ से |
| **Couriers** | AWB हाथ से · अपनी delivery · Delhivery · Blue Dart · DTDC · Ecom · XpressBees · India Post · Shiprocket · NimbusPost |
| **Payments** | Cash · UPI direct अपने QR से (कोई commission नहीं) · Razorpay · PayU · Cashfree · PhonePe · Paytm · Stripe |

**तीन rules जो हर app अपने ऊपर लागू करता है:**

1. किसी भी capability में **एक ही option नहीं** — कम से कम तीन, अक्सर आठ से बारह.
2. हर capability में एक **built-in या हाथ से** करने वाला option है — यानी app **कुछ भी
   connect किए बिना पूरा चलता है.** कोई account नहीं, कोई internet नहीं, कोई subscription
   नहीं. Default भी वही है.
3. हर capability में एक option ऐसा है जो **आप अपने computer/server पर चला सकते हैं** — यानी
   आपका data किसी और के cloud में भेजना कभी मजबूरी नहीं है.

> **Provider बदलने से कोई figure नहीं बदलता.** हिसाब Medhava में रहता है, service में नहीं.
> इसका भी एक self-test है: *"switching a provider changes nothing else in your data"*.

> **Cloud service के लिए scoped, revocable key लगती है — कभी आपका password नहीं.**
> **Medhava कभी आपसे marketplace, bank या account का password नहीं माँगेगा.** अगर कोई screen
> माँगे, तो वो Medhava नहीं है.

---

## खुद check कीजिए (भरोसे पर मत जाइए)

**हिसाब सही है?** कोई भी app खोलिए → बाएँ menu में **Backup & Health** →
**Self-tests** panel देखिए. Tests app खुलते ही आपकी device पर चले थे, आपके data पर.

${M.selfCheck}

**सच में offline चलता है?** WiFi बंद करके page reload कर दीजिए.

---

## Verification report

| Build | Screens | Controls clicked | Self-tests | Console errors |
|---|---|---|---|---|
${M.verify.map(v => `| ${v.name} | ${v.screens} | ${v.clicks} | **${v.tests}** | **${v.errs}** |`).join('\n')}

हर screen असली browser में खोली गई और **उस पर का हर button दबाया गया**. कोई console
error, script error, या ऐसी screen जो दोबारा न बने — build fail हो जाती.

हर PDF का हर screenshot उसी shipped file से, double resolution पर लिया गया है.

---

**Medhava · One business. One brain.**
Module ${M.num} of 16 · ${M.title} · FY 2026-27
`;
}

function startHere(M, ed) {
  const e = ED[ed];
  const APPS = allApps(M);
  const base = `${ed}_Module_${M.num}_${M.slug}`;
  const appTree = APPS.map((a, i) => {
    const stem = `${ed}_M${M.num}_App${a.n}_${a.slug}`;
    const last = i === APPS.length - 1, br = last ? '└──' : '├──', pipe = last ? '    ' : '│   ';
    return `${br} App_${a.n}_${a.slug}/\n` +
           `${pipe} ├── ${stem}.html          ← DOUBLE-CLICK THIS\n` +
           `${pipe} ├── ${stem}_MANUAL.md\n` +
           `${pipe} └── ${stem}_WIRING.pdf`;
  }).join('\n│\n');
  const other = ed === 'MEDHAVA' ? 'VASTRANGAM' : 'MEDHAVA';
  return `# START HERE — ${ed} edition
## Medhava · Module ${M.num} · ${M.title}

**${APPS.length} app${APPS.length > 1 ? 's' : ''} in this edition${M.unified ? ' \u2014 the module\u2019s ' + WORD(M.apps.length) + ', and one more that is all ' + WORD(M.apps.length) + ' at once' : ''}.** (The other edition ships in its own ZIP.)

Nothing here is a mock-up. Every screen works, every button does something, and every
number is calculated live.

---

## 1 · What is in this folder

You are in the **${ed}** edition — ${ed === 'MEDHAVA'
      ? 'the unified ERP, industry-neutral, for any business.'
      : "the same app(s) carrying Vastrangam's own data, rules and examples."}

\`\`\`
${base}/
│
├── ${ed}_M${M.num}_START_HERE.md              ← you are reading this
├── ${ed}_M${M.num}_Module_Overview.pdf        ← the whole module, how it wires together
│
${appTree}
\`\`\`

Every filename starts with **${ed}_** so you always know which edition you have open.
The ${ED[other].label} edition ships in its own ZIP alongside this one, with **${other}_** on every file.

**Inside each app folder, three files:**

| File | What it is |
|---|---|
| \`….html\` | The app. **Double-click this.** One file, works offline. |
| \`…_MANUAL.md\` | The complete manual, for someone who has never installed software. |
| \`…_WIRING.pdf\` | Every screen, every process, every diagram — with real screenshots. |

---

## 2 · How to open it (60 seconds)

1. **Extract this ZIP** if you have not already. It was sent to you on its own —
   there is no outer ZIP to open first.
   Windows: right-click → *Extract All*. Mac: double-click it.
2. **Open the app folder** you want. Everything for that app is inside it.
3. **Double-click the \`.html\` file.** It opens in your browser. That is the entire installation.

${M.unified ? `> **Not sure where to start?** Open **App ${M.unified.n} · ${M.unified.name}** first.
> It is every app in this module over one set of records, and it is the only one you can type
> into — so it is the fastest way to see the whole module actually working.

` : ''}> ⚠️ **The one mistake to avoid:** opening the \`.html\` file directly from *inside* a ZIP.
> Windows unpacks it into a temporary folder that gets wiped, so your data appears to
> vanish later. **Always extract first.**

**On a phone:** put the \`.html\` file on your phone, open it with Chrome (Android) or
Safari (iPhone), then use **Add to Home screen**. It gets its own icon and behaves
exactly like any other app — including with the internet switched off.

Full step-by-step instructions for Windows, Mac, Android and iPhone are in each app's
\`_MANUAL.md\`.

---

## 3 · The app${APPS.length > 1 ? 's' : ''}

${APPS.map(a => `### App ${a.n} · ${a.name} — *${a.screens} screens, ${a.tests} self-tests*
${a.blurb}

${a.bullets.map(x => '- ' + x).join('\n')}`).join('\n\n')}

---

## 4 · Nothing is locked to one company

Every app in this module checks this on itself at every launch, and you can see it:
open the app → **Connectors** in the left menu.

- **No capability has only one choice.** Every one has at least three; most eight to twelve.
- **Every capability has a built-in or by-hand option**, so the app is fully usable with
  *nothing connected at all* — no account, no internet, no subscription. That is the default.
- **Every capability has an option you can host yourself**, so sending your data to
  somebody else's cloud is never forced.
- **Switching a provider never changes a figure.** The arithmetic lives in Medhava.

Books can be Medhava's own ledger, Tally, BUSY, Marg, Zoho, QuickBooks, self-hosted
ERPNext, or plain CSV to your CA. AI writing can be Medhava templates with no AI at all,
a model on your own machine, or Claude / GPT / Gemini / DeepSeek. Automation can be
Medhava Rules, your own n8n, Node-RED, Make, Zapier, or nothing. And so on, for every
capability an app touches.

> Cloud services connect with a scoped, revocable key — **never your account password.**
> Medhava will never ask for one.

---

## 5 · How to check it yourself

You do not have to take any of this on trust.

**Check the arithmetic:** open the app → **Backup & Health** in the left menu →
read the **Self-tests** panel. The tests ran the moment the app started, on your device,
against your data. They are written in plain English on purpose.

${M.selfCheck}

**Check it really works offline:** turn off your WiFi and reload the page.

---

## 6 · Your data

It lives in your own browser, on your own device. Nowhere else. Never on a server.

- Nobody else can see it.
- It survives closing the app and restarting the computer.
- It does **not** travel between your laptop and your phone by itself.
- Clearing your browser's "site data" **will** erase it.

**So take a backup weekly:** *Backup & Health → Export JSON.*
To move to another device: carry the app file and the backup, then *Import JSON*.

---

## 7 · Where this sits in the suite

${ROADMAP.mdTable(M.status, M.num)}

Every module follows exactly this shape: one ZIP, one ZIP per edition inside it, a folder
per app, a working HTML file, a complete manual, and an illustrated PDF built from real
screenshots of the shipped file.

---

**Medhava · One business. One brain.**
Module ${M.num} · ${M.title} · ${e.co} · FY 2026-27
`;
}

function pack(M) {
  const PKG = path.join(DIR, 'pkg');
  const STAGE = path.join(PKG, 'stage_m' + M.num), BUILD = path.join(PKG, 'build_m' + M.num);
  for (const d of [STAGE, BUILD]) { fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); }
  const SRC = path.join(DIR, 'pkgsrc'); if (!fs.existsSync(SRC)) fs.mkdirSync(SRC);

  /* The readme carries the module in its name too, so four downloaded modules never collide
     in a Downloads folder and you can always tell which one you are reading. */
  const readmeName = `READ_ME_FIRST_Module_${M.num}_${M.slug}.md`;
  fs.writeFileSync(path.join(STAGE, readmeName), readmeFirst(M));
  fs.writeFileSync(path.join(SRC, readmeName), readmeFirst(M));

  for (const ed of ['MEDHAVA', 'VASTRANGAM']) {
    const base = `${ed}_Module_${M.num}_${M.slug}`;
    const root = path.join(BUILD, base);
    fs.mkdirSync(root, { recursive: true });
    const sh = startHere(M, ed);
    fs.writeFileSync(path.join(root, `${ed}_M${M.num}_START_HERE.md`), sh);
    fs.writeFileSync(path.join(SRC, `${ed}_M${M.num}_START_HERE.md`), sh);
    fs.copyFileSync(path.join(DIR, M.overviewPdf), path.join(root, `${ed}_M${M.num}_Module_Overview.pdf`));
    for (const a of allApps(M)) {
      const dir = path.join(root, `App_${a.n}_${a.slug}`); fs.mkdirSync(dir, { recursive: true });
      const stem = `${ed}_M${M.num}_App${a.n}_${a.slug}`;
      fs.copyFileSync(path.join(DIR, a.html[ed]), path.join(dir, stem + '.html'));
      fs.copyFileSync(path.join(DIR, a.manual[ed]), path.join(dir, stem + '_MANUAL.md'));
      fs.copyFileSync(path.join(DIR, a.pdf[ed]), path.join(dir, stem + '_WIRING.pdf'));
    }
    execFileSync('zip', ['-q', '-r', '-X', path.join(STAGE, base + '.zip'), base], { cwd: BUILD });
  }
  /* Two edition ZIPs plus the readme are the delivery. No combined ZIP — it pushed
     Module 03 over the upload limit, and separate is what was asked for anyway. */
  const zips = ['MEDHAVA', 'VASTRANGAM'].map(ed => path.join(STAGE, `${ed}_Module_${M.num}_${M.slug}.zip`));
  zips.forEach(f => console.log('ZIP', path.basename(f).padEnd(44),
    Math.round(fs.statSync(f).size / 1024 / 1024 * 10) / 10 + 'MB'));
  console.log('MD ', readmeName.padEnd(44), Math.round(fs.statSync(path.join(STAGE, readmeName)).size / 1024) + 'KB');
  return { zips, readme: path.join(STAGE, readmeName) };
}

module.exports = { pack, readmeFirst, startHere, ED };
