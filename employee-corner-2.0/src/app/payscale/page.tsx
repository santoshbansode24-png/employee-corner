"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Info } from "lucide-react";

// Maharashtra State 7th Pay Commission Matrix
const payMatrix: Record<number, { basePay: number; gradePay: string }> = {
    1: { basePay: 15000, gradePay: "1300" },
    2: { basePay: 15300, gradePay: "1400" },
    3: { basePay: 16600, gradePay: "1600" },
    4: { basePay: 17100, gradePay: "1650 & 1700" },
    5: { basePay: 18000, gradePay: "1800" },
    6: { basePay: 19900, gradePay: "1900" },
    7: { basePay: 21700, gradePay: "2000" },
    8: { basePay: 25500, gradePay: "2400" },
    9: { basePay: 26400, gradePay: "2500" },
    10: { basePay: 29200, gradePay: "2800" },
    11: { basePay: 30100, gradePay: "2900 & 3000" },
    12: { basePay: 32000, gradePay: "3500" },
    13: { basePay: 35400, gradePay: "4100 & 4200" },
    14: { basePay: 38600, gradePay: "4300" },
    15: { basePay: 41800, gradePay: "4400" },
    16: { basePay: 44900, gradePay: "4500 & 4600" },
    17: { basePay: 47600, gradePay: "4800" },
    18: { basePay: 49100, gradePay: "4900 & 5000" },
    19: { basePay: 55100, gradePay: "5000" },
    20: { basePay: 56100, gradePay: "5400" },
};

export default function PayScalePage() {
    const [selectedLevel, setSelectedLevel] = useState(1);

    const calculateIncrements = (basePay: number) => {
        const increments = [basePay];
        let currentPay = basePay;

        for (let i = 1; i <= 40; i++) {
            // Next Pay = round((currentPay × 1.03) / 100) × 100
            const nextPay = Math.round((currentPay * 1.03) / 100) * 100;
            increments.push(nextPay);
            currentPay = nextPay;
        }

        return increments;
    };

    const levelData = payMatrix[selectedLevel];
    const increments = calculateIncrements(levelData.basePay);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Section */}
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight flex items-center justify-center gap-3">
                        <TrendingUp size={36} className="text-blue-600" />
                        Pay Scale Viewer
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">Maharashtra State 7th Pay Commission Matrix</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    
                    {/* Left Panel: Matrix Selection */}
                    <div className="xl:col-span-1 space-y-4">
                        <h2 className="text-xl font-bold border-b pb-2 text-slate-800">Select Grade Level</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 pb-4">
                            {Object.entries(payMatrix).map(([level, data]) => {
                                const isActive = selectedLevel === parseInt(level);
                                return (
                                    <div 
                                        key={level}
                                        onClick={() => setSelectedLevel(parseInt(level))}
                                        className={`cursor-pointer rounded-xl border transition-all duration-200 p-3 select-none flex flex-col items-center justify-center h-24
                                            ${isActive 
                                                ? 'bg-blue-600 border-blue-700 shadow-md shadow-blue-500/30 scale-105 z-10' 
                                                : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600'
                                            }
                                        `}
                                    >
                                        <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>Level</span>
                                        <span className={`text-2xl font-black ${isActive ? 'text-white' : 'text-slate-800'}`}>S-{level}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Panel: Data Presentation */}
                    <div className="xl:col-span-3 space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="text-blue-600 font-semibold text-sm mb-1">Active Pay Level</div>
                                    <div className="text-4xl font-black text-blue-900">S-{selectedLevel}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="text-emerald-700 font-semibold text-sm mb-1">Initial Basic Pay</div>
                                    <div className="text-4xl font-black text-emerald-900">₹ {levelData.basePay.toLocaleString('en-IN')}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="text-purple-700 font-semibold text-sm mb-1">Old Grade Pay Mapping</div>
                                    <div className="text-3xl mt-1 font-bold text-purple-900">₹ {levelData.gradePay}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Increment Table Container */}
                        <Card className="border-gray-200 shadow-lg overflow-hidden flex flex-col">
                            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                                <h3 className="font-bold text-lg">40-Year Increment Projection</h3>
                                <div className="flex items-center gap-2 text-xs font-medium bg-slate-800 px-3 py-1.5 rounded-full">
                                    <Info size={14} className="text-blue-400" />
                                    <span>Formula: <code className="text-blue-300 font-mono">round((Current × 1.03) / 100) × 100</code></span>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Year</th>
                                            <th className="px-6 py-4 font-bold">Stage</th>
                                            <th className="px-6 py-4 font-bold">Basic Pay (₹)</th>
                                            <th className="px-6 py-4 font-bold">Increment Gained (₹)</th>
                                            <th className="px-6 py-4 font-bold text-right text-blue-600">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {increments.map((pay, index) => (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-slate-900">{index === 0 ? 'Base' : `Year ${index}`}</td>
                                                <td className="px-6 py-3 text-slate-500">{index === 0 ? 'Initial Appointment' : `Increment ${index}`}</td>
                                                <td className="px-6 py-3 font-bold text-emerald-700">₹ {pay.toLocaleString('en-IN')}</td>
                                                <td className="px-6 py-3 text-slate-600 font-medium">
                                                    {index === 0 ? <span className="text-slate-300">-</span> : `+ ₹ ${(pay - increments[index - 1]).toLocaleString('en-IN')}`}
                                                </td>
                                                <td className="px-6 py-3 text-right font-bold text-blue-600">
                                                    {index === 0 ? <span className="text-slate-300">-</span> : '3.0%'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
