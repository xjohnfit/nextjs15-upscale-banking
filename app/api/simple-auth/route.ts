import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        console.log('Simple auth test for:', email);

        // Simulate authentication (just check if email/password are provided)
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password required' },
                { status: 400 }
            );
        }

        // Try to set a simple auth cookie
        const cookieStore = await cookies();
        const sessionToken = `fake-session-${Date.now()}`;

        cookieStore.set('simple-auth-session', sessionToken, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        console.log('Simple auth cookie set:', sessionToken);

        return NextResponse.json({
            success: true,
            sessionToken,
            message: 'Simple auth successful',
        });
    } catch (error: any) {
        console.error('Simple auth error:', error);
        return NextResponse.json(
            { error: 'Simple auth failed', details: error?.message },
            { status: 500 }
        );
    }
}
