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
    components: any;
    updateComponent: (type: string, key: string, idx: number, field: string, val: any) => void;
    basicInfo: any;
    toggles: any;
}

const ComponentInputGroup: React.FC<InputGroupProps> = ({ 
    type, compKey, label, inputClass, components, updateComponent, basicInfo, toggles 
}) => {
    const isDue = type === 'due';
    const comps = components[compKey] || [];
    
    // Convert old custom classes to Tailwind
    const labelColor = isDue ? 'text-emerald-700' : 'text-orange-600';
    const focusRing = isDue ? 'focus-within:ring-emerald-500 focus-within:border-emerald-500' : 'focus-within:ring-orange-500 focus-within:border-orange-500';

    return (
        <React.Fragment>
            {comps.map((item: any, idx: number) => {
                const dateStr = idx === 0 ? basicInfo.fromMonth : (item.from || basicInfo.fromMonth);
                const [startYear, startMonth] = dateStr ? dateStr.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
                
                const isAutoDA = compKey === 'daRate' && toggles.autoDAMaharashtra;
                const isAutoHRA = compKey === 'hraRate' && toggles.autoHRAMaharashtra;
                
                let autoValue: string | number = '';
                if (isAutoDA) autoValue = getMaharashtraDARate(startMonth, startYear);
                if (isAutoHRA) autoValue = getMaharashtraHRARate(startMonth, startYear, basicInfo.cityCategory);

                return (
                <div key={idx} className={`relative pt-4 ${idx < comps.length - 1 ? 'mb-4' : ''}`}>
                    <div className="absolute top-0 left-2 z-10 px-1 bg-white">
                        <Label className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}>{label}</Label>
                    </div>
                    
                    <div className={`relative flex items-center bg-transparent border-2 rounded-lg transition-all ${focusRing} ${inputClass}`}>
                        <span className={`pl-4 pr-1 font-semibold text-lg ${isDue ? 'text-emerald-700' : 'text-gray-600'}`}>
                            ₹
                        </span>
                        <Input
                            type="number"
                            placeholder="0"
                            value={isAutoDA || isAutoHRA ? autoValue : (item.amount || '')}
                            onChange={(e) => updateComponent(type, compKey, idx, 'amount', e.target.value)}
                            disabled={isAutoDA || isAutoHRA}
                            className={`bg-transparent border-none text-lg font-semibold text-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-300 py-6 pr-4 pl-0 ${isAutoDA || isAutoHRA ? 'opacity-80 cursor-not-allowed' : ''}`}
                            style={{ boxShadow: 'none' }}
                        />
                    </div>
                </div>
                );
            })}
        </React.Fragment>

    );
};

export default ComponentInputGroup;
