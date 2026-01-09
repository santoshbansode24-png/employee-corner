import React, { useState } from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

function PensionCalculator() {
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        doj: '',
        retirementDate: '',
        basicPay: '',
        earnedLeave: '',
        daRate: 55,
    })

    const [result, setResult] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const calculateServiceLength = (doj, retirementDate) => {
        const start = new Date(doj)
        const end = new Date(retirementDate)

        let years = end.getFullYear() - start.getFullYear()
        let months = end.getMonth() - start.getMonth()

        if (months < 0) {
            years--
            months += 12
        }

        return { years, months }
    }

    const calculatePension = () => {
        const basicPay = parseFloat(formData.basicPay) || 0
        const daRate = parseFloat(formData.daRate) || 0
        const earnedLeave = parseFloat(formData.earnedLeave) || 0

        // Service length
        const serviceLength = calculateServiceLength(formData.doj, formData.retirementDate)
        const totalMonths = serviceLength.years * 12 + serviceLength.months
        const completedSixMonthPeriods = Math.floor(totalMonths / 6)

        // Basic Pension = 50% of Last Basic Pay
        const basicPension = Math.round(basicPay * 0.5)

        // Commuted Pension = 40% of Basic Pension
        const commutedPension = Math.round(basicPension * 0.4)

        // CVP Rate (assumed 9.0 for calculation)
        const cvpRate = 9.0
        const cvp = Math.round(commutedPension * 12 * cvpRate)

        // Reduced Pension
        const reducedPension = basicPension - commutedPension

        // DA on Pension
        const daOnPension = Math.round(basicPension * daRate / 100)

        // Net Pension
        const netPension = reducedPension + daOnPension

        // Family Pension = 30% of basic pension
        const familyPension = Math.round(basicPension * 0.3)

        // DA on Family Pension
        const daOnFamilyPension = Math.round(familyPension * daRate / 100)

        // Total Family Pension
        const totalFamilyPension = familyPension + daOnFamilyPension

        // Gratuity = Basic Pay × 1/4 × number of completed 6-monthly periods
        // Max limit = ₹20,00,000
        const gratuityCalculated = Math.round(basicPay * 0.25 * completedSixMonthPeriods)
        const gratuity = Math.min(gratuityCalculated, 2000000)

        // DA for Leave Encashment
        const da = Math.round(basicPay * daRate / 100)

        // Leave Encashment = (Basic + DA) / 30 × leave days
        const leaveEncashment = Math.round(((basicPay + da) / 30) * earnedLeave)

        setResult({
            serviceLength,
            basicPension,
            commutedPension,
            cvp,
            cvpRate,
            reducedPension,
            daOnPension,
            netPension,
            familyPension,
            daOnFamilyPension,
            totalFamilyPension,
            gratuity,
            leaveEncashment,
            basicPay,
            daRate,
            earnedLeave,
            name: formData.name,
            dob: formData.dob,
            doj: formData.doj,
            retirementDate: formData.retirementDate
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
        doc.text('PENSION CALCULATION REPORT', 105, 20, { align: 'center' })

        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text('Government Employee Pension Details', 105, 30, { align: 'center' })

        // Employee Details
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        let yPos = 50

        doc.setFont('helvetica', 'bold')
        doc.text('Employee Information:', 20, yPos)
        yPos += 7

        doc.setFont('helvetica', 'normal')
        doc.text(`Name: ${result.name}`, 20, yPos)
        yPos += 6
        doc.text(`Date of Birth: ${new Date(result.dob).toLocaleDateString()}`, 20, yPos)
        yPos += 6
        doc.text(`Date of Joining: ${new Date(result.doj).toLocaleDateString()}`, 20, yPos)
        yPos += 6
        doc.text(`Retirement Date: ${new Date(result.retirementDate).toLocaleDateString()}`, 20, yPos)
        yPos += 6
        doc.text(`Service Length: ${result.serviceLength.years} years, ${result.serviceLength.months} months`, 20, yPos)
        yPos += 6
        doc.text(`Last Basic Pay: ₹${result.basicPay.toFixed(2)}`, 20, yPos)
        yPos += 10

        // Pension Details Table
        doc.autoTable({
            startY: yPos,
            head: [['Pension Component', 'Amount (₹)']],
            body: [
                ['Basic Pension (50% of Last Pay)', result.basicPension.toFixed(2)],
                ['Commuted Pension (40% of Basic)', result.commutedPension.toFixed(2)],
                [`Commutation Value (CVP @ ${result.cvpRate})`, result.cvp.toFixed(2)],
                ['Reduced Pension', result.reducedPension.toFixed(2)],
                [`DA on Pension (${result.daRate}%)`, result.daOnPension.toFixed(2)],
                ['Net Monthly Pension', result.netPension.toFixed(2)],
            ],
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: 20, right: 20 }
        })

        yPos = doc.lastAutoTable.finalY + 10

        // Family Pension Table
        doc.autoTable({
            startY: yPos,
            head: [['Family Pension', 'Amount (₹)']],
            body: [
                ['Basic Family Pension (30%)', result.familyPension.toFixed(2)],
                [`DA on Family Pension (${result.daRate}%)`, result.daOnFamilyPension.toFixed(2)],
                ['Total Family Pension', result.totalFamilyPension.toFixed(2)],
            ],
            headStyles: { fillColor: [139, 92, 246], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: 20, right: 20 }
        })

        yPos = doc.lastAutoTable.finalY + 10

        // Retirement Benefits Table
        doc.autoTable({
            startY: yPos,
            head: [['Retirement Benefits', 'Amount (₹)']],
            body: [
                ['Gratuity (Max ₹20,00,000)', result.gratuity.toFixed(2)],
                [`Leave Encashment (${result.earnedLeave} days)`, result.leaveEncashment.toFixed(2)],
            ],
            headStyles: { fillColor: [34, 197, 94], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: 20, right: 20 }
        })

        // Footer
        doc.setTextColor(128, 128, 128)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.text('Generated by Smart Employee Toolkit', 105, 285, { align: 'center' })
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' })

        doc.save(`pension-report-${result.name.replace(/\s+/g, '-')}.pdf`)
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">🏦 Pension Calculator</h1>
                    <p className="card-subtitle">Government Employee Pension Calculation</p>
                </div>

                <div className="card-body">
                    <form onSubmit={(e) => { e.preventDefault(); calculatePension(); }}>
                        <div className="grid grid-cols-2 gap-6">
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
                                <label className="form-label form-label-required">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Date of Joining</label>
                                <input
                                    type="date"
                                    name="doj"
                                    value={formData.doj}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Retirement Date</label>
                                <input
                                    type="date"
                                    name="retirementDate"
                                    value={formData.retirementDate}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Last Basic Pay (₹)</label>
                                <input
                                    type="number"
                                    name="basicPay"
                                    value={formData.basicPay}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter last basic pay"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Total Earned Leave (Days)</label>
                                <input
                                    type="number"
                                    name="earnedLeave"
                                    value={formData.earnedLeave}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter earned leave days"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">DA Rate (%)</label>
                                <input
                                    type="number"
                                    name="daRate"
                                    value={formData.daRate}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    step="0.01"
                                    required
                                />
                                <span className="form-help">Current DA Rate: 55%</span>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button type="submit" className="btn btn-primary btn-lg">
                                Calculate Pension
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="card mt-8 animate-fade-in">
                    <div className="card-header">
                        <h2 className="card-title">Pension Calculation Summary</h2>
                    </div>

                    <div className="card-body">
                        {/* Service Details */}
                        <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">Service Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-neutral-600">Total Service:</span>
                                    <span className="ml-2 font-semibold">
                                        {result.serviceLength.years} years, {result.serviceLength.months} months
                                    </span>
                                </div>
                                <div>
                                    <span className="text-neutral-600">Last Basic Pay:</span>
                                    <span className="ml-2 font-semibold">₹ {result.basicPay.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Pension Details */}
                        <div className="grid grid-cols-2 gap-8 mb-6">
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-primary-600">Monthly Pension</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Basic Pension (50%):</span>
                                        <span className="font-semibold">₹ {result.basicPension.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Commuted Pension (40%):</span>
                                        <span className="font-semibold">₹ {result.commutedPension.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>CVP Value @ {result.cvpRate}:</span>
                                        <span className="font-semibold">₹ {result.cvp.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Reduced Pension:</span>
                                        <span className="font-semibold">₹ {result.reducedPension.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>DA on Pension ({result.daRate}%):</span>
                                        <span className="font-semibold">₹ {result.daOnPension.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t-2 border-primary-300">
                                        <span className="font-bold">Net Monthly Pension:</span>
                                        <span className="font-bold text-primary-600">₹ {result.netPension.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-secondary-600">Family Pension</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Basic Family Pension (30%):</span>
                                        <span className="font-semibold">₹ {result.familyPension.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>DA on Family Pension:</span>
                                        <span className="font-semibold">₹ {result.daOnFamilyPension.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t-2 border-secondary-300">
                                        <span className="font-bold">Total Family Pension:</span>
                                        <span className="font-bold text-secondary-600">₹ {result.totalFamilyPension.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Retirement Benefits */}
                        <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                            <h3 className="text-xl font-semibold mb-4 text-green-800">Retirement Benefits</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="text-neutral-600 mb-1">Gratuity</div>
                                    <div className="text-2xl font-bold text-green-600">₹ {result.gratuity.toFixed(2)}</div>
                                    <div className="text-xs text-neutral-500 mt-1">Maximum ₹20,00,000</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="text-neutral-600 mb-1">Leave Encashment</div>
                                    <div className="text-2xl font-bold text-green-600">₹ {result.leaveEncashment.toFixed(2)}</div>
                                    <div className="text-xs text-neutral-500 mt-1">{result.earnedLeave} days</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-footer">
                        <button onClick={downloadPDF} className="btn btn-primary">
                            Download PDF Report
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PensionCalculator
