"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, Info, Search, Printer, CheckCircle2, ArrowUpRight } from "lucide-react";

// Complete Maharashtra State 7th Pay Commission Matrix (S-1 to S-31)
const payMatrix: Record<number, { basePay: number; gradePay: string; cadre: string }> = {
    1: { basePay: 15000, gradePay: "1300", cadre: "Class 4 (Group D)" },
    2: { basePay: 15300, gradePay: "1400", cadre: "Class 4 (Group D)" },
    3: { basePay: 16600, gradePay: "1600", cadre: "Class 4 (Group D)" },
    4: { basePay: 17100, gradePay: "1650 & 1700", cadre: "Class 4 (Group D)" },
    5: { basePay: 18000, gradePay: "1800", cadre: "Class 4 (Group D)" },
    6: { basePay: 19900, gradePay: "1900", cadre: "Class 3 (Group C)" },
    7: { basePay: 21700, gradePay: "2000", cadre: "Class 3 (Group C)" },
    8: { basePay: 25500, gradePay: "2400", cadre: "Class 3 (Group C)" },
    9: { basePay: 26400, gradePay: "2500", cadre: "Class 3 (Group C)" },
    10: { basePay: 29200, gradePay: "2800", cadre: "Class 3 (Group C)" },
    11: { basePay: 30100, gradePay: "2900 & 3000", cadre: "Class 3 (Group C)" },
    12: { basePay: 32000, gradePay: "3500", cadre: "Class 3 (Group C)" },
    13: { basePay: 35400, gradePay: "4100 & 4200", cadre: "Class 3 (Group C)" },
    14: { basePay: 38600, gradePay: "4300", cadre: "Class 3 (Group C)" },
    15: { basePay: 41800, gradePay: "4400", cadre: "Class 3 (Group C)" },
    16: { basePay: 44900, gradePay: "4500 & 4600", cadre: "Class 2 (Group B)" },
    17: { basePay: 47600, gradePay: "4800", cadre: "Class 2 (Group B)" },
    18: { basePay: 49100, gradePay: "4900 & 5000", cadre: "Class 2 (Group B)" },
    19: { basePay: 55100, gradePay: "5000", cadre: "Class 2 (Group B)" },
    20: { basePay: 56100, gradePay: "5400", cadre: "Class 1 (Group A)" },
    21: { basePay: 63300, gradePay: "6000", cadre: "Class 1 (Group A)" },
    22: { basePay: 64400, gradePay: "6600", cadre: "Class 1 (Group A)" },
    23: { basePay: 67700, gradePay: "6600", cadre: "Class 1 (Group A)" },
    24: { basePay: 78800, gradePay: "7600", cadre: "Class 1 (Group A)" },
    25: { basePay: 118500, gradePay: "8700", cadre: "Class 1 (Group A)" },
    26: { basePay: 123100, gradePay: "8700", cadre: "Class 1 (Group A)" },
    27: { basePay: 131100, gradePay: "8900", cadre: "Class 1 (Group A)" },
    28: { basePay: 135100, gradePay: "8900", cadre: "Class 1 (Group A)" },
    29: { basePay: 144200, gradePay: "10000", cadre: "Class 1 (Group A)" },
    30: { basePay: 182200, gradePay: "12000", cadre: "Apex Scale" },
    31: { basePay: 225000, gradePay: "Cabinet Sec", cadre: "Apex Scale" },
};

export default function PayScalePage() {
    const [selectedLevel, setSelectedLevel] = useState(15);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPayInput, setCurrentPayInput] = useState('');

    const calculateIncrements = (basePay: number) => {
        const increments = [basePay];
        let currentPay = basePay;

        for (let i = 1; i <= 40; i++) {
            // Standard 7th CPC: Next Pay = round((currentPay × 1.03) / 100) × 100
            const nextPay = Math.round((currentPay * 1.03) / 100) * 100;
            increments.push(nextPay);
            currentPay = nextPay;
        }

        return increments;
    };

    const levelData = payMatrix[selectedLevel] || payMatrix[15];
    const increments = useMemo(() => calculateIncrements(levelData.basePay), [levelData.basePay]);

    // Filter levels by search query (Level number, Grade Pay, or Base Pay)
    const filteredLevels = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return Object.keys(payMatrix).map(Number);

        return Object.entries(payMatrix).filter(([lvl, data]) => {
            const lvlMatch = `s-${lvl}`.includes(query) || lvl.includes(query);
            const gpMatch = data.gradePay.toLowerCase().includes(query);
            const baseMatch = data.basePay.toString().includes(query);
            const cadreMatch = data.cadre.toLowerCase().includes(query);
            return lvlMatch || gpMatch || baseMatch || cadreMatch;
        }).map(([lvl]) => Number(lvl));
    }, [searchQuery]);

    // Highlight user's matching stage if they enter current basic pay
    const highlightedStageIndex = useMemo(() => {
        const val = parseFloat(currentPayInput);
        if (!val || isNaN(val)) return -1;
        return increments.findIndex(pay => pay === val);
    }, [currentPayInput, increments]);

    return (
        <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                    <div className="space-y-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <TrendingUp size={24} />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                                7th Pay Commission Scale Viewer
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            महाराष्ट्र शासन ७ वा वेतन आयोग वेतन मॅट्रिक्स (स्तर एस-१ ते एस-३१) • ४० वर्षांचे वेतनवाढ विश्लेषण
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => window.print()}
                        variant="outline"
                        className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold rounded-xl text-sm h-11 px-4 cursor-pointer"
                    >
                        <Printer size={16} />
                        Print Scale Matrix
                    </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    
                    {/* Left Panel: Level Explorer */}
                    <div className="xl:col-span-1 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold text-slate-800">Select Pay Level (स्तर)</h2>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                    {filteredLevels.length} Levels
                                </span>
                            </div>
                            
                            {/* Search Box */}
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                                <Input 
                                    placeholder="Search GP e.g. 4200 or 56100"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-white border-slate-200 text-xs h-9 rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-2 max-h-[580px] overflow-y-auto pr-1 pb-4">
                            {filteredLevels.map((lvl) => {
                                const data = payMatrix[lvl];
                                const isActive = selectedLevel === lvl;
                                return (
                                    <button 
                                        key={lvl}
                                        type="button"
                                        onClick={() => setSelectedLevel(lvl)}
                                        className={`rounded-xl border transition-all duration-150 p-2.5 text-left flex flex-col justify-between h-20 cursor-pointer
                                            ${isActive 
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]' 
                                                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span className={`text-base font-black ${isActive ? 'text-white' : 'text-slate-900'}`}>
                                                S-{lvl}
                                            </span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'}`}>
                                                GP {data.gradePay}
                                            </span>
                                        </div>
                                        <div className={`text-xs font-semibold ${isActive ? 'text-blue-100' : 'text-emerald-700'}`}>
                                            ₹ {data.basePay.toLocaleString('en-IN')}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Panel: Matrix Presentation & Stage Finder */}
                    <div className="xl:col-span-3 space-y-6">
                        
                        {/* Summary Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-white border-blue-100 shadow-sm rounded-2xl">
                                <CardContent className="p-5">
                                    <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Pay Level & Cadre</div>
                                    <div className="text-3xl font-black text-slate-800">Level S-{selectedLevel}</div>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{levelData.cadre}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white border-emerald-100 shadow-sm rounded-2xl">
                                <CardContent className="p-5">
                                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Starting Basic Pay (प्रारंभिक)</div>
                                    <div className="text-3xl font-black text-emerald-700">₹ {levelData.basePay.toLocaleString('en-IN')}</div>
                                    <p className="text-xs text-emerald-600 font-medium mt-1">Stage 1 (Initial Entry)</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white border-purple-100 shadow-sm rounded-2xl">
                                <CardContent className="p-5">
                                    <div className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">6th CPC Grade Pay</div>
                                    <div className="text-3xl font-black text-purple-700">₹ {levelData.gradePay}</div>
                                    <p className="text-xs text-purple-500 font-medium mt-1">Correlated Grade Pay</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Interactive Stage Finder */}
                        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                    <CheckCircle2 size={16} className="text-emerald-600" />
                                    Find Your Exact Pay Stage (माझा वेतन टप्पा शोधा)
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Enter your current basic pay to highlight your stage and see your next 5-year salary progression.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Input 
                                    type="number"
                                    placeholder="e.g. 56100"
                                    value={currentPayInput}
                                    onChange={(e) => setCurrentPayInput(e.target.value)}
                                    className="w-full sm:w-44 bg-slate-50 border-slate-200 font-semibold text-sm"
                                />
                                {highlightedStageIndex >= 0 && (
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg whitespace-nowrap">
                                        Stage {highlightedStageIndex + 1}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 40-Year Increment Projection Table */}
                        <Card className="border-slate-200/80 shadow-sm rounded-2xl overflow-hidden flex flex-col bg-white">
                            <CardHeader className="bg-slate-900 text-white p-4 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold text-white">
                                        Level S-{selectedLevel} • 40-Year Increment Progression (वेतनवाढ तक्ता)
                                    </CardTitle>
                                    <p className="text-xs text-slate-400 mt-0.5">Annual Increment @ 3% compound with nearest ₹100 rounding</p>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 text-xs font-medium bg-slate-800 px-3 py-1.5 rounded-full text-slate-300">
                                    <Info size={14} className="text-blue-400" />
                                    <span>Formula: <code className="text-blue-300 font-mono">round((Pay × 1.03) / 100) × 100</code></span>
                                </div>
                            </CardHeader>
                            
                            <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead className="text-[11px] text-slate-600 uppercase bg-slate-100 sticky top-0 z-10 border-b border-slate-200 shadow-2xs">
                                        <tr>
                                            <th className="px-5 py-3 font-bold border-r border-slate-200 text-center">Stage</th>
                                            <th className="px-5 py-3 font-bold border-r border-slate-200">Tenure / Service Milestone</th>
                                            <th className="px-5 py-3 font-bold border-r border-slate-200 text-right">Basic Pay (₹)</th>
                                            <th className="px-5 py-3 font-bold border-r border-slate-200 text-right">Annual Increment (₹)</th>
                                            <th className="px-5 py-3 font-bold text-right text-blue-700">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {increments.map((pay, index) => {
                                            const isHighlighted = highlightedStageIndex === index;
                                            return (
                                                <tr 
                                                    key={index} 
                                                    className={`hover:bg-blue-50/40 transition-colors ${
                                                        isHighlighted 
                                                            ? 'bg-amber-100/70 font-bold ring-1 ring-amber-300' 
                                                            : index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                                                    }`}
                                                >
                                                    <td className="px-5 py-2.5 font-bold text-slate-900 border-r border-slate-100 text-center">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-5 py-2.5 text-slate-600 border-r border-slate-100 font-medium">
                                                        {index === 0 ? (
                                                            <span className="text-blue-700 font-bold">Initial Appointment (नियुक्ती वेतन)</span>
                                                        ) : (
                                                            `Year ${index} (वेतनवाढ ${index})`
                                                        )}
                                                        {isHighlighted && (
                                                            <span className="ml-2 text-[10px] bg-amber-300 text-amber-900 font-black px-1.5 py-0.5 rounded">
                                                                CURRENT STAGE
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-2.5 font-bold text-emerald-700 border-r border-slate-100 text-right text-sm">
                                                        ₹ {pay.toLocaleString('en-IN')}
                                                    </td>
                                                    <td className="px-5 py-2.5 text-slate-600 font-medium border-r border-slate-100 text-right">
                                                        {index === 0 ? (
                                                            <span className="text-slate-300">-</span>
                                                        ) : (
                                                            `+ ₹ ${(pay - increments[index - 1]).toLocaleString('en-IN')}`
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-2.5 text-right font-bold text-blue-600">
                                                        {index === 0 ? <span className="text-slate-300">-</span> : '3.0%'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
