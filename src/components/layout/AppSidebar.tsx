"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    Home, 
    Calculator, 
    Landmark, 
    FileText, 
    TrendingUp, 
    Building, 
    Menu, 
    X,
    FileImage,
    Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navSections = [
    {
        title: "Main",
        items: [
            { name: "Dashboard", href: "/", icon: Home }
        ]
    },
    {
        title: "Employee Corner",
        items: [
            { name: "Payslip Calculator", href: "/payslip", icon: Calculator },
            { name: "Arrears Statement", href: "/arrears", icon: FileText },
            { name: "Pay Scale Viewer", href: "/payscale", icon: TrendingUp },
            { name: "Pension Calculator", href: "/pension", icon: Landmark },
            { name: "Medical Bill", href: "/medical", icon: FileImage },
        ]
    },
    {
        title: "Financial",
        items: [
            { name: "SIP Calculator", href: "/financial/sip", icon: Coins },
            { name: "Fixed Deposit", href: "/financial/fd", icon: Landmark },
            { name: "Loan EMI & Eligibility", href: "/financial/loan", icon: Building },
        ]
    }
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on mobile when route changes
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        // Initial setup
        handleResize();
        
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    }, [pathname]);

    return (
        <div className="min-h-screen flex bg-gray-50 flex-col lg:flex-row w-full font-sans">
            {/* Mobile Header / Hamburger */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">SM</div>
                    <span className="font-bold text-gray-900 text-lg tracking-tight">Smart Toolkit</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
            </div>

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-gray-100 shadow-sm flex flex-col transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 overflow-y-auto`}
            >
                <div className="p-6 border-b border-gray-50 hidden lg:flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 flex items-center justify-center text-white font-bold text-xl">
                        SM
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 leading-tight">Smart Toolkit</h1>
                        <p className="text-xs text-blue-600 font-medium">Employee Corner 2.0</p>
                    </div>
                </div>

                <div className="flex-1 py-6 px-4 space-y-8">
                    {navSections.map((section, idx) => (
                        <div key={idx} className="space-y-1">
                            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                {section.title}
                            </h3>
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                const isComingSoon = item.href.startsWith("#");
                                return (
                                    <Link 
                                        key={item.name} 
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                                            ${isActive 
                                                ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100' 
                                                : isComingSoon 
                                                    ? 'text-gray-400 hover:bg-gray-50' 
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }
                                        `}
                                    >
                                        <item.icon 
                                            size={18} 
                                            className={`
                                                ${isActive ? 'text-blue-600' : isComingSoon ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}
                                            `} 
                                        />
                                        <span>{item.name}</span>
                                        {isComingSoon && <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md font-semibold">Soon</span>}
                                        {isActive && <div className="ml-auto w-1 h-4 rounded-full bg-blue-600" />}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-blue-100/50">
                        <p className="text-xs text-blue-800 font-semibold mb-1">Modernized Edition</p>
                        <p className="text-[10px] text-blue-600/80">Next.js 16 • React 19 • Tailwind 4</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
