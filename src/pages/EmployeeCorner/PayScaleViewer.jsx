import React, { useState } from 'react'

function PayScaleViewer() {
    const [selectedLevel, setSelectedLevel] = useState(1)

    // Maharashtra State 7th Pay Commission Matrix
    const payMatrix = {
        1: { basePay: 15000, gradePay: "1300" },
        2: { basePay: 15300, gradePay: "1400" },
        3: { basePay: 16600, gradePay: "1600" },
        4: { basePay: 17100, gradePay: "1650 & 1700" },
        5: { basePay: 18000, gradePay: "1800" },
        6: { basePay: 19900, gradePay: "1900" },
        7: { basePay: 21700, gradePay: "2000" },
        8: { basePay: 25500, gradePay: "2400" },
        9: { basePay: 26400, gradePay: "2500" },
        10: { basePay: 29200, gradePay: "2800" },
        11: { basePay: 30100, gradePay: "2900 & 3000" },
        12: { basePay: 32000, gradePay: "3500" },
        13: { basePay: 35400, gradePay: "4100 & 4200" },
        14: { basePay: 38600, gradePay: "4300" },
        15: { basePay: 41800, gradePay: "4400" },
        16: { basePay: 44900, gradePay: "4500 & 4600" },
        17: { basePay: 47600, gradePay: "4800" },
        18: { basePay: 49100, gradePay: "4900 & 5000" },
        19: { basePay: 55100, gradePay: "5000" },
        20: { basePay: 56100, gradePay: "5400" },
    }

    const calculateIncrements = (basePay) => {
        const increments = [basePay]
        let currentPay = basePay

        for (let i = 1; i <= 40; i++) { // Extended to 40 years as per state norms often
            // Next Pay = round((currentPay × 1.03) / 100) × 100
            const nextPay = Math.round((currentPay * 1.03) / 100) * 100
            increments.push(nextPay)
            currentPay = nextPay
        }

        return increments
    }

    const levelData = payMatrix[selectedLevel]
    const increments = calculateIncrements(levelData.basePay)

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">📊 Pay Scale Viewer</h1>
                    <p className="card-subtitle">Maharashtra State 7th Pay Commission Pay Matrix</p>
                </div>

                <div className="card-body">
                    {/* Level Selector */}
                    {/* Level Selector */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Select Pay Level</h3>

                        {/* CSS Grid for Chunked Layout */}
                        <div className="flex flex-col gap-4">
                            {(() => {
                                const keys = Object.keys(payMatrix);
                                const chunks = [];
                                for (let i = 0; i < keys.length; i += 5) {
                                    chunks.push(keys.slice(i, i + 5));
                                }

                                return chunks.map((chunk, chunkIndex) => (
                                    <div key={chunkIndex} className="border border-neutral-900 select-none">
                                        {/* Row 1: Grade Pay (Pink) */}
                                        <div className="grid grid-cols-5 divide-x divide-neutral-900 border-b border-neutral-900">
                                            {chunk.map(level => (
                                                <div
                                                    key={`gp-${level}`}
                                                    onClick={() => setSelectedLevel(parseInt(level))}
                                                    style={{ backgroundColor: '#f4cccc' }}
                                                    className={`py-1 px-1 text-center font-bold text-sm flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity ${selectedLevel === parseInt(level) ? 'ring-inset ring-2 ring-black z-10' : ''}`}
                                                >
                                                    {payMatrix[level].gradePay}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Row 2: Level (Blue) */}
                                        <div className="grid grid-cols-5 divide-x divide-neutral-900 border-b border-neutral-900">
                                            {chunk.map(level => (
                                                <div
                                                    key={`lvl-${level}`}
                                                    onClick={() => setSelectedLevel(parseInt(level))}
                                                    style={{ backgroundColor: '#cfe2f3' }}
                                                    className={`py-1 text-center font-bold text-base cursor-pointer hover:opacity-80 transition-opacity ${selectedLevel === parseInt(level) ? 'ring-inset ring-2 ring-black z-10' : ''}`}
                                                >
                                                    S-{level}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Row 3: Basic Pay (White) */}
                                        <div className="grid grid-cols-5 divide-x divide-neutral-900">
                                            {chunk.map(level => (
                                                <div
                                                    key={`bp-${level}`}
                                                    onClick={() => setSelectedLevel(parseInt(level))}
                                                    style={{ backgroundColor: '#ffffff' }}
                                                    className={`py-1 text-center font-bold text-base text-neutral-900 cursor-pointer hover:opacity-80 transition-opacity ${selectedLevel === parseInt(level) ? 'ring-inset ring-2 ring-black z-10' : ''}`}
                                                >
                                                    {payMatrix[level].basePay}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>

                    {/* Level Details */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
                            <div className="text-primary-600 font-semibold mb-2">Pay Level</div>
                            <div className="text-3xl font-bold text-primary-700">S-{selectedLevel}</div>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl">
                            <div className="text-secondary-600 font-semibold mb-2">Base Pay</div>
                            <div className="text-3xl font-bold text-secondary-700">₹ {levelData.basePay.toLocaleString()}</div>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl">
                            <div className="text-accent-600 font-semibold mb-2">Grade Pay</div>
                            <div className="text-3xl font-bold text-accent-700">₹ {levelData.gradePay}</div>
                        </div>
                    </div>

                    {/* Increment Table */}
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Increment Number</th>
                                    <th>Pay Amount (₹)</th>
                                    <th>Increment (₹)</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {increments.map((pay, index) => (
                                    <tr key={index}>
                                        <td>{index === 0 ? 'Base' : index}</td>
                                        <td>{index === 0 ? 'Initial' : `Increment ${index}`}</td>
                                        <td className="font-semibold">₹ {pay.toLocaleString()}</td>
                                        <td>
                                            {index === 0 ? '-' : `₹ ${(pay - increments[index - 1]).toLocaleString()}`}
                                        </td>
                                        <td>
                                            {index === 0 ? '-' : '3%'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Information Box */}
                    <div className="mt-8 p-6 bg-info-light border-l-4 border-info rounded-lg">
                        <h4 className="font-semibold text-info mb-2">ℹ️ Increment Calculation Formula</h4>
                        <p className="text-sm text-neutral-700">
                            Next Pay = round((Current Pay × 1.03) / 100) × 100
                        </p>
                        <p className="text-sm text-neutral-700 mt-2">
                            Each increment is 3% of the current pay, rounded to the nearest hundred.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PayScaleViewer
