import sys
import json
import datetime
from docxtpl import DocxTemplate
import subprocess
import os

def format_date(date_str):
    if not date_str:
        return ""
    try:
        # React sends YYYY-MM-DD
        dt = datetime.datetime.strptime(date_str, "%Y-%m-%d")
        return dt.strftime("%d-%m-%Y")
    except Exception:
        return date_str

def generate_pdf_from_data(data_file):
    try:
        # Read form data
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Load template
        script_dir = os.path.dirname(__file__)
        template_path = os.path.join(script_dir, 'template_cloned.docx')
        if not os.path.exists(template_path):
            template_path = os.path.join(script_dir, 'template_fixed.docx')
        if not os.path.exists(template_path):
            template_path = os.path.join(script_dir, 'template.docx')
            
        doc = DocxTemplate(template_path)
        
        # Re-map pathology and medicine receipts to match template keys
        pathology_receipts = []
        for item in data.get('pathology_receipts', []):
            pathology_receipts.append({
                'receipt_no': item.get('receipt_no', ''),
                'date': format_date(item.get('date', '')),
                'amount': item.get('amount', 0)
            })

        medicine_receipts = []
        for item in data.get('medicine_receipts', []):
            medicine_receipts.append({
                'receipt_no': item.get('receipt_no', ''),
                'date': format_date(item.get('date', '')),
                'amount': item.get('amount', 0)
            })

        # Prepare context
        context = {
            # --- EMPLOYEE DETAILS ---
            'emp_name_english': data.get('emp_name_english', ''),
            'emp_designation_english': data.get('emp_designation_english', ''),
            'emp_name_designation_marathi': data.get('emp_name_designation_marathi', ''),
            'emp_name_marathi': data.get('emp_name_designation_marathi', ''),
            'office_name_marathi': data.get('office_name_marathi', ''),
            'emp_office_name_marathi': data.get('office_name_marathi', ''),
            'basic_pay': data.get('basic_pay', ''),
            'appointment_date': format_date(data.get('appointment_date', '')),
            'res_address': data.get('res_address_english', ''),
            'res_address_english': data.get('res_address_english', ''),
            'res_address_marathi': data.get('res_address_english', ''),
            
            # --- PATIENT DETAILS ---
            'patient_name': data.get('patient_name', ''),
            'patient_name_marathi': data.get('patient_name', ''),
            'patient_name_english': data.get('patient_name_english', ''),
            'patient_relation': data.get('patient_relation', ''),
            'relation': data.get('patient_relation', ''),
            'patient_age': data.get('patient_age', ''),
            'place_of_illness': data.get('place_of_illness', ''),
            
            # --- HOSPITAL INFO ---
            'hospital_name_english': data.get('hospital_name_english', ''),
            'hospital_name': data.get('hospital_name_english', ''),
            'treating_doctor_name_english': data.get('treating_doctor_name_english', ''),
            'doctor_name': data.get('treating_doctor_name_english', ''),
            'admit_date_from': format_date(data.get('admit_date_from', '')),
            'admit_date_to': format_date(data.get('admit_date_to', '')),
            'cert_date': datetime.date.today().strftime("%d-%m-%Y"),
            'cert_place': data.get('place_of_illness', ''),
            
            # --- WARD DETAILS ---
            'gw_days': data.get('gw_days', ''), 'gw_rates': data.get('gw_rates', ''), 'gw_total': data.get('gw_total', ''),
            'semi_days': data.get('semi_days', ''), 'semi_rate': data.get('semi_rates', ''), 'semi_total': data.get('semi_total', ''),
            'pvt_days': data.get('pvt_days', ''), 'pvt_rates': data.get('pvt_rates', ''), 'pvt_total': data.get('pvt_total', ''),
            'icu_days': data.get('icu_days', ''), 'icu_rates': data.get('icu_rates', ''), 'icu_total': data.get('icu_total', ''),
            'stay_grand_total': data.get('stay_total', 0),
            
            # --- RECEIPTS ---
            'pathology_receipts': pathology_receipts,
            'medicine_receipts': medicine_receipts,
            'pathology_charges': data.get('path_total', 0),
            'medicine_charges': data.get('med_total', 0),
            'external_lab_charges': data.get('path_total', 0),
            
            # --- FORM D (BILL CHARGES) ---
            'admission_charges': data.get('admission_charges', 0),
            'total_staying_charges': data.get('stay_total', 0),
            'surgeon_charges': data.get('surgeon_charges', 0),
            'asst_surgeon_charges': data.get('asst_surgeon_charges', 0),
            'anesthesia_charges': data.get('anesthesia_charges', 0),
            'ot_charges': data.get('ot_charges', 0),
            'ot_assistant_charges': data.get('ot_assistant_charges', 0),
            'rmo_charges': data.get('rmo_charges', 0),
            'nursing_charges': data.get('nursing_charges', 0),
            'iv_infusion_charges': data.get('iv_infusion_charges', 0),
            'doctor_visit_charges': data.get('doctor_visit_charges', 0),
            'special_visit_charges': data.get('special_visit_charges', 0),
            'monitor_charges': data.get('monitor_charges', 0),
            'oxygen_charges': data.get('oxygen_charges', 0),
            'radiology_charges': data.get('radiology_charges', 0),
            'ecg_charges': data.get('ecg_charges', 0),
            'bsl_charges': data.get('bsl_charges', 0),
            'other_charges': data.get('other_charges', 0),
            'total_hospital_bill_amount': data.get('form_d_total', 0),
            
            # --- TOTALS ---
            'grand_total_claim': data.get('grand_claim', 0),
            'total_claim_amount': data.get('grand_claim', 0),
            'grand_total_admissible_amount': data.get('grand_admissible', 0),
            'total_room_rent_admissible': data.get('admissible_stay', 0),
            'medicine_charges_90_percent': data.get('admissible_meds', 0),
            'external_lab_charges_90_percent': data.get('admissible_path', 0),
            'total_hospital_bill_90_percent': data.get('admissible_procedural', 0),
            
            # --- FAMILY MEMBERS ---
            'mem_name1': data.get('m_name_1', ''), 'mem_rel1': data.get('m_rel_1', ''), 'mem_age1': data.get('m_age_1', ''),
            'mem_name2': data.get('m_name_2', ''), 'mem_rel2': data.get('m_rel_2', ''), 'mem_age2': data.get('m_age_2', ''),
            'mem_name3': data.get('m_name_3', ''), 'mem_rel3': data.get('m_rel_3', ''), 'mem_age3': data.get('m_age_3', ''),
        }
        
        # Render document
        doc.render(context)
        
        # Save filled DOCX
        temp_docx = os.path.join(script_dir, 'temp_filled_form.docx')
        doc.save(temp_docx)
        
        # Convert to PDF using LibreOffice
        if sys.platform == "win32":
            # Attempt to find soffice.exe
            libre_office_paths = [
                r"C:\Program Files\LibreOffice\program\soffice.exe",
                r"C:\Program Files (x86)\LibreOffice\program\soffice.exe"
            ]
            libre_office_path = "soffice"
            for p in libre_office_paths:
                if os.path.exists(p):
                    libre_office_path = p
                    break
        else:
            libre_office_path = "libreoffice"
        
        output_dir = script_dir
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
