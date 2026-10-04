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

// Official 7th CPC Commutation Value Table (Age Next Birthday)
export const COMMUTATION_TABLE: Record<number, number> = {
    55: 8.678,
    56: 8.600,
    57: 8.512,
    58: 8.418,
    59: 8.371,
    60: 8.287,
    61: 8.194,
    62: 8.093,
    63: 7.982,
    64: 7.862,
    65: 7.731
};

export const getCommutationFactor = (ageNextBirthday: number): number => {
    if (COMMUTATION_TABLE[ageNextBirthday]) return COMMUTATION_TABLE[ageNextBirthday];
    if (ageNextBirthday < 55) return 8.678;
    return 7.731;
};

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
    const earnedLeave = Math.min(parseFloat(formData.earnedLeave as string) || 0, 300);

    // Calculate Age next birthday for Commutation Table
    let ageNextBirthday = 61;
    if (formData.dob && formData.retirementDate) {
        const birth = new Date(formData.dob);
        const ret = new Date(formData.retirementDate);
        if (!isNaN(birth.getTime()) && !isNaN(ret.getTime())) {
            const ageAtRetirement = (ret.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
            ageNextBirthday = Math.floor(ageAtRetirement) + 1;
        }
    }

    // Service length
    const serviceLength = calculateServiceLength(formData.doj, formData.retirementDate);
    const totalMonths = (serviceLength.years * 12) + serviceLength.months;
    const completedSixMonthPeriods = Math.floor(totalMonths / 6);
    // Capped at 66 six-monthly periods (33 years max qualifying service for gratuity)
    const cappedSixMonthPeriods = Math.min(completedSixMonthPeriods, 66);

    // Basic Pension = 50% of Last Basic Pay
    const basicPension = Math.round(basicPay * 0.5);

    // Commuted Pension = 40% of Basic Pension (Max allowed under MCS Rules)
    const commutedPension = Math.round(basicPension * 0.4);

    // CVP Factor from Official 7th CPC Table
    const cvpRate = getCommutationFactor(ageNextBirthday);
    const cvp = Math.round(commutedPension * 12 * cvpRate);

    // Reduced Pension
    const reducedPension = basicPension - commutedPension;

    // DA on Pension (Full basic pension attracts Dearness Relief)
    const daOnPension = Math.round(basicPension * daRate / 100);

    // Net Monthly Pension = Reduced Pension + DA
    const netPension = reducedPension + daOnPension;

    // Family Pension = 30% of last pay
    const familyPension = Math.round(basicPay * 0.3);

    // DA on Family Pension
    const daOnFamilyPension = Math.round(familyPension * daRate / 100);

    // Total Family Pension
    const totalFamilyPension = familyPension + daOnFamilyPension;

    // DA Amount for Gratuity & Leave Encashment
    const daAmount = Math.round(basicPay * daRate / 100);

    // Gratuity (DCRG) = (Basic Pay + DA) × 1/4 × completed 6-monthly periods (Max 66 half years / 16.5 months emoluments)
    // Under 7th CPC: Max limit = ₹25,00,000 when DA >= 50%, otherwise ₹20,00,000
    const maxGratuityLimit = daRate >= 50 ? 2500000 : 2000000;
    const gratuityCalculated = Math.round((basicPay + daAmount) * 0.25 * cappedSixMonthPeriods);
    const gratuity = Math.min(gratuityCalculated, maxGratuityLimit);

    // Leave Encashment = (Basic + DA) / 30 × leave days (max 300 days)
    const leaveEncashment = Math.round(((basicPay + daAmount) / 30) * earnedLeave);

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
