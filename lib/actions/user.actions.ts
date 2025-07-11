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
            console.log('No user document found for userId:', userId);
            return null;
        }

        return parseStringify(user.documents[0]);
    } catch (error) {
        console.log('Error fetching user info:', error);
        return null;
    }
};

export const signIn = async ({ email, password }: signInProps) => {
    try {
        console.log('=== SIGN IN DEBUG START ===');
        console.log('Sign in attempt for email:', email);
        console.log('Environment:', process.env.NODE_ENV);
        console.log(
            'Appwrite endpoint:',
            process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
        );
        console.log(
            'Appwrite project:',
            process.env.NEXT_PUBLIC_APPWRITE_PROJECT
        );

        const { account } = await createAdminClient();
        console.log('Admin client created successfully');

        const session = await account.createEmailPasswordSession(
            email,
            password
        );
        console.log('Session created successfully:', {
            userId: session.userId,
            sessionId: session.$id,
            expire: session.expire,
        });

        const cookieStore = await cookies();
        console.log('Cookie store obtained successfully');

        // Try setting a test cookie first
        try {
            cookieStore.set('test-cookie', 'test-value', {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                secure: false, // Don't use secure for HTTP connections
                maxAge: 60 * 60,
            });
            console.log('Test cookie set successfully');
        } catch (testCookieError) {
            console.error('Failed to set test cookie:', testCookieError);
        }

        // Now set the actual session cookie
        // Fix: Don't use secure cookies on HTTP connections
        const isSecureConnection =
            process.env.FORCE_SECURE_COOKIES === 'true' || false; // Force false for HTTP production

        const cookieOptions = {
            path: '/',
            httpOnly: true,
            sameSite: 'lax' as const,
            secure: isSecureConnection, // Only secure if actually using HTTPS
            maxAge: 60 * 60 * 24 * 30, // 30 days
        };
        console.log('Cookie options:', cookieOptions);
        console.log('Is secure connection:', isSecureConnection);
        console.log(
            'Request headers available:',
            typeof globalThis !== 'undefined' ? 'yes' : 'no'
        );

        cookieStore.set('appwrite-session', session.secret, cookieOptions);
        console.log(
            'Session cookie set successfully with secret length:',
            session.secret.length
        );

        // Verify cookie was set
        const setCookie = cookieStore.get('appwrite-session');
        console.log('Cookie verification:', setCookie ? 'found' : 'not found');

        // Try to get user info, but don't fail signin if it doesn't work
        let user;
        try {
            user = await getUserInfo({ userId: session.userId });
            console.log('User info retrieved successfully');
        } catch (userInfoError) {
            console.log(
                'Could not fetch user info, but signin was successful:',
                userInfoError
            );
            // Return a minimal user object so frontend knows signin worked
            user = { userId: session.userId, email };
        }

        console.log('=== SIGN IN DEBUG END ===');
        return parseStringify(user);
    } catch (error: any) {
        console.error('=== SIGN IN ERROR ===');
        console.error('Sign in error:', error);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        return null;
    }
};

export const signUp = async ({ password, ...userData }: SignUpParams) => {
    const { email, firstName, lastName } = userData;

    let newUserAccount;

    try {
        console.log('=== SIGNUP DEBUG START ===');
        console.log('Signup attempt for email:', email);
        console.log('Environment:', process.env.NODE_ENV);

        const { account, database } = await createAdminClient();
        console.log('Admin client created successfully');

        // Create user account in Appwrite Auth
        console.log('Creating user account in Appwrite Auth...');
        newUserAccount = await account.create(
            ID.unique(),
            email,
            password,
            `${firstName} ${lastName}`
        );
        console.log('User account created successfully:', newUserAccount.$id);

        if (!newUserAccount) throw new Error('Error creating user');

        // Try to create Dwolla customer, but handle failures gracefully
        let dwollaCustomerUrl;
        let dwollaCustomerId;

        try {
            console.log('Creating Dwolla customer...');
            dwollaCustomerUrl = await createDwollaCustomer({
                ...userData,
                type: 'personal',
            });

            if (dwollaCustomerUrl) {
                dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);
                console.log(
                    'Dwolla customer created successfully:',
                    dwollaCustomerId
                );
            }
        } catch (dwollaError) {
            console.error('Dwolla customer creation failed:', dwollaError);
            // Set default values instead of null to satisfy Appwrite schema
            dwollaCustomerUrl = 'pending';
            dwollaCustomerId = 'pending';
        }

        // Create user document in database
        console.log('=== DATABASE CREATION DEBUG ===');
        const userDocData = {
            ...userData,
            userId: newUserAccount.$id,
            dwollaCustomerId: dwollaCustomerId || 'pending',
            dwollaCustomerUrl: dwollaCustomerUrl || 'pending',
        };
        console.log('About to create user document with data:', userDocData);
        console.log('Database ID:', DATABASE_ID);
        console.log('User Collection ID:', USER_COLLECTION_ID);

        let newUser;
        try {
            newUser = await database.createDocument(
                DATABASE_ID!,
                USER_COLLECTION_ID!,
                ID.unique(),
                userDocData
            );
            console.log('User document created successfully:', newUser.$id);
        } catch (dbError: any) {
            console.error('=== DATABASE CREATION ERROR ===');
            console.error('Database creation error:', dbError);
            console.error('Error details:', {
                message: dbError?.message,
                code: dbError?.code,
                type: dbError?.type,
                response: dbError?.response,
            });

            // If user account was created but database document failed,
            // we should clean up the auth account or handle this gracefully
            console.log(
                'Auth account was created but database document failed'
            );
            throw new Error(
                `Database document creation failed: ${
                    dbError?.message || 'Unknown error'
                }`
            );
        }

        // Create session
        console.log('Creating session...');
        const session = await account.createEmailPasswordSession(
            email,
            password
        );
        console.log('Signup session created successfully:', session.$id);

        const cookieStore = await cookies();
        cookieStore.set('appwrite-session', session.secret, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax', // Changed from 'strict' to 'lax' for better production compatibility
            secure: false, // Don't use secure for HTTP connections
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });
        console.log('Signup cookie set successfully');
        console.log('=== SIGNUP DEBUG END ===');

        return parseStringify(newUser);
    } catch (error: any) {
        console.error('=== SIGNUP ERROR ===');
        console.error('Signup error details:', {
            message: error?.message,
            code: error?.code,
            type: error?.type,
            stack: error?.stack,
        });

        // If we created an auth account but failed later, log this
        if (newUserAccount) {
            console.error(
                'Auth account was created but signup failed:',
                newUserAccount.$id
            );
        }

        return null;
    }
};

export async function getLoggedInUser() {
    try {
        console.log('=== GET LOGGED IN USER DEBUG START ===');

        // First check if we have a session cookie
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('appwrite-session');

        console.log('Session cookie exists:', !!sessionCookie);
        console.log(
            'Session cookie value length:',
            sessionCookie?.value?.length || 0
        );

        if (!sessionCookie || !sessionCookie.value) {
            console.log('No session cookie found, user not logged in');
            return null;
        }

        const { account } = await createSessionClient();
        console.log('Session client created successfully');

        const result = await account.get();
        console.log('Account.get() successful, user ID:', result.$id);

        const user = await getUserInfo({ userId: result.$id });
        console.log('User info retrieved successfully:', !!user);

        console.log('=== GET LOGGED IN USER DEBUG END ===');
        return parseStringify(user);
    } catch (error: any) {
        console.error('=== GET LOGGED IN USER ERROR ===');
        console.error('Get logged in user error:', error);
        console.error('Error type:', error?.type);
        console.error('Error code:', error?.code);

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

        if (shouldClearSession) {
            console.log(
                'Invalid session detected - session should be cleared by middleware or route handler'
            );
        }

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
        console.log('Creating Plaid link token for user:', user.$id);

        const tokenParams = {
            user: {
                client_user_id: user.$id,
            },
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth', 'transactions'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[],
        };

        console.log('Plaid token params:', tokenParams);
        const response = await plaidClient.linkTokenCreate(tokenParams);

        console.log('Plaid link token created successfully');
        return parseStringify({ linkToken: response.data.link_token });
    } catch (error) {
        console.error('Error creating Plaid link token:', error);
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
        console.log(error);
    }
};

export const exchangePublicToken = async ({
    publicToken,
    user,
}: exchangePublicTokenProps) => {
    try {
        console.log('Starting public token exchange for user:', user.$id);

        // Exchange public token for access token and item ID
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        console.log('Token exchange successful, item ID:', itemId);

        // Get account information from Plaid using the access token
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const accountData = accountsResponse.data.accounts[0];
        console.log('Account data retrieved:', accountData.name);

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
        console.log('Processor token created successfully');

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

        console.log('Funding source created successfully');

        // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and shareableId ID
        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            shareableId: encryptId(accountData.account_id),
        });

        console.log('Bank account created successfully');

        // Revalidate the path to reflect the changes
        revalidatePath('/');

        // Return a success message
        return parseStringify({
            publicTokenExchange: 'complete',
        });
    } catch (error) {
        console.error(
            'An error occurred while exchanging public token:',
            error
        );
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
        console.log(error);
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
        console.log('Error getting bank:', error);
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
        console.log(error);
    }
};

export const clearInvalidSession = async () => {
    'use server';

    try {
        console.log('Clearing invalid session cookie...');
        const cookieStore = await cookies();
        cookieStore.delete('appwrite-session');
        console.log('Invalid session cookie cleared successfully');
        return { success: true };
    } catch (error) {
        console.error('Failed to clear invalid session cookie:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};
