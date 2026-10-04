"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Landmark, Download, FileText, Sparkles, ShieldCheck, HeartHandshake, Coins, Clock } from "lucide-react";
import { calculatePensionLogic, PensionResult } from '@/utils/pensionCalculations';
import PensionPDFDocument from '@/components/Pension/PensionPDFDocument';

// Dynamically import PDFDownloadLink to prevent SSR hydration crashes
const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), {
  ssr: false,
  loading: () => (
    <Button disabled className="w-full md:w-auto h-12 bg-indigo-100 text-indigo-700 font-bold rounded-xl">
      Preparing PDF Engine...
    </Button>
  )
});

const formatINR = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    return val.toLocaleString('en-IN');
};

export default function PensionPage() {
    const [formData, setFormData] = useState({
        name: '', 
        dob: '', 
        doj: '', 
        retirementDate: '', 
        retirementAge: '58',
        basicPay: '', 
        earnedLeave: '300', 
        daRate: 60,
    });

    const [result, setResult] = useState<PensionResult | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            
            // Auto-calculate retirement date if DOB or retirementAge changes
            if ((name === 'dob' || name === 'retirementAge') && next.dob) {
                const birthDate = new Date(next.dob);
                if (!isNaN(birthDate.getTime())) {
                    const retAge = parseInt(next.retirementAge) || 58;
                    const birthYear = birthDate.getFullYear();
                    const birthMonth = birthDate.getMonth();
                    
                    // In Maharashtra/Central Govt: Superannuation is on the last day of the month of attaining 58/60.
                    // If born on the 1st of a month, retirement is on the last day of the PREVIOUS month.
                    const isFirstOfMonth = birthDate.getDate() === 1;
                    const retYear = birthYear + retAge;
                    const targetMonth = isFirstOfMonth ? birthMonth : birthMonth + 1;
                    
                    // Last day of targetMonth:
                    const lastDay = new Date(retYear, targetMonth, 0);
                    next.retirementDate = lastDay.toISOString().split('T')[0];
                }
            }

            return next;
        });
    };

    const calculatePension = (e: React.FormEvent) => {
        e.preventDefault();
        const calculatedResult = calculatePensionLogic(formData);
        setResult(calculatedResult);
    };

    const loadSampleData = () => {
        const sample = {
            name: 'Prakash R. Shinde',
            dob: '1966-07-15',
            doj: '1992-08-01',
            retirementDate: '2024-07-31',
            retirementAge: '58',
            basicPay: '78800',
            earnedLeave: '300',
            daRate: 60,
        };
        setFormData(sample);
        const calculatedResult = calculatePensionLogic(sample);
        setResult(calculatedResult);
    };

    const totalLumpSum = result ? (result.cvp || 0) + (result.gratuity || 0) + (result.leaveEncashment || 0) : 0;

    return (
        <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="space-y-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Landmark size={24} />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                                Pension & Retirement Benefits Calculator
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            निवृत्तीवेतन, उपदान (Gratuity) व रजा रोखीकरण हिशोब • Maharashtra Civil Services Pension Rules 1982
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={loadSampleData}
                        variant="outline"
                        className="flex items-center gap-2 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/60 font-semibold rounded-xl text-sm h-11 px-4 cursor-pointer"
                    >
                        <Sparkles size={16} className="text-indigo-600" />
                        Load Sample Pensioner
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Input Form */}
                    <Card className="shadow-lg border-indigo-100 rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border-b border-indigo-100/80 p-5">
                            <CardTitle className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                                <FileText size={20} className="text-indigo-600" />
                                Employee & Retirement Credentials (कर्मचाऱ्याची माहिती)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={calculatePension}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-700">Employee Full Name (कर्मचाऱ्याचे नाव)</Label>
                                        <Input 
                                            type="text" 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleInputChange} 
                                            placeholder="Ex: Ramesh S. Patil" 
                                            required 
                                            className="bg-slate-50 border-slate-200 focus:ring-indigo-500" 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-700">Date of Birth (जन्म तारीख)</Label>
                                        <Input 
                                            type="date" 
                                            name="dob" 
                                            value={formData.dob} 
                                            onChange={handleInputChange} 
                                            required 
                                            className="bg-slate-50 border-slate-200 focus:ring-indigo-500" 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-700">Retirement Age (वय मर्यादा)</Label>
                                        <select 
                                            name="retirementAge" 
                                            value={formData.retirementAge} 
                                            onChange={handleInputChange} 
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="58">58 Years (Class 1 to 3 & Teachers)</option>
                                            <option value="60">60 Years (Class 4 / Judicial Officers)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-700">Date of Joining (प्रथम नियुक्ती तारीख)</Label>
                                        <Input 
                                            type="date" 
                                            name="doj" 
                                            value={formData.doj} 
                                            onChange={handleInputChange} 
                                            required 
                                            className="bg-slate-50 border-slate-200 focus:ring-indigo-500" 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-700">Retirement Date (सेवानिवृत्ती दिनांक)</Label>
                                        <Input 
                                            type="date" 
                                            name="retirementDate" 
                                            value={formData.retirementDate} 
                                            onChange={handleInputChange} 
                                            required 
                                            className="bg-slate-50 border-slate-200 focus:ring-indigo-500 font-semibold text-indigo-900" 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-700">Last Basic Pay (अंतिम मूळ वेतन ₹)</Label>
                                        <Input 
                                            type="number" 
                                            name="basicPay" 
                                            value={formData.basicPay} 
                                            onChange={handleInputChange} 
                                            placeholder="Ex: 78800" 
                                            required 
                                            className="bg-slate-50 border-slate-200 focus:ring-indigo-500 font-semibold" 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-700">Earned Leave Balance (शिल्लक अर्जित रजा दिवस, कमाल ३००)</Label>
                                        <Input 
                                            type="number" 
                                            name="earnedLeave" 
                                            value={formData.earnedLeave} 
                                            onChange={handleInputChange} 
                                            placeholder="Ex: 300" 
                                            max={300}
                                            required 
                                            className="bg-slate-50 border-slate-200 focus:ring-indigo-500" 
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label className="text-xs font-semibold text-slate-700">Current Dearness Relief / DA Rate (महागाई भत्ता %)</Label>
                                        <Input 
                                            type="number" 
                                            name="daRate" 
                                            value={formData.daRate} 
                                            onChange={handleInputChange} 
                                            step="0.01" 
                                            required 
                                            className="bg-slate-50 border-slate-200 focus:ring-indigo-500" 
                                        />
                                    </div>
                                </div>
                                <Button 
                                    type="submit" 
                                    size="lg" 
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg h-14 rounded-2xl shadow-xl shadow-indigo-500/25 transition-all cursor-pointer"
                                >
                                    Calculate Complete Pension & Gratuity Statement
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Results Presentation */}
                    {result && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            
                            {/* Service Profile Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 font-semibold uppercase block">Qualifying Service (अहर्ताकारी सेवा)</span>
                                        <span className="text-lg font-black text-indigo-700">
                                            {result.serviceLength.years} yrs, {result.serviceLength.months} mos
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Coins size={20} />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 font-semibold uppercase block">Last Basic Pay</span>
                                        <span className="text-lg font-black text-emerald-700">
                                            ₹ {formatINR(result.basicPay)}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <HeartHandshake size={20} />
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-400 font-semibold uppercase block">Pensioner Name</span>
                                        <span className="text-lg font-black text-slate-800 truncate block max-w-[200px]">
                                            {result.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Highlight Cards: Monthly vs Lump Sum */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-md shadow-indigo-600/20">
                                    <CardContent className="p-5">
                                        <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider block">Net Monthly Pension</span>
                                        <span className="text-2xl sm:text-3xl font-black mt-1 block">₹ {formatINR(result.netPension)}</span>
                                        <p className="text-[11px] text-indigo-200 mt-1">Disbursable Monthly into Bank</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-blue-100 shadow-sm rounded-2xl">
                                    <CardContent className="p-5">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Commuted Value (CVP)</span>
                                        <span className="text-2xl sm:text-3xl font-black text-blue-700 mt-1 block">₹ {formatINR(result.cvp)}</span>
                                        <p className="text-[11px] text-blue-600 mt-1">40% Commutation @ Factor {result.cvpRate}</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-emerald-100 shadow-sm rounded-2xl">
                                    <CardContent className="p-5">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Retirement Gratuity (DCRG)</span>
                                        <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 block">₹ {formatINR(result.gratuity)}</span>
                                        <p className="text-[11px] text-emerald-600 mt-1">Max Ceiling ₹25 Lakhs</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white border-purple-100 shadow-sm rounded-2xl">
                                    <CardContent className="p-5">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Leave Encashment</span>
                                        <span className="text-2xl sm:text-3xl font-black text-purple-700 mt-1 block">₹ {formatINR(result.leaveEncashment)}</span>
                                        <p className="text-[11px] text-purple-600 mt-1">{result.earnedLeave} Days Earned Leave</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Total Lump Sum Inflow Highlight Banner */}
                            <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl text-white shadow-xl shadow-emerald-600/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="space-y-1 text-center sm:text-left">
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">
                                        TOTAL RETIREMENT INFLOW (निवृत्ती समयी मिळणारी एकूण एकरकमी रक्कम)
                                    </span>
                                    <p className="text-sm text-emerald-50 font-medium">
                                        Sum of Commutation (CVP) + Gratuity (DCRG) + Leave Encashment
                                    </p>
                                </div>
                                <span className="text-3xl sm:text-4xl font-black tracking-tight whitespace-nowrap">
                                    ₹ {formatINR(totalLumpSum)}
                                </span>
                            </div>

                            {/* Detailed Two-Column Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Self Pension Breakdown */}
                                <Card className="shadow-sm border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                                    <div className="bg-indigo-50/80 px-6 py-4 border-b border-indigo-100">
                                        <h3 className="font-bold text-indigo-900 text-base">Monthly Pension Calculation (स्वतःचे निवृत्तीवेतन)</h3>
                                    </div>
                                    <CardContent className="p-6 space-y-3.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Basic Pension (50% of Last Basic Pay):</span>
                                            <span className="font-bold text-slate-900">₹ {formatINR(result.basicPension)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Commuted Portion (40% of Basic):</span>
                                            <span className="font-semibold text-slate-700">₹ {formatINR(result.commutedPension)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Commutation Capital (CVP @ Factor {result.cvpRate}):</span>
                                            <span className="font-bold text-blue-700">₹ {formatINR(result.cvp)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Reduced / Residual Pension:</span>
                                            <span className="font-semibold text-slate-900">₹ {formatINR(result.reducedPension)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-3">
                                            <span className="text-slate-600">Dearness Relief ({result.daRate}% on Basic):</span>
                                            <span className="font-semibold text-slate-900">₹ {formatINR(result.daOnPension)}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center pt-1 text-base">
                                            <span className="font-extrabold text-slate-800">Net Monthly Pension:</span>
                                            <span className="font-black text-indigo-700 text-lg">₹ {formatINR(result.netPension)}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Family Pension & Terminal Benefits */}
                                <Card className="shadow-sm border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                                    <div className="bg-purple-50/80 px-6 py-4 border-b border-purple-100">
                                        <h3 className="font-bold text-purple-900 text-base">Family Pension & DCRG (कुटुंब पेन्शन व उपदान)</h3>
                                    </div>
                                    <CardContent className="p-6 space-y-3.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Basic Family Pension (30% of Last Pay):</span>
                                            <span className="font-bold text-slate-900">₹ {formatINR(result.familyPension)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Dearness Relief on Family ({result.daRate}%):</span>
                                            <span className="font-semibold text-slate-700">₹ {formatINR(result.daOnFamilyPension)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-3">
                                            <span className="font-bold text-purple-900">Total Monthly Family Pension:</span>
                                            <span className="font-black text-purple-700">₹ {formatINR(result.totalFamilyPension)}</span>
                                        </div>

                                        <div className="pt-1 space-y-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">One-time Terminal Grants:</span>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-600">Retirement Gratuity (DCRG):</span>
                                                <span className="font-bold text-emerald-700">₹ {formatINR(result.gratuity)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-600">Leave Salary ({result.earnedLeave} Days):</span>
                                                <span className="font-bold text-emerald-700">₹ {formatINR(result.leaveEncashment)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* PDF Download Button */}
                            <div className="flex justify-center p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
                                <PDFDownloadLink 
                                    document={<PensionPDFDocument result={result} />} 
                                    fileName={`Pension-Statement-${(result.name || 'Pensioner').replace(/\s+/g, '_')}.pdf`}
                                >
                                    {({ loading }) => (
                                        <Button 
                                            size="lg"
                                            className="w-full sm:w-96 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                                            disabled={loading}
                                        >
                                            <Download size={20} />
                                            {loading ? 'Building PDF Document...' : 'Download Official Pension PDF Statement'}
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
