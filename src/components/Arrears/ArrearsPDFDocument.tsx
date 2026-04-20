import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 20, paddingBottom: 30, backgroundColor: '#ffffff', flexDirection: 'column', fontSize: 10 },
    headerBox: { marginBottom: 15, textAlign: 'center' },
    orderNo: { fontSize: 16, fontWeight: 'extrabold', marginBottom: 10 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 5, marginBottom: 15 },
    infoText: { fontSize: 12, fontWeight: 'bold' },
    table: { display: 'flex', width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000', borderRightWidth: 0, borderBottomWidth: 0 },
    tableRow: { flexDirection: 'row', width: '100%', minHeight: 30 },
    tableColHeader: { borderStyle: 'solid', borderColor: '#000', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#e0e7ff', justifyContent: 'center' },
    tableCol: { borderStyle: 'solid', borderColor: '#000', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, justifyContent: 'center' },
    tableCellHeader: { margin: 5, fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
    tableCell: { margin: 5, fontSize: 9, textAlign: 'center' },
    tableCellLeft: { margin: 5, fontSize: 9, textAlign: 'center' },
    pageNumber: { position: 'absolute', fontSize: 10, bottom: 10, left: 0, right: 0, textAlign: 'center', color: 'grey' }
});

interface PDFProps {
    basicInfo: any;
    customColumns: any[];
    results: any[];
}

const ArrearsPDFDocument: React.FC<PDFProps> = ({ basicInfo, customColumns, results }) => {

    const renderHeader = () => (
        <View style={styles.headerBox} fixed>
            <Text style={styles.orderNo}>{basicInfo.orderNo || 'ARREARS STATEMENT'}</Text>
            <View style={styles.infoRow}>
                <Text style={styles.infoText}>NAME: {basicInfo.empName}</Text>
                <Text style={styles.infoText}>DESIGNATION: {basicInfo.designation}</Text>
                <Text style={styles.infoText}>PERIOD: {basicInfo.fromMonth} TO {basicInfo.toMonth}</Text>
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
        // Plus custom cols
        const numSubCols = 5 + (customColumns ? customColumns.length : 0);
        const subColWidthPercent = groupWidthPercent / numSubCols;

        const pw = (val: number) => `${val}%`;

        return (
            <View style={styles.table}>
                
                {/* TIER 1 HEADER ROW (Groupings) */}
                <View style={[styles.tableRow, { backgroundColor: '#e0e7ff' }]} fixed>
                    <View style={[styles.tableColHeader, { width: pw(srWidth), borderBottomWidth: 0 }]}><Text style={styles.tableCellHeader}>SR</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(monthWidth), borderBottomWidth: 0 }]}><Text style={styles.tableCellHeader}>MONTH</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(groupWidthPercent) }]}><Text style={styles.tableCellHeader}>DUE</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(groupWidthPercent) }]}><Text style={styles.tableCellHeader}>DRAWN</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(groupWidthPercent) }]}><Text style={styles.tableCellHeader}>DIFFERENCE</Text></View>
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
                        
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.due.pay}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.due.da}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.due.hra}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.due.ta}</Text></View>
                        {customColumns?.map(c => <View key={`due-${c.id}-${i}`} style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.due.custom?.[c.id] || 0}</Text></View>)}
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent), backgroundColor: '#f9fafb' }]}><Text style={styles.tableCell}>{row.due.total}</Text></View>
                        
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.drawn.pay}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.drawn.da}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.drawn.hra}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.drawn.ta}</Text></View>
                        {customColumns?.map(c => <View key={`drawn-${c.id}-${i}`} style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.drawn.custom?.[c.id] || 0}</Text></View>)}
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent), backgroundColor: '#f9fafb' }]}><Text style={styles.tableCell}>{row.drawn.total}</Text></View>
                        
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.diff.pay}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.diff.da}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.diff.hra}</Text></View>
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.diff.ta}</Text></View>
                        {customColumns?.map(c => <View key={`diff-${c.id}-${i}`} style={[styles.tableCol, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCell}>{row.diff.custom?.[c.id] || 0}</Text></View>)}
                        <View style={[styles.tableCol, { width: pw(subColWidthPercent), backgroundColor: '#f9fafb' }]}><Text style={styles.tableCell}>{row.diff.total}</Text></View>
                        
                        {isNps && (
                            <React.Fragment>
                                <View style={[styles.tableCol, { width: pw(dcpsWidth) }]}><Text style={styles.tableCell}>{row.dcps}</Text></View>
                                <View style={[styles.tableCol, { width: pw(npsWidth) }]}><Text style={styles.tableCell}>{row.nps14}</Text></View>
                            </React.Fragment>
                        )}
                    </View>
                ))}

                {/* TOTAL ROW */}
                <View style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]} wrap={false}>
                    <View style={[styles.tableColHeader, { width: pw(srWidth + monthWidth) }]}><Text style={styles.tableCellHeader}>TOTAL</Text></View>
                    
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.due.pay, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.due.da, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.due.hra, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.due.ta, 0)}</Text></View>
                    {customColumns?.map(c => <View key={`due-tot-${c.id}`} style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + (r.due.custom?.[c.id] || 0), 0)}</Text></View>)}
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.due.total, 0)}</Text></View>
                    
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.drawn.pay, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.drawn.da, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.drawn.hra, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.drawn.ta, 0)}</Text></View>
                    {customColumns?.map(c => <View key={`drawn-tot-${c.id}`} style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + (r.drawn.custom?.[c.id] || 0), 0)}</Text></View>)}
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.drawn.total, 0)}</Text></View>
                    
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.diff.pay, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.diff.da, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.diff.hra, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.diff.ta, 0)}</Text></View>
                    {customColumns?.map(c => <View key={`diff-tot-${c.id}`} style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + (r.diff.custom?.[c.id] || 0), 0)}</Text></View>)}
                    <View style={[styles.tableColHeader, { width: pw(subColWidthPercent) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.diff.total, 0)}</Text></View>
                    
                    {isNps && (
                        <React.Fragment>
                            <View style={[styles.tableColHeader, { width: pw(dcpsWidth) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.dcps, 0)}</Text></View>
                            <View style={[styles.tableColHeader, { width: pw(npsWidth) }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.nps14, 0)}</Text></View>
                        </React.Fragment>
                    )}
                </View>
            </View>
        );
    };

    return (
        <Document>
            <Page size="A3" orientation="landscape" style={styles.page}>
                {renderHeader()}
                {renderTable()}
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (`Page ${pageNumber} of ${totalPages}`)} fixed />
            </Page>
        </Document>
    );
};

export default ArrearsPDFDocument;
