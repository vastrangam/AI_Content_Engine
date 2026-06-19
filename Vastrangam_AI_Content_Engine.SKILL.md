---
name: vastrangam-content-engine
description: >
  Vastrangam's omni-channel listing + content engine. Use this skill WHENEVER the user wants to
  turn a product (image, SKU, or brief) into any sales asset for Vastrangam — Shopify listings,
  marketplace listings (Amazon / Flipkart / Myntra / Ajio / Meesho), social content (post, story,
  carousel, reel/short), ad copy, cinematic video scripts, Suno music prompts, SEO blogs, email
  campaigns, image SEO metadata, or the 9-sheet Excel automation pack. Triggers include: "Shopify
  listing", "Amazon/Flipkart/Myntra/Ajio/Meesho listing", "61-column CSV", "product CSV", "image
  metadata", "alt text", "carousel", "reel script", "ad copy", "Suno", "marketplace upload",
  "social automation sheet", "generate listing from this image", or any request to create
  search-ranked commerce/content for Vastrangam. ALWAYS run analysis-first; never jump straight to
  output. The full ruleset lives in reference/Vastrangam_AI_Content_Engine.md — read it before
  producing anything.
---

# Vastrangam AI Content Engine

A single engine that converts any Vastrangam product into world-class, search-ranked output for
any channel. Analysis-first, zero-placeholder, on-brand every time.

## When to use
Any request to create or optimise a Vastrangam commerce/content asset: listing (Shopify or any
marketplace), social post/story/carousel/reel, ad, cinematic video + music, SEO blog, email,
image SEO metadata, or the Excel automation pack.

## Required first step
Open `reference/Vastrangam_AI_Content_Engine.md` and follow it exactly. It is the source of truth
for: brand identity, the three labels (Vastrangam / Go4Fashion / Adini Couture), SKU rules, the
61-column Shopify schema, per-category marketplace schemas, measurement charts, colour/fabric/craft
vocabularies, and the ranking directive (SEO · AEO · AIO · SGO · SGE · GEO · SXO).

## Non-negotiable rules (summary — full detail in the reference)
1. **Analysis-first always.** Run product + market + competitor + buyer + channel analysis (the
   PREFLIGHT block) before ANY output — even a single named deliverable. The ONLY exception is an
   explicit "Run Phase N" by number.
2. **Precision in output, completeness in analysis.** A named deliverable ("just the Amazon
   listing") narrows the output, never the analysis. Don't pad with unrequested sections.
3. **SKU lock:** only `VS` (saree) + `VL` (lehenga), 4-digit, are written to Shopify Variant SKU.
   All other categories leave Variant SKU blank; their `VAN/VSS/VK/VD/VSH/VP` prefixes are internal
   reference only (image filenames + tracking).
4. **Image filenames:** `{SKU}_{Color}-{SHOT}.webp` — hero has no shot suffix
   (e.g. `VL1028_Green.webp`, `VL1028_Green-Front.webp`).
5. **Size token is `2xl`** (never `xxl`); saree/lehenga size = `free-size`; age group = `adults`.
   Never write `3/4` in a CSV cell (Excel turns it into a date) — use `three-quarter`.
6. **Every cell real data.** No blanks, no placeholders, no "[insert here]".
7. **Brand tone:** premium, emotional, aspirational, conversion-focused. No generic AI phrasing,
   no "luxurious yet affordable" cliché, no unproven "best quality" claims. Name every colour like
   a jewel, describe every fabric with sensory detail, make every occasion specific.
8. **Always include** on stitched garments: size chart (Phase 12), care instructions, custom-sizing
   CTA, WhatsApp +91 87580 38161.
9. **Output discipline:** Shopify CSV must be true comma-separated (commas inside fields wrapped in
   double-quotes), import-ready. Deliver both CSV and XLSX when a Shopify listing is requested.
10. **QA Gate before delivery.** Every batch must pass the machine-checkable QA Gate in the engine
   file (title 60–80 · SEO desc 150–160 · exactly 30 hashtags · 8 slides per carousel · alt ≤125 ·
   no 6-word meta overlap · SKU lock · zero Excel errors). Failing any check = fix before delivery,
   never deliver with a known violation.

## Companion files
- `reference/Vastrangam_AI_Content_Engine.md` — the complete 13-phase engine (read this).
- `reference/Vastrangam_Brand_Style.md` — quick brand/voice/palette reference for any creative call.

## Default behaviour by input
- **Image only** → analyse → full engine (61-column CSV/XLSX as core deliverable).
- **"Give me the [platform] listing"** → full analysis → only that listing, search-ranked.
- **"Image metadata" / image + SKU** → Phase 13 SKU Image Metadata Generator.
- **"Run Phase N"** → that phase only (the single escape hatch that skips analysis).
- **Unclear** → ask one question: "Which deliverable (and video duration if relevant)?" then run
  full analysis before producing it.
