import React from 'react';
import { Box, Typography } from '@mui/material';

const ArrearsTable = ({ 
    headerRef, 
    basicInfo, 
    customColumns, 
    calculationResults 
}) => {
    return (
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 2, border: '1px solid', borderColor: 'grey.300', opacity: 0.5, '&:hover': { opacity: 1 }, transition: 'opacity 0.3s' }}>
            <Typography variant="caption" display="block" align="center" sx={{ fontWeight: 'bold', color: 'grey.500', mb: 2, letterSpacing: 2, textTransform: 'uppercase' }}>
                PDF Generation Preview (Internal)
            </Typography>
            <Box sx={{ overflowX: 'auto', p: 1, bgcolor: 'grey.200', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
                <Box sx={{
                    bgcolor: 'white',
                    p: 4,
                    color: 'black',
                    mx: 'auto',
                    transformOrigin: 'top left',
                    transform: { xs: 'scale(0.5)', md: 'scale(0.75)', lg: 'scale(1)' },
                    transition: 'transform 0.3s',
                    width: '2200px',
                    fontFamily: 'Arial, sans-serif'
                }}>

                    {/* HEADER SECTION (Captured as Image for Marathi Support) */}
                    <div ref={headerRef} style={{ padding: '0px', background: 'white' }}>
                        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                            <h2 style={{ fontSize: '30px', fontWeight: 'bold', margin: '0', padding: '0', lineHeight: '1.4', textAlign: 'center', color: '#000' }}>
                                {basicInfo.orderNo}
                            </h2>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', width: '100%', color: '#000', borderBottom: '2px solid #000', paddingBottom: '5px' }}>
                            <div style={{ flex: 1, textAlign: 'left' }}>NAME: <span style={{ fontWeight: 'normal' }}>{basicInfo.empName}</span></div>
                            <div style={{ flex: 1, textAlign: 'center' }}>DESIGNATION: <span style={{ fontWeight: 'normal' }}>{basicInfo.designation}</span></div>
                            <div style={{ flex: 1, textAlign: 'right' }}>PERIOD: <span style={{ fontWeight: 'normal' }}>{basicInfo.fromMonth} TO {basicInfo.toMonth}</span></div>
                        </div>
                    </div>

                    {/* TABLE SECTION */}
                    <div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', tableLayout: 'fixed' }}>
                            <colgroup>
                                <col style={{ width: '3%' }} />
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '6%' }} /> <col style={{ width: '5%' }} /> <col style={{ width: '5%' }} /> <col style={{ width: '5%' }} /> {customColumns.map(c => <col key={c.id} style={{ width: '5%' }} />)} <col style={{ width: '7%' }} />
                                <col style={{ width: '6%' }} /> <col style={{ width: '5%' }} /> <col style={{ width: '5%' }} /> <col style={{ width: '5%' }} /> {customColumns.map(c => <col key={c.id} style={{ width: '5%' }} />)} <col style={{ width: '7%' }} />
                                <col style={{ width: '6%' }} /> <col style={{ width: '5%' }} /> <col style={{ width: '5%' }} /> <col style={{ width: '5%' }} /> {customColumns.map(c => <col key={c.id} style={{ width: '5%' }} />)} <col style={{ width: '7%' }} />
                                {basicInfo.category === 'NPS' ? <><col style={{ width: '5%' }} /><col style={{ width: '5%' }} /></> : <col style={{ width: '10%' }} />}
                            </colgroup>
                            <thead>
                                <tr style={{ textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
                                    <th rowSpan={2} style={{ border: '1px solid black', padding: '8px' }}>SR</th>
                                    <th rowSpan={2} style={{ border: '1px solid black', padding: '8px' }}>MONTH</th>
                                    <th colSpan={5 + customColumns.length} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#e0e7ff' }}>DUE</th>
                                    <th colSpan={5 + customColumns.length} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#e0e7ff' }}>DRAWN</th>
                                    <th colSpan={5 + customColumns.length} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#e0e7ff' }}>DIFFERENCE</th>
                                    {basicInfo.category === 'NPS' && (
                                        <>
                                            <th rowSpan={2} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#e0e7ff' }}>DCPS<br />10%</th>
                                            <th rowSpan={2} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#e0e7ff' }}>NPS<br />14%</th>
                                        </>
                                    )}
                                </tr>
                                <tr style={{ textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
                                    {['PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL'].map((h, i) => <th key={i} style={{ border: '1px solid black', padding: '6px', background: '#f0f0f0' }}>{h}</th>)}
                                    {['PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL'].map((h, i) => <th key={i} style={{ border: '1px solid black', padding: '6px', background: '#f0f0f0' }}>{h}</th>)}
                                    {['PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL'].map((h, i) => <th key={i} style={{ border: '1px solid black', padding: '6px', background: '#f0f0f0' }}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {calculationResults.map((row, idx) => {
                                    const nps14 = Math.round(row.diff.total * 0.14);
                                    return (
                                        <tr key={idx} style={{ textAlign: 'center', color: '#000' }}>
                                            <td style={{ border: '1px solid black', padding: '6px' }}>{idx + 1}</td>
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'left', fontWeight: 'bold' }}>
                                                {row.label}
                                                {row.isIncrementMonth && <span style={{ marginLeft: '5px', fontSize: '10px', border: '1px solid black', padding: '1px 4px', borderRadius: '3px' }}>INC</span>}
                                            </td>
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.due.pay}</td>
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.due.da}</td>
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.due.hra}</td>
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.due.ta}</td>
                                            {customColumns.map(c => <td key={c.id} style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.due.custom[c.id]}</td>)}
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right', fontWeight: 'bold', background: '#f9f9f9' }}>{row.due.total}</td>
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.drawn.pay}</td>
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.drawn.da}</td>
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.drawn.hra}</td>
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.drawn.ta}</td>
                                            {customColumns.map(c => <td key={c.id} style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.drawn.custom[c.id]}</td>)}
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right', fontWeight: 'bold', background: '#f9f9f9' }}>{row.drawn.total}</td>
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.diff.pay}</td>
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.diff.da}</td>
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.diff.hra}</td>
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.diff.ta}</td>
                                            {customColumns.map(c => <td key={c.id} style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.diff.custom[c.id]}</td>)}
                                            <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right', fontWeight: 'bold', background: '#f9f9f9' }}>{row.diff.total}</td>
                                            {basicInfo.category === 'NPS' && (
                                                <>
                                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{row.dcps}</td>
                                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{nps14}</td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                                <tr style={{ fontWeight: 'bold', background: '#e0e0e0', color: '#000' }}>
                                    <td colSpan={2} style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>TOTAL</td>
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.due.pay, 0)}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.due.da, 0)}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.due.hra, 0)}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.due.ta, 0)}</td>
                                    {customColumns.map(c => <td key={c.id} style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + (r.due.custom[c.id] || 0), 0)}</td>)}
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.due.total, 0)}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.drawn.pay, 0)}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.drawn.da, 0)}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.drawn.hra, 0)}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.drawn.ta, 0)}</td>
                                    {customColumns.map(c => <td key={c.id} style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + (r.drawn.custom[c.id] || 0), 0)}</td>)}
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.drawn.total, 0)}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.diff.pay, 0)}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.diff.da, 0)}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.diff.hra, 0)}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.diff.ta, 0)}</td>
                                    {customColumns.map(c => <td key={c.id} style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + (r.diff.custom[c.id] || 0), 0)}</td>)}
                                    <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.diff.total, 0)}</td>
                                    {basicInfo.category === 'NPS' && (
                                        <>
                                            <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.dcps, 0)}</td>
                                            <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + Math.round(r.diff.total * 0.14), 0)}</td>
                                        </>
                                    )}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Box>
            </Box>
        </Box>
    );
};

export default ArrearsTable;
