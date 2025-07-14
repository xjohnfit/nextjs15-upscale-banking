import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logoutAccount } from '@/lib/actions/user.actions';

export async function POST(request: NextRequest) {
    try {
        // Call the logout function to clear Appwrite session
        await logoutAccount();

        // Also manually clear the cookie to be sure
        const cookieStore = await cookies();
        cookieStore.delete('appwrite-session');

        return NextResponse.json(
            { success: true, message: 'Logged out successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        // Even if logout fails, clear the cookie
        try {
            const cookieStore = await cookies();
            cookieStore.delete('appwrite-session');
        } catch (cookieError) {
            // Failed to clear cookie
        }

        return NextResponse.json(
            { success: true, message: 'Session cleared' },
            { status: 200 }
        );
    }
}
