import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
// MUI IMPORTS
import {
    Box, Grid, Card, CardContent, TextField, Button, Typography,
    IconButton, Switch, FormControlLabel, Select, MenuItem, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, InputAdornment
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Download, Add, Close, Visibility, ExpandMore, AccountBalance, TrendingDown, AccessTime, ChevronLeft, ChevronRight } from '@mui/icons-material';

// --- COMPACT THEME ---
const compactTheme = createTheme({
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: 12,
        h6: { fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em' },
        subtitle2: { fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' },
    },
    components: {
        MuiTextField: { defaultProps: { size: 'small', variant: 'outlined', InputLabelProps: { shrink: true, style: { fontSize: '0.75rem', fontWeight: 600 } } } },
        MuiSelect: { defaultProps: { size: 'small' } },
        MuiButton: { defaultProps: { size: 'small', disableElevation: true }, styleOverrides: { root: { borderRadius: 6, textTransform: 'none', fontWeight: 600 } } },
        MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' } } },
        MuiTableCell: { styleOverrides: { root: { padding: '6px 12px', borderColor: '#f1f5f9' }, head: { backgroundColor: '#f8fafc', fontWeight: 700, color: '#475569' } } },
    },
    palette: {
        primary: { main: '#2563eb' },
        success: { main: '#10b981', light: '#ecfdf5', contrastText: '#065f46' }, // For Due
        warning: { main: '#f97316', light: '#fff7ed', contrastText: '#9a3412' }, // For Drawn
        text: { primary: '#1e293b', secondary: '#64748b' }
    }
});

// Helper for safe local date formatting (YYYY-MM-DD)
const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const dateLocal = new Date(d.getTime() - (offset * 60 * 1000));
    return dateLocal.toISOString().split('T')[0];
};

// Helper for safe local month formatting (YYYY-MM)
const formatMonth = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const dateLocal = new Date(d.getTime() - (offset * 60 * 1000));
    return dateLocal.toISOString().slice(0, 7);
};

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
    { start: '2021-07-01', end: '2023-12-31', rate: 9 },
    { start: '2024-01-01', end: '2099-12-31', rate: 10 },
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

// --- CUSTOM DATEPICKER HEADER ---
const CustomHeader = ({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 2015; i <= currentYear + 5; i++) years.push(i);
    const months = MONTHS;

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, py: 0.5 }}>
            <IconButton onClick={decreaseMonth} disabled={prevMonthButtonDisabled} size="small"><ChevronLeft fontSize="small" /></IconButton>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <select value={months[date.getMonth()]} onChange={({ target: { value } }) => changeMonth(months.indexOf(value))} style={{ border: 'none', fontWeight: 'bold', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem' }}>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={date.getFullYear()} onChange={({ target: { value } }) => changeYear(parseInt(value))} style={{ border: 'none', fontWeight: 'bold', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem' }}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </Box>
            <IconButton onClick={increaseMonth} disabled={nextMonthButtonDisabled} size="small"><ChevronRight fontSize="small" /></IconButton>
        </Box>
    );
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
        autoHRAMaharashtra: true // Default ON
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
    const [customColumns, setCustomColumns] = useState([]); // Array of { id: string, label: string, type: 'fixed'|'basic_percent', percent: number }
    const [newColumn, setNewColumn] = useState({ label: '', type: 'fixed', percent: '' });

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

    // --- EFFECT: AUTO-UPDATE RATES (DA & HRA) ---
    useEffect(() => {
        if (!basicInfo.fromMonth) return;

        const [year, month] = basicInfo.fromMonth.split('-').map(Number);

        // Calculate Rates
        const daRate = getMaharashtraDARate(month, year);
        const hraRate = getMaharashtraHRARate(month, year, basicInfo.cityCategory);

        // Update Due Components
        setDueComponents(prev => {
            const newComps = { ...prev };

            // Update DA
            if (toggles.autoDAMaharashtra) {
                const list = [...(newComps.daRate || [])];
                if (list.length > 0) {
                    list[0] = { ...list[0], amount: daRate };
                    newComps.daRate = list;
                }
            }

            // Update HRA
            if (toggles.autoHRAMaharashtra) {
                const list = [...(newComps.hraRate || [])];
                if (list.length > 0) {
                    list[0] = { ...list[0], amount: hraRate };
                    newComps.hraRate = list;
                }
            }

            return newComps;
        });

        // Update Drawn Components
        setDrawnComponents(prev => {
            const newComps = { ...prev };

            // Update DA
            if (toggles.autoDAMaharashtra) {
                const list = [...(newComps.daRate || [])];
                if (list.length > 0) {
                    list[0] = { ...list[0], amount: daRate };
                    newComps.daRate = list;
                }
            }

            // Update HRA
            if (toggles.autoHRAMaharashtra) {
                const list = [...(newComps.hraRate || [])];
                if (list.length > 0) {
                    list[0] = { ...list[0], amount: hraRate };
                    newComps.hraRate = list;
                }
            }

            return newComps;
        });

    }, [basicInfo.fromMonth, basicInfo.cityCategory, toggles.autoDAMaharashtra, toggles.autoHRAMaharashtra]);



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

            // Running Overrides for Promotion Periods
            let runningDueTA = null;
            let runningDrawnTA = null;
            const runningDueCustom = {};
            const runningDrawnCustom = {};

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
                if (duePromotionPeriod) {
                    if (duePromotionPeriod.pay > 0) runningPay = duePromotionPeriod.pay;
                    // Update Sticky TA if present
                    if (duePromotionPeriod.ta !== undefined && duePromotionPeriod.ta !== '') {
                        runningDueTA = parseFloat(duePromotionPeriod.ta) || 0;
                    }
                    // Update Sticky Custom if present
                    if (duePromotionPeriod.custom) {
                        Object.keys(duePromotionPeriod.custom).forEach(key => {
                            if (duePromotionPeriod.custom[key] !== undefined && duePromotionPeriod.custom[key] !== '') {
                                runningDueCustom[key] = parseFloat(duePromotionPeriod.custom[key]) || 0;
                            }
                        });
                    }
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
                if (drawnPromotionPeriod) {
                    if (drawnPromotionPeriod.pay > 0) runningDrawnPay = drawnPromotionPeriod.pay;
                    // Update Sticky TA if present
                    if (drawnPromotionPeriod.ta !== undefined && drawnPromotionPeriod.ta !== '') {
                        runningDrawnTA = parseFloat(drawnPromotionPeriod.ta) || 0;
                    }
                    // Update Sticky Custom if present
                    if (drawnPromotionPeriod.custom) {
                        Object.keys(drawnPromotionPeriod.custom).forEach(key => {
                            if (drawnPromotionPeriod.custom[key] !== undefined && drawnPromotionPeriod.custom[key] !== '') {
                                runningDrawnCustom[key] = parseFloat(drawnPromotionPeriod.custom[key]) || 0;
                            }
                        });
                    }
                }

                // --- CALCULATE TOTALS ---
                let duePay = runningPay;
                let drawnPay = runningDrawnPay;
                const isIncrementMonth = isIncrementApplies;

                // Due
                let dueDARate = toggles.autoDAMaharashtra ? getMaharashtraDARate(month, year) : getValueForMonth(dueComponents.daRate, month, year);
                let dueHRA = toggles.autoHRAMaharashtra ? getMaharashtraHRARate(month, year, basicInfo.cityCategory) : getValueForMonth(dueComponents.hraRate, month, year);

                // TA Logic: Use Sticky -> Fallback to Standard
                let dueTA = runningDueTA !== null ? runningDueTA : getValueForMonth(dueComponents.ta, month, year);

                // Override DA and HRA rates if promotion periods specify them (Only for this period, or sticky too? Standard is Sticky for Pay, usually Rates are period specific unless defined otherwise. Let's keep Rates period specific for now as per previous logic, but TA is definitely sticky requested)
                // Actually user asked for TA/Custom. Rates usually auto-calc.
                if (duePromotionPeriod) {
                    if (duePromotionPeriod.daRate > 0) dueDARate = duePromotionPeriod.daRate;
                    if (duePromotionPeriod.hraRate > 0) dueHRA = duePromotionPeriod.hraRate;
                }

                // Custom Columns Due
                let dueCustomTotal = 0;
                const dueCustomValues = {};
                customColumns.forEach(col => {
                    let val = 0;
                    if (col.type === 'basic_percent') {
                        val = Math.round(duePay * (col.percent / 100));
                    } else if (col.type === 'basic_da_percent') {
                        val = Math.round((duePay + dueDAAmt) * (col.percent / 100));
                    } else {
                        val = runningDueCustom[col.id] !== undefined ? runningDueCustom[col.id] : getValueForMonth(dueComponents[col.id] || [], month, year);
                    }
                    dueCustomValues[col.id] = val;
                    dueCustomTotal += val;
                });

                // Minimum HRA Logic
                const getMinHRA = (category) => {
                    if (category === 'X') return 5400;
                    if (category === 'Y') return 3600;
                    if (category === 'Z') return 1800;
                    return 0;
                };
                const minHRA = getMinHRA(basicInfo.cityCategory);

                const dueDAAmt = Math.round(duePay * dueDARate / 100);
                let dueHRAAmt = Math.round(duePay * dueHRA / 100);
                if (dueHRAAmt < minHRA) dueHRAAmt = minHRA;
                const dueTotal = duePay + dueDAAmt + dueHRAAmt + dueTA + dueCustomTotal;

                // Drawn
                let drawnDARate = toggles.autoDAMaharashtra ? getMaharashtraDARate(month, year) : getValueForMonth(drawnComponents.daRate, month, year);
                let drawnHRA = toggles.autoHRAMaharashtra ? getMaharashtraHRARate(month, year, basicInfo.cityCategory) : getValueForMonth(drawnComponents.hraRate, month, year);

                // TA Logic Drawn
                let drawnTA = runningDrawnTA !== null ? runningDrawnTA : getValueForMonth(drawnComponents.ta, month, year);

                // Override Drawn DA and HRA rates if promotion period specifies them
                if (drawnPromotionPeriod) {
                    if (drawnPromotionPeriod.daRate > 0) drawnDARate = drawnPromotionPeriod.daRate;
                    if (drawnPromotionPeriod.hraRate > 0) drawnHRA = drawnPromotionPeriod.hraRate;
                }

                // Custom Columns Drawn
                let drawnCustomTotal = 0;
                const drawnCustomValues = {};
                customColumns.forEach(col => {
                    let val = 0;
                    if (col.type === 'basic_percent') {
                        val = Math.round(drawnPay * (col.percent / 100));
                    } else if (col.type === 'basic_da_percent') {
                        val = Math.round((drawnPay + drawnDAAmt) * (col.percent / 100));
                    } else {
                        val = runningDrawnCustom[col.id] !== undefined ? runningDrawnCustom[col.id] : getValueForMonth(drawnComponents[col.id] || [], month, year);
                    }
                    drawnCustomValues[col.id] = val;
                    drawnCustomTotal += val;
                });

                const drawnDAAmt = Math.round(drawnPay * drawnDARate / 100);
                let drawnHRAAmt = Math.round(drawnPay * drawnHRA / 100);
                if (drawnHRAAmt < minHRA) drawnHRAAmt = minHRA;
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
            let newItem = { ...list[index], [field]: value };

            // AUTO-CALC LOGIC: Recalculate rates when 'From' month changes
            if (field === 'from' && value) {
                const dateObj = new Date(value + "-01"); // value is YYYY-MM
                if (!isNaN(dateObj.getTime())) {
                    const m = dateObj.getMonth() + 1;
                    const y = dateObj.getFullYear();

                    // Auto-DA
                    if (compKey === 'daRate' && toggles.autoDAMaharashtra) {
                        newItem.amount = getMaharashtraDARate(m, y);
                    }
                    // Auto-HRA
                    if (compKey === 'hraRate' && toggles.autoHRAMaharashtra) {
                        newItem.amount = getMaharashtraHRARate(m, y, basicInfo.cityCategory);
                    }
                }
            }

            list[index] = newItem;
            return { ...prev, [compKey]: list };
        });
    };

    const addCustomColumn = () => {
        if (!newColumn.label) return;
        const id = newColumn.label.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        setCustomColumns([...customColumns, {
            id,
            label: newColumn.label,
            type: newColumn.type,
            percent: parseFloat(newColumn.percent) || 0
        }]);

        // Initialize state for this column in both Due and Drawn (only needed if fixed, but safe to add anyway)
        const defaultPeriod = [{ from: basicInfo.fromMonth, to: basicInfo.toMonth, amount: 0 }];
        setDueComponents(prev => ({ ...prev, [id]: defaultPeriod }));
        setDrawnComponents(prev => ({ ...prev, [id]: defaultPeriod }));

        // Reset Form
        setNewColumn({ label: '', type: 'fixed', percent: '' });
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

        // 1. HEADER GENERATION (High Quality Image)
        if (headerRef.current) {
            // Capture header with HIGHER scale for clarity
            const canvas = await html2canvas(headerRef.current, { scale: 4, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);

            // Adjust width to fit page margins (10mm left/right)
            const imgWidth = pageWidth - 20;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            // Use FAST compression to reduce artifacts
            doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight, undefined, 'FAST');
            startY = 10 + imgHeight + 1; // Set table to start below image (REDUCED BUFFER FROM 5 to 1)
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

        // Define Column Ranges for Coloring
        const dueStart = 2; // SR=0, MONTH=1, DUE START=2
        const dueEnd = 2 + (5 + customColumns.length) - 1; // 2 + count - 1

        const drawnStart = dueEnd + 1;
        const drawnEnd = drawnStart + (5 + customColumns.length) - 1;

        const diffStart = drawnEnd + 1;
        const diffEnd = diffStart + (5 + customColumns.length) - 1;

        doc.autoTable({
            startY: startY,
            head: headRows,
            body: bodyData,
            theme: 'grid',
            margin: { top: 10, right: 10, bottom: 10, left: 10 }, // Align table with header image (x=10, width=PageWidth-20)
            headStyles: {
                fillColor: [52, 73, 94], // Default Dark Grey (covers SR, MONTH)
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
                fontSize: 10,
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            styles: {
                fontSize: 9,
                cellPadding: 1.5,
                valign: 'middle',
                halign: 'center', // Center align all text
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                overflow: 'linebreak',
                textColor: [50, 50, 50]
            },
            columnStyles: {
                0: { cellWidth: 10 }, // SR
                1: { cellWidth: 22 }, // MONTH

                // Bold Total Columns
                [dueEnd]: { fontStyle: 'bold' },
                [drawnEnd]: { fontStyle: 'bold' },
                [diffEnd]: { fontStyle: 'bold' },
            },
            didParseCell: function (data) {
                // --- BODY STYLING ---
                if (data.section === 'body') {
                    // Total Row Styling (Dark Grey)
                    if (data.row.index === bodyData.length - 1) {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = [220, 220, 220];
                        data.cell.styles.textColor = [0, 0, 0];
                        return;
                    }

                    // Section Background Colors (Light Tints)
                    // Due Section (Light Green)
                    if (data.column.index >= dueStart && data.column.index <= dueEnd) {
                        data.cell.styles.fillColor = [235, 250, 240];
                    }
                    // Drawn Section (Light Orange)
                    else if (data.column.index >= drawnStart && data.column.index <= drawnEnd) {
                        data.cell.styles.fillColor = [254, 245, 230];
                    }
                    // Difference Section (Light Blue)
                    else if (data.column.index >= diffStart && data.column.index <= diffEnd) {
                        data.cell.styles.fillColor = [235, 245, 251];
                    }
                }

                // --- HEADER STYLING ---
                if (data.section === 'head') {
                    // Due Header (Green)
                    if (data.column.index >= dueStart && data.column.index <= dueEnd) {
                        data.cell.styles.fillColor = [25, 115, 60]; // Darker Green for B&W Print
                    }
                    // Drawn Header (Orange)
                    else if (data.column.index >= drawnStart && data.column.index <= drawnEnd) {
                        data.cell.styles.fillColor = [200, 100, 10]; // Darker Orange/Rust for B&W Print
                    }
                    // Difference Header (Blue)
                    else if (data.column.index >= diffStart && data.column.index <= diffEnd) {
                        data.cell.styles.fillColor = [20, 80, 140]; // Darker Blue for B&W Print
                    }
                    // NPS Headers (Dark Grey/Black)
                    else if (data.column.index > diffEnd) {
                        data.cell.styles.fillColor = [44, 62, 80];
                    }
                }
            },
            didDrawCell: function (data) {
                // Determine column indices for section ends
                // Due Range
                const dueEndIdx = 2 + (5 + customColumns.length) - 1;
                // Drawn Range
                const drawnEndIdx = dueEndIdx + (5 + customColumns.length);
                // Diff Range
                const diffEndIdx = drawnEndIdx + (5 + customColumns.length);

                const sections = [
                    { start: 0, end: 1 }, // SR and Month Section
                    { start: 2, end: dueEndIdx }, // Due Section
                    { start: dueEndIdx + 1, end: drawnEndIdx }, // Drawn Section
                    { start: drawnEndIdx + 1, end: diffEndIdx }, // Difference Section
                    { start: diffEndIdx + 1, end: diffEndIdx + 2 } // DCPS and NPS Section
                ];

                const isHeader = data.section === 'head';
                const isBody = data.section === 'body';
                const isLastRow = data.row.index === bodyData.length - 1;
                const colIdx = data.column.index;

                if (isHeader || isBody) {
                    sections.forEach(sec => {
                        if (colIdx >= sec.start && colIdx <= sec.end) {
                            doc.setDrawColor(0, 0, 0);
                            doc.setLineWidth(0.5); // Thicker line for section box

                            // Right Border (End Column)
                            if (colIdx === sec.end) {
                                doc.line(data.cell.x + data.cell.width, data.cell.y, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                            }
                            // Left Border (Start Column)
                            if (colIdx === sec.start) {
                                doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + data.cell.height);
                            }
                            // Top Border (Header Only) - REMOVE or Make THINNER if user dislikes "Dark Bold"
                            // User said: "I DONT WANT THIS DARK BOLD LINE THERE"
                            // So we remove the bold top border for headers.

                            // Bottom Border (Header Separator & Last Body Row)
                            if (isHeader) {
                                // Draw bold line at bottom of header (Separator)
                                if (data.row.index === headRows.length - 1) {
                                    doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                                }
                                // Draw bold line at top of header (Table Top)
                                if (data.row.index === 0) {
                                    doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
                                }
                            }

                            if (isBody && isLastRow) {
                                doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
                            }
                        }
                    });
                }
            }
        });



        doc.save(`Arrears_${basicInfo.empName.replace(/\s+/g, '_')}.pdf`);
    };

    const renderComponentInputs = (title, type, compKey, label) => {
        const comps = (type === 'due' ? dueComponents[compKey] : drawnComponents[compKey]) || [];
        const isDue = type === 'due';
        const borderColor = isDue ? 'success.main' : 'warning.main';

        return (
            <Grid item xs={12}>
                <Card sx={{ height: '100%', borderLeft: 4, borderColor: borderColor, overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ px: 2, py: 1, bgcolor: '#f8fafc', borderBottom: 1, borderColor: '#e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ color: isDue ? 'success.dark' : 'warning.dark' }}>{label}</Typography>
                        {toggles.promotionEnabled && (
                            <Button size="small" startIcon={<Add sx={{ fontSize: 16 }} />} onClick={() => alert('Feature: Split Period')} sx={{ fontSize: '0.7rem', py: 0, minWidth: 'auto', height: 24 }}>
                                Split
                            </Button>
                        )}
                    </Box>
                    <CardContent sx={{ p: 2, flexGrow: 1, '&:last-child': { pb: 2 } }}>
                        {comps.map((item, idx) => (
                            <Box key={idx} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: idx < comps.length - 1 ? 2 : 0 }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    placeholder="0"
                                    value={item.amount}
                                    onChange={(e) => updateComponent(type, compKey, idx, 'amount', e.target.value)}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Typography variant="body2" fontWeight={600} color="text.secondary">₹</Typography></InputAdornment>,
                                        style: { fontWeight: 700 }
                                    }}
                                />
                                {toggles.promotionEnabled && (
                                    <>
                                        <Box sx={{ width: 120 }}>
                                            <DatePicker
                                                selected={item.from ? new Date(item.from + "-01") : null}
                                                onChange={(date) => updateComponent(type, compKey, idx, 'from', formatMonth(date))}
                                                dateFormat="yyyy-MM" showMonthYearPicker
                                                renderCustomHeader={CustomHeader}
                                                customInput={<TextField fullWidth label="From" />}
                                            />
                                        </Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>to</Typography>
                                        <Box sx={{ width: 120 }}>
                                            <DatePicker
                                                selected={item.to ? new Date(item.to + "-01") : null}
                                                onChange={(date) => updateComponent(type, compKey, idx, 'to', formatMonth(date))}
                                                dateFormat="yyyy-MM" showMonthYearPicker
                                                renderCustomHeader={CustomHeader}
                                                customInput={<TextField fullWidth label="To" />}
                                            />
                                        </Box>
                                    </>
                                )}
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            </Grid>
        );
    };

    return (

        <ThemeProvider theme={compactTheme}>
            <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', py: 4 }}>
                <Container maxWidth={false} disableGutters sx={{ pl: 1.5 }}>
                    {/* --- MAIN HEADER --- */}
                    <Card sx={{ mb: 3, overflow: 'visible' }}>
                        <Box sx={{ p: 2.5, background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)', display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: 2, boxShadow: 2, display: 'flex' }}>
                                <AccountBalance fontSize="medium" />
                            </Box>
                            <Box>
                                <Typography variant="h6" color="text.primary">Arrears Calculator</Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mt: 0.5 }}>
                                    Government Salary Due-Drawn Statement Generator
                                </Typography>
                            </Box>
                        </Box>
                    </Card>

                    <Grid container spacing={3} mb={4}>
                        {/* Column 1: Employee Details */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ p: 2, borderBottom: 1, borderColor: '#f1f5f9', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ bgcolor: 'primary.light', color: 'primary.main', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.7rem', fontWeight: 800 }}>01</Box>
                                    <Typography variant="subtitle2">Employee Details</Typography>
                                </Box>
                                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                                    {/* 2 Column Layout: 3 rows */}
                                    <Grid container spacing={1.5}>
                                        <Grid item xs={6}>
                                            <TextField fullWidth size="medium" label="Name" value={basicInfo.empName} onChange={e => updateBasicInfo('empName', e.target.value)} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField fullWidth size="medium" label="Designation" value={basicInfo.designation} onChange={e => updateBasicInfo('designation', e.target.value)} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <DatePicker
                                                selected={basicInfo.fromMonth ? new Date(basicInfo.fromMonth) : null}
                                                onChange={(date) => updateBasicInfo('fromMonth', formatDate(date))}
                                                dateFormat="yyyy-MM-dd"
                                                renderCustomHeader={CustomHeader}
                                                customInput={<TextField fullWidth size="medium" label="From Month" />}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <DatePicker
                                                selected={basicInfo.toMonth ? new Date(basicInfo.toMonth) : null}
                                                onChange={(date) => updateBasicInfo('toMonth', formatDate(date))}
                                                dateFormat="yyyy-MM-dd"
                                                renderCustomHeader={CustomHeader}
                                                customInput={<TextField fullWidth size="medium" label="To Month" />}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField fullWidth size="medium" multiline rows={2} label="GR / Order Title" value={basicInfo.orderNo} onChange={e => updateBasicInfo('orderNo', e.target.value)} />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Column 2: Configuration */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ p: 2, borderBottom: 1, borderColor: '#f1f5f9', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ bgcolor: 'secondary.light', color: 'secondary.main', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.7rem', fontWeight: 800 }}>02</Box>
                                    <Typography variant="subtitle2">Configuration</Typography>
                                </Box>
                                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                                    <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2, border: 1, borderColor: '#e2e8f0', mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary">Auto-DA (Maharashtra)</Typography>
                                            <Switch size="small" checked={toggles.autoDAMaharashtra} onChange={e => setToggles(p => ({ ...p, autoDAMaharashtra: e.target.checked }))} />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary">Auto-HRA (7th PC)</Typography>
                                            <Switch size="small" checked={toggles.autoHRAMaharashtra} onChange={e => setToggles(p => ({ ...p, autoHRAMaharashtra: e.target.checked }))} color="secondary" />
                                        </Box>
                                    </Box>

                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={12} sm={4}>
                                            <TextField select fullWidth label="Category" value={basicInfo.category} onChange={e => updateBasicInfo('category', e.target.value)}>
                                                <MenuItem value="NPS">NPS</MenuItem><MenuItem value="GPF">GPF</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField select fullWidth label="City (HRA)" value={basicInfo.cityCategory} onChange={e => updateBasicInfo('cityCategory', e.target.value)}>
                                                <MenuItem value="X">X (Metro)</MenuItem><MenuItem value="Y">Y (City)</MenuItem><MenuItem value="Z">Z (Rural)</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField select fullWidth label="Increment" value={basicInfo.incrementMonth} onChange={e => updateBasicInfo('incrementMonth', e.target.value)}>
                                                <MenuItem value="No Increment">None</MenuItem>
                                                <MenuItem value="January">Jan</MenuItem>
                                                <MenuItem value="July">July</MenuItem>
                                                <MenuItem value="Both">Both</MenuItem>
                                            </TextField>
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ my: 2 }} />

                                    <Box>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>CUSTOM COLUMNS</Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                            <TextField
                                                value={newColumn.label}
                                                onChange={(e) => setNewColumn({ ...newColumn, label: e.target.value })}
                                                placeholder="Name (e.g. NPA)"
                                                size="small"
                                                sx={{ flex: 1 }}
                                            />
                                            <Select
                                                value={newColumn.type}
                                                onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
                                                size="small"
                                                sx={{ width: 140, fontSize: '0.8rem' }}
                                            >
                                                <MenuItem value="fixed">Fixed ₹</MenuItem>
                                                <MenuItem value="basic_percent">% of Basic</MenuItem>
                                                <MenuItem value="basic_da_percent">% of Basic+DA</MenuItem>
                                            </Select>
                                            {newColumn.type !== 'fixed' && (
                                                <TextField
                                                    value={newColumn.percent}
                                                    onChange={(e) => setNewColumn({ ...newColumn, percent: e.target.value })}
                                                    placeholder="%"
                                                    type="number"
                                                    size="small"
                                                    sx={{ width: 60 }}
                                                />
                                            )}
                                            <Button variant="contained" sx={{ minWidth: 40, p: 0 }} onClick={addCustomColumn}>+</Button>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {customColumns.map(col => (
                                                <Box key={col.id} sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1, border: 1, borderColor: '#e2e8f0', fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>
                                                    {col.label} {col.type !== 'fixed' && <span style={{ fontSize: '0.6rem', color: '#64748b', marginLeft: '4px' }}>({col.percent}%)</span>}
                                                    <IconButton size="small" onClick={() => removeCustomColumn(col.id)} sx={{ ml: 0.5, p: 0.2 }}><Close sx={{ fontSize: 12 }} /></IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* --- INPUTS GRID --- */}
                    <Grid container spacing={4} sx={{ mb: 8 }}>
                        {/* === DUE SECTION (Green Theme) === */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%', borderTop: 0, overflow: 'visible' }}>
                                {/* Header */}
                                <Box sx={{ mx: 2, mt: -2, p: 2, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', borderRadius: 2, boxShadow: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1, borderRadius: 1 }}><AccountBalance fontSize="small" /></Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="inherit" sx={{ letterSpacing: 1 }}>DUE AMOUNT</Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>देय रक्कम</Typography>
                                    </Box>
                                </Box>
                                <CardContent sx={{ pt: 4, px: 3 }}>
                                    <Grid container spacing={2}>
                                        {renderComponentInputs('Due', 'due', 'pay', 'Basic Pay')}
                                        {renderComponentInputs('Due', 'due', 'daRate', `DA Rate ${toggles.autoDAMaharashtra ? '(Auto)' : ''}`)}
                                        {renderComponentInputs('Due', 'due', 'hraRate', `HRA Rate ${toggles.autoHRAMaharashtra ? '(Auto)' : ''}`)}
                                        {renderComponentInputs('Due', 'due', 'ta', 'Transport Allowance')}
                                        {customColumns.map(col => renderComponentInputs(col.label, 'due', col.id, col.label))}
                                    </Grid>

                                    {/* Promotion Section (Restored) */}
                                    <Divider sx={{ my: 3 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle2" color="primary">Promotion / Timebound Details</Typography>
                                        <Button startIcon={<Add />} size="small" variant="outlined" onClick={() => setDuePromotionPeriods([...duePromotionPeriods, { from: '', pay: 0, daRate: 0, hraRate: 0, ta: 0, custom: {} }])}>Add Period</Button>
                                    </Box>
                                    {duePromotionPeriods.map((period, index) => (
                                        <Paper key={index} elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'success.light', border: '1px solid', borderColor: 'success.main', position: 'relative' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                                <Typography variant="caption" fontWeight="bold" sx={{ bgcolor: 'white', px: 1, borderRadius: 1, border: '1px solid #bbf7d0' }}>Period {index + 1}</Typography>
                                                <IconButton size="small" color="error" onClick={() => setDuePromotionPeriods(duePromotionPeriods.filter((_, i) => i !== index))}><Close fontSize="small" /></IconButton>
                                            </Box>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <DatePicker selected={period.from ? new Date(period.from) : null} onChange={(date) => {
                                                        const newDate = formatDate(date);
                                                        const updated = [...duePromotionPeriods];
                                                        updated[index].from = newDate;
                                                        if (newDate) {
                                                            const dateObj = new Date(newDate);
                                                            const m = dateObj.getMonth() + 1;
                                                            const y = dateObj.getFullYear();
                                                            updated[index].daRate = getMaharashtraDARate(m, y);
                                                            updated[index].hraRate = getMaharashtraHRARate(m, y, basicInfo.cityCategory);
                                                        }
                                                        setDuePromotionPeriods(updated);
                                                    }} customInput={<TextField label="From Date" fullWidth />} dateFormat="yyyy-MM-dd" renderCustomHeader={CustomHeader} />
                                                </Grid>
                                                <Grid item xs={6} md={3}><TextField label="Basic Pay" type="number" value={period.pay} onChange={(e) => { const u = [...duePromotionPeriods]; u[index].pay = parseFloat(e.target.value) || 0; setDuePromotionPeriods(u); }} fullWidth /></Grid>
                                                <Grid item xs={6} md={3}><TextField label="DA %" type="number" value={period.daRate} onChange={(e) => { const u = [...duePromotionPeriods]; u[index].daRate = parseFloat(e.target.value) || 0; setDuePromotionPeriods(u); }} fullWidth /></Grid>
                                                <Grid item xs={6} md={3}><TextField label="HRA %" type="number" value={period.hraRate} onChange={(e) => { const u = [...duePromotionPeriods]; u[index].hraRate = parseFloat(e.target.value) || 0; setDuePromotionPeriods(u); }} fullWidth /></Grid>
                                                <Grid item xs={6} md={3}><TextField label="TA" type="number" value={period.ta} onChange={(e) => { const u = [...duePromotionPeriods]; u[index].ta = e.target.value; setDuePromotionPeriods(u); }} fullWidth /></Grid>
                                                {customColumns.map(col => (
                                                    <Grid item xs={6} md={3} key={col.id}><TextField label={col.label} type="number" value={period.custom?.[col.id] || ''} onChange={(e) => { const u = [...duePromotionPeriods]; if (!u[index].custom) u[index].custom = {}; u[index].custom[col.id] = e.target.value; setDuePromotionPeriods(u); }} fullWidth /></Grid>
                                                ))}
                                            </Grid>
                                        </Paper>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* === DRAWN SECTION (Orange/Red Theme) === */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%', borderTop: 0, overflow: 'visible' }}>
                                {/* Header */}
                                <Box sx={{ mx: 2, mt: -2, p: 2, background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', borderRadius: 2, boxShadow: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1, borderRadius: 1 }}><TrendingDown fontSize="small" /></Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="inherit" sx={{ letterSpacing: 1 }}>DRAWN AMOUNT</Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>पूर्वी दिलेले वेतन</Typography>
                                    </Box>
                                </Box>
                                <CardContent sx={{ pt: 4, px: 3 }}>
                                    <Grid container spacing={2}>
                                        {renderComponentInputs('Drawn', 'drawn', 'pay', 'Basic Pay')}
                                        {renderComponentInputs('Drawn', 'drawn', 'daRate', `DA Rate ${toggles.autoDAMaharashtra ? '(Auto)' : ''}`)}
                                        {renderComponentInputs('Drawn', 'drawn', 'hraRate', `HRA Rate ${toggles.autoHRAMaharashtra ? '(Auto)' : ''}`)}
                                        {renderComponentInputs('Drawn', 'drawn', 'ta', 'Transport Allowance')}
                                        {customColumns.map(col => renderComponentInputs(col.label, 'drawn', col.id, col.label))}
                                    </Grid>

                                    {/* Promotion Section (Restored) */}
                                    <Divider sx={{ my: 3 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle2" color="warning.main">Promotion / Timebound Details</Typography>
                                        <Button startIcon={<Add />} size="small" variant="outlined" color="warning" onClick={() => setDrawnPromotionPeriods([...drawnPromotionPeriods, { from: '', pay: 0, daRate: 0, hraRate: 0, ta: 0, custom: {} }])}>Add Period</Button>
                                    </Box>
                                    {drawnPromotionPeriods.map((period, index) => (
                                        <Paper key={index} elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'warning.light', border: '1px solid', borderColor: 'warning.main', position: 'relative' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                                <Typography variant="caption" fontWeight="bold" sx={{ bgcolor: 'white', px: 1, borderRadius: 1, border: '1px solid #fed7aa' }}>Period {index + 1}</Typography>
                                                <IconButton size="small" color="error" onClick={() => setDrawnPromotionPeriods(drawnPromotionPeriods.filter((_, i) => i !== index))}><Close fontSize="small" /></IconButton>
                                            </Box>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <DatePicker selected={period.from ? new Date(period.from) : null} onChange={(date) => {
                                                        const newDate = formatDate(date);
                                                        const updated = [...drawnPromotionPeriods];
                                                        updated[index].from = newDate;
                                                        if (newDate) {
                                                            const dateObj = new Date(newDate);
                                                            const m = dateObj.getMonth() + 1;
                                                            const y = dateObj.getFullYear();
                                                            updated[index].daRate = getMaharashtraDARate(m, y);
                                                            updated[index].hraRate = getMaharashtraHRARate(m, y, basicInfo.cityCategory);
                                                        }
                                                        setDrawnPromotionPeriods(updated);
                                                    }} customInput={<TextField label="From Date" fullWidth />} dateFormat="yyyy-MM-dd" renderCustomHeader={CustomHeader} />
                                                </Grid>
                                                <Grid item xs={6} md={3}><TextField label="Basic Pay" type="number" value={period.pay} onChange={(e) => { const u = [...drawnPromotionPeriods]; u[index].pay = parseFloat(e.target.value) || 0; setDrawnPromotionPeriods(u); }} fullWidth /></Grid>
                                                <Grid item xs={6} md={3}><TextField label="DA %" type="number" value={period.daRate} onChange={(e) => { const u = [...drawnPromotionPeriods]; u[index].daRate = parseFloat(e.target.value) || 0; setDrawnPromotionPeriods(u); }} fullWidth /></Grid>
                                                <Grid item xs={6} md={3}><TextField label="HRA %" type="number" value={period.hraRate} onChange={(e) => { const u = [...drawnPromotionPeriods]; u[index].hraRate = parseFloat(e.target.value) || 0; setDrawnPromotionPeriods(u); }} fullWidth /></Grid>
                                                <Grid item xs={6} md={3}><TextField label="TA" type="number" value={period.ta} onChange={(e) => { const u = [...drawnPromotionPeriods]; u[index].ta = e.target.value; setDrawnPromotionPeriods(u); }} fullWidth /></Grid>
                                                {customColumns.map(col => (
                                                    <Grid item xs={6} md={3} key={col.id}><TextField label={col.label} type="number" value={period.custom?.[col.id] || ''} onChange={(e) => { const u = [...drawnPromotionPeriods]; if (!u[index].custom) u[index].custom = {}; u[index].custom[col.id] = e.target.value; setDrawnPromotionPeriods(u); }} fullWidth /></Grid>
                                                ))}
                                            </Grid>
                                        </Paper>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>




                    {/* --- ACTION FOOTER --- */}
                    <Box sx={{ position: 'sticky', bottom: 24, display: 'flex', justifyContent: 'center', zIndex: 100 }}>
                        <Button variant="contained" size="large" startIcon={<Download />} onClick={generatePDF}
                            sx={{
                                borderRadius: 8, px: 5, py: 1.5, fontSize: '1rem', fontWeight: 700,
                                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5)',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 15px 30px -5px rgba(37, 99, 235, 0.6)' },
                                transition: 'all 0.2s ease-in-out'
                            }}>
                            Download PDF Statement
                        </Button>
                    </Box>

                    {/* --- ON SCREEN PREVIEW (Hidden / For Capture) --- */}
                    <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 2, border: '1px solid', borderColor: 'grey.300', opacity: 0.5, '&:hover': { opacity: 1 }, transition: 'opacity 0.3s' }}>
                        <Typography variant="caption" display="block" align="center" sx={{ fontWeight: 'bold', color: 'grey.500', mb: 2, letterSpacing: 2, textTransform: 'uppercase' }}>
                            PDF Generation Preview (Internal)
                        </Typography>
                        <Box sx={{ overflowX: 'auto', p: 1, bgcolor: 'grey.200', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
                            <Box sx={{
                                bgcolor: 'white',
                                p: 4,
                                color: 'black',
                                mx: 'auto',
                                transformOrigin: 'top left',
                                transform: { xs: 'scale(0.5)', md: 'scale(0.75)', lg: 'scale(1)' },
                                transition: 'transform 0.3s',
                                width: '2200px',
                                fontFamily: 'Arial, sans-serif'
                            }}>

                                {/* HEADER SECTION (Captured as Image for Marathi Support) */}
                                <div ref={headerRef} style={{ padding: '0px', background: 'white' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                                        <h2 style={{ fontSize: '30px', fontWeight: 'bold', margin: '0', padding: '0', lineHeight: '1.4', textAlign: 'center', color: '#000' }}>
                                            {basicInfo.orderNo}
                                        </h2>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', width: '100%', color: '#000', borderBottom: '2px solid #000', paddingBottom: '5px' }}>
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
                                            <tr style={{ textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
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
                                            <tr style={{ textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
                                                {['PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL'].map((h, i) => <th key={i} style={{ border: '1px solid black', padding: '6px', background: '#f0f0f0' }}>{h}</th>)}
                                                {['PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL'].map((h, i) => <th key={i} style={{ border: '1px solid black', padding: '6px', background: '#f0f0f0' }}>{h}</th>)}
                                                {['PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL'].map((h, i) => <th key={i} style={{ border: '1px solid black', padding: '6px', background: '#f0f0f0' }}>{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {calculationResults.map((row, idx) => {
                                                const nps14 = Math.round(row.diff.total * 0.14);
                                                return (
                                                    <tr key={idx} style={{ textAlign: 'center', color: '#000' }}>
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
                                            <tr style={{ fontWeight: 'bold', background: '#e0e0e0', color: '#000' }}>
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
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box >
        </ThemeProvider >
    );
};

export default ArrearsCalculator;