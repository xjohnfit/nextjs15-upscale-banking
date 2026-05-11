import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

function getPlaidEnvironment() {
    const plaidEnv = process.env.PLAID_ENV ?? 'sandbox';

    switch (plaidEnv) {
        case 'sandbox':
            return PlaidEnvironments.sandbox;
        case 'development':
            return PlaidEnvironments.development;
        case 'production':
            return PlaidEnvironments.production;
        default:
            throw new Error(
                `Invalid PLAID_ENV value \"${plaidEnv}\". Expected sandbox, development, or production.`,
            );
    }
}

function getPlaidCredentials() {
    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;

    if (!clientId || !secret) {
        throw new Error(
            'Missing Plaid configuration. Set PLAID_CLIENT_ID and PLAID_SECRET.',
        );
    }

    return { clientId, secret };
}

const { clientId, secret } = getPlaidCredentials();

const configuration = new Configuration({
    basePath: getPlaidEnvironment(),
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': clientId,
            'PLAID-SECRET': secret,
        },
    },
});

export const plaidClient = new PlaidApi(configuration);
