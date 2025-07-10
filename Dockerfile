# ==================================================
# Multi-stage Dockerfile for Next.js 15 Upscale Banking
# Optimized for production deployment with security and performance
# ==================================================

# Stage 1: Base image with Node.js and security updates
FROM node:24-alpine AS base

# Install security updates and necessary packages
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache libc6-compat dumb-init curl && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Stage 2: Dependencies installation
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with npm ci for faster, reliable, reproducible builds
RUN npm ci --only=production --frozen-lockfile && \
    npm cache clean --force

# Stage 3: Development dependencies and build
FROM base AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies)
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Set dummy environment variables for build process
ENV NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
ENV NEXT_PUBLIC_APPWRITE_PROJECT=build-dummy-project
ENV NEXT_APPWRITE_KEY=build-dummy-key
ENV APPWRITE_DATABASE_ID=build-dummy-db
ENV APPWRITE_USER_COLLECTION_ID=build-dummy-users
ENV APPWRITE_BANK_COLLECTION_ID=build-dummy-banks
ENV APPWRITE_TRANSACTION_COLLECTION_ID=build-dummy-transactions
ENV PLAID_CLIENT_ID=build-dummy-plaid
ENV PLAID_SECRET=build-dummy-secret
ENV PLAID_ENV=sandbox
ENV DWOLLA_KEY=build-dummy-dwolla
ENV DWOLLA_SECRET=build-dummy-secret
ENV DWOLLA_BASE_URL=https://api-sandbox.dwolla.com
ENV DWOLLA_ENV=sandbox

# Build the Next.js application
RUN npm run build

# Stage 4: Production runtime
FROM base AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5004

# Create necessary directories with proper permissions
RUN mkdir .next && \
    chown nextjs:nodejs .next

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy package.json for runtime
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nextjs

# Expose the port that the app runs on
EXPOSE 5004

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5004/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]