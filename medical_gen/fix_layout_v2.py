
from docx import Document
from docx.shared import Inches
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_table_width_to_window(table):
    # This is a bit of low-level XML manipulation to force "Autofit to Window"
    tblPr = table._tbl.tblPr
    
    # 1. Set Table Width to "auto" or 100% (5000 pct)
    # <w:tblW w:w="5000" w:type="pct"/>
    tblW = tblPr.find(qn('w:tblW'))
    if tblW is None:
        tblW = OxmlElement('w:tblW')
        tblPr.append(tblW)
    
    tblW.set(qn('w:w'), '5000') # 5000 pct = 100%
    tblW.set(qn('w:type'), 'pct')

def fix_layout():
    filename = 'template_fixed.docx'
    doc = Document(filename)
    
    print(f"Applying layout fixes to {filename}...")
    
    # 1. Set Narrow Margins (0.5 inch)
    for section in doc.sections:
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)
        section.page_width = Inches(8.27) # A4
    
    print("✅ Set margins to Narrow (0.5 inch).")

    # 2. Fix Tables
    for i, table in enumerate(doc.tables):
        print(f"Fixing Table {i+1}...")
        
        # Enable python-docx autofit
        table.autofit = True 
        table.allow_autofit = True
        
        # Set XML width to 100%
        set_table_width_to_window(table)
        
        # Reset cell widths to allow autofit to work
        for row in table.rows:
            for cell in row.cells:
                # Remove explicit width from cell properties if possible
                tcPr = cell._tc.get_or_add_tcPr()
                tcW = tcPr.find(qn('w:tcW'))
                if tcW is not None:
                    # Set to auto
                    tcW.set(qn('w:type'), 'auto')
                    tcW.set(qn('w:w'), '0')

    doc.save(filename)
    print(f"✅ Saved fixes to {filename}")

if __name__ == "__main__":
    fix_layout()
