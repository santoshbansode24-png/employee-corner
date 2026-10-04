'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
    FileImage, Plus, Trash2, Download, ArrowRight, ArrowLeft, 
    Activity, HeartPulse, Receipt, Sparkles, Loader2, Printer, 
    FileText, CheckCircle2, User, Building, Users, Calendar, 
    Stethoscope, Clock, ShieldCheck 
} from 'lucide-react';
import { 
    MedicalFormData, 
    initialMedicalFormData, 
    calculateMedicalTotals 
} from '@/utils/medicalCalculations';
import MedicalPDFDocument from '@/components/Medical/MedicalPDFDocument';

export default function MedicalPage() {
    const [formData, setFormData] = useState<MedicalFormData>(initialMedicalFormData);
    const [activeTab, setActiveTab] = useState('employee');
    const [newPathology, setNewPathology] = useState({ receipt_no: '', date: '', amount: '' });
    const [newMedicine, setNewMedicine] = useState({ receipt_no: '', date: '', amount: '' });
    const [docxLoading, setDocxLoading] = useState(false);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);

    // Auto-calculate room rent totals on days/rate change
    const handleRoomChange = (prefix: 'gw' | 'semi' | 'pvt' | 'icu', field: 'days' | 'rates' | 'total', value: string) => {
        setFormData(prev => {
            const next: MedicalFormData = { ...prev, [`${prefix}_${field}`]: value };
            if (field === 'days' || field === 'rates') {
                const days = field === 'days' ? Number(value) || 0 : Number((prev as any)[`${prefix}_days`]) || 0;
                const rate = field === 'rates' ? Number(value) || 0 : Number((prev as any)[`${prefix}_rates`]) || 0;
                (next as any)[`${prefix}_total`] = (days > 0 && rate > 0) ? (days * rate) : (days * rate || '');
            }
            return next;
        });
    };

    // Handle standard inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Calculate duration of hospitalization in days
    const hospitalizationDays = useMemo(() => {
        if (!formData.admit_date_from || !formData.admit_date_to) return null;
        const d1 = new Date(formData.admit_date_from);
        const d2 = new Date(formData.admit_date_to);
        const diffTime = d2.getTime() - d1.getTime();
        if (diffTime < 0) return 0;
        return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of discharge day
    }, [formData.admit_date_from, formData.admit_date_to]);

    // Handle Receipt Arrays
    const addPathology = () => {
        if (!newPathology.receipt_no || !newPathology.amount) return;
        setFormData(prev => ({ ...prev, pathology_receipts: [...prev.pathology_receipts, newPathology] }));
        setNewPathology({ receipt_no: '', date: '', amount: '' });
    };

    const addMedicine = () => {
        if (!newMedicine.receipt_no || !newMedicine.amount) return;
        setFormData(prev => ({ ...prev, medicine_receipts: [...prev.medicine_receipts, newMedicine] }));
        setNewMedicine({ receipt_no: '', date: '', amount: '' });
    };

    const removePathology = (idx: number) => {
        setFormData(prev => ({ ...prev, pathology_receipts: prev.pathology_receipts.filter((_, i) => i !== idx) }));
    };

    const removeMedicine = (idx: number) => {
        setFormData(prev => ({ ...prev, medicine_receipts: prev.medicine_receipts.filter((_, i) => i !== idx) }));
    };

    // Calculate totals on the fly using useMemo
    const totals = useMemo(() => calculateMedicalTotals(formData), [formData]);

    // Load sample data for 1-click test
    const loadSampleData = () => {
        setFormData({
            emp_name_english: 'Shri Rajesh K. Patil',
            emp_name_designation_marathi: 'श्री. राजेश के. पाटील (सहाय्यक अभियंता)',
            office_name_english: 'Executive Engineer, P.W.D. Division, Pune',
            office_name_marathi: 'कार्यकारी अभियंता, सार्वजनिक बांधकाम विभाग, पुणे',
            emp_designation_english: 'Assistant Engineer Gr-I',
            basic_pay: 56100,
            appointment_date: '2015-08-10',
            res_address_english: 'Flat 402, Shivneri Residency, Kothrud, Pune - 411038',
            patient_name_english: 'Mrs. Sunita R. Patil',
            patient_name: 'सौ. सुनिता राजेश पाटील',
            patient_relation: 'Wife',
            patient_age: 42,
            place_of_illness: 'Pune',
            hospital_name_english: 'Deenanath Mangeshkar Hospital & Research Center, Pune',
            treating_doctor_name_english: 'Dr. Suresh N. Joshi, MS (Gen Surgery)',
            admit_date_from: '2025-01-12',
            admit_date_to: '2025-01-16',

            gw_days: '', gw_rates: '', gw_total: 0,
            semi_days: 4, semi_rates: 1800, semi_total: 7200,
            pvt_days: '', pvt_rates: '', pvt_total: 0,
            icu_days: 1, icu_rates: 4500, icu_total: 4500,

            pathology_receipts: [
                { receipt_no: 'DMH-LAB-10492', date: '2025-01-12', amount: 1650 },
                { receipt_no: 'DMH-LAB-10515', date: '2025-01-13', amount: 2800 },
                { receipt_no: 'DMH-LAB-10602', date: '2025-01-15', amount: 950 }
            ],
            medicine_receipts: [
                { receipt_no: 'MED-78901', date: '2025-01-12', amount: 4850 },
                { receipt_no: 'MED-78945', date: '2025-01-14', amount: 3620 },
                { receipt_no: 'MED-79012', date: '2025-01-16', amount: 1450 }
            ],

            admission_charges: 1000,
            surgeon_charges: 18000,
            asst_surgeon_charges: 4500,
            anesthesia_charges: 6000,
            ot_charges: 12000,
            ot_assistant_charges: 1500,
            rmo_charges: 2000,
            nursing_charges: 2500,
            iv_infusion_charges: 800,
            doctor_visit_charges: 3000,
            special_visit_charges: 2500,
            monitor_charges: 1500,
            oxygen_charges: 1200,
            radiology_charges: 4500,
            ecg_charges: 500,
            bsl_charges: 300,
            other_charges: 1000,

            m_name_1: 'Mrs. Sunita R. Patil', m_rel_1: 'Wife', m_age_1: 42,
            m_name_2: 'Master Rohan R. Patil', m_rel_2: 'Son', m_age_2: 14,
            m_name_3: 'Kumari Sneha R. Patil', m_rel_3: 'Daughter', m_age_3: 10,
            m_name_4: 'Smt. Parvati K. Patil', m_rel_4: 'Mother', m_age_4: 68,
            m_name_5: '', m_rel_5: '', m_age_5: ''
        });
    };

    // Direct Instant Client-side PDF Generation & Download
    const handleDownloadPDF = async () => {
        if (!formData.emp_name_english && !formData.patient_name_english) {
            alert('Please enter Employee Name or Patient Name before downloading the PDF.');
            return;
        }
        setIsPdfGenerating(true);
        try {
            const { pdf } = await import('@react-pdf/renderer');
            const blob = await pdf(<MedicalPDFDocument data={formData} totals={totals} />).toBlob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeName = (formData.emp_name_english || 'Medical_Claim').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
            a.download = `Medical-Claim-FormCD-${safeName}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => window.URL.revokeObjectURL(url), 2000);
        } catch (error: any) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF: ' + (error?.message || 'Unknown error'));
        } finally {
            setIsPdfGenerating(false);
        }
    };

    // Direct Instant PDF Preview / Print in New Tab
    const handlePreviewPDF = async () => {
        if (!formData.emp_name_english && !formData.patient_name_english) {
            alert('Please enter Employee Name or Patient Name before previewing the PDF.');
            return;
        }
        setIsPdfGenerating(true);
        try {
            const { pdf } = await import('@react-pdf/renderer');
            const blob = await pdf(<MedicalPDFDocument data={formData} totals={totals} />).toBlob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(url), 60000);
        } catch (error: any) {
            console.error('PDF preview failed:', error);
            alert('Failed to preview PDF: ' + (error?.message || 'Unknown error'));
        } finally {
            setIsPdfGenerating(false);
        }
    };

    // Download DOCX template from API route
    const handleDownloadDocx = async () => {
        setDocxLoading(true);
        try {
            const res = await fetch('/api/generate-medical-pdf?format=docx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: formData, totals })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to generate document');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeName = (formData.emp_name_english || 'Medical_Claim').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
            a.download = `Medical-Claim-FormCD-${safeName}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error(error);
            alert('Failed to generate document: ' + error.message);
        } finally {
            setDocxLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-200">
                    <div className="space-y-1 text-center sm:text-left">
                        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight flex items-center gap-3">
                            <FileImage size={32} className="text-blue-600" />
                            Medical Reimbursement Claim (वैद्यकीय प्रतिपूर्ती)
                        </h1>
                        <p className="text-sm text-gray-500">
                            Maharashtra Civil Services (Medical Attendance) Rules — Form C (Essentiality) & Form D (Procedures)
                        </p>
                    </div>

                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={loadSampleData}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-2 font-medium shadow-sm cursor-pointer"
                    >
                        <Sparkles size={16} className="text-amber-500" /> Load Sample Claim
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {/* Tab Navigation */}
                    <div className="flex justify-center mb-8 overflow-x-auto">
                        <TabsList className="bg-white p-1 shadow-sm border border-gray-200 rounded-xl">
                            <TabsTrigger value="employee" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium cursor-pointer">
                                1. Patient & Employee
                            </TabsTrigger>
                            <TabsTrigger value="stay" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium cursor-pointer">
                                2. Room Charges
                            </TabsTrigger>
                            <TabsTrigger value="receipts" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium cursor-pointer">
                                3. Meds & Path
                            </TabsTrigger>
                            <TabsTrigger value="formd" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium cursor-pointer">
                                4. Form D (Procedures)
                            </TabsTrigger>
                            <TabsTrigger value="summary" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold cursor-pointer">
                                5. Summary & Export
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Step 1: Employee, Patient & Family Members */}
                    <TabsContent value="employee" className="m-0 space-y-6">
                        {/* Section A: Employee Details */}
                        <Card className="shadow-md border-blue-100">
                            <CardHeader className="bg-blue-50/70 border-b border-blue-100 py-4">
                                <CardTitle className="text-blue-900 flex items-center gap-2 text-base font-bold">
                                    <User size={18} className="text-blue-600" /> 
                                    I. Government Servant Particulars (शासकीय कर्मचाऱ्याची माहिती)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">Employee Name (English) *</Label>
                                    <Input name="emp_name_english" value={formData.emp_name_english} onChange={handleInputChange} placeholder="Ex: Shri Rajesh K. Patil" className="bg-white" required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">कर्मचाऱ्याचे नाव (मराठी)</Label>
                                    <Input name="emp_name_designation_marathi" value={formData.emp_name_designation_marathi} onChange={handleInputChange} placeholder="उदा: श्री. राजेश के. पाटील" className="bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">Designation / Cadre (पदनाम)</Label>
                                    <Input name="emp_designation_english" value={formData.emp_designation_english} onChange={handleInputChange} placeholder="Ex: Assistant Engineer Gr-I" className="bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">Office / Department (English)</Label>
                                    <Input name="office_name_english" value={formData.office_name_english || ''} onChange={handleInputChange} placeholder="Ex: Executive Engineer, PWD Division, Pune" className="bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">कार्यालयाचे नाव (मराठी)</Label>
                                    <Input name="office_name_marathi" value={formData.office_name_marathi} onChange={handleInputChange} placeholder="उदा: कार्यकारी अभियंता, सा. बां. विभाग, पुणे" className="bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">Basic Pay / मूळ वेतन (₹)</Label>
                                    <Input name="basic_pay" type="number" value={formData.basic_pay} onChange={handleInputChange} placeholder="Ex: 56100" className="bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">Date of Appointment (नियुक्ती दिनांक)</Label>
                                    <Input name="appointment_date" type="date" value={formData.appointment_date} onChange={handleInputChange} className="bg-white" />
                                </div>
                                <div className="space-y-1.5 lg:col-span-2">
                                    <Label className="text-slate-700 font-semibold text-xs">Residential Address (राहण्याचा पत्ता)</Label>
                                    <Input name="res_address_english" value={formData.res_address_english} onChange={handleInputChange} placeholder="Ex: Flat 402, Shivneri Residency, Kothrud, Pune - 411038" className="bg-white" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section B: Patient & Hospital Details */}
                        <Card className="shadow-md border-indigo-100">
                            <CardHeader className="bg-indigo-50/70 border-b border-indigo-100 py-4">
                                <CardTitle className="text-indigo-900 flex items-center justify-between text-base font-bold">
                                    <span className="flex items-center gap-2">
                                        <Stethoscope size={18} className="text-indigo-600" />
                                        II. Patient & Hospitalization Details (रुग्ण व रुग्णालयाचा तपशील)
                                    </span>
                                    {hospitalizationDays !== null && hospitalizationDays > 0 && (
                                        <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                                            <Clock size={13} /> Stay: {hospitalizationDays} Days
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">Patient Name (English) *</Label>
                                    <Input name="patient_name_english" value={formData.patient_name_english} onChange={handleInputChange} placeholder="Ex: Mrs. Sunita R. Patil" className="bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">रुग्णाचे नाव (मराठी)</Label>
                                    <Input name="patient_name" value={formData.patient_name} onChange={handleInputChange} placeholder="उदा: सौ. सुनिता राजेश पाटील" className="bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">Relationship with Employee (नाते)</Label>
                                    <select 
                                        name="patient_relation" 
                                        value={formData.patient_relation} 
                                        onChange={handleInputChange} 
                                        className="w-full h-10 px-3 py-2 text-sm bg-white border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                    >
                                        <option value="Self">Self (स्वतः)</option>
                                        <option value="Wife">Wife (पत्नी)</option>
                                        <option value="Husband">Husband (पती)</option>
                                        <option value="Son">Son (मुलगा)</option>
                                        <option value="Daughter">Daughter (मुलगी)</option>
                                        <option value="Father">Father (वडील)</option>
                                        <option value="Mother">Mother (आई)</option>
                                        <option value="Other">Other Dependent (इतर अवलंबून)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">Patient Age (वय - वर्षे)</Label>
                                    <Input name="patient_age" type="number" value={formData.patient_age} onChange={handleInputChange} placeholder="Ex: 42" className="bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">Place of Illness (आजाराचे ठिकाण)</Label>
                                    <Input name="place_of_illness" value={formData.place_of_illness} onChange={handleInputChange} placeholder="Ex: Pune" className="bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">Treating Doctor / Specialist Name</Label>
                                    <Input name="treating_doctor_name_english" value={formData.treating_doctor_name_english} onChange={handleInputChange} placeholder="Ex: Dr. Suresh N. Joshi, MS" className="bg-white" />
                                </div>
                                <div className="space-y-1.5 lg:col-span-2">
                                    <Label className="text-slate-700 font-semibold text-xs">Hospital Name & Address (रुग्णालयाचे नाव व पत्ता)</Label>
                                    <Input name="hospital_name_english" value={formData.hospital_name_english} onChange={handleInputChange} placeholder="Ex: Deenanath Mangeshkar Hospital, Pune" className="bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">Admission Date (दाखल दिनांक)</Label>
                                    <Input name="admit_date_from" type="date" value={formData.admit_date_from} onChange={handleInputChange} className="bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">Discharge Date (सुट्टी दिनांक)</Label>
                                    <Input name="admit_date_to" type="date" value={formData.admit_date_to} onChange={handleInputChange} className="bg-white" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section C: Dependent Family Members */}
                        <Card className="shadow-md border-emerald-100">
                            <CardHeader className="bg-emerald-50/70 border-b border-emerald-100 py-4">
                                <CardTitle className="text-emerald-900 flex items-center justify-between text-base font-bold">
                                    <span className="flex items-center gap-2">
                                        <Users size={18} className="text-emerald-600" />
                                        III. Dependent Family Members Declaration (अवलंबून असलेले कुटुंब सदस्य)
                                    </span>
                                    <span className="text-xs text-emerald-700 font-normal">Form-C Mandated Details</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <p className="text-xs text-slate-500">
                                    Enter eligible family members wholly dependent on the employee as per Maharashtra Medical Attendance Rules.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                                    {[
                                        { num: 1, nameKey: 'm_name_1', relKey: 'm_rel_1', ageKey: 'm_age_1', defRel: 'Wife/Husband' },
                                        { num: 2, nameKey: 'm_name_2', relKey: 'm_rel_2', ageKey: 'm_age_2', defRel: 'Child 1' },
                                        { num: 3, nameKey: 'm_name_3', relKey: 'm_rel_3', ageKey: 'm_age_3', defRel: 'Child 2' },
                                        { num: 4, nameKey: 'm_name_4', relKey: 'm_rel_4', ageKey: 'm_age_4', defRel: 'Parent' },
                                    ].map((m) => (
                                        <div key={m.num} className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                                            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                                <span>Member {m.num}</span>
                                                <span className="text-[10px] text-slate-400 font-normal">{m.defRel}</span>
                                            </div>
                                            <Input 
                                                name={m.nameKey} 
                                                value={(formData as any)[m.nameKey] || ''} 
                                                onChange={handleInputChange} 
                                                placeholder="Full Name" 
                                                className="h-8 text-xs bg-slate-50/50" 
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input 
                                                    name={m.relKey} 
                                                    value={(formData as any)[m.relKey] || ''} 
                                                    onChange={handleInputChange} 
                                                    placeholder="Relationship" 
                                                    className="h-8 text-xs bg-slate-50/50" 
                                                />
                                                <Input 
                                                    name={m.ageKey} 
                                                    type="number"
                                                    value={(formData as any)[m.ageKey] || ''} 
                                                    onChange={handleInputChange} 
                                                    placeholder="Age" 
                                                    className="h-8 text-xs bg-slate-50/50" 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                    <Button 
                                        type="button" 
                                        onClick={() => setActiveTab('stay')} 
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 flex items-center gap-2 cursor-pointer"
                                    >
                                        Next: Room Charges & Bed Rent <ArrowRight size={18} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Step 2: Stay Rates */}
                    <TabsContent value="stay" className="m-0 space-y-6">
                        <Card className="shadow-lg border-blue-50">
                            <CardHeader className="bg-blue-50/70 border-b border-blue-100">
                                <CardTitle className="text-blue-900 flex items-center justify-between text-lg">
                                    <span className="flex items-center gap-2">
                                        <HeartPulse size={20} className="text-rose-500" /> 
                                        Hospital Room Rent & Bed Charges (रुग्णालय निवास खर्च)
                                    </span>
                                    <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                        Auto-calculated: Days × Rate
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-100 text-slate-700">
                                            <tr>
                                                <th className="px-4 py-3">Ward Category</th>
                                                <th className="px-4 py-3">Admissible Limit</th>
                                                <th className="px-4 py-3">Days Admitted</th>
                                                <th className="px-4 py-3">Daily Rate (₹)</th>
                                                <th className="px-4 py-3">Total Claim (₹)</th>
                                                <th className="px-4 py-3 text-right">Admissible (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {[
                                                { label: 'General Ward', limit: '95% Admissible', prefix: 'gw' as const, factor: 0.95 },
                                                { label: 'Semi-Private Room', limit: '90% Admissible', prefix: 'semi' as const, factor: 0.90 },
                                                { label: 'Private Room', limit: '75% Admissible', prefix: 'pvt' as const, factor: 0.75 },
                                                { label: 'ICU / ICCU', limit: '100% Admissible', prefix: 'icu' as const, factor: 1.0 },
                                            ].map((ward) => {
                                                const totalVal = Number(formData[`${ward.prefix}_total` as keyof MedicalFormData]) || 0;
                                                const admVal = totalVal * ward.factor;
                                                return (
                                                    <tr key={ward.prefix} className="hover:bg-slate-50/80">
                                                        <td className="px-4 py-3 font-semibold text-slate-800">{ward.label}</td>
                                                        <td className="px-4 py-3 text-slate-500 font-medium">{ward.limit}</td>
                                                        <td className="px-4 py-3">
                                                            <Input 
                                                                type="number" 
                                                                value={formData[`${ward.prefix}_days` as keyof MedicalFormData] as string} 
                                                                onChange={(e) => handleRoomChange(ward.prefix, 'days', e.target.value)} 
                                                                placeholder="0"
                                                                className="w-24 bg-white" 
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Input 
                                                                type="number" 
                                                                value={formData[`${ward.prefix}_rates` as keyof MedicalFormData] as string} 
                                                                onChange={(e) => handleRoomChange(ward.prefix, 'rates', e.target.value)} 
                                                                placeholder="0"
                                                                className="w-28 bg-white" 
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Input 
                                                                type="number" 
                                                                value={formData[`${ward.prefix}_total` as keyof MedicalFormData] as string} 
                                                                onChange={(e) => handleRoomChange(ward.prefix, 'total', e.target.value)} 
                                                                className="w-32 bg-slate-50 font-bold" 
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                                                            ₹ {admVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot className="bg-slate-100 font-bold text-slate-800">
                                            <tr>
                                                <td colSpan={4} className="px-4 py-3 text-right">Total Room Rent:</td>
                                                <td className="px-4 py-3 text-blue-900">₹ {totals.stay_total.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3 text-right text-emerald-700">₹ {totals.admissible_stay.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                    <Button type="button" variant="outline" onClick={() => setActiveTab('employee')} className="font-semibold flex items-center gap-2 cursor-pointer">
                                        <ArrowLeft size={16} /> Patient Info
                                    </Button>
                                    <Button type="button" onClick={() => setActiveTab('receipts')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 flex items-center gap-2 cursor-pointer">
                                        Next: Meds & Path <ArrowRight size={18} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Step 3: Receipts (Pathology and Medicines) */}
                    <TabsContent value="receipts" className="m-0 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Pathology */}
                            <Card className="shadow-md border-purple-50">
                                <CardHeader className="bg-purple-50/70 border-b border-purple-100">
                                    <CardTitle className="text-purple-900 text-lg flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Receipt size={18}/> Pathology / Lab Tests</span>
                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-bold">90% Adm</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex gap-2">
                                        <Input placeholder="Receipt No" value={newPathology.receipt_no} onChange={(e) => setNewPathology({...newPathology, receipt_no: e.target.value})} className="bg-white" />
                                        <Input type="date" value={newPathology.date} onChange={(e) => setNewPathology({...newPathology, date: e.target.value})} className="bg-white w-36" />
                                        <Input 
                                            type="number" 
                                            placeholder="₹ Amount" 
                                            value={newPathology.amount} 
                                            onChange={(e) => setNewPathology({...newPathology, amount: e.target.value})} 
                                            onKeyDown={(e) => { if (e.key === 'Enter') addPathology(); }}
                                            className="bg-white w-28" 
                                        />
                                        <Button onClick={addPathology} className="bg-purple-600 hover:bg-purple-700 px-3 cursor-pointer"><Plus size={16}/></Button>
                                    </div>
                                    <div className="bg-slate-50 border rounded-lg overflow-y-auto h-48 divide-y divide-slate-100">
                                        {formData.pathology_receipts.length === 0 ? (
                                            <div className="text-center text-slate-400 py-16 text-sm">No pathology receipts added yet</div>
                                        ) : (
                                            formData.pathology_receipts.map((r, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 hover:bg-white text-sm">
                                                    <span><span className="font-bold text-slate-700">#{r.receipt_no}</span> <span className="text-slate-400 text-xs ml-1">({r.date})</span></span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-bold text-purple-700">₹ {Number(r.amount).toLocaleString('en-IN')}</span>
                                                        <Button variant="ghost" size="sm" onClick={() => removePathology(i)} className="text-red-500 hover:text-red-700 h-6 px-2 cursor-pointer"><Trash2 size={14}/></Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center bg-purple-50/50 p-3 rounded-lg text-sm">
                                        <span className="text-purple-900 font-medium">Total Claim: ₹ {totals.path_total.toLocaleString('en-IN')}</span>
                                        <span className="text-emerald-700 font-bold">Admissible (90%): ₹ {totals.admissible_path.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Medicines */}
                            <Card className="shadow-md border-emerald-50">
                                <CardHeader className="bg-emerald-50/70 border-b border-emerald-100">
                                    <CardTitle className="text-emerald-900 text-lg flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Receipt size={18}/> Medicine & Pharmacy</span>
                                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-bold">90% Adm</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex gap-2">
                                        <Input placeholder="Receipt No" value={newMedicine.receipt_no} onChange={(e) => setNewMedicine({...newMedicine, receipt_no: e.target.value})} className="bg-white" />
                                        <Input type="date" value={newMedicine.date} onChange={(e) => setNewMedicine({...newMedicine, date: e.target.value})} className="bg-white w-36" />
                                        <Input 
                                            type="number" 
                                            placeholder="₹ Amount" 
                                            value={newMedicine.amount} 
                                            onChange={(e) => setNewMedicine({...newMedicine, amount: e.target.value})} 
                                            onKeyDown={(e) => { if (e.key === 'Enter') addMedicine(); }}
                                            className="bg-white w-28" 
                                        />
                                        <Button onClick={addMedicine} className="bg-emerald-600 hover:bg-emerald-700 px-3 cursor-pointer"><Plus size={16}/></Button>
                                    </div>
                                    <div className="bg-slate-50 border rounded-lg overflow-y-auto h-48 divide-y divide-slate-100">
                                        {formData.medicine_receipts.length === 0 ? (
                                            <div className="text-center text-slate-400 py-16 text-sm">No medicine receipts added yet</div>
                                        ) : (
                                            formData.medicine_receipts.map((r, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 hover:bg-white text-sm">
                                                    <span><span className="font-bold text-slate-700">#{r.receipt_no}</span> <span className="text-slate-400 text-xs ml-1">({r.date})</span></span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-bold text-emerald-700">₹ {Number(r.amount).toLocaleString('en-IN')}</span>
                                                        <Button variant="ghost" size="sm" onClick={() => removeMedicine(i)} className="text-red-500 hover:text-red-700 h-6 px-2 cursor-pointer"><Trash2 size={14}/></Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-lg text-sm">
                                        <span className="text-emerald-900 font-medium">Total Claim: ₹ {totals.med_total.toLocaleString('en-IN')}</span>
                                        <span className="text-emerald-700 font-bold">Admissible (90%): ₹ {totals.admissible_meds.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                            <Button type="button" variant="outline" onClick={() => setActiveTab('stay')} className="font-semibold flex items-center gap-2 cursor-pointer">
                                <ArrowLeft size={16} /> Room Charges
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('formd')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 flex items-center gap-2 cursor-pointer">
                                Next: Form D Procedures <ArrowRight size={18} />
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Step 4: Form D (Procedural) Categorized & Perfectly Placed */}
                    <TabsContent value="formd" className="m-0 space-y-6">
                        {/* Group 1: Surgical & OT */}
                        <Card className="shadow-md border-blue-100">
                            <CardHeader className="bg-blue-50/70 border-b border-blue-100 py-3.5">
                                <CardTitle className="text-blue-900 flex items-center justify-between text-base font-bold">
                                    <span className="flex items-center gap-2">
                                        <Activity size={18} className="text-blue-600" />
                                        1. Surgical & Operation Theatre Charges (शस्त्रक्रिया व ओटी खर्च)
                                    </span>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">90% Adm</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <div className="space-y-1.5"><Label className="text-slate-700 font-semibold text-xs">Surgeon Operation Fees (₹)</Label><Input type="number" name="surgeon_charges" value={formData.surgeon_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-1.5"><Label className="text-slate-700 font-semibold text-xs">Assistant Surgeon Charges (₹)</Label><Input type="number" name="asst_surgeon_charges" value={formData.asst_surgeon_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-1.5"><Label className="text-slate-700 font-semibold text-xs">Anesthesia Charges (₹)</Label><Input type="number" name="anesthesia_charges" value={formData.anesthesia_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-1.5"><Label className="text-slate-700 font-semibold text-xs">Operation Theatre (OT) (₹)</Label><Input type="number" name="ot_charges" value={formData.ot_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-1.5"><Label className="text-slate-700 font-semibold text-xs">OT Assistant & Nursing (₹)</Label><Input type="number" name="ot_assistant_charges" value={formData.ot_assistant_charges} onChange={handleInputChange} className="bg-white" /></div>
                            </CardContent>
                        </Card>

                        {/* Group 2: Hospital Care & Doctor Visits */}
                        <Card className="shadow-md border-indigo-100">
                            <CardHeader className="bg-indigo-50/70 border-b border-indigo-100 py-3.5">
                                <CardTitle className="text-indigo-900 flex items-center justify-between text-base font-bold">
                                    <span className="flex items-center gap-2">
                                        <Stethoscope size={18} className="text-indigo-600" />
                                        2. Hospital Care & Professional Visits (रुग्णालय देखभाल व तपासणी)
                                    </span>
                                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold">90% Adm</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <div className="space-y-1.5"><Label className="text-slate-700 font-semibold text-xs">Admission / Registration (₹)</Label><Input type="number" name="admission_charges" value={formData.admission_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-1.5"><Label className="text-slate-700 font-semibold text-xs">Resident Medical Officer (RMO) (₹)</Label><Input type="number" name="rmo_charges" value={formData.rmo_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-1.5"><Label className="text-slate-700 font-semibold text-xs">Nursing Care Charges (₹)</Label><Input type="number" name="nursing_charges" value={formData.nursing_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-1.5"><Label className="text-slate-700 font-semibold text-xs">Doctor Routine Visits (₹)</Label><Input type="number" name="doctor_visit_charges" value={formData.doctor_visit_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-1.5"><Label className="text-slate-700 font-semibold text-xs">Specialist / Consultation Visits (₹)</Label><Input type="number" name="special_visit_charges" value={formData.special_visit_charges} onChange={handleInputChange} className="bg-white" /></div>
                            </CardContent>
                        </Card>

                        {/* Group 3: Diagnostics & Ancillary */}
                        <Card className="shadow-md border-emerald-100">
                            <CardHeader className="bg-emerald-50/70 border-b border-emerald-100 py-3.5">
                                <CardTitle className="text-emerald-900 flex items-center justify-between text-base font-bold">
                                    <span className="flex items-center gap-2">
                                        <HeartPulse size={18} className="text-emerald-600" />
                                        3. Diagnostics & Ancillary Services (निदान व पूरक सेवा खर्च)
                                    </span>
                                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">90% Adm</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <div className="space-y-1.5"><Label className="text-slate-700 font-semibold text-xs">Radiology (X-Ray / CT / MRI) (₹)</Label><Input type="number" name="radiology_charges" value={formData.radiology_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-1.5"><Label className="text-slate-700 font-semibold text-xs">Oxygen / Monitor / IV Infusion (₹)</Label><Input type="number" name="oxygen_charges" value={formData.oxygen_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-1.5"><Label className="text-slate-700 font-semibold text-xs">Other Ancillary Charges (₹)</Label><Input type="number" name="other_charges" value={formData.other_charges} onChange={handleInputChange} className="bg-white" /></div>
                            </CardContent>
                        </Card>

                        {/* Form D Total Banner */}
                        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg">
                            <span className="font-extrabold text-lg">Total Form D Operative & Procedural Charges:</span>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xs text-blue-200">Claimed Amount</div>
                                    <div className="text-xl font-black text-amber-300">₹ {totals.procedural_total.toLocaleString('en-IN')}</div>
                                </div>
                                <div className="text-right border-l border-blue-700 pl-6">
                                    <div className="text-xs text-blue-200">Admissible (90%)</div>
                                    <div className="text-xl font-black text-emerald-300">₹ {totals.admissible_procedural.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <Button type="button" variant="outline" onClick={() => setActiveTab('receipts')} className="font-semibold flex items-center gap-2 cursor-pointer">
                                <ArrowLeft size={16} /> Meds & Path
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('summary')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 flex items-center gap-2 cursor-pointer">
                                Next: Summary & Export <ArrowRight size={18} />
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Step 5: Summary & Export */}
                    <TabsContent value="summary" className="m-0 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-blue-50 border-blue-200 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="text-xs font-bold text-blue-600 uppercase">Room Rent Claim</div>
                                    <div className="text-2xl font-black text-blue-900 mt-1">₹ {totals.stay_total.toLocaleString('en-IN')}</div>
                                    <div className="text-xs text-emerald-700 font-semibold mt-1">Adm: ₹ {totals.admissible_stay.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-indigo-50 border-indigo-200 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="text-xs font-bold text-indigo-600 uppercase">Form D Procedural</div>
                                    <div className="text-2xl font-black text-indigo-900 mt-1">₹ {totals.procedural_total.toLocaleString('en-IN')}</div>
                                    <div className="text-xs text-emerald-700 font-semibold mt-1">Adm: ₹ {totals.admissible_procedural.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-purple-50 border-purple-200 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="text-xs font-bold text-purple-600 uppercase">Pathology Tests</div>
                                    <div className="text-2xl font-black text-purple-900 mt-1">₹ {totals.path_total.toLocaleString('en-IN')}</div>
                                    <div className="text-xs text-emerald-700 font-semibold mt-1">Adm: ₹ {totals.admissible_path.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-emerald-50 border-emerald-200 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="text-xs font-bold text-emerald-600 uppercase">Medicines Claim</div>
                                    <div className="text-2xl font-black text-emerald-900 mt-1">₹ {totals.med_total.toLocaleString('en-IN')}</div>
                                    <div className="text-xs text-emerald-700 font-semibold mt-1">Adm: ₹ {totals.admissible_meds.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Proposal Consolidated Card */}
                        <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl p-8 rounded-2xl">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                <div className="space-y-3 text-center lg:text-left">
                                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold">
                                        <CheckCircle2 size={14} /> Ready for Official Submission
                                    </div>
                                    <h3 className="text-3xl font-black text-white">
                                        Total Claim: <span className="text-amber-400">₹ {totals.grand_claim.toLocaleString('en-IN')}</span>
                                    </h3>
                                    <p className="text-slate-300 text-base">
                                        Sanctionable / Estimated Admissible Amount: 
                                        <span className="text-emerald-400 font-bold ml-2 text-xl">
                                            ₹ {totals.grand_admissible.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </span>
                                    </p>

                                    {!formData.emp_name_english && (
                                        <div className="p-3 bg-amber-500/10 border border-amber-400/30 text-amber-200 rounded-xl text-xs font-medium">
                                            ⚠️ Notice: Please enter Employee Name in Tab 1 (Patient Info) to generate official documents.
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    {/* Direct Instant PDF Generation & Download */}
                                    <Button 
                                        size="lg"
                                        onClick={handleDownloadPDF}
                                        disabled={isPdfGenerating || !formData.emp_name_english}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 h-auto text-base cursor-pointer disabled:opacity-50"
                                    >
                                        {isPdfGenerating ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                <span>Compiling PDF...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download size={20} />
                                                <span>Download Form C & D (PDF)</span>
                                            </>
                                        )}
                                    </Button>

                                    {/* Preview / Print in New Tab */}
                                    <Button 
                                        size="lg"
                                        variant="outline"
                                        onClick={handlePreviewPDF}
                                        disabled={isPdfGenerating || !formData.emp_name_english}
                                        className="bg-slate-800/90 hover:bg-slate-700 text-white border-slate-700 font-semibold py-3.5 px-5 rounded-xl transition-all flex items-center gap-2 h-auto text-base cursor-pointer disabled:opacity-50"
                                    >
                                        <Printer size={18} className="text-indigo-400" />
                                        <span>Preview / Print</span>
                                    </Button>

                                    {/* Pre-filled Official Word DOCX Download */}
                                    <Button 
                                        size="lg"
                                        variant="outline"
                                        onClick={handleDownloadDocx}
                                        disabled={docxLoading || !formData.emp_name_english}
                                        className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700 font-semibold py-3.5 px-5 rounded-xl transition-all flex items-center gap-2 h-auto text-base cursor-pointer disabled:opacity-50"
                                    >
                                        {docxLoading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin text-blue-400" />
                                                <span>Generating Word...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FileText size={18} className="text-blue-400" />
                                                <span>Download Word (.docx)</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <div className="flex justify-start pt-2">
                            <Button type="button" variant="outline" onClick={() => setActiveTab('formd')} className="font-semibold flex items-center gap-2 cursor-pointer">
                                <ArrowLeft size={16} /> Back to Form D Procedures
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
