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
                        <h3 className="text-lg font-semibold mb-4 text-emerald-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            Allowances & Earnings (देणी)
                        </h3>
                        <div className="space-y-3 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Basic Salary (मूळ वेतन):</span>
                                <span className="font-semibold text-gray-900">₹ {result.allowances.basic.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">DA ({result.metadata.daRate}%):</span>
                                <span className="font-semibold text-gray-900">₹ {result.allowances.da.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">HRA ({result.metadata.hraRate}%):</span>
                                <span className="font-semibold text-gray-900">
                                    {result.metadata.isGovtQuarter ? '₹ 0.00 (Govt Quarter)' : `₹ ${result.allowances.hra.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Transport Allowance (TA):</span>
                                <span className="font-semibold text-gray-900">₹ {result.allowances.ta.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {result.allowances.daOnTA > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">DA on TA ({result.metadata.daRate}%):</span>
                                    <span className="font-semibold text-gray-900">₹ {result.allowances.daOnTA.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {result.allowances.perTA > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Per TA:</span>
                                    <span className="font-semibold text-gray-900">₹ {result.allowances.perTA.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {result.allowances.additionalAllowances?.map((allowance: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{allowance.type}:</span>
                                    <span className="font-semibold text-gray-900">₹ {allowance.calculatedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-3 border-t border-emerald-200 mt-2">
                                <span className="font-bold text-gray-900">Total Earnings (एकूण देणी):</span>
                                <span className="font-bold text-emerald-800 text-base">₹ {result.allowances.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-red-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                            Deductions (कपाती)
                        </h3>
                        <div className="space-y-3 bg-red-50/40 p-4 rounded-xl border border-red-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Professional Tax (व्यवसाय कर):</span>
                                <span className="font-semibold text-gray-900">₹ {result.deductions.professionalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">GIS (गट विमा):</span>
                                <span className="font-semibold text-gray-900">₹ {result.deductions.gis.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {result.deductions.dcps > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">DCPS / NPS (10%):</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.dcps.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {result.deductions.gpfSubscription > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">GPF Subscription:</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.gpfSubscription.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {result.deductions.gpfRecovery > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">GPF Recovery:</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.gpfRecovery.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {result.deductions.festivalAdvance > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Festival Advance:</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.festivalAdvance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {result.deductions.otherAdvances > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Other Advances:</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.otherAdvances.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {result.deductions.otherRecovery > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Other Recovery:</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.otherRecovery.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {result.deductions.incomeTax > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Income Tax (TDS):</span>
                                    <span className="font-semibold text-gray-900">₹ {result.deductions.incomeTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-3 border-t border-red-200 mt-2">
                                <span className="font-bold text-gray-900">Total Deductions (एकूण कपाती):</span>
                                <span className="font-bold text-red-800 text-base">₹ {result.deductions.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Net Salary */}
                <div className="mt-8 p-6 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl text-white shadow-lg shadow-emerald-600/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 block">NET DISBURSED SALARY (निव्वळ देय वेतन)</span>
                        <p className="text-xs text-emerald-100 mt-0.5">Disbursable to Bank Account</p>
                    </div>
                    <span className="text-3xl sm:text-4xl font-black tracking-tight">₹ {result.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {result.metadata.employeeType === 'NPS' && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 text-center font-medium">
                        * Government NPS 14% Contribution: ₹ {result.deductions.npsGovt?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'} is deposited directly into your PRAN tier-1 account.
                    </div>
                )}
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
