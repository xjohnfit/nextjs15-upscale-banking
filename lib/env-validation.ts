// lib/env-validation.ts

export function validateEnvVars() {
    // All environment variables are required only at runtime (never at build time)
    // They are injected by Kubernetes, not Docker
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        // Build phase: skip all validation
        return;
    }

    const requiredEnvVars = [
        'NEXT_PUBLIC_SITE_URL',
        'NEXT_PUBLIC_APPWRITE_ENDPOINT',
        'NEXT_PUBLIC_APPWRITE_PROJECT',
        'APPWRITE_DATABASE_ID',
        'APPWRITE_USER_COLLECTION_ID',
        'APPWRITE_BANK_COLLECTION_ID',
        'APPWRITE_TRANSACTION_COLLECTION_ID',
        'PLAID_CLIENT_ID',
        'PLAID_SECRET',
        'PLAID_ENV',
        'PLAID_PRODUCTS',
        'PLAID_COUNTRY_CODES',
        'DWOLLA_KEY',
        'DWOLLA_SECRET',
        'DWOLLA_BASE_URL',
        'DWOLLA_ENV',
    ];

    const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName],
    );

    const hasAppwriteSecret = Boolean(process.env.APPWRITE_SECRET);
    const hasLegacyAppwriteKey = Boolean(process.env.NEXT_APPWRITE_KEY);
    const missingAppwriteAdminCredential =
        !hasAppwriteSecret && !hasLegacyAppwriteKey;

    const plaidEnv = process.env.PLAID_ENV ?? 'sandbox';
    const dwollaEnv = process.env.DWOLLA_ENV ?? 'sandbox';

    const invalidPlaidEnv =
        plaidEnv !== 'sandbox' &&
        plaidEnv !== 'development' &&
        plaidEnv !== 'production';
    const invalidDwollaEnv =
        dwollaEnv !== 'sandbox' && dwollaEnv !== 'production';

    const shouldThrow =
        process.env.NODE_ENV === 'production' &&
        process.env.NEXT_PHASE !== 'phase-production-build';

    const validationErrors: string[] = [];

    if (missingVars.length > 0) {
        validationErrors.push(
            `Missing required environment variables: ${missingVars.join(', ')}`,
        );
    }

    if (missingAppwriteAdminCredential) {
        validationErrors.push(
            'Missing Appwrite admin credential: set APPWRITE_SECRET or NEXT_APPWRITE_KEY.',
        );
    }

    if (invalidPlaidEnv) {
        validationErrors.push(
            `Invalid PLAID_ENV value \"${plaidEnv}\". Expected sandbox, development, or production.`,
        );
    }

    if (invalidDwollaEnv) {
        validationErrors.push(
            `Invalid DWOLLA_ENV value \"${dwollaEnv}\". Expected sandbox or production.`,
        );
    }

    if (validationErrors.length === 0) {
        return;
    }

    const message = validationErrors.join(' | ');

    if (shouldThrow) {
        throw new Error(message);
    }

    console.warn(`[env-validation] ${message}`);
}

// Run validation when the module is imported
validateEnvVars();
