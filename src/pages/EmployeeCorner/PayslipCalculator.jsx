import React, { useState } from 'react';
import { CITIES, calculatePayslipLogic } from '../../utils/payslipCalculations';
import PayslipResults from './components/Payslip/PayslipResults';

function PayslipCalculator() {
    const [formData, setFormData] = useState({
        employeeType: 'GPF', basicSalary: '', payScale: 'S-7 to S-19', daRate: 55, city: '',
        cityCategory: 'X', isHandicap: false, employeeClass: '1', perTA: 0,
        gpfSubscription: 0, gpfRecovery: 0, festivalAdvance: 0, otherAdvances: 0,
        otherRecovery: 0, incomeTax: 0,
    });

    const [additionalAllowances, setAdditionalAllowances] = useState([]);
    const [result, setResult] = useState(null);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

        if (name === 'city' && CITIES[value]) {
            setFormData(prev => ({ ...prev, city: value, cityCategory: CITIES[value].category }));
        }
    };

    const addAllowance = () => setAdditionalAllowances([...additionalAllowances, { type: 'NPA', amount: 0 }]);
    const updateAllowance = (index, field, value) => {
        const updated = [...additionalAllowances];
        updated[index][field] = value;
        setAdditionalAllowances(updated);
    };
    const removeAllowance = (index) => setAdditionalAllowances(additionalAllowances.filter((_, i) => i !== index));

    const calculatePayslip = () => {
        const generatedResult = calculatePayslipLogic(formData, additionalAllowances);
        setResult(generatedResult);
    };

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">💰 Payslip Calculator</h1>
                    <p className="card-subtitle">Maharashtra Government Employee Payslip Generator</p>
                </div>

                <div className="card-body">
                    <form onSubmit={(e) => { e.preventDefault(); calculatePayslip(); }}>
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="form-group">
                                <label className="form-label form-label-required">Employee Type</label>
                                <select name="employeeType" value={formData.employeeType} onChange={handleInputChange} className="form-select" required>
                                    <option value="GPF">GPF</option>
                                    <option value="NPS">NPS</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Basic Salary (₹)</label>
                                <input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleInputChange} className="form-input" placeholder="Enter basic salary" required />
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">DA Rate (%)</label>
                                <input type="number" name="daRate" value={formData.daRate} onChange={handleInputChange} className="form-input" step="0.01" required />
                                <span className="form-help">Current DA Rate: 55%</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Pay Scale / Grade</label>
                                <select name="payScale" value={formData.payScale} onChange={handleInputChange} className="form-select" required>
                                    <option value="S-1 to S-6">S-1 to S-6 (Lower Grade)</option>
                                    <option value="S-7 to S-19">S-7 to S-19 (Middle Grade)</option>
                                    <option value="S-20 to S-23">S-20 to S-23 (Higher Grade)</option>
                                </select>
                                <span className="form-help text-xs text-blue-600">*If S-1 to S-6 salary {'>='} 24,200, higher TA applies automatically.</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">City</label>
                                <select name="city" value={formData.city} onChange={handleInputChange} className="form-select" required>
                                    <option value="">Select City</option>
                                    {Object.keys(CITIES).map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">City Category</label>
                                <input type="text" name="cityCategory" value={formData.cityCategory} className="form-input" disabled />
                                <span className="form-help">Auto-detected based on city</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">Employee Class</label>
                                <select name="employeeClass" value={formData.employeeClass} onChange={handleInputChange} className="form-select" required>
                                    <option value="1">Class 1</option>
                                    <option value="2">Class 2</option>
                                    <option value="3">Class 3</option>
                                    <option value="4">Class 4</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Per TA (₹)</label>
                                <input type="number" name="perTA" value={formData.perTA} onChange={handleInputChange} className="form-input" placeholder="0" />
                            </div>

                            <div className="form-group flex items-center">
                                <input type="checkbox" name="isHandicap" checked={formData.isHandicap} onChange={handleInputChange} id="handicap" style={{ width: 'auto', marginRight: '10px' }} />
                                <label htmlFor="handicap" className="form-label" style={{ marginBottom: 0 }}>Handicap Status</label>
                            </div>
                        </div>

                        {/* Additional Allowances */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Additional Allowances</h3>
                                <button type="button" onClick={addAllowance} className="btn btn-sm btn-primary">+ Add Allowance</button>
                            </div>

                            {additionalAllowances.map((allowance, index) => (
                                <div key={index} className="grid grid-cols-3 gap-4 mb-3">
                                    <div className="form-group">
                                        <select value={allowance.type} onChange={(e) => updateAllowance(index, 'type', e.target.value)} className="form-select">
                                            <option value="NPA">NPA (35% of Basic)</option>
                                            <option value="Other">Other Allowance</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <input type="number" value={allowance.amount} onChange={(e) => updateAllowance(index, 'amount', e.target.value)} className="form-input" placeholder="Amount" disabled={allowance.type === 'NPA'} />
                                    </div>
                                    <div className="form-group">
                                        <button type="button" onClick={() => removeAllowance(index)} className="btn btn-error btn-sm">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Deductions */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-4">Deductions</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="form-group"><label className="form-label">GPF Subscription (₹)</label><input type="number" name="gpfSubscription" value={formData.gpfSubscription} onChange={handleInputChange} className="form-input" placeholder="0" /></div>
                                <div className="form-group"><label className="form-label">GPF Recovery (₹)</label><input type="number" name="gpfRecovery" value={formData.gpfRecovery} onChange={handleInputChange} className="form-input" placeholder="0" /></div>
                                <div className="form-group"><label className="form-label">Festival Advance (₹)</label><input type="number" name="festivalAdvance" value={formData.festivalAdvance} onChange={handleInputChange} className="form-input" placeholder="0" /></div>
                                <div className="form-group"><label className="form-label">Other Advances (₹)</label><input type="number" name="otherAdvances" value={formData.otherAdvances} onChange={handleInputChange} className="form-input" placeholder="0" /></div>
                                <div className="form-group"><label className="form-label">Other Recovery (₹)</label><input type="number" name="otherRecovery" value={formData.otherRecovery} onChange={handleInputChange} className="form-input" placeholder="0" /></div>
                                <div className="form-group"><label className="form-label">Income Tax (₹)</label><input type="number" name="incomeTax" value={formData.incomeTax} onChange={handleInputChange} className="form-input" placeholder="0" /></div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <button type="submit" className="btn btn-primary btn-lg">Calculate Payslip</button>
                        </div>
                    </form>
                </div>
            </div>

            <PayslipResults result={result} />
        </div>
    );
}

export default PayslipCalculator;
