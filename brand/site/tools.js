'use strict';
/* THE TOOLS REGISTER — free first, paid only when something forces it.

   WHY THIS IS A FILE AND NOT A PARAGRAPH
   "We will use free tools where possible" is the easiest sentence in software
   to write and the hardest to keep. Six weeks in, a paid service is in the
   stack because it was quicker that afternoon, and nobody can say what it
   replaced or why the free thing stopped being enough.

   So every capability is an entry, and every entry answers four questions:
   what free option covers this, what paid option exists, THE EXACT CONDITION
   that forces the upgrade, and what it would cost to keep it self-hosted
   instead. checkrules-style enforcement lives in checktools.js: a paid entry
   with no free predecessor and no stated trigger fails the build, because that
   is a preference wearing a requirement's clothes.

   THE SHAPE OF THE ANSWER
   Medhava runs on zero rupees of software licence until real usage moves it.
   Not as a stunt — as the thing that makes it adoptable by a business that has
   never bought software before. The paid lines that do appear are the ones
   with no free path in existence: sending a WhatsApp Business message, calling
   a marketplace API, taking a card payment, booking a courier pickup, and AI
   inference beyond what a laptop runs.

   free       what covers this at no software cost
   paid       the paid option, if and when it becomes necessary
   trigger    the concrete condition that forces the move. Required whenever
              `paid` is set. "When we grow" is not a trigger; a number is.
   selfHost   the run-it-yourself route, and its real cost (hardware/time)
   iface      the service interface it sits behind — the reason switching is
              an adapter change rather than a project
   note       anything a reader would otherwise have to find out the hard way

   Figures are the published free tiers as read on 2026-08-23. Tiers move. The
   date is here so a change is visible rather than silent. */

const ASOF = '2026-08-23';

module.exports = { asOf: ASOF, tools: [

/* ── the spine ─────────────────────────────────────────────────────────── */
{ id:'db', cap:'Database, auth and row-level security', phase:'0',
  free:'Supabase free tier — Postgres 16, 500 MB, 50k monthly active users, daily backups',
  paid:'Supabase Pro, about $25 a month',
  trigger:'past 500 MB of data or 50k monthly active users, or when point-in-time recovery is needed',
  selfHost:'Postgres on a VPS — the software is free, a small VPS is roughly $6–12 a month',
  iface:'DatabaseService',
  note:'The schema in core/schema.postgres.sql is ordinary Postgres. Nothing in it is Supabase-specific except the RLS policies reading auth context, which is a dozen lines.' },

{ id:'host', cap:'Hosting the web application', phase:'0',
  free:'Vercel Hobby, Cloudflare Pages or Netlify free tier — enough for a pilot and a demo',
  paid:'Vercel Pro, about $20 a month per member',
  trigger:'commercial use under their terms, or a team that needs shared deploys and password-protected previews',
  selfHost:'Any Node host or the same VPS as the database — no additional cost',
  iface:'—',
  note:'Hobby tiers forbid commercial use. That is a licence limit, not a technical one, and it is the trigger that actually fires first.' },

{ id:'repo', cap:'Source control and continuous integration', phase:'0',
  free:'GitHub free — unlimited private repositories, 2,000 Actions minutes a month',
  paid:'GitHub Team, about $4 per user a month',
  trigger:'past 2,000 CI minutes a month, or when branch protection across a team is needed',
  selfHost:'Gitea or Forgejo on the VPS — free software',
  iface:'—' },

{ id:'monitor', cap:'Error tracking and uptime', phase:'0',
  free:'Sentry developer tier (5k errors a month) and any free uptime pinger',
  paid:'Sentry Team, about $26 a month',
  trigger:'past 5k errors a month — which usually means something is wrong that should be fixed rather than paid for',
  selfHost:'GlitchTip or self-hosted Sentry — free software',
  iface:'—' },

/* ── the working day ───────────────────────────────────────────────────── */
{ id:'automation', cap:'Automations and scheduled jobs', phase:'2',
  free:'n8n self-hosted on the VPS, or plain cron plus a webhook',
  paid:'n8n Cloud from about €20 a month, or Make/Zapier on usage',
  trigger:'only when nobody can maintain a VPS — the self-hosted version is the same software, not a cut-down one',
  selfHost:'n8n community edition — free, fair-code licensed',
  iface:'AutomationService',
  note:'Module 20 Automation Studio is the built-in path and needs none of these. An outside engine is for reaching systems Medhava does not integrate with directly.' },

{ id:'whatsapp', cap:'WhatsApp for the shop floor and customers', phase:'2',
  free:'None. There is no free path to WhatsApp Business messaging.',
  paid:'A Business Solution Provider — Interakt, Wati, AiSensy and similar, roughly ₹1,500–3,000 a month plus per-conversation charges set by Meta',
  trigger:'the first day a worker or a customer is expected to use WhatsApp — there is no free tier to outgrow',
  selfHost:'Not possible. Meta requires an approved provider.',
  iface:'WhatsAppService',
  note:'The honest alternative until then is SMS or email, both of which have free tiers, and the in-app screens. This is the first line most businesses will actually pay for.' },

{ id:'email', cap:'Sending invoices, statements and notifications', phase:'2',
  free:'Brevo free tier (300 emails a day) or any existing mailbox over SMTP',
  paid:'Amazon SES at about $0.10 per thousand, or Brevo paid from about $9 a month',
  trigger:'past 300 emails a day, or when deliverability reporting is needed',
  selfHost:'A mail server — free software, but reputation management makes this the one self-hosted option usually not worth it',
  iface:'—' },

{ id:'sms', cap:'SMS alerts', phase:'2',
  free:'None at meaningful volume.',
  paid:'MSG91, Twilio or similar — roughly ₹0.15–0.25 per message in India',
  trigger:'the first alert that has to reach someone without a smartphone',
  selfHost:'Not practical — carrier access is the cost.',
  iface:'—',
  note:'Cheap enough that it is usually the fallback for WhatsApp rather than a line item anyone plans around.' },

/* ── media and content ─────────────────────────────────────────────────── */
{ id:'ai', cap:'AI for writing, summarising and the assistant', phase:'6',
  free:'Ollama running a small model on the same VPS or a laptop — free, private, and good enough for summarising and classifying',
  paid:'A hosted model API, billed per token',
  trigger:'when answer quality on real business questions is not good enough locally, or the machine cannot hold the model',
  selfHost:'Ollama — free software; a GPU box is the cost if one is wanted',
  iface:'AIService',
  note:'Module 01 Provider Router puts a spend ceiling in front of every paid call and refuses past it, so this line cannot quietly become the largest one.' },

{ id:'aiimage', cap:'Generated imagery', phase:'6',
  free:'None that runs without a graphics card. Stable Diffusion is free software; the hardware is the cost.',
  paid:'A hosted image API, billed per image',
  trigger:'the first generated image, unless a GPU machine is available',
  selfHost:'Stable Diffusion or Flux on your own GPU — free software, the card is the cost',
  iface:'AIService',
  note:'Module 18 ships this as a provider slot and says plainly that it needs a GPU. Photography and the Image Studio need neither.' },

{ id:'media', cap:'Video rendering, PDFs and screenshots', phase:'6',
  free:'ffmpeg and headless Chromium — both free, both already in this repository',
  paid:'None needed.',
  trigger:'',
  selfHost:'Runs on the same machine as everything else',
  iface:'—',
  note:'The Motion Renderer in Module 18 uses exactly these two and produces a real MP4 with no service involved.' },

{ id:'voice', cap:'Narration and voice', phase:'6',
  free:'The browser’s own speech synthesis — free, offline, already on every device',
  paid:'A cloned or branded voice from a hosted provider, typically $5–22 a month',
  trigger:'when a recognisable brand voice is wanted; the default voice is adequate for information',
  selfHost:'Piper or similar local TTS — free software',
  iface:'AIService' },

/* ── money and movement ────────────────────────────────────────────────── */
{ id:'payments', cap:'Taking payments online', phase:'4',
  free:'A UPI QR code against your own account — no gateway, no commission, and it works today',
  paid:'A payment gateway at roughly 2% per transaction',
  trigger:'when cards, net banking, EMI or international payment are needed, or when reconciliation has to be automatic',
  selfHost:'Not applicable — this is a regulated service',
  iface:'PaymentService',
  note:'Priced per transaction rather than monthly, so it costs nothing until it earns something.' },

{ id:'ship', cap:'Courier booking and tracking', phase:'4',
  free:'Type the tracking number in. Every courier, no integration, works on day one.',
  paid:'An aggregator — no monthly fee typically, priced per shipment',
  trigger:'when label printing and status updates have to be automatic rather than typed',
  selfHost:'Not applicable',
  iface:'ShippingService' },

{ id:'channels', cap:'Marketplace and storefront integration', phase:'4',
  free:'CSV import and export from each seller panel — free, and the fallback the system keeps forever',
  paid:'Marketplace API access, and a storefront platform subscription where one is used',
  trigger:'when order volume makes a daily CSV round trip the bottleneck, usually a few hundred orders a week',
  selfHost:'A self-hosted storefront — free software, hosting only',
  iface:'—',
  note:'Rule R15.1: channels are discovered from the data, so adding one is a row, not a release.' },

{ id:'gst', cap:'Tax filing', phase:'5',
  free:'Medhava computes the return and writes the file; the government portal accepts it at no charge, or your accountant files it',
  paid:'A filing service, if wanted',
  trigger:'when electronic invoicing becomes mandatory at the turnover threshold, or when filing is outsourced by choice',
  selfHost:'The government’s own offline utility — free',
  iface:'—' },

/* ── the rest ──────────────────────────────────────────────────────────── */
{ id:'storage', cap:'Files, documents and backups', phase:'1',
  free:'Supabase Storage inside the free tier, or the drive on the machine',
  paid:'Object storage at roughly $5 per terabyte a month',
  trigger:'past the free tier, which for documents and invoices takes a long time',
  selfHost:'MinIO on the VPS — free software',
  iface:'StorageService' },

{ id:'design', cap:'Design and brand assets', phase:'6',
  free:'The Design Studio and Image Studio in Module 18, plus free font libraries',
  paid:'A design subscription if the team prefers one',
  trigger:'never technically required — this is a preference about tooling, not a capability gap',
  selfHost:'Runs in the browser',
  iface:'—' },

{ id:'mobile', cap:'Mobile app', phase:'7',
  free:'A progressive web app — installable from the browser, no store, no fee',
  paid:'Developer accounts: Google Play $25 once, Apple $99 a year',
  trigger:'only when the app must be in a store, or needs push notifications on iOS',
  selfHost:'Not applicable',
  iface:'—',
  note:'The same codebase wraps with Capacitor when a store listing is wanted. Nothing forks.' },

]};
