"use client";

import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmployeeDetailsProps {
    basicInfo: any;
    updateBasicInfo: (key: string, val: any) => void;
    onLoadSampleData?: () => void;
}

const EmployeeDetailsCard: React.FC<EmployeeDetailsProps> = ({ basicInfo, updateBasicInfo, onLoadSampleData }) => {
    return (
        <Card className="shadow-lg border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b pb-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">01</span>
                    <CardTitle className="text-xl text-blue-900">Employee Details</CardTitle>
                </div>
                {onLoadSampleData && (
                    <button
                        type="button"
                        onClick={onLoadSampleData}
                        className="text-xs bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 font-semibold px-2.5 py-1 rounded-md transition-colors shadow-2xs cursor-pointer"
                    >
                        Load Sample Data
                    </button>
                )}
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">Employee Name</Label>
                    <Input 
                        placeholder="e.g. Ramesh S. Patil"
                        value={basicInfo.empName} 
                        onChange={e => updateBasicInfo('empName', e.target.value)} 
                        className="bg-gray-50 border-gray-200 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">Designation</Label>
                    <Input 
                        placeholder="e.g. Assistant Teacher / Clerk" 
                        value={basicInfo.designation} 
                        onChange={e => updateBasicInfo('designation', e.target.value)} 
                        className="bg-gray-50 border-gray-200 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">From Month (प्रारंभ महिना)</Label>
                    <Input 
                        type="month"
                        value={basicInfo.fromMonth ? basicInfo.fromMonth.substring(0, 7) : ''}
                        onChange={e => updateBasicInfo('fromMonth', e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">To Month (अखेर महिना)</Label>
                    <Input 
                        type="month"
                        value={basicInfo.toMonth ? basicInfo.toMonth.substring(0, 7) : ''}
                        onChange={e => updateBasicInfo('toMonth', e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-600 font-semibold">GR / Order Title (शासन निर्णय / आदेश क्रमांक)</Label>
                    <Input 
                        placeholder="e.g. महाराष्ट्र शासन वित्त विभाग शासन निर्णय क्र. वेतन-११२४/प्र.क्र..." 
                        value={basicInfo.orderNo} 
                        onChange={e => updateBasicInfo('orderNo', e.target.value)} 
                        className="bg-gray-50 border-gray-200 focus:ring-blue-500"
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default EmployeeDetailsCard;
