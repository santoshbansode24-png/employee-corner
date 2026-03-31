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

export interface FDFormData {
    principal: string | number;
    interestRate: string | number;
    tenure: string | number;
    compounding: 'annually' | 'semi-annually' | 'quarterly' | 'monthly';
}

export interface FDResult {
    principal: number;
    maturityAmount: number;
    interestEarned: number;
    tenure: number;
    interestRate: number;
    compounding: string;
}

export const calculateFDLogic = (formData: FDFormData): FDResult => {
    const P = parseFloat(formData.principal as string) || 0;
    const r = (parseFloat(formData.interestRate as string) || 0) / 100;
    const t = parseFloat(formData.tenure as string) || 0;

    const compoundingFrequency: Record<string, number> = {
        'annually': 1,
        'semi-annually': 2,
        'quarterly': 4,
        'monthly': 12
    }

    const k = compoundingFrequency[formData.compounding] || 4;

    const maturityAmount = P * Math.pow((1 + r / k), k * t);
    const interestEarned = maturityAmount - P;

    return {
        principal: P,
        maturityAmount,
        interestEarned,
        tenure: t,
        interestRate: parseFloat(formData.interestRate as string) || 0,
        compounding: formData.compounding
    };
};

export interface EMIRow {
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
}

export interface EMIResult {
    emi: number;
    totalPayment: number;
    totalInterest: number;
    loanAmount: number;
    schedule: EMIRow[];
}

export const calculateEMILogic = (P: number, r_annual: number, t_years: number): EMIResult => {
    const r = r_annual / 100 / 12; // Monthly interest rate
    const n = t_years * 12; // Total months

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) || 0;
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    let balance = P;
    const schedule: EMIRow[] = [];

    for (let month = 1; month <= n; month++) {
        const interestPayment = balance * r;
        const principalPayment = emi - interestPayment;
        balance -= principalPayment;

        schedule.push({
            month,
            emi,
            principal: principalPayment,
            interest: interestPayment,
            balance: Math.max(balance, 0)
        });
    }

    return { emi, totalPayment, totalInterest, loanAmount: P, schedule };
};

export interface EligibilityResult {
    monthlyIncome: number;
    existingEMI: number;
    maxEMI: number;
    eligibleLoan: number;
    interestRate: number;
    tenure: number;
}

export const calculateLoanEligibility = (monthlyIncome: number, existingEMI: number, r_annual: number, t_years: number): EligibilityResult => {
    const r = r_annual / 100 / 12;
    const n = t_years * 12;

    const maxEMI = monthlyIncome * 0.6 - existingEMI;
    const maxLoanAllowed = maxEMI * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n))) || 0;

    return {
        monthlyIncome,
        existingEMI,
        maxEMI,
        eligibleLoan: Math.max(maxLoanAllowed, 0),
        interestRate: r_annual,
        tenure: t_years
    };
};
