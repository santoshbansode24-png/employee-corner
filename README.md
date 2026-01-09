# 🚀 Smart Employee Salary & Financial Toolkit Suite

A comprehensive, modern web-based application with **three major modules** designed for employee salary management, financial planning, and document utilities.

![Application Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Module Details](#module-details)
- [Screenshots](#screenshots)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The **Smart Employee & Financial Toolkit** is a complete solution for:
- ✅ Government employee salary calculations (Maharashtra)
- ✅ Pension and retirement benefit computations
- ✅ Financial planning and investment calculations
- ✅ Document conversion and processing utilities

**Live Demo**: [http://localhost:3000](http://localhost:3000)

---

## ✨ Features

### 🏢 Section 1: Employee Corner (Main Module)

#### 1️⃣ **Payslip Calculator** (Maharashtra Government Logic)
Complete payslip generation with:
- ✅ **DA Calculation**: Based on current DA rate (55%)
- ✅ **HRA Logic**: Automatic calculation based on DA slabs
  - DA < 25%: X=24%, Y=16%, Z=8%
  - DA 25-49%: X=27%, Y=18%, Z=9%
  - DA ≥ 50%: X=30%, Y=20%, Z=10%
- ✅ **TA Calculation**: Based on salary, city type, and handicap status
- ✅ **Additional Allowances**: NPA (35% of basic), custom allowances
- ✅ **Deductions**: Professional Tax, GIS, DCPS/GPF, advances, income tax
- ✅ **PDF Export**: Modern and traditional formats

**Formula Implemented**:
```
DA = round(Basic × DA Rate / 100)
HRA = round(Basic × applicable rate)
Net Salary = Total Allowances − Total Deductions
```

#### 2️⃣ **Pension Calculator** (Government Pension Rules)
Complete retirement benefit calculation:
- ✅ **Service Length**: Automatic calculation (years, months)
- ✅ **Basic Pension**: 50% of last basic pay
- ✅ **Commuted Pension**: 40% of basic pension
- ✅ **CVP Calculation**: Commuted Pension × 12 × CVP Rate
- ✅ **Family Pension**: 30% of basic pension with DA
- ✅ **Gratuity**: With ₹20,00,000 cap
- ✅ **Leave Encashment**: (Basic + DA) / 30 × leave days

#### 3️⃣ **Pay Scale Viewer** (7th CPC Matrix)
- ✅ **20 Pay Levels**: Complete 7th CPC structure
- ✅ **Increment Calculation**: 3% annual increment
- ✅ **Grade Pay**: For each level
- ✅ **20 Increments**: Detailed progression table

**Increment Formula**:
```
Next Pay = round((Current Pay × 1.03) / 100) × 100
```

#### 4️⃣ **Form-16 Calculator**
Complete income tax computation:
- ✅ **Both Tax Regimes**: Old and New (2024-25)
- ✅ **Standard Deduction**: ₹50,000
- ✅ **Section 80C**: Max ₹1,50,000
- ✅ **Section 80CCD(1B)**: Max ₹50,000
- ✅ **Section 80D**: Medical insurance
- ✅ **Tax Slabs**: Complete breakdown with 4% cess
- ✅ **PDF Generation**: Professional Form-16 format

---

### 💰 Section 2: Financial Calculators

#### 1️⃣ **SIP Calculator**
- ✅ **Monthly/Yearly View**: Detailed breakdown
- ✅ **Step-Up SIP**: Annual increase option
- ✅ **Returns Calculation**: Complete maturity value
- ✅ **Investment Table**: Month-by-month or year-by-year

**Formula**:
```
FV = P × [((1+r)^n − 1)/r] × (1+r)
```

#### 2️⃣ **Fixed Deposit Calculator**
- ✅ **Compound Interest**: Accurate calculation
- ✅ **Multiple Frequencies**: Annual, Semi-annual, Quarterly, Monthly
- ✅ **Maturity Amount**: Principal + Interest

**Formula**:
```
A = P × (1 + r/k)^(k×t)
```

#### 3️⃣ **Loan EMI Calculator**
- ✅ **Monthly EMI**: Precise calculation
- ✅ **Total Interest**: Complete breakdown
- ✅ **Amortization Schedule**: First year detailed view
- ✅ **Principal vs Interest**: Monthly split

**Formula**:
```
EMI = P × r × (1+r)^n / ((1+r)^n − 1)
```

#### 4️⃣ **Loan Eligibility Calculator**
- ✅ **60% Income Rule**: Standard banking practice
- ✅ **Existing EMI**: Consideration
- ✅ **Maximum Loan**: Eligible amount calculation

#### 5️⃣ **Cooperative Society Calculator**
- ✅ **Share Dividend**: Annual and monthly
- ✅ **Monthly Contributions**: Maturity calculation
- ✅ **Society Loans**: EMI calculation
- ✅ **Net Position**: Complete financial overview

---

### 🛠️ Section 3: Utility Tools

#### 1️⃣ **JPG to PDF Converter**
- Upload multiple images
- Reorder pages
- Single/multi-page PDF output

#### 2️⃣ **Word to PDF Converter**
- .doc and .docx support
- Professional PDF output

#### 3️⃣ **PDF to JPG Converter**
- Extract specific pages
- Page range selection
- High-quality image output

#### 4️⃣ **Image Compressor**
- Three compression levels
- Quality preservation
- Size reduction

#### 5️⃣ **PDF Merge**
- Combine multiple PDFs
- Drag-and-drop reordering
- Single output file

#### 6️⃣ **PDF Split**
- Page range extraction
- Specific page selection
- Multiple output files

---

## 🏗️ Technology Stack

### Frontend
- **React 18.2**: Modern UI framework
- **React Router 6**: Client-side routing
- **Vite 5**: Lightning-fast build tool
- **Modern CSS**: Custom design system with:
  - HSL color palette
  - Glassmorphism effects
  - Smooth animations
  - Responsive grid system

### Libraries
- **jsPDF**: PDF generation
- **jsPDF-AutoTable**: Table formatting
- **Chart.js**: Data visualization (optional)
- **Axios**: HTTP client

### Backend (Optional)
- **Node.js + Express**: Server framework
- **MongoDB**: Database for history
- **Multer**: File upload handling
- **Sharp**: Image processing
- **pdf-lib**: PDF manipulation

---

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Modern web browser
- (Optional) MongoDB for data persistence

### Steps

1. **Clone or navigate to the project directory**:
```bash
cd "c:\xampp\htdocs\EMPLOYEE CORNER 1.0"
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open in browser**:
```
http://localhost:3000
```

5. **Build for production** (optional):
```bash
npm run build
```

---

## 🎮 Usage

### Quick Start

1. **Access Dashboard**: Navigate to `http://localhost:3000`
2. **Select Module**: Choose from Employee Corner, Financial Calculators, or Utility Tools
3. **Use Calculator**: Fill in the required fields
4. **View Results**: Get instant calculations
5. **Download PDF**: Export results as needed

### Example: Payslip Calculator

```javascript
// Sample Input
Employee Type: GPF
Basic Salary: ₹50,000
DA Rate: 55%
City: Mumbai (Category X)
Employee Class: Class 1

// Output
Net Salary: ₹97,340.00
```

---

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Payslip Calculator
![Payslip](./screenshots/payslip.png)

### Pension Calculator
![Pension](./screenshots/pension.png)

---

## 📚 Module Details

### Employee Corner

| Calculator | Input Fields | Output | PDF Export |
|------------|-------------|--------|------------|
| Payslip | Basic, DA, City, Class | Net Salary, Breakdown | ✅ Modern & Traditional |
| Pension | DOB, DOJ, Basic Pay | Pension, Gratuity, Leave | ✅ Yes |
| Pay Scale | Level Selection | 20 Increments | ❌ No |
| Form-16 | Salary, Deductions | Tax Calculation | ✅ Yes |

### Financial Calculators

| Calculator | Formula Used | View Options | Export |
|------------|-------------|--------------|--------|
| SIP | FV = P × [((1+r)^n − 1)/r] × (1+r) | Monthly/Yearly | ❌ |
| FD | A = P × (1 + r/k)^(k×t) | Summary | ❌ |
| Loan EMI | EMI = P × r × (1+r)^n / ((1+r)^n − 1) | Amortization | ❌ |
| Loan Eligibility | Inverted EMI Formula | Summary | ❌ |
| Cooperative | Multiple Formulas | Complete | ❌ |

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (Optional)
MONGODB_URI=mongodb://localhost:27017/employee-toolkit

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Customization

#### Update DA Rate
Edit `src/pages/EmployeeCorner/PayslipCalculator.jsx`:
```javascript
daRate: 55  // Change to current DA rate
```

#### Modify Tax Slabs
Edit `src/pages/EmployeeCorner/Form16Calculator.jsx`:
```javascript
// Update tax slab calculations
```

---

## 🎨 Design System

### Color Palette
- **Primary**: HSL(220, 75%, 55%) - Blue
- **Secondary**: HSL(280, 75%, 55%) - Purple
- **Accent**: HSL(160, 75%, 45%) - Green
- **Success**: HSL(142, 76%, 45%)
- **Error**: HSL(0, 84%, 60%)

### Typography
- **Primary Font**: Inter
- **Display Font**: Outfit
- **Base Size**: 16px

### Components
- Modern card designs
- Glassmorphism effects
- Smooth hover animations
- Responsive grid layouts

---

## 🐛 Known Issues

1. **Utility Tools**: File conversion features require backend implementation
2. **PDF Generation**: Large payslips may take a few seconds
3. **Browser Compatibility**: Best viewed in Chrome, Firefox, Edge

---

## 🚀 Future Enhancements

- [ ] User authentication and profiles
- [ ] Save calculation history
- [ ] Export to Excel
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Backend API for file conversions
- [ ] Database integration for history
- [ ] Advanced charts and graphs

---

## � License

**Proprietary** - All rights reserved

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 👨‍💻 Developer

Built with ❤️ using **Google Antigravity IDE**

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: ✅ Active Development

---

## 📞 Support

For issues or questions:
1. Check the documentation above
2. Review the code comments
3. Test with sample data first

---

## 🙏 Acknowledgments

- Maharashtra Government salary rules
- 7th Central Pay Commission guidelines
- Income Tax Department regulations
- Modern web design principles

---

**⭐ Star this project if you find it useful!**
