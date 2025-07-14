'use server';

import { ID, Query } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '../appwrite';
import { cookies } from 'next/headers';
import { encryptId, extractCustomerIdFromUrl, parseStringify } from '../utils';
import {
    CountryCode,
    ProcessorTokenCreateRequest,
    ProcessorTokenCreateRequestProcessorEnum,
    Products,
} from 'plaid';

import { plaidClient } from '@/lib/plaid';
import { revalidatePath } from 'next/cache';
import { addFundingSource, createDwollaCustomer } from './dwolla.actions';

const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
    try {
        const { database } = await createAdminClient();

        const user = await database.listDocuments(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            [Query.equal('userId', [userId])]
        );

        if (user.documents.length === 0) {
            return null;
        }

        return parseStringify(user.documents[0]);
    } catch (error) {
        return null;
    }
};

export const signIn = async ({ email, password }: signInProps) => {
    try {
        const { account } = await createAdminClient();

        const session = await account.createEmailPasswordSession(
            email,
            password
        );

        const cookieStore = await cookies();

        // Set the session cookie
        const isSecureConnection =
            process.env.FORCE_SECURE_COOKIES === 'true' || false; // Force false for HTTP production

        const cookieOptions = {
            path: '/',
            httpOnly: true,
            sameSite: 'lax' as const,
            secure: isSecureConnection,
            maxAge: 60 * 60 * 24 * 30, // 30 days
        };

        cookieStore.set('appwrite-session', session.secret, cookieOptions);

        // Try to get user info, but don't fail signin if it doesn't work
        let user;
        try {
            user = await getUserInfo({ userId: session.userId });
        } catch (userInfoError) {
            // Return a minimal user object so frontend knows signin worked
            user = { userId: session.userId, email };
        }

        return parseStringify(user);
    } catch (error: any) {
        return null;
    }
};

export const signUp = async ({ password, ...userData }: SignUpParams) => {
    const { email, firstName, lastName } = userData;

    let newUserAccount;

    try {
        const { account, database } = await createAdminClient();

        // Create user account in Appwrite Auth
        newUserAccount = await account.create(
            ID.unique(),
            email,
            password,
            `${firstName} ${lastName}`
        );

        if (!newUserAccount) throw new Error('Error creating user');

        // Try to create Dwolla customer, but handle failures gracefully
        let dwollaCustomerUrl;
        let dwollaCustomerId;

        try {
            dwollaCustomerUrl = await createDwollaCustomer({
                ...userData,
                type: 'personal',
            });

            if (dwollaCustomerUrl) {
                dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);
            }
        } catch (dwollaError) {
            // Set default values instead of null to satisfy Appwrite schema
            dwollaCustomerUrl = 'pending';
            dwollaCustomerId = 'pending';
        }

        // Create user document in database
        const userDocData = {
            ...userData,
            userId: newUserAccount.$id,
            dwollaCustomerId: dwollaCustomerId || 'pending',
            dwollaCustomerUrl: dwollaCustomerUrl || 'pending',
        };

        let newUser;
        try {
            newUser = await database.createDocument(
                DATABASE_ID!,
                USER_COLLECTION_ID!,
                ID.unique(),
                userDocData
            );
        } catch (dbError: any) {
            throw new Error(
                `Database document creation failed: ${
                    dbError?.message || 'Unknown error'
                }`
            );
        }

        // Create session
        const session = await account.createEmailPasswordSession(
            email,
            password
        );

        const cookieStore = await cookies();
        cookieStore.set('appwrite-session', session.secret, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return parseStringify(newUser);
    } catch (error: any) {
        return null;
    }
};

export async function getLoggedInUser() {
    try {
        // First check if we have a session cookie
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('appwrite-session');

        if (!sessionCookie || !sessionCookie.value) {
            return null;
        }

        const { account } = await createSessionClient();

        const result = await account.get();

        const user = await getUserInfo({ userId: result.$id });

        return parseStringify(user);
    } catch (error: any) {
        // Clear invalid session cookie for various Appwrite authentication errors
        const shouldClearSession =
            error &&
            (error.message?.includes('session') ||
                error.message?.includes('Invalid session') ||
                error.message?.includes(
                    'User (role: guests) missing scope (account)'
                ) ||
                error.message?.includes('Unauthorized') ||
                error.type === 'user_unauthorized' ||
                error.type === 'user_invalid_token' ||
                error.type === 'general_unauthorized_scope' ||
                error.code === 401);

        return null;
    }
}

export const logoutAccount = async () => {
    try {
        const { account } = await createSessionClient();

        (await cookies()).delete('appwrite-session');

        await account.deleteSession('current');
    } catch (error) {
        return null;
    }
};

export const createLinkToken = async (user: User) => {
    try {
        const tokenParams = {
            user: {
                client_user_id: user.$id,
            },
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth', 'transactions'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[],
            // Leave redirect_uri undefined to let Plaid handle OAuth within modal
        };

        const response = await plaidClient.linkTokenCreate(tokenParams);

        return parseStringify({ linkToken: response.data.link_token });
    } catch (error) {
        return null;
    }
};

export const createBankAccount = async ({
    userId,
    bankId,
    accountId,
    accessToken,
    fundingSourceUrl,
    shareableId,
}: createBankAccountProps) => {
    try {
        const { database } = await createAdminClient();

        const bankAccount = await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                shareableId,
            }
        );

        return parseStringify(bankAccount);
    } catch (error) {
        return null;
    }
};

export const exchangePublicToken = async ({
    publicToken,
    user,
}: exchangePublicTokenProps) => {
    try {
        // Exchange public token for access token and item ID
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        // Get account information from Plaid using the access token
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const accountData = accountsResponse.data.accounts[0];

        // Create a processor token for Dwolla using the access token and account ID
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: 'dwolla' as ProcessorTokenCreateRequestProcessorEnum,
        };

        const processorTokenResponse = await plaidClient.processorTokenCreate(
            request
        );
        const processorToken = processorTokenResponse.data.processor_token;

        // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name,
        });

        // If the funding source URL is not created, throw an error
        if (!fundingSourceUrl) {
            throw new Error('Failed to create funding source URL');
        }

        // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and shareableId ID
        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            shareableId: encryptId(accountData.account_id),
        });

        // Revalidate the path to reflect the changes
        revalidatePath('/');

        // Return a success message
        return parseStringify({
            publicTokenExchange: 'complete',
        });
    } catch (error) {
        throw error; // Re-throw so PlaidLink can handle it
    }
};

export const getBanks = async ({ userId }: getBanksProps) => {
    try {
        const { database } = await createAdminClient();

        const banks = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('userId', [userId])]
        );

        return parseStringify(banks.documents);
    } catch (error) {
        return [];
    }
};

export const getBank = async ({ documentId }: getBankProps) => {
    try {
        const { database } = await createAdminClient();

        // Use getDocument directly for getting by document ID
        const bank = await database.getDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            documentId
        );

        return parseStringify(bank);
    } catch (error) {
        return null;
    }
};

export const getBankByAccountId = async ({
    accountId,
}: getBankByAccountIdProps) => {
    try {
        const { database } = await createAdminClient();

        const bank = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('accountId', [accountId])]
        );

        if (bank.total !== 1) return null;

        return parseStringify(bank.documents[0]);
    } catch (error) {
        return null;
    }
};

export const clearInvalidSession = async () => {
    'use server';

    try {
        const cookieStore = await cookies();
        cookieStore.delete('appwrite-session');
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};
