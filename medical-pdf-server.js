import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

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

const LIBREOFFICE_PATH = '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"';

// Verify LibreOffice exists
if (!fs.existsSync(LIBREOFFICE_PATH.replace(/"/g, ''))) {
    console.warn(`\n⚠️  WARNING: LibreOffice not found at ${LIBREOFFICE_PATH}`);
    console.warn('    Word to PDF and PDF to JPG conversion will fail.');
    console.warn('    Please install LibreOffice or update the path in medical-pdf-server.js\n');
}

// --- Endpoints ---

// 1. JPG to PDF
app.post('/api/jpg-to-pdf', upload.array('images'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        const pdfDoc = await PDFDocument.create();

        for (const file of req.files) {
            const imageBytes = fs.readFileSync(file.path);
            let image;
            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
                image = await pdfDoc.embedJpg(imageBytes);
            } else if (file.mimetype === 'image/png') {
                image = await pdfDoc.embedPng(imageBytes);
            } else {
                continue; // Skip unsupported formats
            }

            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });
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
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const inputPath = req.file.path;
        const outputFilename = path.parse(req.file.filename).name + '.pdf';
        const outputPath = path.join(uploadDir, outputFilename);

        // Command to run LibreOffice headless
        const command = `${LIBREOFFICE_PATH} --headless --convert-to pdf --outdir "${uploadDir}" "${inputPath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('LibreOffice Error:', error);
                cleanupFile(inputPath);
                return res.status(500).json({ error: 'Conversion failed', details: stderr });
            }

            // LibreOffice saves with the same basename in outdir
            if (fs.existsSync(outputPath)) {
                res.download(outputPath, outputFilename, () => {
                    cleanupFile(inputPath);
                    cleanupFile(outputPath);
                });
            } else {
                cleanupFile(inputPath);
                res.status(500).json({ error: 'Output file not found' });
            }
        });

    } catch (error) {
        console.error('Word to PDF Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. PDF to JPG
app.post('/api/pdf-to-jpg', upload.single('file'), (req, res) => {
    // Note: LibreOffice conversion to image is tricky (often only first page).
    // For a robust solution, we might need a dedicated tool, but we'll try LibreOffice first as requested.
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const inputPath = req.file.path;
        // LibreOffice determines output format by extension, but --convert-to jpg works
        // It typically produces one file per page or just the first page.
        // Let's try simple conversion first.

        const command = `${LIBREOFFICE_PATH} --headless --convert-to jpg --outdir "${uploadDir}" "${inputPath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('LibreOffice Error:', error);
                cleanupFile(inputPath);
                return res.status(500).json({ error: 'Conversion failed', details: stderr });
            }

            // Check what was created. LibreOffice might name it filename.jpg
            const expectedOutput = path.join(uploadDir, path.parse(req.file.filename).name + '.jpg');

            if (fs.existsSync(expectedOutput)) {
                res.download(expectedOutput, 'converted.jpg', () => {
                    cleanupFile(inputPath);
                    cleanupFile(expectedOutput);
                });
            } else {
                cleanupFile(inputPath);
                res.status(500).json({ error: 'Output file not found. PDF might be empty or conversion failed.' });
            }
        });

    } catch (error) {
        console.error('PDF to JPG Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 4. Image Compressor
app.post('/api/compress-image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const inputPath = req.file.path;
        const outputPath = path.join(uploadDir, `compressed_${req.file.filename}`);

        // Default compression: 80% quality, resize if too large
        await sharp(inputPath)
            .jpeg({ quality: 80, mozjpeg: true })
            .toFile(outputPath);

        res.download(outputPath, 'compressed.jpg', () => {
            cleanupFile(inputPath);
            cleanupFile(outputPath);
        });

    } catch (error) {
        console.error('Compression Error:', error);
        res.status(500).json({ error: 'Compression failed' });
    }
});

// 5. PDF Merge
app.post('/api/merge-pdf', upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) {
            return res.status(400).json({ error: 'Upload at least 2 PDFs' });
        }

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

    } catch (error) {
        console.error('Merge Error:', error);
        res.status(500).json({ error: 'Merge failed' });
    }
});

// 6. PDF Split
app.post('/api/split-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Expecting range in body: "1-3" or "1,2,5"
        const range = req.body.range || '1';
        const inputPath = req.file.path;

        const pdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const newPdf = await PDFDocument.create();
        const totalPages = pdfDoc.getPageCount();

        // Parse range (Simple implementation for "start-end" or single page)
        let pageIndices = [];
        if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            for (let i = start; i <= end; i++) {
                if (i >= 1 && i <= totalPages) pageIndices.push(i - 1);
            }
        } else {
            // Comma separated or single
            const parts = range.split(',').map(Number);
            parts.forEach(p => {
                if (p >= 1 && p <= totalPages) pageIndices.push(p - 1);
            });
        }

        if (pageIndices.length === 0) {
            cleanupFile(inputPath);
            return res.status(400).json({ error: 'Invalid page range' });
        }

        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const savedPdfBytes = await newPdf.save();
        const outputPath = path.join(uploadDir, `split_${Date.now()}.pdf`);
        fs.writeFileSync(outputPath, savedPdfBytes);

        res.download(outputPath, 'split.pdf', () => {
            cleanupFile(inputPath);
            cleanupFile(outputPath);
        });

    } catch (error) {
        console.error('Split Error:', error);
        res.status(500).json({ error: 'Split failed' });
    }
});


// 7. Original Medical PDF endpoint
app.post('/api/generate-medical-pdf', async (req, res) => {
    try {
        const formData = req.body;

        // Path to Python script
        const pythonScript = path.join(__dirname, 'medical_gen', 'generate_pdf_api.py');
        const dataFile = path.join(__dirname, 'medical_gen', 'temp_data.json');

        // Write form data to temp file
        fs.writeFileSync(dataFile, JSON.stringify(formData, null, 2));

        // Execute Python script
        // Note: Using the venv python as identified in user request
        const pythonPath = path.join(__dirname, '.venv', 'Scripts', 'python.exe');
        const command = `"${pythonPath}" "${pythonScript}" "${dataFile}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error:', error);
                return res.status(500).json({ error: 'PDF generation failed', details: stderr });
            }

            // Read generated PDF
            const pdfPath = path.join(__dirname, 'medical_gen', 'temp_filled_form.pdf');

            if (fs.existsSync(pdfPath)) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=Medical_Reimbursement_Form.pdf');

                const fileStream = fs.createReadStream(pdfPath);
                fileStream.pipe(res);

                // Cleanup temp file
                fileStream.on('close', () => {
                    try {
                        fs.unlinkSync(dataFile);
                    } catch (e) {
                        console.error('Cleanup error:', e);
                    }
                });
            } else {
                res.status(500).json({ error: 'PDF file not found after generation' });
            }
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Employee Corner Backend running on http://localhost:${PORT}`);
    console.log(`   - Medical PDF: /api/generate-medical-pdf`);
    console.log(`   - JPG to PDF:  /api/jpg-to-pdf`);
    console.log(`   - Word to PDF: /api/word-to-pdf`);
    console.log(`   - PDF to JPG:  /api/pdf-to-jpg`);
    console.log(`   - Compress:    /api/compress-image`);
    console.log(`   - Merge:       /api/merge-pdf`);
    console.log(`   - Split:       /api/split-pdf\n`);
});

export default app;
