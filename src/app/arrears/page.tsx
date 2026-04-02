"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { calculateArrearsLogic } from '@/utils/arrearsCalculations';
import EmployeeDetailsCard from '@/components/Arrears/EmployeeDetailsCard';
import ConfigurationCard from '@/components/Arrears/ConfigurationCard';
import DueDrawnCard from '@/components/Arrears/DueDrawnCard';
import ComponentInputGroup from '@/components/Arrears/ComponentInputGroup';
import ArrearsPDFDocument from '@/components/Arrears/ArrearsPDFDocument';
import { Download, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Next.js uses server-side rendering by default. React-PDF specifically needs to be dynamically loaded on the client side only
// to prevent window/document undefined crash errors during build.
const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), {
  ssr: false,
  loading: () => <Button disabled className="w-full bg-blue-300">Loading PDF Engine...</Button>
});

export default function ArrearsPage() {
    const [calculationResults, setCalculationResults] = useState<any[]>([]);

    const [basicInfo, setBasicInfo] = useState({
        empName: '', designation: '', fromMonth: '2023-01-01', toMonth: '2023-06-30',
        orderNo: '', category: 'NPS', incrementMonth: 'July', cityCategory: 'Z'
    });

    const [toggles, setToggles] = useState({
        autoDAMaharashtra: true,
        autoHRAMaharashtra: true,
        promotionEnabled: false
    });

    const [dueComponents, setDueComponents] = useState<any>({ pay: [{ amount: '', from: '' }], daRate: [{ amount: '', from: '' }], hraRate: [{ amount: '', from: '' }], ta: [{ amount: '', from: '' }] });
    const [drawnComponents, setDrawnComponents] = useState<any>({ pay: [{ amount: '', from: '' }], daRate: [{ amount: '', from: '' }], hraRate: [{ amount: '', from: '' }], ta: [{ amount: '', from: '' }] });
    
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

    const addCustomColumn = () => {
        if (!newColumn.label) return;
        const id = newColumn.label.toLowerCase().replace(/\s+/g, '_');
        setCustomColumns([...customColumns, { ...newColumn, id }]);
        setDueComponents((prev: any) => ({ ...prev, [id]: [{ amount: '', from: '' }] }));
        setDrawnComponents((prev: any) => ({ ...prev, [id]: [{ amount: '', from: '' }] }));
        setNewColumn({ label: '', type: 'manual', percent: 0 });
    };

    useEffect(() => {
        const results = calculateArrearsLogic({
            basicInfo, dueComponents, drawnComponents, 
            duePromotionPeriods, drawnPromotionPeriods, 
            toggles, customColumns
        });
        setCalculationResults(results);
    }, [basicInfo, dueComponents, drawnComponents, duePromotionPeriods, drawnPromotionPeriods, toggles, customColumns]);

    const formatDate = (date: Date) => date ? date.toISOString().split('T')[0].substring(0, 7) : '';
    
    const renderComponentInputs = (type: string, compKey: string, label: string, inputClass: string) => (
        <ComponentInputGroup 
            type={type} compKey={compKey} label={label} inputClass={inputClass} 
            components={type === 'due' ? dueComponents : drawnComponents}
            updateComponent={updateComponent}
            basicInfo={basicInfo}
            toggles={toggles}
        />
    );

    const CustomHeader = ({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }: any) => {
        // Keeping it simple for the Next.js port.
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight flex items-center justify-center gap-3">
                        <Landmark size={36} className="text-blue-600" />
                        Arrears Statement Calculator
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">Generate 100% accurate Next.js PDF statements</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <EmployeeDetailsCard basicInfo={basicInfo} updateBasicInfo={updateBasicInfo} formatDate={formatDate} CustomHeader={CustomHeader} />
                    <ConfigurationCard toggles={toggles} setToggles={setToggles} basicInfo={basicInfo} updateBasicInfo={updateBasicInfo} newColumn={newColumn} setNewColumn={setNewColumn} addCustomColumn={addCustomColumn} />
                    
                    <DueDrawnCard 
                        type="due" title="DUE AMOUNT" subtitle="देय रक्कम"
                        components={dueComponents} updateComponent={updateComponent} toggles={toggles} customColumns={customColumns}
                        basicInfo={basicInfo}
                        promotionPeriods={duePromotionPeriods}
                        updatePromotionPeriod={updatePromotionPeriod}
                        renderComponentInputs={renderComponentInputs}
                        addPeriod={() => setDuePromotionPeriods([...duePromotionPeriods, { from: '', pay: 0, daRate: 0, hraRate: 0, ta: 0, custom: {} }])}
                    />

                    <DueDrawnCard 
                        type="drawn" title="DRAWN AMOUNT" subtitle="पूर्वी दिलेले वेतन"
                        components={drawnComponents} updateComponent={updateComponent} toggles={toggles} customColumns={customColumns}
                        basicInfo={basicInfo}
                        promotionPeriods={drawnPromotionPeriods}
                        updatePromotionPeriod={updatePromotionPeriod}
                        renderComponentInputs={renderComponentInputs}
                        addPeriod={() => setDrawnPromotionPeriods([...drawnPromotionPeriods, { from: '', pay: 0, daRate: 0, hraRate: 0, ta: 0, custom: {} }])}
                    />
                </div>

                <div className="flex justify-center mt-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <PDFDownloadLink 
                        document={<ArrearsPDFDocument basicInfo={basicInfo} customColumns={customColumns} results={calculationResults} />} 
                        fileName={`Arrears_Statement_${basicInfo.empName || 'Employee'}.pdf`}
                        className="w-full md:w-auto"
                    >
                        {({ blob, url, loading, error }) => (
                            <Button 
                                size="lg" 
                                className="w-full md:w-96 h-14 text-lg font-bold shadow-xl shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 rounded-full transition-all hover:scale-105"
                                disabled={loading}
                            >
                                <Download size={24} />
                                {loading ? 'Rendering PDF...' : 'Download PDF Statement'}
                            </Button>
                        )}
                    </PDFDownloadLink>
                </div>

            </div>
        </div>
    );
}
