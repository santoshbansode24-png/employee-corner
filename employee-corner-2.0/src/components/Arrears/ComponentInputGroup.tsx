"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputGroupProps {
    type: string;
    compKey: string;
    label: string;
    inputClass: string;
    components: any;
    updateComponent: (type: string, key: string, idx: number, field: string, val: any) => void;
}

const ComponentInputGroup: React.FC<InputGroupProps> = ({ type, compKey, label, inputClass, components, updateComponent }) => {
    const isDue = type === 'due';
    const comps = components[compKey] || [];
    
    // Convert old custom classes to Tailwind
    const labelColor = isDue ? 'text-blue-600' : 'text-orange-600';
    const focusRing = isDue ? 'focus-within:ring-blue-500 focus-within:border-blue-500' : 'focus-within:ring-orange-500 focus-within:border-orange-500';

    return (
        <React.Fragment>
            {comps.map((item: any, idx: number) => (
                <div key={idx} className={`relative pt-4 ${idx < comps.length - 1 ? 'mb-4' : ''}`}>
                    <div className="absolute top-0 left-2 z-10 px-1 bg-white">
                        <Label className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}>{label}</Label>
                    </div>
                    
                    <div className={`relative flex items-center bg-gray-50 border rounded-lg transition-all ${focusRing} ${inputClass}`}>
                        <span className={`pl-4 pr-2 font-bold text-lg ${isDue ? 'text-blue-500' : 'text-orange-500'}`}>
                            ₹
                        </span>
                        <Input
                            type="number"
                            placeholder="0"
                            value={item.amount || ''}
                            onChange={(e) => updateComponent(type, compKey, idx, 'amount', e.target.value)}
                            className="bg-transparent border-none text-lg font-semibold text-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-300 py-6 pr-4 pl-0"
                            style={{ boxShadow: 'none' }}
                        />
                    </div>
                </div>
            ))}
        </React.Fragment>
    );
};

export default ComponentInputGroup;
