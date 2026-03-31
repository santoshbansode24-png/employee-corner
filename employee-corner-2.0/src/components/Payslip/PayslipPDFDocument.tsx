import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
    
    // Header
    headerContainer: { backgroundColor: '#3b82f6', padding: 20, marginBottom: 20, borderRadius: 5 },
    headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    headerSubtitle: { color: '#ffffff', fontSize: 12, textAlign: 'center' },

    // Details Grid
    detailsBox: { marginBottom: 20 },
    detailsTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#1f2937' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    detailText: { fontSize: 10, color: '#4b5563' },
    detailValue: { fontSize: 10, fontWeight: 'bold', color: '#1f2937' },

    // Tables
    table: { width: '100%', marginBottom: 20 },
    tableHeaderRow: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 8, borderBottomWidth: 1, borderBottomColor: '#d1d5db' },
    tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    colLeft: { flex: 1, fontSize: 10, color: '#4b5563' },
    colRight: { flex: 1, fontSize: 10, textAlign: 'right', fontWeight: 'bold', color: '#1f2937' },
    
    // Table Specific Colors
    allowanceHeader: { backgroundColor: '#eff6ff', borderBottomColor: '#bfdbfe' },
    deductionHeader: { backgroundColor: '#fef2f2', borderBottomColor: '#fecaca' },
    totalRow: { backgroundColor: '#f9fafb', borderTopWidth: 2, borderTopColor: '#d1d5db' },

    // Net Salary Box
    netSalaryBox: { backgroundColor: '#22c55e', padding: 15, borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    netSalaryLabel: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
    netSalaryValue: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },

    // Footer
    footer: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center' },
    footerText: { fontSize: 8, color: '#9ca3af', fontStyle: 'italic' }
});

interface PayslipPDFProps {
    result: any;
}

const PayslipPDFDocument: React.FC<PayslipPDFProps> = ({ result }) => {
    if (!result) return null;

    const renderTableRow = (label: string, amount: number) => {
        if (!amount || amount === 0) return null;
        return (
            <View style={styles.tableRow} key={label}>
                <Text style={styles.colLeft}>{label}</Text>
                <Text style={styles.colRight}>{amount.toFixed(2)}</Text>
            </View>
        );
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>PAYSLIP</Text>
                    <Text style={styles.headerSubtitle}>Maharashtra Government Employee</Text>
                </View>

                <View style={styles.detailsBox}>
                    <Text style={styles.detailsTitle}>Employee Details</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Type: <Text style={styles.detailValue}>{result.metadata.employeeType}</Text></Text>
                        <Text style={styles.detailText}>City: <Text style={styles.detailValue}>{result.metadata.city} ({result.metadata.cityCategory})</Text></Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Class: <Text style={styles.detailValue}>{result.metadata.employeeClass}</Text></Text>
                        <Text style={styles.detailText}>DA Rate: <Text style={styles.detailValue}>{result.metadata.daRate}%</Text></Text>
                    </View>
                </View>

                {/* Allowances Table */}
                <View style={styles.table}>
                    <View style={[styles.tableHeaderRow, styles.allowanceHeader]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#1d4ed8' }]}>Allowances</Text>
                        <Text style={[styles.colRight, { color: '#1d4ed8' }]}>Amount (₹)</Text>
                    </View>
                    {renderTableRow('Basic Salary', result.allowances.basic)}
                    {renderTableRow('Dearness Allowance (DA)', result.allowances.da)}
                    {renderTableRow('House Rent Allowance (HRA)', result.allowances.hra)}
                    {renderTableRow('Transport Allowance (TA)', result.allowances.ta)}
                    {renderTableRow('Per TA', result.allowances.perTA)}
                    {result.allowances.additionalAllowances.map((a: any) => renderTableRow(a.type, a.calculatedAmount))}
                    <View style={[styles.tableRow, styles.totalRow]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#000' }]}>TOTAL ALLOWANCES</Text>
                        <Text style={[styles.colRight, { color: '#000' }]}>{result.allowances.total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Deductions Table */}
                <View style={styles.table}>
                    <View style={[styles.tableHeaderRow, styles.deductionHeader]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#b91c1c' }]}>Deductions</Text>
                        <Text style={[styles.colRight, { color: '#b91c1c' }]}>Amount (₹)</Text>
                    </View>
                    {renderTableRow('Professional Tax', result.deductions.professionalTax)}
                    {renderTableRow('GIS', result.deductions.gis)}
                    {renderTableRow('DCPS (NPS)', result.deductions.dcps)}
                    {renderTableRow('GPF Subscription', result.deductions.gpfSubscription)}
                    {renderTableRow('GPF Recovery', result.deductions.gpfRecovery)}
                    {renderTableRow('Festival Advance', result.deductions.festivalAdvance)}
                    {renderTableRow('Other Advances', result.deductions.otherAdvances)}
                    {renderTableRow('Other Recovery', result.deductions.otherRecovery)}
                    {renderTableRow('Income Tax', result.deductions.incomeTax)}
                    <View style={[styles.tableRow, styles.totalRow]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#000' }]}>TOTAL DEDUCTIONS</Text>
                        <Text style={[styles.colRight, { color: '#000' }]}>{result.deductions.total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Net Salary Box */}
                <View style={styles.netSalaryBox}>
                    <Text style={styles.netSalaryLabel}>NET SALARY</Text>
                    <Text style={styles.netSalaryValue}>₹ {result.netSalary.toFixed(2)}</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Generated by Smart Employee Toolkit</Text>
                    <Text style={styles.footerText}>Date: {new Date().toLocaleDateString()}</Text>
                </View>

            </Page>
        </Document>
    );
};

export default PayslipPDFDocument;
