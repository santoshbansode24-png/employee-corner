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
        <div className="min-h-screen bg-slate-50/40 font-sans relative">
            {/* Soft background gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-blue-100/50 via-indigo-50/50 to-transparent pointer-events-none -z-10" />
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
            
            <div className="p-6 lg:p-10 lg:pl-12">
                <div className="w-full max-w-full xl:max-w-[1400px] space-y-16 animate-in slide-in-from-bottom-6 duration-700 fade-in">
                    
                    {/* Header Section */}
                    <div className="space-y-4 max-w-3xl">
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
                            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Smart Toolkit</span>
                        </h1>
                        <p className="text-lg text-slate-500 leading-relaxed font-medium">
                            A fully modernized, high-performance suite for government employees. Calculate your financials instantly with zero server lag.
                        </p>
                    </div>

                    {/* Modules Grid */}
                    <div className="space-y-14">
                        {modules.map((module, idx) => (
                            <div key={idx} className="space-y-6">
                                <div className="flex items-center gap-4 border-b border-slate-200/60 pb-3">
                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{module.title}</h2>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${module.badgeColor}`}>
                                        {module.tools.filter(t => t.active).length} Tools
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                                    {module.tools.map((tool, toolIdx) => (
                                        <Link 
                                            key={toolIdx} 
                                            href={tool.path}
                                            className={tool.active ? "cursor-pointer group block" : "cursor-default opacity-60 block"}
                                        >
                                            <Card className={`h-full border-transparent bg-white shadow-[0_2px_12px_-4px_rgba(6,81,237,0.08)] transition-all duration-300 hover:shadow-[0_12px_30px_-6px_rgba(6,81,237,0.15)]
                                                ${tool.active ? 'hover:border-blue-200/60 hover:-translate-y-1.5 ring-1 ring-slate-100 hover:ring-blue-200' : 'bg-slate-50 ring-1 ring-slate-100'}
                                            `}>
                                                <CardContent className="p-7 flex flex-col justify-between h-full relative overflow-hidden">
                                                    {/* Glow effect on hover */}
                                                    {tool.active && <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full blur-2xl -mr-10 -mt-10 transition-all duration-500 group-hover:from-blue-200/60 group-hover:scale-150"></div>}
                                                    
                                                    <div className="flex flex-col items-start gap-5 flex-1 relative z-10">
                                                        <div className={`p-3.5 rounded-2xl 
                                                            ${tool.active ? 'bg-gradient-to-br from-blue-50 to-indigo-50/80 text-blue-600 shadow-sm group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-500 group-hover:shadow-blue-500/25 ring-1 ring-blue-100/50 group-hover:ring-blue-600' : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200'}
                                                        `}>
                                                            <tool.icon size={26} strokeWidth={1.8} />
                                                        </div>
                                                        <div className="space-y-2 mt-1">
                                                            <h3 className={`font-bold text-lg leading-tight transition-colors duration-300 ${tool.active ? 'text-slate-800 group-hover:text-blue-700' : 'text-slate-500'}`}>{tool.name}</h3>
                                                            <p className="text-[15px] text-slate-500 leading-relaxed font-medium line-clamp-2">{tool.desc}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {tool.active ? (
                                                        <div className="mt-8 flex items-center text-[14px] font-bold text-blue-600 transform transition-all duration-300 group-hover:translate-x-1 relative z-10">
                                                            Launch Tool 
                                                            <svg className="w-4 h-4 ml-1.5 stroke-[2.5px] transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-8 inline-flex items-center px-2.5 py-1.5 bg-slate-100 text-slate-400 text-[11px] uppercase font-bold tracking-wider rounded-md border border-slate-200 relative z-10">
                                                            Coming Soon
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
        </div>
    );
}
