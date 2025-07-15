'use server';

import { Client } from 'dwolla-v2';

const getEnvironment = (): 'production' | 'sandbox' => {
    const environment = process.env.DWOLLA_ENV || ('sandbox' as string);

    switch (environment) {
        case 'sandbox':
            return 'sandbox';
        case 'production':
            return 'production';
        default:
            throw new Error(
                'Dwolla environment should either be set to `sandbox` or `production`'
            );
    }
};

// Validate Dwolla configuration
const validateDwollaConfig = () => {
    const key = process.env.DWOLLA_KEY;
    const secret = process.env.DWOLLA_SECRET;

    if (!key || key === 'build-dummy-key') {
        console.warn('Dwolla API key is missing or using dummy value');
    }

    if (!secret || secret === 'build-dummy-secret') {
        console.warn('Dwolla API secret is missing or using dummy value');
    }

    return { key, secret };
};

const { key, secret } = validateDwollaConfig();

const dwollaClient = new Client({
    environment: getEnvironment(),
    key: key || 'build-dummy-key',
    secret: secret || 'build-dummy-secret',
});

// Create a Dwolla Funding Source using a Plaid Processor Token
export const createFundingSource = async (
    options: CreateFundingSourceOptions
) => {
    try {
        const response = await dwollaClient.post(
            `customers/${options.customerId}/funding-sources`,
            {
                name: options.fundingSourceName,
                plaidToken: options.plaidToken,
            }
        );

        return response.headers.get('location');
    } catch (err: any) {
        // Check if this is a duplicate resource error
        if (err.body && err.body.code === 'DuplicateResource') {
            console.log('Bank already exists, using existing funding source:', {
                customerId: options.customerId,
                fundingSourceName: options.fundingSourceName,
                existingFundingSourceUrl: err.body._links?.about?.href,
            });

            // Return the existing funding source URL from the error response
            return err.body._links?.about?.href || null;
        }

        console.error('Dwolla createFundingSource error:', {
            error: err,
            message: err.message,
            status: err.statusCode,
            body: err.body,
            customerId: options.customerId,
            fundingSourceName: options.fundingSourceName,
        });
        return null;
    }
};

export const createOnDemandAuthorization = async () => {
    try {
        const onDemandAuthorization = await dwollaClient.post(
            'on-demand-authorizations'
        );
        const authLink = onDemandAuthorization.body._links;
        return authLink;
    } catch (err: any) {
        console.error('createOnDemandAuthorization error:', {
            error: err,
            message: err.message,
            status: err.statusCode,
            body: err.body,
        });
        return null;
    }
};

export const createDwollaCustomer = async (
    newCustomer: NewDwollaCustomerParams
) => {
    try {
        return await dwollaClient
            .post('customers', newCustomer)
            .then((res) => res.headers.get('location'));
    } catch (err) {
        return null;
    }
};

export const createTransfer = async ({
    sourceFundingSourceUrl,
    destinationFundingSourceUrl,
    amount,
}: TransferParams) => {
    try {
        const requestBody = {
            _links: {
                source: {
                    href: sourceFundingSourceUrl,
                },
                destination: {
                    href: destinationFundingSourceUrl,
                },
            },
            amount: {
                currency: 'USD',
                value: amount,
            },
        };
        return await dwollaClient
            .post('transfers', requestBody)
            .then((res) => res.headers.get('location'));
    } catch (err) {
        return null;
    }
};

export const addFundingSource = async ({
    dwollaCustomerId,
    processorToken,
    bankName,
}: AddFundingSourceParams) => {
    try {
        // Validate required parameters
        if (!dwollaCustomerId || !processorToken || !bankName) {
            console.error('Missing required parameters for addFundingSource:', {
                dwollaCustomerId: !!dwollaCustomerId,
                processorToken: !!processorToken,
                bankName: !!bankName,
            });
            return null;
        }

        // create dwolla auth link
        const dwollaAuthLinks = await createOnDemandAuthorization();

        if (!dwollaAuthLinks) {
            console.error('Failed to create Dwolla authorization links');
            return null;
        }

        // add funding source to the dwolla customer & get the funding source url
        const fundingSourceOptions = {
            customerId: dwollaCustomerId,
            fundingSourceName: bankName,
            plaidToken: processorToken,
            _links: dwollaAuthLinks,
        };

        return await createFundingSource(fundingSourceOptions);
    } catch (err: any) {
        console.error('addFundingSource error:', {
            error: err,
            message: err.message,
            dwollaCustomerId,
            bankName,
        });
        return null;
    }
};
