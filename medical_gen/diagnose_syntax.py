import zipfile
import re
import os

docx_path = r"c:/xampp/htdocs/EMPLOYEE CORNER 1.0/medical_gen/template_fixed.docx"

if not os.path.exists(docx_path):
    print(f"File not found: {docx_path}")
else:
    try:
        with zipfile.ZipFile(docx_path, 'r') as z:
            xml_content = z.read('word/document.xml').decode('utf-8')
            
            # Look for double parenthesis which is the likely culprit for "unexpected ')'"
            # referencing the previous user input {{variable))
            # Look for triple closing braces which causes "unexpected '}'"
            if "}}}" in xml_content:
                print("⚠️ FOUND TRIPLE BRACES '}}}':")
                # find context
                contexts = re.findall(r'.{0,20}\}\}\}.{0,20}', xml_content)
                for ctx in contexts:
                     print(f" -> Context: ...{ctx}...")

            # Clean text for easier regex
            text_only = re.sub(r'<[^>]+>', '', xml_content)
            
            # Find tags that might have extra braces
            odd_tags = re.findall(r'\{\{[^}]*?\}\}\}', text_only)
            if odd_tags:
                print("\n⚠️ FOUND TAGS WITH EXTRA BRACE:")
                for t in odd_tags:
                    print(f" -> {t}")

            # Check for general unbalanced braces (heuristic)
            opens = text_only.count('{{')
            closes = text_only.count('}}')
            print(f"\nStats: '{{{{' count: {opens}, '}}}}' count: {closes}")
            
            if opens != closes:
                 print("⚠️ MISMATCH: Opening and closing tag counts do not match!")

    except Exception as e:
        print(f"Error reading docx: {e}")
