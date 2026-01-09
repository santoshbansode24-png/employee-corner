import zipfile
import re
import os

def inspect_admit_date():
    input_file = 'template.docx'
    
    try:
        zin = zipfile.ZipFile(input_file, 'r')
        xml_content = zin.read('word/document.xml').decode('utf-8')
        zin.close()
        
        # Find 'admit_date_from'
        idx = xml_content.find('admit_date_from')
        if idx != -1:
            print(f"Found admit_date_from at {idx}")
            # complete context
            snippet = xml_content[max(0, idx-50):idx+100]
            print(f"Snippet: {snippet.encode('ascii', 'replace').decode('ascii')}")
        else:
            print("admit_date_from not found")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_admit_date()
