import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLoggedInUser } from '@/lib/actions/user.actions';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('appwrite-session');

        const authStatus: any = {
            hasSessionCookie: !!session,
            sessionValue: session ? 'present' : 'missing',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            userAgent: request.headers.get('user-agent'),
        };

        // Try to get user info if session exists
        if (session) {
            try {
                const user = await getLoggedInUser();
                authStatus.userAuthenticated = !!user;
                authStatus.userId = user?.$id || user?.userId;
            } catch (error: any) {
                authStatus.userAuthenticated = false;
                authStatus.authError = error?.message || 'Unknown error';
            }
        } else {
            authStatus.userAuthenticated = false;
        }

        return NextResponse.json(authStatus, { status: 200 });
    } catch (error: any) {
        console.error('Auth status check failed:', error);
        return NextResponse.json(
            {
                error: 'Auth status check failed',
                details: error?.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}
