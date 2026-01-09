# Medical Reimbursement Form - Variable Reference Guide

## How to Edit the Form:
1. Open `template.docx` in Microsoft Word
2. Edit text, formatting, tables, layout as needed
3. Keep variable names in {{ }} exactly as shown below
4. Save and close the file
5. Generate PDF from the app - it will use your updated design

## All Available Variables (63 total):

### Employee Details (Marathi):
- {{emp_name_designation_marathi}} - Full name with designation in Marathi
- {{emp_name_marathi}} - Just the name (extracted automatically)
- {{emp_designation_marathi}} - Just the designation (extracted automatically)
- {{office_name_marathi}} - Office name in Marathi
- {{emp_office_name_marathi}} - Same as office_name_marathi
- {{work_place_marathi}} - Work place in Marathi
- {{res_address_marathi}} - Residential address in Marathi
- {{basic_pay}} - Basic pay amount

### Employee Details (English):
- {{emp_name_english}} - Employee name in English
- {{emp_designation_english}} - Designation in English
- {{office_name_english}} - Office name in English
- {{res_address_english}} - Residential address in English
- {{work_place_english}} - Work place in English

### Patient Details (Marathi):
- {{patient_name}} - Patient name (Marathi)
- {{patient_name_marathi}} - Same as patient_name
- {{patient_relation}} - Relation to employee (Marathi)
- {{patient_relation_marathi}} - Same as patient_relation
- {{patient_age}} - Patient age

### Patient Details (English):
- {{patient_name_english}} - Patient name in English

### Treatment Details (Marathi):
- {{consult_doctor_hospital}} - Doctor & Hospital (Marathi)
- {{hosp_name_marathi}} - Hospital name (extracted from above)
- {{hospital_name_marathi}} - Same as hosp_name_marathi
- {{place_of_illness}} - Place where illness occurred

### Treatment Details (English):
- {{hospital_name_english}} - Hospital name in English
- {{treating_doctor_name_english}} - Doctor name in English

### Dates:
- {{appointment_date}} - Date of appointment
- {{retirement_date}} - Retirement date (optional)
- {{admit_date_from}} - Admission start date
- {{admit_date_to}} - Discharge date
- {{cert_date}} - Certificate date (auto: today's date)
- {{cert_place}} - Certificate place

### Financial Details:
- {{test_charges}} - Test charges amount
- {{medicine_charges}} - Medicine charges amount
- {{stay_grand_total}} - Hospital stay charges
- {{total_claim_amount}} - Total claim (auto-calculated)
- {{grand_total_claim}} - Same as total_claim_amount

### Family Members (5 members max):
- {{mem_name1}} to {{mem_name5}} - Family member names
- {{mem_rel1}} to {{mem_rel5}} - Relations
- {{mem_age1}} to {{mem_age5}} - Ages
- {{mem_job1}} to {{mem_job5}} - Job/Status

### Relative Details (for certificates):
- {{relative_emp_name}} - Relative's name
- {{relative_emp_name_marathi}} - Same in Marathi
- {{relative_designation}} - Relative's designation
- {{relative_designation_marathi}} - Same in Marathi
- {{relative_office_name}} - Relative's office

### Hospital Stay Details (optional):
- {{gw_dates}}, {{gw_total}} - General ward
- {{semi_dates}}, {{semi_rate}}, {{semi_total}} - Semi-private
- {{pvt_dates}}, {{pvt_rate}}, {{pvt_total}} - Private room
- {{icu_dates}}, {{icu_rate}}, {{icu_total}} - ICU

### Other Fields:
- {{test_lab_name_1}}, {{test_lab_name_2}}, {{test_lab_name_3}} - Lab names
- {{consult_place}} - Consultation place

### Non-suffixed Variables (use English values):
- {{emp_name}} - Employee name (English)
- {{emp_designation}} - Designation (English)
- {{office_name}} - Office (English)
- {{emp_office_name}} - Office (English)
- {{res_address}} - Address (English)
- {{work_place}} - Work place (English)
- {{hospital_name}} - Hospital (English)
- {{hosp_name}} - Hospital (English)
- {{treating_doctor_name}} - Doctor (English)
- {{dr_name}} - Doctor (English)

## Tips:
- Variables with "_marathi" suffix use Marathi inputs
- Variables with "_english" suffix use English inputs
- Variables without suffix use English inputs
- Don't change variable names - the code looks for exact matches
- You can move variables anywhere in the document
- You can change fonts, colors, table layouts freely
