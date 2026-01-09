import React, { useState } from 'react'

function LoanEMICalculator() {
    const [formData, setFormData] = useState({
        loanAmount: '',
        interestRate: '',
        tenure: ''
    })

    const [result, setResult] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const calculateEMI = () => {
        const P = parseFloat(formData.loanAmount) || 0
        const r = (parseFloat(formData.interestRate) || 0) / 100 / 12 // Monthly interest rate
        const n = (parseFloat(formData.tenure) || 0) * 12 // Total months

        // EMI = P × r × (1+r)^n / ((1+r)^n − 1)
        const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        const totalPayment = emi * n
        const totalInterest = totalPayment - P

        // Generate amortization schedule
        let balance = P
        const schedule = []

        for (let month = 1; month <= n; month++) {
            const interestPayment = balance * r
            const principalPayment = emi - interestPayment
            balance -= principalPayment

            schedule.push({
                month,
                emi: emi,
                principal: principalPayment,
                interest: interestPayment,
                balance: Math.max(balance, 0)
            })
        }

        setResult({
            emi,
            totalPayment,
            totalInterest,
            loanAmount: P,
            schedule
        })
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">🏠 Loan EMI Calculator</h1>
                    <p className="card-subtitle">Calculate Monthly EMI for Home, Car, or Personal Loans</p>
                </div>

                <div className="card-body">
                    <form onSubmit={(e) => { e.preventDefault(); calculateEMI(); }}>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label form-label-required">Loan Amount (₹)</label>
                                <input
                                    type="number"
                                    name="loanAmount"
                                    value={formData.loanAmount}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter loan amount"
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
                                Calculate EMI
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="card mt-8 animate-fade-in">
                    <div className="card-header">
                        <h2 className="card-title">EMI Calculation Results</h2>
                    </div>

                    <div className="card-body">
                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
                                <div className="text-primary-600 font-semibold mb-2">Monthly EMI</div>
                                <div className="text-3xl font-bold text-primary-700">₹ {result.emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-error-light to-red-100 rounded-xl">
                                <div className="text-error font-semibold mb-2">Total Interest</div>
                                <div className="text-3xl font-bold text-error">₹ {result.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl">
                                <div className="text-secondary-600 font-semibold mb-2">Total Payment</div>
                                <div className="text-3xl font-bold text-secondary-700">₹ {result.totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                            </div>
                        </div>

                        <div className="p-6 bg-neutral-50 rounded-lg mb-8">
                            <h3 className="text-lg font-semibold mb-4">Loan Summary</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Principal Amount:</span>
                                    <span className="font-semibold">₹ {result.loanAmount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Total Interest:</span>
                                    <span className="font-semibold text-error">₹ {result.totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Interest Percentage:</span>
                                    <span className="font-semibold">
                                        {((result.totalInterest / result.loanAmount) * 100).toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Amortization Schedule (First 12 months) */}
                        <div className="table-container">
                            <h3 className="text-lg font-semibold mb-4">Amortization Schedule (First Year)</h3>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>EMI (₹)</th>
                                        <th>Principal (₹)</th>
                                        <th>Interest (₹)</th>
                                        <th>Balance (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.schedule.slice(0, 12).map((row) => (
                                        <tr key={row.month}>
                                            <td>{row.month}</td>
                                            <td>₹ {row.emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                            <td>₹ {row.principal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                            <td>₹ {row.interest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                            <td>₹ {row.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LoanEMICalculator
