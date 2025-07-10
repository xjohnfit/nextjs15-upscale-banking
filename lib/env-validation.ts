// lib/env-validation.ts
export function validateEnvVars() {
    // Only validate in production runtime, not during build
    if (
        process.env.NODE_ENV !== 'production' ||
        process.env.NEXT_PHASE === 'phase-production-build'
    ) {
        return;
    }

    const requiredEnvVars = [
        'NEXT_PUBLIC_APPWRITE_ENDPOINT',
        'NEXT_PUBLIC_APPWRITE_PROJECT',
        'APPWRITE_DATABASE_ID',
        'APPWRITE_USER_COLLECTION_ID',
        'APPWRITE_BANK_COLLECTION_ID',
        'APPWRITE_TRANSACTION_COLLECTION_ID',
        'PLAID_CLIENT_ID',
        'PLAID_SECRET',
        'DWOLLA_KEY',
        'DWOLLA_SECRET',
    ];

    const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
        console.error('Missing required environment variables:', missingVars);
        // Don't throw error, just log - let the app handle it gracefully
    }
}

// Run validation when the module is imported
validateEnvVars();
