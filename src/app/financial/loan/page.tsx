"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building, Percent, Calendar, Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { calculateEMILogic, calculateLoanEligibility, EMIResult, EligibilityResult } from '@/utils/financeCalculations';

export default function LoanPage() {
    // EMI State
    const [emiInput, setEmiInput] = useState({ principal: '', rate: '', tenure: '' });
    const [emiResult, setEmiResult] = useState<EMIResult | null>(null);

    // Eligibility State
    const [eligInput, setEligInput] = useState({ income: '', existingEMI: '', rate: '', tenure: '' });
    const [eligResult, setEligResult] = useState<EligibilityResult | null>(null);

    const handleEMIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmiInput({ ...emiInput, [e.target.name]: e.target.value });
    };

    const handleEligChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEligInput({ ...eligInput, [e.target.name]: e.target.value });
    };

    const runEMI = (e: React.FormEvent) => {
        e.preventDefault();
        const res = calculateEMILogic(
            parseFloat(emiInput.principal) || 0,
            parseFloat(emiInput.rate) || 0,
            parseFloat(emiInput.tenure) || 0
        );
        setEmiResult(res);
    };

    const runElig = (e: React.FormEvent) => {
        e.preventDefault();
        const res = calculateLoanEligibility(
            parseFloat(eligInput.income) || 0,
            parseFloat(eligInput.existingEMI) || 0,
            parseFloat(eligInput.rate) || 0,
            parseFloat(eligInput.tenure) || 0
        );
        setEligResult(res);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-3">
                        <Building size={36} className="text-blue-600" />
                        Loan Management System
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">Calculate EMI & Check Maximum Eligibility</p>
                </div>

                <Tabs defaultValue="emi" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="bg-white p-1 shadow-sm border border-gray-100 rounded-xl">
                            <TabsTrigger value="emi" className="px-8 py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">EMI Calculator</TabsTrigger>
                            <TabsTrigger value="eligibility" className="px-8 py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">Loan Eligibility</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* EMI Content */}
                    <TabsContent value="emi" className="m-0 space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-1 shadow-lg border-blue-50">
                                <CardHeader className="bg-blue-50 font-bold border-b border-blue-100">EMI Calculation</CardHeader>
                                <CardContent className="pt-6">
                                    <form onSubmit={runEMI} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Loan Amount (₹)</Label>
                                            <Input name="principal" type="number" value={emiInput.principal} onChange={handleEMIChange} placeholder="Ex: 500000" className="bg-gray-50" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Interest Rate (% p.a.)</Label>
                                            <Input name="rate" type="number" value={emiInput.rate} onChange={handleEMIChange} step="0.01" placeholder="Ex: 8.5" className="bg-gray-50" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tenure (Years)</Label>
                                            <Input name="tenure" type="number" value={emiInput.tenure} onChange={handleEMIChange} placeholder="Ex: 15" className="bg-gray-50" required />
                                        </div>
                                        <Button type="submit" className="w-full bg-blue-600 h-12 rounded-xl text-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20">Calculate EMI</Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <div className="lg:col-span-2">
                                {emiResult ? (
                                    <div className="animate-in fade-in zoom-in duration-300 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Card className="bg-white p-6 shadow-sm flex flex-col justify-center">
                                                <div className="text-gray-400 text-xs font-bold uppercase mb-1">Monthly EMI</div>
                                                <div className="text-3xl font-black text-blue-800">₹ {Math.round(emiResult.emi).toLocaleString('en-IN')}</div>
                                            </Card>
                                            <Card className="bg-white p-6 shadow-sm flex flex-col justify-center">
                                                <div className="text-gray-400 text-xs font-bold uppercase mb-1">Total Interest</div>
                                                <div className="text-3xl font-black text-red-600">₹ {Math.round(emiResult.totalInterest).toLocaleString('en-IN')}</div>
                                            </Card>
                                            <Card className="bg-blue-600 text-white p-6 shadow-xl flex flex-col justify-center">
                                                <div className="text-blue-100 text-xs font-bold uppercase mb-1">Total Payment</div>
                                                <div className="text-3xl font-black">₹ {Math.round(emiResult.totalPayment).toLocaleString('en-IN')}</div>
                                            </Card>
                                        </div>

                                        <Card className="border-gray-200 shadow-sm overflow-hidden">
                                            <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">First Year Schedule</div>
                                            <CardContent className="p-0 overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-white border-b text-gray-400 uppercase text-[10px] font-black">
                                                        <tr>
                                                            <th className="px-6 py-4">Month</th>
                                                            <th className="px-6 py-4">Principal (₹)</th>
                                                            <th className="px-6 py-4">Interest (₹)</th>
                                                            <th className="px-6 py-4 text-right">Balance (₹)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {emiResult.schedule.slice(0, 12).map((row) => (
                                                            <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-6 py-3 font-bold text-gray-900">M {row.month}</td>
                                                                <td className="px-6 py-3 text-gray-600">₹ {Math.round(row.principal).toLocaleString('en-IN')}</td>
                                                                <td className="px-6 py-3 text-red-500 font-medium">+ ₹ {Math.round(row.interest).toLocaleString('en-IN')}</td>
                                                                <td className="px-6 py-3 text-right font-bold text-gray-900">₹ {Math.round(row.balance).toLocaleString('en-IN')}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
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
                                <CardHeader className="bg-emerald-50 font-bold border-b border-emerald-100">Eligibility Criteria</CardHeader>
                                <CardContent className="pt-6">
                                    <form onSubmit={runElig} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Monthly Income (₹)</Label>
                                            <Input name="income" type="number" value={eligInput.income} onChange={handleEligChange} placeholder="Ex: 80000" className="bg-gray-50" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Existing EMI (₹)</Label>
                                            <Input name="existingEMI" type="number" value={eligInput.existingEMI} onChange={handleEligChange} placeholder="0" className="bg-gray-50" />
                                        </div>
                                        <div className="space-y-2 text-xs text-gray-400 -mt-2">Existing loan payments reduce your capacity</div>
                                        <div className="space-y-2">
                                            <Label>Expected Interest Rate (%)</Label>
                                            <Input name="rate" type="number" value={eligInput.rate} onChange={handleEligChange} step="0.01" placeholder="Ex: 8.5" className="bg-gray-50" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Desired Tenure (Years)</Label>
                                            <Input name="tenure" type="number" value={eligInput.tenure} onChange={handleEligChange} placeholder="Ex: 15" className="bg-gray-50" required />
                                        </div>
                                        <Button type="submit" className="w-full bg-emerald-600 h-12 rounded-xl text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">Check Status</Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <div className="lg:col-span-2">
                                {eligResult ? (
                                    <div className="animate-in fade-in zoom-in duration-300 space-y-6">
                                        <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-8 rounded-3xl shadow-xl flex items-center justify-between">
                                            <div>
                                                <div className="text-teal-100 font-bold text-xs uppercase tracking-widest mb-1">Max Eligible Loan Amount</div>
                                                <div className="text-5xl font-black italic">₹ {Math.round(eligResult.eligibleLoan).toLocaleString('en-IN')}</div>
                                            </div>
                                            <CheckCircle2 size={64} className="text-teal-200/40" />
                                        </Card>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card className="bg-white p-6 shadow-sm">
                                                <div className="text-gray-400 text-xs font-black mb-2 uppercase">Max Monthly Installment Allowed</div>
                                                <div className="text-2xl font-bold text-gray-900 mb-1">₹ {Math.round(eligResult.maxEMI).toLocaleString('en-IN')}</div>
                                                <div className="text-xs text-gray-400 flex items-center gap-1"><AlertCircle size={12} /> Based on 60% DSR policy</div>
                                            </Card>
                                            <Card className="bg-white p-6 shadow-sm divide-y divide-gray-50">
                                                {[
                                                    { label: "Gross Income", val: eligResult.monthlyIncome },
                                                    { label: "Existing Liability", val: eligResult.existingEMI }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center py-2 text-sm">
                                                        <span className="text-gray-500 font-medium">{item.label}</span>
                                                        <span className="font-bold text-gray-900">₹ {item.val.toLocaleString('en-IN')}</span>
                                                    </div>
                                                ))}
                                            </Card>
                                        </div>

                                        <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg text-sm text-blue-900 font-medium">
                                            The eligibility calculation assumes a Debt Service Ratio (DSR) of 60%. Most PSU and Private banks follow this threshold for salaried employees.
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
