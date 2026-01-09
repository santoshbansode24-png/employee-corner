
from docxtpl import DocxTemplate
import re

def list_tags():
    try:
        doc = DocxTemplate("template_fixed.docx")
        # specific to docxtpl, undeclared_variables only works if we try to render or use jinja env inspection
        # But a simpler way is to just grep the xml for {{...}}
        
        xml_content = doc.get_docx()
        # This returns the zip file object, we need to read word/document.xml
        
        import zipfile
        with zipfile.ZipFile("template_fixed.docx", 'r') as z:
            content = z.read('word/document.xml').decode('utf-8')
            
        # Regex to find {{ ... }}
        # Note: In word XML, tags can be split like {{<w:t>var</w:t>}} so simple regex fails often.
        # But let's see what we can find.
        
        print("--- Raw Content Search ---")
        if "total_hospital_bill_inc_lab" in content:
             print("✅ FOUND 'total_hospital_bill_inc_lab' in XML content!")
        else:
             print("❌ 'total_hospital_bill_inc_lab' NOT FOUND in XML content.")
             
        if "total_hospital_bill_amount" in content:
             print("✅ FOUND 'total_hospital_bill_amount' in XML content!")
             
        # Clean xml tags to see "plain text"
        clean_text = re.sub(r'<[^>]+>', '', content)
        
        # Find all tags
        tags = re.findall(r'\{\{.*?\}\}', clean_text)
        print("\n--- Found Tags ---")
        unique_tags = sorted(list(set(tags)))
        for tag in unique_tags:
            print(tag)
             
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_tags()
