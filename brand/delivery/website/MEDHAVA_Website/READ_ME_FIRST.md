# Medhava — website landing page

The unified edition — one ERP for manufacturing, export, trade and services alike.

## What is in this folder

| File | What it is | How to open it |
|---|---|---|
| `MEDHAVA_Website_Landing_Page.pdf` | The whole page as a document — the day half first, then the night half. Text is vector, so it stays sharp at any zoom and you can select and search it. | Any PDF reader |
| `MEDHAVA_Website_Landing_Page.html` | The live page. One self-contained file — no images to lose, no internet needed. The Night button, the module links and the Monthly/Yearly price switch all work. | Double-click it. Any browser, on a computer or a phone. |
| `MEDHAVA_Website_Landing_Page.md` | The same page as plain text — every module, every app, and what each one reads and writes. For searching, sending, or pasting into a document. | Any text editor, or a Markdown viewer |

## On a phone

Send yourself the `.html` file and open it. It is one file, so nothing can arrive
broken. The layout folds to a single column on a small screen; the Night button is
in the top bar.

## Where these come from

Nothing in these three files is typed by hand twice. Every module number, every app
count and every wiring line is generated from one file, `modules.js`, so the PDF,
the page and the plain text cannot disagree with each other.

Before the build writes anything it checks two things and refuses to finish if
either fails:

1. **Contrast.** Every piece of text on the page is measured against the surface
   actually behind it, in both the day and the night theme, and must reach the
   WCAG AA standard. Same-colour-on-same-colour is the one design fault that is
   invisible to the person who wrote it, so it is measured rather than eyeballed.
2. **Structure.** A separate audit checks that every "comes from" names a module
   that really exists, that no outside company is ever named as the source of a
   figure, and that the app count in every file matches the canonical list.

The two editions are built from the same structure. The Medhava edition changes
words, never modules or apps — and the build compares the shape before and after
and stops if it differs.
