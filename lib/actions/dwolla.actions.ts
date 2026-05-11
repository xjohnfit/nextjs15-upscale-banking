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
                'Dwolla environment should either be set to `sandbox` or `production`',
            );
    }
};

const getDwollaConfig = () => {
    const key = process.env.DWOLLA_KEY;
    const secret = process.env.DWOLLA_SECRET;

    if (!key || !secret) {
        throw new Error(
            'Missing Dwolla configuration. Set DWOLLA_KEY and DWOLLA_SECRET.',
        );
    }

    return { key, secret };
};

const getDwollaClient = () => {
    const { key, secret } = getDwollaConfig();

    return new Client({
        environment: getEnvironment(),
        key,
        secret,
    });
};

// Create a Dwolla Funding Source using a Plaid Processor Token
export const createFundingSource = async (
    options: CreateFundingSourceOptions,
) => {
    try {
        const dwollaClient = getDwollaClient();
        const response = await dwollaClient.post(
            `customers/${options.customerId}/funding-sources`,
            {
                name: options.fundingSourceName,
                plaidToken: options.plaidToken,
            },
        );

        return response.headers.get('location');
    } catch (err: any) {
        // Check if this is a duplicate resource error
        if (err.body && err.body.code === 'DuplicateResource') {
            console.log('Bank already exists, using existing funding source.');

            // Return the existing funding source URL from the error response
            return err.body._links?.about?.href || null;
        }

        console.error('Dwolla createFundingSource error:', {
            message: err?.message,
            status: err?.statusCode,
            code: err?.body?.code,
        });
        return null;
    }
};

export const createOnDemandAuthorization = async () => {
    try {
        const dwollaClient = getDwollaClient();
        const onDemandAuthorization = await dwollaClient.post(
            'on-demand-authorizations',
        );
        const authLink = onDemandAuthorization.body._links;
        return authLink;
    } catch (err: any) {
        console.error('createOnDemandAuthorization error:', {
            message: err?.message,
            status: err?.statusCode,
            code: err?.body?.code,
        });
        return null;
    }
};

export const createDwollaCustomer = async (
    newCustomer: NewDwollaCustomerParams,
) => {
    try {
        const dwollaClient = getDwollaClient();
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
        const dwollaClient = getDwollaClient();
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
            message: err?.message,
        });
        return null;
    }
};
