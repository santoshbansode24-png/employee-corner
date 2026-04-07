"use client";

import React, { useState } from 'react';
import { CITIES, calculatePayslipLogic } from '@/utils/payslipCalculations';
import PayslipResults from '@/components/Payslip/PayslipResults';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

export default function PayslipPage() {
    const [formData, setFormData] = useState({
        employeeType: 'GPF', basicSalary: '', payScale: 'S-7 to S-19', daRate: 58, city: '',
        cityCategory: 'X', isHandicap: false, employeeClass: '1', perTA: 0,
        gpfSubscription: 0, gpfRecovery: 0, festivalAdvance: 0, otherAdvances: 0,
        otherRecovery: 0, incomeTax: 0,
    });

    const [additionalAllowances, setAdditionalAllowances] = useState<any[]>([]);
    const [result, setResult] = useState<any>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

        if (name === 'city' && CITIES[value]) {
            setFormData(prev => ({ ...prev, city: value, cityCategory: CITIES[value].category }));
        }
    };

    const addAllowance = () => setAdditionalAllowances([...additionalAllowances, { type: 'NPA', amount: 0 }]);
    const updateAllowance = (index: number, field: string, value: any) => {
        const updated = [...additionalAllowances];
        updated[index][field] = value;
        setAdditionalAllowances(updated);
    };
    const removeAllowance = (index: number) => setAdditionalAllowances(additionalAllowances.filter((_, i) => i !== index));

    const calculatePayslip = () => {
        const generatedResult = calculatePayslipLogic(formData, additionalAllowances);
        setResult(generatedResult);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight flex items-center justify-center gap-3">
                        <Calculator size={36} className="text-blue-600" />
                        Payslip Calculator
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">Generate Native Next.js PDF Payslips</p>
                </div>

                <Card className="shadow-xl border-blue-100">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <CardTitle className="text-xl text-blue-900">Employee Data Input</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={(e) => { e.preventDefault(); calculatePayslip(); }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                
                                <div className="space-y-2">
                                    <Label className="text-gray-600 font-semibold">Employee Type</Label>
                                    <select name="employeeType" value={formData.employeeType} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                        <option value="GPF">GPF</option>
                                        <option value="NPS">NPS</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-600 font-semibold">Basic Salary (₹)</Label>
                                    <Input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleInputChange} placeholder="Enter basic salary" required className="bg-gray-50 focus:ring-blue-500" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-600 font-semibold">DA Rate (%)</Label>
                                    <Input type="number" name="daRate" value={formData.daRate} onChange={handleInputChange} step="0.01" required className="bg-gray-50 focus:ring-blue-500" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-600 font-semibold">Pay Scale / Grade</Label>
                                    <select name="payScale" value={formData.payScale} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                        <option value="S-1 to S-6">S-1 to S-6 (Lower Grade)</option>
                                        <option value="S-7 to S-19">S-7 to S-19 (Middle Grade)</option>
                                        <option value="S-20 to S-23">S-20 to S-23 (Higher Grade)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-600 font-semibold">City</Label>
                                    <select name="city" value={formData.city} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                        <option value="">Select City</option>
                                        {Object.keys(CITIES).map(city => <option key={city} value={city}>{city}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-600 font-semibold">City Category (Auto)</Label>
                                    <Input type="text" name="cityCategory" value={formData.cityCategory} disabled className="bg-gray-100 cursor-not-allowed" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-600 font-semibold">Employee Class</Label>
                                    <select name="employeeClass" value={formData.employeeClass} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                        <option value="1">Class 1</option>
                                        <option value="2">Class 2</option>
                                        <option value="3">Class 3</option>
                                        <option value="4">Class 4</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-600 font-semibold">Per TA (₹)</Label>
                                    <Input type="number" name="perTA" value={formData.perTA} onChange={handleInputChange} placeholder="0" className="bg-gray-50 focus:ring-blue-500" />
                                </div>

                                <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 p-2 rounded-md h-10">
                                    <input type="checkbox" name="isHandicap" checked={formData.isHandicap} onChange={handleInputChange} id="handicap" className="w-4 h-4 text-blue-600 rounded" />
                                    <label htmlFor="handicap" className="text-sm font-semibold text-gray-700 cursor-pointer">Handicap Status</label>
                                </div>
                            </div>

                            {/* Additional Allowances */}
                            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-blue-900">Additional Allowances</h3>
                                    <Button type="button" onClick={addAllowance} variant="outline" size="sm" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-100">+ Add</Button>
                                </div>

                                {additionalAllowances.map((allowance, index) => (
                                    <div key={index} className="grid grid-cols-3 gap-4 mb-3 items-center">
                                        <select value={allowance.type} onChange={(e) => updateAllowance(index, 'type', e.target.value)} className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                                            <option value="NPA">NPA (35% of Basic)</option>
                                            <option value="Other">Other Allowance</option>
                                        </select>
                                        <Input type="number" value={allowance.amount} onChange={(e) => updateAllowance(index, 'amount', e.target.value)} placeholder="Amount" disabled={allowance.type === 'NPA'} className="bg-white" />
                                        <Button type="button" onClick={() => removeAllowance(index)} variant="destructive" size="sm">Remove</Button>
                                    </div>
                                ))}
                            </div>

                            {/* Deductions */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-4 text-red-800 border-b border-red-100 pb-2">Deductions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2"><Label>GPF Subscription (₹)</Label><Input type="number" name="gpfSubscription" value={formData.gpfSubscription} onChange={handleInputChange} placeholder="0" className="bg-red-50/30 focus:ring-red-500" /></div>
                                    <div className="space-y-2"><Label>GPF Recovery (₹)</Label><Input type="number" name="gpfRecovery" value={formData.gpfRecovery} onChange={handleInputChange} placeholder="0" className="bg-red-50/30 focus:ring-red-500" /></div>
                                    <div className="space-y-2"><Label>Festival Advance (₹)</Label><Input type="number" name="festivalAdvance" value={formData.festivalAdvance} onChange={handleInputChange} placeholder="0" className="bg-red-50/30 focus:ring-red-500" /></div>
                                    <div className="space-y-2"><Label>Other Advances (₹)</Label><Input type="number" name="otherAdvances" value={formData.otherAdvances} onChange={handleInputChange} placeholder="0" className="bg-red-50/30 focus:ring-red-500" /></div>
                                    <div className="space-y-2"><Label>Other Recovery (₹)</Label><Input type="number" name="otherRecovery" value={formData.otherRecovery} onChange={handleInputChange} placeholder="0" className="bg-red-50/30 focus:ring-red-500" /></div>
                                    <div className="space-y-2"><Label>Income Tax (₹)</Label><Input type="number" name="incomeTax" value={formData.incomeTax} onChange={handleInputChange} placeholder="0" className="bg-red-50/30 focus:ring-red-500" /></div>
                                </div>
                            </div>

                            <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-14 rounded-xl shadow-lg shadow-blue-500/30">
                                Calculate Payslip
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <PayslipResults result={result} />
            </div>
        </div>
    );
}
