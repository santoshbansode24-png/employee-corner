from docxtpl import DocxTemplate
import os

def check_file(filename):
    if not os.path.exists(filename):
        print(f"[MISSING] {filename} NOT FOUND")
        return set()
    
    try:
        doc = DocxTemplate(filename)
        vars = doc.get_undeclared_template_variables()
        print(f"[OK] Found {len(vars)} variables in {filename}:")
        for v in sorted(vars):
            print(f" - {v}")
        return vars
    except Exception as e:
        print(f"[ERROR] Error parsing variables: {e}")
        return set()

print("--- VARIABLE CHECK START ---")
vars_template = check_file(r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed.docx")
print("--- VARIABLE CHECK END ---")
