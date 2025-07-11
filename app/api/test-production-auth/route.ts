import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, testType } = body;

        console.log(`[PROD-AUTH-TEST] ${testType} attempt for:`, email);
        console.log('[PROD-AUTH-TEST] Environment:', process.env.NODE_ENV);
        console.log('[PROD-AUTH-TEST] Host:', request.headers.get('host'));
        console.log(
            '[PROD-AUTH-TEST] Protocol:',
            request.headers.get('x-forwarded-proto') || 'http'
        );

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password required' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();

        // Create a test session token
        const sessionToken = `test-session-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;

        // Test different cookie configurations
        const configs = [
            {
                name: 'test-basic',
                options: {
                    path: '/',
                    httpOnly: true,
                    maxAge: 60 * 60 * 24,
                },
            },
            {
                name: 'test-secure',
                options: {
                    path: '/',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24,
                },
            },
            {
                name: 'test-samesite-lax',
                options: {
                    path: '/',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax' as const,
                    maxAge: 60 * 60 * 24,
                },
            },
            {
                name: 'test-production-config',
                options: {
                    path: '/',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax' as const,
                    maxAge: 60 * 60 * 24 * 30,
                },
            },
        ];

        const results = [];
        for (const config of configs) {
            try {
                cookieStore.set(
                    config.name,
                    `${sessionToken}-${config.name}`,
                    config.options
                );
                console.log(
                    `[PROD-AUTH-TEST] Set cookie ${config.name} successfully`
                );
                results.push({
                    name: config.name,
                    status: 'success',
                    options: config.options,
                });
            } catch (error: any) {
                console.error(
                    `[PROD-AUTH-TEST] Failed to set cookie ${config.name}:`,
                    error
                );
                results.push({
                    name: config.name,
                    status: 'failed',
                    error: error.message,
                });
            }
        }

        // Verify cookies were set
        const verification = [];
        for (const config of configs) {
            const cookie = cookieStore.get(config.name);
            verification.push({
                name: config.name,
                found: !!cookie,
                valueLength: cookie?.value?.length || 0,
            });
        }

        return NextResponse.json({
            success: true,
            sessionToken,
            environment: process.env.NODE_ENV,
            host: request.headers.get('host'),
            protocol: request.headers.get('x-forwarded-proto') || 'http',
            cookieResults: results,
            verification,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('[PROD-AUTH-TEST] Error:', error);
        return NextResponse.json(
            {
                error: 'Production auth test failed',
                details: error?.message,
                stack:
                    process.env.NODE_ENV === 'development'
                        ? error?.stack
                        : undefined,
            },
            { status: 500 }
        );
    }
}
