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
    tableCellHeader: { margin: 5, fontSize: 9, fontWeight: 'black', textAlign: 'center' },
    tableCell: { margin: 5, fontSize: 9, textAlign: 'center' },
    tableCellLeft: { margin: 5, fontSize: 9, textAlign: 'center' }
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

    const renderTable = () => {
        const isNps = basicInfo.category === 'NPS';
        
        let cols: any;
        if (isNps) {
            // 19 Cols configuration summing to 100%
            cols = {
                sr: '3%', month: '6%',
                dueGroup: '26.6%', drawnGroup: '26.6%', diffGroup: '26.8%',
                dcps: '5.5%', nps: '5.5%',
                // Sub-columns
                dp: '5.3%', dd: '5.3%', dh: '4.5%', dt: '4.5%', dTot: '7.0%', 
                pp: '5.3%', pd: '5.3%', ph: '4.5%', pt: '4.5%', pTot: '7.0%', 
                dfp: '5.3%', dfd: '5.3%', dfh: '4.5%', dft: '4.5%', dfTot: '7.2%',
            };
        } else {
            // 17 Cols configuration summing to 100%
            cols = {
                sr: '4%', month: '8%',
                dueGroup: '29%', drawnGroup: '29%', diffGroup: '30%',
                // Sub-columns
                dp: '6.0%', dd: '6.0%', dh: '5.0%', dt: '5.0%', dTot: '7.0%', 
                pp: '6.0%', pd: '6.0%', ph: '5.0%', pt: '5.0%', pTot: '7.0%', 
                dfp: '6.0%', dfd: '6.0%', dfh: '5.0%', dft: '5.0%', dfTot: '8.0%',
            };
        }

        return (
            <View style={styles.table}>
                
                {/* TIER 1 HEADER ROW (Groupings) */}
                <View style={[styles.tableRow, { backgroundColor: '#e0e7ff' }]}>
                    <View style={[styles.tableColHeader, { width: cols.sr, borderBottomWidth: 0 }]}><Text style={styles.tableCellHeader}>SR</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.month, borderBottomWidth: 0 }]}><Text style={styles.tableCellHeader}>MONTH</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dueGroup }]}><Text style={styles.tableCellHeader}>DUE</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.drawnGroup }]}><Text style={styles.tableCellHeader}>DRAWN</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.diffGroup }]}><Text style={styles.tableCellHeader}>DIFFERENCE</Text></View>
                    {isNps && (
                        <React.Fragment>
                            <View style={[styles.tableColHeader, { width: cols.dcps, borderBottomWidth: 0 }]}><Text style={styles.tableCellHeader}>DCPS 10%</Text></View>
                            <View style={[styles.tableColHeader, { width: cols.nps, borderBottomWidth: 0 }]}><Text style={styles.tableCellHeader}>NPS 14%</Text></View>
                        </React.Fragment>
                    )}
                </View>

                {/* TIER 2 HEADER ROW (Sub-columns) */}
                <View style={[styles.tableRow, { backgroundColor: '#e0e7ff' }]}>
                    <View style={[styles.tableColHeader, { width: cols.sr, borderTopWidth: 0 }]}><Text style={styles.tableCellHeader}></Text></View>
                    <View style={[styles.tableColHeader, { width: cols.month, borderTopWidth: 0 }]}><Text style={styles.tableCellHeader}></Text></View>
                    
                    {/* Due Sub Cols */}
                    <View style={[styles.tableColHeader, { width: cols.dp }]}><Text style={styles.tableCellHeader}>PAY</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dd }]}><Text style={styles.tableCellHeader}>DA</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dh }]}><Text style={styles.tableCellHeader}>HRA</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dt }]}><Text style={styles.tableCellHeader}>TA</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dTot }]}><Text style={styles.tableCellHeader}>TOTAL</Text></View>
                    
                    {/* Drawn Sub Cols */}
                    <View style={[styles.tableColHeader, { width: cols.pp }]}><Text style={styles.tableCellHeader}>PAY</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.pd }]}><Text style={styles.tableCellHeader}>DA</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.ph }]}><Text style={styles.tableCellHeader}>HRA</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.pt }]}><Text style={styles.tableCellHeader}>TA</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.pTot }]}><Text style={styles.tableCellHeader}>TOTAL</Text></View>
                    
                    {/* Difference Sub Cols */}
                    <View style={[styles.tableColHeader, { width: cols.dfp }]}><Text style={styles.tableCellHeader}>PAY</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dfd }]}><Text style={styles.tableCellHeader}>DA</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dfh }]}><Text style={styles.tableCellHeader}>HRA</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dft }]}><Text style={styles.tableCellHeader}>TA</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dfTot }]}><Text style={styles.tableCellHeader}>TOTAL</Text></View>
                    
                    {isNps && (
                        <React.Fragment>
                            <View style={[styles.tableColHeader, { width: cols.dcps, borderTopWidth: 0 }]}><Text style={styles.tableCellHeader}></Text></View>
                            <View style={[styles.tableColHeader, { width: cols.nps, borderTopWidth: 0 }]}><Text style={styles.tableCellHeader}></Text></View>
                        </React.Fragment>
                    )}
                </View>

                {/* DATA ROWS */}
                {results.map((row, i) => (
                    <View style={styles.tableRow} key={i}>
                        <View style={[styles.tableCol, { width: cols.sr }]}><Text style={styles.tableCellHeader}>{i + 1}</Text></View>
                        <View style={[styles.tableCol, { width: cols.month }]}><Text style={styles.tableCellLeft}>{row.label}</Text></View>
                        
                        <View style={[styles.tableCol, { width: cols.dp }]}><Text style={styles.tableCell}>{row.due.pay}</Text></View>
                        <View style={[styles.tableCol, { width: cols.dd }]}><Text style={styles.tableCell}>{row.due.da}</Text></View>
                        <View style={[styles.tableCol, { width: cols.dh }]}><Text style={styles.tableCell}>{row.due.hra}</Text></View>
                        <View style={[styles.tableCol, { width: cols.dt }]}><Text style={styles.tableCell}>{row.due.ta}</Text></View>
                        <View style={[styles.tableCol, { width: cols.dTot, backgroundColor: '#f9fafb' }]}><Text style={styles.tableCell}>{row.due.total}</Text></View>
                        
                        <View style={[styles.tableCol, { width: cols.pp }]}><Text style={styles.tableCell}>{row.drawn.pay}</Text></View>
                        <View style={[styles.tableCol, { width: cols.pd }]}><Text style={styles.tableCell}>{row.drawn.da}</Text></View>
                        <View style={[styles.tableCol, { width: cols.ph }]}><Text style={styles.tableCell}>{row.drawn.hra}</Text></View>
                        <View style={[styles.tableCol, { width: cols.pt }]}><Text style={styles.tableCell}>{row.drawn.ta}</Text></View>
                        <View style={[styles.tableCol, { width: cols.pTot, backgroundColor: '#f9fafb' }]}><Text style={styles.tableCell}>{row.drawn.total}</Text></View>
                        
                        <View style={[styles.tableCol, { width: cols.dfp }]}><Text style={styles.tableCell}>{row.diff.pay}</Text></View>
                        <View style={[styles.tableCol, { width: cols.dfd }]}><Text style={styles.tableCell}>{row.diff.da}</Text></View>
                        <View style={[styles.tableCol, { width: cols.dfh }]}><Text style={styles.tableCell}>{row.diff.hra}</Text></View>
                        <View style={[styles.tableCol, { width: cols.dft }]}><Text style={styles.tableCell}>{row.diff.ta}</Text></View>
                        <View style={[styles.tableCol, { width: cols.dfTot, backgroundColor: '#f9fafb' }]}><Text style={styles.tableCell}>{row.diff.total}</Text></View>
                        
                        {isNps && (
                            <React.Fragment>
                                <View style={[styles.tableCol, { width: cols.dcps }]}><Text style={styles.tableCell}>{row.dcps}</Text></View>
                                <View style={[styles.tableCol, { width: cols.nps }]}><Text style={styles.tableCell}>{Math.round(row.diff.total * 0.14)}</Text></View>
                            </React.Fragment>
                        )}
                    </View>
                ))}

                {/* TOTAL ROW */}
                <View style={[styles.tableRow, { backgroundColor: '#f0f0f0', fontWeight: 'bold' }]}>
                    <View style={[styles.tableColHeader, { width: isNps ? '9%' : '12%' }]}><Text style={styles.tableCellHeader}>TOTAL</Text></View>
                    
                    <View style={[styles.tableColHeader, { width: cols.dp }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.due.pay, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dd }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.due.da, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dh }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.due.hra, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dt }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.due.ta, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dTot }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.due.total, 0)}</Text></View>
                    
                    <View style={[styles.tableColHeader, { width: cols.pp }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.drawn.pay, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.pd }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.drawn.da, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.ph }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.drawn.hra, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.pt }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.drawn.ta, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.pTot }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.drawn.total, 0)}</Text></View>
                    
                    <View style={[styles.tableColHeader, { width: cols.dfp }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.diff.pay, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dfd }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.diff.da, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dfh }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.diff.hra, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dft }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.diff.ta, 0)}</Text></View>
                    <View style={[styles.tableColHeader, { width: cols.dfTot }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.diff.total, 0)}</Text></View>
                    
                    {isNps && (
                        <React.Fragment>
                            <View style={[styles.tableColHeader, { width: cols.dcps }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + r.dcps, 0)}</Text></View>
                            <View style={[styles.tableColHeader, { width: cols.nps }]}><Text style={styles.tableCellHeader}>{results.reduce((s, r) => s + Math.round(r.diff.total * 0.14), 0)}</Text></View>
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
            </Page>
        </Document>
    );
};

export default ArrearsPDFDocument;
