import React, { useState } from 'react'

function LoanEligibilityCalculator() {
    const [formData, setFormData] = useState({
        monthlyIncome: '',
        existingEMI: 0,
        interestRate: '',
        tenure: ''
    })

    const [result, setResult] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const calculateEligibility = () => {
        const monthlyIncome = parseFloat(formData.monthlyIncome) || 0
        const existingEMI = parseFloat(formData.existingEMI) || 0
        const r = (parseFloat(formData.interestRate) || 0) / 100 / 12
        const n = (parseFloat(formData.tenure) || 0) * 12

        // Max EMI = 60% of monthly income
        const maxEMI = monthlyIncome * 0.6 - existingEMI

        // Eligible Loan = EMI × [(1+r)^n − 1] / [r × (1+r)^n]
        const eligibleLoan = maxEMI * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)))

        setResult({
            monthlyIncome,
            existingEMI,
            maxEMI,
            eligibleLoan: Math.max(eligibleLoan, 0),
            interestRate: formData.interestRate,
            tenure: formData.tenure
        })
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">✅ Loan Eligibility Calculator</h1>
                    <p className="card-subtitle">Check Your Maximum Loan Eligibility</p>
                </div>

                <div className="card-body">
                    <form onSubmit={(e) => { e.preventDefault(); calculateEligibility(); }}>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label form-label-required">Monthly Income (₹)</label>
                                <input
                                    type="number"
                                    name="monthlyIncome"
                                    value={formData.monthlyIncome}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter monthly income"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Existing EMI (₹)</label>
                                <input
                                    type="number"
                                    name="existingEMI"
                                    value={formData.existingEMI}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="0"
                                />
                                <span className="form-help">Total of all existing loan EMIs</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Interest Rate (% per annum)</label>
                                <input
                                    type="number"
                                    name="interestRate"
                                    value={formData.interestRate}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    step="0.01"
                                    placeholder="Enter interest rate"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Loan Tenure (Years)</label>
                                <input
                                    type="number"
                                    name="tenure"
                                    value={formData.tenure}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter tenure"
                                    required
                                />
                            </div>
                        </div>

                        <div className="card-footer">
                            <button type="submit" className="btn btn-primary btn-lg">
                                Check Eligibility
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="card mt-8 animate-fade-in">
                    <div className="card-header">
                        <h2 className="card-title">Loan Eligibility Results</h2>
                    </div>

                    <div className="card-body">
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="p-6 bg-gradient-to-br from-success-light to-green-100 rounded-xl">
                                <div className="text-success font-semibold mb-2">Maximum Eligible Loan</div>
                                <div className="text-4xl font-bold text-success">₹ {result.eligibleLoan.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
                                <div className="text-primary-600 font-semibold mb-2">Maximum EMI (60% of Income)</div>
                                <div className="text-4xl font-bold text-primary-700">₹ {result.maxEMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                            </div>
                        </div>

                        <div className="p-6 bg-neutral-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Eligibility Breakdown</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Monthly Income:</span>
                                    <span className="font-semibold">₹ {result.monthlyIncome.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">60% of Income:</span>
                                    <span className="font-semibold">₹ {(result.monthlyIncome * 0.6).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Existing EMI:</span>
                                    <span className="font-semibold text-error">₹ {result.existingEMI.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t-2">
                                    <span className="font-bold">Available for New EMI:</span>
                                    <span className="font-bold text-success">₹ {result.maxEMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Interest Rate:</span>
                                    <span className="font-semibold">{result.interestRate}% p.a.</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Tenure:</span>
                                    <span className="font-semibold">{result.tenure} years</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-info-light border-l-4 border-info rounded-lg">
                            <h4 className="font-semibold text-info mb-2">ℹ️ Note</h4>
                            <p className="text-sm text-neutral-700">
                                Banks typically allow up to 60% of your monthly income for EMI payments.
                                The actual loan amount may vary based on your credit score, employment stability, and bank policies.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LoanEligibilityCalculator
