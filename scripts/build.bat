@echo off
echo 🏗️ Setting up build environment...

REM Create a temporary .env.local for build if it doesn't exist
if not exist .env.local (
    echo 📝 Creating temporary build environment variables...
    (
        echo # Temporary build environment variables
        echo NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
        echo NEXT_PUBLIC_APPWRITE_PROJECT=build-dummy-project
        echo NEXT_APPWRITE_KEY=build-dummy-key
        echo APPWRITE_DATABASE_ID=build-dummy-db
        echo APPWRITE_USER_COLLECTION_ID=build-dummy-users
        echo APPWRITE_BANK_COLLECTION_ID=build-dummy-banks
        echo APPWRITE_TRANSACTION_COLLECTION_ID=build-dummy-transactions
        echo.
        echo # Dummy API keys for build
        echo PLAID_CLIENT_ID=build-dummy-plaid
        echo PLAID_SECRET=build-dummy-secret
        echo PLAID_ENV=sandbox
        echo.
        echo DWOLLA_KEY=build-dummy-dwolla
        echo DWOLLA_SECRET=build-dummy-secret
        echo DWOLLA_BASE_URL=https://api-sandbox.dwolla.com
        echo DWOLLA_ENV=sandbox
        echo.
        echo # Build settings
        echo NODE_ENV=production
        echo NEXT_TELEMETRY_DISABLED=1
    ) > .env.local
    echo ✅ Temporary environment variables created
)

echo 🚀 Starting Next.js build...
npm run build

echo ✅ Build completed successfully!
