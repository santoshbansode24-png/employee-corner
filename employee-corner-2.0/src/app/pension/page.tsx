"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Landmark, Download, FileText } from "lucide-react";
import { calculatePensionLogic, PensionResult } from '@/utils/pensionCalculations';
import PensionPDFDocument from '@/components/Pension/PensionPDFDocument';

// Dynamically import PDFDownloadLink (prevents server-side rendering issues)
const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), {
  ssr: false,
  loading: () => <Button disabled className="w-full bg-blue-300">Loading PDF Engine...</Button>
});

export default function PensionPage() {
    const [formData, setFormData] = useState({
        name: '', dob: '', doj: '', retirementDate: '', basicPay: '', earnedLeave: '', daRate: 55,
    });

    const [result, setResult] = useState<PensionResult | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculatePension = (e: React.FormEvent) => {
        e.preventDefault();
        const calculatedResult = calculatePensionLogic(formData);
        setResult(calculatedResult);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-4xl font-extrabold text-indigo-900 tracking-tight flex items-center justify-center gap-3">
                        <Landmark size={36} className="text-indigo-600" />
                        Pension Calculator
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">Government Employee Gratuity & Pension Math</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    {/* Input Form */}
                    <Card className="shadow-lg border-indigo-100">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                            <CardTitle className="text-xl text-indigo-900 flex items-center gap-2">
                                <FileText size={20} /> Employee Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={calculatePension}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold">Employee Name</Label>
                                        <Input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ex: Ramesh Patil" required className="bg-gray-50 focus:ring-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold">Date of Birth</Label>
                                        <Input type="date" name="dob" value={formData.dob} onChange={handleInputChange} required className="bg-gray-50 focus:ring-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold">Date of Joining</Label>
                                        <Input type="date" name="doj" value={formData.doj} onChange={handleInputChange} required className="bg-gray-50 focus:ring-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold">Retirement Date</Label>
                                        <Input type="date" name="retirementDate" value={formData.retirementDate} onChange={handleInputChange} required className="bg-gray-50 focus:ring-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold">Last Basic Pay (₹)</Label>
                                        <Input type="number" name="basicPay" value={formData.basicPay} onChange={handleInputChange} placeholder="Ex: 56100" required className="bg-gray-50 focus:ring-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold">Earned Leave (Days)</Label>
                                        <Input type="number" name="earnedLeave" value={formData.earnedLeave} onChange={handleInputChange} placeholder="Ex: 300" required className="bg-gray-50 focus:ring-indigo-500" />
                                    </div>
                                    <div className="space-y-2 lg:col-span-3">
                                        <Label className="text-gray-700 font-semibold">Current DA Rate (%)</Label>
                                        <Input type="number" name="daRate" value={formData.daRate} onChange={handleInputChange} step="0.01" required className="bg-gray-50 focus:ring-indigo-500" />
                                    </div>
                                </div>
                                <Button type="submit" size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg h-14 rounded-xl shadow-lg shadow-indigo-500/30">
                                    Calculate Pension Breakdown
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Results Section */}
                    {result && (
                        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                            
                            {/* Service Details */}
                            <Card className="shadow-sm border-gray-200">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800">Service Profile</h3>
                                    <span className="text-sm font-medium text-gray-500">{result.name}</span>
                                </div>
                                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex justify-between items-center p-3 bg-white border rounded-lg">
                                        <span className="text-gray-500">Total Valid Service</span>
                                        <span className="font-bold text-indigo-700">{result.serviceLength.years} yrs, {result.serviceLength.months} mos</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white border rounded-lg">
                                        <span className="text-gray-500">Last Basic Pay</span>
                                        <span className="font-bold text-gray-900">₹ {Math.round(result.basicPay).toLocaleString('en-IN')}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Two-Column Financial Split */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Self Pension */}
                                <Card className="shadow-md border-indigo-100 h-full">
                                    <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                                        <h3 className="font-bold text-indigo-900">Monthly Pension (Self)</h3>
                                    </div>
                                    <CardContent className="p-6 space-y-4 text-sm font-medium">
                                        <div className="flex justify-between"><span className="text-gray-500">Basic Pension (50%)</span><span className="text-gray-900">₹ {Math.round(result.basicPension).toLocaleString('en-IN')}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Commuted Value (40%)</span><span className="text-gray-900">₹ {Math.round(result.commutedPension).toLocaleString('en-IN')}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">CVP Limit Rate ({result.cvpRate})</span><span className="text-gray-900">₹ {Math.round(result.cvp).toLocaleString('en-IN')}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Reduced Pension</span><span className="text-gray-900">₹ {Math.round(result.reducedPension).toLocaleString('en-IN')}</span></div>
                                        <div className="flex justify-between border-b pb-4"><span className="text-gray-500">DA on Pension ({result.daRate}%)</span><span className="text-gray-900">₹ {Math.round(result.daOnPension).toLocaleString('en-IN')}</span></div>
                                        
                                        <div className="flex justify-between items-center pt-2 text-lg">
                                            <span className="font-bold text-gray-800">Net Pension</span>
                                            <span className="font-black text-indigo-700">₹ {Math.round(result.netPension).toLocaleString('en-IN')}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Family Pension */}
                                <Card className="shadow-md border-purple-100 h-full">
                                    <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
                                        <h3 className="font-bold text-purple-900">Family Pension</h3>
                                    </div>
                                    <CardContent className="p-6 space-y-4 text-sm font-medium">
                                        <div className="flex justify-between"><span className="text-gray-500">Basic Family (30%)</span><span className="text-gray-900">₹ {Math.round(result.familyPension).toLocaleString('en-IN')}</span></div>
                                        <div className="flex justify-between border-b pb-4"><span className="text-gray-500">DA on Family ({result.daRate}%)</span><span className="text-gray-900">₹ {Math.round(result.daOnFamilyPension).toLocaleString('en-IN')}</span></div>
                                        
                                        <div className="flex justify-between items-center pt-2 text-lg">
                                            <span className="font-bold text-gray-800">Total Family</span>
                                            <span className="font-black text-purple-700">₹ {Math.round(result.totalFamilyPension).toLocaleString('en-IN')}</span>
                                        </div>
                                    </CardContent>
                                    
                                    <div className="px-6 py-4 mt-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                        <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Lump Sum Benefits</div>
                                        <div className="flex justify-between items-center text-sm font-medium mb-1">
                                            <span className="text-gray-600">Max Gratuity Limits</span>
                                            <span className="text-emerald-700 font-bold">₹ {Math.round(result.gratuity).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span className="text-gray-600">Leave Encash ({result.earnedLeave} Days)</span>
                                            <span className="text-emerald-700 font-bold">₹ {Math.round(result.leaveEncashment).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Download Action */}
                            <div className="flex justify-end pt-4">
                                <PDFDownloadLink 
                                    document={<PensionPDFDocument result={result} />} 
                                    fileName={`Pension-Report-${result.name.replace(/\s+/g, '-')}.pdf`}
                                >
                                    {({ blob, url, loading, error }) => (
                                        <Button 
                                            size="lg"
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                                            disabled={loading}
                                        >
                                            <Download size={20} />
                                            {loading ? 'Compiling PDF...' : 'Download Official Report'}
                                        </Button>
                                    )}
                                </PDFDownloadLink>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
