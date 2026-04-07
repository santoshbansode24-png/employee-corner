"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark, TrendingDown } from "lucide-react";

interface DueDrawnProps {
    type: 'due' | 'drawn';
    title: string;
    subtitle: string;
    components: any;
    updateComponent: any;
    toggles: any;
    customColumns: any[];
    basicInfo: any;
    promotionPeriods: any[];
    updatePromotionPeriod: (type: string, idx: number, field: string, val: any) => void;
    addPeriod: () => void;
    renderComponentInputs: (type: string, key: string, label: string, inputClass: string) => React.ReactNode;
}

const DueDrawnCard: React.FC<DueDrawnProps> = ({ 
    type, 
    title, 
    subtitle, 
    components, 
    updateComponent, 
    toggles, 
    customColumns, 
    basicInfo,
    promotionPeriods,
    updatePromotionPeriod,
    addPeriod,
    renderComponentInputs
}) => {
    const isDue = type === 'due';
    const Icon = isDue ? Landmark : TrendingDown;
    
    // Tailwind specific styling logic to replace custom CSS
    const cardBorderColor = isDue ? 'border-emerald-200 shadow-emerald-100' : 'border-orange-200 shadow-orange-100';
    const headerBg = isDue ? 'bg-[#10b981]' : 'bg-[#facc15] bg-opacity-90'; // Approximate to exact match on image (green & orange/amber)
    const titleColor = 'text-white';
    const inputClass = isDue ? 'focus:ring-emerald-500 border-emerald-400' : 'focus:ring-orange-500 border-orange-400';
    const btnClass = isDue 
        ? 'text-white border-0 bg-emerald-600 hover:bg-emerald-700 w-full mt-2 font-bold shadow-md h-12 rounded-xl transition-all' 
        : 'text-white border-0 bg-[#ea580c] hover:bg-[#c2410c] w-full mt-2 font-bold shadow-md h-12 rounded-xl transition-all';

    return (
        <Card className={`shadow-sm border-2 ${cardBorderColor} h-full flex flex-col rounded-xl overflow-hidden`}>
            <CardHeader className={`${isDue ? 'bg-emerald-600' : 'bg-[#ea580c]'} pb-4 pt-5 px-6`}>
                <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-lg mt-1">
                        <Icon size={28} className="text-white" strokeWidth={2} />
                    </div>
                    <div>
                        <CardTitle className={`text-xl font-extrabold uppercase tracking-wide ${titleColor} mb-1 drop-shadow-sm`}>{title}</CardTitle>
                        <p className={`text-sm text-white/90 font-medium tracking-wider`}>
                            {subtitle}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-8 px-6 flex-grow flex flex-col gap-5">
                {renderComponentInputs(type, 'pay', 'Basic Pay', inputClass)}
                {renderComponentInputs(type, 'daRate', `DA Rate ${toggles.autoDAMaharashtra ? '(Auto)' : ''}`, inputClass)}
                {renderComponentInputs(type, 'hraRate', `HRA Rate ${toggles.autoHRAMaharashtra ? '(Auto)' : ''}`, inputClass)}
                {renderComponentInputs(type, 'ta', 'Transport Allowance', inputClass)}
                {customColumns.map(col => renderComponentInputs(type, col.id, col.label, inputClass))}
                
                {/* PROMOTION PERIODS UI */}
                {promotionPeriods && promotionPeriods.length > 0 && (
                    <div className="mt-4 space-y-3">
                        <div className={`text-xs font-bold uppercase tracking-wider ${isDue ? 'text-emerald-700' : 'text-orange-700'}`}>
                            Promotion / Timebound Overrides
                        </div>
                        {promotionPeriods.map((period, idx) => (
                            <div key={idx} className={`flex flex-wrap gap-2 p-3 bg-gray-50 border rounded-lg items-center ${isDue ? 'border-emerald-200 focus-within:ring-emerald-500' : 'border-orange-200 focus-within:ring-orange-500'} transition-all`}>
                                <span className="text-gray-400 text-xs font-bold w-4 flex-shrink-0">{idx + 1}</span>
                                <input 
                                    type="month" 
                                    value={period.from} 
                                    onChange={(e) => updatePromotionPeriod(type, idx, 'from', e.target.value)} 
                                    className="w-32 bg-white border border-gray-200 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-opacity-50"
                                />
                                <input 
                                    type="number" 
                                    placeholder="Basic Pay" 
                                    value={period.pay || ''} 
                                    onChange={(e) => updatePromotionPeriod(type, idx, 'pay', Number(e.target.value))} 
                                    className="w-24 bg-white border border-gray-200 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-opacity-50"
                                />
                                <input 
                                    type="number" 
                                    placeholder="DA %" 
                                    value={period.daRate || ''} 
                                    onChange={(e) => updatePromotionPeriod(type, idx, 'daRate', Number(e.target.value))} 
                                    className="w-20 bg-white border border-gray-200 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-opacity-50"
                                />
                                <input 
                                    type="number" 
                                    placeholder="HRA %" 
                                    value={period.hraRate || ''} 
                                    onChange={(e) => updatePromotionPeriod(type, idx, 'hraRate', Number(e.target.value))} 
                                    className="w-20 bg-white border border-gray-200 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-opacity-50"
                                />
                                <input 
                                    type="number" 
                                    placeholder="TA" 
                                    value={period.ta || ''} 
                                    onChange={(e) => updatePromotionPeriod(type, idx, 'ta', Number(e.target.value))} 
                                    className="w-20 bg-white border border-gray-200 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-opacity-50"
                                />
                                {customColumns.map(col => (
                                    <input 
                                        key={col.id}
                                        type="number" 
                                        placeholder={col.label} 
                                        value={(period.custom && period.custom[col.id]) || ''} 
                                        onChange={(e) => {
                                            const updatedCustom = { ...(period.custom || {}), [col.id]: Number(e.target.value) };
                                            updatePromotionPeriod(type, idx, 'custom', updatedCustom);
                                        }} 
                                        className="w-24 bg-white border border-gray-200 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-opacity-50"
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="mt-auto pt-4 border-t border-gray-100 -mx-2 px-2">
                    <Button 
                        onClick={addPeriod}
                        className={btnClass}
                    >
                        {title.includes('DUE') ? 'PROMOTION / TIMEBOUND DETAILS + Add Period' : 'PROMOTION / TIMEBOUND DETAILS + Add Period'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default DueDrawnCard;
