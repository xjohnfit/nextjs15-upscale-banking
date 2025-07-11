import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { testType } = body;

        console.log('[AGGRESSIVE-COOKIE-TEST] Starting test:', testType);

        // Create response with multiple cookie setting methods
        const response = NextResponse.json({
            success: true,
            testType,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            methods: ['next-cookies', 'set-cookie-header', 'both'],
        });

        const sessionValue = `test-session-${Date.now()}`;

        // Method 1: Using Next.js cookies API (this is what's failing)
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            cookieStore.set('method1-nextjs', sessionValue, {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24,
            });
            console.log(
                '[AGGRESSIVE-COOKIE-TEST] Method 1 (Next.js) completed'
            );
        } catch (method1Error: any) {
            console.error(
                '[AGGRESSIVE-COOKIE-TEST] Method 1 failed:',
                method1Error
            );
        }

        // Method 2: Using Set-Cookie headers directly
        try {
            const cookieFlags = [
                'Path=/',
                'HttpOnly',
                'SameSite=Lax',
                process.env.NODE_ENV === 'production' ? 'Secure' : '',
                'Max-Age=86400',
            ].filter(Boolean);

            const cookieHeader = `method2-headers=${sessionValue}; ${cookieFlags.join(
                '; '
            )}`;
            response.headers.set('Set-Cookie', cookieHeader);
            console.log(
                '[AGGRESSIVE-COOKIE-TEST] Method 2 (Headers) completed:',
                cookieHeader
            );
        } catch (method2Error: any) {
            console.error(
                '[AGGRESSIVE-COOKIE-TEST] Method 2 failed:',
                method2Error
            );
        }

        // Method 3: Multiple cookies with different configurations
        const testConfigs = [
            { name: 'test-basic', secure: false, sameSite: 'lax' },
            { name: 'test-secure', secure: true, sameSite: 'lax' },
            { name: 'test-none', secure: true, sameSite: 'none' },
            { name: 'test-strict', secure: false, sameSite: 'strict' },
        ];

        const setCookieHeaders: string[] = [];
        testConfigs.forEach((config) => {
            const flags = [
                'Path=/',
                'HttpOnly',
                `SameSite=${config.sameSite}`,
                config.secure ? 'Secure' : '',
                'Max-Age=3600',
            ].filter(Boolean);

            setCookieHeaders.push(
                `${config.name}=${sessionValue}-${config.name}; ${flags.join(
                    '; '
                )}`
            );
        });

        // Set multiple cookies
        response.headers.set('Set-Cookie', setCookieHeaders.join(', '));

        console.log('[AGGRESSIVE-COOKIE-TEST] All methods completed');
        return response;
    } catch (error: any) {
        console.error('[AGGRESSIVE-COOKIE-TEST] Overall error:', error);
        return NextResponse.json(
            {
                error: 'Aggressive cookie test failed',
                details: error?.message,
                stack: error?.stack,
            },
            { status: 500 }
        );
    }
}
