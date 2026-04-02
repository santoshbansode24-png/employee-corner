import zipfile
import os
import re

source_path = r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed.docx"
dest_path = r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed_repaired_v2.docx"
target_xml = 'word/document.xml'

print(f"Attempting advanced repair {source_path}...")

try:
    with zipfile.ZipFile(source_path, 'r') as zin:
        with zipfile.ZipFile(dest_path, 'w') as zout:
            for item in zin.infolist():
                buffer = zin.read(item.filename)
                
                if item.filename == target_xml:
                    xml_content = buffer.decode('utf-8')
                    
                    # Regex explanation:
                    # Look for {{ followed by anything until it finds ))
                    # This is risky if there are nested tags, but docxtpl tags usually don't nest.
                    # We want to replace )) with }}
                    # Pattern: match {{ (anything greedy or non greedy) ))
                    
                    # Let's try to match specifically total_staying_charges with potential tags in between
                    # total_staying_charges
                    # t...o...t...a...l...
                    
                    # Safer approach:
                    # Just find the raw text "total_staying_charges))" ignoring tags? No.
                    
                    # Simple Regex replacement for the specific ending
                    # We know the diagnose script found: {{total_staying_charges))
                    # That script regex was: re.findall(r'\{\{[^}]*?\)\)', xml_content)
                    # So it IS there, but maybe I missed it?
                    
                    # Wait, diagnose script found it using:
                    # re.findall(r'\{\{[^}]*?\)\)', xml_content)
                    
                    # Let's use THAT to substitute.
                    
                    def replacer(match):
                        val = match.group(0)
                        print(f"[FIX] Found bad tag: {val}")
                        return val.replace('))', '}}')
                    
                    new_xml, count = re.subn(r'\{\{[^}]*?total_staying_charges[^}]*?\)\)', replacer, xml_content)
                    
                    if count > 0:
                        print(f"[OK] Replaced {count} occurrences.")
                        zout.writestr(item, new_xml.encode('utf-8'))
                    else:
                        print("[WARN] Still didn't find specific bad tag with regex. Trying broader regex...")
                        # Broader: ANY tag ending in ))
                        new_xml, count = re.subn(r'(\{\{[^}]*?)\)\)', r'\1}}', xml_content)
                        if count > 0:
                             print(f"[OK] Broad fix replaced {count} occurrences.")
                             zout.writestr(item, new_xml.encode('utf-8'))
                        else:
                             print("[FAIL] Could not find any tag ending in )).")
                             zout.writestr(item, buffer)

                else:
                    zout.writestr(item, buffer)

    # Replace original
    backup_path = source_path + ".bak_syntax_v2"
    if os.path.exists(source_path):
        if os.path.exists(backup_path):
            os.remove(backup_path)
        os.rename(source_path, backup_path)
        os.rename(dest_path, source_path)
        print(f"[OK] Replaced original file. Backup saved at {backup_path}")

except Exception as e:
    print(f"[ERROR] Error during repair: {e}")
