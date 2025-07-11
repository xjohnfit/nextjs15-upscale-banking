import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        console.log('Cookie test endpoint called');

        // Try to set a simple test cookie
        const cookieStore = await cookies();
        cookieStore.set('test-cookie', 'test-value', {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: false, // Don't use secure for HTTP connections
            maxAge: 60 * 60, // 1 hour
        });

        console.log('Test cookie set successfully');

        return NextResponse.json({
            success: true,
            message: 'Test cookie set',
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Cookie test failed:', error);
        return NextResponse.json(
            { error: 'Cookie test failed', details: error?.message },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const testCookie = cookieStore.get('test-cookie');
        const sessionCookie = cookieStore.get('appwrite-session');

        return NextResponse.json({
            testCookie: testCookie ? testCookie.value : 'not found',
            sessionCookie: sessionCookie ? 'present' : 'not found',
            allCookies: cookieStore
                .getAll()
                .map((c) => ({
                    name: c.name,
                    value: c.value ? 'present' : 'empty',
                })),
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Cookie check failed:', error);
        return NextResponse.json(
            { error: 'Cookie check failed', details: error?.message },
            { status: 500 }
        );
    }
}
