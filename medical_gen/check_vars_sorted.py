from docxtpl import DocxTemplate
import os

def check_file(filename):
    if not os.path.exists(filename):
        print(f"\n❌ {filename} NOT FOUND")
        return set()
    
    with open("vars_report.txt", "a", encoding="utf-8") as f:
        f.write(f"\n📂 Checking {filename}...\n")
        try:
            doc = DocxTemplate(filename)
            vars = doc.get_undeclared_template_variables()
            f.write(f"✅ Found {len(vars)} variables:\n")
            for v in sorted(vars):
                print(f" - {v}")
                f.write(f" - {v}\n")
            return vars
        except Exception as e:
            msg = f"❌ Error parsing variables: {e}\n"
            print(msg)
            f.write(msg)
            return set()

# clear file
open("vars_report.txt", "w").close()


print("--- VARIABLE CHECK START ---")
vars_original = check_file("template.docx")
vars_fixed = check_file("template_fixed.docx")

# Check for specific expected variables from main.py
expected_vars = [
    'mem_name1', 'mem_rel1', 'mem_age1', 'mem_job1',
    'mem_name5', # Check boundaries
    'relative_emp_name', 'relative_designation', 'relative_office_name',
    'gw_days', 'semi_days', 'pvt_days', 'icu_days'
]


with open("vars_report.txt", "a", encoding="utf-8") as f:
    f.write("\n--- COMPARISON ---\n")
    if vars_original == vars_fixed:
        f.write("Variables are identical in both files.\n")
    else:
        f.write("Variables DIFFER!\n")
        diff = vars_fixed.symmetric_difference(vars_original)
        f.write(f"Difference: {diff}\n")

    f.write("\n--- CRITICAL VARIABLE CHECK ---\n")
    for var in expected_vars:
        if var in vars_fixed:
            f.write(f"✅ {var} FOUND in template_fixed.docx\n")
        else:
            f.write(f"❌ {var} MISSING in template_fixed.docx (Check for typos or split tags)\n")

