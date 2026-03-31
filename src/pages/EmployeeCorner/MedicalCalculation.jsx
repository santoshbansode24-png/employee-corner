import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, TextField, Button, Typography,
    IconButton, Stepper, Step, StepLabel, Divider, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Container,
    InputAdornment, List, ListItem, ListItemText, ListItemSecondaryAction,
    Tooltip, CircularProgress, Alert
} from '@mui/material';
import { 
    Person, LocalHospital, Medication, ReceiptLong, Send, 
    Add, Delete, ArrowBack, ArrowForward, Download, 
    CheckCircle, InfoOutlined
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h6: { fontWeight: 700 },
    },
    palette: {
        primary: { main: '#2563eb' },
        secondary: { main: '#64748b' },
    },
    components: {
        MuiTextField: { defaultProps: { size: 'small', variant: 'outlined', InputLabelProps: { shrink: true } } },
        MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 } } },
    }
});

const STEPS = [
    'Employee & Patient',
    'Hospital Stay',
    'Medicines & Path',
    'Bill Charges',
    'Summary & PDF'
];

function MedicalCalculation() {
    const [activeStep, setActiveStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [formData, setFormData] = useState({
        // Step 1: Employee & Patient
        emp_name_designation_marathi: '',
        office_name_marathi: '',
        emp_name_english: '',
        emp_designation_english: '',
        basic_pay: '',
        appointment_date: '',
        res_address_english: '',
        patient_name_english: '',
        patient_name: '',
        patient_relation: '',
        patient_age: '',
        place_of_illness: '',
        hospital_name_english: '',
        treating_doctor_name_english: '',
        admit_date_from: '',
        admit_date_to: '',

        // Step 2: Hospital Stay
        gw_range: ['', ''], gw_days: '', gw_rates: '', gw_total: '',
        semi_range: ['', ''], semi_days: '', semi_rates: '', semi_total: '',
        pvt_range: ['', ''], pvt_days: '', pvt_rates: '', pvt_total: '',
        icu_range: ['', ''], icu_days: '', icu_rates: '', icu_total: '',

        // Step 3: Lists
        pathology_receipts: [],
        medicine_receipts: [],

        // Step 4: Bill Charges
        admission_charges: 0,
        surgeon_charges: 0,
        asst_surgeon_charges: 0,
        anesthesia_charges: 0,
        ot_charges: 0,
        ot_assistant_charges: 0,
        rmo_charges: 0,
        nursing_charges: 0,
        iv_infusion_charges: 0,
        doctor_visit_charges: 0,
        special_visit_charges: 0,
        monitor_charges: 0,
        oxygen_charges: 0,
        radiology_charges: 0,
        ecg_charges: 0,
        bsl_charges: 0,
        other_charges: 0,

        // Family Members
        m_name_1: '', m_rel_1: '', m_age_1: '',
        m_name_2: '', m_rel_2: '', m_age_2: '',
        m_name_3: '', m_rel_3: '', m_age_3: '',
        m_name_4: '', m_rel_4: '', m_age_4: '',
        m_name_5: '', m_rel_5: '', m_age_5: '',
    });

    const [newPathology, setNewPathology] = useState({ receipt_no: '', date: '', amount: '' });
    const [newMedicine, setNewMedicine] = useState({ receipt_no: '', date: '', amount: '' });

    // --- Totals Calculation ---
    const calculateStayTotal = () => {
        return (Number(formData.gw_total) || 0) + 
               (Number(formData.semi_total) || 0) + 
               (Number(formData.pvt_total) || 0) + 
               (Number(formData.icu_total) || 0);
    };

    const calculatePathTotal = () => {
        return formData.pathology_receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    };

    const calculateMedTotal = () => {
        return formData.medicine_receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    };

    const calculateProceduralTotal = () => {
        const fields = [
            'admission_charges', 'surgeon_charges', 'asst_surgeon_charges',
            'anesthesia_charges', 'ot_charges', 'ot_assistant_charges',
            'rmo_charges', 'nursing_charges', 'iv_infusion_charges',
            'doctor_visit_charges', 'special_visit_charges', 'monitor_charges',
            'oxygen_charges', 'radiology_charges', 'ecg_charges',
            'bsl_charges', 'other_charges'
        ];
        return fields.reduce((sum, field) => sum + (Number(formData[field]) || 0), 0);
    };

    const calculateAdmissibleStay = () => {
        return (Number(formData.gw_total) * 0.95 || 0) + 
               (Number(formData.semi_total) * 0.90 || 0) + 
               (Number(formData.pvt_total) * 0.75 || 0) + 
               (Number(formData.icu_total) * 1.0 || 0);
    };

    const totals = {
        stay_total: calculateStayTotal(),
        path_total: calculatePathTotal(),
        med_total: calculateMedTotal(),
        procedural_total: calculateProceduralTotal(),
        form_d_total: calculateProceduralTotal() + calculateStayTotal(),
        grand_claim: calculateProceduralTotal() + calculateStayTotal() + calculateMedTotal() + calculatePathTotal(),
        admissible_stay: calculateAdmissibleStay(),
        admissible_procedural: calculateProceduralTotal() * 0.90,
        admissible_meds: calculateMedTotal() * 0.90,
        admissible_path: calculatePathTotal() * 0.90,
        grand_admissible: calculateAdmissibleStay() + (calculateProceduralTotal() * 0.90) + (calculateMedTotal() * 0.90) + (calculatePathTotal() * 0.90),
        pathology_receipts: formData.pathology_receipts,
        medicine_receipts: formData.medicine_receipts
    };

    // --- Helpers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStayChange = (prefix, field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [`${prefix}_${field}`]: value };
            
            // Auto-calculate total if days and rates are present
            if (field === 'days' || field === 'rates') {
                const days = field === 'days' ? value : prev[`${prefix}_days`];
                const rates = field === 'rates' ? value : prev[`${prefix}_rates`];
                if (days && rates) {
                    newData[`${prefix}_total`] = (Number(days) * Number(rates)).toString();
                }
            }
            return newData;
        });
    };

    const addPathology = () => {
        if (!newPathology.receipt_no || !newPathology.amount) return;
        setFormData(prev => ({
            ...prev,
            pathology_receipts: [...prev.pathology_receipts, newPathology]
        }));
        setNewPathology({ receipt_no: '', date: '', amount: '' });
    };

    const addMedicine = () => {
        if (!newMedicine.receipt_no || !newMedicine.amount) return;
        setFormData(prev => ({
            ...prev,
            medicine_receipts: [...prev.medicine_receipts, newMedicine]
        }));
        setNewMedicine({ receipt_no: '', date: '', amount: '' });
    };

    const removePathology = (index) => {
        setFormData(prev => ({
            ...prev,
            pathology_receipts: prev.pathology_receipts.filter((_, i) => i !== index)
        }));
    };

    const removeMedicine = (index) => {
        setFormData(prev => ({
            ...prev,
            medicine_receipts: prev.medicine_receipts.filter((_, i) => i !== index)
        }));
    };

    const handleNext = () => setActiveStep(prev => prev + 1);
    const handleBack = () => setActiveStep(prev => prev - 1);

    const generatePDF = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/medical-reimbursement/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, ...totals })
            });

            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Medical_Claim_${formData.emp_name_english || 'File'}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setSuccessMessage("PDF generated successfully!");
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render Components ---
    const renderStep0 = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom color="primary">👨‍💼 Employee Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Name & Designation (Marathi)" name="emp_name_designation_marathi" value={formData.emp_name_designation_marathi} onChange={handleInputChange} fullWidth placeholder="नाव व पदनाम (मराठी)" />
                    <TextField label="Office Name (Marathi)" name="office_name_marathi" value={formData.office_name_marathi} onChange={handleInputChange} fullWidth placeholder="कार्यालयाचे नाव" />
                    <TextField label="Employee Name (English)" name="emp_name_english" value={formData.emp_name_english} onChange={handleInputChange} fullWidth />
                    <TextField label="Designation (English)" name="emp_designation_english" value={formData.emp_designation_english} onChange={handleInputChange} fullWidth />
                    <Grid container spacing={2}>
                        <Grid item xs={6}><TextField label="Basic Pay" name="basic_pay" value={formData.basic_pay} onChange={handleInputChange} fullWidth /></Grid>
                        <Grid item xs={6}><TextField label="Appt Date" name="appointment_date" type="date" value={formData.appointment_date} onChange={handleInputChange} fullWidth /></Grid>
                    </Grid>
                    <TextField label="Residential Address" name="res_address_english" value={formData.res_address_english} onChange={handleInputChange} fullWidth multiline rows={2} />
                </Box>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom color="primary">🤒 Patient & Hospital</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Patient Name (English)" name="patient_name_english" value={formData.patient_name_english} onChange={handleInputChange} fullWidth />
                    <TextField label="Patient Name (Marathi)" name="patient_name" value={formData.patient_name} onChange={handleInputChange} fullWidth />
                    <Grid container spacing={2}>
                        <Grid item xs={6}><TextField label="Relation" name="patient_relation" value={formData.patient_relation} onChange={handleInputChange} fullWidth /></Grid>
                        <Grid item xs={6}><TextField label="Age" name="patient_age" value={formData.patient_age} onChange={handleInputChange} fullWidth /></Grid>
                    </Grid>
                    <TextField label="Place of Illness" name="place_of_illness" value={formData.place_of_illness} onChange={handleInputChange} fullWidth />
                    <TextField label="Hospital Name" name="hospital_name_english" value={formData.hospital_name_english} onChange={handleInputChange} fullWidth />
                    <TextField label="Doctor Name" name="treating_doctor_name_english" value={formData.treating_doctor_name_english} onChange={handleInputChange} fullWidth />
                    <Grid container spacing={2}>
                        <Grid item xs={6}><TextField label="Admitted From" name="admit_date_from" type="date" value={formData.admit_date_from} onChange={handleInputChange} fullWidth /></Grid>
                        <Grid item xs={6}><TextField label="Discharged On" name="admit_date_to" type="date" value={formData.admit_date_to} onChange={handleInputChange} fullWidth /></Grid>
                    </Grid>
                </Box>
            </Grid>
        </Grid>
    );

    const renderStep1 = () => (
        <Box>
            <Typography variant="subtitle2" gutterBottom color="primary">🛌 Room Rent Details</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Ward Type</TableCell>
                            <TableCell>Days</TableCell>
                            <TableCell>Rate</TableCell>
                            <TableCell>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {['gw', 'semi', 'pvt', 'icu'].map((prefix) => (
                            <TableRow key={prefix}>
                                <TableCell sx={{ fontWeight: 600 }}>{prefix === 'gw' ? 'General Ward' : prefix === 'semi' ? 'Semi-Private' : prefix === 'pvt' ? 'Private' : 'ICU'}</TableCell>
                                <TableCell><TextField size="small" value={formData[`${prefix}_days`]} onChange={(e) => handleStayChange(prefix, 'days', e.target.value)} sx={{ width: 80 }} /></TableCell>
                                <TableCell><TextField size="small" value={formData[`${prefix}_rates`]} onChange={(e) => handleStayChange(prefix, 'rates', e.target.value)} sx={{ width: 100 }} /></TableCell>
                                <TableCell><TextField size="small" value={formData[`${prefix}_total`]} disabled sx={{ width: 120 }} /></TableCell>
                            </TableRow>
                        ))}
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                            <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>Grand Total Room Rent</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>₹ {calculateStayTotal()}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    const renderStep2 = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom color="primary">🔬 Pathology Receipts</Typography>
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Grid container spacing={1}>
                            <Grid item xs={4}><TextField label="No" value={newPathology.receipt_no} onChange={(e) => setNewPathology({...newPathology, receipt_no: e.target.value})} fullWidth /></Grid>
                            <Grid item xs={4}><TextField label="Date" type="date" value={newPathology.date} onChange={(e) => setNewPathology({...newPathology, date: e.target.value})} fullWidth /></Grid>
                            <Grid item xs={4}><TextField label="Amt" type="number" value={newPathology.amount} onChange={(e) => setNewPathology({...newPathology, amount: e.target.value})} fullWidth /></Grid>
                            <Grid item xs={12}><Button startIcon={<Add />} variant="contained" onClick={addPathology} fullWidth sx={{ mt: 1 }}>Add</Button></Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <List dense sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: 1 }}>
                    {formData.pathology_receipts.map((r, i) => (
                        <ListItem key={i} divider={i !== formData.pathology_receipts.length - 1}>
                            <ListItemText primary={`Rec: ${r.receipt_no}`} secondary={`Amt: ₹${r.amount} | Date: ${r.date}`} />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={() => removePathology(i)} color="error" size="small"><Delete fontSize="small" /></IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                    {formData.pathology_receipts.length === 0 && <ListItem><ListItemText secondary="No receipts added" /></ListItem>}
                </List>
                <Typography align="right" variant="h6" sx={{ mt: 1, color: 'success.main' }}>Total: ₹{calculatePathTotal()}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom color="primary">💊 Medicine Receipts</Typography>
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Grid container spacing={1}>
                            <Grid item xs={4}><TextField label="No" value={newMedicine.receipt_no} onChange={(e) => setNewMedicine({...newMedicine, receipt_no: e.target.value})} fullWidth /></Grid>
                            <Grid item xs={4}><TextField label="Date" type="date" value={newMedicine.date} onChange={(e) => setNewMedicine({...newMedicine, date: e.target.value})} fullWidth /></Grid>
                            <Grid item xs={4}><TextField label="Amt" type="number" value={newMedicine.amount} onChange={(e) => setNewMedicine({...newMedicine, amount: e.target.value})} fullWidth /></Grid>
                            <Grid item xs={12}><Button startIcon={<Add />} variant="contained" onClick={addMedicine} fullWidth sx={{ mt: 1 }}>Add</Button></Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <List dense sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: 1 }}>
                    {formData.medicine_receipts.map((r, i) => (
                        <ListItem key={i} divider={i !== formData.medicine_receipts.length - 1}>
                            <ListItemText primary={`Rec: ${r.receipt_no}`} secondary={`Amt: ₹${r.amount} | Date: ${r.date}`} />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={() => removeMedicine(i)} color="error" size="small"><Delete fontSize="small" /></IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                    {formData.medicine_receipts.length === 0 && <ListItem><ListItemText secondary="No receipts added" /></ListItem>}
                </List>
                <Typography align="right" variant="h6" sx={{ mt: 1, color: 'success.main' }}>Total: ₹{calculateMedTotal()}</Typography>
            </Grid>
        </Grid>
    );

    const renderStep3 = () => (
        <Box>
            <Typography variant="subtitle2" gutterBottom color="primary">🧾 Form D Details (Hospital Bill)</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <TextField label="Admission Charges" name="admission_charges" type="number" value={formData.admission_charges} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Staying Charges (Auto)" value={calculateStayTotal()} disabled fullWidth sx={{ mb: 2 }} />
                    <TextField label="Surgeon Charges" name="surgeon_charges" type="number" value={formData.surgeon_charges} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Asst. Surgeon" name="asst_surgeon_charges" type="number" value={formData.asst_surgeon_charges} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Anesthesia" name="anesthesia_charges" type="number" value={formData.anesthesia_charges} onChange={handleInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField label="OT Charges" name="ot_charges" type="number" value={formData.ot_charges} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="OT Assistant" name="ot_assistant_charges" type="number" value={formData.ot_assistant_charges} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="RMO Charges" name="rmo_charges" type="number" value={formData.rmo_charges} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Nursing Charges" name="nursing_charges" type="number" value={formData.nursing_charges} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="IV/Transfusion" name="iv_infusion_charges" type="number" value={formData.iv_infusion_charges} onChange={handleInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField label="Doctor Visit" name="doctor_visit_charges" type="number" value={formData.doctor_visit_charges} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Special Visit" name="special_visit_charges" type="number" value={formData.special_visit_charges} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Monitor" name="monitor_charges" type="number" value={formData.monitor_charges} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Oxygen" name="oxygen_charges" type="number" value={formData.oxygen_charges} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} />
                    <TextField label="Radiology" name="radiology_charges" type="number" value={formData.radiology_charges} onChange={handleInputChange} fullWidth />
                </Grid>
                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                        <Typography variant="h6">Total Hospital Bill (Form D):</Typography>
                        <Typography variant="h5" color="primary">₹ {totals.form_d_total.toLocaleString()}</Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );

    const renderStep4 = () => (
        <Box>
            <Typography variant="h6" gutterBottom color="primary">💰 Claim Summary</Typography>
            <Card sx={{ bgcolor: '#f8fafc', mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">Total Hospital Bill (Form D)</Typography>
                            <Typography variant="h6">₹ {totals.form_d_total.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">Total Medicines</Typography>
                            <Typography variant="h6">₹ {totals.med_total.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">Total Pathology/Lab</Typography>
                            <Typography variant="h6">₹ {totals.path_total.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 700 }}>Grand Total Claim</Typography>
                            <Typography variant="h5" color="success.main" sx={{ fontWeight: 800 }}>₹ {totals.grand_claim.toLocaleString()}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" color="secondary">👨‍👩‍👧‍👦 Family Declaration (Optional)</Typography>
                <Grid container spacing={2}>
                    {[1, 2, 3].map(i => (
                        <Grid item xs={12} key={i}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField label={`Member ${i} Name`} name={`m_name_${i}`} value={formData[`m_name_${i}`]} onChange={handleInputChange} fullWidth />
                                <TextField label="Relation" name={`m_rel_${i}`} value={formData[`m_rel_${i}`]} onChange={handleInputChange} sx={{ width: 150 }} />
                                <TextField label="Age" name={`m_age_${i}`} value={formData[`m_age_${i}`]} onChange={handleInputChange} sx={{ width: 100 }} />
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Button 
                    variant="contained" 
                    size="large" 
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Download />} 
                    disabled={isLoading}
                    onClick={generatePDF}
                    fullWidth
                    sx={{ py: 2, fontSize: '1.1rem', mt: 2 }}
                >
                    {isLoading ? 'Generating PDF...' : 'Generate Reimbursement PDF'}
                </Button>
                {error && <Alert severity="error">{error}</Alert>}
                {successMessage && <Alert severity="success">{successMessage}</Alert>}
            </Box>
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box className="animate-fade-in">
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e3a8a', mb: 1 }}>
                            🏥 Medical Reimbursement Generator
                        </Typography>
                        <Typography color="text.secondary">
                            Fill details to generate your claim proposal instantly.
                        </Typography>
                    </Box>

                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                                {STEPS.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            <Box sx={{ minHeight: 400 }}>
                                {activeStep === 0 && renderStep0()}
                                {activeStep === 1 && renderStep1()}
                                {activeStep === 2 && renderStep2()}
                                {activeStep === 3 && renderStep3()}
                                {activeStep === 4 && renderStep4()}
                            </Box>

                            <Divider sx={{ my: 4 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleBack}
                                    disabled={activeStep === 0}
                                    startIcon={<ArrowBack />}
                                >
                                    Back
                                </Button>
                                {activeStep < STEPS.length - 1 ? (
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        endIcon={<ArrowForward />}
                                    >
                                        Next Step
                                    </Button>
                                ) : null}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

export default MedicalCalculation;
