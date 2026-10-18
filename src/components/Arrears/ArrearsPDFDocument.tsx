import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { getArrearsSummary } from '@/utils/arrearsCalculations';

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

// Stop React-PDF from breaking words and numbers with hyphens
Font.registerHyphenationCallback(word => [word]);

const styles = StyleSheet.create({
    page: { 
        paddingTop: 16, 
        paddingBottom: 22, 
        paddingHorizontal: 20, 
        backgroundColor: '#ffffff', 
        flexDirection: 'column', 
        fontFamily: 'Nirmala',
        fontSize: 10 
    },
    
    // Header
    headerContainer: { 
        marginBottom: 8, 
        textAlign: 'center' 
    },
    orderTitle: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#1e3a8a', 
        textAlign: 'center', 
        marginBottom: 3 
    },
    subTitle: { 
        fontSize: 12, 
        fontWeight: 'bold', 
        color: '#475569', 
        textAlign: 'center', 
        marginBottom: 8 
    },

    // Employee & Statement Details Grid
    detailsBox: { 
        marginBottom: 8, 
        padding: 7, 
        borderWidth: 1.2, 
        borderColor: '#94a3b8', 
        borderRadius: 4, 
        backgroundColor: '#f8fafc' 
    },
    detailsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 3 
    },
    detailCol: { 
        width: '49%' 
    },
    detailText: { 
        fontSize: 10.5, 
        color: '#334155' 
    },
    detailValue: { 
        fontSize: 10.5, 
        fontWeight: 'bold', 
        color: '#0f172a' 
    },

    // Table
    table: { 
        width: '100%', 
        borderStyle: 'solid', 
        borderWidth: 1.2, 
        borderColor: '#334155', 
        borderRightWidth: 0, 
        borderBottomWidth: 0 
    },
    tableRow: { 
        flexDirection: 'row', 
        width: '100%', 
        minHeight: 20 
    },
    tableRowAlt: { 
        flexDirection: 'row', 
        width: '100%', 
        minHeight: 20, 
        backgroundColor: '#f8fafc' 
    },
    
    // Header Cells
    headerGroupCell: { 
        borderStyle: 'solid', 
        borderColor: '#334155', 
        borderWidth: 1, 
        borderLeftWidth: 0, 
        borderTopWidth: 0, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingVertical: 3.5,
        paddingHorizontal: 1
    },
    headerGroupText: { 
        fontSize: 10.5, 
        fontWeight: 'bold', 
        textAlign: 'center' 
    },
    
    subHeaderCell: { 
        borderStyle: 'solid', 
        borderColor: '#334155', 
        borderWidth: 1, 
        borderLeftWidth: 0, 
        borderTopWidth: 0, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingVertical: 3.5,
        paddingHorizontal: 1,
        backgroundColor: '#f1f5f9'
    },
    subHeaderText: { 
        fontSize: 9.5, 
        fontWeight: 'bold', 
        textAlign: 'center',
        color: '#1e293b'
    },

    // Data Cells
    cell: { 
        borderStyle: 'solid', 
        borderColor: '#334155', 
        borderWidth: 1, 
        borderLeftWidth: 0, 
        borderTopWidth: 0, 
        justifyContent: 'center',
        paddingVertical: 3,
        paddingHorizontal: 2.5
    },
    cellCenterText: { 
        fontSize: 10, 
        textAlign: 'center', 
        color: '#0f172a' 
    },
    cellNumberText: { 
        fontSize: 10, 
        textAlign: 'right', 
        color: '#0f172a' 
    },
    cellNumberBold: { 
        fontSize: 10, 
        fontWeight: 'bold', 
        textAlign: 'right', 
        color: '#0f172a' 
    },
    cellNetPayableText: { 
        fontSize: 10, 
        fontWeight: 'bold', 
        textAlign: 'right', 
        color: '#047857' 
    },

    // Total Row
    totalRow: { 
        flexDirection: 'row', 
        width: '100%', 
        minHeight: 24, 
        backgroundColor: '#e2e8f0', 
        borderTopWidth: 1.5, 
        borderTopColor: '#0f172a' 
    },
    totalCell: { 
        borderStyle: 'solid', 
        borderColor: '#334155', 
        borderWidth: 1, 
        borderLeftWidth: 0, 
        borderTopWidth: 0, 
        justifyContent: 'center',
        paddingVertical: 3.5,
        paddingHorizontal: 2.5
    },
    totalTextCenter: { 
        fontSize: 10.5, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        color: '#0f172a' 
    },
    totalTextNumber: { 
        fontSize: 10.5, 
        fontWeight: 'bold', 
        textAlign: 'right', 
        color: '#0f172a' 
    },
    totalTextNet: { 
        fontSize: 11, 
        fontWeight: 'bold', 
        textAlign: 'right', 
        color: '#065f46' 
    },

    // Summary Box
    summaryBox: { 
        marginTop: 10, 
        padding: 9, 
        borderWidth: 1.5, 
        borderColor: '#cbd5e1', 
        borderRadius: 5, 
        backgroundColor: '#f8fafc', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    summaryItem: { 
        flexDirection: 'column',
        alignItems: 'center'
    },
    summaryLabel: { 
        fontSize: 10, 
        color: '#475569', 
        fontWeight: 'bold',
        marginBottom: 2
    },
    summaryValue: { 
        fontSize: 12, 
        fontWeight: 'bold', 
        color: '#0f172a' 
    },
    summaryHighlightLabel: { 
        fontSize: 10.5, 
        color: '#065f46', 
        fontWeight: 'bold',
        marginBottom: 2
    },
    summaryHighlightValue: { 
        fontSize: 14.5, 
        fontWeight: 'bold', 
        color: '#047857' 
    },

    pageNumber: { 
        position: 'absolute', 
        fontSize: 9, 
        bottom: 8, 
        left: 0, 
        right: 0, 
        textAlign: 'center', 
        color: '#64748b' 
    }
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

const formatDateDMY = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    if (parts.length === 2) {
        return `${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    return dateStr;
};

const ArrearsPDFDocument: React.FC<PDFProps> = ({ basicInfo, customColumns = [], results = [] }) => {
    const summary = getArrearsSummary(results, customColumns);
    const isNps = basicInfo.category === 'NPS';

    // Proportional, balanced column width calculations
    // Tightens DCPS 10% and Net Payable to eliminate blank whitespace, redistributing space to Month, Pay, DA, HRA & Totals
    const wSr = 3.0;
    const wMonth = 8.8;
    const wPay = 6.2;
    const wDa = 5.8;
    const wHra = 5.2;
    const wTa = 4.8;
    const wCustom = 5.0;
    const wTotal = 7.2;
    const wDcps = isNps ? 4.0 : 0;
    const wNet = 5.0;

    const groupWeight = wPay + wDa + wHra + wTa + (customColumns.length * wCustom) + wTotal;
    const totalWeight = wSr + wMonth + (groupWeight * 3) + wDcps + wNet;
    const scale = 100 / totalWeight;

    const srWidth = wSr * scale;
    const monthWidth = wMonth * scale;
    const colPay = wPay * scale;
    const colDa = wDa * scale;
    const colHra = wHra * scale;
    const colTa = wTa * scale;
    const colCustom = wCustom * scale;
    const colTotal = wTotal * scale;
    const groupBaseWidth = colPay + colDa + colHra + colTa + (customColumns.length * colCustom) + colTotal;
    const dcpsWidth = isNps ? (wDcps * scale) : 0;
    // Net Payable cleanly takes the remaining exact fraction to guarantee 100.00% total width
    const netWidth = 100 - (srWidth + monthWidth + (groupBaseWidth * 3) + dcpsWidth);

    const pw = (val: number) => `${val.toFixed(2)}%`;

    const renderHeader = () => (
        <View style={styles.headerContainer} fixed>
            <Text style={styles.orderTitle}>
                {basicInfo.orderNo || 'GOVERNMENT OF MAHARASHTRA • FINANCE DEPARTMENT'}
            </Text>
            <Text style={styles.subTitle}>
                ARREARS STATEMENT (7th PAY COMMISSION) • वेतन थकबाकी विवरणपत्र
            </Text>

            <View style={styles.detailsBox}>
                <View style={styles.detailsRow}>
                    <View style={styles.detailCol}>
                        <Text style={styles.detailText}>
                            Employee Name: <Text style={styles.detailValue}>{basicInfo.empName || '-'}</Text>
                        </Text>
                    </View>
                    <View style={styles.detailCol}>
                        <Text style={styles.detailText}>
                            Designation: <Text style={styles.detailValue}>{basicInfo.designation || '-'}</Text>
                        </Text>
                    </View>
                </View>
                <View style={styles.detailsRow}>
                    <View style={styles.detailCol}>
                        <Text style={styles.detailText}>
                            Arrears Period: <Text style={styles.detailValue}>{formatDateDMY(basicInfo.fromMonth)} to {formatDateDMY(basicInfo.toMonth)}</Text>
                        </Text>
                    </View>
                    <View style={styles.detailCol}>
                        <Text style={styles.detailText}>
                            Pension Scheme: <Text style={styles.detailValue}>{basicInfo.category || 'NPS'} (City: {basicInfo.cityCategory || 'Z'})</Text>
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderTable = () => (
        <View style={styles.table}>
            
            {/* TIER 1: GROUP HEADINGS */}
            <View style={styles.tableRow} fixed>
                <View style={[styles.headerGroupCell, { width: pw(srWidth), backgroundColor: '#e2e8f0' }]}>
                    <Text style={styles.headerGroupText}>SR</Text>
                </View>
                <View style={[styles.headerGroupCell, { width: pw(monthWidth), backgroundColor: '#e2e8f0' }]}>
                    <Text style={styles.headerGroupText}>MONTH</Text>
                </View>

                {/* Due Group */}
                <View style={[styles.headerGroupCell, { width: pw(groupBaseWidth), backgroundColor: '#d1fae5' }]}>
                    <Text style={[styles.headerGroupText, { color: '#065f46' }]}>DUE AMOUNT (देय रक्कम)</Text>
                </View>

                {/* Drawn Group */}
                <View style={[styles.headerGroupCell, { width: pw(groupBaseWidth), backgroundColor: '#ffedd5' }]}>
                    <Text style={[styles.headerGroupText, { color: '#9a3412' }]}>DRAWN AMOUNT (आहरित रक्कम)</Text>
                </View>

                {/* Difference Group */}
                <View style={[styles.headerGroupCell, { width: pw(groupBaseWidth), backgroundColor: '#e0e7ff' }]}>
                    <Text style={[styles.headerGroupText, { color: '#312e81' }]}>GROSS DIFFERENCE (फरक)</Text>
                </View>

                {/* DCPS 10% */}
                {isNps && (
                    <View style={[styles.headerGroupCell, { width: pw(dcpsWidth), backgroundColor: '#fef3c7' }]}>
                        <Text style={[styles.headerGroupText, { color: '#92400e', fontSize: 9.5 }]}>DCPS 10%</Text>
                    </View>
                )}

                {/* Net Payable */}
                <View style={[styles.headerGroupCell, { width: pw(netWidth), backgroundColor: '#dcfce7' }]}>
                    <Text style={[styles.headerGroupText, { color: '#14532d', fontSize: 8.5 }]}>NET PAYABLE (निव्वळ)</Text>
                </View>
            </View>

            {/* TIER 2: SUB-COLUMNS */}
            <View style={styles.tableRow} fixed>
                <View style={[styles.subHeaderCell, { width: pw(srWidth) }]}><Text style={styles.subHeaderText}>क्र.</Text></View>
                <View style={[styles.subHeaderCell, { width: pw(monthWidth) }]}><Text style={styles.subHeaderText}>महिना</Text></View>
                
                {/* Due Sub Cols */}
                <View style={[styles.subHeaderCell, { width: pw(colPay) }]}><Text style={styles.subHeaderText}>Pay</Text></View>
                <View style={[styles.subHeaderCell, { width: pw(colDa) }]}><Text style={styles.subHeaderText}>DA</Text></View>
                <View style={[styles.subHeaderCell, { width: pw(colHra) }]}><Text style={styles.subHeaderText}>HRA</Text></View>
                <View style={[styles.subHeaderCell, { width: pw(colTa) }]}><Text style={styles.subHeaderText}>TA</Text></View>
                {customColumns.map(c => (
                    <View key={`due-h-${c.id}`} style={[styles.subHeaderCell, { width: pw(colCustom) }]}>
                        <Text style={styles.subHeaderText}>{c.label.toUpperCase()}</Text>
                    </View>
                ))}
                <View style={[styles.subHeaderCell, { width: pw(colTotal), backgroundColor: '#a7f3d0' }]}>
                    <Text style={[styles.subHeaderText, { color: '#065f46' }]}>Total</Text>
                </View>
                
                {/* Drawn Sub Cols */}
                <View style={[styles.subHeaderCell, { width: pw(colPay) }]}><Text style={styles.subHeaderText}>Pay</Text></View>
                <View style={[styles.subHeaderCell, { width: pw(colDa) }]}><Text style={styles.subHeaderText}>DA</Text></View>
                <View style={[styles.subHeaderCell, { width: pw(colHra) }]}><Text style={styles.subHeaderText}>HRA</Text></View>
                <View style={[styles.subHeaderCell, { width: pw(colTa) }]}><Text style={styles.subHeaderText}>TA</Text></View>
                {customColumns.map(c => (
                    <View key={`drawn-h-${c.id}`} style={[styles.subHeaderCell, { width: pw(colCustom) }]}>
                        <Text style={styles.subHeaderText}>{c.label.toUpperCase()}</Text>
                    </View>
                ))}
                <View style={[styles.subHeaderCell, { width: pw(colTotal), backgroundColor: '#fed7aa' }]}>
                    <Text style={[styles.subHeaderText, { color: '#9a3412' }]}>Total</Text>
                </View>
                
                {/* Difference Sub Cols */}
                <View style={[styles.subHeaderCell, { width: pw(colPay) }]}><Text style={styles.subHeaderText}>Pay</Text></View>
                <View style={[styles.subHeaderCell, { width: pw(colDa) }]}><Text style={styles.subHeaderText}>DA</Text></View>
                <View style={[styles.subHeaderCell, { width: pw(colHra) }]}><Text style={styles.subHeaderText}>HRA</Text></View>
                <View style={[styles.subHeaderCell, { width: pw(colTa) }]}><Text style={styles.subHeaderText}>TA</Text></View>
                {customColumns.map(c => (
                    <View key={`diff-h-${c.id}`} style={[styles.subHeaderCell, { width: pw(colCustom) }]}>
                        <Text style={styles.subHeaderText}>{c.label.toUpperCase()}</Text>
                    </View>
                ))}
                <View style={[styles.subHeaderCell, { width: pw(colTotal), backgroundColor: '#c7d2fe' }]}>
                    <Text style={[styles.subHeaderText, { color: '#312e81' }]}>Total</Text>
                </View>
                
                {/* DCPS & Net Payable Sub Headers */}
                {isNps && (
                    <View style={[styles.subHeaderCell, { width: pw(dcpsWidth), backgroundColor: '#fef3c7' }]}>
                        <Text style={[styles.subHeaderText, { color: '#92400e', fontSize: 8.5 }]}>कपात (10%)</Text>
                    </View>
                )}
                <View style={[styles.subHeaderCell, { width: pw(netWidth), backgroundColor: '#bbf7d0' }]}>
                    <Text style={[styles.subHeaderText, { color: '#14532d', fontSize: 8.5 }]}>निव्वळ देय</Text>
                </View>
            </View>

            {/* DATA ROWS */}
            {results.map((row, i) => {
                const isAlt = i % 2 === 1;
                return (
                    <View style={isAlt ? styles.tableRowAlt : styles.tableRow} key={i} wrap={false}>
                        <View style={[styles.cell, { width: pw(srWidth) }]}>
                            <Text style={styles.cellCenterText}>{i + 1}</Text>
                        </View>
                        <View style={[styles.cell, { width: pw(monthWidth) }]}>
                            <Text style={styles.cellCenterText}>{row.label}</Text>
                        </View>
                        
                        {/* Due Data */}
                        <View style={[styles.cell, { width: pw(colPay) }]}>
                            <Text style={styles.cellNumberText}>{formatRupees(row.due.pay)}</Text>
                        </View>
                        <View style={[styles.cell, { width: pw(colDa) }]}>
                            <Text style={styles.cellNumberText}>{formatRupees(row.due.da)}</Text>
                        </View>
                        <View style={[styles.cell, { width: pw(colHra) }]}>
                            <Text style={styles.cellNumberText}>{formatRupees(row.due.hra)}</Text>
                        </View>
                        <View style={[styles.cell, { width: pw(colTa) }]}>
                            <Text style={styles.cellNumberText}>{formatRupees(row.due.ta)}</Text>
                        </View>
                        {customColumns.map(c => (
                            <View key={`due-${c.id}-${i}`} style={[styles.cell, { width: pw(colCustom) }]}>
                                <Text style={styles.cellNumberText}>{formatRupees(row.due.custom?.[c.id] || 0)}</Text>
                            </View>
                        ))}
                        <View style={[styles.cell, { width: pw(colTotal), backgroundColor: '#f0fdf4' }]}>
                            <Text style={styles.cellNumberBold}>{formatRupees(row.due.total)}</Text>
                        </View>
                        
                        {/* Drawn Data */}
                        <View style={[styles.cell, { width: pw(colPay) }]}>
                            <Text style={styles.cellNumberText}>{formatRupees(row.drawn.pay)}</Text>
                        </View>
                        <View style={[styles.cell, { width: pw(colDa) }]}>
                            <Text style={styles.cellNumberText}>{formatRupees(row.drawn.da)}</Text>
                        </View>
                        <View style={[styles.cell, { width: pw(colHra) }]}>
                            <Text style={styles.cellNumberText}>{formatRupees(row.drawn.hra)}</Text>
                        </View>
                        <View style={[styles.cell, { width: pw(colTa) }]}>
                            <Text style={styles.cellNumberText}>{formatRupees(row.drawn.ta)}</Text>
                        </View>
                        {customColumns.map(c => (
                            <View key={`drawn-${c.id}-${i}`} style={[styles.cell, { width: pw(colCustom) }]}>
                                <Text style={styles.cellNumberText}>{formatRupees(row.drawn.custom?.[c.id] || 0)}</Text>
                            </View>
                        ))}
                        <View style={[styles.cell, { width: pw(colTotal), backgroundColor: '#fff7ed' }]}>
                            <Text style={styles.cellNumberBold}>{formatRupees(row.drawn.total)}</Text>
                        </View>
                        
                        {/* Difference Data */}
                        <View style={[styles.cell, { width: pw(colPay) }]}>
                            <Text style={styles.cellNumberText}>{formatRupees(row.diff.pay)}</Text>
                        </View>
                        <View style={[styles.cell, { width: pw(colDa) }]}>
                            <Text style={styles.cellNumberText}>{formatRupees(row.diff.da)}</Text>
                        </View>
                        <View style={[styles.cell, { width: pw(colHra) }]}>
                            <Text style={styles.cellNumberText}>{formatRupees(row.diff.hra)}</Text>
                        </View>
                        <View style={[styles.cell, { width: pw(colTa) }]}>
                            <Text style={styles.cellNumberText}>{formatRupees(row.diff.ta)}</Text>
                        </View>
                        {customColumns.map(c => (
                            <View key={`diff-${c.id}-${i}`} style={[styles.cell, { width: pw(colCustom) }]}>
                                <Text style={styles.cellNumberText}>{formatRupees(row.diff.custom?.[c.id] || 0)}</Text>
                            </View>
                        ))}
                        <View style={[styles.cell, { width: pw(colTotal), backgroundColor: '#eef2ff' }]}>
                            <Text style={[styles.cellNumberBold, { color: '#312e81' }]}>{formatRupees(row.diff.total)}</Text>
                        </View>
                        
                        {/* DCPS & Net Payable Data */}
                        {isNps && (
                            <View style={[styles.cell, { width: pw(dcpsWidth), backgroundColor: '#fffbeb' }]}>
                                <Text style={[styles.cellNumberBold, { color: '#92400e' }]}>{formatRupees(row.dcps)}</Text>
                            </View>
                        )}
                        <View style={[styles.cell, { width: pw(netWidth), backgroundColor: '#f0fdf4' }]}>
                            <Text style={styles.cellNetPayableText}>{formatRupees(row.finalAmount)}</Text>
                        </View>
                    </View>
                );
            })}

            {/* TOTAL ROW */}
            <View style={styles.totalRow} wrap={false}>
                <View style={[styles.totalCell, { width: pw(srWidth + monthWidth) }]}>
                    <Text style={styles.totalTextCenter}>TOTAL (एकूण)</Text>
                </View>
                
                {/* Due Totals */}
                <View style={[styles.totalCell, { width: pw(colPay) }]}>
                    <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDuePay)}</Text>
                </View>
                <View style={[styles.totalCell, { width: pw(colDa) }]}>
                    <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDueDA)}</Text>
                </View>
                <View style={[styles.totalCell, { width: pw(colHra) }]}>
                    <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDueHRA)}</Text>
                </View>
                <View style={[styles.totalCell, { width: pw(colTa) }]}>
                    <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDueTA)}</Text>
                </View>
                {customColumns.map(c => (
                    <View key={`due-tot-${c.id}`} style={[styles.totalCell, { width: pw(colCustom) }]}>
                        <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDueCustom[c.id] || 0)}</Text>
                    </View>
                ))}
                <View style={[styles.totalCell, { width: pw(colTotal), backgroundColor: '#a7f3d0' }]}>
                    <Text style={[styles.totalTextNumber, { color: '#065f46' }]}>{formatRupees(summary.totalDue)}</Text>
                </View>
                
                {/* Drawn Totals */}
                <View style={[styles.totalCell, { width: pw(colPay) }]}>
                    <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDrawnPay)}</Text>
                </View>
                <View style={[styles.totalCell, { width: pw(colDa) }]}>
                    <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDrawnDA)}</Text>
                </View>
                <View style={[styles.totalCell, { width: pw(colHra) }]}>
                    <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDrawnHRA)}</Text>
                </View>
                <View style={[styles.totalCell, { width: pw(colTa) }]}>
                    <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDrawnTA)}</Text>
                </View>
                {customColumns.map(c => (
                    <View key={`drawn-tot-${c.id}`} style={[styles.totalCell, { width: pw(colCustom) }]}>
                        <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDrawnCustom[c.id] || 0)}</Text>
                    </View>
                ))}
                <View style={[styles.totalCell, { width: pw(colTotal), backgroundColor: '#fed7aa' }]}>
                    <Text style={[styles.totalTextNumber, { color: '#9a3412' }]}>{formatRupees(summary.totalDrawn)}</Text>
                </View>
                
                {/* Diff Totals */}
                <View style={[styles.totalCell, { width: pw(colPay) }]}>
                    <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDiffPay)}</Text>
                </View>
                <View style={[styles.totalCell, { width: pw(colDa) }]}>
                    <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDiffDA)}</Text>
                </View>
                <View style={[styles.totalCell, { width: pw(colHra) }]}>
                    <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDiffHRA)}</Text>
                </View>
                <View style={[styles.totalCell, { width: pw(colTa) }]}>
                    <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDiffTA)}</Text>
                </View>
                {customColumns.map(c => (
                    <View key={`diff-tot-${c.id}`} style={[styles.totalCell, { width: pw(colCustom) }]}>
                        <Text style={styles.totalTextNumber}>{formatRupees(summary.totalDiffCustom[c.id] || 0)}</Text>
                    </View>
                ))}
                <View style={[styles.totalCell, { width: pw(colTotal), backgroundColor: '#c7d2fe' }]}>
                    <Text style={[styles.totalTextNumber, { color: '#312e81' }]}>{formatRupees(summary.totalDiff)}</Text>
                </View>
                
                {/* DCPS & Net Totals */}
                {isNps && (
                    <View style={[styles.totalCell, { width: pw(dcpsWidth), backgroundColor: '#fef3c7' }]}>
                        <Text style={[styles.totalTextNumber, { color: '#92400e' }]}>{formatRupees(summary.totalDCPS)}</Text>
                    </View>
                )}
                <View style={[styles.totalCell, { width: pw(netWidth), backgroundColor: '#bbf7d0' }]}>
                    <Text style={styles.totalTextNet}>{formatRupees(summary.netPayable)}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <Document>
            <Page size="A3" orientation="landscape" style={styles.page}>
                {renderHeader()}
                {renderTable()}
                
                {/* Summary & Net Payable Box */}
                <View style={styles.summaryBox} wrap={false}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Due (एकूण देय)</Text>
                        <Text style={styles.summaryValue}>₹{formatRupees(summary.totalDue)}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Drawn (एकूण आहरित)</Text>
                        <Text style={styles.summaryValue}>₹{formatRupees(summary.totalDrawn)}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Gross Diff (एकूण फरक)</Text>
                        <Text style={[styles.summaryValue, { color: '#312e81' }]}>₹{formatRupees(summary.totalDiff)}</Text>
                    </View>
                    {isNps ? (
                        <>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>DCPS 10% Deduction (कपात)</Text>
                                <Text style={[styles.summaryValue, { color: '#92400e' }]}>₹{formatRupees(summary.totalDCPS)}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Govt NPS 14% Share</Text>
                                <Text style={styles.summaryValue}>₹{formatRupees(summary.totalNPS14)}</Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Pension Scheme</Text>
                            <Text style={styles.summaryValue}>GPF (No DCPS)</Text>
                        </View>
                    )}
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryHighlightLabel}>NET PAYABLE (निव्वळ देय फरक)</Text>
                        <Text style={styles.summaryHighlightValue}>₹{formatRupees(summary.netPayable)}</Text>
                    </View>
                </View>


                <Text 
                    style={styles.pageNumber} 
                    render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages} • Arrears Statement under 7th CPC Rules`} 
                    fixed 
                />
            </Page>
        </Document>
    );
};

export default ArrearsPDFDocument;
