"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMaharashtraDARate, getMaharashtraHRARate } from '@/utils/arrearsCalculations';

interface InputGroupProps {
    type: string;
    compKey: string;
    label: string;
    inputClass: string;
    items: any[];
    updateComponent: (type: string, key: string, idx: number, field: string, val: any) => void;
    fromMonth: string;
    cityCategory: string;
    isAutoDA: boolean;
    isAutoHRA: boolean;
    daRateItemAmount?: string;
}

const ComponentInputGroup: React.FC<InputGroupProps> = ({ 
    type, 
    compKey, 
    label, 
    inputClass, 
    items = [], 
    updateComponent, 
    fromMonth, 
    cityCategory, 
    isAutoDA, 
    isAutoHRA,
    daRateItemAmount
}) => {
    const isDue = type === 'due';
    const comps = items.length > 0 ? items : [{ amount: '', from: '' }];
    
    // Tailwind specific styling logic to replace custom CSS
    const labelColor = isDue ? 'text-emerald-700' : 'text-orange-600';
    const focusRing = isDue ? 'focus-within:ring-emerald-500 focus-within:border-emerald-500' : 'focus-within:ring-orange-500 focus-within:border-orange-500';

    return (
        <React.Fragment>
            {comps.map((item: any, idx: number) => {
                const dateStr = idx === 0 ? fromMonth : (item.from || fromMonth);
                let startYear = new Date().getFullYear();
                let startMonth = new Date().getMonth() + 1;
                if (dateStr) {
                    const parts = dateStr.split('-').map(Number);
                    if (parts[0] && parts[1]) {
                        startYear = parts[0];
                        startMonth = parts[1];
                    }
                }
                
                let autoValue: string | number = '';
                if (isAutoDA) {
                    autoValue = getMaharashtraDARate(startMonth, startYear);
                }
                if (isAutoHRA) {
                    const customDaRate = daRateItemAmount && !isNaN(parseFloat(daRateItemAmount)) 
                        ? parseFloat(daRateItemAmount) 
                        : undefined;
                    autoValue = getMaharashtraHRARate(startMonth, startYear, cityCategory, customDaRate);
                }

                // Show manual input if user overrides, otherwise show auto value. 
                // For non-auto components, directly use item.amount.

                return (
                    <div key={idx} className={`relative pt-4 ${idx < comps.length - 1 ? 'mb-4' : ''}`}>
                        <div className="absolute top-0 left-2 z-10 px-1 bg-white">
                            <Label className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}>{label}</Label>
                        </div>
                        
                        <div className={`relative flex items-center bg-transparent border-2 rounded-lg transition-all ${focusRing} ${inputClass}`}>
                            <span className={`pl-4 pr-1 font-semibold text-lg ${isDue ? 'text-emerald-700' : 'text-gray-600'}`}>
                                {compKey === 'daRate' || compKey === 'hraRate' ? '%' : '₹'}
                            </span>
                            <Input
                                type="number"
                                placeholder={isAutoDA || isAutoHRA ? autoValue.toString() : "0"}
                                value={item.amount || ''}
                                onChange={(e) => updateComponent(type, compKey, idx, 'amount', e.target.value)}
                                className={`bg-transparent border-none text-lg font-semibold text-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-300 py-6 pr-4 pl-0 ${(isAutoDA || isAutoHRA) && (item.amount === '' || item.amount === undefined || item.amount === null) ? 'text-blue-600 bg-blue-50/10' : ''}`}
                                style={{ boxShadow: 'none' }}
                            />
                        </div>
                    </div>
                );
            })}
        </React.Fragment>
    );
};

export default React.memo(ComponentInputGroup);
