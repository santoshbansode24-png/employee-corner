export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const DA_RATES_MAHARASHTRA = [
    { date: '2016-01-01', rate: 0 },
    { date: '2016-07-01', rate: 2 },
    { date: '2017-01-01', rate: 4 },
    { date: '2017-07-01', rate: 5 },
    { date: '2018-01-01', rate: 7 },
    { date: '2018-07-01', rate: 9 },
    { date: '2019-01-01', rate: 12 },
    { date: '2019-07-01', rate: 17 },
    { date: '2021-07-01', rate: 31 },
    { date: '2022-01-01', rate: 34 },
    { date: '2022-07-01', rate: 38 },
    { date: '2023-01-01', rate: 42 },
    { date: '2023-07-01', rate: 46 },
    { date: '2024-01-01', rate: 50 },
    { date: '2024-07-01', rate: 53 },
    { date: '2025-01-01', rate: 55 },
    { date: '2025-07-01', rate: 58 },
];

export const HRA_RATES_Z = [
    { start: '2016-01-01', end: '2018-12-31', rate: 0 },
    { start: '2019-01-01', end: '2021-06-30', rate: 8 },
    { start: '2021-07-01', end: '2023-12-31', rate: 9 },
    { start: '2024-01-01', end: '2099-12-31', rate: 10 },
];

export const getMaharashtraHRARate = (month: number, year: number, category: string, customDaRate?: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
    if (dateStr < '2019-01-01') return 0;

    const daRate = customDaRate !== undefined ? customDaRate : getMaharashtraDARate(month, year);
    let zRate = 8;
    if (daRate > 50) {
        zRate = 10;
    } else if (daRate >= 25) {
        zRate = 9;
    }

    if (category === 'Y') return zRate * 2;
    if (category === 'X') return zRate * 3;
    return zRate;
};

export const getMaharashtraDARate = (month: number, year: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
    let rate = 0;
    for (let item of DA_RATES_MAHARASHTRA) {
        if (dateStr >= item.date) {
            rate = item.rate;
        } else {
            break;
        }
    }
    return rate;
};

export const getMonthYearList = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return [];
    const s = startStr.length === 7 ? `${startStr}-01` : startStr;
    const e = endStr.length === 7 ? `${endStr}-01` : endStr;
    const start = new Date(s);
    const end = new Date(e);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    const list = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const loopEnd = new Date(end.getFullYear(), end.getMonth(), 1);
    while (current <= loopEnd) {
        list.push({
            month: current.getMonth() + 1,
            year: current.getFullYear(),
            label: `01.${String(current.getMonth() + 1).padStart(2, '0')}.${current.getFullYear()}`
        });
        current.setMonth(current.getMonth() + 1);
    }
    return list;
};

export const getValueForMonth = (comps: any[], month: number, year: number) => {
    if (!comps || comps.length === 0) return null;
    const dateStr = `${year}-${String(month).padStart(2, '0')}`;
    let latestVal: number | null = null;
    for (let i = 0; i < comps.length; i++) {
        const item = comps[i];
        if (i === 0 && (!item.from || item.from === '')) {
            latestVal = item.amount !== '' && item.amount !== undefined && item.amount !== null ? parseFloat(item.amount) : null;
        } else if (item.from && item.from.substring(0, 7) <= dateStr) {
            latestVal = item.amount !== '' && item.amount !== undefined && item.amount !== null ? parseFloat(item.amount) : null;
        } else if (item.from && item.from.substring(0, 7) > dateStr) {
            break;
        }
    }
    return latestVal;
};

export const calculateArrearsLogic = (params: any) => {
    const { basicInfo, dueComponents, drawnComponents, duePromotionPeriods, drawnPromotionPeriods, toggles, customColumns } = params;
    const months = getMonthYearList(basicInfo.fromMonth, basicInfo.toMonth);
    const results: any[] = [];
    
    let runningPay = (dueComponents.pay && dueComponents.pay.length > 0) ? parseFloat(dueComponents.pay[0].amount) || 0 : 0;
    let runningDrawnPay = (drawnComponents.pay && drawnComponents.pay.length > 0) ? parseFloat(drawnComponents.pay[0].amount) || 0 : 0;

    let runningDueTA: number | null = null;
    let runningDrawnTA: number | null = null;
    const runningDueCustom: Record<string, number> = {};
    const runningDrawnCustom: Record<string, number> = {};

    months.forEach((m, index) => {
        const { month, year, label } = m;
        const dateStr = `${year}-${String(month).padStart(2, '0')}`;

        // Due Pay
        const periodStartEntry = dueComponents.pay ? dueComponents.pay.find((c: any) => c.from && c.from.substring(0, 7) === dateStr) : null;
        let isIncrementApplies = false;
        if (periodStartEntry) {
            runningPay = parseFloat(periodStartEntry.amount) || 0;
        } else if (index > 0) {
            const isJanInc = basicInfo.incrementMonth === 'January' && month === 1;
            const isJulyInc = basicInfo.incrementMonth === 'July' && month === 7;
            const isBothInc = basicInfo.incrementMonth === 'Both' && (month === 1 || month === 7);
            if (isJanInc || isJulyInc || isBothInc) {
                const incrementAmt = Math.round((runningPay * 0.03) / 100) * 100;
                runningPay += incrementAmt;
                isIncrementApplies = true;
            }
        }

        // Due Promotion
        const duePromotionPeriod = duePromotionPeriods.find((p: any) => p.from && p.from.startsWith(dateStr));
        if (duePromotionPeriod) {
            if (duePromotionPeriod.pay > 0) runningPay = duePromotionPeriod.pay;
            if (duePromotionPeriod.ta !== undefined && duePromotionPeriod.ta !== '') runningDueTA = parseFloat(duePromotionPeriod.ta) || 0;
            if (duePromotionPeriod.custom) {
                Object.keys(duePromotionPeriod.custom).forEach(key => {
                    if (duePromotionPeriod.custom[key] !== undefined && duePromotionPeriod.custom[key] !== '') {
                        runningDueCustom[key] = parseFloat(duePromotionPeriod.custom[key]) || 0;
                    }
                });
            }
        }

        // Drawn Pay
        const drawnStartEntry = drawnComponents.pay ? drawnComponents.pay.find((c: any) => c.from && c.from.substring(0, 7) === dateStr) : null;
        if (drawnStartEntry) {
            runningDrawnPay = parseFloat(drawnStartEntry.amount) || 0;
        } else if (index > 0) {
            const isJanInc = basicInfo.incrementMonth === 'January' && month === 1;
            const isJulyInc = basicInfo.incrementMonth === 'July' && month === 7;
            const isBothInc = basicInfo.incrementMonth === 'Both' && (month === 1 || month === 7);
            if (isJanInc || isJulyInc || isBothInc) {
                const incrementAmt = Math.round((runningDrawnPay * 0.03) / 100) * 100;
                runningDrawnPay += incrementAmt;
            }
        }

        // Drawn Promotion
        const drawnPromotionPeriod = drawnPromotionPeriods.find((p: any) => p.from && p.from.startsWith(dateStr));
        if (drawnPromotionPeriod) {
            if (drawnPromotionPeriod.pay > 0) runningDrawnPay = drawnPromotionPeriod.pay;
            if (drawnPromotionPeriod.ta !== undefined && drawnPromotionPeriod.ta !== '') runningDrawnTA = parseFloat(drawnPromotionPeriod.ta) || 0;
            if (drawnPromotionPeriod.custom) {
                Object.keys(drawnPromotionPeriod.custom).forEach(key => {
                    if (drawnPromotionPeriod.custom[key] !== undefined && drawnPromotionPeriod.custom[key] !== '') {
                        runningDrawnCustom[key] = parseFloat(drawnPromotionPeriod.custom[key]) || 0;
                    }
                });
            }
        }

        let userDueDa = getValueForMonth(dueComponents.daRate, month, year);
        let dueDARate = userDueDa !== null ? userDueDa : (toggles.autoDAMaharashtra ? getMaharashtraDARate(month, year) : 0);
        
        if (duePromotionPeriod && duePromotionPeriod.daRate > 0) {
            dueDARate = duePromotionPeriod.daRate;
        }

        let userDueHra = getValueForMonth(dueComponents.hraRate, month, year);
        let dueHRA = userDueHra !== null ? userDueHra : (toggles.autoHRAMaharashtra ? getMaharashtraHRARate(month, year, basicInfo.cityCategory, dueDARate) : 0);
        let dueTA = runningDueTA !== null ? runningDueTA : (getValueForMonth(dueComponents.ta, month, year) || 0);

        if (duePromotionPeriod && duePromotionPeriod.hraRate > 0) {
            dueHRA = duePromotionPeriod.hraRate;
        }

        const dueDAAmt = Math.round(runningPay * dueDARate / 100);
        
        let dueCustomTotal = 0;
        const dueCustomValues: Record<string, number> = {};
        customColumns.forEach((col: any) => {
            let val = 0;
            if (col.type === 'basic_percent') val = Math.round(runningPay * (col.percent / 100));
            else if (col.type === 'basic_da_percent') val = Math.round((runningPay + dueDAAmt) * (col.percent / 100));
            else val = runningDueCustom[col.id] !== undefined ? runningDueCustom[col.id] : (getValueForMonth(dueComponents[col.id] || [], month, year) || 0);
            dueCustomValues[col.id] = val;
            dueCustomTotal += val;
        });

        const getMinHRA = (cat: string) => { if (cat === 'X') return 5400; if (cat === 'Y') return 3600; if (cat === 'Z') return 1800; return 0; };
        const minHRA = getMinHRA(basicInfo.cityCategory);
        let dueHRAAmt = Math.round(runningPay * dueHRA / 100);
        if (dueHRAAmt < minHRA) dueHRAAmt = minHRA;
        const dueTotal = runningPay + dueDAAmt + dueHRAAmt + dueTA + dueCustomTotal;

        // Drawn Calcs
        let userDrawnDa = getValueForMonth(drawnComponents.daRate, month, year);
        let drawnDARate = userDrawnDa !== null ? userDrawnDa : (toggles.autoDAMaharashtra ? getMaharashtraDARate(month, year) : 0);

        if (drawnPromotionPeriod && drawnPromotionPeriod.daRate > 0) {
            drawnDARate = drawnPromotionPeriod.daRate;
        }

        let userDrawnHra = getValueForMonth(drawnComponents.hraRate, month, year);
        let drawnHRA = userDrawnHra !== null ? userDrawnHra : (toggles.autoHRAMaharashtra ? getMaharashtraHRARate(month, year, basicInfo.cityCategory, drawnDARate) : 0);
        let drawnTA = runningDrawnTA !== null ? runningDrawnTA : (getValueForMonth(drawnComponents.ta, month, year) || 0);

        if (drawnPromotionPeriod && drawnPromotionPeriod.hraRate > 0) {
            drawnHRA = drawnPromotionPeriod.hraRate;
        }

        const drawnDAAmt = Math.round(runningDrawnPay * drawnDARate / 100);
        
        let drawnCustomTotal = 0;
        const drawnCustomValues: Record<string, number> = {};
        customColumns.forEach((col: any) => {
            let val = 0;
            if (col.type === 'basic_percent') val = Math.round(runningDrawnPay * (col.percent / 100));
            else if (col.type === 'basic_da_percent') val = Math.round((runningDrawnPay + drawnDAAmt) * (col.percent / 100));
            else val = runningDrawnCustom[col.id] !== undefined ? runningDrawnCustom[col.id] : (getValueForMonth(drawnComponents[col.id] || [], month, year) || 0);
            drawnCustomValues[col.id] = val;
            drawnCustomTotal += val;
        });

        let drawnHRAAmt = Math.round(runningDrawnPay * drawnHRA / 100);
        if (drawnHRAAmt < minHRA) drawnHRAAmt = minHRA;
        const drawnTotal = runningDrawnPay + drawnDAAmt + drawnHRAAmt + drawnTA + drawnCustomTotal;

        // Diff
        const diffPay = runningPay - runningDrawnPay;
        const diffDA = dueDAAmt - drawnDAAmt;
        const diffHRA = dueHRAAmt - drawnHRAAmt;
        const diffTA = dueTA - drawnTA;
        const diffTotal = dueTotal - drawnTotal;
        const diffCustom: Record<string, number> = {};
        customColumns.forEach((col: any) => { diffCustom[col.id] = (dueCustomValues[col.id] || 0) - (drawnCustomValues[col.id] || 0); });

        let dcps = basicInfo.category === 'NPS' ? Math.round((diffPay + diffDA) * 0.10) : 0;
        const nps14 = basicInfo.category === 'NPS' ? Math.round((diffPay + diffDA) * 0.14) : 0;
        const finalAmount = diffTotal - dcps;

        results.push({
            label: label + (isIncrementApplies ? ' (INC)' : ''),
            isIncrementMonth: isIncrementApplies,
            due: { pay: runningPay, daRate: dueDARate, da: dueDAAmt, hraRate: dueHRA, hra: dueHRAAmt, ta: dueTA, custom: dueCustomValues, total: dueTotal },
            drawn: { pay: runningDrawnPay, daRate: drawnDARate, da: drawnDAAmt, hraRate: drawnHRA, hra: drawnHRAAmt, ta: drawnTA, custom: drawnCustomValues, total: drawnTotal },
            diff: { pay: diffPay, da: diffDA, hra: diffHRA, ta: diffTA, custom: diffCustom, total: diffTotal },
            dcps,
            nps14,
            finalAmount
        });
    });

    return results;
};
