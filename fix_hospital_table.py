from docx import Document
import os

def check_and_fix_template():
    template_path = os.path.join("medical_gen", "template.docx")
    doc = Document(template_path)

    # Find the table with "General Ward" or "जनरल वॉर्ड"
    target_table = None
    for table in doc.tables:
        if len(table.rows) > 1:
            first_cell_text = table.rows[1].cells[1].text  # Check column 1 (Room type usually)
            if "General Ward" in first_cell_text or "जनरल" in first_cell_text:
                target_table = table
                break
    
    if not target_table:
        print("Could not find the Hospital Stay table.")
        return

    print(f"Found table with {len(target_table.rows)} rows.")

    # Rules for replacement: Row Index -> Prefix to use
    # Note: Row 0 is header.
    # Row 1: General Ward -> gw
    # Row 2: Semi-Private -> semi
    # Row 3: Private -> pvt
    # Row 6: ICU -> icu
    
    # Let's inspect rows 1, 2, 3, 6
    rows_to_check = {
        1: 'gw',
        2: 'semi',
        3: 'pvt',
        6: 'icu'
    }

    for r_idx, prefix in rows_to_check.items():
        if r_idx < len(target_table.rows):
            row = target_table.rows[r_idx]
            # Column 2: Dates (Index 2)
            # Column 3: Days (Index 3)
            # Column 4: Rate (Index 4)
            # Column 5: Total (Index 5)
            
            # Helper to replace text in cell if it contains a {{variable}}
            def replace_in_cell(cell, correct_var):
                if "{{" in cell.text and correct_var not in cell.text:
                    print(f"Row {r_idx} Fix: Changing '{cell.text.strip()}' to '{{{{ {correct_var} }}}}'")
                    # Naive replacement: just clear and set text. 
                    # Better: try to preserve formatting? For now, text replacement is safer for logic.
                    cell.text = f"{{{{ {correct_var} }}}}"

            replace_in_cell(row.cells[2], f"{prefix}_dates")
            replace_in_cell(row.cells[3], f"{prefix}_days")
            # Rate key varies: gw_rates, semi_rate, pvt_rates, icu_rates.
            # semi used 'rate', others 'rates' in main.py? Let's check main.py
            # main.py: gw_rates, semi_rate, pvt_rates, icu_rates
            
            rate_suffix = "rate" if prefix == "semi" else "rates"
            replace_in_cell(row.cells[4], f"{prefix}_{rate_suffix}")
            
            replace_in_cell(row.cells[5], f"{prefix}_total")

    # Save fixed template
    output_path = os.path.join("medical_gen", "template_fixed.docx")
    doc.save(output_path)
    print(f"Template fixed and saved to {output_path}.")

if __name__ == "__main__":
    check_and_fix_template()
