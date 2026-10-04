"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building, Percent, Calendar, Wallet, CheckCircle2, AlertCircle, Sparkles, PieChart, Layers } from "lucide-react";
import { calculateEMILogic, calculateLoanEligibility, EMIResult, EligibilityResult } from '@/utils/financeCalculations';

export default function LoanPage() {
    // EMI State
    const [emiInput, setEmiInput] = useState({ principal: '4000000', rate: '8.5', tenure: '20' });
    const [emiResult, setEmiResult] = useState<EMIResult | null>(() => {
        return calculateEMILogic(4000000, 8.5, 20);
    });
    const [scheduleView, setScheduleView] = useState<'yearly' | 'monthly12' | 'all'>('yearly');

    // Eligibility State
    const [eligInput, setEligInput] = useState({ income: '85000', existingEMI: '12000', rate: '8.5', tenure: '20' });
    const [eligResult, setEligResult] = useState<EligibilityResult | null>(() => {
        return calculateLoanEligibility(85000, 12000, 8.5, 20);
    });

    const handleEMIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmiInput({ ...emiInput, [e.target.name]: e.target.value });
    };

    const handleEligChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEligInput({ ...eligInput, [e.target.name]: e.target.value });
    };

    const runEMI = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const res = calculateEMILogic(
            parseFloat(emiInput.principal) || 0,
            parseFloat(emiInput.rate) || 0,
            parseFloat(emiInput.tenure) || 0
        );
        setEmiResult(res);
    };

    const runElig = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const res = calculateLoanEligibility(
            parseFloat(eligInput.income) || 0,
            parseFloat(eligInput.existingEMI) || 0,
            parseFloat(eligInput.rate) || 0,
            parseFloat(eligInput.tenure) || 0
        );
        setEligResult(res);
    };

    const loadEmiPreset = (p: string, r: string, t: string) => {
        const next = { principal: p, rate: r, tenure: t };
        setEmiInput(next);
        setEmiResult(calculateEMILogic(parseFloat(p), parseFloat(r), parseFloat(t)));
    };

    const loadEligPreset = (inc: string, ex: string, r: string, t: string) => {
        const next = { income: inc, existingEMI: ex, rate: r, tenure: t };
        setEligInput(next);
        setEligResult(calculateLoanEligibility(parseFloat(inc), parseFloat(ex), parseFloat(r), parseFloat(t)));
    };

    // Calculate Yearly Aggregate Schedule from monthly schedule
    const yearlySchedule = React.useMemo(() => {
        if (!emiResult) return [];
        const map = new Map<number, { year: number; principalPaid: number; interestPaid: number; endingBalance: number }>();
        emiResult.schedule.forEach(row => {
            const yr = Math.ceil(row.month / 12);
            if (!map.has(yr)) {
                map.set(yr, { year: yr, principalPaid: 0, interestPaid: 0, endingBalance: row.balance });
            }
            const cur = map.get(yr)!;
            cur.principalPaid += row.principal;
            cur.interestPaid += row.interest;
            cur.endingBalance = row.balance;
        });
        return Array.from(map.values());
    }, [emiResult]);

    const principalPct = emiResult && emiResult.totalPayment > 0 ? (emiResult.loanAmount / emiResult.totalPayment) * 100 : 0;
    const interestPct = emiResult && emiResult.totalPayment > 0 ? (emiResult.totalInterest / emiResult.totalPayment) * 100 : 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-gray-200">
                    <div className="text-center sm:text-left space-y-1">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-3">
                            <Building size={32} className="text-blue-600" />
                            Loan Management & EMI Calculator
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Home Loan, Vehicle Loan EMI & Maximum Bank Borrowing Eligibility</p>
                    </div>
                </div>

                <Tabs defaultValue="emi" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="bg-white p-1 shadow-sm border border-gray-200 rounded-xl">
                            <TabsTrigger value="emi" className="px-8 py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold">1. EMI Calculator</TabsTrigger>
                            <TabsTrigger value="eligibility" className="px-8 py-2.5 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold">2. Borrowing Eligibility</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* EMI Content */}
                    <TabsContent value="emi" className="m-0 space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-1 shadow-lg border-blue-50">
                                <CardHeader className="bg-blue-50/70 border-b border-blue-100 py-4 flex flex-row items-center justify-between">
                                    <CardTitle className="text-base font-bold text-blue-900">Loan Parameters</CardTitle>
                                    <div className="flex gap-1.5">
                                        <Button variant="ghost" size="sm" onClick={() => loadEmiPreset('4000000', '8.5', '20')} className="h-7 text-xs text-blue-700 hover:bg-blue-100 px-2">
                                            Home Loan
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => loadEmiPreset('800000', '9.0', '7')} className="h-7 text-xs text-blue-700 hover:bg-blue-100 px-2">
                                            Car Loan
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <form onSubmit={runEMI} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-semibold text-sm">Loan Amount (₹)</Label>
                                            <Input name="principal" type="number" value={emiInput.principal} onChange={handleEMIChange} placeholder="Ex: 4000000" className="bg-gray-50 text-base font-semibold" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-semibold text-sm">Interest Rate (% p.a.)</Label>
                                            <Input name="rate" type="number" value={emiInput.rate} onChange={handleEMIChange} step="0.05" placeholder="Ex: 8.5" className="bg-gray-50 text-base" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-semibold text-sm">Tenure (Years)</Label>
                                            <Input name="tenure" type="number" value={emiInput.tenure} onChange={handleEMIChange} placeholder="Ex: 20" className="bg-gray-50 text-base" required />
                                        </div>
                                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl text-base shadow-lg shadow-blue-500/20">
                                            Calculate EMI
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <div className="lg:col-span-2">
                                {emiResult ? (
                                    <div className="animate-in fade-in zoom-in duration-300 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Card className="bg-white p-5 shadow-sm border border-gray-200 flex flex-col justify-center">
                                                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Monthly EMI</div>
                                                <div className="text-3xl font-black text-blue-900">₹ {Math.round(emiResult.emi).toLocaleString('en-IN')}</div>
                                                <div className="text-xs text-gray-400 mt-1">{Number(emiInput.tenure) * 12} monthly installments</div>
                                            </Card>
                                            <Card className="bg-white p-5 shadow-sm border border-rose-100 flex flex-col justify-center">
                                                <div className="text-rose-600 text-xs font-bold uppercase tracking-wider mb-1">Total Interest Paid</div>
                                                <div className="text-3xl font-black text-rose-600">₹ {Math.round(emiResult.totalInterest).toLocaleString('en-IN')}</div>
                                                <div className="text-xs text-rose-500 font-medium mt-1">{interestPct.toFixed(1)}% of total payout</div>
                                            </Card>
                                            <Card className="bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white p-5 shadow-xl flex flex-col justify-center rounded-xl">
                                                <div className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Total Loan Repayment</div>
                                                <div className="text-3xl font-black">₹ {Math.round(emiResult.totalPayment).toLocaleString('en-IN')}</div>
                                                <div className="text-xs text-blue-200 mt-1">Principal + Total Interest</div>
                                            </Card>
                                        </div>

                                        {/* Proportion Bar */}
                                        <Card className="p-4 bg-white border border-gray-200 shadow-sm">
                                            <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-2">
                                                <span>Principal Loan: ₹ {Math.round(emiResult.loanAmount).toLocaleString('en-IN')} ({principalPct.toFixed(1)}%)</span>
                                                <span className="text-rose-600">Interest Payable: ₹ {Math.round(emiResult.totalInterest).toLocaleString('en-IN')} ({interestPct.toFixed(1)}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden flex">
                                                <div style={{ width: `${principalPct}%` }} className="bg-blue-600 h-full"></div>
                                                <div style={{ width: `${interestPct}%` }} className="bg-rose-500 h-full"></div>
                                            </div>
                                        </Card>

                                        {/* Amortization Schedule */}
                                        <Card className="border-gray-200 shadow-sm overflow-hidden">
                                            <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                                    <Layers size={18} className="text-blue-600" /> Repayment Amortization Schedule
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button 
                                                        variant={scheduleView === 'yearly' ? 'default' : 'outline'} 
                                                        size="sm" 
                                                        onClick={() => setScheduleView('yearly')}
                                                        className={`h-7 text-xs ${scheduleView === 'yearly' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                                                    >
                                                        Yearly Summary
                                                    </Button>
                                                    <Button 
                                                        variant={scheduleView === 'monthly12' ? 'default' : 'outline'} 
                                                        size="sm" 
                                                        onClick={() => setScheduleView('monthly12')}
                                                        className={`h-7 text-xs ${scheduleView === 'monthly12' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                                                    >
                                                        First 12 Months
                                                    </Button>
                                                    <Button 
                                                        variant={scheduleView === 'all' ? 'default' : 'outline'} 
                                                        size="sm" 
                                                        onClick={() => setScheduleView('all')}
                                                        className={`h-7 text-xs ${scheduleView === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                                                    >
                                                        All Months
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardContent className="p-0 overflow-x-auto max-h-[400px] overflow-y-auto">
                                                {scheduleView === 'yearly' ? (
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-gray-100 border-b text-gray-600 uppercase text-xs font-bold sticky top-0">
                                                            <tr>
                                                                <th className="px-5 py-3">Year</th>
                                                                <th className="px-5 py-3">Principal Paid</th>
                                                                <th className="px-5 py-3">Interest Paid</th>
                                                                <th className="px-5 py-3 text-right">Ending Balance</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {yearlySchedule.map((row) => (
                                                                <tr key={row.year} className="hover:bg-blue-50/40 transition-colors">
                                                                    <td className="px-5 py-2.5 font-bold text-gray-900">Year {row.year}</td>
                                                                    <td className="px-5 py-2.5 text-blue-700 font-medium">₹ {Math.round(row.principalPaid).toLocaleString('en-IN')}</td>
                                                                    <td className="px-5 py-2.5 text-rose-600 font-medium">+ ₹ {Math.round(row.interestPaid).toLocaleString('en-IN')}</td>
                                                                    <td className="px-5 py-2.5 text-right font-black text-gray-900">₹ {Math.round(row.endingBalance).toLocaleString('en-IN')}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-gray-100 border-b text-gray-600 uppercase text-xs font-bold sticky top-0">
                                                            <tr>
                                                                <th className="px-5 py-3">Month</th>
                                                                <th className="px-5 py-3">EMI (₹)</th>
                                                                <th className="px-5 py-3">Principal (₹)</th>
                                                                <th className="px-5 py-3">Interest (₹)</th>
                                                                <th className="px-5 py-3 text-right">Balance (₹)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {(scheduleView === 'monthly12' ? emiResult.schedule.slice(0, 12) : emiResult.schedule).map((row) => (
                                                                <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="px-5 py-2.5 font-bold text-gray-900">M {row.month}</td>
                                                                    <td className="px-5 py-2.5 text-gray-700 font-medium">₹ {Math.round(row.emi).toLocaleString('en-IN')}</td>
                                                                    <td className="px-5 py-2.5 text-blue-700 font-medium">₹ {Math.round(row.principal).toLocaleString('en-IN')}</td>
                                                                    <td className="px-5 py-2.5 text-rose-500 font-medium">+ ₹ {Math.round(row.interest).toLocaleString('en-IN')}</td>
                                                                    <td className="px-5 py-2.5 text-right font-black text-gray-900">₹ {Math.round(row.balance).toLocaleString('en-IN')}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
                                    <div className="h-full bg-white flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed border-gray-200">
                                        <Wallet size={48} className="text-gray-200 mb-2" />
                                        <p className="text-gray-400 font-medium">Input parameters to see repayment schedule</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Eligibility Content */}
                    <TabsContent value="eligibility" className="m-0 space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-1 shadow-lg border-emerald-50">
                                <CardHeader className="bg-emerald-50/70 font-bold border-b border-emerald-100 py-4 flex flex-row items-center justify-between">
                                    <CardTitle className="text-base text-emerald-950 font-bold">Eligibility Criteria</CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => loadEligPreset('85000', '12000', '8.5', '20')} className="h-7 text-xs text-emerald-700 hover:bg-emerald-100 px-2">
                                        <Sparkles size={12} className="mr-1 text-amber-500" /> Sample Profile
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <form onSubmit={runElig} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-semibold text-sm">Monthly Net Income (₹)</Label>
                                            <Input name="income" type="number" value={eligInput.income} onChange={handleEligChange} placeholder="Ex: 85000" className="bg-gray-50 text-base font-semibold" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-semibold text-sm">Existing Monthly EMIs (₹)</Label>
                                            <Input name="existingEMI" type="number" value={eligInput.existingEMI} onChange={handleEligChange} placeholder="0" className="bg-gray-50 text-base" />
                                            <p className="text-xs text-gray-500">Existing loans reduce your repayment headroom</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-semibold text-sm">Expected Interest Rate (%)</Label>
                                            <Input name="rate" type="number" value={eligInput.rate} onChange={handleEligChange} step="0.05" placeholder="Ex: 8.5" className="bg-gray-50 text-base" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-semibold text-sm">Desired Tenure (Years)</Label>
                                            <Input name="tenure" type="number" value={eligInput.tenure} onChange={handleEligChange} placeholder="Ex: 20" className="bg-gray-50 text-base" required />
                                        </div>
                                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl text-base shadow-lg shadow-emerald-500/20">
                                            Check Borrowing Capacity
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <div className="lg:col-span-2">
                                {eligResult ? (
                                    <div className="animate-in fade-in zoom-in duration-300 space-y-6">
                                        <Card className="bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex items-center justify-between">
                                            <div>
                                                <div className="text-teal-200 font-bold text-xs uppercase tracking-widest mb-1">Max Eligible Loan Sanction</div>
                                                <div className="text-5xl font-black">₹ {Math.round(eligResult.eligibleLoan).toLocaleString('en-IN')}</div>
                                                <div className="text-xs text-teal-200 mt-2 font-medium">At {eligResult.interestRate}% interest for {eligResult.tenure} years tenure</div>
                                            </div>
                                            <CheckCircle2 size={64} className="text-teal-200/30 hidden sm:block" />
                                        </Card>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card className="bg-white p-5 shadow-sm border border-gray-200">
                                                <div className="text-gray-500 text-xs font-bold mb-1 uppercase">Max Monthly Installment Capacity</div>
                                                <div className="text-3xl font-black text-gray-900 mb-1">₹ {Math.round(eligResult.maxEMI).toLocaleString('en-IN')}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-2"><AlertCircle size={13} className="text-emerald-600" /> Based on 60% Debt-Service Ratio (DSR)</div>
                                            </Card>

                                            <Card className="bg-white p-5 shadow-sm border border-gray-200 divide-y divide-gray-100 text-sm">
                                                {[
                                                    { label: "Net Monthly Income", val: eligResult.monthlyIncome },
                                                    { label: "Existing Ongoing EMIs", val: eligResult.existingEMI },
                                                    { label: "Available Disposable Income", val: eligResult.monthlyIncome - eligResult.existingEMI }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center py-2">
                                                        <span className="text-gray-600 font-medium">{item.label}</span>
                                                        <span className="font-bold text-gray-900">₹ {item.val.toLocaleString('en-IN')}</span>
                                                    </div>
                                                ))}
                                            </Card>
                                        </div>

                                        <div className="p-4 bg-blue-50/80 border-l-4 border-blue-500 rounded-lg text-xs text-blue-900 font-medium leading-relaxed">
                                            <strong>Banking Norm Note:</strong> The borrowing eligibility calculation applies the standard 60% Fixed Obligation to Income Ratio (FOIR/DSR) practiced by State Bank of India (SBI) and leading scheduled commercial banks for permanent State Government employees.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full bg-white flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed border-gray-200">
                                        <AlertCircle size={48} className="text-gray-200 mb-2" />
                                        <p className="text-gray-400 font-medium">Select criteria to determine borrowing limits</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
