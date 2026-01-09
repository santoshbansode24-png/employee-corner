import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- CONSTANTS & DATA ---
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DA_RATES_MAHARASHTRA = [
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
    { date: '2025-01-01', rate: 55 },
];

// --- HRA RATES ---
// Extracted from your Excel File (7PC Sheet)
// 0% (2016-2018), 8% (2019-2021), 9% (2021-2024), 10% (2024+)
const HRA_RATES_Z = [
    { start: '2016-01-01', end: '2018-12-31', rate: 0 },
    { start: '2019-01-01', end: '2021-06-30', rate: 8 },
    { start: '2021-07-01', end: '2024-06-30', rate: 9 },
    { start: '2024-07-01', end: '2099-12-31', rate: 10 },
];

const getMaharashtraHRARate = (month, year, category) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;

    // 1. Find Base Z Rate
    let zRate = 0;
    for (let period of HRA_RATES_Z) {
        if (dateStr >= period.start && dateStr <= period.end) {
            zRate = period.rate;
            break;
        }
    }

    // 2. Apply Multiplier
    // Z = 1x, Y = 2x, X = 3x (Standard 7th PC: 8-16-24, 9-18-27, 10-20-30)
    if (category === 'Y') return zRate * 2;
    if (category === 'X') return zRate * 3;
    return zRate; // Default Z
};

const getMaharashtraDARate = (month, year) => {
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

// --- HELPER FUNCTIONS ---
const getMonthYearList = (startStr, endStr) => {
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

function ArrearsCalculator() {
    // Basic Info 
    const [basicInfo, setBasicInfo] = useState({
        empName: 'Dr. Suhash Subhash Shelar',
        designation: 'सहायक प्राध्यापक',
        fromMonth: '2023-01-01',
        toMonth: '2023-06-30',
        category: 'NPS', // NPS or GPF
        incrementMonth: 'July', // No Increment, January, July, Both
        orderNo: 'महाराष्ट्र शासन वित्त विभाग शासन निर्णय क्र.मभवा-1324/प्रक्र.34/सेवा-9, दि.25.02.2025 अन्वये दि.01.07.2024 ते 31.01.2025 या कालावधीचे',
        cityCategory: 'Z' // X, Y, Z
    });

    // Toggles
    const [toggles, setToggles] = useState({
        promotionEnabled: false,
        autoDAMaharashtra: true, // Default ON
        autoHRAMaharashtra: false // Default OFF
    });

    // Due Components
    const [dueComponents, setDueComponents] = useState({
        pay: [{ from: '2023-01', to: '2023-06', amount: 65000 }],
        daRate: [{ from: '2023-01', to: '2023-06', amount: 38 }],
        hraRate: [{ from: '2023-01', to: '2023-06', amount: 10 }],
        ta: [{ from: '2023-01', to: '2023-06', amount: 0 }]
    });

    // Drawn Components
    const [drawnComponents, setDrawnComponents] = useState({
        pay: [{ from: '2023-01', to: '2023-06', amount: 63100 }],
        daRate: [{ from: '2023-01', to: '2023-06', amount: 37 }],
        hraRate: [{ from: '2023-01', to: '2023-06', amount: 9 }],
        ta: [{ from: '2023-01', to: '2023-06', amount: 0 }]
    });

    const [calculationResults, setCalculationResults] = useState([]);

    // Promotion Periods State - Separate for Due and Drawn
    const [duePromotionPeriods, setDuePromotionPeriods] = useState([]);
    const [drawnPromotionPeriods, setDrawnPromotionPeriods] = useState([]);
    const [showDuePromotion, setShowDuePromotion] = useState(false);
    const [showDrawnPromotion, setShowDrawnPromotion] = useState(false);

    // Dynamic Columns State
    const [customColumns, setCustomColumns] = useState([]); // Array of { id: string, label: string }

    // Two refs: one for the header (image capture), one for visual table (optional)
    const headerRef = useRef(null);

    // --- EFFECT: SYNC DATES ---
    useEffect(() => {
        if (!toggles.promotionEnabled) {
            const sync = (comps) => {
                const newComps = { ...comps };
                Object.keys(newComps).forEach(key => {
                    if (newComps[key].length === 1) {
                        newComps[key][0].from = basicInfo.fromMonth;
                        newComps[key][0].to = basicInfo.toMonth;
                    }
                });
                return newComps;
            };
            setDueComponents(prev => sync(prev));
            setDrawnComponents(prev => sync(prev));
        }
    }, [basicInfo.fromMonth, basicInfo.toMonth, toggles.promotionEnabled]);

    // --- EFFECT: CALCULATION ENGINE ---
    useEffect(() => {
        calculateArrears();
    }, [basicInfo, toggles, dueComponents, drawnComponents, duePromotionPeriods, drawnPromotionPeriods]);

    // --- EFFECT: AUTO-UPDATE DA ---
    useEffect(() => {
        if (toggles.autoDAMaharashtra && basicInfo.fromMonth) {
            const [year, month] = basicInfo.fromMonth.split('-').map(Number);
            const rate = getMaharashtraDARate(month, year);
            setDueComponents(prev => {
                const list = [...prev.daRate];
                if (list[0]) list[0].amount = rate;
                return { ...prev, daRate: list };
            });
            setDrawnComponents(prev => {
                const list = [...prev.daRate];
                if (list[0]) list[0].amount = rate;
                return { ...prev, daRate: list };
            });
        }
    }, [basicInfo.fromMonth, toggles.autoDAMaharashtra]);

    // --- EFFECT: SYNC PROMOTION HRA WITH CITY CATEGORY ---
    useEffect(() => {
        const updateHRA = (periods) => {
            return periods.map(p => {
                if (p.from) {
                    const [y, m] = p.from.split('-').map(Number);
                    return { ...p, hraRate: getMaharashtraHRARate(m, y, basicInfo.cityCategory) };
                }
                return p;
            });
        };

        if (basicInfo.cityCategory) {
            setDuePromotionPeriods(prev => updateHRA(prev));
            setDrawnPromotionPeriods(prev => updateHRA(prev));
        }
    }, [basicInfo.cityCategory]);

    const getValueForMonth = (componentList, month, year) => {
        if (!componentList || !Array.isArray(componentList)) return 0;
        const dateStr = `${year}-${String(month).padStart(2, '0')}`;
        const item = componentList.find(c => {
            if (!c.from || !c.to) return false;
            const fromMonth = c.from.substring(0, 7);
            const toMonth = c.to.substring(0, 7);
            return dateStr >= fromMonth && dateStr <= toMonth;
        });
        if (item) return parseFloat(item.amount) || 0;
        if (componentList.length > 0) return parseFloat(componentList[0].amount) || 0;
        return 0;
    };

    const calculateArrears = () => {
        try {
            const months = getMonthYearList(basicInfo.fromMonth, basicInfo.toMonth);
            const results = [];
            let runningPay = (dueComponents.pay && dueComponents.pay.length > 0) ? parseFloat(dueComponents.pay[0].amount) || 0 : 0;
            let runningDrawnPay = (drawnComponents.pay && drawnComponents.pay.length > 0) ? parseFloat(drawnComponents.pay[0].amount) || 0 : 0;

            months.forEach((m, index) => {
                const { month, year, label } = m;
                const dateStr = `${year}-${String(month).padStart(2, '0')}`;

                // --- DUE PAY LOGIC ---
                const periodStartEntry = dueComponents.pay ? dueComponents.pay.find(c => c.from && c.from.substring(0, 7) === dateStr) : null;
                let isIncrementApplies = false;
                if (periodStartEntry) {
                    runningPay = parseFloat(periodStartEntry.amount) || 0;
                } else if (index > 0) {
                    const isJanInc = basicInfo.incrementMonth === 'January' && month === 1;
                    const isJulyInc = basicInfo.incrementMonth === 'July' && month === 7;
                    const isBothInc = basicInfo.incrementMonth === 'Both' && (month === 1 || month === 7);
                    if (isJanInc || isJulyInc || isBothInc) {
                        const incrementAmt = Math.round((runningPay * 0.03) / 100) * 100;
                        runningPay = runningPay + incrementAmt;
                        isIncrementApplies = true;
                    }
                }

                // --- CHECK PROMOTION PERIODS (DUE) ---
                const duePromotionPeriod = duePromotionPeriods.find(p => p.from && p.from.startsWith(dateStr));
                if (duePromotionPeriod && duePromotionPeriod.pay > 0) {
                    runningPay = duePromotionPeriod.pay;
                }

                // --- DRAWN PAY LOGIC ---
                const drawnStartEntry = drawnComponents.pay ? drawnComponents.pay.find(c => c.from && c.from.substring(0, 7) === dateStr) : null;
                if (drawnStartEntry) {
                    runningDrawnPay = parseFloat(drawnStartEntry.amount) || 0;
                } else if (index > 0) {
                    const isJanInc = basicInfo.incrementMonth === 'January' && month === 1;
                    const isJulyInc = basicInfo.incrementMonth === 'July' && month === 7;
                    const isBothInc = basicInfo.incrementMonth === 'Both' && (month === 1 || month === 7);
                    if (isJanInc || isJulyInc || isBothInc) {
                        const incrementAmt = Math.round((runningDrawnPay * 0.03) / 100) * 100;
                        runningDrawnPay = runningDrawnPay + incrementAmt;
                    }
                }

                // --- CHECK PROMOTION PERIODS (DRAWN) ---
                const drawnPromotionPeriod = drawnPromotionPeriods.find(p => p.from && p.from.startsWith(dateStr));
                if (drawnPromotionPeriod && drawnPromotionPeriod.pay > 0) {
                    runningDrawnPay = drawnPromotionPeriod.pay;
                }

                // --- CALCULATE TOTALS ---
                let duePay = runningPay;
                let drawnPay = runningDrawnPay;
                const isIncrementMonth = isIncrementApplies;

                // Due
                let dueDARate = toggles.autoDAMaharashtra ? getMaharashtraDARate(month, year) : getValueForMonth(dueComponents.daRate, month, year);
                let dueHRA = toggles.autoHRAMaharashtra ? getMaharashtraHRARate(month, year, basicInfo.cityCategory) : getValueForMonth(dueComponents.hraRate, month, year);
                let dueTA = getValueForMonth(dueComponents.ta, month, year);

                // Override DA and HRA rates if promotion periods specify them
                if (duePromotionPeriod) {
                    if (duePromotionPeriod.daRate > 0) dueDARate = duePromotionPeriod.daRate;
                    if (duePromotionPeriod.hraRate > 0) dueHRA = duePromotionPeriod.hraRate;
                    if (duePromotionPeriod.ta !== undefined && duePromotionPeriod.ta !== '') dueTA = parseFloat(duePromotionPeriod.ta) || 0;
                }

                // Custom Columns Due
                let dueCustomTotal = 0;
                const dueCustomValues = {};
                customColumns.forEach(col => {
                    let val = getValueForMonth(dueComponents[col.id] || [], month, year);
                    // Override if promotion period has value
                    if (duePromotionPeriod && duePromotionPeriod.custom && duePromotionPeriod.custom[col.id] !== undefined && duePromotionPeriod.custom[col.id] !== '') {
                        val = parseFloat(duePromotionPeriod.custom[col.id]) || 0;
                    }
                    dueCustomValues[col.id] = val;
                    dueCustomTotal += val;
                });

                const dueDAAmt = Math.round(duePay * dueDARate / 100);
                const dueHRAAmt = Math.round(duePay * dueHRA / 100);
                const dueTotal = duePay + dueDAAmt + dueHRAAmt + dueTA + dueCustomTotal;

                // Drawn
                let drawnDARate = toggles.autoDAMaharashtra ? getMaharashtraDARate(month, year) : getValueForMonth(drawnComponents.daRate, month, year);
                let drawnHRA = toggles.autoHRAMaharashtra ? getMaharashtraHRARate(month, year, basicInfo.cityCategory) : getValueForMonth(drawnComponents.hraRate, month, year);
                let drawnTA = getValueForMonth(drawnComponents.ta, month, year);

                // Custom Columns Drawn
                let drawnCustomTotal = 0;
                const drawnCustomValues = {};
                customColumns.forEach(col => {
                    const val = getValueForMonth(drawnComponents[col.id] || [], month, year);
                    drawnCustomValues[col.id] = val;
                    drawnCustomTotal += val;
                });

                // Override Drawn DA and HRA rates if promotion period specifies them
                if (drawnPromotionPeriod) {
                    if (drawnPromotionPeriod.daRate > 0) drawnDARate = drawnPromotionPeriod.daRate;
                    if (drawnPromotionPeriod.hraRate > 0) drawnHRA = drawnPromotionPeriod.hraRate;
                    if (drawnPromotionPeriod.ta !== undefined && drawnPromotionPeriod.ta !== '') drawnTA = parseFloat(drawnPromotionPeriod.ta) || 0;
                }

                // Re-calculate custom totals with overrides
                drawnCustomTotal = 0;
                customColumns.forEach(col => {
                    let val = drawnCustomValues[col.id]; // Initial value from main components
                    if (drawnPromotionPeriod && drawnPromotionPeriod.custom && drawnPromotionPeriod.custom[col.id] !== undefined && drawnPromotionPeriod.custom[col.id] !== '') {
                        val = parseFloat(drawnPromotionPeriod.custom[col.id]) || 0;
                        drawnCustomValues[col.id] = val; // Update the map
                    }
                    drawnCustomTotal += val;
                });

                const drawnDAAmt = Math.round(drawnPay * drawnDARate / 100);
                const drawnHRAAmt = Math.round(drawnPay * drawnHRA / 100);
                const drawnTotal = drawnPay + drawnDAAmt + drawnHRAAmt + drawnTA + drawnCustomTotal;

                // Difference
                const diffPay = duePay - drawnPay;
                const diffDA = dueDAAmt - drawnDAAmt;
                const diffHRA = dueHRAAmt - drawnHRAAmt;
                const diffTA = dueTA - drawnTA;
                const diffCustom = {};
                customColumns.forEach(col => {
                    diffCustom[col.id] = (dueCustomValues[col.id] || 0) - (drawnCustomValues[col.id] || 0);
                });
                const diffTotal = dueTotal - drawnTotal;

                // Deductions
                let dcps = 0;
                if (basicInfo.category === 'NPS') {
                    dcps = Math.round(diffTotal * 0.10);
                }
                const finalAmount = diffTotal - dcps;

                results.push({
                    label: label + (isIncrementMonth ? ' (INC)' : ''),
                    isIncrementMonth,
                    due: { pay: duePay, daRate: dueDARate, da: dueDAAmt, hraRate: dueHRA, hra: dueHRAAmt, ta: dueTA, custom: dueCustomValues, total: dueTotal },
                    drawn: { pay: drawnPay, daRate: drawnDARate, da: drawnDAAmt, hraRate: drawnHRA, hra: drawnHRAAmt, ta: drawnTA, custom: drawnCustomValues, total: drawnTotal },
                    diff: { pay: diffPay, da: diffDA, hra: diffHRA, ta: diffTA, custom: diffCustom, total: diffTotal },
                    dcps,
                    finalAmount
                });
            });

            setCalculationResults(results);
        } catch (error) {
            console.error("Calculation Error:", error);
        }
    };

    const updateBasicInfo = (field, value) => setBasicInfo(prev => ({ ...prev, [field]: value }));
    const updateComponent = (type, compKey, index, field, value) => {
        const setter = type === 'due' ? setDueComponents : setDrawnComponents;
        setter(prev => {
            const list = [...(prev[compKey] || [])];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, [compKey]: list };
        });
    };

    const addCustomColumn = (label) => {
        if (!label) return;
        const id = 'col_' + Date.now();
        setCustomColumns([...customColumns, { id, label }]);

        // Initialize state for this column in both Due and Drawn
        // Default to one period covering current range
        const defaultPeriod = [{ from: basicInfo.fromMonth, to: basicInfo.toMonth, amount: 0 }];

        setDueComponents(prev => ({ ...prev, [id]: defaultPeriod }));
        setDrawnComponents(prev => ({ ...prev, [id]: defaultPeriod }));
    };

    const removeCustomColumn = (id) => {
        setCustomColumns(customColumns.filter(c => c.id !== id));
        // Optional: Cleanup components state, but not strictly necessary for functionality
    };

    // --- HYBRID GENERATION: Image for Header (Text Fix) + Vector for Table (Clarity) ---
    const generatePDF = async () => {
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape, millimeters, A4
        const pageWidth = doc.internal.pageSize.getWidth();

        let startY = 15;

        // 1. HEADER GENERATION (Image Based - Fixes Marathi Text Issue)
        if (headerRef.current) {
            // Capture header with high scale for clarity
            const canvas = await html2canvas(headerRef.current, { scale: 3 });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);

            // Adjust width to fit page margins (10mm left/right)
            const imgWidth = pageWidth - 20;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            startY = 10 + imgHeight + 5; // Set table to start below image
        }

        // 2. TABLE GENERATION (Vector Based - Crystal Clear Font)

        // Define Column Headers
        const headRows = [
            [
                { content: 'SR', rowSpan: 2, styles: { valign: 'middle' } },
                { content: 'MONTH', rowSpan: 2, styles: { valign: 'middle' } },
                { content: 'DUE', colSpan: 5 + customColumns.length, styles: { halign: 'center' } },
                { content: 'DRAWN', colSpan: 5 + customColumns.length, styles: { halign: 'center' } },
                { content: 'DIFFERENCE', colSpan: 5 + customColumns.length, styles: { halign: 'center' } },
            ],
            [
                'PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL',
                'PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL',
                'PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL'
            ]
        ];

        // Add NPS columns if enabled
        if (basicInfo.category === 'NPS') {
            headRows[0].push(
                { content: 'DCPS\n10%', rowSpan: 2, styles: { valign: 'middle' } },
                { content: 'NPS\n14%', rowSpan: 2, styles: { valign: 'middle' } }
            );
        }

        // Prepare Body Data
        const bodyData = calculationResults.map((row, index) => {
            const baseRow = [
                index + 1,
                row.label + (row.isIncrementMonth ? ' (INC)' : ''),
                row.due.pay, row.due.da, row.due.hra, row.due.ta, ...customColumns.map(c => row.due.custom[c.id] || 0), row.due.total,
                row.drawn.pay, row.drawn.da, row.drawn.hra, row.drawn.ta, ...customColumns.map(c => row.drawn.custom[c.id] || 0), row.drawn.total,
                row.diff.pay, row.diff.da, row.diff.hra, row.diff.ta, ...customColumns.map(c => row.diff.custom[c.id] || 0), row.diff.total
            ];

            if (basicInfo.category === 'NPS') {
                const nps14 = Math.round(row.diff.total * 0.14);
                baseRow.push(row.dcps, nps14);
            }
            return baseRow;
        });

        // 3. ADD TOTAL ROW (With Merge Logic)
        const totalRow = [
            { content: 'TOTAL', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } }, // Merge SR and MONTH

            // Due Sums
            calculationResults.reduce((s, r) => s + r.due.pay, 0),
            calculationResults.reduce((s, r) => s + r.due.da, 0),
            calculationResults.reduce((s, r) => s + r.due.hra, 0),
            calculationResults.reduce((s, r) => s + r.due.ta, 0),
            ...customColumns.map(c => calculationResults.reduce((s, r) => s + (r.due.custom[c.id] || 0), 0)),
            calculationResults.reduce((s, r) => s + r.due.total, 0),

            // Drawn Sums
            calculationResults.reduce((s, r) => s + r.drawn.pay, 0),
            calculationResults.reduce((s, r) => s + r.drawn.da, 0),
            calculationResults.reduce((s, r) => s + r.drawn.hra, 0),
            calculationResults.reduce((s, r) => s + r.drawn.ta, 0),
            ...customColumns.map(c => calculationResults.reduce((s, r) => s + (r.drawn.custom[c.id] || 0), 0)),
            calculationResults.reduce((s, r) => s + r.drawn.total, 0),

            // Diff Sums
            calculationResults.reduce((s, r) => s + r.diff.pay, 0),
            calculationResults.reduce((s, r) => s + r.diff.da, 0),
            calculationResults.reduce((s, r) => s + r.diff.hra, 0),
            calculationResults.reduce((s, r) => s + r.diff.ta, 0),
            ...customColumns.map(c => calculationResults.reduce((s, r) => s + (r.diff.custom[c.id] || 0), 0)),
            calculationResults.reduce((s, r) => s + r.diff.total, 0)
        ];

        if (basicInfo.category === 'NPS') {
            totalRow.push(
                calculationResults.reduce((s, r) => s + r.dcps, 0),
                calculationResults.reduce((s, r) => s + Math.round(r.diff.total * 0.14), 0)
            );
        }

        bodyData.push(totalRow);

        // 4. GENERATE TABLE
        doc.autoTable({
            startY: startY,
            head: headRows,
            body: bodyData,
            theme: 'grid',
            headStyles: {
                fillColor: [41, 128, 185], // Professional Blue
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
                fontSize: 11 // Readable Font Size for Header
            },
            styles: {
                fontSize: 9, // Reduced for better fit
                cellPadding: 1.5,
                valign: 'middle',
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                overflow: 'linebreak'
            },
            columnStyles: {
                1: { cellWidth: 22 }, // MONTH (Reduced)
                // Highlight Total Columns with light gray (adjust indices dynamically)
                [6 + customColumns.length]: { fontStyle: 'bold', fillColor: [245, 245, 245] },
                [11 + (customColumns.length * 2)]: { fontStyle: 'bold', fillColor: [245, 245, 245] },
                [16 + (customColumns.length * 3)]: { fontStyle: 'bold', fillColor: [245, 245, 245] },
            },
            didParseCell: function (data) {
                // Style the TOTAL row at the bottom
                if (data.row.index === bodyData.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [220, 220, 220]; // Darker Gray for Total Row
                }
            }
        });



        doc.save(`Arrears_${basicInfo.empName.replace(/\s+/g, '_')}.pdf`);
    };

    const renderComponentInputs = (title, type, compKey, label) => {
        const comps = (type === 'due' ? dueComponents[compKey] : drawnComponents[compKey]) || [];
        // NPA check removed
        return (
            <div className="mb-4 border p-3 rounded bg-white shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm text-neutral-700">{label}</span>
                    {toggles.promotionEnabled && (
                        <button className="text-xs text-blue-600 font-bold" onClick={() => alert('Feature: Add Period')}>+ Add</button>
                    )}
                </div>
                {comps.map((item, idx) => (
                    <div key={idx} className="flex gap-2 text-sm items-center">
                        <input type="number" value={item.amount} onChange={(e) => updateComponent(type, compKey, idx, 'amount', e.target.value)} className="form-input py-1 px-2 w-24 border rounded" placeholder="Amount" />
                        {toggles.promotionEnabled && (
                            <>
                                <input type="month" value={item.from} onChange={(e) => updateComponent(type, compKey, idx, 'from', e.target.value)} className="form-input py-1 px-2 w-32 border rounded text-xs" />
                                <input type="month" value={item.to} onChange={(e) => updateComponent(type, compKey, idx, 'to', e.target.value)} className="form-input py-1 px-2 w-32 border rounded text-xs" />
                            </>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="animate-fade-in p-4 max-w-[1920px] mx-auto font-sans">
            {/* --- CONTROLS --- */}
            <div className="card mb-6 border-t-4 border-blue-600">
                <div className="card-header bg-gray-50">
                    <h1 className="text-2xl font-bold text-blue-800">🏛️ Arrears Calculator</h1>
                    <p className="text-sm text-gray-600">Due-Drawn Statement Generator</p>
                </div>
                <div className="card-body grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                        <h3 className="font-bold border-b pb-1">1. Employee Details</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-xs font-semibold block">Name</label><input type="text" className="form-input w-full" value={basicInfo.empName} onChange={e => updateBasicInfo('empName', e.target.value)} /></div>
                            <div><label className="text-xs font-semibold block">Designation</label><input type="text" className="form-input w-full" value={basicInfo.designation} onChange={e => updateBasicInfo('designation', e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-xs font-semibold block">From</label><input type="date" className="form-input w-full" value={basicInfo.fromMonth} onChange={e => updateBasicInfo('fromMonth', e.target.value)} /></div>
                            <div><label className="text-xs font-semibold block">To</label><input type="date" className="form-input w-full" value={basicInfo.toMonth} onChange={e => updateBasicInfo('toMonth', e.target.value)} /></div>
                        </div>
                        <div><label className="text-xs font-semibold block">GR/Order Name</label><textarea className="form-input w-full h-16 text-xs" value={basicInfo.orderNo} onChange={e => updateBasicInfo('orderNo', e.target.value)} /></div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-bold border-b pb-1">2. Configuration</h3>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2 border p-1 rounded"><input type="checkbox" checked={toggles.autoDAMaharashtra} onChange={e => setToggles(p => ({ ...p, autoDAMaharashtra: e.target.checked }))} /><label className="text-sm font-semibold text-blue-600">Auto-DA (Mah)</label></div>
                            <div className="flex items-center gap-2 border p-1 rounded"><input type="checkbox" checked={toggles.autoHRAMaharashtra} onChange={e => setToggles(p => ({ ...p, autoHRAMaharashtra: e.target.checked }))} /><label className="text-sm font-semibold text-purple-600">Auto-HRA (7th PC)</label></div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-semibold block">Employee Category</label>
                                <select className="form-input w-full text-xs" value={basicInfo.category} onChange={e => updateBasicInfo('category', e.target.value)}><option>NPS</option><option>GPF</option></select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold block">City Category (HRA)</label>
                                <select className="form-input w-full text-xs" value={basicInfo.cityCategory} onChange={e => updateBasicInfo('cityCategory', e.target.value)}>
                                    <option value="X">X (Metro - 24/27/30%)</option>
                                    <option value="Y">Y (16/18/20%)</option>
                                    <option value="Z">Z (8/9/10%)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold block">Increment</label>
                                <select className="form-input w-full text-xs" value={basicInfo.incrementMonth} onChange={e => updateBasicInfo('incrementMonth', e.target.value)}><option>No Increment</option><option>January</option><option>July</option><option>Both</option></select>
                            </div>
                        </div>
                        <div className="pt-2 border-t mt-2">
                            <label className="text-xs font-semibold block mb-1">Custom Columns</label>
                            <div className="flex gap-1 mb-2">
                                <input type="text" id="newColInput" className="form-input text-xs" style={{ width: '300px' }} placeholder="Col Name" />
                                <button onClick={() => {
                                    const el = document.getElementById('newColInput');
                                    if (el.value) { addCustomColumn(el.value); el.value = ''; }
                                }} className="bg-blue-600 text-white text-xs px-2 rounded">Add</button>
                            </div>
                            <div className="space-y-1">
                                {customColumns.map(col => (
                                    <div key={col.id} className="flex justify-between items-center text-xs bg-gray-100 p-1 rounded">
                                        <span>{col.label}</span>
                                        <button onClick={() => removeCustomColumn(col.id)} className="text-red-500 font-bold hover:bg-gray-200 px-1 rounded">×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- INPUTS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border-2 border-green-600 rounded-xl bg-green-100 shadow-xl overflow-hidden">
                    <div className="bg-green-200 p-4 border-b-2 border-green-300 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
                            DUE (सध्या दिले जाणारे वेतन )
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {renderComponentInputs('Due', 'due', 'pay', 'Basic Pay')}
                            {renderComponentInputs('Due', 'due', 'daRate', 'DA Rate %')}
                            {renderComponentInputs('Due', 'due', 'hraRate', 'HRA Rate %')}
                            {renderComponentInputs('Due', 'due', 'ta', 'Transport Allowance (TA)')}
                            {customColumns.map(col => (
                                <React.Fragment key={col.id}>
                                    {renderComponentInputs('Due', 'due', col.id, col.label)}
                                </React.Fragment>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-green-300 gap-2">
                            <button
                                onClick={() => setShowDuePromotion(!showDuePromotion)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                            >
                                <span className={showDuePromotion ? "rotate-180 transition-transform" : "transition-transform"}>▼</span>
                                {showDuePromotion ? 'Hide Promotion' : 'Promotion / Timebound'}
                            </button>
                            {showDuePromotion && (
                                <button
                                    onClick={() => setDuePromotionPeriods([...duePromotionPeriods, { from: '', pay: 0, daRate: 0, hraRate: 0, ta: 0, custom: {} }])}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 rounded-lg font-bold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                                >
                                    <span>➕</span> Add Period
                                </button>
                            )}
                        </div>

                        {showDuePromotion && (
                            <div className="mt-6 border-2 border-green-300 rounded-xl bg-white p-4 shadow-inner">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold text-green-800 uppercase tracking-wider">Promotion Periods</span>
                                </div>
                                {duePromotionPeriods.length === 0 ? (
                                    <div className="text-sm text-green-700/60 text-center py-4 italic bg-green-50 rounded-lg border border-green-200">No promotion periods added</div>
                                ) : (
                                    <div className="space-y-3">
                                        {duePromotionPeriods.map((period, index) => (
                                            <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200 shadow-sm relative group">
                                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-green-50">
                                                    <span className="text-xs font-bold text-green-700">Period {index + 1}</span>
                                                    <button
                                                        onClick={() => setDuePromotionPeriods(duePromotionPeriods.filter((_, i) => i !== index))}
                                                        className="text-red-400 hover:text-red-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 transition"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">From</label>
                                                        <input
                                                            type="date"
                                                            value={period.from}
                                                            onChange={(e) => {
                                                                const newDate = e.target.value;
                                                                const updated = [...duePromotionPeriods];
                                                                updated[index].from = newDate;

                                                                // Auto-calculate DA and HRA if date is valid
                                                                if (newDate) {
                                                                    const [y, m] = newDate.split('-').map(Number);
                                                                    const da = getMaharashtraDARate(m, y);
                                                                    const hra = getMaharashtraHRARate(m, y, basicInfo.cityCategory);
                                                                    updated[index].daRate = da;
                                                                    updated[index].hraRate = hra;
                                                                }

                                                                setDuePromotionPeriods(updated);
                                                            }}
                                                            className="form-input w-full text-xs p-1.5 border-green-200 focus:border-green-500 rounded"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Pay</label>
                                                        <input
                                                            type="number"
                                                            value={period.pay}
                                                            onChange={(e) => {
                                                                const updated = [...duePromotionPeriods];
                                                                updated[index].pay = parseFloat(e.target.value) || 0;
                                                                setDuePromotionPeriods(updated);
                                                            }}
                                                            className="form-input w-full text-xs p-1.5 border-green-200 focus:border-green-500 rounded"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">DA%</label>
                                                        <input
                                                            type="number"
                                                            value={period.daRate}
                                                            onChange={(e) => {
                                                                const updated = [...duePromotionPeriods];
                                                                updated[index].daRate = parseFloat(e.target.value) || 0;
                                                                setDuePromotionPeriods(updated);
                                                            }}
                                                            className="form-input w-full text-xs p-1.5 border-green-200 focus:border-green-500 rounded"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">HRA%</label>
                                                        <input
                                                            type="number"
                                                            value={period.hraRate}
                                                            onChange={(e) => {
                                                                const updated = [...duePromotionPeriods];
                                                                updated[index].hraRate = parseFloat(e.target.value) || 0;
                                                                setDuePromotionPeriods(updated);
                                                            }}
                                                            className="form-input w-full text-xs p-1.5 border-green-200 focus:border-green-500 rounded"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">TA</label>
                                                        <input
                                                            type="number"
                                                            value={period.ta || ''}
                                                            onChange={(e) => {
                                                                const updated = [...duePromotionPeriods];
                                                                updated[index].ta = e.target.value;
                                                                setDuePromotionPeriods(updated);
                                                            }}
                                                            className="form-input w-full text-xs p-1.5 border-green-200 focus:border-green-500 rounded"
                                                        />
                                                    </div>
                                                    {customColumns.map(col => (
                                                        <div key={col.id}>
                                                            <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">{col.label}</label>
                                                            <input
                                                                type="number"
                                                                value={(period.custom && period.custom[col.id]) || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...duePromotionPeriods];
                                                                    if (!updated[index].custom) updated[index].custom = {};
                                                                    updated[index].custom[col.id] = e.target.value;
                                                                    setDuePromotionPeriods(updated);
                                                                }}
                                                                className="form-input w-full text-xs p-1.5 border-green-200 focus:border-green-500 rounded"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="border-2 border-orange-600 rounded-xl bg-orange-100 shadow-xl overflow-hidden">
                    <div className="bg-orange-200 p-4 border-b-2 border-orange-300 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                            DRAWN ( पूर्वी दिलेले वेतन)
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {renderComponentInputs('Drawn', 'drawn', 'pay', 'Basic Pay')}
                            {renderComponentInputs('Drawn', 'drawn', 'daRate', 'DA Rate %')}
                            {renderComponentInputs('Drawn', 'drawn', 'hraRate', 'HRA Rate %')}
                            {renderComponentInputs('Drawn', 'drawn', 'ta', 'Transport Allowance (TA)')}
                            {customColumns.map(col => (
                                <React.Fragment key={col.id}>
                                    {renderComponentInputs('Drawn', 'drawn', col.id, col.label)}
                                </React.Fragment>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-orange-300 gap-2">
                            <button
                                onClick={() => setShowDrawnPromotion(!showDrawnPromotion)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                            >
                                <span className={showDrawnPromotion ? "rotate-180 transition-transform" : "transition-transform"}>▼</span>
                                {showDrawnPromotion ? 'Hide Promotion' : 'Promotion / Timebound'}
                            </button>
                            {showDrawnPromotion && (
                                <button
                                    onClick={() => setDrawnPromotionPeriods([...drawnPromotionPeriods, { from: '', pay: 0, daRate: 0, hraRate: 0, ta: 0, custom: {} }])}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-orange-600 text-orange-700 hover:bg-orange-50 rounded-lg font-bold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                                >
                                    <span>➕</span> Add Period
                                </button>
                            )}
                        </div>

                        {showDrawnPromotion && (
                            <div className="mt-6 border-2 border-orange-300 rounded-xl bg-white p-4 shadow-inner">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-bold text-orange-800 uppercase tracking-wider">Promotion Periods</span>
                                </div>
                                {drawnPromotionPeriods.length === 0 ? (
                                    <div className="text-sm text-orange-700/60 text-center py-4 italic bg-orange-50 rounded-lg border border-orange-200">No promotion periods added</div>
                                ) : (
                                    <div className="space-y-3">
                                        {drawnPromotionPeriods.map((period, index) => (
                                            <div key={index} className="bg-orange-50 p-3 rounded-lg border border-orange-200 shadow-sm relative group">
                                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-orange-50">
                                                    <span className="text-xs font-bold text-orange-700">Period {index + 1}</span>
                                                    <button
                                                        onClick={() => setDrawnPromotionPeriods(drawnPromotionPeriods.filter((_, i) => i !== index))}
                                                        className="text-red-400 hover:text-red-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 transition"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">From</label>
                                                        <input
                                                            type="date"
                                                            value={period.from}
                                                            onChange={(e) => {
                                                                const newDate = e.target.value;
                                                                const updated = [...drawnPromotionPeriods];
                                                                updated[index].from = newDate;

                                                                // Auto-calculate DA and HRA if date is valid
                                                                if (newDate) {
                                                                    const [y, m] = newDate.split('-').map(Number);
                                                                    const da = getMaharashtraDARate(m, y);
                                                                    const hra = getMaharashtraHRARate(m, y, basicInfo.cityCategory);
                                                                    updated[index].daRate = da;
                                                                    updated[index].hraRate = hra;
                                                                }

                                                                setDrawnPromotionPeriods(updated);
                                                            }}
                                                            className="form-input w-full text-xs p-1.5 border-orange-200 focus:border-orange-500 rounded"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Pay</label>
                                                        <input
                                                            type="number"
                                                            value={period.pay}
                                                            onChange={(e) => {
                                                                const updated = [...drawnPromotionPeriods];
                                                                updated[index].pay = parseFloat(e.target.value) || 0;
                                                                setDrawnPromotionPeriods(updated);
                                                            }}
                                                            className="form-input w-full text-xs p-1.5 border-orange-200 focus:border-orange-500 rounded"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">DA%</label>
                                                        <input
                                                            type="number"
                                                            value={period.daRate}
                                                            onChange={(e) => {
                                                                const updated = [...drawnPromotionPeriods];
                                                                updated[index].daRate = parseFloat(e.target.value) || 0;
                                                                setDrawnPromotionPeriods(updated);
                                                            }}
                                                            className="form-input w-full text-xs p-1.5 border-orange-200 focus:border-orange-500 rounded"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">HRA%</label>
                                                        <input
                                                            type="number"
                                                            value={period.hraRate}
                                                            onChange={(e) => {
                                                                const updated = [...drawnPromotionPeriods];
                                                                updated[index].hraRate = parseFloat(e.target.value) || 0;
                                                                setDrawnPromotionPeriods(updated);
                                                            }}
                                                            className="form-input w-full text-xs p-1.5 border-orange-200 focus:border-orange-500 rounded"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">TA</label>
                                                        <input
                                                            type="number"
                                                            value={period.ta || ''}
                                                            onChange={(e) => {
                                                                const updated = [...drawnPromotionPeriods];
                                                                updated[index].ta = e.target.value;
                                                                setDrawnPromotionPeriods(updated);
                                                            }}
                                                            className="form-input w-full text-xs p-1.5 border-orange-200 focus:border-orange-500 rounded"
                                                        />
                                                    </div>
                                                    {customColumns.map(col => (
                                                        <div key={col.id}>
                                                            <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">{col.label}</label>
                                                            <input
                                                                type="number"
                                                                value={(period.custom && period.custom[col.id]) || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...drawnPromotionPeriods];
                                                                    if (!updated[index].custom) updated[index].custom = {};
                                                                    updated[index].custom[col.id] = e.target.value;
                                                                    setDrawnPromotionPeriods(updated);
                                                                }}
                                                                className="form-input w-full text-xs p-1.5 border-orange-200 focus:border-orange-500 rounded"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>




            <div className="flex flex-col items-center justify-center mb-8 gap-2">
                <button onClick={generatePDF} className="bg-blue-600 text-white font-bold py-3 px-10 rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105 flex items-center gap-2 text-lg">
                    <span>📥</span> Download PDF Statement
                </button>
            </div>

            {/* --- ON SCREEN PREVIEW (Ref for Header Capture) --- */}
            <div className="card overflow-hidden bg-gray-100 p-4">
                <div className="overflow-x-auto">
                    <div className="bg-white p-8 text-black" style={{ width: '2200px', fontFamily: 'Arial, sans-serif' }}>

                        {/* HEADER SECTION (Captured as Image for Marathi Support) */}
                        <div ref={headerRef} style={{ padding: '10px', background: 'white' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', padding: '0', lineHeight: '1.4', textAlign: 'center' }}>
                                    {basicInfo.orderNo}
                                </h2>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', width: '100%' }}>
                                <div style={{ flex: 1, textAlign: 'left' }}>NAME: <span style={{ fontWeight: 'normal' }}>{basicInfo.empName}</span></div>
                                <div style={{ flex: 1, textAlign: 'center' }}>DESIGNATION: <span style={{ fontWeight: 'normal' }}>{basicInfo.designation}</span></div>
                                <div style={{ flex: 1, textAlign: 'right' }}>PERIOD: <span style={{ fontWeight: 'normal' }}>{basicInfo.fromMonth} TO {basicInfo.toMonth}</span></div>
                            </div>
                        </div>

                        {/* TABLE SECTION (Visual Only - PDF uses AutoTable) */}
                        <div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', tableLayout: 'fixed' }}>
                                <colgroup>
                                    <col style={{ width: '3%' }} />
                                    <col style={{ width: '8%' }} />
                                    <col style={{ width: '6%' }} /> <col style={{ width: '5%' }} /> <col style={{ width: '5%' }} /> <col style={{ width: '5%' }} /> {customColumns.map(c => <col key={c.id} style={{ width: '5%' }} />)} <col style={{ width: '7%' }} />
                                    <col style={{ width: '6%' }} /> <col style={{ width: '5%' }} /> <col style={{ width: '5%' }} /> <col style={{ width: '5%' }} /> {customColumns.map(c => <col key={c.id} style={{ width: '5%' }} />)} <col style={{ width: '7%' }} />
                                    <col style={{ width: '6%' }} /> <col style={{ width: '5%' }} /> <col style={{ width: '5%' }} /> <col style={{ width: '5%' }} /> {customColumns.map(c => <col key={c.id} style={{ width: '5%' }} />)} <col style={{ width: '7%' }} />
                                    {basicInfo.category === 'NPS' ? <><col style={{ width: '5%' }} /><col style={{ width: '5%' }} /></> : <col style={{ width: '10%' }} />}
                                </colgroup>
                                <thead>
                                    <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                        <th rowSpan={2} style={{ border: '1px solid black', padding: '8px' }}>SR</th>
                                        <th rowSpan={2} style={{ border: '1px solid black', padding: '8px' }}>MONTH</th>
                                        <th colSpan={5 + customColumns.length} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#e0e7ff' }}>DUE</th>
                                        <th colSpan={5 + customColumns.length} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#e0e7ff' }}>DRAWN</th>
                                        <th colSpan={5 + customColumns.length} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#e0e7ff' }}>DIFFERENCE</th>
                                        {basicInfo.category === 'NPS' && (
                                            <>
                                                <th rowSpan={2} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#e0e7ff' }}>DCPS<br />10%</th>
                                                <th rowSpan={2} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#e0e7ff' }}>NPS<br />14%</th>
                                            </>
                                        )}
                                    </tr>
                                    <tr style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                        {['PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL'].map((h, i) => <th key={i} style={{ border: '1px solid black', padding: '6px', background: '#f0f0f0' }}>{h}</th>)}
                                        {['PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL'].map((h, i) => <th key={i} style={{ border: '1px solid black', padding: '6px', background: '#f0f0f0' }}>{h}</th>)}
                                        {['PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL'].map((h, i) => <th key={i} style={{ border: '1px solid black', padding: '6px', background: '#f0f0f0' }}>{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {calculationResults.map((row, idx) => {
                                        const nps14 = Math.round(row.diff.total * 0.14);
                                        return (
                                            <tr key={idx} style={{ textAlign: 'center' }}>
                                                <td style={{ border: '1px solid black', padding: '6px' }}>{idx + 1}</td>
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'left', fontWeight: 'bold' }}>
                                                    {row.label}
                                                    {row.isIncrementMonth && <span style={{ marginLeft: '5px', fontSize: '10px', border: '1px solid black', padding: '1px 4px', borderRadius: '3px' }}>INC</span>}
                                                </td>
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.due.pay}</td>
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.due.da}</td>
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.due.hra}</td>
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.due.ta}</td>
                                                {customColumns.map(c => <td key={c.id} style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.due.custom[c.id]}</td>)}
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right', fontWeight: 'bold', background: '#f9f9f9' }}>{row.due.total}</td>
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.drawn.pay}</td>
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.drawn.da}</td>
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.drawn.hra}</td>
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.drawn.ta}</td>
                                                {customColumns.map(c => <td key={c.id} style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.drawn.custom[c.id]}</td>)}
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right', fontWeight: 'bold', background: '#f9f9f9' }}>{row.drawn.total}</td>
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.diff.pay}</td>
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.diff.da}</td>
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.diff.hra}</td>
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.diff.ta}</td>
                                                {customColumns.map(c => <td key={c.id} style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>{row.diff.custom[c.id]}</td>)}
                                                <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right', fontWeight: 'bold', background: '#f9f9f9' }}>{row.diff.total}</td>
                                                {basicInfo.category === 'NPS' && (
                                                    <>
                                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{row.dcps}</td>
                                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{nps14}</td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })}
                                    <tr style={{ fontWeight: 'bold', background: '#e0e0e0' }}>
                                        <td colSpan={2} style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>TOTAL</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.due.pay, 0)}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.due.da, 0)}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.due.hra, 0)}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.due.ta, 0)}</td>
                                        {customColumns.map(c => <td key={c.id} style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + (r.due.custom[c.id] || 0), 0)}</td>)}
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.due.total, 0)}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.drawn.pay, 0)}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.drawn.da, 0)}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.drawn.hra, 0)}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.drawn.ta, 0)}</td>
                                        {customColumns.map(c => <td key={c.id} style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + (r.drawn.custom[c.id] || 0), 0)}</td>)}
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.drawn.total, 0)}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.diff.pay, 0)}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.diff.da, 0)}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.diff.hra, 0)}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.diff.ta, 0)}</td>
                                        {customColumns.map(c => <td key={c.id} style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + (r.diff.custom[c.id] || 0), 0)}</td>)}
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.diff.total, 0)}</td>
                                        {basicInfo.category === 'NPS' && (
                                            <>
                                                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + r.dcps, 0)}</td>
                                                <td style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>{calculationResults.reduce((s, r) => s + Math.round(r.diff.total * 0.14), 0)}</td>
                                            </>
                                        )}
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ArrearsCalculator;