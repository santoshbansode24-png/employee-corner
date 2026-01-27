import streamlit as st

import datetime
import os
import subprocess
import sys
import shutil

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

# Custom CSS to increase font size and ensure Marathi font support
st.markdown("""
    <style>
        /* Import fonts - Inter for English and Noto Sans Devanagari for Marathi */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@100;200;300;400;500;600;700;800;900&display=swap');
        
        /* Devanagari font with unicode-range (only applies to Marathi characters) */
        @font-face {
            font-family: 'Noto Sans Devanagari';
            font-style: normal;
            font-weight: 100 900;
            font-display: swap;
            src: url('https://fonts.gstatic.com/s/notosansdevanagari/v25/TuGoUUFzXI5FBtUq5a8bjKYTZjtRU6Sgv3NaV_SNmI0b8QQCQmHn6B2OHjbL_08AlXQky-AzoFoW4Ow.woff2') format('woff2');
            unicode-range: U+0900-097F, U+1CD0-1CF6, U+1CF8-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FB;
        }
        
        /* Fallback font for Devanagari if Google Fonts fails */
        @font-face {
            font-family: 'Devanagari Fallback';
            src: local('Noto Sans Devanagari'), 
                 local('Mangal'), 
                 local('Kokila'), 
                 local('Aparajita'),
                 local('Sanskrit Text');
            unicode-range: U+0900-097F;
        }
        
        /* Font stack: Inter for English, Noto Sans Devanagari for Marathi (via unicode-range) */
        
        p, label, input, textarea, button, h1, h2, h3, h4, h5, h6, .stMarkdown, .stTextInput, .stNumberInput, .stDateInput, .stSelectbox {
            font-family: 'Inter', 'Noto Sans Devanagari', 'Devanagari Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        }
        
        /* Streamlit specific selectors with highest priority */
        .stApp, .stApp *, [data-testid="stMarkdownContainer"], [data-testid="stText"], 
        .stTextInput label, .stDateInput label, .stNumberInput label, .stSelectbox label,
        .stTextInput input, .stDateInput input, .stNumberInput input, .stSelectbox select {
            font-family: 'Inter', 'Noto Sans Devanagari', 'Devanagari Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        }
        
        /* Ensure proper text rendering for complex scripts */
        * {
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
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


# Tab Logic Restored - 6 Separate Tabs as per request
# Wizard Navigation Setup
# Wizard Navigation Setup
if 'current_step' not in st.session_state:
    st.session_state['current_step'] = 0

if 'form_data' not in st.session_state:
    st.session_state['form_data'] = {}

# --- CUSTOM CSS FOR BUTTONS ---
st.markdown("""
<style>
/* Premium Orange Button Style */
div.element-container:has(span.orange-btn-target) + div.element-container button {
    background: linear-gradient(45deg, #FF8C00, #FF5722) !important;
    color: white !important;
    border: none !important;
    font-weight: bold !important;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
    transition: all 0.3s ease !important;
}
div.element-container:has(span.orange-btn-target) + div.element-container button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 8px rgba(0,0,0,0.15) !important;
    background: linear-gradient(45deg, #FF5722, #FF8C00) !important;
}
/* Fallback for older browsers (approximate) */
div[data-testid="stVerticalBlock"] > div:has(span.orange-btn-target) + div button {
     background: linear-gradient(45deg, #FF8C00, #FF5722) !important;
}


/* Premium Green Button Style */
div.element-container:has(span.green-btn-target) + div.element-container button {
    background: linear-gradient(45deg, #2ecc71, #27ae60) !important;
    color: white !important;
    border: none !important;
    font-weight: bold !important;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
    transition: all 0.3s ease !important;
}
div.element-container:has(span.green-btn-target) + div.element-container button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 8px rgba(0,0,0,0.15) !important;
    background: linear-gradient(45deg, #27ae60, #2ecc71) !important;
}
</style>
""", unsafe_allow_html=True)


# Define keys for each step to persist
STEP_1_KEYS = [
    'emp_name_designation_marathi', 'emp_designation_marathi', 'office_name_marathi', 
    'res_address_marathi', 'work_place_marathi', 'basic_pay',
    'emp_name_english', 'emp_designation_english', 'office_name_english', 
    'res_address_english', 'work_place_english', 'appointment_date',
    'patient_name', 'patient_relation', 'patient_age', 'place_of_illness', 'patient_name_english',
    'hospital_name_marathi_input', 'doctor_name_marathi_input',
    'hospital_name_english', 'treating_doctor_name_english',
    'admit_date_from', 'admit_date_to'
]

STEP_2_KEYS = [
    'gw_range', 'gw_days', 'gw_rates', 'gw_total',
    'semi_range', 'semi_days', 'semi_rate', 'semi_total',
    'pvt_range', 'pvt_days', 'pvt_rates', 'pvt_total',
    'icu_range', 'icu_days', 'icu_rates', 'icu_total'
]

STEP_3_KEYS = [
    'admission_charges', 'total_staying_charges', 'surgeon_charges', 'asst_surgeon_charges',
    'anesthesia_charges', 'ot_charges', 'ot_assistant_charges', 'rmo_charges',
    'nursing_charges', 'iv_infusion_charges', 'doctor_visit_charges', 'special_visit_charges',
    'monitor_charges', 'oxygen_charges', 'radiology_charges', 'ecg_charges', 'bsl_charges', 'other_charges'
]

STEP_6_KEYS = ['m_name_1', 'm_rel_1', 'm_age_1', 'm_job_1',
               'm_name_2', 'm_rel_2', 'm_age_2', 'm_job_2',
               'm_name_3', 'm_rel_3', 'm_age_3', 'm_job_3',
               'm_name_4', 'm_rel_4', 'm_age_4', 'm_job_4',
               'm_name_5', 'm_rel_5', 'm_age_5', 'm_job_5']

steps = [
    "📄 Details (तपशील)", 
    "🏥 Hospitalization (रुग्णालय)", 
    "📋 Form D (फॉर्म डी)", 
    "💊 Medicines (औषधे)", 
    "🧮 Summary (हिशोब)", 
    "👨‍👩‍👧‍👦 Family & PDF (कुटुंब व पीडीएफ)"
]

def save_step_data():
    current = st.session_state['current_step']
    keys = []
    if current == 0: keys = STEP_1_KEYS
    elif current == 1: keys = STEP_2_KEYS
    elif current == 2: keys = STEP_3_KEYS
    elif current == 5: keys = STEP_6_KEYS
    
    for k in keys:
        if k in st.session_state:
            st.session_state['form_data'][k] = st.session_state[k]

def load_step_data(target_step):
    keys = []
    if target_step == 0: keys = STEP_1_KEYS
    elif target_step == 1: keys = STEP_2_KEYS
    elif target_step == 2: keys = STEP_3_KEYS
    elif target_step == 5: keys = STEP_6_KEYS
    
    for k in keys:
        # If the key is in form_data but not in session_state (or we want to restore it), restore it.
        # Streamlit widgets look at st.session_state[key] if 'key' param is used.
        if k in st.session_state['form_data']:
            st.session_state[k] = st.session_state['form_data'][k]

def go_next():
    save_step_data()
    if st.session_state['current_step'] < len(steps) - 1:
        st.session_state['current_step'] += 1
        load_step_data(st.session_state['current_step'])

def go_prev():
    save_step_data()
    if st.session_state['current_step'] > 0:
        st.session_state['current_step'] -= 1
        load_step_data(st.session_state['current_step'])

current_step = st.session_state['current_step']

# Initial Load (Run only once per rerun is tricky, but we need to ensure keys exist before widgets)
load_step_data(current_step)

# Progress Bar
st.progress((current_step + 1) / len(steps))
st.caption(f"Step {current_step + 1} of {len(steps)}: {steps[current_step]}")

# ----------------- TAB 1: DETAILS -----------------
# ----------------- STEP 1: DETAILS -----------------
if current_step == 0:
    st.header("1. Employee Details (कर्मचारी तपशील)")
    col1, col2 = st.columns(2)
    with col1:
        # Marathi Details
        emp_name_designation_marathi = st.text_input("Name & Designation (Marathi): नाव व पदनाम (मराठी) [टीप: कृपया पदनाम ( ) कंसामध्ये लिहावे]", key="emp_name_designation_marathi")
        emp_designation_marathi = st.text_input("Designation (Marathi): पदनाम (मराठी)", key="emp_designation_marathi")
        office_name_marathi = st.text_input("Office Name (Marathi): कार्यालयाचे नाव (मराठी)", key="office_name_marathi")
        res_address_marathi = st.text_input("Residential Address (Marathi): राहण्याचा पत्ता (मराठी)", key="res_address_marathi")
        work_place_marathi = st.text_input("Work Place (Marathi): कामाचे ठिकाण (मराठी)", key="work_place_marathi")
        basic_pay = st.text_input("Basic Pay: मूळ वेतन", key="basic_pay")

    with col2:
        # English Details (Added for Form C/D)
        emp_name_english = st.text_input("Employee Name (English): कर्मचाऱ्याचे नाव (इंग्रजी)", key="emp_name_english")
        emp_designation_english = st.text_input("Designation (English): पदनाम (इंग्रजी)", key="emp_designation_english")
        office_name_english = st.text_input("Office Name (English): कार्यालयाचे नाव (इंग्रजी)", key="office_name_english")
        res_address_english = st.text_input("Residential Address (English): राहण्याचा पत्ता (इंग्रजी)", key="res_address_english")
        work_place_english = st.text_input("Work Place (English): कामाचे ठिकाण (इंग्रजी)", key="work_place_english")
        
        appointment_date = st.date_input("Appointment Date: नियुक्ती दिनांक", value=None, min_value=datetime.date(1900, 1, 1), max_value=datetime.date(2100, 12, 31), key="appointment_date")
    
    st.markdown("---")
    st.header("2. Patient & Treatment Details (रुग्ण व उपचाराचा तपशील)")
    col3, col4 = st.columns(2)
    with col3:
        # Variables: patient_name, patient_relation, patient_age
        patient_name = st.text_input("Patient Name (Marathi): रुग्णाचे नाव (मराठी)", key="patient_name")
        patient_relation = st.text_input("Relation: नाते", key="patient_relation")
        patient_age = st.text_input("Age: वय", key="patient_age")
        place_of_illness = st.text_input("Place of Illness: आजाराचे ठिकाण", key="place_of_illness")
        patient_name_english = st.text_input("Patient Name (English): रुग्णाचे नाव (इंग्रजी)", key="patient_name_english")

    with col4:
        # Variables: consult_doctor_hospital, admit_date_from, admit_date_to
        # Split into separate fields for accuracy
        hospital_name_marathi_input = st.text_input("Hospital Name (Marathi): रुग्णालयाचे नाव (मराठी)", key="hospital_name_marathi_input")
        doctor_name_marathi_input = st.text_input("Doctor Name (Marathi): डॉक्टरचे नाव (मराठी)", key="doctor_name_marathi_input")
        
        # Construct the legacy combined variable for template compatibility if needed
        consult_doctor_hospital = f"{doctor_name_marathi_input}, {hospital_name_marathi_input}" if doctor_name_marathi_input and hospital_name_marathi_input else (hospital_name_marathi_input or doctor_name_marathi_input)
        # We need to persist this calculated value manually or re-calculate it in step 6.
        # It's better to re-calculate it in Step 6 from the raw inputs which are now persisted.

        hospital_name_english = st.text_input("Hospital Name (English): रुग्णालयाचे नाव (इंग्रजी)", key="hospital_name_english")
        treating_doctor_name_english = st.text_input("Doctor Name (English): डॉक्टरचे नाव (इंग्रजी)", key="treating_doctor_name_english")
        admit_date_from = st.date_input("Admitted From: रुग्णालयात दाखल दिनांक", value=None, min_value=datetime.date(1900, 1, 1), max_value=datetime.date(2100, 12, 31), key="admit_date_from")
        admit_date_to = st.date_input("Discharged On: रुग्णालयातून सुट्टी दिनांक", value=None, min_value=datetime.date(1900, 1, 1), max_value=datetime.date(2100, 12, 31), key="admit_date_to")

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

# ----------------- TAB 2: HOSPITALIZATION -----------------
# ----------------- STEP 2: HOSPITALIZATION -----------------
if current_step == 1:
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
    st.header("4. Pathology Charges (Pathology List)")
    
    # Initialize session state for pathology receipts
    if 'pathology_receipts' not in st.session_state:
        st.session_state['pathology_receipts'] = []
    
    # Helper to calculate total pathology
    def calculate_total_pathology_charges():
        total = sum(float(r.get('amount', 0) or 0) for r in st.session_state['pathology_receipts'])
        return total
    
    def add_pathology_receipt():
        st.session_state['pathology_receipts'].append({'receipt_no': '', 'date': None, 'amount': 0.0})

    def delete_pathology_receipt(index):
        if len(st.session_state['pathology_receipts']) > 0:
            st.session_state['pathology_receipts'].pop(index)
    
    st.info("💡 Enter details for each pathology receipt below:")
    
    if len(st.session_state['pathology_receipts']) > 0:
        with st.container(border=True):
            cols_h = st.columns([1, 3, 2, 2, 1])
            cols_h[0].markdown("**Sr**")
            cols_h[1].markdown("**Receipt No**")
            cols_h[2].markdown("**Date**")
            cols_h[3].markdown("**Amount**")
            
            for i, receipt in enumerate(st.session_state['pathology_receipts']):
                c = st.columns([1, 3, 2, 2, 1])
                c[0].markdown(f"**{i+1}**")
                
                receipt['receipt_no'] = c[1].text_input(f"P-Rect {i}", value=receipt['receipt_no'], key=f"p_rec_{i}", label_visibility="collapsed")
                
                receipt['date'] = c[2].date_input(f"P-Date {i}", value=receipt['date'], key=f"p_date_{i}", label_visibility="collapsed", format="DD/MM/YYYY")
                
                receipt['amount'] = c[3].number_input(f"P-Amt {i}", value=float(receipt['amount']), min_value=0.0, step=1.0, key=f"p_amt_{i}", label_visibility="collapsed")
                
                if c[4].button("🗑️", key=f"p_del_{i}"):
                    delete_pathology_receipt(i)
                    st.rerun()
                st.markdown("---")

    # Centered 'Add Pathology Receipt' button
    c_p1, c_p2, c_p3 = st.columns([1, 2, 1])
    # Marker for CSS targeting (Orange)
    c_p2.markdown('<span class="orange-btn-target"></span>', unsafe_allow_html=True) 
    if c_p2.button("➕ Add Pathology Receipt", key="add_path_btn"):
        add_pathology_receipt()
        st.rerun()

    # Calculate Total
    pathology_charges_total = calculate_total_pathology_charges()
    st.session_state['pathology_charges_total'] = pathology_charges_total # Persist for Summary Tab
    st.metric("🔬 Total Pathology Charges", f"₹ {pathology_charges_total:.2f}")

# ----------------- TAB 3: FORM D -----------------
# ----------------- STEP 3: FORM D -----------------
if current_step == 2:
    st.header("5. Detailed Bill Charges (Form D)")
    # Using container instead of expander for better visibility in dedicated tab
    with st.container(border=True):
        c_d1, c_d2, c_d3 = st.columns(3)
        with c_d1:
            admission_charges = st.number_input("Admission Charges (w.e.f ___ to ___)", min_value=0.0, step=1.0, key="admission_charges")
            # Auto-fill Total Staying Charges from Section 3 Calculation
            calculated_stay_total = float(st.session_state.get('stay_grand_total', 0))
            total_staying_charges = st.number_input("Total Staying Charges", min_value=0.0, step=1.0, value=calculated_stay_total, key="total_staying_charges")
            surgeon_charges = st.number_input("Surgeon Charges / Dr. Charges", min_value=0.0, step=1.0, key="surgeon_charges")
            asst_surgeon_charges = st.number_input("Assistant Charges Dr.", min_value=0.0, step=1.0, key="asst_surgeon_charges")
            anesthesia_charges = st.number_input("Anesthesia charges", min_value=0.0, step=1.0, key="anesthesia_charges")
            ot_charges = st.number_input("Operation Theatre Charges", min_value=0.0, step=1.0, key="ot_charges")
        with c_d2:
            ot_assistant_charges = st.number_input("O.T. Assistant Charges", min_value=0.0, step=1.0, key="ot_assistant_charges")
            rmo_charges = st.number_input("RMO Charges", min_value=0.0, step=1.0, key="rmo_charges")
            nursing_charges = st.number_input("Nursing Charges", min_value=0.0, step=1.0, key="nursing_charges")
            iv_infusion_charges = st.number_input("I.V. Infusion or Transfusion Charges", min_value=0.0, step=1.0, key="iv_infusion_charges")
            doctor_visit_charges = st.number_input("Visit Dr. Charges (Total Visits ___)", min_value=0.0, step=1.0, key="doctor_visit_charges")
            special_visit_charges = st.number_input("Special Visits by Dr.", min_value=0.0, step=1.0, key="special_visit_charges")
        with c_d3:
            monitor_charges = st.number_input("Monitor Charges", min_value=0.0, step=1.0, key="monitor_charges")
            
            # Pathology Charges (REMOVED from here as per request)
            # st.number_input("Pathology Charges (Lab + Pathology)", value=pathology_charges_total, disabled=True)

            
            oxygen_charges = st.number_input("Oxygen Charges", min_value=0.0, step=1.0, key="oxygen_charges")
            radiology_charges = st.number_input("Radiology Charges", min_value=0.0, step=1.0, key="radiology_charges")
            ecg_charges = st.number_input("ECG Charges", min_value=0.0, step=1.0, key="ecg_charges")
            bsl_charges = st.number_input("BSL Charges", min_value=0.0, step=1.0, key="bsl_charges")
            other_charges = st.number_input("Other Charges", min_value=0.0, step=1.0, key="other_charges")
    
    # Calculate Total Form D Amount (Hospital Bill Only)
    # Now INCLUDES Pathology Charges
    total_hospital_bill_amount = (
        admission_charges + total_staying_charges + surgeon_charges + asst_surgeon_charges +
        anesthesia_charges + ot_charges + ot_assistant_charges + rmo_charges +
        nursing_charges + iv_infusion_charges + doctor_visit_charges + special_visit_charges +
        monitor_charges + oxygen_charges + radiology_charges + ecg_charges + bsl_charges + other_charges
    )
    # Persist for Summary Tab
    st.session_state['total_hospital_bill_amount'] = total_hospital_bill_amount

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
    st.session_state['total_hospital_bill_90_percent'] = total_hospital_bill_90_percent # Persist
    st.info(f"💰 90% Admissible Amount: **₹ {total_hospital_bill_90_percent:.2f}**")

    # --- NEW PERCENTAGE CALCULATIONS (User Request) ---
    def safe_float(val):
        try:
            return float(val)
        except (ValueError, TypeError):
            return 0.0

    # 1. Medicine 90% (calculated after medicine_charges input below)
    # 2. External Lab 90%
    # 1. Medicine 90% (calculated after medicine_charges input below)
    # 2. External Lab 90%
    external_lab_charges = 0.0 # Removed
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
    st.session_state['total_room_rent_admissible'] = total_room_rent_admissible # Persist

# ----------------- TAB 4: MEDICINES -----------------
# ----------------- STEP 4: MEDICINES -----------------
if current_step == 3:
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
    # Centered 'Add Receipt' button
    c_m1, c_m2, c_m3 = st.columns([1, 2, 1])
    # Marker for CSS targeting (Orange)
    c_m2.markdown('<span class="orange-btn-target"></span>', unsafe_allow_html=True)
    if c_m2.button("➕ Add Receipt", key="add_medicine_btn"): # Changed key slightly to ensure uniqueness if needed, or keep same
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

# ----------------- TAB 5: SUMMARY & CALCULATION -----------------
# ----------------- STEP 5: SUMMARY -----------------
if current_step == 4:
    st.header("7. Expense Calculations")
    
    # Initialize stay_grand_total from session state
    stay_grand_total = st.session_state.get('stay_grand_total', 0)
    
    # Retrieve persisted values (default to 0 if not yet visited)
    total_hospital_bill_amount = st.session_state.get('total_hospital_bill_amount', 0.0)
    pathology_charges_total = st.session_state.get('pathology_charges_total', 0.0)
    medicine_charges = st.session_state.get('total_medicine_charges', 0.0)
    total_hospital_bill_90_percent = st.session_state.get('total_hospital_bill_90_percent', 0.0)
    total_room_rent_admissible = st.session_state.get('total_room_rent_admissible', 0.0)

    # Calculate breakdown components
    # 1. Hospital Staying Charges (from Section 3)
    hospital_staying_charges = stay_grand_total
    
    # 2. Other Hospital Charges (Form D Total - Staying - Pathology)
    # Handle safe subtraction even if values are floats
    try:
        other_hospital_charges = float(total_hospital_bill_amount) - float(hospital_staying_charges)
    except:
        other_hospital_charges = 0.0
    
    # 3. Pathology Charges (already calculated)
    # pathology_charges_total
    
    # 4. Medicine Charges (from receipts)
    # medicine_charges already calculated above
    
    # Display breakdown as read-only metrics
    st.subheader("Claim Breakdown")
    col_a, col_b = st.columns(2)
    
    with col_a:
        st.metric(label="🏥 Hospital Staying Charges", value=f"₹ {hospital_staying_charges}")
        st.metric(label="🧾 Other Hospital Charges (Form D)", value=f"₹ {other_hospital_charges:.2f}")
    
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


# ----------------- TAB 6: FAMILY & PDF -----------------
# ----------------- STEP 6: FAMILY & PDF -----------------
if current_step == 5:
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
    st.divider()
    # Centered 'Generate PDF' button
    c_gen1, c_gen2, c_gen3 = st.columns([1, 2, 1])
    # Marker for CSS targeting (Green)
    c_gen2.markdown('<span class="green-btn-target"></span>', unsafe_allow_html=True)
    if c_gen2.button("Generate Reimbursement PDF", type="secondary"): # Explicitly secondary or default
        with st.spinner("Generating PDF... Please wait..."):
            try:
                # --- HYDRATION BLOCK: Retrieve all variables from form_data ---
                def get_s(key, default):
                    # Priority: form_data (persisted) -> session_state (current) -> default
                    val = st.session_state['form_data'].get(key)
                    if val is None or val == "":
                        val = st.session_state.get(key)
                    return val if val is not None else default

                # Step 1: Employee Details
                emp_name_english = get_s('emp_name_english', '')
                emp_designation_english = get_s('emp_designation_english', '')
                
                # Marathi fields with fallback to English
                emp_name_designation_marathi = get_s('emp_name_designation_marathi', '')
                if not emp_name_designation_marathi:
                    emp_name_designation_marathi = f"{emp_name_english} ({emp_designation_english})" if emp_designation_english else emp_name_english

                emp_designation_marathi = get_s('emp_designation_marathi', '') or emp_designation_english
                
                office_name_english = get_s('office_name_english', '')
                office_name_marathi = get_s('office_name_marathi', '') or office_name_english
                
                res_address_english = get_s('res_address_english', '')
                res_address_marathi = get_s('res_address_marathi', '') or res_address_english
                
                work_place_english = get_s('work_place_english', '')
                work_place_marathi = get_s('work_place_marathi', '') or work_place_english
                
                basic_pay = get_s('basic_pay', '')
                appointment_date = get_s('appointment_date', None)

                # Step 1: Patient Details
                patient_name_english = get_s('patient_name_english', '')
                patient_name = get_s('patient_name', '') or patient_name_english
                
                patient_relation = get_s('patient_relation', '') # Fallback difficult without translation map
                patient_age = get_s('patient_age', '')
                place_of_illness = get_s('place_of_illness', '')
                
                hospital_name_english = get_s('hospital_name_english', '')
                hospital_name_marathi_input = get_s('hospital_name_marathi_input', '') or hospital_name_english
                
                treating_doctor_name_english = get_s('treating_doctor_name_english', '')
                doctor_name_marathi_input = get_s('doctor_name_marathi_input', '') or treating_doctor_name_english
                
                admit_date_from = get_s('admit_date_from', None)
                admit_date_to = get_s('admit_date_to', None)
                
                # Re-construct derived variables
                consult_doctor_hospital = f"{doctor_name_marathi_input}, {hospital_name_marathi_input}" if doctor_name_marathi_input and hospital_name_marathi_input else (hospital_name_marathi_input or doctor_name_marathi_input)

                # Step 2: Hospitalization (GW, Semi, Pvt, ICU)
                # These are already accessed via session state in the context dict below (gw_dates etc.), 
                # but we need to ensure the helper variables are ready if used directly.
                gw_dates = "" # Logic to reconstruct date strings if needed, but context seems to use st.session_state directly or local vars if defined.
                # Actually, the context dict below uses `gw_dates` variable which is LOCAL to Step 2.
                # We need to reconstruct these derived strings.
                
                def fmt_date_range(range_key):
                    r = get_s(range_key, [])
                    if len(r) == 2: return f"{r[0].strftime('%d/%m/%Y')} to {r[1].strftime('%d/%m/%Y')}"
                    elif len(r) == 1: return r[0].strftime('%d/%m/%Y')
                    return ""

                gw_dates = fmt_date_range('gw_range')
                semi_dates = fmt_date_range('semi_range')
                pvt_dates = fmt_date_range('pvt_range')
                icu_dates = fmt_date_range('icu_range')
                
                gw_days = get_s('gw_days', '')
                gw_rates = get_s('gw_rates', '')
                gw_total = get_s('gw_total', '')

                semi_days = get_s('semi_days', '')
                semi_rate = get_s('semi_rate', '')
                semi_total = get_s('semi_total', '')

                pvt_days = get_s('pvt_days', '')
                pvt_rates = get_s('pvt_rates', '')
                pvt_total = get_s('pvt_total', '')

                icu_days = get_s('icu_days', '')
                icu_rates = get_s('icu_rates', '')
                icu_total = get_s('icu_total', '')


                # Step 3: Form D Variables
                admission_charges = get_s('admission_charges', 0.0)
                total_staying_charges = get_s('total_staying_charges', 0.0)
                surgeon_charges = get_s('surgeon_charges', 0.0)
                asst_surgeon_charges = get_s('asst_surgeon_charges', 0.0)
                anesthesia_charges = get_s('anesthesia_charges', 0.0)
                ot_charges = get_s('ot_charges', 0.0)
                ot_assistant_charges = get_s('ot_assistant_charges', 0.0)
                rmo_charges = get_s('rmo_charges', 0.0)
                nursing_charges = get_s('nursing_charges', 0.0)
                iv_infusion_charges = get_s('iv_infusion_charges', 0.0)
                doctor_visit_charges = get_s('doctor_visit_charges', 0.0)
                special_visit_charges = get_s('special_visit_charges', 0.0)
                monitor_charges = get_s('monitor_charges', 0.0)
                oxygen_charges = get_s('oxygen_charges', 0.0)
                radiology_charges = get_s('radiology_charges', 0.0)
                ecg_charges = get_s('ecg_charges', 0.0)
                bsl_charges = get_s('bsl_charges', 0.0)
                other_charges = get_s('other_charges', 0.0)

                # Totals (Persisted in previous step)
                total_hospital_bill_amount = get_s('total_hospital_bill_amount', 0.0)
                pathology_charges_total = get_s('pathology_charges_total', 0.0)
                medicine_charges = get_s('total_medicine_charges', 0.0)
                stay_grand_total = get_s('stay_grand_total', 0.0)
                grand_total_claim = total_hospital_bill_amount + medicine_charges # Re-calc safe

                total_hospital_bill_90_percent = get_s('total_hospital_bill_90_percent', 0.0)
                medicine_charges_90_percent = round(medicine_charges * 0.90)
                external_lab_charges_90_percent = 0.0 # Removed feature
                
                gw_total_95_percent = round(float(get_s('gw_total', 0) or 0) * 0.95)
                semi_total_90_percent = round(float(get_s('semi_total', 0) or 0) * 0.90)
                pvt_total_75_percent = round(float(get_s('pvt_total', 0) or 0) * 0.75)
                
                total_room_rent_admissible = get_s('total_room_rent_admissible', 0.0)
                
                # Re-calculate totals just in case
                total_other_charges_admissible = round(total_hospital_bill_90_percent + medicine_charges_90_percent)
                grand_total_admissible_amount = round(total_other_charges_admissible + total_room_rent_admissible)

                
                # A. Load Template & Map Variables
                script_dir = os.path.dirname(__file__)
                # A. Load Template & Map Variables
                script_dir = os.path.dirname(__file__)
                # USE CLONED TEMPLATE
                template_path = os.path.join(script_dir, "template_cloned.docx")
                if not os.path.exists(template_path):
                     # Fallback
                     template_path = os.path.join(script_dir, "template.docx")

                from docxtpl import DocxTemplate
                doc = DocxTemplate(template_path)
                
                context = {
                    'emp_name_designation_marathi': emp_name_designation_marathi,
                    # ... [existing context mappings] ...
                    # Ensure pathology_receipts is passed for safety, though cleaner template ignores it
                    'pathology_receipts': st.session_state['pathology_receipts'], 
                    # ...
                    'total_hospital_bill_amount': f"{total_hospital_bill_amount:.2f}",
                }
                
                # 1. Render content (fills headers, totals, etc.)
                doc.render(context)
                
                # 2. Save Final DOCX for PDF conversion
                temp_docx_path = os.path.join(script_dir, "temp_filled_form.docx")
                doc.save(temp_docx_path)
                
                # B. Convert to PDF
                # ... [existing conversion] ...
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
                    # Pathology List Context
                    'pathology_receipts': st.session_state['pathology_receipts'], # List of objects
                    'pathology': st.session_state['pathology_receipts'], # Alias to potential template list name

                    'pathology_charges': pathology_charges_total,
                    'PATHOLOGY_CHARGES': pathology_charges_total, # Alias
                    'PATHOLOGY CHARGES': pathology_charges_total, # For case-insensitive template support
                    # 'lab_charges': internal_lab_charges, # Removed as per request
                    # 'external_lab_charges': external_lab_charges, # Removed as per request
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
                        st.session_state['pdf_filename'] = f"Medical_Claim_{emp_name_english.replace(' ', '_') if emp_name_english else 'Form'}.pdf"
                        st.success("✅ PDF generated successfully!")

                        # Show download button immediately
                        with open(st.session_state['pdf_path'], "rb") as pdf_file:
                            st.download_button(
                                label="📥 Download Reimbursement PDF",
                                data=pdf_file,
                                file_name=st.session_state['pdf_filename'],
                                mime="application/pdf",
                                key="pdf_download_main"
                            )
                    except Exception as e:
                        st.error(f"⚠️ PDF Conversion Failed: {e}")
                        st.info("The Word file was created successfully, but PDF conversion failed. You can download the Word file below.")
                else:
                    st.warning("⚠️ LibreOffice not found. PDF creation skipped.")
                    st.info("The Word file was created successfully. Please download it below.")
                
                # ALWAYS SHOW DOCX DOWNLOAD
                with open(temp_docx, "rb") as docx_file:
                    st.download_button(
                        label="📥 Download Word Document (.docx)",
                        data=docx_file,
                        file_name=f"Medical_Claim_{emp_name_english if emp_name_english else 'Form'}.docx",
                        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        key="docx_download"
                    )

            except Exception as e:
                st.error(f"Error: {e}")

# Tab 2 'Expense Calculator' removed as per request

# Navigation Buttons (Global Footer)
st.divider()
col_prev, col_spacer, col_next = st.columns([1, 4, 1])

with col_prev:
    if current_step > 0:
        st.button("⬅️ Previous", on_click=go_prev, key="nav_prev", use_container_width=True)

with col_next:
    if current_step < len(steps) - 1:
        st.button("Next ➡️", on_click=go_next, type="primary", key="nav_next", use_container_width=True)

