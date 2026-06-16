'use server';

import { ID, Query } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '../appwrite';
import { cookies } from 'next/headers';
import {
    decryptId,
    encryptId,
    extractCustomerIdFromUrl,
    parseStringify,
} from '../utils';
import {
    CountryCode,
    ProcessorTokenCreateRequest,
    ProcessorTokenCreateRequestProcessorEnum,
    Products,
} from 'plaid';

import { createPlaidClient } from '@/lib/plaid';
import { revalidatePath } from 'next/cache';
import { addFundingSource, createDwollaCustomer } from './dwolla.actions';
import { createTransfer } from './dwolla.actions';
import { createTransaction } from './transaction.actions';

const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

const SESSION_COOKIE_NAME = 'appwrite-session';

const normalizeCookieDomain = (domain: string | undefined) => {
    if (!domain) {
        return undefined;
    }

    let normalized = domain.trim().toLowerCase();

    if (!normalized) {
        return undefined;
    }

    try {
        if (normalized.includes('://')) {
            normalized = new URL(normalized).hostname.toLowerCase();
        }
    } catch {
        return undefined;
    }

    if (normalized.includes('/')) {
        normalized = normalized.split('/')[0];
    }

    if (normalized.includes(':')) {
        normalized = normalized.split(':')[0];
    }

    if (normalized.startsWith('.')) {
        normalized = normalized.slice(1);
    }

    const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(normalized);

    if (!normalized || normalized === 'localhost' || isIpAddress) {
        return undefined;
    }

    if (!normalized.includes('.')) {
        return undefined;
    }

    return normalized;
};

const getLegacyCookieDomain = () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
        return undefined;
    }

    try {
        const hostname = new URL(siteUrl).hostname.toLowerCase();
        const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

        if (
            hostname === 'localhost' ||
            isIpAddress ||
            !hostname.includes('.')
        ) {
            return undefined;
        }

        // Support both apex and www hosts in production deployments.
        if (hostname.startsWith('www.')) {
            return hostname.slice(4);
        }

        return hostname;
    } catch {
        return undefined;
    }
};

const getSessionCookieOptions = () => {
    const options = {
        path: '/',
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
    };

    const configuredDomain = normalizeCookieDomain(
        process.env.APP_COOKIE_DOMAIN,
    );

    if (configuredDomain && process.env.NODE_ENV === 'production') {
        return {
            ...options,
            domain: configuredDomain,
        };
    }

    return options;
};

const clearSessionCookie = async () => {
    const cookieStore = await cookies();
    const baseOptions = getSessionCookieOptions();

    cookieStore.set(SESSION_COOKIE_NAME, '', {
        ...baseOptions,
        maxAge: 0,
    });

    const legacyDomain = getLegacyCookieDomain();
    if (legacyDomain && process.env.NODE_ENV === 'production') {
        cookieStore.set(SESSION_COOKIE_NAME, '', {
            ...baseOptions,
            domain: legacyDomain,
            maxAge: 0,
        });
    }
};

const normalizeUserId = (value: unknown): string => {
    if (typeof value === 'string') return value;

    if (
        value &&
        typeof value === 'object' &&
        '$id' in value &&
        typeof (value as { $id?: unknown }).$id === 'string'
    ) {
        return (value as { $id: string }).$id;
    }

    return '';
};

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
    try {
        const { database } = await createAdminClient();

        const user = await database.listDocuments(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            [Query.equal('userId', [userId])],
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
            password,
        );

        await clearSessionCookie();
        const cookieStore = await cookies();
        cookieStore.set(
            SESSION_COOKIE_NAME,
            session.secret,
            getSessionCookieOptions(),
        );

        // Try to get user info, but don't fail signin if it doesn't work
        let user;
        try {
            user = await getUserInfo({ userId: session.userId });
            if (!user) {
                user = { userId: session.userId, email };
            }
        } catch (userInfoError) {
            // Return a minimal user object so frontend knows signin worked
            user = { userId: session.userId, email };
        }

        return parseStringify({
            success: true,
            user,
        });
    } catch (error: any) {
        const code = typeof error?.code === 'number' ? error.code : undefined;
        const type =
            typeof error?.type === 'string' ? error.type : 'unknown_error';
        const message =
            typeof error?.message === 'string'
                ? error.message
                : 'Unable to sign in at this time.';

        console.error('[auth] signIn failed:', {
            code,
            type,
            message,
        });

        const isCredentialError =
            code === 401 ||
            type === 'user_invalid_credentials' ||
            message.toLowerCase().includes('invalid credentials');

        return parseStringify({
            success: false,
            errorCode: type,
            message: isCredentialError
                ? 'Invalid email or password. Please try again.'
                : 'Sign in is temporarily unavailable. Please try again shortly.',
        });
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
            `${firstName} ${lastName}`,
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
                userDocData,
            );
        } catch (dbError: any) {
            throw new Error(
                `Database document creation failed: ${
                    dbError?.message || 'Unknown error'
                }`,
            );
        }

        // Create session
        const session = await account.createEmailPasswordSession(
            email,
            password,
        );

        await clearSessionCookie();
        const cookieStore = await cookies();
        cookieStore.set(
            SESSION_COOKIE_NAME,
            session.secret,
            getSessionCookieOptions(),
        );

        return parseStringify(newUser);
    } catch (error: any) {
        console.error('[auth] signUp failed:', error?.message || error);
        return null;
    }
};

export async function getLoggedInUser() {
    try {
        // First check if we have a session cookie
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

        if (!sessionCookie || !sessionCookie.value) {
            return null;
        }

        const { account } = await createSessionClient();

        const result = await account.get();

        const user = await getUserInfo({ userId: result.$id });

        if (!user) {
            const [firstName = 'User', ...rest] = (result.name ?? '')
                .trim()
                .split(/\s+/);

            return parseStringify({
                $id: result.$id,
                userId: result.$id,
                email: result.email,
                firstName,
                lastName: rest.join(' '),
            });
        }

        return parseStringify(user);
    } catch (error: any) {
        // Clear invalid session cookie for various Appwrite authentication errors
        const shouldClearSession =
            error &&
            (error.message?.includes('session') ||
                error.message?.includes('Invalid session') ||
                error.message?.includes(
                    'User (role: guests) missing scope (account)',
                ) ||
                error.message?.includes('Unauthorized') ||
                error.type === 'user_unauthorized' ||
                error.type === 'user_invalid_token' ||
                error.type === 'general_unauthorized_scope' ||
                error.code === 401);
        if (shouldClearSession) {
            // getLoggedInUser can run during Server Component rendering,
            // where cookie mutation is not allowed.
            return null;
        }

        return null;
    }
}

export const logoutAccount = async () => {
    try {
        const { account } = await createSessionClient();

        await clearSessionCookie();

        await account.deleteSession('current');
    } catch (error) {
        return null;
    }
};

export const createLinkToken = async (user: User) => {
    try {
        const plaidClient = createPlaidClient();

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
            },
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
        const plaidClient = createPlaidClient();

        console.log('[exchangePublicToken] step 1: exchanging public token');
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        console.log('[exchangePublicToken] step 2: fetching accounts');
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const accountData = accountsResponse.data.accounts[0];
        console.log('[exchangePublicToken] account:', accountData?.name, accountData?.account_id);

        console.log('[exchangePublicToken] step 3: creating processor token');
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: 'dwolla' as ProcessorTokenCreateRequestProcessorEnum,
        };

        const processorTokenResponse =
            await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;
        console.log('[exchangePublicToken] processor token created:', !!processorToken);

        const existingBank = await getBankByAccountId({
            accountId: accountData.account_id,
        });

        if (existingBank && existingBank.userId === user.$id) {
            console.log('[exchangePublicToken] bank already linked for user');
            revalidatePath('/');
            return parseStringify({
                publicTokenExchange: 'complete',
                message: 'Bank account already connected',
            });
        }

        console.log('[exchangePublicToken] step 4: creating Dwolla funding source', {
            dwollaCustomerId: user.dwollaCustomerId,
            hasDwollaId: !!user.dwollaCustomerId,
        });
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name,
        });

        if (!fundingSourceUrl) {
            const msg = `Failed to create Dwolla funding source. dwollaCustomerId=${user.dwollaCustomerId ?? 'MISSING'}`;
            console.error('[exchangePublicToken]', msg);
            throw new Error(msg);
        }

        console.log('[exchangePublicToken] step 5: saving bank to Appwrite');
        const savedBank = await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            shareableId: encryptId(accountData.account_id),
        });

        if (!savedBank) {
            throw new Error('Failed to save bank account to database. The Appwrite document could not be created.');
        }

        revalidatePath('/');

        console.log('[exchangePublicToken] complete');
        return parseStringify({
            publicTokenExchange: 'complete',
        });
    } catch (error: any) {
        console.error('[exchangePublicToken] FAILED:', error?.message ?? error);
        throw error;
    }
};

export const getBanks = async ({ userId }: getBanksProps) => {
    try {
        const { database } = await createAdminClient();

        const banks = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('userId', [userId])],
        );

        console.log('[getBanks] found', banks.documents.length, 'banks for userId:', userId);
        return parseStringify(banks.documents);
    } catch (error: any) {
        console.error('[getBanks] FAILED for userId:', userId, '| error:', error?.message, '| code:', error?.code, '| type:', error?.type);
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
            documentId,
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
            [Query.equal('accountId', [accountId])],
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
        await clearSessionCookie();
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

export const initiateTransfer = async ({
    senderBankDocumentId,
    receiverShareableId,
    amount,
    email,
    name,
}: InitiateTransferParams) => {
    try {
        const loggedInUser = await getLoggedInUser();

        if (!loggedInUser?.$id) {
            return { success: false, error: 'Unauthorized' };
        }

        const trimmedNote = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const normalizedAmount = Number(amount);

        if (
            !Number.isFinite(normalizedAmount) ||
            normalizedAmount <= 0 ||
            normalizedAmount > 10000
        ) {
            return { success: false, error: 'Invalid transfer amount' };
        }

        const senderBank = await getBank({ documentId: senderBankDocumentId });

        if (!senderBank) {
            return { success: false, error: 'Source bank account not found' };
        }

        const senderOwnerId = normalizeUserId(senderBank.userId);
        if (senderOwnerId !== loggedInUser.$id) {
            return {
                success: false,
                error: 'Not authorized for this bank account',
            };
        }

        const receiverAccountId = decryptId(receiverShareableId);
        const receiverBank = await getBankByAccountId({
            accountId: receiverAccountId,
        });

        if (!receiverBank) {
            return {
                success: false,
                error: 'Destination bank account not found',
            };
        }

        if (!senderBank.fundingSourceUrl || !receiverBank.fundingSourceUrl) {
            return {
                success: false,
                error: 'Bank account is not ready for transfers',
            };
        }

        const transferResult = await createTransfer({
            sourceFundingSourceUrl: senderBank.fundingSourceUrl,
            destinationFundingSourceUrl: receiverBank.fundingSourceUrl,
            amount: normalizedAmount.toFixed(2),
        });

        if (!transferResult) {
            return {
                success: false,
                error: 'Transfer provider rejected the request',
            };
        }

        const receiverId = normalizeUserId(receiverBank.userId);

        const transaction = await createTransaction({
            name: trimmedNote,
            amount: normalizedAmount.toFixed(2),
            senderId: loggedInUser.$id,
            senderBankId: senderBank.$id,
            receiverId,
            receiverBankId: receiverBank.$id,
            email: trimmedEmail,
        });

        if (!transaction) {
            return {
                success: false,
                error: 'Transfer completed but transaction recording failed',
            };
        }

        revalidatePath('/');
        revalidatePath('/payment-transfer');
        revalidatePath('/transaction-history');

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Unable to process transfer request' };
    }
};
