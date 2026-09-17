#!/usr/bin/env python3
"""MASTER_SPEC_COVERAGE.xlsx — every line of the master specification, and where this stands.

    node brand/delivery/website/mkmasterspec.js     # writes the data
    python3 tools/masterspec_xlsx.py                # writes the workbook

WHY THIS IS PYTHON WHEN THE REGISTER IS JAVASCRIPT
The same reason tools/report_pdf.py is Python beside tools/report_pdf.js: the library lives
there. This reads the generated JSON and writes the workbook. It computes NOTHING about
coverage — every verdict in the sheet was resolved from the requirements registry by
checkmasterspec.js before this file ever ran. If the two ever disagreed, this one would be
the wrong one, so it is not allowed to have an opinion.

THE SUMMARY TAB CARRIES BOTH A FORMULA AND THE REGISTER'S OWN COUNT, SIDE BY SIDE
The formula (COUNTIF over the data sheet) recalculates if anybody filters or extends the
rows. The literal beside it is what the requirements registry said when this was generated.
They should always agree, and if they ever do not, the reader can see it — which makes the
pair a check rather than a duplication.

The second column exists for a measured reason. LibreOffice cannot open a file in this
environment at all: `soffice --version` works, but every headless conversion returns "source
file could not be loaded", on a three-cell test workbook as readily as on this one. So the
formulas here were NEVER EVALUATED before delivery. Excel and Google Sheets both recalculate
on open and will fill them in correctly; anything that reads only cached values — pandas,
openpyxl with data_only, most quick previewers — would have shown an empty summary. The
literals are what that reader sees, and they were verified against the register by reading
the finished workbook back.
"""

import json
import os
import sys

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.table import Table, TableStyleInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'brand', 'delivery', 'website', 'masterspec.data.json')
OUT = os.path.join(ROOT, 'MASTER_SPEC_COVERAGE.xlsx')

if not os.path.exists(DATA):
    sys.exit('masterspec_xlsx: no data. Run: node brand/delivery/website/mkmasterspec.js')

with open(DATA, encoding='utf-8') as fh:
    d = json.load(fh)

rows = d['rows']

HEAD = Font(name='Arial', bold=True, size=10, color='FFFFFF')
BODY = Font(name='Arial', size=10)
SMALL = Font(name='Arial', size=9, color='555555')
TITLE = Font(name='Arial', bold=True, size=14)
NOTE = Font(name='Arial', size=10, italic=True)
HEADFILL = PatternFill('solid', fgColor='1F3864')
THIN = Side(style='thin', color='D9D9D9')
BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
TOPLEFT = Alignment(vertical='top', wrap_text=True)

COLUMNS = [
    ('#', 'section_n', 5),
    ('Section', 'section', 24),
    ('Block', 'block', 22),
    ('Component', 'component', 38),
    ('Medhava', 'medhava', 34),
    ('Medhava state', 'medhava_state', 15),
    ('Medhava rung', 'medhava_rung', 14),
    ('Covered', 'covered', 9),
    ('Uncovered', 'uncovered', 11),
    ('Not possible', 'not_possible', 12),
    ('Why not possible', 'why_not_possible', 54),
]

wb = Workbook()

# ── sheet 1 · every line ────────────────────────────────────────────────────
ws = wb.active
ws.title = 'Coverage'

for c, (label, _, width) in enumerate(COLUMNS, start=1):
    cell = ws.cell(row=1, column=c, value=label)
    cell.font = HEAD
    cell.fill = HEADFILL
    cell.alignment = Alignment(vertical='center', wrap_text=True)
    ws.column_dimensions[get_column_letter(c)].width = width

for r, row in enumerate(rows, start=2):
    for c, (_, key, _w) in enumerate(COLUMNS, start=1):
        cell = ws.cell(row=r, column=c, value=row[key])
        cell.font = BODY
        cell.alignment = TOPLEFT
        cell.border = BOX

last = len(rows) + 1
ws.freeze_panes = 'A2'
# A real table so the filter dropdowns are there without anybody switching them on.
tab = Table(displayName='Coverage', ref=f'A1:{get_column_letter(len(COLUMNS))}{last}')
tab.tableStyleInfo = TableStyleInfo(name='TableStyleLight1', showRowStripes=True)
ws.add_table(tab)

# ── sheet 2 · the summary, computed by formula ──────────────────────────────
sm = wb.create_sheet('Summary')
sm.column_dimensions['A'].width = 46
sm.column_dimensions['B'].width = 12
sm.column_dimensions['C'].width = 12
sm.column_dimensions['D'].width = 12
sm.column_dimensions['E'].width = 12
sm.column_dimensions['F'].width = 16

COV = get_column_letter([k for _, k, _ in COLUMNS].index('covered') + 1)
UNC = get_column_letter([k for _, k, _ in COLUMNS].index('uncovered') + 1)
IMP = get_column_letter([k for _, k, _ in COLUMNS].index('not_possible') + 1)
SEC = get_column_letter([k for _, k, _ in COLUMNS].index('section_n') + 1)
STATE = get_column_letter([k for _, k, _ in COLUMNS].index('medhava_state') + 1)


def put(row, col, value, font=BODY):
    cell = sm.cell(row=row, column=col, value=value)
    cell.font = font
    return cell


put(1, 1, 'The master specification, measured', TITLE)
put(2, 1, 'Every line counted from the register, never typed. No column here states what '
          'any other company does: nobody holds that many sourced claims, and an unsourced '
          'one would make the sheet look complete and be worthless.', SMALL)

put(4, 1, 'The three numbers', Font(name='Arial', bold=True, size=11))
put(5, 1, 'Line items in the specification')
sm['B5'] = f'=COUNTA(Coverage!{SEC}2:{SEC}{last})'
put(6, 1, 'Covered')
sm['B6'] = f'=COUNTIF(Coverage!{COV}2:{COV}{last},"YES")'
put(7, 1, 'Uncovered')
sm['B7'] = f'=COUNTIF(Coverage!{UNC}2:{UNC}{last},"YES")'
put(8, 1, 'Not possible from here')
sm['B8'] = f'=COUNTIF(Coverage!{IMP}2:{IMP}{last},"YES")'
put(9, 1, 'The three above, added back up (must equal the first row)')
sm['B9'] = '=B6+B7+B8'
literal = {
    5: len(rows),
    6: d['totals']['COVERED'],
    7: d['totals']['UNCOVERED'],
    8: d['totals']['NOT POSSIBLE'],
    9: d['totals']['COVERED'] + d['totals']['UNCOVERED'] + d['totals']['NOT POSSIBLE'],
}
put(4, 2, 'By formula', Font(name='Arial', bold=True, size=9))
put(4, 3, 'Share', Font(name='Arial', bold=True, size=9))
put(4, 4, 'From the register', Font(name='Arial', bold=True, size=9))
for r in range(5, 10):
    sm.cell(row=r, column=2).font = BODY
    sm.cell(row=r, column=2).number_format = '#,##0'
    sm.cell(row=r, column=3).value = f'=IF($B$5=0,"",B{r}/$B$5)'
    sm.cell(row=r, column=3).font = BODY
    sm.cell(row=r, column=3).number_format = '0.0%'
    cell = sm.cell(row=r, column=4, value=literal[r])
    cell.font = BODY
    cell.number_format = '#,##0'

put(11, 1, 'Where this product stands on a line',
    Font(name='Arial', bold=True, size=11))
put(12, 1, 'An app that stands above SPECIFIED')
sm['B12'] = f'=COUNTIF(Coverage!{STATE}2:{STATE}{last},"BUILT")'
put(13, 1, 'An app that is SPECIFIED — written down, not built')
sm['B13'] = f'=COUNTIF(Coverage!{STATE}2:{STATE}{last},"DESIGNED ONLY")'
put(14, 1, 'Nothing in the register maps to it at all')
sm['B14'] = f'=COUNTIF(Coverage!{STATE}2:{STATE}{last},"ABSENT")'
state_literal = {12: d['states']['BUILT'], 13: d['states']['DESIGNED ONLY'],
                 14: d['states']['ABSENT']}
put(11, 2, 'By formula', Font(name='Arial', bold=True, size=9))
put(11, 4, 'From the register', Font(name='Arial', bold=True, size=9))
for r in range(12, 15):
    sm.cell(row=r, column=2).font = BODY
    sm.cell(row=r, column=2).number_format = '#,##0'
    cell = sm.cell(row=r, column=4, value=state_literal[r])
    cell.font = BODY
    cell.number_format = '#,##0'

put(16, 1, 'Read this before adding up the Covered column.', NOTE)
put(17, 1, '"Covered" means an app exists for that line AND has reached a rung above '
           'SPECIFIED. It does not mean', SMALL)
put(18, 1, 'the line is finished, and it does not mean the app runs on a real database — '
           'three of them do.', SMALL)
put(19, 1, '"Not possible" means no amount of code closes it: a carrier, a payment licence, '
           'a bank credential,', SMALL)
put(20, 1, 'a government portal registration, an app-store account, live media '
           'infrastructure, a deployed host,', SMALL)
put(21, 1, 'or an audited certification. Each such line names its own reason in the sheet.', SMALL)
put(22, 1, f"Overall score {d['score']}/5 · maturity {d['maturity']}.", SMALL)
put(23, 1, 'Column B is a live formula; column D is what the register said when this was '
           'generated. They should agree.', SMALL)

# per section
head = 25
for c, label in enumerate(['#', 'Section', 'Items', 'Covered', 'Uncovered',
                           'Not possible'], start=1):
    cell = sm.cell(row=head, column=c, value=label)
    cell.font = HEAD
    cell.fill = HEADFILL

for i, s in enumerate(d['sections']):
    r = head + 1 + i
    sm.cell(row=r, column=1, value=s['n']).font = BODY
    sm.cell(row=r, column=2, value=s['title']).font = BODY
    for col, key in ((3, None), (4, 'covered'), (5, 'uncovered'), (6, 'not_possible')):
        if key is None:
            f = f'=COUNTIF(Coverage!${SEC}$2:${SEC}${last},$A{r})'
        else:
            letter = {'covered': COV, 'uncovered': UNC, 'not_possible': IMP}[key]
            f = (f'=COUNTIFS(Coverage!${SEC}$2:${SEC}${last},$A{r},'
                 f'Coverage!${letter}$2:${letter}${last},"YES")')
        cell = sm.cell(row=r, column=col, value=f)
        cell.font = BODY
        cell.number_format = '#,##0'

sm.freeze_panes = 'A2'

wb.save(OUT)
size = os.path.getsize(OUT)
print(f'MASTER_SPEC_COVERAGE.xlsx  {round(size / 1024)}KB · {len(rows)} rows · '
      f'{len(COLUMNS)} columns · {len(d["sections"])} sections')
print('  the Summary tab is COUNTIF/COUNTIFS over the Coverage sheet, not numbers computed')
print('  here, so it recalculates if anybody filters, edits or extends the rows.')
