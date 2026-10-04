import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';

// @ts-ignore
import PizZip from 'pizzip';
// @ts-ignore
import Docxtemplater from 'docxtemplater';
// @ts-ignore
import rawLibre from 'libreoffice-convert';

const libre: any = rawLibre;
libre.convertAsync = util.promisify(libre.convert);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { data, totals } = body;

        // Path to the template
        const templatePath = path.join(process.cwd(), 'public', 'medical_form.docx');
        if (!fs.existsSync(templatePath)) {
            return NextResponse.json({ error: "Template file public/medical_form.docx not found" }, { status: 404 });
        }

        // Load the docx file as binary
        const content = fs.readFileSync(templatePath, 'binary');

        // Load PizZip and Docxtemplater with nullGetter to NEVER emit 'undefined'
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: {
                start: '{{',
                end: '}}',
            },
            nullGetter() {
                return ''; // Cleanly renders empty string instead of literal 'undefined'
            }
        });

        // Compute flat object combining data and totals for docxtemplater variables
        const docxData: Record<string, string | number> = {};

        // Intelligent values and fallbacks for Marathi and English
        const empNameMarathi = data.emp_name_marathi || data.emp_name_english || '';
        const empDesigMarathi = data.emp_designation_marathi || data.emp_designation_english || '';
        const empFullMarathi = data.emp_name_designation_marathi || 
            (empNameMarathi && empDesigMarathi ? `${empNameMarathi} (${empDesigMarathi})` : empNameMarathi || data.emp_name_english || '');

        const officeMarathi = data.office_name_marathi || data.office_name_english || '';
        const workplaceMarathi = data.work_place_marathi || officeMarathi || data.place_of_illness || 'लातूर';
        const resAddressMarathi = data.res_address_marathi || data.res_address_english || '';
        const patientNameMarathi = data.patient_name || data.patient_name_marathi || data.patient_name_english || '';
        const hospitalNameMarathi = data.hospital_name_marathi || data.hospital_name_english || '';
        const doctorNameMarathi = data.dr_name_marathi || data.treating_doctor_name_english || '';

        const certPlace = data.cert_place || data.place_of_illness || 'लातूर';
        const certDate = data.cert_date || new Date().toISOString().split('T')[0];

        // Room totals
        const gwDays = Number(data.gw_days) || 0;
        const gwRates = Number(data.gw_rates) || 0;
        const gwTotal = (data.gw_total !== '' && data.gw_total !== undefined) ? Number(data.gw_total) || 0 : (gwDays * gwRates);

        const semiDays = Number(data.semi_days) || 0;
        const semiRates = Number(data.semi_rates) || 0;
        const semiTotal = (data.semi_total !== '' && data.semi_total !== undefined) ? Number(data.semi_total) || 0 : (semiDays * semiRates);

        const pvtDays = Number(data.pvt_days) || 0;
        const pvtRates = Number(data.pvt_rates) || 0;
        const pvtTotal = (data.pvt_total !== '' && data.pvt_total !== undefined) ? Number(data.pvt_total) || 0 : (pvtDays * pvtRates);

        const icuDays = Number(data.icu_days) || 0;
        const icuRates = Number(data.icu_rates) || 0;
        const icuTotal = (data.icu_total !== '' && data.icu_total !== undefined) ? Number(data.icu_total) || 0 : (icuDays * icuRates);

        const stayTotal = gwTotal + semiTotal + pvtTotal + icuTotal;
        const grandClaim = totals?.grand_claim ?? (stayTotal + (totals?.procedural_total || 0) + (totals?.path_total || 0) + (totals?.med_total || 0));

        // Base data copy
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string' || typeof value === 'number') {
                docxData[key] = value;
            }
        }

        // Totals copy
        if (totals) {
            for (const [key, value] of Object.entries(totals)) {
                if (typeof value === 'number') {
                    docxData[key] = Number(value).toLocaleString('en-IN');
                } else if (typeof value === 'string') {
                    docxData[key] = value;
                }
            }
        }

        // Explicit 99 template variables mapping with guaranteed non-undefined values
        docxData.emp_name_designation_marathi = empFullMarathi;
        docxData.emp_name_marathi = empNameMarathi;
        docxData.emp_designation_marathi = empDesigMarathi;
        docxData.office_name_marathi = officeMarathi;
        docxData.emp_office_name_marathi = officeMarathi;
        docxData.work_place_marathi = workplaceMarathi;
        docxData.res_address_marathi = resAddressMarathi;
        docxData.basic_pay = data.basic_pay ? Number(data.basic_pay).toLocaleString('en-IN') : '-';
        docxData.appointment_date = data.appointment_date || '-';
        docxData.retirement_date = data.retirement_date || '-';

        docxData.patient_name = patientNameMarathi;
        docxData.patient_name_marathi = patientNameMarathi;
        docxData.patient_name_english = data.patient_name_english || data.patient_name || '';
        docxData.patient_relation = data.patient_relation || 'स्वतः';
        docxData.patient_relation_marathi = data.patient_relation_marathi || data.patient_relation || 'स्वतः';
        docxData.patient_age = data.patient_age ? `${data.patient_age}` : '';
        docxData.place_of_illness = data.place_of_illness || certPlace;

        docxData.hospital_name_english = data.hospital_name_english || hospitalNameMarathi;
        docxData.hospital_name_marathi = hospitalNameMarathi || data.hospital_name_english || '';
        docxData.treating_doctor_name_english = data.treating_doctor_name_english || doctorNameMarathi;
        docxData.dr_name_marathi = doctorNameMarathi || data.treating_doctor_name_english || '';
        docxData.consult_doctor_hospital = `${doctorNameMarathi || data.treating_doctor_name_english || ''} / ${hospitalNameMarathi || data.hospital_name_english || ''}`.trim().replace(/^\/|\/$/g, '');

        docxData.admit_date_from = data.admit_date_from || '';
        docxData.admit_date_to = data.admit_date_to || '';
        docxData.cert_place = certPlace;
        docxData.cert_date = certDate;

        // Amounts and calculations
        docxData.grand_total_claim = Number(grandClaim).toLocaleString('en-IN');
        docxData.total_claim_amount = Number(grandClaim).toLocaleString('en-IN');
        docxData.pathology_charges = Number(totals?.path_total || 0).toLocaleString('en-IN');
        docxData.medicine_charges = Number(totals?.med_total || 0).toLocaleString('en-IN');
        docxData.stay_grand_total = Number(stayTotal).toLocaleString('en-IN');
        docxData.total_hospital_bill_amount = Number((totals?.form_d_total || stayTotal)).toLocaleString('en-IN');
        docxData.total_hospital_bill_inc_lab = Number((totals?.form_d_total || stayTotal) + (totals?.path_total || 0)).toLocaleString('en-IN');
        docxData.external_lab_charges = Number(totals?.path_total || 0).toLocaleString('en-IN');

        docxData.total_hospital_bill_90_percent = Number((totals?.admissible_procedural || 0)).toLocaleString('en-IN');
        docxData.medicine_charges_90_percent = Number((totals?.admissible_meds || 0)).toLocaleString('en-IN');
        docxData.external_lab_charges_90_percent = Number((totals?.admissible_path || 0)).toLocaleString('en-IN');
        docxData.total_room_rent_admissible = Number((totals?.admissible_stay || 0)).toLocaleString('en-IN');
        docxData.grand_total_admissible_amount = Number((totals?.grand_admissible || 0)).toLocaleString('en-IN');

        // Room Stay
        docxData.gw_dates = `${data.admit_date_from || ''} to ${data.admit_date_to || ''}`;
        docxData.gw_days = gwDays ? `${gwDays}` : '';
        docxData.gw_rates = gwRates ? `${gwRates}` : '';
        docxData.gw_total = gwTotal ? gwTotal.toLocaleString('en-IN') : '';
        docxData.gw_total_95_percent = gwTotal ? (gwTotal * 0.95).toLocaleString('en-IN') : '';

        docxData.semi_dates = `${data.admit_date_from || ''} to ${data.admit_date_to || ''}`;
        docxData.semi_days = semiDays ? `${semiDays}` : '';
        docxData.semi_rate = semiRates ? `${semiRates}` : '';
        docxData.semi_rates = semiRates ? `${semiRates}` : '';
        docxData.semi_total = semiTotal ? semiTotal.toLocaleString('en-IN') : '';
        docxData.semi_total_90_percent = semiTotal ? (semiTotal * 0.90).toLocaleString('en-IN') : '';

        docxData.pvt_dates = `${data.admit_date_from || ''} to ${data.admit_date_to || ''}`;
        docxData.pvt_days = pvtDays ? `${pvtDays}` : '';
        docxData.pvt_rates = pvtRates ? `${pvtRates}` : '';
        docxData.pvt_total = pvtTotal ? pvtTotal.toLocaleString('en-IN') : '';
        docxData.pvt_total_75_percent = pvtTotal ? (pvtTotal * 0.75).toLocaleString('en-IN') : '';

        docxData.icu_dates = `${data.admit_date_from || ''} to ${data.admit_date_to || ''}`;
        docxData.icu_days = icuDays ? `${icuDays}` : '';
        docxData.icu_rates = icuRates ? `${icuRates}` : '';
        docxData.icu_total = icuTotal ? icuTotal.toLocaleString('en-IN') : '';

        // Family Members
        docxData.mem_name1 = data.m_name_1 || '';
        docxData.mem_rel1 = data.m_rel_1 || '';
        docxData.mem_age1 = data.m_age_1 || '';
        docxData.mem_job1 = data.m_rel_1 === 'Wife' ? 'गृहिणी' : 'शिक्षण';

        docxData.mem_name2 = data.m_name_2 || '';
        docxData.mem_rel2 = data.m_rel_2 || '';
        docxData.mem_age2 = data.m_age_2 || '';
        docxData.mem_job2 = 'शिक्षण';

        docxData.mem_name3 = data.m_name_3 || '';
        docxData.mem_rel3 = data.m_rel_3 || '';
        docxData.mem_age3 = data.m_age_3 || '';
        docxData.mem_job3 = 'शिक्षण';

        docxData.mem_name4 = data.m_name_4 || '';
        docxData.mem_rel4 = data.m_rel_4 || '';
        docxData.mem_age4 = data.m_age_4 || '';
        docxData.mem_job4 = 'अवलंबून';

        docxData.mem_name5 = data.m_name_5 || '';
        docxData.mem_rel5 = data.m_rel_5 || '';
        docxData.mem_age5 = data.m_age_5 || '';
        docxData.mem_job5 = '';

        // Render document
        doc.render(docxData);

        // Get the zip document and generate it as a nodebuffer
        const buf = doc.getZip().generate({ type: 'nodebuffer' });

        // If docx format requested or LibreOffice conversion fallback
        const url = new URL(req.url);
        const format = url.searchParams.get('format');
        const cleanName = (data.emp_name_english || data.emp_name_marathi || 'Medical_Claim').trim().replace(/[^a-zA-Z0-9_-]/g, '_');

        if (format === 'docx') {
            return new NextResponse(buf as any, {
                status: 200,
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition': `attachment; filename="Medical-Claim-FormCD-${cleanName}.docx"`,
                },
            });
        }

        // Setup temporary paths for conversion
        const timestamp = Date.now();
        const tempPrefix = path.join(os.tmpdir(), `medical_form_${timestamp}`);
        const tempDocxPath = `${tempPrefix}.docx`;

        // Write the populated DOCX back to disk temporarily
        fs.writeFileSync(tempDocxPath, buf);

        let pdfBuf: Buffer | null = null;
        try {
            // Attempt conversion using libreoffice-convert with 3s timeout
            pdfBuf = await Promise.race([
                new Promise<Buffer>((resolve, reject) => {
                    try {
                        libre.convert(buf, '.pdf', undefined, (err: any, result: Buffer) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    } catch (e) {
                        reject(e);
                    }
                }),
                new Promise<null>((_, reject) => setTimeout(() => reject(new Error('LibreOffice conversion timeout')), 3000))
            ]);
        } catch (convertErr: any) {
            console.log("LibreOffice conversion not available or timed out:", convertErr?.message || convertErr);
        } finally {
            // Clean up temporary docx
            if (fs.existsSync(tempDocxPath)) {
                fs.unlinkSync(tempDocxPath);
            }
        }

        if (pdfBuf) {
            return new NextResponse(pdfBuf as any, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="Medical-Claim-FormCD-${cleanName}.pdf"`,
                },
            });
        }

        // Return populated DOCX as fallback
        return new NextResponse(buf as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="Medical-Claim-FormCD-${cleanName}.docx"`,
                'X-Fallback': 'True',
            },
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
