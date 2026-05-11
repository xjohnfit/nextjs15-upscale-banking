import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { isSameOrigin, jsonNoStore, SESSION_COOKIE_NAME } from '@/lib/security';

export async function POST(request: NextRequest) {
    if (!isSameOrigin(request)) {
        return jsonNoStore(
            { success: false, message: 'Forbidden origin' },
            403,
        );
    }

    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return jsonNoStore({ success: true, message: 'Session cleared' }, 200);
}
