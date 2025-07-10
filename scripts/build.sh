#!/bin/bash

# Build script for production - sets up required environment variables for build process
# This ensures the build doesn't fail due to missing runtime environment variables

echo "🏗️ Setting up build environment..."

# Create a temporary .env.local for build if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating temporary build environment variables..."
    cat > .env.local << EOF
# Temporary build environment variables
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=build-dummy-project
NEXT_APPWRITE_KEY=build-dummy-key
APPWRITE_DATABASE_ID=build-dummy-db
APPWRITE_USER_COLLECTION_ID=build-dummy-users
APPWRITE_BANK_COLLECTION_ID=build-dummy-banks
APPWRITE_TRANSACTION_COLLECTION_ID=build-dummy-transactions

# Dummy API keys for build
PLAID_CLIENT_ID=build-dummy-plaid
PLAID_SECRET=build-dummy-secret
PLAID_ENV=sandbox

DWOLLA_KEY=build-dummy-dwolla
DWOLLA_SECRET=build-dummy-secret
DWOLLA_BASE_URL=https://api-sandbox.dwolla.com
DWOLLA_ENV=sandbox

# Build settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
EOF
    echo "✅ Temporary environment variables created"
fi

echo "🚀 Starting Next.js build..."
npm run build

echo "✅ Build completed successfully!"
