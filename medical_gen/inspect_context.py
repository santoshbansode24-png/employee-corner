
import zipfile

def inspect_context():
    source = "template_fixed.docx"
    with zipfile.ZipFile(source, 'r') as z:
        xml = z.read('word/document.xml').decode('utf-8')
        
    keyword = "receipt.amount"
    if keyword in xml:
        idx = xml.find(keyword)
        start = max(0, idx - 100)
        end = min(len(xml), idx + 100)
        print(f"CONFIRMED CONTEXT for {keyword}:")
        print(xml[start:end])
    else:
        print(f"{keyword} NOT FOUND in XML.")

if __name__ == "__main__":
    inspect_context()
