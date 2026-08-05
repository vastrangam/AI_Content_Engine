# Vastrangam AI Engine — Complete Manual

**Module 14 · One studio, the whole catalogue workflow, one file.**
Written for someone who has never installed business software. No technical knowledge assumed.

---

## What this is

**Vastrangam AI Engine** is one HTML file that runs your whole catalogue workflow over one set of records:

1. **Catalogue** — drop **20–30 images at once**; they group automatically into **Product → Colour variant → Pose** (front, back, close-up, side). This is the top of the workflow — everything below reads from it.
2. **Content Engine** — type a product (or generate straight from the catalogue) and get the whole content pack: titles, Shopify listing, tags, FAQ, social, Suno lyrics, ads, all five marketplaces, email, webhook, a **9-sheet Excel** AND a **market-analysis .doc** (trends · competitors · gap · what you do better).
3. **Image Studio** — a Photoshop-style layer editor: layers, filters, crop, **background removal**, and **export every image as JPG + WebP + PNG (transparent)** with matching **title / description / alt** metadata.
4. **Video Studio** — a timeline with keyframed clips and a live preview; a still animated into a 10-sec reel; exports WebM, GIF and frames.
5. **Design Studio** — Canva-style templates, **free themes + an AI theme**, and one-click **banner · carousel · YouTube thumbnail** filled from your content.
6. **Publisher** — push a run to channels, preview each channel's payload, schedule it on a calendar, publish, and watch the log.

And on **every** screen there is an **assistant** (bottom-right, "Ask the Engine") that reads your live records, knows every screen, guides you through what the tool can do, and answers in plain language — **with the internet switched off**. Ask it *"what can this tool do"* for the full tour.

**Free-first AI, your choice.** Everything works offline with the built-in engine. On **Connectors** you can paste a **Gemini** key (or OpenRouter, Groq, Pollinations, a local Ollama…) to upgrade the prose and generate images — **free options first, paid last, and never required**. Your key is stored in **your browser only** — never in the file.

It is one file. It opens by double-clicking. It saves your work automatically. It checks its own arithmetic **30 different ways** every time it starts. Nothing here is fetched from the internet unless you choose to connect a model — the catalogue, the generator, the canvas, the timeline, the spreadsheet engine, the themes and the assistant are all inside the file.

---

## PART 1 · GETTING IT RUNNING

**What you need:** nothing to buy, nothing to install, no account, no internet after you have the file. Just a web browser — Chrome, Edge, Safari or Firefox. The whole app is one file: `Vastrangam_AI_Engine.html` (about 330 KB — smaller than a phone photo).

### On a Windows computer
1. Find `Vastrangam_AI_Engine.html` (usually in Downloads). If it came in a ZIP, right-click → **Extract All** first.
2. Double-click it. It opens in your browser. That is the whole app.
- If it opens in Notepad: right-click → **Open with** → Chrome or Edge → tick "Always".
- To keep it handy: right-click → **Send to** → Desktop (create shortcut).

### On a Mac
1. Find it in Downloads (unpack the ZIP first if needed).
2. Double-click. Safari opens it. Done.

### On an Android phone
1. Save the file to your phone (WhatsApp, email, Drive — any route).
2. Open the **Files** app → Downloads → tap it → choose **Chrome**.
3. To make it feel like a real app: in Chrome, tap ⋮ → **Add to Home screen**. Now it has an icon and opens with no browser bar — and still works in flight mode.

### On an iPhone / iPad
1. Save the file to the **Files** app.
2. Open Files, tap it — Safari opens it.
3. Tap the Share button → **Add to Home Screen**.
- iPhone note: if data does not survive closing, put the file in iCloud Drive or Google Drive, open it from there in Safari, then Add to Home Screen. After that it behaves normally.

### About the internet
You do not need it. Once the file is on your device, everything works with the WiFi off — generation, the canvas, the video, the spreadsheets, the assistant. There is no server behind this app.

---

## PART 2 · THE PARTS OF THE SCREEN

- **Top bar** — the Vastrangam mark, the app name, and "saved ✓" on the right (it says "session only" if your browser is blocking storage, usually Private mode).
- **Left menu** — three groups: **Workflow** (Overview, Catalogue, Content Engine, Image Studio, Video Studio, Design Studio, Publisher), **Your records** (Records, Upload & download), **System** (Themes, Connectors, Wiring, Backup & Health). On a phone this hides behind the ☰ button.
- **Ask the Engine** — the gold-and-purple button at the bottom-right. It is on every screen.

Nothing on any screen is a picture of a button. Everything is live: press it and the numbers recompute.

---

## PART 3 · THE TEN-MINUTE TEST — DO THIS FIRST

This shows the whole workflow, and you cannot break anything (**Backup & Health → Reload demo data** puts it all back).

1. Open **Catalogue** → **load a demo catalogue**. Watch the images group into Product → Colour → Pose (Anarkali Gown in Mehendi Green and Ruby Wine, each with front/back/close-up/side). For your own, just drop 20–30 files — name them like `mehendi-green-front.jpg` and they group themselves.
2. On a product, press **Generate content**. You land on a run with **four title variants** (each with its char count), the humanized **Shopify body** (opening line never starts with the product noun), the spec table with no blanks, and **QA 100%**.
3. On the run, press **Analysis .doc** — a market/competitor/gap analysis Word file downloads. Press **9-sheet .xlsx** — the Excel downloads. Both with the internet off.
4. Open **Image Studio** (or press **Edit images** on the product). Apply a **filter**, press **Remove background**, then **Download JPG + WebP + PNG** — a ZIP with all three formats and a metadata CSV matched to your content.
5. Open **Design Studio** → **Carousel** — ten themed slides build from your content; **Export all slides (ZIP)**. Try **Web banner** and **YouTube thumb** too.
6. Open **Themes** → try **Emerald Silk**, then type a mood into **AI theme** (e.g. "royal midnight blue and gold") and **Generate** — the whole app restyles instantly, and every colour is editable.
7. Open **Video Studio** → **Build a reel from** a run → **GIF** or **WebM**.
8. Tap **Ask the Engine** and type `what can this tool do` for the full tour, then `how many runs do I have?` — it answers from your live records.

That is the whole workflow: catalogue in, content + images + design + video + publish out, an expert on call, all offline.

---

## PART 4 · SCREEN BY SCREEN

### Catalogue
Drop 20–30 images at once (or click to choose). Each is read by its filename and grouped into **Product → Colour variant → Pose**. A grid of thumbnails appears; fix any product name, colour or pose by hand, then **Confirm**. Each product then has **Generate content**, **Edit images**, **Make banner / thumbnail** and **Delete**. Name files like `mehendi-green-back.jpg` for the cleanest grouping. Images are stored in your browser's IndexedDB, so thirty full-resolution photos are no problem — and it is still offline.

### Content Engine
Type a product (or pick one from the catalog) and press Generate. It runs all 13 phases **offline**, from the colour, fabric, craft and occasion libraries in the spec:

- **Four titles** — SEO, Emotional, Marketplace, Ad — each unique, each within its char limit.
- **Shopify body** — the exact HTML structure, with the signature AEO question-and-answer block that ranks in AI Overviews.
- **Tags, SEO title, meta, FAQ, feature bullets, blog opener.**
- **Social** — Instagram post + 20 hashtags, a 10-slide carousel, a 3-act reel with a voiceover line.
- **Video & Suno** — a cinematic scene breakdown and a Suno song with **zero product words**.
- **Ads & email** — three ad angles, a full email, and the Make/n8n webhook JSON.
- **Marketplaces** — Amazon (title + 5 bullets + backend keywords), Flipkart (the category's attribute set), Myntra, Ajio, Meesho — each in its own voice.
- **QA & uniqueness** — a machine-checkable gate (10 checks) and a uniqueness check against your earlier runs.
- **9-sheet export** — a real .xlsx with no blank cells, written by the built-in spreadsheet engine.

Every panel has a **Copy** button. The whole run downloads as Markdown, or goes straight to Publisher.

> **A connected AI model is optional.** The 13 phases, the uniqueness check and the QA gate all run without one. Connect Claude, GPT, Gemini or a local model (from the assistant's *change* link) only if you want it to upgrade the prose.

### Image Studio
A real Photoshop-style layer editor. Drop a photo (or **+ Image / + Text / + Box**), or pull a catalogue shot straight in with **Edit images** on a product. Each layer shows in the **Layers** panel — reorder, hide, delete. Select a layer to move, scale, recolour and set opacity. The **Adjust** sliders (brightness, contrast, saturation, hue, blur) change the whole canvas **live**, and the **Filters** row applies one-tap looks (Studio, Warm, Cool, Mono, Vivid, Fade).

- **Background** — **Remove background** does an instant auto-cutout (offline, no download); **Whiten** drops the subject onto a clean white studio backdrop. A one-time optional ML model can sharpen the cutout further — it downloads once, then works offline.
- **Crop** — free or fixed ratios, applied on the canvas.
- **Three-format export** — press **Download JPG + WebP + PNG** and you get all three at once — **JPG** (photo), **WebP** (light web), **PNG** (transparent background) — plus a **metadata CSV** carrying the **title / description / alt text** matched to that product's content, and a short README, all in one ZIP. There are also **7 output sizes** (Website, Myntra, Marketplace, OG, Thumb, Square, Story) for a single **Export**. Undo/Redo remembers your steps.

### Video Studio
A timeline with tracks (BG, Video, Shape, Text) and keyframed clips. Add text or shapes, set each clip's start/end and animation (fade, up, down, grow, zoom). **Play** the live preview, or drag the scrubber. Pick 9:16, 1:1 or 16:9. Load a content run and **Build a reel from it** to lay the text out automatically. **Export** WebM, an animated GIF, a PNG frame sequence (ZIP) or the project JSON — all offline. *MP4/H.264 needs a server — it is on the Connectors screen.*

### Design Studio
Canva-style. Pick a template (Instagram Post, Story, Sale Poster, Web Banner, Festival Poster, Reel Cover, Marketplace Card, YouTube Thumbnail). Edit the text on the canvas, drag elements, apply the **active theme** and **brand kit** colours, change the **background**, and use **Magic resize** to reflow the whole design into another size. Fill it **From a content run** in one click. **Export PNG.**

The **Quick assets** panel builds the three you need most, auto-filled from a product and its content and styled in the current theme:
- **Web banner** — 1500 × 500 for a store header.
- **YouTube thumbnail** — 1280 × 720, 16:9.
- **Carousel** — a full **10-slide** set. Open **Carousel**, review every slide, then **Export all slides (ZIP)**.

### Themes
Restyle the whole app — every screen, button and canvas — with one click. Choose a **free theme** (Vastrangam Purple, Ivory Luxe, Emerald Silk, Midnight, Marigold, Rose, Teal, Onyx), or type a mood into **AI theme** (for example *"royal midnight blue and gold"*) and press **Generate** — it builds a matching palette instantly and offline; if you have a model connected it refines it further. Every colour is then an editable control, so you can nudge any of them by hand — like a brand kit you own. Your choice is remembered and applied the moment the app opens.

### Publisher
- **Calendar** — a month grid with every scheduled and published item; publish any scheduled entry with one button.
- **Schedule a run** — pick a run, a date, a format and one or more channels.
- **Channels** — connect or disconnect each channel (Shopify, Amazon, Flipkart, Myntra, Ajio, Meesho, Instagram, Facebook, Pinterest, YouTube). Connections use a scoped, revocable API key — never a password.
- **Publish log** — every attempt, with a Retry on any that failed.
- **Webhook** — the Make/n8n payload, copy-ready.

### Records & Files
- **Records** — add, edit or delete any table (products, image assets, channels, calendar, publish log). Every screen moves with your change.
- **Files** — upload an `.xlsx` or `.csv` (headings matched by name), or download every record as Excel or a JSON backup. The spreadsheet engine is inside the file, so uploads and downloads work offline.

### Connectors · Wiring · Backup & Health
- **Connectors** — the **free-first AI router**. The built-in offline engine always answers first and is never removed. Below it you can paste a key for **Gemini** (the free option first), then **OpenRouter**, **Groq**, a local **Ollama / LM Studio**, and **Pollinations** for images (no key) — paid providers like OpenAI or Claude sit last. Set the order, **Test** any one, and every call falls back down the chain to the offline engine, so nothing ever breaks without a key or network. Your keys are stored in **your browser only** — never in the file. Nothing is locked to one company.
- **Wiring** — where every figure on every screen comes from.
- **Backup & Health** — the 30 self-tests, and Export/Import/Reload/Wipe for your data.

---

## PART 5 · THE ASSISTANT

Tap **Ask the Engine** (bottom-right, every screen). It is the **built-in engine** — a rules expert that:

- reads your **live records** ("how many runs do I have?", "which channels are connected?", "what's my QA score?"),
- knows **every screen** ("how do I make a reel?", "how do I export at Myntra size?"),
- defines **any term** from the libraries ("what is roman silk?", "what is zardozi?", "what is the mehendi occasion?"),
- looks up a **SKU** ("what is VAN2094?"),
- and can **open any screen** ("open Content Engine").

It works with **no internet and no key**, and it tells you the screen each answer came from. If you want free-form conversation as well, tap **change** and connect any model — Claude, OpenAI, Gemini, Mistral, Groq, OpenRouter, or a local Ollama / LM Studio. It is never required.

> **Vastrangam AI Engine will never ask you for a marketplace, bank or account password.** Channels connect with a scoped, revocable key only. If any screen ever asks for a password, it is not this app.

---

## PART 6 · YOUR DATA

Your data lives inside your own browser, on your own device, in a private store labelled `vastrangam_ai_engine_v1`. Nobody else can see it. It survives closing the app, but it does not travel between devices by itself.

**Take backups.** On **Backup & Health**: **Export JSON backup** drops a file in Downloads — keep it safe. **Import a backup** restores it. To move to a new device: export the backup, send yourself both the app file and the backup, open the app on the new device, and import.

- **Reload demo data** puts the example figures back.
- **Wipe all** empties it. Both ask first, and both can be undone only from a backup — so take one first.

---

## PART 7 · IS IT WORKING? (the self-tests)

Every time the app opens it checks its own arithmetic — **30 checks** — before showing you anything. See them on **Backup & Health → Self-tests**. You should see **30/30 pass**. Each line is in plain language, for example:

- *the generator detects the category from words*
- *it maps to a premium colour name, never a basic one*
- *the Shopify body carries the AEO question block*
- *the Suno lyrics contain no product word*
- *the opening line does not start with the product noun*
- *the catalogue reads the pose and colour from a filename*
- *a theme derives every core colour, and an AI theme comes from a prompt*
- *the router lists the free offline engine first, paid providers last*
- *the analysis has three competitor tiers and a "what you do better" list*
- *the assistant answers product count from live data*

If you ever see a red **fail**, the numbers on screen should not be trusted — take a backup, reload the file, and report which line failed.

---

## PART 8 · IF SOMETHING GOES WRONG

- **Opens in Notepad** → right-click → Open with → Chrome or Edge.
- **Double-clicked, nothing happened** → the file is still inside the ZIP; extract it first.
- **Data disappeared** → you opened a different copy, or cleared browser "site data", or you are in Private mode. Keep one copy, avoid Private mode, restore from your last backup.
- **WebM export says "not supported"** → your browser blocks canvas recording; use **GIF** or **Frames (ZIP)** instead — both always work.
- **Squashed on a phone** → turn sideways for wide tables, or scroll a table with your finger. The menu is behind ☰.

---

## PART 9 · WHAT IT DOES NOT DO

- It does not sync between devices on its own — use the backup file.
- It does not render **MP4/H.264** in the browser (WebM, GIF and frames do work offline). MP4 is a Connectors item for the hosted version or your own FFmpeg. The Video Studio animates a **still into a short reel** — real AI video (like Veo) is a paid service on Connectors, not built in.
- The **background removal** works instantly and offline (auto-cutout). The sharper **ML cutout** is optional: it downloads a small model **once** from the internet the first time you use it, then works offline afterwards. You never need it — the instant cutout is always there.
- A **connected AI model is optional everywhere.** Better prose, generated images and a drafted analysis doc improve when you connect Gemini (or another provider), but the app writes the content, builds the images and drafts the analysis on its own with the internet off. Connecting a model needs internet and a key you paste yourself; without one, the built-in engine answers.
- **Deep, live** competitor research (checking who is actually selling a piece today, on which site) is done with me in a working session — the in-app analysis doc is drafted from the product and the libraries.
- In this single-file form it does not push **live** to your marketplace or social accounts — it produces the exact per-channel payload and logs it; the hosted version opens those pipes.
- It does not have user accounts — whoever can open your device can open the app.

Everything it **does** do is on the screens above, and every figure is traceable on the **Wiring** screen.

---

**Vastrangam · Desire to Attire · Crafted in Surat. Worn Everywhere.**
`Vastrangam_AI_Engine.html` · opens by double-click · works offline · 30 self-tests
