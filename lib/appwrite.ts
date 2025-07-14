'use server';

import { Client, Account, Databases, Users } from 'node-appwrite';
import { cookies } from 'next/headers';

export async function createSessionClient() {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

    if (!endpoint || !project) {
        throw new Error('Missing Appwrite configuration');
    }

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
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    const key = process.env.NEXT_APPWRITE_KEY;

    if (!endpoint || !project || !key) {
        throw new Error('Missing Appwrite admin configuration');
    }

    const client = new Client()
        .setEndpoint(endpoint)
        .setProject(project)
        .setSelfSigned(true) // <—— THIS IS CRUCIAL FOR HTTP CONNECTIONS/ REMOVE FOR HTTPS
        .setKey(key);

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
