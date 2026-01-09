import zipfile
import os

source_path = r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed.docx"
dest_path = r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed_repaired_final.docx"
target_xml = 'word/document.xml'

print(f"Debug & Fix {source_path}...")

try:
    with zipfile.ZipFile(source_path, 'r') as zin:
        with zipfile.ZipFile(dest_path, 'w') as zout:
            for item in zin.infolist():
                buffer = zin.read(item.filename)
                
                if item.filename == target_xml:
                    xml_content = buffer.decode('utf-8')
                    
                    # Search specifically for the variable name
                    idx = xml_content.find("total_staying_charges")
                    if idx != -1:
                        print(f"[FOUND] 'total_staying_charges' found at index {idx}")
                        # Print context
                        start = max(0, idx - 20)
                        end = min(len(xml_content), idx + 40)
                        context = xml_content[start:end]
                        print(f"[CONTEXT] ...{context}...")
                        
                        # Try simple replacement of the whole known bad string
                        if "{{total_staying_charges))" in xml_content:
                            print("[FIX] Exact string match found. Replacing...")
                            new_xml = xml_content.replace("{{total_staying_charges))", "{{total_staying_charges}}")
                            zout.writestr(item, new_xml.encode('utf-8'))
                        elif "total_staying_charges))" in xml_content:
                             print("[FIX] Partial match found (missing opening braces in same chunk?). Replacing ending...")
                             new_xml = xml_content.replace("total_staying_charges))", "total_staying_charges}}")
                             zout.writestr(item, new_xml.encode('utf-8'))
                        else:
                            print("[WARN] Found variable but not the exact expected typo string in this chunk.")
                            # Force fix? 
                            # If we see total_staying_charges, and it's NOT followed by }}, we might be in trouble.
                            # But let's rely on the user report: "unexpected ')'"
                            zout.writestr(item, buffer)
                    else:
                        print("[FAIL] 'total_staying_charges' NOT FOUND in document.xml")
                        zout.writestr(item, buffer)

                else:
                    zout.writestr(item, buffer)

    # Replace original
    backup_path = source_path + ".bak_final"
    if os.path.exists(source_path):
        if os.path.exists(backup_path):
            os.remove(backup_path)
        os.rename(source_path, backup_path)
        os.rename(dest_path, source_path)
        print(f"[OK] Replaced original file.")

except Exception as e:
    print(f"[ERROR] {e}")
