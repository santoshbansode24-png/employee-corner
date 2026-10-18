import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { MedicalFormData, MedicalTotals } from '@/utils/medicalCalculations';

// Register Nirmala font for crystal-clear English & Marathi Unicode rendering without glyph overlap
const isBrowser = typeof window !== 'undefined';
try {
    Font.register({
        family: 'Nirmala',
        fonts: [
            {
                src: isBrowser ? `${window.location.origin}/fonts/Nirmala.ttf` : require('path').resolve('public/fonts/Nirmala.ttf'),
                fontWeight: 'normal'
            },
            {
                src: isBrowser ? `${window.location.origin}/fonts/NirmalaB.ttf` : require('path').resolve('public/fonts/NirmalaB.ttf'),
                fontWeight: 'bold'
            }
        ]
    });
} catch (e) {
    console.warn('Font registration notice:', e);
}

Font.registerHyphenationCallback(word => [word]);

const styles = StyleSheet.create({
    page: {
        paddingTop: 22,
        paddingBottom: 34,
        paddingHorizontal: 26,
        backgroundColor: '#ffffff',
        fontFamily: 'Nirmala',
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

const formatDateDisplay = (d?: string | number) => {
    if (!d || d === '-') return '-';
    const s = String(d).trim();
    if (s.includes('-')) {
        const parts = s.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    }
    return s;
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
                    <Text style={styles.govHeader}>महाराष्ट्र शासन • वैद्यकीय प्रतिपूर्ती नियम (GOVERNMENT OF MAHARASHTRA)</Text>
                    <Text style={styles.title}>आवश्यकता प्रमाणपत्र - "फॉर्म सी" (ESSENTIALITY CERTIFICATE)</Text>
                    <Text style={styles.subTitle}>शासकीय कर्मचारी व पात्र कुटुंबियांकरिता वैद्यकीय खर्चाच्या परताव्याचा अर्ज</Text>
                </View>

                <Text style={styles.sectionHeader}>१. शासकीय कर्मचारी व रुग्णाचा तपशील (Employee & Patient Particulars)</Text>
                <View style={styles.gridContainer}>
                    {renderDetailRow('१', 'कर्मचाऱ्याचे नाव (Name of Government Servant)', data.emp_name_marathi || data.emp_name_english || data.emp_name_designation_marathi || '-')}
                    {renderDetailRow('२', 'पदनाम (Designation & Cadre)', data.emp_designation_marathi || data.emp_designation_english || '-')}
                    {renderDetailRow('३', 'कार्यालय / विभाग (Office / Department)', data.office_name_marathi || data.office_name_english || '-')}
                    {renderDetailRow('४', 'मूळ वेतन (Basic Pay - 7th Pay Matrix)', data.basic_pay ? `रु. ${fmtInt(data.basic_pay)}` : '-')}
                    {renderDetailRow('५', 'नियुक्ती दिनांक (Date of Appointment)', formatDateDisplay(data.appointment_date))}
                    {renderDetailRow('६', 'निवासस्थानाचा पत्ता (Residential Address)', data.res_address_marathi || data.res_address_english || '-')}
                    {renderDetailRow('७', 'रुग्णाचे नाव (Name of Patient)', data.patient_name_marathi || data.patient_name_english || data.patient_name || '-')}
                    {renderDetailRow('८', 'कर्मचाऱ्याशी नाते (Relationship)', data.patient_relation_marathi || data.patient_relation || 'स्वतः (Self)')}
                    {renderDetailRow('९', 'रुग्णाचे वय (Age of Patient)', data.patient_age ? `${data.patient_age} वर्षे` : '-')}
                    {renderDetailRow('१०', 'आजारी पडल्याचे ठिकाण (Place of Illness)', data.place_of_illness || '-')}
                    {renderDetailRow('११', 'रुग्णालयाचे नाव व पत्ता (Hospital Name & Address)', data.hospital_name_marathi || data.hospital_name_english || '-')}
                    {renderDetailRow('१२', 'उपचार करणारे वैद्यकीय अधिकारी (Treating Doctor)', data.dr_name_marathi || data.treating_doctor_name_english || '-')}
                    {renderDetailRow('१३', 'रुग्णालयातील वास्तव्याचा कालावधी (Admit Period)', `${formatDateDisplay(data.admit_date_from)}  ते  ${formatDateDisplay(data.admit_date_to)}`)}
                </View>

                {/* Admission Room Matrix */}
                <Text style={styles.sectionHeader}>२. रुग्णालयातील वास्तव्याचे विवरण व देयता (Room Rent & Stay Matrix)</Text>
                <View style={styles.gridContainer} wrap={false}>
                    <View style={styles.tableHeaderRow}>
                        <View style={[styles.colSr, { width: '6%', fontWeight: 'bold' }]}><Text>अ.क्र.</Text></View>
                        <View style={[styles.colLabel, { width: '42%', fontWeight: 'bold' }]}><Text>कक्षाचा प्रकार (Ward Category & Rule)</Text></View>
                        <View style={[styles.colVal, { width: '14%', textAlign: 'center', fontWeight: 'bold' }]}><Text style={{ textAlign: 'center' }}>दिवस</Text></View>
                        <View style={[styles.colVal, { width: '18%', textAlign: 'right', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>दर / दिवस (रु.)</Text></View>
                        <View style={[styles.colVal, { width: '20%', textAlign: 'right', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>दावा रक्कम (रु.)</Text></View>
                    </View>

                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>१</Text></View>
                        <View style={[styles.colLabel, { width: '42%' }]}><Text>सामान्य कक्ष / General Ward (९५% देय)</Text></View>
                        <View style={[styles.colVal, { width: '14%' }]}><Text style={{ textAlign: 'center' }}>{data.gw_days || '0'}</Text></View>
                        <View style={[styles.colVal, { width: '18%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.gw_rates)}</Text></View>
                        <View style={[styles.colVal, { width: '20%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.gw_total)}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>२</Text></View>
                        <View style={[styles.colLabel, { width: '42%' }]}><Text>अर्ध-खाजगी कक्ष / Semi-Pvt (९०% देय)</Text></View>
                        <View style={[styles.colVal, { width: '14%' }]}><Text style={{ textAlign: 'center' }}>{data.semi_days || '0'}</Text></View>
                        <View style={[styles.colVal, { width: '18%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.semi_rates)}</Text></View>
                        <View style={[styles.colVal, { width: '20%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.semi_total)}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>३</Text></View>
                        <View style={[styles.colLabel, { width: '42%' }]}><Text>खाजगी कक्ष / Private Room (७५% देय)</Text></View>
                        <View style={[styles.colVal, { width: '14%' }]}><Text style={{ textAlign: 'center' }}>{data.pvt_days || '0'}</Text></View>
                        <View style={[styles.colVal, { width: '18%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.pvt_rates)}</Text></View>
                        <View style={[styles.colVal, { width: '20%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.pvt_total)}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>४</Text></View>
                        <View style={[styles.colLabel, { width: '42%' }]}><Text>आयसीयू / ICU / ICCU (१००% देय)</Text></View>
                        <View style={[styles.colVal, { width: '14%' }]}><Text style={{ textAlign: 'center' }}>{data.icu_days || '0'}</Text></View>
                        <View style={[styles.colVal, { width: '18%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.icu_rates)}</Text></View>
                        <View style={[styles.colVal, { width: '20%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(data.icu_total)}</Text></View>
                    </View>

                    <View style={styles.totalRow}>
                        <View style={[styles.colLabel, { width: '48%', borderRightWidth: 1, borderRightColor: '#94a3b8' }]}>
                            <Text style={{ fontWeight: 'bold' }}>एकूण वास्तव्याचा दावा / देय रक्कम (Total Room Rent)</Text>
                        </View>
                        <View style={[styles.colVal, { width: '26%', borderRightWidth: 1, borderRightColor: '#94a3b8' }]}>
                            <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>दावा: {fmt(totals.stay_total)}</Text>
                        </View>
                        <View style={[styles.colVal, { width: '26%' }]}>
                            <Text style={{ textAlign: 'right', fontWeight: 'bold', color: '#166534' }}>देय: {fmt(totals.admissible_stay)}</Text>
                        </View>
                    </View>
                </View>

                {/* Signatures on Page 1 */}
                <View style={styles.signatureContainer} wrap={false}>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>शासकीय कर्मचाऱ्याची स्वाक्षरी</Text>
                        <Text style={styles.sigSub}>(दावेदार शासकीय सेवक)</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>वैद्यकीय अधीक्षक</Text>
                        <Text style={styles.sigSub}>(रुग्णालयाचा शिक्का व सही)</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>नियंत्रण अधिकारी / DDO</Text>
                        <Text style={styles.sigSub}>कार्यालयीन शिक्का</Text>
                    </View>
                </View>

                <Text style={styles.footer} render={({ pageNumber, totalPages }) => `कर्मचारी कॉर्नर २.० • महाराष्ट्र नागरी सेवा (वैद्यकीय देखभाल) नियम • फॉर्म-सी • पान ${pageNumber} / ${totalPages}`} fixed />
            </Page>

            {/* PAGE 2: FORM D - PROCEDURAL CHARGES & FINAL SUMMARY */}
            <Page size="A4" style={styles.page}>
                <View style={styles.headerBox} wrap={false}>
                    <Text style={styles.govHeader}>महाराष्ट्र शासन • वैद्यकीय प्रतिपूर्ती नियम (GOVERNMENT OF MAHARASHTRA)</Text>
                    <Text style={styles.title}>शस्त्रक्रिया व इतर उपचारांचे विवरण - "फॉर्म डी" (FORM "D")</Text>
                    <Text style={styles.subTitle}>शस्त्रक्रिया, निदान व उपचारात्मक खर्चाचा तपशील व अंतिम मंजुरी गोषवारा</Text>
                </View>

                <Text style={styles.sectionHeader}>१. फॉर्म "डी" - उपचारांचा तपशील (९०% देय / Admissible @ 90%)</Text>
                <View style={styles.gridContainer}>
                    <View style={styles.tableHeaderRow} wrap={false}>
                        <View style={[styles.colSr, { width: '6%', fontWeight: 'bold' }]}><Text>अ.क्र.</Text></View>
                        <View style={[styles.colLabel, { width: '50%', fontWeight: 'bold' }]}><Text>उपचार / शुल्काचा तपशील (Particulars)</Text></View>
                        <View style={[styles.colVal, { width: '22%', textAlign: 'right', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>दावा रक्कम (रु.)</Text></View>
                        <View style={[styles.colVal, { width: '22%', textAlign: 'right', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>देय रक्कम ९०% (रु.)</Text></View>
                    </View>

                    {[
                        { sr: '१', label: 'नोंदणी / ॲडमिशन शुल्क (Admission / Reg)', val: data.admission_charges },
                        { sr: '२', label: 'शल्यचिकित्सक (सर्जन) फी (Surgeon Operation)', val: data.surgeon_charges },
                        { sr: '३', label: 'सहाय्यक शल्यचिकित्सक फी (Asst Surgeon)', val: data.asst_surgeon_charges },
                        { sr: '४', label: 'भूलतज्ज्ञ (ॲनेस्थेटिस्ट) फी (Anesthetist)', val: data.anesthesia_charges },
                        { sr: '५', label: 'ऑपरेशन थिएटर (OT) शुल्क (OT Charges)', val: data.ot_charges },
                        { sr: '६', label: 'ओटी असिस्टंट व नर्सिंग शुल्क (OT Asst & Nursing)', val: Number(data.ot_assistant_charges || 0) + Number(data.nursing_charges || 0) },
                        { sr: '७', label: 'निवासी वैद्यकीय अधिकारी शुल्क (RMO Charges)', val: data.rmo_charges },
                        { sr: '८', label: 'डॉक्टर / तज्ज्ञ व्हिजिट फी (Doctor Visit Fees)', val: Number(data.doctor_visit_charges || 0) + Number(data.special_visit_charges || 0) },
                        { sr: '९', label: 'रेडिओलॉजी / सोनोग्राफी / सिटी / एमआरआय (Imaging)', val: data.radiology_charges },
                        { sr: '१०', label: 'ऑक्सिजन / मॉनिटर / आयव्ही इन्फ्युजन (O2 / Monitor)', val: Number(data.oxygen_charges || 0) + Number(data.monitor_charges || 0) + Number(data.iv_infusion_charges || 0) },
                        { sr: '११', label: 'इतर संलग्न रुग्णालय शुल्क (Other Charges)', val: data.other_charges },
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
                            <Text style={{ fontWeight: 'bold' }}>एकूण फॉर्म "डी" उपचार खर्च (Total Form D Charges)</Text>
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
                <Text style={styles.sectionHeader}>२. एकत्रित वैद्यकीय खर्च व मंजुरी गोषवारा (Consolidated Summary)</Text>
                <View style={styles.gridContainer} wrap={false}>
                    <View style={styles.tableHeaderRow}>
                        <View style={[styles.colSr, { width: '6%', fontWeight: 'bold' }]}><Text>बाब</Text></View>
                        <View style={[styles.colLabel, { width: '50%', fontWeight: 'bold' }]}><Text>खर्चाच्या बाबींचा तपशील (Expenditure Head)</Text></View>
                        <View style={[styles.colVal, { width: '22%', textAlign: 'right', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>दावा रक्कम (रु.)</Text></View>
                        <View style={[styles.colVal, { width: '22%', textAlign: 'right', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>देय रक्कम (रु.)</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>अ</Text></View>
                        <View style={[styles.colLabel, { width: '50%' }]}><Text>रुग्णालयातील वास्तव्याचा खर्च (Room Rent & Stay)</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right' }}>{fmt(totals.stay_total)}</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right', color: '#166534' }}>{fmt(totals.admissible_stay)}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>ब</Text></View>
                        <View style={[styles.colLabel, { width: '50%' }]}><Text>फॉर्म "डी" शस्त्रक्रिया व उपचार (Form D Procedures)</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right' }}>{fmt(totals.procedural_total)}</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right', color: '#166534' }}>{fmt(totals.admissible_procedural)}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>क</Text></View>
                        <View style={[styles.colLabel, { width: '50%' }]}><Text>पॅथॉलॉजी व लॅब चाचण्या (Pathology Tests - ९०% देय)</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right' }}>{fmt(totals.path_total)}</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right', color: '#166534' }}>{fmt(totals.admissible_path)}</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.colSr, { width: '6%' }]}><Text>ड</Text></View>
                        <View style={[styles.colLabel, { width: '50%' }]}><Text>औषधे व इंजेक्शन्स (Medicines - ९०% देय)</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right' }}>{fmt(totals.med_total)}</Text></View>
                        <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'right', color: '#166534' }}>{fmt(totals.admissible_meds)}</Text></View>
                    </View>

                    <View style={styles.highlightRow}>
                        <View style={[styles.colLabel, { width: '56%', borderRightWidth: 1, borderRightColor: '#2563eb' }]}>
                            <Text style={{ fontWeight: 'bold', color: '#1e3a8a' }}>एकूण मंजूर प्रस्ताव (GRAND TOTAL SANCTION)</Text>
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
                        <Text style={styles.sigTitle}>वरिष्ठ लिपिक / छाननी</Text>
                        <Text style={styles.sigSub}>कार्यालयीन आस्थापना</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>जिल्हा शल्य चिकित्सक</Text>
                        <Text style={styles.sigSub}>जिल्हा रुग्णालय प्रतिस्वाक्षरी</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>कार्यालय प्रमुख / DDO</Text>
                        <Text style={styles.sigSub}>सक्षम मंजुरी प्राधिकारी</Text>
                    </View>
                </View>

                <Text style={styles.footer} render={({ pageNumber, totalPages }) => `कर्मचारी कॉर्नर २.० • फॉर्म "डी" व एकत्रित मंजुरी गोषवारा • पान ${pageNumber} / ${totalPages}`} fixed />
            </Page>

            {/* PAGE 3: ITEMIZED RECEIPTS (PATHOLOGY & MEDICINES) & DECLARATION */}
            <Page size="A4" style={styles.page}>
                <View style={styles.headerBox} wrap={false}>
                    <Text style={styles.govHeader}>महाराष्ट्र शासन • वैद्यकीय प्रतिपूर्ती नियम (GOVERNMENT OF MAHARASHTRA)</Text>
                    <Text style={styles.title}>तपासणी व औषध बिलांचा तपशील (ANNEXURE OF BILLS)</Text>
                    <Text style={styles.subTitle}>पॅथॉलॉजी चाचण्या, औषध खरेदी बिले व कुटुंबियांचा तपशील</Text>
                </View>

                {/* Side-by-Side Receipts Layout for Maximum Space & Clean Paging */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    {/* Left: Pathology */}
                    <View style={{ width: '49%' }}>
                        <Text style={[styles.sectionHeader, { marginTop: 0 }]}>अ. पॅथॉलॉजी व लॅब तपासणी बिले</Text>
                        <View style={styles.gridContainer}>
                            <View style={styles.tableHeaderRow} wrap={false}>
                                <View style={[styles.colSr, { width: '10%', fontWeight: 'bold' }]}><Text>#</Text></View>
                                <View style={[styles.colLabel, { width: '42%', fontWeight: 'bold' }]}><Text>बिल क्र.</Text></View>
                                <View style={[styles.colVal, { width: '24%', fontWeight: 'bold' }]}><Text style={{ textAlign: 'center' }}>दिनांक</Text></View>
                                <View style={[styles.colVal, { width: '24%', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>रक्कम (रु.)</Text></View>
                            </View>
                            {data.pathology_receipts && data.pathology_receipts.length > 0 ? (
                                data.pathology_receipts.map((r, i) => (
                                    <View key={i} style={styles.tableRow} wrap={false}>
                                        <View style={[styles.colSr, { width: '10%' }]}><Text>{i + 1}</Text></View>
                                        <View style={[styles.colLabel, { width: '42%' }]}><Text>{r.receipt_no || '-'}</Text></View>
                                        <View style={[styles.colVal, { width: '24%' }]}><Text style={{ textAlign: 'center' }}>{formatDateDisplay(r.date)}</Text></View>
                                        <View style={[styles.colVal, { width: '24%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(r.amount)}</Text></View>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.tableRow} wrap={false}>
                                    <View style={[styles.colVal, { width: '100%', textAlign: 'center' }]}><Text style={{ color: '#94a3b8', textAlign: 'center' }}>कोणतीही बिले नाहीत</Text></View>
                                </View>
                            )}
                            <View style={styles.totalRow} wrap={false}>
                                <View style={[styles.colLabel, { width: '52%', borderRightWidth: 1, borderRightColor: '#94a3b8' }]}>
                                    <Text style={{ fontWeight: 'bold' }}>एकूण लॅब खर्च</Text>
                                </View>
                                <View style={[styles.colVal, { width: '48%' }]}>
                                    <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>{fmt(totals.path_total)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Right: Medicines */}
                    <View style={{ width: '49%' }}>
                        <Text style={[styles.sectionHeader, { marginTop: 0 }]}>ब. औषधे व इंजेक्शन्स बिले</Text>
                        <View style={styles.gridContainer}>
                            <View style={styles.tableHeaderRow} wrap={false}>
                                <View style={[styles.colSr, { width: '10%', fontWeight: 'bold' }]}><Text>#</Text></View>
                                <View style={[styles.colLabel, { width: '42%', fontWeight: 'bold' }]}><Text>बिल क्र.</Text></View>
                                <View style={[styles.colVal, { width: '24%', fontWeight: 'bold' }]}><Text style={{ textAlign: 'center' }}>दिनांक</Text></View>
                                <View style={[styles.colVal, { width: '24%', fontWeight: 'bold' }]}><Text style={{ textAlign: 'right' }}>रक्कम (रु.)</Text></View>
                            </View>
                            {data.medicine_receipts && data.medicine_receipts.length > 0 ? (
                                data.medicine_receipts.map((r, i) => (
                                    <View key={i} style={styles.tableRow} wrap={false}>
                                        <View style={[styles.colSr, { width: '10%' }]}><Text>{i + 1}</Text></View>
                                        <View style={[styles.colLabel, { width: '42%' }]}><Text>{r.receipt_no || '-'}</Text></View>
                                        <View style={[styles.colVal, { width: '24%' }]}><Text style={{ textAlign: 'center' }}>{formatDateDisplay(r.date)}</Text></View>
                                        <View style={[styles.colVal, { width: '24%' }]}><Text style={{ textAlign: 'right' }}>{fmtInt(r.amount)}</Text></View>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.tableRow} wrap={false}>
                                    <View style={[styles.colVal, { width: '100%', textAlign: 'center' }]}><Text style={{ color: '#94a3b8', textAlign: 'center' }}>कोणतीही बिले नाहीत</Text></View>
                                </View>
                            )}
                            <View style={styles.totalRow} wrap={false}>
                                <View style={[styles.colLabel, { width: '52%', borderRightWidth: 1, borderRightColor: '#94a3b8' }]}>
                                    <Text style={{ fontWeight: 'bold' }}>एकूण औषध खर्च</Text>
                                </View>
                                <View style={[styles.colVal, { width: '48%' }]}>
                                    <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>{fmt(totals.med_total)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Section C: Dependent Family Members Declaration */}
                <Text style={styles.sectionHeader}>क. आर्थिकदृष्ट्या अवलंबून असलेल्या कुटुंबियांचा तपशील (परिशिष्ट - सात)</Text>
                <View style={styles.gridContainer} wrap={false}>
                    <View style={styles.tableHeaderRow}>
                        <View style={[styles.colSr, { width: '8%', fontWeight: 'bold' }]}><Text>अ.क्र.</Text></View>
                        <View style={[styles.colLabel, { width: '52%', fontWeight: 'bold' }]}><Text>कुटुंबियांचे पूर्ण नाव (Name of Family Member)</Text></View>
                        <View style={[styles.colVal, { width: '22%', fontWeight: 'bold' }]}><Text style={{ textAlign: 'center' }}>नाते (Relation)</Text></View>
                        <View style={[styles.colVal, { width: '18%', fontWeight: 'bold' }]}><Text style={{ textAlign: 'center' }}>वय (Age)</Text></View>
                    </View>
                    {[
                        { sr: '१', name: data.m_name_1, rel: data.m_rel_1, age: data.m_age_1 },
                        { sr: '२', name: data.m_name_2, rel: data.m_rel_2, age: data.m_age_2 },
                        { sr: '३', name: data.m_name_3, rel: data.m_rel_3, age: data.m_age_3 },
                        { sr: '४', name: data.m_name_4, rel: data.m_rel_4, age: data.m_age_4 },
                    ].map((m) => (
                        <View key={m.sr} style={styles.tableRow} wrap={false}>
                            <View style={[styles.colSr, { width: '8%' }]}><Text>{m.sr}</Text></View>
                            <View style={[styles.colLabel, { width: '52%' }]}><Text>{m.name || '-'}</Text></View>
                            <View style={[styles.colVal, { width: '22%' }]}><Text style={{ textAlign: 'center' }}>{m.rel || '-'}</Text></View>
                            <View style={[styles.colVal, { width: '18%' }]}><Text style={{ textAlign: 'center' }}>{m.age ? `${m.age} वर्षे` : '-'}</Text></View>
                        </View>
                    ))}
                </View>

                {/* Declaration Block */}
                <View style={{ marginTop: 8, padding: 6, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }} wrap={false}>
                    <Text style={{ fontSize: 7, color: '#334155', lineHeight: 1.25 }}>
                        प्रतिज्ञापत्र: मी याद्वारे प्रमाणित करतो/करते की, वरील वैद्यकीय प्रतिपूर्ती दाव्यात नमूद केलेली माहिती माझ्या माहितीप्रमाणे व समजुतीनुसार खरी व बरोबर आहे. ज्या व्यक्तीकरिता वैद्यकीय खर्च करण्यात आला आहे, ती व्यक्ती महाराष्ट्र नागरी सेवा (वैद्यकीय देखभाल) नियमानुसार माझ्यावर पूर्णतः अवलंबून आहे. सादर केलेली सर्व मूळ देयके, कॅश मेमो व चाचणी अहवाल खरे असून यापूर्वी या खर्चाचा परतावा इतर कुठूनही घेतलेला नाही.
                    </Text>
                </View>

                {/* Signatures on Page 3 */}
                <View style={styles.signatureContainer} wrap={false}>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>शासकीय कर्मचाऱ्याची स्वाक्षरी</Text>
                        <Text style={styles.sigSub}>दिनांक: _______________</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>पडताळणी अधिकारी / केमिस्ट</Text>
                        <Text style={styles.sigSub}>पडताळणी शिक्का व स्वाक्षरी</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <Text style={styles.sigTitle}>नियंत्रण अधिकारी / DDO</Text>
                        <Text style={styles.sigSub}>अदायगीस मंजुरी</Text>
                    </View>
                </View>

                <Text style={styles.footer} render={({ pageNumber, totalPages }) => `कर्मचारी कॉर्नर २.० • बिलांचे विवरण व कुटुंब तपशील • पान ${pageNumber} / ${totalPages}`} fixed />
            </Page>
        </Document>
    );
};

export default MedicalPDFDocument;
