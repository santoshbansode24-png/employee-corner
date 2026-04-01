import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { MedicalFormData, MedicalTotals } from '@/utils/medicalCalculations';

const styles = StyleSheet.create({
    page: { padding: 30, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
    title: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, textDecoration: 'underline' },
    subTitle: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
    
    // Grid Setup
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc', minHeight: 25, alignItems: 'center' },
    col1: { width: '5%', padding: 4, borderRightWidth: 1, borderRightColor: '#ccc', fontSize: 10, textAlign: 'center' },
    col2: { width: '45%', padding: 4, borderRightWidth: 1, borderRightColor: '#ccc', fontSize: 10 },
    col3: { width: '50%', padding: 4, fontSize: 10 },
    
    // Tables
    tableHeaderRow: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderBottomWidth: 1, borderBottomColor: '#9ca3af', minHeight: 25, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#9ca3af' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc', minHeight: 25, alignItems: 'center' },
    tCol1: { width: '10%', padding: 4, borderRightWidth: 1, borderRightColor: '#ccc', fontSize: 9, textAlign: 'center' },
    tCol2: { width: '30%', padding: 4, borderRightWidth: 1, borderRightColor: '#ccc', fontSize: 9 },
    tCol3: { width: '30%', padding: 4, borderRightWidth: 1, borderRightColor: '#ccc', fontSize: 9 },
    tCol4: { width: '30%', padding: 4, fontSize: 9, textAlign: 'right' },
    
    footer: { position: 'absolute', bottom: 30, left: 30, right: 30, fontSize: 8, color: '#6b7280', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 5 }
});

interface MedicalPDFProps {
    data: MedicalFormData;
    totals: MedicalTotals;
}

const renderDetailRow = (num: string, label: string, value: string | number) => (
    <View style={styles.row}>
        <Text style={styles.col1}>{num}</Text>
        <Text style={styles.col2}>{label}</Text>
        <Text style={styles.col3}>{value || 'N/A'}</Text>
    </View>
);

const renderChargeRow = (num: string, label: string, claimed: number, admissible: number) => (
    <View style={styles.tableRow}>
        <Text style={[styles.tCol1, {width: '10%'}]}>{num}</Text>
        <Text style={[styles.tCol2, {width: '50%'}]}>{label}</Text>
        <Text style={[styles.tCol3, {width: '20%', textAlign: 'right'}]}>{claimed.toFixed(2)}</Text>
        <Text style={[styles.tCol4, {width: '20%', textAlign: 'right'}]}>{admissible.toFixed(2)}</Text>
    </View>
);

const MedicalPDFDocument: React.FC<MedicalPDFProps> = ({ data, totals }) => {
    return (
        <Document>
            {/* Page 1: Form C & General Info */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>ESSENTIALITY CERTIFICATE "FORM-C"</Text>
                
                <View style={{ borderTopWidth: 1, borderTopColor: '#ccc' }}>
                    {renderDetailRow('1', 'Name & Designation of Gov. Servant', data.emp_name_english + ' - ' + data.emp_designation_english)}
                    {renderDetailRow('2', 'Office Name', data.office_name_marathi)}
                    {renderDetailRow('3', 'Basic Pay', 'Rs. ' + data.basic_pay)}
                    {renderDetailRow('4', 'Date of Appointment', data.appointment_date)}
                    {renderDetailRow('5', 'Residential Address', data.res_address_english)}
                    {renderDetailRow('6', 'Name of Patient & Relationship', data.patient_name_english + ' (' + data.patient_relation + ')')}
                    {renderDetailRow('7', 'Age of Patient', data.patient_age + ' Years')}
                    {renderDetailRow('8', 'Place of Illness', data.place_of_illness)}
                    {renderDetailRow('9', 'Name of the Hospital', data.hospital_name_english)}
                    {renderDetailRow('10', 'Name of Treating Doctor', data.treating_doctor_name_english)}
                    {renderDetailRow('11', 'Period of Admission', data.admit_date_from + '  to  ' + data.admit_date_to)}
                </View>

                {/* Admission Room Matrix */}
                <Text style={[styles.subTitle, {marginTop: 20}]}>Room Charges Breakdown</Text>
                <View style={{ borderTopWidth: 1, borderTopColor: '#ccc' }}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.tCol1, {width: '10%'}]}>#</Text>
                        <Text style={[styles.tCol2, {width: '30%'}]}>Ward Type</Text>
                        <Text style={[styles.tCol3, {width: '20%'}]}>Days</Text>
                        <Text style={[styles.tCol3, {width: '20%'}]}>Rate (Rs.)</Text>
                        <Text style={[styles.tCol4, {width: '20%'}]}>Claimed (Rs.)</Text>
                    </View>
                    {(Number(data.gw_total) > 0) && renderChargeRow('1', 'General Ward', Number(data.gw_total), Number(data.gw_total) * 0.95)}
                    {(Number(data.semi_total) > 0) && renderChargeRow('2', 'Semi-Private Room', Number(data.semi_total), Number(data.semi_total) * 0.9)}
                    {(Number(data.pvt_total) > 0) && renderChargeRow('3', 'Private Room', Number(data.pvt_total), Number(data.pvt_total) * 0.75)}
                    {(Number(data.icu_total) > 0) && renderChargeRow('4', 'ICU', Number(data.icu_total), Number(data.icu_total))}
                    
                    <View style={[styles.tableRow, { backgroundColor: '#f9fafb' }]}>
                        <Text style={[styles.tCol1, {width: '60%'}]}></Text>
                        <Text style={[styles.tCol3, {width: '20%', textAlign: 'right', fontWeight: 'bold'}]}>{totals.stay_total.toFixed(2)}</Text>
                        <Text style={[styles.tCol4, {width: '20%', textAlign: 'right', fontWeight: 'bold'}]}>{totals.admissible_stay.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text>Smart Toolkit 2.0 • Medical Reimbursement Form C & D</Text>
                </View>
            </Page>

            {/* Page 2: Summary Page for Procedural Charges (Form D) */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>PROCEDURAL CHARGES (FORM D)</Text>
                
                <View style={{ borderTopWidth: 1, borderTopColor: '#ccc' }}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.tCol1, {width: '10%'}]}>Sr.</Text>
                        <Text style={[styles.tCol2, {width: '50%'}]}>Particulars of Charges</Text>
                        <Text style={[styles.tCol3, {width: '20%', textAlign: 'right'}]}>Amount Claimed</Text>
                        <Text style={[styles.tCol4, {width: '20%', textAlign: 'right'}]}>Admissible Amount</Text>
                    </View>

                    {renderChargeRow('1', 'Admission Charges', Number(data.admission_charges), Number(data.admission_charges) * 0.9)}
                    {renderChargeRow('2', 'Surgeon Charges', Number(data.surgeon_charges), Number(data.surgeon_charges) * 0.9)}
                    {renderChargeRow('3', 'Assistant Surgeon Charges', Number(data.asst_surgeon_charges), Number(data.asst_surgeon_charges) * 0.9)}
                    {renderChargeRow('4', 'Anesthesia Charges', Number(data.anesthesia_charges), Number(data.anesthesia_charges) * 0.9)}
                    {renderChargeRow('5', 'Operation Theatre Charges', Number(data.ot_charges), Number(data.ot_charges) * 0.9)}
                    {renderChargeRow('6', 'RMO Charges', Number(data.rmo_charges), Number(data.rmo_charges) * 0.9)}
                    {renderChargeRow('7', 'Nursing Charges', Number(data.nursing_charges), Number(data.nursing_charges) * 0.9)}
                    {renderChargeRow('8', 'Doctor / Special Visit Charges', Number(data.doctor_visit_charges) + Number(data.special_visit_charges), (Number(data.doctor_visit_charges) + Number(data.special_visit_charges)) * 0.9)}
                    {renderChargeRow('9', 'Oxygen / Monitor Charges', Number(data.oxygen_charges) + Number(data.monitor_charges), (Number(data.oxygen_charges) + Number(data.monitor_charges)) * 0.9)}
                    {renderChargeRow('10', 'Other Procedural Charges', Number(data.other_charges), Number(data.other_charges) * 0.9)}
                    
                    <View style={[styles.tableRow, { backgroundColor: '#f9fafb', borderTopWidth: 2 }]}>
                        <Text style={[styles.tCol1, {width: '60%', fontWeight: 'bold'}]}>TOTAL PROCEDURAL (FORM D)</Text>
                        <Text style={[styles.tCol3, {width: '20%', textAlign: 'right', fontWeight: 'bold'}]}>{totals.procedural_total.toFixed(2)}</Text>
                        <Text style={[styles.tCol4, {width: '20%', textAlign: 'right', fontWeight: 'bold'}]}>{totals.admissible_procedural.toFixed(2)}</Text>
                    </View>
                </View>

                {/* FINAL GRAND SUMMARY */}
                <Text style={[styles.title, {marginTop: 40}]}>FINAL PROPOSAL SUMMARY</Text>
                <View style={{ borderTopWidth: 1, borderTopColor: '#ccc' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tCol1, {width: '10%'}]}>A</Text>
                        <Text style={[styles.tCol2, {width: '50%'}]}>Total Room Rent</Text>
                        <Text style={[styles.tCol3, {width: '20%', textAlign: 'right'}]}>{totals.stay_total.toFixed(2)}</Text>
                        <Text style={[styles.tCol4, {width: '20%', textAlign: 'right'}]}>{totals.admissible_stay.toFixed(2)}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tCol1, {width: '10%'}]}>B</Text>
                        <Text style={[styles.tCol2, {width: '50%'}]}>Total Form D (Procedural)</Text>
                        <Text style={[styles.tCol3, {width: '20%', textAlign: 'right'}]}>{totals.procedural_total.toFixed(2)}</Text>
                        <Text style={[styles.tCol4, {width: '20%', textAlign: 'right'}]}>{totals.admissible_procedural.toFixed(2)}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tCol1, {width: '10%'}]}>C</Text>
                        <Text style={[styles.tCol2, {width: '50%'}]}>Total Pathology Receipts</Text>
                        <Text style={[styles.tCol3, {width: '20%', textAlign: 'right'}]}>{totals.path_total.toFixed(2)}</Text>
                        <Text style={[styles.tCol4, {width: '20%', textAlign: 'right'}]}>{totals.admissible_path.toFixed(2)}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tCol1, {width: '10%'}]}>D</Text>
                        <Text style={[styles.tCol2, {width: '50%'}]}>Total Medicine Receipts</Text>
                        <Text style={[styles.tCol3, {width: '20%', textAlign: 'right'}]}>{totals.med_total.toFixed(2)}</Text>
                        <Text style={[styles.tCol4, {width: '20%', textAlign: 'right'}]}>{totals.admissible_meds.toFixed(2)}</Text>
                    </View>

                    <View style={[styles.tableRow, { backgroundColor: '#eef2ff', borderTopWidth: 2, borderTopColor: '#6366f1' }]}>
                        <Text style={[styles.tCol1, {width: '60%', fontWeight: 'bold', color: '#4338ca'}]}>GRAND REIMBURSEMENT PROPOSAL</Text>
                        <Text style={[styles.tCol3, {width: '20%', textAlign: 'right', fontWeight: 'bold', color: '#4338ca'}]}>{totals.grand_claim.toFixed(2)}</Text>
                        <Text style={[styles.tCol4, {width: '20%', textAlign: 'right', fontWeight: 'bold', color: '#4338ca'}]}>{totals.grand_admissible.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text>Smart Toolkit 2.0 • Medical Reimbursement Form C & D</Text>
                </View>
            </Page>
        </Document>
    );
};

export default MedicalPDFDocument;
