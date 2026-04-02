import os
import zipfile
import re
import shutil
from docx import Document
from docx.shared import Inches

def optimize():
    input_file = 'template.docx'
    layout_file = 'template_layout.docx'
    final_file = 'template_fixed.docx'

    # Step 1: Layout Adjustment (Margins to Narrow)
    print(f"🔧 Step 1: Adjusting Layout on {input_file}...")
    try:
        doc = Document(input_file)
        for section in doc.sections:
            section.top_margin = Inches(0.5)
            section.bottom_margin = Inches(0.5)
            section.left_margin = Inches(0.5)
            section.right_margin = Inches(0.5)
            section.page_width = Inches(8.27)
            section.page_height = Inches(11.69)
        
        doc.save(layout_file)
        print(f"✅ Layout adjusted. Saved to {layout_file}")
    except Exception as e:
        print(f"❌ Layout Error: {e}")
        return

    # Step 2: Corrupt/Split Variable Fix (XML Manipulation)
    print(f"🔧 Step 2: Fixing XML variables in {layout_file}...")
    
    try:
        with zipfile.ZipFile(layout_file, 'r') as zin:
            with zipfile.ZipFile(final_file, 'w') as zout:
                for item in zin.infolist():
                    buffer = zin.read(item.filename)
                    if item.filename == 'word/document.xml':
                        xml_content = buffer.decode('utf-8')
                        
                        # 1. Join split tags {{...}}
                        # Remove styling tags inside variable brackets
                        # This is a simplified regex approach based on the previous fix_template.py
                        
                        # Pattern to catch {{<stuff>variable<stuff>}}
                        # We use the previous robust logic
                        
                        # Cleanup specific known variables if they are split
                        vars_to_fix = [
                            'appointment_date', 'admit_date_from', 'admit_date_to',
                            'emp_name_english', 'patient_name_english',
                            'doctor_name_english', 'treating_doctor_name_english',
                            'hosp_name','hospital_name',
                            'relative_emp_name', 'relative_designation', 'relative_office_name',
                            'relative_emp_name_marathi', 'relative_designation_marathi',
                            'mem_name1', 'mem_rel1', 'mem_age1', 'mem_job1'
                        ]

                        def clean_variable(var_name, content):
                            # Construct a regex that matches the variable characters interspersed with XML tags
                            chars = list(var_name)
                            # Start with {{
                            # interspersed with (?:<[^>]+>)*
                            pattern = r'\{\{(?:<[^>]+>)*' 
                            for c in chars:
                                pattern += re.escape(c) + r'(?:<[^>]+>)*'
                            pattern += r'\}\}'
                            
                            return re.sub(pattern, '{{' + var_name + '}}', content)

                        # Apply cleanup
                        for var in vars_to_fix:
                            xml_content = clean_variable(var, xml_content)

                        if 'English' in xml_content:
                             xml_content = xml_content.replace(' _english', '_english')

                        buffer = xml_content.encode('utf-8')
                        print("✅ Applied XML variable fixes.")

                    zout.writestr(item, buffer)
        
        print(f"🎉 Success! Final optimized template saved to: {final_file}")
        
    except Exception as e:
        print(f"❌ XML Fix Error: {e}")

if __name__ == "__main__":
    optimize()
