"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import PayslipPDFDocument from './PayslipPDFDocument';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), {
  ssr: false,
  loading: () => <Button disabled className="w-full bg-blue-300">Loading PDF Engine...</Button>
});

interface PayslipResultsProps {
    result: any;
}

const PayslipResults: React.FC<PayslipResultsProps> = ({ result }) => {
    if (!result) return null;

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mt-8 animate-in fade-in zoom-in duration-300">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Payslip Summary</h2>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Allowances */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Allowances
                        </h3>
                        <div className="space-y-3 bg-green-50/50 p-4 rounded-lg border border-green-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Basic Salary:</span>
                                <span className="font-semibold text-gray-900">₹ {result.allowances.basic.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">DA ({result.metadata.daRate}%):</span>
                                <span className="font-semibold text-gray-900">₹ {result.allowances.da.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">HRA ({result.metadata.hraRate}%):</span>
                                <span className="font-semibold text-gray-900">₹ {result.allowances.hra.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">TA:</span>
                                <span className="font-semibold text-gray-900">₹ {result.allowances.ta.toFixed(2)}</span>
                            </div>
                            {result.allowances.perTA > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Per TA:</span>
                                    <span className="font-semibold text-gray-900">₹ {result.allowances.perTA.toFixed(2)}</span>
                                </div>
                            )}
                            {result.allowances.additionalAllowances.map((allowance: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{allowance.type}:</span>
                                    <span className="font-semibold text-gray-900">₹ {allowance.calculatedAmount.toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-3 border-t border-green-200 mt-2">
                                <span className="font-bold text-gray-800">Total Allowances:</span>
                                <span className="font-bold text-green-700">₹ {result.allowances.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-red-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Deductions
                        </h3>
                        <div className="space-y-3 bg-red-50/50 p-4 rounded-lg border border-red-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Professional Tax:</span>
                                <span className="font-semibold text-gray-900">₹ {result.deductions.professionalTax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">GIS:</span>
                                <span className="font-semibold text-gray-900">₹ {result.deductions.gis.toFixed(2)}</span>
                            </div>
                            {result.deductions.dcps > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">DCPS (10%):</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.dcps.toFixed(2)}</span>
                                </div>
                            )}
                            {result.deductions.gpfSubscription > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">GPF Subscription:</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.gpfSubscription.toFixed(2)}</span>
                                </div>
                            )}
                            {result.deductions.gpfRecovery > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">GPF Recovery:</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.gpfRecovery.toFixed(2)}</span>
                                </div>
                            )}
                            {result.deductions.festivalAdvance > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Festival Advance:</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.festivalAdvance.toFixed(2)}</span>
                                </div>
                            )}
                            {result.deductions.otherAdvances > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Other Advances:</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.otherAdvances.toFixed(2)}</span>
                                </div>
                            )}
                            {result.deductions.otherRecovery > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Other Recovery:</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.otherRecovery.toFixed(2)}</span>
                                </div>
                            )}
                            {result.deductions.incomeTax > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Income Tax:</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.incomeTax.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-3 border-t border-red-200 mt-2">
                                <span className="font-bold text-gray-800">Total Deductions:</span>
                                <span className="font-bold text-red-700">₹ {result.deductions.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Net Salary */}
                <div className="mt-8 p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white shadow-lg flex justify-between items-center">
                    <span className="text-xl font-bold uppercase tracking-wider text-green-50">Net Salary</span>
                    <span className="text-4xl font-extrabold tracking-tight">₹ {result.netSalary.toFixed(2)}</span>
                </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
                <PDFDownloadLink 
                    document={<PayslipPDFDocument result={result} />} 
                    fileName="Payslip-Statement.pdf"
                >
                    {({ blob, url, loading, error }) => (
                        <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                            disabled={loading}
                        >
                            <Download size={18} />
                            {loading ? 'Generating PDF...' : 'Download Statement'}
                        </Button>
                    )}
                </PDFDownloadLink>
            </div>
        </div>
    );
};

export default PayslipResults;
