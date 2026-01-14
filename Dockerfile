# ============================================
# OPTIMIZED MULTI-STAGE DOCKERFILE
# Reduces image size from ~2GB to ~600MB
# ============================================

# Stage 1: Build React Frontend (Alpine for minimal size)
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build React app
RUN npm run build

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM node:18-bullseye-slim

# Install system dependencies with minimal footprint
RUN apt-get update && apt-get install -y \
    # Python for Streamlit
    python3 \
    python3-pip \
    # Chromium for Puppeteer (instead of downloading 170MB)
    chromium \
    # Required libraries for Chromium
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgbm1 \
    libasound2 \
    libxshmfence1 \
    # LibreOffice for Word/PDF conversion
    libreoffice \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configure Puppeteer to use system Chromium (saves 170MB download)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Python requirements and install
COPY medical_gen/requirements.txt ./medical_gen/requirements.txt
RUN pip3 install --no-cache-dir -r medical_gen/requirements.txt

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./dist

# Copy server and application files
COPY server.js ./
COPY medical_gen ./medical_gen

# Create public directory (will be populated at runtime if needed)
RUN mkdir -p ./public

# Expose port (Railway provides PORT env variable dynamically)
EXPOSE 8080

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${PORT}', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start both Node.js server and Streamlit
CMD ["npx", "concurrently", \
    "node server.js", \
    "python3 -m streamlit run medical_gen/main.py --server.port=8501 --server.address=0.0.0.0 --server.headless=true"]
