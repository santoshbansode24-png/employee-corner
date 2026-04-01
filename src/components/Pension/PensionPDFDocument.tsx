import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PensionResult } from '@/utils/pensionCalculations';

const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
    
    // Header
    headerContainer: { backgroundColor: '#3b82f6', padding: 20, marginBottom: 20, borderRadius: 5 },
    headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    headerSubtitle: { color: '#ffffff', fontSize: 12, textAlign: 'center' },

    // Details Grid
    detailsBox: { marginBottom: 20, padding: 10, backgroundColor: '#f9fafb', borderLeft: '3px solid #3b82f6' },
    detailsTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    detailText: { fontSize: 10, color: '#4b5563' },
    detailValue: { fontSize: 10, fontWeight: 'bold', color: '#1f2937' },

    // Tables
    table: { width: '100%', marginBottom: 20 },
    tableHeaderRow: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 8, borderBottomWidth: 1, borderBottomColor: '#d1d5db' },
    tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    colLeft: { flex: 1, fontSize: 10, color: '#4b5563' },
    colRight: { flex: 1, fontSize: 10, textAlign: 'right', fontWeight: 'bold', color: '#1f2937' },
    
    // Specific Headers
    blueHeader: { backgroundColor: '#eff6ff', borderBottomColor: '#bfdbfe' },
    purpleHeader: { backgroundColor: '#f5f3ff', borderBottomColor: '#ddd6fe' },
    greenHeader: { backgroundColor: '#f0fdf4', borderBottomColor: '#bbf7d0' },

    // Footer
    footer: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center' },
    footerText: { fontSize: 8, color: '#9ca3af', fontStyle: 'italic' }
});

interface PensionPDFProps {
    result: PensionResult;
}

const PensionPDFDocument: React.FC<PensionPDFProps> = ({ result }) => {
    if (!result) return null;

    const renderTableRow = (label: string, amount: number) => (
        <View style={styles.tableRow} key={label}>
            <Text style={styles.colLeft}>{label}</Text>
            <Text style={styles.colRight}>{amount.toFixed(2)}</Text>
        </View>
    );

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>PENSION CALCULATION REPORT</Text>
                    <Text style={styles.headerSubtitle}>Government Employee Pension Details</Text>
                </View>

                {/* Employee Info Block */}
                <View style={styles.detailsBox}>
                    <Text style={styles.detailsTitle}>Employee Information</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Name: <Text style={styles.detailValue}>{result.name}</Text></Text>
                        <Text style={styles.detailText}>DOB: <Text style={styles.detailValue}>{result.dob}</Text></Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Date of Joining: <Text style={styles.detailValue}>{result.doj}</Text></Text>
                        <Text style={styles.detailText}>Retirement: <Text style={styles.detailValue}>{result.retirementDate}</Text></Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Service Length: <Text style={styles.detailValue}>{result.serviceLength.years} yrs, {result.serviceLength.months} mos</Text></Text>
                        <Text style={styles.detailText}>Last Basic Pay: <Text style={styles.detailValue}>₹ {result.basicPay.toFixed(2)}</Text></Text>
                    </View>
                </View>

                {/* Pension Details Table */}
                <View style={styles.table}>
                    <View style={[styles.tableHeaderRow, styles.blueHeader]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#1d4ed8' }]}>Pension Component</Text>
                        <Text style={[styles.colRight, { color: '#1d4ed8' }]}>Amount (₹)</Text>
                    </View>
                    {renderTableRow('Basic Pension (50% of Last Pay)', result.basicPension)}
                    {renderTableRow('Commuted Pension (40% of Basic)', result.commutedPension)}
                    {renderTableRow(`Commutation Value (CVP @ ${result.cvpRate})`, result.cvp)}
                    {renderTableRow('Reduced Pension', result.reducedPension)}
                    {renderTableRow(`DA on Pension (${result.daRate}%)`, result.daOnPension)}
                    
                    <View style={[styles.tableRow, { backgroundColor: '#f8fafc', borderTopWidth: 2, borderTopColor: '#94a3b8' }]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#0f172a' }]}>NET MONTHLY PENSION</Text>
                        <Text style={[styles.colRight, { color: '#0f172a' }]}>{result.netPension.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Family Pension Table */}
                <View style={styles.table}>
                    <View style={[styles.tableHeaderRow, styles.purpleHeader]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#6d28d9' }]}>Family Pension</Text>
                        <Text style={[styles.colRight, { color: '#6d28d9' }]}>Amount (₹)</Text>
                    </View>
                    {renderTableRow('Basic Family Pension (30%)', result.familyPension)}
                    {renderTableRow(`DA on Family Pension (${result.daRate}%)`, result.daOnFamilyPension)}
                    
                    <View style={[styles.tableRow, { backgroundColor: '#faf5ff', borderTopWidth: 2, borderTopColor: '#c4b5fd' }]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#4c1d95' }]}>TOTAL FAMILY PENSION</Text>
                        <Text style={[styles.colRight, { color: '#4c1d95' }]}>{result.totalFamilyPension.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Retirement Benefits Table */}
                <View style={styles.table}>
                    <View style={[styles.tableHeaderRow, styles.greenHeader]}>
                        <Text style={[styles.colLeft, { fontWeight: 'bold', color: '#15803d' }]}>Retirement Benefits</Text>
                        <Text style={[styles.colRight, { color: '#15803d' }]}>Amount (₹)</Text>
                    </View>
                    {renderTableRow('Gratuity (Max ₹20,00,000)', result.gratuity)}
                    {renderTableRow(`Leave Encashment (${result.earnedLeave} days)`, result.leaveEncashment)}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Generated securely by Smart Toolkit 2.0</Text>
                    <Text style={styles.footerText}>Date: {new Date().toLocaleDateString()}</Text>
                </View>

            </Page>
        </Document>
    );
};

export default PensionPDFDocument;
