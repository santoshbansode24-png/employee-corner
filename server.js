import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import puppeteer from 'puppeteer';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Railway provides PORT env var, fallback to 5001 locally
const PORT = process.env.PORT || 5001;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// --- Helper Functions ---
const cleanupFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (e) {
        console.error('Cleanup error:', e);
    }
};

// OS-Specific LibreOffice Path
let LIBREOFFICE_PATH = 'soffice'; // Default for Linux (Railway)
if (process.platform === 'win32') {
    LIBREOFFICE_PATH = '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"';
}

console.log(`Using LibreOffice Path: ${LIBREOFFICE_PATH}`);

// Verify LibreOffice exists (Only on Windows checks path, on Linux checks command usually via 'which' but we skip for now)
if (process.platform === 'win32' && !fs.existsSync(LIBREOFFICE_PATH.replace(/"/g, ''))) {
    console.warn(`\n⚠️  WARNING: LibreOffice not found at ${LIBREOFFICE_PATH}`);
}

// --- DA Rates Data (Hardcoded) ---
const daRates = {
    "7th_PC": [
        { date: "2016-01-01", rate: 0.00 },
        { date: "2016-07-01", rate: 0.02 },
        { date: "2017-01-01", rate: 0.04 },
        { date: "2017-07-01", rate: 0.05 },
        { date: "2018-01-01", rate: 0.07 },
        { date: "2018-07-01", rate: 0.09 },
        { date: "2019-01-01", rate: 0.12 },
        { date: "2019-07-01", rate: 0.17 },
        { date: "2021-07-01", rate: 0.31 },
        { date: "2022-01-01", rate: 0.34 },
        { date: "2022-07-01", rate: 0.38 },
        { date: "2023-01-01", rate: 0.42 },
        { date: "2023-07-01", rate: 0.46 },
        { date: "2024-01-01", rate: 0.50 },
        { date: "2024-07-01", rate: 0.53 },
        { date: "2025-01-01", rate: 0.55 }
    ],
    "6th_PC": [
        { date: "2006-01-01", rate: 0.00 },
        { date: "2006-07-01", rate: 0.02 },
        { date: "2007-01-01", rate: 0.06 },
        { date: "2007-07-01", rate: 0.09 },
        { date: "2008-01-01", rate: 0.12 },
        { date: "2008-07-01", rate: 0.16 },
        { date: "2009-01-01", rate: 0.22 },
        { date: "2009-07-01", rate: 0.27 },
        { date: "2010-06-01", rate: 0.35 },
        { date: "2010-11-01", rate: 0.45 },
        { date: "2011-05-01", rate: 0.51 },
        { date: "2011-10-01", rate: 0.58 },
        { date: "2012-01-01", rate: 0.65 },
        { date: "2012-07-01", rate: 0.72 },
        { date: "2013-01-01", rate: 0.80 },
        { date: "2013-07-01", rate: 0.90 },
        { date: "2014-01-01", rate: 1.00 },
        { date: "2014-07-01", rate: 1.07 },
        { date: "2015-01-01", rate: 1.13 },
        { date: "2015-07-01", rate: 1.19 },
        { date: "2016-01-01", rate: 1.25 },
        { date: "2016-07-01", rate: 1.32 },
        { date: "2017-01-01", rate: 1.36 },
        { date: "2017-07-01", rate: 1.39 },
        { date: "2018-01-01", rate: 1.42 }
    ]
};

const getDARate = (dateStr, commission) => {
    const list = daRates[commission];
    if (!list) return 0;

    // Find the latest rate <= dateStr
    // Sort desc first to find the first one that is <= date
    // Or just iterate backwards
    // list is sorted ASC by date in definition

    let applicableRate = 0;
    for (let item of list) {
        if (dateStr >= item.date) {
            applicableRate = item.rate;
        } else {
            break;
        }
    }
    return applicableRate;
};

// --- ARREARS CALCULATION API ---
app.post('/api/calculate-arrears', async (req, res) => {
    try {
        const { startDate, endDate, payCommission, basicPay, hraRate } = req.body;

        if (!startDate || !endDate || !payCommission || !basicPay) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const results = [];
        let grandTotalDiff = 0;

        let current = new Date(start.getFullYear(), start.getMonth(), 1);
        const loopEnd = new Date(end.getFullYear(), end.getMonth(), 1);

        while (current <= loopEnd) {
            const dateStr = current.toISOString().split('T')[0];
            const monthStr = current.toLocaleString('default', { month: 'short', year: 'numeric' });

            // Logic
            const daRate = getDARate(dateStr, payCommission);

            // DUE
            const dueBasic = parseFloat(basicPay);
            const dueDA = Math.round(dueBasic * daRate);
            const dueHRA = Math.round(dueBasic * (parseFloat(hraRate || 0) / 100));
            const dueTotal = dueBasic + dueDA + dueHRA;

            // DRAWN (Simple ver: Drawn 0 for now as requested, or equal to Basic if user implies they were paid something?)
            // User Prompt: "Calculate Arrears (Difference between Due Salary and Drawn Salary)"
            // User Prompt: "assume Drawn amounts are 0 OR allow the user to input... for simplicity assume calculated difference logic"
            // Let's assume for this "Arrears Statement" usually implies they were paid X but should have been paid Y? 
            // OR they were paid NOTHING and this is a full bill?
            // "Difference between Due Salary and Drawn Salary"
            // Let's assume Drawn = 0 for the generic case unless we have inputs. 
            // Actually, usually arrears is when DA increases. So Drawn was (Old DA).
            // But without historical drawn data, impossible to know what was drawn.
            // Let's IMPLEMENT: Drawn = 0 for now as per "assume Drawn amounts are 0".
            // Ideally we'd calculate "Old Rate", but let's stick to simple first.
            const drawnBasic = 0;
            const drawnDA = 0;
            const drawnTotal = 0;

            const diff = dueTotal - drawnTotal;
            grandTotalDiff += diff;

            results.push({
                month: monthStr,
                dueBasic, dueDA, dueHRA, dueTotal,
                drawnBasic, drawnDA, drawnTotal,
                diff,
                daRatePct: Math.round(daRate * 100)
            });

            current.setMonth(current.getMonth() + 1);
        }

        // HTML Generation
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1, h2 { text-align: center; margin: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10pt; }
                th, td { border: 1px solid black; padding: 6px; text-align: right; }
                th { background-color: #f2f2f2; text-align: center; }
                .center { text-align: center; }
                .total-row { font-weight: bold; background-color: #e0e0e0; }
            </style>
        </head>
        <body>
            <h1>Arrears Statement</h1>
            <h2>${payCommission.replace('_', ' ')} | Basic Pay: ${basicPay}</h2>
            <p style="text-align:center">Period: ${startDate} to ${endDate}</p>
            
            <table>
                <thead>
                    <tr>
                        <th rowspan="2">Month</th>
                        <th rowspan="2">DA Rate</th>
                        <th colspan="4">Due Amount (Rs)</th>
                        <th colspan="3">Drawn Amount (Rs)</th>
                        <th rowspan="2">Difference<br>(Net Arrears)</th>
                    </tr>
                    <tr>
                        <th>Basic</th>
                        <th>DA</th>
                        <th>HRA</th>
                        <th>Total</th>
                        <th>Basic</th>
                        <th>DA</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(r => `
                    <tr>
                        <td class="center">${r.month}</td>
                        <td class="center">${r.daRatePct}%</td>
                        <td>${r.dueBasic}</td>
                        <td>${r.dueDA}</td>
                        <td>${r.dueHRA}</td>
                        <td>${r.dueTotal}</td>
                        <td>${r.drawnBasic}</td>
                        <td>${r.drawnDA}</td>
                        <td>${r.drawnTotal}</td>
                        <td>${r.diff}</td>
                    </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td colspan="2" class="center">Total</td>
                        <td>${results.reduce((s, r) => s + r.dueBasic, 0)}</td>
                        <td>${results.reduce((s, r) => s + r.dueDA, 0)}</td>
                        <td>${results.reduce((s, r) => s + r.dueHRA, 0)}</td>
                        <td>${results.reduce((s, r) => s + r.dueTotal, 0)}</td>
                        <td>${results.reduce((s, r) => s + r.drawnBasic, 0)}</td>
                        <td>${results.reduce((s, r) => s + r.drawnDA, 0)}</td>
                        <td>${results.reduce((s, r) => s + r.drawnTotal, 0)}</td>
                        <td>${grandTotalDiff}</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 40px; display: flex; justify-content: space-between;">
                <div>Prepared By</div>
                <div>Checked By</div>
                <div>Approved By</div>
            </div>
        </body>
        </html>
        `;

        // Puppeteer PDF Generation
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: false,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });
        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=arrears_statement.pdf',
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Arrears Calc Error:', error);
        res.status(500).json({ error: 'Calculation failed', details: error.message });
    }
});

// --- EXISTING ENDPOINTS (Copied from medical-pdf-server.js) ---

// 1. JPG to PDF
app.post('/api/jpg-to-pdf', upload.array('images'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No images uploaded' });
        const pdfDoc = await PDFDocument.create();
        for (const file of req.files) {
            const imageBytes = fs.readFileSync(file.path);
            let image;
            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') image = await pdfDoc.embedJpg(imageBytes);
            else if (file.mimetype === 'image/png') image = await pdfDoc.embedPng(imageBytes);
            else continue;
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
            cleanupFile(file.path);
        }
        const pdfBytes = await pdfDoc.save();
        const outputPath = path.join(uploadDir, `converted_${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, pdfBytes);
        res.download(outputPath, 'images.pdf', () => cleanupFile(outputPath));
    } catch (error) {
        console.error('JPG to PDF Error:', error);
        res.status(500).json({ error: 'Conversion failed' });
    }
});

// 2. Word to PDF
app.post('/api/word-to-pdf', upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const inputPath = req.file.path;
        const outputFilename = path.parse(req.file.filename).name + '.pdf';
        const outputPath = path.join(uploadDir, outputFilename);
        const command = `${LIBREOFFICE_PATH} --headless --convert-to pdf --outdir "${uploadDir}" "${inputPath}"`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                cleanupFile(inputPath);
                return res.status(500).json({ error: 'Conversion failed', details: stderr });
            }
            if (fs.existsSync(outputPath)) {
                res.download(outputPath, outputFilename, () => { cleanupFile(inputPath); cleanupFile(outputPath); });
            } else {
                cleanupFile(inputPath);
                res.status(500).json({ error: 'Output file not found' });
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. PDF to JPG
app.post('/api/pdf-to-jpg', upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const inputPath = req.file.path;
        const command = `${LIBREOFFICE_PATH} --headless --convert-to jpg --outdir "${uploadDir}" "${inputPath}"`;
        exec(command, (error, stdout, stderr) => {
            if (error) { cleanupFile(inputPath); return res.status(500).json({ error: 'Conversion failed' }); }
            const expectedOutput = path.join(uploadDir, path.parse(req.file.filename).name + '.jpg');
            if (fs.existsSync(expectedOutput)) {
                res.download(expectedOutput, 'converted.jpg', () => { cleanupFile(inputPath); cleanupFile(expectedOutput); });
            } else { cleanupFile(inputPath); res.status(500).json({ error: 'Output file not found' }); }
        });
    } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// 4. Image Compressor
app.post('/api/compress-image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const inputPath = req.file.path;
        const outputPath = path.join(uploadDir, `compressed_${req.file.filename}`);
        await sharp(inputPath).jpeg({ quality: 80, mozjpeg: true }).toFile(outputPath);
        res.download(outputPath, 'compressed.jpg', () => { cleanupFile(inputPath); cleanupFile(outputPath); });
    } catch (e) { res.status(500).json({ error: 'Compression failed' }); }
});

// 5. PDF Merge
app.post('/api/merge-pdf', upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'Upload at least 2 PDFs' });
        const mergedPdf = await PDFDocument.create();
        for (const file of req.files) {
            const pdfBytes = fs.readFileSync(file.path);
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
            cleanupFile(file.path);
        }
        const savedPdfBytes = await mergedPdf.save();
        const outputPath = path.join(uploadDir, `merged_${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, savedPdfBytes);
        res.download(outputPath, 'merged.pdf', () => cleanupFile(outputPath));
    } catch (e) { res.status(500).json({ error: 'Merge failed' }); }
});

// 6. PDF Split
app.post('/api/split-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const range = req.body.range || '1';
        const inputPath = req.file.path;
        const pdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const newPdf = await PDFDocument.create();
        const totalPages = pdfDoc.getPageCount();
        let pageIndices = [];
        if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            for (let i = start; i <= end; i++) { if (i >= 1 && i <= totalPages) pageIndices.push(i - 1); }
        } else {
            range.split(',').map(Number).forEach(p => { if (p >= 1 && p <= totalPages) pageIndices.push(p - 1); });
        }
        if (pageIndices.length === 0) { cleanupFile(inputPath); return res.status(400).json({ error: 'Invalid page range' }); }
        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));
        const savedPdfBytes = await newPdf.save();
        const outputPath = path.join(uploadDir, `split_${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, savedPdfBytes);
        res.download(outputPath, 'split.pdf', () => { cleanupFile(inputPath); cleanupFile(outputPath); });
    } catch (e) { res.status(500).json({ error: 'Split failed' }); }
});

// 7. Generate Medical PDF (Legacy Python)
app.post('/api/generate-medical-pdf', async (req, res) => {
    try {
        const formData = req.body;
        const pythonScript = path.join(__dirname, 'medical_gen', 'generate_pdf_api.py');
        const dataFile = path.join(__dirname, 'medical_gen', 'temp_data.json');
        fs.writeFileSync(dataFile, JSON.stringify(formData, null, 2));
        const pythonPath = path.join(__dirname, '.venv', 'Scripts', 'python.exe'); // Windows venv
        const command = `"${pythonPath}" "${pythonScript}" "${dataFile}"`;
        exec(command, (error, stdout, stderr) => {
            if (error) { return res.status(500).json({ error: 'PDF generation failed', details: stderr }); }
            const pdfPath = path.join(__dirname, 'medical_gen', 'temp_filled_form.pdf');
            if (fs.existsSync(pdfPath)) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=Medical_Reimbursement_Form.pdf');
                const fileStream = fs.createReadStream(pdfPath);
                fileStream.pipe(res);
                fileStream.on('close', () => { try { fs.unlinkSync(dataFile); } catch (e) { } });
            } else { res.status(500).json({ error: 'PDF file not found after generation' }); }
        });
    } catch (e) { res.status(500).json({ error: 'Internal server error' }); }
});

// --- Proxy to Streamlit (Internal Port 8501) ---
// This allows the single container to expose Streamlit via /reimbursement-gen
// The proxy strips the /reimbursement-gen prefix before forwarding to Streamlit
app.use('/reimbursement-gen', createProxyMiddleware({
    target: 'http://127.0.0.1:8501',
    changeOrigin: true,
    ws: true, // Enable WebSocket support for Streamlit
    pathRewrite: {
        '^/reimbursement-gen': '' // Strip the prefix before forwarding
    },
    onError: (err, req, res) => {
        console.error('Streamlit Proxy Error:', err);
        res.status(500).send('Streamlit service unavailable');
    }
}));

// --- Serve React Build (Production) ---
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    console.log(`Serving static files from ${distPath}`);
    app.use(express.static(distPath));

    // Handle SPA routing: serve index.html for all other routes
    app.get('*', (req, res, next) => {
        // Exclude API routes from SPA fallback
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.warn("⚠️ 'dist' folder not found. React app will not be served (Dev Mode?)");
}

app.listen(PORT, () => {
    console.log(`\n🚀 Employee Corner UNIFIED Backend running on Port ${PORT}`);
    console.log(`   - Arrears PDF: /api/calculate-arrears`);
    console.log(`   - Medical PDF: /api/generate-medical-pdf`);
    console.log(`   - Tools: JPG/Word/Merge/Split\n`);
});

export default app;
