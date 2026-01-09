import streamlit as st
from docxtpl import DocxTemplate
import datetime
import os
import subprocess
import sys
import shutil
import pandas as pd
try:
    import config
except ImportError:
    # Fallback if running from root without package context or path issues
    import sys
    sys.path.append(os.path.dirname(__file__))
    import config

# 1. Page Setup
st.set_page_config(page_title="Medical Reimbursement PDF Generator", layout="wide")
st.title("🏥 Medical Reimbursement PDF Generator")

# Custom CSS to increase font size
st.markdown("""
    <style>
        /* Import a professional font */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        html, body, [class*="css"] {
            font-family: 'Inter', sans-serif;
        }

        /* Main App Background */
        .stApp {
            background-color: #f8f9fa;
        }

        /* Header Styling */
        h1 {
            color: #1e3a8a;
            font-weight: 800 !important;
            font-size: 3rem !important;
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
            margin-bottom: 30px;
        }

        h2 {
            color: #1f2937;
            font-weight: 700 !important;
            font-size: 2.2rem !important;
            margin-top: 40px !important;
            margin-bottom: 20px !important;
            border-left: 6px solid #3b82f6;
            padding-left: 15px;
            background-color: #fff;
            padding: 10px 15px;
            border-radius: 0 8px 8px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        h3 {
            color: #374151;
            font-size: 1.6rem !important;
            font-weight: 600 !important;
            margin-top: 20px !important;
        }

        /* Label Styling - Increased Size & Weight */
        .stTextInput label, .stDateInput label, .stNumberInput label, .stSelectbox label {
            font-size: 1.5rem !important;
            font-weight: 800 !important;
            color: #000000 !important; /* Pure black for maximum contrast */
            margin-bottom: 10px !important;
        }

        /* Input Field Styling */
        div[data-baseweb="input"] {
            border-radius: 8px !important;
            background-color: #ffffff !important;
            border: 1px solid #d1d5db !important;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            transition: all 0.2s;
        }
        
        div[data-baseweb="input"]:focus-within {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
        }

        div[data-baseweb="input"] input {
            font-size: 1.2rem !important;
            padding: 12px 10px !important;
            font-weight: 500 !important;
            color: #111827 !important;
        }

        /* Section Containers */
        [data-testid="stVerticalBlock"] > [style*="flex-direction: column;"] > [data-testid="stVerticalBlock"] {
            background-color: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            margin-bottom: 2rem;
        }

        /* Button Styling */
        div.stButton > button {
            background: linear-gradient(to right, #2563eb, #1d4ed8);
            color: white !important;
            font-size: 1.3rem !important;
            font-weight: 600 !important;
            padding: 0.75rem 2rem !important;
            border-radius: 10px !important;
            border: none !important;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
            transition: all 0.3s ease;
            width: 100%;
        }

        div.stButton > button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
        }
        
        div.stButton > button:active {
            transform: translateY(0);
        }

        /* Alert/Info Box Styling */
        .stAlert {
            border-radius: 10px !important;
            font-size: 1.1rem !important;
        }
        
        /* Metric Styling */
        [data-testid="stMetricLabel"] {
            font-size: 1.1rem !important;
            color: #6b7280;
        }
        [data-testid="stMetricValue"] {
            font-size: 2rem !important;
            color: #059669;
            font-weight: 700;
        }

        /* Divider */
        hr {
            margin: 30px 0 !important;
            border-color: #e5e7eb !important;
        }
    </style>
""", unsafe_allow_html=True)

# Tab logic removed
# Container to maintain indentation
with st.container():
    # 2. Input Form
    st.header("1. Employee Details (कर्मचारी तपशील)")
    col1, col2 = st.columns(2)
    with col1:
        # Marathi Details
        emp_name_designation_marathi = st.text_input("Name & Designation (Marathi): नाव व पदनाम (मराठी) [टीप: कृपया पदनाम ( ) कंसामध्ये लिहावे]", "")
        emp_designation_marathi = st.text_input("Designation (Marathi): पदनाम (मराठी)", "")
        office_name_marathi = st.text_input("Office Name (Marathi): कार्यालयाचे नाव (मराठी)", "")
        res_address_marathi = st.text_input("Residential Address (Marathi): राहण्याचा पत्ता (मराठी)", "")
        work_place_marathi = st.text_input("Work Place (Marathi): कामाचे ठिकाण (मराठी)", "")
        basic_pay = st.text_input("Basic Pay: मूळ वेतन", "")

    with col2:
        # English Details (Added for Form C/D)
        emp_name_english = st.text_input("Employee Name (English): कर्मचाऱ्याचे नाव (इंग्रजी)", "")
        emp_designation_english = st.text_input("Designation (English): पदनाम (इंग्रजी)", "")
        office_name_english = st.text_input("Office Name (English): कार्यालयाचे नाव (इंग्रजी)", "")
        res_address_english = st.text_input("Residential Address (English): राहण्याचा पत्ता (इंग्रजी)", "")
        work_place_english = st.text_input("Work Place (English): कामाचे ठिकाण (इंग्रजी)", "")
        
        appointment_date = st.date_input("Appointment Date: नियुक्ती दिनांक", value=None, min_value=datetime.date(1900, 1, 1), max_value=datetime.date(2100, 12, 31))
        # retirement_date removed as per request

    st.header("2. Patient & Treatment Details (रुग्ण व उपचाराचा तपशील)")
    col3, col4 = st.columns(2)
    with col3:
        # Variables: patient_name, patient_relation, patient_age
        patient_name = st.text_input("Patient Name (Marathi): रुग्णाचे नाव (मराठी)", "")
        patient_relation = st.text_input("Relation: नाते", "")
        patient_age = st.text_input("Age: वय", "")
        place_of_illness = st.text_input("Place of Illness: आजाराचे ठिकाण", "")
        patient_name_english = st.text_input("Patient Name (English): रुग्णाचे नाव (इंग्रजी)", "")


    with col4:
        # Variables: consult_doctor_hospital, admit_date_from, admit_date_to
        # Split into separate fields for accuracy
        hospital_name_marathi_input = st.text_input("Hospital Name (Marathi): रुग्णालयाचे नाव (मराठी)", "")
        doctor_name_marathi_input = st.text_input("Doctor Name (Marathi): डॉक्टरचे नाव (मराठी)", "")
        
        # Construct the legacy combined variable for template compatibility if needed
        consult_doctor_hospital = f"{doctor_name_marathi_input}, {hospital_name_marathi_input}" if doctor_name_marathi_input and hospital_name_marathi_input else (hospital_name_marathi_input or doctor_name_marathi_input)

        hospital_name_english = st.text_input("Hospital Name (English): रुग्णालयाचे नाव (इंग्रजी)", "")
        treating_doctor_name_english = st.text_input("Doctor Name (English): डॉक्टरचे नाव (इंग्रजी)", "")
        admit_date_from = st.date_input("Admitted From: रुग्णालयात दाखल दिनांक", value=None, min_value=datetime.date(1900, 1, 1), max_value=datetime.date(2100, 12, 31))
        admit_date_to = st.date_input("Discharged On: रुग्णालयातून सुट्टी दिनांक", value=None, min_value=datetime.date(1900, 1, 1), max_value=datetime.date(2100, 12, 31))

    # Helper to calculate grand total of hospital stay
    def calculate_grand_total():
        try:
            gw = int(st.session_state.get('gw_total', 0) or 0)
            semi = int(st.session_state.get('semi_total', 0) or 0)
            pvt = int(st.session_state.get('pvt_total', 0) or 0)
            icu = int(st.session_state.get('icu_total', 0) or 0)
            total = gw + semi + pvt + icu
            st.session_state['stay_grand_total'] = total
            # Force update the widget key directly if it exists
            if 'stay_grand_total_input' in st.session_state:
                st.session_state['stay_grand_total_input'] = total
        except (ValueError, TypeError):
            pass

    # Helper to calculate total from days and rate
    def update_total(days_key, rate_key, total_key):
        try:
            days = int(st.session_state.get(days_key, 0))
            rate = int(st.session_state.get(rate_key, 0))
            st.session_state[total_key] = str(days * rate)
            calculate_grand_total()
        except (ValueError, TypeError):
            pass

    # Helper to calculate days from date range and auto-update total
    def update_days(range_key, days_key, rate_key=None, total_key=None):
        dates = st.session_state.get(range_key)
        if dates:
            if len(dates) == 2:
                st.session_state[days_key] = str((dates[1] - dates[0]).days + 1)
            elif len(dates) == 1:
                st.session_state[days_key] = "1"
        
        # If rate and total keys are provided, update total as well
        if rate_key and total_key:
            update_total(days_key, rate_key, total_key)

    st.header("3. Hospital Stay Details")
    st.info("Enter details for each room type used. Leave blank if not applicable.")

    # Scrollable container for Room Rent details
    with st.container(height=500, border=True):
        # 1. General Ward
        st.subheader("1. General Ward (जनरल वॉर्ड)")
        c_gw1, c_gw2, c_gw3, c_gw4 = st.columns(4)
        gw_range = c_gw1.date_input("Date Range (From - To) ( या तारखे पासून ते या तारखे पर्यन्त )", value=[], key="gw_range", format="DD/MM/YYYY", on_change=update_days, args=("gw_range", "gw_days", "gw_rates", "gw_total"), min_value=datetime.date(1900, 1, 1), max_value=datetime.date(2100, 12, 31))
        gw_dates = ""
        if len(gw_range) == 2:
            gw_dates = f"{gw_range[0].strftime('%d/%m/%Y')} to {gw_range[1].strftime('%d/%m/%Y')}"
            c_gw1.info(f"📅: **{gw_dates}**")
        elif len(gw_range) == 1:
            gw_dates = gw_range[0].strftime('%d/%m/%Y')
            
        gw_days = c_gw2.text_input("Days", key="gw_days", on_change=update_total, args=("gw_days", "gw_rates", "gw_total"))
        gw_rates = c_gw3.text_input("Rate", key="gw_rates", on_change=update_total, args=("gw_days", "gw_rates", "gw_total"))
        gw_total = c_gw4.text_input("Total", key="gw_total")
        st.divider()

        # 2. Semi-Private
        st.subheader("2. Semi-Private (सेमीप्रायव्हेट- बाथरूम नसलेला कक्ष )")
        c_sp1, c_sp2, c_sp3, c_sp4 = st.columns(4)
        semi_range = c_sp1.date_input("Date Range (From - To) ( या तारखे पासून ते या तारखे पर्यन्त )", value=[], key="semi_range", format="DD/MM/YYYY", on_change=update_days, args=("semi_range", "semi_days", "semi_rate", "semi_total"), min_value=datetime.date(1900, 1, 1), max_value=datetime.date(2100, 12, 31))
        semi_dates = ""
        if len(semi_range) == 2:
            semi_dates = f"{semi_range[0].strftime('%d/%m/%Y')} to {semi_range[1].strftime('%d/%m/%Y')}"
            c_sp1.info(f"📅: **{semi_dates}**")
        elif len(semi_range) == 1:
            semi_dates = semi_range[0].strftime('%d/%m/%Y')

        semi_days = c_sp2.text_input("Days", key="semi_days", on_change=update_total, args=("semi_days", "semi_rate", "semi_total"))
        semi_rate = c_sp3.text_input("Rate", key="semi_rate", on_change=update_total, args=("semi_days", "semi_rate", "semi_total"))
        semi_total = c_sp4.text_input("Total", key="semi_total")
        st.divider()

        # 3. Private Room
        st.subheader("3. Private Room (प्रायव्हेट रूम- बाथरूमसह स्वतंत्र कक्ष )")
        c_pr1, c_pr2, c_pr3, c_pr4 = st.columns(4)
        pvt_range = c_pr1.date_input("Date Range (From - To) ( या तारखे पासून ते या तारखे पर्यन्त )", value=[], key="pvt_range", format="DD/MM/YYYY", on_change=update_days, args=("pvt_range", "pvt_days", "pvt_rates", "pvt_total"), min_value=datetime.date(1900, 1, 1), max_value=datetime.date(2100, 12, 31))
        pvt_dates = ""
        if len(pvt_range) == 2:
            pvt_dates = f"{pvt_range[0].strftime('%d/%m/%Y')} to {pvt_range[1].strftime('%d/%m/%Y')}"
            c_pr1.info(f"📅: **{pvt_dates}**")
        elif len(pvt_range) == 1:
            pvt_dates = pvt_range[0].strftime('%d/%m/%Y')

        pvt_days = c_pr2.text_input("Days", key="pvt_days", on_change=update_total, args=("pvt_days", "pvt_rates", "pvt_total"))
        pvt_rates = c_pr3.text_input("Rate", key="pvt_rates", on_change=update_total, args=("pvt_days", "pvt_rates", "pvt_total"))
        pvt_total = c_pr4.text_input("Total", key="pvt_total")
        st.divider()

        # 4. ICU
        st.subheader("4. ICU (अतिदक्षता कक्ष)")
        c_icu1, c_icu2, c_icu3, c_icu4 = st.columns(4)
        icu_range = c_icu1.date_input("Date Range (From - To) ( या तारखे पासून ते या तारखे पर्यन्त )", value=[], key="icu_range", format="DD/MM/YYYY", on_change=update_days, args=("icu_range", "icu_days", "icu_rates", "icu_total"), min_value=datetime.date(1900, 1, 1), max_value=datetime.date(2100, 12, 31))
        icu_dates = ""
        if len(icu_range) == 2:
            icu_dates = f"{icu_range[0].strftime('%d/%m/%Y')} to {icu_range[1].strftime('%d/%m/%Y')}"
            c_icu1.info(f"📅: **{icu_dates}**")
        elif len(icu_range) == 1:
            icu_dates = icu_range[0].strftime('%d/%m/%Y')

        icu_days = c_icu2.text_input("Days", key="icu_days", on_change=update_total, args=("icu_days", "icu_rates", "icu_total"))
        icu_rates = c_icu3.text_input("Rate", key="icu_rates", on_change=update_total, args=("icu_days", "icu_rates", "icu_total"))
        icu_total = c_icu4.text_input("Total", key="icu_total")
    
    # NEW: Display Stay Grand Total here
    st.markdown("---")
    if 'stay_grand_total' not in st.session_state:
        st.session_state['stay_grand_total'] = 0
    st.metric(label="🏥 Hospital Stay Grand Total (Rs)", value=f"₹ {st.session_state.get('stay_grand_total', 0)}")

    # Lab & Pathology Charges Section (moved before Form D)
    st.header("4. Lab & Pathology Charges")
    c_l1, c_l2 = st.columns(2)
    with c_l1:
        # New Internal Field mapped to {{lab_charges}}
        internal_lab_charges = st.number_input("lab charges (दावखान्यातून केलेली तपासणी)", min_value=0.0, step=1.0, key="internal_lab_charges_input")
    with c_l2:
        # Existing External Field (Renamed variable to avoid conflict)
        external_lab_charges = st.number_input("Pathology charges / Lab bill (outside hospital) लॅब तपासणी (दावखण्याच्या बाहेरून केलेली तपासणी)", min_value=0.0, step=1.0, key="lab_charges_input")

    st.subheader("5. Detailed Bill Charges (Form D)")
    with st.expander("Enter Form D Details here", expanded=True):
        c_d1, c_d2, c_d3 = st.columns(3)
        with c_d1:
            admission_charges = st.number_input("Admission Charges (w.e.f ___ to ___)", min_value=0.0, step=1.0)
            # Auto-fill Total Staying Charges from Section 3 Calculation
            calculated_stay_total = float(st.session_state.get('stay_grand_total', 0))
            total_staying_charges = st.number_input("Total Staying Charges", min_value=0.0, step=1.0, value=calculated_stay_total)
            surgeon_charges = st.number_input("Surgeon Charges / Dr. Charges", min_value=0.0, step=1.0)
            asst_surgeon_charges = st.number_input("Assistant Charges Dr.", min_value=0.0, step=1.0)
            anesthesia_charges = st.number_input("Anesthesia charges", min_value=0.0, step=1.0)
            ot_charges = st.number_input("Operation Theatre Charges", min_value=0.0, step=1.0)
        with c_d2:
            ot_assistant_charges = st.number_input("O.T. Assistant Charges", min_value=0.0, step=1.0)
            rmo_charges = st.number_input("RMO Charges", min_value=0.0, step=1.0)
            nursing_charges = st.number_input("Nursing Charges", min_value=0.0, step=1.0)
            iv_infusion_charges = st.number_input("I.V. Infusion or Transfusion Charges", min_value=0.0, step=1.0)
            doctor_visit_charges = st.number_input("Visit Dr. Charges (Total Visits ___)", min_value=0.0, step=1.0)
            special_visit_charges = st.number_input("Special Visits by Dr.", min_value=0.0, step=1.0)
        with c_d3:
            monitor_charges = st.number_input("Monitor Charges", min_value=0.0, step=1.0)
            
            # --- NEW: Pathology Charges (Internal + External) ---
            # Fetch from session state (defined in Section 5) defaulting to 0
            val_internal_lab = float(st.session_state.get('internal_lab_charges_input', 0) or 0)
            val_external_lab = float(st.session_state.get('lab_charges_input', 0) or 0)
            pathology_charges_total = val_internal_lab + val_external_lab
            
            # Display as read-only field
            st.number_input("Pathology Charges (Lab + Pathology)", value=pathology_charges_total, disabled=True)
            
            oxygen_charges = st.number_input("Oxygen Charges", min_value=0.0, step=1.0)
            radiology_charges = st.number_input("Radiology Charges", min_value=0.0, step=1.0)
            ecg_charges = st.number_input("ECG Charges", min_value=0.0, step=1.0)
            bsl_charges = st.number_input("BSL Charges", min_value=0.0, step=1.0)
            other_charges = st.number_input("Other Charges", min_value=0.0, step=1.0)
    
        # Calculate Total Form D Amount (Hospital Bill Only)
        # Now INCLUDES Pathology Charges
        total_hospital_bill_amount = (
            admission_charges + total_staying_charges + surgeon_charges + asst_surgeon_charges +
            anesthesia_charges + ot_charges + ot_assistant_charges + rmo_charges +
            nursing_charges + iv_infusion_charges + doctor_visit_charges + special_visit_charges +
            monitor_charges + pathology_charges_total + oxygen_charges + radiology_charges + ecg_charges + bsl_charges + other_charges
        )
        st.markdown("---")
        st.info(f"🧾 Calculated Form D Total (Hospital Bill) (Form D विभाग बेरीज): **₹ {total_hospital_bill_amount}**")

    # Display Form D Total
    st.info(f"🧾 Calculated Form D Total (Hospital Bill): **₹ {total_hospital_bill_amount}**")

    # NEW CALCULATION: Form D + Internal Lab Charges
    # REDUNDANT NOW as logic is merged, but keeping variable for display if needed
    total_hospital_bill_inc_lab = round(total_hospital_bill_amount) 
    st.success(f"🏥 Total Hospital Bill (Inclusive of Lab/Pathology): **₹ {total_hospital_bill_inc_lab:.2f}**")

    # NEW CALCULATION: 90% of the above total
    total_hospital_bill_90_percent = round(total_hospital_bill_inc_lab * 0.90)
    st.info(f"💰 90% Admissible Amount: **₹ {total_hospital_bill_90_percent:.2f}**")

    # --- NEW PERCENTAGE CALCULATIONS (User Request) ---
    def safe_float(val):
        try:
            return float(val)
        except (ValueError, TypeError):
            return 0.0

    # 1. Medicine 90% (calculated after medicine_charges input below)
    # 2. External Lab 90%
    external_lab_charges_90_percent = round(external_lab_charges * 0.90)
    
    # 3. Room Rent Percentages
    # Need to fetch current values from session state as they are text inputs
    val_gw_total = safe_float(st.session_state.get('gw_total', 0))
    gw_total_95_percent = round(val_gw_total * 0.95)
    
    val_semi_total = safe_float(st.session_state.get('semi_total', 0))
    semi_total_90_percent = round(val_semi_total * 0.90)
    
    val_pvt_total = safe_float(st.session_state.get('pvt_total', 0))
    pvt_total_75_percent = round(val_pvt_total * 0.75)

    val_icu_total = safe_float(st.session_state.get('icu_total', 0))
    # ICU is 100% as per image
    
    val_icu_total = safe_float(st.session_state.get('icu_total', 0))
    # ICU is 100% as per image
    
    # Total Admissible Room Rent (Sum of 1, 2, 3, 4, 5)
    total_room_rent_admissible = round(gw_total_95_percent + semi_total_90_percent + pvt_total_75_percent + val_icu_total)

    st.header("6. Medicine Receipt Details (औषध पावत्या तपशील)")
    
    # Initialize session state for medicine receipts
    if 'medicine_receipts' not in st.session_state:
        st.session_state['medicine_receipts'] = []
    
    if 'total_medicine_charges' not in st.session_state:
        st.session_state['total_medicine_charges'] = 0.0
    
    # Helper function to calculate total medicine charges
    def calculate_total_medicine_charges():
        """Calculate total from all receipt amounts"""
        total = sum(
            float(receipt.get('amount', 0) or 0) 
            for receipt in st.session_state['medicine_receipts']
        )
        st.session_state['total_medicine_charges'] = total
        return total
    
    # Helper function to add new receipt
    def add_medicine_receipt():
        """Add a new empty receipt to the list"""
        st.session_state['medicine_receipts'].append({
            'receipt_no': '',
            'date': None,
            'amount': 0.0
        })
    
    # Helper function to delete receipt
    def delete_medicine_receipt(index):
        """Delete a receipt at the given index"""
        if len(st.session_state['medicine_receipts']) > 0:
            st.session_state['medicine_receipts'].pop(index)
            calculate_total_medicine_charges()
    
    st.info("💡 Enter details for each medicine receipt. Click 'Add Receipt' to add more entries.")
    
    # Display existing receipts in a table format
    if len(st.session_state['medicine_receipts']) > 0:
        with st.container(border=True):
            st.markdown("### Medicine Receipts")
            
            # Table header
            header_cols = st.columns([1, 3, 2, 2, 1])
            header_cols[0].markdown("**Sr. No**")
            header_cols[1].markdown("**Receipt No**")
            header_cols[2].markdown("**Date**")
            header_cols[3].markdown("**Amount (₹)**")
            header_cols[4].markdown("**Action**")
            
            st.markdown("---")
            
            # Display each receipt
            for i, receipt in enumerate(st.session_state['medicine_receipts']):
                cols = st.columns([1, 3, 2, 2, 1])
                
                # Serial number
                cols[0].markdown(f"**{i+1}**")
                
                # Receipt number input
                receipt_no = cols[1].text_input(
                    f"Receipt No {i+1}",
                    value=receipt.get('receipt_no', ''),
                    key=f"receipt_no_{i}",
                    label_visibility="collapsed"
                )
                st.session_state['medicine_receipts'][i]['receipt_no'] = receipt_no
                
                # Date input
                receipt_date = cols[2].date_input(
                    f"Date {i+1}",
                    value=receipt.get('date'),
                    key=f"receipt_date_{i}",
                    format="DD/MM/YYYY",
                    label_visibility="collapsed",
                    min_value=datetime.date(1900, 1, 1),
                    max_value=datetime.date(2100, 12, 31)
                )
                st.session_state['medicine_receipts'][i]['date'] = receipt_date
                
                # Amount input
                receipt_amount = cols[3].number_input(
                    f"Amount {i+1}",
                    value=float(receipt.get('amount', 0)),
                    min_value=0.0,
                    step=1.0,
                    key=f"receipt_amount_{i}",
                    label_visibility="collapsed"
                )
                st.session_state['medicine_receipts'][i]['amount'] = receipt_amount
                
                # Delete button
                if cols[4].button("🗑️", key=f"delete_{i}", help="Delete this receipt"):
                    delete_medicine_receipt(i)
                    st.rerun()
                
                st.markdown("---")
    
    # Add Receipt button
    if st.button("➕ Add Receipt", use_container_width=True, type="primary"):
        add_medicine_receipt()
        st.rerun()
    
    # Calculate total medicine charges
    medicine_charges = calculate_total_medicine_charges()
    
    # Display summary metrics
    st.markdown("---")
    col_summary1, col_summary2 = st.columns(2)
    with col_summary1:
        st.metric(label="📋 Total Receipts", value=len(st.session_state['medicine_receipts']))
    with col_summary2:
        st.metric(label="💊 Total Medicine Charges", value=f"₹ {medicine_charges:,.2f}")
    
    st.markdown("---")
    
    st.header("7. Expense Calculations")
    
    # Initialize stay_grand_total from session state
    stay_grand_total = st.session_state.get('stay_grand_total', 0)
    
    # Calculate breakdown components
    # 1. Hospital Staying Charges (from Section 3)
    hospital_staying_charges = stay_grand_total
    
    # 2. Other Hospital Charges (Form D Total - Staying - Pathology)
    other_hospital_charges = total_hospital_bill_amount - hospital_staying_charges - pathology_charges_total
    
    # 3. Pathology Charges (already calculated)
    # pathology_charges_total
    
    # 4. Medicine Charges (from receipts)
    # medicine_charges already calculated above
    
    # Display breakdown as read-only metrics
    st.subheader("Claim Breakdown")
    col_a, col_b = st.columns(2)
    
    with col_a:
        st.metric(label="🏥 Hospital Staying Charges", value=f"₹ {hospital_staying_charges}")
        st.metric(label="🧾 Other Hospital Charges", value=f"₹ {other_hospital_charges:.2f}")
    
    with col_b:
        st.metric(label="🔬 Pathology Charges", value=f"₹ {pathology_charges_total}")
        st.metric(label="💊 Medicine Charges", value=f"₹ {medicine_charges}")
    
    # Calculate Medicine 90%
    medicine_charges_90_percent = round(medicine_charges * 0.90)

    # Total of 90% Admissible Charges (Sum of Serial 6, 7, 8...)
    # 1. Hospital Bill 90% (includes Lab/Path check)
    # 2. Medicine 90%
    # 3. External Lab 90% (REMOVED: Already in Hospital Bill 90%)
    total_other_charges_admissible = round(total_hospital_bill_90_percent + medicine_charges_90_percent)

    # GRAND TOTAL ADMISSIBLE AMOUNT (User Request: All 90% components + Total Room Rent Admissible)
    grand_total_admissible_amount = round(total_other_charges_admissible + total_room_rent_admissible)

    # Auto-calculate Total Claim
    # Formula: Form D (Hospital Bill) + Medicine Charges
    # Form D already includes: Staying + Pathology + Other Hospital Charges
    grand_total_claim = total_hospital_bill_amount + medicine_charges
    
    st.markdown("---")
    st.metric(label="💰 Total Claim Amount", value=f"₹ {grand_total_claim}")


    st.header("7. Family Details (For Declaration)")
    st.caption("Enter details of dependent family members (Max 5)")

    family_members = []
    for i in range(1, 6):
        st.subheader(f"Member {i}")
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            m_name = st.text_input(f"Name {i}", key=f"m_name_{i}")
        with c2:
            m_rel = st.text_input(f"Relation {i}", key=f"m_rel_{i}")
        with c3:
            m_age = st.text_input(f"Age {i}", key=f"m_age_{i}")
        with c4:
            m_job = st.text_input(f"Job/Status {i}", key=f"m_job_{i}")
        
        family_members.append({
            'name': m_name,
            'rel': m_rel,
            'age': m_age,
            'job': m_job
        })

    
    # Section 7 removed as per request


    # 3. Processing Logic
    if st.button("Generate Reimbursement PDF"):
        with st.spinner("Generating PDF... Please wait..."):
            try:
                # A. Load Template & Map Variables
                script_dir = os.path.dirname(__file__)
                template_path = os.path.join(script_dir, "template_fixed.docx")
                if not os.path.exists(template_path):
                     # Fallback if fixed doesn't exist
                     template_path = os.path.join(script_dir, "template.docx")
                doc = DocxTemplate(template_path)
                
                context = {
                    'emp_name_designation_marathi': emp_name_designation_marathi,
                    'office_name_marathi': office_name_marathi,
                    'basic_pay': basic_pay,
                    'work_place_marathi': work_place_marathi,
                    'res_address_marathi': res_address_marathi,
                    'patient_name': patient_name,
                    'patient_relation': patient_relation,
                    'patient_age': patient_age,
                    'place_of_illness': place_of_illness,
                    'consult_doctor_hospital': consult_doctor_hospital,
                    'test_charges': total_hospital_bill_amount,  # Form D Total (for template compatibility)
                    'medicine_charges': medicine_charges,
                    'medicine_receipt_count': len(st.session_state['medicine_receipts']),
                    'medicine_receipts': st.session_state['medicine_receipts'],  # Full list for Jinja2 loop in template
                    'stay_grand_total': stay_grand_total,
                    'total_claim_amount': grand_total_claim,
                    'grand_total_claim': grand_total_claim,
                    'appointment_date': appointment_date.strftime("%d/%m/%Y") if appointment_date else "",
                    # 'retirement_date': removed
                    'admit_date_from': admit_date_from.strftime("%d/%m/%Y") if admit_date_from else "",
                    'admit_date_to': admit_date_to.strftime("%d/%m/%Y") if admit_date_to else "",
                    'cert_date': datetime.date.today().strftime("%d/%m/%Y"),
                    'cert_place': work_place_marathi,
                    'emp_name_english': emp_name_english,
                    'emp_designation_english': emp_designation_english,
                    'patient_name_english': patient_name_english,
                    'hospital_name_english': hospital_name_english,
                    'treating_doctor_name_english': treating_doctor_name_english,
                    'res_address_english': res_address_english,
                    'office_name_english': office_name_english,
                    'emp_name_marathi': emp_name_designation_marathi.split('(')[0].strip() if '(' in emp_name_designation_marathi else emp_name_english,
                    'emp_designation_marathi': emp_designation_marathi,
                    'emp_office_name_marathi': office_name_marathi,
                    'hosp_name_marathi': hospital_name_marathi_input,
                    'hospital_name_marathi': hospital_name_marathi_input,
                    'patient_name_marathi': patient_name,
                    'patient_relation_marathi': patient_relation,
                    # 'relative_designation_marathi': removed
                    # 'relative_emp_name_marathi': removed
                    'res_address': res_address_english, 
                    'office_name': office_name_english, 
                    'hospital_name': hospital_name_english, 
                    'treating_doctor_name': treating_doctor_name_english,
                    'emp_name': emp_name_english,
                    'emp_designation': emp_designation_english,
                    'emp_office_name': office_name_english, 
                    'dr_name': treating_doctor_name_english,
                    'hosp_name': hospital_name_english,
                    'work_place': work_place_english,
                    # 'relative_emp_name': removed
                    # 'relative_designation': removed
                    # 'relative_office_name': removed
                    'mem_name1': family_members[0]['name'], 'mem_rel1': family_members[0]['rel'], 'mem_age1': family_members[0]['age'], 'mem_job1': family_members[0]['job'],
                    'mem_name2': family_members[1]['name'], 'mem_rel2': family_members[1]['rel'], 'mem_age2': family_members[1]['age'], 'mem_job2': family_members[1]['job'],
                    'mem_name3': family_members[2]['name'], 'mem_rel3': family_members[2]['rel'], 'mem_age3': family_members[2]['age'], 'mem_job3': family_members[2]['job'],
                    'mem_name4': family_members[3]['name'], 'mem_rel4': family_members[3]['rel'], 'mem_age4': family_members[3]['age'], 'mem_job4': family_members[3]['job'],
                    'mem_name5': family_members[4]['name'], 'mem_rel5': family_members[4]['rel'], 'mem_age5': family_members[4]['age'], 'mem_job5': family_members[4]['job'],
                    'test_lab_name_1': '-----',
                    'test_lab_name_2': '',
                    'test_lab_name_3': '',
                    'consult_place': 'Hospital',
                    'gw_dates': gw_dates, 'gw_days': gw_days, 'gw_rates': gw_rates, 'gw_total': gw_total,
                    'semi_dates': semi_dates, 'semi_days': semi_days, 'semi_rate': semi_rate, 'semi_total': semi_total,
                    'pvt_dates': pvt_dates, 'pvt_days': pvt_days, 'pvt_rates': pvt_rates, 'pvt_total': pvt_total,
                    'icu_dates': icu_dates, 'icu_days': icu_days, 'icu_rates': icu_rates, 'icu_total': icu_total,
                    
                    # New Form D Variables
                    'admission_charges': admission_charges,
                    'total_staying_charges': total_staying_charges,
                    'surgeon_charges': surgeon_charges,
                    'asst_surgeon_charges': asst_surgeon_charges,
                    'anesthesia_charges': anesthesia_charges,
                    'ot_charges': ot_charges,
                    'ot_assistant_charges': ot_assistant_charges,
                    'rmo_charges': rmo_charges,
                    'nursing_charges': nursing_charges,
                    'iv_infusion_charges': iv_infusion_charges,
                    'doctor_visit_charges': doctor_visit_charges,
                    'special_visit_charges': special_visit_charges,
                    'monitor_charges': monitor_charges,
                    'pathology_charges': pathology_charges_total,
                    'PATHOLOGY CHARGES': pathology_charges_total, # For case-insensitive template support
                    'lab_charges': internal_lab_charges, # Mapped as requested
                    'external_lab_charges': external_lab_charges, # Renamed to avoid conflict
                    # 'hospital_charges': removed
                    'oxygen_charges': oxygen_charges,
                    'radiology_charges': radiology_charges,
                    'ecg_charges': ecg_charges,
                    'bsl_charges': bsl_charges,
                    'other_charges': other_charges,
                    # User requested to show the Inclusive Total (Hospital + Lab) in the main "Form D Total" field
                    # Since we updated total_hospital_bill_amount to include it, we map it directly
                    'total_hospital_bill_amount': f"{total_hospital_bill_amount:.2f}", 
                    'total_hospital_bill_inc_lab': f"{total_hospital_bill_amount:.2f}",
                    'total_hospital_bill_90_percent': f"{total_hospital_bill_90_percent:.2f}", # New 90% Variable
                    
                    # New Percentage Variables formatted to .00
                    'medicine_charges_90_percent': f"{medicine_charges_90_percent:.2f}",
                    'external_lab_charges_90_percent': f"{external_lab_charges_90_percent:.2f}",
                    'gw_total_95_percent': f"{gw_total_95_percent:.2f}",
                    'semi_total_90_percent': f"{semi_total_90_percent:.2f}",
                    'pvt_total_75_percent': f"{pvt_total_75_percent:.2f}",
                    
                    # New Sum Totals formatted to .00
                    'total_room_rent_admissible': f"{total_room_rent_admissible:.2f}", # Sum of room rent admissible amounts
                    'total_other_charges_admissible': f"{total_other_charges_admissible:.2f}", # Sum of 90% components
                    'grand_total_admissible_amount': f"{grand_total_admissible_amount:.2f}", # Grand total of all admissible amounts
                }

                doc.render(context)
                temp_docx = os.path.join(script_dir, "temp_filled_form.docx")
                doc.save(temp_docx)

                # --- PDF GENERATION WITH ERROR HANDLING ---
                libre_office_path = None
                if sys.platform == "win32":
                    possible_paths = [
                        r"C:\Program Files\LibreOffice\program\soffice.exe",
                        r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
                        r"D:\Program Files\LibreOffice\program\soffice.exe",
                         r"D:\Program Files (x86)\LibreOffice\program\soffice.exe",
                    ]
                    for p in possible_paths:
                        if os.path.exists(p):
                            libre_office_path = p
                            break
                    if not libre_office_path:
                        # Fallback to verify if 'soffice' command exists in PATH
                        if shutil.which("soffice"):
                            libre_office_path = "soffice"
                else:
                    libre_office_path = "libreoffice"

                if libre_office_path:
                    try:
                        subprocess.run([libre_office_path, '--headless', '--convert-to', 'pdf:writer_pdf_Export', '--outdir', script_dir, temp_docx], check=True)
                        
                        st.session_state['pdf_generated'] = True
                        st.session_state['pdf_type'] = 'reimbursement'
                        st.session_state['pdf_path'] = os.path.join(script_dir, "temp_filled_form.pdf")
                        st.success("✅ PDF generated successfully!")

                        # Copy to public for URL access
                        public_dir = os.path.join(script_dir, "..", "public")
                        if not os.path.exists(public_dir):
                            os.makedirs(public_dir)
                            
                        target_pdf_name = f"Medical_Claim_{emp_name_english.replace(' ', '_')}.pdf"
                        public_pdf_path = os.path.join(public_dir, target_pdf_name)
                        shutil.copy(st.session_state['pdf_path'], public_pdf_path)
                        
                        st.markdown("### 🔗 Direct Access Links:")
                        st.markdown(f"- **[Open via XAMPP (Apache)]({config.XAMPP_BASE_URL}/public/{target_pdf_name})** (Right-click > Save Link As)")
                        st.markdown(f"- **[Open via Vite (React)]({config.REACT_BASE_URL}/{target_pdf_name})**")
                    except Exception as e:
                        st.error(f"⚠️ PDF Conversion Failed: {e}")
                        st.info("The Word file was created successfully, but PDF conversion failed. You can download the Word file below.")
                else:
                    st.warning("⚠️ LibreOffice not found. PDF creation skipped.")
                    st.info("The Word file was created successfully. Please download it below.")
                
                # ALWAYS SHOW DOCX DOWNLOAD IF PDF FAILS OR NOT FOUND
                with open(temp_docx, "rb") as docx_file:
                    st.download_button(
                        label="📥 Download Word Document (.docx)",
                        data=docx_file,
                        file_name=f"Medical_Claim_{emp_name_english}.docx",
                        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    )

            except Exception as e:
                st.error(f"Error: {e}")

    if st.session_state.get('pdf_generated') and st.session_state.get('pdf_type') == 'reimbursement':
        pdf_path = st.session_state.get('pdf_path')
        if pdf_path and os.path.exists(pdf_path):
            with open(pdf_path, "rb") as pdf_file:
                st.download_button(label="📥 Download Reimbursement PDF", data=pdf_file, file_name=f"Medical_Claim_{emp_name_english}.pdf", mime="application/pdf")

# Tab 2 'Expense Calculator' removed as per request
