import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PensionResult } from '@/utils/pensionCalculations';

const styles = StyleSheet.create({
    page: { padding: 35, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
    
    // Header
    headerContainer: { backgroundColor: '#312e81', padding: 16, marginBottom: 16, borderRadius: 6, textAlign: 'center' },
    headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'extrabold', letterSpacing: 0.5 },
    headerSubtitle: { color: '#c7d2fe', fontSize: 9, marginTop: 3 },

    // Details Grid
    detailsBox: { marginBottom: 14, padding: 10, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 5 },
    detailsTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 6, color: '#1e1b4b' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    detailCol: { width: '48%' },
    detailText: { fontSize: 8.5, color: '#475569' },
    detailValue: { fontSize: 8.5, fontWeight: 'bold', color: '#0f172a' },

    // Tables
    table: { width: '100%', marginBottom: 14, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, overflow: 'hidden' },
    tableHeaderRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 1 },
    tableRow: { flexDirection: 'row', padding: 5, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    colLeft: { flex: 1.5, fontSize: 8.5, color: '#334155' },
    colRight: { flex: 1, fontSize: 8.5, textAlign: 'right', fontWeight: 'bold', color: '#0f172a' },
    
    // Specific Headers
    blueHeader: { backgroundColor: '#e0e7ff', borderBottomColor: '#c7d2fe' },
    purpleHeader: { backgroundColor: '#f3e8ff', borderBottomColor: '#e9d5ff' },
    greenHeader: { backgroundColor: '#ecfdf5', borderBottomColor: '#a7f3d0' },
    totalRow: { backgroundColor: '#f8fafc', borderTopWidth: 1.5, borderTopColor: '#cbd5e1' },

    // Highlights Box
    summaryInflowBox: { backgroundColor: '#047857', padding: 12, borderRadius: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    inflowLabel: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
    inflowValue: { color: '#ffffff', fontSize: 15, fontWeight: 'extrabold' },

    // Signatures
    signaturesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, paddingHorizontal: 15 },
    sigBlock: { alignItems: 'center', width: '38%' },
    sigLine: { borderTopWidth: 1, borderTopColor: '#000', width: '100%', marginBottom: 4 },
    sigTitle: { fontSize: 8.5, fontWeight: 'bold', color: '#334155' },

    // Footer
    footer: { position: 'absolute', bottom: 15, left: 0, right: 0, textAlign: 'center' },
    footerText: { fontSize: 7.5, color: '#94a3b8' }
});

interface PensionPDFProps {
    result: PensionResult;
}

const formatINR = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const PensionPDFDocument: React.FC<PensionPDFProps> = ({ result }) => {
    if (!result) return null;

    const renderTableRow = (label: string, amount: number) => (
        <View style={styles.tableRow} key={label}>
            <Text style={styles.colLeft}>{label}</Text>
            <Text style={styles.colRight}>₹{formatINR(amount)}</Text>
        </View>
    );

    const totalLumpSum = (result.cvp || 0) + (result.gratuity || 0) + (result.leaveEncashment || 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                {/* Header Container */}
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>RETIREMENT BENEFITS & PENSION ESTIMATE</Text>
                    <Text style={styles.headerSubtitle}>
                        Maharashtra Civil Services (Pension) Rules • 7th Pay Commission Calculation Statement
                    </Text>
                </View>

                {/* Employee Info Block */}
                <View style={styles.detailsBox}>
                    <Text style={styles.detailsTitle}>Pensioner & Service Credentials</Text>
                    <View style={styles.detailRow}>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailText}>Employee Name: <Text style={styles.detailValue}>{result.name || '-'}</Text></Text>
                        </View>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailText}>Date of Birth: <Text style={styles.detailValue}>{result.dob || '-'}</Text></Text>
                        </View>
                    </View>
                    <View style={styles.detailRow}>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailText}>Date of Joining: <Text style={styles.detailValue}>{result.doj || '-'}</Text></Text>
                        </View>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailText}>Date of Retirement: <Text style={styles.detailValue}>{result.retirementDate || '-'}</Text></Text>
                        </View>
                    </View>
                    <View style={styles.detailRow}>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailText}>Qualifying Service: <Text style={styles.detailValue}>{result.serviceLength.years} yrs, {result.serviceLength.months} mos</Text></Text>
                        </View>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailText}>Last Basic Pay: <Text style={styles.detailValue}>₹{formatINR(result.basicPay)} (DA: {result.daRate}%)</Text></Text>
                        </View>
                    </View>
                </View>

                {/* Pension Details Table */}
                <View style={styles.table}>
                    <View style={[styles.tableHeaderRow, styles.blueHeader]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#1e1b4b' }]}>Regular Monthly Pension (मासिक निवृत्तीवेतन)</Text>
                        <Text style={[styles.colRight, { color: '#1e1b4b' }]}>Amount (₹)</Text>
                    </View>
                    {renderTableRow('Basic Pension (50% of Last Basic Pay)', result.basicPension)}
                    {renderTableRow('Commuted Pension (40% of Basic Pension)', result.commutedPension)}
                    {renderTableRow(`Commutation Capital Value (CVP Factor: ${result.cvpRate})`, result.cvp)}
                    {renderTableRow('Reduced / Residual Pension (After 40% Commutation)', result.reducedPension)}
                    {renderTableRow(`Dearness Relief on Pension (DA @ ${result.daRate}%)`, result.daOnPension)}
                    
                    <View style={[styles.tableRow, styles.totalRow]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#1e1b4b' }]}>NET DISBURSABLE MONTHLY PENSION</Text>
                        <Text style={[styles.colRight, { color: '#1e1b4b' }]}>₹{formatINR(result.netPension)}</Text>
                    </View>
                </View>

                {/* Family Pension Table */}
                <View style={styles.table}>
                    <View style={[styles.tableHeaderRow, styles.purpleHeader]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#581c87' }]}>Family Pension Details (कुटुंब निवृत्तीवेतन)</Text>
                        <Text style={[styles.colRight, { color: '#581c87' }]}>Amount (₹)</Text>
                    </View>
                    {renderTableRow('Normal Family Pension (30% of Last Pay)', result.familyPension)}
                    {renderTableRow(`Dearness Relief on Family Pension (${result.daRate}%)`, result.daOnFamilyPension)}
                    
                    <View style={[styles.tableRow, styles.totalRow]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#581c87' }]}>TOTAL MONTHLY FAMILY PENSION</Text>
                        <Text style={[styles.colRight, { color: '#581c87' }]}>₹{formatINR(result.totalFamilyPension)}</Text>
                    </View>
                </View>

                {/* Retirement Lump Sum Terminal Benefits */}
                <View style={styles.table}>
                    <View style={[styles.tableHeaderRow, styles.greenHeader]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#065f46' }]}>One-Time Lump Sum Retirement Benefits (एकवेळ मिळणारी रक्कम)</Text>
                        <Text style={[styles.colRight, { color: '#065f46' }]}>Amount (₹)</Text>
                    </View>
                    {renderTableRow('Commutation of Pension (CVP - 40% Commuted Value)', result.cvp)}
                    {renderTableRow('Retirement Gratuity / DCRG (Basic + DA × Qualifying Half Years)', result.gratuity)}
                    {renderTableRow(`Earned Leave Encashment (${result.earnedLeave} Days)`, result.leaveEncashment)}
                    <View style={[styles.tableRow, styles.totalRow]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#065f46' }]}>TOTAL TERMINAL RETIREMENT INFLOW</Text>
                        <Text style={[styles.colRight, { color: '#065f46' }]}>₹{formatINR(totalLumpSum)}</Text>
                    </View>
                </View>

                {/* Summary Inflow Box */}
                <View style={styles.summaryInflowBox}>
                    <Text style={styles.inflowLabel}>TOTAL ONE-TIME RETIREMENT RECEIPT (निवृत्ती समयी एकूण प्राप्ती)</Text>
                    <Text style={styles.inflowValue}>₹ {formatINR(totalLumpSum)}</Text>
                </View>

                {/* Signatures */}
                <View style={styles.signaturesRow}>
                    <View style={styles.sigBlock}>
                        <View style={styles.sigLine} />
                        <Text style={styles.sigTitle}>Prepared by / Verified</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <View style={styles.sigLine} />
                        <Text style={styles.sigTitle}>Head of Office / Sanctioning Authority</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Generated electronically by Smart Toolkit 2.0 • Calculated as per Maharashtra Civil Services Pension Rules 1982
                    </Text>
                </View>

            </Page>
        </Document>
    );
};

export default PensionPDFDocument;
