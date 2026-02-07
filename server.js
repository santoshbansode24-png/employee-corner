import express from 'express';
import cors from 'cors';
import { exec, spawn } from 'child_process';
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

import compression from 'compression';

const app = express();
// Enable Gzip compression
app.use(compression());
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

// Proxy for Medical Reimbursement Streamlit App
// Define Proxy Middleware separately so we can use it for both HTTP and WS
const streamlitProxy = createProxyMiddleware({
    target: 'http://127.0.0.1:8501',
    changeOrigin: true,
    ws: true, // Enable Websockets for Streamlit
    xfwd: true,
    proxyTimeout: 60000,
    pathRewrite: function (path, req) {
        // STRATEGY CHANGE: Strip the prefix.
        // Streamlit runs at root (http://127.0.0.1:8501/)
        // Request: /reimbursement-gen/foo -> Proxy -> /foo

        let newPath = path;

        // Verify if we are processing a raw URL (like in Upgrade) or relative (Express)
        // If path starts with /reimbursement-gen, strip it
        if (newPath.startsWith('/reimbursement-gen')) {
            newPath = newPath.replace('/reimbursement-gen', '');
        }

        // Ensure we don't end up with empty string, default to /
        if (newPath === '') newPath = '/';

        console.log(`[Proxy Strip] ${path} -> ${newPath}`);
        return newPath;
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        // Error handling for WS upgrades (req might be socket)
        if (res && res.status) res.status(500).send('Proxy Error');
    },
    onProxyReq: (proxyReq, req, res) => {
        // console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
    },
    onProxyReqWs: (proxyReq, req, socket, options, head) => {
        console.log(`[WS Upgrade] ${req.url}`);
    }
});

app.use('/reimbursement-gen', streamlitProxy);



// ... (existing imports)

// --- START STREAMLIT SERVER (Medical Reimbursement) ---
const STREAMLIT_PORT = 8501;
// Detect .venv Python on Windows
let PYTHON_CMD = process.platform === 'win32' ? 'python' : 'python3';
const venvPython = path.join(__dirname, '.venv', 'Scripts', 'python.exe');
if (process.platform === 'win32' && fs.existsSync(venvPython)) {
    PYTHON_CMD = venvPython;
    console.log(`Using venv Python: ${PYTHON_CMD}`);
}

console.log('🚀 Starting Streamlit Background Service...');
const pythonProcess = spawn(PYTHON_CMD, [
    '-m', 'streamlit', 'run',
    'medical_gen/main.py',
    '--server.port', '8501',
    '--server.address', '0.0.0.0',
    '--server.headless', 'true',
    // --server.enableCORS false is CRITICAL for 127.0.0.1
    '--server.enableCORS', 'false',
    '--server.enableXsrfProtection', 'false',
    '--server.enableWebsocketCompression', 'false',
    '--browser.gatherUsageStats', 'false'
    // REMOVED: --server.baseUrlPath. We now serve at ROOT and strip prefix in proxy.
]);

pythonProcess.stdout.on('data', (data) => console.log(`[Streamlit]: ${data}`));
pythonProcess.stderr.on('data', (data) => console.error(`[Streamlit ERR]: ${data}`));

// Clean up python process on exit
process.on('exit', () => pythonProcess.kill());

// ... (WARMUP logic, unchanged)
// ... (Helper Functions, unchanged)
// ... (Logic for LIBREOFFICE, DA Rates, Endpoints... unchanged)

// --- JPG to PDF Endpoint ---
app.post('/api/jpg-to-pdf', upload.array('images'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();

        // Process each uploaded image
        for (const file of req.files) {
            // Convert image to JPEG using sharp (handles PNG, JPG, etc.)
            const imageBuffer = await sharp(file.path)
                .jpeg({ quality: 90 })
                .toBuffer();

            // Embed image in PDF
            const image = await pdfDoc.embedJpg(imageBuffer);
            const imageDims = image.scale(1);

            // Add a page with the image dimensions
            const page = pdfDoc.addPage([imageDims.width, imageDims.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: imageDims.width,
                height: imageDims.height,
            });

            // Clean up uploaded file
            fs.unlinkSync(file.path);
        }

        // Save the PDF
        const pdfBytes = await pdfDoc.save();

        // Send PDF as response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=images.pdf');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('JPG to PDF Error:', error);
        res.status(500).json({ error: 'Failed to convert images to PDF' });
    }
});

// --- Word to PDF Endpoint (requires LibreOffice) ---
app.post('/api/word-to-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const inputPath = req.file.path;
        const outputDir = path.dirname(inputPath);
        const outputName = path.basename(inputPath, path.extname(inputPath)) + '.pdf';
        const outputPath = path.join(outputDir, outputName);

        // LibreOffice command for conversion
        // Windows: "C:\Program Files\LibreOffice\program\soffice.exe"
        // Linux/Mac: libreoffice
        const libreOfficePath = process.platform === 'win32'
            ? 'C:\\Program Files\\LibreOffice\\program\\soffice.exe'
            : 'libreoffice';

        const command = `"${libreOfficePath}" --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;

        exec(command, (error, stdout, stderr) => {
            // Clean up input file
            fs.unlinkSync(inputPath);

            if (error) {
                console.error('LibreOffice conversion error:', error);
                return res.status(500).json({
                    error: 'Conversion failed. Please ensure LibreOffice is installed.',
                    details: stderr
                });
            }

            // Check if output file exists
            if (!fs.existsSync(outputPath)) {
                return res.status(500).json({ error: 'PDF file was not generated' });
            }

            // Send the PDF file
            res.download(outputPath, outputName, (err) => {
                // Clean up output file after sending
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
                if (err) {
                    console.error('Error sending file:', err);
                }
            });
        });

    } catch (error) {
        console.error('Word to PDF Error:', error);
        res.status(500).json({ error: 'Failed to convert Word document to PDF' });
    }
});

// --- PDF to JPG Endpoint ---
app.post('/api/pdf-to-jpg', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Launch Puppeteer browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Navigate directly to the PDF file
        await page.goto(`file://${req.file.path}`, {
            waitUntil: 'networkidle0'
        });

        // Set viewport to capture full page
        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 2
        });

        // Wait a bit for PDF to render
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Take screenshot
        const screenshot = await page.screenshot({
            type: 'jpeg',
            quality: 90,
            fullPage: false
        });

        await browser.close();

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Send JPG as response
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Disposition', 'attachment; filename=converted.jpg');
        res.send(screenshot);

    } catch (error) {
        console.error('PDF to JPG Error:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to convert PDF to JPG' });
    }
});

// 503: // --- Serve React Build (Production) ---
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

const server = app.listen(PORT, () => {
    console.log(`\n🚀 Employee Corner UNIFIED Backend running on Port ${PORT}`);
    console.log(`   - Arrears PDF: /api/calculate-arrears`);
    console.log(`   - Tools: JPG/Word/Merge/Split\n`);
});

// Explicitly handle WebSocket Upgrades
server.on('upgrade', (req, socket, head) => {
    if (req.url.startsWith('/reimbursement-gen')) {
        console.log(`[Upgrade] Forwarding WS request: ${req.url}`);
        streamlitProxy.upgrade(req, socket, head);
    }
});

export default app;
