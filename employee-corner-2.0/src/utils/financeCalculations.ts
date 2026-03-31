interface SIPFormData {
    monthlyInvestment: string | number;
    expectedReturn: string | number;
    timePeriod: string | number;
    stepUpPercentage: string | number;
}

export interface SIPResultData {
    month?: number;
    year: number;
    investment?: number;
    totalInvested: number;
    currentValue: number;
    returns: number;
}

export interface SIPResult {
    totalInvested: number;
    finalValue: number;
    totalReturns: number;
    monthlyData: SIPResultData[];
    yearlyData: SIPResultData[];
}

export const calculateSIPLogic = (formData: SIPFormData): SIPResult => {
    const P = parseFloat(formData.monthlyInvestment as string) || 0;
    const r = (parseFloat(formData.expectedReturn as string) || 0) / 100 / 12; // Monthly rate
    const n = (parseFloat(formData.timePeriod as string) || 0) * 12; // Total months
    const stepUp = parseFloat(formData.stepUpPercentage as string) || 0;

    const monthlyData: SIPResultData[] = [];
    const yearlyData: SIPResultData[] = [];
    let totalInvested = 0;
    let currentMonthlyInvestment = P;
    let currentValue = 0;

    for (let month = 1; month <= n; month++) {
        // Apply step-up annually
        if (month > 1 && (month - 1) % 12 === 0 && stepUp > 0) {
            currentMonthlyInvestment = currentMonthlyInvestment * (1 + stepUp / 100);
        }

        totalInvested += currentMonthlyInvestment;
        currentValue = (currentValue + currentMonthlyInvestment) * (1 + r);

        monthlyData.push({
            month,
            year: Math.ceil(month / 12),
            investment: currentMonthlyInvestment,
            totalInvested,
            currentValue,
            returns: currentValue - totalInvested
        });

        // Aggregate yearly data
        if (month % 12 === 0 || month === n) {
            const year = Math.ceil(month / 12);
            yearlyData.push({
                year,
                totalInvested,
                currentValue,
                returns: currentValue - totalInvested
            });
        }
    }

    const finalValue = currentValue;
    const totalReturns = finalValue - totalInvested;

    return {
        totalInvested,
        finalValue,
        totalReturns,
        monthlyData,
        yearlyData
    };
};
