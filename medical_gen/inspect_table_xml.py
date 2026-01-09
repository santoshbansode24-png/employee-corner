
import zipfile
import re

def inspect_xml():
    docx_path = "template_fixed.docx"
    with zipfile.ZipFile(docx_path, 'r') as z:
        xml_content = z.read('word/document.xml').decode('utf-8')

    # Look for the medicine receipt section
    # Use a window of characters around "receipt.receipt_no"
    
    match = re.search(r'receipt\.receipt_no', xml_content)
    if match:
        start = max(0, match.start() - 1000)
        end = min(len(xml_content), match.end() + 1000)
        snippet = xml_content[start:end]
        print(f"--- Snippet around receipt.receipt_no ---\n{snippet}\n-----------------------------------------")
        
        # Check for loop tags
        loops = re.findall(r'{%.*?%}', snippet)
        print("\nFound Loop Tags in snippet:", loops)
        
        # Check tr structure
        # simplistic check for w:tr
        if "<w:tr" in snippet:
             print("\nFound <w:tr> tags in snippet.")
             
        # Check for row iteration tag specifically
        if "tr for" in str(loops) or "tr  for" in str(loops):
             print("\n✅ Found 'tr for' loop tag.")
        else:
             print("\n❌ 'tr for' loop tag NOT found/recognized or snippet too small.")

    else:
        print("Could not find receipt.receipt_no in xml")

if __name__ == "__main__":
    inspect_xml()
