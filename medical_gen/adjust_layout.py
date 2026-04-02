from docx import Document
from docx.shared import Inches, Pt
from docx.enum.section import WD_SECTION

def adjust_layout():
    filename = 'template.docx'
    
    try:
        doc = Document(filename)
        print(f"📄 Opened {filename}")
        
        # 1. Inspect and Adjust Margins
        print("--- Margins ---")
        sections = doc.sections
        for i, section in enumerate(sections):
            print(f"Section {i}: Top={section.top_margin.inches:.2f}, Bottom={section.bottom_margin.inches:.2f}, Left={section.left_margin.inches:.2f}, Right={section.right_margin.inches:.2f}")
            
            # Action: Set to Narrow (0.5 inches)
            section.top_margin = Inches(0.5)
            section.bottom_margin = Inches(0.5)
            section.left_margin = Inches(0.5)
            section.right_margin = Inches(0.5)
            
            # Ensure A4 size if not
            section.page_width = Inches(8.27)
            section.page_height = Inches(11.69)
            
        print("✅ Adjusted margins to Narrow (0.5 inch) and Page size to A4.")

        # 2. Adjust Table Rows (prevent breaking across pages if possible)
        # Often rows getting split causes layout issues.
        # But we can't easily set "Keep with next" for rows without low-level XML.
        # However, we can at least ensure table styling is compact.
        
        for table in doc.tables:
            table.autofit = False
            # Check if we can tighten row heights? 
            # Usually better to let Word handle height unless specific requirement.
            pass

        doc.save(filename)
        print(f"💾 Saved layout adjustments to {filename}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    adjust_layout()
