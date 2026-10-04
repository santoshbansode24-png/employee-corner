"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark, TrendingUp, Info, Sparkles, ShieldCheck } from "lucide-react";
import { calculateFDLogic, FDResult, FDFormData } from '@/utils/financeCalculations';

export default function FDPage() {
    const [formData, setFormData] = useState<FDFormData>({
        principal: '500000',
        interestRate: '7.5',
        tenure: '5',
        compounding: 'quarterly'
    });

    const [result, setResult] = useState<FDResult | null>(() => {
        return calculateFDLogic({
            principal: '500000',
            interestRate: '7.5',
            tenure: '5',
            compounding: 'quarterly'
        });
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, compounding: value as any }));
    };

    const calculateFD = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const res = calculateFDLogic(formData);
        setResult(res);
    };

    const applyPreset = (p: string, r: string, t: string, comp: 'quarterly' | 'monthly' | 'annually') => {
        const next: FDFormData = { principal: p, interestRate: r, tenure: t, compounding: comp };
        setFormData(next);
        setResult(calculateFDLogic(next));
    };

    // Calculate simple interest for comparison
    const principalNum = Number(formData.principal) || 0;
    const rateNum = Number(formData.interestRate) || 0;
    const tenureNum = Number(formData.tenure) || 0;
    const simpleInterest = (principalNum * rateNum * tenureNum) / 100;
    const compoundingGain = result ? Math.max(0, result.interestEarned - simpleInterest) : 0;

    const principalPct = result && result.maturityAmount > 0 ? (result.principal / result.maturityAmount) * 100 : 0;
    const interestPct = result && result.maturityAmount > 0 ? (result.interestEarned / result.maturityAmount) * 100 : 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-gray-200">
                    <div className="text-center sm:text-left space-y-1">
                        <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight flex items-center justify-center sm:justify-start gap-3">
                            <Landmark size={32} className="text-blue-600" />
                            Fixed Deposit (FD) Calculator
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Bank & Post Office Term Deposit Compounding Projections</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => applyPreset('500000', '7.1', '3', 'quarterly')}
                            className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                        >
                            SBI 3-Yr (7.1%)
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => applyPreset('500000', '7.5', '5', 'quarterly')}
                            className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                        >
                            <Sparkles size={13} className="text-amber-500 mr-1" /> Post Office 5-Yr (7.5%)
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => applyPreset('1000000', '7.6', '5', 'quarterly')}
                            className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                        >
                            Senior Citizen (7.6%)
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Card */}
                    <Card className="lg:col-span-1 shadow-lg border-blue-100">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-4">
                            <CardTitle className="text-lg text-blue-900 flex items-center gap-2 font-bold">
                                <TrendingUp size={20} className="text-blue-600" /> Deposit Parameters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={calculateFD} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold text-sm">Principal Deposit (₹)</Label>
                                    <Input
                                        type="number"
                                        name="principal"
                                        value={formData.principal}
                                        onChange={handleInputChange}
                                        placeholder="Ex: 500000"
                                        required
                                        className="bg-gray-50 focus:ring-blue-500 font-semibold text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold text-sm">Interest Rate (% p.a.)</Label>
                                    <Input
                                        type="number"
                                        name="interestRate"
                                        value={formData.interestRate}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        placeholder="Ex: 7.5"
                                        required
                                        className="bg-gray-50 focus:ring-blue-500 text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold text-sm">Tenure (Years)</Label>
                                    <Input
                                        type="number"
                                        name="tenure"
                                        value={formData.tenure}
                                        onChange={handleInputChange}
                                        step="0.5"
                                        placeholder="Ex: 5"
                                        required
                                        className="bg-gray-50 focus:ring-blue-500 text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold text-sm">Compounding Frequency</Label>
                                    <Select value={formData.compounding} onValueChange={handleSelectChange}>
                                        <SelectTrigger className="bg-gray-50">
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly (Bank Standard)</SelectItem>
                                            <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                                            <SelectItem value="annually">Annually</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base h-12 rounded-xl shadow-lg shadow-blue-500/20">
                                    Calculate Maturity
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Results Card */}
                    <div className="lg:col-span-2 space-y-6">
                        {result ? (
                            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="bg-white border-blue-100 shadow-md">
                                        <CardContent className="p-6">
                                            <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">Total Interest Earned</div>
                                            <div className="text-3xl font-black text-blue-900">
                                                ₹ {Math.round(result.interestEarned).toLocaleString('en-IN')}
                                            </div>
                                            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700 font-bold">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                Effective Overall Return: {((result.interestEarned / result.principal) * 100).toFixed(2)}%
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl shadow-blue-500/20 rounded-xl">
                                        <CardContent className="p-6">
                                            <div className="text-blue-200 font-bold text-xs uppercase tracking-wider mb-2">Maturity Amount</div>
                                            <div className="text-3xl font-black">
                                                ₹ {Math.round(result.maturityAmount).toLocaleString('en-IN')}
                                            </div>
                                            <div className="mt-4 text-xs text-blue-200 font-medium">
                                                Compounded {result.compounding} over {result.tenure} Years
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Proportion bar */}
                                <Card className="p-4 bg-white border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-2">
                                        <span>Principal: ₹ {Math.round(result.principal).toLocaleString('en-IN')} ({principalPct.toFixed(1)}%)</span>
                                        <span className="text-blue-700">Interest Earned: ₹ {Math.round(result.interestEarned).toLocaleString('en-IN')} ({interestPct.toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden flex">
                                        <div style={{ width: `${principalPct}%` }} className="bg-slate-400 h-full"></div>
                                        <div style={{ width: `${interestPct}%` }} className="bg-blue-600 h-full"></div>
                                    </div>
                                </Card>

                                {/* Compounding Benefit Comparison */}
                                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-emerald-900 font-medium">
                                        <ShieldCheck size={20} className="text-emerald-600" />
                                        <span>Compounding Advantage vs Simple Interest:</span>
                                    </div>
                                    <span className="font-extrabold text-emerald-700 text-base">
                                        + ₹ {Math.round(compoundingGain).toLocaleString('en-IN')} extra
                                    </span>
                                </div>

                                <Card className="border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b flex items-center gap-2 text-gray-700 font-bold text-sm">
                                        <Info size={18} className="text-blue-500" />
                                        Deposit Terms Breakdown
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-gray-100 text-sm">
                                            {[
                                                { label: "Principal Invested", value: `₹ ${result.principal.toLocaleString('en-IN')}` },
                                                { label: "Rate of Interest", value: `${result.interestRate}% per annum` },
                                                { label: "Tenure / Lock-in", value: `${result.tenure} Years (${Number(result.tenure) * 12} Months)` },
                                                { label: "Compounding Frequency", value: result.compounding.charAt(0).toUpperCase() + result.compounding.slice(1) },
                                                { label: "Simple Interest Equivalent", value: `₹ ${Math.round(simpleInterest).toLocaleString('en-IN')}` }
                                            ].map((row, i) => (
                                                <div key={i} className="flex justify-between items-center p-3.5 hover:bg-gray-50/50 transition-colors">
                                                    <span className="text-gray-500 font-medium">{row.label}</span>
                                                    <span className="font-bold text-gray-900">{row.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                                <Landmark size={64} className="mb-4 opacity-20" />
                                <p className="text-lg font-medium">Enter investment details to see your maturity projections</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
