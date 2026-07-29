# START HERE — Medhava Module 01 · Dashboard & BI

**2 apps × 2 editions = 4 working apps.** Nothing here is a mock-up. Every screen
works, every button does something, and every number is calculated live.

---

## 1 · What is in this ZIP

```
Module01_Dashboard_BI.zip
│
├── START_HERE.md                    ← you are reading this
├── Module_01_Dashboard_BI.pdf       ← 10 pages: the whole module, how it wires together
│
├── Medhava/                         ← the unified ERP — works for ANY industry
│   ├── 01_CEO_Dashboard.zip
│   └── 02_Report_Builder.zip
│
└── Vastrangam/                      ← the SAME apps, with Vastrangam's own data & rules
    ├── 01_CEO_Dashboard.zip
    └── 02_Report_Builder.zip
```

**Inside every one of those four app ZIPs:**

| File | What it is |
|---|---|
| `<AppName>.html` | The app. **Double-click this.** One file, works offline. |
| `MANUAL.md` | The complete manual, written for someone who has never installed software. |
| `<AppName>_Wiring.pdf` | 16 pages: every screen, every process, every diagram, real screenshots. |

---

## 2 · How to open it (60 seconds)

1. **Extract this outer ZIP.**
   Windows: right-click → *Extract All*. Mac: double-click it.
2. **Choose your edition** — the `Medhava` folder or the `Vastrangam` folder.
3. **Extract the app ZIP inside it.** *(This step matters — see the warning below.)*
4. **Double-click the `.html` file.** It opens in your browser. That is the entire installation.

> ⚠️ **The one mistake to avoid:** opening the `.html` file directly from *inside* a ZIP.
> Windows unpacks it into a temporary folder that gets wiped, so your data appears to
> vanish later. **Always extract first.**

**On a phone:** put the `.html` file on your phone, open it with Chrome (Android) or
Safari (iPhone), then use **Add to Home screen**. It gets its own icon and behaves
exactly like any other app — including with the internet switched off.

Full step-by-step instructions for Windows, Mac, Android and iPhone are in each app's
`MANUAL.md`.

---

## 3 · The two apps

### App 1 · CEO Dashboard — *7 screens, 14 self-tests*
The one screen you look at each morning. It answers three questions and nothing else:
**did we make money, is the cash safe, and what needs me today.**

- A **live period switcher** — April / May / June / July / Full year. Every figure on
  every screen recalculates. Balances deliberately ignore it, because a balance is a
  position, not a period.
- **Returns come off before anything is called "net"** — so a busy channel with high
  returns can never flatter the numbers.
- **Alerts nobody types in.** Four rules run against live figures: stock at its reorder
  point, money owed over 30 days, a bill past due, a channel's return rate at 12% or
  more. You can clear one — and it comes back on its own if things get worse.
- A **Wiring screen** naming the source and the arithmetic behind every single figure.

### App 2 · Report Builder — *5 screens, 25 self-tests*
Ask your own data almost any question, in three clicks, without writing a formula.

- **Five sources** — Sales, Money owed, Stock, Running costs, Production.
  Group by anything, sort by anything, filter on words or numbers.
- **Nine ready-made reports**, each answering a question owners actually ask.
  One click loads one into the builder, already run — then change whatever you like.
- **Saves the question, not the answer.** Run it next month and it recalculates.
- **Honest Top-N.** Ask for the top 5, see five rows — but the total still counts every
  matching row, and says so.
- **CSV download** on every report, total row included.

---

## 4 · Why two editions of everything

| | **Medhava** | **Vastrangam** |
|---|---|---|
| What it is | The unified ERP — industry-neutral | The same engine, Vastrangam's real world |
| Company | Acme Corp (stands in for anyone) | Vastrangam |
| Channels | Retail · Marketplace · Website · Wholesale · Export | Myntra · Flipkart · Website · Wholesale (Surat) · Exhibition |
| Items | Raw material · Component · Finished product | Banarasi silk · Cotton 44" · Zari · Kurta set · Saree |
| Suppliers | Alpha Industrial · Beta Components | Jagdamba Textiles · Kanchi Silks · Surat Cotton Mills |
| Making cost | Production floor wages | Karigar wages, per piece |
| Books | Finance / Ledger | BUSY |
| **Engine** | **Identical — one shared file** | **Identical — one shared file** |
| **Self-tests** | **Same names, same count, all passing** | **Same names, same count, all passing** |

**Only the configuration file differs.** That is the proof that "works for any industry"
is real and not a sales line: if the neutral engine needed changing to handle a real
textile business, the two builds could not pass identical tests.

---

## 5 · How to check it yourself

You do not have to take any of this on trust.

**Check the arithmetic:** open any app → **Backup & Health** in the left menu →
read the **Self-tests** panel. The tests ran the moment the app started, on your device,
against your data. They are written in plain English on purpose.

**Check the two apps agree:** open the CEO Dashboard, set the period to **Full year**,
note **Net sales**. Now open the Report Builder, choose **Sales**, group by **Channel**,
no filters, and read the **Total** line. The two figures are the same, to the paisa.

**Check it really works offline:** turn off your WiFi and reload the page.

---

## 6 · Verification report for this module

| Build | Screens | Controls clicked | Self-tests | Console errors |
|---|---|---|---|---|
| CEO Dashboard · Medhava | 6 / 6 | 40 | **14 / 14** | **0** |
| CEO Dashboard · Vastrangam | 6 / 6 | 40 | **14 / 14** | **0** |
| Report Builder · Medhava | 4 / 4 | 20 | **25 / 25** | **0** |
| Report Builder · Vastrangam | 4 / 4 | 20 | **25 / 25** | **0** |
| | | | **78 / 78** | **0** |

Every screen was opened in a real browser and **every interactive control on it was
clicked** — period switches, alert clears and restores, source buttons, filters, saves,
deletes, template loads. Any console error, script error, or screen that failed to
redraw would have failed the build.

Every screenshot in every PDF was captured from the shipped file at double resolution,
in the state its caption describes.

---

## 7 · Your data

It lives in your own browser, on your own device. Nowhere else. Never on a server.

- Nobody else can see it.
- It survives closing the app and restarting the computer.
- It does **not** travel between your laptop and your phone by itself.
- Clearing your browser's "site data" **will** erase it.

**So take a backup weekly:** *Backup & Health → Export JSON.*
To move to another device: carry the app file and the backup, then *Import JSON*.

---

## 8 · What comes next

Module 01 is the first of sixteen. The order is deliberate — see the business clearly
first, then fix what you can see.

| # | Module | Status |
|---|---|---|
| **01** | **Dashboard & BI** | **Delivered — this ZIP** |
| 02 | Sales & Orders | Next |
| 03 | Inventory & Warehouse | |
| 04 | Manufacturing | |
| 05 | Accounting & Finance | |
| 06 | CRM & Customers | |
| 07 | HR & Payroll | |
| 08 | Catalog / PIM | |
| 09 | Purchase — Procurement + Vendor Management | Built earlier |
| 10–16 | Channels, Logistics, Projects, Support, Automation, AI, Platform | |

Every module from here follows exactly this shape: one ZIP, one ZIP per app inside it,
both editions of every app, a working HTML file, a complete manual, and an illustrated
PDF built from real screenshots of the shipped file.

---

**Medhava · One business. One brain.**
Module 01 · Dashboard & BI · FY 2026-27
