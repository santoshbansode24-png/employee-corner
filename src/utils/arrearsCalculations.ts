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
    { date: '2026-01-01', rate: 60 },
];

export const HRA_RATES_Z = [
    { start: '2016-01-01', end: '2018-12-31', rate: 0 },
    { start: '2019-01-01', end: '2021-06-30', rate: 8 },
    { start: '2021-07-01', end: '2024-06-30', rate: 9 },
    { start: '2024-07-01', end: '2099-12-31', rate: 10 },
];

export const getMaharashtraHRARate = (month: number, year: number, category: string, customDaRate?: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
    if (dateStr < '2019-01-01') return 0;

    const daRate = customDaRate !== undefined ? customDaRate : getMaharashtraDARate(month, year);
    let zRate = 8;
    // 7th CPC rule: When DA rate is greater than 50% (> 50), HRA increases to 30%, 20%, 10%
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

/**
 * Normalizes any date string (ISO YYYY-MM-DD, YYYY-MM, or Indian DD/MM/YYYY) into ISO YYYY-MM-DD.
 */
export const normalizeDateStr = (val?: string, defaultDay = 1): string => {
    if (!val) return '';
    const trimmed = String(val).trim();
    if (!trimmed) return '';

    // DD/MM/YYYY or D/M/YYYY
    if (trimmed.includes('/')) {
        const parts = trimmed.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        } else if (parts.length === 2) {
            const month = parseInt(parts[0], 10);
            const year = parseInt(parts[1], 10);
            if (!isNaN(year) && !isNaN(month)) {
                return `${year}-${String(month).padStart(2, '0')}-${String(defaultDay).padStart(2, '0')}`;
            }
        }
    }

    // YYYY-MM-DD or YYYY-MM
    if (trimmed.includes('-')) {
        const parts = trimmed.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const day = parseInt(parts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        } else if (parts.length === 2) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            if (!isNaN(year) && !isNaN(month)) {
                return `${year}-${String(month).padStart(2, '0')}-${String(defaultDay).padStart(2, '0')}`;
            }
        }
    }

    return trimmed;
};

export interface CalculationPeriod {
    month: number;
    year: number;
    startDay: number;
    endDay: number;
    days: number;
    totalDaysInMonth: number;
    isSplitPeriod: boolean;
    startDateStr: string; // YYYY-MM-DD
    endDateStr: string;   // YYYY-MM-DD
    startDateDMY: string; // DD/MM/YYYY
    endDateDMY: string;   // DD/MM/YYYY
    periodLabel: string;
    label: string;
    monthName: string;
}

/**
 * Splits date ranges by calendar months and any mid-month split dates (e.g. promotions on 05/03/2021).
 */
export const generateCalculationPeriods = (
    fromStr: string,
    toStr: string,
    splitDateStrings: string[] = []
): CalculationPeriod[] => {
    const startIso = normalizeDateStr(fromStr, 1);
    if (!startIso) return [];

    let endIso = '';
    if (toStr) {
        const trimmed = toStr.trim();
        if (trimmed.length === 7 && trimmed.includes('-')) {
            const [y, m] = trimmed.split('-').map(Number);
            const lastDay = new Date(y, m, 0).getDate();
            endIso = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        } else {
            endIso = normalizeDateStr(toStr, 28);
        }
    }
    if (!endIso) return [];

    const startParts = startIso.split('-').map(Number);
    const endParts = endIso.split('-').map(Number);
    if (!startParts[0] || !startParts[1] || !endParts[0] || !endParts[1]) return [];

    const startYear = startParts[0];
    const startMonth = startParts[1];
    const startDay = startParts[2] || 1;

    const endYear = endParts[0];
    const endMonth = endParts[1];
    const endDay = endParts[2] || 31;

    if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
        return [];
    }

    // Filter and normalize all valid split dates that fall strictly inside the overall date range
    const validSplitDates: { year: number; month: number; day: number; dateStr: string }[] = [];
    for (const rawDate of splitDateStrings) {
        if (!rawDate) continue;
        const norm = normalizeDateStr(rawDate);
        if (!norm || norm.length !== 10) continue;
        if (norm > startIso && norm <= endIso) {
            const [y, m, d] = norm.split('-').map(Number);
            if (y && m && d) {
                validSplitDates.push({ year: y, month: m, day: d, dateStr: norm });
            }
        }
    }

    const periods: CalculationPeriod[] = [];
    let currentYear = startYear;
    let currentMonth = startMonth;

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();

        let monthStartDay = 1;
        if (currentYear === startYear && currentMonth === startMonth) {
            monthStartDay = Math.min(startDay, totalDaysInMonth);
        }

        let monthEndDay = totalDaysInMonth;
        if (currentYear === endYear && currentMonth === endMonth) {
            monthEndDay = Math.min(endDay, totalDaysInMonth);
        }

        // Find mid-month split points for this month
        const monthSplits = validSplitDates
            .filter(sd => sd.year === currentYear && sd.month === currentMonth && sd.day > monthStartDay && sd.day <= monthEndDay)
            .map(sd => sd.day);

        const uniqueSplitDays = Array.from(new Set(monthSplits)).sort((a, b) => a - b);

        const subPeriods: { start: number; end: number }[] = [];
        let currStart = monthStartDay;
        for (const splitDay of uniqueSplitDays) {
            subPeriods.push({ start: currStart, end: splitDay - 1 });
            currStart = splitDay;
        }
        subPeriods.push({ start: currStart, end: monthEndDay });

        for (const sp of subPeriods) {
            const days = sp.end - sp.start + 1;
            const isSplit = days < totalDaysInMonth;

            const startDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(sp.start).padStart(2, '0')}`;
            const endDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(sp.end).padStart(2, '0')}`;
            const startDateDMY = `${String(sp.start).padStart(2, '0')}/${String(currentMonth).padStart(2, '0')}/${currentYear}`;
            const endDateDMY = `${String(sp.end).padStart(2, '0')}/${String(currentMonth).padStart(2, '0')}/${currentYear}`;

            const periodLabel = isSplit
                ? `${startDateDMY} to ${endDateDMY}`
                : `01.${String(currentMonth).padStart(2, '0')}.${currentYear}`;

            periods.push({
                month: currentMonth,
                year: currentYear,
                startDay: sp.start,
                endDay: sp.end,
                days,
                totalDaysInMonth,
                isSplitPeriod: isSplit,
                startDateStr,
                endDateStr,
                startDateDMY,
                endDateDMY,
                periodLabel,
                label: periodLabel,
                monthName: MONTHS[currentMonth - 1]
            });
        }

        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
    }

    return periods;
};

// Backwards compatibility helper
export const getMonthYearList = (startStr: string, endStr: string) => {
    return generateCalculationPeriods(startStr, endStr, []);
};

export const getValueForMonth = (comps: any[], month: number, year: number) => {
    if (!comps || comps.length === 0) return null;
    const dateStr = `${year}-${String(month).padStart(2, '0')}`;
    let latestVal: number | null = null;
    for (let i = 0; i < comps.length; i++) {
        const item = comps[i];
        if (i === 0 && (!item.from || item.from === '')) {
            latestVal = item.amount !== '' && item.amount !== undefined && item.amount !== null ? parseFloat(item.amount) : null;
        } else if (item.from && normalizeDateStr(item.from).substring(0, 7) <= dateStr) {
            latestVal = item.amount !== '' && item.amount !== undefined && item.amount !== null ? parseFloat(item.amount) : null;
        } else if (item.from && normalizeDateStr(item.from).substring(0, 7) > dateStr) {
            break;
        }
    }
    return latestVal;
};

export const getPromotionPeriodForMonth = (periods: any[], month: number, year: number) => {
    if (!periods || periods.length === 0) return null;
    const dateStr = `${year}-${String(month).padStart(2, '0')}`;
    const sorted = [...periods]
        .filter(p => p.from && normalizeDateStr(p.from).substring(0, 7) <= dateStr)
        .sort((a, b) => normalizeDateStr(a.from).localeCompare(normalizeDateStr(b.from)));
    return sorted.length > 0 ? sorted[sorted.length - 1] : null;
};

export const getActivePromotionForDate = (periods: any[], dateStr: string) => {
    if (!periods || periods.length === 0) return null;
    const sorted = [...periods]
        .filter(p => p.from && normalizeDateStr(p.from) <= dateStr)
        .sort((a, b) => normalizeDateStr(a.from).localeCompare(normalizeDateStr(b.from)));
    return sorted.length > 0 ? sorted[sorted.length - 1] : null;
};

export const calculateArrearsLogic = (params: any) => {
    const { 
        basicInfo, 
        dueComponents = {}, 
        drawnComponents = {}, 
        duePromotionPeriods = [], 
        drawnPromotionPeriods = [], 
        toggles = {}, 
        customColumns = [] 
    } = params;

    const includeTA = toggles.includeTA !== false;
    const includeHRA = toggles.includeHRA !== false;
    const includeDA = toggles.includeDA !== false;

    // Collect all candidate dates for mid-month splits
    const splitDateStrings: string[] = [];
    if (Array.isArray(duePromotionPeriods)) {
        duePromotionPeriods.forEach((p: any) => { if (p && p.from) splitDateStrings.push(p.from); });
    }
    if (Array.isArray(drawnPromotionPeriods)) {
        drawnPromotionPeriods.forEach((p: any) => { if (p && p.from) splitDateStrings.push(p.from); });
    }
    if (Array.isArray(dueComponents?.pay)) {
        dueComponents.pay.forEach((c: any) => { if (c && c.from) splitDateStrings.push(c.from); });
    }
    if (Array.isArray(drawnComponents?.pay)) {
        drawnComponents.pay.forEach((c: any) => { if (c && c.from) splitDateStrings.push(c.from); });
    }

    const periods = generateCalculationPeriods(basicInfo.fromMonth, basicInfo.toMonth, splitDateStrings);
    const results: any[] = [];
    if (periods.length === 0) return results;

    let runningPay = (dueComponents.pay && dueComponents.pay.length > 0) ? parseFloat(dueComponents.pay[0].amount) || 0 : 0;
    let runningDrawnPay = (drawnComponents.pay && drawnComponents.pay.length > 0) ? parseFloat(drawnComponents.pay[0].amount) || 0 : 0;

    // If an initial promotion is already active before or on the first period, apply it
    const firstPeriodStart = periods[0].startDateStr;
    const initialDuePromo = getActivePromotionForDate(duePromotionPeriods, firstPeriodStart);
    if (initialDuePromo && parseFloat(initialDuePromo.pay) > 0) {
        runningPay = parseFloat(initialDuePromo.pay);
    }
    const initialDrawnPromo = getActivePromotionForDate(drawnPromotionPeriods, firstPeriodStart);
    if (initialDrawnPromo && parseFloat(initialDrawnPromo.pay) > 0) {
        runningDrawnPay = parseFloat(initialDrawnPromo.pay);
    }

    let lastIncrementKey = '';

    periods.forEach((period, index) => {
        const { month, year, days, totalDaysInMonth, isSplitPeriod, startDateStr } = period;
        const isFullMonth = (days === totalDaysInMonth);

        // Due Component Pay Override on exact date
        const periodStartEntry = dueComponents.pay 
            ? dueComponents.pay.find((c: any) => c.from && normalizeDateStr(c.from) === startDateStr) 
            : null;
        if (periodStartEntry && parseFloat(periodStartEntry.amount) > 0) {
            runningPay = parseFloat(periodStartEntry.amount);
        }

        // Drawn Component Pay Override on exact date
        const drawnStartEntry = drawnComponents.pay 
            ? drawnComponents.pay.find((c: any) => c.from && normalizeDateStr(c.from) === startDateStr) 
            : null;
        if (drawnStartEntry && parseFloat(drawnStartEntry.amount) > 0) {
            runningDrawnPay = parseFloat(drawnStartEntry.amount);
        }

        // Annual Increment Check
        // Granted on Day 1 of the designated increment month (once per calendar year)
        const isJanInc = basicInfo.incrementMonth === 'January' && month === 1;
        const isJulyInc = basicInfo.incrementMonth === 'July' && month === 7;
        const isBothInc = basicInfo.incrementMonth === 'Both' && (month === 1 || month === 7);
        const incKey = `${year}-${month}`;

        let isIncrementApplies = false;
        if (index > 0 && (isJanInc || isJulyInc || isBothInc) && lastIncrementKey !== incKey && period.startDay === 1) {
            const incrementAmt = Math.round((runningPay * 0.03) / 100) * 100;
            runningPay += incrementAmt;

            const drawnIncrementAmt = Math.round((runningDrawnPay * 0.03) / 100) * 100;
            runningDrawnPay += drawnIncrementAmt;

            isIncrementApplies = true;
            lastIncrementKey = incKey;
        }

        // Due Promotion Override starting on this period's start date
        const duePromoEntry = duePromotionPeriods.find((p: any) => p.from && normalizeDateStr(p.from) === startDateStr);
        if (duePromoEntry && parseFloat(duePromoEntry.pay) > 0) {
            runningPay = parseFloat(duePromoEntry.pay);
        }

        // Drawn Promotion Override starting on this period's start date
        const drawnPromoEntry = drawnPromotionPeriods.find((p: any) => p.from && normalizeDateStr(p.from) === startDateStr);
        if (drawnPromoEntry && parseFloat(drawnPromoEntry.pay) > 0) {
            runningDrawnPay = parseFloat(drawnPromoEntry.pay);
        }

        // Active Promotion Lookups for allowance overrides
        const activeDuePromotion = getActivePromotionForDate(duePromotionPeriods, startDateStr);
        const activeDrawnPromotion = getActivePromotionForDate(drawnPromotionPeriods, startDateStr);

        // Due Pro-rata / Full Pay
        const dueMonthlyPay = runningPay;
        const duePeriodPay = isFullMonth ? dueMonthlyPay : Math.round((dueMonthlyPay * days) / totalDaysInMonth);

        // Due DA
        let dueDARate = 0;
        let dueDAAmt = 0;
        if (includeDA) {
            let userDueDa = getValueForMonth(dueComponents.daRate, month, year);
            dueDARate = userDueDa !== null ? userDueDa : (toggles.autoDAMaharashtra ? getMaharashtraDARate(month, year) : 0);
            if (activeDuePromotion && parseFloat(activeDuePromotion.daRate) > 0) {
                dueDARate = parseFloat(activeDuePromotion.daRate);
            }
            dueDAAmt = Math.round(duePeriodPay * dueDARate / 100);
        }

        // Due HRA
        let dueHRA = 0;
        let dueHRAAmt = 0;
        if (includeHRA) {
            let userDueHra = getValueForMonth(dueComponents.hraRate, month, year);
            dueHRA = userDueHra !== null ? userDueHra : (toggles.autoHRAMaharashtra ? getMaharashtraHRARate(month, year, basicInfo.cityCategory, dueDARate) : 0);
            if (activeDuePromotion && parseFloat(activeDuePromotion.hraRate) > 0) {
                dueHRA = parseFloat(activeDuePromotion.hraRate);
            }
            const getMinHRA = (cat: string) => { if (cat === 'X') return 5400; if (cat === 'Y') return 3600; if (cat === 'Z') return 1800; return 0; };
            const minHRA = getMinHRA(basicInfo.cityCategory);
            const proratedMinHRA = isFullMonth ? minHRA : Math.round((minHRA * days) / totalDaysInMonth);
            dueHRAAmt = Math.round(duePeriodPay * dueHRA / 100);
            if (dueHRA > 0 && dueHRAAmt < proratedMinHRA) dueHRAAmt = proratedMinHRA;
        }

        // Due TA
        let dueTA = 0;
        if (includeTA) {
            let baseDueTA = getValueForMonth(dueComponents.ta, month, year) || 0;
            if (activeDuePromotion && activeDuePromotion.ta !== undefined && activeDuePromotion.ta !== '' && parseFloat(activeDuePromotion.ta) > 0) {
                baseDueTA = parseFloat(activeDuePromotion.ta);
            }
            dueTA = isFullMonth ? baseDueTA : Math.round((baseDueTA * days) / totalDaysInMonth);
        }

        // Due Custom Columns
        let dueCustomTotal = 0;
        const dueCustomValues: Record<string, number> = {};
        customColumns.forEach((col: any) => {
            let val = 0;
            if (col.type === 'basic_percent') {
                val = Math.round(duePeriodPay * (col.percent / 100));
            } else if (col.type === 'basic_da_percent') {
                val = Math.round((duePeriodPay + dueDAAmt) * (col.percent / 100));
            } else {
                let monthlyVal = 0;
                if (activeDuePromotion && activeDuePromotion.custom && activeDuePromotion.custom[col.id] !== undefined && activeDuePromotion.custom[col.id] !== '' && parseFloat(activeDuePromotion.custom[col.id]) > 0) {
                    monthlyVal = parseFloat(activeDuePromotion.custom[col.id]) || 0;
                } else {
                    monthlyVal = getValueForMonth(dueComponents[col.id] || [], month, year) || 0;
                }
                val = isFullMonth ? monthlyVal : Math.round((monthlyVal * days) / totalDaysInMonth);
            }
            dueCustomValues[col.id] = val;
            dueCustomTotal += val;
        });

        const dueTotal = duePeriodPay + dueDAAmt + dueHRAAmt + dueTA + dueCustomTotal;

        // Drawn Pro-rata / Full Pay
        const drawnMonthlyPay = runningDrawnPay;
        const drawnPeriodPay = isFullMonth ? drawnMonthlyPay : Math.round((drawnMonthlyPay * days) / totalDaysInMonth);

        // Drawn DA
        let drawnDARate = 0;
        let drawnDAAmt = 0;
        if (includeDA) {
            let userDrawnDa = getValueForMonth(drawnComponents.daRate, month, year);
            drawnDARate = userDrawnDa !== null ? userDrawnDa : (toggles.autoDAMaharashtra ? getMaharashtraDARate(month, year) : 0);
            if (activeDrawnPromotion && parseFloat(activeDrawnPromotion.daRate) > 0) {
                drawnDARate = parseFloat(activeDrawnPromotion.daRate);
            }
            drawnDAAmt = Math.round(drawnPeriodPay * drawnDARate / 100);
        }

        // Drawn HRA
        let drawnHRA = 0;
        let drawnHRAAmt = 0;
        if (includeHRA) {
            let userDrawnHra = getValueForMonth(drawnComponents.hraRate, month, year);
            drawnHRA = userDrawnHra !== null ? userDrawnHra : (toggles.autoHRAMaharashtra ? getMaharashtraHRARate(month, year, basicInfo.cityCategory, drawnDARate) : 0);
            if (activeDrawnPromotion && parseFloat(activeDrawnPromotion.hraRate) > 0) {
                drawnHRA = parseFloat(activeDrawnPromotion.hraRate);
            }
            const getMinHRA = (cat: string) => { if (cat === 'X') return 5400; if (cat === 'Y') return 3600; if (cat === 'Z') return 1800; return 0; };
            const minHRA = getMinHRA(basicInfo.cityCategory);
            const proratedMinHRA = isFullMonth ? minHRA : Math.round((minHRA * days) / totalDaysInMonth);
            drawnHRAAmt = Math.round(drawnPeriodPay * drawnHRA / 100);
            if (drawnHRA > 0 && drawnHRAAmt < proratedMinHRA) drawnHRAAmt = proratedMinHRA;
        }

        // Drawn TA
        let drawnTA = 0;
        if (includeTA) {
            let baseDrawnTA = getValueForMonth(drawnComponents.ta, month, year) || 0;
            if (activeDrawnPromotion && activeDrawnPromotion.ta !== undefined && activeDrawnPromotion.ta !== '' && parseFloat(activeDrawnPromotion.ta) > 0) {
                baseDrawnTA = parseFloat(activeDrawnPromotion.ta);
            }
            drawnTA = isFullMonth ? baseDrawnTA : Math.round((baseDrawnTA * days) / totalDaysInMonth);
        }

        // Drawn Custom Columns
        let drawnCustomTotal = 0;
        const drawnCustomValues: Record<string, number> = {};
        customColumns.forEach((col: any) => {
            let val = 0;
            if (col.type === 'basic_percent') {
                val = Math.round(drawnPeriodPay * (col.percent / 100));
            } else if (col.type === 'basic_da_percent') {
                val = Math.round((drawnPeriodPay + drawnDAAmt) * (col.percent / 100));
            } else {
                let monthlyVal = 0;
                if (activeDrawnPromotion && activeDrawnPromotion.custom && activeDrawnPromotion.custom[col.id] !== undefined && activeDrawnPromotion.custom[col.id] !== '' && parseFloat(activeDrawnPromotion.custom[col.id]) > 0) {
                    monthlyVal = parseFloat(activeDrawnPromotion.custom[col.id]) || 0;
                } else {
                    monthlyVal = getValueForMonth(drawnComponents[col.id] || [], month, year) || 0;
                }
                val = isFullMonth ? monthlyVal : Math.round((monthlyVal * days) / totalDaysInMonth);
            }
            drawnCustomValues[col.id] = val;
            drawnCustomTotal += val;
        });

        const drawnTotal = drawnPeriodPay + drawnDAAmt + drawnHRAAmt + drawnTA + drawnCustomTotal;

        // Differences
        const diffPay = duePeriodPay - drawnPeriodPay;
        const diffDA = dueDAAmt - drawnDAAmt;
        const diffHRA = dueHRAAmt - drawnHRAAmt;
        const diffTA = dueTA - drawnTA;
        const diffTotal = dueTotal - drawnTotal;
        const diffCustom: Record<string, number> = {};
        customColumns.forEach((col: any) => {
            diffCustom[col.id] = (dueCustomValues[col.id] || 0) - (drawnCustomValues[col.id] || 0);
        });

        const dcps = basicInfo.category === 'NPS' ? Math.round((diffPay + diffDA) * 0.10) : 0;
        const nps14 = basicInfo.category === 'NPS' ? Math.round((diffPay + diffDA) * 0.14) : 0;
        const totalAmount = diffTotal + nps14;
        const grossAmount = totalAmount - nps14;
        const finalAmount = grossAmount - dcps;

        results.push({
            label: period.periodLabel + (isIncrementApplies ? ' (INC)' : ''),
            periodLabel: period.periodLabel,
            startDateDMY: period.startDateDMY,
            endDateDMY: period.endDateDMY,
            days,
            totalDaysInMonth,
            isSplitPeriod,
            isIncrementMonth: isIncrementApplies,
            due: { 
                pay: duePeriodPay, 
                monthlyPay: dueMonthlyPay,
                daRate: dueDARate, 
                da: dueDAAmt, 
                hraRate: dueHRA, 
                hra: dueHRAAmt, 
                ta: dueTA, 
                custom: dueCustomValues, 
                total: dueTotal 
            },
            drawn: { 
                pay: drawnPeriodPay, 
                monthlyPay: drawnMonthlyPay,
                daRate: drawnDARate, 
                da: drawnDAAmt, 
                hraRate: drawnHRA, 
                hra: drawnHRAAmt, 
                ta: drawnTA, 
                custom: drawnCustomValues, 
                total: drawnTotal 
            },
            diff: { 
                pay: diffPay, 
                da: diffDA, 
                hra: diffHRA, 
                ta: diffTA, 
                custom: diffCustom, 
                nps14, 
                totalAmount, 
                grossAmount, 
                total: diffTotal 
            },
            dcps,
            nps14,
            totalAmount,
            grossAmount,
            finalAmount
        });
    });

    return results;
};

export const getArrearsSummary = (results: any[], customColumns: any[] = []) => {
    const summary = {
        totalDuePay: 0,
        totalDueDA: 0,
        totalDueHRA: 0,
        totalDueTA: 0,
        totalDueCustom: {} as Record<string, number>,
        totalDue: 0,

        totalDrawnPay: 0,
        totalDrawnDA: 0,
        totalDrawnHRA: 0,
        totalDrawnTA: 0,
        totalDrawnCustom: {} as Record<string, number>,
        totalDrawn: 0,

        totalDiffPay: 0,
        totalDiffDA: 0,
        totalDiffHRA: 0,
        totalDiffTA: 0,
        totalDiffCustom: {} as Record<string, number>,
        totalDiff: 0,
        totalTotalAmount: 0,
        totalGrossAmount: 0,

        totalDCPS: 0,
        totalNPS14: 0,
        netPayable: 0,
        monthCount: 0,
        rowCount: results.length
    };

    customColumns.forEach(col => {
        summary.totalDueCustom[col.id] = 0;
        summary.totalDrawnCustom[col.id] = 0;
        summary.totalDiffCustom[col.id] = 0;
    });

    const monthKeys = new Set<string>();

    for (const row of results) {
        if (row.startDateDMY) {
            const parts = row.startDateDMY.split('/');
            if (parts.length === 3) {
                monthKeys.add(`${parts[1]}/${parts[2]}`);
            }
        } else if (row.label) {
            monthKeys.add(row.label.split(' ')[0]);
        }

        summary.totalDuePay += row.due.pay || 0;
        summary.totalDueDA += row.due.da || 0;
        summary.totalDueHRA += row.due.hra || 0;
        summary.totalDueTA += row.due.ta || 0;
        summary.totalDue += row.due.total || 0;

        summary.totalDrawnPay += row.drawn.pay || 0;
        summary.totalDrawnDA += row.drawn.da || 0;
        summary.totalDrawnHRA += row.drawn.hra || 0;
        summary.totalDrawnTA += row.drawn.ta || 0;
        summary.totalDrawn += row.drawn.total || 0;

        summary.totalDiffPay += row.diff.pay || 0;
        summary.totalDiffDA += row.diff.da || 0;
        summary.totalDiffHRA += row.diff.hra || 0;
        summary.totalDiffTA += row.diff.ta || 0;
        summary.totalDiff += row.diff.total || 0;
        summary.totalTotalAmount += row.totalAmount || 0;
        summary.totalGrossAmount += row.grossAmount || 0;

        summary.totalDCPS += row.dcps || 0;
        summary.totalNPS14 += row.nps14 || 0;
        summary.netPayable += row.finalAmount || 0;

        customColumns.forEach(col => {
            summary.totalDueCustom[col.id] += (row.due.custom?.[col.id] || 0);
            summary.totalDrawnCustom[col.id] += (row.drawn.custom?.[col.id] || 0);
            summary.totalDiffCustom[col.id] += (row.diff.custom?.[col.id] || 0);
        });
    }

    summary.monthCount = monthKeys.size || results.length;

    return summary;
};
