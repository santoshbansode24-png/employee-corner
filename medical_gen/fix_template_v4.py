import zipfile
import os
import re

source_path = r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed.docx"
dest_path = r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed_repaired_v4.docx"
target_xml = 'word/document.xml'

print(f"Brute Fix V4 {source_path}...")

try:
    with zipfile.ZipFile(source_path, 'r') as zin:
        with zipfile.ZipFile(dest_path, 'w') as zout:
            for item in zin.infolist():
                buffer = zin.read(item.filename)
                
                if item.filename == target_xml:
                    xml_content = buffer.decode('utf-8')
                    
                    # 1. Look for occurrences of our variable
                    # We will replace 'total_staying_charges' followed by optional XML tags and then a ')' or '))'
                    # with 'total_staying_charges' ... }}
                    
                    # Regex to find: total_staying_charges (ignoring tags) then )
                    # This is hard with regex on XML.
                    
                    # Let's simple string replace:
                    # "total_staying_charges))" -> "total_staying_charges}}"
                    # "total_staying_charges)" -> "total_staying_charges}"
                    
                    # But also context revealed: "total_staying_charges}" (only one brace?)
                    # If I see "total_staying_charges}<" I might want to make it "total_staying_charges}}".
                    
                    new_xml = xml_content
                    fixed = False
                    
                    # Fix 1: Explicit )
                    if "total_staying_charges))" in new_xml:
                        new_xml = new_xml.replace("total_staying_charges))", "total_staying_charges}}")
                        fixed = True
                        print("[FIX] Replaced ))")
                        
                    if "total_staying_charges)" in new_xml:
                        new_xml = new_xml.replace("total_staying_charges)", "total_staying_charges}")
                        fixed = True
                        print("[FIX] Replaced )")

                    # Fix 2: Explicit } but possibly single?
                    # If we have {{var} but need {{var}}, replacing } with }} might help UNLESS it's already }}
                    # Be careful.
                    
                    # Let's look for the specific pattern from diagnosis: {{total_staying_charges))
                    # Diagnose used regex: r'\{\{[^}]*?\)\)'
                    # That regex matches {{...)) crossing tags? No, [^}] excludes tags if tags have no }, but tags contain < >.
                    # It likely matched because the user typed it cleanly in one run, so it's a solid string.
                    
                    if not fixed:
                        # Try regex one more time with DOTALL?
                        # Maybe newlines?
                         pattern = r'total_staying_charges.*?\)\)'
                         # This matches total_staying_charges...))
                         
                         def repl(m):
                             print(f"[REPLACING] {m.group(0)}")
                             return m.group(0).replace('))', '}}').replace(')', '}')
                             
                         new_xml, n = re.subn(r'(total_staying_charges[^<]*?)(\)+)', r'\1}}', new_xml)
                         if n > 0:
                             print(f"[FIX] Regex sub fixed {n} items.")
                             fixed = True

                    zout.writestr(item, new_xml.encode('utf-8'))
                else:
                    zout.writestr(item, buffer)

    # Replace original
    backup_path = source_path + ".bak_v4"
    if os.path.exists(source_path):
        if os.path.exists(backup_path):
            os.remove(backup_path)
        os.rename(source_path, backup_path)
        os.rename(dest_path, source_path)
        print(f"[OK] Replaced original file.")

except Exception as e:
    print(f"[ERROR] {e}")
