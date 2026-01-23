import React, { useState } from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

function PayslipCalculator() {
    const [formData, setFormData] = useState({
        employeeType: 'GPF',
        basicSalary: '',
        payScale: 'S-7 to S-19', // Default middle grade
        daRate: 55,
        city: '',
        cityCategory: 'X',
        isHandicap: false,
        employeeClass: '1',
        perTA: 0,
        gpfSubscription: 0,
        gpfRecovery: 0,
        festivalAdvance: 0,
        otherAdvances: 0,
        otherRecovery: 0,
        incomeTax: 0,
    })

    const [additionalAllowances, setAdditionalAllowances] = useState([])
    const [result, setResult] = useState(null)

    const cities = {
        'Mumbai': { category: 'X', isMetro: true },
        'Thane': { category: 'X', isMetro: true },
        'Pune': { category: 'X', isMetro: true },
        'Nagpur': { category: 'Y', isMetro: false },
        'Nashik': { category: 'Y', isMetro: false },
        'Aurangabad': { category: 'Y', isMetro: false },
        'Solapur': { category: 'Z', isMetro: false },
        'Kolhapur': { category: 'Z', isMetro: false },
        'Amravati': { category: 'Z', isMetro: false },
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Auto-detect city category
        if (name === 'city' && cities[value]) {
            setFormData(prev => ({
                ...prev,
                city: value,
                cityCategory: cities[value].category
            }))
        }
    }

    const addAllowance = () => {
        setAdditionalAllowances([...additionalAllowances, { type: 'NPA', amount: 0 }])
    }

    const updateAllowance = (index, field, value) => {
        const updated = [...additionalAllowances]
        updated[index][field] = value
        setAdditionalAllowances(updated)
    }

    const removeAllowance = (index) => {
        setAdditionalAllowances(additionalAllowances.filter((_, i) => i !== index))
    }

    const calculatePayslip = () => {
        const basic = parseFloat(formData.basicSalary) || 0
        const daRate = parseFloat(formData.daRate) || 0

        // Calculate DA
        const da = Math.round(basic * daRate / 100)

        // Calculate HRA based on DA slab
        let hraRate = 0
        if (daRate < 25) {
            hraRate = formData.cityCategory === 'X' ? 24 : formData.cityCategory === 'Y' ? 16 : 8
        } else if (daRate >= 25 && daRate < 50) {
            hraRate = formData.cityCategory === 'X' ? 27 : formData.cityCategory === 'Y' ? 18 : 9
        } else {
            hraRate = formData.cityCategory === 'X' ? 30 : formData.cityCategory === 'Y' ? 20 : 10
        }
        const hra = Math.round(basic * hraRate / 100)

        // Calculate TA based on salary and handicap status
        // Calculate TA based on Grade/Scale + Salary Threshold + City + Handicap
        let ta = 0
        const cityInfo = cities[formData.city]
        const isMetro = cityInfo ? cityInfo.isMetro : false

        let grade = formData.payScale; // 'S-1 to S-6', 'S-7 to S-19', 'S-20 to S-23'

        // Rule: "When Basic Salary >= 24200 of Scale S-1 to S-6: The TA rate JUMPS to 1350 logic (same as S-7)"
        if (grade === 'S-1 to S-6' && basic >= 24200) {
            grade = 'S-7 to S-19'; // Treat as higher grade for TA calculation
        }

        if (formData.isHandicap) {
            // HANDICAP RATES
            if (grade === 'S-1 to S-6') {
                ta = 2250; // Flat rate for lower grade handicap across all areas (based on user table inference, or usually double metro?)
                // Table says: Reg: 2250, Metro: 2250. So Flat 2250.
            } else if (grade === 'S-7 to S-19') {
                // Table: Regular -> 2700 (Double of 1350?), Metro -> 5400 (Double of 2700?)
                ta = isMetro ? 5400 : 2700;
            } else if (grade === 'S-20 to S-23') {
                // Table: Regular -> 5400, Metro -> 10800 ?? (Assuming proportional double like middle Tier)
                // User said: "S-20... Handicapped... 5400 regular, 10800 Metro"
                ta = isMetro ? 10800 : 5400;
            }
        } else {
            // REGULAR RATES (NON-HANDICAP)
            if (grade === 'S-1 to S-6') {
                // Table: Regular 675, Metro 1000
                ta = isMetro ? 1000 : 675;
            } else if (grade === 'S-7 to S-19') {
                // Table: Regular 1350, Metro 2700
                ta = isMetro ? 2700 : 1350;
            } else if (grade === 'S-20 to S-23') {
                // Table: Regular 2700, Metro 5400
                ta = isMetro ? 5400 : 2700;
            }
        }

        // Calculate Additional Allowances
        let additionalAllowancesTotal = 0
        const processedAllowances = additionalAllowances.map(allowance => {
            let amount = parseFloat(allowance.amount) || 0
            if (allowance.type === 'NPA') {
                amount = Math.round(basic * 0.35)
            }
            additionalAllowancesTotal += amount
            return { ...allowance, calculatedAmount: amount }
        })

        // Total Allowances
        const perTA = parseFloat(formData.perTA) || 0
        const totalAllowances = basic + da + hra + ta + perTA + additionalAllowancesTotal

        // Calculate Deductions
        const professionalTax = 200

        const gisRates = { '1': 960, '2': 480, '3': 360, '4': 240 }
        const gis = gisRates[formData.employeeClass] || 0

        let dcps = 0
        if (formData.employeeType === 'NPS') {
            dcps = Math.round((basic + da) * 0.10)
        }

        const gpfSubscription = parseFloat(formData.gpfSubscription) || 0
        const gpfRecovery = parseFloat(formData.gpfRecovery) || 0
        const festivalAdvance = parseFloat(formData.festivalAdvance) || 0
        const otherAdvances = parseFloat(formData.otherAdvances) || 0
        const otherRecovery = parseFloat(formData.otherRecovery) || 0
        const incomeTax = parseFloat(formData.incomeTax) || 0

        const totalDeductions = professionalTax + gis + dcps + gpfSubscription +
            gpfRecovery + festivalAdvance + otherAdvances +
            otherRecovery + incomeTax

        // Net Salary
        const netSalary = totalAllowances - totalDeductions

        setResult({
            allowances: {
                basic,
                da,
                hra,
                ta,
                perTA,
                additionalAllowances: processedAllowances,
                additionalAllowancesTotal,
                total: totalAllowances
            },
            deductions: {
                professionalTax,
                gis,
                dcps,
                gpfSubscription,
                gpfRecovery,
                festivalAdvance,
                otherAdvances,
                otherRecovery,
                incomeTax,
                total: totalDeductions
            },
            netSalary,
            metadata: {
                employeeType: formData.employeeType,
                city: formData.city,
                cityCategory: formData.cityCategory,
                employeeClass: formData.employeeClass,
                daRate,
                hraRate
            }
        })
    }

    const downloadModernPDF = () => {
        if (!result) return

        const doc = new jsPDF()

        // Header with gradient effect
        doc.setFillColor(59, 130, 246)
        doc.rect(0, 0, 210, 40, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text('PAYSLIP', 105, 20, { align: 'center' })

        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text('Maharashtra Government Employee', 105, 30, { align: 'center' })

        // Employee Details
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        let yPos = 50

        doc.setFont('helvetica', 'bold')
        doc.text('Employee Details:', 20, yPos)
        yPos += 7

        doc.setFont('helvetica', 'normal')
        doc.text(`Employee Type: ${result.metadata.employeeType}`, 20, yPos)
        doc.text(`City: ${result.metadata.city} (${result.metadata.cityCategory})`, 120, yPos)
        yPos += 7
        doc.text(`Employee Class: ${result.metadata.employeeClass}`, 20, yPos)
        doc.text(`DA Rate: ${result.metadata.daRate}%`, 120, yPos)
        yPos += 10

        // Allowances Table
        doc.autoTable({
            startY: yPos,
            head: [['Allowances', 'Amount (₹)']],
            body: [
                ['Basic Salary', result.allowances.basic.toFixed(2)],
                ['Dearness Allowance (DA)', result.allowances.da.toFixed(2)],
                ['House Rent Allowance (HRA)', result.allowances.hra.toFixed(2)],
                ['Transport Allowance (TA)', result.allowances.ta.toFixed(2)],
                ['Per TA', result.allowances.perTA.toFixed(2)],
                ...result.allowances.additionalAllowances.map(a =>
                    [a.type, a.calculatedAmount.toFixed(2)]
                ),
                ['TOTAL ALLOWANCES', result.allowances.total.toFixed(2)]
            ],
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            footStyles: { fillColor: [229, 231, 235], textColor: 0, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: 20, right: 20 }
        })

        yPos = doc.lastAutoTable.finalY + 10

        // Deductions Table
        doc.autoTable({
            startY: yPos,
            head: [['Deductions', 'Amount (₹)']],
            body: [
                ['Professional Tax', result.deductions.professionalTax.toFixed(2)],
                ['GIS', result.deductions.gis.toFixed(2)],
                ...(result.deductions.dcps > 0 ? [['DCPS (NPS)', result.deductions.dcps.toFixed(2)]] : []),
                ...(result.deductions.gpfSubscription > 0 ? [['GPF Subscription', result.deductions.gpfSubscription.toFixed(2)]] : []),
                ...(result.deductions.gpfRecovery > 0 ? [['GPF Recovery', result.deductions.gpfRecovery.toFixed(2)]] : []),
                ...(result.deductions.festivalAdvance > 0 ? [['Festival Advance', result.deductions.festivalAdvance.toFixed(2)]] : []),
                ...(result.deductions.otherAdvances > 0 ? [['Other Advances', result.deductions.otherAdvances.toFixed(2)]] : []),
                ...(result.deductions.otherRecovery > 0 ? [['Other Recovery', result.deductions.otherRecovery.toFixed(2)]] : []),
                ...(result.deductions.incomeTax > 0 ? [['Income Tax', result.deductions.incomeTax.toFixed(2)]] : []),
                ['TOTAL DEDUCTIONS', result.deductions.total.toFixed(2)]
            ],
            headStyles: { fillColor: [239, 68, 68], textColor: 255 },
            footStyles: { fillColor: [229, 231, 235], textColor: 0, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: 20, right: 20 }
        })

        yPos = doc.lastAutoTable.finalY + 10

        // Net Salary
        doc.setFillColor(34, 197, 94)
        doc.rect(20, yPos, 170, 15, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('NET SALARY:', 25, yPos + 10)
        doc.text(`₹ ${result.netSalary.toFixed(2)}`, 185, yPos + 10, { align: 'right' })

        // Footer
        doc.setTextColor(128, 128, 128)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.text('Generated by Smart Employee Toolkit', 105, 285, { align: 'center' })
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' })

        doc.save('payslip-modern.pdf')
    }

    const downloadTraditionalPDF = () => {
        if (!result) return

        const doc = new jsPDF()

        // Simple header
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text('PAY SLIP', 105, 20, { align: 'center' })

        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text('Government of Maharashtra', 105, 30, { align: 'center' })

        doc.line(20, 35, 190, 35)

        let yPos = 45

        // Employee details in traditional format
        doc.setFontSize(10)
        doc.text(`Employee Type: ${result.metadata.employeeType}`, 20, yPos)
        yPos += 7
        doc.text(`City: ${result.metadata.city}`, 20, yPos)
        doc.text(`Category: ${result.metadata.cityCategory}`, 120, yPos)
        yPos += 7
        doc.text(`Class: ${result.metadata.employeeClass}`, 20, yPos)
        doc.text(`DA Rate: ${result.metadata.daRate}%`, 120, yPos)
        yPos += 10

        doc.line(20, yPos, 190, yPos)
        yPos += 7

        // Allowances
        doc.setFont('helvetica', 'bold')
        doc.text('ALLOWANCES', 20, yPos)
        doc.text('AMOUNT (₹)', 150, yPos)
        yPos += 7
        doc.line(20, yPos - 2, 190, yPos - 2)

        doc.setFont('helvetica', 'normal')
        const allowanceItems = [
            ['Basic Salary', result.allowances.basic],
            ['DA', result.allowances.da],
            ['HRA', result.allowances.hra],
            ['TA', result.allowances.ta],
            ['Per TA', result.allowances.perTA],
            ...result.allowances.additionalAllowances.map(a => [a.type, a.calculatedAmount])
        ]

        allowanceItems.forEach(([label, amount]) => {
            doc.text(label, 25, yPos)
            doc.text(amount.toFixed(2), 185, yPos, { align: 'right' })
            yPos += 6
        })

        doc.line(20, yPos, 190, yPos)
        yPos += 5
        doc.setFont('helvetica', 'bold')
        doc.text('Total Allowances', 25, yPos)
        doc.text(result.allowances.total.toFixed(2), 185, yPos, { align: 'right' })
        yPos += 10

        // Deductions
        doc.setFont('helvetica', 'bold')
        doc.text('DEDUCTIONS', 20, yPos)
        doc.text('AMOUNT (₹)', 150, yPos)
        yPos += 7
        doc.line(20, yPos - 2, 190, yPos - 2)

        doc.setFont('helvetica', 'normal')
        const deductionItems = [
            ['Professional Tax', result.deductions.professionalTax],
            ['GIS', result.deductions.gis],
            ...(result.deductions.dcps > 0 ? [['DCPS', result.deductions.dcps]] : []),
            ...(result.deductions.gpfSubscription > 0 ? [['GPF Subscription', result.deductions.gpfSubscription]] : []),
            ...(result.deductions.gpfRecovery > 0 ? [['GPF Recovery', result.deductions.gpfRecovery]] : []),
            ...(result.deductions.festivalAdvance > 0 ? [['Festival Advance', result.deductions.festivalAdvance]] : []),
            ...(result.deductions.otherAdvances > 0 ? [['Other Advances', result.deductions.otherAdvances]] : []),
            ...(result.deductions.otherRecovery > 0 ? [['Other Recovery', result.deductions.otherRecovery]] : []),
            ...(result.deductions.incomeTax > 0 ? [['Income Tax', result.deductions.incomeTax]] : []),
        ]

        deductionItems.forEach(([label, amount]) => {
            doc.text(label, 25, yPos)
            doc.text(amount.toFixed(2), 185, yPos, { align: 'right' })
            yPos += 6
        })

        doc.line(20, yPos, 190, yPos)
        yPos += 5
        doc.setFont('helvetica', 'bold')
        doc.text('Total Deductions', 25, yPos)
        doc.text(result.deductions.total.toFixed(2), 185, yPos, { align: 'right' })
        yPos += 10

        // Net Salary
        doc.setFontSize(12)
        doc.line(20, yPos, 190, yPos)
        yPos += 8
        doc.text('NET SALARY', 25, yPos)
        doc.text(`₹ ${result.netSalary.toFixed(2)}`, 185, yPos, { align: 'right' })
        doc.line(20, yPos + 2, 190, yPos + 2)

        // Footer
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 280, { align: 'center' })

        doc.save('payslip-traditional.pdf')
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">💰 Payslip Calculator</h1>
                    <p className="card-subtitle">Maharashtra Government Employee Payslip Generator</p>
                </div>

                <div className="card-body">
                    <form onSubmit={(e) => { e.preventDefault(); calculatePayslip(); }}>
                        {/* Basic Information */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="form-group">
                                <label className="form-label form-label-required">Employee Type</label>
                                <select
                                    name="employeeType"
                                    value={formData.employeeType}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="GPF">GPF</option>
                                    <option value="NPS">NPS</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Basic Salary (₹)</label>
                                <input
                                    type="number"
                                    name="basicSalary"
                                    value={formData.basicSalary}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter basic salary"
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

                            <div className="form-group">
                                <label className="form-label form-label-required">Pay Scale / Grade</label>
                                <select
                                    name="payScale"
                                    value={formData.payScale}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="S-1 to S-6">S-1 to S-6 (Lower Grade)</option>
                                    <option value="S-7 to S-19">S-7 to S-19 (Middle Grade)</option>
                                    <option value="S-20 to S-23">S-20 to S-23 (Higher Grade)</option>
                                </select>
                                <span className="form-help text-xs text-blue-600">
                                    *If S-1 to S-6 salary {'>='} 24,200, higher TA applies automatically.
                                </span>
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">City</label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="">Select City</option>
                                    {Object.keys(cities).map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">City Category</label>
                                <input
                                    type="text"
                                    name="cityCategory"
                                    value={formData.cityCategory}
                                    className="form-input"
                                    disabled
                                />
                                <span className="form-help">Auto-detected based on city</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Employee Class</label>
                                <select
                                    name="employeeClass"
                                    value={formData.employeeClass}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="1">Class 1</option>
                                    <option value="2">Class 2</option>
                                    <option value="3">Class 3</option>
                                    <option value="4">Class 4</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Per TA (₹)</label>
                                <input
                                    type="number"
                                    name="perTA"
                                    value={formData.perTA}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group flex items-center">
                                <input
                                    type="checkbox"
                                    name="isHandicap"
                                    checked={formData.isHandicap}
                                    onChange={handleInputChange}
                                    id="handicap"
                                    style={{ width: 'auto', marginRight: '10px' }}
                                />
                                <label htmlFor="handicap" className="form-label" style={{ marginBottom: 0 }}>
                                    Handicap Status
                                </label>
                            </div>
                        </div>

                        {/* Additional Allowances */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Additional Allowances</h3>
                                <button type="button" onClick={addAllowance} className="btn btn-sm btn-primary">
                                    + Add Allowance
                                </button>
                            </div>

                            {additionalAllowances.map((allowance, index) => (
                                <div key={index} className="grid grid-cols-3 gap-4 mb-3">
                                    <div className="form-group">
                                        <select
                                            value={allowance.type}
                                            onChange={(e) => updateAllowance(index, 'type', e.target.value)}
                                            className="form-select"
                                        >
                                            <option value="NPA">NPA (35% of Basic)</option>
                                            <option value="Other">Other Allowance</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="number"
                                            value={allowance.amount}
                                            onChange={(e) => updateAllowance(index, 'amount', e.target.value)}
                                            className="form-input"
                                            placeholder="Amount"
                                            disabled={allowance.type === 'NPA'}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <button
                                            type="button"
                                            onClick={() => removeAllowance(index)}
                                            className="btn btn-error btn-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Deductions */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-4">Deductions</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label className="form-label">GPF Subscription (₹)</label>
                                    <input
                                        type="number"
                                        name="gpfSubscription"
                                        value={formData.gpfSubscription}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">GPF Recovery (₹)</label>
                                    <input
                                        type="number"
                                        name="gpfRecovery"
                                        value={formData.gpfRecovery}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Festival Advance (₹)</label>
                                    <input
                                        type="number"
                                        name="festivalAdvance"
                                        value={formData.festivalAdvance}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Other Advances (₹)</label>
                                    <input
                                        type="number"
                                        name="otherAdvances"
                                        value={formData.otherAdvances}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Other Recovery (₹)</label>
                                    <input
                                        type="number"
                                        name="otherRecovery"
                                        value={formData.otherRecovery}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Income Tax (₹)</label>
                                    <input
                                        type="number"
                                        name="incomeTax"
                                        value={formData.incomeTax}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button type="submit" className="btn btn-primary btn-lg">
                                Calculate Payslip
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results */}
            {result && (
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
                        <button onClick={downloadModernPDF} className="btn btn-primary">
                            Download Modern PDF
                        </button>
                        <button onClick={downloadTraditionalPDF} className="btn btn-secondary">
                            Download Traditional PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PayslipCalculator
