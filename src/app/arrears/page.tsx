"use client";

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useDebounce } from 'use-debounce';
import { calculateArrearsLogic, getArrearsSummary } from '@/utils/arrearsCalculations';
import EmployeeDetailsCard from '@/components/Arrears/EmployeeDetailsCard';
import ConfigurationCard from '@/components/Arrears/ConfigurationCard';
import DueDrawnCard from '@/components/Arrears/DueDrawnCard';
import ComponentInputGroup from '@/components/Arrears/ComponentInputGroup';
import ArrearsPDFDocument from '@/components/Arrears/ArrearsPDFDocument';
import { Download, Landmark, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, TableProperties, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Dynamic import with SSR disabled to prevent Node.js window/canvas crashes
const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), {
  ssr: false,
  loading: () => (
    <Button disabled className="w-full md:w-96 h-14 text-base font-bold bg-blue-100 text-blue-700 rounded-full">
      Preparing PDF Engine...
    </Button>
  )
});

const MemoizedPDFDownload = React.memo(({ basicInfo, customColumns, results }: any) => {
    if (!results || results.length === 0) {
        return (
            <Button 
                size="lg" 
                disabled 
                className="w-full md:w-96 h-14 text-base font-bold bg-gray-200 text-gray-500 rounded-full cursor-not-allowed"
            >
                Enter Details to Generate PDF
            </Button>
        );
    }

    return (
        <PDFDownloadLink 
            document={<ArrearsPDFDocument basicInfo={basicInfo} customColumns={customColumns} results={results} />} 
            fileName={`Arrears_Statement_${(basicInfo.empName || 'Employee').replace(/\s+/g, '_')}.pdf`}
            className="w-full md:w-auto"
        >
            {({ loading }) => (
                <Button 
                    size="lg" 
                    className="w-full md:w-96 h-14 text-lg font-bold shadow-xl shadow-blue-500/25 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white flex items-center justify-center gap-3 rounded-full transition-all hover:scale-105 cursor-pointer"
                    disabled={loading}
                >
                    <Download size={22} className={loading ? 'animate-bounce' : ''} />
                    {loading ? 'Building PDF Document...' : 'Download Official PDF Statement'}
                </Button>
            )}
        </PDFDownloadLink>
    );
});
MemoizedPDFDownload.displayName = 'MemoizedPDFDownload';

const formatINR = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    return val.toLocaleString('en-IN');
};

export default function ArrearsPage() {
    const [calculationResults, setCalculationResults] = useState<any[]>([]);
    const [isTableExpanded, setIsTableExpanded] = useState(true);

    const [basicInfo, setBasicInfo] = useState({
        empName: '', 
        designation: '', 
        fromMonth: '', 
        toMonth: '',
        orderNo: '', 
        category: 'NPS', 
        incrementMonth: 'July', 
        cityCategory: 'Z'
    });

    const [toggles, setToggles] = useState({
        autoDAMaharashtra: true,
        autoHRAMaharashtra: true,
        promotionEnabled: false
    });

    const [dueComponents, setDueComponents] = useState<any>({ 
        pay: [{ amount: '', from: '' }], 
        daRate: [{ amount: '', from: '' }], 
        hraRate: [{ amount: '', from: '' }], 
        ta: [{ amount: '', from: '' }] 
    });
    
    const [drawnComponents, setDrawnComponents] = useState<any>({ 
        pay: [{ amount: '', from: '' }], 
        daRate: [{ amount: '', from: '' }], 
        hraRate: [{ amount: '', from: '' }], 
        ta: [{ amount: '', from: '' }] 
    });
    
    const [duePromotionPeriods, setDuePromotionPeriods] = useState<any[]>([]);
    const [drawnPromotionPeriods, setDrawnPromotionPeriods] = useState<any[]>([]);

    const [customColumns, setCustomColumns] = useState<any[]>([]);
    const [newColumn, setNewColumn] = useState({ label: '', type: 'manual', percent: 0 });

    const updateBasicInfo = (key: string, val: any) => setBasicInfo(prev => ({ ...prev, [key]: val }));

    const updateComponent = (type: string, key: string, idx: number, field: string, val: any) => {
        const setFn = type === 'due' ? setDueComponents : setDrawnComponents;
        setFn((prev: any) => {
            const next = { ...prev };
            if (!next[key]) next[key] = [];
            const list = [...next[key]];
            if (!list[idx]) list[idx] = { amount: '', from: '' };
            list[idx] = { ...list[idx], [field]: val };
            next[key] = list;
            return next;
        });
    };

    const updatePromotionPeriod = (type: string, idx: number, field: string, val: any) => {
        const setFn = type === 'due' ? setDuePromotionPeriods : setDrawnPromotionPeriods;
        setFn(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: val };
            return next;
        });
    };

    const removePromotionPeriod = (type: string, idx: number) => {
        const setFn = type === 'due' ? setDuePromotionPeriods : setDrawnPromotionPeriods;
        setFn(prev => prev.filter((_, i) => i !== idx));
    };

    const addCustomColumn = () => {
        if (!newColumn.label.trim()) return;
        const id = newColumn.label.toLowerCase().trim().replace(/\s+/g, '_');
        if (customColumns.some(c => c.id === id)) return;
        
        setCustomColumns([...customColumns, { ...newColumn, id }]);
        setDueComponents((prev: any) => ({ ...prev, [id]: [{ amount: '', from: '' }] }));
        setDrawnComponents((prev: any) => ({ ...prev, [id]: [{ amount: '', from: '' }] }));
        setNewColumn({ label: '', type: 'manual', percent: 0 });
    };

    const removeCustomColumn = (id: string) => {
        setCustomColumns(prev => prev.filter(c => c.id !== id));
        setDueComponents((prev: any) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        setDrawnComponents((prev: any) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const loadSampleData = () => {
        setBasicInfo({
            empName: 'Suresh M. Deshmukh',
            designation: 'Senior Assistant',
            fromMonth: '2023-07',
            toMonth: '2024-06',
            orderNo: 'महाराष्ट्र शासन वित्त विभाग शासन निर्णय क्र. वेतन-२०२४/प्र.क्र.२२',
            category: 'NPS',
            incrementMonth: 'July',
            cityCategory: 'Z'
        });
        setDueComponents({
            pay: [{ amount: '56100', from: '' }],
            daRate: [{ amount: '', from: '' }],
            hraRate: [{ amount: '', from: '' }],
            ta: [{ amount: '1350', from: '' }]
        });
        setDrawnComponents({
            pay: [{ amount: '54500', from: '' }],
            daRate: [{ amount: '', from: '' }],
            hraRate: [{ amount: '', from: '' }],
            ta: [{ amount: '1350', from: '' }]
        });
        setToggles({
            autoDAMaharashtra: true,
            autoHRAMaharashtra: true,
            promotionEnabled: false
        });
    };

    const [debouncedBasicInfo] = useDebounce(basicInfo, 400);
    const [debouncedDueComponents] = useDebounce(dueComponents, 400);
    const [debouncedDrawnComponents] = useDebounce(drawnComponents, 400);
    const [debouncedDuePromotionPeriods] = useDebounce(duePromotionPeriods, 400);
    const [debouncedDrawnPromotionPeriods] = useDebounce(drawnPromotionPeriods, 400);
    const [debouncedToggles] = useDebounce(toggles, 400);
    const [debouncedCustomColumns] = useDebounce(customColumns, 400);

    useEffect(() => {
        const results = calculateArrearsLogic({
            basicInfo: debouncedBasicInfo, 
            dueComponents: debouncedDueComponents, 
            drawnComponents: debouncedDrawnComponents, 
            duePromotionPeriods: debouncedDuePromotionPeriods, 
            drawnPromotionPeriods: debouncedDrawnPromotionPeriods, 
            toggles: debouncedToggles, 
            customColumns: debouncedCustomColumns
        });
        setCalculationResults(results);
    }, [debouncedBasicInfo, debouncedDueComponents, debouncedDrawnComponents, debouncedDuePromotionPeriods, debouncedDrawnPromotionPeriods, debouncedToggles, debouncedCustomColumns]);

    const summary = useMemo(() => {
        return getArrearsSummary(calculationResults, debouncedCustomColumns);
    }, [calculationResults, debouncedCustomColumns]);

    const renderComponentInputs = (type: string, compKey: string, label: string, inputClass: string) => (
        <ComponentInputGroup 
            type={type} 
            compKey={compKey} 
            label={label} 
            inputClass={inputClass} 
            components={type === 'due' ? dueComponents : drawnComponents}
            updateComponent={updateComponent}
            basicInfo={basicInfo}
            toggles={toggles}
        />
    );

    return (
        <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-10 font-sans relative">
            <div className="w-full max-w-[1600px] mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700 fade-in relative z-10">
                
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="space-y-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Landmark size={24} />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                                Arrears Statement Calculator
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            वेतन थकबाकी विवरणपत्र • Fully automated 7th Pay Commission calculations with instant PDF generation
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={loadSampleData}
                        variant="outline"
                        className="flex items-center gap-2 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100/60 font-semibold rounded-xl text-sm h-11 px-4 cursor-pointer"
                    >
                        <Sparkles size={16} className="text-blue-600" />
                        Load Sample Scenario
                    </Button>
                </div>

                {/* Input Forms Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <EmployeeDetailsCard 
                        basicInfo={basicInfo} 
                        updateBasicInfo={updateBasicInfo} 
                        onLoadSampleData={loadSampleData}
                    />

                    <ConfigurationCard 
                        toggles={toggles} 
                        setToggles={setToggles} 
                        basicInfo={basicInfo} 
                        updateBasicInfo={updateBasicInfo} 
                        newColumn={newColumn} 
                        setNewColumn={setNewColumn} 
                        addCustomColumn={addCustomColumn}
                        customColumns={customColumns}
                        removeCustomColumn={removeCustomColumn}
                    />
                    
                    <DueDrawnCard 
                        type="due" 
                        title="DUE AMOUNT" 
                        subtitle="देय रक्कम (सुधारित वेतन)"
                        components={dueComponents} 
                        updateComponent={updateComponent} 
                        toggles={toggles} 
                        customColumns={customColumns}
                        basicInfo={basicInfo}
                        promotionPeriods={duePromotionPeriods}
                        updatePromotionPeriod={updatePromotionPeriod}
                        removePeriod={removePromotionPeriod}
                        renderComponentInputs={renderComponentInputs}
                        addPeriod={() => setDuePromotionPeriods([...duePromotionPeriods, { from: '', pay: 0, daRate: 0, hraRate: 0, ta: 0, custom: {} }])}
                    />

                    <DueDrawnCard 
                        type="drawn" 
                        title="DRAWN AMOUNT" 
                        subtitle="पूर्वी दिलेले / काढलेले वेतन"
                        components={drawnComponents} 
                        updateComponent={updateComponent} 
                        toggles={toggles} 
                        customColumns={customColumns}
                        basicInfo={basicInfo}
                        promotionPeriods={drawnPromotionPeriods}
                        updatePromotionPeriod={updatePromotionPeriod}
                        removePeriod={removePromotionPeriod}
                        renderComponentInputs={renderComponentInputs}
                        addPeriod={() => setDrawnPromotionPeriods([...drawnPromotionPeriods, { from: '', pay: 0, daRate: 0, hraRate: 0, ta: 0, custom: {} }])}
                    />
                </div>

                {/* LIVE CALCULATION SUMMARY & PREVIEW TABLE */}
                {calculationResults.length > 0 && (
                    <div className="space-y-6 pt-4 animate-in fade-in duration-500">
                        {/* Summary Metrics Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <Card className="bg-white border-blue-100 shadow-sm rounded-xl">
                                <CardContent className="p-4 sm:p-5">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Due (देय)</p>
                                    <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">₹{formatINR(summary.totalDue)}</p>
                                    <p className="text-[11px] text-blue-600 font-medium mt-1">{summary.monthCount} months period</p>
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

                            {basicInfo.category === 'NPS' ? (
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
                                        Month-by-Month Statement Preview ({calculationResults.length} Months)
                                    </CardTitle>
                                </div>
                                <Button
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
                                                <th className="p-2.5 text-right bg-blue-50 text-blue-800 border-r border-slate-200">Gross Diff</th>
                                                {basicInfo.category === 'NPS' && (
                                                    <th className="p-2.5 text-right bg-amber-50 text-amber-800 border-r border-slate-200">DCPS 10%</th>
                                                )}
                                                <th className="p-2.5 text-right bg-emerald-100 text-emerald-900 font-black">Net Payable</th>
                                            </tr>
                                            <tr className="bg-slate-50 text-[10px] text-slate-600 border-b border-slate-200">
                                                <th className="p-1.5 border-r border-slate-200"></th>
                                                <th className="p-1.5 border-r border-slate-200"></th>
                                                {/* Due Subheads */}
                                                <th className="p-1.5 text-right">Pay</th>
                                                <th className="p-1.5 text-right">DA</th>
                                                <th className="p-1.5 text-right">HRA</th>
                                                <th className="p-1.5 text-right">TA</th>
                                                {customColumns.map(c => <th key={`due-th-${c.id}`} className="p-1.5 text-right">{c.label}</th>)}
                                                <th className="p-1.5 text-right font-bold border-r border-slate-200 bg-emerald-50/60">Total</th>
                                                {/* Drawn Subheads */}
                                                <th className="p-1.5 text-right">Pay</th>
                                                <th className="p-1.5 text-right">DA</th>
                                                <th className="p-1.5 text-right">HRA</th>
                                                <th className="p-1.5 text-right">TA</th>
                                                {customColumns.map(c => <th key={`drawn-th-${c.id}`} className="p-1.5 text-right">{c.label}</th>)}
                                                <th className="p-1.5 text-right font-bold border-r border-slate-200 bg-orange-50/60">Total</th>
                                                {/* Diff & Final */}
                                                <th className="p-1.5 border-r border-slate-200"></th>
                                                {basicInfo.category === 'NPS' && <th className="p-1.5 border-r border-slate-200"></th>}
                                                <th className="p-1.5"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {calculationResults.map((row, idx) => (
                                                <tr key={idx} className={`hover:bg-blue-50/30 transition-colors ${row.isIncrementMonth ? 'bg-amber-50/30 font-medium' : ''}`}>
                                                    <td className="p-2 text-center text-slate-400 border-r border-slate-100">{idx + 1}</td>
                                                    <td className="p-2 font-medium text-slate-800 border-r border-slate-100 whitespace-nowrap">
                                                        {row.label}
                                                        {row.isIncrementMonth && (
                                                            <span className="ml-1.5 text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                                                                INC
                                                            </span>
                                                        )}
                                                    </td>
                                                    {/* Due */}
                                                    <td className="p-2 text-right">{formatINR(row.due.pay)}</td>
                                                    <td className="p-2 text-right">{formatINR(row.due.da)} <span className="text-[9px] text-slate-400">({row.due.daRate}%)</span></td>
                                                    <td className="p-2 text-right">{formatINR(row.due.hra)}</td>
                                                    <td className="p-2 text-right">{formatINR(row.due.ta)}</td>
                                                    {customColumns.map(c => <td key={`due-td-${c.id}`} className="p-2 text-right">{formatINR(row.due.custom?.[c.id] || 0)}</td>)}
                                                    <td className="p-2 text-right font-semibold bg-emerald-50/30 border-r border-slate-100 text-slate-900">{formatINR(row.due.total)}</td>
                                                    {/* Drawn */}
                                                    <td className="p-2 text-right">{formatINR(row.drawn.pay)}</td>
                                                    <td className="p-2 text-right">{formatINR(row.drawn.da)} <span className="text-[9px] text-slate-400">({row.drawn.daRate}%)</span></td>
                                                    <td className="p-2 text-right">{formatINR(row.drawn.hra)}</td>
                                                    <td className="p-2 text-right">{formatINR(row.drawn.ta)}</td>
                                                    {customColumns.map(c => <td key={`drawn-td-${c.id}`} className="p-2 text-right">{formatINR(row.drawn.custom?.[c.id] || 0)}</td>)}
                                                    <td className="p-2 text-right font-semibold bg-orange-50/30 border-r border-slate-100 text-slate-900">{formatINR(row.drawn.total)}</td>
                                                    {/* Diff */}
                                                    <td className="p-2 text-right font-bold text-indigo-700 border-r border-slate-100">{formatINR(row.diff.total)}</td>
                                                    {basicInfo.category === 'NPS' && (
                                                        <td className="p-2 text-right font-semibold text-amber-700 border-r border-slate-100">{formatINR(row.dcps)}</td>
                                                    )}
                                                    <td className="p-2 text-right font-extrabold text-emerald-700 bg-emerald-50/40">{formatINR(row.finalAmount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="sticky bottom-0 z-10 bg-slate-200 border-t-2 border-slate-300 font-extrabold text-slate-900">
                                            <tr>
                                                <td colSpan={2} className="p-2.5 text-center border-r border-slate-300">TOTAL (एकूण)</td>
                                                {/* Due Totals */}
                                                <td className="p-2.5 text-right">{formatINR(summary.totalDuePay)}</td>
                                                <td className="p-2.5 text-right">{formatINR(summary.totalDueDA)}</td>
                                                <td className="p-2.5 text-right">{formatINR(summary.totalDueHRA)}</td>
                                                <td className="p-2.5 text-right">{formatINR(summary.totalDueTA)}</td>
                                                {customColumns.map(c => <td key={`tot-due-${c.id}`} className="p-2.5 text-right">{formatINR(summary.totalDueCustom[c.id] || 0)}</td>)}
                                                <td className="p-2.5 text-right border-r border-slate-300 bg-emerald-100/60">{formatINR(summary.totalDue)}</td>
                                                {/* Drawn Totals */}
                                                <td className="p-2.5 text-right">{formatINR(summary.totalDrawnPay)}</td>
                                                <td className="p-2.5 text-right">{formatINR(summary.totalDrawnDA)}</td>
                                                <td className="p-2.5 text-right">{formatINR(summary.totalDrawnHRA)}</td>
                                                <td className="p-2.5 text-right">{formatINR(summary.totalDrawnTA)}</td>
                                                {customColumns.map(c => <td key={`tot-drawn-${c.id}`} className="p-2.5 text-right">{formatINR(summary.totalDrawnCustom[c.id] || 0)}</td>)}
                                                <td className="p-2.5 text-right border-r border-slate-300 bg-orange-100/60">{formatINR(summary.totalDrawn)}</td>
                                                {/* Diff & Final Totals */}
                                                <td className="p-2.5 text-right text-indigo-900 border-r border-slate-300">{formatINR(summary.totalDiff)}</td>
                                                {basicInfo.category === 'NPS' && (
                                                    <td className="p-2.5 text-right text-amber-900 border-r border-slate-300">{formatINR(summary.totalDCPS)}</td>
                                                )}
                                                <td className="p-2.5 text-right text-emerald-950 bg-emerald-200">{formatINR(summary.netPayable)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {/* PDF Generation Download CTA */}
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200/80 text-center space-y-4">
                    <div className="max-w-md space-y-1">
                        <h3 className="text-xl font-bold text-slate-800">Ready to export official statement?</h3>
                        <p className="text-sm text-slate-500">
                            Renders a high-resolution A3 landscape PDF complete with government order headers, monthly due-drawn breakups, and DDO signature blocks.
                        </p>
                    </div>
                    
                    <MemoizedPDFDownload 
                        basicInfo={debouncedBasicInfo} 
                        customColumns={debouncedCustomColumns} 
                        results={calculationResults} 
                    />
                </div>

            </div>
        </div>
    );
}
