import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
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

        // Load PizZip and Docxtemplater
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Compute flat object combining data and totals for docxtemplater variables
        const docxData: Record<string, string | number> = {};
        
        // Push all data
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string' || typeof value === 'number') {
                docxData[key] = value;
            }
        }
        
        // Push all totals
        for (const [key, value] of Object.entries(totals)) {
            if (typeof value === 'number') {
                docxData[key] = Number(value).toFixed(2);
            } else if (typeof value === 'string') {
                docxData[key] = value;
            }
        }

        // Add additional computed convenience tags
        docxData.patient_name_and_relation = `${data.patient_name_english || ''} (${data.patient_relation || ''})`;
        docxData.employee_name_and_designation = `${data.emp_name_english || ''} - ${data.emp_designation_english || ''}`;
        docxData.admit_period = `${data.admit_date_from || ''} to ${data.admit_date_to || ''}`;

        // Render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render(docxData);

        // Get the zip document and generate it as a nodebuffer
        const buf = doc.getZip().generate({ type: 'nodebuffer' });

        // Setup temporary paths for conversion
        const timestamp = Date.now();
        const tempPrefix = path.join(os.tmpdir(), `medical_form_${timestamp}`);
        const tempDocxPath = `${tempPrefix}.docx`;

        // Write the populated DOCX back to disk temporarily
        fs.writeFileSync(tempDocxPath, buf);

        let pdfBuf: Buffer;
        try {
            // Attempt conversion using libreoffice-convert
            // This requires libreoffice to be installed on the system/alpine container
            pdfBuf = await libre.convertAsync(buf, '.pdf', undefined);
        } catch (convertErr: any) {
            console.error("LibreOffice conversion failed:", convertErr);
            // Fallback: If libreoffice fails (e.g. local dev windows without libreoffice), just return the DOCX directly so it doesn't crash completely.
            return new NextResponse(buf as any, {
                status: 200,
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition': `attachment; filename="Medical-Form-${(data.emp_name_english || 'Proposal').replace(/\s+/g, '-')}-FALLBACK.docx"`,
                    'X-Fallback': 'True', // Custom header to let frontend know it is docx
                },
            });
        } finally {
            // Clean up temporary docx
            if (fs.existsSync(tempDocxPath)) {
                fs.unlinkSync(tempDocxPath);
            }
        }

        return new NextResponse(pdfBuf as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Medical-Form-${(data.emp_name_english || 'Proposal').replace(/\s+/g, '-')}.pdf"`,
            },
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
