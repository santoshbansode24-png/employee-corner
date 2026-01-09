import zipfile
import re

def locate():
    docx_path = r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed.docx"
    with zipfile.ZipFile(docx_path, 'r') as z:
        xml_content = z.read('word/document.xml').decode('utf-8')
        
    # Clean XML slightly to make it easier, but keep positions roughly
    # Actually, let's just find all start indices of {{
    
    starts = [m.start() for m in re.finditer(r'\{\{', xml_content)]
    
    print(f"Found {len(starts)} '{{{{' tags.")
    
    for i, start in enumerate(starts):
        # Look ahead for }}
        chunk = xml_content[start:start+200] # look at next 200 chars
        
        if "}}" not in chunk:
            print(f"\n❌ POTENTIAL ERROR at index {start}:")
            print(f"Context: {chunk}...")
            # Try to see if it's just split by xml
            # If we remove XML tags, does it close?
            clean_chunk = re.sub(r'<[^>]+>', '', chunk)
            if "}}" not in clean_chunk:
                print(f"CONFIRMED: '}}}}' missing in cleaned text: '{clean_chunk}'")
        else:
            # Check if there is a weird char or space
            pass

if __name__ == "__main__":
    locate()
