from docx import Document
from docx.shared import Inches

def adjust_margins_only():
    # Only adjusts margins, touches nothing else
    filename = 'template_fixed.docx'
    try:
        doc = Document(filename)
        for section in doc.sections:
            # Set to standard "Narrow" margins (0.5 inch / 1.27 cm)
            section.top_margin = Inches(0.5)
            section.bottom_margin = Inches(0.5)
            section.left_margin = Inches(0.5)
            section.right_margin = Inches(0.5)
            
            # Ensure A4
            section.page_width = Inches(8.27)
            section.page_height = Inches(11.69)
            
        doc.save(filename)
        print("✅ Applied Narrow Margins to template_fixed.docx")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    adjust_margins_only()
