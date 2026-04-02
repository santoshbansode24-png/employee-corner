
import zipfile
import re
import os
import shutil
import time

def fix_docx():
    input_file = 'template.docx'
    output_temp = 'template_temp.docx'
    final_output = 'template_fixed.docx'
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        return

    print(f"Attempting advanced fix on {input_file}...")

    try:
        with zipfile.ZipFile(input_file, 'r') as zin:
            with zipfile.ZipFile(output_temp, 'w') as zout:
                for item in zin.infolist():
                    buffer = zin.read(item.filename)
                    if item.filename == 'word/document.xml':
                        xml_content = buffer.decode('utf-8')
                        
                        pattern_open = r'(\{)(<[^\}]*w:(?:proofErr|rsid|lang|gramma|lastRenderedPageBreak)[^>]*>+)(\{)'
                        xml_content = re.sub(pattern_open, r'{{', xml_content)
                        xml_content = re.sub(pattern_open, r'{{', xml_content)
                        pattern_close = r'(\})(<[^\}]*w:(?:proofErr|rsid|lang|gramma|lastRenderedPageBreak)[^>]*>+)(\})'
                        xml_content = re.sub(pattern_close, r'}}', xml_content)
                        xml_content = re.sub(pattern_close, r'}}', xml_content)

                        def clean_variable(var_name, content):
                            chars = list(var_name)
                            esc_chars = [re.escape(c) for c in chars]
                            full_pattern = r'\{\{(?:<[^>]+>)*' 
                            for i, c in enumerate(esc_chars):
                                full_pattern += c
                                if i < len(esc_chars) - 1:
                                    full_pattern += r'(?:<[^>]+>)*'
                            full_pattern += r'(?:<[^>]+>)*\}\}'
                            def replacer(match):
                                return '{{' + var_name + '}}'
                            return re.sub(full_pattern, replacer, content)

                        vars_to_fix = [
                            'appointment_date', 'admit_date_from', 'admit_date_to',
                            'emp_name_english', 'patient_name_english',
                            'doctor_name_english', 'treating_doctor_name_english',
                            'hosp_name','hospital_name',
                            'relative_emp_name', 'relative_designation', 'relative_office_name',
                            'relative_emp_name_marathi', 'relative_designation_marathi'
                        ]

                        original_len = len(xml_content)
                        for var in vars_to_fix:
                            xml_content = clean_variable(var, xml_content)
                        
                        if len(xml_content) != original_len:
                            print(f"Fixed split variables. {original_len - len(xml_content)} bytes removed.")

                        xml_content = xml_content.replace(' _english', '_english')
                        buffer = xml_content.encode('utf-8')
                        print("✅ Applied fixes to document.xml")

                    zout.writestr(item, buffer)

        # Try to replace original, if fail save as fixed
        try:
            if os.path.exists(input_file):
                os.remove(input_file)
            shutil.move(output_temp, input_file)
            print(f"Template updated successfully: {input_file}")
        except Exception as e:
            print(f"Count not overwrite {input_file} (Locked?). Saving as {final_output}")
            if os.path.exists(final_output):
                os.remove(final_output)
            shutil.move(output_temp, final_output)
            print(f"New template saved: {final_output}")

    except Exception as e:
        print(f"Error during processing: {e}")

if __name__ == "__main__":
    fix_docx()
