import streamlit as st
import datetime
import os
import subprocess
import sys
import shutil

try:
    import config
except ImportError:
    import sys
    sys.path.append(os.path.dirname(__file__))
    import config

# 1. Page Setup
st.set_page_config(page_title="Medical Reimbursement", layout="wide", page_icon="🏥")

# --- PREMIUM DIGITAL VIBE CSS ---
st.markdown("""
    <style>
        /* FONTS */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap');
        
        * {
            font-family: 'Inter', sans-serif;
        }

        /* APP BACKGROUND */
        .stApp {
            background: #f0f2f5; 
        }

        /* TITLE CARD */
        .title-card {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            padding: 2rem;
            border-radius: 12px;
            color: white;
            text-align: center;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .title-card h1 {
            color: white !important;
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            margin: 0;
            font-size: 2.2rem;
        }
        .title-card p {
            color: rgba(255, 255, 255, 0.9);
            margin-top: 5px;
            font-size: 1rem;
        }
        
        /* NAVIGATION RADIO AS TABS (Simulating st.tabs) */
        div.row-widget.stRadio > div[role="radiogroup"] {
            flex-direction: row;
            background-color: white;
            padding: 5px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            gap: 5px;
            overflow-x: auto; /* Handle overflow nicely */
            border: 1px solid #e2e8f0;
        }
        
        /* HIDE RADIO CIRCLE */
        div.row-widget.stRadio > div[role="radiogroup"] > label > div:first-child {
            display: none !important;
            width: 0 !important;
        }

        /* STYLE LABELS AS TABS */
        div.row-widget.stRadio > div[role="radiogroup"] > label {
            background-color: transparent;
            border: 1px solid transparent;
            padding: 10px 15px;
            border-radius: 8px;
            font-weight: 600;
            color: #64748b;
            text-align: center;
            transition: all 0.2s;
            margin-right: 0 !important;
            cursor: pointer;
            white-space: nowrap;
            flex: 1; /* Distribute evenly */
        }
        
        div.row-widget.stRadio > div[role="radiogroup"] > label:hover {
            background-color: #f1f5f9;
            color: #1e293b;
        }

        /* SELECTED TAB STATE */
        /* We use [data-checked="true"] if available in newer Streamlit versions, 
           or rely on the internal input state. 
           Since CSS :has() is widely supported now: 
        */
        div.row-widget.stRadio > div[role="radiogroup"] > label:has(input:checked) {
             background-color: #eff6ff !important; /* Light Blue */
             color: #2563eb !important; /* Royal Blue */
             border: 1px solid #bfdbfe !important;
             box-shadow: 0 1px 2px rgba(37, 99, 235, 0.1);
        }
        
        /* Fallback for older browsers (optional) - The radio input itself is hidden but handles state */

        /* INPUT FIELDS - FINAL ULTRA-WHITE FIX */
        /* 1. Target the high-level Streamlit wrappers */
        .stTextInput > div > div,
        .stNumberInput > div > div, 
        .stSelectbox > div > div {
            background-color: #ffffff !important;
            border: 1px solid #94a3b8 !important;
        }

        /* 2. Target the BaseWeb Low-level components */
        div[data-baseweb="input"],
        div[data-baseweb="base-input"], 
        div[data-baseweb="select"] > div {
             background-color: #ffffff !important;
        }

        /* 3. Target the actual INPUT tag */
        input, 
        input:focus,
        input[type="text"],
        input[type="number"],
        # .stDateInput input <-- Specific targeting if needed
        input[inputmode="numeric"] {
            background-color: #ffffff !important;
            color: #000000 !important;
        }

        /* Focus State for Wrappers */
        .stTextInput > div > div:focus-within,
        .stNumberInput > div > div:focus-within {
            border-color: #2563eb !important; 
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2) !important;
        }

        /* CARDS (Containers) */
        [data-testid="stVerticalBlock"] > [style*="flex-direction: column;"] > [data-testid="stVerticalBlock"] {
            background: white;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            margin-bottom: 15px;
        }

        /* SECTION HEADERS (H3/H4) */
        h3, h4 {
            color: #0f172a;
            font-family: 'Outfit', sans-serif;
            font-weight: 600;
            margin-top: 0 !important;
            padding-bottom: 10px;
            border-bottom: 2px solid #f1f5f9;
            margin-bottom: 15px !important;
        }

        /* METRICS */
        [data-testid="stMetricValue"] {
            font-family: 'Outfit', sans-serif;
            color: #059669; /* Emerald Green */
            font-weight: 700;
        }

        /* BUTTONS */
        div.stButton > button {
            border-radius: 8px;
            font-weight: 600;
            border: none;
            padding: 0.5rem 1rem;
            transition: transform 0.1s;
        }
        div.stButton > button:active {
            transform: scale(0.98);
        }
        
        /* Custom Next/Prev Button Styling Override */
        /* We will target specific keys if possible, or just general Primary/Secondary styles */

    </style>
""", unsafe_allow_html=True)

# --- HEADER ---
st.markdown("""
<div class="title-card">
    <h1>Medical Reimbursement Generator</h1>
    <p>Fill the details below to generate your claim proposal instantly.</p>
</div>
""", unsafe_allow_html=True)

# --- STATE MANAGEMENT ---
if 'form_data' not in st.session_state:
    st.session_state['form_data'] = {}

# Initialize ALL widget keys to prevent data loss on tab switch
def init_keys():
    defaults = {
        # Tab 1: Employee & Patient
        'emp_name_designation_marathi': '', 'office_name_marathi': '', 
        'emp_name_english': '', 'emp_designation_english': '', 
        'basic_pay': '', 'appointment_date': None, 'res_address_english': '',
        'patient_name_english': '', 'patient_name': '', 
        'patient_relation': '', 'patient_age': '', 'place_of_illness': '',
        'hospital_name_english': '', 'treating_doctor_name_english': '',
        'admit_date_from': None, 'admit_date_to': None,

        # Tab 2: Hospital Stay (Ranges initialized as empty lists)
        'gw_range': [], 'gw_days': '', 'gw_rates': '', 'gw_total': '',
        'semi_range': [], 'semi_days': '', 'semi_rates': '', 'semi_total': '',
        'pvt_range': [], 'pvt_days': '', 'pvt_rates': '', 'pvt_total': '',
        'icu_range': [], 'icu_days': '', 'icu_rates': '', 'icu_total': '',
        'stay_grand_total': 0,

        # Tab 3: Lists (Already handled, but good to be explicit)
        'pathology_receipts': [], 'medicine_receipts': [],

        # Tab 4: Form D Charges
        'admission_charges': 0.0, 'total_staying_charges': 0.0,
        'surgeon_charges': 0.0, 'asst_surgeon_charges': 0.0,
        'anesthesia_charges': 0.0, 'ot_charges': 0.0,
        'ot_assistant_charges': 0.0, 'rmo_charges': 0.0,
        'nursing_charges': 0.0, 'iv_infusion_charges': 0.0,
        'doctor_visit_charges': 0.0, 'special_visit_charges': 0.0,
        'monitor_charges': 0.0, 'oxygen_charges': 0.0,
        'radiology_charges': 0.0, 'ecg_charges': 0.0,
        'bsl_charges': 0.0, 'other_charges': 0.0,
        'total_hospital_bill_amount': 0.0
    }
    
    # Family Members (1-5)
    for i in range(1, 6):
        defaults[f'm_name_{i}'] = ''
        defaults[f'm_rel_{i}'] = ''
        defaults[f'm_age_{i}'] = ''

    for key, default_val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = default_val

# Run init only once per session to prevent any overwriting risks (though logic is safe)
if 'state_initialized' not in st.session_state:
    init_keys()
    st.session_state['state_initialized'] = True

# Defining Tabs as a constant list
NAV_TABS = [
    "👤 Employee & Patient", 
    "🏥 Hospital Stay", 
    "💊 Medicines & Path", 
    "🧾 Bill Charges", 
    "✅ Summary & PDF"
]

# Ensure navigation state exists
if 'nav_active_tab' not in st.session_state:
    st.session_state['nav_active_tab'] = NAV_TABS[0]

# --- HELPER FUNCTIONS ---
def safe_float(val):
    try:
        return float(val) if val else 0.0
    except (ValueError, TypeError):
        return 0.0

def update_days(range_key, days_key, rate_key, total_key):
    dates = st.session_state.get(range_key)
    if dates:
        if len(dates) == 2:
            st.session_state[days_key] = str((dates[1] - dates[0]).days + 1)
        elif len(dates) == 1:
            st.session_state[days_key] = "1"
    
    # Auto-calculate total if rate exists
    d = safe_float(st.session_state.get(days_key, 0))
    r = safe_float(st.session_state.get(rate_key, 0))
    if d and r:
        st.session_state[total_key] = str(int(d * r))
        
def calculate_grand_total_stay():
    gw = safe_float(st.session_state.get('gw_total', 0))
    semi = safe_float(st.session_state.get('semi_total', 0))
    pvt = safe_float(st.session_state.get('pvt_total', 0))
    icu = safe_float(st.session_state.get('icu_total', 0))
    return int(gw + semi + pvt + icu)

def nav_next(curr_index):
    if curr_index < len(NAV_TABS) - 1:
        st.session_state['nav_active_tab'] = NAV_TABS[curr_index + 1]

def nav_prev(curr_index):
    if curr_index > 0:
        st.session_state['nav_active_tab'] = NAV_TABS[curr_index - 1]

# --- TOP NAVIGATION (Radio as Tabs) ---
# We use radio but style it horizontally. 
# Key points to 'nav_active_tab' so it auto-updates when we change state via buttons.
selected_tab = st.radio(
    "Navigation", 
    NAV_TABS, 
    horizontal=True, 
    key="nav_active_tab", 
    label_visibility="collapsed"
)

# Determine current index for logic
current_idx = NAV_TABS.index(selected_tab)

# --- CONTAINER FOR CONTENT ---
# We use a container to keep spacing consistent
with st.container():
    
    # ================= TAB 1: EMPLOYEE & PATIENT =================
    if selected_tab == NAV_TABS[0]:
        col1, col2 = st.columns(2, gap="medium")
        
        with col1:
            st.markdown("### 👨‍💼 Employee Details (कर्मचारी)")
            st.text_input("Name & Designation (Marathi)", key="emp_name_designation_marathi", placeholder="नाव व पदनाम (मराठी)")
            st.text_input("Office Name (Marathi)", key="office_name_marathi", placeholder="कार्यालयाचे नाव")
            st.text_input("Employee Name (English)", key="emp_name_english")
            st.text_input("Designation (English)", key="emp_designation_english")
            
            row_a1, row_a2 = st.columns(2)
            with row_a1: st.text_input("Basic Pay (मूळ वेतन)", key="basic_pay")
            with row_a2: st.date_input("Appt Date (नियुक्ती)", key="appointment_date", value=None)
            
            st.text_input("Residential Address", key="res_address_english")

        with col2:
            st.markdown("### 🤒 Patient Details (रुग्ण)")
            st.text_input("Patient Name (English)", key="patient_name_english")
            st.text_input("Patient Name (Marathi)", key="patient_name")
            
            row_b1, row_b2 = st.columns(2)
            with row_b1: st.text_input("Relation (नाते)", key="patient_relation")
            with row_b2: st.text_input("Age (वय)", key="patient_age")
            
            st.text_input("Place of Illness (आजाराचे ठिकाण)", key="place_of_illness")
            
            st.markdown("### 🏥 Admission Info")
            st.text_input("Hospital Name (English)", key="hospital_name_english")
            st.text_input("Doctor Name (English)", key="treating_doctor_name_english")
            
            row_c1, row_c2 = st.columns(2)
            with row_c1: st.date_input("Admitted From", key="admit_date_from", value=None)
            with row_c2: st.date_input("Discharged On", key="admit_date_to", value=None)


    # ================= TAB 2: HOSPITAL STAY =================
    elif selected_tab == NAV_TABS[1]:
        st.markdown("### 🛌 Room Rent Details")
        st.info("Enter details for applicable wards. Totals update automatically.")
        
        # helper for rows
        def room_row(label, prefix, title_marathi):
            st.markdown(f"**{label}** <span style='color:gray; font-size:0.8em'>({title_marathi})</span>", unsafe_allow_html=True)
            c1, c2, c3, c4 = st.columns([2, 1, 1, 1])
            c1.date_input("Date Range", key=f"{prefix}_range", value=[], format="DD/MM/YYYY", 
                        on_change=update_days, args=(f"{prefix}_range", f"{prefix}_days", f"{prefix}_rates", f"{prefix}_total"), label_visibility="collapsed")
            c2.text_input("Days", key=f"{prefix}_days", placeholder="Days", label_visibility="collapsed", on_change=update_days, args=(f"{prefix}_range", f"{prefix}_days", f"{prefix}_rates", f"{prefix}_total"))
            c3.text_input("Rate", key=f"{prefix}_rates", placeholder="Rate", label_visibility="collapsed", on_change=update_days, args=(f"{prefix}_range", f"{prefix}_days", f"{prefix}_rates", f"{prefix}_total"))
            c4.text_input("Total", key=f"{prefix}_total", placeholder="Total", label_visibility="collapsed")
            st.divider()

        room_row("1. General Ward", "gw", "जनरल वॉर्ड")
        room_row("2. Semi-Private", "semi", "सेमीप्रायव्हेट")
        room_row("3. Private Room", "pvt", "प्रायव्हेट रूम")
        room_row("4. ICU", "icu", "अतिदक्षता कक्ष")
        
        stay_total = calculate_grand_total_stay()
        st.session_state['stay_grand_total'] = stay_total
        
        st.markdown(f"""
        <div style="text-align:right; font-size:1.2rem; font-weight:bold; color:#1e3a8a; padding:10px; background:#e0f2fe; border-radius:8px;">
            Total Room Rent: ₹ {stay_total}
        </div>
        """, unsafe_allow_html=True)

    # ================= TAB 3: MEDICINES & PATH =================
    elif selected_tab == NAV_TABS[2]:
        c_path, c_med = st.columns(2)
        
        # --- PATHOLOGY ---
        with c_path:
            st.markdown("### 🔬 Pathology Receipts")
            
            if 'pathology_receipts' not in st.session_state: st.session_state['pathology_receipts'] = []
            
            with st.expander("➕ Add / Manage Pathology", expanded=True):
                with st.form("add_path_form", clear_on_submit=True):
                    pc1, pc2 = st.columns(2)
                    p_rec = pc1.text_input("Receipt No")
                    p_date = pc2.date_input("Date", value=None)
                    p_amt = st.number_input("Amount (₹)", min_value=0.0, step=10.0)
                    
                    if st.form_submit_button("Add Receipt"):
                        st.session_state['pathology_receipts'].append({'receipt_no': p_rec, 'date': p_date, 'amount': p_amt})
                        st.rerun()

            path_total = 0.0
            if st.session_state['pathology_receipts']:
                st.markdown("###### Added Receipts:")
                for i, p in enumerate(st.session_state['pathology_receipts']):
                    path_total += p['amount']
                    st.caption(f"{i+1}. Rect: **{p['receipt_no']}** | ₹ {p['amount']}")
            
            st.session_state['pathology_charges_total'] = path_total
            st.metric("Total Pathology", f"₹ {path_total:,.2f}")

        # --- MEDICINES ---
        with c_med:
            st.markdown("### 💊 Medicine Receipts")
            if 'medicine_receipts' not in st.session_state: st.session_state['medicine_receipts'] = []

            with st.expander("➕ Add / Manage Medicines", expanded=True):
                with st.form("add_med_form", clear_on_submit=True):
                    mc1, mc2 = st.columns(2)
                    m_rec = mc1.text_input("Receipt No")
                    m_date = mc2.date_input("Date", value=None)
                    m_amt = st.number_input("Amount (₹)", min_value=0.0, step=10.0)
                    
                    if st.form_submit_button("Add Receipt"):
                        st.session_state['medicine_receipts'].append({'receipt_no': m_rec, 'date': m_date, 'amount': m_amt})
                        st.rerun()
            
            med_total = 0.0
            if st.session_state['medicine_receipts']:
                st.markdown("###### Added Receipts:")
                for i, m in enumerate(st.session_state['medicine_receipts']):
                    med_total += m['amount']
                    st.caption(f"{i+1}. Rect: **{m['receipt_no']}** | ₹ {m['amount']}")

            st.session_state['total_medicine_charges'] = med_total
            st.metric("Total Medicines", f"₹ {med_total:,.2f}")


    # ================= TAB 4: BILL CHARGES (FORM D) =================
    elif selected_tab == NAV_TABS[3]:
        st.markdown("### 🧾 Form D Details (Hospital Bill)")
        
        c_d1, c_d2 = st.columns(2)
        with c_d1:
            admission = st.number_input("Admission Charges", key="admission_charges")
            staying = st.number_input("Staying Charges (Auto)", value=float(st.session_state.get('stay_grand_total',0)), disabled=True, key="total_staying_charges")
            surgeon = st.number_input("Surgeon Charges", key="surgeon_charges")
            asst = st.number_input("Asst. Surgeon", key="asst_surgeon_charges")
            anesthesia = st.number_input("Anesthesia", key="anesthesia_charges")
            ot = st.number_input("OT Charges", key="ot_charges")
            ot_asst = st.number_input("OT Assistant", key="ot_assistant_charges")
            rmo = st.number_input("RMO Charges", key="rmo_charges")
            nurs = st.number_input("Nursing Charges", key="nursing_charges")

        with c_d2:
            iv = st.number_input("IV/Transfusion", key="iv_infusion_charges")
            visit = st.number_input("Doctor Visit Charges", key="doctor_visit_charges")
            special = st.number_input("Special Visit Charges", key="special_visit_charges")
            monitor = st.number_input("Monitor Charges", key="monitor_charges")
            oxygen = st.number_input("Oxygen Charges", key="oxygen_charges")
            rad = st.number_input("Radiology Charges", key="radiology_charges")
            ecg = st.number_input("ECG Charges", key="ecg_charges")
            bsl = st.number_input("BSL Charges", key="bsl_charges")
            other = st.number_input("Other Charges", key="other_charges")
        
        form_d_total = (
            admission + staying + surgeon + asst + anesthesia + ot + ot_asst + rmo + nurs +
            iv + visit + special + monitor + oxygen + rad + ecg + bsl + other
        )
        st.session_state['total_hospital_bill_amount'] = form_d_total
        st.markdown("---")
        st.info(f"**Grand Total (Form D):** ₹ {form_d_total:,.2f}")


    # ================= TAB 5: SUMMARY & PDF =================
    elif selected_tab == NAV_TABS[4]:
        st.markdown("### 📝 Final Review & Generate")
        
        # Calc logic repeated...
        stay_total = st.session_state.get('stay_grand_total', 0)
        gw = safe_float(st.session_state.get('gw_total',0)) * 0.95
        semi = safe_float(st.session_state.get('semi_total',0)) * 0.90
        pvt = safe_float(st.session_state.get('pvt_total',0)) * 0.75
        icu = safe_float(st.session_state.get('icu_total',0)) * 1.0
        admissible_rent = gw + semi + pvt + icu
        
        form_d_total = st.session_state.get('total_hospital_bill_amount', 0.0)
        form_d_excl_stay = form_d_total - stay_total
        admissible_bill = form_d_excl_stay * 0.90
        
        med_total = st.session_state.get('total_medicine_charges', 0.0)
        admissible_meds = med_total * 0.90
        
        grand_claim = form_d_total + med_total
        grand_admissible = admissible_rent + admissible_bill + admissible_meds
        
        st.markdown(f"""
        <div style="background:white; padding:20px; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:20px;">
            <h3 style="margin:0; color:#1e3a8a;">💰 Claim Summary</h3>
            <hr style="margin:10px 0;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span>Total Hospital Bill (Form D):</span>
                <b>₹ {form_d_total:,.2f}</b>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span>Total Medicines:</span>
                <b>₹ {med_total:,.2f}</b>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:1.1em; color:#059669; margin-top:10px;">
                <span><b>Total Claim Amount:</b></span>
                <span><b>₹ {grand_claim:,.2f}</b></span>
            </div>
            <hr style="margin:10px 0;">
             <div style="display:flex; justify-content:space-between; color:#64748b; font-size:0.9em;">
                <span><i>Est. Admissible Amount:</i></span>
                <span><i>₹ {grand_admissible:,.2f}</i></span>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        with st.expander("👨‍👩‍👧‍👦 Family Declaration Details (Optional)", expanded=False):
            fm_cols = st.columns(5)
            family_members = []
            for i in range(5):
                with fm_cols[i]:
                     n = st.text_input("Name", key=f"m_name_{i+1}", label_visibility="collapsed")
                     r = st.text_input("Rel", key=f"m_rel_{i+1}", label_visibility="collapsed")
                     a = st.text_input("Age", key=f"m_age_{i+1}", label_visibility="collapsed")
                     family_members.append({'name':n, 'rel':r, 'age':a})

        if st.button("📄 Generate Reimbursement PDF", type="primary", use_container_width=True):
             with st.spinner("Processing..."):
                try:
                    # Helper to get from session state safely
                    def get_s(k, d=""): return st.session_state.get(k, d)
                    def get_f(k, d=0.0): return float(st.session_state.get(k, d))

                    # Retrieve Totals from Session State (calculated in previous tabs)
                    # We use get() with 0.0 default to avoid NameErrors if tabs weren't visited
                    stay_total = safe_float(st.session_state.get('stay_grand_total', 0.0))
                    med_total = safe_float(st.session_state.get('total_medicine_charges', 0.0))
                    path_total = safe_float(st.session_state.get('pathology_charges_total', 0.0))
                    
                    # Form D Total (Bill)
                    form_d_total = safe_float(st.session_state.get('total_hospital_bill_amount', 0.0))
                    
                    # Recalculate Grand Claim based on retrieved values
                    grand_claim = form_d_total + med_total
                    
                    # Helper for Date Formatting
                    def fmt_date(k):
                        d = st.session_state.get(k)
                        return d.strftime("%d-%m-%Y") if isinstance(d, datetime.date) else ""

                    def get_range_dates(k):
                        # Returns (from, to) strings
                        rng = st.session_state.get(k)
                        if rng and isinstance(rng, list):
                            if len(rng) == 2:
                                return rng[0].strftime("%d-%m-%Y"), rng[1].strftime("%d-%m-%Y")
                            elif len(rng) == 1:
                                return rng[0].strftime("%d-%m-%Y"), rng[0].strftime("%d-%m-%Y")
                        return "", ""

                    # Construct Context from Session State (since local vars are out of scope)
                    context = {
                        # --- EMPLOYEE DETAILS ---
                        'emp_name_english': get_s('emp_name_english'),
                        'emp_designation_english': get_s('emp_designation_english'),
                        'basic_pay': get_s('basic_pay'),
                        
                        # Marathi & Template Variances
                        'emp_name_designation_marathi': get_s('emp_name_designation_marathi'),
                        'emp_name_marathi': get_s('emp_name_designation_marathi'), # Alias
                        'emp_designation_marathi': '', # If separate field needed, currently merged in name
                        
                        'office_name_marathi': get_s('office_name_marathi'),
                        'emp_office_name_marathi': get_s('office_name_marathi'), # Inspect shows this key
                        'office_name_english': get_s('office_name_marathi'), # Fallback
                        
                        'res_address': get_s('res_address_english'),
                        'res_address_english': get_s('res_address_english'),
                        'res_address_marathi': get_s('res_address_english'), # Fallback
                        
                        'appointment_date': fmt_date('appointment_date'),
                        'retirement_date': '', # Optional/Not captured
                        
                        # --- PATIENT DETAILS ---
                        'patient_name': get_s('patient_name') or get_s('patient_name_english'),
                        'patient_name_marathi': get_s('patient_name'),
                        'patient_name_english': get_s('patient_name_english'),
                        
                        'relation': get_s('patient_relation'),
                        'patient_relation': get_s('patient_relation'),
                        'patient_relation_marathi': get_s('patient_relation'), # Fallback
                        
                        'patient_age': get_s('patient_age'),
                        'place_of_illness': get_s('place_of_illness'),
                        'work_place_marathi': get_s('office_name_marathi'), # Fallback for "Place of work" if 3/4 is blank
                        'cert_place': get_s('place_of_illness'), # Fallback for certificate place
                        'cert_date': datetime.datetime.now().strftime("%d-%m-%Y"),

                        # --- HOSPITAL INFO ---
                        'hospital_name': get_s('hospital_name_english'),
                        'hospital_name_english': get_s('hospital_name_english'),
                        'hospital_name_marathi': get_s('hospital_name_english'), # Fallback
                        'hosp_name_marathi': get_s('hospital_name_english'), # Alias seen in inspect
                        
                        'doctor_name': get_s('treating_doctor_name_english'),
                        'treating_doctor_name_english': get_s('treating_doctor_name_english'),
                        'dr_name_marathi': get_s('treating_doctor_name_english'), # Fallback
                        
                        'consult_doctor_hospital': get_s('hospital_name_english'), # Likely for "Consulting Room/Hospital"
                        
                        'admit_from': fmt_date('admit_date_from'),
                        'admit_date_from': fmt_date('admit_date_from'),
                        
                        'admit_to': fmt_date('admit_date_to'),
                        'admit_date_to': fmt_date('admit_date_to'),
                        
                        # --- TOTALS ---
                        'total_claim_amount': grand_claim,
                        'grand_total_claim': grand_claim,
                        'grand_total_admissible_amount': grand_claim, # Placeholder
                        
                        'medicine_charges': med_total,
                        'medicine_charges_90_percent': med_total * 0.9,
                        
                        'pathology_charges': path_total,
                        'external_lab_charges': path_total, # Alias
                        'external_lab_charges_90_percent': path_total * 0.9,
                        
                        'stay_grand_total': stay_total,
                        'total_room_rent_admissible': stay_total, # Placeholder
                        
                        # Form D Charges (Bill)
                        'admission_charges': get_f('admission_charges'),
                        'total_staying_charges': get_f('total_staying_charges'),
                        'surgeon_charges': get_f('surgeon_charges'),
                        'asst_surgeon_charges': get_f('asst_surgeon_charges'),
                        'anesthesia_charges': get_f('anesthesia_charges'),
                        'ot_charges': get_f('ot_charges'),
                        'ot_assistant_charges': get_f('ot_assistant_charges'),
                        'rmo_charges': get_f('rmo_charges'),
                        'nursing_charges': get_f('nursing_charges'),
                        'iv_infusion_charges': get_f('iv_infusion_charges'),
                        'doctor_visit_charges': get_f('doctor_visit_charges'),
                        'special_visit_charges': get_f('special_visit_charges'),
                        'monitor_charges': get_f('monitor_charges'),
                        'oxygen_charges': get_f('oxygen_charges'),
                        'radiology_charges': get_f('radiology_charges'),
                        'ecg_charges': get_f('ecg_charges'),
                        'bsl_charges': get_f('bsl_charges'),
                        'other_charges': get_f('other_charges'),
                        
                        'total_hospital_bill_amount': form_d_total,
                        'total_hospital_bill_inc_lab': form_d_total + path_total, # Assuming this sum
                        'total_hospital_bill_90_percent': form_d_total * 0.9,

                        # Ward Details
                        'gw_days': get_s('gw_days'), 'gw_rates': get_s('gw_rates'), 'gw_total': get_s('gw_total'),
                        'gw_dates': f"{get_range_dates('gw_range')[0]} to {get_range_dates('gw_range')[1]}", # Combined string
                        
                        'semi_days': get_s('semi_days'), 'semi_rate': get_s('semi_rates'), 'semi_total': get_s('semi_total'),
                        'semi_dates': f"{get_range_dates('semi_range')[0]} to {get_range_dates('semi_range')[1]}",

                        'pvt_days': get_s('pvt_days'), 'pvt_rates': get_s('pvt_rates'), 'pvt_total': get_s('pvt_total'),
                        'pvt_dates': f"{get_range_dates('pvt_range')[0]} to {get_range_dates('pvt_range')[1]}",

                        'icu_days': get_s('icu_days'), 'icu_rates': get_s('icu_rates'), 'icu_total': get_s('icu_total'),
                        'icu_dates': f"{get_range_dates('icu_range')[0]} to {get_range_dates('icu_range')[1]}",
                        
                        # Tables
                        'medicine_receipts': st.session_state.get('medicine_receipts', []),
                        'pathology_receipts': st.session_state.get('pathology_receipts', []),
                        
                        # Family Members Flattened (1-5)
                        'mem_name1': get_s('m_name_1'), 'mem_rel1': get_s('m_rel_1'), 'mem_age1': get_s('m_age_1'), 'mem_job1': '',
                        'mem_name2': get_s('m_name_2'), 'mem_rel2': get_s('m_rel_2'), 'mem_age2': get_s('m_age_2'), 'mem_job2': '',
                        'mem_name3': get_s('m_name_3'), 'mem_rel3': get_s('m_rel_3'), 'mem_age3': get_s('m_age_3'), 'mem_job3': '',
                        'mem_name4': get_s('m_name_4'), 'mem_rel4': get_s('m_rel_4'), 'mem_age4': get_s('m_age_4'), 'mem_job4': '',
                        'mem_name5': get_s('m_name_5'), 'mem_rel5': get_s('m_rel_5'), 'mem_age5': get_s('m_age_5'), 'mem_job5': '',
                        'family_members': family_members,
                    }
                    
                    # File Generation
                    script_dir = os.path.dirname(__file__)
                    template_path = os.path.join(script_dir, "template_fixed.docx")
                    if not os.path.exists(template_path):
                         template_path = os.path.join(script_dir, "template_cloned.docx")
                         if not os.path.exists(template_path):
                                template_path = os.path.join(script_dir, "template.docx")

                    from docxtpl import DocxTemplate
                    doc = DocxTemplate(template_path)
                    
                    doc.render(context)
                    temp_docx = os.path.join(script_dir, "temp_filled_form.docx")
                    doc.save(temp_docx)
                    
                    # Convert to PDF
                    libre_office_path = "soffice"
                    if sys.platform == "win32":
                        # Attempt standard paths if not in PATH
                        possible_paths = [
                            r"C:\Program Files\LibreOffice\program\soffice.exe",
                            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe"
                        ]
                        for p in possible_paths:
                            if os.path.exists(p):
                                libre_office_path = p
                                break
                    
                    subprocess.run([libre_office_path, '--headless', '--convert-to', 'pdf:writer_pdf_Export', '--outdir', script_dir, temp_docx], check=True)
                    
                    pdf_path = os.path.join(script_dir, "temp_filled_form.pdf")
                    
                    with open(pdf_path, "rb") as f:
                         st.download_button("⬇️ Download PDF", f, file_name="Medical_Claim.pdf", mime="application/pdf")
                         
                except Exception as e:
                    st.error(f"Generation Error: {e}") 
                    if "offic" in str(e).lower():
                        st.warning("Ensure LibreOffice is installed on the server for PDF conversion.")
             

# --- BOTTOM NAVIGATION BUTTONS ---
# --- BOTTOM NAVIGATION BUTTONS ---
st.markdown("---")
# Create 3 columns: Prev, Spacer, Next
col_p, col_gap, col_n = st.columns([1, 4, 1])

# CSS for Primary Buttons (Global Premium Theme)
st.markdown("""
<style>
/* Style ALL Primary Buttons to be Premium Blue Gradient */
div.stButton > button[kind="primary"] {
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%) !important;
    color: white !important;
    border: none !important;
    font-weight: bold;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
}
div.stButton > button[kind="primary"]:hover {
    box-shadow: 0 6px 8px rgba(0,0,0,0.2);
    transform: translateY(-2px);
    color: white !important;
}
/* Focus outline fix */
div.stButton > button[kind="primary"]:focus {
    color: white !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.5) !important;
}
</style>
""", unsafe_allow_html=True)

with col_p:
    if current_idx > 0:
        # Check if we are not on first tab
        st.button("⬅️ Previous", type="primary", use_container_width=True, key="btn_nav_prev", on_click=nav_prev, args=(current_idx,))

with col_n:
    if current_idx < len(NAV_TABS) - 1:
        # Check if we are not on last tab
        st.button("Next ➡️", type="primary", use_container_width=True, key="btn_nav_next", on_click=nav_next, args=(current_idx,))

# --- DEBUG FOOTER ---
with st.expander("🛠️ Debug Information (Developer Only)", expanded=False):
    st.write("Current Session State:")
    st.json(dict(st.session_state))
