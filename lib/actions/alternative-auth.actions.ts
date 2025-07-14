'use server';

import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

// Alternative sign-in that sets cookies via headers
export async function signInWithHeaders({
    email,
    password,
}: {
    email: string;
    password: string;
}) {
    try {
        // Import Appwrite and create session
        const { createAdminClient } = await import('@/lib/appwrite');
        const { account } = await createAdminClient();

        const session = await account.createEmailPasswordSession(
            email,
            password
        );

        // Instead of using cookies(), we'll return the session to set it on client
        return {
            success: true,
            sessionSecret: session.secret,
            userId: session.userId,
            sessionId: session.$id,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || 'Authentication failed',
        };
    }
}

// Alternative that uses NextResponse to set cookies
export async function signInWithResponse({
    email,
    password,
}: {
    email: string;
    password: string;
}) {
    try {
        const { createAdminClient } = await import('@/lib/appwrite');
        const { account } = await createAdminClient();

        const session = await account.createEmailPasswordSession(
            email,
            password
        );

        // Create a response that sets the cookie
        const response = NextResponse.json({
            success: true,
            userId: session.userId,
            sessionId: session.$id,
        });

        // Set cookie via response headers
        const cookieFlags = [
            'Path=/',
            'HttpOnly',
            'SameSite=Lax',
            process.env.NODE_ENV === 'production' ? 'Secure' : '',
            'Max-Age=2592000', // 30 days
        ].filter(Boolean);

        const cookieValue = `appwrite-session=${
            session.secret
        }; ${cookieFlags.join('; ')}`;
        response.headers.set('Set-Cookie', cookieValue);

        return response;
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Authentication failed',
            },
            { status: 401 }
        );
    }
}
