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
    addPeriod,
    renderComponentInputs
}) => {
    const isDue = type === 'due';
    const Icon = isDue ? Landmark : TrendingDown;
    
    // Tailwind specific styling logic to replace custom CSS
    const cardBorderColor = isDue ? 'border-blue-200 shadow-blue-100' : 'border-orange-200 shadow-orange-100';
    const headerGradient = isDue ? 'from-blue-50 to-indigo-50' : 'from-orange-50 to-amber-50';
    const titleColor = isDue ? 'text-blue-900' : 'text-orange-900';
    const inputClass = isDue ? 'focus:ring-blue-500 border-blue-200' : 'focus:ring-orange-500 border-orange-200';
    const btnClass = isDue 
        ? 'bg-blue-600 hover:bg-blue-700 w-full mt-4 font-bold shadow-md' 
        : 'bg-orange-600 hover:bg-orange-700 w-full mt-4 font-bold shadow-md';

    return (
        <Card className={`shadow-lg border ${cardBorderColor} h-full flex flex-col`}>
            <CardHeader className={`bg-gradient-to-r ${headerGradient} border-b pb-4`}>
                <div className="flex flex-col items-center">
                    <div className={`flex items-center gap-2 ${titleColor} mb-1`}>
                        <Icon size={24} strokeWidth={2.5} />
                        <CardTitle className="text-2xl font-bold uppercase tracking-wider">{title}</CardTitle>
                    </div>
                    <p className={`text-sm ${isDue ? 'text-blue-600/70' : 'text-orange-600/70'} font-semibold tracking-widest`}>
                        {subtitle}
                    </p>
                </div>
            </CardHeader>
            <CardContent className="pt-6 flex-grow flex flex-col gap-4">
                {renderComponentInputs(type, 'pay', 'Basic Pay', inputClass)}
                {renderComponentInputs(type, 'daRate', `DA Rate ${toggles.autoDAMaharashtra ? '(Auto)' : ''}`, inputClass)}
                {renderComponentInputs(type, 'hraRate', `HRA Rate ${toggles.autoHRAMaharashtra ? '(Auto)' : ''}`, inputClass)}
                {renderComponentInputs(type, 'ta', 'Transport Allowance', inputClass)}
                {customColumns.map(col => renderComponentInputs(type, col.id, col.label, inputClass))}
                
                <div className="mt-auto pt-6 px-4">
                    <Button 
                        onClick={addPeriod}
                        className={btnClass}
                    >
                        PROMOTION / TIMEBOUND DETAILS [+ Add Period]
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default DueDrawnCard;
