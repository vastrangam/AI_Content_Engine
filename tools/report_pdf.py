#!/usr/bin/env python3
"""Turn PROJECT_REPORT.md into a branded HTML page, ready for printing to PDF.

    python3 tools/report_pdf.py                  # writes PROJECT_REPORT.html
    node tools/report_pdf.js                     # then prints the PDF

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
SRC = ROOT / "PROJECT_REPORT.md"
OUT = ROOT / "PROJECT_REPORT.html"

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
.foot{
  margin-top:26pt; padding-top:9pt; border-top:1pt solid var(--line);
  font-size:8pt; color:var(--mut); text-align:center;
}
"""


def esc(s: str) -> str:
    return html.escape(s, quote=False)


def inline(s: str) -> str:
    """Inline marks. Code first, so nothing inside backticks is re-read."""
    out, parts = [], re.split(r"(`[^`]+`)", s)
    for part in parts:
        if part.startswith("`") and part.endswith("`") and len(part) > 1:
            out.append(f"<code>{esc(part[1:-1])}</code>")
            continue
        t = esc(part)
        t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', t)
        t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
        t = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<em>\1</em>", t)
        out.append(t)
    return "".join(out)


def is_total_row(cells) -> bool:
    first = re.sub(r"[^a-z ]", "", cells[0].lower()).strip()
    return first.startswith("consolidated") or first.startswith("total") \
        or first.startswith("grand total")


def convert(md: str) -> str:
    lines = md.split("\n")
    out, i = [], 0
    while i < len(lines):
        line = lines[i]

        if line.startswith("```"):
            i += 1
            block = []
            while i < len(lines) and not lines[i].startswith("```"):
                block.append(lines[i])
                i += 1
            i += 1
            out.append("<pre><code>" + esc("\n".join(block)) + "</code></pre>")
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
    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Vastrangam Group ERP — Project Report</title>
<style>{CSS}</style></head>
<body>
<div class="cover"><div class="mark">VASTRANGAM</div></div>
{body}
<div class="foot">Vastrangam Group · Desire to Attire · Surat · Confidential</div>
</body></html>"""
    OUT.write_text(page, encoding="utf-8")
    print(f"wrote {OUT}  ({len(page)//1024} KB)")


if __name__ == "__main__":
    main()
