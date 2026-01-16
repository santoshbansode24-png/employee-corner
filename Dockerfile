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
    # Standard fonts for English text
    fonts-liberation \
    fonts-liberation2 \
    ttf-mscorefonts-installer \
    # Devanagari fonts for Marathi support
    fonts-noto-core \
    fonts-indic \
    fonts-noto-cjk \
    # Font configuration tools
    fontconfig \
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

# Configure fonts for proper rendering (Arial -> Liberation Sans mapping)
RUN mkdir -p /etc/fonts/conf.d && \
    echo '<?xml version="1.0"?>' > /etc/fonts/local.conf && \
    echo '<!DOCTYPE fontconfig SYSTEM "fonts.dtd">' >> /etc/fonts/local.conf && \
    echo '<fontconfig>' >> /etc/fonts/local.conf && \
    echo '  <!-- Map Arial to Liberation Sans for consistent rendering -->' >> /etc/fonts/local.conf && \
    echo '  <match target="pattern">' >> /etc/fonts/local.conf && \
    echo '    <test qual="any" name="family"><string>Arial</string></test>' >> /etc/fonts/local.conf && \
    echo '    <edit name="family" mode="assign" binding="strong">' >> /etc/fonts/local.conf && \
    echo '      <string>Liberation Sans</string>' >> /etc/fonts/local.conf && \
    echo '    </edit>' >> /etc/fonts/local.conf && \
    echo '  </match>' >> /etc/fonts/local.conf && \
    echo '  <!-- Devanagari/Marathi font support -->' >> /etc/fonts/local.conf && \
    echo '  <match target="pattern">' >> /etc/fonts/local.conf && \
    echo '    <test qual="any" name="family"><string>sans-serif</string></test>' >> /etc/fonts/local.conf && \
    echo '    <test name="lang" compare="contains"><string>mr</string></test>' >> /etc/fonts/local.conf && \
    echo '    <edit name="family" mode="prepend" binding="strong">' >> /etc/fonts/local.conf && \
    echo '      <string>Noto Sans Devanagari</string>' >> /etc/fonts/local.conf && \
    echo '    </edit>' >> /etc/fonts/local.conf && \
    echo '  </match>' >> /etc/fonts/local.conf && \
    echo '  <!-- Improve font rendering quality -->' >> /etc/fonts/local.conf && \
    echo '  <match target="font">' >> /etc/fonts/local.conf && \
    echo '    <edit name="antialias" mode="assign"><bool>true</bool></edit>' >> /etc/fonts/local.conf && \
    echo '    <edit name="hinting" mode="assign"><bool>true</bool></edit>' >> /etc/fonts/local.conf && \
    echo '    <edit name="hintstyle" mode="assign"><const>hintslight</const></edit>' >> /etc/fonts/local.conf && \
    echo '    <edit name="rgba" mode="assign"><const>rgb</const></edit>' >> /etc/fonts/local.conf && \
    echo '  </match>' >> /etc/fonts/local.conf && \
    echo '</fontconfig>' >> /etc/fonts/local.conf && \
    fc-cache -f -v

# Configure Puppeteer to use system Chromium (saves 170MB download)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production



# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./dist

COPY server.js ./

# Create public directory (will be populated at runtime if needed)
RUN mkdir -p ./public

# Expose port (Railway provides PORT env variable dynamically)
EXPOSE 8080

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${PORT}', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Node.js server only
CMD ["node", "server.js"]
