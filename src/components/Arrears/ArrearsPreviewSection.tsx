"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TableProperties, ChevronUp, ChevronDown } from 'lucide-react';

interface ArrearsPreviewSectionProps {
    results: any[];
    summary: any;
    category: string;
    customColumns: any[];
    isTableExpanded: boolean;
    setIsTableExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    fromMonth?: string;
    toMonth?: string;
}

const formatINR = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    return val.toLocaleString('en-IN');
};

const formatDateDMY = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    if (parts.length === 2) {
        return `${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    return dateStr;
};

const ArrearsPreviewSection: React.FC<ArrearsPreviewSectionProps> = ({
    results,
    summary,
    category,
    customColumns,
    isTableExpanded,
    setIsTableExpanded,
    fromMonth,
    toMonth
}) => {
    if (!results || results.length === 0) return null;

    const fromFormatted = formatDateDMY(fromMonth);
    const toFormatted = formatDateDMY(toMonth);
    const dateRangeLabel = fromFormatted && toFormatted 
        ? `${fromFormatted} to ${toFormatted}` 
        : `${summary.monthCount} months period`;

    return (
        <div className="space-y-6 pt-4 animate-in fade-in duration-500">
            {/* Summary Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-white border-blue-100 shadow-sm rounded-xl">
                    <CardContent className="p-4 sm:p-5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Due (देय)</p>
                        <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">₹{formatINR(summary.totalDue)}</p>
                        <p className="text-[11px] text-blue-600 font-medium mt-1 truncate" title={dateRangeLabel}>
                            {dateRangeLabel} ({summary.monthCount}M)
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-orange-100 shadow-sm rounded-xl">
                    <CardContent className="p-4 sm:p-5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Drawn (आहरित)</p>
                        <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">₹{formatINR(summary.totalDrawn)}</p>
                        <p className="text-[11px] text-orange-600 font-medium mt-1">Already received</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-indigo-100 shadow-sm rounded-xl">
                    <CardContent className="p-4 sm:p-5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Diff (एकूण फरक)</p>
                        <p className="text-xl sm:text-2xl font-black text-indigo-700 mt-1">₹{formatINR(summary.totalDiff)}</p>
                        <p className="text-[11px] text-indigo-500 font-medium mt-1">Before deductions</p>
                    </CardContent>
                </Card>

                {category === 'NPS' ? (
                    <Card className="bg-white border-amber-100 shadow-sm rounded-xl">
                        <CardContent className="p-4 sm:p-5">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">DCPS 10% (कपात)</p>
                            <p className="text-xl sm:text-2xl font-black text-amber-700 mt-1">₹{formatINR(summary.totalDCPS)}</p>
                            <p className="text-[11px] text-amber-600 font-medium mt-1">Govt 14%: ₹{formatINR(summary.totalNPS14)}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-white border-slate-100 shadow-sm rounded-xl">
                        <CardContent className="p-4 sm:p-5">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">GPF Scheme</p>
                            <p className="text-xl sm:text-2xl font-black text-slate-700 mt-1">₹0</p>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">No DCPS deducted</p>
                        </CardContent>
                    </Card>
                )}

                <Card className="col-span-2 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-xl">
                    <CardContent className="p-4 sm:p-5">
                        <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Net Payable (निव्वळ)</p>
                        <p className="text-2xl sm:text-3xl font-black text-white mt-1">₹{formatINR(summary.netPayable)}</p>
                        <p className="text-[11px] text-emerald-200 font-medium mt-1">Final Disbursable</p>
                    </CardContent>
                </Card>
            </div>

            {/* Interactive Data Table Card */}
            <Card className="bg-white border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/80 border-b border-slate-200/60 p-4 sm:p-5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <TableProperties size={20} className="text-blue-600" />
                        <CardTitle className="text-lg font-bold text-slate-800">
                            Month-by-Month Statement Preview ({results.length} Months)
                        </CardTitle>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsTableExpanded(!isTableExpanded)}
                        className="text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                        {isTableExpanded ? (
                            <span className="flex items-center gap-1 text-xs font-semibold">Collapse <ChevronUp size={16} /></span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold">Expand <ChevronDown size={16} /></span>
                        )}
                    </Button>
                </CardHeader>

                {isTableExpanded && (
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-2.5 text-center border-r border-slate-200">SR</th>
                                    <th className="p-2.5 text-center border-r border-slate-200">Month</th>
                                    <th colSpan={4 + customColumns.length + 1} className="p-2 text-center bg-emerald-50 text-emerald-800 border-r border-slate-200">
                                        Due Amount (देय रक्कम)
                                    </th>
                                    <th colSpan={4 + customColumns.length + 1} className="p-2 text-center bg-orange-50 text-orange-800 border-r border-slate-200">
                                        Drawn Amount (आहरित रक्कम)
                                    </th>
                                    <th className="p-2.5 text-center bg-blue-50 text-blue-800 border-r border-slate-200">Gross Diff</th>
                                    {category === 'NPS' && (
                                        <th className="p-2.5 text-center bg-amber-50 text-amber-800 border-r border-slate-200">DCPS 10%</th>
                                    )}
                                    <th className="p-2.5 text-center bg-emerald-100 text-emerald-900 font-black">Net Payable</th>
                                </tr>
                                <tr className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-200">
                                    <th className="p-1.5 border-r border-slate-200"></th>
                                    <th className="p-1.5 border-r border-slate-200"></th>
                                    {/* Due Subheads */}
                                    <th className="p-1.5 text-center">Pay</th>
                                    <th className="p-1.5 text-center">DA</th>
                                    <th className="p-1.5 text-center">HRA</th>
                                    <th className="p-1.5 text-center">TA</th>
                                    {customColumns.map(c => <th key={`due-th-${c.id}`} className="p-1.5 text-center">{c.label}</th>)}
                                    <th className="p-1.5 text-center font-bold border-r border-slate-200 bg-emerald-50/60">Total</th>
                                    {/* Drawn Subheads */}
                                    <th className="p-1.5 text-center">Pay</th>
                                    <th className="p-1.5 text-center">DA</th>
                                    <th className="p-1.5 text-center">HRA</th>
                                    <th className="p-1.5 text-center">TA</th>
                                    {customColumns.map(c => <th key={`drawn-th-${c.id}`} className="p-1.5 text-center">{c.label}</th>)}
                                    <th className="p-1.5 text-center font-bold border-r border-slate-200 bg-orange-50/60">Total</th>
                                    {/* Diff & Final */}
                                    <th className="p-1.5 border-r border-slate-200"></th>
                                    {category === 'NPS' && <th className="p-1.5 border-r border-slate-200"></th>}
                                    <th className="p-1.5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {results.map((row, idx) => (
                                    <tr key={idx} className={`hover:bg-blue-50/30 transition-colors ${row.isIncrementMonth ? 'bg-amber-50/30 font-medium' : ''}`}>
                                        <td className="p-2 text-center text-slate-400 border-r border-slate-100">{idx + 1}</td>
                                        <td className="p-2 font-medium text-slate-800 border-r border-slate-100 whitespace-nowrap text-center">
                                            {row.label}
                                            {row.isIncrementMonth && (
                                                <span className="ml-1.5 text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                                                    INC
                                                </span>
                                            )}
                                        </td>
                                        {/* Due */}
                                        <td className="p-2 text-center">{formatINR(row.due.pay)}</td>
                                        <td className="p-2 text-center">{formatINR(row.due.da)} <span className="text-[9px] text-slate-400">({row.due.daRate}%)</span></td>
                                        <td className="p-2 text-center">{formatINR(row.due.hra)}</td>
                                        <td className="p-2 text-center">{formatINR(row.due.ta)}</td>
                                        {customColumns.map(c => <td key={`due-td-${c.id}`} className="p-2 text-center">{formatINR(row.due.custom?.[c.id] || 0)}</td>)}
                                        <td className="p-2 text-center font-semibold bg-emerald-50/30 border-r border-slate-100 text-slate-900">{formatINR(row.due.total)}</td>
                                        {/* Drawn */}
                                        <td className="p-2 text-center">{formatINR(row.drawn.pay)}</td>
                                        <td className="p-2 text-center">{formatINR(row.drawn.da)} <span className="text-[9px] text-slate-400">({row.drawn.daRate}%)</span></td>
                                        <td className="p-2 text-center">{formatINR(row.drawn.hra)}</td>
                                        <td className="p-2 text-center">{formatINR(row.drawn.ta)}</td>
                                        {customColumns.map(c => <td key={`drawn-td-${c.id}`} className="p-2 text-center">{formatINR(row.drawn.custom?.[c.id] || 0)}</td>)}
                                        <td className="p-2 text-center font-semibold bg-orange-50/30 border-r border-slate-100 text-slate-900">{formatINR(row.drawn.total)}</td>
                                        {/* Diff */}
                                        <td className="p-2 text-center font-bold text-indigo-700 border-r border-slate-100">{formatINR(row.diff.total)}</td>
                                        {category === 'NPS' && (
                                            <td className="p-2 text-center font-semibold text-amber-700 border-r border-slate-100">{formatINR(row.dcps)}</td>
                                        )}
                                        <td className="p-2 text-center font-extrabold text-emerald-700 bg-emerald-50/40">{formatINR(row.finalAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="sticky bottom-0 z-10 bg-slate-200 border-t-2 border-slate-300 font-extrabold text-slate-900">
                                <tr>
                                    <td colSpan={2} className="p-2.5 text-center border-r border-slate-300">TOTAL (एकूण)</td>
                                    {/* Due Totals */}
                                    <td className="p-2.5 text-center">{formatINR(summary.totalDuePay)}</td>
                                    <td className="p-2.5 text-center">{formatINR(summary.totalDueDA)}</td>
                                    <td className="p-2.5 text-center">{formatINR(summary.totalDueHRA)}</td>
                                    <td className="p-2.5 text-center">{formatINR(summary.totalDueTA)}</td>
                                    {customColumns.map(c => <td key={`tot-due-${c.id}`} className="p-2.5 text-center">{formatINR(summary.totalDueCustom[c.id] || 0)}</td>)}
                                    <td className="p-2.5 text-center border-r border-slate-300 bg-emerald-100/60">{formatINR(summary.totalDue)}</td>
                                    {/* Drawn Totals */}
                                    <td className="p-2.5 text-center">{formatINR(summary.totalDrawnPay)}</td>
                                    <td className="p-2.5 text-center">{formatINR(summary.totalDrawnDA)}</td>
                                    <td className="p-2.5 text-center">{formatINR(summary.totalDrawnHRA)}</td>
                                    <td className="p-2.5 text-center">{formatINR(summary.totalDrawnTA)}</td>
                                    {customColumns.map(c => <td key={`tot-drawn-${c.id}`} className="p-2.5 text-center">{formatINR(summary.totalDrawnCustom[c.id] || 0)}</td>)}
                                    <td className="p-2.5 text-center border-r border-slate-300 bg-orange-100/60">{formatINR(summary.totalDrawn)}</td>
                                    {/* Diff & Final Totals */}
                                    <td className="p-2.5 text-center text-indigo-900 border-r border-slate-300">{formatINR(summary.totalDiff)}</td>
                                    {category === 'NPS' && (
                                        <td className="p-2.5 text-center text-amber-900 border-r border-slate-300">{formatINR(summary.totalDCPS)}</td>
                                    )}
                                    <td className="p-2.5 text-center text-emerald-950 bg-emerald-200">{formatINR(summary.netPayable)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default React.memo(ArrearsPreviewSection);
