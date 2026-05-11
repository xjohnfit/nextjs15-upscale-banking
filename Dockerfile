# Build stage

# Build stage
FROM node:20-alpine AS builder

# Accept build arguments for all required environment variables
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_APPWRITE_ENDPOINT
ARG NEXT_PUBLIC_APPWRITE_PROJECT
ARG APPWRITE_DATABASE_ID
ARG APPWRITE_USER_COLLECTION_ID
ARG APPWRITE_BANK_COLLECTION_ID
ARG APPWRITE_TRANSACTION_COLLECTION_ID
ARG NEXT_APPWRITE_KEY
ARG APPWRITE_SECRET
ARG PLAID_CLIENT_ID
ARG PLAID_SECRET
ARG PLAID_ENV
ARG PLAID_PRODUCTS
ARG PLAID_COUNTRY_CODES
ARG DWOLLA_KEY
ARG DWOLLA_SECRET
ARG DWOLLA_BASE_URL
ARG DWOLLA_ENV

# Set as ENV so Next.js build can access them
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_APPWRITE_ENDPOINT=$NEXT_PUBLIC_APPWRITE_ENDPOINT \
    NEXT_PUBLIC_APPWRITE_PROJECT=$NEXT_PUBLIC_APPWRITE_PROJECT \
    APPWRITE_DATABASE_ID=$APPWRITE_DATABASE_ID \
    APPWRITE_USER_COLLECTION_ID=$APPWRITE_USER_COLLECTION_ID \
    APPWRITE_BANK_COLLECTION_ID=$APPWRITE_BANK_COLLECTION_ID \
    APPWRITE_TRANSACTION_COLLECTION_ID=$APPWRITE_TRANSACTION_COLLECTION_ID \
    NEXT_APPWRITE_KEY=$NEXT_APPWRITE_KEY \
    APPWRITE_SECRET=$APPWRITE_SECRET \
    PLAID_CLIENT_ID=$PLAID_CLIENT_ID \
    PLAID_SECRET=$PLAID_SECRET \
    PLAID_ENV=$PLAID_ENV \
    PLAID_PRODUCTS=$PLAID_PRODUCTS \
    PLAID_COUNTRY_CODES=$PLAID_COUNTRY_CODES \
    DWOLLA_KEY=$DWOLLA_KEY \
    DWOLLA_SECRET=$DWOLLA_SECRET \
    DWOLLA_BASE_URL=$DWOLLA_BASE_URL \
    DWOLLA_ENV=$DWOLLA_ENV

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init to handle PID 1 properly
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy standalone output (includes server.js and required node_modules)
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./

# Copy static assets
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static

# Copy public folder
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check — adjust path to a real route in your app
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode < 500 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the Next.js standalone server
CMD ["node", "server.js"]