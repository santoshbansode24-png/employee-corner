import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 30, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
    
    // Header
    headerContainer: { backgroundColor: '#1e3a8a', padding: 14, marginBottom: 14, borderRadius: 6, textAlign: 'center' },
    officeName: { color: '#e0e7ff', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
    headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'extrabold', letterSpacing: 1 },
    headerSubtitle: { color: '#93c5fd', fontSize: 9, marginTop: 2 },

    // Details Grid
    detailsBox: { marginBottom: 14, padding: 10, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 5, backgroundColor: '#f8fafc' },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    detailCol: { width: '48%' },
    detailText: { fontSize: 9, color: '#475569' },
    detailValue: { fontSize: 9, fontWeight: 'bold', color: '#0f172a' },

    // Tables Container Side by Side
    tablesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
    tableCol: { width: '49%' },
    table: { width: '100%', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, overflow: 'hidden' },
    tableHeaderRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 1 },
    tableRow: { flexDirection: 'row', padding: 5, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    colLeft: { flex: 1.4, fontSize: 8.5, color: '#334155' },
    colRight: { flex: 1, fontSize: 8.5, textAlign: 'right', fontWeight: 'bold', color: '#0f172a' },
    
    // Table Specific Colors
    allowanceHeader: { backgroundColor: '#ecfdf5', borderBottomColor: '#a7f3d0' },
    deductionHeader: { backgroundColor: '#fef2f2', borderBottomColor: '#fecaca' },
    totalRow: { backgroundColor: '#f8fafc', borderTopWidth: 1.5, borderTopColor: '#cbd5e1' },

    // Net Salary Box
    netSalaryBox: { backgroundColor: '#047857', padding: 12, borderRadius: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    netSalaryLabel: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
    netSalaryValue: { color: '#ffffff', fontSize: 16, fontWeight: 'extrabold' },

    // Signatures
    signaturesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, paddingHorizontal: 15 },
    sigBlock: { alignItems: 'center', width: '38%' },
    sigLine: { borderTopWidth: 1, borderTopColor: '#000', width: '100%', marginBottom: 4 },
    sigTitle: { fontSize: 8.5, fontWeight: 'bold', color: '#334155' },

    // Footer
    footer: { position: 'absolute', bottom: 15, left: 0, right: 0, textAlign: 'center' },
    footerText: { fontSize: 7.5, color: '#94a3b8' }
});

interface PayslipPDFProps {
    result: any;
}

const formatINR = (num: number) => {
    if (num === undefined || num === null || isNaN(num)) return '0.00';
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const PayslipPDFDocument: React.FC<PayslipPDFProps> = ({ result }) => {
    if (!result) return null;

    const renderTableRow = (label: string, amount: number) => {
        if (!amount || amount === 0) return null;
        return (
            <View style={styles.tableRow} key={label}>
                <Text style={styles.colLeft}>{label}</Text>
                <Text style={styles.colRight}>₹{formatINR(amount)}</Text>
            </View>
        );
    };

    const meta = result.metadata || {};

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                {/* Header Container */}
                <View style={styles.headerContainer}>
                    <Text style={styles.officeName}>{meta.officeName || 'GOVERNMENT OF MAHARASHTRA'}</Text>
                    <Text style={styles.headerTitle}>SALARY SLIP / वेतन पावती</Text>
                    <Text style={styles.headerSubtitle}>
                        Month: {meta.month || new Date().toISOString().substring(0, 7)} • 7th Pay Commission Scale
                    </Text>
                </View>

                {/* Details Grid */}
                <View style={styles.detailsBox}>
                    <View style={styles.detailsRow}>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailText}>Employee Name: <Text style={styles.detailValue}>{meta.empName || '-'}</Text></Text>
                        </View>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailText}>Designation: <Text style={styles.detailValue}>{meta.designation || '-'}</Text></Text>
                        </View>
                    </View>
                    <View style={styles.detailsRow}>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailText}>PRAN / GPF No: <Text style={styles.detailValue}>{meta.pranNo || '-'}</Text></Text>
                        </View>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailText}>Scheme / Class: <Text style={styles.detailValue}>{meta.employeeType} (Class {meta.employeeClass})</Text></Text>
                        </View>
                    </View>
                    <View style={styles.detailsRow}>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailText}>Station: <Text style={styles.detailValue}>{meta.city || 'Z Category'} (HRA: {meta.hraRate}%)</Text></Text>
                        </View>
                        <View style={styles.detailCol}>
                            <Text style={styles.detailText}>DA Rate: <Text style={styles.detailValue}>{meta.daRate}%</Text></Text>
                        </View>
                    </View>
                </View>

                {/* Side-by-Side Tables: Allowances vs Deductions */}
                <View style={styles.tablesContainer}>
                    
                    {/* Allowances Table */}
                    <View style={styles.tableCol}>
                        <View style={styles.table}>
                            <View style={[styles.tableHeaderRow, styles.allowanceHeader]}>
                                <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#047857' }]}>ALLOWANCES (देणी)</Text>
                                <Text style={[styles.colRight, { color: '#047857' }]}>Amount (₹)</Text>
                            </View>
                            {renderTableRow('Basic Salary (मूळ वेतन)', result.allowances.basic)}
                            {renderTableRow(`Dearness Allowance (${meta.daRate}%)`, result.allowances.da)}
                            {renderTableRow(`House Rent (${meta.hraRate}%)`, result.allowances.hra)}
                            {renderTableRow('Transport Allowance (TA)', result.allowances.ta)}
                            {renderTableRow('DA on TA', result.allowances.daOnTA)}
                            {renderTableRow('Per TA', result.allowances.perTA)}
                            {result.allowances.additionalAllowances?.map((a: any) => renderTableRow(a.type, a.calculatedAmount))}
                            <View style={[styles.tableRow, styles.totalRow]}>
                                <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#047857' }]}>TOTAL EARNINGS</Text>
                                <Text style={[styles.colRight, { color: '#047857' }]}>₹{formatINR(result.allowances.total)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Deductions Table */}
                    <View style={styles.tableCol}>
                        <View style={styles.table}>
                            <View style={[styles.tableHeaderRow, styles.deductionHeader]}>
                                <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#b91c1c' }]}>DEDUCTIONS (कपाती)</Text>
                                <Text style={[styles.colRight, { color: '#b91c1c' }]}>Amount (₹)</Text>
                            </View>
                            {renderTableRow('Professional Tax (व्यवसाय कर)', result.deductions.professionalTax)}
                            {renderTableRow('GIS (गट विमा)', result.deductions.gis)}
                            {renderTableRow('DCPS / NPS (10%)', result.deductions.dcps)}
                            {renderTableRow('GPF Subscription', result.deductions.gpfSubscription)}
                            {renderTableRow('GPF Recovery', result.deductions.gpfRecovery)}
                            {renderTableRow('Festival Advance', result.deductions.festivalAdvance)}
                            {renderTableRow('Other Advances', result.deductions.otherAdvances)}
                            {renderTableRow('Other Recovery', result.deductions.otherRecovery)}
                            {renderTableRow('Income Tax (TDS)', result.deductions.incomeTax)}
                            <View style={[styles.tableRow, styles.totalRow]}>
                                <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#b91c1c' }]}>TOTAL DEDUCTIONS</Text>
                                <Text style={[styles.colRight, { color: '#b91c1c' }]}>₹{formatINR(result.deductions.total)}</Text>
                            </View>
                        </View>
                    </View>

                </View>

                {/* Net Salary Box */}
                <View style={styles.netSalaryBox}>
                    <Text style={styles.netSalaryLabel}>NET DISBURSED SALARY (निव्वळ देय वेतन)</Text>
                    <Text style={styles.netSalaryValue}>₹ {formatINR(result.netSalary)}</Text>
                </View>

                {/* Government Contribution Info for NPS */}
                {meta.employeeType === 'NPS' && (
                    <View style={{ marginBottom: 15, padding: 6, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 4 }}>
                        <Text style={{ fontSize: 8, color: '#166534', textAlign: 'center' }}>
                            * Government NPS Contribution (14%): ₹{formatINR(result.deductions.npsGovt || 0)} credited directly to PRAN account.
                        </Text>
                    </View>
                )}

                {/* Signatures */}
                <View style={styles.signaturesRow}>
                    <View style={styles.sigBlock}>
                        <View style={styles.sigLine} />
                        <Text style={styles.sigTitle}>Prepared By (लिपिक)</Text>
                    </View>
                    <View style={styles.sigBlock}>
                        <View style={styles.sigLine} />
                        <Text style={styles.sigTitle}>Drawing & Disbursing Officer (DDO)</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Generated electronically by Smart Employee Toolkit 2.0 • Computer Generated Slip No Signature Required
                    </Text>
                </View>

            </Page>
        </Document>
    );
};

export default PayslipPDFDocument;
