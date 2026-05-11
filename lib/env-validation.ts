// lib/env-validation.ts
export function validateEnvVars() {
    const requiredEnvVars = [
        'NEXT_PUBLIC_APPWRITE_ENDPOINT',
        'NEXT_PUBLIC_APPWRITE_PROJECT',
        'APPWRITE_DATABASE_ID',
        'APPWRITE_USER_COLLECTION_ID',
        'APPWRITE_BANK_COLLECTION_ID',
        'APPWRITE_TRANSACTION_COLLECTION_ID',
        'APPWRITE_SECRET',
        'PLAID_CLIENT_ID',
        'PLAID_SECRET',
        'DWOLLA_KEY',
        'DWOLLA_SECRET',
    ];

    const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName],
    );

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
