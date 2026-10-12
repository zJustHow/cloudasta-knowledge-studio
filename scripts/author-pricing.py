import json, math, re
from pathlib import Path
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.comments import Comment
root=Path('demo-files'); data_path=Path('.build/corpus/author-data.json'); docs=json.loads(data_path.read_text())
for d in docs:
 if d['type']!='Pricing framework' or d.get('copyOf'): continue
 wb=Workbook(); ws=wb.active; ws.title='Control'
 control=[['CLOUDASTA / COMMERCIAL OPERATIONS',''],['Document',d['title']],['Owner',d['owner']],['Business date',d['date'] or 'Not recorded'],['Approval',d['approval']],['Customer scope',d['client']],['Effective date',d['effective'] or 'Not verified'],['Expiry',d['expires'] or 'See executed customer order'],['Currency','USD; taxes excluded'],['Dataset','Fictional demonstration. No actual vendor rates.']]
 for row in control: ws.append(row)
 rates=wb.create_sheet('Rate schedule');d['sheetKeys']['Rate schedule']='migration' if d['id']=='legacy-pricing' else 'license'
 rates.append(['Item','Unit','USD rate','Commitment / scope','Status'])
 rate=28 if d['id']=='pricing-v2' else 21 if d['id']=='acme-pricing' else 23 if d['id']=='beta-pricing' else 24
 if d['id']=='legacy-pricing':rates.append(['MIG-2025-PILOT','tenant',900,'Up to 25 mailboxes; orders by 31 Dec 2025','Expired'])
 else:
  rates.append(['Managed workspace subscription','user / month',rate,'100 seats' if d['client']!='Global' else 'Minimum 50 seats; annual billing',d['approval'].title()])
  if d['client']=='Global': rates.append(['IMP-STD implementation','tenant',2500,'Up to 100 mailboxes; one production migration',d['approval'].title()])
  else: rates.append(['Migration project services','engagement',12000,'Separately scoped and approved proposal','Separate quote required'])
 tab=Table(displayName='CommercialRates',ref=f'A1:E{rates.max_row}');tab.tableStyleInfo=TableStyleInfo(name='TableStyleMedium2',showRowStripes=True);rates.add_table(tab)
 for cell in rates['C'][1:]:cell.number_format='"$"#,##0.00;("$"#,##0.00);"-"';cell.font=Font(name='Arial',color='0000FF',size=11);cell.comment=Comment('Source: authored fictional Cloudasta commercial schedule, '+d['date']+'. This is an input rate, not a calculated total.','Cloudasta Demo')
 for s in d['sections']:
  name={'license':'Subscription terms','onboarding':'Implementation scope','discount':'Approval controls','migration':'Campaign terms'}[s['key']];sh=wb.create_sheet(name);d['sheetKeys'][name]=s['key'];sh.append(['Clause','Commercial terms / operating instruction'])
  for i,p in enumerate(s['text'].split('\n\n'),1):sh.append([f'{s["key"].upper()}-{i:02}',p])
 for sh in wb:
  sh.freeze_panes='B2';sh.sheet_view.showGridLines=False
  sh.sheet_properties.pageSetUpPr.fitToPage=True;sh.page_setup.orientation='landscape';sh.page_setup.paperSize=sh.PAPERSIZE_A4;sh.page_setup.fitToWidth=1;sh.page_setup.fitToHeight=0
  sh.print_title_rows='1:1';sh.oddFooter.center.text='Fictional demonstration / &A / Page &P'
  widths=[38,25,18,57,30] if sh.title=='Rate schedule' else [28,104]
  for i,width in enumerate(widths,1):sh.column_dimensions[chr(64+i)].width=width
  for row in sh:
   for c in row:
    if c.font.color is None or c.coordinate[0]!='C':c.font=Font(name='Arial',size=11,color='263445',bold=c.row==1)
    c.alignment=Alignment(vertical='top',wrap_text=True)
    if c.row==1:c.fill=PatternFill('solid',fgColor='17364A');c.font=Font(name='Arial',size=12,bold=True,color='FFFFFF')
    elif c.row%2==0:c.fill=PatternFill('solid',fgColor='F0F4F6')
   sh.row_dimensions[row[0].row].height=max(32,min(390,18*max(math.ceil(len(str(c.value or ''))/max(12,widths[min(i,len(widths)-1)]-4)) for i,c in enumerate(row))+10))
 wb.save(root/d['path'])
 # Reopen to verify native tables, numeric rates, readable terms and no formula errors.
 checked=load_workbook(root/d['path']);assert checked['Rate schedule']['C2'].value==(900 if d['id']=='legacy-pricing' else rate)
 assert all(c.data_type!='e' for sheet in checked for row in sheet for c in row)
data_path.write_text(json.dumps(docs,indent=2))
