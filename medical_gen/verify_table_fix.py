
import os
import sys
from docxtpl import DocxTemplate
import datetime

def verify_fix():
    print("Verifying fix with dummy data...")
    template_path = "template_fixed_with_loop.docx"
    output_docx = "test_table_fix.docx"
    
    if not os.path.exists(template_path):
        print(f"Error: {template_path} not found")
        return

    doc = DocxTemplate(template_path)
    
    context = {
        'medicine_receipts': [
            {'receipt_no': 'R001', 'date': '01/01/2026', 'amount': '500'},
            {'receipt_no': 'R002', 'date': '02/01/2026', 'amount': '1500'},
            {'receipt_no': 'R003', 'date': '03/01/2026', 'amount': '2500'},
        ],
        'loop': {'index': 1}, # Jinja2 loop index is automatic in loops, but if used outside? 
                             # Wait, docxtpl handles loop.index in {% for %} automatically.
    }
    
    try:
        doc.render(context)
        doc.save(output_docx)
        print(f"Generated {output_docx}. Open this file to verify the table has 3 rows.")
    except Exception as e:
        print(f"Render Error: {e}")

if __name__ == "__main__":
    verify_fix()
