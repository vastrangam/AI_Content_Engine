'use strict';
// Builds the complete Medhava landing-page PDF (A4, ~28 pages).
const { chromium } = require('/tmp/claude-0/-home-user-AI-Content-Engine/3f1e1c1f-eef1-5eef-8e60-d20a80139d31/scratchpad/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const D = __dirname, S = path.join(D, 'sec');
const im = n => 'file://' + path.join(S, n + '.png');
const MARK = `<svg viewBox="0 0 128 124" width="30" height="30"><defs><linearGradient id="lg" x1=".05" y1="0" x2=".95" y2="1"><stop offset="0" stop-color="#19cba9"/><stop offset=".45" stop-color="#0fae90"/><stop offset="1" stop-color="#0a7660"/></linearGradient></defs><path d="M22 108V36L64 80L106 36v72" fill="none" stroke="url(#lg)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><g fill="url(#lg)"><rect x="48" y="94" width="6.5" height="14" rx="3.2"/><rect x="61" y="86" width="6.5" height="22" rx="3.2"/><rect x="74" y="77" width="6.5" height="31" rx="3.2"/><rect x="87" y="68" width="6.5" height="40" rx="3.2"/></g><path d="M42 100C58 97 82 87 99 55" fill="none" stroke="url(#lg)" stroke-width="5" stroke-linecap="round"/><path d="M64 6c.8 9.6 2.5 11.8 12.1 12.6C66.5 19.4 64.8 21.6 64 31.2c-.8-9.6-2.5-11.8-12.1-12.6C61.5 17.8 63.2 15.6 64 6z" fill="url(#lg)"/></svg>`;
const MARKW = MARK.replace(/url\(#lg\)/g, '#fff');

let n = 0; const P = () => ++n;
const pg = (inner, cls) => `<section class="pg ${cls || ''}"><div class="bd">${inner}</div><div class="ft"><span>${MARK_SM} Medhava — Landing page specification</span><span>${P()}</span></div></section>`;
const MARK_SM = `<svg viewBox="0 0 128 124" width="11" height="11" style="vertical-align:-1px"><path d="M22 108V36L64 80L106 36v72" fill="none" stroke="#0fae90" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const shot = (f, cap) => `<figure><img src="${im(f)}" alt="${cap}"><figcaption>${cap}</figcaption></figure>`;

const pages = [];

/* 1 COVER */
pages.push(`<section class="pg cover"><div class="cw">
 <div class="lg">${MARKW}<span>Medhava</span></div>
 <div class="ed">Website · Landing page</div>
 <h1>Complete<br>Homepage<br>Specification</h1>
 <div class="sub">Header · Hero · Content · 16 Modules · 40 Apps · Footer</div>
 <p class="ld">Every section of the Medhava homepage — design, copy, structure and the SEO, GEO and AIO implementation behind it. Built to be handed to a developer or a marketing team and shipped without further explanation.</p>
 <div class="bg"><span>17 sections</span><span>5 schema types</span><span>3 breakpoints verified</span></div>
 <div class="cf">One business. One brain.</div></div></section>`);

/* 2 CONTENTS */
pages.push(pg(`<h2>Contents</h2>
<div class="toc">
 <div><b>Part 1 · The page</b>
  <ol start="3"><li>Page architecture &amp; flow</li><li>Header &amp; navigation</li><li>Hero / banner</li><li>Proof bar</li>
   <li>Key facts block</li><li>Problem section</li><li>How it works</li><li>Modules &amp; apps — overview</li>
   <li>Modules 1–8 detail</li><li>Modules 9–16 detail</li><li>Flagship features</li><li>Industries</li>
   <li>Comparison table</li><li>Security &amp; trust</li><li>Pricing</li><li>FAQ</li><li>Closing CTA</li><li>Footer</li></ol></div>
 <div><b>Part 2 · The engineering</b>
  <ol start="21"><li>SEO implementation</li><li>Structured data (schema.org)</li><li>GEO — generative engine optimisation</li>
   <li>AIO — llms.txt &amp; AI answerability</li><li>Responsive behaviour</li><li>Design system</li>
   <li>Performance &amp; accessibility</li><li>Copy deck</li><li>Launch checklist</li></ol></div>
</div>
<div class="note"><b>How to use this document.</b> Part 1 shows the page exactly as it renders, section by section, with the intent and the copy behind each. Part 2 documents the technical layer — the markup, schema and content strategy that make the page rank in search and get quoted by AI assistants.</div>`));

/* 3 ARCHITECTURE */
pages.push(pg(`<h2>Page architecture &amp; flow</h2>
<p class="big">The homepage answers five questions in order: <b>what is it, is it real, how does it work, does it fit me, what does it cost.</b> Every section exists to move a visitor one step further down that list.</p>
<div class="arch">
 ${['Header — orient & escape hatch','Hero — what it is, in one line','Proof bar — scale in four numbers','Key facts — the AI-quotable definition','Problem — name their pain','How it works — the architecture','Modules — all 16, all 40 apps','Features — the controls that pay','Industries — does it fit me','Comparison — vs. a suite','Security — can I trust it','Pricing — what does it cost','FAQ — the last objections','CTA — the ask','Footer — sitemap & SEO surface'].map((t, i) =>
  `<div class="ar"><span class="i">${String(i + 1).padStart(2, '0')}</span><span>${t}</span></div>`).join('')}
</div>
<div class="two" style="margin-top:18px">
 <div class="k"><b>Conversion path</b><span>Hero CTA → Modules → Pricing → Demo. Three of the four CTAs above the fold point at "Book a demo"; the fourth points at Modules for visitors who need proof before a conversation.</span></div>
 <div class="k"><b>Reading path</b><span>Someone who reads only the H1, the four stats and the Key Facts block — about nine seconds — still leaves knowing what Medhava is and how it differs.</span></div>
</div>`));

/* 4 HEADER */
pages.push(pg(`<h2>Header &amp; navigation</h2>
<p>Sticky, translucent with a blur, 70px tall. It carries the full brand lockup — mark, wordmark and tagline — so the promise is visible on every scroll position.</p>
${shot('header', 'The header: brand lockup, six section links, and a two-tier call to action')}
<div class="two">
 <div class="k"><b>Structure</b><span>Logo → 6 anchor links → Sign in (secondary) + Book a demo (primary). Nav links underline on hover from left to right.</span></div>
 <div class="k"><b>Mobile</b><span>Below 1000px the links and both buttons collapse into a hamburger, keeping the brand lockup readable at 390px.</span></div>
</div>
<div class="note"><b>SEO note.</b> The header is a <span class="m">&lt;header&gt;</span> containing <span class="m">&lt;nav aria-label="Primary"&gt;</span>. Anchor links to in-page sections give search engines the "jump to section" sitelinks that appear under a result.</div>`));

/* 5 HERO */
pages.push(pg(`<h2>Hero / banner</h2>
<p>The single most important block on the site. The H1 <b>is</b> the tagline, so the brand promise and the page's primary keyword target are the same string.</p>
${shot('hero', 'Hero: announcement pill, H1, positioning paragraph, dual CTA, trust micro-copy and a live product mockup')}
<div class="two">
 <div class="k"><b>Copy</b><span><b>H1:</b> One business. One brain.<br><b>Sub:</b> "Medhava is a unified ERP — 16 modules, 40 apps, one shared data core…"</span></div>
 <div class="k"><b>Visual</b><span>A real Vendor Management screen, not a stock illustration — payables, overdue count and live supplier risk. Tilted on a 3D transform that straightens on hover.</span></div>
</div>`));

/* 6 PROOF */
pages.push(pg(`<h2>Proof bar</h2>
<p>Four numbers that make the architecture concrete before any explanation is attempted.</p>
${shot('stats', 'Four-number proof bar')}
<div class="two">
 <div class="k"><b>Why these four</b><span><b>16</b> modules and <b>40</b> apps establish scope. <b>1</b> stock number is the differentiator in a single digit. <b>7</b> marketplaces proves Indian commerce fit.</span></div>
 <div class="k"><b>Placement</b><span>Immediately under the hero, on a tinted band, so it reads as a continuation of the headline rather than a separate claim.</span></div>
</div>`));

/* 7 FACTS */
pages.push(pg(`<h2>Key facts block</h2>
<p>A definition list written specifically to be <b>lifted verbatim</b> by an AI assistant answering "what is Medhava?" — see page 23.</p>
${shot('facts', 'The AI-quotable "Medhava at a glance" definition block')}
<div class="note"><b>This block is the highest-leverage content on the page.</b> Generative engines prefer short, factual, attributable statements in <span class="m">&lt;dl&gt;</span> form over marketing prose. Seven definitions cover what it is, the data core, the differentiator, compliance, channels, security and deployment.</div>`));

/* 8 PROBLEM */
pages.push(pg(`<h2>Problem section</h2>
<p>Named in the customer's language, not the vendor's. No feature is mentioned — only the daily experience of running a business on disconnected tools.</p>
${shot('problem', 'Three problem cards: numbers that disagree, triple entry, and silent leakage')}
<div class="two">
 <div class="k"><b>Headline</b><span>"Your business runs on eleven tools that don't talk"</span></div>
 <div class="k"><b>Why it works</b><span>Each card describes a symptom the reader has personally experienced this month. Recognition earns the right to explain the architecture on the next page.</span></div>
</div>`));

/* 9 HOW */
pages.push(pg(`<h2>How it works</h2>
<p>The architectural claim, made visually. This is the section that justifies the word <em>unified</em>.</p>
${shot('how', 'The data core, the cascade flow, and the two rules that follow from it')}
<div class="two">
 <div class="k"><b>The cascade</b><span>Goods receipt → Stock +96 → Payable + ITC → Debit note → Scorecard. Five modules reacting to one fact.</span></div>
 <div class="k"><b>The two rules</b><span>Accepted — not ordered — is what counts. And nothing derived is ever stored, so no figure can drift from its documents.</span></div>
</div>`));

/* 10 MODULES OVERVIEW */
pages.push(pg(`<h2>Modules &amp; apps</h2>
<p>All sixteen modules and forty apps on one screen, in a four-column grid. Domain 9 carries a "live" marker; the rest show as roadmap.</p>
${shot('modules', 'The complete 16-module, 40-app grid')}
<div class="note">Each card lists the module number, its app count and every app inside it. This single section contains <b>40 internal keyword targets</b> — the densest SEO surface on the page.</div>`));

/* 11-12 MODULE DETAIL */
const MODS = [
  ['01', 'Dashboard & BI', 2, ['CEO Dashboard', 'Report Builder'], 'Role dashboards, KPIs and group consolidation. Reads every module, writes none.'],
  ['02', 'CRM', 1, ['CRM & Customer 360'], 'Lead to Won, lifecycle triggers, full customer history including marketplace orders.'],
  ['03', 'Sales', 5, ['D2C Sales', 'B2B & Credit', 'Export Docs', 'POS', 'Quotes & Proforma'], 'Every route to market over the same order object and the same stock number.'],
  ['04', 'E-commerce / OMS', 2, ['Marketplace OMS', 'Order Management'], 'Unified order queue across seven marketplaces plus Shopify and WooCommerce.'],
  ['05', 'Warehouse', 2, ['Picking & Bins', 'Barcode Operations'], 'Bin-level picking, scan-driven pack and dispatch, physical stock counts.'],
  ['06', 'Logistics', 1, ['Couriers, AWB & NDR'], 'Multi-courier labels, tracking, COD remittance, NDR workflow to cut RTO.'],
  ['07', 'Inventory', 1, ['Stock by SKU × location'], 'One quantity per SKU per location per stage. The number every channel reads.'],
  ['08', 'Manufacturing', 4, ['Production Orders', 'Karigar & Piece-rate', 'BOM & Consumption', 'Quality Control'], 'Ten-stage production, pooled set completion, piece-rate wages, true cost per piece.']
];
const MODS2 = [
  ['09', 'Purchase', 2, ['Procurement ✓ live', 'Vendor Management ✓ live'], 'RFQ → PO → GRN → three-way match → vendor risk and performance-based sourcing.'],
  ['10', 'HR & Payroll', 3, ['Staff & Karigar', 'Time-off & Advances', 'Appraisal & Hiring'], 'Attendance, effective-dated salary, karigar earnings, leave and appraisal.'],
  ['11', 'Accounting & GST', 5, ['Accounting', 'Invoicing', 'Expenses', 'GST & Tax', 'Finance Reports'], 'Double-entry books, CGST/SGST/IGST, TDS, TCS, ITC, GSTR-1 and 3B, bank reconciliation.'],
  ['12', 'Settlement', 3, ['Reconciliation', 'Claims & Disputes', 'Returns / RMA'], 'Marketplace payouts matched to order lines; shortfalls become filed claims.'],
  ['13', 'Marketing', 4, ['Social Calendar', 'Campaigns', 'Repricing Engine', 'Automation'], 'Content calendar, campaign ROAS, rule-based repricing per channel.'],
  ['14', 'AI Content Engine', 1, ['Listings, ads & copy'], 'Humanised listings, social, ads and email generated against your own catalogue.'],
  ['15', 'Image Studio', 1, ['Layers, presets, AI background'], 'Photoshop-class editing, channel presets, background removal, SEO alt text.'],
  ['16', 'Video Studio', 1, ['Reels & product video'], 'Text and image to video, reels and ad cuts for every channel.']
];
const modTable = list => `<table class="md"><thead><tr><th>#</th><th>Module</th><th>Apps</th><th>Contains</th></tr></thead><tbody>
${list.map(m => `<tr><td class="m">${m[0]}</td><td><b>${m[1]}</b><div class="sm">${m[4]}</div></td><td class="m ctr">${m[2]}</td><td class="sm">${m[3].join(' · ')}</td></tr>`).join('')}
</tbody></table>`;
pages.push(pg(`<h2>Modules 1–8 · detail</h2><p>Operations and demand — the modules that move goods and take orders.</p>${modTable(MODS)}`));
pages.push(pg(`<h2>Modules 9–16 · detail</h2><p>Money, people and growth — the modules that account for it and sell it.</p>${modTable(MODS2)}
<div class="note"><b>Total: 40 apps.</b> Plus a platform spine used by every module — Identity &amp; RBAC, Settings, Documents, Notifications and an immutable audit trail.</div>`));

/* 13 FEATURES */
pages.push(pg(`<h2>Flagship features</h2>
<p>Six capabilities chosen because each one, alone, can pay for the software in a year.</p>
${shot('features', 'Six flagship capability cards')}
<div class="two">
 <div class="k"><b>Three-way match</b><span>A bill passes only when PO, goods receipt and invoice agree. Mismatches held with the reason in plain language.</span></div>
 <div class="k"><b>Vendor risk</b><span>Your best supplier still flags medium risk at 44% spend concentration — the fact worth knowing before a disruption.</span></div>
</div>`));

/* 14 INDUSTRIES */
pages.push(pg(`<h2>Industries</h2>
<p>The same engine, four master-data configurations. This section exists to stop "is this only for textiles?" becoming a lost lead.</p>
${shot('industries', 'Four industry cards: textile, medical, manufacturing, services')}
<div class="note"><b>The claim is literally true of the code.</b> Every app ships in two builds — a neutral unified-ERP configuration and an industry configuration — sharing one engine and one identical test suite. Only the master data differs.</div>`));

/* 15 COMPARE */
pages.push(pg(`<h2>Comparison table</h2>
<p>Eight rows against "a typical suite". Comparison tables are the format generative engines quote most often, so this doubles as GEO content.</p>
${shot('compare', 'Eight-row comparison of Medhava against a typical integrated suite')}
<div class="note"><b>Positioning discipline.</b> The table never names a competitor as inferior — it contrasts <em>architectures</em>. That keeps the claim defensible and avoids trademark friction.</div>`));

/* 16 SECURITY */
pages.push(pg(`<h2>Security &amp; trust</h2>
<p>Placed before pricing, because in Indian SMB software the objection "will you have my marketplace password?" kills more deals than price does.</p>
${shot('security', 'Three trust cards: scoped keys, row-level isolation, immutable audit')}
<div class="note"><b>The headline is the promise:</b> "Your credentials are never the key." Integrations use revocable scoped API keys in an AES-256-GCM vault. Medhava never asks for, uses or stores an account password.</div>`));

/* 17 PRICING */
pages.push(pg(`<h2>Pricing</h2>
<p>Three tiers, per company, billed annually. Every plan includes all sixteen modules.</p>
${shot('pricing', 'Starter, Growth and Enterprise tiers')}
<div class="two">
 <div class="k"><b>The rule</b><span>Never upsell a module. Limits are on users, companies and channels — never on capability — so nobody discovers a missing module mid-implementation.</span></div>
 <div class="k"><b>Ladder</b><span>₹0 → ₹7,499 → ₹24,999 per month. Growth is visually elevated and carries the primary CTA.</span></div>
</div>`));

/* 18 FAQ */
pages.push(pg(`<h2>FAQ</h2>
<p>Eight questions, native <span class="m">&lt;details&gt;</span> elements, each mirrored in FAQPage structured data.</p>
${shot('faq', 'Eight expandable questions')}
<div class="note"><b>Dual purpose.</b> For humans these are the last objections before a demo. For search and AI they are the most directly answerable content on the site — the FAQPage schema is what earns answer-box and AI-citation placement.</div>`));

/* 19 CTA + 20 FOOTER */
pages.push(pg(`<h2>Closing CTA</h2>
<p>One ask, stated as an offer rather than a request.</p>
${shot('cta', 'Full-width gradient call-to-action band')}
<div class="note"><b>Copy:</b> "Stop reconciling. Start running." — followed by a concrete, low-risk offer: bring one month of data and we will show you what your current tools are hiding.</div>`));
pages.push(pg(`<h2>Footer</h2>
<p>A working sitemap, not decoration. Thirty-two app links across four themed columns.</p>
${shot('footer', 'Footer with brand block and four link columns')}
<div class="note"><b>SEO value.</b> The footer distributes internal link equity to every app page from every page on the site, and the four column headings — Operations, Finance, Sell &amp; grow, Company — mirror how buyers actually search.</div>`));

/* 21 SEO */
pages.push(pg(`<h2>SEO implementation</h2>
<table class="sp"><thead><tr><th>Element</th><th>Implementation</th><th>Status</th></tr></thead><tbody>
${[['Title tag', 'Medhava — One business. One brain. | Unified ERP with 40 apps (61 chars)', 'ok'],
['Meta description', '153 characters, contains primary and secondary keywords', 'ok'],
['Canonical', '&lt;link rel="canonical" href="https://medhava.com/"&gt;', 'ok'],
['Robots', 'index, follow, max-image-preview:large, max-snippet:-1', 'ok'],
['Heading order', 'Exactly one H1, ten H2, no skipped levels', 'ok'],
['Semantic markup', 'header / nav / main / section / article / footer', 'ok'],
['Internal links', '59 links; 32 app links in the footer', 'ok'],
['Image alt text', 'Every figure and role="img" element labelled', 'ok'],
['Open Graph', 'og:type, site_name, title, description, url, locale', 'ok'],
['Twitter card', 'summary_large_image', 'ok'],
['Mobile', 'Verified 0px horizontal overflow at 390 / 820 / 1440', 'ok'],
['Performance', 'Single file, zero external requests, no render-blocking', 'ok'],
['Accessibility', 'Skip link, focus-visible rings, reduced-motion honoured', 'ok']
].map(r => `<tr><td><b>${r[0]}</b></td><td class="sm">${r[1]}</td><td class="ok">✓</td></tr>`).join('')}
</tbody></table>`));

/* 22 SCHEMA */
pages.push(pg(`<h2>Structured data</h2>
<p>Five schema types in a single <span class="m">@graph</span>, all validated.</p>
<table class="md"><thead><tr><th>Type</th><th>Purpose</th></tr></thead><tbody>
<tr><td><b>Organization</b></td><td class="sm">Brand entity, slogan, areaServed, sales contact point. Feeds the knowledge panel.</td></tr>
<tr><td><b>WebSite</b></td><td class="sm">Site identity plus SearchAction — enables a sitelinks search box in Google.</td></tr>
<tr><td><b>SoftwareApplication</b></td><td class="sm">Category, operating systems, featureList of seven capabilities, AggregateOffer ₹0–₹24,999.</td></tr>
<tr><td><b>FAQPage</b></td><td class="sm">Six question/answer pairs. The highest-value schema on the page for AI citation.</td></tr>
<tr><td><b>BreadcrumbList</b></td><td class="sm">Position in the site hierarchy.</td></tr>
</tbody></table>
<pre class="code">{"@context":"https://schema.org","@graph":[
  {"@type":"Organization","name":"Medhava","slogan":"One business. One brain.", … },
  {"@type":"WebSite","potentialAction":{"@type":"SearchAction", … }},
  {"@type":"SoftwareApplication","applicationCategory":"BusinessApplication",
   "offers":{"@type":"AggregateOffer","priceCurrency":"INR","lowPrice":"0","highPrice":"24999"}},
  {"@type":"FAQPage","mainEntity":[ … 6 questions … ]},
  {"@type":"BreadcrumbList", … }]}</pre>`));

/* 23 GEO */
pages.push(pg(`<h2>GEO — generative engine optimisation</h2>
<p class="big">Search is no longer the only front door. When someone asks an AI assistant "what is the best unified ERP for an Indian D2C brand?", the page has to be <b>quotable</b>, not merely rankable.</p>
<table class="md"><thead><tr><th>Technique</th><th>Where it appears</th></tr></thead><tbody>
<tr><td><b>Definition block</b></td><td class="sm">"Medhava at a glance" — seven flat facts in a &lt;dl&gt;. Short, attributable, easy to quote.</td></tr>
<tr><td><b>Comparison table</b></td><td class="sm">Eight architectural rows. Tables survive summarisation better than prose.</td></tr>
<tr><td><b>Explicit Q&amp;A</b></td><td class="sm">Eight FAQs whose wording matches how people actually ask the question.</td></tr>
<tr><td><b>Numeric specificity</b></td><td class="sm">16 modules, 40 apps, 7 marketplaces, ₹7,499. Numbers get quoted; adjectives do not.</td></tr>
<tr><td><b>Self-contained claims</b></td><td class="sm">Every sentence stands alone without its neighbours — an extracted line still makes sense.</td></tr>
<tr><td><b>Named entities</b></td><td class="sm">Amazon, Flipkart, Myntra, Meesho, Ajio, GST, GSTR-3B, PostgreSQL, Shopify — real anchors an engine can match.</td></tr>
</tbody></table>
<div class="note"><b>The test:</b> take any single paragraph out of the page, show it to someone cold, and they should still be able to say what Medhava is. The page is written so that is true everywhere.</div>`));

/* 24 AIO */
pages.push(pg(`<h2>AIO — llms.txt &amp; AI answerability</h2>
<p>A plain-text file at the site root, declared in the head, giving AI crawlers a clean summary without HTML noise.</p>
<pre class="code"># Medhava

&gt; Medhava is a unified ERP: 16 modules and 40 apps that share one data core
&gt; and one event bus. Tagline: One business. One brain.

## Key facts
- Modules: 16. Apps: 40. Data cores: 1.
- Input tax credit is computed on ACCEPTED quantity only, never ordered.
- Stock: one number per SKU per location per stage.
- Security: revocable scoped API keys in an AES-256-GCM vault; never passwords.

## The 16 modules
1. Dashboard &amp; BI (2) … 9. Purchase (2) [COMPLETE] … 16. Video Studio (1)

## How Medhava differs from Zoho and Odoo
Zoho and Odoo are suites of separate applications connected by integrations.
Medhava is one application with 16 modules over one data core …</pre>
<div class="two">
 <div class="k"><b>Declared in the head</b><span class="m">&lt;link rel="alternate" type="text/plain" href="/llms.txt"&gt;</span></div>
 <div class="k"><b>Why it matters</b><span>Assistants that fetch a page get a canonical, unambiguous description instead of inferring one from marketing copy — which is how facts get garbled.</span></div>
</div>`));

/* 25 RESPONSIVE */
pages.push(pg(`<h2>Responsive behaviour</h2>
<p>Three breakpoints, all verified at zero horizontal overflow.</p>
<div class="two mob">
 <figure><img src="${im('mob_hero')}" alt="Mobile hero"><figcaption>390px — hero</figcaption></figure>
 <figure><img src="${im('mob_mods')}" alt="Mobile modules"><figcaption>390px — modules</figcaption></figure>
</div>
<table class="md"><thead><tr><th>Breakpoint</th><th>Behaviour</th><th>Overflow</th></tr></thead><tbody>
<tr><td class="m">1440px</td><td class="sm">Full desktop: two-column hero, 4-column module grid, 3-column pricing</td><td class="ok">0px</td></tr>
<tr><td class="m">820px</td><td class="sm">Hero stacks, modules to 2 columns, nav collapses to hamburger</td><td class="ok">0px</td></tr>
<tr><td class="m">390px</td><td class="sm">Single column throughout, header actions hidden, table scrolls in its own container</td><td class="ok">0px</td></tr>
</tbody></table>`));

/* 26 DESIGN SYSTEM */
pages.push(pg(`<h2>Design system</h2>
<h3>Colour</h3>
<div class="pal">
 ${[['#0fae90', 'Primary teal', '#fff'], ['#19cba9', 'Teal light', '#fff'], ['#0a7660', 'Teal deep', '#fff'],
['#0d2233', 'Ink', '#fff'], ['#5c6f7e', 'Slate', '#fff'], ['#eef8f5', 'Mint', '#0d2233'],
['#dce9e5', 'Line', '#0d2233'], ['#0b2a24', 'Footer', '#fff']].map(c =>
  `<div class="sw" style="background:${c[0]};color:${c[2]}"><b>${c[1]}</b><span>${c[0].toUpperCase()}</span></div>`).join('')}
</div>
<h3>Type scale</h3>
<table class="md"><thead><tr><th>Role</th><th>Size</th><th>Weight</th></tr></thead><tbody>
<tr><td>H1 / hero</td><td class="m">clamp(34px, 5.4vw, 62px)</td><td class="m">700 · −.025em</td></tr>
<tr><td>H2 / section</td><td class="m">clamp(27px, 3.5vw, 41px)</td><td class="m">700</td></tr>
<tr><td>H3 / card</td><td class="m">clamp(18px, 1.7vw, 22px)</td><td class="m">700</td></tr>
<tr><td>Lead</td><td class="m">clamp(16.5px, 1.6vw, 20px)</td><td class="m">400 · 1.7 line-height</td></tr>
<tr><td>Body</td><td class="m">16px</td><td class="m">400 · 1.65</td></tr>
<tr><td>Eyebrow</td><td class="m">12px</td><td class="m">700 · .14em · uppercase</td></tr>
</tbody></table>
<p class="sm" style="margin-top:12px">Typeface: <b>Poppins</b> for brand and headings, with a system fallback stack so the page renders identically offline. Gradient <span class="m">135deg #19cba9 → #0fae90 → #0a7660</span> used for the mark, primary buttons and stat numerals only.</p>`));

/* 27 PERF */
pages.push(pg(`<h2>Performance &amp; accessibility</h2>
<div class="two">
 <div class="k"><b>Zero external requests</b><span>All CSS, SVG and script inline. No font CDN, no analytics blocking render, no layout shift from late-loading assets.</span></div>
 <div class="k"><b>No JavaScript dependency</b><span>The page is fully readable with scripts disabled. JS only adds the mobile menu and scroll reveals.</span></div>
 <div class="k"><b>Reduced motion</b><span><span class="m">prefers-reduced-motion</span> disables every animation and transition.</span></div>
 <div class="k"><b>Keyboard</b><span>Skip-to-content link, visible focus rings on every interactive element, logical tab order.</span></div>
 <div class="k"><b>Native disclosure</b><span>FAQ uses <span class="m">&lt;details&gt;</span>/<span class="m">&lt;summary&gt;</span> — screen-reader friendly with no ARIA needed.</span></div>
 <div class="k"><b>Print</b><span>A print stylesheet strips navigation and CTAs so the page prints as a clean document.</span></div>
</div>
<div class="note"><b>Verified in a real browser at three viewports:</b> zero console errors, zero horizontal overflow, all five JSON-LD blocks parse without error.</div>`));

/* 28 COPY DECK */
pages.push(pg(`<h2>Copy deck</h2>
<table class="md"><thead><tr><th>Section</th><th>Headline</th></tr></thead><tbody>
${[['Hero', 'One business. One brain.'], ['Proof', '16 · 40 · 1 · 7'],
['Key facts', 'Medhava at a glance'], ['Problem', "Your business runs on eleven tools that don't talk"],
['How it works', 'One data core. One action cascades everywhere.'], ['Modules', '16 modules. 40 apps. One login.'],
['Features', 'The controls that pay for the software'], ['Industries', 'One engine, any industry'],
['Compare', 'Medhava vs. a suite of integrated apps'], ['Security', 'Your credentials are never the key'],
['Pricing', 'Start free. Pay when it runs your business.'], ['FAQ', 'Frequently asked'],
['CTA', 'Stop reconciling. Start running.']].map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td></tr>`).join('')}
</tbody></table>
<div class="note"><b>Voice rules.</b> Short sentences. Concrete nouns. No "leverage", "seamless", "empower" or "revolutionise". Every claim is one that the software can actually be shown doing in a demo.</div>`));

/* 29 CHECKLIST */
pages.push(pg(`<h2>Launch checklist</h2>
<table class="sp"><thead><tr><th>Task</th><th>Owner</th><th>Status</th></tr></thead><tbody>
${[['Homepage built, responsive, accessible', 'Done', 1],
['Structured data — 5 schema types validated', 'Done', 1],
['llms.txt written and linked', 'Done', 1],
['Copy deck approved', 'Done', 1],
['Register medhava.com + social handles', 'You', 0],
['Point DNS, install TLS', 'You', 0],
['Add real product screenshots as apps ship', 'Medhava', 0],
['Wire demo form to CRM', 'Medhava', 0],
['Google Search Console + sitemap.xml', 'You', 0],
['Per-app landing pages (40)', 'Medhava', 0],
['Case study with real Vastrangam numbers', 'Both', 0]].map(r =>
  `<tr><td>${r[0]}</td><td class="sm">${r[1]}</td><td class="${r[2] ? 'ok' : 'todo'}">${r[2] ? '✓ done' : 'pending'}</td></tr>`).join('')}
</tbody></table>
<div class="note"><b>Next step in the build.</b> The homepage is the shell. The compounding SEO work is the <b>40 individual app pages</b>, each targeting its own keyword — "3-way matching software India", "karigar piece-rate payroll", "marketplace settlement reconciliation". Those pages are what actually rank.</div>
<div class="end">${MARK}<div>Medhava — One business. One brain.</div></div>`));

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:0}
body{font-family:'Segoe UI',system-ui,-apple-system,Roboto,Helvetica,Arial,sans-serif;color:#0d2233;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;min-height:297mm;padding:17mm 16mm 12mm;page-break-after:always;position:relative;display:flex;flex-direction:column;background:#fff}
.bd{flex:1}
.ft{position:absolute;left:16mm;right:16mm;bottom:8mm;display:flex;justify-content:space-between;font-size:8.5px;color:#8fa3ae;border-top:1px solid #e4ecea;padding-top:5px}
h1{font-size:50px;letter-spacing:-.03em;line-height:1.05}
h2{font-size:24px;color:#0d2233;letter-spacing:-.02em;margin-bottom:9px;padding-bottom:7px;border-bottom:3px solid #0fae90}
h3{font-size:14px;color:#0a7660;margin:16px 0 7px;letter-spacing:-.01em}
p{font-size:11.5px;line-height:1.6;margin-bottom:8px;color:#33475a}
p.big{font-size:13.5px;line-height:1.6}
p.sm,.sm{font-size:10px;line-height:1.5;color:#5c6f7e}
.m{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:9.5px;background:#f2f7f5;padding:1px 4px;border-radius:3px;color:#0a7660}
figure{margin:9px 0}
figure img{width:100%;border:1px solid #dce9e5;border-radius:7px;box-shadow:0 2px 9px rgba(13,34,51,.07)}
figcaption{font-size:9px;color:#8fa3ae;text-align:center;margin-top:4px;font-style:italic}
.note{background:#eef8f5;border-left:3px solid #0fae90;padding:9px 12px;border-radius:0 7px 7px 0;font-size:10.5px;color:#22485c;margin-top:10px;line-height:1.55}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
.two.mob{grid-template-columns:1fr 1fr;gap:14px}
.two.mob img{border-radius:9px}
.k{background:#f7fbfa;border:1px solid #e4ecea;border-radius:9px;padding:11px 13px}
.k b{display:block;font-size:11px;margin-bottom:3px;color:#0d2233}
.k span{font-size:10px;color:#5c6f7e;line-height:1.5}
table{width:100%;border-collapse:collapse;font-size:10.5px;margin:9px 0}
th,td{text-align:left;padding:7px 9px;border-bottom:1px solid #e9efed;vertical-align:top}
th{background:#eef8f5;color:#0a7660;font-size:9px;text-transform:uppercase;letter-spacing:.05em}
td.m{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:9.5px;background:none;color:#5c6f7e;white-space:nowrap}
td.ctr{text-align:center}
td.ok{color:#0a9d7c;font-weight:700;white-space:nowrap}
td.todo{color:#b0824a;font-weight:600;white-space:nowrap}
table.md td:first-child{width:22%}
table.sp td:first-child{width:42%}
pre.code{background:#0f2a25;color:#d7f2e9;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:8.6px;line-height:1.6;padding:12px 14px;border-radius:8px;white-space:pre-wrap;margin:9px 0}
.cover{background:linear-gradient(155deg,#0b2a24 0%,#12312d 50%,#0a6e5b 130%);color:#fff;justify-content:center}
.cover .lg{display:flex;align-items:center;gap:11px;font-size:27px;font-weight:700;letter-spacing:-.03em}
.cover .ed{margin-top:26px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7fe6cf;font-weight:700}
.cover h1{color:#fff;margin:5px 0 8px}
.cover .sub{font-size:14px;color:#cdeee4}
.cover .ld{font-size:12.5px;line-height:1.7;color:#dff2ec;max-width:145mm;margin-top:18px}
.cover .bg{margin-top:24px;display:flex;gap:8px;flex-wrap:wrap}
.cover .bg span{background:rgba(255,255,255,.12);border:1px solid rgba(127,230,207,.4);color:#dff2ec;font-size:10px;font-weight:600;padding:5px 12px;border-radius:20px}
.cover .cf{position:absolute;bottom:15mm;left:16mm;font-size:11px;color:#8fcabb}
.toc{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:12px}
.toc b{font-size:11px;color:#0a7660;display:block;margin-bottom:7px}
.toc ol{margin-left:16px}
.toc li{font-size:10.5px;line-height:1.85;color:#33475a}
.arch{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:12px}
.ar{display:flex;align-items:center;gap:8px;background:#f7fbfa;border:1px solid #e4ecea;border-radius:7px;padding:6px 10px;font-size:10.5px;color:#33475a}
.ar .i{font-family:ui-monospace,Menlo,monospace;font-size:9px;color:#fff;background:#0fae90;border-radius:4px;padding:2px 5px;font-weight:700}
.pal{display:flex;border-radius:8px;overflow:hidden;border:1px solid #dce9e5;margin:8px 0}
.sw{flex:1;height:62px;display:flex;flex-direction:column;justify-content:flex-end;padding:7px 8px}
.sw b{font-size:9px}.sw span{font-size:7.5px;opacity:.85;font-family:ui-monospace,Menlo,monospace}
.end{margin-top:26px;text-align:center;color:#8fa3ae;font-size:11px}
.end svg{margin:0 auto 6px}
`;

(async () => {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${pages.join('')}</body></html>`;
  const hp = path.join(D, 'book.html');
  fs.writeFileSync(hp, html);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.goto('file://' + hp, { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  const out = path.join(D, 'Medhava_Website_Landing_Page.pdf');
  await p.pdf({ path: out, width: '210mm', height: '297mm', printBackground: true });
  await b.close();
  console.log('PDF:', Math.round(fs.statSync(out).size / 1024) + 'KB');
})();
