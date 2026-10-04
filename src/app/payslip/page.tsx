"use client";

import React, { useState } from 'react';
import { CITIES, calculatePayslipLogic } from '@/utils/payslipCalculations';
import { getMaharashtraDARate } from '@/utils/arrearsCalculations';
import PayslipResults from '@/components/Payslip/PayslipResults';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Sparkles, Building2, User, Wallet, ShieldAlert } from "lucide-react";

export default function PayslipPage() {
    const initialMonth = new Date().toISOString().substring(0, 7);
    const [initYear, initMonthNum] = initialMonth.split('-').map(Number);
    const initialDaRate = (initYear && initMonthNum) ? (getMaharashtraDARate(initMonthNum, initYear) || 60) : 60;

    const [formData, setFormData] = useState({
        empName: '',
        designation: '',
        officeName: '',
        pranNo: '',
        month: initialMonth,
        gender: 'Male',
        employeeType: 'NPS', 
        basicSalary: '', 
        payScale: 'S-7 to S-19', 
        daRate: initialDaRate, 
        city: 'Pune',
        cityCategory: 'X', 
        isHandicap: false, 
        isGovtQuarter: false,
        daOnTA: true,
        employeeClass: '2', 
        perTA: 0,
        gpfSubscription: 0, 
        gpfRecovery: 0, 
        festivalAdvance: 0, 
        otherAdvances: 0,
        otherRecovery: 0, 
        incomeTax: 0,
    });

    const [additionalAllowances, setAdditionalAllowances] = useState<any[]>([]);
    const [result, setResult] = useState<any>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => {
            const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
            if (name === 'city' && CITIES[value]) {
                next.cityCategory = CITIES[value].category;
            }
            if (name === 'month' && value) {
                const [y, m] = value.split('-').map(Number);
                if (y && m) {
                    const autoDa = getMaharashtraDARate(m, y);
                    if (autoDa > 0) {
                        next.daRate = autoDa;
                    }
                }
            }
            return next;
        });
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

    const loadSampleData = () => {
        const sample = {
            empName: 'Sanjay V. Kulkarni',
            designation: 'Assistant Section Officer',
            officeName: 'Mantralaya, Mumbai',
            pranNo: '110023456789',
            month: '2026-01',
            gender: 'Male',
            employeeType: 'NPS',
            basicSalary: '58600',
            payScale: 'S-7 to S-19',
            daRate: 60,
            city: 'Mumbai',
            cityCategory: 'X',
            isHandicap: false,
            isGovtQuarter: false,
            daOnTA: true,
            employeeClass: '2',
            perTA: 0,
            gpfSubscription: 0,
            gpfRecovery: 0,
            festivalAdvance: 0,
            otherAdvances: 0,
            otherRecovery: 0,
            incomeTax: 2500,
        };
        setFormData(sample);
        const res = calculatePayslipLogic(sample, []);
        setResult(res);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="space-y-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Calculator size={24} />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                                Payslip Calculator
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            मासिक वेतन पावती • 7th Pay Commission salary calculation with native PDF download
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={loadSampleData}
                        variant="outline"
                        className="flex items-center gap-2 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100/60 font-semibold rounded-xl text-sm h-11 px-4 cursor-pointer"
                    >
                        <Sparkles size={16} className="text-blue-600" />
                        Load Sample Data
                    </Button>
                </div>

                <Card className="shadow-lg border-blue-100/80 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/80 p-5">
                        <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <User size={20} className="text-blue-600" />
                            Employee & Salary Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={(e) => { e.preventDefault(); calculatePayslip(); }} className="space-y-8">
                            
                            {/* Section 1: Employee Metadata */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    1. Personal & Office Details (वैयक्तिक व कार्यालयीन माहिती)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">Employee Name (कर्मचाऱ्याचे नाव)</Label>
                                        <Input 
                                            name="empName" 
                                            value={formData.empName} 
                                            onChange={handleInputChange} 
                                            placeholder="e.g. Ramesh S. Patil" 
                                            className="bg-slate-50 border-slate-200" 
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">Designation (पदनाम)</Label>
                                        <Input 
                                            name="designation" 
                                            value={formData.designation} 
                                            onChange={handleInputChange} 
                                            placeholder="e.g. Assistant Teacher / Clerk" 
                                            className="bg-slate-50 border-slate-200" 
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">Office / School Name (कार्यालय / शाळा)</Label>
                                        <Input 
                                            name="officeName" 
                                            value={formData.officeName} 
                                            onChange={handleInputChange} 
                                            placeholder="e.g. Z.P. School / District Court" 
                                            className="bg-slate-50 border-slate-200" 
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">PRAN / GPF Account No (खाते क्रमांक)</Label>
                                        <Input 
                                            name="pranNo" 
                                            value={formData.pranNo} 
                                            onChange={handleInputChange} 
                                            placeholder="e.g. 110012345678" 
                                            className="bg-slate-50 border-slate-200" 
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">Salary Month (वेतन महिना)</Label>
                                        <Input 
                                            type="month"
                                            name="month" 
                                            value={formData.month} 
                                            onChange={handleInputChange} 
                                            className="bg-slate-50 border-slate-200" 
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">Gender (लिंग - व्यवसाय कर नियमासाठी)</Label>
                                        <select 
                                            name="gender" 
                                            value={formData.gender} 
                                            onChange={handleInputChange} 
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Male">Male (पुरुष)</option>
                                            <option value="Female">Female (महिला - ₹25,000 पर्यंत PT माफी)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Salary Matrix & Allowances */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    2. Basic Pay & Allowances (वेतन व भत्ते)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">Pension Scheme (पेन्शन योजना)</Label>
                                        <select 
                                            name="employeeType" 
                                            value={formData.employeeType} 
                                            onChange={handleInputChange} 
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                            required
                                        >
                                            <option value="NPS">NPS / DCPS (10% Employee + 14% Govt)</option>
                                            <option value="GPF">GPF (Old Pension Scheme)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">Basic Salary (मूळ वेतन ₹)</Label>
                                        <Input 
                                            type="number" 
                                            name="basicSalary" 
                                            value={formData.basicSalary} 
                                            onChange={handleInputChange} 
                                            placeholder="e.g. 56100" 
                                            required 
                                            className="bg-slate-50 border-slate-200 focus:ring-blue-500 text-base font-semibold" 
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">DA Rate (महागाई भत्ता %)</Label>
                                        <Input 
                                            type="number" 
                                            name="daRate" 
                                            value={formData.daRate} 
                                            onChange={handleInputChange} 
                                            step="0.01" 
                                            required 
                                            className="bg-slate-50 border-slate-200 focus:ring-blue-500" 
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">Pay Scale / Level (वेतन स्तर)</Label>
                                        <select 
                                            name="payScale" 
                                            value={formData.payScale} 
                                            onChange={handleInputChange} 
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                            required
                                        >
                                            <option value="S-1 to S-6">S-1 to S-6 (Lower Grade)</option>
                                            <option value="S-7 to S-19">S-7 to S-19 (Middle Grade)</option>
                                            <option value="S-20 to S-23">S-20 to S-23 (Higher Grade)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">Posting Station (शहर / मुख्यालय)</Label>
                                        <select 
                                            name="city" 
                                            value={formData.city} 
                                            onChange={handleInputChange} 
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
                                            required
                                        >
                                            <option value="">Select City / Posting Station</option>
                                            <optgroup label="X Category (Metro — 30% HRA)">
                                                {Object.entries(CITIES).filter(([_, info]) => info.category === 'X').map(([city]) => (
                                                    <option key={city} value={city}>{city} (X - 30%)</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="Y Category (Major Cities — 20% HRA)">
                                                {Object.entries(CITIES).filter(([_, info]) => info.category === 'Y').map(([city]) => (
                                                    <option key={city} value={city}>{city} (Y - 20%)</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="Z Category (Other Cities & Rural — 10% HRA)">
                                                {Object.entries(CITIES).filter(([_, info]) => info.category === 'Z').map(([city]) => (
                                                    <option key={city} value={city}>{city} (Z - 10%)</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">City Classification (HRA Category)</Label>
                                        <Input 
                                            type="text" 
                                            name="cityCategory" 
                                            value={`${formData.cityCategory} Category — HRA: ${
                                                formData.cityCategory === 'X' 
                                                    ? (formData.daRate >= 50 ? '30%' : formData.daRate >= 25 ? '27%' : '24%')
                                                    : formData.cityCategory === 'Y'
                                                    ? (formData.daRate >= 50 ? '20%' : formData.daRate >= 25 ? '18%' : '16%')
                                                    : (formData.daRate >= 50 ? '10%' : formData.daRate >= 25 ? '9%' : '8%')
                                            } (Min ₹${formData.cityCategory === 'X' ? '5,400' : formData.cityCategory === 'Y' ? '3,600' : '1,800'})`} 
                                            disabled 
                                            className="bg-slate-100 cursor-not-allowed font-semibold text-slate-800" 
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">Employee Cadre Class (कर्मचारी वर्ग)</Label>
                                        <select 
                                            name="employeeClass" 
                                            value={formData.employeeClass} 
                                            onChange={handleInputChange} 
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                            required
                                        >
                                            <option value="1">Class 1 (Group A - GIS ₹960)</option>
                                            <option value="2">Class 2 (Group B - GIS ₹480)</option>
                                            <option value="3">Class 3 (Group C - GIS ₹360)</option>
                                            <option value="4">Class 4 (Group D - GIS ₹240)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600">Permanent TA / Special TA (₹)</Label>
                                        <Input 
                                            type="number" 
                                            name="perTA" 
                                            value={formData.perTA} 
                                            onChange={handleInputChange} 
                                            placeholder="0" 
                                            className="bg-slate-50 border-slate-200 focus:ring-blue-500" 
                                        />
                                    </div>
                                </div>

                                {/* Checkbox Options */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                                        <input 
                                            type="checkbox" 
                                            name="isGovtQuarter" 
                                            checked={formData.isGovtQuarter} 
                                            onChange={handleInputChange} 
                                            id="govtQuarter" 
                                            className="w-4 h-4 text-blue-600 rounded cursor-pointer" 
                                        />
                                        <label htmlFor="govtQuarter" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                            Govt Quarters (HRA ₹0)
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                                        <input 
                                            type="checkbox" 
                                            name="daOnTA" 
                                            checked={formData.daOnTA} 
                                            onChange={handleInputChange} 
                                            id="daOnTA" 
                                            className="w-4 h-4 text-blue-600 rounded cursor-pointer" 
                                        />
                                        <label htmlFor="daOnTA" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                            Apply DA on TA (7th CPC)
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                                        <input 
                                            type="checkbox" 
                                            name="isHandicap" 
                                            checked={formData.isHandicap} 
                                            onChange={handleInputChange} 
                                            id="handicap" 
                                            className="w-4 h-4 text-blue-600 rounded cursor-pointer" 
                                        />
                                        <label htmlFor="handicap" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                            Handicap Status (Double TA)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Additional Allowances */}
                            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-900">Additional Allowances (इतर विशेष भत्ते)</h3>
                                        <p className="text-xs text-blue-700/80">E.g., NPA for Medical Officers (20% of Basic), Cash Handling, etc.</p>
                                    </div>
                                    <Button 
                                        type="button" 
                                        onClick={addAllowance} 
                                        variant="outline" 
                                        size="sm" 
                                        className="bg-white border-blue-200 text-blue-700 hover:bg-blue-100 font-semibold cursor-pointer"
                                    >
                                        + Add Allowance
                                    </Button>
                                </div>

                                {additionalAllowances.map((allowance, index) => (
                                    <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                        <select 
                                            value={allowance.type} 
                                            onChange={(e) => updateAllowance(index, 'type', e.target.value)} 
                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs"
                                        >
                                            <option value="NPA">NPA (20% of Basic)</option>
                                            <option value="Special Allowance">Special Allowance</option>
                                            <option value="Tribal Area Allowance">Tribal Area Allowance</option>
                                            <option value="Project Allowance">Project Allowance</option>
                                        </select>
                                        <Input 
                                            type="number" 
                                            value={allowance.amount} 
                                            onChange={(e) => updateAllowance(index, 'amount', e.target.value)} 
                                            placeholder="Amount ₹" 
                                            disabled={allowance.type === 'NPA'} 
                                            className="bg-white text-xs" 
                                        />
                                        <Button 
                                            type="button" 
                                            onClick={() => removeAllowance(index)} 
                                            variant="destructive" 
                                            size="sm"
                                            className="cursor-pointer"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Section 4: Deductions */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div>
                                    <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">
                                        3. Monthly Deductions (मासिक कपाती)
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        * Professional Tax (PT) & GIS are automated based on Maharashtra government rules.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium text-slate-600">GPF Subscription (₹)</Label>
                                        <Input type="number" name="gpfSubscription" value={formData.gpfSubscription} onChange={handleInputChange} placeholder="0" className="bg-red-50/20 border-red-200/60" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium text-slate-600">GPF Recovery (₹)</Label>
                                        <Input type="number" name="gpfRecovery" value={formData.gpfRecovery} onChange={handleInputChange} placeholder="0" className="bg-red-50/20 border-red-200/60" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium text-slate-600">Festival Advance (₹)</Label>
                                        <Input type="number" name="festivalAdvance" value={formData.festivalAdvance} onChange={handleInputChange} placeholder="0" className="bg-red-50/20 border-red-200/60" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium text-slate-600">Other Advances (₹)</Label>
                                        <Input type="number" name="otherAdvances" value={formData.otherAdvances} onChange={handleInputChange} placeholder="0" className="bg-red-50/20 border-red-200/60" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium text-slate-600">Other Recovery (₹)</Label>
                                        <Input type="number" name="otherRecovery" value={formData.otherRecovery} onChange={handleInputChange} placeholder="0" className="bg-red-50/20 border-red-200/60" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium text-slate-600">Income Tax (TDS) (₹)</Label>
                                        <Input type="number" name="incomeTax" value={formData.incomeTax} onChange={handleInputChange} placeholder="0" className="bg-red-50/20 border-red-200/60" />
                                    </div>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                size="lg" 
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg h-14 rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.01] cursor-pointer"
                            >
                                Calculate Payslip & Generate Statement
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Payslip Results & PDF Download */}
                <PayslipResults result={result} />
            </div>
        </div>
    );
}
