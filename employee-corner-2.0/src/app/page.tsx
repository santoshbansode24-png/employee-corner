"use client";

import React from "react";
import Link from "next/link";
import { Calculator, FileText, TrendingUp, Landmark, Coins, Building, FileImage } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
    const modules = [
        {
            title: "Employee Corner",
            description: "Core tools for salary, tax, and arrears calculation.",
            badgeColor: "bg-blue-100 text-blue-800",
            tools: [
                { name: "Payslip Calculator", path: "/payslip", icon: Calculator, desc: "Generate native PDF payslips", active: true },
                { name: "Arrears Statement", path: "/arrears", icon: FileText, desc: "Detailed difference statement", active: true },
                { name: "Pay Scale Viewer", path: "/payscale", icon: TrendingUp, desc: "7th CPC Matrix explorer", active: true },
                { name: "Pension Calculator", path: "/pension", icon: Landmark, desc: "Retirement benefits & DCRG", active: true },
            ]
        },
        {
            title: "Financial Planning",
            description: "Future investment and loan eligibility tools.",
            badgeColor: "bg-emerald-100 text-emerald-800",
            tools: [
                { name: "SIP Calculator", path: "/financial/sip", icon: Coins, desc: "Systematic Investment Plan", active: true },
                { name: "Fixed Deposit", path: "/financial/fd", icon: Landmark, desc: "FD Compounding returns", active: true },
                { name: "Loan EMI & Eligibility", path: "/financial/loan", icon: Building, desc: "EMI & Borrowing limits", active: true },
            ],
        },
        {
            title: "Utility Tools",
            description: "Helper tools for documents and images.",
            badgeColor: "bg-purple-100 text-purple-800",
            tools: [
                { name: "Medical Bill", path: "/medical", icon: FileImage, desc: "Reimbursement claims (Form C & D)", active: true },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 font-sans">
            <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-700 fade-in">
                
                {/* Header Section */}
                <div className="space-y-4">
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Welcome to <span className="text-blue-600">Smart Toolkit</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                        A fully modernized, high-performance suite for government employees. Calculate your financials instantly without server lag.
                    </p>
                </div>

                {/* Modules Grid */}
                <div className="space-y-10">
                    {modules.map((module, idx) => (
                        <div key={idx} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-slate-800">{module.title}</h2>
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${module.badgeColor}`}>
                                    {module.tools.filter(t => t.active).length} Active Tools
                                </span>
                            </div>
                            <p className="text-slate-500 -mt-4">{module.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {module.tools.map((tool, toolIdx) => (
                                    <Link 
                                        key={toolIdx} 
                                        href={tool.path}
                                        className={tool.active ? "cursor-pointer group" : "cursor-default opacity-60"}
                                    >
                                        <Card className={`h-full border-slate-200 shadow-sm transition-all duration-300
                                            ${tool.active ? 'hover:shadow-md hover:border-blue-300 hover:-translate-y-1' : 'bg-slate-50'}
                                        `}>
                                            <CardContent className="p-6 flex flex-col items-start gap-4 h-full">
                                                <div className={`p-3 rounded-xl 
                                                    ${tool.active ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors' : 'bg-slate-200 text-slate-500'}
                                                `}>
                                                    <tool.icon size={24} strokeWidth={2} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-slate-900 leading-none">{tool.name}</h3>
                                                    <p className="text-sm text-slate-500 line-clamp-2">{tool.desc}</p>
                                                </div>
                                                {!tool.active && (
                                                    <div className="mt-auto inline-flex items-center px-2 py-1 bg-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider rounded">
                                                        Development
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Upgrade Info Box */}
                <div className="mt-12 p-8 bg-gradient-to-br from-indigo-900 to-blue-900 rounded-3xl shadow-xl border border-indigo-700/50 text-white relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl">
                        <h3 className="text-2xl font-bold mb-3">🚀 The 2.0 Architectural Upgrade</h3>
                        <p className="text-indigo-200 leading-relaxed mb-6">
                            This application has been rewritten from the ground up using Next.js 16 and Native React-PDF. 
                            We have completely eliminated the heavy Python/LibreOffice backend bridging that caused server lag. Operations are now 100x faster and execute entirely locally.
                        </p>
                        <div className="flex gap-4 text-sm font-semibold">
                            <span className="flex items-center gap-2 bg-indigo-950/50 px-3 py-1.5 rounded-lg border border-indigo-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Zero Server Overload
                            </span>
                            <span className="flex items-center gap-2 bg-indigo-950/50 px-3 py-1.5 rounded-lg border border-indigo-500/30">
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> No Puppeteer Errors
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
