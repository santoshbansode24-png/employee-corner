import zipfile
import os
import re

source_path = r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed.docx"
dest_path = r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed_repaired_v3.docx"
target_xml = 'word/document.xml'

print(f"Attempting V3 repair {source_path}...")

try:
    with zipfile.ZipFile(source_path, 'r') as zin:
        with zipfile.ZipFile(dest_path, 'w') as zout:
            for item in zin.infolist():
                buffer = zin.read(item.filename)
                
                if item.filename == target_xml:
                    xml_content = buffer.decode('utf-8')
                    
                    # Pattern similar to what diagnosed it: {{ ... ))
                    # Capturing the content inside
                    pattern = r'(\{\{[^}]*?)(\)\))'
                    
                    def replacement(m):
                        print(f"[FIX] Match found: '{m.group(0)}'")
                        return m.group(1) + "}}"
                    
                    new_xml, count = re.subn(pattern, replacement, xml_content)
                    
                    if count > 0:
                        print(f"[OK] Fixed {count} occurrences.")
                        zout.writestr(item, new_xml.encode('utf-8'))
                    else:
                        print("[FAIL] Regex found no matches.")
                        zout.writestr(item, buffer)

                else:
                    zout.writestr(item, buffer)

    # Replace original
    backup_path = source_path + ".bak_syntax_v3"
    if os.path.exists(source_path):
        if os.path.exists(backup_path):
            os.remove(backup_path)
        os.rename(source_path, backup_path)
        os.rename(dest_path, source_path)
        print(f"[OK] Replaced original file. Backup saved at {backup_path}")

except Exception as e:
    print(f"[ERROR] Error during repair: {e}")
