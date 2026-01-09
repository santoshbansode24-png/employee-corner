import React, { useState } from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

function Form16Calculator() {
    const [formData, setFormData] = useState({
        name: '',
        pan: '',
        employer: '',
        financialYear: '2024-25',
        monthlySalary: '',
        otherIncome: 0,
        hraExemption: 0,
        ltaExemption: 0,
        section80C: 0,
        section80CCD1B: 0,
        section80D: 0,
        taxRegime: 'old'
    })

    const [result, setResult] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const calculateTax = () => {
        const monthlySalary = parseFloat(formData.monthlySalary) || 0
        const annualSalary = monthlySalary * 12
        const otherIncome = parseFloat(formData.otherIncome) || 0
        const totalIncome = annualSalary + otherIncome

        // Standard Deduction
        const standardDeduction = 50000

        // Exemptions
        const hraExemption = parseFloat(formData.hraExemption) || 0
        const ltaExemption = parseFloat(formData.ltaExemption) || 0

        // Income after exemptions
        const incomeAfterExemptions = totalIncome - hraExemption - ltaExemption

        // Gross Total Income
        const grossTotalIncome = incomeAfterExemptions

        // Deductions under Chapter VI-A
        const section80C = Math.min(parseFloat(formData.section80C) || 0, 150000)
        const section80CCD1B = Math.min(parseFloat(formData.section80CCD1B) || 0, 50000)
        const section80D = parseFloat(formData.section80D) || 0

        const totalDeductions = section80C + section80CCD1B + section80D

        // Taxable Income
        const taxableIncome = Math.max(grossTotalIncome - standardDeduction - totalDeductions, 0)

        // Calculate Tax based on regime
        let tax = 0
        let taxBreakdown = []

        if (formData.taxRegime === 'old') {
            // Old Tax Regime
            if (taxableIncome <= 250000) {
                tax = 0
                taxBreakdown.push({ slab: 'Up to ₹2,50,000', rate: '0%', amount: 0 })
            } else if (taxableIncome <= 500000) {
                tax = (taxableIncome - 250000) * 0.05
                taxBreakdown.push({ slab: 'Up to ₹2,50,000', rate: '0%', amount: 0 })
                taxBreakdown.push({ slab: '₹2,50,001 - ₹5,00,000', rate: '5%', amount: tax })
            } else if (taxableIncome <= 1000000) {
                tax = 12500 + (taxableIncome - 500000) * 0.20
                taxBreakdown.push({ slab: 'Up to ₹2,50,000', rate: '0%', amount: 0 })
                taxBreakdown.push({ slab: '₹2,50,001 - ₹5,00,000', rate: '5%', amount: 12500 })
                taxBreakdown.push({ slab: '₹5,00,001 - ₹10,00,000', rate: '20%', amount: tax - 12500 })
            } else {
                tax = 112500 + (taxableIncome - 1000000) * 0.30
                taxBreakdown.push({ slab: 'Up to ₹2,50,000', rate: '0%', amount: 0 })
                taxBreakdown.push({ slab: '₹2,50,001 - ₹5,00,000', rate: '5%', amount: 12500 })
                taxBreakdown.push({ slab: '₹5,00,001 - ₹10,00,000', rate: '20%', amount: 100000 })
                taxBreakdown.push({ slab: 'Above ₹10,00,000', rate: '30%', amount: tax - 112500 })
            }
        } else {
            // New Tax Regime (2024-25)
            if (taxableIncome <= 300000) {
                tax = 0
                taxBreakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', amount: 0 })
            } else if (taxableIncome <= 700000) {
                tax = (taxableIncome - 300000) * 0.05
                taxBreakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', amount: 0 })
                taxBreakdown.push({ slab: '₹3,00,001 - ₹7,00,000', rate: '5%', amount: tax })
            } else if (taxableIncome <= 1000000) {
                tax = 20000 + (taxableIncome - 700000) * 0.10
                taxBreakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', amount: 0 })
                taxBreakdown.push({ slab: '₹3,00,001 - ₹7,00,000', rate: '5%', amount: 20000 })
                taxBreakdown.push({ slab: '₹7,00,001 - ₹10,00,000', rate: '10%', amount: tax - 20000 })
            } else if (taxableIncome <= 1200000) {
                tax = 50000 + (taxableIncome - 1000000) * 0.15
                taxBreakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', amount: 0 })
                taxBreakdown.push({ slab: '₹3,00,001 - ₹7,00,000', rate: '5%', amount: 20000 })
                taxBreakdown.push({ slab: '₹7,00,001 - ₹10,00,000', rate: '10%', amount: 30000 })
                taxBreakdown.push({ slab: '₹10,00,001 - ₹12,00,000', rate: '15%', amount: tax - 50000 })
            } else if (taxableIncome <= 1500000) {
                tax = 80000 + (taxableIncome - 1200000) * 0.20
                taxBreakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', amount: 0 })
                taxBreakdown.push({ slab: '₹3,00,001 - ₹7,00,000', rate: '5%', amount: 20000 })
                taxBreakdown.push({ slab: '₹7,00,001 - ₹10,00,000', rate: '10%', amount: 30000 })
                taxBreakdown.push({ slab: '₹10,00,001 - ₹12,00,000', rate: '15%', amount: 30000 })
                taxBreakdown.push({ slab: '₹12,00,001 - ₹15,00,000', rate: '20%', amount: tax - 80000 })
            } else {
                tax = 140000 + (taxableIncome - 1500000) * 0.30
                taxBreakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', amount: 0 })
                taxBreakdown.push({ slab: '₹3,00,001 - ₹7,00,000', rate: '5%', amount: 20000 })
                taxBreakdown.push({ slab: '₹7,00,001 - ₹10,00,000', rate: '10%', amount: 30000 })
                taxBreakdown.push({ slab: '₹10,00,001 - ₹12,00,000', rate: '15%', amount: 30000 })
                taxBreakdown.push({ slab: '₹12,00,001 - ₹15,00,000', rate: '20%', amount: 60000 })
                taxBreakdown.push({ slab: 'Above ₹15,00,000', rate: '30%', amount: tax - 140000 })
            }
        }

        // Add 4% Health and Education Cess
        const cess = tax * 0.04
        const totalTax = tax + cess

        setResult({
            totalIncome,
            hraExemption,
            ltaExemption,
            grossTotalIncome,
            standardDeduction,
            section80C,
            section80CCD1B,
            section80D,
            totalDeductions,
            taxableIncome,
            tax,
            cess,
            totalTax,
            taxBreakdown,
            regime: formData.taxRegime,
            name: formData.name,
            pan: formData.pan,
            employer: formData.employer,
            financialYear: formData.financialYear
        })
    }

    const downloadPDF = () => {
        if (!result) return

        const doc = new jsPDF()

        // Header
        doc.setFillColor(59, 130, 246)
        doc.rect(0, 0, 210, 40, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text('FORM 16', 105, 20, { align: 'center' })

        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text(`Financial Year: ${result.financialYear}`, 105, 30, { align: 'center' })

        // Employee Details
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        let yPos = 50

        doc.setFont('helvetica', 'bold')
        doc.text('Employee Details:', 20, yPos)
        yPos += 7

        doc.setFont('helvetica', 'normal')
        doc.text(`Name: ${result.name}`, 20, yPos)
        yPos += 6
        doc.text(`PAN: ${result.pan}`, 20, yPos)
        yPos += 6
        doc.text(`Employer: ${result.employer}`, 20, yPos)
        yPos += 6
        doc.text(`Tax Regime: ${result.regime === 'old' ? 'Old Regime' : 'New Regime'}`, 20, yPos)
        yPos += 10

        // Income Details
        doc.autoTable({
            startY: yPos,
            head: [['Income Details', 'Amount (₹)']],
            body: [
                ['Total Income from Salary', result.totalIncome.toFixed(2)],
                ['Less: HRA Exemption', result.hraExemption.toFixed(2)],
                ['Less: LTA Exemption', result.ltaExemption.toFixed(2)],
                ['Gross Total Income', result.grossTotalIncome.toFixed(2)],
            ],
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: 20, right: 20 }
        })

        yPos = doc.lastAutoTable.finalY + 10

        // Deductions
        doc.autoTable({
            startY: yPos,
            head: [['Deductions under Chapter VI-A', 'Amount (₹)']],
            body: [
                ['Standard Deduction', result.standardDeduction.toFixed(2)],
                ['Section 80C (Max ₹1,50,000)', result.section80C.toFixed(2)],
                ['Section 80CCD(1B) (Max ₹50,000)', result.section80CCD1B.toFixed(2)],
                ['Section 80D (Medical Insurance)', result.section80D.toFixed(2)],
                ['Total Deductions', result.totalDeductions.toFixed(2)],
            ],
            headStyles: { fillColor: [139, 92, 246], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: 20, right: 20 }
        })

        yPos = doc.lastAutoTable.finalY + 10

        // Tax Calculation
        doc.autoTable({
            startY: yPos,
            head: [['Tax Slab', 'Rate', 'Tax Amount (₹)']],
            body: result.taxBreakdown.map(item => [
                item.slab,
                item.rate,
                item.amount.toFixed(2)
            ]),
            headStyles: { fillColor: [239, 68, 68], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: 20, right: 20 }
        })

        yPos = doc.lastAutoTable.finalY + 10

        // Final Tax Summary
        doc.setFillColor(34, 197, 94)
        doc.rect(20, yPos, 170, 25, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')

        yPos += 8
        doc.text('Taxable Income:', 25, yPos)
        doc.text(`₹ ${result.taxableIncome.toFixed(2)}`, 185, yPos, { align: 'right' })

        yPos += 7
        doc.text('Income Tax:', 25, yPos)
        doc.text(`₹ ${result.tax.toFixed(2)}`, 185, yPos, { align: 'right' })

        yPos += 7
        doc.text('Health & Education Cess (4%):', 25, yPos)
        doc.text(`₹ ${result.cess.toFixed(2)}`, 185, yPos, { align: 'right' })

        yPos += 10
        doc.setFontSize(12)
        doc.text('TOTAL TAX PAYABLE:', 25, yPos)
        doc.text(`₹ ${result.totalTax.toFixed(2)}`, 185, yPos, { align: 'right' })

        // Footer
        doc.setTextColor(128, 128, 128)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.text('Generated by Smart Employee Toolkit', 105, 285, { align: 'center' })
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' })

        doc.save(`form16-${result.name.replace(/\s+/g, '-')}-${result.financialYear}.pdf`)
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">📄 Form-16 Calculator</h1>
                    <p className="card-subtitle">Income Tax Computation for Salaried Employees</p>
                </div>

                <div className="card-body">
                    <form onSubmit={(e) => { e.preventDefault(); calculateTax(); }}>
                        {/* Basic Information */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="form-group">
                                <label className="form-label form-label-required">Employee Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">PAN Number</label>
                                <input
                                    type="text"
                                    name="pan"
                                    value={formData.pan}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="ABCDE1234F"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Employer Name</label>
                                <input
                                    type="text"
                                    name="employer"
                                    value={formData.employer}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter employer name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Financial Year</label>
                                <select
                                    name="financialYear"
                                    value={formData.financialYear}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="2024-25">2024-25</option>
                                    <option value="2023-24">2023-24</option>
                                    <option value="2022-23">2022-23</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Monthly Salary (₹)</label>
                                <input
                                    type="number"
                                    name="monthlySalary"
                                    value={formData.monthlySalary}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter monthly salary"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Other Income (₹)</label>
                                <input
                                    type="number"
                                    name="otherIncome"
                                    value={formData.otherIncome}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">HRA Exemption (₹)</label>
                                <input
                                    type="number"
                                    name="hraExemption"
                                    value={formData.hraExemption}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">LTA Exemption (₹)</label>
                                <input
                                    type="number"
                                    name="ltaExemption"
                                    value={formData.ltaExemption}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Section 80C (Max ₹1,50,000)</label>
                                <input
                                    type="number"
                                    name="section80C"
                                    value={formData.section80C}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="0"
                                />
                                <span className="form-help">PPF, EPF, LIC, ELSS, etc.</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Section 80CCD(1B) (Max ₹50,000)</label>
                                <input
                                    type="number"
                                    name="section80CCD1B"
                                    value={formData.section80CCD1B}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="0"
                                />
                                <span className="form-help">Additional NPS contribution</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Section 80D (Medical Insurance)</label>
                                <input
                                    type="number"
                                    name="section80D"
                                    value={formData.section80D}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Tax Regime</label>
                                <select
                                    name="taxRegime"
                                    value={formData.taxRegime}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="old">Old Regime</option>
                                    <option value="new">New Regime</option>
                                </select>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button type="submit" className="btn btn-primary btn-lg">
                                Calculate Tax
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="card mt-8 animate-fade-in">
                    <div className="card-header">
                        <h2 className="card-title">Tax Calculation Summary</h2>
                        <p className="card-subtitle">{result.regime === 'old' ? 'Old Tax Regime' : 'New Tax Regime'}</p>
                    </div>

                    <div className="card-body">
                        <div className="grid grid-cols-2 gap-8">
                            {/* Income & Deductions */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Income & Deductions</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Total Income:</span>
                                        <span className="font-semibold">₹ {result.totalIncome.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Standard Deduction:</span>
                                        <span className="font-semibold">₹ {result.standardDeduction.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Section 80C:</span>
                                        <span className="font-semibold">₹ {result.section80C.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Section 80CCD(1B):</span>
                                        <span className="font-semibold">₹ {result.section80CCD1B.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Section 80D:</span>
                                        <span className="font-semibold">₹ {result.section80D.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t-2">
                                        <span className="font-bold">Taxable Income:</span>
                                        <span className="font-bold text-primary-600">₹ {result.taxableIncome.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tax Breakdown */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Tax Breakdown</h3>
                                <div className="space-y-2">
                                    {result.taxBreakdown.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span>{item.slab} @ {item.rate}:</span>
                                            <span className="font-semibold">₹ {item.amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between pt-3 border-t-2">
                                        <span className="font-bold">Income Tax:</span>
                                        <span className="font-bold">₹ {result.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Health & Education Cess (4%):</span>
                                        <span className="font-semibold">₹ {result.cess.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Tax */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white">
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold">TOTAL TAX PAYABLE</span>
                                <span className="text-3xl font-bold">₹ {result.totalTax.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card-footer">
                        <button onClick={downloadPDF} className="btn btn-primary">
                            Download Form-16 PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Form16Calculator
