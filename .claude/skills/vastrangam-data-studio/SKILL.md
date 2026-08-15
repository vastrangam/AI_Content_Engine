---
name: vastrangam-data-studio
description: Use when the user uploads a Vastrangam e-commerce sale/return workbook or a karigar production workbook (with or without a Stitching Rates Master) and asks for a report, an analysis, a dashboard, an earnings/payment breakdown, or an Excel/Power-BI-style output from it. Triggers on phrases like "give me a report from this excel", "power bi dashboard", "karigar and payment report", "product report", "analyse this sheet". Do not use for anything outside these two workbook shapes — this skill does not touch accounting, HR, inventory or any other module.
---

# Vastrangam Data Studio — one ask, one report

## What this is

A thin router in front of an engine that is already tested against the business's own
records: `brand/suite/studio/studio_core.js` is the same code
`brand/suite/studio/verify_studio.js` checks against real workbooks (30/30 passing, including
963 e-commerce quantity cells matched exactly and 105 of 143 karigar designs matched exactly,
every remaining difference traced to a named cause rather than ignored — see that file's own
history if you want the receipts).

This skill does not reimplement anything. It reads the upload, works out which report(s) were
actually asked for, and calls `brand/suite/studio/skill_runner.js` with exactly that scope —
never more. **The whole point is that a karigar question does not also produce an e-commerce
report nobody asked for, and vice versa.**

## Step 1 — classify what was uploaded

Don't guess from the filename. Either let `skill_runner.js` classify it (it does, using
`Core.classify()` — the identical logic the browser tool uses), or check yourself:

- A workbook with `<Company> Sale` / `<Company> Return` sheet pairs → **e-commerce**.
- A workbook with a `Karigar` / `Design Name` grid → **karigar production**.
- A sheet with `Design Name | Set | Attribute | Rate` columns → **rate master** (optional
  alongside a karigar workbook; without it every piece costs ₹0 and every design is flagged —
  say so, don't hide it).

If nothing uploaded matches either shape, say so and stop. Do not force an unrelated file
through the pipeline.

## Step 2 — map the sentence to a mode, not to "all"

| The user said something like… | Run with `--only` |
|---|---|
| "report analysis in excel" / "give me the sale report" | `ecommerce` |
| "power bi dashboard" / "dashboard report" / "visual report" (on a sale/return upload) | `ecommerce-dashboard` |
| "product and karigar report" / "cost report" / "item-wise report" | `karigar-cost` |
| "payment details" / "earnings" / "who to pay" (on a karigar upload) | `karigar-cost` (its Karigar Earnings + Karigar × Design Detail sheets carry this — there is no separate payment-only workbook, and building one that duplicates numbers already in the cost report would be the second copy this whole codebase's rules exist to prevent) |
| "just the production numbers, no money" | `karigar-production` |
| "dashboard" (on a karigar upload) | `karigar-dashboard` |
| "everything" / "give me the full picture" | `all` |

Several asks in one sentence ("report AND dashboard") mean **two** `--only` runs, not one
`all` run — `all` also pulls in the other pipeline's outputs if both file types are present,
which is exactly the over-delivery this skill exists to avoid.

## Step 3 — run it

```bash
node brand/suite/studio/skill_runner.js --only <mode> --out <scratch-dir> <uploaded-file(s)>
```

Pass every uploaded file to every invocation — the runner ignores files that don't match the
mode's pipeline (e.g. a rate master handed to an `ecommerce` run is silently unused, not an
error) and picks up a rate master or extra sale/return sheets automatically.

Read the JSON the command prints to stdout. It carries the exact figures (companies found,
item count, no-price count, or design/karigar/set/piece/cost totals and no-rate count) — quote
those numbers back to the user rather than re-deriving them from the files a second time.

## Step 4 — hand back only what was written

The command's own output lists the file paths it wrote. Send exactly those. Nothing else in
`brand/suite/studio/` gets touched, and nothing from the other pipeline gets generated as a
"just in case."

## What "Power BI dashboard" actually means here

There is no Power BI runtime in this environment — `.pbix` is a proprietary binary format only
Power BI Desktop writes, and producing one here isn't possible. `ecommerce-dashboard` and
`karigar-dashboard` instead build a **self-contained HTML dashboard** — KPI tiles, a top-sellers
or top-karigars chart, a return-rate or rate-coverage chart, all drawn as inline SVG with zero
external dependencies, opening with the network off like every other tool in this suite. Say
that plainly if the user's phrasing implies an actual `.pbix` — don't let "dashboard report"
quietly become a claim of something this environment cannot produce.

## The rules this pipeline will not bend on

- A missing price or a missing stitching rate is never guessed. It posts as ₹0 (rate) or
  "NO PRICE" and the item/design is named in the summary — a guessed rate is a wrong payment
  to a real person.
- Sets are counted by pooling every karigar's pieces per design first, then taking the minimum
  across populated member columns — never per karigar row.
- A surplus piece is paid for per raw piece, independent of whether it completed a set.
- Companies and channels are read from the sheets present, not from a fixed list — a workbook
  with a third or tenth company's `<Company> Sale`/`<Company> Return` pair gets that many
  columns, with nothing in this skill or the engine behind it changed.

## Files this skill depends on (read-only from here)

- `brand/suite/xlsx.js` — the workbook reader/writer
- `brand/suite/studio/studio_core.js` — the two pipelines and shared classification
- `brand/suite/studio/studio_reports.js` — the styled Excel workbooks
- `brand/suite/studio/studio_dashboard.js` — the HTML dashboards
- `brand/suite/studio/skill_runner.js` — this skill's entry point
- `brand/suite/studio/verify_studio.js` — the proof, run with `node brand/suite/studio/verify_studio.js <folder-with-both-raw-and-reference-workbooks>` if you ever need to re-check the engine against real data before trusting a number
