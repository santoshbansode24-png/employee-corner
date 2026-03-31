import React from 'react';
import { downloadModernPDF, downloadTraditionalPDF } from '../../utils/payslipPDF';

const PayslipResults = ({ result }) => {
    if (!result) return null;

    return (
        <div className="card mt-8 animate-fade-in">
            <div className="card-header">
                <h2 className="card-title">Payslip Summary</h2>
            </div>

            <div className="card-body">
                <div className="grid grid-cols-2 gap-8">
                    {/* Allowances */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-success">Allowances</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Basic Salary:</span>
                                <span className="font-semibold">₹ {result.allowances.basic.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>DA ({result.metadata.daRate}%):</span>
                                <span className="font-semibold">₹ {result.allowances.da.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>HRA ({result.metadata.hraRate}%):</span>
                                <span className="font-semibold">₹ {result.allowances.hra.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>TA:</span>
                                <span className="font-semibold">₹ {result.allowances.ta.toFixed(2)}</span>
                            </div>
                            {result.allowances.perTA > 0 && (
                                <div className="flex justify-between">
                                    <span>Per TA:</span>
                                    <span className="font-semibold">₹ {result.allowances.perTA.toFixed(2)}</span>
                                </div>
                            )}
                            {result.allowances.additionalAllowances.map((allowance, index) => (
                                <div key={index} className="flex justify-between">
                                    <span>{allowance.type}:</span>
                                    <span className="font-semibold">₹ {allowance.calculatedAmount.toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-3 border-t-2 border-neutral-300">
                                <span className="font-bold">Total Allowances:</span>
                                <span className="font-bold text-success">₹ {result.allowances.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-error">Deductions</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Professional Tax:</span>
                                <span className="font-semibold">₹ {result.deductions.professionalTax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>GIS:</span>
                                <span className="font-semibold">₹ {result.deductions.gis.toFixed(2)}</span>
                            </div>
                            {result.deductions.dcps > 0 && (
                                <div className="flex justify-between">
                                    <span>DCPS (10%):</span>
                                    <span className="font-semibold">₹ {result.deductions.dcps.toFixed(2)}</span>
                                </div>
                            )}
                            {result.deductions.gpfSubscription > 0 && (
                                <div className="flex justify-between">
                                    <span>GPF Subscription:</span>
                                    <span className="font-semibold">₹ {result.deductions.gpfSubscription.toFixed(2)}</span>
                                </div>
                            )}
                            {result.deductions.gpfRecovery > 0 && (
                                <div className="flex justify-between">
                                    <span>GPF Recovery:</span>
                                    <span className="font-semibold">₹ {result.deductions.gpfRecovery.toFixed(2)}</span>
                                </div>
                            )}
                            {result.deductions.festivalAdvance > 0 && (
                                <div className="flex justify-between">
                                    <span>Festival Advance:</span>
                                    <span className="font-semibold">₹ {result.deductions.festivalAdvance.toFixed(2)}</span>
                                </div>
                            )}
                            {result.deductions.otherAdvances > 0 && (
                                <div className="flex justify-between">
                                    <span>Other Advances:</span>
                                    <span className="font-semibold">₹ {result.deductions.otherAdvances.toFixed(2)}</span>
                                </div>
                            )}
                            {result.deductions.otherRecovery > 0 && (
                                <div className="flex justify-between">
                                    <span>Other Recovery:</span>
                                    <span className="font-semibold">₹ {result.deductions.otherRecovery.toFixed(2)}</span>
                                </div>
                            )}
                            {result.deductions.incomeTax > 0 && (
                                <div className="flex justify-between">
                                    <span>Income Tax:</span>
                                    <span className="font-semibold">₹ {result.deductions.incomeTax.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-3 border-t-2 border-neutral-300">
                                <span className="font-bold">Total Deductions:</span>
                                <span className="font-bold text-error">₹ {result.deductions.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Net Salary */}
                <div className="mt-8 p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white">
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">NET SALARY</span>
                        <span className="text-3xl font-bold">₹ {result.netSalary.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="card-footer">
                <button onClick={() => downloadModernPDF(result)} className="btn btn-primary">
                    Download Modern PDF
                </button>
                <button onClick={() => downloadTraditionalPDF(result)} className="btn btn-secondary">
                    Download Traditional PDF
                </button>
            </div>
        </div>
    );
};

export default PayslipResults;
