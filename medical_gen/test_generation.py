from docxtpl import DocxTemplate
import datetime
import os
import subprocess
import sys

def test_gen():
    try:
        print("Loading template...")
        doc = DocxTemplate("template.docx")
        
        # Mock data similar to main.py
        context = {
            'emp_name_designation_marathi': "Test User (Desig)",
            'office_name_marathi': "Test Office",
            'basic_pay': "50000",
            'work_place_marathi': "Test Place",
            'res_address_marathi': "Test Address",
            'patient_name': "Test Patient",
            'patient_relation': "Self",
            'patient_age': "30",
            'place_of_illness': "Test Illness Place",
            'consult_doctor_hospital': "Dr. Test, Test Hospital",
            'test_charges': 100,
            'medicine_charges': 200,
            'stay_grand_total': 500,
            'total_claim_amount': 800,
            'grand_total_claim': 800,
            
            # Dates
            'appointment_date': "01/01/2020",
            'retirement_date': "",
            'admit_date_from': "01/12/2025",
            'admit_date_to': "05/12/2025",
            'cert_date': "12/12/2025",
            'cert_place': "Test Place",

            # English Fields
            'emp_name_english': "Test User Eng",
            'emp_designation_english': "Test Desig Eng",
            'patient_name_english': "Test Patient Eng",
            'hospital_name_english': "Test Hospital Eng",
            'treating_doctor_name_english': "Dr. Test Eng",

            # Mappings for Missing Template Variables detected:
            'res_address': "Test Address",
            'office_name': "Test Office",
            'hospital_name': "Test Hospital Eng",
            'treating_doctor_name': "Dr. Test Eng",
            'emp_name': "Test User Eng",
            'emp_designation': "Test Desig Eng",
            'emp_office_name': "Test Office",
            'dr_name': "Dr. Test Eng",
            'hosp_name': "Test Hospital Eng",
            'work_place': "Test Place",

            # Relative Details
            'relative_emp_name': "Relative Name",
            'relative_designation': "Relative Desig",
            'relative_office_name': "Relative Office",
            
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

        print("Rendering...")
        doc.render(context)
        temp_docx = "test_output.docx"
        doc.save(temp_docx)
        print(f"Saved {temp_docx}")

        print("Converting to PDF...")
        if sys.platform == "win32":
            libre_office_path = r"C:\Program Files\LibreOffice\program\soffice.exe"
        else:
            libre_office_path = "libreoffice"
            
        subprocess.run([
            libre_office_path, '--headless', '--convert-to', 'pdf', temp_docx, 
            '--outdir', '.'
        ], check=True)
        
        print("Success! PDF generated.")

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_gen()
