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
        // Logic: Ensure the path sent to Streamlit starts with /reimbursement-gen

        // Case 1: HTTP Request via app.use() -> Express strips mount point -> path is relative (e.g., /_stcore/stream)
        // We need to prepend /reimbursement-gen

        // Case 2: WS Request via server.on('upgrade') -> Path is full (e.g., /reimbursement-gen/_stcore/stream)
        // we DO NOT want to prepend.

        // Robust Check:
        if (path.startsWith('/reimbursement-gen')) {
            console.log(`[Proxy Rewrite (No Change)] ${path}`);
            return path;
        }

        const newPath = '/reimbursement-gen' + path;
        console.log(`[Proxy Rewrite] ${path} -> ${newPath}`);
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
    '--browser.gatherUsageStats', 'false',
    '--server.baseUrlPath', '/reimbursement-gen'
]);

pythonProcess.stdout.on('data', (data) => console.log(`[Streamlit]: ${data}`));
pythonProcess.stderr.on('data', (data) => console.error(`[Streamlit ERR]: ${data}`));

// Clean up python process on exit
process.on('exit', () => pythonProcess.kill());

// ... (WARMUP logic, unchanged)
// ... (Helper Functions, unchanged)
// ... (Logic for LIBREOFFICE, DA Rates, Endpoints... unchanged)

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
