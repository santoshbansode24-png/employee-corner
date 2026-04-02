import zipfile
import re
import os
import shutil

def smart_fix():
    input_file = 'template.docx'
    output_file = 'template_fixed.docx'
    
    if not os.path.exists(input_file):
        print(f"❌ {input_file} not found. Cannot proceed.")
        return

    print(f"🔧 Processing {input_file} (Preserving User Layout)...")

    try:
        with zipfile.ZipFile(input_file, 'r') as zin:
            with zipfile.ZipFile(output_file, 'w') as zout:
                for item in zin.infolist():
                    buffer = zin.read(item.filename)
                    
                    if item.filename == 'word/document.xml':
                        xml_content = buffer.decode('utf-8')
                        
                        # 1. REMOVE "Not Necessary" text if requested
                        # User said "it shows it is not necessary". Assuming they mean the "(Govt. Service Verification)" part.
                        # We will replace the specific header string I might have suggested/added earlier.
                        if "Govt. Service Verification" in xml_content:
                            print("🔹 Removing '(Govt. Service Verification)' text...")
                            xml_content = xml_content.replace("(Govt. Service Verification)", "")
                        
                        # Reference: "Relative Details (Govt. Service Verification):" -> "Relative Details:"
                        
                        # 2. Fix Split Variables (Standard Routine)
                        # Remove XML tags inside {{...}}
                        
                        # Regex to find {{ followed by anything until }}
                        # We need to be careful not to break valid XML.
                        # Safe approach: Fix specific known broken variables.
                        
                        vars_to_fix = [
                            'appointment_date', 'admit_date_from', 'admit_date_to',
                            'emp_name_english', 'patient_name_english',
                            'doctor_name_english', 'treating_doctor_name_english',
                            'hosp_name','hospital_name',
                            'relative_emp_name', 'relative_designation', 'relative_office_name',
                            'relative_emp_name_marathi', 'relative_designation_marathi',
                            'mem_name1', 'mem_rel1', 'mem_age1', 'mem_job1',
                            'gw_dates', 'gw_days', 'gw_rates', 'gw_total'
                        ]

                        def clean_variable(var_name, content):
                            # Matches {{...var_name...}} where ... are XML tags
                            chars = list(var_name)
                            # Pattern: {{ (tag)* v (tag)* a (tag)* r ... }}
                            pattern = r'\{\{(?:<[^>]+>)*' 
                            for c in chars:
                                pattern += re.escape(c) + r'(?:<[^>]+>)*'
                            pattern += r'\}\}'
                            
                            return re.sub(pattern, '{{' + var_name + '}}', content)

                        # Apply fixes
                        for var in vars_to_fix:
                            xml_content = clean_variable(var, xml_content)
                            
                        # General cleanup for simple split {{ }}
                        xml_content = re.sub(r'\{\{(?:<[^>]+>)*\}\}', '', xml_content) # Empty tags
                        
                        # Fix specific suffix issue
                        xml_content = xml_content.replace(' _english', '_english')

                        buffer = xml_content.encode('utf-8')

                    zout.writestr(item, buffer)
        
        print(f"✅ Created {output_file}")
        print("   - Preserved Page Layout")
        print("   - Fixed Variable Tags")
        print("   - Updated Text Content")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    smart_fix()
