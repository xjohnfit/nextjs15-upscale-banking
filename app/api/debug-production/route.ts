import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('appwrite-session');
        const testCookie = cookieStore.get('test-cookie');

        // Get request headers that might affect cookies
        const userAgent = request.headers.get('user-agent');
        const forwarded = request.headers.get('x-forwarded-for');
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';

        const debugInfo = {
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            cookies: {
                sessionExists: !!sessionCookie,
                sessionLength: sessionCookie?.value?.length || 0,
                testCookieExists: !!testCookie,
                totalCookies: cookieStore.getAll().length,
            },
            request: {
                host,
                protocol,
                userAgent: userAgent?.substring(0, 50) + '...',
                hasForwardedFor: !!forwarded,
                url: request.url,
            },
            appwrite: {
                endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
                    ? 'configured'
                    : 'missing',
                project: process.env.NEXT_PUBLIC_APPWRITE_PROJECT
                    ? 'configured'
                    : 'missing',
                hasApiKey: !!process.env.NEXT_APPWRITE_KEY,
            },
        };

        return NextResponse.json(debugInfo, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                Pragma: 'no-cache',
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                error: 'Debug endpoint failed',
                message: error?.message,
                environment: process.env.NODE_ENV,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
