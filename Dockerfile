# ============================================
# Next.js 16 - Railway Deployment Dockerfile
# Uses Next.js standalone output for minimal image size
# ============================================

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat libreoffice ttf-freefont font-noto-devanagari fontconfig && fc-cache -fv
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image - minimal and clean
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install LibreOffice in the runner for PDF conversion
RUN apk add --no-cache libreoffice ttf-freefont font-noto-devanagari fontconfig && fc-cache -fv

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder
COPY --from=builder /app/public ./public

# Leverage Next.js standalone output for smallest image
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
