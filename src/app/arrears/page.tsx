"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { calculateArrearsLogic, getArrearsSummary } from '@/utils/arrearsCalculations';
import EmployeeDetailsCard from '@/components/Arrears/EmployeeDetailsCard';
import ConfigurationCard from '@/components/Arrears/ConfigurationCard';
import DueDrawnCard from '@/components/Arrears/DueDrawnCard';
import ArrearsPreviewSection from '@/components/Arrears/ArrearsPreviewSection';
import ArrearsPDFDownloadButton from '@/components/Arrears/ArrearsPDFDownloadButton';
import { Landmark, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

    const updateBasicInfo = useCallback((key: string, val: any) => {
        setBasicInfo(prev => ({ ...prev, [key]: val }));
    }, []);

    const handleToggleChange = useCallback((key: string, val: boolean) => {
        setToggles(prev => ({ ...prev, [key]: val }));
    }, []);

    const updateComponent = useCallback((type: string, key: string, idx: number, field: string, val: any) => {
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
    }, []);

    const updatePromotionPeriod = useCallback((type: string, idx: number, field: string, val: any) => {
        const setFn = type === 'due' ? setDuePromotionPeriods : setDrawnPromotionPeriods;
        setFn(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: val };
            return next;
        });
    }, []);

    const removePromotionPeriod = useCallback((type: string, idx: number) => {
        const setFn = type === 'due' ? setDuePromotionPeriods : setDrawnPromotionPeriods;
        setFn(prev => prev.filter((_, i) => i !== idx));
    }, []);

    const handleAddPeriod = useCallback((type: string) => {
        const newPeriod = { from: '', pay: 0, daRate: 0, hraRate: 0, ta: 0, custom: {} };
        if (type === 'due') {
            setDuePromotionPeriods(prev => [...prev, newPeriod]);
        } else {
            setDrawnPromotionPeriods(prev => [...prev, newPeriod]);
        }
    }, []);

    const addCustomColumn = useCallback(() => {
        if (!newColumn.label.trim()) return;
        const id = newColumn.label.toLowerCase().trim().replace(/\s+/g, '_');
        if (customColumns.some(c => c.id === id)) return;
        
        setCustomColumns(prev => [...prev, { ...newColumn, id }]);
        setDueComponents((prev: any) => ({ ...prev, [id]: [{ amount: '', from: '' }] }));
        setDrawnComponents((prev: any) => ({ ...prev, [id]: [{ amount: '', from: '' }] }));
        setNewColumn({ label: '', type: 'manual', percent: 0 });
    }, [newColumn, customColumns]);

    const removeCustomColumn = useCallback((id: string) => {
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
    }, []);

    const loadSampleData = useCallback(() => {
        setBasicInfo({
            empName: 'Suresh M. Deshmukh',
            designation: 'Senior Assistant',
            fromMonth: '2023-07-01',
            toMonth: '2024-06-30',
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
    }, []);

    // Combine all calculation dependencies into a single state and debounce together
    // This prevents 7 disjointed timers from firing during active typing
    const calculationInput = useMemo(() => ({
        basicInfo, 
        dueComponents, 
        drawnComponents, 
        duePromotionPeriods, 
        drawnPromotionPeriods, 
        toggles, 
        customColumns
    }), [basicInfo, dueComponents, drawnComponents, duePromotionPeriods, drawnPromotionPeriods, toggles, customColumns]);

    const [debouncedCalcInput] = useDebounce(calculationInput, 250);

    useEffect(() => {
        const results = calculateArrearsLogic(debouncedCalcInput);
        setCalculationResults(results);
    }, [debouncedCalcInput]);

    const summary = useMemo(() => {
        return getArrearsSummary(calculationResults, debouncedCalcInput.customColumns);
    }, [calculationResults, debouncedCalcInput.customColumns]);

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
                        autoDAMaharashtra={toggles.autoDAMaharashtra}
                        autoHRAMaharashtra={toggles.autoHRAMaharashtra}
                        onToggleChange={handleToggleChange}
                        category={basicInfo.category}
                        cityCategory={basicInfo.cityCategory}
                        incrementMonth={basicInfo.incrementMonth}
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
                        autoDAMaharashtra={toggles.autoDAMaharashtra}
                        autoHRAMaharashtra={toggles.autoHRAMaharashtra}
                        fromMonth={basicInfo.fromMonth}
                        cityCategory={basicInfo.cityCategory}
                        customColumns={customColumns}
                        promotionPeriods={duePromotionPeriods}
                        updatePromotionPeriod={updatePromotionPeriod}
                        addPeriod={handleAddPeriod}
                        removePeriod={removePromotionPeriod}
                    />

                    <DueDrawnCard 
                        type="drawn" 
                        title="DRAWN AMOUNT" 
                        subtitle="पूर्वी दिलेले / काढलेले वेतन"
                        components={drawnComponents} 
                        updateComponent={updateComponent} 
                        autoDAMaharashtra={toggles.autoDAMaharashtra}
                        autoHRAMaharashtra={toggles.autoHRAMaharashtra}
                        fromMonth={basicInfo.fromMonth}
                        cityCategory={basicInfo.cityCategory}
                        customColumns={customColumns}
                        promotionPeriods={drawnPromotionPeriods}
                        updatePromotionPeriod={updatePromotionPeriod}
                        addPeriod={handleAddPeriod}
                        removePeriod={removePromotionPeriod}
                    />
                </div>

                {/* LIVE CALCULATION SUMMARY & PREVIEW TABLE (Memoized) */}
                <ArrearsPreviewSection 
                    results={calculationResults}
                    summary={summary}
                    category={debouncedCalcInput.basicInfo.category}
                    customColumns={debouncedCalcInput.customColumns}
                    isTableExpanded={isTableExpanded}
                    setIsTableExpanded={setIsTableExpanded}
                    fromMonth={debouncedCalcInput.basicInfo.fromMonth}
                    toMonth={debouncedCalcInput.basicInfo.toMonth}
                />

                {/* PDF Generation Download CTA (On-Demand) */}
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200/80 text-center space-y-4">
                    <div className="max-w-md space-y-1">
                        <h3 className="text-xl font-bold text-slate-800">Ready to export official statement?</h3>
                        <p className="text-sm text-slate-500">
                            Renders a high-resolution landscape PDF complete with government order headers, monthly due-drawn breakups, and clean net payable totals.
                        </p>
                    </div>
                    
                    <ArrearsPDFDownloadButton 
                        basicInfo={debouncedCalcInput.basicInfo} 
                        customColumns={debouncedCalcInput.customColumns} 
                        results={calculationResults} 
                    />
                </div>

            </div>
        </div>
    );
}
