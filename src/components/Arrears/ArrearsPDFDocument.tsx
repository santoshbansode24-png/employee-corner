import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register standard fonts if needed, or stick to defaults for now
// Font.register({ family: 'Helvetica', src: '...' });

const styles = StyleSheet.create({
    page: { padding: 30, backgroundColor: '#ffffff', flexDirection: 'column', fontSize: 10 },
    headerBox: { marginBottom: 20, textAlign: 'center' },
    orderNo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 5, marginBottom: 15 },
    infoText: { fontSize: 12, fontWeight: 'bold' },
    table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
    tableRow: { margin: 'auto', flexDirection: 'row' },
    tableColHeader: { width: '8%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#e0e7ff' },
    tableCol: { width: '8%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
    tableCellHeader: { margin: 5, fontSize: 8, fontWeight: 500, textAlign: 'center' },
    tableCell: { margin: 5, fontSize: 8, textAlign: 'right' },
    tableCellLeft: { margin: 5, fontSize: 8, textAlign: 'left' }
});

interface PDFProps {
    basicInfo: any;
    customColumns: any[];
    results: any[];
}

const ArrearsPDFDocument: React.FC<PDFProps> = ({ basicInfo, customColumns, results }) => {

    const renderHeader = () => (
        <View style={styles.headerBox}>
            <Text style={styles.orderNo}>{basicInfo.orderNo || 'ARREARS STATEMENT'}</Text>
            <View style={styles.infoRow}>
                <Text style={styles.infoText}>NAME: {basicInfo.empName}</Text>
                <Text style={styles.infoText}>DESIGNATION: {basicInfo.designation}</Text>
                <Text style={styles.infoText}>PERIOD: {basicInfo.fromMonth} TO {basicInfo.toMonth}</Text>
            </View>
        </View>
    );

    const renderTotalRow = () => {
        const tDuePay = results.reduce((s, r) => s + r.due.pay, 0);
        const tDueTotal = results.reduce((s, r) => s + r.due.total, 0);
        const tDrawnPay = results.reduce((s, r) => s + r.drawn.pay, 0);
        const tDrawnTotal = results.reduce((s, r) => s + r.drawn.total, 0);
        const tDiffTotal = results.reduce((s, r) => s + r.diff.total, 0);

        return (
            <View style={[styles.tableRow, { backgroundColor: '#f0f0f0', fontWeight: 'bold' }]}>
                <View style={[styles.tableColHeader, { width: '16%' }]}><Text style={styles.tableCellHeader}>TOTAL</Text></View>
                <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>{tDuePay}</Text></View>
                <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>{tDueTotal}</Text></View>
                <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>{tDrawnPay}</Text></View>
                <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>{tDrawnTotal}</Text></View>
                <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>{tDiffTotal}</Text></View>
            </View>
        );
    };

    return (
        <Document>
            <Page size="A3" orientation="landscape" style={styles.page}>
                {renderHeader()}
                
                <View style={styles.table}>
                    {/* Simplified Header for MVP React-PDF. A true replica would iterate dynamic columns */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableColHeader, { width: '4%' }]}><Text style={styles.tableCellHeader}>SR</Text></View>
                        <View style={[styles.tableColHeader, { width: '12%' }]}><Text style={styles.tableCellHeader}>MONTH</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>DUE PAY</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>DUE TOTAL</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>DRAWN PAY</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>DRAWN TOTAL</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>DIFF TOTAL</Text></View>
                        {basicInfo.category === 'NPS' && (
                            <React.Fragment>
                                <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>DCPS</Text></View>
                                <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>NPS(14%)</Text></View>
                            </React.Fragment>
                        )}
                    </View>

                    {results.map((row, i) => (
                        <View style={styles.tableRow} key={i}>
                            <View style={[styles.tableCol, { width: '4%' }]}><Text style={styles.tableCellHeader}>{i + 1}</Text></View>
                            <View style={[styles.tableCol, { width: '12%' }]}><Text style={styles.tableCellLeft}>{row.label}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{row.due.pay}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{row.due.total}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{row.drawn.pay}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{row.drawn.total}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{row.diff.total}</Text></View>
                            {basicInfo.category === 'NPS' && (
                                <React.Fragment>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}>{row.dcps}</Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}>{Math.round(row.diff.total * 0.14)}</Text></View>
                                </React.Fragment>
                            )}
                        </View>
                    ))}

                    {renderTotalRow()}
                </View>

            </Page>
        </Document>
    );
};

export default ArrearsPDFDocument;
