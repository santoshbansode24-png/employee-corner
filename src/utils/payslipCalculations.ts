export const CITIES: Record<string, { category: 'X' | 'Y' | 'Z', isMetro: boolean }> = {
    // X Category (Metro / 50 Lakh+ Population) - 30% HRA (27% when DA < 50%)
    'Mumbai': { category: 'X', isMetro: true },
    'Pune': { category: 'X', isMetro: true },
    'Thane': { category: 'X', isMetro: true },
    'Navi Mumbai': { category: 'X', isMetro: true },

    // Y Category (Major Cities / 5 Lakh to 50 Lakh Population) - 20% HRA (18% when DA < 50%)
    'Nagpur': { category: 'Y', isMetro: false },
    'Nashik': { category: 'Y', isMetro: false },
    'Chhatrapati Sambhajinagar': { category: 'Y', isMetro: false },
    'Aurangabad': { category: 'Y', isMetro: false },
    'Solapur': { category: 'Y', isMetro: false },
    'Kolhapur': { category: 'Y', isMetro: false },
    'Amravati': { category: 'Y', isMetro: false },
    'Jalgaon': { category: 'Y', isMetro: false },
    'Malegaon': { category: 'Y', isMetro: false },
    'Nanded': { category: 'Y', isMetro: false },
    'Sangli': { category: 'Y', isMetro: false },
    'Ulhasnagar': { category: 'Y', isMetro: false },
    'Vasai-Virar': { category: 'Y', isMetro: false },
    'Mira-Bhayandar': { category: 'Y', isMetro: false },
    'Bhiwandi': { category: 'Y', isMetro: false },

    // Z Category (Other Cities & Rural / < 5 Lakh Population) - 10% HRA (9% when DA < 50%)
    'Latur': { category: 'Z', isMetro: false },
    'Akola': { category: 'Z', isMetro: false },
    'Ahmadnagar': { category: 'Z', isMetro: false },
    'Ahilyanagar': { category: 'Z', isMetro: false },
    'Dhule': { category: 'Z', isMetro: false },
    'Chandrapur': { category: 'Z', isMetro: false },
    'Parbhani': { category: 'Z', isMetro: false },
    'Jalna': { category: 'Z', isMetro: false },
    'Beed': { category: 'Z', isMetro: false },
    'Satara': { category: 'Z', isMetro: false },
    'Ratnagiri': { category: 'Z', isMetro: false },
    'Sindhudurg': { category: 'Z', isMetro: false },
    'Dharashiv (Osmanabad)': { category: 'Z', isMetro: false },
    'Yavatmal': { category: 'Z', isMetro: false },
    'Wardha': { category: 'Z', isMetro: false },
    'Gondia': { category: 'Z', isMetro: false },
    'Bhandara': { category: 'Z', isMetro: false },
    'Gadchiroli': { category: 'Z', isMetro: false },
    'Washim': { category: 'Z', isMetro: false },
    'Buldhana': { category: 'Z', isMetro: false },
    'Nandurbar': { category: 'Z', isMetro: false },
    'Palghar': { category: 'Z', isMetro: false },
    'Raigad (Alibag)': { category: 'Z', isMetro: false },
    'Other (Z Category)': { category: 'Z', isMetro: false },
};

export const calculatePayslipLogic = (formData: any, additionalAllowances: any[] = []) => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const daRate = parseFloat(formData.daRate) || 0;

    // Calculate DA
    const da = Math.round(basic * daRate / 100);

    // Calculate HRA based on DA slab and City Category
    let hraRate = 0;
    let minHRA = 0;
    
    if (formData.cityCategory === 'X') {
        hraRate = daRate >= 50 ? 30 : (daRate >= 25 ? 27 : 24);
        minHRA = 5400;
    } else if (formData.cityCategory === 'Y') {
        hraRate = daRate >= 50 ? 20 : (daRate >= 25 ? 18 : 16);
        minHRA = 3600;
    } else {
        hraRate = daRate >= 50 ? 10 : (daRate >= 25 ? 9 : 8);
        minHRA = 1800;
    }

    // If Govt Quarter is allotted, HRA is 0
    let hra = 0;
    if (!formData.isGovtQuarter) {
        hra = Math.round(basic * hraRate / 100);
        if (hra < minHRA) hra = minHRA;
    }

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

    // DA on TA (as per 7th CPC, TA carries DA rate)
    const daOnTA = formData.daOnTA !== false ? Math.round(ta * daRate / 100) : 0;

    // Additional Allowances
    let additionalAllowancesTotal = 0;
    const processedAllowances = additionalAllowances.map(allowance => {
        let amount = parseFloat(allowance.amount) || 0;
        if (allowance.type === 'NPA') {
            // Standard 7th CPC NPA is 20% of Basic Pay (capped at Basic+NPA <= 2,37,500)
            amount = Math.round(basic * 0.20);
            if (basic + amount > 237500) amount = Math.max(0, 237500 - basic);
        }
        additionalAllowancesTotal += amount;
        return { ...allowance, calculatedAmount: amount };
    });

    const perTA = parseFloat(formData.perTA) || 0;
    const totalAllowances = basic + da + hra + ta + daOnTA + perTA + additionalAllowancesTotal;

    // Deductions
    // Maharashtra Professional Tax: Rs 200/month (Feb is Rs 300). Women <= 25000 exempt.
    const isFebruary = formData.month && formData.month.endsWith('-02');
    const isWomanExempt = formData.gender === 'Female' && totalAllowances <= 25000;
    let professionalTax = 200;
    if (isWomanExempt || totalAllowances <= 7500) {
        professionalTax = 0;
    } else if (isFebruary) {
        professionalTax = 300;
    }

    const gisRates: Record<string, number> = { '1': 960, '2': 480, '3': 360, '4': 240 };
    const gis = gisRates[formData.employeeClass as string] || 0;

    let dcps = 0;
    if (formData.employeeType === 'NPS') dcps = Math.round((basic + da) * 0.10);
    const npsGovt = formData.employeeType === 'NPS' ? Math.round((basic + da) * 0.14) : 0;

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
        allowances: { 
            basic, 
            da, 
            hra, 
            ta, 
            daOnTA, 
            perTA, 
            additionalAllowances: processedAllowances, 
            additionalAllowancesTotal, 
            total: totalAllowances 
        },
        deductions: { 
            professionalTax, 
            gis, 
            dcps, 
            npsGovt,
            gpfSubscription, 
            gpfRecovery, 
            festivalAdvance, 
            otherAdvances, 
            otherRecovery, 
            incomeTax, 
            total: totalDeductions 
        },
        netSalary,
        metadata: { 
            empName: formData.empName || '',
            designation: formData.designation || '',
            officeName: formData.officeName || '',
            pranNo: formData.pranNo || '',
            month: formData.month || '',
            gender: formData.gender || 'Male',
            employeeType: formData.employeeType, 
            city: formData.city, 
            cityCategory: formData.cityCategory, 
            employeeClass: formData.employeeClass, 
            isGovtQuarter: formData.isGovtQuarter || false,
            daRate, 
            hraRate: formData.isGovtQuarter ? 0 : hraRate 
        }
    };
};
