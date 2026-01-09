import React, { useState } from 'react'

function CooperativeSocietyCalculator() {
    const [formData, setFormData] = useState({
        shareCapital: '',
        dividendRate: '',
        monthlyContribution: '',
        contributionInterestRate: '',
        contributionTenure: '',
        loanAmount: 0,
        loanInterestRate: 0,
        loanTenure: 0
    })

    const [result, setResult] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const calculateSociety = () => {
        const shareCapital = parseFloat(formData.shareCapital) || 0
        const dividendRate = parseFloat(formData.dividendRate) || 0
        const monthlyContribution = parseFloat(formData.monthlyContribution) || 0
        const contributionInterestRate = parseFloat(formData.contributionInterestRate) || 0
        const contributionTenure = parseFloat(formData.contributionTenure) || 0
        const loanAmount = parseFloat(formData.loanAmount) || 0
        const loanInterestRate = parseFloat(formData.loanInterestRate) || 0
        const loanTenure = parseFloat(formData.loanTenure) || 0

        // Dividend on Share Capital
        const annualDividend = shareCapital * (dividendRate / 100)

        // Monthly Contribution Maturity (using SIP formula)
        const r = contributionInterestRate / 100 / 12
        const n = contributionTenure * 12
        let contributionMaturity = 0

        if (r > 0) {
            contributionMaturity = monthlyContribution * (((Math.pow(1 + r, n) - 1) / r) * (1 + r))
        } else {
            contributionMaturity = monthlyContribution * n
        }

        const totalContributed = monthlyContribution * n

        // Loan EMI Calculation
        let loanEMI = 0
        let totalLoanPayment = 0
        let totalLoanInterest = 0

        if (loanAmount > 0 && loanTenure > 0) {
            const loanR = loanInterestRate / 100 / 12
            const loanN = loanTenure * 12

            if (loanR > 0) {
                loanEMI = (loanAmount * loanR * Math.pow(1 + loanR, loanN)) / (Math.pow(1 + loanR, loanN) - 1)
            } else {
                loanEMI = loanAmount / loanN
            }

            totalLoanPayment = loanEMI * loanN
            totalLoanInterest = totalLoanPayment - loanAmount
        }

        setResult({
            shareCapital,
            annualDividend,
            monthlyDividend: annualDividend / 12,
            monthlyContribution,
            totalContributed,
            contributionMaturity,
            contributionReturns: contributionMaturity - totalContributed,
            loanAmount,
            loanEMI,
            totalLoanPayment,
            totalLoanInterest,
            contributionTenure,
            loanTenure
        })
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">🤝 Cooperative Society Calculator</h1>
                    <p className="card-subtitle">Calculate Share Dividend, Contributions & Society Loans</p>
                </div>

                <div className="card-body">
                    <form onSubmit={(e) => { e.preventDefault(); calculateSociety(); }}>
                        {/* Share Capital Section */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-4">Share Capital & Dividend</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="form-group">
                                    <label className="form-label form-label-required">Share Capital (₹)</label>
                                    <input
                                        type="number"
                                        name="shareCapital"
                                        value={formData.shareCapital}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter share capital"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label form-label-required">Dividend Rate (% per annum)</label>
                                    <input
                                        type="number"
                                        name="dividendRate"
                                        value={formData.dividendRate}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        step="0.01"
                                        placeholder="Enter dividend rate"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Monthly Contribution Section */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-4">Monthly Contribution</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="form-group">
                                    <label className="form-label form-label-required">Monthly Contribution (₹)</label>
                                    <input
                                        type="number"
                                        name="monthlyContribution"
                                        value={formData.monthlyContribution}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter monthly amount"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label form-label-required">Interest Rate (% p.a.)</label>
                                    <input
                                        type="number"
                                        name="contributionInterestRate"
                                        value={formData.contributionInterestRate}
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
                                        name="contributionTenure"
                                        value={formData.contributionTenure}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter tenure"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Society Loan Section */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-4">Society Loan (Optional)</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="form-group">
                                    <label className="form-label">Loan Amount (₹)</label>
                                    <input
                                        type="number"
                                        name="loanAmount"
                                        value={formData.loanAmount}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Loan Interest Rate (% p.a.)</label>
                                    <input
                                        type="number"
                                        name="loanInterestRate"
                                        value={formData.loanInterestRate}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        step="0.01"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Loan Tenure (Years)</label>
                                    <input
                                        type="number"
                                        name="loanTenure"
                                        value={formData.loanTenure}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button type="submit" className="btn btn-primary btn-lg">
                                Calculate
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="card mt-8 animate-fade-in">
                    <div className="card-header">
                        <h2 className="card-title">Society Calculation Results</h2>
                    </div>

                    <div className="card-body">
                        {/* Share Dividend */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4 text-primary-600">Share Dividend</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
                                    <div className="text-primary-600 font-semibold mb-2">Share Capital</div>
                                    <div className="text-3xl font-bold text-primary-700">₹ {result.shareCapital.toLocaleString('en-IN')}</div>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl">
                                    <div className="text-accent-600 font-semibold mb-2">Annual Dividend</div>
                                    <div className="text-3xl font-bold text-accent-700">₹ {result.annualDividend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl">
                                    <div className="text-secondary-600 font-semibold mb-2">Monthly Dividend</div>
                                    <div className="text-3xl font-bold text-secondary-700">₹ {result.monthlyDividend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Contribution */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4 text-success">Monthly Contribution Maturity</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="p-6 bg-gradient-to-br from-success-light to-green-100 rounded-xl">
                                    <div className="text-success font-semibold mb-2">Total Contributed</div>
                                    <div className="text-3xl font-bold text-success">₹ {result.totalContributed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                    <div className="text-xs text-neutral-600 mt-1">Over {result.contributionTenure} years</div>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-success-light to-green-100 rounded-xl">
                                    <div className="text-success font-semibold mb-2">Returns Earned</div>
                                    <div className="text-3xl font-bold text-success">₹ {result.contributionReturns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-success-light to-green-100 rounded-xl">
                                    <div className="text-success font-semibold mb-2">Maturity Amount</div>
                                    <div className="text-3xl font-bold text-success">₹ {result.contributionMaturity.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                </div>
                            </div>
                        </div>

                        {/* Loan Details */}
                        {result.loanAmount > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-error">Society Loan</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="p-6 bg-gradient-to-br from-error-light to-red-100 rounded-xl">
                                        <div className="text-error font-semibold mb-2">Monthly EMI</div>
                                        <div className="text-3xl font-bold text-error">₹ {result.loanEMI.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-br from-error-light to-red-100 rounded-xl">
                                        <div className="text-error font-semibold mb-2">Total Interest</div>
                                        <div className="text-3xl font-bold text-error">₹ {result.totalLoanInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-br from-error-light to-red-100 rounded-xl">
                                        <div className="text-error font-semibold mb-2">Total Payment</div>
                                        <div className="text-3xl font-bold text-error">₹ {result.totalLoanPayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Net Position */}
                        <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white">
                            <h3 className="text-xl font-semibold mb-4">Net Financial Position</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-blue-100 mb-1">Total Inflows</div>
                                    <div className="text-2xl font-bold">
                                        ₹ {(result.contributionMaturity + result.annualDividend * result.contributionTenure).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-xs text-blue-100 mt-1">Contributions + Dividends</div>
                                </div>
                                {result.loanAmount > 0 && (
                                    <div>
                                        <div className="text-blue-100 mb-1">Total Outflows</div>
                                        <div className="text-2xl font-bold">
                                            ₹ {result.totalLoanPayment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </div>
                                        <div className="text-xs text-blue-100 mt-1">Loan Repayment</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CooperativeSocietyCalculator
