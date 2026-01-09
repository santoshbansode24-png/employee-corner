import React, { useState } from 'react'

function SIPCalculator() {
    const [formData, setFormData] = useState({
        monthlyInvestment: '',
        expectedReturn: 12,
        timePeriod: '',
        stepUpPercentage: 0
    })

    const [result, setResult] = useState(null)
    const [viewMode, setViewMode] = useState('yearly') // 'monthly' or 'yearly'

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const calculateSIP = () => {
        const P = parseFloat(formData.monthlyInvestment) || 0
        const r = (parseFloat(formData.expectedReturn) || 0) / 100 / 12 // Monthly rate
        const n = (parseFloat(formData.timePeriod) || 0) * 12 // Total months
        const stepUp = parseFloat(formData.stepUpPercentage) || 0

        let monthlyData = []
        let yearlyData = []
        let totalInvested = 0
        let currentMonthlyInvestment = P
        let currentValue = 0

        for (let month = 1; month <= n; month++) {
            // Apply step-up annually
            if (month > 1 && (month - 1) % 12 === 0 && stepUp > 0) {
                currentMonthlyInvestment = currentMonthlyInvestment * (1 + stepUp / 100)
            }

            totalInvested += currentMonthlyInvestment
            currentValue = (currentValue + currentMonthlyInvestment) * (1 + r)

            monthlyData.push({
                month,
                year: Math.ceil(month / 12),
                investment: currentMonthlyInvestment,
                totalInvested,
                currentValue,
                returns: currentValue - totalInvested
            })

            // Aggregate yearly data
            if (month % 12 === 0 || month === n) {
                const year = Math.ceil(month / 12)
                yearlyData.push({
                    year,
                    totalInvested,
                    currentValue,
                    returns: currentValue - totalInvested
                })
            }
        }

        const finalValue = currentValue
        const totalReturns = finalValue - totalInvested

        setResult({
            totalInvested,
            finalValue,
            totalReturns,
            monthlyData,
            yearlyData
        })
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">📈 SIP Calculator</h1>
                    <p className="card-subtitle">Systematic Investment Plan Calculator</p>
                </div>

                <div className="card-body">
                    <form onSubmit={(e) => { e.preventDefault(); calculateSIP(); }}>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="form-label form-label-required">Monthly Investment (₹)</label>
                                <input
                                    type="number"
                                    name="monthlyInvestment"
                                    value={formData.monthlyInvestment}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter monthly investment"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Expected Return (% per annum)</label>
                                <input
                                    type="number"
                                    name="expectedReturn"
                                    value={formData.expectedReturn}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    step="0.1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Time Period (Years)</label>
                                <input
                                    type="number"
                                    name="timePeriod"
                                    value={formData.timePeriod}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Enter time period"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Step-Up Percentage (% per year)</label>
                                <input
                                    type="number"
                                    name="stepUpPercentage"
                                    value={formData.stepUpPercentage}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    step="0.1"
                                    placeholder="0"
                                />
                                <span className="form-help">Annual increase in SIP amount</span>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button type="submit" className="btn btn-primary btn-lg">
                                Calculate SIP
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="card mt-8 animate-fade-in">
                    <div className="card-header">
                        <h2 className="card-title">SIP Calculation Results</h2>
                    </div>

                    <div className="card-body">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
                                <div className="text-primary-600 font-semibold mb-2">Total Invested</div>
                                <div className="text-3xl font-bold text-primary-700">₹ {result.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl">
                                <div className="text-accent-600 font-semibold mb-2">Total Returns</div>
                                <div className="text-3xl font-bold text-accent-700">₹ {result.totalReturns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl">
                                <div className="text-secondary-600 font-semibold mb-2">Final Value</div>
                                <div className="text-3xl font-bold text-secondary-700">₹ {result.finalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                            </div>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setViewMode('yearly')}
                                className={`btn ${viewMode === 'yearly' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                Yearly View
                            </button>
                            <button
                                onClick={() => setViewMode('monthly')}
                                className={`btn ${viewMode === 'monthly' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                Monthly View
                            </button>
                        </div>

                        {/* Data Table */}
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {viewMode === 'yearly' ? (
                                            <>
                                                <th>Year</th>
                                                <th>Total Invested (₹)</th>
                                                <th>Current Value (₹)</th>
                                                <th>Returns (₹)</th>
                                            </>
                                        ) : (
                                            <>
                                                <th>Month</th>
                                                <th>Year</th>
                                                <th>Monthly Investment (₹)</th>
                                                <th>Total Invested (₹)</th>
                                                <th>Current Value (₹)</th>
                                                <th>Returns (₹)</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewMode === 'yearly' ? (
                                        result.yearlyData.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.year}</td>
                                                <td>₹ {row.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                <td>₹ {row.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                <td className="text-success">₹ {row.returns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        result.monthlyData.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.month}</td>
                                                <td>{row.year}</td>
                                                <td>₹ {row.investment.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                <td>₹ {row.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                <td>₹ {row.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                <td className="text-success">₹ {row.returns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SIPCalculator
