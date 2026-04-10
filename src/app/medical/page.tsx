"use client";

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useDebounce } from 'use-debounce';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileImage, Activity, HeartPulse, Receipt, Download, Plus, Trash2 } from "lucide-react";
import { MedicalFormData, initialMedicalFormData, calculateMedicalTotals } from '@/utils/medicalCalculations';
const MemoizedMedicalPDF = React.memo(({ data, totals }: { data: MedicalFormData, totals: any }) => {
    const [loading, setLoading] = React.useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/generate-medical-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data, totals })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to generate PDF');
            }

            const isFallback = res.headers.get('X-Fallback') === 'True';
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Medical-Form-${(data.emp_name_english || 'Proposal').replace(/\s+/g, '-')}.${isFallback ? 'docx' : 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: any) {
            console.error(error);
            alert('Failed to generate document: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            size="lg"
            onClick={handleDownload}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2 h-auto text-lg whitespace-nowrap"
            disabled={loading || !data.emp_name_english}
        >
            <Download size={24} />
            {loading ? 'Generating Official Document...' : 'Download Form C/D PDF'}
        </Button>
    );
});

export default function MedicalPage() {
    const [formData, setFormData] = useState<MedicalFormData>(initialMedicalFormData);
    const [newPathology, setNewPathology] = useState({ receipt_no: '', date: '', amount: '' });
    const [newMedicine, setNewMedicine] = useState({ receipt_no: '', date: '', amount: '' });

    // Handle standard inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
    
    // Performance isolation firewall
    const [debouncedFormData] = useDebounce(formData, 800);
    const debouncedTotals = useMemo(() => calculateMedicalTotals(debouncedFormData), [debouncedFormData]);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight flex items-center justify-center gap-3">
                        <FileImage size={36} className="text-blue-600" />
                        Medical Reimbursement
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">Generate Official Form C & D Proposal Instantly</p>
                </div>

                <Tabs defaultValue="employee" className="w-full">
                    {/* Tab Navigation */}
                    <div className="flex justify-center mb-8 overflow-x-auto">
                        <TabsList className="bg-white p-1 shadow-sm border border-gray-100 rounded-xl">
                            <TabsTrigger value="employee" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">1. Patient Info</TabsTrigger>
                            <TabsTrigger value="stay" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">2. Room Charges</TabsTrigger>
                            <TabsTrigger value="receipts" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">3. Meds & Path</TabsTrigger>
                            <TabsTrigger value="formd" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">4. Form D</TabsTrigger>
                            <TabsTrigger value="summary" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">5. Summary</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Step 1: Employee */}
                    <TabsContent value="employee" className="m-0">
                        <Card className="shadow-lg border-blue-50">
                            <CardHeader className="bg-blue-50 border-b border-blue-100"><CardTitle className="text-blue-900 flex items-center gap-2"><Activity size={20}/> Employee & Patient Details</CardTitle></CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2"><Label>Employee Name (English)</Label><Input name="emp_name_english" value={formData.emp_name_english} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Designation</Label><Input name="emp_designation_english" value={formData.emp_designation_english} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Basic Pay (₹)</Label><Input name="basic_pay" type="number" value={formData.basic_pay} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Office Name (Marathi)</Label><Input name="office_name_marathi" value={formData.office_name_marathi} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Appointment Date</Label><Input name="appointment_date" type="date" value={formData.appointment_date} onChange={handleInputChange} className="bg-white" /></div>
                                
                                <div className="col-span-full border-b my-4"></div>

                                <div className="space-y-2"><Label>Patient Name</Label><Input name="patient_name_english" value={formData.patient_name_english} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Relation</Label><Input name="patient_relation" value={formData.patient_relation} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Age</Label><Input name="patient_age" type="number" value={formData.patient_age} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Hospital Name</Label><Input name="hospital_name_english" value={formData.hospital_name_english} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Treating Doctor</Label><Input name="treating_doctor_name_english" value={formData.treating_doctor_name_english} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Place of Illness</Label><Input name="place_of_illness" value={formData.place_of_illness} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Admit Date (From)</Label><Input name="admit_date_from" type="date" value={formData.admit_date_from} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Discharge Date (To)</Label><Input name="admit_date_to" type="date" value={formData.admit_date_to} onChange={handleInputChange} className="bg-white" /></div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Step 2: Stay Rates */}
                    <TabsContent value="stay" className="m-0">
                        <Card className="shadow-lg border-blue-50">
                            <CardHeader className="bg-blue-50 border-b border-blue-100"><CardTitle className="text-blue-900 flex items-center gap-2"><HeartPulse size={20}/> Room Rent Deductions</CardTitle></CardHeader>
                            <CardContent className="pt-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-100 text-slate-700">
                                            <tr>
                                                <th className="px-4 py-3">Ward Type</th>
                                                <th className="px-4 py-3">Days Admitted</th>
                                                <th className="px-4 py-3">Rate (₹)</th>
                                                <th className="px-4 py-3">Total Claimed (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {[
                                                { label: 'General Ward (95% Adm)', prefix: 'gw' },
                                                { label: 'Semi-Private (90% Adm)', prefix: 'semi' },
                                                { label: 'Private Room (75% Adm)', prefix: 'pvt' },
                                                { label: 'ICU (100% Adm)', prefix: 'icu' },
                                            ].map((ward) => (
                                                <tr key={ward.prefix}>
                                                    <td className="px-4 py-3 font-medium text-slate-800">{ward.label}</td>
                                                    <td className="px-4 py-3"><Input type="number" name={`${ward.prefix}_days`} value={formData[`${ward.prefix}_days` as keyof MedicalFormData] as string} onChange={handleInputChange} className="w-24 bg-white" /></td>
                                                    <td className="px-4 py-3"><Input type="number" name={`${ward.prefix}_rates`} value={formData[`${ward.prefix}_rates` as keyof MedicalFormData] as string} onChange={handleInputChange} className="w-28 bg-white" /></td>
                                                    <td className="px-4 py-3"><Input type="number" name={`${ward.prefix}_total`} value={formData[`${ward.prefix}_total` as keyof MedicalFormData] as string} onChange={handleInputChange} className="w-32 bg-slate-50 font-bold" /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Step 3: Receipts (Pathology and Medicines) */}
                    <TabsContent value="receipts" className="m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Pathology */}
                            <Card className="shadow-md border-purple-50">
                                <CardHeader className="bg-purple-50"><CardTitle className="text-purple-900 text-lg flex items-center gap-2"><Receipt size={18}/> Pathology Receipts</CardTitle></CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex gap-2">
                                        <Input placeholder="Receipt No" value={newPathology.receipt_no} onChange={(e) => setNewPathology({...newPathology, receipt_no: e.target.value})} className="bg-white" />
                                        <Input type="date" value={newPathology.date} onChange={(e) => setNewPathology({...newPathology, date: e.target.value})} className="bg-white w-36" />
                                        <Input type="number" placeholder="Amount (₹)" value={newPathology.amount} onChange={(e) => setNewPathology({...newPathology, amount: e.target.value})} className="bg-white w-28" />
                                        <Button onClick={addPathology} className="bg-purple-600 hover:bg-purple-700 px-3"><Plus size={16}/></Button>
                                    </div>
                                    <div className="bg-slate-50 border rounded-lg overflow-y-auto h-48">
                                        {formData.pathology_receipts.map((r, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 border-b border-slate-100 hover:bg-white text-sm">
                                                <span><span className="font-bold text-slate-700">#{r.receipt_no}</span> ({r.date})</span>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-purple-700">₹ {r.amount}</span>
                                                    <Button variant="ghost" size="sm" onClick={() => removePathology(i)} className="text-red-500 h-6 px-2"><Trash2 size={14}/></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-right font-bold text-purple-800">Total Path: ₹ {totals.path_total}</div>
                                </CardContent>
                            </Card>

                            {/* Medicines */}
                            <Card className="shadow-md border-emerald-50">
                                <CardHeader className="bg-emerald-50"><CardTitle className="text-emerald-900 text-lg flex items-center gap-2"><Receipt size={18}/> Medicine Receipts</CardTitle></CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex gap-2">
                                        <Input placeholder="Receipt No" value={newMedicine.receipt_no} onChange={(e) => setNewMedicine({...newMedicine, receipt_no: e.target.value})} className="bg-white" />
                                        <Input type="date" value={newMedicine.date} onChange={(e) => setNewMedicine({...newMedicine, date: e.target.value})} className="bg-white w-36" />
                                        <Input type="number" placeholder="Amount (₹)" value={newMedicine.amount} onChange={(e) => setNewMedicine({...newMedicine, amount: e.target.value})} className="bg-white w-28" />
                                        <Button onClick={addMedicine} className="bg-emerald-600 hover:bg-emerald-700 px-3"><Plus size={16}/></Button>
                                    </div>
                                    <div className="bg-slate-50 border rounded-lg overflow-y-auto h-48">
                                        {formData.medicine_receipts.map((r, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 border-b border-slate-100 hover:bg-white text-sm">
                                                <span><span className="font-bold text-slate-700">#{r.receipt_no}</span> ({r.date})</span>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-emerald-700">₹ {r.amount}</span>
                                                    <Button variant="ghost" size="sm" onClick={() => removeMedicine(i)} className="text-red-500 h-6 px-2"><Trash2 size={14}/></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-right font-bold text-emerald-800">Total Meds: ₹ {totals.med_total}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Step 4: Form D (Procedural) */}
                    <TabsContent value="formd" className="m-0">
                        <Card className="shadow-lg border-blue-50">
                            <CardHeader className="bg-blue-50 border-b border-blue-100"><CardTitle className="text-blue-900 flex items-center gap-2"><Activity size={20}/> Form D Bill Breakdown</CardTitle></CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2"><Label>Admission Charges (₹)</Label><Input type="number" name="admission_charges" value={formData.admission_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Surgeon Charges (₹)</Label><Input type="number" name="surgeon_charges" value={formData.surgeon_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Asst. Surgeon Charges (₹)</Label><Input type="number" name="asst_surgeon_charges" value={formData.asst_surgeon_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Anesthesia Charges (₹)</Label><Input type="number" name="anesthesia_charges" value={formData.anesthesia_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>O.T. Charges (₹)</Label><Input type="number" name="ot_charges" value={formData.ot_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>O.T. Assistant (₹)</Label><Input type="number" name="ot_assistant_charges" value={formData.ot_assistant_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>RMO Charges (₹)</Label><Input type="number" name="rmo_charges" value={formData.rmo_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Nursing Charges (₹)</Label><Input type="number" name="nursing_charges" value={formData.nursing_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Doctor Visits (₹)</Label><Input type="number" name="doctor_visit_charges" value={formData.doctor_visit_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Radiology (X-Ray/MRI) (₹)</Label><Input type="number" name="radiology_charges" value={formData.radiology_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Oxygen Charges (₹)</Label><Input type="number" name="oxygen_charges" value={formData.oxygen_charges} onChange={handleInputChange} className="bg-white" /></div>
                                <div className="space-y-2"><Label>Other Minor Charges (₹)</Label><Input type="number" name="other_charges" value={formData.other_charges} onChange={handleInputChange} className="bg-white" /></div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Step 5: Summary */}
                    <TabsContent value="summary" className="m-0 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-blue-50 border-blue-100 shadow-sm"><CardContent className="p-4"><div className="text-xs font-bold text-blue-500 uppercase">Room Rent Claim</div><div className="text-2xl font-black text-blue-900">₹ {totals.stay_total.toLocaleString('en-IN')}</div></CardContent></Card>
                            <Card className="bg-indigo-50 border-indigo-100 shadow-sm"><CardContent className="p-4"><div className="text-xs font-bold text-indigo-500 uppercase">Form D Procedural Claim</div><div className="text-2xl font-black text-indigo-900">₹ {totals.procedural_total.toLocaleString('en-IN')}</div></CardContent></Card>
                            <Card className="bg-purple-50 border-purple-100 shadow-sm"><CardContent className="p-4"><div className="text-xs font-bold text-purple-500 uppercase">Pathology Claim</div><div className="text-2xl font-black text-purple-900">₹ {totals.path_total.toLocaleString('en-IN')}</div></CardContent></Card>
                            <Card className="bg-emerald-50 border-emerald-100 shadow-sm"><CardContent className="p-4"><div className="text-xs font-bold text-emerald-500 uppercase">Medicines Claim</div><div className="text-2xl font-black text-emerald-900">₹ {totals.med_total.toLocaleString('en-IN')}</div></CardContent></Card>
                        </div>

                        <Card className="bg-slate-900 text-white shadow-xl shadow-slate-900/20 flex flex-col md:flex-row items-center justify-between p-8 rounded-2xl">
                            <div className="space-y-2 mb-6 md:mb-0">
                                <h3 className="text-3xl font-black text-emerald-400">Total Claim: ₹ {totals.grand_claim.toLocaleString('en-IN')}</h3>
                                <div className="text-slate-400 font-medium">Estimated Admissible Final: <span className="text-white font-bold ml-1">₹ {totals.grand_admissible.toLocaleString('en-IN')}</span></div>
                            </div>

                            <MemoizedMedicalPDF data={debouncedFormData} totals={debouncedTotals} />
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
