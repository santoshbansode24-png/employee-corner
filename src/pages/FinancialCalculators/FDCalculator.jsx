import React, { useState } from 'react'

function FDCalculator() {
    const [formData, setFormData] = useState({
        principal: '',
        interestRate: '',
        tenure: '',
        compounding: 'quarterly'
    })

    const [result, setResult] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const calculateFD = () => {
        const P = parseFloat(formData.principal) || 0
        const r = (parseFloat(formData.interestRate) || 0) / 100
        const t = parseFloat(formData.tenure) || 0

        // Compounding frequency
        const compoundingFrequency = {
            'annually': 1,
            'semi-annually': 2,
            'quarterly': 4,
            'monthly': 12
        }

        const k = compoundingFrequency[formData.compounding]

        // A = P × (1 + r/k)^(k×t)
        const maturityAmount = P * Math.pow((1 + r / k), k * t)
        const interestEarned = maturityAmount - P

        setResult({
            principal: P,
            maturityAmount,
            interestEarned,
            tenure: t,
            interestRate: formData.interestRate,
            compounding: formData.compounding
        })
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">🏛️ Fixed Deposit Calculator</h1>
                    <p className="card-subtitle">Calculate FD Returns with Compound Interest</p>
                </div>

                <div className="card-body">
                    <form onSubmit={(e) => { e.preventDefault(); calculateFD(); }}>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label form-label-required">Principal Amount (₹)</label>
                                <input
                                    type="number"
                                    name="principal"
                                    value={formData.principal}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter principal amount"
                                    required
                                />
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
                                <label className="form-label form-label-required">Tenure (Years)</label>
                                <input
                                    type="number"
                                    name="tenure"
                                    value={formData.tenure}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    step="0.1"
                                    placeholder="Enter tenure"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Compounding Frequency</label>
                                <select
                                    name="compounding"
                                    value={formData.compounding}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="annually">Annually</option>
                                    <option value="semi-annually">Semi-Annually</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button type="submit" className="btn btn-primary btn-lg">
                                Calculate FD
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="card mt-8 animate-fade-in">
                    <div className="card-header">
                        <h2 className="card-title">FD Calculation Results</h2>
                    </div>

                    <div className="card-body">
                        <div className="grid grid-cols-3 gap-6">
                            <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
                                <div className="text-primary-600 font-semibold mb-2">Principal Amount</div>
                                <div className="text-3xl font-bold text-primary-700">₹ {result.principal.toLocaleString('en-IN')}</div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl">
                                <div className="text-accent-600 font-semibold mb-2">Interest Earned</div>
                                <div className="text-3xl font-bold text-accent-700">₹ {result.interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl">
                                <div className="text-secondary-600 font-semibold mb-2">Maturity Amount</div>
                                <div className="text-3xl font-bold text-secondary-700">₹ {result.maturityAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-neutral-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Investment Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Tenure:</span>
                                    <span className="font-semibold">{result.tenure} years</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Interest Rate:</span>
                                    <span className="font-semibold">{result.interestRate}% p.a.</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Compounding:</span>
                                    <span className="font-semibold capitalize">{result.compounding}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Effective Return:</span>
                                    <span className="font-semibold text-success">
                                        {((result.interestEarned / result.principal) * 100).toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FDCalculator
