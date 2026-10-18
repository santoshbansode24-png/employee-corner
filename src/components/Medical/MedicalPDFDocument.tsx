import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { MedicalFormData, MedicalTotals } from '@/utils/medicalCalculations';

// Register Nirmala font for high quality Marathi (Devanagari) & English rendering
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
        paddingTop: 16,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        fontFamily: 'Nirmala',
        fontSize: 8,
        color: '#000000'
    },
    outerBox: {
        borderWidth: 1,
        borderColor: '#000000',
        padding: 12,
        minHeight: '97%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    badgeHeader: {
        alignSelf: 'center',
        backgroundColor: '#e2e8f0',
        borderWidth: 1,
        borderColor: '#000000',
        paddingVertical: 3,
        paddingHorizontal: 20,
        marginBottom: 6
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000000'
    },
    mainTitle: {
        fontSize: 8.5,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 1.35,
        marginBottom: 8,
        color: '#000000'
    },
    noteText: {
        fontSize: 7.5,
        textAlign: 'center',
        marginBottom: 8,
        color: '#111827'
    },

    // Point rows (Key : Value alignment matching official Marathi form)
    pointRow: {
        flexDirection: 'row',
        marginBottom: 3.5,
        alignItems: 'flex-start'
    },
    pointLabel: {
        width: '54%',
        fontSize: 7.8,
        color: '#000000',
        lineHeight: 1.25
    },
    pointColon: {
        width: '3%',
        fontSize: 7.8,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#000000'
    },
    pointValue: {
        width: '43%',
        fontSize: 7.8,
        fontWeight: 'bold',
        color: '#000000',
        lineHeight: 1.25
    },

    sectionSubTitle: {
        fontSize: 8.5,
        fontWeight: 'bold',
        marginTop: 6,
        marginBottom: 4,
        color: '#000000',
        textDecoration: 'underline'
    },

    declarationBox: {
        marginTop: 6,
        paddingTop: 4,
        borderTopWidth: 0.8,
        borderTopColor: '#000000'
    },
    declarationTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 3
    },
    declarationBody: {
        fontSize: 7,
        lineHeight: 1.25,
        textAlign: 'justify'
    },

    sigRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 4
    },
    sigCol: {
        width: '32%',
        textAlign: 'center'
    },
    sigTextBold: {
        fontSize: 7.5,
        fontWeight: 'bold',
        color: '#000000'
    },
    sigTextSub: {
        fontSize: 6.8,
        color: '#334155',
        marginTop: 1.5
    },

    // Tables for Form C, D, Stay, Receipts
    table: {
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: '#000000',
        marginTop: 4,
        marginBottom: 6
    },
    tr: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000000',
        minHeight: 15,
        alignItems: 'stretch'
    },
    th: {
        backgroundColor: '#f1f5f9',
        fontWeight: 'bold',
        padding: 2.5,
        borderRightWidth: 1,
        borderColor: '#000000',
        fontSize: 7.2
    },
    td: {
        padding: 2.5,
        borderRightWidth: 1,
        borderColor: '#000000',
        fontSize: 7.2
    },

    footerText: {
        fontSize: 6.5,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 4
    }
});

interface MedicalPDFProps {
    data: MedicalFormData;
    totals: MedicalTotals;
}

const fmt = (val: number | string) => {
    const n = Number(val) || 0;
    return `रु. ${n.toLocaleString('en-IN')}`;
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

const renderPoint = (num: string, label: string, val: string | number) => (
    <View style={styles.pointRow} key={num} wrap={false}>
        <View style={styles.pointLabel}><Text>{label}</Text></View>
        <View style={styles.pointColon}><Text>:</Text></View>
        <View style={styles.pointValue}><Text>{val || '-'}</Text></View>
    </View>
);

const MedicalPDFDocument: React.FC<MedicalPDFProps> = ({ data, totals }) => {
    const empName = data.emp_name_marathi || data.emp_name_english || '-';
    const empDesig = data.emp_designation_marathi || data.emp_designation_english || '';
    const empFullName = data.emp_name_designation_marathi || (empDesig ? `${empName} (${empDesig})` : empName);
    const officeName = data.office_name_marathi || data.office_name_english || '-';
    const workPlace = data.work_place_marathi || data.place_of_illness || 'लातूर';
    const resAddress = data.res_address_marathi || data.res_address_english || '-';
    const patientName = data.patient_name_marathi || data.patient_name_english || data.patient_name || '-';
    const patientRel = data.patient_relation_marathi || data.patient_relation || 'स्वतः';
    const patientAge = data.patient_age ? `${data.patient_age}` : '';
    const illnessPlace = data.place_of_illness || workPlace;
    const admitFrom = formatDateDisplay(data.admit_date_from);
    const admitTo = formatDateDisplay(data.admit_date_to);
    const hospitalName = data.hospital_name_marathi || data.hospital_name_english || '-';
    const drName = data.dr_name_marathi || data.treating_doctor_name_english || '-';
    const grandClaim = totals.grand_claim || 0;
    const grandAdmissible = totals.grand_admissible || 0;

    return (
        <Document>
            {/* ========================================================================= */}
            {/* PAGE 1: परिशिष्ट १ (PARISHISHTA - 1) EXACT REPLICA OF OFFICIAL FORMAT     */}
            {/* ========================================================================= */}
            <Page size="A4" style={styles.page}>
                <View style={styles.outerBox}>
                    <View>
                        {/* Header Badge */}
                        <View style={styles.badgeHeader}>
                            <Text style={styles.badgeText}>परिशिष्ट १</Text>
                        </View>

                        {/* Title */}
                        <Text style={styles.mainTitle}>
                            कर्मचारी आणि त्यांचे कुटूंबीय यांची वैद्यकिय देखभाल आणि / किंवा उपचार यांच्या संबंधात करण्यांत आलेला{'\n'}
                            वैद्यकिय खर्चाच्या परताव्याची मागणी करण्याकरिता करावयाच्या अर्जाचा नमुना{'\n'}
                            (टीप : प्रत्येक रुग्णाकरिता स्वतंत्र नमुना वापरावा.)
                        </Text>

                        {/* 11 Numbered Questions matching official Maharashtra Parishishta 1 */}
                        {renderPoint('1', '१. कर्मचा-याचे नांव व पदनाम (ठळक अक्षरात)', empFullName)}
                        {renderPoint('2', '२. कर्मचारी ज्या कार्यालयात नोकरीत आहे त्या कार्यालयाचे नांव', officeName)}
                        {renderPoint('3', '३. वित्तीय नियमान्वये व्याख्या केल्याप्रमाणे कर्मचा-याचे वेतन इतर वित्तलब्धी स्वतंत्रपणे दर्शविण्यात याव्यात.', data.basic_pay ? `रु. ${fmtInt(data.basic_pay)}` : '-')}
                        {renderPoint('4', '४. कामाचे ठिकाण', workPlace)}
                        {renderPoint('5', '५. प्रत्यक्ष निवास स्थानाचा पत्ता', resAddress)}
                        {renderPoint('6', '६. रुग्णाचे नांव आणि कर्मचा-याचे त्याचे/तिचे नाते (मुलाच्या बाबतीत वय सुध्दा नमूद करावे)', `${patientName} : ${patientRel} ${patientAge ? `(${patientAge} वर्षे)` : ''}`)}
                        {renderPoint('7', '७. ज्या ठिकाणी रुग्ण आजारी झाला असेल ते ठिकाण', illnessPlace)}
                        {renderPoint('8', '८. आजाराचे स्वरुप व कालावधी', `${admitFrom} ते ${admitTo}`)}
                        {renderPoint('9', '९. मागणी केलेल्या रकमेचा तपशील', fmt(grandClaim))}
                        {renderPoint('10', '१०. कर्मचा-याच्या नियुक्तीचा दिनांक', formatDateDisplay(data.appointment_date))}
                        {renderPoint('11', '११. सेवानिवत्त कर्मचारी असल्यास सेवानिवत्तीचा दिनांक', formatDateDisplay(data.retirement_date))}

                        {/* वैद्यकिय देखभाल Sub-section */}
                        <Text style={styles.sectionSubTitle}>वैद्यकिय देखभाल</Text>

                        {renderPoint('s1', '१) रोग लक्षणासाठी सल्ला देण्याची फी (तपासणी व डॉक्टर सल्ला)\nअ) वैद्यकीय अधिकारी / तज्ज्ञाचे नाव, पदनाम व रुग्णालयाचे नाव', `${drName} / ${hospitalName}`)}
                        {renderPoint('s1b', 'ब) किती वेळा सल्ला घेण्यात आला, तारखा व फी', '-------')}
                        {renderPoint('s1c', 'क) सल्ला रुग्णालयात घेण्यात आला की निवासस्थानी', 'रुग्णालयात (In Hospital)')}

                        {renderPoint('s2', '२) रोग निदान चाचण्या (पॅथॉलॉजी / क्ष-किरण / सोनोग्राफी / लॅब) खर्च', fmt(totals.path_total))}
                        {renderPoint('s3', '३) रुग्णालयातील वास्तव्याचा खर्च (Room Rent & Stay Charges)', fmt(totals.stay_total))}
                        {renderPoint('s4', '४) बाजारातून प्रत्यक्ष खरेदी केलेल्या औषधांचा खर्च (Pharmacy Bills)', fmt(totals.med_total))}
                        {renderPoint('s5', '५) शस्त्रक्रिया व इतर उपचारांचा खर्च (Form D Procedural Charges)', fmt(totals.procedural_total))}
                        {renderPoint('s10', '१०) मागणी केलेली एकूण दावा रक्कम', fmt(grandClaim))}
                        {renderPoint('s11', '११) सहपत्रांची यादी', 'फॉर्म A/B/C/D, मूळ देयके, पावत्या व अहवाल')}
                    </View>

                    {/* Bottom: Declaration & Signatures */}
                    <View>
                        <View style={styles.declarationBox}>
                            <Text style={styles.declarationTitle}>कर्मचा-याने सही करुन द्यावयाचे प्रतिज्ञापत्र</Text>
                            <Text style={styles.declarationBody}>
                                मी याद्वारे जाहीर करतो / करते की, या अर्जामध्ये केलेली निवेदने माझ्या संपूर्ण माहितीप्रमाणे व विश्वासाप्रमाणे खरी असून ज्या व्यक्तीवर वैद्यकीय खर्च करण्यात आला ती व्यक्ती पूर्णपणे माझ्यावर अवलंबून आहे. या सोबत वैद्यकीय खर्चाची मूळ प्रमाणके कार्यालयास सादर करीत असून खर्चाची प्रतिपूर्ती मंजूर करण्यास विनंती आहे.
                            </Text>
                        </View>

                        <View style={styles.sigRow}>
                            <View style={styles.sigCol}>
                                <Text style={styles.sigTextBold}>दिनांक: {formatDateDisplay(data.cert_date) || '-'}</Text>
                                <Text style={styles.sigTextSub}>ठिकाण: {illnessPlace}</Text>
                            </View>
                            <View style={[styles.sigCol, { width: '40%' }]}>
                                <Text style={styles.sigTextBold}>{empName}</Text>
                                <Text style={styles.sigTextSub}>(शासकीय कर्मचाऱ्याची स्वाक्षरी)</Text>
                                <Text style={styles.sigTextSub}>{officeName}</Text>
                            </View>
                        </View>

                        <Text style={styles.footerText}>कर्मचारी कॉर्नर २.० • महाराष्ट्र नागरी सेवा (वैद्यकीय देखभाल) नियम • परिशिष्ट १ • पान १ / ५</Text>
                    </View>
                </View>
            </Page>

            {/* ========================================================================= */}
            {/* PAGE 2: CERTIFICATE FORM 'C' (आवश्यकता प्रमाणपत्र)                       */}
            {/* ========================================================================= */}
            <Page size="A4" style={styles.page}>
                <View style={styles.outerBox}>
                    <View>
                        <View style={styles.badgeHeader}>
                            <Text style={styles.badgeText}>CERTIFICATE FORM 'C'</Text>
                        </View>
                        <Text style={styles.mainTitle}>
                            CERTIFICATE OF EXPENSES FOR EMERGENCY MEDICAL TREATMENT OF GOVERNMENT SERVANT{'\n'}
                            (To be issued by Attending Private Hospital / Medical Officer)
                        </Text>

                        <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
                            <Text style={{ fontSize: 8.5, lineHeight: 1.6, textAlign: 'justify' }}>
                                This is to certify that Shri / Smt. <Text style={{ fontWeight: 'bold' }}>{patientName}</Text> ({patientRel}), relative of Shri / Smt. <Text style={{ fontWeight: 'bold' }}>{empFullName}</Text>, employed in the office of <Text style={{ fontWeight: 'bold' }}>{officeName}</Text>, residing at <Text style={{ fontWeight: 'bold' }}>{resAddress}</Text>, was treated by Dr. <Text style={{ fontWeight: 'bold' }}>{drName}</Text> at <Text style={{ fontWeight: 'bold' }}>{hospitalName}</Text> w.e.f. <Text style={{ fontWeight: 'bold' }}>{admitFrom}</Text> to <Text style={{ fontWeight: 'bold' }}>{admitTo}</Text> as an emergency patient.
                            </Text>

                            <Text style={{ fontSize: 8.5, lineHeight: 1.6, marginTop: 8, textAlign: 'justify' }}>
                                Necessary emergency clinical investigation, therapeutic procedures, and diagnostic scans were carried out. The emergency condition required immediate inpatient medical care to prevent life-threatening complications.
                            </Text>

                            <Text style={{ fontSize: 8.5, lineHeight: 1.6, marginTop: 8, textAlign: 'justify' }}>
                                Total expenditure incurred for the treatment was <Text style={{ fontWeight: 'bold' }}>{fmt(grandClaim)}</Text> (Rupees {grandClaim.toLocaleString('en-IN')}), the itemized particulars of which are detailed in Certificate Form 'D'.
                            </Text>

                            <Text style={{ fontSize: 8.5, lineHeight: 1.6, marginTop: 8, textAlign: 'justify' }}>
                                Certified that after emergency medical stabilization, the patient was advised necessary rest and follow-up medical guidance.
                            </Text>
                        </View>
                    </View>

                    <View>
                        <View style={[styles.sigRow, { marginTop: 30 }]}>
                            <View style={styles.sigCol}>
                                <Text style={styles.sigTextBold}>Place: {illnessPlace}</Text>
                                <Text style={styles.sigTextSub}>Date: {formatDateDisplay(data.cert_date) || '-'}</Text>
                            </View>
                            <View style={styles.sigCol}>
                                <Text style={styles.sigTextBold}>Treating Medical Officer</Text>
                                <Text style={styles.sigTextSub}>Signature & Reg. No.</Text>
                            </View>
                            <View style={styles.sigCol}>
                                <Text style={styles.sigTextBold}>Medical Superintendent</Text>
                                <Text style={styles.sigTextSub}>Hospital Seal & Stamp</Text>
                            </View>
                        </View>
                        <Text style={styles.footerText}>कर्मचारी कॉर्नर २.० • Form 'C' Essentiality Certificate • पान २ / ५</Text>
                    </View>
                </View>
            </Page>

            {/* ========================================================================= */}
            {/* PAGE 3: CERTIFICATE FORM 'D' & ROOM RENT MATRIX                           */}
            {/* ========================================================================= */}
            <Page size="A4" style={styles.page}>
                <View style={styles.outerBox}>
                    <View>
                        <View style={styles.badgeHeader}>
                            <Text style={styles.badgeText}>CERTIFICATE FORM 'D'</Text>
                        </View>
                        <Text style={styles.mainTitle}>
                            CERTIFICATE OF EXPENDITURE INCURRED FOR EMERGENCY TREATMENT{'\n'}
                            (Operative, Diagnostic, Therapeutic & Hospital Stay Charges)
                        </Text>

                        {/* Room Rent Stay Table */}
                        <Text style={[styles.sectionSubTitle, { marginTop: 2 }]}>१. रुग्णालयातील वास्तव्याचे विवरण (Hospital Room Rent & Stay Admissibility)</Text>
                        <View style={styles.table}>
                            <View style={styles.tr}>
                                <View style={[styles.th, { width: '8%', textAlign: 'center' }]}><Text>अ.क्र.</Text></View>
                                <View style={[styles.th, { width: '42%' }]}><Text>कक्षाचा प्रकार (Ward Category & Rule)</Text></View>
                                <View style={[styles.th, { width: '14%', textAlign: 'center' }]}><Text>दिवस</Text></View>
                                <View style={[styles.th, { width: '18%', textAlign: 'right' }]}><Text>दर / दिवस</Text></View>
                                <View style={[styles.th, { width: '18%', textAlign: 'right' }]}><Text>दावा रक्कम</Text></View>
                            </View>
                            <View style={styles.tr}>
                                <View style={[styles.td, { width: '8%', textAlign: 'center' }]}><Text>१</Text></View>
                                <View style={[styles.td, { width: '42%' }]}><Text>General Ward (९५% देय)</Text></View>
                                <View style={[styles.td, { width: '14%', textAlign: 'center' }]}><Text>{data.gw_days || '0'}</Text></View>
                                <View style={[styles.td, { width: '18%', textAlign: 'right' }]}><Text>{fmtInt(data.gw_rates)}</Text></View>
                                <View style={[styles.td, { width: '18%', textAlign: 'right' }]}><Text>{fmtInt(data.gw_total)}</Text></View>
                            </View>
                            <View style={styles.tr}>
                                <View style={[styles.td, { width: '8%', textAlign: 'center' }]}><Text>२</Text></View>
                                <View style={[styles.td, { width: '42%' }]}><Text>Semi-Private Ward (९०% देय)</Text></View>
                                <View style={[styles.td, { width: '14%', textAlign: 'center' }]}><Text>{data.semi_days || '0'}</Text></View>
                                <View style={[styles.td, { width: '18%', textAlign: 'right' }]}><Text>{fmtInt(data.semi_rates)}</Text></View>
                                <View style={[styles.td, { width: '18%', textAlign: 'right' }]}><Text>{fmtInt(data.semi_total)}</Text></View>
                            </View>
                            <View style={styles.tr}>
                                <View style={[styles.td, { width: '8%', textAlign: 'center' }]}><Text>३</Text></View>
                                <View style={[styles.td, { width: '42%' }]}><Text>Private Room (७५% देय)</Text></View>
                                <View style={[styles.td, { width: '14%', textAlign: 'center' }]}><Text>{data.pvt_days || '0'}</Text></View>
                                <View style={[styles.td, { width: '18%', textAlign: 'right' }]}><Text>{fmtInt(data.pvt_rates)}</Text></View>
                                <View style={[styles.td, { width: '18%', textAlign: 'right' }]}><Text>{fmtInt(data.pvt_total)}</Text></View>
                            </View>
                            <View style={styles.tr}>
                                <View style={[styles.td, { width: '8%', textAlign: 'center' }]}><Text>४</Text></View>
                                <View style={[styles.td, { width: '42%' }]}><Text>ICU / ICCU (१००% देय)</Text></View>
                                <View style={[styles.td, { width: '14%', textAlign: 'center' }]}><Text>{data.icu_days || '0'}</Text></View>
                                <View style={[styles.td, { width: '18%', textAlign: 'right' }]}><Text>{fmtInt(data.icu_rates)}</Text></View>
                                <View style={[styles.td, { width: '18%', textAlign: 'right' }]}><Text>{fmtInt(data.icu_total)}</Text></View>
                            </View>
                            <View style={[styles.tr, { backgroundColor: '#f8fafc' }]}>
                                <View style={[styles.td, { width: '50%', fontWeight: 'bold' }]}><Text>एकूण वास्तव्याचा खर्च (Room Rent Total)</Text></View>
                                <View style={[styles.td, { width: '25%', textAlign: 'right', fontWeight: 'bold' }]}><Text>दावा: {fmt(totals.stay_total)}</Text></View>
                                <View style={[styles.td, { width: '25%', textAlign: 'right', fontWeight: 'bold', color: '#166534' }]}><Text>देय: {fmt(totals.admissible_stay)}</Text></View>
                            </View>
                        </View>

                        {/* Form D Procedural Charges */}
                        <Text style={[styles.sectionSubTitle, { marginTop: 4 }]}>२. फॉर्म "डी" - शस्त्रक्रिया व उपचार शुल्क (Admissible @ 90%)</Text>
                        <View style={styles.table}>
                            <View style={styles.tr}>
                                <View style={[styles.th, { width: '8%', textAlign: 'center' }]}><Text>अ.क्र.</Text></View>
                                <View style={[styles.th, { width: '52%' }]}><Text>तपशील (Particulars of Treatment)</Text></View>
                                <View style={[styles.th, { width: '20%', textAlign: 'right' }]}><Text>दावा रक्कम (रु.)</Text></View>
                                <View style={[styles.th, { width: '20%', textAlign: 'right' }]}><Text>देय ९०% (रु.)</Text></View>
                            </View>

                            {[
                                { sr: '१', label: 'नोंदणी / ॲडमिशन शुल्क (Admission Charges)', val: data.admission_charges },
                                { sr: '२', label: 'शल्यचिकित्सक (सर्जन) फी (Surgeon Operation Fees)', val: data.surgeon_charges },
                                { sr: '३', label: 'सहाय्यक शल्यचिकित्सक फी (Assistant Surgeon Charges)', val: data.asst_surgeon_charges },
                                { sr: '४', label: 'भूलतज्ज्ञ (ॲनेस्थेटिस्ट) फी (Anesthetist Charges)', val: data.anesthesia_charges },
                                { sr: '५', label: 'ऑपरेशन थिएटर शुल्क (OT Charges)', val: data.ot_charges },
                                { sr: '६', label: 'ओटी असिस्टंट व नर्सिंग शुल्क (OT Assistant & Nursing)', val: Number(data.ot_assistant_charges || 0) + Number(data.nursing_charges || 0) },
                                { sr: '७', label: 'निवासी वैद्यकीय अधिकारी शुल्क (RMO Charges)', val: data.rmo_charges },
                                { sr: '८', label: 'डॉक्टर / तज्ज्ञ व्हिजिट फी (Doctor Visit Fees)', val: Number(data.doctor_visit_charges || 0) + Number(data.special_visit_charges || 0) },
                                { sr: '९', label: 'रेडिओलॉजी / सोनोग्राफी / CT / MRI (Imaging)', val: data.radiology_charges },
                                { sr: '१०', label: 'ऑक्सिजन / मॉनिटर / आयव्ही इन्फ्युजन (O2 / Monitor)', val: Number(data.oxygen_charges || 0) + Number(data.monitor_charges || 0) + Number(data.iv_infusion_charges || 0) },
                                { sr: '११', label: 'इतर संलग्न रुग्णालय शुल्क (Other Ancillary Charges)', val: data.other_charges },
                            ].map((item) => {
                                const amt = Number(item.val) || 0;
                                return (
                                    <View style={styles.tr} key={item.sr}>
                                        <View style={[styles.td, { width: '8%', textAlign: 'center' }]}><Text>{item.sr}</Text></View>
                                        <View style={[styles.td, { width: '52%' }]}><Text>{item.label}</Text></View>
                                        <View style={[styles.td, { width: '20%', textAlign: 'right' }]}><Text>{amt > 0 ? fmtInt(amt) : '-'}</Text></View>
                                        <View style={[styles.td, { width: '20%', textAlign: 'right' }]}><Text>{amt > 0 ? (amt * 0.9).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</Text></View>
                                    </View>
                                );
                            })}

                            <View style={[styles.tr, { backgroundColor: '#f8fafc' }]}>
                                <View style={[styles.td, { width: '60%', fontWeight: 'bold' }]}><Text>एकूण फॉर्म "डी" उपचार खर्च (Total Form D)</Text></View>
                                <View style={[styles.td, { width: '20%', textAlign: 'right', fontWeight: 'bold' }]}><Text>{fmt(totals.procedural_total)}</Text></View>
                                <View style={[styles.td, { width: '20%', textAlign: 'right', fontWeight: 'bold', color: '#166534' }]}><Text>{fmt(totals.admissible_procedural)}</Text></View>
                            </View>
                        </View>
                    </View>

                    <View>
                        <View style={styles.sigRow}>
                            <View style={styles.sigCol}>
                                <Text style={styles.sigTextBold}>शासकीय कर्मचारी</Text>
                                <Text style={styles.sigTextSub}>स्वाक्षरी</Text>
                            </View>
                            <View style={styles.sigCol}>
                                <Text style={styles.sigTextBold}>वैद्यकीय अधीक्षक</Text>
                                <Text style={styles.sigTextSub}>रुग्णालय शिक्का व सही</Text>
                            </View>
                            <View style={styles.sigCol}>
                                <Text style={styles.sigTextBold}>सक्षम प्राधिकारी</Text>
                                <Text style={styles.sigTextSub}>कार्यालय प्रमुख</Text>
                            </View>
                        </View>
                        <Text style={styles.footerText}>कर्मचारी कॉर्नर २.० • Form 'D' Procedural & Room Rent Statement • पान ३ / ५</Text>
                    </View>
                </View>
            </Page>

            {/* ========================================================================= */}
            {/* PAGE 4: एकत्रित गोषवारा व बिलांचा तपशील (RECEIPTS & SUMMARY)            */}
            {/* ========================================================================= */}
            <Page size="A4" style={styles.page}>
                <View style={styles.outerBox}>
                    <View>
                        <View style={styles.badgeHeader}>
                            <Text style={styles.badgeText}>एकत्रित वैद्यकीय खर्च गोषवारा व बिलांचा तपशील</Text>
                        </View>

                        {/* Grand Summary Table */}
                        <Text style={[styles.sectionSubTitle, { marginTop: 2 }]}>१. एकत्रित वैद्यकीय खर्च व मंजुरी गोषवारा (Consolidated Summary)</Text>
                        <View style={styles.table}>
                            <View style={styles.tr}>
                                <View style={[styles.th, { width: '8%', textAlign: 'center' }]}><Text>बाब</Text></View>
                                <View style={[styles.th, { width: '52%' }]}><Text>खर्चाच्या बाबींचा तपशील (Expenditure Head)</Text></View>
                                <View style={[styles.th, { width: '20%', textAlign: 'right' }]}><Text>दावा रक्कम (रु.)</Text></View>
                                <View style={[styles.th, { width: '20%', textAlign: 'right' }]}><Text>देय रक्कम (रु.)</Text></View>
                            </View>
                            <View style={styles.tr}>
                                <View style={[styles.td, { width: '8%', textAlign: 'center' }]}><Text>अ</Text></View>
                                <View style={[styles.td, { width: '52%' }]}><Text>रुग्णालयातील वास्तव्याचा खर्च (Room Rent & Stay)</Text></View>
                                <View style={[styles.td, { width: '20%', textAlign: 'right' }]}><Text>{fmt(totals.stay_total)}</Text></View>
                                <View style={[styles.td, { width: '20%', textAlign: 'right', color: '#166534' }]}><Text>{fmt(totals.admissible_stay)}</Text></View>
                            </View>
                            <View style={styles.tr}>
                                <View style={[styles.td, { width: '8%', textAlign: 'center' }]}><Text>ब</Text></View>
                                <View style={[styles.td, { width: '52%' }]}><Text>फॉर्म "डी" शस्त्रक्रिया व इतर उपचार खर्च</Text></View>
                                <View style={[styles.td, { width: '20%', textAlign: 'right' }]}><Text>{fmt(totals.procedural_total)}</Text></View>
                                <View style={[styles.td, { width: '20%', textAlign: 'right', color: '#166534' }]}><Text>{fmt(totals.admissible_procedural)}</Text></View>
                            </View>
                            <View style={styles.tr}>
                                <View style={[styles.td, { width: '8%', textAlign: 'center' }]}><Text>क</Text></View>
                                <View style={[styles.td, { width: '52%' }]}><Text>पॅथॉलॉजी व लॅब तपासण्या (Pathology Tests - ९०% देय)</Text></View>
                                <View style={[styles.td, { width: '20%', textAlign: 'right' }]}><Text>{fmt(totals.path_total)}</Text></View>
                                <View style={[styles.td, { width: '20%', textAlign: 'right', color: '#166534' }]}><Text>{fmt(totals.admissible_path)}</Text></View>
                            </View>
                            <View style={styles.tr}>
                                <View style={[styles.td, { width: '8%', textAlign: 'center' }]}><Text>ड</Text></View>
                                <View style={[styles.td, { width: '52%' }]}><Text>औषधे व इंजेक्शन्स (Medicines - ९०% देय)</Text></View>
                                <View style={[styles.td, { width: '20%', textAlign: 'right' }]}><Text>{fmt(totals.med_total)}</Text></View>
                                <View style={[styles.td, { width: '20%', textAlign: 'right', color: '#166534' }]}><Text>{fmt(totals.admissible_meds)}</Text></View>
                            </View>
                            <View style={[styles.tr, { backgroundColor: '#e2e8f0' }]}>
                                <View style={[styles.td, { width: '60%', fontWeight: 'bold' }]}><Text>एकूण मंजूर प्रस्ताव (GRAND TOTAL SANCTION)</Text></View>
                                <View style={[styles.td, { width: '20%', textAlign: 'right', fontWeight: 'bold' }]}><Text>{fmt(grandClaim)}</Text></View>
                                <View style={[styles.td, { width: '20%', textAlign: 'right', fontWeight: 'bold', color: '#166534' }]}><Text>{fmt(grandAdmissible)}</Text></View>
                            </View>
                        </View>

                        {/* Receipts Tables Side by Side */}
                        <Text style={[styles.sectionSubTitle, { marginTop: 4 }]}>२. तपासणी व औषध बिलांचा तपशील (Itemized Bills & Cash Memos)</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            {/* Pathology */}
                            <View style={{ width: '49%' }}>
                                <Text style={{ fontSize: 7.8, fontWeight: 'bold', marginBottom: 2 }}>अ. पॅथॉलॉजी व लॅब तपासणी बिले</Text>
                                <View style={styles.table}>
                                    <View style={styles.tr}>
                                        <View style={[styles.th, { width: '12%', textAlign: 'center' }]}><Text>#</Text></View>
                                        <View style={[styles.th, { width: '40%' }]}><Text>बिल क्र.</Text></View>
                                        <View style={[styles.th, { width: '24%', textAlign: 'center' }]}><Text>दिनांक</Text></View>
                                        <View style={[styles.th, { width: '24%', textAlign: 'right' }]}><Text>रक्कम</Text></View>
                                    </View>
                                    {data.pathology_receipts && data.pathology_receipts.length > 0 ? (
                                        data.pathology_receipts.map((r, i) => (
                                            <View key={i} style={styles.tr}>
                                                <View style={[styles.td, { width: '12%', textAlign: 'center' }]}><Text>{i + 1}</Text></View>
                                                <View style={[styles.td, { width: '40%' }]}><Text>{r.receipt_no || '-'}</Text></View>
                                                <View style={[styles.td, { width: '24%', textAlign: 'center' }]}><Text>{formatDateDisplay(r.date)}</Text></View>
                                                <View style={[styles.td, { width: '24%', textAlign: 'right' }]}><Text>{fmtInt(r.amount)}</Text></View>
                                            </View>
                                        ))
                                    ) : (
                                        <View style={styles.tr}><View style={[styles.td, { width: '100%', textAlign: 'center' }]}><Text style={{ color: '#64748b' }}>कोणतीही बिले नाहीत</Text></View></View>
                                    )}
                                    <View style={[styles.tr, { backgroundColor: '#f8fafc' }]}>
                                        <View style={[styles.td, { width: '52%', fontWeight: 'bold' }]}><Text>एकूण लॅब</Text></View>
                                        <View style={[styles.td, { width: '48%', textAlign: 'right', fontWeight: 'bold' }]}><Text>{fmt(totals.path_total)}</Text></View>
                                    </View>
                                </View>
                            </View>

                            {/* Medicines */}
                            <View style={{ width: '49%' }}>
                                <Text style={{ fontSize: 7.8, fontWeight: 'bold', marginBottom: 2 }}>ब. औषधे व इंजेक्शन्स बिले</Text>
                                <View style={styles.table}>
                                    <View style={styles.tr}>
                                        <View style={[styles.th, { width: '12%', textAlign: 'center' }]}><Text>#</Text></View>
                                        <View style={[styles.th, { width: '40%' }]}><Text>बिल क्र.</Text></View>
                                        <View style={[styles.th, { width: '24%', textAlign: 'center' }]}><Text>दिनांक</Text></View>
                                        <View style={[styles.th, { width: '24%', textAlign: 'right' }]}><Text>रक्कम</Text></View>
                                    </View>
                                    {data.medicine_receipts && data.medicine_receipts.length > 0 ? (
                                        data.medicine_receipts.map((r, i) => (
                                            <View key={i} style={styles.tr}>
                                                <View style={[styles.td, { width: '12%', textAlign: 'center' }]}><Text>{i + 1}</Text></View>
                                                <View style={[styles.td, { width: '40%' }]}><Text>{r.receipt_no || '-'}</Text></View>
                                                <View style={[styles.td, { width: '24%', textAlign: 'center' }]}><Text>{formatDateDisplay(r.date)}</Text></View>
                                                <View style={[styles.td, { width: '24%', textAlign: 'right' }]}><Text>{fmtInt(r.amount)}</Text></View>
                                            </View>
                                        ))
                                    ) : (
                                        <View style={styles.tr}><View style={[styles.td, { width: '100%', textAlign: 'center' }]}><Text style={{ color: '#64748b' }}>कोणतीही बिले नाहीत</Text></View></View>
                                    )}
                                    <View style={[styles.tr, { backgroundColor: '#f8fafc' }]}>
                                        <View style={[styles.td, { width: '52%', fontWeight: 'bold' }]}><Text>एकूण औषधे</Text></View>
                                        <View style={[styles.td, { width: '48%', textAlign: 'right', fontWeight: 'bold' }]}><Text>{fmt(totals.med_total)}</Text></View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View>
                        <View style={styles.sigRow}>
                            <View style={styles.sigCol}>
                                <Text style={styles.sigTextBold}>वरिष्ठ लिपिक / छाननी</Text>
                                <Text style={styles.sigTextSub}>आस्थापना शाखा</Text>
                            </View>
                            <View style={styles.sigCol}>
                                <Text style={styles.sigTextBold}>जिल्हा शल्य चिकित्सक</Text>
                                <Text style={styles.sigTextSub}>प्रतिस्वाक्षरी</Text>
                            </View>
                            <View style={styles.sigCol}>
                                <Text style={styles.sigTextBold}>कार्यालय प्रमुख / DDO</Text>
                                <Text style={styles.sigTextSub}>मंजुरी आदेश</Text>
                            </View>
                        </View>
                        <Text style={styles.footerText}>कर्मचारी कॉर्नर २.० • एकत्रित गोषवारा व बिलांचा तपशील • पान ४ / ५</Text>
                    </View>
                </View>
            </Page>

            {/* ========================================================================= */}
            {/* PAGE 5: हमीपत्र, कुटुंब तपशील व आवश्यक प्रमाणपत्रे                       */}
            {/* ========================================================================= */}
            <Page size="A4" style={styles.page}>
                <View style={styles.outerBox}>
                    <View>
                        <View style={styles.badgeHeader}>
                            <Text style={styles.badgeText}>हमीपत्र व आवश्यक प्रमाणपत्रे</Text>
                        </View>

                        {/* Family Declaration (Parishishta 7) */}
                        <Text style={[styles.sectionSubTitle, { marginTop: 2 }]}>१. कुटुंबाचा तपशील (परिशिष्ट - सात)</Text>
                        <View style={styles.table}>
                            <View style={styles.tr}>
                                <View style={[styles.th, { width: '10%', textAlign: 'center' }]}><Text>अ.क्र.</Text></View>
                                <View style={[styles.th, { width: '50%' }]}><Text>कुटुंबियांचे पूर्ण नाव (Name of Dependent)</Text></View>
                                <View style={[styles.th, { width: '22%', textAlign: 'center' }]}><Text>नाते (Relationship)</Text></View>
                                <View style={[styles.th, { width: '18%', textAlign: 'center' }]}><Text>वय (Age)</Text></View>
                            </View>
                            {[
                                { sr: '१', name: data.m_name_1, rel: data.m_rel_1, age: data.m_age_1 },
                                { sr: '२', name: data.m_name_2, rel: data.m_rel_2, age: data.m_age_2 },
                                { sr: '३', name: data.m_name_3, rel: data.m_rel_3, age: data.m_age_3 },
                                { sr: '४', name: data.m_name_4, rel: data.m_rel_4, age: data.m_age_4 },
                            ].map((m) => (
                                <View key={m.sr} style={styles.tr}>
                                    <View style={[styles.td, { width: '10%', textAlign: 'center' }]}><Text>{m.sr}</Text></View>
                                    <View style={[styles.td, { width: '50%' }]}><Text>{m.name || '-'}</Text></View>
                                    <View style={[styles.td, { width: '22%', textAlign: 'center' }]}><Text>{m.rel || '-'}</Text></View>
                                    <View style={[styles.td, { width: '18%', textAlign: 'center' }]}><Text>{m.age ? `${m.age} वर्षे` : '-'}</Text></View>
                                </View>
                            ))}
                        </View>

                        {/* Undertaking & Certificates */}
                        <Text style={[styles.sectionSubTitle, { marginTop: 4 }]}>२. हमीपत्र व प्रमाणपत्रे</Text>
                        <View style={{ marginTop: 2, paddingHorizontal: 2 }}>
                            <Text style={{ fontSize: 7.5, lineHeight: 1.45, marginBottom: 4, textAlign: 'justify' }}>
                                <Text style={{ fontWeight: 'bold' }}>अ) हमी पत्र (दावा इतरत्र सादर न केल्याबाबत):</Text> मी, {empFullName}, याद्वारे हमीपत्र देतो/देते की, प्रस्तुत वैद्यकीय प्रतिपूर्ती दावा यापूर्वी कोणत्याही अन्य स्त्रोताकडून वा कार्यालयाकडून मंजूर झालेला नाही किंवा मागणी केलेला नाही.
                            </Text>
                            <Text style={{ fontSize: 7.5, lineHeight: 1.45, marginBottom: 4, textAlign: 'justify' }}>
                                <Text style={{ fontWeight: 'bold' }}>ब) मर्यादित कुटुंब प्रमाणपत्र:</Text> प्रमाणित करण्यात येते की, महाराष्ट्र नागरी सेवा नियमांनुसार दिनांक २८/०३/२००५ नंतर माझ्या हयातीत असलेल्या अपत्यांची संख्या दोनपेक्षा अधिक नाही.
                            </Text>
                            <Text style={{ fontSize: 7.5, lineHeight: 1.45, marginBottom: 4, textAlign: 'justify' }}>
                                <Text style={{ fontWeight: 'bold' }}>क) अकस्मिकतेबाबत प्रमाणपत्र:</Text> प्रमाणित करण्यात येते की, रुग्ण श्री/सौ. {patientName} यांना अचानक उद्भवलेल्या आजारपणामुळे तात्काळ आपत्कालीन वैद्यकीय उपचारांसाठी भरती करणे अनिवार्य होते.
                            </Text>
                            <Text style={{ fontSize: 7.5, lineHeight: 1.45, marginBottom: 4, textAlign: 'justify' }}>
                                <Text style={{ fontWeight: 'bold' }}>ड) आयकर विवरण पत्र परतावा प्रमाणपत्र:</Text> मिळणारी वैद्यकीय खर्चाची प्रतिपूर्ती रक्कम संबंधित आर्थिक वर्षाच्या आयकर विवरण पत्रामध्ये नियमानुसार दर्शविण्यात येईल.
                            </Text>
                            <Text style={{ fontSize: 7.5, lineHeight: 1.45, textAlign: 'justify' }}>
                                <Text style={{ fontWeight: 'bold' }}>इ) बेरीज व देयके पडताळणी प्रमाणपत्र:</Text> कार्यालयातील मूळ प्रमाणके, पावत्या व अहवालांची बेरीज अचूक असून महाराष्ट्र नागरी सेवा (वैद्यकीय देखभाल) नियमानुसार पडताळण्यात आलेली आहे.
                            </Text>
                        </View>
                    </View>

                    <View>
                        <View style={[styles.sigRow, { marginTop: 14 }]}>
                            <View style={styles.sigCol}>
                                <Text style={styles.sigTextBold}>{empName}</Text>
                                <Text style={styles.sigTextSub}>शासकीय कर्मचाऱ्याची स्वाक्षरी</Text>
                                <Text style={styles.sigTextSub}>दिनांक: {formatDateDisplay(data.cert_date) || '-'}</Text>
                            </View>
                            <View style={styles.sigCol}>
                                <Text style={styles.sigTextBold}>पडताळणी अधिकारी</Text>
                                <Text style={styles.sigTextSub}>स्वाक्षरी व शिक्का</Text>
                            </View>
                            <View style={styles.sigCol}>
                                <Text style={styles.sigTextBold}>कार्यालय प्रमुख / DDO</Text>
                                <Text style={styles.sigTextSub}>अदायगीस मंजुरी</Text>
                            </View>
                        </View>
                        <Text style={styles.footerText}>कर्मचारी कॉर्नर २.० • हमीपत्र, कुटुंब तपशील व प्रमाणपत्रे • पान ५ / ५</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default MedicalPDFDocument;
