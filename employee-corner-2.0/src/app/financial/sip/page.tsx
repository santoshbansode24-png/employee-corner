"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Coins, TrendingUp } from "lucide-react";
import { calculateSIPLogic, SIPResult } from '@/utils/financeCalculations';

export default function SIPPage() {
    const [formData, setFormData] = useState({
        monthlyInvestment: '',
        expectedReturn: 12,
        timePeriod: '',
        stepUpPercentage: 0
    });

    const [result, setResult] = useState<SIPResult | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateSIP = (e: React.FormEvent) => {
        e.preventDefault();
        const calculatedResult = calculateSIPLogic(formData);
        setResult(calculatedResult);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Section */}
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-4xl font-extrabold text-emerald-900 tracking-tight flex items-center justify-center gap-3">
                        <Coins size={36} className="text-emerald-500" />
                        Systematic Investment Plan
                    </h1>
                    <p className="text-lg text-gray-500 font-medium tracking-tight">Calculate SIP compounding with Annual Step-Ups</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    {/* Input Form */}
                    <Card className="shadow-lg border-emerald-100">
                        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                            <CardTitle className="text-xl text-emerald-900 flex items-center gap-2">
                                <TrendingUp size={20} /> Parameters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={calculateSIP}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold">Monthly Investment (₹)</Label>
                                        <Input
                                            type="number"
                                            name="monthlyInvestment"
                                            value={formData.monthlyInvestment}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 5000"
                                            required
                                            className="bg-gray-50 focus:ring-emerald-500 font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold">Expected Return (%)</Label>
                                        <Input
                                            type="number"
                                            name="expectedReturn"
                                            value={formData.expectedReturn}
                                            onChange={handleInputChange}
                                            step="0.1"
                                            placeholder="Ex: 12"
                                            required
                                            className="bg-gray-50 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold">Time Period (Years)</Label>
                                        <Input
                                            type="number"
                                            name="timePeriod"
                                            value={formData.timePeriod}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 10"
                                            required
                                            className="bg-gray-50 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold">Annual Step-Up (%)</Label>
                                        <Input
                                            type="number"
                                            name="stepUpPercentage"
                                            value={formData.stepUpPercentage}
                                            onChange={handleInputChange}
                                            step="0.1"
                                            placeholder="0"
                                            className="bg-gray-50 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg h-14 rounded-xl shadow-lg shadow-emerald-500/30">
                                    Calculate Projected Growth
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Results Section */}
                    {result && (
                        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                            {/* Dashboard Tiles */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b text-gray-500 font-semibold text-sm">Total Invested</div>
                                    <div className="p-6 text-3xl font-bold text-gray-900">
                                        ₹ {Math.round(result.totalInvested).toLocaleString('en-IN')}
                                    </div>
                                </Card>
                                <Card className="bg-emerald-50 border-emerald-100 shadow-sm overflow-hidden text-emerald-900 border-2">
                                    <div className="p-4 bg-emerald-100/50 border-b border-emerald-200 font-semibold text-sm text-emerald-800">Total Est. Returns</div>
                                    <div className="p-6 text-3xl font-bold text-emerald-600">
                                        ₹ {Math.round(result.totalReturns).toLocaleString('en-IN')}
                                    </div>
                                </Card>
                                <Card className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/20 overflow-hidden">
                                    <div className="p-4 border-b border-teal-400/30 font-semibold text-sm text-teal-50">Projected Final Value</div>
                                    <div className="p-6 text-4xl font-extrabold tracing-tight">
                                        ₹ {Math.round(result.finalValue).toLocaleString('en-IN')}
                                    </div>
                                </Card>
                            </div>

                            {/* Data Table */}
                            <Card className="shadow-lg border-gray-100">
                                <CardHeader className="bg-gray-50 border-b pb-4">
                                    <CardTitle className="text-lg">Growth Schedule</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Tabs defaultValue="yearly" className="w-full">
                                        <div className="p-4 border-b">
                                            <TabsList className="bg-gray-100">
                                                <TabsTrigger value="yearly" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">Yearly View</TabsTrigger>
                                                <TabsTrigger value="monthly" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">Monthly View</TabsTrigger>
                                            </TabsList>
                                        </div>

                                        <TabsContent value="yearly" className="m-0 p-0">
                                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 border-b">
                                                        <tr>
                                                            <th className="px-6 py-4 font-bold">Year</th>
                                                            <th className="px-6 py-4 font-bold">Total Invested</th>
                                                            <th className="px-6 py-4 font-bold">Projected Returns</th>
                                                            <th className="px-6 py-4 font-bold text-right text-emerald-700">Accumulated Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {result.yearlyData.map((row, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-3 font-medium text-gray-900">Year {row.year}</td>
                                                                <td className="px-6 py-3 text-gray-600">₹ {Math.round(row.totalInvested).toLocaleString('en-IN')}</td>
                                                                <td className="px-6 py-3 text-emerald-600 font-medium">+ ₹ {Math.round(row.returns).toLocaleString('en-IN')}</td>
                                                                <td className="px-6 py-3 text-right font-bold text-gray-900">₹ {Math.round(row.currentValue).toLocaleString('en-IN')}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="monthly" className="m-0 p-0">
                                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 border-b">
                                                        <tr>
                                                            <th className="px-6 py-4 font-bold">Month</th>
                                                            <th className="px-6 py-4 font-bold">P.A. (Inv)</th>
                                                            <th className="px-6 py-4 font-bold">Total Invested</th>
                                                            <th className="px-6 py-4 font-bold">Projected Returns</th>
                                                            <th className="px-6 py-4 font-bold text-right text-emerald-700">Accumulated Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {result.monthlyData.map((row, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-3 font-medium text-gray-900">Mo {row.month} • Yr {row.year}</td>
                                                                <td className="px-6 py-3 text-gray-400">₹ {Math.round(row.investment || 0).toLocaleString('en-IN')}</td>
                                                                <td className="px-6 py-3 text-gray-600">₹ {Math.round(row.totalInvested).toLocaleString('en-IN')}</td>
                                                                <td className="px-6 py-3 text-emerald-600 font-medium">+ ₹ {Math.round(row.returns).toLocaleString('en-IN')}</td>
                                                                <td className="px-6 py-3 text-right font-bold text-gray-900">₹ {Math.round(row.currentValue).toLocaleString('en-IN')}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
