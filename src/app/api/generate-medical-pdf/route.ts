import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import { calculateMedicalTotals } from '@/utils/medicalCalculations';

// @ts-ignore
import PizZip from 'pizzip';
// @ts-ignore
import Docxtemplater from 'docxtemplater';
// @ts-ignore
import rawLibre from 'libreoffice-convert';

const libre: any = rawLibre;
const execPromise = util.promisify(exec);

function escapeXml(unsafe: any): string {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function findLoopRange(xml: string, loopVar: string) {
    const marker = xml.indexOf(loopVar);
    if (marker === -1) return null;
    const trStart = xml.lastIndexOf('<w:tr', marker);
    const endforMarker = xml.indexOf('endfor', marker);
    if (endforMarker === -1) return null;
    const trEndTag = '</w:tr>';
    const trEnd = xml.indexOf(trEndTag, endforMarker);
    if (trEnd === -1) return null;
    return { start: trStart, end: trEnd + trEndTag.length };
}

function generatePathologyRows(receipts: any[]): string {
    if (!receipts || receipts.length === 0) {
        return `<w:tr w:rsidR="00351EDB" w:rsidRPr="00791672" w:rsidTr="003E6A32">
            <w:trPr><w:trHeight w:val="450"/></w:trPr>
            <w:tc><w:tcPr><w:tcW w:w="1350" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr><w:t>1</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:tcW w:w="4126" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr><w:t>-</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:tcW w:w="1836" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr><w:t>-</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:tcW w:w="2228" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="right"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/><w:b/><w:bCs/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/><w:b/><w:bCs/></w:rPr><w:t>0</w:t></w:r></w:p></w:tc>
        </w:tr>`;
    }
    return receipts.map((r, i) => {
        const amt = r.amount ? Number(r.amount).toLocaleString('en-IN') : '0';
        return `<w:tr w:rsidR="00351EDB" w:rsidRPr="00791672" w:rsidTr="003E6A32">
            <w:trPr><w:trHeight w:val="450"/></w:trPr>
            <w:tc><w:tcPr><w:tcW w:w="1350" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr><w:t>${i + 1}</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:tcW w:w="4126" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr><w:t>${escapeXml(r.receipt_no || r.bill_no || '-')}</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:tcW w:w="1836" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr><w:t>${escapeXml(r.date || '-')}</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:tcW w:w="2228" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="right"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/><w:b/><w:bCs/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/><w:b/><w:bCs/></w:rPr><w:t>${escapeXml(amt)}</w:t></w:r></w:p></w:tc>
        </w:tr>`;
    }).join('');
}

function generateMedicineRows(receipts: any[]): string {
    if (!receipts || receipts.length === 0) {
        return `<w:tr w:rsidR="00351EDB" w:rsidRPr="00791672" w:rsidTr="003E6A32">
            <w:trPr><w:trHeight w:val="450"/></w:trPr>
            <w:tc><w:tcPr><w:tcW w:w="1530" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr><w:t>1</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:tcW w:w="3330" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr><w:t>-</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:tcW w:w="1890" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr><w:t>-</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:tcW w:w="2520" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="right"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/><w:b/><w:bCs/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/><w:b/><w:bCs/></w:rPr><w:t>0</w:t></w:r></w:p></w:tc>
        </w:tr>`;
    }
    return receipts.map((r, i) => {
        const amt = r.amount ? Number(r.amount).toLocaleString('en-IN') : '0';
        return `<w:tr w:rsidR="00351EDB" w:rsidRPr="00791672" w:rsidTr="003E6A32">
            <w:trPr><w:trHeight w:val="450"/></w:trPr>
            <w:tc><w:tcPr><w:tcW w:w="1530" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr><w:t>${i + 1}</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:tcW w:w="3330" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr><w:t>${escapeXml(r.receipt_no || r.bill_no || '-')}</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:tcW w:w="1890" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/></w:rPr><w:t>${escapeXml(r.date || '-')}</w:t></w:r></w:p></w:tc>
            <w:tc><w:tcPr><w:tcW w:w="2520" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="right"/><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/><w:b/><w:bCs/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Mangal" w:hAnsi="Mangal" w:cs="Mangal"/><w:b/><w:bCs/></w:rPr><w:t>${escapeXml(amt)}</w:t></w:r></w:p></w:tc>
        </w:tr>`;
    }).join('');
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { data, totals } = body;
        const effectiveTotals = totals || calculateMedicalTotals(data);

        // Path to the template
        const templatePath = path.join(process.cwd(), 'public', 'medical_form.docx');
        if (!fs.existsSync(templatePath)) {
            return NextResponse.json({ error: "Template file public/medical_form.docx not found" }, { status: 404 });
        }

        // Load the docx file as binary
        const content = fs.readFileSync(templatePath, 'binary');

        // Load PizZip and modify XML for dynamic tables and clean breaks
        const zip = new PizZip(content);
        const docFile = zip.file('word/document.xml');
        if (docFile) {
            let docXml = docFile.asText();

            // 1. Deduplicate any double page breaks to prevent blank pages
            const duplicateBreakRegex = /(<w:br\s+w:type="page"\s*\/?>)((?:<[^>]+>|\s)*?)(<w:br\s+w:type="page"\s*\/?>)/g;
            while (duplicateBreakRegex.test(docXml)) {
                docXml = docXml.replace(duplicateBreakRegex, (_, p1, p2, p3) => p2 + p3);
            }

            // 2. Populate dynamic receipts tables (Medicine and Pathology)
            // Replace from highest index to lowest so character offsets remain exact
            const medRange = findLoopRange(docXml, 'medicine_receipts');
            if (medRange) {
                docXml = docXml.slice(0, medRange.start) + generateMedicineRows(data.medicine_receipts || []) + docXml.slice(medRange.end);
            }

            const pathRange = findLoopRange(docXml, 'pathology_receipts');
            if (pathRange) {
                docXml = docXml.slice(0, pathRange.start) + generatePathologyRows(data.pathology_receipts || []) + docXml.slice(pathRange.end);
            }

            zip.file('word/document.xml', docXml);
        }

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
        const grandClaim = effectiveTotals?.grand_claim ?? (stayTotal + (effectiveTotals?.procedural_total || 0) + (effectiveTotals?.path_total || 0) + (effectiveTotals?.med_total || 0));

        // Base data copy
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string' || typeof value === 'number') {
                docxData[key] = value;
            }
        }

        // Totals copy
        if (effectiveTotals) {
            for (const [key, value] of Object.entries(effectiveTotals)) {
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
        docxData.stay_and_all_total = Number(grandClaim).toLocaleString('en-IN');
        docxData.pathology_charges = Number(effectiveTotals?.path_total || 0).toLocaleString('en-IN');
        docxData.medicine_charges = Number(effectiveTotals?.med_total || 0).toLocaleString('en-IN');
        docxData.stay_grand_total = Number(stayTotal).toLocaleString('en-IN');
        docxData.total_hospital_bill_amount = Number((effectiveTotals?.form_d_total || stayTotal)).toLocaleString('en-IN');
        docxData.total_hospital_bill_inc_lab = Number((effectiveTotals?.form_d_total || stayTotal) + (effectiveTotals?.path_total || 0)).toLocaleString('en-IN');
        docxData.external_lab_charges = Number(effectiveTotals?.path_total || 0).toLocaleString('en-IN');

        docxData.total_hospital_bill_90_percent = Number((effectiveTotals?.admissible_procedural || 0)).toLocaleString('en-IN');
        docxData.medicine_charges_90_percent = Number((effectiveTotals?.admissible_meds || 0)).toLocaleString('en-IN');
        docxData.external_lab_charges_90_percent = Number((effectiveTotals?.admissible_path || 0)).toLocaleString('en-IN');
        docxData.total_room_rent_admissible = Number((effectiveTotals?.admissible_stay || 0)).toLocaleString('en-IN');
        docxData.grand_total_admissible_amount = Number((effectiveTotals?.grand_admissible || 0)).toLocaleString('en-IN');

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

        // If docx format requested explicitly
        const url = new URL(req.url);
        const format = url.searchParams.get('format');
        const cleanName = (data.emp_name_english || data.emp_name_marathi || 'Medical_Proposal').trim().replace(/[^a-zA-Z0-9_-]/g, '_');

        if (format === 'docx') {
            return new NextResponse(buf as any, {
                status: 200,
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition': `attachment; filename="Medical-Proposal-${cleanName}.docx"`,
                },
            });
        }

        // Setup temporary paths for conversion
        const timestamp = Date.now();
        const tmpDir = os.tmpdir();
        const tempDocxPath = path.join(tmpDir, `med_${timestamp}.docx`);
        const tempPdfPath = path.join(tmpDir, `med_${timestamp}.pdf`);

        fs.writeFileSync(tempDocxPath, buf);

        let pdfBuf: Buffer | null = null;

        // Method 1: Direct native soffice command (Fastest & most accurate on Linux / Alpine container)
        try {
            await execPromise(`soffice --headless --convert-to pdf --outdir "${tmpDir}" "${tempDocxPath}"`, { timeout: 45000 });
            if (fs.existsSync(tempPdfPath)) {
                pdfBuf = fs.readFileSync(tempPdfPath);
            }
        } catch (execErr: any) {
            console.log("Direct soffice CLI attempt failed/not found:", execErr?.message || execErr);
        }

        // Method 2: Fallback to libreoffice-convert package
        if (!pdfBuf) {
            try {
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
                    new Promise<null>((_, reject) => setTimeout(() => reject(new Error('LibreOffice convert timeout')), 45000))
                ]);
            } catch (convertErr: any) {
                console.log("libreoffice-convert fallback failed:", convertErr?.message || convertErr);
            }
        }

        // Clean up temporary files
        try {
            if (fs.existsSync(tempDocxPath)) fs.unlinkSync(tempDocxPath);
            if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
        } catch (_) {}

        // Return generated official PDF
        if (pdfBuf) {
            return new NextResponse(pdfBuf as any, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="Medical-Proposal-${cleanName}.pdf"`,
                },
            });
        }

        // Fallback: If LibreOffice is completely absent (e.g. local Windows dev without LibreOffice installed), return DOCX with notice header
        return new NextResponse(buf as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="Medical-Proposal-${cleanName}.docx"`,
                'X-Fallback': 'True',
            },
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
