#!/usr/bin/env python3
"""Turn PROJECT_REPORT.md into a branded HTML page, ready for printing to PDF.

    python3 tools/report_pdf.py                       # PROJECT_REPORT.md  -> .html
    python3 tools/report_pdf.py PLAN_OF_ACTION.md      # any markdown in the repo
    node tools/report_pdf.js <file.html> <file.pdf>    # then prints the PDF

The markdown subset here is exactly what the report uses — headings, tables,
lists, fenced code, block quotes, bold, italic, inline code, rules and links.
A general markdown library would be more code and no more correct for this file.
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Arguments: the document, and optionally which edition's cover it wears.
_ARGV = sys.argv[1:]
_BRAND_ARG = None
if "--brand" in _ARGV:
    _i = _ARGV.index("--brand")
    if _i + 1 >= len(_ARGV):
        sys.exit("report_pdf: --brand needs a value (medhava or vastrangam)")
    _BRAND_ARG = _ARGV[_i + 1].lower()
    del _ARGV[_i:_i + 2]

# Which document to render. Defaults to the project report; any markdown file in
# the repo can be passed instead, so one renderer serves every deliverable.
SRC = ROOT / (_ARGV[0] if _ARGV else "PROJECT_REPORT.md")
OUT = SRC.with_suffix(".html")
# .title() would lowercase an acronym — "Vastrangam_BOS_Final" came out as
# "Vastrangam Bos Final" — so a word that is already all-caps is left alone.
TITLE = " ".join(
    w if (w.isupper() and len(w) > 1) else w.title()
    for w in SRC.stem.replace("_", " ").split()
)

# WHOSE DOCUMENT IS THIS?
# The cover mark, the <title> and the page footer used to be the literal string
# VASTRANGAM, hardcoded — which was fine while this renderer served one company
# and became a real defect the moment it did not: MEDHAVA_PLAN_OF_ACTION.pdf and
# Medhava_BOS_Final.pdf both shipped with a VASTRANGAM cover and a "Vastrangam
# Group · Surat" footer on every page. Two Medhava documents branded as another
# company. So the brand is chosen from the document being rendered, and adding a
# third edition is a row here rather than another hardcoded string.
BRANDS = [
    ("medhava", {
        "mark": "MEDHAVA",
        "title": lambda t: t if t.lower().startswith("medhava") else f"Medhava — {t}",
        "foot": "Medhava · One business operating system · Any industry",
    }),
    ("vastrangam", {
        "mark": "VASTRANGAM",
        "title": lambda t: t if t.lower().startswith("vastrangam")
        else f"Vastrangam Group ERP — {t}",
        "foot": "Vastrangam Group · Desire to Attire · Surat · Confidential",
    }),
]


def _brand():
    # An explicit --brand wins, because a document whose name declares no edition
    # has no other way to say whose it is.
    if _BRAND_ARG is not None:
        for key, b in BRANDS:
            if key == _BRAND_ARG:
                return {"mark": b["mark"], "title": b["title"](TITLE), "foot": b["foot"]}
        sys.exit("report_pdf: unknown --brand %r. Known: %s"
                 % (_BRAND_ARG, ", ".join(k for k, _ in BRANDS)))

    stem = SRC.stem.lower()
    for key, b in BRANDS:
        if stem.startswith(key):
            return {"mark": b["mark"], "title": b["title"](TITLE), "foot": b["foot"]}

    # AND WHEN THE NAME SAYS NOTHING, THIS REFUSES RATHER THAN GUESSES.
    # It used to fall through to Vastrangam, on the reasoning that "anything not
    # named for an edition is a Vastrangam working document — that is what every
    # such file in this repository has been". That was true when it was written
    # and quietly stopped being true: DEPLOYMENT.md is declared MEDHAVA in the
    # delivery manifest and had been shipping a VASTRANGAM cover and a
    # "Vastrangam Group · Surat · Confidential" footer on every page. It is the
    # same defect the comment above records being fixed once already, returned
    # through the default rather than through a hardcoded string — which is why
    # there is now no default at all. A guess that is right most of the time is
    # the worst kind: nothing ever fails, and the wrong ones ship.
    sys.exit(
        "report_pdf: %s is named for no edition, so this renderer cannot tell whose\n"
        "document it is, and it will not guess — the last guess put another company's\n"
        "cover on a product document and shipped it.\n"
        "  Pass one:  python3 tools/report_pdf.py %s --brand medhava\n"
        "             python3 tools/report_pdf.py %s --brand vastrangam"
        % (SRC.name, SRC.name, SRC.name)
    )


BRAND = _brand()

# Rendered in the browser before the PDF prints, so the diagrams are real SVG.
# Read from disk and inlined — the print step has no network.
# Nearest first, and every one of them is a path a clone can actually have. The
# first entry used to be an absolute path into a session scratchpad — a directory
# reclaimed when that session ended and absent from a fresh clone entirely. The
# build worked only on the machine that happened to have it, and because the two
# in-repo fallbacks were both empty, nobody else could render a diagram at all.
# `npm ci` at the repo root now puts mermaid in the first of these.
MERMAID_PATHS = [
    str(ROOT / "node_modules" / "mermaid" / "dist" / "mermaid.min.js"),
    str(ROOT / "app" / "node_modules" / "mermaid" / "dist" / "mermaid.min.js"),
]

# The palette carried from the branded reports and the app.
CSS = """
@page { size: A4; margin: 16mm 14mm 18mm; }
:root{
  --ink:#241436; --purple:#4E2A7A; --purple2:#6B3CA6; --gold:#B08343;
  --navy:#1B2A4A; --mut:#6E6153; --line:#E4DCEC; --wash:#FAF7FC; --code:#F4F0F8;
}
*{box-sizing:border-box}
body{
  font-family:"DM Sans","Jost",-apple-system,Segoe UI,Helvetica,Arial,sans-serif;
  color:var(--ink); font-size:10.2pt; line-height:1.62; margin:0;
  -webkit-print-color-adjust:exact; print-color-adjust:exact;
}
h1,h2,h3,h4{font-family:"Cormorant Garamond",Georgia,serif; font-weight:700; line-height:1.2}
h1{
  font-size:27pt; color:var(--purple); margin:0 0 4pt;
  border-bottom:2.5pt solid var(--gold); padding-bottom:8pt; letter-spacing:.2pt;
}
h1 + p{font-size:12pt; color:var(--purple2); font-weight:600; margin-top:10pt}
h2{
  font-size:17pt; color:#fff; background:var(--purple); margin:26pt 0 12pt;
  padding:7pt 12pt; border-left:5pt solid var(--gold); break-after:avoid;
}
h3{font-size:13.5pt; color:var(--purple2); margin:18pt 0 7pt; break-after:avoid}
h4{font-size:11.5pt; color:var(--ink); margin:13pt 0 5pt; break-after:avoid}
p{margin:0 0 8pt}
strong{color:var(--purple2)}
em{color:var(--mut)}
a{color:var(--purple2); text-decoration:none}
hr{border:0; border-top:1pt solid var(--line); margin:20pt 0}

table{
  border-collapse:collapse; width:100%; margin:10pt 0 14pt;
  font-size:8.9pt; break-inside:avoid;
}
th{
  background:var(--navy); color:#fff; font-weight:700; text-align:left;
  padding:6pt 7pt; border:0; font-size:8.6pt; letter-spacing:.2pt;
}
td{padding:5pt 7pt; border-bottom:.6pt solid var(--line); vertical-align:top}
tbody tr:nth-child(even){background:var(--wash)}
/* a consolidated / total row reads as one, wherever it appears */
tbody tr.total td{background:var(--navy); color:#fff; font-weight:700}

ul,ol{margin:0 0 9pt; padding-left:17pt}
li{margin:0 0 3.5pt}

blockquote{
  margin:10pt 0; padding:8pt 13pt; background:var(--wash);
  border-left:3.5pt solid var(--gold); color:var(--ink); font-style:italic;
}
blockquote strong{font-style:normal}

code{
  font-family:"SF Mono",Menlo,Consolas,monospace; font-size:8.6pt;
  background:var(--code); padding:1pt 3.5pt; border-radius:2pt; color:var(--purple);
}
pre{
  background:var(--code); border-left:3pt solid var(--purple2);
  padding:9pt 12pt; margin:9pt 0 13pt; overflow-x:auto; break-inside:avoid;
}
pre code{background:none; padding:0; font-size:8.4pt; color:var(--ink); line-height:1.5}

.cover{
  text-align:center; padding:34pt 0 26pt; margin-bottom:6pt;
  border-bottom:1pt solid var(--line);
}
.cover .mark{font-size:30pt; letter-spacing:5pt; color:var(--gold)}
.mermaid{
  margin:12pt 0 16pt; text-align:center; break-inside:avoid;
  background:var(--wash); border:.6pt solid var(--line); border-radius:3pt; padding:10pt 6pt;
}
/* max-height matters as much as max-width. A tall diagram with break-inside:avoid
   cannot fit on any page, so the renderer drops it and prints a heading above a
   sheet of white — which passed every automated check, because "no unrendered
   flowchart text" is also true of a diagram that vanished. Capping the height
   makes an over-tall diagram shrink instead of disappear. */
.mermaid svg{max-width:100%; max-height:205mm; width:auto; height:auto}
/* A screenshot is evidence, so it is given room and never split across a page
   break — half a screen at the foot of one page and half at the head of the
   next is worse than no picture at all. */
figure.shot{margin:12pt 0 16pt; break-inside:avoid; page-break-inside:avoid; text-align:center}
figure.shot img{
  max-width:100%; height:auto; display:block; margin:0 auto;
  border:.6pt solid var(--line); border-radius:3pt;
}
figure.shot figcaption{
  margin-top:5pt; font-size:8pt; color:var(--mut); font-style:italic;
}
p > img{max-width:100%; height:auto}
.foot{
  margin-top:26pt; padding-top:9pt; border-top:1pt solid var(--line);
  font-size:8pt; color:var(--mut); text-align:center;
}
"""


def esc(s: str) -> str:
    return html.escape(s, quote=False)


# Extensions we are willing to inline, and the media type each one becomes.
IMG_TYPES = {
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
}


def data_uri(src: str) -> str:
    """A local image as a base64 data URI.

    Inlined rather than linked for the same reason mermaid is inlined: the print
    step runs from a file:// page with no network, and a document that depends on
    a sibling file is a document that arrives broken the first time somebody sends
    only the PDF.

    Paths are resolved relative to the MARKDOWN FILE, which is what a markdown
    viewer does, so `![](shots/m05.png)` means the same thing here and there.

    A missing file raises. It would be easy to emit an empty <img> and carry on,
    and the only place that shows up is the finished document in a reader's hands
    — which is precisely the failure this repository keeps paying for.
    """
    if re.match(r"^(https?:|data:)", src):
        return src                      # already a URI; left alone, not fetched
    p = (SRC.parent / src).resolve()
    if not p.exists():
        raise SystemExit(
            f"report_pdf: {SRC.name} references an image that does not exist:\n"
            f"  {src}\n  looked in {p}\n"
            f"Generate it first (brand/delivery/website/mkshots.js) rather than "
            f"shipping a document with a hole in it."
        )
    kind = IMG_TYPES.get(p.suffix.lower())
    if kind is None:
        raise SystemExit(f"report_pdf: {src} is not an image type this renderer inlines")
    import base64
    return f"data:{kind};base64," + base64.b64encode(p.read_bytes()).decode("ascii")


def inline(s: str) -> str:
    """Inline marks.

    Code spans are lifted out to placeholders FIRST and put back last, so their
    contents are never re-read as markdown — but the rest of the line is still
    one string while bold and italic are matched.

    This used to split the line on backticks and format each piece separately,
    which quietly broke every emphasis that wrapped a code span:
    `**`core/packs.js` may not contain a trade word.**` put the opening
    `**` in one piece and the closing `**` in another, so neither matched and
    both printed as literal asterisks. Six of them reached PLAN_OF_ACTION.pdf and
    six more reached Vastrangam_BOS_Final.pdf before anyone read the page.
    """
    codes: list[str] = []

    def stash(m: re.Match) -> str:
        codes.append(f"<code>{esc(m.group(1))}</code>")
        return f"\x00C{len(codes) - 1}\x00"

    t = re.sub(r"`([^`]+)`", stash, s)
    t = esc(t)
    # Images BEFORE links. The link rule matches the `[alt](src)` half of an
    # image and would turn every screenshot into a broken anchor.
    t = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)",
               lambda m: f'<img src="{data_uri(m.group(2))}" alt="{m.group(1)}">', t)
    t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', t)
    # Bold before italic, and non-greedy rather than "anything but an asterisk".
    # `[^*]+` could not cross an italic nested inside a bold, so
    # `**Sets = the minimum across the *populated* member columns.**` matched
    # nothing and printed its own asterisks. Non-greedy still stops at the first
    # closing `**`, so `**a** and **b**` remains two separate bolds. The inner
    # `*populated*` is then picked up by the italic rule on the next line.
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<em>\1</em>", t)
    return re.sub(r"\x00C(\d+)\x00", lambda m: codes[int(m.group(1))], t)


def is_total_row(cells) -> bool:
    first = re.sub(r"[^a-z ]", "", cells[0].lower()).strip()
    return first.startswith("consolidated") or first.startswith("total") \
        or first.startswith("grand total")


def convert(md: str) -> str:
    # HTML comments are markers for the generators (mkrules.js writes
    # <!-- RULES:12 --> around the blocks it owns). They are invisible in a
    # markdown viewer, so they were invisible here too — until this converter
    # escaped them into &lt;!-- ... --&gt; and printed all forty-eight of them
    # into the reader's PDF as body text. Drop them before anything else runs.
    md = re.sub(r"^[ \t]*<!--.*?-->[ \t]*\n?", "", md, flags=re.M | re.S)

    lines = md.split("\n")
    out, i = [], 0
    while i < len(lines):
        line = lines[i]

        if line.startswith("```"):
            lang = line[3:].strip().lower()
            i += 1
            block = []
            while i < len(lines) and not lines[i].startswith("```"):
                block.append(lines[i])
                i += 1
            i += 1
            body = "\n".join(block)
            if lang in ("mermaid", "gantt"):
                # Left for mermaid to draw in the browser before the PDF prints.
                out.append('<div class="mermaid">' + esc(body) + "</div>")
            else:
                out.append("<pre><code>" + esc(body) + "</code></pre>")
            continue

        if re.match(r"^\s*(---|===)\s*$", line):
            out.append("<hr>")
            i += 1
            continue

        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            level = min(len(m.group(1)), 4)
            out.append(f"<h{level}>{inline(m.group(2).strip())}</h{level}>")
            i += 1
            continue

        # A line that is ONLY an image becomes a figure, so it gets the caption
        # and the page-break protection a screenshot needs. Wrapped in <p> it
        # would inherit paragraph spacing and be free to split across pages.
        m = re.match(r"^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$", line)
        if m:
            alt, src = m.group(1), m.group(2)
            cap = f"<figcaption>{inline(alt)}</figcaption>" if alt.strip() else ""
            out.append(f'<figure class="shot"><img src="{data_uri(src)}" '
                       f'alt="{esc(alt)}">{cap}</figure>')
            i += 1
            continue

        # A table: a header row, a separator of dashes, then body rows.
        if line.strip().startswith("|") and i + 1 < len(lines) \
                and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
            head = [c.strip() for c in line.strip().strip("|").split("|")]
            i += 2
            body = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                body.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            rows = ["<table><thead><tr>"
                    + "".join(f"<th>{inline(c)}</th>" for c in head)
                    + "</tr></thead><tbody>"]
            for cells in body:
                if all(set(c) <= set("─- ") for c in cells if c):
                    continue                      # a drawn divider row, not data
                cls = ' class="total"' if is_total_row(cells) else ""
                rows.append(f"<tr{cls}>"
                            + "".join(f"<td>{inline(c)}</td>" for c in cells)
                            + "</tr>")
            rows.append("</tbody></table>")
            out.append("".join(rows))
            continue

        if line.strip().startswith(">"):
            block = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                block.append(lines[i].strip().lstrip(">").strip())
                i += 1
            out.append("<blockquote>" + inline(" ".join(block).strip()) + "</blockquote>")
            continue

        m = re.match(r"^\s*(\d+)\.\s+(.*)$", line)
        if m:
            items = []
            while i < len(lines) and re.match(r"^\s*\d+\.\s+", lines[i]):
                items.append(re.sub(r"^\s*\d+\.\s+", "", lines[i]))
                i += 1
                while i < len(lines) and lines[i].startswith("   ") and lines[i].strip():
                    items[-1] += " " + lines[i].strip()
                    i += 1
            out.append("<ol>" + "".join(f"<li>{inline(t)}</li>" for t in items) + "</ol>")
            continue

        if re.match(r"^\s*[-*]\s+", line):
            items = []
            while i < len(lines) and re.match(r"^\s*[-*]\s+", lines[i]):
                items.append(re.sub(r"^\s*[-*]\s+", "", lines[i]))
                i += 1
                while i < len(lines) and lines[i].startswith("  ") and lines[i].strip() \
                        and not re.match(r"^\s*[-*]\s+", lines[i]):
                    items[-1] += " " + lines[i].strip()
                    i += 1
            out.append("<ul>" + "".join(f"<li>{inline(t)}</li>" for t in items) + "</ul>")
            continue

        if not line.strip():
            i += 1
            continue

        para = [line.strip()]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(
                r"^\s*(#{1,6}\s|[-*]\s|\d+\.\s|\||>|```|---)", lines[i]):
            para.append(lines[i].strip())
            i += 1
        out.append("<p>" + inline(" ".join(para)) + "</p>")

    return "\n".join(out)


def main():
    if not SRC.exists():
        sys.exit(f"missing {SRC}")
    body = convert(SRC.read_text(encoding="utf-8"))
    mermaid_js = ""
    for candidate in MERMAID_PATHS:
        if Path(candidate).exists():
            mermaid_js = Path(candidate).read_text(encoding="utf-8")
            break
    if not mermaid_js:
        print("  ! mermaid.min.js not found — diagrams will print as text")
    script = f"""<script>{mermaid_js}</script>
<script>
  mermaid.initialize({{ startOnLoad:false, theme:'base', securityLevel:'loose',
    themeVariables:{{ primaryColor:'#EFE8F6', primaryTextColor:'#241436',
      primaryBorderColor:'#6B3CA6', lineColor:'#B08343', fontFamily:'DM Sans, Arial',
      fontSize:'13px', clusterBkg:'#FAF7FC', clusterBorder:'#E4DCEC' }} }});
  window.__mermaidDone = mermaid.run({{ querySelector:'.mermaid' }})
    .then(()=>{{ document.body.dataset.mermaid='done'; }})
    .catch(e=>{{ document.body.dataset.mermaid='error'; console.error(e); }});
</script>""" if mermaid_js else ""

    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>{BRAND['title']}</title>
<style>{CSS}</style></head>
<body>
<div class="cover"><div class="mark">{BRAND['mark']}</div></div>
{body}
<div class="foot">{BRAND['foot']}</div>
{script}
</body></html>"""
    OUT.write_text(page, encoding="utf-8")
    print(f"wrote {OUT}  ({len(page)//1024} KB)")


if __name__ == "__main__":
    main()
