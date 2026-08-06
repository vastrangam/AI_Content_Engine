# Vastrangam AI Engine — Complete Manual

**Module 14 · One studio, the whole catalogue workflow, one file.**
Written for someone who has never installed business software. No technical knowledge assumed.

---

## What this is

**Vastrangam AI Engine** is one HTML file that runs your whole catalogue workflow over one set of records:

1. **Catalogue** — drop **20–30 photos at once**. The app **looks at each photo** and works out the garment, the colour, the fabric, the craft and the camera angle by itself, then groups them into **Product → Colour variant → Pose**. You do not tag anything.
2. **Content Engine** — every run starts with a **market and competitor analysis** (real sellers, real prices, from a live web search), then writes the whole pack: titles, the Shopify listing, tags, FAQ, social, Suno lyrics, ads, all five marketplaces, email, webhook, the **61-column Shopify CSV + 9-sheet Excel**, and a market-analysis document.
3. **Image Studio** — a real photo editor: layers, filters, **a watermark eraser with six algorithms**, background removal, **your SKU stamped on**, frames, sharpening, and **export as JPG + WebP + PNG (transparent)** with matching title / description / alt text.
4. **Templates** — **53 live templates** across Instagram, Story, Reel cover, carousel, web banner, YouTube thumbnail, poster, sale and marketplace card. Every one is drawn fresh from your product and your content.
5. **Video Studio** — **cuts a reel from your own photos**: each pose becomes a moving shot with your script over it. Exports WebM, GIF and frames.
6. **Publisher** — push a run to channels, preview each payload, schedule it, publish, watch the log.

And on **every** screen there is an **assistant** (bottom-right, "Ask the Engine") that reads your live records and answers in plain language. Ask it *"what can this tool do"* for the full tour.

### About the AI — read this once

This version is **AI-first**. Connect your **Gemini** key on the **Connectors** screen (it is free, and the key is stored **in your browser only** — never in the file, never sent anywhere else) and the app can:

- **read your photographs** (that is what removes the tagging work),
- **search the live web** for real competitors and real prices,
- **clean up an image** — remove a supplier watermark and rebuild what was behind it.

Without a key the app still runs completely, and every screen still works — but it labels its own output **"Draft — no AI connected"** rather than pretending it is world-class. That honesty is deliberate: templates cannot read a photo or research a market, and the app should not claim otherwise.

**Free-tier limits, plainly:** roughly 1,500 text calls a day, about 500 image edits a day, and 5,000 web-grounded searches a month. Thirty photos a day sits well inside that. The app queues its calls and caches every result, so re-running the same catalogue costs nothing.

It is one file. It opens by double-clicking. It saves your work automatically. It checks its own arithmetic **60 different ways** every time it starts.

---

## PART 1 · GETTING IT RUNNING

**What you need:** nothing to buy, nothing to install, no account. Just a web browser — Chrome, Edge, Safari or Firefox. The whole app is one file: `Vastrangam_AI_Engine.html` (about 460 KB).

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
3. To make it feel like a real app: in Chrome, tap ⋮ → **Add to Home screen**.

### On an iPhone / iPad
1. Save the file to the **Files** app.
2. Open Files, tap it — Safari opens it.
3. Tap the Share button → **Add to Home Screen**.
- iPhone note: if data does not survive closing, put the file in iCloud Drive, open it from there in Safari, then Add to Home Screen.

### About the internet
The file itself never needs the internet — the generator, the canvas, the timeline, the spreadsheets, the templates and the assistant are all inside it. The internet is needed only for the three AI things above (reading photos, live research, AI image cleanup), and only while they run.

---

## PART 2 · THE PARTS OF THE SCREEN

- **Top bar** — the Vastrangam mark, the app name, and "saved ✓" on the right.
- **Left menu** — **Workflow** (Overview, Catalogue, Content Engine, Image Studio, Video Studio, Templates, Design Studio, Publisher), **Your records** (Records, Upload & download), **System** (Themes, Connectors, Wiring, Backup & Health). On a phone this hides behind ☰.
- **Ask the Engine** — the button at the bottom-right, on every screen.

Nothing on any screen is a picture of a button. Everything is live.

---

## PART 3 · THE TEN-MINUTE TEST — DO THIS FIRST

1. Open **Connectors** and paste your **Gemini** key. Press **Test**. (Skip this and everything below still works, just in draft.)
2. Open **Catalogue** and drop 20–30 photos — **straight off your phone, any filenames at all**. Watch the table fill in: garment, colour with a swatch, fabric, craft, pose. Photos carrying a supplier watermark get a **watermark** flag; a two-photos-in-one file gets a **2-in-1** flag. Press **Confirm & group**.
3. On a product press **Generate content**. It runs the analysis preflight first — market, real named competitors, gaps, buyer, channel plan, search targets — then writes the pack. You land on a run with **QA 100%**.
4. On the run press **9-sheet .xlsx** and **Shopify sheet as CSV** — the CSV is the real **61-column** Shopify import.
5. Open **Image Studio** (or **Edit images** on the product). Press **🖌 Paint over the watermark**, drag across the supplier logo, then **Erase & rebuild**. Stamp your **SKU**, add a **frame**, then **Download JPG + WebP + PNG**.
6. Open **Templates** — 53 designs, all rendered from your product. Click one, edit the text, **Export PNG**. Try **Design Studio → Carousel** for the 8-slide set.
7. Open **Video Studio** → **🎬 Cut a reel from my photos** → **Play**. Every pose is a moving shot. Export **GIF** or **WebM**.
8. Tap **Ask the Engine** and type `what can this tool do`.

---

## PART 4 · SCREEN BY SCREEN

### Catalogue
Drop 20–30 photos at once. **Each photo is read**, not guessed from its filename — so `WhatsApp Image 2026-08-06 at 00.49.42.jpg` works exactly as well as a carefully named file. For every photo you get the garment type, a premium colour name with a swatch, the likely fabric and craft, the camera angle, and flags for a **supplier watermark** or a **two-in-one collage**. Change anything you disagree with, then **Confirm** — and they group themselves into Product → Colour → Pose.

Photos are held in your browser's own IndexedDB, so thirty full-resolution images are no problem.

> Without a key connected, the app falls back to reading filenames and marks every row **draft** — it tells you plainly that it is guessing.

### Content Engine
Type a product, or press **Generate content** on a catalogue product.

**The analysis runs first, every time.** Your spec calls this non-negotiable, so the engine never jumps to an output. It produces the `[PREFLIGHT]` block — Product · Market · Competitor Gap · Buyer · Channel Plan · Uniqueness · Search Targets — with **real sellers and real URLs** found by live search, then writes the deliverable on top of it.

The pack contains: four titles, the Shopify body with the AEO question block, tags, SEO title and meta, FAQ, feature bullets, blog opener, Instagram post with **exactly 30 hashtags**, an **8-slide carousel**, a 3-act reel, the Suno song, three ad angles, an email, the webhook JSON, all five marketplaces, and the exports.

**Exports:** the **61-column Shopify CSV** (a true comma-separated import file), the **9-sheet .xlsx**, and the market-analysis document.

### Image Studio
A real layer editor. Drop a photo, or open one from the catalogue with **Edit images**.

- **Layers** — reorder, hide, delete; move, scale, recolour, set opacity.
- **Adjust** — brightness, contrast, saturation, hue, blur, live.
- **Filters** — Studio, Warm Festive, Cool Editorial, Rich Bridal, Soft Pastel, B&W, Vivid Reel.
- **Watermark eraser** — paint over a supplier logo, phone number or brand name, choose an algorithm (**PatchMatch**, **Telea**, Smart BG Fill, Smart Colour Fill, Boundary Patch, Fast Blur) and press **Erase & rebuild**. It reconstructs what was behind the mark, on your machine, offline. **✦ AI erase** hands the whole photo to Gemini instead, for a cleaner rebuild.
- **SKU watermark** — stamp your code in any of four corners, in four colour styles.
- **Frame** — gold corners, thin gold, thick lavender, or inset.
- **Sharpen** — light, medium or strong; useful after a cutout or resize.
- **Background** — instant offline cutout, or a clean white studio backdrop.
- **Three-format export** — **JPG + WebP + PNG (transparent)** in one ZIP, with a metadata CSV carrying the title / description / alt text matched to that product's content.

### Templates
**53 live templates**, grouped by Social, Store, Video and Campaign, each rendered from your product photo and your content. Nine canvas sizes (Instagram Post/Story, Reel Cover, Carousel, Web Banner, YouTube Thumbnail, Festival Poster, Sale Post, Marketplace Card) × eight layouts (Full bleed, Editorial split, Framed centre, Colour band, Offset card, Type first, Diagonal, Stacked thirds) × palettes including one **built from your garment's own colour**.

Click any template to open it on the canvas: edit the title, subtitle, price and badge, switch palette, switch layout, or **magic-resize** to another canvas — the layout refits itself. **Export PNG**, or export **every template at once** as a ZIP.

> Every line of text is measured before it is drawn and shrunk to fit its box, and every element sits in a slot that is checked against every other slot. Text running off the canvas, or a price sitting on top of a title, is not possible — there is a self-test that proves it on every template at every size.

### Design Studio
The canvas editor and the quick assets: **Web banner 1500×500**, **YouTube thumbnail 1280×720**, and the **8-slide carousel** built from your content, with brand-kit colours and one-click fill from a run.

### Video Studio
Press **🎬 Cut a reel from my photos**. Every pose in your catalogue becomes a moving shot — a slow push-in and pan (Ken Burns), cross-dissolved into the next — with your 3-act script and price landing on the right frames and the wordmark held on top. Choose 9:16, 1:1 or 16:9. **Play** it, scrub it, then export **WebM**, an animated **GIF**, a **PNG frame sequence**, or the project JSON.

### Publisher
Calendar, schedule a run, channels, publish log and the Make/n8n webhook payload. Channels connect with a scoped, revocable key — never a password.

### Records & Files
Add, edit or delete any table; upload `.xlsx`/`.csv`; download everything as Excel or a JSON backup.

### Themes · Connectors · Wiring · Backup & Health
- **Themes** — eight free themes plus an **AI theme** from a prompt; every colour editable.
- **Connectors** — the **free-first AI router**. Built-in offline engine first, then **Gemini**, **OpenRouter**, **Groq**, local **Ollama**, **Pollinations** for images; paid providers last. Paste a key, set the order, **Test**. Keys live in your browser only.
- **Wiring** — where every figure on every screen comes from.
- **Backup & Health** — the 60 self-tests, and Export/Import/Reload/Wipe.

---

## PART 5 · THE ASSISTANT

Tap **Ask the Engine**. It reads your **live records** ("how many runs do I have?"), knows **every screen** ("how do I remove a watermark?"), defines **any term** ("what is zardozi?"), looks up a **SKU**, and can **open any screen**. It works with no internet and no key.

> **Vastrangam AI Engine will never ask you for a marketplace, bank or account password.** Channels connect with a scoped, revocable key only. If any screen ever asks for a password, it is not this app.

---

## PART 6 · YOUR DATA

Your records live in your own browser under `vastrangam_ai_engine_v1`; your photos live in the browser's IndexedDB; your API key lives in `vastrangam_ai_keys_v1`. Nothing is uploaded anywhere except the specific AI calls you trigger.

**Take backups.** On **Backup & Health**: **Export JSON backup**, and **Import a backup** to restore. To move devices, export the backup and carry it with the app file.

---

## PART 7 · IS IT WORKING? (the self-tests)

Every time the app opens it checks its own arithmetic — **60 checks** — before showing you anything. See them on **Backup & Health → Self-tests**. You should see **60/60 pass**.

Many of them exist because something was genuinely wrong once, and the test stops it coming back:

- *no template lets text run off the canvas* — the web-banner bug
- *no two elements overlap in any template*
- *the Shopify sheet is the full 61 columns, not 23*
- *there are exactly 30 hashtags, deduplicated*
- *the carousel is exactly 8 slides*
- *the title lands in the 60–80 character window*
- *the SEO description lands in the 150–160 character window*
- *the whole 14-rule spec gate passes*
- *the Variant SKU is written only for VS / VL*
- *the size token is 2xl and never xxl*
- *the sleeve is never written as 3/4*
- *a WhatsApp filename yields no invented product name*
- *all six of the inpainting algorithms are present*

If you ever see a red **fail**, take a backup, reload the file, and report which line failed.

---

## PART 8 · IF SOMETHING GOES WRONG

- **Opens in Notepad** → right-click → Open with → Chrome or Edge.
- **Nothing happened on double-click** → the file is still inside the ZIP; extract it first.
- **Photos are not being read** → no key connected (Connectors), or you are offline. The rows will say **draft** or **failed**, and you can tag by hand.
- **"429" or "quota"** → you have hit the free tier for the day. The app waits and retries; results already read are cached, so nothing is lost.
- **Data disappeared** → different copy of the file, cleared site data, or Private mode. Restore from your backup.
- **WebM export says "not supported"** → use **GIF** or **Frames (ZIP)**.

---

## PART 9 · WHAT IT DOES NOT DO

- It is **not a Canva replica**. There is no stock library of millions of assets, no team collaboration, and no licensed Canva fonts. What it has is 53 templates built for your products, with a layout engine that will not let a design break.
- **Real AI video generation (Veo) is paid.** The Video Studio cuts a reel from your photographs and animates them; it does not generate video.
- It does not render **MP4/H.264** in the browser — WebM, GIF and frames do work offline. MP4 is a Connectors item.
- **AI features need the internet and your key.** Reading photos, live competitor research and AI image cleanup are the three that do. Everything else runs offline, and the app says "Draft — no AI connected" rather than overclaiming.
- **Free-tier limits are real** — about 1,500 text calls/day, 500 image edits/day, 5,000 grounded searches/month.
- It does not sync between devices on its own — use the backup file.
- In this single-file form it does not push **live** to your marketplace or social accounts — it produces the exact per-channel payload and logs it.
- It does not have user accounts.

---

**Vastrangam · Desire to Attire · Crafted in Surat. Worn Everywhere.**
`Vastrangam_AI_Engine.html` · opens by double-click · 60 self-tests · works offline, better with your key
