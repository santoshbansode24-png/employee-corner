from docx import Document
import os

def inspect_table():
    script_dir = os.path.dirname(__file__)
    template_path = os.path.join(script_dir, "medical_gen", "template.docx")
    
    if not os.path.exists(template_path):
        # Fallback if running from root
        template_path = os.path.join("medical_gen", "template.docx")

    print(f"Inspecting: {template_path}")
    doc = Document(template_path)
    
    # Iterate through all tables
    for t_idx, table in enumerate(doc.tables):
        print(f"\n--- Table {t_idx + 1} ---")
        for r_idx, row in enumerate(table.rows):
            row_text = []
            for c_idx, cell in enumerate(row.cells):
                text = cell.text.strip()
                if "{{" in text:
                    row_text.append(f"Col {c_idx}: {text}")
            if row_text:
                print(f"Row {r_idx}: {', '.join(row_text)}")

if __name__ == "__main__":
    inspect_table()
