import sys
import json
import datetime
from docxtpl import DocxTemplate
import subprocess
import os

def generate_pdf_from_data(data_file):
    try:
        # Read form data
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Load template
        template_path = os.path.join(os.path.dirname(__file__), 'template_fixed.docx')
        doc = DocxTemplate(template_path)
        
        # Prepare context with all variables
        context = {
            # Employee Details (Marathi)
            'emp_name_designation_marathi': data.get('emp_name_designation_marathi', ''),
            'emp_designation_marathi': data.get('emp_designation_marathi', ''),
            'office_name_marathi': data.get('office_name_marathi', ''),
            'basic_pay': data.get('basic_pay', ''),
            'work_place_marathi': data.get('work_place_marathi', ''),
            'res_address_marathi': data.get('res_address_marathi', ''),
            
            # Employee Details (English)
            'emp_name_english': data.get('emp_name_english', ''),
            'emp_designation_english': data.get('emp_designation_english', ''),
            'office_name_english': data.get('office_name_english', ''),
            'res_address_english': data.get('res_address_english', ''),
            'work_place_english': data.get('work_place_english', ''),
            
            # Patient Details
            'patient_name': data.get('patient_name', ''),
            'patient_relation': data.get('patient_relation', ''),
            'patient_age': data.get('patient_age', ''),
            'place_of_illness': data.get('place_of_illness', ''),
            'patient_name_english': data.get('patient_name_english', ''),
            
            # Medical Details
            'consult_doctor_hospital': data.get('consult_doctor_hospital', ''),
            'hospital_name_english': data.get('hospital_name_english', ''),
            'treating_doctor_name_english': data.get('treating_doctor_name_english', ''),
            
            # Expenses
            'test_charges': data.get('test_charges', 0),
            'medicine_charges': data.get('medicine_charges', 0),
            'stay_grand_total': data.get('stay_grand_total', 0),
            'total_claim_amount': data.get('grand_total_claim', 0),
            'grand_total_claim': data.get('grand_total_claim', 0),
            
            # Dates
            'appointment_date': data.get('appointment_date', ''),
            'retirement_date': data.get('retirement_date', ''),
            'admit_date_from': data.get('admit_date_from', ''),
            'admit_date_to': data.get('admit_date_to', ''),
            'cert_date': datetime.date.today().strftime("%d/%m/%Y"),
            'cert_place': data.get('work_place_marathi', ''),
            
            # Derived Marathi variables
            'emp_name_marathi': data.get('emp_name_designation_marathi', '').split('(')[0].strip() if '(' in data.get('emp_name_designation_marathi', '') else data.get('emp_name_english', ''),
            'emp_office_name_marathi': data.get('office_name_marathi', ''),
            'hosp_name_marathi': data.get('consult_doctor_hospital', '').split(',')[-1].strip() if ',' in data.get('consult_doctor_hospital', '') else data.get('consult_doctor_hospital', ''),
            'hospital_name_marathi': data.get('consult_doctor_hospital', '').split(',')[-1].strip() if ',' in data.get('consult_doctor_hospital', '') else data.get('consult_doctor_hospital', ''),
            'patient_name_marathi': data.get('patient_name', ''),
            'patient_relation_marathi': data.get('patient_relation', ''),
            'relative_designation_marathi': data.get('relative_designation', ''),
            'relative_emp_name_marathi': data.get('relative_emp_name', ''),
            
            # English mappings
            'res_address': data.get('res_address_english', ''),
            'office_name': data.get('office_name_english', ''),
            'hospital_name': data.get('hospital_name_english', ''),
            'treating_doctor_name': data.get('treating_doctor_name_english', ''),
            'emp_name': data.get('emp_name_english', ''),
            'emp_designation': data.get('emp_designation_english', ''),
            'emp_office_name': data.get('office_name_english', ''),
            'dr_name': data.get('treating_doctor_name_english', ''),
            'hosp_name': data.get('hospital_name_english', ''),
            'work_place': data.get('work_place_english', ''),
            
            # Relative Details
            'relative_emp_name': data.get('relative_emp_name', ''),
            'relative_designation': data.get('relative_designation', ''),
            'relative_office_name': data.get('relative_office_name', ''),
            
            # Family Members
            'mem_name1': data.get('mem_name1', ''),
            'mem_rel1': data.get('mem_rel1', ''),
            'mem_age1': data.get('mem_age1', ''),
            'mem_job1': data.get('mem_job1', ''),
            'mem_name2': data.get('mem_name2', ''),
            'mem_rel2': data.get('mem_rel2', ''),
            'mem_age2': data.get('mem_age2', ''),
            'mem_job2': data.get('mem_job2', ''),
            'mem_name3': data.get('mem_name3', ''),
            'mem_rel3': data.get('mem_rel3', ''),
            'mem_age3': data.get('mem_age3', ''),
            'mem_job3': data.get('mem_job3', ''),
            'mem_name4': data.get('mem_name4', ''),
            'mem_rel4': data.get('mem_rel4', ''),
            'mem_age4': data.get('mem_age4', ''),
            'mem_job4': data.get('mem_job4', ''),
            'mem_name5': data.get('mem_name5', ''),
            'mem_rel5': data.get('mem_rel5', ''),
            'mem_age5': data.get('mem_age5', ''),
            'mem_job5': data.get('mem_job5', ''),
            
            # Fillers
            'test_lab_name_1': '-----',
            'test_lab_name_2': '',
            'test_lab_name_3': '',
            'consult_place': 'Hospital',
            'gw_dates': '', 'gw_total': '',
            'semi_dates': '', 'semi_rate': '', 'semi_total': '',
            'pvt_dates': '', 'pvt_rate': '', 'pvt_total': '',
            'icu_dates': '', 'icu_rate': '', 'icu_total': '',
        }
        
        # Render document
        doc.render(context)
        
        # Save filled DOCX
        temp_docx = os.path.join(os.path.dirname(__file__), 'temp_filled_form.docx')
        doc.save(temp_docx)
        
        # Convert to PDF using LibreOffice
        if sys.platform == "win32":
            libre_office_path = r"C:\Program Files\LibreOffice\program\soffice.exe"
        else:
            libre_office_path = "libreoffice"
        
        output_dir = os.path.dirname(__file__)
        subprocess.run([
            libre_office_path,
            '--headless',
            '--convert-to', 'pdf:writer_pdf_Export',
            '--outdir', output_dir,
            temp_docx
        ], check=True)
        
        print("PDF generated successfully!")
        return True
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_pdf_api.py <data_file>", file=sys.stderr)
        sys.exit(1)
    
    data_file = sys.argv[1]
    success = generate_pdf_from_data(data_file)
    sys.exit(0 if success else 1)
