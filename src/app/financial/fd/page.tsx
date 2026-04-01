"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark, TrendingUp, Info } from "lucide-react";
import { calculateFDLogic, FDResult, FDFormData } from '@/utils/financeCalculations';

export default function FDPage() {
    const [formData, setFormData] = useState<FDFormData>({
        principal: '',
        interestRate: '',
        tenure: '',
        compounding: 'quarterly'
    });

    const [result, setResult] = useState<FDResult | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, compounding: value as any }));
    };

    const calculateFD = (e: React.FormEvent) => {
        e.preventDefault();
        const res = calculateFDLogic(formData);
        setResult(res);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight flex items-center justify-center gap-3">
                        <Landmark size={36} className="text-blue-600" />
                        Fixed Deposit Calculator
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">Calculate maturity amount with compounding interest</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Card */}
                    <Card className="lg:col-span-1 shadow-lg border-blue-100">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                            <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                                <TrendingUp size={20} /> Parameters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={calculateFD} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold">Principal Amount (₹)</Label>
                                    <Input
                                        type="number"
                                        name="principal"
                                        value={formData.principal}
                                        onChange={handleInputChange}
                                        placeholder="Ex: 100000"
                                        required
                                        className="bg-gray-50 focus:ring-blue-500 font-semibold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold">Interest Rate (% p.a.)</Label>
                                    <Input
                                        type="number"
                                        name="interestRate"
                                        value={formData.interestRate}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        placeholder="Ex: 7.5"
                                        required
                                        className="bg-gray-50 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold">Tenure (Years)</Label>
                                    <Input
                                        type="number"
                                        name="tenure"
                                        value={formData.tenure}
                                        onChange={handleInputChange}
                                        step="0.1"
                                        placeholder="Ex: 5"
                                        required
                                        className="bg-gray-50 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold">Compounding Frequency</Label>
                                    <Select value={formData.compounding} onValueChange={handleSelectChange}>
                                        <SelectTrigger className="bg-gray-50">
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                            <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                                            <SelectItem value="annually">Annually</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-12 rounded-xl shadow-lg shadow-blue-500/30">
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
                                    <Card className="bg-white border-blue-100 shadow-md transform transition-all hover:scale-[1.02]">
                                        <CardContent className="p-6">
                                            <div className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-2">Total Interest Earned</div>
                                            <div className="text-4xl font-black text-blue-900">
                                                ₹ {Math.round(result.interestEarned).toLocaleString('en-IN')}
                                            </div>
                                            <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-semibold">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                Effective Return: {((result.interestEarned / result.principal) * 100).toFixed(2)}%
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20 transform transition-all hover:scale-[1.02]">
                                        <CardContent className="p-6">
                                            <div className="text-blue-100 font-bold text-sm uppercase tracking-wider mb-2">Maturity Amount</div>
                                            <div className="text-4xl font-black">
                                                ₹ {Math.round(result.maturityAmount).toLocaleString('en-IN')}
                                            </div>
                                            <div className="mt-4 text-sm text-blue-200 font-medium italic">
                                                Based on {result.compounding} compounding
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b flex items-center gap-2 text-gray-700 font-bold">
                                        <Info size={18} className="text-blue-500" />
                                        Summary Breakdown
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-gray-100">
                                            {[
                                                { label: "Principal Amount", value: `₹ ${result.principal.toLocaleString('en-IN')}` },
                                                { label: "Rate of Interest", value: `${result.interestRate}% p.a.` },
                                                { label: "Lock-in Period", value: `${result.tenure} Years` },
                                                { label: "Compounding", value: result.compounding.charAt(0).toUpperCase() + result.compounding.slice(1) }
                                            ].map((row, i) => (
                                                <div key={i} className="flex justify-between items-center p-4 hover:bg-gray-50/50 transition-colors">
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
