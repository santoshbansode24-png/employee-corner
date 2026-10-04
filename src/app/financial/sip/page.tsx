"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Coins, TrendingUp, Sparkles, PieChart, ArrowUpRight } from "lucide-react";
import { calculateSIPLogic, SIPResult } from '@/utils/financeCalculations';

export default function SIPPage() {
    const [formData, setFormData] = useState({
        monthlyInvestment: '10000',
        expectedReturn: 12,
        timePeriod: '15',
        stepUpPercentage: 10
    });

    const [result, setResult] = useState<SIPResult | null>(() => {
        return calculateSIPLogic({
            monthlyInvestment: '10000',
            expectedReturn: 12,
            timePeriod: '15',
            stepUpPercentage: 10
        });
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateSIP = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const calculatedResult = calculateSIPLogic(formData);
        setResult(calculatedResult);
    };

    const applyPreset = (monthly: string, ret: number, years: string, step: number) => {
        const next = { monthlyInvestment: monthly, expectedReturn: ret, timePeriod: years, stepUpPercentage: step };
        setFormData(next);
        setResult(calculateSIPLogic(next));
    };

    const investedPct = result && result.finalValue > 0 ? (result.totalInvested / result.finalValue) * 100 : 0;
    const returnsPct = result && result.finalValue > 0 ? (result.totalReturns / result.finalValue) * 100 : 0;
    const wealthMultiplier = result && result.totalInvested > 0 ? (result.finalValue / result.totalInvested).toFixed(1) : '0';

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-gray-200">
                    <div className="text-center sm:text-left space-y-1">
                        <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight flex items-center justify-center sm:justify-start gap-3">
                            <Coins size={32} className="text-emerald-600" />
                            Systematic Investment Plan (SIP)
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Wealth Creation Planner with Compound Interest & Annual Step-Ups</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => applyPreset('5000', 12, '10', 0)}
                            className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        >
                            Starter (₹5k, 10y)
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => applyPreset('15000', 12, '20', 10)}
                            className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        >
                            <Sparkles size={13} className="text-amber-500 mr-1" /> Retirement (₹15k, 20y)
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    {/* Input Form */}
                    <Card className="shadow-lg border-emerald-100">
                        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 py-4">
                            <CardTitle className="text-lg text-emerald-900 flex items-center gap-2 font-bold">
                                <TrendingUp size={20} className="text-emerald-600" /> Investment Parameters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={calculateSIP}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold text-sm">Monthly Investment (₹)</Label>
                                        <Input
                                            type="number"
                                            name="monthlyInvestment"
                                            value={formData.monthlyInvestment}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 10000"
                                            required
                                            className="bg-gray-50 focus:ring-emerald-500 font-semibold text-base"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold text-sm">Expected Return (% p.a.)</Label>
                                        <Input
                                            type="number"
                                            name="expectedReturn"
                                            value={formData.expectedReturn}
                                            onChange={handleInputChange}
                                            step="0.1"
                                            placeholder="Ex: 12"
                                            required
                                            className="bg-gray-50 focus:ring-emerald-500 text-base"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold text-sm">Time Horizon (Years)</Label>
                                        <Input
                                            type="number"
                                            name="timePeriod"
                                            value={formData.timePeriod}
                                            onChange={handleInputChange}
                                            placeholder="Ex: 15"
                                            required
                                            className="bg-gray-50 focus:ring-emerald-500 text-base"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-semibold text-sm">Annual Step-Up (% / Yr)</Label>
                                        <Input
                                            type="number"
                                            name="stepUpPercentage"
                                            value={formData.stepUpPercentage}
                                            onChange={handleInputChange}
                                            step="0.5"
                                            placeholder="0"
                                            className="bg-gray-50 focus:ring-emerald-500 text-base"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base h-12 rounded-xl shadow-lg shadow-emerald-500/20">
                                    Calculate Projected Growth
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Results Section */}
                    {result && (
                        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                            {/* Dashboard Tiles */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="bg-white border-gray-200 shadow-sm p-5 flex flex-col justify-center">
                                    <div className="text-gray-500 font-bold text-xs uppercase tracking-wide">Total Principal Invested</div>
                                    <div className="text-2xl font-black text-gray-900 mt-1">
                                        ₹ {Math.round(result.totalInvested).toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">{investedPct.toFixed(1)}% of total corpus</div>
                                </Card>

                                <Card className="bg-emerald-50/60 border-emerald-200 shadow-sm p-5 flex flex-col justify-center">
                                    <div className="text-emerald-700 font-bold text-xs uppercase tracking-wide">Est. Wealth Gain</div>
                                    <div className="text-2xl font-black text-emerald-700 mt-1">
                                        ₹ {Math.round(result.totalReturns).toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-emerald-600 font-medium mt-1">{returnsPct.toFixed(1)}% compound profit</div>
                                </Card>

                                <Card className="bg-amber-50/60 border-amber-200 shadow-sm p-5 flex flex-col justify-center">
                                    <div className="text-amber-800 font-bold text-xs uppercase tracking-wide">Wealth Multiplier</div>
                                    <div className="text-3xl font-black text-amber-700 mt-1 flex items-center gap-1">
                                        {wealthMultiplier}x <ArrowUpRight size={22} className="text-amber-600" />
                                    </div>
                                    <div className="text-xs text-amber-700 font-medium mt-1">Returns on invested capital</div>
                                </Card>

                                <Card className="bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 text-white shadow-xl p-5 flex flex-col justify-center rounded-xl">
                                    <div className="text-teal-100 font-bold text-xs uppercase tracking-wide">Projected Maturity Corpus</div>
                                    <div className="text-3xl font-black mt-1">
                                        ₹ {Math.round(result.finalValue).toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-emerald-100 mt-1">At {formData.expectedReturn}% annual return</div>
                                </Card>
                            </div>

                            {/* Proportion Visual Bar */}
                            <Card className="p-4 bg-white border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-2">
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span> Principal Invested: ₹ {Math.round(result.totalInvested).toLocaleString('en-IN')} ({investedPct.toFixed(1)}%)</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Estimated Profit: ₹ {Math.round(result.totalReturns).toLocaleString('en-IN')} ({returnsPct.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden flex">
                                    <div style={{ width: `${investedPct}%` }} className="bg-slate-400 h-full transition-all duration-500"></div>
                                    <div style={{ width: `${returnsPct}%` }} className="bg-emerald-500 h-full transition-all duration-500"></div>
                                </div>
                            </Card>

                            {/* Data Table */}
                            <Card className="shadow-lg border-gray-100">
                                <CardHeader className="bg-gray-50 border-b py-3 px-6">
                                    <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                                        <PieChart size={18} className="text-emerald-600" /> Year-by-Year Wealth Accumulation Schedule
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Tabs defaultValue="yearly" className="w-full">
                                        <div className="px-6 py-3 border-b bg-gray-50/50">
                                            <TabsList className="bg-gray-200">
                                                <TabsTrigger value="yearly" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm font-semibold">Yearly View</TabsTrigger>
                                                <TabsTrigger value="monthly" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm font-semibold">Monthly Breakdown</TabsTrigger>
                                            </TabsList>
                                        </div>

                                        <TabsContent value="yearly" className="m-0 p-0">
                                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-xs text-gray-500 uppercase bg-gray-100 sticky top-0 z-10 border-b">
                                                        <tr>
                                                            <th className="px-6 py-3.5 font-bold">End of Year</th>
                                                            <th className="px-6 py-3.5 font-bold">Cumulative Invested</th>
                                                            <th className="px-6 py-3.5 font-bold">Estimated Returns</th>
                                                            <th className="px-6 py-3.5 font-bold text-right text-emerald-800">Total Portfolio Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {result.yearlyData.map((row, idx) => (
                                                            <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                                                                <td className="px-6 py-3 font-bold text-gray-900">Year {row.year}</td>
                                                                <td className="px-6 py-3 text-gray-600">₹ {Math.round(row.totalInvested).toLocaleString('en-IN')}</td>
                                                                <td className="px-6 py-3 text-emerald-600 font-semibold">+ ₹ {Math.round(row.returns).toLocaleString('en-IN')}</td>
                                                                <td className="px-6 py-3 text-right font-black text-emerald-950">₹ {Math.round(row.currentValue).toLocaleString('en-IN')}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="monthly" className="m-0 p-0">
                                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-xs text-gray-500 uppercase bg-gray-100 sticky top-0 z-10 border-b">
                                                        <tr>
                                                            <th className="px-6 py-3.5 font-bold">Month</th>
                                                            <th className="px-6 py-3.5 font-bold">Monthly Installment</th>
                                                            <th className="px-6 py-3.5 font-bold">Total Invested</th>
                                                            <th className="px-6 py-3.5 font-bold">Accumulated Returns</th>
                                                            <th className="px-6 py-3.5 font-bold text-right text-emerald-800">Total Portfolio Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {result.monthlyData.map((row, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-2.5 font-semibold text-gray-900">M {row.month} (Yr {row.year})</td>
                                                                <td className="px-6 py-2.5 text-gray-500">₹ {Math.round(row.investment || 0).toLocaleString('en-IN')}</td>
                                                                <td className="px-6 py-2.5 text-gray-600">₹ {Math.round(row.totalInvested).toLocaleString('en-IN')}</td>
                                                                <td className="px-6 py-2.5 text-emerald-600 font-medium">+ ₹ {Math.round(row.returns).toLocaleString('en-IN')}</td>
                                                                <td className="px-6 py-2.5 text-right font-bold text-gray-900">₹ {Math.round(row.currentValue).toLocaleString('en-IN')}</td>
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
