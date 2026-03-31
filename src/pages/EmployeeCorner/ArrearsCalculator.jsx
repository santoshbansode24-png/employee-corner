import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './ArrearsCalculator.css';

// MUI IMPORTS
import {
    Box, Button, Typography, IconButton, Container
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Download, ChevronLeft, ChevronRight } from '@mui/icons-material';

// UTILS & COMPONENTS
import { calculateArrearsLogic, getMonthYearList, MONTHS } from '../../utils/arrearsCalculations';
import EmployeeDetailsCard from './components/Arrears/EmployeeDetailsCard';
import ConfigurationCard from './components/Arrears/ConfigurationCard';
import DueDrawnCard from './components/Arrears/DueDrawnCard';
import ComponentInputGroup from './components/Arrears/ComponentInputGroup';
import ArrearsTable from './components/Arrears/ArrearsTable';

// --- COMPACT THEME ---
const compactTheme = createTheme({
    components: {
        MuiTextField: { defaultProps: { size: 'small', margin: 'none' } },
        MuiButton: { defaultProps: { size: 'small' } },
        MuiSelect: { defaultProps: { size: 'small' } },
    }
});

const ArrearsCalculator = () => {
    const headerRef = useRef(null);
    const [calculationResults, setCalculationResults] = useState([]);

    // --- STATE MANAGEMENT ---
    const [basicInfo, setBasicInfo] = useState({
        empName: '', designation: '', fromMonth: '2023-01', toMonth: '2023-06',
        orderNo: '', category: 'NPS', incrementMonth: 'July', cityCategory: 'Z'
    });

    const [toggles, setToggles] = useState({
        autoDAMaharashtra: true,
        autoHRAMaharashtra: true,
        promotionEnabled: false
    });

    const [dueComponents, setDueComponents] = useState({ pay: [{ amount: '', from: '' }], daRate: [], hraRate: [], ta: [] });
    const [drawnComponents, setDrawnComponents] = useState({ pay: [{ amount: '', from: '' }], daRate: [], hraRate: [], ta: [] });
    
    const [duePromotionPeriods, setDuePromotionPeriods] = useState([]);
    const [drawnPromotionPeriods, setDrawnPromotionPeriods] = useState([]);

    const [customColumns, setCustomColumns] = useState([]);
    const [newColumn, setNewColumn] = useState({ label: '', type: 'manual', percent: 0 });

    const updateBasicInfo = (key, val) => setBasicInfo(prev => ({ ...prev, [key]: val }));

    const updateComponent = (type, key, idx, field, val) => {
        const setFn = type === 'due' ? setDueComponents : setDrawnComponents;
        setFn(prev => {
            const next = { ...prev };
            if (!next[key]) next[key] = [];
            const list = [...next[key]];
            if (!list[idx]) list[idx] = { amount: '', from: '' };
            list[idx] = { ...list[idx], [field]: val };
            next[key] = list;
            return next;
        });
    };

    const addCustomColumn = () => {
        if (!newColumn.label) return;
        const id = newColumn.label.toLowerCase().replace(/\s+/g, '_');
        setCustomColumns([...customColumns, { ...newColumn, id }]);
        setDueComponents(prev => ({ ...prev, [id]: [] }));
        setDrawnComponents(prev => ({ ...prev, [id]: [] }));
        setNewColumn({ label: '', type: 'manual', percent: 0 });
    };

    // --- CALCULATION TRIGGER ---
    useEffect(() => {
        const results = calculateArrearsLogic({
            basicInfo, dueComponents, drawnComponents, 
            duePromotionPeriods, drawnPromotionPeriods, 
            toggles, customColumns
        });
        setCalculationResults(results);
    }, [basicInfo, dueComponents, drawnComponents, duePromotionPeriods, drawnPromotionPeriods, toggles, customColumns]);

    // --- PDF GENERATION ---
    const generatePDF = async () => {
        const doc = new jsPDF('l', 'mm', 'a3');
        const headerCanvas = await html2canvas(headerRef.current, { scale: 2 });
        const headerImg = headerCanvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(headerImg);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        doc.addImage(headerImg, 'PNG', 0, 5, pdfWidth, imgHeight);

        const tableData = calculationResults.map((r, i) => [
            i + 1, r.label,
            r.due.pay, r.due.da, r.due.hra, r.due.ta, ...customColumns.map(c => r.due.custom[c.id]), r.due.total,
            r.drawn.pay, r.drawn.da, r.drawn.hra, r.drawn.ta, ...customColumns.map(c => r.drawn.custom[c.id]), r.drawn.total,
            r.diff.pay, r.diff.da, r.diff.hra, r.diff.ta, ...customColumns.map(c => r.diff.custom[c.id]), r.diff.total,
            ...(basicInfo.category === 'NPS' ? [r.dcps, Math.round(r.diff.total * 0.14)] : [r.diff.total])
        ]);

        const totalRow = [
            '', 'TOTAL',
            calculationResults.reduce((s, r) => s + r.due.pay, 0),
            calculationResults.reduce((s, r) => s + r.due.da, 0),
            calculationResults.reduce((s, r) => s + r.due.hra, 0),
            calculationResults.reduce((s, r) => s + r.due.ta, 0),
            ...customColumns.map(c => calculationResults.reduce((s, r) => s + (r.due.custom[c.id] || 0), 0)),
            calculationResults.reduce((s, r) => s + r.due.total, 0),
            calculationResults.reduce((s, r) => s + r.drawn.pay, 0),
            calculationResults.reduce((s, r) => s + r.drawn.da, 0),
            calculationResults.reduce((s, r) => s + r.drawn.hra, 0),
            calculationResults.reduce((s, r) => s + r.drawn.ta, 0),
            ...customColumns.map(c => calculationResults.reduce((s, r) => s + (r.drawn.custom[c.id] || 0), 0)),
            calculationResults.reduce((s, r) => s + r.drawn.total, 0),
            calculationResults.reduce((s, r) => s + r.diff.pay, 0),
            calculationResults.reduce((s, r) => s + r.diff.da, 0),
            calculationResults.reduce((s, r) => s + r.diff.hra, 0),
            calculationResults.reduce((s, r) => s + r.diff.ta, 0),
            ...customColumns.map(c => calculationResults.reduce((s, r) => s + (r.diff.custom[c.id] || 0), 0)),
            calculationResults.reduce((s, r) => s + r.diff.total, 0),
            ...(basicInfo.category === 'NPS' ? 
                [calculationResults.reduce((s, r) => s + r.dcps, 0), calculationResults.reduce((s, r) => s + Math.round(r.diff.total * 0.14), 0)] : 
                [calculationResults.reduce((s, r) => s + r.diff.total, 0)])
        ];

        doc.autoTable({
            startY: imgHeight + 10,
            head: [[
                { content: 'SR', rowSpan: 2 }, { content: 'MONTH', rowSpan: 2 },
                { content: 'DUE', colSpan: 5 + customColumns.length, styles: { halign: 'center', fillColor: [224, 231, 255] } },
                { content: 'DRAWN', colSpan: 5 + customColumns.length, styles: { halign: 'center', fillColor: [224, 231, 255] } },
                { content: 'DIFFERENCE', colSpan: 5 + customColumns.length, styles: { halign: 'center', fillColor: [224, 231, 255] } },
                ...(basicInfo.category === 'NPS' ? [{ content: 'DCPS', rowSpan: 2 }, { content: 'NPS 14%', rowSpan: 2 }] : [{ content: 'FINAL', rowSpan: 2 }])
            ], [
                'PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL',
                'PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL',
                'PAY', 'DA', 'HRA', 'TA', ...customColumns.map(c => c.label), 'TOTAL'
            ]],
            body: [...tableData, totalRow],
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
            headStyles: { fillColor: [240, 240, 240], fontStyle: 'bold', halign: 'center' },
            bodyStyles: { halign: 'right' },
            columnStyles: { 1: { halign: 'left', fontStyle: 'bold' } }
        });

        doc.save(`Arrears_Statement_${basicInfo.empName || 'Employee'}.pdf`);
    };

    // --- SHARED RENDER HELPERS ---
    const formatDate = (date) => date ? date.toISOString().split('T')[0].substring(0, 7) : '';
    
    const CustomHeader = ({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => {
        const years = [];
        const currentYear = new Date().getFullYear();
        for (let i = 2015; i <= currentYear + 5; i++) years.push(i);
        return (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, py: 0.5 }}>
                <IconButton onClick={decreaseMonth} disabled={prevMonthButtonDisabled} size="small"><ChevronLeft fontSize="small" /></IconButton>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <select value={MONTHS[date.getMonth()]} onChange={({ target: { value } }) => changeMonth(MONTHS.indexOf(value))} style={{ border: 'none', fontWeight: 'bold' }}>
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={date.getFullYear()} onChange={({ target: { value } }) => changeYear(parseInt(value))} style={{ border: 'none', fontWeight: 'bold' }}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <IconButton onClick={increaseMonth} disabled={nextMonthButtonDisabled} size="small"><ChevronRight fontSize="small" /></IconButton>
            </Box>
        );
    };

    const renderComponentInputs = (type, compKey, label, inputClass) => (
        <ComponentInputGroup 
            type={type} compKey={compKey} label={label} inputClass={inputClass} 
            components={type === 'due' ? dueComponents : drawnComponents}
            updateComponent={updateComponent}
        />
    );

    return (
        <ThemeProvider theme={compactTheme}>
            <div className="arrears-container">
                <div className="arrears-grid">
                    <EmployeeDetailsCard basicInfo={basicInfo} updateBasicInfo={updateBasicInfo} formatDate={formatDate} CustomHeader={CustomHeader} />
                    <ConfigurationCard toggles={toggles} setToggles={setToggles} basicInfo={basicInfo} updateBasicInfo={updateBasicInfo} newColumn={newColumn} setNewColumn={setNewColumn} addCustomColumn={addCustomColumn} />
                    
                    <DueDrawnCard 
                        type="due" title="DUE AMOUNT" subtitle="देय रक्कम"
                        components={dueComponents} updateComponent={updateComponent} toggles={toggles} customColumns={customColumns}
                        renderComponentInputs={renderComponentInputs}
                        addPeriod={() => setDuePromotionPeriods([...duePromotionPeriods, { from: '', pay: 0, daRate: 0, hraRate: 0, ta: 0, custom: {} }])}
                    />

                    <DueDrawnCard 
                        type="drawn" title="DRAWN AMOUNT" subtitle="पूर्वी दिलेले वेतन"
                        components={drawnComponents} updateComponent={updateComponent} toggles={toggles} customColumns={customColumns}
                        renderComponentInputs={renderComponentInputs}
                        addPeriod={() => setDrawnPromotionPeriods([...drawnPromotionPeriods, { from: '', pay: 0, daRate: 0, hraRate: 0, ta: 0, custom: {} }])}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                    <Button variant="contained" size="large" startIcon={<Download />} onClick={generatePDF}
                        sx={{ borderRadius: 8, px: 5, py: 1.5, fontWeight: 700, background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' }}>
                        Download PDF Statement
                    </Button>
                </div>

                <ArrearsTable headerRef={headerRef} basicInfo={basicInfo} customColumns={customColumns} calculationResults={calculationResults} />
            </div>
        </ThemeProvider>
    );
};

export default ArrearsCalculator;