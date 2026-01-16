import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'

// Import pages
import Dashboard from './pages/Dashboard'
import PayslipCalculator from './pages/EmployeeCorner/PayslipCalculator'
import PensionCalculator from './pages/EmployeeCorner/PensionCalculator'
import PayScaleViewer from './pages/EmployeeCorner/PayScaleViewer'
import Form16Calculator from './pages/EmployeeCorner/Form16Calculator'

import ArrearsCalculator from './pages/EmployeeCorner/ArrearsCalculator'
import SIPCalculator from './pages/FinancialCalculators/SIPCalculator'
import FDCalculator from './pages/FinancialCalculators/FDCalculator'
import LoanEMICalculator from './pages/FinancialCalculators/LoanEMICalculator'
import LoanEligibilityCalculator from './pages/FinancialCalculators/LoanEligibilityCalculator'
import CooperativeSocietyCalculator from './pages/FinancialCalculators/CooperativeSocietyCalculator'
import JPGtoPDF from './pages/UtilityTools/JPGtoPDF'
import WordtoPDF from './pages/UtilityTools/WordtoPDF'
import PDFtoJPG from './pages/UtilityTools/PDFtoJPG'
import ImageCompressor from './pages/UtilityTools/ImageCompressor'
import PDFMerge from './pages/UtilityTools/PDFMerge'
import PDFSplit from './pages/UtilityTools/PDFSplit'

function App() {
    return (
        <Router>
            <div className="app-container">
                <div className="main-content">
                    <Sidebar />
                    <main className="content-area">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />

                            {/* Employee Corner Routes */}
                            <Route path="/employee/payslip" element={<PayslipCalculator />} />
                            <Route path="/employee/pension" element={<PensionCalculator />} />
                            <Route path="/employee/payscale" element={<PayScaleViewer />} />

                            <Route path="/employee/arrears" element={<ArrearsCalculator />} />

                            {/* Financial Calculators Routes */}
                            <Route path="/financial/sip" element={<SIPCalculator />} />
                            <Route path="/financial/fd" element={<FDCalculator />} />
                            <Route path="/financial/loan-emi" element={<LoanEMICalculator />} />
                            <Route path="/financial/loan-eligibility" element={<LoanEligibilityCalculator />} />
                            <Route path="/financial/cooperative" element={<CooperativeSocietyCalculator />} />

                            {/* Utility Tools Routes */}
                            <Route path="/tools/jpg-to-pdf" element={<JPGtoPDF />} />
                            <Route path="/tools/word-to-pdf" element={<WordtoPDF />} />
                            <Route path="/tools/pdf-to-jpg" element={<PDFtoJPG />} />
                            <Route path="/tools/image-compressor" element={<ImageCompressor />} />
                            <Route path="/tools/pdf-merge" element={<PDFMerge />} />
                            <Route path="/tools/pdf-split" element={<PDFSplit />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    )
}

function Sidebar() {
    const location = useLocation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const isActive = (path) => location.pathname === path

    const navigationSections = [
        {
            title: 'Employee Corner',
            items: [
                { path: '/employee/payslip', label: 'Payslip Calculator', icon: '💰' },
                { path: '/employee/pension', label: 'Pension Calculator', icon: '🏦' },
                { path: '/employee/arrears', label: 'Arrears Statement', icon: '📜' },
                { path: '/employee/payscale', label: 'Pay Scale Viewer', icon: '📊' },
                { path: '/employee/form16', label: 'Form-16 Calculator', icon: '📄' },

            ]
        },
        {
            title: 'Financial Calculators',
            items: [
                { path: '/financial/sip', label: 'SIP Calculator', icon: '📈' },
                { path: '/financial/fd', label: 'FD Calculator', icon: '🏛️' },
                { path: '/financial/loan-emi', label: 'Loan EMI Calculator', icon: '🏠' },
                { path: '/financial/loan-eligibility', label: 'Loan Eligibility', icon: '✅' },
                { path: '/financial/cooperative', label: 'Cooperative Society', icon: '🤝' },
            ]
        },
        {
            title: 'Utility Tools',
            items: [
                { path: '/tools/jpg-to-pdf', label: 'JPG to PDF', icon: '🖼️' },
                { path: '/tools/word-to-pdf', label: 'Word to PDF', icon: '📝' },
                { path: '/tools/pdf-to-jpg', label: 'PDF to JPG', icon: '🎨' },
                { path: '/tools/image-compressor', label: 'Image Compressor', icon: '🗜️' },
                { path: '/tools/pdf-merge', label: 'PDF Merge', icon: '🔗' },
                { path: '/tools/pdf-split', label: 'PDF Split', icon: '✂️' },
            ]
        }
    ]

    return (
        <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="sidebar-content">
                <div className="logo-section">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <h1 className="logo-title">Smart Toolkit</h1>
                        <p className="logo-subtitle">Employee & Financial Suite</p>
                    </Link>
                </div>

                {navigationSections.map((section, index) => (
                    <nav key={index} className="nav-section">
                        <h2 className="nav-section-title">{section.title}</h2>
                        <ul className="nav-menu">
                            {section.items.map((item) => (
                                <li key={item.path} className="nav-item">
                                    <Link
                                        to={item.path}
                                        className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ))}
            </div>
        </aside>
    )
}

export default App
