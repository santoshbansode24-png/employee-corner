import zipfile
import os

source_path = r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed.docx"
dest_path = r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed_repaired.docx"
target_xml = 'word/document.xml'

print(f"Attempting to repair {source_path}...")

if not os.path.exists(source_path):
    print("[ERROR] Source file not found!")
    exit(1)

try:
    with zipfile.ZipFile(source_path, 'r') as zin:
        with zipfile.ZipFile(dest_path, 'w') as zout:
            for item in zin.infolist():
                buffer = zin.read(item.filename)
                
                if item.filename == target_xml:
                    xml_content = buffer.decode('utf-8')
                    # Fix the specific typo
                    if '{{total_staying_charges))' in xml_content:
                        print("[FIX] Found typo '{{total_staying_charges))'. Fixing...")
                        new_xml = xml_content.replace('{{total_staying_charges))', '{{total_staying_charges}}')
                        zout.writestr(item, new_xml.encode('utf-8'))
                    else:
                        print("[WARN] Typo not found in exact string matching. It might be split across XML tags.")
                        zout.writestr(item, buffer)
                else:
                    zout.writestr(item, buffer)

    # Replace original
    print(f"[OK] Repair complete. Created {dest_path}")
    
    # Backup and Replace
    backup_path = source_path + ".bak_syntax"
    if os.path.exists(source_path):
        if os.path.exists(backup_path):
            os.remove(backup_path)
        os.rename(source_path, backup_path)
        os.rename(dest_path, source_path)
        print(f"[OK] Replaced original file. Backup saved at {backup_path}")

except Exception as e:
    print(f"[ERROR] Error during repair: {e}")
