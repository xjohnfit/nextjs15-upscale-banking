import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        console.log('=== CLEARING SESSION VIA API ===');

        // Clear the session cookie
        const cookieStore = await cookies();
        cookieStore.delete('appwrite-session');

        console.log('Session cookie cleared via API');

        return NextResponse.json(
            { success: true, message: 'Session cleared successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Failed to clear session via API:', error);

        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Failed to clear session',
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('appwrite-session');

        return NextResponse.json({
            hasSession: !!session,
            sessionLength: session?.value?.length || 0,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || 'Failed to check session' },
            { status: 500 }
        );
    }
}
