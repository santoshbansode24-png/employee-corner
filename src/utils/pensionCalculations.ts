export interface PensionFormData {
    name: string;
    dob: string;
    doj: string;
    retirementDate: string;
    basicPay: string | number;
    earnedLeave: string | number;
    daRate: string | number;
}

export interface ServiceLength {
    years: number;
    months: number;
}

export interface PensionResult {
    serviceLength: ServiceLength;
    basicPension: number;
    commutedPension: number;
    cvp: number;
    cvpRate: number;
    reducedPension: number;
    daOnPension: number;
    netPension: number;
    familyPension: number;
    daOnFamilyPension: number;
    totalFamilyPension: number;
    gratuity: number;
    leaveEncashment: number;
    basicPay: number;
    daRate: number;
    earnedLeave: number;
    name: string;
    dob: string;
    doj: string;
    retirementDate: string;
}

export const calculateServiceLength = (doj: string, retirementDate: string): ServiceLength => {
    const start = new Date(doj);
    const end = new Date(retirementDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { years: 0, months: 0 };
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months };
};

export const calculatePensionLogic = (formData: PensionFormData): PensionResult => {
    const basicPay = parseFloat(formData.basicPay as string) || 0;
    const daRate = parseFloat(formData.daRate as string) || 0;
    const earnedLeave = parseFloat(formData.earnedLeave as string) || 0;

    // Service length
    const serviceLength = calculateServiceLength(formData.doj, formData.retirementDate);
    const totalMonths = (serviceLength.years * 12) + serviceLength.months;
    const completedSixMonthPeriods = Math.floor(totalMonths / 6);

    // Basic Pension = 50% of Last Basic Pay
    const basicPension = Math.round(basicPay * 0.5);

    // Commuted Pension = 40% of Basic Pension
    const commutedPension = Math.round(basicPension * 0.4);

    // CVP Rate (assumed 9.0 for calculation)
    const cvpRate = 9.0;
    const cvp = Math.round(commutedPension * 12 * cvpRate);

    // Reduced Pension
    const reducedPension = basicPension - commutedPension;

    // DA on Pension
    const daOnPension = Math.round(basicPension * daRate / 100);

    // Net Pension
    const netPension = reducedPension + daOnPension;

    // Family Pension = 30% of basic pension
    const familyPension = Math.round(basicPension * 0.3);

    // DA on Family Pension
    const daOnFamilyPension = Math.round(familyPension * daRate / 100);

    // Total Family Pension
    const totalFamilyPension = familyPension + daOnFamilyPension;

    // Gratuity = Basic Pay × 1/4 × number of completed 6-monthly periods
    // Max limit = ₹20,00,000 (Maharashtra Govt standard DCRG limit)
    const gratuityCalculated = Math.round(basicPay * 0.25 * completedSixMonthPeriods);
    const gratuity = Math.min(gratuityCalculated, 2000000);

    // DA for Leave Encashment
    const da = Math.round(basicPay * daRate / 100);

    // Leave Encashment = (Basic + DA) / 30 × leave days (max usually 300, letting user define)
    const leaveEncashment = Math.round(((basicPay + da) / 30) * earnedLeave);

    return {
        serviceLength,
        basicPension,
        commutedPension,
        cvp,
        cvpRate,
        reducedPension,
        daOnPension,
        netPension,
        familyPension,
        daOnFamilyPension,
        totalFamilyPension,
        gratuity,
        leaveEncashment,
        basicPay,
        daRate,
        earnedLeave,
        name: formData.name,
        dob: formData.dob,
        doj: formData.doj,
        retirementDate: formData.retirementDate
    };
};
