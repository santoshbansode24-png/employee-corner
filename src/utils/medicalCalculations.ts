export interface Receipt {
    receipt_no: string;
    date: string;
    amount: string | number;
}

export interface MedicalFormData {
    // Step 1: Employee & Patient
    emp_name_designation_marathi: string;
    office_name_marathi: string;
    emp_name_english: string;
    emp_designation_english: string;
    basic_pay: string | number;
    appointment_date: string;
    res_address_english: string;
    patient_name_english: string;
    patient_name: string;
    patient_relation: string;
    patient_age: string | number;
    place_of_illness: string;
    hospital_name_english: string;
    treating_doctor_name_english: string;
    admit_date_from: string;
    admit_date_to: string;

    // Step 2: Hospital Stay
    gw_days: string | number; gw_rates: string | number; gw_total: string | number;
    semi_days: string | number; semi_rates: string | number; semi_total: string | number;
    pvt_days: string | number; pvt_rates: string | number; pvt_total: string | number;
    icu_days: string | number; icu_rates: string | number; icu_total: string | number;

    // Step 3: Lists
    pathology_receipts: Receipt[];
    medicine_receipts: Receipt[];

    // Step 4: Bill Charges (Procedural)
    admission_charges: string | number;
    surgeon_charges: string | number;
    asst_surgeon_charges: string | number;
    anesthesia_charges: string | number;
    ot_charges: string | number;
    ot_assistant_charges: string | number;
    rmo_charges: string | number;
    nursing_charges: string | number;
    iv_infusion_charges: string | number;
    doctor_visit_charges: string | number;
    special_visit_charges: string | number;
    monitor_charges: string | number;
    oxygen_charges: string | number;
    radiology_charges: string | number;
    ecg_charges: string | number;
    bsl_charges: string | number;
    other_charges: string | number;

    // Family Members
    m_name_1: string; m_rel_1: string; m_age_1: string | number;
    m_name_2: string; m_rel_2: string; m_age_2: string | number;
    m_name_3: string; m_rel_3: string; m_age_3: string | number;
    m_name_4: string; m_rel_4: string; m_age_4: string | number;
    m_name_5: string; m_rel_5: string; m_age_5: string | number;
}

export interface MedicalTotals {
    stay_total: number;
    path_total: number;
    med_total: number;
    procedural_total: number;
    form_d_total: number;
    grand_claim: number;
    admissible_stay: number;
    admissible_procedural: number;
    admissible_meds: number;
    admissible_path: number;
    grand_admissible: number;
}

export const initialMedicalFormData: MedicalFormData = {
    emp_name_designation_marathi: '', office_name_marathi: '', emp_name_english: '', emp_designation_english: '', basic_pay: '', appointment_date: '', res_address_english: '',
    patient_name_english: '', patient_name: '', patient_relation: '', patient_age: '', place_of_illness: '', hospital_name_english: '', treating_doctor_name_english: '', admit_date_from: '', admit_date_to: '',
    gw_days: '', gw_rates: '', gw_total: '', semi_days: '', semi_rates: '', semi_total: '', pvt_days: '', pvt_rates: '', pvt_total: '', icu_days: '', icu_rates: '', icu_total: '',
    pathology_receipts: [], medicine_receipts: [],
    admission_charges: 0, surgeon_charges: 0, asst_surgeon_charges: 0, anesthesia_charges: 0, ot_charges: 0, ot_assistant_charges: 0, rmo_charges: 0, nursing_charges: 0, iv_infusion_charges: 0, doctor_visit_charges: 0, special_visit_charges: 0, monitor_charges: 0, oxygen_charges: 0, radiology_charges: 0, ecg_charges: 0, bsl_charges: 0, other_charges: 0,
    m_name_1: '', m_rel_1: '', m_age_1: '', m_name_2: '', m_rel_2: '', m_age_2: '', m_name_3: '', m_rel_3: '', m_age_3: '', m_name_4: '', m_rel_4: '', m_age_4: '', m_name_5: '', m_rel_5: '', m_age_5: ''
};

export const calculateMedicalTotals = (data: MedicalFormData): MedicalTotals => {
    const stay_total = (Number(data.gw_total) || 0) + (Number(data.semi_total) || 0) + (Number(data.pvt_total) || 0) + (Number(data.icu_total) || 0);
    const path_total = data.pathology_receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const med_total = data.medicine_receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    const procedural_fields: (keyof MedicalFormData)[] = [
        'admission_charges', 'surgeon_charges', 'asst_surgeon_charges', 'anesthesia_charges', 'ot_charges', 'ot_assistant_charges',
        'rmo_charges', 'nursing_charges', 'iv_infusion_charges', 'doctor_visit_charges', 'special_visit_charges', 'monitor_charges',
        'oxygen_charges', 'radiology_charges', 'ecg_charges', 'bsl_charges', 'other_charges'
    ];
    const procedural_total = procedural_fields.reduce((sum, field) => sum + (Number(data[field]) || 0), 0);

    const form_d_total = procedural_total + stay_total;
    const grand_claim = form_d_total + med_total + path_total;

    // Admissibility Limits (Govt Rules)
    const admissible_stay = (Number(data.gw_total) * 0.95 || 0) + (Number(data.semi_total) * 0.90 || 0) + (Number(data.pvt_total) * 0.75 || 0) + (Number(data.icu_total) * 1.0 || 0);
    
    // Most procedural, meds, and path are capped at 90% typically unless special case
    const admissible_procedural = procedural_total * 0.90;
    const admissible_meds = med_total * 0.90;
    const admissible_path = path_total * 0.90;

    const grand_admissible = admissible_stay + admissible_procedural + admissible_meds + admissible_path;

    return {
        stay_total, path_total, med_total, procedural_total, form_d_total, grand_claim,
        admissible_stay, admissible_procedural, admissible_meds, admissible_path, grand_admissible
    };
};
