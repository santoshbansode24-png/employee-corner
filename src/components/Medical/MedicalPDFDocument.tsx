import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { MedicalFormData, MedicalTotals } from '@/utils/medicalCalculations';

const styles = StyleSheet.create({
    page: {
        paddingTop: 22,
        paddingBottom: 34,
        paddingHorizontal: 26,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
        fontSize: 8,
        color: '#0f172a'
    },
    headerBox: {
        marginBottom: 10,
        borderBottomWidth: 1.5,
        borderBottomColor: '#1e3a8a',
        paddingBottom: 5,
        textAlign: 'center'
    },
    govHeader: {
        fontSize: 7.5,
        textAlign: 'center',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1e3a8a',
        letterSpacing: 0.3
    },
    subTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#334155',
        marginTop: 2
    },

    sectionHeader: {
        fontSize: 8.5,
        fontWeight: 'bold',
        color: '#1e3a8a',
        backgroundColor: '#f1f5f9',
        paddingVertical: 3,
        paddingHorizontal: 6,
        marginTop: 8,
        marginBottom: 4,
        borderLeftWidth: 3,
        borderLeftColor: '#2563eb',
        textTransform: 'uppercase'
    },

    // Grid Container for Details
    gridContainer: {
        borderTopWidth: 1,
        borderTopColor: '#cbd5e1',
        borderLeftWidth: 1,
        borderLeftColor: '#cbd5e1'
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        minHeight: 16.5,
        alignItems: 'stretch'
    },
    colSr: {
        width: '6%',
        paddingVertical: 2.5,
        paddingHorizontal: 2,
        borderRightWidth: 1,
        borderRightColor: '#cbd5e1',
        fontSize: 7.5,
        textAlign: 'center',
        color: '#64748b',
        justifyContent: 'center'
    },
    colLabel: {
        width: '38%',
        paddingVertical: 2.5,
        paddingHorizontal: 5,
        borderRightWidth: 1,
        borderRightColor: '#cbd5e1',
        fontSize: 7.5,
        fontWeight: 'bold',
        color: '#1e293b',
        justifyContent: 'center'
    },
    colVal: {
        width: '56%',
        paddingVertical: 2.5,
        paddingHorizontal: 5,
        borderRightWidth: 1,
        borderRightColor: '#cbd5e1',
        fontSize: 7.5,
        color: '#0f172a',
        justifyContent: 'center'
    },

    // Standard Tables
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderTopWidth: 1,
        borderTopColor: '#94a3b8',
        borderBottomWidth: 1,
        borderBottomColor: '#94a3b8',
        minHeight: 18,
        alignItems: 'stretch'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        minHeight: 15.5,
        alignItems: 'stretch'
    },
    totalRow: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderTopWidth: 1.5,
        borderTopColor: '#64748b',
        borderBottomWidth: 1.5,
        borderBottomColor: '#64748b',
        minHeight: 18,
        alignItems: 'stretch'
    },
    highlightRow: {
        flexDirection: 'row',
        backgroundColor: '#eff6ff',
        borderTopWidth: 1.5,
        borderTopColor: '#2563eb',
        borderBottomWidth: 1.5,
        borderBottomColor: '#2563eb',
        minHeight: 20,
        alignItems: 'stretch'
    },

    // Signatures
    signatureContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingTop: 10
    },
    sigBlock: {
        width: '30%',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#94a3b8',
        paddingTop: 4
    },
    sigTitle: {
        fontSize: 7.5,
        fontWeight: 'bold',
        color: '#1e293b'
    },
    sigSub: {
        fontSize: 6.5,
        color: '#64748b',
        marginTop: 1.5
    },

    footer: {
        position: 'absolute',
        bottom: 12,
        left: 26,
        right: 26,
        fontSize: 7,
        color: '#94a3b8',
        textAlign: 'center',
        borderTopWidth: 0.8,
        borderTopColor: '#e2e8f0',
        paddingTop: 3
    }
});

interface MedicalPDFProps {
    data: MedicalFormData;
    totals: MedicalTotals;
}

const fmt = (val: number | string) => {
    const n = Number(val) || 0;
    return `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtInt = (val: number | string) => {
    const n = Number(val) || 0;
    return n.toLocaleString('en-IN');
};

const renderDetailRow = (num: string, label: string, value: string | number) => (
    <View style={styles.row} key={num} wrap={false}>
        <View style={styles.colSr}><Text style={{ lineHeight: 1.2 }}>{num}</Text></View>
        <View style={styles.colLabel}><Text style={{ lineHeight: 1.2 }}>{label}</Text></View>
        <View style={styles.colVal}><Text style={{ lineHeight: 1.2 }}>{value || '-'}</Text></View>
    </View>
);

const MedicalPDFDocument: React.FC<MedicalPDFProps> = ({ data, totals }) => {
    return (
        <Document>
            {/* PAGE 1: FORM C - ESSENTIALITY CERTIFICATE & ROOM RENT MATRIX */}
            <Page size="A4" style={styles.page}>
                <View style={styles.headerBox} wrap={false}>
                    <Text style={styles.govHeader}>GOVERNMENT OF MAHARASHTRA • MEDICAL ATTENDANCE RULES</Text>
                    <Text style={styles.title}>ESSENTIALITY CERTIFICATE "FORM-C"</Text>
                    <Text style={styles.subTitle}>Certificate Granted to Government Servant & Eligible Dependent Family Members</Text>
                </View>

                <Text style={styles.sectionHeader}>I. Government Servant & Patient Particulars</Text>
                <View style={styles.gridContainer}>
                    {renderDetailRow('1', 'Name of Government Servant', data.emp_name_english || data.emp_name_designation_marathi || '-')}
                    {renderDetailRow('2', 'Designation & Cadre', data.emp_designation_english || '-')}
                    {renderDetailRow('3', 'Office / Department', data.office_name_english || data.office_name_marathi || '-')}
                    {renderDetailRow('4', 'Basic Pay (Level Matrix)', data.basic_pay ? `Rs. ${fmtInt(data.basic_pay)}` : '-')}
                    {renderDetailRow('5', 'Date of Appointment', data.appointment_date || '-')}
                    {renderDetailRow('6', 'Residential Address', data.res_address_english || '-')}
                    {renderDetailRow('7', 'Name of Patient', data.patient_name_english || data.patient_name || '-')}
                    {renderDetailRow('8', 'Relationship with Govt Servant', data.patient_relation || 'Self')}
                    {renderDetailRow('9', 'Age of Patient', data.patient_age ? `${data.patient_age} Years` : '-')}
                    {renderDetailRow('10', 'Place Where Illness Incurred', data.place_of_illness || '-')}
                    {renderDetailRow('11', 'Name & Address of Hospital', data.hospital_name_english || '-')}
                    {renderDetailRow('12', 'Treating Medical Officer / Specialist', data.treating_doctor_name_english || '-')}
                    {renderDetailRow('13', 'Hospitalization Period', `${data.admit_date_from || '-'}  to  ${data.admit_date_to || '-'}`)}
                </View>

                {/* Admission Room Matrix */}
                <Text style={styles.sectionHeader}>II. Hospital Room Rent & Stay Admissibility</Text>
                <View style={styles.gridContainer} wrap={false}>
                    <View style={styles.tableHeaderRow}>
                        <View style={[styles.colSr, { width: '6%', fontWeight: 'bold' }]}><Text>Sr.</Text></View>
                        <View style={[styles.colLabel, { width: '42%', fontWeight: 'bold' }]}><Text>Ward Category (Admissibility Rule)</Text></View>
                        <View style={[styles.colVal, { width: '14%', textAlign: 'center', fontWeight: 'bold' }]}><Text style={{ textAlign: 'center' }}>Days</Text></View>
                        <View style={[styles.colVal, { width: '18%', textAlign: 'right', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>Rate / Day (Rs.)</Text></View>
                        <View style={[styles.colVal, { width: '20%', textAlign: 'right', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>Claimed (Rs.)</Text></View>
                    </View>

                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>1</Text></View>
                        <View style={[styles.colLabel, { width: '42%' }]}><Text>General Ward (95% Admissible)</Text></View>
                        <View style={[styles.colVal, { width: '14%' }]}><Text style={{ textAlign: 'center' }}>{data.gw_days || '0'}</Text></View>
                        <View style={[styles.colVal, { width: '18%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.gw_rates)}</Text></View>
                        <View style={[styles.colVal, { width: '20%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.gw_total)}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>2</Text></View>
                        <View style={[styles.colLabel, { width: '42%' }]}><Text>Semi-Private Ward (90% Admissible)</Text></View>
                        <View style={[styles.colVal, { width: '14%' }]}><Text style={{ textAlign: 'center' }}>{data.semi_days || '0'}</Text></View>
                        <View style={[styles.colVal, { width: '18%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.semi_rates)}</Text></View>
                        <View style={[styles.colVal, { width: '20%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.semi_total)}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>3</Text></View>
                        <View style={[styles.colLabel, { width: '42%' }]}><Text>Private Room (75% Admissible)</Text></View>
                        <View style={[styles.colVal, { width: '14%' }]}><Text style={{ textAlign: 'center' }}>{data.pvt_days || '0'}</Text></View>
                        <View style={[styles.colVal, { width: '18%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.pvt_rates)}</Text></View>
                        <View style={[styles.colVal, { width: '20%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.pvt_total)}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>4</Text></View>
                        <View style={[styles.colLabel, { width: '42%' }]}><Text>ICU / ICCU (100% Admissible)</Text></View>
                        <View style={[styles.colVal, { width: '14%' }]}><Text style={{ textAlign: 'center' }}>{data.icu_days || '0'}</Text></View>
                        <View style={[styles.colVal, { width: '18%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.icu_rates)}</Text></View>
                        <View style={[styles.colVal, { width: '20%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.icu_total)}</Text></View>
                    </View>

                    <View style={styles.totalRow}>
                        <View style={[styles.colLabel, { width: '48%', borderRightWidth: 1, borderRightColor: '#94a3b8' }]}>
                            <Text style={{ fontWeight: 'bold' }}>Total Room Rent Claimed / Admissible</Text>
                        </View>
                        <View style={[styles.colVal, { width: '26%', borderRightWidth: 1, borderRightColor: '#94a3b8' }]}>
                            <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>Claim: {fmt(totals.stay_total)}</Text>
                        </View>
                        <View style={[styles.colVal, { width: '26%' }]}>
                            <Text style={{ textAlign: 'right', fontWeight: 'bold', color: '#166534' }}>Adm: {fmt(totals.admissible_stay)}</Text>
                        </View>
                    </View>
                </View>

                {/* Signatures on Page 1 */}
                <View style={styles.signatureContainer} wrap={false}>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>Signature of Employee</Text>
                        <Text style={styles.sigSub}>(Claimant Government Servant)</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>Medical Superintendent</Text>
                        <Text style={styles.sigSub}>(Hospital Seal & Sign)</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>Controlling Officer / DDO</Text>
                        <Text style={styles.sigSub}>Office Seal</Text>
                    </View>
                </View>

                <Text style={styles.footer} fixed>
                    Smart Toolkit 2.0 • Maharashtra Civil Services (Medical Attendance) Rules • Form-C (Page 1 of 3)
                </Text>
            </Page>

            {/* PAGE 2: FORM D - PROCEDURAL CHARGES & FINAL SUMMARY */}
            <Page size="A4" style={styles.page}>
                <View style={styles.headerBox} wrap={false}>
                    <Text style={styles.govHeader}>GOVERNMENT OF MAHARASHTRA • MEDICAL REIMBURSEMENT</Text>
                    <Text style={styles.title}>PROCEDURAL & OPERATIVE CHARGES (FORM "D")</Text>
                    <Text style={styles.subTitle}>Statement of Operative, Diagnostic & Therapeutic Expenditure</Text>
                </View>

                <Text style={styles.sectionHeader}>I. Form "D" Procedural Details (Admissible @ 90%)</Text>
                <View style={styles.gridContainer}>
                    <View style={styles.tableHeaderRow} wrap={false}>
                        <View style={[styles.colSr, { width: '6%', fontWeight: 'bold' }]}><Text>Sr.</Text></View>
                        <View style={[styles.colLabel, { width: '50%', fontWeight: 'bold' }]}><Text>Particulars of Procedure / Charge</Text></View>
                        <View style={[styles.colVal, { width: '22%', textAlign: 'right', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>Claimed (Rs.)</Text></View>
                        <View style={[styles.colVal, { width: '22%', textAlign: 'right', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>Admissible 90% (Rs.)</Text></View>
                    </View>

                    {[
                        { sr: '1', label: 'Admission / Registration Charges', val: data.admission_charges },
                        { sr: '2', label: 'Surgeon Operation Fees', val: data.surgeon_charges },
                        { sr: '3', label: 'Assistant Surgeon Charges', val: data.asst_surgeon_charges },
                        { sr: '4', label: 'Anesthetist Charges', val: data.anesthesia_charges },
                        { sr: '5', label: 'Operation Theatre (OT) Charges', val: data.ot_charges },
                        { sr: '6', label: 'OT Assistant / Nursing Charges', val: Number(data.ot_assistant_charges || 0) + Number(data.nursing_charges || 0) },
                        { sr: '7', label: 'Resident Medical Officer (RMO) Charges', val: data.rmo_charges },
                        { sr: '8', label: 'Doctor / Specialist Visit Charges', val: Number(data.doctor_visit_charges || 0) + Number(data.special_visit_charges || 0) },
                        { sr: '9', label: 'Radiology / Sonography / CT / MRI', val: data.radiology_charges },
                        { sr: '10', label: 'Oxygen / Monitor / Infusion Charges', val: Number(data.oxygen_charges || 0) + Number(data.monitor_charges || 0) + Number(data.iv_infusion_charges || 0) },
                        { sr: '11', label: 'Other Ancillary Hospital Charges', val: data.other_charges },
                    ].map((item) => {
                        const amt = Number(item.val) || 0;
                        return (
                            <View style={styles.tableRow} key={item.sr} wrap={false}>
                                <View style={[styles.colSr, { width: '6%' }]}><Text>{item.sr}</Text></View>
                                <View style={[styles.colLabel, { width: '50%' }]}><Text>{item.label}</Text></View>
                                <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right' }}>{amt > 0 ? fmtInt(amt) : '-'}</Text></View>
                                <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right' }}>{amt > 0 ? (amt * 0.9).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</Text></View>
                            </View>
                        );
                    })}

                    <View style={styles.totalRow} wrap={false}>
                        <View style={[styles.colLabel, { width: '56%', borderRightWidth: 1, borderRightColor: '#94a3b8' }]}>
                            <Text style={{ fontWeight: 'bold' }}>Total Form D Procedural Charges</Text>
                        </View>
                        <View style={[styles.colVal, { width: '22%', borderRightWidth: 1, borderRightColor: '#94a3b8' }]}>
                            <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>{fmt(totals.procedural_total)}</Text>
                        </View>
                        <View style={[styles.colVal, { width: '22%' }]}>
                            <Text style={{ textAlign: 'right', fontWeight: 'bold', color: '#166534' }}>{fmt(totals.admissible_procedural)}</Text>
                        </View>
                    </View>
                </View>

                {/* FINAL GRAND SUMMARY */}
                <Text style={styles.sectionHeader}>II. Consolidated Medical Proposal Summary</Text>
                <View style={styles.gridContainer} wrap={false}>
                    <View style={styles.tableHeaderRow}>
                        <View style={[styles.colSr, { width: '6%', fontWeight: 'bold' }]}><Text>Head</Text></View>
                        <View style={[styles.colLabel, { width: '50%', fontWeight: 'bold' }]}><Text>Expenditure Head Description</Text></View>
                        <View style={[styles.colVal, { width: '22%', textAlign: 'right', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>Claimed Amount (Rs.)</Text></View>
                        <View style={[styles.colVal, { width: '22%', textAlign: 'right', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>Admissible Amount (Rs.)</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>A</Text></View>
                        <View style={[styles.colLabel, { width: '50%' }]}><Text>Room Rent & Ward Charges</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right' }}>{fmt(totals.stay_total)}</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right', color: '#166534' }}>{fmt(totals.admissible_stay)}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>B</Text></View>
                        <View style={[styles.colLabel, { width: '50%' }]}><Text>Form D Procedural & Surgical Charges</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right' }}>{fmt(totals.procedural_total)}</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right', color: '#166534' }}>{fmt(totals.admissible_procedural)}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>C</Text></View>
                        <View style={[styles.colLabel, { width: '50%' }]}><Text>Pathology & Diagnostic Tests (90% Adm)</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right' }}>{fmt(totals.path_total)}</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right', color: '#166534' }}>{fmt(totals.admissible_path)}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>D</Text></View>
                        <View style={[styles.colLabel, { width: '50%' }]}><Text>Medicines & Injections (90% Adm)</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right' }}>{fmt(totals.med_total)}</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right', color: '#166534' }}>{fmt(totals.admissible_meds)}</Text></View>
                    </View>

                    <View style={styles.highlightRow}>
                        <View style={[styles.colLabel, { width: '56%', borderRightWidth: 1, borderRightColor: '#2563eb' }]}>
                            <Text style={{ fontWeight: 'bold', color: '#1e3a8a' }}>GRAND TOTAL SANCTION PROPOSAL</Text>
                        </View>
                        <View style={[styles.colVal, { width: '22%', borderRightWidth: 1, borderRightColor: '#2563eb' }]}>
                            <Text style={{ textAlign: 'right', fontWeight: 'bold', color: '#1e3a8a' }}>{fmt(totals.grand_claim)}</Text>
                        </View>
                        <View style={[styles.colVal, { width: '22%' }]}>
                            <Text style={{ textAlign: 'right', fontWeight: 'bold', color: '#166534' }}>{fmt(totals.grand_admissible)}</Text>
                        </View>
                    </View>
                </View>

                {/* Signatures on Page 2 */}
                <View style={styles.signatureContainer} wrap={false}>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>Senior Clerk / Scrutiny</Text>
                        <Text style={styles.sigSub}>Office Establishment</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>Civil Surgeon / CMO</Text>
                        <Text style={styles.sigSub}>District Hospital Countersign</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>Head of Office / DDO</Text>
                        <Text style={styles.sigSub}>Sanctioning Authority</Text>
                    </View>
                </View>

                <Text style={styles.footer} fixed>
                    Smart Toolkit 2.0 • Form "D" & Consolidated Sanction Proposal • (Page 2 of 3)
                </Text>
            </Page>

            {/* PAGE 3: ITEMIZED RECEIPTS (PATHOLOGY & MEDICINES) & DECLARATION */}
            <Page size="A4" style={styles.page}>
                <View style={styles.headerBox} wrap={false}>
                    <Text style={styles.govHeader}>GOVERNMENT OF MAHARASHTRA • MEDICAL ATTENDANCE RULES</Text>
                    <Text style={styles.title}>ANNEXURE OF BILLS & CASH MEMOS</Text>
                    <Text style={styles.subTitle}>Itemized Statement of Pathology Reports & Pharmacy Receipts</Text>
                </View>

                {/* Side-by-Side Receipts Layout for Maximum Space & Zero Page Overflow */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }} wrap={false}>
                    {/* Left: Pathology */}
                    <View style={{ width: '49%' }}>
                        <Text style={[styles.sectionHeader, { marginTop: 0 }]}>A. Pathology & Labs</Text>
                        <View style={styles.gridContainer}>
                            <View style={styles.tableHeaderRow}>
                                <View style={[styles.colSr, { width: '12%', fontWeight: 'bold' }]}><Text>#</Text></View>
                                <View style={[styles.colLabel, { width: '40%', fontWeight: 'bold' }]}><Text>Bill No</Text></View>
                                <View style={[styles.colVal, { width: '24%', fontWeight: 'bold' }]}><Text style={{ textAlign: 'center' }}>Date</Text></View>
                                <View style={[styles.colVal, { width: '24%', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>Amt (Rs.)</Text></View>
                            </View>
                            {data.pathology_receipts && data.pathology_receipts.length > 0 ? (
                                data.pathology_receipts.map((r, i) => (
                                    <View key={i} style={styles.tableRow}>
                                        <View style={[styles.colSr, { width: '12%' }]}><Text>{i + 1}</Text></View>
                                        <View style={[styles.colLabel, { width: '40%' }]}><Text>{r.receipt_no}</Text></View>
                                        <View style={[styles.colVal, { width: '24%' }]}><Text style={{ textAlign: 'center' }}>{r.date}</Text></View>
                                        <View style={[styles.colVal, { width: '24%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(r.amount)}</Text></View>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.tableRow}>
                                    <View style={[styles.colVal, { width: '100%', textAlign: 'center' }]}><Text style={{ color: '#94a3b8', textAlign: 'center' }}>No bills added</Text></View>
                                </View>
                            )}
                            <View style={styles.totalRow}>
                                <View style={[styles.colLabel, { width: '60%', borderRightWidth: 1, borderRightColor: '#94a3b8' }]}>
                                    <Text style={{ fontWeight: 'bold' }}>Total Pathology</Text>
                                </View>
                                <View style={[styles.colVal, { width: '40%' }]}>
                                    <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>{fmt(totals.path_total)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Right: Medicines */}
                    <View style={{ width: '49%' }}>
                        <Text style={[styles.sectionHeader, { marginTop: 0 }]}>B. Pharmacy & Medicines</Text>
                        <View style={styles.gridContainer}>
                            <View style={styles.tableHeaderRow}>
                                <View style={[styles.colSr, { width: '12%', fontWeight: 'bold' }]}><Text>#</Text></View>
                                <View style={[styles.colLabel, { width: '40%', fontWeight: 'bold' }]}><Text>Bill No</Text></View>
                                <View style={[styles.colVal, { width: '24%', fontWeight: 'bold' }]}><Text style={{ textAlign: 'center' }}>Date</Text></View>
                                <View style={[styles.colVal, { width: '24%', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>Amt (Rs.)</Text></View>
                            </View>
                            {data.medicine_receipts && data.medicine_receipts.length > 0 ? (
                                data.medicine_receipts.map((r, i) => (
                                    <View key={i} style={styles.tableRow}>
                                        <View style={[styles.colSr, { width: '12%' }]}><Text>{i + 1}</Text></View>
                                        <View style={[styles.colLabel, { width: '40%' }]}><Text>{r.receipt_no}</Text></View>
                                        <View style={[styles.colVal, { width: '24%' }]}><Text style={{ textAlign: 'center' }}>{r.date}</Text></View>
                                        <View style={[styles.colVal, { width: '24%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(r.amount)}</Text></View>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.tableRow}>
                                    <View style={[styles.colVal, { width: '100%', textAlign: 'center' }]}><Text style={{ color: '#94a3b8', textAlign: 'center' }}>No bills added</Text></View>
                                </View>
                            )}
                            <View style={styles.totalRow}>
                                <View style={[styles.colLabel, { width: '60%', borderRightWidth: 1, borderRightColor: '#94a3b8' }]}>
                                    <Text style={{ fontWeight: 'bold' }}>Total Medicines</Text>
                                </View>
                                <View style={[styles.colVal, { width: '40%' }]}>
                                    <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>{fmt(totals.med_total)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Section C: Dependent Family Members Declaration */}
                <Text style={styles.sectionHeader}>C. Dependent Family Members Declaration (शासकीय नियमानुसार)</Text>
                <View style={styles.gridContainer} wrap={false}>
                    <View style={styles.tableHeaderRow}>
                        <View style={[styles.colSr, { width: '8%', fontWeight: 'bold' }]}><Text>Sr.</Text></View>
                        <View style={[styles.colLabel, { width: '52%', fontWeight: 'bold' }]}><Text>Name of Dependent Family Member</Text></View>
                        <View style={[styles.colVal, { width: '22%', fontWeight: 'bold' }]}><Text style={{ textAlign: 'center' }}>Relationship</Text></View>
                        <View style={[styles.colVal, { width: '18%', fontWeight: 'bold' }]}><Text style={{ textAlign: 'center' }}>Age (Yrs)</Text></View>
                    </View>
                    {[
                        { sr: '1', name: data.m_name_1, rel: data.m_rel_1, age: data.m_age_1 },
                        { sr: '2', name: data.m_name_2, rel: data.m_rel_2, age: data.m_age_2 },
                        { sr: '3', name: data.m_name_3, rel: data.m_rel_3, age: data.m_age_3 },
                        { sr: '4', name: data.m_name_4, rel: data.m_rel_4, age: data.m_age_4 },
                    ].map((m) => (
                        <View key={m.sr} style={styles.tableRow}>
                            <View style={[styles.colSr, { width: '8%' }]}><Text>{m.sr}</Text></View>
                            <View style={[styles.colLabel, { width: '52%' }]}><Text>{m.name || '-'}</Text></View>
                            <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'center' }}>{m.rel || '-'}</Text></View>
                            <View style={[styles.colVal, { width: '18%' }]}><Text style={{ textAlign: 'center' }}>{m.age ? `${m.age} Yrs` : '-'}</Text></View>
                        </View>
                    ))}
                </View>

                {/* Declaration Block */}
                <View style={{ marginTop: 8, padding: 6, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }} wrap={false}>
                    <Text style={{ fontSize: 7, color: '#334155', lineHeight: 1.25 }}>
                        Declaration: I hereby declare that the statements made in this claim are true to the best of my knowledge and belief and that the person for whom medical expenses were incurred is wholly dependent upon me as per Maharashtra Medical Attendance Rules. The original cash memos and test reports submitted herewith are genuine and have not been claimed previously from any source.
                    </Text>
                </View>

                {/* Signatures on Page 3 */}
                <View style={styles.signatureContainer} wrap={false}>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>Signature of Govt Servant</Text>
                        <Text style={styles.sigSub}>Date: _______________</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>Superintendent / Chemist</Text>
                        <Text style={styles.sigSub}>Verification Stamp</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>Controlling Officer / DDO</Text>
                        <Text style={styles.sigSub}>Passed for Payment</Text>
                    </View>
                </View>

                <Text style={styles.footer} fixed>
                    Smart Toolkit 2.0 • Medical Claim Receipts & Family Annexure • (Page 3 of 3)
                </Text>
            </Page>
        </Document>
    );
};

export default MedicalPDFDocument;
