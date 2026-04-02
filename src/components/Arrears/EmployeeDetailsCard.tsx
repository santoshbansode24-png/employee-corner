"use client";

import React from 'react';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmployeeDetailsProps {
    basicInfo: any;
    updateBasicInfo: (key: string, val: any) => void;
    formatDate: (date: Date) => string;
    CustomHeader: any;
}

const EmployeeDetailsCard: React.FC<EmployeeDetailsProps> = ({ basicInfo, updateBasicInfo, formatDate, CustomHeader }) => {
    return (
        <Card className="shadow-lg border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b pb-4">
                <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">01</span>
                    <CardTitle className="text-xl text-blue-900">Employee Details</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">Name</Label>
                    <Input 
                        value={basicInfo.empName} 
                        onChange={e => updateBasicInfo('empName', e.target.value)} 
                        className="bg-gray-50 border-gray-200 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">Designation</Label>
                    <Input 
                        placeholder="सहायक प्राध्यापक" 
                        value={basicInfo.designation} 
                        onChange={e => updateBasicInfo('designation', e.target.value)} 
                        className="bg-gray-50 border-gray-200 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">From Date</Label>
                    <Input 
                        type="date"
                        value={basicInfo.fromMonth}
                        onChange={e => updateBasicInfo('fromMonth', e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-600 font-semibold">To Date</Label>
                    <Input 
                        type="date"
                        value={basicInfo.toMonth}
                        onChange={e => updateBasicInfo('toMonth', e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-600 font-semibold">GR / Order Title</Label>
                    <Input 
                        placeholder="महाराष्ट्र शासन वित्त विभाग..." 
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
