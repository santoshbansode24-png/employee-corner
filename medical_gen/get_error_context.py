import zipfile
import re

def get_context():
    docx_path = r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed.docx"
    with zipfile.ZipFile(docx_path, 'r') as z:
        xml_content = z.read('word/document.xml').decode('utf-8')

    # The error index we found previously was roughly around 7697 in the simplified search
    # Let's find the specific broken tag again to be sure
    
    # We are looking for "{{hospital" that doesn't have "}}"
    match = re.search(r'\{\{hospital[^}]*(?!3\})', xml_content) # simple heuristic
    # A better search: find {{hospital and see if }} comes before the next {{
    
    # Let's just iterate all {{ matches like before
    starts = [m.start() for m in re.finditer(r'\{\{', xml_content)]
    
    target_index = -1
    for start in starts:
        chunk = xml_content[start:start+300]
        # Clean tags to see if it closes
        clean_chunk = re.sub(r'<[^>]+>', '', chunk)
        if "}}" not in clean_chunk:
            if "hospital" in clean_chunk:
                target_index = start
                break
    
    if target_index != -1:
        # Count page breaks before this index
        # Word uses <w:br w:type="page"/> for hard breaks
        # And <w:lastRenderedPageBreak/> might appear but is not reliable for current flow
        pre_content = xml_content[:target_index]
        page_breaks = pre_content.count('<w:br w:type="page"/>')
        
        # Estimate page (Starts at 1, +1 for each break)
        est_page = page_breaks + 1
        
        # Get context text (clean xml tags)
        # Grab 500 chars before
        raw_pre_context = pre_content[-500:]
        clean_pre_context = re.sub(r'<[^>]+>', '', raw_pre_context)
        # take last 100 chars of that
        preview_text = clean_pre_context.strip()[-100:]
        
        print(f"EST_PAGE: {est_page}")
        print(f"SEARCH_TEXT: {preview_text}")
    else:
        print("Could not re-locate the specific 'hospital' tag error.")

if __name__ == "__main__":
    get_context()
