import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, method = 'headers' } = body;

        console.log('[ALT-AUTH-API] Auth attempt:', email, 'method:', method);

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password required' },
                { status: 400 }
            );
        }

        // Create Appwrite session
        const { account } = await createAdminClient();
        const session = await account.createEmailPasswordSession(
            email,
            password
        );

        console.log(
            '[ALT-AUTH-API] Session created successfully:',
            session.$id
        );

        // Create response
        const responseData: any = {
            success: true,
            userId: session.userId,
            sessionId: session.$id,
            method,
            timestamp: new Date().toISOString(),
        };

        const response = NextResponse.json(responseData);

        // Method 1: Set cookie via Set-Cookie header
        if (method === 'headers' || method === 'both') {
            const cookieFlags = [
                'Path=/',
                'HttpOnly',
                'SameSite=Lax',
                // Don't add Secure flag for HTTP connections
                'Max-Age=2592000',
            ].filter(Boolean);

            const cookieValue = `appwrite-session=${
                session.secret
            }; ${cookieFlags.join('; ')}`;
            response.headers.append('Set-Cookie', cookieValue);
            console.log('[ALT-AUTH-API] Cookie set via headers');
        }

        // Method 2: Also try Next.js cookies API
        if (method === 'nextjs' || method === 'both') {
            try {
                const { cookies } = await import('next/headers');
                const cookieStore = await cookies();
                cookieStore.set('appwrite-session', session.secret, {
                    path: '/',
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: false, // Don't use secure for HTTP connections
                    maxAge: 60 * 60 * 24 * 30,
                });
                console.log('[ALT-AUTH-API] Cookie set via Next.js API');
            } catch (nextjsError) {
                console.error(
                    '[ALT-AUTH-API] Next.js cookies API failed:',
                    nextjsError
                );
                responseData.nextjsError = (nextjsError as Error).message;
            }
        }

        return response;
    } catch (error: any) {
        console.error('[ALT-AUTH-API] Authentication failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Authentication failed',
                code: error?.code,
                type: error?.type,
            },
            { status: 401 }
        );
    }
}
