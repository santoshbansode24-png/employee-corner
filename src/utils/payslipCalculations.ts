export const CITIES: Record<string, { category: string, isMetro: boolean }> = {
    'Mumbai': { category: 'X', isMetro: true },
    'Thane': { category: 'X', isMetro: true },
    'Pune': { category: 'X', isMetro: true },
    'Nagpur': { category: 'Y', isMetro: false },
    'Nashik': { category: 'Y', isMetro: false },
    'Aurangabad': { category: 'Y', isMetro: false },
    'Solapur': { category: 'Z', isMetro: false },
    'Kolhapur': { category: 'Z', isMetro: false },
    'Amravati': { category: 'Z', isMetro: false },
};

export const calculatePayslipLogic = (formData: any, additionalAllowances: any[]) => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const daRate = parseFloat(formData.daRate) || 0;

    // Calculate DA
    const da = Math.round(basic * daRate / 100);

    // Calculate HRA based on DA slab
    let hraRate = 0;
    if (daRate < 25) {
        hraRate = formData.cityCategory === 'X' ? 24 : formData.cityCategory === 'Y' ? 16 : 8;
    } else if (daRate >= 25 && daRate < 50) {
        hraRate = formData.cityCategory === 'X' ? 27 : formData.cityCategory === 'Y' ? 18 : 9;
    } else {
        hraRate = formData.cityCategory === 'X' ? 30 : formData.cityCategory === 'Y' ? 20 : 10;
    }
    const hra = Math.round(basic * hraRate / 100);

    // Calculate TA
    let ta = 0;
    const cityInfo = CITIES[formData.city as string];
    const isMetro = cityInfo ? cityInfo.isMetro : false;
    let grade = formData.payScale;

    if (grade === 'S-1 to S-6' && basic >= 24200) {
        grade = 'S-7 to S-19';
    }

    if (formData.isHandicap) {
        if (grade === 'S-1 to S-6') ta = 2250;
        else if (grade === 'S-7 to S-19') ta = isMetro ? 5400 : 2700;
        else if (grade === 'S-20 to S-23') ta = isMetro ? 10800 : 5400;
    } else {
        if (grade === 'S-1 to S-6') ta = isMetro ? 1000 : 675;
        else if (grade === 'S-7 to S-19') ta = isMetro ? 2700 : 1350;
        else if (grade === 'S-20 to S-23') ta = isMetro ? 5400 : 2700;
    }

    // Additional Allowances
    let additionalAllowancesTotal = 0;
    const processedAllowances = additionalAllowances.map(allowance => {
        let amount = parseFloat(allowance.amount) || 0;
        if (allowance.type === 'NPA') amount = Math.round(basic * 0.35);
        additionalAllowancesTotal += amount;
        return { ...allowance, calculatedAmount: amount };
    });

    const perTA = parseFloat(formData.perTA) || 0;
    const totalAllowances = basic + da + hra + ta + perTA + additionalAllowancesTotal;

    // Deductions
    const professionalTax = 200;
    const gisRates: Record<string, number> = { '1': 960, '2': 480, '3': 360, '4': 240 };
    const gis = gisRates[formData.employeeClass as string] || 0;

    let dcps = 0;
    if (formData.employeeType === 'NPS') dcps = Math.round((basic + da) * 0.10);

    const gpfSubscription = parseFloat(formData.gpfSubscription) || 0;
    const gpfRecovery = parseFloat(formData.gpfRecovery) || 0;
    const festivalAdvance = parseFloat(formData.festivalAdvance) || 0;
    const otherAdvances = parseFloat(formData.otherAdvances) || 0;
    const otherRecovery = parseFloat(formData.otherRecovery) || 0;
    const incomeTax = parseFloat(formData.incomeTax) || 0;

    const totalDeductions = professionalTax + gis + dcps + gpfSubscription +
        gpfRecovery + festivalAdvance + otherAdvances +
        otherRecovery + incomeTax;

    const netSalary = totalAllowances - totalDeductions;

    return {
        allowances: { basic, da, hra, ta, perTA, additionalAllowances: processedAllowances, additionalAllowancesTotal, total: totalAllowances },
        deductions: { professionalTax, gis, dcps, gpfSubscription, gpfRecovery, festivalAdvance, otherAdvances, otherRecovery, incomeTax, total: totalDeductions },
        netSalary,
        metadata: { employeeType: formData.employeeType, city: formData.city, cityCategory: formData.cityCategory, employeeClass: formData.employeeClass, daRate, hraRate }
    };
};
