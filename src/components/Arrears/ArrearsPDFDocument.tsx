import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { getArrearsSummary } from '@/utils/arrearsCalculations';

const styles = StyleSheet.create({
    page: { padding: 20, paddingBottom: 40, backgroundColor: '#ffffff', flexDirection: 'column', fontSize: 9 },
    headerBox: { marginBottom: 12, textAlign: 'center' },
    orderNo: { fontSize: 14, fontWeight: 'extrabold', marginBottom: 8, color: '#1e3a8a' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1.5, borderBottomColor: '#1e3a8a', paddingBottom: 6, marginBottom: 10 },
    infoText: { fontSize: 10, fontWeight: 'bold' },
    table: { display: 'flex', width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#334155', borderRightWidth: 0, borderBottomWidth: 0 },
    tableRow: { flexDirection: 'row', width: '100%', minHeight: 22 },
    tableColHeader: { borderStyle: 'solid', borderColor: '#334155', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#e0e7ff', justifyContent: 'center' },
    tableCol: { borderStyle: 'solid', borderColor: '#334155', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, justifyContent: 'center' },
    tableCellHeader: { margin: 3, fontSize: 8, fontWeight: 'bold', textAlign: 'center' },
    tableCell: { margin: 3, fontSize: 8, textAlign: 'center' },
    tableCellLeft: { margin: 3, fontSize: 8, textAlign: 'center' },
    summaryBox: { marginTop: 12, padding: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4, backgroundColor: '#f8fafc', flexDirection: 'row', justifyContent: 'space-between' },
    summaryText: { fontSize: 10, fontWeight: 'bold', color: '#0f172a' },
    summaryHighlight: { fontSize: 11, fontWeight: 'extrabold', color: '#047857' },
    signaturesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 35, paddingHorizontal: 20 },
    signatureBlock: { alignItems: 'center', width: '28%' },
    signatureLine: { borderTopWidth: 1, borderTopColor: '#000', width: '100%', marginTop: 25, marginBottom: 4 },
    signatureTitle: { fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
    pageNumber: { position: 'absolute', fontSize: 9, bottom: 12, left: 0, right: 0, textAlign: 'center', color: '#64748b' }
});

interface PDFProps {
    basicInfo: any;
    customColumns: any[];
    results: any[];
}

const formatRupees = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    return val.toLocaleString('en-IN');
};

const ArrearsPDFDocument: React.FC<PDFProps> = ({ basicInfo, customColumns = [], results = [] }) => {
    const summary = getArrearsSummary(results, customColumns);

    const renderHeader = () => (
        <View style={styles.headerBox} fixed>
            <Text style={styles.orderNo}>{basicInfo.orderNo || 'ARREARS STATEMENT (वेतन थकबाकी विवरणपत्र)'}</Text>
            <View style={styles.infoRow}>
                <Text style={styles.infoText}>NAME: {basicInfo.empName || '-'}</Text>
                <Text style={styles.infoText}>DESIGNATION: {basicInfo.designation || '-'}</Text>
                <Text style={styles.infoText}>PERIOD: {basicInfo.fromMonth || '-'} TO {basicInfo.toMonth || '-'}</Text>
                <Text style={styles.infoText}>SCHEME: {basicInfo.category || 'NPS'}</Text>
            </View>
        </View>
    );

    const renderTable = () => {
        const isNps = basicInfo.category === 'NPS';
        
        const srWidth = isNps ? 3 : 4;
        const monthWidth = isNps ? 6 : 8;
        const dcpsWidth = isNps ? 5.5 : 0;
        const npsWidth = isNps ? 5.5 : 0;
        
        const remainingSpace = 100 - (srWidth + monthWidth + dcpsWidth + npsWidth);
        const groupWidthPercent = remainingSpace / 3;
        
        // Base cols (Pay, DA, HRA, TA, Total) = 5
        const numSubCols = 5 + (customColumns ? customColumns.length : 0);
        const subColWidthPercent = groupWidthPercent / numSubCols;

        const pw = (val: number) => `${val}%`;

        return (
            <View style={styles.table}>
                
                {/* TIER 1 HEADER ROW (Groupings) */}
                <View style={[styles.tableRow, { backgroundColor: '#e0e7ff' }]} fixed>
                    <View style={[styles.tableColHeader, { width: pw(srWidth), borderBottomWidth: 0 }]}><Text style={styles.tableCellHeader}>SR</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(monthWidth), borderBottomWidth: 0 }]}><Text style={styles.tableCellHeader}>MONTH</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(groupWidthPercent) }]}><Text style={styles.tableCellHeader}>DUE (देय रक्कम)</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(groupWidthPercent) }]}><Text style={styles.tableCellHeader}>DRAWN (आहरित रक्कम)</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(groupWidthPercent) }]}><Text style={styles.tableCellHeader}>DIFFERENCE (फरक)</Text></View>
                    {isNps && (
                        <React.Fragment>
                            <View style={[styles.tableColHeader, { width: pw(dcpsWidth), borderBottomWidth: 0 }]}><Text style={styles.tableCellHeader}>DCPS 10%</Text></View>
                            <View style={[styles.tableColHeader, { width: pw(npsWidth), borderBottomWidth: 0 }]}><Text style={styles.tableCellHeader}>NPS 14%</Text></View>
                        </React.Fragment>
                    )}
                </View>

                {/* TIER 2 HEADER ROW (Sub-columns) */}
                <View style={[styles.tableRow, { backgroundColor: '#e0e7ff' }]} fixed>
                    <View style={[styles.tableColHeader, { width: pw(srWidth), borderTopWidth: 0 }]}><Text style={styles.tableCellHeader}></Text></View>
                    <View style={[styles.tableColHeader, { width: pw(monthWidth), borderTopWidth: 0 }]}><Text style={styles.tableCellHeader}></Text></View>
                    
                    {/* Due Sub Cols */}
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>PAY</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>DA</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>HRA</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>TA</Text></View>
                    {customColumns?.map(c => <View key={`due-h-${c.id}`} style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{c.label.toUpperCase()}</Text></View>)}
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>TOTAL</Text></View>
                    
                    {/* Drawn Sub Cols */}
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>PAY</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>DA</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>HRA</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>TA</Text></View>
                    {customColumns?.map(c => <View key={`drawn-h-${c.id}`} style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{c.label.toUpperCase()}</Text></View>)}
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>TOTAL</Text></View>
                    
                    {/* Difference Sub Cols */}
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>PAY</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>DA</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>HRA</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>TA</Text></View>
                    {customColumns?.map(c => <View key={`diff-h-${c.id}`} style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{c.label.toUpperCase()}</Text></View>)}
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>TOTAL</Text></View>
                    
                    {isNps && (
                        <React.Fragment>
                            <View style={[styles.tableColHeader, { width: pw(dcpsWidth), borderTopWidth: 0 }]}><Text style={styles.tableCellHeader}></Text></View>
                            <View style={[styles.tableColHeader, { width: pw(npsWidth), borderTopWidth: 0 }]}><Text style={styles.tableCellHeader}></Text></View>
                        </React.Fragment>
                    )}
                </View>

                {/* DATA ROWS */}
                {results.map((row, i) => (
                    <View style={styles.tableRow} key={i} wrap={false}>
                        <View style={[styles.tableCol, { width: pw(srWidth) }]}><Text style={styles.tableCellHeader}>{i + 1}</Text></View>
                        <View style={[styles.tableCol, { width: pw(monthWidth) }]}><Text style={styles.tableCellLeft}>{row.label}</Text></View>
                        
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.due.pay)}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.due.da)}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.due.hra)}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.due.ta)}</Text></View>
                        {customColumns?.map(c => <View key={`due-${c.id}-${i}`} style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.due.custom?.[c.id] || 0)}</Text></View>)}
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent), backgroundColor: '#f8fafc' }]}><Text style={styles.tableCell}>{formatRupees(row.due.total)}</Text></View>
                        
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.drawn.pay)}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.drawn.da)}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.drawn.hra)}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.drawn.ta)}</Text></View>
                        {customColumns?.map(c => <View key={`drawn-${c.id}-${i}`} style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.drawn.custom?.[c.id] || 0)}</Text></View>)}
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent), backgroundColor: '#f8fafc' }]}><Text style={styles.tableCell}>{formatRupees(row.drawn.total)}</Text></View>
                        
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.diff.pay)}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.diff.da)}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.diff.hra)}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.diff.ta)}</Text></View>
                        {customColumns?.map(c => <View key={`diff-${c.id}-${i}`} style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{formatRupees(row.diff.custom?.[c.id] || 0)}</Text></View>)}
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent), backgroundColor: '#f8fafc' }]}><Text style={styles.tableCell}>{formatRupees(row.diff.total)}</Text></View>
                        
                        {isNps && (
                            <React.Fragment>
                                <View style={[styles.tableCol, { width: pw(dcpsWidth) }]}><Text style={styles.tableCell}>{formatRupees(row.dcps)}</Text></View>
                                <View style={[styles.tableCol, { width: pw(npsWidth) }]}><Text style={styles.tableCell}>{formatRupees(row.nps14)}</Text></View>
                            </React.Fragment>
                        )}
                    </View>
                ))}

                {/* TOTAL ROW */}
                <View style={[styles.tableRow, { backgroundColor: '#e2e8f0' }]} wrap={false}>
                    <View style={[styles.tableColHeader, { width: pw(srWidth + monthWidth) }]}><Text style={styles.tableCellHeader}>TOTAL (एकूण)</Text></View>
                    
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDuePay)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDueDA)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDueHRA)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDueTA)}</Text></View>
                    {customColumns?.map(c => <View key={`due-tot-${c.id}`} style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDueCustom[c.id] || 0)}</Text></View>)}
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent), backgroundColor: '#cbd5e1' }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDue)}</Text></View>
                    
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDrawnPay)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDrawnDA)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDrawnHRA)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDrawnTA)}</Text></View>
                    {customColumns?.map(c => <View key={`drawn-tot-${c.id}`} style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDrawnCustom[c.id] || 0)}</Text></View>)}
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent), backgroundColor: '#cbd5e1' }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDrawn)}</Text></View>
                    
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDiffPay)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDiffDA)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDiffHRA)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDiffTA)}</Text></View>
                    {customColumns?.map(c => <View key={`diff-tot-${c.id}`} style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDiffCustom[c.id] || 0)}</Text></View>)}
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent), backgroundColor: '#cbd5e1' }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDiff)}</Text></View>
                    
                    {isNps && (
                        <React.Fragment>
                            <View style={[styles.tableColHeader, { width: pw(dcpsWidth) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalDCPS)}</Text></View>
                            <View style={[styles.tableColHeader, { width: pw(npsWidth) }]}><Text style={styles.tableCellHeader}>{formatRupees(summary.totalNPS14)}</Text></View>
                        </React.Fragment>
                    )}
                </View>
            </View>
        );
    };

    const isNps = basicInfo.category === 'NPS';

    return (
        <Document>
            <Page size="A3" orientation="landscape" style={styles.page}>
                {renderHeader()}
                {renderTable()}
                
                {/* Summary & Net Payable Box */}
                <View style={styles.summaryBox} wrap={false}>
                    <Text style={styles.summaryText}>Total Difference (एकूण फरक): ₹{formatRupees(summary.totalDiff)}</Text>
                    {isNps && <Text style={styles.summaryText}>DCPS 10% Deduction: ₹{formatRupees(summary.totalDCPS)}</Text>}
                    {isNps && <Text style={styles.summaryText}>Govt NPS 14%: ₹{formatRupees(summary.totalNPS14)}</Text>}
                    <Text style={styles.summaryHighlight}>NET PAYABLE ARREARS (निव्वळ देय फरक): ₹{formatRupees(summary.netPayable)}</Text>
                </View>

                {/* Verification & Signatures */}
                <View style={styles.signaturesRow} wrap={false}>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureTitle}>Prepared By (लिपिक / तयार करणार)</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureTitle}>Verified By (अधीक्षक / तपासणार)</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureTitle}>Drawing & Disbursing Officer (आहरण व संवितरण अधिकारी)</Text>
                    </View>
                </View>

                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (`Page ${pageNumber} of ${totalPages}`)} fixed />
            </Page>
        </Document>
    );
};

export default ArrearsPDFDocument;
