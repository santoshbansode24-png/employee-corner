
import zipfile
import re
import os

def check_vars():
    docx_path = 'template.docx'
    if not os.path.exists(docx_path):
        print("template.docx not found")
        return

    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read('word/document.xml').decode('utf-8')
    
    # Simple regex to find clear tags
    # This ignores split tags for now but gives a quick idea
    tags = re.findall(r'\{\{([^}]+)\}\}', xml_content)
    
    print(f"Found {len(tags)} tags.")
    if 'appointment_date' in tags:
        print("appointment_date found.")
    else:
        print("appointment_date NOT found (might be split).")
        
    if 'admit_date_from' in tags:
        print("admit_date_from found.")
    else:
        print("admit_date_from NOT found.")

    if 'admit_date_to' in tags:
        print("admit_date_to found.")
    else:
        print("admit_date_to NOT found.")
        
    # Check context around them roughly
    # We find the index and print 50 chars around
    for t in ['appointment_date', 'admit_date_from']:
        idx = xml_content.find(t)
        if idx != -1:
            start = max(0, idx - 50)
            end = min(len(xml_content), idx + 50)
            print(f"\nContext for {t}:")
            print(xml_content[start:end])

if __name__ == "__main__":
    check_vars()
