'use server';

import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

// Alternative sign-in that sets cookies via headers
export async function signInWithHeaders({ email, password }: { email: string; password: string }) {
    try {
        console.log('[HEADER-AUTH] Starting sign-in for:', email);
        
        // Import Appwrite and create session
        const { createAdminClient } = await import('@/lib/appwrite');
        const { account } = await createAdminClient();
        
        const session = await account.createEmailPasswordSession(email, password);
        console.log('[HEADER-AUTH] Session created:', session.$id);
        
        // Instead of using cookies(), we'll return the session to set it on client
        return {
            success: true,
            sessionSecret: session.secret,
            userId: session.userId,
            sessionId: session.$id
        };
        
    } catch (error: any) {
        console.error('[HEADER-AUTH] Error:', error);
        return {
            success: false,
            error: error?.message || 'Authentication failed'
        };
    }
}

// Alternative that uses NextResponse to set cookies
export async function signInWithResponse({ email, password }: { email: string; password: string }) {
    try {
        console.log('[RESPONSE-AUTH] Starting sign-in for:', email);
        
        const { createAdminClient } = await import('@/lib/appwrite');
        const { account } = await createAdminClient();
        
        const session = await account.createEmailPasswordSession(email, password);
        console.log('[RESPONSE-AUTH] Session created:', session.$id);
        
        // Create a response that sets the cookie
        const response = NextResponse.json({
            success: true,
            userId: session.userId,
            sessionId: session.$id
        });
        
        // Set cookie via response headers
        const cookieFlags = [
            'Path=/',
            'HttpOnly',
            'SameSite=Lax',
            process.env.NODE_ENV === 'production' ? 'Secure' : '',
            'Max-Age=2592000' // 30 days
        ].filter(Boolean);
        
        const cookieValue = `appwrite-session=${session.secret}; ${cookieFlags.join('; ')}`;
        response.headers.set('Set-Cookie', cookieValue);
        
        console.log('[RESPONSE-AUTH] Cookie set via headers:', cookieValue);
        return response;
        
    } catch (error: any) {
        console.error('[RESPONSE-AUTH] Error:', error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Authentication failed' },
            { status: 401 }
        );
    }
}
