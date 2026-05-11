'use server';

import { Client, Account, Databases, Users } from 'node-appwrite';
import { cookies } from 'next/headers';

function requireEnvVar(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export async function createSessionClient() {
    const endpoint = requireEnvVar('NEXT_PUBLIC_APPWRITE_ENDPOINT');
    const project = requireEnvVar('NEXT_PUBLIC_APPWRITE_PROJECT');

    const client = new Client().setEndpoint(endpoint).setProject(project);

    const session = (await cookies()).get('appwrite-session');

    if (!session || !session.value) {
        throw new Error('No session');
    }

    try {
        client.setSession(session.value);

        // Test the session by creating an account instance and trying to verify it
        const account = new Account(client);

        return {
            get account() {
                return account;
            },
        };
    } catch (error: any) {
        // Clear invalid session cookie
        try {
            const cookieStore = await cookies();
            cookieStore.delete('appwrite-session');
        } catch (clearError) {
            // Failed to clear session cookie
        }

        throw error;
    }
}

export async function createAdminClient() {
    const endpoint = requireEnvVar('NEXT_PUBLIC_APPWRITE_ENDPOINT');
    const project = requireEnvVar('NEXT_PUBLIC_APPWRITE_PROJECT');
    const key =
        process.env.APPWRITE_SECRET ?? requireEnvVar('NEXT_APPWRITE_KEY');

    const client = new Client()
        .setEndpoint(endpoint)
        .setProject(project)
        .setKey(key);

    // Only allow self-signed certificates in local development when explicitly enabled.
    if (
        process.env.NODE_ENV !== 'production' &&
        process.env.ALLOW_SELF_SIGNED_TLS === 'true'
    ) {
        client.setSelfSigned(true);
    }

    return {
        get account() {
            return new Account(client);
        },
        get database() {
            return new Databases(client);
        },
        get user() {
            return new Users(client);
        },
    };
}
