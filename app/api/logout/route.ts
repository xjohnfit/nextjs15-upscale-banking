import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { logoutAccount } from '@/lib/actions/user.actions';
import { isSameOrigin, jsonNoStore, SESSION_COOKIE_NAME } from '@/lib/security';

export async function POST(request: NextRequest) {
    if (!isSameOrigin(request)) {
        return jsonNoStore(
            { success: false, message: 'Forbidden origin' },
            403,
        );
    }

    try {
        await logoutAccount();

        const cookieStore = await cookies();
        cookieStore.delete(SESSION_COOKIE_NAME);

        return jsonNoStore(
            { success: true, message: 'Logged out successfully' },
            200,
        );
    } catch (error: any) {
        try {
            const cookieStore = await cookies();
            cookieStore.delete(SESSION_COOKIE_NAME);
        } catch (cookieError) {
            console.error('Unable to clear session cookie during logout');
        }

        return jsonNoStore({ success: true, message: 'Session cleared' }, 200);
    }
}
