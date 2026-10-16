"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark, TrendingDown, Trash2 } from "lucide-react";
import ComponentInputGroup from './ComponentInputGroup';

interface DueDrawnProps {
    type: 'due' | 'drawn';
    title: string;
    subtitle: string;
    components: any;
    updateComponent: (type: string, key: string, idx: number, field: string, val: any) => void;
    autoDAMaharashtra: boolean;
    autoHRAMaharashtra: boolean;
    fromMonth: string;
    cityCategory: string;
    customColumns: any[];
    promotionPeriods: any[];
    updatePromotionPeriod: (type: string, idx: number, field: string, val: any) => void;
    addPeriod: (type: string) => void;
    removePeriod?: (type: string, idx: number) => void;
}

const DueDrawnCard: React.FC<DueDrawnProps> = ({ 
    type, 
    title, 
    subtitle, 
    components, 
    updateComponent, 
    autoDAMaharashtra,
    autoHRAMaharashtra,
    fromMonth,
    cityCategory,
    customColumns = [], 
    promotionPeriods = [],
    updatePromotionPeriod,
    addPeriod,
    removePeriod
}) => {
    const isDue = type === 'due';
    const Icon = isDue ? Landmark : TrendingDown;
    
    // Tailwind specific styling logic to replace custom CSS
    const cardBorderColor = isDue ? 'border-emerald-200 shadow-emerald-100' : 'border-orange-200 shadow-orange-100';
    const titleColor = 'text-white';
    const inputClass = isDue ? 'focus:ring-emerald-500 border-emerald-400' : 'focus:ring-orange-500 border-orange-400';
    const btnClass = isDue 
        ? 'text-white border-0 bg-emerald-600 hover:bg-emerald-700 w-full mt-2 font-bold shadow-md h-12 rounded-xl transition-all cursor-pointer' 
        : 'text-white border-0 bg-[#ea580c] hover:bg-[#c2410c] w-full mt-2 font-bold shadow-md h-12 rounded-xl transition-all cursor-pointer';

    const daAmt = components['daRate']?.[0]?.amount;

    return (
        <Card className={`shadow-sm border-2 ${cardBorderColor} h-full flex flex-col rounded-xl overflow-hidden`}>
            <CardHeader className={`${isDue ? 'bg-emerald-600' : 'bg-[#ea580c]'} pb-4 pt-5 px-6`}>
                <div className="flex items-start gap-4">
                    <div className="bg-white/20 p-3 rounded-lg mt-1">
                        <Icon size={28} className="text-white" strokeWidth={2} />
                    </div>
                    <div>
                        <CardTitle className={`text-xl font-extrabold uppercase tracking-wide ${titleColor} mb-1 drop-shadow-sm`}>{title}</CardTitle>
                        <p className="text-sm text-white/90 font-medium tracking-wider">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-8 px-6 flex-grow flex flex-col gap-5">
                <ComponentInputGroup 
                    type={type}
                    compKey="pay"
                    label="Basic Pay"
                    inputClass={inputClass}
                    items={components.pay}
                    updateComponent={updateComponent}
                    fromMonth={fromMonth}
                    cityCategory={cityCategory}
                    isAutoDA={false}
                    isAutoHRA={false}
                />
                
                <ComponentInputGroup 
                    type={type}
                    compKey="daRate"
                    label={`DA Rate ${autoDAMaharashtra ? '(Auto)' : ''}`}
                    inputClass={inputClass}
                    items={components.daRate}
                    updateComponent={updateComponent}
                    fromMonth={fromMonth}
                    cityCategory={cityCategory}
                    isAutoDA={autoDAMaharashtra}
                    isAutoHRA={false}
                />

                <ComponentInputGroup 
                    type={type}
                    compKey="hraRate"
                    label={`HRA Rate ${autoHRAMaharashtra ? '(Auto)' : ''}`}
                    inputClass={inputClass}
                    items={components.hraRate}
                    updateComponent={updateComponent}
                    fromMonth={fromMonth}
                    cityCategory={cityCategory}
                    isAutoDA={false}
                    isAutoHRA={autoHRAMaharashtra}
                    daRateItemAmount={daAmt}
                />

                <ComponentInputGroup 
                    type={type}
                    compKey="ta"
                    label="Transport Allowance"
                    inputClass={inputClass}
                    items={components.ta}
                    updateComponent={updateComponent}
                    fromMonth={fromMonth}
                    cityCategory={cityCategory}
                    isAutoDA={false}
                    isAutoHRA={false}
                />

                {customColumns.map(col => (
                    <ComponentInputGroup 
                        key={col.id}
                        type={type}
                        compKey={col.id}
                        label={col.label}
                        inputClass={inputClass}
                        items={components[col.id]}
                        updateComponent={updateComponent}
                        fromMonth={fromMonth}
                        cityCategory={cityCategory}
                        isAutoDA={false}
                        isAutoHRA={false}
                    />
                ))}
                
                {/* PROMOTION PERIODS UI */}
                {promotionPeriods && promotionPeriods.length > 0 && (
                    <div className="mt-4 space-y-3">
                        <div className={`text-xs font-bold uppercase tracking-wider ${isDue ? 'text-emerald-700' : 'text-orange-700'}`}>
                            Promotion / Timebound Overrides
                        </div>
                        {promotionPeriods.map((period, idx) => (
                            <div key={idx} className={`p-3 bg-gray-50 border rounded-lg space-y-2 ${isDue ? 'border-emerald-200' : 'border-orange-200'} transition-all`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-500">Period #{idx + 1}</span>
                                    {removePeriod && (
                                        <button
                                            type="button"
                                            onClick={() => removePeriod(type, idx)}
                                            className="text-red-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                            title="Delete period"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">Effective Date (लागू दिनांक)</label>
                                        <input 
                                            type="date" 
                                            value={period.from ? (period.from.length === 7 ? `${period.from}-01` : period.from) : ''} 
                                            onChange={(e) => updatePromotionPeriod(type, idx, 'from', e.target.value)} 
                                            className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-opacity-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">New Basic (₹)</label>
                                        <input 
                                            type="number" 
                                            placeholder="Basic Pay" 
                                            value={period.pay || ''} 
                                            onChange={(e) => updatePromotionPeriod(type, idx, 'pay', Number(e.target.value))} 
                                            className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-opacity-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">DA (%)</label>
                                        <input 
                                            type="number" 
                                            placeholder="DA %" 
                                            value={period.daRate || ''} 
                                            onChange={(e) => updatePromotionPeriod(type, idx, 'daRate', Number(e.target.value))} 
                                            className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-opacity-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">HRA (%)</label>
                                        <input 
                                            type="number" 
                                            placeholder="HRA %" 
                                            value={period.hraRate || ''} 
                                            onChange={(e) => updatePromotionPeriod(type, idx, 'hraRate', Number(e.target.value))} 
                                            className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-opacity-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">TA (₹)</label>
                                        <input 
                                            type="number" 
                                            placeholder="TA" 
                                            value={period.ta || ''} 
                                            onChange={(e) => updatePromotionPeriod(type, idx, 'ta', Number(e.target.value))} 
                                            className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-opacity-50"
                                        />
                                    </div>
                                    {customColumns.map(col => (
                                        <div key={col.id}>
                                            <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">{col.label}</label>
                                            <input 
                                                type="number" 
                                                placeholder={col.label} 
                                                value={(period.custom && period.custom[col.id]) || ''} 
                                                onChange={(e) => {
                                                    const updatedCustom = { ...(period.custom || {}), [col.id]: Number(e.target.value) };
                                                    updatePromotionPeriod(type, idx, 'custom', updatedCustom);
                                                }} 
                                                className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-opacity-50"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="mt-auto pt-4 border-t border-gray-100 -mx-2 px-2">
                    <Button 
                        type="button"
                        onClick={() => addPeriod(type)}
                        className={btnClass}
                    >
                        PROMOTION / TIMEBOUND DETAILS + Add Period
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default React.memo(DueDrawnCard);
