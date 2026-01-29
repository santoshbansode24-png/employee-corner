import re
from docx import Document
import sys

def get_docx_tags(docx_path):
    try:
        doc = Document(docx_path)
        text = ""
        for p in doc.paragraphs:
            text += p.text + "\n"
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    text += cell.text + "\n"
        
        # Regex to find {{ ... }}
        tags = re.findall(r"\{\{.*?\}\}", text)
        print(f"Tags in {docx_path}:")
        for t in set(tags):
            print(t)
            
    except Exception as e:
        print(f"Error reading {docx_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        get_docx_tags(sys.argv[1])
    else:
        print("Usage: python inspect_docx.py <path_to_docx>")
