import React from 'react'
import { Link } from 'react-router-dom'

function Dashboard() {
    const modules = [
        {
            title: 'Employee Corner',
            description: 'Comprehensive tools for employee salary, pension, and tax calculations',
            color: 'primary',
            tools: [
                { name: 'Payslip Calculator', path: '/employee/payslip', icon: '💰', desc: 'Maharashtra Govt. Logic' },
                { name: 'Pension Calculator', path: '/employee/pension', icon: '🏦', desc: 'Govt. Pension Rules' },
                { name: 'Arrears Statement', path: '/employee/arrears', icon: '📜', desc: 'Difference Statement' },
                { name: 'Pay Scale Viewer', path: '/employee/payscale', icon: '📊', desc: '7th CPC Matrix' },
                { name: 'Form-16 Calculator', path: '/employee/form16', icon: '📄', desc: 'Income Tax Computation' },
                { name: 'Medical Reimbursement', path: '/employee/medical-reimbursement', icon: '🏥', desc: 'Marathi Form Generator' },
            ]
        },
        {
            title: 'Financial Calculators',
            description: 'Essential financial planning and investment calculators',
            color: 'secondary',
            tools: [
                { name: 'SIP Calculator', path: '/financial/sip', icon: '📈', desc: 'Systematic Investment Plan' },
                { name: 'FD Calculator', path: '/financial/fd', icon: '🏛️', desc: 'Fixed Deposit Returns' },
                { name: 'Loan EMI Calculator', path: '/financial/loan-emi', icon: '🏠', desc: 'Monthly EMI Calculation' },
                { name: 'Loan Eligibility', path: '/financial/loan-eligibility', icon: '✅', desc: 'Check Loan Amount' },
                { name: 'Cooperative Society', path: '/financial/cooperative', icon: '🤝', desc: 'Society Calculations' },
            ]
        },
        {
            title: 'Utility Tools',
            description: 'File conversion and processing utilities',
            color: 'accent',
            tools: [
                { name: 'JPG to PDF', path: '/tools/jpg-to-pdf', icon: '🖼️', desc: 'Convert images to PDF' },
                { name: 'Word to PDF', path: '/tools/word-to-pdf', icon: '📝', desc: 'Convert documents' },
                { name: 'PDF to JPG', path: '/tools/pdf-to-jpg', icon: '🎨', desc: 'Extract images' },
                { name: 'Image Compressor', path: '/tools/image-compressor', icon: '🗜️', desc: 'Reduce file size' },
                { name: 'PDF Merge', path: '/tools/pdf-merge', icon: '🔗', desc: 'Combine PDFs' },
                { name: 'PDF Split', path: '/tools/pdf-split', icon: '✂️', desc: 'Split PDF pages' },
            ]
        }
    ]

    return (
        <div className="animate-fade-in">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Smart Employee & Financial Toolkit</h1>
                <p className="dashboard-subtitle">
                    Your complete solution for salary calculations, financial planning, and document management
                </p>
            </div>

            {modules.map((module, index) => (
                <section key={index} className="mb-8">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold mb-2">{module.title}</h2>
                        <p className="text-neutral-600">{module.description}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                        {module.tools.map((tool, toolIndex) => (
                            <Link
                                key={toolIndex}
                                to={tool.path}
                                className="tool-card animate-fade-in"
                                style={{ animationDelay: `${toolIndex * 50}ms` }}
                            >
                                <div className="tool-icon">{tool.icon}</div>
                                <h3 className="tool-title">{tool.name}</h3>
                                <p className="tool-description">{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            ))}

            <div className="card card-glass mt-8">
                <div className="card-body">
                    <h3 className="text-2xl font-bold mb-4">✨ Features</h3>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">🎯 Accurate Calculations</h4>
                            <p className="text-sm text-neutral-600">
                                All calculators use official government formulas and latest rates
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">📱 Responsive Design</h4>
                            <p className="text-sm text-neutral-600">
                                Works seamlessly on desktop, tablet, and mobile devices
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">💾 Save & Export</h4>
                            <p className="text-sm text-neutral-600">
                                Download results as PDF, Excel, or save to your account
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
